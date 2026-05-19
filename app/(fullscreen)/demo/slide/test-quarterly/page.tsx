import { Metadata } from 'next';
import { MagingPage } from '@/components/MagingPage';

export const metadata: Metadata = {
  title: '1Q 성과 리뷰 — maging',
  description: '분기 성과 리뷰 슬라이드 테스트',
};

const config = {
  sidebarTitle: '1Q 성과 리뷰',
  sidebarDate: '2026.04 · 1분기',
  slides: [
    {
      id: 'cover', cover: true,
      widgets: [{
        type: 'sectionCover', style: 'classic',
        kicker: 'QUARTERLY REVIEW · 2026 Q1',
        title: '1분기 성과 리뷰',
        subtitle: 'SaaS B/U · 영업·CS·개발 3개 팀 종합',
        brand: 'flow.team',
        meta: '기준일 2026.04.01',
      }],
    },
    {
      id: 'summary', label: '핵심 지표',
      widgets: [{
        type: 'metricHighlight',
        metrics: [
          { value: '41.2', unit: '억원', label: '1Q 매출' },
          { value: '48.9', unit: 'K', label: 'MAU' },
          { value: '2.1', unit: '%', label: '해지율' },
          { value: '74', unit: '', label: 'NPS' },
        ],
      }],
    },
    {
      id: 'revenue', label: '매출', bu: 'SaaS B/U', team: '영업팀',
      widgets: [
        { type: 'pageHeader', title: '1Q 매출 현황', meta: '기준일 2026.04.01' },
        { type: 'kpiCard', label: '1Q 매출 · 목표 45억', value: '41.2<span class="mw-unit"> 억원</span>', valueHTML: true, delta: -8.4, deltaGoodWhen: 'positive' },
        { type: 'kpiCard', label: '3월 매출', value: '15.1<span class="mw-unit"> 억원</span>', valueHTML: true, delta: 12.3, deltaGoodWhen: 'positive' },
        { type: 'kpiCard', label: '신규 계약', value: '127<span class="mw-unit">건</span>', valueHTML: true, delta: 4.1, deltaGoodWhen: 'positive' },
        { type: 'sectionHead', title: '월별 매출 추이' },
        {
          type: 'activityTable',
          columns: [
            { key: 'name', label: '구분', align: 'left' },
            { key: 'm1', label: '1월', align: 'right' },
            { key: 'm2', label: '2월', align: 'right' },
            { key: 'm3', label: '3월', align: 'right' },
            { key: 'total', label: '1Q 합계', align: 'right' },
          ],
          rows: [
            { name: '신규', m1: '9.2억', m2: '8.4억', m3: '10.1억', total: '27.7억' },
            { name: '기존', m1: '4.1억', m2: '4.3억', m3: '5.0억', total: '13.4억' },
          ],
        },
        { type: 'alertBanner', bannerType: 'info', title: '리뷰', message: '1Q 매출 41.2억으로 목표 대비 91.6% 달성. 3월 신규 계약 회복세. 2Q 45억 목표 달성 가능.' },
      ],
    },
    {
      id: 'problem', label: 'Issue',
      widgets: [{
        type: 'problemSlide',
        headline: '2Q에 풀어야 할 **3가지 과제**',
        points: [
          { icon: '📉', title: '기존 고객 이탈', desc: '1Q 해지 47건, 전년 대비 +12건. 온보딩 프로세스 개선 필요.' },
          { icon: '⏱️', title: '영업 사이클 장기화', desc: '평균 계약 소요일 45일→62일. 의사결정 지연 대응 전략 수립.' },
          { icon: '🔧', title: '제품 안정성', desc: '3월 장애 2건(총 4시간). SLA 99.9% 미달. 인프라 투자 우선.' },
        ],
        highlight: '2Q 핵심: **기존 고객 리텐션** 강화 + 영업 사이클 **45일 이내** 복원',
      }],
    },
    {
      id: 'next', label: 'Next Step',
      widgets: [{
        type: 'askSlide',
        headline: '2Q **액션 플랜**',
        useOfFunds: [
          { label: '리텐션 강화', pct: 40 },
          { label: '영업 효율화', pct: 35 },
          { label: '인프라 투자', pct: 25 },
        ],
        milestones: [
          '4월: 해지 위험 고객 30사 EBR 완료',
          '5월: 영업 프로세스 자동화 도입',
          '6월: SLA 99.95% 달성',
        ],
      }],
    },
  ],
};

export default function TestQuarterlyPage() {
  return <MagingPage config={config} fullscreen scripts={['/dist/maging-sidebar.js', '/dist/maging-slide.js']} />;
}
