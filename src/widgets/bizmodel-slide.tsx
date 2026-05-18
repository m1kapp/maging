import { h } from '../h';

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
    <div data-widget="bizmodel" className="flex flex-col flex-1 min-h-0 p-12 px-16 box-border">
      {headline && <div className="text-[2rem] font-bold text-[var(--mw-text)] mb-7 tracking-[-0.02em]">{headline}</div>}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5 my-auto">
        {tiers.map(t =>
          <div className="p-8 bg-[var(--mw-surface)] border border-[var(--mw-border)] rounded-[var(--mw-radius)] flex flex-col"
            {...(t.popular ? { 'data-popular': true } : {})}>
            <div className="text-[1.1rem] font-bold text-[var(--mw-text)]">{t.name}</div>
            <div data-role="price" className="text-[2.5rem] font-extrabold text-[var(--mw-text)] mt-2 tracking-[-0.03em]">
              {t.price}
              {t.period && <span className="text-[0.85rem] font-normal text-[var(--mw-text-muted)]">{t.period}</span>}
            </div>
            <ul data-role="features" className="list-none p-0 mt-5 flex-1">
              {t.features.map(f =>
                <li className="text-[0.85rem] text-[var(--mw-text-muted)] py-[7px] border-b border-[var(--mw-border)] last:border-b-0">{f}</li>
              )}
            </ul>
          </div>
        )}
      </div>
      {note && <div className="mt-5 text-[0.9rem] text-[var(--mw-text-muted)] italic">{note}</div>}
    </div>
  );
}
