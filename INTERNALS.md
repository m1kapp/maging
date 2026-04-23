# maging — Internals / Contributor Guide

> 이 문서는 **maging 확장/수정** (새 위젯 추가, 새 테마 만들기, 내부 구조 수정)을 할 때 지켜야 할 규칙.
> 단순히 **위젯을 사용**하려는 에이전트는 [AGENT.md](./AGENT.md)를 참고.

---

## 📁 파일 구조

```
maging/
├── dist/
│   ├── maging.js            # 위젯 팩토리 + api object + 자동 마운트
│   ├── maging.core.css      # 공통 스타일 (테마 X)
│   ├── maging.css           # FULL 번들 (core + 모든 테마)
│   ├── maging-grid.js       # GridStack adapter (선택)
│   └── themes/
│       └── <name>.css           # 테마별 CSS 변수만 (25개)
├── data/
│   └── dashboard.json           # 데모 더미 데이터
├── demo.html                    # ACME 대시보드 데모
├── index.html                   # 랜딩 (소개 + 문서 + 갤러리)
├── AGENT.md                     # 에이전트 소비 지침 (외부용)
├── INTERNALS.md                 # 이 문서 (내부용)
└── README.md                    # 프로젝트 개요
```

**동기화 규칙:** CSS 수정 시 `maging.core.css`와 번들 `maging.css` 양쪽에 반영. 대부분 동일 스타일.

---

## 🎨 디자인 토큰 (하드코드 금지 · 토큰만 사용)

### Typography (8)
```css
--mw-text-xs:   0.72rem    /* 11.5px · chip, kicker, tiny meta */
--mw-text-sm:   0.8rem     /* 12.8px · label, caption, subtitle */
--mw-text-base: 0.875rem   /* 14px   · 위젯 타이틀(기본), body */
--mw-text-md:   1rem       /* 16px   · emphasis body */
--mw-text-lg:   1.25rem    /* 20px   · sub-heading */
--mw-text-xl:   1.5rem     /* 24px   · 큰 타이틀 */
--mw-text-2xl:  2rem       /* 32px   · 큰 값 (KPI, countdown) */
--mw-text-3xl:  2.75rem    /* 44px   · hero value */
```

### Spacing (11 · Tailwind 4px grid)
```css
--mw-space-0-5: 0.125rem   /*  2px */
--mw-space-1:   0.25rem    /*  4px · micro gap */
--mw-space-1-5: 0.375rem   /*  6px */
--mw-space-2:   0.5rem     /*  8px · tight padding */
--mw-space-2-5: 0.625rem   /* 10px */
--mw-space-3:   0.75rem    /* 12px · card inner gap */
--mw-space-3-5: 0.875rem   /* 14px */
--mw-space-4:   1rem       /* 16px · standard gap */
--mw-space-5:   1.25rem    /* 20px · card padding */
--mw-space-6:   1.5rem     /* 24px · section gap */
--mw-space-7:   1.75rem    /* 28px */
```

### Line-height (3)
```css
--mw-leading-none:  1      /* tight numbers, chart labels */
--mw-leading-tight: 1.2    /* headings, titles */
--mw-leading-snug:  1.35   /* compact body */
```

### Radius
```css
--mw-radius       /* 테마 기본 (2px~14px 테마별 상이) */
--mw-radius-full  /* 999px · pills, avatars, dots */
```

### Color (테마 변수 · 25개 테마가 모두 같은 이름 세트)
```css
--mw-bg           /* 페이지 배경 */
--mw-surface      /* 카드 배경 */
--mw-surface-2    /* 섹션/하이라이트 배경 */
--mw-border       /* 테두리 */
--mw-text         /* 본문 */
--mw-text-muted   /* 부가 */
--mw-accent       /* 브랜드 메인 */
--mw-accent-2     /* 보조 */
--mw-success      /* 긍정 (녹색 계열) */
--mw-warning      /* 주의 (노랑/오렌지) */
--mw-danger       /* 부정 (빨강) */
--mw-font / --mw-display-font / --mw-mono-font
--mw-shadow
--mw-border-w
```

### 사용 규칙
- 위젯 CSS에서 **모든 크기/간격/라인하이트는 `var(--mw-*)` 참조만**
- 하드코드 `0.5rem`, `14px` 등 금지 (픽셀 고정 width/height 제외)
- 새 간격이 꼭 필요하면 토큰부터 추가, 기존 토큰으로 불가능한 경우만

---

## 🧩 위젯 작성 규약

### 네이밍
- **Factory 함수**: camelCase (`kpiCard`, `progressStepper`)
- **Type string**: kebab-case (`kpi-card`, `progress-stepper`)
- **CSS 클래스**: `mw-<widget>` + BEM 스타일 서브요소 `mw-<widget>__<part>`

### 차트 위젯 (ECharts 사용)
**반드시 `_chartBase` 헬퍼 사용** — DOM 세팅, ECharts init/dispose, ResizeObserver 자동 처리.

```js
function myChart(el, config) {
  return _chartBase(el, config, {
    // defaults
    items: [], yFormatter: null,
  }, 'my-chart', function (data, c, palette) {
    // buildOption(data, colors, palette) → ECharts setOption payload
    return {
      textStyle: { fontFamily: c.font, color: c.text },
      series: [{ type: '...', data: data.items }]
    };
  }, function (data) {
    // optional extraHTMLFn: chart body 뒤에 붙일 HTML
    return data.context ? `<div class="mw-mychart__context">${escapeHTML(data.context)}</div>` : '';
  });
}
```

**`_chartBase` 시그니처:**
```ts
_chartBase(
  el,                    // selector string 또는 Element
  config,                // 사용자 config
  defaults,              // { title, subtitle, height, ... }
  type,                  // 'my-chart'
  buildOption,           // (data, colors, palette) => ECharts option
  extraHTMLFn?           // (data) => string (optional)
) => handle | null
```

자동으로 해주는 것:
- `el` 해석 (query 또는 Element)
- `mw-card` 클래스 + `headerHTML(title, subtitle)` + `mw-chart__body` 생성
- ECharts `init` / `dispose` / `setOption`
- `getColors()` 호출해서 `buildOption`에 전달
- `ResizeObserver` 부착 → 컨테이너 리사이즈 시 `chart.resize()` 자동 호출
- `register(handle)` — 테마 변경 시 전체 재렌더
- handle 반환: `.refresh()` `.update(data)` `.destroy()`

### HTML 위젯 (ECharts 없음)
직접 `render()` 작성:
```js
function myWidget(el, config) {
  el = q(el);
  if (!el) return null;
  var data = Object.assign({
    title: '', items: [],
  }, config || {});

  function render() {
    el.classList.add('mw-card');
    var items = (data.items || []).slice(0, 100).map(function (it) {
      return '<div class="mw-mywidget__item">' + escapeHTML(it.text) + '</div>';
    }).join('');
    el.innerHTML = headerHTML(data.title, data.subtitle) +
      '<div class="mw-mywidget">' + items + '</div>';
  }
  render();

  var handle = {
    el: el, type: 'my-widget',
    refresh: render,
    update: function (newData) { data = Object.assign(data, newData || {}); render(); },
    destroy: function () { el.innerHTML = ''; registry.delete(handle); },
  };
  return register(handle);
}
```

### 공통 헬퍼 (`maging.js` 내부 유틸)
```ts
q(sel)                                    // Element 반환 (selector 또는 Element 둘 다)
escapeHTML(s)                             // XSS-safe 텍스트
headerHTML(title, subtitle?, rightHTML?)  // 공용 헤더 HTML
getColors()                               // 현재 테마 CSS 변수 → JS 객체
baseTooltip(colors)                       // ECharts tooltip base 설정
fmt.krw(n) / fmt.num(n) / fmt.pct(n)      // 내장 포매터
register(handle)                          // theme refresh 레지스트리에 추가
seeded(seed) → rng()                      // 더미 데이터 시드 RNG
```

### 리스트형 위젯은 100개 cap 필수
```js
var items = (data.items || []).slice(0, 100).map(...);
```
스크롤은 `.grid-fill` CSS에서 `.mw-XXX__list { overflow-y: auto }`로 자동 처리.

---

## ✅ 새 위젯 추가 체크리스트

1. **`dist/maging.js` factory 함수 작성**
   - 차트: `_chartBase` 사용
   - HTML: `register` + `handle` 패턴
2. **`api` object에 등록** (`kpiCard: kpiCard,`)
3. **`meta` object에 title + desc 추가**
   ```js
   myWidget: { title: 'My Widget', desc: '간단 한국어 설명' }
   ```
4. **CSS 스타일 추가** — `maging.core.css` + `maging.css` **양쪽**
   - 토큰만 사용 (하드코드 금지)
   - `.mw-<widget>__<part>` 네이밍
5. **데모 데이터** — `data/dashboard.json`에 샘플 추가
6. **데모 렌더링** — `demo.html` `renderDashboard`에 호출 추가 + 레이아웃 그리드 슬롯
7. **`INSPECTOR_MAP` 코드 샘플** — `demo.html`에 실제 구현과 1:1 매치 코드
8. **`AGENT.md` 카탈로그** 업데이트 (카테고리별 표에 1줄)
9. **카운트 업데이트** — `AGENT.md` · `README.md` · `demo.html` 푸터 "N widgets"

---

## 🎨 새 테마 추가

1. **`dist/themes/<name>.css` 생성** — CSS 변수만 정의:
   ```css
   /*! maging theme: myco — MIT · Signature: <특징> */
   [data-theme="myco"] {
     --mw-bg: ...;
     --mw-surface: ...;
     /* 전체 테마 변수 세트 · 위 color 토큰 참조 */
   }
   ```
2. **번들 `maging.css`에 동일 블록 append**
3. **`maging.js` `themes` 배열에 슬러그 추가**
4. **demo.html `THEMES` 배열에 색상 팔레트 추가** (칩 렌더링용)
5. **드롭다운 `<option>`에 추가** — demo.html + index.html
6. **AGENT.md Light/Dark 분류 업데이트**

테마 규칙:
- **반드시 브랜드/서비스 지향** (pure color name 금지 — `ocean`, `sunset` 등 추상적 이름 X)
- Light 테마는 `--mw-bg`가 밝은 값, Dark는 어두운 값
- 구조 CSS 금지 — 변수만 정의

---

## 🚫 금지 사항

- **하드코드 rem/px 값** — 반드시 토큰 사용 (dimension 제외)
- **하드코드 color** — `var(--mw-*)` 참조만
- **테마별 if 분기** — CSS 변수로 자동 전환 되도록 설계
- **innerHTML 외부 조작** — 모든 DOM 수정은 `render()` 재실행으로
- **직접 `mw-card` 스타일 덮어쓰기** — 외부 소비자가 손댈 영역
- **새 위젯 타입명 중복** — api · meta · CSS · data 모두 일관되게

---

## 🔄 동기화 체크

코드 수정 후 항상:
```bash
# 양쪽 CSS 일치 확인
diff <(grep -E "^\." dist/maging.core.css | sort) \
     <(grep -E "^\." dist/maging.css | sort | grep -v data-theme)

# 토큰 정의 깨지지 않았는지 (재귀 참조 찾기)
grep "var(--mw-space-[0-9]" dist/maging.css | grep "mw-space"

# demo에 참조 없는 위젯 있는지
node -e "const api = require('./dist/maging.js'); console.log(Object.keys(api.meta))"
```

---

## 📦 배포

1. **버전 번호** — `maging.js` 상단 주석 + `README.md` + `AGENT.md` CDN URL 업데이트
2. **CHANGELOG 추가** (선택)
3. **git tag** — `v0.1.0` 식으로
4. **jsDelivr 자동 서빙** — 태그된 커밋이 `cdn.jsdelivr.net/npm/@m1kapp/maging@<version>/...`로 노출

---

## 🔧 유지보수 TIP

- **새 위젯 뭔가 깨지면** — `_chartBase` 썼는지 먼저 확인, `register()` 호출 누락 없나
- **테마 스왑 시 차트 색 안바뀌면** — 위젯 render 함수가 `getColors()`를 매번 호출하는지
- **grid-fill에서 차트 작게 찍히면** — ResizeObserver 부착 유무, chart body `flex:1` 확인
- **폰트 사이즈 어긋나 보이면** — `var(--mw-text-*)` 토큰 체인 무결성 (재귀 참조 방지)
