import { useEffect } from 'react';
import { sessionStore } from '@/shared/auth/session-store';
import { authRepo } from '../api/repo';

/**
 * Restores the session from the HttpOnly cookie on app start. Any failure (401 or otherwise)
 * leaves the user anonymous; `lbSkipSessionExpired` keeps the 401 from emitting `session:expired`.
 */
export function useBootstrapSession(): void {
  useEffect(() => {
    let cancelled = false;
    authRepo.me({ lbSkipSessionExpired: true }).then(
      (me) => {
        if (!cancelled) sessionStore.signIn(me);
      },
      () => {
        if (!cancelled) sessionStore.signOut();
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);
}
