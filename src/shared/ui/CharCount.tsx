import { cx } from './cx';
import styles from './CharCount.module.css';

export type CharCountProps = {
  value: string;
  max: number;
  suffix?: string;
};

export function CharCount({ value, max, suffix }: CharCountProps) {
  const n = value.length;
  return (
    <span className={cx(styles.count, n > max && styles.over)}>
      {`${String(n)} / ${String(max)} ký tự${suffix ? ` · ${suffix}` : ''}`}
    </span>
  );
}
