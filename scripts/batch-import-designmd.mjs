#!/usr/bin/env node
/**
 * batch-import-designmd.mjs — getdesign.md → maging 테마 일괄 변환
 *
 * Usage:
 *   node scripts/batch-import-designmd.mjs              # 전체 다운로드 + 변환
 *   node scripts/batch-import-designmd.mjs --new-only   # 겹치는 건 스킵, 새것만
 *   node scripts/batch-import-designmd.mjs --compare    # 겹치는 것 비교 HTML 생성
 *   node scripts/batch-import-designmd.mjs --force      # 겹쳐도 덮어쓰기
 *
 * 1) GitHub API로 design-md/ 폴더 목록 가져옴
 * 2) 각 브랜드의 DESIGN.md raw 파일 다운로드
 * 3) import-designmd.mjs 로직으로 maging 테마 생성
 * 4) 겹치는 테마는 모드에 따라 처리
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..');
const CACHE_DIR = join(ROOT, '.designmd-cache');

const REPO = 'VoltAgent/awesome-design-md';
const BRANCH = 'main';

const args = process.argv.slice(2);
const MODE = args.includes('--force') ? 'force'
           : args.includes('--compare') ? 'compare'
           : args.includes('--new-only') ? 'new-only'
           : 'interactive';

// ── Existing themes ──
function getExistingThemes() {
  const cssPath = join(ROOT, 'dist/maging.css');
  const css = readFileSync(cssPath, 'utf-8');
  const themes = new Set();
  const re = /data-theme="([^"]+)"/g;
  let m;
  while ((m = re.exec(css)) !== null) themes.add(m[1]);
  return themes;
}

// ── Normalize brand name → theme name ──
function normalizeName(brand) {
  return brand
    .replace(/\.app$/, '')
    .replace(/\.ai$/, '')
    .replace(/\.com$/, '')
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase();
}

// ── Fetch via curl (Node 18 fetch not always available) ──
function fetchUrl(url) {
  try {
    return execSync(`curl -sL "${url}"`, { encoding: 'utf-8', timeout: 30000 });
  } catch {
    return null;
  }
}

// ── Main ──
async function main() {
  // Ensure cache dir and download templates package
  if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true });
  const pkgDir = join(CACHE_DIR, '_pkg');
  if (!existsSync(join(pkgDir, 'templates'))) {
    console.log('\n📥 Downloading getdesign templates package...');
    try {
      execSync(`npm pack getdesign@latest --pack-destination "${CACHE_DIR}" 2>/dev/null`, {
        encoding: 'utf-8', timeout: 30000, stdio: ['pipe', 'pipe', 'pipe']
      });
      const tarball = readdirSync(CACHE_DIR).find(f => f.startsWith('getdesign-') && f.endsWith('.tgz'));
      if (tarball) {
        mkdirSync(pkgDir, { recursive: true });
        execSync(`tar -xzf "${join(CACHE_DIR, tarball)}" -C "${pkgDir}" --strip-components=1`, { stdio: 'ignore' });
        execSync(`rm -f "${join(CACHE_DIR, tarball)}"`, { stdio: 'ignore' });
      }
    } catch (e) {
      console.error('✗ Failed to download getdesign package:', e.message);
      process.exit(1);
    }
  }

  const templatesDir = join(pkgDir, 'templates');
  const brands = readdirSync(templatesDir)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace('.md', ''));
  console.log(`\n📦 Found ${brands.length} brands in getdesign templates\n`);

  const existing = getExistingThemes();

  // Ensure cache dir
  if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true });

  const results = { imported: [], skipped: [], conflicts: [], failed: [] };

  for (const brand of brands) {
    const themeName = normalizeName(brand);
    const isConflict = existing.has(themeName);

    if (isConflict && MODE === 'new-only') {
      results.skipped.push({ brand, themeName, reason: 'exists' });
      process.stdout.write(`  ⏭ ${brand} → "${themeName}" (exists, skipped)\n`);
      continue;
    }

    // Download DESIGN.md
    const templatePath = join(templatesDir, `${brand}.md`);
    const mdContent = readFileSync(templatePath, 'utf-8');

    if (!mdContent || mdContent.length < 100) {
      results.failed.push({ brand, reason: 'empty template' });
      process.stdout.write(`  ✗ ${brand} → empty template\n`);
      continue;
    }

    if (isConflict && MODE === 'compare') {
      results.conflicts.push({ brand, themeName, mdPath: templatePath });
      process.stdout.write(`  ⚠ ${brand} → "${themeName}" (conflict, will compare)\n`);
      continue;
    }

    if (isConflict && MODE === 'interactive') {
      results.conflicts.push({ brand, themeName, mdPath: templatePath });
      process.stdout.write(`  ⚠ ${brand} → "${themeName}" (conflict, skipped — use --compare or --force)\n`);
      continue;
    }

    // Import
    try {
      const output = execSync(
        `node "${join(__dir, 'import-designmd.mjs')}" "${templatePath}" "${themeName}"`,
        { encoding: 'utf-8', cwd: ROOT }
      );
      results.imported.push({ brand, themeName });
      process.stdout.write(`  ✓ ${brand} → "${themeName}"\n`);
    } catch (e) {
      results.failed.push({ brand, reason: e.message.split('\n')[0] });
      process.stdout.write(`  ✗ ${brand} → import failed\n`);
    }
  }

  // ── Compare mode: generate HTML ──
  if (MODE === 'compare' && results.conflicts.length > 0) {
    generateComparisonHTML(results.conflicts);
  }

  // ── Summary ──
  console.log(`\n${'═'.repeat(50)}`);
  console.log(`📊 Results:`);
  console.log(`  ✓ Imported: ${results.imported.length}`);
  console.log(`  ⏭ Skipped:  ${results.skipped.length}`);
  console.log(`  ⚠ Conflicts: ${results.conflicts.length}`);
  console.log(`  ✗ Failed:   ${results.failed.length}`);
  console.log(`${'═'.repeat(50)}\n`);

  if (results.conflicts.length > 0 && MODE !== 'compare') {
    console.log('💡 겹치는 테마 처리 옵션:');
    console.log('   --compare  → 비교 HTML 생성 (눈으로 확인)');
    console.log('   --force    → 전부 덮어쓰기');
    console.log('   --new-only → 새것만 임포트\n');
  }

  // ── Sync all themes to maging.js (themes array + THEME_DATA) ──
  if (results.imported.length > 0) {
    console.log('🔄 Syncing themes to maging.js...');
    try {
      const syncOutput = execSync(`node "${join(__dir, 'sync-themes-to-js.mjs')}"`, {
        encoding: 'utf-8', cwd: ROOT
      });
      process.stdout.write(syncOutput);
    } catch (e) {
      console.error('⚠ Failed to sync themes to JS:', e.message);
    }
  }
}

// ── Comparison HTML generator ──
function generateComparisonHTML(conflicts) {
  const cssPath = join(ROOT, 'dist/maging.css');

  // For each conflict, extract existing theme + run import in dry-run style
  let cards = '';
  for (const { brand, themeName, mdPath } of conflicts) {
    // Get existing theme vars
    const css = readFileSync(cssPath, 'utf-8');
    const re = new RegExp(`\\[data-theme="${themeName}"\\]\\s*\\{([^}]+)\\}`);
    const m = css.match(re);
    const existingVars = m ? m[1].trim() : '(not found)';

    // Parse DESIGN.md for preview
    const md = readFileSync(mdPath, 'utf-8');
    const extractHex = (pattern) => {
      const match = md.match(new RegExp(`${pattern}[^#]*?(#[0-9a-fA-F]{3,8})`, 'i'));
      return match ? match[1] : '#888';
    };
    const dBg = extractHex('colors\\.canvas');
    const dAccent = extractHex('colors\\.primary');
    const dText = extractHex('colors\\.ink');
    const dBorder = extractHex('colors\\.hairline');

    // Extract existing vars
    const eVar = (name) => {
      const match = existingVars.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]+)`));
      return match ? match[1] : '#888';
    };
    const eBg = eVar('--mw-bg');
    const eAccent = eVar('--mw-accent');
    const eText = eVar('--mw-text');
    const eBorder = eVar('--mw-border');

    cards += `
    <div class="compare-card">
      <h2>${brand} <code>"${themeName}"</code></h2>
      <div class="compare-row">
        <div class="compare-side">
          <h3>🏠 현재 maging</h3>
          <div class="swatch-row">
            <div class="swatch" style="background:${eBg}" title="bg ${eBg}"></div>
            <div class="swatch" style="background:${eAccent}" title="accent ${eAccent}"></div>
            <div class="swatch" style="background:${eText}" title="text ${eText}"></div>
            <div class="swatch" style="background:${eBorder}" title="border ${eBorder}"></div>
          </div>
          <div class="preview" style="background:${eBg}; color:${eText}; border-color:${eBorder}">
            <div class="preview-title">Dashboard Title</div>
            <div class="preview-accent" style="background:${eAccent}"></div>
            <div class="preview-text" style="color:${eText}">KPI Value: 128억원</div>
            <div class="preview-muted" style="color:${eVar('--mw-text-muted')}">전월 대비 +8.3%</div>
          </div>
          <details><summary>CSS 변수</summary><pre>${existingVars}</pre></details>
        </div>
        <div class="compare-side">
          <h3>📥 DESIGN.md (getdesign.md)</h3>
          <div class="swatch-row">
            <div class="swatch" style="background:${dBg}" title="canvas ${dBg}"></div>
            <div class="swatch" style="background:${dAccent}" title="primary ${dAccent}"></div>
            <div class="swatch" style="background:${dText}" title="ink ${dText}"></div>
            <div class="swatch" style="background:${dBorder}" title="hairline ${dBorder}"></div>
          </div>
          <div class="preview" style="background:${dBg}; color:${dText}; border-color:${dBorder}">
            <div class="preview-title">Dashboard Title</div>
            <div class="preview-accent" style="background:${dAccent}"></div>
            <div class="preview-text" style="color:${dText}">KPI Value: 128억원</div>
            <div class="preview-muted" style="opacity:0.6">전월 대비 +8.3%</div>
          </div>
          <details><summary>DESIGN.md 원본 (일부)</summary><pre>${md.slice(0, 1500).replace(/</g, '&lt;')}...</pre></details>
        </div>
      </div>
      <div class="compare-actions">
        <button onclick="choose('${themeName}','keep')">🏠 현재 유지</button>
        <button onclick="choose('${themeName}','import')">📥 DESIGN.md로 교체</button>
      </div>
    </div>`;
  }

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>maging Theme Comparison — 기존 vs DESIGN.md</title>
<style>
  * { box-sizing: border-box; margin: 0; }
  body { font-family: Inter, system-ui, sans-serif; background: #f5f5f5; padding: 2rem; color: #1a1a1a; }
  h1 { font-size: 1.5rem; margin-bottom: 1.5rem; }
  .compare-card { background: #fff; border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; border: 1px solid #e0e0e0; }
  .compare-card h2 { font-size: 1.1rem; margin-bottom: 1rem; }
  .compare-card h2 code { font-size: 0.85rem; color: #666; }
  .compare-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
  .compare-side h3 { font-size: 0.85rem; margin-bottom: 0.75rem; color: #555; }
  .swatch-row { display: flex; gap: 6px; margin-bottom: 0.75rem; }
  .swatch { width: 36px; height: 36px; border-radius: 6px; border: 1px solid #ddd; cursor: help; }
  .preview { padding: 1rem; border-radius: 8px; border: 1px solid; margin-bottom: 0.75rem; }
  .preview-title { font-weight: 600; font-size: 0.9rem; margin-bottom: 0.5rem; }
  .preview-accent { height: 4px; border-radius: 2px; width: 60%; margin-bottom: 0.5rem; }
  .preview-text { font-size: 1.25rem; font-weight: 700; }
  .preview-muted { font-size: 0.8rem; margin-top: 0.25rem; }
  details { margin-top: 0.5rem; }
  details summary { font-size: 0.75rem; color: #888; cursor: pointer; }
  details pre { font-size: 0.65rem; background: #f8f8f8; padding: 0.5rem; border-radius: 4px; overflow-x: auto; margin-top: 0.5rem; white-space: pre-wrap; max-height: 300px; overflow-y: auto; }
  .compare-actions { display: flex; gap: 0.75rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #eee; }
  .compare-actions button { padding: 0.5rem 1rem; border-radius: 6px; border: 1px solid #ddd; background: #fff; cursor: pointer; font-size: 0.85rem; }
  .compare-actions button:hover { background: #f0f0f0; }
  .compare-actions button.chosen { background: #4caf50; color: #fff; border-color: #4caf50; }
  #summary { position: sticky; top: 1rem; background: #fff; padding: 1rem; border-radius: 8px; border: 1px solid #ddd; margin-bottom: 1.5rem; }
  #summary code { font-size: 0.75rem; background: #f0f0f0; padding: 2px 6px; border-radius: 3px; }
</style>
</head>
<body>
<h1>🎨 maging Theme Comparison</h1>
<div id="summary">
  <strong>${conflicts.length}개 겹치는 테마</strong> — 각각 비교 후 선택하세요.
  <div id="choices" style="margin-top:0.5rem; font-size:0.8rem; color:#666;"></div>
</div>
${cards}
<script>
const choices = {};
function choose(theme, action) {
  choices[theme] = action;
  // Update button styles
  document.querySelectorAll('.compare-actions button').forEach(b => b.classList.remove('chosen'));
  event.target.classList.add('chosen');
  // Update summary
  const lines = Object.entries(choices).map(([t,a]) =>
    a === 'import' ? \`📥 \${t} → DESIGN.md로 교체\` : \`🏠 \${t} → 현재 유지\`
  );
  document.getElementById('choices').innerHTML = lines.join('<br>');

  // Generate command
  const imports = Object.entries(choices).filter(([,a]) => a === 'import').map(([t]) => t);
  if (imports.length) {
    document.getElementById('choices').innerHTML += '<br><br><code>교체 명령: ' +
      imports.map(t => \`node scripts/import-designmd.mjs .designmd-cache/\${t}.md \${t}\`).join(' && ') +
      '</code>';
  }
}
</script>
</body>
</html>`;

  const outPath = join(ROOT, '_compare-themes.html');
  writeFileSync(outPath, html);
  console.log(`\n🔍 비교 HTML 생성: _compare-themes.html`);
  console.log(`   브라우저에서 열어 눈으로 비교 후 선택하세요.`);

  // Auto-open
  try { execSync(`open "${outPath}"`, { stdio: 'ignore' }); } catch {}
}

main();
