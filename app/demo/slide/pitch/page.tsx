import { Metadata } from 'next';
import { MagingPage } from '@/components/MagingPage';

export const metadata: Metadata = {
  title: '피치 덱 — maging',
  description: 'maging 슬라이드 모드 데모. 투자 유치용 피치 덱.',
};

const config = {
  mode: 'pitch',
  sidebarTitle: 'maging',
  sidebarDate: 'Series A · 2026',  slides: [
    {
      id: 'cover',
      cover: true,
      widgets: [{
        type: 'pitchCover',
        company: 'maging',
        tagline: 'AI 답변을, 쓸 수 있는 결과물로',
        logo: '◆',
        subtitle: 'Series A · 2026',
        style: 'bold',
      }],
    },
    {
      id: 'problem',
      label: 'Problem',
      widgets: [{
        type: 'problemSlide',
        headline: '기업의 78%가 보고서·대시보드 제작에 주당 8시간 이상 소비합니다',
        points: [
          { icon: '⏱️', title: '반복 개발', desc: '같은 차트·테이블을 매 보고서마다 처음부터 코딩. 개발자 리소스의 30%가 시각화에 소진됩니다.' },
          { icon: '🎨', title: '디자인 파편화', desc: '팀마다 다른 UI 라이브러리, 다른 색상, 다른 레이아웃. 브랜드 일관성 부재.' },
          { icon: '💸', title: '과도한 BI 비용', desc: 'Tableau/PowerBI 라이선스만 연 $50K+. 커스터마이징에 추가 개발 비용.' },
          { icon: '🔄', title: '유지보수 지옥', desc: '데이터 구조 변경 시 수십 개 차트를 수동 업데이트. 기술 부채 누적.' },
        ],
        highlight: '연간 개발자 1인당 320시간이 반복적 시각화 작업에 낭비됩니다',
      }],
    },
    {
      id: 'solution',
      label: 'Solution',
      widgets: [{
        type: 'solutionSlide',
        headline: '프롬프트 한 줄 → 엔터프라이즈급 결과물 즉시 생성',
        before: {
          label: 'Before',
          items: ['2주 개발 사이클', '디자이너 + 개발자 협업 필수', 'BI 도구 라이선스 $50K/yr', '테마 변경 = 전체 리빌드'],
        },
        after: {
          label: 'After · maging',
          items: ['30초 AI 생성', '코드 한 줄도 불필요', 'CDN 무료 · MIT 라이선스', '105개 브랜드 테마 즉시 전환'],
        },
      }],
    },
    {
      id: 'product',
      label: 'Product',
      widgets: [{
        type: 'metricHighlight',
        metrics: [
          { value: '37', unit: '개', label: '위젯 컴포넌트' },
          { value: '4', unit: '개', label: '아웃풋 모드' },
          { value: '105', unit: '개', label: '브랜드 테마' },
          { value: '0', unit: '', label: '빌드 스텝' },
        ],
      }],
    },
    {
      id: 'market',
      label: 'Market',
      widgets: [{
        type: 'marketSlide',
        headline: 'AI Report Generation 시장',
        tam: { value: '$30B', label: 'TAM · 글로벌 BI & 데이터 시각화' },
        sam: { value: '$8B', label: 'SAM · 엔터프라이즈 리포팅 자동화' },
        som: { value: '$500M', label: 'SOM · AI 기반 리포트 생성' },
        insight: 'CAGR 23% (2024-2028)',
        sources: ['Gartner 2025', 'Markets & Markets', 'IDC'],
      }],
    },
    {
      id: 'model',
      label: 'Business Model',
      widgets: [{
        type: 'bizModelSlide',
        headline: '수익 모델 — Land & Expand',
        tiers: [
          { name: 'Open Source', price: '$0', features: ['CDN 무제한', '37개 위젯', '15개 기본 테마', '커뮤니티 지원'] },
          { name: 'Pro', price: '$29', period: '/월', features: ['105개 브랜드 테마', 'PPTX/PDF 내보내기', 'LLM 프롬프트 최적화', '우선 기술 지원'], popular: true },
          { name: 'Enterprise', price: 'Custom', features: ['SSO/SAML', 'SLA 99.9%', '화이트레이블', '전담 CS 매니저', '온프레미스 배포'] },
        ],
        note: '개발자 무료 도입 → 팀 유료 전환 → 기업 계약 확장',
      }],
    },
    {
      id: 'traction',
      label: 'Traction',
      widgets: [{
        type: 'metricHighlight',
        metrics: [
          { value: '2.4K', unit: '', label: 'npm 주간 다운로드' },
          { value: '850', unit: '', label: 'GitHub Stars' },
          { value: '12', unit: '개', label: '파일럿 기업' },
          { value: '94', unit: '%', label: 'NPS Score' },
        ],
      }],
    },
    {
      id: 'competition',
      label: 'Competition',
      widgets: [{
        type: 'competitorMatrix',
        headline: '포지셔닝 — AI 네이티브 × 엔터프라이즈 품질',
        axisX: { label: '커스터마이징 유연성', low: '고정 템플릿', high: '완전 유연' },
        axisY: { label: '생성 속도', low: '수동 개발 (수주)', high: 'AI 즉시 생성' },
        players: [
          { name: 'maging', x: 80, y: 95, highlight: true },
          { name: 'Tableau', x: 85, y: 15 },
          { name: 'Chart.js', x: 40, y: 45 },
          { name: 'Retool', x: 65, y: 35 },
          { name: 'Gamma.app', x: 45, y: 80 },
          { name: 'Beautiful.ai', x: 35, y: 70 },
        ],
      }],
    },
    {
      id: 'roadmap',
      label: 'Roadmap',
      widgets: [{
        type: 'timelineSlide',
        headline: '로드맵',
        milestones: [
          { date: '2025 Q3', title: 'MVP 출시', desc: '대시보드 모드', done: true },
          { date: '2025 Q4', title: '주간보고 모드', desc: 'A4 슬라이드 + PPTX', done: true },
          { date: '2026 Q1', title: '카드뉴스 + 랜딩', desc: '소셜 콘텐츠 확장', done: true },
          { date: '2026 Q2', title: '피치덱 모드', desc: '프레젠테이션', active: true },
          { date: '2026 H2', title: '엔터프라이즈', desc: 'SSO · 감사로그 · i18n' },
        ],
      }],
    },
    {
      id: 'team',
      label: 'Team',
      widgets: [{
        type: 'teamSlide',
        headline: '팀',
        members: [
          { name: '유민호', role: 'Founder & CEO', exp: 'B2B SaaS 10년 · 프로덕트 & 풀스택 엔지니어링' },
        ],
      }],
    },
    {
      id: 'ask',
      label: 'The Ask',
      widgets: [{
        type: 'askSlide',
        headline: 'Series A · ₩30억',
        useOfFunds: [
          { label: '엔지니어링', pct: 50 },
          { label: 'GTM / 세일즈', pct: 30 },
          { label: '운영', pct: 20 },
        ],
        milestones: [
          '12개월 내 ARR ₩10억 달성',
          '엔터프라이즈 고객 30사 확보',
          '글로벌 베타 런칭 (영문 + 일문)',
        ],
        contact: { email: 'hello@m1k.app', website: 'maging.m1k.app' },
      }],
    },
  ],
};

export default function PitchDeckPage() {
  return <MagingPage config={config} fullscreen scripts={['/dist/maging-sidebar.js', '/dist/maging-pitch.js']} />;
}
