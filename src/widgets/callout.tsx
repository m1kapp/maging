import { h } from '../h';

export function calloutHTML(text: string, variant?: 'surface' | 'accent' | 'highlight'): string {
  if (!text) return '';
  const v = variant || 'surface';
  return (
    <div data-widget="callout" data-variant={v} className={"mt-[1.5cqw] px-6 py-4 rounded-[var(--mw-radius)] text-[clamp(11px,1.1cqw,15px)] font-semibold text-[var(--mw-text)] leading-relaxed" +
      (v === 'surface' ? ' bg-[var(--mw-surface)] border border-[var(--mw-border)]' : '') +
      (v === 'highlight' ? ' border-l-[3px] border-l-[var(--mw-accent)] rounded-l-none' : '')}>{text}</div>
  );
}
