import { ArrowLeft, Check, Trash2 } from 'lucide-react';
import { useId, type ReactNode } from 'react';
import { Badge, Button, PageHeader, Select, Switch } from '@/shared/ui';
import type { ItemKind } from '../model/types';
import { ITEM_META, NO_UPDATE_TITLE } from './labels';
import { Section } from './Section';
import styles from './ItemShell.module.css';

export type ItemShellProps = {
  kind: ItemKind;
  /** 1-based place of the edited item; null when adding. */
  ordinal: number | null;
  /** Saved name of the edited item (the page title); empty falls back to "Sửa …". */
  savedName: string;
  canUpdate: boolean;
  saving: boolean;
  onBack: () => void;
  onSave: () => void;
  /** Only when editing. */
  onDelete?: () => void;
  /** Shows "Đang ẩn" by the preview. */
  hidden: boolean;
  serverError?: string | undefined;
  preview: ReactNode;
  children: ReactNode;
};

/** Sticky action bar, title, form column and preview column of an item page. */
export function ItemShell(props: ItemShellProps) {
  const { kind, ordinal, canUpdate } = props;
  const meta = ITEM_META[kind];
  const previewId = useId();
  const adding = ordinal === null;
  const noUpdate = canUpdate ? undefined : NO_UPDATE_TITLE;
  const label = adding
    ? `Thêm ${meta.noun}`
    : `Sửa ${meta.noun} · ${String(ordinal).padStart(2, '0')}`;
  const title = adding ? `Thêm ${meta.noun}` : props.savedName || `Sửa ${meta.noun}`;

  return (
    <div className={styles.page}>
      <div className={styles.bar}>
        <div className={styles.barSide}>
          <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={props.onBack}>
            {meta.section}
          </Button>
          <span className={styles.divider} aria-hidden="true" />
          <span className="lb-label">{label}</span>
        </div>
        <div className={styles.barSide}>
          {props.onDelete ? (
            <Button
              variant="ghost"
              size="sm"
              icon={Trash2}
              disabled={!canUpdate}
              title={noUpdate}
              onClick={props.onDelete}
            >
              Xoá
            </Button>
          ) : null}
          <Button variant="secondary" size="sm" onClick={props.onBack}>
            Huỷ
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Check}
            disabled={!canUpdate}
            loading={props.saving}
            title={noUpdate}
            onClick={props.onSave}
          >
            {adding ? `Thêm ${meta.noun}` : 'Lưu thay đổi'}
          </Button>
        </div>
      </div>
      <PageHeader
        eyebrow={`Thông tin website · ${meta.section}`}
        title={title}
        description={meta.description}
      />
      <div className={styles.body}>
        <div className={styles.main}>
          {props.serverError ? (
            <p role="alert" className={styles.serverError}>
              {props.serverError}
            </p>
          ) : null}
          {props.children}
        </div>
        <section className={styles.preview} aria-labelledby={previewId}>
          <div className={styles.previewHead}>
            <span id={previewId} className="lb-label">
              {meta.previewLabel}
            </span>
            {props.hidden ? <Badge>Đang ẩn</Badge> : null}
          </div>
          <div className={styles.stage}>{props.preview}</div>
          <p className={styles.note}>
            Thay đổi lưu vào bản nháp. Bấm “Lưu &amp; xuất bản” ở trang Thông tin website để cập
            nhật website.
          </p>
        </section>
      </div>
    </div>
  );
}

export type DisplaySectionProps = {
  /** 0-based position. */
  position: number;
  /** Number of places to choose from. */
  count: number;
  onPosition: (position: number) => void;
  visible: boolean;
  onVisible: (visible: boolean) => void;
  visibleLabel: string;
  readOnly: boolean;
};

/** "Hiển thị" of services and team members: position and visibility. */
export function DisplaySection(props: DisplaySectionProps) {
  const total = String(props.count);
  const options = Array.from({ length: props.count }, (_, i) => ({
    value: String(i),
    label: `Vị trí ${String(i + 1)} / ${total}`,
  }));
  return (
    <Section title="Hiển thị">
      <div className={styles.sunken}>
        <Select
          label="Vị trí"
          options={options}
          value={String(props.position)}
          disabled={props.readOnly}
          onChange={(v) => {
            props.onPosition(Number(v));
          }}
        />
        <Switch
          label={props.visibleLabel}
          checked={props.visible}
          disabled={props.readOnly}
          onChange={props.onVisible}
        />
      </div>
    </Section>
  );
}
