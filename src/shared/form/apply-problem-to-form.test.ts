import type { UseFormSetError } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { ProblemError, ReauthCancelledError } from '@/shared/api/errors';
import { applyProblemToForm } from './apply-problem-to-form';

type Values = { newPassword: string; content: string };

function problem(errors?: { path: string; message: string }[]): ProblemError {
  return new ProblemError({
    type: 'about:blank',
    title: 'Dữ liệu không hợp lệ',
    status: 422,
    code: 'VALIDATION_FAILED',
    detail: 'Có lỗi xảy ra.',
    ...(errors ? { errors } : {}),
  });
}

describe('applyProblemToForm', () => {
  it('gắn lỗi vào field cùng tên', () => {
    const setError = vi.fn<UseFormSetError<Values>>();
    const result = applyProblemToForm<Values>(
      problem([{ path: 'newPassword', message: 'Tối thiểu 12 ký tự.' }]),
      setError,
    );
    expect(result).toBe(true);
    expect(setError).toHaveBeenCalledWith('newPassword', {
      type: 'server',
      message: 'Tối thiểu 12 ký tự.',
    });
  });

  it('pathMap đổi tên field', () => {
    const setError = vi.fn<UseFormSetError<Values>>();
    applyProblemToForm<Values>(
      problem([{ path: 'content.blocks.3.data.file.mediaId', message: 'Ảnh không tồn tại.' }]),
      setError,
      { 'content.blocks.3.data.file.mediaId': 'content' },
    );
    expect(setError).toHaveBeenCalledWith('content', {
      type: 'server',
      message: 'Ảnh không tồn tại.',
    });
  });

  it('path không khớp field nào thì gom vào root.server', () => {
    const setError = vi.fn<UseFormSetError<Values>>();
    applyProblemToForm<Values>(
      problem([
        { path: 'ids.2', message: 'Sai.' },
        { path: 'other', message: 'Lỗi khác.' },
        { path: 'newPassword', message: 'Ngắn.' },
      ]),
      setError,
      undefined,
      ['newPassword', 'content'],
    );
    expect(setError).toHaveBeenCalledWith('newPassword', { type: 'server', message: 'Ngắn.' });
    expect(setError).toHaveBeenCalledWith('root.server', {
      type: 'server',
      message: 'Sai. Lỗi khác.',
    });
    expect(setError).toHaveBeenCalledTimes(2);
  });

  it('không có fieldErrors thì dùng detail ở root.server', () => {
    const setError = vi.fn<UseFormSetError<Values>>();
    expect(applyProblemToForm<Values>(problem(), setError)).toBe(true);
    expect(setError).toHaveBeenCalledWith('root.server', {
      type: 'server',
      message: 'Có lỗi xảy ra.',
    });
  });

  it('huỷ step-up là đã xử lý: trả true, không gắn lỗi nào', () => {
    const setError = vi.fn<UseFormSetError<Values>>();
    expect(applyProblemToForm<Values>(new ReauthCancelledError(), setError)).toBe(true);
    expect(setError).not.toHaveBeenCalled();
  });

  it('lỗi không phải ProblemError thì trả false', () => {
    const setError = vi.fn<UseFormSetError<Values>>();
    expect(applyProblemToForm<Values>(new Error('x'), setError)).toBe(false);
    expect(setError).not.toHaveBeenCalled();
  });
});
