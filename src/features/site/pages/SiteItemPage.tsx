import { ArrowLeft } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type ReactElement, type ReactNode } from 'react';
import { useForm, useWatch, type FieldValues, type UseFormReturn } from 'react-hook-form';
import { useNavigate } from 'react-router';
import type { MediaThumb } from '@/features/media';
import { isProblem } from '@/shared/api/errors';
import { useCan } from '@/shared/auth/permissions';
import { applyProblemToForm } from '@/shared/form/apply-problem-to-form';
import { messageFor } from '@/shared/form/error-messages';
import { Button, ConfirmDialog, PageHeader, Spinner, useToast } from '@/shared/ui';
import { ItemShell } from '../components/ItemShell';
import { ITEM_META } from '../components/labels';
import { ServicePreview } from '../components/previews/ServicePreview';
import { TeamPreview } from '../components/previews/TeamPreview';
import { TimelinePreview } from '../components/previews/TimelinePreview';
import { ServiceForm } from '../components/ServiceForm';
import { TeamForm } from '../components/TeamForm';
import { TimelineForm } from '../components/TimelineForm';
import { useCreateItem, useDeleteItem, useUpdateItem } from '../hooks/use-item-mutations';
import { useSite } from '../hooks/use-site';
import { useUnsavedGuard } from '../hooks/use-unsaved-guard';
import {
  itemCreateBody,
  itemPatchBody,
  newItemForm,
  serviceToForm,
  teamToForm,
  timelineToForm,
} from '../model/adapters';
import { itemResolver, serviceSchema, teamSchema, timelineSchema } from '../model/item-schemas';
import type {
  ItemCreateBodyMap,
  ItemFormMap,
  ItemKind,
  ItemPatchBodyMap,
  MediaUrls,
  ServiceDto,
  SiteView,
  TeamDto,
  TimelineDto,
} from '../model/types';

const PUBLISH_HINT = 'Bấm “Lưu & xuất bản” để đưa thay đổi lên website.';
const ITEM_LIMIT = 'Đã đủ số mục tối đa.';

export type SiteItemPageProps = {
  kind: ItemKind;
  /** Omitted when adding. */
  id?: string;
};

/** Add/edit page of a service, team member or timeline milestone (`/site/:kind/new|:id`). */
export function SiteItemPage({ kind, id }: SiteItemPageProps) {
  // Only a failed first load shows the error: a failed refetch keeps the cached data (and any
  // unsaved edits); the global query error toast reports it.
  const { data: site, isError } = useSite();
  if (site === undefined) {
    return isError ? (
      <p role="alert">Không tải được thông tin website. Thử lại sau.</p>
    ) : (
      <Spinner fullPage />
    );
  }
  const editorProps = { site, id };
  switch (kind) {
    case 'services':
      return (
        <OpenItem kind={kind} list={site.draft.services} id={id}>
          {(item) => <ServiceEditor {...editorProps} item={item} />}
        </OpenItem>
      );
    case 'team':
      return (
        <OpenItem kind={kind} list={site.draft.team} id={id}>
          {(item) => <TeamEditor {...editorProps} item={item} />}
        </OpenItem>
      );
    case 'timeline':
      return (
        <OpenItem kind={kind} list={site.draft.timeline} id={id}>
          {(item) => <TimelineEditor {...editorProps} item={item} />}
        </OpenItem>
      );
  }
}

/**
 * Looks the item up once, when the page opens: later cache updates (or its own deletion right
 * before leaving) never swap the form out. `null` means adding.
 */
function OpenItem<T extends { id: string }>({
  kind,
  list,
  id,
  children,
}: {
  kind: ItemKind;
  list: readonly T[];
  id: string | undefined;
  children: (item: T | null) => ReactNode;
}) {
  const [item] = useState(() =>
    id === undefined ? null : (list.find((x) => x.id === id) ?? null),
  );
  if (id !== undefined && item === null) return <ItemNotFound kind={kind} />;
  return children(item);
}

function ItemNotFound({ kind }: { kind: ItemKind }) {
  const navigate = useNavigate();
  const meta = ITEM_META[kind];
  return (
    <PageHeader
      eyebrow={`Thông tin website · ${meta.section}`}
      title="Không tìm thấy mục này"
      description="Mục có thể đã bị xoá hoặc đường dẫn không đúng."
      actions={
        <Button
          variant="ghost"
          icon={ArrowLeft}
          onClick={() => {
            void navigate(`/site?tab=${meta.tab}`);
          }}
        >
          {meta.section}
        </Button>
      }
    />
  );
}

/** Every leaf path of a form value, e.g. `quote.text`, `photos.0.label`. */
function leafPaths(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return prefix ? [prefix] : [];
  return Object.entries(value).flatMap(([k, v]) => leafPaths(v, prefix ? `${prefix}.${k}` : k));
}

/** `next` with every top-level field the user changed (`current` vs `previous`) carried over. */
function keepEdits<T extends FieldValues>(next: T, previous: T, current: T): T {
  const out: T = { ...next };
  for (const key of Object.keys(current) as (keyof T)[]) {
    if (JSON.stringify(current[key]) !== JSON.stringify(previous[key])) out[key] = current[key];
  }
  return out;
}

type Baseline<T> = { initial: T; version: number };

type ItemActions = {
  guard: ReactElement;
  /** The item was deleted elsewhere: show the not-found state. */
  gone: boolean;
  readOnly: boolean;
  saving: boolean;
  goBack: () => void;
  /** Validates, then creates or patches (changed fields, opened version) and leaves. */
  save: () => void;
  confirmDelete: (() => void) | undefined;
  deleteDialog: ReactElement | null;
};

/**
 * Shared behaviour of the three editors: the version captured when the form opened, the
 * create/patch/delete calls, error handling by code, and leaving without the unsaved prompt.
 */
function useItemActions<K extends ItemKind>(
  kind: K,
  form: UseFormReturn<ItemFormMap[K]>,
  item: { id: string; version: number; name: string } | null,
  /** Server form of the item now in the cache (moves the baseline after a conflict reload). */
  current: { version: number; form: ItemFormMap[K] } | null,
): ItemActions {
  const meta = ITEM_META[kind];
  const back = `/site?tab=${meta.tab}`;
  const navigate = useNavigate();
  const toast = useToast();
  const readOnly = !useCan('site.update');
  const create = useCreateItem(kind);
  const update = useUpdateItem(kind);
  const remove = useDeleteItem(kind);

  const baseline = useRef<Baseline<ItemFormMap[K]> | null>(
    item ? { initial: form.getValues(), version: item.version } : null,
  );
  /** Set after a version conflict: the reloaded item becomes the new baseline. */
  const conflicted = useRef(false);
  const [leaving, setLeaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /** The item is gone from the draft (deleted elsewhere). */
  const [gone, setGone] = useState(false);

  // Declared before the navigation effect so the blocker sees `leaving` first.
  const guard = useUnsavedGuard(form.formState.isDirty && !leaving && !gone);
  useEffect(() => {
    if (leaving) void navigate(back);
  }, [leaving, navigate, back]);

  /** The item now in the cache, read by error handlers that run after later renders. */
  const latest = useRef(current);
  // Declared before the conflict effect below, so that effect reads this render's item.
  useEffect(() => {
    latest.current = current;
  });
  /** Moves the baseline to the cached item, keeping every field the user changed. */
  const rebase = useCallback(
    (next: { version: number; form: ItemFormMap[K] }) => {
      const b = baseline.current;
      if (!b) return;
      const merged = keepEdits(next.form, b.initial, form.getValues());
      baseline.current = { initial: next.form, version: next.version };
      form.reset(next.form);
      form.reset(merged, { keepDefaultValues: true });
    },
    [form],
  );

  // After a conflict, the reload ("Tải lại") becomes the new baseline, or the not-found state
  // when the item is no longer in the draft.
  const currentVersion = current?.version ?? null;
  useEffect(() => {
    const b = baseline.current;
    const now = latest.current;
    if (!b || !conflicted.current) return;
    if (!now) {
      conflicted.current = false;
      setGone(true);
    } else if (now.version !== b.version) {
      conflicted.current = false;
      rebase(now);
    }
  }, [currentVersion, rebase]);

  /** On a 409: rebase now when the cache is already ahead, else wait for the reload. */
  const onConflict = () => {
    const b = baseline.current;
    const now = latest.current;
    if (b && now && now.version !== b.version) {
      conflicted.current = false;
      rebase(now);
    } else {
      conflicted.current = true;
    }
  };

  const leave = (title: string, body: string) => {
    toast.show({ kind: 'success', title, body });
    setLeaving(true);
  };

  const onError = (error: Error) => {
    if (isProblem(error, 'VERSION_CONFLICT')) {
      onConflict();
    } else if (item && isProblem(error, 'NOT_FOUND')) {
      setGone(true);
    } else if (isProblem(error, 'VALIDATION_FAILED')) {
      applyProblemToForm(error, form.setError, {}, leafPaths(form.getValues()));
    } else if (isProblem(error, 'SITE_ITEM_LIMIT')) {
      toast.show({ kind: 'error', title: ITEM_LIMIT });
    } else {
      toast.show({ kind: 'error', title: messageFor(error) });
    }
  };

  const submit = (values: ItemFormMap[K]) => {
    form.clearErrors('root');
    const b = baseline.current;
    if (!item || !b) {
      const body: ItemCreateBodyMap[K] = itemCreateBody(kind, values);
      create.mutate(body, {
        onSuccess: () => {
          leave(`Đã thêm ${meta.noun}`, PUBLISH_HINT);
        },
        onError,
      });
      return;
    }
    const body: ItemPatchBodyMap[K] = itemPatchBody(kind, values, b.initial, b.version);
    if (Object.keys(body).length === 1) {
      // Nothing changed: no request, no prompt.
      setLeaving(true);
      return;
    }
    update.mutate(
      { id: item.id, body },
      {
        onSuccess: () => {
          leave(`Đã cập nhật ${meta.noun}`, PUBLISH_HINT);
        },
        onError,
      },
    );
  };

  const onDelete = () => {
    const b = baseline.current;
    if (!item || !b) return;
    remove.mutate(
      { id: item.id, version: b.version },
      {
        onSuccess: () => {
          setDeleting(false);
          leave(`Đã xoá ${meta.noun}`, 'Bấm “Hoàn tác” nếu xoá nhầm.');
        },
        onError: (error) => {
          setDeleting(false);
          onError(error);
        },
      },
    );
  };

  return {
    guard,
    gone,
    readOnly,
    saving: create.isPending || update.isPending,
    goBack: () => {
      void navigate(back);
    },
    save: () => {
      void form.handleSubmit(submit)();
    },
    confirmDelete: item
      ? () => {
          setDeleting(true);
        }
      : undefined,
    deleteDialog: item ? (
      <ConfirmDialog
        open={deleting}
        title={`Xoá ${item.name}?`}
        body="Mục bị xoá khỏi bản nháp. Bấm “Hoàn tác” ở trang Thông tin website nếu xoá nhầm."
        confirmLabel="Xoá"
        tone="danger"
        busy={remove.isPending}
        onConfirm={onDelete}
        onCancel={() => {
          setDeleting(false);
        }}
      />
    ) : null,
  };
}

type EditorProps<T> = { site: SiteView; item: T | null };

/** 1-based place of `item` in `list`, or null when adding. */
function ordinalOf<T extends { id: string }>(list: readonly T[], item: T | null): number | null {
  if (!item) return null;
  return list.findIndex((x) => x.id === item.id) + 1 || null;
}

function useMediaUrls(seed: [string, { url: string; thumbUrl: string }][]) {
  const [media, setMedia] = useState<MediaUrls>(() => new Map(seed));
  const onMedia = (m: MediaThumb) => {
    setMedia((prev) => new Map(prev).set(m.id, { url: m.url, thumbUrl: m.thumbUrl }));
  };
  return [media, onMedia] as const;
}

function ServiceEditor({ site, item }: EditorProps<ServiceDto>) {
  const list = site.draft.services;
  const positionCount = item ? list.length : list.length + 1;
  const form = useForm<ItemFormMap['services']>({
    defaultValues: item
      ? serviceToForm(item)
      : { ...newItemForm('services', new Date().getFullYear()), position: list.length },
    resolver: itemResolver(serviceSchema),
  });
  const live = item ? list.find((x) => x.id === item.id) : undefined;
  const actions = useItemActions(
    'services',
    form,
    item ? { id: item.id, version: item.version, name: item.title } : null,
    live ? { version: live.version, form: serviceToForm(live) } : null,
  );
  const [icon, title, desc, time, visible] = useWatch({
    control: form.control,
    name: ['icon', 'title', 'desc', 'time', 'visible'],
  });

  if (actions.gone) return <ItemNotFound kind="services" />;
  return (
    <ItemShell
      kind="services"
      ordinal={ordinalOf(list, item)}
      savedName={item?.title ?? ''}
      canUpdate={!actions.readOnly}
      saving={actions.saving}
      onBack={actions.goBack}
      onSave={actions.save}
      {...(actions.confirmDelete ? { onDelete: actions.confirmDelete } : {})}
      hidden={!visible}
      serverError={form.formState.errors.root?.server?.message}
      preview={<ServicePreview values={{ icon, title, desc, time }} />}
    >
      <ServiceForm form={form} readOnly={actions.readOnly} positionCount={positionCount} />
      {actions.deleteDialog}
      {actions.guard}
    </ItemShell>
  );
}

function TeamEditor({ site, item }: EditorProps<TeamDto>) {
  const list = site.draft.team;
  const positionCount = item ? list.length : list.length + 1;
  const [currentYear] = useState(() => new Date().getFullYear());
  const form = useForm<ItemFormMap['team']>({
    defaultValues: item
      ? teamToForm(item)
      : { ...newItemForm('team', currentYear), position: list.length },
    resolver: itemResolver(teamSchema(currentYear)),
  });
  const live = item ? list.find((x) => x.id === item.id) : undefined;
  const actions = useItemActions(
    'team',
    form,
    item ? { id: item.id, version: item.version, name: item.name } : null,
    live ? { version: live.version, form: teamToForm(live) } : null,
  );
  const [media, onMedia] = useMediaUrls(
    item?.photo ? [[item.photo.id, { url: item.photo.url, thumbUrl: item.photo.thumbUrl }]] : [],
  );
  const [name, role, bio, since, visible, photoMediaId] = useWatch({
    control: form.control,
    name: ['name', 'role', 'bio', 'since', 'visible', 'photoMediaId'],
  });
  const photo = photoMediaId ? media.get(photoMediaId) : undefined;

  if (actions.gone) return <ItemNotFound kind="team" />;
  return (
    <ItemShell
      kind="team"
      ordinal={ordinalOf(list, item)}
      savedName={item?.name ?? ''}
      canUpdate={!actions.readOnly}
      saving={actions.saving}
      onBack={actions.goBack}
      onSave={actions.save}
      {...(actions.confirmDelete ? { onDelete: actions.confirmDelete } : {})}
      hidden={!visible}
      serverError={form.formState.errors.root?.server?.message}
      preview={
        <TeamPreview
          values={{ name, role, bio, since }}
          photoUrl={photo?.url ?? null}
          currentYear={currentYear}
        />
      }
    >
      <TeamForm
        form={form}
        readOnly={actions.readOnly}
        positionCount={positionCount}
        currentYear={currentYear}
        media={media}
        onMedia={onMedia}
      />
      {actions.deleteDialog}
      {actions.guard}
    </ItemShell>
  );
}

function TimelineEditor({ site, item }: EditorProps<TimelineDto>) {
  const list = site.draft.timeline;
  const form = useForm<ItemFormMap['timeline']>({
    defaultValues: item ? timelineToForm(item) : newItemForm('timeline', new Date().getFullYear()),
    resolver: itemResolver(timelineSchema),
  });
  const live = item ? list.find((x) => x.id === item.id) : undefined;
  const actions = useItemActions(
    'timeline',
    form,
    item ? { id: item.id, version: item.version, name: item.title } : null,
    live ? { version: live.version, form: timelineToForm(live) } : null,
  );
  const [media, onMedia] = useMediaUrls(
    (item?.photos ?? []).flatMap((p) =>
      p.image
        ? [
            [p.image.id, { url: p.image.url, thumbUrl: p.image.thumbUrl }] as [
              string,
              { url: string; thumbUrl: string },
            ],
          ]
        : [],
    ),
  );
  const [year, title, body, kind, quote, photos] = useWatch({
    control: form.control,
    name: ['year', 'title', 'body', 'media', 'quote', 'photos'],
  });

  if (actions.gone) return <ItemNotFound kind="timeline" />;
  return (
    <ItemShell
      kind="timeline"
      ordinal={ordinalOf(list, item)}
      savedName={item?.title ?? ''}
      canUpdate={!actions.readOnly}
      saving={actions.saving}
      onBack={actions.goBack}
      onSave={actions.save}
      {...(actions.confirmDelete ? { onDelete: actions.confirmDelete } : {})}
      hidden={false}
      serverError={form.formState.errors.root?.server?.message}
      preview={
        <TimelinePreview
          values={{ year, title, body, media: kind, quote }}
          photos={photos.map((p) => ({
            label: p.label,
            url: p.mediaId ? (media.get(p.mediaId)?.url ?? null) : null,
          }))}
        />
      }
    >
      <TimelineForm form={form} readOnly={actions.readOnly} media={media} onMedia={onMedia} />
      {actions.deleteDialog}
      {actions.guard}
    </ItemShell>
  );
}
