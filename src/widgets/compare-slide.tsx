import { h } from '../h';
import { calloutHTML } from './callout';

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
    <div data-role="row" className="flex justify-between py-3 border-b border-[var(--mw-border)] text-[0.95rem] last:border-b-0">
      <span data-role="row-key" className="text-[var(--mw-text-muted)] text-[0.8rem]">{r.key}</span>
      <span data-role="row-val" className="font-bold text-[var(--mw-text)]">{r.value}</span>
    </div>
  );
}

export function CompareSlide({ headline = '', left = {}, right = {}, note = '', callout = '' }: CompareSlideProps) {
  return (
    <div data-widget="compare" className="flex flex-col flex-1 min-h-0 p-12 px-16 box-border">
      {headline && <div className="text-[2rem] font-bold text-[var(--mw-text)] mb-9 tracking-[-0.02em] max-w-[85%]">{headline}</div>}
      <div className="grid grid-cols-2 rounded-[var(--mw-radius)] overflow-hidden border border-[var(--mw-border)] my-auto">
        <div data-side="left" className="p-8 flex flex-col justify-center bg-[var(--mw-surface)]">
          <div data-role="col-label" className="text-[0.7rem] uppercase tracking-[0.1em] font-bold mb-5 text-[var(--mw-text-muted)]">{left.label || 'Before'}</div>
          {renderRows(left.rows || [])}
        </div>
        <div data-side="right" className="p-8 flex flex-col justify-center">
          <div data-role="col-label" className="text-[0.7rem] uppercase tracking-[0.1em] font-bold mb-5">{right.label || 'After'}</div>
          {renderRows(right.rows || [])}
        </div>
      </div>
      {note && <div className="mt-5 text-[0.85rem] font-semibold text-[var(--mw-text)]">{note}</div>}
      {calloutHTML(callout)}
    </div>
  );
}
