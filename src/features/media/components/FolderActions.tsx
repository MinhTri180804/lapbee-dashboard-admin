import { FolderPlus } from 'lucide-react';
import { useState } from 'react';
import { isProblem } from '@/shared/api/errors';
import { useCan } from '@/shared/auth/permissions';
import { messageFor } from '@/shared/form/error-messages';
import { Button, ConfirmDialog, useToast } from '@/shared/ui';
import { useCreateFolder, useDeleteFolder, useUpdateFolder } from '../hooks/use-folder-mutations';
import { folderErrorMessage } from '../model/adapters';
import { MAX_FOLDER_DEPTH, type FolderNode } from '../model/folder-tree';
import { FolderNameDialog } from './FolderNameDialog';
import { MoveDialog } from './MoveDialog';

const NO_UPDATE = 'Bạn không có quyền sửa thư mục';
const NO_DELETE = 'Bạn không có quyền xoá thư mục';
const TOO_DEEP = 'Thư mục chỉ lồng tối đa 5 cấp.';
const NOT_EMPTY = 'Thư mục còn ảnh hoặc thư mục con.';

/** What is open, with the folder as it was then: its `version` is what the request sends. */
type Open =
  | { kind: 'create'; parentId: string | null }
  | { kind: 'rename' | 'move' | 'delete'; folder: FolderNode };

export type FolderActionsProps = {
  tree: FolderNode[];
  /** The selected real folder; `undefined` at the root, in a view or search, or when it is gone. */
  folder: FolderNode | undefined;
  /** Select a folder, or `null` for "Tất cả ảnh". */
  onSelect: (id: string | null) => void;
};

/** "Thư mục mới" and, with a folder selected, its "Đổi tên", "Chuyển tới…" and "Xoá" (P3-6). */
export function FolderActions({ tree, folder, onSelect }: FolderActionsProps) {
  const canUpdate = useCan('media.update');
  const canDelete = useCan('media.delete');
  const toast = useToast();
  const create = useCreateFolder();
  const update = useUpdateFolder();
  const remove = useDeleteFolder();
  const [open, setOpen] = useState<Open | null>(null);

  const tooDeep = folder?.depth === MAX_FOLDER_DEPTH;
  const createTitle = !canUpdate
    ? 'Bạn không có quyền tạo thư mục'
    : tooDeep
      ? TOO_DEEP
      : undefined;
  const hasContent = folder !== undefined && (folder.mediaCount > 0 || folder.children.length > 0);
  const deleteTitle = !canDelete ? NO_DELETE : hasContent ? NOT_EMPTY : undefined;

  const close = () => {
    setOpen(null);
  };

  /** Shows a failed move or delete; a version conflict already opened the global dialog. */
  const fail = (error: unknown) => {
    if (isProblem(error, 'VERSION_CONFLICT')) return;
    const message = isProblem(error) ? folderErrorMessage(error.code) : null;
    toast.show({ kind: 'error', title: message ?? messageFor(error) });
  };

  const rename = async (name: string) => {
    if (open?.kind !== 'rename') return;
    if (name === open.folder.name) return; // Nothing changed: just close.
    try {
      await update.mutateAsync({
        id: open.folder.id,
        body: { version: open.folder.version, name },
      });
    } catch (error) {
      // The global dialog owns a conflict; reopening reads the fresh version from the tree.
      if (!isProblem(error, 'VERSION_CONFLICT')) throw error;
      close();
      return;
    }
    toast.show({ kind: 'success', title: 'Đã đổi tên thư mục' });
  };

  const makeFolder = async (name: string) => {
    if (open?.kind !== 'create') return;
    const created = await create.mutateAsync({ name, parentId: open.parentId });
    toast.show({ kind: 'success', title: 'Đã tạo thư mục' });
    onSelect(created.id);
  };

  const move = (target: string | null) => {
    if (open?.kind !== 'move') return;
    update.mutate(
      { id: open.folder.id, body: { version: open.folder.version, parentId: target } },
      {
        onSuccess: () => {
          toast.show({ kind: 'success', title: 'Đã chuyển thư mục' });
          close();
        },
        onError: (error) => {
          fail(error);
          if (isProblem(error, 'VERSION_CONFLICT')) close();
        },
      },
    );
  };

  const destroy = () => {
    if (open?.kind !== 'delete') return;
    const { id, version, parentId } = open.folder;
    remove.mutate(
      { id, version },
      {
        onSuccess: () => {
          toast.show({ kind: 'success', title: 'Đã xoá thư mục' });
          close();
          onSelect(parentId);
        },
        onError: (error) => {
          fail(error);
          if (isProblem(error, 'FOLDER_NOT_EMPTY') || isProblem(error, 'VERSION_CONFLICT')) close();
        },
      },
    );
  };

  const shown = open && open.kind !== 'create' ? open.folder : undefined;
  const nameOpen = open?.kind === 'create' || open?.kind === 'rename';

  return (
    <>
      <Button
        variant="ghost"
        icon={FolderPlus}
        disabled={!canUpdate || tooDeep}
        title={createTitle}
        onClick={() => {
          setOpen({ kind: 'create', parentId: folder?.id ?? null });
        }}
      >
        Thư mục mới
      </Button>
      {folder && (
        <>
          <Button
            variant="ghost"
            disabled={!canUpdate}
            title={canUpdate ? undefined : NO_UPDATE}
            onClick={() => {
              setOpen({ kind: 'rename', folder });
            }}
          >
            Đổi tên
          </Button>
          <Button
            variant="ghost"
            disabled={!canUpdate}
            title={canUpdate ? undefined : NO_UPDATE}
            onClick={() => {
              setOpen({ kind: 'move', folder });
            }}
          >
            Chuyển tới…
          </Button>
          <Button
            variant="ghost"
            disabled={!canDelete || hasContent}
            title={deleteTitle}
            onClick={() => {
              setOpen({ kind: 'delete', folder });
            }}
          >
            Xoá
          </Button>
        </>
      )}

      <FolderNameDialog
        open={nameOpen}
        title={open?.kind === 'rename' ? 'Đổi tên thư mục' : 'Thư mục mới'}
        initialName={open?.kind === 'rename' ? open.folder.name : ''}
        submitLabel={open?.kind === 'rename' ? 'Lưu' : 'Tạo'}
        onClose={close}
        onSubmit={open?.kind === 'rename' ? rename : makeFolder}
      />
      <MoveDialog
        open={open?.kind === 'move'}
        title={`Chuyển thư mục ${shown?.name ?? ''} tới`}
        tree={tree}
        movingFolderId={shown?.id ?? null}
        currentFolderId={shown?.parentId}
        onClose={close}
        busy={update.isPending}
        onConfirm={move}
      />
      <ConfirmDialog
        open={open?.kind === 'delete'}
        title={`Xoá thư mục ${shown?.name ?? ''}?`}
        body="Thư mục trống sẽ bị xoá."
        confirmLabel="Xoá"
        tone="danger"
        busy={remove.isPending}
        onConfirm={destroy}
        onCancel={close}
      />
    </>
  );
}
