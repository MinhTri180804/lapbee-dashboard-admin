import type { Block, ListData, ListItem, TableData } from './blocks';
import { inlineToMarkdown as md } from './inline-html';

/** Inline markdown on one line: a `<br>` would end a header or a list item early. */
function oneLine(html: string): string {
  return md(html).replace(/\n/g, ' ');
}

function listLines(style: ListData['style'], items: ListItem[], depth: number): string[] {
  const indent = '  '.repeat(depth);
  return items.flatMap((item) => {
    const marker =
      style === 'ordered'
        ? '1. '
        : style === 'checklist'
          ? item.meta.checked === true
            ? '- [x] '
            : '- [ ] '
          : '- ';
    return [
      `${indent}${marker}${oneLine(item.content)}`,
      ...listLines(style, item.items, depth + 1),
    ];
  });
}

function tableRow(cells: string[]): string {
  return `| ${cells.join(' | ')} |`;
}

function table({ withHeadings, content }: TableData): string {
  const width = Math.max(0, ...content.map((row) => row.length));
  const pad = (row: string[]) =>
    Array.from({ length: width }, (_, i) => md(row[i] ?? '').replace(/\n/g, ' '));
  const [first = [], ...rest] = content;
  const head = withHeadings ? pad(first) : pad([]);
  const body = withHeadings ? rest : content;
  return [
    tableRow(head),
    tableRow(Array.from({ length: width }, () => '---')),
    ...body.map((row) => tableRow(pad(row))),
  ].join('\n');
}

function quoted(text: string): string {
  return text
    .split('\n')
    .map((line) => `> ${line}`)
    .join('\n');
}

function blockToMarkdown(block: Block): string {
  switch (block.type) {
    case 'paragraph':
      return md(block.data.text);
    case 'header':
      return `${'#'.repeat(block.data.level)} ${oneLine(block.data.text)}`;
    case 'list':
      return listLines(block.data.style, block.data.items, 0).join('\n');
    case 'code':
      return `\`\`\`${block.data.language}\n${block.data.code}\n\`\`\``;
    case 'table':
      return table(block.data);
    case 'callout': {
      // `title` is raw text (not inline HTML), so it is not converted.
      const message = quoted(md(block.data.message));
      const title = block.data.title.trim();
      return title === '' ? message : `> **${title}**\n${message}`;
    }
    case 'quote': {
      const caption = md(block.data.caption);
      const text = quoted(md(block.data.text));
      return caption === '' ? text : `${text}\n${quoted(`— ${caption}`)}`;
    }
    case 'image':
      return `![${md(block.data.caption)}](${block.data.file.url ?? ''})`;
    case 'embed': {
      const caption = md(block.data.caption);
      return `[${caption === '' ? block.data.service : caption}](${block.data.source})`;
    }
    case 'delimiter':
      return '---';
  }
}

/** Markdown of an Editor.js document for the SEO analyzer; blocks are separated by a blank line. */
export function blocksToMarkdown(blocks: Block[]): string {
  return blocks.map(blockToMarkdown).join('\n\n');
}
