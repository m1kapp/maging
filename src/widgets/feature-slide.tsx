import { h } from '../h';
import { calloutHTML } from './callout';

interface Feature { icon?: string; title: string; desc?: string; }
interface FeatureSlideProps {
  headline?: string;
  items?: Feature[];
  cols?: number;
  callout?: string;
}

export function FeatureSlide({ headline = '', items = [], cols = 3, callout = '' }: FeatureSlideProps) {
  return (
    <div className="flex flex-col flex-1 min-h-0 p-12 px-16 box-border">
      {headline && <div className="text-[2rem] font-bold text-[var(--mw-text)] mb-9 tracking-[-0.02em] max-w-[85%]">{headline}</div>}
      <div className="grid gap-5 my-auto" style={'grid-template-columns:repeat(' + cols + ',1fr)'}>
        {items.map(it =>
          <div className="p-6 bg-[var(--mw-surface)] border border-[var(--mw-border)] rounded-[var(--mw-radius)]">
            {it.icon && <div className="text-[1.6rem] mb-3">{it.icon}</div>}
            <div className="text-base font-bold text-[var(--mw-text)] mb-1.5">{it.title}</div>
            {it.desc && <div className="text-[0.82rem] text-[var(--mw-text-muted)] leading-relaxed">{it.desc}</div>}
          </div>
        )}
      </div>
      {calloutHTML(callout)}
    </div>
  );
}
