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
    <div data-widget="chain" className="flex flex-col flex-1 min-h-0 p-12 px-16 box-border">
      {headline && <div className="text-[2rem] font-bold text-[var(--mw-text)] mb-9 tracking-[-0.02em] max-w-[85%]">{headline}</div>}
      <div className="flex items-stretch my-auto">
        {steps.map((s, i) => {
          const arrow = i < steps.length - 1
            ? <div className="flex items-center px-3 text-[1.4rem] text-[var(--mw-accent)] opacity-40">→</div>
            : '';
          return [
            <div className="flex-1 py-7 px-6 flex flex-col justify-center rounded-[var(--mw-radius)] bg-[var(--mw-surface)] border border-[var(--mw-border)]"
              {...(s.accent ? { 'data-accent': true } : {})}>
              {s.label && <div data-role="step-label" className="text-[0.65rem] uppercase tracking-[0.1em] font-semibold text-[var(--mw-text-muted)] mb-2">{s.label}</div>}
              <div data-role="step-title" className="text-[1.1rem] font-bold text-[var(--mw-text)]">{s.title}</div>
              {s.desc && <div data-role="step-desc" className="text-[0.8rem] text-[var(--mw-text-muted)] mt-1.5 leading-[1.4]">{s.desc}</div>}
            </div>,
            arrow
          ];
        })}
      </div>
      {footer && <div className="mt-5 text-[0.82rem] text-[var(--mw-text-muted)]">{footer}</div>}
      {calloutHTML(callout)}
    </div>
  );
}
