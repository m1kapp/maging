import { h } from '../h';

interface Point { icon?: string; title: string; desc: string; }
interface ProblemSlideProps { headline?: string; points?: Point[]; highlight?: string; }

export function ProblemSlide({ headline = '', points = [], highlight = '' }: ProblemSlideProps) {
  return (
    <div data-widget="problem" className="flex flex-col flex-1 min-h-0 p-12 px-16 box-border">
      <div className="text-[2rem] font-bold text-[var(--mw-text)] leading-[1.25] mb-9 tracking-[-0.02em] max-w-[85%]">{headline}</div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5 my-auto">
        {points.map(p =>
          <div className="p-7 bg-[var(--mw-surface)] border border-[var(--mw-border)] rounded-[var(--mw-radius)]">
            <div className="text-[1.8rem] mb-3.5">{p.icon || ''}</div>
            <div className="text-[1.05rem] font-bold text-[var(--mw-text)] mb-2 tracking-[-0.01em]">{p.title}</div>
            <div className="text-[0.85rem] text-[var(--mw-text-muted)] leading-relaxed">{p.desc}</div>
          </div>
        )}
      </div>
      {highlight && (
        <div data-role="highlight" className="mt-6 py-[18px] px-6 border-l-[3px] border-l-[var(--mw-accent)] rounded-r-[var(--mw-radius)] text-[1.05rem] font-bold text-[var(--mw-text)] tracking-[-0.01em]">{highlight}</div>
      )}
    </div>
  );
}
