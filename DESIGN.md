# maging Design Principles

maging 위젯의 시각적 품질 기준. AI 코드 생성 시 반드시 참조.

---

## 1. Shadow & Depth

카드/위젯은 그림자가 아닌 **border로 영역을 구분**한다.

- 기본 상태: `--mw-shadow` (테마별로 다름, 대부분 거의 보이지 않음)
- hover: `--mw-shadow-hover` (미세하게 깊어질 뿐, 뜨거나 번쩍이지 않음)
- accent 색을 shadow/border에 사용하지 않는다
- `transform: translateY` 등 hover 시 뜨는 효과 금지

### 테마별 shadow 톤 기준

| 유형 | 기본 shadow | hover shadow |
|------|------------|-------------|
| 라이트 (stripe, notion, claude) | `0 1px 3px` 계열, 무채색 | 살짝 깊어짐 |
| 다크 (vercel, github, bloomberg) | `0 0 0 1px` (border-ring) | ring opacity 증가 |

## 2. Color Usage

- **UI 기본 요소**는 무채색 (`--mw-text`, `--mw-text-muted`, `--mw-border`, `--mw-surface`)
- **accent 색**은 CTA 버튼, progress fill, 오늘 날짜 표시, active 상태에만
- **상태 색**(success/danger/warning)은 데이터의 의미를 전달할 때만 (증가/감소/경고)
- 아이콘 색은 `--mw-text-muted` (accent 아님)
- 카드 hover 시 border-color는 `--mw-text`를 18% 혼합 (accent 아님)
- **glow ring** (`box-shadow: 0 0 0 Npx accent/color`) 사용 금지

## 3. Typography

### 수치 표시
- 모든 숫자에 `font-variant-numeric: tabular-nums` 적용
- 큰 값: `letter-spacing: -0.02em` (타이트하게)
- 라벨: `letter-spacing: 0.01em` (약간 여유롭게)
- y축 라벨: mono font, fontSize 10

### 크기 위계
- KPI 값: `--mw-text-xl` (24px)
- Hero 값: `--mw-text-3xl` (44px)
- 위젯 제목: `--mw-text-base` (14px), weight 600
- 서브타이틀: `--mw-text-sm` (12.8px), muted
- 차트 축 라벨: 10-11px

## 4. Spacing & Density

정보 밀도는 Stripe Dashboard 수준을 지향한다.

- 카드 간 gap: `gap-3` (12px) — `gap-4` 이상은 과도함
- 섹션 간 margin: `mt-3` (12px)
- KPI 카드 내부 패딩: `space-2.5 space-3` (10px 12px)
- 불필요하게 넓은 여백 금지 (`pt-12`, `mb-8` 등)

## 5. Layout Asymmetry

균일한 그리드 반복은 AI 생성의 전형적 패턴이다.

### 금지
```html
<!-- 이렇게 하지 않는다 (균일 3등분 반복) -->
<div class="grid grid-cols-3">...</div>
<div class="grid grid-cols-3">...</div>
<div class="grid grid-cols-3">...</div>
```

### 권장
```html
<!-- 정보 중요도에 따라 비대칭 -->
<div class="grid grid-cols-[2fr_1fr]">...</div>    <!-- 주요 차트 넓게 -->
<div class="grid grid-cols-[2fr_2fr_3fr]">...</div> <!-- 마지막이 넓게 -->
<div class="grid grid-cols-1">...</div>             <!-- 풀와이드 -->
```

### 비대칭 비율 가이드
- 메인 차트 + 보조: `[3fr_1fr]` 또는 `[5fr_2fr]`
- 3열 차등: `[2fr_2fr_3fr]` 또는 `[2fr_3fr_2fr]`
- 단독 위젯: 풀와이드 `grid-cols-1`

## 6. ECharts Styling

차트 내부도 테마와 일관되어야 한다.

### 축 (Axis)
- x축 라인: `color: --mw-border`, width 1
- y축 라인: 숨김
- split line: `type: [4, 4]` (짧은 dash), `opacity: 0.6`
- 축 라벨: muted 색, 10-11px
- y축 라벨: **mono font** 사용 (숫자 정렬)

### 선/영역
- 선 두께: `1.5px` (2px는 과도함)
- symbol: `showSymbol: false` (hover 시에만 표시)
- symbol 크기: 3px
- 영역 채우기: `offset 0: color + '55'`, `offset 1: color + '08'`
- `smooth: 0.3` (완전 직선도 완전 곡선도 아닌 미세 곡선)
- `connectNulls: true` (null 값으로 선이 끊기지 않도록)

### 범례 (Legend)
- 아이콘: circle, 6x6px
- 간격: 14px
- 위치: 오른쪽 상단

### 툴팁
- 배경: `--mw-surface`
- 그림자: `0 4px 12px -4px rgba(0,0,0,0.15)` (가볍게)
- 폰트: 11px

## 7. Number Formatting

큰 숫자가 UI에 raw로 노출되면 안 된다.

### 원화 표기
- `₩` 접두사 사용 금지 — 한국식은 **접미사 `원`**
- `Maging.fmt.krw(4377800000)` → `43.8<span class="mw-unit">억원</span>`
- `.mw-unit` 클래스: `font-size: 0.65em`, `font-weight: 400`, `color: muted`
- 숫자는 크고 굵게, 단위는 작고 가볍게 — 시각적 위계

### 두 가지 포맷터
```javascript
// 위젯 value (HTML 가능)
value: Maging.fmt.krw(4377800000)        // → "43.8억원" (단위 작게 스타일링)

// 차트 y축/tooltip (plain text만 가능)  
yFormatter: Maging.fmt.krwPlain          // → "43.8억원" (순수 텍스트)

// 잘못됨
value: '₩43.8억'                        // ₩ 접두사 금지
value: '4377800000'                      // raw 숫자 노출
yFormatter: Maging.fmt.krw               // HTML이 차트에 렌더 안 됨
```

### NaN/undefined 방어
- `Maging.fmt.krw`, `.krwPlain`, `.num`, `.pct` 모두 NaN/null/Infinity → `'-'` 반환
- `escapeHTML()` 도 NaN/undefined → `'-'` 반환
- 차트 데이터에 null이 있어도 `connectNulls: true`로 선이 끊기지 않음

## 8. Anti-patterns (금지 목록)

| 패턴 | 이유 |
|------|------|
| hover 시 accent 색 border | AI 대시보드의 전형 |
| glow ring (`box-shadow: 0 0 0 Npx`) | AI 대시보드의 전형 |
| `transform: translateY(-1px)` hover | 카드가 뜨는 효과 |
| 균일 3등분 grid 반복 | 기계적 레이아웃 |
| accent 색 아이콘 | 장식적 색상 남용 |
| `glassmorphism` / `backdrop-filter` 카드 | 의미 없는 장식 |
| shadow에 accent 색 tint | 과시적 시각 효과 |
| 모든 곳에 동일한 border-radius | 위계 없음 |
| raw 숫자 (4377800000) 직접 표시 | 가독성 파괴 |
| 수동 포맷터 대신 커스텀 함수 | 이중 변환 버그 위험 |
