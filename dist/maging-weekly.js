/**
 * maging-weekly.js — Weekly Report deck infrastructure
 *
 * Load after maging.js + maging-sidebar.js. Injects CSS
 * and exposes Maging.deck(MOUNT) API.
 *
 * Usage:
 *   <script defer src="maging-weekly.js"></script>
 *   ...
 *   window.addEventListener('maging:ready', () => {
 *     const { pageHeader, kpiCard, ... } = Maging;
 *     // define mount functions ...
 *     Maging.deck({ cover: mountCover, 'slide-id': mountSlide });
 *   });
 */

(function () {
  // ── 1. CSS injection ───────────────────────────────────────────────────────
  const _style = document.createElement('style');
  _style.textContent = `
  .slide { display: none; }
  .slide[data-active] { display: flex; flex-direction: column; }

  .table-block { display: flex; flex-direction: column; gap: var(--mw-space-2); }
  .table-toolbar { display: flex; align-items: center; justify-content: space-between; padding: 0 var(--mw-space-1); margin-bottom: var(--mw-space-3); }
  .table-toolbar__title { font-size: var(--mw-text-base); font-weight: 600; color: var(--mw-text); }
  .table-toolbar__sub   { font-size: var(--mw-text-sm); color: var(--mw-text-muted); margin-left: var(--mw-space-2); }

  .unit-toggle { display: inline-flex; gap: 1px; padding: 2px; background: var(--mw-surface-2); border: 1px solid var(--mw-border); border-radius: var(--mw-radius); }
  .unit-toggle button { padding: 3px 9px; font-size: var(--mw-text-xs); font-weight: 500; color: var(--mw-text-muted); background: transparent; border: 0; cursor: pointer; border-radius: calc(var(--mw-radius) - 2px); font-variant-numeric: tabular-nums; }
  .toggle-prefix { display: inline-flex; align-items: center; padding: 3px 6px; color: var(--mw-text-muted); user-select: none; }
  .toggle-prefix svg { display: block; flex-shrink: 0; opacity: 0.75; }
  .unit-toggle button:hover { color: var(--mw-text); }
  .unit-toggle button.active { background: var(--mw-surface); color: var(--mw-text); box-shadow: var(--mw-shadow); }

  .view-host { height: 340px; }
  .view-host > .mw-card { height: 100%; display: flex; flex-direction: column; overflow: hidden; }

  .scroll-table.mw-card { padding: 0; overflow: hidden; }
  .scroll-table .mw-table__wrap { flex: 1; min-height: 0; overflow: hidden; }
  .scroll-table .mw-table { width: 100%; height: 100%; font-size: var(--mw-text-xs); border-collapse: separate; border-spacing: 0; table-layout: fixed; }
  .scroll-table .mw-table th, .scroll-table .mw-table td { padding: var(--mw-space-3-5) var(--mw-space-2); font-variant-numeric: tabular-nums; background: var(--mw-surface); text-align: right; overflow: hidden; text-overflow: ellipsis; }
  .scroll-table .mw-table th:first-child, .scroll-table .mw-table td:first-child { text-align: left; }
  .scroll-table .mw-table th { font-weight: 500; color: var(--mw-text-muted); letter-spacing: 0.01em; }
  .scroll-table .mw-table td { font-weight: 400; letter-spacing: -0.005em; }
  .scroll-table .mw-table td strong { font-weight: 600; letter-spacing: -0.01em; }
  .scroll-table .mw-table tbody tr:last-child td { background: var(--mw-surface-2); }
  .scroll-table .mw-card > .mw-card__head { display: none; }

  .row-unit { color: var(--mw-text-muted); font-size: 0.85em; font-weight: 400; margin-left: 4px; }
  .cover-slide { padding: 0; border: none !important; overflow: hidden; }
  .cover-slide > .mw-cover { width: 100%; height: 100%; aspect-ratio: auto; min-height: auto; border: none; border-radius: inherit; box-shadow: none; margin: 0; }

  /* Cover slide — Replit-inspired: left-aligned, bold title, four-corner meta */
  .cover-slide > .mw-cover--classic {
    background: linear-gradient(180deg, var(--mw-bg) 60%, color-mix(in srgb, var(--mw-accent) 8%, var(--mw-bg)) 100%);
    padding: 3.2cqw 4.5cqw;
    gap: 0;
    justify-content: space-between;
  }
  .cover-slide > .mw-cover--classic .mw-cover__header {
    display: flex; justify-content: space-between; align-items: flex-start;
  }
  .cover-slide > .mw-cover--classic .mw-cover__kicker {
    font-size: clamp(9px, 0.85cqw, 11px);
    letter-spacing: 0.14em;
    font-family: var(--mw-mono-font);
    color: var(--mw-text-muted);
    opacity: 0.7;
  }
  .cover-slide > .mw-cover--classic .mw-cover__brand {
    font-size: clamp(9px, 0.85cqw, 11px);
    font-family: var(--mw-mono-font);
    color: var(--mw-text-muted);
    font-weight: 400;
    letter-spacing: 0.02em;
    text-align: right;
    opacity: 0.7;
  }
  .cover-slide > .mw-cover--classic .mw-cover__body {
    display: flex; flex-direction: column; gap: 1cqw;
    padding: 0;
  }
  .cover-slide > .mw-cover--classic .mw-cover__title {
    font-size: clamp(36px, 7cqw, 92px);
    letter-spacing: -0.045em;
    line-height: 1.02;
    font-weight: 800;
  }
  .cover-slide > .mw-cover--classic .mw-cover__subtitle {
    font-size: clamp(12px, 1.2cqw, 15px);
    color: var(--mw-text-muted);
    max-width: 55%;
    line-height: 1.55;
    opacity: 0.65;
  }
  .cover-slide > .mw-cover--classic .mw-cover__footer {
    display: flex; justify-content: space-between; align-items: flex-end;
    border-top: none; padding-top: 0; margin-top: 0;
  }
  .cover-slide > .mw-cover--classic .mw-cover__rule { display: none; }
  .cover-slide > .mw-cover--classic .mw-cover__meta {
    font-size: clamp(9px, 0.85cqw, 11px);
    font-family: var(--mw-mono-font);
    color: var(--mw-text-muted);
    opacity: 0.7;
  }

  .rag-row { display: flex; flex-wrap: wrap; gap: var(--mw-space-2); margin-top: var(--mw-space-3); }

  .wrn-bar { position: fixed; left: 50%; transform: translateX(-50%); bottom: 20px; width: max-content; display: inline-flex; align-items: center; gap: 4px; padding: 0.38rem 0.65rem; background: var(--mw-surface); border: 1px solid var(--mw-border); border-radius: 999px; box-shadow: 0 8px 24px -6px rgba(0,0,0,.28), 0 2px 6px -2px rgba(0,0,0,.12); font-size: 0.78rem; font-variant-numeric: tabular-nums; color: var(--mw-text); font-family: var(--mw-font); transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s; z-index: 50; }
  .wrn-bar:hover { transform: translateX(-50%) translateY(-1px); box-shadow: 0 12px 32px -6px rgba(0,0,0,.32), 0 4px 10px -2px rgba(0,0,0,.14); border-color: var(--mw-accent); }
  .wrn-bar__indicator { font-weight: 500; padding: 0 4px; letter-spacing: -0.01em; }
  .wrn-bar__sep { color: var(--mw-text-muted); margin: 0 1px; }
  .wrn-bar__divider { width: 1px; height: 14px; background: var(--mw-border); margin: 0 2px; flex-shrink: 0; }
  .wrn-bar__btn { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; background: transparent; border: 0; border-radius: 50%; color: var(--mw-text-muted); cursor: pointer; transition: background 0.15s, color 0.15s; }
  .wrn-bar__btn:hover { background: var(--mw-surface-2); color: var(--mw-text); }

  #code-view { display: none; flex-direction: column; height: calc(100vh - 64px); padding: 0 4px; }
  #cv-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 2px 12px; border-bottom: 1px solid var(--mw-border); margin-bottom: 12px; }
  #cv-title { font-size: 12px; color: var(--mw-text-muted); font-family: 'Fira Code', 'Cascadia Code', 'Consolas', monospace; letter-spacing: 0.01em; }
  .cv-btn { padding: 5px 14px; font-size: 12px; font-weight: 500; cursor: pointer; border: 1px solid var(--mw-border); border-radius: var(--mw-radius); background: var(--mw-surface); color: var(--mw-text); transition: background 0.15s; font-family: var(--mw-font); }
  .cv-btn:hover { background: var(--mw-surface-2); }
  .cv-btn--accent { background: var(--mw-accent); color: #fff; border-color: transparent; }
  .cv-btn--accent:hover { opacity: 0.88; background: var(--mw-accent); }
  #cv-pre { flex: 1; min-height: 0; overflow: auto; scrollbar-width: thin; background: var(--mw-surface-2); border: 1px solid var(--mw-border); border-radius: var(--mw-radius); padding: 20px 24px; font-family: 'Fira Code', 'Cascadia Code', 'Consolas', monospace; font-size: 12.5px; line-height: 1.75; color: var(--mw-text); tab-size: 2; white-space: pre; word-break: normal; }
  .wrn-bar__btn.code-active { background: var(--mw-surface-2); color: var(--mw-text); }

  /* Weekly viewer layout */
  body:has(.wrs--thumbs) { overflow: hidden; height: 100vh; margin: 0; background: color-mix(in srgb, var(--mw-bg) 75%, #808080); }
  body:has(.wrs--thumbs) > main { height: 100vh; overflow: hidden; }
  body:has(.wrs--thumbs) .mw-theme-fab { display: none !important; }
  body:has(.wrs--thumbs) .wrn-bar { display: none !important; }

  /* Title bar */
  .weekly-titlebar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 8px 16px; flex-shrink: 0; font-family: var(--mw-font);
    background: var(--mw-surface); border-bottom: 1px solid var(--mw-border);
  }
  .weekly-titlebar__left { display: flex; align-items: center; gap: 10px; min-width: 0; }
  .weekly-titlebar__title { font-size: 13px; font-weight: 600; color: var(--mw-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .weekly-titlebar__date { font-size: 11px; color: var(--mw-text-muted); white-space: nowrap; }
  .weekly-titlebar__page { font-size: 11px; color: var(--mw-text-muted); font-variant-numeric: tabular-nums; flex-shrink: 0; }
  .weekly-titlebar__right { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
  .weekly-titlebar__btn {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 4px 10px; font-size: 11px; font-weight: 500;
    color: var(--mw-text-muted); background: transparent;
    border: none; border-radius: calc(var(--mw-radius) * 0.6);
    cursor: pointer; font-family: var(--mw-font);
    transition: background 0.12s, color 0.12s;
  }
  .weekly-titlebar__btn:hover { background: var(--mw-surface-2); color: var(--mw-text); }
  .weekly-titlebar__btn--active { background: color-mix(in srgb, var(--mw-accent) 10%, transparent); color: var(--mw-accent); }
  .weekly-titlebar__btn svg { width: 13px; height: 13px; }
  .weekly-titlebar__btn--play { background: var(--mw-accent); color: #fff; padding: 4px 12px; border-radius: 999px; }
  .weekly-titlebar__btn--play:hover { opacity: 0.88; background: var(--mw-accent); color: #fff; }
  body.presenter-mode .weekly-titlebar { display: none !important; }

  /* Code dialog */
  .weekly-code-overlay {
    display: none; position: fixed; inset: 0; z-index: 10000;
    background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
    align-items: center; justify-content: center; padding: 32px;
  }
  .weekly-code-overlay.is-open { display: flex; }
  .weekly-code-dialog {
    background: var(--mw-surface); border: 1px solid var(--mw-border);
    border-radius: var(--mw-radius); box-shadow: 0 24px 64px rgba(0,0,0,0.2);
    width: 100%; max-width: 800px; max-height: 80vh;
    display: flex; flex-direction: column; font-family: var(--mw-font);
  }
  .weekly-code-dialog__header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 16px; border-bottom: 1px solid var(--mw-border); flex-shrink: 0;
  }
  .weekly-code-dialog__title { font-size: 13px; font-weight: 600; color: var(--mw-text); }
  .weekly-code-dialog__actions { display: flex; gap: 6px; }
  .weekly-code-dialog__btn {
    padding: 4px 12px; font-size: 11px; font-weight: 500;
    border: 1px solid var(--mw-border); border-radius: calc(var(--mw-radius) * 0.6);
    background: var(--mw-surface); color: var(--mw-text); cursor: pointer;
    font-family: var(--mw-font); transition: background 0.12s;
  }
  .weekly-code-dialog__btn:hover { background: var(--mw-surface-2); }
  .weekly-code-dialog__btn--accent { background: var(--mw-accent); color: #fff; border-color: transparent; }
  .weekly-code-dialog__btn--accent:hover { opacity: 0.88; background: var(--mw-accent); }
  .weekly-code-dialog__body {
    flex: 1; min-height: 0; overflow: auto; scrollbar-width: thin;
    padding: 16px; background: var(--mw-surface-2);
  }
  .weekly-code-dialog__pre {
    margin: 0; font-family: var(--mw-mono-font); font-size: 12px;
    line-height: 1.7; color: var(--mw-text); white-space: pre; tab-size: 2;
  }

  /* Theme carousel */
  .weekly-themes {
    flex-shrink: 0; overflow: hidden;
    background: var(--mw-surface); border-bottom: 1px solid var(--mw-border);
    max-height: 0; padding: 0; transition: max-height 0.25s ease, padding 0.25s ease;
  }
  .weekly-themes.is-open { max-height: 80px; padding: 8px 0; }
  .weekly-themes__track {
    display: flex; gap: 8px; padding: 0 16px;
    overflow-x: auto; scroll-snap-type: x mandatory;
    scrollbar-width: none; -ms-overflow-style: none;
  }
  .weekly-themes__track::-webkit-scrollbar { display: none; }
  .weekly-themes__item {
    flex-shrink: 0; width: 72px; scroll-snap-align: start;
    display: flex; flex-direction: column; align-items: center; gap: 4px;
    cursor: pointer; padding: 4px; border-radius: calc(var(--mw-radius) * 0.6);
    border: 2px solid transparent; transition: border-color 0.15s;
  }
  .weekly-themes__item:hover { border-color: color-mix(in srgb, var(--mw-accent) 30%, transparent); }
  .weekly-themes__item--active { border-color: var(--mw-accent); }
  .weekly-themes__swatch {
    width: 64px; height: 36px; border-radius: 4px;
    border: 1px solid rgba(0,0,0,0.08);
    display: flex; align-items: flex-end; justify-content: center; gap: 2px; padding: 4px;
    position: relative; overflow: hidden;
  }
  .weekly-themes__bar { width: 8px; border-radius: 2px; }
  .weekly-themes__name { font-size: 9px; color: var(--mw-text-muted); font-family: var(--mw-font); white-space: nowrap; text-transform: capitalize; }
  body.presenter-mode .weekly-themes { display: none !important; }
  .weekly-slide-area { flex: 1; min-width: 0; display: flex; align-items: center; justify-content: center; overflow: hidden; }
  .weekly-slide-area > *:not([data-active]) { display: none !important; }
  .weekly-slide-area > [data-active] { display: flex !important; flex-direction: column; }
  .weekly-slide-area > .mw-slide {
    flex: none !important;
    width: 1240px !important; min-width: 1240px !important;
    aspect-ratio: 297 / 210 !important;
    transform: scale(var(--slide-scale, 1));
    transform-origin: center center;
    border-radius: var(--mw-radius);
    box-shadow: 0 2px 8px rgba(0,0,0,.08), 0 8px 32px rgba(0,0,0,.06), 0 16px 64px rgba(0,0,0,.04);
    overflow: hidden;
  }
  .weekly-slide-area .mw-slide .mw-slide__body {
    overflow: hidden;
    display: flex; flex-direction: column; gap: var(--mw-space-3);
    padding: var(--mw-space-3) var(--mw-space-5) var(--mw-space-4);
    min-height: 0;
  }
  .weekly-slide-area .mw-slide .mw-slide__body > .mw-page-head { margin-bottom: calc(-1 * var(--mw-space-1)); }
  .weekly-slide-area .mw-slide .mw-slide__body > .mw-section-head { margin-top: var(--mw-space-1); }
  /* Thumbnail — cloned slides at miniature scale */
  .wrs__thumb-content .mw-slide, .wrs__thumb-content .mw-cover { box-shadow: none; border: none; border-radius: 0; }
  .wrs__thumb-content .mw-slide__body { overflow: hidden; }
  .wrs__thumb-content .cover-slide > .mw-cover { width: 100%; height: 100%; min-height: 0; border: none; }

  body.presenter-mode { overflow: hidden; background: #000; }
  body.presenter-mode .mw-site-nav,
  body.presenter-mode .wrs--thumbs,
  body.presenter-mode .weekly-titlebar,
  body.presenter-mode .weekly-themes { display: none !important; }
  body.presenter-mode main { padding: 0 !important; width: 100vw; height: 100vh; overflow: hidden; }
  body.presenter-mode .weekly-slide-area { position: fixed; inset: 0; display: flex !important; width: 100vw; height: 100vh; align-items: center; justify-content: center; z-index: 9999; background: #000; }
  body.presenter-mode .mw-slide { border: none; border-radius: 0; box-shadow: none !important; }

  /* Sidebar styles provided by maging-sidebar.js */
`;
  document.head.appendChild(_style);

  // ── 2. Maging.deck(MOUNT) — sidebar provided by maging-sidebar.js ────────────────────────────────────────────────────
  function initDeck(MOUNT, root) {
    const scope = root || document;
    const slides     = [...scope.querySelectorAll('section.slide')];
    const SLIDE_IDS  = slides.map(s => s.id);
    const mounted    = {};

    // Auto-apply A4 slide wrapper (skip if already wrapped by weeklyPage builder)
    slides.forEach((s, i) => {
      s.classList.add('mw-slide');
      if (s.classList.contains('cover-slide')) return;
      if (s.querySelector('.mw-slide__body')) return; // already wrapped
      const label = s.dataset.label || '';
      const bu    = s.dataset.bu || '';
      const team  = s.dataset.team || '';
      const content = s.innerHTML;
      const headerLeft = label ? '<span class="mw-slide__label">' + label + '</span>' : '';
      const headerRight = (bu || team) ? '<div class="mw-slide__header-right">' +
        (bu ? '<span class="mw-slide__bu">' + bu + '</span>' : '') +
        (team ? '<span class="mw-slide__team">' + team + '</span>' : '') + '</div>' : '';
      const header = (headerLeft || headerRight) ?
        '<div class="mw-slide__header"><div>' + headerLeft + '</div>' + headerRight + '</div>' : '';
      const pageNum = '<span class="mw-slide__page">' + (i + 1) + ' / ' + slides.length + '</span>';
      const footer = '<div class="mw-slide__footer">' + pageNum + '</div>';
      s.innerHTML = header + '<div class="mw-slide__body">' + content + '</div>' + footer;
    });
    const indEl      = document.getElementById('deck-ind');
    const slidesWrap = document.getElementById('slides-wrap');
    const codeView   = document.getElementById('code-view');
    const cvTitle    = document.getElementById('cv-title');
    const cvCode     = document.getElementById('cv-code');
    const cvCopy     = document.getElementById('cv-copy');
    const cvBack     = document.getElementById('cv-back');
    const codeBtn    = document.getElementById('deck-code');
    let codeViewOpen = false;

    function activateById(id) {
      const target = slides.find(s => s.id === id);
      if (!target) return;
      slides.forEach(s => s.toggleAttribute('data-active', s === target));
      if (location.hash !== '#' + id) history.replaceState(null, '', '#' + id);
      if (!mounted[id]) { mounted[id] = true; MOUNT[id]?.(); }
      if (codeViewOpen) openCodeView();
      scope.querySelectorAll('.wrs__link[data-nav]').forEach(a => {
        a.classList.toggle('wrs__link--active', a.dataset.nav === id);
      });
      scope.querySelectorAll('.wrs__page-dot[data-nav]').forEach(d => {
        d.classList.toggle('wrs__page-dot--active', d.dataset.nav === id);
      });
      // Update thumbnails
      scope.querySelectorAll('.wrs__thumb[data-nav]').forEach(t => {
        t.classList.toggle('wrs__thumb--active', t.dataset.nav === id);
      });
      var activeThumb = scope.querySelector('.wrs__thumb--active');
      if (activeThumb) activeThumb.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      const head = scope.querySelector('.wrs__head');
      if (head) head.classList.toggle('wrs__head--active', id === 'cover');
      const idx = SLIDE_IDS.indexOf(id);
      if (indEl)   { indEl.innerHTML = (idx + 1) + ' <span class="wrn-bar__sep">/</span> ' + slides.length; }
      // Update toolbar indicator
      var wtInd = scope.querySelector('#weekly-ind');
      if (wtInd) { wtInd.textContent = (idx + 1) + ' / ' + slides.length; }
      // Refresh only the active slide's charts (not all — hidden ones get 0 size)
      setTimeout(() => {
        if (typeof Maging !== 'undefined' && Maging.refreshAll) {
          target.querySelectorAll('.mw-chart__body').forEach(c => {
            var inst = typeof echarts !== 'undefined' && echarts.getInstanceByDom(c);
            if (inst) inst.resize();
          });
        }
      }, 50);
    }

    function activateOffset(offset) {
      const cur = slides.findIndex(s => s.hasAttribute('data-active'));
      activateById(slides[Math.max(0, Math.min(slides.length - 1, cur + offset))].id);
    }

    function scaleSlide() { if (window._magingScaleSlides) window._magingScaleSlides(slides); }

    function toggleFullscreen() {
      const isOn = document.body.classList.toggle('presenter-mode');
      localStorage.setItem('weeklyPresenter', isOn ? '1' : '0');
      scaleSlide();
      setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
    }

    window.addEventListener('resize', scaleSlide);
    if (localStorage.getItem('weeklyPresenter') === '1') { document.body.classList.add('presenter-mode'); }
    scaleSlide();

    function dedent(src) {
      const lines = src.split('\n');
      const min = lines.slice(1).reduce((m, l) => l.trim() ? Math.min(m, l.match(/^(\s*)/)[1].length) : m, Infinity);
      return lines.map((l, i) => i === 0 ? l.trim() : l.slice(min)).join('\n');
    }

    function openCodeView() {
      const active = slides.find(s => s.hasAttribute('data-active'));
      if (!active) return;
      const fn = MOUNT[active.id];
      cvTitle.textContent = '// ' + active.id + '.js';
      cvCode.textContent = fn ? dedent(fn.toString()) : '// 이 슬라이드는 코드가 없습니다.';
      slidesWrap.style.display = 'none';
      codeView.style.display = 'flex';
      codeBtn.classList.add('code-active');
      codeViewOpen = true;
    }

    function closeCodeView() {
      codeView.style.display = 'none';
      slidesWrap.style.display = '';
      codeBtn.classList.remove('code-active');
      codeViewOpen = false;
    }

    codeBtn?.addEventListener('click', () => codeViewOpen ? closeCodeView() : openCodeView());
    cvBack?.addEventListener('click', closeCodeView);
    cvCopy?.addEventListener('click', () => {
      navigator.clipboard.writeText(cvCode.textContent).then(() => {
        cvCopy.textContent = '복사됨!';
        setTimeout(() => cvCopy.textContent = '복사', 1500);
      });
    });

    window.addEventListener('keydown', (e) => {
      if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable]')) return;
      const k = e.key;
      if      (k === 'ArrowRight' || k === 'PageDown' || k === 'j' || k === 'J') { e.preventDefault(); activateOffset(1); }
      else if (k === 'ArrowLeft'  || k === 'PageUp'   || k === 'k' || k === 'K') { e.preventDefault(); activateOffset(-1); }
      else if (k === 'Home') { e.preventDefault(); activateById(slides[0].id); }
      else if (k === 'End')  { e.preventDefault(); activateById(slides[slides.length - 1].id); }
      else if (k === 'f' || k === 'F') { e.preventDefault(); toggleFullscreen(); }
      else if (k === 'c' || k === 'C') { e.preventDefault(); codeViewOpen ? closeCodeView() : openCodeView(); }
      else if (k === 'Escape') { e.preventDefault(); if (codeViewOpen) closeCodeView(); else if (document.body.classList.contains('presenter-mode')) toggleFullscreen(); }
    });

    document.addEventListener('click', (e) => {
      if (e.target.closest('#deck-fs')) { toggleFullscreen(); return; }
      const nav = e.target.closest('.wrs [data-nav], maging-sidebar [data-nav]');
      if (nav) { e.preventDefault(); activateById(nav.dataset.nav); }
    });

    window.addEventListener('hashchange', () => {
      const id = location.hash.slice(1);
      if (id && slides.find(s => s.id === id)) activateById(id);
    });

    const initId = location.hash.slice(1);
    if (initId && slides.find(s => s.id === initId)) activateById(initId);
    else activateById(slides[0].id);
  }

  // ── 4. Maging.monthlyTable(sel, config) ─────────────────────────────────────
  //
  // config: {
  //   title, sub,
  //   categories?,       // default: Korean months ['1월'…'12월']
  //   rows: [{ name, data: [v, …], unit? }],
  //   summaryRow?,       // string label → auto-sum row appended
  //   unitToggle?,       // bool — show 원/만원/억원 toggle (default false)
  //   viewToggle?,       // bool — show table/line/bar toggle (default false)
  //   defaultUnit?,      // '원'|'만원'|'억원' (default '만원')
  //   defaultView?,      // 'table'|'line'|'bar' (default 'table')
  // }
  const SVG_EYE   = '<svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M1 7s2-4 6-4 6 4 6 4-2 4-6 4-6-4-6-4z"/><circle cx="7" cy="7" r="1.8"/></svg>';
  const SVG_RULER = '<svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><rect x="1" y="4" width="12" height="6" rx="1"/><line x1="3.5" y1="4" x2="3.5" y2="6.5"/><line x1="6" y1="4" x2="6" y2="7.5"/><line x1="8.5" y1="4" x2="8.5" y2="6.5"/><line x1="11" y1="4" x2="11" y2="7.5"/></svg>';

  const DEFAULT_MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

  let _mtCounter = 0;

  function monthlyTable(sel, cfg) {
    const container = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!container) return;

    const {
      title = '', sub = '',
      categories = DEFAULT_MONTHS,
      rows = [],
      summaryRow,
      unitToggle = false,
      viewToggle = false,
      defaultUnit = '만원',
      defaultView = 'table',
    } = cfg;

    const id = 'mt' + (++_mtCounter);
    let curUnit = defaultUnit;
    let curView = defaultView;

    // Build table rows (sum row optional)
    function buildTableRows() {
      const built = rows.map(r => {
        const row = { name: r.name || '' };
        let tot = 0;
        categories.forEach((_, i) => { row['m' + i] = r.data[i] ?? null; tot += r.data[i] || 0; });
        row.total = tot;
        return row;
      });
      if (summaryRow) {
        const sumRow = { name: summaryRow }; let tot = 0;
        categories.forEach((_, i) => {
          const v = rows.reduce((s, r) => s + (r.data[i] || 0), 0);
          sumRow['m' + i] = v; tot += v;
        });
        sumRow.total = tot;
        built.push(sumRow);
      }
      return built;
    }

    function fmtCell(v) {
      if (v == null) return '<span style="color:var(--mw-text-muted)">−</span>';
      if (curUnit === '원')   return v.toLocaleString();
      if (curUnit === '만원') return Math.round(v / 10000).toLocaleString();
      return (v / 1e8).toFixed(2);
    }
    function scaleVal(v) {
      if (v == null) return null;
      if (curUnit === '원')   return v;
      if (curUnit === '만원') return v / 10000;
      return v / 1e8;
    }
    function makeColumns() {
      return [
        { key: 'name', label: '구분', align: 'left' },
        ...categories.map((m, i) => ({ key: 'm' + i, label: m, align: 'right', render: (v) => fmtCell(v) })),
        { key: 'total', label: '합계', align: 'right', render: (v) => '<strong>' + fmtCell(v) + '</strong>' },
      ];
    }

    // Toolbar HTML
    const vtHtml = viewToggle ? `<div class="unit-toggle" id="${id}-vt">
      <span class="toggle-prefix">${SVG_EYE}</span>
      <button data-view="table" class="${curView==='table'?'active':''}">table</button>
      <button data-view="line" class="${curView==='line'?'active':''}">line</button>
      <button data-view="bar" class="${curView==='bar'?'active':''}">bar</button>
    </div>` : '';
    const utHtml = unitToggle ? `<div class="unit-toggle" id="${id}-ut">
      <span class="toggle-prefix">${SVG_RULER}</span>
      <button data-unit="원" class="${curUnit==='원'?'active':''}">원</button>
      <button data-unit="만원" class="${curUnit==='만원'?'active':''}">만원</button>
      <button data-unit="억원" class="${curUnit==='억원'?'active':''}">억원</button>
    </div>` : '';

    container.innerHTML = `
      <div class="table-toolbar">
        <div>
          <span class="table-toolbar__title">${title}</span>
          ${sub ? `<span class="table-toolbar__sub">${sub}</span>` : ''}
        </div>
        <div style="display:flex;gap:8px;align-items:center;">${vtHtml}${utHtml}</div>
      </div>
      <div class="view-host scroll-table" id="${id}-host"></div>`;

    const host = container.querySelector('#' + id + '-host');

    function render() {
      host.innerHTML = '';
      if (curView === 'table') {
        host.classList.add('scroll-table');
        window.Maging.activityTable(host, { columns: makeColumns(), rows: buildTableRows() });
      } else {
        host.classList.remove('scroll-table');
        const series = rows.map(r => ({ name: r.name, data: r.data.map(v => scaleVal(v)) }));
        const yFmt = v => v == null ? '' : curUnit === '억원' ? v.toFixed(2) : Math.round(v).toLocaleString();
        if (curView === 'bar') window.Maging.barChart(host,  { categories, series, stack: true,  yFormatter: yFmt });
        else                   window.Maging.lineChart(host, { categories, series, stack: false, area: false, yFormatter: yFmt });
      }
    }
    render();

    if (viewToggle) {
      container.querySelector('#' + id + '-vt').addEventListener('click', e => {
        const btn = e.target.closest('button[data-view]'); if (!btn) return;
        curView = btn.dataset.view;
        container.querySelectorAll('#' + id + '-vt button').forEach(b => b.classList.toggle('active', b === btn));
        render();
      });
    }
    if (unitToggle) {
      container.querySelector('#' + id + '-ut').addEventListener('click', e => {
        const btn = e.target.closest('button[data-unit]'); if (!btn) return;
        curUnit = btn.dataset.unit;
        container.querySelectorAll('#' + id + '-ut button').forEach(b => b.classList.toggle('active', b === btn));
        render();
      });
    }
  }

  // ── Weekly page builder — Maging.page({ mode: 'weekly', slides: [...] }) ──
  // Build sidebar HTML directly (shared logic with pitch)
  function _buildSidebarHTML(title, date, slideConfigs) {
    const items = [];
    slideConfigs.forEach(s => {
      if (s.cover || !s.label) return;
      const prev = items[items.length - 1];
      if (prev && prev.label === s.label) { prev.pages.push(s.id); }
      else { items.push({ label: s.label, bu: s.bu || '', team: s.team || '', pages: [s.id] }); }
    });
    const hasBU = items.some(it => it.bu);
    function renderItem(it) {
      const dots = it.pages.length > 1
        ? '<span class="wrs__pages">' + it.pages.map(p => '<a class="wrs__page-dot" data-nav="' + p + '"></a>').join('') + '</span>' : '';
      return '<div class="wrs__row"><a class="wrs__link" data-nav="' + it.pages[0] + '"><span class="wrs__dash">\u2015</span><span class="wrs__lbl">' + it.label + '</span></a>' + dots + '</div>';
    }
    let navHTML = '';
    if (hasBU) {
      const groups = [];
      items.forEach(item => {
        let g = groups.find(x => x.bu === item.bu); if (!g) { g = { bu: item.bu, teams: [] }; groups.push(g); }
        let t = g.teams.find(x => x.team === item.team); if (!t) { t = { team: item.team, items: [] }; g.teams.push(t); }
        t.items.push(item);
      });
      navHTML = groups.map(g => '<div class="wrs__group"><div class="wrs__bu">' + g.bu + '</div>' +
        g.teams.map(t => '<div class="wrs__team">' + (t.team ? '<div class="wrs__team-label">' + t.team + '</div>' : '') +
          t.items.map(renderItem).join('') + '</div>').join('') + '</div>').join('');
    } else { navHTML = items.map(renderItem).join(''); }
    return '<aside class="wrs"><a class="wrs__head wrs__head--active" data-nav="cover" style="text-decoration:none;color:inherit;cursor:pointer;display:block">' +
      '<div class="wrs__title">' + (title || '') + '</div>' + (date ? '<div class="wrs__date">' + date + '</div>' : '') +
      '</a>' + navHTML + '</aside>';
  }

  function weeklyPage(cfg) {
    const M = window.Maging;
    const slides = cfg.slides || [];
    const container = document.createElement('main');
    container.style.cssText = 'display:flex;flex-direction:column;height:100vh;overflow:hidden;';

    const sTitle = cfg.sidebarTitle || cfg.title || '';
    const sDate = cfg.sidebarDate || cfg.date || '';

    // Title bar (full width, top)
    const titlebar = document.createElement('div');
    titlebar.className = 'weekly-titlebar';
    titlebar.innerHTML =
      '<div class="weekly-titlebar__left">' +
        '<span class="weekly-titlebar__title">' + sTitle + '</span>' +
        (sDate ? '<span class="weekly-titlebar__date">' + sDate + '</span>' : '') +
        '<span class="weekly-titlebar__page" id="weekly-ind">1 / ' + slides.length + '</span>' +
      '</div>' +
      '<div class="weekly-titlebar__right">' +
        '<button class="weekly-titlebar__btn" id="wtb-theme" type="button">' +
          '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="8" r="5.5"/><circle cx="8" cy="8" r="2"/></svg>테마</button>' +
        '<button class="weekly-titlebar__btn" id="wtb-code" type="button">' +
          '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M5 3L1 8l4 5M11 3l4 5-4 5"/></svg>코드</button>' +
        '<button class="weekly-titlebar__btn" id="wtb-export" type="button">' +
          '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 10v3h10v-3M8 2v8M5 5l3-3 3 3"/></svg>내보내기</button>' +
        '<button class="weekly-titlebar__btn weekly-titlebar__btn--play" id="wtb-present" type="button">' +
          '<svg viewBox="0 0 16 16" fill="none"><path d="M4 3l9 5-9 5V3z" fill="currentColor"/></svg>발표</button>' +
      '</div>';
    container.appendChild(titlebar);

    // Content row (sidebar + slide area)
    const contentRow = document.createElement('div');
    contentRow.style.cssText = 'display:flex;flex:1;min-height:0;overflow:hidden;';

    // Sidebar — thumbnails only (no header)
    const sidebarWrap = document.createElement('div');
    sidebarWrap.style.cssText = 'flex-shrink:0;align-self:stretch;display:flex;';
    const thumbsHTML = slides.map((s, i) =>
      '<div class="wrs__thumb' + (i === 0 ? ' wrs__thumb--active' : '') + '" data-nav="' + s.id + '">' +
        '<span class="wrs__thumb-num">' + (i + 1) + '</span>' +
        '<div class="wrs__thumb-frame"><div class="wrs__thumb-content" data-thumb-id="' + s.id + '"></div></div>' +
      '</div>'
    ).join('');
    sidebarWrap.innerHTML = '<aside class="wrs wrs--thumbs">' +
      '<div class="wrs__thumb-list">' + thumbsHTML + '</div>' +
    '</aside>';
    contentRow.appendChild(sidebarWrap);

    // Slide area
    const slideArea = document.createElement('div');
    slideArea.className = 'weekly-slide-area';
    contentRow.appendChild(slideArea);

    // Theme carousel (between title bar and content, hidden by default)
    const themePanel = document.createElement('div');
    themePanel.className = 'weekly-themes';
    themePanel.id = 'weekly-themes';
    container.appendChild(themePanel);

    container.appendChild(contentRow);

    const _mountedOnce = {};
    const MOUNT = {};
    slides.forEach((s, i) => {
      const sec = document.createElement('section');
      sec.className = 'slide' + (s.cover ? ' cover-slide' : '');
      sec.id = s.id;
      if (s.label) sec.dataset.label = s.label;
      if (s.bu) sec.dataset.bu = s.bu;
      if (s.team) sec.dataset.team = s.team;

      // Pre-build slide structure (header + body + footer) so MOUNT doesn't depend on initDeck timing
      if (!s.cover) {
        const label = s.label || '';
        const bu = s.bu || '';
        const team = s.team || '';
        const headerLeft = label ? '<span class="mw-slide__label">' + label + '</span>' : '';
        const headerRight = (bu || team) ? '<div class="mw-slide__header-right">' +
          (bu ? '<span class="mw-slide__bu">' + bu + '</span>' : '') +
          (team ? '<span class="mw-slide__team">' + team + '</span>' : '') + '</div>' : '';
        const header = (headerLeft || headerRight) ?
          '<div class="mw-slide__header"><div>' + headerLeft + '</div>' + headerRight + '</div>' : '';
        const pageNum = '<span class="mw-slide__page">' + (i + 1) + ' / ' + slides.length + '</span>';
        const footer = '<div class="mw-slide__footer">' + pageNum + '</div>';
        sec.innerHTML = header + '<div class="mw-slide__body"></div>' + footer;
      }

      slideArea.appendChild(sec);

      const widgets = s.widgets || [];
      // Capture body reference NOW (before any timing issues)
      const body = sec.querySelector('.mw-slide__body') || sec;
      MOUNT[s.id] = () => {
        if (_mountedOnce[s.id]) return;
        _mountedOnce[s.id] = true;
        let kpiRow = null;
        widgets.forEach(w => {
          const fn = M[w.type];
          if (!fn) { console.warn('[maging.page/weekly] Unknown widget: ' + w.type); return; }
          const wCfg = {};
          for (const k in w) { if (k !== 'type') wCfg[k] = w[k]; }
          if (w.type === 'kpiCard') {
            // Group consecutive kpiCards into a grid row
            if (!kpiRow) {
              kpiRow = document.createElement('div');
              kpiRow.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:var(--mw-space-3);';
              body.appendChild(kpiRow);
            }
            const wrap = document.createElement('div');
            kpiRow.appendChild(wrap);
            fn(wrap, wCfg);
          } else {
            kpiRow = null;
            const wrap = document.createElement('div');
            body.appendChild(wrap);
            fn(wrap, wCfg);
          }
        });
      };
    });

    document.body.appendChild(container);
    // Initialize deck synchronously — setTimeout causes React strict mode race
    initDeck(MOUNT, container);

    // Post-process: accent color on last word of cover title
    function applyCoverAccent() {
      var ct = container.querySelector('.cover-slide .mw-cover__title');
      if (!ct || ct.querySelector('[data-accent]')) return; // already applied
      var words = ct.textContent.split(' ');
      if (words.length > 1) {
        var last = words.pop();
        ct.innerHTML = words.join(' ') + ' <span data-accent style="color:var(--mw-accent)">' + last + '</span>';
      } else {
        ct.innerHTML = '<span data-accent style="color:var(--mw-accent)">' + words[0] + '</span>';
      }
    }
    applyCoverAccent();
    // Re-apply after any Maging refresh (theme change etc.)
    var origRefresh = window.Maging?.refreshAll;
    if (origRefresh) {
      window.Maging.refreshAll = function() {
        origRefresh.call(window.Maging);
        setTimeout(applyCoverAccent, 50);
      };
    }

    // Code dialog
    var codeOverlay = document.createElement('div');
    codeOverlay.className = 'weekly-code-overlay';
    codeOverlay.innerHTML =
      '<div class="weekly-code-dialog">' +
        '<div class="weekly-code-dialog__header">' +
          '<span class="weekly-code-dialog__title" id="wcd-title"></span>' +
          '<div class="weekly-code-dialog__actions">' +
            '<button class="weekly-code-dialog__btn" id="wcd-copy">복사</button>' +
            '<button class="weekly-code-dialog__btn weekly-code-dialog__btn--accent" id="wcd-download">↓ 다운로드</button>' +
            '<button class="weekly-code-dialog__btn" id="wcd-close">닫기</button>' +
          '</div>' +
        '</div>' +
        '<div class="weekly-code-dialog__body"><pre class="weekly-code-dialog__pre" id="wcd-code"></pre></div>' +
      '</div>';
    document.body.appendChild(codeOverlay);

    // Wire title bar buttons
    var wtbCode = container.querySelector('#wtb-code');
    var wtbTheme = container.querySelector('#wtb-theme');
    var wtbExport = container.querySelector('#wtb-export');
    var wtbPresent = container.querySelector('#wtb-present');
    var themePanelEl = container.querySelector('#weekly-themes');

    // Code dialog handlers
    function openCodeDialog() {
      var theme = document.documentElement.getAttribute('data-theme') || 'flow';
      var ver = M.version || '0.1.25';
      var cdn = 'https://cdn.jsdelivr.net/npm/@m1kapp/maging@' + ver + '/dist';
      // Serialize config (strip functions)
      var safeCfg = JSON.stringify(cfg, function(k, v) {
        return typeof v === 'function' ? undefined : v;
      }, 2);
      var html = [
        '<!DOCTYPE html>',
        '<html lang="ko" data-theme="' + theme + '">',
        '<head>',
        '  <meta charset="UTF-8">',
        '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
        '  <title>' + (cfg.sidebarTitle || 'maging') + '</title>',
        '  <script src="' + cdn + '/maging-all.js"><\/script>',
        '</head>',
        '<body>',
        '<script>',
        '  window.addEventListener("maging:ready", function () {',
        '    Maging.page(' + safeCfg.split('\n').map(function(l, i) {
          return i === 0 ? l : '    ' + l;
        }).join('\n') + ');',
        '  });',
        '<\/script>',
        '</body>',
        '</html>'
      ].join('\n');
      var chars = html.length;
      var tokens = Math.ceil(chars / 3.5); // rough estimate
      codeOverlay.querySelector('#wcd-title').textContent = sTitle + ' — ' + chars.toLocaleString() + '자 · ~' + tokens.toLocaleString() + ' tokens';
      codeOverlay.querySelector('#wcd-code').textContent = html;
      codeOverlay.classList.add('is-open');
    }
    if (wtbCode) wtbCode.addEventListener('click', openCodeDialog);
    codeOverlay.querySelector('#wcd-close').addEventListener('click', function() { codeOverlay.classList.remove('is-open'); });
    codeOverlay.querySelector('#wcd-copy').addEventListener('click', function() {
      var code = codeOverlay.querySelector('#wcd-code').textContent;
      navigator.clipboard.writeText(code).then(function() {
        var btn = codeOverlay.querySelector('#wcd-copy');
        btn.textContent = '복사됨!';
        setTimeout(function() { btn.textContent = '복사'; }, 1500);
      });
    });
    codeOverlay.querySelector('#wcd-download').addEventListener('click', function() {
      var code = codeOverlay.querySelector('#wcd-code').textContent;
      var blob = new Blob([code], { type: 'text/html;charset=utf-8' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = (cfg.sidebarTitle || 'maging-slide') + '.html';
      a.click();
      URL.revokeObjectURL(a.href);
    });
    codeOverlay.addEventListener('click', function(e) {
      if (e.target === codeOverlay) codeOverlay.classList.remove('is-open');
    });

    // Build theme carousel — read real themes from FAB panel or CSS
    var _themeCache = null;
    function buildThemeCarousel() {
      var current = document.documentElement.getAttribute('data-theme') || 'flow';
      // Read theme colors from CSS rules directly (no DOM mutation — instant)
      if (!_themeCache) {
        _themeCache = [];
        var seen = {};
        for (var i = 0; i < document.styleSheets.length; i++) {
          try {
            var rules = document.styleSheets[i].cssRules || [];
            for (var j = 0; j < rules.length; j++) {
              var r = rules[j];
              if (r.selectorText) {
                var m = r.selectorText.match(/\[data-theme="([^"]+)"\]/);
                if (m && !seen[m[1]]) {
                  seen[m[1]] = true;
                  var st = r.style;
                  var accent = st.getPropertyValue('--mw-accent').trim();
                  if (accent) _themeCache.push({ name: m[1], bg: st.getPropertyValue('--mw-bg').trim() || '#fff', accent: accent, text: st.getPropertyValue('--mw-text').trim() || '#000' });
                }
              }
            }
          } catch(e) {}
        }
      }
      var themeColors = _themeCache;
      // Build HTML
      var track = '<div class="weekly-themes__track">';
      themeColors.forEach(function(c) {
        var isActive = c.name === current;
        track += '<div class="weekly-themes__item' + (isActive ? ' weekly-themes__item--active' : '') + '" data-theme-pick="' + c.name + '">' +
          '<div class="weekly-themes__swatch" style="background:' + c.bg + '">' +
            '<div class="weekly-themes__bar" style="background:' + c.accent + ';height:55%"></div>' +
            '<div class="weekly-themes__bar" style="background:' + c.text + ';height:35%;opacity:0.2"></div>' +
            '<div class="weekly-themes__bar" style="background:' + c.accent + ';height:75%;opacity:0.5"></div>' +
          '</div>' +
          '<span class="weekly-themes__name">' + c.name + '</span>' +
        '</div>';
      });
      track += '</div>';
      themePanelEl.innerHTML = track;
    }

    if (wtbTheme) wtbTheme.addEventListener('click', function() {
      var isOpen = themePanelEl.classList.toggle('is-open');
      wtbTheme.classList.toggle('weekly-titlebar__btn--active', isOpen);
      if (isOpen && !themePanelEl.querySelector('.weekly-themes__item')) buildThemeCarousel();
      // Recalc slide scale after carousel animation
      setTimeout(function() { window.dispatchEvent(new Event('resize')); }, 300);
    });

    // Theme selection
    themePanelEl.addEventListener('click', function(e) {
      var item = e.target.closest('[data-theme-pick]');
      if (!item) return;
      var theme = item.dataset.themePick;
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('maging-theme', theme);
      themePanelEl.querySelectorAll('.weekly-themes__item').forEach(function(el) {
        el.classList.toggle('weekly-themes__item--active', el.dataset.themePick === theme);
      });
      // Refresh charts
      if (window.Maging?.refreshAll) setTimeout(function() { window.Maging.refreshAll(); }, 100);
    });

    if (wtbExport) wtbExport.addEventListener('click', function() {
      // Show FAB temporarily for export
      var fab = document.querySelector('.mw-theme-fab');
      if (fab) { fab.style.display = 'flex'; var btn = fab.querySelector('.mw-theme-fab__export-btn, [class*=export] button'); if (btn) btn.click(); }
    });

    if (wtbPresent) wtbPresent.addEventListener('click', function() {
      document.body.classList.toggle('presenter-mode');
      if (window._magingScaleSlides) {
        var s = [...container.querySelectorAll('section.slide')];
        window._magingScaleSlides(s);
      }
      setTimeout(function() { window.dispatchEvent(new Event('resize')); }, 50);
    });
    // Populate thumbnails after widgets mount
    setTimeout(() => {
      if (!container.isConnected) return;
      // Mount all slides eagerly
      var allSlideEls = container.querySelectorAll('.weekly-slide-area > *');
      allSlideEls.forEach(function(sec) { if (MOUNT[sec.id]) MOUNT[sec.id](); });

      // Auto-paginate: split overflowing slides
      var sa = container.querySelector('.weekly-slide-area');
      [...sa.querySelectorAll('section.slide:not(.cover-slide)')].forEach(function(sec) {
        var body = sec.querySelector('.mw-slide__body');
        if (!body || body.scrollHeight <= body.clientHeight) return;

        var widgets = [...body.children];
        var bodyH = body.clientHeight;
        var splitIdx = -1;
        for (var i = 0; i < widgets.length; i++) {
          if (widgets[i].offsetTop + widgets[i].offsetHeight > bodyH) { splitIdx = i; break; }
        }
        if (splitIdx <= 0) return;

        // Create continuation slide
        var cont = document.createElement('section');
        cont.className = sec.className;
        cont.id = sec.id + '-cont';
        if (sec.dataset.label) cont.dataset.label = sec.dataset.label;
        if (sec.dataset.bu) cont.dataset.bu = sec.dataset.bu;
        if (sec.dataset.team) cont.dataset.team = sec.dataset.team;
        var hdr = sec.querySelector('.mw-slide__header');
        var ftr = sec.querySelector('.mw-slide__footer');
        var contBody = document.createElement('div');
        contBody.className = 'mw-slide__body';
        if (hdr) cont.appendChild(hdr.cloneNode(true));
        cont.appendChild(contBody);
        if (ftr) cont.appendChild(ftr.cloneNode(true));
        cont.classList.add('mw-slide');

        // Move overflow widgets
        for (var j = splitIdx; j < widgets.length; j++) contBody.appendChild(widgets[j]);

        sec.after(cont);
      });

      // Re-number all slides
      var allFinal = [...sa.children];
      var total = allFinal.length;
      allFinal.forEach(function(sec, i) {
        var pg = sec.querySelector('.mw-slide__page');
        if (pg) pg.textContent = (i + 1) + ' / ' + total;
      });
      // Update toolbar indicator
      var wtInd = container.querySelector('#weekly-ind');
      if (wtInd) {
        var activeIdx = allFinal.findIndex(function(s) { return s.hasAttribute('data-active'); });
        wtInd.textContent = (activeIdx + 1) + ' / ' + total;
      }

      // Rebuild thumbnails to include paginated slides
      var thumbList = container.querySelector('.wrs__thumb-list');
      var finalSlides = [...sa.children];
      if (thumbList) {
        thumbList.innerHTML = finalSlides.map(function(sec, i) {
          var isActive = sec.hasAttribute('data-active');
          return '<div class="wrs__thumb' + (isActive ? ' wrs__thumb--active' : '') + '" data-nav="' + sec.id + '">' +
            '<span class="wrs__thumb-num">' + (i + 1) + '</span>' +
            '<div class="wrs__thumb-frame"><div class="wrs__thumb-content" data-thumb-id="' + sec.id + '"></div></div>' +
          '</div>';
        }).join('');
      }
      // Populate thumbnail clones
      finalSlides.forEach(function(sec) {
        var thumb = container.querySelector('[data-thumb-id="' + sec.id + '"]');
        if (!thumb) return;
        var frame = thumb.parentElement;
        var frameW = frame.offsetWidth || 176;
        thumb.style.transform = 'scale(' + (frameW / 1240).toFixed(4) + ')';
        var clone = sec.cloneNode(true);
        clone.removeAttribute('id');
        clone.removeAttribute('data-active');
        clone.style.cssText = 'display:flex;flex-direction:column;width:1240px;min-width:1240px;margin:0;transform:none;';
        thumb.innerHTML = '';
        thumb.appendChild(clone);
      });
    }, 500);

    return M._pageResult(container, cfg, 'weekly');
  }

  // Expose Maging.deck() + Maging.monthlyTable()
  // — 즉시 등록: maging.js를 sync로 로드한 환경(components 갤러리 등)
  if (window.Maging) {
    window.Maging.deck = initDeck;
    window.Maging.monthlyTable = monthlyTable;
    window.Maging._pageBuilders = window.Maging._pageBuilders || {};
    window.Maging._pageBuilders.weekly = weeklyPage;
  }
  // — maging:ready 이벤트: maging-all.js 환경 + DECK_MOUNT 자동 실행
  window.addEventListener('maging:ready', () => {
    if (window.Maging) {
      window.Maging.deck = initDeck;
      window.Maging.monthlyTable = monthlyTable;
      window.Maging._pageBuilders = window.Maging._pageBuilders || {};
      window.Maging._pageBuilders.weekly = weeklyPage;
    }
    if (window.DECK_MOUNT) initDeck(window.DECK_MOUNT);
  });
})();
