OMG.register('hero', {
  init: function (ctx) {
    var $ = OMG.$, $$ = OMG.$$;
    var hero = $('.hero');
    if (!hero) return null;

    var lines = $$('.hero__title .line > span');
    var circle = $('.hero__circle path');
    var note = $('.hero__note');
    var polaroids = $$('.polaroid');
    if (circle) OMG.drawPath(circle);

    gsap.set(lines, { yPercent: 120 });
    gsap.set(lines[1], { opacity: 0 });
    gsap.set(note, { opacity: 0, scale: 0.6, rotate: -10 });
    gsap.set(polaroids, { y: 160, opacity: 0, scale: 0.85 });
    gsap.set('.hero .reveal-up', { opacity: 0, y: 30 });

    var intro = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } })
      .to(lines, { yPercent: 0, opacity: 1, duration: 1.4, stagger: 0.12 })
      .to(polaroids, { y: 0, opacity: 1, scale: 1, duration: 1.4, stagger: 0.12 }, 0.35)
      .to(circle, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' }, 0.9)
      .to(note, { opacity: 1, scale: 1, rotate: 8, duration: 0.9, ease: 'back.out(2.5)' }, 1.5)
      .to('.hero .reveal-up', { opacity: 1, y: 0, duration: 1, stagger: 0.08 }, 0.8);

    if (ctx.finePointer) {
      var setters = polaroids.map(function (p) {
        return {
          d: Number(p.dataset.depth) || 1,
          x: gsap.quickTo(p, 'x', { duration: 1.2, ease: 'power3' }),
          y: gsap.quickTo(p, 'y', { duration: 1.2, ease: 'power3' })
        };
      });
      hero.addEventListener('mousemove', function (e) {
        var nx = e.clientX / window.innerWidth - 0.5;
        var ny = e.clientY / window.innerHeight - 0.5;
        setters.forEach(function (s) { s.x(nx * 40 * s.d); s.y(ny * 30 * s.d); });
      });
    }

    gsap.to('.hero__copy', { yPercent: 18, opacity: 0.25, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__media', { yPercent: -22, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });

    return intro;
  }
});
