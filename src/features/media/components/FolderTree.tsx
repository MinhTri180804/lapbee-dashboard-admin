import { ChevronDown, ChevronRight, Folder } from 'lucide-react';
import { useState } from 'react';
import { cx } from '@/shared/ui/cx';
import type { FolderNode } from '../model/folder-tree';
import styles from './FolderTree.module.css';

export type FolderTreeProps = {
  tree: FolderNode[];
  selected: string | null;
  onSelect: (id: string | null) => void;
  /** Denser rows without counts, for pickers. */
  compact?: boolean;
};

/** Folders open by default; a toggle closes one (and hides its subtree). */
export function FolderTree({ tree, selected, onSelect, compact = false }: FolderTreeProps) {
  const [closed, setClosed] = useState<ReadonlySet<string>>(() => new Set());

  const toggle = (id: string) => {
    setClosed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderNodes = (nodes: FolderNode[], level: number) => (
    <ul className={styles.list}>
      {nodes.map((node) => {
        const hasChildren = node.children.length > 0;
        const open = hasChildren && !closed.has(node.id);
        const Chevron = open ? ChevronDown : ChevronRight;
        return (
          <li key={node.id}>
            <div
              className={cx(styles.row, compact && styles.compact)}
              style={{ paddingLeft: `calc(var(--space-4) * ${String(level)})` }}
            >
              {hasChildren ? (
                <button
                  type="button"
                  className={styles.toggle}
                  aria-expanded={open}
                  aria-label={`${open ? 'Thu gọn' : 'Mở'} ${node.name}`}
                  onClick={() => {
                    toggle(node.id);
                  }}
                >
                  <Chevron size={14} aria-hidden="true" />
                </button>
              ) : (
                <span className={styles.toggle} aria-hidden="true" />
              )}
              <button
                type="button"
                className={styles.item}
                aria-current={node.id === selected || undefined}
                onClick={() => {
                  onSelect(node.id);
                }}
              >
                <Folder size={16} aria-hidden="true" className={styles.icon} />
                <span className={styles.name}>{node.name}</span>{' '}
                {!compact && <span className={styles.count}>{node.total}</span>}
              </button>
            </div>
            {open && renderNodes(node.children, level + 1)}
          </li>
        );
      })}
    </ul>
  );

  return renderNodes(tree, 0);
}
