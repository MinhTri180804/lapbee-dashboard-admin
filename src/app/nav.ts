import {
  FileText,
  Images,
  LayoutTemplate,
  Settings,
  Shield,
  Tags,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { Permission } from '@/shared/api/generated/permissions';
import { can, type PermissionMode } from '@/shared/auth/permissions';

export type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  perm: Permission | readonly Permission[];
  mode?: PermissionMode;
};

export type NavGroup = { group: 'Nội dung' | 'Quản trị'; items: NavItem[] };

/** Sidebar entries (spec §4.7). A user only sees the items they can read. */
export const NAV: NavGroup[] = [
  {
    group: 'Nội dung',
    items: [
      { to: '/site', label: 'Thông tin website', icon: LayoutTemplate, perm: 'site.read' },
      { to: '/posts', label: 'Bài đăng', icon: FileText, perm: 'post.read' },
      { to: '/categories', label: 'Chuyên mục', icon: Tags, perm: 'category.read' },
      { to: '/media', label: 'Thư viện ảnh', icon: Images, perm: 'media.read' },
    ],
  },
  {
    group: 'Quản trị',
    items: [
      { to: '/users', label: 'Người dùng', icon: Users, perm: 'user.read' },
      { to: '/roles', label: 'Vai trò', icon: Shield, perm: 'role.read' },
      {
        to: '/system',
        label: 'Hệ thống',
        icon: Settings,
        perm: ['system.read', 'system.manage_tokens', 'audit.read'],
        mode: 'any',
      },
    ],
  },
];

/** `NAV` filtered by permission; groups left empty are dropped. */
export function visibleNav(perms: readonly string[]): NavGroup[] {
  return NAV.map((g) => ({
    ...g,
    items: g.items.filter((i) => can(perms, i.perm, i.mode)),
  })).filter((g) => g.items.length > 0);
}

/** Where `/` lands: the first visible nav item, else the account page everyone can open. */
export function firstAllowedPath(perms: readonly string[]): string {
  return visibleNav(perms)[0]?.items[0]?.to ?? '/account';
}
