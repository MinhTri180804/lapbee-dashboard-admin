import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios';
import { describe, expect, it } from 'vitest';
import {
  NetworkError,
  ProblemError,
  ReauthCancelledError,
  UnexpectedError,
  isProblem,
  toAppError,
} from './errors';

function axiosErrorWith(response?: Pick<AxiosResponse, 'status' | 'data' | 'headers'>) {
  const config = { headers: new AxiosHeaders() };
  return new AxiosError(
    'Request failed',
    response ? 'ERR_BAD_RESPONSE' : 'ERR_NETWORK',
    config,
    {},
    response ? { ...response, statusText: '', config } : undefined,
  );
}

const problemBody = {
  type: 'about:blank',
  title: 'Conflict',
  status: 409,
  code: 'VERSION_CONFLICT',
  detail: 'Bài viết đã bị sửa ở nơi khác.',
};

describe('toAppError', () => {
  it('body không phải problem (HTML 502) trả UnexpectedError { status: 502 }', () => {
    const error = toAppError(
      axiosErrorWith({
        status: 502,
        data: '<html><body>Bad gateway</body></html>',
        headers: { 'content-type': 'text/html' },
      }),
    );

    expect(error).toBeInstanceOf(UnexpectedError);
    expect((error as UnexpectedError).status).toBe(502);
  });

  it('body problem+json trả ProblemError', () => {
    const error = toAppError(
      axiosErrorWith({
        status: 409,
        data: problemBody,
        headers: { 'content-type': 'application/problem+json' },
      }),
    );

    expect(error).toBeInstanceOf(ProblemError);
    expect(error).toMatchObject({ code: 'VERSION_CONFLICT', status: 409, fieldErrors: [] });
  });

  it('không có response trả NetworkError', () => {
    expect(toAppError(axiosErrorWith())).toBeInstanceOf(NetworkError);
  });

  it('giữ nguyên AppError đã có', () => {
    const cancelled = new ReauthCancelledError();
    expect(toAppError(cancelled)).toBe(cancelled);
  });

  it('lỗi lạ trả UnexpectedError không có status', () => {
    const error = toAppError(new TypeError('boom'));
    expect(error).toBeInstanceOf(UnexpectedError);
    expect((error as UnexpectedError).status).toBeUndefined();
  });
});

describe('isProblem', () => {
  const conflict = new ProblemError(problemBody);

  it('khớp theo code', () => {
    expect(isProblem(conflict, 'VERSION_CONFLICT')).toBe(true);
    expect(isProblem(conflict, 'NOT_FOUND')).toBe(false);
  });

  it('không truyền code thì chỉ kiểm tra kiểu', () => {
    expect(isProblem(conflict)).toBe(true);
    expect(isProblem(new NetworkError())).toBe(false);
    expect(isProblem('VERSION_CONFLICT')).toBe(false);
  });
});
