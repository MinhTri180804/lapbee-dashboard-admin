import { NetworkError, ProblemError, toAppError } from '@/shared/api/errors';

const GENERIC = 'Đã có lỗi xảy ra. Thử lại sau.';

const byCode: Record<string, string> = {
  NETWORK: 'Không kết nối được máy chủ. Thử lại sau.',
  RATE_LIMITED: 'Thử lại sau ít phút.',
  FORBIDDEN: 'Bạn không có quyền làm việc này.',
  PAYLOAD_TOO_LARGE: 'Dữ liệu gửi lên quá lớn.',
  VALIDATION_FAILED: 'Dữ liệu chưa hợp lệ. Kiểm tra lại các ô được đánh dấu.',
  NOT_FOUND: 'Không tìm thấy dữ liệu.',
};

/** User-facing Vietnamese message for any error: table by `code`, else the backend `detail`. */
export function messageFor(error: unknown): string {
  const appError = toAppError(error);
  if (appError instanceof NetworkError) return byCode.NETWORK ?? GENERIC;
  if (appError instanceof ProblemError) {
    return byCode[appError.code] ?? (appError.detail || GENERIC);
  }
  return GENERIC;
}
