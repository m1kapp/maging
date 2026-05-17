import './globals.css';

export const metadata = {
  title: 'maging — AI 답변을, 쓸 수 있는 결과물로.',
  description: 'AI에게 프롬프트를 넣으면 대시보드·슬라이드·카드뉴스·랜딩페이지가 나옵니다.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(){var T=['flow','morningmate','claude','linear','stripe','airbnb','linkedin','apple','duolingo','github','spotify','netflix','figma','adobe','bloomberg'],k='maging-theme',s=localStorage.getItem(k);if(!s||T.indexOf(s)<0)s='flow';document.documentElement.setAttribute('data-theme',s);localStorage.setItem(k,s)}();`,
          }}
        />
        <link rel="stylesheet" href="/dist/maging.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hahmlet:wght@400;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Playfair+Display:wght@600;700&display=swap"
          rel="stylesheet"
        />
        <script defer src="/dist/maging-all.js" data-base="/dist/" data-no-tailwind />
      </head>
      <body className="mw-themed">
        {children}
      </body>
    </html>
  );
}
