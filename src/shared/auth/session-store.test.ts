import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { meFixture } from '@/test/fixtures/auth';
import { sessionStore, useSession } from './session-store';

describe('sessionStore', () => {
  it('signIn đổi status sang authenticated', () => {
    sessionStore.signIn(meFixture);

    expect(sessionStore.get()).toMatchObject({
      status: 'authenticated',
      user: meFixture.user,
      permissions: ['*'],
      csrfToken: 'csrf-fixture',
    });
  });

  it('signOut xoá csrfToken và permissions', () => {
    sessionStore.signIn(meFixture);
    sessionStore.signOut();

    expect(sessionStore.get()).toEqual({
      status: 'anonymous',
      user: null,
      permissions: [],
      csrfToken: null,
      lastActivityAt: null,
    });
  });

  it('subscribe được gọi đúng một lần sau mỗi thay đổi', () => {
    const listener = vi.fn();
    const unsubscribe = sessionStore.subscribe(listener);

    sessionStore.signIn(meFixture);
    expect(listener).toHaveBeenCalledTimes(1);
    sessionStore.setCsrfToken('t2');
    expect(listener).toHaveBeenCalledTimes(2);
    sessionStore.markActivity(1000);
    expect(listener).toHaveBeenCalledTimes(3);
    sessionStore.signOut();
    expect(listener).toHaveBeenCalledTimes(4);

    unsubscribe();
    sessionStore.setCsrfToken('t3');
    expect(listener).toHaveBeenCalledTimes(4);
  });

  it('markActivity ghi thời điểm truyền vào', () => {
    sessionStore.markActivity(1234);
    expect(sessionStore.get().lastActivityAt).toBe(1234);
  });
});

describe('useSession', () => {
  it('render lại khi store thay đổi', () => {
    const { result } = renderHook(() => useSession());
    expect(result.current.status).toBe('anonymous');

    act(() => {
      sessionStore.signIn(meFixture);
    });

    expect(result.current.status).toBe('authenticated');
    expect(result.current.user?.email).toBe('admin@lapbee.test');
  });
});
