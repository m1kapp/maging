/*! maging-landing v0.1.15 — Landing-page widgets for maging | MIT
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
      '.mw-faq { max-width: 720px; }',
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
      padding: '6rem 1.5rem 4rem',
    }, config || {});

    el.className = 'mw-hero-section';
    el.style.padding = d.padding;

    var ctasHTML = d.ctas.map(function (c) {
      var cls = 'mw-lp-btn' + (c.primary ? ' mw-lp-btn--primary' : '');
      return '<a href="' + esc(c.href || '#') + '" class="' + cls + '">' + esc(c.label) + '</a>';
    }).join('');

    el.innerHTML =
      '<div class="mw-hero-section__inner">' +
        (d.kicker ? '<div class="mw-hero-section__kicker">' + esc(d.kicker) + '</div>' : '') +
        '<h1 class="mw-hero-section__title">' + d.title + '</h1>' +
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
      '<pre class="mw-codeblock__body"><code>' + esc(d.code) + '</code></pre>';

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
  M.faqAccordion = faqAccordion;
  M.stepGuide = stepGuide;
  M.codeBlock = codeBlock;
  M.comparisonTable = comparisonTable;

})(typeof window !== 'undefined' ? window : this);
