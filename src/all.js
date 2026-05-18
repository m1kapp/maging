/*! maging-all v0.1.25 — single-tag bootstrap | MIT
 *
 *  <script src="https://cdn.jsdelivr.net/npm/@m1kapp/maging@0.1.25/dist/maging-all.js"></script>
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
 *    ⑥ maging-charts.js        — chart widgets
 *    ⑦ maging-landing.js       — landing page builder + widgets
 *
 *  Load order is enforced via Promise chain.
 *  CSS loads in parallel; JS runs after ECharts is ready.
 *
 *  Skip a default via data-attributes on this script tag:
 *    <script src="...maging-all.js" data-no-tailwind data-version="v0.1.25"></script>
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
  var VERSION = ds.version || '0.1.25';
  var BASE    = ds.base || 'https://cdn.jsdelivr.net/npm/@m1kapp/maging@' + VERSION + '/dist/';

  var SKIP_TAILWIND   = ds.noTailwind   != null;
  var SKIP_ECHARTS    = ds.noEcharts    != null;
  var SKIP_PRETENDARD = ds.noPretendard != null;  // not used (Pretendard is in maging.css @import); flag reserved

  // Propagate cache-bust query string from our own src (e.g. ?v=123) to sub-scripts
  var BUST = (self && self.src && self.src.indexOf('?') !== -1) ? self.src.slice(self.src.indexOf('?')) : '';

  function appendLink(href) {
    return new Promise(function (resolve) {
      var el = document.createElement('link');
      el.rel = 'stylesheet';
      el.href = href;
      el.onload = function () { resolve(el); };
      el.onerror = function () { resolve(el); }; // non-fatal — resolve anyway
      (document.head || document.documentElement).appendChild(el);
    });
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

  // Allow late listeners: if 'maging:ready' already fired, replay it.
  var _readyDetail = null;
  var _origAddEventListener = window.addEventListener;
  window.addEventListener = function (type, fn, opts) {
    _origAddEventListener.call(window, type, fn, opts);
    if (type === 'maging:ready' && _readyDetail) {
      try { fn(new CustomEvent('maging:ready', { detail: _readyDetail })); } catch (_e) {}
    }
  };

  // ① CSS — starts loading in parallel with JS
  var cssP = appendLink(BASE + 'maging.css' + BUST);

  // ② Tailwind Play (optional)
  if (!SKIP_TAILWIND) {
    // Fetch Tailwind CDN as text, strip the production warning at source,
    // then execute as inline script. This is the only reliable way to
    // suppress the warning — console.warn patching doesn't work because
    // Tailwind captures a closure reference to the native console object.
    fetch('https://cdn.tailwindcss.com')
      .then(function (r) { return r.text(); })
      .then(function (src) {
        var el = document.createElement('script');
        el.textContent = src.replace(/\.warn\("[^"]*cdn\.tailwindcss\.com[^"]*"\)/g, 'void 0');
        (document.head || document.documentElement).appendChild(el);
      })
      .catch(function (e) {
        // Fallback: load normally (warning will appear but Tailwind still works)
        loadScript('https://cdn.tailwindcss.com').catch(function () {});
      });
  }

  // ③ ECharts → ④ maging.js → ⑤ charts → ⑥ landing (ordered)
  var jsP = (SKIP_ECHARTS
    ? Promise.resolve()
    : loadScript('https://cdnjs.cloudflare.com/ajax/libs/echarts/5.6.0/echarts.min.js')
  )
    .then(function () { return loadScript(BASE + 'maging.js' + BUST); })
    .then(function () { return loadScript(BASE + 'maging-charts.js' + BUST); })
    .then(function () { return loadScript(BASE + 'maging-landing.js' + BUST); });

  // ⑦ maging:ready — fires only after BOTH CSS and JS are ready
  Promise.all([cssP, jsP])
    .then(function () {
      _readyDetail = { version: VERSION, base: BASE };
      emit('ready', _readyDetail);
    })
    .catch(function (err) {
      console.error(err);
      emit('error', { error: err, version: VERSION });
    });
})();
