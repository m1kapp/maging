'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    Maging: any;
  }
}

const THEMES = [
  { v: 'claude', name: 'Claude', accent: '#da7756', bg: '#f5f0e8', dark: false },
  { v: 'linear', name: 'Linear', accent: '#5e6ad2', bg: '#ffffff', dark: false },
  { v: 'notion', name: 'Notion', accent: '#37352f', bg: '#ffffff', dark: false },
  { v: 'stripe', name: 'Stripe', accent: '#635bff', bg: '#ffffff', dark: false },
  { v: 'vercel', name: 'Vercel', accent: '#ffffff', bg: '#000000', dark: true },
  { v: 'github', name: 'GitHub', accent: '#58a6ff', bg: '#0d1117', dark: true },
  { v: 'apple', name: 'Apple', accent: '#007aff', bg: '#f5f5f7', dark: false },
  { v: 'linkedin', name: 'LinkedIn', accent: '#0a66c2', bg: '#f3f2ef', dark: false },
  { v: 'x', name: 'X', accent: '#1d9bf0', bg: '#000000', dark: true },
  { v: 'openai', name: 'OpenAI', accent: '#00a67e', bg: '#0d0d0d', dark: true },
  { v: 'discord', name: 'Discord', accent: '#5865f2', bg: '#313338', dark: true },
  { v: 'figma', name: 'Figma', accent: '#ff3737', bg: '#1e1e1e', dark: true },
  { v: 'amazon', name: 'Amazon', accent: '#ff9900', bg: '#131921', dark: true },
  { v: 'airbnb', name: 'Airbnb', accent: '#ff5a5f', bg: '#ffffff', dark: false },
  { v: 'adobe', name: 'Adobe', accent: '#fa0c00', bg: '#1c1c1c', dark: true },
  { v: 'youtube', name: 'YouTube', accent: '#ff0000', bg: '#ffffff', dark: false },
  { v: 'netflix', name: 'Netflix', accent: '#e50914', bg: '#141414', dark: true },
  { v: 'reddit', name: 'Reddit', accent: '#ff4500', bg: '#ffffff', dark: false },
  { v: 'twitch', name: 'Twitch', accent: '#9146ff', bg: '#0e0e10', dark: true },
  { v: 'duolingo', name: 'Duolingo', accent: '#58cc02', bg: '#ffffff', dark: false },
  { v: 'spotify', name: 'Spotify', accent: '#1db954', bg: '#121212', dark: true },
  { v: 'slack', name: 'Slack', accent: '#ecb22e', bg: '#3f0e40', dark: true },
  { v: 'tmobile', name: 'T-Mobile', accent: '#e20074', bg: '#ffffff', dark: false },
  { v: 'mailchimp', name: 'Mailchimp', accent: '#ffe01b', bg: '#fff3d3', dark: false },
  { v: 'fedex', name: 'FedEx', accent: '#ff6600', bg: '#ffffff', dark: false },
  { v: 'instagram', name: 'Instagram', accent: '#e1306c', bg: '#ffffff', dark: false },
  { v: 'bloomberg', name: 'Bloomberg', accent: '#ffa028', bg: '#000000', dark: true },
  { v: 'medium', name: 'Medium', accent: '#1a8917', bg: '#ffffff', dark: false },
  { v: 'tiffany', name: 'Tiffany', accent: '#0abab5', bg: '#ffffff', dark: false },
  { v: 'hermes', name: 'Hermes', accent: '#ff6900', bg: '#f8f2e6', dark: false },
  { v: 'nasa', name: 'NASA', accent: '#fc3d21', bg: '#0b3d91', dark: true },
  { v: 'heineken', name: 'Heineken', accent: '#e10012', bg: '#143d1e', dark: true },
  { v: 'deere', name: 'John Deere', accent: '#ffde00', bg: '#1a3a1a', dark: true },
  { v: 'ups', name: 'UPS', accent: '#ffb500', bg: '#351c15', dark: true },
  { v: 'barbie', name: 'Barbie', accent: '#e0218a', bg: '#fce4ec', dark: false },
];

function initMagingWidgets() {
  const M = window.Maging;
  if (!M) return;

  M.pageHeader('#page-hero', {
    kicker: 'THE STACK',
    title: 'maging의 재료들',
    subtitle:
      '이 라이브러리를 가능하게 한 모든 것 — 무료 폰트, 오픈소스 라이브러리, 공개 CDN, 영감을 준 105개 브랜드, 검증 도구. 모두 출처와 라이선스를 밝힙니다.',
  });

  M.kpiCard('#s-fonts', { label: 'Fonts', value: '6', compact: true });
  M.kpiCard('#s-libs', { label: 'Libraries', value: '2', compact: true });
  M.kpiCard('#s-widgets', { label: 'Widgets', value: '73', compact: true });
  M.kpiCard('#s-themes', { label: 'Brand Themes', value: '105', compact: true });
  M.kpiCard('#s-cdn', { label: 'CDN Providers', value: '2', compact: true });
  M.kpiCard('#s-oss', { label: 'Open Source', value: '100%', compact: true });

  M.sectionHead('#section-01', { index: '01', kicker: 'FONTS', title: 'Fonts', tag: '6종 · SIL OFL · 상업 사용 가능' });
  M.sectionHead('#section-02', { index: '02', kicker: 'LIBRARIES', title: 'Libraries', tag: '2종 · Apache 2.0 · MIT' });
  M.sectionHead('#section-03', { index: '03', kicker: 'ASSETS', title: 'Assets & CDN', tag: 'CC0 · Free CDN' });
  M.sectionHead('#section-04', { index: '04', kicker: 'THEMES', title: 'Theme inspirations', tag: '105개 브랜드 · inspired by' });
  M.sectionHead('#section-05', { index: '05', kicker: 'WIDGETS', title: 'Widget Catalog', tag: '73종 · 테마 연동 · ECharts 기반' });
  M.sectionHead('#section-06', { index: '06', kicker: 'BUILD', title: 'Build & Dev tools', tag: '개발 검증용 · 사용자 미노출' });
  M.sectionHead('#section-07', { index: '07', kicker: 'CHANGELOG', title: 'Release History', tag: 'recent · GitHub' });

  M.activityTable('#font-table', {
    title: '폰트 구성',
    subtitle: '모두 SIL OFL — 상업 사용 가능',
    columns: [
      { key: 'name', label: '폰트' },
      { key: 'role', label: '역할 및 사용처' },
      { key: 'by', label: '제작' },
      { key: 'license', label: '라이선스', align: 'right' },
    ],
    rows: [
      { name: 'Pretendard Variable', role: '한글 본문 · maging 기본 한글 폰트. maging.css @import 자동 내장', by: 'Kil Hyung-jin', license: 'SIL OFL' },
      { name: 'Inter', role: '영문 본문 · 거의 모든 테마의 sans 1순위', by: 'Rasmus Andersson', license: 'SIL OFL' },
      { name: 'JetBrains Mono', role: '코드 · 수치 · 메타 텍스트. 합자 풍부. 토큰 수, 버전, 타임스탬프', by: 'JetBrains', license: 'SIL OFL' },
      { name: 'Playfair Display', role: '디스플레이 세리프 · Claude · Tiffany · Hermes 테마 헤딩', by: 'Claus Eggers', license: 'SIL OFL' },
      { name: 'Hahmlet', role: '한글 세리프 · 강조 테마의 display-font 폴백. Playfair와 짝', by: 'JAMO', license: 'SIL OFL' },
      { name: 'Tossface', role: '컬러 이모지 · 모든 테마 font-stack 내장. 위젯 아이콘 일관 렌더링', by: 'Toss', license: 'SIL OFL' },
    ],
  });

  M.metricStack('#lib-echarts', {
    title: 'Apache ECharts 5',
    main: { label: '차트 위젯 종류', value: '13종' },
    items: [
      { label: '라이선스', value: 'Apache 2.0' },
      { label: '번들 크기', value: '~336 KB gz' },
      { label: '관리 주체', value: 'Apache Foundation' },
    ],
  });

  M.metricStack('#lib-tailwind', {
    title: 'Tailwind CSS Play CDN',
    main: { label: '레이아웃 엔진', value: 'JIT' },
    items: [
      { label: '라이선스', value: 'MIT' },
      { label: '빌드 필요', value: '없음' },
      { label: '방식', value: '브라우저 JIT' },
    ],
  });

  M.statusGrid('#icons-grid', {
    title: 'Icons & Assets',
    subtitle: '아이콘 · 이모지',
    columns: 1,
    items: [
      { label: 'Simple Icons', status: 'ok', value: 'CC0 1.0' },
      { label: 'OS 시스템 이모지', status: 'ok', value: '의존성 0' },
    ],
  });

  M.statusGrid('#dist-grid', {
    title: 'Distribution',
    subtitle: 'CDN · 소스 호스팅',
    columns: 1,
    items: [
      { label: 'jsDelivr', status: 'ok', value: '글로벌 엣지' },
      { label: 'GitHub', status: 'ok', value: 'Free' },
    ],
  });

  M.statusGrid('#build-grid', {
    title: 'Build & Dev Tools',
    subtitle: '프롬프트 토큰 실측 · 호스팅 옵션',
    columns: 3,
    items: [
      { label: 'gpt-tokenizer', status: 'ok', value: 'MIT' },
      { label: '@anthropic-ai/tokenizer', status: 'ok', value: 'MIT' },
      { label: 'Vercel / Cloudflare', status: 'ok', value: 'Free tier' },
    ],
  });

  M.goalGrid('#widget-goals', {
    title: '위젯 카탈로그',
    subtitle: '73종 전부 테마 연동 · zero dependencies',
    items: [
      { label: '대시보드 (Core)', value: 36, max: 36 },
      { label: '슬라이드 (보고)', value: 4, max: 4 },
      { label: '슬라이드 (발표)', value: 12, max: 12 },
      { label: '카드뉴스', value: 11, max: 11 },
      { label: '랜딩페이지', value: 10, max: 10 },
    ],
  });

  M.sparklineList('#widget-timeline', {
    title: '성장 추이',
    subtitle: '버전별 누적',
    items: [
      { label: '대시보드 위젯', value: '36', delta: 0, sparkline: [10, 18, 24, 28, 32, 36, 36] },
      { label: '슬라이드 위젯', value: '16', delta: 12, sparkline: [0, 0, 0, 4, 4, 4, 16] },
      { label: '카드뉴스 위젯', value: '11', delta: 0, sparkline: [0, 0, 0, 0, 11, 11, 11] },
      { label: '랜딩 위젯', value: '10', delta: 0, sparkline: [0, 0, 0, 0, 0, 10, 10] },
      { label: '브랜드 테마', value: '105', delta: 0, sparkline: [10, 20, 35, 65, 78, 105, 105] },
      { label: '폰트', value: '6', delta: 0, sparkline: [2, 3, 4, 5, 6, 6, 6] },
    ],
  });

  M.progressStepper('#release-pipeline', {
    title: '릴리스 파이프라인',
    subtitle: 'v0.1.25 · main → CDN',
    steps: [
      { label: '소스 작성', status: 'done', date: 'maging.js + maging.css' },
      { label: '번들 빌드', status: 'done', date: 'maging-all.js 통합' },
      { label: 'GitHub Push', status: 'done', date: 'main branch' },
      { label: 'jsDelivr CDN', status: 'done', date: '글로벌 엣지 자동 배포' },
      { label: 'Vercel 호스팅', status: 'active', date: '데모 · 스택 · 문서 서빙' },
    ],
  });

  M.timeline('#version-history', {
    title: '릴리스 노트',
    subtitle: '최근 변경 이력 · GitHub',
    items: [
      { time: 'v0.1.25', text: '슬라이드 모드 — 피치덱 위젯 12종 + chainFlow, compareSlide', type: 'success' },
      { time: 'v0.1.24', text: '카드뉴스 모드 — 11종 위젯 + 커버 6스타일', type: 'success' },
      { time: 'v0.1.20', text: '랜딩페이지 모드 — Hero, Pricing, FAQ 등 10종', type: 'success' },
      { time: 'v0.1.15', text: '주간보고 모드 — A4 슬라이드 + monthlyTable + sectionCover', type: 'info' },
      { time: 'v0.1.10', text: '105개 브랜드 테마 완비 + 테마 Picker FAB', type: 'info' },
      { time: 'v0.1.1', text: 'AI Output Formatter 피벗 — 대시보드 위젯 라이브러리 전환', type: 'warning' },
    ],
  });
}

function initThemeGrid() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'claude';
  const note = document.getElementById('theme-note');
  const container = document.getElementById('theme-grid');
  if (!container) return;

  function applyTheme(v: string) {
    document.documentElement.setAttribute('data-theme', v);
    localStorage.setItem('maging-theme', v);
    if (note) note.textContent = '현재 테마: ' + v;
    container!.querySelectorAll('.theme-item').forEach((el) => {
      const btn = el as HTMLElement;
      const active = btn.dataset.theme === v;
      const isDark = btn.dataset.dark === 'true';
      const textColor = isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.75)';
      el.classList.toggle('is-active', active);
      btn.style.borderColor = active ? btn.dataset.accent! : isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)';
      btn.style.borderWidth = active ? '2px' : '1px';
      btn.style.boxShadow = active ? '0 0 0 3px ' + btn.dataset.accent + '40' : '';
      btn.style.color = textColor;
    });
  }

  container.innerHTML = THEMES.map((t) => {
    const active = t.v === currentTheme;
    const textColor = t.dark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.75)';
    const borderColor = active ? t.accent : t.dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)';
    let style = `background:${t.bg};color:${textColor};border-color:${borderColor};`;
    if (active) style += `border-width:2px;box-shadow:0 0 0 3px ${t.accent}40;`;
    return `<button class="theme-item${active ? ' is-active' : ''}" data-theme="${t.v}" data-accent="${t.accent}" data-dark="${t.dark}" data-bg="${t.bg}" style="${style}"><span class="theme-item__swatch" style="background:${t.accent}"></span><span class="theme-item__name">${t.name}</span></button>`;
  }).join('');

  container.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.theme-item') as HTMLElement | null;
    if (btn) applyTheme(btn.dataset.theme!);
  });
}

export default function StackPage() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    function init() {
      initMagingWidgets();
      initThemeGrid();
    }

    if (window.Maging) {
      init();
    } else {
      window.addEventListener('maging:ready', init, { once: true });
    }

    return () => {
      window.removeEventListener('maging:ready', init);
    };
  }, []);

  return (
    <>
      <style jsx global>{`
        .stack-section {
          padding-top: 2.5rem;
          margin-top: 2.5rem;
          border-top: 1px solid var(--mw-border);
        }
        .theme-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 0.5rem;
          margin-top: 1.25rem;
        }
        .theme-item {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          padding: 0.625rem 0.875rem;
          background: var(--mw-surface);
          border: 1px solid var(--mw-border);
          border-radius: calc(var(--mw-radius) * 0.7);
          cursor: pointer;
          user-select: none;
          transition: border-color 140ms, transform 140ms, box-shadow 140ms;
        }
        .theme-item:hover {
          transform: translateY(-1px);
          box-shadow: 0 3px 10px -4px rgba(0, 0, 0, 0.12);
        }
        .theme-item.is-active {
          border-width: 2px;
        }
        .theme-item__swatch {
          width: 14px;
          height: 14px;
          border-radius: 3px;
          flex-shrink: 0;
        }
        .theme-item__name {
          font-size: 0.78rem;
          font-weight: 500;
        }
        .theme-note {
          margin-top: 0.75rem;
          font-size: 0.75rem;
          color: var(--mw-text-muted);
          font-family: var(--mw-mono-font);
        }
        .stack-footer {
          margin-top: 3rem;
          padding: 2rem 0 3rem;
          border-top: 1px solid var(--mw-border);
          text-align: center;
          color: var(--mw-text-muted);
          font-size: 0.78rem;
        }
        .stack-footer a {
          color: inherit;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .stack-footer a:hover {
          color: var(--mw-text);
        }
      `}</style>

      <main className="max-w-[1080px] mx-auto px-6">
        <div id="page-hero" className="pt-14 pb-2" />

        {/* Stats */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-6" style={{ gridAutoRows: '110px' }}>
          <div id="s-fonts" />
          <div id="s-libs" />
          <div id="s-widgets" />
          <div id="s-themes" />
          <div id="s-cdn" />
          <div id="s-oss" />
        </div>

        {/* 01 - Fonts */}
        <div className="stack-section">
          <div id="section-01" />
          <div className="grid grid-cols-1 gap-3 mt-4" style={{ gridAutoRows: '360px' }}>
            <div id="font-table" />
          </div>
        </div>

        {/* 02 - Libraries */}
        <div className="stack-section">
          <div id="section-02" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-4" style={{ gridAutoRows: '210px' }}>
            <div id="lib-echarts" />
            <div id="lib-tailwind" />
          </div>
        </div>

        {/* 03 - Assets & CDN */}
        <div className="stack-section">
          <div id="section-03" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-4" style={{ gridAutoRows: '210px' }}>
            <div id="icons-grid" />
            <div id="dist-grid" />
          </div>
        </div>

        {/* 04 - Theme inspirations */}
        <div className="stack-section">
          <div id="section-04" />
          <p
            style={{
              marginTop: '0.875rem',
              fontSize: '0.82rem',
              color: 'var(--mw-text-muted)',
              lineHeight: 1.65,
              maxWidth: '640px',
            }}
          >
            각 테마는 해당 브랜드의 공개 팔레트·타이포·radius를 영감 삼아 재구성한 것입니다. 브랜드 자산·로고는 사용하지 않습니다. 클릭하면 이 페이지가
            해당 테마로 전환됩니다.
          </p>
          <div className="theme-grid" id="theme-grid" />
          <div className="theme-note" id="theme-note">
            현재 테마: claude
          </div>
        </div>

        {/* 05 - Widget Catalog */}
        <div className="stack-section">
          <div id="section-05" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-4" style={{ gridAutoRows: '300px' }}>
            <div id="widget-goals" />
            <div id="widget-timeline" />
          </div>
        </div>

        {/* 06 - Build & Dev tools */}
        <div className="stack-section">
          <div id="section-06" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-4" style={{ gridAutoRows: '260px' }}>
            <div id="release-pipeline" />
            <div id="build-grid" />
          </div>
        </div>

        {/* 07 - Release History */}
        <div className="stack-section">
          <div id="section-07" />
          <div className="grid grid-cols-1 gap-3 mt-4" style={{ gridAutoRows: '320px' }}>
            <div id="version-history" />
          </div>
        </div>

        <footer className="stack-footer">
          <div>
            모든 출처를 명시했습니다 ·{' '}
            의문 있으면{' '}
            <a href="https://github.com/m1kapp/maging/issues" target="_blank" rel="noopener noreferrer">
              GitHub Issue
            </a>
            로
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <a href="/">
              ← Home
            </a>
          </div>
        </footer>
      </main>
    </>
  );
}
