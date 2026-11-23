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
import { CheckCircle2, Info, XCircle } from 'lucide-react';
import styles from './Toast.module.css';

export const TOAST_DURATION_MS = 2800;

export type ToastInput = { kind: 'success' | 'error' | 'info'; title: string; body?: string };
type ToastItem = ToastInput & { id: number };

type ToastApi = { show: (t: ToastInput) => void };

const ToastContext = createContext<ToastApi | null>(null);

const ICONS = { success: CheckCircle2, error: XCircle, info: Info } as const;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());

  const show = useCallback((t: ToastInput) => {
    const id = nextId.current++;
    setItems((prev) => [...prev, { ...t, id }]);
    const timer = setTimeout(() => {
      timers.current.delete(timer);
      setItems((prev) => prev.filter((i) => i.id !== id));
    }, TOAST_DURATION_MS);
    timers.current.add(timer);
  }, []);

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
          return (
            <div key={t.id} className={cx(styles.toast, styles[t.kind])}>
              <Icon size={18} className={styles.icon} aria-hidden="true" />
              <div>
                <p className={styles.title}>{t.title}</p>
                {t.body ? <p className={styles.body}>{t.body}</p> : null}
              </div>
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
