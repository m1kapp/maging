import { h } from '../h';

interface Member { name: string; role: string; exp?: string; }
interface Advisor { name: string; role: string; }
interface TeamSlideProps {
  headline?: string;
  members?: Member[];
  advisors?: Advisor[];
}

export function TeamSlide({ headline = '팀', members = [], advisors = [] }: TeamSlideProps) {
  return (
    <div data-widget="team" className="flex flex-col flex-1 min-h-0 p-12 px-16 box-border">
      <div className="text-[2rem] font-bold text-[var(--mw-text)] mb-9 tracking-[-0.02em]">{headline}</div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6 my-auto">
        {members.map(m =>
          <div className="p-8 bg-[var(--mw-surface)] border border-[var(--mw-border)] rounded-[var(--mw-radius)]">
            <div data-role="avatar" className="w-14 h-14 rounded-full flex items-center justify-center text-[1.4rem] font-extrabold mb-[18px]">{m.name.charAt(0)}</div>
            <div className="text-[1.2rem] font-bold text-[var(--mw-text)] tracking-[-0.01em]">{m.name}</div>
            <div className="text-[0.85rem] text-[var(--mw-accent)] font-semibold mt-1">{m.role}</div>
            {m.exp && <div className="text-[0.82rem] text-[var(--mw-text-muted)] mt-3 leading-relaxed">{m.exp}</div>}
          </div>
        )}
      </div>
      {advisors.length > 0 && (
        <div className="mt-7 pt-6 border-t border-[var(--mw-border)]">
          <div className="text-[0.75rem] uppercase tracking-[0.08em] text-[var(--mw-text-muted)] font-bold mb-3.5">Advisors</div>
          {advisors.map(a =>
            <div className="flex items-center gap-3 py-2.5">
              <span className="text-[0.95rem] font-semibold text-[var(--mw-text)]">{a.name}</span>
              <span className="text-[0.8rem] text-[var(--mw-text-muted)]">{a.role}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
