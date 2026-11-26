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

type FolderList = Res<'/admin/v1/media/folders', 'get', 200>;
type FolderItem = FolderList['items'][number];

export function folderId(n: number): string {
  return `00000000-0000-4000-9000-${String(n).padStart(12, '0')}`;
}

function folder(
  n: number,
  name: string,
  depth: number,
  parent: number | null,
  mediaCount: number,
): FolderItem {
  return {
    id: folderId(n),
    parentId: parent === null ? null : folderId(parent),
    name,
    depth,
    mediaCount,
    version: 1,
  } satisfies FolderItem;
}

/** Flat folders as the server returns them (depth, then name), after the design. */
export const folderFixtures: FolderItem[] = [
  folder(1, 'Bài đăng', 1, null, 3),
  folder(2, 'Dịch vụ', 1, null, 0),
  folder(3, 'Hành trình', 1, null, 7),
  folder(4, 'Đội ngũ', 1, null, 6),
  folder(5, 'Hướng dẫn', 2, 1, 2),
  folder(6, 'Khuyến mãi', 2, 1, 1),
  folder(7, '2024', 2, 3, 2),
  folder(8, 'Phòng sạch', 3, 7, 3),
] satisfies FolderItem[];

export const FOLDER = {
  posts: folderId(1),
  services: folderId(2),
  journey: folderId(3),
  team: folderId(4),
  guides: folderId(5),
  promos: folderId(6),
  y2024: folderId(7),
  cleanRoom: folderId(8),
} as const;

export const foldersFixture = { items: folderFixtures } satisfies FolderList;

type MediaDetail = Res<'/admin/v1/media/{id}', 'get', 200>;

/** Detail of `mediaItem(n)` after the design: 800 × 1000 JPG, 214 KB, version 3, no usages. */
export function mediaDetail(n: number, overrides: Partial<MediaDetail> = {}): MediaDetail {
  return {
    ...mediaItem(n),
    alt: 'Nguyễn Minh Khoa, nhà sáng lập LAPBEE',
    width: 800,
    height: 1000,
    bytes: 214 * 1024,
    createdAt: '2026-03-02T03:00:00Z',
    updatedAt: '2026-03-02T03:00:00Z',
    folderId: FOLDER.y2024,
    version: 3,
    usages: [],
    ...overrides,
  } satisfies MediaDetail;
}

/** An image used by a team member: it cannot be deleted. */
export const usedMediaDetail = mediaDetail(1, {
  usages: [{ source: 'site', kind: 'team_member', id: 'team-1', label: 'Nguyễn Minh Khoa' }],
});
