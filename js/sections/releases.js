OMG.register('releases', {
  render: function () {
    var box = OMG.$('[data-render="releases"]');
    if (!box) return;
    var esc = OMG.esc;
    box.innerHTML = (OMG.data.releases || []).map(function (r) {
      var soon = !!r.soon;
      return '' +
        '<button class="record reveal-up' + (soon ? ' record--soon' : '') + '" style="--c: var(--' + esc(r.color || 'blue') + ')"' +
        ' data-title="' + esc(r.title) + '" data-artist="' + esc(r.artist) + '" data-img="' + esc(r.img) + '"' +
        ' data-link="' + esc(r.link || '') + '" data-audio="' + esc(r.audio || '') + '"' +
        ' data-cursor="' + (soon ? 'PRONTO' : 'PLAY') + '" aria-label="' + (soon ? 'Próximamente' : 'Escuchar ' + esc(r.title) + ' de ' + esc(r.artist)) + '">' +
        '<span class="record__stage">' +
        '<span class="record__vinyl"><span class="spin"></span></span>' +
        '<span class="record__cover"><img src="' + esc(r.img) + '" alt="Portada de ' + esc(r.title) + '" loading="lazy" decoding="async">' +
        (soon ? '<span class="record__title">' + esc(r.title) + '<small>' + esc(r.artist) + '</small></span>' : '') + '</span>' +
        '</span>' +
        '<span class="record__meta"><b>' + esc(r.label || r.title) + '</b><span>' + esc(r.artist) + ' · ' + esc(r.type) + '</span></span>' +
        '</button>';
    }).join('');
  },

  setup: function () {
    var $ = OMG.$, $$ = OMG.$$, icons = OMG.icons;
    var player = $('.player');
    if (!player) return;
    var records = $$('.record');
    var playBtn = $('.player__btn', player);
    var link = $('.player__link', player);
    var bar = $('.player__progress i', player);
    var audio = new Audio();
    audio.preload = 'none';
    var current = null;

    function sync() {
      var paused = audio.paused;
      player.classList.toggle('is-paused', paused);
      playBtn.innerHTML = paused ? icons.play : icons.pause;
      playBtn.setAttribute('aria-label', paused ? 'Reproducir' : 'Pausar');
      records.forEach(function (r) { r.classList.toggle('is-playing', !paused && r === current); });
    }

    function show(visible) {
      player.classList.toggle('is-visible', visible);
      document.body.classList.toggle('has-player', visible);
    }

    ['play', 'playing', 'pause', 'ended'].forEach(function (ev) { audio.addEventListener(ev, sync); });
    audio.addEventListener('waiting', function () { playBtn.innerHTML = icons.loading; });
    audio.addEventListener('timeupdate', function () {
      if (audio.duration) bar.style.transform = 'scaleX(' + (audio.currentTime / audio.duration) + ')';
    });
    audio.addEventListener('ended', function () { bar.style.transform = 'scaleX(1)'; });

    function playRecord(rec) {
      current = rec;
      $('.player__txt b', player).textContent = rec.dataset.title;
      $('.player__txt small', player).textContent = rec.dataset.artist;
      $('.player__art img', player).src = rec.dataset.img;
      if (link) {
        link.hidden = !rec.dataset.link;
        if (rec.dataset.link) link.href = rec.dataset.link;
      }
      show(true);
      bar.style.transform = 'scaleX(0)';
      if (rec.dataset.audio) {
        audio.src = rec.dataset.audio;
        playBtn.innerHTML = icons.loading;
        var p = audio.play();
        if (p && p.catch) p.catch(sync);
      } else {
        audio.removeAttribute('src');
        audio.load();
        sync();
        if (rec.dataset.link) window.open(rec.dataset.link, '_blank', 'noopener');
      }
    }

    records.forEach(function (rec) {
      rec.addEventListener('click', function () {
        if (rec.classList.contains('record--soon')) {
          if (window.gsap) gsap.fromTo(rec, { x: -8 }, { x: 0, duration: 0.8, ease: 'elastic.out(1, 0.3)' });
          return;
        }
        if (current === rec && audio.src) {
          if (audio.paused) audio.play(); else audio.pause();
          return;
        }
        playRecord(rec);
      });
    });

    playBtn.addEventListener('click', function () {
      if (!current) { if (records[0]) playRecord(records[0]); return; }
      if (audio.paused) audio.play(); else audio.pause();
    });

    $('.player__close', player).addEventListener('click', function () {
      audio.pause();
      show(false);
    });
  },

  init: function () {
    var records = OMG.$$('.record');
    if (!records.length) return;
    gsap.set(records, { rotate: 3 });
    ScrollTrigger.batch(records, {
      start: 'top 88%',
      onEnter: function (els) { gsap.to(els, { opacity: 1, y: 0, rotate: 0, stagger: 0.1, duration: 1.2, ease: 'expo.out' }); }
    });
    gsap.from('.sticker', { scale: 0, duration: 1, ease: 'back.out(2)', scrollTrigger: { trigger: '.releases', start: 'top 70%' } });
  }
});
