import { describe, expect, it } from 'vitest';
import { mediaItem } from '@/test/fixtures/media';
import {
  folderErrorMessage,
  formatBytes,
  formatMediaMeta,
  mediaKeys,
  USAGE_KIND_LABEL,
} from './adapters';

describe('formatBytes', () => {
  it('uses base 1024 and a decimal comma', () => {
    expect(formatBytes(219136)).toBe('214 KB');
    expect(formatBytes(1258291)).toBe('1,2 MB');
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2 * 1024 * 1024)).toBe('2 MB');
  });

  it('steps up a unit when rounding reaches 1024', () => {
    expect(formatBytes(1023)).toBe('1023 B');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1048575)).toBe('1 MB');
    expect(formatBytes(1048576)).toBe('1 MB');
    expect(formatBytes(10485760)).toBe('10 MB');
  });
});

describe('formatMediaMeta', () => {
  it('joins format, size, weight and date', () => {
    const dto = {
      ...mediaItem(1),
      format: 'jpeg' as const,
      width: 800,
      height: 1000,
      bytes: 219136,
      createdAt: '2026-03-02T03:04:00Z',
    };
    expect(formatMediaMeta(dto)).toBe('JPG · 800 × 1000 · 214 KB · 02.03.2026');
    expect(formatMediaMeta({ ...dto, format: 'webp' })).toContain('WEBP · ');
  });
});

describe('folderErrorMessage', () => {
  it('maps folder codes and returns null for others', () => {
    expect(folderErrorMessage('FOLDER_NAME_TAKEN')).toBe('Đã có thư mục cùng tên ở đây.');
    expect(folderErrorMessage('FOLDER_TOO_DEEP')).toBe('Thư mục chỉ lồng tối đa 5 cấp.');
    expect(folderErrorMessage('FOLDER_CYCLE')).toBe(
      'Không thể chuyển thư mục vào chính nó hoặc thư mục con.',
    );
    expect(folderErrorMessage('FOLDER_NOT_EMPTY')).toBe('Thư mục còn ảnh hoặc thư mục con.');
    expect(folderErrorMessage('OTHER')).toBeNull();
    expect(folderErrorMessage(undefined)).toBeNull();
  });
});

describe('constants', () => {
  it('labels usage kinds', () => {
    expect(USAGE_KIND_LABEL.team_member).toBe('Đội ngũ');
    expect(USAGE_KIND_LABEL.post_image).toBe('Ảnh trong bài viết');
  });

  it('builds query keys', () => {
    expect(mediaKeys.list({ folder: 'root', q: '', used: null })).toEqual([
      'media',
      'list',
      { folder: 'root', q: '', used: null },
    ]);
    expect(mediaKeys.total()).toEqual(['media', 'total', 'all']);
    expect(mediaKeys.total(false)).toEqual(['media', 'total', false]);
    expect(mediaKeys.folders).toEqual(['media', 'folders']);
    expect(mediaKeys.detail('a')).toEqual(['media', 'detail', 'a']);
  });
});
