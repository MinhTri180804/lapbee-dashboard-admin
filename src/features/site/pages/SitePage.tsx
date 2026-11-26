import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useSearchParams } from 'react-router';
import { isProblem, type FieldError } from '@/shared/api/errors';
import { useCan } from '@/shared/auth/permissions';
import { applyProblemToForm } from '@/shared/form/apply-problem-to-form';
import { messageFor } from '@/shared/form/error-messages';
import { useRebasingForm } from '@/shared/form/use-rebasing-form';
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
import type { Settings, SettingsForm, SiteDto, SiteTab, SiteView } from '../model/types';
import styles from './SitePage.module.css';

/** Field paths of `PATCH /site/settings` errors that map onto the form. */
const KNOWN_FIELDS: readonly string[] = [
  ...Object.keys(SETTINGS_TAB),
  ...[0, 1, 2, 3].flatMap((i) => [`stats.${String(i)}.v`, `stats.${String(i)}.l`]),
];

export function SitePage() {
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
  return <SiteEditor site={site} />;
}

function SiteEditor({ site }: { site: SiteView }) {
  const toast = useToast();
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

  const rebasing = useRebasingForm({
    form,
    server: { values: settingsToForm(site.draft.settings), version: site.settingsVersion },
    // A new server version replaces a clean form (P2-3). A dirty form keeps its baseline, so a
    // stale save still gets its 409, except right after a conflict: then the reload is rebased.
    followServerWhenClean: true,
  });
  const { baseline } = rebasing;

  const rebaseFromDto = (dto: SiteDto, sent: SettingsForm) => {
    rebasing.rebaseFromSent(
      { values: settingsToForm(dto.draft.settings), version: dto.version },
      sent,
    );
  };

  const currentPatch = () => settingsPatch(form.getValues(), baseline.initial, baseline.version);

  /** Shared handling for settings writes; conflicts are handled by the global dialog. */
  const handleWriteError = (error: unknown) => {
    if (isProblem(error, 'VERSION_CONFLICT')) {
      // Rebases now when a refetch already put a newer version in the cache, else on reload.
      rebasing.onConflict();
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
    const sent = structuredClone(form.getValues());
    /** The PATCH response; still null after a failure means the PATCH (if any) failed. */
    let patched: SiteDto | null = null;
    form.clearErrors();
    publish.mutate(
      {
        settingsPatch: patch,
        draftHash: site.draftHash,
        onPatched: (dto) => {
          patched = dto;
        },
      },
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
          if (patch && !patched) {
            handleWriteError(error);
            return;
          }
          // The publish step failed: the edits sent are saved, and a conflict here is about the
          // draftHash (an item changed), not the settings version, so no rebase is armed.
          if (patched) rebaseFromDto(patched, sent);
          if (isProblem(error, 'NOTHING_TO_PUBLISH')) {
            toast.show({ kind: 'info', title: 'Không có thay đổi để xuất bản' });
          } else if (isProblem(error, 'SITE_INVALID')) {
            setPublishErrors(error.fieldErrors);
          } else if (!isProblem(error, 'VERSION_CONFLICT')) {
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
        rebasing.resetTo({ values: settingsToForm(dto.draft.settings), version: dto.version });
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
