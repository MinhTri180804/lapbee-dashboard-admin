import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { on } from '@/shared/api/events';
import { sessionStore } from '@/shared/auth/session-store';
import { meFixture } from '@/test/fixtures/auth';
import { useIdleWarning } from './use-idle-warning';

const MIN = 60_000;

describe('useIdleWarning', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: new Date('2026-11-23T08:00:00Z') });
    sessionStore.signIn({ user: meFixture.user, permissions: ['*'], csrfToken: 't' });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('toasts once per idle period after 25 minutes without activity', () => {
    const toast = vi.fn();
    const off = on('toast', toast);
    renderHook(() => {
      useIdleWarning({});
    });

    act(() => {
      vi.advanceTimersByTime(24 * MIN);
    });
    expect(toast).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(MIN + 30_000);
    });
    expect(toast).toHaveBeenCalledTimes(1);
    expect(toast).toHaveBeenCalledWith({
      kind: 'info',
      title: 'Phiên sắp hết hạn',
      body: 'Bạn sẽ bị đăng xuất sau ít phút nếu không thao tác.',
    });

    act(() => {
      vi.advanceTimersByTime(5 * MIN);
    });
    expect(toast).toHaveBeenCalledTimes(1);

    // New activity starts a new idle period.
    act(() => {
      sessionStore.markActivity();
      vi.advanceTimersByTime(26 * MIN);
    });
    expect(toast).toHaveBeenCalledTimes(2);
    off();
  });

  it('stays quiet when signed out', () => {
    const toast = vi.fn();
    const off = on('toast', toast);
    sessionStore.signOut();
    renderHook(() => {
      useIdleWarning({ warnAfterMs: MIN, checkEveryMs: 1000 });
    });
    act(() => {
      vi.advanceTimersByTime(10 * MIN);
    });
    expect(toast).not.toHaveBeenCalled();
    off();
  });
});
