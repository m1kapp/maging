import { h } from '../h';
import { calloutHTML } from './callout';

interface Quadrant { label: string; items?: string[]; }
interface SwotSlideProps {
  headline?: string;
  quadrants?: Quadrant[];
  callout?: string;
}

export function SwotSlide({ headline = '', quadrants = [], callout = '' }: SwotSlideProps) {
  return (
    <div data-widget="swot" className="flex flex-col flex-1 min-h-0 p-12 px-16 box-border">
      {headline && <div className="text-[2rem] font-bold text-[var(--mw-text)] mb-7 tracking-[-0.02em]">{headline}</div>}
      <div className="grid grid-cols-2 rounded-[var(--mw-radius)] overflow-hidden border border-[var(--mw-border)] my-auto flex-1">
        {quadrants.map(q =>
          <div data-role="quad" className="p-6 flex flex-col border-r border-b border-[var(--mw-border)]">
            <div data-role="quad-label" className="text-[0.7rem] uppercase tracking-[0.1em] font-bold mb-3">{q.label}</div>
            {(q.items || []).map(it =>
              <div className="text-[0.82rem] text-[var(--mw-text)] py-1.5 leading-[1.4]">• {it}</div>
            )}
          </div>
        )}
      </div>
      {calloutHTML(callout)}
    </div>
  );
}
