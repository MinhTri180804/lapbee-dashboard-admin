import { useId, useState } from 'react';
import { Button, Dialog } from '@/shared/ui';
import { moveTargets, type FolderNode } from '../model/folder-tree';
import styles from './MoveDialog.module.css';

export type MoveDialogProps = {
  open: boolean;
  title: string;
  tree: FolderNode[];
  /** The folder being moved; `null` when moving images (they may go anywhere). */
  movingFolderId: string | null;
  /** Where the thing is now (marked, never hidden for images). */
  /** `undefined` marks nothing (the folder is not one place, e.g. "Tất cả ảnh"). */
  currentFolderId: string | null | undefined;
  onClose: () => void;
  onConfirm: (target: string | null) => void;
  /** A move is in flight: "Chuyển" is loading and off. */
  busy?: boolean;
};

type Option = { id: string | null; name: string; parents: string; level: number };

/** The valid destinations in tree order; a folder is listed when it, or a descendant, is valid. */
function optionsFor(tree: FolderNode[], valid: Set<string | null>): Option[] {
  const out: Option[] = [];
  if (valid.has(null)) out.push({ id: null, name: 'Gốc thư viện', parents: '', level: 0 });
  const walk = (nodes: FolderNode[], parents: string[]) => {
    for (const node of nodes) {
      if (valid.has(node.id)) {
        out.push({
          id: node.id,
          name: node.name,
          parents: parents.join(' / '),
          level: parents.length,
        });
      }
      walk(node.children, [...parents, node.name]);
    }
  };
  walk(tree, []);
  return out;
}

/** A tree of destinations with "Gốc thư viện" (P3-8). Also used to move folders. */
export function MoveDialog({
  open,
  title,
  tree,
  movingFolderId,
  currentFolderId,
  onClose,
  onConfirm,
  busy = false,
}: MoveDialogProps) {
  const name = useId();
  const [target, setTarget] = useState<{ id: string | null } | null>(null);
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    // A fresh choice every time the dialog opens.
    setWasOpen(open);
    setTarget(null);
  }

  const options = optionsFor(tree, moveTargets(tree, movingFolderId));

  return (
    <Dialog
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Huỷ
          </Button>
          <Button
            variant="primary"
            loading={busy}
            disabled={target === null || busy}
            onClick={() => {
              if (target) onConfirm(target.id);
            }}
          >
            Chuyển
          </Button>
        </>
      }
    >
      {open && (
        <div role="radiogroup" aria-label="Thư mục đích" className={styles.list}>
          {options.map((option) => (
            <label
              key={option.id ?? 'root'}
              className={styles.option}
              style={{
                paddingLeft: `calc(var(--space-4) * ${String(option.level)} + var(--space-2))`,
              }}
            >
              <input
                type="radio"
                name={name}
                checked={target !== null && target.id === option.id}
                onChange={() => {
                  setTarget({ id: option.id });
                }}
              />
              <span className={styles.name}>{option.name}</span>
              {option.parents && <span className={styles.path}>{option.parents}</span>}
              {currentFolderId !== undefined && option.id === currentFolderId && (
                <span className={styles.path}>Hiện tại</span>
              )}
            </label>
          ))}
        </div>
      )}
    </Dialog>
  );
}
