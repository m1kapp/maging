# maging — AI Output Formatter

> LLM이 위젯·테마로 단일 HTML 결과물을 즉시 생성. 코딩·디자인 불필요.

---

## Themes (104)

`<html data-theme="NAME">` — 팔레트·폰트·반경·그림자 즉시 교체.

**Light (24)**
`flow` indigo·기본 | `claude` 주황·고급 | `linear` 블루·미니멀 | `stripe` 보라·핀테크 | `notion` 시안·문서 | `airbnb` 코랄·서비스 | `linkedin` 블루·비즈니스 | `apple` 블루·IT | `hermes` 오렌지·럭셔리 | `tiffany` 민트·럭셔리 | `instagram` 핑크·SNS | `youtube` 빨강·미디어 | `duolingo` 라임·교육 | `morningmate` 퍼플·트렌디 | `medium` 그린·콘텐츠 | `reddit` 오렌지·커뮤니티 | `barbie` 핫핑크·패션 | `deere` 옐로·산업 | `fedex` 오렌지·물류 | `mailchimp` 옐로·마케팅 | `tmobile` 마젠타·통신 | `ups` 골드·물류 | `nasa` 빨강·과학 | `heineken` 레드·F&B

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

## Mode: Landing Page

> 마케팅 랜딩페이지와 전환 최적화에 특화된 모드입니다.

### Setup

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@m1kapp/maging@0.1.29/dist/maging.css">
<script src="https://cdn.jsdelivr.net/npm/@m1kapp/maging@0.1.29/dist/maging.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@m1kapp/maging@0.1.29/dist/maging-landing.js"></script>
<body class="mw-themed">
```

Landing mode uses `maging.js` + `maging-landing.js` (NOT `maging-all.js`). ECharts is optional — only needed if you use chart widgets. Place widget mount calls in a `<script>` tag after the maging scripts.

---

### Landing Page Widgets (10)

**`heroSection`** — Full-width hero with radial glow.
```js
Maging.heroSection(sel, {
  kicker?,       // uppercase label
  title,         // supports <br> for line breaks
  subtitle?,
  ctas?: [{ label, href, primary? }],
  padding?       // default '6rem 1.5rem 4rem'
})
```

**`featureGrid`** — Icon + title + description card grid.
```js
Maging.featureGrid(sel, {
  cols?,         // 2 | 3 | 4, default 3
  items: [{ icon, title, desc }]
})
```

**`pricingTable`** — Plan comparison with Popular badge.
```js
Maging.pricingTable(sel, {
  plans: [{
    name, desc?, price, period?,
    popular?, badge?,
    features: string[],
    cta?: { label, href }
  }]
})
```

**`testimonialGrid`** — Quote + author card grid.
```js
Maging.testimonialGrid(sel, {
  cols?,         // 2 | 3, default 3
  items: [{ quote, name, role?, initial? }]
})
```

**`logoBar`** — Social proof logo strip.
```js
Maging.logoBar(sel, { items: [{ name, icon? }] })
```

**`ctaSection`** — Conversion CTA block with background.
```js
Maging.ctaSection(sel, {
  kicker?, title, desc?,
  ctas: [{ label, href, primary? }],
  padding?
})
```

**`faqAccordion`** — Accordion FAQ.
```js
Maging.faqAccordion(sel, { items: [{ q, a }] })
```

**`stepGuide`** — Numbered "How it works" section with optional code/image.
```js
Maging.stepGuide(sel, {
  steps: [{
    title, desc?,
    code?,    // string — shown in dark code block
    image?    // string — image URL
  }]
})
```

**`codeBlock`** — Syntax display with Copy button.
```js
Maging.codeBlock(sel, { code, lang?, title? })
```

**`comparisonTable`** — Feature comparison (us vs them).
```js
Maging.comparisonTable(sel, {
  columns: string[],       // column headers
  highlight?: number,      // 0-based index of "our" column
  rows: [{
    label: string,         // feature name
    values: (boolean|string)[]  // true → ✓, false → —, string → as-is
  }]
})
```

---

### Layout Pattern

Landing pages use **section-based vertical scroll**, not dashboard grids.

```html
<section style="max-width:1100px;margin:0 auto;padding:5rem 1.5rem;">
  <div style="text-align:center;margin-bottom:2.5rem;">
    <p style="...kicker styles...">FEATURES</p>
    <h2 style="...title styles...">제목</h2>
    <p style="...desc styles...">설명</p>
  </div>
  <div id="feature-grid"></div>
</section>
```

**Section order:** Hero → Social proof (logos + stats) → Features → How it works (stepGuide) → Code example → Comparison → Testimonials → Pricing → FAQ → CTA

**Tips:**
- Use `<hr>` dividers between sections (1px solid, opacity 0.5)
- Center-align section headers for features, testimonials, pricing
- Left-align for step guide, FAQ, code examples
- Core widgets (`kpiCard`, `lineChart`, etc.) can be mixed in for data sections
- Keep testimonials to 3 (one row)
- Keep pricing to 2–3 plans

---

### Generation Rules (Landing Page)

1. Include the 3-line setup (css + maging.js + maging-landing.js).
2. Pick ONE theme. Landing pages work well with: `claude`, `linear`, `notion`, `stripe`, `vercel`.
3. `<body class="mw-themed">`.
4. Follow the section order above. Skip sections that don't apply.
5. Mount widgets in a `<script>` tag at the end of `<body>`.
6. **Copy tone:** Specific > generic. "슬랙 알림 보내려고 코드 짜는 건 이제 그만" beats "반복 업무를 자동화하세요".
7. **Numbers:** Use real-looking numbers (2,847 not 3,000). Avoid suspiciously round metrics.
8. **Testimonials:** Vary the structure. Not every quote should be "X가 Y% 줄었습니다".
9. **FAQ:** Short, conversational answers. "아뇨" > "아닙니다, 저희 서비스는~".
10. **No ₩ prefix.** Use Korean units: 4.9만, 128억.
11. Output one fenced code block: ` ```html … ``` `.
15. **Powered by:** `</main>` 바로 뒤에 버전 표시를 넣어라: `<div style="text-align:right;padding:1rem 1.5rem 0.5rem;font-size:0.6rem;color:var(--mw-text-soft,var(--mw-text-muted));opacity:0.5">powered by maging 0.1.29</div>`
