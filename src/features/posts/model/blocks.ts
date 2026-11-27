/**
 * Editor.js block data, hand-typed: the only DTO shapes allowed outside the generated API types
 * (spec §4.5), because openapi.json types `content` as an opaque object.
 *
 * Sources: lapbee-backend/README.md "Editor.js cho dashboard" and
 * lapbee-backend/src/modules/content/domain/blocks/block-handlers.ts (each block's `schema` for
 * what the backend accepts, `toEditor` for what `GET /posts/:id` returns).
 */

/** Copied from block-handlers.ts `CODE_LANGUAGES`. */
export const CODE_LANGUAGES = [
  'plaintext',
  'bash',
  'shell',
  'javascript',
  'typescript',
  'jsx',
  'tsx',
  'json',
  'yaml',
  'toml',
  'html',
  'css',
  'scss',
  'python',
  'go',
  'rust',
  'java',
  'kotlin',
  'csharp',
  'cpp',
  'c',
  'php',
  'ruby',
  'swift',
  'sql',
  'dockerfile',
  'nginx',
  'ini',
  'markdown',
  'diff',
] as const;
export type CodeLanguage = (typeof CODE_LANGUAGES)[number];

/** Copied from block-handlers.ts `CALLOUT_VARIANTS`. */
export const CALLOUT_VARIANTS = ['info', 'tip', 'warning', 'danger'] as const;
export type CalloutVariant = (typeof CALLOUT_VARIANTS)[number];

/** Copied from embed-services.ts `EMBED_SERVICES`. */
export const EMBED_SERVICES = ['youtube', 'vimeo', 'codepen', 'codesandbox'] as const;
export type EmbedService = (typeof EMBED_SERVICES)[number];

/** block-handlers.ts `ListItem` (@editorjs/list v2); `meta.checked` only for checklists. */
export type ListItem = { content: string; meta: { checked?: boolean }; items: ListItem[] };

/** block-handlers.ts `COUNTER_TYPES`. */
export type ListCounterType =
  'numeric' | 'lower-roman' | 'upper-roman' | 'lower-alpha' | 'upper-alpha';

/** block-handlers.ts `paragraph`: `text` is inline HTML. */
export type ParagraphData = { text: string };

/** block-handlers.ts `header`: `text` is inline HTML, `level` 2 to 4. */
export type HeaderData = { text: string; level: 2 | 3 | 4 };

/** block-handlers.ts `listSchema`: `meta` only for ordered lists; at most 3 levels. */
export type ListData = {
  style: 'ordered' | 'unordered' | 'checklist';
  meta?: { start?: number; counterType?: ListCounterType };
  items: ListItem[];
};

/** block-handlers.ts `code`: raw text, never HTML. */
export type CodeData = { code: string; language: CodeLanguage };

/** block-handlers.ts `tableSchema`: every cell is inline HTML. */
export type TableData = { withHeadings: boolean; content: string[][] };

/** block-handlers.ts `callout`: `title` is raw text, `message` inline HTML. */
export type CalloutData = { variant: CalloutVariant; title: string; message: string };

/** block-handlers.ts `quote`: both fields inline HTML (`alignment` is dropped on save). */
export type QuoteData = { text: string; caption: string };

/**
 * block-handlers.ts `image.toEditor` (backend `ImageView`): the backend stores only `file.mediaId`
 * and rebuilds `url`, `width`, `height` from the library; `url` is null (and there are no
 * dimensions) when the image is no longer there.
 */
export type ImageData = {
  file:
    | { mediaId: string; url: string; width: number; height: number }
    | { mediaId: string; url: null };
  caption: string;
  withBorder: boolean;
  stretched: boolean;
  withBackground: boolean;
};

/**
 * block-handlers.ts `embed.toEditor` + embed-services.ts `embedView`: the backend stores
 * `service` and `id`, and rebuilds `source`, `embed`, `width`, `height` when read. A block the
 * Editor.js embed tool just created has no `id` yet; only `service`, `source`, `caption` are sent.
 */
export type EmbedData = {
  service: EmbedService;
  source: string;
  caption: string;
  id?: string;
  embed?: string;
  width?: number;
  height?: number;
};

/** block-handlers.ts `delimiter`: no data. */
export type DelimiterData = Record<string, never>;

/** block-handlers.ts `BLOCK_TYPES` with their data. */
export type Block = { id?: string } & (
  | { type: 'paragraph'; data: ParagraphData }
  | { type: 'header'; data: HeaderData }
  | { type: 'list'; data: ListData }
  | { type: 'code'; data: CodeData }
  | { type: 'table'; data: TableData }
  | { type: 'callout'; data: CalloutData }
  | { type: 'quote'; data: QuoteData }
  | { type: 'image'; data: ImageData }
  | { type: 'embed'; data: EmbedData }
  | { type: 'delimiter'; data: DelimiterData }
);

export type BlockType = Block['type'];

/** README "Editor.js cho dashboard": `content` is `{ time, version, blocks }`. */
export type EditorDoc = { time?: number; version?: string; blocks: Block[] };
