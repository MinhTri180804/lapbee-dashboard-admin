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

export function createHttp(baseURL = '/admin/v1'): AxiosInstance {
  const instance = axios.create({
    baseURL,
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
