import { h } from '../h';
import { accentMark } from './utils';

interface Tier {
  name: string;
  price: string;
  period?: string;
  features: string[];
  popular?: boolean;
}
interface BizModelSlideProps {
  headline?: string;
  tiers?: Tier[];
  note?: string;
}

export function BizModelSlide({ headline = '', tiers = [], note = '' }: BizModelSlideProps) {
  return (
    <div data-widget="bizmodel" className="flex flex-col flex-1 min-h-0 p-[4cqw] px-[5cqw] box-border">
      {headline && <div className="text-[clamp(24px,3cqw,40px)] font-bold text-[var(--mw-text)] mb-[2cqw] tracking-[-0.02em]" dangerouslySetInnerHTML={{ __html: accentMark(headline) }}></div>}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-[1.5cqw] my-auto items-stretch">
        {tiers.map(t =>
          <div className="p-[2.5cqw] bg-[var(--mw-surface)] border border-[var(--mw-border)] rounded-[var(--mw-radius)] flex flex-col"
            {...(t.popular ? { 'data-popular': true } : {})}>
            <div className="text-[clamp(13px,1.4cqw,18px)] font-bold text-[var(--mw-text)]">{t.name}</div>
            <div data-role="price" className="text-[clamp(24px,3cqw,40px)] font-extrabold text-[var(--mw-text)] mt-2 tracking-[-0.03em]">
              {t.price}
              {t.period && <span className="text-[clamp(11px,1.1cqw,15px)] font-normal text-[var(--mw-text-muted)]">{t.period}</span>}
            </div>
            <ul data-role="features" className="list-none p-0 mt-[1.5cqw] flex-1">
              {t.features.map(f =>
                <li className="text-[clamp(11px,1.1cqw,15px)] text-[var(--mw-text-muted)] py-[7px] border-b border-[var(--mw-border)] last:border-b-0">{f}</li>
              )}
            </ul>
          </div>
        )}
      </div>
      {note && <div className="mt-[1.5cqw] text-[clamp(11px,1.1cqw,15px)] text-[var(--mw-text-muted)] italic">{note}</div>}
    </div>
  );
}
