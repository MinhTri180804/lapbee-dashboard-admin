import { Button } from '@/shared/ui';
import type { UploadItem } from '../hooks/use-upload-queue';
import styles from './UploadQueue.module.css';

export type UploadQueueProps = {
  items: UploadItem[];
  busy: boolean;
  onClose: () => void;
};

const STATUS: Record<Exclude<UploadItem['status'], 'error'>, string> = {
  queued: 'Đang chờ',
  uploading: 'Đang tải',
  done: 'Đã tải',
};

/**
 * The bar reads the item's status, not only its progress: the browser reports every byte sent
 * before the server has stored the image, so an upload still running stops just short of full.
 */
function barValue(item: UploadItem): number {
  if (item.status === 'done') return 1;
  if (item.status === 'uploading') return Math.min(item.progress, 0.95);
  return 0;
}

export function UploadQueue({ items, busy, onClose }: UploadQueueProps) {
  if (items.length === 0) return null;
  const finished = items.filter((i) => i.status === 'done' || i.status === 'error').length;
  const title = busy ? `Đang tải ${String(finished)}/${String(items.length)} ảnh` : 'Đã tải xong';
  return (
    <section className={styles.panel} aria-label="Danh sách tải lên">
      <header className={styles.head}>
        <h2 className={styles.title} aria-live="polite">
          {title}
        </h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Đóng
        </Button>
      </header>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.key} className={styles.row} data-status={item.status}>
            <div className={styles.line}>
              <span className={styles.name} title={item.name}>
                {item.name}
              </span>
              {item.status !== 'error' && (
                <span className={styles.status}>{STATUS[item.status]}</span>
              )}
            </div>
            {item.status === 'error' ? (
              <p className={styles.error}>{item.error}</p>
            ) : (
              <progress
                className={styles.bar}
                max={1}
                value={barValue(item)}
                aria-label={item.name}
              />
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
