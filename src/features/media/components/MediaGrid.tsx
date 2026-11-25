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
};

export function MediaGrid({
  items,
  openId,
  onOpen,
  emptyText,
  hasMore,
  loadingMore,
  onLoadMore,
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
              checked={false}
              checkable={false}
              onOpen={() => {
                onOpen(media.id);
              }}
              onToggleCheck={() => undefined}
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
