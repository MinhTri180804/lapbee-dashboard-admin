import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  type SortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { createContext, use, useState, type CSSProperties, type ReactNode } from 'react';
import styles from './SortableItems.module.css';

type Sortable = { id: string; version: number };

export type SortableItemsProps<T extends Sortable> = {
  /** Server order. */
  items: readonly T[];
  /** Name used in the handle label and screen reader announcements. */
  titleOf: (item: T) => string;
  strategy: SortingStrategy;
  /**
   * Sends `{ version, position }` for the moved item and returns the request. Use a
   * dedicated `mutateAsync`: per-call `mutate` callbacks are dropped when the same
   * mutation is called again before it settles.
   */
  onMove: (item: T, position: number) => Promise<unknown>;
  children: (items: readonly T[]) => ReactNode;
};

/** True while a reorder request is in flight: further drags are refused. */
const ReorderBusy = createContext(false);

/**
 * Keyboard and pointer reordering with an optimistic local order. The local order is
 * dropped once the request settles: on success the site cache already holds the new
 * order, on error the server order comes back. One reorder at a time: a second drag would
 * send an item version the first request has not updated yet.
 */
export function SortableItems<T extends Sortable>({
  items,
  titleOf,
  strategy,
  onMove,
  children,
}: SortableItemsProps<T>) {
  const [pending, setPending] = useState<readonly string[] | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const byId = new Map(items.map((item) => [item.id, item]));
  const ordered = pending
    ? pending.flatMap((id) => {
        const item = byId.get(id);
        return item ? [item] : [];
      })
    : items;
  const ids = ordered.map((item) => item.id);

  const title = (id: UniqueIdentifier) => {
    const item = byId.get(String(id));
    return item ? titleOf(item) : '';
  };
  const place = (id: UniqueIdentifier) => String(ids.indexOf(String(id)) + 1);

  const announcements: Announcements = {
    onDragStart: ({ active }) => `Đã nhấc ${title(active.id)}.`,
    onDragOver: ({ active, over }) =>
      over ? `Đã chuyển ${title(active.id)} tới vị trí ${place(over.id)}.` : undefined,
    onDragEnd: ({ active, over }) =>
      over ? `Đã thả ${title(active.id)} ở vị trí ${place(over.id)}.` : undefined,
    onDragCancel: ({ active }) => `Đã huỷ kéo ${title(active.id)}.`,
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (pending || !over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    const item = byId.get(String(active.id));
    if (from < 0 || to < 0 || !item) return;
    setPending(arrayMove(ids, from, to));
    onMove(item, to)
      .catch(() => undefined) // The global toast reports the failure.
      .finally(() => {
        setPending(null);
      });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      accessibility={{
        announcements,
        screenReaderInstructions: {
          draggable: 'Nhấn Space để nhấc, mũi tên để di chuyển, Space để thả, Esc để huỷ.',
        },
      }}
    >
      <SortableContext items={ids} strategy={strategy}>
        <ReorderBusy value={pending !== null}>{children(ordered)}</ReorderBusy>
      </SortableContext>
    </DndContext>
  );
}

export type SortableItemProps = {
  id: string;
  /** Item name for the handle label. */
  title: string;
  /** No permission to reorder: the handle is disabled with a tooltip. */
  disabled: boolean;
  /** Tooltip shown on the disabled handle, e.g. "Bạn không có quyền …". */
  disabledTitle?: string | undefined;
  /** Tooltip shown on the handle while a reorder is in flight, e.g. "Đang đổi thứ tự". */
  busyTitle?: string | undefined;
  className?: string | undefined;
  /**
   * Renders the item; `handle` is the drag handle button to place inside. `busy` is true while
   * a reorder is in flight: other writes to the items would send a stale version.
   */
  children: (handle: ReactNode, dragging: boolean, busy: boolean) => ReactNode;
};

/** One sortable item; only the handle starts a drag, so the rest of the item stays clickable. */
export function SortableItem({
  id,
  title,
  disabled,
  disabledTitle,
  busyTitle,
  className,
  children,
}: SortableItemProps) {
  // While busy the handle stays focusable (aria-disabled) so keyboard focus is not lost.
  const busy = use(ReorderBusy);
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: disabled || busy });
  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
  };
  const handle = (
    <button
      type="button"
      ref={setActivatorNodeRef}
      className={styles.handle}
      {...attributes}
      {...listeners}
      aria-label={`Đổi thứ tự ${title}`}
      title={disabled ? disabledTitle : busy ? busyTitle : undefined}
      disabled={disabled}
      aria-disabled={disabled || busy || undefined}
    >
      <GripVertical size={16} aria-hidden="true" />
    </button>
  );
  return (
    <li
      ref={setNodeRef}
      style={style}
      className={[className, isDragging ? styles.dragging : null].filter(Boolean).join(' ')}
    >
      {children(handle, isDragging, busy)}
    </li>
  );
}
