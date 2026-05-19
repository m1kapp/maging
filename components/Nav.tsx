'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const GH_ICON = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const CARET = (
  <svg className="mw-site-nav__caret" width="8" height="5" viewBox="0 0 8 5" fill="currentColor">
    <path d="M0 0L4 5L8 0Z" />
  </svg>
);

export function Nav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (key: string) => {
    if (key === 'home') return pathname === '/';
    if (key === 'components') return pathname.startsWith('/components');
    if (key === 'demo') return pathname.startsWith('/demo');
    if (key === 'stack') return pathname === '/stack';
    return false;
  };

  const linkClass = (key: string) =>
    `mw-site-nav__link${isActive(key) ? ' mw-site-nav__link--active' : ''}`;

  return (
    <nav className="mw-site-nav">
      <div className="mw-site-nav__inner">
        <Link href="/" className="mw-site-nav__brand">
          <span className="mw-site-nav__mark">✦</span>
          <span className="mw-site-nav__name">maging</span>
        </Link>

        <button
          className={`mw-site-nav__burger${menuOpen ? ' is-open' : ''}`}
          type="button"
          aria-label="Menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>

        <div className={`mw-site-nav__links${menuOpen ? ' is-open' : ''}`}>
          <Link href="/" className={linkClass('home')}>홈</Link>

          {/* 컴포넌트 드롭다운 */}
          <div className="mw-site-nav__dropdown">
            <button
              className={`mw-site-nav__link mw-site-nav__link--dropdown${isActive('components') ? ' mw-site-nav__link--active' : ''}`}
              type="button"
            >
              컴포넌트 {CARET}
            </button>
            <div className="mw-site-nav__menu mw-site-nav__menu--mega">
              <div className="mw-site-nav__mega-col">
                <Link href="/components?mode=core" className="mw-site-nav__mega-head">
                  <span className="mw-site-nav__mega-icon">▦</span>
                  <span>
                    <span className="mw-site-nav__menu-label">대시보드</span>
                    <span className="mw-site-nav__menu-desc">KPI · 차트 · 테이블</span>
                  </span>
                </Link>
                <Link href="/components?mode=core&cat=Metrics" className="mw-site-nav__menu-item">Metrics (10종)</Link>
                <Link href="/components?mode=core&cat=Charts" className="mw-site-nav__menu-item">Charts (13종)</Link>
                <Link href="/components?mode=core&cat=Lists" className="mw-site-nav__menu-item">Lists &amp; Status (5종)</Link>
              </div>
              <div className="mw-site-nav__mega-col">
                <Link href="/components?mode=slide" className="mw-site-nav__mega-head">
                  <span className="mw-site-nav__mega-icon">▤</span>
                  <span>
                    <span className="mw-site-nav__menu-label">슬라이드</span>
                    <span className="mw-site-nav__menu-desc">보고 · 발표 · 제안</span>
                  </span>
                </Link>
                <Link href="/components?mode=slide" className="mw-site-nav__menu-item">Cover · Table · Problem · Market · Ask</Link>
              </div>
            </div>
          </div>

          {/* 데모 드롭다운 */}
          <div className="mw-site-nav__dropdown">
            <button
              className={`mw-site-nav__link mw-site-nav__link--dropdown${isActive('demo') ? ' mw-site-nav__link--active' : ''}`}
              type="button"
            >
              데모 {CARET}
            </button>
            <div className="mw-site-nav__menu mw-site-nav__menu--mega">
              <div className="mw-site-nav__mega-col">
                <div className="mw-site-nav__mega-head">
                  <span className="mw-site-nav__mega-icon">▦</span>
                  <span>
                    <span className="mw-site-nav__menu-label">대시보드</span>
                    <span className="mw-site-nav__menu-desc">실시간 · 단일 페이지</span>
                  </span>
                </div>
                <Link href="/demo/dashboard/acme" className="mw-site-nav__menu-item">운영 모니터링 · SaaS</Link>
                <Link href="/demo/dashboard/sales" className="mw-site-nav__menu-item">매출/영업 분석</Link>
                <Link href="/demo/dashboard/finance" className="mw-site-nav__menu-item">투자 포트폴리오</Link>
                <Link href="/demo/dashboard/hr" className="mw-site-nav__menu-item">HR 애널리틱스</Link>
              </div>
              <div className="mw-site-nav__mega-col">
                <div className="mw-site-nav__mega-head">
                  <span className="mw-site-nav__mega-icon">▤</span>
                  <span>
                    <span className="mw-site-nav__menu-label">슬라이드</span>
                    <span className="mw-site-nav__menu-desc">발표 · 보고 · 제안</span>
                  </span>
                </div>
                <Link href="/demo/slide/pitch" className="mw-site-nav__menu-item">투자 유치 · 피칭</Link>
                <Link href="/demo/slide/proposal" className="mw-site-nav__menu-item">도입 제안</Link>
                <Link href="/demo/slide/strategy" className="mw-site-nav__menu-item">이노엔 · 내부 전략</Link>
                <Link href="/demo/slide/weekly" className="mw-site-nav__menu-item">SaaS 주간보고</Link>
                <Link href="/demo/slide/ecommerce" className="mw-site-nav__menu-item">이커머스 주간보고</Link>
              </div>
            </div>
          </div>

          <Link href="/stack" className={linkClass('stack')}>스택</Link>
          <a href="https://github.com/m1kapp/maging" target="_blank" rel="noopener" className="mw-site-nav__link" aria-label="GitHub">
            {GH_ICON}
          </a>
        </div>
      </div>
    </nav>
  );
}
