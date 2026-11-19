/* =========================================================
   CULINA STUDIO — Classes page interactions (standalone)
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

  /* ---------- 1. Images: Unsplash/Pexels → LoremFlickr → Picsum, so a photo always shows ---------- */
  const seedFor = (str) => { let h = 11; for (const c of str) h = (h * 33 + c.charCodeAt(0)) >>> 0; return 300 + (h % 9000); };
  $$('img[data-fallback]').forEach((img) => {
    const seed = seedFor(img.getAttribute('src'));
    const kw = encodeURIComponent(img.dataset.fallback);
    const sources = [
      `https://loremflickr.com/1200/900/${kw}?lock=${seed}`,
      `https://picsum.photos/seed/culina-classes-${seed}/1200/900`
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
    requestAnimationFrame(moveInk);
  };
  dirBtn.addEventListener('click', () => {
    const next = root.getAttribute('dir') === 'rtl' ? 'ltr' : 'rtl';
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

  /* ---------- 4. Hero: typewriter cuisine ---------- */
  const typeEl = $('#typeText');
  const words = ['Italian', 'Indian', 'Japanese', 'Thai', 'Mexican', 'Baking'];
  if (typeEl && !reduceMotion) {
    let w = 0, i = words[0].length, deleting = true;
    const tick = () => {
      const word = words[w];
      if (deleting) {
        i--;
        typeEl.textContent = word.slice(0, i);
        if (i === 0) { deleting = false; w = (w + 1) % words.length; }
        setTimeout(tick, 55);
      } else {
        const target = words[w];
        i++;
        typeEl.textContent = target.slice(0, i);
        if (i === target.length) { deleting = true; setTimeout(tick, 1900); }
        else setTimeout(tick, 95);
      }
    };
    setTimeout(tick, 2400);
  }

  /* ---------- 5. Hero: countdown to the next class (next 6 PM, Tue–Sun) ---------- */
  const cd = $('#countdown');
  const nextClass = () => {
    const d = new Date();
    const t = new Date(d); t.setHours(18, 0, 0, 0);
    if (t <= d) t.setDate(t.getDate() + 1);
    while (t.getDay() === 1) t.setDate(t.getDate() + 1); // studio closed on Mondays
    return t;
  };
  let target = nextClass();
  const pad = (n) => String(n).padStart(2, '0');
  const updateCd = () => {
    let s = Math.max(0, Math.floor((target - new Date()) / 1000));
    if (s === 0) target = nextClass();
    const h = Math.floor(s / 3600); s %= 3600;
    cd.textContent = `${pad(h)}:${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
  };
  updateCd(); setInterval(updateCd, 1000);

  /* ---------- 6. Reveal + counters ---------- */
  const reveal = new IntersectionObserver((entries, obs) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add('on');
      setTimeout(() => en.target.style.setProperty('--stagger', 0), 1300);
      obs.unobserve(en.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('[data-cl]').forEach((el) => reveal.observe(el));

  $$('.cl-count').forEach((el) => {
    const to = +el.dataset.to, dur = reduceMotion ? 0 : 1600;
    setTimeout(() => {
      const t0 = performance.now();
      const step = (now) => {
        const p = dur ? Math.min((now - t0) / dur, 1) : 1;
        el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, 1500);
  });

  /* ---------- 7. Schedule: filter, search, sort ---------- */
  const grid = $('#classGrid');
  const cards = $$('.cl-card', grid);
  const chips = $$('#cuisineChips .chip');
  const segs = $$('#levelSeg .seg-btn');
  const search = $('#searchInput');
  const sortSel = $('#sortSelect');
  const countEl = $('#resultCount');
  const empty = $('#clEmpty');
  const state = { cuisine: 'all', level: 'all', q: '', sort: 'date' };

  const apply = () => {
    const sorted = [...cards].sort((a, b) => {
      if (state.sort === 'price-asc') return a.dataset.price - b.dataset.price;
      if (state.sort === 'price-desc') return b.dataset.price - a.dataset.price;
      return a.dataset.date - b.dataset.date;
    });
    sorted.forEach((c) => grid.appendChild(c));
    let shown = 0;
    cards.forEach((card) => {
      const text = card.textContent.toLowerCase();
      const ok = (state.cuisine === 'all' || card.dataset.cuisine === state.cuisine) &&
                 (state.level === 'all' || card.dataset.level === state.level) &&
                 (!state.q || text.includes(state.q));
      if (ok) {
        shown++;
        card.classList.remove('is-gone');
        card.classList.add('on');
        requestAnimationFrame(() => requestAnimationFrame(() => card.classList.remove('is-out')));
      } else {
        card.classList.add('is-out');
        setTimeout(() => { if (card.classList.contains('is-out')) card.classList.add('is-gone'); }, 320);
      }
    });
    countEl.textContent = `Showing ${shown} ${shown === 1 ? 'class' : 'classes'}`;
    empty.hidden = shown !== 0;
  };
  const setActive = (list, attr, value) => list.forEach((b) => {
    const on = b.dataset[attr] === value;
    b.classList.toggle('is-on', on);
    b.setAttribute('aria-pressed', String(on));
  });
  const setCuisine = (v) => { state.cuisine = v; setActive(chips, 'c', v); apply(); };
  const setLevel = (v) => { state.level = v; setActive(segs, 'l', v); apply(); };
  chips.forEach((b) => b.addEventListener('click', () => setCuisine(b.dataset.c)));
  segs.forEach((b) => b.addEventListener('click', () => setLevel(b.dataset.l)));
  let qTimer;
  search.addEventListener('input', () => { clearTimeout(qTimer); qTimer = setTimeout(() => { state.q = search.value.trim().toLowerCase(); apply(); }, 180); });
  sortSel.addEventListener('change', () => { state.sort = sortSel.value; apply(); });
  $('#resetFilters').addEventListener('click', () => {
    search.value = ''; state.q = ''; sortSel.value = 'date'; state.sort = 'date';
    state.cuisine = 'all'; state.level = 'all'; setActive(chips, 'c', 'all'); setActive(segs, 'l', 'all'); apply();
  });

  const goSchedule = () => $('#schedule').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });

  // Hero finder → filters schedule
  $('#finder').addEventListener('submit', (e) => {
    e.preventDefault();
    state.cuisine = $('#finderCuisine').value; state.level = $('#finderLevel').value;
    setActive(chips, 'c', state.cuisine); setActive(segs, 'l', state.level); apply();
    goSchedule();
  });
  // Cuisine tiles → filters schedule
  $$('.cuisine-tile').forEach((t) => t.addEventListener('click', () => { setCuisine(t.dataset.cuisine); goSchedule(); }));
  // Level buttons → filters schedule
  $$('[data-jump-level]').forEach((b) => b.addEventListener('click', () => { setLevel(b.dataset.jumpLevel); goSchedule(); }));

  /* ---------- 8. Level tabs with sliding ink ---------- */
  const tabs = $$('.level-tab');
  const ink = $('.level-ink');
  const panels = $$('.level-panel');
  function moveInk() {
    const active = $('.level-tab.is-active');
    if (!active || !ink) return;
    ink.style.left = active.offsetLeft + 'px';
    ink.style.width = active.offsetWidth + 'px';
  }
  const showLevel = (i) => {
    tabs.forEach((t, n) => { t.classList.toggle('is-active', n === i); t.setAttribute('aria-selected', String(n === i)); t.tabIndex = n === i ? 0 : -1; });
    panels.forEach((p, n) => {
      p.classList.remove('ready');
      p.hidden = n !== i; p.classList.toggle('is-active', n === i);
      if (n === i) requestAnimationFrame(() => requestAnimationFrame(() => p.classList.add('ready')));
    });
    moveInk();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => showLevel(i));
    t.addEventListener('keydown', (e) => {
      const rtl = root.getAttribute('dir') === 'rtl';
      if (e.key === (rtl ? 'ArrowLeft' : 'ArrowRight')) { showLevel((i + 1) % tabs.length); tabs[(i + 1) % tabs.length].focus(); }
      if (e.key === (rtl ? 'ArrowRight' : 'ArrowLeft')) { showLevel((i - 1 + tabs.length) % tabs.length); tabs[(i - 1 + tabs.length) % tabs.length].focus(); }
    });
  });
  window.addEventListener('resize', moveInk);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveInk);
  const levelObs = new IntersectionObserver((en, obs) => { if (en[0].isIntersecting) { showLevel(0); obs.disconnect(); } }, { threshold: 0.3 });
  levelObs.observe($('#levels'));
  applyDir(store.get('culina-dir') || root.getAttribute('dir') || 'ltr');

  /* ---------- 9. Weekly timetable ---------- */
  const week = [
    { d: 'Mon', n: 'Closed', s: [] },
    { d: 'Tue', n: '24 Nov', s: [['10:00 AM', 'Knife Skills Bootcamp', 'Beginner · Chef Daniel', '6 seats'], ['6:30 PM', 'Street Tacos & Fresh Salsas', 'Intermediate · Chef Sofia', '5 seats']] },
    { d: 'Wed', n: '25 Nov', s: [['10:00 AM', 'French Macarons & Éclairs', 'Advanced · Chef Camille', '3 seats'], ['2:00 PM', 'Weeknight Indian Curries', 'Beginner · Chef Arjun', '8 seats'], ['7:00 PM', 'Sushi Rolls Night', 'Intermediate · Chef Kenji', 'Full']] },
    { d: 'Thu', n: '26 Nov', s: [['11:00 AM', 'Sourdough Starter Clinic', 'Beginner · Chef Camille', '9 seats'], ['6:00 PM', 'Fresh Ravioli & Brown Butter', 'Beginner · Chef Giulia', '4 seats']] },
    { d: 'Fri', n: '27 Nov', s: [['5:30 PM', 'Hyderabadi Dum & Mirchi Salan', 'Intermediate · Chef Arjun', '6 seats'], ['7:30 PM', 'Date Night: Risotto & Tiramisu', 'Beginner · Chef Giulia', 'Full']] },
    { d: 'Sat', n: '28 Nov', s: [['9:30 AM', 'Kids Pizza Club', 'Beginner · Chef Daniel', '7 seats'], ['11:00 AM', 'Ramen From Scratch', 'Advanced · Chef Kenji', '2 seats'], ['4:00 PM', 'Laminated Dough Masterclass', 'Advanced · Chef Camille', '3 seats']] },
    { d: 'Sun', n: '29 Nov', s: [['10:00 AM', 'Sunday Biryani with Meera', 'Intermediate · Chef Meera', '5 seats'], ['4:00 PM', 'Thai Market Favourites', 'Beginner · Chef Kenji', '8 seats']] }
  ];
  const dayTabs = $('#dayTabs'), sessionsEl = $('#sessions');
  const renderDay = (i) => {
    $$('.day-tab', dayTabs).forEach((b, n) => { b.classList.toggle('is-on', n === i); b.setAttribute('aria-selected', String(n === i)); });
    const day = week[i];
    sessionsEl.innerHTML = '';
    if (!day.s.length) { sessionsEl.innerHTML = '<li class="closed-note">The studio is closed on Mondays — see you Tuesday!</li>'; return; }
    day.s.forEach(([time, title, sub, seats], n) => {
      const li = document.createElement('li');
      li.className = 'session' + (seats === 'Full' ? ' full' : '');
      li.style.setProperty('--i', n);
      li.innerHTML = `<time>${time}</time><div><strong>${title}</strong><span>${sub}</span></div><span class="tag">${seats === 'Full' ? 'Waitlist' : seats + ' left'}</span>`;
      sessionsEl.appendChild(li);
    });
  };
  week.forEach((day, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'day-tab'; b.setAttribute('role', 'tab');
    b.innerHTML = `${day.d}<small>${day.n}</small>`;
    if (!day.s.length) b.disabled = true;
    b.addEventListener('click', () => renderDay(i));
    dayTabs.appendChild(b);
  });
  renderDay(1);

  /* ---------- 10. Pricing toggle ---------- */
  const billBtns = $$('.bill-btn');
  billBtns.forEach((b) => b.addEventListener('click', () => {
    billBtns.forEach((x) => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-pressed', String(x === b)); });
    $$('.amt').forEach((a) => {
      a.classList.add('flip');
      setTimeout(() => { a.textContent = a.dataset[b.dataset.bill]; a.classList.remove('flip'); }, 250);
    });
  }));

  /* ---------- 11. Private class request form ---------- */
  const form = $('#requestForm'), note = $('#formNote');
  $$('.field select', form).forEach((s) => s.addEventListener('change', () => s.classList.toggle('has-value', !!s.value)));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let ok = true;
    $$('[required]', form).forEach((el) => {
      const valid = el.checkValidity() && String(el.value).trim() !== '';
      el.closest('.field').classList.toggle('invalid', !valid);
      if (!valid) ok = false;
    });
    if (!ok) { note.textContent = 'Please fill in the highlighted fields.'; return; }
    note.textContent = `Thank you, ${$('#rqName').value.trim().split(' ')[0]}! We'll reply within one working day.`;
    form.reset();
    $$('.field select', form).forEach((s) => s.classList.remove('has-value'));
  });

  /* ---------- 12. Footer year ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
  /* ---------- CTA: seats-left counter ---------- */
  const seatCount = document.querySelector('.seat-count');
  if (seatCount) {
    const seatObs = new IntersectionObserver((en, obs) => {
      if (!en[0].isIntersecting) return;
      obs.disconnect();
      const to = +seatCount.dataset.to, dur = reduceMotion ? 0 : 1400, t0 = performance.now();
      const step = (now) => {
        const p = dur ? Math.min((now - t0) / dur, 1) : 1;
        seatCount.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.5 });
    seatObs.observe(seatCount);
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