/**
 * Inline HTML of Editor.js blocks to markdown, for the SEO analyzer. Mirrors the allowed tags and
 * safe href rules of lapbee-backend/src/modules/content/domain/blocks/inline-html.ts. The HTML is
 * parsed into a detached document (never the live one) and only text comes out, never HTML.
 */

/** `/path` (not `//host`, not `/\host`), `#anchor`, `https:`, `mailto:`, `tel:`. */
const SAFE_HREF = /^(?:\/(?![/\\])|#|https:|mailto:|tel:)/i;

/** Elements whose contents are dropped, not only their tags (backend `nonTextTags`). */
const DROPPED = new Set([
  'script',
  'style',
  'textarea',
  'option',
  'noscript',
  'template',
  'iframe',
]);

/** Characters a browser ignores inside a URL scheme: controls, whitespace, zero width, line separators. */
function isIgnorableInUrl(ch: string): boolean {
  const c = ch.charCodeAt(0);
  return (
    c <= 0x20 ||
    (c >= 0x7f && c <= 0x9f) ||
    (c >= 0x200b && c <= 0x200d) ||
    c === 0x2028 ||
    c === 0x2029 ||
    c === 0xfeff
  );
}

function safeHref(raw: string): string | null {
  const probe = Array.from(raw)
    .filter((ch) => !isIgnorableInUrl(ch))
    .join('');
  return SAFE_HREF.test(probe) ? raw.trim() : null;
}

function wrap(mark: string, inner: string): string {
  return inner === '' ? '' : `${mark}${inner}${mark}`;
}

function walk(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return (node.textContent ?? '').replace(/ /g, ' ');
  if (node.nodeType !== Node.ELEMENT_NODE) return '';
  const el = node as Element;
  const tag = el.tagName.toLowerCase();
  if (DROPPED.has(tag)) return '';
  if (tag === 'br') return '\n';
  const inner = Array.from(el.childNodes, walk).join('');
  switch (tag) {
    case 'b':
    case 'strong':
      return wrap('**', inner);
    case 'i':
    case 'em':
      return wrap('*', inner);
    case 's':
      return wrap('~~', inner);
    case 'code':
      return wrap('`', inner);
    case 'a': {
      const raw = el.getAttribute('href');
      const href = raw === null ? null : safeHref(raw);
      return href === null || inner === '' ? inner : `[${inner}](${href})`;
    }
    default:
      // u, mark and any other tag keep their text.
      return inner;
  }
}

export function inlineToMarkdown(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return Array.from(doc.body.childNodes, walk).join('');
}
