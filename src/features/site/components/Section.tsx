import type { ReactNode } from 'react';
import styles from './Section.module.css';

export type SectionProps = {
  title: string;
  meta?: ReactNode;
  /** Right side of the heading row, e.g. an "add" button. */
  actions?: ReactNode;
  children?: ReactNode;
};

/** A titled block of the site page: ink rule, heading and mono label (prototype layout). */
export function Section({ title, meta, actions, children }: SectionProps) {
  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>{title}</h3>
          {meta ? <span className="lb-label">{meta}</span> : null}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

export type FieldProps = {
  children: ReactNode;
  /** Shown under the control (e.g. a CharCount). */
  extra?: ReactNode;
  /** Server warning for this field, shown as a soft hint. */
  warning?: string | undefined;
  className?: string;
};

/** Wraps one control with its char count and server warning. */
export function Field({ children, extra, warning, className }: FieldProps) {
  return (
    <div data-field="" className={[styles.field, className].filter(Boolean).join(' ')}>
      {children}
      {extra || warning ? (
        <div className={styles.extra}>
          {warning ? <p className={styles.warning}>{warning}</p> : <span />}
          {extra}
        </div>
      ) : null}
    </div>
  );
}

/** `error` prop for a field, omitted when there is none (exactOptionalPropertyTypes). */
export function fieldError(message: string | undefined): { error?: string } {
  return message ? { error: message } : {};
}
