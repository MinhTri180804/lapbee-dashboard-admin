import { rectSortingStrategy } from '@dnd-kit/sortable';
import { UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useCan } from '@/shared/auth/permissions';
import { Badge, Button, Card, SortableItem, SortableItems } from '@/shared/ui';
import { useUpdateItem } from '../hooks/use-item-mutations';
import { useSite } from '../hooks/use-site';
import { NO_UPDATE_TITLE } from './labels';
import { Section } from './Section';
import styles from './TeamGrid.module.css';

export function TeamGrid() {
  const { data: site } = useSite();
  const navigate = useNavigate();
  const canUpdate = useCan('site.update');
  const reorder = useUpdateItem('team', { handlesErrors: false });
  if (!site) return null;
  const team = site.draft.team;

  return (
    <Section
      title="Đội ngũ"
      meta={`${String(team.length)} thành viên`}
      actions={
        <Button
          variant="secondary"
          size="sm"
          icon={UserPlus}
          disabled={!canUpdate}
          title={canUpdate ? undefined : NO_UPDATE_TITLE}
          onClick={() => {
            void navigate('/site/team/new');
          }}
        >
          Thêm thành viên
        </Button>
      }
    >
      {team.length > 0 ? (
        <SortableItems
          items={team}
          titleOf={(m) => m.name}
          strategy={rectSortingStrategy}
          onMove={(m, position) =>
            reorder.mutateAsync({ id: m.id, body: { version: m.version, position } })
          }
        >
          {(ordered) => (
            <ul className={styles.grid}>
              {ordered.map((m) => (
                <SortableItem
                  key={m.id}
                  id={m.id}
                  title={m.name}
                  disabled={!canUpdate}
                  disabledTitle={NO_UPDATE_TITLE}
                  className={styles.item}
                >
                  {(handle) => (
                    <>
                      <Card
                        as="button"
                        padding={0}
                        className={styles.card ?? ''}
                        onClick={() => {
                          void navigate(`/site/team/${m.id}`);
                        }}
                      >
                        {m.photo ? (
                          <img className={styles.photo} src={m.photo.thumbUrl} alt="" />
                        ) : (
                          <span className={styles.placeholder} aria-hidden="true">
                            <span className="lb-label">Ảnh chân dung</span>
                          </span>
                        )}
                        <span className={styles.body}>
                          <span className={styles.name}>{m.name}</span>
                          <span className={styles.role}>{m.role}</span>
                          <span className={styles.foot}>
                            <span className="lb-label">Từ {m.since}</span>
                            {m.visible ? null : <Badge>Đang ẩn</Badge>}
                          </span>
                        </span>
                      </Card>
                      <span className={styles.handle}>{handle}</span>
                    </>
                  )}
                </SortableItem>
              ))}
            </ul>
          )}
        </SortableItems>
      ) : null}
    </Section>
  );
}
