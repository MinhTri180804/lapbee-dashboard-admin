import { verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Pencil, Plus } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useCan } from '@/shared/auth/permissions';
import { Button, IconButton, Switch } from '@/shared/ui';
import { useUpdateItem } from '../hooks/use-item-mutations';
import { useSite } from '../hooks/use-site';
import { SERVICE_ICONS } from '../model/service-icons';
import type { ServiceDto } from '../model/types';
import { NO_UPDATE_TITLE } from './labels';
import { Section } from './Section';
import styles from './ServicesList.module.css';
import { SortableItem, SortableItems } from './SortableItems';

export function ServicesList() {
  const { data: site } = useSite();
  const navigate = useNavigate();
  const canUpdate = useCan('site.update');
  const update = useUpdateItem('services', { handlesErrors: false });
  if (!site) return null;
  const services = site.draft.services;
  const shown = services.filter((s) => s.visible).length;

  const toggle = (s: ServiceDto, visible: boolean) => {
    update.mutate({ id: s.id, body: { version: s.version, visible } });
  };

  return (
    <Section
      title="Dịch vụ"
      meta={`${String(services.length)} dịch vụ · ${String(shown)} đang hiển thị`}
      actions={
        canUpdate ? (
          <Button
            variant="secondary"
            size="sm"
            icon={Plus}
            onClick={() => {
              void navigate('/site/services/new');
            }}
          >
            Thêm dịch vụ
          </Button>
        ) : null
      }
    >
      {services.length > 0 ? (
        <SortableItems
          items={services}
          titleOf={(s) => s.title}
          strategy={verticalListSortingStrategy}
          onMove={(s, position, { onSettled }) => {
            update.mutate({ id: s.id, body: { version: s.version, position } }, { onSettled });
          }}
        >
          {(ordered) => (
            <ul className={styles.list}>
              {ordered.map((s) => {
                const Icon = SERVICE_ICONS.find((i) => i.name === s.icon)?.Icon;
                return (
                  <SortableItem
                    key={s.id}
                    id={s.id}
                    title={s.title}
                    disabled={!canUpdate}
                    className={styles.row}
                  >
                    {(handle) => (
                      <>
                        {handle}
                        <span
                          className={styles.icon}
                          data-hidden={s.visible ? undefined : 'true'}
                          aria-hidden="true"
                        >
                          {Icon ? <Icon size={22} /> : null}
                        </span>
                        <div className={styles.text} data-hidden={s.visible ? undefined : 'true'}>
                          <div className={styles.titleRow}>
                            <h4 className={styles.title}>{s.title}</h4>
                            {s.time ? <span className="lb-label">{s.time}</span> : null}
                          </div>
                          {s.desc ? <p className={styles.desc}>{s.desc}</p> : null}
                        </div>
                        <span title={canUpdate ? undefined : NO_UPDATE_TITLE}>
                          <Switch
                            checked={s.visible}
                            onChange={(v) => {
                              toggle(s, v);
                            }}
                            label={`Hiện ${s.title}`}
                            hideLabel
                            disabled={!canUpdate}
                          />
                        </span>
                        <IconButton
                          icon={Pencil}
                          label={`Sửa ${s.title}`}
                          size="sm"
                          onClick={() => {
                            void navigate(`/site/services/${s.id}`);
                          }}
                        />
                      </>
                    )}
                  </SortableItem>
                );
              })}
            </ul>
          )}
        </SortableItems>
      ) : null}
    </Section>
  );
}
