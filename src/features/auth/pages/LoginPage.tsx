import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Navigate, useSearchParams } from 'react-router';
import { z } from 'zod';
import { isProblem } from '@/shared/api/errors';
import { useSession } from '@/shared/auth/session-store';
import { applyProblemToForm } from '@/shared/form/apply-problem-to-form';
import { messageFor } from '@/shared/form/error-messages';
import { safeNext } from '@/shared/lib/safe-next';
import { Button, PasswordField, Spinner, TextField } from '@/shared/ui';
import { AuthCard, fieldError } from '../components/AuthCard';
import { useLogin } from '../hooks/use-login';
import styles from './auth-pages.module.css';

const REQUIRED = 'Không được để trống.';
const schema = z.object({
  email: z.string().trim().min(1, REQUIRED),
  password: z.string().min(1, REQUIRED),
});
type LoginForm = z.infer<typeof schema>;
const FIELDS = ['email', 'password'] as const;

export function LoginPage() {
  const { status } = useSession();
  const [params] = useSearchParams();
  const login = useLogin();
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  if (status === 'unknown') return <Spinner fullPage />;
  if (status === 'authenticated') return <Navigate to={safeNext(params.get('next'))} replace />;

  const onSubmit = handleSubmit((values) => {
    clearErrors('root.server');
    login.mutate(values, {
      onError: (error) => {
        if (isProblem(error, 'INVALID_CREDENTIALS')) {
          setError('root.server', { type: 'server', message: 'Email hoặc mật khẩu không đúng.' });
        } else if (isProblem(error, 'VALIDATION_FAILED')) {
          applyProblemToForm(error, setError, {}, FIELDS);
        } else {
          setError('root.server', { type: 'server', message: messageFor(error) });
        }
      },
    });
  });

  const serverError = errors.root?.server?.message;

  return (
    <AuthCard title="Đăng nhập">
      <form className={styles.form} onSubmit={(e) => void onSubmit(e)} noValidate>
        <TextField
          label="Email"
          type="email"
          autoComplete="username"
          {...fieldError(errors.email?.message)}
          {...register('email')}
        />
        <PasswordField
          label="Mật khẩu"
          autoComplete="current-password"
          {...fieldError(errors.password?.message)}
          {...register('password')}
        />
        {serverError ? (
          <p role="alert" className={styles.alert}>
            {serverError}
          </p>
        ) : null}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={login.isPending}
          className={styles.submit}
        >
          Đăng nhập
        </Button>
      </form>
      <p className={styles.helper}>Quên mật khẩu? Liên hệ quản trị viên để nhận link đặt lại.</p>
    </AuthCard>
  );
}
