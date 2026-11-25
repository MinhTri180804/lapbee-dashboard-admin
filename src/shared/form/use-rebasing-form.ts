import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';

/** The latest server copy in the cache; null while there is none or once it was deleted. */
export type Server<T> = { values: T; version: number } | null;

type Baseline<T> = { initial: T; version: number };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false;
  const proto: unknown = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function same(a: unknown, b: unknown): boolean {
  return a === b || JSON.stringify(a) === JSON.stringify(b);
}

function merge(next: unknown, previous: unknown, current: unknown): unknown {
  if (isPlainObject(next) && isPlainObject(previous) && isPlainObject(current)) {
    const out: Record<string, unknown> = {};
    for (const key of new Set([...Object.keys(next), ...Object.keys(current)])) {
      const value = merge(next[key], previous[key], current[key]);
      if (value !== undefined || key in next) out[key] = value;
    }
    return out;
  }
  if (
    Array.isArray(next) &&
    Array.isArray(previous) &&
    Array.isArray(current) &&
    next.length === previous.length &&
    current.length === previous.length
  ) {
    return next.map((item: unknown, i) => merge(item, previous[i], current[i]));
  }
  return structuredClone(same(current, previous) ? next : current);
}

/**
 * `next` with every leaf the user changed (`current` vs `previous`) carried over, so a server
 * change in another leaf is not lost. Objects merge key by key and arrays element by element;
 * an array whose length changed is taken whole from the side that changed it.
 */
export function keepEdits<T>(next: T, previous: T, current: T): T {
  return merge(next, previous, current) as T;
}

/**
 * Keeps unsaved edits across version conflicts. The baseline holds the values and version the
 * form opened with (or was last rebased onto); writes send that version, not the cache's.
 * On a VERSION_CONFLICT, `onConflict` rebases the edits onto the newer cached copy, now if the
 * cache is already ahead, else when the reload brings one. Nothing is ever sent again on its own.
 */
export function useRebasingForm<T extends FieldValues>({
  form,
  server,
  followServerWhenClean = false,
  onGone,
}: {
  form: UseFormReturn<T>;
  server: Server<T>;
  /** A new server version replaces a clean form (the site settings page, P2-3). */
  followServerWhenClean?: boolean;
  /** The server copy disappeared while waiting for the reload after a conflict. */
  onGone?: () => void;
}) {
  const baselineRef = useRef<Baseline<T> | null>(null);
  baselineRef.current ??= {
    initial: structuredClone(form.getValues()),
    version: server?.version ?? 0,
  };
  /** Set after a version conflict: the next server version is rebased under the edits. */
  const waiting = useRef(false);
  /** While waiting, a server version that does not count as the next one (see below). */
  const skipVersion = useRef<number | null>(null);

  /** The server copy and callback of the latest render, read by handlers that run later. */
  const latest = useRef({ server, onGone });
  // Declared before the version effect below, so that effect reads this render's copy.
  useEffect(() => {
    latest.current = { server, onGone };
  });

  const resetTo = useCallback(
    (next: { values: T; version: number }) => {
      baselineRef.current = { initial: structuredClone(next.values), version: next.version };
      waiting.current = false;
      skipVersion.current = null;
      form.reset(next.values);
    },
    [form],
  );

  /**
   * Moves the baseline to `next` but keeps every value the user changed since `since`.
   *
   * Not `reset(…, { keepDirtyValues: true })`: in RHF 7.92 that sets `isDirty` to false and
   * keeps stale `dirtyFields`. The second reset with `keepDefaultValues` recomputes both.
   */
  const rebase = useCallback(
    (next: { values: T; version: number }, since: T) => {
      const merged = keepEdits(next.values, since, form.getValues());
      baselineRef.current = { initial: structuredClone(next.values), version: next.version };
      waiting.current = false;
      skipVersion.current = null;
      form.reset(next.values);
      form.reset(merged, { keepDefaultValues: true });
    },
    [form],
  );

  const { isDirty } = form.formState;
  const version = server?.version ?? null;
  useEffect(() => {
    const b = baselineRef.current;
    const now = latest.current.server;
    if (!b) return;
    if (!now) {
      if (waiting.current) {
        waiting.current = false;
        latest.current.onGone?.();
      }
      return;
    }
    if (now.version === b.version) return;
    if (followServerWhenClean && !isDirty) {
      resetTo(now);
    } else if (waiting.current && now.version !== skipVersion.current) {
      rebase(now, b.initial);
    }
  }, [version, isDirty, followServerWhenClean, resetTo, rebase]);

  const onConflict = useCallback(() => {
    const b = baselineRef.current;
    const now = latest.current.server;
    if (b && now && now.version !== b.version) {
      rebase(now, b.initial);
    } else {
      waiting.current = true;
      skipVersion.current = null;
    }
  }, [rebase]);

  /**
   * The user's own write elsewhere (a bulk move) bumped the version: rebase onto the next
   * server version, keeping the edits, with no dialog. A version already cached now predates
   * that write and is someone else's, so it is not adopted.
   */
  const rebaseOnNextVersion = useCallback(() => {
    waiting.current = true;
    skipVersion.current = latest.current.server?.version ?? null;
  }, []);

  const rebaseFromSent = useCallback(
    (next: { values: T; version: number }, sent: T) => {
      rebase(next, sent);
    },
    [rebase],
  );

  /** Always reads the current baseline, also from handlers created in an earlier render. */
  const baseline = useMemo(
    () => ({
      get initial(): T {
        return (baselineRef.current as Baseline<T>).initial;
      },
      get version(): number {
        return (baselineRef.current as Baseline<T>).version;
      },
    }),
    [],
  );

  return { baseline, onConflict, rebaseFromSent, rebaseOnNextVersion, resetTo };
}
