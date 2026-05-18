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
      <div data-widget="quote" data-style="boxed" className="flex flex-col items-stretch justify-center flex-1 min-h-0 p-12 px-16 box-border">
        <div data-role="inner" className="py-9 px-10 border-l-[3px] border-l-[var(--mw-accent)] rounded-r-[var(--mw-radius)] text-left">
          <div className="text-[1.2rem] font-medium text-[var(--mw-text)] leading-relaxed italic tracking-[-0.01em]">{quote}</div>
          {attribution && <div className="mt-7 text-[0.85rem] text-[var(--mw-accent)] font-semibold">— {attribution}</div>}
          {source && <div className="text-[0.78rem] text-[var(--mw-text-muted)] mt-1">{source}</div>}
        </div>
      </div>
    );
  }

  return (
    <div data-widget="quote" className={"flex flex-col items-center justify-center flex-1 min-h-0 text-center box-border" +
      (style === 'left' ? ' !items-start !text-left p-[60px] px-16' : ' p-20 px-[100px]')}>
      <div className="text-[4rem] leading-none text-[var(--mw-accent)] opacity-20 font-serif">"</div>
      <div className={(style === 'left' ? 'text-[1.35rem]' : 'text-[1.6rem]') + ' font-medium text-[var(--mw-text)] leading-relaxed mt-2 max-w-[720px] italic tracking-[-0.01em]'}>{quote}</div>
      {attribution && <div className="mt-7 text-[0.85rem] text-[var(--mw-accent)] font-semibold">— {attribution}</div>}
      {source && <div className="text-[0.78rem] text-[var(--mw-text-muted)] mt-1">{source}</div>}
    </div>
  );
}
