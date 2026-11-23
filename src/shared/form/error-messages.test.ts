import { describe, expect, it } from 'vitest';
import { NetworkError, ProblemError, UnexpectedError } from '@/shared/api/errors';
import { messageFor } from './error-messages';

function problemError(code: string, detail = 'Chi tiết từ máy chủ.') {
  return new ProblemError({ type: 'about:blank', title: 'Error', status: 400, code, detail });
}

describe('messageFor', () => {
  it('NetworkError dùng câu mất kết nối', () => {
    expect(messageFor(new NetworkError())).toBe('Không kết nối được máy chủ. Thử lại sau.');
  });

  it.each([
    ['RATE_LIMITED', 'Thử lại sau ít phút.'],
    ['FORBIDDEN', 'Bạn không có quyền làm việc này.'],
    ['PAYLOAD_TOO_LARGE', 'Dữ liệu gửi lên quá lớn.'],
    ['VALIDATION_FAILED', 'Dữ liệu chưa hợp lệ. Kiểm tra lại các ô được đánh dấu.'],
    ['NOT_FOUND', 'Không tìm thấy dữ liệu.'],
  ])('code %s dùng câu trong bảng', (code, message) => {
    expect(messageFor(problemError(code))).toBe(message);
  });

  it('code chưa có trong bảng thì lấy detail', () => {
    expect(messageFor(problemError('SLUG_TAKEN', 'Slug đã được dùng.'))).toBe('Slug đã được dùng.');
  });

  it('lỗi không xác định dùng câu chung', () => {
    expect(messageFor(new UnexpectedError({ status: 500 }))).toBe('Đã có lỗi xảy ra. Thử lại sau.');
    expect(messageFor(new Error('boom'))).toBe('Đã có lỗi xảy ra. Thử lại sau.');
  });
});
