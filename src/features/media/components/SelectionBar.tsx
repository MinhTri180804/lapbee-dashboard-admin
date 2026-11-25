import { Button } from '@/shared/ui';
import styles from './SelectionBar.module.css';

export const MAX_SELECTION = 100;
const NO_MOVE = 'Bạn không có quyền chuyển ảnh';

export type SelectionBarProps = {
  count: number;
  canMove: boolean;
  onMove: () => void;
  onClear: () => void;
};

/** Shown while images are checked (P3-5). */
export function SelectionBar({ count, canMove, onMove, onClear }: SelectionBarProps) {
  return (
    <div className={styles.bar} role="region" aria-label="Ảnh đã chọn">
      <span className={styles.count} aria-live="polite">
        {count} ảnh đã chọn
      </span>
      {count >= MAX_SELECTION && (
        <span className={styles.limit}>Chọn tối đa {MAX_SELECTION} ảnh một lần.</span>
      )}
      <div className={styles.actions}>
        <Button
          variant="secondary"
          size="sm"
          disabled={!canMove}
          title={canMove ? undefined : NO_MOVE}
          onClick={onMove}
        >
          Chuyển tới…
        </Button>
        <Button variant="ghost" size="sm" onClick={onClear}>
          Bỏ chọn
        </Button>
      </div>
    </div>
  );
}
