import { useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { isProblem } from '@/shared/api/errors';
import { useCan } from '@/shared/auth/permissions';
import { messageFor } from '@/shared/form/error-messages';
import { Button, ConfirmDialog, PageHeader, Spinner, useToast } from '@/shared/ui';
import { CategoryDialog, type CategoryFormValues } from '../components/CategoryDialog';
import { CategoryTable, NO_MANAGE_TITLE } from '../components/CategoryTable';
import { useCategories } from '../hooks/use-categories';
import {
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
  type CategoryPatchBody,
} from '../hooks/use-category-mutations';
import { categoryErrorMessage, categoryKeys, type CategoryDto } from '../model/adapters';

const EMPTY: CategoryFormValues = { name: '', slug: '', description: '' };

/** What is open, with the category as it was then: its `version` is what the request sends. */
type Open = { kind: 'create' } | { kind: 'edit' | 'delete'; category: CategoryDto };

/** Content · Categories (§8.5): add, edit, delete and drag ordering. */
export function CategoriesPage() {
  const { data: categories, isError } = useCategories();
  const canManage = useCan('category.manage');
  const toast = useToast();
  const qc = useQueryClient();
  const create = useCreateCategory();
  const update = useUpdateCategory();
  /** Own instance, so an edit cannot drop the reorder's settle. */
  const reorder = useUpdateCategory();
  const remove = useDeleteCategory();
  const [open, setOpen] = useState<Open | null>(null);

  const close = () => {
    setOpen(null);
  };

  const add = async (values: CategoryFormValues) => {
    await create.mutateAsync({
      name: values.name,
      description: values.description,
      // An empty slug is left to the backend, which derives it from the name (P4-7).
      ...(values.slug === '' ? {} : { slug: values.slug }),
    });
    toast.show({ kind: 'success', title: 'Đã thêm chuyên mục' });
  };

  const save = async (values: CategoryFormValues) => {
    if (open?.kind !== 'edit') return;
    const { category } = open;
    const body: CategoryPatchBody = { version: category.version };
    if (values.name !== category.name) body.name = values.name;
    if (values.slug !== category.slug) body.slug = values.slug;
    if (values.description !== category.description) body.description = values.description;
    if (Object.keys(body).length === 1) return; // Nothing changed: just close.
    try {
      await update.mutateAsync({ id: category.id, body });
    } catch (error) {
      // The global dialog owns a conflict; reopening reads the fresh version from the list.
      if (!isProblem(error, 'VERSION_CONFLICT')) throw error;
      close();
      return;
    }
    toast.show({ kind: 'success', title: 'Đã lưu chuyên mục' });
  };

  const destroy = () => {
    if (open?.kind !== 'delete') return;
    const { id, version } = open.category;
    remove.mutate(
      { id, version },
      {
        onSuccess: () => {
          toast.show({ kind: 'success', title: 'Đã xoá chuyên mục' });
          close();
        },
        onError: (error) => {
          if (isProblem(error, 'CATEGORY_NOT_EMPTY')) {
            // The list was stale; the count shown is the freshest one we hold.
            const count = categories?.find((c) => c.id === id)?.postCount ?? 0;
            toast.show({ kind: 'error', title: `Còn ${String(count)} bài trong chuyên mục` });
          } else if (!isProblem(error, 'VERSION_CONFLICT')) {
            const message = isProblem(error) ? categoryErrorMessage(error.code) : null;
            toast.show({ kind: 'error', title: message ?? messageFor(error) });
            return;
          }
          close();
        },
      },
    );
  };

  /**
   * One `PATCH { version, position }` per drop (D10). It settles only once the list has
   * reloaded, so a second drag right after reads the moved category's new version.
   */
  const move = async (category: CategoryDto, position: number) => {
    try {
      await reorder.mutateAsync({ id: category.id, body: { version: category.version, position } });
    } catch (error) {
      if (!isProblem(error, 'VERSION_CONFLICT')) {
        const message = isProblem(error) ? categoryErrorMessage(error.code) : null;
        toast.show({ kind: 'error', title: message ?? messageFor(error) });
      }
      throw error;
    }
    toast.show({ kind: 'success', title: 'Đã đổi thứ tự' });
    await qc.invalidateQueries({ queryKey: categoryKeys.all }, { cancelRefetch: false });
  };

  const shown = open && open.kind !== 'create' ? open.category : undefined;
  const editing = open?.kind === 'edit' ? open.category : undefined;

  return (
    <div>
      <PageHeader
        eyebrow="Nội dung · Chuyên mục"
        title="Chuyên mục"
        actions={
          <Button
            variant="primary"
            icon={Plus}
            disabled={!canManage}
            title={canManage ? undefined : NO_MANAGE_TITLE}
            onClick={() => {
              setOpen({ kind: 'create' });
            }}
          >
            Thêm chuyên mục
          </Button>
        }
      />

      {categories ? (
        <CategoryTable
          categories={categories}
          canManage={canManage}
          onEdit={(category) => {
            setOpen({ kind: 'edit', category });
          }}
          onDelete={(category) => {
            setOpen({ kind: 'delete', category });
          }}
          onMove={move}
        />
      ) : isError ? (
        // Only a failed first load shows the error: a failed refetch keeps the cached list.
        <p role="alert">Không tải được danh sách chuyên mục. Thử lại sau.</p>
      ) : (
        <Spinner />
      )}

      <CategoryDialog
        open={open?.kind === 'create' || open?.kind === 'edit'}
        title={editing ? 'Sửa chuyên mục' : 'Thêm chuyên mục'}
        initial={
          editing
            ? { name: editing.name, slug: editing.slug, description: editing.description }
            : EMPTY
        }
        slugRequired={editing !== undefined}
        submitLabel={editing ? 'Lưu' : 'Thêm'}
        onClose={close}
        onSubmit={editing ? save : add}
      />
      <ConfirmDialog
        open={open?.kind === 'delete'}
        title={`Xoá chuyên mục ${shown?.name ?? ''}?`}
        body="Chuyên mục bị xoá khỏi website."
        confirmLabel="Xoá"
        tone="danger"
        busy={remove.isPending}
        onConfirm={destroy}
        onCancel={close}
      />
    </div>
  );
}
