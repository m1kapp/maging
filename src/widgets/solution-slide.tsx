import { h } from '../h';
import { accentMark } from './utils';

interface SolutionSlideProps {
  headline?: string;
  before?: { label?: string; items: string[] };
  after?: { label?: string; items: string[] };
  features?: { icon?: string; label: string }[];
}

export function SolutionSlide({ headline = '', before, after, features }: SolutionSlideProps) {
  let body = '';
  if (before && after) {
    body = (
      <div data-widget="solution" className="grid grid-cols-2 gap-[2cqw] my-auto">
        <div data-role="col" data-side="before" className="p-[2.5cqw] rounded-[var(--mw-radius)] border border-[var(--mw-border)]">
          <div data-role="col-label" className="text-[clamp(9px,0.9cqw,12px)] uppercase tracking-[0.1em] font-bold mb-5">{before.label || 'Before'}</div>
          {before.items.map(i => <div className="text-base text-[var(--mw-text)] py-3 border-b border-[var(--mw-border)] leading-[1.4] last:border-b-0">{i}</div>)}
        </div>
        <div data-role="col" data-side="after" className="p-[2.5cqw] rounded-[var(--mw-radius)] border border-[var(--mw-border)]">
          <div data-role="col-label" className="text-[clamp(9px,0.9cqw,12px)] uppercase tracking-[0.1em] font-bold mb-5">{after.label || 'After'}</div>
          {after.items.map(i => <div className="text-base text-[var(--mw-text)] py-3 border-b border-[var(--mw-border)] leading-[1.4] last:border-b-0">{i}</div>)}
        </div>
      </div>
    );
  } else if (features) {
    body = (
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-[1.5cqw] flex-1">
        {features.map(f =>
          <div className="flex items-center gap-3.5 p-5 bg-[var(--mw-surface)] border border-[var(--mw-border)] rounded-[var(--mw-radius)]">
            <span className="text-[clamp(13px,1.4cqw,18px)]">{f.icon || ''}</span>
            <span className="text-base font-semibold text-[var(--mw-text)]">{f.label}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 p-[4cqw] px-[5cqw] box-border">
      <div className="text-[clamp(24px,3cqw,40px)] font-bold text-[var(--mw-text)] leading-[1.25] mb-[2.5cqw] tracking-[-0.02em]" dangerouslySetInnerHTML={{ __html: accentMark(headline) }}></div>
      {body}
    </div>
  );
}
