import type { ReactNode } from 'react';
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router';
import type { Permission } from '@/shared/api/generated/permissions';
import { RequireAuth, RequirePermission, type PermissionMode } from '@/shared/auth/permissions';
import { useSession } from '@/shared/auth/session-store';
import { AccountPage, LoginPage, SetupPasswordPage } from '@/features/auth';
import { SiteHistoryPage, SitePage } from '@/features/site';
import { Shell } from './layout/Shell';
import { firstAllowedPath } from './nav';
import { ComingSoonPage } from './pages/ComingSoonPage';
import { ForbiddenPage } from './pages/ForbiddenPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AppRoot } from './providers';

function HomeRedirect() {
  const { permissions } = useSession();
  return <Navigate to={firstAllowedPath(permissions)} replace />;
}

function guarded(
  perm: Permission | readonly Permission[],
  element: ReactNode,
  mode: PermissionMode = 'all',
): ReactNode {
  return (
    <RequirePermission perm={perm} mode={mode} forbidden={<ForbiddenPage />}>
      {element}
    </RequirePermission>
  );
}

export const routes: RouteObject[] = [
  {
    element: <AppRoot />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/setup-password', element: <SetupPasswordPage /> },
      {
        element: (
          <RequireAuth>
            <Shell />
          </RequireAuth>
        ),
        children: [
          { index: true, element: <HomeRedirect /> },
          {
            path: '/site',
            element: guarded('site.read', <SitePage />),
          },
          { path: '/site/history', element: guarded('site.read', <SiteHistoryPage />) },
          { path: '/posts', element: guarded('post.read', <ComingSoonPage title="Bài đăng" />) },
          {
            path: '/categories',
            element: guarded('category.read', <ComingSoonPage title="Chuyên mục" />),
          },
          {
            path: '/media',
            element: guarded('media.read', <ComingSoonPage title="Thư viện ảnh" />),
          },
          { path: '/users', element: guarded('user.read', <ComingSoonPage title="Người dùng" />) },
          { path: '/roles', element: guarded('role.read', <ComingSoonPage title="Vai trò" />) },
          {
            path: '/system',
            element: guarded(
              ['system.read', 'system.manage_tokens', 'audit.read'],
              <ComingSoonPage title="Hệ thống" />,
              'any',
            ),
          },
          { path: '/account', element: <AccountPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
];

export function createAppRouter() {
  return createBrowserRouter(routes);
}
