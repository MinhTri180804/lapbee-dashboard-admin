import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2, X } from 'lucide-react';
import { useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { isProblem } from '@/shared/api/errors';
import { useCan } from '@/shared/auth/permissions';
import { applyProblemToForm } from '@/shared/form/apply-problem-to-form';
import { messageFor } from '@/shared/form/error-messages';
import { useRebasingForm } from '@/shared/form/use-rebasing-form';
import {
  Button,
  CharCount,
  ConfirmDialog,
  Dialog,
  IconButton,
  Select,
  Spinner,
  TextArea,
  TextField,
  useToast,
} from '@/shared/ui';
import { useFolders } from '../hooks/use-folders';
import { useMediaDetail } from '../hooks/use-media-detail';
import { useDeleteMedia, useUpdateMedia, type MediaPatchBody } from '../hooks/use-media-mutations';
import { formatMediaMeta, USAGE_KIND_LABEL, type MediaDetailDto } from '../model/adapters';
import type { FolderNode } from '../model/folder-tree';
import styles from './MediaDetailPanel.module.css';

const TITLE = 'Chi tiết ảnh';
const NO_UPDATE = 'Bạn không có quyền sửa ảnh';
const NO_DELETE = 'Bạn không có quyền xoá ảnh';
const IN_USE = 'Ảnh đang được dùng, không xoá được.';
const NAME_MAX = 200;
const ALT_MAX = 300;
/** The value of the "Gốc thư viện" option (`folderId: null`). */
const ROOT = '';

/** Below this width the panel is a dialog instead of the third column. */
const NARROW_QUERY = '(max-width: 1199px)';

const schema = z.object({
  name: z
    .string()
    .refine((v) => v.trim().length > 0, 'Không được để trống.')
    .refine((v) => v.length <= NAME_MAX, `Tên ảnh tối đa ${String(NAME_MAX)} ký tự.`),
  alt: z.string().max(ALT_MAX, `Văn bản thay thế tối đa ${String(ALT_MAX)} ký tự.`),
});

type Values = z.infer<typeof schema>;

function toValues(dto: { name: string; alt: string }): Values {
  return { name: dto.name, alt: dto.alt };
}

function subscribeNarrow(onChange: () => void): () => void {
  if (typeof window.matchMedia !== 'function') return () => undefined;
  const mq = window.matchMedia(NARROW_QUERY);
  mq.addEventListener('change', onChange);
  return () => {
    mq.removeEventListener('change', onChange);
  };
}

function isNarrow(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia(NARROW_QUERY).matches;
}

/** True on screens too narrow for the third column (the panel then opens as a dialog). */
export function useNarrowPanel(): boolean {
  return useSyncExternalStore(subscribeNarrow, isNarrow, () => false);
}

/** "Gốc thư viện", then every folder by its full path, depth first. */
function folderOptions(tree: FolderNode[]): { value: string; label: string }[] {
  const out = [{ value: ROOT, label: 'Gốc thư viện' }];
  const walk = (nodes: FolderNode[], prefix: string) => {
    for (const node of nodes) {
      const label = prefix ? `${prefix} / ${node.name}` : node.name;
      out.push({ value: node.id, label });
      walk(node.children, label);
    }
  };
  walk(tree, '');
  return out;
}

export type MediaDetailPanelProps = {
  id: string;
  /**
   * Bumped by the page when the user's own bulk move included this image: the panel then
   * adopts the next server version instead of conflicting with the user's own write.
   */
  ownMoves?: number;
  onClose: () => void;
};

/**
 * The open image (P3-4): rename and alt in one form, the folder saved on change, usages and
 * delete. A right column on wide screens, a wide dialog on narrow ones. Key it by `id`.
 */
export function MediaDetailPanel({ id, ownMoves = 0, onClose }: MediaDetailPanelProps) {
  const narrow = useNarrowPanel();
  const toast = useToast();
  const remove = useDeleteMedia();
  const [deleting, setDeleting] = useState(false);
  const detail = useMediaDetail(id, { paused: deleting });

  /**
   * Deletes here, not in the form: the delete removes the detail query, and the form may
   * unmount before the URL drops `id`. The query stays paused until the panel closes.
   */
  const deleteMedia = (version: number, onFail: (error: Error) => void) => {
    setDeleting(true);
    remove.mutate(
      { id, version },
      {
        onSuccess: () => {
          toast.show({ kind: 'success', title: 'Đã xoá ảnh' });
          onClose();
        },
        onError: (error) => {
          setDeleting(false);
          onFail(error);
        },
      },
    );
  };

  let body: ReactNode;
  if (detail.data === undefined) {
    body = detail.isError ? (
      <p role="alert" className={styles.state}>
        {isProblem(detail.error, 'NOT_FOUND')
          ? 'Không tìm thấy ảnh này.'
          : 'Không tải được ảnh. Thử lại sau.'}
      </p>
    ) : (
      <Spinner />
    );
  } else {
    body = (
      <DetailForm
        live={detail.data}
        ownMoves={ownMoves}
        deleting={deleting}
        onDelete={deleteMedia}
        onReload={() => void detail.refetch()}
      />
    );
  }

  if (narrow) {
    return (
      <Dialog open title={TITLE} size="wide" onClose={onClose}>
        {body}
      </Dialog>
    );
  }
  return (
    <aside className={styles.panel} aria-label={TITLE}>
      <IconButton icon={X} label="Đóng" size="sm" className={styles.close} onClick={onClose} />
      {body}
    </aside>
  );
}

function DetailForm({
  live,
  ownMoves,
  deleting,
  onDelete,
  onReload,
}: {
  /** The image as the cache holds it now; the form keeps the copy it opened with. */
  live: MediaDetailDto;
  ownMoves: number;
  deleting: boolean;
  onDelete: (version: number, onFail: (error: Error) => void) => void;
  onReload: () => void;
}) {
  const toast = useToast();
  const canUpdate = useCan('media.update');
  const canDelete = useCan('media.delete');
  const { tree } = useFolders();
  const update = useUpdateMedia();

  const form = useForm<Values>({
    defaultValues: toValues(live),
    resolver: zodResolver(schema),
  });
  const { baseline, onConflict, rebaseFromSent, rebaseOnNextVersion } = useRebasingForm({
    form,
    server: { values: toValues(live), version: live.version },
  });
  // Only a bump after the form opened counts; the count it opened with is history.
  const seenMoves = useRef(ownMoves);
  useEffect(() => {
    if (ownMoves === seenMoves.current) return;
    seenMoves.current = ownMoves;
    rebaseOnNextVersion();
  }, [ownMoves, rebaseOnNextVersion]);
  const { register, formState, handleSubmit } = form;
  const { errors, isDirty } = formState;
  const alt = useWatch({ control: form.control, name: 'alt' });

  /** The folder just chosen here, shown until the cache catches up with that version. */
  const [moved, setMoved] = useState<{ folderId: string | null; version: number } | null>(null);
  const folderId = moved && moved.version >= live.version ? moved.folderId : live.folderId;
  const [confirming, setConfirming] = useState(false);
  const usagesId = useId();

  const busy = update.isPending;
  const saving = busy && update.variables.body.folderId === undefined;
  const options = folderOptions(tree);
  const folderValue = folderId ?? ROOT;
  if (!options.some((o) => o.value === folderValue)) {
    // Folders not loaded yet (or the folder is new): keep the select on the image's folder.
    options.push({ value: folderValue, label: 'Thư mục' });
  }

  const onWriteError = (error: Error) => {
    if (isProblem(error, 'VERSION_CONFLICT')) {
      // The global dialog asks to reload; the reload becomes the new baseline.
      onConflict();
    } else if (isProblem(error, 'VALIDATION_FAILED')) {
      applyProblemToForm(error, form.setError, {}, ['name', 'alt']);
    } else {
      toast.show({ kind: 'error', title: messageFor(error) });
    }
  };

  const save = (values: Values) => {
    const initial = baseline.initial;
    const body: MediaPatchBody = { version: baseline.version };
    if (values.name !== initial.name) body.name = values.name;
    if (values.alt !== initial.alt) body.alt = values.alt;
    if (Object.keys(body).length === 1) return;
    const sent = structuredClone(values);
    update.mutate(
      { id: live.id, body },
      {
        onSuccess: (dto) => {
          rebaseFromSent({ values: toValues(dto), version: dto.version }, sent);
          toast.show({ kind: 'success', title: 'Đã lưu ảnh' });
        },
        onError: onWriteError,
      },
    );
  };

  const move = (value: string) => {
    const next = value === ROOT ? null : value;
    if (next === folderId) return;
    setMoved({ folderId: next, version: Number.MAX_SAFE_INTEGER });
    update.mutate(
      { id: live.id, body: { version: baseline.version, folderId: next } },
      {
        onSuccess: (dto) => {
          setMoved({ folderId: dto.folderId, version: dto.version });
          // Our own write moved the version: rebase so the next save does not conflict with
          // it, keeping the name and alt typed so far.
          rebaseFromSent({ values: toValues(dto), version: dto.version }, baseline.initial);
          toast.show({ kind: 'success', title: 'Đã chuyển ảnh' });
        },
        onError: (error) => {
          setMoved(null);
          onWriteError(error);
        },
      },
    );
  };

  const confirmDelete = () => {
    onDelete(baseline.version, (error) => {
      setConfirming(false);
      if (isProblem(error, 'MEDIA_IN_USE')) {
        toast.show({ kind: 'error', title: IN_USE });
        onReload();
      } else if (isProblem(error, 'VERSION_CONFLICT')) {
        onConflict();
      } else {
        toast.show({ kind: 'error', title: messageFor(error) });
      }
    });
  };

  const used = live.usages.length > 0;
  const deleteTitle = !canDelete ? NO_DELETE : used ? IN_USE : undefined;
  const altText = live.alt || live.name;

  return (
    <div className={styles.body}>
      <img className={styles.image} src={live.url} alt={altText} />
      <div className={styles.head}>
        <h2 className={styles.name}>{live.name}</h2>
        <p className={styles.meta}>{formatMediaMeta(live)}</p>
      </div>

      <form
        className={styles.form}
        noValidate
        onSubmit={(e) => {
          void handleSubmit(save)(e);
        }}
      >
        <TextField
          label="Tên ảnh"
          readOnly={!canUpdate}
          {...(errors.name?.message ? { error: errors.name.message } : {})}
          {...register('name')}
        />
        <div className={styles.field}>
          <TextArea
            label="Văn bản thay thế"
            rows={3}
            hint="Tự điền vào alt khi chèn ảnh vào bài viết."
            readOnly={!canUpdate}
            {...(errors.alt?.message ? { error: errors.alt.message } : {})}
            {...register('alt')}
          />
          <div className={styles.count}>
            <CharCount value={alt} max={ALT_MAX} />
          </div>
        </div>
        {errors.root?.server?.message ? (
          <p role="alert" className={styles.error}>
            {errors.root.server.message}
          </p>
        ) : null}
        <div title={canUpdate ? undefined : NO_UPDATE}>
          <Select
            label="Thư mục"
            options={options}
            value={folderValue}
            disabled={!canUpdate || busy || deleting}
            onChange={move}
          />
        </div>

        <section className={styles.usages} aria-labelledby={usagesId}>
          <h3 id={usagesId} className="lb-label">
            Đang dùng ở
          </h3>
          {used ? (
            <ul className={styles.usageList}>
              {live.usages.map((u) => (
                <li key={`${u.kind}:${u.id}`}>
                  {`${USAGE_KIND_LABEL[u.kind] ?? u.source} · ${u.label}`}
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.unused}>Chưa được dùng ở đâu.</p>
          )}
        </section>

        <div className={styles.actions}>
          <Button
            type="submit"
            variant="primary"
            loading={saving}
            disabled={!canUpdate || !isDirty || busy || deleting}
            title={canUpdate ? undefined : NO_UPDATE}
          >
            Lưu thay đổi
          </Button>
          <Button
            variant="ghost"
            icon={Trash2}
            className={styles.danger}
            disabled={!canDelete || used || busy}
            title={deleteTitle}
            onClick={() => {
              setConfirming(true);
            }}
          >
            Xoá ảnh
          </Button>
        </div>
      </form>

      <ConfirmDialog
        open={confirming}
        title={`Xoá ảnh ${live.name}?`}
        body="Ảnh bị xoá khỏi thư viện và không lấy lại được."
        confirmLabel="Xoá"
        tone="danger"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => {
          setConfirming(false);
        }}
      />
    </div>
  );
}
