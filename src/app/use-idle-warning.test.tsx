import { act, renderHook, screen, waitFor } from '@testing-library/react';
import { http as mock, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClientProvider } from '@tanstack/react-query';
import { sessionStore } from '@/shared/auth/session-store';
import { ToastProvider } from '@/shared/ui';
import { meFixture } from '@/test/fixtures/auth';
import { server } from '@/test/msw/server';
import { createTestQueryClient } from '@/test/render';
import { useIdleWarning } from './use-idle-warning';

const MIN = 60_000;
const TITLE = 'Phiên sắp hết hạn';

function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={createTestQueryClient()}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  );
}

function toastCount(): number {
  return screen.queryAllByText(TITLE).length;
}

describe('useIdleWarning', () => {
  beforeEach(() => {
    // setTimeout stays real so the toast's own timers and MSW behave normally.
    vi.useFakeTimers({
      now: new Date('2026-11-23T08:00:00Z'),
      toFake: ['setInterval', 'clearInterval', 'Date'],
    });
    sessionStore.signIn({ user: meFixture.user, permissions: ['*'], csrfToken: 't' });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows a sticky toast once per idle period after 25 minutes without activity', () => {
    renderHook(
      () => {
        useIdleWarning();
      },
      { wrapper: Providers },
    );

    act(() => {
      vi.advanceTimersByTime(24 * MIN);
    });
    expect(toastCount()).toBe(0);

    act(() => {
      vi.advanceTimersByTime(MIN + 30_000);
    });
    expect(toastCount()).toBe(1);
    expect(
      screen.getByText('Bạn sẽ bị đăng xuất sau ít phút nếu không thao tác.'),
    ).toBeInTheDocument();

    // Sticky: still there long after the default toast duration; and not repeated.
    act(() => {
      vi.advanceTimersByTime(5 * MIN);
    });
    expect(toastCount()).toBe(1);
    expect(screen.getByRole('button', { name: 'Tiếp tục' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Đóng' })).toBeInTheDocument();

    // Closing does not bring it back during the same idle period.
    act(() => {
      screen.getByRole('button', { name: 'Đóng' }).click();
    });
    act(() => {
      vi.advanceTimersByTime(5 * MIN);
    });
    expect(toastCount()).toBe(0);

    // New activity starts a new idle period.
    act(() => {
      sessionStore.markActivity();
      vi.advanceTimersByTime(26 * MIN);
    });
    expect(toastCount()).toBe(1);
  });

  it('Tiếp tục calls GET /auth/me, closes the toast and starts a new idle period', async () => {
    let mes = 0;
    server.use(
      mock.get('*/auth/me', () => {
        mes += 1;
        return HttpResponse.json(meFixture);
      }),
    );
    renderHook(
      () => {
        useIdleWarning();
      },
      { wrapper: Providers },
    );
    act(() => {
      vi.advanceTimersByTime(26 * MIN);
    });
    const before = sessionStore.get().lastActivityAt;
    // waitFor polls with setInterval; give it real timers back.
    vi.useRealTimers();

    act(() => {
      screen.getByRole('button', { name: 'Tiếp tục' }).click();
    });

    expect(toastCount()).toBe(0);
    await waitFor(() => {
      expect(mes).toBe(1);
    });
    await waitFor(() => {
      expect(sessionStore.get().lastActivityAt).not.toBe(before);
    });
  });

  it('stays quiet when signed out', () => {
    sessionStore.signOut();
    renderHook(
      () => {
        useIdleWarning({ warnAfterMs: MIN, checkEveryMs: 1000 });
      },
      { wrapper: Providers },
    );
    act(() => {
      vi.advanceTimersByTime(10 * MIN);
    });
    expect(toastCount()).toBe(0);
  });
});
