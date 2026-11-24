import { afterEach, describe, expect, it, vi } from 'vitest';
import { ReauthCancelledError } from './errors';
import { on } from './events';
import { isReauthPending, rejectReauth, resolveReauth, waitForReauth } from './reauth-coordinator';

function listenReauthRequired() {
  const fn = vi.fn();
  const off = on('reauth:required', fn);
  return { fn, off };
}

describe('reauth coordinator', () => {
  afterEach(() => {
    if (isReauthPending()) resolveReauth();
  });

  it('hai lần waitForReauth() dùng chung một promise, phát reauth:required một lần', async () => {
    const { fn, off } = listenReauthRequired();

    const a = waitForReauth();
    const b = waitForReauth();

    expect(a).toBe(b);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(isReauthPending()).toBe(true);

    resolveReauth();
    await expect(a).resolves.toBeUndefined();
    expect(isReauthPending()).toBe(false);
    off();
  });

  it('rejectReauth() từ chối với ReauthCancelledError rồi đặt lại', async () => {
    const pending = waitForReauth();

    rejectReauth();

    await expect(pending).rejects.toBeInstanceOf(ReauthCancelledError);
    expect(isReauthPending()).toBe(false);
  });

  it('sau khi xong, lần gọi sau mở prompt mới', async () => {
    const { fn, off } = listenReauthRequired();

    const first = waitForReauth();
    resolveReauth();
    await first;
    const second = waitForReauth();

    expect(second).not.toBe(first);
    expect(fn).toHaveBeenCalledTimes(2);
    resolveReauth();
    await second;
    off();
  });

  it('resolve/reject khi không có gì đang chờ thì không làm gì', () => {
    expect(() => {
      resolveReauth();
      rejectReauth();
    }).not.toThrow();
    expect(isReauthPending()).toBe(false);
  });
});
