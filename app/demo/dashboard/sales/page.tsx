import { Metadata } from 'next';
import { MagingPage } from '@/components/MagingPage';

export const metadata: Metadata = {
  title: '월간 매출 인사이트 대시보드 — maging',
  description: '2025-2026 전체/제품군별 매출 추이 대시보드 데모.',
};

/* ── raw data ─────────────────────────────────────────── */

const months = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

const overallActual2025 = [
  4377800000, 3366300000, 3623800000, 6880000000,
  5144500000, 3486800000, 4834300000, 4870500000,
  4455000000, 3111700000, 3944500000, 3303700000,
];

const overallPlan2026 = [
  4833700000, 4145600000, 3732900000, 5030400000,
  3662700000, 5460400000, 5250400000, 4070800000,
  5004300000, 6197400000, 4726900000, 4921000000,
];

const overallActual2026 = [
  5032600000, 3987400000, null, null, null, null,
  null, null, null, null, null, null,
];

const pg1_2025 = [
  3950800000, 3230300000, 3214200000, 3030600000,
  3279300000, 3022000000, 2896300000, 2399400000,
  4061600000, 2760100000, 2251100000, 3433500000,
];
const pg1_2026 = [
  3270500000, 3121600000, null, null, null, null,
  null, null, null, null, null, null,
];

const pg2_2025 = [
  403900000, 486900000, 1183100000, 1709600000,
  956800000, 1109600000, 724900000, 1217500000,
  1224300000, 438000000, 300900000, 329200000,
];
const pg2_2026 = [
  699900000, 337700000, null, null, null, null,
  null, null, null, null, null, null,
];

const pg3_2026 = [
  9361000, 7078000, null, null, null, null,
  null, null, null, null, null, null,
];

const pg4_2026 = [
  23140000, 43540000, null, null, null, null,
  null, null, null, null, null, null,
];

const export2025 = [
  28690000, 1137000, 49300000, 32940000,
  24280000, 67700000, 17510000, 38390000,
  0, 51670000, 34080000, 95540000,
];

const exportPlan2026 = [
  36310000, 78670000, 140500000, 60140000,
  67160000, 127100000, 102800000, 78620000,
  105560000, 101100000, 105010000, 76260000,
];

/* ── derived values ───────────────────────────────────── */

const sum = (arr: (number | null)[]) => arr.reduce<number>((acc, v) => acc + (v || 0), 0);

const latestMonthIndex = overallActual2026.findLastIndex(v => v !== null);
const latestMonthLabel = months[latestMonthIndex];

const latestActual = overallActual2026[latestMonthIndex]!;
const latestPlan = overallPlan2026[latestMonthIndex];
const prevYearSameMonth = overallActual2025[latestMonthIndex];

const yoy = ((latestActual - prevYearSameMonth) / prevYearSameMonth) * 100;
const planRate = (latestActual / latestPlan) * 100;

const ytdActual2026 = sum(overallActual2026);
const ytdPlan2026 = sum(overallPlan2026.slice(0, latestMonthIndex + 1));
const ytdRate = (ytdActual2026 / ytdPlan2026) * 100;

const latestPg1 = pg1_2026[latestMonthIndex] ?? 0;
const latestPg2 = pg2_2026[latestMonthIndex] ?? 0;
const latestPg3 = pg3_2026[latestMonthIndex] ?? 0;
const latestPg4 = pg4_2026[latestMonthIndex] ?? 0;
const latestOther = Math.max(latestActual - (latestPg1 + latestPg2 + latestPg3 + latestPg4), 0);

const latestExportPlan = exportPlan2026[latestMonthIndex];
const exportPlanShare = (latestExportPlan / latestPlan) * 100;

const krw = (v: number) => {
  if (v >= 1e8) return (v / 1e8).toFixed(1) + '억';
  if (v >= 1e4) return (v / 1e4).toFixed(0) + '만';
  return v.toLocaleString();
};

const ytdSum = (arr: (number | null)[]) => arr.slice(0, latestMonthIndex + 1).reduce<number>((s, v) => s + (v || 0), 0);

/* ── page config ──────────────────────────────────────── */

const config = {
  title: '월간 매출 인사이트',
  subtitle: '2025-2026 전체/제품군별 매출 추이',
  meta: `기준: ${latestMonthLabel}`,
  kicker: 'SALES DASHBOARD',
  alert: {
    type: 'info',
    title: `${latestMonthLabel} 매출 현황`,
    message: `${latestMonthLabel} 전체 매출은 ${krw(latestActual)} 수준으로 전년 동월 대비 ${yoy.toFixed(1)}% 변화했습니다. 계획 대비 달성률은 ${planRate.toFixed(1)}%입니다.`,
    icon: '◆',
  },
  sections: [
    {
      rows: [
        {
          layout: '4col',
          height: 'tile',
          widgets: [
            {
              type: 'kpi', label: `${latestMonthLabel} 전체 매출`,
              value: krw(latestActual), delta: +yoy.toFixed(1),
              icon: '₩',
              sparkline: overallActual2026.map(v => v || 0),
            },
            {
              type: 'kpi', label: '2026 YTD 매출',
              value: krw(ytdActual2026), delta: +(ytdRate - 100).toFixed(1),
              icon: '▲',
              sparkline: overallActual2026.slice(0, latestMonthIndex + 1).map(v => v || 0),
            },
            {
              type: 'kpi', label: `${latestMonthLabel} 계획 달성률`,
              value: planRate.toFixed(1) + '%', delta: +(planRate - 100).toFixed(1),
              icon: '◎',
              sparkline: overallPlan2026.map((p, i) => {
                const a = overallActual2026[i];
                return p && a ? (a / p) * 100 : 0;
              }),
            },
            {
              type: 'kpi', label: `${latestMonthLabel} 수출 비중(계획)`,
              value: exportPlanShare.toFixed(1) + '%',
              delta: 0,
              icon: '⊕',
              sparkline: exportPlan2026.map((v, i) => {
                const p = overallPlan2026[i];
                return p ? (v / p) * 100 : 0;
              }),
            },
          ],
        },
      ],
    },
    {
      title: '전체 매출 추이 및 제품군 비중',
      kicker: 'OVERVIEW',
      rows: [
        {
          layout: '2:1',
          height: 'card',
          widgets: [
            {
              type: 'metric',
              label: '전체 월별 매출',
              value: krw(latestActual),
              delta: +yoy.toFixed(1),
              icon: '▼',
              context: '2025 실적 vs 2026 실적·계획',
              categories: months,
              series: [
                { name: '2026 실적', data: overallActual2026 },
                { name: '2025 실적', data: overallActual2025 },
              ],
              target: latestPlan,
            },
            {
              type: 'donut',
              title: `${latestMonthLabel} 제품군별 매출 비중`,
              subtitle: '2026 기준',
              slices: [
                { label: '제품군1', value: latestPg1 },
                { label: '제품군2', value: latestPg2 },
                { label: '제품군3', value: latestPg3 },
                { label: '제품군4', value: latestPg4 },
                { label: '기타/미분류', value: latestOther },
              ],
              centerLabel: '합계',
              centerValue: krw(latestActual),
            },
          ],
        },
      ],
    },
    {
      title: '제품군별 매출 분석',
      kicker: 'SEGMENT',
      rows: [
        {
          layout: '2col',
          height: 'card',
          widgets: [
            {
              type: 'line',
              title: '제품군1 월별 매출',
              subtitle: '2025 vs 2026',
              categories: months,
              series: [
                { name: '2025', data: pg1_2025 },
                { name: '2026', data: pg1_2026 },
              ],
              area: false,
            },
            {
              type: 'line',
              title: '제품군2 월별 매출',
              subtitle: '2025 vs 2026',
              categories: months,
              series: [
                { name: '2025', data: pg2_2025 },
                { name: '2026', data: pg2_2026 },
              ],
              area: false,
            },
          ],
        },
        {
          layout: '2:1',
          height: 'card',
          widgets: [
            {
              type: 'bar',
              title: `제품군별 YTD 매출 (1~${latestMonthLabel})`,
              subtitle: '2026 누적',
              items: [
                { label: '제품군1', value: ytdSum(pg1_2026) },
                { label: '제품군2', value: ytdSum(pg2_2026) },
                { label: '제품군3', value: ytdSum(pg3_2026) },
                { label: '제품군4', value: ytdSum(pg4_2026) },
              ],
              horizontal: false,
              showLabels: true,
            },
            {
              type: 'metric',
              label: '수출 매출(계획 기준)',
              value: krw(latestExportPlan),
              delta: 0,
              icon: '▷',
              context: '2025 실적 vs 2026 계획',
              categories: months,
              series: [
                { name: '2026 수출 계획', data: exportPlan2026 },
                { name: '2025 수출 실적', data: export2025 },
              ],
            },
          ],
        },
      ],
    },
    {
      title: '매출 계획 달성 상태',
      kicker: 'HEALTH CHECK',
      rows: [
        {
          layout: '1col',
          height: 'card',
          widgets: [
            {
              type: 'status',
              title: '핵심 지표 상태 요약',
              subtitle: 'OK / Warning / Danger',
              columns: 2,
              items: [
                {
                  label: '2026 YTD 전체 매출 계획 달성률',
                  status: ytdRate >= 100 ? 'ok' : ytdRate >= 95 ? 'warning' : 'danger',
                  value: ytdRate.toFixed(1) + '%',
                },
                {
                  label: `${latestMonthLabel} 제품군1 전년 동월 대비 성장률`,
                  status: (() => {
                    const a = pg1_2026[latestMonthIndex];
                    const b = pg1_2025[latestMonthIndex];
                    if (!a || !b) return 'warning';
                    return (a - b) / b * 100 >= 0 ? 'ok' : 'danger';
                  })(),
                  value: (() => {
                    const a = pg1_2026[latestMonthIndex];
                    const b = pg1_2025[latestMonthIndex];
                    if (!a || !b) return '데이터 부족';
                    return ((a - b) / b * 100).toFixed(1) + '%';
                  })(),
                },
                {
                  label: `${latestMonthLabel} 수출 비중(계획 기준)`,
                  status: 'ok',
                  value: exportPlanShare.toFixed(1) + '%',
                },
                {
                  label: '프리미엄 라인 매출 비중(직전 분기)',
                  status: 'warning',
                  value: '데이터 예시 수준',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default function SalesPage() {
  return <MagingPage config={config} />;
}
