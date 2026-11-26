(function () {
  'use strict';
  const api = window.AlJahfaliCloud, core = window.StoreCore, $ = id => document.getElementById(id);
  const esc = value => core.escapeHTML(String(value ?? ''));
  const money = (amount, currency = 'usd') => core.formatMoney(amount, currency);
  const date = value => value && !Number.isNaN(Date.parse(value)) ? new Date(value).toLocaleString('ar-YE', { dateStyle: 'medium', timeZone: 'Asia/Riyadh' }) : 'غير محدد';
  const labels = { pending: 'بانتظار المراجعة', processing: 'جاري التجهيز', awaiting_payment: 'بانتظار الدفع', payment_review: 'بانتظار مراجعة الدفع', paid: 'تم تأكيد الدفع', preparing: 'جاري التجهيز', activating: 'جاري التفعيل', completed: 'مكتمل', rejected: 'مرفوض', cancelled: 'ملغي', refunded: 'مسترد', submitted: 'بانتظار المراجعة', verified: 'دفع مؤكد', active: 'نشط', suspended: 'موقوف', expired: 'منتهٍ', requested: 'تم طلب التجديد', open: 'مفتوحة', in_progress: 'قيد المتابعة', resolved: 'تمت المعالجة', closed: 'مغلقة' };
  let user, profile, orders = [], subscriptions = [], payments = [], renewals = [], notifications = [], tickets = [], receiptOrder;
  let activeTab = 'orders', loading = false;
  const errors = {};
  const orderStatus = order => order.order_status || order.status;
  function amount(order) { return order.total_amount ?? order.total ?? order['total_' + (order.currency || 'usd')] ?? order.total_usd ?? 0; }
  function state(value) { return labels[value] || core.statusLabel?.(value) || value || 'غير محدد'; }
  function badge(value) { return `<span class="badge ${['verified','completed','active','paid'].includes(value) ? 'good' : ['cancelled','rejected','refunded','expired'].includes(value) ? 'bad' : 'warn'}">${esc(state(value))}</span>`; }
  function message(text, error = false) { $('accountMessage').textContent = text; $('accountMessage').className = 'notice ' + (error ? 'error' : 'success'); $('accountMessage').hidden = false; }
  function humanError(error) { const text = String(error?.message || ''); return /[\u0600-\u06ff]/.test(text) ? text : 'تعذر إتمام العملية. تحقق من الاتصال وحاول مجدداً.'; }
  function empty(text) { return `<div class="empty">${esc(text)}</div>`; }
  function failure(key) { return errors[key] ? `<div class="notice error">${esc(errors[key])} <button class="btn btn-small" data-action="refresh">إعادة المحاولة</button></div>` : ''; }
  function selectTab(name) { activeTab = name; document.querySelectorAll('[data-tab]').forEach(btn => { const selected = btn.dataset.tab === name; btn.setAttribute('aria-selected', String(selected)); $(btn.dataset.tab + 'Panel').hidden = !selected; }); }
  async function action(button, callback, destinationMessage) {
    if (button?.disabled) return;
    if (button) button.disabled = true;
    try { await callback(); if (destinationMessage) message(destinationMessage); }
    catch (error) { message(humanError(error), true); }
    finally { if (button) button.disabled = false; }
  }
  function subscriptionState(sub) { if (['suspended','cancelled'].includes(sub.status)) return sub.status; if (sub.expires_at && Date.parse(sub.expires_at) <= Date.now()) return 'expired'; return sub.status; }
  function expiring(sub) { const remaining = Date.parse(sub.expires_at) - Date.now(); return subscriptionState(sub) === 'active' && remaining > 0 && remaining <= 7 * 86400000; }
  function renderStats() {
    const vals = [[errors.orders ? '—' : orders.length, 'إجمالي الطلبات'], [errors.subscriptions ? '—' : subscriptions.filter(s => subscriptionState(s) === 'active').length, 'اشتراكات نشطة'], [errors.subscriptions ? '—' : subscriptions.filter(expiring).length, 'تنتهي خلال 7 أيام'], [errors.orders ? '—' : orders.filter(o => ['awaiting_payment','payment_review','pending'].includes(orderStatus(o))).length, 'طلبات بانتظار الدفع أو المراجعة']];
    $('accountStats').innerHTML = vals.map(([n,t]) => `<div class="stat"><strong>${esc(n)}</strong><span>${esc(t)}</span></div>`).join('');
  }
  function renderOrders() {
    $('ordersList').innerHTML = failure('orders') || (orders.length ? orders.map(order => `<article class="record-card"><div class="record-top"><div><h3>${esc(order.id)}</h3><small>${esc(date(order.created_at))}</small></div>${badge(orderStatus(order))}</div><ul class="record-list">${(order.items || []).map(item => `<li><span>${esc(item.title || item.product_title || 'اشتراك رقمي')}${item.plan_name ? '<br><small>' + esc(item.plan_name) + '</small>' : ''} × ${esc(item.quantity ?? item.qty ?? 1)}</span><strong>${money(item.line_total ?? Number(item.unit_price ?? item.price ?? item.price_usd ?? 0) * Number(item.quantity ?? item.qty ?? 1), order.currency || 'usd')}</strong></li>`).join('')}</ul><div class="record-top"><strong>الإجمالي: ${money(amount(order), order.currency || 'usd')}</strong><span class="muted">${esc(state(order.payment_status || 'pending'))}</span></div><div class="form-actions"><button class="btn btn-small" data-action="order" data-id="${esc(order.id)}">تفاصيل الطلب</button><button class="btn btn-small" data-action="invoice" data-id="${esc(order.id)}">طباعة ملخص الطلب</button>${['awaiting_payment'].includes(orderStatus(order)) ? `<button class="btn btn-primary btn-small" data-action="receipt" data-id="${esc(order.id)}">إرفاق إثبات الدفع</button><button class="btn btn-small btn-danger" data-action="cancel" data-id="${esc(order.id)}">إلغاء الطلب غير المدفوع</button>` : ''}</div></article>`).join('') : empty('لا توجد طلبات محفوظة بعد. تصفح المتجر واختر اشتراكك.'));
    $('supportOrder').innerHTML = '<option value="">استفسار عام</option>' + orders.map(o => `<option value="${esc(o.id)}">${esc(o.id)}</option>`).join('');
  }
  function renderSubscriptions() {
    const filter = $('subscriptionFilter').value;
    const visible = subscriptions.filter(s => filter === 'all' || (filter === 'expiring' ? expiring(s) : subscriptionState(s) === filter));
    $('subscriptionsList').innerHTML = failure('subscriptions') || (visible.length ? visible.map(s => `<article class="record-card"><div class="record-top"><h3>${esc(s.product_title || 'اشتراك رقمي')}</h3>${badge(subscriptionState(s))}</div><p>${esc(s.plan_name || '')}</p><dl class="metadata"><div><dt>رقم الطلب</dt><dd>${esc(s.order_id)}</dd></div><div><dt>نوع التفعيل</dt><dd>${esc(s.activation_type || 'حسب الطلب')}</dd></div><div><dt>تاريخ التفعيل</dt><dd>${esc(date(s.starts_at))}</dd></div><div><dt>تاريخ الانتهاء</dt><dd>${esc(date(s.expires_at))}</dd></div></dl>${expiring(s) ? '<p class="notice warning">ينتهي هذا الاشتراك خلال 7 أيام.</p>' : ''}${s.warranty ? `<p class="muted">الضمان: ${esc(s.warranty)}</p>` : ''}${s.delivery_notes ? `<p class="readonly-value">${esc(s.delivery_notes)}</p>` : ''}<button class="btn btn-small" data-action="renew" data-id="${esc(s.id)}" ${s.status === 'cancelled' || renewals.some(r => r.subscription_id === s.id && ['requested','processing'].includes(r.status)) ? 'disabled' : ''}>طلب تجديد الاشتراك</button></article>`).join('') : empty('لا توجد اشتراكات ضمن هذه الحالة. تظهر الاشتراكات بعد التفعيل.'));
    $('renewalsList').innerHTML = failure('renewals') || (renewals.length ? renewals.map(r => `<div class="record-card"><div class="record-top"><strong>${esc(subscriptions.find(s => s.id === r.subscription_id)?.product_title || 'طلب تجديد')}</strong>${badge(r.status)}</div><small>${esc(date(r.created_at))}</small>${r.note ? `<p>${esc(r.note)}</p>` : ''}${r.order_id ? `<p>الطلب المرتبط: ${esc(r.order_id)}</p>` : ''}</div>`).join('') : empty('لا توجد طلبات تجديد حتى الآن.'));
  }
  function renderPayments() {
    $('paymentsList').innerHTML = failure('payments') || (payments.length ? payments.map(p => `<article class="record-card"><div class="record-top"><h3>طلب ${esc(p.order_id)}</h3>${badge(p.status)}</div><dl class="metadata"><div><dt>المبلغ</dt><dd>${money(p.amount, p.currency)}</dd></div><div><dt>مرجع التحويل</dt><dd>${esc(p.reference || '—')}</dd></div><div><dt>تاريخ الإرسال</dt><dd>${esc(date(p.created_at))}</dd></div><div><dt>تاريخ المراجعة</dt><dd>${esc(date(p.reviewed_at))}</dd></div></dl>${p.admin_note ? `<p class="notice">${esc(p.admin_note)}</p>` : ''}<div class="form-actions">${p.receipt_path ? `<button class="btn btn-small" data-action="view-receipt" data-id="${esc(p.id)}">فتح السند</button>` : ''}<button class="btn btn-small" data-action="invoice" data-id="${esc(p.order_id)}">طباعة ملخص الطلب</button></div><div data-receipt-link="${esc(p.id)}"></div></article>`).join('') : empty('لا توجد مدفوعات مرسلة بعد.'));
  }
  function renderNotifications() {
    $('notificationsList').innerHTML = failure('notifications') || (notifications.length ? notifications.map(n => `<article class="record-card"><div class="record-top"><h3>${esc(n.title)}</h3>${n.is_read ? '<span class="badge">مقروء</span>' : '<span class="badge good">جديد</span>'}</div><p>${esc(n.body)}</p><small>${esc(date(n.created_at))}</small>${!n.is_read ? `<div class="form-actions"><button class="btn btn-small" data-action="read" data-id="${esc(n.id)}">تعيين كمقروء</button></div>` : ''}</article>`).join('') : empty('لا توجد إشعارات جديدة.'));
  }
  function renderTickets() {
    $('ticketsList').innerHTML = failure('tickets') || (tickets.length ? tickets.map(t => `<article class="record-card"><div class="record-top"><h3>${esc(t.subject)}</h3>${badge(t.status)}</div><p>${esc(t.message)}</p><small>${esc(date(t.created_at))}</small>${t.order_id ? `<p class="muted">الطلب: ${esc(t.order_id)}</p>` : ''}${t.admin_reply ? `<div class="notice"><strong>رد الدعم</strong><p>${esc(t.admin_reply)}</p></div>` : ''}</article>`).join('') : empty('لا توجد تذاكر دعم سابقة.'));
  }
  async function refresh() {
    if (loading) return; loading = true; $('refreshAccount').disabled = true;
    const tasks = { orders: () => api.getUserOrders(user.id), subscriptions: () => api.getUserSubscriptions(), payments: () => api.getUserPayments(), renewals: () => api.getUserRenewals(), notifications: () => api.getNotifications(), tickets: () => api.getSupportTickets() };
    const keys = Object.keys(tasks), results = await Promise.allSettled(keys.map(key => tasks[key]()));
    const data = {}; results.forEach((result, i) => { const key = keys[i]; if (result.status === 'fulfilled') { data[key] = Array.isArray(result.value) ? result.value : []; delete errors[key]; } else { data[key] = []; errors[key] = humanError(result.reason); } });
    ({ orders, subscriptions, payments, renewals, notifications, tickets } = data);
    renderStats(); renderOrders(); renderSubscriptions(); renderPayments(); renderNotifications(); renderTickets(); loading = false; $('refreshAccount').disabled = false;
  }
  async function showOrder(id) {
    const order = await api.getOrder(id); if (!order) throw new Error('لم يتم العثور على الطلب.');
    const history = await api.getOrderHistory(id);
    $('orderDialogTitle').textContent = 'الطلب ' + order.id;
    const method = order.payment_method_snapshot || {};
    $('orderDetails').innerHTML = `${badge(orderStatus(order))}<dl class="metadata"><div><dt>العميل</dt><dd>${esc(order.customer_name)}</dd></div><div><dt>رقم واتساب</dt><dd dir="ltr">${esc(order.customer_phone)}</dd></div><div><dt>الإجمالي</dt><dd>${money(amount(order), order.currency || 'usd')}</dd></div><div><dt>وسيلة الدفع</dt><dd>${esc(method.name || order.payment_method || '')}</dd></div></dl>${method.account_number ? `<div class="notice"><strong>بيانات التحويل</strong><p>${esc(method.recipient_name || '')}</p><p dir="ltr">${esc(method.account_number)}</p><p>${esc(method.instructions || '')}</p></div>` : ''}<h3>سجل حالة الطلب</h3><div class="timeline">${(history || []).map(h => `<p><strong>${esc(state(h.to_status || h.status))}</strong><br><small>${esc(date(h.created_at))}</small>${h.note ? '<br>' + esc(h.note) : ''}</p>`).join('') || '<p>لا توجد انتقالات مسجلة بعد.</p>'}</div><p class="muted">يتم التسليم عبر واتساب بعد مراجعة الدفع. لا تشارك كلمة مرورك أو رموز التحقق.</p>`;
    $('orderDialog').showModal();
  }
  async function invoice(id) {
    const order = orders.find(o => o.id === id) || await api.getOrder(id); if (!order) throw new Error('لم يتم العثور على الطلب.');
    const paid = order.payment_status === 'verified';
    $('invoiceView').innerHTML = `<img src="assets/logo.png" alt="الجحفلي"><h1>الجحفلي للحلول الرقمية</h1><h2>${paid ? 'ملخص عملية شراء مؤكدة الدفع' : 'ملخص طلب — بانتظار تأكيد الدفع'}</h2><p>رقم الطلب: ${esc(order.id)}<br>التاريخ: ${esc(date(order.created_at))}<br>العميل: ${esc(order.customer_name)}<br>واتساب: ${esc(order.customer_phone)}</p><table><thead><tr><th>المنتج والباقة</th><th>الكمية</th><th>الإجمالي</th></tr></thead><tbody>${(order.items || []).map(item => `<tr><td>${esc(item.title || item.product_title)} ${esc(item.plan_name || '')}</td><td>${esc(item.quantity ?? item.qty ?? 1)}</td><td>${money(item.line_total ?? Number(item.unit_price ?? item.price_usd ?? 0) * Number(item.quantity ?? item.qty ?? 1), order.currency || 'usd')}</td></tr>`).join('')}</tbody></table><p>الخصم: ${money(order.discount ?? order.discount_amount ?? 0, order.currency || 'usd')}<br><strong>الإجمالي: ${money(amount(order), order.currency || 'usd')}</strong><br>حالة الدفع: ${esc(state(order.payment_status || 'pending'))}</p><p class="notice">مستند متابعة للطلب. ليس فاتورة ضريبية. التسليم عبر واتساب بعد تأكيد الدفع.</p>`;
    window.print();
  }
  async function openReceipt(id) { receiptOrder = orders.find(o => o.id === id) || await api.getOrder(id); if (!receiptOrder) throw new Error('لم يتم العثور على الطلب.'); $('receiptOrderInfo').textContent = `${receiptOrder.id} · ${money(amount(receiptOrder), receiptOrder.currency || 'usd')}`; $('receiptForm').reset(); $('receiptMessage').hidden = true; $('receiptDialog').showModal(); }
  document.querySelectorAll('[data-tab]').forEach(button => button.addEventListener('click', () => selectTab(button.dataset.tab)));
  document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => $(button.dataset.close).close()));
  $('subscriptionFilter').addEventListener('change', renderSubscriptions); $('refreshAccount').addEventListener('click', refresh);
  document.addEventListener('click', event => { const button = event.target.closest('[data-action]'); if (!button) return; const id = button.dataset.id; action(button, async () => {
    switch (button.dataset.action) {
      case 'refresh': await refresh(); break;
      case 'order': await showOrder(id); break;
      case 'invoice': await invoice(id); break;
      case 'receipt': await openReceipt(id); break;
      case 'cancel': if (confirm('إلغاء هذا الطلب غير المدفوع وتحرير المنتجات المحجوزة؟')) { await api.cancelOrder(id); message('تم إلغاء الطلب غير المدفوع.'); await refresh(); } break;
      case 'renew': await api.requestRenewal(id); message('تم حفظ طلب التجديد. تابع الرد من قسم طلبات التجديد.'); await refresh(); break;
      case 'read': await api.markNotificationRead(id); notifications = notifications.map(n => n.id === id ? { ...n, is_read: true } : n); renderNotifications(); break;
      case 'view-receipt': { const payment = payments.find(p => p.id === id); const result = await api.getReceiptUrl(payment.receipt_path); const url = core.safeURL(typeof result === 'string' ? result : result?.signedUrl); if (!url) throw new Error('تعذر فتح السند.'); const box = [...document.querySelectorAll('[data-receipt-link]')].find(el => el.dataset.receiptLink === id); box.innerHTML = `<p class="notice"><a href="${esc(url)}" target="_blank" rel="noopener noreferrer">فتح السند في نافذة جديدة</a> <small>رابط خاص مؤقت</small></p>`; break; }
    }
  }); });
  $('receiptForm').addEventListener('submit', event => { event.preventDefault(); const form = event.currentTarget, button = form.querySelector('[type=submit]'); if (button.disabled) return; button.disabled = true; (async () => { try { const file = form.elements.receipt.files[0]; if (!file || file.size > 5 * 1024 * 1024 || !['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('اختر ملف JPG أو PNG أو WebP بحجم لا يتجاوز 5 ميجابايت.'); await api.submitPaymentEvidence(receiptOrder.id, file, form.elements.reference.value.trim()); $('receiptDialog').close(); message('تم إرسال السند للمراجعة. الدفع لم يتأكد بعد.'); await refresh(); } catch (error) { $('receiptMessage').textContent = humanError(error); $('receiptMessage').className = 'notice error'; $('receiptMessage').hidden = false; } finally { button.disabled = false; } })(); });
  $('supportForm').addEventListener('submit', event => { event.preventDefault(); const form = event.currentTarget; action(form.querySelector('[type=submit]'), async () => { await api.createSupportTicket({ subject: form.elements.subject.value.trim(), message: form.elements.message.value.trim(), order_id: form.elements.order_id.value || null }); form.reset(); message('تم حفظ تذكرة الدعم. سيظهر رد الإدارة هنا.'); await refresh(); }); });
  $('profileForm').addEventListener('submit', event => { event.preventDefault(); const phone = $('profilePhone').value.trim(); action(event.currentTarget.querySelector('[type=submit]'), async () => { if (phone && !/^\+?[\d\s()-]{7,24}$/.test(phone)) throw new Error('رقم الهاتف غير صحيح.'); await api.updateProfile({ full_name: $('profileName').value.trim(), phone }); $('customerName').textContent = $('profileName').value.trim(); }, 'تم حفظ بياناتك الشخصية.'); });
  $('requestPasswordReset').addEventListener('click', event => action(event.currentTarget, () => api.resetPassword(user.email), 'تم طلب رابط تغيير كلمة المرور. راجع بريدك الإلكتروني.'));
  async function signOut(scope) { await api.signOut(scope); $('accountApp').hidden = true; location.replace('login.html'); }
  $('signOut').addEventListener('click', event => action(event.currentTarget, () => signOut('local'))); $('signOutEverywhere').addEventListener('click', event => action(event.currentTarget, () => signOut('global')));
  api?.onAuthStateChange?.(event => { if (event === 'SIGNED_OUT') { $('accountApp').hidden = true; location.replace('login.html'); } });
  (async () => { try {
    if (!api?.config?.isConfigured()) throw new Error('خدمة الحسابات غير متاحة حالياً. يرجى المحاولة لاحقاً أو التواصل مع الدعم.');
    user = await api.getCurrentUser(); if (!user) { location.replace('login.html?next=account.html'); return; }
    profile = await api.getCurrentProfile(user.id); const name = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'عميلنا';
    $('customerName').textContent = name; $('customerEmail').textContent = user.email || ''; $('profileName').value = name; $('profilePhone').value = profile?.phone || user.user_metadata?.phone || ''; $('profileEmail').value = user.email || ''; $('emailVerification').textContent = user.email_confirmed_at ? 'البريد الإلكتروني مؤكد.' : 'يرجى تأكيد البريد الإلكتروني من رسالة التسجيل.';
    $('accountApp').hidden = false; $('signOut').hidden = false; await refresh();
    const requestedTab = location.hash.replace(/^#/, ''); if (['orders','subscriptions','payments','notifications','support','profile'].includes(requestedTab)) selectTab(requestedTab);
    const orderId = new URLSearchParams(location.search).get('order'); if (orderId) await showOrder(orderId);
  } catch (error) { message(humanError(error), true); } finally { $('accountLoading').hidden = true; } })();
})();

