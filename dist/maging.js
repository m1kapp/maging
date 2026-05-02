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

  var EC = (typeof echarts !== 'undefined') ? echarts : null;
  if (!EC && typeof console !== 'undefined') {
    console.warn('[magicwiget] ECharts is not loaded. Charts will not render. ' +
      'Add <script src="https://cdnjs.cloudflare.com/ajax/libs/echarts/5.6.0/echarts.min.js"></script> before magicwiget.js.');
  }

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

  function baseTooltip(c) {
    return {
      backgroundColor: c.surface,
      borderColor: c.border,
      textStyle: { color: c.text, fontFamily: c.font, fontSize: 11 },
      extraCssText: 'box-shadow: 0 4px 12px -4px rgba(0,0,0,0.15); border-radius: ' + c.radius + '; padding: 8px 12px;',
    };
  }

  function headerHTML(title, subtitle, rightHTML) {
    if (!title && !subtitle && !rightHTML) return '';
    var left = '';
    if (title)    left += '<h3 class="mw-header__title">' + title + '</h3>';
    if (subtitle) left += '<div class="mw-header__subtitle">' + subtitle + '</div>';
    return '<div class="mw-header"><div>' + left + '</div>' + (rightHTML || '') + '</div>';
  }

  function escapeHTML(s) {
    if (s == null || s === undefined) return '';
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
  var U = '<span class="mw-unit">';
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
      el.classList.add('mw-card');
      el.style.minHeight = data.height + 'px';
      var extra = extraHTMLFn ? extraHTMLFn(data) : '';
      el.innerHTML = headerHTML(data.title, data.subtitle) +
        '<div class="mw-chart__body"></div>' +
        extra;
      if (!EC) return;
      var body = el.querySelector('.mw-chart__body');
      if (chart) chart.dispose();
      chart = EC.init(body, null, { renderer: 'svg' });
      var c = getColors();
      var palette = [c.accent, c.accent2, c.success, c.warning, c.danger];
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
      deltaGoodWhen: 'positive',
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
      el.classList.add('mw-card', 'mw-kpi');
      el.classList.toggle('mw-kpi--compact', !!data.compact);
      var deltaHTML = '';
      if (data.delta != null && !isNaN(data.delta)) {
        var goodWhenNeg = data.deltaGoodWhen === 'negative';
        var good = goodWhenNeg ? data.delta < 0 : data.delta > 0;
        var arrow = data.delta >= 0 ? '▲' : '▼';
        var abs = Math.abs(Number(data.delta));
        var prec = abs > 0 && abs < 1 ? 2 : 1;
        deltaHTML = '<div class="mw-kpi__delta mw-kpi__delta--' + (good ? 'good' : 'bad') + '">' +
          arrow + ' ' + abs.toFixed(prec) + '%</div>';
      }
      var iconHTML = data.icon ? '<span class="mw-kpi__icon">' + escapeHTML(data.icon) + '</span>' : '';
      var showSpark = !data.compact && data.sparkline && data.sparkline.length;
      el.innerHTML =
        '<div class="mw-kpi__label">' + iconHTML + '<span>' + escapeHTML(data.label) + '</span></div>' +
        '<div class="mw-kpi__row">' +
          '<div class="mw-kpi__value">' + (data.valueHTML || (typeof data.value === 'string' && data.value.indexOf('<') >= 0) ? data.value : escapeHTML(data.value)) + '</div>' +
          deltaHTML +
        '</div>' +
        (showSpark ? '<div class="mw-kpi__spark"></div>' : '');
      if (chart) { chart.dispose(); chart = null; }
      if (ro) { ro.disconnect(); ro = null; }
      if (EC && showSpark) {
        var spark = el.querySelector('.mw-kpi__spark');
        chart = EC.init(spark, null, { renderer: 'svg' });
        chart.setOption({
          grid: { top: 2, right: 2, bottom: 2, left: 2 },
          xAxis: { type: 'category', show: false, data: data.sparkline.map(function (_, i) { return i; }) },
          yAxis: { type: 'value', show: false, scale: true },
          series: [{
            type: 'line', smooth: true, symbol: 'none',
            data: data.sparkline,
            lineStyle: { color: c.accent, width: 1.6 },
            areaStyle: {
              color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: c.accent + '55' },
                  { offset: 1, color: c.accent + '00' },
                ] },
            },
          }],
        });
        if (typeof ResizeObserver !== 'undefined') {
          ro = new ResizeObserver(function () { if (chart) chart.resize(); });
          ro.observe(spark);
        }
      }
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
  // Widget: Line Chart
  // ==========================================================
  function lineChart(el, config) {
    return _chartBase(el, config, {
      categories: [], series: [],
      stack: false, area: true,
      yFormatter: null,
      yMin: null, yMax: null,
    }, 'line-chart', function (data, c, palette) {
      var series = data.series.map(function (s, i) {
        var col = s.color || palette[i % palette.length];
        return {
          name: s.name,
          type: 'line',
          stack: data.stack ? 'total' : undefined,
          smooth: 0.3,
          symbol: 'circle',
          symbolSize: 3,
          showSymbol: false,
          emphasis: { focus: 'series', itemStyle: { borderWidth: 2 } },
          data: s.data,
          lineStyle: { color: col, width: 1.5 },
          itemStyle: { color: col, borderColor: c.surface, borderWidth: 1 },
          connectNulls: true,
          areaStyle: data.area ? {
            color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: col + '55' },
                { offset: 1, color: col + '08' },
              ] },
          } : undefined,
        };
      });
      return {
        textStyle: { fontFamily: c.font, color: c.text },
        grid: { top: data.series.length > 1 ? 32 : 14, right: 16, bottom: 28, left: 52 },
        legend: data.series.length > 1 ? {
          top: 0, right: 0,
          textStyle: { color: c.muted, fontFamily: c.font, fontSize: 11 },
          icon: 'circle', itemWidth: 6, itemHeight: 6, itemGap: 14,
          data: data.series.map(function (s) { return s.name; }),
        } : { show: false },
        tooltip: Object.assign({ trigger: 'axis' }, baseTooltip(c),
          data.yFormatter ? { valueFormatter: data.yFormatter } : {}),
        xAxis: {
          type: 'category',
          data: data.categories,
          axisLine: { lineStyle: { color: c.border, width: 1 } },
          axisTick: { show: false },
          axisLabel: { color: c.muted, fontSize: 11, fontFamily: c.font, margin: 10 },
        },
        yAxis: {
          type: 'value',
          min: data.yMin != null ? data.yMin : undefined,
          max: data.yMax != null ? data.yMax : undefined,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: Object.assign({ color: c.muted, fontSize: 10, fontFamily: c.mono, margin: 8 },
            data.yFormatter ? { formatter: data.yFormatter } : {}),
          splitLine: { lineStyle: { color: c.border, type: [4, 4], opacity: 0.6 } },
        },
        series: series,
      };
    });
  }

  // ==========================================================
  // Widget: Bar Chart (horizontal by default)
  // ==========================================================
  function barChart(el, config) {
    return _chartBase(el, config, {
      items: [], horizontal: true,
      categories: [], series: [], stack: false,
      yFormatter: null, showLabels: true,
    }, 'bar-chart', function (data, c, palette) {
      // ── Multi-series mode (categories + series, vertical, optional stack) ──
      if (data.series && data.series.length > 0) {
        var multi = data.series.map(function (s, i) {
          var col = s.color || palette[i % palette.length];
          return {
            name: s.name,
            type: 'bar',
            stack: data.stack ? 'total' : undefined,
            data: s.data,
            barWidth: data.stack ? '54%' : undefined,
            itemStyle: {
              color: col,
              borderRadius: data.stack ? 0 : [3, 3, 0, 0],
            },
            emphasis: { focus: 'series' },
          };
        });
        return {
          textStyle: { fontFamily: c.font, color: c.text },
          grid: { top: data.series.length > 1 ? 32 : 14, right: 16, bottom: 28, left: 52 },
          legend: data.series.length > 1 ? {
            top: 0, right: 0,
            textStyle: { color: c.muted, fontFamily: c.font, fontSize: 11 },
            icon: 'circle', itemWidth: 6, itemHeight: 6, itemGap: 14,
            data: data.series.map(function (s) { return s.name; }),
          } : { show: false },
          tooltip: Object.assign({ trigger: 'axis', axisPointer: { type: 'shadow' } },
            baseTooltip(c), data.yFormatter ? { valueFormatter: data.yFormatter } : {}),
          xAxis: {
            type: 'category', data: data.categories,
            axisLine: { lineStyle: { color: c.border, width: 1 } }, axisTick: { show: false },
            axisLabel: { color: c.muted, fontSize: 11, fontFamily: c.font, margin: 10 },
          },
          yAxis: {
            type: 'value',
            axisLine: { show: false }, axisTick: { show: false },
            axisLabel: Object.assign(
              { color: c.muted, fontSize: 10, fontFamily: c.mono, margin: 8 },
              data.yFormatter ? { formatter: data.yFormatter } : {}
            ),
            splitLine: { lineStyle: { color: c.border, type: [4, 4], opacity: 0.6 } },
          },
          series: multi,
        };
      }
      // ── Single-series mode (items, horizontal/vertical) ──
      var labels = data.items.map(function (i) { return i.label; });
      var values = data.items.map(function (i) { return i.value; });
      var tipFmt = data.yFormatter || undefined;
      if (data.horizontal) {
        return {
          textStyle: { fontFamily: c.font, color: c.text },
          grid: { top: 8, right: data.showLabels ? 72 : 14, bottom: 8, left: 8, containLabel: true },
          tooltip: Object.assign({ trigger: 'axis', axisPointer: { type: 'shadow' } },
            baseTooltip(c), tipFmt ? { valueFormatter: tipFmt } : {}),
          xAxis: { type: 'value', show: false },
          yAxis: {
            type: 'category',
            data: labels.slice().reverse(),
            axisLine: { show: false }, axisTick: { show: false },
            axisLabel: { color: c.text, fontFamily: c.font, fontSize: 12, margin: 10 },
          },
          series: [{
            type: 'bar',
            data: values.slice().reverse(),
            barWidth: '58%',
            itemStyle: { color: c.accent, borderRadius: [0, 4, 4, 0] },
            label: data.showLabels ? {
              show: true, position: 'right',
              color: c.muted, fontFamily: c.font, fontSize: 11,
              formatter: function (p) { return tipFmt ? tipFmt(p.value) : safeNum(p.value); },
            } : { show: false },
          }],
        };
      }
      return {
        textStyle: { fontFamily: c.font, color: c.text },
        grid: { top: 14, right: 14, bottom: 28, left: 54 },
        tooltip: Object.assign({ trigger: 'axis', axisPointer: { type: 'shadow' } },
          baseTooltip(c), tipFmt ? { valueFormatter: tipFmt } : {}),
        xAxis: {
          type: 'category', data: labels,
          axisLine: { lineStyle: { color: c.border, width: 1 } }, axisTick: { show: false },
          axisLabel: { color: c.muted, fontSize: 11, fontFamily: c.font, margin: 10 },
        },
        yAxis: {
          type: 'value',
          axisLine: { show: false }, axisTick: { show: false },
          axisLabel: Object.assign({ color: c.muted, fontSize: 10, fontFamily: c.mono, margin: 8 }, tipFmt ? { formatter: tipFmt } : {}),
          splitLine: { lineStyle: { color: c.border, type: [4, 4], opacity: 0.6 } },
        },
        series: [{
          type: 'bar', data: values, barWidth: '50%',
          itemStyle: { color: c.accent, borderRadius: [4, 4, 0, 0] },
        }],
      };
    });
  }

  // ==========================================================
  // Widget: Funnel
  // ==========================================================
  function funnelChart(el, config) {
    return _chartBase(el, config, {
      stages: [], valueSuffix: '',
    }, 'funnel-chart', function (data, c) {
      var palette = [c.accent, c.accent2, c.warning, c.success, c.danger];
      return {
        textStyle: { fontFamily: c.font },
        tooltip: Object.assign({}, baseTooltip(c), {
          formatter: function (p) { return escapeHTML(p.name) + ': ' + safeNum(p.value) + (data.valueSuffix || ''); }
        }),
        series: [{
          type: 'funnel',
          left: '6%', right: '6%', top: 6, bottom: 6,
          min: 0, sort: 'descending', gap: 3,
          label: { show: true, position: 'inside', color: '#fff',
                   fontFamily: c.font, fontSize: 11, fontWeight: 500 },
          labelLine: { show: false },
          data: data.stages.map(function (s, i) {
            return {
              name: s.label, value: s.value,
              itemStyle: { color: palette[i % palette.length], borderColor: c.surface, borderWidth: 1 },
            };
          }),
        }],
      };
    });
  }

  // ==========================================================
  // Widget: Donut
  // ==========================================================
  function donutChart(el, config) {
    return _chartBase(el, config, {
      slices: [],
      centerLabel: '합계', centerValue: null,
    }, 'donut-chart', function (data, c, palette) {
      var total = data.slices.reduce(function (s, x) { return s + (x.value || 0); }, 0);
      // Auto-normalize: if slices look like percentages but don't sum to 100, fix them
      if (total > 0 && total !== 100 && data.slices.every(function(s) { return s.value <= 100; }) && total > 80 && total < 120) {
        var factor = 100 / total;
        data.slices.forEach(function(s) { s.value = Math.round(s.value * factor * 10) / 10; });
        total = 100;
      }
      var centerVal = data.centerValue != null ? data.centerValue : safeNum(total);
      return {
        textStyle: { fontFamily: c.font },
        tooltip: baseTooltip(c),
        legend: {
          orient: 'vertical', right: 12, top: 'middle',
          textStyle: { color: c.muted, fontFamily: c.font, fontSize: 11 },
          icon: 'circle', itemWidth: 6, itemHeight: 6, itemGap: 14, itemGap: 10,
          type: 'scroll',
        },
        series: [{
          type: 'pie',
          radius: ['44%', '64%'],
          center: ['30%', '50%'],
          avoidLabelOverlap: false,
          label: {
            show: true, position: 'center',
            formatter: '{n|' + centerVal + '}\n{l|' + data.centerLabel + '}',
            rich: {
              n: { fontSize: 18, fontWeight: 600, color: c.text, lineHeight: 22, fontFamily: c.font },
              l: { fontSize: 11, color: c.muted, fontFamily: c.font },
            },
          },
          labelLine: { show: false },
          data: data.slices.map(function (s, i) {
            return {
              name: s.label, value: s.value,
              itemStyle: { color: s.color || palette[i % palette.length], borderColor: c.surface, borderWidth: 2 },
            };
          }),
        }],
      };
    });
  }

  // ==========================================================
  // Widget: Leaderboard (HTML, no chart)
  // ==========================================================
  function leaderboard(el, config) {
    el = q(el);
    if (!el) return null;
    var data = Object.assign({ title: '', subtitle: '', items: [] }, config || {});

    function render() {
      el.classList.add('mw-card');
      var list = (data.items || []).slice(0, 100).map(function (it, i) {
        var initial = it.initial || (it.name ? it.name.charAt(0) : '');
        var meta = it.meta != null ? it.meta : (it.percent + '%');
        return '' +
          '<div class="mw-lb__item">' +
            '<div class="mw-avatar ' + (i === 0 ? 'mw-avatar--top' : '') + '">' + escapeHTML(initial) + '</div>' +
            '<div class="mw-lb__body">' +
              '<div class="mw-lb__top">' +
                '<div class="mw-lb__name">' + escapeHTML(it.name || '') + '</div>' +
                '<div class="mw-lb__meta">' + escapeHTML(meta) + '</div>' +
              '</div>' +
              '<div class="mw-progress mw-lb__progress">' +
                '<div class="mw-progress__fill" style="width:' + (it.percent || 0) + '%"></div>' +
              '</div>' +
            '</div>' +
          '</div>';
      }).join('');
      el.innerHTML = headerHTML(data.title, data.subtitle) + '<div class="mw-lb__list">' + list + '</div>';
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
    }, config || {});

    function alignCls(align) {
      if (align === 'right')  return ' class="mw-table__right"';
      if (align === 'center') return ' class="mw-table__center"';
      return '';
    }

    function render() {
      el.classList.add('mw-card');
      var rightEl = data.live
        ? '<span class="mw-badge mw-badge--muted"><span class="mw-live-dot" style="margin:0 0.25rem 0 0"></span>LIVE</span>'
        : '';
      var colgroup = '';
      if (data.columns.some(function (c) { return c.width; })) {
        colgroup = '<colgroup>' + data.columns.map(function (col) {
          return '<col' + (col.width ? ' style="width:' + col.width + '"' : '') + '>';
        }).join('') + '</colgroup>';
      }
      var ths = data.columns.map(function (col) {
        return '<th' + alignCls(col.align) + '>' + escapeHTML(col.label) + '</th>';
      }).join('');
      var theadHtml;
      if (data.headerGroups && data.headerGroups.length) {
        var groupRow = data.headerGroups.map(function (g) {
          var cls = (g.align === 'right' ? 'mw-table__right ' : g.align === 'center' ? 'mw-table__center ' : '') + 'mw-table__group';
          return '<th class="' + cls + '" colspan="' + (g.span || 1) + '">' + escapeHTML(g.label) + '</th>';
        }).join('');
        theadHtml = '<thead><tr class="mw-table__group-row">' + groupRow + '</tr><tr>' + ths + '</tr></thead>';
      } else {
        theadHtml = '<thead><tr>' + ths + '</tr></thead>';
      }
      var trs = (data.rows || []).slice(0, 100).map(function (row) {
        var tds = data.columns.map(function (col) {
          var v = row[col.key];
          var content;
          if (typeof col.render === 'function') {
            try { content = col.render(v, row); } catch (e) { content = v == null ? '' : escapeHTML(v); }
          } else content = v == null ? '' : escapeHTML(v);
          return '<td' + alignCls(col.align) + '>' + content + '</td>';
        }).join('');
        return '<tr>' + tds + '</tr>';
      }).join('');
      var tableStyle = data.fixedLayout ? ' style="table-layout:fixed"' : '';
      el.innerHTML = headerHTML(data.title, data.subtitle, rightEl) +
        '<div class="mw-table__wrap"><table class="mw-table"' + tableStyle + '>' +
        colgroup + theadHtml + '<tbody>' + trs + '</tbody></table></div>';
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
  // Widget: Heatmap Chart (day × hour, calendar grid, etc.)
  // ==========================================================
  function heatmapChart(el, config) {
    return _chartBase(el, config, {
      xAxis: [], yAxis: [],
      values: null, matrix: null,
      max: null,
      tooltipFormatter: null,
    }, 'heatmap-chart', function (data, c) {
      var flat;
      if (data.matrix) {
        flat = [];
        data.matrix.forEach(function (row, yi) {
          row.forEach(function (v, xi) { flat.push([xi, yi, v]); });
        });
      } else {
        flat = data.values || [];
      }
      var maxVal = data.max != null ? data.max : flat.reduce(function (m, v) {
        return Math.max(m, v[2] || 0);
      }, 1);
      return {
        textStyle: { fontFamily: c.font, color: c.text },
        grid: { top: 14, right: 18, bottom: 22, left: 48 },
        tooltip: Object.assign({
          position: 'top',
          formatter: data.tooltipFormatter || function (p) {
            var vf = data.valueFormatter || safeNum;
            return (data.yAxis[p.value[1]] || '') + ' · ' + (data.xAxis[p.value[0]] || '') +
              ' = <b>' + vf(p.value[2]) + (data.valueSuffix || '') + '</b>';
          }
        }, baseTooltip(c)),
        xAxis: {
          type: 'category', data: data.xAxis,
          splitArea: { show: false },
          axisLine: { show: false }, axisTick: { show: false },
          axisLabel: { color: c.muted, fontSize: 10, interval: 1 },
        },
        yAxis: {
          type: 'category', data: data.yAxis,
          splitArea: { show: false },
          axisLine: { show: false }, axisTick: { show: false },
          axisLabel: { color: c.muted, fontSize: 11 },
        },
        visualMap: {
          min: 0, max: maxVal, calculable: false, show: false,
          inRange: { color: [c.surface2, c.accent] }
        },
        series: [{
          type: 'heatmap', data: flat,
          label: { show: false },
          itemStyle: { borderColor: c.surface, borderWidth: 2, borderRadius: 2 },
          emphasis: { itemStyle: { borderColor: c.text, borderWidth: 1 } }
        }]
      };
    });
  }

  // ==========================================================
  // Widget: Gauge Chart
  // ==========================================================
  function gaugeChart(el, config) {
    return _chartBase(el, config, {
      label: '', value: 0, max: 100, unit: '%',
      thresholds: null,
    }, 'gauge-chart', function (data, c, _palette, size) {
      var ratio = data.max > 0 ? Math.min(1, Math.max(0, data.value / data.max)) : 0;
      var gaugeColor = c.accent;
      if (data.thresholds) {
        for (var i = 0; i < data.thresholds.length; i++) {
          if (ratio <= data.thresholds[i][0]) {
            var key = data.thresholds[i][1];
            gaugeColor = key === 'good'    ? c.success :
                         key === 'warning' ? c.warning :
                         key === 'danger'  ? c.danger  : c.accent;
            break;
          }
        }
      }
      // Size-aware rendering — gauge needs different proportions at different heights.
      var h = (size && size.height) || 260;
      var w = (size && size.width)  || 320;
      var minDim = Math.min(w, h * 2);
      var compact = h < 200;
      var fmtVal = typeof data.valueFormatter === 'function' ? data.valueFormatter(data.value)
        : (data.unit || '') === '원' ? fmt.krwPlain(data.value)
        : safeNum(data.value) + (data.unit || '');
      var valueText = fmtVal;
      var textLen = valueText.length;
      var sizeByContainer = minDim * 0.12;
      var sizeByText = textLen > 3 ? sizeByContainer * (3.2 / textLen) : sizeByContainer;
      var valueFontSize = Math.round(Math.max(14, Math.min(36, Math.min(sizeByContainer, sizeByText * 1.3))));
      var titleFontSize = Math.round(Math.max(9, Math.min(14, minDim * 0.045)));
      var ringWidth = Math.max(6, Math.round(minDim * 0.035));
      var radius = compact ? '80%' : '92%';
      var centerY = compact ? '58%' : '62%';
      return {
        textStyle: { fontFamily: c.font },
        series: [{
          type: 'gauge',
          radius: radius,
          center: ['50%', centerY],
          startAngle: 210, endAngle: -30,
          min: 0, max: data.max,
          splitNumber: 5,
          progress: { show: true, width: ringWidth, itemStyle: { color: gaugeColor } },
          axisLine: { lineStyle: { width: ringWidth, color: [[1, c.surface2]] } },
          pointer: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: !compact, distance: -18, color: c.muted, fontSize: 9, fontFamily: c.font },
          anchor: { show: false },
          title: {
            show: !!data.label && !compact,
            offsetCenter: [0, '34%'],
            color: c.muted, fontSize: titleFontSize, fontFamily: c.font,
          },
          detail: {
            valueAnimation: true,
            offsetCenter: [0, compact ? '10%' : '-2%'],
            color: c.text, fontSize: valueFontSize, fontWeight: 'bold', fontFamily: c.font,
            formatter: function () { return fmtVal; },
          },
          data: [{ value: data.value, name: data.label }]
        }]
      };
    });
  }

  // ==========================================================
  // Widget: Radar Chart
  // ==========================================================
  function radarChart(el, config) {
    return _chartBase(el, config, {
      indicators: [], series: [],
    }, 'radar-chart', function (data, c, palette) {
      return {
        textStyle: { fontFamily: c.font, color: c.text },
        tooltip: baseTooltip(c),
        legend: data.series.length > 1 ? {
          bottom: 0, left: 'center',
          textStyle: { color: c.muted, fontFamily: c.font, fontSize: 11 },
          icon: 'circle', itemWidth: 6, itemHeight: 6, itemGap: 14,
        } : { show: false },
        radar: {
          indicator: data.indicators,
          center: ['50%', '48%'],
          radius: '60%',
          axisName: { color: c.muted, fontSize: 10, fontFamily: c.font },
          splitLine: { lineStyle: { color: c.border, type: [4, 4], opacity: 0.5 } },
          splitArea: { show: false },
          axisLine: { lineStyle: { color: c.border, opacity: 0.5 } },
        },
        series: [{
          type: 'radar',
          data: data.series.map(function (s, i) {
            var col = s.color || palette[i % palette.length];
            return {
              name: s.name,
              value: s.data,
              areaStyle: { color: col + '22' },
              lineStyle: { color: col, width: 1.5 },
              itemStyle: { color: col },
              symbolSize: 3,
            };
          }),
        }]
      };
    });
  }

  // ==========================================================
  // Widget: Treemap Chart
  // ==========================================================
  function treemapChart(el, config) {
    return _chartBase(el, config, {
      items: [], valueFormatter: null,
    }, 'treemap-chart', function (data, c, palette) {
      var radiusN = parseInt(c.radius) || 0;
      return {
        textStyle: { fontFamily: c.font },
        tooltip: Object.assign({
          formatter: function (p) {
            var v = data.valueFormatter ? data.valueFormatter(p.value) : safeNum(p.value);
            return '<b>' + p.name + '</b>: ' + v;
          }
        }, baseTooltip(c)),
        series: [{
          type: 'treemap',
          roam: false, nodeClick: false,
          breadcrumb: { show: false },
          width: '100%', height: '100%',
          label: {
            show: true,
            formatter: '{b}',
            color: '#fff',
            fontFamily: c.font,
            fontSize: 11, fontWeight: 500,
            overflow: 'truncate',
          },
          upperLabel: { show: false },
          itemStyle: { borderColor: c.surface, borderWidth: 2, gapWidth: 2 },
          levels: [{
            colorMappingBy: 'index',
            color: palette,
            itemStyle: { borderRadius: radiusN },
          }],
          data: data.items.map(function (it) { return { name: it.name, value: it.value }; }),
        }]
      };
    });
  }

  // ==========================================================
  // Widget: Scatter Chart (with optional bubble size)
  // ==========================================================
  function scatterChart(el, config) {
    return _chartBase(el, config, {
      points: [], series: null,
      xLabel: '', yLabel: '',
      showLabels: true,
    }, 'scatter-chart', function (data, c, palette) {
      function mkSeries(name, points, color) {
        return {
          name: name,
          type: 'scatter',
          data: points.map(function (p) {
            return [p.x, p.y, p.label || '', p.size || 14];
          }),
          symbolSize: function (val) { return val[3] || 14; },
          itemStyle: { color: color, opacity: 0.78, borderColor: c.surface, borderWidth: 1 },
          emphasis: { itemStyle: { opacity: 1, borderColor: c.text } },
          label: data.showLabels ? {
            show: true, position: 'top',
            color: c.muted, fontFamily: c.font, fontSize: 10,
            formatter: function (p) { return p.data[2]; },
          } : { show: false },
        };
      }
      var series;
      if (data.series && data.series.length) {
        series = data.series.map(function (s, i) {
          return mkSeries(s.name, s.points, s.color || palette[i % palette.length]);
        });
      } else {
        series = [mkSeries('', data.points, c.accent)];
      }
      return {
        textStyle: { fontFamily: c.font, color: c.text },
        grid: { top: 20, right: 20, bottom: 50, left: 62 },
        tooltip: Object.assign({
          trigger: 'item',
          formatter: function (p) {
            var label = p.data[2] ? '<b>' + escapeHTML(p.data[2]) + '</b><br>' : '';
            return label + (data.xLabel || 'X') + ': ' + safeNum(p.data[0]) + '<br>' +
                   (data.yLabel || 'Y') + ': ' + safeNum(p.data[1]);
          },
        }, baseTooltip(c)),
        legend: data.series && data.series.length > 1 ? {
          top: 0, right: 0,
          textStyle: { color: c.muted, fontFamily: c.font, fontSize: 11 },
          icon: 'circle', itemWidth: 6, itemHeight: 6, itemGap: 14,
        } : { show: false },
        xAxis: {
          type: 'value',
          name: data.xLabel, nameLocation: 'middle', nameGap: 28,
          nameTextStyle: { color: c.muted, fontSize: 11 },
          axisLine: { lineStyle: { color: c.border } },
          axisTick: { show: false },
          axisLabel: { color: c.muted, fontSize: 11 },
          splitLine: { lineStyle: { color: c.border, type: 'dashed' } },
        },
        yAxis: {
          type: 'value',
          name: data.yLabel, nameLocation: 'middle', nameGap: 44,
          nameTextStyle: { color: c.muted, fontSize: 11 },
          axisLine: { show: false }, axisTick: { show: false },
          axisLabel: { color: c.muted, fontSize: 11 },
          splitLine: { lineStyle: { color: c.border, type: 'dashed' } },
        },
        series: series,
      };
    });
  }

  // ==========================================================
  // Widget: Sankey Chart (flow diagram)
  // ==========================================================
  function sankeyChart(el, config) {
    return _chartBase(el, config, {
      nodes: [], links: [],
      valueFormatter: null,
    }, 'sankey-chart', function (data, c) {
      var palette = [c.accent, c.accent2, c.success, c.warning, c.danger, c.muted];
      return {
        textStyle: { fontFamily: c.font, color: c.text },
        tooltip: Object.assign({
          trigger: 'item',
          formatter: function (p) {
            if (p.dataType === 'edge') {
              var v = data.valueFormatter ? data.valueFormatter(p.value) : safeNum(p.value);
              return p.data.source + ' → ' + p.data.target + ': <b>' + v + '</b>';
            }
            return '<b>' + p.name + '</b>';
          }
        }, baseTooltip(c)),
        series: [{
          type: 'sankey',
          left: '4%', right: '12%', top: 10, bottom: 10,
          data: data.nodes.map(function (n, i) {
            return {
              name: n.name,
              itemStyle: { color: n.color || palette[i % palette.length] }
            };
          }),
          links: data.links,
          lineStyle: { color: 'gradient', curveness: 0.5, opacity: 0.42 },
          label: { color: c.text, fontFamily: c.font, fontSize: 11 },
          emphasis: { focus: 'adjacency', lineStyle: { opacity: 0.7 } },
          nodeGap: 10, nodeWidth: 12,
        }]
      };
    });
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
      el.classList.add('mw-card', 'mw-hero');
      var statsHTML = '';
      if (data.stats && data.stats.length) {
        statsHTML = '<div class="mw-hero__divider"></div><div class="mw-hero__stats">';
        data.stats.forEach(function(s, i) {
          if (i > 0) statsHTML += '<div class="mw-hero__stat-sep"></div>';
          statsHTML +=
            '<div class="mw-hero__stat">' +
              '<div class="mw-hero__stat-label">' + escapeHTML(s.label) + '</div>' +
              '<div class="mw-hero__stat-value">' + _valOrEsc(s.value) + '</div>' +
            '</div>';
        });
        statsHTML += '</div>';
      }
      el.innerHTML =
        '<div class="mw-hero__kicker">' + escapeHTML(data.kicker) + '</div>' +
        '<div class="mw-hero__value">' + (data.valueHTML ? data.value : escapeHTML(data.value)) + '</div>' +
        (data.tagline ? '<div class="mw-hero__tagline">' + escapeHTML(data.tagline) + '</div>' : '') +
        statsHTML;
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
  // Widget: Metric Chart — hero number + labeled mini chart
  // ==========================================================
  function metricChart(el, config) {
    el = q(el);
    if (!el) return null;
    var data = Object.assign({
      label: '', value: '', icon: '', context: '', unit: '',
      delta: null, deltaGoodWhen: 'positive',
      categories: [], series: [], target: null, yFormatter: null,
    }, config || {});
    // Auto-derive: series[0].data → value, delta
    var seriesData = data.series && data.series[0] && data.series[0].data;
    _autoDerive(data, {
      arr: seriesData,
      valueFmt: typeof data.yFormatter === 'function' ? data.yFormatter : null,
    });
    _autoValueHTML(data);
    var chart = null;
    var ro = null;

    function fmt(v) {
      return typeof data.yFormatter === 'function' ? data.yFormatter(v) : v;
    }

    function render() {
      var c = getColors();
      el.classList.add('mw-card', 'mw-mchrt');
      var deltaHTML = '';
      if (data.delta != null && !isNaN(data.delta)) {
        var goodWhenNeg = data.deltaGoodWhen === 'negative';
        var good = goodWhenNeg ? data.delta < 0 : data.delta > 0;
        var arrow = data.delta >= 0 ? '▲' : '▼';
        deltaHTML = '<span class="mw-mchrt__delta mw-mchrt__delta--' + (good ? 'good' : 'bad') + '">' +
          arrow + ' ' + Math.abs(Number(data.delta)).toFixed(1) + '%</span>';
      }
      var legendHTML = '';
      if (data.series && data.series.length) {
        legendHTML = '<div class="mw-mchrt__legend">';
        if (data.series[0]) legendHTML += '<span class="mw-mchrt__leg mw-mchrt__leg--a">' + escapeHTML(data.series[0].name || '이번달') + '</span>';
        if (data.series[1]) legendHTML += '<span class="mw-mchrt__leg mw-mchrt__leg--b">' + escapeHTML(data.series[1].name || '지난달') + '</span>';
        legendHTML += '</div>';
      }
      el.innerHTML =
        (data.icon ? '<div class="mw-mchrt__watermark">' + escapeHTML(data.icon) + '</div>' : '') +
        '<div class="mw-mchrt__head">' +
          '<div class="mw-mchrt__top">' +
            '<div class="mw-mchrt__label-group">' +
              (data.icon ? '<span class="mw-mchrt__icon">' + escapeHTML(data.icon) + '</span>' : '') +
              '<span class="mw-mchrt__label">' + escapeHTML(data.label) + '</span>' +
            '</div>' +
            legendHTML +
          '</div>' +
          '<div class="mw-mchrt__value">' + (data.valueHTML || (typeof data.value === 'string' && data.value.indexOf('<') >= 0) ? data.value : escapeHTML(data.value)) + '</div>' +
          '<div class="mw-mchrt__meta">' +
            (deltaHTML || '') +
            (data.context ? '<span class="mw-mchrt__context">' + escapeHTML(data.context) + '</span>' : '') +
          '</div>' +
        '</div>' +
        '<div class="mw-mchrt__chart"></div>';

      if (chart) { chart.dispose(); chart = null; }
      if (ro) { ro.disconnect(); ro = null; }
      if (!EC || !data.series || !data.series.length || !data.categories || !data.categories.length) return;

      var chartEl = el.querySelector('.mw-mchrt__chart');
      chart = EC.init(chartEl, null, { renderer: 'svg' });
      var series = [];

      if (data.series[1] && data.series[1].data) {
        series.push({
          type: 'line', smooth: 0.4, symbol: 'none', z: 1,
          name: data.series[1].name || '지난달',
          data: data.series[1].data,
          lineStyle: { color: c.muted, width: 1.5, type: 'dashed' },
        });
      }

      var cur = data.series[0] || { data: [], name: '' };
      var lastIdx = (cur.data || []).length - 1;
      series.push({
        type: 'line', smooth: 0.4, symbol: 'none', z: 2,
        name: cur.name || '이번달',
        data: cur.data,
        lineStyle: { color: c.accent, width: 2.5 },
        areaStyle: {
          color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: c.accent + '44' },
              { offset: 1, color: c.accent + '06' },
            ] },
        },
        markPoint: lastIdx >= 0 ? {
          symbol: 'circle', symbolSize: 7,
          data: [{ coord: [lastIdx, cur.data[lastIdx]] }],
          itemStyle: { color: c.accent, borderColor: c.surface, borderWidth: 2 },
          label: { show: false },
        } : undefined,
        markLine: data.target != null ? {
          silent: true, symbol: 'none', z: 5,
          lineStyle: { color: c.accent, type: 'dashed', width: 1.5, opacity: 0.45 },
          label: {
            show: true, position: 'insideEndTop',
            fontSize: 10, fontWeight: 600, color: c.accent, opacity: 0.75,
            formatter: '목표',
          },
          data: [{ yAxis: data.target }],
        } : undefined,
      });

      chart.setOption({
        grid: { top: 16, right: 56, bottom: 32, left: 20 },
        tooltip: Object.assign(baseTooltip(c), {
          trigger: 'axis',
          formatter: function(params) {
            var html = '<div style="font-weight:600;margin-bottom:4px">' + escapeHTML(params[0].axisValueLabel) + '</div>';
            params.forEach(function(p) { html += '<div>' + p.marker + ' ' + fmt(p.value) + '</div>'; });
            return html;
          },
        }),
        xAxis: {
          type: 'category', data: data.categories, boundaryGap: false,
          axisLabel: { fontSize: 10, color: c.muted, margin: 10 },
          axisTick: { show: false },
          axisLine: { lineStyle: { color: c.border } },
        },
        yAxis: {
          type: 'value', position: 'right', splitNumber: 3,
          scale: true,
          axisLabel: { fontSize: 9, color: c.muted, formatter: function(v) { return fmt(v); }, margin: 8 },
          splitLine: { lineStyle: { color: c.border, type: 'dashed', opacity: 0.4 } },
          axisTick: { show: false }, axisLine: { show: false },
        },
        series: series,
      });

      if (typeof ResizeObserver !== 'undefined') {
        ro = new ResizeObserver(function() { if (chart) chart.resize(); });
        ro.observe(chartEl);
      }
    }

    render();
    var handle = {
      el: el, type: 'metric-chart',
      refresh: render,
      update: function(newData) { data = Object.assign(data, newData || {}); render(); },
      destroy: function() {
        if (ro) ro.disconnect();
        if (chart) chart.dispose();
        el.innerHTML = '';
        registry.delete(handle);
      },
    };
    return register(handle);
  }

  // ==========================================================
  // Widget: Ring Progress (full circular progress with center value)
  // ==========================================================
  function ringProgress(el, config) {
    return _chartBase(el, config, {
      value: 0, max: 100, unit: '%',
      label: '', context: '',
      thresholds: null,
    }, 'ring-progress', function (data, c) {
      var fmtVal = typeof data.valueFormatter === 'function' ? data.valueFormatter(data.value)
        : (data.unit || '') === '원' ? fmt.krwPlain(data.value)
        : safeNum(data.value) + (data.unit || '');
      var ratio = data.max > 0 ? Math.min(1, Math.max(0, data.value / data.max)) : 0;
      var ringColor = c.accent;
      if (data.thresholds) {
        for (var i = 0; i < data.thresholds.length; i++) {
          if (ratio <= data.thresholds[i][0]) {
            var key = data.thresholds[i][1];
            ringColor = key === 'good'    ? c.success :
                         key === 'warning' ? c.warning :
                         key === 'danger'  ? c.danger  : c.accent;
            break;
          }
        }
      }
      return {
        textStyle: { fontFamily: c.font },
        series: [{
          type: 'gauge',
          radius: '92%',
          center: ['50%', '52%'],
          startAngle: 90, endAngle: -270,
          min: 0, max: data.max,
          progress: { show: true, width: 14, roundCap: true, itemStyle: { color: ringColor } },
          axisLine: { roundCap: true, lineStyle: { width: 14, color: [[1, c.surface2]] } },
          pointer: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          anchor: { show: false },
          title: {
            show: !!data.label,
            offsetCenter: [0, '26%'],
            color: c.muted, fontSize: 11, fontFamily: c.font,
          },
          detail: {
            valueAnimation: true,
            offsetCenter: [0, '-4%'],
            color: c.text, fontSize: 30, fontWeight: 700, fontFamily: c.font,
            formatter: function () { return fmtVal; },
          },
          data: [{ value: data.value, name: data.label }],
        }],
      };
    }, function (data) {
      return data.context ? '<div class="mw-ring__context">' + escapeHTML(data.context) + '</div>' : '';
    });
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
      el.classList.add('mw-card');
      var items = (data.items || []).slice(0, 100).map(function (it) {
        var dotCls = 'mw-timeline__dot' + (it.type ? ' mw-timeline__dot--' + it.type : '');
        return '<div class="mw-timeline__item">' +
          '<div class="mw-timeline__marker">' +
            '<div class="' + dotCls + '"></div>' +
            '<div class="mw-timeline__line"></div>' +
          '</div>' +
          '<div class="mw-timeline__body">' +
            '<div class="mw-timeline__time">' + escapeHTML(it.time || '') + '</div>' +
            '<div class="mw-timeline__text">' + (it.html || escapeHTML(it.text || '')) + '</div>' +
          '</div>' +
        '</div>';
      }).join('');
      el.innerHTML = headerHTML(data.title, data.subtitle) +
        '<div class="mw-timeline">' + items + '</div>';
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
      el.classList.add('mw-card');
      var items = (data.items || []).slice(0, 100).map(function (it) {
        var statusCls = 'mw-status__dot--' + (it.status || 'ok');
        return '<div class="mw-status__item">' +
          '<span class="mw-status__dot ' + statusCls + '"></span>' +
          '<span class="mw-status__label">' + escapeHTML(it.label) + '</span>' +
          (it.value ? '<span class="mw-status__value">' + escapeHTML(it.value) + '</span>' : '') +
        '</div>';
      }).join('');
      el.innerHTML = headerHTML(data.title, data.subtitle) +
        '<div class="mw-status" style="grid-template-columns: repeat(' + data.columns + ', minmax(0, 1fr));">' + items + '</div>';
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
      el.classList.add('mw-card', 'mw-countdown');
      var parts = getParts();
      var body = '';
      if (parts) {
        body = '<div class="mw-countdown__body">' +
          '<div class="mw-countdown__unit"><span class="mw-countdown__num">' + parts.days + '</span><span class="mw-countdown__lbl">days</span></div>' +
          '<div class="mw-countdown__unit"><span class="mw-countdown__num">' + String(parts.hours).padStart(2, '0') + '</span><span class="mw-countdown__lbl">hrs</span></div>' +
          '<div class="mw-countdown__unit"><span class="mw-countdown__num">' + String(parts.mins).padStart(2, '0') + '</span><span class="mw-countdown__lbl">min</span></div>' +
        '</div>';
      }
      el.innerHTML = headerHTML(data.title, data.subtitle) +
        (data.label ? '<div class="mw-countdown__label">' + escapeHTML(data.label) + '</div>' : '') +
        body +
        (data.context ? '<div class="mw-countdown__context">' + escapeHTML(data.context) + '</div>' : '');
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
      el.classList.add('mw-card', 'mw-mstack');
      var main = data.main || {};
      var mainDelta = '';
      if (main.delta != null && !isNaN(main.delta)) {
        var goodWhenNeg = main.deltaGoodWhen === 'negative';
        var good = goodWhenNeg ? main.delta < 0 : main.delta > 0;
        mainDelta = '<span class="mw-mstack__delta mw-mstack__delta--' + (good ? 'good' : 'bad') + '">' +
          (main.delta >= 0 ? '▲' : '▼') + ' ' + Math.abs(Number(main.delta)).toFixed(1) + '%</span>';
      }
      var subItems = data.items.map(function (it) {
        return '<div class="mw-mstack__sub">' +
          '<div class="mw-mstack__sub-val">' + _valOrEsc(it.value) + '</div>' +
          '<div class="mw-mstack__sub-lbl">' + escapeHTML(it.label) + '</div>' +
        '</div>';
      }).join('');
      el.innerHTML =
        (data.title ? '<div class="mw-mstack__title">' + escapeHTML(data.title) + '</div>' : '') +
        '<div class="mw-mstack__main-row">' +
          '<div class="mw-mstack__main-val">' + _valOrEsc(main.value) + '</div>' +
          mainDelta +
        '</div>' +
        '<div class="mw-mstack__main-lbl">' + escapeHTML(main.label || '') + '</div>' +
        (subItems ? '<div class="mw-mstack__sub-row">' + subItems + '</div>' : '');
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
      el.classList.add('mw-card');
      var items = (data.items || []).slice(0, 100).map(function (it) {
        var iconCls = 'mw-inbox__icon' + (it.type ? ' mw-inbox__icon--' + it.type : '');
        return '<div class="mw-inbox__item">' +
          '<div class="' + iconCls + '">' + (it.icon || '•') + '</div>' +
          '<div class="mw-inbox__body">' +
            '<div class="mw-inbox__text">' + (it.html || escapeHTML(it.text || '')) + '</div>' +
          '</div>' +
          '<div class="mw-inbox__time">' + escapeHTML(it.time || '') + '</div>' +
        '</div>';
      }).join('');
      el.innerHTML = headerHTML(data.title, data.subtitle) +
        '<div class="mw-inbox">' + items + '</div>';
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
      el.classList.add('mw-card', 'mw-compare');
      var deltaHTML = '';
      if (data.delta != null) {
        var isNum = typeof data.delta === 'number';
        var goodWhenNeg = data.deltaGoodWhen === 'negative';
        var good = isNum ? (goodWhenNeg ? data.delta < 0 : data.delta > 0) : true;
        var arrow = isNum ? (data.delta >= 0 ? '▲' : '▼') : '→';
        var deltaStr = isNum ? Math.abs(data.delta).toFixed(1) + '%' : escapeHTML(String(data.delta));
        deltaHTML = '<div class="mw-compare__delta mw-compare__delta--' + (good ? 'good' : 'bad') + '">' +
          arrow + ' ' + deltaStr +
          (data.deltaLabel ? ' <span class="mw-compare__delta-lbl">' + escapeHTML(data.deltaLabel) + '</span>' : '') +
        '</div>';
      }
      el.innerHTML = headerHTML(data.title, data.subtitle) +
        '<div class="mw-compare__row">' +
          '<div class="mw-compare__side">' +
            '<div class="mw-compare__lbl">' + escapeHTML(data.left.label || '') + '</div>' +
            '<div class="mw-compare__val">' + _valOrEsc(data.left.value) + '</div>' +
          '</div>' +
          '<div class="mw-compare__sep">→</div>' +
          '<div class="mw-compare__side mw-compare__side--current">' +
            '<div class="mw-compare__lbl">' + escapeHTML(data.right.label || '') + '</div>' +
            '<div class="mw-compare__val">' + _valOrEsc(data.right.value) + '</div>' +
          '</div>' +
        '</div>' +
        deltaHTML;
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
  // Widget: Calendar Heatmap (GitHub contribution-style)
  // ==========================================================
  function calendarHeatmap(el, config) {
    var now = new Date();
    return _chartBase(el, config, {
      year: now.getFullYear(),
      range: null,
      values: [],
      max: null,
      height: 180,
      cellSize: 14,
      tooltipFormatter: null,
      valueSuffix: '',
    }, 'calendar-heatmap', function (data, c) {
      var range = data.range || String(data.year);
      var maxVal = data.max != null ? data.max : (data.values || []).reduce(function (m, v) {
        return Math.max(m, (v && v[1]) || 0);
      }, 1);
      return {
        textStyle: { fontFamily: c.font, color: c.text },
        tooltip: Object.assign({
          formatter: data.tooltipFormatter || function (p) {
            var vf = data.valueFormatter || safeNum;
            return p.value[0] + ' · <b>' + vf(p.value[1] || 0) + (data.valueSuffix || '') + '</b>';
          }
        }, baseTooltip(c)),
        visualMap: {
          min: 0, max: maxVal, show: false,
          inRange: { color: [c.surface2, c.accent] },
        },
        calendar: {
          top: 24, left: 34, right: 8, bottom: 12,
          range: range,
          cellSize: Array.isArray(data.cellSize) ? data.cellSize : ['auto', data.cellSize],
          itemStyle: { borderColor: c.surface, borderWidth: 2, color: c.surface2 },
          splitLine: { show: false },
          yearLabel: { show: false },
          monthLabel: { color: c.muted, fontSize: 10, fontFamily: c.font },
          dayLabel: { color: c.muted, fontSize: 10, fontFamily: c.font, firstDay: 1,
            nameMap: ['S', 'M', 'T', 'W', 'T', 'F', 'S'] },
        },
        series: [{
          type: 'heatmap',
          coordinateSystem: 'calendar',
          data: data.values,
        }]
      };
    });
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
      el.classList.add('mw-card', 'mw-evcal');
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
      el.classList.add('mw-card', 'mw-stepper');

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
  // Widget: Map Chart (hex tile map — Korea by default)
  // No GeoJSON dependency. Provinces laid out in a hex-ish grid.
  // ==========================================================
  var KOREA_TILES = [
    // 17 광역자치단체 — geographically-aware compact hex grid (6 cols × 6 rows)
    // { code, name, row, col }
    { code: 'GW', name: '강원',     row: 0, col: 3 },
    { code: 'IC', name: '인천',     row: 1, col: 0 },
    { code: 'GG', name: '경기',     row: 1, col: 1 },
    { code: 'SE', name: '서울',     row: 1, col: 2 },
    { code: 'CN', name: '충남',     row: 2, col: 1 },
    { code: 'SJ', name: '세종',     row: 2, col: 2 },
    { code: 'CB', name: '충북',     row: 2, col: 3 },
    { code: 'JB', name: '전북',     row: 3, col: 1 },
    { code: 'DJ', name: '대전',     row: 3, col: 2 },
    { code: 'GB', name: '경북',     row: 3, col: 3 },
    { code: 'DG', name: '대구',     row: 3, col: 4 },
    { code: 'GJ', name: '광주',     row: 4, col: 0 },
    { code: 'JN', name: '전남',     row: 4, col: 1 },
    { code: 'GN', name: '경남',     row: 4, col: 3 },
    { code: 'US', name: '울산',     row: 4, col: 4 },
    { code: 'BS', name: '부산',     row: 4, col: 5 },
    { code: 'JJ', name: '제주',     row: 5, col: 0 },
  ];

  function mapChart(el, config) {
    el = q(el);
    if (!el) return null;
    var data = Object.assign({
      title: '', subtitle: '',
      tiles: KOREA_TILES,
      items: [],            // [{ region: '서울', value: 1250000000 }]
      valueFormatter: null, // fn(v) => string
      height: 320,
    }, config || {});

    function render() {
      el.classList.add('mw-card', 'mw-mapchart');
      var c = getColors();
      var byName = {};
      (data.items || []).forEach(function (it) { byName[it.region] = it.value; });
      var values = (data.items || []).map(function (it) { return it.value || 0; });
      var max = values.length ? Math.max.apply(null, values) : 1;
      var min = values.length ? Math.min.apply(null, values) : 0;
      var range = (max - min) || 1;

      var maxRow = 0, maxCol = 0;
      data.tiles.forEach(function (t) {
        if (t.row > maxRow) maxRow = t.row;
        if (t.col > maxCol) maxCol = t.col;
      });
      var rows = maxRow + 1;
      var cols = maxCol + 1;

      var tilesHTML = data.tiles.map(function (t) {
        var v = byName[t.name];
        var hasVal = v != null;
        var ratio = hasVal ? (v - min) / range : 0;
        var alpha = hasVal ? Math.max(0.18, 0.18 + ratio * 0.82) : 0;
        var bg = hasVal
          ? 'color-mix(in srgb, var(--mw-accent) ' + Math.round(alpha * 100) + '%, var(--mw-surface))'
          : 'var(--mw-surface-2)';
        var fg = hasVal && ratio > 0.55 ? '#fff' : 'var(--mw-text)';
        var formatted = hasVal
          ? (data.valueFormatter ? data.valueFormatter(v) : safeNum(v))
          : '—';
        return '<div class="mw-mapchart__tile" ' +
          'style="grid-row:' + (t.row + 1) + ';grid-column:' + (t.col + 1) +
          ';background:' + bg + ';color:' + fg + '" ' +
          'title="' + escapeHTML(t.name) + ': ' + escapeHTML(formatted) + '">' +
            '<div class="mw-mapchart__name">' + escapeHTML(t.name) + '</div>' +
            '<div class="mw-mapchart__val">' + escapeHTML(formatted) + '</div>' +
          '</div>';
      }).join('');

      // Legend
      var legendHTML =
        '<div class="mw-mapchart__legend">' +
          '<span class="mw-mapchart__legend-lbl">' + escapeHTML(data.valueFormatter ? data.valueFormatter(min) : safeNum(min)) + '</span>' +
          '<span class="mw-mapchart__legend-bar"></span>' +
          '<span class="mw-mapchart__legend-lbl">' + escapeHTML(data.valueFormatter ? data.valueFormatter(max) : safeNum(max)) + '</span>' +
        '</div>';

      el.innerHTML = headerHTML(data.title, data.subtitle) +
        '<div class="mw-mapchart__grid" ' +
          'style="grid-template-rows:repeat(' + rows + ',1fr);grid-template-columns:repeat(' + cols + ',1fr);height:' + data.height + 'px">' +
          tilesHTML +
        '</div>' +
        legendHTML;
    }
    render();
    var handle = {
      el: el, type: 'map-chart',
      refresh: render,
      update: function (newData) { data = Object.assign(data, newData || {}); render(); },
      destroy: function () { el.innerHTML = ''; registry.delete(handle); },
    };
    return register(handle);
  }

  // ==========================================================
  // Widget: Waterfall Chart — start → gains/losses → total
  // items: [{ label, value, type?: 'start'|'gain'|'loss'|'total' }]
  // type auto-detected from sign if omitted (>=0 gain, <0 loss).
  // First item defaults to 'start', last labeled '합계/Total' to 'total'.
  // ==========================================================
  function waterfallChart(el, config) {
    return _chartBase(el, config, {
      items: [],
      valueFormatter: null,
      gainColor: null, lossColor: null, totalColor: null,
    }, 'waterfall-chart', function (data, c) {
      var items = data.items || [];
      var helper = [], gain = [], loss = [], total = [];
      var cum = 0;
      items.forEach(function (it, i) {
        var t = it.type;
        if (!t) {
          if (i === 0) t = 'start';
          else if (i === items.length - 1) t = 'total';
          else t = it.value >= 0 ? 'gain' : 'loss';
        }
        if (t === 'start' || t === 'total') {
          helper.push(0);
          gain.push(0); loss.push(0);
          total.push(it.value);
          cum = it.value;
        } else if (t === 'gain') {
          helper.push(cum);
          gain.push(it.value); loss.push(0); total.push(0);
          cum += it.value;
        } else { // loss
          var amt = Math.abs(it.value);
          helper.push(cum - amt);
          gain.push(0); loss.push(amt); total.push(0);
          cum -= amt;
        }
      });
      var fmt = data.valueFormatter || safeNum;
      var gainCol = data.gainColor || c.success;
      var lossCol = data.lossColor || c.danger;
      var totCol = data.totalColor || c.accent;
      return {
        textStyle: { fontFamily: c.font, color: c.text },
        grid: { top: 14, right: 14, bottom: 28, left: 60 },
        tooltip: Object.assign({ trigger: 'axis', axisPointer: { type: 'shadow' } }, baseTooltip(c), {
          formatter: function (params) {
            var idx = params[0].dataIndex;
            var it = items[idx];
            if (!it) return '';
            var sign = it.value > 0 ? '+' : '';
            return '<div style="font-weight:600;margin-bottom:4px">' + escapeHTML(it.label) + '</div>' +
              '<div>' + sign + fmt(it.value) + '</div>';
          },
        }),
        xAxis: {
          type: 'category', data: items.map(function (i) { return i.label; }),
          axisLine: { lineStyle: { color: c.border } }, axisTick: { show: false },
          axisLabel: { color: c.muted, fontSize: 11, interval: 0 },
        },
        yAxis: {
          type: 'value',
          axisLine: { show: false }, axisTick: { show: false },
          axisLabel: { color: c.muted, fontSize: 11, formatter: fmt },
          splitLine: { lineStyle: { color: c.border, type: 'dashed' } },
        },
        series: [
          { name: '_helper', type: 'bar', stack: 'total', silent: true,
            itemStyle: { color: 'transparent' }, data: helper },
          { name: '증가', type: 'bar', stack: 'total',
            itemStyle: { color: gainCol, borderRadius: [3, 3, 0, 0] }, data: gain,
            label: { show: true, position: 'top', color: gainCol, fontSize: 10,
                     formatter: function (p) { return p.value ? '+' + fmt(p.value) : ''; } } },
          { name: '감소', type: 'bar', stack: 'total',
            itemStyle: { color: lossCol, borderRadius: [3, 3, 0, 0] }, data: loss,
            label: { show: true, position: 'top', color: lossCol, fontSize: 10,
                     formatter: function (p) { return p.value ? '−' + fmt(p.value) : ''; } } },
          { name: '합계', type: 'bar', stack: 'total',
            itemStyle: { color: totCol, borderRadius: [3, 3, 0, 0] }, data: total,
            label: { show: true, position: 'top', color: c.text, fontWeight: 600, fontSize: 11,
                     formatter: function (p) { return p.value ? fmt(p.value) : ''; } } },
        ],
      };
    });
  }

  // ==========================================================
  // Widget: Cohort Matrix — retention grid (Mixpanel-style)
  // cohorts: row labels  ·  periods: column labels
  // data: 2D array of percent values (0-100), null = no data
  // sizes: optional cohort size column (e.g. signup count)
  // ==========================================================
  function cohortMatrix(el, config) {
    el = q(el);
    if (!el) return null;
    var data = Object.assign({
      title: '', subtitle: '',
      cohorts: [], periods: [], data: [], sizes: null,
      cohortLabel: '코호트', sizeLabel: '규모',
      valueFormatter: function (v) { return v != null ? v.toFixed(0) + '%' : '—'; },
    }, config || {});

    function render() {
      el.classList.add('mw-card', 'mw-cohort');
      var headerCells = '<div class="mw-cohort__th mw-cohort__th--label">' + escapeHTML(data.cohortLabel) + '</div>';
      if (data.sizes) headerCells += '<div class="mw-cohort__th mw-cohort__th--size">' + escapeHTML(data.sizeLabel) + '</div>';
      data.periods.forEach(function (p) {
        headerCells += '<div class="mw-cohort__th">' + escapeHTML(p) + '</div>';
      });

      var rows = data.cohorts.map(function (cohort, ri) {
        var cells = '<div class="mw-cohort__row-label">' + escapeHTML(cohort) + '</div>';
        if (data.sizes) {
          var sz = data.sizes[ri];
          cells += '<div class="mw-cohort__size">' + escapeHTML(safeNum(sz)) + '</div>';
        }
        var values = data.data[ri] || [];
        data.periods.forEach(function (_, ci) {
          var v = values[ci];
          var ratio = v == null ? 0 : Math.max(0, Math.min(1, v / 100));
          var alpha = v == null ? 0 : Math.max(0.08, ratio);
          var bg = v == null
            ? 'transparent'
            : 'color-mix(in srgb, var(--mw-accent) ' + Math.round(alpha * 100) + '%, var(--mw-surface))';
          var fg = v == null ? 'var(--mw-text-muted)' : (ratio > 0.55 ? '#fff' : 'var(--mw-text)');
          cells += '<div class="mw-cohort__cell" style="background:' + bg + ';color:' + fg + '">' +
            escapeHTML(data.valueFormatter(v)) + '</div>';
        });
        return cells;
      }).join('');

      var leftCol = '88px ' + (data.sizes ? '64px ' : '');
      var totalCols = (data.sizes ? 2 : 1) + data.periods.length;
      el.innerHTML = headerHTML(data.title, data.subtitle) +
        '<div class="mw-cohort__grid" ' +
          'style="grid-template-columns:' + leftCol + 'repeat(' + data.periods.length + ',minmax(36px,1fr))">' +
          headerCells + rows +
        '</div>';
    }
    render();
    var handle = {
      el: el, type: 'cohort-matrix',
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
      el.classList.add('mw-card', 'mw-sparklist');
      var c = getColors();
      var rows = data.items.map(function (it, i) {
        var deltaHTML = '';
        if (it.delta != null && !isNaN(it.delta)) {
          var goodWhenNeg = it.deltaGoodWhen === 'negative';
          var good = goodWhenNeg ? it.delta < 0 : it.delta > 0;
          var arrow = it.delta >= 0 ? '▲' : '▼';
          deltaHTML = '<span class="mw-sparklist__delta mw-sparklist__delta--' + (good ? 'good' : 'bad') + '">' +
            arrow + ' ' + Math.abs(Number(it.delta)).toFixed(1) + '%</span>';
        }
        return '<div class="mw-sparklist__row">' +
          '<div class="mw-sparklist__info">' +
            '<div class="mw-sparklist__label">' + escapeHTML(it.label || '') + '</div>' +
            '<div class="mw-sparklist__meta">' +
              '<span class="mw-sparklist__value">' + _valOrEsc(it.value) + '</span>' +
              deltaHTML +
            '</div>' +
          '</div>' +
          '<div class="mw-sparklist__spark" data-idx="' + i + '"></div>' +
        '</div>';
      }).join('');
      el.innerHTML = headerHTML(data.title, data.subtitle) +
        '<div class="mw-sparklist__body">' + rows + '</div>';
      if (!EC) return;
      data.items.forEach(function (it, i) {
        if (!it.sparkline || !it.sparkline.length) return;
        var spark = el.querySelector('.mw-sparklist__spark[data-idx="' + i + '"]');
        if (!spark) return;
        var ch = EC.init(spark, null, { renderer: 'svg' });
        var col = c.accent;
        if (it.delta != null) {
          var goodWhenNeg = it.deltaGoodWhen === 'negative';
          var good = goodWhenNeg ? it.delta < 0 : it.delta > 0;
          col = good ? c.success : c.danger;
        }
        ch.setOption({
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
                  { offset: 0, color: col + '44' },
                  { offset: 1, color: col + '00' },
                ] },
            },
          }],
        });
        charts.push(ch);
        if (typeof ResizeObserver !== 'undefined') {
          var ro = new ResizeObserver(function () { if (ch) ch.resize(); });
          ro.observe(spark);
          ros.push(ro);
        }
      });
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
      el.classList.add('mw-card', 'mw-goal');
      var rows = data.items.map(function (it) {
        var ratio = it.max > 0 ? Math.max(0, it.value / it.max) : 0;
        var pct = Math.round(ratio * 100);
        var color = colorFor(ratio);
        var unit = it.unit ? escapeHTML(it.unit) : '';
        var sublabel = it.sublabel ? '<span class="mw-goal__sub">' + escapeHTML(it.sublabel) + '</span>' : '';
        return '<div class="mw-goal__row">' +
          '<div class="mw-goal__head">' +
            '<div class="mw-goal__label">' + escapeHTML(it.label) + sublabel + '</div>' +
            '<div class="mw-goal__stat">' +
              '<span class="mw-goal__val">' + escapeHTML(data.valueFormatter(it.value)) + unit + '</span>' +
              '<span class="mw-goal__divider">/</span>' +
              '<span class="mw-goal__max">' + escapeHTML(data.valueFormatter(it.max)) + unit + '</span>' +
              '<span class="mw-goal__pct mw-goal__pct--' + color + '">' + pct + '%</span>' +
            '</div>' +
          '</div>' +
          '<div class="mw-goal__bar">' +
            '<div class="mw-goal__fill mw-goal__fill--' + color + '" style="width:' + Math.min(pct, 100) + '%"></div>' +
          '</div>' +
        '</div>';
      }).join('');
      el.innerHTML = headerHTML(data.title, data.subtitle) +
        '<div class="mw-goal__body">' + rows + '</div>';
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
    function render() {
      el.classList.add('mw-page-head');
      el.innerHTML =
        (data.kicker ? '<div class="mw-page-head__kicker"><span class="mw-page-head__dot"></span>' + escapeHTML(data.kicker) + '</div>' : '') +
        '<div class="mw-page-head__row">' +
          '<h1 class="mw-page-head__title">' + escapeHTML(data.title) + '</h1>' +
          (data.meta ? '<span class="mw-page-head__mono">' + escapeHTML(data.meta) + '</span>' : '') +
        '</div>' +
        (data.subtitle ? '<div class="mw-page-head__meta"><span>' + escapeHTML(data.subtitle) + '</span></div>' : '');
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
    function render() {
      el.classList.add('mw-section-head');
      var kickerText = data.index ? (data.index + ' · ' + data.kicker) : data.kicker;
      el.innerHTML =
        '<div class="mw-section-head__left">' +
          (kickerText ? '<div class="mw-section-head__kicker">' + escapeHTML(kickerText) + '</div>' : '') +
          (data.title ? '<h2 class="mw-section-head__title">' + escapeHTML(data.title) + '</h2>' : '') +
        '</div>' +
        (data.tag ? '<div class="mw-section-head__tag">' + escapeHTML(data.tag) + '</div>' : '');
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

    var icons = { info: 'ⓘ', warning: '▲', danger: '⚠', success: '✓' };

    function render() {
      // Preserve existing classes (e.g. Tailwind utilities like mb-6)
      ['info', 'warning', 'danger', 'success'].forEach(function (t) {
        el.classList.remove('mw-alert--' + t);
      });
      el.classList.add('mw-alert');
      el.classList.add('mw-alert--' + data.type);
      var icon = data.icon != null ? data.icon : (icons[data.type] || 'ⓘ');
      var msgRaw = data.message || '';
      var msgHTML = msgRaw ? '<span class="mw-alert__msg">' + (typeof msgRaw === 'string' && msgRaw.indexOf('<') >= 0 ? msgRaw : escapeHTML(msgRaw)) + '</span>' : '';
      var actionHTML = '';
      if (data.action) {
        var href = data.action.href ? ' href="' + escapeHTML(data.action.href) + '"' : ' href="#"';
        actionHTML = '<a class="mw-alert__action"' + href + ' data-alert-action>' + escapeHTML(data.action.label) + ' →</a>';
      }
      var dismissHTML = data.dismissable ? '<button class="mw-alert__dismiss" data-alert-dismiss aria-label="닫기">×</button>' : '';
      el.innerHTML =
        '<span class="mw-alert__icon">' + escapeHTML(icon) + '</span>' +
        '<div class="mw-alert__body">' +
          '<span class="mw-alert__title">' + escapeHTML(data.title) + '</span>' +
          msgHTML +
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
  // Widget: Bullet Chart — actual vs target vs benchmark (horizontal)
  // ranges = qualitative bands, target = goal line, benchmark = comparison line
  // ==========================================================
  function bulletChart(el, config) {
    return _chartBase(el, Object.assign({ height: 140 }, config), {
      value: 0, target: null, benchmark: null,
      max: 100, min: 0, unit: '',
      valueFormatter: null,
      ranges: [],
    }, 'bullet-chart', function (data, c) {
      var fmt = data.valueFormatter || safeNum;
      var toAlpha = function (hex, a) {
        return hex + Math.round(a * 255).toString(16).padStart(2, '0');
      };

      // Background qualitative bands (stacked horizontal bars)
      var bandSeries = [];
      if (data.ranges && data.ranges.length) {
        var prev = data.min;
        var n = data.ranges.length;
        data.ranges.forEach(function (r, i) {
          var w = r.value - prev;
          if (w <= 0) return;
          var alpha = 0.08 + (i / Math.max(1, n - 1)) * 0.22;
          bandSeries.push({
            name: r.label || ('band' + i), type: 'bar', stack: 'band', silent: true,
            data: [w], barWidth: '68%',
            itemStyle: { color: toAlpha(c.accent, alpha), borderRadius: 0 },
          });
          prev = r.value;
        });
      } else {
        // No ranges — single soft band across full width
        bandSeries.push({
          name: 'range', type: 'bar', stack: 'band', silent: true,
          data: [data.max - data.min], barWidth: '68%',
          itemStyle: { color: toAlpha(c.accent, 0.1) },
        });
      }

      // Actual value — narrower solid bar, NOT stacked
      var markLines = [];
      if (data.target != null) {
        markLines.push({
          xAxis: data.target,
          lineStyle: { color: c.text, width: 2 },
          label: { show: true, position: 'end',
                   formatter: '목표 ' + fmt(data.target) + (data.unit || ''),
                   color: c.text, fontSize: 10, fontFamily: c.font, fontWeight: 600,
                   distance: 4, backgroundColor: c.surface, padding: [2, 5],
                   borderColor: c.border, borderWidth: 1, borderRadius: 3 },
        });
      }
      if (data.benchmark != null) {
        markLines.push({
          xAxis: data.benchmark,
          lineStyle: { color: c.muted, width: 1, type: 'dashed' },
          label: { show: true, position: 'end',
                   formatter: '벤치 ' + fmt(data.benchmark) + (data.unit || ''),
                   color: c.muted, fontSize: 10, fontFamily: c.font,
                   distance: 4, backgroundColor: c.surface, padding: [2, 5],
                   borderColor: c.border, borderWidth: 1, borderRadius: 3 },
        });
      }
      var valueSeries = {
        name: '실적', type: 'bar',
        data: [data.value], barWidth: '28%',
        itemStyle: { color: c.accent, borderRadius: [0, 3, 3, 0] },
        z: 10,
        markLine: markLines.length ? {
          symbol: 'none', silent: true,
          data: markLines,
        } : undefined,
      };

      return {
        textStyle: { fontFamily: c.font, color: c.text },
        grid: { top: 36, right: 24, bottom: 26, left: 12 },
        tooltip: Object.assign({ trigger: 'axis', axisPointer: { type: 'shadow' } }, baseTooltip(c), {
          formatter: function () {
            var s = '<b>실적 ' + fmt(data.value) + (data.unit || '') + '</b>';
            if (data.target != null) s += '<br/>목표: ' + fmt(data.target) + (data.unit || '');
            if (data.benchmark != null) s += '<br/>벤치: ' + fmt(data.benchmark) + (data.unit || '');
            return s;
          },
        }),
        xAxis: {
          type: 'value', min: data.min, max: data.max,
          axisLine: { lineStyle: { color: c.border } },
          axisTick: { show: false },
          axisLabel: { color: c.muted, fontSize: 10, formatter: fmt, margin: 8 },
          splitLine: { show: false },
        },
        yAxis: {
          type: 'category', data: [''],
          axisLine: { show: false }, axisTick: { show: false }, axisLabel: { show: false },
        },
        series: bandSeries.concat([valueSeries]),
      };
    });
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
      el.classList.add('mw-slide');

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
      el.classList.add('mw-card', 'mw-insight');
      el.style.setProperty('--mw-insight-bar', statusToVar(data.status));

      var iconHTML = data.icon ? '<span class="mw-insight__icon">' + escapeHTML(data.icon) + '</span>' : '';
      var metaHTML = data.meta ? '<span class="mw-insight__meta">' + escapeHTML(data.meta) + '</span>' : '';
      var tagHTML  = data.tag  ? '<span class="mw-insight__tag">'  + escapeHTML(data.tag)  + '</span>' : '';

      var bulletsHTML = (data.bullets || []).slice(0, 100).map(function (b) {
        var t = (typeof b === 'string') ? b : (b.text || '');
        return '<li class="mw-insight__bullet">' + escapeHTML(t) + '</li>';
      }).join('');

      var highlightHTML = data.highlight
        ? '<div class="mw-insight__highlight">' +
            '<span class="mw-insight__highlight-icon">' + escapeHTML(data.highlightIcon || '🎯') + '</span>' +
            '<span>' + escapeHTML(data.highlight) + '</span>' +
          '</div>'
        : '';

      el.innerHTML =
        '<div class="mw-insight__head">' +
          '<span class="mw-insight__dot"></span>' +
          iconHTML +
          '<span class="mw-insight__title">' + escapeHTML(data.title) + '</span>' +
          metaHTML +
          tagHTML +
        '</div>' +
        (bulletsHTML ? '<ul class="mw-insight__bullets">' + bulletsHTML + '</ul>' : '') +
        highlightHTML;
    }
    render();

    var handle = {
      el: el, type: 'insight-card',
      refresh: render,
      update: function (newData) { data = Object.assign(data, newData || {}); render(); },
      destroy: function () { el.innerHTML = ''; el.classList.remove('mw-insight'); registry.delete(handle); },
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
      el.classList.add('mw-card', 'mw-defcard');
      var rows = (data.rows || []).map(function (r) {
        return '<div class="mw-defcard__row">' +
          '<div class="mw-defcard__key">' + escapeHTML(r.key) + '</div>' +
          '<div class="mw-defcard__val">' + escapeHTML(r.value) + '</div>' +
        '</div>';
      }).join('');
      el.innerHTML =
        (data.title ? '<div class="mw-defcard__title">' + escapeHTML(data.title) + '</div>' : '') +
        (data.subtitle ? '<div class="mw-defcard__sub">' + escapeHTML(data.subtitle) + '</div>' : '') +
        rows;
    }
    render();

    var handle = {
      el: el, type: 'def-card',
      refresh: render,
      update: function (newData) { data = Object.assign(data, newData || {}); render(); },
      destroy: function () { el.innerHTML = ''; el.classList.remove('mw-defcard'); registry.delete(handle); },
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
        return '<div class="mw-sharebar__seg" style="width:' + pct.toFixed(3) + '%;background:' + bg + '">' +
               escapeHTML(label) + '</div>';
      }).join('');

      var legend = data.legend ? (
        '<div class="mw-sharebar__legend">' +
        segs.map(function (s) {
          var status = s.status || 'gray';
          return '<span class="mw-sharebar__leg-item">' +
                 '<span class="mw-sharebar__leg-dot mw-sharebar__leg-dot--' + escapeHTML(status) + '"' +
                 (s.color ? ' style="background:' + s.color + '"' : '') + '></span>' +
                 escapeHTML(s.label || '') +
                 (s.sub ? ' <span class="mw-sharebar__leg-sub">' + escapeHTML(s.sub) + '</span>' : '') +
                 '</span>';
        }).join('') + '</div>'
      ) : '';

      el.innerHTML =
        '<div class="mw-sharebar" style="height:' + Number(data.height) + 'px">' + bars + '</div>' +
        legend;
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
      el.innerHTML =
        '<span class="mw-rag mw-rag--' + escapeHTML(s) + '">' +
          '<span class="mw-rag__dot"></span>' +
          '<span class="mw-rag__lbl">' + escapeHTML(data.label) + '</span>' +
        '</span>';
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
    version: '0.1.19',
    kpiCard: kpiCard,
    lineChart: lineChart,
    barChart: barChart,
    funnelChart: funnelChart,
    donutChart: donutChart,
    leaderboard: leaderboard,
    activityTable: activityTable,
    heatmapChart: heatmapChart,
    gaugeChart: gaugeChart,
    radarChart: radarChart,
    treemapChart: treemapChart,
    scatterChart: scatterChart,
    sankeyChart: sankeyChart,
    heroTile: heroTile,
    metricChart: metricChart,
    ringProgress: ringProgress,
    timeline: timeline,
    statusGrid: statusGrid,
    countdownTile: countdownTile,
    metricStack: metricStack,
    inboxPreview: inboxPreview,
    compareCard: compareCard,
    calendarHeatmap: calendarHeatmap,
    eventCalendar: eventCalendar,
    progressStepper: progressStepper,
    mapChart: mapChart,
    waterfallChart: waterfallChart,
    cohortMatrix: cohortMatrix,
    sparklineList: sparklineList,
    goalGrid: goalGrid,
    alertBanner: alertBanner,
    bulletChart: bulletChart,
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

    // ================================================================
    // Maging.page(config) — One-shot declarative dashboard generator
    // ================================================================
    page: function (cfg) {
      if (!cfg) return;

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
          '.mw-pgrid > *,.mw-pgrid > .mw-card{height:100% !important;min-width:0;min-height:0 !important;}' +
          '.mw-pgrid .mw-card{display:flex;flex-direction:column;box-sizing:border-box;height:100% !important;min-height:0 !important;}' +
          '.mw-pgrid .mw-chart__body{height:auto !important;flex:1 1 auto;min-height:0 !important;}' +
          '.mw-pgrid .mw-lb__list,.mw-pgrid .mw-timeline,.mw-pgrid .mw-inbox,.mw-pgrid .mw-table__wrap{flex:1 1 auto;min-height:0;overflow-y:auto;}' +
          '.mw-pgrid .mw-kpi__spark,.mw-pgrid .mw-hero__spark{flex:1 1 auto;min-height:32px;}' +
          '.mw-pgrid .mw-countdown.mw-card,.mw-pgrid .mw-stat.mw-card,.mw-pgrid .mw-compare.mw-card,.mw-pgrid .mw-mstack.mw-card,.mw-pgrid .mw-kpi.mw-card,.mw-pgrid .mw-hero.mw-card{container-type:size;}' +
          '.mw-pgrid .mw-countdown__num{font-size:clamp(1.75rem,18cqh,3.25rem);}' +
          '.mw-pgrid .mw-mstack__main-val{font-size:clamp(1.5rem,16cqh,2.75rem);}' +
          '.mw-pgrid .mw-compare__val{font-size:clamp(1.15rem,12cqh,2.25rem);}' +
          '.mw-pgrid .mw-stat__value{font-size:clamp(1.35rem,18cqh,2.5rem);}' +
          '.mw-pgrid .mw-kpi__value{font-size:clamp(1.5rem,18cqh,2.5rem);}' +
          '.mw-pgrid .mw-hero__value{font-size:clamp(1.75rem,20cqh,3rem);}';
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
              var card = el.querySelector('.mw-card') || el;
              if (card.classList.contains('mw-card')) card.style.minHeight = '';
              if (el.style.minHeight) el.style.minHeight = '';
            }
          });
        });
      });

      // Mount to DOM
      var body = document.body;
      var existing = body.querySelector('main');
      if (existing) {
        existing.parentNode.replaceChild(container, existing);
      } else {
        body.appendChild(container);
      }

      return container;
    },
  };

  // Theme metadata for the FAB picker (ordered mainstream → distinctive)
  var THEME_DATA = [
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
    { value: 'flow', brand: 'Flow', desc: '라벤더 퍼플', bg: '#f7f6ff', accent: '#5f49dc', accent2: '#0ba898', warning: '#f5a520', danger: '#e84545' },
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
    fab.innerHTML =
      '<div class="mw-theme-fab__export-wrap" style="display:none">' +
        '<button type="button" class="mw-theme-fab__export" aria-label="내보내기"></button>' +
        '<div class="mw-theme-fab__export-menu"></div>' +
      '</div>' +
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
      '<button type="button" class="mw-theme-fab__shuffle" aria-label="랜덤 테마" title="랜덤 테마">🎲</button>' +
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
      var pages = document.querySelectorAll('.slide, .mw-a4-page, .a4-page');
      if (pages.length > 1) return {
        format: 'pptx', label: dlIcon, title: '내보내기 (' + pages.length + '슬라이드)', multi: true,
        options: [
          { format: 'pptx', label: dlIcon + ' PPTX', title: '편집 가능한 파워포인트' },
          { format: 'pdf', label: dlIcon + ' PDF', title: '인쇄용 PDF' },
          { format: 'html', label: htmlIcon + ' HTML', title: '단일 HTML 파일' }
        ]
      };
      var widgets = document.querySelectorAll('.mw-card');
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
      var pages = document.querySelectorAll('.slide, .mw-a4-page, .a4-page');
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
        var charts = root.querySelectorAll('.mw-chart__body');
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
          document.body.classList.add('mw-printing');
          window.dispatchEvent(new Event('resize'));

          var pageW = 1058;
          pdfSlides.forEach(function (s) {
            var sw = s.scrollWidth || s.offsetWidth;
            var scale = sw > pageW ? pageW / sw : 1;
            s.style.setProperty('--print-scale', scale.toFixed(4));
          });

          setTimeout(function () {
            window.print();
            document.body.classList.remove('mw-printing');
            pdfSlides.forEach(function (s) { s.style.removeProperty('--print-scale'); });
            finishExport();
            restoreHash(pdfOrigHash);
          }, 600);
        }).catch(function (e) { finishExport(e); restoreHash(pdfOrigHash); });
      } else if (format === 'pptx') {
        var slides = Array.from(target.elements);
        var originalHash = window.location.hash;

        mountSlides(slides).then(function () {
          slides.forEach(function (s) {
            s.setAttribute('data-active', '');
            s.style.setProperty('--slide-scale', '1');
            s.style.transform = 'none';
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
          var PPTX_BODY = "'Apple SD Gothic Neo', 'Malgun Gothic', Calibri, sans-serif";
          var PPTX_MONO = "Consolas, 'Courier New', monospace";
          var fontBackups = [];

          slides.forEach(function (s) {
            var els = s.querySelectorAll('*');
            for (var i = 0; i < els.length; i++) {
              var el = els[i];
              var cs = getComputedStyle(el);
              // Backup & resolve colors
              el.style.color = cs.color;
              el.style.backgroundColor = cs.backgroundColor;
              el.style.borderColor = cs.borderColor;
              // Backup & swap fonts
              var origFont = cs.fontFamily;
              fontBackups.push({ el: el, font: el.style.fontFamily });
              if (origFont.indexOf('monospace') > -1 || origFont.indexOf('JetBrains') > -1 || origFont.indexOf('Consolas') > -1) {
                el.style.fontFamily = PPTX_MONO;
              } else {
                el.style.fontFamily = PPTX_BODY;
              }
            }
          });

          // Nudge large text slightly wider (headings wrap tighter in PPT)
          slides.forEach(function (s) {
            s.querySelectorAll('h1, h2, h3, .mw-page-head__title, .mw-slide__label, .mw-header__title, .mw-kpi__label, .mw-kpi__value').forEach(function (el) {
              el.style.letterSpacing = '0.03em';
              el.style.paddingRight = (parseFloat(getComputedStyle(el).paddingRight) + 4) + 'px';
            });
          });

          // Wait for font swap to reflow layout
          return new Promise(function (r) { setTimeout(r, 200); }).then(function () {
            return domToPptx.exportToPptx(slides, {
              fileName: baseName + '.pptx',
              width: slideW,
              height: slideH,
              autoEmbedFonts: false,
            });
          }).then(function (result) {
            // Restore original fonts
            fontBackups.forEach(function (b) { b.el.style.fontFamily = b.font; });
            return result;
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
    resizeTimer = setTimeout(refreshAll, 120);
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
          value:     unit ? val + '<span class="mw-unit"> ' + unit + '</span>' : val,
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
