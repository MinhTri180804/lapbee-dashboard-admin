import { Outlet } from 'react-router';
import { useIdleWarning } from '../use-idle-warning';
import { Sidebar } from './Sidebar';
import styles from './Shell.module.css';

/** Authenticated frame: sidebar + routed page. */
export function Shell() {
  useIdleWarning();
  return (
    <div className={styles.shell}>
      <Sidebar />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
