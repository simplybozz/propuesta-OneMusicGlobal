OMG.register('services', {
  render: function () {
    var box = OMG.$('[data-render="services"]');
    if (!box) return;
    var esc = OMG.esc;
    var list = OMG.data.services || [];
    var total = String(list.length).padStart(2, '0');
    box.innerHTML = list.map(function (s, i) {
      var title = esc(s.title) + (s.highlight ? ' <span class="hl">' + esc(s.highlight) + '</span>' : '');
      return '' +
        '<article class="svc svc--' + esc(s.color || 'blue') + '" style="--i:' + i + '">' +
        '<div class="svc__top">' +
        '<span class="svc__num">' + String(i + 1).padStart(2, '0') + ' / ' + total + '</span>' +
        '<div><h3 class="display">' + title + '</h3><p>' + s.text + '</p></div>' +
        '<div class="svc__chips">' + (s.chips || []).map(function (c) { return '<span>' + esc(c) + '</span>'; }).join('') + '</div>' +
        '</div>' +
        '<div class="svc__media"><img src="' + esc(s.img) + '" alt="' + esc(s.alt || '') + '" loading="lazy" decoding="async"></div>' +
        '</article>';
    }).join('');
  },

  init: function () {
    var cards = OMG.$$('.svc');
    cards.forEach(function (card, i) {
      var next = cards[i + 1];
      if (next) {
        gsap.to(card, { scale: 0.92, '--shade': 0.28, ease: 'none', scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 20%', scrub: true } });
      }
      var img = OMG.$('.svc__media img', card);
      if (img) {
        gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true } });
      }
      gsap.from(OMG.$('h3', card), { yPercent: 40, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: card, start: 'top 75%' } });
    });
  }
});
