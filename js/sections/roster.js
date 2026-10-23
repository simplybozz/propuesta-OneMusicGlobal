OMG.register('roster', {
  render: function () {
    var track = OMG.$('.roster__track');
    if (!track) return;
    var esc = OMG.esc, arrow = OMG.icons.arrow;
    var html = (OMG.data.artists || []).map(function (a, i) {
      return '' +
        '<a class="artist" href="artista.html?a=' + encodeURIComponent(a.slug) + '" data-transition data-cursor="' + esc(OMG.t('cursor.view', 'VER')) + '">' +
        '<div class="artist__img"><img src="' + esc(a.img) + '" alt="' + esc(a.name) + '" loading="lazy" decoding="async"></div>' +
        '<span class="artist__num">' + String(i + 1).padStart(2, '0') + '</span>' +
        '<span class="artist__tag">' + esc(OMG.tr(a.tag)) + '</span>' +
        '<div class="artist__body"><h3 class="artist__name">' + esc(a.name) + '</h3>' +
        '<span class="artist__more">' + esc(OMG.t('roster.more', 'Ver artista')) + ' ' + arrow + '</span></div>' +
        '<span class="artist__glare"></span>' +
        '</a>';
    }).join('');
    html += '' +
      '<div class="artist artist--cta">' +
      '<span class="eyebrow">' + esc(OMG.t('roster.ctaEyebrow', '¿Eres el próximo?')) + '</span>' +
      '<h3>' + OMG.t('roster.ctaTitle', 'Tu nombre<br>podría estar<br>aquí') + '</h3>' +
      '<a class="btn" href="#contacto">' + esc(OMG.t('roster.ctaBtn', 'Escríbenos')) + ' <span class="btn__icon">' + arrow + arrow + '</span></a>' +
      '</div>';
    track.innerHTML = html;
  },

  init: function (ctx) {
    var $ = OMG.$, $$ = OMG.$$;
    var track = $('.roster__track');
    var pin = $('.roster__pin');
    if (!track || !pin) return;
    var mm = gsap.matchMedia();

    mm.add('(min-width: 861px)', function () {
      var distance = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
      var progress = $('.roster__progress i');
      var tween = gsap.to(track, {
        x: function () { return -distance(); },
        ease: 'none',
        scrollTrigger: {
          trigger: pin, start: 'top top', end: function () { return '+=' + distance(); },
          pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: function (self) { progress.style.transform = 'scaleX(' + self.progress + ')'; }
        }
      });
      gsap.to('.roster__ghost', { xPercent: -30, ease: 'none', scrollTrigger: { trigger: pin, start: 'top top', end: function () { return '+=' + distance(); }, scrub: true } });
      $$('.artist').forEach(function (card) {
        gsap.from(card, { y: 80, rotate: 4, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left 95%' } });
      });
    });

    mm.add('(max-width: 860px)', function () {
      gsap.from('.artist', { y: 60, opacity: 0, stagger: 0.08, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: track, start: 'top 85%' } });
    });

    if (!ctx.finePointer) return;
    $$('.artist').forEach(function (card) {
      var rx = gsap.quickTo(card, 'rotateX', { duration: 0.8, ease: 'power3' });
      var ry = gsap.quickTo(card, 'rotateY', { duration: 0.8, ease: 'power3' });
      gsap.set(card, { transformPerspective: 900 });
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        ry((px - 0.5) * 12); rx((0.5 - py) * 12);
        card.style.setProperty('--gx', px * 100 + '%');
        card.style.setProperty('--gy', py * 100 + '%');
      });
      card.addEventListener('mouseleave', function () { rx(0); ry(0); });
    });
  }
});
