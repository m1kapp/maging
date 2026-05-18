import { h } from '../h';

interface Metric { value: string; unit?: string; label: string; }
interface MetricHighlightProps { metrics?: Metric[]; }

export function MetricHighlight({ metrics = [] }: MetricHighlightProps) {
  return (
    <div className="flex flex-wrap gap-8 items-center justify-center flex-1 min-h-0 p-12 px-16 box-border">
      {metrics.map(m =>
        <div className="flex-1 min-w-[200px] text-center py-8 px-4">
          <div className="text-[5rem] font-extrabold text-[var(--mw-accent)] tracking-[-0.04em] leading-none tabular-nums">
            {m.value}
            {m.unit && <span className="text-[1.8rem] font-normal text-[var(--mw-text-muted)] ml-0.5">{m.unit}</span>}
          </div>
          <div className="text-[0.9rem] text-[var(--mw-text-muted)] mt-3.5 font-medium tracking-[0.01em]">{m.label}</div>
        </div>
      )}
    </div>
  );
}
