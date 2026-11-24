import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { sessionStore } from '@/shared/auth/session-store';
import type { Res } from '../types';

export const CSRF_HEADER = 'X-CSRF-Token';

const unsafeMethods = new Set(['post', 'put', 'patch', 'delete']);

/** Request interceptor: attach the session's CSRF token to state-changing requests. */
export function attachCsrfToken(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  const token = sessionStore.get().csrfToken;
  const method = (config.method ?? 'get').toLowerCase();
  if (token && unsafeMethods.has(method)) config.headers.set(CSRF_HEADER, token);
  return config;
}

let inflight: Promise<string> | null = null;

/**
 * Fetch a fresh CSRF token via `GET /auth/me` and store it. Concurrent callers share one
 * request (single-flight). Only the token is updated; user and permissions are left alone.
 */
export function refreshCsrfToken(instance: AxiosInstance): Promise<string> {
  inflight ??= instance
    // `lbRetriedCsrf`: a `CSRF_FAILED` on the refresh itself must not await this same
    // in-flight promise (it would never settle); it rejects instead.
    .get<Res<'/admin/v1/auth/me', 'get', 200>>('/auth/me', { lbRetriedCsrf: true })
    .then(({ data }) => {
      sessionStore.setCsrfToken(data.csrfToken);
      return data.csrfToken;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}
