import type { Res } from '@/shared/api/types';

type MediaList = Res<'/admin/v1/media', 'get', 200>;

export function mediaItem(n: number): MediaList['items'][number] {
  const id = `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
  return {
    id,
    folderId: null,
    name: `anh-${String(n)}.jpg`,
    alt: n % 2 === 0 ? `Mô tả ${String(n)}` : '',
    format: 'jpeg',
    width: 1200,
    height: 800,
    bytes: 120_000,
    url: `https://cdn.lapbee.test/media/${String(n)}.jpg`,
    thumbUrl: `https://cdn.lapbee.test/media/${String(n)}-400.jpg`,
    uploadedBy: null,
    createdAt: '2026-01-02T03:04:00Z',
    updatedAt: '2026-01-02T03:04:00Z',
    version: 1,
  } satisfies MediaList['items'][number];
}

export const mediaListFixture = {
  items: [mediaItem(1), mediaItem(2), mediaItem(3)],
  total: 3,
  page: 1,
  perPage: 40,
} satisfies MediaList;
