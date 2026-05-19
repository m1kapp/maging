import { h } from '../h';
import { calloutHTML } from './callout';
import { accentMark } from './utils';

interface Chapter { tag?: string; title: string; desc: string; }
interface StorySlideProps {
  headline?: string;
  chapters?: Chapter[];
  footer?: string;
  flow?: string[];
  callout?: string;
}

export function StorySlide({ headline = '', chapters = [], footer = '', flow = [], callout = '' }: StorySlideProps) {
  return (
    <div data-widget="story" className="flex flex-col flex-1 min-h-0 p-[4cqw] px-[5cqw] box-border">
      {headline && <div className="text-[clamp(24px,3cqw,40px)] font-bold text-[var(--mw-text)] mb-[2cqw] tracking-[-0.02em]" dangerouslySetInnerHTML={{ __html: accentMark(headline) }}></div>}
      <div className="rounded-[var(--mw-radius)] overflow-hidden border border-[var(--mw-border)] my-auto">
        <div className="grid grid-cols-3">
          {chapters.map(c =>
            <div data-role="cell" className="p-[1.8cqw] border-r border-[var(--mw-border)] last:border-r-0">
              <div data-role="tag" className="text-[clamp(8px,0.75cqw,10px)] uppercase tracking-[0.12em] font-semibold mb-2.5">{c.tag || ''}</div>
              <div className="text-base font-bold text-[var(--mw-text)] mb-2">{c.title}</div>
              <div className="text-[clamp(11px,1.1cqw,15px)] text-[var(--mw-text-muted)] leading-relaxed">{c.desc}</div>
            </div>
          )}
        </div>
        {footer && <div className="py-4 px-6 bg-[var(--mw-surface)] border-t border-[var(--mw-border)] text-[clamp(11px,1.1cqw,15px)] text-[var(--mw-text-muted)]">{footer}</div>}
      </div>
      {flow.length > 0 && (
        <div className="flex items-center mt-4">
          {flow.map((f, i) => {
            const arrow = i < flow.length - 1
              ? <div className="px-2 text-base text-[var(--mw-accent)] opacity-40">→</div>
              : '';
            return [
              <div data-role="flow-step" className="flex-1 py-2.5 px-3.5 rounded-[calc(var(--mw-radius)*0.7)] text-center text-[clamp(11px,1.1cqw,15px)] font-semibold bg-[var(--mw-surface)] border border-[var(--mw-border)] text-[var(--mw-text)]">{f}</div>,
              arrow
            ];
          })}
        </div>
      )}
      {calloutHTML(callout)}
    </div>
  );
}
