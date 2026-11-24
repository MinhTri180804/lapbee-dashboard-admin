import { Link } from 'react-router';
import type { FieldError } from '@/shared/api/errors';
import { Dialog } from '@/shared/ui';
import { locateError } from '../model/adapters';
import type { ErrorLocation, Settings, SiteDraft } from '../model/types';
import { SETTINGS_LABEL, TAB_LABEL } from './labels';
import styles from './PublishErrorsDialog.module.css';

export type PublishErrorsDialogProps = {
  open: boolean;
  errors: FieldError[];
  draft: SiteDraft;
  onClose: () => void;
};

function settingsFieldLabel(field: string): string {
  const [key, index] = field.split('.');
  const label = SETTINGS_LABEL[key as keyof Settings];
  return index !== undefined && /^\d+$/.test(index)
    ? `${label} · 0${String(Number(index) + 1)}`
    : label;
}

function itemName(loc: ErrorLocation, draft: SiteDraft): string {
  if (loc.kind === 'team') return draft.team.find((m) => m.id === loc.itemId)?.name ?? '';
  if (loc.kind === 'services') {
    return draft.services.find((s) => s.id === loc.itemId)?.title ?? '';
  }
  const t = draft.timeline.find((x) => x.id === loc.itemId);
  return t ? t.title || t.year : '';
}

type Row = { key: string; text: string; to: string | null };

function toRow(e: FieldError, i: number, draft: SiteDraft): Row {
  const loc = locateError(e.path, draft);
  const key = `${e.path}-${String(i)}`;
  if (!loc) return { key, text: e.message, to: null };
  if (loc.kind && loc.itemId) {
    const where = [TAB_LABEL[loc.tab], itemName(loc, draft)].filter(Boolean).join(' · ');
    return { key, text: `${where}: ${e.message}`, to: `/site/${loc.kind}/${loc.itemId}` };
  }
  return {
    key,
    text: `${TAB_LABEL[loc.tab]} · ${settingsFieldLabel(loc.field)}: ${e.message}`,
    to: `/site?tab=${loc.tab}`,
  };
}

/** Lists `SITE_INVALID` errors, each linking to its tab or item page (P2-7). */
export function PublishErrorsDialog({ open, errors, draft, onClose }: PublishErrorsDialogProps) {
  const rows = errors.map((e, i) => toRow(e, i, draft));
  return (
    <Dialog open={open} title="Chưa xuất bản được" onClose={onClose}>
      <p className={styles.intro}>Sửa các mục sau rồi xuất bản lại.</p>
      <ul className={styles.list}>
        {rows.map((r) => (
          <li key={r.key}>
            {r.to ? (
              <Link to={r.to} className={styles.link} onClick={onClose}>
                {r.text}
              </Link>
            ) : (
              r.text
            )}
          </li>
        ))}
      </ul>
    </Dialog>
  );
}
