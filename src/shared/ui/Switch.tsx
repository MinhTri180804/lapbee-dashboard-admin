import { cx } from './cx';
import styles from './Switch.module.css';

export type SwitchProps = {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  hideLabel?: boolean;
  disabled?: boolean;
  className?: string;
};

export function Switch({ checked, onChange, label, hideLabel, disabled, className }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={hideLabel ? label : undefined}
      disabled={disabled}
      className={cx(styles.root, className)}
      onClick={() => {
        onChange(!checked);
      }}
    >
      <span className={styles.track} data-on={checked ? 'true' : undefined} aria-hidden="true">
        <span className={styles.thumb} />
      </span>
      {hideLabel ? null : <span className={styles.label}>{label}</span>}
    </button>
  );
}
