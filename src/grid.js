/*! magicwiget-grid v0.1.0 — GridStack adapter for magicwiget | MIT
 *  Requires: window.MagicWiget, window.GridStack (both must be loaded first).
 *
 *  Usage:
 *    <script src="https://cdnjs.cloudflare.com/ajax/libs/echarts/5.6.0/echarts.min.js"></script>
 *    <script src="https://cdn.jsdelivr.net/npm/gridstack@10.3.1/dist/gridstack-all.js"></script>
 *    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/gridstack@10.3.1/dist/gridstack.min.css">
 *    <link rel="stylesheet" href="./dist/magicwiget.css">
 *    <script src="./dist/magicwiget.js"></script>
 *    <script src="./dist/magicwiget-grid.js"></script>
 *
 *    const dash = MagicWiget.grid('#dash', {
 *      items: [
 *        { id: 'kpi-1', type: 'kpi-card', x: 0, y: 0, w: 3, h: 3, config: {...} },
 *        { id: 'rev',   type: 'line-chart', x: 0, y: 3, w: 8, h: 6, config: {...} },
 *      ],
 *      autoSave: 'my-dash-v1',
 *      editable: true,
 *    });
 */
(function (global) {
  'use strict';

  var mw = global.MagicWiget;
  var GS = global.GridStack;

  if (!mw) {
    console.warn('[magicwiget-grid] MagicWiget not found. Load magicwiget.js first.');
    return;
  }
  if (!GS) {
    console.warn('[magicwiget-grid] GridStack not found. Load gridstack-all.js first.');
    return;
  }

  function camelize(s) { return s.replace(/-([a-z])/g, function (_, c) { return c.toUpperCase(); }); }

  function widgetFnFor(type) {
    var fnName = camelize(type);
    return typeof mw[fnName] === 'function' ? mw[fnName] : null;
  }

  function mountWidget(host, type, config) {
    var fn = widgetFnFor(type);
    if (!fn) {
      console.warn('[magicwiget-grid] unknown widget type:', type);
      host.innerHTML = '<div class="mw-card" style="padding:1rem;color:var(--mw-danger)">Unknown widget: ' + type + '</div>';
      return null;
    }
    return fn(host, config || {});
  }

  function itemHTML(item) {
    var attrs = [
      'gs-x="' + (item.x || 0) + '"',
      'gs-y="' + (item.y || 0) + '"',
      'gs-w="' + (item.w || 4) + '"',
      'gs-h="' + (item.h || 3) + '"',
      'gs-id="' + item.id + '"',
    ];
    if (item.minW) attrs.push('gs-min-w="' + item.minW + '"');
    if (item.minH) attrs.push('gs-min-h="' + item.minH + '"');
    if (item.noResize) attrs.push('gs-no-resize="true"');
    if (item.noMove)   attrs.push('gs-no-move="true"');
    return '<div class="grid-stack-item" ' + attrs.join(' ') + '>' +
      '<div class="grid-stack-item-content">' +
        '<div class="mw-grid__host"></div>' +
      '</div>' +
    '</div>';
  }

  function ensureIds(items) {
    var seen = {};
    return items.map(function (it, i) {
      var id = it.id || (it.type + '-' + i);
      while (seen[id]) id += '_';
      seen[id] = 1;
      return Object.assign({}, it, { id: id });
    });
  }

  function loadSaved(key, fallback) {
    if (!key) return fallback;
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      var parsed = JSON.parse(raw);
      return (Array.isArray(parsed) && parsed.length) ? parsed : fallback;
    } catch (e) { return fallback; }
  }

  function persist(key, layout) {
    if (!key) return;
    try { localStorage.setItem(key, JSON.stringify(layout)); } catch (e) {}
  }

  function createGrid(container, options) {
    var host = typeof container === 'string' ? document.querySelector(container) : container;
    if (!host) { console.warn('[magicwiget-grid] container not found:', container); return null; }

    var opts = Object.assign({
      items: [],
      editable: true,
      gridOptions: {},
      autoSave: null,
      onLayoutChange: null,
    }, options || {});

    var defaultItems = ensureIds(opts.items);
    var activeItems = opts.autoSave
      ? mergeLayout(defaultItems, loadSaved(opts.autoSave, null))
      : defaultItems;

    var gridOptions = Object.assign({
      cellHeight: 60,
      margin: 8,
      column: 12,
      animate: true,
      float: false,
      acceptWidgets: false,
      disableOneColumnMode: false,
    }, opts.gridOptions);

    host.innerHTML = activeItems.map(itemHTML).join('');
    var grid = GS.init(gridOptions, host);

    var handles = {};
    activeItems.forEach(function (item) {
      var gsItem = host.querySelector('[gs-id="' + CSS.escape(item.id) + '"]');
      if (!gsItem) return;
      var h = gsItem.querySelector('.mw-grid__host');
      if (h) handles[item.id] = mountWidget(h, item.type, item.config);
    });

    if (!opts.editable) {
      grid.enableMove(false);
      grid.enableResize(false);
    }

    function snapshotLayout() {
      var saved = grid.save(false);
      return saved.map(function (gi) {
        var orig = activeItems.find(function (it) { return it.id === gi.id; });
        return {
          id: gi.id, x: gi.x, y: gi.y, w: gi.w, h: gi.h,
          type: orig && orig.type,
          config: orig && orig.config,
        };
      });
    }

    grid.on('change', function () {
      var layout = snapshotLayout();
      persist(opts.autoSave, layout);
      if (typeof opts.onLayoutChange === 'function') opts.onLayoutChange(layout);
    });

    // ====== Public handle ======
    return {
      grid: grid,
      host: host,
      handles: handles,

      lock: function () {
        grid.enableMove(false);
        grid.enableResize(false);
        host.classList.add('mw-grid--locked');
      },
      unlock: function () {
        grid.enableMove(true);
        grid.enableResize(true);
        host.classList.remove('mw-grid--locked');
      },
      toggleLock: function () {
        if (host.classList.contains('mw-grid--locked')) this.unlock();
        else this.lock();
      },

      add: function (item) {
        var id = item.id || (item.type + '-' + Date.now().toString(36));
        var newItem = Object.assign({}, item, { id: id });
        var el = grid.addWidget({
          x: newItem.x, y: newItem.y, w: newItem.w || 4, h: newItem.h || 3, id: id,
          content: '<div class="mw-grid__host"></div>'
        });
        var h = el.querySelector('.mw-grid__host');
        if (h) handles[id] = mountWidget(h, newItem.type, newItem.config);
        activeItems.push(newItem);
        persist(opts.autoSave, snapshotLayout());
        return handles[id];
      },

      remove: function (id) {
        var el = host.querySelector('[gs-id="' + CSS.escape(id) + '"]');
        if (el) grid.removeWidget(el);
        var h = handles[id];
        if (h && typeof h.destroy === 'function') h.destroy();
        delete handles[id];
        activeItems = activeItems.filter(function (it) { return it.id !== id; });
        persist(opts.autoSave, snapshotLayout());
      },

      update: function (id, newConfig) {
        var h = handles[id];
        if (h && typeof h.update === 'function') h.update(newConfig);
        var it = activeItems.find(function (x) { return x.id === id; });
        if (it) it.config = Object.assign({}, it.config, newConfig);
      },

      getLayout: snapshotLayout,

      // Clear persisted layout and reload with default items
      reset: function () {
        if (opts.autoSave) try { localStorage.removeItem(opts.autoSave); } catch (e) {}
        Object.keys(handles).forEach(function (id) {
          var h = handles[id];
          if (h && typeof h.destroy === 'function') h.destroy();
        });
        handles = {};
        grid.destroy(false);
        activeItems = defaultItems.map(function (x) { return Object.assign({}, x); });
        host.innerHTML = activeItems.map(itemHTML).join('');
        grid = GS.init(gridOptions, host);
        activeItems.forEach(function (item) {
          var gsItem = host.querySelector('[gs-id="' + CSS.escape(item.id) + '"]');
          if (!gsItem) return;
          var h = gsItem.querySelector('.mw-grid__host');
          if (h) handles[item.id] = mountWidget(h, item.type, item.config);
        });
        grid.on('change', function () {
          var layout = snapshotLayout();
          persist(opts.autoSave, layout);
          if (typeof opts.onLayoutChange === 'function') opts.onLayoutChange(layout);
        });
      },

      destroy: function () {
        Object.keys(handles).forEach(function (id) {
          var h = handles[id];
          if (h && typeof h.destroy === 'function') h.destroy();
        });
        handles = {};
        grid.destroy(true);
        host.innerHTML = '';
      },
    };
  }

  // Merge saved layout (positions) with default items (type+config).
  // Saved entries keep their x/y/w/h; type/config pulled from default by id.
  function mergeLayout(defaultItems, saved) {
    if (!saved || !Array.isArray(saved) || !saved.length) return defaultItems;
    var byId = {};
    defaultItems.forEach(function (it) { byId[it.id] = it; });
    return saved
      .filter(function (s) { return s.id && byId[s.id]; })
      .map(function (s) {
        return Object.assign({}, byId[s.id], {
          x: s.x, y: s.y, w: s.w, h: s.h,
          config: s.config || byId[s.id].config,
        });
      });
  }

  mw.grid = createGrid;
})(typeof window !== 'undefined' ? window : this);
