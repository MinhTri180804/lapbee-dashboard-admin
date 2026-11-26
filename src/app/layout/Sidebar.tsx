import { ArrowUpRight, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router';
import { usePostsTotal } from '@/features/posts';
import { useCan } from '@/shared/auth/permissions';
import { useSession } from '@/shared/auth/session-store';
import {
  applyTheme,
  getThemeStorage,
  persistTheme,
  readStoredTheme,
  resolveInitialTheme,
  type Theme,
} from '@/shared/theme/theme';
import { Wordmark } from '@/shared/ui';
import { visibleNav } from '../nav';
import { UserMenu } from './UserMenu';
import styles from './Sidebar.module.css';

/** The theme already applied by `public/theme-init.js`, else the stored or system one. */
function currentTheme(): Theme {
  const applied = document.documentElement.dataset.theme;
  if (applied === 'light' || applied === 'dark') return applied;
  const prefersDark =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  return resolveInitialTheme(readStoredTheme(getThemeStorage()), prefersDark);
}

function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(currentTheme);
  const next: Theme = theme === 'dark' ? 'light' : 'dark';
  const Icon = next === 'dark' ? Moon : Sun;

  function toggle() {
    applyTheme(next);
    persistTheme(next, getThemeStorage());
    setTheme(next);
  }

  return (
    <button type="button" className={styles.action} onClick={toggle}>
      <Icon size={18} className={styles.icon} aria-hidden="true" />
      {next === 'dark' ? 'Giao diện tối' : 'Giao diện sáng'}
    </button>
  );
}

/** P4-9: the post total next to "Bài đăng", asked for only with `post.read`. */
function PostsTotal() {
  const total = usePostsTotal(useCan('post.read'));
  return total === undefined ? null : <span className={styles.count}>{total}</span>;
}

export function Sidebar() {
  const { permissions } = useSession();
  const groups = visibleNav(permissions);
  const landingUrl = import.meta.env.VITE_LANDING_URL;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <Wordmark size={19} inverse />
        <span className={`lb-label ${styles.label ?? ''}`}>Quản trị website</span>
      </div>

      <nav className={styles.nav} aria-label="Điều hướng chính">
        {groups.map((g) => (
          <div key={g.group} className={styles.group}>
            <span className={`lb-label ${styles.groupLabel ?? ''}`}>{g.group}</span>
            <ul className={styles.list}>
              {g.items.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      [styles.link, isActive ? styles.active : ''].join(' ').trim()
                    }
                  >
                    <Icon size={18} className={styles.icon} aria-hidden="true" />
                    {label}
                    {to === '/posts' && <PostsTotal />}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className={styles.footer}>
        {landingUrl ? (
          <a href={landingUrl} target="_blank" rel="noopener noreferrer" className={styles.action}>
            <ArrowUpRight size={18} className={styles.icon} aria-hidden="true" />
            Xem website
          </a>
        ) : null}
        <ThemeToggle />
        <UserMenu />
      </div>
    </aside>
  );
}
