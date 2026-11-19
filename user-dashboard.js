/* =========================================================
   CULINA STUDIO — Student (user) dashboard (standalone)
   All data is stored in this browser (localStorage) so every
   action — booking, cancelling, saving, messaging — persists.
   ========================================================= */
(function () {
  'use strict';

  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} }
  };
  const money = (n) => '₹' + Number(n).toLocaleString('en-IN');
  const fmtDate = (iso, opts = { day: 'numeric', month: 'short', year: 'numeric' }) => new Date(iso + (iso.length === 10 ? 'T00:00' : '')).toLocaleDateString('en-IN', opts);
  const todayISO = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const uid = (p) => p + Math.random().toString(36).slice(2, 8).toUpperCase();

  /* ---------- Icons ---------- */
  const ICONS = {
    home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    seat: '<path d="M7 3v10h10V3"/><path d="M5 13h14"/><path d="M7 13v8M17 13v8"/>',
    receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
    heart: '<path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z"/>',
    chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    bell: '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    chef: '<path d="M6 13.9V20h12v-6.1"/><path d="M6 14a4 4 0 1 1 1.6-7.7A5 5 0 0 1 16.4 6.3 4 4 0 1 1 18 14z"/>',
    check: '<path d="M5 12l5 5L20 7"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    dl: '<path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    star: '<path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z"/>',
    play: '<rect x="2" y="5" width="20" height="14" rx="3"/><path d="M10 9l5 3-5 3z"/>',
    send: '<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>',
    book: '<path d="M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3z"/><path d="M4 17a3 3 0 0 1 3-3h11"/>',
    pin: '<path d="M12 21s-7-6-7-12a7 7 0 0 1 14 0c0 6-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    wallet: '<rect x="2" y="6" width="20" height="14" rx="2"/><path d="M16 13h2M2 10h20"/>',
    print: '<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',
    flame: '<path d="M12 22a7 7 0 0 0 7-7c0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-4-3 3-5 5-5 8a7 7 0 0 0 7 7z"/>'
  };
  const icon = (k, cls = '') => `<svg class="svg-ico ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[k] || ''}</svg>`;
  const paintIcons = (scope = document) => $$('[data-ico]', scope).forEach((el) => { el.innerHTML = icon(el.dataset.ico); });

  /* =========================================================
     DATA (seeded once, then saved in localStorage)
     ========================================================= */
  const KEY = 'culina-user-v1';
  const seed = () => ({
    profile: { name: 'Priya Sharma', email: 'priya.sharma@example.com', phone: '+91 98480 12345', city: 'Hyderabad', level: 'Intermediate', diet: 'Vegetarian', bio: 'Home cook who loves fresh pasta and Sunday biryani experiments.', joined: '2025-03-14', credits: 1200 },
    bookings: [
      { id: 'BK-2041', title: 'Neapolitan Pizza Masterclass', cuisine: 'Italian', type: 'Workshop', chef: 'Chef Giulia', date: '2026-11-21', time: '10:00 AM', seats: 2, price: 5499, status: 'upcoming' },
      { id: 'BK-2052', title: 'French Macarons & Éclairs', cuisine: 'Baking', type: 'Class', chef: 'Chef Camille', date: '2026-11-25', time: '10:00 AM', seats: 1, price: 4499, status: 'upcoming' },
      { id: 'BK-2067', title: 'Fresh Pasta Feast', cuisine: 'Italian', type: 'Workshop', chef: 'Chef Giulia', date: '2026-12-05', time: '10:00 AM', seats: 1, price: 5299, status: 'upcoming' },
      { id: 'BK-1983', title: 'Royal Biryani & Curries', cuisine: 'Indian', type: 'Class', chef: 'Chef Arjun', date: '2026-11-07', time: '5:30 PM', seats: 1, price: 3999, status: 'completed', rating: 5 },
      { id: 'BK-1954', title: 'Knife Skills Bootcamp', cuisine: 'Basics', type: 'Class', chef: 'Chef Daniel', date: '2026-10-24', time: '10:00 AM', seats: 1, price: 2499, status: 'completed', rating: 0 },
      { id: 'BK-1921', title: 'Handmade Pasta & Sauces', cuisine: 'Italian', type: 'Class', chef: 'Chef Giulia', date: '2026-10-10', time: '6:00 PM', seats: 1, price: 3499, status: 'completed', rating: 4 },
      { id: 'BK-1890', title: 'Sushi & Knife Mastery', cuisine: 'Japanese', type: 'Class', chef: 'Chef Kenji', date: '2026-09-30', time: '7:00 PM', seats: 1, price: 4799, status: 'cancelled' }
    ],
    catalogue: [
      { id: 'CL-301', title: 'Fresh Ravioli & Brown Butter', cuisine: 'Italian', level: 'Beginner', chef: 'Chef Giulia', date: '2026-11-19', time: '6:00 PM', price: 3499, seats: 4 },
      { id: 'CL-302', title: 'Hyderabadi Dum & Mirchi Salan', cuisine: 'Indian', level: 'Intermediate', chef: 'Chef Arjun', date: '2026-11-20', time: '5:30 PM', price: 3999, seats: 6 },
      { id: 'CL-303', title: 'Ramen From Scratch', cuisine: 'Japanese', level: 'Advanced', chef: 'Chef Kenji', date: '2026-11-21', time: '11:00 AM', price: 4999, seats: 2 },
      { id: 'CL-304', title: 'Thai Market Favourites', cuisine: 'Thai', level: 'Beginner', chef: 'Chef Kenji', date: '2026-11-22', time: '4:00 PM', price: 2999, seats: 8 },
      { id: 'CL-305', title: 'Street Tacos & Fresh Salsas', cuisine: 'Mexican', level: 'Intermediate', chef: 'Chef Sofia', date: '2026-11-24', time: '6:30 PM', price: 3299, seats: 5 },
      { id: 'CL-306', title: 'Sunday Biryani with Meera', cuisine: 'Indian', level: 'Intermediate', chef: 'Chef Meera', date: '2026-11-29', time: '10:00 AM', price: 3999, seats: 5 },
      { id: 'CL-307', title: 'Sourdough Starter Clinic', cuisine: 'Baking', level: 'Beginner', chef: 'Chef Camille', date: '2026-11-26', time: '11:00 AM', price: 2799, seats: 9 },
      { id: 'CL-308', title: 'Laminated Dough Masterclass', cuisine: 'Baking', level: 'Advanced', chef: 'Chef Camille', date: '2026-11-28', time: '4:00 PM', price: 4799, seats: 3 }
    ],
    orders: [
      { id: 'INV-7712', date: '2026-11-15', item: 'Fresh Pasta Feast (1 seat)', amount: 5299, method: 'UPI', status: 'Paid' },
      { id: 'INV-7690', date: '2026-11-09', item: 'French Macarons & Éclairs (1 seat)', amount: 4499, method: 'Card •• 4417', status: 'Paid' },
      { id: 'INV-7655', date: '2026-11-02', item: 'Neapolitan Pizza Masterclass (2 seats)', amount: 10998, method: 'UPI', status: 'Paid' },
      { id: 'INV-7601', date: '2026-10-28', item: 'Royal Biryani & Curries (1 seat)', amount: 3999, method: 'Card •• 4417', status: 'Paid' },
      { id: 'INV-7533', date: '2026-10-15', item: 'Recipe Library — Yearly', amount: 4499, method: 'Card •• 4417', status: 'Paid' },
      { id: 'INV-7489', date: '2026-10-05', item: 'Knife Skills Bootcamp (1 seat)', amount: 2499, method: 'UPI', status: 'Paid' },
      { id: 'INV-7420', date: '2026-09-22', item: 'Sushi & Knife Mastery (1 seat)', amount: 4799, method: 'Card •• 4417', status: 'Refunded' },
      { id: 'INV-7388', date: '2026-09-18', item: 'Handmade Pasta & Sauces (1 seat)', amount: 3499, method: 'UPI', status: 'Paid' }
    ],
    saved: {
      recipes: [
        { id: 'RC-11', title: 'Cacio e Pepe', cuisine: 'Italian', time: '25 min', level: 'Beginner', ingredients: ['200 g spaghetti', '80 g pecorino, finely grated', '2 tsp black peppercorns', 'Salt for pasta water'], steps: ['Toast and crush the peppercorns.', 'Cook pasta in lightly salted water until just al dente; save a cup of water.', 'Whisk pecorino with a splash of warm pasta water into a paste.', 'Toss pasta with pepper and the cheese paste off the heat, loosening with water until glossy.'] },
        { id: 'RC-12', title: 'Hyderabadi Mirchi Salan', cuisine: 'Indian', time: '45 min', level: 'Intermediate', ingredients: ['8 long green chillies', '2 tbsp peanuts, 2 tbsp sesame, 1 tbsp coconut', '1 onion, sliced', 'Tamarind pulp, jaggery, curry leaves'], steps: ['Slit and lightly fry the chillies; set aside.', 'Dry-roast peanuts, sesame and coconut, then grind with onion to a paste.', 'Temper curry leaves, cook the paste with spices until oil separates.', 'Add tamarind, jaggery and water; simmer, then add chillies for 5 minutes.'] },
        { id: 'RC-13', title: 'Thai Green Curry Paste', cuisine: 'Thai', time: '20 min', level: 'Beginner', ingredients: ['6 green chillies', '2 stalks lemongrass', 'Thumb of galangal', 'Coriander roots, garlic, shallots, lime zest'], steps: ['Toast cumin and coriander seeds.', 'Pound or blend everything into a smooth paste.', 'Fry 2 tbsp of paste in coconut cream until fragrant.', 'Freeze the rest in an ice-cube tray.'] },
        { id: 'RC-14', title: 'Brown Butter Sage Sauce', cuisine: 'Italian', time: '10 min', level: 'Beginner', ingredients: ['60 g butter', '10 sage leaves', 'Pinch of salt', 'Squeeze of lemon'], steps: ['Melt butter over medium heat until it foams.', 'Add sage; cook until the butter smells nutty and turns golden.', 'Season with salt and lemon; spoon over ravioli at once.'] }
      ],
      classes: ['CL-303', 'CL-308']
    },
    threads: [
      { id: 'TH-1', from: 'Chef Giulia', role: 'Instructor', subject: 'Prep notes for the Pizza Masterclass', unread: true, messages: [
        { me: false, text: 'Ciao Priya! Looking forward to Saturday. Please arrive 10 minutes early — we start with a dough tasting.', time: '2026-11-17T18:20' },
        { me: false, text: 'If you have a favourite topping, bring it along and we will try it in the wood oven!', time: '2026-11-17T18:22' }] },
      { id: 'TH-2', from: 'Studio Team', role: 'Bookings', subject: 'Booking confirmed — French Macarons', unread: true, messages: [
        { me: false, text: 'Your seat for French Macarons & Éclairs on 25 November is confirmed. Aprons and tools are provided.', time: '2026-11-09T11:05' }] },
      { id: 'TH-3', from: 'Billing', role: 'Payments', subject: 'Refund processed for Sushi & Knife Mastery', unread: false, messages: [
        { me: true, text: 'Hi, I need to cancel my sushi class on 30 September. Could I get a refund?', time: '2026-09-25T09:40' },
        { me: false, text: 'Of course — we have refunded ₹4,799 to your card. It should appear within 5–7 working days.', time: '2026-09-25T12:15' }] }
    ],
    notifications: [
      { id: 'N1', text: 'Pizza Masterclass is in 3 days — see the prep notes from Chef Giulia.', time: '2026-11-18T08:00', read: false, link: 'messages' },
      { id: 'N2', text: 'New class added: Laminated Dough Masterclass (Advanced).', time: '2026-11-16T10:30', read: false, link: 'book' },
      { id: 'N3', text: 'Your invoice INV-7712 is ready to download.', time: '2026-11-15T14:10', read: true, link: 'orders' }
    ],
    settings: { email: true, sms: false, reminders: true, reminderTime: '24h', newsletter: true, language: 'English', publicProfile: false }
  });
  let DB;
  try { DB = JSON.parse(store.get(KEY)) || seed(); } catch (e) { DB = seed(); }
  const save = () => store.set(KEY, JSON.stringify(DB));
  // use the name + email of the account that signed in on login.html
  try {
    const who = JSON.parse(store.get('culina-login-student'));
    if (who && who.email && who.email !== DB.profile.email) { DB.profile.name = who.name; DB.profile.email = who.email; }
  } catch (e) {}
  save();

  /* =========================================================
     SHELL: theme, direction, sidebar, popovers, toasts, modal
     ========================================================= */
  paintIcons();
  const themeBtn = $('#themeToggle');
  const applyTheme = (t) => {
    root.setAttribute('data-theme', t);
    themeBtn.innerHTML = icon(t === 'dark' ? 'sun' : 'moon');
    themeBtn.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  };
  applyTheme(store.get('culina-theme') || root.getAttribute('data-theme') || 'light');
  themeBtn.addEventListener('click', () => { const n = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'; applyTheme(n); store.set('culina-theme', n); });
  const dirBtn = $('#dirToggle');
  const applyDir = (d) => { root.setAttribute('dir', d); $('.dir-label', dirBtn).textContent = '↔'; };
  applyDir(store.get('culina-dir') || 'ltr');
  dirBtn.addEventListener('click', () => { const n = root.getAttribute('dir') === 'rtl' ? 'ltr' : 'rtl'; applyDir(n); store.set('culina-dir', n); });
  window.addEventListener('storage', (e) => {
    if (e.key === 'culina-theme' && e.newValue) applyTheme(e.newValue);
    if (e.key === 'culina-dir' && e.newValue) applyDir(e.newValue);
  });

  // mobile sidebar
  const side = $('#side'), sideBack = $('#sideBack'), menuBtn = $('#menuBtn');
  const setSide = (open) => { side.classList.toggle('open', open); sideBack.classList.toggle('show', open); menuBtn.setAttribute('aria-expanded', String(open)); document.body.classList.toggle('no-scroll', open); };
  menuBtn.addEventListener('click', () => setSide(!side.classList.contains('open')));
  sideBack.addEventListener('click', () => setSide(false));

  // popovers (notifications + avatar)
  const pops = [[$('#bellBtn'), $('#notifPop')], [$('#avatarBtn'), $('#avatarPop')]];
  const closePops = () => pops.forEach(([b, p]) => { p.hidden = true; b.setAttribute('aria-expanded', 'false'); });
  pops.forEach(([btn, pop]) => btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = pop.hidden;
    closePops();
    pop.hidden = !open; btn.setAttribute('aria-expanded', String(open));
  }));
  document.addEventListener('click', (e) => { if (!e.target.closest('.pop-wrap')) closePops(); });

  // toasts
  const toast = (msg, ico = 'check') => {
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `${icon(ico)}<span>${esc(msg)}</span>`;
    $('#toasts').appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 400); }, 3200);
  };

  // modal
  const modalBack = $('#modalBack'), modal = $('#modal');
  let lastFocus = null;
  const openModal = (html, { wide = false } = {}) => {
    lastFocus = document.activeElement;
    modal.className = 'modal' + (wide ? ' modal-wide' : '');
    modal.innerHTML = `<button class="modal-x" type="button" aria-label="Close" data-close>${icon('x')}</button>${html}`;
    modalBack.hidden = false;
    document.body.classList.add('no-scroll');
    const f = modal.querySelector('input, select, textarea, button:not(.modal-x)');
    (f || modal.querySelector('.modal-x')).focus();
  };
  const closeModal = () => { modalBack.hidden = true; modal.innerHTML = ''; document.body.classList.remove('no-scroll'); if (lastFocus) lastFocus.focus(); };
  modalBack.addEventListener('click', (e) => { if (e.target === modalBack || e.target.closest('[data-close]')) closeModal(); });
  const confirmBox = (title, text, okLabel, onOk) => {
    openModal(`<h2 id="modalTitle" class="modal-title">${esc(title)}</h2><p class="modal-text">${esc(text)}</p>
      <div class="modal-actions"><button class="btn btn-secondary" type="button" data-close>Keep It</button><button class="btn btn-primary" type="button" id="okBtn">${esc(okLabel)}</button></div>`);
    $('#okBtn').addEventListener('click', () => { closeModal(); onOk(); });
  };
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { if (!modalBack.hidden) closeModal(); closePops(); setSide(false); }
    if (e.key === 'Tab' && !modalBack.hidden) {
      const f = $$('button, a[href], input, select, textarea', modal).filter((x) => !x.disabled && x.offsetParent !== null);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  const download = (name, text, type = 'text/plain') => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };
  const csv = (rows) => rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');

  /* =========================================================
     ROUTER
     ========================================================= */
  const VIEWS = ['overview', 'bookings', 'book', 'orders', 'saved', 'messages', 'profile', 'settings'];
  const renderers = {};
  let current = null;
  const go = (view, push = true) => {
    if (!VIEWS.includes(view)) view = 'overview';
    current = view;
    $$('.view').forEach((v) => v.classList.toggle('is-on', v.id === 'view-' + view));
    $$('.side-link[data-view]').forEach((a) => { const on = a.dataset.view === view; a.classList.toggle('is-on', on); a.toggleAttribute('aria-current', on); });
    const sec = $('#view-' + view);
    $('#viewTitle').textContent = sec.dataset.title;
    document.title = `${sec.dataset.title} — My Dashboard · Culina Studio`;
    renderers[view]();
    if (push && location.hash !== '#' + view) history.replaceState(null, '', '#' + view);
    setSide(false); closePops();
    if (!modalBack.hidden) closeModal();
    window.scrollTo({ top: 0, behavior: 'auto' });
  };
  window.addEventListener('hashchange', () => go(location.hash.slice(1), false));
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const v = link.getAttribute('href').slice(1);
    if (VIEWS.includes(v)) { e.preventDefault(); go(v); if (link.hasAttribute('data-compose')) composeMessage(); }
  });

  /* =========================================================
     COUNTS, NOTIFICATIONS, PROFILE CHIP
     ========================================================= */
  const initials = (n) => n.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || 'U';
  const refreshChrome = () => {
    const up = DB.bookings.filter((b) => b.status === 'upcoming').length;
    const unread = DB.threads.filter((t) => t.unread).length;
    const savedN = DB.saved.recipes.length + DB.saved.classes.length;
    $('#cntBookings').textContent = up || ''; $('#cntSaved').textContent = savedN || ''; $('#cntMsgs').textContent = unread || '';
    $('#topAvatar').textContent = initials(DB.profile.name);
    $('#popName').textContent = DB.profile.name; $('#popEmail').textContent = DB.profile.email;
    const nUnread = DB.notifications.filter((n) => !n.read).length;
    const dot = $('#bellDot'); dot.hidden = !nUnread; dot.textContent = nUnread;
    $('#notifList').innerHTML = DB.notifications.length ? DB.notifications.map((n) => `
      <li class="notif${n.read ? '' : ' unread'}"><button type="button" data-notif="${n.id}">
        <span class="notif-dot" aria-hidden="true"></span><span><span class="notif-text">${esc(n.text)}</span><small>${relTime(n.time)}</small></span></button></li>`).join('')
      : '<li class="empty-sm">You are all caught up.</li>';
  };
  const relTime = (iso) => {
    const diff = (Date.now() - new Date(iso).getTime()) / 60000;
    if (diff < 1) return 'just now';
    if (diff < 60) return `${Math.round(diff)} min ago`;
    if (diff < 1440) return `${Math.round(diff / 60)} h ago`;
    return fmtDate(iso.slice(0, 10), { day: 'numeric', month: 'short' });
  };
  const notify = (text, link) => { DB.notifications.unshift({ id: uid('N'), text, time: new Date().toISOString(), read: false, link }); save(); refreshChrome(); };
  $('#notifList').addEventListener('click', (e) => {
    const b = e.target.closest('[data-notif]'); if (!b) return;
    const n = DB.notifications.find((x) => x.id === b.dataset.notif); n.read = true; save(); refreshChrome(); go(n.link || 'overview');
  });
  $('#markAllRead').addEventListener('click', () => { DB.notifications.forEach((n) => { n.read = true; }); save(); refreshChrome(); toast('All notifications marked as read'); });

  /* =========================================================
     VIEW: OVERVIEW
     ========================================================= */
  const upcoming = () => DB.bookings.filter((b) => b.status === 'upcoming').sort((a, b) => a.date.localeCompare(b.date));
  let cdTimer = null;
  renderers.overview = () => {
    const up = upcoming();
    const done = DB.bookings.filter((b) => b.status === 'completed');
    const next = up[0];
    const spent = DB.orders.filter((o) => o.status === 'Paid').reduce((s, o) => s + o.amount, 0);
    const cuisines = {};
    done.forEach((b) => { cuisines[b.cuisine] = (cuisines[b.cuisine] || 0) + 1; });
    up.forEach((b) => { cuisines[b.cuisine] = (cuisines[b.cuisine] || 0) + 0.5; });
    const cuisineRows = Object.entries(cuisines).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const maxC = Math.max(1, ...cuisineRows.map((c) => c[1]));
    const hour = new Date().getHours();
    const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    $('#view-overview').innerHTML = `
      <div class="welcome card">
        <svg class="welcome-pattern" aria-hidden="true"><defs><pattern id="ptW" width="30" height="30" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="2" fill="currentColor"/></pattern></defs><rect width="100%" height="100%" fill="url(#ptW)"/></svg>
        <div class="welcome-copy">
          <span class="tagline tagline-on">${greet}</span>
          <h2>Welcome back, ${esc(DB.profile.name.split(' ')[0])}</h2>
          ${next ? `<p>Your next session is <strong>${esc(next.title)}</strong> on ${fmtDate(next.date, { weekday: 'long', day: 'numeric', month: 'long' })} at ${esc(next.time)}.</p>` : '<p>You have no upcoming sessions. Find your next class below.</p>'}
          <div class="welcome-actions"><a href="#book" class="btn btn-light">Book a Seat</a><a href="#bookings" class="btn btn-outline-light">My Bookings</a></div>
        </div>
        ${next ? `<div class="cd" aria-live="off"><span class="cd-label">Starts in</span><div class="cd-row"><div><b id="cdD">0</b><small>days</small></div><div><b id="cdH">0</b><small>hrs</small></div><div><b id="cdM">0</b><small>min</small></div></div></div>` : ''}
      </div>

      <div class="tiles">
        ${tile('calendar', up.length, 'Upcoming sessions', `${up.reduce((s, b) => s + b.seats, 0)} seats reserved`)}
        ${tile('check', done.length, 'Classes completed', 'Since ' + fmtDate(DB.profile.joined, { month: 'short', year: 'numeric' }))}
        ${tile('heart', DB.saved.recipes.length, 'Saved recipes', `${DB.saved.classes.length} saved classes`)}
        ${tile('wallet', money(DB.profile.credits), 'Studio credits', `${money(spent)} spent in total`)}
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-head"><h2>Upcoming sessions</h2><a href="#bookings" class="link-btn">View all</a></div>
          ${up.length ? `<ul class="sess-list">${up.slice(0, 3).map(sessRow).join('')}</ul>` : empty('calendar', 'No upcoming sessions', 'Book a seat to see it here.', '#book', 'Book a Seat')}
        </div>
        <div class="card">
          <div class="card-head"><h2>Your cooking journey</h2><span class="muted">by cuisine</span></div>
          ${cuisineRows.length ? `<ul class="journey">${cuisineRows.map(([c, v]) => `<li><span>${esc(c)}</span><span class="jbar"><i style="--w:${Math.round((v / maxC) * 100)}%"></i></span><b>${Math.floor(v)} done${v % 1 ? ' + 1 booked' : ''}</b></li>`).join('')}</ul>` : '<p class="muted">Complete a class to start your journey.</p>'}
          <div class="level-box"><span class="ico-round">${icon('flame')}</span><div><strong>Level: ${esc(DB.profile.level)}</strong><small>${Math.max(0, 8 - done.length)} more classes to reach Advanced</small></div></div>
        </div>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-head"><h2>Recent messages</h2><a href="#messages" class="link-btn">Open inbox</a></div>
          <ul class="msg-mini">${DB.threads.slice(0, 3).map((t) => `<li><a href="#messages" data-open-thread="${t.id}"><span class="avatar avatar-sm">${initials(t.from)}</span><span><strong>${esc(t.from)}${t.unread ? ' <b class="badge solid">New</b>' : ''}</strong><small>${esc(t.subject)}</small></span></a></li>`).join('')}</ul>
        </div>
        <div class="card">
          <div class="card-head"><h2>Recommended for you</h2><a href="#book" class="link-btn">Browse classes</a></div>
          <ul class="rec-list">${DB.catalogue.filter((c) => !DB.bookings.some((b) => b.title === c.title && b.status === 'upcoming')).slice(0, 3).map((c) => `
            <li><span class="date-chip"><b>${fmtDate(c.date, { day: '2-digit' })}</b>${fmtDate(c.date, { month: 'short' })}</span><span class="rec-main"><strong>${esc(c.title)}</strong><small>${esc(c.cuisine)} · ${esc(c.level)} · ${c.seats} seats left</small></span><button class="btn btn-primary btn-xs" type="button" data-book="${c.id}">Book</button></li>`).join('')}</ul>
        </div>
      </div>`;
    // countdown to the next session
    clearInterval(cdTimer);
    if (next) {
      const target = new Date(`${next.date}T${to24(next.time)}`);
      const tick = () => {
        let s = Math.max(0, (target - new Date()) / 1000);
        const d = Math.floor(s / 86400); s %= 86400;
        const el = (id) => document.getElementById(id);
        if (!el('cdD')) return clearInterval(cdTimer);
        el('cdD').textContent = d; el('cdH').textContent = Math.floor(s / 3600); el('cdM').textContent = Math.floor((s % 3600) / 60);
      };
      tick(); cdTimer = setInterval(tick, 30000);
    }
    // animate journey bars
    requestAnimationFrame(() => $$('.jbar i').forEach((i) => i.classList.add('grow')));
  };
  const to24 = (t) => { const m = t.match(/(\d+):(\d+)\s*(AM|PM)/i); if (!m) return '10:00'; let h = +m[1] % 12; if (/pm/i.test(m[3])) h += 12; return `${String(h).padStart(2, '0')}:${m[2]}`; };
  const tile = (ico, val, label, sub) => `<div class="tile card"><span class="ico-round">${icon(ico)}</span><div><b class="tile-val">${esc(val)}</b><span class="tile-label">${esc(label)}</span><small class="muted">${esc(sub)}</small></div></div>`;
  const empty = (ico, title, text, href, cta) => `<div class="empty"><span class="ico-round lg">${icon(ico)}</span><strong>${esc(title)}</strong><p>${esc(text)}</p>${href ? `<a href="${href}" class="btn btn-primary btn-sm">${esc(cta)}</a>` : ''}</div>`;
  const sessRow = (b) => `<li class="sess"><span class="date-chip"><b>${fmtDate(b.date, { day: '2-digit' })}</b>${fmtDate(b.date, { month: 'short' })}</span>
    <span class="sess-main"><strong>${esc(b.title)}</strong><small>${icon('clock')} ${esc(b.time)} · ${icon('chef')} ${esc(b.chef)} · ${b.seats} seat${b.seats > 1 ? 's' : ''}</small></span>
    <button class="icon-act" type="button" title="Add to calendar" aria-label="Add ${esc(b.title)} to calendar" data-ics="${b.id}">${icon('calendar')}</button></li>`;

  /* =========================================================
     VIEW: MY BOOKINGS
     ========================================================= */
  let bookTab = 'upcoming';
  renderers.bookings = () => {
    const list = DB.bookings.filter((b) => b.status === bookTab).sort((a, b) => bookTab === 'upcoming' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date));
    const counts = { upcoming: 0, completed: 0, cancelled: 0 };
    DB.bookings.forEach((b) => { counts[b.status]++; });
    $('#view-bookings').innerHTML = `
      <div class="toolbar">
        <div class="tabs" role="tablist" aria-label="Booking status">
          ${['upcoming', 'completed', 'cancelled'].map((t) => `<button class="tab${t === bookTab ? ' is-on' : ''}" role="tab" aria-selected="${t === bookTab}" data-btab="${t}">${t[0].toUpperCase() + t.slice(1)} <sup>${counts[t]}</sup></button>`).join('')}
        </div>
        <a href="#book" class="btn btn-primary btn-sm">${icon('plus')} Book a Seat</a>
      </div>
      ${list.length ? `<div class="bk-grid">${list.map(bookingCard).join('')}</div>` : `<div class="card">${empty('calendar', `No ${bookTab} bookings`, bookTab === 'upcoming' ? 'Your next class is one click away.' : 'Nothing here yet.', bookTab === 'upcoming' ? '#book' : '', 'Book a Seat')}</div>`}`;
  };
  const statusBadge = (s) => {
    const map = { upcoming: ['solid', 'calendar', 'Upcoming'], completed: ['soft', 'check', 'Completed'], cancelled: ['dashed', 'x', 'Cancelled'], Paid: ['solid', 'check', 'Paid'], Refunded: ['dashed', 'x', 'Refunded'], Pending: ['soft', 'clock', 'Pending'] };
    const [cls, ic, label] = map[s] || ['soft', 'check', s];
    return `<span class="badge ${cls}">${icon(ic)}${label}</span>`;
  };
  const stars = (n, id) => `<span class="stars" role="group" aria-label="Rate this class">${[1, 2, 3, 4, 5].map((i) => `<button type="button" class="star${i <= n ? ' on' : ''}" data-rate="${id}" data-val="${i}" aria-label="${i} star${i > 1 ? 's' : ''}">★</button>`).join('')}</span>`;
  const bookingCard = (b) => `
    <article class="bk card${b.status === 'cancelled' ? ' is-cancelled' : ''}">
      <div class="bk-top">
        <span class="date-chip lg"><b>${fmtDate(b.date, { day: '2-digit' })}</b>${fmtDate(b.date, { month: 'short' })}<small>${fmtDate(b.date, { weekday: 'short' })}</small></span>
        <div class="bk-main"><div class="bk-line">${statusBadge(b.status)}<span class="muted xs">${esc(b.id)} · ${esc(b.type)} · ${esc(b.cuisine)}</span></div><h3>${esc(b.title)}</h3>
          <p class="bk-meta">${icon('clock')} ${esc(b.time)} <span>·</span> ${icon('chef')} ${esc(b.chef)} <span>·</span> ${icon('seat')} ${b.seats} seat${b.seats > 1 ? 's' : ''}</p></div>
      </div>
      <div class="bk-foot">
        <span class="bk-price">${money(b.price * b.seats)}</span>
        <div class="bk-actions">
          ${b.status === 'upcoming' ? `<button class="btn btn-secondary btn-xs" type="button" data-ics="${b.id}">${icon('calendar')} Add to Calendar</button><button class="btn btn-primary btn-xs" type="button" data-cancel="${b.id}">Cancel</button>` : ''}
          ${b.status === 'completed' ? `${stars(b.rating || 0, b.id)}<button class="btn btn-secondary btn-xs" type="button" data-replay="${b.id}">${icon('play')} Watch Replay</button>` : ''}
          ${b.status === 'cancelled' ? `<button class="btn btn-secondary btn-xs" type="button" data-rebook="${b.title}">Book Again</button>` : ''}
        </div>
      </div>
    </article>`;
  $('#view-bookings').addEventListener('click', (e) => {
    const t = e.target.closest('[data-btab]'); if (t) { bookTab = t.dataset.btab; renderers.bookings(); return; }
    const c = e.target.closest('[data-cancel]');
    if (c) {
      const b = DB.bookings.find((x) => x.id === c.dataset.cancel);
      const hoursLeft = (new Date(`${b.date}T${to24(b.time)}`) - new Date()) / 3600000;
      const refundable = hoursLeft >= 48;
      confirmBox('Cancel this booking?', `${b.title} on ${fmtDate(b.date)}. ${refundable ? `You'll receive a full refund of ${money(b.price * b.seats)} as studio credit.` : 'This is within 48 hours of the class, so it is not refundable.'}`, 'Yes, Cancel', () => {
        b.status = 'cancelled';
        if (refundable) { DB.profile.credits += b.price * b.seats; DB.orders.unshift({ id: uid('INV-'), date: todayISO(), item: `Refund — ${b.title}`, amount: b.price * b.seats, method: 'Studio credit', status: 'Refunded' }); }
        const cl = DB.catalogue.find((x) => x.title === b.title); if (cl) cl.seats += b.seats;
        save(); refreshChrome(); renderers.bookings();
        notify(`Booking ${b.id} cancelled${refundable ? ' — credit added to your account' : ''}.`, 'bookings');
        toast('Booking cancelled');
      });
      return;
    }
    const r = e.target.closest('[data-rate]');
    if (r) { const b = DB.bookings.find((x) => x.id === r.dataset.rate); b.rating = +r.dataset.val; save(); renderers.bookings(); toast(`Thanks! You rated ${b.title} ${b.rating}/5`, 'star'); return; }
    const p = e.target.closest('[data-replay]');
    if (p) { const b = DB.bookings.find((x) => x.id === p.dataset.replay); openModal(`<h2 id="modalTitle" class="modal-title">Replay: ${esc(b.title)}</h2><div class="video-ph"><span class="ico-round lg">${icon('play')}</span><p>Class replay with ${esc(b.chef)} · 2 h 48 min</p></div><p class="modal-text">Replays stream from the Recipe Library. Chapters let you jump straight to each technique.</p><div class="modal-actions"><button class="btn btn-primary" data-close>Close</button></div>`); return; }
    const rb = e.target.closest('[data-rebook]'); if (rb) { go('book'); return; }
  });

  // Calendar (.ics) download — works from overview and bookings
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-ics]'); if (!b) return;
    const bk = DB.bookings.find((x) => x.id === b.dataset.ics); if (!bk) return;
    const start = `${bk.date.replace(/-/g, '')}T${to24(bk.time).replace(':', '')}00`;
    const endH = String(Math.min(23, +to24(bk.time).slice(0, 2) + 3)).padStart(2, '0');
    const end = `${bk.date.replace(/-/g, '')}T${endH}${to24(bk.time).slice(3)}00`;
    download(`${bk.id}.ics`, ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Culina Studio//EN', 'BEGIN:VEVENT', `UID:${bk.id}@culinastudio.com`, `DTSTART;TZID=Asia/Kolkata:${start}`, `DTEND;TZID=Asia/Kolkata:${end}`, `SUMMARY:${bk.title} — Culina Studio`, `DESCRIPTION:${bk.chef} · ${bk.seats} seat(s) · Booking ${bk.id}`, 'LOCATION:12 Spice Lane\\, Banjara Hills\\, Hyderabad', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n'), 'text/calendar');
    toast('Calendar file downloaded', 'calendar');
  });

  /* =========================================================
     VIEW: BOOK A SEAT
     ========================================================= */
  const bookState = { cuisine: 'All', level: 'All', q: '' };
  renderers.book = () => {
    const cuisines = ['All', ...new Set(DB.catalogue.map((c) => c.cuisine))];
    const list = DB.catalogue.filter((c) => (bookState.cuisine === 'All' || c.cuisine === bookState.cuisine) && (bookState.level === 'All' || c.level === bookState.level) && (!bookState.q || `${c.title} ${c.chef} ${c.cuisine}`.toLowerCase().includes(bookState.q))).sort((a, b) => a.date.localeCompare(b.date));
    $('#view-book').innerHTML = `
      <div class="toolbar">
        <div class="chips" role="group" aria-label="Cuisine">${cuisines.map((c) => `<button type="button" class="chip-btn${c === bookState.cuisine ? ' is-on' : ''}" data-fc="${c}">${c}</button>`).join('')}</div>
        <div class="toolbar-right">
          <select class="select" id="fLevel" aria-label="Level">${['All', 'Beginner', 'Intermediate', 'Advanced'].map((l) => `<option${l === bookState.level ? ' selected' : ''}>${l}</option>`).join('')}</select>
          <label class="input-ico">${icon('search')}<input class="input" id="fSearch" type="search" placeholder="Search classes or chefs" value="${esc(bookState.q)}" aria-label="Search classes" /></label>
        </div>
      </div>
      <p class="muted result-note">${list.length} class${list.length === 1 ? '' : 'es'} available</p>
      ${list.length ? `<div class="cls-grid">${list.map(classCard).join('')}</div>` : `<div class="card">${empty('search', 'No classes match', 'Try another cuisine or level.')}</div>`}`;
    $('#fLevel').addEventListener('change', (e) => { bookState.level = e.target.value; renderers.book(); });
    const s = $('#fSearch');
    s.addEventListener('input', () => { bookState.q = s.value.trim().toLowerCase(); clearTimeout(s._t); s._t = setTimeout(() => { renderers.book(); const n = $('#fSearch'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }, 250); });
  };
  const classCard = (c) => {
    const booked = DB.bookings.some((b) => b.title === c.title && b.status === 'upcoming');
    const saved = DB.saved.classes.includes(c.id);
    const pct = Math.round((1 - c.seats / 12) * 100);
    return `<article class="cls card">
      <div class="cls-top"><span class="date-chip"><b>${fmtDate(c.date, { day: '2-digit' })}</b>${fmtDate(c.date, { month: 'short' })}</span>
        <button class="save-btn${saved ? ' on' : ''}" type="button" data-save-class="${c.id}" aria-pressed="${saved}" aria-label="${saved ? 'Remove from' : 'Add to'} saved classes">${icon('heart')}</button></div>
      <div class="cls-tags"><span class="badge soft">${esc(c.cuisine)}</span><span class="badge">${esc(c.level)}</span></div>
      <h3>${esc(c.title)}</h3>
      <p class="muted sm">${icon('chef')} ${esc(c.chef)} · ${icon('clock')} ${fmtDate(c.date, { weekday: 'short' })}, ${esc(c.time)}</p>
      <div class="seat-meter" title="${c.seats} of 12 seats left"><i style="--w:${pct}%"></i></div>
      <div class="cls-foot"><span><b class="price">${money(c.price)}</b><small class="muted"> / seat · ${c.seats} left</small></span>
        ${booked ? `<span class="badge solid">${icon('check')}Booked</span>` : c.seats ? `<button class="btn btn-primary btn-xs" type="button" data-book="${c.id}">Book Seat</button>` : '<span class="badge dashed">Full</span>'}</div>
    </article>`;
  };
  $('#view-book').addEventListener('click', (e) => {
    const f = e.target.closest('[data-fc]'); if (f) { bookState.cuisine = f.dataset.fc; renderers.book(); }
  });
  // booking flow (from overview, book view and saved view)
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-book]'); if (!b) return;
    const c = DB.catalogue.find((x) => x.id === b.dataset.book); if (!c) return;
    let seats = 1;
    openModal(`<h2 id="modalTitle" class="modal-title">Book: ${esc(c.title)}</h2>
      <p class="modal-text">${fmtDate(c.date, { weekday: 'long', day: 'numeric', month: 'long' })} · ${esc(c.time)} · ${esc(c.chef)}</p>
      <div class="form">
        <div class="f-row"><span class="f-label">Seats</span><div class="stepper"><button type="button" id="sMinus" aria-label="Fewer seats">−</button><output id="sCount">1</output><button type="button" id="sPlus" aria-label="More seats">+</button></div><small class="muted">${c.seats} left</small></div>
        <label class="f-field"><span class="f-label">Payment</span><select class="select" id="payM"><option value="credit">Studio credit (${money(DB.profile.credits)})</option><option value="UPI">UPI</option><option value="Card •• 4417">Card ending 4417</option></select></label>
        <label class="f-field"><span class="f-label">Notes for the chef (optional)</span><input class="input" id="bNote" maxlength="120" placeholder="Allergies, dietary needs…" value="${DB.profile.diet && DB.profile.diet !== 'None' ? esc(DB.profile.diet) : ''}" /></label>
        <div class="sum-row"><span>Total</span><b id="bTotal">${money(c.price)}</b></div>
        <p class="f-err" id="bErr" role="alert"></p>
      </div>
      <div class="modal-actions"><button class="btn btn-secondary" type="button" data-close>Cancel</button><button class="btn btn-primary" type="button" id="bConfirm">Confirm Booking</button></div>`);
    const upd = () => { $('#sCount').textContent = seats; $('#bTotal').textContent = money(seats * c.price); $('#sMinus').disabled = seats <= 1; $('#sPlus').disabled = seats >= Math.min(4, c.seats); };
    upd();
    $('#sMinus').addEventListener('click', () => { seats--; upd(); });
    $('#sPlus').addEventListener('click', () => { seats++; upd(); });
    $('#bConfirm').addEventListener('click', () => {
      const method = $('#payM').value, total = seats * c.price;
      if (method === 'credit' && DB.profile.credits < total) { $('#bErr').textContent = `Not enough credit — you have ${money(DB.profile.credits)}. Choose UPI or card.`; return; }
      if (method === 'credit') DB.profile.credits -= total;
      const id = uid('BK-');
      DB.bookings.push({ id, title: c.title, cuisine: c.cuisine, type: 'Class', chef: c.chef, date: c.date, time: c.time, seats, price: c.price, status: 'upcoming' });
      DB.orders.unshift({ id: uid('INV-'), date: todayISO(), item: `${c.title} (${seats} seat${seats > 1 ? 's' : ''})`, amount: total, method: method === 'credit' ? 'Studio credit' : method, status: 'Paid' });
      c.seats -= seats;
      save(); closeModal(); refreshChrome();
      notify(`Booking confirmed: ${c.title} on ${fmtDate(c.date, { day: 'numeric', month: 'short' })}.`, 'bookings');
      toast(`Seat booked! ${c.title}`, 'check');
      renderers[current]();
    });
  });
  // save / unsave class
  document.addEventListener('click', (e) => {
    const s = e.target.closest('[data-save-class]'); if (!s) return;
    const id = s.dataset.saveClass, i = DB.saved.classes.indexOf(id);
    if (i > -1) DB.saved.classes.splice(i, 1); else DB.saved.classes.push(id);
    save(); refreshChrome(); renderers[current]();
    toast(i > -1 ? 'Removed from saved classes' : 'Saved for later', 'heart');
  });

  /* =========================================================
     VIEW: ORDER HISTORY
     ========================================================= */
  const orderState = { q: '', status: 'All' };
  renderers.orders = () => {
    const list = DB.orders.filter((o) => (orderState.status === 'All' || o.status === orderState.status) && (!orderState.q || `${o.id} ${o.item} ${o.method}`.toLowerCase().includes(orderState.q)));
    const paid = DB.orders.filter((o) => o.status === 'Paid').reduce((s, o) => s + o.amount, 0);
    const refunded = DB.orders.filter((o) => o.status === 'Refunded').reduce((s, o) => s + o.amount, 0);
    $('#view-orders').innerHTML = `
      <div class="tiles tiles-3">
        ${tile('receipt', DB.orders.length, 'Orders', 'All time')}
        ${tile('wallet', money(paid), 'Total paid', 'Classes, workshops & library')}
        ${tile('x', money(refunded), 'Refunded', 'Returned to card or credit')}
      </div>
      <div class="card">
        <div class="toolbar">
          <div class="tabs" role="tablist" aria-label="Order status">${['All', 'Paid', 'Refunded'].map((s) => `<button class="tab${s === orderState.status ? ' is-on' : ''}" data-ostatus="${s}" role="tab" aria-selected="${s === orderState.status}">${s}</button>`).join('')}</div>
          <div class="toolbar-right">
            <label class="input-ico">${icon('search')}<input class="input" id="oSearch" type="search" placeholder="Search orders" value="${esc(orderState.q)}" aria-label="Search orders" /></label>
            <button class="btn btn-secondary btn-sm" type="button" id="oExport">${icon('dl')} Export CSV</button>
          </div>
        </div>
        ${list.length ? `<div class="table-wrap"><table class="tbl">
          <thead><tr><th scope="col">Invoice</th><th scope="col">Date</th><th scope="col">Item</th><th scope="col">Method</th><th scope="col">Status</th><th scope="col" class="num">Amount</th><th scope="col"><span class="sr">Actions</span></th></tr></thead>
          <tbody>${list.map((o) => `<tr><td><b>${esc(o.id)}</b></td><td>${fmtDate(o.date)}</td><td>${esc(o.item)}</td><td>${esc(o.method)}</td><td>${statusBadge(o.status)}</td><td class="num">${o.status === 'Refunded' ? '−' : ''}${money(o.amount)}</td><td><button class="icon-act" type="button" data-invoice="${o.id}" aria-label="View invoice ${esc(o.id)}" title="View invoice">${icon('eye')}</button></td></tr>`).join('')}</tbody>
        </table></div>` : empty('receipt', 'No orders found', 'Try another search or filter.')}
      </div>`;
    const s = $('#oSearch');
    s.addEventListener('input', () => { orderState.q = s.value.trim().toLowerCase(); clearTimeout(s._t); s._t = setTimeout(() => { renderers.orders(); const n = $('#oSearch'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }, 250); });
    $('#oExport').addEventListener('click', () => { download('culina-orders.csv', csv([['Invoice', 'Date', 'Item', 'Method', 'Status', 'Amount (INR)'], ...list.map((o) => [o.id, o.date, o.item, o.method, o.status, o.amount])]), 'text/csv'); toast('Orders exported', 'dl'); });
  };
  $('#view-orders').addEventListener('click', (e) => {
    const t = e.target.closest('[data-ostatus]'); if (t) { orderState.status = t.dataset.ostatus; renderers.orders(); return; }
    const inv = e.target.closest('[data-invoice]'); if (!inv) return;
    const o = DB.orders.find((x) => x.id === inv.dataset.invoice);
    const tax = Math.round(o.amount - o.amount / 1.18);
    openModal(`<div class="invoice" id="invoice">
      <div class="inv-head"><div class="brand"><span class="brand-mark" aria-hidden="true"></span><span class="brand-text"><span class="brand-name">Culina Studio</span><span class="brand-tagline">Explore • Cook • Master</span></span></div><div class="inv-id"><h2 id="modalTitle">Invoice</h2><b>${esc(o.id)}</b><small>${fmtDate(o.date)}</small></div></div>
      <div class="inv-parties"><div><small>Billed to</small><strong>${esc(DB.profile.name)}</strong><span>${esc(DB.profile.email)}</span></div><div><small>From</small><strong>Culina Studio</strong><span>12 Spice Lane, Banjara Hills, Hyderabad</span></div></div>
      <table class="tbl inv-tbl"><thead><tr><th>Description</th><th class="num">Amount</th></tr></thead><tbody>
        <tr><td>${esc(o.item)}</td><td class="num">${money(o.amount - tax)}</td></tr>
        <tr><td>GST (18%, included)</td><td class="num">${money(tax)}</td></tr></tbody>
        <tfoot><tr><th>${o.status === 'Refunded' ? 'Refunded' : 'Total paid'} · ${esc(o.method)}</th><th class="num">${money(o.amount)}</th></tr></tfoot></table>
      <p class="muted sm">Thank you for cooking with us. Questions? hello@culinastudio.com</p></div>
      <div class="modal-actions no-print"><button class="btn btn-secondary" type="button" data-close>Close</button><button class="btn btn-primary" type="button" id="printInv">${icon('print')} Print / Save PDF</button></div>`, { wide: true });
    $('#printInv').addEventListener('click', () => { document.body.classList.add('printing'); window.print(); setTimeout(() => document.body.classList.remove('printing'), 500); });
  });

  /* =========================================================
     VIEW: SAVED ITEMS
     ========================================================= */
  let savedTab = 'recipes';
  renderers.saved = () => {
    const savedClasses = DB.saved.classes.map((id) => DB.catalogue.find((c) => c.id === id)).filter(Boolean);
    $('#view-saved').innerHTML = `
      <div class="toolbar"><div class="tabs" role="tablist" aria-label="Saved item type">
        <button class="tab${savedTab === 'recipes' ? ' is-on' : ''}" data-stab="recipes" role="tab" aria-selected="${savedTab === 'recipes'}">Recipes <sup>${DB.saved.recipes.length}</sup></button>
        <button class="tab${savedTab === 'classes' ? ' is-on' : ''}" data-stab="classes" role="tab" aria-selected="${savedTab === 'classes'}">Classes <sup>${savedClasses.length}</sup></button>
      </div></div>
      ${savedTab === 'recipes'
        ? (DB.saved.recipes.length ? `<div class="rec-grid">${DB.saved.recipes.map((r) => `
          <article class="recipe card"><span class="ico-round">${icon('book')}</span><span class="badge soft">${esc(r.cuisine)}</span>
            <h3>${esc(r.title)}</h3><p class="muted sm">${icon('clock')} ${esc(r.time)} · ${esc(r.level)} · ${r.ingredients.length} ingredients</p>
            <div class="recipe-actions"><button class="btn btn-primary btn-xs" type="button" data-recipe="${r.id}">Open Recipe</button><button class="icon-act" type="button" data-unsave-recipe="${r.id}" aria-label="Remove ${esc(r.title)} from saved" title="Remove">${icon('trash')}</button></div></article>`).join('')}</div>`
          : `<div class="card">${empty('book', 'No saved recipes', 'Save recipes from classes and the library to find them here.')}</div>`)
        : (savedClasses.length ? `<div class="cls-grid">${savedClasses.map(classCard).join('')}</div>` : `<div class="card">${empty('heart', 'No saved classes', 'Tap the heart on any class to save it for later.', '#book', 'Browse Classes')}</div>`)}`;
  };
  $('#view-saved').addEventListener('click', (e) => {
    const t = e.target.closest('[data-stab]'); if (t) { savedTab = t.dataset.stab; renderers.saved(); return; }
    const u = e.target.closest('[data-unsave-recipe]');
    if (u) {
      const i = DB.saved.recipes.findIndex((r) => r.id === u.dataset.unsaveRecipe);
      const [removed] = DB.saved.recipes.splice(i, 1); save(); refreshChrome(); renderers.saved();
      const t2 = document.createElement('div'); t2.className = 'toast';
      t2.innerHTML = `${icon('trash')}<span>Removed "${esc(removed.title)}"</span><button type="button" class="toast-undo">Undo</button>`;
      $('#toasts').appendChild(t2);
      $('.toast-undo', t2).addEventListener('click', () => { DB.saved.recipes.splice(i, 0, removed); save(); refreshChrome(); renderers.saved(); t2.remove(); });
      setTimeout(() => t2.remove(), 5000);
      return;
    }
    const o = e.target.closest('[data-recipe]'); if (!o) return;
    const r = DB.saved.recipes.find((x) => x.id === o.dataset.recipe);
    openModal(`<span class="badge soft">${esc(r.cuisine)} · ${esc(r.level)}</span><h2 id="modalTitle" class="modal-title">${esc(r.title)}</h2><p class="muted sm">${icon('clock')} ${esc(r.time)}</p>
      <h3 class="sub-h">Ingredients <small class="muted">tick as you go</small></h3><ul class="checklist">${r.ingredients.map((x, i) => `<li><label><input type="checkbox" /> <span>${esc(x)}</span></label></li>`).join('')}</ul>
      <h3 class="sub-h">Method</h3><ol class="steps-list">${r.steps.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>
      <div class="modal-actions"><button class="btn btn-secondary" type="button" data-close>Close</button><button class="btn btn-primary" type="button" id="shopList">${icon('dl')} Shopping List</button></div>`, { wide: true });
    $('#shopList').addEventListener('click', () => { download(`${r.title.toLowerCase().replace(/\W+/g, '-')}-shopping-list.txt`, `${r.title} — shopping list\n\n` + r.ingredients.map((x) => `[ ] ${x}`).join('\n')); toast('Shopping list downloaded', 'dl'); });
  });

  /* =========================================================
     VIEW: MESSAGES
     ========================================================= */
  let activeThread = DB.threads[0] ? DB.threads[0].id : null;
  renderers.messages = () => {
    const th = DB.threads.find((t) => t.id === activeThread);
    if (th && th.unread) { th.unread = false; save(); refreshChrome(); }
    $('#view-messages').innerHTML = `
      <div class="inbox card">
        <aside class="inbox-list">
          <div class="inbox-head"><strong>Conversations</strong><button class="btn btn-primary btn-xs" type="button" id="newMsg">${icon('plus')} New</button></div>
          <ul>${DB.threads.map((t) => `<li><button type="button" class="thread${t.id === activeThread ? ' is-on' : ''}${t.unread ? ' unread' : ''}" data-thread="${t.id}">
            <span class="avatar avatar-sm">${initials(t.from)}</span><span class="thread-main"><strong>${esc(t.from)}<small>${relTime(t.messages[t.messages.length - 1].time)}</small></strong><span class="thread-sub">${esc(t.subject)}</span></span></button></li>`).join('')}</ul>
        </aside>
        <div class="convo">
          ${th ? `<div class="convo-head"><button class="icon-act convo-back" type="button" data-back aria-label="Back to conversations">←</button><span class="avatar">${initials(th.from)}</span><div><strong>${esc(th.from)}</strong><small class="muted">${esc(th.role)} · ${esc(th.subject)}</small></div></div>
            <div class="convo-body" id="convoBody">${th.messages.map((m) => `<div class="bubble${m.me ? ' me' : ''}"><p>${esc(m.text)}</p><small>${relTime(m.time)}</small></div>`).join('')}</div>
            <form class="reply" id="replyForm"><label class="sr" for="replyInput">Reply</label><textarea id="replyInput" class="input" rows="2" placeholder="Write a reply…" maxlength="600"></textarea><button class="btn btn-primary" type="submit" aria-label="Send">${icon('send')}</button></form>`
          : empty('chat', 'No conversation selected', 'Pick a conversation or start a new one.')}
        </div>
      </div>`;
    const body = $('#convoBody'); if (body) body.scrollTop = body.scrollHeight;
    const form = $('#replyForm');
    if (form) {
      const ta = $('#replyInput');
      ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); } });
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = ta.value.trim(); if (!text) { ta.focus(); return; }
        th.messages.push({ me: true, text, time: new Date().toISOString() }); save(); renderers.messages();
        // simulated reply from the studio
        const typing = document.createElement('div'); typing.className = 'bubble typing'; typing.innerHTML = '<span></span><span></span><span></span>';
        $('#convoBody').appendChild(typing); $('#convoBody').scrollTop = 9e9;
        setTimeout(() => {
          th.messages.push({ me: false, text: `Thanks ${DB.profile.name.split(' ')[0]}! We've received your message and ${th.from === 'Studio Team' || th.from === 'Billing' ? 'a team member' : th.from} will get back to you shortly.`, time: new Date().toISOString() });
          save(); if (current === 'messages') renderers.messages();
        }, reduceMotion ? 300 : 1600);
      });
    }
    $('#newMsg').addEventListener('click', composeMessage);
  };
  $('#view-messages').addEventListener('click', (e) => {
    const t = e.target.closest('[data-thread]'); if (t) { activeThread = t.dataset.thread; renderers.messages(); $('.inbox').classList.add('show-convo'); return; }
    if (e.target.closest('[data-back]')) $('.inbox').classList.remove('show-convo');
  });
  document.addEventListener('click', (e) => { const a = e.target.closest('[data-open-thread]'); if (a) { activeThread = a.dataset.openThread; } });
  function composeMessage() {
    openModal(`<h2 id="modalTitle" class="modal-title">New message</h2>
      <form class="form" id="composeForm" novalidate>
        <label class="f-field"><span class="f-label">To</span><select class="select" id="cTo"><option>Studio Team</option><option>Billing</option><option>Chef Giulia</option><option>Chef Arjun</option><option>Chef Kenji</option><option>Chef Camille</option></select></label>
        <label class="f-field"><span class="f-label">Subject</span><input class="input" id="cSub" maxlength="80" required /></label>
        <label class="f-field"><span class="f-label">Message</span><textarea class="input" id="cBody" rows="4" maxlength="600" required></textarea></label>
        <p class="f-err" id="cErr" role="alert"></p>
        <div class="modal-actions"><button class="btn btn-secondary" type="button" data-close>Cancel</button><button class="btn btn-primary" type="submit">${icon('send')} Send</button></div>
      </form>`);
    $('#composeForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const sub = $('#cSub').value.trim(), body = $('#cBody').value.trim();
      if (!sub || !body) { $('#cErr').textContent = 'Please add a subject and a message.'; return; }
      const id = uid('TH-');
      DB.threads.unshift({ id, from: $('#cTo').value, role: $('#cTo').value.startsWith('Chef') ? 'Instructor' : 'Support', subject: sub, unread: false, messages: [{ me: true, text: body, time: new Date().toISOString() }] });
      activeThread = id; save(); closeModal(); go('messages'); toast('Message sent', 'send');
    });
  }

  /* =========================================================
     VIEW: PROFILE
     ========================================================= */
  renderers.profile = () => {
    const p = DB.profile;
    $('#view-profile').innerHTML = `
      <div class="grid-profile">
        <div class="card profile-card">
          <span class="avatar xl" id="pAvatar">${initials(p.name)}</span>
          <h2>${esc(p.name)}</h2><p class="muted">${esc(p.city)} · Member since ${fmtDate(p.joined, { month: 'long', year: 'numeric' })}</p>
          <div class="profile-stats"><div><b>${DB.bookings.filter((b) => b.status === 'completed').length}</b><small>Completed</small></div><div><b>${DB.saved.recipes.length}</b><small>Recipes</small></div><div><b>${esc(p.level)}</b><small>Level</small></div></div>
          <p class="profile-bio">${esc(p.bio)}</p>
        </div>
        <div class="card">
          <div class="card-head"><h2>Personal details</h2></div>
          <form class="form f-grid" id="profileForm" novalidate>
            <label class="f-field"><span class="f-label">Full name</span><input class="input" id="pName" value="${esc(p.name)}" required maxlength="40" autocomplete="name" /><small class="f-err"></small></label>
            <label class="f-field"><span class="f-label">Email</span><input class="input" id="pEmail" type="email" value="${esc(p.email)}" required autocomplete="email" /><small class="f-err"></small></label>
            <label class="f-field"><span class="f-label">Phone</span><input class="input" id="pPhone" type="tel" value="${esc(p.phone)}" autocomplete="tel" /><small class="f-err"></small></label>
            <label class="f-field"><span class="f-label">City</span><input class="input" id="pCity" value="${esc(p.city)}" maxlength="40" /><small class="f-err"></small></label>
            <label class="f-field"><span class="f-label">Cooking level</span><select class="select" id="pLevel">${['Beginner', 'Intermediate', 'Advanced'].map((l) => `<option${l === p.level ? ' selected' : ''}>${l}</option>`).join('')}</select></label>
            <label class="f-field"><span class="f-label">Dietary preference</span><select class="select" id="pDiet">${['None', 'Vegetarian', 'Vegan', 'Eggetarian', 'Jain', 'Gluten-free'].map((l) => `<option${l === p.diet ? ' selected' : ''}>${l}</option>`).join('')}</select></label>
            <label class="f-field span-2"><span class="f-label">About me <small class="muted" id="bioCount"></small></span><textarea class="input" id="pBio" rows="3" maxlength="200">${esc(p.bio)}</textarea></label>
            <div class="span-2 f-actions"><button class="btn btn-secondary" type="reset">Reset</button><button class="btn btn-primary" type="submit">Save Changes</button></div>
          </form>
        </div>
        <div class="card span-2-lg">
          <div class="card-head"><h2>Change password</h2></div>
          <form class="form f-grid three" id="pwForm" novalidate>
            <label class="f-field"><span class="f-label">Current password</span><input class="input" id="pwOld" type="password" autocomplete="current-password" required /><small class="f-err"></small></label>
            <label class="f-field"><span class="f-label">New password</span><input class="input" id="pwNew" type="password" autocomplete="new-password" required /><span class="pw-meter" aria-hidden="true"><i id="pwBar"></i></span><small class="muted" id="pwHint">At least 8 characters, with a number and a capital letter.</small></label>
            <label class="f-field"><span class="f-label">Confirm new password</span><input class="input" id="pwConf" type="password" autocomplete="new-password" required /><small class="f-err"></small></label>
            <div class="span-3 f-actions"><button class="btn btn-primary" type="submit">Update Password</button></div>
          </form>
        </div>
      </div>`;
    const bio = $('#pBio'), bc = $('#bioCount');
    const cnt = () => { bc.textContent = `${bio.value.length}/200`; }; cnt(); bio.addEventListener('input', cnt);
    $('#pName').addEventListener('input', (e) => { $('#pAvatar').textContent = initials(e.target.value); });
    const setErr = (el, msg) => { const f = el.closest('.f-field'); f.classList.toggle('bad', !!msg); $('.f-err', f).textContent = msg || ''; return !msg; };
    $('#profileForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const n = $('#pName'), em = $('#pEmail'), ph = $('#pPhone');
      const ok = [
        setErr(n, n.value.trim().length < 2 ? 'Please enter your name.' : ''),
        setErr(em, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value.trim()) ? '' : 'Please enter a valid email.'),
        setErr(ph, !ph.value.trim() || /^[+\d][\d\s-]{7,15}$/.test(ph.value.trim()) ? '' : 'Please enter a valid phone number.')
      ].every(Boolean);
      if (!ok) return;
      Object.assign(DB.profile, { name: n.value.trim(), email: em.value.trim(), phone: ph.value.trim(), city: $('#pCity').value.trim(), level: $('#pLevel').value, diet: $('#pDiet').value, bio: bio.value.trim() });
      save(); refreshChrome(); renderers.profile(); toast('Profile saved');
    });
    $('#profileForm').addEventListener('reset', () => setTimeout(() => { renderers.profile(); }, 0));
    const pwNew = $('#pwNew'), bar = $('#pwBar');
    const score = (v) => [v.length >= 8, /\d/.test(v), /[A-Z]/.test(v), /[^A-Za-z0-9]/.test(v), v.length >= 12].filter(Boolean).length;
    pwNew.addEventListener('input', () => { const s = score(pwNew.value); bar.style.width = (s * 20) + '%'; $('#pwHint').textContent = ['Too short', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'][s] + ' — at least 8 characters, a number and a capital letter.'; });
    $('#pwForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const o = $('#pwOld'), c = $('#pwConf'), v = pwNew.value;
      const ok = [
        setErr(o, o.value ? '' : 'Enter your current password.'),
        setErr(c, !(v.length >= 8 && /\d/.test(v) && /[A-Z]/.test(v)) ? 'New password is too weak.' : v !== c.value ? 'Passwords do not match.' : '')
      ].every(Boolean);
      if (!ok) return;
      e.target.reset(); bar.style.width = '0'; toast('Password updated', 'shield');
    });
  };

  /* =========================================================
     VIEW: SETTINGS
     ========================================================= */
  renderers.settings = () => {
    const s = DB.settings;
    const sw = (key, label, hint) => `<div class="set-row"><div><strong>${esc(label)}</strong><small class="muted">${esc(hint)}</small></div><label class="switch"><input type="checkbox" data-set="${key}"${s[key] ? ' checked' : ''} /><span class="track" aria-hidden="true"></span><span class="sr">${esc(label)}</span></label></div>`;
    $('#view-settings').innerHTML = `
      <div class="grid-2">
        <div class="card"><div class="card-head"><h2>Notifications</h2></div>
          ${sw('email', 'Email notifications', 'Booking confirmations, receipts and chef notes')}
          ${sw('sms', 'SMS alerts', 'Short text reminders on the day of class')}
          ${sw('reminders', 'Class reminders', 'A reminder before every session')}
          <div class="set-row"><div><strong>Remind me</strong><small class="muted">How early to send reminders</small></div><select class="select" id="remTime"${s.reminders ? '' : ' disabled'}>${[['2h', '2 hours before'], ['24h', '1 day before'], ['48h', '2 days before']].map(([v, l]) => `<option value="${v}"${v === s.reminderTime ? ' selected' : ''}>${l}</option>`).join('')}</select></div>
          ${sw('newsletter', 'Monthly newsletter', 'New classes, recipes and member offers')}
        </div>
        <div class="card"><div class="card-head"><h2>Preferences</h2></div>
          <div class="set-row"><div><strong>Appearance</strong><small class="muted">Matches the website theme</small></div><div class="tabs sm" role="group" aria-label="Theme"><button class="tab${root.getAttribute('data-theme') === 'light' ? ' is-on' : ''}" data-theme-set="light" type="button">Light</button><button class="tab${root.getAttribute('data-theme') === 'dark' ? ' is-on' : ''}" data-theme-set="dark" type="button">Dark</button></div></div>
          <div class="set-row"><div><strong>Text direction</strong><small class="muted">For right-to-left languages</small></div><div class="tabs sm" role="group" aria-label="Direction"><button class="tab${root.getAttribute('dir') !== 'rtl' ? ' is-on' : ''}" data-dir-set="ltr" type="button">LTR</button><button class="tab${root.getAttribute('dir') === 'rtl' ? ' is-on' : ''}" data-dir-set="rtl" type="button">RTL</button></div></div>
          <div class="set-row"><div><strong>Language</strong><small class="muted">Emails and dashboard text</small></div><select class="select" id="langSel">${['English', 'हिन्दी', 'తెలుగు', 'اردو'].map((l) => `<option${l === s.language ? ' selected' : ''}>${l}</option>`).join('')}</select></div>
          ${sw('publicProfile', 'Show me in the student showcase', 'Lets us feature your plates in the gallery')}
        </div>
        <div class="card span-2-lg"><div class="card-head"><h2>Your data</h2></div>
          <div class="set-row"><div><strong>Download my data</strong><small class="muted">Profile, bookings, orders and messages as JSON</small></div><button class="btn btn-secondary btn-sm" type="button" id="exportData">${icon('dl')} Download</button></div>
          <div class="set-row"><div><strong>Reset demo data</strong><small class="muted">Restore the original sample bookings and messages</small></div><button class="btn btn-secondary btn-sm" type="button" id="resetData">Reset</button></div>
          <div class="set-row danger"><div><strong>Delete account</strong><small class="muted">Permanently remove your account and history</small></div><button class="btn btn-primary btn-sm" type="button" id="delAcc">Delete Account</button></div>
        </div>
      </div>`;
  };
  $('#view-settings').addEventListener('change', (e) => {
    const t = e.target;
    if (t.dataset.set) { DB.settings[t.dataset.set] = t.checked; save(); toast(`${t.closest('.set-row').querySelector('strong').textContent} ${t.checked ? 'on' : 'off'}`); if (t.dataset.set === 'reminders') $('#remTime').disabled = !t.checked; }
    if (t.id === 'remTime') { DB.settings.reminderTime = t.value; save(); toast('Reminder time updated'); }
    if (t.id === 'langSel') { DB.settings.language = t.value; save(); toast(`Language set to ${t.value}`); }
  });
  $('#view-settings').addEventListener('click', (e) => {
    const th = e.target.closest('[data-theme-set]'); if (th) { applyTheme(th.dataset.themeSet); store.set('culina-theme', th.dataset.themeSet); renderers.settings(); return; }
    const dr = e.target.closest('[data-dir-set]'); if (dr) { applyDir(dr.dataset.dirSet); store.set('culina-dir', dr.dataset.dirSet); renderers.settings(); return; }
    if (e.target.closest('#exportData')) { download('culina-my-data.json', JSON.stringify(DB, null, 2), 'application/json'); toast('Your data was downloaded', 'dl'); }
    if (e.target.closest('#resetData')) confirmBox('Reset demo data?', 'All your changes in this browser will be replaced with the original sample data.', 'Reset', () => { DB = seed(); save(); refreshChrome(); go('overview'); toast('Demo data restored'); });
    if (e.target.closest('#delAcc')) confirmBox('Delete your account?', 'This is a demo — your local data will be cleared and you will be signed out.', 'Delete', () => { store.del(KEY); store.set('culina-session', 'signed-out'); location.href = 'login.html?role=student&out=1'; });
  });

  /* =========================================================
     LOGOUT + GLOBAL SEARCH
     ========================================================= */
  const logout = () => confirmBox('Log out?', 'You can log back in any time from the Dashboard link in the menu.', 'Logout', () => {
    store.set('culina-session', 'signed-out');
    document.body.classList.add('leaving');
    setTimeout(() => { location.href = 'login.html?role=student&out=1'; }, reduceMotion ? 0 : 450);
  });
  $('#logoutBtn').addEventListener('click', logout);
  document.addEventListener('click', (e) => { if (e.target.closest('[data-logout]')) { closePops(); logout(); } });

  $('#globalSearch').addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const q = e.target.value.trim().toLowerCase(); if (!q) return;
    if (DB.orders.some((o) => `${o.id} ${o.item}`.toLowerCase().includes(q)) && /inv|order|₹|\d{3}/.test(q)) { orderState.q = q; go('orders'); }
    else if (DB.saved.recipes.some((r) => r.title.toLowerCase().includes(q))) { savedTab = 'recipes'; go('saved'); toast(`Showing saved recipes matching "${q}"`, 'search'); }
    else { bookState.q = q; bookState.cuisine = 'All'; go('book'); }
    e.target.value = '';
  });

  /* ---------- Start ---------- */
  refreshChrome();
  go((location.hash || '#overview').slice(1), false);
})();