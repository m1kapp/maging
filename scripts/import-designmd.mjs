#!/usr/bin/env node
/**
 * import-designmd.mjs — DESIGN.md → maging theme 자동 변환기
 *
 * Usage:
 *   node scripts/import-designmd.mjs <DESIGN.md path> [theme-name]
 *
 * Example:
 *   node scripts/import-designmd.mjs ~/cursor-DESIGN.md cursor
 *
 * Reads a DESIGN.md file (getdesign.md / Stitch format),
 * extracts color/typography/radius tokens,
 * and generates a maging theme CSS file at dist/themes/<name>.css
 *
 * Also patches dist/maging.css and registers the theme in dist/maging.js.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { basename, join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..');

// ── CLI args ──
const args = process.argv.slice(2);
if (args.length < 1) {
  console.log('Usage: node scripts/import-designmd.mjs <DESIGN.md> [theme-name]');
  console.log('Example: node scripts/import-designmd.mjs ~/cursor-DESIGN.md cursor');
  process.exit(1);
}

const mdPath = args[0];
const themeName = (args[1] || basename(mdPath, '.md').replace(/^DESIGN-?/i, '').replace(/[^a-z0-9]/gi, '')).toLowerCase();

if (!existsSync(mdPath)) {
  console.error(`✗ File not found: ${mdPath}`);
  process.exit(1);
}

const md = readFileSync(mdPath, 'utf-8');
console.log(`\n📄 Reading: ${mdPath}`);
console.log(`🏷  Theme name: ${themeName}\n`);

// ── Detect format: YAML frontmatter (getdesign CLI) vs Markdown (user-pasted) ──
let yamlColors = null;
let yamlTypo = null;
let yamlShapes = null;

if (md.startsWith('---')) {
  // YAML frontmatter format from `npx getdesign@latest add`
  const yamlBlock = md.split('---').slice(1).join('---').split(/\n(?=[a-z])/);
  // Parse colors block
  const colorsMatch = md.match(/^colors:\n((?:\s+.+\n)+)/m);
  if (colorsMatch) {
    yamlColors = {};
    for (const line of colorsMatch[1].split('\n')) {
      const m = line.match(/^\s+([\w-]+):\s*"?(#[0-9a-fA-F]{3,8})"?/);
      if (m) yamlColors[m[1]] = m[2].toLowerCase();
    }
  }
  // Parse typography block — extract font families
  const typoMatch = md.match(/^typography:\n([\s\S]*?)(?=^[a-z]|\Z)/m);
  if (typoMatch) {
    yamlTypo = {};
    const displayFontMatch = typoMatch[1].match(/display-mega:[\s\S]*?fontFamily:\s*"'([^']+)'/);
    const bodyFontMatch = typoMatch[1].match(/body(?:-md)?:[\s\S]*?fontFamily:\s*"'([^']+)'/);
    if (displayFontMatch) yamlTypo.display = displayFontMatch[1];
    if (bodyFontMatch) yamlTypo.body = bodyFontMatch[1];
  }
  // Parse shapes/rounded
  const roundedMatch = md.match(/(?:shapes|rounded):\n([\s\S]*?)(?=^[a-z]|\Z)/m);
  if (roundedMatch) {
    yamlShapes = {};
    const lgMatch = roundedMatch[1].match(/lg:\s*(\d+)/);
    const mdMatch = roundedMatch[1].match(/md:\s*(\d+)/);
    if (lgMatch) yamlShapes.lg = parseInt(lgMatch[1]);
    if (mdMatch) yamlShapes.md = parseInt(mdMatch[1]);
  }
}

// ── Token extraction helpers ──

/**
 * Extract hex color — tries YAML first, then Markdown patterns
 */
function findColor(md, ...tokenNames) {
  // Try YAML colors first
  if (yamlColors) {
    for (const name of tokenNames) {
      if (yamlColors[name]) return yamlColors[name];
    }
  }

  // Fallback: Markdown patterns
  for (const name of tokenNames) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const patterns = [
      // {colors.name} — #hex
      new RegExp(`\\{colors\\.${escaped}\\}[^#]*?(#[0-9a-fA-F]{3,8})`, 'i'),
      new RegExp(`colors\\.${escaped}[\\}\\)\`][^#]*?(#[0-9a-fA-F]{3,8})`, 'i'),
      // **Name** ... #hex (within 80 chars)
      new RegExp(`\\*\\*${escaped}\\*\\*[^#]{0,80}(#[0-9a-fA-F]{3,8})`, 'i'),
      // ### Name section header, then first #hex on next lines
      new RegExp(`###\\s*${escaped}[\\s\\S]{0,200}?(#[0-9a-fA-F]{6})`, 'i'),
    ];
    for (const re of patterns) {
      const m = md.match(re);
      if (m) return m[1].toLowerCase();
    }
  }

  // Last resort: look for hex after **bold text** containing the name
  for (const name of tokenNames) {
    // Match "Primary" in section context: ### Primary ... **Something** (`#hex`)
    const sectionRe = new RegExp(`###\\s*${name}[\\s\\S]{0,500}?\\(\`?(#[0-9a-fA-F]{6})`, 'i');
    const m = md.match(sectionRe);
    if (m) return m[1].toLowerCase();
  }

  return null;
}

/**
 * Extract font family from Typography section only
 */
function findFont(md, ...keywords) {
  // Only search within the Typography section to avoid false matches
  const typoStart = md.indexOf('## Typography');
  const typoEnd = md.indexOf('\n## ', typoStart + 15);
  if (typoStart < 0) return null;
  const typoSection = md.slice(typoStart, typoEnd > typoStart ? typoEnd : undefined);

  for (const kw of keywords) {
    const patterns = [
      // **Display**: `Font Name, fallback, ...`
      new RegExp(`\\*\\*${kw}[^*]*\\*\\*[^\\n]*?\`([^\`]+)\``, 'i'),
      // - **Display**: `Font, fallback`  (with leading dash)
      new RegExp(`${kw}[^\\n]*?:\s*\`([^\`]+)\``, 'i'),
      // **Font Name** is the display family
      new RegExp(`\\*\\*([A-Z][a-zA-Z ]+)\\*\\*[^\\n]*?${kw}`, 'i'),
      // "FontName" as the display face
      new RegExp(`${kw}[^\\n]*?\\*\\*([A-Z][a-zA-Z ]+)\\*\\*`, 'i'),
    ];
    for (const re of patterns) {
      const m = typoSection.match(re);
      if (m) {
        let fontStr = m[1].trim();
        // If it's a full stack, extract first font
        if (fontStr.includes(',')) {
          fontStr = fontStr.split(',')[0].trim().replace(/['"]/g, '');
        }
        return fontStr;
      }
    }
  }
  return null;
}

/**
 * Extract border radius
 */
function findRadius(md, tokenName) {
  const patterns = [
    new RegExp(`\\{rounded\\.${tokenName}\\}[^\\d]*?(\\d+)px`, 'i'),
    new RegExp(`rounded\\.${tokenName}[^\\d]*?(\\d+)px`, 'i'),
  ];
  for (const re of patterns) {
    const m = md.match(re);
    if (m) return parseInt(m[1]);
  }
  return null;
}

// ── Color helpers ──
function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  return [parseInt(hex.slice(0,2),16), parseInt(hex.slice(2,4),16), parseInt(hex.slice(4,6),16)];
}
function rgbToHex([r,g,b]) {
  return '#' + [r,g,b].map(c => Math.max(0,Math.min(255,Math.round(c))).toString(16).padStart(2,'0')).join('');
}
function mix(c1, c2, t) {
  const [r1,g1,b1] = hexToRgb(c1);
  const [r2,g2,b2] = hexToRgb(c2);
  return rgbToHex([r1+(r2-r1)*t, g1+(g2-g1)*t, b1+(b2-b1)*t]);
}
function luminance(hex) {
  const [r,g,b] = hexToRgb(hex).map(c => c/255);
  return 0.299*r + 0.587*g + 0.114*b;
}

// ── Extract tokens ──

// Primary colors
const canvas = findColor(md, 'canvas', 'canvas-parchment', 'bg') || '#ffffff';
const surfaceCard = findColor(md, 'surface-card', 'surface-white', 'surface') || '#ffffff';
const surfaceSoft = findColor(md, 'surface-soft', 'canvas-soft', 'surface-2');
const primary = findColor(md, 'primary', 'accent', 'action') || '#5f49dc';
const primaryActive = findColor(md, 'primary-active', 'primary-focus');
const ink = findColor(md, 'ink', 'body-strong', 'near-black') || '#1d1d1f';
const bodyText = findColor(md, '^body$', 'body-text') || ink;
const muted = findColor(md, 'muted', 'body-muted', 'muted-soft') || '#888888';
const hairline = findColor(md, 'hairline', 'divider-soft', 'divider', 'border') || '#e0e0e0';
const success = findColor(md, 'success', 'semantic-success') || '#34c759';
const error = findColor(md, 'error', 'semantic-error', 'danger') || '#ff3b30';
const warning = findColor(md, 'warning', 'semantic-warning');

// Secondary accent
const accent2 = findColor(md, 'accent-teal', 'accent-amber', 'primary-on-dark', 'primary-focus', 'secondary');

// Determine if dark theme
const isDark = luminance(canvas) < 0.4;

// Calculate derived tokens
const bg = canvas;
const surface = surfaceCard || (isDark ? mix(canvas, '#ffffff', 0.05) : '#ffffff');
const surface2 = surfaceSoft || mix(canvas, isDark ? '#ffffff' : '#000000', isDark ? 0.08 : 0.03);
const surface3 = mix(bg, surface2, 0.5);
const border = hairline;
const borderSoft = isDark ? mix(border, '#000000', 0.25) : mix(border, '#ffffff', 0.3);
const borderStrong = isDark ? mix(border, '#ffffff', 0.25) : mix(border, '#000000', 0.2);
const text = ink;
const textStrong = isDark ? mix(text, '#ffffff', 0.1) : mix(text, '#000000', 0.15);
const textMuted = muted || (isDark ? '#888888' : '#6e6e73');
const textSoft = isDark ? mix(textMuted, '#000000', 0.25) : mix(textMuted, '#ffffff', 0.3);
const accent = primary;
const accentColor2 = accent2 || mix(primary, isDark ? '#ffffff' : '#000000', 0.3);
const onAccent = luminance(accent) > 0.5 ? '#000000' : '#ffffff';
const successColor = success;
const dangerColor = error;
const warningColor = warning || '#f5a520';

// Radius
// Radius — YAML first, then markdown
const radiusLg = (yamlShapes && (yamlShapes.lg || yamlShapes.md)) || findRadius(md, 'lg') || findRadius(md, 'md');
const radius = radiusLg || 8;

// Typography — YAML first, then markdown
const displayFontRaw = (yamlTypo && yamlTypo.display) || findFont(md, 'Display', 'display');
const bodyFontRaw = (yamlTypo && yamlTypo.body) || findFont(md, 'Body', 'body', 'Text');

// Build font stacks
function buildFontStack(fontName, fallback) {
  if (!fontName) return fallback;
  // If it looks like a full stack already
  if (fontName.includes(',')) {
    // Ensure Pretendard is in there
    if (!fontName.includes('Pretendard')) {
      return fontName.replace(/;?\s*$/, '') + ", 'Pretendard Variable', 'Tossface', system-ui, sans-serif";
    }
    return fontName;
  }
  const isSerif = /serif|garamond|playfair|tiempos|copernicus|didot|georgia/i.test(fontName);
  if (isSerif) {
    return `'${fontName}', 'Playfair Display', 'Hahmlet', 'Pretendard Variable', 'Tossface', serif`;
  }
  return `'${fontName}', 'Inter', 'Pretendard Variable', 'Tossface', system-ui, sans-serif`;
}

const bodyFont = buildFontStack(bodyFontRaw, "'Inter', 'Pretendard Variable', 'Tossface', system-ui, sans-serif");
const displayFont = buildFontStack(displayFontRaw, bodyFont);

// Shadow
const [ar,ag,ab] = hexToRgb(accent);
const shadowAlpha = isDark ? 0.25 : 0.12;
const shadow = isDark
  ? `0 2px 8px -2px rgb(0 0 0 / 0.3)`
  : `0 2px 8px -2px rgb(${ar} ${ag} ${ab} / ${shadowAlpha})`;
const shadowHover = isDark
  ? `0 4px 16px -4px rgb(0 0 0 / 0.4)`
  : `0 4px 16px -4px rgb(${ar} ${ag} ${ab} / 0.18)`;

// ── Generate theme CSS ──
const themeCSS = `/*! magicwiget theme: ${themeName} — auto-imported from DESIGN.md | MIT */
[data-theme="${themeName}"] {
  --mw-bg: ${bg};
  --mw-surface: ${surface};
  --mw-surface-2: ${surface2};
  --mw-surface-3: ${surface3};
  --mw-border: ${border};
  --mw-border-soft: ${borderSoft};
  --mw-border-strong: ${borderStrong};
  --mw-text: ${text};
  --mw-text-strong: ${textStrong};
  --mw-text-muted: ${textMuted};
  --mw-text-soft: ${textSoft};
  --mw-accent: ${accent};
  --mw-accent-2: ${accentColor2};
  --mw-on-accent: ${onAccent};
  --mw-success: ${successColor};
  --mw-danger: ${dangerColor};
  --mw-warning: ${warningColor};
  --mw-radius: ${radius}px;
  --mw-border-w: 1px;
  --mw-font: ${bodyFont};
  --mw-display-font: ${displayFont};
  --mw-mono-font: 'JetBrains Mono', ui-monospace, monospace;
  --mw-shadow: ${shadow};
  --mw-shadow-hover: ${shadowHover};
}
`;

// ── Write theme file ──
const themeFile = join(ROOT, 'dist/themes', `${themeName}.css`);
writeFileSync(themeFile, themeCSS);
console.log(`✓ Theme file: dist/themes/${themeName}.css`);

// ── Patch maging.css — append theme block before THEME-SPECIFIC TWEAKS ──
const mainCssPath = join(ROOT, 'dist/maging.css');
let mainCss = readFileSync(mainCssPath, 'utf-8');

if (mainCss.includes(`data-theme="${themeName}"`)) {
  console.log(`⚠ Theme "${themeName}" already exists in maging.css — skipping patch`);
} else {
  const marker = '/* ========================================================\n   THEME-SPECIFIC TWEAKS';
  if (mainCss.includes(marker)) {
    mainCss = mainCss.replace(marker, themeCSS.replace(/^\/\*!.*\*\/\n/, '') + '\n' + marker);
    writeFileSync(mainCssPath, mainCss);
    console.log(`✓ Patched: dist/maging.css`);
  } else {
    console.log(`⚠ Could not find insertion point in maging.css — append manually`);
  }
}

// ── Summary ──
console.log(`\n${'─'.repeat(50)}`);
console.log(`🎨 Theme "${themeName}" imported successfully!\n`);
console.log(`  Canvas:   ${bg} (${isDark ? 'dark' : 'light'})`);
console.log(`  Accent:   ${accent}`);
console.log(`  Accent 2: ${accentColor2}`);
console.log(`  Text:     ${text}`);
console.log(`  Muted:    ${textMuted}`);
console.log(`  Border:   ${border}`);
console.log(`  Radius:   ${radius}px`);
console.log(`  Body:     ${bodyFontRaw || '(default Inter)'}`);
console.log(`  Display:  ${displayFontRaw || '(default Inter)'}`);
console.log(`  Success:  ${successColor}`);
console.log(`  Danger:   ${dangerColor}`);
console.log(`  Warning:  ${warningColor}`);
console.log(`\nUsage: <html data-theme="${themeName}">`);
console.log(`${'─'.repeat(50)}\n`);
