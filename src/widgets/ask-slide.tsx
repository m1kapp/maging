import { h } from '../h';
import { accentMark } from './utils';

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
    <div className="flex flex-col items-center justify-center flex-1 min-h-0 text-center p-[3cqw] px-[4cqw] box-border gap-[1.5cqw]">
      <div className="text-[clamp(24px,3.5cqw,48px)] font-extrabold text-[var(--mw-text)] tracking-[-0.03em]" dangerouslySetInnerHTML={{ __html: accentMark(headline) }}></div>
      {useOfFunds.length > 0 && (
        <div className="flex gap-[2cqw] w-full max-w-[80%]">
          {useOfFunds.map(f =>
            <div className="text-center py-[2.5cqw] px-[2cqw] bg-[var(--mw-surface)] border border-[var(--mw-border)] rounded-[var(--mw-radius)] flex-1">
              <div className="text-[clamp(32px,4.5cqw,56px)] font-extrabold text-[var(--mw-accent)] tracking-[-0.02em]">{f.pct}%</div>
              <div className="text-[clamp(11px,1.2cqw,16px)] text-[var(--mw-text-muted)] mt-2 font-semibold">{f.label}</div>
            </div>
          )}
        </div>
      )}
      {milestones.length > 0 && (
        <ul className="list-none p-0 m-0 text-left">
          {milestones.map(m =>
            <li className="text-[clamp(13px,1.3cqw,17px)] text-[var(--mw-text)] py-1.5 before:content-['→_'] before:text-[var(--mw-accent)] before:font-bold">{m}</li>
          )}
        </ul>
      )}
      {contact && (
        <div className="pt-4 border-t border-[var(--mw-border)] text-[clamp(10px,1cqw,14px)] text-[var(--mw-text-muted)] tracking-[0.02em]">
          {contact.email || ''} · {contact.website || ''}
        </div>
      )}
    </div>
  );
}
