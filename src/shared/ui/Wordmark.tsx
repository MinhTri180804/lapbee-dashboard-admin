import logoMark from '@/shared/ui/brand/logo-mark.png';
import styles from './Wordmark.module.css';

export type WordmarkProps = {
  size?: number;
  inverse?: boolean;
};

export function Wordmark({ size = 28, inverse = false }: WordmarkProps) {
  return (
    <span
      className={[styles.wordmark, inverse ? styles.inverse : ''].filter(Boolean).join(' ')}
      style={{ fontSize: size }}
    >
      <img src={logoMark} alt="" height={size} className={styles.mark} />
      <span className={styles.text}>
        LAP<strong className={styles.bold}>BEE</strong>
      </span>
    </span>
  );
}
