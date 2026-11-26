/**
 * Client SEO analyzer, ported from the design handoff (LAPBEE Admin.dc.html `analyze`, same logic
 * as seo-analyzer.js). Only the syntax changed: thresholds, weights, labels and details are as in
 * the design. `body` is markdown (see `blocksToMarkdown`).
 */

export type SeoInput = {
  title: string;
  slug: string;
  kw: string;
  meta: string;
  body: string;
  alt: string;
};

export type SeoStatus = 'good' | 'warn' | 'bad';

export type SeoCheck = {
  group: 'seo' | 'read';
  label: string;
  status: SeoStatus;
  detail: string;
  w: number;
};

export type SeoResult = { score: number; checks: SeoCheck[]; wc: number; read: number };

export type ScoreBand =
  | { label: 'Tốt'; tone: 'success' }
  | { label: 'Cần cải thiện'; tone: 'warning' }
  | { label: 'Kém'; tone: 'danger' };

export const strip = (s: string): string =>
  (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');

export const slugify = (s: string): string =>
  strip(s)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** ≥80 "Tốt" · 50–79 "Cần cải thiện" · <50 "Kém". */
export function scoreBand(score: number): ScoreBand {
  if (score >= 80) return { label: 'Tốt', tone: 'success' };
  if (score >= 50) return { label: 'Cần cải thiện', tone: 'warning' };
  return { label: 'Kém', tone: 'danger' };
}

export function analyze(p: SeoInput): SeoResult {
  const kw = (p.kw || '').trim().toLowerCase();
  const title = p.title || '',
    meta = p.meta || '',
    body = p.body || '';
  const plain = body.replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[#*_>`]/g, '');
  const wc = plain.split(/\s+/).filter(Boolean).length;
  const paras = body
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith('#'));
  const first = (paras[0] || '').toLowerCase();
  const occ = kw ? plain.toLowerCase().split(kw).length - 1 : 0;
  const dens = wc && kw ? ((occ * kw.split(/\s+/).length) / wc) * 100 : 0;
  const h2 = (body.match(/^##\s+\S/gm) || []).length;
  const links = (body.match(/\]\((\/|https?:\/\/(www\.)?lapbee)/g) || []).length;
  const sents = plain.split(/[.!?…:]+(\s|$)/).filter((s) => s && s.trim().split(/\s+/).length > 2);
  const avg = sents.length ? wc / sents.length : 0;
  const longP = paras.filter((x) => x.split(/\s+/).length > 120).length;
  const tl = title.length,
    ml = meta.length;
  const has = (s: string) => !!kw && s.toLowerCase().includes(kw);
  const C: SeoCheck[] = [];
  const add = (group: SeoCheck['group'], label: string, status: SeoStatus, detail: string, w = 1) =>
    C.push({ group, label, status, detail, w });
  const kwInSlug = !!kw && (p.slug || '').includes(slugify(kw));
  const kwInFirst = !!kw && first.includes(kw);
  add(
    'seo',
    'Từ khoá chính',
    kw ? 'good' : 'bad',
    kw ? `Đang tối ưu cho “${p.kw.trim()}”.` : 'Chưa đặt từ khoá chính.',
    1,
  );
  add(
    'seo',
    'Từ khoá trong tiêu đề',
    has(title) ? 'good' : 'bad',
    has(title) ? 'Tiêu đề có chứa từ khoá.' : 'Đưa từ khoá vào tiêu đề, càng gần đầu càng tốt.',
    2,
  );
  add(
    'seo',
    'Độ dài tiêu đề',
    tl >= 30 && tl <= 60 ? 'good' : tl >= 20 && tl <= 70 ? 'warn' : 'bad',
    `${String(tl)} ký tự · nên 30–60.`,
    1,
  );
  add(
    'seo',
    'Từ khoá trong đường dẫn',
    kwInSlug ? 'good' : 'warn',
    kwInSlug ? 'Đường dẫn có chứa từ khoá.' : 'Đường dẫn nên ngắn và chứa từ khoá.',
    1,
  );
  add(
    'seo',
    'Độ dài mô tả meta',
    ml >= 120 && ml <= 160 ? 'good' : ml >= 70 && ml <= 180 ? 'warn' : 'bad',
    ml ? `${String(ml)} ký tự · nên 120–160.` : 'Chưa có mô tả meta.',
    2,
  );
  add(
    'seo',
    'Từ khoá trong mô tả meta',
    has(meta) ? 'good' : 'bad',
    has(meta) ? 'Mô tả có chứa từ khoá.' : 'Nhắc lại từ khoá trong mô tả meta.',
    1,
  );
  add(
    'seo',
    'Từ khoá ở đoạn mở đầu',
    kwInFirst ? 'good' : 'warn',
    kwInFirst ? 'Đoạn đầu có nhắc tới từ khoá.' : 'Nhắc tới từ khoá trong đoạn đầu tiên.',
    1,
  );
  add(
    'seo',
    'Độ dài nội dung',
    wc >= 300 ? 'good' : wc >= 150 ? 'warn' : 'bad',
    `${String(wc)} từ · nên từ 300 từ.`,
    2,
  );
  add(
    'seo',
    'Mật độ từ khoá',
    !kw ? 'bad' : dens >= 0.5 && dens <= 2.5 ? 'good' : occ > 0 ? 'warn' : 'bad',
    kw
      ? `${dens.toFixed(1).replace('.', ',')}% · xuất hiện ${String(occ)} lần · nên 0,5–2,5%.`
      : 'Cần có từ khoá để tính.',
    1,
  );
  add(
    'seo',
    'Liên kết nội bộ',
    links ? 'good' : 'warn',
    links
      ? `${String(links)} liên kết tới trang LAPBEE.`
      : 'Thêm liên kết tới dịch vụ hoặc bài viết liên quan.',
    1,
  );
  add(
    'seo',
    'Văn bản thay thế ảnh bìa',
    p.alt ? 'good' : 'warn',
    p.alt ? 'Ảnh bìa đã có mô tả.' : 'Mô tả ngắn nội dung ảnh, nên chứa từ khoá.',
    1,
  );
  add(
    'read',
    'Tiêu đề phụ',
    h2 >= 2 ? 'good' : h2 === 1 ? 'warn' : 'bad',
    `${String(h2)} tiêu đề H2 · nên từ 2 trở lên.`,
    1,
  );
  add(
    'read',
    'Độ dài câu',
    !wc ? 'bad' : avg <= 30 ? 'good' : avg <= 40 ? 'warn' : 'bad',
    wc ? `Trung bình ${String(Math.round(avg))} từ mỗi câu · nên dưới 30.` : 'Chưa có nội dung.',
    1,
  );
  add(
    'read',
    'Độ dài đoạn văn',
    !wc ? 'bad' : longP ? 'warn' : 'good',
    !wc
      ? 'Chưa có nội dung.'
      : longP
        ? `${String(longP)} đoạn dài hơn 120 từ.`
        : 'Các đoạn đều ngắn gọn.',
    1,
  );
  const tot = C.reduce((a, c) => a + c.w, 0);
  const got = C.reduce(
    (a, c) => a + (c.status === 'good' ? c.w : c.status === 'warn' ? c.w / 2 : 0),
    0,
  );
  return {
    score: Math.round((got / tot) * 100),
    checks: C,
    wc,
    read: Math.max(1, Math.round(wc / 200)),
  };
}
