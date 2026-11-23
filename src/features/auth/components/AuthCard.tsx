import type { ReactNode } from 'react';
import { Wordmark } from '@/shared/ui';
import styles from './AuthCard.module.css';

export function AuthCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className={styles.screen}>
      <header className={styles.brand}>
        <Wordmark size={32} inverse />
        <p className={styles.label}>QUẢN TRỊ WEBSITE</p>
      </header>
      <section className={styles.card}>
        <h1 className={styles.title}>{title}</h1>
        {children}
      </section>
    </main>
  );
}

/** Spread helper: `error` is only passed when present (exactOptionalPropertyTypes). */
export function fieldError(message: string | undefined): { error?: string } {
  return message === undefined ? {} : { error: message };
}
