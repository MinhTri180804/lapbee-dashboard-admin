import { act, renderHook, waitFor } from '@testing-library/react';
import { http as mock, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { createQueryClient } from '@/app/query-client';
import { on } from '@/shared/api/events';
import { siteFixture } from '@/test/fixtures/site';
import { problem } from '@/test/msw/problem';
import { server } from '@/test/msw/server';
import { createTestQueryClient, createWrapper } from '@/test/render';
import { siteKeys } from '../model/keys';
import { useDeleteItem, useUpdateItem } from './use-item-mutations';
import { usePublishSite } from './use-publish-site';
import { useSaveSettings } from './use-save-settings';
import { useSite } from './use-site';

const BASE = 'http://localhost/admin/v1';
function keepingClient() {
  const qc = createTestQueryClient();
  qc.setQueryDefaults(siteKeys.detail, { gcTime: Infinity });
  return qc;
}

const newSite = { ...siteFixture, draftHash: 'hash-new-0002' };

describe('useSite', () => {
  it('caches the raw DTO and selects the view', async () => {
    server.use(mock.get(`${BASE}/site`, () => HttpResponse.json(siteFixture)));
    const qc = createTestQueryClient();
    const { result } = renderHook(() => useSite(), { wrapper: createWrapper(qc) });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data?.draftHash).toBe(siteFixture.draftHash);
    expect(qc.getQueryData(siteKeys.detail)).toEqual(siteFixture);
  });
});

describe('useSaveSettings', () => {
  it('sends the body and stores the returned site', async () => {
    let received: unknown;
    server.use(
      mock.patch(`${BASE}/site/settings`, async ({ request }) => {
        received = await request.json();
        return HttpResponse.json(newSite);
      }),
    );
    const qc = keepingClient();
    const { result } = renderHook(() => useSaveSettings(), { wrapper: createWrapper(qc) });
    await act(() => result.current.mutateAsync({ version: 7, phone: '111' }));
    expect(received).toEqual({ version: 7, phone: '111' });
    expect(qc.getQueryData(siteKeys.detail)).toEqual(newSite);
  });
});

describe('useDeleteItem', () => {
  it('sends the version as a query param', async () => {
    let url = '';
    server.use(
      mock.delete(`${BASE}/site/services/:id`, ({ request }) => {
        url = request.url;
        return HttpResponse.json(newSite);
      }),
    );
    const { result } = renderHook(() => useDeleteItem('services'), { wrapper: createWrapper() });
    await act(() => result.current.mutateAsync({ id: 'abc', version: 3 }));
    expect(new URL(url).searchParams.get('version')).toBe('3');
  });
});

describe('usePublishSite', () => {
  it('patches settings first, then publishes with the new draftHash', async () => {
    const calls: string[] = [];
    let publishBody: unknown;
    server.use(
      mock.patch(`${BASE}/site/settings`, () => {
        calls.push('patch');
        return HttpResponse.json(newSite);
      }),
      mock.post(`${BASE}/site/publish`, async ({ request }) => {
        calls.push('publish');
        publishBody = await request.json();
        return HttpResponse.json({
          publication: {
            id: 'p1',
            number: 4,
            publishedAt: '2026-11-24T00:00:00.000Z',
            publishedBy: 'u1',
          },
          site: { ...newSite, dirty: false },
        });
      }),
    );
    const qc = keepingClient();
    const { result } = renderHook(() => usePublishSite(), { wrapper: createWrapper(qc) });
    await act(() =>
      result.current.mutateAsync({
        settingsPatch: { version: 7, phone: '111' },
        draftHash: 'hash-old',
      }),
    );
    expect(calls).toEqual(['patch', 'publish']);
    expect(publishBody).toEqual({ draftHash: 'hash-new-0002' });
    expect(qc.getQueryData<{ dirty: boolean }>(siteKeys.detail)?.dirty).toBe(false);
  });

  it('keeps the patched site in cache and surfaces SITE_INVALID', async () => {
    server.use(
      mock.patch(`${BASE}/site/settings`, () => HttpResponse.json(newSite)),
      mock.post(`${BASE}/site/publish`, () => problem(422, 'SITE_INVALID')),
    );
    const qc = keepingClient();
    const { result } = renderHook(() => usePublishSite(), { wrapper: createWrapper(qc) });
    await act(async () => {
      await expect(
        result.current.mutateAsync({
          settingsPatch: { version: 7, phone: '111' },
          draftHash: 'hash-old',
        }),
      ).rejects.toMatchObject({ code: 'SITE_INVALID' });
    });
    expect(qc.getQueryData(siteKeys.detail)).toEqual(newSite);
  });
});

describe('useUpdateItem', () => {
  it('emits conflict with the site key on VERSION_CONFLICT', async () => {
    server.use(mock.patch(`${BASE}/site/services/:id`, () => problem(409, 'VERSION_CONFLICT')));
    const handler = vi.fn();
    const off = on('conflict', handler);
    const qc = createQueryClient();
    const { result } = renderHook(() => useUpdateItem('services'), { wrapper: createWrapper(qc) });
    await act(async () => {
      await expect(
        result.current.mutateAsync({ id: 'abc', body: { version: 1, title: 'x' } }),
      ).rejects.toBeDefined();
    });
    off();
    expect(handler).toHaveBeenCalledWith({ invalidates: [['site']] });
  });
});
