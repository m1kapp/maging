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
})();
