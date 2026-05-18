import { h } from '../h';

interface QuoteSlideProps {
  quote?: string;
  attribution?: string;
  source?: string;
  style?: 'center' | 'left' | 'boxed';
}

export function QuoteSlide({ quote = '', attribution = '', source = '', style = 'center' }: QuoteSlideProps) {
  if (style === 'boxed') {
    return (
      <div data-widget="quote" data-style="boxed" className="flex flex-col items-stretch justify-center flex-1 min-h-0 p-[4cqw] px-[5cqw] box-border">
        <div data-role="inner" className="py-9 px-10 border-l-[3px] border-l-[var(--mw-accent)] rounded-r-[var(--mw-radius)] text-left">
          <div className="text-[clamp(13px,1.4cqw,18px)] font-medium text-[var(--mw-text)] leading-relaxed italic tracking-[-0.01em]">{quote}</div>
          {attribution && <div className="mt-[2cqw] text-[clamp(11px,1.1cqw,15px)] text-[var(--mw-accent)] font-semibold">— {attribution}</div>}
          {source && <div className="text-[clamp(9px,0.9cqw,12px)] text-[var(--mw-text-muted)] mt-1">{source}</div>}
        </div>
      </div>
    );
  }

  return (
    <div data-widget="quote" className={"flex flex-col items-center justify-center flex-1 min-h-0 text-center box-border" +
      (style === 'left' ? ' !items-start !text-left p-[60px] px-16' : ' p-20 px-[100px]')}>
      <div className="text-[clamp(24px,3cqw,40px)] leading-none text-[var(--mw-accent)] opacity-20 font-serif">"</div>
      <div className={(style === 'left' ? 'text-[clamp(13px,1.4cqw,18px)]' : 'text-[clamp(13px,1.4cqw,18px)]') + ' font-medium text-[var(--mw-text)] leading-relaxed mt-2 max-w-[720px] italic tracking-[-0.01em]'}>{quote}</div>
      {attribution && <div className="mt-[2cqw] text-[clamp(11px,1.1cqw,15px)] text-[var(--mw-accent)] font-semibold">— {attribution}</div>}
      {source && <div className="text-[clamp(9px,0.9cqw,12px)] text-[var(--mw-text-muted)] mt-1">{source}</div>}
    </div>
  );
}
