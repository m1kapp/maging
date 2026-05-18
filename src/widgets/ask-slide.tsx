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
    <div className="flex flex-col items-center justify-center flex-1 min-h-0 text-center p-20 px-16 box-border">
      <div className="text-[3rem] font-extrabold text-[var(--mw-text)] tracking-[-0.03em] mb-10">{headline}</div>
      {useOfFunds.length > 0 && (
        <div className="flex gap-6 mb-9">
          {useOfFunds.map(f =>
            <div className="text-center py-6 px-9 bg-[var(--mw-surface)] border border-[var(--mw-border)] rounded-[var(--mw-radius)] min-w-[140px]">
              <div className="text-[2.5rem] font-extrabold text-[var(--mw-accent)] tracking-[-0.02em]">{f.pct}%</div>
              <div className="text-[0.8rem] text-[var(--mw-text-muted)] mt-1.5 font-semibold">{f.label}</div>
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
        <div className="mt-9 pt-6 border-t border-[var(--mw-border)] text-[0.85rem] text-[var(--mw-text-muted)] tracking-[0.02em]">
          {contact.email || ''} · {contact.website || ''}
        </div>
      )}
    </div>
  );
}
