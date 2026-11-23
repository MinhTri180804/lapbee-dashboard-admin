import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import { sessionStore } from '@/shared/auth/session-store';
import { authRepo } from '../api/repo';

/**
 * Keeps the session alive (spec D9 "Tiếp tục"): `GET /auth/me` counts as activity on the
 * server and, through the response interceptor, resets `lastActivityAt`. A 401 still goes
 * through the usual `session:expired` path; other failures get the global error toast.
 */
export function useKeepAlive(): () => void {
  const { mutate } = useMutation({
    mutationFn: () => authRepo.me(),
    onSuccess: (me) => {
      sessionStore.setCsrfToken(me.csrfToken);
    },
  });
  return useCallback(() => {
    mutate();
  }, [mutate]);
}
