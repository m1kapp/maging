/**
 * Counts prompt tokens using real provider tokenizers, then prints a copy-paste
 * block for the `TOKENS` constant inside index.html's "Use with AI" script.
 *
 * Run: npm run count-tokens
 *
 * Tokenizers per provider:
 *   openai      → o200k_base (gpt-tokenizer)           — GPT-4o/4.1/5 official
 *   anthropic   → @anthropic-ai/tokenizer              — Claude official
 *   google      → o200k_base × 1.06                    — Gemini empirical approx
 *   perplexity  → o200k_base                           — OpenAI-based
 *   grok        → o200k_base                           — BPE variant, similar
 *   upstage     → @anthropic-ai/tokenizer              — Solar, similar
 *   openrouter  → o200k_base (default, varies)
 */

import { countTokens as openaiCountTokens } from 'gpt-tokenizer/encoding/o200k_base';
import { countTokens as anthropicCountTokens } from '@anthropic-ai/tokenizer';
import { SHORT_PROMPT, FULL_PROMPT } from './prompts.mjs';

function countByProvider(text) {
  const openai = openaiCountTokens(text);
  const anthropic = anthropicCountTokens(text);
  const gemini = Math.round(openai * 1.06);
  return { openai, anthropic, gemini };
}

const short = countByProvider(SHORT_PROMPT);
const full = countByProvider(FULL_PROMPT);

const line = (n) => '-'.repeat(n);

console.log('');
console.log(line(60));
console.log('  Prompt token counts (real tokenizers)');
console.log(line(60));
console.log('');
console.log('  Char counts:');
console.log('    Short :', SHORT_PROMPT.length.toLocaleString(), 'chars');
console.log('    Full  :', FULL_PROMPT.length.toLocaleString(), 'chars');
console.log('');
console.log('  Tokens — Short prompt:');
console.log('    OpenAI (o200k_base)           :', short.openai);
console.log('    Anthropic (Claude)            :', short.anthropic);
console.log('    Google (Gemini approx ×1.06)  :', short.gemini);
console.log('');
console.log('  Tokens — Full prompt:');
console.log('    OpenAI (o200k_base)           :', full.openai);
console.log('    Anthropic (Claude)            :', full.anthropic);
console.log('    Google (Gemini approx ×1.06)  :', full.gemini);
console.log('');
console.log(line(60));
console.log('  Paste this into index.html TOKENS constant:');
console.log(line(60));
console.log('');
console.log('  var TOKENS = {');
console.log(`    short: { gpt: ${short.openai},  claude: ${short.anthropic},  gemini: ${short.gemini} },`);
console.log(`    full:  { gpt: ${full.openai}, claude: ${full.anthropic}, gemini: ${full.gemini} },`);
console.log('  };');
console.log('');
