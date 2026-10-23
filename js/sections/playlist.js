OMG.register('playlist', {
  render: function () {
    var frame = OMG.$('.playlist iframe');
    var url = OMG.c('playlist.playlist_url');
    if (!frame || !url) return;
    var m = String(url).match(/open\.spotify\.com\/(?:intl-[a-z]+\/)?(playlist|album|artist|track|show|episode)\/([A-Za-z0-9]+)/);
    frame.dataset.src = m ? 'https://open.spotify.com/embed/' + m[1] + '/' + m[2] + '?utm_source=generator&theme=0' : url;
  },

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
