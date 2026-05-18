import { h } from '../h';

interface Fund { pct: number; label: string; }
interface Contact { email?: string; website?: string; }
interface AskSlideProps {
  headline?: string;
  useOfFunds?: Fund[];
  milestones?: string[];
  contact?: Contact;
}

export function AskSlide({ headline = '', useOfFunds = [], milestones = [], contact }: AskSlideProps) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 min-h-0 text-center p-[5cqw] px-[5cqw] box-border">
      <div className="text-[clamp(24px,3cqw,40px)] font-extrabold text-[var(--mw-text)] tracking-[-0.03em] mb-10">{headline}</div>
      {useOfFunds.length > 0 && (
        <div className="flex gap-[1.8cqw] mb-9">
          {useOfFunds.map(f =>
            <div className="text-center py-6 px-9 bg-[var(--mw-surface)] border border-[var(--mw-border)] rounded-[var(--mw-radius)] min-w-[140px]">
              <div className="text-[clamp(24px,3cqw,40px)] font-extrabold text-[var(--mw-accent)] tracking-[-0.02em]">{f.pct}%</div>
              <div className="text-[clamp(9px,0.9cqw,12px)] text-[var(--mw-text-muted)] mt-1.5 font-semibold">{f.label}</div>
            </div>
          )}
        </div>
      )}
      {milestones.length > 0 && (
        <ul className="list-none p-0 m-0 text-left">
          {milestones.map(m =>
            <li className="text-base text-[var(--mw-text)] py-2 before:content-['→_'] before:text-[var(--mw-accent)] before:font-bold">{m}</li>
          )}
        </ul>
      )}
      {contact && (
        <div className="mt-[2.5cqw] pt-6 border-t border-[var(--mw-border)] text-[clamp(11px,1.1cqw,15px)] text-[var(--mw-text-muted)] tracking-[0.02em]">
          {contact.email || ''} · {contact.website || ''}
        </div>
      )}
    </div>
  );
}
