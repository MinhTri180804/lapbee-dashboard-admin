import type { ReactNode } from 'react';
import { cx } from './cx';
import styles from './Card.module.css';

export type CardProps = {
  as?: 'div' | 'button';
  interactive?: boolean;
  padding?: 0 | 16 | 28;
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
};

export function Card({
  as = 'div',
  interactive = false,
  padding = 16,
  className,
  children,
  onClick,
}: CardProps) {
  const cls = cx(
    styles.card,
    styles[`p${String(padding)}`],
    (interactive || as === 'button') && styles.interactive,
    className,
  );
  if (as === 'button') {
    return (
      <button type="button" className={cls} onClick={onClick}>
        {children}
      </button>
    );
  }
  return <div className={cls}>{children}</div>;
}
