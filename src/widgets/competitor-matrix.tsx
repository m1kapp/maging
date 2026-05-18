import { h } from '../h';

interface Player { name: string; x: number; y: number; highlight?: boolean; }
interface Axis { low?: string; high?: string; }
interface CompetitorMatrixProps {
  headline?: string;
  axisX?: Axis;
  axisY?: Axis;
  players?: Player[];
}

export function CompetitorMatrix({ headline = '', axisX = {}, axisY = {}, players = [] }: CompetitorMatrixProps) {
  return (
    <div data-widget="competitor" className="flex flex-col flex-1 min-h-0 p-12 px-16 box-border">
      {headline && <div className="text-[2rem] font-bold text-[var(--mw-text)] mb-5 tracking-[-0.02em]">{headline}</div>}
      <div className="relative min-h-[300px] border-l-2 border-b-2 border-[var(--mw-border)] overflow-visible my-auto mx-6 ml-9">
        <div data-role="midline-x" className="absolute top-1/2 left-0 right-0"></div>
        <div data-role="midline-y" className="absolute left-1/2 top-0 bottom-0"></div>
        <div data-role="label-y" className="absolute text-[0.72rem] text-[var(--mw-text-muted)] font-medium -left-8 bottom-0">{axisY.low || ''}</div>
        <div data-role="label-y" className="absolute text-[0.72rem] text-[var(--mw-text-muted)] font-medium -left-8 top-0">{axisY.high || ''}</div>
        <div className="absolute text-[0.72rem] text-[var(--mw-text-muted)] font-medium -bottom-[22px] left-0">{axisX.low || ''}</div>
        <div className="absolute text-[0.72rem] text-[var(--mw-text-muted)] font-medium -bottom-[22px] right-0">{axisX.high || ''}</div>
        {players.map(p => {
          const left = 10 + (p.x / 100) * 80;
          const top = 10 + ((100 - p.y) / 100) * 80;
          return (
            <div className="absolute flex flex-col items-center gap-1.5 z-[2] -translate-x-1/2 -translate-y-1/2"
              {...(p.highlight ? { 'data-highlight': true } : {})}
              style={'left:' + left + '%;top:' + top + '%'}>
              <div data-role="dot-circle" className={"w-3.5 h-3.5 rounded-full bg-[var(--mw-text-muted)] opacity-30" + (p.highlight ? ' !w-6 !h-6' : '')}></div>
              <div data-role="dot-name" className={"text-[0.8rem] font-medium text-[var(--mw-text-muted)] whitespace-nowrap" + (p.highlight ? ' !text-[0.9rem] !font-extrabold' : '')}>{p.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
