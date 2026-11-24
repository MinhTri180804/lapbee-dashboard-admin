import type { ReactNode } from 'react';
import { cx } from './cx';
import styles from './Card.module.css';

type CardBase = {
  padding?: 0 | 16 | 28;
  className?: string;
  children?: ReactNode;
};

export type CardProps =
  | (CardBase & { as?: 'div'; interactive?: never; onClick?: never })
  | (CardBase & {
      as: 'button';
      onClick: () => void;
      'aria-label'?: string;
      disabled?: boolean;
    });

export function Card(props: CardProps) {
  const { padding = 16, className, children } = props;
  const cls = cx(
    styles.card,
    styles[`p${String(padding)}`],
    props.as === 'button' && styles.interactive,
    className,
  );
  if (props.as === 'button') {
    return (
      <button
        type="button"
        className={cls}
        onClick={props.onClick}
        aria-label={props['aria-label']}
        disabled={props.disabled}
      >
        {children}
      </button>
    );
  }
  return <div className={cls}>{children}</div>;
}
