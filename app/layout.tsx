import './globals.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'maging — AI 답변을, 쓸 수 있는 결과물로.',
  description: 'AI에게 프롬프트를 넣으면 대시보드·슬라이드·카드뉴스·랜딩페이지가 나옵니다.',
  // 아이콘: logodown.m1k.app/?front=char:M&back=symbol:wand&color=%235f49dc
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  manifest: '/manifest.json',
};

// `npx m1kkit pwa --no-sw --bg=#f7f6ff` 가 만든 public/splash 와 짝 — iOS 는 기기 해상도와 똑같은 그림만 쓰고, 없으면 흰 화면을 띄운다
// [CSS 폭, CSS 높이, 배율] 아이폰 세로 13종
const SPLASH = [
  [440, 956, 3], [402, 874, 3], [420, 912, 3], [430, 932, 3], [393, 852, 3], [428, 926, 3], [390, 844, 3],
  [375, 812, 3], [414, 896, 3], [414, 896, 2], [414, 736, 3], [375, 667, 2], [320, 568, 2],
] as const;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const v = process.env.NODE_ENV === 'development' ? `?v=${Date.now()}` : '';
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* 이 태그가 없으면 iOS 가 스플래시를 쓰지 않는다 */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        {SPLASH.map(([w, h, r]) => (
          <link
            key={`${w}x${h}@${r}`}
            rel="apple-touch-startup-image"
            media={`(device-width: ${w}px) and (device-height: ${h}px) and (-webkit-device-pixel-ratio: ${r}) and (orientation: portrait)`}
            href={`/splash/${w * r}x${h * r}.png`}
          />
        ))}
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(){var T=['flow','morningmate','claude','linear','stripe','airbnb','linkedin','apple','duolingo','github','spotify','netflix','figma','adobe','bloomberg'],k='maging-theme',s=localStorage.getItem(k);if(!s||T.indexOf(s)<0)s='flow';document.documentElement.setAttribute('data-theme',s);localStorage.setItem(k,s)}();`,
          }}
        />
        <link rel="stylesheet" href={`/dist/maging.css${v}`} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hahmlet:wght@400;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Playfair+Display:wght@600;700&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: `(function(){var w=console.warn;console.warn=function(){if(arguments[0]&&typeof arguments[0]==='string'&&arguments[0].indexOf('cdn.tailwindcss.com')!==-1)return;return w.apply(console,arguments)}})();` }} />
        <script src="https://cdn.tailwindcss.com" />
        <script defer src={`/dist/maging-all.js${v}`} data-base="/dist/" data-no-tailwind />
      </head>
      <body className="mw-themed">
        {children}
      </body>
    </html>
  );
}
