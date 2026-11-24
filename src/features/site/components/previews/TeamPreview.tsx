import { Card } from '@/shared/ui';
import type { TeamForm } from '../../model/types';
import { sinceHint } from '../labels';
import styles from './Previews.module.css';

export type TeamPreviewProps = {
  values: Pick<TeamForm, 'name' | 'role' | 'bio' | 'since'>;
  /** Full-size URL of the chosen portrait. */
  photoUrl: string | null;
  currentYear: number;
};

/** A member card as on the "Đội ngũ" page. */
export function TeamPreview({ values, photoUrl, currentYear }: TeamPreviewProps) {
  const since = sinceHint(values.since, currentYear);
  return (
    <Card padding={0} className={styles.team ?? ''}>
      {photoUrl ? (
        <img className={styles.portrait} src={photoUrl} alt="" />
      ) : (
        <span className={styles.portraitEmpty} aria-hidden="true">
          <span className="lb-label">Ảnh chân dung</span>
        </span>
      )}
      <div className={styles.teamBody}>
        <span className={styles.teamName}>{values.name || 'Họ và tên'}</span>
        {values.role ? <span className={styles.text}>{values.role}</span> : null}
        {values.bio ? <p className={styles.bio}>{values.bio}</p> : null}
        {since ? <span className="lb-label">{since}</span> : null}
      </div>
    </Card>
  );
}
