import axios, { type AxiosInstance } from 'axios';
import { sessionStore } from '@/shared/auth/session-store';
import { attachCsrfToken } from './interceptors/csrf';
import { createErrorHandler } from './interceptors/problem';

declare module 'axios' {
  interface AxiosRequestConfig {
    /** Do not emit `session:expired` on `401 UNAUTHENTICATED` (the boot-time `/auth/me`). */
    lbSkipSessionExpired?: boolean;
    /** Set by the interceptor after one `CSRF_FAILED` retry. */
    lbRetriedCsrf?: boolean;
    /** Set by the interceptor after one `REAUTH_REQUIRED` retry. */
    lbRetriedReauth?: boolean;
  }
}

/** A request with no response after this long fails as a `NetworkError`. */
export const HTTP_TIMEOUT_MS = 15_000;

export function createHttp(baseURL = '/admin/v1'): AxiosInstance {
  const instance = axios.create({
    baseURL,
    timeout: HTTP_TIMEOUT_MS,
    withCredentials: true,
    headers: { Accept: 'application/json' },
  });
  instance.interceptors.request.use(attachCsrfToken);
  instance.interceptors.response.use((response) => {
    sessionStore.markActivity();
    return response;
  }, createErrorHandler(instance));
  return instance;
}

export const http: AxiosInstance = createHttp();
