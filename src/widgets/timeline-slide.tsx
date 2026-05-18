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
    <div data-widget="timeline" className="flex flex-col flex-1 min-h-0 p-12 px-16 box-border">
      {headline && <div className="text-[2rem] font-bold text-[var(--mw-text)] mb-9 tracking-[-0.02em]">{headline}</div>}
      <div data-role="track" className="flex items-start relative pt-8 my-auto">
        {milestones.map(m =>
          <div className="flex-1 flex flex-col items-center relative text-center px-2"
            {...(m.done ? { 'data-state': 'done' } : m.active ? { 'data-state': 'active' } : {})}>
            <div data-role="dot" className="w-[18px] h-[18px] rounded-full border-[3px] border-[var(--mw-border)] bg-[var(--mw-bg)] z-[1] mb-[18px]"></div>
            <div className="text-[0.75rem] text-[var(--mw-text-muted)] font-semibold mb-2 uppercase tracking-[0.04em]">{m.date}</div>
            <div className="text-base font-bold text-[var(--mw-text)]">{m.title}</div>
            {m.desc && <div className="text-[0.8rem] text-[var(--mw-text-muted)] mt-1.5">{m.desc}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
