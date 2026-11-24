import { PageHeader } from '@/shared/ui';
import styles from './pages.module.css';

export function ForbiddenPage() {
  return (
    <section className={styles.page}>
      <PageHeader
        eyebrow="403"
        title="Không có quyền truy cập"
        description="Tài khoản của bạn không có quyền xem trang này."
      />
    </section>
  );
}
