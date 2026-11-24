import { MutationObserver, QueryObserver } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ProblemError, ReauthCancelledError } from '@/shared/api/errors';
import { on } from '@/shared/api/events';
import { createQueryClient } from './query-client';

function problemError(status: number, code: string, detail = ''): ProblemError {
  return new ProblemError({ type: 'about:blank', title: 'x', status, code, detail });
}

const offs: (() => void)[] = [];

afterEach(() => {
  offs.splice(0).forEach((off) => {
    off();
  });
});

function listen() {
  const conflict = vi.fn();
  const toast = vi.fn();
  offs.push(on('conflict', conflict), on('toast', toast));
  return { conflict, toast };
}

async function runMutation(
  error: Error,
  meta?: { invalidates?: readonly (readonly unknown[])[]; handlesErrors?: boolean },
) {
  const client = createQueryClient();
  const observer = new MutationObserver(client, {
    mutationFn: () => Promise.reject(error),
    ...(meta ? { meta } : {}),
  });
  await observer.mutate().catch(() => undefined);
}

describe('createQueryClient — mutation errors', () => {
  it('emits conflict (not toast) for VERSION_CONFLICT with meta.invalidates', async () => {
    const spy = listen();
    await runMutation(problemError(409, 'VERSION_CONFLICT'), { invalidates: [['site']] });
    expect(spy.conflict).toHaveBeenCalledWith({ invalidates: [['site']] });
    expect(spy.toast).not.toHaveBeenCalled();
  });

  it('emits nothing when meta.handlesErrors is set', async () => {
    const spy = listen();
    await runMutation(problemError(422, 'VALIDATION_FAILED'), { handlesErrors: true });
    expect(spy.conflict).not.toHaveBeenCalled();
    expect(spy.toast).not.toHaveBeenCalled();
  });

  it('emits nothing for ReauthCancelledError', async () => {
    const spy = listen();
    await runMutation(new ReauthCancelledError());
    expect(spy.conflict).not.toHaveBeenCalled();
    expect(spy.toast).not.toHaveBeenCalled();
  });

  it('emits nothing for 401 UNAUTHENTICATED (the session handler covers it)', async () => {
    const spy = listen();
    await runMutation(problemError(401, 'UNAUTHENTICATED'));
    expect(spy.toast).not.toHaveBeenCalled();
  });

  it('toasts any other error with messageFor', async () => {
    const spy = listen();
    await runMutation(problemError(403, 'FORBIDDEN'));
    expect(spy.toast).toHaveBeenCalledWith({
      kind: 'error',
      title: 'Bạn không có quyền làm việc này.',
    });
  });
});

describe('createQueryClient — queries', () => {
  it('does not retry a ProblemError and leaves a first-load error to the page', async () => {
    const client = createQueryClient();
    const queryFn = vi.fn(() => Promise.reject(problemError(404, 'NOT_FOUND')));
    const spy = listen();
    const observer = new QueryObserver(client, { queryKey: ['x'], queryFn });
    const unsubscribe = observer.subscribe(() => undefined);
    try {
      await vi.waitFor(() => {
        expect(observer.getCurrentResult().status).toBe('error');
      });
      expect(queryFn).toHaveBeenCalledTimes(1);
      expect(spy.toast).not.toHaveBeenCalled();
    } finally {
      unsubscribe();
    }
  });

  it('toasts a background refetch failure (data already present)', async () => {
    const client = createQueryClient();
    client.setQueryData(['x'], 'cached');
    const queryFn = vi.fn(() => Promise.reject(problemError(404, 'NOT_FOUND')));
    const spy = listen();
    const observer = new QueryObserver(client, { queryKey: ['x'], queryFn, staleTime: 0 });
    const unsubscribe = observer.subscribe(() => undefined);
    try {
      await vi.waitFor(() => {
        expect(spy.toast).toHaveBeenCalledWith({
          kind: 'error',
          title: 'Không tìm thấy dữ liệu.',
        });
      });
    } finally {
      unsubscribe();
    }
  });

  it('retries other errors up to twice', () => {
    const retry = createQueryClient().getDefaultOptions().queries?.retry;
    expect(typeof retry).toBe('function');
    if (typeof retry !== 'function') return;
    expect(retry(0, new Error('net'))).toBe(true);
    expect(retry(1, new Error('net'))).toBe(true);
    expect(retry(2, new Error('net'))).toBe(false);
    expect(retry(0, problemError(500, 'INTERNAL'))).toBe(false);
  });
});
