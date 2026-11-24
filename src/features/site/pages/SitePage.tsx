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

  const resetTo = useCallback(
    (settings: Settings, version: number) => {
      const initial = settingsToForm(settings);
      baseline.current = { initial, version };
      resetOnNextVersion.current = false;
      form.reset(initial);
    },
    [form],
  );

  // A new server version replaces the form only while the user has nothing pending (P2-3).
  useEffect(() => {
    const b = baseline.current;
    if (b?.version === site.settingsVersion) return;
    if (b && isDirty && !resetOnNextVersion.current) return;
    resetTo(site.draft.settings, site.settingsVersion);
  }, [site.settingsVersion, site.draft.settings, isDirty, resetTo]);

  const resetFromDto = (dto: SiteDto) => {
    resetTo(dto.draft.settings, dto.version);
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
    form.clearErrors();
    save.mutate(patch, {
      onSuccess: (dto) => {
        resetFromDto(dto);
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
    form.clearErrors();
    publish.mutate(
      { settingsPatch: patch, draftHash: site.draftHash },
      {
        onSuccess: ({ site: dto }) => {
          resetFromDto(dto);
          toast.show({
            kind: 'success',
            title: 'Đã xuất bản thay đổi',
            body: 'Website đã cập nhật nội dung mới.',
          });
        },
        onError: (error) => {
          // The PATCH may have succeeded before publish failed: the edits are saved now.
          const cached = qc.getQueryData<SiteDto>(siteKeys.detail);
          if (patch && cached && cached.version !== openedVersion) resetFromDto(cached);
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
        resetFromDto(dto);
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
