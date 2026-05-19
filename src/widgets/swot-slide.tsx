import { h } from '../h';
import { calloutHTML } from './callout';
import { accentMark } from './utils';

interface Quadrant { label: string; items?: string[]; }
interface SwotSlideProps {
  headline?: string;
  quadrants?: Quadrant[];
  callout?: string;
}

export function SwotSlide({ headline = '', quadrants = [], callout = '' }: SwotSlideProps) {
  return (
    <div data-widget="swot" className="flex flex-col flex-1 min-h-0 p-[4cqw] px-[5cqw] box-border">
      {headline && <div className="text-[clamp(24px,3cqw,40px)] font-bold text-[var(--mw-text)] mb-[2cqw] tracking-[-0.02em]" dangerouslySetInnerHTML={{ __html: accentMark(headline) }}></div>}
      <div className="grid grid-cols-2 rounded-[var(--mw-radius)] overflow-hidden border border-[var(--mw-border)] my-auto flex-1">
        {quadrants.map(q =>
          <div data-role="quad" className="p-[1.8cqw] flex flex-col border-r border-b border-[var(--mw-border)]">
            <div data-role="quad-label" className="text-[clamp(8px,0.75cqw,10px)] uppercase tracking-[0.1em] font-bold mb-3">{q.label}</div>
            {(q.items || []).map(it =>
              <div className="text-[clamp(11px,1.1cqw,15px)] text-[var(--mw-text)] py-1.5 leading-[1.4]">• {it}</div>
            )}
          </div>
        )}
      </div>
      {calloutHTML(callout)}
    </div>
  );
}
