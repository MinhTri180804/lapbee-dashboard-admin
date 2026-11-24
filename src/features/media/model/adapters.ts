import type { MediaDto } from '../api/repo';

export type MediaThumb = {
  id: string;
  url: string;
  thumbUrl: string;
  width: number;
  height: number;
  alt: string;
  name: string;
};

export const mediaKeys = {
  all: ['media'] as const,
  list: (q: string) => ['media', 'list', q] as const,
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
