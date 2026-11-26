import type { PostList, PostListItem, PostQuery } from '../api/repo';

export type { PostList, PostListItem };

export type PostStatus = PostListItem['status'];

/** P4-3: what the posts list URL holds. `null` / `''` / page 1 are "Tất cả". */
export type PostListParams = {
  cat: string | null;
  status: PostStatus | null;
  q: string;
  page: number;
};

export const POSTS_PER_PAGE = 8;

export const postKeys = {
  all: ['posts'] as const,
  list: (p: PostListParams) => ['posts', 'list', p] as const,
  total: ['posts', 'total'] as const,
};

export const STATUS_LABEL: Record<PostStatus, string> = {
  published: 'Đã xuất bản',
  draft: 'Bản nháp',
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_Q = 200;

/** Reads the URL; values the API would reject (not a uuid, unknown status, bad page) are dropped. */
export function paramsFromSearch(sp: URLSearchParams): PostListParams {
  const cat = sp.get('cat') ?? '';
  const status = sp.get('status');
  const page = Number(sp.get('page') ?? '1');
  return {
    cat: UUID.test(cat) ? cat : null,
    status: status === 'draft' || status === 'published' ? status : null,
    q: (sp.get('q') ?? '').trim().slice(0, MAX_Q),
    page: Number.isInteger(page) && page >= 1 ? page : 1,
  };
}

export function toPostQuery({ cat, status, q, page }: PostListParams): PostQuery {
  return {
    ...(cat ? { cat } : {}),
    ...(status ? { status } : {}),
    ...(q ? { q } : {}),
    page,
    perPage: POSTS_PER_PAGE,
  };
}

export function lastPage(total: number): number {
  return Math.max(1, Math.ceil(total / POSTS_PER_PAGE));
}

/** "Hiển thị 9–16 trên 20 bài"; "0 bài" when nothing matches; "{total} bài" past the last page. */
export function rangeLabel(page: number, total: number): string {
  if (total === 0) return '0 bài';
  const from = (page - 1) * POSTS_PER_PAGE + 1;
  if (from > total) return `${String(total)} bài`;
  const to = Math.min(page * POSTS_PER_PAGE, total);
  return `Hiển thị ${String(from)}–${String(to)} trên ${String(total)} bài`;
}
