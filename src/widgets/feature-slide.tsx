import { h } from '../h';
import { calloutHTML } from './callout';
import { accentMark } from './utils';

interface Feature { icon?: string; title: string; desc?: string; }
interface FeatureSlideProps {
  headline?: string;
  items?: Feature[];
  cols?: number;
  callout?: string;
}

export function FeatureSlide({ headline = '', items = [], cols = 3, callout = '' }: FeatureSlideProps) {
  return (
    <div className="flex flex-col flex-1 min-h-0 p-[4cqw] px-[5cqw] box-border">
      {headline && <div className="text-[clamp(24px,3cqw,40px)] font-bold text-[var(--mw-text)] mb-[2.5cqw] tracking-[-0.02em]" dangerouslySetInnerHTML={{ __html: accentMark(headline) }}></div>}
      <div className="grid gap-[1.5cqw] my-auto" style={'grid-template-columns:repeat(' + cols + ',1fr)'}>
        {items.map(it =>
          <div className="p-[1.8cqw] bg-[var(--mw-surface)] border border-[var(--mw-border)] rounded-[var(--mw-radius)]">
            {it.icon && <div className="text-[clamp(13px,1.4cqw,18px)] mb-3">{it.icon}</div>}
            <div className="text-base font-bold text-[var(--mw-text)] mb-1.5">{it.title}</div>
            {it.desc && <div className="text-[clamp(11px,1.1cqw,15px)] text-[var(--mw-text-muted)] leading-relaxed">{it.desc}</div>}
          </div>
        )}
      </div>
      {calloutHTML(callout)}
    </div>
  );
}
