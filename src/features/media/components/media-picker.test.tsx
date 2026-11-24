import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http as mock, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { mediaItem, mediaListFixture } from '@/test/fixtures/media';
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
    await user.click(screen.getByRole('button', { name: 'Xem thêm' }));
    await screen.findByAltText('Mô tả 20');
    expect(screen.getByAltText('Mô tả 10')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Xem thêm' })).not.toBeInTheDocument();
  });

  it('uploads a file as multipart and selects the new image first', async () => {
    let fileName = '';
    let contentType = '';
    const created = mediaItem(99);
    server.use(
      mock.get(`${BASE}/media`, () => HttpResponse.json(mediaListFixture)),
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
    const file = new File(['x'], 'moi.png', { type: 'image/png' });
    await user.upload(screen.getByLabelText('Tải ảnh lên'), file);
    await waitFor(() => {
      expect(onPick).toHaveBeenCalledWith(expect.objectContaining({ id: created.id }));
    });
    expect(contentType).toContain('multipart/form-data; boundary=');
    expect(fileName).toBe('moi.png');
    const imgs = screen.getAllByRole('img');
    expect(imgs[0]).toHaveAttribute('alt', 'anh-99.jpg');
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

  it('hides the upload button without media.upload', async () => {
    server.use(mock.get(`${BASE}/media`, () => HttpResponse.json(mediaListFixture)));
    setup(READ);
    await screen.findByAltText('anh-1.jpg');
    expect(screen.queryByLabelText('Tải ảnh lên')).not.toBeInTheDocument();
  });

  it('does not call the API without media.read', () => {
    let called = false;
    server.use(
      mock.get(`${BASE}/media`, () => {
        called = true;
        return HttpResponse.json(mediaListFixture);
      }),
    );
    setup(['site.read']);
    expect(screen.getByText('Bạn không có quyền xem thư viện ảnh.')).toBeInTheDocument();
    expect(within(screen.getByRole('dialog')).queryByLabelText('Tìm trong thư viện')).toBeNull();
    expect(called).toBe(false);
  });
});
