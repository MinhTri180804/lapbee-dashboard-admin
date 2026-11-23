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
