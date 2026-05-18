/**
 * build-llms.mjs — assemble base llms-*.md files from parts.
 *
 * Source:
 *   llms/core.txt           → shared (themes, core widget APIs, utility, output rules)
 *   llms/dashboard.txt      → dashboard-specific
 *   llms/landing.txt        → landing-specific
 *   llms/weekly-report.txt  → weekly-report-specific
 *   llms/card-news.txt      → card-news-specific
 *   llms/pitch-deck.txt     → pitch-deck-specific
 *
 * Output — base full only (service rules / short / handshake are composed at runtime):
 *   llms-dashboard-full.md
 *   llms-landing-full.md
 *   llms-weekly-report-full.md
 *   llms-card-news-full.md
 *   llms-pitch-deck-full.md
 *   llms.md  = llms-dashboard-full.md (backward compat)
 */

import { readFileSync, writeFileSync, readdirSync, unlinkSync, mkdirSync, cpSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, '..');

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf-8'));
const VERSION = pkg.version;

// ── Auto-count widgets & themes from actual source code ──
const magingJS = readFileSync(join(root, 'dist/maging.js'), 'utf-8');
const magingNews = readFileSync(join(root, 'dist/maging-news.js'), 'utf-8');
const magingSlide = readFileSync(join(root, 'dist/maging-slide.js'), 'utf-8');

// Theme count: from Maging.themes array
const themeMatch = magingJS.match(/themes:\s*\[([\s\S]*?)\]/);
const THEME_COUNT = themeMatch ? themeMatch[1].split(',').filter(s => s.trim().startsWith("'")).length : '?';

// Widget counts
const CARDNEWS_WIDGET_COUNT = (magingNews.match(/M\.\w+\s*=\s*\w+/g) || []).filter(m => !m.includes('newsDeck') && !m.includes('_pageBuilders')).length;
const PITCH_WIDGET_COUNT = (magingSlide.match(/M\.\w+\s*=/g) || []).length;

// Replace all placeholders
function injectVersion(txt) {
  return txt
    .replace(/__VERSION__/g, VERSION)
    .replace(/__THEME_COUNT__/g, String(THEME_COUNT))
    .replace(/__CARDNEWS_WIDGET_COUNT__/g, String(CARDNEWS_WIDGET_COUNT))
    .replace(/__PITCH_WIDGET_COUNT__/g, String(PITCH_WIDGET_COUNT));
}

const core = injectVersion(readFileSync(join(root, 'llms/core.txt'), 'utf-8'));

const modes = {
  dashboard: injectVersion(readFileSync(join(root, 'llms/dashboard.txt'), 'utf-8')),
  landing: injectVersion(readFileSync(join(root, 'llms/landing.txt'), 'utf-8')),
  slide: injectVersion(readFileSync(join(root, 'llms/slide.txt'), 'utf-8')),
  'card-news': injectVersion(readFileSync(join(root, 'llms/card-news.txt'), 'utf-8')),
};

const llmsDir = join(root, 'llms');

/* ── clean old built md files ── */
const oldMd = readdirSync(llmsDir).filter(f => f.endsWith('.md'));
for (const f of oldMd) {
  unlinkSync(join(llmsDir, f));
  console.log(`✗ deleted llms/${f}`);
}

/* ── generate base full files only ── */
const generated = [];

for (const [mode, modeTxt] of Object.entries(modes)) {
  const content = core + '\n' + modeTxt;
  const name = `llms-${mode}-full.md`;
  writeFileSync(join(llmsDir, name), content);
  generated.push({ name, chars: content.length });
}

// backward compat
const defaultFull = readFileSync(join(llmsDir, 'llms-dashboard-full.md'), 'utf-8');
writeFileSync(join(llmsDir, 'llms.md'), defaultFull);

// Copy to public/llms/ for Next.js static serving
const publicLlms = join(root, 'public/llms');
mkdirSync(publicLlms, { recursive: true });
for (const f of readdirSync(publicLlms).filter(f => f.endsWith('.md'))) {
  unlinkSync(join(publicLlms, f));
}
for (const f of readdirSync(llmsDir).filter(f => f.endsWith('.md'))) {
  cpSync(join(llmsDir, f), join(publicLlms, f));
}

console.log('');
for (const { name, chars } of generated) {
  console.log(`✓ ${name.padEnd(36)} (${chars} chars)`);
}
console.log(`✓ ${'llms.md'.padEnd(36)} (= llms-dashboard-full.md)`);
console.log(`\n${generated.length + 1} files generated.`);
