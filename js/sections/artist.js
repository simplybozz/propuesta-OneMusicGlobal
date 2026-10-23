OMG.register('artist', {
  render: function () {
    var $ = OMG.$, $$ = OMG.$$, esc = OMG.esc, pick = OMG.pick;
    var artists = OMG.list('artists.items').filter(function (a) { return a.name; });
    if (OMG.page !== 'artist' || !artists.length) return;

    var slugOf = function (a) { return a.slug || OMG.slug(a.name); };
    var slug = new URLSearchParams(location.search).get('a');
    var idx = Math.max(0, artists.findIndex(function (a) { return slugOf(a) === slug; }));
    var a = artists[idx];
    var next = artists[(idx + 1) % artists.length];

    var set = function (sel, value, html) {
      $$(sel).forEach(function (el) { if (html) el.innerHTML = value; else el.textContent = value; });
    };
    document.title = a.name + ' — One Music Global';
    set('[data-artist-name]', a.name);
    set('[data-artist-tag]', pick(a, 'tag') || '—');
    set('[data-artist-release]', a.release || '—');
    set('[data-artist-label]', a.label || 'One Music Global');
    set('[data-artist-handle]', a.booking_handle || '—');
    set('[data-artist-bio]', OMG.fmt(pick(a, 'bio')), true);
    set('[data-artist-note]', OMG.fmt(pick(a, 'note')), true);
    $$('[data-artist-note]').forEach(function (el) { el.hidden = !pick(a, 'note'); });

    var links = { listen: a.listen_url, booking: a.booking_url };
    $$('[data-artist-link]').forEach(function (el) {
      var url = links[el.dataset.artistLink];
      if (url) el.href = url; else el.hidden = true;
    });

    var heroImg = $('.a-hero__img img');
    if (heroImg) { heroImg.src = OMG.media(a.cover || a.photo); heroImg.alt = a.name; }

    var gallery = $('.a-gallery');
    var photos = (Array.isArray(a.gallery) ? a.gallery : []).filter(Boolean);
    if (gallery) {
      gallery.innerHTML = photos.map(function (p) {
        return '<figure><img src="' + esc(OMG.media(p)) + '" alt="' + esc(a.name) + '" loading="lazy"></figure>';
      }).join('');
      var section = gallery.closest('section');
      if (section) section.hidden = !photos.length;
    }

    var nextLink = $('.a-next');
    if (nextLink) {
      nextLink.href = 'artista.html?a=' + encodeURIComponent(slugOf(next));
      $('strong', nextLink).textContent = next.name;
    }
  },

  init: function () {
    var $ = OMG.$, $$ = OMG.$$;
    if (!$('.a-hero')) return null;

    var lines = $$('.a-hero h1 .line > span');
    gsap.set(lines, { yPercent: 120 });
    gsap.set('.a-hero .reveal-up', { opacity: 0, y: 30 });
    var intro = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } })
      .fromTo('.a-hero__img img', { scale: 1.25 }, { scale: 1, duration: 2.2 }, 0)
      .to(lines, { yPercent: 0, duration: 1.4, stagger: 0.1 }, 0.1)
      .to('.a-hero .reveal-up', { opacity: 1, y: 0, stagger: 0.08, duration: 1 }, 0.6);

    gsap.to('.a-hero__img img', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.a-hero', start: 'top top', end: 'bottom top', scrub: true } });

    var bio = $('.a-bio [data-words]');
    if (bio) {
      gsap.to(OMG.splitWords(bio), { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: bio, start: 'top 80%', end: 'bottom 55%', scrub: true } });
    }

    $$('.a-gallery figure').forEach(function (f) {
      gsap.fromTo(f, { clipPath: 'inset(100% 0 0 0 round 22px)' }, { clipPath: 'inset(0% 0 0 0 round 22px)', duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: f, start: 'top 85%' } });
      gsap.fromTo($('img', f), { scale: 1.3 }, { scale: 1, duration: 1.8, ease: 'expo.out', scrollTrigger: { trigger: f, start: 'top 85%' } });
    });

    return intro;
  }
});
