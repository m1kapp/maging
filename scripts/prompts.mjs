/**
 * prompts.mjs — single source of truth for maging AI prompts.
 *
 * Run `npm run build:llms` first to assemble llms-dashboard.txt / llms-landing.txt.
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));

const dashboardTxt = readFileSync(join(__dir, '../llms-dashboard.txt'), 'utf-8');
const landingTxt = readFileSync(join(__dir, '../llms-landing.txt'), 'utf-8');
const weeklyTxt = readFileSync(join(__dir, '../llms-weekly-report.txt'), 'utf-8');

const HANDSHAKE_DASHBOARD = `

=== HANDSHAKE ===
When you have fully understood the above, reply with EXACTLY this text (nothing else, no code fences, no preamble):

안녕하세요! 결과물 서포터 매징(maging)입니다 ✦

데이터 파일을 첨부하거나, 만들고 싶은 대시보드를 자유롭게 설명해주세요.
어떤 걸 만들어 드릴까요? 🎨

Then wait for my next message before generating anything.`;

const HANDSHAKE_LANDING = `

=== HANDSHAKE ===
When you have fully understood the above, reply with EXACTLY this text (nothing else, no code fences, no preamble):

안녕하세요! 결과물 서포터 매징(maging)입니다 ✦

어떤 서비스의 랜딩페이지를 만들까요? 제품명, 핵심 기능, 타겟 고객을 알려주세요.
바로 시작할게요! 🎨

Then wait for my next message before generating anything.`;

const HANDSHAKE_WEEKLY = `

=== HANDSHAKE ===
When you have fully understood the above, reply with EXACTLY this text (nothing else, no code fences, no preamble):

안녕하세요! 결과물 서포터 매징(maging)입니다 ✦

어떤 팀·사업부의 주간보고를 만들까요? 기간, 핵심 지표, 주요 이슈를 알려주세요.
바로 시작할게요! 🎨

Then wait for my next message before generating anything.`;

export const SHORT_PROMPT_DASHBOARD = `You are a maging dashboard generator.

Fetch and read: https://cdn.jsdelivr.net/npm/@m1kapp/maging@0.1.16/llms-dashboard.txt
It has the complete setup, all widget APIs, 35 themes, layout patterns, and generation rules.${HANDSHAKE_DASHBOARD}`;

export const SHORT_PROMPT_WEEKLY = `You are a maging weekly report generator.

Fetch and read: https://cdn.jsdelivr.net/npm/@m1kapp/maging@0.1.16/llms-weekly-report.txt
It has the complete setup, all widget APIs, 35 themes, and generation rules for weekly reports.${HANDSHAKE_WEEKLY}`;

export const SHORT_PROMPT_LANDING = `You are a maging landing page generator.

Fetch and read: https://cdn.jsdelivr.net/npm/@m1kapp/maging@0.1.16/llms-landing.txt
It has the complete setup, all widget APIs, 35 themes, and generation rules for landing pages.${HANDSHAKE_LANDING}`;

export const FULL_PROMPT_DASHBOARD = dashboardTxt + HANDSHAKE_DASHBOARD;
export const FULL_PROMPT_WEEKLY = weeklyTxt + HANDSHAKE_WEEKLY;
export const FULL_PROMPT_LANDING = landingTxt + HANDSHAKE_LANDING;

// backward compat
export const SHORT_PROMPT = SHORT_PROMPT_DASHBOARD;
export const FULL_PROMPT = FULL_PROMPT_DASHBOARD;
export const HANDSHAKE = HANDSHAKE_DASHBOARD;
