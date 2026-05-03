# maging

> 엔터프라이즈 리포트 빌더. 대시보드 · 주간보고 · 카드뉴스를 AI가 생성하고, 105개 브랜드 테마로 즉시 전환. CDN 한 줄, 빌드 스텝 없음.

```html
<script src="https://cdn.jsdelivr.net/npm/@m1kapp/maging@0.1.19/dist/maging-all.js"></script>
<body class="mw-themed">
```

[**라이브 데모**](https://maging.page) · [**컴포넌트 갤러리**](https://maging.page/components.html) · [**npm**](https://www.npmjs.com/package/@m1kapp/maging)

---

## 문서 가이드

| 문서 | 대상 | 내용 |
|------|------|------|
| **[AGENT.md](./AGENT.md)** | LLM / AI 에이전트 | 위젯 API 전체 레퍼런스. LLM이 이 파일만 읽으면 대시보드 생성 가능 |
| **[DESIGN.md](./DESIGN.md)** | 디자이너 / 기여자 | 시각 품질 기준 13섹션 — Shadow, Color, Typography, Responsive, 접근성, 다크모드, Anti-AI slop 등 |
| **[llms/](./llms/)** | LLM 프롬프트 | 모드별 생성 지침 — dashboard, weekly-report, card-news, landing |
| **이 README** | 개발자 | 설치, 위젯 목록, 테마, API 개요 |

---

## 4가지 모드

### 대시보드
KPI · 차트 · 테이블 · 캘린더 — 37종 위젯으로 운영 대시보드 생성.

### 주간보고
A4 가로 슬라이드 덱. 커버 5스타일 + pageHeader + KPI strip + monthlyTable + alertBanner. PPTX/PDF export.

### 카드뉴스
인스타그램/링크드인 캐러셀. 11종 카드(Cover 6스타일, Body, Quote, Stat, Comparison, Checklist, Step, Testimonial, CTA). 4:5 비율.

### 랜딩페이지
Hero · Pricing · Feature Grid · Testimonial · FAQ — SaaS 전환 페이지.

---

## 위젯 37종 + 카드뉴스 11종

**KPI/타일 (7)** · kpiCard · heroTile · metricChart · metricStack · compareCard · countdownTile · ringProgress  
**차트 (13)** · lineChart · barChart · donutChart · funnelChart · gaugeChart · radarChart · treemapChart · scatterChart · sankeyChart · heatmapChart · waterfallChart · mapChart · cohortMatrix  
**리스트/테이블 (5)** · leaderboard · activityTable · timeline · inboxPreview · statusGrid  
**캘린더 (2)** · calendarHeatmap · eventCalendar  
**프로젝트 (1)** · progressStepper  
**구조 (5)** · pageHeader · sectionHead · alertBanner · bulletChart · sparklineList  
**주간보고 (4)** · sectionCover · insightCard · defCard · monthlyTable  
**카드뉴스 (11)** · coverCard · bodyCard · dataCard · numberedCard · quoteCard · statCard · comparisonCard · checklistCard · stepCard · testimonialCard · ctaCard

---

## 테마 105개

```js
Maging.setTheme('bloomberg');
```

**Light (78)** · claude · linear · stripe · notion · airbnb · apple · hermes · tiffany · nike · tesla · starbucks · ...  
**Dark (27)** · vercel · github · bloomberg · openai · spotify · netflix · discord · ...

6개 디자인 철학 태그: `minimal` · `editorial` · `corporate` · `dark` · `bold` · `organic`

---

## 핵심 기능

### Auto-derive (산수 금지)
LLM이 직접 계산하지 않음. sparkline/series 데이터만 넣으면 value·delta를 위젯이 자동 계산.
```js
Maging.kpiCard('#kpi', {
  label: '매출', unit: '원',
  sparkline: [72억, 78억, 81억, 128억],
  // → value "128.0억원", delta "58.0%" 자동
});
```

### HTML value 자동 감지
`Maging.fmt.krw()` 등 HTML을 반환하는 포맷터를 value에 넣으면 자동 인식. `valueHTML: true` 수동 세팅 불필요.

### 105개 테마 즉시 전환
`Maging.setTheme('vercel')` 한 줄로 모든 위젯 리프레시. localStorage 자동 영속화.

---

## 설치

| 방식 | 코드 |
|------|------|
| **CDN (권장)** | `<script src="https://cdn.jsdelivr.net/npm/@m1kapp/maging@0.1.19/dist/maging-all.js"></script>` |
| **npm** | `npm i @m1kapp/maging` |
| **개별 로드** | `maging.css` + `maging.js` + ECharts 5 + Tailwind CDN |

`maging-all.js`는 Pretendard + maging.css + Tailwind CDN + ECharts 5 + maging.js를 번들. `maging:ready` 이벤트 발생.

---

## 의존성

- [ECharts 5+](https://echarts.apache.org/) — 차트 위젯 필수
- Tailwind CSS — 레이아웃용 (권장, 필수 아님)

## 브라우저 지원

모던 브라우저 (CSS `color-mix`, `:has()`, `aspect-ratio` 사용). IE/Opera Mini 미지원.

## License

MIT
