import { h } from '../h';

interface RingData { value: string; label: string; }
interface MarketSlideProps {
  headline?: string;
  tam: RingData;
  sam: RingData;
  som: RingData;
  insight?: string;
  sources?: string[];
}

export function MarketSlide({ headline = '', tam, sam, som, insight = '', sources = [] }: MarketSlideProps) {
  return (
    <div data-widget="market" className="flex flex-col flex-1 min-h-0 p-12 px-16 box-border">
      {headline && <div className="text-[2rem] font-bold text-[var(--mw-text)] mb-5 tracking-[-0.02em]">{headline}</div>}
      <div className="flex items-center justify-center min-h-[300px] relative my-auto">
        <div data-ring="tam" className="flex flex-col items-center justify-center rounded-full absolute w-[420px] h-[420px]">
          <div className="text-[2rem] font-extrabold text-[var(--mw-text)] tracking-[-0.02em]">{tam.value}</div>
          <div className="text-[0.72rem] text-[var(--mw-text-muted)] mt-1 text-center max-w-[140px] leading-[1.3] font-medium uppercase tracking-[0.04em]">{tam.label}</div>
        </div>
        <div data-ring="sam" className="flex flex-col items-center justify-center rounded-full absolute w-[290px] h-[290px]">
          <div className="text-[2rem] font-extrabold text-[var(--mw-text)] tracking-[-0.02em]">{sam.value}</div>
          <div className="text-[0.72rem] text-[var(--mw-text-muted)] mt-1 text-center max-w-[140px] leading-[1.3] font-medium uppercase tracking-[0.04em]">{sam.label}</div>
        </div>
        <div data-ring="som" className="flex flex-col items-center justify-center rounded-full absolute w-[160px] h-[160px]">
          <div className="text-[1.8rem] font-extrabold text-[var(--mw-accent)] tracking-[-0.02em]">{som.value}</div>
          <div className="text-[0.72rem] text-[var(--mw-text-muted)] mt-1 text-center max-w-[140px] leading-[1.3] font-medium uppercase tracking-[0.04em]">{som.label}</div>
        </div>
      </div>
      {insight && <div className="mt-4 text-center text-base font-semibold text-[var(--mw-accent)]">{insight}</div>}
      {sources.length > 0 && <div className="mt-2 text-center text-[0.72rem] text-[var(--mw-text-muted)]">Source: {sources.join(', ')}</div>}
    </div>
  );
}
