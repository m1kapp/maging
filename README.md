# magicwiget

> CDN drop-in 엔터프라이즈 대시보드 위젯. ECharts 기반 · 25종 위젯 · 25개 브랜드 테마 · 빌드 스텝 없음.

```html
<script src="https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/<user>/magicwiget@v0.1.0/dist/magicwiget.css">
<script defer src="https://cdn.jsdelivr.net/gh/<user>/magicwiget@v0.1.0/dist/magicwiget.js"></script>

<div data-mw-widget="kpi-card"
     data-mw-label="매출" data-mw-value="₩128억"
     data-mw-delta="8.3"
     data-mw-sparkline="420,445,430,468,510,548,580"></div>
```

[**→ 라이브 데모**](./demo.html) · [**에이전트 지침 (AGENT.md)**](./AGENT.md)

---

## 사용 방법

### Declarative — `data-mw-widget`
DOM 로드 시 자동 마운트. 간단한 위젯에 가장 빠름.
```html
<div data-mw-widget="line-chart" data-mw-config="cfg"></div>
<script type="application/json" id="cfg">
{ "categories": ["W1","W2"], "series": [{"name":"A","data":[1,2]}], "height": 240 }
</script>
```

### Imperative — JS API
동적 데이터·업데이트·외부 연동에. 핸들이 `.update()` / `.refresh()` / `.destroy()` 지원.
```js
const config = { title: '주간 매출', categories: [...], series: [...] };
const chart = MagicWiget.lineChart('#el', config);
chart.update({ series: newData });
```

## 위젯 25종

**KPI/타일 (7)** · kpiCard · statCard · heroTile · metricStack · compareCard · countdownTile · ringProgress
**차트 (10)** · lineChart · barChart · donutChart · funnelChart · gaugeChart · radarChart · treemapChart · scatterChart · sankeyChart · heatmapChart
**리스트/테이블 (5)** · leaderboard · activityTable · timeline · inboxPreview · statusGrid
**캘린더 (2)** · calendarHeatmap · eventCalendar
**프로젝트 (1)** · progressStepper

각 위젯의 필드는 [AGENT.md §4](./AGENT.md) 참고. 런타임 메타데이터는 `MagicWiget.meta[widgetName]`에서 확인.

## 테마 25개

```js
MagicWiget.setTheme('bloomberg');  // 마운트된 모든 위젯 자동 리프레시
```

**Light (12)** · `claude` `linear` `stripe` `notion` `airbnb` `linkedin` `instagram` `youtube` `reddit` `medium` `apple` `duolingo`

**Dark (13)** · `vercel` `github` `x` `slack` `discord` `openai` `spotify` `twitch` `netflix` `figma` `amazon` `adobe` `bloomberg`

각 테마는 `dist/themes/<name>.css`로 개별 로드 가능. 커스텀 색은 `--mw-accent`, `--mw-surface`, `--mw-text`, `--mw-radius` 등 CSS 변수를 `[data-theme="myteam"]` 스코프에서 덮어쓰기.

## 드래그앤드롭 대시보드 (GridStack adapter)

편집 가능한 대시보드가 필요하면 `magicwiget-grid.js` adapter 추가 로드:

```html
<!-- 의존: ECharts + GridStack -->
<script src="https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/gridstack@10.3.1/dist/gridstack.min.css">
<script src="https://cdn.jsdelivr.net/npm/gridstack@10.3.1/dist/gridstack-all.js"></script>

<!-- magicwiget + adapter -->
<link rel="stylesheet" href="./dist/magicwiget.css">
<script src="./dist/magicwiget.js"></script>
<script src="./dist/magicwiget-grid.js"></script>
```

```js
const dash = MagicWiget.grid('#dashboard', {
  items: [
    { id: 'kpi-1', type: 'kpi-card', x: 0, y: 0, w: 3, h: 3,
      config: { label: '매출', value: '₩128억', delta: 8.3, sparkline: [...] } },
    { id: 'rev',   type: 'line-chart', x: 0, y: 3, w: 8, h: 6,
      config: { title: '주간 매출', categories: [...], series: [...] } },
  ],
  autoSave: 'my-dashboard-v1',   // localStorage key (null이면 영속화 비활성)
  editable: true,                 // false면 static view
  gridOptions: { cellHeight: 60, margin: 8, column: 12 },  // GridStack options
  onLayoutChange: (layout) => { /* ... */ },
});

// 제어 API
dash.lock();              // 편집 불가
dash.unlock();            // 편집 가능
dash.add({ type: 'bar-chart', x: 0, y: 99, w: 4, h: 5, config: {...} });
dash.remove('kpi-1');
dash.update('rev', { yMax: 1_000_000_000 });   // 특정 위젯 config 갱신
dash.reset();             // localStorage 클리어 + 기본 레이아웃 복원
dash.getLayout();         // 현재 배치 스냅샷 (저장/내보내기용)
```

동작 원리:
- 각 위젯이 `.grid-stack-item-content` 안에 마운트됨
- GridStack이 cell 리사이즈 → magicwiget 위젯 내부 `ResizeObserver`가 `chart.resize()` 호출 → ECharts 즉시 리렌더
- 빌드 스텝 없음, vanilla JS, adapter는 ~200줄

## 사이즈 토큰 (차트)

차트 `height` 값은 3-티어에서 선택:
```js
const SIZE = { S: 120, M: 240, L: 360 };
```
- **S (120)**: `calendar-heatmap` 등 납작한 시계열
- **M (240)**: 대부분의 차트 (기본)
- **L (360)**: `treemap`, `scatter`, `sankey` 등 복합 시각화

## 의존성

- [ECharts 5+](https://echarts.apache.org/) — 차트 위젯에 필수 (HTML 위젯만 쓰면 생략 가능)
- Tailwind — 권장 (레이아웃용, 위젯 자체에는 불필요)

## 설치 모드

| 모드 | 로드 | 용도 |
|---|---|---|
| **Full bundle** | `dist/magicwiget.css` + `dist/magicwiget.js` | 모든 테마 포함. 토글 지원 필요 시 |
| **Modular** | `dist/magicwiget.core.css` + `dist/themes/<name>.css` | 단일 테마만 로드 (~1.5KB 절약) |

## 브라우저 지원

모던 브라우저 (CSS `color-mix`, `:has()`, `aspect-ratio` 사용). IE/Opera Mini 미지원.

## License

MIT
