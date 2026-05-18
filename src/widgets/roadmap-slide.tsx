import { h } from '../h';
import { calloutHTML } from './callout';

interface BarItem { title: string; start: number; end: number; style?: 'accent' | 'muted' | 'surface'; }
interface Track { label: string; items?: BarItem[]; }
interface RoadmapSlideProps {
  headline?: string;
  periods?: string[];
  tracks?: Track[];
  callout?: string;
}

export function RoadmapSlide({ headline = '', periods = [], tracks = [], callout = '' }: RoadmapSlideProps) {
  const n = periods.length || 4;
  return (
    <div className="flex flex-col flex-1 min-h-0 p-[4cqw] px-[5cqw] box-border">
      {headline && <div className="text-[clamp(24px,3cqw,40px)] font-bold text-[var(--mw-text)] mb-[2cqw] tracking-[-0.02em]">{headline}</div>}
      <div data-widget="roadmap" className="grid ml-[100px] mb-0" style={'grid-template-columns:repeat(' + n + ',1fr)'}>
        {periods.map(p =>
          <div data-role="period" className="text-center text-[clamp(9px,0.9cqw,12px)] font-semibold text-[var(--mw-text-muted)] uppercase tracking-[0.06em] py-2">{p}</div>
        )}
      </div>
      {tracks.map(t =>
        <div className="flex items-center border-b border-[var(--mw-border)] min-h-[48px]">
          <div className="w-[100px] shrink-0 text-[clamp(9px,0.9cqw,12px)] font-semibold text-[var(--mw-text)] pr-4">{t.label}</div>
          <div className="grid flex-1 relative min-h-[48px] items-center" style={'grid-template-columns:repeat(' + n + ',1fr)'}>
            {(t.items || []).map(it => {
              const col = 'grid-column:' + (it.start + 1) + '/' + (it.end + 2);
              const s = it.style || 'accent';
              return <div data-bar={s} className="rounded py-1.5 px-3 text-[clamp(9px,0.9cqw,12px)] font-semibold text-white whitespace-nowrap overflow-hidden text-ellipsis" style={col}>{it.title}</div>;
            })}
          </div>
        </div>
      )}
      {calloutHTML(callout)}
    </div>
  );
}
