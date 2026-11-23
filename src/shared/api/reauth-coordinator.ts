import { ReauthCancelledError } from './errors';
import { emit } from './events';

type Pending = {
  promise: Promise<void>;
  resolve: () => void;
  reject: (error: ReauthCancelledError) => void;
};

let pending: Pending | null = null;

/**
 * Wait for the user to pass step-up (spec §4.4). Concurrent callers share one promise
 * (single-flight); `reauth:required` is emitted only when a new prompt is opened.
 */
export function waitForReauth(): Promise<void> {
  if (pending) return pending.promise;
  let resolve!: () => void;
  let reject!: (error: ReauthCancelledError) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  // Avoid an unhandled rejection when the prompt is cancelled with no request waiting.
  promise.catch(() => undefined);
  pending = { promise, resolve, reject };
  emit('reauth:required');
  return promise;
}

/** Called by the reauth dialog after a successful `POST /auth/reauth`. */
export function resolveReauth(): void {
  const current = pending;
  pending = null;
  current?.resolve();
}

/** Called when the user cancels the reauth dialog. Waiters reject with `ReauthCancelledError`. */
export function rejectReauth(): void {
  const current = pending;
  pending = null;
  current?.reject(new ReauthCancelledError());
}

export function isReauthPending(): boolean {
  return pending !== null;
}
