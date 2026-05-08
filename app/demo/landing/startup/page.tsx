import { Metadata } from 'next';
import { MagingPage } from '@/components/MagingPage';

export const metadata: Metadata = {
  title: 'SaaS 랜딩 데모 — maging',
  description: 'maging 랜딩페이지 모드 데모.',
};

const config = {
  mode: 'landing',
  sections: [
    {
      type: 'hero',
      kicker: 'maging',
      title: 'AI한테 대시보드 만들어달라고 하면<br>진짜 나옵니다',
      subtitle: 'ChatGPT, Claude, Gemini가 바로 쓸 수 있는 UI 라이브러리. CDN 한 줄이면 32개 위젯 + 35개 브랜드 테마.',
      ctas: [
        { label: '시작하기', href: '#how', primary: true },
        { label: 'GitHub', href: 'https://github.com/m1kapp/maging' },
      ],
    },
    {
      type: 'logos',
      items: [
        { name: 'ChatGPT' }, { name: 'Claude' }, { name: 'Gemini' },
        { name: 'Copilot' }, { name: 'Cursor' },
      ],
    },
    {
      type: 'steps',
      kicker: 'How it works',
      sectionTitle: '3줄이면 끝납니다',
      steps: [
        { title: 'CDN 두 줄 추가', desc: 'npm도 되지만, CDN이 제일 빠릅니다.', code: '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@m1kapp/maging/dist/maging.css">\n<script src="https://cdn.jsdelivr.net/npm/@m1kapp/maging/dist/maging.js"><\/script>' },
        { title: 'div 하나 + 함수 하나', desc: '위젯 이름과 데이터만 넘기면 됩니다.', code: '<div id="chart"></div>\n<script>\n  Maging.lineChart("#chart", {\n    categories: ["1월","2월","3월"],\n    series: [{ name: "매출", data: [10, 15, 22] }]\n  });\n<\/script>' },
        { title: '테마 변경은 한 줄', desc: '35개 브랜드 테마를 런타임에 즉시 전환할 수 있습니다.', code: 'Maging.setTheme("github");  // vercel, notion, stripe, netflix...' },
      ],
    },
    {
      type: 'features',
      kicker: 'Features',
      sectionTitle: '이런 걸 할 수 있어요',
      cols: 3,
      items: [
        { icon: '↯', title: '빌드 없음', desc: 'script 태그 하나면 끝. 번들러, 프레임워크 불필요.' },
        { icon: '◐', title: '35개 테마', desc: 'Claude, Vercel, Notion, Spotify... 한 줄로 전환.' },
        { icon: '▦', title: '32개 위젯', desc: 'KPI, 차트, 테이블, 타임라인, 맵까지 전부 포함.' },
        { icon: '⬡', title: 'LLM 최적화', desc: 'AI가 생성한 코드가 바로 돌아가도록 설계했습니다.' },
        { icon: '◳', title: '반응형', desc: 'ResizeObserver 기반 자동 리사이즈. 모바일도 OK.' },
        { icon: '⊘', title: 'XSS 방어', desc: '모든 입력을 자동 이스케이프. 안전합니다.' },
      ],
    },
    {
      type: 'comparison',
      kicker: 'Comparison',
      sectionTitle: '기존 도구와 뭐가 다른가요',
      columns: ['maging', 'Recharts', 'Chart.js', 'Tremor'],
      highlight: 0,
      rows: [
        { label: '빌드 불필요', values: [true, false, true, false] },
        { label: 'CDN 한 줄', values: [true, false, true, false] },
        { label: '프레임워크 무관', values: [true, false, true, false] },
        { label: '브랜드 테마', values: ['35개', false, false, false] },
        { label: 'LLM 프롬프트 최적화', values: [true, false, false, false] },
        { label: 'KPI + 차트 + 테이블', values: [true, false, false, true] },
        { label: '한국어 포맷 (억/만)', values: [true, false, false, false] },
        { label: '라이선스', values: ['MIT', 'MIT', 'MIT', 'Apache'] },
      ],
    },
    {
      type: 'testimonials',
      kicker: '사용 후기',
      sectionTitle: '써본 사람들의 반응',
      cols: 3,
      items: [
        { quote: 'Claude한테 "매출 대시보드 만들어줘"라고 했더니 진짜 나왔어요.', name: '프론트엔드 개발자', role: '스타트업', initial: 'F' },
        { quote: '피치덱 급하게 만들어야 하는데 피그마 열 시간이 없었습니다.', name: '창업자', role: 'Pre-A', initial: 'C' },
        { quote: '테마 바꾸는 게 진짜 한 줄이라서 놀랐습니다.', name: '프리랜서', role: '에이전시', initial: 'P' },
      ],
    },
    {
      type: 'faq',
      kicker: 'FAQ',
      sectionTitle: '자주 묻는 질문',
      items: [
        { q: 'React 없이도 되나요?', a: '네. Vanilla JS입니다.' },
        { q: 'ECharts를 꼭 써야 하나요?', a: '차트 위젯을 쓰려면 ECharts 5+가 필요합니다.' },
        { q: '상용으로 써도 되나요?', a: 'MIT 라이선스입니다.' },
        { q: '커스텀 테마 만들 수 있나요?', a: 'CSS 변수 12개만 정의하면 됩니다.' },
      ],
    },
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

export default function StartupPage() {
  return <MagingPage config={config} scripts={['/dist/maging-landing.js']} />;
}
