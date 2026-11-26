import { describe, expect, it } from 'vitest';
import type { Block } from './blocks';
import { blocksToMarkdown } from './blocks-to-markdown';
import { inlineToMarkdown } from './inline-html';

describe('inlineToMarkdown', () => {
  it('converts bold and italic', () => {
    expect(inlineToMarkdown('<b>a</b> <i>b</i>')).toBe('**a** *b*');
    expect(inlineToMarkdown('<strong>a</strong> <em>b</em>')).toBe('**a** *b*');
  });

  it('converts strike and inline code', () => {
    expect(inlineToMarkdown('<s>x</s> <code>y</code>')).toBe('~~x~~ `y`');
  });

  it('turns safe links into markdown links', () => {
    expect(inlineToMarkdown('<a href="/dich-vu">x</a>')).toBe('[x](/dich-vu)');
    expect(inlineToMarkdown('<a href="https://lapbee.vn">x</a>')).toBe('[x](https://lapbee.vn)');
    expect(inlineToMarkdown('<a href="#neo">x</a>')).toBe('[x](#neo)');
    expect(inlineToMarkdown('<a href="mailto:a@b.vn">x</a>')).toBe('[x](mailto:a@b.vn)');
    expect(inlineToMarkdown('<a href="tel:0900">x</a>')).toBe('[x](tel:0900)');
  });

  it('keeps only the text of unsafe links', () => {
    expect(inlineToMarkdown('<a href="javascript:alert(1)">x</a>')).toBe('x');
    expect(inlineToMarkdown('<a href="java\tscript:alert(1)">x</a>')).toBe('x');
    expect(inlineToMarkdown('<a href="//evil.example">x</a>')).toBe('x');
    expect(inlineToMarkdown('<a href="/\\evil.example">x</a>')).toBe('x');
    expect(inlineToMarkdown('<a href="http://lapbee.vn">x</a>')).toBe('x');
    expect(inlineToMarkdown('<a>x</a>')).toBe('x');
  });

  it('decodes entities', () => {
    expect(inlineToMarkdown('a&amp;b&nbsp;c')).toBe('a&b c');
  });

  it('turns br into a line break', () => {
    expect(inlineToMarkdown('x<br>y')).toBe('x\ny');
  });

  it('keeps the text of u, mark and unknown tags', () => {
    expect(inlineToMarkdown('<u>a</u><mark>b</mark>')).toBe('ab');
    expect(inlineToMarkdown('<span>z</span>')).toBe('z');
  });

  it('never produces html and drops script contents', () => {
    expect(inlineToMarkdown('&lt;b&gt;x<script>alert(1)</script>')).toBe('<b>x');
    expect(inlineToMarkdown('<img src=x onerror="alert(1)">a')).toBe('a');
  });

  it('nests marks', () => {
    expect(inlineToMarkdown('<b><a href="/a">x</a></b>')).toBe('**[x](/a)**');
  });
});

const MEDIA_ID = '00000000-0000-4000-a000-000000000001';

describe('blocksToMarkdown', () => {
  it('paragraph', () => {
    expect(blocksToMarkdown([{ type: 'paragraph', data: { text: 'Xin <b>chào</b>' } }])).toBe(
      'Xin **chào**',
    );
  });

  it('header', () => {
    expect(blocksToMarkdown([{ type: 'header', data: { text: 'Mục', level: 2 } }])).toBe('## Mục');
    expect(blocksToMarkdown([{ type: 'header', data: { text: 'Mục', level: 4 } }])).toBe(
      '#### Mục',
    );
  });

  it('unordered list with nesting', () => {
    const block: Block = {
      type: 'list',
      data: {
        style: 'unordered',
        items: [
          {
            content: 'A',
            meta: {},
            items: [{ content: '<i>A1</i>', meta: {}, items: [] }],
          },
          { content: 'B', meta: {}, items: [] },
        ],
      },
    };
    expect(blocksToMarkdown([block])).toBe('- A\n  - *A1*\n- B');
  });

  it('ordered list', () => {
    const block: Block = {
      type: 'list',
      data: {
        style: 'ordered',
        meta: { counterType: 'numeric' },
        items: [
          { content: 'A', meta: {}, items: [{ content: 'A1', meta: {}, items: [] }] },
          { content: 'B', meta: {}, items: [] },
        ],
      },
    };
    expect(blocksToMarkdown([block])).toBe('1. A\n  1. A1\n1. B');
  });

  it('checklist', () => {
    const block: Block = {
      type: 'list',
      data: {
        style: 'checklist',
        items: [
          { content: 'Xong', meta: { checked: true }, items: [] },
          { content: 'Chưa', meta: { checked: false }, items: [] },
        ],
      },
    };
    expect(blocksToMarkdown([block])).toBe('- [x] Xong\n- [ ] Chưa');
  });

  it('code keeps raw text', () => {
    expect(
      blocksToMarkdown([
        { type: 'code', data: { code: 'const a = <b>1</b>;', language: 'typescript' } },
      ]),
    ).toBe('```typescript\nconst a = <b>1</b>;\n```');
  });

  it('table with headings', () => {
    expect(
      blocksToMarkdown([
        {
          type: 'table',
          data: {
            withHeadings: true,
            content: [
              ['Tên', '<b>Giá</b>'],
              ['Pin', '500k'],
            ],
          },
        },
      ]),
    ).toBe('| Tên | **Giá** |\n| --- | --- |\n| Pin | 500k |');
  });

  it('table without headings gets an empty header row', () => {
    expect(
      blocksToMarkdown([
        {
          type: 'table',
          data: {
            withHeadings: false,
            content: [
              ['a', 'b'],
              ['c', 'd'],
            ],
          },
        },
      ]),
    ).toBe('|  |  |\n| --- | --- |\n| a | b |\n| c | d |');
  });

  it('callout', () => {
    expect(
      blocksToMarkdown([
        { type: 'callout', data: { variant: 'tip', title: 'Mẹo', message: 'Tắt <i>máy</i>' } },
      ]),
    ).toBe('> **Mẹo**\n> Tắt *máy*');
    expect(
      blocksToMarkdown([
        { type: 'callout', data: { variant: 'info', title: '', message: 'Chú ý' } },
      ]),
    ).toBe('> Chú ý');
  });

  it('image no longer in the library has an empty url', () => {
    expect(
      blocksToMarkdown([
        {
          type: 'image',
          data: {
            file: { mediaId: MEDIA_ID, url: null },
            caption: 'Ảnh',
            withBorder: false,
            stretched: false,
            withBackground: false,
          },
        },
      ]),
    ).toBe('![Ảnh]()');
  });

  it('quote with and without caption', () => {
    expect(blocksToMarkdown([{ type: 'quote', data: { text: 'Câu nói', caption: 'Ai đó' } }])).toBe(
      '> Câu nói\n> — Ai đó',
    );
    expect(blocksToMarkdown([{ type: 'quote', data: { text: 'Câu nói', caption: '' } }])).toBe(
      '> Câu nói',
    );
  });

  it('image', () => {
    expect(
      blocksToMarkdown([
        {
          type: 'image',
          data: {
            file: { mediaId: MEDIA_ID, url: 'https://cdn.example/a.jpg', width: 10, height: 20 },
            caption: 'Ảnh <b>pin</b>',
            withBorder: false,
            stretched: false,
            withBackground: false,
          },
        },
      ]),
    ).toBe('![Ảnh **pin**](https://cdn.example/a.jpg)');
  });

  it('embed uses caption or service as text', () => {
    const data = {
      service: 'youtube' as const,
      id: 'dQw4w9WgXcQ',
      source: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      embed: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      width: 580,
      height: 320,
    };
    expect(blocksToMarkdown([{ type: 'embed', data: { ...data, caption: 'Video' } }])).toBe(
      '[Video](https://www.youtube.com/watch?v=dQw4w9WgXcQ)',
    );
    expect(blocksToMarkdown([{ type: 'embed', data: { ...data, caption: '' } }])).toBe(
      '[youtube](https://www.youtube.com/watch?v=dQw4w9WgXcQ)',
    );
  });

  it('delimiter', () => {
    expect(blocksToMarkdown([{ type: 'delimiter', data: {} }])).toBe('---');
  });

  it('separates blocks with one blank line', () => {
    const blocks: Block[] = [
      { id: 'h', type: 'header', data: { text: 'Pin laptop', level: 2 } },
      { id: 'p', type: 'paragraph', data: { text: 'Xem <a href="/dat-lich">đặt lịch</a>.' } },
      {
        type: 'list',
        data: { style: 'unordered', items: [{ content: 'Một', meta: {}, items: [] }] },
      },
      { type: 'delimiter', data: {} },
      { type: 'quote', data: { text: 'Hết', caption: '' } },
    ];
    expect(blocksToMarkdown(blocks)).toBe(
      ['## Pin laptop', 'Xem [đặt lịch](/dat-lich).', '- Một', '---', '> Hết'].join('\n\n'),
    );
  });

  it('empty document', () => {
    expect(blocksToMarkdown([])).toBe('');
  });
});
