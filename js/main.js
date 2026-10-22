/* =========================================================
   ONE MUSIC GLOBAL — interacciones
   GSAP + ScrollTrigger para el movimiento, Lenis para el
   scroll suave. Todo degrada a una página estática si no cargan.
   El contenido editable (lanzamientos, artistas, cifras) viene
   de js/data.js, generado desde content/content.json.
   ========================================================= */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  // Siempre empezar arriba: la intro del hero y el loader asumen scroll 0
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  var page = document.body.dataset.page;
  var DATA = window.OMG || { releases: [], artists: [], stats: [] };
  var artists = DATA.artists;
  var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" width="14"><path d="M7 17 17 7M8 7h9v9"/></svg>';

  /* ---------- Contenido generado (funciona aun sin GSAP) ---------- */
  renderRoster();
  renderReleases();
  renderStats();
  renderArtistPage();
  fillBands();
  fillTickers();
  fitLines();
  initToTop();

  var hasGSAP = !!(window.gsap && window.ScrollTrigger);
  if (!hasGSAP) {
    document.documentElement.classList.remove('js');
    $$('[data-count]').forEach(function (el) { el.textContent = el.dataset.count; });
    $$('.mb__video').forEach(function (v) { v.preload = 'auto'; v.autoplay = true; var p = v.play(); if (p && p.catch) p.catch(function () {}); });
    lazyEmbeds(true);
    return;
  }
  window.__omgReady = true;

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.clearScrollMemory('manual');
  window.scrollTo(0, 0);
  // Nota: no se desactiva el movimiento con prefers-reduced-motion porque la
  // propuesta depende de él; Windows lo activa al apagar los "efectos de animación".
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Scroll suave ---------- */
  var lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    window.__omgLenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  function scrollToTarget(target) {
    if (lenis) lenis.scrollTo(target, { duration: 1.6, easing: function (t) { return 1 - Math.pow(1 - t, 4); } });
    else {
      var el = typeof target === 'string' ? $(target) : target;
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2 || !$(id)) return;
      e.preventDefault();
      var wasOpen = document.body.classList.contains('menu-open');
      closeMenu();
      // Si venía del menú, espera a que se cierre para desplazarse
      gsap.delayedCall(wasOpen ? 0.55 : 0, function () { scrollToTarget(id); });
    });
  });

  /* ---------- Colores de fondo que cambian por sección ---------- */
  var THEMES = {
    blue:   { bg: '#1537e0', fg: '#f7f8ff' },
    ink:    { bg: '#050a26', fg: '#f7f8ff' },
    paper:  { bg: '#f2f0e8', fg: '#050a26' },
    yellow: { bg: '#f4ee1b', fg: '#050a26' },
    teal:   { bg: '#13b3ad', fg: '#f7f8ff' }
  };
  var body = document.body;
  function setTheme(name, instant) {
    var t = THEMES[name]; if (!t) return;
    // Las variables se fijan de golpe (sólo las usan la barra y el botón, que ya tienen transición CSS)
    // y se anima directamente el color de fondo: animar variables heredadas recalcula toda la página.
    body.style.setProperty('--bg', t.bg);
    body.style.setProperty('--fg', t.fg);
    gsap.to(body, { backgroundColor: t.bg, color: t.fg, duration: instant ? 0 : 0.8, ease: 'power2.out', overwrite: 'auto' });
  }
  // Se crean después de los pins para que ScrollTrigger mida bien sus posiciones
  function initThemes() {
    $$('[data-bg]').forEach(function (sec) {
      ScrollTrigger.create({
        trigger: sec, start: 'top 55%', end: 'bottom 55%',
        onEnter: function () { setTheme(sec.dataset.bg); },
        onEnterBack: function () { setTheme(sec.dataset.bg); }
      });
    });
  }

  /* ---------- Navegación ---------- */
  var nav = $('.nav');
  var lastY = 0;
  function onScroll(y) {
    nav.classList.toggle('is-scrolled', y > 40);
    var goingDown = y > lastY && y > 200;
    if (!body.classList.contains('menu-open')) nav.classList.toggle('is-hidden', goingDown);
    lastY = y;
  }
  if (lenis) lenis.on('scroll', function (e) { onScroll(e.scroll); });
  else window.addEventListener('scroll', function () { onScroll(window.scrollY); }, { passive: true });

  /* ---------- Menú ---------- */
  var toggle = $('.menu-toggle');
  var menu = $('#menu');
  var menuTl = null;
  if (menu) {
    var origin = 'calc(100% - ' + getComputedStyle(document.documentElement).getPropertyValue('--gutter').trim() + ' - 23px) 41px';
    gsap.set(menu, { clipPath: 'circle(0% at ' + origin + ')' });
    gsap.set('.menu__list a', { yPercent: 110 });
    gsap.set('.menu__foot', { opacity: 0, y: 20 });
    menuTl = gsap.timeline({ paused: true })
      .set(menu, { visibility: 'visible' })
      .to(menu, { clipPath: 'circle(150% at ' + origin + ')', duration: 1.1, ease: 'expo.inOut' })
      .to('.menu__list a', { yPercent: 0, duration: 1, stagger: 0.07, ease: 'expo.out' }, 0.45)
      .to('.menu__foot', { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out' }, 0.8);
  }
  function openMenu() {
    body.classList.add('menu-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Cerrar menú');
    menu.setAttribute('aria-hidden', 'false');
    nav.classList.remove('is-hidden');
    if (lenis) lenis.stop();
    menuTl.timeScale(1).play();
  }
  function closeMenu() {
    if (!body.classList.contains('menu-open')) return;
    body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú');
    menu.setAttribute('aria-hidden', 'true');
    if (lenis) lenis.start();
    menuTl.timeScale(1.6).reverse();
  }
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      if (body.classList.contains('menu-open')) closeMenu(); else openMenu();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  }

  /* ---------- Cursor ---------- */
  var cursor = $('.cursor');
  if (cursor && finePointer) {
    var cx = gsap.quickTo(cursor, 'x', { duration: 0.45, ease: 'power3' });
    var cy = gsap.quickTo(cursor, 'y', { duration: 0.45, ease: 'power3' });
    window.addEventListener('mousemove', function (e) { cx(e.clientX); cy(e.clientY); }, { passive: true });
    var label = $('span', cursor);
    document.addEventListener('mouseover', function (e) {
      var t = e.target.closest('[data-cursor], a, button');
      cursor.classList.remove('is-big', 'is-link');
      if (!t) return;
      if (t.dataset.cursor) { label.textContent = t.dataset.cursor; cursor.classList.add('is-big'); }
      else cursor.classList.add('is-link');
    });
  }

  /* ---------- Botones magnéticos ---------- */
  if (finePointer) {
    $$('.magnetic').forEach(function (el) {
      var mx = gsap.quickTo(el, 'x', { duration: 0.8, ease: 'elastic.out(1, 0.45)' });
      var my = gsap.quickTo(el, 'y', { duration: 0.8, ease: 'elastic.out(1, 0.45)' });
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * 0.3);
        my((e.clientY - r.top - r.height / 2) * 0.4);
      });
      el.addEventListener('mouseleave', function () { mx(0); my(0); });
    });
  }

  /* ---------- Utilidades de texto ---------- */
  function splitWords(el) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (node) {
      if (!node.textContent.trim()) return;
      var frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        var s = document.createElement('span'); s.className = 'w'; s.textContent = part; frag.appendChild(s);
      });
      node.parentNode.replaceChild(frag, node);
    });
    // Las fotos dentro del texto también se revelan como palabras
    $$('.chip', el).forEach(function (c) { c.classList.add('w'); });
    return $$('.w', el);
  }

  function splitChars(el) {
    var text = el.textContent;
    el.textContent = '';
    text.split('').forEach(function (ch) {
      // Dos capas: GSAP anima .char y el hover CSS mueve la capa interior,
      // así las dos transformaciones nunca se pisan
      var s = document.createElement('span');
      var inner = document.createElement('span');
      s.className = 'char';
      inner.textContent = ch === ' ' ? ' ' : ch;
      s.appendChild(inner);
      el.appendChild(s);
    });
    return $$('.char', el);
  }

  function drawPath(path) {
    var len = path.getTotalLength();
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    return len;
  }

  /* ---------- Bandas tipo marquee, reaccionan a la velocidad del scroll ---------- */
  var bandTweens = $$('.band__track').map(function (track) {
    var dir = Number(track.dataset.dir) || 1;
    return gsap.fromTo(track, { xPercent: dir > 0 ? -50 : 0 }, { xPercent: dir > 0 ? 0 : -50, duration: 26, ease: 'none', repeat: -1 });
  });
  if (lenis && bandTweens.length) {
    var boost = { v: 1 };
    var applyBoost = function () { bandTweens.forEach(function (tw) { tw.timeScale(boost.v); }); };
    lenis.on('scroll', function (e) {
      var v = 1 + Math.min(Math.abs(e.velocity) / 8, 5);
      gsap.to(boost, { v: v, duration: 0.4, overwrite: true, onUpdate: applyBoost });
    });
  }

  /* =========================================================
     HOME
     ========================================================= */
  function initHome() {
    var heroLines = $$('.hero__title .line > span');
    var squig = $('.hero__squiggle path');
    var circle = $('.hero__circle path');
    var note = $('.hero__note');
    var polaroids = $$('.polaroid');
    if (squig) drawPath(squig);
    if (circle) drawPath(circle);
    gsap.set(heroLines, { yPercent: 120 });
    gsap.set(heroLines[1], { opacity: 0 });
    gsap.set(note, { opacity: 0, scale: 0.6, rotate: -10 });
    gsap.set(polaroids, { y: 160, opacity: 0, scale: 0.85 });
    gsap.set('.hero .reveal-up', { opacity: 0, y: 30 });

    var intro = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } });
    intro
      .to(heroLines, { yPercent: 0, opacity: 1, duration: 1.4, stagger: 0.12 })
      .to(squig, { strokeDashoffset: 0, duration: 2.6, ease: 'power2.inOut' }, 0.1)
      .to(polaroids, { y: 0, opacity: 1, scale: 1, duration: 1.4, stagger: 0.12 }, 0.35)
      .to(circle, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' }, 0.9)
      .to(note, { opacity: 1, scale: 1, rotate: 8, duration: 0.9, ease: 'back.out(2.5)' }, 1.5)
      .to('.hero .reveal-up', { opacity: 1, y: 0, duration: 1, stagger: 0.08 }, 0.8);

    // Parallax con el mouse en las polaroids
    if (finePointer) {
      var setters = polaroids.map(function (p) {
        return { d: Number(p.dataset.depth) || 1, x: gsap.quickTo(p, 'x', { duration: 1.2, ease: 'power3' }), y: gsap.quickTo(p, 'y', { duration: 1.2, ease: 'power3' }) };
      });
      $('.hero').addEventListener('mousemove', function (e) {
        var nx = e.clientX / window.innerWidth - 0.5;
        var ny = e.clientY / window.innerHeight - 0.5;
        setters.forEach(function (s) { s.x(nx * 40 * s.d); s.y(ny * 30 * s.d); });
      });
    }

    // Parallax del hero al hacer scroll
    gsap.to('.hero__copy', { yPercent: 18, opacity: 0.25, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__media', { yPercent: -22, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__squiggle', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.fromTo('.bands', { rotate: -1.5 }, { rotate: 1.5, ease: 'none', scrollTrigger: { trigger: '.bands', start: 'top bottom', end: 'bottom top', scrub: true } });

    // Manifiesto: las palabras se encienden con el scroll
    var mText = $('[data-words]');
    if (mText) {
      var words = splitWords(mText);
      gsap.to(words, {
        opacity: 1, stagger: 0.1, ease: 'none',
        scrollTrigger: { trigger: mText, start: 'top 78%', end: 'bottom 45%', scrub: true }
      });
      gsap.from('.manifesto__aside .hand', { opacity: 0, y: 30, rotate: 4, scrollTrigger: { trigger: '.manifesto__aside', start: 'top 90%' }, duration: 1, ease: 'back.out(2)' });
    }

    initRoster();
    initServices();
    initRecords();
    initCounters();
    initMB();
    initContact();

    // Encabezados de sección
    $$('.section-head h2, .playlist h2').forEach(function (h) {
      gsap.from(h, { yPercent: 35, opacity: 0, skewY: 5, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: h, start: 'top 88%' } });
    });
    gsap.from('.sticker', { scale: 0, duration: 1, ease: 'back.out(2)', scrollTrigger: { trigger: '.releases', start: 'top 70%' } });

    // Las dos casas entran desde los lados
    gsap.from('.house--global', { xPercent: -12, opacity: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: '.houses__grid', start: 'top 80%' } });
    gsap.from('.house--pub', { xPercent: 12, opacity: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: '.houses__grid', start: 'top 80%' } });

    return intro;
  }

  /* ---------- Roster horizontal ---------- */
  function initRoster() {
    var section = $('.roster');
    if (!section) return;
    var track = $('.roster__track');
    var pin = $('.roster__pin');
    var mm = gsap.matchMedia();

    mm.add('(min-width: 861px)', function () {
      var distance = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
      var progress = $('.roster__progress i');
      var tween = gsap.to(track, {
        x: function () { return -distance(); },
        ease: 'none',
        scrollTrigger: {
          trigger: pin, start: 'top top', end: function () { return '+=' + distance(); },
          pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: function (self) { progress.style.transform = 'scaleX(' + self.progress + ')'; }
        }
      });
      gsap.to('.roster__ghost', { xPercent: -30, ease: 'none', scrollTrigger: { trigger: pin, start: 'top top', end: function () { return '+=' + distance(); }, scrub: true } });

      $$('.artist').forEach(function (card) {
        gsap.from(card, {
          y: 80, rotate: 4, opacity: 0, duration: 1.1, ease: 'expo.out',
          scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left 95%' }
        });
      });
    });

    mm.add('(max-width: 860px)', function () {
      gsap.from('.artist', { y: 60, opacity: 0, stagger: 0.08, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: track, start: 'top 85%' } });
    });

    // Tarjetas con inclinación 3D y brillo
    if (finePointer) {
      $$('.artist').forEach(function (card) {
        var rx = gsap.quickTo(card, 'rotateX', { duration: 0.8, ease: 'power3' });
        var ry = gsap.quickTo(card, 'rotateY', { duration: 0.8, ease: 'power3' });
        gsap.set(card, { transformPerspective: 900 });
        card.addEventListener('mousemove', function (e) {
          var r = card.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
          ry((px - 0.5) * 12); rx((0.5 - py) * 12);
          card.style.setProperty('--gx', px * 100 + '%');
          card.style.setProperty('--gy', py * 100 + '%');
        });
        card.addEventListener('mouseleave', function () { rx(0); ry(0); });
      });
    }
  }

  /* ---------- Servicios apilados ---------- */
  function initServices() {
    var cards = $$('.svc');
    cards.forEach(function (card, i) {
      var next = cards[i + 1];
      if (next) {
        gsap.to(card, {
          scale: 0.92, '--shade': 0.28, ease: 'none',
          scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 20%', scrub: true }
        });
      }
      var img = $('img[data-speed]', card);
      if (img) {
        gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true } });
      }
      gsap.from($('h3', card), { yPercent: 40, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: card, start: 'top 75%' } });
    });
  }

  /* ---------- Discos + mini reproductor ---------- */
  function initRecords() {
    var player = $('.player');
    if (!player) return;
    var records = $$('.record');
    var playBtn = $('.player__btn', player);
    var link = $('.player__link', player);
    var bar = $('.player__progress i', player);
    var PLAY = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4v16l14-8z"/></svg>';
    var PAUSE = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>';
    var LOADING = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 3a9 9 0 1 0 9 9"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur=".8s" repeatCount="indefinite"/></path></svg>';
    var audio = new Audio();
    audio.preload = 'none';
    var current = null;

    // La interfaz refleja siempre el estado real del audio
    function sync() {
      var paused = audio.paused;
      player.classList.toggle('is-paused', paused);
      playBtn.innerHTML = paused ? PLAY : PAUSE;
      playBtn.setAttribute('aria-label', paused ? 'Reproducir' : 'Pausar');
      records.forEach(function (r) { r.classList.toggle('is-playing', !paused && r === current); });
    }
    ['play', 'playing', 'pause', 'ended'].forEach(function (ev) { audio.addEventListener(ev, sync); });
    audio.addEventListener('waiting', function () { playBtn.innerHTML = LOADING; });
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
      player.classList.add('is-visible');
      bar.style.transform = 'scaleX(0)';
      if (rec.dataset.audio) {
        audio.src = rec.dataset.audio;
        playBtn.innerHTML = LOADING;
        var p = audio.play();
        if (p && p.catch) p.catch(sync);
      } else {
        // Sin audio de muestra: se abre la canción en Spotify
        audio.removeAttribute('src');
        audio.load();
        sync();
        if (rec.dataset.link) window.open(rec.dataset.link, '_blank', 'noopener');
      }
    }

    records.forEach(function (rec) {
      rec.addEventListener('click', function () {
        if (rec.classList.contains('record--soon')) {
          gsap.fromTo(rec, { x: -8 }, { x: 0, duration: 0.8, ease: 'elastic.out(1, 0.3)' });
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
      player.classList.remove('is-visible');
    });

    gsap.set(records, { rotate: 3 });
    ScrollTrigger.batch(records, {
      start: 'top 88%',
      onEnter: function (els) { gsap.to(els, { opacity: 1, y: 0, rotate: 0, stagger: 0.1, duration: 1.2, ease: 'expo.out' }); }
    });
  }

  /* ---------- Contadores ---------- */
  function initCounters() {
    $$('[data-count]').forEach(function (el) {
      var end = Number(el.dataset.count);
      var obj = { v: 0 };
      ScrollTrigger.create({
        trigger: el, start: 'top 85%', once: true,
        onEnter: function () {
          gsap.to(obj, { v: end, duration: 2, ease: 'power3.out', onUpdate: function () { el.textContent = Math.round(obj.v); } });
        }
      });
    });
    gsap.from('.stat', { y: 50, opacity: 0, stagger: 0.1, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.stats', start: 'top 80%' } });
  }

  /* ---------- Music Business: zoom a pantalla completa ---------- */
  function initMB() {
    var mb = $('.mb');
    if (!mb) return;
    var lines = $$('.mb__title .line > span');
    // Todo el texto empieza oculto: al principio sólo se ve el video
    gsap.set(lines, { yPercent: 150, opacity: 0 });
    gsap.set(['.mb__corners', '.mb__sub', '.mb__ctas'], { opacity: 0, y: 30 });

    // El video sólo se carga y reproduce cuando la sección está cerca de la pantalla
    var video = $('.mb__video');
    if (video) {
      ScrollTrigger.create({
        trigger: mb, start: 'top 160%', end: 'bottom -60%',
        onToggle: function (self) {
          if (self.isActive) {
            if (video.preload !== 'auto') video.preload = 'auto';
            var p = video.play(); if (p && p.catch) p.catch(function () {});
          } else video.pause();
        }
      });
    }

    var mm = gsap.matchMedia();
    mm.add({ desk: '(min-width: 861px)', mob: '(max-width: 860px)' }, function (ctx) {
      var start = ctx.conditions.desk ? 'inset(18% 30% 18% 30% round 28px)' : 'inset(22% 12% 22% 12% round 22px)';
      var tl = gsap.timeline({
        scrollTrigger: { trigger: mb, start: 'top top', end: '+=170%', pin: true, scrub: 1.2, anticipatePin: 1 }
      });
      tl.fromTo('.mb__frame', { clipPath: start }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'power2.inOut', duration: 1 })
        .fromTo('.mb__video', { scale: 1.35, yPercent: 6 }, { scale: 1, yPercent: 0, ease: 'power2.inOut', duration: 1 }, 0)
        .to('.mb__corners', { opacity: 1, y: 0, duration: 0.3 }, 0.7)
        .to(lines, { yPercent: 0, opacity: 1, stagger: 0.14, duration: 0.55, ease: 'power3.out' }, 0.75)
        .to(['.mb__sub', '.mb__ctas'], { opacity: 1, y: 0, stagger: 0.1, duration: 0.4 }, 1.2)
        .to({}, { duration: 0.35 });
    });
  }

  /* ---------- Contacto ---------- */
  function initContact() {
    var title = $('[data-chars]');
    if (!title) return;
    var chars = [];
    $$('.line > span', title).forEach(function (s) { chars = chars.concat(splitChars(s)); });
    gsap.from(chars, {
      yPercent: 120, rotate: 8, stagger: 0.035, duration: 1.1, ease: 'expo.out',
      scrollTrigger: { trigger: title, start: 'top 80%' }
    });
    var path = $('.contact__squig path');
    if (path) {
      drawPath(path);
      gsap.to(path, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.contact', start: 'top 70%', end: 'bottom bottom', scrub: true } });
    }
  }

  /* =========================================================
     Página de artista
     ========================================================= */
  function initArtist() {
    var lines = $$('.a-hero h1 .line > span');
    gsap.set(lines, { yPercent: 120 });
    gsap.set('.a-hero .reveal-up', { opacity: 0, y: 30 });
    var tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } });
    tl.fromTo('.a-hero__img img', { scale: 1.25 }, { scale: 1, duration: 2.2 }, 0)
      .to(lines, { yPercent: 0, duration: 1.4, stagger: 0.1 }, 0.1)
      .to('.a-hero .reveal-up', { opacity: 1, y: 0, stagger: 0.08, duration: 1 }, 0.6);

    gsap.to('.a-hero__img img', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.a-hero', start: 'top top', end: 'bottom top', scrub: true } });
    var bio = $('.a-bio [data-words]');
    if (bio) {
      gsap.to(splitWords(bio), { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: bio, start: 'top 80%', end: 'bottom 55%', scrub: true } });
    }
    $$('.a-gallery figure').forEach(function (f) {
      gsap.fromTo(f, { clipPath: 'inset(100% 0 0 0 round 22px)' }, { clipPath: 'inset(0% 0 0 0 round 22px)', duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: f, start: 'top 85%' } });
      gsap.fromTo($('img', f), { scale: 1.3 }, { scale: 1, duration: 1.8, ease: 'expo.out', scrollTrigger: { trigger: f, start: 'top 85%' } });
    });
    return tl;
  }

  /* ---------- Reveals genéricos ---------- */
  ScrollTrigger.batch('.reveal-up:not(.hero .reveal-up):not(.a-hero .reveal-up):not(.record)', {
    start: 'top 90%',
    onEnter: function (els) { gsap.to(els, { opacity: 1, y: 0, stagger: 0.08, duration: 1.1, ease: 'expo.out' }); }
  });

  lazyEmbeds(false);

  /* =========================================================
     Preloader y transiciones entre páginas
     ========================================================= */
  var intro = page === 'home' ? initHome() : page === 'artist' ? initArtist() : null;
  initThemes();
  var curtainPanels = $$('.curtain > span');
  var loader = $('.loader');
  var cameFromTransition = sessionStorage.getItem('omg-transition') === '1';
  var seenLoader = sessionStorage.getItem('omg-loaded') === '1';
  sessionStorage.removeItem('omg-transition');

  setTheme(page === 'artist' ? 'ink' : 'blue', true);

  function playIntro() {
    if (intro) intro.play();
    ScrollTrigger.refresh();
  }

  // Cortina de colores que se levanta (amarillo → turquesa → azul en capas)
  function openCurtain(delay) {
    gsap.set(curtainPanels, { yPercent: 0 });
    return gsap.to(curtainPanels.slice().reverse(), {
      yPercent: -100, duration: 1.1, stagger: 0.09, ease: 'expo.inOut', delay: delay || 0,
      onComplete: function () { gsap.set(curtainPanels, { yPercent: 100 }); }
    });
  }

  if (cameFromTransition) {
    if (loader) loader.remove();
    openCurtain(0.15);
    gsap.delayedCall(0.6, playIntro);
  } else if (loader && !seenLoader) {
    if (lenis) lenis.stop();
    var counter = { v: 0 };
    var count = $('.loader__count', loader);
    var tl = gsap.timeline({
      onComplete: function () {
        sessionStorage.setItem('omg-loaded', '1');
        if (lenis) lenis.start();
      }
    });
    tl.from('.loader__logo > *', { yPercent: 120, opacity: 0, stagger: 0.08, duration: 1, ease: 'expo.out' })
      .from('.loader__eq i', { opacity: 0, stagger: { each: 0.03, from: 'center' }, duration: 0.5 }, 0.2)
      .from(['.loader__words', '.loader__count'], { opacity: 0, y: 30, duration: 0.8, ease: 'expo.out' }, 0.3)
      .to(counter, { v: 100, duration: 2.2, ease: 'power2.inOut', onUpdate: function () { count.textContent = Math.round(counter.v); } }, 0.2)
      .to('.loader__bar i', { scaleX: 1, duration: 2.2, ease: 'power2.inOut' }, 0.2)
      // Salida: el contenido sube, el loader se va hacia arriba y detrás viene la cortina de colores
      .to('.loader__inner', { yPercent: -30, opacity: 0, duration: 0.7, ease: 'power3.in' }, '+=0.2')
      .to(['.loader__words', '.loader__count'], { y: -40, opacity: 0, duration: 0.6, ease: 'power3.in' }, '<')
      .add(function () { gsap.set(curtainPanels, { yPercent: 0 }); })
      .to(loader, { yPercent: -100, duration: 1, ease: 'expo.inOut' })
      .add(function () { loader.remove(); })
      .to(curtainPanels.slice().reverse(), { yPercent: -100, duration: 1, stagger: 0.09, ease: 'expo.inOut' }, '-=0.55')
      .add(function () { gsap.set(curtainPanels, { yPercent: 100 }); })
      .add(playIntro, '-=0.9');
  } else {
    if (loader) loader.remove();
    playIntro();
  }

  // Enlaces entre páginas con cortina
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[data-transition]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    var href = a.href;
    sessionStorage.setItem('omg-transition', '1');
    if (lenis) lenis.stop();
    gsap.to(curtainPanels, { yPercent: 0, duration: 0.95, stagger: 0.09, ease: 'expo.inOut', onComplete: function () { window.location.href = href; } });
  });
  // Al volver con el botón "atrás" (bfcache) la cortina no debe quedarse cerrada
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) { gsap.set(curtainPanels, { yPercent: 100 }); if (lenis) lenis.start(); }
  });

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });

  /* =========================================================
     Funciones de render (leen window.OMG de js/data.js)
     ========================================================= */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function renderRoster() {
    var track = $('.roster__track');
    if (!track) return;
    var html = artists.map(function (a, i) {
      return '' +
        '<a class="artist" href="artista.html?a=' + encodeURIComponent(a.slug) + '" data-transition data-cursor="VER">' +
          '<div class="artist__img"><img src="' + esc(a.img) + '" alt="' + esc(a.name) + '" loading="lazy" decoding="async"></div>' +
          '<span class="artist__num">' + String(i + 1).padStart(2, '0') + '</span>' +
          '<span class="artist__tag">' + esc(a.tag) + '</span>' +
          '<div class="artist__body"><h3 class="artist__name">' + esc(a.name) + '</h3>' +
          '<span class="artist__more">Ver artista ' + ARROW + '</span></div>' +
          '<span class="artist__glare"></span>' +
        '</a>';
    }).join('');
    html += '' +
      '<div class="artist artist--cta">' +
        '<span class="eyebrow">¿Eres el próximo?</span>' +
        '<h3>Tu nombre<br>podría estar<br>aquí</h3>' +
        '<a class="btn" href="#contacto">Escríbenos <span class="btn__icon">' + ARROW + ARROW + '</span></a>' +
      '</div>';
    track.innerHTML = html;
  }

  function renderReleases() {
    var box = $('[data-render="releases"]');
    if (!box) return;
    box.innerHTML = DATA.releases.map(function (r) {
      var soon = !!r.soon;
      return '' +
        '<button class="record reveal-up' + (soon ? ' record--soon' : '') + '" style="--c: var(--' + esc(r.color || 'blue') + ')"' +
          ' data-title="' + esc(r.title) + '" data-artist="' + esc(r.artist) + '" data-img="' + esc(r.img) + '"' +
          ' data-link="' + esc(r.link || '') + '" data-audio="' + esc(r.audio || '') + '"' +
          ' data-cursor="' + (soon ? 'PRONTO' : 'PLAY') + '" aria-label="' + (soon ? 'Próximamente' : 'Escuchar ' + esc(r.title) + ' de ' + esc(r.artist)) + '">' +
          '<span class="record__stage">' +
            '<span class="record__vinyl"><span class="spin"></span></span>' +
            // Las portadas reales ya traen su título; sólo "próximamente" lleva texto encima
            '<span class="record__cover"><img src="' + esc(r.img) + '" alt="Portada de ' + esc(r.title) + '" loading="lazy" decoding="async">' +
              (soon ? '<span class="record__title">' + esc(r.title) + '<small>' + esc(r.artist) + '</small></span>' : '') + '</span>' +
          '</span>' +
          '<span class="record__meta"><b>' + esc(r.label || r.title) + '</b><span>' + esc(r.artist) + ' · ' + esc(r.type) + '</span></span>' +
        '</button>';
    }).join('');
  }

  function renderStats() {
    var box = $('[data-render="stats"]');
    if (!box) return;
    box.innerHTML = DATA.stats.map(function (s) {
      return '<div class="stat"><div class="stat__n"><span data-count="' + Number(s.value) + '">0</span>' + esc(s.suffix) + '</div><p>' + esc(s.label) + '</p></div>';
    }).join('');
  }

  function renderArtistPage() {
    if (page !== 'artist' || !artists.length) return;
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
    // Galería: otras fotos del set para dar variedad
    var pool = ['assets/img/p8.jpg', 'assets/img/p6.jpg', 'assets/img/p18.jpg', 'assets/img/p1.jpg', 'assets/img/p14.jpg', 'assets/img/p11.jpg'];
    $$('.a-gallery img').forEach(function (img, i) { img.src = pool[(idx + i) % pool.length]; });
    var nextLink = $('.a-next');
    if (nextLink) {
      nextLink.href = 'artista.html?a=' + encodeURIComponent(next.slug);
      $('strong', nextLink).textContent = next.name;
    }
  }

  function fillBands() {
    var items = ['One Music Global', 'Music Business', 'One Spotlight', 'Música cristiana latina', "One's Playlist", 'Behind the Song'];
    var star = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0c1 7 5 11 12 12-7 1-11 5-12 12-1-7-5-11-12-12 7-1 11-5 12-12z"/></svg>';
    var chunk = items.map(function (t) { return '<span>' + t + star + '</span>'; }).join('');
    $$('.band__track').forEach(function (track) {
      // Copias idénticas para que el bucle sea continuo
      track.innerHTML = chunk + chunk + chunk + chunk;
    });
  }

  /* Ticker infinito: repite el texto hasta que cada mitad sea más ancha que la pantalla,
     así al llegar a -50% el bucle empieza exactamente donde estaba y nunca se ve el corte */
  function fillTickers() {
    $$('[data-ticker]').forEach(function (track) {
      var text = track.dataset.ticker;
      var build = function () {
        track.innerHTML = '<span>' + esc(text) + '</span>';
        var unit = track.firstChild.getBoundingClientRect().width || 400;
        var copies = Math.max(2, Math.ceil((window.innerWidth * 1.2) / unit));
        var half = new Array(copies + 1).join('<span>' + esc(text) + '</span>');
        track.innerHTML = half + half;
        // Velocidad constante (~70px/s) sin importar el ancho
        track.style.setProperty('--ticker-time', ((unit * copies) / 70).toFixed(1) + 's');
      };
      build();
      var t;
      window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(build, 200); });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);
    });
  }

  /* Escala una línea para que mida lo mismo que otra (p. ej. "4 años" = ancho de "hablando").
     Se mide sin transformaciones para que las animaciones de entrada no alteren el cálculo. */
  function fitLines() {
    var items = $$('[data-fit-to]');
    if (!items.length) return;
    var fit = function () {
      items.forEach(function (el) {
        var ref = $(el.dataset.fitTo);
        if (!ref) return;
        // El tamaño va en la línea contenedora para que su altura (y la máscara) crezcan con el texto
        var box = el.closest('.line') || el;
        box.style.fontSize = '';
        var w = el.scrollWidth, target = ref.scrollWidth;
        if (w && target) box.style.fontSize = (target / w).toFixed(3) + 'em';
      });
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    };
    fit();
    var t;
    window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(fit, 200); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  }

  /* Botón fijo para volver arriba */
  function initToTop() {
    var btn = $('.to-top');
    if (!btn) return;
    var update = function () { btn.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.8); };
    window.addEventListener('scroll', update, { passive: true });
    update();
    btn.addEventListener('click', function () {
      if (window.__omgLenis) window.__omgLenis.scrollTo(0, { duration: 1.8, easing: function (t) { return 1 - Math.pow(1 - t, 4); } });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function lazyEmbeds(now) {
    $$('iframe[data-src]').forEach(function (frame) {
      var load = function () { if (!frame.src) frame.src = frame.dataset.src; };
      if (now || !window.ScrollTrigger) return load();
      ScrollTrigger.create({ trigger: frame, start: 'top 140%', once: true, onEnter: load });
    });
  }
})();
