import { cx } from './cx';
import type { ReactNode } from 'react';
import styles from './Badge.module.css';

export type BadgeProps = {
  tone?: 'neutral' | 'brand' | 'success' | 'danger' | 'info';
  children: ReactNode;
};

export function Badge({ tone = 'neutral', children }: BadgeProps) {
  return <span className={cx(styles.badge, styles[tone])}>{children}</span>;
}
