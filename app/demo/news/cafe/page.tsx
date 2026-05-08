import { Metadata } from 'next';
import { MagingPage } from '@/components/MagingPage';

export const metadata: Metadata = {
  title: '카페 카드뉴스 — maging',
  description: 'maging 카드뉴스 모드 데모. 카페 뉴스레터.',
};

const config = {
  mode: 'news',
  brand: '@cafe.guide',
  cards: [
    {
      id: 'card-cover',
      type: 'coverCard',
      icon: '☕',
      tag: '카페 창업',
      title: '나만의 카페\n시작하기',
      subtitle: '예비 창업자를 위한 실전 가이드',
      style: 'framed',
    },
    {
      id: 'card-stat',
      type: 'statCard',
      label: '카페 평균 월 매출',
      value: '2,400<span class="mw-unit">만원</span>',
      context: '소규모 카페(20평 이하) 기준, 2025년 자영업 통계',
    },
    {
      id: 'card-step1',
      type: 'stepCard',
      step: '01',
      heading: '입지 분석이 전부다',
      text: '유동인구, 주변 카페 수, 임대료 대비 매출 예측. 최소 3곳 이상 후보지를 비교 분석하세요.',
      tip: '배달 매출 비중도 함께 고려하세요',
    },
    {
      id: 'card-step2',
      type: 'stepCard',
      step: '02',
      heading: '인테리어는 컨셉이다',
      text: '예산의 40%를 인테리어에 투자하되, 과하지 않게. SNS 사진이 잘 나오는 1~2개 포인트면 충분합니다.',
      tip: '조명 > 가구 > 소품 순서로 투자하세요',
    },
    {
      id: 'card-step3',
      type: 'stepCard',
      step: '03',
      heading: '시그니처 메뉴 1개',
      text: '"여기 뭐가 맛있어?" 질문에 바로 답할 수 있는 메뉴 1개. 이것만으로 재방문율이 2배 차이납니다.',
      tip: '원가율 30% 이하로 설계하세요',
    },
    {
      id: 'card-compare',
      type: 'comparisonCard',
      heading: '프랜차이즈 vs 개인 카페',
      leftLabel: '프랜차이즈',
      rightLabel: '개인 카페',
      left: [
        '초기 비용 1.5~3억',
        '매뉴얼 운영',
        '브랜드 인지도',
        '로열티 매달 지출',
      ],
      right: [
        '초기 비용 5천~1.5억',
        '자유로운 운영',
        '차별화 가능',
        '수익 100% 본인',
      ],
    },
    {
      id: 'card-data',
      type: 'dataCard',
      label: 'COST BREAKDOWN',
      title: '창업 비용 구성',
      widget: 'donutChart',
      widgetConfig: {
        slices: [
          { label: '인테리어', value: 40 },
          { label: '장비/기기', value: 25 },
          { label: '보증금', value: 20 },
          { label: '초기 재료', value: 10 },
          { label: '기타', value: 5 },
        ],
        centerLabel: '비용',
      },
    },
    {
      id: 'card-checklist',
      type: 'checklistCard',
      heading: '오픈 전 체크리스트',
      items: [
        { text: '사업자 등록 + 영업 신고', done: true },
        { text: '위생 교육 이수', done: true },
        { text: '인테리어 시공 완료', done: true },
        { text: '장비 설치 + 테스트', done: false },
        { text: '메뉴 최종 확정 + 원가 계산', done: false },
        { text: '시범 운영 (소프트 오픈)', done: false },
      ],
    },
    {
      id: 'card-review',
      type: 'testimonialCard',
      quote: '6개월 준비 끝에 오픈했는데, 입지 분석에 가장 많은 시간을 쓴 게 결국 가장 큰 성공 요인이었어요.',
      name: '박지우',
      role: '연남동 카페 사장님 · 오픈 2년차',
      stars: 5,
    },
    {
      id: 'card-cta',
      type: 'ctaCard',
      heading: '카페 창업,\n더 알아보고 싶다면?',
      subtext: '팔로우하고 매주 창업 인사이트를 받아보세요',
      ctas: [{ label: '팔로우하기', primary: true }],
      handles: [
        { platform: 'Instagram', handle: '@cafe.guide' },
      ],
    },
  ],
};

export default function CafeNewsPage() {
  return <MagingPage config={config} fullscreen scripts={['/dist/maging-news.js']} />;
}
