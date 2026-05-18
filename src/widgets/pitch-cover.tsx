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
    <div data-widget="cover" data-style={style} className={"flex flex-col items-center justify-center text-center p-[5cqw] flex-1 min-h-0 box-border bg-[var(--mw-bg)]" + minCls}>
      {logo && <div className="text-[clamp(24px,3cqw,40px)] mb-[2cqw] opacity-90">{logo}</div>}
      <div data-role="company" className="text-[clamp(42px,6cqw,80px)] font-extrabold tracking-[-0.04em] text-[var(--mw-text)] leading-[1.05]">{company}</div>
      {tagline && <div className="text-[clamp(16px,2cqw,26px)] text-[var(--mw-text-muted)] mt-[1.5cqw] font-normal tracking-[-0.01em]">{tagline}</div>}
      {subtitle && <div className="text-[clamp(9px,0.9cqw,12px)] text-[var(--mw-text-muted)] mt-[3cqw] pt-[2cqw] border-t border-[var(--mw-border)] tracking-[0.04em] uppercase font-medium">{subtitle}</div>}
    </div>
  );
}
