import { useId } from 'react';
import type { Ref, TextareaHTMLAttributes } from 'react';
import { cx } from './cx';
import styles from './TextField.module.css';
import own from './TextArea.module.css';

export type TextAreaProps = {
  label: string;
  hint?: string;
  error?: string;
  rows?: number;
  ref?: Ref<HTMLTextAreaElement>;
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

export function TextArea({
  label,
  hint,
  error,
  rows = 3,
  id,
  className,
  ref,
  ...rest
}: TextAreaProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const hintId = `${fieldId}-hint`;
  const errorId = `${fieldId}-error`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ');
  return (
    <div className={cx(styles.field, className)}>
      <label htmlFor={fieldId} className={styles.label}>
        {label}
      </label>
      <div className={cx(styles.control, own.control)} data-invalid={error ? 'true' : undefined}>
        <textarea
          {...rest}
          ref={ref}
          id={fieldId}
          rows={rows}
          className={cx(styles.input, own.input)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
        />
      </div>
      {error ? (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      ) : null}
      {hint ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
