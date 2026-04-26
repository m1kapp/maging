/**
 * build-llms.mjs — assemble llms-*.txt files from parts.
 *
 * llms/core.txt           → shared (themes, core widget APIs, utility)
 * llms/dashboard.txt      → dashboard-specific (setup, layout, rules)
 * llms/landing.txt        → landing-specific (setup, landing widgets, rules)
 * llms/weekly-report.txt  → weekly-report-specific (KPI strip + monthly tables + toggles)
 *
 * Output:
 *   llms-dashboard.txt     = core + dashboard
 *   llms-landing.txt       = core + landing
 *   llms-weekly-report.txt = core + weekly-report
 *   llms.txt               = llms-dashboard.txt (backward compat)
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, '..');

const core = readFileSync(join(root, 'llms/core.txt'), 'utf-8');
const dashboard = readFileSync(join(root, 'llms/dashboard.txt'), 'utf-8');
const landing = readFileSync(join(root, 'llms/landing.txt'), 'utf-8');
const weeklyReport = readFileSync(join(root, 'llms/weekly-report.txt'), 'utf-8');

const dashboardFull = core + '\n' + dashboard;
const landingFull = core + '\n' + landing;
const weeklyReportFull = core + '\n' + weeklyReport;

writeFileSync(join(root, 'llms-dashboard.txt'), dashboardFull);
writeFileSync(join(root, 'llms-landing.txt'), landingFull);
writeFileSync(join(root, 'llms-weekly-report.txt'), weeklyReportFull);
writeFileSync(join(root, 'llms.txt'), dashboardFull); // backward compat

console.log('✓ llms-dashboard.txt     (' + dashboardFull.length + ' chars)');
console.log('✓ llms-landing.txt       (' + landingFull.length + ' chars)');
console.log('✓ llms-weekly-report.txt (' + weeklyReportFull.length + ' chars)');
console.log('✓ llms.txt               (= dashboard, backward compat)');
