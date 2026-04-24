/**
 * build-llms.mjs — assemble llms-dashboard.txt and llms-landing.txt from parts.
 *
 * llms/core.txt      → shared (themes, core widget APIs, utility)
 * llms/dashboard.txt  → dashboard-specific (setup, layout, rules)
 * llms/landing.txt    → landing-specific (setup, landing widgets, rules)
 *
 * Output:
 *   llms-dashboard.txt = core + dashboard
 *   llms-landing.txt   = core + landing
 *   llms.txt           = llms-dashboard.txt (backward compat)
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, '..');

const core = readFileSync(join(root, 'llms/core.txt'), 'utf-8');
const dashboard = readFileSync(join(root, 'llms/dashboard.txt'), 'utf-8');
const landing = readFileSync(join(root, 'llms/landing.txt'), 'utf-8');

const dashboardFull = core + '\n' + dashboard;
const landingFull = core + '\n' + landing;

writeFileSync(join(root, 'llms-dashboard.txt'), dashboardFull);
writeFileSync(join(root, 'llms-landing.txt'), landingFull);
writeFileSync(join(root, 'llms.txt'), dashboardFull); // backward compat

console.log('✓ llms-dashboard.txt (' + dashboardFull.length + ' chars)');
console.log('✓ llms-landing.txt   (' + landingFull.length + ' chars)');
console.log('✓ llms.txt           (= dashboard, backward compat)');
