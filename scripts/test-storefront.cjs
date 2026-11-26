/* Isolated behavior tests: no production network, credentials, users or orders. */
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const coreSource = fs.readFileSync('assets/js/store-core.js', 'utf8');
const source = fs.readFileSync('assets/js/storefront.js', 'utf8');
new vm.Script(source, { filename: 'storefront.js' });

function harness(page = 'catalog', storageValues = {}, blockStorage = false) {
  const elements = new Map();
  const listeners = new Map();
  const values = new Map(Object.entries(storageValues));
  const get = id => {
    if (!elements.has(id)) elements.set(id, {
      id, value: '', innerHTML: '', textContent: '', hidden: false, disabled: false,
      dataset: {}, files: [], attributes: {}, classList: { add() {}, remove() {}, toggle() {} },
      setAttribute(name, value) { this.attributes[name] = value; }, getAttribute(name) { return this.attributes[name]; },
      addEventListener(name, fn) { listeners.set(id + ':' + name, fn); },
      querySelector() { return { disabled: false }; }, focus() {}, scrollIntoView() {}, reportValidity() { return true; }
    });
    return elements.get(id);
  };
  const api = { config: { isConfigured: () => false }, catalogSource: 'local',
    fetchProducts: async () => [], fetchRates: async () => ({}), fetchPlans: async () => [], fetchCategories: async () => [],
    getCurrentUser: async () => null, fetchCatalogSales: async () => [], fetchPaymentMethods: async () => [],
    quoteCart: async () => ({ items: [], subtotal: 10, discount: 0, total: 10, currency: 'usd' })
  };
  const location = { href: 'https://test.invalid/' + (page === 'catalog' ? 'subscriptions' : page) + '.html', search: '' };
  const context = { console, URL, URLSearchParams, Intl, Map, Set, Number, String, Array, Object, Date, Promise, Error,
    crypto: { randomUUID }, location,
    setTimeout: () => 1, clearTimeout() {},
    history: { replaceState() {} }, navigator: { clipboard: { writeText: async () => {} } },
    document: {
      body: { dataset: { storePage: page } },
      getElementById: get,
      querySelectorAll: () => [],
      querySelector: selector => selector.includes('payment_method') ? { value: 'bank-test' } : { content: '', href: '' },
      createElement: () => ({ setAttribute() {}, textContent: '', type: '' }), head: { appendChild() {} },
      addEventListener: (name, fn) => listeners.set('document:' + name, fn)
    },
    localStorage: {
      getItem: key => { if (blockStorage) throw Error('blocked'); return values.get(key) ?? null; },
      setItem: (key, value) => { if (blockStorage) throw Error('blocked'); values.set(key, value); }
    },
    AlJahfaliCloud: api, PRODUCTS_CATALOG: [], addEventListener: (name, fn) => listeners.set('window:' + name, fn)
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(coreSource, context);
  vm.runInContext(source.replace(/\n  init\(\);\n\}\)\(\);\s*$/, '\n  window.__storeTest = {state, normalizeCart, resolveItem, addToCart, productCard, filteredProducts, buildFilters, renderCatalog, renderCart, renderCheckout, renderOrder, createOrder, refreshQuote, updateCurrency, loadCatalog, installEvents};\n})();'), context);
  for (const [id, value] of Object.entries({ availabilityFilter: 'all', offersFilter: 'all', sortProducts: 'default' })) get(id).value = value;
  return { app: context.__storeTest, context, api, get, values, listeners };
}

const product = (overrides = {}) => ({ id: 'p1', title: 'اشتراك ChatGPT', service_key: 'chatgpt', service_name: 'OpenAI', brand_label: 'ChatGPT', category: 'ai', icon: 'assets/official_icons/openai.svg', prices: { usd: 10, sar: 40, yer_sanaa: 5000, yer_aden: 20000 }, in_stock: true, stock: 10, duration: 'شهر', modal_data: {}, ...overrides });
let passed = 0;
async function test(name, action) { await action(); console.log('PASS', name); passed++; }

(async () => {
  await test('Malformed persisted cart is recovered instead of blocking initialization', () => {
    const h = harness('catalog', { aljahfali_cart: '{broken json' });
    assert.equal(h.app.state.cart.length, 0);
    h.app.state.products = [product()]; h.app.renderCatalog();
    assert.match(h.get('productsGrid').innerHTML, /ChatGPT/);
    assert.equal(h.get('productsGrid').attributes['aria-busy'], 'false');
  });
  await test('Cart migration strips client-supplied prices, titles and user fields', () => {
    const h = harness();
    const items = h.app.normalizeCart([{ id: 'p1', qty: 1, prices: { usd: 0 }, title: '<img onerror=x>', user_id: 'victim' }, { product_id: 'p1', quantity: 2 }, { id: 'invalid', qty: -1 }]);
    assert.equal(items.length, 1); assert.equal(items[0].quantity, 3);
    assert.deepEqual(Object.keys(items[0]).sort(), ['plan_id', 'product_id', 'quantity']);
  });
  await test('Product/plan availability and per-plan quantity limits are enforced', () => {
    const h = harness(); h.app.state.products = [product()];
    h.app.addToCart('p1'); h.app.addToCart('p1'); assert.equal(h.app.state.cart[0].quantity, 1);
    h.app.state.plans = [{ id: 'monthly', product_id: 'p1', name: 'Monthly', in_stock: true, stock: 2, allow_quantity: true, max_quantity: 5, prices: { usd: 8 } }];
    assert.equal(h.app.resolveItem(h.app.state.cart[0]).valid, false);
    h.app.state.cart = []; h.app.addToCart('p1', 'monthly'); h.app.addToCart('p1', 'monthly'); h.app.addToCart('p1', 'monthly');
    assert.equal(h.app.state.cart[0].quantity, 2);
    h.app.state.plans[0].in_stock = false;
    assert.equal(h.app.resolveItem(h.app.state.cart[0]).valid, false);
  });
  await test('Untrusted product data cannot inject markup, handlers or javascript URLs', () => {
    const h = harness();
    const card = h.app.productCard(product({ title: '<img src=x onerror=alert(1)>', brand_label: '"><script>alert(1)</script>', card_desc: '<svg onload=alert(1)>', icon: 'javascript:alert(1)' }));
    assert(!card.includes('<script>')); assert(!card.includes('<svg onload')); assert(!card.includes('javascript:'));
    assert(card.includes('&lt;script&gt;')); assert(card.includes('assets/logo.png'));
  });
  await test('Arabic/English search, price, duration and offers filter actual data', () => {
    const h = harness(); h.app.state.products = [product({ title: 'إشتراك شات جي بي تي' }), product({ id: 'p2', title: 'Canva', service_name: 'Canva', service_key: 'canva', brand_label: 'Canva', category: 'design', prices: { usd: 5 }, compare_at_prices: { usd: 7 } })];
    h.get('searchInput').value = 'اشتراك'; assert.equal(h.app.filteredProducts().length, 1);
    h.get('searchInput').value = 'OPENAI'; assert.equal(h.app.filteredProducts()[0].id, 'p1');
    h.get('searchInput').value = ''; h.get('maxPrice').value = '6'; assert.equal(h.app.filteredProducts()[0].id, 'p2');
    h.get('maxPrice').value = ''; h.get('offersFilter').value = 'offers'; assert.equal(h.app.filteredProducts().length, 1);
    h.get('offersFilter').value = 'all'; h.get('durationFilter').value = 'سنة'; assert.equal(h.app.filteredProducts().length, 0);
  });
  await test('Bestseller sorting uses actual paid sales rather than legacy sold constants', () => {
    const h = harness(); h.app.state.products = [product({ sold: 9999 }), product({ id: 'p2', sold: 1 })];
    h.app.state.sales = new Map([['p1', 1], ['p2', 5]]); h.get('sortProducts').value = 'popular';
    assert.equal(h.app.filteredProducts()[0].id, 'p2');
  });
  await test('An empty authoritative cloud catalog does not resurrect local products', async () => {
    const h = harness(); h.context.PRODUCTS_CATALOG = [product()]; h.api.catalogSource = 'cloud';
    h.api.fetchProducts = async () => [];
    await h.app.loadCatalog();
    assert.equal(h.app.state.products.length, 0); assert.equal(h.app.state.source, 'cloud');
    assert.match(h.get('productsGrid').innerHTML, /لا توجد منتجات/);
  });
  await test('Stored cart price changes are shown and currency invalidates quotes', () => {
    const h = harness('cart', { aljahfali_cart_last_prices: JSON.stringify({ 'p1::usd': 8 }) });
    h.app.state.products = [product()]; h.app.state.cart = [{ product_id: 'p1', plan_id: null, quantity: 1 }];
    h.app.renderCart(); assert.match(h.get('cartContent').innerHTML, /تغير سعر/);
    h.app.state.quote = { total: 10 }; h.app.state.checkoutAttempt = { key: 'old' };
    h.app.updateCurrency('sar'); assert.equal(h.app.state.quote, null); assert.equal(h.app.state.checkoutAttempt.key, 'old', 'An uncertain prior write keeps its key even if the currency changes');
    assert.match(h.get('cartContent').innerHTML, /ر\.س/);
  });
  await test('Null cached cart prices do not prevent rendering a valid basket', () => {
    const h = harness('cart', { aljahfali_cart_last_prices: 'null' });
    h.app.state.products = [product()]; h.app.state.cart = [{ product_id: 'p1', plan_id: null, quantity: 1 }];
    h.app.renderCart(); assert.match(h.get('cartContent').innerHTML, /ChatGPT/);
  });
  await test('Checkout failure keeps cart; retry reuses idempotency key even with storage blocked', async () => {
    const h = harness('checkout', {}, true); h.app.state.products = [product()]; h.app.state.cart = [{ product_id: 'p1', plan_id: null, quantity: 1 }];
    h.app.state.quote = { items: [], total: 10, currency: 'usd' }; h.get('customerName').value = 'عميل الاختبار'; h.get('customerPhone').value = '+967700000000';
    const keys = []; h.api.createOrder = async request => { keys.push(request.idempotency_key); throw Error('offline'); };
    h.api.quoteCart = async () => ({ items: [], total: 20, currency: 'usd' });
    const event = { preventDefault() {}, target: { reportValidity: () => true } };
    await h.app.createOrder(event); await h.app.createOrder(event);
    assert.equal(h.app.state.cart.length, 1); assert.equal(keys.length, 2); assert.equal(keys[0], keys[1]);
    assert.equal(h.app.state.quote.total, 10, 'An uncertain write must retain the exact price/fingerprint for its retry');
    assert.match(h.get('checkoutFeedback').innerHTML, /لم نتلق تأكيد/);
  });
  await test('Repeated confirm clicks produce one in-flight order and only durable success clears cart', async () => {
    const h = harness('checkout'); h.app.state.products = [product()]; h.app.state.cart = [{ product_id: 'p1', plan_id: null, quantity: 1 }];
    h.app.state.quote = { items: [], total: 10, currency: 'usd' }; h.get('customerName').value = 'عميل الاختبار'; h.get('customerPhone').value = '+967700000000';
    let finish, calls = 0; h.api.createOrder = request => { calls++; return new Promise(resolve => { finish = resolve; }); };
    const event = { preventDefault() {}, target: { reportValidity: () => true } };
    const first = h.app.createOrder(event); await h.app.createOrder(event);
    assert.equal(calls, 1); assert.equal(h.app.state.cart.length, 1);
    finish({ id: 'TEST-ORDER', total: 10, currency: 'usd', order_status: 'awaiting_payment', payment_status: 'awaiting', items: [] }); await first;
    assert.equal(h.app.state.cart.length, 0); assert.equal(h.app.state.order.id, 'TEST-ORDER');
    assert.match(h.get('checkoutContent').innerHTML, /paymentReceipt/);
  });
  await test('Evidence submission is not offered while payment is already under review', () => {
    const h = harness('checkout'); h.app.state.order = { id: 'TEST-ORDER', total: 10, currency: 'usd', order_status: 'payment_review', payment_status: 'review', items: [] };
    h.app.renderOrder();
    assert(!h.get('checkoutContent').innerHTML.includes('id="receiptForm"'));
    assert.match(h.get('checkoutContent').innerHTML, /بانتظار المراجعة/);
  });
  await test('Cross-tab cart changes replace the displayed checkout and discard older pending quotes', async () => {
    const h = harness('checkout'); h.app.installEvents();
    h.app.state.user = { id: 'u1' }; h.app.state.source = 'cloud';
    h.app.state.products = [product(), product({ id: 'p2' })];
    h.app.state.cart = [{ product_id: 'p1', plan_id: null, quantity: 1 }];
    let oldQuote; h.api.quoteCart = () => new Promise(resolve => { oldQuote = resolve; });
    const pending = h.app.refreshQuote('checkoutFeedback');
    h.api.quoteCart = async () => ({ items: [{ product_id: 'p2', title: 'New product', quantity: 1, line_total: 10 }], total: 10, subtotal: 10, currency: 'usd' });
    h.values.set('aljahfali_cart', JSON.stringify([{ product_id: 'p2', quantity: 1 }]));
    h.listeners.get('window:storage')({ key: 'aljahfali_cart' });
    await new Promise(resolve => setImmediate(resolve));
    oldQuote({ items: [], total: 999, currency: 'usd' }); await pending;
    assert.equal(h.app.state.cart[0].product_id, 'p2');
    assert.equal(h.app.state.quote.total, 10);
    assert.match(h.get('checkoutContent').innerHTML, /New product/);
  });
  await test('Changed details after a lost response reuse the key and recover the already-saved order', async () => {
    const h = harness('checkout'); h.app.state.products = [product()];
    h.app.state.cart = [{ product_id: 'p1', plan_id: null, quantity: 1 }];
    h.app.state.quote = { items: [], total: 10, currency: 'usd' };
    h.get('customerName').value = 'عميل الاختبار'; h.get('customerPhone').value = '+967700000000';
    const keys = []; h.api.createOrder = async request => { keys.push(request.idempotency_key); throw Error('timeout'); };
    const event = { preventDefault() {}, target: { reportValidity: () => true } };
    await h.app.createOrder(event);
    h.get('customerName').value = 'اسم آخر';
    h.app.state.cart.push({ product_id: 'new-selection', plan_id: null, quantity: 1 });
    h.api.createOrder = async request => { keys.push(request.idempotency_key); throw Object.assign(Error('Conflict'), { code: 'idempotency_conflict' }); };
    h.api.getOrderByRequestKey = async key => ({ id: 'SAVED-ORDER', total: 10, currency: 'usd', order_status: 'awaiting_payment', items: [{ product_id: 'p1', quantity: 1 }] });
    await h.app.createOrder(event);
    assert.equal(keys[0], keys[1]); assert.equal(h.app.state.order.id, 'SAVED-ORDER');
    assert.equal(h.app.state.cart.length, 1); assert.equal(h.app.state.cart[0].product_id, 'new-selection');
  });
  await test('Reload recovers an uncertain order before attempting a new quote or checking availability', async () => {
    const h = harness('checkout', { aljahfali_checkout_attempt: JSON.stringify({ key: 'prior-request', userId: 'u1' }) });
    h.app.state.user = { id: 'u1' }; h.app.state.source = 'local';
    h.api.getOrderByRequestKey = async key => { assert.equal(key, 'prior-request'); return { id: 'RECOVERED-ORDER', total: 10, currency: 'usd', order_status: 'awaiting_payment', items: [] }; };
    h.api.quoteCart = async () => { throw Error('Should not quote a previously saved order'); };
    await h.app.renderCheckout();
    assert.equal(h.app.state.order.id, 'RECOVERED-ORDER'); assert.equal(h.app.state.checkoutAttempt, null);
    assert.match(h.get('checkoutContent').innerHTML, /RECOVERED-ORDER/);
  });
  console.log(`Storefront: ${passed} behavior tests passed. No network requests made.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
