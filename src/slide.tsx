/**
 * maging-slide — Unified slide viewer + all presentation widgets
 *
 * Built from src/slide.tsx → dist/maging-slide.js
 * Replaces: maging-weekly.js + maging-pitch.js
 *
 * Usage:
 *   <script src="maging-slide.js"></script>
 *   Maging.page({ mode: 'slide', slides: [...] });
 */

import { h, Fragment } from './h';
import {
  PitchCover, ProblemSlide, SolutionSlide, MetricHighlight,
  MarketSlide, CompetitorMatrix, BizModelSlide, TimelineSlide,
  TeamSlide, AskSlide, ChainFlow, CompareSlide, DeepDiveSlide,
  QuoteSlide, ReferenceTable, FlywheelSlide, StorySlide,
  SwotSlide, RoadmapSlide, FeatureSlide,
} from './widgets';

// ── Types ────────────────────────────────────────────────────────────────────
declare const window: any;
declare const document: any;
declare const location: any;
declare const history: any;
declare const addEventListener: any;
declare const innerWidth: number;
declare const innerHeight: number;
declare const localStorage: any;
declare const navigator: any;
declare const echarts: any;

type MagingAPI = any;
type SlideConfig = { id: string; label?: string; bu?: string; team?: string; cover?: boolean; widgets?: any[] };

// ── Helper: query selector ───────────────────────────────────────────────────
function q(sel: string | HTMLElement): HTMLElement | null {
  return typeof sel === 'string' ? document.querySelector(sel) : sel;
}

// ── Register pitch/presentation widgets on Maging ────────────────────────────
function registerPitchWidgets(M: MagingAPI) {
  M.pitchCover      = (sel: any, cfg: any) => { const el = q(sel); if (el) el.innerHTML = PitchCover(cfg); };
  M.problemSlide    = (sel: any, cfg: any) => { const el = q(sel); if (el) el.innerHTML = ProblemSlide(cfg); };
  M.solutionSlide   = (sel: any, cfg: any) => { const el = q(sel); if (el) el.innerHTML = SolutionSlide(cfg); };
  M.metricHighlight = (sel: any, cfg: any) => { const el = q(sel); if (el) el.innerHTML = MetricHighlight(cfg); };
  M.marketSlide     = (sel: any, cfg: any) => { const el = q(sel); if (el) el.innerHTML = MarketSlide(cfg); };
  M.competitorMatrix= (sel: any, cfg: any) => { const el = q(sel); if (el) el.innerHTML = CompetitorMatrix(cfg); };
  M.bizModelSlide   = (sel: any, cfg: any) => { const el = q(sel); if (el) el.innerHTML = BizModelSlide(cfg); };
  M.timelineSlide   = (sel: any, cfg: any) => { const el = q(sel); if (el) el.innerHTML = TimelineSlide(cfg); };
  M.teamSlide       = (sel: any, cfg: any) => { const el = q(sel); if (el) el.innerHTML = TeamSlide(cfg); };
  M.askSlide        = (sel: any, cfg: any) => { const el = q(sel); if (el) el.innerHTML = AskSlide(cfg); };
  M.chainFlow       = (sel: any, cfg: any) => { const el = q(sel); if (el) el.innerHTML = ChainFlow(cfg); };
  M.compareSlide    = (sel: any, cfg: any) => { const el = q(sel); if (el) el.innerHTML = CompareSlide(cfg); };
  M.deepDiveSlide   = (sel: any, cfg: any) => { const el = q(sel); if (el) el.innerHTML = DeepDiveSlide(cfg); };
  M.quoteSlide      = (sel: any, cfg: any) => { const el = q(sel); if (el) el.innerHTML = QuoteSlide(cfg); };
  M.referenceTable  = (sel: any, cfg: any) => { const el = q(sel); if (el) el.innerHTML = ReferenceTable(cfg); };
  M.flywheelSlide   = (sel: any, cfg: any) => { const el = q(sel); if (el) el.innerHTML = FlywheelSlide(cfg); };
  M.storySlide      = (sel: any, cfg: any) => { const el = q(sel); if (el) el.innerHTML = StorySlide(cfg); };
  M.swotSlide       = (sel: any, cfg: any) => { const el = q(sel); if (el) el.innerHTML = SwotSlide(cfg); };
  M.roadmapSlide    = (sel: any, cfg: any) => { const el = q(sel); if (el) el.innerHTML = RoadmapSlide(cfg); };
  M.featureSlide    = (sel: any, cfg: any) => { const el = q(sel); if (el) el.innerHTML = FeatureSlide(cfg); };
}

// ── CSS injection (only rules Tailwind can't express) ────────────────────────
function injectCSS() {
  const style = document.createElement('style');
  style.textContent = `
  /* activityTable — external widget DOM */
  .scroll-table[data-mw-card]{padding:0;overflow:hidden}
  .scroll-table [data-mw-list]{flex:1;min-height:0;overflow:hidden}
  .scroll-table table{width:100%;height:100%;font-size:var(--mw-text-xs);border-collapse:separate;border-spacing:0;table-layout:fixed}
  .scroll-table table th,.scroll-table table td{padding:var(--mw-space-3-5) var(--mw-space-2);font-variant-numeric:tabular-nums;background:var(--mw-surface);text-align:right;overflow:hidden;text-overflow:ellipsis}
  .scroll-table table th:first-child,.scroll-table table td:first-child{text-align:left}
  .scroll-table table th{font-weight:500;color:var(--mw-text-muted);letter-spacing:.01em}
  .scroll-table table td strong{font-weight:600}
  .scroll-table table tbody tr:last-child td{background:var(--mw-surface-2)}
  .scroll-table [data-mw-card]>[data-role=header]{display:none}
  .scroll-table>[data-mw-card]{height:100%;display:flex;flex-direction:column;overflow:hidden}

  /* Cover — maging.js widget output (clamp/cqw/color-mix) */
  .cover-slide{padding:0;border:none!important;overflow:hidden}
  .cover-slide>.mw-cover{width:100%;height:100%;aspect-ratio:auto;min-height:auto;border:none;border-radius:inherit;box-shadow:none;margin:0}
  .cover-slide>.mw-cover--classic{background:linear-gradient(180deg,var(--mw-bg) 60%,color-mix(in srgb,var(--mw-accent) 8%,var(--mw-bg)) 100%);padding:3.2cqw 4.5cqw;gap:0;justify-content:space-between}
  .cover-slide>.mw-cover--classic .mw-cover__header{display:flex;justify-content:space-between;align-items:flex-start}
  .cover-slide>.mw-cover--classic .mw-cover__kicker,.cover-slide>.mw-cover--classic .mw-cover__brand,.cover-slide>.mw-cover--classic .mw-cover__meta{font-size:clamp(9px,.85cqw,11px);font-family:var(--mw-mono-font);color:var(--mw-text-muted);opacity:.7}
  .cover-slide>.mw-cover--classic .mw-cover__brand{letter-spacing:.02em;text-align:right;font-weight:400}
  .cover-slide>.mw-cover--classic .mw-cover__kicker{letter-spacing:.14em}
  .cover-slide>.mw-cover--classic .mw-cover__body{display:flex;flex-direction:column;gap:1cqw;padding:0}
  .cover-slide>.mw-cover--classic .mw-cover__title{font-size:clamp(32px,5.5cqw,72px);letter-spacing:-.045em;line-height:1.1;font-weight:800;word-break:keep-all}
  .cover-slide>.mw-cover--classic .mw-cover__subtitle{font-size:clamp(13px,1.6cqw,20px);color:var(--mw-text-muted);max-width:75%;line-height:1.6;opacity:.65}
  .cover-slide>.mw-cover--classic .mw-cover__footer{display:flex;justify-content:space-between;align-items:flex-end;border-top:none;padding-top:0;margin-top:0}
  .cover-slide>.mw-cover--classic .mw-cover__rule{display:none}

  /* Viewer context */
  body:has([data-viewer]){overflow:hidden;height:100vh;margin:0;background:#fff}
  body:has([data-viewer]) .mw-theme-fab,body:has([data-viewer]) .wrn-bar{display:none!important}

  /* Slide canvas */
  [data-slide-area]>.mw-slide{min-width:0!important;border:none;box-shadow:0 2px 8px rgba(0,0,0,.08),0 8px 32px rgba(0,0,0,.06)}

  /* Thumbnails */
  [data-thumb-content] .mw-slide,[data-thumb-content] .mw-cover{box-shadow:none;border:none;border-radius:0}
  [data-thumb-content] [data-role=body]{overflow:hidden!important}
  [data-thumb-content] .cover-slide>.mw-cover{width:100%;height:100%;min-height:0;border:none}

  /* Presenter */
  body.presenter-mode{overflow:hidden;background:#1a1a1a}
  body.presenter-mode [data-sidebar],body.presenter-mode [data-titlebar],body.presenter-mode [data-panel],body.presenter-mode .mw-site-nav{display:none!important}
  body.presenter-mode main{padding:0!important;width:100vw;height:100vh;overflow:hidden}
  body.presenter-mode [data-slide-area]{position:fixed;inset:0;display:flex!important;width:100vw;height:100vh;align-items:center;justify-content:center;z-index:9999;background:#1a1a1a}
  body.presenter-mode .mw-slide{border:none;border-radius:0;box-shadow:none!important}

  /* Panel animation */
  #wk-panel{max-height:0;transition:max-height .3s ease,border-color .3s;overflow:hidden;border-color:transparent}
  #wk-panel.is-open{max-height:400px;border-color:var(--mw-border)}

  /* Carousel hover + scrollbar */
  [data-carousel-item]:hover [data-swatch]{border-color:var(--mw-accent)}
  [data-swatch]{transition:border-color .15s,box-shadow .15s}
  [data-carousel-track]::-webkit-scrollbar{display:none}

  /* Pitch widgets — color-mix, nth-child, pseudo-elements */
  [data-widget=cover][data-style=bold]{background:linear-gradient(160deg,var(--mw-bg) 0%,color-mix(in srgb,var(--mw-accent) 4%,var(--mw-bg)) 100%)}
  [data-widget=cover][data-style=gradient]{background:linear-gradient(135deg,color-mix(in srgb,var(--mw-accent) 10%,var(--mw-bg)),var(--mw-bg) 60%,color-mix(in srgb,var(--mw-accent) 5%,var(--mw-bg)))}
  [data-widget=problem] [data-role=highlight]{background:color-mix(in srgb,var(--mw-accent) 6%,var(--mw-surface))}
  [data-widget=solution] [data-role=col][data-side=before]{background:color-mix(in srgb,var(--mw-danger,#ef4444) 4%,var(--mw-surface));border-color:color-mix(in srgb,var(--mw-danger,#ef4444) 15%,var(--mw-border))}
  [data-widget=solution] [data-role=col][data-side=after]{background:color-mix(in srgb,var(--mw-success,#22c55e) 4%,var(--mw-surface));border-color:color-mix(in srgb,var(--mw-success,#22c55e) 15%,var(--mw-border))}
  [data-widget=solution] [data-role=col][data-side=before] [data-role=col-label]{color:var(--mw-danger,#ef4444)}
  [data-widget=solution] [data-role=col][data-side=after] [data-role=col-label]{color:var(--mw-success,#22c55e)}
  [data-widget=market] [data-ring=tam]{background:color-mix(in srgb,var(--mw-accent) 4%,var(--mw-surface));border:2px solid color-mix(in srgb,var(--mw-accent) 15%,var(--mw-border))}
  [data-widget=market] [data-ring=sam]{background:color-mix(in srgb,var(--mw-accent) 8%,var(--mw-surface));border:2px solid color-mix(in srgb,var(--mw-accent) 30%,var(--mw-border))}
  [data-widget=market] [data-ring=som]{background:color-mix(in srgb,var(--mw-accent) 15%,var(--mw-surface));border:2px solid var(--mw-accent)}
  [data-widget=competitor] [data-highlight] [data-role=dot-circle]{background:var(--mw-accent);opacity:1;box-shadow:0 0 0 6px color-mix(in srgb,var(--mw-accent) 15%,transparent)}
  [data-widget=competitor] [data-highlight] [data-role=dot-name]{color:var(--mw-accent)}
  [data-widget=competitor] [data-role=label-y]{writing-mode:vertical-rl}
  [data-widget=competitor] [data-role=midline-x]{border-top:1px dashed color-mix(in srgb,var(--mw-border) 60%,transparent)}
  [data-widget=competitor] [data-role=midline-y]{border-left:1px dashed color-mix(in srgb,var(--mw-border) 60%,transparent)}
  [data-widget=bizmodel] [data-popular]{border-color:var(--mw-accent);border-width:2px;background:color-mix(in srgb,var(--mw-accent) 3%,var(--mw-surface))}
  [data-widget=bizmodel] [data-popular]::before{content:'RECOMMENDED';display:inline-block;font-size:.6rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--mw-accent);margin-bottom:12px}
  [data-widget=bizmodel] [data-popular] [data-role=price]{color:var(--mw-accent)}
  [data-widget=bizmodel] [data-role=features] li::before{content:'✓ ';color:var(--mw-accent);font-weight:700}
  [data-widget=timeline] [data-state=done] [data-role=dot]{background:var(--mw-accent);border-color:var(--mw-accent)}
  [data-widget=timeline] [data-state=active] [data-role=dot]{background:var(--mw-bg);border-color:var(--mw-accent);box-shadow:0 0 0 6px color-mix(in srgb,var(--mw-accent) 15%,transparent)}
  [data-widget=team] [data-role=avatar]{background:color-mix(in srgb,var(--mw-accent) 10%,var(--mw-surface-2));color:var(--mw-accent)}
  [data-widget=chain] [data-accent]{background:var(--mw-accent);border-color:var(--mw-accent)}
  [data-widget=chain] [data-accent] [data-role=step-label]{color:rgba(255,255,255,.6)}
  [data-widget=chain] [data-accent] [data-role=step-title]{color:#fff}
  [data-widget=chain] [data-accent] [data-role=step-desc]{color:rgba(255,255,255,.7)}
  [data-widget=compare] [data-side=right]{background:var(--mw-accent);color:#fff}
  [data-widget=compare] [data-side=right] [data-role=col-label]{color:rgba(255,255,255,.5)}
  [data-widget=compare] [data-side=right] [data-role=row-key]{color:rgba(255,255,255,.5)}
  [data-widget=compare] [data-side=right] [data-role=row-val]{color:#fff}
  [data-widget=compare] [data-side=right] [data-role=row]{border-color:rgba(255,255,255,.15)}
  [data-widget=deepdive] [data-role=role-from] [data-role=role-label]{color:var(--mw-accent)}
  [data-widget=deepdive] [data-role=col-title]::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--mw-accent);flex-shrink:0}
  [data-widget=quote][data-style=boxed] [data-role=inner]{background:color-mix(in srgb,var(--mw-accent) 4%,var(--mw-surface))}
  [data-widget=callout][data-variant=accent]{background:var(--mw-accent);color:#fff}
  [data-widget=callout][data-variant=highlight]{background:color-mix(in srgb,var(--mw-accent) 6%,var(--mw-surface))}
  [data-widget=reftable] [data-highlight]{background:color-mix(in srgb,var(--mw-accent) 6%,transparent)}
  [data-widget=reftable] [data-highlight] td{color:var(--mw-accent);font-weight:600}
  [data-widget=reftable] th{background:var(--mw-surface);border-bottom:2px solid var(--mw-accent);color:var(--mw-accent)}
  [data-widget=swot] [data-role=quad]:nth-child(1){background:color-mix(in srgb,var(--mw-accent) 4%,var(--mw-surface))}
  [data-widget=swot] [data-role=quad]:nth-child(2){background:color-mix(in srgb,var(--mw-warning,#f59e0b) 4%,var(--mw-surface))}
  [data-widget=swot] [data-role=quad]:nth-child(3){background:color-mix(in srgb,var(--mw-success,#22c55e) 4%,var(--mw-surface))}
  [data-widget=swot] [data-role=quad]:nth-child(4){background:color-mix(in srgb,var(--mw-danger,#ef4444) 4%,var(--mw-surface))}
  [data-widget=swot] [data-role=quad]:nth-child(1) [data-role=quad-label]{color:var(--mw-accent)}
  [data-widget=swot] [data-role=quad]:nth-child(2) [data-role=quad-label]{color:var(--mw-warning,#f59e0b)}
  [data-widget=swot] [data-role=quad]:nth-child(3) [data-role=quad-label]{color:var(--mw-success,#22c55e)}
  [data-widget=swot] [data-role=quad]:nth-child(4) [data-role=quad-label]{color:var(--mw-danger,#ef4444)}
  [data-widget=story] [data-role=cell]:nth-child(1) [data-role=tag]{color:var(--mw-text-muted)}
  [data-widget=story] [data-role=cell]:nth-child(2) [data-role=tag]{color:var(--mw-warning,#f59e0b)}
  [data-widget=story] [data-role=cell]:nth-child(3) [data-role=tag]{color:var(--mw-success,#22c55e)}
  [data-widget=story] [data-role=flow-step]:first-child{background:var(--mw-accent);color:#fff;border-color:var(--mw-accent)}
  [data-widget=roadmap] [data-bar=accent]{background:var(--mw-accent)}
  [data-widget=roadmap] [data-bar=muted]{background:var(--mw-text-muted);opacity:.3}
  [data-widget=roadmap] [data-bar=surface]{background:var(--mw-surface-2);color:var(--mw-text);border:1px solid var(--mw-border)}
  [data-widget=roadmap] [data-role=period]{border-bottom:2px solid var(--mw-border)}
  [data-widget=flywheel] [data-role=summary]{background:var(--mw-accent);color:#fff}
  `;
  document.head.appendChild(style);
}

// ── Viewer infrastructure (deck nav, toolbar, thumbnails, etc.) ──────────────
import { bootViewer } from './viewer';

// ── Boot ─────────────────────────────────────────────────────────────────────
(function () {
  injectCSS();
  bootViewer();

  if (window.Maging) registerPitchWidgets(window.Maging);
  window.addEventListener('maging:ready', () => {
    if (window.Maging) registerPitchWidgets(window.Maging);
  });
})();
