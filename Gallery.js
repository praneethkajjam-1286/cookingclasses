/* =========================================================
   CULINA STUDIO — Gallery page interactions (standalone)
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

  /* ---------- 1. Images: Unsplash/Pexels → LoremFlickr → Picsum, so a photo always shows ---------- */
  const seedFor = (str) => { let h = 23; for (const c of str) h = (h * 41 + c.charCodeAt(0)) >>> 0; return 500 + (h % 9000); };
  $$('img[data-fallback]').forEach((img) => {
    const seed = seedFor(img.getAttribute('src'));
    const kw = encodeURIComponent(img.dataset.fallback);
    const sources = [
      `https://loremflickr.com/1200/900/${kw}?lock=${seed}`,
      `https://picsum.photos/seed/culina-gallery-${seed}/1200/900`
    ];
    let step = 0;
    const next = () => { if (step < sources.length) img.src = sources[step++]; };
    img.addEventListener('error', next);
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('loading') !== 'lazy') next();
  });

  /* ---------- 2. Theme + direction (shared keys with the other pages) ---------- */
  const themeBtn = $('#themeToggle');
  const applyTheme = (t) => {
    root.setAttribute('data-theme', t);
    themeBtn.setAttribute('aria-pressed', String(t === 'dark'));
    themeBtn.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  };
  applyTheme(store.get('culina-theme') || root.getAttribute('data-theme') || 'light');
  themeBtn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next); store.set('culina-theme', next);
  });
  const dirBtn = $('#dirToggle');
  const dirLabel = $('.dir-label', dirBtn);
  const applyDir = (d) => {
    root.setAttribute('dir', d);
    dirBtn.setAttribute('aria-pressed', String(d === 'rtl'));
    dirLabel.textContent = '↔';
  };
  applyDir(store.get('culina-dir') || root.getAttribute('dir') || 'ltr');
  dirBtn.addEventListener('click', () => {
    const next = isRtl() ? 'ltr' : 'rtl';
    applyDir(next); store.set('culina-dir', next);
  });
  window.addEventListener('storage', (e) => {
    if (e.key === 'culina-theme' && e.newValue) applyTheme(e.newValue);
    if (e.key === 'culina-dir' && e.newValue) applyDir(e.newValue);
  });

  /* ---------- 3. Header, back-to-top, mobile menu, magnetic CTA ---------- */
  const header = $('#header'), toTop = $('#toTop');
  const nav = $('#nav'), menuBtn = $('#menuToggle'), backdrop = $('#navBackdrop');
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
    toTop.classList.toggle('show', window.scrollY > 700);
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

  /* ---------- 4. Hero: mouse-depth parallax on the mosaic ---------- */
  const mosaic = $('#mosaic');
  if (mosaic && !reduceMotion && window.matchMedia('(hover: hover)').matches) {
    let raf = null, tx = 0, ty = 0;
    mosaic.addEventListener('mousemove', (e) => {
      const r = mosaic.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(() => {
        mosaic.style.setProperty('--mx', tx.toFixed(3));
        mosaic.style.setProperty('--my', ty.toFixed(3));
        raf = null;
      });
    });
    mosaic.addEventListener('mouseleave', () => { mosaic.style.setProperty('--mx', 0); mosaic.style.setProperty('--my', 0); });
  }
  // hero counters
  $$('.gl-count').forEach((el) => {
    const to = +el.dataset.to, suffix = el.dataset.suffix || '', dur = reduceMotion ? 0 : 1600;
    setTimeout(() => {
      const t0 = performance.now();
      const step = (now) => {
        const p = dur ? Math.min((now - t0) / dur, 1) : 1;
        el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))).toLocaleString('en-IN') + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, 1100);
  });

  /* ---------- 5. Reveal on scroll ---------- */
  const reveal = new IntersectionObserver((entries, obs) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add('shown');
      setTimeout(() => en.target.style.setProperty('--stagger', 0), 1300);
      obs.unobserve(en.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('[data-gl]').forEach((el) => reveal.observe(el));

  /* ---------- 6. Masonry filter ---------- */
  const filters = $$('.gl-filter');
  const items = $$('.m-item');
  let visible = items.slice();
  filters.forEach((btn) => btn.addEventListener('click', () => {
    filters.forEach((b) => { b.classList.toggle('is-on', b === btn); b.setAttribute('aria-pressed', String(b === btn)); });
    const f = btn.dataset.f;
    visible = [];
    items.forEach((it) => {
      const show = f === 'all' || it.dataset.cat === f;
      if (show) {
        visible.push(it);
        it.classList.remove('gone'); it.classList.add('shown');
        requestAnimationFrame(() => requestAnimationFrame(() => it.classList.remove('out')));
      } else {
        it.classList.add('out');
        setTimeout(() => { if (it.classList.contains('out')) it.classList.add('gone'); }, 320);
      }
    });
  }));

  /* ---------- 7. Lightbox ---------- */
  const lb = $('#glLightbox'), lbImg = $('#glbImg'), lbCap = $('#glbCap'), lbCount = $('#glbCount');
  let lbIndex = 0, lastFocus = null;
  const showLb = (i) => {
    lbIndex = (i + visible.length) % visible.length;
    const it = visible[lbIndex];
    const img = $('img', it);
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = $('strong', it).textContent;
    lbCount.textContent = `${lbIndex + 1} / ${visible.length}`;
    lbImg.style.animation = 'none'; void lbImg.offsetWidth; lbImg.style.animation = '';
  };
  const openLb = (it) => {
    lastFocus = document.activeElement;
    showLb(visible.indexOf(it));
    lb.hidden = false; document.body.classList.add('no-scroll');
    $('#glbClose').focus();
  };
  const closeLb = () => { lb.hidden = true; document.body.classList.remove('no-scroll'); if (lastFocus) lastFocus.focus(); };
  items.forEach((it) => $('.m-open', it).addEventListener('click', () => openLb(it)));
  $('#glbClose').addEventListener('click', closeLb);
  $('#glbPrev').addEventListener('click', () => showLb(lbIndex - 1));
  $('#glbNext').addEventListener('click', () => showLb(lbIndex + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
  let touchX = null;
  lb.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) showLb(lbIndex + (dx < 0 ? 1 : -1) * (isRtl() ? -1 : 1));
    touchX = null;
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { if (!lb.hidden) closeLb(); if (nav.classList.contains('open')) setMenu(false); }
    if (lb.hidden) return;
    if (e.key === 'ArrowRight') showLb(lbIndex + (isRtl() ? -1 : 1));
    if (e.key === 'ArrowLeft') showLb(lbIndex + (isRtl() ? 1 : -1));
    if (e.key === 'Tab') { // keep focus inside the lightbox
      const f = $$('button', lb).filter((b) => b.offsetParent !== null);
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- 8. Raw-to-plated comparison slider ---------- */
  const cmp = $('#compare-box'), range = $('#compareRange');
  const setPos = (v) => cmp.style.setProperty('--pos', v + '%');
  range.addEventListener('input', () => { cmp.classList.remove('hint'); setPos(isRtl() ? 100 - range.value : range.value); });
  // a gentle "hint" sweep the first time it scrolls into view
  const hintObs = new IntersectionObserver((en, obs) => {
    if (!en[0].isIntersecting || reduceMotion) return;
    obs.disconnect();
    cmp.classList.add('hint');
    setTimeout(() => setPos(70), 600);
    setTimeout(() => setPos(30), 1600);
    setTimeout(() => { setPos(50); range.value = 50; }, 2600);
    setTimeout(() => cmp.classList.remove('hint'), 3700);
  }, { threshold: 0.5 });
  hintObs.observe(cmp);

  /* ---------- 9. Showcase likes ---------- */
  const likes = JSON.parse(store.get('culina-likes') || '{}');
  $$('.like').forEach((btn, i) => {
    const count = $('b', btn);
    const base = +count.textContent;
    const key = 'p' + i;
    const render = () => {
      const on = !!likes[key];
      btn.classList.toggle('on', on);
      btn.setAttribute('aria-pressed', String(on));
      count.textContent = base + (on ? 1 : 0);
    };
    btn.addEventListener('click', () => { likes[key] = !likes[key]; store.set('culina-likes', JSON.stringify(likes)); render(); });
    render();
  });

  /* ---------- 10. Polaroids: fan out in view, click to bring forward ---------- */
  const pol = $('#polaroids');
  const polObs = new IntersectionObserver((en) => { pol.classList.toggle('fanned', en[0].isIntersecting && en[0].intersectionRatio > 0.6); }, { threshold: [0, 0.6, 1] });
  polObs.observe(pol);
  $$('.polaroid', pol).forEach((p) => {
    const front = () => { $$('.polaroid', pol).forEach((x) => x.classList.remove('front')); p.classList.add('front'); };
    p.addEventListener('click', front);
    p.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); front(); } });
  });

  /* ---------- 11. Event tabs (auto-advance until the visitor picks one) ---------- */
  const evTabs = $$('.ev-tab'), evPanels = $$('.ev-panel');
  let evIndex = 0, evTimer;
  const showEv = (i) => {
    evIndex = (i + evTabs.length) % evTabs.length;
    evTabs.forEach((t, n) => { t.classList.toggle('is-on', n === evIndex); t.setAttribute('aria-selected', String(n === evIndex)); t.tabIndex = n === evIndex ? 0 : -1; });
    evPanels.forEach((p, n) => p.classList.toggle('is-on', n === evIndex));
  };
  evTabs.forEach((t, i) => {
    t.addEventListener('click', () => { clearInterval(evTimer); showEv(i); });
    t.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); clearInterval(evTimer); showEv(evIndex + 1); evTabs[evIndex].focus(); }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); clearInterval(evTimer); showEv(evIndex - 1); evTabs[evIndex].focus(); }
    });
  });
  if (!reduceMotion) evTimer = setInterval(() => showEv(evIndex + 1), 5000);

  /* ---------- 12. Share your plate: drag & drop upload with preview ---------- */
  const drop = $('#drop'), file = $('#shareFile'), preview = $('#dropPreview'), empty = $('#dropEmpty');
  const form = $('#shareForm'), note = $('#sNote');
  let chosen = null;
  const showFile = (f) => {
    if (!f || !f.type.startsWith('image/')) { note.textContent = 'Please choose an image file (JPG or PNG).'; return; }
    if (f.size > 8 * 1024 * 1024) { note.textContent = 'That photo is over 8 MB — please pick a smaller one.'; return; }
    chosen = f; note.textContent = '';
    const reader = new FileReader();
    reader.onload = () => { preview.src = reader.result; preview.hidden = false; empty.hidden = true; drop.classList.remove('bad'); };
    reader.readAsDataURL(f);
  };
  file.addEventListener('change', () => showFile(file.files[0]));
  ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', (e) => { if (e.dataTransfer.files[0]) showFile(e.dataTransfer.files[0]); });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let ok = true;
    ['#sName', '#sDish'].forEach((id) => {
      const el = $(id), valid = el.value.trim() !== '';
      el.closest('.s-field').classList.toggle('bad', !valid);
      if (!valid) ok = false;
    });
    const consent = $('#sConsent');
    consent.closest('.s-consent').classList.toggle('bad', !consent.checked);
    if (!consent.checked) ok = false;
    drop.classList.toggle('bad', !chosen);
    if (!chosen) ok = false;
    if (!ok) { note.textContent = 'Please add a photo, your name, the dish name and tick the consent box.'; return; }
    note.textContent = `Thank you, ${$('#sName').value.trim().split(' ')[0]}! Your "${$('#sDish').value.trim()}" has been sent to our team for review.`;
    form.reset(); chosen = null; preview.hidden = true; preview.removeAttribute('src'); empty.hidden = false;
  });

  /* ---------- 13. Footer year ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
  /* ---------- CTA: newsletter sign-up ---------- */
  const newsForm = document.getElementById('newsForm');
  if (newsForm) {
    const email = document.getElementById('newsEmail');
    const note = document.getElementById('newsNote');
    const icon = document.querySelector('.news-icon');
    newsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
      email.closest('.news-field').classList.toggle('bad', !valid);
      if (!valid) { note.textContent = 'Please enter a valid email address.'; email.focus(); return; }
      note.textContent = "You're on the list! Your first Monthly Plate arrives at the start of next month.";
      icon.classList.remove('sent'); void icon.offsetWidth; icon.classList.add('sent');
      newsForm.reset();
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