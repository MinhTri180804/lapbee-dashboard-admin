import type { Res } from '@/shared/api/types';
import { categoryFixtures } from './categories';

type PostList = Res<'/admin/v1/posts', 'get', 200>;
type PostListItem = PostList['items'][number];

export function postId(n: number): string {
  return `00000000-0000-4000-b000-${String(n).padStart(12, '0')}`;
}

const [huongDan] = categoryFixtures;

/** A published post in "Hướng dẫn"; `overrides` change any field. */
export function postItem(n: number, overrides: Partial<PostListItem> = {}): PostListItem {
  const category = huongDan ? { id: huongDan.id, name: huongDan.name, slug: huongDan.slug } : null;
  return {
    id: postId(n),
    title: `Bài viết số ${String(n)}`,
    slug: `bai-viet-so-${String(n)}`,
    slugLocked: true,
    excerpt: '',
    effectiveExcerpt: `Tóm tắt bài ${String(n)}`,
    categoryId: category?.id ?? null,
    category,
    status: 'published',
    date: '2026-11-20',
    featured: false,
    coverMediaId: null,
    cover: null,
    alt: '',
    kw: '',
    meta: '',
    noindex: false,
    publishedAt: '2026-11-20T03:00:00.000Z',
    createdBy: null,
    updatedBy: null,
    createdAt: '2026-11-19T03:00:00.000Z',
    updatedAt: '2026-11-20T03:00:00.000Z',
    version: 1,
    ...overrides,
  } satisfies PostListItem;
}

/** Counts over every post (not the filter): 12 published, 8 drafts, in categories 1 and 3. */
export const postCountsFixture = {
  byCat: [
    { categoryId: categoryFixtures[0]?.id ?? '', count: 14 },
    { categoryId: categoryFixtures[2]?.id ?? '', count: 5 },
  ],
  byStatus: { draft: 8, published: 12 },
} satisfies PostList['counts'];

/** A page of the list; `total` defaults to the 20 posts of `postCountsFixture`. */
export function postListFixture(
  items: PostListItem[],
  { total = 20, page = 1, perPage = 8 }: { total?: number; page?: number; perPage?: number } = {},
): PostList {
  return { items, total, page, perPage, counts: postCountsFixture } satisfies PostList;
}
