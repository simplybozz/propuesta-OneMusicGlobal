(function () {
  'use strict';

  var KEY = 'omg-lang';
  var LANGS = ['es', 'en'];

  var UI = {
    en: {
      'a11y.home': 'One Music Global — home',
      'a11y.mainNav': 'Main',
      'a11y.lang': 'Language',
      'a11y.hero': 'Home',
      'a11y.artists': 'Artists',
      'a11y.stats': 'Numbers',
      'a11y.houses': 'Global and Publishing',
      'a11y.email': 'Email',
      'cursor.view': 'VIEW',
      'cursor.here': 'HERE',
      'cursor.go': 'GO',
      'cursor.up': 'UP',
      'cursor.next': 'NEXT',
      'cursor.soon': 'SOON',
      'menu.label': 'Menu',
      'menu.closeLabel': 'Close',
      'menu.open': 'Open menu',
      'menu.close': 'Close menu',
      'hero.play': "Listen to One's Playlist",
      'releases.soon': 'Coming soon',
      'releases.listen': 'Listen to {title} by {artist}',
      'releases.cover': 'Cover of {title}',
      'playlist.frame': "One's Playlist on Spotify",
      'toTop': 'Back to top',
      'player.label': 'Player',
      'player.play': 'Play',
      'player.pause': 'Pause',
      'player.close': 'Close player'
    }
  };

  function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(l) { try { localStorage.setItem(KEY, l); return true; } catch (e) { return false; } }

  var param = new URLSearchParams(location.search).get('lang');
  var lang = LANGS.indexOf(param) > -1 ? param : (read() === 'en' ? 'en' : 'es');
  if (param) save(lang);
  var ui = UI[lang] || {};

  function t(key, fallback, vars) {
    var s = ui[key] != null ? ui[key] : fallback;
    if (vars) s = String(s).replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; });
    return s;
  }

  OMG.$$('[data-i18n]').forEach(function (el) {
    var v = ui[el.dataset.i18n];
    if (v != null) el.textContent = v;
  });
  OMG.$$('[data-i18n-attr]').forEach(function (el) {
    el.dataset.i18nAttr.split(';').forEach(function (pair) {
      var p = pair.split(':');
      var v = ui[(p[1] || '').trim()];
      if (v != null) el.setAttribute(p[0].trim(), v);
    });
  });
  document.documentElement.lang = lang;

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
})();
