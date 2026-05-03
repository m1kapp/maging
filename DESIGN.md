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

## 8. Accessibility (접근성)

### 색상 대비

- 텍스트 ↔ 배경: **최소 4.5:1** (WCAG AA)
- 대형 텍스트(24px+) ↔ 배경: **최소 3:1**
- 비활성(disabled) 요소는 대비 제한 없음

### 터치 타겟

- 클릭/탭 가능한 요소: **최소 44×44px** hit area
- 아이콘 버튼이 작아 보여도 hit area는 44px 유지 (padding 활용)

### 키보드

- 모든 인터랙티브 요소는 Tab으로 접근 가능
- focus-visible 스타일 제거 금지

## 9. Dark Mode 규칙

### 원칙

- **단순 색상 반전 금지** — hex 반전은 틀린 색을 만든다
- **그림자 → surface 계층으로 대체** — 어두운 배경 위 그림자는 보이지 않음
- **순백 (#FFFFFF) 텍스트 금지** — `#E0E0E0 ~ #F0F0F0` 범위의 off-white 사용. 과도한 대비는 눈 피로

### Surface 계층 (4단계)

| 단계 | 용도 | 밝기 방향 |
|------|------|----------|
| `--mw-bg` | 페이지 배경 (가장 어두움) | base |
| `--mw-surface` | 카드/위젯 배경 | +5~8% luminance |
| `--mw-surface-2` | 호버/선택 강조 | +8~12% luminance |
| overlay | 모달/드롭다운 | +12~16% luminance |

**올라갈수록 밝아진다** — 물리적 깊이와 동일한 멘탈 모델.

### Accent 색 조정

- 라이트 모드의 accent를 다크에 그대로 쓰지 마라
- 어두운 배경에서 채도 높은 색은 탁해 보임 → 채도 올리거나 밝은 hue로 shift
- 각 테마의 CSS 파일에서 다크 전용 accent 정의

## 10. Chart Readability (차트 가독성)

### 1차트 1인사이트

- 라인차트 시리즈는 **최대 2개**. 3개 이상이면 차트를 분리하라.
- 데이터 포인트가 **3개 미만**인 시리즈는 라인차트에 넣지 마라 — 선이 아니라 점이 된다.
- 비교하려면 **동일 카테고리끼리만**: "제품군1 2025 vs 2026" (O), "제품군1+2+3+4 전부" (X).
- 해석이 바로 되지 않는 차트는 그리지 마라.

### 차트 선택 가이드

| 데이터 형태 | 위젯 |
|------------|------|
| 시계열 추이 | lineChart (시리즈 2개 이내) |
| 카테고리 비교 | barChart |
| 비율/구성 | donutChart |
| 목표 대비 달성 | bulletChart / ringProgress |
| 순위 | leaderboard |
| 단일 핵심 수치 | kpiCard / heroTile |

---

## 11. Anti-patterns (금지 목록)

AI가 생성하는 대시보드·리포트에서 반복적으로 나타나는 시각적 클리셰를 열거한다. 이 패턴이 보이면 **즉시 AI 산출물로 인식**되므로 철저히 배제한다.

### 8-A. 레이아웃 & 구조

| 패턴 | 이유 |
|------|------|
| 모든 카드가 동일한 높이·너비 | 정보 위계 없음. height token을 섞어라 |
| 모든 곳에 동일한 `border-radius` | 위계 없음. 큰 카드 12px, 뱃지 6px, 버튼 8px 등 차등 |
| 둥근 카드 + 왼쪽 accent border 콤보 | AI가 "카드 디자인"을 만들 때 가장 먼저 뽑는 패턴 |
| 카드마다 아이콘+제목+설명+버튼 동일 구조 반복 | "feature grid" 클리셰. 카드별 내용 밀도를 다르게 |
| 불필요한 wrapper div 중첩 | depth만 늘리고 의미 없음 |

### 8-B. 색상 & 효과

| 패턴 | 이유 |
|------|------|
| hover 시 accent 색 border | AI 대시보드의 전형 |
| glow ring (`box-shadow: 0 0 0 Npx accent`) | AI 대시보드의 전형 |
| `transform: translateY(-1px)` hover | 카드가 뜨는 효과 |
| accent 색 아이콘 | 장식적 색상 남용. 아이콘은 `--mw-text-muted` |
| `glassmorphism` / `backdrop-filter` 카드 | 의미 없는 장식 |
| shadow에 accent 색 tint | 과시적 시각 효과 |
| 보라+청록 그라데이션 배경 | AI 생성물의 가장 흔한 배경색 조합 |
| 무지개 그라데이션 텍스트 / 배경 | 브랜드 의도 없는 장식 |
| 네온 글로우 (`text-shadow: 0 0 Npx color`) | 사이버펑크 클리셰 |
| accent 색을 카드 배경 전체에 깔기 | 넓은 면적의 accent는 시선을 피로하게 함 |

### 8-C. 타이포그래피 & 텍스트

| 패턴 | 이유 |
|------|------|
| Inter를 display font로 사용 | 훈련 데이터 평균 = 어떤 브랜드도 아닌 폰트. 본문 OK, 제목은 테마의 `--mw-display-font` 사용 |
| 이모지를 아이콘 대용으로 사용 | 플랫폼마다 렌더링 다름 + 비전문적. SVG 아이콘 또는 텍스트로 대체. **예외: 카드뉴스 모드**는 SNS 특성상 이모지 허용 |
| 제목에 "🚀 Introducing…" 패턴 | AI 블로그 포스트의 상징 |
| 무의미한 부제목 ("Powerful. Flexible. Simple.") | 정보 전달 없는 마케팅 어구 |
| 모든 섹션 제목에 이모지 prefix | 시각적 노이즈 |
| `font-weight: 800-900` 남발 | 위계 없는 강조. 최대 600-700 |

### 8-D. 데이터 & 수치

| 패턴 | 이유 |
|------|------|
| raw 숫자 (4377800000) 직접 표시 | 가독성 파괴. `Maging.fmt.*` 사용 |
| 수동 포맷터 대신 커스텀 함수 | 이중 변환 버그 위험 |
| 더미 데이터가 너무 깔끔함 (10, 20, 30, 40, 50) | 현실감 없음. 불규칙한 실제 수치 사용 |
| 모든 KPI의 delta가 양수 | 비현실적. 일부는 음수/0이어야 함 |
| 차트 데이터가 단조 증가/감소 | 현실 데이터는 등락이 있음 |

### 8-E. SVG & 이미지

| 패턴 | 이유 |
|------|------|
| SVG로 그린 사람 얼굴/캐릭터 | AI 일러스트의 전형. 실제 사진이나 이니셜 아바타 사용 |
| CSS로 만든 제품 실루엣 | 실제 제품 사진을 대체할 수 없음 |
| 장식용 SVG blob/wave 배경 | 2020년대 초 SaaS 랜딩 클리셰 |
| 동일한 placeholder 이미지 반복 | 콘텐츠 없음을 드러냄 |

---

## 12. Design Philosophy Tags

105개 테마를 6개 디자인 철학으로 분류한다. 테마 선택 시 브랜드명이 아닌 **원하는 분위기**로 검색할 수 있다. 하나의 테마에 복수 태그 가능.

### 태그 정의

| Tag | 한국어 | 특징 | 대표 키워드 |
|-----|--------|------|-------------|
| `minimal` | 극한 절제 | 흑백 위주, 장식 제로, hairline border, 정보 밀도 높음 | 깔끔한, 미니멀, 심플 |
| `editorial` | 에디토리얼 럭셔리 | 세리프 display font, 따뜻한 톤, 출판/패션지 무드 | 고급스러운, 세련된, 따뜻한 |
| `corporate` | 기업 정석 | 신뢰감 있는 sans-serif, 블루/퍼플 계열, SaaS/핀테크 | 비즈니스, 정돈된, 전문적 |
| `dark` | 다크 모드 | 어두운 배경, 밝은 텍스트, 데이터 터미널 느낌 | 다크, 터미널, 몰입감 |
| `bold` | 강렬한 브랜드 | 시그니처 accent 색이 지배, 높은 채도, 임팩트 | 강렬한, 대담한, 눈에 띄는 |
| `organic` | 자연/크래프트 | 따뜻한 earth tone, 둥근 radius, 수공예/자연 무드 | 자연스러운, 부드러운, 따뜻한 |

### 전체 테마 태그 맵

#### Light 테마

| 테마 | 태그 | 무드 한 줄 요약 |
|------|------|----------------|
| `flow` | minimal, corporate | 인디고 SaaS 기본형 |
| `morningmate` | editorial, bold | 퍼플 + 트렌디 라이프스타일 |
| `claude` | editorial, organic | 코퍼 세리프, 따뜻한 크림 |
| `linear` | minimal, corporate | 슬레이트블루, 이슈트래커 정밀 |
| `stripe` | minimal, corporate | 인디고, 핀테크 정석 |
| `notion` | minimal, corporate | 시안, 문서/노트 내추럴 |
| `apple` | minimal, corporate | 시스템 블루, IT 세련 |
| `airbnb` | minimal, bold | 코랄, 서비스 따뜻함 |
| `airtable` | minimal, corporate | 블랙 accent, 프로덕트 정돈 |
| `barbie` | bold, editorial | 핫핑크, 패션/대담 |
| `binance` | corporate, bold | 골드, 크립토 금융 |
| `bmw` | minimal, corporate | BMW 블루, 자동차 럭셔리 |
| `cal` | minimal, corporate | 올블랙, 개발자 도구 |
| `clay` | minimal, organic | 크림, 둥근 클레이 무드 |
| `clickhouse` | minimal, corporate | 옐로 accent, 데이터 엔지니어링 |
| `cohere` | minimal, corporate | 라운드, AI 프론티어 |
| `coinbase` | minimal, corporate | 일렉트릭 블루, 크립토 전문 |
| `crimson` | editorial, organic | 크림+크림슨, 세리프 클래식 |
| `cursor` | editorial, corporate | 오렌지, 개발자 따뜻함 |
| `deere` | bold, organic | 옐로+그린, 농업/산업 |
| `duolingo` | minimal, bold | 라임, 교육/학습 쾌활 |
| `elevenlabs` | minimal, corporate | 다크브라운, 보이스 AI |
| `expo` | minimal, corporate | 올블랙, 개발자 순수 |
| `fedex` | minimal, bold | 오렌지, 물류 직선적 |
| `framer` | minimal, corporate | 올블랙, 디자인 툴 |
| `hashicorp` | minimal, corporate | 퍼플, 인프라 ops |
| `hermes` | editorial, bold | 오렌지+세리프, radius 0, 럭셔리 |
| `ibm` | minimal, corporate | IBM 블루, 엔터프라이즈 |
| `instagram` | minimal, bold | 핑크/마젠타, SNS |
| `intercom` | minimal, corporate | 올블랙, 커뮤니케이션 |
| `kraken` | minimal, corporate | 퍼플, 크립토 |
| `lamborghini` | editorial, bold | 골드/브론즈, 슈퍼카 럭셔리 |
| `linkedin` | minimal, corporate | 블루, 비즈니스/HR |
| `lovable` | minimal, corporate | 토프, 디자인 심플 |
| `mailchimp` | minimal, bold | 옐로, 이메일 마케팅 |
| `mastercard` | minimal, bold | 레드, 금융 카드 |
| `medium` | editorial, corporate | 세리프 전체, 출판 플랫폼 |
| `meta` | minimal, corporate | 메타 블루, 소셜 |
| `minimax` | minimal, corporate | 다크 accent, AI/LLM |
| `mint` | editorial, organic | 샌디베이지+틸, 크래프트 |
| `mintlify` | minimal, corporate | 블랙, 문서 도구 |
| `miro` | minimal, corporate | 다크, 협업 화이트보드 |
| `mistral` | minimal, bold | 오렌지, AI 스타트업 |
| `mongodb` | minimal, corporate | 틸, DB 브랜드 |
| `nike` | minimal, bold | 올블랙, 스포츠 미니멀 |
| `nvidia` | minimal, bold | 그린, GPU/AI 컴퓨팅 |
| `ollama` | minimal, corporate | 블랙, LLM 추론 |
| `opencode` | minimal, corporate | 다크, 코드 협업 |
| `pinterest` | minimal, bold | 레드, 비주얼 소셜 |
| `playstation` | minimal, bold | PS 블루, 게이밍 |
| `posthog` | minimal, corporate | 다크그레이, 애널리틱스 |
| `raycast` | minimal, corporate | 블랙, 커맨드 런처 |
| `reddit` | minimal, bold | 오렌지, 커뮤니티 |
| `renault` | editorial, bold | 골드, 자동차 헤리티지 |
| `replicate` | minimal, corporate | 다크, AI/ML |
| `resend` | minimal, corporate | 블랙, 이메일 API |
| `revolut` | minimal, corporate | 다크, 핀테크 |
| `runwayml` | minimal, corporate | 블랙, AI 크리에이션 |
| `sage` | editorial, organic | 세이지그린+크림, 젠 무드 |
| `sanity` | minimal, corporate | 블랙, CMS |
| `sentry` | minimal, corporate | 퍼플, 에러 트래킹 |
| `shopify` | minimal, corporate | 그레이, 이커머스 |
| `spacex` | minimal, bold | 블랙, 우주 혁신 |
| `starbucks` | minimal, organic | 다크그린, 커피 |
| `supabase` | minimal, corporate | 퍼플, 백엔드 |
| `superhuman` | minimal, corporate | 퍼플, 이메일 프로덕트 |
| `tesla` | minimal, corporate | 블루, EV 테크 |
| `theverge` | minimal, bold | 틸, 테크 저널리즘 |
| `tiffany` | editorial, bold | 티파니블루+세리프, 럭셔리 여성 |
| `tmobile` | minimal, bold | 마젠타, 통신 |
| `together` | minimal, bold | 핑크, AI 컴퓨트 |
| `uber` | minimal, corporate | 블랙, 모빌리티 |
| `vodafone` | minimal, bold | 레드, 통신 |
| `voltagent` | minimal, corporate | 틸, 에이전트 |
| `warp` | minimal, corporate | 토프, 터미널 |
| `webflow` | minimal, corporate | 블랙, 노코드 |
| `wired` | minimal, corporate | 블랙, 테크 미디어 |
| `wise` | minimal, corporate | 다크, 핀테크 송금 |
| `youtube` | minimal, bold | 레드, 영상 플랫폼 |
| `zapier` | minimal, corporate | 다크, 워크플로 자동화 |
| `heineken` | bold, organic | 레드+그린, F&B 헤리티지 |
| `ups` | bold, organic | 골드+브라운, 물류 헤리티지 |

#### Dark 테마

| 테마 | 태그 | 무드 한 줄 요약 |
|------|------|----------------|
| `vercel` | minimal, dark | 퓨어블랙, 극한 미니멀 |
| `github` | dark, corporate | 네이비, 개발자 터미널 |
| `x` | dark, bold | 블랙+블루, 소셜 |
| `slack` | dark, bold | 어버진+골드, 협업 |
| `discord` | dark, bold | 퍼플, 게이밍/커뮤니티 |
| `openai` | dark, corporate | 차콜+틸, AI 리더십 |
| `spotify` | dark, bold | 시그니처 그린, 음악 |
| `twitch` | dark, bold | 퍼플, 라이브 스트리밍 |
| `netflix` | dark, bold | 블랙+레드, 시네마틱 |
| `figma` | dark, bold | 핫레드, 디자인 툴 |
| `adobe` | dark, bold | 레드, 크리에이티브 |
| `bloomberg` | dark, corporate | 앰버+모노스페이스, 금융 터미널 |
| `amazon` | dark, bold | 오렌지, 커머스 |
| `bmwm` | dark, bold | 블랙+화이트, 모터스포츠 |
| `bugatti` | dark, editorial | 럭셔리 블랙, 극한 절제 |
| `clickhouse` | dark, corporate | 네온옐로, 데이터 |
| `composio` | dark, corporate | 딥블루, 자동화 |
| `ferrari` | dark, bold | 레드, 자동차 열정 |
| `forest` | dark, organic | 딥그린+라임, 숲 |
| `imperial` | dark, organic | 포레스트블랙+레드, 무디 |
| `kiwi` | dark, bold | 네온라임, 해커 터미널 |
| `nasa` | dark, bold | 딥블루+레드, 우주 기관 |
| `sunset` | dark, organic | 블루그레이+오렌지, 지평선 |
| `tannery` | dark, organic | 다크그레이+테라코타, 가죽/크래프트 |

### 분위기별 빠른 검색

사용자의 추상적 요청에 대응하는 테마 추천 가이드.

| 요청 | 추천 테마 (최대 5) |
|------|-------------------|
| "깔끔하게 / 미니멀하게" | `vercel`, `linear`, `framer`, `apple`, `expo` |
| "고급스럽게 / 세련되게" | `claude`, `hermes`, `tiffany`, `bugatti`, `crimson` |
| "따뜻한 느낌으로" | `claude`, `sage`, `mint`, `clay`, `crimson` |
| "다크 모드로" | `vercel`, `github`, `bloomberg`, `openai`, `x` |
| "강렬하게 / 임팩트 있게" | `netflix`, `ferrari`, `barbie`, `spotify`, `kiwi` |
| "비즈니스 보고서" | `stripe`, `linear`, `notion`, `linkedin`, `ibm` |
| "자연스럽게 / 부드럽게" | `sage`, `forest`, `mint`, `clay`, `sunset` |
| "금융/핀테크" | `stripe`, `bloomberg`, `revolut`, `wise`, `binance` |
| "AI/테크" | `openai`, `claude`, `cursor`, `vercel`, `github` |
| "럭셔리 브랜드" | `hermes`, `tiffany`, `bugatti`, `lamborghini`, `bmw` |
| "크리에이티브/디자인" | `figma`, `adobe`, `framer`, `instagram`, `runwayml` |
| "개발자 도구" | `github`, `vercel`, `cursor`, `warp`, `raycast` |
