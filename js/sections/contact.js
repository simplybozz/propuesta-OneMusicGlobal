OMG.register('contact', {
  init: function () {
    var title = OMG.$('.contact [data-chars]');
    if (!title) return;
    var chars = [];
    OMG.$$('.line > span', title).forEach(function (s) { chars = chars.concat(OMG.splitChars(s)); });
    gsap.from(chars, {
      yPercent: 120, rotate: 8, stagger: 0.035, duration: 1.1, ease: 'expo.out',
      scrollTrigger: { trigger: title, start: 'top 80%' }
    });

    var path = OMG.$('.contact__squig path');
    if (path) {
      OMG.drawPath(path);
      gsap.to(path, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.contact', start: 'top 70%', end: 'bottom bottom', scrub: true } });
    }
  }
});
