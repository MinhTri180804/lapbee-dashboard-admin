import { Search } from 'lucide-react';
import { Select } from '@/shared/ui';
import { STATUS_LABEL, type PostStatus } from '../model/adapters';
import styles from './PostFilters.module.css';

export type CategoryTag = { id: string; name: string; count: number };

export type PostFiltersProps = {
  /** "Tất cả" count: every post. */
  total: number | undefined;
  categories: CategoryTag[];
  cat: string | null;
  onCat: (id: string | null) => void;
  search: string;
  onSearch: (value: string) => void;
  status: PostStatus | null;
  onStatus: (status: PostStatus | null) => void;
};

const STATUS_OPTIONS = [
  { value: '', label: 'Mọi trạng thái' },
  { value: 'published', label: STATUS_LABEL.published },
  { value: 'draft', label: STATUS_LABEL.draft },
];

function Tag({
  label,
  count,
  selected,
  onClick,
}: {
  label: string;
  count: number | undefined;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className={styles.tag} aria-pressed={selected} onClick={onClick}>
      {label}
      {count === undefined ? null : (
        <>
          <span className={styles.count} aria-hidden="true">
            {count}
          </span>
          <span className="lb-sr-only">{`, ${String(count)} bài`}</span>
        </>
      )}
    </button>
  );
}

export function PostFilters({
  total,
  categories,
  cat,
  onCat,
  search,
  onSearch,
  status,
  onStatus,
}: PostFiltersProps) {
  return (
    <div className={styles.bar}>
      <div className={styles.tags} role="group" aria-label="Lọc theo chuyên mục">
        <Tag
          label="Tất cả"
          count={total}
          selected={cat === null}
          onClick={() => {
            onCat(null);
          }}
        />
        {categories.map((c) => (
          <Tag
            key={c.id}
            label={c.name}
            count={c.count}
            selected={cat === c.id}
            onClick={() => {
              onCat(c.id);
            }}
          />
        ))}
      </div>
      <div className={styles.tools}>
        <label className={styles.search}>
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Tìm theo tiêu đề"
            aria-label="Tìm theo tiêu đề"
            maxLength={200}
            value={search}
            onChange={(e) => {
              onSearch(e.target.value);
            }}
          />
        </label>
        <Select
          className={styles.status ?? ''}
          label="Trạng thái"
          options={STATUS_OPTIONS}
          value={status ?? ''}
          onChange={(value) => {
            onStatus(value === 'draft' || value === 'published' ? value : null);
          }}
        />
      </div>
    </div>
  );
}
