import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useState, useSyncExternalStore } from 'react';
import { ProblemError } from '@/shared/api/errors';
import { messageFor } from '@/shared/form/error-messages';
import { mediaRepo, type MediaDto } from '../api/repo';
import { mediaKeys, uploadErrorMessage } from '../model/adapters';

export type UploadItem = {
  key: string;
  name: string;
  /** 0 → 1. */
  progress: number;
  status: 'queued' | 'uploading' | 'done' | 'error';
  error?: string;
  media?: MediaDto;
};

export type UploadQueue = {
  items: UploadItem[];
  add: (files: File[], folderId: string | null) => void;
  clearFinished: () => void;
  busy: boolean;
};

/** The API takes one file per request; at most this many run at once (P3-3). */
const CONCURRENCY = 2;

type Job = { key: string; file: File; folderId: string | null };

function errorText(error: unknown): string {
  // Upload codes (MEDIA_TOO_LARGE…) have their own copy; anything else uses the global table.
  if (error instanceof ProblemError && error.code.startsWith('MEDIA_')) {
    return uploadErrorMessage(error.code);
  }
  return messageFor(error);
}

/**
 * A queue that lives outside React state, so re-renders never restart it and clearing the
 * finished rows never cancels an upload that is still running.
 */
function createUploadStore(qc: QueryClient) {
  let items: UploadItem[] = [];
  const pending: Job[] = [];
  let running = 0;
  let seq = 0;
  const listeners = new Set<() => void>();

  function set(next: UploadItem[]) {
    items = next;
    listeners.forEach((l) => {
      l();
    });
  }

  function patch(key: string, change: Partial<UploadItem>) {
    if (!items.some((i) => i.key === key)) return;
    set(items.map((i) => (i.key === key ? { ...i, ...change } : i)));
  }

  function pump() {
    while (running < CONCURRENCY) {
      const job = pending.shift();
      if (!job) return;
      running += 1;
      patch(job.key, { status: 'uploading' });
      mediaRepo
        .upload(job.file, job.folderId ? { folderId: job.folderId } : {}, (ratio) => {
          patch(job.key, { progress: ratio });
        })
        .then(
          (media) => {
            patch(job.key, { status: 'done', progress: 1, media });
            void qc.invalidateQueries({ queryKey: mediaKeys.all });
          },
          (error: unknown) => {
            patch(job.key, { status: 'error', error: errorText(error) });
          },
        )
        .finally(() => {
          running -= 1;
          pump();
        });
    }
  }

  return {
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => items,
    add: (files: File[], folderId: string | null) => {
      const jobs = files.map((file) => {
        seq += 1;
        return { key: `upload-${String(seq)}`, file, folderId };
      });
      pending.push(...jobs);
      set([
        ...items,
        ...jobs.map((j): UploadItem => ({
          key: j.key,
          name: j.file.name,
          progress: 0,
          status: 'queued',
        })),
      ]);
      pump();
    },
    clearFinished: () => {
      set(items.filter((i) => i.status === 'queued' || i.status === 'uploading'));
    },
  };
}

export function useUploadQueue(): UploadQueue {
  const qc = useQueryClient();
  const [store] = useState(() => createUploadStore(qc));
  const items = useSyncExternalStore(store.subscribe, store.getSnapshot);
  return {
    items,
    add: store.add,
    clearFinished: store.clearFinished,
    busy: items.some((i) => i.status === 'queued' || i.status === 'uploading'),
  };
}
