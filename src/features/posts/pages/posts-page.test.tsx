import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http as mock, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { categoriesFixture, categoryFixtures } from '@/test/fixtures/categories';
import { postItem, postListFixture } from '@/test/fixtures/posts';
import { problem } from '@/test/msw/problem';
import { server } from '@/test/msw/server';
import { renderWithProviders } from '@/test/render';
import type { PostList } from '../model/adapters';
import { PostsPage } from './PostsPage';

const BASE = 'http://localhost/admin/v1';
const DEBOUNCE_WAIT = { timeout: 3000 };
const [huongDan, tinTuc, khuyenMai] = categoryFixtures as [
  (typeof categoryFixtures)[number],
  (typeof categoryFixtures)[number],
  (typeof categoryFixtures)[number],
];

const ALL = Array.from({ length: 20 }, (_, i) => postItem(i + 1));

/** Serves 20 posts, 8 a page; every list request's query is recorded. */
function servePosts(respond?: (sp: URLSearchParams) => PostList) {
  const requests: URLSearchParams[] = [];
  server.use(
    mock.get(`${BASE}/posts`, ({ request }) => {
      const sp = new URL(request.url).searchParams;
      requests.push(sp);
      if (respond) return HttpResponse.json(respond(sp));
      const page = Number(sp.get('page') ?? '1');
      return HttpResponse.json(postListFixture(ALL.slice((page - 1) * 8, page * 8), { page }));
    }),
    mock.get(`${BASE}/categories`, () => HttpResponse.json(categoriesFixture)),
  );
  return requests;
}

function last(requests: URLSearchParams[]): Record<string, string> {
  return Object.fromEntries(requests.at(-1) ?? []);
}

function renderPage(route = '/posts', permissions: string[] = ['*']) {
  return renderWithProviders(<PostsPage />, { route, session: { permissions } });
}

function filters() {
  return screen.getByRole('group', { name: 'Lọc theo chuyên mục' });
}

describe('PostsPage', () => {
  it('asks for the first page of 8 and shows the counts', async () => {
    const requests = servePosts();
    renderPage();
    expect(await screen.findByText('Bài viết số 1')).toBeInTheDocument();
    expect(last(requests)).toEqual({ page: '1', perPage: '8' });

    expect(screen.getByText('Quản trị · Bài đăng')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Bài đăng' })).toBeInTheDocument();
    expect(
      screen.getByText('Bài viết trên website. Mỗi bài được chấm điểm SEO khi bạn viết.'),
    ).toBeInTheDocument();

    const stat = (label: string) => screen.getByText(label, { selector: 'dt' }).nextSibling;
    expect(stat('Đã xuất bản')).toHaveTextContent('12');
    expect(stat('Bản nháp')).toHaveTextContent('8');
    expect(stat('Tổng số bài')).toHaveTextContent('20');
    expect(screen.queryByText(/SEO trung bình/)).not.toBeInTheDocument();
    expect(screen.getByText('Hiển thị 1–8 trên 20 bài')).toBeInTheDocument();
  });

  it('shows the four columns with title, excerpt, category, status and date', async () => {
    servePosts(() =>
      postListFixture([postItem(1), postItem(2, { status: 'draft', date: '' })], { total: 2 }),
    );
    renderPage();
    const row = (await screen.findByText('Bài viết số 1')).closest('tr');
    if (!row) throw new Error('no row');
    expect(screen.getAllByRole('columnheader').map((th) => th.textContent)).toEqual([
      'Bài viết',
      'Chuyên mục',
      'Trạng thái',
      'Ngày',
    ]);
    const cells = within(row).getAllByRole('cell');
    expect(cells[0]).toHaveTextContent('Tóm tắt bài 1');
    expect(cells[1]).toHaveTextContent('Hướng dẫn');
    expect(cells[2]).toHaveTextContent('Đã xuất bản');
    expect(cells[3]).toHaveTextContent('20.11.2026');
    const draft = screen.getByText('Bài viết số 2').closest('tr');
    if (!draft) throw new Error('no row');
    expect(within(draft).getByText('Bản nháp')).toBeInTheDocument();
    expect(within(draft).getByText('—')).toBeInTheDocument();
    expect(row).not.toHaveAttribute('role', 'link');
    expect(within(row).queryByRole('link')).not.toBeInTheDocument();
  });

  it('labels a post without title, category or date', async () => {
    servePosts(() =>
      postListFixture(
        [postItem(1, { title: '', category: null, categoryId: null, date: '', status: 'draft' })],
        { total: 1 },
      ),
    );
    renderPage();
    expect(await screen.findByText('Bài chưa có tiêu đề')).toBeInTheDocument();
    expect(screen.getByText('Chưa có chuyên mục')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('disables "Viết bài mới" with the tooltip "Sắp có"', async () => {
    servePosts();
    renderPage();
    const button = screen.getByRole('button', { name: 'Viết bài mới' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('title', 'Sắp có');
    await screen.findByText('Bài viết số 1');
  });

  it('lists the category tags in position order with their counts, zero included', async () => {
    servePosts();
    renderPage();
    await waitFor(() => {
      expect(within(filters()).getAllByRole('button')).toHaveLength(4);
    });
    expect(
      within(filters())
        .getAllByRole('button')
        .map((b) => b.textContent),
    ).toEqual(['Tất cả20', `${huongDan.name}14`, `${tinTuc.name}0`, `${khuyenMai.name}5`]);
    expect(within(filters()).getByRole('button', { name: /Tất cả/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('filters by category, back on page 1', async () => {
    const user = userEvent.setup();
    const requests = servePosts();
    const { router } = renderPage('/posts?page=2');
    await screen.findByText('Bài viết số 9');
    await user.click(await within(filters()).findByRole('button', { name: /Hướng dẫn/ }));
    expect(router.state.location.search).toBe(`?cat=${huongDan.id}`);
    await waitFor(() => {
      expect(last(requests)).toEqual({ cat: huongDan.id, page: '1', perPage: '8' });
    });
    expect(within(filters()).getByRole('button', { name: /Hướng dẫn/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await user.click(within(filters()).getByRole('button', { name: /Tất cả/ }));
    expect(router.state.location.search).toBe('');
  });

  it('filters by status, back on page 1', async () => {
    const user = userEvent.setup();
    const requests = servePosts();
    const { router } = renderPage('/posts?page=2');
    await screen.findByText('Bài viết số 9');
    const select = screen.getByRole('combobox', { name: 'Trạng thái' });
    expect(
      within(select)
        .getAllByRole('option')
        .map((o) => o.textContent),
    ).toEqual(['Mọi trạng thái', 'Đã xuất bản', 'Bản nháp']);
    await user.selectOptions(select, 'Bản nháp');
    expect(router.state.location.search).toBe('?status=draft');
    await waitFor(() => {
      expect(last(requests)).toEqual({ status: 'draft', page: '1', perPage: '8' });
    });
    await user.selectOptions(select, 'Mọi trạng thái');
    expect(router.state.location.search).toBe('');
  });

  it('searches after the debounce, back on page 1, keeping the other filters', async () => {
    const user = userEvent.setup();
    const requests = servePosts();
    const { router } = renderPage('/posts?status=draft&page=2');
    await screen.findByText('Bài viết số 9');
    const box = screen.getByRole('searchbox', { name: 'Tìm theo tiêu đề' });
    await user.type(box, 'pin ');
    await waitFor(() => {
      expect(new URLSearchParams(router.state.location.search).get('q')).toBe('pin');
    }, DEBOUNCE_WAIT);
    expect(router.state.historyAction).toBe('PUSH');
    expect(new URLSearchParams(router.state.location.search).has('page')).toBe(false);
    expect(new URLSearchParams(router.state.location.search).get('status')).toBe('draft');
    await waitFor(() => {
      expect(last(requests)).toEqual({ status: 'draft', q: 'pin', page: '1', perPage: '8' });
    });
    expect(box).toHaveValue('pin ');

    await user.type(box, 'laptop');
    await waitFor(() => {
      expect(new URLSearchParams(router.state.location.search).get('q')).toBe('pin laptop');
    }, DEBOUNCE_WAIT);
    expect(router.state.historyAction).toBe('REPLACE');
  });

  it('pages forward and back', async () => {
    const user = userEvent.setup();
    const requests = servePosts();
    const { router } = renderPage();
    await screen.findByText('Bài viết số 1');
    expect(screen.getByRole('button', { name: 'Trang trước' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Trang sau' }));
    expect(router.state.location.search).toBe('?page=2');
    expect(await screen.findByText('Bài viết số 9')).toBeInTheDocument();
    expect(last(requests)).toEqual({ page: '2', perPage: '8' });
    expect(screen.getByText('Hiển thị 9–16 trên 20 bài')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Trang sau' }));
    expect(await screen.findByText('Hiển thị 17–20 trên 20 bài')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Trang sau' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Trang trước' }));
    expect(router.state.location.search).toBe('?page=2');
  });

  it('shows the empty state with "Về trang 1" past the last page', async () => {
    const user = userEvent.setup();
    servePosts();
    const { router } = renderPage('/posts?page=9');
    const back = await screen.findByRole('button', { name: 'Về trang 1' });
    expect(screen.queryByText(/Bài viết số/)).not.toBeInTheDocument();
    await user.click(back);
    expect(router.state.location.search).toBe('');
    expect(await screen.findByText('Bài viết số 1')).toBeInTheDocument();
  });

  it('tells an empty list from an empty filter', async () => {
    servePosts((sp) => postListFixture([], { total: 0, page: Number(sp.get('page')) }));
    const { unmount } = renderPage();
    expect(await screen.findByText('Chưa có bài viết nào.')).toBeInTheDocument();
    expect(screen.getByText('0 bài')).toBeInTheDocument();
    unmount();

    renderPage('/posts?status=draft');
    expect(await screen.findByText('Không có bài viết phù hợp với bộ lọc.')).toBeInTheDocument();
  });

  it('still lists posts when categories cannot be read', async () => {
    servePosts();
    server.use(mock.get(`${BASE}/categories`, () => problem(403, 'FORBIDDEN')));
    renderPage('/posts', ['post.read']);
    expect(await screen.findByText('Bài viết số 1')).toBeInTheDocument();
    expect(
      within(filters())
        .getAllByRole('button')
        .map((b) => b.textContent),
    ).toEqual(['Tất cả20']);
    expect(screen.getAllByText('Hướng dẫn').length).toBeGreaterThan(0);
  });

  it('shows an error when the list cannot load', async () => {
    servePosts();
    server.use(mock.get(`${BASE}/posts`, () => problem(500, 'INTERNAL')));
    renderPage();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Không tải được danh sách bài. Thử lại sau.',
    );
  });
});
