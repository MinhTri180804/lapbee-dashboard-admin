import { useEffect, useState } from 'react';
import { Upload } from 'lucide-react';
import { ProblemError } from '@/shared/api/errors';
import { useCan } from '@/shared/auth/permissions';
import { Button, Dialog, Spinner, TextField } from '@/shared/ui';
import { useMediaList } from '../hooks/use-media-list';
import { useUploadMedia } from '../hooks/use-upload-media';
import { toMediaThumb, uploadErrorMessage, type MediaThumb } from '../model/adapters';
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

  useEffect(() => {
    const t = setTimeout(() => {
      setQ(search.trim());
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(t);
    };
  }, [search]);

  const list = useMediaList({ folder: null, q, used: null }, open && canRead);
  const upload = useUploadMedia();
  const items = list.data?.pages.flatMap((p) => p.items) ?? [];

  function pick(thumb: MediaThumb) {
    setSelectedId(thumb.id);
    onPick(thumb);
  }

  function onFile(file: File | undefined) {
    if (!file) return;
    setUploadError(null);
    upload.mutate(file, {
      onSuccess: (created) => {
        pick(toMediaThumb(created));
      },
      onError: (e) => {
        setUploadError(uploadErrorMessage(e instanceof ProblemError ? e.code : undefined));
      },
    });
  }

  return (
    <Dialog open={open} title={title} onClose={onClose} size="wide">
      {!canRead ? (
        <p>Bạn không có quyền xem thư viện ảnh.</p>
      ) : (
        <div className={styles.body}>
          <div className={styles.toolbar}>
            <TextField
              label="Tìm trong thư viện"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
            />
            {canUpload && (
              <label className={styles.upload}>
                <Upload size={16} aria-hidden="true" />
                <span>Tải ảnh lên</span>
                <input
                  type="file"
                  className={styles.file}
                  aria-label="Tải ảnh lên"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  disabled={upload.isPending}
                  onChange={(e) => {
                    onFile(e.target.files?.[0]);
                    e.target.value = '';
                  }}
                />
              </label>
            )}
          </div>
          {uploadError && (
            <p role="alert" className={styles.error}>
              {uploadError}
            </p>
          )}
          {list.isPending && <Spinner />}
          {list.isError && <p className={styles.error}>Không tải được thư viện ảnh.</p>}
          {list.isSuccess && items.length === 0 && <p>Chưa có ảnh nào.</p>}
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
              Xem thêm
            </Button>
          )}
        </div>
      )}
    </Dialog>
  );
}
