import { describe, expect, it } from 'vitest';
import { slugify, stripDiacritics } from './text';

describe('stripDiacritics', () => {
  it('lowercases, removes combining marks and maps đ to d', () => {
    expect(stripDiacritics('Đội ngũ')).toBe('doi ngu');
  });

  it('handles null-ish input as empty string', () => {
    expect(stripDiacritics('')).toBe('');
  });
});

describe('slugify', () => {
  it('builds a Vietnamese-safe slug identical to seo-analyzer.js', () => {
    expect(slugify('Mẹo hay: Đổi pin MacBook')).toBe('meo-hay-doi-pin-macbook');
  });

  it('collapses separators and trims leading/trailing dashes', () => {
    expect(slugify('  --Hello,   World!! ')).toBe('hello-world');
  });
});
