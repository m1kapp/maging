import Link from 'next/link';

const VERSION = '0.1.25';

export function Footer() {
  return (
    <footer className="mw-site-footer">
      <div className="mw-site-footer__inner">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
            <span className="mw-site-nav__mark" style={{ width: 22, height: 22, fontSize: '0.72rem' }}>✦</span>
            <span style={{ fontSize: 'var(--mw-text-sm)', fontWeight: 600 }}>maging</span>
            <span className="mw-muted" style={{ fontSize: 'var(--mw-text-xs)', fontFamily: 'var(--mw-mono-font)', padding: '0.1rem 0.4rem', background: 'var(--mw-surface-2)', borderRadius: 3 }}>
              AI Output Formatter
            </span>
          </div>
          <div className="mw-muted" style={{ fontSize: 'var(--mw-text-xs)' }}>
            v{VERSION} · MIT License · Built with ECharts + Tailwind + Pretendard
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1.25rem', fontSize: 'var(--mw-text-xs)' }} className="mw-muted">
          <Link href="/components" style={{ color: 'inherit' }}>컴포넌트</Link>
          <Link href="/demo/dashboard/acme" style={{ color: 'inherit' }}>대시보드 데모</Link>
          <Link href="/demo/slide/weekly" style={{ color: 'inherit' }}>주간보고 데모</Link>
          <Link href="/stack" style={{ color: 'inherit' }}>스택</Link>
          <a href="https://github.com/m1kapp/maging" target="_blank" rel="noopener" style={{ color: 'inherit' }}>GitHub</a>
        </div>
      </div>
    </footer>
  );
}
