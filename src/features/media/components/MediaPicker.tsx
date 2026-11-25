import { useEffect, useState } from 'react';
import { Images, Upload } from 'lucide-react';
import { useCan } from '@/shared/auth/permissions';
import { Button, Dialog, Spinner, TextField } from '@/shared/ui';
import { useFolders } from '../hooks/use-folders';
import { useMediaList } from '../hooks/use-media-list';
import { FolderTree } from './FolderTree';
import { useUploadMedia } from '../hooks/use-upload-media';
import { toMediaThumb, uploadErrorText, type MediaThumb } from '../model/adapters';
import styles from './MediaPicker.module.css';

export type MediaPickerProps = {
  open: boolean;
  onClose: () => void;
  onPick: (m: MediaThumb) => void;
  title?: string;
};

const DEBOUNCE_MS = 300;

export function MediaPicker({ open, onClose, onPick, title = 'Chọn ảnh' }: MediaPickerProps) {
  const canRead = useCan('media.read');
  const canUpload = useCan('media.upload');
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [folder, setFolder] = useState<string | null>(null);

  // Everything starts fresh each time the picker opens or closes.
  const [shownOpen, setShownOpen] = useState(open);
  if (shownOpen !== open) {
    setShownOpen(open);
    setSearch('');
    setQ('');
    setFolder(null);
    setSelectedId(null);
    setUploadError(null);
  }

  useEffect(() => {
    const t = setTimeout(() => {
      setQ(search.trim());
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(t);
    };
  }, [search]);

  const { tree } = useFolders(open && canRead);
  // A search covers the whole library: it ignores the folder and shows none selected.
  const activeFolder = q ? null : folder;
  const list = useMediaList({ folder: activeFolder, q, used: null }, open && canRead);
  const upload = useUploadMedia();
  const items = list.data?.pages.flatMap((p) => p.items) ?? [];
  // The library page's copy for each state.
  const emptyText = q
    ? 'Không tìm thấy ảnh nào.'
    : activeFolder
      ? 'Thư mục này chưa có ảnh.'
      : 'Chưa có ảnh nào.';

  function pick(thumb: MediaThumb) {
    setSelectedId(thumb.id);
    onPick(thumb);
  }

  function onFile(file: File | undefined) {
    if (!file) return;
    setUploadError(null);
    upload.mutate(
      { file, folderId: activeFolder },
      {
        onSuccess: (created) => {
          pick(toMediaThumb(created));
        },
        onError: (e) => {
          setUploadError(uploadErrorText(e));
        },
      },
    );
  }

  return (
    <Dialog open={open} title={title} onClose={onClose} size="wide">
      {!canRead ? (
        <p>Bạn không có quyền xem thư viện ảnh.</p>
      ) : (
        <div className={styles.layout}>
          <nav className={styles.side} aria-label="Thư mục">
            <button
              type="button"
              className={styles.all}
              aria-current={activeFolder === null || undefined}
              onClick={() => {
                setFolder(null);
                setSearch('');
                setQ('');
              }}
            >
              <Images size={16} aria-hidden="true" />
              <span>Tất cả ảnh</span>
            </button>
            <FolderTree
              tree={tree}
              selected={activeFolder}
              compact
              onSelect={(id) => {
                setFolder(id);
                setSearch('');
                setQ('');
              }}
            />
          </nav>
          <div className={styles.body}>
            <div className={styles.toolbar}>
              <TextField
                label="Tìm trong thư viện"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
              />
              <label
                className={styles.upload}
                data-disabled={!canUpload || undefined}
                title={canUpload ? undefined : 'Bạn không có quyền tải ảnh lên'}
              >
                <Upload size={16} aria-hidden="true" />
                <span>Tải ảnh lên</span>
                <input
                  type="file"
                  className={styles.file}
                  aria-label="Tải ảnh lên"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  disabled={!canUpload || upload.isPending}
                  onChange={(e) => {
                    onFile(e.target.files?.[0]);
                    e.target.value = '';
                  }}
                />
              </label>
            </div>
            {uploadError && (
              <p role="alert" className={styles.error}>
                {uploadError}
              </p>
            )}
            {list.isPending && <Spinner />}
            {list.isError && <p className={styles.error}>Không tải được thư viện ảnh.</p>}
            {list.isSuccess && items.length === 0 && <p>{emptyText}</p>}
            <ul className={styles.grid}>
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={styles.cell}
                    data-selected={item.id === selectedId || undefined}
                    aria-pressed={item.id === selectedId}
                    onClick={() => {
                      pick(toMediaThumb(item));
                    }}
                  >
                    <img src={item.thumbUrl} alt={item.alt || item.name} loading="lazy" />
                  </button>
                </li>
              ))}
            </ul>
            {list.hasNextPage && (
              <Button
                variant="secondary"
                loading={list.isFetchingNextPage}
                onClick={() => void list.fetchNextPage()}
              >
                Tải thêm
              </Button>
            )}
          </div>
        </div>
      )}
    </Dialog>
  );
}
