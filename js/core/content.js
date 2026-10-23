(function () {
  'use strict';

  var FILES = {
    settings: 'content/site/settings.json',
    links: 'content/site/links.json',
    hero: 'content/home/hero.json',
    about: 'content/home/about.json',
    bands: 'content/home/bands.json',
    roster: 'content/home/roster.json',
    services: 'content/home/services.json',
    releases: 'content/home/releases.json',
    stats: 'content/home/stats.json',
    mb: 'content/home/music-business.json',
    houses: 'content/home/houses.json',
    playlist: 'content/home/playlist.json',
    contact: 'content/home/contact.json',
    artists: 'content/artists/artists.json',
    artistPage: 'content/artists/page.json'
  };

  var PAGES = {
    home: ['settings', 'links', 'hero', 'about', 'bands', 'roster', 'services', 'releases', 'stats', 'mb', 'houses', 'playlist', 'contact', 'artists'],
    artist: ['settings', 'links', 'artists', 'artistPage']
  };

  var data = {};

  function load(name) {
    return fetch(FILES[name], { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      })
      .then(function (json) { data[name] = json; })
      .catch(function (e) {
        data[name] = {};
        console.error('No se pudo cargar ' + FILES[name] + ' (' + e.message + '). Abre la página desde un servidor (GitHub Pages o Live Server), no como archivo.');
      });
  }

  function pick(obj, key) {
    if (!obj) return '';
    var es = obj[key + '_es'], en = obj[key + '_en'];
    if (OMG.lang === 'en' && en != null && en !== '') return en;
    if (es != null && es !== '') return es;
    if (obj[key] != null) return obj[key];
    return en || '';
  }

  function get(path) {
    var parts = path.split('.');
    var obj = data[parts.shift()];
    var key = parts.pop();
    parts.forEach(function (p) { obj = obj && obj[p]; });
    return pick(obj, key);
  }

  function fmt(s, mark) {
    var html = OMG.esc(String(s == null ? '' : s).replace(/^[\r\n]+|[\r\n]+$/g, ''));
    var open = mark === 'strong' ? '<strong>' : '<span class="' + (mark || 'hl') + '">';
    var close = mark === 'strong' ? '</strong>' : '</span>';
    return html
      .replace(/\*([^*]+)\*/g, function (m, t) { return open + t + close; })
      .replace(/\r?\n/g, '<br>');
  }

  function media(p) {
    if (!p) return '';
    if (/^([a-z]+:)?\/\//i.test(p) || /^(data|blob|mailto|tel):/i.test(p)) return p;
    return String(p).replace(/^\/+/, '');
  }

  function list(path) {
    var parts = path.split('.');
    var obj = data[parts.shift()];
    parts.forEach(function (p) { obj = obj && obj[p]; });
    return Array.isArray(obj) ? obj : [];
  }

  function apply() {
    OMG.$$('[data-c]').forEach(function (el) {
      var v = get(el.dataset.c);
      if (v !== '' && v != null) el.innerHTML = fmt(v, el.dataset.cMark);
    });
    OMG.$$('[data-c-attr]').forEach(function (el) {
      el.dataset.cAttr.split(';').forEach(function (pair) {
        var p = pair.split(':');
        var attr = p[0].trim();
        var v = get((p[1] || '').trim());
        if (v === '' || v == null) return;
        if (attr === 'src' || attr === 'href' || attr === 'data-src') v = media(v);
        el.setAttribute(attr, v);
      });
    });
    var title = OMG.page === 'home' ? get('settings.seo_title') : '';
    if (title) document.title = title;
    var desc = OMG.page === 'home' ? get('settings.seo_description') : get('artistPage.seo_description');
    var meta = OMG.$('meta[name="description"]');
    if (desc && meta) meta.setAttribute('content', desc);
  }

  OMG.content = data;
  OMG.pick = pick;
  OMG.c = get;
  OMG.list = list;
  OMG.fmt = fmt;
  OMG.media = media;

  OMG.ready = Promise.all((PAGES[OMG.page] || []).map(load)).then(function () {
    apply();
    document.documentElement.classList.remove('c-wait');
  });
})();
