const LOGIN_PATH = '/login';

/**
 * Validates a post-login `next` target. Only same-origin relative paths are
 * allowed; anything else (protocol-relative, absolute, backslash tricks,
 * control characters, or the login page itself) falls back to `/`.
 */
export function safeNext(raw: string | null): string {
  if (!raw) return '/';
  if (!raw.startsWith('/')) return '/';
  if (raw.startsWith('//')) return '/';
  // Browsers treat `\` as `/` and strip tabs/newlines, so reject both outright.
  if (raw.includes('\\') || /[\u0000-\u001f\u007f]/.test(raw)) return '/';

  const pathname = raw.split(/[?#]/, 1)[0] ?? '';
  if (pathname === LOGIN_PATH || pathname.startsWith(`${LOGIN_PATH}/`)) return '/';

  return raw;
}
