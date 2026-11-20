/* ============================================================
   TAWAKKAL / Vanilla JavaScript — raw seafood storefront
   No jQuery, no build system. Bootstrap only for UI primitives.

   IMPORTANT DEMO DATA:
   - Set CONFIG.whatsappNumber to the real business number.
   - Replace all catalog prices with approved, current PKR rates.
   - Replace Unsplash examples with photos of ACTUAL items sold.
   - Confirm stock, delivery areas, packing and payment policies.
   ============================================================ */
'use strict';

const CONFIG = Object.freeze({
  whatsappNumber: '923001234567', // REPLACE: Pakistan international format, digits only (e.g. 923XXXXXXXXX)
  cartStorageKey: 'tawakkal-raw-cart-v2',
  currency: 'PKR',
  defaultWeightKg: 1
});

const AVAILABLE_WEIGHTS = Object.freeze([0.5, 1, 1.5, 2, 3, 5]);
const CUT_OPTIONS = Object.freeze({
  fish: ['Whole / as is', 'Cleaned & gutted', 'Headless & cleaned', 'Slices / steaks', 'Boneless fillet — subject to availability'],
  prawns: ['Whole / shell-on', 'Headless / shell-on', 'Peeled & deveined — subject to availability'],
  shellfish: ['Whole / as is', 'Cleaning requested — please confirm'],
  cuts: ['Fresh raw fillet / as supplied', 'Cut into smaller pieces — request']
});

// Illustrative local names, images, and prices — NOT live inventory or market quotations.
const PRODUCTS = Object.freeze([
  {
    id: 'surmai', name: 'King Fish', localName: 'Surmai / سُرمئی', category: 'fish',
    pricePerKg: 1950, label: 'LOCAL FAVOURITE',
    image: 'https://images.unsplash.com/photo-1772155729680-13cbc4d5d9d6?auto=format&fit=crop&w=760&q=80',
    description: 'Fresh raw king fish, a familiar Pakistani choice. Order whole or request steaks or cleaned cuts.'
  },
  {
    id: 'white-pomfret', name: 'White Pomfret', localName: 'Safaid Paplet / سفید پاپلیٹ', category: 'fish',
    pricePerKg: 2600, label: 'POPULAR',
    image: 'https://images.unsplash.com/photo-1772654271379-484eeabecc37?auto=format&fit=crop&w=760&q=80',
    description: 'Raw whole white pomfret with its characteristic delicate flesh. Choose your preferred cleaning style.'
  },
  {
    id: 'tiger-prawns', name: 'Tiger Prawns', localName: 'Jumbo Jheenga / جھینگا', category: 'prawns',
    pricePerKg: 2800, label: 'FEATURED',
    image: 'https://images.unsplash.com/photo-1705917667452-edaab2dfc0ba?auto=format&fit=crop&w=760&q=80',
    description: 'Raw tiger prawns. Select shell-on or ask about cleaned options before confirmation.'
  },
  {
    id: 'red-snapper', name: 'Red Snapper', localName: 'Heera / ہیرا', category: 'fish',
    pricePerKg: 1800, label: 'FRESH FISH',
    image: 'https://images.unsplash.com/photo-1772285253181-b1257afb3698?auto=format&fit=crop&w=760&q=80',
    description: 'Fresh raw snapper with firm flesh. Available whole, with cutting requests subject to fish size.'
  },
  {
    id: 'rawans', name: 'Indian Salmon', localName: 'Rawans / راوس', category: 'fish',
    pricePerKg: 1650, label: 'FAMILY CHOICE',
    image: 'https://images.unsplash.com/photo-1559058789-672da06263d8?auto=format&fit=crop&w=760&q=80',
    description: 'Raw Indian salmon, locally known as Rawans. Choose whole, steaks or boneless preparation where possible.'
  },
  {
    id: 'medium-prawns', name: 'Medium Prawns', localName: 'Jheenga / جھینگا', category: 'prawns',
    pricePerKg: 1550, label: 'EVERYDAY PICK',
    image: 'https://images.unsplash.com/photo-1705917667452-edaab2dfc0ba?auto=format&fit=crop&w=760&q=80',
    description: 'Raw medium-sized prawns sold by weight. Tell us whether you prefer them shell-on or cleaned.'
  },
  {
    id: 'black-pomfret', name: 'Black Pomfret', localName: 'Kala Paplet / کالا پاپلیٹ', category: 'fish',
    pricePerKg: 1300, label: 'COASTAL PICK',
    image: 'https://images.unsplash.com/photo-1772155729680-13cbc4d5d9d6?auto=format&fit=crop&w=760&q=80',
    description: 'Whole black pomfret, a common household favourite. Ask for cleaning based on the size selected.'
  },
  {
    id: 'crab', name: 'Fresh Crab', localName: 'Kekra / کیکڑا', category: 'shellfish',
    pricePerKg: 1750, label: 'SHELLFISH',
    image: 'https://images.unsplash.com/photo-1536266740131-2aadb9f77705?auto=format&fit=crop&w=760&q=80',
    description: 'Fresh raw coastal crab, sold by weight. Availability and cleaning options are confirmed when ordering.'
  },
  {
    id: 'squid', name: 'Fresh Squid', localName: 'Squid / Calamari', category: 'shellfish',
    pricePerKg: 1750, label: 'SEAFOOD SELECTION',
    image: 'https://images.unsplash.com/photo-1759306103437-c0984f7bba9d?auto=format&fit=crop&w=760&q=80',
    description: 'Raw squid for home preparation, subject to seasonal availability. Request cleaning as needed.'
  },
  {
    id: 'fish-fillets', name: 'Fresh Fish Fillets', localName: 'Boneless raw cuts', category: 'cuts',
    pricePerKg: 2400, label: 'RAW CUTS',
    image: 'https://images.unsplash.com/photo-1772285253181-b1257afb3698?auto=format&fit=crop&w=760&q=80',
    description: 'Unseasoned, uncooked fish fillets. Exact species, net weight and pricing will be confirmed.'
  }
]);

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
const getProduct = id => PRODUCTS.find(product => product.id === id);
const money = amount => `Rs. ${Math.round(amount).toLocaleString('en-PK')}`;
const formatKg = weight => weight < 1 ? `${Math.round(weight * 1000)} g` : `${weight} kg`;
const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function loadCart() {
  try {
    const data = JSON.parse(localStorage.getItem(CONFIG.cartStorageKey) || '[]');
    if (!Array.isArray(data)) return [];
    // Strip any malformed, unknown or manipulated entries before rendering.
    return data.filter(line =>
      line && typeof line === 'object' && Boolean(getProduct(line.productId)) &&
      AVAILABLE_WEIGHTS.includes(line.weight) &&
      CUT_OPTIONS[getProduct(line.productId).category].includes(line.cut) &&
      Number.isInteger(line.quantity) && line.quantity > 0 && line.quantity <= 30
    ).slice(0, 40).map(line => ({productId:line.productId,weight:line.weight,cut:line.cut,quantity:line.quantity}));
  } catch { return []; }
}
function saveCart() {
  try { localStorage.setItem(CONFIG.cartStorageKey, JSON.stringify(cart)); }
  catch { /* Browsers with disabled storage still support the current session. */ }
}

let cart = loadCart();
let activeFilter = 'all';
let activeQuery = '';
let quickProductId = null;

function toast(message) {
  const element = $('#cartToast');
  $('#toastText').textContent = message;
  if (window.bootstrap?.Toast) bootstrap.Toast.getOrCreateInstance(element, {delay:3000}).show();
}

function productCard(product) {
  const searchTerms = escapeHTML(`${product.name} ${product.localName}`);
  return `<div class="col-sm-6 col-lg-4 col-xl-3 reveal in-view">
    <article class="product-card" aria-label="${searchTerms}">
      <div class="product-image">
        <!-- Replace the example image with a photograph of this actual RAW species. -->
        <img src="${product.image}" alt="Illustrative raw seafood photograph for ${escapeHTML(product.name)}" loading="lazy" width="600" height="500">
        <span class="product-label">${escapeHTML(product.label)}</span>
        <button class="product-quick" type="button" data-quick-view="${product.id}" aria-label="Select weight and cut for ${escapeHTML(product.name)}"><i class="bi bi-arrow-up-right" aria-hidden="true"></i></button>
      </div>
      <div class="product-info">
        <span class="product-type">RAW / ${escapeHTML(product.category === 'cuts' ? 'FRESH CUTS' : product.category)}</span>
        <h3>${escapeHTML(product.name)}</h3>
        <p class="product-local">${escapeHTML(product.localName)}</p>
        <div class="product-bottom"><span class="product-price">${money(product.pricePerKg)}<small>per kg · demo rate</small></span>
          <button type="button" class="product-add" data-quick-view="${product.id}">Choose options <i class="bi bi-arrow-right" aria-hidden="true"></i></button>
        </div>
      </div>
    </article>
  </div>`;
}

function renderProducts() {
  const query = activeQuery.trim().toLocaleLowerCase();
  const matching = PRODUCTS.filter(product =>
    (activeFilter === 'all' || product.category === activeFilter) &&
    `${product.name} ${product.localName} ${product.category}`.toLocaleLowerCase().includes(query)
  );
  $('#productGrid').innerHTML = matching.map(productCard).join('');
  $('#noProducts').hidden = matching.length > 0;
  $$('#productFilters [data-filter]').forEach(button => {
    const selected = button.dataset.filter === activeFilter;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
}

function selectFilter(category) {
  const valid = category === 'all' || $$('#productFilters [data-filter]').some(button => button.dataset.filter === category);
  if (!valid) return;
  activeFilter = category;
  activeQuery = '';
  $('#productSearch').value = '';
  renderProducts();
}

function lineSubtotal(line) {
  const product = getProduct(line.productId);
  return product ? product.pricePerKg * line.weight * line.quantity : 0;
}
function totals() {
  return {
    count: cart.reduce((sum,line) => sum + line.quantity, 0),
    subtotal: cart.reduce((sum,line) => sum + lineSubtotal(line), 0)
  };
}
function renderCart() {
  const { count, subtotal } = totals();
  $('#cartCount').textContent = count > 99 ? '99+' : String(count);
  $('#cartDrawerCount').textContent = `(${count})`;
  $('#cartSubtotal').textContent = money(subtotal);
  $('#checkoutButton').disabled = count === 0;
  $('#clearCartButton').disabled = count === 0;
  if (!cart.length) {
    $('#cartItems').innerHTML = `<div class="cart-empty"><i class="bi bi-bag" aria-hidden="true"></i><strong>Your basket is empty.</strong><p>Choose seafood, weight and cutting style to start an enquiry.</p></div>`;
    return;
  }
  $('#cartItems').innerHTML = cart.map((line,index) => {
    const product = getProduct(line.productId);
    return `<article class="cart-item">
      <img src="${product.image}" alt="Illustrative ${escapeHTML(product.name)} product" loading="lazy" width="90" height="108">
      <div class="cart-item-body"><strong>${escapeHTML(product.name)}</strong>
        <small>${formatKg(line.weight)} × ${line.quantity} pack${line.quantity > 1 ? 's' : ''} · ${escapeHTML(line.cut)}</small>
        <span>${money(lineSubtotal(line))}</span>
        <div class="cart-item-actions"><button type="button" data-index="${index}" data-delta="-1" aria-label="Decrease ${escapeHTML(product.name)} packs">−</button><b>${line.quantity}</b><button type="button" data-index="${index}" data-delta="1" aria-label="Increase ${escapeHTML(product.name)} packs">+</button><button class="remove-line" type="button" data-remove-index="${index}" aria-label="Remove ${escapeHTML(product.name)} selection"><i class="bi bi-trash" aria-hidden="true"></i></button></div>
      </div>
    </article>`;
  }).join('');
}
function updateCart() { saveCart(); renderCart(); }

function addSelection() {
  const product = getProduct(quickProductId);
  if (!product) return;
  const weight = Number($('#quickWeight').value);
  const cut = $('#quickCut').value;
  if (!AVAILABLE_WEIGHTS.includes(weight) || !CUT_OPTIONS[product.category].includes(cut)) return;
  const existing = cart.find(line => line.productId === product.id && line.weight === weight && line.cut === cut);
  if (existing) existing.quantity = Math.min(existing.quantity + 1, 30);
  else cart.push({productId:product.id,weight,cut,quantity:1});
  updateCart();
  toast(`${product.name} (${formatKg(weight)}) added to basket.`);
  window.bootstrap?.Modal.getInstance($('#quickViewModal'))?.hide();
}
function changeQuantity(index, delta) {
  if (!Number.isInteger(index) || !cart[index] || !Number.isInteger(delta)) return;
  cart[index].quantity = Math.max(0, Math.min(30, cart[index].quantity + delta));
  if (!cart[index].quantity) cart.splice(index,1);
  updateCart();
}

function openQuickView(id) {
  const product = getProduct(id);
  if (!product) return;
  quickProductId = id;
  $('#quickViewImage').src = product.image;
  $('#quickViewImage').alt = `Illustrative raw seafood image of ${product.name}`;
  $('#quickViewTitle').textContent = product.name;
  $('#quickViewLocal').textContent = product.localName;
  $('#quickViewDescription').textContent = product.description;
  $('#quickViewRate').textContent = `${money(product.pricePerKg)} / kg`;
  $('#quickWeight').value = String(CONFIG.defaultWeightKg);
  $('#quickCut').innerHTML = CUT_OPTIONS[product.category].map(option => `<option value="${escapeHTML(option)}">${escapeHTML(option)}</option>`).join('');
  updateQuickEstimate();
  window.bootstrap?.Modal.getOrCreateInstance($('#quickViewModal')).show();
}
function updateQuickEstimate() {
  const product = getProduct(quickProductId);
  if (!product) return;
  $('#quickViewTotal').textContent = money(product.pricePerKg * Number($('#quickWeight').value));
}

function waLink(message = '') {
  const number = CONFIG.whatsappNumber.replace(/\D/g,'');
  return `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}
function openWhatsApp(message) {
  // User gesture controls when this is called; popup blocker can allow it.
  window.open(waLink(message), '_blank', 'noopener,noreferrer');
}
function checkout() {
  if (!cart.length) return;
  const lines = cart.map((line,index) => {
    const product = getProduct(line.productId);
    const totalKg = line.weight * line.quantity;
    return `${index+1}. ${product.name} (${product.localName})\n   ${formatKg(line.weight)} x ${line.quantity} = ${formatKg(totalKg)} raw weight\n   Cutting: ${line.cut}\n   Estimated: ${money(lineSubtotal(line))}`;
  });
  const message = `Assalam-o-Alaikum TAWAKKAL! I would like to enquire about this raw seafood order:\n\n${lines.join('\n\n')}\n\nEstimated subtotal: ${money(totals().subtotal)} (DEMO rates)\n\nPlease confirm today's rates, availability, raw/pre-cleaning weight, final cleaned yield, packaging, delivery area and charges before confirming my order. JazakAllah!`;
  openWhatsApp(message);
}

function initEvents() {
  $('#productFilters').addEventListener('click', event => {
    const button = event.target.closest('[data-filter]');
    if (button) selectFilter(button.dataset.filter);
  });
  $('#productSearch').addEventListener('input', event => { activeQuery = event.target.value; renderProducts(); });
  // Category links still scroll to #shop. Filter selection runs before navigation.
  $$('[data-category]').forEach(link => link.addEventListener('click', () => selectFilter(link.dataset.category)));
  document.addEventListener('click', event => {
    const productButton = event.target.closest('[data-quick-view]');
    const qtyButton = event.target.closest('[data-index][data-delta]');
    const removeButton = event.target.closest('[data-remove-index]');
    if (productButton) openQuickView(productButton.dataset.quickView);
    else if (qtyButton) changeQuantity(Number(qtyButton.dataset.index), Number(qtyButton.dataset.delta));
    else if (removeButton) { cart.splice(Number(removeButton.dataset.removeIndex),1); updateCart(); }
  });
  $('#quickWeight').addEventListener('change', updateQuickEstimate);
  $('#quickViewAdd').addEventListener('click', addSelection);
  $('#checkoutButton').addEventListener('click', checkout);
  $('#clearCartButton').addEventListener('click', () => { cart = []; updateCart(); toast('Basket cleared.'); });
  $$('[data-whatsapp-link]').forEach(link => { link.href = waLink('Assalam-o-Alaikum TAWAKKAL! Please share your current raw seafood stock, prices and delivery options.'); });
  $('#currentYear').textContent = String(new Date().getFullYear());
}

function initCountdown() {
  const pad = n => String(n).padStart(2,'0');
  function update() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setHours(24,0,0,0);
    const remaining = Math.floor((tomorrow.getTime() - now.getTime())/1000);
    $('#hours').textContent = pad(Math.floor(remaining/3600));
    $('#minutes').textContent = pad(Math.floor((remaining%3600)/60));
    $('#seconds').textContent = pad(remaining%60);
  }
  update(); window.setInterval(update,1000);
}

function initScrollAndMotion() {
  const header = $('#siteHeader');
  const back = $('#backToTop');
  function syncScroll() {
    const scrolled = window.scrollY > 24;
    header.classList.toggle('scrolled',scrolled);
    back.classList.toggle('visible',window.scrollY > 700);
  }
  window.addEventListener('scroll',syncScroll,{passive:true});
  syncScroll();
  back.addEventListener('click',() => window.scrollTo({top:0,behavior: reducedMotion ? 'auto' : 'smooth'}));
  if ('IntersectionObserver' in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver((entries,observer) => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('in-view'); observer.unobserve(entry.target); } });
    },{rootMargin:'0px 0px -40px 0px',threshold:.08});
    $$('.reveal').forEach(el => revealObserver.observe(el));
    const counts = new IntersectionObserver((entries,observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        const target = Number(entry.target.dataset.count);
        const start = performance.now();
        const duration = 850;
        function frame(now) {
          const t = Math.min(1,(now - start)/duration);
          entry.target.textContent = String(Math.round(target * (1 - (1 - t) ** 3)));
          if (t < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      });
    },{threshold:.4});
    $$('[data-count]').forEach(el => counts.observe(el));
  } else {
    $$('.reveal').forEach(el => el.classList.add('in-view'));
    $$('[data-count]').forEach(el => {el.textContent = el.dataset.count;});
  }
  // Decorative cursor only on precise pointing devices.
  if (window.matchMedia('(pointer:fine) and (min-width:1024px)').matches && !reducedMotion) {
    const cursor = $('.cursor-dot');
    document.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse') return;
      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;
      cursor.style.opacity = '1';
    },{passive:true});
    document.addEventListener('pointerleave',() => { cursor.style.opacity = '0'; });
  }
  // A tiny button movement on desktop gives tactile polish without layout shifts.
  if (window.matchMedia('(hover:hover) and (pointer:fine)').matches && !reducedMotion) {
    $$('.hero-actions .btn,.delivery-info .btn').forEach(button => {
      button.addEventListener('mousemove', event => {
        const bounds = button.getBoundingClientRect();
        const x = (event.clientX - bounds.left - bounds.width/2) * .055;
        const y = (event.clientY - bounds.top - bounds.height/2) * .055;
        button.style.translate = `${x}px ${y}px`;
      });
      button.addEventListener('mouseleave',() => { button.style.translate = ''; });
    });
  }
}

function showStatus(element, message, error = false) {
  element.textContent = message;
  element.classList.toggle('is-error',error);
}
function initForms() {
  $('#newsletterForm').addEventListener('submit', event => {
    event.preventDefault();
    const input = $('#newsletterEmail');
    if (!input.checkValidity()) {
      showStatus($('#newsletterMessage'),'Please enter a valid email address.',true);
      input.focus(); return;
    }
    // Never falsely claim successful subscription: no backend is connected.
    showStatus($('#newsletterMessage'),'Demo form only — email not saved or submitted. Connect your newsletter platform before launch.');
    input.value = '';
  });
  $('#contactForm').addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget;
    const phone = $('#contactPhone');
    const cleanPhone = phone.value.replace(/[\s()-]/g,'');
    const phoneValid = /^(?:\+?92|0)?3\d{9}$/.test(cleanPhone);
    phone.value = cleanPhone;
    if (!form.checkValidity() || !phoneValid) {
      showStatus($('#contactStatus'), 'Please complete all required fields with a valid Pakistani mobile number.',true);
      if (!phoneValid) phone.focus();
      else form.querySelector(':invalid')?.focus();
      return;
    }
    const data = new FormData(form);
    const message = `Assalam-o-Alaikum TAWAKKAL!\n\nName: ${data.get('name')}\nPhone: ${cleanPhone}\nCity: ${data.get('city')}\nEnquiry: ${data.get('topic')}\n\n${data.get('message')}\n\nPlease contact me regarding raw seafood availability.`;
    openWhatsApp(message);
    showStatus($('#contactStatus'),'Your WhatsApp message was prepared. Please review and press Send in WhatsApp.');
  });
}

function init() {
  // Only hide content for reveal animations once observers are available.
  if (!reducedMotion && 'IntersectionObserver' in window) document.documentElement.classList.add('js-ready');
  renderProducts();
  renderCart();
  initEvents();
  initCountdown();
  initScrollAndMotion();
  initForms();
  // Hide as soon as the page is interactive; do not wait on third-party photos.
  window.setTimeout(() => $('#preloader')?.classList.add('is-done'),250);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
