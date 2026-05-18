import { h } from '../h';
import { calloutHTML } from './callout';

interface TableRow { values?: string[]; highlight?: boolean; }
interface ReferenceTableProps {
  headline?: string;
  columns?: string[];
  rows?: TableRow[];
  footnote?: string;
  callout?: string;
}

export function ReferenceTable({ headline = '', columns = [], rows = [], footnote = '', callout = '' }: ReferenceTableProps) {
  return (
    <div data-widget="reftable" className="flex flex-col flex-1 min-h-0 p-12 px-16 box-border">
      {headline && <div className="text-[2rem] font-bold text-[var(--mw-text)] mb-7 tracking-[-0.02em]">{headline}</div>}
      <table className="w-full border-collapse rounded-[var(--mw-radius)] overflow-hidden border border-[var(--mw-border)] my-auto">
        {columns.length > 0 && (
          <thead><tr>
            {columns.map(c =>
              <th className="text-left py-2.5 px-3.5 text-[0.75rem] font-semibold">{c}</th>
            )}
          </tr></thead>
        )}
        <tbody>
          {rows.map(r =>
            <tr {...(r.highlight ? { 'data-highlight': true } : {})}>
              {(r.values || []).map(v =>
                <td className="py-2.5 px-3.5 align-top border-b border-[var(--mw-border)] text-[0.82rem] text-[var(--mw-text-muted)]">{v}</td>
              )}
            </tr>
          )}
        </tbody>
      </table>
      {footnote && <div className="mt-3 text-[0.7rem] text-[var(--mw-text-muted)]">{footnote}</div>}
      {calloutHTML(callout)}
    </div>
  );
}
