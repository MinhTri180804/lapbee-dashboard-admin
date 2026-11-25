import { Button } from '@/shared/ui';
import type { MediaDto } from '../model/adapters';
import { MediaCard } from './MediaCard';
import styles from './MediaGrid.module.css';

export type MediaGridProps = {
  items: MediaDto[];
  openId: string | null;
  onOpen: (id: string) => void;
  emptyText: string;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  checked: ReadonlySet<string>;
  onToggleCheck: (id: string) => void;
  checkable: boolean;
  /** The selection is full: unchecked boxes are off. */
  checkFull: boolean;
};

export function MediaGrid({
  items,
  openId,
  onOpen,
  emptyText,
  hasMore,
  loadingMore,
  onLoadMore,
  checked,
  onToggleCheck,
  checkable,
  checkFull,
}: MediaGridProps) {
  if (items.length === 0) return <p className={styles.empty}>{emptyText}</p>;
  return (
    <div className={styles.wrap}>
      <ul className={styles.grid}>
        {items.map((media) => (
          <li key={media.id}>
            <MediaCard
              media={media}
              selected={media.id === openId}
              checked={checked.has(media.id)}
              checkable={checkable}
              selecting={checked.size > 0}
              checkDisabled={checkFull}
              onOpen={() => {
                onOpen(media.id);
              }}
              onToggleCheck={() => {
                onToggleCheck(media.id);
              }}
            />
          </li>
        ))}
      </ul>
      {hasMore && (
        <Button variant="secondary" loading={loadingMore} onClick={onLoadMore}>
          Tải thêm
        </Button>
      )}
    </div>
  );
}
