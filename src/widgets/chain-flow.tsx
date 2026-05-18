import { h } from '../h';
import { calloutHTML } from './callout';

interface Step { label?: string; title: string; desc?: string; accent?: boolean; }
interface ChainFlowProps {
  headline?: string;
  steps?: Step[];
  footer?: string;
  callout?: string;
}

export function ChainFlow({ headline = '', steps = [], footer = '', callout = '' }: ChainFlowProps) {
  return (
    <div data-widget="chain" className="flex flex-col flex-1 min-h-0 p-[4cqw] px-[5cqw] box-border">
      {headline && <div className="text-[clamp(24px,3cqw,40px)] font-bold text-[var(--mw-text)] mb-[2.5cqw] tracking-[-0.02em]">{headline}</div>}
      <div className="flex items-stretch my-auto">
        {steps.map((s, i) => {
          const arrow = i < steps.length - 1
            ? <div className="flex items-center px-3 text-[clamp(13px,1.4cqw,18px)] text-[var(--mw-accent)] opacity-40">→</div>
            : '';
          return [
            <div className="flex-1 py-7 px-6 flex flex-col justify-center rounded-[var(--mw-radius)] bg-[var(--mw-surface)] border border-[var(--mw-border)]"
              {...(s.accent ? { 'data-accent': true } : {})}>
              {s.label && <div data-role="step-label" className="text-[clamp(8px,0.75cqw,10px)] uppercase tracking-[0.1em] font-semibold text-[var(--mw-text-muted)] mb-2">{s.label}</div>}
              <div data-role="step-title" className="text-[clamp(13px,1.4cqw,18px)] font-bold text-[var(--mw-text)]">{s.title}</div>
              {s.desc && <div data-role="step-desc" className="text-[clamp(9px,0.9cqw,12px)] text-[var(--mw-text-muted)] mt-1.5 leading-[1.4]">{s.desc}</div>}
            </div>,
            arrow
          ];
        })}
      </div>
      {footer && <div className="mt-[1.5cqw] text-[clamp(11px,1.1cqw,15px)] text-[var(--mw-text-muted)]">{footer}</div>}
      {calloutHTML(callout)}
    </div>
  );
}
