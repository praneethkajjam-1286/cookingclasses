/* =========================================================
   CULINA STUDIO — Admin dashboard (standalone)
   Overview, users, content, bookings, messages, reports and
   settings. Everything is saved in this browser (localStorage)
   so the demo works without a server.
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
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
    'user-plus': '<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M19 8v6M16 11h6"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    table: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M9 4v16"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
    up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
    down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
    'chev-l': '<path d="M15 6l-6 6 6 6"/>',
    'chev-r': '<path d="M9 6l6 6-6 6"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    megaphone: '<path d="M3 11v2a1 1 0 0 0 1 1h3l6 4V6L7 10H4a1 1 0 0 0-1 1z"/><path d="M17 8a5 5 0 0 1 0 8"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-2.6-6.4"/><path d="M21 3v6h-6"/>',
    alert: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>',
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
  const KEY = 'culina-admin-v1';
  const MONTHS = ['2025-12', '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11'];
  const CUISINES = ['Indian', 'Italian', 'Baking', 'Japanese', 'Thai', 'Mexican'];
  const seed = () => {
    const students = ['Priya Sharma', 'Rahul Verma', 'Aisha Khan', 'Vikram Reddy', 'Sneha Iyer', 'Karan Malhotra', 'Neha Gupta', 'Rohan Das', 'Fatima Sheikh', 'Aditya Joshi', 'Kavya Menon', 'Imran Qureshi', 'Divya Nair', 'Siddharth Rao', 'Pooja Patel', 'Manish Kumar'];
    const chefs = ['Giulia Rossi', 'Arjun Nair', 'Kenji Sato', 'Camille Laurent', 'Sofia Morales', 'Meera Pillai', 'Daniel Brooks'];
    const users = [];
    const mail = (n) => n.toLowerCase().replace(/\s+/g, '.') + '@example.com';
    students.forEach((n, i) => users.push({
      id: 'U-' + (1001 + i), name: n, email: mail(n), phone: '+91 9' + String(8480012345 + i * 7331).slice(0, 9),
      role: 'Student', status: i === 5 ? 'Suspended' : (i === 13 || i === 15) ? 'Pending' : 'Active',
      joined: `2025-${String(3 + (i % 9)).padStart(2, '0')}-${String(4 + i).padStart(2, '0')}`,
      bookings: (i * 7) % 11 + 1, spent: ((i * 7) % 11 + 1) * 3899
    }));
    chefs.forEach((n, i) => users.push({
      id: 'U-' + (2001 + i), name: n, email: mail(n), phone: '+91 9' + String(9000012345 + i * 5113).slice(0, 9),
      role: 'Chef', status: 'Active', joined: `2024-${String(2 + i).padStart(2, '0')}-${String(10 + i).padStart(2, '0')}`, bookings: 0, spent: 0
    }));
    users.push({ id: 'U-0001', name: 'Ananya Rao', email: 'ananya.rao@example.com', phone: '+91 98480 55500', role: 'Admin', status: 'Active', joined: '2024-01-08', bookings: 0, spent: 0 });

    const classes = [
      { id: 'CL-301', title: 'Fresh Ravioli & Brown Butter', cuisine: 'Italian', level: 'Beginner', chef: 'Chef Giulia', price: 3499, seats: 12, booked: 8, sessions: 14, published: true },
      { id: 'CL-302', title: 'Hyderabadi Dum & Mirchi Salan', cuisine: 'Indian', level: 'Intermediate', chef: 'Chef Arjun', price: 3999, seats: 12, booked: 6, sessions: 18, published: true },
      { id: 'CL-303', title: 'Ramen From Scratch', cuisine: 'Japanese', level: 'Advanced', chef: 'Chef Kenji', price: 4999, seats: 10, booked: 8, sessions: 9, published: true },
      { id: 'CL-304', title: 'Thai Market Favourites', cuisine: 'Thai', level: 'Beginner', chef: 'Chef Kenji', price: 2999, seats: 12, booked: 4, sessions: 10, published: true },
      { id: 'CL-305', title: 'Street Tacos & Fresh Salsas', cuisine: 'Mexican', level: 'Intermediate', chef: 'Chef Sofia', price: 3299, seats: 12, booked: 7, sessions: 11, published: true },
      { id: 'CL-306', title: 'Sunday Biryani with Meera', cuisine: 'Indian', level: 'Intermediate', chef: 'Chef Meera', price: 3999, seats: 12, booked: 7, sessions: 16, published: true },
      { id: 'CL-307', title: 'Sourdough Starter Clinic', cuisine: 'Baking', level: 'Beginner', chef: 'Chef Camille', price: 2799, seats: 12, booked: 3, sessions: 12, published: true },
      { id: 'CL-308', title: 'Laminated Dough Masterclass', cuisine: 'Baking', level: 'Advanced', chef: 'Chef Camille', price: 4799, seats: 8, booked: 5, sessions: 6, published: false }
    ];
    const recipes = [
      { id: 'RC-11', title: 'Cacio e Pepe', cuisine: 'Italian', time: 25, level: 'Beginner', views: 2840, published: true },
      { id: 'RC-12', title: 'Hyderabadi Mirchi Salan', cuisine: 'Indian', time: 45, level: 'Intermediate', views: 3215, published: true },
      { id: 'RC-13', title: 'Thai Green Curry Paste', cuisine: 'Thai', time: 20, level: 'Beginner', views: 1975, published: true },
      { id: 'RC-14', title: 'Brown Butter Sage Sauce', cuisine: 'Italian', time: 10, level: 'Beginner', views: 1460, published: true },
      { id: 'RC-15', title: 'Tonkotsu Broth', cuisine: 'Japanese', time: 720, level: 'Advanced', views: 1102, published: true },
      { id: 'RC-16', title: 'Salsa Verde Cruda', cuisine: 'Mexican', time: 15, level: 'Beginner', views: 890, published: false },
      { id: 'RC-17', title: 'Classic Croissant Dough', cuisine: 'Baking', time: 180, level: 'Advanced', views: 2210, published: true }
    ];
    const workshops = [
      { id: 'WS-01', title: 'Neapolitan Pizza Masterclass', cuisine: 'Italian', chef: 'Chef Giulia', date: '2026-11-21', price: 5499, seats: 16, booked: 14, published: true },
      { id: 'WS-02', title: 'Fresh Pasta Feast', cuisine: 'Italian', chef: 'Chef Giulia', date: '2026-12-05', price: 5299, seats: 16, booked: 9, published: true },
      { id: 'WS-03', title: 'Festive Indian Sweets', cuisine: 'Indian', chef: 'Chef Meera', date: '2026-12-12', price: 4599, seats: 14, booked: 5, published: true },
      { id: 'WS-04', title: 'Corporate Sushi Challenge', cuisine: 'Japanese', chef: 'Chef Kenji', date: '2026-12-19', price: 5999, seats: 20, booked: 0, published: false }
    ];

    const items = classes.map((c) => ({ title: c.title, price: c.price, type: 'Class' })).concat(workshops.slice(0, 3).map((w) => ({ title: w.title, price: w.price, type: 'Workshop' })));
    const methods = ['UPI', 'Card', 'UPI', 'Card', 'Cash'];
    const past = ['Completed', 'Completed', 'Cancelled', 'Completed', 'Refunded'];
    const next = ['Confirmed', 'Pending', 'Confirmed', 'Confirmed'];
    const bookings = [];
    const start = new Date('2026-10-22T00:00');
    for (let i = 0; i < 30; i++) {
      const it = items[(i * 3) % items.length];
      const d = new Date(start); d.setDate(d.getDate() + i * 2);
      const b = new Date(d); b.setDate(b.getDate() - (3 + (i % 8)));
      const iso = (x) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
      const seats = i % 4 === 0 ? 2 : 1;
      bookings.push({
        id: 'BK-' + (2100 + i), student: students[(i * 5) % students.length], item: it.title, type: it.type,
        date: iso(d), booked: iso(b), seats, amount: seats * it.price, method: methods[i % methods.length],
        status: iso(d) < '2026-11-18' ? past[i % past.length] : next[i % next.length]
      });
    }
    bookings.reverse();

    const base = [386400, 352900, 371200, 404800, 428300, 455600, 441900, 472300, 498700, 521400, 548900, 563200];
    const weights = [0.27, 0.24, 0.18, 0.12, 0.1, 0.09];
    const monthly = MONTHS.map((m, i) => {
      const count = Math.round(base[i] / 3860);
      const cuisine = {};
      CUISINES.forEach((c, k) => { cuisine[c] = Math.max(1, Math.round(count * weights[k] * (1 + 0.12 * Math.sin(i * 1.3 + k)))); });
      return { m, revenue: base[i], bookings: count, refunds: Math.round(count * (0.03 + 0.015 * Math.cos(i))), cuisine };
    });

    return {
      admin: { name: 'Ananya Rao', role: 'Studio Manager', email: 'ananya.rao@example.com' },
      users, content: { classes, recipes, workshops }, bookings, monthly,
      payments: { UPI: 58, Card: 34, Cash: 8 },
      threads: [
        { id: 'AT-1', from: 'Priya Sharma', email: 'priya.sharma@example.com', subject: 'Can I bring my own apron?', unread: true, starred: false, messages: [
          { me: false, text: 'Hi! For the Pizza Masterclass on Saturday — can I bring my own apron and a favourite topping?', time: '2026-11-18T09:12' }] },
        { id: 'AT-2', from: 'Rahul Verma', email: 'rahul.verma@example.com', subject: 'Corporate booking for 12 people', unread: true, starred: true, messages: [
          { me: false, text: 'We would like to book the Corporate Sushi Challenge for a team of 12 in December. Is a private slot possible?', time: '2026-11-17T16:40' }] },
        { id: 'AT-3', from: 'Aisha Khan', email: 'aisha.khan@example.com', subject: 'Refund status', unread: false, starred: false, messages: [
          { me: false, text: 'I cancelled my Thai class 3 days before. When will the refund reach my card?', time: '2026-11-14T11:05' },
          { me: true, text: 'Hi Aisha, the refund was issued today — it usually appears within 5–7 working days.', time: '2026-11-14T12:20' }] },
        { id: 'AT-4', from: 'Chef Kenji', email: 'kenji.sato@example.com', subject: 'Ramen class ingredient order', unread: true, starred: false, messages: [
          { me: false, text: 'The Ramen class is nearly full. Please order 8 kg pork bones and 40 portions of fresh noodles by Thursday.', time: '2026-11-16T19:30' }] },
        { id: 'AT-5', from: 'Neha Gupta', email: 'neha.gupta@example.com', subject: 'Gift voucher question', unread: false, starred: false, messages: [
          { me: false, text: 'Can a gift voucher be used for a workshop, or only for regular classes?', time: '2026-11-10T08:45' }] }
      ],
      notifications: [
        { id: 'N1', type: 'booking', text: 'New booking BK-2129 — 2 seats, Ramen From Scratch.', time: '2026-11-18T08:40', read: false, link: 'bookings' },
        { id: 'N2', type: 'user', text: 'Siddharth Rao signed up and is waiting for approval.', time: '2026-11-18T07:55', read: false, link: 'users' },
        { id: 'N3', type: 'payment', text: 'Payment of ₹10,998 received via UPI.', time: '2026-11-17T21:10', read: false, link: 'bookings' },
        { id: 'N4', type: 'review', text: 'New 5-star review on Royal Biryani & Curries.', time: '2026-11-17T13:25', read: true, link: 'content' },
        { id: 'N5', type: 'system', text: 'Weekly backup completed successfully.', time: '2026-11-16T02:00', read: true, link: 'settings' },
        { id: 'N6', type: 'booking', text: 'Neapolitan Pizza Masterclass is 88% full.', time: '2026-11-15T10:00', read: true, link: 'content' }
      ],
      announcements: [
        { id: 'AN-1', audience: 'All students', subject: 'December timetable is live', time: '2026-11-12T10:00' }
      ],
      settings: {
        studioName: 'Culina Studio', email: 'hello@culinastudio.com', phone: '+91 40 4455 6677', address: 'Road No. 36, Jubilee Hills, Hyderabad',
        cancelHours: 48, maxSeats: 4, waitlist: true, autoConfirm: true,
        currency: 'INR', gst: 18, upi: true, card: true, cash: false,
        maintenance: false, emailAlerts: true, twoFactor: true, weeklyReport: true
      }
    };
  };
  let DB;
  try { DB = JSON.parse(store.get(KEY)) || seed(); } catch (e) { DB = seed(); }
  const save = () => store.set(KEY, JSON.stringify(DB));
  // use the name + email of the admin who signed in on login.html
  try {
    const who = JSON.parse(store.get('culina-login-admin'));
    if (who && who.email) { DB.admin.name = who.name; DB.admin.email = who.email; }
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
      <div class="modal-actions"><button class="btn btn-secondary" type="button" data-close>Cancel</button><button class="btn btn-primary" type="button" id="okBtn">${esc(okLabel)}</button></div>`);
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
  const VIEWS = ['overview', 'users', 'content', 'bookings', 'messages', 'reports', 'settings'];
  const renderers = {};
  let current = null;
  const go = (view, push = true) => {
    if (!VIEWS.includes(view)) view = 'overview';
    if (current === 'settings' && view !== 'settings' && settingsDirty) toast('Unsaved settings were discarded', 'alert');
    settingsDirty = false;
    current = view;
    $$('.view').forEach((v) => v.classList.toggle('is-on', v.id === 'view-' + view));
    $$('.side-link[data-view]').forEach((a) => { const on = a.dataset.view === view; a.classList.toggle('is-on', on); a.toggleAttribute('aria-current', on); });
    const sec = $('#view-' + view);
    $('#viewTitle').textContent = sec.dataset.title;
    document.title = `${sec.dataset.title} — Admin · Culina Studio`;
    hideTip();
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
    if (link.hasAttribute('data-notif-tab')) msgTab = 'notifications';
    if (VIEWS.includes(v)) { e.preventDefault(); go(v); }
  });

  /* =========================================================
     HELPERS
     ========================================================= */
  const initials = (n) => n.replace(/^Chef\s+/i, '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || 'U';
  const relTime = (iso) => {
    const diff = (Date.now() - new Date(iso).getTime()) / 60000;
    if (diff < 1) return 'just now';
    if (diff < 60) return `${Math.round(diff)} min ago`;
    if (diff < 1440) return `${Math.round(diff / 60)} h ago`;
    return fmtDate(iso.slice(0, 10), { day: 'numeric', month: 'short' });
  };
  const monthLabel = (m, long) => new Date(m + '-01T00:00').toLocaleDateString('en-IN', long ? { month: 'long', year: 'numeric' } : { month: 'short' });
  const compact = (v) => v >= 1e5 ? '₹' + (v / 1e5).toFixed(v >= 1e6 ? 0 : 1) + 'L' : v >= 1e3 ? '₹' + Math.round(v / 1e3) + 'k' : '₹' + v;
  const pct = (a, b) => (b ? ((a - b) / b) * 100 : 0);
  const tile = (ico, val, label, delta, sub) => `<div class="tile card"><span class="ico-round">${icon(ico)}</span><div><b class="tile-val">${esc(val)}</b><span class="tile-label">${esc(label)}</span>${delta !== null && delta !== undefined ? deltaBadge(delta, sub) : `<small class="muted">${esc(sub)}</small>`}</div></div>`;
  const deltaBadge = (d, sub) => `<small class="delta">${icon(d >= 0 ? 'up' : 'down')}<b>${d >= 0 ? '+' : '−'}${Math.abs(d).toFixed(1)}%</b> ${esc(sub)}</small>`;
  const empty = (ico, title, text) => `<div class="empty"><span class="ico-round lg">${icon(ico)}</span><strong>${esc(title)}</strong><p>${esc(text)}</p></div>`;
  const STATUS_ICO = { Active: 'check', Confirmed: 'check', Completed: 'star', Pending: 'clock', Suspended: 'x', Cancelled: 'x', Refunded: 'refresh', Published: 'eye', Draft: 'edit' };
  const statusBadge = (s) => {
    const solid = ['Active', 'Confirmed', 'Published'].includes(s), dashed = ['Pending', 'Draft'].includes(s), soft = ['Completed'].includes(s);
    return `<span class="badge${solid ? ' solid' : dashed ? ' dashed' : soft ? ' soft' : ''}">${icon(STATUS_ICO[s] || 'check')}${esc(s)}</span>`;
  };
  const roleBadge = (r) => `<span class="badge soft">${icon(r === 'Admin' ? 'shield' : r === 'Chef' ? 'chef' : 'user')}${esc(r)}</span>`;
  const validEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  const setErr = (input, msg) => { const f = input.closest('.f-field'); f.classList.toggle('bad', !!msg); const e = $('.f-err', f); if (e) e.textContent = msg || ''; return !msg; };
  const pager = (total, page, per, key) => {
    const pages = Math.max(1, Math.ceil(total / per));
    const from = total ? (page - 1) * per + 1 : 0, to = Math.min(total, page * per);
    return `<div class="pager"><span class="muted sm">Showing ${from}–${to} of ${total}</span><div class="pager-btns">
      <button class="icon-act" type="button" data-${key}="${page - 1}" ${page <= 1 ? 'disabled' : ''} aria-label="Previous page">${icon('chev-l')}</button>
      ${Array.from({ length: pages }, (_, i) => `<button class="pg${i + 1 === page ? ' is-on' : ''}" type="button" data-${key}="${i + 1}" ${i + 1 === page ? 'aria-current="page"' : ''}>${i + 1}</button>`).join('')}
      <button class="icon-act" type="button" data-${key}="${page + 1}" ${page >= pages ? 'disabled' : ''} aria-label="Next page">${icon('chev-r')}</button></div></div>`;
  };

  /* =========================================================
     CHARTS — single series, thin marks, hover tooltip,
     keyboard focus and a table view for every chart
     ========================================================= */
  const tip = $('#chartTip');
  const showTip = (html, x, y) => {
    tip.innerHTML = html; tip.hidden = false;
    const r = tip.getBoundingClientRect();
    let left = x - r.width / 2, top = y - r.height - 14;
    left = Math.max(8, Math.min(left, window.innerWidth - r.width - 8));
    if (top < 8) top = y + 18;
    tip.style.left = left + 'px'; tip.style.top = top + 'px';
  };
  const hideTip = () => { tip.hidden = true; };
  // nice axis: 3–5 ticks with round steps (1, 2, 2.5, 5 × 10^n)
  const niceScale = (v) => {
    if (v <= 0) return { max: 1, ticks: 1 };
    const mag = Math.pow(10, Math.floor(Math.log10(v / 4)));
    for (const m of [1, 2, 2.5, 5, 10, 20]) { const step = m * mag, ticks = Math.ceil(v / step); if (ticks <= 5) return { max: step * ticks, ticks }; }
    return { max: v, ticks: 4 };
  };
  const NS = 'http://www.w3.org/2000/svg';
  const chartHosts = new Set();
  const ro = 'ResizeObserver' in window ? new ResizeObserver((entries) => entries.forEach((en) => { const h = en.target; if (h._draw && h.isConnected && h._w !== h.clientWidth) h._draw(); })) : null;
  const mountChart = (host, draw) => { host._draw = draw; draw(); if (ro) ro.observe(host); chartHosts.add(host); };

  /* line chart (one series over time) */
  const lineChart = (host, pts, { fmt = money, axis = compact, name = 'Value' } = {}) => mountChart(host, () => {
    const W = Math.max(280, host.clientWidth); host._w = host.clientWidth;
    const H = W < 520 ? 220 : 270, P = { l: 52, r: 18, t: 18, b: 32 };
    const { max, ticks } = niceScale(Math.max(...pts.map((d) => d.v)));
    const iw = W - P.l - P.r, ih = H - P.t - P.b;
    const x = (i) => P.l + (pts.length > 1 ? (i * iw) / (pts.length - 1) : iw / 2);
    const y = (v) => P.t + ih * (1 - v / max);
    const grid = Array.from({ length: ticks + 1 }, (_, k) => k).map((k) => { const v = (max / ticks) * k; return `<line class="c-grid" x1="${P.l}" x2="${W - P.r}" y1="${y(v)}" y2="${y(v)}"/><text class="c-axis" x="${P.l - 10}" y="${y(v) + 4}" text-anchor="end">${axis(v)}</text>`; }).join('');
    const every = W < 520 ? Math.ceil(pts.length / 6) : 1;
    const xl = pts.map((d, i) => ((pts.length - 1 - i) % every === 0) ? `<text class="c-axis" x="${x(i)}" y="${H - 8}" text-anchor="middle">${esc(d.label)}</text>` : '').join('');
    const line = pts.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d.v).toFixed(1)}`).join(' ');
    const area = `${line} L${x(pts.length - 1)},${y(0)} L${x(0)},${y(0)} Z`;
    const last = pts.length - 1;
    host.innerHTML = `<svg class="chart" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(name)} line chart">
      ${grid}${xl}<path class="c-area" d="${area}"/><path class="c-line" d="${line}" pathLength="1"/>
      <circle class="c-end" cx="${x(last)}" cy="${y(pts[last].v)}" r="5"/>
      <text class="c-end-label" x="${x(last) - 8}" y="${y(pts[last].v) - 12}" text-anchor="end">${axis(pts[last].v)}</text>
      <line class="c-cross" y1="${P.t}" y2="${H - P.b}" x1="0" x2="0" visibility="hidden"/>
      <circle class="c-dot" r="6" cx="0" cy="0" visibility="hidden"/>
      <rect class="c-hit" x="${P.l - 10}" y="${P.t}" width="${iw + 20}" height="${ih}" fill="transparent"/></svg>`;
    const svg = $('svg', host), cross = $('.c-cross', svg), dot = $('.c-dot', svg);
    const at = (i) => {
      i = Math.max(0, Math.min(pts.length - 1, i)); host._i = i;
      cross.setAttribute('x1', x(i)); cross.setAttribute('x2', x(i)); cross.setAttribute('visibility', 'visible');
      dot.setAttribute('cx', x(i)); dot.setAttribute('cy', y(pts[i].v)); dot.setAttribute('visibility', 'visible');
      const r = svg.getBoundingClientRect(), sx = r.width / W;
      const prev = i ? pct(pts[i].v, pts[i - 1].v) : null;
      showTip(`<strong>${esc(pts[i].full || pts[i].label)}</strong><span>${esc(name)}: <b>${fmt(pts[i].v)}</b></span>${prev !== null ? `<small>${prev >= 0 ? '▲' : '▼'} ${Math.abs(prev).toFixed(1)}% vs previous</small>` : ''}`, r.left + x(i) * sx, r.top + y(pts[i].v) * sx);
    };
    const off = () => { cross.setAttribute('visibility', 'hidden'); dot.setAttribute('visibility', 'hidden'); hideTip(); };
    const hit = $('.c-hit', svg);
    hit.addEventListener('pointermove', (e) => { const r = svg.getBoundingClientRect(); const px = (e.clientX - r.left) * (W / r.width); at(Math.round(((px - P.l) / iw) * (pts.length - 1))); });
    hit.addEventListener('pointerleave', off);
    host.onkeydown = (e) => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); at((host._i ?? pts.length) + (e.key === 'ArrowRight' ? 1 : -1)); } };
    host.onfocus = () => at(host._i ?? last); host.onblur = off;
  });

  /* vertical bar chart (one series, categories or months) */
  const barChart = (host, pts, { fmt = (v) => v, axis = (v) => v, name = 'Value' } = {}) => mountChart(host, () => {
    const W = Math.max(280, host.clientWidth); host._w = host.clientWidth;
    const H = W < 520 ? 220 : 250, P = { l: 40, r: 12, t: 22, b: 32 };
    const { max, ticks } = niceScale(Math.max(...pts.map((d) => d.v)));
    const iw = W - P.l - P.r, ih = H - P.t - P.b, band = iw / pts.length, bw = Math.min(34, band * 0.62);
    const y = (v) => P.t + ih * (1 - v / max);
    const grid = Array.from({ length: ticks + 1 }, (_, k) => k).map((k) => { const v = (max / ticks) * k; return `<line class="c-grid" x1="${P.l}" x2="${W - P.r}" y1="${y(v)}" y2="${y(v)}"/><text class="c-axis" x="${P.l - 8}" y="${y(v) + 4}" text-anchor="end">${axis(v)}</text>`; }).join('');
    const top = pts.reduce((m, d, i) => (d.v > pts[m].v ? i : m), 0);
    const bars = pts.map((d, i) => {
      const cx = P.l + band * i + band / 2, x0 = cx - bw / 2, y0 = y(d.v), h = Math.max(0, y(0) - y0), r = Math.min(4, h, bw / 2);
      const path = h ? `M${x0},${y(0)} V${y0 + r} Q${x0},${y0} ${x0 + r},${y0} H${x0 + bw - r} Q${x0 + bw},${y0} ${x0 + bw},${y0 + r} V${y(0)} Z` : '';
      return `<g class="c-bar" data-i="${i}"><rect class="c-bar-hit" x="${P.l + band * i}" y="${P.t}" width="${band}" height="${ih}" fill="transparent"/><path d="${path}" style="--d:${i * 40}ms"/>
        ${i === top ? `<text class="c-end-label" x="${cx}" y="${y0 - 8}" text-anchor="middle">${axis(d.v)}</text>` : ''}
        <text class="c-axis" x="${cx}" y="${H - 8}" text-anchor="middle">${esc(d.label)}</text></g>`;
    }).join('');
    host.innerHTML = `<svg class="chart" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(name)} bar chart">${grid}${bars}</svg>`;
    const svg = $('svg', host);
    const at = (i) => {
      i = Math.max(0, Math.min(pts.length - 1, i)); host._i = i;
      $$('.c-bar', svg).forEach((g) => g.classList.toggle('dim', +g.dataset.i !== i));
      const r = svg.getBoundingClientRect(), sx = r.width / W, total = pts.reduce((s, d) => s + d.v, 0);
      showTip(`<strong>${esc(pts[i].full || pts[i].label)}</strong><span>${esc(name)}: <b>${fmt(pts[i].v)}</b></span><small>${((pts[i].v / total) * 100).toFixed(1)}% of total</small>`, r.left + (P.l + band * i + band / 2) * sx, r.top + y(pts[i].v) * sx);
    };
    const off = () => { $$('.c-bar', svg).forEach((g) => g.classList.remove('dim')); hideTip(); };
    $$('.c-bar', svg).forEach((g) => { g.addEventListener('pointerenter', () => at(+g.dataset.i)); });
    svg.addEventListener('pointerleave', off);
    host.onkeydown = (e) => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); at((host._i ?? -1) + (e.key === 'ArrowRight' ? 1 : -1)); } };
    host.onfocus = () => at(host._i ?? top); host.onblur = off;
  });

  /* horizontal ranked bars (HTML) */
  const hbars = (rows, fmt = (v) => v) => {
    const max = Math.max(...rows.map((r) => r.v)), total = rows.reduce((s, r) => s + r.v, 0);
    return `<ul class="hbars">${rows.map((r, i) => `<li tabindex="0" data-tip="<strong>${esc(r.label)}</strong><span>${esc(fmt(r.v))}</span><small>${((r.v / total) * 100).toFixed(1)}% of total</small>">
      <span class="hb-label">${esc(r.label)}</span><span class="hb-track"><i style="--w:${((r.v / max) * 100).toFixed(1)}%;--d:${i * 60}ms"></i></span><b class="hb-val">${esc(fmt(r.v))}</b></li>`).join('')}</ul>`;
  };
  document.addEventListener('pointerover', (e) => { const li = e.target.closest('.hbars li'); if (!li) return; const r = li.querySelector('.hb-track').getBoundingClientRect(); showTip(li.dataset.tip, r.left + r.width / 2, r.top); });
  document.addEventListener('pointerout', (e) => { const li = e.target.closest('.hbars li'); if (li && !li.contains(e.relatedTarget)) hideTip(); });
  document.addEventListener('focusin', (e) => { const li = e.target.closest && e.target.closest('.hbars li'); if (li) { const r = li.querySelector('.hb-track').getBoundingClientRect(); showTip(li.dataset.tip, r.left + r.width / 2, r.top); } });
  document.addEventListener('focusout', (e) => { if (e.target.closest && e.target.closest('.hbars li')) hideTip(); });
  window.addEventListener('scroll', hideTip, { passive: true });

  /* chart card with Chart / Table toggle */
  const chartCard = (id, title, sub, tableRows, cls = '') => `
    <div class="card chart-card ${cls}">
      <div class="card-head"><div><h2>${esc(title)}</h2><small class="muted">${esc(sub)}</small></div>
        <div class="tabs sm" role="tablist" aria-label="${esc(title)} view"><button class="tab is-on" type="button" role="tab" aria-selected="true" data-cv="${id}" data-mode="chart">${icon('chart')}Chart</button><button class="tab" type="button" role="tab" aria-selected="false" data-cv="${id}" data-mode="table">${icon('table')}Table</button></div></div>
      <div class="chart-host" id="${id}" tabindex="0" aria-label="${esc(title)}. Use left and right arrow keys to read values."></div>
      <div class="table-wrap chart-table" id="${id}-t" hidden><table class="tbl"><thead><tr>${tableRows[0].map((h, i) => `<th${i ? ' class="num"' : ''}>${esc(h)}</th>`).join('')}</tr></thead>
        <tbody>${tableRows.slice(1).map((r) => `<tr>${r.map((c, i) => `<td${i ? ' class="num"' : ''}>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
    </div>`;
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-cv]'); if (!b) return;
    const id = b.dataset.cv, tbl = b.dataset.mode === 'table';
    $$(`[data-cv="${id}"]`).forEach((x) => { const on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-selected', String(on)); });
    $('#' + id).hidden = tbl; $('#' + id + '-t').hidden = !tbl;
    if (!tbl) $('#' + id)._draw();
    hideTip();
  });

  /* =========================================================
     CHROME: counts, notifications
     ========================================================= */
  const NOTIF_ICO = { booking: 'calendar', user: 'users', payment: 'wallet', review: 'star', system: 'gear' };
  const refreshChrome = () => {
    const pendingUsers = DB.users.filter((u) => u.status === 'Pending').length;
    const pendingBk = DB.bookings.filter((b) => b.status === 'Pending').length;
    const unread = DB.threads.filter((t) => t.unread).length;
    $('#cntUsers').textContent = pendingUsers || ''; $('#cntPending').textContent = pendingBk || ''; $('#cntMsgs').textContent = unread || '';
    $('#cntUsers').title = `${pendingUsers} awaiting approval`; $('#cntPending').title = `${pendingBk} pending bookings`;
    $('#topAvatar').textContent = initials(DB.admin.name);
    $('#popName').textContent = DB.admin.name; $('#popEmail').textContent = DB.admin.role;
    const nUnread = DB.notifications.filter((n) => !n.read).length;
    const dot = $('#bellDot'); dot.hidden = !nUnread; dot.textContent = nUnread;
    $('#notifList').innerHTML = DB.notifications.length ? DB.notifications.slice(0, 6).map((n) => `
      <li class="notif${n.read ? '' : ' unread'}"><button type="button" data-notif="${n.id}">
        <span class="notif-dot" aria-hidden="true"></span><span><span class="notif-text">${esc(n.text)}</span><small>${relTime(n.time)}</small></span></button></li>`).join('')
      : '<li class="empty-sm">You are all caught up.</li>';
    const m = DB.settings.maintenance;
    $('#studioState').textContent = m ? 'Maintenance mode' : 'Studio is open';
    $('#studioSub').textContent = m ? 'Bookings are paused' : 'Bookings are live';
    $('.side-status').classList.toggle('paused', m);
  };
  const notify = (type, text, link) => { DB.notifications.unshift({ id: uid('N'), type, text, time: new Date().toISOString(), read: false, link }); save(); refreshChrome(); };
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-notif]'); if (!b) return;
    const n = DB.notifications.find((x) => x.id === b.dataset.notif); if (!n) return;
    n.read = true; save(); refreshChrome(); go(n.link || 'overview');
  });
  $('#markAllRead').addEventListener('click', () => { DB.notifications.forEach((n) => { n.read = true; }); save(); refreshChrome(); if (current === 'messages') renderers.messages(); toast('All notifications marked as read'); });

  /* =========================================================
     VIEW: OVERVIEW
     ========================================================= */
  renderers.overview = () => {
    const M = DB.monthly, cur = M[M.length - 1], prev = M[M.length - 2];
    const members = DB.users.filter((u) => u.role === 'Student' && u.status === 'Active').length;
    const cls = DB.content.classes.filter((c) => c.published);
    const fill = cls.reduce((s, c) => s + c.booked, 0) / Math.max(1, cls.reduce((s, c) => s + c.seats, 0)) * 100;
    const today = todayISO();
    const todays = DB.bookings.filter((b) => b.date === today && b.status !== 'Cancelled');
    const pendingBk = DB.bookings.filter((b) => b.status === 'Pending').length;
    const pendingUsers = DB.users.filter((u) => u.status === 'Pending').length;
    const drafts = ['classes', 'recipes', 'workshops'].reduce((s, k) => s + DB.content[k].filter((x) => !x.published).length, 0);
    const unread = DB.threads.filter((t) => t.unread).length;
    const byCuisine = CUISINES.map((c) => ({ label: c, v: cur.cuisine[c] })).sort((a, b) => b.v - a.v);
    const pts = M.map((d) => ({ label: monthLabel(d.m), full: monthLabel(d.m, true), v: d.revenue }));
    const hr = new Date().getHours();
    $('#view-overview').innerHTML = `
      <div class="hello card">
        <div class="hello-main">
          <span class="tagline">${hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening'}, ${esc(DB.admin.name.split(' ')[0])}</span>
          <h2>Here's how the studio is doing</h2>
          <p class="muted">${fmtDate(today, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · ${todays.length} booking${todays.length === 1 ? '' : 's'} in today's sessions</p>
        </div>
        <div class="quick">
          <button class="btn btn-primary btn-sm" type="button" data-quick="class">${icon('plus')} New Class</button>
          <button class="btn btn-secondary btn-sm" type="button" data-quick="user">${icon('user-plus')} Add User</button>
          <button class="btn btn-secondary btn-sm" type="button" data-quick="announce">${icon('megaphone')} Announcement</button>
        </div>
      </div>
      <div class="tiles">
        ${tile('wallet', compact(cur.revenue), 'Revenue this month', pct(cur.revenue, prev.revenue), 'vs ' + monthLabel(prev.m))}
        ${tile('calendar', cur.bookings, 'Bookings this month', pct(cur.bookings, prev.bookings), 'vs ' + monthLabel(prev.m))}
        ${tile('users', members, 'Active students', null, `${DB.users.length} accounts in total`)}
        ${tile('seat', Math.round(fill) + '%', 'Seat fill rate', null, `${cls.length} live classes`)}
      </div>
      <div class="ov-grid">
        ${chartCard('ovRevenue', 'Revenue', 'Last 12 months', [['Month', 'Revenue'], ...M.map((d) => [monthLabel(d.m, true), money(d.revenue)])], 'ov-wide')}
        <div class="card">
          <div class="card-head"><div><h2>Bookings by cuisine</h2><small class="muted">${monthLabel(cur.m, true)}</small></div></div>
          ${hbars(byCuisine, (v) => v + ' bookings')}
        </div>
        <div class="card ov-wide">
          <div class="card-head"><h2>Recent bookings</h2><a href="#bookings" class="link-btn">View all</a></div>
          <div class="table-wrap"><table class="tbl"><thead><tr><th>Booking</th><th>Student</th><th>Class</th><th>Session</th><th class="num">Amount</th><th>Status</th></tr></thead>
          <tbody>${DB.bookings.slice(0, 5).map((b) => `<tr><td><button class="link-btn" type="button" data-bk="${b.id}">${b.id}</button></td><td class="nowrap">${esc(b.student)}</td><td>${esc(b.item)}</td><td class="nowrap">${fmtDate(b.date, { day: 'numeric', month: 'short' })}</td><td class="num">${money(b.amount)}</td><td>${statusBadge(b.status)}</td></tr>`).join('')}</tbody></table></div>
        </div>
        <div class="card">
          <div class="card-head"><h2>Needs attention</h2></div>
          <ul class="todo">
            <li><a href="#bookings" data-preset="Pending"><span class="ico-round">${icon('clock')}</span><span><b>${pendingBk}</b> pending bookings</span>${icon('chev-r', 'go')}</a></li>
            <li><a href="#users" data-preset-user="Pending"><span class="ico-round">${icon('user-plus')}</span><span><b>${pendingUsers}</b> accounts to approve</span>${icon('chev-r', 'go')}</a></li>
            <li><a href="#messages"><span class="ico-round">${icon('chat')}</span><span><b>${unread}</b> unread messages</span>${icon('chev-r', 'go')}</a></li>
            <li><a href="#content"><span class="ico-round">${icon('edit')}</span><span><b>${drafts}</b> drafts not published</span>${icon('chev-r', 'go')}</a></li>
          </ul>
        </div>
      </div>`;
    lineChart($('#ovRevenue'), pts, { name: 'Revenue' });
  };
  $('#view-overview').addEventListener('click', (e) => {
    const q = e.target.closest('[data-quick]');
    if (q) { if (q.dataset.quick === 'class') { contentTab = 'classes'; go('content'); contentForm('classes'); } if (q.dataset.quick === 'user') { go('users'); userForm(); } if (q.dataset.quick === 'announce') { msgTab = 'notifications'; go('messages'); announceForm(); } }
    const p = e.target.closest('[data-preset]'); if (p) bkState.status = p.dataset.preset;
    const pu = e.target.closest('[data-preset-user]'); if (pu) { userState.status = pu.dataset.presetUser; userState.page = 1; }
  });

  /* =========================================================
     VIEW: USERS
     ========================================================= */
  const userState = { q: '', role: 'All', status: 'All', sort: 'joined', dir: -1, page: 1, sel: new Set() };
  const PER = 8;
  const filteredUsers = () => {
    const q = userState.q.toLowerCase();
    return DB.users.filter((u) => (userState.role === 'All' || u.role === userState.role) && (userState.status === 'All' || u.status === userState.status) && (!q || `${u.name} ${u.email} ${u.id}`.toLowerCase().includes(q)))
      .sort((a, b) => { const k = userState.sort, va = a[k], vb = b[k]; return (typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb))) * userState.dir; });
  };
  const sortTh = (k, label, num) => {
    const on = userState.sort === k;
    return `<th class="${num ? 'num' : ''}" aria-sort="${on ? (userState.dir > 0 ? 'ascending' : 'descending') : 'none'}"><button class="th-sort${on ? ' is-on' : ''}" type="button" data-sort="${k}">${label}${icon(on && userState.dir > 0 ? 'up' : 'down')}</button></th>`;
  };
  renderers.users = () => {
    const list = filteredUsers();
    const pages = Math.max(1, Math.ceil(list.length / PER));
    if (userState.page > pages) userState.page = pages;
    const rows = list.slice((userState.page - 1) * PER, userState.page * PER);
    const allOn = rows.length && rows.every((u) => userState.sel.has(u.id));
    const counts = (r) => DB.users.filter((u) => r === 'All' || u.role === r).length;
    $('#view-users').innerHTML = `
      <div class="tiles">
        ${tile('users', DB.users.length, 'Total accounts', null, 'Students, chefs and admins')}
        ${tile('user', counts('Student'), 'Students', null, `${DB.users.filter((u) => u.role === 'Student' && u.status === 'Active').length} active`)}
        ${tile('chef', counts('Chef'), 'Chefs', null, 'Teaching this season')}
        ${tile('clock', DB.users.filter((u) => u.status === 'Pending').length, 'Awaiting approval', null, 'New sign-ups')}
      </div>
      <div class="card">
        <div class="toolbar">
          <div class="toolbar-right">
            <label class="input-ico">${icon('search')}<span class="sr">Search users</span><input class="input" id="uSearch" type="search" placeholder="Search name, email or ID" value="${esc(userState.q)}" /></label>
            <label><span class="sr">Role</span><select class="select" id="uRole">${['All', 'Student', 'Chef', 'Admin'].map((r) => `<option${r === userState.role ? ' selected' : ''} value="${r}">${r === 'All' ? 'All roles' : r + 's'}</option>`).join('')}</select></label>
            <label><span class="sr">Status</span><select class="select" id="uStatus">${['All', 'Active', 'Pending', 'Suspended'].map((r) => `<option${r === userState.status ? ' selected' : ''} value="${r}">${r === 'All' ? 'All statuses' : r}</option>`).join('')}</select></label>
          </div>
          <div class="toolbar-right">
            <button class="btn btn-secondary btn-sm" type="button" id="uExport">${icon('dl')} Export CSV</button>
            <button class="btn btn-primary btn-sm" type="button" id="uAdd">${icon('user-plus')} Add User</button>
          </div>
        </div>
        <div class="bulk${userState.sel.size ? ' show' : ''}" aria-live="polite">
          <strong>${userState.sel.size} selected</strong>
          <button class="btn btn-secondary btn-xs" type="button" data-bulk="Active">${icon('check')} Activate</button>
          <button class="btn btn-secondary btn-xs" type="button" data-bulk="Suspended">${icon('x')} Suspend</button>
          <button class="btn btn-primary btn-xs" type="button" data-bulk="delete">${icon('trash')} Delete</button>
          <button class="link-btn" type="button" data-bulk="clear">Clear</button>
        </div>
        ${list.length ? `<div class="table-wrap"><table class="tbl users-tbl">
          <thead><tr><th class="chk"><label class="cbox"><input type="checkbox" id="uAll" ${allOn ? 'checked' : ''} aria-label="Select all on this page" /><span></span></label></th>
            ${sortTh('name', 'User')}<th>Role</th><th>Status</th>${sortTh('joined', 'Joined')}${sortTh('bookings', 'Bookings', true)}${sortTh('spent', 'Spent', true)}<th class="num">Actions</th></tr></thead>
          <tbody>${rows.map((u) => `<tr class="${userState.sel.has(u.id) ? 'is-sel' : ''}">
            <td class="chk"><label class="cbox"><input type="checkbox" data-sel="${u.id}" ${userState.sel.has(u.id) ? 'checked' : ''} aria-label="Select ${esc(u.name)}" /><span></span></label></td>
            <td><div class="who"><span class="avatar avatar-sm">${initials(u.name)}</span><span><strong>${esc(u.name)}</strong><small class="muted">${esc(u.email)}</small></span></div></td>
            <td>${roleBadge(u.role)}</td><td>${statusBadge(u.status)}</td><td>${fmtDate(u.joined)}</td>
            <td class="num">${u.bookings || '—'}</td><td class="num">${u.spent ? money(u.spent) : '—'}</td>
            <td class="num"><div class="row-acts">
              ${u.status === 'Pending' ? `<button class="icon-act" type="button" data-approve="${u.id}" aria-label="Approve ${esc(u.name)}" title="Approve">${icon('check')}</button>` : ''}
              <button class="icon-act" type="button" data-edit-user="${u.id}" aria-label="Edit ${esc(u.name)}" title="Edit">${icon('edit')}</button>
              <button class="icon-act" type="button" data-del-user="${u.id}" aria-label="Delete ${esc(u.name)}" title="Delete" ${u.role === 'Admin' ? 'disabled' : ''}>${icon('trash')}</button></div></td></tr>`).join('')}</tbody></table></div>
          ${pager(list.length, userState.page, PER, 'upage')}`
        : empty('search', 'No users found', 'Try a different search or clear the filters.')}
      </div>`;
    const s = $('#uSearch');
    s.addEventListener('input', () => { userState.q = s.value; userState.page = 1; renderers.users(); const n = $('#uSearch'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); });
    $('#uRole').addEventListener('change', (e) => { userState.role = e.target.value; userState.page = 1; renderers.users(); });
    $('#uStatus').addEventListener('change', (e) => { userState.status = e.target.value; userState.page = 1; renderers.users(); });
    $('#uAdd').addEventListener('click', () => userForm());
    $('#uExport').addEventListener('click', () => {
      download('culina-users.csv', csv([['ID', 'Name', 'Email', 'Phone', 'Role', 'Status', 'Joined', 'Bookings', 'Spent'], ...list.map((u) => [u.id, u.name, u.email, u.phone, u.role, u.status, u.joined, u.bookings, u.spent])]), 'text/csv');
      toast(`${plural(list.length, 'user')} exported`, 'dl');
    });
    const all = $('#uAll'); if (all) all.addEventListener('change', () => { rows.forEach((u) => (all.checked ? userState.sel.add(u.id) : userState.sel.delete(u.id))); renderers.users(); });
  };
  $('#view-users').addEventListener('change', (e) => { const c = e.target.closest('[data-sel]'); if (c) { c.checked ? userState.sel.add(c.dataset.sel) : userState.sel.delete(c.dataset.sel); renderers.users(); } });
  $('#view-users').addEventListener('click', (e) => {
    const t = e.target;
    const srt = t.closest('[data-sort]'); if (srt) { const k = srt.dataset.sort; userState.dir = userState.sort === k ? -userState.dir : (k === 'name' ? 1 : -1); userState.sort = k; renderers.users(); return; }
    const pg = t.closest('[data-upage]'); if (pg && !pg.disabled) { userState.page = +pg.dataset.upage; renderers.users(); return; }
    const ap = t.closest('[data-approve]'); if (ap) { const u = DB.users.find((x) => x.id === ap.dataset.approve); u.status = 'Active'; save(); refreshChrome(); renderers.users(); toast(`${u.name} approved`); return; }
    const ed = t.closest('[data-edit-user]'); if (ed) { userForm(DB.users.find((x) => x.id === ed.dataset.editUser)); return; }
    const dl = t.closest('[data-del-user]'); if (dl) { const u = DB.users.find((x) => x.id === dl.dataset.delUser); confirmBox('Delete user?', `${u.name} (${u.email}) will be removed. Their past bookings stay in the records.`, 'Delete', () => { DB.users = DB.users.filter((x) => x !== u); userState.sel.delete(u.id); save(); refreshChrome(); renderers.users(); toast(`${u.name} deleted`, 'trash'); }); return; }
    const bk = t.closest('[data-bulk]'); if (!bk) return;
    const ids = [...userState.sel], act = bk.dataset.bulk;
    if (act === 'clear') { userState.sel.clear(); renderers.users(); return; }
    const targets = DB.users.filter((u) => ids.includes(u.id) && u.role !== 'Admin');
    if (act === 'delete') {
      confirmBox(`Delete ${targets.length} user${targets.length === 1 ? '' : 's'}?`, 'Admin accounts are skipped. This cannot be undone.', 'Delete', () => { DB.users = DB.users.filter((u) => !targets.includes(u)); userState.sel.clear(); save(); refreshChrome(); renderers.users(); toast(`${plural(targets.length, 'user')} deleted`, 'trash'); });
    } else { targets.forEach((u) => { u.status = act; }); userState.sel.clear(); save(); refreshChrome(); renderers.users(); toast(`${plural(targets.length, 'user')} set to ${act}`); }
  });
  function userForm(u) {
    const isNew = !u;
    u = u || { name: '', email: '', phone: '', role: 'Student', status: 'Active' };
    openModal(`<h2 id="modalTitle" class="modal-title">${isNew ? 'Add user' : 'Edit user'}</h2>
      <p class="modal-text">${isNew ? 'Create a student, chef or admin account.' : esc(u.id) + ' · joined ' + fmtDate(u.joined)}</p>
      <form class="form f-grid" id="userForm" novalidate>
        <label class="f-field span-2"><span class="f-label">Full name</span><input class="input" id="fName" value="${esc(u.name)}" maxlength="40" autocomplete="off" /><small class="f-err"></small></label>
        <label class="f-field"><span class="f-label">Email</span><input class="input" id="fEmail" type="email" value="${esc(u.email)}" autocomplete="off" /><small class="f-err"></small></label>
        <label class="f-field"><span class="f-label">Phone</span><input class="input" id="fPhone" type="tel" value="${esc(u.phone)}" placeholder="+91 …" /><small class="f-err"></small></label>
        <label class="f-field"><span class="f-label">Role</span><select class="select" id="fRole">${['Student', 'Chef', 'Admin'].map((r) => `<option${r === u.role ? ' selected' : ''}>${r}</option>`).join('')}</select></label>
        <label class="f-field"><span class="f-label">Status</span><select class="select" id="fStatus">${['Active', 'Pending', 'Suspended'].map((r) => `<option${r === u.status ? ' selected' : ''}>${r}</option>`).join('')}</select></label>
        <div class="span-2 modal-actions"><button class="btn btn-secondary" type="button" data-close>Cancel</button><button class="btn btn-primary" type="submit">${isNew ? 'Create User' : 'Save Changes'}</button></div>
      </form>`);
    $('#userForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#fName').value.trim(), email = $('#fEmail').value.trim().toLowerCase(), phone = $('#fPhone').value.trim();
      let ok = setErr($('#fName'), name.length < 2 ? 'Please enter a full name.' : '');
      ok = setErr($('#fEmail'), !validEmail(email) ? 'Please enter a valid email.' : DB.users.some((x) => x.email === email && x !== u) ? 'This email is already registered.' : '') && ok;
      ok = setErr($('#fPhone'), phone && !/^\+?[\d\s-]{8,16}$/.test(phone) ? 'Use digits, spaces or dashes only.' : '') && ok;
      if (!ok) { $('.f-field.bad .input', modal).focus(); return; }
      Object.assign(u, { name, email, phone, role: $('#fRole').value, status: $('#fStatus').value });
      if (isNew) { u.id = 'U-' + (3000 + DB.users.length); u.joined = todayISO(); u.bookings = 0; u.spent = 0; DB.users.unshift(u); notify('user', `${name} was added as ${u.role}.`, 'users'); userState.sort = 'joined'; userState.dir = -1; userState.page = 1; }
      save(); refreshChrome(); closeModal(); if (current === 'users') renderers.users(); toast(isNew ? `${name} added` : 'User updated');
    });
  }

  /* =========================================================
     VIEW: CONTENT
     ========================================================= */
  let contentTab = 'classes', contentQ = '';
  const CT = { classes: 'Class', recipes: 'Recipe', workshops: 'Workshop' };
  const CTP = { classes: 'Classes', recipes: 'Recipes', workshops: 'Workshops' };
  const plural = (n, w, p = w + 's') => `${n} ${n === 1 ? w : p}`;
  const contentCard = (k, it) => {
    const fill = it.seats ? Math.round((it.booked / it.seats) * 100) : null;
    const meta = k === 'recipes' ? `${icon('clock')} ${it.time >= 60 ? Math.floor(it.time / 60) + ' h ' + (it.time % 60 ? (it.time % 60) + ' min' : '') : it.time + ' min'} · ${icon('eye')} ${it.views.toLocaleString('en-IN')} views`
      : k === 'workshops' ? `${icon('calendar')} ${fmtDate(it.date, { day: 'numeric', month: 'short' })} · ${icon('chef')} ${esc(it.chef)}`
      : `${icon('chef')} ${esc(it.chef)} · ${esc(it.level)}`;
    return `<article class="card ct-card${it.published ? '' : ' is-draft'}">
      <div class="ct-top"><span class="badge soft">${esc(it.cuisine)}</span>${statusBadge(it.published ? 'Published' : 'Draft')}</div>
      <h3>${esc(it.title)}</h3><p class="sm muted ct-meta">${meta}</p>
      ${fill !== null ? `<div class="ct-fill"><span class="xs"><b>${it.booked}/${it.seats}</b> seats booked</span><span class="meter" role="meter" aria-valuenow="${fill}" aria-valuemin="0" aria-valuemax="100" aria-label="Seats booked"><i style="--w:${fill}%"></i></span><b class="xs">${fill}%</b></div>` : ''}
      <div class="ct-foot">${it.price ? `<b class="ct-price">${money(it.price)}</b>` : `<span class="xs muted">${esc(it.level)}</span>`}
        <div class="row-acts"><label class="switch" title="${it.published ? 'Unpublish' : 'Publish'}"><input type="checkbox" data-pub="${it.id}" ${it.published ? 'checked' : ''} aria-label="Published: ${esc(it.title)}" /><span class="track"></span></label>
        <button class="icon-act" type="button" data-edit-ct="${it.id}" aria-label="Edit ${esc(it.title)}">${icon('edit')}</button>
        <button class="icon-act" type="button" data-del-ct="${it.id}" aria-label="Delete ${esc(it.title)}">${icon('trash')}</button></div></div>
    </article>`;
  };
  renderers.content = () => {
    const list = DB.content[contentTab].filter((x) => !contentQ || `${x.title} ${x.cuisine} ${x.chef || ''}`.toLowerCase().includes(contentQ.toLowerCase()));
    $('#view-content').innerHTML = `
      <div class="toolbar">
        <div class="tabs" role="tablist" aria-label="Content type">${Object.keys(CT).map((k) => `<button class="tab${k === contentTab ? ' is-on' : ''}" type="button" role="tab" aria-selected="${k === contentTab}" data-ctab="${k}">${CTP[k]}<sup>${DB.content[k].length}</sup></button>`).join('')}</div>
        <div class="toolbar-right">
          <label class="input-ico">${icon('search')}<span class="sr">Search content</span><input class="input" id="ctSearch" type="search" placeholder="Search ${contentTab}" value="${esc(contentQ)}" /></label>
          <button class="btn btn-primary btn-sm" type="button" id="ctAdd">${icon('plus')} New ${CT[contentTab]}</button>
        </div>
      </div>
      <p class="muted sm">${DB.content[contentTab].filter((x) => x.published).length} published · ${plural(DB.content[contentTab].filter((x) => !x.published).length, 'draft')}. Switch a card off to hide it from the website.</p>
      ${list.length ? `<div class="ct-grid">${list.map((it) => contentCard(contentTab, it)).join('')}</div>` : empty('layers', 'Nothing here yet', `No ${contentTab} match your search.`)}`;
    const s = $('#ctSearch');
    s.addEventListener('input', () => { contentQ = s.value; renderers.content(); const n = $('#ctSearch'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); });
    $('#ctAdd').addEventListener('click', () => contentForm(contentTab));
  };
  $('#view-content').addEventListener('click', (e) => {
    const tb = e.target.closest('[data-ctab]'); if (tb) { contentTab = tb.dataset.ctab; contentQ = ''; renderers.content(); return; }
    const ed = e.target.closest('[data-edit-ct]'); if (ed) { contentForm(contentTab, DB.content[contentTab].find((x) => x.id === ed.dataset.editCt)); return; }
    const dl = e.target.closest('[data-del-ct]');
    if (dl) { const it = DB.content[contentTab].find((x) => x.id === dl.dataset.delCt); confirmBox(`Delete ${CT[contentTab].toLowerCase()}?`, `"${it.title}" will be removed from the studio catalogue.`, 'Delete', () => { DB.content[contentTab] = DB.content[contentTab].filter((x) => x !== it); save(); renderers.content(); toast(`"${it.title}" deleted`, 'trash'); }); }
  });
  $('#view-content').addEventListener('change', (e) => {
    const p = e.target.closest('[data-pub]'); if (!p) return;
    const it = DB.content[contentTab].find((x) => x.id === p.dataset.pub); it.published = p.checked; save();
    const card = p.closest('.ct-card'); card.classList.toggle('is-draft', !p.checked); $('.ct-top .badge:last-child', card).outerHTML = statusBadge(p.checked ? 'Published' : 'Draft');
    toast(`"${it.title}" ${p.checked ? 'published' : 'moved to drafts'}`, p.checked ? 'eye' : 'edit');
  });
  function contentForm(k, it) {
    const isNew = !it;
    it = it || { title: '', cuisine: 'Italian', level: 'Beginner', chef: 'Chef Giulia', price: '', seats: 12, booked: 0, sessions: 0, time: 30, views: 0, date: '', published: true };
    const chefs = DB.users.filter((u) => u.role === 'Chef').map((u) => 'Chef ' + u.name.split(' ')[0]);
    const sel = (id, opts, v) => `<select class="select" id="${id}">${opts.map((o) => `<option${o === v ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
    openModal(`<h2 id="modalTitle" class="modal-title">${isNew ? 'New' : 'Edit'} ${CT[k].toLowerCase()}</h2>
      <form class="form f-grid" id="ctForm" novalidate>
        <label class="f-field span-2"><span class="f-label">Title</span><input class="input" id="cTitle" value="${esc(it.title)}" maxlength="60" /><small class="f-err"></small></label>
        <label class="f-field"><span class="f-label">Cuisine</span>${sel('cCuisine', CUISINES.concat('Basics'), it.cuisine)}</label>
        <label class="f-field"><span class="f-label">Level</span>${sel('cLevel', ['Beginner', 'Intermediate', 'Advanced'], it.level || 'Beginner')}</label>
        ${k !== 'recipes' ? `<label class="f-field"><span class="f-label">Chef</span>${sel('cChef', chefs, it.chef)}</label>
          <label class="f-field"><span class="f-label">Price per seat (₹)</span><input class="input" id="cPrice" type="number" min="0" step="1" value="${esc(it.price)}" /><small class="f-err"></small></label>
          <label class="f-field"><span class="f-label">Seats</span><input class="input" id="cSeats" type="number" min="1" max="40" value="${esc(it.seats)}" /><small class="f-err"></small></label>` : `<label class="f-field"><span class="f-label">Cooking time (min)</span><input class="input" id="cTime" type="number" min="1" value="${esc(it.time)}" /><small class="f-err"></small></label>`}
        ${k === 'workshops' ? `<label class="f-field"><span class="f-label">Date</span><input class="input" id="cDate" type="date" value="${esc(it.date)}" min="${todayISO()}" /><small class="f-err"></small></label>` : ''}
        <label class="f-field span-2 f-inline"><span class="switch"><input type="checkbox" id="cPub" ${it.published ? 'checked' : ''} /><span class="track"></span></span><span>Publish on the website</span></label>
        <div class="span-2 modal-actions"><button class="btn btn-secondary" type="button" data-close>Cancel</button><button class="btn btn-primary" type="submit">${isNew ? 'Create' : 'Save Changes'}</button></div>
      </form>`, { wide: true });
    $('#ctForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const title = $('#cTitle').value.trim();
      let ok = setErr($('#cTitle'), title.length < 3 ? 'Please enter a title (3+ characters).' : '');
      const upd = { title, cuisine: $('#cCuisine').value, level: $('#cLevel').value, published: $('#cPub').checked };
      if (k !== 'recipes') {
        const price = +$('#cPrice').value, seats = +$('#cSeats').value;
        ok = setErr($('#cPrice'), !(price >= 500 && price <= 50000) ? 'Enter a price between ₹500 and ₹50,000.' : '') && ok;
        ok = setErr($('#cSeats'), !(seats >= 1 && seats <= 40) || seats < (it.booked || 0) ? `Seats must be 1–40 and at least ${it.booked || 1}.` : '') && ok;
        Object.assign(upd, { chef: $('#cChef').value, price, seats });
      } else {
        const time = +$('#cTime').value; ok = setErr($('#cTime'), !(time >= 1) ? 'Enter the cooking time in minutes.' : '') && ok; upd.time = time;
      }
      if (k === 'workshops') { const d = $('#cDate').value; ok = setErr($('#cDate'), !d ? 'Pick a workshop date.' : '') && ok; upd.date = d; }
      if (!ok) { $('.f-field.bad .input', modal).focus(); return; }
      Object.assign(it, upd);
      if (isNew) { it.id = { classes: 'CL-', recipes: 'RC-', workshops: 'WS-' }[k] + (400 + DB.content[k].length); DB.content[k].unshift(it); notify('system', `${CT[k]} "${title}" was created.`, 'content'); }
      save(); closeModal(); contentTab = k; if (current === 'content') renderers.content(); toast(isNew ? `${CT[k]} created` : 'Changes saved');
    });
  }

  /* =========================================================
     VIEW: ORDERS / BOOKINGS
     ========================================================= */
  const bkState = { status: 'All', q: '', method: 'All', page: 1 };
  const BK_STATUSES = ['Confirmed', 'Pending', 'Completed', 'Cancelled', 'Refunded'];
  renderers.bookings = () => {
    const q = bkState.q.toLowerCase();
    const list = DB.bookings.filter((b) => (bkState.status === 'All' || b.status === bkState.status) && (bkState.method === 'All' || b.method === bkState.method) && (!q || `${b.id} ${b.student} ${b.item}`.toLowerCase().includes(q)));
    const pages = Math.max(1, Math.ceil(list.length / 10)); if (bkState.page > pages) bkState.page = pages;
    const rows = list.slice((bkState.page - 1) * 10, bkState.page * 10);
    const sum = list.filter((b) => !['Cancelled', 'Refunded'].includes(b.status)).reduce((s, b) => s + b.amount, 0);
    $('#view-bookings').innerHTML = `
      <div class="toolbar">
        <div class="tabs" role="tablist" aria-label="Booking status">${['All', ...BK_STATUSES].map((s) => `<button class="tab${s === bkState.status ? ' is-on' : ''}" type="button" role="tab" aria-selected="${s === bkState.status}" data-bst="${s}">${s}<sup>${s === 'All' ? DB.bookings.length : DB.bookings.filter((b) => b.status === s).length}</sup></button>`).join('')}</div>
        <div class="toolbar-right">
          <label class="input-ico">${icon('search')}<span class="sr">Search bookings</span><input class="input" id="bSearch" type="search" placeholder="Booking ID, student or class" value="${esc(bkState.q)}" /></label>
          <label><span class="sr">Payment method</span><select class="select" id="bMethod">${['All', 'UPI', 'Card', 'Cash'].map((m) => `<option value="${m}"${m === bkState.method ? ' selected' : ''}>${m === 'All' ? 'All payments' : m}</option>`).join('')}</select></label>
          <button class="btn btn-secondary btn-sm" type="button" id="bExport">${icon('dl')} Export CSV</button>
        </div>
      </div>
      <div class="card">
        ${list.length ? `<div class="table-wrap"><table class="tbl">
          <thead><tr><th>Booking</th><th>Student</th><th>Class / Workshop</th><th>Session</th><th class="num">Seats</th><th class="num">Amount</th><th>Payment</th><th>Status</th><th class="num">Details</th></tr></thead>
          <tbody>${rows.map((b) => `<tr><td class="nowrap"><strong>${b.id}</strong><small class="muted cell-sub">Booked ${fmtDate(b.booked, { day: 'numeric', month: 'short' })}</small></td>
            <td class="nowrap">${esc(b.student)}</td><td>${esc(b.item)}<small class="muted cell-sub">${esc(b.type)}</small></td><td class="nowrap">${fmtDate(b.date, { day: 'numeric', month: 'short', year: 'numeric' })}</td>
            <td class="num">${b.seats}</td><td class="num">${money(b.amount)}</td><td>${esc(b.method)}</td>
            <td><label class="status-sel"><span class="sr">Status for ${b.id}</span>${icon(STATUS_ICO[b.status])}<select data-bstatus="${b.id}">${BK_STATUSES.map((s) => `<option${s === b.status ? ' selected' : ''}>${s}</option>`).join('')}</select>${icon('down', 'caret')}</label></td>
            <td class="num"><button class="icon-act" type="button" data-bk="${b.id}" aria-label="View ${b.id}">${icon('eye')}</button></td></tr>`).join('')}</tbody>
          <tfoot><tr><th colspan="5">${list.length} booking${list.length === 1 ? '' : 's'} · cancelled and refunded excluded from total</th><th class="num">${money(sum)}</th><th colspan="3"></th></tr></tfoot></table></div>
          ${pager(list.length, bkState.page, 10, 'bpage')}`
        : empty('calendar', 'No bookings found', 'Try another status or search.')}
      </div>`;
    const s = $('#bSearch');
    s.addEventListener('input', () => { bkState.q = s.value; bkState.page = 1; renderers.bookings(); const n = $('#bSearch'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); });
    $('#bMethod').addEventListener('change', (e) => { bkState.method = e.target.value; bkState.page = 1; renderers.bookings(); });
    $('#bExport').addEventListener('click', () => {
      download('culina-bookings.csv', csv([['Booking', 'Booked on', 'Student', 'Item', 'Type', 'Session date', 'Seats', 'Amount (INR)', 'Payment', 'Status'], ...list.map((b) => [b.id, b.booked, b.student, b.item, b.type, b.date, b.seats, b.amount, b.method, b.status])]), 'text/csv');
      toast(`${plural(list.length, 'booking')} exported`, 'dl');
    });
  };
  const setBookingStatus = (b, s) => {
    const old = b.status; b.status = s; save(); refreshChrome();
    if (s === 'Refunded' && old !== 'Refunded') notify('payment', `Refund of ${money(b.amount)} issued for ${b.id}.`, 'bookings');
    toast(`${b.id} marked ${s}`, STATUS_ICO[s]);
  };
  $('#view-bookings').addEventListener('click', (e) => {
    const t = e.target.closest('[data-bst]'); if (t) { bkState.status = t.dataset.bst; bkState.page = 1; renderers.bookings(); return; }
    const pg = e.target.closest('[data-bpage]'); if (pg && !pg.disabled) { bkState.page = +pg.dataset.bpage; renderers.bookings(); }
  });
  $('#view-bookings').addEventListener('change', (e) => {
    const sel = e.target.closest('[data-bstatus]'); if (!sel) return;
    setBookingStatus(DB.bookings.find((x) => x.id === sel.dataset.bstatus), sel.value); renderers.bookings();
  });
  document.addEventListener('click', (e) => {
    const v = e.target.closest('[data-bk]'); if (!v) return;
    const b = DB.bookings.find((x) => x.id === v.dataset.bk); if (!b) return;
    const steps = [['Booked', b.booked, true], ['Paid via ' + b.method, b.booked, b.status !== 'Pending'], [b.status === 'Cancelled' || b.status === 'Refunded' ? b.status : 'Session', b.date, ['Completed', 'Cancelled', 'Refunded'].includes(b.status)]];
    openModal(`<span class="tagline">Booking ${esc(b.id)}</span><h2 id="modalTitle" class="modal-title">${esc(b.item)}</h2>
      <div class="bk-detail"><div><small>Student</small><b>${esc(b.student)}</b></div><div><small>Session</small><b>${fmtDate(b.date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</b></div>
        <div><small>Seats</small><b>${b.seats}</b></div><div><small>Amount</small><b>${money(b.amount)}</b></div><div><small>Payment</small><b>${esc(b.method)}</b></div><div><small>Status</small>${statusBadge(b.status)}</div></div>
      <ol class="timeline">${steps.map(([l, d, done]) => `<li class="${done ? 'done' : ''}"><span class="tl-dot">${done ? icon('check') : ''}</span><span><b>${esc(l)}</b><small>${fmtDate(d)}</small></span></li>`).join('')}</ol>
      <div class="modal-actions">
        ${b.status === 'Pending' ? `<button class="btn btn-primary" type="button" data-bk-act="Confirmed">${icon('check')} Confirm Booking</button>` : ''}
        ${['Confirmed', 'Pending'].includes(b.status) ? `<button class="btn btn-secondary" type="button" data-bk-act="Cancelled">${icon('x')} Cancel</button>` : ''}
        ${['Cancelled', 'Completed'].includes(b.status) ? `<button class="btn btn-secondary" type="button" data-bk-act="Refunded">${icon('refresh')} Issue Refund</button>` : ''}
        <button class="btn btn-secondary" type="button" data-close>Close</button>
      </div>`, { wide: true });
    $$('[data-bk-act]', modal).forEach((btn) => btn.addEventListener('click', () => {
      const s = btn.dataset.bkAct;
      const run = () => { setBookingStatus(b, s); closeModal(); if (renderers[current]) renderers[current](); };
      if (s === 'Refunded') confirmBox('Issue refund?', `${money(b.amount)} will be returned to ${b.student} via ${b.method}.`, 'Refund', () => { setBookingStatus(b, s); if (renderers[current]) renderers[current](); });
      else run();
    }));
  });

  /* =========================================================
     VIEW: MESSAGES + NOTIFICATIONS
     ========================================================= */
  let msgTab = 'inbox', msgFilter = 'All', activeThread = 'AT-1';
  renderers.messages = () => {
    const unread = DB.threads.filter((t) => t.unread).length, nUnread = DB.notifications.filter((n) => !n.read).length;
    const head = `<div class="toolbar"><div class="tabs" role="tablist" aria-label="Messages or notifications">
      <button class="tab${msgTab === 'inbox' ? ' is-on' : ''}" type="button" role="tab" aria-selected="${msgTab === 'inbox'}" data-mtab="inbox">${icon('chat')} Inbox<sup>${unread || ''}</sup></button>
      <button class="tab${msgTab === 'notifications' ? ' is-on' : ''}" type="button" role="tab" aria-selected="${msgTab === 'notifications'}" data-mtab="notifications">${icon('bell')} Notifications<sup>${nUnread || ''}</sup></button></div>
      <div class="toolbar-right"><button class="btn btn-primary btn-sm" type="button" data-announce>${icon('megaphone')} Send Announcement</button></div></div>`;
    if (msgTab === 'notifications') {
      $('#view-messages').innerHTML = `${head}
        <div class="grid-2 msg-grid">
          <div class="card">
            <div class="card-head"><h2>Notifications</h2><div class="row-acts"><button class="link-btn" type="button" id="nAllRead">Mark all read</button><button class="link-btn" type="button" id="nClear">Clear read</button></div></div>
            ${DB.notifications.length ? `<ul class="nlist">${DB.notifications.map((n) => `<li class="${n.read ? '' : 'unread'}"><span class="ico-round">${icon(NOTIF_ICO[n.type] || 'bell')}</span>
              <div><p>${esc(n.text)}</p><small class="muted">${relTime(n.time)}${n.read ? '' : ' · <b>New</b>'}</small></div>
              <div class="row-acts">${n.read ? '' : `<button class="icon-act" type="button" data-nread="${n.id}" aria-label="Mark as read" title="Mark as read">${icon('check')}</button>`}<button class="icon-act" type="button" data-notif="${n.id}" aria-label="Open" title="Open">${icon('chev-r')}</button></div></li>`).join('')}</ul>`
            : empty('bell', 'No notifications', 'New bookings, sign-ups and payments will appear here.')}
          </div>
          <div class="card">
            <div class="card-head"><h2>Sent announcements</h2></div>
            ${DB.announcements.length ? `<ul class="nlist">${DB.announcements.map((a) => `<li><span class="ico-round">${icon('megaphone')}</span><div><p><b>${esc(a.subject)}</b></p><small class="muted">To ${esc(a.audience)} · ${relTime(a.time)}</small></div></li>`).join('')}</ul>` : empty('megaphone', 'Nothing sent yet', 'Announcements you send show up here.')}
          </div>
        </div>`;
      $('#nAllRead').addEventListener('click', () => { DB.notifications.forEach((n) => { n.read = true; }); save(); refreshChrome(); renderers.messages(); toast('All notifications marked as read'); });
      $('#nClear').addEventListener('click', () => { const n = DB.notifications.filter((x) => x.read).length; DB.notifications = DB.notifications.filter((x) => !x.read); save(); refreshChrome(); renderers.messages(); toast(`${plural(n, 'notification')} cleared`, 'trash'); });
      return;
    }
    const threads = DB.threads.filter((t) => msgFilter === 'All' || (msgFilter === 'Unread' && t.unread) || (msgFilter === 'Starred' && t.starred));
    const th = DB.threads.find((t) => t.id === activeThread);
    if (th && th.unread) { th.unread = false; save(); refreshChrome(); }
    $('#view-messages').innerHTML = `${head}
      <div class="inbox card">
        <aside class="inbox-list">
          <div class="inbox-head"><div class="chips">${['All', 'Unread', 'Starred'].map((f) => `<button class="chip-btn sm${f === msgFilter ? ' is-on' : ''}" type="button" data-mf="${f}">${f}</button>`).join('')}</div></div>
          <ul>${threads.length ? threads.map((t) => `<li><button type="button" class="thread${t.id === activeThread ? ' is-on' : ''}${t.unread ? ' unread' : ''}" data-thread="${t.id}">
            <span class="avatar avatar-sm">${initials(t.from)}</span><span class="thread-main"><strong>${esc(t.from)}<small>${t.starred ? icon('star', 'star-on') : ''}${relTime(t.messages[t.messages.length - 1].time)}</small></strong><span class="thread-sub">${esc(t.subject)}</span></span></button></li>`).join('') : `<li class="empty-sm">No ${msgFilter.toLowerCase()} conversations.</li>`}</ul>
        </aside>
        <div class="convo">
          ${th ? `<div class="convo-head"><button class="icon-act convo-back" type="button" data-back aria-label="Back to conversations">${icon('chev-l')}</button><span class="avatar">${initials(th.from)}</span><div><strong>${esc(th.from)}</strong><small class="muted">${esc(th.email)} · ${esc(th.subject)}</small></div>
              <div class="row-acts convo-acts"><button class="icon-act${th.starred ? ' is-on' : ''}" type="button" data-star="${th.id}" aria-pressed="${th.starred}" aria-label="${th.starred ? 'Unstar' : 'Star'} conversation" title="Star">${icon('star')}</button>
              <button class="icon-act" type="button" data-unread="${th.id}" aria-label="Mark as unread" title="Mark as unread">${icon('mail')}</button>
              <button class="icon-act" type="button" data-del-thread="${th.id}" aria-label="Delete conversation" title="Delete">${icon('trash')}</button></div></div>
            <div class="convo-body" id="convoBody">${th.messages.map((m) => `<div class="bubble${m.me ? ' me' : ''}"><p>${esc(m.text)}</p><small>${m.me ? 'You · ' : ''}${relTime(m.time)}</small></div>`).join('')}</div>
            <div class="quick-replies">${['Thanks — your booking is confirmed.', 'Yes, that works for us!', 'Let me check and get back to you today.'].map((q) => `<button class="chip-btn sm" type="button" data-qr="${esc(q)}">${esc(q)}</button>`).join('')}</div>
            <form class="reply" id="replyForm"><label class="sr" for="replyInput">Reply</label><textarea id="replyInput" class="input" rows="2" placeholder="Reply to ${esc(th.from.split(' ')[0])}…" maxlength="600"></textarea><button class="btn btn-primary" type="submit" aria-label="Send reply">${icon('send')}</button></form>`
          : empty('chat', 'No conversation selected', 'Pick a conversation from the list.')}
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
        th.messages.push({ me: true, text, time: new Date().toISOString() }); save(); renderers.messages(); $('.inbox').classList.add('show-convo');
        toast(`Reply sent to ${th.from}`, 'send');
      });
    }
  };
  $('#view-messages').addEventListener('click', (e) => {
    const t = e.target;
    const mt = t.closest('[data-mtab]'); if (mt) { msgTab = mt.dataset.mtab; renderers.messages(); return; }
    const mf = t.closest('[data-mf]'); if (mf) { msgFilter = mf.dataset.mf; renderers.messages(); return; }
    const th = t.closest('[data-thread]'); if (th) { activeThread = th.dataset.thread; renderers.messages(); $('.inbox').classList.add('show-convo'); return; }
    if (t.closest('[data-back]')) { $('.inbox').classList.remove('show-convo'); return; }
    const st = t.closest('[data-star]'); if (st) { const x = DB.threads.find((y) => y.id === st.dataset.star); x.starred = !x.starred; save(); renderers.messages(); $('.inbox').classList.add('show-convo'); toast(x.starred ? 'Conversation starred' : 'Star removed', 'star'); return; }
    const ur = t.closest('[data-unread]'); if (ur) { const x = DB.threads.find((y) => y.id === ur.dataset.unread); activeThread = null; x.unread = true; save(); refreshChrome(); renderers.messages(); toast('Marked as unread', 'mail'); return; }
    const dt = t.closest('[data-del-thread]'); if (dt) { const x = DB.threads.find((y) => y.id === dt.dataset.delThread); confirmBox('Delete conversation?', `The conversation with ${x.from} will be removed.`, 'Delete', () => { DB.threads = DB.threads.filter((y) => y !== x); activeThread = DB.threads[0] ? DB.threads[0].id : null; save(); refreshChrome(); renderers.messages(); toast('Conversation deleted', 'trash'); }); return; }
    const qr = t.closest('[data-qr]'); if (qr) { const ta = $('#replyInput'); ta.value = qr.dataset.qr; ta.focus(); return; }
    const nr = t.closest('[data-nread]'); if (nr) { DB.notifications.find((n) => n.id === nr.dataset.nread).read = true; save(); refreshChrome(); renderers.messages(); return; }
    if (t.closest('[data-announce]')) announceForm();
  });
  function announceForm() {
    openModal(`<h2 id="modalTitle" class="modal-title">Send announcement</h2><p class="modal-text">Students receive it by email and in their dashboard notifications.</p>
      <form class="form" id="anForm" novalidate>
        <label class="f-field"><span class="f-label">Audience</span><select class="select" id="anAud"><option>All students</option><option>Students with upcoming bookings</option><option>Chefs</option><option>Everyone</option></select></label>
        <label class="f-field"><span class="f-label">Subject</span><input class="input" id="anSub" maxlength="80" /><small class="f-err"></small></label>
        <label class="f-field"><span class="f-label">Message <small class="muted" id="anCount">0/400</small></span><textarea class="input" id="anBody" rows="4" maxlength="400"></textarea><small class="f-err"></small></label>
        <div class="modal-actions"><button class="btn btn-secondary" type="button" data-close>Cancel</button><button class="btn btn-primary" type="submit">${icon('send')} Send</button></div>
      </form>`);
    $('#anBody').addEventListener('input', (e) => { $('#anCount').textContent = `${e.target.value.length}/400`; });
    $('#anForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const sub = $('#anSub').value.trim(), body = $('#anBody').value.trim();
      let ok = setErr($('#anSub'), sub.length < 4 ? 'Add a short subject.' : '');
      ok = setErr($('#anBody'), body.length < 10 ? 'Write at least 10 characters.' : '') && ok;
      if (!ok) return;
      const aud = $('#anAud').value;
      DB.announcements.unshift({ id: uid('AN-'), audience: aud, subject: sub, time: new Date().toISOString() });
      save(); closeModal(); if (current === 'messages') renderers.messages(); toast(`Announcement sent to ${aud.toLowerCase()}`, 'megaphone');
    });
  }

  /* =========================================================
     VIEW: REPORTS
     ========================================================= */
  let range = 6;
  renderers.reports = () => {
    const M = DB.monthly.slice(-range), P = DB.monthly.slice(-range * 2, -range);
    const sum = (arr, k) => arr.reduce((s, d) => s + d[k], 0);
    const rev = sum(M, 'revenue'), bk = sum(M, 'bookings'), ref = sum(M, 'refunds');
    const prevRev = P.length === range ? sum(P, 'revenue') : null, prevBk = P.length === range ? sum(P, 'bookings') : null;
    const aov = rev / bk, prevAov = prevRev ? prevRev / prevBk : null;
    const cuisine = CUISINES.map((c) => ({ label: c, v: M.reduce((s, d) => s + d.cuisine[c], 0) })).sort((a, b) => b.v - a.v);
    const f = range / 12;
    const top = DB.content.classes.map((c) => { const sessions = Math.max(1, Math.round(c.sessions * f)), sold = Math.round(sessions * c.seats * (c.booked / c.seats * 0.4 + 0.5)); return { ...c, sessions, sold, revenue: sold * c.price, fill: Math.min(100, Math.round((sold / (sessions * c.seats)) * 100)) }; }).sort((a, b) => b.revenue - a.revenue);
    const label = `${monthLabel(M[0].m, true)} – ${monthLabel(M[M.length - 1].m, true)}`;
    $('#view-reports').innerHTML = `
      <div class="toolbar">
        <div><div class="tabs" role="tablist" aria-label="Report range">${[3, 6, 12].map((r) => `<button class="tab${r === range ? ' is-on' : ''}" type="button" role="tab" aria-selected="${r === range}" data-range="${r}">Last ${r} months</button>`).join('')}</div></div>
        <div class="toolbar-right"><span class="muted sm">${label}</span><button class="btn btn-secondary btn-sm" type="button" id="rPrint">${icon('print')} Print</button><button class="btn btn-primary btn-sm" type="button" id="rExport">${icon('dl')} Export CSV</button></div>
      </div>
      <div class="tiles">
        ${tile('wallet', compact(rev), 'Revenue', prevRev ? pct(rev, prevRev) : null, prevRev ? `vs prior ${range} mo` : 'No earlier data')}
        ${tile('calendar', bk.toLocaleString('en-IN'), 'Bookings', prevBk ? pct(bk, prevBk) : null, prevBk ? `vs prior ${range} mo` : 'No earlier data')}
        ${tile('receipt', money(Math.round(aov)), 'Average order', prevAov ? pct(aov, prevAov) : null, prevAov ? `vs prior ${range} mo` : 'No earlier data')}
        ${tile('refresh', ((ref / bk) * 100).toFixed(1) + '%', 'Refund rate', null, `${ref} refunds in range`)}
      </div>
      <div class="grid-2">
        ${chartCard('rRevenue', 'Revenue by month', label, [['Month', 'Revenue'], ...M.map((d) => [monthLabel(d.m, true), money(d.revenue)])])}
        ${chartCard('rBookings', 'Bookings by month', label, [['Month', 'Bookings'], ...M.map((d) => [monthLabel(d.m, true), d.bookings])])}
        <div class="card"><div class="card-head"><div><h2>Bookings by cuisine</h2><small class="muted">${label}</small></div></div>${hbars(cuisine, (v) => v + ' bookings')}</div>
        <div class="card"><div class="card-head"><div><h2>Payment methods</h2><small class="muted">Share of paid bookings</small></div></div>${hbars(Object.entries(DB.payments).map(([k, v]) => ({ label: k === 'Cash' ? 'Cash at studio' : k, v })), (v) => v + '%')}</div>
      </div>
      <div class="card">
        <div class="card-head"><div><h2>Top classes</h2><small class="muted">Ranked by revenue · ${label}</small></div></div>
        <div class="table-wrap"><table class="tbl"><thead><tr><th>#</th><th>Class</th><th>Chef</th><th class="num">Sessions</th><th class="num">Seats sold</th><th class="num">Revenue</th><th>Fill rate</th></tr></thead>
        <tbody>${top.map((c, i) => `<tr><td><b>${i + 1}</b></td><td><strong>${esc(c.title)}</strong><small class="muted cell-sub">${esc(c.cuisine)} · ${esc(c.level)}</small></td><td>${esc(c.chef)}</td><td class="num">${c.sessions}</td><td class="num">${c.sold}</td><td class="num">${money(c.revenue)}</td>
          <td><div class="fill-cell"><span class="meter" role="meter" aria-valuenow="${c.fill}" aria-valuemin="0" aria-valuemax="100" aria-label="Fill rate"><i style="--w:${c.fill}%"></i></span><b>${c.fill}%</b></div></td></tr>`).join('')}</tbody></table></div>
      </div>`;
    lineChart($('#rRevenue'), M.map((d) => ({ label: monthLabel(d.m), full: monthLabel(d.m, true), v: d.revenue })), { name: 'Revenue' });
    barChart($('#rBookings'), M.map((d) => ({ label: monthLabel(d.m), full: monthLabel(d.m, true), v: d.bookings })), { name: 'Bookings', fmt: (v) => v + ' bookings' });
    $('#rExport').addEventListener('click', () => {
      download(`culina-report-${range}m.csv`, csv([['Month', 'Revenue (INR)', 'Bookings', 'Refunds', ...CUISINES], ...M.map((d) => [monthLabel(d.m, true), d.revenue, d.bookings, d.refunds, ...CUISINES.map((c) => d.cuisine[c])])]), 'text/csv');
      toast('Report exported', 'dl');
    });
    $('#rPrint').addEventListener('click', () => window.print());
  };
  $('#view-reports').addEventListener('click', (e) => { const r = e.target.closest('[data-range]'); if (r) { range = +r.dataset.range; renderers.reports(); } });

  /* =========================================================
     VIEW: SETTINGS
     ========================================================= */
  let settingsDirty = false;
  const DEFAULTS = seed().settings;
  renderers.settings = () => {
    const s = DB.settings, th = root.getAttribute('data-theme'), dr = root.getAttribute('dir');
    const sw = (k, title, sub) => `<div class="set-row"><div><strong>${esc(title)}</strong><small class="muted">${esc(sub)}</small></div><label class="switch"><input type="checkbox" name="${k}" ${s[k] ? 'checked' : ''} aria-label="${esc(title)}" /><span class="track"></span></label></div>`;
    $('#view-settings').innerHTML = `
      <form id="setForm" class="set-grid" novalidate>
        <div class="card">
          <div class="card-head"><div><h2>Studio profile</h2><small class="muted">Shown on invoices and emails</small></div><span class="ico-round">${icon('home')}</span></div>
          <div class="form f-grid">
            <label class="f-field span-2"><span class="f-label">Studio name</span><input class="input" name="studioName" value="${esc(s.studioName)}" maxlength="40" /><small class="f-err"></small></label>
            <label class="f-field"><span class="f-label">Contact email</span><input class="input" name="email" type="email" value="${esc(s.email)}" /><small class="f-err"></small></label>
            <label class="f-field"><span class="f-label">Phone</span><input class="input" name="phone" type="tel" value="${esc(s.phone)}" /><small class="f-err"></small></label>
            <label class="f-field span-2"><span class="f-label">Address</span><input class="input" name="address" value="${esc(s.address)}" maxlength="90" /><small class="f-err"></small></label>
          </div>
        </div>
        <div class="card">
          <div class="card-head"><div><h2>Booking rules</h2><small class="muted">Applied to every new booking</small></div><span class="ico-round">${icon('calendar')}</span></div>
          <div class="form f-grid">
            <label class="f-field"><span class="f-label">Free cancellation (hours)</span><input class="input" name="cancelHours" type="number" min="0" max="168" value="${s.cancelHours}" /><small class="f-err"></small></label>
            <label class="f-field"><span class="f-label">Max seats per booking</span><input class="input" name="maxSeats" type="number" min="1" max="12" value="${s.maxSeats}" /><small class="f-err"></small></label>
          </div>
          ${sw('waitlist', 'Waitlist for full classes', 'Students can join a queue when seats run out')}
          ${sw('autoConfirm', 'Auto-confirm paid bookings', 'Skip manual review after payment succeeds')}
        </div>
        <div class="card">
          <div class="card-head"><div><h2>Payments</h2><small class="muted">Methods offered at checkout</small></div><span class="ico-round">${icon('wallet')}</span></div>
          <div class="form f-grid">
            <label class="f-field"><span class="f-label">Currency</span><select class="select" name="currency">${['INR', 'USD', 'EUR', 'AED'].map((c) => `<option${c === s.currency ? ' selected' : ''}>${c}</option>`).join('')}</select></label>
            <label class="f-field"><span class="f-label">GST (%)</span><input class="input" name="gst" type="number" min="0" max="28" step="0.5" value="${s.gst}" /><small class="f-err"></small></label>
          </div>
          ${sw('upi', 'UPI', 'Google Pay, PhonePe, Paytm and others')}
          ${sw('card', 'Credit & debit cards', 'Visa, Mastercard, RuPay')}
          ${sw('cash', 'Pay at the studio', 'Cash or card on the day of the class')}
          <p class="f-err" id="payErr" role="alert"></p>
        </div>
        <div class="card">
          <div class="card-head"><div><h2>System</h2><small class="muted">Security, alerts and appearance</small></div><span class="ico-round">${icon('gear')}</span></div>
          ${sw('maintenance', 'Maintenance mode', 'Pause new bookings on the website')}
          ${sw('emailAlerts', 'Email alerts', 'New bookings, refunds and sign-ups')}
          ${sw('weeklyReport', 'Weekly report', 'Summary emailed every Monday')}
          ${sw('twoFactor', 'Two-step sign-in for admins', 'Require a one-time code at login')}
          <div class="set-row"><div><strong>Theme</strong><small class="muted">Applies to the website and dashboards</small></div><div class="tabs sm"><button type="button" class="tab${th === 'light' ? ' is-on' : ''}" data-theme-set="light">Light</button><button type="button" class="tab${th === 'dark' ? ' is-on' : ''}" data-theme-set="dark">Dark</button></div></div>
          <div class="set-row"><div><strong>Text direction</strong><small class="muted">Right-to-left for Arabic or Urdu</small></div><div class="tabs sm"><button type="button" class="tab${dr === 'ltr' ? ' is-on' : ''}" data-dir-set="ltr">LTR</button><button type="button" class="tab${dr === 'rtl' ? ' is-on' : ''}" data-dir-set="rtl">RTL</button></div></div>
        </div>
        <div class="save-bar card" id="saveBar">
          <span class="save-state" id="saveState">${icon('check')} All changes saved</span>
          <div class="row-acts"><button class="btn btn-secondary btn-sm" type="button" id="setDefaults">Reset to Defaults</button><button class="btn btn-secondary btn-sm" type="button" id="setDiscard" disabled>Discard</button><button class="btn btn-primary btn-sm" type="submit" id="setSave" disabled>Save Settings</button></div>
        </div>
      </form>`;
    const form = $('#setForm');
    const mark = () => { settingsDirty = true; $('#saveState').innerHTML = `${icon('edit')} Unsaved changes`; $('#saveBar').classList.add('dirty'); $('#setSave').disabled = false; $('#setDiscard').disabled = false; };
    form.addEventListener('input', (e) => { if (e.target.name) mark(); });
    form.addEventListener('change', (e) => { if (e.target.name) mark(); });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const v = (n) => form.elements[n];
      let ok = setErr(v('studioName'), v('studioName').value.trim().length < 2 ? 'Enter the studio name.' : '');
      ok = setErr(v('email'), !validEmail(v('email').value.trim()) ? 'Enter a valid email.' : '') && ok;
      ok = setErr(v('phone'), !/^\+?[\d\s-]{8,18}$/.test(v('phone').value.trim()) ? 'Enter a valid phone number.' : '') && ok;
      ok = setErr(v('address'), v('address').value.trim().length < 6 ? 'Enter the studio address.' : '') && ok;
      const ch = +v('cancelHours').value, ms = +v('maxSeats').value, gst = +v('gst').value;
      ok = setErr(v('cancelHours'), !(Number.isInteger(ch) && ch >= 0 && ch <= 168) ? 'Use 0–168 hours.' : '') && ok;
      ok = setErr(v('maxSeats'), !(Number.isInteger(ms) && ms >= 1 && ms <= 12) ? 'Use 1–12 seats.' : '') && ok;
      ok = setErr(v('gst'), !(gst >= 0 && gst <= 28) ? 'Use 0–28%.' : '') && ok;
      const payOk = v('upi').checked || v('card').checked || v('cash').checked;
      $('#payErr').textContent = payOk ? '' : 'Keep at least one payment method switched on.';
      if (!ok || !payOk) { const bad = $('.f-field.bad .input', form); if (bad) bad.focus(); toast('Please fix the highlighted fields', 'alert'); return; }
      const wasMaint = DB.settings.maintenance;
      Object.assign(DB.settings, { studioName: v('studioName').value.trim(), email: v('email').value.trim(), phone: v('phone').value.trim(), address: v('address').value.trim(), cancelHours: ch, maxSeats: ms, currency: v('currency').value, gst });
      ['waitlist', 'autoConfirm', 'upi', 'card', 'cash', 'maintenance', 'emailAlerts', 'weeklyReport', 'twoFactor'].forEach((k) => { DB.settings[k] = v(k).checked; });
      if (wasMaint !== DB.settings.maintenance) notify('system', `Maintenance mode turned ${DB.settings.maintenance ? 'on — bookings paused' : 'off — bookings live'}.`, 'settings');
      save(); settingsDirty = false; refreshChrome(); renderers.settings(); toast('Settings saved');
    });
    $('#setDiscard').addEventListener('click', () => { settingsDirty = false; renderers.settings(); toast('Changes discarded', 'refresh'); });
    $('#setDefaults').addEventListener('click', () => confirmBox('Reset to defaults?', 'Studio details, booking rules, payment and system settings go back to their original values.', 'Reset', () => { DB.settings = { ...DEFAULTS }; save(); settingsDirty = false; refreshChrome(); renderers.settings(); toast('Default settings restored', 'refresh'); }));
  };
  $('#view-settings').addEventListener('click', (e) => {
    const th = e.target.closest('[data-theme-set]'); if (th) { applyTheme(th.dataset.themeSet); store.set('culina-theme', th.dataset.themeSet); $$('[data-theme-set]').forEach((b) => b.classList.toggle('is-on', b === th)); return; }
    const dr = e.target.closest('[data-dir-set]'); if (dr) { applyDir(dr.dataset.dirSet); store.set('culina-dir', dr.dataset.dirSet); $$('[data-dir-set]').forEach((b) => b.classList.toggle('is-on', b === dr)); }
  });
  window.addEventListener('beforeunload', (e) => { if (settingsDirty) { e.preventDefault(); e.returnValue = ''; } });

  /* =========================================================
     LOGOUT + GLOBAL SEARCH
     ========================================================= */
  const logout = () => confirmBox('Log out of the admin console?', 'You will return to the Culina Studio website.', 'Logout', () => {
    store.set('culina-admin-session', 'signed-out');
    document.body.classList.add('leaving');
    setTimeout(() => { location.href = 'login.html?role=admin&out=1'; }, reduceMotion ? 0 : 450);
  });
  $('#logoutBtn').addEventListener('click', logout);
  document.addEventListener('click', (e) => { if (e.target.closest('[data-logout]')) { closePops(); logout(); } });

  $('#globalSearch').addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const q = e.target.value.trim(); if (!q) return;
    const l = q.toLowerCase();
    if (/^bk-?\d+/i.test(q) || DB.bookings.some((b) => b.item.toLowerCase().includes(l)) && !DB.users.some((u) => u.name.toLowerCase().includes(l))) { Object.assign(bkState, { q, status: 'All', method: 'All', page: 1 }); go('bookings'); }
    else if (DB.users.some((u) => `${u.name} ${u.email} ${u.id}`.toLowerCase().includes(l))) { Object.assign(userState, { q, role: 'All', status: 'All', page: 1 }); go('users'); }
    else { const k = ['classes', 'recipes', 'workshops'].find((x) => DB.content[x].some((c) => c.title.toLowerCase().includes(l))) || 'classes'; contentTab = k; contentQ = q; go('content'); }
    e.target.value = '';
  });

  /* ---------- Start ---------- */
  refreshChrome();
  go((location.hash || '#overview').slice(1), false);
})();