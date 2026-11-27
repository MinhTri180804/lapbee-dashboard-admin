import type { Res } from '@/shared/api/types';

type CategoryList = Res<'/admin/v1/categories', 'get', 200>;
type CategoryItem = CategoryList['items'][number];

export function categoryId(n: number): string {
  return `00000000-0000-4000-a000-${String(n).padStart(12, '0')}`;
}

export function categoryItem(
  n: number,
  name: string,
  slug: string,
  postCount: number,
  overrides: Partial<CategoryItem> = {},
): CategoryItem {
  return {
    id: categoryId(n),
    name,
    slug,
    description: `Mô tả ${name}`,
    position: n - 1,
    postCount,
    version: 1,
    ...overrides,
  } satisfies CategoryItem;
}

/** Sorted by `position`, as the server returns them. */
export const categoryFixtures: CategoryItem[] = [
  categoryItem(1, 'Hướng dẫn', 'huong-dan', 4),
  categoryItem(2, 'Tin tức', 'tin-tuc', 0, { version: 3 }),
  categoryItem(3, 'Khuyến mãi', 'khuyen-mai', 2),
] satisfies CategoryItem[];

export const categoriesFixture = { items: categoryFixtures } satisfies CategoryList;
