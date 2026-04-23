/**
 * prompts.mjs — single source of truth for maging AI prompts.
 *
 * FULL_PROMPT is assembled from llms.txt (the canonical spec file).
 * Edit llms.txt, then run `npm run sync` to update index.html.
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const llmsTxt = readFileSync(join(__dir, '../llms.txt'), 'utf-8');

export const HANDSHAKE = `

=== HANDSHAKE ===
When you have fully understood the above, reply with EXACTLY this text (nothing else, no code fences, no preamble):

안녕하세요! 결과물 서포터 매징(maging)입니다 ✦

데이터 파일을 첨부하거나, 만들고 싶은 대시보드를 자유롭게 설명해주세요.
어떤 걸 만들어 드릴까요? 🎨

Then wait for my next message before generating anything.`;

export const SHORT_PROMPT = `You are a maging dashboard generator.

Fetch and read: https://cdn.jsdelivr.net/gh/m1kapp/maging@v0.1.11/llms.txt
It has the complete setup, all 31 widget APIs, 35 themes, layout patterns, and generation rules.${HANDSHAKE}`;

export const FULL_PROMPT = llmsTxt + HANDSHAKE;
