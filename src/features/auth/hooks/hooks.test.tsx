import { act, renderHook, waitFor } from '@testing-library/react';
import { http as mock, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { on } from '@/shared/api/events';
import { sessionStore } from '@/shared/auth/session-store';
import { meFixture } from '@/test/fixtures/auth';
import { problem } from '@/test/msw/problem';
import { server } from '@/test/msw/server';
import { createTestQueryClient, createWrapper } from '@/test/render';
import { authKeys } from '../model/adapters';
import { useBootstrapSession } from './use-bootstrap-session';
import { useChangePassword } from './use-change-password';
import { useLogin } from './use-login';
import { useLogout } from './use-logout';
import { useRevokeSession } from './use-revoke-session';
import { useSessions } from './use-sessions';
import { useSetupPassword } from './use-setup-password';

const BASE = 'http://localhost/admin/v1';

function signedIn() {
  sessionStore.signIn({ user: meFixture.user, permissions: ['*'], csrfToken: 'old' });
}

describe('useLogin', () => {
  it('logs in, then loads /me for permissions and the csrf token', async () => {
    server.use(
      mock.post(`${BASE}/auth/login`, () =>
        HttpResponse.json({
          status: 'authenticated',
          user: meFixture.user,
          csrfToken: 'from-login',
        }),
      ),
      mock.get(`${BASE}/auth/me`, () => HttpResponse.json(meFixture)),
    );
    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    await act(() => result.current.mutateAsync({ email: 'a@b.c', password: 'secret' }));

    const s = sessionStore.get();
    expect(s.status).toBe('authenticated');
    expect(s.permissions).toEqual(meFixture.permissions);
    expect(s.csrfToken).toBe(meFixture.csrfToken);
  });
});

describe('useBootstrapSession', () => {
  it('signs in when /me succeeds', async () => {
    server.use(mock.get(`${BASE}/auth/me`, () => HttpResponse.json(meFixture)));
    renderHook(
      () => {
        useBootstrapSession();
      },
      { wrapper: createWrapper() },
    );
    await waitFor(() => {
      expect(sessionStore.get().status).toBe('authenticated');
    });
  });

  function bootstrapWith(respond: () => Response) {
    const hit = vi.fn();
    const expired = vi.fn();
    const off = on('session:expired', expired);
    server.use(
      mock.get(`${BASE}/auth/me`, () => {
        hit();
        return respond();
      }),
    );
    signedIn(); // non-anonymous start, so a transition is observable
    renderHook(
      () => {
        useBootstrapSession();
      },
      { wrapper: createWrapper() },
    );
    return { hit, expired, off };
  }

  it('goes anonymous on 401 without emitting session:expired', async () => {
    const { hit, expired, off } = bootstrapWith(() => problem(401, 'UNAUTHENTICATED'));
    await waitFor(() => {
      expect(sessionStore.get().status).toBe('anonymous');
    });
    off();
    expect(hit).toHaveBeenCalledTimes(1);
    expect(expired).not.toHaveBeenCalled();
  });

  it('goes anonymous on other errors', async () => {
    const { hit, off } = bootstrapWith(() => problem(500, 'INTERNAL'));
    await waitFor(() => {
      expect(sessionStore.get().status).toBe('anonymous');
    });
    off();
    expect(hit).toHaveBeenCalledTimes(1);
  });
});

describe('useChangePassword', () => {
  it('stores the rotated csrf token', async () => {
    signedIn();
    server.use(
      mock.post(`${BASE}/auth/password`, () => HttpResponse.json({ csrfToken: 'rotated' })),
    );
    const { result } = renderHook(() => useChangePassword(), { wrapper: createWrapper() });
    await act(() => result.current.mutateAsync({ currentPassword: 'a', newPassword: 'b' }));
    expect(sessionStore.get().csrfToken).toBe('rotated');
  });
});

describe('useSetupPassword', () => {
  it('posts token and new password', async () => {
    let body: unknown;
    server.use(
      mock.post(`${BASE}/auth/setup-password`, async ({ request }) => {
        body = await request.json();
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const { result } = renderHook(() => useSetupPassword(), { wrapper: createWrapper() });
    await act(() => result.current.mutateAsync({ token: 't', newPassword: 'pw' }));
    expect(body).toEqual({ token: 't', newPassword: 'pw' });
  });
});

describe('useLogout', () => {
  it('signs out and clears the cache', async () => {
    signedIn();
    const qc = createTestQueryClient();
    const clear = vi.spyOn(qc, 'clear');
    server.use(mock.post(`${BASE}/auth/logout`, () => new HttpResponse(null, { status: 204 })));
    const { result } = renderHook(() => useLogout(), { wrapper: createWrapper(qc) });
    await act(() => result.current.mutateAsync());
    expect(sessionStore.get().status).toBe('anonymous');
    expect(clear).toHaveBeenCalled();
  });

  it('still signs out when the request fails', async () => {
    signedIn();
    const qc = createTestQueryClient();
    const clear = vi.spyOn(qc, 'clear');
    server.use(mock.post(`${BASE}/auth/logout`, () => problem(500, 'INTERNAL')));
    const metas: unknown[] = [];
    qc.getMutationCache().subscribe((e) => {
      metas.push(e.mutation?.meta);
    });
    const { result } = renderHook(() => useLogout(), { wrapper: createWrapper(qc) });
    await act(() => result.current.mutateAsync().catch(() => undefined));
    expect(metas).toContainEqual({ handlesErrors: true });
    expect(sessionStore.get().status).toBe('anonymous');
    expect(clear).toHaveBeenCalled();
  });
});

describe('useSessions', () => {
  it('maps rows', async () => {
    server.use(
      mock.get(`${BASE}/auth/sessions`, () =>
        HttpResponse.json({
          items: [
            {
              id: 's1',
              ip: '1.1.1.1',
              userAgent: 'Mozilla/5.0 (X11; Linux x86_64; rv:127.0) Gecko/20100101 Firefox/127.0',
              createdAt: '2026-01-02T03:04:00Z',
              lastSeenAt: '2026-01-02T03:04:00Z',
              current: false,
            },
          ],
        }),
      ),
    );
    const { result } = renderHook(() => useSessions(), { wrapper: createWrapper() });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data?.[0]?.device).toBe('Firefox · Linux');
  });
});

describe('useRevokeSession', () => {
  it('signs out when the current session is revoked', async () => {
    signedIn();
    server.use(
      mock.delete(`${BASE}/auth/sessions/s1`, () => new HttpResponse(null, { status: 204 })),
    );
    const qc = createTestQueryClient();
    const clear = vi.spyOn(qc, 'clear');
    const { result } = renderHook(() => useRevokeSession(), { wrapper: createWrapper(qc) });
    await act(() => result.current.mutateAsync({ id: 's1', current: true }));
    expect(sessionStore.get().status).toBe('anonymous');
    expect(clear).toHaveBeenCalled();
  });

  it('invalidates the sessions list for another session and stays signed in', async () => {
    signedIn();
    const qc = createTestQueryClient();
    const invalidate = vi.spyOn(qc, 'invalidateQueries');
    server.use(
      mock.delete(`${BASE}/auth/sessions/s2`, () => new HttpResponse(null, { status: 204 })),
    );
    const { result } = renderHook(() => useRevokeSession(), { wrapper: createWrapper(qc) });
    await act(() => result.current.mutateAsync({ id: 's2', current: false }));
    expect(sessionStore.get().status).toBe('authenticated');
    expect(invalidate).toHaveBeenCalledWith({ queryKey: authKeys.sessions });
  });
});
