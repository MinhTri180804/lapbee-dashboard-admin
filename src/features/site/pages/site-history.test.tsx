import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http as mock, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { siteFixture } from '@/test/fixtures/site';
import { problem } from '@/test/msw/problem';
import { server } from '@/test/msw/server';
import { renderWithProviders } from '@/test/render';
import { siteKeys } from '../model/keys';
import { SiteHistoryPage } from './SiteHistoryPage';

const BASE = 'http://localhost/admin/v1';
const USER_ID = '9b1c0e1a-1111-4222-8333-444455556666';

const pub = (number: number, publishedBy: string | null) => ({
  id: '00000000-0000-4000-8000-00000000000' + String(number),
  number,
  publishedAt: '2026-11-24T02:00:00.000Z',
  publishedBy,
});

function mockList(items = [pub(3, USER_ID), pub(2, null)], total = items.length) {
  const pages: string[] = [];
  server.use(
    mock.get(`${BASE}/site`, () => HttpResponse.json(siteFixture)),
    mock.get(`${BASE}/site/publications`, ({ request }) => {
      pages.push(new URL(request.url).searchParams.get('page') ?? '');
      return HttpResponse.json({ items, total, page: 1, perPage: 20 });
    }),
  );
  return pages;
}

function mockUsers() {
  const calls = { n: 0 };
  server.use(
    mock.get(`${BASE}/users`, () => {
      calls.n += 1;
      return HttpResponse.json({
        items: [
          {
            id: USER_ID,
            email: 'a@b.vn',
            name: 'Lê Minh',
            status: 'active',
            roleIds: [],
            version: 1,
          },
        ],
        total: 1,
        page: 1,
        perPage: 100,
      });
    }),
  );
  return calls;
}

function renderPage(permissions: string[] = ['*'], route = '/site/history') {
  return renderWithProviders(<SiteHistoryPage />, {
    route,
    session: { permissions },
    routes: [{ path: '/site', element: <p>Trang site</p> }],
  });
}

describe('SiteHistoryPage', () => {
  it('lists publications and marks the current one', async () => {
    mockList();
    mockUsers();
    renderPage();
    expect(screen.getByText('Thông tin website · Lịch sử')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Lịch sử xuất bản' })).toBeInTheDocument();
    await screen.findByText('#3');
    expect(screen.getByText('#2')).toBeInTheDocument();
    expect(await screen.findByText('Lê Minh')).toBeInTheDocument();
    const rows = screen.getAllByRole('row');
    expect(within(rows[1]!).getByText('Hiện hành')).toBeInTheDocument();
    expect(within(rows[1]!).queryByRole('button')).not.toBeInTheDocument();
    expect(within(rows[2]!).getByRole('button', { name: 'Khôi phục về nháp' })).toBeInTheDocument();
    expect(within(rows[2]!).getByText('—')).toBeInTheDocument();
  });

  it('shows the empty state', async () => {
    mockList([]);
    mockUsers();
    renderPage();
    expect(await screen.findByText('Chưa xuất bản lần nào.')).toBeInTheDocument();
  });

  it('shows an error, not the empty state, when the list fails to load', async () => {
    mockList();
    mockUsers();
    server.use(mock.get(`${BASE}/site/publications`, () => problem(500, 'INTERNAL')));
    renderPage();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Không tải được lịch sử xuất bản. Thử lại sau.',
    );
    expect(screen.queryByText('Chưa xuất bản lần nào.')).not.toBeInTheDocument();
  });

  it('does not refetch /users when the site is reloaded', async () => {
    mockList();
    const calls = mockUsers();
    const { queryClient } = renderPage();
    expect(await screen.findByText('Lê Minh')).toBeInTheDocument();
    expect(calls.n).toBe(1);
    await act(() => queryClient.invalidateQueries({ queryKey: siteKeys.detail }));
    expect(calls.n).toBe(1);
  });

  it('restores with the current draftHash then navigates and toasts', async () => {
    mockList();
    mockUsers();
    let body: unknown;
    server.use(
      mock.post(`${BASE}/site/publications/:id/restore-to-draft`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json(siteFixture);
      }),
    );
    const { router } = renderPage();
    await screen.findByText('#3');
    await userEvent.click(await screen.findByRole('button', { name: 'Khôi phục về nháp' }));
    expect(screen.getByText('Khôi phục bản #2 về nháp?')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Bản nháp hiện tại sẽ bị thay bằng nội dung của bản này. Website chưa thay đổi cho tới khi bạn xuất bản.',
      ),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Khôi phục' }));
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/site');
    });
    expect(router.state.location.search).toBe('?tab=general');
    expect(body).toEqual({ draftHash: siteFixture.draftHash });
    expect(await screen.findByText('Đã khôi phục về nháp')).toBeInTheDocument();
  });

  it('shows a dash and skips /users without user.read', async () => {
    mockList();
    const calls = mockUsers();
    renderPage(['site.read', 'site.update']);
    await screen.findByText('#3');
    expect(screen.getAllByText('—')).toHaveLength(2);
    expect(calls.n).toBe(0);
  });

  it('disables restore buttons with a tooltip without site.update', async () => {
    mockList();
    mockUsers();
    renderPage(['site.read']);
    await screen.findByText('#3');
    const buttons = screen.getAllByRole('button', { name: 'Khôi phục về nháp' });
    expect(buttons.length).toBeGreaterThan(0);
    for (const button of buttons) {
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('title', 'Bạn không có quyền khôi phục bản nháp');
    }
  });

  it('requests page 2 from the URL and paginates', async () => {
    const pages = mockList([pub(3, null)], 45);
    mockUsers();
    renderPage(['*'], '/site/history?page=2');
    await screen.findByText('#3');
    expect(pages).toContain('2');
    expect(screen.getByText('Trang 2 / 3')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Trang sau' }));
    await waitFor(() => {
      expect(pages).toContain('3');
    });
  });
});
