/* Customer assistant. Public conversation stays in memory; order replies never enter AI history. */
(function () {
  'use strict';
  if (document.getElementById('storeAssistant') || window.ALJAHFALI_CONFIG?.assistant?.enabled === false) return;

  const config = window.ALJAHFALI_CONFIG || {};
  const cloud = () => window.AlJahfaliCloud;
  const MAX_MESSAGE = 1500;
  const publicHistory = [];
  let pending = null, sequence = 0, lastAttempt = null, lastFocused = null, identity;
  const allowedPages = new Set(['index.html', 'subscriptions.html', 'product.html', 'cart.html', 'checkout.html', 'account.html', 'login.html', 'policy.html', 'terms.html', 'privacy.html', 'refund.html', 'warranty.html', 'payment-delivery.html', 'about.html', 'pricing.html', 'contact.html', 'assistant-help.html']);
  const isRemoteConfigured = () => typeof cloud()?.askAssistant === 'function' && cloud()?.config?.isConfigured?.() === true;

  function el(tag, className, text, attributes) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    Object.entries(attributes || {}).forEach(([key, value]) => node.setAttribute(key, value));
    return node;
  }
  function icon(kind) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', kind === 'close' ? 'm6 6 12 12M6 18 18 6' : kind === 'send' ? 'm21 3-7 18-4-7-7-4 18-7ZM10 14 21 3' : 'M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 3v-3a2 2 0 0 1-2-2V7a3 3 0 0 1 3-3Zm2 6h10M7 14h6');
    svg.append(path);
    return svg;
  }
  function safeSourceURL(value) {
    if (typeof value !== 'string' || value.length > 1000) return null;
    try {
      const url = new URL(value, location.href);
      if (url.username || url.password || !['https:', 'http:'].includes(url.protocol)) return null;
      if (url.origin !== location.origin && !['https://aljahfalidigital.com', 'https://www.aljahfalidigital.com'].includes(url.origin)) return null;
      const path = url.pathname.replace(/^\//, '') || 'index.html';
      if (!allowedPages.has(path)) return null;
      if (url.hash && !/^#[a-zA-Z0-9_-]{1,80}$/.test(url.hash)) return null;
      for (const [key, value] of url.searchParams) {
        if (path === 'product.html' && key === 'id' && /^[a-zA-Z0-9_-]{1,120}$/.test(value)) continue;
        if (path === 'policy.html' && key === 'slug' && ['terms', 'privacy', 'refunds', 'warranty', 'payment-delivery'].includes(value)) continue;
        if (path === 'login.html' && key === 'next' && ['account.html', 'cart.html', 'checkout.html'].includes(value)) continue;
        return null;
      }
      return url.href;
    } catch { return null; }
  }
  function context() {
    let currency = document.getElementById('storeCurrency')?.value || 'usd';
    if (!document.getElementById('storeCurrency')) {
      try { currency = JSON.parse(localStorage.getItem('aljahfali_currency') || '"usd"'); } catch { currency = 'usd'; }
    }
    if (!['usd', 'sar', 'yer_sanaa', 'yer_aden'].includes(currency)) currency = 'usd';
    const page = location.pathname.split('/').pop() || 'index.html';
    const productId = page === 'product.html' ? new URLSearchParams(location.search).get('id') : null;
    return { page: allowedPages.has(page) ? page : 'index.html', currency, ...(productId && /^[a-zA-Z0-9_-]{1,120}$/.test(productId) ? { productId } : {}) };
  }
  const phone = /^\d{8,15}$/.test(String(config.supportPhone || '')) ? config.supportPhone : '967782611415';
  const root = el('section', 'store-assistant', '', { id: 'storeAssistant', dir: 'rtl', 'aria-label': 'مساعد الجحفلي' });
  const launch = el('button', 'sa-launch', '', { type: 'button', 'aria-label': 'فتح مساعد الجحفلي', 'aria-haspopup': 'dialog', 'aria-expanded': 'false', 'aria-controls': 'assistantDialog' });
  launch.append(icon('chat'), el('span', '', 'مساعد الجحفلي'));
  const dialog = el('dialog', 'sa-panel', '', { id: 'assistantDialog', 'aria-labelledby': 'assistantTitle', 'aria-describedby': 'assistantDescription', 'aria-modal': 'true' });
  const header = el('header', 'sa-header');
  const mark = el('span', 'sa-mark'); mark.append(icon('chat'));
  const heading = el('div', 'sa-heading');
  heading.append(el('h2', '', 'مساعد الجحفلي', { id: 'assistantTitle' }));
  const mode = el('span', 'sa-mode', isRemoteConfigured() ? 'مساعد آلي من معلومات المتجر' : 'دليل محلي للمنتجات والخدمات'); heading.append(mode);
  const close = el('button', 'sa-icon-button', '', { type: 'button', 'aria-label': 'إغلاق المساعد' }); close.append(icon('close'));
  header.append(mark, heading, close);
  const description = el('p', 'sa-description', 'مساعد آلي يعتمد على معلومات المتجر. تحقّق من التفاصيل والسعر النهائي قبل الشراء.', { id: 'assistantDescription' });
  const log = el('div', 'sa-messages', '', { role: 'log', 'aria-live': 'polite', 'aria-relevant': 'additions', 'aria-label': 'المحادثة', tabindex: '0' });
  const quick = el('div', 'sa-quick', '', { 'aria-label': 'أسئلة مقترحة' });
  const quickPrompts = [
    ['ساعدني أختار اشتراكًا', 'أريد اختيار اشتراك يناسب احتياجي، كيف تساعدني؟', 'ask'],
    ['طريقة الشراء', 'كيف أشتري اشتراكًا من المتجر؟', 'ask'],
    ['الدفع والتسليم', 'ما طريقة الدفع والتسليم؟', 'ask'],
    ['متابعة طلباتي', 'عرض حالة طلباتي', 'my_orders']
  ];
  quickPrompts.forEach(([title, message, action]) => {
    const button = el('button', 'sa-chip', title, { type: 'button' });
    button.addEventListener('click', () => submit(message, action));
    quick.append(button);
  });
  const status = el('p', 'sa-status', '', { role: 'status', 'aria-live': 'polite' });
  const controls = el('div', 'sa-request-controls');
  const cancel = el('button', 'sa-text-button', 'إيقاف الرد', { type: 'button' }); cancel.hidden = true;
  const retry = el('button', 'sa-text-button', 'إعادة المحاولة', { type: 'button' }); retry.hidden = true;
  controls.append(status, cancel, retry);
  const form = el('form', 'sa-form');
  const inputLabel = el('label', 'sa-visually-hidden', 'اكتب سؤالك للمساعد', { for: 'assistantInput' });
  const input = el('textarea', 'sa-input', '', { id: 'assistantInput', name: 'message', rows: '2', maxlength: String(MAX_MESSAGE), placeholder: 'اسأل عن اشتراك أو خدمة…', 'aria-describedby': 'assistantPrivacy', required: '' });
  const send = el('button', 'sa-send', '', { type: 'submit', 'aria-label': 'إرسال السؤال' }); send.append(icon('send'));
  form.append(inputLabel, input, send);
  const privacy = el('p', 'sa-privacy', '', { id: 'assistantPrivacy' });
  function refreshPrivacy() {
    privacy.textContent = isRemoteConfigured()
      ? 'قد تُرسل أسئلتك وسياق المحادثة العام إلى Groq للإجابة. لا ترسل كلمات مرور أو رموزًا أو بيانات دفع.'
      : 'الدليل المحلي لا يرسل سؤالك إلى مزود ذكاء اصطناعي. لا تكتب كلمات مرور أو بيانات دفع في المحادثة.';
  }
  refreshPrivacy();
  const footer = el('footer', 'sa-footer');
  const support = el('a', 'sa-support', 'تحدث مع فريق الدعم', { href: 'https://wa.me/' + phone, target: '_blank', rel: 'noopener noreferrer' });
  const clear = el('button', 'sa-text-button', 'محادثة جديدة', { type: 'button' });
  const help = el('a', 'sa-help', 'عن المساعد والخصوصية', { href: 'assistant-help.html' });
  footer.append(support, clear, help);
  dialog.append(header, description, log, quick, controls, form, privacy, footer);
  root.append(launch, dialog);
  document.body.append(root);

  function scrollLog() { log.scrollTop = log.scrollHeight; }
  function appendMessage(role, text, response) {
    const row = el('article', 'sa-message sa-message-' + role);
    row.append(el('span', 'sa-speaker', role === 'user' ? 'أنت' : 'مساعد الجحفلي'));
    if (role === 'assistant' && response) row.append(el('span', 'sa-message-kind', response.mode === 'ai' ? 'إجابة بمساعدة Groq' : response.mode === 'account' ? 'بيانات الحساب' : 'دليل المتجر'));
    row.append(el('p', 'sa-message-text', String(text).slice(0, 7000)));
    if (response?.notice) row.append(el('p', 'sa-message-notice', String(response.notice).slice(0, 600)));
    const sources = Array.isArray(response?.sources) ? response.sources.slice(0, 6) : [];
    if (sources.length) {
      const links = el('div', 'sa-sources', '', { 'aria-label': 'روابط ذات صلة' });
      const added = new Set();
      for (const source of sources) {
        const href = safeSourceURL(source?.url);
        if (!href || added.has(href)) continue;
        added.add(href);
        links.append(el('a', 'sa-source', String(source.title || 'عرض التفاصيل').slice(0, 90), { href }));
      }
      if (links.childNodes.length) row.append(links);
    }
    log.append(row);
    while (log.children.length > 30) log.firstElementChild.remove();
    scrollLog();
  }
  function welcome() {
    appendMessage('assistant', 'أهلًا بك! أساعدك في معرفة المنتجات والباقات، خطوات الشراء والدفع، وخدمات الجحفلي. أخبرني باحتياجك، أو اختر سؤالًا للبدء.');
  }
  function openPanel() {
    refreshPrivacy();
    lastFocused = document.activeElement;
    if (!dialog.open) {
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    }
    launch.setAttribute('aria-expanded', 'true');
    document.body.classList.add('sa-dialog-open');
    input.focus();
  }
  function closePanel() {
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
    launch.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('sa-dialog-open');
    (lastFocused?.isConnected ? lastFocused : launch).focus();
  }
  function setBusy(value) {
    send.disabled = value;
    quick.querySelectorAll('button').forEach(button => { button.disabled = value; });
    cancel.hidden = !value;
    log.setAttribute('aria-busy', String(value));
    form.setAttribute('aria-busy', String(value));
  }
  function stopRequest(message = 'تم إيقاف الرد. يمكنك إعادة المحاولة.') {
    sequence++;
    pending?.abort();
    pending = null;
    setBusy(false);
    status.textContent = message;
    retry.hidden = !lastAttempt;
  }
  function resetConversation(message = '') {
    stopRequest('');
    lastAttempt = null;
    retry.hidden = true;
    publicHistory.length = 0;
    log.replaceChildren();
    input.value = '';
    mode.textContent = isRemoteConfigured() ? 'مساعد آلي من معلومات المتجر' : 'دليل محلي للمنتجات والخدمات';
    refreshPrivacy();
    welcome();
    status.textContent = message;
  }
  function localAnswer(payload) {
    const knowledge = window.StoreAssistantKnowledge;
    if (typeof knowledge?.answer !== 'function') return {
      answer: 'أستطيع توجيهك إلى الكتالوج وصفحات المساعدة. افتح المتجر لاختيار المنتج، أو تواصل مع فريق الدعم للحصول على إجابة دقيقة.',
      mode: 'guide',
      sources: [{ title: 'تصفح الاشتراكات', url: 'subscriptions.html' }, { title: 'الدعم والتواصل', url: 'contact.html' }],
      notice: 'خدمة الإجابات الذكية غير متاحة الآن.'
    };
    return knowledge.answer(payload, { products: Array.isArray(window.PRODUCTS_CATALOG) ? window.PRODUCTS_CATALOG : [], source: 'local' });
  }
  const privateQuestion = text => /(?:طلباتي|طلبي|حالة\s+طلب|متابعة\s+طلب|اشتراكاتي|فواتيري|مدفوعاتي|حالة\s+حسابي|ORD-[A-Z0-9-]+|my\s+(?:orders?|subscriptions?|payments?|invoices?)|order\s+status)/i.test(text);
  const containsCredentials = text => /(?:\bgsk_[a-zA-Z0-9]{12,}|\bsk-[a-zA-Z0-9_-]{12,}|\bsb_secret_[a-zA-Z0-9_-]{12,}|\beyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+|(?:password|كلمة\s*(?:المرور|السر)|رمز\s*التحقق|otp)\s*[:=]\s*\S{3,}|\b(?:\d[ -]?){13,19}\b)/i.test(text);
  async function submit(rawMessage, requestedAction = 'ask', isRetry = false) {
    if (pending) return;
    const message = String(rawMessage || '').trim();
    if (!message || message.length > MAX_MESSAGE) {
      status.textContent = message ? 'اختصر السؤال إلى 1500 حرف كحد أقصى.' : 'اكتب سؤالك أولًا.';
      input.focus(); return;
    }
    if (containsCredentials(message)) {
      input.value = '';
      status.textContent = 'لم يُرسل السؤال لأنه يبدو أنه يحتوي بيانات حساسة. احذف المفتاح أو كلمة المرور أو رقم الدفع، ثم اكتب السؤال فقط.';
      input.focus(); return;
    }
    const action = requestedAction === 'my_orders' || privateQuestion(message) ? 'my_orders' : 'ask';
    const payload = { message: action === 'my_orders' ? 'عرض حالة طلباتي' : message, action, history: action === 'my_orders' ? [] : publicHistory.slice(-8).map(item => ({ ...item })), context: context() };
    lastAttempt = { message, action };
    if (!isRetry) appendMessage('user', message);
    input.value = '';
    retry.hidden = true;
    status.textContent = action === 'my_orders' ? 'جاري التحقق من حسابك…' : 'أراجع معلومات المتجر…';
    const request = new AbortController(); pending = request;
    const requestId = ++sequence;
    setBusy(true);
    try {
      let response;
      const api = cloud();
      const configured = isRemoteConfigured();
      if (action === 'my_orders' && !configured) {
        response = { mode: 'account', answer: 'متابعة الطلبات تحتاج خدمة الحسابات وتسجيل الدخول. افتح حسابك لمراجعة الطلبات، أو تواصل مع فريق الدعم إذا تعذّر الوصول.', sources: [{ title: 'تسجيل الدخول إلى حسابي', url: 'login.html?next=account.html' }] };
      } else if (configured) {
        response = await api.askAssistant(payload, { signal: request.signal });
      } else {
        response = await localAnswer(payload);
      }
      if (requestId !== sequence || request.signal.aborted) return;
      if (!response || typeof response.answer !== 'string' || !response.answer.trim()) throw new Error('EMPTY_ASSISTANT_RESPONSE');
      appendMessage('assistant', response.answer, response);
      mode.textContent = response.mode === 'ai' ? 'إجابة ذكية بمساعدة Groq' : response.mode === 'account' ? 'متابعة آمنة لحسابك' : configured ? 'دليل المتجر' : 'دليل محلي للمنتجات والخدمات';
      if (action === 'ask' && response.mode !== 'account') {
        publicHistory.push({ role: 'user', content: message }, { role: 'assistant', content: response.answer.slice(0, MAX_MESSAGE) });
        if (publicHistory.length > 8) publicHistory.splice(0, publicHistory.length - 8);
      }
      lastAttempt = null;
      status.textContent = '';
    } catch (error) {
      if (requestId !== sequence || request.signal.aborted) return;
      const code = String(error?.code || '');
      status.textContent = ['auth_required', 'unauthorized', 'authentication_required'].includes(code)
        ? 'سجّل الدخول إلى حسابك أولًا لمتابعة طلباتك.'
        : code === 'rate_limit' ? 'وصلت إلى حد الأسئلة مؤقتًا. انتظر قليلًا ثم حاول مجددًا.'
          : 'تعذر الحصول على الرد الآن. حاول مجددًا أو تواصل مع فريق الدعم.';
      if (['auth_required', 'unauthorized', 'authentication_required'].includes(code)) appendMessage('assistant', status.textContent, { sources: [{ title: 'تسجيل الدخول', url: 'login.html?next=account.html' }] });
      retry.hidden = false;
    } finally {
      if (requestId === sequence) { pending = null; setBusy(false); }
    }
  }
  launch.addEventListener('click', openPanel);
  close.addEventListener('click', closePanel);
  dialog.addEventListener('cancel', event => { event.preventDefault(); closePanel(); });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); closePanel(); return; }
    if (event.key !== 'Tab') return;
    const controls = [...dialog.querySelectorAll('button:not([disabled]),a[href],textarea,[tabindex="0"]')].filter(node => !node.hidden && !node.closest('[hidden]'));
    const first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) { event.preventDefault(); first?.focus(); }
  });
  form.addEventListener('submit', event => { event.preventDefault(); submit(input.value); });
  input.addEventListener('keydown', event => { if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) { event.preventDefault(); submit(input.value); } });
  cancel.addEventListener('click', () => stopRequest());
  retry.addEventListener('click', () => { if (lastAttempt) submit(lastAttempt.message, lastAttempt.action, true); });
  clear.addEventListener('click', () => { resetConversation('بدأت محادثة جديدة.'); input.focus(); });
  cloud()?.onAuthStateChange?.((event, session) => {
    const nextIdentity = session?.user?.id || null;
    if (event === 'SIGNED_OUT' || event === 'SIGNED_IN' && nextIdentity !== identity) resetConversation('تغيرت جلسة الحساب؛ بدأنا محادثة جديدة لحماية خصوصيتك.');
    if (['INITIAL_SESSION', 'SIGNED_IN', 'SIGNED_OUT'].includes(event)) identity = nextIdentity;
  });
  welcome();
})();
