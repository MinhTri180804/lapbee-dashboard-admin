import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { isProblem, ReauthCancelledError } from '@/shared/api/errors';
import { applyProblemToForm } from '@/shared/form/apply-problem-to-form';
import { messageFor } from '@/shared/form/error-messages';
import { Button, PasswordField, useToast } from '@/shared/ui';
import { useChangePassword } from '../hooks/use-change-password';
import { authKeys } from '../model/adapters';
import { fieldError } from './AuthCard';
import styles from './ChangePasswordForm.module.css';

const REQUIRED = 'Không được để trống.';
const schema = z
  .object({
    currentPassword: z.string().min(1, REQUIRED),
    newPassword: z
      .string()
      .min(1, REQUIRED)
      .refine((v) => v === '' || (v.length >= 12 && v.length <= 128), 'Mật khẩu cần 12–128 ký tự.'),
    confirm: z.string().min(1, REQUIRED),
  })
  .refine((v) => v.confirm === '' || v.confirm === v.newPassword, {
    path: ['confirm'],
    message: 'Mật khẩu nhập lại không khớp.',
  });
type ChangePasswordValues = z.infer<typeof schema>;
const FIELDS = ['currentPassword', 'newPassword'] as const;

export function ChangePasswordForm() {
  const changePassword = useChangePassword();
  const queryClient = useQueryClient();
  const toast = useToast();
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: '', newPassword: '', confirm: '' },
  });

  const onSubmit = handleSubmit(({ currentPassword, newPassword }) => {
    clearErrors('root.server');
    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          reset();
          toast.show({
            kind: 'success',
            title: 'Đã đổi mật khẩu. Các phiên khác đã bị đăng xuất.',
          });
          void queryClient.invalidateQueries({ queryKey: authKeys.sessions });
        },
        onError: (error) => {
          if (isProblem(error, 'INVALID_CREDENTIALS')) {
            setError('currentPassword', {
              type: 'server',
              message: 'Mật khẩu hiện tại không đúng.',
            });
          } else if (
            isProblem(error, 'VALIDATION_FAILED') ||
            error instanceof ReauthCancelledError
          ) {
            // A cancelled step-up is not an error: the helper treats it as handled, sets nothing.
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
    <form className={styles.form} onSubmit={(e) => void onSubmit(e)} noValidate>
      <PasswordField
        label="Mật khẩu hiện tại"
        autoComplete="current-password"
        {...fieldError(errors.currentPassword?.message)}
        {...register('currentPassword')}
      />
      <PasswordField
        label="Mật khẩu mới"
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
      <div className={styles.actions}>
        <Button type="submit" variant="primary" loading={changePassword.isPending}>
          Đổi mật khẩu
        </Button>
      </div>
    </form>
  );
}
