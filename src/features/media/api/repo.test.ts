import { http as mock, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { mediaItem } from '@/test/fixtures/media';
import { server } from '@/test/msw/server';
import { mediaRepo } from './repo';

const BASE = 'http://localhost/admin/v1';

async function captureUpload(opts: { folderId?: string }) {
  let form: FormData | undefined;
  server.use(
    mock.post(`${BASE}/media`, async ({ request }) => {
      form = await request.formData();
      return HttpResponse.json(mediaItem(1), { status: 201 });
    }),
  );
  await mediaRepo.upload(new File(['x'], 'a.png', { type: 'image/png' }), opts);
  return form;
}

describe('mediaRepo', () => {
  it('uploads multipart with file and folderId', async () => {
    const form = await captureUpload({ folderId: 'f-1' });
    const file = form?.get('file');
    expect(typeof file).toBe('object');
    expect(file).toMatchObject({ name: 'a.png', size: 1 });
    expect(form?.get('folderId')).toBe('f-1');
  });

  it('omits folderId when none is given', async () => {
    const form = await captureUpload({});
    expect(form?.has('folderId')).toBe(false);
  });

  it('removes with ?version=', async () => {
    const urls: URL[] = [];
    server.use(
      mock.delete(`${BASE}/media/m-1`, ({ request }) => {
        urls.push(new URL(request.url));
        return new HttpResponse(null, { status: 204 });
      }),
      mock.delete(`${BASE}/media/folders/f-1`, ({ request }) => {
        urls.push(new URL(request.url));
        return new HttpResponse(null, { status: 204 });
      }),
    );
    await mediaRepo.remove('m-1', 3);
    await mediaRepo.folders.remove('f-1', 4);
    expect(urls.map((u) => u.searchParams.get('version'))).toEqual(['3', '4']);
  });

  it('moves, patches and lists folders', async () => {
    const bodies: unknown[] = [];
    server.use(
      mock.post(`${BASE}/media/move`, async ({ request }) => {
        bodies.push(await request.json());
        return HttpResponse.json({ moved: 2 });
      }),
      mock.patch(`${BASE}/media/m-1`, async ({ request }) => {
        bodies.push(await request.json());
        return HttpResponse.json(mediaItem(1));
      }),
      mock.get(`${BASE}/media/folders`, () => HttpResponse.json({ items: [] })),
    );
    expect(await mediaRepo.move(['a', 'b'], null)).toEqual({ moved: 2 });
    await mediaRepo.update('m-1', { version: 1, name: 'x' });
    expect(bodies).toEqual([
      { ids: ['a', 'b'], folderId: null },
      { version: 1, name: 'x' },
    ]);
    expect(await mediaRepo.folders.list()).toEqual([]);
  });
});
