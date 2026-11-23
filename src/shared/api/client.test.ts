import { http as mock, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { sessionStore } from '@/shared/auth/session-store';
import { meFixture } from '@/test/fixtures/auth';
import { server } from '@/test/msw/server';
import { problem } from '@/test/msw/problem';
import { createHttp } from './client';
import { NetworkError, ProblemError } from './errors';
import { on } from './events';

const BASE = 'http://localhost/admin/v1';
const api = createHttp(BASE);

function listenSessionExpired() {
  const fn = vi.fn();
  const off = on('session:expired', fn);
  return { fn, off };
}

describe('http client', () => {
  it('gắn X-CSRF-Token cho POST/PATCH/DELETE, không gắn cho GET', async () => {
    const seen: Record<string, string | null> = {};
    server.use(
      mock.all(`${BASE}/things`, ({ request }) => {
        seen[request.method] = request.headers.get('X-CSRF-Token');
        return HttpResponse.json({ ok: true });
      }),
    );
    sessionStore.setCsrfToken('t1');

    await api.post('/things', {});
    await api.patch('/things', {});
    await api.delete('/things');
    await api.get('/things');

    expect(seen).toEqual({ POST: 't1', PATCH: 't1', DELETE: 't1', GET: null });
  });

  it('chuyển problem+json thành ProblemError có fieldErrors và extras', async () => {
    server.use(
      mock.delete(`${BASE}/categories/c1`, () =>
        problem(409, 'CATEGORY_NOT_EMPTY', {
          postCount: 3,
          errors: [{ path: 'id', message: 'Danh mục còn bài viết' }],
        }),
      ),
    );

    const error: unknown = await api.delete('/categories/c1').catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ProblemError);
    const p = error as ProblemError;
    expect(p.status).toBe(409);
    expect(p.code).toBe('CATEGORY_NOT_EMPTY');
    expect(p.detail).toBe('Problem CATEGORY_NOT_EMPTY');
    expect(p.fieldErrors).toEqual([{ path: 'id', message: 'Danh mục còn bài viết' }]);
    expect(p.extras.postCount).toBe(3);
    expect(p.extras).not.toHaveProperty('code');
  });

  it('không có response thì là NetworkError', async () => {
    server.use(mock.get(`${BASE}/things`, () => HttpResponse.error()));

    await expect(api.get('/things')).rejects.toBeInstanceOf(NetworkError);
  });

  it('401 UNAUTHENTICATED phát session:expired', async () => {
    server.use(mock.get(`${BASE}/posts`, () => problem(401, 'UNAUTHENTICATED')));
    const { fn, off } = listenSessionExpired();

    await expect(api.get('/posts')).rejects.toMatchObject({ code: 'UNAUTHENTICATED' });
    expect(fn).toHaveBeenCalledTimes(1);
    off();
  });

  it('401 INVALID_CREDENTIALS không phát session:expired', async () => {
    server.use(mock.post(`${BASE}/auth/login`, () => problem(401, 'INVALID_CREDENTIALS')));
    const { fn, off } = listenSessionExpired();

    await expect(api.post('/auth/login', {})).rejects.toMatchObject({
      code: 'INVALID_CREDENTIALS',
    });
    expect(fn).not.toHaveBeenCalled();
    off();
  });

  it('401 UNAUTHENTICATED với lbSkipSessionExpired không phát session:expired', async () => {
    server.use(mock.get(`${BASE}/auth/me`, () => problem(401, 'UNAUTHENTICATED')));
    const { fn, off } = listenSessionExpired();

    await expect(api.get('/auth/me', { lbSkipSessionExpired: true })).rejects.toBeInstanceOf(
      ProblemError,
    );
    expect(fn).not.toHaveBeenCalled();
    off();
  });

  it('CSRF_FAILED lấy token mới qua /auth/me rồi thử lại đúng một lần', async () => {
    const tokens: (string | null)[] = [];
    server.use(
      mock.get(`${BASE}/auth/me`, () => HttpResponse.json({ ...meFixture, csrfToken: 't2' })),
      mock.post(`${BASE}/posts`, ({ request }) => {
        tokens.push(request.headers.get('X-CSRF-Token'));
        return tokens.length === 1 ? problem(403, 'CSRF_FAILED') : HttpResponse.json({ id: 'p1' });
      }),
    );
    sessionStore.setCsrfToken('t1');

    const res = await api.post('/posts', {});

    expect(res.data).toEqual({ id: 'p1' });
    expect(tokens).toEqual(['t1', 't2']);
    expect(sessionStore.get().csrfToken).toBe('t2');
  });

  it('CSRF_FAILED lần hai thì ném ProblemError, chỉ gửi POST hai lần', async () => {
    let posts = 0;
    let mes = 0;
    server.use(
      mock.get(`${BASE}/auth/me`, () => {
        mes += 1;
        return HttpResponse.json({ ...meFixture, csrfToken: 't2' });
      }),
      mock.post(`${BASE}/posts`, () => {
        posts += 1;
        return problem(403, 'CSRF_FAILED');
      }),
    );

    await expect(api.post('/posts', {})).rejects.toMatchObject({ code: 'CSRF_FAILED' });
    expect(posts).toBe(2);
    expect(mes).toBe(1);
  });

  it('nhiều request cùng gặp CSRF_FAILED chỉ gọi /auth/me một lần', async () => {
    let mes = 0;
    const seen = new Map<string, number>();
    server.use(
      mock.get(`${BASE}/auth/me`, () => {
        mes += 1;
        return HttpResponse.json({ ...meFixture, csrfToken: 't2' });
      }),
      mock.post(`${BASE}/things/:id`, ({ request, params }) => {
        const id = String(params.id);
        seen.set(id, (seen.get(id) ?? 0) + 1);
        return request.headers.get('X-CSRF-Token') === 't2'
          ? HttpResponse.json({ id })
          : problem(403, 'CSRF_FAILED');
      }),
    );
    sessionStore.setCsrfToken('t1');

    await Promise.all([api.post('/things/a', {}), api.post('/things/b', {})]);

    expect(mes).toBe(1);
    expect(Object.fromEntries(seen)).toEqual({ a: 2, b: 2 });
  });

  it('request thành công cập nhật lastActivityAt', async () => {
    server.use(mock.get(`${BASE}/things`, () => HttpResponse.json([])));
    expect(sessionStore.get().lastActivityAt).toBeNull();
    const before = Date.now();

    await api.get('/things');

    expect(sessionStore.get().lastActivityAt).toBeGreaterThanOrEqual(before);
  });
});
