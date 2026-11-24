import { QueryClientProvider, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useEffect, useRef, type ReactNode } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { ReauthDialog, useBootstrapSession } from '@/features/auth';
import { on } from '@/shared/api/events';
import { isReauthPending, rejectReauth } from '@/shared/api/reauth-coordinator';
import { sessionStore } from '@/shared/auth/session-store';
import { ToastProvider, useToast } from '@/shared/ui';
import { ConflictDialog } from './ConflictDialog';
import { AppScrollRestoration } from './scroll-restoration';

/** Providers that do not need the router. The router renders inside them. */
export function AppProviders({
  queryClient,
  children,
}: {
  queryClient: QueryClient;
  children: ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  );
}

/**
 * Turns app events into UI: `toast` → toast, `session:expired` → sign out, drop the cache and
 * go to `/login?next=…`. A layout route element (it needs `useNavigate`); renders `<Outlet/>`.
 */
export function AppEventsBridge() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const here = useRef(pathname + search);

  useEffect(() => {
    here.current = pathname + search;
  }, [pathname, search]);

  useEffect(
    () =>
      on('toast', (t) => {
        toast.show(t);
      }),
    [toast],
  );

  useEffect(
    () =>
      on('session:expired', () => {
        if (sessionStore.get().status === 'anonymous') return;
        if (isReauthPending()) rejectReauth();
        sessionStore.signOut();
        queryClient.clear();
        void navigate('/login?next=' + encodeURIComponent(here.current), { replace: true });
        toast.show({ kind: 'info', title: 'Phiên đã hết hạn. Đăng nhập lại để tiếp tục.' });
      }),
    [navigate, queryClient, toast],
  );

  return (
    <>
      <Outlet />
      <ReauthDialog />
      <ConflictDialog />
    </>
  );
}

/** Root route element: restores the session once, then bridges app events. */
export function AppRoot() {
  useBootstrapSession();
  return (
    <>
      <AppScrollRestoration />
      <AppEventsBridge />
    </>
  );
}
