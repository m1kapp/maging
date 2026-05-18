import { h } from '../h';

export function calloutHTML(text: string, variant?: 'surface' | 'accent' | 'highlight'): string {
  if (!text) return '';
  const v = variant || 'surface';
  return (
    <div data-widget="callout" data-variant={v} className={"mt-5 px-6 py-4 rounded-[var(--mw-radius)] text-[0.9rem] font-semibold text-[var(--mw-text)] leading-relaxed" +
      (v === 'surface' ? ' bg-[var(--mw-surface)] border border-[var(--mw-border)]' : '') +
      (v === 'highlight' ? ' border-l-[3px] border-l-[var(--mw-accent)] rounded-l-none' : '')}>{text}</div>
  );
}
