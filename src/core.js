/*! magicwiget v0.1.0 — Dashboard widgets for CDN | MIT
 *  Requires ECharts 5+ loaded as global `echarts`.
 *  Usage:
 *    <link rel="stylesheet" href="magicwiget.css">
 *    <script src="https://cdnjs.cloudflare.com/ajax/libs/echarts/5.6.0/echarts.min.js"></script>
 *    <script src="magicwiget.js"></script>
 *    <div data-mw-widget="kpi-card" data-mw-label="매출" data-mw-value="₩128억"
 *         data-mw-delta="8.3" data-mw-sparkline="420,445,430,468,475,490"></div>
 *  or:
 *    MagicWiget.kpiCard('#el', { label, value, delta, sparkline });
 */
(function (global) {
  'use strict';

  // Lazy — echarts may arrive after maging.js in dynamic-loading setups (maging-all.js).
  function EC() { return (typeof echarts !== 'undefined') ? echarts : null; }

  // ==========================================================
  // Tailwind class-string constants (BEM → Tailwind)
  // Theme vars are wrapped in arbitrary-value syntax: [var(--mw-*)]
  // ==========================================================

  // ── Shared primitives ──
  // Card base — maging.css [data-mw-card] handles: bg, border, radius, shadow, padding, transition, container-query.
  // _card is intentionally empty; applyCard() sets data-mw-card for CSS targeting.
  var _card = '';
  // data-mw-card: 코어 CSS hover/transition. Tailwind _card로 base 스타일 적용.
  function applyCard(el) { el.className += ' ' + _card; el.dataset.mwCard = ''; }
  var _unit = 'text-[0.65em] font-normal text-[var(--mw-text-muted)] ml-[0.1em]';
  var _muted = 'text-[var(--mw-text-muted)]';
  var _header = 'flex items-start justify-between gap-2 mb-4 flex-wrap';
  var _headerTitle = 'text-[length:var(--mw-text-base)] font-semibold text-[var(--mw-text)] m-0';
  var _headerSub = 'text-[length:var(--mw-text-sm)] text-[var(--mw-text-muted)] mt-[var(--mw-space-0-5)] tracking-[0.005em]';

  // ── Badge ──
  var _badge = 'inline-flex items-center gap-[var(--mw-space-1)] px-[var(--mw-space-2)] py-[var(--mw-space-0-5)] rounded-full text-[length:var(--mw-text-xs)] font-medium border font-[family-name:var(--mw-font)] leading-[var(--mw-leading-snug)]';
  var _badgeSuccess = _badge + ' text-[var(--mw-success)] border-[var(--mw-success)] bg-[color-mix(in_srgb,var(--mw-success)_12%,transparent)]';
  var _badgeWarning = _badge + ' text-[var(--mw-warning)] border-[var(--mw-warning)] bg-[color-mix(in_srgb,var(--mw-warning)_12%,transparent)]';
  var _badgeDanger = _badge + ' text-[var(--mw-danger)] border-[var(--mw-danger)] bg-[color-mix(in_srgb,var(--mw-danger)_12%,transparent)]';
  var _badgeMuted = _badge + ' text-[var(--mw-text-muted)] border-[var(--mw-border)] bg-[var(--mw-surface-2)]';

  // ── Progress bar ──
  var _progress = 'bg-[var(--mw-surface-2)] rounded-full overflow-hidden h-[6px]';
  var _progressFill = 'h-full bg-[var(--mw-accent)] rounded-full transition-[width] duration-400 ease-out';

  // ── Avatar ──
  var _avatar = 'w-8 h-8 inline-flex items-center justify-center text-[length:var(--mw-text-sm)] font-semibold bg-[var(--mw-surface-2)] text-[var(--mw-text)] rounded-[var(--mw-radius)] shrink-0';
  var _avatarTop = 'w-8 h-8 inline-flex items-center justify-center text-[length:var(--mw-text-sm)] font-semibold bg-[var(--mw-accent)] text-white rounded-full shrink-0';

  // ── Live dot ──
  var _liveDot = 'inline-block w-[6px] h-[6px] bg-[var(--mw-success)] rounded-full align-middle animate-[mw-pulse_2s_infinite]';

  // ── KPI Card ──
  var _kpiLabel = 'text-[length:var(--mw-text-sm)] text-[var(--mw-text-muted)] tracking-[0.01em]';
  var _kpiRow = 'flex items-baseline justify-between gap-2 mt-2';
  var _kpiValue = 'text-[length:var(--mw-text-xl)] font-semibold font-[family-name:var(--mw-display-font)] leading-[var(--mw-leading-tight)] tracking-[-0.01em] [font-variant-numeric:tabular-nums]';
  var _kpiDelta = 'text-[length:var(--mw-text-sm)] font-medium whitespace-nowrap';
  var _kpiSpark = 'mt-3 h-9';

  // ── Stat Card (compact KPI) ──
  var _stat = 'p-[var(--mw-space-2-5)_var(--mw-space-3)]';
  var _statLabel = 'flex items-center gap-2 text-[length:var(--mw-text-xs)] text-[var(--mw-text-muted)]';
  var _statIcon = 'text-[length:var(--mw-text-md)] text-[var(--mw-text-muted)]';
  var _statRow = 'flex items-baseline justify-between mt-1 gap-2';
  var _statValue = 'text-[length:var(--mw-text-lg)] font-semibold font-[family-name:var(--mw-display-font)] leading-[var(--mw-leading-tight)] tracking-[-0.01em] [font-variant-numeric:tabular-nums]';
  var _statDelta = 'text-[length:var(--mw-text-xs)] font-medium whitespace-nowrap';

  // ── Hero Tile ──
  var _hero = 'p-[var(--mw-space-6)] min-h-[200px] flex flex-col';
  var _heroTop = 'flex items-center justify-between gap-2';
  var _heroLabel = 'text-[length:var(--mw-text-sm)] text-[var(--mw-text-muted)] uppercase tracking-[0.05em]';
  var _heroIcon = 'text-[length:var(--mw-text-lg)] text-[var(--mw-text-muted)]';
  var _heroValue = 'text-[length:var(--mw-text-3xl)] font-bold font-[family-name:var(--mw-display-font)] text-[var(--mw-text)] leading-none mt-2 tracking-[-0.02em]';
  var _heroRow = 'mt-[var(--mw-space-1-5)]';
  var _heroDelta = 'text-[length:var(--mw-text-sm)] font-medium';
  var _heroSpark = 'flex-1 min-h-[44px] mt-3';
  var _heroContext = 'text-[length:var(--mw-text-xs)] text-[var(--mw-text-muted)] mt-2';

  // ── Ring Progress ──
  var _ringContext = 'text-center text-[length:var(--mw-text-sm)] text-[var(--mw-text-muted)] mt-[var(--mw-space-1)]';

  // ── Chart body ──
  var _chartBody = 'w-full';

  // ── Leaderboard ──
  var _lbList = 'flex flex-col gap-[var(--mw-space-3-5)]';
  var _lbItem = 'flex items-center gap-3';
  var _lbBody = 'flex-1 min-w-0';
  var _lbTop = 'flex items-baseline justify-between gap-2';
  var _lbName = 'text-[length:var(--mw-text-base)] font-medium overflow-hidden text-ellipsis whitespace-nowrap';
  var _lbMeta = 'text-[length:var(--mw-text-sm)] text-[var(--mw-text-muted)] whitespace-nowrap';
  var _lbProgress = 'mt-[var(--mw-space-1-5)]';

  // ── Timeline ──
  var _timeline = 'flex flex-col';
  var _tlItem = 'flex gap-[var(--mw-space-3-5)]';
  var _tlItemNotLast = _tlItem + ' pb-[var(--mw-space-3-5)]';
  var _tlMarker = 'flex flex-col items-center shrink-0 pt-[5px]';
  var _tlDot = 'w-2 h-2 rounded-full bg-[var(--mw-border)] border-2 border-[var(--mw-surface)] outline-1 outline-[var(--mw-border)] shrink-0';
  var _tlLine = 'w-0.5 flex-1 bg-[var(--mw-border)] mt-2 min-h-2';
  var _tlBody = 'flex-1 min-w-0';
  var _tlTime = 'text-[length:var(--mw-text-xs)] text-[var(--mw-text-muted)] font-[family-name:var(--mw-mono-font)]';
  var _tlText = 'text-[length:var(--mw-text-base)] text-[var(--mw-text)] mt-[var(--mw-space-0-5)]';

  // ── Status Grid ──
  var _statusGrid = 'grid gap-[var(--mw-space-2-5)]';
  var _statusItem = 'flex items-center gap-2 p-[var(--mw-space-2)_var(--mw-space-2-5)] bg-[var(--mw-surface-2)] rounded-[calc(var(--mw-radius)*0.7)] text-[length:var(--mw-text-sm)] min-w-0';
  var _statusDot = 'w-2 h-2 rounded-full shrink-0';
  var _statusLabel = 'text-[var(--mw-text)] flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap';
  var _statusValue = 'text-[length:var(--mw-text-xs)] text-[var(--mw-text-muted)] font-[family-name:var(--mw-mono-font)] shrink-0';

  // ── Countdown ──
  var _cdLabel = 'text-[length:var(--mw-text-base)] text-[var(--mw-text-muted)] mb-[var(--mw-space-1)]';
  var _cdBody = 'flex gap-5 items-baseline my-[var(--mw-space-2)_0_var(--mw-space-3)]';
  var _cdUnit = 'flex flex-col';
  var _cdNum = 'text-[length:var(--mw-text-2xl)] font-bold font-[family-name:var(--mw-display-font)] leading-none text-[var(--mw-text)] tracking-[-0.02em] [font-variant-numeric:tabular-nums]';
  var _cdLbl = 'text-[length:var(--mw-text-xs)] text-[var(--mw-text-muted)] font-[family-name:var(--mw-mono-font)] uppercase tracking-[0.08em] mt-[var(--mw-space-1)]';
  var _cdContext = 'text-[length:var(--mw-text-sm)] text-[var(--mw-text-muted)] mt-[var(--mw-space-1)]';

  // ── Metric Stack ──
  var _mstack = 'p-5';
  var _mstackTitle = 'text-[length:var(--mw-text-xs)] text-[var(--mw-text-muted)] mb-[var(--mw-space-0-5)]';
  var _mstackMainRow = 'flex items-baseline justify-between gap-2 mt-[var(--mw-space-0-5)]';
  var _mstackMainVal = 'text-[length:var(--mw-text-xl)] font-bold font-[family-name:var(--mw-display-font)] text-[var(--mw-text)] leading-none tracking-[-0.02em] [font-variant-numeric:tabular-nums]';
  var _mstackDelta = 'text-[length:var(--mw-text-sm)] font-medium whitespace-nowrap';
  var _mstackMainLbl = 'text-[length:var(--mw-text-sm)] text-[var(--mw-text-muted)] mt-[var(--mw-space-1)]';
  var _mstackSubRow = 'grid grid-cols-2 gap-x-3 gap-y-[var(--mw-space-1-5)] mt-[var(--mw-space-2-5)] pt-2 border-t border-[var(--mw-border)]';
  var _mstackSubVal = 'text-[length:var(--mw-text-md)] font-semibold font-[family-name:var(--mw-display-font)] text-[var(--mw-text)] leading-[var(--mw-leading-tight)]';
  var _mstackSubLbl = 'text-[length:var(--mw-text-xs)] text-[var(--mw-text-muted)] mt-[var(--mw-space-0-5)]';

  // ── Inbox Preview ──
  var _inbox = 'flex flex-col';
  var _inboxItem = 'flex items-center gap-[var(--mw-space-2-5)] py-2 border-b border-dashed border-[var(--mw-border)]';
  var _inboxItemLast = 'flex items-center gap-[var(--mw-space-2-5)] py-2 border-b-0';
  var _inboxIcon = 'w-[26px] h-[26px] flex items-center justify-center rounded-full bg-[var(--mw-surface-2)] text-[var(--mw-text-muted)] text-[length:var(--mw-text-base)] shrink-0';
  var _inboxBody = 'flex-1 min-w-0';
  var _inboxText = 'text-[length:var(--mw-text-base)] text-[var(--mw-text)] overflow-hidden text-ellipsis whitespace-nowrap';
  var _inboxTime = 'text-[length:var(--mw-text-xs)] text-[var(--mw-text-muted)] font-[family-name:var(--mw-mono-font)] whitespace-nowrap shrink-0';

  // ── Compare Card ──
  var _compareRow = 'flex items-center justify-between gap-4 mt-2';
  var _compareSide = 'flex-1 min-w-0';
  var _compareLbl = 'text-[length:var(--mw-text-xs)] text-[var(--mw-text-muted)]';
  var _compareVal = 'text-[length:var(--mw-text-xl)] font-bold font-[family-name:var(--mw-display-font)] text-[var(--mw-text)] leading-[var(--mw-leading-tight)] mt-[var(--mw-space-1)] tracking-[-0.01em] [font-variant-numeric:tabular-nums]';
  var _compareSep = 'text-[length:var(--mw-text-lg)] text-[var(--mw-text-muted)] shrink-0';
  var _compareDelta = 'mt-[var(--mw-space-3-5)] text-[length:var(--mw-text-base)] font-medium';
  var _compareDeltaLbl = 'text-[var(--mw-text-muted)] font-normal ml-[var(--mw-space-1)]';

  // ── Activity Table ──
  var _tableWrap = 'w-full overflow-x-auto';
  var _table = 'w-full border-collapse text-[length:var(--mw-text-base)] font-[family-name:var(--mw-font)]';
  var _tableTh = 'text-[length:var(--mw-text-sm)] font-normal text-[var(--mw-text-muted)] text-left p-2 border-b border-[var(--mw-border)]';
  var _tableTd = 'p-[var(--mw-space-2-5)_var(--mw-space-2)] border-b border-[var(--mw-border)] text-[var(--mw-text)]';
  var _tableRight = 'text-right [font-variant-numeric:tabular-nums]';

  // ── Page Header ──
  var _pageHead = '';
  var _pageHeadKicker = 'text-[length:var(--mw-text-xs)] text-[var(--mw-text-muted)] uppercase tracking-[0.08em] font-medium font-[family-name:var(--mw-mono-font)]';
  var _pageHeadTitle = 'text-[length:var(--mw-text-xl)] font-bold text-[var(--mw-text)] tracking-[-0.015em] leading-[var(--mw-leading-tight)] mt-[var(--mw-space-1)]';
  var _pageHeadMeta = 'text-[length:var(--mw-text-sm)] text-[var(--mw-text-muted)] mt-[var(--mw-space-1-5)]';

  // ── Section Head ──
  var _secHeadKicker = 'text-[length:var(--mw-text-xs)] text-[var(--mw-text-muted)] uppercase tracking-[0.06em] font-medium';
  var _secHeadTitle = 'text-[length:var(--mw-text-lg)] font-semibold text-[var(--mw-text)] tracking-[-0.01em] mt-[var(--mw-space-0-5)]';

  // ── Alert Banner ──
  var _alertBanner = 'p-[var(--mw-space-3)_var(--mw-space-4)] rounded-[var(--mw-radius)] text-[length:var(--mw-text-sm)] leading-[var(--mw-leading-snug)]';

  // ── RAG Chip ──
  var _rag = 'inline-flex items-center gap-[var(--mw-space-1-5)] py-[3px] px-[10px] rounded-full text-[length:var(--mw-text-xs)] font-medium bg-[var(--mw-surface-2)] text-[var(--mw-text)] leading-[var(--mw-leading-snug)] tracking-[0.005em]';
  var _ragDot = 'w-[6px] h-[6px] rounded-full shrink-0 bg-[var(--mw-text-muted)]';
  var _ragLbl = '[font-variant-numeric:tabular-nums]';

  // ── Share Bar ──
  var _sharebar = 'flex rounded-[var(--mw-radius)] overflow-hidden [font-variant-numeric:tabular-nums]';
  var _sharebarSeg = 'flex items-center justify-center text-white font-semibold text-[length:var(--mw-text-sm)] tracking-[-0.01em] whitespace-nowrap overflow-hidden leading-none';
  var _sharebarLegend = 'flex flex-wrap gap-4 mt-2';
  var _sharebarLegItem = 'inline-flex items-center gap-[6px] text-[length:var(--mw-text-xs)] text-[var(--mw-text)]';
  var _sharebarLegDot = 'w-2 h-2 rounded-full bg-[var(--mw-text-muted)] shrink-0';
  var _sharebarLegSub = 'text-[var(--mw-text-muted)] ml-1';

  // ── Insight Card ──
  var _insight = 'border-l-[3px] border-l-[var(--mw-insight-bar,var(--mw-border))] p-4 flex flex-col gap-3';
  var _insightHead = 'flex items-center gap-2 flex-wrap';
  var _insightIcon = 'text-[1.1rem] leading-none';
  var _insightTitle = 'text-[length:var(--mw-text-md)] font-semibold text-[var(--mw-text)] tracking-[-0.005em] flex-1 min-w-0';
  var _insightMeta = 'text-[length:var(--mw-text-xs)] text-[var(--mw-text-muted)] font-medium [font-variant-numeric:tabular-nums]';
  var _insightTag = 'text-[10px] py-[2px] px-2 rounded-full bg-[var(--mw-surface-2)] text-[var(--mw-text-muted)] font-medium tracking-[0.02em]';
  var _insightBullets = 'list-none m-0 p-0 flex flex-col gap-[var(--mw-space-1-5)]';
  var _insightBullet = 'text-[length:var(--mw-text-sm)] text-[var(--mw-text)] leading-[var(--mw-leading-snug)] pl-3 relative';
  var _insightHighlight = 'flex items-start gap-2 mt-[var(--mw-space-1)] p-[var(--mw-space-2-5)_var(--mw-space-3)] rounded-[var(--mw-radius)] bg-[var(--mw-surface-2)] text-[length:var(--mw-text-xs)] text-[var(--mw-text)] leading-[var(--mw-leading-snug)]';
  var _insightHlIcon = 'text-[0.95rem] leading-none shrink-0';

  // ── Def Card ──
  // (uses inline styles primarily, minimal BEM)

  // ── Sparkline List ──
  // (uses inline styles + _kpiDelta pattern)

  // ── Goal Grid ──
  // (uses _progress + inline styles)

  // ==========================================================
  // Helpers
  // ==========================================================
  function q(sel) {
    if (typeof sel === 'string') return document.querySelector(sel);
    return sel;
  }

  function getColors() {
    var s = getComputedStyle(document.documentElement);
    var g = function (v) { return s.getPropertyValue(v).trim(); };
    return {
      bg:       g('--mw-bg'),
      surface:  g('--mw-surface'),
      surface2: g('--mw-surface-2'),
      border:   g('--mw-border'),
      text:     g('--mw-text'),
      muted:    g('--mw-text-muted'),
      accent:   g('--mw-accent'),
      accent2:  g('--mw-accent-2'),
      success:  g('--mw-success'),
      danger:   g('--mw-danger'),
      warning:  g('--mw-warning'),
      font:     g('--mw-font'),
      mono:     g('--mw-mono-font'),
      radius:   g('--mw-radius'),
    };
  }

  // Convert "#RRGGBB" → [r, g, b]. Returns null on failure.
  function parseHex(hex) {
    if (!hex || hex.charAt(0) !== '#') return null;
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    if (hex.length < 6) return null;
    return [parseInt(hex.substr(0,2),16), parseInt(hex.substr(2,2),16), parseInt(hex.substr(4,2),16)];
  }

  // Apply alpha to a hex color → "rgba(r,g,b,a)". Falls back to raw color if parse fails.
  function withAlpha(color, alpha) {
    var rgb = parseHex(color);
    if (!rgb) return color;
    return 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + alpha + ')';
  }

  // RGB→HSV, rotate hue, enforce min saturation, HSV→RGB.
  function rotateHue(rgb, deg) {
    var r = rgb[0]/255, g = rgb[1]/255, b = rgb[2]/255;
    var max = Math.max(r,g,b), min = Math.min(r,g,b), d = max - min;
    var h = 0, s = max === 0 ? 0 : d / max, v = max;
    if (d > 0) {
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      else if (max === g) h = ((b - r) / d + 2) / 6;
      else h = ((r - g) / d + 4) / 6;
    }
    h = ((h * 360 + deg) % 360) / 360;
    if (h < 0) h += 1;
    // Ensure palette colors are always distinguishable
    if (s < 0.45) s = 0.45;
    if (v < 0.4) v = 0.55;
    var i = Math.floor(h * 6), f = h * 6 - i, p = v*(1-s), q = v*(1-f*s), t = v*(1-(1-f)*s);
    var ro, go, bo;
    switch (i % 6) {
      case 0: ro=v; go=t; bo=p; break; case 1: ro=q; go=v; bo=p; break;
      case 2: ro=p; go=v; bo=t; break; case 3: ro=p; go=q; bo=v; break;
      case 4: ro=t; go=p; bo=v; break; case 5: ro=v; go=p; bo=q; break;
    }
    return [Math.round(ro*255), Math.round(go*255), Math.round(bo*255)];
  }

  function rgbStr(rgb) { return 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')'; }
  function rgbaStr(rgb, a) { return 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + a + ')'; }

  // Build a chart palette with n visually distinct entries.
  // Strategy: accent as primary hue, then evenly spaced hue rotations,
  // each at full opacity first, then 60% round if more slots needed.
  function buildPalette(c, n) {
    if (n <= 0) return [];
    var base = parseHex(c.accent) || [100, 100, 200];
    if (n === 1) return [c.accent];

    // Generate N distinct hues by rotating evenly around the wheel.
    var hueCount = Math.min(n, 6);
    // Slot 0 = accent with saturation guarantee (via 0° rotation)
    var hues = [rotateHue(base, 0)];
    var step = Math.max(40, Math.floor(360 / hueCount));
    for (var i = 1; i < hueCount; i++) {
      hues.push(rotateHue(base, step * i));
    }

    var out = [];
    var opacities = [1, 0.55];
    for (var oi = 0; oi < opacities.length && out.length < n; oi++) {
      for (var hi = 0; hi < hues.length && out.length < n; hi++) {
        if (opacities[oi] >= 1) out.push(rgbStr(hues[hi]));
        else out.push(rgbaStr(hues[hi], opacities[oi]));
      }
    }
    return out;
  }

  function baseTooltip(c) {
    return {
      backgroundColor: c.surface,
      borderColor: c.border,
      textStyle: { color: c.text, fontFamily: c.font, fontSize: 11 },
      extraCssText: 'box-shadow: 0 4px 12px -4px rgba(0,0,0,0.15); border-radius: ' + c.radius + '; padding: 8px 12px;',
    };
  }

  function headerHTML(title, subtitle, rightHTML) {
    title = toStr(title); subtitle = toStr(subtitle);
    if (!title && !subtitle && !rightHTML) return '';
    var left = '';
    if (title)    left += '<h3 class="' + _headerTitle + '">' + escapeHTML(title) + '</h3>';
    if (subtitle) left += '<div class="' + _headerSub + '">' + escapeHTML(subtitle) + '</div>';
    return '<div class="' + _header + '"><div>' + left + '</div>' + (rightHTML || '') + '</div>';
  }

  // ==========================================================
  // _applyCommon — shared customization params for ALL widgets.
  // Call AFTER render() sets innerHTML, so badge/note/html/style
  // are appended to the final DOM.
  // ==========================================================
  function _applyCommon(el, data) {
    if (!el || !data) return;
    // style — inline styles on the card container
    if (data.style && typeof data.style === 'object') {
      for (var k in data.style) { if (data.style.hasOwnProperty(k)) el.style[k] = data.style[k]; }
    }
    // accent — per-widget accent color override
    if (data.accent) {
      el.style.setProperty('--mw-accent', data.accent);
    }
    // noBorder — remove card border + shadow
    if (data.noBorder) {
      el.style.border = 'none';
      el.style.boxShadow = 'none';
    }
    // badge — top-right tag (LIVE, NEW, Q2, etc.)
    if (data.badge) {
      var bdg = document.createElement('div');
      bdg.dataset.role = 'badge';
      bdg.textContent = data.badge;
      bdg.style.cssText = 'position:absolute;top:0.5rem;right:0.5rem;font-size:0.6rem;font-weight:600;font-family:var(--mw-mono-font);padding:0.15rem 0.45rem;border-radius:999px;background:color-mix(in srgb,var(--mw-accent) 12%,transparent);color:var(--mw-accent);letter-spacing:0.03em;text-transform:uppercase;z-index:2;';
      el.style.position = el.style.position || 'relative';
      el.appendChild(bdg);
    }
    // note — bottom footnote text
    if (data.note) {
      var nt = document.createElement('div');
      nt.dataset.role = 'note';
      nt.textContent = data.note;
      nt.style.cssText = 'font-size:0.65rem;color:var(--mw-text-muted);margin-top:0.625rem;padding-top:0.5rem;border-top:1px dashed var(--mw-border);font-family:var(--mw-font);';
      el.appendChild(nt);
    }
    // html — inject custom HTML at the bottom of the widget
    if (data.html) {
      var wrap = document.createElement('div');
      wrap.dataset.role = 'custom-html';
      wrap.innerHTML = data.html;
      el.appendChild(wrap);
    }
  }

  function escapeHTML(s) {
    if (s == null || s === undefined) return '';
    if (typeof s === 'object') {
      if (typeof console !== 'undefined') console.warn('[maging] escapeHTML received object — use toStr() first:', s);
      s = toStr(s);
    }
    var str = String(s);
    if (str === 'NaN' || str === 'undefined' || str === 'Infinity' || str === '-Infinity') return '-';
    return str
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function safeNum(v) {
    if (v == null || isNaN(v) || !isFinite(v)) return '-';
    return Number(v).toLocaleString();
  }

  // ==========================================================
  // Auto-derive helpers — LLM 산수 오류 방지
  // ==========================================================
  function _arrLast(arr) { return arr && arr.length ? arr[arr.length - 1] : null; }
  function _arrPrev(arr) { return arr && arr.length > 1 ? arr[arr.length - 2] : null; }
  function _growthRate(curr, prev) {
    if (prev == null || prev === 0 || curr == null) return null;
    return ((curr - prev) / Math.abs(prev)) * 100;
  }
  function _parseNumVal(s) {
    if (typeof s === 'number') return s;
    if (typeof s !== 'string') return null;
    var n = parseFloat(s.replace(/[^0-9.\-]/g, ''));
    return isNaN(n) ? null : n;
  }

  /** Auto-detect HTML in value strings — prevents escapeHTML from mangling fmt.krw() output */
  function _autoValueHTML(data) {
    if (!data.valueHTML && typeof data.value === 'string' && data.value.indexOf('<') >= 0) {
      data.valueHTML = true;
    }
  }
  /** Render value: pass through HTML, escape plain text */
  function _valOrEsc(v) { return (typeof v === 'string' && v.indexOf('<') >= 0) ? v : escapeHTML(v || ''); }

  /** Coerce any value to a safe display string. Arrays/objects → join or JSON.
   *  Warns in console so developers can fix the data shape. */
  function toStr(v) {
    if (v == null) return '';
    if (typeof v === 'string') return v;
    if (typeof v === 'number' || typeof v === 'boolean') return String(v);
    if (typeof console !== 'undefined') {
      console.warn('[maging] Expected string but got ' + (Array.isArray(v) ? 'Array' : typeof v) + ':', v);
    }
    if (Array.isArray(v)) {
      return v.map(function (x) {
        if (typeof x === 'string') return x;
        if (x && typeof x === 'object') return x.label || x.name || x.text || x.title || JSON.stringify(x);
        return String(x);
      }).join(' · ');
    }
    if (typeof v === 'object') return v.label || v.name || v.text || v.title || JSON.stringify(v);
    return String(v);
  }

  /**
   * Auto-derive value/delta from sparkline or series data.
   * - If value is empty and sparkline exists → value = last element
   * - If delta is null and sparkline has 2+ items → delta = growth rate
   * - cfg.unit appended to derived value (e.g. '건', '%')
   * - cfg.valueFormatter applied to derived value
   */
  function _autoDerive(data, opts) {
    opts = opts || {};
    var arr = opts.arr; // sparkline or series data array
    if (!arr || !arr.length) return;

    // Auto-derive value
    if (!data.value && data.value !== 0) {
      var last = _arrLast(arr);
      if (last != null) {
        if (opts.valueFmt) {
          data.value = opts.valueFmt(last);
          data.valueHTML = true;
        } else {
          data.value = String(last) + (data.unit || '');
        }
      }
    }

    // Auto-derive delta
    if (data.delta == null) {
      var curr = _arrLast(arr);
      var prev = _arrPrev(arr);
      var rate = _growthRate(curr, prev);
      if (rate != null) data.delta = Math.round(rate * 10) / 10;
    }
  }

  // ==========================================================
  // Formatters
  // ==========================================================
  var U = '<span class="' + _unit + '">';
  var UE = '</span>';
  var fmt = {
    krw: function (n) {
      if (n == null || isNaN(n) || !isFinite(n)) return '-';
      var abs = Math.abs(n);
      var sign = n < 0 ? '-' : '';
      if (abs >= 1_0000_0000) return sign + (abs / 1_0000_0000).toFixed(1) + U + '억원' + UE;
      if (abs >= 10000) return sign + Math.round(abs / 10000).toLocaleString() + U + '만원' + UE;
      return sign + abs.toLocaleString() + U + '원' + UE;
    },
    krwPlain: function (n) {
      if (n == null || isNaN(n) || !isFinite(n)) return '-';
      var abs = Math.abs(n);
      var sign = n < 0 ? '-' : '';
      if (abs >= 1_0000_0000) return sign + (abs / 1_0000_0000).toFixed(1) + '억원';
      if (abs >= 10000) return sign + Math.round(abs / 10000).toLocaleString() + '만원';
      return sign + abs.toLocaleString() + '원';
    },
    num: function (n) { return (n == null || isNaN(n) || !isFinite(n)) ? '-' : Number(n).toLocaleString(); },
    pct: function (n) { return (n == null || isNaN(n) || !isFinite(n)) ? '-' : Number(n).toFixed(1) + '%'; },
  };

  /** Strip HTML tags — safe to use for ECharts labels that receive fmt.krw() output */
  function stripHTML(v) { return v == null ? '' : String(v).replace(/<[^>]*>/g, ''); }
  /** Wrap a formatter function so its output is HTML-free (for ECharts canvas labels) */
  function plainFmt(fn) {
    if (!fn) return fn;
    return function (v) { return stripHTML(fn(v)); };
  }

  // ==========================================================
  // Registry (for theme refresh)
  // ==========================================================
  var registry = new Set();
  function register(h) { registry.add(h); return h; }
  function refreshAll() { registry.forEach(function (h) { if (h && h.refresh) h.refresh(); }); }

  // ==========================================================
  // _chartBase — shared skeleton for ECharts-backed widgets.
  // Factors out: el resolution · data merge · card+header+body DOM ·
  //              ECharts init/dispose · color token fetch · handle + registry.
  // buildOption(data, colors, palette) → ECharts setOption payload.
  // extraHTMLFn(data) → optional HTML appended AFTER chart body (e.g. context line).
  // ==========================================================
  function _chartBase(el, config, defaults, type, buildOption, extraHTMLFn) {
    el = q(el);
    if (!el) return null;
    var data = Object.assign({ title: '', subtitle: '', height: 240 }, defaults, config || {});
    var chart = null;
    var ro = null;

    function render() {
      applyCard(el);
      el.style.minHeight = data.height + 'px';
      var extra = extraHTMLFn ? extraHTMLFn(data) : '';
      el.innerHTML = headerHTML(data.title, data.subtitle) +
        '<div data-mw-chart data-role="chart-body" class="' + _chartBody + '"></div>' +
        extra;
      if (!EC()) return;
      var body = el.querySelector('[data-mw-chart]');
      if (chart) chart.dispose();
      chart = EC().init(body, null, { renderer: 'svg' });
      var c = getColors();
      var palette = (data.colors && Array.isArray(data.colors)) ? data.colors : buildPalette(c, 5);
      function currentSize() { return { width: body.offsetWidth || 0, height: body.offsetHeight || 0 }; }
      function buildAndSet() {
        var opt = buildOption(data, c, palette, currentSize());
        if (opt) chart.setOption(opt, true);
      }
      buildAndSet();

      // Observe container resize — when CSS lets chart body grow (e.g. flex: 1 in fixed-height grid cell),
      // ECharts needs chart.resize() + (for size-aware widgets) option rebuild.
      if (ro) ro.disconnect();
      if (typeof ResizeObserver !== 'undefined') {
        ro = new ResizeObserver(function () {
          if (!chart) return;
          if (buildOption.length >= 4) buildAndSet();
          chart.resize();
        });
        ro.observe(body);
      }
      _applyCommon(el, data);
    }
    render();
    var handle = {
      el: el, type: type,
      refresh: render,
      update: function (newData) { data = Object.assign(data, newData || {}); render(); },
      destroy: function () {
        if (ro) ro.disconnect();
        if (chart) chart.dispose();
        el.innerHTML = '';
        registry.delete(handle);
      },
    };
    return register(handle);
  }

  // ==========================================================
  // Widget: KPI Card
  // Unified — full mode (sparkline) + compact mode (icon, no sparkline)
  // ==========================================================
  function kpiCard(el, config) {
    el = q(el);
    if (!el) return null;
    var data = Object.assign({
      label: '', value: '', valueHTML: false, delta: null, sparkline: [],
      icon: '', compact: false, unit: '', valueFormatter: null,
      deltaGoodWhen: 'positive', sparkLabel: '',
    }, config || {});
    // Auto-derive: sparkline → value, delta
    // unit:'원' → 자동으로 fmt.krw 적용
    var _vfmt = typeof data.valueFormatter === 'function' ? data.valueFormatter
              : data.unit === '원' ? fmt.krw : null;
    _autoDerive(data, { arr: data.sparkline, valueFmt: _vfmt });
    _autoValueHTML(data);
    var chart = null;
    var ro = null;

    function render() {
      var c = getColors();
      applyCard(el);
      el.dataset.mwCq = 'kpi';
      // Auto-compact: if no sparkline, use compact to avoid wasted vertical space
      var hasSpark = data.sparkline && data.sparkline.length;
      var autoCompact = data.compact || !hasSpark;
      var deltaHTML = '';
      if (data.delta != null && !isNaN(data.delta)) {
        var goodWhenNeg = data.deltaGoodWhen === 'negative';
        var good = goodWhenNeg ? data.delta < 0 : data.delta > 0;
        var arrow = data.delta >= 0 ? '▲' : '▼';
        var abs = Math.abs(Number(data.delta));
        var prec = abs > 0 && abs < 1 ? 2 : 1;
        var suffix = data.deltaSuffix || '%';
        deltaHTML = '<div data-role="delta" class="' + _kpiDelta + (good ? ' text-[var(--mw-success)]' : ' text-[var(--mw-danger)]') + '">' +
          arrow + ' ' + abs.toFixed(prec) + suffix + '</div>';
      }
      var iconHTML = data.icon ? '<span class="text-[length:var(--mw-text-lg)] text-[var(--mw-text-muted)]">' + escapeHTML(data.icon) + '</span>' : '';
      var showSpark = !autoCompact && hasSpark;
      el.innerHTML =
        '<div data-role="label" class="' + _kpiLabel + '">' + iconHTML + '<span>' + escapeHTML(data.label) + '</span></div>' +
        '<div data-role="row" class="' + _kpiRow + '">' +
          '<div data-role="value" class="' + _kpiValue + '" data-mw-val>' + (data.valueHTML || (typeof data.value === 'string' && data.value.indexOf('<') >= 0) ? data.value : escapeHTML(data.value)) + '</div>' +
          deltaHTML +
        '</div>' +
        (showSpark ? '<div data-role="spark" class="' + _kpiSpark + '" data-mw-spark></div>' +
          (data.sparkLabel ? '<div data-role="spark-label">' + escapeHTML(data.sparkLabel) + '</div>' : '')
         : '');
      if (chart) { chart.dispose(); chart = null; }
      if (ro) { ro.disconnect(); ro = null; }
      if (EC() && showSpark) {
        var spark = el.querySelector('[data-mw-spark]');
        var sparkOpt = {
          grid: { top: 2, right: 2, bottom: 2, left: 2 },
          xAxis: { type: 'category', show: false, data: data.sparkline.map(function (_, i) { return i; }) },
          yAxis: { type: 'value', show: false, scale: true },
          series: [{
            type: 'line', smooth: true, symbol: 'none',
            data: data.sparkline,
            lineStyle: { color: data.sparkColor || c.accent, width: 1.6 },
            areaStyle: {
              color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: withAlpha(data.sparkColor || c.accent, 0.33) },
                  { offset: 1, color: withAlpha(data.sparkColor || c.accent, 0) },
                ] },
            },
          }],
        };
        // Init ECharts only after layout gives the spark div a real width.
        // container-type:inline-size can delay width computation.
        function initSpark() {
          chart = EC().init(spark, null, { renderer: 'svg' });
          chart.setOption(sparkOpt);
        }
        if (spark.offsetWidth > 0) {
          initSpark();
        }
        if (typeof ResizeObserver !== 'undefined') {
          ro = new ResizeObserver(function () {
            if (!chart && spark.offsetWidth > 0) initSpark();
            if (chart) chart.resize();
          });
          ro.observe(spark);
        }
      }
      _applyCommon(el, data);
    }
    render();
    var handle = {
      el: el, type: 'kpi-card',
      refresh: render,
      update: function (newData) { data = Object.assign(data, newData || {}); render(); },
      destroy: function () {
        if (ro) ro.disconnect();
        if (chart) chart.dispose();
        el.innerHTML = '';
        registry.delete(handle);
      },
    };
    return register(handle);
  }
  // ==========================================================
  // Widget: Leaderboard (HTML, no chart)
  // ==========================================================
  function leaderboard(el, config) {
    el = q(el);
    if (!el) return null;
    var data = Object.assign({ title: '', subtitle: '', items: [] }, config || {});

    function render() {
      applyCard(el);
      var c = getColors();
      var pal = buildPalette(c, (data.items || []).length);
      var list = (data.items || []).slice(0, 100).map(function (it, i) {
        var initial = it.initial || (it.name ? it.name.charAt(0) : '');
        var meta = it.meta != null ? it.meta : (it.percent + '%');
        var barColor = it.color || pal[i % pal.length];
        return '' +
          '<div data-role="item" class="' + _lbItem + '">' +
            '<div class="' + (i === 0 ? _avatarTop : _avatar) + '" style="background:' + barColor + '">' + escapeHTML(initial) + '</div>' +
            '<div data-role="body" class="' + _lbBody + '">' +
              '<div data-role="top" class="' + _lbTop + '">' +
                '<div data-role="name" class="' + _lbName + '">' + escapeHTML(it.name || '') + '</div>' +
                '<div data-role="meta" class="' + _lbMeta + '">' + escapeHTML(meta) + '</div>' +
              '</div>' +
              '<div data-role="progress" class="' + _progress + ' ' + _lbProgress + '">' +
                '<div class="' + _progressFill + '" style="width:' + (it.percent || 0) + '%;background:' + barColor + '"></div>' +
              '</div>' +
            '</div>' +
          '</div>';
      }).join('');
      el.innerHTML = headerHTML(data.title, data.subtitle) + '<div data-mw-list data-role="list" class="' + _lbList + '">' + list + '</div>';
      _applyCommon(el, data);
    }
    render();
    var handle = {
      el: el, type: 'leaderboard',
      refresh: render,
      update: function (newData) { data = Object.assign(data, newData || {}); render(); },
      destroy: function () { el.innerHTML = ''; registry.delete(handle); },
    };
    return register(handle);
  }

  // ==========================================================
  // Widget: Activity Table
  // ==========================================================
  function activityTable(el, config) {
    el = q(el);
    if (!el) return null;
    var data = Object.assign({
      title: '', subtitle: '', live: false,
      columns: [], rows: [], headerGroups: null, fixedLayout: false,
      maxRows: null, striped: false,
    }, config || {});
    // maxRows — limit displayed rows
    if (data.maxRows && data.rows.length > data.maxRows) {
      data.rows = data.rows.slice(0, data.maxRows);
    }

    function alignCls(align) {
      if (align === 'right')  return ' class="' + _tableRight + '"';
      if (align === 'center') return ' class="text-center"';
      return '';
    }

    function render() {
      applyCard(el);
      var rightEl = data.live
        ? '<span class="' + _badgeMuted + '"><span class="' + _liveDot + '" style="margin:0 0.25rem 0 0"></span>LIVE</span>'
        : '';
      var colgroup = '';
      if (data.columns.some(function (c) { return c.width; })) {
        colgroup = '<colgroup>' + data.columns.map(function (col) {
          return '<col' + (col.width ? ' style="width:' + col.width + '"' : '') + '>';
        }).join('') + '</colgroup>';
      }
      var ths = data.columns.map(function (col) {
        return '<th' + alignCls(col.align) + ' class="' + _tableTh + (col.align === 'right' ? ' ' + _tableRight : '') + '">' + escapeHTML(col.label) + '</th>';
      }).join('');
      var theadHtml;
      if (data.headerGroups && data.headerGroups.length) {
        var groupRow = data.headerGroups.map(function (g) {
          var cls = (g.align === 'right' ? _tableRight + ' ' : g.align === 'center' ? 'text-center ' : '') + 'font-medium text-[length:var(--mw-text-xs)] text-[var(--mw-text-muted)] border-b border-[var(--mw-border)] p-2';
          return '<th class="' + cls + '" colspan="' + (g.span || 1) + '">' + escapeHTML(g.label) + '</th>';
        }).join('');
        theadHtml = '<thead><tr>' + groupRow + '</tr><tr>' + ths + '</tr></thead>';
      } else {
        theadHtml = '<thead><tr>' + ths + '</tr></thead>';
      }
      var allRows = (data.rows || []).slice(0, 100);
      var trs = allRows.map(function (row, ri) {
        var tds = data.columns.map(function (col) {
          var v = row[col.key];
          var content;
          if (typeof col.render === 'function') {
            try { content = col.render(v, row); } catch (e) { content = v == null ? '' : _valOrEsc(String(v)); }
          } else content = v == null ? '' : _valOrEsc(String(v));
          var tdCls = _tableTd + (col.align === 'right' ? ' ' + _tableRight : '');
          if (ri === allRows.length - 1) tdCls += ' border-b-0';
          return '<td class="' + tdCls + '">' + content + '</td>';
        }).join('');
        return '<tr class="hover:bg-[var(--mw-surface-2)]">' + tds + '</tr>';
      }).join('');
      var tableStyle = data.fixedLayout ? ' style="table-layout:fixed"' : '';
      el.innerHTML = headerHTML(data.title, data.subtitle, rightEl) +
        '<div data-mw-list data-role="table-wrap" class="' + _tableWrap + '"><table data-role="table" class="' + _table + '"' + tableStyle + '>' +
        colgroup + theadHtml + '<tbody>' + trs + '</tbody></table></div>';
      _applyCommon(el, data);
    }
    render();
    var handle = {
      el: el, type: 'activity-table',
      refresh: render,
      update: function (newData) { data = Object.assign(data, newData || {}); render(); },
      destroy: function () { el.innerHTML = ''; registry.delete(handle); },
    };
    return register(handle);
  }
  // ==========================================================
  // Widget: Hero Tile (iOS weather-widget style)
  // ==========================================================
  function heroTile(el, config) {
    el = q(el);
    if (!el) return null;
    var data = Object.assign({
      kicker: '', value: '', tagline: '', stats: [],
    }, config || {});
    _autoValueHTML(data);

    function render() {
      applyCard(el); el.className += ' ' + _hero;
      el.dataset.mwCq = 'hero';
      var statsHTML = '';
      if (data.stats && data.stats.length) {
        statsHTML = '<div class="border-t border-[var(--mw-border)] mt-4 pt-3"></div><div class="flex items-baseline gap-4 flex-wrap">';
        data.stats.forEach(function(s, i) {
          if (i > 0) statsHTML += '<div class="text-[var(--mw-border)] select-none">·</div>';
          statsHTML +=
            '<div>' +
              '<div class="text-[length:var(--mw-text-xs)] text-[var(--mw-text-muted)]">' + escapeHTML(s.label) + '</div>' +
              '<div class="text-[length:var(--mw-text-base)] font-semibold text-[var(--mw-text)] mt-0.5">' + _valOrEsc(s.value) + '</div>' +
            '</div>';
        });
        statsHTML += '</div>';
      }
      el.innerHTML =
        '<div data-role="kicker" class="' + _heroLabel + '">' + escapeHTML(data.kicker) + '</div>' +
        '<div data-role="value" data-mw-val class="' + _heroValue + '">' + (data.valueHTML ? data.value : escapeHTML(data.value)) + '</div>' +
        (data.tagline ? '<div data-role="tagline" class="' + _heroContext + '">' + escapeHTML(data.tagline) + '</div>' : '') +
        statsHTML;
      _applyCommon(el, data);
    }

    render();
    var handle = {
      el: el, type: 'hero-tile',
      refresh: render,
      update: function(newData) { data = Object.assign(data, newData || {}); render(); },
      destroy: function() { el.innerHTML = ''; registry.delete(handle); },
    };
    return register(handle);
  }
  // ==========================================================
  // Widget: Timeline / Activity Feed (vertical dots + text)
  // ==========================================================
  function timeline(el, config) {
    el = q(el);
    if (!el) return null;
    var data = Object.assign({
      title: '', subtitle: '',
      items: [],
    }, config || {});

    function render() {
      applyCard(el);
      var allItems = (data.items || []).slice(0, 100);
      var items = allItems.map(function (it, idx) {
        var dotColorMap = { success: 'var(--mw-success)', warning: 'var(--mw-warning)', danger: 'var(--mw-danger)', info: 'var(--mw-text-muted)' };
        var dotStyle = it.type && dotColorMap[it.type] ? ' style="background:' + dotColorMap[it.type] + ';outline-color:color-mix(in srgb,' + dotColorMap[it.type] + ' 30%,var(--mw-border))"' : '';
        var isLast = idx === allItems.length - 1;
        return '<div data-role="item" class="' + (isLast ? _tlItem : _tlItemNotLast) + '">' +
          '<div data-role="marker" class="' + _tlMarker + '">' +
            '<div data-role="dot" class="' + _tlDot + '"' + dotStyle + '></div>' +
            (isLast ? '' : '<div data-role="line" class="' + _tlLine + '"></div>') +
          '</div>' +
          '<div data-role="body" class="' + _tlBody + '">' +
            '<div data-role="time" class="' + _tlTime + '">' + escapeHTML(it.time || '') + '</div>' +
            '<div data-role="text" class="' + _tlText + '">' + (it.html || escapeHTML(it.text || '')) + '</div>' +
          '</div>' +
        '</div>';
      }).join('');
      el.innerHTML = headerHTML(data.title, data.subtitle) +
        '<div data-mw-list data-role="timeline" class="' + _timeline + '">' + items + '</div>';
      _applyCommon(el, data);
    }
    render();
    var handle = {
      el: el, type: 'timeline',
      refresh: render,
      update: function (newData) { data = Object.assign(data, newData || {}); render(); },
      destroy: function () { el.innerHTML = ''; registry.delete(handle); },
    };
    return register(handle);
  }

  // ==========================================================
  // Widget: Status Grid (service health dots)
  // ==========================================================
  function statusGrid(el, config) {
    el = q(el);
    if (!el) return null;
    var data = Object.assign({
      title: '', subtitle: '',
      items: [],
      columns: 3,
    }, config || {});

    function render() {
      applyCard(el);
      var dotColorMap = { ok: 'var(--mw-success)', warning: 'var(--mw-warning)', danger: 'var(--mw-danger)', info: 'var(--mw-text-muted)' };
      var items = (data.items || []).slice(0, 100).map(function (it) {
        var dotBg = dotColorMap[it.status || 'ok'] || dotColorMap.ok;
        return '<div data-role="item" class="' + _statusItem + '">' +
          '<span data-role="dot" class="' + _statusDot + '" style="background:' + dotBg + '"></span>' +
          '<span data-role="label" class="' + _statusLabel + '">' + escapeHTML(it.label) + '</span>' +
          (it.value ? '<span data-role="value" class="' + _statusValue + '">' + _valOrEsc(String(it.value)) + '</span>' : '') +
        '</div>';
      }).join('');
      el.innerHTML = headerHTML(data.title, data.subtitle) +
        '<div data-role="grid" class="' + _statusGrid + '" style="grid-template-columns: repeat(' + data.columns + ', minmax(0, 1fr));">' + items + '</div>';
      _applyCommon(el, data);
    }
    render();
    var handle = {
      el: el, type: 'status-grid',
      refresh: render,
      update: function (newData) { data = Object.assign(data, newData || {}); render(); },
      destroy: function () { el.innerHTML = ''; registry.delete(handle); },
    };
    return register(handle);
  }

  // ==========================================================
  // Widget: Countdown Tile (time to target date)
  // ==========================================================
  function countdownTile(el, config) {
    el = q(el);
    if (!el) return null;
    var data = Object.assign({
      title: '', subtitle: '',
      target: null, label: '', context: '',
    }, config || {});
    var timer = null;

    function getParts() {
      if (!data.target) return null;
      var target = typeof data.target === 'number' ? data.target : new Date(data.target).getTime();
      var diff = Math.max(0, target - Date.now());
      return {
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
      };
    }

    function render() {
      applyCard(el);
      el.dataset.mwCq = 'countdown';
      var parts = getParts();
      var body = '';
      if (parts) {
        body = '<div data-role="body" class="' + _cdBody + '">' +
          '<div data-role="unit" class="' + _cdUnit + '"><span data-role="num" data-mw-val class="' + _cdNum + '">' + parts.days + '</span><span data-role="lbl" class="' + _cdLbl + '">days</span></div>' +
          '<div data-role="unit" class="' + _cdUnit + '"><span data-role="num" data-mw-val class="' + _cdNum + '">' + String(parts.hours).padStart(2, '0') + '</span><span data-role="lbl" class="' + _cdLbl + '">hrs</span></div>' +
          '<div data-role="unit" class="' + _cdUnit + '"><span data-role="num" data-mw-val class="' + _cdNum + '">' + String(parts.mins).padStart(2, '0') + '</span><span data-role="lbl" class="' + _cdLbl + '">min</span></div>' +
        '</div>';
      }
      el.innerHTML = headerHTML(data.title, data.subtitle) +
        (data.label ? '<div data-role="label" class="' + _cdLabel + '">' + escapeHTML(data.label) + '</div>' : '') +
        body +
        (data.context ? '<div data-role="context" class="' + _cdContext + '">' + escapeHTML(data.context) + '</div>' : '');
      _applyCommon(el, data);
    }
    render();
    if (timer) clearInterval(timer);
    timer = setInterval(render, 60000);

    var handle = {
      el: el, type: 'countdown-tile',
      refresh: render,
      update: function (newData) { data = Object.assign(data, newData || {}); render(); },
      destroy: function () { if (timer) clearInterval(timer); el.innerHTML = ''; registry.delete(handle); },
    };
    return register(handle);
  }

  // ==========================================================
  // Widget: Metric Stack (bento: main metric + sub metrics)
  // ==========================================================
  function metricStack(el, config) {
    el = q(el);
    if (!el) return null;
    var data = Object.assign({
      title: '',
      main: { label: '', value: '', delta: null, deltaGoodWhen: 'positive' },
      items: [],
    }, config || {});

    function render() {
      applyCard(el); el.className += ' ' + _mstack;
      el.dataset.mwCq = 'mstack';
      var main = data.main || {};
      var mainDelta = '';
      if (main.delta != null && !isNaN(main.delta)) {
        var goodWhenNeg = main.deltaGoodWhen === 'negative';
        var good = goodWhenNeg ? main.delta < 0 : main.delta > 0;
        mainDelta = '<span data-role="delta" class="' + _mstackDelta + (good ? ' text-[var(--mw-success)]' : ' text-[var(--mw-danger)]') + '">' +
          (main.delta >= 0 ? '▲' : '▼') + ' ' + Math.abs(Number(main.delta)).toFixed(1) + '%</span>';
      }
      var subItems = data.items.map(function (it) {
        return '<div>' +
          '<div data-role="sub-value" class="' + _mstackSubVal + '">' + _valOrEsc(it.value) + '</div>' +
          '<div data-role="sub-label" class="' + _mstackSubLbl + '">' + escapeHTML(it.label) + '</div>' +
        '</div>';
      }).join('');
      el.innerHTML =
        (data.title ? '<div data-role="title" class="' + _mstackTitle + '">' + escapeHTML(data.title) + '</div>' : '') +
        '<div data-role="main-row" class="' + _mstackMainRow + '">' +
          '<div data-role="value" data-mw-val class="' + _mstackMainVal + '">' + _valOrEsc(main.value) + '</div>' +
          mainDelta +
        '</div>' +
        '<div data-role="main-label" class="' + _mstackMainLbl + '">' + escapeHTML(main.label || '') + '</div>' +
        (subItems ? '<div data-role="sub-row" class="' + _mstackSubRow + '">' + subItems + '</div>' : '');
      _applyCommon(el, data);
    }
    render();
    var handle = {
      el: el, type: 'metric-stack',
      refresh: render,
      update: function (newData) { data = Object.assign(data, newData || {}); render(); },
      destroy: function () { el.innerHTML = ''; registry.delete(handle); },
    };
    return register(handle);
  }

  // ==========================================================
  // Widget: Inbox Preview (notification list)
  // ==========================================================
  function inboxPreview(el, config) {
    el = q(el);
    if (!el) return null;
    var data = Object.assign({
      title: '', subtitle: '',
      items: [],
    }, config || {});

    function render() {
      applyCard(el);
      var iconColorMap = { success: '--mw-success', warning: '--mw-warning', danger: '--mw-danger', info: '--mw-accent' };
      var allItems = (data.items || []).slice(0, 100);
      var items = allItems.map(function (it, idx) {
        var iconExtra = '';
        if (it.type && iconColorMap[it.type]) {
          var cv = iconColorMap[it.type];
          iconExtra = ' style="color:var(' + cv + ');background:color-mix(in srgb,var(' + cv + ') 15%,transparent)"';
        }
        var isLast = idx === allItems.length - 1;
        var isFirst = idx === 0;
        var itemCls = _inboxItem + (isLast ? ' border-b-0 pb-0' : '') + (isFirst ? ' pt-0' : '');
        return '<div data-role="item" class="' + itemCls + '">' +
          '<div data-role="icon" class="' + _inboxIcon + '"' + iconExtra + '>' + (it.icon || '•') + '</div>' +
          '<div data-role="body" class="' + _inboxBody + '">' +
            '<div data-role="text" class="' + _inboxText + '">' + (it.html || escapeHTML(it.text || '')) + '</div>' +
          '</div>' +
          '<div data-role="time" class="' + _inboxTime + '">' + escapeHTML(it.time || '') + '</div>' +
        '</div>';
      }).join('');
      el.innerHTML = headerHTML(data.title, data.subtitle) +
        '<div data-mw-list data-role="inbox" class="' + _inbox + '">' + items + '</div>';
      _applyCommon(el, data);
    }
    render();
    var handle = {
      el: el, type: 'inbox-preview',
      refresh: render,
      update: function (newData) { data = Object.assign(data, newData || {}); render(); },
      destroy: function () { el.innerHTML = ''; registry.delete(handle); },
    };
    return register(handle);
  }

  // ==========================================================
  // Widget: Compare Card (A vs B big numbers)
  // ==========================================================
  function compareCard(el, config) {
    el = q(el);
    if (!el) return null;
    var data = Object.assign({
      title: '', subtitle: '',
      left: { label: '', value: '' },
      right: { label: '', value: '' },
      delta: null, deltaLabel: '', deltaGoodWhen: 'positive',
    }, config || {});
    // Auto-derive: delta from left/right values
    if (data.delta == null) {
      var lv = _parseNumVal(data.left.value);
      var rv = _parseNumVal(data.right.value);
      var rate = _growthRate(rv, lv);
      if (rate != null) data.delta = Math.round(rate * 10) / 10;
    }

    function render() {
      applyCard(el);
      el.dataset.mwCq = 'compare';
      var deltaHTML = '';
      if (data.delta != null) {
        var isNum = typeof data.delta === 'number';
        var goodWhenNeg = data.deltaGoodWhen === 'negative';
        var good = isNum ? (goodWhenNeg ? data.delta < 0 : data.delta > 0) : true;
        var arrow = isNum ? (data.delta >= 0 ? '▲' : '▼') : '→';
        var deltaStr = isNum ? Math.abs(data.delta).toFixed(1) + '%' : escapeHTML(String(data.delta));
        deltaHTML = '<div data-role="delta" class="' + _compareDelta + (good ? ' text-[var(--mw-success)]' : ' text-[var(--mw-danger)]') + '">' +
          arrow + ' ' + deltaStr +
          (data.deltaLabel ? ' <span data-role="delta-label" class="' + _compareDeltaLbl + '">' + escapeHTML(data.deltaLabel) + '</span>' : '') +
        '</div>';
      }
      el.innerHTML = headerHTML(data.title, data.subtitle) +
        '<div data-role="row" class="' + _compareRow + '">' +
          '<div data-role="side" class="' + _compareSide + '">' +
            '<div data-role="label" class="' + _compareLbl + '">' + escapeHTML(data.left.label || '') + '</div>' +
            '<div data-role="value" data-mw-val class="' + _compareVal + '">' + _valOrEsc(data.left.value) + '</div>' +
          '</div>' +
          '<div data-role="sep" class="' + _compareSep + '">→</div>' +
          '<div data-role="side" class="' + _compareSide + '">' +
            '<div data-role="label" class="' + _compareLbl + '">' + escapeHTML(data.right.label || '') + '</div>' +
            '<div data-role="value" data-mw-val class="' + _compareVal + ' font-bold">' + _valOrEsc(data.right.value) + '</div>' +
          '</div>' +
        '</div>' +
        deltaHTML;
      _applyCommon(el, data);
    }
    render();
    var handle = {
      el: el, type: 'compare-card',
      refresh: render,
      update: function (newData) { data = Object.assign(data, newData || {}); render(); },
      destroy: function () { el.innerHTML = ''; registry.delete(handle); },
    };
    return register(handle);
  }
  // ==========================================================
  // Widget: Event Calendar (month grid with dot/badge markers)
  // ==========================================================
  function eventCalendar(el, config) {
    el = q(el);
    if (!el) return null;
    var now = new Date();
    var data = Object.assign({
      title: '', subtitle: '',
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      events: [],
      startOfWeek: 'sun',
      weekdayLabels: null,
      monthLabels: null,
      showList: false,
      listLimit: null,
      listFilter: 'all',
    }, config || {});

    function render() {
      el.classList.add('mw-evcal');
      applyCard(el);
      var year = data.year, month = data.month;
      var daysInMonth = new Date(year, month, 0).getDate();
      var firstDay = new Date(year, month - 1, 1).getDay();
      var shift = data.startOfWeek === 'mon' ? 1 : 0;
      var offset = (firstDay - shift + 7) % 7;

      var defaultLbls = data.startOfWeek === 'mon'
        ? ['M','T','W','T','F','S','S']
        : ['S','M','T','W','T','F','S'];
      var lbls = data.weekdayLabels || defaultLbls;

      var allEvents = (data.events || []).slice(0, 100);
      var byDate = {};
      allEvents.forEach(function (e) {
        if (!e || !e.date) return;
        (byDate[e.date] = byDate[e.date] || []).push(e);
      });

      var today = new Date();
      var todayStr = today.getFullYear() + '-' +
        String(today.getMonth() + 1).padStart(2, '0') + '-' +
        String(today.getDate()).padStart(2, '0');

      var cells = '';
      for (var i = 0; i < offset; i++) {
        cells += '<div class="mw-evcal__cell mw-evcal__cell--blank"></div>';
      }
      for (var d = 1; d <= daysInMonth; d++) {
        var dateStr = year + '-' + String(month).padStart(2, '0') + '-' + String(d).padStart(2, '0');
        var evs = byDate[dateStr] || [];
        var isToday = dateStr === todayStr;
        var dots = evs.slice(0, 3).map(function (e) {
          var t = e.type || 'accent';
          return '<span class="mw-evcal__dot mw-evcal__dot--' + t + '"></span>';
        }).join('');
        var more = evs.length > 3 ? '<span class="mw-evcal__more">+' + (evs.length - 3) + '</span>' : '';
        var tip = evs.length
          ? ' title="' + escapeHTML(evs.map(function (e) {
              return (e.label || '') + (e.count != null ? ' (' + e.count + ')' : '');
            }).join(' · ')) + '"'
          : '';
        cells += '<div class="mw-evcal__cell' +
          (isToday ? ' mw-evcal__cell--today' : '') +
          (evs.length ? ' mw-evcal__cell--has' : '') + '"' + tip + '>' +
          '<span class="mw-evcal__num">' + d + '</span>' +
          ((dots || more) ? '<span class="mw-evcal__dots">' + dots + more + '</span>' : '') +
          '</div>';
      }

      var headRow = lbls.map(function (w) {
        return '<div class="mw-evcal__wd">' + escapeHTML(w) + '</div>';
      }).join('');

      var monthNames = data.monthLabels ||
        ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      var monthLabel = monthNames[month - 1] + ' ' + year;

      var listHTML = '';
      if (data.showList && allEvents.length) {
        var filtered = allEvents.filter(function (e) { return e && e.date; });
        if (data.listFilter === 'upcoming') {
          filtered = filtered.filter(function (e) { return e.date >= todayStr; });
        }
        filtered.sort(function (a, b) { return a.date.localeCompare(b.date); });
        var limited = data.listLimit ? filtered.slice(0, data.listLimit) : filtered;
        if (limited.length) {
          var items = limited.map(function (e) {
            var type = e.type || 'accent';
            var parts = e.date.split('-');
            var dateStr = parts.length === 3 ? (+parts[1]) + '/' + (+parts[2]) : e.date;
            var isToday = e.date === todayStr;
            return '<div class="mw-evcal__list-item' + (isToday ? ' mw-evcal__list-item--today' : '') + '">' +
              '<span class="mw-evcal__list-date">' + dateStr + '</span>' +
              '<span class="mw-evcal__dot mw-evcal__dot--' + type + '"></span>' +
              '<span class="mw-evcal__list-label">' + escapeHTML(e.label || '') + '</span>' +
              (e.count != null ? '<span class="mw-evcal__list-count">' + escapeHTML(e.count) + '</span>' : '') +
              '</div>';
          }).join('');
          var omitted = data.listLimit && filtered.length > data.listLimit
            ? '<div class="mw-evcal__list-more">+' + (filtered.length - data.listLimit) + ' more</div>'
            : '';
          listHTML = '<div class="mw-evcal__list">' + items + omitted + '</div>';
        }
      }

      el.innerHTML = headerHTML(data.title || monthLabel, data.subtitle) +
        '<div class="mw-evcal__grid">' +
          '<div class="mw-evcal__row mw-evcal__row--head">' + headRow + '</div>' +
          '<div class="mw-evcal__row">' + cells + '</div>' +
        '</div>' + listHTML;
      _applyCommon(el, data);
    }
    render();
    var handle = {
      el: el, type: 'event-calendar',
      refresh: render,
      update: function (newData) { data = Object.assign(data, newData || {}); render(); },
      destroy: function () { el.innerHTML = ''; registry.delete(handle); },
    };
    return register(handle);
  }

  // ==========================================================
  // Widget: Progress Stepper (horizontal milestone tracker)
  // ==========================================================
  function progressStepper(el, config) {
    el = q(el);
    if (!el) return null;
    var data = Object.assign({
      title: '', kicker: '', subtitle: '',
      status: null,
      meta: [],
      steps: [],
      statusLabels: { done: '완료', active: '진행중', pending: '예정' },
    }, config || {});

    function render() {
      el.classList.add('mw-stepper');
      applyCard(el);

      var statusHTML = '';
      if (data.status) {
        var t = (data.status.type || 'accent');
        statusHTML = '<span class="mw-stepper__status mw-stepper__status--' + t + '">' +
          '<span class="mw-stepper__status-dot"></span>' +
          escapeHTML(data.status.label || '') + '</span>';
      }

      var titleHTML = '';
      if (data.title || data.kicker) {
        titleHTML = '<div class="mw-stepper__title">' + escapeHTML(data.title || '') +
          (data.kicker ? '<span class="mw-stepper__kicker">' + escapeHTML(data.kicker) + '</span>' : '') +
          '</div>';
      }
      if (data.subtitle) {
        titleHTML += '<div class="mw-stepper__subtitle">' + escapeHTML(data.subtitle) + '</div>';
      }

      var metaHTML = '';
      if (data.meta && data.meta.length) {
        var parts = data.meta.map(function (m) {
          if (typeof m === 'string') {
            return '<span class="mw-stepper__meta-item">' + escapeHTML(m) + '</span>';
          }
          var icon = m.icon ? '<span class="mw-stepper__meta-icon">' + escapeHTML(m.icon) + '</span>' : '';
          var lbl = m.label ? '<span class="mw-stepper__meta-lbl">' + escapeHTML(m.label) + '</span>' : '';
          return '<span class="mw-stepper__meta-item">' + icon + lbl +
            '<span class="mw-stepper__meta-val">' + escapeHTML(m.value || '') + '</span></span>';
        });
        metaHTML = '<div class="mw-stepper__meta">' + parts.join('') + '</div>';
      }

      var steps = (data.steps || []).map(function (s, i) {
        var st = s.status || 'pending';
        var num = i + 1;
        var marker;
        if (st === 'done') {
          marker = '<span class="mw-stepper__mark mw-stepper__mark--done">✓</span>';
        } else if (st === 'active') {
          marker = '<span class="mw-stepper__mark mw-stepper__mark--active"></span>';
        } else {
          marker = '<span class="mw-stepper__mark mw-stepper__mark--pending">' + num + '</span>';
        }
        var badge = (st === 'active' && s.badge)
          ? '<div class="mw-stepper__badge">' + escapeHTML(s.badge) + '</div>'
          : '';
        var chipLabel = data.statusLabels && data.statusLabels[st];
        var chip = chipLabel
          ? '<span class="mw-stepper__chip mw-stepper__chip--' + st + '">' + escapeHTML(chipLabel) + '</span>'
          : '';
        return '<div class="mw-stepper__step mw-stepper__step--' + st + '">' +
          badge + marker +
          '<div class="mw-stepper__step-lbl">' + num + '. ' + escapeHTML(s.label || '') + '</div>' +
          chip +
          (s.date ? '<div class="mw-stepper__step-date">' + escapeHTML(s.date) + '</div>' : '') +
          '</div>';
      }).join('');

      el.innerHTML =
        '<div class="mw-stepper__head">' +
          '<div>' + titleHTML + '</div>' + statusHTML +
        '</div>' +
        metaHTML +
        '<div class="mw-stepper__track">' + steps + '</div>';
      _applyCommon(el, data);
    }
    render();
    var handle = {
      el: el, type: 'progress-stepper',
      refresh: render,
      update: function (newData) { data = Object.assign(data, newData || {}); render(); },
      destroy: function () { el.innerHTML = ''; registry.delete(handle); },
    };
    return register(handle);
  }

  // ==========================================================
  // Widget: Sparkline List — compact label + value + delta + mini spark row list
  // items: [{ label, value, delta?, sparkline, deltaGoodWhen? }]
  // ==========================================================
  function sparklineList(el, config) {
    el = q(el);
    if (!el) return null;
    var data = Object.assign({
      title: '', subtitle: '',
      items: [],
    }, config || {});
    // Auto-derive: each item's sparkline → value, delta
    data.items.forEach(function (it) {
      var _vf = typeof it.valueFormatter === 'function' ? it.valueFormatter
              : it.unit === '원' ? fmt.krw : null;
      _autoDerive(it, { arr: it.sparkline, valueFmt: _vf });
    });
    var charts = [];
    var ros = [];

    function cleanup() {
      charts.forEach(function (ch) { if (ch) ch.dispose(); });
      ros.forEach(function (ro) { if (ro) ro.disconnect(); });
      charts = []; ros = [];
    }

    function render() {
      cleanup();
      applyCard(el);
      var c = getColors();
      var rows = data.items.map(function (it, i) {
        var deltaHTML = '';
        if (it.delta != null && !isNaN(it.delta)) {
          var goodWhenNeg = it.deltaGoodWhen === 'negative';
          var good = goodWhenNeg ? it.delta < 0 : it.delta > 0;
          var arrow = it.delta >= 0 ? '▲' : '▼';
          deltaHTML = '<span class="' + _kpiDelta + (good ? ' text-[var(--mw-success)]' : ' text-[var(--mw-danger)]') + '">' +
            arrow + ' ' + Math.abs(Number(it.delta)).toFixed(1) + '%</span>';
        }
        return '<div data-role="row" class="flex items-center gap-3 py-[var(--mw-space-2)] border-b border-dashed border-[var(--mw-border)] last:border-b-0">' +
          '<div data-role="info" class="flex-1 min-w-0">' +
            '<div data-role="label" class="text-[length:var(--mw-text-sm)] text-[var(--mw-text)] overflow-hidden text-ellipsis whitespace-nowrap">' + escapeHTML(it.label || '') + '</div>' +
            '<div class="flex items-baseline gap-2 mt-0.5">' +
              '<span data-role="value" class="text-[length:var(--mw-text-base)] font-semibold text-[var(--mw-text)] [font-variant-numeric:tabular-nums]">' + _valOrEsc(it.value) + '</span>' +
              deltaHTML +
            '</div>' +
          '</div>' +
          '<div data-role="spark" class="w-[80px] h-[28px] shrink-0" data-idx="' + i + '"></div>' +
        '</div>';
      }).join('');
      el.innerHTML = headerHTML(data.title, data.subtitle) +
        '<div data-role="body" class="flex flex-col">' + rows + '</div>';
      if (!EC()) return;
      data.items.forEach(function (it, i) {
        if (!it.sparkline || !it.sparkline.length) return;
        var spark = el.querySelector('[data-role="spark"][data-idx="' + i + '"]');
        if (!spark) return;
        var col = c.accent;
        if (it.delta != null) {
          var goodWhenNeg = it.deltaGoodWhen === 'negative';
          var good = goodWhenNeg ? it.delta < 0 : it.delta > 0;
          col = good ? c.success : c.danger;
        }
        var opt = {
          grid: { top: 2, right: 2, bottom: 2, left: 2 },
          xAxis: { type: 'category', show: false, data: it.sparkline.map(function (_, k) { return k; }) },
          yAxis: { type: 'value', show: false, scale: true },
          series: [{
            type: 'line', smooth: true, symbol: 'none',
            data: it.sparkline,
            lineStyle: { color: col, width: 1.4 },
            areaStyle: {
              color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: withAlpha(col, 0.27) },
                  { offset: 1, color: withAlpha(col, 0) },
                ] },
            },
          }],
        };
        var ch = null;
        function initSpark() {
          ch = EC().init(spark, null, { renderer: 'svg' });
          ch.setOption(opt);
          charts.push(ch);
        }
        if (spark.offsetWidth > 0) initSpark();
        if (typeof ResizeObserver !== 'undefined') {
          var ro = new ResizeObserver(function () {
            if (!ch && spark.offsetWidth > 0) initSpark();
            if (ch) ch.resize();
          });
          ro.observe(spark);
          ros.push(ro);
        }
      });
      _applyCommon(el, data);
    }
    render();
    var handle = {
      el: el, type: 'sparkline-list',
      refresh: render,
      update: function (newData) { data = Object.assign(data, newData || {}); render(); },
      destroy: function () { cleanup(); el.innerHTML = ''; registry.delete(handle); },
    };
    return register(handle);
  }

  // ==========================================================
  // Widget: Goal Grid — multi-goal progress bars (OKR-style)
  // items: [{ label, value, max, unit?, sublabel?, deltaGoodWhen? }]
  // ==========================================================
  function goalGrid(el, config) {
    el = q(el);
    if (!el) return null;
    var data = Object.assign({
      title: '', subtitle: '',
      items: [],
      valueFormatter: safeNum,
      thresholds: [[0.5, 'danger'], [0.85, 'warning'], [1.0, 'good']],
    }, config || {});

    function colorFor(ratio) {
      for (var i = 0; i < data.thresholds.length; i++) {
        if (ratio <= data.thresholds[i][0]) return data.thresholds[i][1];
      }
      return 'good';
    }

    function render() {
      applyCard(el);
      var goalColorMap = { good: 'var(--mw-success)', warning: 'var(--mw-warning)', danger: 'var(--mw-danger)' };
      var rows = data.items.map(function (it) {
        var ratio = it.max > 0 ? Math.max(0, it.value / it.max) : 0;
        var pct = Math.round(ratio * 100);
        var color = colorFor(ratio);
        var fillBg = goalColorMap[color] || 'var(--mw-accent)';
        var unit = it.unit ? escapeHTML(it.unit) : '';
        var sublabel = it.sublabel ? '<span class="text-[var(--mw-text-muted)] ml-1 font-normal">' + escapeHTML(it.sublabel) + '</span>' : '';
        return '<div class="mb-[var(--mw-space-3)]">' +
          '<div class="flex items-baseline justify-between gap-2 mb-[var(--mw-space-1)]">' +
            '<div class="text-[length:var(--mw-text-sm)] font-medium text-[var(--mw-text)]">' + escapeHTML(it.label) + sublabel + '</div>' +
            '<div class="text-[length:var(--mw-text-xs)] text-[var(--mw-text-muted)] [font-variant-numeric:tabular-nums] shrink-0 flex items-baseline gap-0.5">' +
              '<span class="font-semibold text-[var(--mw-text)]">' + _valOrEsc(String(data.valueFormatter(it.value))) + unit + '</span>' +
              '<span>/</span>' +
              '<span>' + escapeHTML(data.valueFormatter(it.max)) + unit + '</span>' +
              '<span class="font-semibold ml-1" style="color:' + fillBg + '">' + pct + '%</span>' +
            '</div>' +
          '</div>' +
          '<div class="' + _progress + '">' +
            '<div class="' + _progressFill + '" style="width:' + Math.min(pct, 100) + '%;background:' + fillBg + '"></div>' +
          '</div>' +
        '</div>';
      }).join('');
      el.innerHTML = headerHTML(data.title, data.subtitle) +
        '<div>' + rows + '</div>';
      _applyCommon(el, data);
    }
    render();
    var handle = {
      el: el, type: 'goal-grid',
      refresh: render,
      update: function (newData) { data = Object.assign(data, newData || {}); render(); },
      destroy: function () { el.innerHTML = ''; registry.delete(handle); },
    };
    return register(handle);
  }

  // ==========================================================
  // Widget: Page Header — top-of-page hero header
  // config: { kicker?, title, subtitle?, meta? }
  // ==========================================================
  function pageHeader(el, config) {
    el = q(el);
    if (!el) return null;
    var data = Object.assign({ kicker: '', title: '', subtitle: '', meta: '' }, config || {});
    // Coerce all text fields — LLMs sometimes pass arrays/objects
    ['kicker','title','subtitle','meta'].forEach(function(k) { data[k] = toStr(data[k]); });
    function render() {
      // page-head (no card)
      el.innerHTML =
        (data.kicker ? '<div class="' + _pageHeadKicker + ' flex items-center gap-[var(--mw-space-1-5)]"><span class="inline-block w-[6px] h-[6px] rounded-full bg-[var(--mw-accent)]"></span>' + escapeHTML(data.kicker) + '</div>' : '') +
        '<div class="flex items-baseline gap-3 flex-wrap">' +
          '<h1 class="' + _pageHeadTitle + '">' + escapeHTML(data.title) + '</h1>' +
          (data.meta ? '<span class="text-[length:var(--mw-text-xs)] text-[var(--mw-text-muted)] font-[family-name:var(--mw-mono-font)] tracking-[0.02em]">' + escapeHTML(data.meta) + '</span>' : '') +
        '</div>' +
        (data.subtitle ? '<div class="' + _pageHeadMeta + '"><span>' + _valOrEsc(data.subtitle) + '</span></div>' : '');
      _applyCommon(el, data);
    }
    render();
    var handle = { el: el, type: 'page-header', refresh: render,
      update: function (newData) { data = Object.assign(data, newData || {}); render(); },
      destroy: function () { el.innerHTML = ''; registry.delete(handle); } };
    return register(handle);
  }

  // ==========================================================
  // Widget: Section Head — between grid groups
  // config: { index?, kicker, title, tag? }
  // ==========================================================
  function sectionHead(el, config) {
    el = q(el);
    if (!el) return null;
    var data = Object.assign({ index: '', kicker: '', title: '', tag: '' }, config || {});
    ['index','kicker','title','tag'].forEach(function(k) { data[k] = toStr(data[k]); });
    function render() {
      // section-head (no card)
      var kickerText = data.index ? (data.index + ' · ' + data.kicker) : data.kicker;
      el.innerHTML =
        '<div class="flex-1 min-w-0">' +
          (kickerText ? '<div class="' + _secHeadKicker + '">' + escapeHTML(kickerText) + '</div>' : '') +
          (data.title ? '<h2 class="' + _secHeadTitle + '">' + escapeHTML(data.title) + '</h2>' : '') +
        '</div>' +
        (data.tag ? '<div class="text-[length:var(--mw-text-xs)] text-[var(--mw-text-muted)] font-[family-name:var(--mw-mono-font)] shrink-0">' + escapeHTML(data.tag) + '</div>' : '');
      _applyCommon(el, data);
    }
    render();
    var handle = { el: el, type: 'section-head', refresh: render,
      update: function (newData) { data = Object.assign(data, newData || {}); render(); },
      destroy: function () { el.innerHTML = ''; registry.delete(handle); } };
    return register(handle);
  }

  // ==========================================================
  // Widget: Alert Banner — horizontal stripe (not a card)
  // types: 'info' | 'warning' | 'danger' | 'success'
  // ==========================================================
  function alertBanner(el, config) {
    el = q(el);
    if (!el) return null;
    var data = Object.assign({
      type: 'info',
      title: '', message: '',
      icon: null,
      action: null,
      dismissable: false,
    }, config || {});
    ['title','message'].forEach(function(k) { data[k] = toStr(data[k]); });

    var _svgCheck = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>';
    var _svgWarn = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>';
    var _svgDanger = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>';
    var icons = { info: _svgCheck, warning: _svgWarn, danger: _svgDanger, success: _svgCheck };

    function render() {
      var colorMap = { info: 'var(--mw-accent)', warning: 'var(--mw-warning)', danger: 'var(--mw-danger)', success: 'var(--mw-success)' };
      var col = colorMap[data.type] || colorMap.info;
      el.className += ' ' + _alertBanner;
      el.style.background = 'color-mix(in srgb, ' + col + ' 10%, var(--mw-surface))';
      var icon = (data.icon === '—' || data.icon === '-' || data.icon === '') ? (icons[data.type] || _svgCheck) : (data.icon != null ? data.icon : (icons[data.type] || _svgCheck));
      var msgRaw = data.message || '';
      var msgHTML = msgRaw ? '<span class="text-[var(--mw-text-muted)]">' + (typeof msgRaw === 'string' && msgRaw.indexOf('<') >= 0 ? msgRaw : escapeHTML(msgRaw)) + '</span>' : '';
      var actionHTML = '';
      if (data.action) {
        var href = data.action.href ? ' href="' + escapeHTML(data.action.href) + '"' : ' href="#"';
        actionHTML = '<a class="font-medium whitespace-nowrap ml-auto"' + href + ' style="color:' + col + '" data-alert-action>' + escapeHTML(data.action.label) + ' →</a>';
      }
      var dismissHTML = data.dismissable ? '<button class="ml-2 bg-transparent border-none cursor-pointer text-[var(--mw-text-muted)] text-lg leading-none" data-alert-dismiss aria-label="닫기">×</button>' : '';
      var iconSpan = icon ? (icon.indexOf('<svg') === 0 ? icon : escapeHTML(icon)) : '';
      el.innerHTML =
        '<div class="flex items-center gap-2 flex-1 min-w-0">' +
          (iconSpan ? '<span class="shrink-0" style="color:' + col + '">' + iconSpan + '</span>' : '') +
          '<div class="flex flex-col gap-0.5">' +
            '<span class="font-semibold text-[var(--mw-text)]">' + escapeHTML(data.title) + '</span>' +
            msgHTML +
          '</div>' +
        '</div>' +
        actionHTML + dismissHTML;
      if (data.dismissable) {
        var btn = el.querySelector('[data-alert-dismiss]');
        if (btn) btn.addEventListener('click', function () { el.style.display = 'none'; });
      }
      if (data.action && typeof data.action.onClick === 'function') {
        var a = el.querySelector('[data-alert-action]');
        if (a) a.addEventListener('click', function (e) {
          if (!data.action.href) e.preventDefault();
          data.action.onClick(e);
        });
      }
      _applyCommon(el, data);
    }
    render();
    var handle = {
      el: el, type: 'alert-banner',
      refresh: render,
      update: function (newData) { data = Object.assign(data, newData || {}); render(); },
      destroy: function () { el.innerHTML = ''; registry.delete(handle); },
    };
    return register(handle);
  }

  // ==========================================================
  // Auto-mount from DOM (data-mw-widget)
  // ==========================================================
  function camelize(s) { return s.replace(/-([a-z])/g, function (_, c) { return c.toUpperCase(); }); }

  function parseAttrs(el) {
    var out = {};
    Object.keys(el.dataset).forEach(function (k) {
      if (k === 'mwWidget' || k === 'mwConfig') return;
      if (k.indexOf('mw') !== 0) return;
      var key = k.charAt(2).toLowerCase() + k.slice(3);
      var v = el.dataset[k];
      if (/^-?\d+(\.\d+)?$/.test(v)) out[key] = parseFloat(v);
      else if (/^\[.*\]$|^\{.*\}$/.test(v)) {
        try { out[key] = JSON.parse(v); } catch (e) { out[key] = v; }
      }
      else if (v && v.indexOf(',') !== -1 && /sparkline|list/i.test(key)) {
        out[key] = v.split(',').map(function (x) {
          var n = parseFloat(x); return isNaN(n) ? x.trim() : n;
        });
      }
      else out[key] = v;
    });
    return out;
  }

  function mountOne(el) {
    if (el.__mwMounted) return;
    var type = el.dataset.mwWidget;
    var configId = el.dataset.mwConfig;
    var config;
    if (configId) {
      var scriptEl = document.getElementById(configId);
      if (scriptEl) {
        try { config = JSON.parse(scriptEl.textContent); }
        catch (e) { console.error('[magicwiget] invalid JSON config #' + configId, e); return; }
      }
    } else {
      config = parseAttrs(el);
    }
    var fnName = camelize(type);
    var fn = api[fnName];
    if (typeof fn !== 'function') {
      console.warn('[magicwiget] unknown widget type: ' + type);
      return;
    }
    el.__mwMounted = true;
    fn(el, config);
  }

  function mountAll(root) {
    root = root || document;
    root.querySelectorAll('[data-mw-widget]').forEach(mountOne);
  }

  // ==========================================================
  // Seeded RNG (mulberry32) — handy utility for demos
  // ==========================================================
  function seeded(seed) {
    return function () {
      var t = seed += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  // ==========================================================
  // Widget: Slide — A4 가로 페이지 컨테이너
  // 주간보고 등 페이지 단위 문서용. 헤더(KPI/팀) + 푸터(페이지) 자동 생성.
  // ==========================================================
  function slide(el, config) {
    el = q(el);
    if (!el) return null;
    var data = Object.assign({
      label: '',        // KPI명 또는 페이지 제목
      bu: '',           // BU명
      team: '',         // 팀명
      page: null,       // 같은 주제의 n번째 장 (null이면 미표시)
      totalPages: null, // 같은 주제 총 페이지 (null이면 미표시)
    }, config || {});

    function render() {
      el.classList.add('mw-slide', 'flex', 'flex-col', 'border', 'border-[var(--mw-border)]', 'rounded-[var(--mw-radius)]', 'bg-[var(--mw-bg)]', 'box-border', 'overflow-hidden');
      el.style.cssText += ';--slide-w:1240px;width:var(--slide-w);min-width:var(--slide-w);aspect-ratio:297/210;';

      // header
      var headerLeft = '';
      if (data.label) headerLeft += '<span class="mw-slide__label">' + escapeHTML(data.label) + '</span>';
      var headerRight = '';
      if (data.bu) headerRight += '<span class="mw-slide__bu">' + escapeHTML(data.bu) + '</span>';
      if (data.team) headerRight += '<span class="mw-slide__team">' + escapeHTML(data.team) + '</span>';

      var header = (headerLeft || headerRight)
        ? '<div class="mw-slide__header"><div>' + headerLeft + '</div><div class="mw-slide__header-right">' + headerRight + '</div></div>'
        : '';

      // footer
      var pageInfo = '';
      if (data.page != null && data.totalPages != null) {
        pageInfo = '<span class="mw-slide__page">' + data.page + ' / ' + data.totalPages + '</span>';
      }
      var footer = '<div class="mw-slide__footer">' + pageInfo + '</div>';

      // body — preserve existing children or create mount point
      var bodyEl = el.querySelector('.mw-slide__body');
      var existingContent = bodyEl ? bodyEl.innerHTML : '';

      el.innerHTML = header + '<div class="mw-slide__body">' + existingContent + '</div>' + footer;
      _applyCommon(el, data);
    }
    render();

    var handle = {
      el: el, type: 'slide',
      body: function () { return el.querySelector('.mw-slide__body'); },
      refresh: render,
      update: function (newData) { data = Object.assign(data, newData || {}); render(); },
      destroy: function () { el.innerHTML = ''; el.classList.remove('mw-slide'); registry.delete(handle); },
    };
    return register(handle);
  }

  // ==========================================================
  // Widget: Section Cover — PDF 표지/섹션 디바이더 (큰 타이틀 + accent hero band)
  // ==========================================================
  function sectionCover(el, config) {
    el = q(el);
    if (!el) return null;
    var data = Object.assign({
      kicker: '',           // 작은 라벨 (WEEKLY REPORT · 날짜 등)
      title: '',            // 큰 H1
      subtitle: '',         // 부제 / 팀명
      brand: '',            // 브랜드 / 서비스명
      meta: '',             // 날짜 · 기준일 등 하단 메타
      style: 'classic',     // 'classic' | 'centered' | 'split'
    }, config || {});

    function render() {
      var s = data.style || 'classic';
      el.className = 'mw-cover mw-cover--' + s;

      var kicker   = data.kicker   ? '<div class="mw-cover__kicker">'   + escapeHTML(data.kicker)   + '</div>' : '';
      var title    = '<h1 class="mw-cover__title">' + escapeHTML(data.title) + '</h1>';
      var subtitle = data.subtitle ? '<div class="mw-cover__subtitle">' + escapeHTML(data.subtitle) + '</div>' : '';
      var brand    = data.brand    ? '<div class="mw-cover__brand">'    + escapeHTML(data.brand)    + '</div>' : '';
      var meta     = data.meta     ? '<div class="mw-cover__meta">'     + escapeHTML(data.meta)     + '</div>' : '';

      if (s === 'centered') {
        el.innerHTML =
          '<div class="mw-cover__accent-bar"></div>' +
          kicker + title + subtitle +
          '<div class="mw-cover__divider"></div>' +
          brand + meta;

      } else if (s === 'split') {
        el.innerHTML =
          '<div class="mw-cover__aside">' + brand + meta + '</div>' +
          '<div class="mw-cover__main">' + kicker + title + subtitle + '</div>';

      } else if (s === 'fullbleed') {
        el.innerHTML =
          kicker + title + subtitle +
          '<div class="mw-cover__divider"></div>' +
          brand + meta;

      } else if (s === 'topband') {
        el.innerHTML =
          '<div class="mw-cover__topband">' + kicker + brand + '</div>' +
          '<div class="mw-cover__body">' + title + subtitle + '</div>' +
          '<div class="mw-cover__footer"><div class="mw-cover__rule"></div>' + meta + '</div>';

      } else {
        // classic
        el.innerHTML =
          '<div class="mw-cover__header">' + kicker + brand + '</div>' +
          '<div class="mw-cover__body">' + title + subtitle + '</div>' +
          '<div class="mw-cover__footer"><div class="mw-cover__rule"></div>' + meta + '</div>';
      }
      _applyCommon(el, data);
    }
    render();

    var handle = {
      el: el, type: 'section-cover',
      refresh: render,
      update: function (newData) { data = Object.assign(data, newData || {}); render(); },
      destroy: function () { el.innerHTML = ''; el.className = ''; registry.delete(handle); },
    };
    return register(handle);
  }

  // ==========================================================
  // Widget: Insight Card — 좌측 컬러 보더 + 헤더(아이콘/타이틀/메타/태그) + bullet + highlight
  // PDF의 고객사 카드, 이슈 카드, 영업 인사이트 카드 등 다목적
  // ==========================================================
  function insightCard(el, config) {
    el = q(el);
    if (!el) return null;
    var data = Object.assign({
      title: '',                  // 카드 헤드라인 (회사명, 이슈명 등)
      meta: '',                   // 헤드 우측 메타 (인원, 점수 등)
      tag: '',                    // 작은 태그 (Owner 이름 등)
      icon: '',                   // 헤드 아이콘 (이모지 또는 텍스트)
      status: 'gray',             // 좌측 컬러 보더: 'green'|'yellow'|'red'|'gray'|'accent'
      bullets: [],                // [{text}] 또는 [string]
      highlight: '',              // 🎯 강조 메시지 (하단)
      highlightIcon: '🎯',
    }, config || {});

    function statusToVar(s) {
      if (s === 'green' || s === 'good')   return 'var(--mw-success)';
      if (s === 'yellow' || s === 'warn')  return 'var(--mw-warning)';
      if (s === 'red' || s === 'bad')      return 'var(--mw-danger)';
      if (s === 'accent')                  return 'var(--mw-accent)';
      return 'var(--mw-border)';
    }

    function render() {
      applyCard(el); el.className += ' ' + _insight;
      el.style.setProperty('--mw-insight-bar', statusToVar(data.status));

      var iconHTML = data.icon ? '<span class="' + _insightIcon + '">' + escapeHTML(data.icon) + '</span>' : '';
      var metaHTML = data.meta ? '<span class="' + _insightMeta + '">' + escapeHTML(data.meta) + '</span>' : '';
      var tagHTML  = data.tag  ? '<span class="' + _insightTag + '">'  + escapeHTML(data.tag)  + '</span>' : '';

      var bulletsHTML = (data.bullets || []).slice(0, 100).map(function (b) {
        var t = (typeof b === 'string') ? b : (b.text || '');
        return '<li class="' + _insightBullet + ' before:content-[\'\'] before:absolute before:left-1 before:top-[0.55em] before:w-1 before:h-1 before:rounded-full before:bg-[var(--mw-text-muted)] before:opacity-50">' + escapeHTML(t) + '</li>';
      }).join('');

      var highlightHTML = data.highlight
        ? '<div class="' + _insightHighlight + '">' +
            '<span class="' + _insightHlIcon + '">' + escapeHTML(data.highlightIcon || '🎯') + '</span>' +
            '<span>' + escapeHTML(data.highlight) + '</span>' +
          '</div>'
        : '';

      el.innerHTML =
        '<div class="' + _insightHead + '">' +
          iconHTML +
          '<span class="' + _insightTitle + '">' + escapeHTML(data.title) + '</span>' +
          metaHTML +
          tagHTML +
        '</div>' +
        (bulletsHTML ? '<ul class="' + _insightBullets + '">' + bulletsHTML + '</ul>' : '') +
        highlightHTML;
      _applyCommon(el, data);
    }
    render();

    var handle = {
      el: el, type: 'insight-card',
      refresh: render,
      update: function (newData) { data = Object.assign(data, newData || {}); render(); },
      destroy: function () { el.innerHTML = ''; registry.delete(handle); },
    };
    return register(handle);
  }

  // ==========================================================
  // Widget: Def Card — title + subtitle + key/value rows
  // 용어 정의, 프로젝트 개요, 메트릭 설명 등
  // ==========================================================
  function defCard(el, config) {
    el = q(el);
    if (!el) return null;
    var data = Object.assign({
      title: '',
      subtitle: '',
      rows: [],       // [{key, value}]
    }, config || {});

    function render() {
      applyCard(el);
      var rows = (data.rows || []).map(function (r) {
        return '<div class="flex justify-between items-baseline gap-3 py-[var(--mw-space-1-5)] border-b border-dashed border-[var(--mw-border)] last:border-b-0">' +
          '<div class="text-[length:var(--mw-text-sm)] text-[var(--mw-text-muted)] shrink-0">' + escapeHTML(r.key) + '</div>' +
          '<div class="text-[length:var(--mw-text-sm)] font-medium text-[var(--mw-text)] text-right">' + escapeHTML(r.value) + '</div>' +
        '</div>';
      }).join('');
      el.innerHTML =
        (data.title ? '<div class="text-[length:var(--mw-text-base)] font-semibold text-[var(--mw-text)] mb-1">' + escapeHTML(data.title) + '</div>' : '') +
        (data.subtitle ? '<div class="text-[length:var(--mw-text-sm)] text-[var(--mw-text-muted)] mb-3">' + escapeHTML(data.subtitle) + '</div>' : '') +
        rows;
      _applyCommon(el, data);
    }
    render();

    var handle = {
      el: el, type: 'def-card',
      refresh: render,
      update: function (newData) { data = Object.assign(data, newData || {}); render(); },
      destroy: function () { el.innerHTML = ''; registry.delete(handle); },
    };
    return register(handle);
  }

  // ==========================================================
  // Widget: Share Bar — 100% stacked horizontal bar + optional legend
  // ==========================================================
  function shareBar(el, config) {
    el = q(el);
    if (!el) return null;
    var data = Object.assign({
      segments: [],     // [{label, value, status?: 'green'|'yellow'|'red'|'gray', color?, sub?}]
      total: null,      // null → auto sum
      showLabels: true, // segment 안에 % 표시
      legend: true,     // 하단 범례
      height: 36,
    }, config || {});

    function statusToVar(s) {
      if (s === 'green' || s === 'good')   return 'var(--mw-success)';
      if (s === 'yellow' || s === 'warn')  return 'var(--mw-warning)';
      if (s === 'red' || s === 'bad')      return 'var(--mw-danger)';
      return 'var(--mw-text-muted)';
    }

    function render() {
      var segs = data.segments || [];
      var total = data.total || segs.reduce(function (s, x) { return s + (Number(x.value) || 0); }, 0);
      if (!total) { el.innerHTML = ''; return; }

      var bars = segs.map(function (s) {
        var pct = (Number(s.value) || 0) / total * 100;
        var bg = s.color ? s.color : statusToVar(s.status);
        var label = data.showLabels && pct > 7 ? Math.round(pct) + '%' : '';
        return '<div class="' + _sharebarSeg + '" style="width:' + pct.toFixed(3) + '%;background:' + bg + '">' +
               escapeHTML(label) + '</div>';
      }).join('');

      var legend = data.legend ? (
        '<div class="' + _sharebarLegend + '">' +
        segs.map(function (s) {
          var dotColor = s.color ? s.color : statusToVar(s.status || 'gray');
          return '<span class="' + _sharebarLegItem + '">' +
                 '<span class="' + _sharebarLegDot + '" style="background:' + dotColor + '"></span>' +
                 escapeHTML(s.label || '') +
                 (s.sub ? ' <span class="' + _sharebarLegSub + '">' + escapeHTML(s.sub) + '</span>' : '') +
                 '</span>';
        }).join('') + '</div>'
      ) : '';

      el.innerHTML =
        '<div class="' + _sharebar + '" style="height:' + Number(data.height) + 'px">' + bars + '</div>' +
        legend;
      _applyCommon(el, data);
    }
    render();

    var handle = {
      el: el, type: 'share-bar',
      refresh: render,
      update: function (newData) { data = Object.assign(data, newData || {}); render(); },
      destroy: function () { el.innerHTML = ''; registry.delete(handle); },
    };
    return register(handle);
  }

  // ==========================================================
  // Widget: RAG Chip — small status pill (red/yellow/green/gray) + label
  // ==========================================================
  function ragChip(el, config) {
    el = q(el);
    if (!el) return null;
    var data = Object.assign({
      label: '', status: 'gray', // 'green' | 'yellow' | 'red' | 'gray'
    }, config || {});

    function render() {
      var s = String(data.status || 'gray').toLowerCase();
      var dotColorMap = { green: 'var(--mw-success)', yellow: 'var(--mw-warning)', red: 'var(--mw-danger)' };
      var dotBg = dotColorMap[s] || 'var(--mw-text-muted)';
      el.innerHTML =
        '<span class="' + _rag + '">' +
          '<span class="' + _ragDot + '" style="background:' + dotBg + '"></span>' +
          '<span class="' + _ragLbl + '">' + escapeHTML(data.label) + '</span>' +
        '</span>';
      _applyCommon(el, data);
    }
    render();

    var handle = {
      el: el, type: 'rag-chip',
      refresh: render,
      update: function (newData) { data = Object.assign(data, newData || {}); render(); },
      destroy: function () { el.innerHTML = ''; registry.delete(handle); },
    };
    return register(handle);
  }

  // ==========================================================
  // Public API
  // ==========================================================
  var api = {
    version: '__VERSION__',
    kpiCard: kpiCard,
    lineChart: null,
    barChart: null,
    funnelChart: null,
    donutChart: null,
    leaderboard: leaderboard,
    activityTable: activityTable,
    heatmapChart: null,
    gaugeChart: null,
    radarChart: null,
    treemapChart: null,
    scatterChart: null,
    sankeyChart: null,
    heroTile: heroTile,
    metricChart: null,
    ringProgress: null,
    timeline: timeline,
    statusGrid: statusGrid,
    countdownTile: countdownTile,
    metricStack: metricStack,
    inboxPreview: inboxPreview,
    compareCard: compareCard,
    calendarHeatmap: null,
    eventCalendar: eventCalendar,
    progressStepper: progressStepper,
    mapChart: null,
    waterfallChart: null,
    cohortMatrix: null,
    sparklineList: sparklineList,
    goalGrid: goalGrid,
    alertBanner: alertBanner,
    bulletChart: null,
    pageHeader: pageHeader,
    sectionHead: sectionHead,
    ragChip: ragChip,
    shareBar: shareBar,
    insightCard: insightCard,
    defCard: defCard,
    slide: slide,
    sectionCover: sectionCover,

    // Widget metadata (title + short description) — for documentation, pickers, galleries.
    // Demo and other consumers can derive UI from this instead of duplicating labels.
    meta: {
      kpiCard:         { title: 'KPI Card',          desc: '라벨 + 값 + 델타 + 스파크라인. `compact: true` + `icon`으로 미니 모드.' },
      heroTile:        { title: 'Hero Tile',         desc: 'iOS 날씨 위젯 스타일 메인 지표 타일.' },
      metricChart:     { title: 'Metric Chart',      desc: '히어로 숫자 + 축 레이블 있는 미니 라인차트. 이번달/지난달 비교, 목표선 지원.' },
      metricStack:     { title: 'Metric Stack',      desc: 'Bento — 메인 지표 + 하위 지표 2x2.' },
      compareCard:     { title: 'Compare Card',      desc: 'A vs B 대비 + 델타 표시.' },
      countdownTile:   { title: 'Countdown Tile',    desc: '실시간 days/hrs/min 카운트다운.' },
      ringProgress:    { title: 'Ring Progress',     desc: '원형 진행률 + 중앙 수치 + threshold 색.' },

      lineChart:       { title: 'Line Chart',        desc: '다중 시리즈 라인/영역 차트. 누적(stack) 옵션.' },
      barChart:        { title: 'Bar Chart',         desc: '가로/세로 옵션. 라벨 포매터 지원.' },
      donutChart:      { title: 'Donut Chart',       desc: '비율 시각화 + 중앙 합계 라벨.' },
      funnelChart:     { title: 'Funnel Chart',      desc: '단계별 전환/감소 시각화.' },
      gaugeChart:      { title: 'Gauge',             desc: 'threshold 색상 · 반원 스타일.' },
      radarChart:      { title: 'Radar Chart',       desc: '다축 비교 · 팀/제품 역량 등.' },
      treemapChart:    { title: 'Treemap',           desc: '면적 = 값. 분포 시각화.' },
      scatterChart:    { title: 'Scatter',           desc: 'X/Y 상관 + 버블 크기 옵션.' },
      sankeyChart:     { title: 'Sankey',            desc: '노드-링크 플로우 (유입→전환 등).' },
      heatmapChart:    { title: 'Heatmap',           desc: '요일×시간 등 2D 밀도 시각화.' },

      leaderboard:     { title: 'Leaderboard',       desc: '아바타 + 프로그레스 바. 순위 표시.' },
      activityTable:   { title: 'Activity Table',    desc: 'LIVE 뱃지 + 커스텀 render 함수.' },
      timeline:        { title: 'Timeline',          desc: '수직 이벤트 피드 (점-선 연결).' },
      inboxPreview:    { title: 'Inbox Preview',     desc: '알림/이메일 리스트 미리보기.' },
      statusGrid:      { title: 'Status Grid',       desc: '서비스 헬스 점등 매트릭스.' },

      calendarHeatmap: { title: 'Calendar Heatmap',  desc: 'GitHub 기여도 스타일 연간 히트맵 (365칸).' },
      eventCalendar:   { title: 'Event Calendar',    desc: '월 그리드 + 날짜별 점/배지 · 오늘 자동 하이라이트 · 하단 리스트 옵션.' },
      progressStepper: { title: 'Progress Stepper',  desc: '프로젝트 단계 트래커 · 체크/펄스/점선원 3-state.' },
      mapChart:        { title: 'Map Chart',         desc: '한국 광역자치단체 hex 타일맵 · GeoJSON 무관 · 값에 따른 명도 그라디언트.' },
      waterfallChart:  { title: 'Waterfall Chart',   desc: '시작→증감→합계 단계별 분해 · 매출/예산/P&L 분석용.' },
      cohortMatrix:    { title: 'Cohort Matrix',     desc: '코호트 × 기간 리텐션 매트릭스 · Mixpanel 스타일.' },
      sparklineList:   { title: 'Sparkline List',    desc: '라벨 + 값 + 델타 + 미니스파크 행 리스트 · 트렌드 요약.' },
      goalGrid:        { title: 'Goal Grid',         desc: '다중 목표 진행률 바 · OKR · threshold 색상 자동.' },
      alertBanner:     { title: 'Alert Banner',      desc: '긴급 알림 가로 스트립 · info/warning/danger/success · 액션 링크 지원.' },
      bulletChart:     { title: 'Bullet Chart',      desc: '목표 vs 실적 vs 벤치마크 · 정성 밴드 + 타겟 마커 (gauge 상위).' },
      pageHeader:      { title: 'Page Header',       desc: '페이지 최상단 hero 헤더 · kicker + H1 + subtitle + meta.' },
      sectionHead:     { title: 'Section Head',      desc: 'grid 그룹 위 라벨 · index + kicker + H2 + tag.' },
      ragChip:         { title: 'RAG Chip',          desc: '신호등 상태 칩 · green/yellow/red/gray + 라벨. 위클리 보고서·고객 인사이트에 자주.' },
      shareBar:        { title: 'Share Bar',         desc: '100% 비율 누적 가로바 + 범례 · NPS 분포, 만족도 분포, 예산 비중 등. status별 색.' },
      insightCard:     { title: 'Insight Card',      desc: '상태 dot + 헤드(아이콘/타이틀/메타/태그) + bullets + 🎯 highlight. 고객사·이슈·영업 인사이트 다목적.' },
      defCard:         { title: 'Def Card',          desc: '타이틀 + 부제 + key/value 행 목록. 용어 정의·프로젝트 개요·메트릭 설명.' },
      slide:           { title: 'Slide',             desc: 'A4 가로 페이지 컨테이너. 헤더(KPI명/팀명) + 푸터(페이지번호) 자동 생성. 주간보고 페이지 단위.' },
      monthlyTable:    { title: 'Monthly Table',     desc: '12개월 표 + 합계행 + 단위(원/만원/억원) 토글 + view(table/line/bar) 토글 올인원.' },
      sectionCoverClassic:  { title: 'Cover — Classic',   desc: '보고서 커버 · kicker(좌) + brand(우) / 큰 타이틀 + subtitle / accent rule + meta. 컨설팅 보고서 스타일.' },
      sectionCoverCentered: { title: 'Cover — Centered',  desc: '보고서 커버 · 모든 요소 중앙 정렬. accent bar → kicker → 타이틀 → 구분선 → brand. 프레젠테이션 표지 스타일.' },
    },

    setTheme: function (name) {
      document.documentElement.setAttribute('data-theme', name);
      requestAnimationFrame(function () { requestAnimationFrame(refreshAll); });
    },
    getTheme: function () {
      return document.documentElement.getAttribute('data-theme') || 'flow';
    },
    themes: [
      // Light (78)
      'airbnb', 'airtable', 'apple', 'barbie', 'binance', 'bmw', 'cal', 'claude', 'clay', 'cohere', 'coinbase', 'crimson', 'cursor', 'duolingo', 'elevenlabs', 'expo', 'fedex', 'flow', 'framer', 'hashicorp', 'hermes', 'ibm', 'instagram', 'intercom', 'kraken', 'lamborghini', 'linear', 'linkedin', 'lovable', 'mailchimp', 'mastercard', 'medium', 'meta', 'minimax', 'mint', 'mintlify', 'miro', 'mistral', 'mongodb', 'morningmate', 'nike', 'notion', 'nvidia', 'ollama', 'opencode', 'pinterest', 'playstation', 'posthog', 'raycast', 'reddit', 'renault', 'replicate', 'resend', 'revolut', 'runwayml', 'sage', 'sanity', 'sentry', 'shopify', 'spacex', 'starbucks', 'stripe', 'supabase', 'superhuman', 'tesla', 'theverge', 'tiffany', 'tmobile', 'together', 'uber', 'vodafone', 'voltagent', 'warp', 'webflow', 'wired', 'wise', 'youtube', 'zapier',
      // Dark (27)
      'adobe', 'amazon', 'bloomberg', 'bmwm', 'bugatti', 'clickhouse', 'composio', 'deere', 'discord', 'ferrari', 'figma', 'forest', 'github', 'heineken', 'imperial', 'kiwi', 'nasa', 'netflix', 'openai', 'slack', 'spotify', 'sunset', 'tannery', 'twitch', 'ups', 'vercel', 'x'
    ],
    refreshAll: refreshAll,
    mountAll: mountAll,
    mountOne: mountOne,
    fmt: fmt,
    seeded: seeded,

    // Mode-specific page builder registry — each mode script registers its builder here.
    _pageBuilders: {},

    // Internal helpers — exposed for maging-charts.js and other split bundles.
    _internals: {
      q: q, EC: EC, getColors: getColors, parseHex: parseHex, withAlpha: withAlpha,
      buildPalette: buildPalette, baseTooltip: baseTooltip, headerHTML: headerHTML,
      _applyCommon: _applyCommon, escapeHTML: escapeHTML, toStr: toStr,
      _autoDerive: _autoDerive, _autoValueHTML: _autoValueHTML, _valOrEsc: _valOrEsc,
      safeNum: safeNum, register: register, _chartBase: _chartBase,
      fmt: fmt, plainFmt: plainFmt, stripHTML: stripHTML,
      _arrLast: _arrLast, _arrPrev: _arrPrev, _growthRate: _growthRate, _parseNumVal: _parseNumVal,
      rotateHue: rotateHue, rgbStr: rgbStr, rgbaStr: rgbaStr,
      _card: _card, _chartBody: _chartBody, _ringContext: _ringContext, _kpiDelta: _kpiDelta,
      applyCard: applyCard, registry: registry,
    },

    // ================================================================
    // Maging.page(config) — Declarative page generator (all modes)
    // ================================================================
    page: function (cfg) {
      if (!cfg) return;

      var mode = cfg.mode || (cfg.slides ? 'slide' : 'dashboard');

      // Dispatch to mode-specific builder if registered
      if (mode !== 'dashboard' && api._pageBuilders[mode]) {
        return api._pageBuilders[mode](cfg);
      }

      // ── Type shorthand → full function name ──
      var TYPE_MAP = {
        kpi: 'kpiCard', hero: 'heroTile', metric: 'metricChart',
        stack: 'metricStack', compare: 'compareCard', countdown: 'countdownTile',
        ring: 'ringProgress', bullet: 'bulletChart', sparklist: 'sparklineList',
        goal: 'goalGrid', line: 'lineChart', bar: 'barChart',
        donut: 'donutChart', funnel: 'funnelChart', gauge: 'gaugeChart',
        radar: 'radarChart', heatmap: 'heatmapChart', treemap: 'treemapChart',
        scatter: 'scatterChart', sankey: 'sankeyChart', waterfall: 'waterfallChart',
        map: 'mapChart', cohort: 'cohortMatrix', leaderboard: 'leaderboard',
        table: 'activityTable', timeline: 'timeline', inbox: 'inboxPreview',
        status: 'statusGrid', calendar: 'eventCalendar', calheatmap: 'calendarHeatmap',
        stepper: 'progressStepper', alert: 'alertBanner', share: 'shareBar',
        insight: 'insightCard',
        def: 'defCard',
      };

      // ── Height tokens → px ──
      var HEIGHT_MAP = {
        mini: 96, tile: 140, gauge: 280, card: 380, detail: 480, tall: 560,
      };

      // ── Layout tokens → Tailwind grid class ──
      function layoutClass(layout) {
        if (!layout) return 'grid grid-cols-1 gap-3';
        var l = String(layout).toLowerCase();
        if (l === '1col') return 'grid grid-cols-1 gap-3';
        if (l === '2col') return 'grid grid-cols-1 lg:grid-cols-2 gap-3';
        if (l === '3col') return 'grid grid-cols-1 lg:grid-cols-3 gap-3';
        if (l === '4col') return 'grid grid-cols-2 md:grid-cols-4 gap-3';
        if (l === '6col') return 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3';
        // ratio patterns: '3:1', '2:2:3', '1:2', '5:2', etc.
        var parts = l.split(':');
        if (parts.length >= 2 && parts.every(function (p) { return /^\d+$/.test(p); })) {
          var fracs = parts.map(function (p) { return p + 'fr'; }).join('_');
          return 'grid grid-cols-1 lg:grid-cols-[' + fracs.replace(/_/g, '_') + '] gap-3';
        }
        return 'grid grid-cols-1 gap-3';
      }

      // ── yFormat shorthand → formatter function ──
      function resolveFormatter(f) {
        if (!f) return undefined;
        if (typeof f === 'function') return f;
        if (f === 'krw') return fmt.krwPlain;
        if (f === 'krwHtml') return fmt.krw;
        if (f === 'num') return function (v) { return Number(v).toLocaleString(); };
        if (f === 'pct') return fmt.pct;
        return undefined;
      }

      // ── Resolve widget config shorthands ──
      function resolveWidgetConfig(w) {
        var c = {};
        for (var k in w) {
          if (k === 'type') continue;
          if (k === 'yFormat') { c.yFormatter = resolveFormatter(w[k]); continue; }
          if (k === 'valFormat') { c.valueFormatter = resolveFormatter(w[k]); continue; }
          c[k] = w[k];
        }
        return c;
      }

      // ── Inject grid-fill styles (once) ──
      var GRID_FILL_ID = 'mw-page-grid-fill';
      if (!document.getElementById(GRID_FILL_ID)) {
        var style = document.createElement('style');
        style.id = GRID_FILL_ID;
        style.textContent =
          '.mw-pgrid > *{height:100% !important;min-width:0;min-height:0 !important;}' +
          '.mw-pgrid > *{display:flex;flex-direction:column;box-sizing:border-box;height:100% !important;min-height:0 !important;}' +
          '.mw-pgrid [data-mw-chart]{height:auto !important;flex:1 1 auto;min-height:0 !important;}' +
          '.mw-pgrid [data-mw-list]{flex:1 1 auto;min-height:0;overflow-y:auto;}' +
          '.mw-pgrid [data-mw-spark]{flex:1 1 auto;min-height:32px;}' +
          '.mw-pgrid [data-mw-cq]{container-type:size;}' +
          '.mw-pgrid [data-mw-cq=countdown]{font-size:clamp(1.75rem,18cqh,3.25rem);}' +
          '.mw-pgrid [data-mw-cq=mstack] [data-mw-val]{font-size:clamp(1.5rem,16cqh,2.75rem);}' +
          '.mw-pgrid [data-mw-cq=compare] [data-mw-val]{font-size:clamp(1.15rem,12cqh,2.25rem);}' +
          '.mw-pgrid [data-mw-cq=stat] [data-mw-val]{font-size:clamp(1.35rem,18cqh,2.5rem);}' +
          '.mw-pgrid [data-mw-cq=kpi] [data-mw-val]{font-size:clamp(1.5rem,18cqh,2.5rem);}' +
          '.mw-pgrid [data-mw-cq=hero] [data-mw-val]{font-size:clamp(1.75rem,20cqh,3rem);}';
        document.head.appendChild(style);
      }

      // ── Build the page ──
      var container = document.createElement('main');
      container.className = 'max-w-[1100px] mx-auto px-6 py-4';
      container.style.wordBreak = 'keep-all';

      // Page header
      var hdr = cfg.header || {};
      if (!hdr.title && cfg.title) hdr = { kicker: cfg.kicker, title: cfg.title, subtitle: cfg.subtitle, meta: cfg.meta };
      if (hdr.title) {
        var hdrEl = document.createElement('div');
        hdrEl.className = 'pt-4 pb-2';
        container.appendChild(hdrEl);
        pageHeader(hdrEl, hdr);
      }

      // Sections
      var sections = cfg.sections || [];
      sections.forEach(function (sec, si) {
        var secWrap = document.createElement('div');
        secWrap.className = si > 0 ? 'mt-5 pt-4' : 'mt-3';
        if (si > 0) secWrap.style.borderTop = '1px solid var(--mw-border)';
        container.appendChild(secWrap);

        // Section head
        if (sec.title) {
          var shEl = document.createElement('div');
          secWrap.appendChild(shEl);
          sectionHead(shEl, { index: si + 1, kicker: sec.kicker, title: sec.title, tag: sec.tag });
        }

        // Rows
        var rows = sec.rows || [];
        rows.forEach(function (row) {
          var layout = row.layout || '1col';
          var height = row.height;
          var widgets = row.widgets || [];

          var rowEl = document.createElement('div');
          rowEl.className = layoutClass(layout) + ' mw-pgrid mt-3';
          if (height) {
            var px = HEIGHT_MAP[height] || parseInt(height, 10) || 380;
            rowEl.style.gridAutoRows = px + 'px';
          }
          secWrap.appendChild(rowEl);

          // Mount widgets
          widgets.forEach(function (w) {
            var el = document.createElement('div');
            rowEl.appendChild(el);

            var typeName = w.type || 'kpi';
            var fnName = TYPE_MAP[typeName] || typeName;
            var fn = api[fnName];
            if (!fn) {
              console.warn('[maging.page] Unknown widget type: ' + typeName);
              return;
            }

            var wCfg = resolveWidgetConfig(w);
            fn(el, wCfg);

            // Clear inline minHeight set by _chartBase — grid-auto-rows controls height
            if (height) {
              var card = el.querySelector('[data-mw-card]') || el;
              if (card.dataset.mwCard != null) card.style.minHeight = '';
              if (el.style.minHeight) el.style.minHeight = '';
            }
          });
        });
      });

      // Auto-mount to DOM (backward compat)
      var body = document.body;
      var existing = body.querySelector('main');
      if (existing) {
        existing.parentNode.replaceChild(container, existing);
      } else {
        body.appendChild(container);
      }

      return api._pageResult(container, cfg, 'dashboard');
    },

    // ================================================================
    // PageResult factory — shared by all mode builders
    // ================================================================
    _pageResult: function (el, cfg, mode) {
      var mounted = !!el.parentNode;

      // Determine CDN scripts needed per mode
      var MODE_SCRIPTS = {
        dashboard: [],
        landing:   ['maging-landing.js'],
        slide:     ['maging-sidebar.js', 'maging-slide.js'],
        news:      ['maging-news.js'],
      };

      return {
        el: el,

        mount: function (sel) {
          var target = sel ? q(sel) : document.body;
          if (!target) { console.warn('[maging.page] mount target not found: ' + sel); return this; }
          if (el.parentNode) el.parentNode.removeChild(el);
          target.appendChild(el);
          mounted = true;
          return this;
        },

        toHtml: function (opts) {
          opts = opts || {};
          var theme = opts.theme || api.getTheme() || 'flow';
          var title = cfg.title || (cfg.header && cfg.header.title) || 'maging';
          var ver = opts.version || api.version;
          var cdn = opts.cdn || 'https://cdn.jsdelivr.net/npm/@m1kapp/maging@' + ver + '/dist';

          // Serialize config — strip functions, preserve string shorthands
          var safeCfg = JSON.stringify(cfg, function (key, val) {
            if (typeof val === 'function') return undefined;
            return val;
          }, 2);

          var scripts = MODE_SCRIPTS[mode] || [];
          var extraTags = scripts.map(function (s) {
            return '  <script src="' + cdn + '/' + s + '"><\/script>';
          }).join('\n');

          return [
            '<!DOCTYPE html>',
            '<html lang="ko" data-theme="' + theme + '">',
            '<head>',
            '<meta charset="UTF-8">',
            '<meta name="viewport" content="width=device-width, initial-scale=1">',
            '<title>' + title + '</title>',
            '<link rel="stylesheet" href="' + cdn + '/maging.css">',
            '<script src="' + cdn + '/maging-all.js"><\/script>',
            extraTags ? extraTags : '',
            '</head>',
            '<body class="mw-themed">',
            '<div id="app"></div>',
            '<script>',
            'window.addEventListener("maging:ready", function () {',
            '  Maging.page(' + safeCfg + ').mount("#app");',
            '});',
            '<\/script>',
            '</body>',
            '</html>'
          ].filter(Boolean).join('\n');
        },

        destroy: function () {
          if (el.parentNode) el.parentNode.removeChild(el);
          // Dispose ECharts instances within this page
          if (typeof echarts !== 'undefined') {
            var charts = el.querySelectorAll('[_echarts_instance_]');
            for (var i = 0; i < charts.length; i++) {
              var inst = echarts.getInstanceByDom(charts[i]);
              if (inst) inst.dispose();
            }
          }
          mounted = false;
        }
      };
    },
  };

  // Theme metadata for the FAB picker (ordered mainstream → distinctive)
  var THEME_DATA = [
    { value: 'flow', brand: 'Flow', desc: '라벤더 퍼플', bg: '#f7f6ff', accent: '#5f49dc', accent2: '#0ba898', warning: '#f5a520', danger: '#e84545' },
    { value: 'morningmate', brand: 'Morningmate', desc: '딥 퍼플 마젠타', bg: '#fef8ff', accent: '#9f00ba', accent2: '#ff7a00', warning: '#ffc700', danger: '#ff3d00' },
    { value: 'adobe', brand: 'Adobe', desc: '크리에이티브 레드', bg: '#1d1d1d', accent: '#fa0c00', accent2: '#ed1c24', warning: '#ffd000', danger: '#fa0c00' },
    { value: 'airbnb', brand: 'Airbnb', desc: '코랄 라운드', bg: '#ffffff', accent: '#ff5a5f', accent2: '#00a699', warning: '#fc642d', danger: '#c13515' },
    { value: 'airtable', brand: 'Airtable', desc: 'Airtable Light', bg: '#ffffff', accent: '#181d26', accent2: '#11141b', warning: '#f5a520', danger: '#ff3b30' },
    { value: 'amazon', brand: 'Amazon', desc: '마켓 네이비', bg: '#131a22', accent: '#ff9900', accent2: '#146eb4', warning: '#ff9900', danger: '#b12704' },
    { value: 'apple', brand: 'Apple', desc: '시스템 블루', bg: '#f5f5f7', accent: '#007aff', accent2: '#5ac8fa', warning: '#ff9500', danger: '#ff3b30' },
    { value: 'barbie', brand: 'Barbie', desc: '파스텔 핑크', bg: '#fff0f7', accent: '#e0218a', accent2: '#ffd700', warning: '#ffa500', danger: '#8b0000' },
    { value: 'binance', brand: 'Binance', desc: 'Binance Light', bg: '#ffffff', accent: '#a48a22', accent2: '#b09525', warning: '#f5a520', danger: '#ff3b30' },
    { value: 'bloomberg', brand: 'Bloomberg', desc: '터미널 앰버', bg: '#0a0a0a', accent: '#ffa028', accent2: '#f39f41', warning: '#ffd23f', danger: '#ff4c4c' },
    { value: 'bmw', brand: 'Bmw', desc: 'Bmw Light', bg: '#ffffff', accent: '#1c69d4', accent2: '#144a94', warning: '#f59e0b', danger: '#dc2626' },
    { value: 'bmwm', brand: 'Bmwm', desc: 'Bmwm Dark', bg: '#000000', accent: '#ffffff', accent2: '#ffffff', warning: '#f4b400', danger: '#ff3b30' },
    { value: 'bugatti', brand: 'Bugatti', desc: 'Bugatti Dark', bg: '#000000', accent: '#ffffff', accent2: '#ffffff', warning: '#d4a017', danger: '#ff3b30' },
    { value: 'cal', brand: 'Cal', desc: 'Cal Light', bg: '#ffffff', accent: '#111111', accent2: '#0c0c0c', warning: '#f59e0b', danger: '#ef4444' },
    { value: 'claude', brand: 'Claude', desc: '테라코타 크림', bg: '#faf9f5', accent: '#da7756', accent2: '#6a9bcc', warning: '#d4a037', danger: '#c25e5e' },
    { value: 'clay', brand: 'Clay', desc: 'Clay Light', bg: '#fffaf0', accent: '#0a0a0a', accent2: '#070707', warning: '#f59e0b', danger: '#ef4444' },
    { value: 'clickhouse', brand: 'Clickhouse', desc: 'Clickhouse Dark', bg: '#0a0a0a', accent: '#faff69', accent2: '#fcff96', warning: '#f59e0b', danger: '#ef4444' },
    { value: 'cohere', brand: 'Cohere', desc: 'Cohere Light', bg: '#ffffff', accent: '#17171c', accent2: '#101014', warning: '#f5a520', danger: '#b30000' },
    { value: 'coinbase', brand: 'Coinbase', desc: 'Coinbase Light', bg: '#ffffff', accent: '#0052ff', accent2: '#0039b3', warning: '#f5a520', danger: '#ff3b30' },
    { value: 'composio', brand: 'Composio', desc: 'Composio Dark', bg: '#0f0f0f', accent: '#0007cd', accent2: '#4d51dc', warning: '#f5a520', danger: '#ff4d4d' },
    { value: 'crimson', brand: 'Crimson', desc: 'Crimson Light', bg: '#fcf0d6', accent: '#b40023', accent2: '#d4264a', warning: '#c58a1d', danger: '#b40023' },
    { value: 'cursor', brand: 'Cursor', desc: 'Cursor Light', bg: '#f7f7f4', accent: '#f54e00', accent2: '#ac3700', warning: '#f5a520', danger: '#cf2d56' },
    { value: 'deere', brand: 'John Deere', desc: '트랙터 그린', bg: '#2a6221', accent: '#ffde00', accent2: '#ffffff', warning: '#ffde00', danger: '#d9534f' },
    { value: 'discord', brand: 'Discord', desc: '블러플', bg: '#313338', accent: '#5865f2', accent2: '#eb459e', warning: '#f0b232', danger: '#f23f42' },
    { value: 'duolingo', brand: 'Duolingo', desc: '오울 그린', bg: '#fffdf7', accent: '#58cc02', accent2: '#1cb0f6', warning: '#ffc800', danger: '#ff4b4b' },
    { value: 'elevenlabs', brand: 'Elevenlabs', desc: 'Elevenlabs Light', bg: '#f5f5f5', accent: '#292524', accent2: '#1d1a19', warning: '#f5a520', danger: '#dc2626' },
    { value: 'expo', brand: 'Expo', desc: 'Expo Light', bg: '#ffffff', accent: '#000000', accent2: '#000000', warning: '#ab6400', danger: '#eb8e90' },
    { value: 'fedex', brand: 'FedEx', desc: '퍼플 오렌지', bg: '#ffffff', accent: '#ff6600', accent2: '#4d148c', warning: '#ff6600', danger: '#c62828' },
    { value: 'ferrari', brand: 'Ferrari', desc: 'Ferrari Dark', bg: '#181818', accent: '#da291c', accent2: '#e56960', warning: '#f13a2c', danger: '#ff3b30' },
    { value: 'figma', brand: 'Figma', desc: '멀티 로고 컬러', bg: '#1e1e1e', accent: '#ff3737', accent2: '#874fff', warning: '#ff7237', danger: '#ff3737' },
    { value: 'forest', brand: 'Forest', desc: 'Forest Dark', bg: '#0a3625', accent: '#ccda47', accent2: '#e0ec70', warning: '#ccda47', danger: '#e06868' },
    { value: 'framer', brand: 'Framer', desc: 'Framer Light', bg: '#ffffff', accent: '#000000', accent2: '#a6a6a6', warning: '#f5a520', danger: '#ff3b30' },
    { value: 'github', brand: 'GitHub', desc: '딤드 다크', bg: '#0d1117', accent: '#58a6ff', accent2: '#a371f7', warning: '#d29922', danger: '#f85149' },
    { value: 'hashicorp', brand: 'Hashicorp', desc: 'Hashicorp Light', bg: '#ffffff', accent: '#5f49dc', accent2: '#43339a', warning: '#f5a520', danger: '#ff3b30' },
    { value: 'heineken', brand: 'Heineken', desc: '보틀 그린', bg: '#0a3d22', accent: '#e10012', accent2: '#ffd700', warning: '#ffd700', danger: '#e10012' },
    { value: 'hermes', brand: 'Hermès', desc: '럭셔리 크림', bg: '#fdf6ec', accent: '#ff6900', accent2: '#3e2110', warning: '#d17a00', danger: '#ac1b2b' },
    { value: 'ibm', brand: 'Ibm', desc: 'Ibm Light', bg: '#ffffff', accent: '#0f62fe', accent2: '#0b45b2', warning: '#f5a520', danger: '#ff3b30' },
    { value: 'imperial', brand: 'Imperial', desc: 'Imperial Dark', bg: '#000f08', accent: '#fb3640', accent2: '#ff7a82', warning: '#f2b04e', danger: '#fb3640' },
    { value: 'instagram', brand: 'Instagram', desc: '비비드 그라디언트', bg: '#fafafa', accent: '#e1306c', accent2: '#f77737', warning: '#fcaf45', danger: '#fd1d1d' },
    { value: 'intercom', brand: 'Intercom', desc: 'Intercom Light', bg: '#ffffff', accent: '#111111', accent2: '#0c0c0c', warning: '#f5a520', danger: '#ff3b30' },
    { value: 'kiwi', brand: 'Kiwi', desc: 'Kiwi Dark', bg: '#151515', accent: '#89e900', accent2: '#b9ff4d', warning: '#ffd400', danger: '#ff4d6d' },
    { value: 'kraken', brand: 'Kraken', desc: 'Kraken Light', bg: '#ffffff', accent: '#7132f5', accent2: '#4f23ac', warning: '#f5a520', danger: '#ff3b30' },
    { value: 'lamborghini', brand: 'Lamborghini', desc: 'Lamborghini Light', bg: '#ffffff', accent: '#a67d00', accent2: '#917300', warning: '#f5a520', danger: '#ff3b30' },
    { value: 'linear', brand: 'Linear', desc: '인디고 미니멀', bg: '#fcfcfd', accent: '#5e6ad2', accent2: '#a78bfa', warning: '#f2994a', danger: '#eb5757' },
    { value: 'linkedin', brand: 'LinkedIn', desc: '프로페셔널 블루', bg: '#f3f2ef', accent: '#0a66c2', accent2: '#378fe9', warning: '#e7a33e', danger: '#cc1016' },
    { value: 'lovable', brand: 'Lovable', desc: 'Lovable Light', bg: '#ffffff', accent: '#a19f9a', accent2: '#adaba6', warning: '#f5a520', danger: '#ff3b30' },
    { value: 'mailchimp', brand: 'Mailchimp', desc: '카벤디시 옐로', bg: '#fffaeb', accent: '#ffe01b', accent2: '#007c89', warning: '#e89c2a', danger: '#e8515f' },
    { value: 'mastercard', brand: 'Mastercard', desc: 'Mastercard Light', bg: '#ffffff', accent: '#eb001b', accent2: '#cf4500', warning: '#f5a520', danger: '#ff3b30' },
    { value: 'medium', brand: 'Medium', desc: '에디토리얼 세리프', bg: '#ffffff', accent: '#1a8917', accent2: '#242424', warning: '#b5a642', danger: '#c94a4a' },
    { value: 'meta', brand: 'Meta', desc: 'Meta Light', bg: '#ffffff', accent: '#0064e0', accent2: '#d6311f', warning: '#f5a520', danger: '#ff3b30' },
    { value: 'minimax', brand: 'Minimax', desc: 'Minimax Light', bg: '#ffffff', accent: '#18181b', accent2: '#8e8e93', warning: '#f5a520', danger: '#ff3b30' },
    { value: 'mint', brand: 'Mint', desc: 'Mint Light', bg: '#f3ede1', accent: '#00a19b', accent2: '#5ec4be', warning: '#e8b53a', danger: '#e06b5a' },
    { value: 'mintlify', brand: 'Mintlify', desc: 'Mintlify Light', bg: '#ffffff', accent: '#0d0d0d', accent2: '#d4fae8', warning: '#f5a520', danger: '#ff3b30' },
    { value: 'miro', brand: 'Miro', desc: 'Miro Light', bg: '#ffffff', accent: '#1c1c1e', accent2: '#141415', warning: '#f5a520', danger: '#ff3b30' },
    { value: 'mistral', brand: 'Mistral', desc: 'Mistral Light', bg: '#ffffff', accent: '#fa520f', accent2: '#ff8a00', warning: '#f5a520', danger: '#ff3b30' },
    { value: 'mongodb', brand: 'Mongodb', desc: 'Mongodb Light', bg: '#ffffff', accent: '#001e2b', accent2: '#00151e', warning: '#f5a520', danger: '#ff3b30' },
    { value: 'nasa', brand: 'NASA', desc: '웜 블루', bg: '#0b3d91', accent: '#fc3d21', accent2: '#ffffff', warning: '#ffc107', danger: '#fc3d21' },
    { value: 'netflix', brand: 'Netflix', desc: '시네마틱 레드', bg: '#000000', accent: '#e50914', accent2: '#b20710', warning: '#ffd700', danger: '#831010' },
    { value: 'nike', brand: 'Nike', desc: 'Nike Light', bg: '#ffffff', accent: '#111111', accent2: '#0c0c0c', warning: '#f5a520', danger: '#ff3b30' },
    { value: 'notion', brand: 'Notion', desc: '웜 오프화이트', bg: '#ffffff', accent: '#2eaadc', accent2: '#37352f', warning: '#cb912f', danger: '#d44c47' },
    { value: 'nvidia', brand: 'Nvidia', desc: 'Nvidia Light', bg: '#ffffff', accent: '#76b900', accent2: '#538200', warning: '#f5a520', danger: '#ff3b30' },
    { value: 'ollama', brand: 'Ollama', desc: 'Ollama Light', bg: '#ffffff', accent: '#000000', accent2: '#000000', warning: '#f5a520', danger: '#ff3b30' },
    { value: 'openai', brand: 'OpenAI', desc: 'AI 틸', bg: '#202123', accent: '#00a67e', accent2: '#ab68ff', warning: '#f59e0b', danger: '#ef4146' },
    { value: 'opencode', brand: 'Opencode', desc: 'Opencode Light', bg: '#ffffff', accent: '#201d1d', accent2: '#302c2c', warning: '#f5a520', danger: '#ff3b30' },
    { value: 'pinterest', brand: 'Pinterest', desc: 'Pinterest Light', bg: '#ffffff', accent: '#e60023', accent2: '#a10019', warning: '#f5a520', danger: '#ff3b30' },
    { value: 'playstation', brand: 'Playstation', desc: 'Playstation Light', bg: '#ffffff', accent: '#0070cc', accent2: '#1eaedb', warning: '#f5a520', danger: '#c81b3a' },
    { value: 'posthog', brand: 'Posthog', desc: 'Posthog Light', bg: '#ffffff', accent: '#4d4f46', accent2: '#f7a501', warning: '#f5a520', danger: '#ff3b30' },
    { value: 'raycast', brand: 'Raycast', desc: 'Raycast Light', bg: '#ffffff', accent: '#07080a', accent2: '#55b3ff', warning: '#f5a520', danger: '#ff3b30' },
    { value: 'reddit', brand: 'Reddit', desc: '커뮤니티 오렌지', bg: '#ffffff', accent: '#ff4500', accent2: '#0079d3', warning: '#ffb000', danger: '#ea0027' },
    { value: 'renault', brand: 'Renault', desc: 'Renault Light', bg: '#ffffff', accent: '#9b9100', accent2: '#f8eb4c', warning: '#f5a520', danger: '#ff3b30' },
    { value: 'replicate', brand: 'Replicate', desc: 'Replicate Light', bg: '#ffffff', accent: '#202020', accent2: '#2b9a66', warning: '#f5a520', danger: '#ff3b30' },
    { value: 'resend', brand: 'Resend', desc: 'Resend Light', bg: '#ffffff', accent: '#000000', accent2: '#000000', warning: '#f5a520', danger: '#ff3b30' },
    { value: 'revolut', brand: 'Revolut', desc: 'Revolut Light', bg: '#ffffff', accent: '#191c1f', accent2: '#121416', warning: '#f5a520', danger: '#ff3b30' },
    { value: 'runwayml', brand: 'Runwayml', desc: 'Runwayml Light', bg: '#ffffff', accent: '#000000', accent2: '#000000', warning: '#f5a520', danger: '#ff3b30' },
    { value: 'sage', brand: 'Sage', desc: 'Sage Light', bg: '#f4efe6', accent: '#a8b89f', accent2: '#8ba27e', warning: '#d4a962', danger: '#c78585' },
    { value: 'sanity', brand: 'Sanity', desc: 'Sanity Light', bg: '#ffffff', accent: '#0b0b0b', accent2: '#080808', warning: '#f5a520', danger: '#ff3b30' },
    { value: 'sentry', brand: 'Sentry', desc: 'Sentry Light', bg: '#ffffff', accent: '#1f1633', accent2: '#160f24', warning: '#f5a520', danger: '#ff3b30' },
    { value: 'shopify', brand: 'Shopify', desc: 'Shopify Light', bg: '#ffffff', accent: '#a6a6a6', accent2: '#36f4a4', warning: '#f5a520', danger: '#ff3b30' },
    { value: 'slack', brand: 'Slack', desc: '다크 오버진', bg: '#3f0e40', accent: '#ecb22e', accent2: '#36c5f0', warning: '#ecb22e', danger: '#e01e5a' },
    { value: 'spacex', brand: 'Spacex', desc: 'Spacex Light', bg: '#ffffff', accent: '#000000', accent2: '#000000', warning: '#f5a520', danger: '#ff3b30' },
    { value: 'spotify', brand: 'Spotify', desc: '네온 그린', bg: '#121212', accent: '#1db954', accent2: '#1ed760', warning: '#ffc83d', danger: '#e22134' },
    { value: 'starbucks', brand: 'Starbucks', desc: 'Starbucks Light', bg: '#ffffff', accent: '#006241', accent2: '#cba258', warning: '#f5a520', danger: '#ff3b30' },
    { value: 'stripe', brand: 'Stripe', desc: '페이먼트 퍼플', bg: '#f6f9fc', accent: '#635bff', accent2: '#00d4ff', warning: '#f5a623', danger: '#cd3d64' },
    { value: 'sunset', brand: 'Sunset', desc: 'Sunset Dark', bg: '#233d4c', accent: '#fd802e', accent2: '#ffa56d', warning: '#fd802e', danger: '#ff5e5e' },
    { value: 'supabase', brand: 'Supabase', desc: 'Supabase Light', bg: '#ffffff', accent: '#5f49dc', accent2: '#b4b4b4', warning: '#f5a520', danger: '#ff3b30' },
    { value: 'superhuman', brand: 'Superhuman', desc: 'Superhuman Light', bg: '#ffffff', accent: '#1b1938', accent2: '#714cb6', warning: '#f5a520', danger: '#ff3b30' },
    { value: 'tannery', brand: 'Tannery', desc: 'Tannery Dark', bg: '#2b2b2b', accent: '#c66b3d', accent2: '#e08a5d', warning: '#c66b3d', danger: '#d84a4a' },
    { value: 'tesla', brand: 'Tesla', desc: 'Tesla Light', bg: '#ffffff', accent: '#3e6ae1', accent2: '#3e6ae1', warning: '#f5a520', danger: '#ff3b30' },
    { value: 'theverge', brand: 'Theverge', desc: 'Theverge Light', bg: '#ffffff', accent: '#27a687', accent2: '#309875', warning: '#f5a520', danger: '#5200ff' },
    { value: 'tiffany', brand: 'Tiffany', desc: '로빈스에그 블루', bg: '#f2f9f8', accent: '#0abab5', accent2: '#c9a86c', warning: '#d4a84b', danger: '#c85a5a' },
    { value: 'tmobile', brand: 'T-Mobile', desc: '시그니처 마젠타', bg: '#ffffff', accent: '#e20074', accent2: '#9b0056', warning: '#f9a825', danger: '#d9001b' },
    { value: 'together', brand: 'Together', desc: 'Together Light', bg: '#ffffff', accent: '#ef2cc1', accent2: '#bdbbff', warning: '#f5a520', danger: '#ff3b30' },
    { value: 'twitch', brand: 'Twitch', desc: '게이밍 퍼플', bg: '#0e0e10', accent: '#9146ff', accent2: '#bf94ff', warning: '#ffc70b', danger: '#eb0400' },
    { value: 'uber', brand: 'Uber', desc: 'Uber Light', bg: '#ffffff', accent: '#000000', accent2: '#000000', warning: '#f5a520', danger: '#ff3b30' },
    { value: 'ups', brand: 'UPS', desc: '풀먼 브라운', bg: '#2b1810', accent: '#ffb500', accent2: '#c89d5a', warning: '#ffb500', danger: '#d9534f' },
    { value: 'vercel', brand: 'Vercel', desc: '퓨어 미니멀', bg: '#000000', accent: '#ffffff', accent2: '#7928ca', warning: '#f5a623', danger: '#ff0080' },
    { value: 'vodafone', brand: 'Vodafone', desc: 'Vodafone Light', bg: '#ffffff', accent: '#e60000', accent2: '#ffffff', warning: '#f5a520', danger: '#ff3b30' },
    { value: 'voltagent', brand: 'Voltagent', desc: 'Voltagent Light', bg: '#ffffff', accent: '#00d992', accent2: '#818cf8', warning: '#f5a520', danger: '#ff3b30' },
    { value: 'warp', brand: 'Warp', desc: 'Warp Light', bg: '#ffffff', accent: '#a3a2a0', accent2: '#868584', warning: '#f5a520', danger: '#ff3b30' },
    { value: 'webflow', brand: 'Webflow', desc: 'Webflow Light', bg: '#ffffff', accent: '#080808', accent2: '#7a3dff', warning: '#f5a520', danger: '#ff3b30' },
    { value: 'wired', brand: 'Wired', desc: 'Wired Light', bg: '#ffffff', accent: '#000000', accent2: '#057dbc', warning: '#f5a520', danger: '#e53e3e' },
    { value: 'wise', brand: 'Wise', desc: 'Wise Light', bg: '#ffffff', accent: '#0e0f0c', accent2: '#0a0b08', warning: '#f5a520', danger: '#ff3b30' },
    { value: 'x', brand: 'X', desc: '샤프 모노', bg: '#000000', accent: '#1d9bf0', accent2: '#f91880', warning: '#ffd400', danger: '#f4212e' },
    { value: 'youtube', brand: 'YouTube', desc: '시그니처 레드', bg: '#ffffff', accent: '#ff0000', accent2: '#065fd4', warning: '#e3a01e', danger: '#cc0000' },
    { value: 'zapier', brand: 'Zapier', desc: 'Zapier Light', bg: '#ffffff', accent: '#201515', accent2: '#160f0f', warning: '#f5a520', danger: '#ff3b30' }
  ];

  function mountThemeFab() {
    if (document.querySelector('.mw-theme-fab')) return; // already mounted

    var fab = document.createElement('div');
    fab.className = 'mw-theme-fab';
    fab.dataset.version = (window.Maging && window.Maging.version) || '';
    fab.innerHTML =
      '<button type="button" class="mw-theme-fab__shuffle" aria-label="랜덤 테마" title="랜덤 테마">🎲</button>' +
      '<button type="button" class="mw-theme-fab__btn" aria-expanded="false" aria-label="테마 선택">' +
        '<span class="mw-theme-fab__swatch-box" data-swatch="box">' +
          '<span class="mw-theme-fab__swatch-bars">' +
            '<span data-swatch="accent"></span>' +
            '<span data-swatch="accent2"></span>' +
            '<span data-swatch="warning"></span>' +
            '<span data-swatch="danger"></span>' +
          '</span>' +
        '</span>' +
      '</button>' +
      '<div class="mw-theme-fab__export-wrap" style="display:none">' +
        '<button type="button" class="mw-theme-fab__export" aria-label="내보내기"></button>' +
        '<div class="mw-theme-fab__export-menu"></div>' +
      '</div>' +
      '<div class="mw-theme-fab__version">v' + api.version + '</div>' +
      '<div class="mw-theme-fab__panel" role="dialog" aria-label="테마 목록">' +
        '<div class="mw-theme-fab__head">' +
          '<span>Theme · ' + THEME_DATA.length + '</span>' +
          '<button type="button" class="mw-theme-fab__close" aria-label="닫기">×</button>' +
        '</div>' +
        '<div class="mw-theme-fab__tabs" role="tablist">' +
          '<button type="button" class="mw-theme-fab__tab is-active" data-sort="popular">대중순</button>' +
          '<button type="button" class="mw-theme-fab__tab" data-sort="unique">독창순</button>' +
          '<button type="button" class="mw-theme-fab__tab" data-sort="rainbow">무지개순</button>' +
        '</div>' +
        '<div class="mw-theme-fab__list"></div>' +
      '</div>';
    document.body.appendChild(fab);

    var btn      = fab.querySelector('.mw-theme-fab__btn');
    var list     = fab.querySelector('.mw-theme-fab__list');
    var tabs     = fab.querySelectorAll('.mw-theme-fab__tab');
    var closeBtn = fab.querySelector('.mw-theme-fab__close');
    var swBox     = fab.querySelector('[data-swatch="box"]');
    var swAccent  = fab.querySelector('[data-swatch="accent"]');
    var swAccent2 = fab.querySelector('[data-swatch="accent2"]');
    var swWarning = fab.querySelector('[data-swatch="warning"]');
    var swDanger  = fab.querySelector('[data-swatch="danger"]');
    var sortMode = 'popular';

    // ── Export button (context-aware, single action) ──
    var exportBtn = fab.querySelector('.mw-theme-fab__export');

    var dlIcon = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v8m0 0l-3-3m3 3l3-3"/><path d="M3 12h10"/></svg>';
    var htmlIcon = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6l-2 2 2 2"/><path d="M12 6l2 2-2 2"/><path d="M9 3l-2 10"/></svg>';
    function detectExportMode() {
      var slides = document.querySelectorAll('.news-card, .cn-slide, [data-slide]');
      if (slides.length > 1) return {
        format: 'zip', label: dlIcon, title: 'ZIP 다운로드 (' + slides.length + '장)', multi: true,
        options: [
          { format: 'zip', label: dlIcon + ' PNG ZIP (' + slides.length + '장)', title: 'PNG 이미지 묶음' },
          { format: 'html', label: htmlIcon + ' HTML', title: '단일 HTML 파일' }
        ]
      };
      var slideScope = document.querySelector('.wk-slides') || document;
      var pages = slideScope.querySelectorAll('.slide, .mw-a4-page, .a4-page');
      if (pages.length > 1) return {
        format: 'pptx', label: dlIcon, title: '내보내기 (' + pages.length + '슬라이드)', multi: true,
        options: [
          { format: 'pptx', label: dlIcon + ' PPTX', title: '편집 가능한 파워포인트' },
          { format: 'pdf', label: dlIcon + ' PDF', title: '인쇄용 PDF' },
          { format: 'html', label: htmlIcon + ' HTML', title: '단일 HTML 파일' }
        ]
      };
      var widgets = document.querySelectorAll('[data-mw-card]');
      if (widgets.length > 0) return {
        format: 'html', label: dlIcon, title: 'HTML 다운로드', multi: true,
        options: [
          { format: 'html', label: htmlIcon + ' HTML', title: '단일 HTML 파일' }
        ]
      };
      return null;
    }

    var exportWrap = fab.querySelector('.mw-theme-fab__export-wrap');
    var exportMenu = fab.querySelector('.mw-theme-fab__export-menu');

    function updateExportBtn() {
      var mode = detectExportMode();
      if (mode) {
        exportWrap.style.display = '';
        exportBtn.innerHTML = mode.label;
        exportBtn.title = mode.title;
        exportBtn.dataset.format = mode.format;
        exportBtn.dataset.multi = mode.multi ? '1' : '';
        if (mode.multi && mode.options) {
          exportMenu.innerHTML = mode.options.map(function (o) {
            return '<button type="button" data-export="' + o.format + '" title="' + o.title + '">' + o.label + '</button>';
          }).join('');
        } else {
          exportMenu.innerHTML = '';
        }
      } else {
        exportWrap.style.display = 'none';
      }
    }
    updateExportBtn();
    // Re-detect when widgets finish loading
    var _exportObs = new MutationObserver(function () {
      updateExportBtn();
      if (detectExportMode()) _exportObs.disconnect();
    });
    _exportObs.observe(document.body, { childList: true, subtree: true });
    setTimeout(function () { _exportObs.disconnect(); }, 5000);

    exportBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (exportBtn.dataset.multi) {
        exportMenu.classList.toggle('is-open');
      } else {
        var fmt = exportBtn.dataset.format;
        if (fmt) doExport(fmt);
      }
    });

    exportMenu.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-export]');
      if (btn) {
        exportMenu.classList.remove('is-open');
        doExport(btn.dataset.export);
      }
    });

    document.addEventListener('click', function (e) {
      if (!exportWrap.contains(e.target)) exportMenu.classList.remove('is-open');
    });

    function loadScript(src) {
      return new Promise(function (resolve, reject) {
        if (document.querySelector('script[src="' + src + '"]')) { resolve(); return; }
        var s = document.createElement('script');
        s.src = src;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }

    function getExportTarget() {
      var slides = document.querySelectorAll('.news-card, .cn-slide, [data-slide]');
      if (slides.length > 1) return { type: 'cardnews', elements: slides };
      // Only main slides — exclude sidebar thumbnail clones
      var slideArea = document.querySelector('[data-slide-area]') || document.querySelector('.wk-slides');
      var pages = slideArea
        ? slideArea.querySelectorAll('.slide')
        : document.querySelectorAll('.slide, .mw-a4-page, .a4-page');
      if (pages.length > 1) return { type: 'weekly', elements: pages };
      var main = document.querySelector('main') || document.querySelector('.mw-themed') || document.body;
      return { type: 'dashboard', elements: [main] };
    }

    // ── Shared export helpers ──
    function mountSlides(elements, delay) {
      var i = 0;
      return new Promise(function (resolve) {
        function step() {
          if (i >= elements.length) { resolve(); return; }
          var s = elements[i++];
          if (s.id) {
            window.location.hash = '#' + s.id;
            window.dispatchEvent(new HashChangeEvent('hashchange'));
          }
          setTimeout(step, delay || 200);
        }
        step();
      });
    }

    // Ensure cover title has accent color (same logic as viewer.ts applyCoverAccent)
    function ensureCoverAccent(slides) {
      slides.forEach(function (s) {
        var ct = s.querySelector('.mw-cover__title');
        if (!ct || ct.querySelector('[data-accent]')) return;
        var words = ct.textContent.split(' ');
        if (words.length > 1) {
          var last = words.pop();
          ct.innerHTML = words.join(' ') + ' <span data-accent style="color:var(--mw-accent)">' + last + '</span>';
        } else {
          ct.innerHTML = '<span data-accent style="color:var(--mw-accent)">' + words[0] + '</span>';
        }
      });
    }

    function restoreHash(hash) {
      if (hash) {
        window.location.hash = hash;
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      }
    }

    function downloadBlob(blob, filename) {
      var a = document.createElement('a');
      a.download = filename;
      a.href = URL.createObjectURL(blob);
      a.click();
      URL.revokeObjectURL(a.href);
    }

    // Emoji-to-image conversion with cache (SVG foreignObject can't render color emoji fonts)
    var _emojiCache = {};
    var _emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu;
    function emojiToDataUrl(emoji, sizePx) {
      var s = sizePx || 64;
      var key = emoji + '|' + s;
      if (_emojiCache[key]) return _emojiCache[key];
      var pad = Math.ceil(s * 0.25);
      var full = s + pad * 2;
      var cv = document.createElement('canvas');
      cv.width = full; cv.height = full;
      var ctx = cv.getContext('2d');
      ctx.font = s + 'px Tossface, "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.fillText(emoji, full / 2, full / 2);
      var id = ctx.getImageData(0, 0, full, full);
      var d = id.data, t = full, l = full, b = 0, r = 0;
      for (var y = 0; y < full; y++) for (var x = 0; x < full; x++) {
        if (d[(y * full + x) * 4 + 3] > 0) { if (x < l) l = x; if (x > r) r = x; if (y < t) t = y; if (y > b) b = y; }
      }
      if (b === 0 && r === 0) { _emojiCache[key] = cv.toDataURL('image/png'); return _emojiCache[key]; }
      var cw = r - l + 1, ch = b - t + 1;
      var cv2 = document.createElement('canvas');
      cv2.width = cw; cv2.height = ch;
      cv2.getContext('2d').drawImage(cv, l, t, cw, ch, 0, 0, cw, ch);
      _emojiCache[key] = cv2.toDataURL('image/png');
      return _emojiCache[key];
    }

    function replaceEmojisWithImages(elements) {
      elements.forEach(function (sl) {
        if (!_emojiRegex.test(sl.textContent)) return;
        _emojiRegex.lastIndex = 0;
        var walker = document.createTreeWalker(sl, NodeFilter.SHOW_TEXT, null, false);
        var textNodes = [];
        while (walker.nextNode()) textNodes.push(walker.currentNode);
        textNodes.forEach(function (tn) {
          if (!_emojiRegex.test(tn.textContent)) return;
          _emojiRegex.lastIndex = 0;
          var frag = document.createDocumentFragment();
          var last = 0, m;
          while ((m = _emojiRegex.exec(tn.textContent)) !== null) {
            if (m.index > last) frag.appendChild(document.createTextNode(tn.textContent.slice(last, m.index)));
            var img = document.createElement('img');
            img.src = emojiToDataUrl(m[0], 128);
            img.alt = m[0];
            img.style.cssText = 'height:1em;width:1em;margin:0 .05em 0 .1em;vertical-align:-0.1em;display:inline-block;';
            frag.appendChild(img);
            last = m.index + m[0].length;
          }
          if (last < tn.textContent.length) frag.appendChild(document.createTextNode(tn.textContent.slice(last)));
          tn.parentNode.replaceChild(frag, tn);
        });
      });
    }

    function doExport(format) {
      var h2cProUrl = 'https://cdn.jsdelivr.net/npm/html2canvas-pro@2.0.2/dist/html2canvas-pro.min.js';
      var modernSsUrl = 'https://cdn.jsdelivr.net/npm/modern-screenshot@4.7.0/dist/index.js';
      var domToPptxUrl = 'https://cdn.jsdelivr.net/npm/dom-to-pptx@latest/dist/dom-to-pptx.bundle.js';
      var target = getExportTarget();
      var theme = current();
      var timestamp = new Date().toISOString().slice(0, 10);
      var baseName = (target.type === 'cardnews' ? 'cardnews' : 'maging') + '-' + theme + '-' + timestamp;

      var savedLabel = exportBtn.innerHTML;
      var spinnerSvg = '<svg class="mw-spin" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M8 2a6 6 0 1 1-6 6"/></svg>';
      exportBtn.innerHTML = spinnerSvg;
      exportBtn.disabled = true;
      function finishExport(err) {
        fab.style.display = '';
        exportBtn.innerHTML = savedLabel;
        exportBtn.disabled = false;
        if (err) console.error(err);
      }

      fab.style.display = 'none';

      function bakeCharts(root) {
        var charts = root.querySelectorAll('[data-mw-chart]');
        var backups = [];
        charts.forEach(function (el) {
          var inst = typeof echarts !== 'undefined' && echarts.getInstanceByDom(el);
          if (inst) {
            var url = inst.getDataURL({ type: 'png', pixelRatio: 2, backgroundColor: 'transparent' });
            var img = document.createElement('img');
            img.src = url;
            img.style.cssText = 'width:100%;height:100%;object-fit:contain;position:absolute;top:0;left:0';
            el.style.position = 'relative';
            el.appendChild(img);
            backups.push({ el: el, img: img });
          }
        });
        return backups;
      }
      function unbakeCharts(backups) {
        backups.forEach(function (b) { b.el.removeChild(b.img); });
      }

      function captureElement(el) {
        var backups = bakeCharts(el);
        var isCardNews = target.type === 'cardnews';
        var dpr = window.devicePixelRatio || 1;
        return loadScript(h2cProUrl).then(function () {
          return html2canvas(el, {
            scale: isCardNews ? Math.max(4, dpr * 2) : Math.max(3, dpr * 1.5),
            useCORS: true,
            allowTaint: true,
            backgroundColor: getComputedStyle(el).backgroundColor || '#ffffff',
            logging: false,
            removeContainer: true,
            ignoreElements: function (node) {
              return node.classList && node.classList.contains('mw-theme-fab');
            }
          });
        }).then(function (canvas) {
          unbakeCharts(backups);
          return canvas;
        });
      }

      if (format === 'html') {
        var styles = '';
        Array.from(document.styleSheets).forEach(function (ss) {
          try {
            Array.from(ss.cssRules).forEach(function (r) { styles += r.cssText + '\n'; });
          } catch (e) {
            if (ss.href) styles += '@import url("' + ss.href + '");\n';
          }
        });
        var parser = new DOMParser();
        var doc = parser.parseFromString(document.documentElement.outerHTML, 'text/html');
        var fabEl = doc.querySelector('.mw-theme-fab');
        if (fabEl) fabEl.remove();
        doc.querySelectorAll('link[rel="stylesheet"]').forEach(function (l) { l.remove(); });
        var styleEl = doc.createElement('style');
        styleEl.textContent = styles;
        doc.head.appendChild(styleEl);
        downloadBlob(
          new Blob(['<!DOCTYPE html>\n' + doc.documentElement.outerHTML], { type: 'text/html;charset=utf-8' }),
          baseName + '.html'
        );
        finishExport();
      } else if (format === 'png') {
        captureElement(target.elements[0]).then(function (canvas) {
          finishExport();
          var a = document.createElement('a');
          a.download = baseName + '.png';
          a.href = canvas.toDataURL('image/png');
          a.click();
        }).catch(function (e) { finishExport(e); });
      } else if (format === 'pdf') {
        var pdfSlides = Array.from(target.elements);
        var pdfOrigHash = window.location.hash;

        mountSlides(pdfSlides).then(function () {
          document.body.dataset.mwPrinting = '';
          ensureCoverAccent(pdfSlides);
          window.dispatchEvent(new Event('resize'));

          var pageW = 1058;
          pdfSlides.forEach(function (s) {
            var sw = s.scrollWidth || s.offsetWidth;
            var scale = sw > pageW ? pageW / sw : 1;
            s.style.setProperty('--print-scale', scale.toFixed(4));
          });

          setTimeout(function () {
            window.print();
            delete document.body.dataset.mwPrinting;
            pdfSlides.forEach(function (s) { s.style.removeProperty('--print-scale'); });
            finishExport();
            restoreHash(pdfOrigHash);
          }, 600);
        }).catch(function (e) { finishExport(e); restoreHash(pdfOrigHash); });
      } else if (format === 'pptx') {
        var slides = Array.from(target.elements);
        var originalHash = window.location.hash;

        // Backup slide state for full restore after export
        var slideBackups = slides.map(function (s) {
          return {
            el: s,
            hadActive: s.hasAttribute('data-active'),
            scale: s.style.getPropertyValue('--slide-scale'),
            transform: s.style.transform,
            margin: s.style.margin,
          };
        });

        // Backup slideArea styles for restore
        var slideArea = slides[0].parentElement;
        var slideAreaCss = slideArea ? slideArea.style.cssText : '';

        mountSlides(slides).then(function () {
          ensureCoverAccent(slides);
          // Fix slide dimensions for container query resolution
          if (slideArea) {
            slideArea.style.width = '1240px';
            slideArea.style.display = 'block';
            slideArea.style.overflow = 'visible';
          }
          slides.forEach(function (s) {
            s.setAttribute('data-active', '');
            s.style.setProperty('--slide-scale', '1');
            s.style.transform = 'none';
            s.style.margin = '0';
            s.style.width = '1240px';
            s.style.minWidth = '1240px';
            s.style.display = 'flex';
            s.style.flexDirection = 'column';
          });

          return new Promise(function (r) { setTimeout(r, 500); });
        }).then(function () {
          return loadScript(domToPptxUrl);
        }).then(function () {
          var sampleSlide = slides[0];
          var pad = 1.05;
          var slideW = (sampleSlide.offsetWidth / 96) * pad;
          var slideH = (sampleSlide.offsetHeight / 96) * pad;

          // Swap fonts to PowerPoint defaults BEFORE measuring
          var PPTX_SANS = "'Malgun Gothic', Arial, sans-serif";
          var PPTX_SERIF = "Batang, Georgia, serif";
          var PPTX_MONO = "'Courier New', Consolas, monospace";
          var styleBackups = [];

          slides.forEach(function (s) {
            var els = s.querySelectorAll('*');
            for (var i = 0; i < els.length; i++) {
              var el = els[i];
              var cs = getComputedStyle(el);
              // Backup ALL inline styles for full restore
              var origCssText = el.style.cssText;
              // Resolve colors for dom-to-pptx
              el.style.color = cs.color;
              var bgImg = cs.backgroundImage;
              if (bgImg && bgImg.indexOf('gradient') >= 0) {
                // Flatten gradient to solid bg color for PPTX compatibility
                el.style.cssText += ';background:none !important;background-image:none !important;';
                el.style.backgroundColor = cs.backgroundColor;
              } else if (bgImg && bgImg !== 'none') {
                var fc = bgImg.match(/rgb[a]?\([^)]+\)/);
                el.style.background = 'none';
                el.style.backgroundColor = fc ? fc[0] : cs.backgroundColor;
              } else {
                el.style.backgroundColor = cs.backgroundColor;
              }
              el.style.borderColor = cs.borderColor;
              // Swap fonts
              var ff = cs.fontFamily;
              if (ff.indexOf('monospace') > -1 || ff.indexOf('JetBrains') > -1 || ff.indexOf('Consolas') > -1) {
                el.style.fontFamily = PPTX_MONO;
              } else if (ff.indexOf('Hahmlet') > -1 || ff.indexOf('Playfair') > -1 || ff.indexOf('Georgia') > -1 || ff.indexOf('Times') > -1 || (ff.indexOf('serif') > -1 && ff.indexOf('sans-serif') === -1)) {
                el.style.fontFamily = PPTX_SERIF;
              } else {
                el.style.fontFamily = PPTX_SANS;
              }
              styleBackups.push({ el: el, cssText: origCssText });
            }
          });

          // Prevent mid-word breaks
          slides.forEach(function (s) {
            s.style.wordBreak = 'keep-all';
            s.style.overflowWrap = 'break-word';
            s.querySelectorAll('[data-role="header"], [data-role="header"] *, [data-role="footer"], [data-role="footer"] *').forEach(function (el) {
              el.style.whiteSpace = 'nowrap';
              el.style.overflow = 'visible';
            });
            s.querySelectorAll('h1, h2, h3, [data-role="title"], [data-role="headline"], [data-role="label"], [data-role="value"], [data-role="company"]').forEach(function (el) {
              el.style.letterSpacing = '0.02em';
              el.style.wordBreak = 'keep-all';
            });
          });

          // Wait for font swap to reflow, THEN resolve cqw/clamp → px
          return new Promise(function (r) { setTimeout(r, 300); }).then(function () {
            slides.forEach(function (s) {
              if (!s.style.width) s.style.width = s.offsetWidth + 'px';
              var els = s.querySelectorAll('*');
              for (var j = 0; j < els.length; j++) {
                var el2 = els[j];
                var cs2 = getComputedStyle(el2);
                el2.style.fontSize = cs2.fontSize;
                el2.style.lineHeight = cs2.lineHeight;
                el2.style.padding = cs2.padding;
                el2.style.margin = cs2.margin;
                if (cs2.gap && cs2.gap !== 'normal') el2.style.gap = cs2.gap;
                el2.style.borderRadius = cs2.borderRadius;
              }
            });
            // Wait for px resolve to settle
            return new Promise(function (r) { setTimeout(r, 200); });
          }).then(function () {
            return domToPptx.exportToPptx(slides, {
              fileName: baseName + '.pptx',
              width: slideW,
              height: slideH,
              autoEmbedFonts: false,
            });
          }).then(function () {
            // Full page reload — DOM mutations too deep to restore cleanly
            window.location.reload();
          });
        }).then(function () {
          finishExport();
          restoreHash(originalHash);
        }).catch(function (e) {
          finishExport(e);
          restoreHash(originalHash);
        });
      } else if (format === 'zip') {
        var jszipUrl = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
        Promise.all([loadScript(modernSsUrl), loadScript(jszipUrl)]).then(function () {
          var slides = Array.from(target.elements);
          var originalHash = window.location.hash;

          mountSlides(slides, 300).then(function () {
            slides.forEach(function (s) { s.setAttribute('data-active', ''); });
            replaceEmojisWithImages(slides);
            return new Promise(function (r) { setTimeout(r, 300); });
          }).then(function () {
            var chain = Promise.resolve([]);
            slides.forEach(function (slide) {
              chain = chain.then(function (arr) {
                return modernScreenshot.domToCanvas(slide, {
                  scale: 3,
                  filter: function (node) {
                    return !(node.classList && node.classList.contains('mw-theme-fab'));
                  }
                }).then(function (canvas) { arr.push(canvas); return arr; });
              });
            });
            return chain;
          }).then(function (canvases) {
            finishExport();
            var zip = new JSZip();
            var folder = zip.folder(baseName);
            canvases.forEach(function (c, idx) {
              var isFirst = idx === 0;
              var fmt = isFirst ? 'image/jpeg' : 'image/png';
              var ext = isFirst ? '.jpg' : '.png';
              var data = isFirst ? c.toDataURL(fmt, 0.92).split(',')[1] : c.toDataURL(fmt).split(',')[1];
              folder.file('slide-' + String(idx + 1).padStart(2, '0') + ext, data, { base64: true });
            });
            zip.generateAsync({ type: 'blob' }).then(function (blob) {
              downloadBlob(blob, baseName + '.zip');
            });
            // Release canvas GPU memory
            canvases.forEach(function (c) { c.width = 0; c.height = 0; });
            restoreHash(originalHash);
          }).catch(function (e) { finishExport(e); restoreHash(originalHash); });
        });
      }
    }

    function hexToHue(hex) {
      var h = hex.replace('#', '');
      if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
      var r = parseInt(h.slice(0, 2), 16) / 255;
      var g = parseInt(h.slice(2, 4), 16) / 255;
      var b = parseInt(h.slice(4, 6), 16) / 255;
      var mx = Math.max(r, g, b), mn = Math.min(r, g, b);
      var d = mx - mn;
      if (d === 0) return { h: -1, s: 0, l: (mx + mn) / 2 };
      var H;
      if (mx === r) H = ((g - b) / d + (g < b ? 6 : 0));
      else if (mx === g) H = ((b - r) / d + 2);
      else H = ((r - g) / d + 4);
      return { h: H * 60, s: d / (1 - Math.abs(2 * ((mx + mn) / 2) - 1)), l: (mx + mn) / 2 };
    }
    function sortThemes(mode) {
      var arr = THEME_DATA.slice();
      if (mode === 'unique') return arr.reverse();
      if (mode === 'rainbow') {
        return arr.sort(function (a, b) {
          var ha = hexToHue(a.accent), hb = hexToHue(b.accent);
          if (ha.h < 0 && hb.h < 0) return ha.l - hb.l;
          if (ha.h < 0) return 1;
          if (hb.h < 0) return -1;
          return ha.h - hb.h;
        });
      }
      return arr;
    }
    function current() { return document.documentElement.getAttribute('data-theme') || 'flow'; }
    function itemHtml(t, i) {
      var active = t.value === current() ? ' is-active' : '';
      var tileStyle = '--mw-tile-accent:' + t.accent + ';';
      return '<button type="button" class="mw-theme-fab__item' + active + '" data-mw-theme="' + t.value + '" style="' + tileStyle + '">' +
        '<span class="mw-theme-fab__item-idx">' + String(i).padStart(2, '0') + '</span>' +
        '<span class="mw-theme-fab__item-check" aria-hidden="true">✓</span>' +
        '<span class="mw-theme-fab__item-swatch" style="background:' + t.bg + '">' +
          '<span class="mw-theme-fab__item-swatch-bars">' +
            '<span style="background:' + t.accent + '"></span>' +
            '<span style="background:' + t.accent2 + '"></span>' +
            '<span style="background:' + t.warning + '"></span>' +
            '<span style="background:' + t.danger + '"></span>' +
          '</span>' +
        '</span>' +
        '<span class="mw-theme-fab__item-body">' +
          '<span class="mw-theme-fab__item-name">' + t.desc + '</span>' +
          '<span class="mw-theme-fab__item-brand">inspired by ' + t.brand + '</span>' +
        '</span>' +
      '</button>';
    }
    function renderList() {
      var cur = current();
      var sorted = sortThemes(sortMode);
      var pinned = sorted.filter(function (t) { return t.value === cur; });
      var rest   = sorted.filter(function (t) { return t.value !== cur; });
      var html = '';
      if (pinned.length) {
        html += '<div class="mw-theme-fab__pinned-label">Selected</div>';
        html += pinned.map(function (t) { return itemHtml(t, sorted.indexOf(t) + 1); }).join('');
        html += '<div class="mw-theme-fab__divider"></div>';
        html += '<div class="mw-theme-fab__rest-label">Others · ' + rest.length + '</div>';
      }
      html += rest.map(function (t) { return itemHtml(t, sorted.indexOf(t) + 1); }).join('');
      list.innerHTML = html;
    }
    function syncButton() {
      var t = THEME_DATA.filter(function (x) { return x.value === current(); })[0];
      if (!t) return;
      swBox.style.background     = t.bg;
      swAccent.style.background  = t.accent;
      swAccent2.style.background = t.accent2;
      swWarning.style.background = t.warning;
      swDanger.style.background  = t.danger;
    }
    function open() {
      fab.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
      var active = list.querySelector('.is-active');
      if (active) active.scrollIntoView({ block: 'nearest' });
    }
    function close() {
      fab.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
    }

    var shuffleBtn = fab.querySelector('.mw-theme-fab__shuffle');
    function showToast(text) {
      var old = fab.querySelector('.mw-theme-fab__toast');
      if (old) old.remove();
      var toast = document.createElement('div');
      toast.className = 'mw-theme-fab__toast';
      toast.textContent = text;
      fab.appendChild(toast);
      requestAnimationFrame(function () { toast.classList.add('is-visible'); });
      setTimeout(function () {
        toast.classList.remove('is-visible');
        setTimeout(function () { toast.remove(); }, 250);
      }, 1600);
    }
    shuffleBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var cur = current();
      var others = THEME_DATA.filter(function (t) { return t.value !== cur; });
      var pick = others[Math.floor(Math.random() * others.length)];
      if (pick) {
        api.setTheme(pick.value);
        showToast(pick.desc + ' · ' + pick.brand);
      }
    });
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      fab.classList.contains('is-open') ? close() : open();
    });
    closeBtn.addEventListener('click', function (e) { e.stopPropagation(); close(); });
    list.addEventListener('click', function (e) {
      var item = e.target.closest('[data-mw-theme]');
      if (!item) return;
      api.setTheme(item.dataset.mwTheme);
    });
    tabs.forEach(function (t) {
      t.addEventListener('click', function (e) {
        e.stopPropagation();
        sortMode = t.dataset.sort;
        tabs.forEach(function (o) { o.classList.toggle('is-active', o === t); });
        renderList();
      });
    });
    document.addEventListener('click', function (e) {
      if (!fab.contains(e.target)) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });

    new MutationObserver(function () { syncButton(); renderList(); })
      .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    renderList();
    syncButton();

    // Expose export function for external callers (e.g. weekly titlebar)
    api._doExport = doExport;
  }

  // Auto-mount on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { mountAll(); mountThemeFab(); });
  } else {
    setTimeout(function () { mountAll(); mountThemeFab(); }, 0);
  }

  // Responsive
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(refreshAll, 300);
  });

  global.Maging = api;
  global.mw = api;
})(typeof window !== 'undefined' ? window : this);

// ── Web Components (declarative HTML sugar) ────────────────────────────────
(function () {
  if (typeof customElements === 'undefined') return;

  function onMaging(cb) {
    if (window.Maging && window.Maging.kpiCard) { cb(); return; }
    window.addEventListener('maging:ready', cb, { once: true });
  }

  function attr(el, name) { return el.getAttribute(name) || ''; }
  function has(el, name)  { return el.hasAttribute(name); }

  // <maging-kpi label="" value="" unit="" delta="" delta-good-when="" icon="" compact>
  // unit: 억원 | 만원 | 명 | 건 | % etc. → auto-wraps in <span class="mw-unit">
  customElements.define('maging-kpi', class extends HTMLElement {
    connectedCallback() {
      onMaging(() => {
        var val  = attr(this, 'value');
        var unit = attr(this, 'unit');
        var cfg  = {
          label:     attr(this, 'label'),
          value:     unit ? val + '<span class="text-[0.65em] font-normal text-[var(--mw-text-muted)] ml-[0.1em]"> ' + unit + '</span>' : val,
          valueHTML: !!unit || val.includes('<'),
        };
        var d = attr(this, 'delta');
        if (d) { cfg.delta = parseFloat(d); cfg.deltaGoodWhen = attr(this, 'delta-good-when') || 'positive'; }
        if (has(this, 'compact')) cfg.compact = true;
        var icon = attr(this, 'icon');
        if (icon) cfg.icon = icon;
        window.Maging.kpiCard(this, cfg);
      });
    }
  });

  // <maging-header kicker="" title="" subtitle="" meta="">
  customElements.define('maging-header', class extends HTMLElement {
    connectedCallback() {
      onMaging(() => {
        window.Maging.pageHeader(this, {
          kicker:   attr(this, 'kicker'),
          title:    attr(this, 'title'),
          subtitle: attr(this, 'subtitle'),
          meta:     attr(this, 'meta'),
        });
      });
    }
  });

  // <maging-section index="" kicker="" title="" tag="">
  customElements.define('maging-section', class extends HTMLElement {
    connectedCallback() {
      onMaging(() => {
        window.Maging.sectionHead(this, {
          index:  attr(this, 'index'),
          kicker: attr(this, 'kicker'),
          title:  attr(this, 'title'),
          tag:    attr(this, 'tag'),
        });
      });
    }
  });

  // <maging-alert type="info" icon="📋" title="" message="">
  customElements.define('maging-alert', class extends HTMLElement {
    connectedCallback() {
      onMaging(() => {
        window.Maging.alertBanner(this, {
          type:    attr(this, 'type') || 'info',
          icon:    attr(this, 'icon'),
          title:   attr(this, 'title'),
          message: attr(this, 'message'),
        });
      });
    }
  });
})();
