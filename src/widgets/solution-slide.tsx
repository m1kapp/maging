import { h } from '../h';

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
      <div data-widget="solution" className="grid grid-cols-2 gap-8 my-auto">
        <div data-role="col" data-side="before" className="p-8 rounded-[var(--mw-radius)] border border-[var(--mw-border)]">
          <div data-role="col-label" className="text-[0.8rem] uppercase tracking-[0.1em] font-bold mb-5">{before.label || 'Before'}</div>
          {before.items.map(i => <div className="text-base text-[var(--mw-text)] py-3 border-b border-[var(--mw-border)] leading-[1.4] last:border-b-0">{i}</div>)}
        </div>
        <div data-role="col" data-side="after" className="p-8 rounded-[var(--mw-radius)] border border-[var(--mw-border)]">
          <div data-role="col-label" className="text-[0.8rem] uppercase tracking-[0.1em] font-bold mb-5">{after.label || 'After'}</div>
          {after.items.map(i => <div className="text-base text-[var(--mw-text)] py-3 border-b border-[var(--mw-border)] leading-[1.4] last:border-b-0">{i}</div>)}
        </div>
      </div>
    );
  } else if (features) {
    body = (
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5 flex-1">
        {features.map(f =>
          <div className="flex items-center gap-3.5 p-5 bg-[var(--mw-surface)] border border-[var(--mw-border)] rounded-[var(--mw-radius)]">
            <span className="text-[1.6rem]">{f.icon || ''}</span>
            <span className="text-base font-semibold text-[var(--mw-text)]">{f.label}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 p-12 px-16 box-border">
      <div className="text-[2rem] font-bold text-[var(--mw-text)] leading-[1.25] mb-9 tracking-[-0.02em] max-w-[85%]">{headline}</div>
      {body}
    </div>
  );
}
