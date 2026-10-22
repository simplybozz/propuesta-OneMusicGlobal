(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var icons = {
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" width="14"><path d="M7 17 17 7M8 7h9v9"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0c1 7 5 11 12 12-7 1-11 5-12 12-1-7-5-11-12-12 7-1 11-5 12-12z"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4v16l14-8z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>',
    loading: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 3a9 9 0 1 0 9 9"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur=".8s" repeatCount="indefinite"/></path></svg>'
  };

  function splitWords(el) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (node) {
      if (!node.textContent.trim()) return;
      var frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        var s = document.createElement('span'); s.className = 'w'; s.textContent = part; frag.appendChild(s);
      });
      node.parentNode.replaceChild(frag, node);
    });
    return $$('.w', el);
  }

  function splitChars(el) {
    var text = el.textContent;
    el.textContent = '';
    text.split('').forEach(function (ch) {
      var s = document.createElement('span');
      var inner = document.createElement('span');
      s.className = 'char';
      inner.textContent = ch === ' ' ? ' ' : ch;
      s.appendChild(inner);
      el.appendChild(s);
    });
    return $$('.char', el);
  }

  function drawPath(path) {
    var len = path.getTotalLength();
    window.gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    return len;
  }

  function onResize(fn) {
    var t;
    window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(fn, 200); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fn);
  }

  function fitLines() {
    var items = $$('[data-fit-to]');
    if (!items.length) return;
    var fit = function () {
      items.forEach(function (el) {
        var ref = $(el.dataset.fitTo);
        if (!ref) return;
        var box = el.closest('.line') || el;
        box.style.fontSize = '';
        var w = el.scrollWidth, target = ref.scrollWidth;
        if (w && target) box.style.fontSize = (target / w).toFixed(3) + 'em';
      });
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    };
    fit();
    onResize(fit);
  }

  var sections = [];

  window.OMG = {
    $: $,
    $$: $$,
    esc: esc,
    icons: icons,
    data: window.OMG_DATA || {},
    page: document.body.dataset.page,
    splitWords: splitWords,
    splitChars: splitChars,
    drawPath: drawPath,
    onResize: onResize,
    fitLines: fitLines,
    sections: sections,
    register: function (name, def) { def.name = name; sections.push(def); }
  };
})();
