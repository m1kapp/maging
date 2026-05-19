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

## Mode: Slide (슬라이드)

> **`Maging.page()` API를 우선 사용하라.** 모든 슬라이드는 `slides` 배열의 `widgets`로 선언. 위젯으로 표현 가능한 내용을 HTML로 직접 그리지 마라. 위젯으로 안 되는 부분만 Tailwind + HTML로 보충.

### Setup
```html
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdn.jsdelivr.net/npm/@m1kapp/maging@0.1.31/dist/maging-all.js" data-no-tailwind></script>
```
`<head>`에 Tailwind CDN을 먼저 로드하고, `maging-all.js`에 `data-no-tailwind`를 붙여 중복 로드를 방지. `maging:ready` 안에서 `Maging.page()` 호출.

---

### 보고서 위젯

**KPI 카드** — `{ label, value, valueHTML?, delta, deltaGoodWhen }` — KPI 한 줄에 최대 4개.
**monthlyTable** — `{ title, rows:[{name, data:[v,…]}], unitToggle?, viewToggle? }` — 단위 통일 시.
**activityTable** — `{ columns:[{key,label,align?,render?}], rows, headerGroups? }` — 단위 혼합 시. 12개월 표는 `<div class="scroll-table" style="height:300px">` wrapper.

**차트 선택:** 추이→`lineChart` · 비교→`barChart` · 비율→`donutChart` · 목표달성→`bulletChart`/`ringProgress`

**HTML 컴포넌트:**
- `issue-card issue-card--danger/--warning/--info` — 이슈 3열 그리드
- `def-card` + `hbar` — 지표 정의 + 수평 분포 바

---

### 프레젠테이션 위젯

headline에 `**bold**` 마크업 → accent 색상 자동 변환.

**`sectionCover`** `{ style:'classic', kicker, title, subtitle?, brand?, meta? }` — 커버 슬라이드.
**`pitchCover`** `{ company, tagline?, logo?, subtitle?, style?:'bold'|'minimal'|'gradient' }`
**`problemSlide`** `{ headline, points:[{icon,title,desc}], highlight? }` — 2~4개 문제 카드.
**`solutionSlide`** `{ headline, before?:{label,items}, after?:{label,items}, features? }` — 좌우 비교 또는 기능 그리드.
**`metricHighlight`** `{ metrics:[{value,unit?,label}] }` — 대형 숫자 2~4개.
**`marketSlide`** `{ headline?, tam, sam, som, insight?, sources? }` — TAM/SAM/SOM 동심원.
**`competitorMatrix`** `{ headline?, axisX:{label,low,high}, axisY:{…}, players:[{name,x,y,highlight?}] }`
**`bizModelSlide`** `{ headline?, tiers:[{name,price,period?,features,popular?}], note? }`
**`timelineSlide`** `{ headline?, milestones:[{date,title,desc?,done?,active?}] }`
**`teamSlide`** `{ headline?, members:[{name,role,exp?}], advisors? }`
**`chainFlow`** `{ headline?, steps:[{label?,title,desc?,accent?}], footer? }` — 가치 체인/프로세스.
**`compareSlide`** `{ headline?, left:{label,rows:[{key,value}]}, right:{…}, note? }`
**`askSlide`** `{ headline, useOfFunds:[{label,pct}], milestones?, contact? }`
**`quoteSlide`** `{ quote, author?, role?, style?:'minimal'|'boxed' }`
**`referenceTable`** `{ headline?, columns, rows:[{cells:[…]}] }`
**`storySlide`** `{ headline?, chapters:[{tag,title,desc}], footer?, flow? }`
**`swotSlide`** `{ headline?, quadrants:[{label,items}] }`
**`roadmapSlide`** `{ headline?, periods, tracks:[{label,items:[{name,start,end,bar}]}] }`
**`featureSlide`** `{ headline?, items:[{icon?,title,desc?}], cols? }`
**`flywheelSlide`** `{ headline?, steps:[{title,desc?,icon?}], summary? }`
**`deepDiveSlide`** `{ role:{from,to,message}, columns:[{title,items}] }`
**`callout`** `{ text, variant?:'surface'|'accent'|'highlight' }`

---

### Maging.page API

```js
window.addEventListener('maging:ready', function () {
  Maging.page({
    mode: 'slide',
    sidebarTitle: '제목',
    sidebarDate: '2026.04.27',
    slides: [
      { id: 'cover', cover: true, widgets: [{ type: 'sectionCover', style: 'classic', kicker: 'REPORT', title: '제목', subtitle: '부제', brand: 'brand' }] },
      { id: 'kpi-1', label: 'KPI 1', bu: '사업부', team: '팀',
        widgets: [
          { type: 'pageHeader', title: '매출 현황', meta: '기준일' },
          { type: 'kpiCard', label: '매출', value: '128억', delta: 8.3, deltaGoodWhen: 'positive' },
          { type: 'sectionHead', title: '월별 추이' },
          { type: 'monthlyTable', title: '매출', rows: [/*...*/] },
          { type: 'alertBanner', bannerType: 'info', title: '리뷰', message: '요약' },
        ],
      },
      { id: 'problem', label: 'Problem', widgets: [{ type: 'problemSlide', headline: '**78%**가 문제', points: [{icon:'⏱️',title:'제목',desc:'설명'}] }] },
    ],
  });
});
```

- 넘치면 자동 분할. 대시보드 위젯 + 프레젠테이션 위젯 자유 조합.

---

### Generation Rules

1. **1슬라이드 = 1주제.** 보고서는 1 KPI, 피치는 1주장.
2. `<html data-theme="…">` — theme 선택.
3. **단위 필수** — 명/건/개/원/%.
4. **KPI label에 목표 포함** — `'3월 신규 · 목표 1.42억원'`.
5. **마지막은 alertBanner** — 1-2문장 요약.
6. **KPI 한 줄 최대 4개.** 1장 최대 위젯 7~8개.
7. 차트 + 테이블 동시 배치 금지.
8. 같은 label로 슬라이드 분리 가능 — 사이드바에서 dot으로 표시.
9. **커버:** `sectionCover` style `'classic'`.

**Output:** 단일 ` ```html … ``` ` 블록. `maging-all.js` 1개면 전부 자동.
