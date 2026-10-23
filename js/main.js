(function () {
  'use strict';

  var $ = OMG.$, $$ = OMG.$$;
  var body = document.body;
  var sections = OMG.sections;

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  sections.forEach(function (s) { if (s.render) s.render(); });
  sections.forEach(function (s) { if (s.setup) s.setup(); });
  OMG.fitLines();
  var updateToTop = initToTop();

  if (!(window.gsap && window.ScrollTrigger)) {
    document.documentElement.classList.remove('js');
    sections.forEach(function (s) { if (s.fallback) s.fallback(); });
    return;
  }
  window.__omgReady = true;

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.clearScrollMemory('manual');
  window.scrollTo(0, 0);

  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    if (updateToTop) lenis.on('scroll', updateToTop);
  }
  OMG.lenis = lenis;

  var ctx = { lenis: lenis, finePointer: finePointer };

  function scrollToTarget(target) {
    if (lenis) lenis.scrollTo(target, { duration: 1.6, easing: function (t) { return 1 - Math.pow(1 - t, 4); } });
    else {
      var el = typeof target === 'string' ? $(target) : target;
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }
  OMG.scrollTo = scrollToTarget;

  var THEMES = {
    blue: { bg: '#1537e0', fg: '#f7f8ff' },
    ink: { bg: '#050a26', fg: '#f7f8ff' },
    paper: { bg: '#f2f0e8', fg: '#050a26' },
    yellow: { bg: '#f4ee1b', fg: '#050a26' },
    teal: { bg: '#13b3ad', fg: '#f7f8ff' }
  };

  function setTheme(name, instant) {
    var t = THEMES[name];
    if (!t) return;
    body.style.setProperty('--bg', t.bg);
    body.style.setProperty('--fg', t.fg);
    gsap.to(body, { backgroundColor: t.bg, color: t.fg, duration: instant ? 0 : 0.8, ease: 'power2.out', overwrite: 'auto' });
  }

  function initThemes() {
    $$('[data-bg]').forEach(function (sec) {
      ScrollTrigger.create({
        trigger: sec, start: 'top 55%', end: 'bottom 55%',
        onEnter: function () { setTheme(sec.dataset.bg); },
        onEnterBack: function () { setTheme(sec.dataset.bg); }
      });
    });
  }

  var nav = $('.nav');
  var lastY = 0;
  function onScroll(y) {
    if (!nav) return;
    nav.classList.toggle('is-scrolled', y > 40);
    if (!body.classList.contains('menu-open')) nav.classList.toggle('is-hidden', y > lastY && y > 200);
    lastY = y;
  }
  if (lenis) lenis.on('scroll', function (e) { onScroll(e.scroll); });
  else window.addEventListener('scroll', function () { onScroll(window.scrollY); }, { passive: true });

  var toggle = $('.menu-toggle');
  var menu = $('#menu');
  var menuTl = null;

  function openMenu() {
    body.classList.add('menu-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', OMG.t('menu.close', 'Cerrar menú'));
    menu.setAttribute('aria-hidden', 'false');
    nav.classList.remove('is-hidden');
    if (lenis) lenis.stop();
    menuTl.timeScale(1).play();
  }

  function closeMenu() {
    if (!menuTl || !body.classList.contains('menu-open')) return;
    body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', OMG.t('menu.open', 'Abrir menú'));
    menu.setAttribute('aria-hidden', 'true');
    if (lenis) lenis.start();
    menuTl.timeScale(1.6).reverse();
  }

  if (toggle && menu) {
    var origin = 'calc(100% - ' + getComputedStyle(document.documentElement).getPropertyValue('--gutter').trim() + ' - 23px) 41px';
    gsap.set(menu, { clipPath: 'circle(0% at ' + origin + ')' });
    gsap.set('.menu__list a', { yPercent: 110 });
    gsap.set('.menu__foot', { opacity: 0, y: 20 });
    menuTl = gsap.timeline({ paused: true })
      .set(menu, { visibility: 'visible' })
      .to(menu, { clipPath: 'circle(150% at ' + origin + ')', duration: 1.1, ease: 'expo.inOut' })
      .to('.menu__list a', { yPercent: 0, duration: 1, stagger: 0.07, ease: 'expo.out' }, 0.45)
      .to('.menu__foot', { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out' }, 0.8);

    toggle.addEventListener('click', function () {
      if (body.classList.contains('menu-open')) closeMenu(); else openMenu();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  }

  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2 || !$(id)) return;
      e.preventDefault();
      var wasOpen = body.classList.contains('menu-open');
      closeMenu();
      gsap.delayedCall(wasOpen ? 0.55 : 0, function () { scrollToTarget(id); });
    });
  });

  var cursor = $('.cursor');
  if (cursor && finePointer) {
    var cx = gsap.quickTo(cursor, 'x', { duration: 0.45, ease: 'power3' });
    var cy = gsap.quickTo(cursor, 'y', { duration: 0.45, ease: 'power3' });
    var label = $('span', cursor);
    window.addEventListener('mousemove', function (e) { cx(e.clientX); cy(e.clientY); }, { passive: true });
    document.addEventListener('mouseover', function (e) {
      var t = e.target.closest('[data-cursor], a, button');
      cursor.classList.remove('is-big', 'is-link');
      if (!t) return;
      if (t.dataset.cursor) { label.textContent = t.dataset.cursor; cursor.classList.add('is-big'); }
      else cursor.classList.add('is-link');
    });
  }

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

  var intro = null;
  sections.forEach(function (s) {
    if (!s.init) return;
    var tl = s.init(ctx);
    if (tl && !intro) intro = tl;
  });

  $$('.section-head h2, .playlist h2').forEach(function (h) {
    gsap.from(h, { yPercent: 35, opacity: 0, skewY: 5, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: h, start: 'top 88%' } });
  });

  ScrollTrigger.batch('.reveal-up:not(.hero .reveal-up):not(.a-hero .reveal-up):not(.record)', {
    start: 'top 90%',
    onEnter: function (els) { gsap.to(els, { opacity: 1, y: 0, stagger: 0.08, duration: 1.1, ease: 'expo.out' }); }
  });

  initThemes();
  setTheme(OMG.page === 'artist' ? 'ink' : 'blue', true);

  var curtainPanels = $$('.curtain > span');
  var loader = $('.loader');
  var cameFromTransition = sessionStorage.getItem('omg-transition') === '1';
  var seenLoader = sessionStorage.getItem('omg-loaded') === '1';
  var restoreY = Number(sessionStorage.getItem('omg-scroll')) || 0;
  sessionStorage.removeItem('omg-transition');
  sessionStorage.removeItem('omg-scroll');

  function playIntro() {
    if (intro) intro.play();
    ScrollTrigger.refresh();
  }

  if (cameFromTransition) {
    if (loader) loader.remove();
    if (restoreY) {
      ScrollTrigger.refresh();
      if (lenis) lenis.scrollTo(restoreY, { immediate: true, force: true }); else window.scrollTo(0, restoreY);
    }
    gsap.set(curtainPanels, { yPercent: 0 });
    gsap.to(curtainPanels.slice().reverse(), {
      yPercent: -100, duration: 1.1, stagger: 0.09, ease: 'expo.inOut', delay: 0.15,
      onComplete: function () { gsap.set(curtainPanels, { yPercent: 100 }); }
    });
    gsap.delayedCall(0.6, playIntro);
  } else if (loader && !seenLoader) {
    if (lenis) lenis.stop();
    var counter = { v: 0 };
    var count = $('.loader__count', loader);
    gsap.timeline({
      onComplete: function () {
        sessionStorage.setItem('omg-loaded', '1');
        if (lenis) lenis.start();
      }
    })
      .from('.loader__logo > *', { yPercent: 120, opacity: 0, stagger: 0.08, duration: 1, ease: 'expo.out' })
      .from('.loader__eq i', { opacity: 0, stagger: { each: 0.03, from: 'center' }, duration: 0.5 }, 0.2)
      .from(['.loader__words', '.loader__count'], { opacity: 0, y: 30, duration: 0.8, ease: 'expo.out' }, 0.3)
      .to(counter, { v: 100, duration: 2.2, ease: 'power2.inOut', onUpdate: function () { count.textContent = Math.round(counter.v); } }, 0.2)
      .to('.loader__bar i', { scaleX: 1, duration: 2.2, ease: 'power2.inOut' }, 0.2)
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

  function leave(go, keepScroll) {
    sessionStorage.setItem('omg-transition', '1');
    if (keepScroll) sessionStorage.setItem('omg-scroll', String(Math.round(window.scrollY)));
    closeMenu();
    if (lenis) lenis.stop();
    gsap.to(curtainPanels, { yPercent: 0, duration: 0.95, stagger: 0.09, ease: 'expo.inOut', onComplete: go });
  }
  OMG.leave = leave;

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[data-transition]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    var href = a.href;
    leave(function () { window.location.href = href; });
  });

  window.addEventListener('pageshow', function (e) {
    if (e.persisted) { gsap.set(curtainPanels, { yPercent: 100 }); if (lenis) lenis.start(); }
  });

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });

  function initToTop() {
    var btn = $('.to-top');
    if (!btn) return null;
    var update = function () { btn.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.8); };
    window.addEventListener('scroll', update, { passive: true });
    update();
    btn.addEventListener('click', function () {
      if (OMG.lenis) OMG.lenis.scrollTo(0, { duration: 1.8, easing: function (t) { return 1 - Math.pow(1 - t, 4); } });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    return update;
  }
})();
