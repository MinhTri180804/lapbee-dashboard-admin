import { useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { cx } from './cx';
import styles from './TextField.module.css';
import own from './Select.module.css';

export type SelectProps = {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  hint?: string;
  id?: string;
  className?: string;
};

export function Select({
  label,
  options,
  value,
  onChange,
  disabled,
  hint,
  id,
  className,
}: SelectProps) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const hintId = `${selectId}-hint`;
  return (
    <div className={cx(styles.field, className)}>
      <label htmlFor={selectId} className={styles.label}>
        {label}
      </label>
      <div className={styles.control}>
        <select
          id={selectId}
          className={cx(styles.input, own.select)}
          value={value}
          disabled={disabled}
          aria-describedby={hint ? hintId : undefined}
          onChange={(e) => {
            onChange(e.target.value);
          }}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown size={16} aria-hidden="true" className={own.chevron} />
      </div>
      {hint ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
