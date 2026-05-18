/**
 * maging-sidebar.js — Unified slide sidebar
 *
 * Shared <maging-sidebar> custom element used by both pitch-deck
 * and weekly-report modes. Load before maging-pitch.js / maging-weekly.js.
 *
 * Attributes:
 *   active     — initial active slide ID (e.g. "cover")
 *   data-title — sidebar title
 *   data-date  — subtitle (date or round text)
 *
 * Reads .slide[data-label] elements from the DOM, groups by
 * data-bu / data-team, and creates page dots for same-label slides.
 * Navigation uses data-nav attributes — deck handlers listen for
 * [data-nav] clicks.
 */

(function () {
  const _style = document.createElement('style');
  _style.textContent = `
  /* === Sidebar === */
  maging-sidebar { flex-shrink: 0; align-self: stretch; display: flex; }
  maging-sidebar .wrs { width: 220px; min-height: 100%; padding: 20px 14px 24px; background: var(--mw-bg); border: 1px solid color-mix(in srgb, var(--mw-border) 40%, transparent); border-right: 1px solid var(--mw-border); border-radius: 0; font-family: var(--mw-font); overflow-y: auto; box-sizing: border-box; box-shadow: 0 2px 8px rgba(0,0,0,.08), 0 8px 32px rgba(0,0,0,.06); scrollbar-width: thin; }

  .wrs__head { padding: 8px 10px 14px; margin-bottom: 8px; border-bottom: 1px solid var(--mw-border); border-radius: 6px 6px 0 0; transition: background 120ms; }
  .wrs__head:hover { background: var(--mw-surface-2); }
  .wrs__head--active { background: color-mix(in srgb, var(--mw-accent) 10%, transparent); border-bottom-color: var(--mw-accent); }
  .wrs__head--active .wrs__title { color: var(--mw-accent); }
  .wrs__title { font-size: 14px; font-weight: 700; color: var(--mw-text); letter-spacing: -0.01em; }
  .wrs__date  { font-size: 11px; color: var(--mw-text-muted); margin-top: 3px; font-variant-numeric: tabular-nums; }
  .wrs__group { margin-top: 16px; }
  .wrs__bu    { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--mw-text-muted); padding: 4px 8px 6px; font-weight: 600; }
  .wrs__team  { margin-top: 4px; padding-bottom: 6px; }
  .wrs__team-label { font-size: 11px; color: var(--mw-text-muted); padding: 4px 8px; font-weight: 500; }
  .wrs__link  { display: flex; align-items: center; gap: 8px; padding: 5px 8px 5px 12px; font-size: 12.5px; color: var(--mw-text); border-radius: 4px; text-decoration: none; line-height: 1.4; cursor: pointer; }
  .wrs__link:hover { background: var(--mw-surface-2); }
  .wrs__link--active { background: color-mix(in srgb, var(--mw-accent) 8%, var(--mw-surface-2)); font-weight: 600; }
  .wrs__link--active .wrs__dash { color: var(--mw-accent); opacity: 1; }
  .wrs__link--active .wrs__lbl { color: var(--mw-accent); }
  .wrs__row { display: flex; align-items: center; gap: 0.25rem; }
  .wrs__dash { color: var(--mw-text-muted); opacity: 0.3; font-size: 0.6rem; flex-shrink: 0; width: 10px; text-align: center; }
  .wrs__link--active .wrs__dash { color: var(--mw-accent); opacity: 1; }
  .wrs__pages { display: flex; gap: 4px; margin-left: auto; flex-shrink: 0; padding-right: 0.25rem; }
  .wrs__page-dot { width: 6px; height: 6px; border-radius: 50%; border: 1.5px solid var(--mw-text-muted); opacity: 0.35; cursor: pointer; transition: all 120ms; }
  .wrs__page-dot:hover { opacity: 0.7; border-color: var(--mw-accent); }
  .wrs__page-dot--active { background: var(--mw-accent); border-color: var(--mw-accent); opacity: 1; }
  .wrs__lbl  { flex: 1; }

  /* === Thumbnail sidebar === */
  .wrs--thumbs { width: 220px; min-height: 100%; padding: 14px 8px 24px; background: #fff; border-right: 1px solid #e5e5e5; font-family: var(--mw-font); overflow-y: auto; box-sizing: border-box; box-shadow: 0 2px 8px rgba(0,0,0,.08), 0 8px 32px rgba(0,0,0,.06); scrollbar-width: thin; display: flex; flex-direction: column; }
  .wrs--thumbs .wrs__head { padding: 6px 8px 12px; margin-bottom: 4px; }
  .wrs--thumbs .wk-thumb-list { display: flex; flex-direction: column; gap: 10px; padding: 4px 2px 4px 0; overflow-y: auto; flex: 1; min-height: 0; }
  .wrs__thumb { display: flex; align-items: flex-start; gap: 4px; cursor: pointer; flex-shrink: 0; }
  .wk-thumb-num { font-size: 10px; color: var(--mw-text-muted); min-width: 16px; text-align: right; padding-top: 3px; font-variant-numeric: tabular-nums; flex-shrink: 0; line-height: 1; }
  .wk-thumb-frame { flex: 1; aspect-ratio: 297/210; overflow: hidden; border: 2px solid color-mix(in srgb, var(--mw-border) 60%, transparent); border-radius: 3px; background: var(--mw-surface); position: relative; transition: border-color 150ms, box-shadow 150ms; }
  .wrs__thumb:hover .wk-thumb-frame { border-color: color-mix(in srgb, var(--mw-accent) 40%, var(--mw-border)); }
  .wk-thumb--active .wk-thumb-frame { border-color: var(--mw-accent); box-shadow: 0 0 0 1px var(--mw-accent); }
  .wk-thumb-content { width: 1240px; height: calc(1240px * 210 / 297); transform-origin: top left; pointer-events: none; position: absolute; top: 0; left: 0; overflow: hidden; background: var(--mw-bg); }
  body.presenter-mode .wrs--thumbs { display: none !important; }

  /* Slide connected to sidebar — override maging.css defaults */
  maging-sidebar ~ main .mw-slide { border: 1px solid color-mix(in srgb, var(--mw-border) 40%, transparent); border-left: none; border-radius: 0; box-shadow: 0 2px 8px rgba(0,0,0,.08), 0 8px 32px rgba(0,0,0,.06); }
`;
  document.head.appendChild(_style);

  if (!customElements.get('maging-sidebar')) {
    class MagingSidebar extends HTMLElement {
      connectedCallback() {
        const active = this.getAttribute('active') || '';
        const title  = this.getAttribute('data-title') || '';
        const date   = this.getAttribute('data-date') || this.getAttribute('data-round') || '';

        // Collect slides, group same-label into page dots
        const rawItems = [...document.querySelectorAll('.slide[data-label]')].map(el => ({
          id: el.id, label: el.dataset.label, bu: el.dataset.bu || '', team: el.dataset.team || '',
        }));
        const navItems = [];
        rawItems.forEach(item => {
          const prev = navItems[navItems.length - 1];
          if (prev && prev.label === item.label) {
            prev.pages.push(item.id);
          } else {
            navItems.push({ ...item, pages: [item.id] });
          }
        });

        // Group by BU/team (flat if no BU present)
        const hasBU = navItems.some(it => it.bu);
        let navHTML = '';
        if (hasBU) {
          const groups = [];
          navItems.forEach(item => {
            let g = groups.find(g => g.bu === item.bu);
            if (!g) { g = { bu: item.bu, teams: [] }; groups.push(g); }
            let t = g.teams.find(t => t.team === item.team);
            if (!t) { t = { team: item.team, items: [] }; g.teams.push(t); }
            t.items.push(item);
          });
          navHTML = groups.map(g =>
            '<div class="wrs__group"><div class="wrs__bu">' + g.bu + '</div>' +
            g.teams.map(t =>
              '<div class="wrs__team">' + (t.team ? '<div class="wrs__team-label">' + t.team + '</div>' : '') +
              t.items.map(it => this._renderItem(it, active)).join('') +
              '</div>'
            ).join('') + '</div>'
          ).join('');
        } else {
          navHTML = navItems.map(it => this._renderItem(it, active)).join('');
        }

        this.innerHTML = '<aside class="wrs">' +
          '<a class="wrs__head' + (active === 'cover' ? ' wrs__head--active' : '') + '" style="text-decoration:none;color:inherit;cursor:pointer;display:block" data-nav="cover">' +
            '<div class="wrs__title">' + title + '</div>' +
            (date ? '<div class="wrs__date">' + date + '</div>' : '') +
          '</a>' + navHTML +
        '</aside>';
      }
      _renderItem(it, active) {
        const isActive = it.pages.some(p => p === active);
        const dots = it.pages.length > 1
          ? '<span class="wrs__pages">' + it.pages.map((p, i) =>
              '<a class="wrs__page-dot' + (p === active ? ' wrs__page-dot--active' : '') + '" data-nav="' + p + '" title="' + (i+1) + '/' + it.pages.length + '"></a>'
            ).join('') + '</span>'
          : '';
        return '<div class="wrs__row">' +
          '<a class="wrs__link' + (isActive ? ' wrs__link--active' : '') + '" data-nav="' + it.pages[0] + '">' +
            '<span class="wrs__dash">―</span><span class="wrs__lbl">' + it.label + '</span>' +
          '</a>' + dots + '</div>';
      }
    }
    customElements.define('maging-sidebar', MagingSidebar);
  }

  // ── Shared bottom nav bar (used by maging-pitch.js and maging-weekly.js) ──
  window._magingNavBar = function(slideCount) {
    if (document.getElementById('deck-nav-bar')) return;
    // Skip if HTML already has a wrn-bar (e.g. weekly templates)
    if (document.querySelector('.wrn-bar')) return;
    var bar = document.createElement('div');
    bar.className = 'wrn-bar';
    bar.id = 'deck-nav-bar';
    var hasCodeView = !!document.getElementById('code-view');
    bar.innerHTML = '<span class="wrn-bar__indicator" id="deck-ind">1 <span class="wrn-bar__sep">/</span> ' + slideCount + '</span>' +
      '<span class="wrn-bar__divider"></span>' +
      (hasCodeView ? '<button class="wrn-bar__btn" id="deck-code" type="button" title="코드보기 (C)" aria-label="코드보기"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 3L1 8l4 5M11 3l4 5-4 5"/></svg></button>' : '') +
      '<button class="wrn-bar__btn" id="deck-fs" type="button" title="전체화면 (F)" aria-label="전체화면"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4"/></svg></button>';
    document.body.appendChild(bar);
  };

  // ── Shared slide scaling (used by maging-pitch.js and maging-weekly.js) ──
  window._magingScaleSlides = function(slides) {
    const SLIDE_W = 1240, SLIDE_H = SLIDE_W * (210 / 297);

    // Presenter mode — scale each slide to fill viewport
    if (document.body.classList.contains('presenter-mode')) {
      var flexEl = document.querySelector('body > .flex');
      if (flexEl) { flexEl.style.transform = ''; flexEl.style.marginBottom = ''; flexEl.style.marginTop = ''; }
      var s = Math.min(innerWidth / SLIDE_W, innerHeight / SLIDE_H);
      var mx = -(SLIDE_W * (1 - s)) / 2;
      var my = -(SLIDE_H * (1 - s)) / 2;
      slides.forEach(function(el) { el.style.setProperty('--slide-scale', s.toFixed(4)); el.style.margin = my.toFixed(1) + 'px ' + mx.toFixed(1) + 'px'; });
      return;
    }

    // Slide viewer mode — scale slide to fill [data-slide-area]
    var slideArea = document.querySelector('[data-slide-area]');
    if (slideArea) {
      var areaW = slideArea.clientWidth;
      var areaH = slideArea.clientHeight;
      var fitW = (areaW - 16) / SLIDE_W;   // 8px margin each side
      var fitH = (areaH - 16) / SLIDE_H;   // 8px top/bottom
      var s = Math.min(fitW, fitH, 1);      // cap at 1x — never zoom beyond native
      if (s < 0.1) s = 1;
      // Margin compensation: after transform:scale, the element still occupies
      // its original layout size. Negative margins shrink the layout box to
      // match the visual size, so flex centering works correctly.
      var mx = -(SLIDE_W * (1 - s)) / 2;
      var my = -(SLIDE_H * (1 - s)) / 2;
      slides.forEach(function(el) {
        el.style.setProperty('--slide-scale', s.toFixed(4));
        el.style.margin = my.toFixed(1) + 'px ' + mx.toFixed(1) + 'px';
      });
      return;
    }

    // Pitch mode — scale body > .flex container
    var flexEl = document.querySelector('body > .flex');
    slides.forEach(function(el) { el.style.setProperty('--slide-scale', '1'); el.style.marginBottom = '0'; el.style.marginRight = '0'; });
    if (!flexEl) return;
    var sidebar = document.querySelector('maging-sidebar .wrs');
    var sidebarW = sidebar ? sidebar.offsetWidth : 220;
    var totalW = sidebarW + SLIDE_W;
    var available = innerWidth;
    var s = available < totalW ? available / totalW : 1;
    flexEl.style.transformOrigin = 'top left';
    flexEl.style.transform = s < 1 ? 'scale(' + s.toFixed(4) + ')' : '';
    // Vertically center: compensate phantom space from transform
    var actualH = flexEl.scrollHeight;
    var phantomH = actualH * (1 - s);
    var navH = (document.querySelector('maging-nav') || document.querySelector('.mw-site-nav') || {}).offsetHeight || 45;
    var visualH = actualH * s;
    var freeSpace = Math.max(0, innerHeight - navH - visualH);
    var pad = freeSpace / 2;
    flexEl.style.marginTop = s < 1 ? pad + 'px' : 'auto';
    flexEl.style.marginBottom = s < 1 ? (-phantomH + pad) + 'px' : 'auto';
  };
})();
