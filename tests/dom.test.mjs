import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { JSDOM, VirtualConsole } from 'jsdom';

// Actual HTML and shipped local scripts; no external resources, real credentials or API calls.
// JSDOM validates DOM behavior, not browser layout, pixels or responsive breakpoints.
const root = process.cwd();
const catalog = JSON.parse(fs.readFileSync('assets/data/products.json', 'utf8'));

async function settle(predicate, description) {
  for (let count = 0; count < 80; count++) {
    if (predicate()) return;
    await new Promise(resolve => setTimeout(resolve, 5));
  }
  assert.fail(`DOM did not settle: ${description}`);
}

async function openPage(t, filename, { query = '', storage = {}, mockAPI } = {}) {
  const errors = [], network = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', error => errors.push(error));
  const dom = new JSDOM(fs.readFileSync(path.join(root, filename), 'utf8'), {
    url: `https://isolated-store.test/${filename}${query}`,
    runScripts: 'outside-only',
    virtualConsole
  });
  const { window } = dom;
  window.addEventListener('error', event => errors.push(event.error || event.message));
  window.addEventListener('unhandledrejection', event => errors.push(event.reason));
  window.fetch = async (...args) => { network.push(args); throw new Error('Network is disabled in isolated DOM tests'); };
  window.XMLHttpRequest = class { open(...args) { network.push(args); throw new Error('XHR is disabled in isolated DOM tests'); } };
  window.HTMLElement.prototype.scrollIntoView = function () {};
  // JSDOM has no dialog top layer; preserve the open/closed DOM state for flow tests.
  window.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  window.HTMLDialogElement.prototype.close = function () { this.open = false; };
  Object.entries(storage).forEach(([key, value]) => window.localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value)));
  t.after(() => {
    window.close();
    assert.deepEqual(network, [], `${filename} attempted an external request`);
    assert.deepEqual(errors.map(error => String(error?.message || error)), [], `${filename} had uncaught runtime errors`);
  });
  for (const script of window.document.querySelectorAll('script[src]')) {
    const source = script.getAttribute('src');
    assert(!/^https?:|^\/\//.test(source), 'Application scripts must be local for these tests');
    if (mockAPI && /(?:storefront|auth|account|admin|assistant-help)\.js$/.test(source)) window.AlJahfaliCloud = mockAPI(window);
    window.eval(fs.readFileSync(path.join(root, source), 'utf8') + `\n//# sourceURL=${source}`);
    if (source.endsWith('/store-config.js')) {
      // Never initialize the SDK against a deployed project, even if a maintainer filled config.
      window.ALJAHFALI_CONFIG = Object.freeze({ supabaseUrl: 'https://isolated-store.test', supabasePublishableKey: '', auth: { googleEnabled: false }, requestTimeoutMs: 1000 });
    }
  }
  await new Promise(resolve => setImmediate(resolve));
  return {
    window, document: window.document,
    get: id => window.document.getElementById(id),
    input(id, value, type = 'input') {
      const element = window.document.getElementById(id);
      element.value = value;
      element.dispatchEvent(new window.Event(type, { bubbles: true }));
    }
  };
}

test('real catalog renders, searches in both languages, filters and loads the full preserved catalog', async t => {
  const h = await openPage(t, 'subscriptions.html');
  await settle(() => h.get('productsGrid').getAttribute('aria-busy') === 'false', 'catalog');
  assert.equal(h.document.querySelectorAll('.product-card').length, 12);
  assert.match(h.get('resultsCount').textContent, /34/);
  assert.equal(h.document.querySelectorAll('[data-category]').length, 7);
  h.input('searchInput', 'ChatGPT');
  assert.equal(h.document.querySelectorAll('.product-card').length, 4);
  h.input('searchInput', 'شات جي بي تي');
  assert.equal(h.document.querySelectorAll('.product-card').length, 4);
  h.input('searchInput', 'nothing-matches-this-search');
  assert.equal(h.document.querySelectorAll('.product-card').length, 0);
  assert.match(h.get('productsGrid').textContent, /لم نجد/);
  h.document.querySelector('[data-action="reset-filters"]').click();
  assert.equal(h.document.querySelectorAll('.product-card').length, 12);
  h.get('loadMore').click(); h.get('loadMore').click();
  assert.equal(h.document.querySelectorAll('.product-card').length, catalog.length);
  assert.equal(h.get('loadMoreWrap').hidden, true);
  h.document.querySelector('[data-category="security"]').click();
  assert.equal(h.document.querySelectorAll('.product-card').length, catalog.filter(p => p.category === 'security').length);
  h.get('filtersToggle').click(); assert.equal(h.get('filtersPanel').hidden, false);
  h.get('menuToggle').click(); assert.equal(h.get('menuToggle').getAttribute('aria-expanded'), 'true');
});

test('real catalog recovers corrupted storage, persists currency and adds an IDs-only cart', async t => {
  const h = await openPage(t, 'subscriptions.html', { storage: { aljahfali_cart: '{bad json' } });
  await settle(() => h.document.querySelectorAll('.product-card').length === 12, 'catalog with corrupted cart');
  assert.equal(h.get('cartBadge').textContent, '0');
  h.input('storeCurrency', 'sar', 'change');
  assert.equal(JSON.parse(h.window.localStorage.getItem('aljahfali_currency')), 'sar');
  assert.match(h.document.querySelector('.price-value').textContent, /ر\.س/);
  h.document.querySelector('[data-action="add-product"]').click();
  const cart = JSON.parse(h.window.localStorage.getItem('aljahfali_cart'));
  assert.equal(cart.length, 1);
  assert.deepEqual(Object.keys(cart[0]).sort(), ['plan_id', 'product_id', 'quantity']);
  assert.equal(h.get('cartBadge').textContent, '1');
  h.document.querySelector('[data-action="add-product"]').click();
  assert.equal(h.get('cartBadge').textContent, '1', 'legacy products do not silently allow multiple seats');
});

test('actual product route renders complete stored detail, safe sharing and related products', async t => {
  const product = catalog[0];
  const h = await openPage(t, 'product.html', { query: '?id=' + encodeURIComponent(product.id) });
  await settle(() => h.get('productContent').getAttribute('aria-busy') === 'false', 'product detail');
  assert.equal(h.document.querySelector('#productContent h1').textContent, product.title);
  assert.match(h.get('productContent').textContent, /خطوات التفعيل/);
  assert(h.get('productContent').textContent.includes(product.modal_data.features[0]));
  assert(h.document.querySelector('link[rel="canonical"]').href.endsWith('product.html?id=' + product.id));
  const structured = JSON.parse(h.get('productStructuredData').textContent);
  assert.equal(structured.sku, product.id); assert.equal(structured.offers, undefined, 'offline prices are not published as verified offers');
  assert(h.document.querySelectorAll('#relatedGrid .product-card').length > 0);
  h.get('productAdd').click();
  assert.equal(JSON.parse(h.window.localStorage.getItem('aljahfali_cart'))[0].product_id, product.id);
});

test('missing product is explicit and real cart controls preserve quantities and delete correctly', async t => {
  const missing = await openPage(t, 'product.html', { query: '?id=does-not-exist' });
  await settle(() => missing.get('productContent').getAttribute('aria-busy') === 'false', 'missing product');
  assert.match(missing.get('productContent').textContent, /المنتج غير متاح/);
  const h = await openPage(t, 'cart.html', { storage: { aljahfali_cart: [{ product_id: catalog[0].id, plan_id: null, quantity: 1 }], aljahfali_currency: JSON.stringify('sar') } });
  await settle(() => h.document.querySelector('.cart-item'), 'cart');
  assert(h.document.querySelector('.cart-item').textContent.includes(catalog[0].title));
  assert.equal(h.document.querySelector('[data-action="increase-quantity"]').disabled, true);
  assert.match(h.get('cartSummary').textContent, /ر\.س/);
  h.document.querySelector('[data-action="remove-item"]').click();
  assert.match(h.get('cartContent').textContent, /سلتك بانتظار/);
  assert.equal(JSON.parse(h.window.localStorage.getItem('aljahfali_cart')).length, 0);
});

test('actual checkout without a session requests login and never creates a fake order', async t => {
  const h = await openPage(t, 'checkout.html', { storage: { aljahfali_cart: [{ product_id: catalog[0].id, plan_id: null, quantity: 1 }] } });
  await settle(() => h.get('checkoutContent').getAttribute('aria-busy') === 'false', 'guest checkout');
  assert.match(h.get('checkoutContent').textContent, /سجّل الدخول/);
  assert.equal(h.document.querySelector('#checkoutContent a.btn').getAttribute('href'), 'login.html?next=checkout.html');
  assert.equal(h.window.localStorage.getItem('aljahfali_orders'), null);
  assert.equal(JSON.parse(h.window.localStorage.getItem('aljahfali_cart')).length, 1);
});

test('actual login, account and admin templates fail closed when public configuration is absent', async t => {
  const login = await openPage(t, 'login.html');
  await settle(() => !login.get('authMessage').hidden, 'login guard');
  assert.match(login.get('authMessage').textContent, /غير متاحة/);
  assert.equal(login.get('googleArea').hidden, true);
  login.get('signupTab').click(); assert.equal(login.get('signupForm').hidden, false);
  login.get('signinTab').click(); login.get('forgotPassword').click(); assert.equal(login.get('recoveryForm').hidden, false);
  const account = await openPage(t, 'account.html');
  await settle(() => account.get('accountLoading').hidden, 'account guard');
  assert.equal(account.get('accountApp').hidden, true); assert.match(account.get('accountMessage').textContent, /غير متاحة/);
  assert(account.document.querySelector('#subscriptionFilter option[value="active"]'), 'active subscription option must be a valid option');
  const admin = await openPage(t, 'admin.html');
  await settle(() => !admin.get('guardContent').hidden, 'admin guard');
  assert.equal(admin.get('adminApp').hidden, true); assert.equal(admin.get('adminGuard').hidden, false);
  assert.match(admin.get('guardMessage').textContent, /Supabase/);
});

test('actual product plan selector requires an available plan and records that plan ID', async t => {
  const product = { ...catalog[0], id: 'isolated-product' };
  const plan = { id: 'isolated-plan', product_id: product.id, name: 'باقة اختبار معزولة', duration: 'شهر', duration_days: 30, prices: { usd: 7 }, in_stock: true, stock: 3, allow_quantity: false, is_active: true };
  const h = await openPage(t, 'product.html', {
    query: '?id=' + product.id,
    mockAPI: () => ({ config: { isConfigured: () => true }, catalogSource: 'cloud', fetchProducts: async () => [product], fetchRates: async () => ({ rates_per_usd: { usd: 1 }, rounding: { usd: .01 } }), fetchPlans: async () => [plan], fetchCategories: async () => [], getCurrentUser: async () => null, fetchCatalogSales: async () => [] })
  });
  await settle(() => h.get('productPlan'), 'configured product plans');
  assert.equal(h.get('productAdd').disabled, true);
  h.input('productPlan', plan.id, 'change');
  assert.equal(h.get('productAdd').disabled, false);
  h.get('productAdd').click();
  const cart = JSON.parse(h.window.localStorage.getItem('aljahfali_cart'));
  assert.equal(cart[0].plan_id, plan.id); assert.equal(cart[0].product_id, product.id);
});

test('actual DOM safely renders malformed cloud product fields without creating executable nodes', async t => {
  const product = { ...catalog[0], id: 'isolated-xss', title: '<img src=x onerror=alert(1)>', brand_label: '<script>window.bad=1</script>', card_desc: '<svg onload=alert(1)>', icon: 'javascript:alert(1)' };
  const h = await openPage(t, 'subscriptions.html', {
    mockAPI: () => ({ config: { isConfigured: () => true }, catalogSource: 'cloud', fetchProducts: async () => [product], fetchRates: async () => ({}), fetchPlans: async () => [], fetchCategories: async () => [], getCurrentUser: async () => null, fetchCatalogSales: async () => [] })
  });
  await settle(() => h.document.querySelector('.product-card'), 'untrusted catalog data');
  assert.equal(h.document.querySelectorAll('#productsGrid script, #productsGrid [onerror], #productsGrid [onload]').length, 0);
  assert.equal(h.document.querySelector('.product-logo').getAttribute('src'), 'assets/logo.png');
  assert.equal(h.window.bad, undefined);
});

test('authenticated admin opens every section and saves a real product form without dropping legacy data', async t => {
  const product = structuredClone(catalog[0]);
  product.modal_data.legacy_extra = { preserved: true };
  const records = { products: [product], categories: [{ id: product.category, name: 'تصنيف المنتج' }] };
  const writes = [];
  let maintenance = 0;
  const h = await openPage(t, 'admin.html', { mockAPI: () => ({
    config: { isConfigured: () => true },
    requireAdmin: async () => ({ id: 'admin-isolated', email: 'admin@isolated-store.test' }),
    list: async table => structuredClone(records[table] || []),
    financialReport: async () => [],
    fetchRates: async () => ({ rates_per_usd: { usd: 1, sar: 3.75, yer_sanaa: 140, yer_aden: 500 }, rounding: { usd: .01, sar: .01, yer_sanaa: 1, yer_aden: 1 } }),
    save: async (table, record) => { writes.push({ table, record }); records[table] = [structuredClone(record)]; },
    runMaintenance: async () => { maintenance++; return { cancelled_orders: 0, expiry_notifications: 0 }; },
    onAuthStateChange() {}
  }) });
  await settle(() => h.document.querySelector('#sectionContent .stats'), 'authenticated admin overview');
  assert.equal(h.get('adminApp').hidden, false);
  for (const nav of h.document.querySelectorAll('[data-section]')) {
    nav.click();
    await settle(() => !h.document.querySelector('#sectionContent .loading'), 'admin section ' + nav.dataset.section);
    assert.equal(h.document.querySelector('#sectionContent .notice.error'), null, nav.dataset.section + ' must load');
  }
  h.document.querySelector('[data-section="products"]').click();
  await settle(() => h.document.querySelector('[data-action="edit"]'), 'product editor action');
  h.document.querySelector('[data-action="edit"]').click();
  await settle(() => h.get('editorDialog').open, 'product editor dialog');
  const form = h.get('editorForm');
  form.elements.namedItem('title').value = 'عنوان محدث';
  form.requestSubmit();
  await settle(() => writes.length === 1 && !h.get('editorDialog').open, 'durable product save');
  assert.equal(writes[0].table, 'products');
  assert.equal(writes[0].record.id, product.id);
  assert.equal(writes[0].record.title, 'عنوان محدث');
  assert.equal(writes[0].record.prices.usd, product.prices.usd);
  assert.equal(writes[0].record.modal_data.legacy_extra.preserved, true);
  h.get('runMaintenance').click();
  await settle(() => maintenance === 1 && !h.get('runMaintenance').disabled, 'manual maintenance');
  assert.match(h.get('adminMessage').textContent, /اكتمل فحص الانتهاء/);
});

test('customer can cancel only an awaiting-payment order and duplicate clicks wait for the server result', async t => {
  const orders = [
    { id: 'unpaid-isolated', order_status: 'awaiting_payment', payment_status: 'pending', total: 10, currency: 'usd', items: [] },
    { id: 'paid-isolated', order_status: 'paid', payment_status: 'verified', total: 10, currency: 'usd', items: [] }
  ];
  const cancellations = [];
  let finishCancellation;
  const h = await openPage(t, 'account.html', { mockAPI: () => ({
    config: { isConfigured: () => true },
    getCurrentUser: async () => ({ id: 'customer-isolated', email: 'customer@isolated-store.test' }),
    getCurrentProfile: async () => ({ full_name: 'عميل الاختبار' }),
    getUserOrders: async () => structuredClone(orders),
    getUserSubscriptions: async () => [{ id: 'cancelled-sub', product_title: 'اشتراك ملغي', status: 'cancelled' }],
    getUserPayments: async () => [], getUserRenewals: async () => [], getNotifications: async () => [], getSupportTickets: async () => [],
    cancelOrder: async id => { cancellations.push(id); await new Promise(resolve => { finishCancellation = resolve; }); orders[0].order_status = 'cancelled'; },
    onAuthStateChange() {}
  }) });
  h.window.confirm = () => true;
  await settle(() => h.get('accountLoading').hidden, 'authenticated account');
  const buttons = h.document.querySelectorAll('[data-action="cancel"]');
  assert.equal(buttons.length, 1);
  assert.equal(buttons[0].dataset.id, 'unpaid-isolated');
  assert.equal(h.document.querySelector('[data-action="renew"]').disabled, true);
  buttons[0].click(); buttons[0].click();
  assert.deepEqual(cancellations, ['unpaid-isolated']);
  assert.equal(buttons[0].disabled, true);
  assert.equal(h.get('accountMessage').hidden, true, 'no success before server confirmation');
  finishCancellation();
  await settle(() => !h.document.querySelector('[data-action="cancel"]'), 'cancelled order refresh');
  assert.match(h.get('accountMessage').textContent, /تم إلغاء/);
});

test('purchase cost editor limits plans to the currently selected product', async t => {
  const products = catalog.slice(0, 2);
  const plans = products.map((product, index) => ({ id: 'plan-' + index, product_id: product.id, name: 'باقة ' + index }));
  const records = { products, product_plans: plans };
  const h = await openPage(t, 'admin.html', { mockAPI: () => ({
    config: { isConfigured: () => true }, requireAdmin: async () => ({ id: 'admin-isolated' }),
    list: async table => structuredClone(records[table] || []), financialReport: async () => [], onAuthStateChange() {}
  }) });
  await settle(() => h.document.querySelector('#sectionContent .stats'), 'admin cost setup');
  h.document.querySelector('[data-section="costs"]').click();
  await settle(() => h.document.querySelector('[data-action="add"]'), 'add cost action');
  h.document.querySelector('[data-action="add"]').click();
  await settle(() => h.get('editorDialog').open, 'cost editor');
  const form = h.get('editorForm'), product = form.elements.namedItem('product_id'), plan = form.elements.namedItem('plan_id');
  assert.equal(product.value, products[0].id);
  assert.deepEqual([...plan.options].map(option => option.value), ['', plans[0].id]);
  plan.value = plans[0].id;
  product.value = products[1].id;
  product.dispatchEvent(new h.window.Event('change', { bubbles: true }));
  assert.equal(plan.value, '', 'a plan from the previous product cannot remain selected');
  assert.deepEqual([...plan.options].map(option => option.value), ['', plans[1].id]);
});

test('owner can add an unpublished assistant article through the real admin editor', async t => {
  const writes=[];
  const h=await openPage(t,'admin.html',{mockAPI:()=>({
    config:{isConfigured:()=>true},requireAdmin:async()=>({id:'admin-isolated'}),list:async()=>[],financialReport:async()=>[],onAuthStateChange(){},
    save:async(table,record)=>{writes.push({table,record});return {id:'article-isolated'};}
  })});
  await settle(()=>h.document.querySelector('#sectionContent .stats'),'admin knowledge setup');
  h.document.querySelector('[data-section="assistant"]').click();
  await settle(()=>h.document.querySelector('[data-action="add"]'),'add article action');
  h.document.querySelector('[data-action="add"]').click();
  await settle(()=>h.get('editorDialog').open,'article editor');
  const form=h.get('editorForm');
  assert.equal(form.elements.namedItem('published').checked,false,'new knowledge stays a draft');
  form.elements.namedItem('title').value='خدمات تصميم المواقع';
  form.elements.namedItem('body').value='تفاصيل عامة معتمدة يكتبها صاحب المتجر.';
  form.dispatchEvent(new h.window.Event('submit',{bubbles:true,cancelable:true}));
  await settle(()=>writes.length===1&&!h.get('editorDialog').open,'article persisted');
  assert.equal(writes[0].table,'assistant_articles');assert.equal(writes[0].record.published,false);
  assert.equal(writes[0].record.title,'خدمات تصميم المواقع');
});

test('published help article is rendered as text, while unpublished content is never displayed', async t => {
  const id='00000000-0000-4000-a000-000000000001';
  const h=await openPage(t,'assistant-help.html',{query:'?id='+id,mockAPI:()=>({
    config:{isConfigured:()=>true},fetchAssistantArticles:async requested=>{assert.equal(requested,id);return {id,title:'معلومة معتمدة',body:'<img src=x onerror=alert(1)> شرح معتمد',published:true};},onAuthStateChange(){}
  })});
  await settle(()=>!h.get('helpContent').hidden,'published article');
  assert.equal(h.get('helpContent').querySelector('img'),null);assert.match(h.get('helpContent').textContent,/<img/);
  const hidden=await openPage(t,'assistant-help.html',{query:'?id='+id,mockAPI:()=>({config:{isConfigured:()=>true},fetchAssistantArticles:async()=>({id,title:'Draft',body:'PRIVATE DRAFT',published:false}),onAuthStateChange(){}})});
  await settle(()=>/غير منشورة/.test(hidden.get('helpStatus').textContent),'unpublished article');
  assert.equal(hidden.get('helpContent').textContent.includes('PRIVATE'),false);
});
