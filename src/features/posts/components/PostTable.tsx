import type { ReactNode } from 'react';
import { formatDate } from '@/shared/lib/format-date';
import { Badge } from '@/shared/ui';
import { STATUS_LABEL, type PostListItem } from '../model/adapters';
import styles from './PostTable.module.css';

export type PostTableProps = {
  posts: PostListItem[];
  /** Shown in place of the rows when there are none (text and, past the last page, a button). */
  empty: ReactNode;
};

/** P4-5: four columns, no SEO (D4). Rows open nothing yet (P4-6, wired in 4b). */
export function PostTable({ posts, empty }: PostTableProps) {
  return (
    <div className={styles.wrap}>
      <table className={styles.table} aria-label="Danh sách bài viết">
        <thead>
          <tr>
            <th scope="col" className={styles.th}>
              Bài viết
            </th>
            <th scope="col" className={styles.th}>
              Chuyên mục
            </th>
            <th scope="col" className={styles.th}>
              Trạng thái
            </th>
            <th scope="col" className={styles.th}>
              Ngày
            </th>
          </tr>
        </thead>
        <tbody>
          {posts.length === 0 ? (
            <tr>
              <td colSpan={4} className={styles.empty}>
                {empty}
              </td>
            </tr>
          ) : (
            posts.map((post) => (
              <tr key={post.id} className={styles.row}>
                <td className={styles.td}>
                  <div className={styles.post}>
                    <span className={styles.title}>
                      {post.title.trim() || 'Bài chưa có tiêu đề'}
                    </span>
                    {post.effectiveExcerpt ? (
                      <span className={styles.excerpt}>{post.effectiveExcerpt}</span>
                    ) : null}
                  </div>
                </td>
                <td className={styles.td}>
                  <Badge>{post.category?.name ?? 'Chưa có chuyên mục'}</Badge>
                </td>
                <td className={styles.td}>
                  <Badge tone={post.status === 'published' ? 'success' : 'neutral'}>
                    <span className={styles.dot} aria-hidden="true" />
                    {STATUS_LABEL[post.status]}
                  </Badge>
                </td>
                <td className={`${styles.td ?? ''} ${styles.date ?? ''}`}>
                  {post.date ? formatDate(post.date) : '—'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
