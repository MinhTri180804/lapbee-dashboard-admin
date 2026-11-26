import type { PostList } from '../model/adapters';
import styles from './PostStats.module.css';

/** P4-4: three counts over every post (not the filter). */
export function PostStats({ counts }: { counts: PostList['counts'] | undefined }) {
  const published = counts?.byStatus.published;
  const draft = counts?.byStatus.draft;
  const stats = [
    { label: 'Đã xuất bản', value: published },
    { label: 'Bản nháp', value: draft },
    {
      label: 'Tổng số bài',
      value: published === undefined || draft === undefined ? undefined : published + draft,
    },
  ];
  return (
    <dl className={styles.stats}>
      {stats.map((s) => (
        <div key={s.label} className={styles.stat}>
          <dt className={styles.label}>{s.label}</dt>
          <dd className={styles.value}>{s.value ?? '—'}</dd>
        </div>
      ))}
    </dl>
  );
}
