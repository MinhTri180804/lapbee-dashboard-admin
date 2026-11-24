import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import type { Permission } from '@/shared/api/generated/permissions';
import { Spinner } from '@/shared/ui';
import { useSession } from './session-store';

export type PermissionMode = 'all' | 'any';

/** `'*'` grants everything; an empty requirement list is never satisfied. */
export function can(
  perms: readonly string[],
  perm: Permission | readonly Permission[],
  mode: PermissionMode = 'all',
): boolean {
  const required: readonly Permission[] = typeof perm === 'string' ? [perm] : perm;
  if (required.length === 0) return false;
  if (perms.includes('*')) return true;
  return mode === 'any'
    ? required.some((p) => perms.includes(p))
    : required.every((p) => perms.includes(p));
}

export function useCan(perm: Permission | readonly Permission[], mode?: PermissionMode): boolean {
  return can(useSession().permissions, perm, mode);
}

type GateProps = {
  perm: Permission | readonly Permission[];
  mode?: PermissionMode;
  children?: ReactNode;
};

export function Can({ perm, mode, fallback, children }: GateProps & { fallback?: ReactNode }) {
  return <>{useCan(perm, mode) ? children : (fallback ?? null)}</>;
}

/** `forbidden` is injected so `shared` never imports app pages. */
export function RequirePermission({
  perm,
  mode,
  forbidden,
  children,
}: GateProps & { forbidden: ReactNode }) {
  const allowed = useCan(perm, mode);
  return <>{allowed ? (children ?? <Outlet />) : forbidden}</>;
}

export function RequireAuth({ children }: { children?: ReactNode }) {
  const { status } = useSession();
  const { pathname, search } = useLocation();
  if (status === 'unknown') return <Spinner fullPage />;
  if (status === 'anonymous') {
    return <Navigate to={'/login?next=' + encodeURIComponent(pathname + search)} replace />;
  }
  return <>{children ?? <Outlet />}</>;
}
