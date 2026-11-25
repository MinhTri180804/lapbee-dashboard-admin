import { CircleDashed, FolderPlus, Images, Search, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useCan } from '@/shared/auth/permissions';
import { Button, PageHeader, Spinner } from '@/shared/ui';
import { FolderTree } from '../components/FolderTree';
import { MediaGrid } from '../components/MediaGrid';
import { UploadQueue } from '../components/UploadQueue';
import { useFolders } from '../hooks/use-folders';
import { useMediaList } from '../hooks/use-media-list';
import { useMediaTotal } from '../hooks/use-media-total';
import { useUploadQueue } from '../hooks/use-upload-queue';
import type { MediaListParams } from '../model/adapters';
import { findFolder } from '../model/folder-tree';
import styles from './MediaLibraryPage.module.css';

const DEBOUNCE_MS = 300;
const ACCEPT = 'image/jpeg,image/png,image/webp,image/avif';

/** P3-1: a search ignores the folder and the view; the unused view ignores the folder. */
function paramsFrom(sp: URLSearchParams): MediaListParams {
  const q = sp.get('q')?.trim() ?? '';
  if (q) return { folder: null, q, used: null };
  if (sp.get('view') === 'unused') return { folder: null, q: '', used: false };
  return { folder: sp.get('folder') || null, q: '', used: null };
}

/** Uploads go to the open folder; everywhere else (and `root`) they go to the library root. */
function uploadTarget(params: MediaListParams): string | null {
  return params.folder === 'root' ? null : params.folder;
}

export function MediaLibraryPage() {
  const canUpload = useCan('media.upload');
  const [sp, setSp] = useSearchParams();
  const params = paramsFrom(sp);
  const openId = sp.get('id');

  const total = useMediaTotal();
  const unusedTotal = useMediaTotal(false);
  const { tree } = useFolders();
  const list = useMediaList(params);
  const queue = useUploadQueue();
  const fileInput = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState(params.q);
  const [shownQ, setShownQ] = useState(params.q);
  if (shownQ !== params.q) {
    // The URL changed under the box (a folder click, Back): follow it.
    setShownQ(params.q);
    setSearch(params.q);
  }

  /** Writes the screen's own keys and keeps every other parameter. */
  const navigate = (keys: { folder?: string; view?: string; q?: string }, replace = false) => {
    setSp(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const key of ['folder', 'view', 'q'] as const) {
          const value = keys[key];
          if (value) next.set(key, value);
          else next.delete(key);
        }
        return next;
      },
      { replace },
    );
  };

  useEffect(() => {
    const term = search.trim();
    if (term === params.q) return;
    const t = setTimeout(() => {
      navigate(term ? { q: term } : {}, true);
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(t);
    };
    // `navigate` and `params` change every render; only a new term restarts the wait.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, params.q]);

  const go = (keys: { folder?: string; view?: string }) => {
    setSearch('');
    navigate(keys);
  };

  const open = (id: string) => {
    setSp((prev) => {
      const next = new URLSearchParams(prev);
      next.set('id', id);
      return next;
    });
  };

  const view = params.q
    ? 'search'
    : params.used === false
      ? 'unused'
      : params.folder
        ? 'folder'
        : 'all';
  const folderName =
    params.folder === 'root'
      ? 'Gốc thư viện'
      : params.folder
        ? (findFolder(tree, params.folder)?.name ?? 'Thư mục')
        : '';
  const heading = {
    all: 'Thư viện',
    unused: 'Chưa dùng',
    folder: folderName,
    search: 'Kết quả tìm kiếm',
  }[view];
  const emptyText = {
    all: 'Chưa có ảnh nào.',
    unused: 'Chưa có ảnh nào chưa dùng.',
    folder: 'Thư mục này chưa có ảnh.',
    search: 'Không tìm thấy ảnh nào.',
  }[view];

  const items = list.data?.pages.flatMap((p) => p.items) ?? [];
  const listTotal = list.data?.pages[0]?.total;

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Quản trị · Thư viện ảnh"
        title="Thư viện ảnh"
        description="Tải ảnh lên một lần, dùng lại ở Đội ngũ, Hành trình và Bài đăng. Ảnh đang được dùng không xoá được."
        actions={
          <div className={styles.headerActions}>
            {total !== undefined && <span className="lb-label">{total} ảnh</span>}
            <Button
              variant="primary"
              icon={Upload}
              disabled={!canUpload}
              title={canUpload ? undefined : 'Bạn không có quyền tải ảnh lên'}
              onClick={() => fileInput.current?.click()}
            >
              Tải ảnh lên
            </Button>
            <input
              ref={fileInput}
              type="file"
              hidden
              multiple
              accept={ACCEPT}
              aria-label="Chọn ảnh để tải lên"
              disabled={!canUpload}
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                e.target.value = '';
                if (files.length > 0) queue.add(files, uploadTarget(params));
              }}
            />
          </div>
        }
      />

      <div className={styles.layout}>
        <nav className={styles.side} aria-label="Thư mục ảnh">
          <ul className={styles.views}>
            <li>
              <button
                type="button"
                className={styles.view}
                aria-current={view === 'all' || undefined}
                onClick={() => {
                  go({});
                }}
              >
                <Images size={16} aria-hidden="true" />
                <span className={styles.viewName}>Tất cả ảnh</span>{' '}
                <span className={styles.count}>{total}</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className={styles.view}
                aria-current={view === 'unused' || undefined}
                onClick={() => {
                  go({ view: 'unused' });
                }}
              >
                <CircleDashed size={16} aria-hidden="true" />
                <span className={styles.viewName}>Chưa dùng</span>{' '}
                <span className={styles.count}>{unusedTotal}</span>
              </button>
            </li>
          </ul>
          <div className={styles.treeHead}>
            <span className="lb-label">Thư mục</span>
            <span className="lb-label">Tối đa 5 cấp</span>
          </div>
          <FolderTree
            tree={tree}
            selected={view === 'folder' ? params.folder : null}
            onSelect={(id) => {
              go(id ? { folder: id } : {});
            }}
          />
        </nav>

        <section className={styles.main} aria-labelledby="media-heading">
          <div className={styles.toolbar}>
            <div className={styles.titleBlock}>
              <h2 id="media-heading" className={styles.heading}>
                {heading}
              </h2>
              {listTotal !== undefined && <span className="lb-label">{listTotal} ảnh</span>}
            </div>
            <div className={styles.tools}>
              <Button variant="ghost" icon={FolderPlus} disabled title="Sắp có">
                Thư mục mới
              </Button>
              <label className={styles.search}>
                <Search size={16} aria-hidden="true" />
                <input
                  type="search"
                  className={styles.searchInput}
                  placeholder="Tìm trong thư viện"
                  aria-label="Tìm trong thư viện"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                  }}
                />
              </label>
            </div>
          </div>

          {list.data === undefined ? (
            list.isError ? (
              <p role="alert" className={styles.error}>
                Không tải được thư viện ảnh. Thử lại sau.
              </p>
            ) : (
              <Spinner />
            )
          ) : (
            <MediaGrid
              items={items}
              openId={openId}
              onOpen={open}
              emptyText={emptyText}
              hasMore={list.hasNextPage}
              loadingMore={list.isFetchingNextPage}
              onLoadMore={() => void list.fetchNextPage()}
            />
          )}
        </section>
      </div>

      <UploadQueue items={queue.items} busy={queue.busy} onClose={queue.clearFinished} />
    </div>
  );
}
