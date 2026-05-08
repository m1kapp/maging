import { Metadata } from 'next';
import { MagingPage } from '@/components/MagingPage';

export const metadata: Metadata = {
  title: '카드뉴스 — maging',
  description: 'maging 카드뉴스 모드 데모.',
};

const config = {
  mode: 'news',
  brand: '@maging.page',
  cards: [
    {
      id: 'card-cover',
      type: 'coverCard',
      icon: '🎯',
      tag: 'AI 마케팅 가이드',
      title: 'AI 마케팅\n실전 도입법',
      subtitle: '지금 바로 적용할 수 있는 실무 가이드',
      style: 'gradient',
    },
    {
      id: 'card-stat',
      type: 'statCard',
      label: 'GLOBAL ADOPTION',
      value: '73<span class="mw-unit">%</span>',
      context: '글로벌 기업의 73%가 이미 AI 마케팅을 도입했습니다',
    },
    {
      id: 'card-01',
      type: 'stepCard',
      step: '01',
      heading: '고객 세그먼트 분석',
      text: '기존 고객 데이터에서 행동 패턴을 추출하고 클러스터링합니다. AI가 수천 개의 변수를 분석해 최적 세그먼트를 찾아줍니다.',
      tip: '최소 3개월 이상의 데이터로 시작하세요',
    },
    {
      id: 'card-02',
      type: 'stepCard',
      step: '02',
      heading: '개인화 콘텐츠 자동 생성',
      text: '세그먼트별 맞춤 메시지를 AI가 실시간으로 생성합니다. 이메일, 푸시, 광고 카피까지 한 번에.',
      tip: 'A/B 테스트도 AI가 자동으로 최적화합니다',
    },
    {
      id: 'card-quote',
      type: 'quoteCard',
      quote: '마케팅의 미래는 AI가 만들고\n사람이 방향을 잡는 것이다.',
      name: '필립 코틀러',
      role: '마케팅의 아버지',
    },
    {
      id: 'card-compare',
      type: 'comparisonCard',
      heading: 'AI 마케팅 Do & Don\'t',
      leftLabel: 'Don\'t',
      rightLabel: 'Do',
      left: [
        '감에 의존한 타겟팅',
        '일괄 메시지 발송',
        '수동 A/B 테스트',
      ],
      right: [
        '데이터 기반 세그먼트',
        '개인화 콘텐츠',
        'AI 자동 최적화',
      ],
    },
    {
      id: 'card-data',
      type: 'dataCard',
      label: 'ROI IMPACT',
      title: 'AI 마케팅 도입 효과',
      widget: 'barChart',
      widgetConfig: {
        items: [
          { label: '콘텐츠 생산성', value: 340 },
          { label: 'CAC 절감', value: 42 },
          { label: '전환율 상승', value: 28 },
          { label: 'LTV 증가', value: 35 },
        ],
        showLabels: true,
      },
    },
    {
      id: 'card-step',
      type: 'stepCard',
      step: '03',
      heading: '성과 측정 & 최적화',
      text: 'AI가 실시간으로 캠페인 성과를 분석하고, 예산 배분부터 메시지 튜닝까지 자동으로 최적화합니다.',
      tip: '주간 리뷰로 AI 추천 vs 실제 성과를 비교하세요',
    },
    {
      id: 'card-checklist',
      type: 'checklistCard',
      heading: '도입 전 체크리스트 ✓',
      items: [
        { text: '고객 데이터 3개월 이상 확보', done: true },
        { text: '핵심 KPI 3개 이내로 설정', done: true },
        { text: 'AI 도구 비교·선정 완료', done: false },
        { text: '파일럿 캠페인 1개 설계', done: false },
        { text: '성과 측정 대시보드 구축', done: false },
      ],
    },
    {
      id: 'card-review',
      type: 'testimonialCard',
      quote: '도입 3개월 만에 마케팅 비용 40% 절감, 전환율은 2배 상승했습니다.',
      name: '이수진',
      role: '마케팅 팀장, ABC Corp',
      stars: 5,
    },
    {
      id: 'card-cta',
      type: 'ctaCard',
      heading: '우리 팀도\nAI 마케팅 시작하기',
      subtext: '팔로우하고 매주 실전 가이드를 받아보세요',
      ctas: [{ label: '팔로우하기', primary: true }],
      handles: [
        { platform: 'Instagram', handle: '@maging.page' },
        { platform: 'LinkedIn', handle: 'maging' },
      ],
    },
  ],
};

export default function CardNewsPage() {
  return <MagingPage config={config} fullscreen scripts={['/dist/maging-news.js']} />;
}
