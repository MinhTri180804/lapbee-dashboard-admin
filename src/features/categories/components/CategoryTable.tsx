import { verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button, SortableItem, SortableItems } from '@/shared/ui';
import type { CategoryDto } from '../model/adapters';
import styles from './CategoryTable.module.css';

export const NO_MANAGE_TITLE = 'Bạn không có quyền quản lý chuyên mục';
const BUSY_TITLE = 'Đang đổi thứ tự';

export type CategoryTableProps = {
  /** Server (position) order. */
  categories: readonly CategoryDto[];
  canManage: boolean;
  onEdit: (category: CategoryDto) => void;
  onDelete: (category: CategoryDto) => void;
  /** Sends `{ version, position }` for the dragged category; settles after the list reloads. */
  onMove: (category: CategoryDto, position: number) => Promise<unknown>;
};

function deleteTitle(canManage: boolean, busy: boolean, postCount: number): string | undefined {
  if (!canManage) return NO_MANAGE_TITLE;
  if (busy) return BUSY_TITLE;
  if (postCount > 0) return `Còn ${String(postCount)} bài trong chuyên mục`;
  return undefined;
}

/** The §8.5 table: a list styled as a grid so rows can be dragged (D10). */
export function CategoryTable({
  categories,
  canManage,
  onEdit,
  onDelete,
  onMove,
}: CategoryTableProps) {
  if (categories.length === 0) {
    return <p className={styles.empty}>Chưa có chuyên mục nào.</p>;
  }
  return (
    <div className={styles.table}>
      <div className={styles.head} aria-hidden="true">
        <span />
        <span>Tên</span>
        <span>Đường dẫn</span>
        <span>Mô tả</span>
        <span className={styles.num}>Số bài</span>
        <span />
      </div>
      <SortableItems
        items={categories}
        titleOf={(c) => c.name}
        strategy={verticalListSortingStrategy}
        onMove={onMove}
      >
        {(ordered) => (
          <ul className={styles.list} aria-label="Danh sách chuyên mục">
            {ordered.map((c) => (
              <SortableItem
                key={c.id}
                id={c.id}
                title={c.name}
                disabled={!canManage}
                disabledTitle={NO_MANAGE_TITLE}
                className={styles.row}
              >
                {(handle, _dragging, busy) => (
                  <>
                    {handle}
                    <span className={styles.name} data-cell="name">
                      {c.name}
                    </span>
                    <span className={styles.slug}>{`/${c.slug}`}</span>
                    <span className={styles.desc} title={c.description || undefined}>
                      {c.description}
                    </span>
                    <span className={styles.num}>
                      {c.postCount}
                      <span className="lb-sr-only"> bài</span>
                    </span>
                    <span className={styles.actions}>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`Sửa ${c.name}`}
                        disabled={!canManage || busy}
                        title={!canManage ? NO_MANAGE_TITLE : busy ? BUSY_TITLE : undefined}
                        onClick={() => {
                          onEdit(c);
                        }}
                      >
                        Sửa
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`Xoá ${c.name}`}
                        disabled={!canManage || busy || c.postCount > 0}
                        title={deleteTitle(canManage, busy, c.postCount)}
                        onClick={() => {
                          onDelete(c);
                        }}
                      >
                        Xoá
                      </Button>
                    </span>
                  </>
                )}
              </SortableItem>
            ))}
          </ul>
        )}
      </SortableItems>
    </div>
  );
}
