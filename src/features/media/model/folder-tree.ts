import type { FolderDto } from '../api/repo';

export type FolderNode = {
  id: string;
  name: string;
  depth: number;
  parentId: string | null;
  version: number;
  /** Images directly inside this folder. */
  mediaCount: number;
  /** `mediaCount` plus every descendant's. */
  total: number;
  children: FolderNode[];
  /** Levels of the subtree; a leaf is 1. */
  height: number;
};

export const MAX_FOLDER_DEPTH = 5;

/** Builds the tree from the server's flat list, keeping its order (depth, then name). */
export function buildFolderTree(flat: FolderDto[]): FolderNode[] {
  const nodes = new Map<string, FolderNode>();
  for (const dto of flat) {
    nodes.set(dto.id, {
      id: dto.id,
      name: dto.name,
      depth: dto.depth,
      parentId: dto.parentId,
      version: dto.version,
      mediaCount: dto.mediaCount,
      total: dto.mediaCount,
      children: [],
      height: 1,
    });
  }

  const roots: FolderNode[] = [];
  for (const node of nodes.values()) {
    const parent =
      node.parentId && node.parentId !== node.id ? nodes.get(node.parentId) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }

  // Folders caught in a parent cycle are unreachable from any root: promote them.
  const reached = new Set<string>();
  const visit = (node: FolderNode): void => {
    if (reached.has(node.id)) return;
    reached.add(node.id);
    node.children.forEach(visit);
  };
  roots.forEach(visit);
  for (const node of nodes.values()) {
    if (reached.has(node.id)) continue;
    const parent = node.parentId ? nodes.get(node.parentId) : undefined;
    if (parent) parent.children = parent.children.filter((child) => child !== node);
    roots.push(node);
    visit(node);
  }

  const seen = new Set<string>();
  const settle = (node: FolderNode): void => {
    seen.add(node.id);
    let total = node.mediaCount;
    let height = 0;
    for (const child of node.children) {
      if (!seen.has(child.id)) settle(child);
      total += child.total;
      height = Math.max(height, child.height);
    }
    node.total = total;
    node.height = height + 1;
  };
  roots.forEach(settle);
  return roots;
}

export function findFolder(tree: FolderNode[], id: string): FolderNode | undefined {
  for (const node of tree) {
    if (node.id === id) return node;
    const found = findFolder(node.children, id);
    if (found) return found;
  }
  return undefined;
}

/** Folders from the root down to `id`; empty when `id` is unknown. */
export function folderPath(tree: FolderNode[], id: string): FolderNode[] {
  for (const node of tree) {
    if (node.id === id) return [node];
    const rest = folderPath(node.children, id);
    if (rest.length > 0) return [node, ...rest];
  }
  return [];
}

function collect(nodes: FolderNode[], into: FolderNode[]): FolderNode[] {
  for (const node of nodes) {
    into.push(node);
    collect(node.children, into);
  }
  return into;
}

/**
 * Valid destinations (`null` = library root). Images may go anywhere. A folder cannot go into
 * itself or its subtree, below the depth limit, or where it already is.
 */
export function moveTargets(tree: FolderNode[], movingId: string | null): Set<string | null> {
  const all = collect(tree, []);
  const targets = new Set<string | null>([null, ...all.map((node) => node.id)]);
  if (movingId === null) return targets;

  const moving = findFolder(tree, movingId);
  if (!moving) return targets;
  for (const node of collect([moving], [])) targets.delete(node.id);
  for (const node of all) {
    if (node.depth + moving.height > MAX_FOLDER_DEPTH) targets.delete(node.id);
  }
  targets.delete(moving.parentId);
  return targets;
}
