/* =========================================================
   CULINA STUDIO — About page interactions (standalone)
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

  /* ---------- 1. Images: 3 internet sources so a photo always shows ----------
     1) Unsplash / Pexels  →  2) LoremFlickr (same subject)  →  3) Picsum
     Each fallback uses a seed made from the original URL, so no two images repeat. */
  const seedFor = (str) => { let h = 7; for (const c of str) h = (h * 31 + c.charCodeAt(0)) >>> 0; return 200 + (h % 9000); };
  $$('img[data-fallback]').forEach((img) => {
    const original = img.getAttribute('src');
    const seed = seedFor(original);
    const kw = encodeURIComponent(img.dataset.fallback);
    const sources = [
      `https://loremflickr.com/1200/900/${kw}?lock=${seed}`,
      `https://picsum.photos/seed/culina-${seed}/1200/900`
    ];
    let step = 0;
    const next = () => { if (step < sources.length) img.src = sources[step++]; };
    img.addEventListener('error', next);
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('loading') !== 'lazy') next();
  });

  /* ---------- 2. Theme (light / dark) — shared key with home page ---------- */
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
  };
  applyDir(store.get('culina-dir') || root.getAttribute('dir') || 'ltr');
  dirBtn.addEventListener('click', () => {
    const next = root.getAttribute('dir') === 'rtl' ? 'ltr' : 'rtl';
    applyDir(next);
    store.set('culina-dir', next);
  });
  window.addEventListener('storage', (e) => {
    if (e.key === 'culina-theme' && e.newValue) applyTheme(e.newValue);
    if (e.key === 'culina-dir' && e.newValue) applyDir(e.newValue);
  });

  /* ---------- 4. Header, back-to-top, mobile menu ---------- */
  const header = $('#header');
  const toTop = $('#toTop');
  const nav = $('#nav');
  const menuBtn = $('#menuToggle');
  const backdrop = $('#navBackdrop');
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 40);
    toTop.classList.toggle('show', y > 700);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

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
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && nav.classList.contains('open')) setMenu(false); });

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

  /* ---------- 5. Hero: expanding photo panels ---------- */
  const panels = $$('.ab-panel');
  let panelIndex = 0, panelTimer;
  const openPanel = (i) => {
    panelIndex = (i + panels.length) % panels.length;
    panels.forEach((p, n) => p.classList.toggle('is-open', n === panelIndex));
  };
  const startPanels = () => { clearInterval(panelTimer); if (!reduceMotion) panelTimer = setInterval(() => openPanel(panelIndex + 1), 4200); };
  panels.forEach((p, i) => {
    p.addEventListener('mouseenter', () => { openPanel(i); clearInterval(panelTimer); });
    p.addEventListener('mouseleave', startPanels);
    p.addEventListener('click', () => { openPanel(i); startPanels(); });
    p.addEventListener('focus', () => { openPanel(i); clearInterval(panelTimer); });
    p.addEventListener('blur', startPanels);
  });
  setTimeout(startPanels, 2000);

  /* ---------- 6. Scroll reveal ---------- */
  const reveal = new IntersectionObserver((entries, obs) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add('in-view');
      setTimeout(() => en.target.style.setProperty('--stagger', 0), 1400);
      obs.unobserve(en.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  $$('[data-ab]').forEach((el) => reveal.observe(el));

  /* ---------- 7. Timeline rail fills as you scroll ---------- */
  const timeline = $('#timeline');
  const fill = $('#timelineFill');
  const updateRail = () => {
    const r = timeline.getBoundingClientRect();
    const progress = Math.min(Math.max((window.innerHeight * 0.6 - r.top) / r.height, 0), 1);
    fill.style.setProperty('--fill', (progress * 100).toFixed(1) + '%');
  };

  /* ---------- 8. Approach: highlight the step nearest the middle of the screen ---------- */
  const steps = $$('.step');
  const apNum = $('#apNum'), apBar = $('#apBar');
  const updateSteps = () => {
    const mid = window.innerHeight * 0.55;
    let active = 0, best = Infinity;
    steps.forEach((s, i) => {
      const r = s.getBoundingClientRect();
      const d = Math.abs(r.top + r.height / 2 - mid);
      if (d < best) { best = d; active = i; }
    });
    steps.forEach((s, i) => s.classList.toggle('is-active', i === active));
    apNum.textContent = String(active + 1).padStart(2, '0');
    apBar.style.width = ((active + 1) / steps.length * 100) + '%';
  };

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { updateRail(); updateSteps(); ticking = false; });
  }, { passive: true });
  updateRail(); updateSteps();

  /* ---------- 9. Counters ---------- */
  const countObs = new IntersectionObserver((entries, obs) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      const to = +el.dataset.to, suffix = el.dataset.suffix || '';
      const dur = reduceMotion ? 0 : 1800, t0 = performance.now();
      const tick = (now) => {
        const p = dur ? Math.min((now - t0) / dur, 1) : 1;
        el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))).toLocaleString('en-IN') + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      obs.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$('.ab-count').forEach((c) => countObs.observe(c));

  /* ---------- 10. Flip cards: tap to flip on touch screens ---------- */
  $$('.flip-card').forEach((card) => {
    card.addEventListener('click', () => card.classList.toggle('is-flipped'));
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.classList.toggle('is-flipped'); } });
  });

  /* ---------- 11. FAQ accordion ---------- */
  const faqItems = $$('.faq-item');
  faqItems.forEach((item) => {
    $('.faq-q', item).addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      faqItems.forEach((other) => { other.classList.remove('is-open'); $('.faq-q', other).setAttribute('aria-expanded', 'false'); });
      if (open) { item.classList.add('is-open'); $('.faq-q', item).setAttribute('aria-expanded', 'true'); }
    });
  });

  /* ---------- 12. Footer year ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
  /* ---------- CTA: magnetic spinning button ---------- */
  const spin = document.querySelector('.spin-btn');
  if (spin && !reduceMotion && window.matchMedia('(hover: hover)').matches) {
    spin.addEventListener('mousemove', (e) => {
      const r = spin.getBoundingClientRect();
      spin.style.setProperty('--sx', ((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1) + 'px');
      spin.style.setProperty('--sy', ((e.clientY - r.top - r.height / 2) * 0.22).toFixed(1) + 'px');
    });
    spin.addEventListener('mouseleave', () => { spin.style.setProperty('--sx', '0px'); spin.style.setProperty('--sy', '0px'); });
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