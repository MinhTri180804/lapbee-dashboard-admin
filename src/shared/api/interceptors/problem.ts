import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import { sessionStore } from '@/shared/auth/session-store';
import { isProblem, toAppError } from '../errors';
import { emit } from '../events';
import { waitForReauth } from '../reauth-coordinator';
import { CSRF_HEADER, refreshCsrfToken } from './csrf';

/**
 * Response error interceptor (spec §4.4), in order:
 * 1. map the failure to an AppError;
 * 2. `403 CSRF_FAILED` (first time only, signed in with a token): refresh the token, resend
 *    once; with no session (e.g. on login) there is nothing to refresh, so it just rejects;
 * 3. `403 REAUTH_REQUIRED` (first time only): wait for the shared step-up prompt, resend once;
 *    a cancelled prompt rejects with `ReauthCancelledError`;
 * 4. `401 UNAUTHENTICATED`: emit `session:expired` unless `lbSkipSessionExpired`;
 * 5. reject with the AppError.
 */
function hasSession(): boolean {
  const { status, csrfToken } = sessionStore.get();
  return status === 'authenticated' && csrfToken !== null;
}

export function createErrorHandler(instance: AxiosInstance) {
  return async function handleResponseError(error: unknown): Promise<AxiosResponse> {
    // Aborted requests (e.g. TanStack Query cancellation) pass through untouched.
    if (axios.isCancel(error)) throw error;

    const appError = toAppError(error);
    const config = axios.isAxiosError(error) ? error.config : undefined;

    if (config && isProblem(appError, 'CSRF_FAILED') && !config.lbRetriedCsrf && hasSession()) {
      const token = await refreshCsrfToken(instance);
      config.lbRetriedCsrf = true;
      config.headers.set(CSRF_HEADER, token);
      return instance.request(config);
    }

    if (config && isProblem(appError, 'REAUTH_REQUIRED') && !config.lbRetriedReauth) {
      // Shared prompt; rejects with ReauthCancelledError when the user cancels.
      await waitForReauth();
      config.lbRetriedReauth = true;
      // The CSRF header is re-read from the store by the request interceptor.
      return instance.request(config);
    }

    if (
      isProblem(appError, 'UNAUTHENTICATED') &&
      appError.status === 401 &&
      !config?.lbSkipSessionExpired
    ) {
      emit('session:expired');
    }

    throw appError;
  };
}
