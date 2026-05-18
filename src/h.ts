/**
 * JSX factory that produces HTML strings (not virtual DOM).
 * Configure esbuild with --jsx-factory=h --jsx-fragment=Fragment
 *
 * Usage in .tsx files:
 *   <div className="flex">Hello</div>
 *   → h('div', { className: 'flex' }, 'Hello')
 *   → '<div class="flex">Hello</div>'
 */

const VOID_TAGS: Record<string, 1> = {
  area:1, base:1, br:1, col:1, embed:1, hr:1, img:1, input:1,
  link:1, meta:1, param:1, source:1, track:1, wbr:1,
};

export function h(
  tag: string | Function,
  props: Record<string, any> | null,
  ...children: any[]
): string {
  // Component function — call it and return its result
  if (typeof tag === 'function') {
    return tag({ ...props, children: children.flat() });
  }

  let html = '<' + tag;

  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (v == null || v === false || k === 'children') continue;
      if (k === 'className') {
        html += ' class="' + v + '"';
      } else if (k === 'dangerouslySetInnerHTML') {
        // handled below
      } else if (k === 'style' && typeof v === 'object') {
        const css = Object.entries(v)
          .map(([p, val]) => p.replace(/[A-Z]/g, m => '-' + m.toLowerCase()) + ':' + val)
          .join(';');
        html += ' style="' + css + '"';
      } else if (v === true) {
        html += ' ' + k;
      } else {
        html += ' ' + k + '="' + v + '"';
      }
    }
  }

  if (VOID_TAGS[tag]) return html + '/>';

  html += '>';

  // dangerouslySetInnerHTML
  if (props?.dangerouslySetInnerHTML?.__html) {
    html += props.dangerouslySetInnerHTML.__html;
  } else {
    const flat = children.flat(Infinity);
    for (const c of flat) {
      if (c == null || c === false || c === true) continue;
      html += String(c);
    }
  }

  return html + '</' + tag + '>';
}

export function Fragment(_props: { children?: any[] }): string {
  return (_props.children || []).flat(Infinity).filter(Boolean).join('');
}
