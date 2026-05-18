import { h } from '../h';
import { accentMark } from './utils';

interface Member { name: string; role: string; exp?: string; }
interface Advisor { name: string; role: string; }
interface TeamSlideProps {
  headline?: string;
  members?: Member[];
  advisors?: Advisor[];
}

export function TeamSlide({ headline = '팀', members = [], advisors = [] }: TeamSlideProps) {
  return (
    <div data-widget="team" className="flex flex-col flex-1 min-h-0 p-[4cqw] px-[5cqw] box-border">
      <div className="text-[clamp(24px,3cqw,40px)] font-bold text-[var(--mw-text)] mb-[2.5cqw] tracking-[-0.02em]" dangerouslySetInnerHTML={{ __html: accentMark(headline) }}></div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-[1.8cqw] my-auto">
        {members.map(m =>
          <div className="p-[2.5cqw] bg-[var(--mw-surface)] border border-[var(--mw-border)] rounded-[var(--mw-radius)]">
            <div data-role="avatar" className="w-14 h-14 rounded-full flex items-center justify-center text-[clamp(13px,1.4cqw,18px)] font-extrabold mb-[18px]">{m.name.charAt(0)}</div>
            <div className="text-[clamp(13px,1.4cqw,18px)] font-bold text-[var(--mw-text)] tracking-[-0.01em]">{m.name}</div>
            <div className="text-[clamp(11px,1.1cqw,15px)] text-[var(--mw-accent)] font-semibold mt-1">{m.role}</div>
            {m.exp && <div className="text-[clamp(11px,1.1cqw,15px)] text-[var(--mw-text-muted)] mt-3 leading-relaxed">{m.exp}</div>}
          </div>
        )}
      </div>
      {advisors.length > 0 && (
        <div className="mt-[2cqw] pt-6 border-t border-[var(--mw-border)]">
          <div className="text-[clamp(9px,0.9cqw,12px)] uppercase tracking-[0.08em] text-[var(--mw-text-muted)] font-bold mb-3.5">Advisors</div>
          {advisors.map(a =>
            <div className="flex items-center gap-3 py-2.5">
              <span className="text-[clamp(11px,1.1cqw,15px)] font-semibold text-[var(--mw-text)]">{a.name}</span>
              <span className="text-[clamp(9px,0.9cqw,12px)] text-[var(--mw-text-muted)]">{a.role}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
