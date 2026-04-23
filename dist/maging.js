/*! magicwiget v0.1.0 — Dashboard widgets for CDN | MIT
 *  Requires ECharts 5+ loaded as global `echarts`.
 *  Usage:
 *    <link rel="stylesheet" href="magicwiget.css">
 *    <script src="https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js"></script>
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
      'Add <script src="https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js"></script> before magicwiget.js.');
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
      textStyle: { color: c.text, fontFamily: c.font, fontSize: 12 },
      extraCssText: 'box-shadow: 0 6px 20px -8px rgba(0,0,0,0.25); border-radius: ' + c.radius + ';',
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
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // ==========================================================
  // Formatters
  // ==========================================================
  var fmt = {
    krw: function (n) {
      if (n == null || isNaN(n)) return '';
      if (n >= 1_0000_0000) return '₩' + (n / 1_0000_0000).toFixed(1) + '억';
      if (n >= 10000) return '₩' + Math.round(n / 10000).toLocaleString() + '만';
      return '₩' + Number(n).toLocaleString();
    },
    num: function (n) { return (n == null || isNaN(n)) ? '' : Number(n).toLocaleString(); },
    pct: function (n) { return (n == null || isNaN(n)) ? '' : Number(n).toFixed(1) + '%'; },
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
      label: '', value: '', delta: null, sparkline: [],
      icon: '', compact: false,
      deltaGoodWhen: 'positive',
    }, config || {});
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
          '<div class="mw-kpi__value">' + escapeHTML(data.value) + '</div>' +
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
          smooth: true,
          symbol: 'circle',
          symbolSize: 4,
          data: s.data,
          lineStyle: { color: col, width: 2 },
          itemStyle: { color: col, borderColor: c.surface, borderWidth: 1 },
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
        grid: { top: data.series.length > 1 ? 32 : 14, right: 14, bottom: 28, left: 54 },
        legend: data.series.length > 1 ? {
          top: 0, right: 0,
          textStyle: { color: c.muted, fontFamily: c.font, fontSize: 11 },
          icon: 'circle', itemWidth: 8, itemHeight: 8,
          data: data.series.map(function (s) { return s.name; }),
        } : { show: false },
        tooltip: Object.assign({ trigger: 'axis' }, baseTooltip(c),
          data.yFormatter ? { valueFormatter: data.yFormatter } : {}),
        xAxis: {
          type: 'category',
          data: data.categories,
          axisLine: { lineStyle: { color: c.border } },
          axisTick: { show: false },
          axisLabel: { color: c.muted, fontSize: 11 },
        },
        yAxis: {
          type: 'value',
          min: data.yMin != null ? data.yMin : undefined,
          max: data.yMax != null ? data.yMax : undefined,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: Object.assign({ color: c.muted, fontSize: 11 },
            data.yFormatter ? { formatter: data.yFormatter } : {}),
          splitLine: { lineStyle: { color: c.border, type: 'dashed' } },
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
      yFormatter: null, showLabels: true,
    }, 'bar-chart', function (data, c) {
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
              formatter: function (p) { return tipFmt ? tipFmt(p.value) : Number(p.value).toLocaleString(); },
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
          axisLine: { lineStyle: { color: c.border } }, axisTick: { show: false },
          axisLabel: { color: c.muted, fontSize: 11 },
        },
        yAxis: {
          type: 'value',
          axisLine: { show: false }, axisTick: { show: false },
          axisLabel: Object.assign({ color: c.muted, fontSize: 11 }, tipFmt ? { formatter: tipFmt } : {}),
          splitLine: { lineStyle: { color: c.border, type: 'dashed' } },
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
        tooltip: Object.assign({}, baseTooltip(c), { formatter: '{b}: {c}' + (data.valueSuffix || '') }),
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
      var centerVal = data.centerValue != null ? data.centerValue : total.toLocaleString();
      return {
        textStyle: { fontFamily: c.font },
        tooltip: baseTooltip(c),
        legend: {
          orient: 'vertical', right: 12, top: 'middle',
          textStyle: { color: c.muted, fontFamily: c.font, fontSize: 11 },
          icon: 'circle', itemWidth: 8, itemHeight: 8, itemGap: 10,
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
      columns: [], rows: [],
    }, config || {});

    function render() {
      el.classList.add('mw-card');
      var rightEl = data.live
        ? '<span class="mw-badge mw-badge--muted"><span class="mw-live-dot" style="margin:0 0.25rem 0 0"></span>LIVE</span>'
        : '';
      var ths = data.columns.map(function (col) {
        var cls = col.align === 'right' ? ' class="mw-table__right"' : '';
        return '<th' + cls + '>' + escapeHTML(col.label) + '</th>';
      }).join('');
      var trs = (data.rows || []).slice(0, 100).map(function (row) {
        var tds = data.columns.map(function (col) {
          var v = row[col.key];
          var cls = col.align === 'right' ? ' class="mw-table__right"' : '';
          var content;
          if (typeof col.render === 'function') content = col.render(v, row);
          else content = v == null ? '' : escapeHTML(v);
          return '<td' + cls + '>' + content + '</td>';
        }).join('');
        return '<tr>' + tds + '</tr>';
      }).join('');
      el.innerHTML = headerHTML(data.title, data.subtitle, rightEl) +
        '<div class="mw-table__wrap"><table class="mw-table">' +
        '<thead><tr>' + ths + '</tr></thead><tbody>' + trs + '</tbody></table></div>';
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
            return (data.yAxis[p.value[1]] || '') + ' · ' + (data.xAxis[p.value[0]] || '') +
              ' = <b>' + p.value[2] + '</b>';
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
      var valueFontSize = Math.round(Math.max(14, Math.min(36, minDim * 0.12)));
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
            formatter: '{value}' + (data.unit || ''),
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
          icon: 'circle', itemWidth: 8, itemHeight: 8,
        } : { show: false },
        radar: {
          indicator: data.indicators,
          center: ['50%', '48%'],
          radius: '60%',
          axisName: { color: c.muted, fontSize: 10, fontFamily: c.font },
          splitLine: { lineStyle: { color: c.border, type: 'dashed' } },
          splitArea: { show: false },
          axisLine: { lineStyle: { color: c.border } },
        },
        series: [{
          type: 'radar',
          data: data.series.map(function (s, i) {
            var col = s.color || palette[i % palette.length];
            return {
              name: s.name,
              value: s.data,
              areaStyle: { color: col + '33' },
              lineStyle: { color: col, width: 2 },
              itemStyle: { color: col },
              symbolSize: 4,
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
            var v = data.valueFormatter ? data.valueFormatter(p.value) : Number(p.value).toLocaleString();
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
            var label = p.data[2] ? '<b>' + p.data[2] + '</b><br>' : '';
            return label + (data.xLabel || 'X') + ': ' + p.data[0] + '<br>' +
                   (data.yLabel || 'Y') + ': ' + p.data[1];
          },
        }, baseTooltip(c)),
        legend: data.series && data.series.length > 1 ? {
          top: 0, right: 0,
          textStyle: { color: c.muted, fontFamily: c.font, fontSize: 11 },
          icon: 'circle', itemWidth: 8, itemHeight: 8,
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
              var v = data.valueFormatter ? data.valueFormatter(p.value) : Number(p.value).toLocaleString();
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
              '<div class="mw-hero__stat-value">' + escapeHTML(s.value) + '</div>' +
            '</div>';
        });
        statsHTML += '</div>';
      }
      el.innerHTML =
        '<div class="mw-hero__kicker">' + escapeHTML(data.kicker) + '</div>' +
        '<div class="mw-hero__value">' + escapeHTML(data.value) + '</div>' +
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
      label: '', value: '', icon: '', context: '',
      delta: null, deltaGoodWhen: 'positive',
      categories: [], series: [], target: null, yFormatter: null,
    }, config || {});
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
          '<div class="mw-mchrt__value">' + escapeHTML(data.value) + '</div>' +
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

      var cur = data.series[0];
      var lastIdx = cur.data.length - 1;
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
            formatter: '{value}' + (data.unit || ''),
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
          '<div class="mw-mstack__sub-val">' + escapeHTML(it.value) + '</div>' +
          '<div class="mw-mstack__sub-lbl">' + escapeHTML(it.label) + '</div>' +
        '</div>';
      }).join('');
      el.innerHTML =
        (data.title ? '<div class="mw-mstack__title">' + escapeHTML(data.title) + '</div>' : '') +
        '<div class="mw-mstack__main-row">' +
          '<div class="mw-mstack__main-val">' + escapeHTML(main.value || '') + '</div>' +
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
            '<div class="mw-compare__val">' + escapeHTML(data.left.value || '') + '</div>' +
          '</div>' +
          '<div class="mw-compare__sep">→</div>' +
          '<div class="mw-compare__side mw-compare__side--current">' +
            '<div class="mw-compare__lbl">' + escapeHTML(data.right.label || '') + '</div>' +
            '<div class="mw-compare__val">' + escapeHTML(data.right.value || '') + '</div>' +
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
            return p.value[0] + ' · <b>' + (p.value[1] || 0) + (data.valueSuffix || '') + '</b>';
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
      data.items.forEach(function (it) { byName[it.region] = it.value; });
      var values = data.items.map(function (it) { return it.value || 0; });
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
          ? (data.valueFormatter ? data.valueFormatter(v) : Number(v).toLocaleString())
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
          '<span class="mw-mapchart__legend-lbl">' + escapeHTML(data.valueFormatter ? data.valueFormatter(min) : Number(min).toLocaleString()) + '</span>' +
          '<span class="mw-mapchart__legend-bar"></span>' +
          '<span class="mw-mapchart__legend-lbl">' + escapeHTML(data.valueFormatter ? data.valueFormatter(max) : Number(max).toLocaleString()) + '</span>' +
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
      var fmt = data.valueFormatter || function (v) { return Number(v).toLocaleString(); };
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
          cells += '<div class="mw-cohort__size">' + escapeHTML(sz != null ? Number(sz).toLocaleString() : '') + '</div>';
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
              '<span class="mw-sparklist__value">' + escapeHTML(it.value || '') + '</span>' +
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
      valueFormatter: function (v) { return Number(v).toLocaleString(); },
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
        '<h1 class="mw-page-head__title">' + escapeHTML(data.title) + '</h1>' +
        (data.subtitle || data.meta
          ? '<div class="mw-page-head__meta">' +
              (data.subtitle ? '<span>' + escapeHTML(data.subtitle) + '</span>' : '') +
              (data.subtitle && data.meta ? '<span class="mw-page-head__sep">|</span>' : '') +
              (data.meta ? '<span class="mw-page-head__mono">' + escapeHTML(data.meta) + '</span>' : '') +
            '</div>'
          : '');
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
      var msgHTML = data.message ? '<span class="mw-alert__msg">' + escapeHTML(data.message) + '</span>' : '';
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
      var fmt = data.valueFormatter || function (v) { return Number(v).toLocaleString(); };
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
  // Public API
  // ==========================================================
  var api = {
    version: '0.1.11',
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
    },

    setTheme: function (name) {
      document.documentElement.setAttribute('data-theme', name);
      requestAnimationFrame(function () { requestAnimationFrame(refreshAll); });
    },
    getTheme: function () {
      return document.documentElement.getAttribute('data-theme') || 'claude';
    },
    themes: [
      // Light (12)
      'claude', 'linear', 'stripe', 'notion', 'airbnb',
      'linkedin', 'instagram', 'youtube', 'reddit', 'medium',
      'apple', 'duolingo',
      // Dark (13)
      'vercel', 'github', 'x', 'slack', 'discord', 'openai',
      'spotify', 'twitch', 'netflix', 'figma', 'amazon', 'adobe',
      'bloomberg'
    ],
    refreshAll: refreshAll,
    mountAll: mountAll,
    mountOne: mountOne,
    fmt: fmt,
    seeded: seeded,
  };

  // Theme metadata for the FAB picker (ordered mainstream → distinctive)
  var THEME_DATA = [
    { value: 'notion',    brand: 'Notion',     desc: '웜 오프화이트',      accent: '#37352f', accent2: '#2eaadc', bg: '#ffffff', warning: '#cb912f', danger: '#d44c47' },
    { value: 'vercel',    brand: 'Vercel',     desc: '퓨어 미니멀',        accent: '#ffffff', accent2: '#7928ca', bg: '#000000', warning: '#f5a623', danger: '#ff0080' },
    { value: 'linear',    brand: 'Linear',     desc: '인디고 미니멀',      accent: '#5e6ad2', accent2: '#a78bfa', bg: '#fcfcfd', warning: '#f2994a', danger: '#eb5757' },
    { value: 'github',    brand: 'GitHub',     desc: '딤드 다크',          accent: '#58a6ff', accent2: '#a371f7', bg: '#0d1117', warning: '#d29922', danger: '#f85149' },
    { value: 'apple',     brand: 'Apple',      desc: '시스템 블루',        accent: '#007aff', accent2: '#5ac8fa', bg: '#f5f5f7', warning: '#ff9500', danger: '#ff3b30' },
    { value: 'stripe',    brand: 'Stripe',     desc: '페이먼트 퍼플',      accent: '#635bff', accent2: '#00d4ff', bg: '#f6f9fc', warning: '#f5a623', danger: '#cd3d64' },
    { value: 'linkedin',  brand: 'LinkedIn',   desc: '프로페셔널 블루',    accent: '#0a66c2', accent2: '#378fe9', bg: '#f3f2ef', warning: '#e7a33e', danger: '#cc1016' },
    { value: 'x',         brand: 'X',          desc: '샤프 모노',          accent: '#1d9bf0', accent2: '#f91880', bg: '#000000', warning: '#ffd400', danger: '#f4212e' },
    { value: 'medium',    brand: 'Medium',     desc: '에디토리얼 세리프',  accent: '#1a8917', accent2: '#242424', bg: '#ffffff', warning: '#b5a642', danger: '#c94a4a' },
    { value: 'tiffany',   brand: 'Tiffany',    desc: '로빈스에그 블루',    accent: '#0abab5', accent2: '#c9a86c', bg: '#f2f9f8', warning: '#d4a84b', danger: '#c85a5a' },
    { value: 'openai',    brand: 'OpenAI',     desc: 'AI 틸',              accent: '#00a67e', accent2: '#ab68ff', bg: '#202123', warning: '#f59e0b', danger: '#ef4146' },
    { value: 'discord',   brand: 'Discord',    desc: '블러플',             accent: '#5865f2', accent2: '#eb459e', bg: '#313338', warning: '#f0b232', danger: '#f23f42' },
    { value: 'figma',     brand: 'Figma',      desc: '멀티 로고 컬러',     accent: '#ff3737', accent2: '#874fff', bg: '#1e1e1e', warning: '#ff7237', danger: '#ff3737' },
    { value: 'amazon',    brand: 'Amazon',     desc: '마켓 네이비',        accent: '#ff9900', accent2: '#146eb4', bg: '#131a22', warning: '#ff9900', danger: '#b12704' },
    { value: 'airbnb',    brand: 'Airbnb',     desc: '코랄 라운드',        accent: '#ff5a5f', accent2: '#00a699', bg: '#ffffff', warning: '#fc642d', danger: '#c13515' },
    { value: 'adobe',     brand: 'Adobe',      desc: '크리에이티브 레드',  accent: '#fa0c00', accent2: '#ed1c24', bg: '#1d1d1d', warning: '#ffd000', danger: '#fa0c00' },
    { value: 'youtube',   brand: 'YouTube',    desc: '시그니처 레드',      accent: '#ff0000', accent2: '#065fd4', bg: '#ffffff', warning: '#e3a01e', danger: '#cc0000' },
    { value: 'netflix',   brand: 'Netflix',    desc: '시네마틱 레드',      accent: '#e50914', accent2: '#b20710', bg: '#000000', warning: '#ffd700', danger: '#831010' },
    { value: 'reddit',    brand: 'Reddit',     desc: '커뮤니티 오렌지',    accent: '#ff4500', accent2: '#0079d3', bg: '#ffffff', warning: '#ffb000', danger: '#ea0027' },
    { value: 'twitch',    brand: 'Twitch',     desc: '게이밍 퍼플',        accent: '#9146ff', accent2: '#bf94ff', bg: '#0e0e10', warning: '#ffc70b', danger: '#eb0400' },
    { value: 'duolingo',  brand: 'Duolingo',   desc: '오울 그린',          accent: '#58cc02', accent2: '#1cb0f6', bg: '#fffdf7', warning: '#ffc800', danger: '#ff4b4b' },
    { value: 'spotify',   brand: 'Spotify',    desc: '네온 그린',          accent: '#1db954', accent2: '#1ed760', bg: '#121212', warning: '#ffc83d', danger: '#e22134' },
    { value: 'tmobile',   brand: 'T-Mobile',   desc: '시그니처 마젠타',    accent: '#e20074', accent2: '#9b0056', bg: '#ffffff', warning: '#f9a825', danger: '#d9001b' },
    { value: 'mailchimp', brand: 'Mailchimp',  desc: '카벤디시 옐로',      accent: '#ffe01b', accent2: '#007c89', bg: '#fffaeb', warning: '#e89c2a', danger: '#e8515f' },
    { value: 'fedex',     brand: 'FedEx',      desc: '퍼플 오렌지',        accent: '#ff6600', accent2: '#4d148c', bg: '#ffffff', warning: '#ff6600', danger: '#c62828' },
    { value: 'claude',    brand: 'Claude',     desc: '테라코타 크림',      accent: '#da7756', accent2: '#6a9bcc', bg: '#faf9f5', warning: '#d4a037', danger: '#c25e5e' },
    { value: 'instagram', brand: 'Instagram',  desc: '비비드 그라디언트',  accent: '#e1306c', accent2: '#f77737', bg: '#fafafa', warning: '#fcaf45', danger: '#fd1d1d' },
    { value: 'bloomberg', brand: 'Bloomberg',  desc: '터미널 앰버',        accent: '#ffa028', accent2: '#f39f41', bg: '#0a0a0a', warning: '#ffd23f', danger: '#ff4c4c' },
    { value: 'slack',     brand: 'Slack',      desc: '다크 오버진',        accent: '#ecb22e', accent2: '#36c5f0', bg: '#3f0e40', warning: '#ecb22e', danger: '#e01e5a' },
    { value: 'nasa',      brand: 'NASA',       desc: '웜 블루',            accent: '#fc3d21', accent2: '#ffffff', bg: '#0b3d91', warning: '#ffc107', danger: '#fc3d21' },
    { value: 'heineken',  brand: 'Heineken',   desc: '보틀 그린',          accent: '#e10012', accent2: '#ffd700', bg: '#0a3d22', warning: '#ffd700', danger: '#e10012' },
    { value: 'deere',     brand: 'John Deere', desc: '트랙터 그린',        accent: '#ffde00', accent2: '#ffffff', bg: '#2a6221', warning: '#ffde00', danger: '#d9534f' },
    { value: 'hermes',    brand: 'Hermès',     desc: '럭셔리 크림',        accent: '#ff6900', accent2: '#3e2110', bg: '#fdf6ec', warning: '#d17a00', danger: '#ac1b2b' },
    { value: 'ups',       brand: 'UPS',        desc: '풀먼 브라운',        accent: '#ffb500', accent2: '#c89d5a', bg: '#2b1810', warning: '#ffb500', danger: '#d9534f' },
    { value: 'barbie',    brand: 'Barbie',     desc: '파스텔 핑크',        accent: '#e0218a', accent2: '#ffd700', bg: '#fff0f7', warning: '#ffa500', danger: '#8b0000' }
  ];

  function mountThemeFab() {
    if (document.querySelector('.mw-theme-fab')) return; // already mounted

    var fab = document.createElement('div');
    fab.className = 'mw-theme-fab';
    fab.innerHTML =
      '<button type="button" class="mw-theme-fab__btn" aria-expanded="false" aria-label="테마 선택">' +
        '<span class="mw-theme-fab__swatches" aria-hidden="true">' +
          '<span class="mw-theme-fab__swatch mw-theme-fab__swatch--accent" data-swatch="accent"></span>' +
          '<span class="mw-theme-fab__swatch mw-theme-fab__swatch--accent2" data-swatch="accent2"></span>' +
          '<span class="mw-theme-fab__swatch mw-theme-fab__swatch--bg" data-swatch="bg"></span>' +
        '</span>' +
        '<span class="mw-theme-fab__label">Theme</span>' +
        '<svg class="mw-theme-fab__caret" viewBox="0 0 10 10" fill="none" aria-hidden="true">' +
          '<path d="M2 4l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
        '</svg>' +
      '</button>' +
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
    var label    = fab.querySelector('.mw-theme-fab__label');
    var swAccent  = fab.querySelector('[data-swatch="accent"]');
    var swAccent2 = fab.querySelector('[data-swatch="accent2"]');
    var swBg      = fab.querySelector('[data-swatch="bg"]');
    var sortMode = 'popular';

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
    function current() { return document.documentElement.getAttribute('data-theme') || 'claude'; }
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
      swAccent.style.background  = t.accent;
      swAccent2.style.background = t.accent2;
      swBg.style.background      = t.bg;
      label.textContent = t.desc;
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
