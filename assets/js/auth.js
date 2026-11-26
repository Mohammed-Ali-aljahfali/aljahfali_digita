(function () {
  'use strict';
  const $ = id => document.getElementById(id), api = window.AlJahfaliCloud;
  const params = new URLSearchParams(location.search);
  let recovery = params.get('recovery') === '1' || /type=recovery/.test(location.hash), recoveryReady = false, busy = false;
  const destination = (() => { const next = params.get('next'); if (!next) return 'account.html'; try { const url = new URL(next, location.href); return url.origin === location.origin && /\/(account|admin|checkout|subscriptions)\.html$/.test(url.pathname) ? url.pathname + url.search : 'account.html'; } catch (_) { return 'account.html'; } })();
  function message(text, error) { $('authMessage').textContent = text; $('authMessage').className = 'notice ' + (error ? 'error' : 'success'); $('authMessage').hidden = false; }
  function view(name) {
    ['signin', 'signup', 'recovery', 'newPassword'].forEach(key => $(key + 'Form').hidden = key !== name);
    $('authTabs').hidden = !['signin', 'signup'].includes(name);
    $('signinTab').setAttribute('aria-selected', String(name === 'signin')); $('signupTab').setAttribute('aria-selected', String(name === 'signup'));
    $('authTitle').textContent = ({ signin: 'أهلاً بعودتك', signup: 'أنشئ حسابك', recovery: 'استعادة كلمة المرور', newPassword: 'كلمة مرور جديدة' })[name];
    $('googleArea').hidden = !['signin', 'signup'].includes(name) || window.ALJAHFALI_CONFIG?.auth?.googleEnabled !== true;
  }
  function service() { if (!api?.config?.isConfigured()) throw new Error('تسجيل الحسابات غير متاح حالياً. يرجى المحاولة لاحقاً أو التواصل مع الدعم.'); return api; }
  async function run(form, action) {
    if (busy) return; busy = true; $('authMessage').hidden = true;
    const buttons = [...form.querySelectorAll('button')]; buttons.forEach(el => el.disabled = true); form.setAttribute('aria-busy', 'true');
    try { await action(); } catch (error) { message(humanError(error), true); }
    finally { busy = false; buttons.forEach(el => el.disabled = false); form.removeAttribute('aria-busy'); }
  }
  function humanError(error) {
    const text = String(error?.message || '');
    if (/invalid login|invalid credentials/i.test(text)) return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
    if (/email not confirmed/i.test(text)) return 'تحقق من بريدك الإلكتروني أولاً عبر رابط التأكيد المرسل إليك.';
    if (/rate limit|too many|429/i.test(text)) return 'محاولات كثيرة خلال وقت قصير. انتظر قليلاً ثم حاول مجدداً.';
    if (/network|fetch|timeout|abort/i.test(text)) return 'تعذر الاتصال. تحقق من الإنترنت وحاول مجدداً.';
    if (/expired|invalid.*token|otp/i.test(text)) return 'رابط الاستعادة غير صالح أو انتهت صلاحيته. اطلب رابطاً جديداً.';
    if (/not enabled|unsupported provider/i.test(text)) return 'الدخول باستخدام Google غير متاح حالياً. يمكنك استخدام البريد الإلكتروني.';
    return /[\u0600-\u06ff]/.test(text) ? text : 'تعذر إتمام العملية. تحقق من البيانات أو تواصل مع الدعم.';
  }
  $('signinTab').addEventListener('click', () => view('signin')); $('signupTab').addEventListener('click', () => view('signup'));
  $('forgotPassword').addEventListener('click', () => { $('recoveryEmail').value = $('signinEmail').value; view('recovery'); }); $('backToSignin').addEventListener('click', () => { recovery = false; view('signin'); });
  document.querySelectorAll('[data-show-password]').forEach(el => el.addEventListener('change', () => $(el.dataset.showPassword).type = el.checked ? 'text' : 'password'));
  $('signinForm').addEventListener('submit', event => { event.preventDefault(); run(event.currentTarget, async () => { await service().signIn($('signinEmail').value.trim(), $('signinPassword').value); location.assign(destination); }); });
  $('signupForm').addEventListener('submit', event => { event.preventDefault(); run(event.currentTarget, async () => {
    const phone = $('signupPhone').value.trim(); if (!/^\+?[\d\s()-]{7,24}$/.test(phone)) throw new Error('اكتب رقم واتساب صحيحاً مع رمز الدولة.');
    const result = await service().signUp($('signupEmail').value.trim(), $('signupPassword').value, $('signupName').value.trim(), phone); $('signupPassword').value = '';
    if (result?.session) location.assign(destination); else { view('signin'); $('signinEmail').value = $('signupEmail').value.trim(); message('تم استلام طلب التسجيل. راجع بريدك الإلكتروني لتأكيد الحساب قبل تسجيل الدخول.', false); }
  }); });
  $('recoveryForm').addEventListener('submit', event => { event.preventDefault(); run(event.currentTarget, async () => { await service().resetPassword($('recoveryEmail').value.trim()); message('إذا كان البريد مرتبطاً بحساب مؤهل، ستصلك رسالة برابط الاستعادة. تحقق من البريد الوارد وغير الهام.', false); }); });
  $('newPasswordForm').addEventListener('submit', event => { event.preventDefault(); run(event.currentTarget, async () => {
    if (!recoveryReady) throw new Error('افتح رابط استعادة صالح من بريدك الإلكتروني أولاً.'); if ($('newPassword').value !== $('confirmPassword').value) throw new Error('كلمتا المرور غير متطابقتين.');
    await service().updatePassword($('newPassword').value); await service().signOut(); recovery = false; recoveryReady = false; history.replaceState(null, '', 'login.html'); view('signin'); message('تم تغيير كلمة المرور. يمكنك تسجيل الدخول الآن.', false); $('newPasswordForm').reset();
  }); });
  $('googleSignin').addEventListener('click', event => run(event.currentTarget.parentElement, async () => { await service().signInWithGoogle(); }));
  api?.onAuthStateChange?.((event, session) => { if (event === 'PASSWORD_RECOVERY') { recovery = true; recoveryReady = Boolean(session); view('newPassword'); } });
  view(recovery ? 'newPassword' : 'signin');
  (async () => { if (!api?.config?.isConfigured()) { message('خدمة الحسابات غير متاحة حالياً. يمكنك تصفح المتجر أو التواصل مع الدعم.', true); return; } try { const user = await api.getCurrentUser(); if (recovery) { recoveryReady = Boolean(user); if (!recoveryReady) { view('recovery'); message('رابط الاستعادة غير صالح أو انتهت صلاحيته. اطلب رابطاً جديداً.', true); } } else if (user) location.replace(destination); } catch (error) { message(humanError(error), true); } })();
})();
