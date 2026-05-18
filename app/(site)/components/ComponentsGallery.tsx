'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ComponentsGallery() {
  const searchParams = useSearchParams();
  const initializedRef = useRef(false);
  const modeParam = searchParams.get('mode') || 'core';

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    function boot() {
      // Load mode scripts
      function loadScript(src: string): Promise<void> {
        return new Promise(function (ok, fail) {
          // Skip if already loaded
          if (document.querySelector('script[src="' + src + '"]')) { ok(); return; }
          var s = document.createElement('script');
          s.src = src; s.onload = () => ok(); s.onerror = () => fail();
          document.head.appendChild(s);
        });
      }

      Promise.all([
        loadScript('/dist/maging-slide.js'),
        loadScript('/dist/maging-landing.js'),
        loadScript('/dist/maging-news.js'),
      ]).then(function () {
        var Maging = (window as any).Maging;
        if (!Maging) return;

        /* ============================================================
         * Widget registry
         * ============================================================ */
        var WIDGETS: Record<string, { mode: string; cat: string; wide?: boolean; tall?: boolean }> = {
          // -- Core: metrics --
          heroTile:        { mode: 'core', cat: 'Metrics', tall: true },
          metricChart:     { mode: 'core', cat: 'Metrics' },
          kpiCard:         { mode: 'core', cat: 'Metrics' },
          ringProgress:    { mode: 'core', cat: 'Metrics' },
          metricStack:     { mode: 'core', cat: 'Metrics' },
          compareCard:     { mode: 'core', cat: 'Metrics' },
          bulletChart:     { mode: 'core', cat: 'Metrics' },
          countdownTile:   { mode: 'core', cat: 'Metrics' },

          // -- Core: charts --
          lineChart:       { mode: 'core', cat: 'Charts' },
          barChart:        { mode: 'core', cat: 'Charts' },
          donutChart:      { mode: 'core', cat: 'Charts' },
          funnelChart:     { mode: 'core', cat: 'Charts' },
          gaugeChart:      { mode: 'core', cat: 'Charts' },
          radarChart:      { mode: 'core', cat: 'Charts' },
          treemapChart:    { mode: 'core', cat: 'Charts' },
          scatterChart:    { mode: 'core', cat: 'Charts' },
          sankeyChart:     { mode: 'core', cat: 'Charts' },
          heatmapChart:    { mode: 'core', cat: 'Charts' },
          waterfallChart:  { mode: 'core', cat: 'Charts' },

          // -- Core: lists --
          leaderboard:     { mode: 'core', cat: 'Lists' },
          activityTable:   { mode: 'core', cat: 'Lists' },
          timeline:        { mode: 'core', cat: 'Lists' },
          inboxPreview:    { mode: 'core', cat: 'Lists' },
          statusGrid:      { mode: 'core', cat: 'Lists' },
          sparklineList:   { mode: 'core', cat: 'Lists' },

          // -- Core: calendar & progress --
          calendarHeatmap: { mode: 'core', cat: 'Calendar & Progress', wide: true, tall: true },
          eventCalendar:   { mode: 'core', cat: 'Calendar & Progress', tall: true },
          progressStepper: { mode: 'core', cat: 'Calendar & Progress', wide: true, tall: true },
          goalGrid:        { mode: 'core', cat: 'Calendar & Progress' },

          // -- Core: layout --
          pageHeader:      { mode: 'core', cat: 'Layout' },
          sectionHead:     { mode: 'core', cat: 'Layout' },
          alertBanner:     { mode: 'core', cat: 'Layout' },
          ragChip:         { mode: 'core', cat: 'Lists' },
          shareBar:        { mode: 'core', cat: 'Charts' },
          mapChart:        { mode: 'core', cat: 'Specialized', wide: true, tall: true },
          cohortMatrix:    { mode: 'core', cat: 'Specialized', wide: true, tall: true },

          // -- Slide: Report --
          monthlyTable:         { mode: 'slide', cat: '슬라이드 위젯', wide: true, tall: true },
          sectionCover:         { mode: 'slide', cat: '슬라이드 위젯', wide: true, tall: true },
          defCard:              { mode: 'slide', cat: '슬라이드 위젯' },
          insightCard:          { mode: 'slide', cat: '슬라이드 위젯', tall: true },

          // -- Landing Page --
          heroSection:     { mode: 'landing', cat: 'Landing Page', wide: true, tall: true },
          featureGrid:     { mode: 'landing', cat: 'Landing Page', wide: true, tall: true },
          pricingTable:    { mode: 'landing', cat: 'Landing Page', wide: true, tall: true },
          stepGuide:       { mode: 'landing', cat: 'Landing Page', wide: true, tall: true },
          comparisonTable: { mode: 'landing', cat: 'Landing Page', wide: true, tall: true },
          testimonialGrid: { mode: 'landing', cat: 'Landing Page', tall: true },
          ctaSection:      { mode: 'landing', cat: 'Landing Page', wide: true },
          faqAccordion:    { mode: 'landing', cat: 'Landing Page', tall: true },
          codeBlock:       { mode: 'landing', cat: 'Landing Page', wide: true },
          logoBar:         { mode: 'landing', cat: 'Landing Page' },

          // -- Card News --
          coverCard:       { mode: 'cardnews', cat: 'Card News', tall: true },
          bodyCard:        { mode: 'cardnews', cat: 'Card News', tall: true },
          dataCard:        { mode: 'cardnews', cat: 'Card News', tall: true },
          numberedCard:    { mode: 'cardnews', cat: 'Card News', tall: true },
          quoteCard:       { mode: 'cardnews', cat: 'Card News', tall: true },
          statCard:        { mode: 'cardnews', cat: 'Card News', tall: true },
          comparisonCard:  { mode: 'cardnews', cat: 'Card News', tall: true },
          checklistCard:   { mode: 'cardnews', cat: 'Card News', tall: true },
          stepCard:        { mode: 'cardnews', cat: 'Card News', tall: true },
          testimonialCard: { mode: 'cardnews', cat: 'Card News', tall: true },
          ctaCard:         { mode: 'cardnews', cat: 'Card News', tall: true },

          // -- Slide: Presentation --
          pitchCover:        { mode: 'slide', cat: '슬라이드 위젯', wide: true, tall: true },
          problemSlide:      { mode: 'slide', cat: '슬라이드 위젯', wide: true, tall: true },
          solutionSlide:     { mode: 'slide', cat: '슬라이드 위젯', wide: true, tall: true },
          metricHighlight:   { mode: 'slide', cat: '슬라이드 위젯', wide: true, tall: true },
          marketSlide:       { mode: 'slide', cat: '슬라이드 위젯', wide: true, tall: true },
          competitorMatrix:  { mode: 'slide', cat: '슬라이드 위젯', wide: true, tall: true },
          bizModelSlide:     { mode: 'slide', cat: '슬라이드 위젯', wide: true, tall: true },
          timelineSlide:     { mode: 'slide', cat: '슬라이드 위젯', wide: true, tall: true },
          teamSlide:         { mode: 'slide', cat: '슬라이드 위젯', wide: true, tall: true },
          askSlide:          { mode: 'slide', cat: '슬라이드 위젯', wide: true, tall: true },
          chainFlow:         { mode: 'slide', cat: '슬라이드 위젯', wide: true, tall: true },
          compareSlide:      { mode: 'slide', cat: '슬라이드 위젯', wide: true, tall: true },
        };

        /* -- Pitch deck frame helpers -- */
        function _pitchFrame(el: HTMLElement) {
          var frame = document.createElement('div');
          frame.className = 'pitch-slide-frame';
          el.appendChild(frame);
          return frame;
        }
        function _pitchScale(el: HTMLElement) {
          var frame = el.querySelector('.pitch-slide-frame') as HTMLElement;
          if (!frame) return;
          setTimeout(function() {
            var preview = el.closest('.sc-preview') as HTMLElement;
            var containerW = preview ? preview.clientWidth : (el.clientWidth || 400);
            var FRAME_W = 1240;
            var FRAME_H = FRAME_W * (210 / 297);
            var scale = containerW / FRAME_W;
            frame.style.transform = 'scale(' + scale.toFixed(6) + ')';
            el.style.height = (FRAME_H * scale) + 'px';
            el.style.overflow = 'hidden';
          }, 50);
        }

        /* -- Sample data for live previews -- */
        var SAMPLES: Record<string, (el: HTMLElement) => void> = {
          // -- Metrics --
          kpiCard:       function(el) { Maging.kpiCard(el, { label: '매출', value: '128억', delta: 8.3, compact: true, sparkline: [40,55,48,62,75,88] }); },
          heroTile:      function(el) { Maging.heroTile(el, { kicker: 'Q2', value: '512억', tagline: '+18% YoY' }); },
          metricChart:   function(el) { Maging.metricChart(el, { label: '매출 추이', value: '128억', delta: 8.3, categories: ['1월','2월','3월','4월','5월','6월'], series: [{ name: '올해', data: [72,78,81,88,91,128] }] }); },
          metricStack:   function(el) { Maging.metricStack(el, { title: '요약', main: { label: '매출', value: '128억', delta: 8.3 }, items: [{ label: '목표', value: '150억' }, { label: '달성률', value: '85%' }] }); },
          compareCard:   function(el) { Maging.compareCard(el, { title: '전월비교', left: { label: '이번달', value: '128억' }, right: { label: '지난달', value: '118억' }, delta: 8.5 }); },
          countdownTile: function(el) { Maging.countdownTile(el, { title: '출시까지', target: new Date(Date.now() + 86400000 * 14).toISOString(), label: 'D-Day' }); },
          ringProgress:  function(el) { Maging.ringProgress(el, { value: 85, max: 100, unit: '%', label: '달성률', thresholds: [[0.8,'success'],[0.5,'warning'],[0,'danger']] }); },
          bulletChart:   function(el) { Maging.bulletChart(el, { value: 78, target: 90, max: 100, unit: '%' }); },

          // -- Charts --
          lineChart:     function(el) { Maging.lineChart(el, { categories: ['1월','2월','3월','4월','5월','6월'], series: [{ name: '매출', data: [12,14,13,16,18,21] }] }); },
          barChart:      function(el) { Maging.barChart(el, { items: [{ label: '영업', value: 45 },{ label: '마케팅', value: 32 },{ label: '개발', value: 68 },{ label: 'CS', value: 21 }] }); },
          donutChart:    function(el) { Maging.donutChart(el, { slices: [{ label: '모바일', value: 60 },{ label: '웹', value: 30 },{ label: '기타', value: 10 }] }); },
          funnelChart:   function(el) { Maging.funnelChart(el, { stages: [{ label: '방문', value: 1000 },{ label: '가입', value: 600 },{ label: '구매', value: 200 }] }); },
          gaugeChart:    function(el) { Maging.gaugeChart(el, { label: '성능', value: 78, max: 100, unit: '%' }); },
          radarChart:    function(el) { Maging.radarChart(el, { indicators: [{ name: 'A', max: 100 },{ name: 'B', max: 100 },{ name: 'C', max: 100 },{ name: 'D', max: 100 },{ name: 'E', max: 100 }], series: [{ name: '팀', data: [80,90,70,85,75] }] }); },
          treemapChart:  function(el) { Maging.treemapChart(el, { items: [{ name: '서울', value: 45 },{ name: '경기', value: 30 },{ name: '부산', value: 15 },{ name: '기타', value: 10 }] }); },
          scatterChart:  function(el) { Maging.scatterChart(el, { xLabel: '비용', yLabel: '매출', points: [{x:10,y:20,label:'A'},{x:15,y:28,label:'B'},{x:20,y:35,label:'C'},{x:25,y:40,label:'D'},{x:30,y:52,label:'E'}] }); },
          sankeyChart:   function(el) { Maging.sankeyChart(el, { nodes: [{ name: '유입' },{ name: '가입' },{ name: '구매' },{ name: '이탈' }], links: [{ source: '유입', target: '가입', value: 60 },{ source: '유입', target: '이탈', value: 40 },{ source: '가입', target: '구매', value: 30 },{ source: '가입', target: '이탈', value: 30 }] }); },
          heatmapChart:  function(el) { Maging.heatmapChart(el, { xAxis: ['월','화','수','목','금'], yAxis: ['오전','오후','저녁'], values: [[0,0,5],[1,0,7],[2,0,3],[3,0,8],[4,0,6],[0,1,10],[1,1,8],[2,1,12],[3,1,9],[4,1,7],[0,2,3],[1,2,4],[2,2,6],[3,2,5],[4,2,2]] }); },
          waterfallChart: function(el) { Maging.waterfallChart(el, { items: [{ label: '매출', value: 100, type: 'start' },{ label: '원가', value: -40 },{ label: '영업비', value: -25 },{ label: '영업이익', value: 35, type: 'total' }] }); },

          // -- Lists --
          leaderboard:   function(el) { Maging.leaderboard(el, { items: [{ name: '김철수', meta: '95점', percent: 95 },{ name: '이영희', meta: '88점', percent: 88 },{ name: '박민수', meta: '76점', percent: 76 }] }); },
          activityTable: function(el) { Maging.activityTable(el, { columns: [{ label: '시간', key: 'time' },{ label: '이벤트', key: 'event' },{ label: '상태', key: 'status' }], rows: [{ time: '10:00', event: '배포', status: '성공' },{ time: '09:30', event: '테스트', status: '성공' }] }); },
          timeline:      function(el) { Maging.timeline(el, { items: [{ time: '10:00', text: '배포 완료' },{ time: '09:30', text: '테스트 통과' },{ time: '09:00', text: 'PR 생성' }] }); },
          inboxPreview:  function(el) { Maging.inboxPreview(el, { items: [{ text: '배포가 완료되었습니다.', time: '방금' },{ text: '리뷰를 요청합니다.', time: '1시간 전' }] }); },
          statusGrid:    function(el) { Maging.statusGrid(el, { columns: 4, items: [{ label: 'API', status: 'ok' },{ label: 'DB', status: 'ok' },{ label: 'CDN', status: 'warn' },{ label: 'Auth', status: 'ok' }] }); },
          sparklineList: function(el) { Maging.sparklineList(el, { items: [{ label: '매출', value: '128억', delta: 8.3, sparkline: [40,55,48,62,75,88] },{ label: 'DAU', value: '48K', delta: 12, sparkline: [30,32,35,38,42,48] }] }); },

          // -- Calendar & Progress --
          calendarHeatmap: function(el) { var v: [string, number][] = []; var now = Date.now(); for (var i=0;i<120;i++) { v.push([new Date(now - i*86400000).toISOString().slice(0,10), Math.floor(Math.random()*10)]); } Maging.calendarHeatmap(el, { values: v }); },
          eventCalendar: function(el) { Maging.eventCalendar(el, { title: '4월 릴리스 · 일정', subtitle: '배포 · 점검 · 마일스톤', year: 2026, month: 4, showList: true, events: [{ date: '2026-04-03', label: 'v2.4.0 정기 배포', type: 'ok' },{ date: '2026-04-07', label: 'SRE 인프라 점검', type: 'warning' },{ date: '2026-04-10', label: 'Q1 리뷰 미팅' },{ date: '2026-04-15', label: '보안 패치', type: 'danger' },{ date: '2026-04-22', label: '빌링 API 통합 데모' },{ date: '2026-04-30', label: '빌링센터 개발 마감', type: 'accent' }] }); },
          progressStepper: function(el) { Maging.progressStepper(el, { steps: [{ label: '기획', status: 'done' },{ label: '개발', status: 'active' },{ label: '배포', status: 'pending' }] }); },
          goalGrid:      function(el) { Maging.goalGrid(el, { items: [{ label: '매출', value: 128, max: 150, unit: '억' },{ label: 'NPS', value: 68, max: 80, unit: '점' }] }); },

          // -- Layout --
          pageHeader:    function(el) { Maging.pageHeader(el, { kicker: 'DASHBOARD', title: '운영 현황', subtitle: '실시간 모니터링' }); },
          sectionHead:   function(el) { Maging.sectionHead(el, { index: '01', kicker: 'OVERVIEW', title: '핵심 지표', tag: 'Live' }); },
          alertBanner:   function(el) { Maging.alertBanner(el, { type: 'success', title: '배포 완료', message: 'v2.4.1' }); },
          ragChip:       function(el) { el.innerHTML = '<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:12px"></div>'; var box = el.firstChild as HTMLElement; ['green','yellow','red','gray'].forEach(function(s, i){ var d = document.createElement('span'); box.appendChild(d); Maging.ragChip(d, { label: ['플로우 AI 관심','검토 중','이탈 위험','초기 컨택'][i], status: s }); }); },
          shareBar:      function(el) { el.innerHTML = '<div style="padding:16px"></div>'; Maging.shareBar(el.firstChild, { segments: [{ label: '추천자', value: 54, status: 'green', sub: '9~10점' },{ label: '중립자', value: 24, status: 'gray', sub: '7~8점' },{ label: '비추천', value: 22, status: 'red', sub: '0~6점' }] }); },
          defCard: function(el) {
            Maging.defCard(el, { title: 'NPS 정의', subtitle: 'Net Promoter Score · 분기별', rows: [{ key: '정의', value: '"우리 서비스를 동료에게 추천하시겠습니까?" → 충성도·성장 잠재력' }, { key: '측정', value: '1~10점 form, 분기별 발송' }, { key: '담당', value: '박진웅 · 1차 발송 완료' }] });
          },
          insightCard: function(el) {
            Maging.insightCard(el, { title: 'KDB생명보험', meta: '180인', tag: 'AM · 박수연', status: 'yellow', bullets: ['5월 계약 클로징 목표 — 법무 검토 완료 대기', '사용자 범위 확대 협의 중'], highlight: '계약서 최종본 4/30 수령 예정. 기한 내 서명 필요.' });
          },
          monthlyTable: function(el) {
            el.style.minWidth = '1000px';
            Maging.monthlyTable(el, {
              title: '월별 매출', sub: '2026년',
              rows: [
                { name: '신규', data: [99,175,142,223,290,248,385,332,227,173,479,227].map(function(v: number){return v*1e6;}) },
                { name: '기고객', data: [522,685,523,633,567,641,653,545,547,539,660,532].map(function(v: number){return v*1e6;}) },
              ],
              summaryRow: '합계', unitToggle: true, viewToggle: true, defaultUnit: '만원',
            });
          },
          sectionCover:  function(el) { Maging.sectionCover(el, { style: 'classic', kicker: 'WEEKLY REPORT · 4월 4주차', title: 'SaaS 주간보고', subtitle: 'SaaS B/U · Enterprise B/U', brand: 'flow.team', meta: '기준일 2026.04.27(월)' }); },

          // -- Specialized --
          mapChart:      function(el) { Maging.mapChart(el, { items: [{ region: '서울', value: 45 },{ region: '경기', value: 30 },{ region: '부산', value: 15 },{ region: '인천', value: 20 },{ region: '대구', value: 18 }] }); },
          cohortMatrix:  function(el) { Maging.cohortMatrix(el, { cohorts: ['1월','2월','3월'], periods: ['M0','M1','M2'], data: [[100,60,40],[100,55,35],[100,58,null]] }); },

          // -- Landing --
          stepGuide:       function(el) { Maging.stepGuide(el, { steps: [{ title: 'CDN 추가', desc: 'script 태그 한 줄이면 됩니다.', code: '<script src="maging.js"><\/script>' },{ title: '위젯 마운트', desc: 'HTML에 div 하나, JS로 호출.', code: 'Maging.kpiCard("#el", { ... });' },{ title: '테마 변경', desc: '35개 브랜드 테마 즉시 전환.' }] }); },
          codeBlock:       function(el) { Maging.codeBlock(el, { lang: 'html', code: '<link rel="stylesheet" href="maging.css">\n<script src="maging.js"><\/script>\n\n<div id="chart"></div>\n<script>\n  Maging.lineChart("#chart", {\n    categories: ["1월","2월","3월"],\n    series: [{ name: "매출", data: [10,15,22] }]\n  });\n<\/script>' }); },
          comparisonTable: function(el) { Maging.comparisonTable(el, { columns: ['maging','Recharts','Chart.js'], highlight: 0, rows: [{ label: '빌드 불필요', values: [true,false,false] },{ label: '35 테마', values: [true,false,false] },{ label: 'CDN 한 줄', values: [true,false,true] },{ label: 'LLM 최적화', values: [true,false,false] }] }); },
          heroSection:     function(el) { Maging.heroSection(el, { kicker: 'SaaS', title: '제목입니다', subtitle: '설명입니다.', ctas: [{ label: '시작하기', primary: true }], padding: '2rem 1rem' }); },
          featureGrid:     function(el) { Maging.featureGrid(el, { cols: 2, items: [{ icon: '\u21AF', title: '빠른 속도', desc: '설명' },{ icon: '\u2298', title: '보안', desc: '설명' }] }); },
          pricingTable:    function(el) { Maging.pricingTable(el, { plans: [{ name: 'Free', price: '무료', features: ['기능 1'], cta: { label: '시작' } },{ name: 'Pro', price: '9.9만', popular: true, badge: '인기', features: ['기능 1','기능 2'], cta: { label: '시작' } }] }); },
          testimonialGrid: function(el) { Maging.testimonialGrid(el, { cols: 1, items: [{ quote: '정말 좋습니다.', name: '김철수', role: 'PM' }] }); },
          logoBar:         function(el) { Maging.logoBar(el, { items: [{ name: 'Kakao' },{ name: 'Toss' },{ name: 'LINE' }] }); },
          ctaSection:      function(el) { Maging.ctaSection(el, { title: '시작하세요', desc: '무료 체험', ctas: [{ label: '시작', primary: true }], padding: '2rem 1rem' }); },
          faqAccordion:    function(el) { Maging.faqAccordion(el, { items: [{ q: 'CDN으로 바로 쓸 수 있나요?', a: '네, script 태그 한 줄이면 됩니다.' }, { q: '테마 변경은 어떻게 하나요?', a: 'Maging.setTheme() 호출로 즉시 전환됩니다.' }, { q: 'React에서도 사용 가능한가요?', a: '네, useEffect 안에서 마운트하면 됩니다.' }] }); },

          // -- Card News --
          coverCard:     function(el) { Maging.coverCard(el, { icon: '\uD83D\uDE80', tag: 'AI 트렌드', title: 'AI가 바꿀\n마케팅의 미래', subtitle: '마케터가 알아야 할 5가지', brand: '@maging.page', style: 'gradient' }); },
          bodyCard:      function(el) { Maging.bodyCard(el, { num: '01', icon: '\uD83C\uDFAF', heading: '초개인화 콘텐츠 자동 생성', text: 'AI가 고객 세그먼트별로 맞춤 콘텐츠를 실시간으로 만들어줍니다.', brand: '@maging.page' }); },
          dataCard:      function(el) { Maging.dataCard(el, { label: 'GLOBAL TREND', title: 'AI 마케팅 도입률 추이', widget: 'barChart', widgetConfig: { items: [{label:'2022',value:18},{label:'2023',value:31},{label:'2024',value:47},{label:'2025',value:63},{label:'2026',value:78}], yFormatter: function(v: number){return v+'%';} }, brand: '@maging.page' }); },
          numberedCard:  function(el) { Maging.numberedCard(el, { heading: 'AI 마케팅 도구 TOP 3', items: [{ rank: '1', title: 'ChatGPT / Claude', desc: '콘텐츠 초안, 카피라이팅', icon: '\uD83E\uDD16' },{ rank: '2', title: 'Midjourney / DALL-E', desc: '비주얼 생성', icon: '\uD83D\uDDBC\uFE0F' },{ rank: '3', title: 'HubSpot AI', desc: '리드 스코어링', icon: '\uD83D\uDCC8' }], brand: '@maging.page' }); },
          quoteCard:     function(el) { Maging.quoteCard(el, { quote: '콘텐츠의 미래는 AI가 만들고 사람이 다듬는 것이다.', name: '김민수', role: 'CMO, TechCorp', brand: '@maging.page' }); },
          statCard:      function(el) { Maging.statCard(el, { label: 'GLOBAL ADOPTION', value: '73<span class="mw-unit">%</span>', context: '글로벌 기업의 73%가 AI 마케팅을 도입했습니다', brand: '@maging.page' }); },
          comparisonCard: function(el) { Maging.comparisonCard(el, { heading: 'AI 마케팅 Do & Don\'t', leftLabel: 'Don\'t', rightLabel: 'Do', left: ['감에 의존한 타겟팅', '일괄 메시지 발송', '수동 A/B 테스트'], right: ['데이터 기반 세그먼트', '개인화 콘텐츠', '자동 최적화'], brand: '@maging.page' }); },
          checklistCard: function(el) { Maging.checklistCard(el, { heading: 'AI 마케팅 시작 전 체크리스트', items: [{ text: '고객 데이터 정리 완료', done: true },{ text: '핵심 KPI 설정', done: true },{ text: 'AI 도구 선정', done: false },{ text: '파일럿 캠페인 설계', done: false }], brand: '@maging.page' }); },
          stepCard:      function(el) { Maging.stepCard(el, { step: '01', heading: '고객 세그먼트 분석', text: '기존 고객 데이터에서 행동 패턴을 추출하고 클러스터링합니다.', tip: '최소 3개월 이상의 데이터를 사용하세요', brand: '@maging.page' }); },
          testimonialCard: function(el) { Maging.testimonialCard(el, { quote: '도입 3개월 만에 마케팅 비용이 40% 절감됐습니다.', name: '이수진', role: '마케팅 팀장, ABC Corp', stars: 5, brand: '@maging.page' }); },
          ctaCard:       function(el) { Maging.ctaCard(el, { heading: '더 많은 AI 마케팅 팁이\n궁금하다면?', subtext: '팔로우하고 매주 새로운 트렌드를 받아보세요', ctas: [{ label: '팔로우하기', primary: true }], handles: [{ platform: 'Instagram', handle: '@maging.page' }], brand: '@maging.page' }); },

          // -- Pitch Deck --
          pitchCover:       function(el) { var f = _pitchFrame(el); Maging.pitchCover(f, { company: 'Acme Corp', tagline: '혁신을 가속하는 AI 플랫폼', logo: '\u25C6', subtitle: 'Series A \u00B7 2026', style: 'bold' }); _pitchScale(el); },
          problemSlide:     function(el) { var f = _pitchFrame(el); Maging.problemSlide(f, { headline: '기업의 78%가 보고서 제작에 주당 8시간 이상 소비합니다', points: [{ icon: '\u23F1\uFE0F', title: '반복 개발', desc: '같은 차트를 매번 처음부터 코딩' },{ icon: '\uD83C\uDFA8', title: '디자인 파편화', desc: '팀마다 다른 UI, 브랜드 불일치' },{ icon: '\uD83D\uDCB8', title: '과도한 비용', desc: 'BI 도구 라이선스 연 $50K+' }], highlight: '연간 개발자 1인당 320시간 낭비' }); _pitchScale(el); },
          solutionSlide:    function(el) { var f = _pitchFrame(el); Maging.solutionSlide(f, { headline: '프롬프트 한 줄로 프로덕션급 결과물 즉시 생성', before: { label: 'Before', items: ['2주 개발 사이클', '디자이너 필요', 'BI 라이선스 $50K/yr'] }, after: { label: 'After', items: ['30초 생성', '105개 테마 내장', 'CDN 무료'] } }); _pitchScale(el); },
          metricHighlight:  function(el) { var f = _pitchFrame(el); Maging.metricHighlight(f, { metrics: [{ value: '37', unit: '개', label: '위젯 컴포넌트' },{ value: '105', unit: '개', label: '브랜드 테마' },{ value: '30', unit: '초', label: '생성 시간' }] }); _pitchScale(el); },
          marketSlide:      function(el) { var f = _pitchFrame(el); Maging.marketSlide(f, { headline: 'AI Report Generation 시장', tam: { value: '$30B', label: 'TAM \u00B7 글로벌 BI' }, sam: { value: '$8B', label: 'SAM \u00B7 리포팅 자동화' }, som: { value: '$500M', label: 'SOM \u00B7 AI 리포트 생성' }, insight: 'CAGR 23%', sources: ['Gartner 2025'] }); _pitchScale(el); },
          competitorMatrix: function(el) { var f = _pitchFrame(el); Maging.competitorMatrix(f, { headline: '포지셔닝', axisX: { label: '유연성', low: '고정', high: '유연' }, axisY: { label: '속도', low: '수동', high: 'AI' }, players: [{ name: 'Us', x: 80, y: 95, highlight: true },{ name: 'Tableau', x: 85, y: 15 },{ name: 'Retool', x: 65, y: 35 }] }); _pitchScale(el); },
          bizModelSlide:    function(el) { var f = _pitchFrame(el); Maging.bizModelSlide(f, { headline: '수익 모델', tiers: [{ name: 'Free', price: '$0', features: ['CDN 접근', '기본 테마'] },{ name: 'Pro', price: '$29', period: '/월', features: ['전체 테마', '우선 지원'], popular: true },{ name: 'Enterprise', price: 'Custom', features: ['SSO', 'SLA 99.9%'] }], note: 'Land & Expand' }); _pitchScale(el); },
          timelineSlide:    function(el) { var f = _pitchFrame(el); Maging.timelineSlide(f, { headline: '로드맵', milestones: [{ date: '2025 Q4', title: 'MVP', done: true },{ date: '2026 Q1', title: '확장', done: true },{ date: '2026 Q2', title: '현재', active: true },{ date: '2026 H2', title: '엔터프라이즈' }] }); _pitchScale(el); },
          teamSlide:        function(el) { var f = _pitchFrame(el); Maging.teamSlide(f, { headline: '팀', members: [{ name: '유민호', role: 'CEO', exp: 'B2B SaaS 10년' },{ name: '김개발', role: 'CTO', exp: '전 토스 프론트엔드' }] }); _pitchScale(el); },
          askSlide:         function(el) { var f = _pitchFrame(el); Maging.askSlide(f, { headline: 'Series A \u00B7 \u20A930억', useOfFunds: [{ label: '엔지니어링', pct: 50 },{ label: 'GTM', pct: 30 },{ label: '운영', pct: 20 }], milestones: ['ARR \u20A910억', '고객 30사', '글로벌 진출'], contact: { email: 'hello@acme.io', website: 'acme.io' } }); _pitchScale(el); },
          chainFlow:        function(el) { var f = _pitchFrame(el); Maging.chainFlow(f, { headline: '가치 체인 \u2014 3단 전달 구조', steps: [{ label: 'OUR PLATFORM', title: 'AI로 만든다', desc: '콘텐츠 생성 + 분석', accent: true },{ label: '무장시킴', title: '직원이 강해진다', desc: '영업\u00B7마케팅 역량 증폭' },{ label: '사로잡음', title: '고객이 찾아온다', desc: '매출 성장으로 직결' }] }); _pitchScale(el); },
          compareSlide:     function(el) { var f = _pitchFrame(el); Maging.compareSlide(f, { headline: '왜 이 전략이 강력한가', left: { label: '기존 접근', rows: [{ key: '프레이밍', value: '업무 효율화' },{ key: '도입 근거', value: '비용 절감' },{ key: 'KPI', value: '사용률' },{ key: '지속성', value: '낮음' }] }, right: { label: '새로운 접근', rows: [{ key: '프레이밍', value: '매출 성장' },{ key: '도입 근거', value: '매출 기여' },{ key: 'KPI', value: '고객 반응, 매출' },{ key: '지속성', value: '높음' }] }, note: '비용 절감이 아니라 매출 성장으로 프레이밍하면 경영진이 움직인다.' }); _pitchScale(el); },
        };

        /* ============================================================
         * Code samples
         * ============================================================ */
        var CODE: Record<string, string> = {
          kpiCard:       "const config = {\n  label: '\uB9E4\uCD9C',\n  value: '128\uC5B5',\n  delta: 8.3,\n  compact: true,\n  sparkline: [40, 55, 48, 62, 75, 88]\n};\n\nMaging.kpiCard('#el', config);",
          heroTile:      "const config = {\n  kicker: 'Q2 2026',\n  value: '512\uC5B5',\n  tagline: '+18% YoY',\n  stats: [\n    { label: '\uC804\uB144', value: '210\uC5B5' },\n    { label: 'MRR', value: '42.7\uC5B5' }\n  ]\n};\n\nMaging.heroTile('#el', config);",
          metricChart:   "const config = {\n  label: '\uB9E4\uCD9C \uCD94\uC774',\n  value: '128\uC5B5',\n  delta: 8.3,\n  categories: ['1\uC6D4','2\uC6D4','3\uC6D4','4\uC6D4','5\uC6D4','6\uC6D4'],\n  series: [\n    { name: '\uC62C\uD574', data: [72, 78, 81, 88, 91, 128] }\n  ]\n};\n\nMaging.metricChart('#el', config);",
          metricStack:   "const config = {\n  title: '\uB9E4\uCD9C \uC694\uC57D',\n  main: { label: '\uB9E4\uCD9C', value: '128\uC5B5', delta: 8.3 },\n  items: [\n    { label: '\uBAA9\uD45C', value: '150\uC5B5' },\n    { label: '\uB2EC\uC131\uB960', value: '85%' }\n  ]\n};\n\nMaging.metricStack('#el', config);",
          compareCard:   "const config = {\n  title: '\uC804\uC6D4 \uBE44\uAD50',\n  left: { label: '\uC774\uBC88\uB2EC', value: '128\uC5B5' },\n  right: { label: '\uC9C0\uB09C\uB2EC', value: '118\uC5B5' },\n  delta: 8.5\n};\n\nMaging.compareCard('#el', config);",
          countdownTile: "const config = {\n  title: '\uCD9C\uC2DC\uAE4C\uC9C0',\n  target: '2026-06-01T00:00:00',\n  label: 'D-Day'\n};\n\nMaging.countdownTile('#el', config);",
          ringProgress:  "const config = {\n  value: 85, max: 100,\n  unit: '%', label: '\uB2EC\uC131\uB960',\n  thresholds: [\n    [0.8, 'success'],\n    [0.5, 'warning'],\n    [0, 'danger']\n  ]\n};\n\nMaging.ringProgress('#el', config);",
          bulletChart:   "const config = {\n  value: 78,\n  target: 90,\n  max: 100,\n  unit: '%'\n};\n\nMaging.bulletChart('#el', config);",
          lineChart:     "const config = {\n  categories: ['1\uC6D4','2\uC6D4','3\uC6D4','4\uC6D4','5\uC6D4','6\uC6D4'],\n  series: [\n    { name: '\uB9E4\uCD9C', data: [12, 14, 13, 16, 18, 21] }\n  ]\n};\n\nMaging.lineChart('#el', config);",
          barChart:      "const config = {\n  items: [\n    { label: '\uC601\uC5C5', value: 45 },\n    { label: '\uB9C8\uCF00\uD305', value: 32 },\n    { label: '\uAC1C\uBC1C', value: 68 },\n    { label: 'CS', value: 21 }\n  ]\n};\n\nMaging.barChart('#el', config);",
          donutChart:    "const config = {\n  slices: [\n    { label: '\uBAA8\uBC14\uC77C', value: 60 },\n    { label: '\uC6F9', value: 30 },\n    { label: '\uAE30\uD0C0', value: 10 }\n  ]\n};\n\nMaging.donutChart('#el', config);",
          funnelChart:   "const config = {\n  stages: [\n    { label: '\uBC29\uBB38', value: 1000 },\n    { label: '\uAC00\uC785', value: 600 },\n    { label: '\uAD6C\uB9E4', value: 200 }\n  ]\n};\n\nMaging.funnelChart('#el', config);",
          gaugeChart:    "const config = {\n  label: '\uC131\uB2A5',\n  value: 78,\n  max: 100,\n  unit: '%'\n};\n\nMaging.gaugeChart('#el', config);",
          radarChart:    "const config = {\n  indicators: [\n    { name: 'A', max: 100 },\n    { name: 'B', max: 100 },\n    { name: 'C', max: 100 }\n  ],\n  series: [\n    { name: '\uD300', data: [80, 90, 70] }\n  ]\n};\n\nMaging.radarChart('#el', config);",
          treemapChart:  "const config = {\n  items: [\n    { name: '\uC11C\uC6B8', value: 45 },\n    { name: '\uACBD\uAE30', value: 30 },\n    { name: '\uBD80\uC0B0', value: 15 }\n  ]\n};\n\nMaging.treemapChart('#el', config);",
          scatterChart:  "const config = {\n  xLabel: '\uBE44\uC6A9', yLabel: '\uB9E4\uCD9C',\n  points: [\n    { x: 10, y: 20, label: 'A' },\n    { x: 15, y: 28, label: 'B' },\n    { x: 20, y: 35, label: 'C' }\n  ]\n};\n\nMaging.scatterChart('#el', config);",
          sankeyChart:   "const config = {\n  nodes: [\n    { name: '\uC720\uC785' },\n    { name: '\uAC00\uC785' },\n    { name: '\uAD6C\uB9E4' }\n  ],\n  links: [\n    { source: '\uC720\uC785', target: '\uAC00\uC785', value: 60 },\n    { source: '\uAC00\uC785', target: '\uAD6C\uB9E4', value: 30 }\n  ]\n};\n\nMaging.sankeyChart('#el', config);",
          heatmapChart:  "const config = {\n  xAxis: ['\uC6D4','\uD654','\uC218','\uBAA9','\uAE08'],\n  yAxis: ['\uC624\uC804','\uC624\uD6C4','\uC800\uB141'],\n  values: [[0,0,5],[1,0,7],[2,0,3]]\n};\n\nMaging.heatmapChart('#el', config);",
          waterfallChart:"const config = {\n  items: [\n    { label: '\uB9E4\uCD9C', value: 100, type: 'start' },\n    { label: '\uC6D0\uAC00', value: -40 },\n    { label: '\uC601\uC5C5\uC774\uC775', value: 35, type: 'total' }\n  ]\n};\n\nMaging.waterfallChart('#el', config);",
          leaderboard:   "const config = {\n  items: [\n    { name: '\uAE40\uCCA0\uC218', meta: '95\uC810', percent: 95 },\n    { name: '\uC774\uC601\uD76C', meta: '88\uC810', percent: 88 }\n  ]\n};\n\nMaging.leaderboard('#el', config);",
          activityTable: "const config = {\n  columns: [\n    { label: '\uC2DC\uAC04', key: 'time' },\n    { label: '\uC774\uBCA4\uD2B8', key: 'event' }\n  ],\n  rows: [\n    { time: '10:00', event: '\uBC30\uD3EC \uC644\uB8CC' }\n  ]\n};\n\nMaging.activityTable('#el', config);",
          timeline:      "const config = {\n  items: [\n    { time: '10:00', text: '\uBC30\uD3EC \uC644\uB8CC' },\n    { time: '09:30', text: '\uD14C\uC2A4\uD2B8 \uD1B5\uACFC' }\n  ]\n};\n\nMaging.timeline('#el', config);",
          inboxPreview:  "const config = {\n  items: [\n    { text: '\uBC30\uD3EC\uAC00 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.', time: '\uBC29\uAE08' },\n    { text: '\uB9AC\uBDF0\uB97C \uC694\uCCAD\uD569\uB2C8\uB2E4.', time: '1\uC2DC\uAC04 \uC804' }\n  ]\n};\n\nMaging.inboxPreview('#el', config);",
          statusGrid:    "const config = {\n  columns: 4,\n  items: [\n    { label: 'API', status: 'ok' },\n    { label: 'DB', status: 'ok' },\n    { label: 'CDN', status: 'warn' }\n  ]\n};\n\nMaging.statusGrid('#el', config);",
          sparklineList: "const config = {\n  items: [\n    { label: '\uB9E4\uCD9C', value: '128\uC5B5', delta: 8.3,\n      sparkline: [40, 55, 48, 62, 75, 88] }\n  ]\n};\n\nMaging.sparklineList('#el', config);",
          calendarHeatmap:"const config = {\n  values: [\n    ['2026-04-01', 5],\n    ['2026-04-02', 8],\n    ['2026-04-03', 3]\n  ]\n};\n\nMaging.calendarHeatmap('#el', config);",
          eventCalendar: "const config = {\n  title: '4\uC6D4 \uB9B4\uB9AC\uC2A4 \u00B7 \uC77C\uC815',\n  subtitle: '\uBC30\uD3EC \u00B7 \uC810\uAC80 \u00B7 \uB9C8\uC77C\uC2A4\uD1A4',\n  year: 2026,\n  month: 4,\n  showList: true,\n  events: [\n    { date: '2026-04-03', label: 'v2.4.0 \uC815\uAE30 \uBC30\uD3EC', type: 'ok' },\n    { date: '2026-04-07', label: 'SRE \uC778\uD504\uB77C \uC810\uAC80', type: 'warning' },\n    { date: '2026-04-15', label: '\uBCF4\uC548 \uD328\uCE58', type: 'danger' },\n    { date: '2026-04-22', label: '\uBE4C\uB9C1 API \uD1B5\uD569 \uB370\uBAA8' },\n    { date: '2026-04-30', label: '\uBE4C\uB9C1\uC13C\uD130 \uAC1C\uBC1C \uB9C8\uAC10', type: 'accent' },\n  ],\n};\n\nMaging.eventCalendar('#el', config);",
          progressStepper:"const config = {\n  steps: [\n    { label: '\uAE30\uD68D', status: 'done' },\n    { label: '\uAC1C\uBC1C', status: 'active' },\n    { label: '\uBC30\uD3EC', status: 'pending' }\n  ]\n};\n\nMaging.progressStepper('#el', config);",
          goalGrid:      "const config = {\n  items: [\n    { label: '\uB9E4\uCD9C', value: 128, max: 150, unit: '\uC5B5' },\n    { label: 'NPS', value: 68, max: 80, unit: '\uC810' }\n  ]\n};\n\nMaging.goalGrid('#el', config);",
          pageHeader:    "const config = {\n  kicker: 'DASHBOARD',\n  title: '\uC6B4\uC601 \uD604\uD669',\n  subtitle: '\uC2E4\uC2DC\uAC04 \uBAA8\uB2C8\uD130\uB9C1'\n};\n\nMaging.pageHeader('#el', config);",
          sectionHead:   "const config = {\n  index: '01',\n  kicker: 'OVERVIEW',\n  title: '\uD575\uC2EC \uC9C0\uD45C',\n  tag: 'Live'\n};\n\nMaging.sectionHead('#el', config);",
          alertBanner:   "const config = {\n  type: 'success',\n  title: '\uBC30\uD3EC \uC644\uB8CC',\n  message: 'v2.4.1'\n};\n\nMaging.alertBanner('#el', config);",
          mapChart:      "const config = {\n  items: [\n    { region: '\uC11C\uC6B8', value: 45 },\n    { region: '\uACBD\uAE30', value: 30 },\n    { region: '\uBD80\uC0B0', value: 15 }\n  ]\n};\n\nMaging.mapChart('#el', config);",
          cohortMatrix:  "const config = {\n  cohorts: ['1\uC6D4','2\uC6D4','3\uC6D4'],\n  periods: ['M0','M1','M2'],\n  data: [\n    [100, 60, 40],\n    [100, 55, 35],\n    [100, 58, null]\n  ]\n};\n\nMaging.cohortMatrix('#el', config);",
          sectionCover: "const config = {\n  style: 'classic',\n  kicker: 'WEEKLY REPORT \u00B7 4\uC6D4 4\uC8FC\uCC28',\n  title: 'SaaS \uC8FC\uAC04\uBCF4\uACE0',\n  subtitle: 'SaaS B/U \u00B7 Enterprise B/U',\n  brand: 'flow.team',\n  meta: '\uAE30\uC900\uC77C 2026.04.27(\uC6D4)',\n};\n\nMaging.sectionCover('#el', config);",
          defCard:       "const config = {\n  title: 'NPS \uC815\uC758',\n  subtitle: 'Net Promoter Score \u00B7 \uBD84\uAE30\uBCC4',\n  rows: [\n    { key: '\uC815\uC758', value: '\"\uC6B0\uB9AC \uC11C\uBE44\uC2A4\uB97C \uB3D9\uB8CC\uC5D0\uAC8C \uCD94\uCC9C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?\"' },\n    { key: '\uCE21\uC815', value: '1~10\uC810 form, \uBD84\uAE30\uBCC4 \uBC1C\uC1A1' },\n    { key: '\uB2F4\uB2F9', value: '\uBC15\uC9C4\uC6C5 \u00B7 1\uCC28 \uBC1C\uC1A1 \uC644\uB8CC' },\n  ],\n};\n\nMaging.defCard('#el', config);",
          insightCard:   "const config = {\n  title: 'KDB\uC0DD\uBA85\uBCF4\uD5D8',\n  meta: '180\uC778',\n  tag: 'AM \u00B7 \uBC15\uC218\uC5F0',\n  status: 'yellow',  // 'green' | 'yellow' | 'red'\n  bullets: [\n    '5\uC6D4 \uACC4\uC57D \uD074\uB85C\uC9D5 \uBAA9\uD45C \u2014 \uBC95\uBB34 \uAC80\uD1A0 \uC644\uB8CC \uB300\uAE30',\n    '\uC0AC\uC6A9\uC790 \uBC94\uC704 \uD655\uB300 \uD611\uC758 \uC911',\n  ],\n  highlight: '\uACC4\uC57D\uC11C \uCD5C\uC885\uBCF8 4/30 \uC218\uB839 \uC608\uC815. \uAE30\uD55C \uB0B4 \uC11C\uBA85 \uD544\uC694.',\n};\n\nMaging.insightCard('#el', config);",
          monthlyTable:  "const config = {\n  title: '\uC6D4\uBCC4 \uB9E4\uCD9C',\n  sub: '2026\uB144',\n  rows: [\n    { name: '\uC2E0\uADDC',   data: [99,175,142,223,290,248,385,332,227,173,479,227].map(v => v * 1e6) },\n    { name: '\uAE30\uACE0\uAC1D', data: [522,685,523,633,567,641,653,545,547,539,660,532].map(v => v * 1e6) },\n  ],\n  summaryRow: '\uD569\uACC4',\n  unitToggle: true,\n  viewToggle: true,\n  defaultUnit: '\uB9CC\uC6D0',\n};\n\nMaging.monthlyTable('#el', config);",
          stepGuide:     "const config = {\n  steps: [\n    { title: 'CDN \uCD94\uAC00',\n      desc: 'script \uD0DC\uADF8 \uD55C \uC904\uC774\uBA74 \uB429\uB2C8\uB2E4.',\n      code: '<script src=\"maging.js\"><\\/script>' },\n    { title: '\uC704\uC82F \uB9C8\uC6B4\uD2B8',\n      desc: 'HTML\uC5D0 div \uD558\uB098, JS\uB85C \uD638\uCD9C.' },\n    { title: '\uD14C\uB9C8 \uBCC0\uACBD',\n      desc: '35\uAC1C \uD14C\uB9C8 \uC989\uC2DC \uC804\uD658.' }\n  ]\n};\n\nMaging.stepGuide('#el', config);",
          codeBlock:     "const config = {\n  lang: 'html',\n  code: '<div id=\"chart\"></div>\\n<script>\\n  Maging.lineChart(\"#chart\", { ... });\\n<\\/script>'\n};\n\nMaging.codeBlock('#el', config);",
          comparisonTable:"const config = {\n  columns: ['maging', 'Recharts', 'Chart.js'],\n  highlight: 0,\n  rows: [\n    { label: '\uBE4C\uB4DC \uBD88\uD544\uC694', values: [true, false, false] },\n    { label: '35 \uD14C\uB9C8', values: [true, false, false] },\n    { label: 'CDN \uD55C \uC904', values: [true, false, true] }\n  ]\n};\n\nMaging.comparisonTable('#el', config);",
          heroSection:   "const config = {\n  kicker: 'SaaS',\n  title: '\uC81C\uBAA9\uC785\uB2C8\uB2E4',\n  subtitle: '\uC124\uBA85\uC785\uB2C8\uB2E4.',\n  ctas: [\n    { label: '\uC2DC\uC791\uD558\uAE30', primary: true }\n  ]\n};\n\nMaging.heroSection('#el', config);",
          featureGrid:   "const config = {\n  cols: 3,\n  items: [\n    { icon: '\u21AF', title: '\uBE60\uB978 \uC18D\uB3C4', desc: '\uC124\uBA85' },\n    { icon: '\u2298', title: '\uBCF4\uC548', desc: '\uC124\uBA85' }\n  ]\n};\n\nMaging.featureGrid('#el', config);",
          pricingTable:  "const config = {\n  plans: [\n    { name: 'Free', price: '\uBB34\uB8CC',\n      features: ['\uAE30\uB2A5 1'],\n      cta: { label: '\uC2DC\uC791' } },\n    { name: 'Pro', price: '9.9\uB9CC',\n      popular: true, badge: '\uC778\uAE30',\n      features: ['\uAE30\uB2A5 1', '\uAE30\uB2A5 2'],\n      cta: { label: '\uC2DC\uC791' } }\n  ]\n};\n\nMaging.pricingTable('#el', config);",
          testimonialGrid:"const config = {\n  cols: 3,\n  items: [\n    { quote: '\uC815\uB9D0 \uC88B\uC2B5\uB2C8\uB2E4.',\n      name: '\uAE40\uCCA0\uC218', role: 'PM' }\n  ]\n};\n\nMaging.testimonialGrid('#el', config);",
          logoBar:       "const config = {\n  items: [\n    { name: 'Kakao' },\n    { name: 'Toss' },\n    { name: 'LINE' }\n  ]\n};\n\nMaging.logoBar('#el', config);",
          ctaSection:    "const config = {\n  title: '\uC2DC\uC791\uD558\uC138\uC694',\n  desc: '\uBB34\uB8CC \uCCB4\uD5D8',\n  ctas: [\n    { label: '\uC2DC\uC791', primary: true }\n  ]\n};\n\nMaging.ctaSection('#el', config);",
          faqAccordion:  "const config = {\n  items: [\n    { q: '\uC9C8\uBB38\uC785\uB2C8\uB2E4', a: '\uB2F5\uBCC0\uC785\uB2C8\uB2E4.' }\n  ]\n};\n\nMaging.faqAccordion('#el', config);",
          ragChip:       "// \uC0C1\uD0DC\uBCC4 RAG \uCE69\nconst statuses = ['green', 'yellow', 'red', 'gray'];\nconst labels = ['\uAD00\uC2EC', '\uAC80\uD1A0 \uC911', '\uC704\uD5D8', '\uCD08\uAE30'];\n\nstatuses.forEach((s, i) => {\n  Maging.ragChip('#chip-' + i, {\n    label: labels[i],\n    status: s\n  });\n});",
          shareBar:      "const config = {\n  segments: [\n    { label: '\uCD94\uCC9C\uC790', value: 54,\n      status: 'green', sub: '9~10\uC810' },\n    { label: '\uC911\uB9BD\uC790', value: 24,\n      status: 'gray', sub: '7~8\uC810' },\n    { label: '\uBE44\uCD94\uCC9C', value: 22,\n      status: 'red', sub: '0~6\uC810' }\n  ]\n};\n\nMaging.shareBar('#el', config);",
          quoteCard:     "const config = {\n  quote: '\uCF58\uD150\uCE20\uC758 \uBBF8\uB798\uB294 AI\uAC00 \uB9CC\uB4E4\uACE0\\n\uC0AC\uB78C\uC774 \uB2E4\uB4EC\uB294 \uAC83\uC774\uB2E4.',\n  name: '\uAE40\uBBFC\uC218',\n  role: 'CMO, TechCorp',\n  brand: '@mybrand'\n};\n\nMaging.quoteCard('#el', config);",
          statCard:      "const config = {\n  label: 'GLOBAL ADOPTION',\n  value: '73%',\n  context: '\uAE00\uB85C\uBC8C \uAE30\uC5C5\uC758 73%\uAC00\\nAI \uB9C8\uCF00\uD305\uC744 \uB3C4\uC785\uD588\uC2B5\uB2C8\uB2E4',\n  brand: '@mybrand'\n};\n\nMaging.statCard('#el', config);",
          comparisonCard:"const config = {\n  heading: 'AI \uB9C8\uCF00\uD305 Do & Don\\'t',\n  leftLabel: 'Don\\'t',\n  rightLabel: 'Do',\n  left: ['\uAC10\uC5D0 \uC758\uC874\uD55C \uD0C0\uAC9F\uD305', '\uC77C\uAD04 \uBC1C\uC1A1'],\n  right: ['\uB370\uC774\uD130 \uAE30\uBC18 \uC138\uADF8\uBA3C\uD2B8', '\uAC1C\uC778\uD654'],\n  brand: '@mybrand'\n};\n\nMaging.comparisonCard('#el', config);",
          checklistCard: "const config = {\n  heading: 'AI \uB9C8\uCF00\uD305 \uCCB4\uD06C\uB9AC\uC2A4\uD2B8',\n  items: [\n    { text: '\uACE0\uAC1D \uB370\uC774\uD130 \uC815\uB9AC', done: true },\n    { text: 'KPI \uC124\uC815', done: true },\n    { text: 'AI \uB3C4\uAD6C \uC120\uC815', done: false }\n  ],\n  brand: '@mybrand'\n};\n\nMaging.checklistCard('#el', config);",
          stepCard:      "const config = {\n  step: '01',\n  heading: '\uACE0\uAC1D \uC138\uADF8\uBA3C\uD2B8 \uBD84\uC11D',\n  text: '\uAE30\uC874 \uACE0\uAC1D \uB370\uC774\uD130\uC5D0\uC11C\\n\uD589\uB3D9 \uD328\uD134\uC744 \uCD94\uCD9C\uD569\uB2C8\uB2E4.',\n  tip: '\uCD5C\uC18C 3\uAC1C\uC6D4 \uB370\uC774\uD130 \uC0AC\uC6A9',\n  brand: '@mybrand'\n};\n\nMaging.stepCard('#el', config);",
          testimonialCard:"const config = {\n  quote: '\uB3C4\uC785 3\uAC1C\uC6D4 \uB9CC\uC5D0\\n\uB9C8\uCF00\uD305 \uBE44\uC6A9 40% \uC808\uAC10.',\n  name: '\uC774\uC218\uC9C4',\n  role: '\uB9C8\uCF00\uD305 \uD300\uC7A5, ABC Corp',\n  stars: 5,\n  brand: '@mybrand'\n};\n\nMaging.testimonialCard('#el', config);",
          coverCard:     "const config = {\n  icon: '\uD83D\uDE80',\n  tag: 'AI \uD2B8\uB80C\uB4DC',\n  title: 'AI\uAC00 \uBC14\uAFC0\\n\uB9C8\uCF00\uD305\uC758 \uBBF8\uB798',\n  subtitle: '\uB9C8\uCF00\uD130\uAC00 \uC54C\uC544\uC57C \uD560 5\uAC00\uC9C0',\n  brand: '@mybrand',\n  style: 'gradient',\n};\n\nMaging.coverCard('#card-cover', config);",
          bodyCard:      "const config = {\n  num: '01',\n  icon: '\uD83C\uDFAF',\n  heading: '\uCD08\uAC1C\uC778\uD654 \uCF58\uD150\uCE20 \uC790\uB3D9 \uC0DD\uC131',\n  text: 'AI\uAC00 \uACE0\uAC1D \uC138\uADF8\uBA3C\uD2B8\uBCC4\uB85C \uB9DE\uCDA4 \uCF58\uD150\uCE20\uB97C\\n\uC2E4\uC2DC\uAC04\uC73C\uB85C \uB9CC\uB4E4\uC5B4\uC90D\uB2C8\uB2E4.',\n  brand: '@mybrand',\n};\n\nMaging.bodyCard('#card-01', config);",
          dataCard:      "const config = {\n  label: 'GLOBAL TREND',\n  title: 'AI \uB9C8\uCF00\uD305 \uB3C4\uC785\uB960 \uCD94\uC774',\n  widget: 'barChart',\n  widgetConfig: {\n    items: [\n      { label: '2022', value: 18 },\n      { label: '2023', value: 31 },\n      { label: '2024', value: 47 },\n      { label: '2025', value: 63 },\n      { label: '2026', value: 78 },\n    ],\n    yFormatter: v => v + '%',\n  },\n  brand: '@mybrand',\n};\n\nMaging.dataCard('#card-data', config);",
          numberedCard:  "const config = {\n  heading: 'AI \uB9C8\uCF00\uD305 \uB3C4\uAD6C TOP 3',\n  items: [\n    { rank: '1', title: 'ChatGPT / Claude',\n      desc: '\uCF58\uD150\uCE20 \uCD08\uC548, \uCE74\uD53C\uB77C\uC774\uD305', icon: '\uD83E\uDD16' },\n    { rank: '2', title: 'Midjourney / DALL-E',\n      desc: '\uBE44\uC8FC\uC5BC \uC0DD\uC131', icon: '\uD83D\uDDBC\uFE0F' },\n    { rank: '3', title: 'HubSpot AI',\n      desc: '\uB9AC\uB4DC \uC2A4\uCF54\uC5B4\uB9C1', icon: '\uD83D\uDCC8' },\n  ],\n  brand: '@mybrand',\n};\n\nMaging.numberedCard('#card-top', config);",
          ctaCard:       "const config = {\n  heading: '\uB354 \uB9CE\uC740 AI \uB9C8\uCF00\uD305 \uD301\uC774\\n\uAD81\uAE08\uD558\uB2E4\uBA74?',\n  subtext: '\uD314\uB85C\uC6B0\uD558\uACE0 \uB9E4\uC8FC \uC0C8\uB85C\uC6B4 \uD2B8\uB80C\uB4DC\uB97C \uBC1B\uC544\uBCF4\uC138\uC694',\n  ctas: [\n    { label: '\uD314\uB85C\uC6B0\uD558\uAE30', primary: true },\n  ],\n  handles: [\n    { platform: 'Instagram', handle: '@mybrand' },\n    { platform: 'LinkedIn', handle: 'mybrand' },\n  ],\n  brand: '@mybrand',\n};\n\nMaging.ctaCard('#card-cta', config);",

          // -- Pitch Deck --
          pitchCover:      "const config = {\n  company: 'Acme Corp',\n  tagline: '\uD601\uC2E0\uC744 \uAC00\uC18D\uD558\uB294 AI \uD50C\uB7AB\uD3FC',\n  logo: '\u25C6',\n  subtitle: 'Series A \u00B7 2026',\n  style: 'bold',  // 'bold' | 'minimal' | 'gradient'\n};\n\nMaging.pitchCover('#el', config);",
          problemSlide:    "const config = {\n  headline: '\uAE30\uC5C5\uC758 78%\uAC00 \uBCF4\uACE0\uC11C \uC81C\uC791\uC5D0\\n\uC8FC\uB2F9 8\uC2DC\uAC04 \uC774\uC0C1 \uC18C\uBE44\uD569\uB2C8\uB2E4',\n  points: [\n    { icon: '\u23F1\uFE0F', title: '\uBC18\uBCF5 \uAC1C\uBC1C',\n      desc: '\uAC19\uC740 \uCC28\uD2B8\uB97C \uB9E4\uBC88 \uCC98\uC74C\uBD80\uD130 \uCF54\uB529' },\n    { icon: '\uD83C\uDFA8', title: '\uB514\uC790\uC778 \uD30C\uD3B8\uD654',\n      desc: '\uD300\uB9C8\uB2E4 \uB2E4\uB978 UI, \uBE0C\uB79C\uB4DC \uBD88\uC77C\uCE58' },\n    { icon: '\uD83D\uDCB8', title: '\uACFC\uB3C4\uD55C \uBE44\uC6A9',\n      desc: 'BI \uB3C4\uAD6C \uB77C\uC774\uC120\uC2A4 \uC5F0 $50K+' },\n  ],\n  highlight: '\uC5F0\uAC04 \uAC1C\uBC1C\uC790 1\uC778\uB2F9 320\uC2DC\uAC04 \uB0AD\uBE44',\n};\n\nMaging.problemSlide('#el', config);",
          solutionSlide:   "const config = {\n  headline: '\uD504\uB86C\uD504\uD2B8 \uD55C \uC904\uB85C \uD504\uB85C\uB355\uC158\uAE09 \uACB0\uACFC\uBB3C',\n  before: {\n    label: 'Before',\n    items: ['2\uC8FC \uAC1C\uBC1C', '\uB514\uC790\uC774\uB108 \uD544\uC694', '$50K/yr'],\n  },\n  after: {\n    label: 'After',\n    items: ['30\uCD08 \uC0DD\uC131', '105\uAC1C \uD14C\uB9C8', 'CDN \uBB34\uB8CC'],\n  },\n};\n\nMaging.solutionSlide('#el', config);",
          metricHighlight: "const config = {\n  metrics: [\n    { value: '37', unit: '\uAC1C', label: '\uC704\uC82F' },\n    { value: '105', unit: '\uAC1C', label: '\uD14C\uB9C8' },\n    { value: '30', unit: '\uCD08', label: '\uC0DD\uC131 \uC2DC\uAC04' },\n  ],\n};\n\nMaging.metricHighlight('#el', config);",
          marketSlide:     "const config = {\n  headline: 'AI Report Generation \uC2DC\uC7A5',\n  tam: { value: '$30B', label: 'TAM \u00B7 \uAE00\uB85C\uBC8C BI' },\n  sam: { value: '$8B', label: 'SAM \u00B7 \uB9AC\uD3EC\uD305 \uC790\uB3D9\uD654' },\n  som: { value: '$500M', label: 'SOM \u00B7 AI \uB9AC\uD3EC\uD2B8' },\n  insight: 'CAGR 23%',\n  sources: ['Gartner 2025'],\n};\n\nMaging.marketSlide('#el', config);",
          competitorMatrix:"const config = {\n  headline: '\uD3EC\uC9C0\uC154\uB2DD',\n  axisX: { low: '\uACE0\uC815', high: '\uC720\uC5F0' },\n  axisY: { low: '\uC218\uB3D9', high: 'AI' },\n  players: [\n    { name: 'Us', x: 80, y: 95, highlight: true },\n    { name: 'Tableau', x: 85, y: 15 },\n    { name: 'Retool', x: 65, y: 35 },\n  ],\n};\n\nMaging.competitorMatrix('#el', config);",
          bizModelSlide:   "const config = {\n  headline: '\uC218\uC775 \uBAA8\uB378',\n  tiers: [\n    { name: 'Free', price: '$0',\n      features: ['CDN \uC811\uADFC', '\uAE30\uBCF8 \uD14C\uB9C8'] },\n    { name: 'Pro', price: '$29', period: '/\uC6D4',\n      features: ['\uC804\uCCB4 \uD14C\uB9C8', '\uC6B0\uC120 \uC9C0\uC6D0'],\n      popular: true },\n    { name: 'Enterprise', price: 'Custom',\n      features: ['SSO', 'SLA 99.9%'] },\n  ],\n  note: 'Land & Expand',\n};\n\nMaging.bizModelSlide('#el', config);",
          timelineSlide:   "const config = {\n  headline: '\uB85C\uB4DC\uB9F5',\n  milestones: [\n    { date: '2025 Q4', title: 'MVP', done: true },\n    { date: '2026 Q1', title: '\uD655\uC7A5', done: true },\n    { date: '2026 Q2', title: '\uD604\uC7AC', active: true },\n    { date: '2026 H2', title: '\uC5D4\uD130\uD504\uB77C\uC774\uC988' },\n  ],\n};\n\nMaging.timelineSlide('#el', config);",
          teamSlide:       "const config = {\n  headline: '\uD300',\n  members: [\n    { name: '\uC720\uBBFC\uD638', role: 'CEO',\n      exp: 'B2B SaaS 10\uB144' },\n    { name: '\uAE40\uAC1C\uBC1C', role: 'CTO',\n      exp: '\uC804 \uD1A0\uC2A4 \uD504\uB860\uD2B8\uC5D4\uB4DC' },\n  ],\n};\n\nMaging.teamSlide('#el', config);",
          askSlide:        "const config = {\n  headline: 'Series A \u00B7 \u20A930\uC5B5',\n  useOfFunds: [\n    { label: '\uC5D4\uC9C0\uB2C8\uC5B4\uB9C1', pct: 50 },\n    { label: 'GTM', pct: 30 },\n    { label: '\uC6B4\uC601', pct: 20 },\n  ],\n  milestones: [\n    'ARR \u20A910\uC5B5',\n    '\uACE0\uAC1D 30\uC0AC',\n    '\uAE00\uB85C\uBC8C \uC9C4\uCD9C',\n  ],\n  contact: {\n    email: 'hello@acme.io',\n    website: 'acme.io',\n  },\n};\n\nMaging.askSlide('#el', config);",
          chainFlow:       "const config = {\n  headline: '\uAC00\uCE58 \uCCB4\uC778 \u2014 3\uB2E8 \uC804\uB2EC \uAD6C\uC870',\n  steps: [\n    { label: 'PLATFORM', title: 'AI\uB85C \uB9CC\uB4E0\uB2E4',\n      desc: '\uCF58\uD150\uCE20 \uC0DD\uC131 + \uBD84\uC11D', accent: true },\n    { label: '\uBB34\uC7A5', title: '\uC9C1\uC6D0\uC774 \uAC15\uD574\uC9C4\uB2E4',\n      desc: '\uC601\uC5C5\u00B7\uB9C8\uCF00\uD305 \uC5ED\uB7C9 \uC99D\uD3ED' },\n    { label: '\uACB0\uACFC', title: '\uACE0\uAC1D\uC774 \uCC3E\uC544\uC628\uB2E4',\n      desc: '\uB9E4\uCD9C \uC131\uC7A5 \uC9C1\uACB0' },\n  ],\n};\n\nMaging.chainFlow('#el', config);",
          compareSlide:    "const config = {\n  headline: '\uC65C \uC774 \uC804\uB7B5\uC774 \uAC15\uB825\uD55C\uAC00',\n  left: {\n    label: '\uAE30\uC874 \uC811\uADFC',\n    rows: [\n      { key: '\uD504\uB808\uC774\uBC0D', value: '\uC5C5\uBB34 \uD6A8\uC728\uD654' },\n      { key: 'KPI', value: '\uC0AC\uC6A9\uB960' },\n    ],\n  },\n  right: {\n    label: '\uC0C8\uB85C\uC6B4 \uC811\uADFC',\n    rows: [\n      { key: '\uD504\uB808\uC774\uBC0D', value: '\uB9E4\uCD9C \uC131\uC7A5' },\n      { key: 'KPI', value: '\uACE0\uAC1D \uBC18\uC751' },\n    ],\n  },\n  note: '\uBE44\uC6A9 \uC808\uAC10\uC774 \uC544\uB2C8\uB77C \uB9E4\uCD9C \uC131\uC7A5.',\n};\n\nMaging.compareSlide('#el', config);",
        };

        /* ============================================================
         * Syntax highlighter
         * ============================================================ */
        function highlightSyntax(code: string) {
          var parts = code.split(/(<[^>]+>)/g);
          return parts.map(function(part) {
            if (/^</.test(part)) {
              var esc = part.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
              return '<span class="hl-tag">' + esc + '</span>';
            }
            var s = part.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
            s = s.replace(/(\/\/.*)$/gm, '<span class="hl-cmt">$1</span>');
            s = s.replace(/('(?:[^'\\]|\\.)*')/g, '<span class="hl-str">$1</span>');
            s = s.replace(/("(?:[^"\\]|\\.)*")/g, function(m) {
              if (m.indexOf('class=') >= 0 || m.indexOf('hl-') >= 0) return m;
              return '<span class="hl-str">' + m + '</span>';
            });
            s = s.replace(/\b(Maging)\.([\w]+)/g, '<span class="hl-fn">$1.$2</span>');
            s = s.replace(/\b(const|let|var|function|return|new|if|else|true|false|null)\b/g, '<span class="hl-kw">$1</span>');
            s = s.replace(/\b(\d+\.?\d*)\b/g, '<span class="hl-num">$1</span>');
            s = s.replace(/^(\s*)([\w]+)(\s*:)/gm, '$1<span class="hl-prop">$2</span>$3');
            return s;
          }).join('');
        }

        /* ============================================================
         * Style variants
         * ============================================================ */
        var STYLE_VARIANTS: Record<string, {
          variants: { label: string; value: string }[];
          render: (el: HTMLElement, v: string) => void;
          code: (v: string) => string;
        }> = {
          coverCard: {
            variants: [
              { label: 'gradient', value: 'gradient' },
              { label: 'bold-type', value: 'bold-type' },
              { label: 'number-hero', value: 'number-hero' },
              { label: 'framed', value: 'framed' },
              { label: 'accent-block', value: 'accent-block' },
              { label: 'minimal', value: 'minimal' },
            ],
            render: function(el, v) {
              var cfg: any = { icon: '\uD83D\uDE80', tag: 'AI \uD2B8\uB80C\uB4DC', title: 'AI\uAC00 \uBC14\uAFC0\n\uB9C8\uCF00\uD305\uC758 \uBBF8\uB798', subtitle: '\uB9C8\uCF00\uD130\uAC00 \uC54C\uC544\uC57C \uD560 5\uAC00\uC9C0', brand: '@maging.page', style: v };
              if (v === 'number-hero') { cfg.number = 5; cfg.icon = undefined; }
              if (v === 'bold-type') cfg.icon = undefined;
              Maging.coverCard(el, cfg);
            },
            code: function(v) {
              var lines = ['const config = {'];
              if (v !== 'bold-type' && v !== 'number-hero') lines.push("  icon: '\uD83D\uDE80',");
              lines.push("  tag: 'AI \uD2B8\uB80C\uB4DC',", "  title: 'AI\uAC00 \uBC14\uAFC0\\n\uB9C8\uCF00\uD305\uC758 \uBBF8\uB798',", "  subtitle: '\uB9C8\uCF00\uD130\uAC00 \uC54C\uC544\uC57C \uD560 5\uAC00\uC9C0',", "  brand: '@mybrand',", "  style: '" + v + "',");
              if (v === 'number-hero') lines.push("  number: 5,");
              lines.push('};', '', "Maging.coverCard('#card-cover', config);");
              return lines.join('\n');
            },
          },
          sectionCover: {
            variants: [
              { label: 'classic', value: 'classic' },
              { label: 'centered', value: 'centered' },
              { label: 'split', value: 'split' },
              { label: 'fullbleed', value: 'fullbleed' },
              { label: 'topband', value: 'topband' },
            ],
            render: function(el, v) {
              Maging.sectionCover(el, { style: v, kicker: 'WEEKLY REPORT \u00B7 4\uC6D4 4\uC8FC\uCC28', title: 'SaaS \uC8FC\uAC04\uBCF4\uACE0', subtitle: 'SaaS B/U \u00B7 Enterprise B/U', brand: 'flow.team', meta: '\uAE30\uC900\uC77C 2026.04.27(\uC6D4)' });
            },
            code: function(v) {
              return "const config = {\n  style: '" + v + "',\n  kicker: 'WEEKLY REPORT \u00B7 4\uC6D4 4\uC8FC\uCC28',\n  title: 'SaaS \uC8FC\uAC04\uBCF4\uACE0',\n  subtitle: 'SaaS B/U \u00B7 Enterprise B/U',\n  brand: 'flow.team',\n  meta: '\uAE30\uC900\uC77C 2026.04.27(\uC6D4)',\n};\n\nMaging.sectionCover('#el', config);";
            },
          },
          alertBanner: {
            variants: [
              { label: 'info', value: 'info' },
              { label: 'success', value: 'success' },
              { label: 'warning', value: 'warning' },
              { label: 'danger', value: 'danger' },
            ],
            render: function(el, v) {
              Maging.alertBanner(el, { type: v, title: v === 'success' ? '\uBC30\uD3EC \uC644\uB8CC' : v === 'warning' ? '\uC810\uAC80 \uC608\uC815' : v === 'danger' ? '\uC7A5\uC560 \uBC1C\uC0DD' : '\uC548\uB0B4', message: v === 'success' ? 'v2.4.1\uC774 \uC815\uC0C1 \uBC30\uD3EC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.' : v === 'warning' ? '\uC624\uB298 22:00~24:00 \uC815\uAE30 \uC810\uAC80' : v === 'danger' ? 'API \uC751\uB2F5 \uC9C0\uC5F0\uC774 \uAC10\uC9C0\uB418\uC5C8\uC2B5\uB2C8\uB2E4.' : '\uC2DC\uC2A4\uD15C \uACF5\uC9C0\uC0AC\uD56D\uC785\uB2C8\uB2E4.' });
            },
            code: function(v) {
              return "const config = {\n  type: '" + v + "',\n  title: '" + (v === 'success' ? '\uBC30\uD3EC \uC644\uB8CC' : v === 'warning' ? '\uC810\uAC80 \uC608\uC815' : v === 'danger' ? '\uC7A5\uC560 \uBC1C\uC0DD' : '\uC548\uB0B4') + "',\n  message: '\uBA54\uC2DC\uC9C0 \uB0B4\uC6A9',\n};\n\nMaging.alertBanner('#el', config);";
            },
          },
          barChart: {
            variants: [
              { label: 'horizontal', value: 'h' },
              { label: 'vertical', value: 'v' },
            ],
            render: function(el, v) {
              Maging.barChart(el, { items: [{ label: '\uC601\uC5C5', value: 45 },{ label: '\uB9C8\uCF00\uD305', value: 32 },{ label: '\uAC1C\uBC1C', value: 68 },{ label: 'CS', value: 21 }], horizontal: v === 'h' });
            },
            code: function(v) {
              return "const config = {\n  items: [\n    { label: '\uC601\uC5C5', value: 45 },\n    { label: '\uB9C8\uCF00\uD305', value: 32 },\n    { label: '\uAC1C\uBC1C', value: 68 },\n    { label: 'CS', value: 21 }\n  ],\n  horizontal: " + (v === 'h' ? 'true' : 'false') + ",\n};\n\nMaging.barChart('#el', config);";
            },
          },
          lineChart: {
            variants: [
              { label: 'line', value: 'line' },
              { label: 'area', value: 'area' },
              { label: 'stacked', value: 'stack' },
            ],
            render: function(el, v) {
              Maging.lineChart(el, { categories: ['1\uC6D4','2\uC6D4','3\uC6D4','4\uC6D4','5\uC6D4','6\uC6D4'], series: [{ name: '\uB9E4\uCD9C', data: [12,14,13,16,18,21] }, { name: '\uBE44\uC6A9', data: [8,9,10,11,12,13] }], area: v === 'area' || v === 'stack', stack: v === 'stack' });
            },
            code: function(v) {
              return "const config = {\n  categories: ['1\uC6D4','2\uC6D4','3\uC6D4','4\uC6D4','5\uC6D4','6\uC6D4'],\n  series: [\n    { name: '\uB9E4\uCD9C', data: [12, 14, 13, 16, 18, 21] },\n    { name: '\uBE44\uC6A9', data: [8, 9, 10, 11, 12, 13] }\n  ]," + (v === 'area' ? "\n  area: true," : v === 'stack' ? "\n  area: true,\n  stack: true," : '') + "\n};\n\nMaging.lineChart('#el', config);";
            },
          },
        };

        /* ============================================================
         * Render
         * ============================================================ */
        var validModes = ['core', 'slide', 'cardnews', 'landing'];
        var currentMode = validModes.indexOf(modeParam) >= 0 ? modeParam : 'core';

        var MODES = [
          { key: 'core',    label: '\uB300\uC2DC\uBCF4\uB4DC',  desc: '\uB300\uC2DC\uBCF4\uB4DC\u00B7\uC6B4\uC601 \uBAA8\uB2C8\uD130\uB9C1\uC5D0 \uACF5\uD1B5\uC73C\uB85C \uC4F0\uC774\uB294 \uAE30\uBCF8 \uC704\uC82F\uC785\uB2C8\uB2E4. Metrics, Charts, Lists \uB4F1 \uBAA8\uB4E0 \uBAA8\uB4DC\uC758 \uAE30\uBC18.' },
          { key: 'slide',   label: '\uC2AC\uB77C\uC774\uB4DC', desc: '\uBCF4\uACE0\u00B7\uBC1C\uD45C\u00B7\uC81C\uC548\uC6A9 \uC2AC\uB77C\uC774\uB4DC \uC704\uC82F\uC785\uB2C8\uB2E4. Cover \u00B7 Table \u00B7 Problem \u00B7 Market \u00B7 Ask \uB4F1 16\uC885.' },
          { key: 'cardnews', label: '\uCE74\uB4DC\uB274\uC2A4', desc: '\uC778\uC2A4\uD0C0\uADF8\uB7A8\u00B7\uB9C1\uD06C\uB4DC\uC778 \uCE90\uB7EC\uC140 \uCE74\uB4DC\uB274\uC2A4 \uC804\uC6A9 \uC704\uC82F 11\uC885. Cover(6\uC2A4\uD0C0\uC77C), Body, Data, Quote, Stat, Comparison, Checklist, Step, Testimonial, CTA.' },
          { key: 'landing', label: '\uB79C\uB529\uD398\uC774\uC9C0', desc: '\uB9C8\uCF00\uD305 \uB79C\uB529\uD398\uC774\uC9C0 \uC804\uC6A9 \uC704\uC82F\uC785\uB2C8\uB2E4. Hero, Pricing, Testimonial \uB4F1 \uC804\uD658 \uCD5C\uC801\uD654 \uCEF4\uD3EC\uB10C\uD2B8.' },
        ];

        // Build mode tabs
        var tabsEl = document.getElementById('cg-tabs');
        if (tabsEl) {
          tabsEl.innerHTML = '';
          MODES.forEach(function(m) {
            var a = document.createElement('a');
            a.className = 'cg-tab' + (m.key === currentMode ? ' is-active' : '');
            a.textContent = m.label;
            a.href = '/components?mode=' + m.key;
            tabsEl.appendChild(a);
          });
        }

        var modeInfo = MODES.find(function(m) { return m.key === currentMode; }) || MODES[0];

        // Filter widgets by mode
        function getFilteredWidgets() {
          var result: Record<string, typeof WIDGETS[string]> = {};
          Object.keys(WIDGETS).forEach(function(key) {
            var w = WIDGETS[key];
            if (currentMode === 'slide') {
              if (w.mode === 'slide') result[key] = w;
            } else {
              if (w.mode === currentMode) result[key] = w;
            }
          });
          return result;
        }

        var filtered = getFilteredWidgets();
        var count = Object.keys(filtered).length;

        // Header
        var descEl = document.getElementById('cg-desc');
        var countEl = document.getElementById('cg-count');
        if (descEl) descEl.textContent = modeInfo.desc;
        if (countEl) countEl.textContent = count + '\uAC1C \uCEF4\uD3EC\uB10C\uD2B8';

        // Group by category
        var groups: Record<string, string[]> = {};
        Object.keys(filtered).forEach(function(key) {
          var cat = filtered[key].cat;
          if (!groups[cat]) groups[cat] = [];
          groups[cat].push(key);
        });

        // Landing meta
        var LANDING_META: Record<string, { title: string; desc: string }> = {
          stepGuide: { title: 'Step Guide', desc: '\uBC88\uD638 + \uC81C\uBAA9 + \uC124\uBA85 + \uCF54\uB4DC/\uC774\uBBF8\uC9C0. How it works \uC139\uC158.' },
          codeBlock: { title: 'Code Block', desc: '\uAD6C\uBB38 \uD558\uC774\uB77C\uC774\uD305 + Copy \uBC84\uD2BC. \uAC1C\uBC1C\uC790 \uB300\uC0C1 \uB79C\uB529.' },
          comparisonTable: { title: 'Comparison Table', desc: '\uACBD\uC7C1\uC0AC \uBE44\uAD50\uD45C \u00B7 \uCCB4\uD06C/X \u00B7 \uD558\uC774\uB77C\uC774\uD2B8 \uC5F4.' },
          heroSection: { title: 'Hero Section', desc: '\uD480\uD3ED \uD788\uC5B4\uB85C \u00B7 \uD0C0\uC774\uD2C0 + \uC11C\uBE0C + CTA \uBC84\uD2BC.' },
          featureGrid: { title: 'Feature Grid', desc: '\uC544\uC774\uCF58 + \uC81C\uBAA9 + \uC124\uBA85 \uCE74\uB4DC \uADF8\uB9AC\uB4DC.' },
          pricingTable: { title: 'Pricing Table', desc: '\uC694\uAE08\uC81C \uBE44\uAD50 \uD14C\uC774\uBE14 \u00B7 Popular \uBC30\uC9C0 + CTA.' },
          testimonialGrid: { title: 'Testimonial Grid', desc: '\uC778\uC6A9\uBB38 + \uD504\uB85C\uD544 \uCE74\uB4DC \uADF8\uB9AC\uB4DC.' },
          logoBar: { title: 'Logo Bar', desc: '\uACE0\uAC1D\uC0AC/\uD30C\uD2B8\uB108 \uB85C\uACE0 \uB098\uC5F4 (social proof).' },
          ctaSection: { title: 'CTA Section', desc: '\uC804\uD658 \uC720\uB3C4 CTA \uC139\uC158.' },
          faqAccordion: { title: 'FAQ Accordion', desc: '\uC544\uCF54\uB514\uC5B8 FAQ.' },
          sectionCover: { title: 'Section Cover', desc: '\uBCF4\uACE0\uC11C \uD45C\uC9C0/\uC139\uC158 \uAD6C\uBD84. 5\uAC00\uC9C0 \uC2A4\uD0C0\uC77C.' },
          coverCard: { title: 'Cover Card', desc: '\uCE74\uB4DC\uB274\uC2A4 \uD45C\uC9C0. \uD6C4\uD0B9 \uD0C0\uC774\uD2C0 + \uD0DC\uADF8 + \uADF8\uB77C\uB370\uC774\uC158 \uBC30\uACBD.' },
          bodyCard: { title: 'Body Card', desc: '\uBCF8\uBB38 \uCE74\uB4DC. 1\uCE74\uB4DC 1\uBA54\uC2DC\uC9C0 \uC6D0\uCE59. \uB118\uBC84\uB9C1 + \uC544\uC774\uCF58.' },
          dataCard: { title: 'Data Card', desc: '\uB370\uC774\uD130 \uC2DC\uAC01\uD654 \uCE74\uB4DC. \uAE30\uC874 maging \uCC28\uD2B8 \uC704\uC82F \uB0B4\uC7A5.' },
          numberedCard: { title: 'Numbered Card', desc: '\uC21C\uC704/\uB9AC\uC2A4\uD2B8 \uCE74\uB4DC. TOP 3~5 \uC544\uC774\uD15C \uB098\uC5F4.' },
          quoteCard: { title: 'Quote Card', desc: '\uC778\uC6A9\uBB38 + \uCD9C\uCC98. \uC804\uBB38\uAC00 \uCF54\uBA58\uD2B8, \uC784\uD329\uD2B8 \uBB38\uC7A5, \uACE0\uAC1D \uD6C4\uAE30.' },
          statCard: { title: 'Stat Card', desc: '\uB300\uD615 \uC218\uCE58 \uC784\uD329\uD2B8. \uC22B\uC790 \uC790\uCCB4\uAC00 \uBA54\uC2DC\uC9C0\uC77C \uB54C.' },
          comparisonCard: { title: 'Comparison Card', desc: '\uC88C\uC6B0 \uBE44\uAD50. Do/Don\'t, Before/After, Myth/Fact.' },
          checklistCard: { title: 'Checklist Card', desc: '\uCCB4\uD06C\uB9AC\uC2A4\uD2B8. \uC800\uC7A5 \uC720\uB3C4\uC5D0 \uD6A8\uACFC\uC801.' },
          stepCard: { title: 'Step Card', desc: '\uC21C\uC11C \uC2A4\uD15D. How-to \uD29C\uD1A0\uB9AC\uC5BC, \uD504\uB85C\uC138\uC2A4 \uC124\uBA85.' },
          testimonialCard: { title: 'Testimonial Card', desc: '\uACE0\uAC1D \uD6C4\uAE30 + \uBCC4\uC810 + \uC544\uBC14\uD0C0. \uC18C\uC15C \uD504\uB8E8\uD504.' },
          ctaCard: { title: 'CTA Card', desc: '\uD589\uB3D9 \uC720\uB3C4 \uB9C8\uC9C0\uB9C9 \uC7A5. \uD314\uB85C\uC6B0 \u00B7 \uB9C1\uD06C \u00B7 DM.' },
          pitchCover: { title: 'Pitch Cover', desc: '\uD53C\uCE58\uB371 \uD45C\uC9C0. \uD68C\uC0AC\uBA85 + \uD0DC\uADF8\uB77C\uC778 + \uB77C\uC6B4\uB4DC. 3\uAC00\uC9C0 \uC2A4\uD0C0\uC77C.' },
          problemSlide: { title: 'Problem Slide', desc: '\uBB38\uC81C \uC81C\uC2DC. \uD070 \uD5E4\uB4DC\uB77C\uC778 + pain point \uCE74\uB4DC + \uD558\uC774\uB77C\uC774\uD2B8.' },
          solutionSlide: { title: 'Solution Slide', desc: '\uC194\uB8E8\uC158. Before/After \uBE44\uAD50 \uB610\uB294 \uAE30\uB2A5 \uADF8\uB9AC\uB4DC.' },
          metricHighlight: { title: 'Metric Highlight', desc: '\uB300\uD615 \uC22B\uC790 \uC784\uD329\uD2B8. \uD2B8\uB799\uC158\u00B7\uC81C\uD488 \uC9C0\uD45C \uAC15\uC870.' },
          marketSlide: { title: 'Market Slide', desc: 'TAM/SAM/SOM \uB3D9\uC2EC\uC6D0. \uC2DC\uC7A5 \uADDC\uBAA8 \uC2DC\uAC01\uD654.' },
          competitorMatrix: { title: 'Competitor Matrix', desc: '2\u00D72 \uD3EC\uC9C0\uC154\uB2DD \uB9E4\uD2B8\uB9AD\uC2A4. \uC790\uC0AC \uC704\uCE58 \uAC15\uC870.' },
          bizModelSlide: { title: 'Business Model', desc: '\uC218\uC775 \uBAA8\uB378. \uD504\uB9AC\uBBF8\uC5C4/\uAD6C\uB3C5 \uD2F0\uC5B4 \uBE44\uAD50.' },
          timelineSlide: { title: 'Timeline Slide', desc: '\uB85C\uB4DC\uB9F5. \uAC00\uB85C \uD0C0\uC784\uB77C\uC778 + done/active \uC0C1\uD0DC.' },
          teamSlide: { title: 'Team Slide', desc: '\uD300 \uC18C\uAC1C. \uC544\uBC14\uD0C0 + \uC5ED\uD560 + \uACBD\uB825.' },
          askSlide: { title: 'Ask Slide', desc: '\uD22C\uC790 \uC694\uCCAD. \uAE08\uC561 + \uC790\uAE08 \uC6A9\uB3C4 + \uB9C8\uC77C\uC2A4\uD1A4.' },
          chainFlow: { title: 'Chain Flow', desc: 'A\u2192B\u2192C \uD654\uC0B4\uD45C \uD750\uB984\uB3C4. \uAC00\uCE58 \uCCB4\uC778 \u00B7 \uD504\uB85C\uC138\uC2A4 \u00B7 \uC720\uC800 \uC800\uB2C8.' },
          compareSlide: { title: 'Compare Slide', desc: '\uC88C\uC6B0 \uB300\uBE44. Old vs New \u00B7 \uAE30\uC874 vs \uC81C\uC548 \u00B7 \uD604\uC7AC vs \uBAA9\uD45C.' },
        };

        // Category display order
        var CAT_ORDER_BY_MODE: Record<string, string[]> = {
          core:    ['Metrics', 'Charts', 'Lists', 'Calendar & Progress', 'Layout', 'Specialized'],
          slide:   ['\uC2AC\uB77C\uC774\uB4DC \uC704\uC82F'],
          landing: ['Landing Page'],
          cardnews: ['Card News'],
        };

        var catOrder = CAT_ORDER_BY_MODE[currentMode] || CAT_ORDER_BY_MODE.core;
        var content = document.getElementById('cg-content');
        var html = '';

        catOrder.forEach(function(cat) {
          var items = groups[cat];
          if (!items || !items.length) return;

          var badgeClass = 'cg-section__badge--core';
          if (cat === 'Landing Page') badgeClass = 'cg-section__badge--landing';
          if (cat === '\uC2AC\uB77C\uC774\uB4DC \uC704\uC82F') badgeClass = 'cg-section__badge--slide';
          if (cat === 'Card News') badgeClass = 'cg-section__badge--cardnews';

          html += '<div class="cg-section">';
          html += '<div class="cg-section__head">';
          html += '<h2 class="cg-section__title">' + cat + '</h2>';
          html += '<span class="cg-section__badge ' + badgeClass + '">' + items.length + '</span>';
          html += '</div>';

          items.forEach(function(key) {
            var meta = (Maging.meta && Maging.meta[key]) || LANDING_META[key] || {} as any;
            var title = meta.title || key;
            var desc = meta.desc || '';
            var code = CODE[key] || '';

            html += '<div class="sc-item">';
            html += '<div class="sc-preview"><div id="preview-' + key + '"></div></div>';
            html += '<div class="sc-info">';
            html += '<div class="sc-name">' + title + ' <span class="sc-api">Maging.' + key + '(sel, config)</span></div>';
            html += '<div class="sc-desc">' + desc + '</div>';
            // Style variant pills
            var sv = STYLE_VARIANTS[key];
            if (sv && sv.variants) {
              html += '<div class="sc-variants" data-widget="' + key + '">';
              sv.variants.forEach(function(v, i) {
                html += '<button class="sc-variant-pill' + (i === 0 ? ' sc-variant-pill--active' : '') + '" data-style="' + v.value + '">' + v.label + '</button>';
              });
              html += '</div>';
            }
            if (code) html += '<div class="sc-code" id="code-' + key + '"><pre>' + highlightSyntax(code) + '</pre></div>';
            html += '</div>';
            html += '</div>';
          });

          html += '</div>';
        });

        if (content) content.innerHTML = html;

        // Mount live previews
        Object.keys(filtered).forEach(function(key) {
          var el = document.getElementById('preview-' + key);
          if (el && SAMPLES[key]) {
            try { SAMPLES[key](el); } catch(e) { el.innerHTML = '<span style="color:var(--mw-text-muted);font-size:0.7rem;">Preview unavailable</span>'; }
          } else if (el) {
            el.innerHTML = '<span style="color:var(--mw-text-muted);font-size:0.7rem;">Preview unavailable</span>';
          }
        });

        // Style variant pill click handler
        document.addEventListener('click', function(e) {
          var pill = (e.target as HTMLElement).closest('.sc-variant-pill') as HTMLElement;
          if (!pill) return;
          var wrap = pill.closest('.sc-variants') as HTMLElement;
          var widgetKey = wrap.dataset.widget!;
          var styleVal = pill.dataset.style!;
          var sv = STYLE_VARIANTS[widgetKey];
          if (!sv) return;

          wrap.querySelectorAll('.sc-variant-pill').forEach(function(p) { p.classList.remove('sc-variant-pill--active'); });
          pill.classList.add('sc-variant-pill--active');

          var previewEl = document.getElementById('preview-' + widgetKey);
          if (previewEl && sv.render) {
            previewEl.innerHTML = '';
            try { sv.render(previewEl, styleVal); } catch(err) {}
            setTimeout(function() { window.dispatchEvent(new Event('resize')); }, 100);
          }

          var codeEl = document.getElementById('code-' + widgetKey);
          if (codeEl && sv.code) {
            codeEl.querySelector('pre')!.innerHTML = highlightSyntax(sv.code(styleVal));
          }
        });

        // Resize charts
        function resizeCharts() {
          document.querySelectorAll('.sc-preview .mw-chart__body').forEach(function(body) {
            var echarts = (window as any).echarts;
            if (!echarts) return;
            var instance = echarts.getInstanceByDom(body);
            if (!instance) return;
            instance.resize();
            var opt = instance.getOption();
            if (opt.series && opt.series[0] && opt.series[0].type === 'pie') {
              instance.setOption({ series: [{ center: ['50%', '50%'] }], legend: { show: false } });
            }
          });
        }
        setTimeout(resizeCharts, 100);
        setTimeout(resizeCharts, 400);
        setTimeout(resizeCharts, 1000);
        window.addEventListener('resize', function() { setTimeout(resizeCharts, 100); });

      }); // Promise.all
    } // boot

    // Wait for maging:ready, or if Maging already exists, boot immediately
    if ((window as any).Maging) {
      boot();
    } else {
      window.addEventListener('maging:ready', boot);
    }

    return () => {
      window.removeEventListener('maging:ready', boot);
    };
  }, [modeParam]);

  return (
    <>
      <style jsx global>{`
        html { scroll-behavior: smooth; }

        .cg-page { max-width: 1100px; margin: 0 auto; padding: 3rem 1.5rem 5rem; }

        .cg-header { margin-bottom: 2.5rem; }
        .cg-header__title { font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 700; letter-spacing: -0.02em; margin-bottom: 0.5rem; }
        .cg-header__desc { font-size: var(--mw-text-sm); color: var(--mw-text-muted); line-height: 1.6; max-width: 560px; }
        .cg-header__count {
          display: inline-block; margin-top: 0.75rem;
          font-size: var(--mw-text-xs); color: var(--mw-accent); font-weight: 600;
          font-family: var(--mw-mono-font);
        }

        .cg-section { margin-bottom: 3rem; }
        .cg-section__head {
          display: flex; align-items: center; gap: 0.75rem;
          margin-bottom: 1.25rem; padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--mw-border);
        }
        .cg-section__title { font-size: var(--mw-text-md); font-weight: 700; }
        .cg-section__badge {
          font-size: var(--mw-text-xs); font-weight: 600; padding: 0.15rem 0.5rem;
          border-radius: 999px; font-family: var(--mw-mono-font);
        }
        .cg-section__badge--core { background: color-mix(in srgb, var(--mw-accent) 12%, transparent); color: var(--mw-accent); }
        .cg-section__badge--dashboard { background: color-mix(in srgb, var(--mw-success) 12%, transparent); color: var(--mw-success); }
        .cg-section__badge--landing { background: color-mix(in srgb, var(--mw-warning) 12%, transparent); color: var(--mw-warning); }
        .cg-section__badge--cardnews { background: color-mix(in srgb, #e91e63 12%, transparent); color: #e91e63; }
        .cg-section__badge--slide { background: color-mix(in srgb, #7c3aed 12%, transparent); color: #7c3aed; }

        .sc-item {
          display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 2rem;
          padding: 2rem 0; border-bottom: 1px solid var(--mw-border);
          align-items: start;
        }
        .sc-item:last-child { border-bottom: none; }
        @media (max-width: 768px) { .sc-item { grid-template-columns: 1fr; } }

        .sc-preview {
          background: var(--mw-bg); border: 1px solid var(--mw-border);
          border-radius: var(--mw-radius); overflow: hidden;
          padding: 0.75rem;
        }
        .sc-preview > div { width: 100%; }
        .sc-preview .mw-card, .sc-preview .mw-cover, .sc-preview .mw-mapchart { min-height: 0 !important; }
        .sc-preview .mw-chart__body { aspect-ratio: 52/9; height: auto !important; min-height: 160px; }
        .sc-preview .mw-chart__body [class*="legend"] { display: none !important; }
        .sc-preview:has(.mw-cover) { padding: 0 !important; background: none !important; }
        .sc-preview:has(.mw-cover) > div { width: 100%; aspect-ratio: 297/210; }
        .sc-preview .mw-cover { height: 100%; min-height: auto !important; }
        .sc-preview .mw-news-frame { max-width: 100%; }

        .sc-preview .pitch-slide-frame { width: 1240px; aspect-ratio: 297 / 210; background: var(--mw-bg); overflow: hidden; transform-origin: top left; box-sizing: border-box; }
        .sc-preview:has(.pitch-slide-frame) { overflow: hidden; }
        .sc-preview:has(.scroll-table) { overflow: auto; max-height: 380px; }
        .sc-preview:has(.pitch-slide-frame) > div { width: 100%; }
        .sc-preview > div:not(:has(.mw-card)):not(.mw-cover):not(:has(.mw-cover)):not(:has(.mw-chart__body)):not(.mw-codeblock):not(:has(.mw-codeblock)):not(:has(.table-toolbar)):not(:has(.mw-news-frame)):not(:has(.pitch-slide-frame)) {
          background: var(--mw-surface); border: 1px solid var(--mw-border);
          border-radius: var(--mw-radius); padding: 0.75rem; box-sizing: border-box;
        }

        .sc-info { display: flex; flex-direction: column; gap: 0.75rem; }
        .sc-name {
          font-size: 1.05rem; font-weight: 700; letter-spacing: -0.01em;
          display: flex; align-items: baseline; gap: 0.5rem; flex-wrap: wrap;
        }
        .sc-api {
          font-size: var(--mw-text-xs); font-family: var(--mw-mono-font);
          color: var(--mw-accent); background: color-mix(in srgb, var(--mw-accent) 8%, transparent);
          padding: 0.15rem 0.5rem; border-radius: 4px; font-weight: 500;
        }
        .sc-desc { font-size: var(--mw-text-sm); color: var(--mw-text-muted); line-height: 1.7; }
        .sc-code {
          background: #1e1e2e; border-radius: var(--mw-radius); overflow: hidden;
        }
        .sc-code pre {
          margin: 0; padding: 1rem 1.25rem; font-size: 0.72rem; line-height: 1.7;
          color: #cdd6f4; font-family: var(--mw-mono-font);
          white-space: pre; overflow-x: auto; tab-size: 2;
        }
        .sc-code .hl-kw { color: #cba6f7; } .sc-code .hl-str { color: #a6e3a1; }
        .sc-code .hl-num { color: #fab387; } .sc-code .hl-fn { color: #89dceb; }
        .sc-code .hl-prop { color: #b4befe; } .sc-code .hl-cmt { color: #6c7086; font-style: italic; }
        .sc-code .hl-tag { color: #89b4fa; }

        .sc-variants { display: flex; gap: 0.375rem; flex-wrap: wrap; margin: 0.5rem 0; }
        .sc-variant-pill {
          padding: 0.25rem 0.625rem; font-size: 0.68rem; font-weight: 600;
          font-family: var(--mw-mono-font); border-radius: 999px;
          border: 1px solid var(--mw-border); background: var(--mw-surface);
          color: var(--mw-text-muted); cursor: pointer; transition: all 120ms;
        }
        .sc-variant-pill:hover { border-color: var(--mw-text-muted); color: var(--mw-text); }
        .sc-variant-pill--active { background: var(--mw-accent); color: #fff; border-color: var(--mw-accent); }

        .cg-tabs {
          display: flex; gap: 2px; margin-bottom: 2rem;
          background: var(--mw-surface-2); border: 1px solid var(--mw-border);
          border-radius: var(--mw-radius); padding: 3px; width: fit-content;
        }
        .cg-tab {
          padding: 0.35rem 1rem; font-size: var(--mw-text-sm); font-weight: 500;
          color: var(--mw-text-muted); border: none; background: none; cursor: pointer;
          border-radius: calc(var(--mw-radius) - 2px); font-family: var(--mw-font);
          transition: color 120ms; text-decoration: none; display: inline-block;
        }
        .cg-tab:hover { color: var(--mw-text); }
        .cg-tab.is-active { background: var(--mw-surface); color: var(--mw-text); box-shadow: var(--mw-shadow); }
      `}</style>
      <div className="cg-page">
        <div className="cg-header">
          <h1 className="cg-header__title">Components</h1>
          <p className="cg-header__desc" id="cg-desc"></p>
          <div className="cg-header__count" id="cg-count"></div>
        </div>
        <div className="cg-tabs" id="cg-tabs"></div>
        <div id="cg-content"></div>
      </div>
    </>
  );
}
