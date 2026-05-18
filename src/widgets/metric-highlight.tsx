import { h } from '../h';

interface Metric { value: string; unit?: string; label: string; }
interface MetricHighlightProps { metrics?: Metric[]; }

export function MetricHighlight({ metrics = [] }: MetricHighlightProps) {
  return (
    <div className="flex flex-wrap gap-[2cqw] items-center justify-center flex-1 min-h-0 p-[4cqw] px-[5cqw] box-border">
      {metrics.map(m =>
        <div className="flex-1 min-w-[200px] text-center py-8 px-4">
          <div className="text-[clamp(42px,6cqw,80px)] font-extrabold text-[var(--mw-accent)] tracking-[-0.04em] leading-none tabular-nums">
            {m.value}
            {m.unit && <span className="text-[clamp(16px,2cqw,26px)] font-normal text-[var(--mw-text-muted)] ml-0.5">{m.unit}</span>}
          </div>
          <div className="text-[clamp(11px,1.1cqw,15px)] text-[var(--mw-text-muted)] mt-3.5 font-medium tracking-[0.01em]">{m.label}</div>
        </div>
      )}
    </div>
  );
}
