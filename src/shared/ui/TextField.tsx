import { useId } from 'react';
import type { InputHTMLAttributes, ReactNode, Ref } from 'react';
import styles from './TextField.module.css';

export type TextFieldProps = {
  label: string;
  hint?: string;
  error?: string;
  /** Rendered inside the field, after the input (e.g. a visibility toggle). */
  trailing?: ReactNode;
  ref?: Ref<HTMLInputElement>;
} & InputHTMLAttributes<HTMLInputElement>;

export function TextField({
  label,
  hint,
  error,
  trailing,
  id,
  className,
  ref,
  ...rest
}: TextFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ');
  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <div className={styles.control} data-invalid={error ? 'true' : undefined}>
        <input
          {...rest}
          ref={ref}
          id={inputId}
          className={styles.input}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
        />
        {trailing}
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
