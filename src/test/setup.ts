import '@testing-library/jest-dom/vitest';
import { sessionStore } from '@/shared/auth/session-store';
import { server } from './msw/server';

beforeAll(() => {
  server.listen({ onUnhandledFrame: 'error' });
});

afterEach(() => {
  server.resetHandlers();
  sessionStore.signOut();
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
