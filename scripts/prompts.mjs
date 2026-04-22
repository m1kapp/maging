/**
 * Single source of truth for the "Use with AI" prompts shown on the landing page.
 * Both the runtime copy (embedded into index.html) and the token-counting script
 * read from this file.
 *
 * If you edit a prompt below, run `npm run count-tokens` and copy the new
 * numbers into the `TOKENS` constant inside index.html.
 */

const HANDSHAKE = `

=== HANDSHAKE ===
When you have fully understood the above, reply with EXACTLY this text (nothing else, no code fences, no preamble):

maging is ready.
What would you like to create?

Then wait for my next message before generating anything.`;

export const SHORT_PROMPT = `You are generating a single self-contained HTML dashboard using the "maging" library — an LLM-native UI primitive library.

SETUP (always include in output):
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/m1kapp/maging@v0.1.0/dist/maging.css">
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/gh/m1kapp/maging@v0.1.0/dist/maging.js"></script>
<body class="mw-themed">

THEME: Set on <html data-theme="NAME">. Pick one matching intent.
  Light: claude linear stripe notion airbnb linkedin instagram youtube reddit medium apple duolingo tiffany mailchimp tmobile fedex hermes barbie
  Dark:  vercel github x slack discord openai spotify twitch netflix figma amazon adobe bloomberg nasa heineken deere ups

WIDGETS (32): window.Maging.<name>(selector, config)
  kpiCard heroTile ringProgress bulletChart compareCard metricStack countdownTile sparklineList goalGrid
  lineChart barChart donutChart funnelChart gaugeChart radarChart heatmapChart treemapChart scatterChart sankeyChart waterfallChart mapChart cohortMatrix
  leaderboard activityTable timeline inboxPreview statusGrid
  calendarHeatmap eventCalendar progressStepper
  alertBanner filterBar

LAYOUT: CSS Grid, fixed row-height for LEGO alignment.
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-4" style="grid-auto-rows:400px">
    <div class="lg:col-span-2" id="a"></div>
    <div id="b"></div>
  </div>
Row heights: 120px (mini), 192px (KPI), 400px (chart), 600px (tall).

Wait for DOMContentLoaded. Output ONLY a single self-contained HTML file.

Full widget schemas & examples: https://cdn.jsdelivr.net/gh/m1kapp/maging@v0.1.0/llms.txt
  (Fetch this URL if you can browse. It has complete API for all 32 widgets.)${HANDSHAKE}`;

export const FULL_PROMPT = `You are generating a single self-contained HTML dashboard using the "maging" library — an LLM-native UI primitive library.

=== SETUP (always include in output) ===
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/m1kapp/maging@v0.1.0/dist/maging.css">
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/gh/m1kapp/maging@v0.1.0/dist/maging.js"></script>
<body class="mw-themed">

=== THEMES (35) ===
Set on <html data-theme="NAME">. Each theme bundles palette, typography, radius, shadow.
LIGHT (18): claude (warm cream+terracotta), linear (indigo minimal), stripe (payment purple), notion (off-white), airbnb (coral), linkedin (corporate blue), instagram (vivid gradient), youtube (signature red), reddit (community orange), medium (editorial green serif), apple (system blue), duolingo (owl green), tiffany (robin-egg blue+gold), mailchimp (cavendish yellow), tmobile (magenta), fedex (purple+orange), hermes (cream+Didot serif), barbie (pastel pink+gold)
DARK (17): vercel (pure black minimal), github (dimmed), x (sharp mono), slack (aubergine), discord (blurple), openai (AI teal), spotify (neon green), twitch (gaming purple), netflix (cinematic red), figma (multi-logo), amazon (navy), adobe (creative red), bloomberg (terminal amber mono), nasa (worm blue+red), heineken (bottle green+red star), deere (tractor green+yellow), ups (pullman brown+gold)

Pick by intent: minimal→linear/vercel · warm→claude/notion · corporate→linkedin/stripe · bold→netflix/adobe · luxury→hermes/tiffany · playful→barbie/duolingo · terminal→bloomberg · engineering→nasa. Default: claude.

=== WIDGETS (32) ===
Mount: window.Maging.<widget>(selector, config). All auto-refresh on theme change.

METRIC TILES:
- kpiCard({label, value, delta?, sparkline?, icon?, compact?, deltaGoodWhen?})  compact:true = mini, hides sparkline
- heroTile({label, value, delta?, sparkline, icon?, context?})  iOS weather-style main metric
- ringProgress({value, max, unit, label, context?, thresholds})  thresholds: [[0.5,"danger"],[0.85,"warning"],[1,"good"]]
- bulletChart({value, target?, benchmark?, max, min?, ranges?, valueFormatter?, unit?})  ranges: [{value,label}]
- compareCard({title, left:{label,value}, right:{label,value}, delta, deltaLabel?})
- metricStack({title, main:{label,value,delta}, items:[{label,value}]})
- countdownTile({title, target, label?, context?})  target = ISO datetime
- sparklineList({title, items:[{label,value,delta,sparkline,deltaGoodWhen?}]})
- goalGrid({title, items:[{label,value,max,unit?,sublabel?}], thresholds?})

CHARTS:
- lineChart({title, categories, series:[{name,data}], stack?, area?, yFormatter?, yMin?, yMax?, height?})
- barChart({title, items:[{label,value}], horizontal?, yFormatter?, showLabels?, height?})
- donutChart({title, slices:[{label,value,color?}], centerLabel?, centerValue?, height?})
- funnelChart({title, stages:[{label,value}], valueSuffix?, height?})
- gaugeChart({title, label, value, max, unit, thresholds, height?})
- radarChart({title, indicators:[{name,max}], series:[{name,data}], height?})
- heatmapChart({title, xAxis, yAxis, matrix:[[row]], tooltipFormatter?, height?})
- treemapChart({title, items:[{name,value}], valueFormatter?, height?})
- scatterChart({title, points:[{label,x,y,size}], xLabel?, yLabel?, height?})
- sankeyChart({title, nodes:[{name}], links:[{source,target,value}], valueFormatter?, height?})
- waterfallChart({title, items:[{label,value,type?}], valueFormatter?, height?})  type auto: first=start, last=total, +=gain, -=loss
- mapChart({title, items:[{region,value}], valueFormatter?, height?})  region = Korean province name (서울,경기,부산,인천,대구,대전,광주,울산,세종,강원,충북,충남,전북,전남,경북,경남,제주)
- cohortMatrix({title, cohorts, periods, data:[[v]], sizes?, cohortLabel?, sizeLabel?, valueFormatter?})  data[i][j]=retention%, null=blank

LISTS & STATUS:
- leaderboard({title, items:[{name,initial,percent,meta}]})
- activityTable({title, columns:[{key,label,align?,render?}], rows, live?})
- timeline({title, items:[{time,text,type?}]})  type: "success"|"warning"|"danger"|"info"
- inboxPreview({title, items:[{icon,text,time,type}], footer?})
- statusGrid({title, columns?, items:[{label,status,value?}]})  status: "ok"|"warning"|"danger"

CALENDAR & PROJECT:
- calendarHeatmap({title, year, values:[[date,value]], max?, valueSuffix?, height?, cellSize?})
- eventCalendar({title, year, month, events:[{date,label,type?}], startOfWeek?, showList?, listFilter?})
- progressStepper({title, kicker?, status?, meta, steps:[{label,date,status,badge?}]})  status: "done"|"active"|"pending"

CONTROL & MESSAGING:
- alertBanner({type, title, message?, icon?, action?:{label,href?}, dismissable?})  type: "info"|"warning"|"danger"|"success". Horizontal stripe, NOT a card.
- filterBar({title?, filters:[{key,type,label,options?,placeholder?,defaultFrom?,defaultTo?}], onChange})  filter types: "segmented"|"chips"|"search"|"daterange"

=== LAYOUT ===
Use CSS Grid with Tailwind. Fix row height for LEGO block alignment.
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-4" style="grid-auto-rows:400px">
    <div class="lg:col-span-2" id="revenue"></div>
    <div id="region"></div>
  </div>
Row heights: 120px (mini stats) · 192px (KPIs) · 400px (charts/tables) · 600px (tall).
Use "lg:col-span-2" for 2-column span.

=== GENERATION RULES ===
1. Always include SETUP at the top.
2. Pick ONE theme via <html data-theme="...">.
3. Wrap <body class="mw-themed">.
4. Use Grid with fixed row height.
5. Wait for DOMContentLoaded. maging.js is defer-loaded.
6. Widget choice by data shape:
   time series→lineChart · categorical→barChart · share→donutChart · funnel→funnelChart
   target vs actual→bulletChart/ringProgress · distribution→treemapChart/heatmapChart
   flow→sankeyChart · correlation→scatterChart · Korean geo→mapChart
   retention→cohortMatrix · P&L→waterfallChart · rankings→leaderboard
   recent events→timeline/activityTable · system health→statusGrid+gaugeChart
   OKR→goalGrid · multi-metric trend→sparklineList · single hero→heroTile
7. KRW formatter: v => "₩" + (v/1e8).toFixed(1) + "억"  (or use Maging.fmt.krw)
8. Korean labels OK. Prefer word-break: keep-all for Korean text wrapping.
9. Section order (execs): at-a-glance → real-time → trends → deep-dive → operations.
10. Output ONLY the HTML file. No markdown explanation before/after.${HANDSHAKE}`;
