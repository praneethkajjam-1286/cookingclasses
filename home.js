/* =========================================================
   CULINA STUDIO — Home 2 interactions (standalone)
   ========================================================= */
(function () {
  'use strict';

  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = window.matchMedia('(hover: hover)').matches;
  const isRtl = () => root.getAttribute('dir') === 'rtl';
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- 1. Images: Unsplash → LoremFlickr → Picsum, so a photo always shows ---------- */
  const seedFor = (str) => { let h = 37; for (const c of str) h = (h * 53 + c.charCodeAt(0)) >>> 0; return 800 + (h % 9000); };
  const fallbacks = (src, kw) => {
    const seed = seedFor(src), k = encodeURIComponent(kw);
    return [`https://loremflickr.com/1600/1000/${k}?lock=${seed}`, `https://picsum.photos/seed/culina-h2-${seed}/1600/1000`];
  };
  $$('img[data-fallback]').forEach((img) => {
    const sources = fallbacks(img.getAttribute('src'), img.dataset.fallback);
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
  const applyDir = (d) => { root.setAttribute('dir', d); dirBtn.setAttribute('aria-pressed', String(d === 'rtl')); dirLabel.textContent = '↔'; requestAnimationFrame(moveInk); };
  dirBtn.addEventListener('click', () => { const n = isRtl() ? 'ltr' : 'rtl'; applyDir(n); store.set('culina-dir', n); });
  window.addEventListener('storage', (e) => {
    if (e.key === 'culina-theme' && e.newValue) applyTheme(e.newValue);
    if (e.key === 'culina-dir' && e.newValue) applyDir(e.newValue);
  });

  /* ---------- 3. Header, back-to-top, mobile menu, magnetic CTA ---------- */
  const header = $('#header'), toTop = $('#toTop');
  const nav = $('#nav'), menuBtn = $('#menuToggle'), backdrop = $('#navBackdrop');
  const setMenu = (open) => {
    nav.classList.toggle('open', open); backdrop.classList.toggle('show', open);
    document.body.classList.toggle('no-scroll', open); document.body.classList.toggle('nav-open', open);
    menuBtn.setAttribute('aria-expanded', String(open)); menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  backdrop.addEventListener('click', () => setMenu(false));
  $$('.nav-link').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && nav.classList.contains('open')) setMenu(false); });
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
  if (!reduceMotion && canHover) {
    $$('.magnetic').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        btn.style.setProperty('--mx', ((e.clientX - r.left - r.width / 2) * 0.25).toFixed(1) + 'px');
        btn.style.setProperty('--my', ((e.clientY - r.top - r.height / 2) * 0.35).toFixed(1) + 'px');
      });
      btn.addEventListener('mouseleave', () => { btn.style.setProperty('--mx', '0px'); btn.style.setProperty('--my', '0px'); });
    });
  }

  /* ---------- 4. Hero: photo inside the SAVOUR letters ---------- */
  const word = $('.savour-word');
  const fillWord = (src) => { word.style.backgroundImage = `url("${src}")`; word.classList.add('has-img'); };
  (function loadWordImage() {
    const sources = [word.dataset.src, ...fallbacks(word.dataset.src, word.dataset.fallback)];
    let i = 0;
    const tryNext = () => {
      if (i >= sources.length) return; // letters simply stay in the theme colour
      const probe = new Image();
      const src = sources[i++];
      probe.onload = () => fillWord(src);
      probe.onerror = tryNext;
      probe.src = src;
    };
    tryNext();
  })();
  // the photo inside the letters drifts with the cursor
  const hero = $('.h2-hero');
  if (!reduceMotion && canHover) {
    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      word.style.setProperty('--bx', (((e.clientX - r.left) / r.width) * 100).toFixed(1) + '%');
      word.style.setProperty('--by', (((e.clientY - r.top) / r.height) * 100).toFixed(1) + '%');
    });
    hero.addEventListener('mouseleave', () => { word.style.setProperty('--bx', '50%'); word.style.setProperty('--by', '50%'); });
  }
  // remove the reveal curtains once they have lifted
  const curtains = $('.curtains');
  if (curtains) setTimeout(() => curtains.remove(), reduceMotion ? 0 : 1800);
  // "Open today" label based on the real day (studio closed Mondays)
  const today = new Date();
  $('#todayLabel').textContent = today.getDay() === 1 ? 'Closed today · back Tuesday 9 AM' : 'Open today · 9 AM – 9 PM';

  /* ---------- 5. Reveal on scroll + counters ---------- */
  const reveal = new IntersectionObserver((entries, obs) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add('h2-on');
      setTimeout(() => en.target.style.setProperty('--stagger', 0), 1300);
      obs.unobserve(en.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('[data-h2]').forEach((el) => reveal.observe(el));

  const countObs = new IntersectionObserver((entries, obs) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target, to = +el.dataset.to, suffix = el.dataset.suffix || '';
      const dur = reduceMotion ? 0 : 1800, t0 = performance.now();
      const step = (now) => {
        const p = dur ? Math.min((now - t0) / dur, 1) : 1;
        el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))).toLocaleString('en-IN') + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      obs.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$('.h2-count').forEach((el) => countObs.observe(el));

  /* ---------- 6. Signature menu: floating photo follows the cursor ---------- */
  const preview = $('#menuPreview'), previewInner = $('.menu-preview-inner', preview);
  if (canHover) {
    let px = 0, py = 0, x = 0, y = 0, raf = null;
    const loop = () => {
      x += (px - x) * 0.18; y += (py - y) * 0.18;
      preview.style.left = x.toFixed(1) + 'px'; preview.style.top = y.toFixed(1) + 'px';
      raf = Math.abs(px - x) + Math.abs(py - y) > 0.5 ? requestAnimationFrame(loop) : null;
    };
    $$('.dish-link').forEach((link) => {
      link.addEventListener('mouseenter', (e) => {
        const thumb = $('.dish-thumb img', link);
        if (!thumb) return;
        const img = thumb.cloneNode();
        img.removeAttribute('loading');
        previewInner.replaceChildren(img);
        px = x = e.clientX + 170; py = y = e.clientY;
        preview.classList.add('show');
      });
      link.addEventListener('mousemove', (e) => {
        px = e.clientX + (isRtl() ? -170 : 170); py = e.clientY;
        if (!raf) raf = requestAnimationFrame(loop);
      });
      link.addEventListener('mouseleave', () => preview.classList.remove('show'));
    });
  }

  /* ---------- 7. How it works: the dashed path draws as you scroll ---------- */
  const path = $('#stepsPath');
  if (path && !reduceMotion) {
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len}`;
    path.style.strokeDashoffset = `${len}`;
    const wrap = $('.steps-wrap');
    const drawPath = () => {
      const r = wrap.getBoundingClientRect();
      const p = Math.min(Math.max((window.innerHeight - r.top) / (window.innerHeight * 0.9), 0), 1);
      path.style.strokeDashoffset = `${(len * (1 - p)).toFixed(1)}`;
    };
    window.addEventListener('scroll', () => requestAnimationFrame(drawPath), { passive: true });
    drawPath();
  }

  /* ---------- 8. Chef spotlight: plate thumbnails expand ---------- */
  const plates = $$('.plate-thumb');
  plates.forEach((p) => {
    const pick = () => plates.forEach((x) => x.classList.toggle('is-on', x === p));
    p.addEventListener('mouseenter', pick);
    p.addEventListener('focus', pick);
    p.addEventListener('click', pick);
  });

  /* ---------- 9. Numbers band: slow parallax on the background photo ---------- */
  const band = $('.h2-band'), bandBg = $('.band-bg');
  const parallax = () => {
    const r = band.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return;
    const p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
    bandBg.style.transform = `translateY(${(p * 12).toFixed(2)}%)`;
  };

  /* ---------- 10. Seasonal menu tabs with sliding ink ---------- */
  const sTabs = $$('.season-tab'), sPanels = $$('.season-panel'), ink = $('.season-ink');
  function moveInk() {
    const on = $('.season-tab.is-on');
    if (!on || !ink) return;
    ink.style.left = on.offsetLeft + 'px';
    ink.style.width = on.offsetWidth + 'px';
  }
  const showSeason = (i) => {
    sTabs.forEach((t, n) => { t.classList.toggle('is-on', n === i); t.setAttribute('aria-selected', String(n === i)); t.tabIndex = n === i ? 0 : -1; });
    sPanels.forEach((p, n) => p.classList.toggle('is-on', n === i));
    moveInk();
  };
  sTabs.forEach((t, i) => {
    t.addEventListener('click', () => showSeason(i));
    t.addEventListener('keydown', (e) => {
      const fwd = isRtl() ? 'ArrowLeft' : 'ArrowRight', back = isRtl() ? 'ArrowRight' : 'ArrowLeft';
      if (e.key === fwd) { const n = (i + 1) % sTabs.length; showSeason(n); sTabs[n].focus(); }
      if (e.key === back) { const n = (i - 1 + sTabs.length) % sTabs.length; showSeason(n); sTabs[n].focus(); }
    });
  });
  // open on the current season (Dec–Feb winter, Mar–May spring, Jun–Jul summer, Aug–Nov monsoon)
  const m = today.getMonth();
  showSeason(m <= 1 || m === 11 ? 0 : m <= 4 ? 1 : m <= 6 ? 2 : 3);
  window.addEventListener('resize', moveInk);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveInk);
  applyDir(store.get('culina-dir') || root.getAttribute('dir') || 'ltr');

  /* ---------- 11. Scroll: header state, back-to-top, parallax ---------- */
  let ticking = false;
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
    toTop.classList.toggle('show', window.scrollY > 700);
    if (!reduceMotion) parallax();
    ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- 12. CTA: quick booking bar ---------- */
  const bar = $('#bookBar'), note = $('#bbNote');
  const type = $('#bbType'), date = $('#bbDate');
  const gOut = $('#bbGuests'), gMinus = $('#bbMinus'), gPlus = $('#bbPlus');
  let guests = 2;
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  date.min = iso(tomorrow);
  const renderGuests = () => { gOut.textContent = guests; gMinus.disabled = guests <= 1; gPlus.disabled = guests >= 12; };
  gMinus.addEventListener('click', () => { guests = Math.max(1, guests - 1); renderGuests(); });
  gPlus.addEventListener('click', () => { guests = Math.min(12, guests + 1); renderGuests(); });
  renderGuests();
  bar.addEventListener('submit', (e) => {
    e.preventDefault();
    let ok = true;
    [type, date].forEach((el) => {
      let valid = !!el.value;
      if (el === date && valid) {
        const d = new Date(el.value + 'T00:00');
        if (d < new Date(date.min + 'T00:00')) valid = false;
        if (d.getDay() === 1) { valid = false; note.textContent = 'We are closed on Mondays — please choose Tuesday to Sunday.'; }
      }
      el.closest('.bb-field').classList.toggle('bad', !valid);
      if (!valid) ok = false;
    });
    if (!ok) { if (!note.textContent.includes('Mondays')) note.textContent = 'Please choose an experience and a date from tomorrow onwards.'; return; }
    const d = new Date(date.value + 'T00:00');
    const nice = d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
    note.textContent = `Good news — ${type.value.toLowerCase()} places are available on ${nice} for ${guests} ${guests > 1 ? 'guests' : 'guest'}. Taking you to booking…`;
    setTimeout(() => { window.location.href = 'classes.html#schedule'; }, 2200);
  });
  [type, date].forEach((el) => el.addEventListener('change', () => { el.closest('.bb-field').classList.remove('bad'); note.textContent = ''; }));

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

  /* ---------- 13. Footer year ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();