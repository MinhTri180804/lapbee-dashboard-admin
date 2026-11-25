import { useState } from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http as mock, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FOLDER, foldersFixture, mediaItem, mediaListFixture } from '@/test/fixtures/media';
import { problem } from '@/test/msw/problem';
import { server } from '@/test/msw/server';
import { renderWithProviders } from '@/test/render';
import { MediaPicker } from './MediaPicker';

const BASE = 'http://localhost/admin/v1';
const READ = ['media.read'];
const UPLOAD = ['media.read', 'media.upload'];

function setup(permissions: string[], props: { onPick?: () => void } = {}) {
  const onPick = vi.fn(props.onPick);
  const onClose = vi.fn();
  renderWithProviders(<MediaPicker open onClose={onClose} onPick={onPick} />, {
    session: { permissions },
  });
  return { onPick, onClose };
}

beforeEach(() => {
  server.use(mock.get(`${BASE}/media/folders`, () => HttpResponse.json(foldersFixture)));
});

describe('MediaPicker', () => {
  it('shows the grid from the list and picks a MediaThumb', async () => {
    const urls: URL[] = [];
    server.use(
      mock.get(`${BASE}/media`, ({ request }) => {
        urls.push(new URL(request.url));
        return HttpResponse.json(mediaListFixture);
      }),
    );
    const user = userEvent.setup();
    const { onPick } = setup(READ);
    const img = await screen.findByAltText('anh-1.jpg');
    expect(img).toHaveAttribute('src', 'https://cdn.lapbee.test/media/1-400.jpg');
    expect(screen.getByAltText('Mô tả 2')).toBeInTheDocument();
    expect(urls[0]?.searchParams.get('perPage')).toBe('40');
    expect(urls[0]?.searchParams.get('page')).toBe('1');
    await user.click(img);
    expect(onPick).toHaveBeenCalledWith({
      id: mediaListFixture.items[0]?.id,
      url: 'https://cdn.lapbee.test/media/1.jpg',
      thumbUrl: 'https://cdn.lapbee.test/media/1-400.jpg',
      width: 1200,
      height: 800,
      alt: '',
      name: 'anh-1.jpg',
    });
  });

  it('sends q after typing in the search box', async () => {
    const qs: (string | null)[] = [];
    server.use(
      mock.get(`${BASE}/media`, ({ request }) => {
        qs.push(new URL(request.url).searchParams.get('q'));
        return HttpResponse.json(mediaListFixture);
      }),
    );
    const user = userEvent.setup();
    setup(READ);
    await screen.findByAltText('anh-1.jpg');
    await user.type(screen.getByLabelText('Tìm trong thư viện'), 'mac');
    await waitFor(() => {
      expect(qs).toContain('mac');
    });
  });

  it('loads the next page with Xem thêm', async () => {
    server.use(
      mock.get(`${BASE}/media`, ({ request }) => {
        const page = Number(new URL(request.url).searchParams.get('page'));
        return HttpResponse.json({
          items: [mediaItem(page * 10)],
          total: 2,
          page,
          perPage: 1,
        });
      }),
    );
    const user = userEvent.setup();
    setup(READ);
    await screen.findByAltText('Mô tả 10');
    await user.click(screen.getByRole('button', { name: 'Tải thêm' }));
    await screen.findByAltText('Mô tả 20');
    expect(screen.getByAltText('Mô tả 10')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Tải thêm' })).not.toBeInTheDocument();
  });

  it('uploads a file as multipart and picks the new image', async () => {
    let fileName = '';
    let contentType = '';
    const created = mediaItem(99);
    let listCalls = 0;
    server.use(
      mock.get(`${BASE}/media`, () => {
        listCalls += 1;
        return HttpResponse.json(mediaListFixture);
      }),
      mock.post(`${BASE}/media`, async ({ request }) => {
        contentType = request.headers.get('content-type') ?? '';
        const f = (await request.formData()).get('file');
        fileName = typeof f === 'object' && f !== null ? f.name : '';
        return HttpResponse.json(created, { status: 201 });
      }),
    );
    const user = userEvent.setup();
    const { onPick } = setup(UPLOAD);
    await screen.findByAltText('anh-1.jpg');
    const callsBefore = listCalls;
    const file = new File(['x'], 'moi.png', { type: 'image/png' });
    await user.upload(screen.getByLabelText('Tải ảnh lên'), file);
    await waitFor(() => {
      expect(onPick).toHaveBeenCalledWith(expect.objectContaining({ id: created.id }));
    });
    await waitFor(() => {
      expect(listCalls).toBeGreaterThan(callsBefore);
    });
    expect(contentType).toContain('multipart/form-data; boundary=');
    expect(fileName).toBe('moi.png');
  });

  it.each([
    [413, 'MEDIA_TOO_LARGE', 'Ảnh vượt quá 10 MB.'],
    [415, 'MEDIA_UNSUPPORTED_TYPE', 'Chỉ nhận ảnh JPEG, PNG, WebP hoặc AVIF.'],
    [422, 'MEDIA_INVALID_IMAGE', 'Ảnh bị hỏng hoặc quá lớn để xử lý.'],
  ])('shows the copy for %s %s', async (status, code, copy) => {
    server.use(
      mock.get(`${BASE}/media`, () => HttpResponse.json(mediaListFixture)),
      mock.post(`${BASE}/media`, () => problem(status, code)),
    );
    const user = userEvent.setup();
    const { onPick } = setup(UPLOAD);
    await screen.findByAltText('anh-1.jpg');
    await user.upload(
      screen.getByLabelText('Tải ảnh lên'),
      new File(['x'], 'a.png', { type: 'image/png' }),
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(copy);
    expect(onPick).not.toHaveBeenCalled();
  });

  it('opens a wide dialog that holds the upload control', async () => {
    server.use(mock.get(`${BASE}/media`, () => HttpResponse.json(mediaListFixture)));
    setup(UPLOAD);
    const dialog = screen.getByRole('dialog', { name: 'Chọn ảnh' });
    // jsdom has no layout: the width itself is CSS (`.dialog[data-size='wide']`, a fluid body).
    expect(dialog).toHaveAttribute('data-size', 'wide');
    expect(within(dialog).getByLabelText('Tải ảnh lên')).toBeInTheDocument();
    await screen.findByAltText('anh-1.jpg');
  });

  it('disables the upload control with a tooltip without media.upload', async () => {
    server.use(mock.get(`${BASE}/media`, () => HttpResponse.json(mediaListFixture)));
    setup(READ);
    await screen.findByAltText('anh-1.jpg');
    const input = screen.getByLabelText('Tải ảnh lên');
    expect(input).toBeDisabled();
    expect(input.closest('label')).toHaveAttribute('title', 'Bạn không có quyền tải ảnh lên');
  });

  it('filters by folder, drops folderId when searching, and uploads into the folder', async () => {
    const urls: URL[] = [];
    let uploadFolder: FormDataEntryValue | null = null;
    const created = mediaItem(99);
    server.use(
      mock.get(`${BASE}/media`, ({ request }) => {
        urls.push(new URL(request.url));
        return HttpResponse.json(mediaListFixture);
      }),
      mock.post(`${BASE}/media`, async ({ request }) => {
        uploadFolder = (await request.formData()).get('folderId');
        return HttpResponse.json(created, { status: 201 });
      }),
    );
    const user = userEvent.setup();
    const { onPick } = setup(UPLOAD);
    await screen.findByAltText('anh-1.jpg');
    expect(urls.at(-1)?.searchParams.has('folderId')).toBe(false);
    await user.click(await screen.findByRole('button', { name: 'Đội ngũ' }));
    await waitFor(() => {
      expect(urls.at(-1)?.searchParams.get('folderId')).toBe(FOLDER.team);
    });
    await user.upload(
      screen.getByLabelText('Tải ảnh lên'),
      new File(['x'], 'moi.png', { type: 'image/png' }),
    );
    await waitFor(() => {
      expect(onPick).toHaveBeenCalledWith(expect.objectContaining({ id: created.id }));
    });
    expect(uploadFolder).toBe(FOLDER.team);
    await user.type(screen.getByLabelText('Tìm trong thư viện'), 'mac');
    await waitFor(() => {
      const last = urls.at(-1);
      expect(last?.searchParams.get('q')).toBe('mac');
      expect(last?.searchParams.has('folderId')).toBe(false);
    });
  });

  it('a folder click during a search drops q at once: uploads go to that folder', async () => {
    const urls: URL[] = [];
    let uploadFolder: FormDataEntryValue | null = null;
    server.use(
      mock.get(`${BASE}/media`, ({ request }) => {
        urls.push(new URL(request.url));
        return HttpResponse.json(mediaListFixture);
      }),
      mock.post(`${BASE}/media`, async ({ request }) => {
        uploadFolder = (await request.formData()).get('folderId');
        return HttpResponse.json(mediaItem(99), { status: 201 });
      }),
    );
    const user = userEvent.setup();
    const { onPick } = setup(UPLOAD);
    await screen.findByAltText('anh-1.jpg');
    await user.type(screen.getByLabelText('Tìm trong thư viện'), 'mac');
    await waitFor(() => {
      expect(urls.at(-1)?.searchParams.get('q')).toBe('mac');
    });
    await user.click(screen.getByRole('button', { name: 'Đội ngũ' }));
    // Within the 300 ms debounce: the folder already counts.
    await user.upload(
      screen.getByLabelText('Tải ảnh lên'),
      new File(['x'], 'moi.png', { type: 'image/png' }),
    );
    await waitFor(() => {
      expect(onPick).toHaveBeenCalled();
    });
    expect(uploadFolder).toBe(FOLDER.team);
  });

  it('"Tất cả ảnh" during a search shows every image at once', async () => {
    server.use(
      mock.get(`${BASE}/media`, ({ request }) =>
        new URL(request.url).searchParams.get('q')
          ? HttpResponse.json({ items: [], total: 0, page: 1, perPage: 40 })
          : HttpResponse.json(mediaListFixture),
      ),
    );
    const user = userEvent.setup();
    setup(READ);
    await screen.findByAltText('anh-1.jpg');
    await user.type(screen.getByLabelText('Tìm trong thư viện'), 'mac');
    expect(await screen.findByText('Không tìm thấy ảnh nào.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Tất cả ảnh' }));
    expect(screen.getByLabelText('Tìm trong thư viện')).toHaveValue('');
    // Not after the debounce: the cached full list shows straight away.
    expect(screen.getByAltText('anh-1.jpg')).toBeInTheDocument();
  });

  it.each([
    ['all', 'Chưa có ảnh nào.'],
    ['folder', 'Thư mục này chưa có ảnh.'],
    ['search', 'Không tìm thấy ảnh nào.'],
  ])('says the %s list is empty with its own copy', async (state, copy) => {
    server.use(
      mock.get(`${BASE}/media`, () =>
        HttpResponse.json({ items: [], total: 0, page: 1, perPage: 40 }),
      ),
    );
    const user = userEvent.setup();
    setup(READ);
    expect(await screen.findByText('Chưa có ảnh nào.')).toBeInTheDocument();
    if (state === 'folder') {
      await user.click(await screen.findByRole('button', { name: 'Đội ngũ' }));
    } else if (state === 'search') {
      await user.type(screen.getByLabelText('Tìm trong thư viện'), 'mac');
    }
    expect(await screen.findByText(copy)).toBeInTheDocument();
  });

  it('shows the general copy for an upload error that is not a MEDIA_* code', async () => {
    server.use(
      mock.get(`${BASE}/media`, () => HttpResponse.json(mediaListFixture)),
      mock.post(`${BASE}/media`, () => problem(429, 'RATE_LIMITED')),
    );
    const user = userEvent.setup();
    setup(UPLOAD);
    await screen.findByAltText('anh-1.jpg');
    await user.upload(
      screen.getByLabelText('Tải ảnh lên'),
      new File(['x'], 'a.png', { type: 'image/png' }),
    );
    expect(await screen.findByRole('alert')).toHaveTextContent('Thử lại sau ít phút.');
  });

  it('resets search and folder when closed and reopened', async () => {
    server.use(mock.get(`${BASE}/media`, () => HttpResponse.json(mediaListFixture)));
    const user = userEvent.setup();
    function Harness() {
      const [open, setOpen] = useState(true);
      return (
        <>
          <button
            type="button"
            onClick={() => {
              setOpen((o) => !o);
            }}
          >
            toggle
          </button>
          <MediaPicker open={open} onClose={vi.fn()} onPick={vi.fn()} />
        </>
      );
    }
    renderWithProviders(<Harness />, { session: { permissions: READ } });
    await screen.findByAltText('anh-1.jpg');
    await user.click(await screen.findByRole('button', { name: 'Đội ngũ' }));
    await user.type(screen.getByLabelText('Tìm trong thư viện'), 'mac');
    await user.click(screen.getByRole('button', { name: 'toggle', hidden: true }));
    await user.click(screen.getByRole('button', { name: 'toggle', hidden: true }));
    expect(screen.getByLabelText('Tìm trong thư viện')).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Tất cả ảnh' })).toHaveAttribute('aria-current');
    expect(screen.getByRole('button', { name: 'Đội ngũ' })).not.toHaveAttribute('aria-current');
  });

  it('does not call the API without media.read', async () => {
    let called = false;
    server.use(
      mock.get(`${BASE}/media/folders`, () => {
        called = true;
        return HttpResponse.json(foldersFixture);
      }),
      mock.get(`${BASE}/media`, () => {
        called = true;
        return HttpResponse.json(mediaListFixture);
      }),
    );
    setup(['site.read']);
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.getByText('Bạn không có quyền xem thư viện ảnh.')).toBeInTheDocument();
    expect(within(screen.getByRole('dialog')).queryByLabelText('Tìm trong thư viện')).toBeNull();
    expect(called).toBe(false);
  });

  it('does not call the API while closed', async () => {
    let called = false;
    const hit = () => {
      called = true;
      return HttpResponse.json(mediaListFixture);
    };
    server.use(mock.get(`${BASE}/media`, hit), mock.get(`${BASE}/media/folders`, hit));
    renderWithProviders(<MediaPicker open={false} onClose={vi.fn()} onPick={vi.fn()} />, {
      session: { permissions: UPLOAD },
    });
    await new Promise((r) => setTimeout(r, 50));
    expect(called).toBe(false);
  });
});
