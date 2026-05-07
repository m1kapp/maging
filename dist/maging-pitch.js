/**
 * maging-pitch.js — Pitch Deck infrastructure
 *
 * Load after maging-all.js + maging-sidebar.js. Injects CSS
 * and exposes Maging.deck(MOUNT) + pitch-specific widgets.
 *
 * Usage:
 *   <script defer src="maging-pitch.js"></script>
 *   ...
 *   window.addEventListener('maging:ready', () => {
 *     window.DECK_MOUNT = { cover: () => Maging.pitchCover(...), ... };
 *   });
 */

(function () {
  // ── 1. CSS injection ───────────────────────────────────────────────────────
  const _style = document.createElement('style');
  _style.textContent = `
  /* === Slide system === */
  .slide { display: none; }
  .slide[data-active] { display: flex; flex-direction: column; }
  .cover-slide { padding: 0; }
  .cover-slide .cover-host { height: 100%; }
  .cover-slide .cover-host > .pitch-cover { height: 100%; }

  /* === Slide viewer layout === */
  /* Canvas layout is in maging.css (shared via maging-sidebar) */

  /* === Slide frame (border/radius handled by maging-sidebar.js) === */
  .mw-slide__header { display: flex; align-items: center; justify-content: space-between; padding: 14px 24px 0; }
  .mw-slide__label { font-size: 12px; font-weight: 600; color: var(--mw-text); }
  .mw-slide__body { flex: 1; display: flex; flex-direction: column; }
  .mw-slide__footer { padding: 0 24px 10px; text-align: right; }
  .mw-slide__page { font-size: 10px; color: var(--mw-text-muted); font-variant-numeric: tabular-nums; }

  /* === Bottom nav bar === */
  .wrn-bar { position: fixed; left: 50%; transform: translateX(-50%); bottom: 20px; width: max-content; display: inline-flex; align-items: center; gap: 4px; padding: 0.38rem 0.65rem; background: var(--mw-surface); border: 1px solid var(--mw-border); border-radius: 999px; box-shadow: 0 8px 24px -6px rgba(0,0,0,.28), 0 2px 6px -2px rgba(0,0,0,.12); font-size: 0.78rem; font-variant-numeric: tabular-nums; color: var(--mw-text); font-family: var(--mw-font); z-index: 50; }
  .wrn-bar:hover { transform: translateX(-50%) translateY(-1px); box-shadow: 0 12px 32px -6px rgba(0,0,0,.32), 0 4px 10px -2px rgba(0,0,0,.14); border-color: var(--mw-accent); }
  .wrn-bar__indicator { font-weight: 500; padding: 0 4px; letter-spacing: -0.01em; }
  .wrn-bar__sep { color: var(--mw-text-muted); margin: 0 1px; }
  .wrn-bar__divider { width: 1px; height: 14px; background: var(--mw-border); margin: 0 2px; flex-shrink: 0; }
  .wrn-bar__btn { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; background: transparent; border: 0; border-radius: 50%; color: var(--mw-text-muted); cursor: pointer; transition: background 0.15s, color 0.15s; }
  .wrn-bar__btn:hover { background: var(--mw-surface-2); color: var(--mw-text); }

  /* Version label under FAB */
  .mw-theme-fab::after { content: 'maging ' attr(data-version); display: block; position: absolute; top: calc(100% + 6px); left: 50%; transform: translateX(-50%); font-size: 9px; color: var(--mw-text-muted); opacity: 0.4; white-space: nowrap; font-family: var(--mw-mono-font); letter-spacing: 0.02em; }

  /* === Presenter === */
  body.presenter-mode { overflow: hidden; background: #000 !important; }
  body.presenter-mode .mw-site-nav,
  body.presenter-mode maging-sidebar,
  body.presenter-mode .wrs { display: none !important; }
  body.presenter-mode > .flex { display: block; max-width: none; margin: 0; min-height: 0; }
  body.presenter-mode main { padding: 0 !important; display: flex; align-items: center; justify-content: center; width: 100vw; height: 100vh; overflow: hidden; position: fixed; top: 0; left: 0; background: transparent !important; }
  body.presenter-mode .mw-slide { border: none; border-radius: 0; transform-origin: center center; margin-bottom: 0 !important; margin-right: 0 !important; box-shadow: none; }
  body.presenter-mode .wrn-bar { z-index: 200; }

  /* === Pitch Deck widget styles === */

  /* === Pitch Cover === */
  .pitch-cover { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 80px 80px; background: var(--mw-bg); height: 100%; box-sizing: border-box; }
  .pitch-cover--bold { background: linear-gradient(160deg, var(--mw-bg) 0%, color-mix(in srgb, var(--mw-accent) 4%, var(--mw-bg)) 100%); }
  .pitch-cover--bold .pitch-cover__company { font-size: 5.5rem; font-weight: 800; letter-spacing: -0.04em; color: var(--mw-text); line-height: 1.05; }
  .pitch-cover--bold .pitch-cover__tagline { font-size: 1.6rem; color: var(--mw-text-muted); margin-top: 20px; font-weight: 400; letter-spacing: -0.01em; }
  .pitch-cover--minimal { align-items: flex-start; text-align: left; padding: 0 0 0 10%; justify-content: center; }
  .pitch-cover--minimal .pitch-cover__company { font-size: 4.5rem; font-weight: 800; color: var(--mw-text); letter-spacing: -0.03em; }
  .pitch-cover--minimal .pitch-cover__tagline { font-size: 1.4rem; color: var(--mw-text-muted); margin-top: 16px; }
  .pitch-cover--gradient { background: linear-gradient(135deg, color-mix(in srgb, var(--mw-accent) 10%, var(--mw-bg)), var(--mw-bg) 60%, color-mix(in srgb, var(--mw-accent) 5%, var(--mw-bg))); }
  .pitch-cover--gradient .pitch-cover__company { font-size: 5rem; font-weight: 800; color: var(--mw-text); letter-spacing: -0.03em; }
  .pitch-cover--gradient .pitch-cover__tagline { font-size: 1.5rem; color: var(--mw-text-muted); margin-top: 18px; }
  .pitch-cover__logo { font-size: 3rem; margin-bottom: 28px; opacity: 0.9; }
  .pitch-cover__subtitle { font-size: 0.85rem; color: var(--mw-text-muted); margin-top: 36px; padding-top: 24px; border-top: 1px solid var(--mw-border); letter-spacing: 0.04em; text-transform: uppercase; font-weight: 500; }

  /* === Problem Slide === */
  .pitch-problem { display: flex; flex-direction: column; height: 100%; padding: 48px 64px; box-sizing: border-box; }
  .pitch-problem__headline { font-size: 2rem; font-weight: 700; color: var(--mw-text); line-height: 1.25; margin-bottom: 36px; letter-spacing: -0.02em; max-width: 85%; }
  .pitch-problem__points { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin: auto 0; }
  .pitch-problem__point { padding: 28px; background: var(--mw-surface); border: 1px solid var(--mw-border); border-radius: var(--mw-radius); }
  .pitch-problem__icon { font-size: 1.8rem; margin-bottom: 14px; }
  .pitch-problem__title { font-size: 1.05rem; font-weight: 700; color: var(--mw-text); margin-bottom: 8px; letter-spacing: -0.01em; }
  .pitch-problem__desc { font-size: 0.85rem; color: var(--mw-text-muted); line-height: 1.55; }
  .pitch-problem__highlight { margin-top: 24px; padding: 18px 24px; background: color-mix(in srgb, var(--mw-accent) 6%, var(--mw-surface)); border-left: 3px solid var(--mw-accent); border-radius: 0 var(--mw-radius) var(--mw-radius) 0; font-size: 1.05rem; font-weight: 700; color: var(--mw-text); letter-spacing: -0.01em; }

  /* === Solution Slide === */
  .pitch-solution { display: flex; flex-direction: column; height: 100%; padding: 48px 64px; box-sizing: border-box; }
  .pitch-solution__headline { font-size: 2rem; font-weight: 700; color: var(--mw-text); line-height: 1.25; margin-bottom: 36px; letter-spacing: -0.02em; max-width: 85%; }
  .pitch-solution__compare { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin: auto 0; }
  .pitch-solution__col { padding: 32px; border-radius: var(--mw-radius); }
  .pitch-solution__col--before { background: color-mix(in srgb, var(--mw-danger, #ef4444) 4%, var(--mw-surface)); border: 1px solid color-mix(in srgb, var(--mw-danger, #ef4444) 15%, var(--mw-border)); }
  .pitch-solution__col--after { background: color-mix(in srgb, var(--mw-success, #22c55e) 4%, var(--mw-surface)); border: 1px solid color-mix(in srgb, var(--mw-success, #22c55e) 15%, var(--mw-border)); }
  .pitch-solution__col-label { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; margin-bottom: 20px; }
  .pitch-solution__col--before .pitch-solution__col-label { color: var(--mw-danger, #ef4444); }
  .pitch-solution__col--after .pitch-solution__col-label { color: var(--mw-success, #22c55e); }
  .pitch-solution__item { font-size: 1rem; color: var(--mw-text); padding: 12px 0; border-bottom: 1px solid var(--mw-border); line-height: 1.4; }
  .pitch-solution__item:last-child { border-bottom: none; }
  .pitch-solution__features { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; flex: 1; }
  .pitch-solution__feat { display: flex; align-items: center; gap: 14px; padding: 20px; background: var(--mw-surface); border: 1px solid var(--mw-border); border-radius: var(--mw-radius); }
  .pitch-solution__feat-icon { font-size: 1.6rem; }
  .pitch-solution__feat-label { font-size: 1rem; font-weight: 600; color: var(--mw-text); }

  /* === Metric Highlight === */
  .pitch-metrics { display: flex; flex-wrap: wrap; gap: 32px; align-items: center; justify-content: center; height: 100%; padding: 48px 64px; box-sizing: border-box; }
  .pitch-metric { flex: 1; min-width: 200px; }
  .pitch-metric { text-align: center; padding: 32px 16px; }
  .pitch-metric__value { font-size: 5rem; font-weight: 800; color: var(--mw-accent); letter-spacing: -0.04em; line-height: 1; font-variant-numeric: tabular-nums; }
  .pitch-metric__unit { font-size: 1.8rem; font-weight: 400; color: var(--mw-text-muted); margin-left: 2px; }
  .pitch-metric__label { font-size: 0.9rem; color: var(--mw-text-muted); margin-top: 14px; font-weight: 500; letter-spacing: 0.01em; }

  /* === Market Slide (TAM/SAM/SOM) — nested concentric circles === */
  .pitch-market { display: flex; flex-direction: column; height: 100%; padding: 48px 64px; box-sizing: border-box; }
  .pitch-market__headline { font-size: 2rem; font-weight: 700; color: var(--mw-text); margin-bottom: 20px; letter-spacing: -0.02em; }
  .pitch-market__rings { display: flex; align-items: center; justify-content: center; min-height: 300px; position: relative; margin: auto 0; }
  .pitch-market__ring { display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 50%; position: absolute; }
  .pitch-market__ring--tam { width: 420px; height: 420px; background: color-mix(in srgb, var(--mw-accent) 4%, var(--mw-surface)); border: 2px solid color-mix(in srgb, var(--mw-accent) 15%, var(--mw-border)); }
  .pitch-market__ring--sam { width: 290px; height: 290px; background: color-mix(in srgb, var(--mw-accent) 8%, var(--mw-surface)); border: 2px solid color-mix(in srgb, var(--mw-accent) 30%, var(--mw-border)); }
  .pitch-market__ring--som { width: 160px; height: 160px; background: color-mix(in srgb, var(--mw-accent) 15%, var(--mw-surface)); border: 2px solid var(--mw-accent); }
  .pitch-market__ring-value { font-size: 2rem; font-weight: 800; color: var(--mw-text); letter-spacing: -0.02em; }
  .pitch-market__ring--som .pitch-market__ring-value { color: var(--mw-accent); font-size: 1.8rem; }
  .pitch-market__ring-label { font-size: 0.72rem; color: var(--mw-text-muted); margin-top: 4px; text-align: center; max-width: 140px; line-height: 1.3; font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em; }
  .pitch-market__insight { margin-top: 16px; text-align: center; font-size: 1rem; font-weight: 600; color: var(--mw-accent); }
  .pitch-market__sources { margin-top: 8px; text-align: center; font-size: 0.72rem; color: var(--mw-text-muted); }

  /* === Competitor Matrix === */
  .pitch-competitor { display: flex; flex-direction: column; height: 100%; padding: 48px 64px; box-sizing: border-box; }
  .pitch-competitor__headline { font-size: 2rem; font-weight: 700; color: var(--mw-text); margin-bottom: 20px; letter-spacing: -0.02em; }
  .pitch-competitor__matrix { position: relative; min-height: 300px; border-left: 2px solid var(--mw-border); border-bottom: 2px solid var(--mw-border); border-radius: 0; background: transparent; overflow: visible; margin: auto 24px auto 36px; }
  .pitch-competitor__dot { position: absolute; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; gap: 6px; z-index: 2; }
  .pitch-competitor__dot-circle { width: 14px; height: 14px; border-radius: 50%; background: var(--mw-text-muted); opacity: 0.3; transition: all 0.2s; }
  .pitch-competitor__dot--highlight .pitch-competitor__dot-circle { width: 24px; height: 24px; background: var(--mw-accent); opacity: 1; box-shadow: 0 0 0 6px color-mix(in srgb, var(--mw-accent) 15%, transparent); }
  .pitch-competitor__dot-name { font-size: 0.8rem; font-weight: 500; color: var(--mw-text-muted); white-space: nowrap; }
  .pitch-competitor__dot--highlight .pitch-competitor__dot-name { color: var(--mw-accent); font-weight: 800; font-size: 0.9rem; }
  .pitch-competitor__midline-x { position: absolute; top: 50%; left: 0; right: 0; border-top: 1px dashed color-mix(in srgb, var(--mw-border) 60%, transparent); }
  .pitch-competitor__midline-y { position: absolute; left: 50%; top: 0; bottom: 0; border-left: 1px dashed color-mix(in srgb, var(--mw-border) 60%, transparent); }
  .pitch-competitor__label-low-x { position: absolute; bottom: -22px; left: 0; font-size: 0.72rem; color: var(--mw-text-muted); font-weight: 500; }
  .pitch-competitor__label-high-x { position: absolute; bottom: -22px; right: 0; font-size: 0.72rem; color: var(--mw-text-muted); font-weight: 500; }
  .pitch-competitor__label-low-y { position: absolute; left: -32px; bottom: 0; font-size: 0.72rem; color: var(--mw-text-muted); font-weight: 500; writing-mode: vertical-rl; }
  .pitch-competitor__label-high-y { position: absolute; left: -32px; top: 0; font-size: 0.72rem; color: var(--mw-text-muted); font-weight: 500; writing-mode: vertical-rl; }

  /* === Business Model === */
  .pitch-bizmodel { display: flex; flex-direction: column; height: 100%; padding: 48px 64px; box-sizing: border-box; }
  .pitch-bizmodel__headline { font-size: 2rem; font-weight: 700; color: var(--mw-text); margin-bottom: 28px; letter-spacing: -0.02em; }
  .pitch-bizmodel__tiers { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin: auto 0; }
  .pitch-bizmodel__tier { padding: 32px; background: var(--mw-surface); border: 1px solid var(--mw-border); border-radius: var(--mw-radius); display: flex; flex-direction: column; }
  .pitch-bizmodel__tier--popular { border-color: var(--mw-accent); border-width: 2px; background: color-mix(in srgb, var(--mw-accent) 3%, var(--mw-surface)); }
  .pitch-bizmodel__tier--popular::before { content: 'RECOMMENDED'; display: inline-block; font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--mw-accent); margin-bottom: 12px; }
  .pitch-bizmodel__name { font-size: 1.1rem; font-weight: 700; color: var(--mw-text); }
  .pitch-bizmodel__price { font-size: 2.5rem; font-weight: 800; color: var(--mw-text); margin-top: 8px; letter-spacing: -0.03em; }
  .pitch-bizmodel__tier--popular .pitch-bizmodel__price { color: var(--mw-accent); }
  .pitch-bizmodel__period { font-size: 0.85rem; font-weight: 400; color: var(--mw-text-muted); }
  .pitch-bizmodel__features { list-style: none; padding: 0; margin-top: 20px; flex: 1; }
  .pitch-bizmodel__features li { font-size: 0.85rem; color: var(--mw-text-muted); padding: 7px 0; border-bottom: 1px solid var(--mw-border); }
  .pitch-bizmodel__features li:last-child { border-bottom: none; }
  .pitch-bizmodel__features li::before { content: '✓ '; color: var(--mw-accent); font-weight: 700; }
  .pitch-bizmodel__note { margin-top: 20px; font-size: 0.9rem; color: var(--mw-text-muted); font-style: italic; }

  /* === Timeline === */
  .pitch-timeline { display: flex; flex-direction: column; height: 100%; padding: 48px 64px; box-sizing: border-box; }
  .pitch-timeline__headline { font-size: 2rem; font-weight: 700; color: var(--mw-text); margin-bottom: 36px; letter-spacing: -0.02em; }
  .pitch-timeline__track { display: flex; align-items: flex-start; gap: 0; position: relative; padding-top: 32px; margin: auto 0; }
  .pitch-timeline__track::before { content: ''; position: absolute; top: 40px; left: 40px; right: 40px; height: 3px; background: var(--mw-border); border-radius: 2px; }
  .pitch-timeline__item { flex: 1; display: flex; flex-direction: column; align-items: center; position: relative; text-align: center; padding: 0 8px; }
  .pitch-timeline__dot { width: 18px; height: 18px; border-radius: 50%; border: 3px solid var(--mw-border); background: var(--mw-bg); z-index: 1; margin-bottom: 18px; }
  .pitch-timeline__item--done .pitch-timeline__dot { background: var(--mw-accent); border-color: var(--mw-accent); }
  .pitch-timeline__item--active .pitch-timeline__dot { background: var(--mw-bg); border-color: var(--mw-accent); box-shadow: 0 0 0 6px color-mix(in srgb, var(--mw-accent) 15%, transparent); }
  .pitch-timeline__date { font-size: 0.75rem; color: var(--mw-text-muted); font-weight: 600; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.04em; }
  .pitch-timeline__title { font-size: 1rem; font-weight: 700; color: var(--mw-text); }
  .pitch-timeline__desc { font-size: 0.8rem; color: var(--mw-text-muted); margin-top: 6px; }

  /* === Team === */
  .pitch-team { display: flex; flex-direction: column; height: 100%; padding: 48px 64px; box-sizing: border-box; }
  .pitch-team__headline { font-size: 2rem; font-weight: 700; color: var(--mw-text); margin-bottom: 36px; letter-spacing: -0.02em; }
  .pitch-team__members { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; margin: auto 0; }
  .pitch-team__member { padding: 32px; background: var(--mw-surface); border: 1px solid var(--mw-border); border-radius: var(--mw-radius); }
  .pitch-team__avatar { width: 56px; height: 56px; border-radius: 50%; background: color-mix(in srgb, var(--mw-accent) 10%, var(--mw-surface-2)); display: flex; align-items: center; justify-content: center; font-size: 1.4rem; font-weight: 800; color: var(--mw-accent); margin-bottom: 18px; }
  .pitch-team__name { font-size: 1.2rem; font-weight: 700; color: var(--mw-text); letter-spacing: -0.01em; }
  .pitch-team__role { font-size: 0.85rem; color: var(--mw-accent); font-weight: 600; margin-top: 4px; }
  .pitch-team__exp { font-size: 0.82rem; color: var(--mw-text-muted); margin-top: 12px; line-height: 1.5; }
  .pitch-team__advisors { margin-top: 28px; padding-top: 24px; border-top: 1px solid var(--mw-border); }
  .pitch-team__advisors-title { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--mw-text-muted); font-weight: 700; margin-bottom: 14px; }
  .pitch-team__advisor { display: flex; align-items: center; gap: 12px; padding: 10px 0; }
  .pitch-team__advisor-name { font-size: 0.95rem; font-weight: 600; color: var(--mw-text); }
  .pitch-team__advisor-role { font-size: 0.8rem; color: var(--mw-text-muted); }

  /* === Ask Slide === */
  .pitch-ask { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; padding: 80px 64px; box-sizing: border-box; }
  .pitch-ask__headline { font-size: 3rem; font-weight: 800; color: var(--mw-text); letter-spacing: -0.03em; margin-bottom: 40px; }
  .pitch-ask__funds { display: flex; gap: 24px; margin-bottom: 36px; }
  .pitch-ask__fund { text-align: center; padding: 24px 36px; background: var(--mw-surface); border: 1px solid var(--mw-border); border-radius: var(--mw-radius); min-width: 140px; }
  .pitch-ask__fund-pct { font-size: 2.5rem; font-weight: 800; color: var(--mw-accent); letter-spacing: -0.02em; }
  .pitch-ask__fund-label { font-size: 0.8rem; color: var(--mw-text-muted); margin-top: 6px; font-weight: 600; }
  .pitch-ask__milestones { list-style: none; padding: 0; margin: 0; text-align: left; }
  .pitch-ask__milestones li { font-size: 1rem; color: var(--mw-text); padding: 8px 0; }
  .pitch-ask__milestones li::before { content: '→ '; color: var(--mw-accent); font-weight: 700; }
  .pitch-ask__contact { margin-top: 36px; padding-top: 24px; border-top: 1px solid var(--mw-border); font-size: 0.85rem; color: var(--mw-text-muted); letter-spacing: 0.02em; }

  /* === Chain Flow (A → B → C) === */
  .pitch-chain { display: flex; flex-direction: column; height: 100%; padding: 48px 64px; box-sizing: border-box; }
  .pitch-chain__headline { font-size: 2rem; font-weight: 700; color: var(--mw-text); margin-bottom: 36px; letter-spacing: -0.02em; max-width: 85%; }
  .pitch-chain__flow { display: flex; align-items: stretch; gap: 0; margin: auto 0; }
  .pitch-chain__step { flex: 1; padding: 28px 24px; display: flex; flex-direction: column; justify-content: center; border-radius: var(--mw-radius); background: var(--mw-surface); border: 1px solid var(--mw-border); }
  .pitch-chain__step--accent { background: var(--mw-accent); border-color: var(--mw-accent); }
  .pitch-chain__step--accent .pitch-chain__step-label { color: rgba(255,255,255,.6); }
  .pitch-chain__step--accent .pitch-chain__step-title { color: #fff; }
  .pitch-chain__step--accent .pitch-chain__step-desc { color: rgba(255,255,255,.7); }
  .pitch-chain__step-label { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600; color: var(--mw-text-muted); margin-bottom: 8px; }
  .pitch-chain__step-title { font-size: 1.1rem; font-weight: 700; color: var(--mw-text); }
  .pitch-chain__step-desc { font-size: 0.8rem; color: var(--mw-text-muted); margin-top: 6px; line-height: 1.4; }
  .pitch-chain__arrow { display: flex; align-items: center; padding: 0 12px; font-size: 1.4rem; color: var(--mw-accent); opacity: 0.4; }
  .pitch-chain__footer { margin-top: 20px; font-size: 0.82rem; color: var(--mw-text-muted); }

  /* === Compare Slide (Left vs Right) === */
  .pitch-compare { display: flex; flex-direction: column; height: 100%; padding: 48px 64px; box-sizing: border-box; }
  .pitch-compare__headline { font-size: 2rem; font-weight: 700; color: var(--mw-text); margin-bottom: 36px; letter-spacing: -0.02em; max-width: 85%; }
  .pitch-compare__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border-radius: var(--mw-radius); overflow: hidden; border: 1px solid var(--mw-border); margin: auto 0; }
  .pitch-compare__col { padding: 32px; display: flex; flex-direction: column; justify-content: center; }
  .pitch-compare__col--left { background: var(--mw-surface); }
  .pitch-compare__col--right { background: var(--mw-accent); color: #fff; }
  .pitch-compare__col-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; margin-bottom: 20px; }
  .pitch-compare__col--left .pitch-compare__col-label { color: var(--mw-text-muted); }
  .pitch-compare__col--right .pitch-compare__col-label { color: rgba(255,255,255,.5); }
  .pitch-compare__row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--mw-border); font-size: 0.95rem; }
  .pitch-compare__col--right .pitch-compare__row { border-color: rgba(255,255,255,.15); }
  .pitch-compare__row:last-child { border-bottom: none; }
  .pitch-compare__row-key { color: var(--mw-text-muted); font-size: 0.8rem; }
  .pitch-compare__col--right .pitch-compare__row-key { color: rgba(255,255,255,.5); }
  .pitch-compare__row-val { font-weight: 700; color: var(--mw-text); }
  .pitch-compare__col--right .pitch-compare__row-val { color: #fff; }
  .pitch-compare__note { margin-top: 20px; font-size: 0.85rem; font-weight: 600; color: var(--mw-text); }

  /* === Deep Dive Slide — v2-faithful + slides-grab minimal === */
  .pitch-deepdive { display:flex;flex-direction:column;height:100%;padding:2% 4%;box-sizing:border-box }
  .pitch-deepdive__role { display:flex;align-items:center;gap:3%;padding:2.5% 4%;border-radius:var(--mw-radius) var(--mw-radius) 0 0;background:var(--mw-surface);border:1px solid var(--mw-border);border-bottom:none }
  .pitch-deepdive__role-group {}
  .pitch-deepdive__role-label { font-size:clamp(8px,.7vw,10px);font-family:var(--mw-mono-font);letter-spacing:2px;text-transform:uppercase;font-weight:500;margin-bottom:2px }
  .pitch-deepdive__role-from .pitch-deepdive__role-label { color:var(--mw-accent) }
  .pitch-deepdive__role-to .pitch-deepdive__role-label { color:var(--mw-text-muted) }
  .pitch-deepdive__role-name { font-size:clamp(13px,1.3vw,18px);font-weight:700;color:var(--mw-text) }
  .pitch-deepdive__role-arrow { font-size:clamp(18px,1.8vw,24px);color:var(--mw-accent);opacity:.4 }
  .pitch-deepdive__role-msg { margin-left:auto;font-size:clamp(10px,.95vw,13px);color:var(--mw-text-muted);font-style:italic }
  .pitch-deepdive__grid { display:grid;grid-template-columns:repeat(var(--dd-cols,3),1fr);gap:0;border-radius:0 0 var(--mw-radius) var(--mw-radius);overflow:hidden;border:1px solid var(--mw-border);border-top:none;flex:1 }
  .pitch-deepdive__col { padding:3% 3%;border-right:1px solid var(--mw-border);display:flex;flex-direction:column }
  .pitch-deepdive__col:last-child { border-right:none }
  .pitch-deepdive__col-title { font-size:clamp(11px,1.1vw,14px);font-weight:700;color:var(--mw-accent);margin-bottom:10px;display:flex;align-items:center;gap:8px }
  .pitch-deepdive__col-title::before { content:'';width:6px;height:6px;border-radius:50%;background:var(--mw-accent);flex-shrink:0 }
  .pitch-deepdive__items { list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:0;flex:1 }
  .pitch-deepdive__item { padding:10px 0;border-bottom:1px solid var(--mw-border);flex:1;display:flex;flex-direction:column;justify-content:center }
  .pitch-deepdive__item:last-child { border-bottom:none }
  .pitch-deepdive__item-title { font-size:clamp(10px,1vw,13px);font-weight:600;color:var(--mw-text);display:block;margin-bottom:2px }
  .pitch-deepdive__item-desc { font-size:clamp(9px,.9vw,12px);color:var(--mw-text-muted);line-height:1.4 }

  /* === Quote Slide === */
  .pitch-quote { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 80px 100px; box-sizing: border-box; text-align: center; }
  .pitch-quote__mark { font-size: 4rem; line-height: 1; color: var(--mw-accent); opacity: 0.2; font-family: Georgia, serif; }
  .pitch-quote__text { font-size: 1.6rem; font-weight: 500; color: var(--mw-text); line-height: 1.5; margin-top: 8px; max-width: 720px; font-style: italic; letter-spacing: -0.01em; }
  .pitch-quote__attribution { margin-top: 28px; font-size: 0.85rem; color: var(--mw-accent); font-weight: 600; }
  .pitch-quote__source { font-size: 0.78rem; color: var(--mw-text-muted); margin-top: 4px; }
  .pitch-quote--left { align-items: flex-start; text-align: left; padding: 60px 64px; }
  .pitch-quote--left .pitch-quote__text { font-size: 1.35rem; }
  .pitch-quote--boxed { padding: 48px 64px; align-items: stretch; }
  .pitch-quote--boxed .pitch-quote__inner { padding: 36px 40px; border-left: 3px solid var(--mw-accent); background: color-mix(in srgb, var(--mw-accent) 4%, var(--mw-surface)); border-radius: 0 var(--mw-radius) var(--mw-radius) 0; text-align: left; }
  .pitch-quote--boxed .pitch-quote__text { font-size: 1.2rem; }

  /* === Callout (reusable bottom bar for any slide) === */
  .pitch-callout { margin-top: 20px; padding: 16px 24px; border-radius: var(--mw-radius); font-size: 0.9rem; font-weight: 600; color: var(--mw-text); line-height: 1.5; }
  .pitch-callout--accent { background: var(--mw-accent); color: #fff; }
  .pitch-callout--surface { background: var(--mw-surface); border: 1px solid var(--mw-border); }
  .pitch-callout--highlight { background: color-mix(in srgb, var(--mw-accent) 6%, var(--mw-surface)); border-left: 3px solid var(--mw-accent); border-radius: 0 var(--mw-radius) var(--mw-radius) 0; }

  /* === Reference Table === */
  .pitch-reftable { display: flex; flex-direction: column; height: 100%; padding: 48px 64px; box-sizing: border-box; }
  .pitch-reftable__headline { font-size: 2rem; font-weight: 700; color: var(--mw-text); margin-bottom: 28px; letter-spacing: -0.02em; }
  .pitch-reftable__table { width: 100%; border-collapse: separate; border-spacing: 0; border-radius: var(--mw-radius); overflow: hidden; border: 1px solid var(--mw-border); margin: auto 0; }
  .pitch-reftable__table th { background: var(--mw-surface); text-align: left; padding: 10px 14px; font-size: 0.75rem; font-weight: 600; color: var(--mw-accent); border-bottom: 2px solid var(--mw-accent); }
  .pitch-reftable__table td { padding: 10px 14px; vertical-align: top; border-bottom: 1px solid var(--mw-border); font-size: 0.82rem; color: var(--mw-text-muted); }
  .pitch-reftable__table tr:last-child td { border-bottom: none; }
  .pitch-reftable__table td strong { color: var(--mw-text); }
  .pitch-reftable__table tr.pitch-reftable--highlight { background: color-mix(in srgb, var(--mw-accent) 6%, transparent); }
  .pitch-reftable__table tr.pitch-reftable--highlight td { color: var(--mw-accent); font-weight: 600; }
  .pitch-reftable__footnote { margin-top: 12px; font-size: 0.7rem; color: var(--mw-text-muted); }

  /* === Flywheel Slide (node-and-edge infographic) === */
  .pitch-flywheel { display:flex;flex-direction:column;height:100%;padding:3% 4.5%;box-sizing:border-box }
  .pitch-flywheel__headline { font-size:clamp(18px,2.5vw,32px);font-weight:700;color:var(--mw-text);margin-bottom:1%;letter-spacing:-.02em;text-align:center }
  .pitch-flywheel__sub { font-size:clamp(11px,1.1vw,15px);color:var(--mw-text-muted);margin-bottom:2%;max-width:600px;line-height:1.5;text-align:center;margin-left:auto;margin-right:auto }
  .pitch-flywheel__canvas { flex:1;display:flex;align-items:center;justify-content:center;min-height:0 }
  .pitch-flywheel__svg { width:100%;height:100%;max-width:640px;max-height:480px }
  .pitch-flywheel__summary { margin-top:2%;padding:2% 3%;border-radius:var(--mw-radius);background:var(--mw-accent);color:#fff;display:flex;align-items:center;gap:3% }
  .pitch-flywheel__summary-icon { font-size:clamp(14px,1.4vw,22px);opacity:.4 }
  .pitch-flywheel__summary-title { font-size:clamp(11px,1vw,14px);font-weight:700 }
  .pitch-flywheel__summary-desc { font-size:clamp(9px,.85vw,12px);opacity:.7;margin-top:1px }

  /* === Story Slide (3-col Before → Action → Result) === */
  .pitch-story { display: flex; flex-direction: column; height: 100%; padding: 48px 64px; box-sizing: border-box; }
  .pitch-story__headline { font-size: 2rem; font-weight: 700; color: var(--mw-text); margin-bottom: 28px; letter-spacing: -0.02em; max-width: 85%; }
  .pitch-story__card { border-radius: var(--mw-radius); overflow: hidden; border: 1px solid var(--mw-border); margin: auto 0; }
  .pitch-story__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; }
  .pitch-story__cell { padding: 24px; border-right: 1px solid var(--mw-border); }
  .pitch-story__cell:last-child { border-right: none; }
  .pitch-story__tag { font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.12em; font-weight: 600; margin-bottom: 10px; }
  .pitch-story__cell:nth-child(1) .pitch-story__tag { color: var(--mw-text-muted); }
  .pitch-story__cell:nth-child(2) .pitch-story__tag { color: var(--mw-warning, #f59e0b); }
  .pitch-story__cell:nth-child(3) .pitch-story__tag { color: var(--mw-success, #22c55e); }
  .pitch-story__cell-title { font-size: 1rem; font-weight: 700; color: var(--mw-text); margin-bottom: 8px; }
  .pitch-story__cell-desc { font-size: 0.82rem; color: var(--mw-text-muted); line-height: 1.5; }
  .pitch-story__footer { padding: 16px 24px; background: var(--mw-surface); border-top: 1px solid var(--mw-border); font-size: 0.82rem; color: var(--mw-text-muted); }
  .pitch-story__flow { display: flex; align-items: center; gap: 0; margin-top: 16px; }
  .pitch-story__flow-step { flex: 1; padding: 10px 14px; border-radius: calc(var(--mw-radius) * 0.7); text-align: center; font-size: 0.82rem; font-weight: 600; background: var(--mw-surface); border: 1px solid var(--mw-border); color: var(--mw-text); }
  .pitch-story__flow-step:first-child { background: var(--mw-accent); color: #fff; border-color: var(--mw-accent); }
  .pitch-story__flow-arrow { padding: 0 8px; font-size: 1rem; color: var(--mw-accent); opacity: 0.4; }

  /* === SWOT Slide (2x2 matrix) === */
  .pitch-swot { display: flex; flex-direction: column; height: 100%; padding: 48px 64px; box-sizing: border-box; }
  .pitch-swot__headline { font-size: 2rem; font-weight: 700; color: var(--mw-text); margin-bottom: 28px; letter-spacing: -0.02em; }
  .pitch-swot__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border-radius: var(--mw-radius); overflow: hidden; border: 1px solid var(--mw-border); margin: auto 0; flex: 1; }
  .pitch-swot__quad { padding: 24px; display: flex; flex-direction: column; border-right: 1px solid var(--mw-border); border-bottom: 1px solid var(--mw-border); }
  .pitch-swot__quad:nth-child(2) { border-right: none; }
  .pitch-swot__quad:nth-child(3) { border-bottom: none; }
  .pitch-swot__quad:nth-child(4) { border-right: none; border-bottom: none; }
  .pitch-swot__quad-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; margin-bottom: 12px; }
  .pitch-swot__quad:nth-child(1) .pitch-swot__quad-label { color: var(--mw-accent); }
  .pitch-swot__quad:nth-child(2) .pitch-swot__quad-label { color: var(--mw-warning, #f59e0b); }
  .pitch-swot__quad:nth-child(3) .pitch-swot__quad-label { color: var(--mw-success, #22c55e); }
  .pitch-swot__quad:nth-child(4) .pitch-swot__quad-label { color: var(--mw-danger, #ef4444); }
  .pitch-swot__quad:nth-child(1) { background: color-mix(in srgb, var(--mw-accent) 4%, var(--mw-surface)); }
  .pitch-swot__quad:nth-child(2) { background: color-mix(in srgb, var(--mw-warning, #f59e0b) 4%, var(--mw-surface)); }
  .pitch-swot__quad:nth-child(3) { background: color-mix(in srgb, var(--mw-success, #22c55e) 4%, var(--mw-surface)); }
  .pitch-swot__quad:nth-child(4) { background: color-mix(in srgb, var(--mw-danger, #ef4444) 4%, var(--mw-surface)); }
  .pitch-swot__item { font-size: 0.82rem; color: var(--mw-text); padding: 6px 0; line-height: 1.4; }

  /* === Roadmap Slide (parallel-track Gantt) === */
  .pitch-roadmap { display: flex; flex-direction: column; height: 100%; padding: 48px 64px; box-sizing: border-box; }
  .pitch-roadmap__headline { font-size: 2rem; font-weight: 700; color: var(--mw-text); margin-bottom: 28px; letter-spacing: -0.02em; }
  .pitch-roadmap__periods { display: grid; gap: 0; margin-left: 100px; margin-bottom: 0; }
  .pitch-roadmap__period { text-align: center; font-size: 0.72rem; font-weight: 600; color: var(--mw-text-muted); text-transform: uppercase; letter-spacing: 0.06em; padding: 8px 0; border-bottom: 2px solid var(--mw-border); }
  .pitch-roadmap__track { display: flex; align-items: center; border-bottom: 1px solid var(--mw-border); min-height: 48px; }
  .pitch-roadmap__track-label { width: 100px; flex-shrink: 0; font-size: 0.8rem; font-weight: 600; color: var(--mw-text); padding-right: 16px; }
  .pitch-roadmap__track-bars { display: grid; gap: 0; flex: 1; position: relative; min-height: 48px; align-items: center; }
  .pitch-roadmap__bar { border-radius: 4px; padding: 6px 12px; font-size: 0.72rem; font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .pitch-roadmap__bar--accent { background: var(--mw-accent); }
  .pitch-roadmap__bar--muted { background: var(--mw-text-muted); opacity: 0.3; }
  .pitch-roadmap__bar--surface { background: var(--mw-surface-2); color: var(--mw-text); border: 1px solid var(--mw-border); }

  /* === Feature Slide (icon + title + desc grid) === */
  .pitch-features { display: flex; flex-direction: column; height: 100%; padding: 48px 64px; box-sizing: border-box; }
  .pitch-features__headline { font-size: 2rem; font-weight: 700; color: var(--mw-text); margin-bottom: 36px; letter-spacing: -0.02em; max-width: 85%; }
  .pitch-features__grid { display: grid; gap: 20px; margin: auto 0; }
  .pitch-features__item { padding: 24px; background: var(--mw-surface); border: 1px solid var(--mw-border); border-radius: var(--mw-radius); }
  .pitch-features__icon { font-size: 1.6rem; margin-bottom: 12px; }
  .pitch-features__title { font-size: 1rem; font-weight: 700; color: var(--mw-text); margin-bottom: 6px; }
  .pitch-features__desc { font-size: 0.82rem; color: var(--mw-text-muted); line-height: 1.5; }

  /* (Sidebar provided by maging-sidebar.js) */
`;
  document.head.appendChild(_style);

  // ── 2. Pitch-specific widgets ───────────────────────────────────────────────
  // NOTE: widget functions are registered in registerWidgets() which is called
  // at maging:ready time, when window.Maging is guaranteed to be the real object.
  function registerWidgets(M) {

  M.pitchCover = function (sel, cfg) {
    const el = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!el) return;
    const { company = '', tagline = '', logo = '', subtitle = '', style = 'bold' } = cfg;
    el.innerHTML = `
      <div class="pitch-cover pitch-cover--${style}">
        ${logo ? '<div class="pitch-cover__logo">' + logo + '</div>' : ''}
        <div class="pitch-cover__company">${company}</div>
        ${tagline ? '<div class="pitch-cover__tagline">' + tagline + '</div>' : ''}
        ${subtitle ? '<div class="pitch-cover__subtitle">' + subtitle + '</div>' : ''}
      </div>`;
  };

  M.problemSlide = function (sel, cfg) {
    const el = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!el) return;
    const { headline = '', points = [], highlight = '' } = cfg;
    el.innerHTML = `
      <div class="pitch-problem">
        <div class="pitch-problem__headline">${headline}</div>
        <div class="pitch-problem__points">
          ${points.map(p => `
            <div class="pitch-problem__point">
              <div class="pitch-problem__icon">${p.icon || ''}</div>
              <div class="pitch-problem__title">${p.title}</div>
              <div class="pitch-problem__desc">${p.desc}</div>
            </div>`).join('')}
        </div>
        ${highlight ? '<div class="pitch-problem__highlight">' + highlight + '</div>' : ''}
      </div>`;
  };

  M.solutionSlide = function (sel, cfg) {
    const el = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!el) return;
    const { headline = '', before, after, features } = cfg;
    let body = '';
    if (before && after) {
      body = `<div class="pitch-solution__compare">
        <div class="pitch-solution__col pitch-solution__col--before">
          <div class="pitch-solution__col-label">${before.label || 'Before'}</div>
          ${before.items.map(i => '<div class="pitch-solution__item">' + i + '</div>').join('')}
        </div>
        <div class="pitch-solution__col pitch-solution__col--after">
          <div class="pitch-solution__col-label">${after.label || 'After'}</div>
          ${after.items.map(i => '<div class="pitch-solution__item">' + i + '</div>').join('')}
        </div>
      </div>`;
    } else if (features) {
      body = `<div class="pitch-solution__features">
        ${features.map(f => `
          <div class="pitch-solution__feat">
            <span class="pitch-solution__feat-icon">${f.icon || ''}</span>
            <span class="pitch-solution__feat-label">${f.label}</span>
          </div>`).join('')}
      </div>`;
    }
    el.innerHTML = `
      <div class="pitch-solution">
        <div class="pitch-solution__headline">${headline}</div>
        ${body}
      </div>`;
  };

  M.metricHighlight = function (sel, cfg) {
    const el = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!el) return;
    const { metrics = [] } = cfg;
    el.innerHTML = `
      <div class="pitch-metrics">
        ${metrics.map(m => `
          <div class="pitch-metric">
            <div class="pitch-metric__value">${m.value}<span class="pitch-metric__unit">${m.unit || ''}</span></div>
            <div class="pitch-metric__label">${m.label}</div>
          </div>`).join('')}
      </div>`;
  };

  M.marketSlide = function (sel, cfg) {
    const el = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!el) return;
    const { headline = '', tam, sam, som, insight = '', sources = [] } = cfg;
    el.innerHTML = `
      <div class="pitch-market">
        ${headline ? '<div class="pitch-market__headline">' + headline + '</div>' : ''}
        <div class="pitch-market__rings">
          <div class="pitch-market__ring pitch-market__ring--tam">
            <div class="pitch-market__ring-value">${tam.value}</div>
            <div class="pitch-market__ring-label">${tam.label}</div>
          </div>
          <div class="pitch-market__ring pitch-market__ring--sam">
            <div class="pitch-market__ring-value">${sam.value}</div>
            <div class="pitch-market__ring-label">${sam.label}</div>
          </div>
          <div class="pitch-market__ring pitch-market__ring--som">
            <div class="pitch-market__ring-value">${som.value}</div>
            <div class="pitch-market__ring-label">${som.label}</div>
          </div>
        </div>
        ${insight ? '<div class="pitch-market__insight">' + insight + '</div>' : ''}
        ${sources.length ? '<div class="pitch-market__sources">Source: ' + sources.join(', ') + '</div>' : ''}
      </div>`;
  };

  M.competitorMatrix = function (sel, cfg) {
    const el = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!el) return;
    const { headline = '', axisX = {}, axisY = {}, players = [] } = cfg;
    const dots = players.map(p => {
      const left = 10 + (p.x / 100) * 80;
      const top  = 10 + ((100 - p.y) / 100) * 80;
      return `<div class="pitch-competitor__dot${p.highlight ? ' pitch-competitor__dot--highlight' : ''}" style="left:${left}%;top:${top}%">
        <div class="pitch-competitor__dot-circle"></div>
        <div class="pitch-competitor__dot-name">${p.name}</div>
      </div>`;
    }).join('');
    el.innerHTML = `
      <div class="pitch-competitor">
        ${headline ? '<div class="pitch-competitor__headline">' + headline + '</div>' : ''}
        <div class="pitch-competitor__matrix">
          <div class="pitch-competitor__midline-x"></div>
          <div class="pitch-competitor__midline-y"></div>
          <div class="pitch-competitor__label-low-x">${axisX.low || ''}</div>
          <div class="pitch-competitor__label-high-x">${axisX.high || ''}</div>
          <div class="pitch-competitor__label-high-y">${axisY.high || ''}</div>
          <div class="pitch-competitor__label-low-y">${axisY.low || ''}</div>
          ${dots}
        </div>
      </div>`;
  };

  M.bizModelSlide = function (sel, cfg) {
    const el = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!el) return;
    const { headline = '', tiers = [], note = '' } = cfg;
    el.innerHTML = `
      <div class="pitch-bizmodel">
        ${headline ? '<div class="pitch-bizmodel__headline">' + headline + '</div>' : ''}
        <div class="pitch-bizmodel__tiers">
          ${tiers.map(t => `
            <div class="pitch-bizmodel__tier${t.popular ? ' pitch-bizmodel__tier--popular' : ''}">
              <div class="pitch-bizmodel__name">${t.name}</div>
              <div class="pitch-bizmodel__price">${t.price}${t.period ? '<span class="pitch-bizmodel__period">' + t.period + '</span>' : ''}</div>
              <ul class="pitch-bizmodel__features">
                ${t.features.map(f => '<li>' + f + '</li>').join('')}
              </ul>
            </div>`).join('')}
        </div>
        ${note ? '<div class="pitch-bizmodel__note">' + note + '</div>' : ''}
      </div>`;
  };

  M.timelineSlide = function (sel, cfg) {
    const el = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!el) return;
    const { headline = '', milestones = [] } = cfg;
    el.innerHTML = `
      <div class="pitch-timeline">
        ${headline ? '<div class="pitch-timeline__headline">' + headline + '</div>' : ''}
        <div class="pitch-timeline__track">
          ${milestones.map(m => `
            <div class="pitch-timeline__item${m.done ? ' pitch-timeline__item--done' : ''}${m.active ? ' pitch-timeline__item--active' : ''}">
              <div class="pitch-timeline__dot"></div>
              <div class="pitch-timeline__date">${m.date}</div>
              <div class="pitch-timeline__title">${m.title}</div>
              ${m.desc ? '<div class="pitch-timeline__desc">' + m.desc + '</div>' : ''}
            </div>`).join('')}
        </div>
      </div>`;
  };

  M.teamSlide = function (sel, cfg) {
    const el = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!el) return;
    const { headline = '팀', members = [], advisors = [] } = cfg;
    el.innerHTML = `
      <div class="pitch-team">
        <div class="pitch-team__headline">${headline}</div>
        <div class="pitch-team__members">
          ${members.map(m => `
            <div class="pitch-team__member">
              <div class="pitch-team__avatar">${m.name.charAt(0)}</div>
              <div class="pitch-team__name">${m.name}</div>
              <div class="pitch-team__role">${m.role}</div>
              ${m.exp ? '<div class="pitch-team__exp">' + m.exp + '</div>' : ''}
            </div>`).join('')}
        </div>
        ${advisors.length ? `
          <div class="pitch-team__advisors">
            <div class="pitch-team__advisors-title">Advisors</div>
            ${advisors.map(a => `
              <div class="pitch-team__advisor">
                <span class="pitch-team__advisor-name">${a.name}</span>
                <span class="pitch-team__advisor-role">${a.role}</span>
              </div>`).join('')}
          </div>` : ''}
      </div>`;
  };

  M.askSlide = function (sel, cfg) {
    const el = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!el) return;
    const { headline = '', useOfFunds = [], milestones = [], contact } = cfg;
    el.innerHTML = `
      <div class="pitch-ask">
        <div class="pitch-ask__headline">${headline}</div>
        ${useOfFunds.length ? `<div class="pitch-ask__funds">
          ${useOfFunds.map(f => `
            <div class="pitch-ask__fund">
              <div class="pitch-ask__fund-pct">${f.pct}%</div>
              <div class="pitch-ask__fund-label">${f.label}</div>
            </div>`).join('')}
        </div>` : ''}
        ${milestones.length ? `<ul class="pitch-ask__milestones">
          ${milestones.map(m => '<li>' + m + '</li>').join('')}
        </ul>` : ''}
        ${contact ? `<div class="pitch-ask__contact">${contact.email || ''} · ${contact.website || ''}</div>` : ''}
      </div>`;
  };

  M.chainFlow = function (sel, cfg) {
    const el = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!el) return;
    const { headline = '', steps = [], footer = '', callout = '' } = cfg;
    const calloutHTML = callout ? '<div class="pitch-callout pitch-callout--surface">' + callout + '</div>' : '';
    el.innerHTML = `
      <div class="pitch-chain">
        ${headline ? '<div class="pitch-chain__headline">' + headline + '</div>' : ''}
        <div class="pitch-chain__flow">
          ${steps.map((s, i) => {
            const arrow = i < steps.length - 1 ? '<div class="pitch-chain__arrow">→</div>' : '';
            return `<div class="pitch-chain__step${s.accent ? ' pitch-chain__step--accent' : ''}">
              ${s.label ? '<div class="pitch-chain__step-label">' + s.label + '</div>' : ''}
              <div class="pitch-chain__step-title">${s.title}</div>
              ${s.desc ? '<div class="pitch-chain__step-desc">' + s.desc + '</div>' : ''}
            </div>${arrow}`;
          }).join('')}
        </div>
        ${footer ? '<div class="pitch-chain__footer">' + footer + '</div>' : ''}
        ${calloutHTML}
      </div>`;
  };

  M.compareSlide = function (sel, cfg) {
    const el = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!el) return;
    const { headline = '', left = {}, right = {}, note = '', callout = '' } = cfg;
    function renderRows(rows) {
      return rows.map(r => `<div class="pitch-compare__row">
        <span class="pitch-compare__row-key">${r.key}</span>
        <span class="pitch-compare__row-val">${r.value}</span>
      </div>`).join('');
    }
    const calloutHTML = callout ? '<div class="pitch-callout pitch-callout--surface">' + callout + '</div>' : '';
    el.innerHTML = `
      <div class="pitch-compare">
        ${headline ? '<div class="pitch-compare__headline">' + headline + '</div>' : ''}
        <div class="pitch-compare__grid">
          <div class="pitch-compare__col pitch-compare__col--left">
            <div class="pitch-compare__col-label">${left.label || 'Before'}</div>
            ${renderRows(left.rows || [])}
          </div>
          <div class="pitch-compare__col pitch-compare__col--right">
            <div class="pitch-compare__col-label">${right.label || 'After'}</div>
            ${renderRows(right.rows || [])}
          </div>
        </div>
        ${note ? '<div class="pitch-compare__note">' + note + '</div>' : ''}
        ${calloutHTML}
      </div>`;
  };

  // ── Deep Dive Slide ──────────────────────────────────────────────────────
  M.deepDiveSlide = function (sel, cfg) {
    const el = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!el) return;
    const { role, columns = [], callout = '' } = cfg;
    const roleHTML = role ? `
      <div class="pitch-deepdive__role">
        <div class="pitch-deepdive__role-group pitch-deepdive__role-from">
          <div class="pitch-deepdive__role-label">${role.from?.label || 'From'}</div>
          <div class="pitch-deepdive__role-name">${role.from?.name || ''}</div>
        </div>
        <div class="pitch-deepdive__role-arrow">→</div>
        <div class="pitch-deepdive__role-group pitch-deepdive__role-to">
          <div class="pitch-deepdive__role-label">${role.to?.label || 'To'}</div>
          <div class="pitch-deepdive__role-name">${role.to?.name || ''}</div>
        </div>
        ${role.message ? '<div class="pitch-deepdive__role-msg">' + role.message + '</div>' : ''}
      </div>` : '';
    const gridHTML = columns.map(c => `
      <div class="pitch-deepdive__col">
        <div class="pitch-deepdive__col-title">${c.title}</div>
        <div class="pitch-deepdive__items">
          ${(c.items || []).map(it => `
            <div class="pitch-deepdive__item">
              <div class="pitch-deepdive__item-title">${it.title}</div>
              ${it.desc ? '<div class="pitch-deepdive__item-desc">' + it.desc + '</div>' : ''}
            </div>`).join('')}
        </div>
      </div>`).join('');
    const calloutHTML = callout ? '<div class="pitch-callout pitch-callout--surface">' + callout + '</div>' : '';
    const colCount = columns.length || 3;
    el.innerHTML = `
      <div class="pitch-deepdive">
        ${roleHTML}
        <div class="pitch-deepdive__grid" style="--dd-cols:${colCount}">${gridHTML}</div>
        ${calloutHTML}
      </div>`;
  };

  // ── Quote Slide ─────────────────────────────────────────────────────────
  M.quoteSlide = function (sel, cfg) {
    const el = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!el) return;
    const { quote = '', attribution = '', source = '', style = 'center' } = cfg;
    if (style === 'boxed') {
      el.innerHTML = `
        <div class="pitch-quote pitch-quote--boxed">
          <div class="pitch-quote__inner">
            <div class="pitch-quote__text">${quote}</div>
            ${attribution ? '<div class="pitch-quote__attribution">— ' + attribution + '</div>' : ''}
            ${source ? '<div class="pitch-quote__source">' + source + '</div>' : ''}
          </div>
        </div>`;
    } else {
      el.innerHTML = `
        <div class="pitch-quote${style === 'left' ? ' pitch-quote--left' : ''}">
          <div class="pitch-quote__mark">"</div>
          <div class="pitch-quote__text">${quote}</div>
          ${attribution ? '<div class="pitch-quote__attribution">— ' + attribution + '</div>' : ''}
          ${source ? '<div class="pitch-quote__source">' + source + '</div>' : ''}
        </div>`;
    }
  };

  // ── Reference Table ─────────────────────────────────────────────────────
  M.referenceTable = function (sel, cfg) {
    const el = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!el) return;
    const { headline = '', columns = [], rows = [], footnote = '', callout = '' } = cfg;
    const thead = columns.length ? '<thead><tr>' + columns.map(c => '<th>' + c + '</th>').join('') + '</tr></thead>' : '';
    const tbody = rows.map(r => {
      const cls = r.highlight ? ' class="pitch-reftable--highlight"' : '';
      return '<tr' + cls + '>' + (r.values || []).map(v => '<td>' + v + '</td>').join('') + '</tr>';
    }).join('');
    const calloutHTML = callout ? '<div class="pitch-callout pitch-callout--surface">' + callout + '</div>' : '';
    el.innerHTML = `
      <div class="pitch-reftable">
        ${headline ? '<div class="pitch-reftable__headline">' + headline + '</div>' : ''}
        <table class="pitch-reftable__table">${thead}<tbody>${tbody}</tbody></table>
        ${footnote ? '<div class="pitch-reftable__footnote">' + footnote + '</div>' : ''}
        ${calloutHTML}
      </div>`;
  };

  // ── Flywheel Slide (node-and-edge infographic style) ────────────────────
  M.flywheelSlide = function (sel, cfg) {
    const el = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!el) return;
    const { headline = '', sub = '', steps = [], summary, hub = '', callout = '' } = cfg;
    const n = steps.length || 4;
    const W = 640, H = 440, cx = W/2, cy = H/2 + 10;
    const R = 130; // circle radius for nodes
    const nodeSize = 36; // icon box size
    const toRad = d => (d-90)*Math.PI/180;
    const px = (r,a) => cx+r*Math.cos(toRad(a));
    const py = (r,a) => cy+r*Math.sin(toRad(a));
    const f = v => v.toFixed(1);
    const iconColors = ['var(--mw-accent)','#22c55e','#f59e0b','#3b82f6','#ec4899','#8b5cf6'];
    const defaultIcons = ['⚡','🔄','📤','💪','🚀','📊'];
    let svg = '<svg class="pitch-flywheel__svg" viewBox="0 0 '+W+' '+H+'" xmlns="http://www.w3.org/2000/svg" style="font-family:var(--mw-font,sans-serif)">';
    // Circular arrow path — thin gray line with arrowheads between nodes
    var arrowR = R;
    for (let i = 0; i < n; i++) {
      var a1 = i*(360/n) + 18; // start after node
      var a2 = (i+1)*(360/n) - 18; // end before next node
      var large = (a2-a1)>180?1:0;
      // Arc
      svg += '<path d="M'+f(px(arrowR,a1))+','+f(py(arrowR,a1))+' A'+arrowR+','+arrowR+' 0 '+large+' 1 '+f(px(arrowR,a2))+','+f(py(arrowR,a2))+'" fill="none" stroke="var(--mw-border)" stroke-width="1.5"/>';
      // Arrowhead at end
      var tipA = a2+3, baseA = a2-4;
      var tipX = px(arrowR,tipA), tipY = py(arrowR,tipA);
      var b1x = px(arrowR+6,baseA), b1y = py(arrowR+6,baseA);
      var b2x = px(arrowR-6,baseA), b2y = py(arrowR-6,baseA);
      svg += '<path d="M'+f(tipX)+','+f(tipY)+' L'+f(b1x)+','+f(b1y)+' L'+f(b2x)+','+f(b2y)+'Z" fill="var(--mw-text-muted)" opacity="0.4"/>';
    }
    // Central icon
    svg += '<circle cx="'+cx+'" cy="'+cy+'" r="32" fill="none" stroke="var(--mw-border)" stroke-width="1"/>';
    svg += '<text x="'+cx+'" y="'+cy+'" text-anchor="middle" dominant-baseline="central" font-size="20" fill="var(--mw-text-muted)" opacity="0.3">'+(hub?'':'⚙')+'</text>';
    if (hub) svg += '<text x="'+cx+'" y="'+cy+'" text-anchor="middle" dominant-baseline="central" font-size="10" font-weight="600" fill="var(--mw-text-muted)">'+hub+'</text>';
    // Nodes + labels
    for (let i = 0; i < n; i++) {
      var angle = i*(360/n);
      var nx = px(R,angle), ny = py(R,angle);
      var icon = steps[i].icon || defaultIcons[i%defaultIcons.length];
      var color = iconColors[i%iconColors.length];
      var hs = nodeSize/2;
      // Icon box — rounded rect with color bg
      svg += '<rect x="'+f(nx-hs)+'" y="'+f(ny-hs)+'" width="'+nodeSize+'" height="'+nodeSize+'" rx="8" fill="'+color+'" opacity="0.12"/>';
      svg += '<text x="'+f(nx)+'" y="'+f(ny)+'" text-anchor="middle" dominant-baseline="central" font-size="18">'+icon+'</text>';
      // Label — positioned outside the circle
      var labelR = R + 56;
      var lx = px(labelR, angle), ly = py(labelR, angle);
      var anchor = 'middle';
      if (angle > 30 && angle < 150) anchor = 'start';
      if (angle > 210 && angle < 330) anchor = 'end';
      svg += '<text x="'+f(lx)+'" y="'+f(ly-7)+'" text-anchor="'+anchor+'" font-size="12" font-weight="700" fill="var(--mw-text)">'+(i+1)+'. '+steps[i].title+'</text>';
      if (steps[i].desc) svg += '<text x="'+f(lx)+'" y="'+f(ly+8)+'" text-anchor="'+anchor+'" font-size="9" fill="var(--mw-text-muted)">'+steps[i].desc+'</text>';
    }
    svg += '</svg>';
    const sumHTML = summary?'<div class="pitch-flywheel__summary"><div class="pitch-flywheel__summary-icon">↻</div><div><div class="pitch-flywheel__summary-title">'+summary.title+'</div>'+(summary.desc?'<div class="pitch-flywheel__summary-desc">'+summary.desc+'</div>':'')+'</div></div>':'';
    const calloutHTML = callout?'<div class="pitch-callout pitch-callout--surface">'+callout+'</div>':'';
    el.innerHTML = '<div class="pitch-flywheel">'+
      (headline?'<div class="pitch-flywheel__headline">'+headline+'</div>':'')+
      (sub?'<div class="pitch-flywheel__sub">'+sub+'</div>':'')+
      '<div class="pitch-flywheel__canvas">'+svg+'</div>'+
      sumHTML+calloutHTML+'</div>';
  };

  // ── Story Slide (3-col Before → Action → Result) ───────────────────────
  M.storySlide = function (sel, cfg) {
    const el = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!el) return;
    const { headline = '', chapters = [], footer = '', flow = [], callout = '' } = cfg;
    const chaptersHTML = chapters.map(c => `
      <div class="pitch-story__cell">
        <div class="pitch-story__tag">${c.tag || ''}</div>
        <div class="pitch-story__cell-title">${c.title}</div>
        <div class="pitch-story__cell-desc">${c.desc}</div>
      </div>`).join('');
    const flowHTML = flow.length ? `
      <div class="pitch-story__flow">
        ${flow.map((f, i) => {
          const arrow = i < flow.length - 1 ? '<div class="pitch-story__flow-arrow">→</div>' : '';
          return '<div class="pitch-story__flow-step">' + f + '</div>' + arrow;
        }).join('')}
      </div>` : '';
    const calloutHTML = callout ? '<div class="pitch-callout pitch-callout--surface">' + callout + '</div>' : '';
    el.innerHTML = `
      <div class="pitch-story">
        ${headline ? '<div class="pitch-story__headline">' + headline + '</div>' : ''}
        <div class="pitch-story__card">
          <div class="pitch-story__grid">${chaptersHTML}</div>
          ${footer ? '<div class="pitch-story__footer">' + footer + '</div>' : ''}
        </div>
        ${flowHTML}
        ${calloutHTML}
      </div>`;
  };

  // ── SWOT Slide (2x2 matrix) ─────────────────────────────────────────────
  M.swotSlide = function (sel, cfg) {
    const el = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!el) return;
    const { headline = '', quadrants = [], callout = '' } = cfg;
    const quadsHTML = quadrants.map(q => `
      <div class="pitch-swot__quad">
        <div class="pitch-swot__quad-label">${q.label}</div>
        ${(q.items || []).map(it => '<div class="pitch-swot__item">• ' + it + '</div>').join('')}
      </div>`).join('');
    const calloutHTML = callout ? '<div class="pitch-callout pitch-callout--surface">' + callout + '</div>' : '';
    el.innerHTML = `
      <div class="pitch-swot">
        ${headline ? '<div class="pitch-swot__headline">' + headline + '</div>' : ''}
        <div class="pitch-swot__grid">${quadsHTML}</div>
        ${calloutHTML}
      </div>`;
  };

  // ── Roadmap Slide (parallel-track Gantt) ─────────────────────────────────
  M.roadmapSlide = function (sel, cfg) {
    const el = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!el) return;
    const { headline = '', periods = [], tracks = [], callout = '' } = cfg;
    const n = periods.length || 4;
    const periodsHTML = `<div class="pitch-roadmap__periods" style="grid-template-columns:repeat(${n},1fr)">
      ${periods.map(p => '<div class="pitch-roadmap__period">' + p + '</div>').join('')}</div>`;
    const tracksHTML = tracks.map(t => {
      const bars = (t.items || []).map(it => {
        const col = 'grid-column:' + (it.start + 1) + '/' + (it.end + 2);
        const cls = it.style || 'accent';
        return '<div class="pitch-roadmap__bar pitch-roadmap__bar--' + cls + '" style="' + col + '">' + it.title + '</div>';
      }).join('');
      return `<div class="pitch-roadmap__track">
        <div class="pitch-roadmap__track-label">${t.label}</div>
        <div class="pitch-roadmap__track-bars" style="grid-template-columns:repeat(${n},1fr)">${bars}</div>
      </div>`;
    }).join('');
    const calloutHTML = callout ? '<div class="pitch-callout pitch-callout--surface">' + callout + '</div>' : '';
    el.innerHTML = `
      <div class="pitch-roadmap">
        ${headline ? '<div class="pitch-roadmap__headline">' + headline + '</div>' : ''}
        ${periodsHTML}
        ${tracksHTML}
        ${calloutHTML}
      </div>`;
  };

  // ── Feature Slide (icon + title + desc grid) ────────────────────────────
  M.featureSlide = function (sel, cfg) {
    const el = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!el) return;
    const { headline = '', items = [], cols = 3, callout = '' } = cfg;
    const itemsHTML = items.map(it => `
      <div class="pitch-features__item">
        ${it.icon ? '<div class="pitch-features__icon">' + it.icon + '</div>' : ''}
        <div class="pitch-features__title">${it.title}</div>
        ${it.desc ? '<div class="pitch-features__desc">' + it.desc + '</div>' : ''}
      </div>`).join('');
    const calloutHTML = callout ? '<div class="pitch-callout pitch-callout--surface">' + callout + '</div>' : '';
    el.innerHTML = `
      <div class="pitch-features">
        ${headline ? '<div class="pitch-features__headline">' + headline + '</div>' : ''}
        <div class="pitch-features__grid" style="grid-template-columns:repeat(${cols},1fr)">${itemsHTML}</div>
        ${calloutHTML}
      </div>`;
  };

  } // end registerWidgets

  // ── 3. Deck infrastructure (sidebar provided by maging-sidebar.js) ─────────────────────────────────────────────────
  function initDeck(MOUNT) {
    const slides = [...document.querySelectorAll('section.slide')];
    const mounted = {};
    slides.forEach((s, i) => {
      s.classList.add('mw-slide');
      if (s.classList.contains('cover-slide')) return;
      const label = s.dataset.label || '';
      const content = s.innerHTML;
      const header = label ? '<div class="mw-slide__header"><span class="mw-slide__label">' + label + '</span><span class="mw-slide__page">' + (i+1) + ' / ' + slides.length + '</span></div>' : '';
      s.innerHTML = header + '<div class="mw-slide__body">' + content + '</div>';
    });

    // Inject shared bottom nav bar
    if (window._magingNavBar) window._magingNavBar(slides.length);
    const indEl = document.getElementById('deck-ind');

    function go(id) {
      const t = slides.find(s => s.id === id);
      if (!t) return;
      slides.forEach(s => s.toggleAttribute('data-active', s === t));
      history.replaceState(null, '', '#' + id);
      if (!mounted[id]) { mounted[id] = true; MOUNT[id]?.(); }
      document.querySelectorAll('maging-sidebar .wrs__link').forEach(a => a.classList.toggle('wrs__link--active', a.dataset.nav === id));
      const head = document.querySelector('maging-sidebar .wrs__head');
      if (head) head.classList.toggle('wrs__head--active', id === 'cover');
      const idx = slides.indexOf(t);
      if (indEl) indEl.innerHTML = (idx + 1) + ' <span class="wrn-bar__sep">/</span> ' + slides.length;
    }
    function ofs(d) { const i = slides.findIndex(s => s.hasAttribute('data-active')); go(slides[Math.max(0, Math.min(slides.length-1, i+d))].id); }
    function scale() { if (window._magingScaleSlides) window._magingScaleSlides(slides); }
    addEventListener('resize', scale); scale();
    addEventListener('keydown', e => {
      if (e.target.closest?.('input,textarea,select,[contenteditable]')) return;
      const k = e.key;
      if (k==='ArrowRight'||k==='ArrowDown'||k==='PageDown'||k===' ') { e.preventDefault(); e.stopPropagation(); ofs(1); }
      else if (k==='ArrowLeft'||k==='ArrowUp'||k==='PageUp') { e.preventDefault(); e.stopPropagation(); ofs(-1); }
      else if (k==='Home') { e.preventDefault(); go(slides[0].id); }
      else if (k==='End') { e.preventDefault(); go(slides[slides.length-1].id); }
      else if (k==='f'||k==='F') { e.preventDefault(); document.body.classList.toggle('presenter-mode'); scale(); }
      else if (k==='Escape'&&document.body.classList.contains('presenter-mode')) { e.preventDefault(); document.body.classList.remove('presenter-mode'); scale(); }
    });
    document.addEventListener('click', e => {
      const nav = e.target.closest('[data-nav]');
      if (nav) { e.preventDefault(); go(nav.dataset.nav); return; }
      if (e.target.closest('#deck-fs')) { document.body.classList.toggle('presenter-mode'); scale(); }
    });
    addEventListener('hashchange', () => { const id = location.hash.slice(1); if (id && slides.find(s => s.id === id)) go(id); });
    const h = location.hash.slice(1);
    go(h && slides.find(s => s.id === h) ? h : slides[0].id);
  }

  // ── 4. Expose & auto-init ──────────────────────────────────────────────────
  if (window.Maging) { registerWidgets(window.Maging); }
  window.addEventListener('maging:ready', () => {
    if (window.Maging) { registerWidgets(window.Maging); }
    // Use setTimeout(0) to ensure inline script's maging:ready handler
    // (which sets DECK_MOUNT) has run first — critical when maging:ready
    // replays synchronously during addEventListener() call.
    setTimeout(() => {
      if (window.DECK_MOUNT) initDeck(window.DECK_MOUNT);
    }, 0);
  });
})();
