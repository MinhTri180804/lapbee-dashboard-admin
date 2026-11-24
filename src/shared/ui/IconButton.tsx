import type { ButtonHTMLAttributes, Ref } from 'react';
import type { LucideIcon } from 'lucide-react';
import styles from './IconButton.module.css';

export type IconButtonProps = {
  icon: LucideIcon;
  /** Accessible name, required since there is no visible text. */
  label: string;
  size?: 'sm' | 'md';
  ref?: Ref<HTMLButtonElement>;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'>;

export function IconButton({
  icon: Icon,
  label,
  size = 'md',
  className,
  type = 'button',
  ref,
  ...rest
}: IconButtonProps) {
  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={[styles.btn, styles[size], className].filter(Boolean).join(' ')}
    >
      <Icon size={size === 'sm' ? 16 : 18} aria-hidden="true" />
    </button>
  );
}
