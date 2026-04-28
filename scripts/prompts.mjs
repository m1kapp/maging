/**
 * prompts.mjs — single source of truth for maging AI prompts.
 *
 * Run `npm run build:llms` first to assemble llms-dashboard.txt / llms-landing.txt.
 *
 * Exports per-service (Claude / ChatGPT / Gemini) × per-mode (Dashboard / Landing / Weekly).
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));

// Read from source parts (not build output) to avoid circular dependency with build-llms.mjs
const core = readFileSync(join(__dir, '../llms/core.txt'), 'utf-8');
const dashboardTxt = core + '\n' + readFileSync(join(__dir, '../llms/dashboard.txt'), 'utf-8');
const landingTxt = core + '\n' + readFileSync(join(__dir, '../llms/landing.txt'), 'utf-8');
const weeklyTxt = core + '\n' + readFileSync(join(__dir, '../llms/weekly-report.txt'), 'utf-8');

/* ── logo ── */
const LOGO_URL = 'https://cdn.jsdelivr.net/npm/@m1kapp/maging/dist/logo.png';

/* ── service-specific output rules ── */
const SERVICE_RULES = {
  claude: `
## Service: Claude (Artifact)

- 결과물은 반드시 **Artifact**로 출력하라. type: \`text/html\`.
- Artifact 제목은 결과물 내용을 설명하는 한국어 제목 (예: "SaaS 주간보고 대시보드").
- Artifact 하나에 전체 HTML을 담아라. 여러 Artifact로 분할 금지.
- Artifact 외부(대화 본문)에는 코드를 넣지 마라.`,

  chatgpt: `
## Service: ChatGPT (Canvas)

- 결과물은 반드시 **Canvas**에 전체 HTML 코드를 출력하라.
- Canvas 하나에 전체 코드를 담아라. 대화 본문에 코드 조각을 넣지 마라.
- Canvas 출력 후 "Preview" 탭에서 즉시 실행 가능해야 한다.
- 수정 요청 시 Canvas 내용을 전체 교체하라. 부분 수정 금지.`,

  gemini: `
## Service: Gemini (Canvas)

- 결과물은 반드시 **Canvas**의 Code 탭에 전체 HTML을 출력하라.
- Preview 탭에서 즉시 렌더링 가능해야 한다.
- 대화 본문에 코드를 넣지 마라 — Canvas에만 출력.
- 수정 요청 시 전체 코드를 다시 출력하라.`,
};

/* ── handshakes ── */
const HANDSHAKE_DASHBOARD = `

=== HANDSHAKE ===
When you have fully understood the above, reply with EXACTLY this text (nothing else, no code fences, no preamble):

**안녕하세요! 결과물 서포터 매징(maging)입니다** ✦

데이터 파일을 첨부하거나, 만들고 싶은 대시보드를 자유롭게 설명해주세요.
어떤 걸 만들어 드릴까요? 🎨

Then wait for my next message before generating anything.`;

const HANDSHAKE_LANDING = `

=== HANDSHAKE ===
When you have fully understood the above, reply with EXACTLY this text (nothing else, no code fences, no preamble):

**안녕하세요! 결과물 서포터 매징(maging)입니다** ✦

어떤 서비스의 랜딩페이지를 만들까요? 제품명, 핵심 기능, 타겟 고객을 알려주세요.
바로 시작할게요! 🎨

Then wait for my next message before generating anything.`;

const HANDSHAKE_WEEKLY = `

=== HANDSHAKE ===
When you have fully understood the above, reply with EXACTLY this text (nothing else, no code fences, no preamble):

**안녕하세요! 결과물 서포터 매징(maging)입니다** ✦

어떤 팀·사업부의 주간보고를 만들까요? 기간, 핵심 지표, 주요 이슈를 알려주세요.
바로 시작할게요! 🎨

Then wait for my next message before generating anything.`;

const HANDSHAKES = {
  dashboard: HANDSHAKE_DASHBOARD,
  landing: HANDSHAKE_LANDING,
  weekly: HANDSHAKE_WEEKLY,
};

const MODE_TEXTS = {
  dashboard: dashboardTxt,
  landing: landingTxt,
  weekly: weeklyTxt,
};

const CDN_FILES = {
  dashboard: 'llms-dashboard-full.md',
  landing: 'llms-landing-full.md',
  weekly: 'llms-weekly-report-full.md',
};

const SHORT_BASES = {
  dashboard: `You are a maging dashboard generator.\n\nFetch and read: https://cdn.jsdelivr.net/npm/@m1kapp/maging/${CDN_FILES.dashboard}\nIt has the complete setup, all widget APIs, themes, and generation rules.`,
  landing:   `You are a maging landing page generator.\n\nFetch and read: https://cdn.jsdelivr.net/npm/@m1kapp/maging/${CDN_FILES.landing}\nIt has the complete setup, all widget APIs, themes, and generation rules.`,
  weekly:    `You are a maging weekly report generator.\n\nFetch and read: https://cdn.jsdelivr.net/npm/@m1kapp/maging/${CDN_FILES.weekly}\nIt has the complete setup, all widget APIs, themes, and generation rules for weekly reports.`,
};

const MODE_LABELS = {
  dashboard: 'dashboard',
  landing: 'landing page',
  weekly: 'weekly report',
};

/* ── builders ── */
function buildFull(service, mode) {
  return MODE_TEXTS[mode] + '\n' + SERVICE_RULES[service] + HANDSHAKES[mode];
}

function buildShort(service, mode) {
  return SHORT_BASES[mode] + '\n' + SERVICE_RULES[service] + HANDSHAKES[mode];
}

/* ── per-service × per-mode exports ── */

// Claude
export const FULL_PROMPT_DASHBOARD_CLAUDE  = buildFull('claude', 'dashboard');
export const FULL_PROMPT_LANDING_CLAUDE    = buildFull('claude', 'landing');
export const FULL_PROMPT_WEEKLY_CLAUDE     = buildFull('claude', 'weekly');
export const SHORT_PROMPT_DASHBOARD_CLAUDE = buildShort('claude', 'dashboard');
export const SHORT_PROMPT_LANDING_CLAUDE   = buildShort('claude', 'landing');
export const SHORT_PROMPT_WEEKLY_CLAUDE    = buildShort('claude', 'weekly');

// ChatGPT
export const FULL_PROMPT_DASHBOARD_CHATGPT  = buildFull('chatgpt', 'dashboard');
export const FULL_PROMPT_LANDING_CHATGPT    = buildFull('chatgpt', 'landing');
export const FULL_PROMPT_WEEKLY_CHATGPT     = buildFull('chatgpt', 'weekly');
export const SHORT_PROMPT_DASHBOARD_CHATGPT = buildShort('chatgpt', 'dashboard');
export const SHORT_PROMPT_LANDING_CHATGPT   = buildShort('chatgpt', 'landing');
export const SHORT_PROMPT_WEEKLY_CHATGPT    = buildShort('chatgpt', 'weekly');

// Gemini
export const FULL_PROMPT_DASHBOARD_GEMINI  = buildFull('gemini', 'dashboard');
export const FULL_PROMPT_LANDING_GEMINI    = buildFull('gemini', 'landing');
export const FULL_PROMPT_WEEKLY_GEMINI     = buildFull('gemini', 'weekly');
export const SHORT_PROMPT_DASHBOARD_GEMINI = buildShort('gemini', 'dashboard');
export const SHORT_PROMPT_LANDING_GEMINI   = buildShort('gemini', 'landing');
export const SHORT_PROMPT_WEEKLY_GEMINI    = buildShort('gemini', 'weekly');

/* ── backward compat (service-agnostic = Claude default) ── */
export const FULL_PROMPT_DASHBOARD  = FULL_PROMPT_DASHBOARD_CLAUDE;
export const FULL_PROMPT_LANDING    = FULL_PROMPT_LANDING_CLAUDE;
export const FULL_PROMPT_WEEKLY     = FULL_PROMPT_WEEKLY_CLAUDE;
export const SHORT_PROMPT_DASHBOARD = SHORT_PROMPT_DASHBOARD_CLAUDE;
export const SHORT_PROMPT_LANDING   = SHORT_PROMPT_LANDING_CLAUDE;
export const SHORT_PROMPT_WEEKLY    = SHORT_PROMPT_WEEKLY_CLAUDE;
export const FULL_PROMPT  = FULL_PROMPT_DASHBOARD;
export const SHORT_PROMPT = SHORT_PROMPT_DASHBOARD;
export const HANDSHAKE    = HANDSHAKE_DASHBOARD;

/* ── programmatic access ── */
export const SERVICES = ['claude', 'chatgpt', 'gemini'];
export const MODES = ['dashboard', 'landing', 'weekly'];

export function getPrompt(service, mode, variant = 'full') {
  return variant === 'short' ? buildShort(service, mode) : buildFull(service, mode);
}

/* ── base exports (no service rules, no handshake) ── */
export const BASE_FULL_DASHBOARD  = MODE_TEXTS.dashboard;
export const BASE_FULL_LANDING    = MODE_TEXTS.landing;
export const BASE_FULL_WEEKLY     = MODE_TEXTS.weekly;
export const BASE_SHORT_DASHBOARD = SHORT_BASES.dashboard;
export const BASE_SHORT_LANDING   = SHORT_BASES.landing;
export const BASE_SHORT_WEEKLY    = SHORT_BASES.weekly;

export { LOGO_URL, SERVICE_RULES, HANDSHAKES };
