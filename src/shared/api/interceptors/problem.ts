import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import { isProblem, toAppError } from '../errors';
import { emit } from '../events';
import { CSRF_HEADER, refreshCsrfToken } from './csrf';

/**
 * Response error interceptor (spec §4.4), in order:
 * 1. map the failure to an AppError;
 * 2. `403 CSRF_FAILED` (first time only): refresh the token, resend once;
 * 3. (Task 6) `403 REAUTH_REQUIRED`;
 * 4. `401 UNAUTHENTICATED`: emit `session:expired` unless `lbSkipSessionExpired`;
 * 5. reject with the AppError.
 */
export function createErrorHandler(instance: AxiosInstance) {
  return async function handleResponseError(error: unknown): Promise<AxiosResponse> {
    // Aborted requests (e.g. TanStack Query cancellation) pass through untouched.
    if (axios.isCancel(error)) throw error;

    const appError = toAppError(error);
    const config = axios.isAxiosError(error) ? error.config : undefined;

    if (config && isProblem(appError, 'CSRF_FAILED') && !config.lbRetriedCsrf) {
      const token = await refreshCsrfToken(instance);
      config.lbRetriedCsrf = true;
      config.headers.set(CSRF_HEADER, token);
      return instance.request(config);
    }

    // ── Task 6: REAUTH_REQUIRED branch goes here ──────────────────────────────
    // if (config && isProblem(appError, 'REAUTH_REQUIRED') && !config.lbRetriedReauth) { … }
    // ──────────────────────────────────────────────────────────────────────────

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
