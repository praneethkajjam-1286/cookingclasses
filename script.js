/* =========================================================
   CULINA STUDIO — Home page interactions
   ========================================================= */
(function () {
  'use strict';

  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- 1. Hero: slice each slide into shutter strips ---------- */
  const STRIPS = window.innerWidth < 680 ? 4 : 6;
  $$('.hero-slide').forEach((slide) => {
    const src = $('img', slide);
    for (let i = 0; i < STRIPS; i++) {
      const strip = document.createElement('div');
      strip.className = 'strip';
      strip.style.cssText = `left:${(100 / STRIPS) * i}%;width:${100 / STRIPS + 0.08}%;--s:${i}`;
      const img = src.cloneNode();
      img.style.width = (STRIPS * 100) + '%';
      img.style.left = (-i * 100) + '%';
      strip.appendChild(img);
      slide.appendChild(strip);
    }
    slide.classList.add('is-split');
  });

  /* ---------- 1b. Images: Unsplash/Pexels → LoremFlickr → Picsum, so a photo always shows ---------- */
  const lockFor = (str) => { let h = 0; for (const c of str) h = (h * 31 + c.charCodeAt(0)) >>> 0; return 100 + (h % 9000); };
  $$('img[data-fallback]').forEach((img) => {
    const original = img.getAttribute('src');
    const kw = encodeURIComponent(img.dataset.fallback);
    const sources = [
      `https://loremflickr.com/1200/900/${kw}?lock=${lockFor(original)}`,
      `https://picsum.photos/seed/culina-home-${lockFor(original)}/1200/900`
    ];
    let step = 0;
    const swap = () => { if (step < sources.length) img.src = sources[step++]; };
    img.addEventListener('error', swap);
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('loading') !== 'lazy') swap();
  });

  /* ---------- 2. Theme (light / dark) ---------- */
  const themeBtn = $('#themeToggle');
  const applyTheme = (t) => {
    root.setAttribute('data-theme', t);
    themeBtn.setAttribute('aria-pressed', String(t === 'dark'));
    themeBtn.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  };
  applyTheme(store.get('culina-theme') || root.getAttribute('data-theme') || 'light');
  themeBtn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    store.set('culina-theme', next);
  });

  /* ---------- 3. Direction (LTR / RTL) ---------- */
  const dirBtn = $('#dirToggle');
  const dirLabel = $('.dir-label', dirBtn);
  const applyDir = (d) => {
    root.setAttribute('dir', d);
    dirBtn.setAttribute('aria-pressed', String(d === 'rtl'));
    dirLabel.textContent = '↔';
    updateSlider && updateSlider();
  };
  let updateSlider = null;
  dirBtn.addEventListener('click', () => {
    const next = root.getAttribute('dir') === 'rtl' ? 'ltr' : 'rtl';
    applyDir(next);
    store.set('culina-dir', next);
  });

  // Keep theme/dir in sync across open tabs/pages
  window.addEventListener('storage', (e) => {
    if (e.key === 'culina-theme' && e.newValue) applyTheme(e.newValue);
    if (e.key === 'culina-dir' && e.newValue) applyDir(e.newValue);
  });

  /* ---------- 4. Header on scroll + back to top ---------- */
  const header = $('#header');
  const toTop = $('#toTop');
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 40);
    toTop.classList.toggle('show', y > 700);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

  /* ---------- 5. Mobile navigation ---------- */
  const nav = $('#nav');
  const menuBtn = $('#menuToggle');
  const backdrop = $('#navBackdrop');
  const setMenu = (open) => {
    nav.classList.toggle('open', open);
    backdrop.classList.toggle('show', open);
    document.body.classList.toggle('no-scroll', open);
    document.body.classList.toggle('nav-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  backdrop.addEventListener('click', () => setMenu(false));
  $$('.nav-link').forEach((a) => a.addEventListener('click', () => setMenu(false)));

  /* ---------- 6. Active nav link (scroll spy) ---------- */
  const links = $$('.nav-link');
  const spyIds = ['home', 'about', 'services', 'classes', 'workshops', 'dashboard', 'gallery'];
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + en.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  spyIds.forEach((id) => { const s = document.getElementById(id); if (s) spy.observe(s); });

  /* ---------- 7. Hero slideshow, word flip, plate parallax ---------- */
  const slides = $$('.hero-slide');
  const dots = $$('.hero-dot');
  const heroNum = $('#heroNum'), heroCap = $('#heroCaption');
  let heroIndex = 0, heroTimer;
  const showSlide = (n) => {
    if (n === heroIndex) return;
    const next = (n + slides.length) % slides.length;
    slides.forEach((s) => s.classList.remove('is-prev'));
    slides[heroIndex].classList.remove('is-active');
    slides[heroIndex].classList.add('is-prev');
    slides[next].classList.add('is-active');
    heroIndex = next;
    heroNum.textContent = String(next + 1).padStart(2, '0');
    heroCap.textContent = slides[next].dataset.caption;
    dots.forEach((d, i) => {
      d.classList.remove('is-active');
      void d.offsetWidth; // restart progress bar
      if (i === next) d.classList.add('is-active');
    });
  };
  const startHero = () => { clearInterval(heroTimer); if (!reduceMotion) heroTimer = setInterval(() => showSlide(heroIndex + 1), 6500); };
  dots.forEach((d, i) => d.addEventListener('click', () => { showSlide(i); startHero(); }));
  startHero();

  const flipWords = $$('.flip-word');
  let flipIndex = 0;
  if (!reduceMotion && flipWords.length) {
    setInterval(() => {
      const cur = flipWords[flipIndex];
      cur.classList.remove('is-on'); cur.classList.add('is-out'); cur.setAttribute('aria-hidden', 'true');
      flipIndex = (flipIndex + 1) % flipWords.length;
      const nx = flipWords[flipIndex];
      nx.classList.remove('is-out'); nx.classList.add('is-on'); nx.removeAttribute('aria-hidden');
      setTimeout(() => cur.classList.remove('is-out'), 700);
    }, 2600);
  }

  const hero = $('.hero'), plate = $('#plateWrap');
  if (plate && !reduceMotion && window.matchMedia('(hover: hover)').matches) {
    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      plate.style.setProperty('--px', (((e.clientX - r.left) / r.width - 0.5) * -28).toFixed(1) + 'px');
      plate.style.setProperty('--py', (((e.clientY - r.top) / r.height - 0.5) * -28).toFixed(1) + 'px');
    });
    hero.addEventListener('mouseleave', () => { plate.style.setProperty('--px', '0px'); plate.style.setProperty('--py', '0px'); });
  }

  /* ---------- 8. Scroll reveal ---------- */
  const revealer = new IntersectionObserver((entries, obs) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      el.classList.add('is-visible');
      // remove stagger delay afterwards so hover effects respond instantly
      setTimeout(() => el.style.setProperty('--stagger', 0), 1400);
      obs.unobserve(el);
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });
  $$('[data-reveal]').forEach((el) => revealer.observe(el));

  /* ---------- 9. Counters ---------- */
  const countObs = new IntersectionObserver((entries, obs) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      const target = +el.dataset.target;
      const suffix = el.dataset.suffix || '';
      const dur = reduceMotion ? 0 : 1800;
      const t0 = performance.now();
      const tick = (now) => {
        const p = dur ? Math.min((now - t0) / dur, 1) : 1;
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString('en-IN') + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      obs.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$('.counter').forEach((c) => countObs.observe(c));

  /* ---------- 10. Class filters (cuisine × level) ---------- */
  const cards = $$('.class-card');
  const empty = $('#emptyState');
  let cuisine = 'all', level = 'all';
  const runFilter = () => {
    let shown = 0;
    cards.forEach((card) => {
      const match = (cuisine === 'all' || card.dataset.cuisine === cuisine) &&
                    (level === 'all' || card.dataset.level === level);
      if (match) {
        shown++;
        card.classList.remove('is-hidden');
        card.classList.add('is-filtering', 'is-visible');
        requestAnimationFrame(() => requestAnimationFrame(() => card.classList.remove('is-filtering')));
      } else {
        card.classList.add('is-filtering');
        setTimeout(() => card.classList.add('is-hidden'), 300);
      }
    });
    empty.hidden = shown !== 0;
  };
  const bindGroup = (selector, attr, setter) => {
    const btns = $$(selector);
    btns.forEach((b) => b.addEventListener('click', () => {
      btns.forEach((x) => { x.classList.remove('is-active'); x.setAttribute('aria-pressed', 'false'); });
      b.classList.add('is-active'); b.setAttribute('aria-pressed', 'true');
      setter(b.dataset[attr]);
      runFilter();
    }));
  };
  bindGroup('.filter-btn', 'filterCuisine', (v) => { cuisine = v; });
  bindGroup('.level-btn', 'filterLevel', (v) => { level = v; });

  /* ---------- 11. Gallery lightbox ---------- */
  const items = $$('.g-item');
  const lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
  let lbIndex = 0, lastFocus = null;
  const openLb = (i) => {
    lbIndex = (i + items.length) % items.length;
    const img = $('img', items[lbIndex]);
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = $('figcaption', items[lbIndex]).textContent;
    lbImg.style.animation = 'none'; void lbImg.offsetWidth; lbImg.style.animation = '';
    if (lb.hidden) { lastFocus = document.activeElement; lb.hidden = false; document.body.classList.add('no-scroll'); $('#lbClose').focus(); }
  };
  const closeLb = () => { lb.hidden = true; document.body.classList.remove('no-scroll'); lastFocus && lastFocus.focus(); };
  items.forEach((it, i) => {
    it.tabIndex = 0;
    it.setAttribute('role', 'button');
    it.addEventListener('click', () => openLb(i));
    it.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLb(i); } });
  });
  $('#lbClose').addEventListener('click', closeLb);
  $('#lbPrev').addEventListener('click', () => openLb(lbIndex - 1));
  $('#lbNext').addEventListener('click', () => openLb(lbIndex + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });

  /* ---------- 12. Testimonials slider ---------- */
  const track = $('#tTrack');
  const tCards = $$('.t-card', track);
  const tDots = $('#tDots');
  let tIndex = 0, tTimer;
  tCards.forEach((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', 'Show testimonial ' + (i + 1));
    b.addEventListener('click', () => { goT(i); startT(); });
    tDots.appendChild(b);
  });
  const goT = (n) => {
    tIndex = (n + tCards.length) % tCards.length;
    const sign = root.getAttribute('dir') === 'rtl' ? 1 : -1;
    track.style.transform = `translateX(${sign * tIndex * 100}%)`;
    $$('button', tDots).forEach((d, i) => d.classList.toggle('is-active', i === tIndex));
  };
  updateSlider = () => goT(tIndex);
  const startT = () => { clearInterval(tTimer); if (!reduceMotion) tTimer = setInterval(() => goT(tIndex + 1), 6500); };
  $('#tPrev').addEventListener('click', () => { goT(tIndex - 1); startT(); });
  $('#tNext').addEventListener('click', () => { goT(tIndex + 1); startT(); });
  const slider = $('.t-slider');
  slider.addEventListener('mouseenter', () => clearInterval(tTimer));
  slider.addEventListener('mouseleave', startT);
  goT(0); startT();

  // Apply saved direction now that slider exists
  applyDir(store.get('culina-dir') || root.getAttribute('dir') || 'ltr');

  /* ---------- 13. Magnetic buttons ---------- */
  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    $$('.magnetic').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        btn.style.setProperty('--mx', ((e.clientX - r.left - r.width / 2) * 0.25).toFixed(1) + 'px');
        btn.style.setProperty('--my', ((e.clientY - r.top - r.height / 2) * 0.35).toFixed(1) + 'px');
      });
      btn.addEventListener('mouseleave', () => { btn.style.setProperty('--mx', '0px'); btn.style.setProperty('--my', '0px'); });
    });
  }

  /* ---------- 14. Global keys ---------- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { if (!lb.hidden) closeLb(); if (nav.classList.contains('open')) setMenu(false); }
    if (!lb.hidden && e.key === 'ArrowRight') openLb(lbIndex + 1);
    if (!lb.hidden && e.key === 'ArrowLeft') openLb(lbIndex - 1);
  });

  /* ---------- 15. Footer year ---------- */
  $('#year').textContent = new Date().getFullYear();
  /* ---------- CTA: copy the offer code ---------- */
  const copyBtn = document.getElementById('copyCode');
  if (copyBtn) {
    const code = document.getElementById('offerCode').textContent.trim();
    const msg = document.getElementById('copyMsg');
    copyBtn.addEventListener('click', async () => {
      let ok = false;
      try { await navigator.clipboard.writeText(code); ok = true; } catch (e) {
        const t = document.createElement('textarea'); t.value = code; document.body.appendChild(t); t.select();
        try { ok = document.execCommand('copy'); } catch (err) {} t.remove();
      }
      msg.textContent = ok ? 'Copied! Paste it at checkout.' : 'Code: ' + code;
      msg.classList.add('show');
      copyBtn.textContent = ok ? 'Copied ✓' : 'Copy Code';
      setTimeout(() => { msg.classList.remove('show'); copyBtn.textContent = 'Copy Code'; }, 2600);
    });
  }
  /* ---------- Header: Home dropdown (Home 1 / Home 2) ---------- */
  (function () {
    const dds = Array.from(document.querySelectorAll('.has-dd'));
    if (!dds.length) return;
    const mobile = () => window.matchMedia('(max-width: 1180px)').matches;
    const setOpen = (dd, open) => {
      dd.classList.toggle('open', open);
      const btn = dd.querySelector('.dd-toggle');
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Hide home page options' : 'Show home page options');
    };
    const closeAll = (except) => dds.forEach((d) => { if (d !== except) setOpen(d, false); });
    dds.forEach((dd) => {
      const btn = dd.querySelector('.dd-toggle');
      const links = Array.from(dd.querySelectorAll('.dd-link'));
      btn.addEventListener('click', (e) => { e.stopPropagation(); const open = !dd.classList.contains('open'); closeAll(dd); setOpen(dd, open); });
      // keep aria-expanded accurate when the menu opens on hover (desktop)
      dd.addEventListener('mouseenter', () => { if (!mobile()) btn.setAttribute('aria-expanded', 'true'); });
      dd.addEventListener('mouseleave', () => { if (!mobile() && !dd.classList.contains('open')) btn.setAttribute('aria-expanded', 'false'); });
      // keyboard: arrow keys move through the menu, Escape closes it
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(dd, true); links[0].focus(); }
      });
      links.forEach((link, i) => {
        link.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowDown') { e.preventDefault(); links[(i + 1) % links.length].focus(); }
          if (e.key === 'ArrowUp') { e.preventDefault(); links[(i - 1 + links.length) % links.length].focus(); }
          if (e.key === 'Escape') { setOpen(dd, false); btn.focus(); }
        });
        // close the mobile menu after choosing a page
        link.addEventListener('click', () => { setOpen(dd, false); if (typeof setMenu === 'function') setMenu(false); });
      });
      dd.addEventListener('focusout', (e) => { if (!dd.contains(e.relatedTarget) && !mobile()) setOpen(dd, false); });
    });
    document.addEventListener('click', (e) => { if (!e.target.closest('.has-dd')) closeAll(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAll(); });
  })();
})();