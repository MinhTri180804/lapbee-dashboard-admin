import { Loader2 } from 'lucide-react';
import styles from './Spinner.module.css';

export type SpinnerProps = {
  size?: number;
  fullPage?: boolean;
};

export function Spinner({ size = 20, fullPage = false }: SpinnerProps) {
  const indicator = (
    <span role="status" aria-label="Đang tải" className={styles.spinner}>
      <Loader2 size={fullPage ? 32 : size} aria-hidden="true" />
    </span>
  );
  return fullPage ? <div className={styles.fullPage}>{indicator}</div> : indicator;
}
