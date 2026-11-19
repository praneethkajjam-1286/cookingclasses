/* =========================================================
   CULINA STUDIO — Weekend Workshops page interactions (standalone)
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
  const seedFor = (str) => { let h = 17; for (const c of str) h = (h * 37 + c.charCodeAt(0)) >>> 0; return 400 + (h % 9000); };
  $$('img[data-fallback]').forEach((img) => {
    const seed = seedFor(img.getAttribute('src'));
    const kw = encodeURIComponent(img.dataset.fallback);
    const sources = [
      `https://loremflickr.com/1200/900/${kw}?lock=${seed}`,
      `https://picsum.photos/seed/culina-ws-${seed}/1200/900`
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
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
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

  /* ---------- 4. Hero title: split into characters that drop in ---------- */
  let c = 0;
  $$('.ws-chars').forEach((el) => {
    const text = el.dataset.text;
    el.textContent = '';
    for (const ch of text) {
      const span = document.createElement('span');
      if (ch === ' ') { span.className = 'ws-space'; }
      else { span.className = 'ws-char'; span.textContent = ch; span.style.setProperty('--c', c++); }
      el.appendChild(span);
    }
  });

  /* ---------- 5. Hero: shuffling poster deck ---------- */
  const posters = $$('.poster');
  const deckNum = $('#deckNum');
  const cdTitle = $('#cdTitle');
  const workshopsData = [
    { title: 'Neapolitan Pizza Masterclass', start: new Date(2026, 10, 21, 10, 0) },
    { title: 'Plated Desserts & Patisserie', start: new Date(2026, 10, 22, 11, 0) },
    { title: 'Farm-to-Table Brunch Bowls', start: new Date(2026, 10, 28, 9, 30) }
  ];
  let order = [0, 1, 2], busy = false, deckTimer;
  const layout = () => {
    order.forEach((idx, pos) => {
      const p = posters[idx];
      p.classList.remove('pos-0', 'pos-1', 'pos-2');
      p.classList.add('pos-' + pos);
      p.setAttribute('aria-hidden', String(pos !== 0));
    });
    deckNum.textContent = String(order[0] + 1).padStart(2, '0');
  };
  const nextCard = () => {
    if (busy) return; busy = true;
    const top = posters[order[0]];
    top.classList.add('fly');
    setTimeout(() => {
      order.push(order.shift());
      top.classList.remove('fly');
      layout(); busy = false;
    }, reduceMotion ? 0 : 450);
  };
  const prevCard = () => { if (busy) return; order.unshift(order.pop()); layout(); };
  const startDeck = () => { clearInterval(deckTimer); if (!reduceMotion) deckTimer = setInterval(nextCard, 4500); };
  $('#deckNext').addEventListener('click', () => { nextCard(); startDeck(); });
  $('#deckPrev').addEventListener('click', () => { prevCard(); startDeck(); });
  posters.forEach((p) => p.addEventListener('click', () => { if (p.classList.contains('pos-0')) { nextCard(); startDeck(); } }));
  $('#deck').addEventListener('mouseenter', () => clearInterval(deckTimer));
  $('#deck').addEventListener('mouseleave', startDeck);
  layout(); startDeck();

  /* ---------- 6. Countdown to the next upcoming workshop ---------- */
  const els = { d: $('#cdD'), h: $('#cdH'), m: $('#cdM'), s: $('#cdS') };
  const pad = (n) => String(n).padStart(2, '0');
  const set = (el, v) => { if (el.textContent !== v) { el.textContent = v; el.classList.remove('tick'); void el.offsetWidth; el.classList.add('tick'); } };
  const tickCd = () => {
    const now = new Date();
    const next = workshopsData.find((w) => w.start > now) || workshopsData[workshopsData.length - 1];
    cdTitle.textContent = next.title;
    let s = Math.max(0, Math.floor((next.start - now) / 1000));
    const d = Math.floor(s / 86400); s %= 86400;
    const h = Math.floor(s / 3600); s %= 3600;
    set(els.d, pad(d)); set(els.h, pad(h)); set(els.m, pad(Math.floor(s / 60))); set(els.s, pad(s % 60));
  };
  tickCd(); setInterval(tickCd, 1000);

  /* ---------- 7. Reveal + counters ---------- */
  const reveal = new IntersectionObserver((entries, obs) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add('seen');
      setTimeout(() => en.target.style.setProperty('--stagger', 0), 1300);
      obs.unobserve(en.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('[data-ws]').forEach((el) => reveal.observe(el));

  const countObs = new IntersectionObserver((entries, obs) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target, to = +el.dataset.to, dec = +(el.dataset.dec || 0), suffix = el.dataset.suffix || '';
      const dur = reduceMotion ? 0 : 1800, t0 = performance.now();
      const step = (now) => {
        const p = dur ? Math.min((now - t0) / dur, 1) : 1;
        const v = to * (1 - Math.pow(1 - p, 3));
        el.textContent = (dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-IN')) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      obs.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$('.ws-count').forEach((el) => countObs.observe(el));

  /* ---------- 8. Calendar month filter ---------- */
  const monthTabs = $$('.month-tab');
  const wsCards = $$('.ws-card');
  monthTabs.forEach((tab) => tab.addEventListener('click', () => {
    monthTabs.forEach((t) => { t.classList.toggle('is-on', t === tab); t.setAttribute('aria-pressed', String(t === tab)); });
    const m = tab.dataset.m;
    wsCards.forEach((card) => {
      const show = m === 'all' || card.dataset.m === m;
      if (show) {
        card.classList.remove('gone'); card.classList.add('seen');
        requestAnimationFrame(() => requestAnimationFrame(() => card.classList.remove('hide')));
      } else {
        card.classList.add('hide');
        setTimeout(() => { if (card.classList.contains('hide')) card.classList.add('gone'); }, 320);
      }
    });
  }));

  /* ---------- 9. Day track: drag to scroll, arrows, progress ---------- */
  const track = $('#dayTrack'), bar = $('#dayBar');
  const updateBar = () => {
    const max = track.scrollWidth - track.clientWidth;
    const pos = Math.abs(track.scrollLeft);
    const p = max > 0 ? pos / max : 1;
    bar.style.width = (25 + p * 75) + '%';
  };
  track.addEventListener('scroll', updateBar, { passive: true });
  const stepBy = (dir) => {
    const card = $('.day-card', track);
    const amount = (card ? card.offsetWidth + 24 : 400) * dir * (isRtl() ? -1 : 1);
    track.scrollBy({ left: amount, behavior: reduceMotion ? 'auto' : 'smooth' });
  };
  $('#dayNext').addEventListener('click', () => stepBy(1));
  $('#dayPrev').addEventListener('click', () => stepBy(-1));
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); stepBy(isRtl() ? -1 : 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); stepBy(isRtl() ? 1 : -1); }
  });
  let down = false, startX = 0, startLeft = 0, moved = false;
  track.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') return;
    down = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft;
  });
  window.addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 4) { moved = true; track.classList.add('dragging'); }
    track.scrollLeft = startLeft - dx;
  });
  window.addEventListener('pointerup', () => {
    if (!down) return;
    down = false;
    if (moved) { track.classList.remove('dragging'); }
  });
  updateBar();

  /* ---------- 10. Reviews: parallax background + rotating quotes ---------- */
  const reviews = $('#reviews'), bg = $('.reviews-bg');
  const parallax = () => {
    const r = reviews.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return;
    const p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
    bg.style.transform = `translateY(${(-7 + p * 12).toFixed(2)}%)`;
  };
  const quotes = $$('.wq'), qDots = $('#quoteDots');
  let qi = 0, qTimer;
  quotes.forEach((_, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.setAttribute('aria-label', 'Show review ' + (i + 1));
    b.addEventListener('click', () => { showQuote(i); startQuotes(); });
    qDots.appendChild(b);
  });
  function showQuote(i) {
    qi = (i + quotes.length) % quotes.length;
    quotes.forEach((q, n) => q.classList.toggle('is-on', n === qi));
    $$('button', qDots).forEach((d, n) => d.classList.toggle('is-on', n === qi));
  }
  const startQuotes = () => { clearInterval(qTimer); if (!reduceMotion) qTimer = setInterval(() => showQuote(qi + 1), 5500); };
  showQuote(0); startQuotes();

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

  /* ---------- 12. Reservation form with live total ---------- */
  const form = $('#reserveForm');
  const sel = $('#rWorkshop'), kit = $('#rKit');
  const gCount = $('#gCount'), gMinus = $('#gMinus'), gPlus = $('#gPlus');
  const totalEl = $('#rTotal'), note = $('#rNote');
  let guests = 1, shownTotal = 0;
  const animateTotal = (to) => {
    const from = shownTotal, t0 = performance.now(), dur = reduceMotion ? 0 : 500;
    const step = (now) => {
      const p = dur ? Math.min((now - t0) / dur, 1) : 1;
      shownTotal = Math.round(from + (to - from) * p);
      totalEl.textContent = shownTotal.toLocaleString('en-IN');
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const recalc = () => {
    const opt = sel.selectedOptions[0];
    const price = opt && opt.dataset.price ? +opt.dataset.price : 0;
    gCount.textContent = guests;
    gMinus.disabled = guests <= 1; gPlus.disabled = guests >= 6;
    animateTotal((price + (kit.checked ? 499 : 0)) * guests);
  };
  gMinus.addEventListener('click', () => { guests = Math.max(1, guests - 1); recalc(); });
  gPlus.addEventListener('click', () => { guests = Math.min(6, guests + 1); recalc(); });
  sel.addEventListener('change', () => { sel.closest('.r-field').classList.remove('bad'); recalc(); });
  kit.addEventListener('change', recalc);
  recalc();

  // Any "Reserve"/"Book" button with data-pick preselects that workshop
  $$('[data-pick]').forEach((b) => b.addEventListener('click', () => { sel.value = b.dataset.pick; recalc(); }));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let ok = true;
    [sel, $('#rName'), $('#rEmail')].forEach((el) => {
      const valid = el.checkValidity() && String(el.value).trim() !== '';
      el.closest('.r-field').classList.toggle('bad', !valid);
      if (!valid) ok = false;
    });
    if (!ok) { note.textContent = 'Please complete the highlighted fields.'; return; }
    const name = $('#rName').value.trim().split(' ')[0];
    note.textContent = `Thank you, ${name}! ${guests} ${guests > 1 ? 'seats are' : 'seat is'} held for "${sel.selectedOptions[0].text.split(' — ')[0].split(' · ')[1]}". A confirmation email is on its way.`;
    form.reset(); guests = 1; recalc();
  });

  /* ---------- 13. Footer year ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
  /* ---------- CTA: 3D gift card ---------- */
  const giftCard = document.getElementById('giftCard');
  if (giftCard) {
    const amtEl = document.getElementById('giftAmt');
    const toEl = document.getElementById('giftTo');
    const flip = () => giftCard.classList.toggle('flipped');
    giftCard.addEventListener('click', flip);
    giftCard.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
    document.getElementById('flipCard').addEventListener('click', flip);
    document.querySelectorAll('.amount').forEach((b) => b.addEventListener('click', () => {
      document.querySelectorAll('.amount').forEach((x) => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-pressed', String(x === b)); });
      amtEl.textContent = b.dataset.amt;
      amtEl.classList.remove('bump'); void amtEl.offsetWidth; amtEl.classList.add('bump');
      giftCard.classList.remove('flipped');
    }));
    document.getElementById('giftName').addEventListener('input', (e) => {
      toEl.textContent = e.target.value.trim() || 'Someone special';
      giftCard.classList.add('flipped');
    });
    if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
      const stage = giftCard.parentElement;
      stage.addEventListener('mousemove', (e) => {
        const r = stage.getBoundingClientRect();
        giftCard.style.setProperty('--ry', (((e.clientX - r.left) / r.width - 0.5) * 22).toFixed(1) + 'deg');
        giftCard.style.setProperty('--rx', (((e.clientY - r.top) / r.height - 0.5) * -18).toFixed(1) + 'deg');
      });
      stage.addEventListener('mouseleave', () => { giftCard.style.setProperty('--rx', '0deg'); giftCard.style.setProperty('--ry', '0deg'); });
    }
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