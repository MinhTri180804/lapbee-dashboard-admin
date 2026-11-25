import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http as mock, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { createQueryClient } from '@/app/query-client';
import {
  FOLDER,
  foldersFixture,
  mediaDetail,
  mediaItem,
  usedMediaDetail,
} from '@/test/fixtures/media';
import { problem } from '@/test/msw/problem';
import { server } from '@/test/msw/server';
import { renderWithProviders } from '@/test/render';
import { mediaKeys } from '../model/adapters';
import { MediaLibraryPage } from '../pages/MediaLibraryPage';

const BASE = 'http://localhost/admin/v1';
const ID = mediaItem(1).id;

type Detail = ReturnType<typeof mediaDetail>;

/** Serves the library around the panel and `GET /media/:id` from `detail()`; records gets. */
function serve(detail: () => Detail | Response = () => mediaDetail(1)) {
  const gets: string[] = [];
  server.use(
    mock.get(`${BASE}/media/folders`, () => HttpResponse.json(foldersFixture)),
    mock.get(`${BASE}/media`, () =>
      HttpResponse.json({
        items: [mediaItem(1), mediaItem(2)],
        total: 2,
        page: 1,
        perPage: 40,
      }),
    ),
    mock.get(`${BASE}/media/:id`, ({ params }) => {
      gets.push(String(params.id));
      const d = detail();
      return d instanceof Response ? d : HttpResponse.json(d);
    }),
  );
  return gets;
}

/** Records PATCH bodies; `reply(n)` answers the n-th (1-based) call. */
function servePatch(reply: (n: number, body: Record<string, unknown>) => Response) {
  const bodies: Record<string, unknown>[] = [];
  server.use(
    mock.patch(`${BASE}/media/:id`, async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>;
      bodies.push(body);
      return reply(bodies.length, body);
    }),
  );
  return bodies;
}

/** A PATCH answer: the image without `usages`. */
function ok(d: Detail) {
  return HttpResponse.json(Object.fromEntries(Object.entries(d).filter(([k]) => k !== 'usages')));
}

function renderPanel(
  route = `/media?id=${ID}`,
  permissions: string[] = ['*'],
  queryClient = createQueryClient(),
) {
  return renderWithProviders(<MediaLibraryPage />, {
    route,
    session: { permissions },
    queryClient,
  });
}

function panel() {
  return screen.getByRole('complementary', { name: 'Chi tiết ảnh' });
}

describe('MediaDetailPanel', () => {
  it('opens ?id from the URL and shows the image, meta, folder and usages', async () => {
    const gets = serve(() => usedMediaDetail);
    renderPanel();
    expect(await screen.findByText('JPG · 800 × 1000 · 214 KB · 02.03.2026')).toBeInTheDocument();
    expect(gets).toEqual([ID]);
    const p = panel();
    expect(within(p).getByRole('heading', { name: 'anh-1.jpg' })).toBeInTheDocument();
    expect(
      within(p).getByRole('img', { name: 'Nguyễn Minh Khoa, nhà sáng lập LAPBEE' }),
    ).toHaveAttribute('src', mediaItem(1).url);
    expect(within(p).getByLabelText('Tên ảnh')).toHaveValue('anh-1.jpg');
    expect(within(p).getByLabelText('Văn bản thay thế')).toHaveValue(
      'Nguyễn Minh Khoa, nhà sáng lập LAPBEE',
    );
    expect(within(p).getByText('Tự điền vào alt khi chèn ảnh vào bài viết.')).toBeInTheDocument();
    expect(within(p).getByText('37 / 300 ký tự')).toBeInTheDocument();

    const folder = within(p).getByLabelText('Thư mục');
    await waitFor(() => {
      expect(folder).toHaveDisplayValue('Hành trình / 2024');
    });
    expect(within(p).getByRole('option', { name: 'Gốc thư viện' })).toBeInTheDocument();
    expect(
      within(p).getByRole('option', { name: 'Hành trình / 2024 / Phòng sạch' }),
    ).toBeInTheDocument();

    expect(within(p).getByText('Đang dùng ở')).toBeInTheDocument();
    expect(within(p).getByText('Đội ngũ · Nguyễn Minh Khoa')).toBeInTheDocument();
    const del = within(p).getByRole('button', { name: 'Xoá ảnh' });
    expect(del).toBeDisabled();
    expect(del).toHaveAttribute('title', 'Ảnh đang được dùng, không xoá được.');
    expect(within(p).getByRole('button', { name: 'Lưu thay đổi' })).toBeDisabled();
  });

  it('says when the image is not used anywhere', async () => {
    serve();
    renderPanel();
    expect(await screen.findByText('Chưa được dùng ở đâu.')).toBeInTheDocument();
    expect(within(panel()).getByRole('button', { name: 'Xoá ảnh' })).toBeEnabled();
  });

  it('saves only the changed field with the version the panel opened with', async () => {
    const user = userEvent.setup();
    serve();
    const bodies = servePatch((_n, body) =>
      ok(mediaDetail(1, { alt: String(body.alt), version: 4 })),
    );
    const { queryClient } = renderPanel();
    const alt = await screen.findByLabelText('Văn bản thay thế');
    await user.clear(alt);
    await user.type(alt, 'Chân dung Minh Khoa');
    // A background refetch moved the cache to v5: the save still sends the opened v3.
    act(() => {
      queryClient.setQueryData(mediaKeys.detail(ID), mediaDetail(1, { version: 5 }));
    });
    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));
    expect(await screen.findByText('Đã lưu ảnh')).toBeInTheDocument();
    expect(bodies).toEqual([{ version: 3, alt: 'Chân dung Minh Khoa' }]);
  });

  it('after a version conflict, "Tải lại" keeps the typed alt and the next save sends the new version', async () => {
    const user = userEvent.setup();
    let current = mediaDetail(1);
    serve(() => current);
    const bodies = servePatch((n, body) =>
      n === 1
        ? problem(409, 'VERSION_CONFLICT')
        : ok(mediaDetail(1, { name: 'khoa.jpg', alt: String(body.alt), version: 5 })),
    );
    renderPanel();
    const alt = await screen.findByLabelText('Văn bản thay thế');
    await user.clear(alt);
    await user.type(alt, 'Chân dung Minh Khoa');
    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));

    const dialog = await screen.findByRole('dialog', { name: 'Dữ liệu đã thay đổi ở nơi khác' });
    // Someone renamed the image meanwhile.
    current = mediaDetail(1, { name: 'khoa.jpg', version: 4 });
    await user.click(within(dialog).getByRole('button', { name: 'Tải lại' }));
    expect(await screen.findByDisplayValue('khoa.jpg')).toBeInTheDocument();
    expect(screen.getByLabelText('Văn bản thay thế')).toHaveValue('Chân dung Minh Khoa');

    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));
    expect(await screen.findByText('Đã lưu ảnh')).toBeInTheDocument();
    expect(bodies).toEqual([
      { version: 3, alt: 'Chân dung Minh Khoa' },
      { version: 4, alt: 'Chân dung Minh Khoa' },
    ]);
  });

  it('moves the image at once and keeps unsaved edits on the new version', async () => {
    const user = userEvent.setup();
    serve();
    const bodies = servePatch((n, body) =>
      n === 1
        ? ok(mediaDetail(1, { folderId: FOLDER.cleanRoom, version: 4 }))
        : ok(mediaDetail(1, { folderId: FOLDER.cleanRoom, name: String(body.name), version: 5 })),
    );
    renderPanel();
    const name = await screen.findByLabelText('Tên ảnh');
    await user.clear(name);
    await user.type(name, 'khoa.jpg');
    const folder = screen.getByLabelText('Thư mục');
    await waitFor(() => {
      expect(folder).toHaveDisplayValue('Hành trình / 2024');
    });
    await user.selectOptions(folder, 'Hành trình / 2024 / Phòng sạch');
    expect(await screen.findByText('Đã chuyển ảnh')).toBeInTheDocument();
    expect(bodies[0]).toEqual({ version: 3, folderId: FOLDER.cleanRoom });
    expect(folder).toHaveDisplayValue('Hành trình / 2024 / Phòng sạch');
    expect(screen.getByLabelText('Tên ảnh')).toHaveValue('khoa.jpg');

    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));
    expect(await screen.findByText('Đã lưu ảnh')).toBeInTheDocument();
    expect(bodies[1]).toEqual({ version: 4, name: 'khoa.jpg' });
  });

  it('moves the image to the library root with folderId null', async () => {
    const user = userEvent.setup();
    serve();
    const bodies = servePatch(() => ok(mediaDetail(1, { folderId: null, version: 4 })));
    renderPanel();
    const folder = await screen.findByLabelText('Thư mục');
    await waitFor(() => {
      expect(folder).toHaveDisplayValue('Hành trình / 2024');
    });
    await user.selectOptions(folder, 'Gốc thư viện');
    expect(await screen.findByText('Đã chuyển ảnh')).toBeInTheDocument();
    expect(bodies).toEqual([{ version: 3, folderId: null }]);
  });

  it('deletes an unused image after confirming and closes the panel', async () => {
    const user = userEvent.setup();
    const gets = serve();
    const versions: (string | null)[] = [];
    server.use(
      mock.delete(`${BASE}/media/:id`, ({ request }) => {
        versions.push(new URL(request.url).searchParams.get('version'));
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const { router } = renderPanel(`/media?folder=${FOLDER.y2024}&id=${ID}`);
    await screen.findByText('Chưa được dùng ở đâu.');
    await user.click(screen.getByRole('button', { name: 'Xoá ảnh' }));
    const dialog = screen.getByRole('dialog', { name: 'Xoá ảnh anh-1.jpg?' });
    expect(
      within(dialog).getByText('Ảnh bị xoá khỏi thư viện và không lấy lại được.'),
    ).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Xoá' }));

    expect(await screen.findByText('Đã xoá ảnh')).toBeInTheDocument();
    expect(versions).toEqual(['3']);
    expect(router.state.location.search).toBe(`?folder=${FOLDER.y2024}`);
    await waitFor(() => {
      expect(screen.queryByRole('complementary', { name: 'Chi tiết ảnh' })).not.toBeInTheDocument();
    });
    // The deleted image is never fetched again.
    expect(gets).toEqual([ID]);
  });

  it('on MEDIA_IN_USE says so and reloads the detail', async () => {
    const user = userEvent.setup();
    let current = mediaDetail(1);
    const gets = serve(() => current);
    server.use(mock.delete(`${BASE}/media/:id`, () => problem(409, 'MEDIA_IN_USE')));
    renderPanel();
    await screen.findByText('Chưa được dùng ở đâu.');
    current = usedMediaDetail;
    await user.click(screen.getByRole('button', { name: 'Xoá ảnh' }));
    await user.click(
      within(screen.getByRole('dialog', { name: 'Xoá ảnh anh-1.jpg?' })).getByRole('button', {
        name: 'Xoá',
      }),
    );
    expect(await screen.findByText('Ảnh đang được dùng, không xoá được.')).toBeInTheDocument();
    expect(await screen.findByText('Đội ngũ · Nguyễn Minh Khoa')).toBeInTheDocument();
    expect(gets.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByRole('button', { name: 'Xoá ảnh' })).toBeDisabled();
  });

  it('shows the not-found state for an unknown id and closes from it', async () => {
    const user = userEvent.setup();
    serve(() => problem(404, 'NOT_FOUND'));
    const { router } = renderPanel();
    expect(await screen.findByText('Không tìm thấy ảnh này.')).toBeInTheDocument();
    await user.click(within(panel()).getByRole('button', { name: 'Đóng' }));
    expect(router.state.location.search).toBe('');
  });

  it('closes with the close button', async () => {
    const user = userEvent.setup();
    serve();
    const { router } = renderPanel(`/media?view=unused&id=${ID}`);
    await screen.findByText('Chưa được dùng ở đâu.');
    await user.click(within(panel()).getByRole('button', { name: 'Đóng' }));
    expect(router.state.location.search).toBe('?view=unused');
  });

  it('is read-only without media.update and media.delete', async () => {
    serve();
    renderPanel(`/media?id=${ID}`, ['media.read']);
    const name = await screen.findByLabelText('Tên ảnh');
    expect(name).toHaveAttribute('readonly');
    expect(screen.getByLabelText('Văn bản thay thế')).toHaveAttribute('readonly');
    const folder = screen.getByLabelText('Thư mục');
    expect(folder).toBeDisabled();
    expect(folder.closest('[title]')).toHaveAttribute('title', 'Bạn không có quyền sửa ảnh');
    const save = screen.getByRole('button', { name: 'Lưu thay đổi' });
    expect(save).toBeDisabled();
    expect(save).toHaveAttribute('title', 'Bạn không có quyền sửa ảnh');
    const del = screen.getByRole('button', { name: 'Xoá ảnh' });
    expect(del).toBeDisabled();
    expect(del).toHaveAttribute('title', 'Bạn không có quyền xoá ảnh');
  });

  it('blocks delete while a move is in flight and the folder and save while a delete is', async () => {
    const user = userEvent.setup();
    serve();
    let release: () => void = () => undefined;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    server.use(
      mock.patch(`${BASE}/media/:id`, async () => {
        await gate;
        return ok(mediaDetail(1, { folderId: null, version: 4 }));
      }),
    );
    renderPanel();
    const folder = await screen.findByLabelText('Thư mục');
    await waitFor(() => {
      expect(folder).toHaveDisplayValue('Hành trình / 2024');
    });
    await user.selectOptions(folder, 'Gốc thư viện');
    expect(screen.getByRole('button', { name: 'Xoá ảnh' })).toBeDisabled();
    release();
    await screen.findByText('Đã chuyển ảnh');
    expect(screen.getByRole('button', { name: 'Xoá ảnh' })).toBeEnabled();

    let finish: () => void = () => undefined;
    const hold = new Promise<void>((resolve) => {
      finish = resolve;
    });
    server.use(
      mock.delete(`${BASE}/media/:id`, async () => {
        await hold;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    await user.click(screen.getByRole('button', { name: 'Xoá ảnh' }));
    await user.click(
      within(screen.getByRole('dialog', { name: 'Xoá ảnh anh-1.jpg?' })).getByRole('button', {
        name: 'Xoá',
      }),
    );
    await waitFor(() => {
      expect(screen.getByLabelText('Thư mục')).toBeDisabled();
    });
    finish();
  });

  it('starts fresh when another image is opened', async () => {
    const user = userEvent.setup();
    serve();
    server.use(
      mock.get(`${BASE}/media/${mediaItem(2).id}`, () =>
        HttpResponse.json(mediaDetail(2, { alt: 'Ảnh hai' })),
      ),
    );
    renderPanel();
    const alt = await screen.findByLabelText('Văn bản thay thế');
    await user.clear(alt);
    await user.type(alt, 'Đang gõ');
    await user.click(screen.getByRole('button', { name: 'anh-2.jpg' }));
    expect(await screen.findByDisplayValue('Ảnh hai')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Lưu thay đổi' })).toBeDisabled();
  });
});
