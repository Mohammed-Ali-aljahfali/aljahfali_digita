/* Shared, dependency-free helpers used by the existing static site. */
(function (root) {
  'use strict';
  const CURRENCIES = Object.freeze(['usd', 'sar', 'yer_sanaa', 'yer_aden']);
  const labels = { usd: 'دولار أمريكي', sar: 'ر.س', yer_sanaa: 'ر.ي — صنعاء', yer_aden: 'ر.ي — عدن' };
  function escapeHTML(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  }
  function safeURL(value, fallback = '') {
    if (typeof value !== 'string' || !value.trim() || /[\u0000-\u001f\u007f]/.test(value)) return fallback;
    try {
      const url = new URL(value, root.location?.href || 'https://aljahfalidigital.com/');
      if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return fallback;
      if (url.protocol === 'http:' && !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) return fallback;
      return value;
    } catch { return fallback; }
  }
  function readStorage(key, fallback = null) {
    try { const raw = root.localStorage.getItem(key); return raw === null ? fallback : JSON.parse(raw); } catch { return fallback; }
  }
  function writeStorage(key, value) {
    try { root.localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
  }
  function decimalNumber(value, max = 1000000000) {
    if (typeof value !== 'number' && (typeof value !== 'string' || !/^[0-9]+(?:\.[0-9]+)?$/.test(value) || value.length > 80)) return null;
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 && number <= max ? number : null;
  }
  function decimalFraction(value) {
    // Decimal integer arithmetic matches PostgreSQL numeric rounding at half-cent boundaries.
    const [coefficient, exponent = '0'] = String(value).toLowerCase().split('e');
    const [whole, fraction = ''] = coefficient.split('.');
    const scale = fraction.length - Number(exponent);
    const numerator = BigInt(whole + fraction);
    return scale < 0 ? [numerator * 10n ** BigInt(-scale), 1n] : [numerator, 10n ** BigInt(scale)];
  }
  function roundProduct(amount, multiplier, step) {
    const [a, ad] = decimalFraction(amount), [b, bd] = decimalFraction(multiplier), [s, sd] = decimalFraction(step);
    const numerator = a * b * sd, denominator = ad * bd * s;
    const quotient = numerator / denominator;
    const rounded = quotient + (numerator % denominator * 2n >= denominator ? 1n : 0n);
    return Number(rounded * s) / Number(sd);
  }
  function normalizeRates(raw = {}) {
    const value = raw?.value || raw || {};
    let rates;
    if (value.rates_per_usd) rates = value.rates_per_usd;
    else if (value.rates) rates = value.rates;
    else {
      rates = { usd: 1 };
      const sanaa = decimalNumber(value.sanaa, 1000000), aden = decimalNumber(value.aden, 1000000), sar = decimalNumber(value.sar, 1000000);
      if (sanaa > 0) rates.yer_sanaa = sanaa;
      if (aden > 0) rates.yer_aden = aden;
      if (sanaa > 0 && sar > 0) rates.sar = sanaa / sar;
    }
    const normalized = { base: 'usd', rates_per_usd: {}, rounding: {}, updated_at: raw?.updated_at || value.updated_at || null };
    CURRENCIES.forEach(currency => {
      const n = decimalNumber(rates[currency], 1000000);
      normalized.rates_per_usd[currency] = currency === 'usd' ? 1 : n > 0 ? n : null;
      const defaultStep = currency.startsWith('yer') ? 1 : 0.01;
      const configured = decimalNumber(value.rounding?.[currency]);
      normalized.rounding[currency] = value.rates_per_usd
        ? ([1, 0.1, 0.01, 0.001, 0.0001].includes(configured) ? configured : defaultStep)
        : (configured !== null && Number.isInteger(configured) && configured >= 0 && configured <= 4 ? 10 ** -configured : defaultStep);
    });
    return normalized;
  }
  function priceFor(entity, currency = 'usd', rawRates = {}) {
    if (!entity || !CURRENCIES.includes(currency)) return null;
    const rates = normalizeRates(rawRates);
    const prices = entity.prices || {};
    const auto = ['auto', 'automatic'].includes(entity.pricing_mode);
    const base = decimalNumber(auto ? prices.usd : prices[currency]);
    const multiplier = auto ? rates.rates_per_usd[currency] : 1;
    if (base === null || multiplier === null || base * multiplier > 1000000000) return null;
    const step = rates.rounding[currency];
    return roundProduct(base, multiplier, step);
  }
  function formatMoney(amount, currency = 'usd') {
    if (amount === null || amount === undefined || amount === '' || !Number.isFinite(Number(amount))) return 'السعر غير متاح';
    const fraction = currency.startsWith('yer') ? 0 : 2;
    const number = new Intl.NumberFormat('ar-YE', { minimumFractionDigits: fraction, maximumFractionDigits: 4 }).format(Number(amount));
    return currency === 'usd' ? `${number} $` : `${number} ${labels[currency] || currency}`;
  }
  const statusLabels = {
    awaiting_payment: 'بانتظار الدفع', awaiting: 'بانتظار الدفع', pending: 'بانتظار الدفع', pending_review: 'بانتظار مراجعة الدفع', awaiting_review: 'بانتظار مراجعة الدفع', review: 'بانتظار مراجعة الدفع', payment_review: 'بانتظار مراجعة الدفع', payment_confirmed: 'تم تأكيد الدفع', paid: 'تم تأكيد الدفع', verified: 'تم تأكيد الدفع', preparing: 'جاري تجهيز الطلب', processing: 'جاري تجهيز الطلب', activating: 'جاري التفعيل', completed: 'مكتمل', delivered: 'تم التسليم', rejected: 'مرفوض', cancelled: 'ملغي', refunded: 'مسترد', active: 'نشط', expired: 'منتهي', expiring: 'قريب الانتهاء', open: 'مفتوح', closed: 'مغلق', resolved: 'تم الحل'
  };
  function statusLabel(value) { return statusLabels[value] || value || 'غير محدد'; }
  function notify(message, kind = 'info') {
    if (!root.document) return;
    let el = root.document.getElementById('globalNotice');
    if (!el) { el = root.document.createElement('div'); el.id = 'globalNotice'; el.className = 'global-notice'; el.setAttribute('role', 'status'); root.document.body.append(el); }
    el.textContent = message;
    el.dataset.kind = kind;
    el.hidden = false;
    clearTimeout(notify.timer);
    notify.timer = setTimeout(() => { el.hidden = true; }, 6500);
  }
  root.StoreCore = Object.freeze({ CURRENCIES, escapeHTML, safeURL, readStorage, writeStorage, normalizeRates, priceFor, formatMoney, statusLabel, notify });
  if (typeof module !== 'undefined' && module.exports) module.exports = root.StoreCore;
})(typeof window !== 'undefined' ? window : globalThis);
