import { act, renderHook, waitFor } from '@testing-library/react';
import { http as mock, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createQueryClient } from '@/app/query-client';
import { on } from '@/shared/api/events';
import { categoriesFixture, categoryFixtures } from '@/test/fixtures/categories';
import { problem } from '@/test/msw/problem';
import { server } from '@/test/msw/server';
import { createWrapper } from '@/test/render';
import { categoryErrorMessage, categoryKeys } from '../model/adapters';
import { useCategories } from './use-categories';
import { useCreateCategory, useDeleteCategory, useUpdateCategory } from './use-category-mutations';

const BASE = 'http://localhost/admin/v1';

const offs: (() => void)[] = [];
afterEach(() => {
  offs.splice(0).forEach((off) => {
    off();
  });
});

describe('useCategories', () => {
  it('returns the categories in server (position) order', async () => {
    server.use(mock.get(`${BASE}/categories`, () => HttpResponse.json(categoriesFixture)));
    const { result } = renderHook(() => useCategories(), { wrapper: createWrapper() });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data?.map((c) => c.position)).toEqual([0, 1, 2]);
    expect(result.current.data?.map((c) => c.id)).toEqual(categoryFixtures.map((c) => c.id));
  });

  it('does not fetch when disabled', async () => {
    let calls = 0;
    server.use(
      mock.get(`${BASE}/categories`, () => {
        calls += 1;
        return HttpResponse.json(categoriesFixture);
      }),
    );
    renderHook(() => useCategories(false), { wrapper: createWrapper() });
    await new Promise((r) => setTimeout(r, 20));
    expect(calls).toBe(0);
  });
});

async function seededPostsClient() {
  const qc = createQueryClient();
  await qc.query({ queryKey: ['posts', 'list'], queryFn: () => Promise.resolve({ items: [] }) });
  return qc;
}

describe('category mutations', () => {
  it('useDeleteCategory sends ?version= and reloads categories and posts', async () => {
    const deletes: string[] = [];
    let listCalls = 0;
    server.use(
      mock.get(`${BASE}/categories`, () => {
        listCalls += 1;
        return HttpResponse.json(categoriesFixture);
      }),
      mock.delete(`${BASE}/categories/:id`, ({ request, params }) => {
        deletes.push(`${String(params.id)}?${new URL(request.url).searchParams.toString()}`);
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const { result } = renderHook(() => ({ list: useCategories(), del: useDeleteCategory() }), {
      wrapper: createWrapper(),
    });
    await waitFor(() => {
      expect(result.current.list.isSuccess).toBe(true);
    });
    await act(() => result.current.del.mutateAsync({ id: 'c1', version: 3 }));
    expect(deletes).toEqual(['c1?version=3']);
    await waitFor(() => {
      expect(listCalls).toBe(2);
    });
  });

  it('invalidates the posts queries on success', async () => {
    server.use(
      mock.delete(`${BASE}/categories/:id`, () => new HttpResponse(null, { status: 204 })),
    );
    const qc = createQueryClient();
    await qc.query({
      queryKey: ['posts', 'list'],
      queryFn: () => Promise.resolve({ items: [] }),
    });
    const { result } = renderHook(() => useDeleteCategory(), { wrapper: createWrapper(qc) });
    await act(() => result.current.mutateAsync({ id: 'c1', version: 1 }));
    expect(qc.getQueryState(['posts', 'list'])?.isInvalidated).toBe(true);
  });

  it('invalidates the posts queries on create', async () => {
    server.use(mock.post(`${BASE}/categories`, () => HttpResponse.json(categoryFixtures[0])));
    const qc = await seededPostsClient();
    const { result } = renderHook(() => useCreateCategory(), { wrapper: createWrapper(qc) });
    await act(() => result.current.mutateAsync({ name: 'Mới' }));
    expect(qc.getQueryState(['posts', 'list'])?.isInvalidated).toBe(true);
  });

  it('invalidates the posts queries on update', async () => {
    server.use(mock.patch(`${BASE}/categories/:id`, () => HttpResponse.json(categoryFixtures[1])));
    const qc = await seededPostsClient();
    const { result } = renderHook(() => useUpdateCategory(), { wrapper: createWrapper(qc) });
    await act(() => result.current.mutateAsync({ id: 'c2', body: { version: 1, position: 0 } }));
    expect(qc.getQueryState(['posts', 'list'])?.isInvalidated).toBe(true);
  });

  it('useUpdateCategory sends { version, position }', async () => {
    const bodies: unknown[] = [];
    server.use(
      mock.patch(`${BASE}/categories/:id`, async ({ request }) => {
        bodies.push(await request.json());
        return HttpResponse.json({ ...categoryFixtures[1], position: 0 });
      }),
    );
    const { result } = renderHook(() => useUpdateCategory(), { wrapper: createWrapper() });
    await act(() => result.current.mutateAsync({ id: 'c2', body: { version: 3, position: 0 } }));
    expect(bodies).toEqual([{ version: 3, position: 0 }]);
  });

  it('useCreateCategory posts the body and returns the category', async () => {
    const bodies: unknown[] = [];
    server.use(
      mock.post(`${BASE}/categories`, async ({ request }) => {
        bodies.push(await request.json());
        return HttpResponse.json(categoryFixtures[0], { status: 201 });
      }),
    );
    const { result } = renderHook(() => useCreateCategory(), { wrapper: createWrapper() });
    const created = await act(() => result.current.mutateAsync({ name: 'Hướng dẫn' }));
    expect(bodies).toEqual([{ name: 'Hướng dẫn' }]);
    expect(created.slug).toBe('huong-dan');
  });

  it('still emits conflict on VERSION_CONFLICT, without a toast', async () => {
    server.use(mock.patch(`${BASE}/categories/:id`, () => problem(409, 'VERSION_CONFLICT')));
    const conflict = vi.fn();
    const toast = vi.fn();
    offs.push(on('conflict', conflict), on('toast', toast));
    const { result } = renderHook(() => useUpdateCategory(), {
      wrapper: createWrapper(createQueryClient()),
    });
    await act(() =>
      result.current
        .mutateAsync({ id: 'c2', body: { version: 1, position: 0 } })
        .catch(() => undefined),
    );
    expect(conflict).toHaveBeenCalledWith({ invalidates: [categoryKeys.all] });
    expect(toast).not.toHaveBeenCalled();
  });
});

describe('categoryErrorMessage', () => {
  it('maps the known codes', () => {
    expect(categoryErrorMessage('CATEGORY_NAME_TAKEN')).toBe('Đã có chuyên mục cùng tên.');
    expect(categoryErrorMessage('SLUG_TAKEN')).toBe('Đường dẫn này đã được dùng.');
    expect(categoryErrorMessage('CATEGORY_NOT_EMPTY')).toBeNull();
    expect(categoryErrorMessage(undefined)).toBeNull();
  });
});
