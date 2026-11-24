import { describe, expect, it } from 'vitest';
import { firstAllowedPath, NAV, visibleNav } from './nav';

const labels = (groups: ReturnType<typeof visibleNav>) =>
  groups.flatMap((g) => g.items.map((i) => i.label));

describe('visibleNav', () => {
  it('shows an editor only their content items and drops the empty admin group', () => {
    const perms = [
      'post.read',
      'post.create',
      'post.update',
      'category.read',
      'media.read',
      'media.upload',
      'media.update',
    ];
    const groups = visibleNav(perms);
    expect(groups.map((g) => g.group)).toEqual(['Nội dung']);
    expect(labels(groups)).toEqual(['Bài đăng', 'Chuyên mục', 'Thư viện ảnh']);
  });

  it("shows all seven items for '*'", () => {
    expect(labels(visibleNav(['*']))).toHaveLength(7);
    expect(visibleNav(['*'])).toEqual(NAV);
  });

  it.each(['system.read', 'system.manage_tokens', 'audit.read'])(
    'shows Hệ thống with any one of its permissions (%s)',
    (perm) => {
      const groups = visibleNav([perm]);
      expect(labels(groups)).toEqual(['Hệ thống']);
      expect(groups[0]?.group).toBe('Quản trị');
    },
  );

  it('returns nothing without permissions', () => {
    expect(visibleNav([])).toEqual([]);
  });
});

describe('firstAllowedPath', () => {
  it('returns the first visible item', () => {
    expect(firstAllowedPath(['media.read'])).toBe('/media');
    expect(firstAllowedPath(['*'])).toBe('/site');
  });

  it("falls back to '/account' when nothing is visible", () => {
    expect(firstAllowedPath([])).toBe('/account');
  });
});
