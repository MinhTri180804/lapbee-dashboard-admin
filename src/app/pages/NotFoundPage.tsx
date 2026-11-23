import { Link } from 'react-router';
import { PageHeader } from '@/shared/ui';
import styles from './pages.module.css';

export function NotFoundPage() {
  return (
    <section className={styles.page}>
      <PageHeader
        eyebrow="404"
        title="Không tìm thấy trang"
        description="Đường dẫn không tồn tại hoặc đã được đổi."
      />
      <Link to="/" className={styles.link}>
        Về trang đầu
      </Link>
    </section>
  );
}
