import { h } from '../h';
import { calloutHTML } from './callout';
import { accentMark } from './utils';

interface Row { key: string; value: string; }
interface Side { label?: string; rows?: Row[]; }
interface CompareSlideProps {
  headline?: string;
  left?: Side;
  right?: Side;
  note?: string;
  callout?: string;
}

function renderRows(rows: Row[]) {
  return rows.map(r =>
    <div data-role="row" className="flex justify-between py-3 border-b border-[var(--mw-border)] text-[clamp(11px,1.1cqw,15px)] last:border-b-0">
      <span data-role="row-key" className="text-[var(--mw-text-muted)] text-[clamp(9px,0.9cqw,12px)]">{r.key}</span>
      <span data-role="row-val" className="font-bold text-[var(--mw-text)]">{r.value}</span>
    </div>
  );
}

export function CompareSlide({ headline = '', left = {}, right = {}, note = '', callout = '' }: CompareSlideProps) {
  return (
    <div data-widget="compare" className="flex flex-col flex-1 min-h-0 p-[4cqw] px-[5cqw] box-border">
      {headline && <div className="text-[clamp(24px,3cqw,40px)] font-bold text-[var(--mw-text)] mb-[2.5cqw] tracking-[-0.02em]" dangerouslySetInnerHTML={{ __html: accentMark(headline) }}></div>}
      <div className="grid grid-cols-2 rounded-[var(--mw-radius)] overflow-hidden border border-[var(--mw-border)] my-auto">
        <div data-side="left" className="p-[2.5cqw] flex flex-col justify-center bg-[var(--mw-surface)]">
          <div data-role="col-label" className="text-[clamp(8px,0.75cqw,10px)] uppercase tracking-[0.1em] font-bold mb-5 text-[var(--mw-text-muted)]">{left.label || 'Before'}</div>
          {renderRows(left.rows || [])}
        </div>
        <div data-side="right" className="p-[2.5cqw] flex flex-col justify-center">
          <div data-role="col-label" className="text-[clamp(8px,0.75cqw,10px)] uppercase tracking-[0.1em] font-bold mb-5">{right.label || 'After'}</div>
          {renderRows(right.rows || [])}
        </div>
      </div>
      {note && <div className="mt-[1.5cqw] text-[clamp(11px,1.1cqw,15px)] font-semibold text-[var(--mw-text)]">{note}</div>}
      {calloutHTML(callout)}
    </div>
  );
}
