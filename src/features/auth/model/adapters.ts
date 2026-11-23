import { formatDateTime } from '@/shared/lib/format-date';
import type { SessionDto } from '../api/repo';

export const authKeys = { sessions: ['auth', 'sessions'] as const };

const UNKNOWN_DEVICE = 'Thiết bị không rõ';

// Order matters: Edge UAs contain "Chrome", Chrome UAs contain "Safari".
const BROWSERS: readonly [RegExp, string][] = [
  [/Edg(e|A|iOS)?\//, 'Edge'],
  [/Firefox\/|FxiOS\//, 'Firefox'],
  [/Chrome\/|CriOS\//, 'Chrome'],
  [/Safari\//, 'Safari'],
];

// iOS before macOS: iOS UAs contain "like Mac OS X". Android before Linux.
const SYSTEMS: readonly [RegExp, string][] = [
  [/iPhone|iPad/, 'iOS'],
  [/Android/, 'Android'],
  [/Mac OS X/, 'macOS'],
  [/Windows/, 'Windows'],
  [/Linux/, 'Linux'],
];

function detect(table: readonly [RegExp, string][], ua: string): string | null {
  return table.find(([pattern]) => pattern.test(ua))?.[1] ?? null;
}

/** `<Browser> · <OS>`, omitting what is not recognised. */
export function describeUserAgent(ua: string): string {
  const parts = [detect(BROWSERS, ua), detect(SYSTEMS, ua)].filter((p): p is string => p !== null);
  return parts.length > 0 ? parts.join(' · ') : UNKNOWN_DEVICE;
}

export type SessionRow = {
  id: string;
  device: string;
  ip: string;
  createdAt: string;
  lastSeenAt: string;
  current: boolean;
};

export function toSessionRow(dto: SessionDto): SessionRow {
  return {
    id: dto.id,
    device: describeUserAgent(dto.userAgent),
    ip: dto.ip,
    createdAt: formatDateTime(dto.createdAt),
    lastSeenAt: formatDateTime(dto.lastSeenAt),
    current: dto.current,
  };
}
