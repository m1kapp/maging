import { Metadata } from 'next';
import { MagingPage } from '@/components/MagingPage';

export const metadata: Metadata = {
  title: '금융 카드뉴스 — maging',
  description: 'maging 카드뉴스 모드 데모. 금융 뉴스레터.',
};

const config = {
  mode: 'news',
  brand: '@maging.page',
  cards: [
    {
      id: 'card-cover',
      type: 'coverCard',
      tag: '재테크 가이드',
      title: '2026 재테크\n완전 가이드',
      subtitle: '월급쟁이도 할 수 있는 자산 증식 로드맵',
      style: 'number-hero',
      number: 5,
    },
    {
      id: 'card-stat',
      type: 'statCard',
      label: '가계 금융자산 증가율',
      value: '12.4<span class="mw-unit">%</span>',
      context: '투자 포트폴리오를 갖춘 가구의 연평균 자산 증가율입니다',
    },
    {
      id: 'card-01',
      type: 'stepCard',
      step: '01',
      heading: '비상금 3개월치 확보',
      text: '투자 전 월 생활비의 3~6개월분을 고금리 파킹통장에 분리합니다. 예상치 못한 지출에도 투자금을 건드리지 않는 안전판.',
      tip: '파킹통장 금리 비교 — 토스뱅크 3.5%, 케이뱅크 3.2%',
    },
    {
      id: 'card-02',
      type: 'stepCard',
      step: '02',
      heading: 'ETF로 분산 투자 시작',
      text: '개별 종목 대신 ETF로 시작하세요. 국내 + 해외 + 채권을 6:3:1로 배분하면 변동성을 줄이면서 시장 수익률을 따라갑니다.',
      tip: 'KODEX 200 + TIGER 미국S&P500 + KBSTAR 국고채 조합 추천',
    },
    {
      id: 'card-quote',
      type: 'quoteCard',
      quote: '시장에 있는 시간이\n시장의 타이밍을 이긴다.',
      name: '켄 피셔',
      role: '피셔 인베스트먼츠 창립자',
    },
    {
      id: 'card-03',
      type: 'stepCard',
      step: '03',
      heading: '연금계좌로 세제 혜택 챙기기',
      text: 'IRP + 연금저축펀드에 연 900만원까지 넣으면 최대 148.5만원 세액공제. 장기 복리 효과까지 누리는 이중 이득.',
      tip: '연봉 5,500만원 이하라면 공제율 16.5%로 더 유리',
    },
    {
      id: 'card-compare',
      type: 'comparisonCard',
      heading: '예적금 vs 투자, 10년 후',
      leftLabel: '예적금만',
      rightLabel: '분산 투자',
      left: [
        '월 100만원 × 10년 = 1.2억원',
        '세후 이자 약 1,800만원',
        '총 자산 약 1.38억원',
      ],
      right: [
        '월 100만원 × 10년 = 1.2억원',
        '연 7% 복리 수익 약 5,300만원',
        '총 자산 약 1.73억원',
      ],
    },
    {
      id: 'card-data',
      type: 'dataCard',
      label: '10년 연평균 수익률',
      title: '자산별 수익률 비교',
      widget: 'barChart',
      widgetConfig: {
        items: [
          { label: 'S&P 500', value: 10.2 },
          { label: '국내 주식', value: 6.8 },
          { label: '부동산 리츠', value: 5.4 },
          { label: '채권', value: 3.1 },
          { label: '예금', value: 2.3 },
        ],
        showLabels: true,
      },
    },
    {
      id: 'card-checklist',
      type: 'checklistCard',
      heading: '투자 시작 전 체크리스트',
      items: [
        { text: '비상금 3개월치 이상 확보', done: true },
        { text: '고금리 대출 우선 상환 완료', done: true },
        { text: '투자 목표 & 기간 설정', done: false },
        { text: '증권사 계좌 + 연금계좌 개설', done: false },
        { text: '자동이체로 월 정기 투자 설정', done: false },
      ],
    },
    {
      id: 'card-review',
      type: 'testimonialCard',
      quote: 'ETF 자동투자 2년 차, 수익률 18%. 예금만 하던 과거가 아깝습니다.',
      name: '김도현',
      role: '직장인, 32세',
      stars: 5,
    },
    {
      id: 'card-cta',
      type: 'ctaCard',
      heading: '오늘부터\n재테크 시작하기',
      subtext: '팔로우하고 매주 투자 인사이트를 받아보세요',
      ctas: [{ label: '팔로우하기', primary: true }],
      handles: [
        { platform: 'Instagram', handle: '@maging.page' },
        { platform: 'LinkedIn', handle: 'maging' },
      ],
    },
  ],
};

export default function FinanceNewsPage() {
  return <MagingPage config={config} fullscreen scripts={['/dist/maging-news.js']} />;
}
