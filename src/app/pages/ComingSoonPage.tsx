import { PageHeader } from '@/shared/ui';
import styles from './pages.module.css';

/** Placeholder for screens built in later phases. */
export function ComingSoonPage({
  title = 'Đang xây dựng',
  standalone = false,
}: {
  title?: string;
  /** Rendered outside the shell (public routes): fill the viewport. */
  standalone?: boolean;
}) {
  return (
    <section className={[styles.page, standalone ? styles.standalone : ''].join(' ').trim()}>
      <PageHeader eyebrow="Sắp có" title={title} description="Màn này có ở giai đoạn sau." />
    </section>
  );
}
