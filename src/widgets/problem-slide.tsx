import { h } from '../h';

interface Point { icon?: string; title: string; desc: string; }
interface ProblemSlideProps { headline?: string; points?: Point[]; highlight?: string; }

export function ProblemSlide({ headline = '', points = [], highlight = '' }: ProblemSlideProps) {
  return (
    <div data-widget="problem" className="flex flex-col justify-center flex-1 min-h-0 p-[4cqw] px-[5cqw] box-border gap-[2.5cqw]">
      <div className="text-[clamp(24px,3cqw,40px)] font-bold text-[var(--mw-text)] leading-[1.25] tracking-[-0.02em]">{headline}</div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(18cqw,1fr))] gap-[1.5cqw]">
        {points.map(p =>
          <div className="p-[2cqw] bg-[var(--mw-surface)] border border-[var(--mw-border)] rounded-[var(--mw-radius)]">
            <div className="text-[clamp(16px,2cqw,26px)] mb-[1cqw]">{p.icon || ''}</div>
            <div className="text-[clamp(13px,1.4cqw,18px)] font-bold text-[var(--mw-text)] mb-[0.5cqw] tracking-[-0.01em]">{p.title}</div>
            <div className="text-[clamp(11px,1.1cqw,15px)] text-[var(--mw-text-muted)] leading-relaxed">{p.desc}</div>
          </div>
        )}
      </div>
      {highlight && (
        <div data-role="highlight" className="py-[1.2cqw] px-[2cqw] border-l-[3px] border-l-[var(--mw-accent)] rounded-r-[var(--mw-radius)] text-[clamp(13px,1.4cqw,18px)] font-bold text-[var(--mw-text)] tracking-[-0.01em]">{highlight}</div>
      )}
    </div>
  );
}
