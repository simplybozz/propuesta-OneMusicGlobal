(function () {
  'use strict';

  var KEY = 'omg-lang';
  var LANGS = ['es', 'en'];
  var dict = OMG.data.i18n || {};
  var root = document.documentElement;

  function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(l) { try { localStorage.setItem(KEY, l); return true; } catch (e) { return false; } }

  var param = new URLSearchParams(location.search).get('lang');
  var lang = LANGS.indexOf(param) > -1 ? param : (read() === 'en' ? 'en' : 'es');
  if (param) save(lang);

  var pack = dict[lang] || null;
  var ui = (pack && pack.ui) || {};
  var content = (pack && pack.content) || {};

  function t(key, fallback, vars) {
    var s = ui[key] != null ? ui[key] : fallback;
    if (vars) s = String(s).replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; });
    return s;
  }

  function tr(text) {
    if (!pack || text == null) return text;
    if (content[text] != null) return content[text];
    return String(text).split(' · ').map(function (p) { return content[p] != null ? content[p] : p; }).join(' · ');
  }

  if (pack) {
    OMG.$$('[data-i18n]').forEach(function (el) {
      var v = ui[el.dataset.i18n];
      if (v != null) el.innerHTML = v;
    });
    OMG.$$('[data-i18n-attr]').forEach(function (el) {
      el.dataset.i18nAttr.split(';').forEach(function (pair) {
        var p = pair.split(':');
        var v = ui[(p[1] || '').trim()];
        if (v != null) el.setAttribute(p[0].trim(), v);
      });
    });
  }
  root.lang = lang;
  root.classList.remove('i18n-wait');

  function mark(l) {
    OMG.$$('.lang').forEach(function (sw) {
      sw.dataset.active = l;
      OMG.$$('[data-lang]', sw).forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.lang === l)); });
    });
  }

  var switching = false;
  function setLang(next) {
    if (switching || next === lang || LANGS.indexOf(next) < 0) return;
    switching = true;
    mark(next);
    var url = new URL(location.href);
    url.searchParams.delete('lang');
    if (!save(next)) url.searchParams.set('lang', next);
    var go = function () { location.replace(url.toString()); };
    setTimeout(function () { if (OMG.leave) OMG.leave(go, true); else go(); }, 280);
  }

  mark(lang);
  OMG.$$('.lang [data-lang]').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.dataset.lang); });
  });

  OMG.lang = lang;
  OMG.t = t;
  OMG.tr = tr;
})();
