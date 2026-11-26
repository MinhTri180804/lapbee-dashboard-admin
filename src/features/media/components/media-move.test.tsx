import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http as mock, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { FOLDER, foldersFixture, mediaItem } from '@/test/fixtures/media';
import { server } from '@/test/msw/server';
import { renderWithProviders } from '@/test/render';
import { createQueryClient } from '@/app/query-client';
import { mediaKeys } from '../model/adapters';
import { buildFolderTree } from '../model/folder-tree';
import { MediaLibraryPage } from '../pages/MediaLibraryPage';
import { MoveDialog } from './MoveDialog';

const BASE = 'http://localhost/admin/v1';

function serveLibrary(count = 3) {
  let lists = 0;
  let ids = Array.from({ length: count }, (_, i) => i + 1);
  server.use(
    mock.get(`${BASE}/media/folders`, () => HttpResponse.json(foldersFixture)),
    mock.get(`${BASE}/media`, ({ request }) => {
      const sp = new URL(request.url).searchParams;
      if (sp.get('perPage') === '1') {
        return HttpResponse.json({ items: [], total: 26, page: 1, perPage: 1 });
      }
      lists += 1;
      return HttpResponse.json({
        items: ids.map((n) => mediaItem(n)),
        total: ids.length,
        page: 1,
        perPage: 40,
      });
    }),
  );
  return {
    lists: () => lists,
    show: (...next: number[]) => {
      ids = next;
    },
  };
}

function serveMove(moved = 2) {
  const bodies: unknown[] = [];
  server.use(
    mock.post(`${BASE}/media/move`, async ({ request }) => {
      bodies.push(await request.json());
      return HttpResponse.json({ moved });
    }),
  );
  return bodies;
}

function renderPage(route = '/media', permissions: string[] = ['*']) {
  return renderWithProviders(<MediaLibraryPage />, { route, session: { permissions } });
}

async function checkTwo(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole('checkbox', { name: 'Chọn anh-1.jpg' }));
  await user.click(screen.getByRole('checkbox', { name: 'Chọn anh-2.jpg' }));
}

describe('multi-select and move', () => {
  it('moves the checked images to a folder, then clears the selection and reloads', async () => {
    const user = userEvent.setup();
    const lib = serveLibrary();
    const bodies = serveMove(2);
    renderPage();
    await checkTwo(user);
    expect(screen.getByText('2 ảnh đã chọn')).toBeInTheDocument();
    const before = lib.lists();

    await user.click(screen.getByRole('button', { name: 'Chuyển tới…' }));
    const dialog = screen.getByRole('dialog', { name: 'Chuyển 2 ảnh tới' });
    const move = within(dialog).getByRole('button', { name: 'Chuyển' });
    expect(move).toBeDisabled();
    await user.click(within(dialog).getByRole('radio', { name: /^Phòng sạch/ }));
    expect(move).toBeEnabled();
    await user.click(move);

    expect(await screen.findByText('Đã chuyển 2 ảnh')).toBeInTheDocument();
    expect(bodies).toEqual([
      { ids: [mediaItem(1).id, mediaItem(2).id], folderId: FOLDER.cleanRoom },
    ]);
    expect(screen.queryByText('2 ảnh đã chọn')).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Chọn anh-1.jpg' })).not.toBeChecked();
    await waitFor(() => {
      expect(lib.lists()).toBeGreaterThan(before);
    });
  });

  it('moves to the library root with folderId null', async () => {
    const user = userEvent.setup();
    serveLibrary();
    const bodies = serveMove(2);
    renderPage();
    await checkTwo(user);
    await user.click(screen.getByRole('button', { name: 'Chuyển tới…' }));
    const dialog = screen.getByRole('dialog', { name: 'Chuyển 2 ảnh tới' });
    await user.click(within(dialog).getByRole('radio', { name: /^Gốc thư viện/ }));
    await user.click(within(dialog).getByRole('button', { name: 'Chuyển' }));
    expect(await screen.findByText('Đã chuyển 2 ảnh')).toBeInTheDocument();
    expect(bodies).toEqual([{ ids: [mediaItem(1).id, mediaItem(2).id], folderId: null }]);
  });

  it('checking does not open the panel; "Bỏ chọn" clears', async () => {
    const user = userEvent.setup();
    serveLibrary();
    renderPage();
    await checkTwo(user);
    expect(screen.queryByRole('complementary', { name: 'Chi tiết ảnh' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Bỏ chọn' }));
    expect(screen.queryByText('2 ảnh đã chọn')).not.toBeInTheDocument();
  });

  it('clears the selection when the folder changes', async () => {
    const user = userEvent.setup();
    serveLibrary();
    renderPage();
    await checkTwo(user);
    await user.click(await screen.findByRole('button', { name: /^Hành trình/ }));
    await waitFor(() => {
      expect(screen.queryByText('2 ảnh đã chọn')).not.toBeInTheDocument();
    });
  });

  it('disables "Chuyển tới…" with a tooltip without media.update', async () => {
    const user = userEvent.setup();
    serveLibrary();
    renderPage('/media', ['media.read']);
    await checkTwo(user);
    const button = screen.getByRole('button', { name: 'Chuyển tới…' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('title', 'Bạn không có quyền chuyển ảnh');
  });

  it('caps the selection at 100 images', async () => {
    serveLibrary(101);
    renderPage();
    await screen.findByRole('checkbox', { name: 'Chọn anh-1.jpg' });
    const boxes = screen.getAllByRole('checkbox');
    for (const box of boxes.slice(0, 100)) fireEvent.click(box);
    expect(screen.getByText('100 ảnh đã chọn')).toBeInTheDocument();
    expect(screen.getByText('Chọn tối đa 100 ảnh một lần.')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Chọn anh-101.jpg' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'Chọn anh-1.jpg' })).toBeEnabled();
  });

  it('drops a checked image that left the list from the count and the request', async () => {
    const user = userEvent.setup();
    const lib = serveLibrary();
    const bodies = serveMove(1);
    const queryClient = createQueryClient();
    renderWithProviders(<MediaLibraryPage />, {
      route: '/media',
      session: { permissions: ['*'] },
      queryClient,
    });
    await checkTwo(user);
    expect(screen.getByText('2 ảnh đã chọn')).toBeInTheDocument();
    lib.show(2, 3);
    await act(async () => {
      await queryClient.invalidateQueries({ queryKey: mediaKeys.all });
    });
    expect(await screen.findByText('1 ảnh đã chọn')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Chuyển tới…' }));
    const dialog = screen.getByRole('dialog', { name: 'Chuyển 1 ảnh tới' });
    await user.click(within(dialog).getByRole('radio', { name: /^Gốc thư viện/ }));
    await user.click(within(dialog).getByRole('button', { name: 'Chuyển' }));
    await screen.findByText('Đã chuyển 1 ảnh');
    expect(bodies).toEqual([{ ids: [mediaItem(2).id], folderId: null }]);
  });

  it('sends one request on a double click of "Chuyển"', async () => {
    const user = userEvent.setup();
    serveLibrary();
    let posts = 0;
    server.use(
      mock.post(`${BASE}/media/move`, async () => {
        posts += 1;
        await new Promise((r) => setTimeout(r, 100));
        return HttpResponse.json({ moved: 2 });
      }),
    );
    renderPage();
    await checkTwo(user);
    await user.click(screen.getByRole('button', { name: 'Chuyển tới…' }));
    const dialog = screen.getByRole('dialog', { name: 'Chuyển 2 ảnh tới' });
    await user.click(within(dialog).getByRole('radio', { name: /^Gốc thư viện/ }));
    await user.dblClick(within(dialog).getByRole('button', { name: 'Chuyển' }));
    await screen.findByText('Đã chuyển 2 ảnh');
    expect(posts).toBe(1);
  });

  it('marks "Hiện tại" only for a real folder or the root, not in "Tất cả ảnh"', async () => {
    const user = userEvent.setup();
    serveLibrary();
    const view = renderPage();
    await checkTwo(user);
    await user.click(screen.getByRole('button', { name: 'Chuyển tới…' }));
    const all = screen.getByRole('dialog', { name: 'Chuyển 2 ảnh tới' });
    expect(within(all).queryByText('Hiện tại')).not.toBeInTheDocument();
    view.unmount();

    renderPage('/media?folder=root');
    await checkTwo(user);
    await user.click(screen.getByRole('button', { name: 'Chuyển tới…' }));
    const root = screen.getByRole('dialog', { name: 'Chuyển 2 ảnh tới' });
    expect(
      within(root).getByRole('radio', { name: /^Gốc thư viện.*Hiện tại/ }),
    ).toBeInTheDocument();
  });
});

describe('MoveDialog', () => {
  const tree = buildFolderTree(foldersFixture.items);

  function renderDialog(props: { movingFolderId: string | null; currentFolderId?: string | null }) {
    const onConfirm = vi.fn();
    renderWithProviders(
      <MoveDialog
        open
        title="Chuyển thư mục tới"
        tree={tree}
        movingFolderId={props.movingFolderId}
        currentFolderId={props.currentFolderId ?? null}
        onClose={() => undefined}
        onConfirm={onConfirm}
      />,
    );
    return onConfirm;
  }

  it('lists only valid targets for a folder', async () => {
    const user = userEvent.setup();
    const onConfirm = renderDialog({ movingFolderId: FOLDER.journey });
    // Itself, its subtree and its current parent (the root) are not offered.
    expect(screen.queryByRole('radio', { name: /^Hành trình/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: /^2024/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: /^Phòng sạch/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: /^Gốc thư viện/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: /^Dịch vụ/ }));
    await user.click(screen.getByRole('button', { name: 'Chuyển' }));
    expect(onConfirm).toHaveBeenCalledWith(FOLDER.services);
  });

  it('shows the parent path so equal names can be told apart', () => {
    renderDialog({ movingFolderId: null });
    expect(
      screen.getByRole('radio', { name: /^Phòng sạch.*Hành trình \/ 2024/ }),
    ).toBeInTheDocument();
  });
});
