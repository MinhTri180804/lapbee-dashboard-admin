export type AppEvents = {
  'session:expired': undefined;
  'reauth:required': undefined;
  conflict: { invalidates: readonly (readonly unknown[])[] };
  toast: { kind: 'success' | 'error' | 'info'; title: string; body?: string };
};

export type AppEventName = keyof AppEvents;

type Listener<K extends AppEventName> = (payload: AppEvents[K]) => void;

/** Events without a payload are emitted as `emit('session:expired')`. */
type PayloadArgs<K extends AppEventName> = AppEvents[K] extends undefined
  ? [payload?: undefined]
  : [payload: AppEvents[K]];

const listeners = new Map<AppEventName, Set<(payload: never) => void>>();

export function on<K extends AppEventName>(event: K, fn: Listener<K>): () => void {
  let set = listeners.get(event);
  if (!set) {
    set = new Set();
    listeners.set(event, set);
  }
  set.add(fn);
  return () => {
    set.delete(fn);
  };
}

export function emit<K extends AppEventName>(event: K, ...[payload]: PayloadArgs<K>): void {
  const set = listeners.get(event) as Set<Listener<K>> | undefined;
  if (!set) return;
  for (const fn of [...set]) fn(payload as AppEvents[K]);
}
