/* White Land ordering front-end.
   Menu data: live Beepit endpoint first, bundled snapshot as fallback.
   Cart is local (localStorage); checkout hands off to Beepit. */
(() => {
  'use strict';
  const BEEP = 'https://whiteland.beepit.com';
  const ORDER_URL = BEEP + '/ordering/?type=';
  const MIN_ORDER = 35;
  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const rm = n => 'RM ' + Number(n).toFixed(2);
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };

  const state = { cats: [], products: new Map(), mode: store.get('wl.mode', 'delivery'), cart: store.get('wl.cart', []), q: '', active: 'all', degraded: false,
    view: store.get('wl.view', 'book'), bookCat: '', bi: 0, sel: {}, qty: 1 };

  /* ---------- data ---------- */
  function normLive(list) {
    return list.map(c => ({
      id: c.id, name: (c.name || '').trim(), best: !!c.isBestSeller, enabled: c.isEnabled !== false,
      products: (c.products || []).map(p => ({
        id: p.id, title: p.title, price: p.displayPrice, was: p.originalDisplayPrice, img: (p.images || [])[0] || '',
        out: !!p.markedSoldOut || (p.stockStatus && p.stockStatus !== 'inStock'), featured: !!p.isFeaturedProduct,
        desc: p.descriptionPlainText || p.description || '',
        vars: (p.variations || []).map(v => ({ id: v.id, name: v.name, type: v.variationType, min: v.minSelectionAmount, max: v.maxSelectionAmount,
          opts: (v.optionValues || []).map(o => ({ id: o.id, label: o.value, out: !!o.markedSoldOut })) }))
      }))
    }));
  }
  function normSnap(arr) {
    return arr.map(c => ({
      id: c[0], name: c[1].trim(), best: c[2], enabled: c[3],
      products: c[4].map(p => ({ id: p[0], title: p[1], price: p[2], was: p[3], img: p[4], out: p[5], featured: p[6], desc: p[7],
        vars: p[8].map((v, i) => ({ id: p[0] + ':' + i, name: v[0], type: v[1], min: v[2], max: v[3], opts: v[4].map(o => ({ id: o[0], label: o[1], out: o[2] })) })) }))
    }));
  }
  async function loadMenu() {
    try {
      const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 4000);
      const r = await fetch(BEEP + '/api/gql/OnlineCategory', { method: 'POST', signal: ctl.signal, headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ operationName: 'OnlineCategory', query: 'query OnlineCategory($business:String!){onlineCategory(business:$business){id}}', variables: { business: 'whiteland' } }) });
      clearTimeout(t);
      const j = await r.json();
      if (!j?.data?.onlineCategory?.length) throw 0;
      return normLive(j.data.onlineCategory);
    } catch {
      state.degraded = true;
      const r = await fetch('data/menu.snapshot.json');
      return normSnap((await r.json()).categories);
    }
  }

  /* ---------- helpers ---------- */
  const labelFor = (p, cat) => (cat?.best || p.featured) ? 'Best Seller' : (cat && /must try/i.test(cat.name) ? 'Must Try' : '');
  const optsText = p => p.vars.length ? p.vars.map(v => v.name.toLowerCase()).join(' · ') : '';
  const thumb = p => p.img
    ? `<img src="${esc(p.img)}" alt="${esc(p.title)}" loading="lazy" decoding="async" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'ph',textContent:'WL'}))">`
    : `<div class="ph" aria-hidden="true">WL</div>`;

  function card(p, cat) {
    const tag = labelFor(p, cat);
    const needsModal = p.vars.length > 0;
    return `<article class="card${p.out ? ' out' : ''}" data-id="${p.id}">
      <button class="thumb" data-open="${p.id}" aria-label="View ${esc(p.title)}" tabindex="-1">${thumb(p)}${tag ? `<span class="tag${tag === 'Must Try' ? ' alt' : ''}">${tag}</span>` : ''}</button>
      <div class="info">
        <button class="name" data-open="${p.id}">${esc(p.title)}</button>
        ${p.desc ? `<p class="desc">${esc(p.desc)}</p>` : ''}
        ${needsModal ? `<span class="opts">${esc(optsText(p))}</span>` : ''}
        <div class="row">
          <span class="price">${p.was && p.was > p.price ? `<s>${rm(p.was)}</s>` : ''}${rm(p.price)}</span>
          ${p.out ? `<button class="add" disabled>Sold out</button>` : `<button class="add" data-add="${p.id}" aria-label="${needsModal ? 'Choose options for' : 'Add'} ${esc(p.title)}">+</button>`}
        </div></div></article>`;
  }

  /* ---------- render menu ---------- */
  function renderCats() {
    const nav = $('#cats');
    nav.innerHTML = [['all', 'All Items'], ...state.cats.map(c => [c.id, c.name])]
      .map(([id, n]) => { const c = state.cats.find(x => x.id === id); return `<button class="cat" data-cat="${id}" aria-current="${id === state.active}">${esc(n)}${c ? `<sup>${c.products.length}</sup>` : ''}</button>`; }).join('');
  }
  /* ---------- book view ---------- */
  function bookList() {
    if (state.q) {
      const q = state.q.toLowerCase(), seen = new Set(), out = [];
      state.cats.forEach(cat => cat.products.forEach(p => { if (!seen.has(p.id) && p.title.toLowerCase().includes(q)) { seen.add(p.id); out.push([p, cat]); } }));
      return out;
    }
    if (state.bookCat === 'all') { const seen = new Set(), out = []; state.cats.forEach(cat => cat.products.forEach(p => { if (!seen.has(p.id)) { seen.add(p.id); out.push([p, cat]); } })); return out; }
    const cat = state.cats.find(c => c.id === state.bookCat) || state.cats[0];
    return cat.products.map(p => [p, cat]);
  }
  /* ---- Book: pages are real DOM nodes turned by the page-flip engine (vendor/page-flip.browser.js),
          the same engine @vuvandinh203/react-flipbook wraps. Product i = page 2i (photo) + page 2i+1 (details). ---- */
  let pf = null, bookKey = '';
  const cur = () => document.querySelector(`.pf-r[data-i="${state.bi}"]`);
  const defaultSel = p => { const sel = {}; p.vars.forEach(v => { sel[v.id] = []; if (v.type === 'SingleChoice') { const f = v.opts.find(o => !o.out); if (f) sel[v.id] = [f.id]; } }); return sel; };
  function resetPage() { state.qty = 1; const [p] = bookList()[state.bi] || []; state.sel = p ? defaultSel(p) : {}; }
  function detailHTML(p, i) {
    const sel = defaultSel(p);
    return `<div class="d-in"><div class="d-k">${p.out ? 'Currently unavailable' : 'Details'}</div><h2>${esc(p.title)}</h2>
      <div class="price big">${p.was && p.was > p.price ? `<s>${rm(p.was)}</s>` : ''}${rm(p.price)}</div>
      ${p.desc ? `<p class="d-desc">${esc(p.desc)}</p>` : ''}
      ${p.vars.map(v => { const single = v.type === 'SingleChoice'; return `<div class="grp" role="${single ? 'radiogroup' : 'group'}" aria-label="${esc(v.name)}"><div class="lg">${esc(v.name)}<em>${single ? 'Choose 1' : (v.max ? `Up to ${v.max}` : 'Optional')}</em></div>
        ${v.opts.map(o => { const on = sel[v.id].includes(o.id); return `<button type="button" class="opt${on ? ' on' : ''}${o.out ? ' so' : ''}" role="${single ? 'radio' : 'checkbox'}" aria-checked="${on}" data-opt="${v.id}|${o.id}" ${o.out ? 'disabled' : ''}><span class="ck${single ? '' : ' sq'}"></span><span>${esc(o.label)}</span>${o.out ? '<span class="em">Sold out</span>' : ''}</button>`; }).join('')}</div>`; }).join('')}
      <div class="err b-err" role="alert"></div>
      <div class="d-act"><div class="qty"><button type="button" data-bq="-1" aria-label="Decrease quantity">−</button><span class="b-qty" aria-live="polite">1</span><button type="button" data-bq="1" aria-label="Increase quantity">+</button></div>
      <span class="d-total b-tot">${rm(p.price)}</span></div>
      <div class="d-btns"><button type="button" class="cta ghost" data-badd ${p.out ? 'disabled' : ''}>Add to cart</button><button type="button" class="cta" data-bnow ${p.out ? 'disabled' : ''}>Get now</button></div>
      <div class="folio">— ${i + 1} —</div></div>`;
  }
  function leftHTML(p, cat) {
    const tag = labelFor(p, cat);
    return `<div class="l-img">${p.img ? `<img data-src="${esc(p.img)}" alt="${esc(p.title)}" decoding="async">` : '<div class="ph" aria-hidden="true">WL</div>'}</div>${tag ? `<span class="tag${tag === 'Must Try' ? ' alt' : ''}">${tag}</span>` : ''}<div class="l-cap"><span>${esc(cat.name)}</span><strong>${esc(p.title)}</strong></div>`;
  }
  const bookTitle = (cat) => state.q ? `Results for “${state.q}”` : (state.bookCat === 'all' ? 'All Items' : cat.name);
  // load photos only for the pages near the reader so 20+ big images don't all download at once
  function hydrate() {
    document.querySelectorAll('.pf-l img[data-src]').forEach(im => {
      const i = +im.closest('.pf-l').dataset.i;
      if (i >= state.bi - 1 && i <= state.bi + 2) { const s = im.dataset.src; im.removeAttribute('data-src'); im.onerror = () => im.replaceWith(Object.assign(document.createElement('div'), { className: 'ph', textContent: 'WL' })); im.src = s; }
    });
  }
  function chrome() {
    const list = bookList(); if (!list.length || !$('#book')) return;
    const [p, cat] = list[state.bi];
    $('#bHead').textContent = bookTitle(cat); $('#bCount').textContent = `Page ${state.bi + 1} / ${list.length}`;
    $('#status').textContent = `${bookTitle(cat)}, page ${state.bi + 1} of ${list.length}: ${p.title}`;
    document.querySelectorAll('#thumbs .th').forEach((b, i) => { b.classList.toggle('on', i === state.bi); b.setAttribute('aria-current', i === state.bi); });
    $('#thumbs .on')?.scrollIntoView({ inline: 'center', block: 'nearest' });
    // phones show one page at a time (photo, then details), so the arrows step by page there
    const idx = pf ? pf.getCurrentPageIndex() : state.bi * 2, last = pf ? pf.getPageCount() - (pf.getOrientation() === 'portrait' ? 1 : 2) : list.length * 2 - 2;
    document.querySelector('[data-bgo="-1"]').disabled = idx <= 0;
    document.querySelector('[data-bgo="1"]').disabled = idx >= last;
    hydrate();
  }
  function onFlip(idx) { const i = Math.floor(idx / 2); if (i !== state.bi) { state.bi = i; resetPage(); } chrome(); }
  function destroyBook() { try { pf?.destroy(); } catch {} pf = null; bookKey = ''; }
  function renderBook() {
    const list = bookList(), c = $('#content'); io?.disconnect();
    const key = state.q + '|' + state.bookCat;
    if (!list.length) { destroyBook(); c.innerHTML = `<div class="empty"><h3>Nothing matches “${esc(state.q)}”</h3><p>Check the spelling or <button class="link" id="clr2">clear the search</button> to see the full menu.</p></div>`; return; }
    state.bi = Math.max(0, Math.min(state.bi, list.length - 1));
    if (pf && $('#book') && key === bookKey) {            // same chapter: just turn to the requested page
      if (Math.floor(pf.getCurrentPageIndex() / 2) !== state.bi) bookTo(state.bi); else chrome();
      return;
    }
    destroyBook();
    c.innerHTML = `<div class="book" id="book"><div class="b-head"><h2 id="bHead"></h2><span id="bCount"></span></div>
      <div class="fb" id="flip">${list.map(([p, cat], i) => `<div class="pf-page pf-l" data-i="${i}" data-density="soft">${leftHTML(p, cat)}</div><div class="pf-page pf-r" data-i="${i}" data-density="soft">${detailHTML(p, i)}</div>`).join('')}</div>
      <div class="b-nav"><button class="arrow" data-bgo="-1" aria-label="Previous page">←</button><div class="thumbs" id="thumbs" role="tablist">${list.map(([q], i) => `<button class="th" data-bto="${i}" aria-label="${esc(q.title)}" title="${esc(q.title)}">${q.img ? `<img src="${esc(q.img)}" alt="" loading="lazy">` : '<span>WL</span>'}</button>`).join('')}</div><button class="arrow" data-bgo="1" aria-label="Next page">→</button></div>
      <p class="b-hint"><span class="h-kb">Drag a page corner, use the arrows, or press ← →</span><span class="h-touch">Swipe or drag the page to turn it</span></p></div>`;
    bookKey = key; resetPage();
    if (typeof St === 'undefined') { $('#flip').classList.add('nolib'); chrome(); return; }
    pf = new St.PageFlip($('#flip'), { width: 460, height: 600, size: 'stretch', minWidth: 230, maxWidth: 780, minHeight: 320, maxHeight: 1000,
      maxShadowOpacity: .45, showCover: false, flippingTime: 1100, usePortrait: true, startPage: state.bi * 2, drawShadow: true,
      mobileScrollSupport: true, swipeDistance: 30, clickEventForward: true, useMouseEvents: true, showPageCorners: true, disableFlipByClick: true, autoSize: true });
    pf.loadFromHTML(document.querySelectorAll('#flip .pf-page'));
    pf.on('flip', e => onFlip(e.data));
    pf.on('changeOrientation', () => chrome());
    chrome();
  }
  // Clicking a page must not turn it (people tap options), so click-to-flip is off. The engine's own
  // flipPrev/flip(page) are rejected while it is off, so lift the guard only for the instant of the call.
  function withFlip(fn) { const s = pf.getSettings(); const was = s.disableFlipByClick; s.disableFlipByClick = false; try { fn(); } finally { s.disableFlipByClick = was; } }
  function bookGo(d) { if (!pf) return; withFlip(() => d > 0 ? pf.flipNext('bottom') : pf.flipPrev('bottom')); }
  function bookTo(i) { if (!pf || i === state.bi) return; withFlip(() => pf.flip(i * 2, 'bottom')); }
  function bookAdd(now) {
    const r = cur(); const [p] = bookList()[state.bi] || []; if (!p || p.out || !r) return;
    const bad = p.vars.find(v => v.min > 0 && (state.sel[v.id] || []).length < v.min);
    if (bad) { r.querySelector('.b-err').textContent = `Please choose an option for ${bad.name}.`; return; }
    addLine(p, state.sel, state.qty);
    if (now) { lastFocus = document.activeElement; openSheet(); return; }
    const b = r.querySelector('[data-badd]'); if (b) { b.classList.add('done'); b.textContent = 'Added ✓'; setTimeout(() => { b.classList.remove('done'); b.textContent = 'Add to cart'; }, 1400); }
  }
  function bookOpt(el) {
    const r = cur(); const [p] = bookList()[state.bi]; const [vid, oid] = el.dataset.opt.split('|'); const v = p.vars.find(x => x.id === vid);
    if (v.type === 'SingleChoice') state.sel[vid] = [oid];
    else { const s = new Set(state.sel[vid]); s.has(oid) ? s.delete(oid) : s.add(oid); if (v.max && s.size > v.max) s.delete(oid); state.sel[vid] = [...s]; }
    r.querySelectorAll(`[data-opt^="${vid}|"]`).forEach(b => { const on = state.sel[vid].includes(b.dataset.opt.split('|')[1]); b.classList.toggle('on', on); b.setAttribute('aria-checked', on); });
    r.querySelector('.b-err').textContent = '';
  }

  function renderMenu() {
    if (state.view === 'book') return renderBook();
    const c = $('#content');
    if (state.q) {
      const q = state.q.toLowerCase();
      const seen = new Set(); const hits = [];
      state.cats.forEach(cat => cat.products.forEach(p => { if (!seen.has(p.id) && p.title.toLowerCase().includes(q)) { seen.add(p.id); hits.push([p, cat]); } }));
      $('#status').textContent = `${hits.length} result${hits.length === 1 ? '' : 's'} for ${state.q}`;
      c.innerHTML = hits.length
        ? `<section class="section"><h2>Results</h2><div class="n">${hits.length} item${hits.length === 1 ? '' : 's'} matching “${esc(state.q)}”</div><div class="grid">${hits.map(([p, cat]) => card(p, cat)).join('')}</div></section>`
        : `<div class="empty"><h3>Nothing matches “${esc(state.q)}”</h3><p>Check the spelling or <button class="link" id="clr2">clear the search</button> to see the full menu.</p></div>`;
      return;
    }
    c.innerHTML = (state.degraded ? `<div class="banner">Showing the last saved menu. Live availability couldn’t be loaded in this view; prices are confirmed at checkout on Beepit.</div>` : '') +
      state.cats.map(cat => `<section class="section" id="cat-${cat.id}" data-sec="${cat.id}"><h2>${esc(cat.name)}</h2><div class="n">${cat.products.length} item${cat.products.length === 1 ? '' : 's'}</div><div class="grid">${cat.products.map(p => card(p, cat)).join('')}</div></section>`).join('');
    observe();
  }
  function skeleton() {
    $('#content').innerHTML = `<section class="section"><div class="sk" style="height:30px;width:220px;margin-bottom:20px"></div><div class="grid">${Array.from({ length: 8 }, () => `<div><div class="sk" style="aspect-ratio:4/5"></div><div class="sk" style="height:14px;margin-top:10px;width:80%"></div><div class="sk" style="height:14px;margin-top:8px;width:30%"></div></div>`).join('')}</div></section>`;
  }

  /* ---------- scrollspy ---------- */
  let io;
  function observe() {
    io?.disconnect();
    io = new IntersectionObserver(es => {
      if (lockSpy) return;
      const v = es.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (v) setActive(v.target.dataset.sec);
    }, { rootMargin: '-110px 0px -65% 0px' });
    document.querySelectorAll('[data-sec]').forEach(s => io.observe(s));
  }
  let lockSpy = false;
  function setActive(id) {
    if (state.active === id) return; state.active = id;
    document.querySelectorAll('.cat').forEach(b => { const on = b.dataset.cat === id; b.setAttribute('aria-current', on); if (on) b.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' }); });
  }
  let lastQ = '';
  function setView(v) {
    state.view = v; store.set('wl.view', v);
    document.querySelectorAll('.vw').forEach(b => b.setAttribute('aria-pressed', b.dataset.view === v));
    destroyBook(); $('#content').innerHTML = ''; state.bi = 0; resetPage();
    if (v === 'book') { state.active = ''; setActive(state.bookCat); } else { state.active = ''; setActive('all'); }
    renderMenu(); window.scrollTo({ top: 0 });
  }
  function goCat(id) {
    if (state.view === 'book') {
      if (state.q) { state.q = ''; $('#q').value = ''; $('#qClear').hidden = true; $('#content').innerHTML = ''; }
      const dir = id === state.bookCat ? 0 : 1;
      state.bookCat = id; state.bi = 0; state.active = ''; setActive(id); resetPage(); renderBook(dir);
      return window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (state.q) { setQuery(''); }
    lockSpy = true; state.active = ''; setActive(id);
    if (id === 'all') window.scrollTo({ top: 0, behavior: 'smooth' });
    else document.getElementById('cat-' + id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => lockSpy = false, 700);
  }
  function setQuery(v) {
    state.q = v.trim(); $('#q').value = v; $('#qClear').hidden = !v; state.bi = 0; resetPage(); renderMenu();
    if (!state.q) { state.active = ''; setActive(state.view === 'book' ? state.bookCat : 'all'); }
  }

  /* ---------- cart ---------- */
  const total = () => state.cart.reduce((s, l) => s + l.price * l.qty, 0);
  const count = () => state.cart.reduce((s, l) => s + l.qty, 0);
  function saveCart() { store.set('wl.cart', state.cart); renderCart(); }
  function addLine(p, sel, qty) {
    const key = p.id + '|' + Object.values(sel).flat().sort().join(',');
    const ex = state.cart.find(l => l.key === key);
    if (ex) ex.qty += qty;
    else state.cart.push({ key, id: p.id, title: p.title, price: p.price, qty, img: p.img,
      choices: p.vars.flatMap(v => (sel[v.id] || []).map(oid => v.opts.find(o => o.id === oid)?.label).filter(Boolean)) });
    saveCart();
    toast(`${p.title} added to cart`, 'View cart');
    const cb = $('#cartCount'); cb.classList.remove('bump'); void cb.offsetWidth; cb.classList.add('bump');
    const el = document.querySelector(`.card[data-id="${p.id}"]`); el?.classList.remove('pulse'); void el?.offsetWidth; el?.classList.add('pulse');
  }
  function cartHTML(sheet) {
    const t = total(), n = count(), short = Math.max(0, MIN_ORDER - t), ok = t >= MIN_ORDER;
    if (!n) {
      const sug = [...state.products.values()].filter(p => !p.out && (p.featured || p.img)).slice(0, 3);
      return `<div class="cart-in"><div class="cart-h"><h3>Your order</h3>${sheet ? '<button data-close aria-label="Close cart">×</button>' : ''}</div><div class="cart-empty"><div class="ce-ico" aria-hidden="true">☕</div><h4>Your cart is empty</h4><p>Pick something from the menu, or start with a favourite:</p>
        ${sug.map(p => `<button class="sug" data-sug="${p.id}">${p.img ? `<img src="${esc(p.img)}" alt="" loading="lazy">` : ''}<span>${esc(p.title)}<em>${rm(p.price)}</em></span><b>+</b></button>`).join('')}
        <p class="ce-min">Minimum order ${rm(MIN_ORDER)}</p></div></div>`;
    }
    return `<div class="cart-in"><div class="cart-h"><h3>Your order</h3>${sheet ? '<button data-close aria-label="Close cart">×</button>' : ''}</div>
      <div class="lines">${state.cart.map((l, i) => `<div class="line">${l.img ? `<img class="l-th" src="${esc(l.img)}" alt="" loading="lazy">` : '<div class="l-th ph2">WL</div>'}<span class="l-name">${esc(l.title)}</span><span class="l-price">${rm(l.price * l.qty)}</span>
        ${l.choices.length ? `<span class="l-sub">${esc(l.choices.join(', '))}</span>` : ''}
        <div class="l-qty"><div class="qty"><button data-dec="${i}" aria-label="Decrease quantity of ${esc(l.title)}">−</button><span aria-live="polite">${l.qty}</span><button data-inc="${i}" aria-label="Increase quantity of ${esc(l.title)}">+</button></div><button class="l-rm" data-rm="${i}">Remove</button></div></div>`).join('')}</div>
      <div class="cart-f"><div class="sub"><span>${n} item${n > 1 ? 's' : ''}</span><span></span></div><div class="tot"><span>Subtotal</span><span>${rm(t)}</span></div>
        <div class="min${ok ? ' ok' : ''}">${ok ? 'Minimum order met' : `Add ${rm(short)} more to reach the ${rm(MIN_ORDER)} minimum`}<div class="bar"><i style="width:${Math.min(100, t / MIN_ORDER * 100)}%"></i></div></div>
        <button class="cta" data-checkout ${ok ? '' : 'disabled'}>Continue to checkout</button>
        <p class="note">Delivery fee, time slot and payment are confirmed on Beepit.</p></div></div>`;
  }
  function renderCart() {
    const n = count();
    $('#cartPanel').innerHTML = cartHTML(false);
    if (!$('#cartSheet').hidden) $('#cartSheet').innerHTML = cartHTML(true);
    const b = $('#cartCount'); b.hidden = !n; b.textContent = n;
    $('#mobileBar').hidden = !n; $('#mbCount').textContent = n; $('#mbTotal').textContent = rm(total());
  }
  function openSheet() { $('#cartSheet').hidden = false; $('#scrim').hidden = false; $('#scrim').className = 'scrim for-sheet'; $('#cartSheet').innerHTML = cartHTML(true); $('#cartSheet').querySelector('button')?.focus(); }
  function closeAll() { ['#cartSheet', '#scrim', '#modal'].forEach(s => $(s).hidden = true); document.body.style.overflow = ''; lastFocus?.focus?.(); }
  let lastFocus;
  function checkout() {
    if (total() < MIN_ORDER) return;
    window.open(ORDER_URL + state.mode, '_blank', 'noopener');
  }

  /* ---------- product modal ---------- */
  function openModal(id) {
    const p = state.products.get(id); if (!p) return;
    lastFocus = document.activeElement;
    const sel = {}; let qty = 1;
    p.vars.forEach(v => { sel[v.id] = []; if (v.type === 'SingleChoice') { const f = v.opts.find(o => !o.out); if (f) sel[v.id] = [f.id]; } });
    const m = $('#modal');
    const draw = () => {
      m.innerHTML = `<div class="m-img">${thumb(p)}<button class="m-x" data-close aria-label="Close">×</button></div>
        <div class="m-body"><h2 id="mTitle">${esc(p.title)}</h2><div class="price">${rm(p.price)}</div>${p.desc ? `<p>${esc(p.desc)}</p>` : ''}
        ${p.vars.map(v => { const single = v.type === 'SingleChoice'; return `<fieldset data-v="${v.id}"><legend>${esc(v.name)}<em>${single ? 'Choose 1' : (v.max ? `Up to ${v.max}` : 'Optional')}</em></legend>
          ${v.opts.map(o => `<label class="opt${o.out ? ' so' : ''}"><input type="${single ? 'radio' : 'checkbox'}" name="${v.id}" value="${o.id}" ${sel[v.id].includes(o.id) ? 'checked' : ''} ${o.out ? 'disabled' : ''}><span>${esc(o.label)}</span>${o.out ? '<span class="em">Sold out</span>' : ''}</label>`).join('')}</fieldset>`; }).join('')}
        <div class="err" id="mErr" role="alert"></div></div>
        <div class="m-foot"><div class="qty"><button data-q="-1" aria-label="Decrease quantity">−</button><span aria-live="polite">${qty}</span><button data-q="1" aria-label="Increase quantity">+</button></div>
        <button class="cta" data-confirm>Add to cart · ${rm(p.price * qty)}</button></div>`;
    };
    draw(); m.hidden = false; $('#scrim').hidden = false; $('#scrim').className = 'scrim'; document.body.style.overflow = 'hidden';
    m.onchange = e => {
      const f = e.target.closest('fieldset'); if (!f) return; const v = p.vars.find(x => x.id === f.dataset.v);
      if (v.type === 'SingleChoice') sel[v.id] = [e.target.value];
      else { const s = new Set(sel[v.id]); e.target.checked ? s.add(e.target.value) : s.delete(e.target.value); if (v.max && s.size > v.max) { s.delete(e.target.value); e.target.checked = false; } sel[v.id] = [...s]; }
    };
    m.onclick = e => {
      if (e.target.closest('[data-close]')) return closeAll();
      const q = e.target.closest('[data-q]');
      if (q) { qty = Math.max(1, Math.min(99, qty + +q.dataset.q)); m.querySelector('.qty span').textContent = qty; m.querySelector('[data-confirm]').textContent = `Add to cart · ${rm(p.price * qty)}`; }
      if (e.target.closest('[data-confirm]')) {
        const bad = p.vars.find(v => v.min > 0 && sel[v.id].length < v.min);
        if (bad) { $('#mErr').textContent = `Please choose an option for ${bad.name}.`; return; }
        addLine(p, sel, qty); closeAll();
      }
    };
    m.querySelector('input:checked, input, .m-x')?.focus();
  }

  /* ---------- misc ---------- */
  let tt; function toast(msg, action) {
    const t = $('#toast'); t.innerHTML = `<span>✓ ${esc(msg)}</span>${action ? `<button data-toastcart>${esc(action)}</button>` : ''}`;
    t.classList.add('on'); t.style.pointerEvents = action ? 'auto' : 'none'; clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 3200);
  }
  function setMode(m) {
    state.mode = m; store.set('wl.mode', m);
    document.querySelectorAll('.mode').forEach(b => b.setAttribute('aria-pressed', b.dataset.mode === m));
    ['chipStore', 'chipLoc', 'chipTime'].forEach(id => $('#' + id).href = ORDER_URL + m);
    $('#chipLoc').style.display = m === 'delivery' ? '' : 'none';
  }

  /* ---------- wire up ---------- */
  document.addEventListener('click', e => {
    const t = e.target;
    let el;
    if ((el = t.closest('[data-cat]'))) return goCat(el.dataset.cat);
    if (t.closest('[data-toastcart]')) { $('#toast').classList.remove('on'); lastFocus = document.activeElement; if (matchMedia('(min-width:1100px)').matches) return $('#cartPanel').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); return openSheet(); }
    if ((el = t.closest('[data-sug]'))) {
      const p = state.products.get(el.dataset.sug);
      if (!p.vars.length) return addLine(p, {}, 1);
      const cat = state.cats.find(c => c.products.some(x => x.id === p.id));
      if (state.view !== 'book') { return openModal(p.id); }
      closeAll(); state.q = ''; $('#q').value = ''; $('#qClear').hidden = true; state.bookCat = cat.id; state.bi = cat.products.findIndex(x => x.id === p.id); state.active = ''; setActive(cat.id); resetPage(); renderBook(1); return window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if ((el = t.closest('[data-bgo]'))) return bookGo(+el.dataset.bgo);
    if ((el = t.closest('[data-bto]'))) return bookTo(+el.dataset.bto);
    if ((el = t.closest('[data-bq]'))) { state.qty = Math.max(1, Math.min(99, state.qty + +el.dataset.bq)); const [p] = bookList()[state.bi]; const r = cur(); r.querySelector('.b-qty').textContent = state.qty; r.querySelector('.b-tot').textContent = rm(p.price * state.qty); return; }
    if ((el = t.closest('[data-opt]'))) return bookOpt(el);
    if (t.closest('[data-badd]')) return bookAdd(false);
    if (t.closest('[data-bnow]')) return bookAdd(true);
    if ((el = t.closest('.vw'))) return setView(el.dataset.view);
    if ((el = t.closest('[data-open]'))) { return openModal(el.dataset.open); }
    if ((el = t.closest('[data-add]'))) {
      const p = state.products.get(el.dataset.add);
      return p.vars.length ? openModal(p.id) : addLine(p, {}, 1);
    }
    if ((el = t.closest('[data-inc]'))) { state.cart[+el.dataset.inc].qty++; return saveCart(); }
    if ((el = t.closest('[data-dec]'))) { const l = state.cart[+el.dataset.dec]; l.qty > 1 ? l.qty-- : state.cart.splice(+el.dataset.dec, 1); return saveCart(); }
    if ((el = t.closest('[data-rm]'))) { state.cart.splice(+el.dataset.rm, 1); return saveCart(); }
    if (t.closest('[data-checkout]')) return checkout();
    if (t.closest('#cartOpen, #mobileCart')) { lastFocus = document.activeElement; return openSheet(); }
    if (t.closest('#scrim') || (t.closest('[data-close]') && t.closest('#cartSheet'))) return closeAll();
    if (t.id === 'clr2') return setQuery('');
    if ((el = t.closest('.mode'))) return setMode(el.dataset.mode);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAll();
    if (state.view === 'book' && $('#book') && $('#modal').hidden && $('#cartSheet').hidden && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) {
      if (e.key === 'ArrowRight') bookGo(1); if (e.key === 'ArrowLeft') bookGo(-1);
    }
  });
  $('#q').addEventListener('input', e => setQuery(e.target.value));
  $('#qClear').addEventListener('click', () => { setQuery(''); $('#q').focus(); });
  $('#searchForm').addEventListener('submit', e => e.preventDefault());
  matchMedia('(min-width:1100px)').addEventListener('change', closeAll);

  (async function init() {
    setMode(state.mode); renderCart(); skeleton();
    state.cats = await loadMenu().then(cs => {
      const seen = new Set();
      return cs.filter(c => c.enabled && c.products.length && !seen.has(c.name.toLowerCase()) && seen.add(c.name.toLowerCase()));
    });
    state.cats.forEach(c => c.products.forEach(p => state.products.set(p.id, p)));
    // drop stale cart lines whose product no longer exists
    state.cart = state.cart.filter(l => state.products.has(l.id)); saveCart();
    state.bookCat = state.cats[0].id; resetPage();
    document.querySelectorAll('.vw').forEach(b => b.setAttribute('aria-pressed', b.dataset.view === state.view));
    state.active = state.view === 'book' ? state.bookCat : 'all';
    renderCats(); renderMenu();
  })();

  // sticky header: compact on scroll, and keep the category bar tucked under it
  (function(){
    const top = document.querySelector('.top'); if (!top) return;
    const set = () => document.documentElement.style.setProperty('--top-h', top.offsetHeight + 'px');
    const onScroll = () => { top.classList.toggle('stuck', window.scrollY > 40); set(); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', set);
    if (window.ResizeObserver) new ResizeObserver(set).observe(top);
    set(); onScroll();
  })();
})();
