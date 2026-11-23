import { useSyncExternalStore } from 'react';

export type SessionUser = { id: string; email: string; name: string };

export type SessionState = {
  status: 'unknown' | 'authenticated' | 'anonymous';
  user: SessionUser | null;
  permissions: readonly string[];
  csrfToken: string | null;
  lastActivityAt: number | null;
};

export type SignInInput = {
  user: SessionUser;
  permissions: readonly string[];
  csrfToken: string;
};

const anonymous: SessionState = {
  status: 'anonymous',
  user: null,
  permissions: [],
  csrfToken: null,
  lastActivityAt: null,
};

// In-memory only (never localStorage): the session lives in an HttpOnly cookie.
let state: SessionState = { ...anonymous, status: 'unknown' };
const listeners = new Set<() => void>();

function set(next: SessionState): void {
  state = next;
  for (const listener of listeners) listener();
}

export const sessionStore = {
  // Arrow functions: passed unbound to useSyncExternalStore.
  get: (): SessionState => state,
  subscribe: (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  signIn({ user, permissions, csrfToken }: SignInInput): void {
    set({
      status: 'authenticated',
      user: { id: user.id, email: user.email, name: user.name },
      permissions: [...permissions],
      csrfToken,
      lastActivityAt: Date.now(),
    });
  },
  setCsrfToken(csrfToken: string): void {
    set({ ...state, csrfToken });
  },
  markActivity(now: number = Date.now()): void {
    set({ ...state, lastActivityAt: now });
  },
  signOut(): void {
    set(anonymous);
  },
};

export function useSession(): SessionState {
  return useSyncExternalStore(sessionStore.subscribe, sessionStore.get);
}
