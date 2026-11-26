/* Shared storefront: IDs-only cart, accessible rendering and server-authoritative checkout. */
(function () {
  'use strict';
  const cloud = window.AlJahfaliCloud;
  const core = window.StoreCore;
  const $ = id => document.getElementById(id);
  if (!core || !cloud) {
    const target = $('catalogNotice');
    if (target) target.innerHTML = '<div class="notice error">تعذر تشغيل المتجر. أعد تحميل الصفحة أو تواصل مع الدعم.</div>';
    document.querySelectorAll('[aria-busy="true"]').forEach(el => el.setAttribute('aria-busy', 'false'));
    return;
  }
  const esc = value => core.escapeHTML(String(value ?? ''));
  const safe = (value, fallback = '') => core.safeURL(value, fallback);
  const read = (key, fallback) => core.readStorage(key, fallback);
  const write = (key, value) => core.writeStorage(key, value);
  const currencies = { usd: 'دولار أمريكي', sar: 'ريال سعودي', yer_sanaa: 'ريال يمني — صنعاء', yer_aden: 'ريال يمني — عدن' };
  const categoryLabels = { ai: 'الذكاء الاصطناعي', design: 'التصميم والمونتاج', entertainment: 'الترفيه', productivity: 'الإنتاجية والتعليم', microsoft: 'مايكروسوفت', security: 'الحماية والأمان' };
  const page = document.body.dataset.storePage;
  const params = new URLSearchParams(location.search);
  const storedCurrency = read('aljahfali_currency', 'usd');
  const state = {
    products: [], plans: [], categories: [], sales: new Map(), rates: null,
    source: 'unavailable', user: null, category: 'all', shown: 12,
    currency: currencies[storedCurrency] ? storedCurrency : 'usd',
    cart: normalizeCart(read('aljahfali_cart', [])),
    coupon: String(read('aljahfali_coupon', '') || ''), quote: null,
    methods: [], order: null, busy: false, loadSequence: 0, selectedPlan: '',
    quoteSequence: 0, loadError: false, plansFailed: false, checkoutRenderSequence: 0,
    checkoutAttempt: read('aljahfali_checkout_attempt', null)
  };
  const icons = {
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>',
    bag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14l1 14H4L5 7Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/></svg>'
  };
  let toastTimer;

  function normalizeCart(items) {
    if (!Array.isArray(items)) return [];
    const result = new Map();
    items.slice(0, 100).forEach(item => {
      if (!item || typeof item !== 'object') return;
      const productId = String(item.product_id || item.id || '');
      const planId = item.plan_id ? String(item.plan_id) : null;
      const quantity = Number(item.quantity ?? item.qty ?? 1);
      if (!productId || productId.length > 150 || !Number.isSafeInteger(quantity) || quantity < 1) return;
      const key = productId + '\u0000' + (planId || '');
      const existing = result.get(key);
      result.set(key, { product_id: productId, plan_id: planId, quantity: Math.min(99, quantity + (existing?.quantity || 0)) });
    });
    return [...result.values()];
  }
  function money(value, currency = state.currency) {
    return Number.isFinite(Number(value)) && value !== null ? core.formatMoney(Number(value), currency) : 'السعر غير متاح';
  }
  function price(entity, currency = state.currency) {
    if (!entity) return null;
    const value = core.priceFor(entity, currency, state.rates);
    return value === null || !Number.isFinite(Number(value)) ? null : Number(value);
  }
  function toast(message) {
    clearTimeout(toastTimer);
    $('storeToast').textContent = message;
    $('storeToast').hidden = false;
    toastTimer = setTimeout(() => { $('storeToast').hidden = true; }, 4200);
  }
  function errorMessage(error, fallback) {
    const message = String(error?.message || '');
    return /[\u0600-\u06ff]/.test(message) && message.length < 400 ? message : fallback;
  }
  function setNotice(element, message, kind = 'warning', action = '') {
    if (typeof element === 'string') element = $(element);
    if (!element) return;
    element.innerHTML = message ? `<div class="notice ${esc(kind)}"><span>${esc(message)}</span>${action}</div>` : '';
  }
  function timeout(promise, ms = 12000) {
    let timer;
    return Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('انتهت مهلة الاتصال. يرجى إعادة المحاولة.')), ms); })]).finally(() => clearTimeout(timer));
  }
  function saveCart() {
    write('aljahfali_cart', state.cart);
    state.quote = null;
    state.quoteSequence++;
    state.checkoutRenderSequence++;
    updateBadge();
  }
  function clearCheckoutAttempt() {
    state.checkoutAttempt = null;
    write('aljahfali_checkout_attempt', null);
  }
  function updateBadge() {
    $('cartBadge').textContent = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  }
  function plansFor(product) {
    return state.plans.filter(plan => String(plan.product_id) === String(product.id) && plan.is_active !== false);
  }
  function choicesFor(product) {
    const plans = plansFor(product);
    return plans.length ? plans : [product];
  }
  function available(entity) {
    return !!entity && entity.is_active !== false && entity.in_stock !== false && (entity.stock == null || Number(entity.stock) > 0);
  }
  function maxQuantity(entity) {
    if (!entity || entity.allow_quantity !== true) return 1;
    return Math.max(1, Math.min(99, Number(entity.max_quantity || 99), entity.stock == null ? 99 : Number(entity.stock)));
  }
  function resolveItem(item) {
    const product = state.products.find(p => String(p.id) === item.product_id);
    if (!product) return { item, product: null, entity: null, valid: false, issue: 'هذا المنتج غير متوفر في الكتالوج الحالي.' };
    const managedPlans = plansFor(product);
    const entity = item.plan_id ? managedPlans.find(p => String(p.id) === item.plan_id) : managedPlans.length ? null : product;
    let issue = '';
    if (!entity) issue = 'يرجى اختيار باقة متاحة من صفحة المنتج.';
    else if (!available(product) || !available(entity)) issue = 'هذه الباقة غير متوفرة حالياً.';
    else if (item.quantity > maxQuantity(entity)) issue = `الحد المتاح لهذه الباقة: ${maxQuantity(entity)}.`;
    else if (price(entity) === null) issue = 'لا يوجد سعر لهذه الباقة بالعملة المختارة.';
    return { item, product, entity, valid: !issue, issue };
  }
  function productUrl(id) { return 'product.html?id=' + encodeURIComponent(id); }
  function activation(entity, product = entity) {
    return entity?.activation_type || product?.activation_type || product?.modal_data?.account_type || '';
  }
  function oldPrice(entity) {
    const previous = entity?.compare_at_prices?.[state.currency] ?? entity?.previous_prices?.[state.currency];
    const current = price(entity);
    return current !== null && Number(previous) > current ? Number(previous) : null;
  }
  function minEntity(product) {
    return choicesFor(product).slice().sort((a, b) => (price(a) ?? Infinity) - (price(b) ?? Infinity))[0];
  }
  function addToCart(productId, planId = null) {
    const product = state.products.find(p => String(p.id) === String(productId));
    if (!product) return;
    const plans = plansFor(product);
    if (plans.length && !planId) { location.href = productUrl(product.id); return; }
    const entity = planId ? plans.find(p => String(p.id) === String(planId)) : product;
    if (!available(product) || !available(entity)) { toast('هذه الباقة غير متوفرة حالياً.'); return; }
    if (price(entity) === null) { toast('اختر عملة يتوفر بها سعر لهذه الباقة.'); return; }
    const item = state.cart.find(i => i.product_id === String(productId) && i.plan_id === (planId ? String(planId) : null));
    if (item) {
      if (item.quantity >= maxQuantity(entity)) { toast('هذه الباقة موجودة في السلة بالكمية المتاحة.'); return; }
      item.quantity++;
    } else state.cart.push({ product_id: String(productId), plan_id: planId ? String(planId) : null, quantity: 1 });
    saveCart();
    toast('تمت إضافة الباقة إلى السلة.');
  }
  function updateCurrency(value) {
    if (!currencies[value] || state.busy || state.order) { $('storeCurrency').value = state.currency; return; }
    state.currency = value;
    write('aljahfali_currency', value);
    state.quote = null;
    state.quoteSequence++;
    renderPage();
    document.querySelectorAll('.filter-currency').forEach(el => { el.textContent = '(' + currencies[value] + ')'; });
  }
  function normalizeSearch(text) {
    return String(text || '').normalize('NFKD').toLowerCase().replace(/[\u064B-\u065F\u0670\u0640]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').trim();
  }

  async function loadCatalog() {
    const sequence = ++state.loadSequence;
    state.loadError = false;
    setNotice('catalogNotice', 'جارٍ تحديث بيانات المتجر…', '');
    try {
      const products = await timeout(cloud.fetchProducts());
      if (sequence !== state.loadSequence) return;
      state.products = Array.isArray(products) ? products.filter(p => p && p.id && p.is_active !== false) : [];
      state.source = cloud.catalogSource || 'unavailable';
    } catch (error) {
      if (sequence !== state.loadSequence) return;
      state.loadError = true;
      state.source = 'local';
      state.products = Array.isArray(window.PRODUCTS_CATALOG) ? window.PRODUCTS_CATALOG.filter(p => p && p.id && p.is_active !== false) : [];
    }
    const configured = cloud.config?.isConfigured();
    const results = await Promise.allSettled([
      timeout(cloud.fetchRates()),
      configured ? timeout(cloud.fetchPlans()) : Promise.resolve([]),
      configured ? timeout(cloud.fetchCategories()) : Promise.resolve([]),
      configured ? timeout(cloud.getCurrentUser()) : Promise.resolve(null),
      configured && cloud.fetchCatalogSales ? timeout(cloud.fetchCatalogSales()) : Promise.resolve([])
    ]);
    if (sequence !== state.loadSequence) return;
    state.rates = results[0].status === 'fulfilled' ? results[0].value : null;
    state.plansFailed = configured && results[1].status === 'rejected';
    state.plans = results[1].status === 'fulfilled' && Array.isArray(results[1].value) ? results[1].value : [];
    state.categories = results[2].status === 'fulfilled' && Array.isArray(results[2].value) ? results[2].value : [];
    state.user = results[3].status === 'fulfilled' ? results[3].value : null;
    const sales = results[4].status === 'fulfilled' && Array.isArray(results[4].value) ? results[4].value : [];
    state.sales = new Map(sales.map(row => [String(row.product_id), Number(row.quantity || 0)]));
    $('accountNav').href = state.user ? 'account.html' : 'login.html';
    if (state.source === 'cloud' && !state.plansFailed) setNotice('catalogNotice', '');
    else {
      const message = state.plansFailed ? 'تعذر تحميل الباقات المحدثة. يمكنك تصفح المنتجات وإعادة المحاولة قبل الشراء.' : state.products.length ? 'تظهر نسخة الكتالوج المحفوظة حالياً. يتم التحقق من الأسعار والتوفر عند عودة الاتصال بالمتجر.' : 'تعذر تحميل المنتجات. تحقق من اتصالك ثم أعد المحاولة.';
      setNotice('catalogNotice', message, state.products.length ? 'warning' : 'error', '<button type="button" class="btn btn-secondary btn-small" data-action="retry-catalog">إعادة المحاولة</button>');
    }
    if (page === 'catalog') buildFilters();
    await renderPage();
  }

  function buildFilters() {
    const list = $('categoryList');
    const counts = new Map();
    state.products.forEach(product => counts.set(product.category || 'other', (counts.get(product.category || 'other') || 0) + 1));
    const labels = new Map(state.categories.map(category => [String(category.id || category.slug), category.name || category.title || category.id]));
    const categories = [...counts.keys()].sort((a, b) => {
      const order = key => Number(state.categories.find(c => c.id === key || c.slug === key)?.sort_order || 0);
      return order(a) - order(b);
    });
    if (state.category !== 'all' && !counts.has(state.category)) state.category = 'all';
    list.innerHTML = `<button class="category-button" type="button" data-category="all" aria-pressed="${state.category === 'all'}">جميع المنتجات<span class="count">${state.products.length}</span></button>` + categories.map(id => `<button class="category-button" type="button" data-category="${esc(id)}" aria-pressed="${state.category === id}">${esc(labels.get(id) || categoryLabels[id] || id)}<span class="count">${counts.get(id)}</span></button>`).join('');
    const durations = [...new Set(state.products.flatMap(product => choicesFor(product).map(entity => entity.duration || product.duration)).filter(Boolean))];
    const activations = [...new Set(state.products.flatMap(product => choicesFor(product).map(entity => activation(entity, product))).filter(Boolean))];
    const buildOptions = (id, values, placeholder) => {
      const current = $(id).value;
      $(id).innerHTML = `<option value="">${placeholder}</option>` + values.map(value => `<option value="${esc(value)}">${esc(value)}</option>`).join('');
      if (values.includes(current)) $(id).value = current;
    };
    buildOptions('durationFilter', durations, 'كل المدد');
    buildOptions('activationFilter', activations, 'كل الأنواع');
    $('sortProducts').querySelector('[value="popular"]').disabled = !state.sales.size;
    document.querySelectorAll('.filter-currency').forEach(el => { el.textContent = '(' + currencies[state.currency] + ')'; });
  }
  function filteredProducts() {
    const query = normalizeSearch($('searchInput').value);
    const min = $('minPrice').value === '' ? -Infinity : Number($('minPrice').value);
    const max = $('maxPrice').value === '' ? Infinity : Number($('maxPrice').value);
    const availability = $('availabilityFilter').value;
    const duration = $('durationFilter').value;
    const method = $('activationFilter').value;
    const offers = $('offersFilter').value === 'offers';
    const filtered = state.products.filter(product => {
      if (state.category !== 'all' && (product.category || 'other') !== state.category) return false;
      if (query && !normalizeSearch([product.title, product.raw_name, product.service_name, product.service_key, product.brand_label, product.card_desc].join(' ')).includes(query)) return false;
      return choicesFor(product).some(entity => {
        const amount = price(entity);
        const stock = available(product) && available(entity);
        if (availability === 'available' && !stock || availability === 'unavailable' && stock) return false;
        if (duration && (entity.duration || product.duration) !== duration) return false;
        if (method && activation(entity, product) !== method) return false;
        if (offers && !oldPrice(entity)) return false;
        return min === -Infinity && max === Infinity || amount !== null && amount >= min && amount <= max;
      });
    });
    const sort = $('sortProducts').value;
    if (sort === 'price-asc' || sort === 'price-desc') filtered.sort((a, b) => {
      const av = price(minEntity(a)), bv = price(minEntity(b));
      if (av === null) return bv === null ? 0 : 1;
      if (bv === null) return -1;
      return sort === 'price-asc' ? av - bv : bv - av;
    });
    if (sort === 'newest') filtered.sort((a, b) => (Date.parse(b.created_at) || 0) - (Date.parse(a.created_at) || 0));
    if (sort === 'popular' && state.sales.size) filtered.sort((a, b) => (state.sales.get(String(b.id)) || 0) - (state.sales.get(String(a.id)) || 0));
    return filtered;
  }
  function productCard(product) {
    const entity = minEntity(product), plans = plansFor(product), amount = price(entity);
    const stock = available(product) && choicesFor(product).some(available);
    const previous = oldPrice(entity);
    return `<article class="product-card"><div class="card-top"><img class="product-logo" src="${esc(safe(product.icon, 'assets/logo.png'))}" width="58" height="58" alt="شعار ${esc(product.brand_label || product.service_name || product.title)}" loading="lazy"><span class="availability${stock ? '' : ' unavailable'}">${stock ? 'متوفر' : 'غير متوفر'}</span></div><div class="service-label">${esc(product.service_name || product.brand_label || '')}</div><h3><a href="${productUrl(product.id)}">${esc(product.brand_label || product.title)}</a></h3><p class="card-description">${esc(product.card_desc || product.title)}</p><div class="card-meta"><span>${esc(plans.length > 1 ? `${plans.length} باقات متاحة` : entity.duration || product.duration || 'المدة في التفاصيل')}</span>${activation(entity, product) ? `<span title="${esc(activation(entity, product))}">${esc(activation(entity, product))}</span>` : ''}</div><div class="card-price">${plans.length > 1 ? '<span class="price-caption">يبدأ من</span>' : ''}<span class="price-value">${esc(money(amount))}</span>${previous ? `<del class="previous-price">${esc(money(previous))}</del>` : ''}</div><div class="card-actions"><button type="button" class="btn" data-action="add-product" data-product="${esc(product.id)}"${!stock || amount === null || state.plansFailed ? ' disabled' : ''}>${plans.length ? 'اختيار الباقة' : 'أضف إلى السلة'}</button><a class="btn btn-secondary btn-details" href="${productUrl(product.id)}">التفاصيل</a></div></article>`;
  }
  function renderCatalog() {
    const products = filteredProducts();
    $('productsGrid').setAttribute('aria-busy', 'false');
    $('resultsCount').textContent = `${products.length} منتج${$('offersFilter').value === 'offers' ? ' ضمن العروض الحالية' : ''}`;
    if (!products.length) {
      const emptyCatalog = state.products.length === 0;
      $('productsGrid').innerHTML = `<div class="state-box"><h3>${emptyCatalog ? 'لا توجد منتجات متاحة حالياً' : 'لم نجد اشتراكاً بهذه الخيارات'}</h3><p>${emptyCatalog ? 'يمكنك إعادة المحاولة لاحقاً أو التواصل مع الدعم.' : 'جرّب اسماً مختلفاً أو امسح عوامل التصفية.'}</p><button type="button" class="btn btn-secondary" data-action="${emptyCatalog ? 'retry-catalog' : 'reset-filters'}">${emptyCatalog ? 'إعادة المحاولة' : 'مسح التصفية'}</button></div>`;
    } else $('productsGrid').innerHTML = products.slice(0, state.shown).map(productCard).join('');
    $('loadMoreWrap').hidden = state.shown >= products.length;
    $('loadMore').textContent = `عرض المزيد (${Math.max(0, products.length - state.shown)})`;
  }
  function resetFilters() {
    state.category = 'all'; state.shown = 12;
    ['searchInput', 'minPrice', 'maxPrice', 'durationFilter', 'activationFilter'].forEach(id => { $(id).value = ''; });
    $('availabilityFilter').value = 'all'; $('offersFilter').value = 'all'; $('sortProducts').value = 'default';
    buildFilters(); renderCatalog();
    const url = new URL(location.href); url.searchParams.delete('offers'); history.replaceState(null, '', url);
  }

  function stringList(value) { return Array.isArray(value) ? value.filter(item => typeof item === 'string' && item.trim()) : typeof value === 'string' && value.trim() ? [value] : []; }
  function listSection(title, values) {
    const list = stringList(values);
    return list.length ? `<section class="panel detail-section"><h2>${esc(title)}</h2><ul>${list.map(text => `<li>${esc(text)}</li>`).join('')}</ul></section>` : '';
  }
  function renderSteps(steps) {
    if (!Array.isArray(steps) || !steps.length) return '';
    return `<section class="panel detail-section"><h2>خطوات التفعيل</h2><ol>${steps.map(step => {
      const item = typeof step === 'string' ? { text: step } : step || {};
      const source = safe(item.image || item.image_url);
      return `<li class="activation-step">${item.os || item.platform ? `<span class="step-os">${esc(item.os || item.platform)}</span><br>` : ''}${esc(item.text || item.description || item.title || '')}${source ? `<img src="${esc(source)}" alt="${esc(item.alt || item.text || 'صورة توضيحية لخطوة التفعيل')}" loading="lazy">` : ''}</li>`;
    }).join('')}</ol></section>`;
  }
  function renderProduct() {
    const id = params.get('id');
    const product = state.products.find(p => String(p.id) === id);
    $('productContent').setAttribute('aria-busy', 'false');
    if (!product) {
      $('productContent').innerHTML = '<div class="state-box"><h1 class="page-title">المنتج غير متاح</h1><p>قد يكون الرابط غير صحيح أو أن المنتج غير متاح حالياً. استكشف الاشتراكات المتوفرة أو تواصل مع الدعم.</p><a class="btn" href="subscriptions.html">تصفح الاشتراكات</a></div>';
      return;
    }
    const plans = plansFor(product);
    const selected = plans.find(plan => String(plan.id) === state.selectedPlan);
    const entity = plans.length ? selected : product;
    const m = product.modal_data || {};
    $('productBreadcrumb').textContent = product.brand_label || product.title;
    document.title = `${product.title} | الجحفلي للحلول الرقمية`;
    const url = new URL(productUrl(product.id), 'https://aljahfalidigital.com/').href;
    document.querySelector('link[rel="canonical"]').href = url;
    document.querySelector('meta[property="og:url"]').content = url;
    document.querySelector('meta[property="og:title"]').content = document.title;
    document.querySelector('meta[name="description"]').content = product.card_desc || product.title;
    document.querySelector('meta[property="og:description"]').content = product.card_desc || product.title;
    document.querySelector('meta[property="og:image"]').content = new URL(safe(product.icon, 'assets/logo.png'), 'https://aljahfalidigital.com/').href;
    const amount = price(entity || minEntity(product));
    const previous = oldPrice(entity);
    const stock = available(product) && (entity ? available(entity) : plans.some(available));
    const warranty = entity?.warranty || entity?.warranty_policy || product.warranty_policy || product.warranty_text;
    const faq = Array.isArray(m.faq) ? m.faq : Array.isArray(product.faq) ? product.faq : [];
    const requirements = stringList(m.requirements || m.activation_requirements || product.requirements);
    const updated = product.updated_at && !Number.isNaN(Date.parse(product.updated_at)) ? new Intl.DateTimeFormat('ar', { dateStyle: 'medium' }).format(new Date(product.updated_at)) : '';
    $('productContent').innerHTML = `<div class="product-layout"><div class="product-details"><section class="panel"><div class="product-summary"><img class="product-logo" src="${esc(safe(product.icon, 'assets/logo.png'))}" width="90" height="90" alt="شعار ${esc(product.brand_label || product.title)}"><div><span class="eyebrow">${esc(product.service_name || '')}</span><h1>${esc(product.title)}</h1><span class="availability${stock ? '' : ' unavailable'}">${stock ? 'متوفر' : 'غير متوفر حالياً'}</span></div></div><div class="product-description">${esc(m.raw_description_ar || product.description || product.card_desc || '')}</div>${updated ? `<p class="small muted space-top">آخر تعديل لبيانات المنتج: ${esc(updated)}</p>` : ''}</section>${listSection('مميزات الاشتراك', entity?.features?.length ? entity.features : m.features)}<section class="panel detail-section"><h2>تفاصيل التفعيل والتسليم</h2><dl class="detail-grid"><div><dt>نوع التفعيل</dt><dd>${esc(entity?.activation_type || m.activation_methods || m.account_type || 'يرجى الاستفسار قبل الشراء')}</dd></div><div><dt>طريقة التسليم</dt><dd>عبر واتساب بعد التحقق من الدفع وتأكيده.</dd></div><div><dt>المدة</dt><dd>${esc(entity?.duration || product.duration || 'حسب الباقة المختارة')}</dd></div><div><dt>الضمان</dt><dd>${esc(warranty || 'تواصل مع الدعم لمعرفة ضمان هذه الباقة قبل الشراء.')}</dd></div></dl></section>${listSection('الأجهزة والمنصات المدعومة', m.where_to_use || m.supported_devices)}${listSection('متطلبات التفعيل', requirements)}${listSection('الاستخدام', m.how_to_use)}${renderSteps(entity?.activation_steps?.length ? entity.activation_steps : m.step_by_step_activation)}${faq.length ? `<section class="panel detail-section"><h2>الأسئلة الشائعة</h2>${faq.map(item => `<details class="faq-item"><summary>${esc(item.question || item.q || '')}</summary><p>${esc(item.answer || item.a || '')}</p></details>`).join('')}</section>` : ''}</div><aside class="panel buy-panel" aria-label="اختيار الباقة والشراء"><h2 class="panel-title">اختر اشتراكك</h2>${plans.length ? `<div class="field"><label for="productPlan">الباقة</label><select id="productPlan" required><option value="">اختر الباقة المناسبة</option>${plans.map(plan => `<option value="${esc(plan.id)}"${state.selectedPlan === String(plan.id) ? ' selected' : ''}>${esc(plan.name)} — ${esc(plan.duration || '')} — ${esc(money(price(plan)))}${available(plan) ? '' : ' (غير متوفر)'}</option>`).join('')}</select></div>` : ''}<div class="card-price">${plans.length && !entity ? '<span class="price-caption">يبدأ من</span>' : ''}<span class="price-value">${esc(money(amount))}</span>${previous ? `<del class="previous-price">${esc(money(previous))}</del>` : ''}</div><div class="plan-summary"><p>${esc(entity?.duration || product.duration || '')}</p><p>${esc(activation(entity, product))}</p>${state.rates?.updated_at && entity?.pricing_mode === 'auto' ? `<p>تحديث الصرف: ${esc(new Intl.DateTimeFormat('ar').format(new Date(state.rates.updated_at)))}</p>` : ''}</div><button type="button" class="btn btn-block" id="productAdd" data-action="add-selected" data-product="${esc(product.id)}"${!entity || !stock || amount === null || state.plansFailed ? ' disabled' : ''}>${icons.bag}أضف إلى السلة</button><a class="btn btn-secondary btn-block" href="cart.html">عرض السلة</a><a class="btn btn-quiet btn-block" href="https://wa.me/967782611415?text=${encodeURIComponent('مرحباً، أود الاستفسار عن ' + product.title + '\n' + url)}" target="_blank" rel="noopener noreferrer">استفسر عبر واتساب</a><p class="delivery-note">تُراجع الحوالة قبل بدء التفعيل. يمكنك متابعة الطلب والدفع من حسابك.</p><p class="small space-top"><a href="policy.html?slug=warranty">الضمان</a> · <a href="policy.html?slug=refunds">الاستبدال والاسترجاع</a></p></aside></div>`;
    const related = state.products.filter(p => p.id !== product.id && (p.category === product.category || p.service_key === product.service_key)).slice(0, 4);
    $('relatedSection').hidden = !related.length;
    $('relatedGrid').innerHTML = related.map(productCard).join('');
    let structured = $('productStructuredData');
    if (!structured) { structured = document.createElement('script'); structured.id = 'productStructuredData'; structured.type = 'application/ld+json'; document.head.appendChild(structured); }
    const data = { '@context': 'https://schema.org', '@type': 'Product', name: product.title, description: product.card_desc || product.title, image: new URL(safe(product.icon, 'assets/logo.png'), 'https://aljahfalidigital.com/').href, sku: product.id, url };
    // USD/SAR have ISO codes. Local Yemeni market rates are kept out of ambiguous SEO offers.
    if (state.source === 'cloud' && !state.plansFailed && amount !== null && ['usd', 'sar'].includes(state.currency)) data.offers = { '@type': 'Offer', price: amount, priceCurrency: state.currency.toUpperCase(), availability: 'https://schema.org/' + (stock ? 'InStock' : 'OutOfStock'), url };
    structured.textContent = JSON.stringify(data).replace(/</g, '\\u003c');
  }

  function cartRows() { return state.cart.map(resolveItem); }
  function localTotal(rows = cartRows()) { return rows.reduce((sum, row) => sum + (price(row.entity) || 0) * row.item.quantity, 0); }
  function quoteRequest() { return { items: state.cart.map(item => ({ ...item })), currency: state.currency, coupon_code: state.coupon || null }; }
  function renderSummary(total, quote = null, label = 'الإجمالي التقديري') {
    const subtotal = quote ? quote.subtotal : total;
    return `<div class="summary-row"><span>قيمة المنتجات</span><strong>${esc(money(subtotal))}</strong></div>${quote && Number(quote.discount) > 0 ? `<div class="summary-row discount"><span>خصم ${esc(quote.coupon_code || '')}</span><strong>− ${esc(money(quote.discount))}</strong></div>` : ''}<div class="summary-row total"><span>${quote ? 'الإجمالي المعتمد' : label}</span><strong>${esc(money(quote ? quote.total : total))}</strong></div>`;
  }
  function renderCart() {
    $('cartContent').setAttribute('aria-busy', 'false');
    if (!state.cart.length) {
      $('cartContent').innerHTML = '<div class="state-box"><h2>سلتك بانتظار اختياراتك</h2><p>تصفح الاشتراكات وأضف الباقة المناسبة لاحتياجك.</p><a class="btn" href="subscriptions.html">تصفح الاشتراكات</a></div>';
      return;
    }
    const rows = cartRows(), invalid = rows.some(row => !row.valid) || state.plansFailed;
    const previousPrices = read('aljahfali_cart_last_prices', {}) || {};
    let priceChanged = false;
    const currentPrices = {};
    rows.forEach(row => {
      const key = row.item.product_id + ':' + (row.item.plan_id || '') + ':' + state.currency;
      const amount = price(row.entity);
      currentPrices[key] = amount;
      if (Object.prototype.hasOwnProperty.call(previousPrices, key) && previousPrices[key] !== amount) priceChanged = true;
    });
    write('aljahfali_cart_last_prices', { ...previousPrices, ...currentPrices });
    $('cartContent').innerHTML = `${priceChanged ? '<div class="notice warning">تغير سعر إحدى الباقات منذ آخر عرض للسلة. راجع الأسعار الحالية قبل المتابعة.</div>' : ''}<div class="cart-layout"><section class="panel" aria-label="منتجات السلة"><div class="cart-toolbar"><h2>${rows.length} باقة في سلتك</h2><button type="button" class="remove-item" data-action="clear-cart">تفريغ السلة</button></div>${rows.map((row, index) => `<article class="cart-item"><img class="product-logo" src="${esc(safe(row.product?.icon, 'assets/logo.png'))}" alt="" width="58" height="58"><div class="cart-item-info"><h2>${row.product ? `<a href="${productUrl(row.product.id)}">${esc(row.product.title)}</a>` : esc(row.item.product_id)}</h2><p>${esc(row.entity?.name || row.entity?.duration || row.product?.duration || 'باقة غير متاحة')}</p><p>${esc(activation(row.entity, row.product))}</p>${row.issue ? `<p class="space-top" style="color:var(--danger)">${esc(row.issue)}</p>` : ''}<div class="cart-item-bottom"><strong class="price-value">${esc(money(price(row.entity) === null ? null : price(row.entity) * row.item.quantity))}</strong><div class="qty-controls" aria-label="كمية ${esc(row.product?.title || 'المنتج')}"><button type="button" data-action="decrease-quantity" data-index="${index}" aria-label="تقليل الكمية"${row.item.quantity <= 1 ? ' disabled' : ''}>−</button><output>${row.item.quantity}</output><button type="button" data-action="increase-quantity" data-index="${index}" aria-label="زيادة الكمية"${row.item.quantity >= maxQuantity(row.entity) ? ' disabled' : ''}>+</button></div><button type="button" class="remove-item" data-action="remove-item" data-index="${index}">حذف</button></div></div></article>`).join('')}</section><aside class="panel summary-panel"><h2 class="panel-title">ملخص الطلب</h2><label for="couponInput">كود الخصم</label><form id="couponForm" class="coupon-form"><input id="couponInput" name="coupon" maxlength="50" value="${esc(state.coupon)}" placeholder="أدخل الكود" autocomplete="off"><button type="submit" class="btn btn-secondary btn-small">تطبيق</button></form><div id="couponFeedback" aria-live="polite"></div><div id="cartSummary">${renderSummary(localTotal(rows), state.quote)}</div><p class="summary-note">العملة: ${esc(currencies[state.currency])}. يُتحقق من الأسعار والتوفر لدى المتجر قبل التأكيد.</p><a class="btn btn-block${invalid ? ' btn-secondary' : ''}" href="${invalid ? 'subscriptions.html' : 'checkout.html'}">${invalid ? 'راجع الباقات المتاحة' : 'المتابعة إلى الدفع'}</a><button type="button" class="btn btn-quiet btn-block" data-action="refresh-quote"${invalid ? ' disabled' : ''}>التحقق من السعر والتوفر</button><div id="cartQuoteFeedback" aria-live="polite"></div><p class="summary-note">التسليم عبر واتساب بعد مراجعة الدفع.</p></aside></div>`;
  }
  async function refreshQuote(feedback = 'cartQuoteFeedback') {
    const sequence = ++state.quoteSequence;
    if (!state.user) { setNotice(feedback, 'سجّل الدخول للتحقق من الخصم وحفظ طلبك.', 'warning', '<a href="login.html?next=checkout.html">تسجيل الدخول</a>'); return null; }
    if (state.source !== 'cloud' || state.plansFailed) { setNotice(feedback, 'الشراء يتطلب الاتصال بالمتجر. أعد تحميل المنتجات ثم حاول مجدداً.', 'warning'); return null; }
    setNotice(feedback, 'جارٍ التحقق من السعر والتوفر…', '');
    try {
      const quote = await timeout(cloud.quoteCart(quoteRequest()));
      if (sequence !== state.quoteSequence) return null;
      if (!quote || !Number.isFinite(Number(quote.total)) || quote.currency !== state.currency) throw new Error('تعذر التحقق من إجمالي الطلب.');
      state.quote = quote;
      if ($('cartSummary')) $('cartSummary').innerHTML = renderSummary(0, quote);
      if ($('checkoutSummary')) $('checkoutSummary').innerHTML = renderSummary(0, quote);
      setNotice(feedback, 'تم التحقق من الأسعار والتوفر.', 'success');
      return quote;
    } catch (error) {
      if (sequence !== state.quoteSequence) return null;
      state.quote = null;
      setNotice(feedback, errorMessage(error, 'تعذر اعتماد الطلب. راجع الأسعار والباقات وكود الخصم ثم أعد المحاولة.'), 'error');
      return null;
    }
  }

  async function renderCheckout() {
    const renderSequence = ++state.checkoutRenderSequence;
    const requestedCurrency = state.currency;
    const content = $('checkoutContent');
    content.setAttribute('aria-busy', 'false');
    const orderId = params.get('order');
    if (!state.user) {
      const next = 'checkout.html' + (orderId ? '?order=' + encodeURIComponent(orderId) : '');
      content.innerHTML = `<div class="state-box"><h1 class="page-title">سجّل الدخول لإتمام طلبك</h1><p>يرتبط الطلب بحسابك لتتمكن من متابعة الدفع والتفعيل والاشتراكات.</p><a class="btn" href="login.html?next=${encodeURIComponent(next)}">تسجيل الدخول أو إنشاء حساب</a><p><a href="cart.html">العودة إلى السلة</a></p></div>`;
      return;
    }
    if (orderId) {
      try {
        const order = await timeout(cloud.getOrder(orderId));
        if (renderSequence !== state.checkoutRenderSequence) return;
        state.order = order; if (!state.order) throw new Error(); renderOrder();
      }
      catch (error) { content.innerHTML = `<div class="state-box"><h1 class="page-title">تعذر تحميل الطلب</h1><p>${esc(errorMessage(error, 'تحقق من اتصالك ومن تسجيل الدخول بالحساب المرتبط بهذا الطلب.'))}</p><button type="button" class="btn" data-action="retry-catalog">إعادة المحاولة</button><a class="btn btn-secondary" href="account.html">طلباتي</a></div>`; }
      return;
    }
    // A response can be lost after the database commits. Recover that order before
    // quoting again, including when prices, availability or the cart have changed.
    const attempt = state.checkoutAttempt;
    if (attempt?.key && (!attempt.userId || attempt.userId === state.user.id) && cloud.getOrderByRequestKey) {
      try {
        const saved = await timeout(cloud.getOrderByRequestKey(attempt.key));
        if (renderSequence !== state.checkoutRenderSequence) return;
        if (saved?.id) { completeOrder(saved); return; }
      } catch (_) { /* Retain the same key for a safe retry if the lookup is unavailable. */ }
    }
    if (renderSequence !== state.checkoutRenderSequence) return;
    if (!state.cart.length) { content.innerHTML = '<div class="state-box"><h1 class="page-title">لا توجد منتجات في السلة</h1><p>أضف باقة قبل إتمام الطلب.</p><a class="btn" href="subscriptions.html">تصفح الاشتراكات</a></div>'; return; }
    if (state.source !== 'cloud' || state.plansFailed || cartRows().some(row => !row.valid)) {
      content.innerHTML = '<div class="state-box"><h1 class="page-title">نحتاج إلى التحقق من باقاتك</h1><p>تعذر اعتماد البيانات الحالية. راجع السلة أو أعد الاتصال بالمتجر قبل إنشاء الطلب.</p><a class="btn" href="cart.html">مراجعة السلة</a><button class="btn btn-secondary" type="button" data-action="retry-catalog">إعادة المحاولة</button></div>';
      return;
    }
    content.innerHTML = '<div class="state-box"><p role="status">جارٍ التحقق من الأسعار ووسائل الدفع…</p></div>';
    try {
      const [methods, quote] = await Promise.all([timeout(cloud.fetchPaymentMethods()), timeout(cloud.quoteCart(quoteRequest()))]);
      if (renderSequence !== state.checkoutRenderSequence || requestedCurrency !== state.currency) return;
      state.methods = (Array.isArray(methods) ? methods : []).filter(method => method.is_active !== false && Array.isArray(method.currencies) && method.currencies.includes(state.currency));
      if (!quote || !Number.isFinite(Number(quote.total)) || quote.currency !== state.currency) throw new Error();
      state.quote = quote;
      const metadata = state.user.user_metadata || {};
      content.innerHTML = `<h1 class="page-title">إتمام الطلب</h1><p class="page-intro">أكد بيانات التسليم واختر وسيلة الدفع. ستظهر تعليمات التحويل بعد حفظ طلبك.</p><form id="checkoutForm"><div class="checkout-layout"><div><section class="panel"><h2 class="panel-title">بيانات العميل</h2><div class="form-grid"><div><label for="customerName">الاسم الكامل</label><input id="customerName" name="customer_name" autocomplete="name" required minlength="2" maxlength="120" value="${esc(metadata.full_name || metadata.name || '')}"></div><div><label for="customerPhone">رقم واتساب للتسليم</label><input id="customerPhone" name="customer_phone" type="tel" autocomplete="tel" inputmode="tel" required pattern="[+0-9 ()-]{7,25}" maxlength="25" placeholder="+967 7XXXXXXXX" value="${esc(metadata.phone || '')}"><p class="field-hint">أدخل رمز الدولة إذا كان الرقم خارج اليمن.</p></div><div class="full"><label for="customerEmail">البريد المرتبط بالحساب</label><input id="customerEmail" type="email" value="${esc(state.user.email || '')}" readonly></div></div></section><section class="panel"><h2>اختر وسيلة الدفع</h2><p class="small muted">الوسائل المتاحة لعملة ${esc(currencies[state.currency])}</p><div class="payment-methods">${state.methods.length ? state.methods.map((method, index) => `<label class="payment-option"><input type="radio" name="payment_method" value="${esc(method.id)}" required${index === 0 ? ' checked' : ''}>${method.logo ? `<img src="${esc(safe(method.logo, 'assets/logo.png'))}" alt="شعار ${esc(method.name)}" width="42" height="42">` : ''}<span>${esc(method.name)}<small>${esc(method.type || '')}</small></span></label>`).join('') : '<div class="notice warning">لا توجد وسيلة دفع مفعلة بهذه العملة حالياً. غيّر العملة أو تواصل مع الدعم.</div>'}</div></section></div><aside class="panel summary-panel"><h2 class="panel-title">ملخص طلبك</h2>${quote.items.map(item => `<div class="summary-row small"><span>${esc(item.title || item.product_id)}${item.plan_name ? '<br>' + esc(item.plan_name) : ''} × ${Number(item.quantity)}</span><strong>${esc(money(item.line_total))}</strong></div>`).join('')}<div id="checkoutSummary">${renderSummary(0, quote)}</div><p class="summary-note">لن يُعد الدفع مؤكداً إلا بعد مراجعة التحويل. التسليم عبر واتساب بعد تأكيد الدفع.</p><label class="check-label small space-top"><input type="checkbox" id="termsAccepted" required><span>اطلعت على <a href="policy.html?slug=terms" target="_blank" rel="noopener">الشروط</a> و<a href="policy.html?slug=payment-delivery" target="_blank" rel="noopener">سياسة الدفع والتسليم</a>.</span></label><button type="submit" class="btn btn-block space-top" id="createOrderButton"${state.methods.length ? '' : ' disabled'}>تأكيد وحفظ الطلب</button><div id="checkoutFeedback" class="space-top" role="status" aria-live="polite"></div><a class="btn btn-quiet btn-block" href="cart.html">العودة إلى السلة</a></aside></div></form>`;
    } catch (error) {
      if (renderSequence !== state.checkoutRenderSequence) return;
      content.innerHTML = `<div class="state-box"><h1 class="page-title">تعذر تجهيز الطلب</h1><p>${esc(errorMessage(error, 'لم نتمكن من اعتماد السعر أو وسيلة الدفع. راجع السلة وأعد المحاولة.'))}</p><a class="btn" href="cart.html">مراجعة السلة</a><button type="button" class="btn btn-secondary" data-action="retry-catalog">إعادة المحاولة</button></div>`;
    }
  }
  async function createOrder(event) {
    event.preventDefault();
    if (state.busy || !state.quote || !event.target.reportValidity()) return;
    const method = document.querySelector('input[name="payment_method"]:checked');
    if (!method) return;
    const request = { ...quoteRequest(), customer_name: $('customerName').value.trim(), customer_phone: $('customerPhone').value.trim(), payment_method_id: method.value, expected_total: Number(state.quote.total) };
    if (request.customer_name.length < 2) { $('customerName').focus(); return; }
    const fingerprint = JSON.stringify(request);
    let attempt = state.checkoutAttempt;
    // Until a definitive rejection or durable success, retain the key even if
    // the form changes. The server either saves this request once or returns
    // the already-saved order through the recovery lookup below.
    const key = attempt?.key && (!attempt.userId || attempt.userId === state.user?.id) ? attempt.key : crypto.randomUUID();
    attempt = { key, fingerprint, userId: state.user?.id || null };
    state.checkoutAttempt = attempt;
    write('aljahfali_checkout_attempt', attempt);
    request.idempotency_key = attempt.key;
    state.busy = true;
    const button = $('createOrderButton');
    button.disabled = true; button.textContent = 'جارٍ حفظ الطلب…';
    $('storeCurrency').disabled = true;
    setNotice('checkoutFeedback', 'جارٍ حفظ طلبك لدى المتجر…', '');
    try {
      const order = await timeout(cloud.createOrder(request), 20000);
      if (!order || !order.id || !Number.isFinite(Number(order.total))) throw new Error();
      completeOrder(order, request.items);
    } catch (error) {
      if (error?.code === 'idempotency_conflict' && cloud.getOrderByRequestKey) {
        try {
          const saved = await timeout(cloud.getOrderByRequestKey(attempt.key));
          if (saved?.id) { completeOrder(saved); return; }
        } catch (_) { /* Keep the original retry key when recovery also fails. */ }
      }
      const rejected = ['price_changed', 'product_unavailable', 'plan_unavailable', 'quantity_not_allowed', 'too_many_pending_orders', 'price_unavailable', 'invalid_exchange_rates', 'invalid_rounding', 'out_of_stock', 'invalid_coupon', 'coupon_unavailable', 'coupon_limit', 'plan_required', 'invalid_payment_method'];
      if (rejected.includes(error?.code)) clearCheckoutAttempt();
      setNotice('checkoutFeedback', errorMessage(error, 'لم نتلق تأكيد حفظ الطلب. لم تُفرغ السلة؛ أعد المحاولة بالبيانات نفسها لتجنب التكرار.'), 'error');
      // Only a definitive server rejection allows a new price/fingerprint. After a timeout,
      // the order may already exist: retry the exact request with its existing key.
      if (error?.code === 'price_changed' || /تغير السعر/.test(String(error?.message || ''))) {
        try {
          const refreshed = await timeout(cloud.quoteCart(quoteRequest()));
          if (refreshed && Number(refreshed.total) !== Number(state.quote.total)) {
            state.quote = refreshed; $('checkoutSummary').innerHTML = renderSummary(0, refreshed);
            setNotice('checkoutFeedback', 'تغير السعر أو الخصم. راجع الإجمالي المحدث ثم أكد الطلب مجدداً.', 'warning');
          }
        } catch (_) { /* Keep existing visible error and retry identity. */ }
      }
      button.disabled = false; button.textContent = 'تأكيد وحفظ الطلب';
    } finally { state.busy = false; $('storeCurrency').disabled = !!state.order; }
  }
  function completeOrder(order, purchasedItems = order.items) {
    state.order = order;
    // Clear purchased quantities only after a durable response. Preserve additions
    // made in another tab or since a timed-out request was originally submitted.
    const currentCart = normalizeCart(read('aljahfali_cart', state.cart));
    const purchased = normalizeCart(purchasedItems || []);
    state.cart = currentCart.map(item => {
      const saved = purchased.find(row => row.product_id === item.product_id && row.plan_id === item.plan_id);
      return { ...item, quantity: item.quantity - (saved?.quantity || 0) };
    }).filter(item => item.quantity > 0);
    saveCart();
    clearCheckoutAttempt();
    state.coupon = ''; write('aljahfali_coupon', '');
    params.set('order', order.id);
    history.replaceState(null, '', 'checkout.html?order=' + encodeURIComponent(order.id));
    renderOrder();
    $('checkoutContent').scrollIntoView({ block: 'start' });
  }
  function renderOrder() {
    const order = state.order;
    if (!order) return;
    state.currency = currencies[order.currency] ? order.currency : state.currency;
    $('storeCurrency').value = state.currency; $('storeCurrency').disabled = true;
    $('checkoutStepOrder').classList.remove('current'); $('checkoutStepPayment').classList.add('current');
    const method = order.payment_method_snapshot || {};
    const status = order.order_status || order.status;
    const paymentState = order.payment_status || 'pending';
    const canSubmit = status === 'awaiting_payment' && !['confirmed', 'paid', 'verified', 'refunded'].includes(paymentState);
    const pendingReview = ['payment_review', 'awaiting_review'].includes(status) || ['pending_review', 'review', 'submitted'].includes(paymentState);
    const statusLabel = core.statusLabel(status);
    const summaryItems = Array.isArray(order.items) ? order.items : [];
    $('checkoutContent').innerHTML = `<div class="order-success"><span class="eyebrow">تم حفظ الطلب لدى المتجر</span><h1>${pendingReview ? 'إثبات الدفع بانتظار المراجعة' : 'طلبك محفوظ ويمكنك متابعته'}</h1><div class="order-id">${esc(order.id)}</div><p>حالة الطلب: ${esc(statusLabel)}. ${pendingReview ? 'سيراجع الفريق التحويل قبل بدء التفعيل.' : 'لا يتم تفعيل الاشتراك قبل التحقق من الدفع.'}</p></div><div class="checkout-layout"><div><section class="panel"><h2>تفاصيل التحويل</h2><p class="small muted">استخدم بيانات وسيلة الدفع المحفوظة مع طلبك.</p><div class="transfer-details"><div class="transfer-row"><span>وسيلة الدفع</span><strong>${esc(method.name || order.payment_method || 'تواصل مع الدعم لتأكيد بيانات التحويل')}</strong></div><div class="transfer-row"><span>المبلغ المطلوب</span><strong class="price-value">${esc(money(order.total))}</strong></div>${method.recipient_name ? `<div class="transfer-row"><span>اسم المستلم</span><strong>${esc(method.recipient_name)}</strong><button class="btn btn-secondary btn-small" type="button" data-action="copy" data-copy="${esc(method.recipient_name)}">نسخ</button></div>` : ''}${method.account_number ? `<div class="transfer-row"><span>الحساب أو المحفظة</span><code>${esc(method.account_number)}</code><button class="btn btn-secondary btn-small" type="button" data-action="copy" data-copy="${esc(method.account_number)}">نسخ الرقم</button></div>` : ''}${method.instructions ? `<p class="transfer-instructions">${esc(method.instructions)}</p>` : ''}</div><div class="notice warning">رفع السند لا يعني نجاح الدفع. يتم تأكيد الدفع بعد التحقق بواسطة إدارة المتجر.</div>${canSubmit ? `<form id="receiptForm" class="receipt-form"><h3 class="panel-title">إرسال إثبات التحويل</h3><div class="field"><label for="paymentReference">الرقم المرجعي للتحويل</label><input id="paymentReference" name="reference" maxlength="150" autocomplete="off" placeholder="رقم العملية أو الحوالة"></div><div class="field"><label for="paymentReceipt">سند التحويل</label><input id="paymentReceipt" name="receipt" type="file" accept="image/jpeg,image/png,image/webp"><p class="field-hint">JPG أو PNG أو WebP، بحد أقصى 5 ميجابايت. أرفق سنداً أو أدخل رقماً مرجعياً.</p></div><button type="submit" class="btn" id="submitReceipt">إرسال للمراجعة</button><div id="receiptFeedback" class="receipt-status" role="status" aria-live="polite"></div></form>` : '<p class="small muted">يمكنك متابعة حالة الدفع والتسليم من حسابك.</p>'}</section></div><aside class="panel summary-panel"><h2 class="panel-title">ملخص الطلب</h2>${summaryItems.map(item => `<div class="summary-row small"><span>${esc(item.title || item.product_id)} × ${Number(item.quantity || item.qty || 1)}</span><strong>${esc(money(item.line_total ?? Number(item.unit_price || 0) * Number(item.quantity || item.qty || 1)))}</strong></div>`).join('')}<div class="summary-row total"><span>الإجمالي المحفوظ</span><strong>${esc(money(order.total))}</strong></div><p class="summary-note">العملة والأسعار محفوظة وقت إنشاء الطلب، ولا تتغير بتحديث سعر الصرف.</p><a class="btn btn-block" href="account.html">متابعة طلباتي</a><a class="btn btn-secondary btn-block space-top" href="https://wa.me/967782611415?text=${encodeURIComponent('مرحباً، أود الاستفسار عن الطلب رقم ' + order.id)}" target="_blank" rel="noopener noreferrer">الدعم عبر واتساب</a><button class="btn btn-quiet btn-block" type="button" data-action="refresh-order">تحديث الحالة</button></aside></div>`;
  }
  async function submitReceipt(event) {
    event.preventDefault();
    if (state.busy || !state.order) return;
    const file = $('paymentReceipt').files[0] || null;
    const reference = $('paymentReference').value.trim();
    if (!file && !reference) { setNotice('receiptFeedback', 'أرفق سند التحويل أو أدخل الرقم المرجعي.', 'error'); return; }
    if (file && (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024 || file.size === 0)) { setNotice('receiptFeedback', 'اختر سنداً من الأنواع المسموحة لا يتجاوز 5 ميجابايت.', 'error'); return; }
    state.busy = true;
    const button = $('submitReceipt'); button.disabled = true; button.textContent = 'جارٍ إرسال الإثبات…';
    try {
      await timeout(cloud.submitPaymentEvidence(state.order.id, file, reference), 25000);
      setNotice('receiptFeedback', 'تم إرسال إثبات التحويل للمراجعة. الدفع بانتظار التحقق.', 'success');
      button.textContent = 'تم الإرسال للمراجعة';
      try { state.order = await timeout(cloud.getOrder(state.order.id)); renderOrder(); setNotice('receiptFeedback', 'تم استلام إثبات التحويل. ستصلك نتيجة المراجعة في حسابك.', 'success'); } catch (_) { /* Evidence persisted even if refreshing order fails. */ }
    } catch (error) {
      setNotice('receiptFeedback', errorMessage(error, 'تعذر إرسال الإثبات. طلبك محفوظ؛ أعد المحاولة بعد التحقق من الاتصال.'), 'error');
      button.disabled = false; button.textContent = 'إرسال للمراجعة';
    } finally { state.busy = false; }
  }

  async function renderPage() {
    if (page === 'catalog') renderCatalog();
    else if (page === 'product') renderProduct();
    else if (page === 'cart') renderCart();
    else if (page === 'checkout') await renderCheckout();
  }
  function installEvents() {
    $('menuToggle').addEventListener('click', () => {
      const open = $('menuToggle').getAttribute('aria-expanded') !== 'true';
      $('menuToggle').setAttribute('aria-expanded', String(open)); $('storeNav').classList.toggle('open', open);
    });
    $('storeNav').addEventListener('click', () => { $('menuToggle').setAttribute('aria-expanded', 'false'); $('storeNav').classList.remove('open'); });
    $('storeCurrency').value = state.currency;
    $('storeCurrency').addEventListener('change', event => updateCurrency(event.target.value));
    if (page === 'catalog') {
      $('offersFilter').value = params.get('offers') === '1' ? 'offers' : 'all';
      $('filtersToggle').addEventListener('click', () => {
        const open = $('filtersPanel').hidden;
        $('filtersPanel').hidden = !open; $('filtersToggle').setAttribute('aria-expanded', String(open));
      });
      ['searchInput', 'minPrice', 'maxPrice', 'availabilityFilter', 'durationFilter', 'activationFilter', 'offersFilter', 'sortProducts'].forEach(id => {
        $(id).addEventListener(['searchInput', 'minPrice', 'maxPrice'].includes(id) ? 'input' : 'change', () => { state.shown = 12; renderCatalog(); });
      });
      $('resetFilters').addEventListener('click', resetFilters);
      $('loadMore').addEventListener('click', () => { state.shown += 12; renderCatalog(); });
    }
    document.addEventListener('change', event => {
      if (event.target.id === 'productPlan') { state.selectedPlan = event.target.value; renderProduct(); $('productPlan')?.focus(); }
    });
    document.addEventListener('submit', async event => {
      if (event.target.id === 'checkoutForm') return createOrder(event);
      if (event.target.id === 'receiptForm') return submitReceipt(event);
      if (event.target.id === 'couponForm') {
        event.preventDefault();
        state.coupon = $('couponInput').value.trim().toUpperCase();
        state.quote = null;
        write('aljahfali_coupon', state.coupon);
        await refreshQuote('couponFeedback');
      }
    });
    document.addEventListener('click', async event => {
      const category = event.target.closest('[data-category]');
      if (category) { state.category = category.dataset.category; state.shown = 12; buildFilters(); renderCatalog(); return; }
      const button = event.target.closest('[data-action]');
      if (!button || button.disabled) return;
      const action = button.dataset.action;
      if (action === 'add-product') addToCart(button.dataset.product);
      if (action === 'add-selected') addToCart(button.dataset.product, state.selectedPlan || null);
      if (action === 'reset-filters') resetFilters();
      if (action === 'retry-catalog') { button.disabled = true; await loadCatalog(); }
      if (['increase-quantity', 'decrease-quantity', 'remove-item'].includes(action)) {
        const index = Number(button.dataset.index), item = state.cart[index];
        if (!item) return;
        if (action === 'remove-item') state.cart.splice(index, 1);
        else {
          const delta = action === 'increase-quantity' ? 1 : -1;
          const maximum = maxQuantity(resolveItem(item).entity);
          item.quantity = Math.max(1, Math.min(maximum, item.quantity + delta));
        }
        saveCart(); renderCart();
      }
      if (action === 'clear-cart') { state.cart = []; saveCart(); renderCart(); toast('تم تفريغ السلة.'); }
      if (action === 'refresh-quote') { button.disabled = true; await refreshQuote(); button.disabled = false; }
      if (action === 'copy') {
        try { await navigator.clipboard.writeText(button.dataset.copy); toast('تم نسخ بيانات التحويل.'); }
        catch (_) { toast('تعذر النسخ التلقائي. يمكنك تحديد البيانات ونسخها يدوياً.'); }
      }
      if (action === 'refresh-order') {
        button.disabled = true;
        try { state.order = await timeout(cloud.getOrder(state.order.id)); renderOrder(); toast('تم تحديث حالة الطلب.'); }
        catch (_) { button.disabled = false; toast('تعذر تحديث الحالة. حاول مجدداً.'); }
      }
    });
    window.addEventListener('storage', event => {
      if (state.busy || state.order) return;
      if (event.key === 'aljahfali_cart' || event.key === 'aljahfali_coupon' || event.key === null) {
        state.cart = normalizeCart(read('aljahfali_cart', []));
        state.coupon = String(read('aljahfali_coupon', '') || '');
        state.quote = null;
        state.quoteSequence++;
        state.checkoutRenderSequence++;
        updateBadge();
        if (page === 'cart' || page === 'checkout') renderPage();
      }
      if (event.key === 'aljahfali_currency' || event.key === null) {
        const value = read('aljahfali_currency', 'usd');
        if (currencies[value]) { $('storeCurrency').value = value; updateCurrency(value); }
      }
    });
  }

  async function init() {
    if (!core || !cloud) {
      const target = $('catalogNotice');
      if (target) target.innerHTML = '<div class="notice error">تعذر تشغيل المتجر. أعد تحميل الصفحة أو تواصل مع الدعم.</div>';
      return;
    }
    write('aljahfali_cart', state.cart);
    updateBadge(); installEvents();
    try { await loadCatalog(); }
    catch (_) {
      setNotice('catalogNotice', 'تعذر عرض بيانات المتجر. يرجى إعادة المحاولة.', 'error', '<button type="button" class="btn btn-secondary btn-small" data-action="retry-catalog">إعادة المحاولة</button>');
      document.querySelectorAll('[aria-busy="true"]').forEach(el => el.setAttribute('aria-busy', 'false'));
    }
  }
  init();
})();
