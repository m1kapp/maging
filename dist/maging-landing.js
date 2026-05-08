/*! maging-landing v0.1.16 — Landing-page widgets for maging | MIT
 *  Requires maging.js loaded first.
 *  Usage:
 *    <script src="maging.js"></script>
 *    <script src="maging-landing.js"></script>
 *    Maging.heroSection('#el', { kicker, title, subtitle, ctas, ... });
 */
(function (global) {
  'use strict';

  var M = global.Maging;
  if (!M) {
    console.warn('[maging-landing] Maging core is not loaded. Add maging.js before maging-landing.js.');
    return;
  }

  // Borrow helpers from core
  function q(sel) { return typeof sel === 'string' ? document.querySelector(sel) : sel; }
  function esc(s) {
    if (s == null) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // ──────────────────────────────────────────────
  // Inject landing-specific CSS (once)
  // ──────────────────────────────────────────────
  if (!document.getElementById('mw-landing-css')) {
    var style = document.createElement('style');
    style.id = 'mw-landing-css';
    style.textContent = [

      /* ── hero section ── */
      '.mw-hero-section { position: relative; text-align: center; overflow: hidden; }',
      '.mw-hero-section::before {',
      '  content: ""; position: absolute; inset: 0;',
      '  background: radial-gradient(ellipse 70% 50% at 50% 0%, color-mix(in srgb, var(--mw-accent) 12%, transparent), transparent 70%);',
      '  pointer-events: none;',
      '}',
      '.mw-hero-section__inner { position: relative; max-width: 800px; margin: 0 auto; }',
      '.mw-hero-section__kicker {',
      '  font-size: var(--mw-text-xs); color: var(--mw-text-muted); text-transform: uppercase;',
      '  letter-spacing: 0.1em; font-family: var(--mw-font); margin-bottom: 0.75rem;',
      '}',
      '.mw-hero-section__title {',
      '  font-size: clamp(2rem, 5vw, 3.25rem); font-weight: 700;',
      '  letter-spacing: -0.025em; line-height: 1.15; margin: 0 0 1rem;',
      '  font-family: var(--mw-display-font);',
      '}',
      '.mw-hero-section__subtitle {',
      '  font-size: var(--mw-text-md); color: var(--mw-text-muted);',
      '  max-width: 540px; margin: 0 auto 2rem; line-height: 1.65;',
      '}',
      '.mw-hero-section__ctas { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }',

      /* ── hero word roller ── */
      '.mw-roller { display: inline-block; overflow: hidden; height: 1.08em; vertical-align: bottom; color: var(--mw-accent); }',
      '.mw-roller__inner { display: flex; flex-direction: column; animation: mwRoll var(--mw-roller-dur, 12s) cubic-bezier(0.76,0,0.24,1) infinite; }',
      '.mw-roller__item { height: 1.08em; line-height: 1.08; white-space: nowrap; }',
      '@keyframes mwRoll {',
      '  0%,15% { transform: translateY(0); }',
      '  20%,35% { transform: translateY(-1.08em); }',
      '  40%,55% { transform: translateY(-2.16em); }',
      '  60%,75% { transform: translateY(-3.24em); }',
      '  80%,95% { transform: translateY(-4.32em); }',
      '  100% { transform: translateY(-5.40em); }',
      '}',
      '@media (prefers-reduced-motion: reduce) { .mw-roller__inner { animation: none; } }',

      /* ── shared pill / button ── */
      '.mw-lp-btn {',
      '  padding: 0.625rem 1.25rem; font-size: 0.8rem; border-radius: var(--mw-radius);',
      '  border: 1px solid var(--mw-border); background: var(--mw-surface); color: var(--mw-text-muted);',
      '  cursor: pointer; font-family: var(--mw-font); text-decoration: none;',
      '  display: inline-flex; align-items: center; gap: 0.375rem; transition: all 0.15s; font-weight: 500;',
      '}',
      '.mw-lp-btn:hover { color: var(--mw-text); border-color: var(--mw-accent); }',
      '.mw-lp-btn--primary { background: var(--mw-accent); color: #fff; border-color: var(--mw-accent); }',
      '.mw-lp-btn--primary:hover { opacity: 0.9; color: #fff; }',
      '[data-theme="terminal"] .mw-lp-btn--primary { color: #000; }',
      '.mw-lp-btn--lg { padding: 0.8rem 1.75rem; font-size: 0.9rem; }',

      /* ── feature grid ── */
      '.mw-features { display: grid; gap: 1.25rem; }',
      '@media (min-width: 640px) { .mw-features { grid-template-columns: repeat(2, 1fr); } }',
      '@media (min-width: 960px) { .mw-features--cols-3 { grid-template-columns: repeat(3, 1fr); } }',
      '@media (min-width: 960px) { .mw-features--cols-4 { grid-template-columns: repeat(4, 1fr); } }',
      '.mw-feature-card {',
      '  background: var(--mw-surface); border: 1px solid var(--mw-border);',
      '  border-radius: var(--mw-radius); padding: 1.75rem;',
      '  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;',
      '}',
      '.mw-feature-card:hover {',
      '  border-color: var(--mw-accent); transform: translateY(-2px);',
      '  box-shadow: 0 8px 24px -8px color-mix(in srgb, var(--mw-accent) 15%, transparent);',
      '}',
      '.mw-feature-card__icon {',
      '  width: 40px; height: 40px; display: inline-flex; align-items: center; justify-content: center;',
      '  background: color-mix(in srgb, var(--mw-accent) 12%, transparent);',
      '  color: var(--mw-accent); border-radius: var(--mw-radius); font-size: 1.1rem; margin-bottom: 0.75rem;',
      '}',
      '.mw-feature-card__title { font-size: var(--mw-text-base); font-weight: 600; margin-bottom: 0.35rem; font-family: var(--mw-display-font); }',
      '.mw-feature-card__desc { font-size: var(--mw-text-sm); color: var(--mw-text-muted); line-height: 1.6; }',

      /* ── pricing table ── */
      '.mw-pricing { display: grid; gap: 1.25rem; align-items: stretch; }',
      '@media (min-width: 640px) { .mw-pricing { grid-template-columns: repeat(2, 1fr); } }',
      '@media (min-width: 960px) { .mw-pricing--cols-3 { grid-template-columns: repeat(3, 1fr); } }',
      '.mw-price-card {',
      '  background: var(--mw-surface); border: 1px solid var(--mw-border);',
      '  border-radius: var(--mw-radius); padding: 2rem; position: relative;',
      '  display: flex; flex-direction: column;',
      '}',
      '.mw-price-card__features { flex: 1; }',
      '.mw-price-card--popular { border-color: var(--mw-accent); box-shadow: 0 0 0 1px var(--mw-accent); }',
      '.mw-price-card__badge {',
      '  position: absolute; top: -10px; left: 50%; transform: translateX(-50%);',
      '  background: var(--mw-accent); color: #fff; font-size: var(--mw-text-xs);',
      '  padding: 0.2rem 0.75rem; border-radius: 999px; font-weight: 600; font-family: var(--mw-font);',
      '}',
      '[data-theme="terminal"] .mw-price-card__badge { color: #000; }',
      '.mw-price-card__name { font-size: var(--mw-text-lg); font-weight: 700; margin-bottom: 0.25rem; font-family: var(--mw-display-font); }',
      '.mw-price-card__desc { font-size: var(--mw-text-sm); color: var(--mw-text-muted); margin-bottom: 1.25rem; }',
      '.mw-price-card__price { font-size: var(--mw-text-2xl); font-weight: 700; margin-bottom: 0.25rem; }',
      '.mw-price-card__period { font-size: var(--mw-text-xs); color: var(--mw-text-muted); margin-bottom: 1.5rem; }',
      '.mw-price-card__features { list-style: none; padding: 0; margin: 0 0 1.5rem; }',
      '.mw-price-card__features li {',
      '  font-size: var(--mw-text-sm); padding: 0.4rem 0;',
      '  border-bottom: 1px solid color-mix(in srgb, var(--mw-border) 50%, transparent);',
      '  display: flex; align-items: center; gap: 0.5rem;',
      '}',
      '.mw-price-card__features li::before { content: "✓"; color: var(--mw-success); font-weight: 700; font-size: 0.8rem; }',
      '.mw-price-card__cta { width: 100%; }',

      /* ── testimonial ── */
      '.mw-testimonials { display: grid; gap: 1.25rem; align-items: stretch; }',
      '@media (min-width: 640px) { .mw-testimonials { grid-template-columns: repeat(2, minmax(260px, 1fr)); } }',
      '@media (min-width: 960px) { .mw-testimonials--cols-3 { grid-template-columns: repeat(3, minmax(260px, 1fr)); } }',
      '.mw-testimonial {',
      '  background: var(--mw-surface); border: 1px solid var(--mw-border);',
      '  border-radius: var(--mw-radius); padding: 2rem;',
      '  display: flex; flex-direction: column; min-width: 260px;',
      '}',
      '.mw-testimonial__quote { flex: 1; }',
      '.mw-testimonial__quote {',
      '  font-size: var(--mw-text-sm); line-height: 1.7; margin-bottom: 1.5rem;',
      '  color: var(--mw-text); position: relative; padding-top: 1.5rem;',
      '}',
      '.mw-testimonial__quote::before {',
      '  content: ""; position: absolute; top: 0; left: 0;',
      '  width: 24px; height: 18px; opacity: 0.15;',
      '  background: var(--mw-accent);',
      '  mask: url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 18\'%3E%3Cpath d=\'M0 18V8.4C0 3.36 3.12.48 9.36 0l.84 2.16C6.96 3 5.52 4.44 5.28 6.48H9.6V18H0zm13.2 0V8.4C13.2 3.36 16.32.48 22.56 0l.84 2.16c-3.24.84-4.68 2.28-4.92 4.32h4.32V18H13.2z\'/%3E%3C/svg%3E") no-repeat center / contain;',
      '  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 18\'%3E%3Cpath d=\'M0 18V8.4C0 3.36 3.12.48 9.36 0l.84 2.16C6.96 3 5.52 4.44 5.28 6.48H9.6V18H0zm13.2 0V8.4C13.2 3.36 16.32.48 22.56 0l.84 2.16c-3.24.84-4.68 2.28-4.92 4.32h4.32V18H13.2z\'/%3E%3C/svg%3E") no-repeat center / contain;',
      '}',
      '.mw-testimonial__author { display: flex; align-items: center; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid var(--mw-border); }',
      '.mw-testimonial__avatar {',
      '  width: 36px; height: 36px; border-radius: 50%;',
      '  background: color-mix(in srgb, var(--mw-accent) 15%, transparent);',
      '  color: var(--mw-accent); display: flex; align-items: center; justify-content: center;',
      '  font-weight: 700; font-size: 0.8rem;',
      '}',
      '.mw-testimonial__name { font-size: var(--mw-text-sm); font-weight: 600; }',
      '.mw-testimonial__role { font-size: var(--mw-text-xs); color: var(--mw-text-muted); }',

      /* ── logo bar ── */
      '.mw-logo-bar { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 1.5rem 2.5rem; padding: 1rem 0; }',
      '.mw-logo-bar__item {',
      '  font-size: var(--mw-text-base); font-weight: 700; color: var(--mw-text);',
      '  opacity: 0.25; transition: opacity 0.2s; display: flex; align-items: center; gap: 0.5rem;',
      '  letter-spacing: -0.01em; font-family: var(--mw-display-font);',
      '}',
      '.mw-logo-bar__item:hover { opacity: 0.6; }',
      '.mw-logo-bar__icon { font-size: 1.25rem; }',

      /* ── CTA section ── */
      '.mw-cta-section { text-align: center; background: var(--mw-surface); border-top: 1px solid var(--mw-border); }',
      '.mw-cta-section__inner { max-width: 600px; margin: 0 auto; }',
      '.mw-cta-section__kicker {',
      '  font-size: var(--mw-text-xs); color: var(--mw-text-muted); text-transform: uppercase;',
      '  letter-spacing: 0.1em; font-family: var(--mw-font); margin-bottom: 0.5rem;',
      '}',
      '.mw-cta-section__title {',
      '  font-size: clamp(1.5rem, 3vw, 2.25rem); font-weight: 700;',
      '  letter-spacing: -0.02em; margin: 0.5rem 0 0.75rem; font-family: var(--mw-display-font);',
      '}',
      '.mw-cta-section__desc { color: var(--mw-text-muted); font-size: var(--mw-text-sm); margin-bottom: 1.5rem; }',
      '.mw-cta-section__actions { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }',

      /* ── FAQ accordion ── */
      '.mw-faq { width: 100%; }',
      '.mw-faq__item { border-bottom: 1px solid var(--mw-border); }',
      '.mw-faq__q {',
      '  width: 100%; background: none; border: none; padding: 1.125rem 0; cursor: pointer;',
      '  font-size: var(--mw-text-base); font-weight: 600; text-align: left;',
      '  color: var(--mw-text); font-family: var(--mw-font);',
      '  display: flex; align-items: center; justify-content: space-between; gap: 1rem;',
      '}',
      '.mw-faq__q:hover { color: var(--mw-accent); }',
      '.mw-faq__arrow { transition: transform 0.2s; font-size: 0.75rem; color: var(--mw-text-muted); flex-shrink: 0; }',
      '.mw-faq__item.is-open .mw-faq__arrow { transform: rotate(180deg); }',
      '.mw-faq__a {',
      '  font-size: var(--mw-text-sm); color: var(--mw-text-muted); line-height: 1.65;',
      '  max-height: 0; overflow: hidden; transition: max-height 0.3s ease, padding 0.3s ease;',
      '  padding: 0 0 0;',
      '}',
      '.mw-faq__item.is-open .mw-faq__a { max-height: 500px; padding: 0 0 1.125rem; }',

      /* ── mobile adjustments ── */
      '@media (max-width: 639px) {',
      '  .mw-hero-section { padding: 3.5rem 1.25rem 2.5rem !important; }',
      '  .mw-hero-section__title { font-size: 1.75rem !important; }',
      '  .mw-hero-section__subtitle { font-size: 0.875rem; }',
      '  .mw-hero-section__ctas { flex-direction: column; align-items: center; }',
      '  .mw-lp-btn { width: 100%; max-width: 280px; justify-content: center; }',
      '  .mw-logo-bar { gap: 1rem 1.5rem; }',
      '  .mw-logo-bar__item { font-size: var(--mw-text-sm); }',
      '  .mw-feature-card { padding: 1.25rem; }',
      '  .mw-price-card { padding: 1.5rem; }',
      '  .mw-testimonial { padding: 1.25rem; }',
      '  .mw-faq__q { font-size: var(--mw-text-sm); padding: 0.875rem 0; }',
      '  .mw-cta-section { padding: 3rem 1.25rem !important; }',
      '  .mw-cta-section__title { font-size: 1.375rem !important; }',
      '  .mw-cta-section__actions { flex-direction: column; align-items: center; }',
      '}',

      /* ── section helper ── */
      '.mw-lp-section { max-width: 1280px; margin: 0 auto; scroll-margin-top: 60px; }',

    ].join('\n');
    document.head.appendChild(style);
  }

  // ──────────────────────────────────────────────
  // Widget: Hero Section
  // ──────────────────────────────────────────────
  function heroSection(el, config) {
    el = q(el);
    if (!el) return null;
    var d = Object.assign({
      kicker: '', title: '', subtitle: '',
      ctas: [],   // [{ label, href, primary? }]
      roller: null, // string[] — word roller animation
      rollerDuration: 12000, // ms
      padding: '6rem 1.5rem 4rem',
    }, config || {});

    el.className = 'mw-hero-section';
    el.style.padding = d.padding;

    // Build title with optional word roller
    var titleHTML = d.title;
    if (d.roller && Array.isArray(d.roller) && d.roller.length > 1 && titleHTML.indexOf('{{roller}}') !== -1) {
      var words = d.roller.concat([d.roller[0]]); // duplicate first for seamless loop
      var n = words.length;
      // Build dynamic keyframes for n items
      var kfName = 'mwRoll' + n;
      var kfRules = [];
      for (var i = 0; i < n - 1; i++) {
        var pStart = Math.round((i / (n - 1)) * 80 + (i > 0 ? 5 : 0));
        var pEnd = Math.round(((i + 1) / (n - 1)) * 80 - 5);
        kfRules.push(pStart + '%,' + pEnd + '% { transform: translateY(' + (-i * 1.08) + 'em); }');
      }
      kfRules.push('100% { transform: translateY(' + (-(n - 1) * 1.08) + 'em); }');
      // Inject per-instance keyframe if not standard 6-item
      if (n !== 6) {
        var kfStyle = document.createElement('style');
        kfStyle.textContent = '@keyframes ' + kfName + ' { ' + kfRules.join(' ') + ' }';
        document.head.appendChild(kfStyle);
      } else {
        kfName = 'mwRoll';
      }

      var rollerItems = words.map(function (w) { return '<span class="mw-roller__item">' + esc(w) + '</span>'; }).join('');
      var rollerHTML = '<span class="mw-roller" aria-label="' + esc(d.roller.join(' / ')) + '">' +
        '<span class="mw-roller__inner" style="animation-name:' + kfName + ';--mw-roller-dur:' + d.rollerDuration + 'ms">' +
        rollerItems + '</span></span>';
      titleHTML = titleHTML.replace('{{roller}}', rollerHTML);
    }

    var ctasHTML = d.ctas.map(function (c) {
      var cls = 'mw-lp-btn' + (c.primary ? ' mw-lp-btn--primary' : '');
      return '<a href="' + esc(c.href || '#') + '" class="' + cls + '">' + esc(c.label) + '</a>';
    }).join('');

    el.innerHTML =
      '<div class="mw-hero-section__inner">' +
        (d.kicker ? '<div class="mw-hero-section__kicker">' + esc(d.kicker) + '</div>' : '') +
        '<h1 class="mw-hero-section__title">' + titleHTML + '</h1>' +
        (d.subtitle ? '<p class="mw-hero-section__subtitle">' + d.subtitle + '</p>' : '') +
        (ctasHTML ? '<div class="mw-hero-section__ctas">' + ctasHTML + '</div>' : '') +
      '</div>';

    return el;
  }

  // ──────────────────────────────────────────────
  // Widget: Feature Grid
  // ──────────────────────────────────────────────
  function featureGrid(el, config) {
    el = q(el);
    if (!el) return null;
    var d = Object.assign({ cols: 3, items: [] }, config || {});

    var cards = d.items.map(function (it) {
      return '<div class="mw-feature-card">' +
        (it.icon ? '<div class="mw-feature-card__icon">' + it.icon + '</div>' : '') +
        '<div class="mw-feature-card__title">' + esc(it.title) + '</div>' +
        '<div class="mw-feature-card__desc">' + esc(it.desc) + '</div>' +
      '</div>';
    }).join('');

    el.className = 'mw-features mw-features--cols-' + d.cols;
    el.innerHTML = cards;
    return el;
  }

  // ──────────────────────────────────────────────
  // Widget: Pricing Table
  // ──────────────────────────────────────────────
  function pricingTable(el, config) {
    el = q(el);
    if (!el) return null;
    var d = Object.assign({ plans: [] }, config || {});

    var cols = d.plans.length;
    var cards = d.plans.map(function (p) {
      var featHTML = (p.features || []).map(function (f) {
        return '<li>' + esc(f) + '</li>';
      }).join('');

      var ctaCls = 'mw-lp-btn mw-price-card__cta' + (p.popular ? ' mw-lp-btn--primary' : '');
      var ctaHTML = p.cta
        ? '<a href="' + esc(p.cta.href || '#') + '" class="' + ctaCls + '">' + esc(p.cta.label) + '</a>'
        : '';

      return '<div class="mw-price-card' + (p.popular ? ' mw-price-card--popular' : '') + '">' +
        (p.popular ? '<div class="mw-price-card__badge">' + esc(p.badge || 'Popular') + '</div>' : '') +
        '<div class="mw-price-card__name">' + esc(p.name) + '</div>' +
        (p.desc ? '<div class="mw-price-card__desc">' + esc(p.desc) + '</div>' : '') +
        '<div class="mw-price-card__price">' + esc(p.price) + '</div>' +
        (p.period ? '<div class="mw-price-card__period">' + esc(p.period) + '</div>' : '') +
        (featHTML ? '<ul class="mw-price-card__features">' + featHTML + '</ul>' : '') +
        ctaHTML +
      '</div>';
    }).join('');

    el.className = 'mw-pricing' + (cols >= 3 ? ' mw-pricing--cols-3' : '');
    el.innerHTML = cards;
    return el;
  }

  // ──────────────────────────────────────────────
  // Widget: Testimonial Cards
  // ──────────────────────────────────────────────
  function testimonialGrid(el, config) {
    el = q(el);
    if (!el) return null;
    var d = Object.assign({ cols: 3, items: [] }, config || {});

    var cards = d.items.map(function (it) {
      var initial = it.initial || (it.name ? it.name.charAt(0) : '?');
      return '<div class="mw-testimonial">' +
        '<div class="mw-testimonial__quote">' + esc(it.quote) + '</div>' +
        '<div class="mw-testimonial__author">' +
          '<div class="mw-testimonial__avatar">' + esc(initial) + '</div>' +
          '<div>' +
            '<div class="mw-testimonial__name">' + esc(it.name) + '</div>' +
            (it.role ? '<div class="mw-testimonial__role">' + esc(it.role) + '</div>' : '') +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    el.className = 'mw-testimonials mw-testimonials--cols-' + d.cols;
    el.innerHTML = cards;
    return el;
  }

  // ──────────────────────────────────────────────
  // Widget: Logo Bar (social proof)
  // ──────────────────────────────────────────────
  function logoBar(el, config) {
    el = q(el);
    if (!el) return null;
    var d = Object.assign({ items: [] }, config || {});

    var logos = d.items.map(function (it) {
      var icon = it.icon ? '<span class="mw-logo-bar__icon">' + it.icon + '</span>' : '';
      return '<div class="mw-logo-bar__item">' + icon + esc(it.name) + '</div>';
    }).join('');

    el.className = 'mw-logo-bar';
    el.innerHTML = logos;
    return el;
  }

  // ──────────────────────────────────────────────
  // Widget: CTA Section
  // ──────────────────────────────────────────────
  function ctaSection(el, config) {
    el = q(el);
    if (!el) return null;
    var d = Object.assign({
      kicker: '', title: '', desc: '',
      ctas: [],
      padding: '5rem 1.5rem',
    }, config || {});

    el.className = 'mw-cta-section';
    el.style.padding = d.padding;

    var ctasHTML = d.ctas.map(function (c) {
      var cls = 'mw-lp-btn mw-lp-btn--lg' + (c.primary ? ' mw-lp-btn--primary' : '');
      return '<a href="' + esc(c.href || '#') + '" class="' + cls + '">' + esc(c.label) + '</a>';
    }).join('');

    el.innerHTML =
      '<div class="mw-cta-section__inner">' +
        (d.kicker ? '<div class="mw-cta-section__kicker">' + esc(d.kicker) + '</div>' : '') +
        '<h2 class="mw-cta-section__title">' + d.title + '</h2>' +
        (d.desc ? '<p class="mw-cta-section__desc">' + esc(d.desc) + '</p>' : '') +
        '<div class="mw-cta-section__actions">' + ctasHTML + '</div>' +
      '</div>';

    return el;
  }

  // ──────────────────────────────────────────────
  // Widget: FAQ Accordion
  // ──────────────────────────────────────────────
  function faqAccordion(el, config) {
    el = q(el);
    if (!el) return null;
    var d = Object.assign({ items: [] }, config || {});

    var items = d.items.map(function (it) {
      return '<div class="mw-faq__item">' +
        '<button class="mw-faq__q" type="button">' +
          '<span>' + esc(it.q) + '</span>' +
          '<span class="mw-faq__arrow">▼</span>' +
        '</button>' +
        '<div class="mw-faq__a">' + esc(it.a) + '</div>' +
      '</div>';
    }).join('');

    el.className = 'mw-faq';
    el.innerHTML = items;

    // accordion behavior
    el.addEventListener('click', function (e) {
      var btn = e.target.closest('.mw-faq__q');
      if (!btn) return;
      var item = btn.parentElement;
      var wasOpen = item.classList.contains('is-open');
      // close all
      el.querySelectorAll('.mw-faq__item.is-open').forEach(function (o) { o.classList.remove('is-open'); });
      if (!wasOpen) item.classList.add('is-open');
    });

    return el;
  }

  // ──────────────────────────────────────────────
  // Widget: Step Guide ("How it works" section)
  // ──────────────────────────────────────────────
  function stepGuide(el, config) {
    el = q(el);
    if (!el) return null;
    var d = Object.assign({ steps: [], layout: 'vertical' }, config || {});

    var stepsHTML = d.steps.map(function (s, i) {
      var mediaHTML = '';
      if (s.code) {
        mediaHTML = '<div class="mw-steps__code"><pre>' + esc(s.code) + '</pre></div>';
      } else if (s.image) {
        mediaHTML = '<div class="mw-steps__img"><img src="' + esc(s.image) + '" alt="' + esc(s.title || '') + '"></div>';
      }
      return '<div class="mw-steps__item">' +
        '<div class="mw-steps__num">' + (i + 1) + '</div>' +
        '<div class="mw-steps__content">' +
          '<div class="mw-steps__title">' + esc(s.title) + '</div>' +
          (s.desc ? '<div class="mw-steps__desc">' + esc(s.desc) + '</div>' : '') +
          mediaHTML +
        '</div>' +
      '</div>';
    }).join('');

    el.className = 'mw-steps mw-steps--' + d.layout;
    el.innerHTML = stepsHTML;
    return el;
  }

  // ──────────────────────────────────────────────
  // Syntax highlighter (HTML + JS)
  // ──────────────────────────────────────────────
  function highlightCode(code) {
    var parts = code.split(/(<[^>]+>)/g);
    return parts.map(function(part) {
      if (/^</.test(part)) {
        var e = part.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        // colorize tag name, attributes, and string values inside tag
        e = e.replace(/^(&lt;\/?)([\w-]+)/, '$1<span class="mwc-tag">$2</span>');
        e = e.replace(/([\w-]+)(=)("(?:[^"\\]|\\.)*")/g, '<span class="mwc-attr">$1</span>$2<span class="mwc-str">$3</span>');
        return '<span class="mwc-bracket">' + e + '</span>';
      }
      var s = part.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      s = s.replace(/(\/\/.*$)/gm, '<span class="mwc-cmt">$1</span>');
      s = s.replace(/('(?:[^'\\]|\\.)*')/g, '<span class="mwc-str">$1</span>');
      s = s.replace(/("(?:[^"\\]|\\.)*")/g, function(m) {
        return m.indexOf('mwc-') >= 0 ? m : '<span class="mwc-str">' + m + '</span>';
      });
      s = s.replace(/\b(Maging)\.([\w]+)/g, '<span class="mwc-fn">$1.$2</span>');
      s = s.replace(/\b(const|let|var|function|return|new|if|else|true|false|null)\b/g, '<span class="mwc-kw">$1</span>');
      s = s.replace(/\b(\d+\.?\d*)\b/g, '<span class="mwc-num">$1</span>');
      s = s.replace(/^(\s*)([\w]+)(\s*:)/gm, '$1<span class="mwc-prop">$2</span>$3');
      return s;
    }).join('');
  }

  // ──────────────────────────────────────────────
  // Widget: Code Block (syntax display + copy)
  // ──────────────────────────────────────────────
  function codeBlock(el, config) {
    el = q(el);
    if (!el) return null;
    var d = Object.assign({ code: '', lang: '', title: '' }, config || {});

    el.className = 'mw-codeblock';
    el.innerHTML =
      '<div class="mw-codeblock__head">' +
        (d.lang ? '<span class="mw-codeblock__lang">' + esc(d.lang) + '</span>' : '') +
        (d.title ? '<span class="mw-codeblock__title">' + esc(d.title) + '</span>' : '') +
        '<button class="mw-codeblock__copy" type="button">Copy</button>' +
      '</div>' +
      '<pre class="mw-codeblock__body"><code>' + highlightCode(d.code) + '</code></pre>';

    el.querySelector('.mw-codeblock__copy').addEventListener('click', function () {
      var btn = this;
      navigator.clipboard.writeText(d.code).then(function () {
        btn.textContent = 'Copied!';
        setTimeout(function () { btn.textContent = 'Copy'; }, 1500);
      });
    });

    return el;
  }

  // ──────────────────────────────────────────────
  // Widget: Comparison Table (us vs them)
  // ──────────────────────────────────────────────
  function comparisonTable(el, config) {
    el = q(el);
    if (!el) return null;
    var d = Object.assign({ columns: [], rows: [], highlight: 0 }, config || {});

    var thHTML = d.columns.map(function (col, i) {
      var cls = i === d.highlight ? ' mw-cmp__th--hl' : '';
      return '<th class="mw-cmp__th' + cls + '">' + esc(col) + '</th>';
    }).join('');

    var tbHTML = d.rows.map(function (row) {
      var cells = row.values.map(function (v, i) {
        var cls = i === d.highlight ? ' mw-cmp__td--hl' : '';
        var content;
        if (v === true) content = '<span class="mw-cmp__check">✓</span>';
        else if (v === false) content = '<span class="mw-cmp__x">—</span>';
        else content = esc(v);
        return '<td class="mw-cmp__td' + cls + '">' + content + '</td>';
      }).join('');
      return '<tr><td class="mw-cmp__label">' + esc(row.label) + '</td>' + cells + '</tr>';
    }).join('');

    el.className = 'mw-cmp';
    el.innerHTML =
      '<div class="mw-cmp__wrap">' +
      '<table class="mw-cmp__table">' +
        '<thead><tr><th class="mw-cmp__th"></th>' + thHTML + '</tr></thead>' +
        '<tbody>' + tbHTML + '</tbody>' +
      '</table>' +
      '</div>';

    return el;
  }

  // ──────────────────────────────────────────────
  // Widget: Example Grid
  // ──────────────────────────────────────────────
  function exampleGrid(el, config) {
    el = q(el);
    if (!el) return null;
    var d = Object.assign({ items: [] }, config || {});

    var cards = d.items.map(function (it) {
      var tag = it.href ? 'a' : 'div';
      var href = it.href ? ' href="' + esc(it.href) + '"' : '';
      return '<' + tag + href + ' class="mw-examples__card">' +
        (it.icon ? '<div class="mw-examples__icon">' + it.icon + '</div>' : '') +
        (it.kicker ? '<div class="mw-examples__kicker">' + esc(it.kicker) + '</div>' : '') +
        '<div class="mw-examples__title">' + esc(it.title || '') + '</div>' +
        (it.desc ? '<div class="mw-examples__desc">' + esc(it.desc) + '</div>' : '') +
      '</' + tag + '>';
    }).join('');

    el.className = 'mw-examples';
    el.innerHTML = cards;
    return el;
  }

  // ──────────────────────────────────────────────
  // aiDemo — split-screen AI chat simulation
  // ──────────────────────────────────────────────
  function aiDemo(el, config) {
    el = q(el);
    if (!el) return null;
    var d = Object.assign({
      services: [],
      outputs: [],
      sizes: ['short', 'full'],
      defaultOutput: 'dashboard',
      defaultSize: 'full',
      promptBaseUrl: '/',
      requests: {},
      handshakes: {},
      previews: {}
    }, config || {});

    var currentService = (d.services[0] || {}).id || 'flowai';
    var currentOutput = d.defaultOutput;
    var currentSize = d.defaultSize;
    var promptText = '';
    var animTimers = [];

    // ── Build unique IDs ──
    var uid = 'ad' + Math.random().toString(36).slice(2, 8);
    function _id(name) { return uid + '-' + name; }

    // ── Render service chips ──
    var serviceChips = d.services.map(function (s) {
      var active = s.id === currentService ? ' is-active' : '';
      var icon = s.icon ? '<img src="' + esc(s.icon) + '">' : '';
      return '<button class="mw-ai-demo__chip' + active + '" data-service="' + esc(s.id) + '">' + icon + esc(s.label) + '</button>';
    }).join('');

    var outputChips = d.outputs.map(function (o) {
      var active = o.id === currentOutput ? ' is-active' : '';
      return '<button class="mw-ai-demo__chip' + active + '" data-output="' + esc(o.id) + '">' + esc(o.label) + '</button>';
    }).join('');

    var sizeChips = d.sizes.map(function (s) {
      var active = s === currentSize ? ' is-active' : '';
      var label = s === 'short' ? 'Short' : s === 'full' ? 'Full' : s;
      return '<button class="mw-ai-demo__chip' + active + '" data-size="' + esc(s) + '">' + esc(label) + '</button>';
    }).join('');

    var dots = '<span style="background:#ff5f57"></span><span style="background:#febc2e"></span><span style="background:#28c840"></span>';

    var html = '<div class="mw-ai-demo">' +
      '<!-- Left panel -->' +
      '<div class="mw-ai-demo__panel mw-ai-demo__panel--left">' +
        '<div class="mw-ai-demo__bar"><div class="mw-ai-demo__dots">' + dots + '</div><div class="mw-ai-demo__url">maging.m1k.app</div></div>' +
        '<div class="mw-ai-demo__content mw-ai-demo__content--left">' +
          '<div class="mw-ai-demo__filter"><span class="mw-ai-demo__filter-label">LLM</span><div class="mw-ai-demo__chips">' + serviceChips + '</div></div>' +
          '<div class="mw-ai-demo__filter"><span class="mw-ai-demo__filter-label">Mode</span><div class="mw-ai-demo__chips">' + outputChips + '</div></div>' +
          '<div class="mw-ai-demo__filter"><span class="mw-ai-demo__filter-label">Size</span><div class="mw-ai-demo__chips">' + sizeChips + '</div></div>' +
          '<div class="mw-ai-demo__filter-meta">' +
            '<a href="#" class="mw-ai-demo__ref" id="' + _id('link') + '"></a>' +
            '<span class="mw-ai-demo__stats" id="' + _id('stats') + '"></span>' +
          '</div>' +
          '<pre class="mw-ai-demo__code" id="' + _id('body') + '"></pre>' +
        '</div>' +
        '<div class="mw-ai-demo__copybar">' +
          '<button class="mw-ai-demo__copy mw-ai-demo__copy--dl" id="' + _id('dl') + '">Download .md</button>' +
          '<button class="mw-ai-demo__copy" id="' + _id('copy') + '">' +
            '<span class="mw-ai-demo__copy-idle">Copy Prompt</span>' +
            '<span class="mw-ai-demo__copy-done" style="display:none">Copied!</span>' +
          '</button>' +
        '</div>' +
      '</div>' +
      '<!-- Right panel -->' +
      '<div class="mw-ai-demo__panel mw-ai-demo__panel--right">' +
        '<div class="mw-ai-demo__bar"><div class="mw-ai-demo__dots">' + dots + '</div><div class="mw-ai-demo__url" id="' + _id('aiurl') + '">' + esc((d.services[0] || {}).url || '') + '</div></div>' +
        '<div class="mw-ai-demo__content mw-ai-demo__content--right" id="' + _id('chat') + '">' +
          '<div class="mw-ai-demo__empty" id="' + _id('empty') + '">' +
            '<button class="mw-ai-demo__play" id="' + _id('play') + '" type="button"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></button>' +
            '<div class="mw-ai-demo__play-label">Click to preview</div>' +
          '</div>' +
          '<div class="mw-ai-demo__msg mw-ai-demo__msg--user" id="' + _id('system') + '" style="display:none;">' +
            '<div class="mw-ai-demo__msg-body mw-ai-demo__msg-body--user mw-ai-demo__msg-body--collapsed">' +
              '<div class="mw-ai-demo__collapsed-head"><span class="mw-ai-demo__collapsed-label">maging prompt</span><span class="mw-ai-demo__collapsed-badge" id="' + _id('badge') + '"></span></div>' +
              '<div class="mw-ai-demo__collapsed-preview">You are a maging dashboard generator...</div>' +
            '</div>' +
          '</div>' +
          '<div class="mw-ai-demo__msg mw-ai-demo__msg--ai" id="' + _id('handshake') + '" style="display:none;">' +
            '<div class="mw-ai-demo__msg-icon mw-ai-demo__msg-icon--ai">\u2726</div>' +
            '<div class="mw-ai-demo__msg-body">' +
              '<div class="mw-ai-demo__typing" id="' + _id('t1') + '"><span></span><span></span><span></span></div>' +
              '<div class="mw-ai-demo__msg-text" id="' + _id('htext') + '" style="display:none;"></div>' +
            '</div>' +
          '</div>' +
          '<div class="mw-ai-demo__msg mw-ai-demo__msg--user" id="' + _id('request') + '" style="display:none;">' +
            '<div class="mw-ai-demo__msg-body mw-ai-demo__msg-body--user"><span id="' + _id('reqtext') + '"></span><span class="mw-ai-demo__cursor" id="' + _id('cursor') + '">|</span></div>' +
          '</div>' +
          '<div class="mw-ai-demo__msg mw-ai-demo__msg--ai" id="' + _id('result') + '" style="display:none;">' +
            '<div class="mw-ai-demo__msg-icon mw-ai-demo__msg-icon--ai">\u2726</div>' +
            '<div class="mw-ai-demo__msg-body">' +
              '<div class="mw-ai-demo__typing" id="' + _id('t2') + '"><span></span><span></span><span></span></div>' +
              '<div class="mw-ai-demo__preview" id="' + _id('preview') + '" style="display:none;">' +
                '<div class="mw-ai-demo__preview-bar"><span id="' + _id('fname') + '" style="font-size:0.6rem;color:var(--mw-text-muted);font-family:var(--mw-mono-font);">dashboard.html</span><span style="font-size:0.55rem;color:var(--mw-success);">Generated</span></div>' +
                '<div class="mw-ai-demo__preview-body" id="' + _id('pbody') + '"></div>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="mw-ai-demo__inputbar">' +
          '<div class="mw-ai-demo__inputbar-field" id="' + _id('ifield') + '">' +
            '<span class="mw-ai-demo__inputbar-text" id="' + _id('itext') + '"></span>' +
            '<span class="mw-ai-demo__inputbar-placeholder" id="' + _id('iph') + '">Message...</span>' +
            '<span class="mw-ai-demo__inputbar-cursor" id="' + _id('icursor') + '" style="display:none;">|</span>' +
          '</div>' +
          '<button class="mw-ai-demo__inputbar-send" id="' + _id('isend') + '" style="display:none;">\u2191</button>' +
        '</div>' +
      '</div>' +
    '</div>';

    el.innerHTML = html;

    // ── Element refs ──
    function $(name) { return el.querySelector('#' + _id(name)); }
    var bodyEl = $('body');
    var copyBtn = $('copy');
    var dlBtn = $('dl');
    var linkEl = $('link');
    var statsEl = $('stats');
    var aiUrlEl = $('aiurl');
    var chatArea = $('chat');
    var inputField = $('ifield');
    var inputText = $('itext');
    var inputPh = $('iph');
    var inputCursor = $('icursor');
    var inputSend = $('isend');
    var badgeEl = $('badge');

    // ── Helpers ──
    function clearAnims() { animTimers.forEach(clearTimeout); animTimers = []; }
    function delay(fn, ms) { animTimers.push(setTimeout(fn, ms)); }
    function showEl(name) {
      var e = $(name);
      if (!e) return e;
      e.style.display = '';
      e.style.animation = 'none'; e.offsetHeight; e.style.animation = '';
      return e;
    }
    function hideEl(name) { var e = $(name); if (e) e.style.display = 'none'; }
    function scrollChat() { if (chatArea) chatArea.scrollTop = chatArea.scrollHeight; }
    function resetInput() {
      inputText.textContent = '';
      inputPh.style.display = '';
      inputCursor.style.display = 'none';
      inputSend.style.display = 'none';
      inputField.classList.remove('is-active');
    }
    function typeText(target, text, speed, cb) {
      target.textContent = '';
      var i = 0;
      var iv = setInterval(function () {
        target.textContent = text.slice(0, ++i);
        if (i >= text.length) { clearInterval(iv); if (cb) cb(); }
      }, speed);
    }

    // ── Fetch prompt ──
    function fetchPrompt(cb) {
      var base = d.promptBaseUrl;
      var specific = base + 'llms-' + currentOutput + '-' + currentSize + '-for-' + currentService + '.md';
      var fallback = base + 'llms-' + currentOutput + '-' + currentSize + '.md';
      fetch(specific).then(function (r) {
        if (r.ok) return r.text();
        return fetch(fallback).then(function (r2) { return r2.ok ? r2.text() : ''; });
      }).then(function (text) {
        promptText = text || '';
        cb(promptText);
      }).catch(function () {
        promptText = '';
        cb('');
      });
    }

    // ── Update display ──
    function updateDisplay() {
      fetchPrompt(function (text) {
        bodyEl.textContent = text;
        var chars = text.length;
        var tokens = Math.ceil(chars / 3.2);
        var fmt = function (n) { return n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K' : n; };
        if (statsEl) statsEl.textContent = chars.toLocaleString() + ' chars \u00b7 ' + fmt(tokens) + ' tokens';
        if (badgeEl) badgeEl.textContent = fmt(tokens) + ' tokens';
      });
      updateLink();
    }

    function updateLink() {
      if (!linkEl) return;
      var name = 'llms-' + currentOutput + '-' + currentSize + '-for-' + currentService + '.md';
      linkEl.href = d.promptBaseUrl + name;
      linkEl.textContent = name;
    }

    // ── Service handling ──
    function findService(id) {
      for (var i = 0; i < d.services.length; i++) {
        if (d.services[i].id === id) return d.services[i];
      }
      return null;
    }

    function setService(id) {
      currentService = id;
      if (aiUrlEl) {
        var svc = findService(id);
        aiUrlEl.textContent = svc ? svc.url : '';
      }
      el.querySelectorAll('.mw-ai-demo__chip[data-service]').forEach(function (b) {
        b.classList.toggle('is-active', b.dataset.service === id);
      });
      updateDisplay();
    }

    function setOutput(id) {
      currentOutput = id;
      el.querySelectorAll('.mw-ai-demo__chip[data-output]').forEach(function (b) {
        b.classList.toggle('is-active', b.dataset.output === id);
      });
      // Reset animation
      clearAnims();
      hideEl('system'); hideEl('handshake'); hideEl('request'); hideEl('result');
      hideEl('htext'); hideEl('preview');
      var t1 = $('t1'); var t2 = $('t2');
      if (t1) t1.style.display = 'flex';
      if (t2) t2.style.display = 'flex';
      var emptyEl = $('empty');
      if (emptyEl) emptyEl.style.display = '';
      var oldReplay = el.querySelector('.mw-ai-demo__replay');
      if (oldReplay) oldReplay.remove();
      resetInput();
      updateDisplay();
      // Update handshake text
      var htextEl = $('htext');
      if (htextEl && d.handshakes[currentOutput]) {
        htextEl.innerHTML = '<strong>\uc548\ub155\ud558\uc138\uc694! \uacb0\uacfc\ubb3c \uc11c\ud3ec\ud130 \ub9e4\uc9d5(maging)\uc785\ub2c8\ub2e4 \u2726</strong><br>' + esc(d.handshakes[currentOutput]) + '<br>\uc5b4\ub5a4 \uac78 \ub9cc\ub4e4\uc5b4 \ub4dc\ub9b4\uae4c\uc694?';
      }
    }

    function setSize(size) {
      currentSize = size;
      el.querySelectorAll('.mw-ai-demo__chip[data-size]').forEach(function (b) {
        b.classList.toggle('is-active', b.dataset.size === size);
      });
      updateDisplay();
    }

    // ── Play animation ──
    function playAnimation() {
      clearAnims();
      hideEl('system'); hideEl('handshake'); hideEl('request'); hideEl('result');
      hideEl('htext'); hideEl('preview');
      var oldReplay = el.querySelector('.mw-ai-demo__replay');
      if (oldReplay) oldReplay.remove();
      var emptyEl = $('empty');
      if (emptyEl) emptyEl.style.display = '';
      var t1 = $('t1'); var t2 = $('t2');
      if (t1) t1.style.display = 'flex';
      if (t2) t2.style.display = 'flex';
      resetInput();

      // Step 1 (0.3s): Copy button highlights
      delay(function () {
        copyBtn.classList.add('is-copied');
        copyBtn.querySelector('.mw-ai-demo__copy-idle').style.display = 'none';
        copyBtn.querySelector('.mw-ai-demo__copy-done').style.display = '';
      }, 300);

      // Step 2 (1s): prompt text appears in input bar
      delay(function () {
        hideEl('empty');
        inputPh.style.display = 'none';
        inputField.classList.add('is-active');
        inputCursor.style.display = '';
        inputText.textContent = 'You are a maging dashboard generator...';
        inputText.style.fontSize = '0.62rem';
        inputText.style.fontFamily = 'var(--mw-mono-font)';
        inputText.style.color = 'var(--mw-text-muted)';
        inputSend.style.display = '';
      }, 1000);

      // Step 3 (1.8s): "enter" — prompt sends, collapses
      delay(function () {
        copyBtn.classList.remove('is-copied');
        copyBtn.querySelector('.mw-ai-demo__copy-idle').style.display = '';
        copyBtn.querySelector('.mw-ai-demo__copy-done').style.display = 'none';
        resetInput();
        inputText.style.cssText = '';
        showEl('system');
        scrollChat();
      }, 1800);

      // Step 4 (2.5s): AI typing
      delay(function () { showEl('handshake'); scrollChat(); }, 2500);

      // Step 5 (3.8s): handshake text
      delay(function () {
        if (t1) t1.style.display = 'none';
        showEl('htext');
        scrollChat();
      }, 3800);

      // Step 6 (5s): user types in input bar
      delay(function () {
        inputPh.style.display = 'none';
        inputField.classList.add('is-active');
        inputCursor.style.display = '';
        var reqText = d.requests[currentOutput] || '';
        typeText(inputText, reqText, 35, function () {
          inputSend.style.display = '';

          // Step 7 (after typing +0.5s): "enter" — send request
          delay(function () {
            var sentText = inputText.textContent;
            resetInput();
            showEl('request');
            var reqTextEl = $('reqtext');
            if (reqTextEl) reqTextEl.textContent = sentText;
            var cursorEl = $('cursor');
            if (cursorEl) cursorEl.style.display = 'none';
            scrollChat();

            // Step 8 (+0.4s): AI typing
            delay(function () { showEl('result'); scrollChat(); }, 400);

            // Step 9 (+1.8s): preview
            delay(function () {
              if (t2) t2.style.display = 'none';
              showEl('preview');
              var fnameEl = $('fname');
              var FNAMES = { dashboard: 'dashboard.html', weekly: 'weekly-report.html', landing: 'landing.html', cardnews: 'card-news.html' };
              if (fnameEl) fnameEl.textContent = FNAMES[currentOutput] || 'output.html';

              // Render previews
              var previewBody = $('pbody');
              if (previewBody && d.previews[currentOutput]) {
                var items = d.previews[currentOutput];
                previewBody.innerHTML = '';
                items.forEach(function (w) {
                  var div = document.createElement('div');
                  if (w.style) div.style.cssText = w.style;
                  previewBody.appendChild(div);
                  var wCfg = {};
                  for (var k in w) {
                    if (k !== 'type' && k !== 'style') wCfg[k] = w[k];
                  }
                  if (M[w.type]) {
                    try { M[w.type](div, wCfg); } catch (e) {}
                  }
                });
              }
              scrollChat();

              // Replay button
              delay(function () {
                var replay = document.createElement('button');
                replay.className = 'mw-ai-demo__replay';
                replay.innerHTML = '\u21bb Replay';
                replay.addEventListener('click', function () { playAnimation(); });
                chatArea.appendChild(replay);
                scrollChat();
              }, 800);
            }, 1800);
          }, 500);
        });
      }, 5000);
    }

    // ── Wire chips ──
    el.querySelectorAll('.mw-ai-demo__chip[data-service]').forEach(function (b) {
      b.addEventListener('click', function () { setService(b.dataset.service); });
    });
    el.querySelectorAll('.mw-ai-demo__chip[data-output]').forEach(function (b) {
      b.addEventListener('click', function () { setOutput(b.dataset.output); });
    });
    el.querySelectorAll('.mw-ai-demo__chip[data-size]').forEach(function (b) {
      b.addEventListener('click', function () { setSize(b.dataset.size); });
    });

    // Play button
    var playBtn = $('play');
    if (playBtn) playBtn.addEventListener('click', function () { playAnimation(); });

    // Copy handler
    if (copyBtn) copyBtn.addEventListener('click', function () {
      var text = bodyEl.textContent;
      var idle = copyBtn.querySelector('.mw-ai-demo__copy-idle');
      var done = copyBtn.querySelector('.mw-ai-demo__copy-done');
      navigator.clipboard.writeText(text).then(function () {
        copyBtn.classList.add('is-copied');
        if (idle) idle.style.display = 'none';
        if (done) done.style.display = '';
        setTimeout(function () {
          copyBtn.classList.remove('is-copied');
          if (idle) idle.style.display = '';
          if (done) done.style.display = 'none';
        }, 2000);
      });
    });

    // Download handler
    if (dlBtn) dlBtn.addEventListener('click', function () {
      var text = bodyEl.textContent;
      var filename = linkEl ? linkEl.textContent : 'llms-prompt.md';
      var blob = new Blob([text], { type: 'text/markdown' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });

    // ── Initialize ──
    if (bodyEl) {
      setService(currentService);
      setOutput(currentOutput);
      setSize(currentSize);
    }

    return el;
  }

  // ──────────────────────────────────────────────
  // Inject additional CSS
  // ──────────────────────────────────────────────
  var extraCSS = document.getElementById('mw-landing-css');
  if (extraCSS) {
    extraCSS.textContent += '\n' + [
      /* ── step guide ── */
      '.mw-steps { display: flex; flex-direction: column; gap: 0; }',
      '.mw-steps__item {',
      '  display: flex; gap: 1.25rem; position: relative;',
      '  padding: 0 0 2.5rem;',
      '}',
      '.mw-steps__item:last-child { padding-bottom: 0; }',
      '.mw-steps__item:not(:last-child)::after {',
      '  content: ""; position: absolute; left: 17px; top: 40px; bottom: 0;',
      '  width: 1px; background: var(--mw-border);',
      '}',
      '.mw-steps__num {',
      '  width: 36px; height: 36px; flex-shrink: 0;',
      '  background: var(--mw-accent); color: #fff; font-weight: 700;',
      '  border-radius: 50%; display: flex; align-items: center; justify-content: center;',
      '  font-size: 0.85rem; font-family: var(--mw-mono-font); z-index: 1;',
      '}',
      '[data-theme="terminal"] .mw-steps__num { color: #000; }',
      '.mw-steps__content { flex: 1; min-width: 0; padding-top: 0.35rem; }',
      '.mw-steps__title { font-size: var(--mw-text-md); font-weight: 600; margin-bottom: 0.35rem; font-family: var(--mw-display-font); }',
      '.mw-steps__desc { font-size: var(--mw-text-sm); color: var(--mw-text-muted); line-height: 1.6; margin-bottom: 0.75rem; }',
      '.mw-steps__code {',
      '  background: #1e1e2e; border-radius: var(--mw-radius); overflow: hidden;',
      '}',
      '.mw-steps__code pre {',
      '  margin: 0; padding: 1rem 1.25rem; font-size: 0.78rem; line-height: 1.6;',
      '  color: #cdd6f4; font-family: var(--mw-mono-font); white-space: pre; overflow-x: auto;',
      '}',
      '.mw-steps__img { border-radius: var(--mw-radius); overflow: hidden; }',
      '.mw-steps__img img { width: 100%; display: block; }',

      /* ── code block ── */
      '.mw-codeblock {',
      '  background: #1e1e2e; border-radius: var(--mw-radius); overflow: hidden;',
      '  border: 1px solid #313244;',
      '}',
      '.mw-codeblock__head {',
      '  display: flex; align-items: center; gap: 0.5rem;',
      '  padding: 0.5rem 1rem; border-bottom: 1px solid #313244;',
      '}',
      '.mw-codeblock__lang {',
      '  font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.08em;',
      '  color: #a6adc8; font-family: var(--mw-mono-font);',
      '}',
      '.mw-codeblock__title { font-size: 0.7rem; color: #6c7086; flex: 1; }',
      '.mw-codeblock__copy {',
      '  font-size: 0.65rem; padding: 0.2rem 0.5rem;',
      '  border: 1px solid #45475a; border-radius: 4px;',
      '  background: #313244; color: #a6adc8; cursor: pointer;',
      '  font-family: var(--mw-font); transition: color 150ms, border-color 150ms;',
      '}',
      '.mw-codeblock__copy:hover { color: #cdd6f4; border-color: #89b4fa; }',
      '.mw-codeblock__body {',
      '  margin: 0; padding: 1rem 1.25rem; font-size: 0.8rem; line-height: 1.7;',
      '  color: #cdd6f4; overflow-x: auto;',
      '}',
      '.mw-codeblock__body code { font-family: var(--mw-mono-font); }',
      '.mwc-bracket { color: #89b4fa; }',
      '.mwc-tag   { color: #f38ba8; }',
      '.mwc-attr  { color: #f9e2af; }',
      '.mwc-str   { color: #a6e3a1; }',
      '.mwc-kw    { color: #cba6f7; }',
      '.mwc-fn    { color: #89dceb; }',
      '.mwc-num   { color: #fab387; }',
      '.mwc-prop  { color: #b4befe; }',
      '.mwc-cmt   { color: #6c7086; font-style: italic; }',

      /* ── comparison table ── */
      '.mw-cmp { width: 100%; }',
      '.mw-cmp__wrap { overflow-x: auto; }',
      '.mw-cmp__table {',
      '  width: 100%; border-collapse: collapse; font-size: var(--mw-text-sm);',
      '  font-family: var(--mw-font);',
      '}',
      '.mw-cmp__th {',
      '  padding: 0.75rem 1rem; text-align: center; font-weight: 600;',
      '  border-bottom: 2px solid var(--mw-border); color: var(--mw-text-muted);',
      '  font-size: var(--mw-text-sm);',
      '}',
      '.mw-cmp__th--hl {',
      '  color: var(--mw-accent); position: relative;',
      '  background: color-mix(in srgb, var(--mw-accent) 6%, transparent);',
      '}',
      '.mw-cmp__label {',
      '  padding: 0.65rem 1rem; font-weight: 500; color: var(--mw-text);',
      '  border-bottom: 1px solid var(--mw-border); white-space: nowrap;',
      '}',
      '.mw-cmp__td {',
      '  padding: 0.65rem 1rem; text-align: center;',
      '  border-bottom: 1px solid var(--mw-border); color: var(--mw-text-muted);',
      '}',
      '.mw-cmp__td--hl {',
      '  background: color-mix(in srgb, var(--mw-accent) 4%, transparent);',
      '  color: var(--mw-text);',
      '}',
      '.mw-cmp__check { color: var(--mw-success); font-weight: 700; }',
      '.mw-cmp__x { color: var(--mw-text-muted); opacity: 0.4; }',

      /* ── example grid ── */
      '.mw-examples { display: grid; gap: 1rem; grid-template-columns: repeat(2, 1fr); }',
      '@media (min-width: 768px) { .mw-examples { grid-template-columns: repeat(3, 1fr); } }',
      '@media (min-width: 1024px) { .mw-examples { grid-template-columns: repeat(4, 1fr); } }',
      '.mw-examples__card {',
      '  display: block; padding: 1.25rem; border: 1px solid var(--mw-border);',
      '  border-radius: var(--mw-radius); background: var(--mw-surface);',
      '  text-decoration: none; color: inherit; transition: all 180ms;',
      '}',
      '.mw-examples__card:hover {',
      '  border-color: var(--mw-accent); transform: translateY(-2px);',
      '  box-shadow: 0 6px 20px -6px color-mix(in srgb, var(--mw-accent) 18%, transparent);',
      '}',
      '.mw-examples__icon {',
      '  width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;',
      '  background: color-mix(in srgb, var(--mw-accent) 12%, transparent); color: var(--mw-accent);',
      '  border-radius: calc(var(--mw-radius) * 0.6); font-size: 1rem; margin-bottom: 0.75rem;',
      '}',
      '.mw-examples__kicker {',
      '  font-size: 0.65rem; color: var(--mw-text-muted); text-transform: uppercase;',
      '  letter-spacing: 0.06em; font-family: var(--mw-font); margin-bottom: 0.25rem;',
      '}',
      '.mw-examples__title { font-size: var(--mw-text-sm); font-weight: 600; margin-bottom: 0.35rem; }',
      '.mw-examples__desc { font-size: var(--mw-text-xs); color: var(--mw-text-muted); line-height: 1.5; }',

      /* ── ai demo split screen ── */
      '.mw-ai-demo { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border: 1px solid var(--mw-border); border-radius: var(--mw-radius); overflow: hidden; max-width: 900px; margin: 0 auto; box-shadow: 0 8px 32px -8px rgba(0,0,0,0.12); }',
      '@media (max-width: 768px) { .mw-ai-demo { grid-template-columns: 1fr; } }',
      '.mw-ai-demo__panel { display: flex; flex-direction: column; min-width: 0; }',
      '.mw-ai-demo__panel--left { border-right: 1px solid var(--mw-border); }',
      '@media (max-width: 768px) { .mw-ai-demo__panel--left { border-right: none; border-bottom: 1px solid var(--mw-border); } }',
      '.mw-ai-demo__bar { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; background: var(--mw-surface-2); border-bottom: 1px solid var(--mw-border); height: 32px; }',
      '.mw-ai-demo__dots { display: flex; gap: 5px; }',
      '.mw-ai-demo__dots span { width: 8px; height: 8px; border-radius: 50%; }',
      '.mw-ai-demo__url { font-size: 0.6rem; color: var(--mw-text-muted); font-family: var(--mw-mono-font); background: var(--mw-surface); padding: 0.15rem 0.5rem; border-radius: 3px; border: 1px solid var(--mw-border); }',
      '.mw-ai-demo__content { padding: 1rem; overflow: hidden; height: 420px; }',
      '.mw-ai-demo__content--left { display: flex; flex-direction: column; gap: 0; }',
      '.mw-ai-demo__content--right { display: flex; flex-direction: column; gap: 0.75rem; height: 580px; padding: 1rem 0.875rem; overflow-y: auto; }',
      '.mw-ai-demo__filter { display: flex; align-items: center; gap: 0.5rem; padding: 0.35rem 0.75rem; border-bottom: 1px solid var(--mw-border); }',
      '.mw-ai-demo__filter-label { font-size: 0.55rem; font-weight: 600; color: var(--mw-text-muted); text-transform: uppercase; letter-spacing: 0.04em; white-space: nowrap; min-width: 28px; }',
      '.mw-ai-demo__chips { display: flex; gap: 0.25rem; }',
      '.mw-ai-demo__chip { display: flex; align-items: center; gap: 0.3rem; padding: 0.2rem 0.55rem; border-radius: 4px; font-size: 0.65rem; font-weight: 500; color: var(--mw-text-muted); background: transparent; border: 1px solid transparent; cursor: pointer; transition: all 150ms; white-space: nowrap; font-family: var(--mw-font); }',
      '.mw-ai-demo__chip img { width: 14px; height: 14px; border-radius: 3px; }',
      '.mw-ai-demo__chip:hover { color: var(--mw-text); background: var(--mw-surface-2); }',
      '.mw-ai-demo__chip.is-active { color: var(--mw-text); background: var(--mw-surface-2); border-color: var(--mw-border); }',
      '.mw-ai-demo__filter-meta { display: flex; align-items: center; gap: 0.5rem; padding: 0.35rem 0.75rem; border-bottom: 1px solid var(--mw-border); min-height: 32px; }',
      '.mw-ai-demo__ref { font-size: 0.6rem; color: var(--mw-text-muted); text-decoration: none; font-family: var(--mw-mono-font); }',
      '.mw-ai-demo__ref:hover { color: var(--mw-accent); }',
      '.mw-ai-demo__stats { margin-left: auto; font-size: 0.6rem; color: var(--mw-text-muted); font-family: var(--mw-mono-font); white-space: nowrap; }',
      '.mw-ai-demo__code { flex: 1; margin: 0.5rem 0 0; padding: 0.75rem; font-size: 0.62rem; line-height: 1.5; font-family: var(--mw-mono-font); color: var(--mw-text-muted); background: var(--mw-bg); border: 1px solid var(--mw-border); border-radius: calc(var(--mw-radius) * 0.5); white-space: pre-wrap; word-break: break-all; overflow-y: auto; min-height: 0; }',
      '.mw-ai-demo__copybar { padding: 0.5rem 1rem 0.75rem; border-top: 1px solid var(--mw-border); display: flex; gap: 0.5rem; }',
      '.mw-ai-demo__copy { flex: 1; padding: 0.55rem 1rem; font-size: 0.75rem; font-weight: 600; border: none; border-radius: calc(var(--mw-radius) * 0.5); background: var(--mw-accent); color: #fff; cursor: pointer; font-family: var(--mw-font); transition: opacity 150ms, transform 150ms; }',
      '.mw-ai-demo__copy:hover { opacity: 0.9; }',
      '.mw-ai-demo__copy:active { transform: scale(0.98); }',
      '.mw-ai-demo__copy.is-copied { background: var(--mw-success); }',
      '.mw-ai-demo__copy--dl { background: var(--mw-surface-2); color: var(--mw-text); border: 1px solid var(--mw-border); }',
      '.mw-ai-demo__empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.75rem; }',
      '.mw-ai-demo__play { width: 56px; height: 56px; border-radius: 50%; background: var(--mw-accent); color: #fff; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 16px color-mix(in srgb, var(--mw-accent) 30%, transparent); }',
      '.mw-ai-demo__play:hover { transform: scale(1.1); }',
      '.mw-ai-demo__play:active { transform: scale(0.95); }',
      '[data-theme="terminal"] .mw-ai-demo__play { color: #000; }',
      '.mw-ai-demo__play-label { font-size: 0.68rem; color: var(--mw-text-muted); }',
      '.mw-ai-demo__msg { display: flex; gap: 0.5rem; animation: mwAiDemoFade 0.35s ease-out; }',
      '.mw-ai-demo__msg-icon { width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 0.55rem; font-weight: 700; background: var(--mw-surface-2); color: var(--mw-text-muted); }',
      '.mw-ai-demo__msg-icon--ai { color: var(--mw-accent); font-size: 0.7rem; }',
      '.mw-ai-demo__msg-body { flex: 1; min-width: 0; }',
      '.mw-ai-demo__msg-text { font-size: 0.75rem; line-height: 1.6; color: var(--mw-text); }',
      '.mw-ai-demo__msg-body--collapsed { background: var(--mw-surface-2); border: 1px solid var(--mw-border); border-radius: calc(var(--mw-radius) * 0.5); padding: 0.5rem 0.75rem; margin-left: 0; }',
      '.mw-ai-demo__collapsed-head { display: flex; align-items: center; gap: 0.5rem; }',
      '.mw-ai-demo__collapsed-label { font-size: 0.68rem; font-weight: 600; color: var(--mw-text); }',
      '.mw-ai-demo__collapsed-badge { font-size: 0.55rem; color: var(--mw-text-muted); font-family: var(--mw-mono-font); background: var(--mw-surface); padding: 0.1rem 0.35rem; border-radius: 3px; }',
      '.mw-ai-demo__collapsed-preview { font-size: 0.6rem; color: var(--mw-text-muted); margin-top: 0.25rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: var(--mw-mono-font); }',
      '.mw-ai-demo__msg--user .mw-ai-demo__msg-body--user { background: var(--mw-surface-2); border-radius: calc(var(--mw-radius) * 0.5); padding: 0.45rem 0.75rem; font-size: 0.75rem; color: var(--mw-text); margin-left: 1.75rem; }',
      '.mw-ai-demo__typing { display: flex; gap: 4px; padding: 0.35rem 0; }',
      '.mw-ai-demo__typing span { width: 5px; height: 5px; border-radius: 50%; background: var(--mw-text-muted); opacity: 0.4; animation: mwAiDemoBounce 1.2s infinite; }',
      '.mw-ai-demo__typing span:nth-child(2) { animation-delay: 0.2s; }',
      '.mw-ai-demo__typing span:nth-child(3) { animation-delay: 0.4s; }',
      '@keyframes mwAiDemoBounce { 0%, 60%, 100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-3px); opacity: 1; } }',
      '.mw-ai-demo__cursor { animation: mwAiDemoCursor 0.8s step-end infinite; color: var(--mw-accent); font-weight: 300; }',
      '@keyframes mwAiDemoCursor { 50% { opacity: 0; } }',
      '.mw-ai-demo__preview { border: 1px solid var(--mw-border); border-radius: calc(var(--mw-radius) * 0.5); overflow: hidden; animation: mwAiDemoFade 0.4s ease-out; }',
      '.mw-ai-demo__preview-bar { display: flex; justify-content: space-between; align-items: center; padding: 0.35rem 0.625rem; background: var(--mw-surface-2); border-bottom: 1px solid var(--mw-border); }',
      '.mw-ai-demo__preview-body { padding: 0.5rem; display: grid; grid-template-columns: 1fr 1fr; gap: 0.35rem; min-height: 80px; }',
      '.mw-ai-demo__preview-body > div { min-height: 0; }',
      '.mw-ai-demo__preview-body .mw-card { font-size: 0.55rem; padding: 0.35rem; border-radius: 4px; }',
      '.mw-ai-demo__preview-body .mw-header { display: none; }',
      '.mw-ai-demo__inputbar { padding: 0.5rem 0.875rem; border-top: 1px solid var(--mw-border); display: flex; gap: 0.375rem; align-items: center; }',
      '.mw-ai-demo__inputbar-field { flex: 1; background: var(--mw-surface-2); border: 1px solid var(--mw-border); border-radius: calc(var(--mw-radius) * 0.5); padding: 0.45rem 0.75rem; font-size: 0.72rem; color: var(--mw-text); min-height: 1.4em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: border-color 200ms; }',
      '.mw-ai-demo__inputbar-field.is-active { border-color: var(--mw-accent); }',
      '.mw-ai-demo__inputbar-placeholder { color: var(--mw-text-muted); opacity: 0.5; }',
      '.mw-ai-demo__inputbar-text { font-family: var(--mw-font); }',
      '.mw-ai-demo__inputbar-cursor { color: var(--mw-accent); animation: mwAiDemoCursor 0.8s step-end infinite; }',
      '.mw-ai-demo__inputbar-send { width: 28px; height: 28px; border-radius: 50%; background: var(--mw-accent); color: #fff; border: none; font-size: 0.8rem; cursor: pointer; flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: transform 0.15s; }',
      '.mw-ai-demo__inputbar-send:active { transform: scale(0.9); }',
      '.mw-ai-demo__replay { margin: 0.75rem auto 0; display: flex; align-items: center; gap: 0.35rem; padding: 0.35rem 0.85rem; font-size: 0.7rem; font-weight: 500; border: 1px solid var(--mw-border); border-radius: 999px; background: var(--mw-surface); color: var(--mw-text-muted); cursor: pointer; font-family: var(--mw-font); transition: color 150ms, border-color 150ms; animation: mwAiDemoFade 0.3s ease-out; }',
      '.mw-ai-demo__replay:hover { color: var(--mw-text); border-color: var(--mw-accent); }',
      '@keyframes mwAiDemoFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }',
    ].join('\n');
  }

  // ──────────────────────────────────────────────
  // Extend Maging namespace
  // ──────────────────────────────────────────────
  M.heroSection = heroSection;
  M.featureGrid = featureGrid;
  M.pricingTable = pricingTable;
  M.testimonialGrid = testimonialGrid;
  M.logoBar = logoBar;
  M.ctaSection = ctaSection;
  M.exampleGrid = exampleGrid;
  M.aiDemo = aiDemo;
  M.faqAccordion = faqAccordion;
  M.stepGuide = stepGuide;
  M.codeBlock = codeBlock;
  M.comparisonTable = comparisonTable;

  // ──────────────────────────────────────────────
  // Landing page builder — Maging.page({ mode: 'landing', sections: [...] })
  // ──────────────────────────────────────────────
  var LANDING_TYPE_MAP = {
    hero: 'heroSection',
    logos: 'logoBar',
    features: 'featureGrid',
    pricing: 'pricingTable',
    testimonials: 'testimonialGrid',
    examples: 'exampleGrid',
    faq: 'faqAccordion',
    steps: 'stepGuide',
    code: 'codeBlock',
    comparison: 'comparisonTable',
    cta: 'ctaSection',
    aiDemo: 'aiDemo',
  };

  // Section types that use full-width (no lp-section wrapper)
  var FULL_WIDTH = { hero: 1, cta: 1, aiDemo: 1 };
  // Section types that get centered text
  var CENTERED = { features: 1, comparison: 1, testimonials: 1, pricing: 1 };

  function landingPage(cfg) {
    var container = document.createElement('div');
    container.className = 'mw-themed';
    container.style.wordBreak = 'keep-all';

    // Mount early so widgets can query DOM (aiDemo needs getElementById)
    document.body.appendChild(container);

    var sections = cfg.sections || [];
    sections.forEach(function (sec, si) {
      var sType = sec.type || 'hero';
      var fnName = LANDING_TYPE_MAP[sType] || sType;
      var fn = M[fnName];
      if (!fn) {
        console.warn('[maging.page/landing] Unknown section type: ' + sType);
        return;
      }

      // Divider between sections (skip before first, after hero, before cta)
      if (si > 0 && sType !== 'cta' && sections[si - 1].type !== 'hero') {
        var hr = document.createElement('hr');
        hr.className = 'lp-divider';
        hr.style.cssText = 'max-width:1100px;margin:0 auto;padding:0 1.5rem;border:none;border-top:1px solid var(--mw-border);opacity:0.5;';
        container.appendChild(hr);
      }

      if (FULL_WIDTH[sType]) {
        // Full-width sections (hero, cta) — widget creates its own wrapper
        var el = document.createElement('div');
        container.appendChild(el);
        fn(el, sec);
      } else {
        // Wrapped in lp-section
        var wrap = document.createElement('section');
        wrap.className = 'lp-section' + (CENTERED[sType] ? ' lp-section--center' : '');
        wrap.style.cssText = 'max-width:1100px;margin:0 auto;padding:5rem 1.5rem;scroll-margin-top:60px;';
        container.appendChild(wrap);

        // Kicker + title above the widget (if provided)
        if (sec.kicker || sec.sectionTitle) {
          if (sec.kicker) {
            var kickerEl = document.createElement('div');
            kickerEl.className = 'lp-section__kicker';
            kickerEl.style.cssText = 'font-size:var(--mw-text-xs);color:var(--mw-accent);text-transform:uppercase;letter-spacing:0.12em;font-family:var(--mw-font);margin-bottom:0.75rem;font-weight:600;';
            kickerEl.textContent = sec.kicker;
            wrap.appendChild(kickerEl);
          }
          if (sec.sectionTitle) {
            var titleEl = document.createElement('div');
            titleEl.className = 'lp-section__title';
            titleEl.style.cssText = 'font-size:clamp(1.5rem,3vw,2.125rem);font-weight:700;letter-spacing:-0.02em;margin-bottom:0.75rem;font-family:var(--mw-display-font);';
            titleEl.textContent = sec.sectionTitle;
            wrap.appendChild(titleEl);
          }
          if (sec.sectionDesc) {
            var descEl = document.createElement('div');
            descEl.className = 'lp-section__desc';
            descEl.style.cssText = 'font-size:var(--mw-text-sm);color:var(--mw-text-muted);max-width:520px;line-height:1.7;margin-bottom:2.5rem;';
            if (CENTERED[sType]) descEl.style.cssText += 'margin-left:auto;margin-right:auto;';
            descEl.textContent = sec.sectionDesc;
            wrap.appendChild(descEl);
          }
        }

        var widgetEl = document.createElement('div');
        wrap.appendChild(widgetEl);

        // Build widget config — pass all sec props except meta keys
        var widgetCfg = {};
        for (var k in sec) {
          if (k === 'type' || k === 'kicker' || k === 'sectionTitle' || k === 'sectionDesc') continue;
          widgetCfg[k] = sec[k];
        }
        fn(widgetEl, widgetCfg);
      }
    });

    return M._pageResult(container, cfg, 'landing');
  }

  M._pageBuilders = M._pageBuilders || {};
  M._pageBuilders.landing = landingPage;

})(typeof window !== 'undefined' ? window : this);
