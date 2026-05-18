/*! maging-charts v0.1.25 — ECharts widget bundle | MIT
 *  Requires: maging.js (core) + ECharts 5+
 *  Auto-registers chart widgets onto window.Maging
 */
(function () {
  'use strict';
  var M = window.Maging;
  if (!M || !M._internals) { console.warn('[maging-charts] requires maging.js'); return; }

  var I = M._internals;
  var q = I.q, EC = I.EC, getColors = I.getColors, parseHex = I.parseHex,
      withAlpha = I.withAlpha, buildPalette = I.buildPalette, baseTooltip = I.baseTooltip,
      headerHTML = I.headerHTML, _applyCommon = I._applyCommon, escapeHTML = I.escapeHTML,
      toStr = I.toStr, _autoDerive = I._autoDerive, _autoValueHTML = I._autoValueHTML,
      _valOrEsc = I._valOrEsc, safeNum = I.safeNum, register = I.register,
      _chartBase = I._chartBase, fmt = I.fmt, plainFmt = I.plainFmt, stripHTML = I.stripHTML;

  // Tailwind class-string constants (from maging.js core)
  var _card = I._card;
  var _chartBody = I._chartBody;
  var _ringContext = I._ringContext;
  var _kpiDelta = I._kpiDelta;

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
          emphasis: { disabled: true },
          data: s.data,
          lineStyle: { color: col, width: 1.5 },
          itemStyle: { color: col, borderColor: c.surface, borderWidth: 1 },
          connectNulls: true,
          areaStyle: data.area ? {
            color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: withAlpha(col, 0.33) },
                { offset: 1, color: withAlpha(col, 0.03) },
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
        tooltip: Object.assign({ trigger: 'axis', axisPointer: { type: 'line', lineStyle: { color: c.border, type: 'dashed' } } }, baseTooltip(c),
          data.yFormatter ? { valueFormatter: function(v) { return v == null ? '-' : data.yFormatter(v); } } : { valueFormatter: function(v) { return v == null ? '-' : v; } }),
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
            data.yFormatter ? { formatter: plainFmt(data.yFormatter) } : {}),
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
            emphasis: { disabled: true },
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
              data.yFormatter ? { formatter: plainFmt(data.yFormatter) } : {}
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
            data: (function () {
              var rev = values.slice().reverse();
              var pal = buildPalette(c, rev.length);
              return rev.map(function (v, i) {
                return { value: v, itemStyle: { color: pal[rev.length - 1 - i], borderRadius: [0, 4, 4, 0] } };
              });
            })(),
            barWidth: '58%',
            label: data.showLabels ? {
              show: true, position: 'right',
              color: c.muted, fontFamily: c.font, fontSize: 11,
              formatter: function (p) { return tipFmt ? stripHTML(tipFmt(p.value)) : safeNum(p.value); },
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
          axisLabel: Object.assign({ color: c.muted, fontSize: 10, fontFamily: c.mono, margin: 8 }, tipFmt ? { formatter: plainFmt(tipFmt) } : {}),
          splitLine: { lineStyle: { color: c.border, type: [4, 4], opacity: 0.6 } },
        },
        series: [{
          type: 'bar', barWidth: '50%',
          data: values.map(function (v, i) {
            var pal = buildPalette(c, values.length);
            return { value: v, itemStyle: { color: pal[i], borderRadius: [4, 4, 0, 0] } };
          }),
        }],
      };
    });
  }

  // ==========================================================
  // Widget: Funnel (ECharts trapezoid — single hue + conversion labels)
  // ==========================================================
  function funnelChart(el, config) {
    return _chartBase(el, config, {
      stages: [], valueSuffix: '',
    }, 'funnel-chart', function (data, c) {
      var stages = data.stages || [];
      return {
        textStyle: { fontFamily: c.font },
        tooltip: Object.assign({}, baseTooltip(c), {
          formatter: function (p) { return escapeHTML(p.name) + ': ' + safeNum(p.value) + (data.valueSuffix || ''); }
        }),
        series: [{
          type: 'funnel',
          left: 80, right: 80, top: 6, bottom: 6,
          min: 0, sort: 'descending', gap: 3,
          label: {
            show: true, position: 'right',
            fontFamily: c.font, fontSize: 11, color: c.muted,
            formatter: function (p) {
              var i = -1;
              for (var k = 0; k < stages.length; k++) { if (stages[k].label === p.name) { i = k; break; } }
              var line = escapeHTML(p.name) + '  ' + safeNum(p.value) + (data.valueSuffix || '');
              if (i > 0) {
                var prev = stages[i - 1].value;
                var rate = prev > 0 ? (p.value / prev * 100).toFixed(1) : '0.0';
                line += '  (' + rate + '%)';
              }
              return line;
            },
          },
          labelLine: { show: true, length: 12, lineStyle: { color: c.border } },
          itemStyle: { borderColor: c.surface, borderWidth: 1 },
          data: stages.map(function (s, i) {
            var opacity = stages.length > 1 ? (1 - i * 0.5 / (stages.length - 1)) : 1;
            return {
              name: s.label, value: s.value,
              itemStyle: { color: c.accent, opacity: opacity },
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
    }, 'donut-chart', function (data, c, palette, size) {
      // Auto-group: if >5 slices, merge smallest into "기타"
      if (data.slices.length > 5) {
        var sorted = data.slices.slice().sort(function (a, b) { return (b.value || 0) - (a.value || 0); });
        var top = sorted.slice(0, 4);
        var rest = sorted.slice(4);
        var restSum = rest.reduce(function (s, x) { return s + (x.value || 0); }, 0);
        data.slices = top.concat([{ label: '기타', value: restSum }]);
      }
      var total = data.slices.reduce(function (s, x) { return s + (x.value || 0); }, 0);
      // Auto-normalize: if slices look like percentages but don't sum to 100, fix them
      if (total > 0 && total !== 100 && data.slices.every(function(s) { return s.value <= 100; }) && total > 80 && total < 120) {
        var factor = 100 / total;
        data.slices.forEach(function(s) { s.value = Math.round(s.value * factor * 10) / 10; });
        total = 100;
      }
      var centerVal = data.centerValue != null ? String(data.centerValue).replace(/<[^>]*>/g, '') : safeNum(total);
      var w = size.width || 300;
      var h = size.height || 200;
      var narrow = w < 320;
      var legendFmt = function (name) {
        var s = data.slices.find(function (x) { return x.label === name; });
        if (!s) return name;
        var pct = total > 0 ? (s.value / total * 100).toFixed(0) : 0;
        return name + '  ' + pct + '%';
      };
      var legend, pieCenter, pieRadius;
      if (narrow) {
        // Vertical layout: chart top, legend bottom (wrap, no scroll)
        var legendH = Math.ceil(data.slices.length / 2) * 20 + 8;
        var chartH = h - legendH - 10;
        var r = Math.min(w, chartH) * 0.38;
        pieCenter = ['50%', chartH / 2];
        pieRadius = [r * 0.68, r];
        legend = {
          orient: 'horizontal', bottom: 0, left: 'center',
          textStyle: { color: c.muted, fontFamily: c.font, fontSize: 10 },
          icon: 'circle', itemWidth: 6, itemHeight: 6, itemGap: 8,
          formatter: legendFmt,
        };
      } else {
        // Horizontal layout: chart left, legend right
        var dim = Math.min(w, h);
        var legendW = 110;
        var chartW = w - legendW;
        var cx = Math.max(chartW / 2, dim * 0.35);
        var outerR = Math.min(dim * 0.42, chartW * 0.45);
        pieCenter = [cx, '50%'];
        pieRadius = [outerR * 0.68, outerR];
        legend = {
          orient: 'vertical', right: 12, top: 'middle',
          textStyle: { color: c.muted, fontFamily: c.font, fontSize: 11 },
          icon: 'circle', itemWidth: 6, itemHeight: 6, itemGap: 10,
          type: 'scroll', formatter: legendFmt,
        };
      }
      return {
        textStyle: { fontFamily: c.font },
        tooltip: baseTooltip(c),
        legend: legend,
        series: [{
          type: 'pie',
          radius: pieRadius,
          center: pieCenter,
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
          data: (function () {
            var pal = buildPalette(c, data.slices.length);
            return data.slices.map(function (s, i) {
              return {
                name: s.label, value: s.value,
                itemStyle: { color: s.color || pal[i], borderColor: c.surface, borderWidth: 2 },
              };
            });
          })(),
        }],
      };
    });
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
      var fmtVal = typeof data.valueFormatter === 'function' ? stripHTML(data.valueFormatter(data.value))
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
              areaStyle: { color: withAlpha(col, 0.13) },
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
    }, 'treemap-chart', function (data, c) {
      var palette = buildPalette(c, (data.items || []).length);
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
      var palette = buildPalette(c, data.nodes.length);
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

    function fmtFn(v) {
      return typeof data.yFormatter === 'function' ? data.yFormatter(v) : v;
    }

    function render() {
      var c = getColors();
      el.className += ' ' + _card; el.dataset.mwCard = '';
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
      if (!EC() || !data.series || !data.series.length || !data.categories || !data.categories.length) return;

      var chartEl = el.querySelector('.mw-mchrt__chart');
      chart = EC().init(chartEl, null, { renderer: 'svg' });
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
              { offset: 0, color: withAlpha(c.accent, 0.27) },
              { offset: 1, color: withAlpha(c.accent, 0.02) },
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
            params.forEach(function(p) { html += '<div>' + p.marker + ' ' + fmtFn(p.value) + '</div>'; });
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
          axisLabel: { fontSize: 9, color: c.muted, formatter: function(v) { return fmtFn(v); }, margin: 8 },
          splitLine: { lineStyle: { color: c.border, type: 'dashed', opacity: 0.4 } },
          axisTick: { show: false }, axisLine: { show: false },
        },
        series: series,
      });

      if (typeof ResizeObserver !== 'undefined') {
        ro = new ResizeObserver(function() { if (chart) chart.resize(); });
        ro.observe(chartEl);
      }
      _applyCommon(el, data);
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
        I.registry.delete(handle);
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
      return data.context ? '<div class="' + _ringContext + '">' + escapeHTML(data.context) + '</div>' : '';
    });
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
  // Widget: Map Chart (hex tile map — Korea by default)
  // No GeoJSON dependency. Provinces laid out in a hex-ish grid.
  // ==========================================================
  var KOREA_TILES = [
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
      items: [],
      valueFormatter: null,
      height: 320,
    }, config || {});

    function render() {
      el.className += ' ' + _card; el.dataset.mwCard = '';
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
      _applyCommon(el, data);
    }
    render();
    var handle = {
      el: el, type: 'map-chart',
      refresh: render,
      update: function (newData) { data = Object.assign(data, newData || {}); render(); },
      destroy: function () { el.innerHTML = ''; I.registry.delete(handle); },
    };
    return register(handle);
  }

  // ==========================================================
  // Widget: Waterfall Chart — start → gains/losses → total
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
      var wfFmt = data.valueFormatter || safeNum;
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
              '<div>' + sign + wfFmt(it.value) + '</div>';
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
          axisLabel: { color: c.muted, fontSize: 11, formatter: plainFmt(wfFmt) },
          splitLine: { lineStyle: { color: c.border, type: 'dashed' } },
        },
        series: [
          { name: '_helper', type: 'bar', stack: 'total', silent: true,
            itemStyle: { color: 'transparent' }, data: helper },
          { name: '증가', type: 'bar', stack: 'total',
            itemStyle: { color: gainCol, borderRadius: [3, 3, 0, 0] }, data: gain,
            label: { show: true, position: 'top', color: gainCol, fontSize: 10,
                     formatter: function (p) { return p.value ? '+' + stripHTML(wfFmt(p.value)) : ''; } } },
          { name: '감소', type: 'bar', stack: 'total',
            itemStyle: { color: lossCol, borderRadius: [3, 3, 0, 0] }, data: loss,
            label: { show: true, position: 'top', color: lossCol, fontSize: 10,
                     formatter: function (p) { return p.value ? '−' + stripHTML(wfFmt(p.value)) : ''; } } },
          { name: '합계', type: 'bar', stack: 'total',
            itemStyle: { color: totCol, borderRadius: [3, 3, 0, 0] }, data: total,
            label: { show: true, position: 'top', color: c.text, fontWeight: 600, fontSize: 11,
                     formatter: function (p) { return p.value ? stripHTML(wfFmt(p.value)) : ''; } } },
        ],
      };
    });
  }

  // ==========================================================
  // Widget: Cohort Matrix — retention grid (Mixpanel-style)
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
      el.className += ' ' + _card; el.dataset.mwCard = '';
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
      _applyCommon(el, data);
    }
    render();
    var handle = {
      el: el, type: 'cohort-matrix',
      refresh: render,
      update: function (newData) { data = Object.assign(data, newData || {}); render(); },
      destroy: function () { el.innerHTML = ''; I.registry.delete(handle); },
    };
    return register(handle);
  }

  // ==========================================================
  // Widget: Bullet Chart — actual vs target vs benchmark
  // ==========================================================
  function bulletChart(el, config) {
    return _chartBase(el, Object.assign({ height: 140 }, config), {
      value: 0, target: null, benchmark: null,
      max: 100, min: 0, unit: '',
      valueFormatter: null,
      ranges: [],
    }, 'bullet-chart', function (data, c) {
      var bFmt = data.valueFormatter || safeNum;
      // If custom formatter is provided, don't auto-append unit (it's already in the formatted string)
      var unitSuffix = data.valueFormatter ? '' : (data.unit || '');
      var toAlpha = withAlpha;

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
        bandSeries.push({
          name: 'range', type: 'bar', stack: 'band', silent: true,
          data: [data.max - data.min], barWidth: '68%',
          itemStyle: { color: toAlpha(c.accent, 0.1) },
        });
      }

      var markLines = [];
      if (data.target != null) {
        markLines.push({
          xAxis: data.target,
          lineStyle: { color: c.text, width: 2 },
          label: { show: true, position: 'end',
                   formatter: '목표 ' + bFmt(data.target) + unitSuffix,
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
                   formatter: '벤치 ' + bFmt(data.benchmark) + unitSuffix,
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
            var s = '<b>실적 ' + bFmt(data.value) + unitSuffix + '</b>';
            if (data.target != null) s += '<br/>목표: ' + bFmt(data.target) + unitSuffix;
            if (data.benchmark != null) s += '<br/>벤치: ' + bFmt(data.benchmark) + unitSuffix;
            return s;
          },
        }),
        xAxis: {
          type: 'value', min: data.min, max: data.max,
          axisLine: { lineStyle: { color: c.border } },
          axisTick: { show: false },
          axisLabel: { color: c.muted, fontSize: 10, formatter: bFmt, margin: 8 },
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
  // Register all chart widgets onto window.Maging
  // ==========================================================
  M.lineChart = lineChart;
  M.barChart = barChart;
  M.funnelChart = funnelChart;
  M.donutChart = donutChart;
  M.heatmapChart = heatmapChart;
  M.gaugeChart = gaugeChart;
  M.radarChart = radarChart;
  M.treemapChart = treemapChart;
  M.scatterChart = scatterChart;
  M.sankeyChart = sankeyChart;
  M.metricChart = metricChart;
  M.ringProgress = ringProgress;
  M.calendarHeatmap = calendarHeatmap;
  M.mapChart = mapChart;
  M.waterfallChart = waterfallChart;
  M.cohortMatrix = cohortMatrix;
  M.bulletChart = bulletChart;
})();
