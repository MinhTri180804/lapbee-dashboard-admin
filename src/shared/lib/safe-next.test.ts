import { describe, expect, it } from 'vitest';
import { safeNext } from './safe-next';

describe('safeNext', () => {
  it('keeps same-origin relative paths with query strings', () => {
    expect(safeNext('/posts?page=2')).toBe('/posts?page=2');
  });

  it.each([
    '//evil.com',
    'https://evil.com',
    'javascript:alert(1)',
    '/\\evil.com',
    null,
    '',
  ])('rejects unsafe value %j and falls back to /', (bad) => {
    expect(safeNext(bad)).toBe('/');
  });

  it('never redirects back to /login', () => {
    expect(safeNext('/login')).toBe('/');
    expect(safeNext('/login?next=/posts')).toBe('/');
  });
});
