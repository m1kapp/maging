#!/usr/bin/env node
import { build } from 'esbuild';
import { readFileSync, cpSync, mkdirSync } from 'fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const VERSION = pkg.version;
const DIRS = ['dist', 'public/dist'];

// Ensure output dirs exist
for (const dir of DIRS) mkdirSync(dir, { recursive: true });

// ── 1. Plain JS (copy src → both dirs) ──
const plainJS = {
  'src/core.js':     'maging.js',
  'src/all.js':      'maging-all.js',
  'src/sidebar.js':  'maging-sidebar.js',
  'src/charts.js':   'maging-charts.js',
  'src/landing.js':  'maging-landing.js',
  'src/news.js':     'maging-news.js',
  'src/grid.js':     'maging-grid.js',
};
for (const [src, name] of Object.entries(plainJS)) {
  for (const dir of DIRS) cpSync(src, dir + '/' + name);
}

// ── 2. TSX bundle ──
for (const dir of DIRS) {
  await build({
    entryPoints: ['src/slide.tsx'],
    outfile: dir + '/maging-slide.js',
    bundle: true,
    format: 'iife',
    target: 'es2020',
    banner: { js: `/*! maging-slide v${VERSION} | MIT */` },
    tsconfigRaw: JSON.stringify({
      compilerOptions: { jsx: 'react', jsxFactory: 'h', jsxFragmentFactory: 'Fragment' },
    }),
  });
}

// ── 3. Static assets (CSS, themes, icons, logo) ──
const assets = ['maging.css', 'maging.core.css', 'logo.png'];
for (const a of assets) {
  for (const dir of DIRS) cpSync('src/' + a, dir + '/' + a);
}
for (const dir of DIRS) {
  cpSync('src/themes', dir + '/themes', { recursive: true });
  cpSync('src/icons', dir + '/icons', { recursive: true });
}

console.log(`✓ ${Object.keys(plainJS).length + 1} JS + assets → dist/ + public/dist/`);
