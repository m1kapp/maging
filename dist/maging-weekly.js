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
  .cover-slide { padding: 0; }
  .cover-slide > .mw-cover { width: 100%; height: 100%; aspect-ratio: auto; min-height: auto; border: none; border-radius: 0; box-shadow: none; }

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

  body.presenter-mode { overflow: hidden; background: #000; }
  body.presenter-mode .mw-site-nav { display: none !important; }
  body.presenter-mode .wrs { display: none !important; }
  body.presenter-mode main { padding: 0 !important; display: flex; align-items: center; justify-content: center; width: 100vw; height: 100vh; overflow: hidden; }
  body.presenter-mode .mw-slide { border: none; border-radius: 0; transform-origin: center center; }

  /* Sidebar styles provided by maging-sidebar.js */
`;
  document.head.appendChild(_style);

  // ── 2. Maging.deck(MOUNT) — sidebar provided by maging-sidebar.js ────────────────────────────────────────────────────
  function initDeck(MOUNT) {
    const slides     = [...document.querySelectorAll('section.slide')];
    const SLIDE_IDS  = slides.map(s => s.id);
    const mounted    = {};

    // Auto-apply A4 slide wrapper
    slides.forEach((s, i) => {
      s.classList.add('mw-slide');
      if (s.classList.contains('cover-slide')) return; // cover: aspect-ratio만, header/footer 없음
      const label = s.dataset.label || '';
      const bu    = s.dataset.bu || '';
      const team  = s.dataset.team || '';
      // wrap existing content in body
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
      history.replaceState(null, '', '#' + id);
      if (!mounted[id]) { mounted[id] = true; MOUNT[id]?.(); }
      if (codeViewOpen) openCodeView();
      document.querySelectorAll('maging-sidebar .wrs__link').forEach(a => {
        a.classList.toggle('wrs__link--active', a.dataset.nav === id);
      });
      document.querySelectorAll('maging-sidebar .wrs__page-dot').forEach(d => {
        d.classList.toggle('wrs__page-dot--active', d.dataset.nav === id);
      });
      const head = document.querySelector('maging-sidebar .wrs__head');
      if (head) head.classList.toggle('wrs__head--active', id === 'cover');
      const idx = SLIDE_IDS.indexOf(id);
      if (indEl)   { indEl.innerHTML = (idx + 1) + ' <span class="wrn-bar__sep">/</span> ' + slides.length; }
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
      const nav = e.target.closest('maging-sidebar [data-nav]');
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
  function weeklyPage(cfg) {
    const M = window.Maging;
    const slides = cfg.slides || [];
    const container = document.createElement('main');
    container.style.cssText = 'display:flex;min-height:100vh;';

    // Sidebar
    const sTitle = cfg.sidebarTitle || cfg.title || '';
    const sDate = cfg.sidebarDate || cfg.date || '';
    const sidebar = document.createElement('maging-sidebar');
    sidebar.setAttribute('active', 'cover');
    if (sTitle) sidebar.setAttribute('data-title', sTitle);
    if (sDate) sidebar.setAttribute('data-date', sDate);
    container.appendChild(sidebar);

    const slideArea = document.createElement('div');
    slideArea.style.cssText = 'flex:1;min-width:0;';
    container.appendChild(slideArea);

    const MOUNT = {};
    slides.forEach(s => {
      const sec = document.createElement('section');
      sec.className = 'slide' + (s.cover ? ' cover-slide' : '');
      sec.id = s.id;
      if (s.label) sec.dataset.label = s.label;
      if (s.bu) sec.dataset.bu = s.bu;
      if (s.team) sec.dataset.team = s.team;
      slideArea.appendChild(sec);

      const widgets = s.widgets || [];
      MOUNT[s.id] = () => {
        widgets.forEach(w => {
          const typeName = w.type;
          const fn = M[typeName];
          if (!fn) { console.warn('[maging.page/weekly] Unknown widget: ' + typeName); return; }
          const wCfg = {};
          for (const k in w) { if (k !== 'type') wCfg[k] = w[k]; }
          fn(sec, wCfg);
        });
      };
    });

    // Mount first so initDeck can find slides in DOM
    document.body.appendChild(container);
    setTimeout(() => initDeck(MOUNT), 0);

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
