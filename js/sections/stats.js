OMG.register('stats', {
  render: function () {
    var box = OMG.$('[data-render="stats"]');
    if (!box) return;
    box.innerHTML = (OMG.data.stats || []).map(function (s) {
      return '<div class="stat"><div class="stat__n"><span data-count="' + Number(s.value) + '">0</span>' + OMG.esc(s.suffix) + '</div><p>' + OMG.esc(OMG.tr(s.label)) + '</p></div>';
    }).join('');
  },

  fallback: function () {
    OMG.$$('[data-count]').forEach(function (el) { el.textContent = el.dataset.count; });
  },

  init: function () {
    OMG.$$('[data-count]').forEach(function (el) {
      var obj = { v: 0 };
      ScrollTrigger.create({
        trigger: el, start: 'top 85%', once: true,
        onEnter: function () {
          gsap.to(obj, { v: Number(el.dataset.count), duration: 2, ease: 'power3.out', onUpdate: function () { el.textContent = Math.round(obj.v); } });
        }
      });
    });
    if (OMG.$('.stat')) {
      gsap.from('.stat', { y: 50, opacity: 0, stagger: 0.1, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.stats', start: 'top 80%' } });
    }
  }
});
