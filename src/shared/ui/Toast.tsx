import { cx } from './cx';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { IconButton } from './IconButton';
import styles from './Toast.module.css';

export const TOAST_DURATION_MS = 2800;

export type ToastAction = { label: string; onClick(): void };

export type ToastInput = {
  kind: 'success' | 'error' | 'info';
  title: string;
  body?: string;
  /** A button in the toast. Running it also closes the toast. */
  action?: ToastAction;
  /**
   * Milliseconds before the toast closes itself; defaults to `TOAST_DURATION_MS`.
   * `null` makes it sticky: it stays until its action runs or the user presses "Đóng".
   */
  duration?: number | null;
};
type ToastItem = ToastInput & { id: number };

type ToastApi = { show: (t: ToastInput) => void };

const ToastContext = createContext<ToastApi | null>(null);

const ICONS = { success: CheckCircle2, error: XCircle, info: Info } as const;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const show = useCallback(
    (t: ToastInput) => {
      const id = nextId.current++;
      setItems((prev) => [...prev, { ...t, id }]);
      const duration = t.duration === undefined ? TOAST_DURATION_MS : t.duration;
      if (duration === null) return;
      const timer = setTimeout(() => {
        timers.current.delete(timer);
        dismiss(id);
      }, duration);
      timers.current.add(timer);
    },
    [dismiss],
  );

  useEffect(() => {
    const current = timers.current;
    return () => {
      current.forEach((timer) => {
        clearTimeout(timer);
      });
    };
  }, []);

  const api = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div role="status" aria-live="polite" className={styles.region}>
        {items.map((t) => {
          const Icon = ICONS[t.kind];
          const { action } = t;
          return (
            <div key={t.id} className={cx(styles.toast, styles[t.kind])}>
              <Icon size={18} className={styles.icon} aria-hidden="true" />
              <div className={styles.content}>
                <p className={styles.title}>{t.title}</p>
                {t.body ? <p className={styles.body}>{t.body}</p> : null}
                {action ? (
                  <button
                    type="button"
                    className={styles.action}
                    onClick={() => {
                      dismiss(t.id);
                      action.onClick();
                    }}
                  >
                    {action.label}
                  </button>
                ) : null}
              </div>
              {t.duration === null ? (
                <IconButton
                  icon={X}
                  label="Đóng"
                  size="sm"
                  className={styles.close}
                  onClick={() => {
                    dismiss(t.id);
                  }}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
