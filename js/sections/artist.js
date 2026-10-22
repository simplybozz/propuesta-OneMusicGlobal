OMG.register('artist', {
  render: function () {
    var $ = OMG.$, $$ = OMG.$$;
    var artists = OMG.data.artists || [];
    if (OMG.page !== 'artist' || !artists.length) return;

    var slug = new URLSearchParams(location.search).get('a');
    var idx = Math.max(0, artists.findIndex(function (a) { return a.slug === slug; }));
    var a = artists[idx];
    var next = artists[(idx + 1) % artists.length];

    document.title = a.name + ' — One Music Global';
    $$('[data-artist-name]').forEach(function (el) { el.textContent = a.name; });
    $$('[data-artist-tag]').forEach(function (el) { el.textContent = a.tag; });
    $$('[data-artist-release]').forEach(function (el) { el.textContent = a.release; });

    var heroImg = $('.a-hero__img img');
    if (heroImg) { heroImg.src = a.img; heroImg.alt = a.name; }

    var pool = OMG.data.gallery || [];
    if (pool.length) $$('.a-gallery img').forEach(function (img, i) { img.src = pool[(idx + i) % pool.length]; });

    var nextLink = $('.a-next');
    if (nextLink) {
      nextLink.href = 'artista.html?a=' + encodeURIComponent(next.slug);
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
