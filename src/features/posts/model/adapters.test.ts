import { describe, expect, it } from 'vitest';
import { paramsFromSearch } from './adapters';

const UUID = '3f2b8c1e-5a4d-4e6f-9a7b-0c1d2e3f4a5b';
const parse = (qs: string) => paramsFromSearch(new URLSearchParams(qs));

describe('paramsFromSearch', () => {
  it('defaults to Tất cả, page 1', () => {
    expect(parse('')).toEqual({ cat: null, status: null, q: '', page: 1 });
  });

  it('keeps a valid uuid and drops a bad one', () => {
    expect(parse(`cat=${UUID}`).cat).toBe(UUID);
    expect(parse('cat=not-a-uuid').cat).toBeNull();
  });

  it('keeps draft and published, drops anything else', () => {
    expect(parse('status=draft').status).toBe('draft');
    expect(parse('status=published').status).toBe('published');
    expect(parse('status=foo').status).toBeNull();
  });

  it.each(['0', 'abc', '1.5', '-3'])('page=%s falls back to 1', (page) => {
    expect(parse(`page=${page}`).page).toBe(1);
  });

  it('clamps page to the API cap of 100000', () => {
    expect(parse('page=100000').page).toBe(100000);
    expect(parse('page=200000').page).toBe(100000);
  });

  it('trims q and caps it at 200 characters', () => {
    expect(parse('q=%20%20abc%20%20').q).toBe('abc');
    expect(parse(`q=${'a'.repeat(250)}`).q).toHaveLength(200);
  });
});
