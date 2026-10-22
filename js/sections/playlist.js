OMG.register('playlist', {
  fallback: function () {
    OMG.$$('iframe[data-src]').forEach(function (frame) { frame.src = frame.dataset.src; });
  },

  init: function () {
    OMG.$$('iframe[data-src]').forEach(function (frame) {
      ScrollTrigger.create({
        trigger: frame, start: 'top 140%', once: true,
        onEnter: function () { if (!frame.src) frame.src = frame.dataset.src; }
      });
    });
  }
});
