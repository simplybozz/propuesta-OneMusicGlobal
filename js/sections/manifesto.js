OMG.register('manifesto', {
  init: function () {
    var text = OMG.$('.manifesto [data-words]');
    if (!text) return;
    gsap.to(OMG.splitWords(text), {
      opacity: 1, stagger: 0.1, ease: 'none',
      scrollTrigger: { trigger: text, start: 'top 78%', end: 'bottom 45%', scrub: true }
    });
  }
});
