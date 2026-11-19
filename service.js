/* =========================================================
   CULINA STUDIO — Services page interactions (standalone)
   ========================================================= */
(function () {
  'use strict';

  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isRtl = () => root.getAttribute('dir') === 'rtl';
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- 1. Images: Unsplash → LoremFlickr → Picsum, so a photo always shows ---------- */
  const seedFor = (str) => { let h = 29; for (const c of str) h = (h * 43 + c.charCodeAt(0)) >>> 0; return 600 + (h % 9000); };
  $$('img[data-fallback]').forEach((img) => {
    const seed = seedFor(img.getAttribute('src'));
    const kw = encodeURIComponent(img.dataset.fallback);
    const sources = [`https://loremflickr.com/1200/900/${kw}?lock=${seed}`, `https://picsum.photos/seed/culina-sv-${seed}/1200/900`];
    let step = 0;
    const next = () => { if (step < sources.length) img.src = sources[step++]; };
    img.addEventListener('error', next);
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('loading') !== 'lazy') next();
  });

  /* ---------- 2. Theme + direction (shared keys with every page) ---------- */
  const themeBtn = $('#themeToggle');
  const applyTheme = (t) => {
    root.setAttribute('data-theme', t);
    themeBtn.setAttribute('aria-pressed', String(t === 'dark'));
    themeBtn.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  };
  applyTheme(store.get('culina-theme') || root.getAttribute('data-theme') || 'light');
  themeBtn.addEventListener('click', () => { const n = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'; applyTheme(n); store.set('culina-theme', n); });
  const dirBtn = $('#dirToggle'), dirLabel = $('.dir-label', dirBtn);
  const applyDir = (d) => { root.setAttribute('dir', d); dirBtn.setAttribute('aria-pressed', String(d === 'rtl')); dirLabel.textContent = '↔'; };
  applyDir(store.get('culina-dir') || root.getAttribute('dir') || 'ltr');
  dirBtn.addEventListener('click', () => { const n = isRtl() ? 'ltr' : 'rtl'; applyDir(n); store.set('culina-dir', n); });
  window.addEventListener('storage', (e) => {
    if (e.key === 'culina-theme' && e.newValue) applyTheme(e.newValue);
    if (e.key === 'culina-dir' && e.newValue) applyDir(e.newValue);
  });

  /* ---------- 3. Header, back-to-top, mobile menu, magnetic CTA ---------- */
  const header = $('#header'), toTop = $('#toTop');
  const nav = $('#nav'), menuBtn = $('#menuToggle'), backdrop = $('#navBackdrop');
  const onScroll = () => { header.classList.toggle('scrolled', window.scrollY > 40); toTop.classList.toggle('show', window.scrollY > 700); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
  const setMenu = (open) => {
    nav.classList.toggle('open', open); backdrop.classList.toggle('show', open);
    document.body.classList.toggle('no-scroll', open); document.body.classList.toggle('nav-open', open);
    menuBtn.setAttribute('aria-expanded', String(open)); menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  backdrop.addEventListener('click', () => setMenu(false));
  $$('.nav-link').forEach((a) => a.addEventListener('click', () => setMenu(false)));
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

  /* ---------- 4. Service cards → open the matching detail page ----------
     All six cards use one detail page; the chosen service is passed in the URL
     (service-detail.html?service=slug) and service-detail.js renders it. */
  const cards = $$('.sv-card');
  const services = cards.map((c) => ({ slug: c.dataset.service, title: $('h3', c).textContent }));
  const detailUrl = (slug) => `service-detail.html?service=${encodeURIComponent(slug)}`;
  const openService = (slug) => {
    try { sessionStorage.setItem('culina-last-service', slug); } catch (e) {}
    window.location.href = detailUrl(slug);
  };
  cards.forEach((card) => {
    // the whole card is clickable; the button inside stays a real link for keyboard and screen-reader users
    card.addEventListener('click', (e) => {
      if (e.target.closest('a')) { try { sessionStorage.setItem('culina-last-service', card.dataset.service); } catch (err) {} return; }
      openService(card.dataset.service);
    });
  });

  /* ---------- 5. Hero spotlight: cycles through the six services ---------- */
  const pills = $$('.orbit-pill');
  const spot = $('#spotlight'), spotNum = $('#spotNum'), spotTitle = $('#spotTitle');
  let si = 0, spotTimer;
  const showSpot = (i) => {
    si = (i + services.length) % services.length;
    pills.forEach((p, n) => p.classList.toggle('is-on', n === si));
    spotNum.textContent = `${String(si + 1).padStart(2, '0')} / ${String(services.length).padStart(2, '0')}`;
    spotTitle.textContent = services[si].title;
    spotTitle.classList.remove('swap'); void spotTitle.offsetWidth; spotTitle.classList.add('swap');
    spot.href = detailUrl(services[si].slug);
  };
  const startSpot = () => { clearInterval(spotTimer); if (!reduceMotion) spotTimer = setInterval(() => showSpot(si + 1), 3200); };
  pills.forEach((p, i) => {
    p.addEventListener('mouseenter', () => { clearInterval(spotTimer); showSpot(i); });
    p.addEventListener('mouseleave', startSpot);
    p.addEventListener('focus', () => { clearInterval(spotTimer); showSpot(i); });
    p.addEventListener('click', () => openService(services[i].slug));
  });
  showSpot(0); startSpot();

  /* ---------- 6. Reveal on scroll ---------- */
  const reveal = new IntersectionObserver((entries, obs) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add('sv-on');
      setTimeout(() => en.target.style.setProperty('--stagger', 0), 1300);
      obs.unobserve(en.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('[data-sv]').forEach((el) => reveal.observe(el));

  /* ---------- 7. FAQ accordion ---------- */
  const faqItems = $$('#svFaq .faq-item');
  faqItems.forEach((item) => {
    $('.faq-q', item).addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      faqItems.forEach((o) => { o.classList.remove('is-open'); $('.faq-q', o).setAttribute('aria-expanded', 'false'); });
      if (open) { item.classList.add('is-open'); $('.faq-q', item).setAttribute('aria-expanded', 'true'); }
    });
  });

  /* ---------- 8. Works gallery lightbox ---------- */
  const works = $$('.work');
  const lb = $('#svLightbox'), lbImg = $('#svlbImg'), lbCap = $('#svlbCap');
  let li = 0, lastFocus = null;
  const showLb = (i) => {
    li = (i + works.length) % works.length;
    const img = $('img', works[li]);
    lbImg.src = img.currentSrc || img.src; lbImg.alt = img.alt;
    lbCap.textContent = $('.chip', works[li]).textContent;
    lbImg.style.animation = 'none'; void lbImg.offsetWidth; lbImg.style.animation = '';
  };
  const openLb = (i) => { lastFocus = document.activeElement; showLb(i); lb.hidden = false; document.body.classList.add('no-scroll'); $('#svlbClose').focus(); };
  const closeLb = () => { lb.hidden = true; document.body.classList.remove('no-scroll'); if (lastFocus) lastFocus.focus(); };
  works.forEach((w, i) => {
    w.addEventListener('click', () => openLb(i));
    w.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLb(i); } });
  });
  $('#svlbClose').addEventListener('click', closeLb);
  $('#svlbPrev').addEventListener('click', () => showLb(li - 1));
  $('#svlbNext').addEventListener('click', () => showLb(li + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { if (!lb.hidden) closeLb(); if (nav.classList.contains('open')) setMenu(false); }
    if (lb.hidden) return;
    if (e.key === 'ArrowRight') showLb(li + (isRtl() ? -1 : 1));
    if (e.key === 'ArrowLeft') showLb(li + (isRtl() ? 1 : -1));
  });

  /* ---------- 9. Footer year ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
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