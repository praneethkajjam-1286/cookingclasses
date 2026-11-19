/* =========================================================
   CULINA STUDIO — Login page interactions (standalone)
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

  /* ---------- 4. Header and mobile menu ---------- */
  const header = $('#header');
  const toTop = $('#toTop');
  const nav = $('#nav');
  const menuBtn = $('#menuToggle');
  const backdrop = $('#navBackdrop');
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 40);
    if (toTop) toTop.classList.toggle('show', y > 700);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

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
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: 0.15 }) : null;
  $$('[data-lg]').forEach((el) => (io ? io.observe(el) : el.classList.add('in')));

  /* ---------- 6. Hero slideshow (circle reveal + progress bars) ---------- */
  const stage = $('.lg-stage');
  const slides = $$('.lg-slide');
  const bars = $$('.lg-bar');
  const quote = $('.lg-quote');
  const SLIDE_MS = 6000;
  stage.style.setProperty('--slide-ms', SLIDE_MS + 'ms');
  let cur = 0, timer = null, paused = false;
  const show = (i) => {
    if (i === cur) return;
    slides.forEach((s) => s.classList.remove('was-on'));
    slides[cur].classList.add('was-on'); slides[cur].classList.remove('is-on');
    cur = (i + slides.length) % slides.length;
    slides[cur].classList.add('is-on');
    bars.forEach((b, k) => { b.classList.toggle('is-on', k === cur); b.classList.toggle('done', k < cur); b.setAttribute('aria-selected', String(k === cur)); });
    // restart the progress animation
    const bi = $('i', bars[cur]); bi.style.animation = 'none'; void bi.offsetWidth; bi.style.animation = '';
    $('#lgQuote').textContent = slides[cur].dataset.quote; $('#lgWho').textContent = slides[cur].dataset.who;
    quote.classList.remove('swap'); void quote.offsetWidth; quote.classList.add('swap');
    schedule();
  };
  const schedule = () => { clearTimeout(timer); if (!paused && !reduceMotion) timer = setTimeout(() => show(cur + 1), SLIDE_MS); };
  bars.forEach((b, k) => b.addEventListener('click', () => show(k)));
  stage.addEventListener('mouseenter', () => { paused = true; stage.classList.add('paused'); clearTimeout(timer); });
  stage.addEventListener('mouseleave', () => { paused = false; stage.classList.remove('paused'); schedule(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) clearTimeout(timer); else schedule(); });
  schedule();

  /* =========================================================
     7. AUTH — demo accounts stored in this browser.
     NOTE: this is a front-end demo. A real site must check
     passwords on a server; nothing here is secure storage.
     ========================================================= */
  const ACC_KEY = 'culina-accounts';
  const hash = (s) => { let h = 5381; for (const c of s) h = ((h << 5) + h + c.charCodeAt(0)) >>> 0; return 'h' + h.toString(36); };
  const seedAccounts = () => ([
    { role: 'student', name: 'Priya Sharma', email: 'priya.sharma@example.com', pass: hash('Culina@123') },
    { role: 'admin', name: 'Ananya Rao', email: 'ananya.rao@example.com', pass: hash('Admin@123') }
  ]);
  let accounts;
  try { accounts = JSON.parse(store.get(ACC_KEY)) || seedAccounts(); } catch (e) { accounts = seedAccounts(); }
  const saveAccounts = () => store.set(ACC_KEY, JSON.stringify(accounts));
  saveAccounts();
  const DEMO = { student: ['priya.sharma@example.com', 'Culina@123'], admin: ['ananya.rao@example.com', 'Admin@123'] };
  const OTP_CODE = '246810';
  const DASH = { student: 'user-dashboard.html', admin: 'admin-dashboard.html' };
  const SESSION = { student: 'culina-session', admin: 'culina-admin-session' };
  const validEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

  const params = new URLSearchParams(location.search);
  let role = params.get('role') === 'admin' ? 'admin' : 'student';
  // only allow redirects to our own dashboards
  const safeNext = (n) => (n && /^(user|admin)-dashboard\.html(#[a-z-]+)?$/.test(n) ? n : null);
  const next = safeNext(params.get('next'));
  if (next && next.startsWith('admin')) role = 'admin';

  /* field helpers */
  const fieldOf = (input) => input.closest('.field');
  const setErr = (input, msg) => {
    const f = fieldOf(input);
    f.classList.remove('bad'); void f.offsetWidth;
    f.classList.toggle('bad', !!msg); f.classList.toggle('ok', !msg && !!input.value);
    $('.field-err', f).textContent = msg || '';
    input.setAttribute('aria-invalid', String(!!msg));
    return !msg;
  };
  $$('.field-box input').forEach((inp) => inp.addEventListener('input', () => { const f = fieldOf(inp); if (f.classList.contains('bad')) { f.classList.remove('bad'); $('.field-err', f).textContent = ''; inp.removeAttribute('aria-invalid'); } }));
  const loading = (btn, on) => { btn.classList.toggle('loading', on); btn.setAttribute('aria-busy', String(on)); };
  const wait = (ms) => new Promise((r) => setTimeout(r, reduceMotion ? 0 : ms));

  /* show / hide password + caps lock */
  $$('.eye').forEach((eye) => eye.addEventListener('click', () => {
    const inp = $('input', eye.parentElement); const show = inp.type === 'password';
    inp.type = show ? 'text' : 'password';
    eye.setAttribute('aria-pressed', String(show)); eye.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    inp.focus();
  }));
  $$('input[type="password"]').forEach((inp) => {
    const caps = $('.caps', fieldOf(inp));
    if (!caps) return;
    const check = (e) => { if (e.getModifierState) caps.hidden = !e.getModifierState('CapsLock'); };
    inp.addEventListener('keydown', check); inp.addEventListener('keyup', check);
    inp.addEventListener('blur', () => { caps.hidden = true; });
  });

  /* views */
  const views = { signin: $('#viewSignin'), otp: $('#viewOtp'), signup: $('#viewSignup'), forgot: $('#viewForgot'), done: $('#viewDone') };
  const goView = (name, focus = true) => {
    if (name === 'signup' && role === 'admin') setRole('student');
    Object.entries(views).forEach(([k, v]) => v.classList.toggle('is-on', k === name));
    $('#authFlash').hidden = true;
    if (name === 'forgot') { $('#forgotForm').hidden = false; $('#fpSent').hidden = true; $('#fpEmail').value = $('#siEmail').value; }
    if (focus) { const f = $('input:not([type=checkbox])', views[name]); if (f) setTimeout(() => f.focus({ preventScroll: true }), 60); }
  };
  document.addEventListener('click', (e) => {
    const g = e.target.closest('[data-go]'); if (!g) return;
    goView(g.dataset.go);
    if (g.hasAttribute('data-scroll')) $('#authCard').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  });

  /* role switch */
  const roleSwitch = $('.role-switch');
  const setRole = (r) => {
    role = r;
    roleSwitch.classList.toggle('admin', r === 'admin');
    $$('.role-opt').forEach((b) => { const on = b.dataset.role === r; b.classList.toggle('is-on', on); b.setAttribute('aria-checked', String(on)); });
    $('#signinTitle').textContent = r === 'admin' ? 'Admin sign in' : 'Welcome back';
    $('#signinSub').textContent = r === 'admin' ? 'Manage classes, people, bookings and reports.' : 'Sign in to book seats, open your recipes and manage payments.';
    $('#toSignupRow').hidden = r === 'admin'; $('#adminNote').hidden = r !== 'admin';
    $('#siAlert').hidden = true;
    if (views.signup.classList.contains('is-on') && r === 'admin') goView('signin', false);
    if (views.otp.classList.contains('is-on') && r === 'student') goView('signin', false);
    refreshSession();
  };
  $$('.role-opt').forEach((b) => b.addEventListener('click', () => setRole(b.dataset.role)));
  roleSwitch.addEventListener('keydown', (e) => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) { e.preventDefault(); const r = role === 'admin' ? 'student' : 'admin'; setRole(r); $(`.role-opt[data-role="${r}"]`).focus(); }
  });
  $$('[data-pick]').forEach((b) => b.addEventListener('click', () => {
    setRole(b.dataset.pick); goView('signin');
    $('#authCard').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  }));

  /* already signed in? */
  const loginInfo = (r) => { try { return JSON.parse(store.get('culina-login-' + r)); } catch (e) { return null; } };
  const refreshSession = () => {
    const signed = store.get(SESSION[role]) === 'signed-in';
    const info = loginInfo(role);
    $('#authSession').hidden = !signed;
    if (signed) {
      $('#sessionName').textContent = `You're signed in${info ? ' as ' + info.name.split(' ')[0] : ''}`;
      $('#sessionSub').textContent = role === 'admin' ? 'Admin console' : 'Student dashboard';
      $('#sessionGo').href = role === 'admin' ? DASH.admin : (next && next.startsWith('user') ? next : DASH.student);
    }
  };
  $('#sessionOut').addEventListener('click', () => {
    store.set(SESSION[role], 'signed-out');
    refreshSession(); flash(`You've been signed out of the ${role === 'admin' ? 'admin console' : 'student dashboard'}.`);
  });
  const flash = (msg) => { const f = $('#authFlash'); f.textContent = msg; f.hidden = false; };

  /* remember me */
  const remembered = store.get('culina-remember');
  if (remembered) { $('#siEmail').value = remembered; $('#siRemember').checked = true; }

  $('#fillDemo').addEventListener('click', () => {
    const [em, pw] = DEMO[role];
    $('#siEmail').value = em; $('#siPass').value = pw;
    $$('#signinForm .field').forEach((f) => { f.classList.remove('bad'); $('.field-err', f).textContent = ''; });
    $('#siSubmit').focus();
  });

  /* finish: save session and go to the dashboard */
  const finish = async (acc, title) => {
    store.set(SESSION[acc.role], 'signed-in');
    store.set('culina-login-' + acc.role, JSON.stringify({ name: acc.name, email: acc.email, at: new Date().toISOString() }));
    $('#doneTitle').textContent = title || `Welcome, ${acc.name.split(' ')[0]}!`;
    $('#doneSub').textContent = `Taking you to your ${acc.role === 'admin' ? 'admin console' : 'dashboard'}…`;
    goView('done', false);
    await wait(1500);
    location.href = next && next.startsWith(acc.role === 'admin' ? 'admin' : 'user') ? next : DASH[acc.role];
  };

  /* --- sign in with lockout after 5 failed tries --- */
  let fails = +(store.get('culina-fails') || 0), lockUntil = +(store.get('culina-lock') || 0), lockTimer = null, pendingAdmin = null;
  const siAlert = $('#siAlert'), siBtn = $('#siSubmit');
  const runLock = () => {
    clearInterval(lockTimer);
    const tick = () => {
      const left = Math.ceil((lockUntil - Date.now()) / 1000);
      if (left <= 0) { clearInterval(lockTimer); siBtn.disabled = false; siAlert.hidden = true; fails = 0; store.set('culina-fails', '0'); return; }
      siBtn.disabled = true; siAlert.hidden = false;
      siAlert.textContent = `Too many attempts. For your safety, sign-in is paused for ${left}s.`;
    };
    tick(); lockTimer = setInterval(tick, 1000);
  };
  if (lockUntil > Date.now()) runLock();

  $('#signinForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (lockUntil > Date.now()) return;
    const em = $('#siEmail'), pw = $('#siPass');
    const email = em.value.trim().toLowerCase();
    let ok = setErr(em, !email ? 'Please enter your email.' : !validEmail(email) ? 'That email doesn\'t look right.' : '');
    ok = setErr(pw, !pw.value ? 'Please enter your password.' : '') && ok;
    siAlert.hidden = true;
    if (!ok) { $('#signinForm .field.bad input').focus(); return; }
    loading(siBtn, true); await wait(900); loading(siBtn, false);
    const acc = accounts.find((a) => a.email === email && a.role === role);
    if (!acc || acc.pass !== hash(pw.value)) {
      fails += 1; store.set('culina-fails', String(fails));
      const other = accounts.find((a) => a.email === email && a.role !== role);
      if (fails >= 5) { lockUntil = Date.now() + 30000; store.set('culina-lock', String(lockUntil)); runLock(); return; }
      siAlert.hidden = false;
      siAlert.textContent = other && other.pass === hash(pw.value)
        ? `This is ${other.role === 'admin' ? 'an admin' : 'a student'} account — switch to "${other.role === 'admin' ? 'Admin' : 'Student'}" above.`
        : `Email or password is incorrect. ${5 - fails} ${5 - fails === 1 ? 'try' : 'tries'} left.`;
      pw.value = ''; pw.focus();
      return;
    }
    fails = 0; store.set('culina-fails', '0');
    if ($('#siRemember').checked) store.set('culina-remember', email); else store.set('culina-remember', '');
    if (acc.role === 'admin') { pendingAdmin = acc; startOtp(acc.email); return; }
    finish(acc);
  });

  /* --- admin two-step code --- */
  const boxes = $$('#otpBoxes input'), otpAlert = $('#otpAlert');
  let otpTimer = null;
  const startResend = (btn, span, secs = 30) => {
    let left = secs; btn.disabled = true; span.textContent = left;
    const id = setInterval(() => { left -= 1; span.textContent = left; if (left <= 0) { clearInterval(id); btn.disabled = false; btn.textContent = 'Resend now'; } }, 1000);
    return id;
  };
  const startOtp = (email) => {
    $('#otpEmail').textContent = email.replace(/^(.).+(@.+)$/, '$1•••••$2');
    boxes.forEach((b) => { b.value = ''; b.classList.remove('filled'); });
    otpAlert.hidden = true; $('#otpBoxes').classList.remove('bad');
    goView('otp', false); boxes[0].focus();
    clearInterval(otpTimer); $('#otpResend').innerHTML = 'Resend in <span id="otpTimer">30</span>s';
    otpTimer = startResend($('#otpResend'), $('#otpTimer'));
  };
  boxes.forEach((b, i) => {
    b.addEventListener('input', () => {
      b.value = b.value.replace(/\D/g, '').slice(-1); b.classList.toggle('filled', !!b.value);
      if (b.value && i < boxes.length - 1) boxes[i + 1].focus();
      if (boxes.every((x) => x.value)) $('#otpForm').requestSubmit();
    });
    b.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !b.value && i > 0) { boxes[i - 1].focus(); boxes[i - 1].value = ''; boxes[i - 1].classList.remove('filled'); }
      if (e.key === 'ArrowLeft' && i > 0) boxes[i - 1].focus();
      if (e.key === 'ArrowRight' && i < boxes.length - 1) boxes[i + 1].focus();
    });
    b.addEventListener('paste', (e) => {
      const d = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6); if (!d) return;
      e.preventDefault(); d.split('').forEach((c, k) => { if (boxes[k]) { boxes[k].value = c; boxes[k].classList.add('filled'); } });
      (boxes[d.length] || boxes[5]).focus();
      if (d.length === 6) $('#otpForm').requestSubmit();
    });
  });
  $('#otpForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const code = boxes.map((b) => b.value).join('');
    otpAlert.hidden = true;
    if (code.length < 6) { otpAlert.hidden = false; otpAlert.textContent = 'Enter all 6 digits.'; boxes.find((b) => !b.value).focus(); return; }
    const btn = $('#otpSubmit'); loading(btn, true); await wait(800); loading(btn, false);
    if (code !== OTP_CODE) {
      const g = $('#otpBoxes'); g.classList.remove('bad'); void g.offsetWidth; g.classList.add('bad');
      otpAlert.hidden = false; otpAlert.textContent = 'That code is not right. Check it and try again.';
      boxes.forEach((b) => { b.value = ''; b.classList.remove('filled'); }); boxes[0].focus();
      return;
    }
    clearInterval(otpTimer); finish(pendingAdmin);
  });
  $('#otpResend').addEventListener('click', () => { clearInterval(otpTimer); $('#otpResend').innerHTML = 'Resend in <span id="otpTimer">30</span>s'; otpTimer = startResend($('#otpResend'), $('#otpTimer')); otpAlert.hidden = false; otpAlert.textContent = 'A new code is on its way (demo code: 246810).'; });

  /* --- create account --- */
  const RULES = { len: (v) => v.length >= 8, up: (v) => /[A-Z]/.test(v), num: (v) => /\d/.test(v), sym: (v) => /[^A-Za-z0-9]/.test(v) };
  const suPass = $('#suPass');
  suPass.addEventListener('input', () => {
    const v = suPass.value; let n = 0;
    $$('#pwRules li').forEach((li) => { const m = RULES[li.dataset.rule](v); li.classList.toggle('met', m); if (m) n += 1; });
    $('#pwMeter').style.width = (n / 4) * 100 + '%';
  });
  $('#suPass2').addEventListener('input', () => { const p2 = $('#suPass2'); if (p2.value && p2.value === suPass.value) fieldOf(p2).classList.add('ok'); else fieldOf(p2).classList.remove('ok'); });
  $('#signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = $('#suName').value.trim(), email = $('#suEmail').value.trim().toLowerCase(), phone = $('#suPhone').value.trim(), p = suPass.value, p2 = $('#suPass2').value;
    let ok = setErr($('#suName'), name.split(/\s+/).filter(Boolean).length < 2 ? 'Please enter your first and last name.' : '');
    ok = setErr($('#suPhone'), phone && !/^\+?[\d\s-]{8,16}$/.test(phone) ? 'Use digits, spaces or dashes only.' : '') && ok;
    ok = setErr($('#suEmail'), !validEmail(email) ? 'Please enter a valid email.' : accounts.some((a) => a.email === email) ? 'An account with this email already exists — try signing in.' : '') && ok;
    ok = setErr(suPass, !Object.values(RULES).every((r) => r(p)) ? 'Your password needs all four items above.' : '') && ok;
    ok = setErr($('#suPass2'), !p2 ? 'Please confirm your password.' : p2 !== p ? 'Passwords don\'t match.' : '') && ok;
    const terms = $('#suTerms').checked;
    $('#termsErr').textContent = terms ? '' : 'Please accept the terms to continue.';
    if (!ok || !terms) { const bad = $('#signupForm .field.bad input'); (bad || $('#suTerms')).focus(); return; }
    const btn = $('#suSubmit'); loading(btn, true); await wait(1100); loading(btn, false);
    const acc = { role: 'student', name, email, phone, pass: hash(p), created: new Date().toISOString() };
    accounts.push(acc); saveAccounts();
    finish(acc, `Welcome to Culina, ${name.split(' ')[0]}!`);
  });

  /* --- forgot password --- */
  let fpTimer = null;
  $('#forgotForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const em = $('#fpEmail'), email = em.value.trim().toLowerCase();
    if (!setErr(em, !validEmail(email) ? 'Please enter a valid email.' : '')) { em.focus(); return; }
    const btn = $('#fpSubmit'); loading(btn, true); await wait(1000); loading(btn, false);
    $('#forgotForm').hidden = true; $('#fpSent').hidden = false; $('#fpTo').textContent = email;
    clearInterval(fpTimer); $('#fpResend').innerHTML = 'Resend in <span id="fpTimer">30</span>s';
    fpTimer = startResend($('#fpResend'), $('#fpTimer'));
  });
  $('#fpResend').addEventListener('click', () => { clearInterval(fpTimer); $('#fpResend').innerHTML = 'Sent again · resend in <span id="fpTimer">30</span>s'; fpTimer = startResend($('#fpResend'), $('#fpTimer')); });

  /* start */
  setRole(role);
  if (params.get('out') === '1') flash(`You've signed out. See you in the kitchen soon!`);
  else if (next) flash('Please sign in to open your dashboard.');
  if (params.get('view') === 'signup' && role === 'student') goView('signup', false);

  /* ---------- 8. FAQ accordion ---------- */
  const faqItems = $$('.faq-item');
  faqItems.forEach((item) => {
    $('.faq-q', item).addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      faqItems.forEach((other) => { other.classList.remove('is-open'); $('.faq-q', other).setAttribute('aria-expanded', 'false'); });
      if (open) { item.classList.add('is-open'); $('.faq-q', item).setAttribute('aria-expanded', 'true'); }
    });
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