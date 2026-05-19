# maging — AI Output Formatter

> LLM이 위젯·테마로 단일 HTML 결과물을 즉시 생성. 코딩·디자인 불필요.

---

## Themes (104)

`<html data-theme="NAME">` — 팔레트·폰트·반경·그림자 즉시 교체.

**Light (25)**
`flow` indigo·기본 | `morningmate` 퍼플·트렌디 | `innon` 블루·기업 | `claude` 주황·고급 | `linear` 블루·미니멀 | `stripe` 보라·핀테크 | `notion` 시안·문서 | `airbnb` 코랄·서비스 | `linkedin` 블루·비즈니스 | `apple` 블루·IT | `hermes` 오렌지·럭셔리 | `tiffany` 민트·럭셔리 | `instagram` 핑크·SNS | `youtube` 빨강·미디어 | `duolingo` 라임·교육 | `medium` 그린·콘텐츠 | `reddit` 오렌지·커뮤니티 | `barbie` 핫핑크·패션 | `deere` 옐로·산업 | `fedex` 오렌지·물류 | `mailchimp` 옐로·마케팅 | `tmobile` 마젠타·통신 | `ups` 골드·물류 | `nasa` 빨강·과학 | `heineken` 레드·F&B

**Dark (13)**
`vercel` 블랙·미니멀 | `github` 블루·개발 | `bloomberg` 앰버·금융 | `openai` 청록·AI | `spotify` 그린·음악 | `netflix` 빨강·미디어 | `discord` 퍼플·게임 | `x` 블루·소셜 | `slack` 골드·협업 | `twitch` 퍼플·라이브 | `figma` 오렌지·디자인 | `amazon` 오렌지·커머스 | `adobe` 빨강·크리에이티브

**분위기 매칭:** 금융→`stripe`/`bloomberg` · SaaS→`linear`/`vercel` · AI→`openai`/`claude` · 마케팅→`instagram`/`mailchimp` · 럭셔리→`hermes`/`tiffany` · 개발→`github`/`vercel`. Default: `claude`.

---

## Widgets

`Maging.<name>(sel, config)` — 테마 변경 시 자동 새로고침. 공통: `title?`, `subtitle?`.

### METRIC
**`kpiCard`** `{ label, sparkline, unit?, deltaGoodWhen?, compact?, sparkLabel? }` — value·delta는 sparkline에서 자동 계산.
**`heroTile`** `{ kicker?, value, tagline?, stats?:[{label,value}] }`
**`metricChart`** `{ label, categories, series:[{name,data}], target?, yFormatter? }` — value·delta 자동 계산.
**`metricStack`** `{ title, main:{label,value,delta?}, items:[{label,value}] }`
**`compareCard`** `{ title, left:{label,value}, right:{label,value} }` — delta 자동 계산.
**`countdownTile`** `{ title, target, label? }`
**`ringProgress`** `{ value, max, unit, label, thresholds? }`
**`bulletChart`** `{ value, target?, max, unit? }`
**`sparklineList`** `{ title, items:[{label,sparkline,unit?,deltaGoodWhen?}] }`

### CHARTS
**`lineChart`** `{ categories, series:[{name,data}], stack?, area?, yFormatter? }`
**`barChart`** 단일: `{ items:[{label,value}], horizontal? }` / multi: `{ categories, series:[{name,data}], stack? }`
**`donutChart`** `{ slices:[{label,value}], centerLabel? }` — centerValue 자동 계산.
**`funnelChart`** `{ stages:[{label,value}] }` — 전환 단계 전용.
**`gaugeChart`** `{ label, value, max, unit, thresholds? }`
**`radarChart`** `{ indicators:[{name,max}], series:[{name,data}] }`
**`heatmapChart`** `{ xAxis, yAxis, matrix, max? }`
**`treemapChart`** `{ items:[{name,value}] }`
**`scatterChart`** `{ points:[{label,x,y,size?}], xLabel?, yLabel? }`
**`sankeyChart`** `{ nodes:[{name}], links:[{source,target,value}] }`
**`waterfallChart`** `{ items:[{label,value,type?}] }`
**`cohortMatrix`** `{ cohorts, periods, data }`

### LISTS
**`leaderboard`** `{ items:[{name,percent,meta?}] }`
**`activityTable`** `{ columns:[{key,label,align?,render?}], rows:[...], headerGroups? }`
**`timeline`** `{ items:[{time,text,type?}] }`
**`statusGrid`** `{ columns?, items:[{label,status,value?}] }`

### STRUCTURAL
**`pageHeader`** `{ title, meta? }`
**`sectionHead`** `{ title, index?, kicker? }`
**`alertBanner`** `{ type, title, message? }`

---

## Utility

```js
Maging.fmt.krw(v)       // 43.8억원 (HTML)
Maging.fmt.krwPlain(v)  // 43.8억원 (plain)
Maging.fmt.num(v)       // 48,291
Maging.fmt.pct(v)       // 85.3%
Maging.setTheme(name)
```

---

## Data Consistency (산수 금지)

| 위젯 | 넣지 마라 | 자동 계산 |
|------|-----------|----------|
| `kpiCard` | value, delta | sparkline → value+unit, delta% |
| `metricChart` | value, delta | series → value, delta% |
| `donutChart` | centerValue | slices 합계 |
| `compareCard` | delta | left·right 차이 |

---

## NEVER

- Maging 위젯으로 표현 가능하면 **반드시 위젯을 써라.** 위젯으로 안 되는 부분만 Tailwind + HTML로 보충.
- `₩` prefix 금지 → `Maging.fmt.krw` 사용
- `DOMContentLoaded` 금지 → `maging:ready`
- `:root` CSS 변수 금지 — `--mw-*` 토큰은 maging.css 정의
- 코드 주석 금지 — 토큰 낭비
- `grid-auto-rows` 금지
- kpiCard에서 value/delta 직접 계산 금지
- 라인차트 시리즈 3개+ 금지
- 도넛 슬라이스 6개+ 금지
- `funnelChart`를 비순차 데이터에 쓰지 마라

**Anti-AI slop:**
- 보라+청록 그라데이션 금지
- 둥근카드+accent border 콤보 금지
- 등차수열 데이터 금지
- KPI delta 전부 양수 금지
- `font-weight: 800+` 남발 금지

---

## Output Rules

- 항상 `<!DOCTYPE html>`부터 `</html>`까지 완전한 단일 HTML.
- 생략·축약·placeholder 절대 금지.
- 수정 시에도 전체 파일 재출력.

MIT


---

## Mode: Dashboard

> 데이터 모니터링과 운영 대시보드에 최적화된 모드입니다.

### Setup

```html
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdn.jsdelivr.net/npm/@m1kapp/maging@0.1.32/dist/maging-all.js" data-no-tailwind></script>
<body class="mw-themed">
```

`<head>`에 Tailwind CDN 먼저, `maging-all.js`에 `data-no-tailwind` 추가. `maging-all.js` bundles: Pretendard + maging.css + ECharts 5 + maging.js. Dispatches `'maging:ready'` on `window`.

**Mount ALL widgets inside `maging:ready`:**
```js
window.addEventListener('maging:ready', () => {
  Maging.kpiCard('#el', { label: '매출', unit: '억원', sparkline: [98,105,112,118,128] });
});
```

**DO NOT use `DOMContentLoaded`** — it fires before ECharts loads.

---

### Layout Primitives

Outer wrapper: `<main class="max-w-[1100px] mx-auto px-6 py-4">`. Stack sections with `mt-5 pt-4`.

**`pageHeader`** → Full-width H1. Use once at top.
**`sectionHead`** → Section divider. Mount **outside** grid cells.

```html
<div id="page-hero" class="pt-4 pb-2"></div>
<div class="mt-5 pt-4" style="border-top:1px solid var(--mw-border)">
  <div id="section-01"></div>
  <div class="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-3 mt-3">
    <div id="chart-a"></div><div id="chart-b"></div>
  </div>
</div>
```

---

### Canonical Layouts

**1 · KPI Row**
```html
<div class="grid grid-cols-2 md:grid-cols-4 gap-3">
```

**2 · Hero + Side (asymmetric)**
```html
<div class="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-3">
```

**3 · Equal Split**
```html
<div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
```

**4 · Asymmetric Trio**
```html
<div class="grid grid-cols-1 lg:grid-cols-[2fr_2fr_3fr] gap-3">
```

**5 · Full-Width Detail**
```html
<div class="grid grid-cols-1 gap-3">
```

위젯이 자체 높이를 가지므로 `grid-auto-rows` 불필요. 차트 위젯에 `height` config를 쓸 수 있다.

---

### Generation Rules (Dashboard)

0. **Default = static snapshot.** You are the analyst — pick the story, arrange widgets. No interactive state unless asked.
1. Include the one-liner setup.
2. Pick ONE theme via `<html data-theme="…">`.
3. `<body class="mw-themed">`.
4. Compose layout from canonical patterns. Pick heights from tokens.
5. Mount ALL widgets inside `maging:ready`. Never use `DOMContentLoaded`.
6. Widget choice by data shape:
   - Time series → `lineChart` · Categorical → `barChart` · Share → `donutChart`
   - Funnel → `funnelChart` · Target vs actual → `bulletChart`/`ringProgress`
   - Distribution → `treemapChart`/`heatmapChart` · Flow → `sankeyChart`
   - Correlation → `scatterChart` · Korean geo → `mapChart`
   - Retention → `cohortMatrix` · P&L → `waterfallChart` · Rankings → `leaderboard`
   - Events → `timeline`/`activityTable` · Health → `statusGrid`+`gaugeChart`
   - OKR → `goalGrid` · Multi-trend → `sparklineList` · Hero metric → `heroTile`
7. **KRW:** `Maging.fmt.krw(v)` for HTML, `Maging.fmt.krwPlain(v)` for chart axes. NEVER use `₩`.
8. **Numbers:** Pass raw numbers to chart data. Use formatters for display.
8a. **산수 금지:** kpiCard·metricChart·sparklineList는 sparkline/series 데이터만 넣어라. value·delta를 직접 계산하지 마라 — 위젯이 자동 계산한다.
9. Korean labels OK. Use `word-break: keep-all`.
10. Section order: at-a-glance → real-time → trends → deep-dive → operations.
11. **Density:** `gap-3` everywhere. `mt-5 pt-4` for sections. No large spacings.
12. **Asymmetric grids:** Vary column ratios. Never repeat same pattern consecutively.
13. **1차트 1인사이트:** 라인차트 시리즈 최대 2개. 비교는 동일 카테고리끼리만.
    - 2025실적 vs 2026실적 vs 2026계획 → 차트 2개로 분리: ① 2025 vs 2026 실적(YoY) ② 2026 실적 vs 계획(달성률).
    - 데이터 포인트 3개 미만인 시리즈는 라인차트 금지 — 선이 아니라 점이 된다.
14. Output one fenced code block: ` ```html … ``` `.
15. **Powered by:** `</main>` 바로 뒤에 버전 표시를 넣어라: `<div style="text-align:right;padding:1rem 1.5rem 0.5rem;font-size:0.6rem;color:var(--mw-text-soft,var(--mw-text-muted));opacity:0.5">powered by maging 0.1.32</div>`
