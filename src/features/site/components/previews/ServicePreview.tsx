import { ArrowUpRight } from 'lucide-react';
import { Card } from '@/shared/ui';
import { SERVICE_ICONS } from '../../model/service-icons';
import type { ServiceForm } from '../../model/types';
import styles from './Previews.module.css';

export type ServicePreviewProps = {
  values: Pick<ServiceForm, 'icon' | 'title' | 'desc' | 'time'>;
};

/** A service card as on the home page's "Dịch vụ" section. */
export function ServicePreview({ values }: ServicePreviewProps) {
  const Icon = SERVICE_ICONS.find((i) => i.name === values.icon)?.Icon;
  return (
    <Card padding={28} className={styles.service ?? ''}>
      <div className={styles.serviceTop}>
        {Icon ? <Icon size={28} aria-hidden="true" /> : <span />}
        <ArrowUpRight size={18} aria-hidden="true" className={styles.muted} />
      </div>
      <h3 className={styles.serviceTitle}>{values.title || 'Tiêu đề'}</h3>
      <p className={styles.text}>{values.desc || 'Mô tả ngắn về dịch vụ.'}</p>
      {values.time ? <span className="lb-label">{values.time}</span> : null}
    </Card>
  );
}
