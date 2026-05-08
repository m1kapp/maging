import { Metadata } from 'next';
import { MagingPage } from '@/components/MagingPage';

export const metadata: Metadata = {
  title: 'ACME KOREA 운영 대시보드 — maging',
  description: 'maging 대시보드 모드 데모. 운영 모니터링 SaaS 스타일.',
};

const config = {
  title: 'ACME KOREA — 통합 운영 대시보드',
  subtitle: 'SaaS B/U · 2026 Q2',
  sections: [
    {
      title: '핵심 지표',
      kicker: 'AT A GLANCE',
      rows: [
        {
          layout: '2:1',
          height: 'tall',
          widgets: [
            {
              type: 'heroTile',
              kicker: 'Q2 2026',
              value: '128억',
              tagline: '전월 대비 8.3% 성장 — 분기 목표의 85% 달성. 12개월 연속 상승세를 이어가고 있습니다.',
              stats: [
                { label: '신규 계약', value: '127건' },
                { label: '평균 거래액', value: '4,500만' },
                { label: '활성 고객', value: '48,291명' },
                { label: 'NPS', value: '68점' },
              ],
            },
            {
              type: 'ringProgress',
              title: '분기 목표',
              subtitle: 'Q2 2026',
              value: 82,
              max: 100,
              unit: '%',
              label: '달성률',
              context: '₩128억 / 목표 150억',
              thresholds: [[0.5, 'danger'], [0.8, 'warning'], [1.0, 'good']],
            },
          ],
        },
        {
          layout: '4col',
          height: 'tile',
          widgets: [
            { type: 'kpi', label: '이번 달 매출', value: '128억', delta: 8.3, sparkline: [420, 445, 430, 468, 475, 490, 510, 505, 530, 548, 562, 580] },
            { type: 'kpi', label: '활성 사용자 (MAU)', value: '42,180', delta: 5.1, sparkline: [38200, 38900, 39100, 39700, 40200, 40400, 40800, 41100, 41400, 41600, 41900, 42180] },
            { type: 'kpi', label: '신규 계약', value: '127건', delta: -2.3, sparkline: [22, 28, 19, 31, 25, 29, 34, 21, 26, 30, 24, 27] },
            { type: 'kpi', label: '평균 응답시간', value: '1.4초', delta: -12.0, deltaGoodWhen: 'negative', sparkline: [1.8, 1.75, 1.9, 1.7, 1.65, 1.55, 1.5, 1.48, 1.45, 1.42, 1.4, 1.4] },
          ],
        },
      ],
    },
    {
      title: '매출 분석',
      kicker: 'TRENDS & MIX',
      rows: [
        {
          layout: '2col',
          height: 'card',
          widgets: [
            {
              type: 'line',
              title: '주간 매출 추이',
              subtitle: '최근 12주 · 부문별',
              categories: ['W01', 'W02', 'W03', 'W04', 'W05', 'W06', 'W07', 'W08', 'W09', 'W10', 'W11', 'W12'],
              series: [
                { name: 'Enterprise', data: [42, 44.5, 43, 46.8, 47.5, 49, 51, 50.5, 53, 54.8, 56.2, 58] },
                { name: 'SMB', data: [16, 17, 16.5, 17.5, 18, 18.8, 19.5, 20, 21, 22, 22.8, 24] },
              ],
              stack: true,
            },
            {
              type: 'bar',
              title: '지역별 매출',
              subtitle: '이번 분기 기준',
              items: [
                { label: '서울', value: 125 },
                { label: '경기', value: 98 },
                { label: '부산', value: 72 },
                { label: '인천', value: 54 },
                { label: '대구', value: 41 },
                { label: '대전', value: 32 },
                { label: '광주', value: 27 },
              ],
              horizontal: true,
            },
          ],
        },
        {
          layout: '3col',
          height: 'card',
          widgets: [
            {
              type: 'funnel',
              title: '영업 파이프라인',
              subtitle: '단계별 잠재 거래',
              stages: [
                { label: '리드', value: 2400 },
                { label: '검증', value: 1380 },
                { label: '데모', value: 820 },
                { label: '제안', value: 410 },
                { label: '성약', value: 127 },
              ],
              valueSuffix: '건',
            },
            {
              type: 'donut',
              title: '제품 카테고리',
              subtitle: '이번 달 판매 비중',
              slices: [
                { label: 'Enterprise', value: 548 },
                { label: 'Professional', value: 312 },
                { label: 'Team', value: 178 },
                { label: 'Starter', value: 84 },
              ],
              centerLabel: '전체 판매',
              centerValue: '1,122건',
            },
            {
              type: 'leaderboard',
              title: '영업 TOP 5',
              subtitle: '분기 목표 달성률',
              items: [
                { name: '김지훈', percent: 98, meta: '98% · 2.45억' },
                { name: '이수민', percent: 94, meta: '94% · 2.20억' },
                { name: '정하늘', percent: 87, meta: '87% · 1.98억' },
                { name: '박민재', percent: 82, meta: '82% · 1.75억' },
                { name: '최유리', percent: 76, meta: '76% · 1.48억' },
              ],
            },
          ],
        },
      ],
    },
    {
      title: '시스템 상태',
      kicker: 'SYSTEM HEALTH',
      rows: [
        {
          layout: '3col',
          height: 'gauge',
          widgets: [
            { type: 'gauge', title: 'CPU', label: '서버 평균', value: 42, max: 100, unit: '%', thresholds: [[0.5, 'good'], [0.8, 'warning'], [1.0, 'danger']] },
            { type: 'gauge', title: 'MEMORY', label: '힙 사용률', value: 68, max: 100, unit: '%', thresholds: [[0.5, 'good'], [0.85, 'warning'], [1.0, 'danger']] },
            { type: 'gauge', title: 'LATENCY', label: 'p95', value: 142, max: 500, unit: 'ms', thresholds: [[0.4, 'good'], [0.7, 'warning'], [1.0, 'danger']] },
          ],
        },
        {
          layout: '2:1',
          height: 'card',
          widgets: [
            {
              type: 'status',
              title: '서비스 헬스',
              subtitle: '전체 시스템 상태',
              columns: 3,
              items: [
                { label: 'API Gateway', status: 'ok', value: '142ms' },
                { label: 'Database', status: 'ok', value: '18ms' },
                { label: 'Payment', status: 'warning', value: '지연' },
                { label: 'Analytics', status: 'danger', value: '지연 8분' },
                { label: 'Auth', status: 'ok', value: '12ms' },
                { label: 'CDN', status: 'ok', value: '8ms' },
              ],
            },
            {
              type: 'timeline',
              title: '최근 활동',
              subtitle: '실시간 이벤트',
              items: [
                { time: '10:23', text: '김지훈님 거래 성약 4,500만', type: 'success' },
                { time: '10:15', text: '서버 #3 재시작 완료', type: 'info' },
                { time: '09:30', text: '재고 알림: Enterprise 임계치', type: 'warning' },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default function AcmePage() {
  return <MagingPage config={config} />;
}
