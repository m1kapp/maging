/**
 * Slide viewer infrastructure — deck navigation, toolbar, thumbnails,
 * theme carousel, code dialog, pagination, presenter mode.
 *
 * Imperative DOM code — no JSX needed.
 */

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

export function bootViewer() {
  // CSS is injected by injectCSS() in slide.tsx — no duplicate here.

  // ── 2. Maging.deck(MOUNT) — sidebar provided by maging-sidebar.js ────────────────────────────────────────────────────
  function initDeck(MOUNT, root) {
    const scope = root || document;
    const slideArea  = scope.querySelector('[data-slide-area]');
    const slides     = slideArea
      ? [...slideArea.querySelectorAll(':scope > section.slide')]
      : [...scope.querySelectorAll('section.slide')];
    const SLIDE_IDS  = slides.map(s => s.id);
    const mounted    = {};

    // Auto-apply A4 slide wrapper (skip if already wrapped by weeklyPage builder)
    slides.forEach((s, i) => {
      s.classList.add('mw-slide', 'hidden', 'flex-col', 'shrink-0', 'rounded-[var(--mw-radius)]', 'bg-[var(--mw-bg)]', 'box-border', 'overflow-hidden', 'shadow-[0_2px_8px_rgba(0,0,0,.08),0_8px_32px_rgba(0,0,0,.06)]');
      s.style.cssText += ';--slide-w:1240px;width:var(--slide-w);min-width:0;aspect-ratio:297/210;';
      if (s.classList.contains('cover-slide')) return;
      if (s.querySelector('[data-role=body]')) return; // already wrapped by weeklyPage
      const label = s.dataset.label || '';
      const bu    = s.dataset.bu || '';
      const team  = s.dataset.team || '';
      const content = s.innerHTML;
      const headerLeft = label ? '<span class="text-sm font-semibold text-[var(--mw-text)]">' + label + '</span>' : '';
      const headerRight = (bu || team) ? '<div class="flex items-center gap-2">' +
        (bu ? '<span class="text-xs text-[var(--mw-text-muted)] font-mono">' + bu + '</span>' : '') +
        (team ? '<span class="text-xs text-[var(--mw-text-muted)] font-mono">' + team + '</span>' : '') + '</div>' : '';
      const header = (headerLeft || headerRight) ?
        '<div data-role="header" class="flex items-center justify-between px-4 py-2 border-b border-[var(--mw-border)] shrink-0 gap-2"><div>' + headerLeft + '</div>' + headerRight + '</div>' : '';
      const pageNum = '<span data-role="pagenum" class="tabular-nums">' + (i + 1) + ' / ' + slides.length + '</span>';
      const footer = '<div data-role="footer" class="shrink-0 px-4 py-1.5 text-right text-xs text-[var(--mw-text-muted)]">' + pageNum + '</div>';
      s.innerHTML = header + '<div data-role="body" class="flex-1 flex flex-col overflow-hidden min-h-0 px-4 py-2 pb-3 gap-0.5 [&>*:not(:only-child)]:!flex-none">' + content + '</div>' + footer;
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
      slides.forEach(s => {
        var isActive = s === target;
        s.toggleAttribute('data-active', isActive);
        s.classList.toggle('hidden', !isActive);
        s.classList.toggle('flex', isActive);
      });
      scaleSlide();
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
        t.classList.toggle('wk-thumb--active', t.dataset.nav === id);
      });
      var activeThumb = scope.querySelector('.wk-thumb--active');
      if (activeThumb) activeThumb.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      const head = scope.querySelector('.wrs__head');
      if (head) head.classList.toggle('wrs__head--active', id === 'cover');
      const idx = SLIDE_IDS.indexOf(id);
      if (indEl)   { indEl.innerHTML = (idx + 1) + ' <span class="wrn-bar__sep">/</span> ' + slides.length; }
      // Update toolbar indicator
      var wtInd = scope.querySelector('#weekly-ind');
      if (wtInd) { wtInd.textContent = (idx + 1) + ' / ' + slides.length; }
      // Refresh active slide's charts via ResizeObserver (fires after layout)
      if (typeof echarts !== 'undefined') {
        target.querySelectorAll('[data-mw-chart]').forEach(c => {
          var inst = echarts.getInstanceByDom(c);
          if (inst) inst.resize();
        });
      }
    }

    function activateOffset(offset) {
      const cur = slides.findIndex(s => s.hasAttribute('data-active'));
      activateById(slides[Math.max(0, Math.min(slides.length - 1, cur + offset))].id);
    }

    function scaleSlide() {
      const SLIDE_W = 1240, SLIDE_H = SLIDE_W * (210 / 297);
      var active = slides.find(function(s) { return s.hasAttribute('data-active'); });
      if (!active) return;
      if (document.body.classList.contains('presenter-mode')) {
        // Always fill viewport width — vertical overflow is clipped
        var s = innerWidth / SLIDE_W;
        var mx = -(SLIDE_W * (1 - s)) / 2;
        var my = -(SLIDE_H * (1 - s)) / 2;
        active.style.setProperty('--slide-scale', s.toFixed(4));
        active.style.margin = my.toFixed(1) + 'px ' + mx.toFixed(1) + 'px';
        return;
      }
      var sa = scope.querySelector('[data-slide-area]');
      if (!sa) return;
      var fitW = (sa.clientWidth - 16) / SLIDE_W;
      var fitH = (sa.clientHeight - 16) / SLIDE_H;
      var s = Math.min(fitW, fitH, 1);
      if (s < 0.1) s = 1;
      var mx = -(SLIDE_W * (1 - s)) / 2;
      var my = -(SLIDE_H * (1 - s)) / 2;
      active.style.setProperty('--slide-scale', s.toFixed(4));
      active.style.margin = my.toFixed(1) + 'px ' + mx.toFixed(1) + 'px';
    }

    function toggleFullscreen() {
      document.body.classList.toggle('presenter-mode');
      localStorage.setItem('weeklyPresenter', document.body.classList.contains('presenter-mode') ? '1' : '0');
      requestAnimationFrame(function() { scaleSlide(); setTimeout(scaleSlide, 300); });
    }

    if (localStorage.getItem('weeklyPresenter') === '1') { document.body.classList.add('presenter-mode'); }
    // ResizeObserver handles initial layout + window resize + panel toggle — no rAF hack needed
    new ResizeObserver(function() { scaleSlide(); }).observe(document.querySelector('[data-slide-area]') || scope);

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
      const isPresenter = document.body.classList.contains('presenter-mode');

      // ── Navigate: next slide ──
      // PPT: →, ↓, Space, Enter, PageDown, N
      if (k === 'ArrowRight' || k === 'ArrowDown' || k === ' ' || k === 'Enter'
        || k === 'PageDown' || k === 'n' || k === 'N'
        || k === 'j' || k === 'J') {
        e.preventDefault(); activateOffset(1);
      }
      // ── Navigate: previous slide ──
      // PPT: ←, ↑, Backspace, PageUp, P
      else if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'Backspace'
        || k === 'PageUp' || k === 'p' || k === 'P'
        || k === 'k' || k === 'K') {
        e.preventDefault(); activateOffset(-1);
      }
      // ── First / Last slide ──
      // PPT: Home / End
      else if (k === 'Home') { e.preventDefault(); activateById(slides[0].id); }
      else if (k === 'End')  { e.preventDefault(); activateById(slides[slides.length - 1].id); }
      // ── Go to slide number (1-9) ──
      else if (!isPresenter && k >= '1' && k <= '9') {
        var idx = parseInt(k) - 1;
        if (idx < slides.length) { e.preventDefault(); activateById(slides[idx].id); }
      }
      // ── Fullscreen / Presenter toggle ──
      // PPT: F5 starts, Escape exits. Also support F key.
      else if (k === 'F5') { e.preventDefault(); if (!isPresenter) toggleFullscreen(); }
      else if (k === 'f' || k === 'F') { e.preventDefault(); toggleFullscreen(); }
      // ── Black screen (B) / White screen (W) — PPT standard ──
      else if (isPresenter && (k === 'b' || k === 'B')) {
        e.preventDefault();
        var sa = scope.querySelector('[data-slide-area]');
        if (sa) sa.style.background = sa.style.background === '#000' ? '' : '#000';
      }
      else if (isPresenter && (k === 'w' || k === 'W')) {
        e.preventDefault();
        var sa = scope.querySelector('[data-slide-area]');
        if (sa) sa.style.background = sa.style.background === '#fff' ? '' : '#fff';
      }
      // ── Code view ──
      else if (k === 'c' || k === 'C') { e.preventDefault(); codeViewOpen ? closeCodeView() : openCodeView(); }
      // ── Escape — exit presenter or close overlay ──
      else if (k === 'Escape') { e.preventDefault(); if (codeViewOpen) closeCodeView(); else if (isPresenter) toggleFullscreen(); }
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

    // Toolbar HTML — Tailwind
    var _tgl = 'inline-flex gap-px p-0.5 bg-[var(--mw-surface-2)] border border-[var(--mw-border)] rounded-[var(--mw-radius)]';
    var _tglBtn = 'px-2 py-0.5 text-[var(--mw-text-xs)] font-medium text-[var(--mw-text-muted)] bg-transparent border-0 cursor-pointer rounded tabular-nums hover:text-[var(--mw-text)]';
    var _tglActive = _tglBtn + ' !bg-[var(--mw-surface)] !text-[var(--mw-text)] shadow-sm';
    var _tglPre = 'inline-flex items-center px-1.5 text-[var(--mw-text-muted)] select-none [&_svg]:block [&_svg]:shrink-0 [&_svg]:opacity-75';
    const vtHtml = viewToggle ? `<div class="${_tgl}" id="${id}-vt">
      <span class="${_tglPre}">${SVG_EYE}</span>
      <button data-view="table" class="${curView==='table'?_tglActive:_tglBtn}">table</button>
      <button data-view="line" class="${curView==='line'?_tglActive:_tglBtn}">line</button>
      <button data-view="bar" class="${curView==='bar'?_tglActive:_tglBtn}">bar</button>
    </div>` : '';
    const utHtml = unitToggle ? `<div class="${_tgl}" id="${id}-ut">
      <span class="${_tglPre}">${SVG_RULER}</span>
      <button data-unit="원" class="${curUnit==='원'?_tglActive:_tglBtn}">원</button>
      <button data-unit="만원" class="${curUnit==='만원'?_tglActive:_tglBtn}">만원</button>
      <button data-unit="억원" class="${curUnit==='억원'?_tglActive:_tglBtn}">억원</button>
    </div>` : '';

    container.innerHTML = `
      <div class="flex items-center justify-between px-1 mb-3">
        <div>
          <span class="text-base font-semibold text-[var(--mw-text)]">${title}</span>
          ${sub ? `<span class="text-sm text-[var(--mw-text-muted)] ml-2">${sub}</span>` : ''}
        </div>
        <div class="flex gap-2 items-center">${vtHtml}${utHtml}</div>
      </div>
      <div class="h-[340px] scroll-table" id="${id}-host"></div>`;

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

    function _syncToggle(wrap, activeBtn) {
      wrap.querySelectorAll('button').forEach(function(b) {
        b.className = b === activeBtn ? _tglActive : _tglBtn;
      });
    }
    if (viewToggle) {
      container.querySelector('#' + id + '-vt').addEventListener('click', e => {
        const btn = e.target.closest('button[data-view]'); if (!btn) return;
        curView = btn.dataset.view;
        _syncToggle(container.querySelector('#' + id + '-vt'), btn);
        render();
      });
    }
    if (unitToggle) {
      container.querySelector('#' + id + '-ut').addEventListener('click', e => {
        const btn = e.target.closest('button[data-unit]'); if (!btn) return;
        curUnit = btn.dataset.unit;
        _syncToggle(container.querySelector('#' + id + '-ut'), btn);
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
    container.className = 'flex flex-col h-screen overflow-hidden'; container.setAttribute('data-viewer', '');

    const sTitle = cfg.sidebarTitle || cfg.title || '';
    const sDate = cfg.sidebarDate || cfg.date || '';

    // Title bar (full width, top)
    var _btn = 'inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium border-none rounded-lg cursor-pointer transition-colors [&_svg]:w-4 [&_svg]:h-4';
    var _btnStyle = 'color:#888;background:transparent;';
    var _btnActiveStyle = 'color:#222;background:#f0f0f0;';
    var _btnAccentStyle = 'color:#fff;background:#222;border-radius:999px;padding:6px 14px;';
    const titlebar = document.createElement('div');
    titlebar.className = 'flex items-center justify-between px-4 py-3 shrink-0 border-b'; titlebar.setAttribute('data-titlebar', '');
    titlebar.style.cssText = 'background:#fff;border-color:#e5e5e5;';
    titlebar.innerHTML =
      '<div class="flex items-center gap-3 min-w-0">' +
        '<span style="font-size:13px;font-weight:600;color:#222;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + sTitle + '</span>' +
        (sDate ? '<span style="font-size:11px;color:#999;white-space:nowrap">' + sDate + '</span>' : '') +
        '<span style="font-size:11px;color:#999;font-variant-numeric:tabular-nums;flex-shrink:0" id="weekly-ind">1 / ' + slides.length + '</span>' +
      '</div>' +
      '<div class="flex items-center gap-2 shrink-0">' +
        '<button class="' + _btn + '" style="' + _btnStyle + '" id="wtb-theme" data-panel="theme"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="8" r="5.5"/><circle cx="8" cy="8" r="2"/></svg>테마</button>' +
        '<button class="' + _btn + '" style="' + _btnStyle + '" id="wtb-code" data-panel="code"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M5 3L1 8l4 5M11 3l4 5-4 5"/></svg>코드</button>' +
        '<button class="' + _btn + '" style="' + _btnStyle + '" id="wtb-export" data-panel="export"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 10v3h10v-3M8 2v8M5 5l3-3 3 3"/></svg>내보내기</button>' +
        '<button class="' + _btn + '" style="' + _btnAccentStyle + '" id="wtb-present"><svg viewBox="0 0 16 16" fill="none"><path d="M4 3l9 5-9 5V3z" fill="currentColor"/></svg>발표</button>' +
      '</div>';
    container.appendChild(titlebar);

    // Unified panel area (slides down below titlebar)
    var panelWrap = document.createElement('div');
    panelWrap.className = 'shrink-0 overflow-hidden border-b'; panelWrap.setAttribute('data-panel', '');
    panelWrap.style.cssText = 'background:#fff;border-color:#e5e5e5;';
    panelWrap.id = 'wk-panel';

    // Theme panel content
    var themePanelContent = '<div data-panel-content="theme" class="hidden" style="padding:8px 0">' +
      '<div id="wk-themes-track"></div></div>';

    // Code uses a dialog overlay (not inline panel)

    // Export panel content — same tile style as theme carousel
    // File format icons — document shape with format label inside
    var _docIcon = function(label, color) {
      return '<div data-swatch class="w-10 h-7 rounded flex items-center justify-center gap-0.5 p-[3px] overflow-hidden" style="background:' + color + ';border:1.5px solid ' + color + '">' +
        '<span class="text-[9px] font-bold text-white tracking-[0.02em]" style="font-family:var(--mw-font)">' + label + '</span>' +
      '</div>';
    };
    var exportPanelContent = '<div data-panel-content="export" class="hidden" style="padding:8px 0">' +
      '<div data-carousel-track class="flex gap-2 px-4 overflow-x-auto scroll-smooth">' +
        '<div data-carousel-item class="flex flex-col items-center gap-1 cursor-pointer shrink-0 min-w-[48px]" data-export="html">' +
          _docIcon('HTML', 'var(--mw-accent)') +
          '<span data-swatch-name class="text-[9px] text-[var(--mw-text-muted)] whitespace-nowrap max-w-[52px] overflow-hidden text-ellipsis">HTML</span>' +
        '</div>' +
        '<div data-carousel-item class="flex flex-col items-center gap-1 cursor-pointer shrink-0 min-w-[48px]" data-export="pdf">' +
          _docIcon('PDF', '#e84545') +
          '<span data-swatch-name class="text-[9px] text-[var(--mw-text-muted)] whitespace-nowrap max-w-[52px] overflow-hidden text-ellipsis">PDF</span>' +
        '</div>' +
        '<div data-carousel-item class="flex flex-col items-center gap-1 cursor-pointer shrink-0 min-w-[48px]" data-export="pptx">' +
          _docIcon('PPTX', '#d4772c') +
          '<span data-swatch-name class="text-[9px] text-[var(--mw-text-muted)] whitespace-nowrap max-w-[52px] overflow-hidden text-ellipsis">PPTX</span>' +
        '</div>' +
      '</div>' +
    '</div>';

    panelWrap.innerHTML = themePanelContent + exportPanelContent;
    container.appendChild(panelWrap);

    // Content row (sidebar + slide area)
    const contentRow = document.createElement('div');
    contentRow.className = 'flex flex-1 min-h-0 overflow-hidden';

    // Sidebar — thumbnails only
    const sidebarWrap = document.createElement('div');
    sidebarWrap.className = 'shrink-0 self-stretch flex';
    const thumbsHTML = slides.map((s, i) =>
      '<div class="wrs__thumb' + (i === 0 ? ' wk-thumb--active' : '') + '" data-nav="' + s.id + '">' +
        '<span class="wk-thumb-num">' + (i + 1) + '</span>' +
        '<div class="wk-thumb-frame"><div class="wk-thumb-content" data-thumb-id="' + s.id + '"></div></div>' +
      '</div>'
    ).join('');
    sidebarWrap.innerHTML = '<aside class="wk-sidebar wrs wrs--thumbs">' +
      '<div class="wk-thumb-list">' + thumbsHTML + '</div>' +
    '</aside>';
    contentRow.appendChild(sidebarWrap);

    // Slide area
    const slideArea = document.createElement('div');
    slideArea.className = 'flex-1 min-w-0 flex items-center justify-center overflow-hidden'; slideArea.setAttribute('data-slide-area', '');
    slideArea.style.background = '#f0f0f0';
    contentRow.appendChild(slideArea);

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

      // Pre-build slide structure — all Tailwind, no BEM
      if (!s.cover) {
        const label = s.label || '';
        const bu = s.bu || '';
        const team = s.team || '';
        const headerLeft = label ? '<span class="text-sm font-semibold text-[var(--mw-text)]">' + label + '</span>' : '';
        const headerRight = (bu || team) ? '<div class="flex items-center gap-2">' +
          (bu ? '<span class="text-xs text-[var(--mw-text-muted)] font-mono">' + bu + '</span>' : '') +
          (team ? '<span class="text-xs text-[var(--mw-text-muted)] font-mono">' + team + '</span>' : '') + '</div>' : '';
        const header = (headerLeft || headerRight) ?
          '<div data-role="header" class="flex items-center justify-between px-4 py-2 border-b border-[var(--mw-border)] shrink-0 gap-2"><div>' + headerLeft + '</div>' + headerRight + '</div>' : '';
        const pageNum = '<span data-role="pagenum" class="tabular-nums">' + (i + 1) + ' / ' + slides.length + '</span>';
        const footer = '<div data-role="footer" class="shrink-0 px-4 py-1.5 text-right text-xs text-[var(--mw-text-muted)]">' + pageNum + '</div>';
        sec.innerHTML = header + '<div data-role="body" class="flex-1 flex flex-col overflow-hidden min-h-0 px-4 py-2 pb-3 gap-0.5 [&>*:not(:only-child)]:!flex-none"></div>' + footer;
      }

      slideArea.appendChild(sec);

      const widgets = s.widgets || [];
      const body = sec.querySelector('[data-role=body]') || sec;
      MOUNT[s.id] = () => {
        if (_mountedOnce[s.id]) return;
        _mountedOnce[s.id] = true;
        let kpiRow = null;
        let prevType = null;
        widgets.forEach((w, wi) => {
          const fn = M[w.type];
          if (!fn) { console.warn('[maging.page/slide] Unknown widget: ' + w.type); return; }
          const wCfg = {};
          for (const k in w) { if (k !== 'type') wCfg[k] = w[k]; }

          // Spacing logic — inline, no CSS selectors needed
          let mt = wi === 0 ? '0' : '8px';                               // default gap
          if (w.type === 'sectionHead' && prevType === 'pageHeader') mt = '2px';   // title → subtitle: tight
          else if (w.type === 'sectionHead') mt = '14px';                          // section break: roomy
          if (prevType === 'sectionHead') mt = '4px';                              // subtitle → content: snug

          if (w.type === 'kpiCard') {
            if (!kpiRow) {
              kpiRow = document.createElement('div');
              kpiRow.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:var(--mw-space-2);margin-top:' + mt;
              body.appendChild(kpiRow);
            }
            const wrap = document.createElement('div');
            kpiRow.appendChild(wrap);
            fn(wrap, wCfg);
          } else {
            kpiRow = null;
            const wrap = document.createElement('div');
            wrap.style.cssText = 'margin-top:' + mt + ';flex:1;min-height:0;display:flex;flex-direction:column';
            body.appendChild(wrap);
            fn(wrap, wCfg);
          }
          prevType = w.type;
        });
      };
    });

    document.body.appendChild(container);
    // Initialize deck synchronously — setTimeout causes React strict mode race
    initDeck(MOUNT, container);

    // Post-process: accent color on last word of cover title
    function applyCoverAccent() {
      // Target ALL cover slides in main slide area (not sidebar thumbnail clones)
      var scope = container.querySelector('[data-slide-area]') || container;
      scope.querySelectorAll('.cover-slide .mw-cover__title').forEach(function(ct) {
        if (ct.querySelector('[data-accent]')) return; // already applied
        var words = ct.textContent.split(' ');
        if (words.length > 1) {
          var last = words.pop();
          ct.innerHTML = words.join(' ') + ' <span data-accent style="color:var(--mw-accent)">' + last + '</span>';
        } else {
          ct.innerHTML = '<span data-accent style="color:var(--mw-accent)">' + words[0] + '</span>';
        }
      });
    }
    applyCoverAccent();
    // Re-apply when cover is lazily mounted (first load on non-cover slide)
    var _coverObs = new MutationObserver(function() {
      var scope = container.querySelector('[data-slide-area]') || container;
      var ct = scope.querySelector('.cover-slide .mw-cover__title');
      if (ct && !ct.querySelector('[data-accent]')) {
        applyCoverAccent();
        rebuildThumbnails();
      }
    });
    var _coverEl = (container.querySelector('[data-slide-area]') || container).querySelector('.cover-slide');
    if (_coverEl) _coverObs.observe(_coverEl, { childList: true, subtree: true });
    // Re-apply after any Maging refresh (theme change etc.)
    var origRefresh = window.Maging?.refreshAll;
    if (origRefresh) {
      window.Maging.refreshAll = function() {
        origRefresh.call(window.Maging);
        applyCoverAccent();
        // Rebuild thumbnails so they reflect new theme/content
        requestAnimationFrame(rebuildThumbnails);
      };
    }

    // Syntax highlighter (Catppuccin Mocha palette)
    function _hlCode(code) {
      var parts = code.split(/(<[^>]+>)/g);
      return parts.map(function(part) {
        if (/^</.test(part)) {
          var esc = part.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
          return '<span style="color:#89b4fa">' + esc + '</span>';
        }
        var s = part.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        s = s.replace(/(\/\/.*)$/gm, '<span style="color:#6c7086;font-style:italic">$1</span>');
        s = s.replace(/('(?:[^'\\]|\\.)*')/g, '<span style="color:#a6e3a1">$1</span>');
        s = s.replace(/("(?:[^"\\]|\\.)*")/g, function(m) {
          if (m.indexOf('style=') >= 0) return m;
          return '<span style="color:#a6e3a1">' + m + '</span>';
        });
        s = s.replace(/\b(Maging)\.([\w]+)/g, '<span style="color:#89dceb">$1.$2</span>');
        s = s.replace(/\b(const|let|var|function|return|new|if|else|true|false|null|window)\b/g, '<span style="color:#cba6f7">$1</span>');
        s = s.replace(/\b(\d+\.?\d*)\b/g, function(m, num, offset, str) {
          // Skip numbers inside style attributes
          if (str.substring(Math.max(0, offset - 10), offset).indexOf('style=') >= 0) return m;
          return '<span style="color:#fab387">' + m + '</span>';
        });
        s = s.replace(/^(\s*)([\w]+)(\s*:)/gm, '$1<span style="color:#b4befe">$2</span>$3');
        return s;
      }).join('');
    }

    // Code dialog (full overlay)
    var _dlgBtn = 'px-3 py-1 text-[11px] font-medium border border-[var(--mw-border)] rounded bg-[var(--mw-surface)] text-[var(--mw-text)] cursor-pointer hover:bg-[var(--mw-surface-2)] transition-colors';
    var _dlgBtnAcc = 'px-3 py-1 text-[11px] font-medium border-none rounded bg-[var(--mw-accent)] text-white cursor-pointer hover:opacity-90';
    var codeOverlay = document.createElement('div');
    codeOverlay.className = 'hidden fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm items-center justify-center p-8';
    codeOverlay.innerHTML =
      '<div class="bg-[var(--mw-surface)] border border-[var(--mw-border)] rounded-lg shadow-2xl w-full max-w-[800px] max-h-[80vh] flex flex-col">' +
        '<div class="flex items-center justify-between px-4 py-3 border-b border-[var(--mw-border)] shrink-0">' +
          '<span class="text-[13px] font-semibold text-[var(--mw-text)]" id="wcd-title"></span>' +
          '<div class="flex gap-1.5">' +
            '<button class="' + _dlgBtn + '" id="wcd-copy">복사</button>' +
            '<button class="' + _dlgBtnAcc + '" id="wcd-download">↓ 다운로드</button>' +
            '<button class="' + _dlgBtn + '" id="wcd-close">닫기</button>' +
          '</div>' +
        '</div>' +
        '<div class="flex-1 min-h-0 overflow-auto p-4" style="background:#1e1e2e"><pre class="m-0 font-mono text-xs leading-relaxed whitespace-pre" id="wcd-code" style="tab-size:2;color:#cdd6f4;font-size:0.72rem;line-height:1.7"></pre></div>' +
      '</div>';
    document.body.appendChild(codeOverlay);

    function openCodeDialog() {
      var theme = document.documentElement.getAttribute('data-theme') || 'flow';
      var ver = M.version || '0.1.25';
      var cdn = 'https://cdn.jsdelivr.net/npm/@m1kapp/maging@' + ver + '/dist';
      var safeCfg = JSON.stringify(cfg, function(k, v) { return typeof v === 'function' ? undefined : v; }, 2);
      var html = '<!DOCTYPE html>\n<html lang="ko" data-theme="' + theme + '">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>' + (cfg.sidebarTitle || 'maging') + '</title>\n  <script src="' + cdn + '/maging-all.js"><\/script>\n</head>\n<body>\n<script>\n  window.addEventListener("maging:ready", function () {\n    Maging.page(' + safeCfg.split('\n').map(function(l, i) { return i === 0 ? l : '    ' + l; }).join('\n') + ');\n  });\n<\/script>\n</body>\n</html>';
      var chars = html.length;
      var tokens = Math.ceil(chars / 3.5);
      codeOverlay.querySelector('#wcd-title').textContent = sTitle + ' — ' + chars.toLocaleString() + '자 · ~' + tokens.toLocaleString() + ' tokens';
      var preEl = codeOverlay.querySelector('#wcd-code');
      preEl._rawCode = html;
      preEl.innerHTML = _hlCode(html);
      codeOverlay.classList.remove('hidden'); codeOverlay.classList.add('flex');
    }
    codeOverlay.querySelector('#wcd-close').addEventListener('click', function() { codeOverlay.classList.add('hidden'); codeOverlay.classList.remove('flex'); });
    codeOverlay.querySelector('#wcd-copy').addEventListener('click', function() {
      var code = codeOverlay.querySelector('#wcd-code')._rawCode || codeOverlay.querySelector('#wcd-code').textContent;
      navigator.clipboard.writeText(code).then(function() {
        var btn = codeOverlay.querySelector('#wcd-copy');
        btn.textContent = '복사됨!';
        setTimeout(function() { btn.textContent = '복사'; }, 1500);
      });
    });
    codeOverlay.querySelector('#wcd-download').addEventListener('click', function() {
      var code = codeOverlay.querySelector('#wcd-code')._rawCode || codeOverlay.querySelector('#wcd-code').textContent;
      var blob = new Blob([code], { type: 'text/html;charset=utf-8' });
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = (cfg.sidebarTitle || 'maging-slide') + '.html'; a.click();
      URL.revokeObjectURL(a.href);
    });
    codeOverlay.addEventListener('click', function(e) {
      if (e.target === codeOverlay) { codeOverlay.classList.add('hidden'); codeOverlay.classList.remove('flex'); }
    });

    // Wire title bar — unified panel system (theme + export only; code uses dialog)
    var wtbPresent = container.querySelector('#wtb-present');
    var panelEl = container.querySelector('#wk-panel');
    var panelBtns = container.querySelectorAll('button[data-panel]');
    var activePanel = null;

    function togglePanel(name) {
      if (!name || activePanel === name) {
        // Close
        panelEl.classList.remove('is-open');
        panelBtns.forEach(function(b) { b.style.cssText = _btnStyle; });
        panelEl.querySelectorAll('[data-panel-content]').forEach(function(p) { p.classList.add('hidden'); });
        activePanel = null;
      } else {
        // Open / switch
        panelEl.querySelectorAll('[data-panel-content]').forEach(function(p) {
          if (p.dataset.panelContent === name) { p.classList.remove('hidden'); p.style.display = ''; }
          else p.classList.add('hidden');
        });
        panelBtns.forEach(function(b) {
          b.style.cssText = b.dataset.panel === name ? _btnActiveStyle : _btnStyle;
        });
        if (name === 'theme') ensureThemeCarousel();
        panelEl.classList.add('is-open');
        activePanel = name;
      }
      // ResizeObserver on [data-slide-area] auto-handles rescale after panel open/close
    }

    panelBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        if (btn.dataset.panel === 'code') { openCodeDialog(); return; }
        togglePanel(btn.dataset.panel);
      });
    });

    // ── Theme carousel ──
    var _themeCache = null;
    var themeTrackEl = container.querySelector('#wk-themes-track');
    function ensureThemeCarousel() {
      if (themeTrackEl.querySelector('[data-carousel-item]')) return;
      var current = document.documentElement.getAttribute('data-theme') || 'flow';
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
      var track = '<div data-carousel-track class="flex gap-2 px-4 overflow-x-auto scroll-smooth">' +
        '<div data-carousel-item class="flex flex-col items-center gap-1 cursor-pointer shrink-0 min-w-[48px]" id="theme-shuffle">' +
          '<div class="w-10 h-7 rounded flex items-center justify-center border-[1.5px] border-dashed border-[var(--mw-border)]">' +
            '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--mw-text-muted)" stroke-width="1.4"><path d="M2 4h4l3 4-3 4H2M14 4h-4l-1.5 2M9.5 10L11 12h3M14 4l-2 2M14 12l-2-2"/></svg>' +
          '</div>' +
          '<span class="text-[9px] text-[var(--mw-text-muted)]">shuffle</span>' +
        '</div>';
      _themeCache.forEach(function(c) {
        var isActive = c.name === current;
        track += '<div data-carousel-item class="flex flex-col items-center gap-1 cursor-pointer shrink-0 min-w-[48px]' + (isActive ? ' is-active' : '') + '" data-theme-pick="' + c.name + '">' +
          '<div data-swatch class="w-10 h-7 rounded flex gap-0.5 p-[3px] overflow-hidden border-[1.5px] border-[var(--mw-border)]" style="background:' + c.bg + '">' +
            '<div class="flex-1 rounded-[1px]" style="background:' + c.accent + ';height:55%"></div>' +
            '<div class="flex-1 rounded-[1px]" style="background:' + c.text + ';height:35%;opacity:0.2"></div>' +
            '<div class="flex-1 rounded-[1px]" style="background:' + c.accent + ';height:75%;opacity:0.5"></div>' +
          '</div>' +
          '<span data-swatch-name class="text-[9px] text-[var(--mw-text-muted)] whitespace-nowrap max-w-[52px] overflow-hidden text-ellipsis">' + c.name + '</span>' +
        '</div>';
      });
      track += '</div>';
      themeTrackEl.innerHTML = track;
    }
    // Theme selection
    themeTrackEl.addEventListener('click', function(e) {
      var item = e.target.closest('[data-theme-pick]');
      if (!item) return;
      var theme = item.dataset.themePick;
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('maging-theme', theme);
      themeTrackEl.querySelectorAll('[data-carousel-item]').forEach(function(el) {
        var active = el.dataset.themePick === theme;
        el.classList.toggle('is-active', active);
        var sw = el.querySelector('[data-swatch]');
        var nm = el.querySelector('[data-swatch-name]');
        if (sw) { sw.style.borderColor = active ? 'var(--mw-accent)' : ''; sw.style.boxShadow = active ? '0 0 0 1px var(--mw-accent)' : ''; }
        if (nm) { nm.style.color = active ? 'var(--mw-accent)' : ''; nm.style.fontWeight = active ? '600' : ''; }
      });
      if (window.Maging?.refreshAll) window.Maging.refreshAll();
    });

    // ── Shuffle theme button (inside theme carousel) ──
    themeTrackEl.addEventListener('click', function(e) {
      if (!e.target.closest('#theme-shuffle')) return;
      e.stopPropagation();
      ensureThemeCarousel();
      if (!_themeCache || !_themeCache.length) return;
      var current = document.documentElement.getAttribute('data-theme') || 'flow';
      var others = _themeCache.filter(function(c) { return c.name !== current; });
      var pick = others[Math.floor(Math.random() * others.length)];
      if (!pick) return;
      document.documentElement.setAttribute('data-theme', pick.name);
      localStorage.setItem('maging-theme', pick.name);
      if (window.Maging?.refreshAll) window.Maging.refreshAll();
    });

    // ── Code preview (inline panel) ──
    function generateCodePreview() {
      var theme = document.documentElement.getAttribute('data-theme') || 'flow';
      var ver = M.version || '0.1.25';
      var cdn = 'https://cdn.jsdelivr.net/npm/@m1kapp/maging@' + ver + '/dist';
      var safeCfg = JSON.stringify(cfg, function(k, v) { return typeof v === 'function' ? undefined : v; }, 2);
      var html = '<!DOCTYPE html>\n<html lang="ko" data-theme="' + theme + '">\n<head>\n  <meta charset="UTF-8">\n  <title>' + (cfg.sidebarTitle || 'maging') + '</title>\n  <script src="' + cdn + '/maging-all.js"><\/script>\n</head>\n<body>\n<script>\nwindow.addEventListener("maging:ready", function () {\n  Maging.page(' + safeCfg + ');\n});\n<\/script>\n</body>\n</html>';
      var pre = container.querySelector('#wk-code-pre');
      if (pre) pre.textContent = html;
    }
    var codeCopyBtn = container.querySelector('#wk-code-copy');
    if (codeCopyBtn) codeCopyBtn.addEventListener('click', function() {
      var code = container.querySelector('#wk-code-pre')?.textContent;
      if (code) navigator.clipboard.writeText(code).then(function() {
        codeCopyBtn.textContent = '복사됨!';
        setTimeout(function() { codeCopyBtn.textContent = '복사'; }, 1500);
      });
    });

    // ── Export buttons ──
    panelEl.querySelectorAll('[data-export]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var format = btn.dataset.export;
        // Close panel after clicking
        togglePanel(null);
        // Use Maging's export system
        if (M._doExport) {
          M._doExport(format);
        } else {
          console.warn('[maging] export not ready — FAB not mounted');
        }
      });
    });

    if (wtbPresent) wtbPresent.addEventListener('click', function() {
      // Delegate to initDeck's toggleFullscreen via keyboard handler
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' }));
    });
    // ── Thumbnail rebuild (called on init + theme change) ──
    var _initDone = false;
    function rebuildThumbnails() {
      var sa = container.querySelector('[data-slide-area]');
      if (!sa) return;
      var thumbList = container.querySelector('.wk-thumb-list');
      var finalSlides = [...sa.children];
      if (thumbList) {
        thumbList.innerHTML = finalSlides.map(function(sec, i) {
          var isActive = sec.hasAttribute('data-active');
          return '<div class="wrs__thumb' + (isActive ? ' wk-thumb--active' : '') + '" data-nav="' + sec.id + '">' +
            '<span class="wk-thumb-num">' + (i + 1) + '</span>' +
            '<div class="wk-thumb-frame"><div class="wk-thumb-content" data-thumb-id="' + sec.id + '"></div></div>' +
          '</div>';
        }).join('');
      }
      finalSlides.forEach(function(sec) {
        var thumb = container.querySelector('[data-thumb-id="' + sec.id + '"]');
        if (!thumb) return;
        var frame = thumb.parentElement;
        var frameW = frame.offsetWidth || 176;
        thumb.style.transform = 'scale(' + (frameW / 1240).toFixed(4) + ')';
        var clone = sec.cloneNode(true);
        clone.removeAttribute('id');
        clone.removeAttribute('data-active');
        clone.style.cssText = 'display:flex;flex-direction:column;width:1240px;min-width:1240px;aspect-ratio:297/210;margin:0;transform:none;';
        thumb.innerHTML = '';
        thumb.appendChild(clone);
      });
      // Re-wire thumbnail clicks
      container.querySelectorAll('.wrs__thumb[data-nav]').forEach(function(t) {
        t.onclick = function() {
          var id = t.dataset.nav;
          if (id) { location.hash = '#' + id; window.dispatchEvent(new HashChangeEvent('hashchange')); }
        };
      });
    }

    // ── Initial mount + paginate (once, after first layout) ──
    var _thumbRo = new ResizeObserver(function() {
      if (_initDone) return;
      var sa = container.querySelector('[data-slide-area]');
      if (!sa || sa.clientWidth === 0) return; // not laid out yet
      _initDone = true;
      _thumbRo.disconnect();

      // Mount all slides eagerly
      var allSlideEls = sa.querySelectorAll('section.slide');
      allSlideEls.forEach(function(sec) { if (MOUNT[sec.id]) MOUNT[sec.id](); });

      // Auto-paginate: split overflowing slides (needs layout)
      requestAnimationFrame(function() {
        [...sa.querySelectorAll('section.slide:not(.cover-slide)')].forEach(function(sec) {
          var body = sec.querySelector('[data-role=body]');
          if (!body || body.scrollHeight <= body.clientHeight) return;
          var widgets = [...body.children];
          var bodyH = body.clientHeight;
          var splitIdx = -1;
          for (var i = 0; i < widgets.length; i++) {
            if (widgets[i].offsetTop + widgets[i].offsetHeight > bodyH) { splitIdx = i; break; }
          }
          if (splitIdx <= 0) return;
          var cont = document.createElement('section');
          cont.className = sec.className;
          cont.id = sec.id + '-cont';
          if (sec.dataset.label) cont.dataset.label = sec.dataset.label;
          if (sec.dataset.bu) cont.dataset.bu = sec.dataset.bu;
          if (sec.dataset.team) cont.dataset.team = sec.dataset.team;
          var hdr = sec.querySelector('[data-role=header]');
          var ftr = sec.querySelector('[data-role=footer]');
          var contBody = document.createElement('div');
          contBody.setAttribute('data-role', 'body');
          contBody.className = 'flex-1 flex flex-col overflow-hidden min-h-0 px-4 py-2 pb-3';
          if (hdr) cont.appendChild(hdr.cloneNode(true));
          cont.appendChild(contBody);
          if (ftr) cont.appendChild(ftr.cloneNode(true));
          cont.classList.add('mw-slide', 'flex', 'flex-col', 'shrink-0', 'rounded-[var(--mw-radius)]', 'bg-[var(--mw-bg)]', 'box-border', 'overflow-hidden');
          cont.style.cssText += ';--slide-w:1240px;width:var(--slide-w);min-width:var(--slide-w);aspect-ratio:297/210;';
          for (var j = splitIdx; j < widgets.length; j++) contBody.appendChild(widgets[j]);
          sec.after(cont);
        });

        // Re-number
        var allFinal = [...sa.children];
        var total = allFinal.length;
        allFinal.forEach(function(sec, i) {
          var pg = sec.querySelector('[data-role=pagenum]');
          if (pg) pg.textContent = (i + 1) + ' / ' + total;
        });
        var wtInd = container.querySelector('#weekly-ind');
        if (wtInd) {
          var activeIdx = allFinal.findIndex(function(s) { return s.hasAttribute('data-active'); });
          wtInd.textContent = (activeIdx + 1) + ' / ' + total;
        }

        // Build thumbnails
        rebuildThumbnails();
        applyCoverAccent();
      });
    });
    _thumbRo.observe(container.querySelector('[data-slide-area]') || container);

    var result = M._pageResult(container, cfg, 'slide');
    container._pageResult = result;
    return result;
  }

  // Expose Maging.deck() + Maging.monthlyTable()
  // — 즉시 등록: maging.js를 sync로 로드한 환경(components 갤러리 등)
  if (window.Maging) {
    window.Maging.deck = initDeck;
    window.Maging.monthlyTable = monthlyTable;
    window.Maging._pageBuilders = window.Maging._pageBuilders || {};
    window.Maging._pageBuilders.slide = weeklyPage;
  }
  // — maging:ready 이벤트: maging-all.js 환경 + DECK_MOUNT 자동 실행
  window.addEventListener('maging:ready', () => {
    if (window.Maging) {
      window.Maging.deck = initDeck;
      window.Maging.monthlyTable = monthlyTable;
      window.Maging._pageBuilders = window.Maging._pageBuilders || {};
      window.Maging._pageBuilders.slide = weeklyPage;
    }
    if (window.DECK_MOUNT) initDeck(window.DECK_MOUNT);
  });
}
