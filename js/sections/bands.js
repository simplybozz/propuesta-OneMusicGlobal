OMG.register('bands', {
  render: function () {
    var items = OMG.data.bands || [];
    var chunk = items.map(function (t) { return '<span>' + OMG.esc(OMG.tr(t)) + OMG.icons.star + '</span>'; }).join('');
    OMG.$$('.band__track').forEach(function (track) {
      track.innerHTML = chunk + chunk + chunk + chunk;
    });
  },

  init: function (ctx) {
    var tweens = OMG.$$('.band__track').map(function (track) {
      var dir = Number(track.dataset.dir) || 1;
      return gsap.fromTo(track, { xPercent: dir > 0 ? -50 : 0 }, { xPercent: dir > 0 ? 0 : -50, duration: 26, ease: 'none', repeat: -1 });
    });
    if (!tweens.length) return;

    if (ctx.lenis) {
      var boost = { v: 1 };
      var apply = function () { tweens.forEach(function (tw) { tw.timeScale(boost.v); }); };
      ctx.lenis.on('scroll', function (e) {
        gsap.to(boost, { v: 1 + Math.min(Math.abs(e.velocity) / 8, 5), duration: 0.4, overwrite: true, onUpdate: apply });
      });
    }

    gsap.fromTo('.bands', { rotate: -1.5 }, { rotate: 1.5, ease: 'none', scrollTrigger: { trigger: '.bands', start: 'top bottom', end: 'bottom top', scrub: true } });
  }
});
