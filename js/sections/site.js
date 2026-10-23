OMG.register('site', {
  render: function () {
    var esc = OMG.esc;
    var link = function (l) { return '<a href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(l.label) + '</a>'; };
    var valid = function (l) { return l && l.label && l.url; };
    var social = OMG.list('links.social').filter(valid);
    var family = OMG.list('links.family').filter(valid);
    var pubUrl = OMG.c('links.publishing_url');
    var pubLabel = OMG.c('links.publishing_label');

    OMG.$$('[data-links]').forEach(function (box) {
      var type = box.dataset.links;
      var items = type === 'family' ? family : social;
      var html = items.map(function (l) { return box.tagName === 'UL' ? '<li>' + link(l) + '</li>' : link(l); }).join('');
      if (type === 'menu' && pubUrl) html += link({ url: pubUrl, label: (pubLabel || 'Publishing') + ' ↗' });
      if (html) box.innerHTML = html;
    });

    var news = OMG.$('form.news');
    if (news) {
      news.addEventListener('submit', function (e) {
        e.preventDefault();
        OMG.$('button', news).textContent = OMG.c('settings.news_done') || '¡Listo!';
      });
    }
  }
});
