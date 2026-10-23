OMG.register('music-business', {
  render: function () {
    var track = OMG.$('.mb__ticker-track');
    if (!track) return;
    var items = OMG.list('mb.ticker').map(function (i) { return OMG.pick(i, 'text'); }).filter(Boolean);
    if (!items.length) return;
    var text = items.join(' ✦ ') + ' ✦ ';
    var item = '<span>' + OMG.esc(text) + '</span>';
    var build = function () {
      track.innerHTML = item;
      var unit = track.firstChild.getBoundingClientRect().width || 400;
      var copies = Math.max(2, Math.ceil((window.innerWidth * 1.2) / unit));
      var half = new Array(copies + 1).join(item);
      track.innerHTML = half + half;
      track.style.setProperty('--ticker-time', ((unit * copies) / 70).toFixed(1) + 's');
    };
    build();
    OMG.onResize(build);
  },

  fallback: function () {
    OMG.$$('.mb__video').forEach(function (v) {
      v.preload = 'auto';
      var p = v.play();
      if (p && p.catch) p.catch(function () { });
    });
  },

  init: function () {
    var $ = OMG.$, $$ = OMG.$$;
    var mb = $('.mb');
    if (!mb) return;
    var lines = $$('.mb__title .line > span');
    gsap.set(lines, { yPercent: 150, opacity: 0 });
    gsap.set(['.mb__corners', '.mb__sub', '.mb__ctas'], { opacity: 0, y: 30 });

    var video = $('.mb__video');
    if (video) {
      ScrollTrigger.create({
        trigger: mb, start: 'top 160%', end: 'bottom -60%',
        onToggle: function (self) {
          if (self.isActive) {
            if (video.preload !== 'auto') video.preload = 'auto';
            var p = video.play();
            if (p && p.catch) p.catch(function () { });
          } else video.pause();
        }
      });
    }

    gsap.matchMedia().add({ desk: '(min-width: 861px)', mob: '(max-width: 860px)' }, function (mq) {
      var start = mq.conditions.desk ? 'inset(18% 30% 18% 30% round 28px)' : 'inset(22% 12% 22% 12% round 22px)';
      gsap.timeline({ scrollTrigger: { trigger: mb, start: 'top top', end: '+=170%', pin: true, scrub: 1.2, anticipatePin: 1 } })
        .fromTo('.mb__frame', { clipPath: start }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'power2.inOut', duration: 1 })
        .fromTo('.mb__video', { scale: 1.35, yPercent: 6 }, { scale: 1, yPercent: 0, ease: 'power2.inOut', duration: 1 }, 0)
        .to('.mb__corners', { opacity: 1, y: 0, duration: 0.3 }, 0.7)
        .to(lines, { yPercent: 0, opacity: 1, stagger: 0.14, duration: 0.55, ease: 'power3.out' }, 0.75)
        .to(['.mb__sub', '.mb__ctas'], { opacity: 1, y: 0, stagger: 0.1, duration: 0.4 }, 1.2)
        .to({}, { duration: 0.35 });
    });
  }
});
