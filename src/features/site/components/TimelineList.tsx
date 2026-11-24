import { Pencil, Plus } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useCan } from '@/shared/auth/permissions';
import { Badge, Button, IconButton } from '@/shared/ui';
import { useSite } from '../hooks/use-site';
import type { TimelineDto } from '../model/types';
import { NO_UPDATE_TITLE } from './labels';
import { Section } from './Section';
import styles from './TimelineList.module.css';

function mediaLabel(t: TimelineDto): string {
  if (t.media === 'photos') return `${String(t.photos.length)} ảnh`;
  if (t.media === 'quote') return 'Trích dẫn';
  return 'Chỉ chữ';
}

/** Milestones in the server order (year ascending); not reorderable. */
export function TimelineList() {
  const { data: site } = useSite();
  const navigate = useNavigate();
  const canUpdate = useCan('site.update');
  if (!site) return null;
  const timeline = site.draft.timeline;
  const first = timeline[0];
  const last = timeline[timeline.length - 1];
  const meta =
    first && last
      ? `${String(timeline.length)} mốc · ${first.year} – ${last.year}`
      : `${String(timeline.length)} mốc`;

  return (
    <Section
      title="Hành trình"
      meta={meta}
      actions={
        <Button
          variant="secondary"
          size="sm"
          icon={Plus}
          disabled={!canUpdate}
          title={canUpdate ? undefined : NO_UPDATE_TITLE}
          onClick={() => {
            void navigate('/site/timeline/new');
          }}
        >
          Thêm mốc
        </Button>
      }
    >
      {timeline.length > 0 ? (
        <ul className={styles.list}>
          {timeline.map((t) => (
            <li key={t.id} className={styles.row}>
              <span className={styles.year}>{t.year}</span>
              <div className={styles.text}>
                <h4 className={styles.title}>{t.title}</h4>
                {t.body ? <p className={styles.body}>{t.body}</p> : null}
              </div>
              <div className={styles.actions}>
                <Badge>{mediaLabel(t)}</Badge>
                <IconButton
                  icon={Pencil}
                  label={`Sửa ${t.title}`}
                  size="sm"
                  onClick={() => {
                    void navigate(`/site/timeline/${t.id}`);
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </Section>
  );
}
