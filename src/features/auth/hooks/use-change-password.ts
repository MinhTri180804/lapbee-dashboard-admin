import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { sessionStore } from '@/shared/auth/session-store';
import { authRepo, type ChangePasswordBody, type ChangePasswordResult } from '../api/repo';

/** The server rotates the CSRF token on password change; keep the store in sync. */
export function useChangePassword(): UseMutationResult<
  ChangePasswordResult,
  Error,
  ChangePasswordBody
> {
  return useMutation({
    meta: { handlesErrors: true },
    mutationFn: (body: ChangePasswordBody) => authRepo.changePassword(body),
    onSuccess: (res) => {
      sessionStore.setCsrfToken(res.csrfToken);
    },
  });
}
