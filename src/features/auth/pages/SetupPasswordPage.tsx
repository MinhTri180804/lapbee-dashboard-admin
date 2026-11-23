import { zodResolver } from '@hookform/resolvers/zod';
import { useLayoutEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router';
import { z } from 'zod';
import { isProblem } from '@/shared/api/errors';
import { applyProblemToForm } from '@/shared/form/apply-problem-to-form';
import { messageFor } from '@/shared/form/error-messages';
import { Button, PasswordField, useToast } from '@/shared/ui';
import { AuthCard, fieldError } from '../components/AuthCard';
import { useSetupPassword } from '../hooks/use-setup-password';
import styles from './auth-pages.module.css';

const REQUIRED = 'Không được để trống.';
const schema = z
  .object({
    newPassword: z
      .string()
      .min(1, REQUIRED)
      .min(12, 'Mật khẩu cần 12–128 ký tự.')
      .max(128, 'Mật khẩu cần 12–128 ký tự.'),
    confirm: z.string().min(1, REQUIRED),
  })
  .refine((v) => v.newPassword === v.confirm, {
    path: ['confirm'],
    message: 'Mật khẩu nhập lại không khớp.',
  });
type SetupForm = z.infer<typeof schema>;
const FIELDS = ['newPassword', 'confirm'] as const;
const EXPIRED = 'Link đã hết hạn hoặc đã dùng. Hãy xin quản trị viên link mới.';

function readToken(hash: string): string | null {
  return new URLSearchParams(hash.replace(/^#/, '')).get('token') || null;
}

export function SetupPasswordPage() {
  const { pathname, search, hash } = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const setup = useSetupPassword();
  // Kept in state only, so the token never has to live in the URL.
  const [token] = useState(() => readToken(hash));
  const [expired, setExpired] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<SetupForm>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: '', confirm: '' },
  });

  // Drop the token from the URL before paint, through the router so its state stays in sync.
  useLayoutEffect(() => {
    if (hash === '') return;
    void navigate({ pathname, search }, { replace: true });
  }, [hash, pathname, search, navigate]);

  if (token === null || expired) {
    return (
      <AuthCard title="Đặt mật khẩu">
        <p role="alert" className={styles.alert}>
          {EXPIRED}
        </p>
      </AuthCard>
    );
  }

  const onSubmit = handleSubmit((values) => {
    clearErrors('root.server');
    setup.mutate(
      { token, newPassword: values.newPassword },
      {
        onSuccess: () => {
          toast.show({ kind: 'success', title: 'Đã đặt mật khẩu' });
          void navigate('/login', { replace: true });
        },
        onError: (error) => {
          if (isProblem(error, 'INVALID_LINK')) {
            setExpired(true);
          } else if (isProblem(error, 'VALIDATION_FAILED')) {
            applyProblemToForm(error, setError, {}, FIELDS);
          } else {
            setError('root.server', { type: 'server', message: messageFor(error) });
          }
        },
      },
    );
  });

  const serverError = errors.root?.server?.message;

  return (
    <AuthCard title="Đặt mật khẩu">
      <form className={styles.form} onSubmit={(e) => void onSubmit(e)} noValidate>
        <PasswordField
          label="Mật khẩu mới"
          hint="12–128 ký tự"
          autoComplete="new-password"
          {...fieldError(errors.newPassword?.message)}
          {...register('newPassword')}
        />
        <PasswordField
          label="Nhập lại"
          autoComplete="new-password"
          {...fieldError(errors.confirm?.message)}
          {...register('confirm')}
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
          loading={setup.isPending}
          className={styles.submit}
        >
          Đặt mật khẩu
        </Button>
      </form>
    </AuthCard>
  );
}
