import { describe, expect, it } from 'vitest';
import { formatDate, formatDateTime } from './format-date';

describe('formatDate', () => {
  it('formats a bare YYYY-MM-DD as a calendar date without timezone shift', () => {
    expect(formatDate('2026-11-23')).toBe('23.11.2026');
  });

  it('converts ISO date-times to Asia/Ho_Chi_Minh before taking the date', () => {
    expect(formatDate('2026-11-22T20:05:00Z')).toBe('23.11.2026');
  });
});

describe('formatDateTime', () => {
  it('returns HH:MM · dd.mm.yyyy in Asia/Ho_Chi_Minh (UTC+7)', () => {
    expect(formatDateTime('2026-11-22T20:05:00Z')).toBe('03:05 · 23.11.2026');
  });
});
