OMG.register('houses', {
  init: function () {
    if (!OMG.$('.houses__grid')) return;
    gsap.from('.house--global', { xPercent: -12, opacity: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: '.houses__grid', start: 'top 80%' } });
    gsap.from('.house--pub', { xPercent: 12, opacity: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: '.houses__grid', start: 'top 80%' } });
  }
});
