import '@testing-library/jest-dom/vitest';
import { isReauthPending, rejectReauth } from '@/shared/api/reauth-coordinator';
import { sessionStore } from '@/shared/auth/session-store';
import { server } from './msw/server';

beforeAll(() => {
  server.listen({ onUnhandledFrame: 'error' });
});

afterEach(() => {
  server.resetHandlers();
  sessionStore.signOut();
  // A reauth prompt left open would make the next test's 403 REAUTH_REQUIRED join it.
  if (isReauthPending()) rejectReauth();
});

afterAll(() => {
  server.close();
});

// jsdom does not implement the modal APIs of <dialog>.
if (typeof HTMLDialogElement !== 'undefined') {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute('open');
  };
}

// jsdom does not implement window.scrollTo (called by the router's <ScrollRestoration>).
window.scrollTo = () => undefined;
