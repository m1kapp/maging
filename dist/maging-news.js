/**
 * maging-news.js — Card News (카드뉴스) deck infrastructure
 *
 * Load after maging.js. Injects CSS, registers <news-nav>,
 * and exposes card-news widget APIs + Maging.newsDeck(MOUNT).
 *
 * Usage:
 *   <script defer src="maging-news.js"></script>
 *   ...
 *   window.addEventListener('maging:ready', () => {
 *     Maging.newsDeck({
 *       'card-cover': () => Maging.coverCard('#card-cover', {...}),
 *       'card-01':    () => Maging.bodyCard('#card-01', {...}),
 *       'card-cta':   () => Maging.ctaCard('#card-cta', {...}),
 *     });
 *   });
 */

(function () {
  // ── helpers ─────────────────────────────────────────────────────────────────
  function esc(s) { return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function q(sel) { return typeof sel === 'string' ? document.querySelector(sel) : sel; }

  // ── 1. CSS injection ───────────────────────────────────────────────────────
  const _style = document.createElement('style');
  _style.textContent = `
  /* ── Card visibility ── */
  .news-card { display: none; }
  .news-card[data-active] { display: block; }

  /* ── Frame: 4:5 (1080×1350) ── */
  .mw-news-frame {
    aspect-ratio: 4 / 5;
    max-width: 540px;
    width: 100%;
    margin: 0 auto;
    background: var(--mw-surface);
    border: 1px solid var(--mw-border);
    border-radius: var(--mw-radius);
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
    font-family: var(--mw-font);
  }
  .mw-news-frame__inner {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: clamp(2rem, 6%, 3.5rem);
    min-height: 0;
  }
  .mw-news-frame__brand {
    padding: 0.75rem clamp(2rem, 6%, 3.5rem);
    font-size: 0.72rem;
    font-weight: 500;
    color: var(--mw-text-muted);
    letter-spacing: 0.02em;
    border-top: 1px solid var(--mw-border);
    background: var(--mw-bg);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
  }
  .mw-news-frame__brand-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: var(--mw-accent);
    flex-shrink: 0;
  }

  /* ── Cover Card ── */
  .mw-news-cover {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 1rem;
  }
  .mw-news-cover--gradient {
    background: linear-gradient(145deg,
      color-mix(in srgb, var(--mw-accent) 8%, var(--mw-surface)),
      var(--mw-surface));
  }
  .mw-news-cover--accent-block .mw-news-cover__icon {
    background: color-mix(in srgb, var(--mw-accent) 12%, transparent);
    width: 4rem; height: 4rem; border-radius: var(--mw-radius);
    display: flex; align-items: center; justify-content: center;
    font-size: 2rem;
  }
  .mw-news-cover__icon { font-size: 3rem; line-height: 1; }
  .mw-news-cover__tag {
    display: inline-block;
    width: fit-content;
    padding: 0.25rem 0.75rem;
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--mw-accent);
    background: color-mix(in srgb, var(--mw-accent) 10%, transparent);
    border-radius: 999px;
    letter-spacing: 0.02em;
  }
  .mw-news-cover__title {
    font-family: var(--mw-display-font, var(--mw-font));
    font-size: clamp(2rem, 5.5cqi, 3rem);
    font-weight: 800;
    line-height: 1.15;
    letter-spacing: -0.02em;
    color: var(--mw-text);
    white-space: pre-line;
  }
  .mw-news-cover__subtitle {
    font-size: clamp(0.9rem, 2.5cqi, 1.15rem);
    color: var(--mw-text-muted);
    line-height: 1.5;
  }

  /* ── Body Card ── */
  .mw-news-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 1.25rem;
  }
  .mw-news-body__num {
    font-family: var(--mw-display-font, var(--mw-font));
    font-size: clamp(2.5rem, 7cqi, 4rem);
    font-weight: 800;
    color: var(--mw-accent);
    line-height: 1;
    letter-spacing: -0.03em;
    opacity: 0.85;
  }
  .mw-news-body__icon { font-size: 2.5rem; line-height: 1; }
  .mw-news-body__heading {
    font-size: clamp(1.4rem, 4cqi, 2rem);
    font-weight: 700;
    line-height: 1.3;
    letter-spacing: -0.015em;
    color: var(--mw-text);
  }
  .mw-news-body__text {
    font-size: clamp(0.85rem, 2.2cqi, 1.05rem);
    color: var(--mw-text-muted);
    line-height: 1.7;
  }
  .mw-news-body__divider {
    width: 2.5rem; height: 3px; border-radius: 2px;
    background: var(--mw-accent);
    opacity: 0.5;
  }

  /* ── Data Card ── */
  .mw-news-data {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .mw-news-data__label {
    font-size: clamp(0.8rem, 2cqi, 0.95rem);
    font-weight: 600;
    color: var(--mw-text-muted);
    letter-spacing: 0.01em;
    text-transform: uppercase;
  }
  .mw-news-data__title {
    font-size: clamp(1.2rem, 3.5cqi, 1.6rem);
    font-weight: 700;
    color: var(--mw-text);
    letter-spacing: -0.01em;
  }
  .mw-news-data__widget {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
  .mw-news-data__widget > .mw-card {
    flex: 1;
    min-height: 0;
  }

  /* ── Numbered Card ── */
  .mw-news-numbered {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .mw-news-numbered__heading {
    font-size: clamp(1.1rem, 3cqi, 1.4rem);
    font-weight: 700;
    color: var(--mw-text);
    letter-spacing: -0.01em;
    margin-bottom: 0.5rem;
  }
  .mw-news-numbered__item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
    background: var(--mw-surface-2);
    border-radius: var(--mw-radius);
  }
  .mw-news-numbered__rank {
    font-family: var(--mw-display-font, var(--mw-font));
    font-size: 1.6rem;
    font-weight: 800;
    color: var(--mw-accent);
    line-height: 1;
    flex-shrink: 0;
    min-width: 2rem;
    letter-spacing: -0.02em;
  }
  .mw-news-numbered__content { flex: 1; min-width: 0; }
  .mw-news-numbered__title {
    font-size: clamp(0.9rem, 2.5cqi, 1.1rem);
    font-weight: 600;
    color: var(--mw-text);
    line-height: 1.3;
  }
  .mw-news-numbered__desc {
    font-size: clamp(0.75rem, 2cqi, 0.88rem);
    color: var(--mw-text-muted);
    margin-top: 0.25rem;
    line-height: 1.5;
  }
  .mw-news-numbered__icon {
    font-size: 1.3rem;
    flex-shrink: 0;
  }

  /* ── CTA Card ── */
  .mw-news-cta {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    gap: 1.5rem;
  }
  .mw-news-cta__heading {
    font-size: clamp(1.3rem, 3.5cqi, 1.8rem);
    font-weight: 700;
    color: var(--mw-text);
    line-height: 1.3;
    letter-spacing: -0.01em;
  }
  .mw-news-cta__subtext {
    font-size: clamp(0.85rem, 2.2cqi, 1rem);
    color: var(--mw-text-muted);
    line-height: 1.6;
  }
  .mw-news-cta__buttons { display: flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center; }
  .mw-news-cta__btn {
    display: inline-flex; align-items: center; justify-content: center;
    padding: 0.75rem 2rem;
    font-size: 0.9rem; font-weight: 600;
    border-radius: var(--mw-radius);
    text-decoration: none;
    transition: opacity 0.15s;
    cursor: pointer;
    border: 1px solid var(--mw-border);
    background: var(--mw-surface);
    color: var(--mw-text);
    font-family: var(--mw-font);
  }
  .mw-news-cta__btn:hover { opacity: 0.85; }
  .mw-news-cta__btn--primary {
    background: var(--mw-accent);
    color: #fff;
    border-color: transparent;
  }
  .mw-news-cta__handles {
    display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center;
    font-size: 0.82rem; color: var(--mw-text-muted);
  }
  .mw-news-cta__handle {
    display: flex; align-items: center; gap: 0.35rem;
  }
  .mw-news-cta__platform {
    font-weight: 600; color: var(--mw-text);
    text-transform: capitalize;
  }

  /* ── Bottom Dot Navigation ── */
  .mw-news-nav {
    position: fixed;
    left: 50%; transform: translateX(-50%);
    bottom: 20px;
    display: inline-flex; align-items: center; gap: 6px;
    padding: 0.5rem 1rem;
    background: var(--mw-surface);
    border: 1px solid var(--mw-border);
    border-radius: 999px;
    box-shadow: 0 8px 24px -6px rgba(0,0,0,.28), 0 2px 6px -2px rgba(0,0,0,.12);
    font-family: var(--mw-font);
    z-index: 50;
    transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s;
  }
  .mw-news-nav:hover {
    transform: translateX(-50%) translateY(-1px);
    box-shadow: 0 12px 32px -6px rgba(0,0,0,.32), 0 4px 10px -2px rgba(0,0,0,.14);
    border-color: var(--mw-accent);
  }
  .mw-news-nav__dots { display: flex; gap: 6px; align-items: center; }
  .mw-news-nav__dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--mw-border);
    cursor: pointer;
    transition: background 0.15s, transform 0.15s;
  }
  .mw-news-nav__dot:hover { background: var(--mw-text-muted); }
  .mw-news-nav__dot--active {
    background: var(--mw-accent);
    transform: scale(1.25);
  }
  .mw-news-nav__counter {
    font-size: 0.78rem;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    color: var(--mw-text);
    padding: 0 4px;
    letter-spacing: -0.01em;
  }
  .mw-news-nav__sep { color: var(--mw-text-muted); margin: 0 1px; }
  .mw-news-nav__divider { width: 1px; height: 14px; background: var(--mw-border); margin: 0 4px; flex-shrink: 0; }
  .mw-news-nav__btn {
    display: inline-flex; align-items: center; justify-content: center;
    width: 28px; height: 28px;
    background: transparent; border: 0; border-radius: 50%;
    color: var(--mw-text-muted); cursor: pointer;
    transition: background 0.15s, color 0.15s;
    font-size: 0.85rem;
  }
  .mw-news-nav__btn:hover { background: var(--mw-surface-2); color: var(--mw-text); }
  .mw-news-nav__btn:disabled { opacity: 0.3; cursor: default; }

  /* ── Presenter mode (4:5 ratio) ── */
  body.news-presenter { overflow: hidden; background: #000; }
  body.news-presenter .mw-site-nav { display: none !important; }
  body.news-presenter .mw-news-nav { bottom: 24px; }
  body.news-presenter main {
    padding: 0 !important; margin: 0 !important;
    display: flex; align-items: center; justify-content: center;
    width: 100vw; height: 100vh; overflow: hidden;
  }
  body.news-presenter .mw-news-frame {
    max-width: none; border: none; border-radius: 0;
  }
`;
  document.head.appendChild(_style);

  // ── 2. <news-nav> custom element ──────────────────────────────────────────
  class NewsNav extends HTMLElement {
    connectedCallback() {
      // Will be populated by newsDeck()
      this.innerHTML = `<nav class="mw-news-nav">
        <button class="mw-news-nav__btn" id="news-prev" disabled>‹</button>
        <div class="mw-news-nav__dots" id="news-dots"></div>
        <div class="mw-news-nav__divider"></div>
        <span class="mw-news-nav__counter" id="news-counter">1 <span class="mw-news-nav__sep">/</span> 1</span>
        <button class="mw-news-nav__btn" id="news-next">›</button>
      </nav>`;
    }
  }
  customElements.define('news-nav', NewsNav);

  // ── 3. Card builder widgets ───────────────────────────────────────────────

  function _frame(el, { brand, innerClass, innerContent, gradientBg }) {
    el = q(el);
    if (!el) return null;
    const bgClass = gradientBg ? ' mw-news-cover--gradient' : '';
    el.innerHTML = `<div class="mw-news-frame">
      <div class="mw-news-frame__inner${bgClass}">
        <div class="${innerClass}">${innerContent}</div>
      </div>
      ${brand ? `<div class="mw-news-frame__brand"><span class="mw-news-frame__brand-dot"></span>${esc(brand)}</div>` : ''}
    </div>`;
    return el;
  }

  /**
   * coverCard — 표지 카드
   */
  function coverCard(sel, cfg) {
    const { icon, title = '', subtitle, tag, brand, style = 'gradient' } = cfg;
    const gradientBg = style === 'gradient';
    const accentBlock = style === 'accent-block';
    const iconClass = accentBlock ? 'mw-news-cover__icon mw-news-cover--accent-block' : 'mw-news-cover__icon';
    const inner = [
      tag ? `<div class="mw-news-cover__tag">${esc(tag)}</div>` : '',
      icon ? `<div class="${iconClass}">${icon}</div>` : '',
      `<div class="mw-news-cover__title">${esc(title)}</div>`,
      subtitle ? `<div class="mw-news-cover__subtitle">${esc(subtitle)}</div>` : '',
    ].filter(Boolean).join('\n');
    return _frame(q(sel), { brand, innerClass: 'mw-news-cover', innerContent: inner, gradientBg });
  }

  /**
   * bodyCard — 본문 카드
   */
  function bodyCard(sel, cfg) {
    const { num, heading = '', text, icon, brand } = cfg;
    const inner = [
      icon ? `<div class="mw-news-body__icon">${icon}</div>` : '',
      num != null ? `<div class="mw-news-body__num">${esc(String(num))}</div>` : '',
      `<div class="mw-news-body__divider"></div>`,
      `<div class="mw-news-body__heading">${esc(heading)}</div>`,
      text ? `<div class="mw-news-body__text">${esc(text)}</div>` : '',
    ].filter(Boolean).join('\n');
    return _frame(q(sel), { brand, innerClass: 'mw-news-body', innerContent: inner, gradientBg: false });
  }

  /**
   * dataCard — 데이터 시각화 카드 (기존 maging 위젯 내장)
   */
  function dataCard(sel, cfg) {
    const { label, title, widget, widgetConfig, brand } = cfg;
    const widgetId = 'nw-data-' + Math.random().toString(36).slice(2, 8);
    const inner = [
      label ? `<div class="mw-news-data__label">${esc(label)}</div>` : '',
      title ? `<div class="mw-news-data__title">${esc(title)}</div>` : '',
      `<div class="mw-news-data__widget" id="${widgetId}"></div>`,
    ].filter(Boolean).join('\n');
    const el = _frame(q(sel), { brand, innerClass: 'mw-news-data', innerContent: inner, gradientBg: false });
    // Mount the maging widget after frame is in DOM
    if (el && widget && window.Maging && window.Maging[widget]) {
      requestAnimationFrame(() => {
        const host = document.getElementById(widgetId);
        if (host) window.Maging[widget](host, widgetConfig || {});
      });
    }
    return el;
  }

  /**
   * numberedCard — 순위/리스트 카드
   */
  function numberedCard(sel, cfg) {
    const { heading, items = [], brand } = cfg;
    const itemsHtml = items.map(it => `
      <div class="mw-news-numbered__item">
        <div class="mw-news-numbered__rank">${esc(String(it.rank))}</div>
        ${it.icon ? `<div class="mw-news-numbered__icon">${it.icon}</div>` : ''}
        <div class="mw-news-numbered__content">
          <div class="mw-news-numbered__title">${esc(it.title)}</div>
          ${it.desc ? `<div class="mw-news-numbered__desc">${esc(it.desc)}</div>` : ''}
        </div>
      </div>`).join('');
    const inner = [
      heading ? `<div class="mw-news-numbered__heading">${esc(heading)}</div>` : '',
      itemsHtml,
    ].filter(Boolean).join('\n');
    return _frame(q(sel), { brand, innerClass: 'mw-news-numbered', innerContent: inner, gradientBg: false });
  }

  /**
   * ctaCard — CTA 마무리 카드
   */
  function ctaCard(sel, cfg) {
    const { heading = '', subtext, ctas = [], handles = [], brand } = cfg;
    const btnsHtml = ctas.length ? `<div class="mw-news-cta__buttons">${ctas.map(c =>
      `<a class="mw-news-cta__btn${c.primary ? ' mw-news-cta__btn--primary' : ''}" ${c.href ? 'href="' + esc(c.href) + '"' : ''}>${esc(c.label)}</a>`
    ).join('')}</div>` : '';
    const handlesHtml = handles.length ? `<div class="mw-news-cta__handles">${handles.map(h =>
      `<span class="mw-news-cta__handle"><span class="mw-news-cta__platform">${esc(h.platform)}</span> ${esc(h.handle)}</span>`
    ).join('')}</div>` : '';
    const inner = [
      `<div class="mw-news-cta__heading">${esc(heading)}</div>`,
      subtext ? `<div class="mw-news-cta__subtext">${esc(subtext)}</div>` : '',
      btnsHtml,
      handlesHtml,
    ].filter(Boolean).join('\n');
    return _frame(q(sel), { brand, innerClass: 'mw-news-cta', innerContent: inner, gradientBg: false });
  }

  // ── 4. Maging.newsDeck(MOUNT) ─────────────────────────────────────────────
  function initNewsDeck(MOUNT) {
    const cards    = [...document.querySelectorAll('section.news-card')];
    const CARD_IDS = cards.map(c => c.id);
    const mounted  = {};
    let currentIdx = 0;

    const dotsEl   = document.getElementById('news-dots');
    const counterEl = document.getElementById('news-counter');
    const prevBtn  = document.getElementById('news-prev');
    const nextBtn  = document.getElementById('news-next');

    // Build dots
    if (dotsEl) {
      dotsEl.innerHTML = cards.map((c, i) =>
        `<span class="mw-news-nav__dot${i === 0 ? ' mw-news-nav__dot--active' : ''}" data-idx="${i}"></span>`
      ).join('');
    }

    function activateByIdx(idx) {
      if (idx < 0 || idx >= cards.length) return;
      currentIdx = idx;
      cards.forEach((c, i) => c.toggleAttribute('data-active', i === idx));
      if (!mounted[CARD_IDS[idx]]) {
        mounted[CARD_IDS[idx]] = true;
        MOUNT[CARD_IDS[idx]]?.();
      }
      // Update dots
      if (dotsEl) {
        dotsEl.querySelectorAll('.mw-news-nav__dot').forEach((d, i) =>
          d.classList.toggle('mw-news-nav__dot--active', i === idx));
      }
      // Update counter
      if (counterEl) {
        counterEl.innerHTML = (idx + 1) + ' <span class="mw-news-nav__sep">/</span> ' + cards.length;
      }
      // Update buttons
      if (prevBtn) prevBtn.disabled = idx === 0;
      if (nextBtn) nextBtn.disabled = idx === cards.length - 1;

      history.replaceState(null, '', '#' + CARD_IDS[idx]);
      window.dispatchEvent(new Event('resize'));
    }

    // Presenter mode scaling (4:5 portrait)
    function scaleFrame() {
      if (!document.body.classList.contains('news-presenter')) {
        document.querySelectorAll('.mw-news-frame').forEach(f => {
          f.style.width = ''; f.style.height = ''; f.style.maxWidth = '';
        });
        return;
      }
      const vw = window.innerWidth, vh = window.innerHeight;
      const ratio = 4 / 5; // width / height
      let fw, fh;
      if (vw / vh > ratio) {
        fh = vh * 0.92; fw = fh * ratio;
      } else {
        fw = vw * 0.92; fh = fw / ratio;
      }
      document.querySelectorAll('.mw-news-frame').forEach(f => {
        f.style.width = fw + 'px';
        f.style.height = fh + 'px';
        f.style.maxWidth = 'none';
        f.style.aspectRatio = 'auto';
      });
    }

    function togglePresenter() {
      const isOn = document.body.classList.toggle('news-presenter');
      localStorage.setItem('newsPresenter', isOn ? '1' : '0');
      scaleFrame();
      setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
    }

    window.addEventListener('resize', scaleFrame);
    if (localStorage.getItem('newsPresenter') === '1') {
      document.body.classList.add('news-presenter');
      scaleFrame();
    }

    // Keyboard
    window.addEventListener('keydown', (e) => {
      if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable]')) return;
      const k = e.key;
      if      (k === 'ArrowRight' || k === 'PageDown' || k === 'j' || k === 'J') { e.preventDefault(); activateByIdx(currentIdx + 1); }
      else if (k === 'ArrowLeft'  || k === 'PageUp'   || k === 'k' || k === 'K') { e.preventDefault(); activateByIdx(currentIdx - 1); }
      else if (k === 'Home') { e.preventDefault(); activateByIdx(0); }
      else if (k === 'End')  { e.preventDefault(); activateByIdx(cards.length - 1); }
      else if (k === 'f' || k === 'F') { e.preventDefault(); togglePresenter(); }
      else if (k === 'Escape') { e.preventDefault(); if (document.body.classList.contains('news-presenter')) togglePresenter(); }
    });

    // Click: dots, prev, next
    document.addEventListener('click', (e) => {
      const dot = e.target.closest('.mw-news-nav__dot');
      if (dot) { activateByIdx(parseInt(dot.dataset.idx)); return; }
      if (e.target.closest('#news-prev')) { activateByIdx(currentIdx - 1); return; }
      if (e.target.closest('#news-next')) { activateByIdx(currentIdx + 1); return; }
    });

    // Touch swipe
    let touchX0 = null;
    const wrap = document.getElementById('cards-wrap') || document.body;
    wrap.addEventListener('touchstart', (e) => { touchX0 = e.touches[0].clientX; }, { passive: true });
    wrap.addEventListener('touchend', (e) => {
      if (touchX0 === null) return;
      const dx = e.changedTouches[0].clientX - touchX0;
      touchX0 = null;
      if (Math.abs(dx) < 50) return;
      if (dx < 0) activateByIdx(currentIdx + 1);
      else        activateByIdx(currentIdx - 1);
    });

    // Hash navigation
    window.addEventListener('hashchange', () => {
      const id = location.hash.slice(1);
      const idx = CARD_IDS.indexOf(id);
      if (idx >= 0) activateByIdx(idx);
    });

    // Init
    const initHash = location.hash.slice(1);
    const initIdx = CARD_IDS.indexOf(initHash);
    activateByIdx(initIdx >= 0 ? initIdx : 0);
  }

  // ── Expose APIs ───────────────────────────────────────────────────────────
  function register(M) {
    M.coverCard = coverCard;
    M.bodyCard = bodyCard;
    M.dataCard = dataCard;
    M.numberedCard = numberedCard;
    M.ctaCard = ctaCard;
    M.newsDeck = initNewsDeck;
  }

  if (window.Maging) register(window.Maging);

  window.addEventListener('maging:ready', () => {
    if (window.Maging) register(window.Maging);
    if (window.NEWS_MOUNT) initNewsDeck(window.NEWS_MOUNT);
  });
})();
