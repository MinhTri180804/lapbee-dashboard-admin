import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { sessionStore } from '@/shared/auth/session-store';
import { authRepo, type LoginBody } from '../api/repo';

/** Login does not return permissions, so `/auth/me` is fetched afterwards to complete the session. */
export function useLogin(): UseMutationResult<void, Error, LoginBody> {
  return useMutation({
    meta: { handlesErrors: true },
    mutationFn: async (body: LoginBody) => {
      const login = await authRepo.login(body);
      sessionStore.setCsrfToken(login.csrfToken);
      const me = await authRepo.me();
      sessionStore.signIn(me);
    },
  });
}
