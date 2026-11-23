export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'lb-admin-theme';

function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}

export function readStoredTheme(storage: Pick<Storage, 'getItem'>): Theme | null {
  try {
    const value = storage.getItem(THEME_STORAGE_KEY);
    return isTheme(value) ? value : null;
  } catch {
    return null;
  }
}

export function resolveInitialTheme(stored: Theme | null, prefersDark: boolean): Theme {
  return stored ?? (prefersDark ? 'dark' : 'light');
}

export function applyTheme(theme: Theme, root: HTMLElement = document.documentElement): void {
  root.dataset.theme = theme;
}

export function persistTheme(theme: Theme, storage: Pick<Storage, 'setItem'>): void {
  try {
    storage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage may be unavailable (private mode, quota); the theme just won't persist.
  }
}
