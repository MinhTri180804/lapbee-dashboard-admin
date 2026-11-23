// Port of seo-analyzer.js `strip` / `slugify`. Keep the behaviour identical.

export function stripDiacritics(s: string): string {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd');
}

export function slugify(s: string): string {
  return stripDiacritics(s)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
