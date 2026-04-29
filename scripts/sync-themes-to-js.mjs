#!/usr/bin/env node
/**
 * sync-themes-to-js.mjs — dist/themes/*.css → dist/maging.js 동기화
 *
 * CSS 테마 파일들에서 값을 읽어 maging.js의 themes 배열과 THEME_DATA를 갱신합니다.
 * import-designmd.mjs로 CSS만 생성한 뒤 이 스크립트를 한 번 실행하면 됩니다.
 *
 * Usage: node scripts/sync-themes-to-js.mjs
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..');
const THEMES_DIR = join(ROOT, 'dist/themes');
const JS_PATH = join(ROOT, 'dist/maging.js');

// ── Parse CSS var from theme file ──
function extractVar(css, varName) {
  const re = new RegExp(`${varName}:\\s*(#[0-9a-fA-F]{3,8})`);
  const m = css.match(re);
  return m ? m[1] : null;
}

function luminance(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  const [r,g,b] = [parseInt(hex.slice(0,2),16), parseInt(hex.slice(2,4),16), parseInt(hex.slice(4,6),16)];
  return 0.299*(r/255) + 0.587*(g/255) + 0.114*(b/255);
}

// ── Read all theme CSS files ──
const themeFiles = readdirSync(THEMES_DIR).filter(f => f.endsWith('.css')).sort();
const themes = [];

for (const file of themeFiles) {
  const name = file.replace('.css', '');
  const css = readFileSync(join(THEMES_DIR, file), 'utf-8');

  const bg = extractVar(css, '--mw-bg');
  const accent = extractVar(css, '--mw-accent');
  const accent2 = extractVar(css, '--mw-accent-2');
  const warning = extractVar(css, '--mw-warning');
  const danger = extractVar(css, '--mw-danger');

  if (!bg || !accent) continue;

  const isDark = luminance(bg) < 0.4;
  const brand = name.charAt(0).toUpperCase() + name.slice(1);
  const desc = `${brand} ${isDark ? 'Dark' : 'Light'}`;

  themes.push({ value: name, brand, desc, bg, accent, accent2: accent2 || accent, warning: warning || '#f5a520', danger: danger || '#ff3b30' });
}

console.log(`📦 Found ${themes.length} themes in dist/themes/\n`);

// ── Read maging.js and preserve existing THEME_DATA metadata ──
let js = readFileSync(JS_PATH, 'utf-8');

// Extract existing THEME_DATA to preserve hand-crafted brand/desc
const existingMeta = {};
const existingDataRe = /\{ value: '([^']+)', brand: '([^']+)', desc: '([^']+)'/g;
let em;
while ((em = existingDataRe.exec(js)) !== null) {
  existingMeta[em[1]] = { brand: em[2], desc: em[3] };
}

// Apply existing brand/desc to themes
for (const t of themes) {
  if (existingMeta[t.value]) {
    t.brand = existingMeta[t.value].brand;
    t.desc = existingMeta[t.value].desc;
  }
}

// ── Update themes array ──
const themesArrayRe = /themes:\s*\[[\s\S]*?\]/;
const themesArrayMatch = js.match(themesArrayRe);
if (themesArrayMatch) {
  // Separate light and dark
  const light = themes.filter(t => luminance(t.bg) >= 0.4);
  const dark = themes.filter(t => luminance(t.bg) < 0.4);

  const formatList = (arr) => arr.map(t => `'${t.value}'`).join(', ');
  const newArray = `themes: [\n      // Light (${light.length})\n      ${formatList(light)},\n      // Dark (${dark.length})\n      ${formatList(dark)}\n    ]`;

  js = js.replace(themesArrayRe, newArray);
  console.log(`✓ themes array: ${light.length} light + ${dark.length} dark = ${themes.length}`);
}

// ── Update THEME_DATA — preserve order: existing first, new after ──
const themeDataStart = js.indexOf('var THEME_DATA = [');
const themeDataEnd = js.indexOf('];', themeDataStart);
if (themeDataStart > -1 && themeDataEnd > -1) {
  // Existing themes in original order, then new ones alphabetically
  const existingNames = Object.keys(existingMeta);
  const existingThemes = existingNames.map(n => themes.find(t => t.value === n)).filter(Boolean);
  const newThemes = themes.filter(t => !existingMeta[t.value]).sort((a,b) => a.value.localeCompare(b.value));
  const ordered = [...existingThemes, ...newThemes];

  const entries = ordered.map(t =>
    `    { value: '${t.value}', brand: '${t.brand}', desc: '${t.desc}', bg: '${t.bg}', accent: '${t.accent}', accent2: '${t.accent2}', warning: '${t.warning}', danger: '${t.danger}' }`
  ).join(',\n');

  const newData = `var THEME_DATA = [\n${entries}\n  ];`;
  js = js.slice(0, themeDataStart) + newData + js.slice(themeDataEnd + 2); // +2 = '];'
  console.log(`✓ THEME_DATA: ${themes.length} entries`);
}

writeFileSync(JS_PATH, js);
console.log(`\n✓ dist/maging.js updated`);
