import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import styles from './Dialog.module.css';

export type DialogProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children?: ReactNode;
  footer?: ReactNode;
};

export function Dialog({ open, title, onClose, children, footer }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) {
      returnFocus.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      el.showModal();
    } else if (!open && el.open) {
      el.close();
      returnFocus.current?.focus();
      returnFocus.current = null;
    }
  }, [open]);

  // Restore focus if the dialog unmounts while open.
  useEffect(
    () => () => {
      returnFocus.current?.focus();
    },
    [],
  );

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby={titleId}
      onCancel={(e) => {
        // `open` prop stays the source of truth.
        e.preventDefault();
        onClose();
      }}
    >
      <div className={styles.panel}>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        <div className={styles.body}>{children}</div>
        {footer ? <div className={styles.footer}>{footer}</div> : null}
      </div>
    </dialog>
  );
}
