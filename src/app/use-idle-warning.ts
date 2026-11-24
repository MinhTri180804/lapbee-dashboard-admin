import { useEffect, useRef } from 'react';
import { useKeepAlive } from '@/features/auth';
import { sessionStore } from '@/shared/auth/session-store';
import { useToast } from '@/shared/ui';

export type IdleWarningOptions = {
  /** Idle time before the warning. The backend idle timeout is 30 minutes. */
  warnAfterMs?: number;
  checkEveryMs?: number;
};

/**
 * Spec D9: warns once per idle period that the session is about to expire. An idle period ends
 * when `lastActivityAt` changes (any successful API response). The toast is sticky; its
 * "Tiếp tục" action calls `GET /auth/me` to keep the session alive.
 */
export function useIdleWarning({
  warnAfterMs = 25 * 60_000,
  checkEveryMs = 30_000,
}: IdleWarningOptions = {}): void {
  const toast = useToast();
  const keepAlive = useKeepAlive();
  // Read through a ref so a new callback identity does not restart the interval.
  const keepAliveRef = useRef(keepAlive);
  useEffect(() => {
    keepAliveRef.current = keepAlive;
  }, [keepAlive]);

  useEffect(() => {
    let warnedFor: number | null = null;
    const id = setInterval(() => {
      const { status, lastActivityAt } = sessionStore.get();
      if (status !== 'authenticated' || lastActivityAt === null) return;
      if (warnedFor === lastActivityAt) return;
      if (Date.now() - lastActivityAt < warnAfterMs) return;
      warnedFor = lastActivityAt;
      toast.show({
        kind: 'info',
        title: 'Phiên sắp hết hạn',
        body: 'Bạn sẽ bị đăng xuất sau ít phút nếu không thao tác.',
        duration: null,
        action: {
          label: 'Tiếp tục',
          onClick: () => {
            keepAliveRef.current();
          },
        },
      });
    }, checkEveryMs);
    return () => {
      clearInterval(id);
    };
  }, [warnAfterMs, checkEveryMs, toast]);
}
