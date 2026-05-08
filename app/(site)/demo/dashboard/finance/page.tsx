import { Metadata } from 'next';
import { MagingPage } from '@/components/MagingPage';

export const metadata: Metadata = {
  title: '투자 포트폴리오 대시보드 — maging',
  description: '포트폴리오 현황 대시보드 데모. 수익률·자산배분·거래내역.',
};

const config = {
  title: '포트폴리오 현황',
  subtitle: '2026년 5월 기준',
  meta: 'Bloomberg 테마',
  kicker: 'INVESTMENT PORTFOLIO',
  sections: [
    {
      rows: [
        {
          layout: '4col',
          height: 'tile',
          widgets: [
            {
              type: 'kpi', label: '총 자산', unit: '원',
              sparkline: [312000000, 318000000, 325000000, 331000000, 342000000, 348000000, 355000000, 362000000, 371000000, 378000000, 385000000, 398000000],
            },
            {
              type: 'kpi', label: 'YTD 수익률', unit: '%',
              sparkline: [1.2, 2.8, 3.5, 4.1, 5.8, 6.2, 7.1, 8.3, 9.5, 10.2, 11.8, 12.4],
            },
            {
              type: 'kpi', label: '월 배당 수익', unit: '원',
              sparkline: [420000, 385000, 445000, 390000, 460000, 415000, 480000, 425000, 495000, 440000, 510000, 465000],
            },
            {
              type: 'kpi', label: '포트폴리오 베타', unit: '',
              sparkline: [1.12, 1.08, 1.05, 1.10, 0.98, 1.02, 0.95, 0.99, 0.92, 0.96, 0.88, 0.91],
              deltaGoodWhen: 'negative',
            },
          ],
        },
      ],
    },
    {
      title: '수익률 · 자산배분',
      kicker: 'PERFORMANCE',
      rows: [
        {
          layout: '3:1',
          height: 'card',
          widgets: [
            {
              type: 'line',
              title: '월별 누적 수익률',
              subtitle: '포트폴리오 vs KOSPI',
              categories: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
              series: [
                { name: '포트폴리오', data: [1.2, 2.8, 3.5, 4.1, 5.8, 6.2, 7.1, 8.3, 9.5, 10.2, 11.8, 12.4] },
                { name: 'KOSPI', data: [0.8, 1.5, 1.2, 2.1, 3.2, 2.8, 3.5, 4.1, 5.2, 4.8, 6.1, 7.2] },
              ],
            },
            {
              type: 'donut',
              title: '자산 배분',
              slices: [
                { label: '국내 주식', value: 42 },
                { label: '해외 주식', value: 28 },
                { label: '채권', value: 18 },
                { label: '대안투자', value: 8 },
                { label: '현금성', value: 4 },
              ],
              centerLabel: '배분',
            },
          ],
        },
      ],
    },
    {
      title: '섹터 · 종목',
      kicker: 'HOLDINGS',
      rows: [
        {
          layout: '2col',
          height: 'card',
          widgets: [
            {
              type: 'bar',
              title: '섹터별 수익률 (YTD)',
              items: [
                { label: '반도체', value: 22.4 },
                { label: '2차전지', value: 15.8 },
                { label: '바이오', value: 8.3 },
                { label: '금융', value: 11.2 },
                { label: '에너지', value: -3.5 },
                { label: '소비재', value: 5.1 },
              ],
              horizontal: false,
              showLabels: true,
            },
            {
              type: 'leaderboard',
              title: '수익률 TOP 5 종목',
              items: [
                { name: '삼성전자', meta: '+28.4%', percent: 95 },
                { name: 'SK하이닉스', meta: '+24.1%', percent: 82 },
                { name: 'NAVER', meta: '+18.7%', percent: 65 },
                { name: '현대차', meta: '+15.2%', percent: 52 },
                { name: '카카오', meta: '+11.8%', percent: 40 },
              ],
            },
          ],
        },
      ],
    },
    {
      title: '최근 거래',
      kicker: 'TRADES',
      rows: [
        {
          layout: '1col',
          height: 'card',
          widgets: [
            {
              type: 'table',
              title: '최근 거래 내역',
              subtitle: '최근 30일',
              columns: [
                { key: 'date', label: '일자' },
                { key: 'ticker', label: '종목' },
                { key: 'type', label: '구분' },
                { key: 'qty', label: '수량', align: 'right' },
                { key: 'price', label: '단가', align: 'right' },
                { key: 'amount', label: '금액', align: 'right' },
              ],
              rows: [
                { date: '5/02', ticker: '삼성전자', type: '매수', qty: '50주', price: '82,400원', amount: '412만' },
                { date: '4/28', ticker: 'TIGER 미국S&P500', type: '매수', qty: '30주', price: '18,520원', amount: '55.6만' },
                { date: '4/25', ticker: '카카오', type: '매도', qty: '100주', price: '52,300원', amount: '523만' },
                { date: '4/22', ticker: 'SK하이닉스', type: '매수', qty: '20주', price: '214,000원', amount: '428만' },
                { date: '4/18', ticker: 'KODEX 200', type: '매도', qty: '200주', price: '38,450원', amount: '769만' },
                { date: '4/15', ticker: 'NAVER', type: '매수', qty: '15주', price: '287,000원', amount: '430.5만' },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default function FinancePage() {
  return <MagingPage config={config} />;
}
