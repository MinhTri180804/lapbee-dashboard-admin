import { useSession } from '@/shared/auth/session-store';
import { PageHeader } from '@/shared/ui';
import { ChangePasswordForm } from '../components/ChangePasswordForm';
import { SessionsTable } from '../components/SessionsTable';
import styles from './AccountPage.module.css';

export function AccountPage() {
  const { user, permissions } = useSession();
  const roleLabel = permissions.includes('*') ? 'Super admin' : null;
  const description = user
    ? [user.name, user.email, roleLabel].filter((p): p is string => p !== null).join(' · ')
    : '';

  return (
    <div>
      <PageHeader
        eyebrow="TÀI KHOẢN"
        title="Tài khoản của bạn"
        {...(description ? { description } : {})}
      />
      <section className={styles.section} aria-labelledby="account-password">
        <div className={styles.note}>
          <h2 id="account-password" className={styles.heading}>
            Đổi mật khẩu
          </h2>
          <p className={styles.hint}>Đổi xong, các phiên khác bị đăng xuất.</p>
        </div>
        <ChangePasswordForm />
      </section>
      <section className={styles.section} aria-labelledby="account-sessions">
        <div className={styles.note}>
          <h2 id="account-sessions" className={styles.heading}>
            Phiên đăng nhập
          </h2>
        </div>
        <div className={styles.content}>
          <SessionsTable />
        </div>
      </section>
    </div>
  );
}
