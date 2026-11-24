import type { TimelineForm } from '../../model/types';
import styles from './Previews.module.css';

export type TimelinePreviewProps = {
  values: Pick<TimelineForm, 'year' | 'title' | 'body' | 'media' | 'quote'>;
  /** Photos in order, with the URL of each chosen image. */
  photos: { label: string; url: string | null }[];
};

/** A milestone as on the "Hành trình" page. */
export function TimelinePreview({ values, photos }: TimelinePreviewProps) {
  const quote = values.quote;
  const by = [quote.by, quote.role].filter(Boolean).join(' · ');
  return (
    <div className={styles.timeline}>
      <span className={styles.year}>{values.year}</span>
      <h3 className={styles.timelineTitle}>{values.title || 'Tiêu đề'}</h3>
      {values.body ? <p className={styles.text}>{values.body}</p> : null}
      {values.media === 'photos' && photos.length > 0 ? (
        <div className={styles.photos}>
          {photos.map((p, i) =>
            p.url ? (
              <img
                // Photos have no id; their order is their identity here.
                key={i}
                className={i === 0 ? styles.photoLead : styles.photo}
                src={p.url}
                alt={p.label}
              />
            ) : (
              <span key={i} className={i === 0 ? styles.photoLead : styles.photo}>
                <span className="lb-label">{p.label}</span>
              </span>
            ),
          )}
        </div>
      ) : null}
      {values.media === 'quote' ? (
        <figure className={styles.quote}>
          <blockquote className={styles.quoteText}>“{quote.text}”</blockquote>
          {by ? <figcaption className="lb-label">— {by}</figcaption> : null}
        </figure>
      ) : null}
    </div>
  );
}
