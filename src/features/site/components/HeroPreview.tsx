import { ArrowRight, ExternalLink } from 'lucide-react';
import { useId } from 'react';
import { Card } from '@/shared/ui';
import { cx } from '@/shared/ui/cx';
import type { SettingsForm } from '../model/types';
import styles from './HeroPreview.module.css';

export type HeroValues = Pick<
  SettingsForm,
  'showEyebrow' | 'eyebrow' | 'h1a' | 'h1b' | 'h1hl' | 'lead' | 'cta1' | 'cta2' | 'stats'
>;

/** `https://lapbee.vn/` → `lapbee.vn`; empty when unset. */
function landingDomain(): { href: string; label: string } | null {
  const href = import.meta.env.VITE_LANDING_URL ?? '';
  const label = href.replace(/^[a-z]+:\/\//i, '').replace(/\/+$/, '');
  return label ? { href, label } : null;
}

/** Scaled-down hero of the landing home page, fed by the values being typed. */
export function HeroPreview({ values }: { values: HeroValues }) {
  const titleId = useId();
  const domain = landingDomain();
  return (
    <section className={styles.root} aria-labelledby={titleId}>
      <Card padding={0} className={cx(styles.card)}>
        <div className={styles.bar}>
          <span id={titleId} className="lb-label">
            Xem trước · Trang chủ
          </span>
          {domain ? (
            <a className={styles.domain} href={domain.href} target="_blank" rel="noreferrer">
              {domain.label}
              <ExternalLink size={13} aria-hidden="true" />
            </a>
          ) : null}
        </div>
        <div className={styles.hero}>
          {values.showEyebrow ? (
            <div className={cx('lb-label', styles.eyebrow)}>
              <span className={styles.dot} aria-hidden="true" />
              {values.eyebrow}
            </div>
          ) : null}
          <h2 className={styles.title}>
            {values.h1a}
            <br />
            {values.h1b} <span className={styles.highlight}>{values.h1hl}</span>.
          </h2>
          <p className={styles.lead}>{values.lead}</p>
          <div className={styles.ctas}>
            <span className={cx(styles.cta, styles.ctaPrimary)}>
              {values.cta1}
              <ArrowRight size={14} aria-hidden="true" />
            </span>
            <span className={cx(styles.cta, styles.ctaSecondary)}>{values.cta2}</span>
          </div>
          <dl className={styles.stats}>
            {values.stats.map((s, i) => (
              <div key={i} className={styles.stat}>
                <dt className={styles.statLabel}>{s.l}</dt>
                <dd className={styles.statValue}>{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Card>
      <p className={styles.note}>
        Bản xem trước thu nhỏ, cập nhật khi bạn gõ. Bố cục thật co giãn theo màn hình.
      </p>
    </section>
  );
}
