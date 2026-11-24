import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderResult } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import {
  createBrowserRouter,
  createMemoryRouter,
  RouterProvider,
  type RouteObject,
} from 'react-router';
import { AppEventsBridge } from '@/app/providers';
import { sessionStore, type SignInInput } from '@/shared/auth/session-store';
import { ToastProvider } from '@/shared/ui';
import { meFixture } from './fixtures/auth';

/** A QueryClient for tests: no retries, no cache retention. */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  });
}

/** `wrapper` for `renderHook` that provides a QueryClient. */
export function createWrapper(queryClient: QueryClient = createTestQueryClient()) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

export type RenderWithProvidersOptions = {
  /** Initial URL of the memory router. Defaults to `/`. */
  route?: string;
  /** Signs the session store in first; omitted fields come from `meFixture`. */
  session?: Partial<SignInInput>;
  /** Extra routes next to the catch-all route that renders `ui`, e.g. `/login`. */
  routes?: RouteObject[];
  queryClient?: QueryClient;
  /** `browser` drives `window.history` (set to `route` first), for tests about the real URL. */
  history?: 'memory' | 'browser';
};

export type RenderWithProvidersResult = RenderResult & {
  /** Memory and browser data routers share one type. */
  router: ReturnType<typeof createMemoryRouter>;
  queryClient: QueryClient;
};

/**
 * Renders `ui` inside the app providers (QueryClient, toasts, app event bridge) and a memory
 * data router at `route`. `ui` is the element of a catch-all route, so it may use `<Outlet/>`.
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    route = '/',
    session,
    routes = [],
    queryClient = createTestQueryClient(),
    history = 'memory',
  }: RenderWithProvidersOptions = {},
): RenderWithProvidersResult {
  if (session) {
    sessionStore.signIn({
      user: session.user ?? meFixture.user,
      permissions: session.permissions ?? meFixture.permissions,
      csrfToken: session.csrfToken ?? meFixture.csrfToken,
    });
  }
  const tree: RouteObject[] = [
    {
      element: <AppEventsBridge />,
      children: [...routes, { path: '*', element: ui }],
    },
  ];
  let router: RenderWithProvidersResult['router'];
  if (history === 'browser') {
    window.history.replaceState(null, '', route);
    router = createBrowserRouter(tree);
  } else {
    router = createMemoryRouter(tree, { initialEntries: [route] });
  }
  const result = render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </QueryClientProvider>,
  );
  return { ...result, router, queryClient };
}
