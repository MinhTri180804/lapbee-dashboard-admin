import { LogOut, UserRound } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useLogout } from '@/features/auth';
import { useSession } from '@/shared/auth/session-store';
import styles from './UserMenu.module.css';

/** First letters of the first and last words: "Nguyễn Minh Khoa" → "NK". */
function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words[0];
  const last = words.length > 1 ? words[words.length - 1] : undefined;
  const letters = [first, last].map((w) => (w ? (Array.from(w)[0] ?? '') : '')).join('');
  return letters.toLocaleUpperCase('vi') || '?';
}

export function UserMenu() {
  const { user, permissions } = useSession();
  const logout = useLogout();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    rootRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  if (!user) return null;

  const sub = permissions.includes('*') ? 'Super admin' : user.email;

  function signOut() {
    setOpen(false);
    // The hook signs out locally whatever the server says; always leave for /login.
    void logout
      .mutateAsync()
      .catch(() => undefined)
      .finally(() => {
        void navigate('/login', { replace: true });
      });
  }

  return (
    <div ref={rootRef} className={styles.root}>
      {open ? (
        <div id={menuId} role="menu" aria-label="Tài khoản" className={styles.menu}>
          <Link
            to="/account"
            role="menuitem"
            className={styles.item}
            onClick={() => {
              setOpen(false);
            }}
          >
            <UserRound size={16} aria-hidden="true" />
            Tài khoản
          </Link>
          <button
            type="button"
            role="menuitem"
            className={styles.item}
            onClick={signOut}
            disabled={logout.isPending}
          >
            <LogOut size={16} aria-hidden="true" />
            Đăng xuất
          </button>
        </div>
      ) : null}
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => {
          setOpen((v) => !v);
        }}
      >
        <span className={styles.avatar} aria-hidden="true">
          {initials(user.name)}
        </span>
        <span className={styles.who}>
          <span className={styles.name}>{user.name}</span>
          <span className={styles.sub}>{sub}</span>
        </span>
      </button>
    </div>
  );
}
