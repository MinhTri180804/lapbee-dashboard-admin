import { useEffect } from 'react';
import { emit } from '@/shared/api/events';
import { sessionStore } from '@/shared/auth/session-store';

export type IdleWarningOptions = {
  /** Idle time before the warning. The backend idle timeout is 30 minutes. */
  warnAfterMs?: number;
  checkEveryMs?: number;
};

/**
 * Warns once per idle period that the session is about to expire. An idle period ends when
 * `lastActivityAt` changes (any successful API response).
 */
export function useIdleWarning({
  warnAfterMs = 25 * 60_000,
  checkEveryMs = 30_000,
}: IdleWarningOptions = {}): void {
  useEffect(() => {
    let warnedFor: number | null = null;
    const id = setInterval(() => {
      const { status, lastActivityAt } = sessionStore.get();
      if (status !== 'authenticated' || lastActivityAt === null) return;
      if (warnedFor === lastActivityAt) return;
      if (Date.now() - lastActivityAt < warnAfterMs) return;
      warnedFor = lastActivityAt;
      emit('toast', {
        kind: 'info',
        title: 'Phiên sắp hết hạn',
        body: 'Bạn sẽ bị đăng xuất sau ít phút nếu không thao tác.',
      });
    }, checkEveryMs);
    return () => {
      clearInterval(id);
    };
  }, [warnAfterMs, checkEveryMs]);
}
