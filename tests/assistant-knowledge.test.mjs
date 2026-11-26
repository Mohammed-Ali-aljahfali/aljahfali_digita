import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const knowledge = require('../assets/js/assistant-knowledge.js');
const products = JSON.parse(fs.readFileSync('assets/data/products.json', 'utf8'));
const payload = (message, currency = 'usd', extra = {}) => ({ message, context: { currency }, ...extra });
const records = { products, source: 'local' };

test('knowledge retrieves the real Arabic and English product with independent currency prices', () => {
  for (const message of ['كم سعر ChatGPT Plus؟', 'كم سعر شات جي بي تي بلس؟']) {
    const result = knowledge.answer(payload(message, 'sar'), records);
    assert.equal(result.mode, 'guide');
    assert.equal(result.sources[0].url, 'product.html?id=prod_chatgpt_plus');
    assert.match(result.answer, /ريال سعودي/);
    assert.match(result.answer, /٤٥٫٩/);
    assert.match(result.answer, /نسخة الكتالوج/);
    assert.doesNotMatch(result.answer, /تم تأكيد الطلب/);
  }
  const sanaa = knowledge.answer(payload('ChatGPT Plus', 'yer_sanaa'), records);
  const aden = knowledge.answer(payload('ChatGPT Plus', 'yer_aden'), records);
  assert.match(sanaa.answer, /صنعاء/); assert.match(aden.answer, /عدن/);
  assert.notEqual(sanaa.answer, aden.answer);
});

test('only explicitly published known policies become knowledge and no draft leaks', () => {
  const input = { ...records, policies: [
    { id: 'refunds', title: 'الاسترجاع', body: 'DRAFT_PRIVATE_NOTE', published: false },
    { id: 'privacy', title: 'خصوصية', body: 'نستخدم معلومات الحساب لمعالجة الطلب فقط.', published: true },
    { id: '../private', title: 'Private', body: 'SECRET_POLICY', published: true }
  ] };
  const docs = knowledge.buildDocuments(input);
  assert.doesNotMatch(JSON.stringify(docs), /DRAFT_PRIVATE_NOTE|SECRET_POLICY/);
  assert.match(knowledge.answer(payload('ما سياسة الاسترجاع؟'), input).answer, /لا تتوفر لدي سياسة/);
  assert.match(knowledge.answer(payload('ما سياسة الخصوصية؟'), input).answer, /معالجة الطلب فقط/);
});

test('private fields and arbitrary catalog URLs never enter the public context', () => {
  const result = knowledge.buildDocuments({ products: [{ id: 'p&x', title: '<img src=x onerror=alert(1)>Product', prices: { usd: 9 },
    admin_note: 'SECRET_ADMIN', cost: 'SECRET_COST', customer_phone: 'SECRET_PHONE', url: 'javascript:alert(1)',
    modal_data: { secret: 'SECRET_NESTED', features: ['Useful feature'] } }], settings: [{ key: 'api_key', value: 'SECRET_API' }],
    paymentMethods: [{ id: 'bank', name: 'Bank', account_number: 'PRIVATE_ACCOUNT', recipient_name: 'PRIVATE_NAME', currencies: ['usd'], is_active: true }] });
  const serialized = JSON.stringify(result);
  assert.doesNotMatch(serialized, /SECRET_|PRIVATE_|javascript:|onerror/);
  assert.equal(result.find(doc => doc.kind === 'product').url, 'product.html?id=p%26x');
});

test('unknown questions do not manufacture facts or select a random product', () => {
  const result = knowledge.answer(payload('من فاز بكأس المريخ للهوكي 2050؟'), records);
  assert.match(result.answer, /لا أملك معلومة موثوقة/);
  assert.deepEqual(result.sources, [{ title: 'التواصل مع الدعم', url: 'contact.html' }]);
});

test('account questions and actions never expose or infer private order state', () => {
  const input = { ...records, orders: [{ id: 'ORD-PRIVATE', status: 'paid', user_id: 'other-user' }] };
  for (const request of [payload('وين طلبي؟'), payload('اعرض طلباتي'), payload('ORD-PRIVATE', 'usd', { action: 'my_orders' })]) {
    const result = knowledge.answer(request, input);
    assert.match(result.answer, /سجّل الدخول/);
    assert.doesNotMatch(result.answer, /ORD-PRIVATE|other-user|مؤكد الدفع/);
  }
});

test('inactive products and plans disappear; empty authoritative catalog stays empty', () => {
  const docs = knowledge.buildDocuments({ products: [{ id: 'old', title: 'Hidden', is_active: false }], source: 'cloud' });
  assert.equal(docs.filter(doc => doc.kind === 'product').length, 0);
  const result = knowledge.answer(payload('ChatGPT Plus'), { products: [], source: 'cloud' });
  assert.doesNotMatch(result.answer, /١٢|12|متوفر/);
});

test('automatic foreign prices and malformed values are never guessed or converted to zero', () => {
  const input = { source: 'cloud', products: [{ id: 'one', title: 'UniqueAuto', pricing_mode: 'auto', prices: { usd: 10, sar: 1 } },
    { id: 'two', title: 'UniqueBad', prices: { usd: null, sar: '', yer_sanaa: false, yer_aden: {} } }] };
  const auto = knowledge.answer(payload('UniqueAuto', 'sar'), input);
  assert.match(auto.answer, /يُتحقق من السعر/); assert.doesNotMatch(auto.answer, /١ ريال/);
  for (const currency of ['usd', 'sar', 'yer_sanaa', 'yer_aden']) assert.match(knowledge.answer(payload('UniqueBad', currency), input).answer, /يُتحقق من السعر/);
});

test('context resolves a product followup and independent plan prices are shown', () => {
  const input = { source: 'cloud', products: [{ id: 'main', title: 'UniqueProduct', prices: { usd: 99 } }], plans: [
    { id: 'month', product_id: 'main', name: 'شهري', prices: { usd: 8 }, duration: 'شهر', is_active: true },
    { id: 'year', product_id: 'main', name: 'سنوي', prices: { usd: 60 }, duration: 'سنة', is_active: true },
    { id: 'hidden', product_id: 'main', name: 'HIDDEN_PLAN', is_active: false }
  ] };
  const result = knowledge.answer({ message: 'كم سعره؟', context: { productId: 'main', currency: 'usd' } }, input);
  assert.match(result.answer, /شهري/); assert.match(result.answer, /سنوي/);
  assert.match(result.answer, /٨/); assert.doesNotMatch(result.answer, /HIDDEN_PLAN|٩٩/);
});

test('greetings, purchasing, delivery, support and service questions use real platform guidance', () => {
  assert.match(knowledge.answer(payload('السلام عليكم'), records).answer, /أهلاً بك/);
  assert.match(knowledge.answer(payload('كيف أشتري اشتراكًا؟'), records).answer, /السلة/);
  assert.match(knowledge.answer(payload('كيف ادفع؟'), records).answer, /لا يؤكده تلقائيًا/);
  assert.match(knowledge.answer(payload('متى التسليم؟'), records).answer, /لا تتوفر للمساعد مدة تسليم مضمونة/);
  assert.match(knowledge.answer(payload('هل تقدمون تصميم مواقع وتطبيقات؟'), records).answer, /تطبيقات الجوال/);
  assert.match(knowledge.answer(payload('أريد موظف دعم'), records).answer, /فريق الجحفلي/);
});

test('currency-only followups keep the prior product and honor the currency the customer asks for', () => {
  const first = knowledge.answer(payload('كم سعر شات جي بي تي بلس'), records);
  assert.equal(first.sources[0].url, 'product.html?id=prod_chatgpt_plus');
  const next = { message: 'بالسعودي', context: { currency: 'usd' }, history: [
    { role: 'user', content: 'كم سعر شات جي بي تي بلس' },
    { role: 'assistant', content: first.answer }
  ] };
  const result = knowledge.answer(next, records);
  assert.equal(result.sources[0].url, 'product.html?id=prod_chatgpt_plus');
  assert.match(result.answer, /٤٥٫٩ ريال سعودي/);
  assert.doesNotMatch(result.answer, /السعر المسجل:.*دولار/);
  const onProduct = knowledge.answer({ message: 'بالسعودي', context: { currency: 'sar', productId: 'prod_chatgpt_plus' } }, records);
  assert.equal(onProduct.sources[0].url, 'product.html?id=prod_chatgpt_plus');
  assert.match(onProduct.answer, /٤٥٫٩ ريال سعودي/);
});

test('published help articles are searchable with safe live-page URLs while drafts stay private', () => {
  const input = { ...records, articles: [
    { id: 'help/1?next=x', title: 'إعداد تنبيهات البريد', body: 'تصل تنبيهات البريد حسب الإعداد المعتمد في حسابك.', published: true },
    { id: 'draft', title: 'نظام التنبيهات الداخلي', body: 'DRAFT_INTERNAL_KNOWLEDGE', published: false },
    { id: 'missing', title: 'إعداد سري', body: 'UNPUBLISHED_SECRET' }
  ] };
  const docs = knowledge.buildDocuments(input);
  assert.doesNotMatch(JSON.stringify(docs), /DRAFT_INTERNAL_KNOWLEDGE|UNPUBLISHED_SECRET/);
  const result = knowledge.answer(payload('إعداد تنبيهات البريد'), input);
  assert.match(result.answer, /تصل تنبيهات البريد حسب الإعداد المعتمد/);
  assert.equal(result.sources[0].url, 'assistant-help.html?id=help%2F1%3Fnext%3Dx');
});

test('general account intent still retrieves a specific published help article', () => {
  const result = knowledge.answer(payload('تسجيل الدخول من جهاز جديد'), { ...records, articles: [
    { id: 'new-device', title: 'تسجيل الدخول من جهاز جديد', body: 'عند استخدام جهاز جديد راجع بريد التأكيد الخاص بحسابك.', published: true }
  ] });
  assert.match(result.answer, /راجع بريد التأكيد الخاص بحسابك/);
  assert(result.sources.some(source => source.url === 'assistant-help.html?id=new-device'));
});
