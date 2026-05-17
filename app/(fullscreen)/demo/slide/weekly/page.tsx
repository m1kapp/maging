import { Metadata } from 'next';
import { MagingPage } from '@/components/MagingPage';

export const metadata: Metadata = {
  title: '주간 보고서 — maging',
  description: 'maging 슬라이드 모드 데모. 주간 운영 보고서.',
};

/* ── shared helpers for weekly data ─────────────────────── */

const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

const targets = {
  '신규':          [99000000, 175000000, 142000000, 223000000, 290000000, 248000000, 385000000, 332000000, 227000000, 173000000, 479000000, 227000000],
  '기고객':        [522199453, 685150178, 523438974, 633610647, 567273854, 641914284, 653631582, 545451915, 547977217, 539356007, 660862069, 532267794],
  '추가/업셀링':   [3971153, 25120771, 3741348, 29371700, 2957400, 29702595, 3038185, 25899600, 41308220, 19786097, 19573620, 11505459],
  'Add-On':        [0, 15000000, 28671730, 52878844, 68766210, 58806966, 91293072, 78725454, 47424972, 41022601, 113582808, 53827343],
};

const actuals = {
  '신규':          [100308000, 109067000, 71941000, null, null, null, null, null, null, null, null, null],
  '기고객':        [597009572, 576833422, 518279322, null, null, null, null, null, null, null, null, null],
  '추가/업셀링':   [15527600, 21424500, 16852100, null, null, null, null, null, null, null, null, null],
  'Add-On':        [6000000, 0, 8432000, null, null, null, null, null, null, null, null, null],
};

const toRows = (obj: Record<string, (number | null)[]>) =>
  Object.entries(obj).map(([name, data]) => ({ name, data }));

const data2026 = [
  { name: '해지', unit: '건', values: [174, 138, 135, 89, null, null, null, null, null, null, null, null], total: 312 },
  { name: '신규', unit: '건', values: [117, 89, 92, null, null, null, null, null, null, null, null, null], total: 206 },
  { name: '유료전체', unit: '개', values: [4662, 4621, 4592, null, null, null, null, null, null, null, null, null], total: 4621 },
  { name: '해지비율', unit: '%', values: ['149%', '156%', '146%', null, null, null, null, null, null, null, null, null], total: '153%' },
  { name: '해지율', unit: '%', values: ['3.7%', '3.0%', '2.9%', null, null, null, null, null, null, null, null, null], total: '3.2%' },
];

const data2025 = [
  { name: '해지', unit: '건', values: [185, 164, 147, 146, 121, 134, 121, 111, 133, 106, 118, 140], total: 1598 },
  { name: '신규', unit: '건', values: [126, 173, 146, 162, 132, 149, 169, 142, 139, 96, 114, 134], total: 1682 },
  { name: '비율', unit: '%', values: ['144%', '95%', '104%', '90%', '91%', '89%', '72%', '78%', '76%', '110%', '103%', '105%'], total: '95%' },
];

const retentionCols = [
  { key: 'name', label: '구분', align: 'left' as const, width: '120px' },
  ...months.map((m, i) => ({ key: 'm' + i, label: m, align: 'center' as const })),
  { key: 'total', label: '합계', align: 'center' as const },
];

const toRetentionRows = (defs: typeof data2026) =>
  defs.map(d => {
    const r: Record<string, any> = { name: d.name, unit: d.unit, total: d.total };
    d.values.forEach((v, i) => { r['m' + i] = v; });
    return r;
  });

/* ── Q1 revenue summary ─────────────────────── */
const q1New = 281316000;
const q1Exist = 1692122316;
const q1Upsell = 53804200;
const q1Addon = 14432000;
const q1Total = q1New + q1Exist + q1Upsell + q1Addon;
const fmtBillion = (v: number) => (v / 1e8).toFixed(2) + '<span class="mw-unit"> 억원</span>';

/* ── config ──────────────────────────────────── */

const config = {
  mode: 'weekly',
  sidebarTitle: 'SaaS 주간보고',
  sidebarDate: '2026.04.27 · 4월 4주차',  slides: [
    /* ═══ Cover ═══ */
    {
      id: 'cover',
      cover: true,
      widgets: [{
        type: 'sectionCover',
        style: 'classic',
        kicker: 'WEEKLY REPORT · 2026년 4월 4주차',
        title: 'SaaS 주간보고',
        subtitle: 'SaaS B/U · Enterprise B/U',
        brand: 'flow.team',
        meta: '기준일 2026.04.27(월)',
      }],
    },

    /* ═══ Sales KPI ═══ */
    {
      id: 'sales-kpi',
      label: 'KPI 1. 신규 매출 30억',
      bu: 'SaaS B/U',
      team: '컨설팅 & CSM팀',
      widgets: [
        { type: 'pageHeader', title: '월별 매출 현황', meta: '기준일 2026.04.27(월)' },
        { type: 'kpiCard', label: '3월 신규 매출 · 목표 1.42억원', value: fmtBillion(71941000), valueHTML: true, delta: (71941000 / 142000000 * 100) - 100, deltaGoodWhen: 'positive' },
        { type: 'kpiCard', label: '1Q 신규 매출 · 목표 4.16억원', value: fmtBillion(281316000), valueHTML: true, delta: (281316000 / 416000000 * 100) - 100, deltaGoodWhen: 'positive' },
        { type: 'kpiCard', label: '상반기 신규 매출 · 목표 11.7억원', value: fmtBillion(281316000), valueHTML: true, delta: (281316000 / 1170000000 * 100) - 100, deltaGoodWhen: 'positive' },
        { type: 'kpiCard', label: '2026 누적 신규 매출 · 목표 30억원', value: fmtBillion(322000000), valueHTML: true, delta: (322000000 / 3000000000 * 100) - 100, deltaGoodWhen: 'positive' },
        { type: 'sectionHead', title: '월별 목표 · 실적' },
        {
          type: 'monthlyTable',
          title: '2026년 목표 매출',
          sub: '월별 카테고리 합계',
          categories: months,
          rows: toRows(targets),
          summaryRow: '합계',
          unitToggle: true,
          viewToggle: true,
          defaultUnit: '만원',
        },
      ],
    },

    /* ═══ Sales KPI 2 ═══ */
    {
      id: 'sales-kpi-2',
      label: 'KPI 1. 신규 매출 30억',
      bu: 'SaaS B/U',
      team: '컨설팅 & CSM팀',
      widgets: [
        {
          type: 'monthlyTable',
          title: '2026년 실적',
          sub: '4월 이후 데이터 미입력',
          categories: months,
          rows: toRows(actuals),
          summaryRow: '합계',
          unitToggle: true,
          viewToggle: true,
          defaultUnit: '만원',
        },
        {
          type: 'alertBanner',
          bannerType: 'info',
          icon: '—',
          title: '리뷰',
          message: '전체 매출은 1분기 목표 대비 92.5% 달성. 신규 매출은 1분기 목표 대비 약 1.3억원 미달 — 4월 신규 회복이 우선 과제.',
        },
      ],
    },

    /* ═══ Pricing (신규상품 매출) ═══ */
    {
      id: 'pricing',
      label: 'KPI 2. 신규상품 매출 6.5억',
      bu: 'SaaS B/U',
      team: '컨설팅 & CSM팀',
      widgets: [
        { type: 'pageHeader', title: '신규상품 라인업 매출 현황', meta: '기준일 2026.04.27(월)' },
        { type: 'kpiCard', label: 'Q1 신규상품 매출 · 목표 1.6억', value: '1.23<span class="mw-unit"> 억원</span>', valueHTML: true, delta: -23.1, deltaGoodWhen: 'positive' },
        { type: 'kpiCard', label: '4월 파이프라인', value: '0.48<span class="mw-unit"> 억원</span>', valueHTML: true, delta: 12.4, deltaGoodWhen: 'positive' },
        { type: 'kpiCard', label: '활성 신규상품 고객', value: '34<span class="mw-unit">개사</span>', valueHTML: true, delta: 6.2, deltaGoodWhen: 'positive' },
        { type: 'kpiCard', label: '월 평균 계약 단가', value: '361<span class="mw-unit">만원</span>', valueHTML: true, delta: 3.1, deltaGoodWhen: 'positive' },
        { type: 'sectionHead', title: '신규상품별 매출 현황' },
        {
          type: 'activityTable',
          columns: [
            { key: 'product', label: '상품명', align: 'left' },
            { key: 'type', label: '유형', align: 'left' },
            { key: 'jan', label: '1월', align: 'right' },
            { key: 'feb', label: '2월', align: 'right' },
            { key: 'mar', label: '3월', align: 'right' },
            { key: 'pipeline', label: '4월 파이프라인', align: 'right' },
            { key: 'total', label: 'Q1 합계', align: 'right' },
            { key: 'note', label: '비고', align: 'left' },
          ],
          rows: [
            { product: 'Flow AI 어시스턴트', type: 'Add-On', jan: '1,200만', feb: '2,100만', mar: '1,800만', pipeline: '2,400만', total: '5,100만', note: '1Q 목표 초과 달성' },
            { product: '업무 자동화 플러그인', type: 'Add-On', jan: '900만', feb: '1,400만', mar: '1,200만', pipeline: '1,800만', total: '3,500만', note: '파이프라인 3건 협상 중' },
            { product: 'HR 전자결재 모듈', type: '모듈', jan: '600만', feb: '800만', mar: '750만', pipeline: '600만', total: '2,150만', note: '공공기관 2곳 PoC' },
            { product: '모바일 고급플랜', type: '요금제', jan: '400만', feb: '550만', mar: '480만', pipeline: '450만', total: '1,430만', note: '' },
            { product: 'API 엔터프라이즈', type: 'B2B', jan: '0', feb: '0', mar: '0', pipeline: '1,550만', total: '0', note: '5월 계약 체결 예정' },
            { product: '합계', type: '', jan: '3,100만', feb: '4,850만', mar: '4,230만', pipeline: '6,800만', total: '12,180만', note: '' },
          ],
        },
        {
          type: 'alertBanner',
          bannerType: 'warning',
          icon: '—',
          title: '리뷰',
          message: 'Q1 신규상품 매출 1.23억원으로 목표(1.6억) 대비 23.1% 부진. API 엔터프라이즈 5월 계약 체결 시 회복 가능. 4월 파이프라인 0.48억원 집중 클로징 필요.',
        },
      ],
    },

    /* ═══ Education ═══ */
    {
      id: 'education',
      label: 'KPI 3. 고객 교육 강화',
      bu: 'SaaS B/U',
      team: '컨설팅 & CSM팀',
      widgets: [
        { type: 'pageHeader', title: '고객 교육 프로그램 현황', meta: '기준일 2026.04.27(월)' },
        { type: 'kpiCard', label: '4월 교육 세션수 · 목표 12회', value: '9<span class="mw-unit">회</span>', valueHTML: true, delta: -25, deltaGoodWhen: 'positive' },
        { type: 'kpiCard', label: '누적 참여 고객사 · 4월 기준', value: '128<span class="mw-unit">개사</span>', valueHTML: true, delta: 14.3, deltaGoodWhen: 'positive' },
        { type: 'kpiCard', label: '교육 만족도 · 5점 만점', value: '4.3<span class="mw-unit"> / 5.0</span>', valueHTML: true, delta: 1.2, deltaGoodWhen: 'positive' },
        { type: 'sectionHead', title: '4월 교육 세션 현황' },
        {
          type: 'activityTable',
          columns: [
            { key: 'date', label: '일자', align: 'left' },
            { key: 'topic', label: '과정명', align: 'left' },
            { key: 'type', label: '유형', align: 'left' },
            { key: 'attendees', label: '참여 (명)', align: 'center' },
            { key: 'score', label: '만족도', align: 'center' },
            { key: 'owner', label: '담당', align: 'left' },
            { key: 'note', label: '비고', align: 'left' },
          ],
          rows: [
            { date: '4/2', topic: 'Flow 기초 온보딩', type: '웨비나', attendees: 42, score: 4.5, owner: '김지현', note: '신규 도입 고객사 집중' },
            { date: '4/7', topic: '업무 자동화 활용법', type: '온라인', attendees: 28, score: 4.2, owner: '박민호', note: '' },
            { date: '4/10', topic: 'HR 결재 모듈 심화', type: '오프라인', attendees: 15, score: 4.6, owner: '이수진', note: '현장 Q&A 호평' },
            { date: '4/16', topic: '관리자 설정 마스터', type: '웨비나', attendees: 36, score: 4.1, owner: '김지현', note: '' },
            { date: '4/22', topic: 'AI 어시스턴트 입문', type: '온라인', attendees: 51, score: 4.4, owner: '박민호', note: 'AI 기능 첫 교육' },
            { date: '4/25', topic: 'API 연동 개발자 세션', type: '오프라인', attendees: 12, score: 3.9, owner: '정유진', note: '기술 난도 피드백' },
          ],
        },
        {
          type: 'alertBanner',
          bannerType: 'warning',
          icon: '—',
          title: '리뷰',
          message: '4월 세션 9회 진행으로 목표(12회) 대비 25% 부진. 온라인 웨비나 추가 편성 검토 필요. 만족도 4.3점으로 목표 달성 중.',
        },
      ],
    },

    /* ═══ Retention ═══ */
    {
      id: 'retention',
      label: 'KPI 1. 기고객 리텐션',
      bu: 'SaaS B/U',
      team: 'CX팀',
      widgets: [
        { type: 'pageHeader', title: '월별 해지 및 순증감 현황', meta: '기준일 2026.04.27(월)' },
        { type: 'kpiCard', label: '3월 해지율 · 전년 동월 3.3%', value: '2.9<span class="mw-unit">%</span>', valueHTML: true, delta: -3.4, deltaGoodWhen: 'negative' },
        { type: 'kpiCard', label: '3월 해지비율 · 신규 92 < 해지 135', value: '146<span class="mw-unit">%</span>', valueHTML: true, delta: -10, deltaGoodWhen: 'negative' },
        { type: 'kpiCard', label: '3월 유료 기업 수 · 2월 4,621 → 3월', value: '4,592<span class="mw-unit">개</span>', valueHTML: true, delta: -0.6, deltaGoodWhen: 'positive' },
        { type: 'sectionHead', title: '월별 해지·신규 추이' },
        {
          type: 'activityTable',
          title: '2026년 월별 현황',
          subtitle: '해지·신규·유료전체 추이',
          columns: retentionCols,
          rows: toRetentionRows(data2026),
          fixedLayout: true,
        },
      ],
    },

    /* ═══ Retention 2 ═══ */
    {
      id: 'retention-2',
      label: 'KPI 1. 기고객 리텐션',
      bu: 'SaaS B/U',
      team: 'CX팀',
      widgets: [
        {
          type: 'activityTable',
          title: '2025년 동월 비교',
          subtitle: '전년 기준',
          columns: retentionCols,
          rows: toRetentionRows(data2025),
          fixedLayout: true,
        },
        {
          type: 'alertBanner',
          bannerType: 'info',
          icon: '—',
          title: '리뷰',
          message: '3월 해지율 2.9%로 전월 -0.1%p 개선. 그러나 신규 92 < 해지 135 — 4월 신규 회복이 우선 과제.',
        },
      ],
    },

    /* ═══ Customer Insight ═══ */
    {
      id: 'customer-insight',
      label: 'KPI 2. 핵심고객 관계관리',
      bu: 'SaaS B/U',
      team: 'CX팀',
      widgets: [
        { type: 'pageHeader', title: '핵심고객 현황 및 인사이트', meta: '기준일 2026.04.27(월)' },
        { type: 'kpiCard', label: '관리 대상 핵심고객', value: '42<span class="mw-unit">개사</span>', valueHTML: true, delta: 2, deltaGoodWhen: 'positive' },
        { type: 'kpiCard', label: '평균 월정액 ARR', value: '28<span class="mw-unit">만원</span>', valueHTML: true, delta: 3.7, deltaGoodWhen: 'positive' },
        { type: 'kpiCard', label: '이탈위험 고객 (EBR 미진행)', value: '7<span class="mw-unit">개사</span>', valueHTML: true, delta: 2, deltaGoodWhen: 'negative' },
        { type: 'sectionHead', title: '핵심 고객 인사이트' },
        {
          type: 'insightCard',
          icon: '★',
          status: 'accent',
          title: '상위 5개사 ARR 집중도',
          meta: '총 매출 23%',
          bullets: ['(주)다온티앤씨 · 38만원/월 · 3년 갱신 예정', '에이블씨엔씨 · 31만원/월 · 증설 요청 접수', '서울반도체 · 28만원/월 · QBR 5월 예정'],
          highlight: '상위 5개사 이탈 시 월 155만원 손실 — 전담 CSM 배정 필요',
        },
        {
          type: 'insightCard',
          icon: '▲',
          status: 'red',
          title: '이탈위험 고객 7개사',
          meta: '4월 EBR 미완료',
          tag: '긴급',
          bullets: ['로그인 30일 이상 없음 3개사 — 즉시 컨택 필요', '갱신 60일 내 도래 4개사 — 리뷰 미진행'],
          highlight: '4월 말까지 7개사 EBR 완료 필수 — 담당: 조윤경 책임',
        },
      ],
    },

    /* ═══ Customer Insight 2 ═══ */
    {
      id: 'customer-insight-2',
      label: 'KPI 2. 핵심고객 관계관리',
      bu: 'SaaS B/U',
      team: 'CX팀',
      widgets: [
        {
          type: 'insightCard',
          icon: '↑',
          status: 'green',
          title: '업셀링 파이프라인',
          meta: '진행 중 12개사',
          bullets: ['사용자 수 50% 이상 증가 6개사 → 요금제 업그레이드 제안', 'Add-On 미구독 고객 중 고사용률 4개사 → 번들 제안 준비'],
          highlight: '전환 예상 월 추가 매출 약 42만원',
        },
        {
          type: 'insightCard',
          icon: '✓',
          status: 'green',
          title: '고객 성공 사례 — D사',
          meta: '업무시간 -31%',
          tag: '성과 확인',
          bullets: ['Flow 도입 3개월 — 결재 프로세스 디지털화 완료', '사용자 148명 → 210명 증설 완료'],
          highlight: '도입 ROI 리포트 완성 → 영업팀 레퍼런스 공유 예정',
        },
        {
          type: 'alertBanner',
          bannerType: 'info',
          icon: '—',
          title: '리뷰',
          message: '이탈위험 7개사 EBR 4월 말 완료 목표. 업셀링 파이프라인 12개사 전환 시 월 +42만원 매출 효과.',
        },
      ],
    },

    /* ═══ Feedback — NPS ═══ */
    {
      id: 'feedback-nps',
      label: 'KPI 3. 고객 피드백 프로세스',
      bu: 'SaaS B/U',
      team: 'CX팀',
      widgets: [
        { type: 'pageHeader', title: 'NPS · 순수 추천 지수', meta: '기준일 2026.04.27(월)' },
        { type: 'kpiCard', label: '1Q NPS 추천 비율 · 업계 우수 ≥70%', value: '54<span class="mw-unit">%</span>', valueHTML: true, delta: -16, deltaGoodWhen: 'positive' },
        { type: 'kpiCard', label: '1Q NPS 중립자', value: '24<span class="mw-unit">%</span>', valueHTML: true },
        { type: 'kpiCard', label: '1Q NPS 비추천자', value: '22<span class="mw-unit">%</span>', valueHTML: true },
        { type: 'sectionHead', title: 'NPS 분포' },
        {
          type: 'shareBar',
          segments: [
            { label: '추천자 (9~10점)', value: 54, status: 'green', sub: '업계 우수 ≥70%' },
            { label: '중립자 (7~8점)', value: 24, status: 'gray' },
            { label: '비추천 (0~6점)', value: 22, status: 'red' },
          ],
        },
        {
          type: 'defCard',
          title: 'NPS 정의',
          subtitle: 'Net Promoter Score · 분기별',
          rows: [
            { key: '정의', value: '"우리 서비스를 동료에게 추천하시겠습니까?" → 충성도·성장 잠재력' },
            { key: '측정', value: '1~10점 form, 분기별 발송' },
            { key: '담당', value: '박진웅 · 1차 발송 완료' },
          ],
        },
      ],
    },

    /* ═══ Feedback — CSAT ═══ */
    {
      id: 'feedback-csat',
      label: 'KPI 3. 고객 피드백 프로세스',
      bu: 'SaaS B/U',
      team: 'CX팀',
      widgets: [
        { type: 'pageHeader', title: 'CSAT · 응대 만족도', meta: '기준일 2026.04.27(월)' },
        { type: 'kpiCard', label: '4월 CSAT 현재 · 목표 1.8', value: '1.66<span class="mw-unit"> / 2.0</span>', valueHTML: true, delta: 0, deltaGoodWhen: 'positive' },
        { type: 'sectionHead', index: '02', kicker: 'CSAT BY PERSON', title: '담당자별 응대 만족도' },
        {
          type: 'activityTable',
          title: 'CSAT 담당자별 점수',
          subtitle: '4월 현재 · 만점 2.0 / 목표 1.8',
          columns: [
            { key: 'who', label: '담당자', align: 'left' },
            { key: 'score', label: '점수 (만점 2.0)', align: 'right' },
            { key: 'gap', label: '목표 대비', align: 'right' },
          ],
          rows: [
            { who: '박진웅 팀장', score: 1.84 },
            { who: '신현민 책임', score: 1.85 },
            { who: '강지우 책임', score: 1.75 },
            { who: '조윤경 책임', score: 1.25 },
          ],
        },
        {
          type: 'defCard',
          title: 'CSAT 정의',
          subtitle: 'Customer Satisfaction · 상시',
          rows: [
            { key: '정의', value: '"방금 경험한 상담에 얼마나 만족?"' },
            { key: '도구', value: 'HubSpot 인박스 · 상시 표시' },
            { key: '담당', value: 'CX 전체' },
          ],
        },
      ],
    },

    /* ═══ Feedback — Top Issues ═══ */
    {
      id: 'feedback-issues',
      label: 'KPI 3. 고객 피드백 프로세스',
      bu: 'SaaS B/U',
      team: 'CX팀',
      widgets: [
        { type: 'sectionHead', index: '03', kicker: 'TOP ISSUES', title: '최우선 해결 과제 — 전 구간 공통 반복' },
        {
          type: 'insightCard',
          icon: '◎',
          title: '검색 기능',
          tag: '전 구간 공통',
          status: 'red',
          bullets: ['추천/중립/비추천 모든 점수 구간에서 반복 등장한 불편 이슈'],
        },
        {
          type: 'insightCard',
          icon: '↯',
          title: '속도 / 성능',
          tag: '헤비유저',
          status: 'yellow',
          bullets: ['사용량 많은 고객의 이탈 위험 신호. 우선 대응 필요'],
        },
        {
          type: 'insightCard',
          icon: '◇',
          title: '알림 불편',
          tag: '설정',
          status: 'gray',
          bullets: ['불필요 알림 과다 — 알림 설정 세분화 필요'],
        },
        {
          type: 'alertBanner',
          bannerType: 'info',
          icon: '—',
          title: '리뷰',
          message: '1Q NPS 추천 54%로 업계 우수(70%) 미달. CSAT 4월 1.66점, 목표 대비 -0.14점. 전 구간 공통 이슈(검색·속도·알림) 우선 대응 필요.',
        },
      ],
    },

    /* ═══ Dev Progress ═══ */
    {
      id: 'dev-progress',
      label: 'KPI 1. 플랫폼 매출 확대',
      bu: 'SaaS B/U',
      team: 'AX & 플랫폼팀',
      widgets: [
        { type: 'pageHeader', title: '개발 진행 현황', meta: '기준일 2026.04.27(월)' },
        { type: 'kpiCard', label: '이번 주 배포 건수', value: '3<span class="mw-unit">건</span>', valueHTML: true, delta: 0, deltaGoodWhen: 'positive' },
        { type: 'kpiCard', label: '4월 완료 피처 누적', value: '18<span class="mw-unit">개</span>', valueHTML: true, delta: 12.5, deltaGoodWhen: 'positive' },
        { type: 'kpiCard', label: 'API 가용성 (4월)', value: '99.2<span class="mw-unit">%</span>', valueHTML: true, delta: -0.1, deltaGoodWhen: 'positive' },
        { type: 'sectionHead', title: '스프린트 현황' },
        {
          type: 'ragChip',
          items: [
            { label: 'API 게이트웨이 v2', status: 'green' },
            { label: '플로우 마켓 연동', status: 'green' },
            { label: '사용량 분석 대시보드', status: 'yellow' },
            { label: '멀티테넌트 격리', status: 'yellow' },
            { label: '엔터프라이즈 SSO', status: 'red' },
            { label: 'AI 자동화 파이프라인', status: 'gray' },
          ],
        },
        {
          type: 'activityTable',
          columns: [
            { key: 'feature', label: '피처', align: 'left' },
            { key: 'owner', label: '담당', align: 'left' },
            { key: 'status', label: '상태', align: 'left' },
            { key: 'due', label: '완료예정', align: 'right' },
            { key: 'note', label: '비고', align: 'left' },
          ],
          rows: [
            { feature: 'API 게이트웨이 v2', owner: '김태현', status: '완료', due: '4/25', note: '배포 완료 · 레이턴시 -18%' },
            { feature: '플로우 마켓 연동', owner: '이수진', status: '완료', due: '4/25', note: '파트너사 3곳 온보딩 완료' },
            { feature: '사용량 분석 대시보드', owner: '박민호', status: '진행', due: '5/2', note: '차트 UI 리뷰 중' },
            { feature: '멀티테넌트 격리', owner: '정유진', status: '진행', due: '5/9', note: 'DB 스키마 설계 검토 중' },
            { feature: '엔터프라이즈 SSO', owner: '김태현', status: '지연', due: '4/18', note: '인증 서버 이슈 — 재일정 5/16' },
            { feature: 'AI 자동화 파이프라인', owner: '이수진', status: '대기', due: 'TBD', note: '요구사항 정의 중' },
          ],
        },
        {
          type: 'alertBanner',
          bannerType: 'warning',
          icon: '—',
          title: '리뷰',
          message: '엔터프라이즈 SSO 1주 지연, 5/16 재완료 목표. API 게이트웨이 개선으로 응답속도 -18% 달성 — 플랫폼 매출 연계 효과 모니터링 필요.',
        },
      ],
    },

    /* ═══ AI & 자동화 ═══ */
    {
      id: 'ai-auto',
      label: 'KPI 2. AI & 업무 자동화',
      bu: 'SaaS B/U',
      team: 'AX & 플랫폼팀',
      widgets: [
        { type: 'pageHeader', title: 'AI 기능 배포 및 자동화 현황', meta: '기준일 2026.04.27(월)' },
        { type: 'kpiCard', label: '배포 완료 AI 기능', value: '7<span class="mw-unit">개</span>', valueHTML: true, delta: 0, deltaGoodWhen: 'positive' },
        { type: 'kpiCard', label: '자동화 절감 업무시간 (4월)', value: '1,240<span class="mw-unit">시간</span>', valueHTML: true, delta: 18.2, deltaGoodWhen: 'positive' },
        { type: 'kpiCard', label: 'AI 기능 활성 사용률', value: '31<span class="mw-unit">%</span>', valueHTML: true, delta: 4.1, deltaGoodWhen: 'positive' },
        { type: 'sectionHead', title: 'AI 기능 로드맵' },
        {
          type: 'ragChip',
          items: [
            { label: 'AI 요약 (메시지)', status: 'green' },
            { label: '스마트 분류 태그', status: 'green' },
            { label: 'AI 회의록 초안', status: 'green' },
            { label: '이상 탐지 알림', status: 'yellow' },
            { label: 'AI 고객 응대 초안', status: 'yellow' },
            { label: '예측 이탈 분석', status: 'red' },
            { label: 'AI 기반 보고서 생성', status: 'gray' },
          ],
        },
        {
          type: 'activityTable',
          columns: [
            { key: 'feature', label: 'AI 기능', align: 'left' },
            { key: 'status', label: '상태', align: 'left' },
            { key: 'users', label: '활성 사용자', align: 'right' },
            { key: 'saves', label: '절감 시간/주', align: 'right' },
            { key: 'next', label: '다음 액션', align: 'left' },
          ],
          rows: [
            { feature: 'AI 요약 (메시지)', status: '운영', users: '1,842명', saves: '320시간', next: '요약 품질 A/B 테스트' },
            { feature: '스마트 분류 태그', status: '운영', users: '986명', saves: '180시간', next: '커스텀 태그 확장' },
            { feature: 'AI 회의록 초안', status: '운영', users: '573명', saves: '210시간', next: '음성인식 정확도 개선' },
            { feature: '이상 탐지 알림', status: '베타', users: '124명', saves: '미측정', next: '5월 전체 배포 예정' },
            { feature: 'AI 고객 응대 초안', status: '베타', users: '38명', saves: '미측정', next: 'CX팀 내부 검증 중' },
            { feature: '예측 이탈 분석', status: '개발', users: '−', saves: '−', next: '데이터 파이프라인 구축' },
          ],
        },
        {
          type: 'alertBanner',
          bannerType: 'info',
          icon: '—',
          title: '리뷰',
          message: '운영 중 AI 기능 3개에서 월 약 1,240시간 절감 효과. 이탈 탐지·응대 초안 5월 전사 배포 목표. 활성 사용률 31% → 2Q 목표 45%.',
        },
      ],
    },

    /* ═══ Revenue Summary ═══ */
    {
      id: 'revenue-summary',
      label: '전체 매출 현황',
      bu: 'SaaS B/U',
      widgets: [
        {
          type: 'pageHeader',
          title: 'SaaS B/U 전체 매출 현황',
          subtitle: 'Q1 실적 · 신규 + 기고객 + 추가/업셀링 + Add-On',
          meta: '기준일 2026.04.27(월)',
        },
        { type: 'kpiCard', label: 'Q1 총매출 · 목표 달성률', value: fmtBillion(q1Total), valueHTML: true, delta: -7.5, deltaGoodWhen: 'positive' },
        { type: 'kpiCard', label: 'Q1 신규 · 목표 4.16억원', value: fmtBillion(q1New), valueHTML: true, delta: -32.4, deltaGoodWhen: 'positive' },
        { type: 'kpiCard', label: 'Q1 기고객', value: fmtBillion(q1Exist), valueHTML: true, delta: 2.1, deltaGoodWhen: 'positive' },
        { type: 'kpiCard', label: 'Q1 추가/업셀 + Add-On', value: fmtBillion(q1Upsell + q1Addon), valueHTML: true, delta: -5.8, deltaGoodWhen: 'positive' },
        { type: 'sectionHead', title: 'Q1 매출 구성' },
        {
          type: 'shareBar',
          segments: [
            { label: '기고객', value: q1Exist, sub: Math.round(q1Exist / q1Total * 100) + '%', status: 'gray', color: 'var(--mw-accent)' },
            { label: '신규', value: q1New, sub: Math.round(q1New / q1Total * 100) + '%', status: 'green' },
            { label: '추가/업셀링', value: q1Upsell, sub: Math.round(q1Upsell / q1Total * 100) + '%', status: 'yellow' },
            { label: 'Add-On', value: q1Addon, sub: Math.round(q1Addon / q1Total * 100) + '%', status: 'gray' },
          ],
          height: 48,
        },
        {
          type: 'alertBanner',
          bannerType: 'warning',
          icon: '—',
          title: '리뷰',
          message: 'Q1 총매출 20.4억원. 신규 2.8억원으로 목표(4.2억원) 대비 -32.4% 부진. 기고객 16.9억원 안정적 유지. 2Q 신규 파이프라인 강화 필요.',
        },
      ],
    },

    /* ═══ Enterprise 수주 요약 ═══ */
    {
      id: 'ent-summary',
      label: '수주 실적 요약',
      bu: 'Enterprise B/U',
      team: '컨설팅팀',
      widgets: [
        { type: 'pageHeader', title: '엔터프라이즈 수주 실적 요약', meta: '기준일 2026.04.27(월)' },
        { type: 'kpiCard', label: 'Q1 수주 총액 · 목표 8억', value: '6.2<span class="mw-unit"> 억원</span>', valueHTML: true, delta: -22.5, deltaGoodWhen: 'positive' },
        { type: 'kpiCard', label: '4월 클로징 목표', value: '2.1<span class="mw-unit"> 억원</span>', valueHTML: true, delta: 0, deltaGoodWhen: 'positive' },
        { type: 'kpiCard', label: '활성 파이프라인 건수', value: '14<span class="mw-unit">건</span>', valueHTML: true, delta: 7.7, deltaGoodWhen: 'positive' },
        { type: 'kpiCard', label: '평균 계약 기간', value: '18<span class="mw-unit">개월</span>', valueHTML: true, delta: 0, deltaGoodWhen: 'positive' },
        {
          type: 'alertBanner',
          bannerType: 'warning',
          icon: '—',
          title: '리뷰',
          message: 'Q1 수주 6.2억으로 목표(8억) 대비 22.5% 부진. 현대모비스·CJ대한통운 4~5월 클로징 집중 필요.',
        },
      ],
    },

    /* ═══ Enterprise 파이프라인 ═══ */
    {
      id: 'ent-pipeline',
      label: '수주 파이프라인',
      bu: 'Enterprise B/U',
      team: '컨설팅팀',
      widgets: [
        { type: 'pageHeader', title: '엔터프라이즈 수주 파이프라인', meta: '기준일 2026.04.27(월)' },
        { type: 'sectionHead', title: '고객사별 진행 현황' },
        {
          type: 'activityTable',
          columns: [
            { key: 'company', label: '고객사', align: 'left' },
            { key: 'industry', label: '업종', align: 'left' },
            { key: 'stage', label: '단계', align: 'left' },
            { key: 'amount', label: '예상 계약액', align: 'right' },
            { key: 'users', label: '예상 사용자', align: 'right' },
            { key: 'close', label: '클로징 예정', align: 'right' },
            { key: 'owner', label: '담당 AM', align: 'left' },
          ],
          rows: [
            { company: '(주)에스케이네트웍스', industry: '유통', stage: '계약완료', amount: '1.8억', users: '320명', close: '4/15 완료', owner: '최인혁' },
            { company: 'KDB생명보험', industry: '금융', stage: '계약완료', amount: '1.1억', users: '180명', close: '3/31 완료', owner: '박수연' },
            { company: '현대모비스', industry: '제조', stage: '협상', amount: '2.3억', users: '450명', close: '4/30', owner: '최인혁' },
            { company: 'CJ대한통운', industry: '물류', stage: '협상', amount: '1.6억', users: '290명', close: '5/15', owner: '박수연' },
            { company: '삼성바이오로직스', industry: '제약', stage: 'PoC', amount: '3.2억', users: '600명', close: '6월 예상', owner: '최인혁' },
            { company: '한국도로공사', industry: '공공', stage: 'PoC', amount: '0.9억', users: '120명', close: '7월 예상', owner: '이도형' },
            { company: '롯데쇼핑', industry: '유통', stage: '제안', amount: '2.8억', users: '520명', close: 'Q3 목표', owner: '박수연' },
            { company: '대한항공', industry: '항공', stage: '발굴', amount: '미정', users: '미정', close: 'TBD', owner: '이도형' },
          ],
        },
      ],
    },
  ],
};

export default function WeeklyReportPage() {
  return <MagingPage config={config} fullscreen scripts={['/dist/maging-sidebar.js', '/dist/maging-weekly.js']} />;
}
