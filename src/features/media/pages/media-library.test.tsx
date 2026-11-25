import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http as mock, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { FOLDER, foldersFixture, mediaItem } from '@/test/fixtures/media';
import { problem } from '@/test/msw/problem';
import { server } from '@/test/msw/server';
import { renderWithProviders } from '@/test/render';
import { MediaCard } from '../components/MediaCard';
import { MediaLibraryPage } from './MediaLibraryPage';

const BASE = 'http://localhost/admin/v1';

/** Serves folders and `GET /media`; records the query string of every list (perPage 40) call. */
function serveLibrary({ total = 3 }: { total?: number } = {}) {
  const lists: URLSearchParams[] = [];
  server.use(
    mock.get(`${BASE}/media/folders`, () => HttpResponse.json(foldersFixture)),
    mock.get(`${BASE}/media`, ({ request }) => {
      const sp = new URL(request.url).searchParams;
      const perPage = Number(sp.get('perPage') ?? '40');
      if (perPage === 1) {
        const count = sp.get('used') === 'false' ? 2 : 26;
        return HttpResponse.json({ items: [], total: count, page: 1, perPage: 1 });
      }
      lists.push(sp);
      const page = Number(sp.get('page') ?? '1');
      const base = (page - 1) * 40;
      return HttpResponse.json({
        items: [mediaItem(base + 1), mediaItem(base + 2), mediaItem(base + 3)],
        total,
        page,
        perPage: 40,
      });
    }),
  );
  return lists;
}

function renderPage(route = '/media', permissions: string[] = ['*']) {
  return renderWithProviders(<MediaLibraryPage />, { route, session: { permissions } });
}

function last(lists: URLSearchParams[]): URLSearchParams {
  const sp = lists[lists.length - 1];
  if (!sp) throw new Error('no list request');
  return sp;
}

function folderButton(name: string) {
  return screen.getByRole('button', { name: new RegExp(`^${name}(\\s|$)`) });
}

describe('MediaLibraryPage', () => {
  it('shows the header, counts, cumulative folder totals and the grid', async () => {
    const lists = serveLibrary();
    renderPage();
    expect(screen.getByRole('heading', { level: 1, name: 'Thư viện ảnh' })).toBeInTheDocument();
    expect(screen.getByText('Quản trị · Thư viện ảnh')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Tải ảnh lên một lần, dùng lại ở Đội ngũ, Hành trình và Bài đăng. Ảnh đang được dùng không xoá được.',
      ),
    ).toBeInTheDocument();

    expect(await screen.findByText('26 ảnh')).toBeInTheDocument();
    const all = screen.getByRole('button', { name: /^Tất cả ảnh/ });
    expect(within(all).getByText('26')).toBeInTheDocument();
    expect(all).toHaveAttribute('aria-current', 'true');
    const unused = screen.getByRole('button', { name: /^Chưa dùng/ });
    expect(await within(unused).findByText('2')).toBeInTheDocument();

    expect(screen.getByText('Thư mục')).toBeInTheDocument();
    expect(screen.getByText('Tối đa 5 cấp')).toBeInTheDocument();
    const journey = await screen.findByRole('button', { name: /^Hành trình/ });
    expect(within(journey).getByText('12')).toBeInTheDocument();
    expect(within(folderButton('Đội ngũ')).getByText('6')).toBeInTheDocument();

    expect(screen.getByRole('heading', { level: 2, name: 'Thư viện' })).toBeInTheDocument();
    expect(await screen.findByText('3 ảnh')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Mô tả 2' })).toHaveAttribute(
      'src',
      mediaItem(2).thumbUrl,
    );
    // An image without alt text is described by its name.
    expect(screen.getByRole('img', { name: 'anh-1.jpg' })).toBeInTheDocument();
    expect(screen.getAllByText('1200 × 800')).toHaveLength(3);
    expect(screen.queryByRole('button', { name: 'Tải thêm' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Thư mục mới' })).toBeDisabled();

    const sp = last(lists);
    expect(sp.has('folderId')).toBe(false);
    expect(sp.has('used')).toBe(false);
  });

  it('selects a folder, searches and switches to unused images through the URL', async () => {
    const user = userEvent.setup();
    const lists = serveLibrary();
    const { router } = renderPage();
    await user.click(await screen.findByRole('button', { name: /^2024/ }));

    expect(router.state.location.search).toBe(`?folder=${FOLDER.y2024}`);
    await waitFor(() => {
      expect(last(lists).get('folderId')).toBe(FOLDER.y2024);
    });
    expect(screen.getByRole('heading', { level: 2, name: '2024' })).toBeInTheDocument();
    expect(folderButton('2024')).toHaveAttribute('aria-current', 'true');

    await user.type(screen.getByRole('searchbox', { name: 'Tìm trong thư viện' }), 'chan dung');
    await waitFor(() => {
      expect(new URLSearchParams(router.state.location.search).get('q')).toBe('chan dung');
    });
    expect(new URLSearchParams(router.state.location.search).has('folder')).toBe(false);
    expect(
      await screen.findByRole('heading', { level: 2, name: 'Kết quả tìm kiếm' }),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(last(lists).get('q')).toBe('chan dung');
    });
    expect(last(lists).has('folderId')).toBe(false);
    expect(folderButton('2024')).not.toHaveAttribute('aria-current');

    await user.click(screen.getByRole('button', { name: /^Chưa dùng/ }));
    expect(router.state.location.search).toBe('?view=unused');
    expect(screen.getByRole('searchbox', { name: 'Tìm trong thư viện' })).toHaveValue('');
    await waitFor(() => {
      expect(last(lists).get('used')).toBe('false');
    });
    expect(last(lists).has('q')).toBe(false);
    expect(screen.getByRole('heading', { level: 2, name: 'Chưa dùng' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^Tất cả ảnh/ }));
    expect(router.state.location.search).toBe('');
  });

  it('keeps a trailing space in the box after the debounced search', async () => {
    const user = userEvent.setup();
    serveLibrary();
    const { router } = renderPage();
    const box = screen.getByRole('searchbox', { name: 'Tìm trong thư viện' });
    await user.type(box, 'chan ');
    await waitFor(() => {
      expect(new URLSearchParams(router.state.location.search).get('q')).toBe('chan');
    });
    await screen.findByRole('heading', { level: 2, name: 'Kết quả tìm kiếm' });
    expect(box).toHaveValue('chan ');
    await user.type(box, 'dung');
    await waitFor(() => {
      expect(new URLSearchParams(router.state.location.search).get('q')).toBe('chan dung');
    });
  });

  it('goes Back from search results to the folder it started in', async () => {
    const user = userEvent.setup();
    serveLibrary();
    const { router } = renderPage(`/media?folder=${FOLDER.y2024}`);
    await user.type(screen.getByRole('searchbox', { name: 'Tìm trong thư viện' }), 'chan');
    await waitFor(() => {
      expect(new URLSearchParams(router.state.location.search).get('q')).toBe('chan');
    });
    await router.navigate(-1);
    await waitFor(() => {
      expect(router.state.location.search).toBe(`?folder=${FOLDER.y2024}`);
    });
    expect(await screen.findByRole('heading', { level: 2, name: '2024' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Tìm trong thư viện' })).toHaveValue('');
  });

  it('collapses and expands a folder with children', async () => {
    const user = userEvent.setup();
    serveLibrary();
    renderPage();
    const toggle = await screen.findByRole('button', { name: 'Thu gọn Hành trình' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: /^2024/ })).toBeInTheDocument();
    // Leaves have no toggle.
    expect(screen.queryByRole('button', { name: /Đội ngũ$/ })).toBeNull();

    await user.click(toggle);
    expect(screen.queryByRole('button', { name: /^2024/ })).not.toBeInTheDocument();
    const reopen = screen.getByRole('button', { name: 'Mở Hành trình' });
    expect(reopen).toHaveAttribute('aria-expanded', 'false');
    await user.click(reopen);
    expect(screen.getByRole('button', { name: /^2024/ })).toBeInTheDocument();
  });

  it('loads the next page with Tải thêm', async () => {
    const user = userEvent.setup();
    const lists = serveLibrary({ total: 45 });
    renderPage();
    await user.click(await screen.findByRole('button', { name: 'Tải thêm' }));
    expect(await screen.findByRole('img', { name: 'anh-41.jpg' })).toBeInTheDocument();
    expect(last(lists).get('page')).toBe('2');
    expect(screen.queryByRole('button', { name: 'Tải thêm' })).not.toBeInTheDocument();
  });

  it.each([
    ['/media', 'Chưa có ảnh nào.'],
    [`/media?folder=${FOLDER.services}`, 'Thư mục này chưa có ảnh.'],
    ['/media?q=xyz', 'Không tìm thấy ảnh nào.'],
    ['/media?view=unused', 'Chưa có ảnh nào chưa dùng.'],
  ])('shows the empty state for %s', async (route, text) => {
    serveLibrary();
    server.use(
      mock.get(`${BASE}/media`, () =>
        HttpResponse.json({ items: [], total: 0, page: 1, perPage: 40 }),
      ),
    );
    renderPage(route);
    expect(await screen.findByText(text)).toBeInTheDocument();
  });

  it('opens an image card in the URL and marks it', async () => {
    const user = userEvent.setup();
    serveLibrary();
    const { router } = renderPage(`/media?folder=${FOLDER.team}`);
    const card = await screen.findByRole('button', { name: 'anh-2.jpg' });
    await user.click(card);
    const sp = new URLSearchParams(router.state.location.search);
    expect(sp.get('id')).toBe(mediaItem(2).id);
    expect(sp.get('folder')).toBe(FOLDER.team);
    expect(screen.getByRole('button', { name: 'anh-2.jpg' })).toHaveAttribute(
      'aria-current',
      'true',
    );
  });

  it('disables upload without media.upload', async () => {
    serveLibrary();
    renderPage('/media', ['media.read']);
    const upload = screen.getByRole('button', { name: 'Tải ảnh lên' });
    expect(upload).toBeDisabled();
    expect(upload).toHaveAttribute('title', 'Bạn không có quyền tải ảnh lên');
    expect(await screen.findByText('26 ảnh')).toBeInTheDocument();
  });
});

describe('MediaLibraryPage uploads', () => {
  function png(name: string) {
    return new File(['x'], name, { type: 'image/png' });
  }

  it('uploads every chosen file into the selected folder and shows per-file errors', async () => {
    const user = userEvent.setup();
    const lists = serveLibrary();
    const folderIds: (string | null)[] = [];
    server.use(
      mock.post(`${BASE}/media`, async ({ request }) => {
        const form = await request.formData();
        const f = form.get('file');
        const folder = form.get('folderId');
        folderIds.push(typeof folder === 'string' ? folder : null);
        const name = f !== null && typeof f === 'object' ? f.name : '';
        if (name === 'big.png') return problem(413, 'MEDIA_TOO_LARGE');
        return HttpResponse.json(mediaItem(9), { status: 201 });
      }),
    );
    renderPage(`/media?folder=${FOLDER.team}`);
    await screen.findByText('3 ảnh');
    const before = lists.length;

    const input = screen.getByLabelText('Chọn ảnh để tải lên');
    expect(input).toHaveAttribute('accept', 'image/jpeg,image/png,image/webp,image/avif');
    expect(input).toHaveAttribute('multiple');
    await user.upload(input, [png('ok.png'), png('big.png')]);

    const queue = await screen.findByRole('region', { name: 'Danh sách tải lên' });
    expect(await within(queue).findByText('Đã tải xong')).toBeInTheDocument();
    expect(folderIds).toEqual([FOLDER.team, FOLDER.team]);
    expect(within(queue).getByText('ok.png')).toBeInTheDocument();
    expect(within(queue).getByText('Ảnh vượt quá 10 MB.')).toBeInTheDocument();
    await waitFor(() => {
      expect(lists.length).toBeGreaterThan(before);
    });

    await user.click(within(queue).getByRole('button', { name: 'Đóng' }));
    expect(screen.queryByRole('region', { name: 'Danh sách tải lên' })).not.toBeInTheDocument();
  });

  it('shows progress while uploading and uploads to the root from a search', async () => {
    const user = userEvent.setup();
    serveLibrary();
    const folderIds: (string | null)[] = [];
    let release: (() => void) | undefined;
    server.use(
      mock.post(`${BASE}/media`, async ({ request }) => {
        const folder = (await request.formData()).get('folderId');
        folderIds.push(typeof folder === 'string' ? folder : null);
        await new Promise<void>((resolve) => {
          release = resolve;
        });
        return HttpResponse.json(mediaItem(9), { status: 201 });
      }),
    );
    renderPage('/media?q=anh');
    await screen.findByText('3 ảnh');
    await user.upload(screen.getByLabelText('Chọn ảnh để tải lên'), [png('a.png')]);

    const queue = await screen.findByRole('region', { name: 'Danh sách tải lên' });
    expect(within(queue).getByText('Đang tải 0/1 ảnh')).toBeInTheDocument();
    await waitFor(() => {
      expect(release).toBeTypeOf('function');
    });
    expect(within(queue).getByText('Đang tải')).toBeInTheDocument();
    release?.();
    expect(await within(queue).findByText('Đã tải xong')).toBeInTheDocument();
    expect(folderIds).toEqual([null]);
  });
});

describe('MediaCard', () => {
  it('renders a check box when checkable', async () => {
    const user = userEvent.setup();
    const onToggleCheck = vi.fn();
    const onOpen = vi.fn();
    renderWithProviders(
      <MediaCard
        media={mediaItem(1)}
        selected={false}
        checked
        checkable
        onOpen={onOpen}
        onToggleCheck={onToggleCheck}
      />,
    );
    const box = screen.getByRole('checkbox', { name: 'Chọn anh-1.jpg' });
    expect(box).toBeChecked();
    await user.click(box);
    expect(onToggleCheck).toHaveBeenCalledTimes(1);
    expect(onOpen).not.toHaveBeenCalled();
  });
});
