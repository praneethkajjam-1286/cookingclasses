/* =========================================================
   CULINA STUDIO — Contact page interactions (standalone)
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

  /* ---------- 5. Scroll reveal ---------- */
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: 0.12 }) : null;
  $$('[data-ct]').forEach((el) => (io ? io.observe(el) : el.classList.add('in')));

  /* ---------- 6. Toast + copy to clipboard ---------- */
  const toastEl = document.createElement('div');
  toastEl.className = 'ct-toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl);
  let toastTimer;
  const toast = (msg) => { toastEl.textContent = msg; toastEl.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2400); };
  const copyText = async (text) => {
    try { await navigator.clipboard.writeText(text); return true; } catch (e) {
      const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
      let ok = false; try { ok = document.execCommand('copy'); } catch (er) {} ta.remove(); return ok;
    }
  };
  document.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-copy]'); if (!b) return;
    const ok = await copyText(b.dataset.copy);
    toast(ok ? `Copied: ${b.dataset.copy}` : 'Copy not available — please select the text');
    if (ok && b.classList.contains('copy')) { const old = b.textContent; b.textContent = 'Copied'; b.classList.add('done'); setTimeout(() => { b.textContent = old; b.classList.remove('done'); }, 1600); }
  });

  /* ---------- 7. Hero: typing word rotator ---------- */
  const words = ['your next class', 'a private dinner', 'a team cook-off', 'a birthday in the kitchen', 'the perfect gift'];
  const wordEl = $('#ctWord');
  if (wordEl && !reduceMotion) {
    let wi = 0, ci = words[0].length, deleting = true;
    const tick = () => {
      const w = words[wi];
      if (deleting) { ci -= 1; if (ci <= 0) { deleting = false; wi = (wi + 1) % words.length; } }
      else { ci += 1; if (ci >= words[wi].length) { deleting = true; wordEl.textContent = words[wi]; return setTimeout(tick, 2200); } }
      wordEl.textContent = (deleting ? w : words[wi]).slice(0, Math.max(ci, 0)) || ' ';
      setTimeout(tick, deleting ? 40 : 75);
    };
    setTimeout(tick, 2600);
  }

  /* ---------- 8. Live studio status (Hyderabad time, IST) ---------- */
  const OPEN_H = 9, CLOSE_H = 21; // Tue–Sun 9 AM – 9 PM, Monday closed
  const istNow = () => {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t).value;
    const days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return { day: days[get('weekday')], h: +get('hour') % 24, m: +get('minute') };
  };
  const fmt12 = (h, m) => `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
  const nextOpening = (day, h) => {
    let d = day, addDays = 0;
    if (day !== 1 && h < OPEN_H) return 'today at 9 AM';
    do { d = (d + 1) % 7; addDays += 1; } while (d === 1);
    const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return addDays === 1 ? 'tomorrow at 9 AM' : `${names[d]} at 9 AM`;
  };
  const updateStatus = () => {
    const { day, h, m } = istNow();
    const open = day !== 1 && h >= OPEN_H && h < CLOSE_H;
    const minsLeft = (CLOSE_H - h) * 60 - m;
    const status = open ? (minsLeft <= 60 ? `Open · closes in ${minsLeft} min` : 'Open now · until 9 PM') : 'Closed now';
    const sub = open ? 'Walk in or call us' : `Opens ${nextOpening(day, h)}`;
    const live = $('#liveCard');
    if (live) { live.classList.toggle('closed', !open); $('#liveStatus').textContent = status; $('#liveSub').textContent = sub; $('#liveClock').textContent = fmt12(h, m); $('#liveClock').setAttribute('datetime', `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`); }
    const pill = $('#hoursPill');
    if (pill) { pill.textContent = open ? 'Open now' : 'Closed now'; pill.classList.toggle('closed', !open); }
    $$('#hoursList li').forEach((li) => li.classList.toggle('today', +li.dataset.day === day));
  };
  updateStatus(); setInterval(updateStatus, 30000);

  /* ---------- 9. Enquiry form: validation, draft autosave, success ---------- */
  const form = $('#enquiryForm');
  const DRAFT = 'culina-contact-draft', SENT = 'culina-enquiries';
  const F = (n) => form.elements[n];
  const validEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  const pad = (n) => String(n).padStart(2, '0');
  const isoLocal = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today); maxDate.setFullYear(maxDate.getFullYear() + 1);
  F('date').min = isoLocal(today); F('date').max = isoLocal(maxDate);

  const setErr = (el, msg) => {
    const f = el.closest('.f-field'); const err = $('.f-err', f);
    f.classList.remove('bad'); void f.offsetWidth;
    f.classList.toggle('bad', !!msg); if (err) err.textContent = msg || '';
    if (el.setAttribute) el.setAttribute('aria-invalid', String(!!msg));
    return !msg;
  };
  $$('.f-input', form).forEach((el) => el.addEventListener('input', () => { const f = el.closest('.f-field'); if (f.classList.contains('bad')) { f.classList.remove('bad'); $('.f-err', f).textContent = ''; } }));

  // topic changes what the guests field means
  const GUEST_RULES = {
    'Class booking': { label: 'Seats needed', hint: 'Classes seat up to 12 per session.', max: 12, on: true },
    'Private event': { label: 'Number of guests', hint: 'Up to 24 cooks, or 40 for a chef\'s-table dinner.', max: 40, on: true },
    'Corporate team': { label: 'Team size', hint: 'Teams of 6–60 — we split larger groups across stations.', max: 60, on: true },
    'Gift card': { label: 'Number of cards', hint: 'Each card covers one seat in any class.', max: 20, on: true },
    'Something else': { label: 'Number of people', hint: 'Not needed for general questions.', max: 60, on: false }
  };
  const applyTopic = () => {
    const r = GUEST_RULES[form.querySelector('[name=topic]:checked').value];
    $('#guestsLabel').textContent = r.label; $('#guestsHint').textContent = r.hint;
    F('guests').max = r.max; if (+F('guests').value > r.max) F('guests').value = r.max;
    $('#guestsField').classList.toggle('off', !r.on);
  };
  $$('[name=topic]', form).forEach((r) => r.addEventListener('change', () => { applyTopic(); saveDraft(); }));

  $$('[data-step]', form).forEach((b) => b.addEventListener('click', () => {
    const inp = F('guests'); const v = Math.min(+inp.max, Math.max(1, (+inp.value || 1) + +b.dataset.step));
    inp.value = v; saveDraft();
  }));
  F('guests').addEventListener('change', () => { const inp = F('guests'); inp.value = Math.min(+inp.max, Math.max(1, Math.round(+inp.value) || 1)); });

  F('date').addEventListener('change', () => {
    const v = F('date').value; const hint = $('#dateHint');
    if (!v) { hint.textContent = ''; return; }
    const d = new Date(v + 'T00:00');
    hint.textContent = d.getDay() === 1 ? 'We\'re closed on Mondays — we\'ll suggest the nearest day.' : d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  });

  const msg = F('message');
  const count = () => { $('#msgCount').textContent = `${msg.value.length} / 600`; };
  msg.addEventListener('input', count);

  // draft autosave
  const FIELDS = ['name', 'email', 'phone', 'date', 'guests', 'message'];
  let draftTimer;
  const saveDraft = () => {
    clearTimeout(draftTimer);
    draftTimer = setTimeout(() => {
      const d = {}; FIELDS.forEach((k) => { d[k] = F(k).value; });
      d.topic = form.querySelector('[name=topic]:checked').value; d.via = form.querySelector('[name=via]:checked').value;
      if (FIELDS.some((k) => k !== 'guests' && d[k])) store.set(DRAFT, JSON.stringify(d));
    }, 400);
  };
  form.addEventListener('input', saveDraft);
  form.addEventListener('change', saveDraft);
  const restore = () => {
    let d; try { d = JSON.parse(store.get(DRAFT)); } catch (e) { d = null; }
    if (!d) return;
    FIELDS.forEach((k) => { if (d[k] !== undefined) F(k).value = d[k]; });
    const t = form.querySelector(`[name=topic][value="${d.topic}"]`); if (t) t.checked = true;
    const v = form.querySelector(`[name=via][value="${d.via}"]`); if (v) v.checked = true;
    $('#draftNote').hidden = false;
    F('date').dispatchEvent(new Event('change'));
  };
  const clearForm = () => {
    form.reset(); F('guests').value = 2; store.set(DRAFT, '');
    $$('.f-field', form).forEach((f) => { f.classList.remove('bad'); const e = $('.f-err', f); if (e) e.textContent = ''; });
    $('#consentErr').textContent = ''; $('#dateHint').textContent = ''; $('#draftNote').hidden = true;
    applyTopic(); count();
  };
  $('#clearDraft').addEventListener('click', () => { clearForm(); toast('Draft cleared'); F('name').focus(); });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (F('website').value) return; // spam trap
    const name = F('name').value.trim(), email = F('email').value.trim(), phone = F('phone').value.trim(), via = form.querySelector('[name=via]:checked').value;
    const topic = form.querySelector('[name=topic]:checked').value;
    let ok = setErr(F('name'), name.length < 2 ? 'Please tell us your name.' : '');
    ok = setErr(F('email'), !email ? 'We need an email to reply.' : !validEmail(email) ? 'That email doesn\'t look right.' : '') && ok;
    const phoneOk = !phone || /^\+?[\d\s-]{8,16}$/.test(phone);
    ok = setErr(F('phone'), !phoneOk ? 'Use digits, spaces or dashes only.' : (via !== 'Email' && !phone) ? `Add a phone number so we can reply by ${via}.` : '') && ok;
    const dv = F('date').value;
    ok = setErr(F('date'), topic !== 'Something else' && topic !== 'Gift card' && !dv ? 'Pick a preferred date (you can change it later).' : dv && (dv < F('date').min || dv > F('date').max) ? 'Choose a date within the next 12 months.' : '') && ok;
    ok = setErr(msg, msg.value.trim().length < 15 ? 'Add a little more detail (15+ characters).' : '') && ok;
    const consent = F('consent').checked;
    $('#consentErr').textContent = consent ? '' : 'Please tick the box so we can reply.';
    if (!ok || !consent) { const bad = $('.f-field.bad .f-input, .f-field.bad input', form); (bad || F('consent')).focus(); return; }

    const btn = $('#sendBtn'); btn.classList.add('sending'); $('.lbl', btn).textContent = 'Sending…';
    setTimeout(() => {
      const ref = 'CS-' + Math.random().toString(36).slice(2, 7).toUpperCase();
      const entry = { ref, topic, name, email, phone, via, date: dv, guests: $('#guestsField').classList.contains('off') ? null : +F('guests').value, message: msg.value.trim(), at: new Date().toISOString() };
      let list = []; try { list = JSON.parse(store.get(SENT)) || []; } catch (er) {}
      list.unshift(entry); store.set(SENT, JSON.stringify(list.slice(0, 20)));
      $('#sentName').textContent = name.split(' ')[0]; $('#sentRef').textContent = ref; $('#sentVia').textContent = via.toLowerCase();
      const rows = [['Topic', topic], ['Date', dv ? new Date(dv + 'T00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'Flexible'], ['People', entry.guests ?? '—'], ['Email', email]];
      $('#sentSum').innerHTML = rows.map(([k, v]) => `<dt>${k}</dt><dd>${String(v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))}</dd>`).join('');
      form.hidden = true; $('#sentPanel').hidden = false; $('#sentPanel').focus({ preventScroll: true });
      $('.form-card').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      btn.classList.remove('sending'); $('.lbl', btn).textContent = 'Send Message';
      clearForm();
    }, reduceMotion ? 50 : 1100);
  });
  $('#newMsg').addEventListener('click', () => { $('#sentPanel').hidden = true; form.hidden = false; F('name').focus(); });
  applyTopic(); restore(); applyTopic(); count();

  /* ---------- 10. FAQ: accordion + search + topic tabs ---------- */
  const faqItems = $$('.faq-item');
  const faqQ = faqItems.map((it) => $('.faq-q', it).firstChild.textContent);
  faqItems.forEach((item) => {
    $('.faq-q', item).addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      faqItems.forEach((other) => { other.classList.remove('is-open'); $('.faq-q', other).setAttribute('aria-expanded', 'false'); });
      if (open) { item.classList.add('is-open'); $('.faq-q', item).setAttribute('aria-expanded', 'true'); }
    });
  });
  let faqCat = 'all';
  const filterFaq = () => {
    const term = $('#faqSearch').value.trim().toLowerCase();
    let shown = 0;
    faqItems.forEach((it, i) => {
      const text = (faqQ[i] + ' ' + $('.faq-a', it).textContent).toLowerCase();
      const match = (faqCat === 'all' || it.dataset.cat === faqCat) && (!term || text.includes(term));
      it.hidden = !match; if (match) shown += 1;
      const q = $('.faq-q', it).firstChild; // text node → rebuild with highlight
      const label = faqQ[i];
      const idx = term ? label.toLowerCase().indexOf(term) : -1;
      const span = document.createElement('span');
      if (idx >= 0) { span.append(label.slice(0, idx)); const mk = document.createElement('mark'); mk.textContent = label.slice(idx, idx + term.length); span.append(mk, label.slice(idx + term.length)); } else span.textContent = label;
      q.replaceWith(span);
    });
    $('#faqEmpty').hidden = shown > 0;
    $('#faqTerm').textContent = $('#faqSearch').value.trim();
  };
  $('#faqSearch').addEventListener('input', filterFaq);
  $$('.faq-tab').forEach((t) => t.addEventListener('click', () => {
    faqCat = t.dataset.cat;
    $$('.faq-tab').forEach((x) => { const on = x === t; x.classList.toggle('is-on', on); x.setAttribute('aria-selected', String(on)); });
    filterFaq();
  }));
  $('#askThis').addEventListener('click', () => {
    const q = $('#faqSearch').value.trim();
    if (form.hidden) { $('#sentPanel').hidden = true; form.hidden = false; }
    const other = form.querySelector('[name=topic][value="Something else"]'); other.checked = true; applyTopic();
    if (q && !msg.value) { msg.value = `Question: ${q}\n\n`; count(); }
    setTimeout(() => msg.focus({ preventScroll: true }), 700);
  });

  /* ---------- 11. Call-back request ---------- */
  $('#cbForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const ph = e.target.elements.cbPhone.value.trim(), out = $('#cbMsg');
    if (!/^\+?[\d\s-]{8,16}$/.test(ph)) { out.textContent = 'Please enter a valid phone number.'; out.classList.add('bad'); e.target.elements.cbPhone.focus(); return; }
    out.classList.remove('bad');
    const slot = e.target.elements.cbTime.value.split(' · ')[0].toLowerCase();
    out.textContent = `Thanks! We'll call ${ph} this ${slot === 'morning' ? 'morning' : slot} (or the next open day).`;
    let list = []; try { list = JSON.parse(store.get('culina-callbacks')) || []; } catch (er) {}
    list.unshift({ phone: ph, slot, at: new Date().toISOString() }); store.set('culina-callbacks', JSON.stringify(list.slice(0, 20)));
    e.target.reset(); e.target.elements.cbTime.selectedIndex = 2;
  });

  /* ---------- 12. Footer year ---------- */
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