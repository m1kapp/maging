/**
 * build-llms.mjs — assemble llms-*.md files from parts.
 *
 * Source:
 *   llms/core.txt           → shared (themes, core widget APIs, utility, output rules)
 *   llms/dashboard.txt      → dashboard-specific
 *   llms/landing.txt        → landing-specific
 *   llms/weekly-report.txt  → weekly-report-specific
 *
 * Output — {mode} × {size} × {service}:
 *   llms-dashboard-full.md                  (flowai, generic)
 *   llms-dashboard-full-for-claude.md
 *   llms-dashboard-short.md
 *   llms-dashboard-short-for-chatgpt.md
 *   …
 *   llms.md  = llms-dashboard-full.md (backward compat)
 */

import { readFileSync, writeFileSync, readdirSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { SERVICE_RULES, HANDSHAKES } from './prompts.mjs';

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, '..');

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf-8'));
const VERSION = pkg.version;

// Replace __VERSION__ placeholder in source files with actual version
function injectVersion(txt) { return txt.replace(/__VERSION__/g, VERSION); }

const core = injectVersion(readFileSync(join(root, 'llms/core.txt'), 'utf-8'));
const dashboard = injectVersion(readFileSync(join(root, 'llms/dashboard.txt'), 'utf-8'));
const landing = injectVersion(readFileSync(join(root, 'llms/landing.txt'), 'utf-8'));
const weeklyReport = injectVersion(readFileSync(join(root, 'llms/weekly-report.txt'), 'utf-8'));
const cardNews = injectVersion(readFileSync(join(root, 'llms/card-news.txt'), 'utf-8'));

const fullBases = {
  dashboard: core + '\n' + dashboard,
  landing: core + '\n' + landing,
  'weekly-report': core + '\n' + weeklyReport,
  'card-news': core + '\n' + cardNews,
};

const CDN_BASE = 'https://cdn.jsdelivr.net/npm/@m1kapp/maging';

const shortBases = {
  dashboard: `You are a maging dashboard generator.\n\nFetch and read: ${CDN_BASE}/llms-dashboard-full.md\nIt has the complete setup, all widget APIs, themes, and generation rules.`,
  landing: `You are a maging landing page generator.\n\nFetch and read: ${CDN_BASE}/llms-landing-full.md\nIt has the complete setup, all widget APIs, themes, and generation rules.`,
  'weekly-report': `You are a maging weekly report generator.\n\nFetch and read: ${CDN_BASE}/llms-weekly-report-full.md\nIt has the complete setup, all widget APIs, themes, and generation rules for weekly reports.`,
  'card-news': `You are a maging card-news generator.\n\nFetch and read: ${CDN_BASE}/llms-card-news-full.md\nIt has the complete setup, all widget APIs, themes, and generation rules for card news.`,
};

const modeToHandshake = {
  dashboard: 'dashboard',
  landing: 'landing',
  'weekly-report': 'weekly',
  'card-news': 'cardnews',
};

const services = ['flowai', 'claude', 'chatgpt', 'gemini'];
const svcRules = { flowai: '', ...SERVICE_RULES };

/* ── clean old .txt files ── */
const oldFiles = readdirSync(root).filter(f => f.startsWith('llms') && f.endsWith('.txt'));
for (const f of oldFiles) {
  unlinkSync(join(root, f));
  console.log(`✗ deleted ${f}`);
}

/* ── generate all combinations ── */
const generated = [];

for (const mode of Object.keys(fullBases)) {
  const hsKey = modeToHandshake[mode];

  for (const svc of services) {
    const svcSuffix = svc === 'flowai' ? '' : `-for-${svc}`;
    const rules = svcRules[svc];
    const hs = HANDSHAKES[hsKey];

    // full
    const fullContent = fullBases[mode] + '\n' + rules + hs;
    const fullName = `llms-${mode}-full${svcSuffix}.md`;
    writeFileSync(join(root, fullName), fullContent);
    generated.push({ name: fullName, chars: fullContent.length });

    // short
    const shortContent = shortBases[mode] + '\n' + rules + hs;
    const shortName = `llms-${mode}-short${svcSuffix}.md`;
    writeFileSync(join(root, shortName), shortContent);
    generated.push({ name: shortName, chars: shortContent.length });
  }
}

// backward compat
const defaultFull = readFileSync(join(root, 'llms-dashboard-full.md'), 'utf-8');
writeFileSync(join(root, 'llms.md'), defaultFull);

console.log('');
for (const { name, chars } of generated) {
  console.log(`✓ ${name.padEnd(46)} (${chars} chars)`);
}
console.log(`✓ ${'llms.md'.padEnd(46)} (= llms-dashboard-full.md)`);
console.log(`\n${generated.length + 1} files generated.`);
