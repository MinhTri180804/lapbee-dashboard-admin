import type { ReactNode } from 'react';
import { createBrowserRouter, Navigate, useParams, type RouteObject } from 'react-router';
import type { Permission } from '@/shared/api/generated/permissions';
import { RequireAuth, RequirePermission, type PermissionMode } from '@/shared/auth/permissions';
import { useSession } from '@/shared/auth/session-store';
import { AccountPage, LoginPage, SetupPasswordPage } from '@/features/auth';
import { CategoriesPage } from '@/features/categories';
import { MediaLibraryPage } from '@/features/media';
import { PostsPage } from '@/features/posts';
import { isItemKind, SiteHistoryPage, SiteItemPage, SitePage } from '@/features/site';
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

/** `/site/:kind/new` and `/site/:kind/:id`; an unknown kind is a 404. */
function SiteItemRoute() {
  const { kind, id } = useParams();
  if (kind === undefined || !isItemKind(kind)) return <NotFoundPage />;
  return <SiteItemPage key={`${kind}/${id ?? 'new'}`} kind={kind} {...(id ? { id } : {})} />;
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
          { path: '/site/:kind/new', element: guarded('site.read', <SiteItemRoute />) },
          { path: '/site/:kind/:id', element: guarded('site.read', <SiteItemRoute />) },
          { path: '/posts', element: guarded('post.read', <PostsPage />) },
          { path: '/categories', element: guarded('category.read', <CategoriesPage />) },
          { path: '/media', element: guarded('media.read', <MediaLibraryPage />) },
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
