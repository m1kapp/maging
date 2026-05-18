import { h } from '../h';

interface Milestone {
  date: string;
  title: string;
  desc?: string;
  done?: boolean;
  active?: boolean;
}
interface TimelineSlideProps {
  headline?: string;
  milestones?: Milestone[];
}

export function TimelineSlide({ headline = '', milestones = [] }: TimelineSlideProps) {
  return (
    <div data-widget="timeline" className="flex flex-col justify-center items-center flex-1 min-h-0 p-[6cqw] box-border gap-[3cqw]">
      {headline && <div className="text-[clamp(24px,3cqw,40px)] font-bold text-[var(--mw-text)] tracking-[-0.02em] self-start">{headline}</div>}
      <div className="w-full">
        {/* Dot row */}
        <div className="flex items-center relative">
          <div className="absolute left-0 right-0 h-[3px] bg-[var(--mw-border)] rounded-full"></div>
          {milestones.map(m =>
            <div className="flex-1 flex justify-center relative z-[1]"
              {...(m.done ? { 'data-state': 'done' } : m.active ? { 'data-state': 'active' } : {})}>
              <div data-role="dot" className="w-[clamp(16px,1.8cqw,24px)] h-[clamp(16px,1.8cqw,24px)] rounded-full border-[3px] border-[var(--mw-border)] bg-[var(--mw-bg)]"></div>
            </div>
          )}
        </div>
        {/* Labels */}
        <div className="flex mt-[1.5cqw]">
          {milestones.map(m =>
            <div className="flex-1 text-center">
              <div className="text-[clamp(11px,1.1cqw,15px)] text-[var(--mw-text-muted)] font-semibold uppercase tracking-[0.04em]">{m.date}</div>
              <div className="text-[clamp(13px,1.4cqw,18px)] font-bold text-[var(--mw-text)] mt-[0.5cqw]">{m.title}</div>
              {m.desc && <div className="text-[clamp(11px,1.1cqw,15px)] text-[var(--mw-text-muted)] mt-[0.3cqw]">{m.desc}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
