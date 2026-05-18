import { Metadata } from 'next';
import { MagingPage } from '@/components/MagingPage';

export const metadata: Metadata = {
  title: '이커머스 보고서 — maging',
  description: 'maging 슬라이드 모드 데모. 이커머스 운영 보고서.',
};

const config = {
  sidebarTitle: '이커머스 주간보고',
  sidebarDate: '2026.04.27 · 4월 4주차',  slides: [
    {
      id: 'cover',
      cover: true,
      widgets: [{
        type: 'sectionCover',
        style: 'classic',
        kicker: 'WEEKLY REPORT · 2026년 4월 4주차',
        title: '이커머스 마케팅\n주간보고',
        subtitle: '마케팅본부 · 퍼포먼스 마케팅팀 · 브랜드 마케팅팀 · CRM팀',
        brand: 'ACME STORE',
        meta: '기준일 2026.04.27(월)',
      }],
    },
    {
      id: 'revenue-kpi',
      label: 'GMV & 매출 현황',
      bu: '마케팅본부',
      team: '퍼포먼스 마케팅팀',
      widgets: [
        { type: 'pageHeader', kicker: '01 · REVENUE', title: 'GMV & 매출 현황' },
        { type: 'kpiCard', label: '주간 GMV', value: '18.4<span class="mw-unit">억원</span>', valueHTML: true, delta: 12.3, sparkline: [14.2, 15.1, 15.8, 16.4, 17.1, 18.4] },
        { type: 'kpiCard', label: '주문 건수', value: '4,281<span class="mw-unit">건</span>', valueHTML: true, delta: 8.7, sparkline: [3420, 3580, 3710, 3890, 4050, 4281] },
        { type: 'kpiCard', label: '객단가', value: '42,900<span class="mw-unit">원</span>', valueHTML: true, delta: 3.2, sparkline: [38500, 39200, 40100, 41300, 41800, 42900] },
        { type: 'kpiCard', label: 'ROAS', value: '340<span class="mw-unit">%</span>', valueHTML: true, delta: 15, sparkline: [280, 290, 310, 315, 328, 340] },
        { type: 'sectionHead', index: '01', title: '주간 GMV 추이 (최근 8주)' },
        {
          type: 'barChart',
          items: [
            { label: '3/2주', value: 1280000000 },
            { label: '3/3주', value: 1420000000 },
            { label: '3/4주', value: 1510000000 },
            { label: '4/1주', value: 1580000000 },
            { label: '4/2주', value: 1640000000 },
            { label: '4/3주', value: 1710000000 },
            { label: '4/4주', value: 1840000000 },
          ],
          showLabels: true,
        },
        {
          type: 'insightCard',
          status: 'green',
          title: '주간 리뷰',
          bullets: [
            '봄 시즌 프로모션 효과로 GMV 전주 대비 7.6% 상승',
            '객단가 상승은 프리미엄 라인 확대 전략 효과',
            '다음 주 5월 가정의 달 캠페인 본격 집행 예정',
          ],
        },
      ],
    },
    {
      id: 'channel',
      label: '채널별 매출 분석',
      bu: '마케팅본부',
      team: '퍼포먼스 마케팅팀',
      widgets: [
        { type: 'pageHeader', kicker: '02 · CHANNEL', title: '채널별 매출 분석' },
        { type: 'kpiCard', label: '자사몰', value: '8.2<span class="mw-unit">억원</span>', valueHTML: true, delta: 15.2 },
        { type: 'kpiCard', label: '네이버', value: '5.1<span class="mw-unit">억원</span>', valueHTML: true, delta: 8.4 },
        { type: 'kpiCard', label: '쿠팡', value: '3.8<span class="mw-unit">억원</span>', valueHTML: true, delta: 11.1 },
        { type: 'kpiCard', label: '기타 채널', value: '1.3<span class="mw-unit">억원</span>', valueHTML: true, delta: -2.8 },
        { type: 'sectionHead', index: '01', title: '채널별 주요 지표 상세' },
        {
          type: 'activityTable',
          columns: [
            { key: 'channel', label: '채널', align: 'left' },
            { key: 'gmv', label: 'GMV', align: 'right' },
            { key: 'orders', label: '주문수', align: 'right' },
            { key: 'aov', label: '객단가', align: 'right' },
            { key: 'roas', label: 'ROAS', align: 'right' },
            { key: 'delta', label: '전주비', align: 'right' },
          ],
          rows: [
            { channel: '자사몰 (D2C)', gmv: 820000000, orders: 1580, aov: 51900, roas: 420, delta: 15.2 },
            { channel: '네이버 스마트스토어', gmv: 510000000, orders: 1280, aov: 39800, roas: 310, delta: 8.4 },
            { channel: '쿠팡 로켓그로스', gmv: 380000000, orders: 1020, aov: 37300, roas: 280, delta: 11.1 },
            { channel: '카카오 선물하기', gmv: 80000000, orders: 241, aov: 33200, roas: 190, delta: -5.2 },
            { channel: 'SSG / 11번가', gmv: 50000000, orders: 160, aov: 31300, roas: 150, delta: -8.1 },
          ],
        },
      ],
    },
    {
      id: 'campaign',
      label: '캠페인 성과',
      bu: '마케팅본부',
      team: '브랜드 마케팅팀',
      widgets: [
        { type: 'pageHeader', kicker: '03 · CAMPAIGN', title: '캠페인 성과' },
        { type: 'kpiCard', label: '총 광고비', value: '5,400<span class="mw-unit">만원</span>', valueHTML: true, delta: 3.2 },
        { type: 'kpiCard', label: '전환수', value: '1,842<span class="mw-unit">건</span>', valueHTML: true, delta: 18.5 },
        { type: 'kpiCard', label: 'CPA', value: '29,300<span class="mw-unit">원</span>', valueHTML: true, delta: -12.8, deltaGoodWhen: 'negative' },
        { type: 'sectionHead', index: '01', title: '캠페인별 상세 성과' },
        {
          type: 'activityTable',
          columns: [
            { key: 'name', label: '캠페인', align: 'left' },
            { key: 'spend', label: '광고비', align: 'right' },
            { key: 'impressions', label: '노출', align: 'right' },
            { key: 'clicks', label: '클릭', align: 'right' },
            { key: 'ctr', label: 'CTR', align: 'right' },
            { key: 'conv', label: '전환', align: 'right' },
            { key: 'roas', label: 'ROAS', align: 'right' },
          ],
          rows: [
            { name: '봄 시즌 기획전', spend: 18000000, impressions: 4200000, clicks: 84000, ctr: '2.0%', conv: 672, roas: '480%' },
            { name: 'Meta 리타겟팅', spend: 12000000, impressions: 2800000, clicks: 56000, ctr: '2.0%', conv: 504, roas: '380%' },
            { name: '네이버 브랜드검색', spend: 8000000, impressions: 1500000, clicks: 45000, ctr: '3.0%', conv: 360, roas: '340%' },
            { name: '카카오 비즈보드', spend: 6000000, impressions: 1800000, clicks: 25200, ctr: '1.4%', conv: 176, roas: '210%' },
            { name: '유튜브 브랜딩', spend: 10000000, impressions: 3200000, clicks: 32000, ctr: '1.0%', conv: 130, roas: '160%' },
          ],
        },
        {
          type: 'insightCard',
          status: 'yellow',
          title: '캠페인 리뷰',
          bullets: [
            'Meta 리타겟팅 ROAS 380% — 핵심 수익 채널로 유지',
            '유튜브 브랜딩 ROAS 160% — 브랜드 인지도 기여이나 효율 개선 필요',
            '5월 캠페인: 가정의 달 기획전 + 인플루언서 콜라보 준비 중',
          ],
        },
      ],
    },
    {
      id: 'customer',
      label: '고객 & 재구매 분석',
      bu: '마케팅본부',
      team: 'CRM팀',
      widgets: [
        { type: 'pageHeader', kicker: '04 · CUSTOMER', title: '고객 & 재구매 분석' },
        { type: 'kpiCard', label: '신규 고객', value: '1,240<span class="mw-unit">명</span>', valueHTML: true, delta: 14.2, sparkline: [820, 910, 980, 1050, 1120, 1240] },
        { type: 'kpiCard', label: '재구매율', value: '38.4<span class="mw-unit">%</span>', valueHTML: true, delta: 2.1, sparkline: [32.1, 33.5, 34.8, 36.0, 37.2, 38.4] },
        { type: 'kpiCard', label: 'LTV (6개월)', value: '127,000<span class="mw-unit">원</span>', valueHTML: true, delta: 8.3, sparkline: [98000, 104000, 110000, 115000, 121000, 127000] },
        { type: 'kpiCard', label: '이탈률', value: '4.2<span class="mw-unit">%</span>', valueHTML: true, delta: -1.8, deltaGoodWhen: 'negative', sparkline: [6.8, 6.2, 5.5, 5.1, 4.8, 4.2] },
        { type: 'sectionHead', index: '01', title: '고객 세그먼트 & 전환 퍼널' },
        {
          type: 'donutChart',
          title: '고객 등급 분포',
          slices: [
            { label: 'VIP (5회+)', value: 12 },
            { label: '단골 (3~4회)', value: 18 },
            { label: '재구매 (2회)', value: 22 },
            { label: '신규 (1회)', value: 48 },
          ],
          centerLabel: '전체',
        },
        {
          type: 'funnelChart',
          title: '구매 전환 퍼널',
          stages: [
            { label: '사이트 방문', value: 128000 },
            { label: '상품 조회', value: 64000 },
            { label: '장바구니', value: 12800 },
            { label: '결제 시작', value: 6400 },
            { label: '구매 완료', value: 4281 },
          ],
        },
        {
          type: 'insightCard',
          status: 'green',
          title: '고객 분석 리뷰',
          bullets: [
            '재구매율 38.4%로 전분기 대비 6.3%p 상승 — CRM 자동화 효과',
            'VIP 고객 객단가 일반 대비 3.2배, 충성 프로그램 확대 검토',
            '장바구니→결제 전환율 50% — 간편결제 도입 후 개선세',
          ],
        },
      ],
    },
  ],
};

export default function EcommercePage() {
  return <MagingPage config={config} fullscreen scripts={['/dist/maging-sidebar.js', '/dist/maging-weekly.js']} />;
}
