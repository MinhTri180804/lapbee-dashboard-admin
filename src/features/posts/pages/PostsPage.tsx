import { ChevronLeft, ChevronRight, PenLine } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useCategories } from '@/features/categories';
import { useCan } from '@/shared/auth/permissions';
import { Button, IconButton, PageHeader, Spinner } from '@/shared/ui';
import { PostFilters, type CategoryTag } from '../components/PostFilters';
import { PostStats } from '../components/PostStats';
import { PostTable } from '../components/PostTable';
import { usePosts } from '../hooks/use-posts';
import { lastPage, paramsFromSearch, rangeLabel, type PostStatus } from '../model/adapters';
import styles from './PostsPage.module.css';

const DEBOUNCE_MS = 300;

type FilterKeys = { cat?: string | null; status?: PostStatus | null; q?: string };

/** Content · Posts (P4-3 to P4-6): counts, filters in the URL, 8 posts a page. */
export function PostsPage() {
  const [sp, setSp] = useSearchParams();
  const params = paramsFromSearch(sp);
  const list = usePosts(params);
  const categories = useCategories(useCan('category.read'));

  const data = list.data;
  const counts = data?.counts;
  const total = counts ? counts.byStatus.draft + counts.byStatus.published : undefined;
  const byCat = new Map(counts?.byCat.map((c) => [c.categoryId, c.count]));
  const tags: CategoryTag[] = (categories.data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    count: byCat.get(c.id) ?? 0,
  }));

  /** Writes the given filters and keeps the others; a new filter starts again on page 1. */
  const filter = (keys: FilterKeys, replace = false) => {
    setSp(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const key of ['cat', 'status', 'q'] as const) {
          if (!(key in keys)) continue;
          const value = keys[key];
          if (value) next.set(key, value);
          else next.delete(key);
        }
        next.delete('page');
        return next;
      },
      { replace },
    );
  };

  const goPage = (page: number) => {
    setSp((prev) => {
      const next = new URLSearchParams(prev);
      if (page > 1) next.set('page', String(page));
      else next.delete('page');
      return next;
    });
  };

  const [search, setSearch] = useState(params.q);
  const [shownQ, setShownQ] = useState(params.q);
  if (shownQ !== params.q) {
    // The URL changed under the box (Back, a shared link): follow it. Our own debounced write
    // matches the trimmed box, so the box keeps what the user typed (a trailing space).
    setShownQ(params.q);
    if (search.trim() !== params.q) setSearch(params.q);
  }

  useEffect(() => {
    const term = search.trim();
    if (term === params.q) return;
    const t = setTimeout(() => {
      // Entering a search pushes (Back returns to the unfiltered list); refining one replaces.
      filter({ q: term }, params.q !== '');
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(t);
    };
    // `filter` changes every render; only a new term restarts the wait.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, params.q]);

  const filtered = params.cat !== null || params.status !== null || params.q !== '';
  const pages = data ? lastPage(data.total) : 1;
  const pastEnd = data !== undefined && data.total > 0 && params.page > pages;
  const empty = pastEnd ? (
    <div className={styles.emptyBody}>
      <p>Không có bài viết ở trang này.</p>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          goPage(1);
        }}
      >
        Về trang 1
      </Button>
    </div>
  ) : filtered ? (
    'Không có bài viết phù hợp với bộ lọc.'
  ) : (
    'Chưa có bài viết nào.'
  );

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Quản trị · Bài đăng"
        title="Bài đăng"
        description="Bài viết trên website. Mỗi bài được chấm điểm SEO khi bạn viết."
        actions={
          <Button variant="primary" icon={PenLine} disabled title="Sắp có">
            Viết bài mới
          </Button>
        }
      />

      <div className={styles.body}>
        <PostStats counts={counts} />

        <PostFilters
          total={total}
          categories={tags}
          cat={params.cat}
          onCat={(cat) => {
            filter({ cat });
          }}
          search={search}
          onSearch={setSearch}
          status={params.status}
          onStatus={(status) => {
            filter({ status });
          }}
        />

        {data === undefined ? (
          list.isError ? (
            <p role="alert" className={styles.error}>
              Không tải được danh sách bài. Thử lại sau.
            </p>
          ) : (
            <Spinner />
          )
        ) : (
          <>
            <PostTable posts={pastEnd ? [] : data.items} empty={empty} />
            <div className={styles.footer}>
              <span className="lb-label">{rangeLabel(params.page, data.total)}</span>
              <div className={styles.pager}>
                <IconButton
                  icon={ChevronLeft}
                  label="Trang trước"
                  disabled={params.page <= 1}
                  onClick={() => {
                    goPage(Math.min(params.page - 1, pages));
                  }}
                />
                <IconButton
                  icon={ChevronRight}
                  label="Trang sau"
                  disabled={params.page >= pages}
                  onClick={() => {
                    goPage(params.page + 1);
                  }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
