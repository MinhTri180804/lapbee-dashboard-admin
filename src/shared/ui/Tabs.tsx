import { useRef } from 'react';
import type { KeyboardEvent } from 'react';
import { cx } from './cx';
import styles from './Tabs.module.css';

export type TabsProps = {
  items: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  label: string;
  /** Prefix for tab/panel ids; pair panels with `tabPanelProps(idPrefix, value)`. */
  idPrefix: string;
  className?: string;
};

export function tabPanelProps(idPrefix: string, value: string) {
  return {
    id: `${idPrefix}-panel-${value}`,
    role: 'tabpanel' as const,
    'aria-labelledby': `${idPrefix}-tab-${value}`,
  };
}

export function Tabs({ items, value, onChange, label, idPrefix, className }: TabsProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const move = (index: number) => {
    const target = items[(index + items.length) % items.length];
    if (!target) return;
    onChange(target.value);
    refs.current[items.indexOf(target)]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      move(index + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      move(index - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      move(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      move(items.length - 1);
    }
  };

  return (
    <div role="tablist" aria-label={label} className={cx(styles.list, className)}>
      {items.map((item, i) => {
        const selected = item.value === value;
        return (
          <button
            key={item.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            id={`${idPrefix}-tab-${item.value}`}
            aria-controls={`${idPrefix}-panel-${item.value}`}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            className={cx(styles.tab, selected && styles.selected)}
            onClick={() => {
              onChange(item.value);
            }}
            onKeyDown={(e) => {
              onKeyDown(e, i);
            }}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
