import { h } from '../h';
import { calloutHTML } from './callout';
import { accentMark } from './utils';

interface RoleEnd { label?: string; name?: string; }
interface Role { from?: RoleEnd; to?: RoleEnd; message?: string; }
interface ColItem { title: string; desc?: string; }
interface Column { title: string; items?: ColItem[]; }
interface DeepDiveSlideProps {
  role?: Role;
  columns?: Column[];
  callout?: string;
}

export function DeepDiveSlide({ role, columns = [], callout = '' }: DeepDiveSlideProps) {
  const colCount = columns.length || 3;
  const roleHTML = role ? (
    <div className="flex items-center gap-[3%] py-[2.5%] px-[4%] rounded-t-[var(--mw-radius)] bg-[var(--mw-surface)] border border-[var(--mw-border)] border-b-0">
      <div data-role="role-from">
        <div data-role="role-label" className="text-[clamp(8px,0.75cqw,10px)] font-mono tracking-[2px] uppercase font-medium mb-0.5">{role.from?.label || 'From'}</div>
        <div className="text-[clamp(13px,1.4cqw,18px)] font-bold text-[var(--mw-text)]">{role.from?.name || ''}</div>
      </div>
      <div className="text-[clamp(16px,2cqw,26px)] text-[var(--mw-accent)] opacity-40">→</div>
      <div data-role="role-to">
        <div data-role="role-label" className="text-[clamp(8px,0.75cqw,10px)] font-mono tracking-[2px] uppercase font-medium mb-0.5 text-[var(--mw-text-muted)]">{role.to?.label || 'To'}</div>
        <div className="text-[clamp(13px,1.4cqw,18px)] font-bold text-[var(--mw-text)]">{role.to?.name || ''}</div>
      </div>
      {role.message && <div className="ml-auto text-[clamp(11px,1.1cqw,15px)] text-[var(--mw-text-muted)] italic">{role.message}</div>}
    </div>
  ) : '';

  return (
    <div data-widget="deepdive" className="flex flex-col flex-1 min-h-0 p-[2%] px-[4%] box-border">
      {roleHTML}
      <div className="grid gap-0 rounded-b-[var(--mw-radius)] overflow-hidden border border-[var(--mw-border)] border-t-0 flex-1" style={'grid-template-columns:repeat(' + colCount + ',1fr)'}>
        {columns.map(c =>
          <div className="py-[3%] px-[3%] border-r border-[var(--mw-border)] flex flex-col last:border-r-0">
            <div data-role="col-title" className="text-[clamp(11px,1.1cqw,15px)] font-bold text-[var(--mw-accent)] mb-2.5 flex items-center gap-2">{c.title}</div>
            <div className="flex flex-col flex-1">
              {(c.items || []).map(it =>
                <div className="py-2.5 border-b border-[var(--mw-border)] flex-1 flex flex-col justify-center last:border-b-0">
                  <div className="text-[clamp(11px,1.1cqw,15px)] font-semibold text-[var(--mw-text)] mb-0.5">{it.title}</div>
                  {it.desc && <div className="text-[clamp(9px,0.9cqw,12px)] text-[var(--mw-text-muted)] leading-[1.4]">{it.desc}</div>}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {calloutHTML(callout)}
    </div>
  );
}
