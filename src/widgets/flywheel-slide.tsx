import { h } from '../h';
import { calloutHTML } from './callout';

interface FwStep { title: string; desc?: string; icon?: string; }
interface Summary { title: string; desc?: string; }
interface FlywheelSlideProps {
  headline?: string;
  sub?: string;
  steps?: FwStep[];
  summary?: Summary;
  hub?: string;
  callout?: string;
}

export function FlywheelSlide({ headline = '', sub = '', steps = [], summary, hub = '', callout = '' }: FlywheelSlideProps) {
  const n = steps.length || 4;
  const W = 640, H = 440, cx = W / 2, cy = H / 2 + 10;
  const R = 130;
  const nodeSize = 36;
  const toRad = (d: number) => (d - 90) * Math.PI / 180;
  const px = (r: number, a: number) => cx + r * Math.cos(toRad(a));
  const py = (r: number, a: number) => cy + r * Math.sin(toRad(a));
  const f = (v: number) => v.toFixed(1);
  const iconColors = ['var(--mw-accent)', '#22c55e', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'];
  const defaultIcons = ['⚡', '🔄', '📤', '💪', '🚀', '📊'];

  let svg = '<svg class="w-full h-full max-w-[640px] max-h-[480px]" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" style="font-family:var(--mw-font,sans-serif)">';
  const arrowR = R;
  for (let i = 0; i < n; i++) {
    const a1 = i * (360 / n) + 18;
    const a2 = (i + 1) * (360 / n) - 18;
    const large = (a2 - a1) > 180 ? 1 : 0;
    svg += '<path d="M' + f(px(arrowR, a1)) + ',' + f(py(arrowR, a1)) + ' A' + arrowR + ',' + arrowR + ' 0 ' + large + ' 1 ' + f(px(arrowR, a2)) + ',' + f(py(arrowR, a2)) + '" fill="none" stroke="var(--mw-border)" stroke-width="1.5"/>';
    const tipA = a2 + 3, baseA = a2 - 4;
    const tipX = px(arrowR, tipA), tipY = py(arrowR, tipA);
    const b1x = px(arrowR + 6, baseA), b1y = py(arrowR + 6, baseA);
    const b2x = px(arrowR - 6, baseA), b2y = py(arrowR - 6, baseA);
    svg += '<path d="M' + f(tipX) + ',' + f(tipY) + ' L' + f(b1x) + ',' + f(b1y) + ' L' + f(b2x) + ',' + f(b2y) + 'Z" fill="var(--mw-text-muted)" opacity="0.4"/>';
  }
  svg += '<circle cx="' + cx + '" cy="' + cy + '" r="32" fill="none" stroke="var(--mw-border)" stroke-width="1"/>';
  svg += '<text x="' + cx + '" y="' + cy + '" text-anchor="middle" dominant-baseline="central" font-size="20" fill="var(--mw-text-muted)" opacity="0.3">' + (hub ? '' : '⚙') + '</text>';
  if (hub) svg += '<text x="' + cx + '" y="' + cy + '" text-anchor="middle" dominant-baseline="central" font-size="10" font-weight="600" fill="var(--mw-text-muted)">' + hub + '</text>';
  for (let i = 0; i < n; i++) {
    const angle = i * (360 / n);
    const nx = px(R, angle), ny = py(R, angle);
    const icon = steps[i].icon || defaultIcons[i % defaultIcons.length];
    const color = iconColors[i % iconColors.length];
    const hs = nodeSize / 2;
    svg += '<rect x="' + f(nx - hs) + '" y="' + f(ny - hs) + '" width="' + nodeSize + '" height="' + nodeSize + '" rx="8" fill="' + color + '" opacity="0.12"/>';
    svg += '<text x="' + f(nx) + '" y="' + f(ny) + '" text-anchor="middle" dominant-baseline="central" font-size="18">' + icon + '</text>';
    const labelR = R + 56;
    const lx = px(labelR, angle), ly = py(labelR, angle);
    let anchor = 'middle';
    if (angle > 30 && angle < 150) anchor = 'start';
    if (angle > 210 && angle < 330) anchor = 'end';
    svg += '<text x="' + f(lx) + '" y="' + f(ly - 7) + '" text-anchor="' + anchor + '" font-size="12" font-weight="700" fill="var(--mw-text)">' + (i + 1) + '. ' + steps[i].title + '</text>';
    if (steps[i].desc) svg += '<text x="' + f(lx) + '" y="' + f(ly + 8) + '" text-anchor="' + anchor + '" font-size="9" fill="var(--mw-text-muted)">' + steps[i].desc + '</text>';
  }
  svg += '</svg>';

  return (
    <div data-widget="flywheel" className="flex flex-col flex-1 min-h-0 p-[3%] px-[4.5%] box-border">
      {headline && <div className="text-[clamp(24px,3cqw,40px)] font-bold text-[var(--mw-text)] mb-[1%] tracking-[-0.02em] text-center">{headline}</div>}
      {sub && <div className="text-[clamp(11px,1.1cqw,15px)] text-[var(--mw-text-muted)] mb-[2%] max-w-[600px] leading-relaxed text-center mx-auto">{sub}</div>}
      <div className="flex-1 flex items-center justify-center min-h-0" dangerouslySetInnerHTML={{ __html: svg }}></div>
      {summary && (
        <div data-role="summary" className="mt-[2%] py-[2%] px-[3%] rounded-[var(--mw-radius)] flex items-center gap-[3%]">
          <div className="text-[clamp(13px,1.4cqw,18px)] opacity-40">↻</div>
          <div>
            <div className="text-[clamp(11px,1.1cqw,15px)] font-bold">{summary.title}</div>
            {summary.desc && <div className="text-[clamp(9px,0.9cqw,12px)] opacity-70 mt-px">{summary.desc}</div>}
          </div>
        </div>
      )}
      {calloutHTML(callout)}
    </div>
  );
}
