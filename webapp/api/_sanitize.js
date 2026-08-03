/**
 * Allow-list sanitizer for job descriptions.
 *
 * Descriptions are scraped HTML from an upstream we do not control — anyone able to
 * publish a job ad controls that markup — and the front-end renders them through
 * dangerouslySetInnerHTML. Everything not explicitly allowed here is removed.
 *
 * Built on cheerio (already a dependency) rather than DOMPurify + jsdom, which would
 * add ~10MB and noticeable cold-start latency to every serverless invocation.
 */
import * as cheerio from 'cheerio';

// Formatting-only tags. Nothing that can load, execute, or submit.
const ALLOWED_TAGS = new Set([
  'p', 'br', 'hr', 'div', 'span',
  'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup', 'small',
  'ul', 'ol', 'li', 'dl', 'dt', 'dd',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'blockquote', 'pre', 'code',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
  'a', 'img',
]);

// Dropped with their whole subtree — their text content is not worth keeping.
const DROP_WITH_CONTENT = new Set([
  'script', 'style', 'iframe', 'frame', 'frameset', 'object', 'embed', 'applet',
  'form', 'input', 'button', 'select', 'option', 'textarea', 'label',
  'svg', 'math', 'template', 'noscript', 'base', 'link', 'meta', 'title', 'head',
]);

const ALLOWED_ATTRS = {
  a: ['href', 'title'],
  img: ['src', 'alt', 'title', 'width', 'height'],
  td: ['colspan', 'rowspan'],
  th: ['colspan', 'rowspan', 'scope'],
  col: ['span'],
  colgroup: ['span'],
};

const SAFE_URL = /^(https?:|mailto:|tel:|\/|#)/i;
const SAFE_IMG_DATA_URL = /^data:image\/(png|jpe?g|gif|webp|avif);base64,[a-z0-9+/=\s]+$/i;

/**
 * Browsers ignore control characters and numeric entities inside a URL, so
 * "java&#09;script:alert(1)" and "java\tscript:alert(1)" both execute. Strip both
 * before testing the scheme.
 */
function normalizeUrl(value) {
  const withoutEntities = String(value).replace(/&#x?[0-9a-f]+;?/gi, '');
  return [...withoutEntities].filter((ch) => ch.charCodeAt(0) > 32).join('');
}

function isSafeUrl(value, { allowImageData = false } = {}) {
  if (allowImageData && SAFE_IMG_DATA_URL.test(String(value).trim())) return true;
  const v = normalizeUrl(value);
  return Boolean(v) && SAFE_URL.test(v);
}

/**
 * @param {string} html Untrusted HTML fragment.
 * @returns {string} HTML containing only allow-listed tags and attributes.
 */
export function sanitizeHtml(html) {
  if (!html || typeof html !== 'string') return '';

  const $ = cheerio.load(html, null, false);

  // Conditional comments can smuggle markup past naive filters.
  $('*').contents().filter((_i, node) => node.type === 'comment').remove();

  $('*').each((_i, el) => {
    // Not `el.type !== 'tag'`: domhandler types <script> as 'script' and <style> as
    // 'style', so that check would wave both straight through.
    const name = (el.tagName || '').toLowerCase();
    if (!name) return;
    const $el = $(el);

    if (DROP_WITH_CONTENT.has(name)) { $el.remove(); return; }

    // Unknown-but-harmless tags (font, marquee, custom elements…) lose the tag,
    // keep the text — dropping their content would silently truncate the ad.
    if (!ALLOWED_TAGS.has(name)) {
      $el.replaceWith($el.contents());
      return;
    }

    const allowed = ALLOWED_ATTRS[name] || [];
    for (const attr of Object.keys(el.attribs || {})) {
      const lower = attr.toLowerCase();
      // Covers onerror, onload, onclick and every other event handler in one rule.
      if (!allowed.includes(lower)) { $el.removeAttr(attr); continue; }
      if (lower === 'href' && !isSafeUrl($el.attr(attr))) $el.removeAttr(attr);
      if (lower === 'src' && !isSafeUrl($el.attr(attr), { allowImageData: true })) $el.removeAttr(attr);
    }

    if (name === 'a' && $el.attr('href')) {
      $el.attr('rel', 'noopener noreferrer nofollow');
      $el.attr('target', '_blank');
    }
  });

  // Anchors left without an href after sanitising are dead markup.
  $('a:not([href])').each((_i, el) => $(el).replaceWith($(el).contents()));
  $('img:not([src])').remove();

  return $.html().trim();
}
