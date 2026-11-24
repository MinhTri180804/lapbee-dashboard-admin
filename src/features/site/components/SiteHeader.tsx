import { History, RotateCcw, Upload } from 'lucide-react';
import { Link } from 'react-router';
import { Button, PageHeader, Tabs } from '@/shared/ui';
import type { SiteTab } from '../model/types';
import { NO_PUBLISH_TITLE, NO_UPDATE_TITLE, SITE_TABS } from './labels';
import styles from './SiteHeader.module.css';

export type SiteHeaderProps = {
  tab: SiteTab;
  onTabChange: (tab: SiteTab) => void;
  /** Form or server draft has unpublished changes (D1). */
  unsaved: boolean;
  savedLabel: string | null;
  canUpdate: boolean;
  canPublish: boolean;
  /** "Lưu nháp" is only offered on the settings tabs. */
  showSaveDraft: boolean;
  saveDraftDisabled: boolean;
  saving: boolean;
  onSaveDraft: () => void;
  revertDisabled: boolean;
  onRevert: () => void;
  publishing: boolean;
  onPublish: () => void;
};

export function SiteHeader(props: SiteHeaderProps) {
  const { canUpdate, canPublish } = props;
  const noUpdate = canUpdate ? undefined : NO_UPDATE_TITLE;
  return (
    <div className={styles.root}>
      <PageHeader
        eyebrow="Quản trị · Website"
        title="Thông tin website"
        description="Nội dung hiển thị trên Trang chủ, Đội ngũ và Hành trình. Thay đổi chỉ xuất hiện trên website sau khi bạn lưu."
        actions={
          <div className={styles.actions}>
            {props.unsaved ? (
              <span className={styles.unsaved}>
                <span className={styles.dot} aria-hidden="true" />
                Chưa lưu
              </span>
            ) : props.savedLabel ? (
              <span className="lb-label">{props.savedLabel}</span>
            ) : null}
            <Link to="/site/history" className={styles.historyLink}>
              <History size={16} aria-hidden="true" />
              Lịch sử
            </Link>
            <Button
              variant="secondary"
              icon={RotateCcw}
              disabled={!canUpdate || props.revertDisabled}
              title={noUpdate}
              onClick={props.onRevert}
            >
              Hoàn tác
            </Button>
            {props.showSaveDraft ? (
              <Button
                variant="secondary"
                disabled={!canUpdate || props.saveDraftDisabled}
                loading={props.saving}
                title={noUpdate}
                onClick={props.onSaveDraft}
              >
                Lưu nháp
              </Button>
            ) : null}
            <Button
              variant="primary"
              icon={Upload}
              disabled={!canPublish}
              loading={props.publishing}
              title={canPublish ? undefined : NO_PUBLISH_TITLE}
              onClick={props.onPublish}
            >
              Lưu &amp; xuất bản
            </Button>
          </div>
        }
      />
      <Tabs
        items={SITE_TABS}
        value={props.tab}
        onChange={(v) => {
          const next = SITE_TABS.find((t) => t.value === v);
          if (next) props.onTabChange(next.value);
        }}
        label="Thông tin website"
        idPrefix="site"
      />
    </div>
  );
}
