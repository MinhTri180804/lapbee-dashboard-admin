import { act, renderHook, waitFor } from '@testing-library/react';
import { http as mock, HttpResponse } from 'msw';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createQueryClient } from '@/app/query-client';
import { on } from '@/shared/api/events';
import { FOLDER, folderFixtures, mediaItem, mediaListFixture } from '@/test/fixtures/media';
import { problem } from '@/test/msw/problem';
import { server } from '@/test/msw/server';
import { createWrapper } from '@/test/render';
import { mediaKeys, type MediaListParams } from '../model/adapters';
import { useFolders } from './use-folders';
import { useDeleteMedia, useMoveMedia } from './use-media-mutations';
import { useMediaDetail } from './use-media-detail';
import { useMediaList } from './use-media-list';
import { useMediaTotal } from './use-media-total';
import { useUploadQueue } from './use-upload-queue';

const BASE = 'http://localhost/admin/v1';

const offs: (() => void)[] = [];
afterEach(() => {
  offs.splice(0).forEach((off) => {
    off();
  });
});

/** Serves `GET /media` and records each request's query string. */
function serveList(total = 3) {
  const urls: URL[] = [];
  server.use(
    mock.get(`${BASE}/media`, ({ request }) => {
      const url = new URL(request.url);
      urls.push(url);
      const page = Number(url.searchParams.get('page') ?? '1');
      return HttpResponse.json({ ...mediaListFixture, total, page, perPage: 40 });
    }),
  );
  return urls;
}

async function listParams(params: MediaListParams) {
  const urls = serveList();
  const { result } = renderHook(() => useMediaList(params), { wrapper: createWrapper() });
  await waitFor(() => {
    expect(result.current.isSuccess).toBe(true);
  });
  const url = urls[0];
  if (!url) throw new Error('no request');
  return url.searchParams;
}

describe('useMediaList', () => {
  it('sends folderId=root for the library root', async () => {
    const sp = await listParams({ folder: 'root', q: '', used: null });
    expect(sp.get('folderId')).toBe('root');
    expect(sp.get('perPage')).toBe('40');
    expect(sp.has('q')).toBe(false);
    expect(sp.has('used')).toBe(false);
  });

  it('sends the folder id', async () => {
    const sp = await listParams({ folder: FOLDER.posts, q: '', used: null });
    expect(sp.get('folderId')).toBe(FOLDER.posts);
  });

  it('sends q and drops folderId when searching', async () => {
    const sp = await listParams({ folder: FOLDER.posts, q: 'logo', used: null });
    expect(sp.get('q')).toBe('logo');
    expect(sp.has('folderId')).toBe(false);
  });

  it('sends used=false for unused images', async () => {
    const sp = await listParams({ folder: null, q: '', used: false });
    expect(sp.get('used')).toBe('false');
    expect(sp.has('folderId')).toBe(false);
  });

  it('loads page 2 with fetchNextPage', async () => {
    const urls = serveList(50);
    const { result } = renderHook(() => useMediaList({ folder: null, q: '', used: null }), {
      wrapper: createWrapper(),
    });
    await waitFor(() => {
      expect(result.current.hasNextPage).toBe(true);
    });
    await act(() => result.current.fetchNextPage());
    expect(urls.map((u) => u.searchParams.get('page'))).toEqual(['1', '2']);
    await waitFor(() => {
      expect(result.current.data?.pages).toHaveLength(2);
    });
    expect(result.current.hasNextPage).toBe(false);
  });

  it('does not fetch when disabled', async () => {
    const urls = serveList();
    renderHook(() => useMediaList({ folder: null, q: '', used: null }, false), {
      wrapper: createWrapper(),
    });
    await new Promise((r) => setTimeout(r, 20));
    expect(urls).toHaveLength(0);
  });
});

describe('useMediaTotal', () => {
  it('reads total from perPage=1, with used=false when asked', async () => {
    const urls = serveList(17);
    const { result } = renderHook(() => ({ all: useMediaTotal(), unused: useMediaTotal(false) }), {
      wrapper: createWrapper(),
    });
    await waitFor(() => {
      expect(result.current.all).toBe(17);
      expect(result.current.unused).toBe(17);
    });
    const qs = urls.map((u) => u.search).sort();
    expect(qs).toEqual(['?perPage=1', '?perPage=1&used=false']);
  });
});

describe('useMediaDetail', () => {
  it('fetches by id and stays idle for null', async () => {
    const calls: string[] = [];
    server.use(
      mock.get(`${BASE}/media/:id`, ({ params }) => {
        calls.push(String(params.id));
        return HttpResponse.json({ ...mediaItem(1), usages: [] });
      }),
    );
    const { result, rerender } = renderHook(({ id }) => useMediaDetail(id), {
      wrapper: createWrapper(),
      initialProps: { id: null as string | null },
    });
    expect(result.current.fetchStatus).toBe('idle');
    rerender({ id: 'm-1' });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(calls).toEqual(['m-1']);
  });
});

describe('useFolders', () => {
  it('returns the flat list and the tree', async () => {
    server.use(
      mock.get(`${BASE}/media/folders`, () => HttpResponse.json({ items: folderFixtures })),
    );
    const { result } = renderHook(() => useFolders(), { wrapper: createWrapper() });
    await waitFor(() => {
      expect(result.current.flat).toHaveLength(folderFixtures.length);
    });
    expect(result.current.tree.map((n) => n.id)).toContain(FOLDER.posts);
    expect(result.current.tree.length).toBeLessThan(folderFixtures.length);
  });
});

describe('useDeleteMedia', () => {
  it('sends DELETE with ?version= and refetches the list', async () => {
    const listUrls = serveList();
    let deleteUrl = '';
    server.use(
      mock.delete(`${BASE}/media/:id`, ({ request }) => {
        deleteUrl = request.url;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const { result } = renderHook(
      () => ({
        list: useMediaList({ folder: null, q: '', used: null }),
        del: useDeleteMedia(),
      }),
      { wrapper: createWrapper() },
    );
    await waitFor(() => {
      expect(result.current.list.isSuccess).toBe(true);
    });
    expect(listUrls).toHaveLength(1);
    await act(() => result.current.del.mutateAsync({ id: 'm-1', version: 3 }));
    const url = new URL(deleteUrl);
    expect(url.pathname).toBe('/admin/v1/media/m-1');
    expect(url.searchParams.get('version')).toBe('3');
    await waitFor(() => {
      expect(listUrls).toHaveLength(2);
    });
  });

  it('drops the deleted image detail instead of refetching it', async () => {
    serveList();
    const detailGets: string[] = [];
    server.use(
      mock.get(`${BASE}/media/:id`, ({ params }) => {
        const id = String(params.id);
        detailGets.push(id);
        return detailGets.length > 1
          ? problem(404, 'NOT_FOUND')
          : HttpResponse.json({ ...mediaItem(1), usages: [] });
      }),
      mock.delete(`${BASE}/media/:id`, () => new HttpResponse(null, { status: 204 })),
    );
    const toast = vi.fn();
    offs.push(on('toast', toast));
    // As the panel does: it stays open while the delete runs and closes in the caller's onSuccess.
    const { result } = renderHook(
      () => {
        const [id, setId] = useState<string | null>('m-1');
        return {
          id,
          detail: useMediaDetail(id),
          del: useDeleteMedia(),
          close: () => {
            setId(null);
          },
        };
      },
      { wrapper: createWrapper(createQueryClient()) },
    );
    await waitFor(() => {
      expect(result.current.detail.isSuccess).toBe(true);
    });
    await act(
      () =>
        new Promise<void>((resolve) => {
          result.current.del.mutate(
            { id: 'm-1', version: 3 },
            {
              onSuccess: () => {
                result.current.close();
                resolve();
              },
            },
          );
        }),
    );
    expect(result.current.id).toBeNull();
    await new Promise((r) => setTimeout(r, 30));
    expect(detailGets).toEqual(['m-1']);
    expect(toast).not.toHaveBeenCalled();
  });

  it('still emits conflict on VERSION_CONFLICT', async () => {
    server.use(mock.delete(`${BASE}/media/:id`, () => problem(409, 'VERSION_CONFLICT')));
    const conflict = vi.fn();
    const toast = vi.fn();
    offs.push(on('conflict', conflict), on('toast', toast));
    const { result } = renderHook(() => useDeleteMedia(), {
      wrapper: createWrapper(createQueryClient()),
    });
    await act(() => result.current.mutateAsync({ id: 'm-1', version: 3 }).catch(() => undefined));
    expect(conflict).toHaveBeenCalledWith({ invalidates: [mediaKeys.all] });
    expect(toast).not.toHaveBeenCalled();
  });
});

describe('useMoveMedia', () => {
  it('posts ids and folderId', async () => {
    let body: unknown;
    server.use(
      mock.post(`${BASE}/media/move`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ moved: 2 });
      }),
    );
    const { result } = renderHook(() => useMoveMedia(), { wrapper: createWrapper() });
    const res = await act(() => result.current.mutateAsync({ ids: ['a', 'b'], folderId: null }));
    expect(body).toEqual({ ids: ['a', 'b'], folderId: null });
    expect(res).toEqual({ moved: 2 });
  });
});

describe('useUploadQueue', () => {
  function file(name: string) {
    return new File(['x'], name, { type: 'image/png' });
  }

  /** Holds every upload until the test releases it by file name. */
  function holdUploads() {
    const started: string[] = [];
    const folderIds: (string | null)[] = [];
    const release = new Map<string, (r: Response) => void>();
    let inFlight = 0;
    let maxInFlight = 0;
    server.use(
      mock.post(`${BASE}/media`, async ({ request }) => {
        const form = await request.formData();
        const f = form.get('file');
        // The File crosses realms (jsdom → MSW), so `instanceof File` is false here.
        const name = f !== null && typeof f === 'object' ? f.name : '';
        const folder = form.get('folderId');
        folderIds.push(typeof folder === 'string' ? folder : null);
        inFlight += 1;
        maxInFlight = Math.max(maxInFlight, inFlight);
        started.push(name);
        const res = await new Promise<Response>((resolve) => {
          release.set(name, resolve);
        });
        inFlight -= 1;
        return res;
      }),
    );
    return {
      started,
      folderIds,
      max: () => maxInFlight,
      release(name: string, res: Response) {
        const fn = release.get(name);
        if (!fn) throw new Error(`${name} not started`);
        fn(res);
      },
    };
  }

  it('uploads at most 2 at a time and isolates a failing file', async () => {
    const listUrls = serveList();
    const up = holdUploads();
    const { result, rerender } = renderHook(
      () => ({
        list: useMediaList({ folder: null, q: '', used: null }),
        queue: useUploadQueue(),
      }),
      { wrapper: createWrapper() },
    );
    await waitFor(() => {
      expect(result.current.list.isSuccess).toBe(true);
    });

    act(() => {
      result.current.queue.add([file('a.png'), file('b.png'), file('c.png')], FOLDER.posts);
    });
    expect(result.current.queue.busy).toBe(true);
    expect(result.current.queue.items.map((i) => i.name)).toEqual(['a.png', 'b.png', 'c.png']);
    expect(result.current.queue.items.every((i) => i.progress === 0)).toBe(true);

    await waitFor(() => {
      expect(up.started).toEqual(['a.png', 'b.png']);
    });
    expect(result.current.queue.items.map((i) => i.status)).toEqual([
      'uploading',
      'uploading',
      'queued',
    ]);
    rerender();

    up.release('b.png', problem(415, 'MEDIA_UNSUPPORTED_TYPE'));
    await waitFor(() => {
      expect(up.started).toEqual(['a.png', 'b.png', 'c.png']);
    });
    const b = result.current.queue.items[1];
    expect(b?.status).toBe('error');
    expect(b?.error).toBe('Chỉ nhận ảnh JPEG, PNG, WebP hoặc AVIF.');

    // Closing the finished rows must not cancel the uploads still running.
    act(() => {
      result.current.queue.clearFinished();
    });
    expect(result.current.queue.items.map((i) => i.name)).toEqual(['a.png', 'c.png']);

    up.release('a.png', HttpResponse.json(mediaItem(1), { status: 201 }));
    up.release('c.png', HttpResponse.json(mediaItem(3), { status: 201 }));
    await waitFor(() => {
      expect(result.current.queue.busy).toBe(false);
    });
    const [a, c] = result.current.queue.items;
    expect(a).toMatchObject({ status: 'done', progress: 1, media: mediaItem(1) });
    expect(c).toMatchObject({ status: 'done', progress: 1, media: mediaItem(3) });
    expect(up.max()).toBe(2);
    expect(up.folderIds).toEqual([FOLDER.posts, FOLDER.posts, FOLDER.posts]);
    await waitFor(() => {
      expect(listUrls.length).toBeGreaterThan(1);
    });
  });

  it('uploads to the root without folderId and falls back to a generic message', async () => {
    const up = holdUploads();
    const { result } = renderHook(() => useUploadQueue(), { wrapper: createWrapper() });
    act(() => {
      result.current.add([file('a.png')], null);
    });
    await waitFor(() => {
      expect(up.started).toEqual(['a.png']);
    });
    up.release('a.png', problem(403, 'FORBIDDEN'));
    await waitFor(() => {
      expect(result.current.items[0]?.status).toBe('error');
    });
    expect(result.current.items[0]?.error).toBe('Bạn không có quyền làm việc này.');
    expect(up.folderIds).toEqual([null]);
  });
});
