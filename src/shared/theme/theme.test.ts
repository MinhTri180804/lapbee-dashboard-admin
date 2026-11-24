import { describe, expect, it } from 'vitest';
import {
  THEME_STORAGE_KEY,
  applyTheme,
  getThemeStorage,
  persistTheme,
  readStoredTheme,
  resolveInitialTheme,
} from './theme';

describe('theme', () => {
  it('uses the agreed storage key', () => {
    expect(THEME_STORAGE_KEY).toBe('lb-admin-theme');
  });

  it('resolveInitialTheme falls back to system preference', () => {
    expect(resolveInitialTheme(null, true)).toBe('dark');
    expect(resolveInitialTheme(null, false)).toBe('light');
  });

  it('resolveInitialTheme prefers the stored value', () => {
    expect(resolveInitialTheme('light', true)).toBe('light');
    expect(resolveInitialTheme('dark', false)).toBe('dark');
  });

  it('readStoredTheme returns valid values', () => {
    expect(readStoredTheme({ getItem: () => 'dark' })).toBe('dark');
    expect(readStoredTheme({ getItem: () => 'light' })).toBe('light');
  });

  it('readStoredTheme returns null for unknown or missing values', () => {
    expect(readStoredTheme({ getItem: () => 'blue' })).toBeNull();
    expect(readStoredTheme({ getItem: () => null })).toBeNull();
  });

  it('readStoredTheme returns null when storage throws', () => {
    const storage = {
      getItem: () => {
        throw new Error('denied');
      },
    };
    expect(readStoredTheme(storage)).toBeNull();
  });

  it('applyTheme sets data-theme on the given root', () => {
    const el = document.createElement('div');
    applyTheme('dark', el);
    expect(el.dataset.theme).toBe('dark');
  });

  it('persistTheme writes under the key and swallows errors', () => {
    const calls: [string, string][] = [];
    persistTheme('dark', {
      setItem: (k, v) => {
        calls.push([k, v]);
      },
    });
    expect(calls).toEqual([['lb-admin-theme', 'dark']]);
    expect(() => {
      persistTheme('light', {
        setItem: () => {
          throw new Error('quota');
        },
      });
    }).not.toThrow();
  });

  it('getThemeStorage returns null when localStorage access throws', () => {
    const throwing = {
      get localStorage(): Storage {
        throw new DOMException('denied', 'SecurityError');
      },
    };
    expect(getThemeStorage(throwing)).toBeNull();
    expect(getThemeStorage({ localStorage })).toBe(localStorage);
  });

  it('readStoredTheme and persistTheme accept a missing storage', () => {
    expect(readStoredTheme(null)).toBeNull();
    expect(() => {
      persistTheme('dark', null);
    }).not.toThrow();
  });
});
