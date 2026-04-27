/*! maging-all v0.1.16 — single-tag bootstrap | MIT
 *
 *  <script src="https://cdn.jsdelivr.net/npm/@m1kapp/maging@0.1.16/dist/maging-all.js"></script>
 *
 *  Auto-injects (in this order):
 *    ① Fonts (via maging.css @import):
 *        · Pretendard Variable — Korean sans
 *        · Hahmlet             — Korean serif (Claude/Medium/Tiffany/Hermès)
 *        · Tossface            — color emoji (prepended to every stack)
 *        · Inter               — Latin sans display/body
 *        · Playfair Display    — Latin serif display
 *        · JetBrains Mono      — mono
 *    ② maging.css              — 35 brand themes + widget styles
 *    ③ Tailwind Play CDN       — layout utilities (JIT, ~28KB gz overhead)
 *    ④ ECharts 5               — chart engine (required by maging.js)
 *    ⑤ maging.js               — 31 widgets + theme runtime
 *
 *  Load order is enforced via Promise chain.
 *  CSS loads in parallel; JS runs after ECharts is ready.
 *
 *  Skip a default via data-attributes on this script tag:
 *    <script src="...maging-all.js" data-no-tailwind data-version="v0.1.16"></script>
 *
 *  Events dispatched on window:
 *    'maging:ready'  — everything loaded, widgets can mount
 *    'maging:error'  — a dependency failed to load (details in event.detail)
 */
(function () {
  'use strict';

  // Resolve the script tag that loaded us (to read data-* attrs + derive base URL).
  var self = document.currentScript || (function () {
    var scripts = document.getElementsByTagName('script');
    for (var i = scripts.length - 1; i >= 0; i--) {
      if (scripts[i].src && scripts[i].src.indexOf('maging-all') !== -1) return scripts[i];
    }
    return null;
  })();

  var ds = (self && self.dataset) || {};
  var VERSION = ds.version || '0.1.16';
  var BASE    = ds.base || 'https://cdn.jsdelivr.net/npm/@m1kapp/maging@' + VERSION + '/dist/';

  var SKIP_TAILWIND   = ds.noTailwind   != null;
  var SKIP_ECHARTS    = ds.noEcharts    != null;
  var SKIP_PRETENDARD = ds.noPretendard != null;  // not used (Pretendard is in maging.css @import); flag reserved

  function appendLink(href) {
    var el = document.createElement('link');
    el.rel = 'stylesheet';
    el.href = href;
    (document.head || document.documentElement).appendChild(el);
    return el;
  }

  function loadScript(src, opts) {
    opts = opts || {};
    return new Promise(function (resolve, reject) {
      var el = document.createElement('script');
      el.src = src;
      if (opts.async) el.async = true;
      if (opts.defer) el.defer = true;
      el.onload  = function () { resolve(el); };
      el.onerror = function () { reject(new Error('[maging-all] failed to load: ' + src)); };
      (document.head || document.documentElement).appendChild(el);
    });
  }

  function emit(type, detail) {
    try {
      window.dispatchEvent(new CustomEvent('maging:' + type, { detail: detail || {} }));
    } catch (_e) { /* no-op */ }
  }

  // ① + ② CSS — parallel, non-blocking
  appendLink(BASE + 'maging.css');

  // ③ Tailwind Play (optional)
  if (!SKIP_TAILWIND) {
    loadScript('https://cdn.tailwindcss.com').catch(function (e) {
      console.warn('[maging-all] Tailwind Play failed (non-fatal):', e.message);
    });
  }

  // ④ ECharts → ⑤ maging.js (ordered)
  var echartsP = SKIP_ECHARTS
    ? Promise.resolve()
    : loadScript('https://cdnjs.cloudflare.com/ajax/libs/echarts/5.6.0/echarts.min.js');

  echartsP
    .then(function () {
      return loadScript(BASE + 'maging.js');
    })
    .then(function () {
      emit('ready', { version: VERSION, base: BASE });
    })
    .catch(function (err) {
      console.error(err);
      emit('error', { error: err, version: VERSION });
    });
})();
