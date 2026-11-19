/* =========================================================
   CULINA STUDIO — Service detail page (standalone)
   One HTML page, six services. The service is chosen from the URL:
   service-detail.html?service=<slug>
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
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const unsplash = (id, w) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

  /* ---------- Icons (single-colour, inherit currentColor) ---------- */
  const ICON = {
    classes: '<path d="M6 13.9V20h12v-6.1"/><path d="M6 14a4 4 0 1 1 1.6-7.7A5 5 0 0 1 16.4 6.3 4 4 0 1 1 18 14z"/><path d="M6 17h12"/>',
    table: '<path d="M3 11h18"/><path d="M5 11a7 7 0 0 1 14 0"/><path d="M12 4V2"/><path d="M4 15h16l-1 3H5z"/>',
    team: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M15 20a4.5 4.5 0 0 1 6-4.2"/>',
    kids: '<path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z"/>',
    party: '<rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8v13M3 13h18"/><path d="M12 8c-2-4-6-4-6-1.5S10 8 12 8zM12 8c2-4 6-4 6-1.5S14 8 12 8z"/>',
    library: '<path d="M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3z"/><path d="M4 17a3 3 0 0 1 3-3h11"/><path d="M8 8h6"/>',
    chef: '<path d="M6 13.9V20h12v-6.1"/><path d="M6 14a4 4 0 1 1 1.6-7.7A5 5 0 0 1 16.4 6.3 4 4 0 1 1 18 14z"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 4 13c0-6 7-10 16-10 0 9-4 16-10 16"/><path d="M4 21c3-5 6-8 10-10"/>',
    users: '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 4a3 3 0 0 1 0 6M21 20a6 6 0 0 0-4-5.6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    heart: '<path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z"/>',
    star: '<path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z"/>',
    play: '<rect x="2" y="5" width="20" height="14" rx="3"/><path d="M10 9l5 3-5 3z"/>',
    plate: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/>',
    gift: '<rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8v13M3 13h18"/>',
    device: '<rect x="5" y="2" width="14" height="20" rx="3"/><path d="M11 18h2"/>',
    check: '<path d="M5 12l5 5L20 7"/>'
  };
  const icon = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k] || ICON.star}</svg>`;

  /* =========================================================
     SERVICE DATA — one entry per page
     ========================================================= */
  const SERVICES = [
    {
      slug: 'hands-on-classes', icon: 'classes', title: 'Hands-On Classes', tag: 'Cooking Classes',
      lead: 'Cuisine-focused classes for Beginner, Intermediate and Advanced cooks — your own station, your own tools and a chef at your side from first chop to final plate.',
      hero: ['1606914501449-5a96b6ce24ca', 'cooking,class'], ctx: ['1600555379765-f82335a7b1b0', 'kitchen,station'],
      facts: [['clock', '2.5 – 4 hours'], ['users', 'Max 12 students'], ['star', 'From ₹2,999']],
      ctxTitle: 'Learn by doing, not by watching',
      ctx_p: ['Every class begins with tasting the finished dish so you know exactly what you are aiming for. The chef demonstrates each technique slowly, then you cook it yourself at your own counter.', 'Choose from six cuisines and three levels. Most students join for one class and stay for a whole series — our progress tracker in the student dashboard shows exactly how far you have come.'],
      stats: [['85', 'classes / month'], ['12', 'seats max'], ['4.9★', 'average rating']],
      included: ['Personal cooking station', 'All ingredients & tools', 'Apron to use', 'Printable recipe cards', 'Video replay access', 'Shared meal at the end'],
      whyTitle: 'Why students choose our classes',
      reasons: [['chef', 'Working chefs', 'Every class is led by a chef who cooks professionally — and loves to teach.'], ['users', 'Tiny groups', 'Twelve seats or fewer, so the chef reaches every counter many times.'], ['leaf', 'Seasonal produce', 'Ingredients from local farms, chosen the week of your class.'], ['play', 'Replays forever', 'Rewatch the demo in your dashboard whenever you cook it again.']],
      plans: [
        { name: 'Single Class', price: '2,999', unit: 'per class', note: 'Try any class once', feats: ['Any cuisine & level', 'Recipe cards & replay', 'Free cancellation 48 hrs'] },
        { name: '5-Class Pass', price: '13,499', unit: 'per 5 classes', note: 'Save 10% · valid 4 months', feats: ['Everything in Single', 'Priority seat booking', 'Share with a friend', 'Free knife-skills session'], featured: true },
        { name: 'Unlimited Month', price: '19,999', unit: 'per month', note: 'For the truly obsessed', feats: ['Unlimited regular classes', '20% off workshops', "Members-only chef's table"] }
      ],
      faqs: [['Do I need any experience?', 'No. Beginner classes assume you have never held a chef\'s knife. Intermediate and Advanced levels are clearly marked.'], ['What should I bring?', 'Just yourself and comfortable closed shoes. Everything else, including containers for leftovers, is provided.'], ['Can you cater for dietary needs?', 'Yes — add vegetarian, vegan or allergy notes when you book and the chef will prepare a version for you.'], ['What if I miss my class?', 'Cancel 48 hours ahead for a full credit, or send a friend in your place at no charge.']],
      cta: ['Your seat at the counter is waiting', 'New classes open every Monday. Seats are limited to twelve so everyone gets to cook.', 'Book a Class', 'classes.html#schedule']
    },
    {
      slug: 'private-chefs-table', icon: 'table', title: "Private Chef's Table", tag: 'Private Dining',
      lead: 'An intimate tasting menu cooked in front of you and your guests — ten courses, paired with the stories and techniques behind every plate.',
      hero: ['1608039829572-78524f79c4c7', 'fine,dining'], ctx: ['1586444248902-2f64eddc13df', 'chef,plating'],
      facts: [['clock', '4 hours'], ['users', '6 – 12 guests'], ['star', 'From ₹6,500 / guest']],
      ctxTitle: 'A restaurant evening, with a front-row seat',
      ctx_p: ['Your group gathers around the chef\'s counter while each course is cooked, plated and explained in front of you. Ask anything — the chef will even invite you to plate a course yourself.', 'Menus are designed around the season and your tastes. Tell us about allergies, favourite ingredients or a special occasion, and we will build the evening around it.'],
      stats: [['10', 'course menu'], ['12', 'guests max'], ['24', 'sold-out nights']],
      included: ['Ten-course tasting menu', 'Welcome drink', 'Chef-led storytelling', 'Plate-your-own course', 'Printed menu keepsake', 'Private use of the counter'],
      whyTitle: 'Why guests book the chef\'s table',
      reasons: [['star', 'Bespoke menus', 'Every evening is designed for your group, your tastes and your occasion.'], ['chef', 'Up close', 'Watch every technique from a metre away and ask the chef anything.'], ['heart', 'Made for moments', 'Anniversaries, proposals, milestone birthdays — we have hosted them all.'], ['shield', 'Fully private', 'The whole counter is yours for the evening; no other guests.']],
      plans: [
        { name: 'Tasting', price: '6,500', unit: 'per guest', note: 'Seven courses', feats: ['Seven-course menu', 'Welcome drink', 'Min. 6 guests'] },
        { name: 'Signature', price: '8,500', unit: 'per guest', note: 'Our most loved evening', feats: ['Ten-course menu', 'Plate-your-own course', 'Printed menu keepsake', 'Min. 6 guests'], featured: true },
        { name: 'Grand Celebration', price: '11,000', unit: 'per guest', note: 'For big occasions', feats: ['Ten courses + dessert table', 'Custom cake', 'Photographer for 1 hour'] }
      ],
      faqs: [['How far ahead should we book?', 'At least 10 days, so we can design the menu and source ingredients. Weekends book out 3–4 weeks ahead.'], ['Can we bring our own wine?', 'Yes — there is no corkage fee for up to one bottle per two guests.'], ['Can the menu be vegetarian?', 'Absolutely. We regularly host fully vegetarian and vegan tasting menus.'], ['Is there a minimum spend?', 'The counter is reserved for groups of six or more; smaller groups can book the Tasting menu for six.']],
      cta: ['Reserve your private evening', 'Tell us the date, group size and occasion — we will send a draft menu within 48 hours.', 'Request a Menu', 'mailto:hello@culinastudio.com?subject=Private%20Chef%27s%20Table']
    },
    {
      slug: 'corporate-team-cooking', icon: 'team', title: 'Corporate Team Cooking', tag: 'Team Building',
      lead: 'Friendly kitchen challenges that turn colleagues into a crew. Teams cook a three-course menu together, then sit down to a long-table lunch.',
      hero: ['1522071820081-009f0129c71c', 'team,work'], ctx: ['1528605248644-14dd04022da1', 'team,together'],
      facts: [['clock', '3 – 5 hours'], ['users', '10 – 40 guests'], ['star', 'From ₹3,200 / guest']],
      ctxTitle: 'Team building that people actually enjoy',
      ctx_p: ['Your group is split into small kitchen brigades, each responsible for one course. Chefs coach every team, and a little friendly competition does the rest.', 'We can add a cook-off with judging, a short leadership debrief or a dessert relay. Invoices, GST and dietary requirements are handled by our events team.'],
      stats: [['60+', 'companies hosted'], ['40', 'guests max'], ['3', 'course menu']],
      included: ['Event coordinator', 'Three-course team menu', 'Chef per 10 guests', 'Branded aprons option', 'Long-table lunch', 'GST invoice'],
      whyTitle: 'Why teams choose Culina Studio',
      reasons: [['users', 'Real collaboration', 'Every course needs planning, timing and communication — no slides required.'], ['clock', 'Fits your day', 'Morning, lunchtime or evening formats from three to five hours.'], ['shield', 'Hassle-free', 'One coordinator handles menus, dietary needs and invoicing.'], ['star', 'Proven results', '92% of teams rate it their best offsite activity of the year.']],
      plans: [
        { name: 'Team Lunch', price: '3,200', unit: 'per guest', note: '3 hours · 10+ guests', feats: ['Three-course team menu', 'Long-table lunch', 'Soft drinks'] },
        { name: 'Cook-Off', price: '4,200', unit: 'per guest', note: '4 hours · most popular', feats: ['Everything in Team Lunch', 'Judged cook-off', 'Trophies & photos', 'Branded aprons'], featured: true },
        { name: 'Full-Day Offsite', price: '5,900', unit: 'per guest', note: '5 hours + meeting room', feats: ['Everything in Cook-Off', 'Meeting room for 2 hrs', 'Coffee & snacks'] }
      ],
      faqs: [['What is the minimum group size?', 'Ten guests. For larger groups up to 40 we use all three teaching kitchens.'], ['Can we customise the menu?', 'Yes — choose a cuisine theme or ask for a menu inspired by your company or city.'], ['Do you provide GST invoices?', 'Yes, we provide GST-compliant invoices and can work with purchase orders.'], ['Can you come to our office?', 'For groups of 20+ we can run a pop-up cooking session at your venue; ask our events team.']],
      cta: ['Plan your team\'s best day this quarter', 'Share your date and headcount — we will send a tailored proposal and menu within one working day.', 'Get a Proposal', 'mailto:events@culinastudio.com?subject=Corporate%20Team%20Cooking']
    },
    {
      slug: 'kids-teens-camps', icon: 'kids', title: 'Kids & Teens Camps', tag: 'Holiday Camps',
      lead: 'Safe, playful five-day holiday camps where young cooks build real kitchen confidence, teamwork and a love of fresh food.',
      hero: ['1562565652-a0d8f0c59eb4', 'kids,food'], ctx: ['1625944525533-473f1a3d54e7', 'baking,fun'],
      facts: [['clock', '5 days · 10am – 2pm'], ['users', 'Ages 7 – 16'], ['star', 'From ₹8,999']],
      ctxTitle: 'Little hands, big confidence',
      ctx_p: ['Campers cook a full menu every day — from fresh pasta to bread, curries and desserts — using child-safe tools and techniques suited to their age group.', 'On the final day, families are invited for a showcase lunch cooked entirely by the campers. Every child goes home with an apron, a certificate and their own recipe book.'],
      stats: [['1:6', 'chef ratio'], ['5', 'days per camp'], ['900+', 'happy campers']],
      included: ['Daily hands-on cooking', 'Healthy lunch & snacks', 'Child-safe equipment', 'Camp apron & certificate', 'Recipe book to keep', 'Family showcase lunch'],
      whyTitle: 'Why parents trust our camps',
      reasons: [['shield', 'Safety first', 'Trained staff, child-safe knives and a 1:6 chef-to-child ratio throughout.'], ['heart', 'Healthy habits', 'Kids learn where food comes from and enjoy eating what they make.'], ['users', 'Age groups', 'Separate groups for 7–10, 11–13 and 14–16 so everyone is challenged.'], ['star', 'Skills for life', 'Measuring, timing and teamwork that carry on long after camp.']],
      plans: [
        { name: 'Mini Chefs', price: '8,999', unit: '5-day camp', note: 'Ages 7 – 10', feats: ['Half-day sessions', 'Lunch & snacks', 'Apron & certificate'] },
        { name: 'Junior Chefs', price: '9,999', unit: '5-day camp', note: 'Ages 11 – 13 · most booked', feats: ['Everything in Mini', 'Knife-skills module', 'Family showcase lunch', 'Recipe book'], featured: true },
        { name: 'Teen Masterchef', price: '11,499', unit: '5-day camp', note: 'Ages 14 – 16', feats: ['Advanced techniques', 'Mystery-box challenge', 'Plating & photography'] }
      ],
      faqs: [['Is it safe for younger children?', 'Yes. Ages 7–10 use child-safe knives and never handle hot oil; chefs supervise every station.'], ['What about allergies?', 'Share allergies when booking. We are nut-aware and prepare separate dishes where needed.'], ['Is there a sibling discount?', 'Yes — 10% off for the second child and every additional sibling.'], ['When do camps run?', 'During summer, Dussehra, Diwali and winter school holidays. Dates open three months ahead.']],
      cta: ['Give them a holiday they\'ll talk about all year', 'Camps fill quickly before school holidays. Reserve a place now and pay the balance a week before camp.', 'Reserve a Place', 'mailto:camps@culinastudio.com?subject=Kids%20Camp%20Booking']
    },
    {
      slug: 'celebration-parties', icon: 'party', title: 'Celebration Parties', tag: 'Parties & Events',
      lead: 'Birthdays, bridal showers and anniversaries hosted around a counter full of food, laughter and a lot of flour.',
      hero: ['1464366400600-7168b8af9bc3', 'party,celebration'], ctx: ['1511795409834-ef04bbd61622', 'celebration,table'],
      facts: [['clock', '3 hours'], ['users', '8 – 30 guests'], ['star', 'From ₹2,499 / guest']],
      ctxTitle: 'Your party, our kitchen, zero clean-up',
      ctx_p: ['Guests cook together — pizza tossing, cake decorating or a dumpling race — then sit down to enjoy everything they made. A host keeps the energy up while chefs handle the hard parts.', 'We take care of decorations, music, the cake and the clean-up. You simply turn up and celebrate.'],
      stats: [['140+', 'parties this year'], ['30', 'guests max'], ['0', 'dishes for you to wash']],
      included: ['Dedicated party host', 'Hands-on cooking activity', 'Party meal & drinks', 'Celebration cake', 'Simple decorations', 'Full clean-up'],
      whyTitle: 'Why hosts love our parties',
      reasons: [['heart', 'Truly memorable', 'Guests do something together instead of just eating together.'], ['gift', 'All-inclusive', 'Cake, decorations, music and clean-up are all part of the package.'], ['users', 'Every age', 'Menus for kids, teens and grown-ups — or a mix of all three.'], ['clock', 'Stress-free', 'One call to plan; we handle the rest on the day.']],
      plans: [
        { name: 'Classic Party', price: '2,499', unit: 'per guest', note: 'Min. 8 guests', feats: ['One cooking activity', 'Party meal & soft drinks', 'Simple decorations'] },
        { name: 'Deluxe Party', price: '3,299', unit: 'per guest', note: 'Our bestseller', feats: ['Two cooking activities', 'Celebration cake', 'Themed decorations', 'Party favours'], featured: true },
        { name: 'Grand Celebration', price: '4,499', unit: 'per guest', note: 'For milestone moments', feats: ['Everything in Deluxe', 'Photographer for 1 hr', 'Custom menu'] }
      ],
      faqs: [['How many guests can you host?', 'From 8 up to 30 guests in one kitchen; ask us about larger events across all three kitchens.'], ['Can we bring our own cake?', 'Of course — or let our pastry chef make one to match your theme.'], ['Are kids\' parties available?', 'Yes, from age 5 upward, with menus and activities designed for little ones.'], ['How do we confirm a date?', 'A 30% deposit secures your date; the balance is due 3 days before the party.']],
      cta: ['Let\'s plan something delicious', 'Pick a date, tell us the guest of honour and we\'ll handle the menu, cake, decorations and clean-up.', 'Plan My Party', 'mailto:parties@culinastudio.com?subject=Celebration%20Party']
    },
    {
      slug: 'recipe-library', icon: 'library', title: 'Recipe Library & Replays', tag: 'Online Learning',
      lead: 'Every recipe and class replay, organised in your student dashboard — so you can keep cooking long after class.',
      hero: ['1617196034796-73dfa7b1fd56', 'recipe,cooking'], ctx: ['1611143669185-af224c5e3252', 'recipe,dish'],
      facts: [['clock', 'Watch anytime'], ['device', 'Phone, tablet & laptop'], ['star', '₹499 / month']],
      ctxTitle: 'Your personal cookbook, always with you',
      ctx_p: ['Members get 400+ printable recipes and full-length class replays filmed in our studio, searchable by cuisine, level, ingredient and cooking time.', 'Save favourites, build weekly meal plans and generate a shopping list in one tap. Students who attend a class get that class\'s replay free for life.'],
      stats: [['400+', 'recipes'], ['180', 'video replays'], ['New', 'every week']],
      included: ['400+ printable recipes', 'Full class replays', 'Meal-plan builder', 'Smart shopping lists', 'Monthly live Q&A', 'Member discounts'],
      whyTitle: 'Why members love the library',
      reasons: [['play', 'Studio-quality video', 'Multi-angle filming so you see every chop, stir and fold.'], ['device', 'Cook anywhere', 'Works on any device, with a hands-free kitchen mode.'], ['leaf', 'Seasonal picks', 'Fresh recipes added every week, tuned to what\'s in season.'], ['star', 'Member perks', '10% off classes and early access to new workshops.']],
      plans: [
        { name: 'Monthly', price: '499', unit: 'per month', note: 'Cancel anytime', feats: ['Full recipe library', 'All class replays', 'Shopping lists'] },
        { name: 'Yearly', price: '4,499', unit: 'per year', note: 'Save 25%', feats: ['Everything in Monthly', 'Monthly live Q&A', '10% off all classes', 'Early workshop access'], featured: true },
        { name: 'Family', price: '6,999', unit: 'per year', note: 'Up to 4 profiles', feats: ['Everything in Yearly', '4 separate profiles', 'Kids recipe collection'] }
      ],
      faqs: [['Is there a free trial?', 'Yes — 7 days free. You will not be charged if you cancel before the trial ends.'], ['Can I download recipes?', 'Every recipe can be printed or saved as a PDF; videos stream online.'], ['Do class students get access?', 'Every class you attend unlocks that class\'s replay in your dashboard for free, forever.'], ['How do I cancel?', 'Cancel anytime from the Payments page of your student dashboard in two clicks.']],
      cta: ['Start cooking with 400+ recipes today', 'Try the full library free for 7 days. Cancel anytime from your dashboard.', 'Start Free Trial', 'index.html#dashboard']
    }
  ];

  /* ---------- Choose the service from the URL ---------- */
  const params = new URLSearchParams(window.location.search);
  let slug = params.get('service') || (window.location.hash || '').slice(1);
  if (!SERVICES.some((s) => s.slug === slug)) {
    try { slug = sessionStorage.getItem('culina-last-service') || SERVICES[0].slug; } catch (e) { slug = SERVICES[0].slug; }
    if (!SERVICES.some((s) => s.slug === slug)) slug = SERVICES[0].slug;
  }
  const index = SERVICES.findIndex((s) => s.slug === slug);
  const S = SERVICES[index];
  const url = (s) => `service-detail.html?service=${encodeURIComponent(s.slug)}`;

  /* ---------- Image fallback: Unsplash → LoremFlickr → Picsum ---------- */
  const seedFor = (str) => { let h = 31; for (const c of str) h = (h * 47 + c.charCodeAt(0)) >>> 0; return 700 + (h % 9000); };
  const setImg = (img, id, kw, w, alt) => {
    const src = unsplash(id, w);
    const seed = seedFor(src);
    const sources = [`https://loremflickr.com/1200/900/${encodeURIComponent(kw)}?lock=${seed}`, `https://picsum.photos/seed/culina-sd-${seed}/1200/900`];
    let step = 0;
    img.onerror = () => { if (step < sources.length) img.src = sources[step++]; };
    img.alt = alt;
    img.src = src;
  };

  /* =========================================================
     RENDER
     ========================================================= */
  document.title = `${S.title} — Culina Studio | Explore • Cook • Master`;
  const meta = $('meta[name="description"]');
  if (meta) meta.setAttribute('content', S.lead);

  // Hero
  setImg($('#sdHeroImg'), S.hero[0], S.hero[1], 1920, '');
  $('#sdNum').textContent = String(index + 1).padStart(2, '0');
  $('#sdTag').textContent = S.tag;
  $('#sdTitle').innerHTML = S.title.split(' ').map((w, i) => `<span class="w"><span style="--i:${i}">${esc(w)}</span></span>`).join(' ');
  $('#sdLead').textContent = S.lead;
  $('#sdFacts').innerHTML = S.facts.map(([ic, t]) => `<li>${icon(ic)}<span>${esc(t)}</span></li>`).join('');
  const prev = SERVICES[(index - 1 + SERVICES.length) % SERVICES.length];
  const next = SERVICES[(index + 1) % SERVICES.length];
  $('#sdPrev').href = url(prev); $('#sdPrevName').textContent = prev.title;
  $('#sdNext').href = url(next); $('#sdNextName').textContent = next.title;
  $('#sdTabs').innerHTML = SERVICES.map((s, i) =>
    `<a href="${url(s)}" class="sd-tab${i === index ? ' is-on' : ''}"${i === index ? ' aria-current="page"' : ''}>${icon(s.icon)}<span>${esc(s.title)}</span></a>`).join('');

  // Context
  setImg($('#sdCtxImg'), S.ctx[0], S.ctx[1], 1000, `${S.title} at Culina Studio`);
  $('#sdCtxTitle').textContent = S.ctxTitle;
  $('#sdCtxText').innerHTML = S.ctx_p.map((p) => `<p>${esc(p)}</p>`).join('');
  $('#sdStats').innerHTML = S.stats.map(([n, l]) => `<li><strong>${esc(n)}</strong><span>${esc(l)}</span></li>`).join('');
  $('#sdIncluded').innerHTML = S.included.map((t, i) => `<li style="--i:${i}">${icon('check')}<span>${esc(t)}</span></li>`).join('');

  // Why choose
  $('#sdWhyTitle').textContent = S.whyTitle;
  $('#sdReasons').innerHTML = S.reasons.map(([ic, t, d], i) =>
    `<article class="reason" data-sd="up" style="--stagger:${i}"><span class="reason-num">0${i + 1}</span><span class="reason-icon">${icon(ic)}</span><h3>${esc(t)}</h3><p>${esc(d)}</p></article>`).join('');

  // Pricing
  $('#sdPriceTitle').textContent = `${S.title} pricing`;
  $('#sdPlans').innerHTML = S.plans.map((p, i) => `
    <article class="plan${p.featured ? ' is-featured' : ''}" data-sd="up" style="--stagger:${i}">
      ${p.featured ? '<span class="plan-flag">Most popular</span>' : ''}
      <h3>${esc(p.name)}</h3>
      <p class="plan-note">${esc(p.note)}</p>
      <p class="plan-price"><span class="cur">₹</span><span class="amt">${esc(p.price)}</span><small>${esc(p.unit)}</small></p>
      <ul>${p.feats.map((f) => `<li>${icon('check')}<span>${esc(f)}</span></li>`).join('')}</ul>
      <a href="${esc(S.cta[3])}" class="btn ${p.featured ? 'btn-light' : 'btn-primary'}">Choose ${esc(p.name)}</a>
    </article>`).join('');

  // FAQs
  $('#sdFaqTitle').textContent = `Questions about ${S.title.toLowerCase()}`;
  $('#sdFaqs').innerHTML = S.faqs.map(([q, a], i) => `
    <div class="sd-faq-item${i === 0 ? ' is-open' : ''}">
      <button class="sd-faq-q" type="button" aria-expanded="${i === 0}" id="sdq${i}" aria-controls="sda${i}"><span>${esc(q)}</span><span class="sd-faq-icon" aria-hidden="true"></span></button>
      <div class="sd-faq-a" id="sda${i}" role="region" aria-labelledby="sdq${i}"><p>${esc(a)}</p></div>
    </div>`).join('');

  // CTA
  $('#sdCtaIcon').innerHTML = icon(S.icon);
  $('#sdCtaTitle').textContent = S.cta[0];
  $('#sdCtaText').textContent = S.cta[1];
  const ctaBtn = $('#sdCtaBtn');
  ctaBtn.textContent = S.cta[2];
  ctaBtn.href = S.cta[3];

  // Other services
  $('#sdMore').innerHTML = SERVICES.filter((s) => s.slug !== S.slug).map((s, i) => `
    <a href="${url(s)}" class="more-card" data-sd="up" style="--stagger:${i}">
      <span class="more-icon">${icon(s.icon)}</span>
      <strong>${esc(s.title)}</strong>
      <span class="more-tag">${esc(s.tag)}</span>
      <span class="more-arrow" aria-hidden="true">→</span>
    </a>`).join('');

  /* =========================================================
     SHARED BEHAVIOUR (theme, direction, header, menu)
     ========================================================= */
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

  const header = $('#header'), toTop = $('#toTop');
  const nav = $('#nav'), menuBtn = $('#menuToggle'), backdrop = $('#navBackdrop');
  const heroMedia = $('.sd-hero-media');
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 40);
    toTop.classList.toggle('show', y > 700);
    if (!reduceMotion && y < window.innerHeight) heroMedia.style.transform = `translateY(${(y * 0.3).toFixed(1)}px) scale(1.08)`;
  };
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
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) setMenu(false);
    // keyboard shortcuts to move between the six service pages
    if (e.target.closest('input, textarea, select')) return;
    if (e.altKey && e.key === 'ArrowRight') window.location.href = url(isRtl() ? prev : next);
    if (e.altKey && e.key === 'ArrowLeft') window.location.href = url(isRtl() ? next : prev);
  });
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

  /* ---------- Page-specific behaviour ---------- */
  // Reveal on scroll (runs after rendering so new elements are included)
  const reveal = new IntersectionObserver((entries, obs) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add('sd-on');
      setTimeout(() => en.target.style.setProperty('--stagger', 0), 1300);
      obs.unobserve(en.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('[data-sd]').forEach((el) => reveal.observe(el));

  // "What's included" chips pop in one by one
  const incl = $('#sdIncluded');
  new IntersectionObserver((en, obs) => { if (en[0].isIntersecting) { incl.classList.add('pop'); obs.disconnect(); } }, { threshold: 0.4 }).observe(incl);

  // Stats count up where the value is numeric
  $$('#sdStats strong').forEach((el) => {
    const m = el.textContent.match(/^(\d+)(.*)$/);
    if (!m || reduceMotion) return;
    const to = +m[1], suffix = m[2];
    el.textContent = '0' + suffix;
    new IntersectionObserver((en, obs) => {
      if (!en[0].isIntersecting) return; obs.disconnect();
      const t0 = performance.now();
      const step = (now) => {
        const p = Math.min((now - t0) / 1500, 1);
        el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.6 }).observe(el);
  });

  // FAQ accordion
  const faqItems = $$('.sd-faq-item');
  faqItems.forEach((item) => {
    $('.sd-faq-q', item).addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      faqItems.forEach((o) => { o.classList.remove('is-open'); $('.sd-faq-q', o).setAttribute('aria-expanded', 'false'); });
      if (open) { item.classList.add('is-open'); $('.sd-faq-q', item).setAttribute('aria-expanded', 'true'); }
    });
  });

  // Pricing cards: spotlight follows the cursor
  $$('.plan').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--px', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      card.style.setProperty('--py', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    });
  });

  // Footer year
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();