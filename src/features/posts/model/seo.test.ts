import { describe, expect, it } from 'vitest';
import { seoSamplePost } from '@/test/fixtures/posts-seo';
import { analyze, scoreBand, slugify, strip } from './seo';

const EMPTY = { title: '', slug: '', kw: '', meta: '', body: '', alt: '' };

describe('analyze', () => {
  // Expected numbers come from running the design's seo-analyzer.js (and the dc.html copy) on
  // the same input with Node: score 94, wc 291, read 1.
  it('matches the original analyzer on the design sample post', () => {
    const r = analyze(seoSamplePost);
    expect(r.score).toBe(94);
    expect(r.wc).toBe(291);
    expect(r.read).toBe(1);
    expect(r.checks).toEqual([
      {
        group: 'seo',
        label: 'Từ khoá chính',
        status: 'good',
        detail: 'Đang tối ưu cho “pin laptop”.',
        w: 1,
      },
      {
        group: 'seo',
        label: 'Từ khoá trong tiêu đề',
        status: 'good',
        detail: 'Tiêu đề có chứa từ khoá.',
        w: 2,
      },
      {
        group: 'seo',
        label: 'Độ dài tiêu đề',
        status: 'good',
        detail: '35 ký tự · nên 30–60.',
        w: 1,
      },
      {
        group: 'seo',
        label: 'Từ khoá trong đường dẫn',
        status: 'good',
        detail: 'Đường dẫn có chứa từ khoá.',
        w: 1,
      },
      {
        group: 'seo',
        label: 'Độ dài mô tả meta',
        status: 'good',
        detail: '134 ký tự · nên 120–160.',
        w: 2,
      },
      {
        group: 'seo',
        label: 'Từ khoá trong mô tả meta',
        status: 'good',
        detail: 'Mô tả có chứa từ khoá.',
        w: 1,
      },
      {
        group: 'seo',
        label: 'Từ khoá ở đoạn mở đầu',
        status: 'good',
        detail: 'Đoạn đầu có nhắc tới từ khoá.',
        w: 1,
      },
      {
        group: 'seo',
        label: 'Độ dài nội dung',
        status: 'warn',
        detail: '291 từ · nên từ 300 từ.',
        w: 2,
      },
      {
        group: 'seo',
        label: 'Mật độ từ khoá',
        status: 'good',
        detail: '2,1% · xuất hiện 3 lần · nên 0,5–2,5%.',
        w: 1,
      },
      {
        group: 'seo',
        label: 'Liên kết nội bộ',
        status: 'good',
        detail: '1 liên kết tới trang LAPBEE.',
        w: 1,
      },
      {
        group: 'seo',
        label: 'Văn bản thay thế ảnh bìa',
        status: 'good',
        detail: 'Ảnh bìa đã có mô tả.',
        w: 1,
      },
      {
        group: 'read',
        label: 'Tiêu đề phụ',
        status: 'good',
        detail: '6 tiêu đề H2 · nên từ 2 trở lên.',
        w: 1,
      },
      {
        group: 'read',
        label: 'Độ dài câu',
        status: 'good',
        detail: 'Trung bình 18 từ mỗi câu · nên dưới 30.',
        w: 1,
      },
      {
        group: 'read',
        label: 'Độ dài đoạn văn',
        status: 'good',
        detail: 'Các đoạn đều ngắn gọn.',
        w: 1,
      },
    ]);
  });

  it('scores an empty post low', () => {
    const r = analyze(EMPTY);
    expect(r.score).toBe(12);
    expect(r.wc).toBe(0);
    expect(r.read).toBe(1);
    expect(r.checks.map((c) => c.status)).toEqual([
      'bad',
      'bad',
      'bad',
      'warn',
      'bad',
      'bad',
      'warn',
      'bad',
      'bad',
      'warn',
      'warn',
      'bad',
      'bad',
      'bad',
    ]);
    const details = r.checks.map((c) => c.detail);
    expect(details).toContain('Chưa có nội dung.');
    expect(details).toContain('Chưa đặt từ khoá chính.');
    expect(details).toContain('Chưa có mô tả meta.');
  });

  it('warns on one long paragraph', () => {
    const long = Array.from({ length: 130 }, () => 'từ').join(' ');
    const r = analyze({ ...EMPTY, body: long });
    expect(r.checks[13]).toMatchObject({ status: 'warn', detail: '1 đoạn dài hơn 120 từ.' });
  });
});

describe('scoreBand', () => {
  it('uses 80 and 50 as thresholds', () => {
    expect(scoreBand(80)).toEqual({ label: 'Tốt', tone: 'success' });
    expect(scoreBand(79)).toEqual({ label: 'Cần cải thiện', tone: 'warning' });
    expect(scoreBand(50)).toEqual({ label: 'Cần cải thiện', tone: 'warning' });
    expect(scoreBand(49)).toEqual({ label: 'Kém', tone: 'danger' });
  });
});

describe('strip and slugify', () => {
  it('removes accents and đ', () => {
    expect(strip('Đổi Pin Laptop')).toBe('doi pin laptop');
    expect(slugify('5 dấu hiệu pin laptop cần được thay')).toBe(
      '5-dau-hieu-pin-laptop-can-duoc-thay',
    );
    expect(slugify('  --Xin chào!--  ')).toBe('xin-chao');
  });
});
