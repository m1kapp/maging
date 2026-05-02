/**
 * maging site components — shared nav + footer
 * Usage: <script type="module" src="[base]/components/site.js"></script>
 *        <maging-nav active="home" mode="core"></maging-nav>
 *        <maging-footer></maging-footer>
 *
 * mode: "core" | "dashboard" | "landing" | "weekly" — controls mode selector + Demo link
 */

const VERSION = '0.1.19';
const GITHUB = 'https://github.com/m1kapp/maging';

const GH_ICON = `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>`;

const MODES = {
  core:      { label: 'Core',         demo: null },
  dashboard: { label: 'Dashboard',    demo: 'dashboard/acme.html' },
  landing:   { label: 'Landing Page', demo: 'landing/startup.html' },
  weekly:    { label: 'Weekly Report', demo: 'weekly-report/index.html' },
  cardnews:  { label: 'Card News',    demo: 'card-news/index.html' },
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

    this.innerHTML = `
<nav class="mw-site-nav">
  <div class="mw-site-nav__inner">
    <a href="${base}index.html" class="mw-site-nav__brand">
      <span class="mw-site-nav__mark">✦</span>
      <span class="mw-site-nav__name">maging</span>
    </a>
    <button class="mw-site-nav__burger" type="button" aria-label="Menu">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
    </button>
    <div class="mw-site-nav__links">
      ${link(base + 'index.html', '홈', 'home')}
      <div class="mw-site-nav__dropdown">
        <button class="mw-site-nav__link mw-site-nav__link--dropdown${active === 'components' ? ' mw-site-nav__link--active' : ''}" type="button">
          컴포넌트 <svg class="mw-site-nav__caret" width="8" height="5" viewBox="0 0 8 5" fill="currentColor"><path d="M0 0L4 5L8 0Z"/></svg>
        </button>
        <div class="mw-site-nav__menu mw-site-nav__menu--mega">
          <div class="mw-site-nav__mega-col">
            <a href="${base}components.html?mode=core" class="mw-site-nav__mega-head">
              <span class="mw-site-nav__mega-icon">▦</span>
              <span>
                <span class="mw-site-nav__menu-label">대시보드</span>
                <span class="mw-site-nav__menu-desc">KPI · 차트 · 테이블</span>
              </span>
            </a>
            <a href="${base}components.html?mode=core&cat=Metrics" class="mw-site-nav__menu-item">Metrics (10종)</a>
            <a href="${base}components.html?mode=core&cat=Charts" class="mw-site-nav__menu-item">Charts (13종)</a>
            <a href="${base}components.html?mode=core&cat=Lists" class="mw-site-nav__menu-item">Lists & Status (5종)</a>
          </div>
          <div class="mw-site-nav__mega-col">
            <a href="${base}components.html?mode=weekly" class="mw-site-nav__mega-head">
              <span class="mw-site-nav__mega-icon">▤</span>
              <span>
                <span class="mw-site-nav__menu-label">주간보고</span>
                <span class="mw-site-nav__menu-desc">A4 슬라이드 · 커버 · 인사이트</span>
              </span>
            </a>
            <a href="${base}components.html?mode=weekly" class="mw-site-nav__menu-item">Section Cover (5종)</a>
            <a href="${base}components.html?mode=weekly" class="mw-site-nav__menu-item">Insight · Def Card</a>
            <a href="${base}components.html?mode=weekly" class="mw-site-nav__menu-item">Monthly Table</a>
          </div>
          <div class="mw-site-nav__mega-col">
            <a href="${base}components.html?mode=landing" class="mw-site-nav__mega-head">
              <span class="mw-site-nav__mega-icon">◐</span>
              <span>
                <span class="mw-site-nav__menu-label">랜딩페이지</span>
                <span class="mw-site-nav__menu-desc">Hero · Pricing · FAQ</span>
              </span>
            </a>
            <a href="${base}components.html?mode=landing" class="mw-site-nav__menu-item">Hero · CTA Section</a>
            <a href="${base}components.html?mode=landing" class="mw-site-nav__menu-item">Pricing · Comparison</a>
            <a href="${base}components.html?mode=landing" class="mw-site-nav__menu-item">Testimonial · FAQ</a>
          </div>
          <div class="mw-site-nav__mega-col">
            <a href="${base}components.html?mode=cardnews" class="mw-site-nav__mega-head">
              <span class="mw-site-nav__mega-icon">◳</span>
              <span>
                <span class="mw-site-nav__menu-label">카드뉴스</span>
                <span class="mw-site-nav__menu-desc">캐러셀 11종 · 커버 6스타일</span>
              </span>
            </a>
            <a href="${base}components.html?mode=cardnews" class="mw-site-nav__menu-item">Cover · Body · Data</a>
            <a href="${base}components.html?mode=cardnews" class="mw-site-nav__menu-item">Quote · Stat · Compare</a>
            <a href="${base}components.html?mode=cardnews" class="mw-site-nav__menu-item">Step · Checklist · CTA</a>
          </div>
        </div>
      </div>
      <div class="mw-site-nav__dropdown">
        <button class="mw-site-nav__link mw-site-nav__link--dropdown${active === 'demo' ? ' mw-site-nav__link--active' : ''}" type="button">
          데모 <svg class="mw-site-nav__caret" width="8" height="5" viewBox="0 0 8 5" fill="currentColor"><path d="M0 0L4 5L8 0Z"/></svg>
        </button>
        <div class="mw-site-nav__menu mw-site-nav__menu--mega">
          <div class="mw-site-nav__mega-col">
            <div class="mw-site-nav__mega-head">
              <span class="mw-site-nav__mega-icon">▦</span>
              <span>
                <span class="mw-site-nav__menu-label">대시보드</span>
                <span class="mw-site-nav__menu-desc">운영 · 매출 분석</span>
              </span>
            </div>
            <a href="${base}dashboard/acme.html" class="mw-site-nav__menu-item">B2B SaaS 운영 대시보드</a>
            <a href="${base}dashboard/sales.html" class="mw-site-nav__menu-item">매출 인사이트 · 데이터 연동</a>
          </div>
          <div class="mw-site-nav__mega-col">
            <div class="mw-site-nav__mega-head">
              <span class="mw-site-nav__mega-icon">▤</span>
              <span>
                <span class="mw-site-nav__menu-label">주간보고</span>
                <span class="mw-site-nav__menu-desc">A4 슬라이드 리포트</span>
              </span>
            </div>
            <a href="${base}weekly-report/index.html" class="mw-site-nav__menu-item">SaaS 주간보고 · 15 슬라이드</a>
            <a href="${base}weekly-report/ecommerce.html" class="mw-site-nav__menu-item">이커머스 마케팅 · 5 슬라이드</a>
          </div>
          <div class="mw-site-nav__mega-col">
            <div class="mw-site-nav__mega-head">
              <span class="mw-site-nav__mega-icon">◐</span>
              <span>
                <span class="mw-site-nav__menu-label">랜딩페이지</span>
                <span class="mw-site-nav__menu-desc">마케팅 전환 페이지</span>
              </span>
            </div>
            <a href="${base}landing/startup.html" class="mw-site-nav__menu-item">개발자 도구 랜딩</a>
            <a href="${base}landing/edtech.html" class="mw-site-nav__menu-item">교육 플랫폼 랜딩</a>
          </div>
          <div class="mw-site-nav__mega-col">
            <div class="mw-site-nav__mega-head">
              <span class="mw-site-nav__mega-icon">◳</span>
              <span>
                <span class="mw-site-nav__menu-label">카드뉴스</span>
                <span class="mw-site-nav__menu-desc">인스타 · 링크드인 캐러셀</span>
              </span>
            </div>
            <a href="${base}card-news/index.html" class="mw-site-nav__menu-item">AI 마케팅 가이드 · 11장</a>
            <a href="${base}card-news/finance.html" class="mw-site-nav__menu-item">재테크 가이드 · 11장</a>
          </div>
        </div>
      </div>
      ${link(base + 'stack.html', '스택', 'stack')}
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
      <a href="${base}components.html" style="color:inherit;">컴포넌트</a>
      <a href="${base}dashboard/acme.html" style="color:inherit;">대시보드 데모</a>
      <a href="${base}weekly-report/index.html" style="color:inherit;">주간보고 데모</a>
      <a href="${base}landing/startup.html" style="color:inherit;">랜딩페이지 데모</a>
      <a href="${base}card-news/index.html" style="color:inherit;">카드뉴스 데모</a>
      <a href="${base}stack.html" style="color:inherit;">스택</a>
      <a href="${base}llms.txt" style="color:inherit;">llms.txt</a>
      <a href="${GITHUB}" target="_blank" rel="noopener" style="color:inherit;">GitHub</a>
    </div>
  </div>
</footer>`;
  }
}

customElements.define('maging-nav', MagingNav);
customElements.define('maging-footer', MagingFooter);

/* ── Hero stats: count widgets & themes from Maging runtime ── */
function fillHeroStats() {
  const el = document.getElementById('hero-stats');
  if (!el) return;
  const M = window.Maging;
  if (!M) { el.textContent = 'widgets · themes'; return; }
  const skip = new Set(['version','fmt','setTheme','refreshAll','page','meta','themes']);
  const widgets = Object.keys(M).filter(k => typeof M[k] === 'function' && !skip.has(k)).length;
  const themes = Array.isArray(M.themes) ? M.themes.length : 0;
  el.textContent = `${widgets} widgets · ${themes} themes`;
}
window.addEventListener('maging:ready', fillHeroStats);
if (window.Maging) fillHeroStats();

/* ── Theme: handled by inline <script> in <head> to avoid flash ── */

// listen for theme changes (e.g. from Maging.setTheme) and persist
const _THEME_KEY = 'maging-theme';
new MutationObserver(() => {
  const current = document.documentElement.getAttribute('data-theme');
  if (current) localStorage.setItem(_THEME_KEY, current);
}).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

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
.mw-site-nav__link--dropdown { cursor: pointer; border: none; background: none; }
.mw-site-nav__caret { opacity: 0.55; vertical-align: middle; margin-left: 2px; display: inline-block; }

/* dropdown (normal) */
.mw-site-nav__dropdown { position: relative; }
.mw-site-nav__menu {
  position: absolute; top: calc(100% + 4px); left: 50%; transform: translateX(-50%);
  min-width: 220px; padding: 0.375rem; max-height: 80vh; overflow-y: auto;
  background: var(--mw-surface); border: 1px solid var(--mw-border);
  border-radius: var(--mw-radius); box-shadow: 0 8px 24px -8px rgba(0,0,0,0.15);
  opacity: 0; visibility: hidden; transition: opacity 150ms, visibility 150ms;
  z-index: 100;
}
.mw-site-nav__dropdown:hover .mw-site-nav__menu,
.mw-site-nav__dropdown:focus-within .mw-site-nav__menu {
  opacity: 1; visibility: visible;
}
.mw-site-nav__menu-item {
  display: block; padding: 0.5rem 0.75rem; border-radius: calc(var(--mw-radius) * 0.5);
  text-decoration: none; color: inherit; transition: background 120ms;
}
.mw-site-nav__menu-item:hover { background: var(--mw-surface-2); }
.mw-site-nav__menu-label { display: block; font-size: 0.78rem; font-weight: 600; font-family: var(--mw-font); }
.mw-site-nav__menu-desc { display: block; font-size: 0.65rem; color: var(--mw-text-muted); font-family: var(--mw-font); margin-top: 0.1rem; }
.mw-site-nav__menu-group { font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--mw-text-muted); padding: 0.5rem 0 0.25rem; font-family: var(--mw-font); }
.mw-site-nav__menu-group:first-child { padding-top: 0; }

/* mega dropdown — full-width under nav */
.mw-site-nav__dropdown:has(.mw-site-nav__menu--mega) { position: static; }
.mw-site-nav__menu--mega {
  position: absolute; top: 100%; left: 0; right: 0;
  transform: none;
  min-width: 0; max-height: none;
  border-radius: 0;
  border: none;
  border-bottom: 1px solid var(--mw-border);
  box-shadow: 0 8px 32px -6px rgba(0,0,0,0.1);
  padding: 0 max(1.5rem, calc((100% - 1280px) / 2));
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 0;
  z-index: 100;
}
.mw-site-nav__mega-col {
  display: flex; flex-direction: column;
  padding: 1rem 1.25rem;
}
.mw-site-nav__mega-col + .mw-site-nav__mega-col { border-left: 1px solid var(--mw-border); }
.mw-site-nav__menu--mega .mw-site-nav__menu-item {
  display: block; font-size: 0.78rem; color: var(--mw-text-muted); font-family: var(--mw-font);
  padding: 0.35rem 0.5rem; transition: color 120ms; text-decoration: none;
  border-radius: calc(var(--mw-radius) * 0.4);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.mw-site-nav__menu--mega .mw-site-nav__menu-item:hover { color: var(--mw-text); background: var(--mw-surface-2); }
.mw-site-nav__mega-head {
  display: flex; align-items: center; gap: 0.625rem;
  padding: 0 0.25rem 0.625rem; margin-bottom: 0.25rem;
  text-decoration: none; color: inherit;
}
.mw-site-nav__mega-head .mw-site-nav__menu-label { font-size: 0.82rem; font-weight: 700; display: block; }
.mw-site-nav__mega-head .mw-site-nav__menu-desc { font-size: 0.62rem; color: var(--mw-text-muted); display: block; margin-top: 0.05rem; white-space: nowrap; }
.mw-site-nav__mega-icon {
  display: flex; align-items: center; justify-content: center;
  width: 2rem; height: 2rem; border-radius: calc(var(--mw-radius) * 0.5);
  background: color-mix(in srgb, var(--mw-accent) 10%, var(--mw-surface-2));
  color: var(--mw-accent); font-size: 0.9rem; flex-shrink: 0;
}
.mw-theme-shuffle { border: none; cursor: pointer; }
.mw-theme-shuffle:hover svg { transform: rotate(180deg); }
.mw-theme-shuffle svg { transition: transform 0.3s ease; }

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
