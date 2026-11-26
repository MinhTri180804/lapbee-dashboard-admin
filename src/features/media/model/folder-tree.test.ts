import { describe, expect, it } from 'vitest';
import { FOLDER, folderFixtures } from '@/test/fixtures/media';
import { buildFolderTree, findFolder, folderPath, moveTargets } from './folder-tree';

const tree = buildFolderTree(folderFixtures);

describe('buildFolderTree', () => {
  it('nests folders and keeps the server order', () => {
    expect(tree.map((n) => n.name)).toEqual(['Bài đăng', 'Dịch vụ', 'Hành trình', 'Đội ngũ']);
    const journey = findFolder(tree, FOLDER.journey);
    expect(journey?.children.map((n) => n.name)).toEqual(['2024']);
    expect(findFolder(tree, FOLDER.y2024)?.children.map((n) => n.name)).toEqual(['Phòng sạch']);
  });

  it('keeps the direct count and adds descendants into total', () => {
    const at = (id: string) => {
      const n = findFolder(tree, id);
      return [n?.mediaCount, n?.total];
    };
    expect(at(FOLDER.team)).toEqual([6, 6]);
    expect(at(FOLDER.journey)).toEqual([7, 12]);
    expect(at(FOLDER.y2024)).toEqual([2, 5]);
    expect(at(FOLDER.cleanRoom)).toEqual([3, 3]);
    expect(at(FOLDER.posts)).toEqual([3, 6]);
    expect(at(FOLDER.guides)).toEqual([2, 2]);
    expect(at(FOLDER.promos)).toEqual([1, 1]);
    expect(at(FOLDER.services)).toEqual([0, 0]);
  });

  it('computes height as the number of levels of the subtree', () => {
    expect(findFolder(tree, FOLDER.journey)?.height).toBe(3);
    expect(findFolder(tree, FOLDER.y2024)?.height).toBe(2);
    expect(findFolder(tree, FOLDER.cleanRoom)?.height).toBe(1);
    expect(findFolder(tree, FOLDER.services)?.height).toBe(1);
  });

  it('attaches a folder with an unknown parent to the root', () => {
    const orphan = { ...folderFixtures[1]!, id: 'x', parentId: 'missing', name: 'Mồ côi' };
    const result = buildFolderTree([...folderFixtures, orphan]);
    expect(result.map((n) => n.name)).toContain('Mồ côi');
  });

  it('does not loop forever on a parent cycle', () => {
    const a = { ...folderFixtures[0]!, id: 'a', parentId: 'b', name: 'A' };
    const b = { ...folderFixtures[0]!, id: 'b', parentId: 'a', name: 'B' };
    expect(() => buildFolderTree([a, b])).not.toThrow();
  });
});

describe('folderPath', () => {
  it('goes from the root to the folder', () => {
    expect(folderPath(tree, FOLDER.cleanRoom).map((n) => n.name)).toEqual([
      'Hành trình',
      '2024',
      'Phòng sạch',
    ]);
    expect(folderPath(tree, 'nope')).toEqual([]);
  });
});

describe('moveTargets', () => {
  it('excludes self, subtree, too deep targets and the current parent for a folder', () => {
    const targets = moveTargets(tree, FOLDER.journey);
    expect(targets).toEqual(
      new Set([FOLDER.posts, FOLDER.services, FOLDER.team, FOLDER.guides, FOLDER.promos]),
    );
    expect(targets.has(null)).toBe(false);
  });

  it('allows the root for a nested folder, and drops its current parent', () => {
    const targets = moveTargets(tree, FOLDER.guides);
    expect(targets.has(null)).toBe(true);
    expect(targets.has(FOLDER.posts)).toBe(false);
    expect(targets.has(FOLDER.guides)).toBe(false);
    expect(targets.has(FOLDER.journey)).toBe(true);
  });

  it('allows every folder and the root for images', () => {
    const targets = moveTargets(tree, null);
    expect(targets.size).toBe(folderFixtures.length + 1);
    expect(targets.has(null)).toBe(true);
    expect(targets.has(FOLDER.cleanRoom)).toBe(true);
  });
});
