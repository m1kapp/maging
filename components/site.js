/**
 * maging site components — shared nav + footer
 * Usage: <script type="module" src="[base]/components/site.js"></script>
 *        <maging-nav active="home" mode="core"></maging-nav>
 *        <maging-footer></maging-footer>
 *
 * mode: "core" | "dashboard" | "landing" — controls mode selector + Demo link
 */

const VERSION = '0.1.14';
const GITHUB = 'https://github.com/m1kapp/maging';

const GH_ICON = `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>`;

const MODES = {
  core:      { label: 'Core',         demo: null },
  dashboard: { label: 'Dashboard',    demo: 'dashboard/acme.html' },
  landing:   { label: 'Landing Page', demo: 'landing/startup.html' },
};

/* ── resolve base path from <script src> ── */
function getBase() {
  const script = document.querySelector('script[src*="components/site.js"]');
  if (script) {
    const src = script.getAttribute('src');
    return src.replace(/components\/site\.js.*$/, '');
  }
  return './';
}

/* ── NAV ── */
class MagingNav extends HTMLElement {
  connectedCallback() {
    const base = getBase();
    const active = this.getAttribute('active') || '';
    const mode = this.getAttribute('mode') || 'core';
    const modeInfo = MODES[mode] || MODES.core;

    const link = (href, label, key) =>
      `<a href="${href}" class="mw-site-nav__link${active === key ? ' mw-site-nav__link--active' : ''}">${label}</a>`;

    // mode selector items
    const modeItems = Object.entries(MODES).map(([k, v]) =>
      `<div class="mw-mode__item${k === mode ? ' is-active' : ''}" data-mode="${k}">
        <span class="mw-mode__dot mw-mode__dot--${k}"></span>
        ${v.label}
      </div>`
    ).join('');

    // demo link (only if mode has a demo)
    const demoLink = modeInfo.demo
      ? link(base + modeInfo.demo, 'Demo', 'demo')
      : '';

    this.innerHTML = `
<nav class="mw-site-nav">
  <div class="mw-site-nav__inner">
    <div class="mw-site-nav__left">
      <a href="${base}index.html" class="mw-site-nav__brand">
        <span class="mw-site-nav__mark">✦</span>
        <span class="mw-site-nav__name">maging</span>
      </a>
      <span class="mw-site-nav__sep">/</span>
      <div class="mw-mode" id="mw-mode-picker">
        <button class="mw-mode__trigger" type="button">
          <span class="mw-mode__dot mw-mode__dot--${mode}"></span>
          <span class="mw-mode__label">${modeInfo.label}</span>
          <svg class="mw-mode__chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
        </button>
        <div class="mw-mode__menu">
          ${modeItems}
        </div>
      </div>
    </div>
    <button class="mw-site-nav__burger" type="button" aria-label="Menu">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
    </button>
    <div class="mw-site-nav__links">
      ${link(base + 'index.html', 'Home', 'home')}
      ${link(base + 'components.html', 'Components', 'components')}
      ${demoLink}
      ${link(base + 'stack.html', 'Stack', 'stack')}
      <a href="${GITHUB}" target="_blank" rel="noopener" class="mw-site-nav__link" aria-label="GitHub">${GH_ICON}</a>
    </div>
  </div>
</nav>`;

    // hamburger menu
    const burger = this.querySelector('.mw-site-nav__burger');
    const links = this.querySelector('.mw-site-nav__links');
    burger.addEventListener('click', (e) => {
      e.stopPropagation();
      links.classList.toggle('is-open');
      burger.classList.toggle('is-open');
    });
    document.addEventListener('click', () => {
      links.classList.remove('is-open');
      burger.classList.remove('is-open');
    });

    // custom dropdown behavior
    const picker = this.querySelector('#mw-mode-picker');
    const trigger = picker.querySelector('.mw-mode__trigger');
    const menu = picker.querySelector('.mw-mode__menu');

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      picker.classList.toggle('is-open');
    });
    document.addEventListener('click', () => picker.classList.remove('is-open'));

    menu.addEventListener('click', (e) => {
      const item = e.target.closest('.mw-mode__item');
      if (!item) return;
      const newMode = item.dataset.mode;
      const newModeInfo = MODES[newMode] || MODES.core;

      if (active === 'demo') {
        if (newModeInfo.demo) {
          window.location.href = base + newModeInfo.demo;
        } else {
          const url = new URL(base + 'components.html', window.location.href);
          url.searchParams.set('mode', newMode);
          window.location.href = url.toString();
        }
      } else if (active === 'components') {
        const url = new URL(base + 'components.html', window.location.href);
        url.searchParams.set('mode', newMode);
        window.location.href = url.toString();
      } else {
        const url = new URL(base + 'components.html', window.location.href);
        url.searchParams.set('mode', newMode);
        window.location.href = url.toString();
      }
    });
  }
}

/* ── FOOTER ── */
class MagingFooter extends HTMLElement {
  connectedCallback() {
    const base = getBase();
    const compact = this.hasAttribute('compact');

    if (compact) {
      this.innerHTML = `
<footer class="mw-site-footer mw-site-footer--compact">
  <div class="mw-site-footer__inner" style="text-align:center;">
    <span class="mw-muted" style="font-size:var(--mw-text-xs);">Powered by maging v${VERSION}</span>
  </div>
</footer>`;
      return;
    }

    this.innerHTML = `
<footer class="mw-site-footer">
  <div class="mw-site-footer__inner">
    <div>
      <div style="display:flex;align-items:center;gap:0.625rem;margin-bottom:0.5rem;">
        <span class="mw-site-nav__mark" style="width:22px;height:22px;font-size:0.72rem;">✦</span>
        <span style="font-size:var(--mw-text-sm);font-weight:600;">maging</span>
        <span class="mw-muted" style="font-size:var(--mw-text-xs);font-family:var(--mw-mono-font);padding:0.1rem 0.4rem;background:var(--mw-surface-2);border-radius:3px;">AI Output Formatter</span>
      </div>
      <div class="mw-muted" style="font-size:var(--mw-text-xs);">v${VERSION} · MIT License · Built with ECharts + Tailwind + Pretendard</div>
    </div>
    <div style="display:flex;gap:1.25rem;font-size:var(--mw-text-xs);" class="mw-muted">
      <a href="${base}components.html" style="color:inherit;">Components</a>
      <a href="${base}dashboard/acme.html" style="color:inherit;">Dashboard Demo</a>
      <a href="${base}landing/startup.html" style="color:inherit;">Landing Demo</a>
      <a href="${base}stack.html" style="color:inherit;">Stack</a>
      <a href="${base}llms.txt" style="color:inherit;">llms.txt</a>
      <a href="${GITHUB}" target="_blank" rel="noopener" style="color:inherit;">GitHub</a>
    </div>
  </div>
</footer>`;
  }
}

customElements.define('maging-nav', MagingNav);
customElements.define('maging-footer', MagingFooter);

/* ── Random theme on every page load ── */
const ALL_THEMES = [
  'claude','linear','stripe','notion','airbnb','linkedin','instagram','youtube',
  'reddit','medium','apple','duolingo','vercel','github','x','slack','discord',
  'openai','spotify','twitch','netflix','figma','amazon','adobe','bloomberg',
];
const randomTheme = ALL_THEMES[Math.floor(Math.random() * ALL_THEMES.length)];
document.documentElement.setAttribute('data-theme', randomTheme);
// if Maging is loaded, refresh widgets
if (typeof Maging !== 'undefined' && Maging.refreshAll) {
  requestAnimationFrame(() => requestAnimationFrame(() => Maging.refreshAll()));
}

/* ── inject shared styles (once) ── */
if (!document.getElementById('mw-site-css')) {
  const style = document.createElement('style');
  style.id = 'mw-site-css';
  style.textContent = `
/* ── maging site nav ── */
.mw-site-nav {
  position: sticky; top: 0; z-index: 60;
  background: color-mix(in srgb, var(--mw-surface) 88%, transparent);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid color-mix(in srgb, var(--mw-border) 70%, transparent);
}
[data-theme="terminal"] .mw-site-nav { backdrop-filter: none; background: var(--mw-surface); }

.mw-site-nav__inner {
  max-width: 1280px; margin: 0 auto;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 1.5rem; height: 44px; gap: 0.75rem;
  flex-wrap: wrap;
}
.mw-site-nav__left {
  display: inline-flex; align-items: center; gap: 0.5rem;
}
.mw-site-nav__brand {
  display: inline-flex; align-items: center; gap: 0.5rem;
  text-decoration: none; color: inherit; transition: opacity 120ms;
}
.mw-site-nav__brand:hover { opacity: 0.8; }
.mw-site-nav__mark {
  width: 22px; height: 22px; background: var(--mw-accent); color: #fff;
  display: inline-flex; align-items: center; justify-content: center;
  font-weight: 700; border-radius: calc(var(--mw-radius) * 0.7); font-size: 0.72rem;
}
[data-theme="vercel"] .mw-site-nav__mark,
[data-theme="spotify"] .mw-site-nav__mark,
[data-theme="slack"] .mw-site-nav__mark,
[data-theme="amazon"] .mw-site-nav__mark,
[data-theme="mailchimp"] .mw-site-nav__mark,
[data-theme="ups"] .mw-site-nav__mark,
[data-theme="deere"] .mw-site-nav__mark { color: #000; }

.mw-site-nav__name { font-size: 0.92rem; font-weight: 600; letter-spacing: -0.005em; }
.mw-site-nav__sep {
  font-size: 0.8rem; color: var(--mw-text-muted); opacity: 0.4;
  font-weight: 300; margin: 0 -0.1rem;
}

/* ── custom mode picker ── */
.mw-mode { position: relative; }
.mw-mode__trigger {
  display: inline-flex; align-items: center; gap: 0.375rem;
  font-size: 0.75rem; font-family: var(--mw-font); font-weight: 500;
  color: var(--mw-text); background: var(--mw-surface-2);
  border: 1px solid var(--mw-border); border-radius: calc(var(--mw-radius) * 0.6);
  padding: 0.25rem 0.5rem; cursor: pointer;
  transition: border-color 150ms, box-shadow 150ms;
}
.mw-mode__trigger:hover { border-color: var(--mw-accent); }
.mw-mode.is-open .mw-mode__trigger { border-color: var(--mw-accent); box-shadow: 0 0 0 2px color-mix(in srgb, var(--mw-accent) 20%, transparent); }
.mw-mode__label { line-height: 1; }
.mw-mode__chevron { opacity: 0.4; transition: transform 200ms; flex-shrink: 0; }
.mw-mode.is-open .mw-mode__chevron { transform: rotate(180deg); }

.mw-mode__dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
}
.mw-mode__dot--core { background: var(--mw-accent); }
.mw-mode__dot--dashboard { background: var(--mw-success, #22c55e); }
.mw-mode__dot--landing { background: var(--mw-warning, #f59e0b); }

.mw-mode__menu {
  position: absolute; top: calc(100% + 6px); left: 0;
  min-width: 160px; padding: 0.25rem;
  background: var(--mw-surface); border: 1px solid var(--mw-border);
  border-radius: var(--mw-radius); box-shadow: 0 8px 24px -8px rgba(0,0,0,0.18);
  opacity: 0; visibility: hidden; transform: translateY(-4px);
  transition: opacity 150ms, visibility 150ms, transform 150ms;
  z-index: 200;
}
.mw-mode.is-open .mw-mode__menu { opacity: 1; visibility: visible; transform: translateY(0); }

.mw-mode__item {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.45rem 0.625rem; border-radius: calc(var(--mw-radius) * 0.5);
  font-size: 0.75rem; font-family: var(--mw-font); font-weight: 500;
  color: var(--mw-text-muted); cursor: pointer;
  transition: background 120ms, color 120ms;
}
.mw-mode__item:hover { background: var(--mw-surface-2); color: var(--mw-text); }
.mw-mode__item.is-active { color: var(--mw-text); font-weight: 600; }

.mw-site-nav__ver {
  font-size: 0.62rem; font-family: var(--mw-mono-font); color: var(--mw-text-muted);
  padding: 0.1rem 0.35rem; border-radius: 3px; background: var(--mw-surface-2); letter-spacing: 0;
}
.mw-site-nav__page {
  font-size: 0.75rem; color: var(--mw-text-muted); font-weight: 400;
  font-family: var(--mw-mono-font);
}
/* hamburger */
.mw-site-nav__burger {
  display: none; background: none; border: none; color: var(--mw-text-muted);
  cursor: pointer; padding: 0.25rem; border-radius: calc(var(--mw-radius) * 0.5);
  transition: color 120ms;
}
.mw-site-nav__burger:hover { color: var(--mw-text); }

.mw-site-nav__links { display: flex; align-items: center; gap: 0.25rem; }

@media (max-width: 640px) {
  .mw-site-nav__burger { display: flex; }
  .mw-site-nav__links {
    display: none; position: absolute; top: 44px; left: 0; right: 0;
    flex-direction: column; align-items: stretch; gap: 0;
    background: var(--mw-surface); border-bottom: 1px solid var(--mw-border);
    padding: 0.5rem; box-shadow: 0 8px 24px -8px rgba(0,0,0,0.15);
  }
  .mw-site-nav__links.is-open { display: flex; }
  .mw-site-nav__links .mw-site-nav__link {
    padding: 0.6rem 0.75rem; border-radius: var(--mw-radius);
    font-size: 0.82rem;
  }
  .mw-site-nav__inner { position: relative; }
}
.mw-site-nav__link {
  padding: 0.35rem 0.6rem; font-size: 0.75rem; color: var(--mw-text-muted);
  text-decoration: none; border-radius: calc(var(--mw-radius) * 0.6);
  transition: color 120ms, background 120ms; font-family: var(--mw-font);
  display: inline-flex; align-items: center; gap: 0.25rem;
}
.mw-site-nav__link:hover { color: var(--mw-text); background: var(--mw-surface-2); }
.mw-site-nav__link--active { color: var(--mw-text); background: var(--mw-surface-2); font-weight: 500; }

/* ── maging site footer ── */
.mw-site-footer { border-top: 1px solid var(--mw-border); }
.mw-site-footer__inner {
  max-width: 1280px; margin: 0 auto; padding: 2.5rem 1.5rem;
  display: flex; align-items: flex-start; justify-content: space-between;
  flex-wrap: wrap; gap: 1.5rem;
}
.mw-site-footer--compact .mw-site-footer__inner { padding: 2rem 1.5rem; }
`;
  document.head.appendChild(style);
}
