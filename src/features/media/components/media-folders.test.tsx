import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http as mock, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { FOLDER, folderFixtures, folderId, mediaItem } from '@/test/fixtures/media';
import { problem } from '@/test/msw/problem';
import { server } from '@/test/msw/server';
import { renderWithProviders } from '@/test/render';
import { MediaLibraryPage } from '../pages/MediaLibraryPage';

const BASE = 'http://localhost/admin/v1';

type Folders = typeof folderFixtures;

// Adds a chain Dịch vụ is untouched: Bài đăng > Mới (empty) and a depth-5 branch.
const EMPTY = folderId(20);
const DEEP = folderId(25);
const extra: Folders = [
  { id: EMPTY, parentId: FOLDER.posts, name: 'Nháp', depth: 2, mediaCount: 0, version: 4 },
  {
    id: folderId(23),
    parentId: FOLDER.cleanRoom,
    name: 'Cấp 4',
    depth: 4,
    mediaCount: 1,
    version: 1,
  },
  { id: DEEP, parentId: folderId(23), name: 'Cấp 5', depth: 5, mediaCount: 1, version: 1 },
];

function serveLibrary(folders: Folders = [...folderFixtures, ...extra]) {
  server.use(
    mock.get(`${BASE}/media/folders`, () => HttpResponse.json({ items: folders })),
    mock.get(`${BASE}/media`, ({ request }) => {
      const perPage = new URL(request.url).searchParams.get('perPage');
      return HttpResponse.json({
        items: perPage === '1' ? [] : [mediaItem(1)],
        total: 1,
        page: 1,
        perPage: Number(perPage ?? 40),
      });
    }),
  );
}

function renderPage(folder: string | null, permissions: string[] = ['*']) {
  return renderWithProviders(<MediaLibraryPage />, {
    route: folder ? `/media?folder=${folder}` : '/media',
    session: { permissions },
  });
}

async function bodyOf(request: Request) {
  return (await request.json()) as Record<string, unknown>;
}

describe('folder management', () => {
  it('creates a folder inside the selected one and selects it', async () => {
    const user = userEvent.setup();
    serveLibrary();
    const bodies: unknown[] = [];
    const created = folderId(30);
    server.use(
      mock.post(`${BASE}/media/folders`, async ({ request }) => {
        bodies.push(await bodyOf(request));
        return HttpResponse.json(
          {
            id: created,
            parentId: FOLDER.journey,
            name: 'Sự kiện',
            depth: 2,
            mediaCount: 0,
            version: 1,
          },
          { status: 201 },
        );
      }),
    );
    const { router } = renderPage(FOLDER.journey);
    await user.click(await screen.findByRole('button', { name: 'Thư mục mới' }));
    const dialog = screen.getByRole('dialog', { name: 'Thư mục mới' });
    await user.type(within(dialog).getByRole('textbox', { name: 'Tên thư mục' }), '  Sự kiện ');
    await user.click(within(dialog).getByRole('button', { name: 'Tạo' }));

    expect(await screen.findByText('Đã tạo thư mục')).toBeInTheDocument();
    expect(bodies).toEqual([{ name: 'Sự kiện', parentId: FOLDER.journey }]);
    await waitFor(() => {
      expect(router.state.location.search).toBe(`?folder=${created}`);
    });
  });

  it('creates at the root with parentId null and validates the name', async () => {
    const user = userEvent.setup();
    serveLibrary();
    const bodies: unknown[] = [];
    server.use(
      mock.post(`${BASE}/media/folders`, async ({ request }) => {
        bodies.push(await bodyOf(request));
        return HttpResponse.json(
          { id: folderId(31), parentId: null, name: 'Mới', depth: 1, mediaCount: 0, version: 1 },
          { status: 201 },
        );
      }),
    );
    renderPage(null);
    await user.click(await screen.findByRole('button', { name: 'Thư mục mới' }));
    const dialog = screen.getByRole('dialog', { name: 'Thư mục mới' });
    await user.type(within(dialog).getByRole('textbox', { name: 'Tên thư mục' }), '   ');
    await user.click(within(dialog).getByRole('button', { name: 'Tạo' }));
    expect(await within(dialog).findByText('Không được để trống.')).toBeInTheDocument();
    expect(bodies).toEqual([]);
    await user.type(within(dialog).getByRole('textbox', { name: 'Tên thư mục' }), 'Mới');
    await user.click(within(dialog).getByRole('button', { name: 'Tạo' }));
    await waitFor(() => {
      expect(bodies).toEqual([{ name: 'Mới', parentId: null }]);
    });
  });

  it('shows FOLDER_NAME_TAKEN under the name and keeps the dialog open', async () => {
    const user = userEvent.setup();
    serveLibrary();
    server.use(mock.post(`${BASE}/media/folders`, () => problem(409, 'FOLDER_NAME_TAKEN')));
    renderPage(FOLDER.journey);
    await user.click(await screen.findByRole('button', { name: 'Thư mục mới' }));
    const dialog = screen.getByRole('dialog', { name: 'Thư mục mới' });
    await user.type(within(dialog).getByRole('textbox', { name: 'Tên thư mục' }), '2024');
    await user.click(within(dialog).getByRole('button', { name: 'Tạo' }));
    expect(await within(dialog).findByText('Đã có thư mục cùng tên ở đây.')).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Thư mục mới' })).toBeInTheDocument();
  });

  it('disables "Thư mục mới" under a depth-5 folder and without media.update', async () => {
    serveLibrary();
    const { unmount } = renderPage(DEEP);
    const button = await screen.findByRole('button', { name: 'Thư mục mới' });
    await waitFor(() => {
      expect(button).toBeDisabled();
    });
    expect(button).toHaveAttribute('title', 'Thư mục chỉ lồng tối đa 5 cấp.');
    unmount();

    renderPage(FOLDER.journey, ['media.read']);
    const noPerm = await screen.findByRole('button', { name: 'Thư mục mới' });
    expect(noPerm).toBeDisabled();
    expect(noPerm.getAttribute('title')).toMatch(/^Bạn không có quyền/);
  });

  it('shows folder actions only when a real folder is selected', async () => {
    serveLibrary();
    const { router } = renderPage(null);
    await screen.findByRole('button', { name: 'Thư mục mới' });
    expect(screen.queryByRole('button', { name: 'Đổi tên' })).not.toBeInTheDocument();
    await router.navigate('/media?folder=root');
    expect(screen.queryByRole('button', { name: 'Đổi tên' })).not.toBeInTheDocument();
    await router.navigate(`/media?folder=${folderId(99)}`);
    expect(screen.queryByRole('button', { name: 'Đổi tên' })).not.toBeInTheDocument();
    await router.navigate(`/media?folder=${FOLDER.journey}`);
    expect(await screen.findByRole('button', { name: 'Đổi tên' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Chuyển tới…' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Xoá' })).toBeInTheDocument();
  });

  it('renames with { version, name }', async () => {
    const user = userEvent.setup();
    serveLibrary();
    const bodies: unknown[] = [];
    server.use(
      mock.patch(`${BASE}/media/folders/:id`, async ({ request }) => {
        bodies.push(await bodyOf(request));
        return HttpResponse.json({ ...folderFixtures[2], name: 'Hành trình mới' });
      }),
    );
    renderPage(FOLDER.journey);
    await user.click(await screen.findByRole('button', { name: 'Đổi tên' }));
    const dialog = screen.getByRole('dialog', { name: 'Đổi tên thư mục' });
    const field = within(dialog).getByRole('textbox', { name: 'Tên thư mục' });
    expect(field).toHaveValue('Hành trình');
    await user.clear(field);
    await user.type(field, 'Hành trình mới');
    await user.click(within(dialog).getByRole('button', { name: 'Lưu' }));
    expect(await screen.findByText('Đã đổi tên thư mục')).toBeInTheDocument();
    expect(bodies).toEqual([{ version: 1, name: 'Hành trình mới' }]);
  });

  it('moves with { version, parentId }; FOLDER_TOO_DEEP toasts and keeps the dialog', async () => {
    const user = userEvent.setup();
    serveLibrary();
    const bodies: unknown[] = [];
    server.use(
      mock.patch(`${BASE}/media/folders/:id`, async ({ request }) => {
        bodies.push(await bodyOf(request));
        return bodies.length === 1
          ? problem(422, 'FOLDER_TOO_DEEP')
          : HttpResponse.json({ ...folderFixtures[3], parentId: FOLDER.posts });
      }),
    );
    renderPage(FOLDER.team);
    await user.click(await screen.findByRole('button', { name: 'Chuyển tới…' }));
    const dialog = screen.getByRole('dialog', { name: 'Chuyển thư mục Đội ngũ tới' });
    await user.click(within(dialog).getByRole('radio', { name: /^Bài đăng/ }));
    await user.click(within(dialog).getByRole('button', { name: 'Chuyển' }));
    expect(await screen.findByText('Thư mục chỉ lồng tối đa 5 cấp.')).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Chuyển thư mục Đội ngũ tới' })).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Chuyển' }));
    expect(await screen.findByText('Đã chuyển thư mục')).toBeInTheDocument();
    expect(bodies).toEqual([
      { version: 1, parentId: FOLDER.posts },
      { version: 1, parentId: FOLDER.posts },
    ]);
  });

  it('disables "Xoá" for a folder with images, with a tooltip', async () => {
    serveLibrary();
    renderPage(FOLDER.team);
    const button = await screen.findByRole('button', { name: 'Xoá' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('title', 'Thư mục còn ảnh hoặc thư mục con.');
  });

  it('deletes an empty folder with ?version= and selects its parent', async () => {
    const user = userEvent.setup();
    serveLibrary();
    const versions: (string | null)[] = [];
    server.use(
      mock.delete(`${BASE}/media/folders/:id`, ({ request }) => {
        versions.push(new URL(request.url).searchParams.get('version'));
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const { router } = renderPage(EMPTY);
    await user.click(await screen.findByRole('button', { name: 'Xoá' }));
    const dialog = screen.getByRole('dialog', { name: 'Xoá thư mục Nháp?' });
    expect(within(dialog).getByText('Thư mục trống sẽ bị xoá.')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Xoá' }));
    expect(await screen.findByText('Đã xoá thư mục')).toBeInTheDocument();
    expect(versions).toEqual(['4']);
    await waitFor(() => {
      expect(router.state.location.search).toBe(`?folder=${FOLDER.posts}`);
    });
  });

  it('deleting a top-level folder returns to all images', async () => {
    const user = userEvent.setup();
    serveLibrary();
    server.use(
      mock.delete(`${BASE}/media/folders/:id`, () => new HttpResponse(null, { status: 204 })),
    );
    const { router } = renderPage(FOLDER.services);
    await user.click(await screen.findByRole('button', { name: 'Xoá' }));
    await user.click(
      within(screen.getByRole('dialog', { name: 'Xoá thư mục Dịch vụ?' })).getByRole('button', {
        name: 'Xoá',
      }),
    );
    await waitFor(() => {
      expect(router.state.location.search).toBe('');
    });
  });

  it('FOLDER_NOT_EMPTY on delete toasts the message', async () => {
    const user = userEvent.setup();
    serveLibrary();
    server.use(mock.delete(`${BASE}/media/folders/:id`, () => problem(409, 'FOLDER_NOT_EMPTY')));
    renderPage(FOLDER.services);
    await user.click(await screen.findByRole('button', { name: 'Xoá' }));
    await user.click(
      within(screen.getByRole('dialog', { name: 'Xoá thư mục Dịch vụ?' })).getByRole('button', {
        name: 'Xoá',
      }),
    );
    expect(await screen.findByText('Thư mục còn ảnh hoặc thư mục con.')).toBeInTheDocument();
  });
});
