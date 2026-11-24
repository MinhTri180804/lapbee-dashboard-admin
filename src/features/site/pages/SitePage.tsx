import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useSearchParams } from 'react-router';
import { isProblem, type FieldError } from '@/shared/api/errors';
import { useCan } from '@/shared/auth/permissions';
import { applyProblemToForm } from '@/shared/form/apply-problem-to-form';
import { messageFor } from '@/shared/form/error-messages';
import { ConfirmDialog, Spinner, tabPanelProps, useToast } from '@/shared/ui';
import { HeroPreview } from '../components/HeroPreview';
import { isSiteTab } from '../components/labels';
import { PublishErrorsDialog } from '../components/PublishErrorsDialog';
import { ServicesList } from '../components/ServicesList';
import { SettingsGeneral } from '../components/SettingsGeneral';
import { SettingsHome } from '../components/SettingsHome';
import { SiteHeader } from '../components/SiteHeader';
import { TeamGrid } from '../components/TeamGrid';
import { TimelineList } from '../components/TimelineList';
import { usePublishSite } from '../hooks/use-publish-site';
import { useRevertSite } from '../hooks/use-revert-site';
import { useSaveSettings } from '../hooks/use-save-settings';
import { useSite } from '../hooks/use-site';
import { useUnsavedGuard } from '../hooks/use-unsaved-guard';
import { SETTINGS_TAB, settingsPatch, settingsToForm } from '../model/adapters';
import { siteKeys } from '../model/keys';
import type { Settings, SettingsForm, SiteDto, SiteTab, SiteView } from '../model/types';
import styles from './SitePage.module.css';

/** Field paths of `PATCH /site/settings` errors that map onto the form. */
const KNOWN_FIELDS: readonly string[] = [
  ...Object.keys(SETTINGS_TAB),
  ...[0, 1, 2, 3].flatMap((i) => [`stats.${String(i)}.v`, `stats.${String(i)}.l`]),
];

/**
 * `next` with every leaf the user changed (`current` vs `previous`) carried over. Leaves are the
 * top-level settings plus each stats cell, so a server change in another cell is not lost.
 */
function keepEdits(next: SettingsForm, previous: SettingsForm, current: SettingsForm) {
  const out: SettingsForm = { ...next, stats: next.stats.map((c) => ({ ...c })) };
  for (const key of Object.keys(next) as (keyof SettingsForm)[]) {
    if (key !== 'stats' && current[key] !== previous[key]) {
      Object.assign(out, { [key]: current[key] });
    }
  }
  out.stats.forEach((cell, i) => {
    const was = previous.stats[i];
    const now = current.stats[i];
    if (!now) return;
    if (now.v !== was?.v) cell.v = now.v;
    if (now.l !== was?.l) cell.l = now.l;
  });
  return out;
}

/** The settings values and version the form was opened (or last reset) with. */
type Baseline = { initial: SettingsForm; version: number };

export function SitePage() {
  const { data: site, isPending, isError } = useSite();
  if (isPending) return <Spinner fullPage />;
  if (isError) return <p role="alert">Không tải được thông tin website. Thử lại sau.</p>;
  return <SiteEditor site={site} />;
}

function SiteEditor({ site }: { site: SiteView }) {
  const toast = useToast();
  const qc = useQueryClient();
  const canUpdate = useCan('site.update');
  const canPublish = useCan('site.publish');

  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab');
  const tab: SiteTab = isSiteTab(rawTab) ? rawTab : 'general';
  const setTab = (next: SiteTab) => {
    setSearchParams({ tab: next }, { replace: true });
  };
  const isSettingsTab = tab === 'general' || tab === 'home';

  const form = useForm<SettingsForm>({ defaultValues: settingsToForm(site.draft.settings) });
  const { isDirty } = form.formState;
  const [showEyebrow, eyebrow, h1a, h1b, h1hl, lead, cta1, cta2, stats] = useWatch({
    control: form.control,
    name: ['showEyebrow', 'eyebrow', 'h1a', 'h1b', 'h1hl', 'lead', 'cta1', 'cta2', 'stats'],
  });
  const hero = { showEyebrow, eyebrow, h1a, h1b, h1hl, lead, cta1, cta2, stats };

  const baseline = useRef<Baseline | null>(null);
  /** Set after a version conflict: the reloaded settings replace the stale edits. */
  const resetOnNextVersion = useRef(false);

  /** Replaces the form with server settings, discarding edits (mount, clean form, revert). */
  const resetTo = useCallback(
    (settings: Settings, version: number) => {
      const initial = settingsToForm(settings);
      baseline.current = { initial, version };
      resetOnNextVersion.current = false;
      form.reset(initial);
    },
    [form],
  );

  /**
   * Moves the baseline to new server settings but keeps every value the user changed since
   * `since`: the values sent (after a save), or the old baseline (after a conflict reload).
   * Never sends anything.
   *
   * Not `reset(…, { keepDirtyValues: true })`: in RHF 7.92 that sets `isDirty` to false and
   * keeps stale `dirtyFields`. The second reset with `keepDefaultValues` recomputes both.
   */
  const rebaseTo = useCallback(
    (settings: Settings, version: number, since?: SettingsForm) => {
      const from = since ?? baseline.current?.initial;
      const initial = settingsToForm(settings);
      const merged = from ? keepEdits(initial, from, form.getValues()) : initial;
      baseline.current = { initial, version };
      resetOnNextVersion.current = false;
      form.reset(initial);
      form.reset(merged, { keepDefaultValues: true });
    },
    [form],
  );

  // A new server version replaces a clean form (P2-3). A dirty form keeps its baseline, so a
  // stale save still gets its 409, except right after a conflict: then the reload is rebased.
  useEffect(() => {
    const b = baseline.current;
    if (b?.version === site.settingsVersion) return;
    if (!b || !isDirty) {
      resetTo(site.draft.settings, site.settingsVersion);
    } else if (resetOnNextVersion.current) {
      rebaseTo(site.draft.settings, site.settingsVersion);
    }
  }, [site.settingsVersion, site.draft.settings, isDirty, resetTo, rebaseTo]);

  const rebaseFromDto = (dto: SiteDto, sent: SettingsForm) => {
    rebaseTo(dto.draft.settings, dto.version, sent);
  };

  const currentPatch = () => {
    const b = baseline.current;
    return b ? settingsPatch(form.getValues(), b.initial, b.version) : null;
  };

  /** Shared handling for settings writes; conflicts are handled by the global dialog. */
  const handleWriteError = (error: unknown) => {
    if (isProblem(error, 'VERSION_CONFLICT')) {
      resetOnNextVersion.current = true;
      return;
    }
    if (isProblem(error, 'VALIDATION_FAILED')) {
      applyProblemToForm(error, form.setError, {}, KNOWN_FIELDS);
      const first = error.fieldErrors[0]?.path.split('.')[0];
      if (first && first in SETTINGS_TAB) setTab(SETTINGS_TAB[first as keyof Settings]);
      return;
    }
    toast.show({ kind: 'error', title: messageFor(error) });
  };

  const save = useSaveSettings();
  const onSaveDraft = () => {
    const patch = currentPatch();
    if (!patch) return;
    const sent = structuredClone(form.getValues());
    form.clearErrors();
    save.mutate(patch, {
      onSuccess: (dto) => {
        rebaseFromDto(dto, sent);
        toast.show({ kind: 'success', title: 'Đã lưu nháp' });
      },
      onError: handleWriteError,
    });
  };

  const publish = usePublishSite();
  const [publishErrors, setPublishErrors] = useState<FieldError[] | null>(null);
  const onPublish = () => {
    const patch = isDirty ? currentPatch() : null;
    const openedVersion = baseline.current?.version;
    const sent = structuredClone(form.getValues());
    form.clearErrors();
    publish.mutate(
      { settingsPatch: patch, draftHash: site.draftHash },
      {
        onSuccess: ({ site: dto }) => {
          rebaseFromDto(dto, sent);
          toast.show({
            kind: 'success',
            title: 'Đã xuất bản thay đổi',
            body: 'Website đã cập nhật nội dung mới.',
          });
        },
        onError: (error) => {
          // The PATCH may have succeeded before publish failed: the edits are saved now.
          const cached = qc.getQueryData<SiteDto>(siteKeys.detail);
          if (patch && cached && cached.version !== openedVersion) rebaseFromDto(cached, sent);
          if (isProblem(error, 'NOTHING_TO_PUBLISH')) {
            toast.show({ kind: 'info', title: 'Không có thay đổi để xuất bản' });
          } else if (isProblem(error, 'SITE_INVALID')) {
            setPublishErrors(error.fieldErrors);
          } else {
            handleWriteError(error);
          }
        },
      },
    );
  };

  const revert = useRevertSite();
  const [confirmRevert, setConfirmRevert] = useState(false);
  const onRevert = () => {
    revert.mutate(site.draftHash, {
      onSuccess: (dto) => {
        setConfirmRevert(false);
        resetTo(dto.draft.settings, dto.version);
        toast.show({ kind: 'success', title: 'Đã hoàn tác về bản đã xuất bản' });
      },
      onError: () => {
        setConfirmRevert(false);
      },
    });
  };

  const guard = useUnsavedGuard(isDirty);
  const readOnly = !canUpdate;
  const panel = { form, readOnly, warnings: site.warnings };
  const serverError = form.formState.errors.root?.server?.message;

  return (
    <div className={styles.page}>
      <SiteHeader
        tab={tab}
        onTabChange={setTab}
        unsaved={isDirty || site.dirty}
        savedLabel={site.savedLabel}
        canUpdate={canUpdate}
        canPublish={canPublish}
        showSaveDraft={isSettingsTab}
        saveDraftDisabled={!isDirty}
        saving={save.isPending}
        onSaveDraft={onSaveDraft}
        revertDisabled={!site.canRevert || !site.dirty}
        onRevert={() => {
          setConfirmRevert(true);
        }}
        publishing={publish.isPending}
        onPublish={onPublish}
      />
      <div className={styles.body}>
        <div className={styles.main} {...tabPanelProps('site', tab)}>
          {serverError && isSettingsTab ? (
            <p role="alert" className={styles.serverError}>
              {serverError}
            </p>
          ) : null}
          {tab === 'general' ? <SettingsGeneral {...panel} /> : null}
          {tab === 'home' ? <SettingsHome {...panel} /> : null}
          {tab === 'services' ? <ServicesList /> : null}
          {tab === 'team' ? <TeamGrid /> : null}
          {tab === 'journey' ? <TimelineList /> : null}
        </div>
        {isSettingsTab ? (
          <aside className={styles.preview}>
            <HeroPreview values={hero} />
          </aside>
        ) : null}
      </div>
      <ConfirmDialog
        open={confirmRevert}
        title="Đưa bản nháp về bản đã xuất bản gần nhất?"
        body="Mọi thay đổi chưa xuất bản sẽ mất."
        confirmLabel="Hoàn tác"
        tone="danger"
        busy={revert.isPending}
        onConfirm={onRevert}
        onCancel={() => {
          setConfirmRevert(false);
        }}
      />
      <PublishErrorsDialog
        open={publishErrors !== null}
        errors={publishErrors ?? []}
        draft={site.draft}
        onClose={() => {
          setPublishErrors(null);
        }}
      />
      {guard}
    </div>
  );
}
