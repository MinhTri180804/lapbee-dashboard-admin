import { formatDate } from '@/shared/lib/format-date';
import type { MediaDto } from '../api/repo';

export type { MediaDto };

export type MediaThumb = {
  id: string;
  url: string;
  thumbUrl: string;
  width: number;
  height: number;
  alt: string;
  name: string;
};

export type MediaListParams = {
  /** A folder id, `'root'` for the library root, or `null` for every image. */
  folder: string | null;
  q: string;
  used: false | null;
};

export const mediaKeys = {
  all: ['media'] as const,
  list: (p: MediaListParams) => ['media', 'list', p] as const,
  detail: (id: string) => ['media', 'detail', id] as const,
  folders: ['media', 'folders'] as const,
  total: (used?: false) => ['media', 'total', used ?? 'all'] as const,
};

export function toMediaThumb(dto: MediaDto): MediaThumb {
  return {
    id: dto.id,
    url: dto.url,
    thumbUrl: dto.thumbUrl,
    width: dto.width,
    height: dto.height,
    alt: dto.alt,
    name: dto.name,
  };
}

const UPLOAD_ERRORS: Record<string, string> = {
  MEDIA_TOO_LARGE: 'Ảnh vượt quá 10 MB.',
  MEDIA_UNSUPPORTED_TYPE: 'Chỉ nhận ảnh JPEG, PNG, WebP hoặc AVIF.',
  MEDIA_INVALID_IMAGE: 'Ảnh bị hỏng hoặc quá lớn để xử lý.',
};

export function uploadErrorMessage(code: string | undefined): string {
  return (code && UPLOAD_ERRORS[code]) || 'Không tải được ảnh. Thử lại sau.';
}

const FOLDER_ERRORS: Record<string, string> = {
  FOLDER_NAME_TAKEN: 'Đã có thư mục cùng tên ở đây.',
  FOLDER_TOO_DEEP: 'Thư mục chỉ lồng tối đa 5 cấp.',
  FOLDER_CYCLE: 'Không thể chuyển thư mục vào chính nó hoặc thư mục con.',
  FOLDER_NOT_EMPTY: 'Thư mục còn ảnh hoặc thư mục con.',
};

export function folderErrorMessage(code: string | undefined): string | null {
  return (code && FOLDER_ERRORS[code]) || null;
}

/** Where an image is used; an unknown `kind` falls back to its `source` at the call site. */
export const USAGE_KIND_LABEL: Record<string, string> = {
  team_member: 'Đội ngũ',
  timeline_entry: 'Hành trình',
  site_publication: 'Bản xuất bản website',
  post_cover: 'Ảnh bìa bài viết',
  post_image: 'Ảnh trong bài viết',
};

/** Base 1024, decimal comma: "214 KB", "1,2 MB". */
export function formatBytes(n: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = n;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  let rounded = unit === 0 || value >= 100 ? Math.round(value) : Math.round(value * 10) / 10;
  // 1048575 B is 1023.999 KB, which rounds to 1024: show it as 1 MB.
  if (rounded >= 1024 && unit < units.length - 1) {
    rounded = 1;
    unit += 1;
  }
  const text = String(rounded);
  return `${text.replace('.', ',')} ${units[unit] ?? 'B'}`;
}

/** "JPG · 800 × 1000 · 214 KB · 02.03.2026" */
export function formatMediaMeta(
  dto: Pick<MediaDto, 'format' | 'width' | 'height' | 'bytes' | 'createdAt'>,
): string {
  const format = dto.format === 'jpeg' ? 'JPG' : dto.format.toUpperCase();
  return [
    format,
    `${String(dto.width)} × ${String(dto.height)}`,
    formatBytes(dto.bytes),
    formatDate(dto.createdAt),
  ].join(' · ');
}
