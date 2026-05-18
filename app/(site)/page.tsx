import { MagingPage } from '@/components/MagingPage';

const config = {
  mode: 'landing',
  sections: [
    // ── HERO with word roller ──
    {
      type: 'hero',
      kicker: 'maging',
      title: 'AI 답변을,<br>쓸 수 있는 {{roller}} 로.',
      roller: ['결과물', '대시보드', '슬라이드', '카드뉴스', '랜딩페이지'],
      rollerDuration: 12000,
      subtitle: '코딩도, 디자인도, 파워포인트도 필요 없습니다. 프롬프트 하나면 완성입니다.',
      ctas: [
        { label: 'Get started →', href: '#use-with-ai', primary: true },
        { label: 'View demo', href: '/demo/dashboard/acme' },
      ],
    },

    // ── AI DEMO (split-screen) ──
    {
      type: 'aiDemo',
      kicker: 'HOW IT WORKS',
      sectionTitle: '프롬프트 복사 → 붙여넣기 → 완성',
      services: [
        { id: 'flowai', label: 'flowAI', icon: '/dist/logo.png', url: 'maging.m1k.app' },
        { id: 'chatgpt', label: 'ChatGPT', icon: '/dist/icons/openai.svg', url: 'chatgpt.com' },
        { id: 'claude', label: 'Claude', icon: '/dist/icons/claude.svg', url: 'claude.ai' },
        { id: 'gemini', label: 'Gemini', icon: '/dist/icons/gemini.svg', url: 'gemini.google.com' },
      ],
      outputs: [
        { id: 'dashboard', label: '대시보드' },
        { id: 'weekly-report', label: '슬라이드' },
        { id: 'card-news', label: '카드뉴스' },
        { id: 'landing', label: '랜딩페이지' },
      ],
      sizes: ['short', 'full'],
      defaultOutput: 'dashboard',
      defaultSize: 'full',
      promptBaseUrl: '/llms/',
      requests: {
        'dashboard': '3월 매출 CSV 기반으로 경영진 리뷰용 대시보드 만들어줘',
        'weekly-report': 'SaaS팀 4월 4주차 주간보고 만들어줘. 영업·CS·개발·AX 4개 팀',
        'landing': 'AI 코드 리뷰 SaaS 랜딩페이지 만들어줘. 히어로+기능+가격+FAQ',
        'card-news': 'AI 마케팅 트렌드 카드뉴스 만들어줘. 10장짜리',
      },
      handshakes: {
        'dashboard': '데이터 파일을 첨부하거나, 만들고 싶은 대시보드를 자유롭게 설명해주세요.',
        'weekly-report': '주간보고를 만들어 드릴게요. 팀 구조와 KPI를 알려주세요.',
        'landing': '랜딩페이지를 만들어 드릴게요. 제품 정보를 알려주세요.',
        'card-news': '카드뉴스를 만들어 드릴게요. 주제와 장수를 알려주세요.',
      },
      previews: {
        'dashboard': [
          { type: 'kpiCard', compact: true, label: '매출', value: '128억', delta: 8.3 },
          { type: 'kpiCard', compact: true, label: 'DAU', value: '48K', delta: 12.4 },
          { type: 'lineChart', categories: ['1월', '2월', '3월', '4월', '5월', '6월'], series: [{ name: '매출', data: [72, 78, 81, 88, 91, 128] }] },
        ],
        'weekly-report': [
          { type: 'kpiCard', compact: true, label: '신규매출', value: '30억', delta: 18.5 },
          { type: 'kpiCard', compact: true, label: '달성률', value: '96%', delta: -3.8 },
        ],
        'card-news': [
          { type: 'kpiCard', compact: true, label: 'AI 도입률', value: '78%', delta: 15.2 },
          { type: 'barChart', items: [{ label: '마케팅', value: 78 }, { label: '영업', value: 65 }, { label: 'CS', value: 52 }] },
        ],
        'landing': [
          { type: 'kpiCard', compact: true, label: '위젯', value: '73개' },
          { type: 'kpiCard', compact: true, label: '테마', value: '105개' },
        ],
      },
    },

    // ── EXAMPLES ──
    {
      type: 'examples',
      kicker: 'EXAMPLES',
      sectionTitle: '이런 걸 만들 수 있어요',
      items: [
        { href: '/demo/dashboard/acme', icon: '▦', kicker: '대시보드 · 운영 모니터링', title: 'B2B SaaS 운영 대시보드', desc: '매출·사용자·파이프라인·서비스 헬스' },
        { href: '/demo/dashboard/sales', icon: '▦', kicker: '대시보드 · 매출 분석', title: '월간 매출 인사이트', desc: '제품군별·지역별 매출 추이' },
        { href: '/demo/slide/pitch', icon: '▤', kicker: '슬라이드 · 투자 유치', title: '피치덱', desc: '문제→솔루션→시장→팀→Ask' },
        { href: '/demo/slide/weekly', icon: '▤', kicker: '슬라이드 · 주간보고', title: 'SaaS 주간보고', desc: '영업·CS·개발·AX 4팀 KPI' },
        { href: '/demo/news', icon: '◳', kicker: '카드뉴스 · 교육', title: 'AI 마케팅 가이드', desc: '인스타/링크드인 카드 11장' },
        { href: '/demo/landing/startup', icon: '◐', kicker: '랜딩페이지 · SaaS', title: 'SaaS 도구 랜딩', desc: 'Hero·Steps·Features·Pricing·FAQ' },
        { href: '/demo/dashboard/finance', icon: '▦', kicker: '대시보드 · 투자', title: '투자 포트폴리오', desc: '자산배분·수익률·보유종목' },
        { href: '/demo/slide/strategy', icon: '▤', kicker: '슬라이드 · 전략', title: '내부 전략 발표', desc: 'SWOT·로드맵·플라이휠' },
        { href: '/demo/slide/proposal', icon: '▤', kicker: '슬라이드 · 제안', title: '프로젝트 제안서', desc: 'AI CS 자동화 도입 제안' },
        { href: '/demo/slide/ecommerce', icon: '▤', kicker: '슬라이드 · 이커머스', title: '이커머스 주간보고', desc: '매출·트래픽·재고·CS 운영' },
        { href: '/demo/landing/edtech', icon: '◐', kicker: '랜딩페이지 · 교육', title: '기업교육 플랫폼', desc: '게이미피케이션·후기·가격' },
        { href: '/demo/landing/campaign', icon: '◐', kicker: '랜딩페이지 · 이벤트', title: 'Launch Week', desc: '카운트다운·일정·얼리버드' },
      ],
    },

    // ── FEATURES ──
    {
      type: 'features',
      kicker: 'WHY MAGING',
      sectionTitle: '이런 걸 할 수 있어요',
      cols: 3,
      items: [
        { icon: '↯', title: '빌드 없음', desc: 'script 태그 하나면 끝. 번들러, 프레임워크 불필요.' },
        { icon: '◐', title: '105개 테마', desc: 'Claude, Vercel, Notion, Spotify... 한 줄로 전환.' },
        { icon: '▦', title: '73개 위젯', desc: 'KPI, 차트, 테이블, 타임라인, 맵까지 전부 포함.' },
        { icon: '⬡', title: 'LLM 최적화', desc: 'AI가 생성한 코드가 바로 돌아가도록 설계했습니다.' },
        { icon: '◳', title: '반응형', desc: 'ResizeObserver 기반 자동 리사이즈. 모바일도 OK.' },
        { icon: '⊘', title: 'XSS 방어', desc: '모든 입력을 자동 이스케이프. 안전합니다.' },
      ],
    },

    // ── COMPARISON ──
    {
      type: 'comparison',
      kicker: 'COMPARISON',
      sectionTitle: '기존 도구와 뭐가 다른가요',
      columns: ['maging', 'Recharts', 'Chart.js', 'Tremor'],
      highlight: 0,
      rows: [
        { label: '빌드 불필요', values: [true, false, true, false] },
        { label: 'CDN 한 줄', values: [true, false, true, false] },
        { label: '프레임워크 무관', values: [true, false, true, false] },
        { label: '브랜드 테마', values: ['105개', false, false, false] },
        { label: 'LLM 프롬프트 최적화', values: [true, false, false, false] },
        { label: 'KPI + 차트 + 테이블', values: [true, false, false, true] },
        { label: '한국어 포맷 (억/만)', values: [true, false, false, false] },
        { label: '라이선스', values: ['MIT', 'MIT', 'MIT', 'Apache'] },
      ],
    },

    // ── TESTIMONIALS ──
    {
      type: 'testimonials',
      kicker: '사용 후기',
      sectionTitle: '써본 사람들의 반응',
      cols: 3,
      items: [
        {
          quote: 'Claude한테 "매출 대시보드 만들어줘"라고 했더니 진짜 나왔어요. maging 없었으면 못 했을 듯.',
          name: '프론트엔드 개발자', role: '스타트업', initial: 'F',
        },
        {
          quote: '피치덱 급하게 만들어야 하는데 피그마 열 시간이 없었습니다. HTML 하나로 해결했어요.',
          name: '창업자', role: 'Pre-A', initial: 'C',
        },
        {
          quote: '테마 바꾸는 게 진짜 한 줄이라서 놀랐습니다. 클라이언트마다 브랜드 컬러 맞추기 편해요.',
          name: '프리랜서', role: '에이전시', initial: 'P',
        },
      ],
    },

    // ── FAQ ──
    {
      type: 'faq',
      kicker: 'FAQ',
      sectionTitle: '자주 묻는 질문',
      items: [
        { q: 'React 없이도 되나요?', a: '네. Vanilla JS입니다. React, Vue, Svelte 어디서든 그냥 쓰면 됩니다.' },
        { q: 'ECharts를 꼭 써야 하나요?', a: '차트 위젯을 쓰려면 ECharts 5+가 필요합니다. KPI, 타임라인 같은 HTML 위젯은 ECharts 없이도 동작해요.' },
        { q: '상용으로 써도 되나요?', a: 'MIT 라이선스입니다. 상업적 사용, 수정, 재배포 전부 자유롭습니다.' },
        { q: 'AI가 아니라 직접 코딩해도 되나요?', a: '당연하죠. API 문서 보고 직접 호출하면 됩니다. LLM이 쓰기 쉽게 만들었을 뿐, 사람이 쓰기 어려운 건 아닙니다.' },
        { q: '커스텀 테마 만들 수 있나요?', a: 'CSS 변수 12개만 정의하면 됩니다. maging.core.css를 쓰고 변수만 오버라이드하세요.' },
      ],
    },

    // ── CTA ──
    {
      type: 'cta',
      title: 'AI한테 시켜보세요',
      desc: '"maging으로 매출 대시보드 만들어줘"',
      ctas: [
        { label: 'GitHub', href: 'https://github.com/m1kapp/maging', primary: true },
        { label: 'npm', href: 'https://www.npmjs.com/package/@m1kapp/maging' },
      ],
    },
  ],
};

export default function Home() {
  return <MagingPage config={config} scripts={['/dist/maging-landing.js']} />;
}
