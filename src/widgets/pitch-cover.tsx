import { h } from '../h';

interface PitchCoverProps {
  company?: string;
  tagline?: string;
  logo?: string;
  subtitle?: string;
  style?: 'bold' | 'minimal' | 'gradient';
}

export function PitchCover({ company = '', tagline = '', logo = '', subtitle = '', style = 'bold' }: PitchCoverProps) {
  const minCls = style === 'minimal' ? ' items-start text-left !p-0 !pl-[10%]' : '';
  return (
    <div data-widget="cover" data-style={style} className={"flex flex-col items-center justify-center text-center p-20 flex-1 min-h-0 box-border bg-[var(--mw-bg)]" + minCls}>
      {logo && <div className="text-[3rem] mb-7 opacity-90">{logo}</div>}
      <div data-role="company" className="text-[5.5rem] font-extrabold tracking-[-0.04em] text-[var(--mw-text)] leading-[1.05]">{company}</div>
      {tagline && <div className="text-[1.6rem] text-[var(--mw-text-muted)] mt-5 font-normal tracking-[-0.01em]">{tagline}</div>}
      {subtitle && <div className="text-[0.85rem] text-[var(--mw-text-muted)] mt-9 pt-6 border-t border-[var(--mw-border)] tracking-[0.04em] uppercase font-medium">{subtitle}</div>}
    </div>
  );
}
