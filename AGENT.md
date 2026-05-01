# maging — 에이전트 사용 지침

> CDN drop-in 대시보드 위젯 라이브러리. ECharts 5 위에 얹은 **32종 위젯 + 35개 브랜드 테마**. 이 문서만 읽으면 모든 위젯을 즉시 사용 가능.

---

## 1. 설치 (CDN · 복붙)

**ECharts → maging 순서 엄수.** ECharts 없으면 차트 위젯은 빈칸.

```html
<!DOCTYPE html>
<html lang="ko" data-theme="claude">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@m1kapp/maging@0.1.11/dist/maging.css">
  <script defer src="https://cdn.jsdelivr.net/npm/@m1kapp/maging@0.1.11/dist/maging.js"></script>
</head>
<body class="mw-themed">
  <!-- 위젯 -->
</body>
</html>
```

---

## 2. 3가지 마운트 방식

### A. 속성 (`data-mw-widget`) — 스칼라 값
```html
<div data-mw-widget="kpi-card"
     data-mw-label="매출" data-mw-value="₩128억"
     data-mw-delta="8.3" data-mw-sparkline="420,445,430,468"></div>
```

### B. JSON script — 배열·중첩 객체
```html
<div data-mw-widget="line-chart" data-mw-config="cfg"></div>
<script type="application/json" id="cfg">
{ "categories": ["W1","W2"], "series": [{"name":"A","data":[1,2]}] }
</script>
```

### C. JS API — 동적/프로그래밍 생성
**반드시 `const` → 호출 순서** (주석 스펙 금지):
```js
const config = { title: '주간 매출', /* ... */ };
Maging.lineChart('#el', config);
```
`mw === Maging` alias. 반환 핸들: `.update()` · `.refresh()` · `.destroy()`.

---

## 3. 위젯 32종

**타입 이름 규칙:** HTML은 kebab-case (`kpi-card`), JS는 camelCase (`kpiCard`).

### 🔢 KPI / 타일 (7)
| type | 주요 필드 |
|---|---|
| `kpi-card` | `label, sparkline[], unit?, deltaGoodWhen` — value·delta는 sparkline에서 자동 계산 |
| `stat-card` | `label, value, delta, icon, deltaGoodWhen` |
| `hero-tile` | `label, value, icon, context, delta, sparkline[]` |
| `metric-stack` | `title, main:{label,value,delta}, items:[{label,value}]` |
| `compare-card` | `left:{label,value}, right:{label,value}, deltaLabel` — delta는 자동 계산 |
| `countdown-tile` | `label, target(Date\|ms\|ISO), context` · 매분 자동 갱신 |
| `ring-progress` | `value, max, unit, label, context, thresholds` |

### 📈 차트 (10 · 모두 `height` 지원)
| type | 주요 필드 |
|---|---|
| `line-chart` | `categories[], series:[{name,data[]}], stack, area, yFormatter, yMin, yMax` |
| `bar-chart` | `items:[{label,value}], horizontal, showLabels, yFormatter` |
| `donut-chart` | `slices:[{label,value,color}], centerLabel` — centerValue는 slices 합계에서 자동 계산 |
| `funnel-chart` | `stages:[{label,value}], valueSuffix` |
| `gauge-chart` | `value, max, unit, thresholds:[[ratio,'good'\|'warning'\|'danger']]` |
| `radar-chart` | `indicators:[{name,max}], series:[{name,data[]}]` |
| `treemap-chart` | `items:[{name,value}], valueFormatter` |
| `scatter-chart` | `points:[{x,y,label,size}]` 또는 `series:[{name,points}]`, `xLabel, yLabel` |
| `sankey-chart` | `nodes:[{name,color}], links:[{source,target,value}]` |
| `heatmap-chart` | `xAxis[], yAxis[], matrix[[]]` 또는 `values:[[x,y,v]]` |

### 📋 리스트 / 테이블 (5)
| type | 주요 필드 |
|---|---|
| `leaderboard` | `items:[{name, percent, meta?, initial?}]` |
| `activity-table` | `live, columns:[{key,label,align,render?}], rows:[]` |
| `timeline` | `items:[{time, text\|html, icon, type}]` |
| `inbox-preview` | `items:[{icon, text\|html, time, type}]` |
| `status-grid` | `columns(숫자), items:[{label, value?, status:'ok'\|'warning'\|'danger'}]` |

### 📅 캘린더 (2)
| type | 주요 필드 |
|---|---|
| `calendar-heatmap` | `year\|range, values:[[yyyy-mm-dd,n]], max, cellSize, valueSuffix` — GitHub 기여도 스타일 |
| `event-calendar` | `year, month(1-12), events:[{date, label, type, count}], startOfWeek, showList, listLimit, listFilter` — 월 그리드 + 점/배지, 오늘 자동 하이라이트 |

### 📊 프로젝트 (1)
| type | 주요 필드 |
|---|---|
| `progress-stepper` | `title, kicker, status:{label,type}, meta:[{label,value}], steps:[{label, date, status:'done'\|'active'\|'pending', badge?}]` |

**리스트 위젯은 자동 100개 cap + 스크롤.** JSON에 얼마를 넣어도 100개까지만 표시.
**공통:** 대부분 `title` / `subtitle` 지원.

---

## 4. 테마 35개

```js
Maging.setTheme('vercel');  // 모든 마운트 위젯 자동 리프레시
```

**Light (12):** `claude` · `linear` · `stripe` · `notion` · `airbnb` · `linkedin` · `instagram` · `youtube` · `reddit` · `medium` · `apple` · `duolingo`

**Dark (13):** `vercel` · `github` · `x` · `slack` · `discord` · `openai` · `spotify` · `twitch` · `netflix` · `figma` · `amazon` · `adobe` · `bloomberg`

커스텀 색은 CSS 변수로 덮어쓰기: `--mw-accent` · `--mw-surface` · `--mw-text` · `--mw-radius` · `--mw-font` 등.

---

## 5. 레이아웃

### 기본 — Tailwind grid
maging은 레이아웃 미강제. Tailwind로 조립:
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
  <div data-mw-widget="kpi-card" ...></div>
  <div class="lg:col-span-2" data-mw-widget="line-chart" data-mw-config="x"></div>
</div>
```
위젯 div에 `.mw-card`가 자동 부착 — padding/테두리 직접 수정 금지.

### Bento grid — `.grid-fill` 클래스
고정 행 높이 + 위젯이 셀을 꽉 채우는 레이아웃:
```html
<div class="grid grid-cols-3 gap-4 grid-fill" style="grid-auto-rows:400px">
  <div id="a"></div><div id="b"></div><div id="c"></div>
</div>
```
`.grid-fill`은 내부에서:
- 카드를 `height: 100%` + flex column으로 변환
- 차트 body를 `flex: 1`로 남은 높이 흡수
- ECharts가 ResizeObserver로 `chart.resize()` 자동 호출

**행 높이 티어** (gap-4 = 16px 기준, gap 포함해서 깔끔하게 쌓이는 값):
- **S**: `192px` · KPI/스탯 타일, calendar-heatmap 스트립
- **M**: `400px` · 일반 차트 (2×S + gap)
- **L**: `608px` · treemap/scatter/sankey (3×S + 2×gap)

### 모바일 (<1024px) 주의
- `progress-stepper`: 4+ 스텝이면 라벨 겹침 → 모바일에서 2~3 스텝 권장
- `event-calendar`: 7열 셀이 작아짐 → `showList:true`로 리스트 활용
- `activity-table`: 가로 스크롤 자동 (`.mw-table__wrap`)
- **권장: 뷰포트 1024px 이상 기본 설계**

---

## 6. 드래그앤드롭 대시보드 (선택 · GridStack adapter)

편집 가능한 대시보드가 필요하면 `maging-grid.js` adapter 추가 로드:
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/gridstack@10.3.1/dist/gridstack.min.css">
<script src="https://cdn.jsdelivr.net/npm/gridstack@10.3.1/dist/gridstack-all.js"></script>
<script src="./dist/maging-grid.js"></script>
```

```js
const dash = Maging.grid('#dashboard', {
  items: [
    { id: 'k1', type: 'kpi-card',   x: 0, y: 0, w: 3, h: 3, config: {...} },
    { id: 'rv', type: 'line-chart', x: 0, y: 3, w: 8, h: 6, config: {...} },
  ],
  autoSave: 'dashboard-v1',   // localStorage 자동 저장 키
  editable: true,
  gridOptions: { cellHeight: 60, margin: 8, column: 12 },
});

dash.lock() / dash.unlock() / dash.toggleLock();
dash.add({...}) / dash.remove(id) / dash.update(id, newConfig);
dash.reset() / dash.getLayout() / dash.destroy();
```

**규칙:**
- 편집 가능한 대시보드 → `Maging.grid()` 사용, 직접 GridStack API 금지
- 섹션별로 grid 분리하면 섹션별 레이아웃 독립 저장 (localStorage key 분리)

---

## 7. 자주 하는 실수

- ❌ ECharts 누락 → 차트 위젯 빈칸
- ❌ `"kpiCard"` → 반드시 **kebab-case** (`kpi-card`)
- ❌ `data-mw-sparkline="1, 2, 3"` → 공백 제거 (`"1,2,3"`)
- ❌ 중첩 객체를 `data-mw-*`에 → `data-mw-config` + JSON script 사용
- ❌ innerHTML 직접 수정 → `.update()` / `.refresh()` 사용
- ❌ 낮을수록 좋은 지표(응답시간·이탈률)에 `deltaGoodWhen: "negative"` 빠뜨림
- ❌ 코드 샘플 `Fn(data.x); // data.x: /* 주석 */` → `const x = {...}; Fn(x)`
- ❌ 차트 `height`에 임의 값 → `SIZE.S(120) / M(240) / L(360)` 중 선택

---

## 8. 최소 예시 (복붙 가능)

```html
<!DOCTYPE html>
<html lang="ko" data-theme="claude">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js"></script>
  <link rel="stylesheet" href="./dist/maging.css">
  <script defer src="./dist/maging.js"></script>
</head>
<body class="mw-themed">
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 grid-fill p-6 max-w-[1200px] mx-auto"
       style="grid-auto-rows:192px">
    <div data-mw-widget="kpi-card"
         data-mw-label="매출" data-mw-value="₩128억"
         data-mw-delta="8.3"
         data-mw-sparkline="420,445,430,468,510,548,580"></div>

    <div data-mw-widget="ring-progress" data-mw-config="c1"></div>
    <script type="application/json" id="c1">
    { "title":"목표 달성률","value":78,"max":100,"unit":"%","label":"Q2" }
    </script>

    <div data-mw-widget="compare-card" data-mw-config="c2"></div>
    <script type="application/json" id="c2">
    { "left":{"label":"지난 주","value":"₩118억"},
      "right":{"label":"이번 주","value":"₩128억"},
      "delta": 8.5, "deltaLabel":"(+₩10억)" }
    </script>
  </div>

  <div class="grid grid-cols-1 gap-4 mt-4 grid-fill p-6 max-w-[1200px] mx-auto"
       style="grid-auto-rows:400px">
    <div data-mw-widget="line-chart" data-mw-config="c3"></div>
    <script type="application/json" id="c3">
    {
      "title":"주간 매출","subtitle":"최근 8주",
      "categories":["W1","W2","W3","W4","W5","W6","W7","W8"],
      "series":[{"name":"Ent","data":[420,468,475,510,530,548,562,580]}]
    }
    </script>
  </div>
</body>
</html>
```

---

## 9. 준수 원칙

1. **스켈레톤으로 시작**, ECharts 누락 금지
2. **위젯 타입은 §3 목록에서만** — 발명/유추 금지
3. **레이아웃은 Tailwind grid**, 위젯 내부 스타일 직접 수정 금지
4. **테마는 `<html data-theme>` 한 곳**, 커스텀은 CSS 변수로
5. **숫자 포맷**: 큰 수는 값에 미리 (`"₩128억"`), 축 라벨은 `yFormatter` 함수
6. **사용자 제공 지표·수치는 그대로 반영**, 임의 가감 금지
7. **JS 샘플은 `const config = {...}; Fn('#el', config)`** — 주석-블록 스펙 금지
8. **차트 `height`는 3-티어** (`S:120 / M:240 / L:360`), 임의 값 금지
9. **리스트 많을 땐 자동 cap (100개) + 스크롤** — 위젯이 알아서 처리
