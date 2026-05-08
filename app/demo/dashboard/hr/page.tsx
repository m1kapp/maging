import { Metadata } from 'next';
import { MagingPage } from '@/components/MagingPage';

export const metadata: Metadata = {
  title: 'HR Analytics 인사 대시보드 — maging',
  description: '인사 대시보드 데모. 인원 현황·채용 파이프라인·퇴사율.',
};

const config = {
  title: '인사 대시보드',
  subtitle: '2026년 5월 기준',
  meta: 'People & Culture팀',
  kicker: 'HR ANALYTICS',
  alert: {
    type: 'info',
    title: '5월 채용 캠페인 진행 중',
    message: '개발팀 시니어 3명 + 마케팅팀 2명 채용 진행 중. 서류 마감 5/15.',
  },
  sections: [
    {
      rows: [
        {
          layout: '4col',
          height: 'tile',
          widgets: [
            {
              type: 'kpi', label: '총 임직원', unit: '명',
              sparkline: [142, 145, 148, 151, 153, 156, 158, 161, 164, 168, 172, 178],
            },
            {
              type: 'kpi', label: '이번달 신규 채용', unit: '명',
              sparkline: [3, 5, 4, 2, 6, 3, 4, 5, 7, 4, 6, 8],
            },
            {
              type: 'kpi', label: '자발적 퇴사율', unit: '%',
              deltaGoodWhen: 'negative',
              sparkline: [4.2, 3.8, 3.5, 3.9, 3.2, 2.8, 3.1, 2.9, 2.6, 2.4, 2.2, 1.9],
            },
            {
              type: 'kpi', label: '평균 근속', unit: '년',
              sparkline: [2.1, 2.2, 2.3, 2.3, 2.4, 2.4, 2.5, 2.5, 2.6, 2.7, 2.8, 2.9],
            },
          ],
        },
      ],
    },
    {
      title: '인원 현황',
      kicker: 'HEADCOUNT',
      rows: [
        {
          layout: '2:1',
          height: 'card',
          widgets: [
            {
              type: 'line',
              title: '월별 헤드카운트 추이',
              subtitle: '2025 vs 2026',
              categories: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
              series: [
                { name: '2026', data: [156, 158, 161, 164, 168, 172, 178, null, null, null, null, null] },
                { name: '2025', data: [128, 130, 132, 135, 137, 139, 142, 145, 148, 151, 153, 156] },
              ],
            },
            {
              type: 'donut',
              title: '부서별 인원 분포',
              slices: [
                { label: '개발', value: 62 },
                { label: '마케팅', value: 28 },
                { label: '영업', value: 35 },
                { label: '디자인', value: 18 },
                { label: 'People', value: 12 },
                { label: '경영지원', value: 23 },
              ],
              centerLabel: '전체',
            },
          ],
        },
      ],
    },
    {
      title: '채용 · 이탈',
      kicker: 'TALENT',
      rows: [
        {
          layout: '2col',
          height: 'card',
          widgets: [
            {
              type: 'funnel',
              title: '채용 파이프라인 (5월)',
              stages: [
                { label: '지원서 접수', value: 342 },
                { label: '서류 통과', value: 128 },
                { label: '1차 면접', value: 64 },
                { label: '2차 면접', value: 28 },
                { label: '최종 합격', value: 12 },
              ],
            },
            {
              type: 'bar',
              title: '부서별 연간 퇴사율',
              items: [
                { label: '개발', value: 8.2 },
                { label: '마케팅', value: 12.4 },
                { label: '영업', value: 15.1 },
                { label: '디자인', value: 5.3 },
                { label: 'People', value: 3.8 },
                { label: '경영지원', value: 6.7 },
              ],
              horizontal: false,
              showLabels: true,
            },
          ],
        },
      ],
    },
    {
      title: '최근 인사 이동',
      kicker: 'RECENT',
      rows: [
        {
          layout: '1col',
          height: 'card',
          widgets: [
            {
              type: 'table',
              title: '최근 인사 변동',
              subtitle: '최근 30일',
              columns: [
                { key: 'date', label: '일자' },
                { key: 'name', label: '이름' },
                { key: 'dept', label: '부서' },
                { key: 'type', label: '구분' },
                { key: 'note', label: '비고' },
              ],
              rows: [
                { date: '5/02', name: '김서연', dept: '개발', type: '입사', note: '백엔드 시니어' },
                { date: '5/01', name: '이준혁', dept: '마케팅', type: '입사', note: '퍼포먼스 마케터' },
                { date: '4/28', name: '박지민', dept: '영업', type: '퇴사', note: '개인 사유' },
                { date: '4/25', name: '정하늘', dept: '개발→디자인', type: '이동', note: 'UX 전환' },
                { date: '4/22', name: '최민수', dept: '개발', type: '입사', note: '프론트엔드' },
                { date: '4/20', name: '한소희', dept: '마케팅', type: '입사', note: '콘텐츠 마케터' },
                { date: '4/15', name: '윤재호', dept: '경영지원', type: '퇴사', note: '이직' },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default function HrPage() {
  return <MagingPage config={config} />;
}
