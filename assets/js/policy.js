(function () {
  'use strict';
  const titles = { terms: 'شروط الاستخدام', privacy: 'سياسة الخصوصية', refunds: 'سياسة الاستبدال والاسترجاع', warranty: 'سياسة الضمان', 'payment-delivery': 'سياسة الدفع والتسليم' };
  const slug = new URLSearchParams(location.search).get('slug') || 'terms';
  const title = titles[slug];
  const notice = document.getElementById('policyNotice'), body = document.getElementById('policyBody'), retry = document.getElementById('policyRetry');
  document.getElementById('policyTitle').textContent = title || 'السياسة غير موجودة';
  document.title = (title || 'سياسات المتجر') + ' | الجحفلي للحلول الرقمية';
  async function load() {
    if (!title) { notice.textContent = 'اختر إحدى السياسات من الروابط أعلاه.'; return; }
    retry.hidden = true; notice.hidden = false; notice.textContent = 'جارٍ تحميل السياسة…'; body.hidden = true;
    try {
      const policy = await window.AlJahfaliCloud.fetchPolicy(slug);
      if (!policy) { notice.textContent = 'لم تُنشر نسخة معتمدة من هذه السياسة بعد. تواصل مع إدارة المتجر لمعرفة الشروط قبل الشراء.'; return; }
      body.textContent = policy.body; body.hidden = false; notice.hidden = true;
      document.getElementById('policyRobots').content = 'index,follow';
      const canonical = document.createElement('link'); canonical.rel = 'canonical'; canonical.href = 'https://aljahfalidigital.com/policy.html?slug=' + encodeURIComponent(slug); document.head.append(canonical);
    } catch { notice.textContent = 'تعذر تحميل السياسة. تحقق من الاتصال وأعد المحاولة.'; retry.hidden = false; }
  }
  retry.addEventListener('click', load); load();
})();
