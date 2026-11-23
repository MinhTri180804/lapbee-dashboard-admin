import { describe, expect, it } from 'vitest';
import { describeUserAgent, toSessionRow } from './adapters';

const CHROME_MAC =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const SAFARI_IOS =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const EDGE_WIN =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0';
const FIREFOX_LINUX = 'Mozilla/5.0 (X11; Linux x86_64; rv:127.0) Gecko/20100101 Firefox/127.0';
const CHROME_ANDROID =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36';

describe('describeUserAgent', () => {
  it.each([
    [CHROME_MAC, 'Chrome · macOS'],
    [SAFARI_IOS, 'Safari · iOS'],
    [EDGE_WIN, 'Edge · Windows'],
    [FIREFOX_LINUX, 'Firefox · Linux'],
    [CHROME_ANDROID, 'Chrome · Android'],
    ['curl/8.0', 'Thiết bị không rõ'],
    ['Mozilla/5.0 (Windows NT 10.0)', 'Windows'],
    ['', 'Thiết bị không rõ'],
  ])('%s', (ua, expected) => {
    expect(describeUserAgent(ua)).toBe(expected);
  });
});

describe('toSessionRow', () => {
  it('formats device and timestamps', () => {
    expect(
      toSessionRow({
        id: 's1',
        ip: '1.2.3.4',
        userAgent: CHROME_MAC,
        createdAt: '2026-01-02T03:04:00Z',
        lastSeenAt: '2026-01-02T05:06:00Z',
        current: true,
      }),
    ).toEqual({
      id: 's1',
      device: 'Chrome · macOS',
      ip: '1.2.3.4',
      createdAt: '10:04 · 02.01.2026',
      lastSeenAt: '12:06 · 02.01.2026',
      current: true,
    });
  });
});
