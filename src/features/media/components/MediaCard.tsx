import { cx } from '@/shared/ui/cx';
import type { MediaDto } from '../model/adapters';
import styles from './MediaCard.module.css';

export type MediaCardProps = {
  media: MediaDto;
  /** The image open in the detail panel. */
  selected: boolean;
  checked: boolean;
  onOpen: () => void;
  onToggleCheck: () => void;
  checkable: boolean;
  /** Some image is checked: every box stays visible. */
  selecting?: boolean;
  /** The limit is reached: the unchecked boxes are off. */
  checkDisabled?: boolean;
};

export function MediaCard({
  media,
  selected,
  checked,
  onOpen,
  onToggleCheck,
  checkable,
  selecting = false,
  checkDisabled = false,
}: MediaCardProps) {
  return (
    <div
      className={cx(styles.card, selected && styles.selected)}
      data-selecting={selecting || checked || undefined}
    >
      <button
        type="button"
        className={styles.open}
        aria-label={media.name}
        aria-current={selected || undefined}
        onClick={onOpen}
      >
        <img
          className={styles.thumb}
          src={media.thumbUrl}
          alt={media.alt || media.name}
          loading="lazy"
        />
        <span className={styles.body}>
          <span className={styles.name} title={media.name}>
            {media.name}
          </span>
          <span className={styles.meta}>
            {media.width} × {media.height}
          </span>
        </span>
      </button>
      {checkable && (
        <input
          type="checkbox"
          className={styles.check}
          aria-label={`Chọn ${media.name}`}
          checked={checked}
          disabled={checkDisabled && !checked}
          onChange={onToggleCheck}
        />
      )}
    </div>
  );
}
