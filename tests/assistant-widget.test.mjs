import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM, VirtualConsole } from 'jsdom';

const source = fs.readFileSync(new URL('../assets/js/assistant.js', import.meta.url), 'utf8');
const catalog = JSON.parse(fs.readFileSync(new URL('../assets/data/products.json', import.meta.url), 'utf8'));
async function settle(predicate, description = 'assistant response') {
  for (let i = 0; i < 40; i++) { if (predicate()) return; await new Promise(resolve => setImmediate(resolve)); }
  assert.fail('Did not settle: ' + description);
}
function harness(t, options = {}) {
  const errors = [], network = [], calls = [], guideCalls = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', error => errors.push(error.message));
  const dom = new JSDOM('<!doctype html><html lang="ar" dir="rtl"><body><button id="before">المتجر</button><select id="storeCurrency"><option value="usd">USD</option><option value="sar" selected>SAR</option></select></body></html>', {
    url: options.url || 'https://isolated-store.test/product.html?id=prod_chatgpt_plus', runScripts: 'outside-only', virtualConsole
  });
  const { window } = dom;
  window.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  window.HTMLDialogElement.prototype.close = function () { this.open = false; };
  window.ALJAHFALI_CONFIG = { supportPhone: '967782611415', assistant: { enabled: options.enabled !== false } };
  window.PRODUCTS_CATALOG = catalog;
  window.fetch = (...args) => { network.push(args); throw Error('No network in widget tests'); };
  let authListener;
  if (options.api !== false) window.AlJahfaliCloud = {
    config: { isConfigured: () => options.configured === true },
    async askAssistant(payload, requestOptions) {
      calls.push({ payload: structuredClone(payload), requestOptions });
      return options.answer ? options.answer(payload, requestOptions) : { answer: 'إجابة من البيانات المعتمدة', mode: 'ai', sources: [] };
    },
    onAuthStateChange(callback) { authListener = callback; }
  };
  window.StoreAssistantKnowledge = {
    answer(payload, records) { guideCalls.push({ payload: structuredClone(payload), records }); return options.guideAnswer || { answer: 'شرح الشراء من الكتالوج المحلي', mode: 'guide', sources: [{ title: 'الاشتراكات', url: 'subscriptions.html' }], notice: 'تحتاج الأسعار إلى التحقق عند الطلب.' }; }
  };
  window.addEventListener('error', event => errors.push(event.message));
  window.eval(source);
  const get = selector => window.document.querySelector(selector);
  const h = {
    window, calls, guideCalls, get,
    button(label) { return [...window.document.querySelectorAll('button')].find(button => button.textContent === label || button.getAttribute('aria-label') === label); },
    auth(event, id) { authListener?.(event, id ? { user: { id } } : null); },
    send(message) { get('.sa-input').value = message; get('.sa-form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true })); },
    lastReply() { return [...window.document.querySelectorAll('.sa-message-assistant .sa-message-text')].at(-1)?.textContent; }
  };
  t.after(() => { window.close(); assert.deepEqual(network, []); assert.deepEqual(errors, []); });
  return h;
}

test('assistant opens an accessible dialog, traps focus and restores the launcher on Escape', t => {
  const h = harness(t);
  const launcher = h.button('فتح مساعد الجحفلي'); launcher.focus(); launcher.click();
  const dialog = h.get('dialog');
  assert.equal(dialog.open, true);
  assert.equal(launcher.getAttribute('aria-expanded'), 'true');
  assert.equal(h.window.document.activeElement, h.get('.sa-input'));
  h.get('.sa-help').focus();
  dialog.dispatchEvent(new h.window.KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
  assert.equal(h.window.document.activeElement, h.button('إغلاق المساعد'));
  dialog.dispatchEvent(new h.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
  assert.equal(dialog.open, false);
  assert.equal(h.window.document.activeElement, launcher);
  assert.equal(h.window.document.body.classList.contains('sa-dialog-open'), false);
});

test('unconfigured pages use the local catalog honestly with currency and product context', async t => {
  const h = harness(t, { api: false });
  h.button('طريقة الشراء').click();
  await settle(() => h.guideCalls.length === 1 && h.get('.sa-form').getAttribute('aria-busy') === 'false');
  assert.equal(h.guideCalls[0].records.products.length, 34);
  assert.equal(h.guideCalls[0].records.source, 'local');
  assert.deepEqual(h.guideCalls[0].payload.context, { page: 'product.html', productId: 'prod_chatgpt_plus', currency: 'sar' });
  assert.match(h.lastReply(), /الكتالوج المحلي/);
  assert.match(h.get('.sa-message-notice').textContent, /التحقق/);
  assert.equal(h.get('.sa-source').href, 'https://isolated-store.test/subscriptions.html');
  assert.equal(h.window.localStorage.length, 0, 'no conversation stored persistently');
  assert.match(h.get('#assistantPrivacy').textContent, /لا يرسل/);
  assert.match(h.get('.sa-mode').textContent, /محلي/);
});

test('model text and links cannot inject markup or navigate to unapproved sites', async t => {
  const h = harness(t, { configured: true, answer: async () => ({ answer: '<img src=x onerror=alert(1)>\nالسعر بحسب المتجر.', mode: 'ai', sources: [
    { title: '<script>bad</script>', url: 'product.html?id=prod_chatgpt_plus' },
    { title: 'bad', url: 'javascript:alert(1)' }, { title: 'bad', url: 'https://evil.example/collect' },
    { title: 'bad', url: '/admin.html' }, { title: 'bad', url: 'https://user:pass@aljahfalidigital.com/product.html' }
  ] }) });
  h.send('ما الباقة المناسبة؟');
  await settle(() => h.get('.sa-form').getAttribute('aria-busy') === 'false');
  assert.match(h.lastReply(), /<img/);
  assert.equal(h.get('.sa-message img'), null);
  assert.equal(h.get('.sa-message script'), null);
  assert.equal(h.window.document.querySelectorAll('.sa-source').length, 1);
  assert.equal(h.get('.sa-source').textContent, '<script>bad</script>');
  assert.match(h.get('#assistantPrivacy').textContent, /Groq/);
  assert.match(h.get('.sa-message-kind').textContent, /Groq/);
});

test('account questions use a private action and never put private details into AI history', async t => {
  const h = harness(t, { configured: true, answer: async payload => payload.action === 'my_orders' ? { answer: 'ORD-PRIVATE-900 تم تأكيد الدفع', mode: 'account', sources: [] } : { answer: 'يمكنك اختيار الباقة من تفاصيل المنتج.', mode: 'ai', sources: [] } });
  h.send('أين طلبي ورقم هاتفي 777777777؟');
  await settle(() => h.get('.sa-form').getAttribute('aria-busy') === 'false');
  assert.equal(h.calls[0].payload.action, 'my_orders');
  assert.equal(h.calls[0].payload.message, 'عرض حالة طلباتي');
  assert.deepEqual(h.calls[0].payload.history, []);
  h.send('كيف أختار الباقة؟');
  await settle(() => h.calls.length === 2 && h.get('.sa-form').getAttribute('aria-busy') === 'false');
  assert.deepEqual(h.calls[1].payload.history, []);
  assert.equal(JSON.stringify(h.calls[1].payload).includes('ORD-PRIVATE'), false);
  assert.equal(JSON.stringify(h.calls[1].payload).includes('777777777'), false);
});

test('pending requests prevent duplicate sends, support cancel and ignore late replies', async t => {
  let finish;
  const h = harness(t, { configured: true, answer: () => new Promise(resolve => { finish = resolve; }) });
  h.send('ما طرق الدفع؟'); h.send('ما طرق الدفع؟');
  assert.equal(h.calls.length, 1);
  assert.equal(h.button('إرسال السؤال').disabled, true);
  h.button('إيقاف الرد').click();
  assert.equal(h.calls[0].requestOptions.signal.aborted, true);
  finish({ answer: 'late reply', mode: 'ai', sources: [] });
  await new Promise(resolve => setImmediate(resolve));
  assert.notEqual(h.lastReply(), 'late reply');
  assert.equal(h.button('إعادة المحاولة').hidden, false);
  h.button('محادثة جديدة').click();
  assert.equal(h.button('إعادة المحاولة').hidden, true);
  assert.equal(h.window.document.querySelectorAll('.sa-message').length, 1);
});

test('welcome suggestions and reply indicator follow accepted requests, cancel and reset', async t => {
  const replies = [];
  const h = harness(t, { configured: true, answer: () => new Promise(resolve => { replies.push(resolve); }) });
  assert.equal(h.get('.sa-welcome').hidden, false);
  assert.equal(h.get('.sa-typing').hidden, true);
  assert.equal(h.get('.sa-welcome').querySelectorAll('.sa-chip').length, 4);

  h.send('');
  h.send('password: privatevalue');
  assert.equal(h.calls.length, 0, 'rejected input does not start a conversation');
  assert.equal(h.get('.sa-welcome').hidden, false);
  assert.equal(h.get('.sa-typing').hidden, true);

  h.button('طريقة الشراء').click();
  assert.equal(h.calls.length, 1);
  assert.equal(h.get('.sa-welcome').hidden, true, 'suggestions leave the interaction flow after a question');
  assert.equal(h.get('.sa-typing').hidden, false);
  h.button('إيقاف الرد').click();
  assert.equal(h.get('.sa-typing').hidden, true, 'cancel removes the pending indicator');
  assert.equal(h.get('.sa-welcome').hidden, true, 'cancel retains the current conversation');

  h.button('إعادة المحاولة').click();
  assert.equal(h.calls.length, 2);
  assert.equal(h.get('.sa-typing').hidden, false);
  h.button('محادثة جديدة').click();
  assert.equal(h.calls[1].requestOptions.signal.aborted, true);
  assert.equal(h.get('.sa-typing').hidden, true);
  assert.equal(h.get('.sa-welcome').hidden, false);
  assert.equal(h.get('.sa-welcome').querySelectorAll('.sa-chip:not([disabled])').length, 4);
  assert.equal(h.window.document.querySelectorAll('.sa-message-user').length, 0);

  replies.forEach(resolve => resolve({ answer: 'Old cancelled answer', mode: 'ai', sources: [] }));
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(h.get('#storeAssistant').textContent.includes('Old cancelled answer'), false);
  assert.equal(h.get('.sa-welcome').hidden, false);
  assert.equal(h.get('.sa-typing').hidden, true);
});

test('a failed request retries once without adding a duplicate message and without exposing raw errors', async t => {
  let attempt = 0;
  const h = harness(t, { configured: true, answer: async () => { if (!attempt++) throw Error('secret-provider-key and private internal stack'); return { answer: 'تمت الإجابة بعد إعادة المحاولة', mode: 'ai', sources: [] }; } });
  h.send('هل توجد باقة سنوية؟');
  await settle(() => !h.button('إعادة المحاولة').hidden);
  assert.equal(h.get('#storeAssistant').textContent.includes('secret-provider-key'), false);
  assert.equal(h.get('.sa-typing').hidden, true, 'failure does not leave a reply indicator running');
  h.button('إعادة المحاولة').click();
  await settle(() => h.calls.length === 2 && h.get('.sa-form').getAttribute('aria-busy') === 'false');
  assert.equal(h.window.document.querySelectorAll('.sa-message-user').length, 1);
  assert.match(h.lastReply(), /إعادة المحاولة/);
  assert.equal(h.get('.sa-typing').hidden, true, 'a completed reply clears the pending indicator');
});

test('sign-out clears all messages and aborts pending private reads', async t => {
  let finish;
  const h = harness(t, { configured: true, answer: () => new Promise(resolve => { finish = resolve; }) });
  h.auth('INITIAL_SESSION', 'customer-A');
  h.button('متابعة طلباتي').click();
  h.auth('SIGNED_OUT');
  assert.equal(h.calls[0].requestOptions.signal.aborted, true);
  finish({ answer: 'Customer A private order', mode: 'account', sources: [] });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(h.window.document.querySelectorAll('.sa-message-user').length, 0);
  assert.equal(h.get('#storeAssistant').textContent.includes('Customer A'), false);
});

test('assistant disabled config does not mount and unauthenticated local orders never fabricate status', async t => {
  const disabled = harness(t, { enabled: false });
  assert.equal(disabled.get('#storeAssistant'), null);
  const h = harness(t);
  h.button('متابعة طلباتي').click();
  await settle(() => h.get('.sa-form').getAttribute('aria-busy') === 'false');
  assert.equal(h.guideCalls.length, 0);
  assert.equal(h.calls.length, 0);
  assert.match(h.lastReply(), /تسجيل الدخول/);
  assert.match(h.get('.sa-source').href, /login\.html/);
});

test('obvious credentials and payment numbers are neither transmitted nor stored in the conversation', async t => {
  const h = harness(t, { configured: true });
  for (const message of ['هذا مفتاحي gsk_abcdefghijklmnopqrstuvwxyz', 'password: myprivatepassword', 'رمز التحقق: 123456', 'رقم البطاقة 4111 1111 1111 1111']) {
    h.send(message);
    assert.equal(h.calls.length, 0);
    assert.equal(h.get('.sa-input').value, '');
    assert.equal(h.window.document.querySelectorAll('.sa-message-user').length, 0);
    assert.match(h.get('.sa-status').textContent, /بيانات حساسة/);
  }
  h.send('كيف أستعيد كلمة المرور؟');
  await settle(() => h.calls.length === 1 && h.get('.sa-form').getAttribute('aria-busy') === 'false');
  assert.equal(h.calls[0].payload.message, 'كيف أستعيد كلمة المرور؟');
});

test('public history stays bounded and account switches erase earlier user context', async t => {
  const h = harness(t, { configured: true });
  h.auth('INITIAL_SESSION', 'customer-A');
  for (let i = 0; i < 7; i++) {
    h.send('سؤال عام عن الاشتراكات ' + i);
    await settle(() => h.calls.length === i + 1 && h.get('.sa-form').getAttribute('aria-busy') === 'false');
  }
  assert.equal(h.calls.at(-1).payload.history.length, 8);
  assert.equal(h.calls.at(-1).payload.history[0].content, 'سؤال عام عن الاشتراكات 2');
  h.auth('SIGNED_IN', 'customer-B');
  assert.equal(h.window.document.querySelectorAll('.sa-message-user').length, 0);
  h.send('هل يوجد دعم؟');
  await settle(() => h.calls.length === 8 && h.get('.sa-form').getAttribute('aria-busy') === 'false');
  assert.deepEqual(h.calls.at(-1).payload.history, []);
});

test('assistant-help links are permitted while redirects and data-bearing unknown queries are excluded', async t => {
  const h = harness(t, { configured: true, answer: async () => ({ mode: 'guide', answer: 'معلومات الخصوصية والمساعدة.', sources: [
    { title: 'عن المساعد', url: 'assistant-help.html' },
    { title: 'تسجيل الدخول', url: 'login.html?next=https://evil.example' },
    { title: 'متجر', url: 'subscriptions.html?token=private' },
    { title: 'سياسة الخصوصية', url: 'policy.html?slug=privacy' }
  ] }) });
  h.send('كيف يعمل المساعد؟');
  await settle(() => h.get('.sa-form').getAttribute('aria-busy') === 'false');
  const links = [...h.window.document.querySelectorAll('.sa-source')].map(link => link.getAttribute('href'));
  assert.deepEqual(links, ['https://isolated-store.test/assistant-help.html', 'https://isolated-store.test/policy.html?slug=privacy']);
});
