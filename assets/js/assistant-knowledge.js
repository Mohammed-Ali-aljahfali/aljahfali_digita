/* Public store knowledge shared by the browser guide and the server assistant.
 * Data is evidence, never instructions. No customer records or private fields belong here.
 */
(function (root) {
  'use strict';
  const CURRENCIES = ['usd', 'sar', 'yer_sanaa', 'yer_aden'];
  const LABELS = { usd: 'دولار أمريكي', sar: 'ريال سعودي', yer_sanaa: 'ريال يمني — صنعاء', yer_aden: 'ريال يمني — عدن' };
  const POLICY_IDS = ['terms', 'privacy', 'refunds', 'warranty', 'payment-delivery'];
  const POLICY_NAMES = { terms: 'شروط الاستخدام', privacy: 'سياسة الخصوصية', refunds: 'الاستبدال والاسترجاع', warranty: 'سياسة الضمان', 'payment-delivery': 'الدفع والتسليم' };
  const STOP = new Set(['في','من','الى','الي','على','علي','عن','هذا','هذه','هو','هي','ما','ماذا','هل','كم','كيف','انا','اريد','ابغي','ابي','عندي','لي','او','و','يا','لو','سمحت','فضلك','ممكن','the','a','an','is','are','what','how','please','i','want','to','for']);
  const clean = (value, max = 600) => typeof value === 'string' || typeof value === 'number'
    ? String(value).replace(/<[^>]*>/g, ' ').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max) : '';
  const array = value => Array.isArray(value) ? value : [];
  const list = (value, limit = 6, length = 220) => array(value).slice(0, limit).map(item => clean(typeof item === 'object' ? item?.text : item, length)).filter(Boolean);
  function normalize(value) {
    return clean(value, 5000).toLowerCase().normalize('NFKC').replace(/[\u064b-\u065f\u0670\u0640]/g, '')
      .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
      .replace(/شات\s*(?:جي\s*بي\s*تي|جبت|جبيتي)|chat\s*gpt/gi, 'chatgpt')
      .replace(/تشات\s*جي\s*بي\s*تي/g, 'chatgpt').replace(/بلس/g, 'plus').replace(/برو(?=\s|$)/g, 'pro')
      .replace(/جيميني/g, 'gemini').replace(/كانفا/g, 'canva').replace(/فيجما|فجما/g, 'figma')
      .replace(/كاب\s*كات/g, 'capcut').replace(/مايكروسوفت|ميكروسوفت/g, 'microsoft')
      .replace(/يوتيوب/g, 'youtube').replace(/كاسبرسكي/g, 'kaspersky').replace(/كلود/g, 'claude')
      .replace(/[^\p{L}\p{N}_]+/gu, ' ').trim();
  }
  const tokens = text => [...new Set(normalize(text).split(' ').filter(part => part.length > 1 && !STOP.has(part)))];
  function requestedCurrency(payload = {}) {
    const message = normalize(payload.message);
    if (/صنعا|sanaa/.test(message)) return 'yer_sanaa';
    if (/عدن|aden/.test(message)) return 'yer_aden';
    if (/سعود|\bsar\b/.test(message)) return 'sar';
    if (/دولار|\busd\b|\bdollars?\b/.test(message)) return 'usd';
    return CURRENCIES.includes(payload.context?.currency) ? payload.context.currency : 'usd';
  }
  function numeric(value) {
    if (typeof value !== 'number' && (typeof value !== 'string' || !/^\d+(?:\.\d+)?$/.test(value))) return null;
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 && number <= 1e9 ? number : null;
  }
  function prices(entity) {
    const result = {};
    const automatic = ['auto', 'automatic'].includes(entity?.pricing_mode);
    for (const code of CURRENCIES) result[code] = automatic && code !== 'usd' ? null : numeric(entity?.prices?.[code]);
    return result;
  }
  const money = (value, code) => value === null ? 'يُتحقق من السعر في صفحة المنتج وعند الدفع' : `${new Intl.NumberFormat('ar-YE', { maximumFractionDigits: 4 }).format(value)} ${LABELS[code]}`;
  const productURL = id => 'product.html?id=' + encodeURIComponent(id);
  function publicProduct(entity, parent) {
    const modal = entity?.modal_data && typeof entity.modal_data === 'object' ? entity.modal_data : {};
    return {
      id: clean(entity?.id, 180), title: clean(entity?.name || entity?.title || entity?.brand_label, 180),
      name: clean(entity?.brand_label || entity?.name || entity?.title, 180),
      productId: clean(parent?.id || entity?.id, 180), service: clean(parent?.service_name || entity?.service_name, 140),
      category: clean(parent?.category || entity?.category, 100),
      description: clean(modal.raw_description_ar || entity?.card_desc || entity?.description, 650),
      duration: clean(entity?.duration, 100), activation: clean(entity?.activation_type || modal.account_type || modal.activation_methods, 220),
      requirements: clean(entity?.requirements || modal.requirements, 350),
      features: list(entity?.features || modal.features, 6), devices: list(entity?.devices || modal.where_to_use, 5),
      steps: list(entity?.activation_steps || modal.step_by_step_activation, 6),
      prices: prices(entity), automatic: ['auto', 'automatic'].includes(entity?.pricing_mode),
      available: entity?.in_stock !== false && entity?.is_active !== false && (entity?.stock == null || numeric(entity.stock) > 0)
    };
  }
  function productText(data, source) {
    const text = [data.title, data.service, data.duration && 'المدة: ' + data.duration,
      data.activation && 'نوع التفعيل: ' + data.activation,
      'التسليم عبر واتساب بعد تأكيد الدفع. لا يؤكد المساعد الدفع أو يضمن توقيت التفعيل.',
      'وصف مسجل في الكتالوج، وليس تحققًا حديثًا من مزود الخدمة: ' + data.description,
      data.features.length && 'الميزات المسجلة: ' + data.features.join('؛ '),
      data.devices.length && 'الأجهزة المذكورة: ' + data.devices.join('؛ '),
      data.requirements && 'المتطلبات: ' + data.requirements,
      data.steps.length && 'خطوات الاستخدام المسجلة: ' + data.steps.join('؛ '),
      'الأسعار المسجلة: ' + CURRENCIES.map(code => `${LABELS[code]}: ${data.prices[code] === null ? 'غير محدد هنا' : data.prices[code]}`).join('، '),
      data.automatic && 'التسعير تلقائي؛ العملة غير الدولار تتطلب سعر الصرف الخادمي. لا تستنتج تحويلًا.',
      source === 'local' ? 'هذه نسخة كتالوج محلية؛ لا تؤكد التوفر أو السعر الحالي.' : 'التوفر المسجل: ' + (data.available ? 'متوفر وفق الكتالوج؛ التحقق النهائي عند إنشاء الطلب.' : 'غير متوفر حاليًا.')
    ];
    return text.filter(Boolean).join('\n').slice(0, 3000);
  }
  const STATIC = [
    { id: 'guide:welcome', title: 'دليل مساعد الجحفلي', url: 'subscriptions.html', keywords: 'مرحبا اهلا السلام عليكم هلا مساعد مساعدة help hello hi welcome', text: 'أهلاً بك في الجحفلي للحلول الرقمية. أساعدك في فهم الاشتراكات والباقات والأسعار المسجلة وطريقة الشراء والدفع، وأرشدك إلى حسابك أو الدعم. أخبرني باسم المنتج أو الاستخدام الذي تحتاجه والعملة المفضلة.' },
    { id: 'guide:buy', title: 'خطوات شراء الاشتراك', url: 'subscriptions.html', keywords: 'كيف اشتري شراء طلب جديد اطلب سلة باقة purchase buy order checkout', text: 'اختر المنتج ثم الباقة والعملة، وأضفها إلى السلة. راجع الكمية وسجّل الدخول عند الانتقال إلى الدفع. يعرض الخادم السعر والتوفر ووسائل الدفع قبل إنشاء الطلب. حوّل وفق تعليمات الطلب ثم أرسل السند أو المرجع للمراجعة. يبدأ التسليم عبر واتساب بعد تأكيد الإدارة للدفع.' },
    { id: 'guide:payments', title: 'الدفع وإثبات التحويل', url: 'checkout.html', keywords: 'دفع ادفع حوالة تحويل سند اثبات بنك محفظة receipt payment transfer pay', text: 'وسائل الدفع المتاحة تظهر في صفحة الدفع بحسب عملة الطلب. استخدم بيانات التحويل المعروضة داخل طلبك فقط. رفع السند أو إرسال الرقم المرجعي يضع الدفع في المراجعة ولا يؤكده تلقائيًا. يمكنك متابعة النتيجة من حسابك؛ لا ترسل كلمة مرور أو رمز تحقق أو بيانات بطاقة في المحادثة.' },
    { id: 'guide:delivery', title: 'التسليم والتفعيل', url: 'payment-delivery.html', keywords: 'تسليم تفعيل يصلني وقت متى توصيل delivery activate activation', text: 'التسليم عبر واتساب بعد مراجعة الدفع وتأكيده. نوع التفعيل والمتطلبات تختلف حسب المنتج والباقة وتظهر في صفحة المنتج. لا تتوفر للمساعد مدة تسليم مضمونة؛ راجع السياسة المنشورة أو تواصل مع الدعم بشأن توقيت طلبك.' },
    { id: 'guide:account', title: 'الحساب ومتابعة الطلبات', url: 'account.html', keywords: 'حساب تسجيل دخول بريد كلمة المرور نسيت استعادة طلباتي حالة طلبي اشتراكاتي فاتورة account login password order status', text: 'من حساب العميل يمكنك متابعة طلباتك ومدفوعاتك واشتراكاتك والإشعارات والدعم. سجّل الدخول بالحساب الذي أنشأ الطلب. لاستعادة كلمة المرور افتح صفحة الدخول واختر «نسيت كلمة المرور؟». لا يستطيع المساعد عرض طلبات شخص آخر أو تغيير كلمة المرور أو تأكيد دفع من المحادثة.' },
    { id: 'guide:renewal', title: 'تجديد الاشتراك', url: 'account.html#subscriptions', keywords: 'تجديد تمديد اشتراك انتهى انتهاء renewal renew expired subscription', text: 'افتح «اشتراكاتي» في حسابك واطلب التجديد للاشتراك المتاح. طلب التجديد متابعة فقط ولا يمدد المدة تلقائيًا. يحتاج التجديد طلب شراء جديدًا وتأكيد دفع، ثم تنفيذ التفعيل وتحديث تاريخ الاشتراك بواسطة الإدارة.' },
    { id: 'guide:currencies', title: 'العملات والأسعار', url: 'subscriptions.html', keywords: 'عملة عملات سعر اسعار دولار سعودي صنعاء عدن صرف usd sar currency price', text: 'يعرض المتجر الدولار الأمريكي والريال السعودي والريال اليمني بسعر صنعاء وبسعر عدن بصورة مستقلة. اختر العملة من أعلى الصفحة. الأسعار اليدوية قد تختلف عن تحويل سعر الدولار، والتحويل التلقائي يعتمد إعدادات الصرف. السعر النهائي يُراجع في الخادم قبل إنشاء الطلب؛ لا تتغير أسعار الطلبات السابقة تلقائيًا.' },
    { id: 'guide:services', title: 'خدمات الجحفلي الرقمية', url: 'index.html#services', keywords: 'خدمات موقع مواقع تطبيق تطبيقات برمجة قواعد بيانات اتمتة بوت تلجرام تليجرام تصميم هوية شعارات صيانة الحاسوب seo تسويق web website mobile app design automation bot', text: 'تشمل خدمات الجحفلي تصميم وتطوير المواقع والأنظمة، تطبيقات الجوال، قواعد البيانات وأتمتة الأعمال وبوتات تيليجرام، والتصميم والهوية والإعلانات وتحسين محتوى SEO والدعم الفني وصيانة الحاسوب. لطلب خدمة حدّد فكرتك والوظائف والمدة المطلوبة عبر صفحة التواصل ليقيّم الفريق نطاق العمل والتكلفة.' },
    { id: 'guide:service-plans', title: 'باقات تنفيذ المواقع والأنظمة', url: 'pricing.html', keywords: 'باقات خدمات موقع اساسية احترافية متقدمة تكلفة تطوير موقع نظام quotation quote project plan', text: 'تعرض صفحة باقات الخدمات باقة أساسية للأفراد والمشاريع الصغيرة، واحترافية للشركات، ومتقدمة للأنظمة والمشاريع الكبيرة. تختلف هذه الباقات عن اشتراكات البرامج. يمكن مناقشة خدمات إضافية مثل التصاميم والإعلانات وSEO والصيانة الشهرية. اطلب عرضًا محددًا بحسب متطلباتك من صفحة التواصل.' },
    { id: 'guide:support', title: 'التواصل مع الدعم', url: 'contact.html', keywords: 'دعم تواصل واتساب رقم مشكل مشكلة مساعدة موظف انسان شكوى contact whatsapp support help human', text: 'يمكنك التواصل مع فريق الجحفلي عبر صفحة التواصل أو زر واتساب في الموقع. اذكر المنتج والمشكلة ورقم الطلب عند الحاجة، دون إرسال كلمات المرور أو رموز التحقق أو بيانات دفع حساسة. يمكنك أيضًا إنشاء تذكرة دعم من حسابك.' },
    { id: 'guide:about', title: 'عن الجحفلي للحلول الرقمية', url: 'about.html', keywords: 'من انتم الجحفلي المنصة الشركة عن المتجر اليمن about platform store', text: 'الجحفلي للحلول الرقمية يقدم خدمات تطوير المواقع والبرمجيات والتصميم والأتمتة، ومتجر اشتراكات وبرامج وخدمات رقمية للسوق اليمني والعربي. الموقع عربي ويدعم اتجاه RTL، وتتوفر تفاصيل الخدمات في الصفحات العامة.' }
  ];
  function buildDocuments(records = {}) {
    const source = records.source === 'cloud' ? 'cloud' : 'local';
    const docs = STATIC.map(doc => ({ ...doc, kind: 'guide', source }));
    const products = array(records.products).slice(0, 400).filter(product => product && product.is_active !== false && clean(product.id));
    const plans = array(records.plans).slice(0, 1500).filter(plan => plan && plan.is_active !== false);
    for (const product of products) {
      const data = publicProduct(product);
      const productPlans = plans.filter(plan => plan.product_id === product.id).slice(0, 20).map(plan => publicProduct(plan, product));
      const category = array(records.categories).find(cat => cat?.id === product.category);
      const keywords = [data.name, data.service, product.raw_name, product.service_key, data.category, category?.name, category?.title].map(value => clean(value, 150)).join(' ');
      docs.push({ id: 'product:' + data.id, kind: 'product', title: data.title, url: productURL(data.id), source,
        keywords, text: (productText(data, source) + (productPlans.length ? '\nباقات متاحة: ' + productPlans.map(plan => plan.title).join('؛ ').slice(0, 650) : '')).slice(0, 3000), data, plans: productPlans });
      for (const plan of productPlans) docs.push({ id: 'plan:' + plan.id, kind: 'plan', title: data.name + ' — ' + plan.title, url: productURL(data.id), source, keywords: keywords + ' ' + plan.title,
        text: productText(plan, source), data: plan });
    }
    for (const id of POLICY_IDS) {
      const policy = array(records.policies).find(item => item?.id === id && item.published === true && clean(item.body));
      const keywords = { terms: 'شروط استخدام قوانين terms', privacy: 'خصوصية بيانات حفظ محادثة privacy data', refunds: 'استرجاع استرداد استبدال ارجاع تعويض refund return exchange', warranty: 'ضمان عطل توقف تعويض warranty guarantee', 'payment-delivery': 'سياسة دفع تسليم delivery payment' }[id];
      docs.push({ id: 'policy:' + id, kind: 'policy', policyId: id, published: Boolean(policy), title: clean(policy?.title, 160) || POLICY_NAMES[id], url: 'policy.html?slug=' + id, source,
        keywords, text: policy ? clean(policy.body, 3000) : 'لا تتوفر لدي سياسة ' + POLICY_NAMES[id] + ' منشورة ومعتمدة. يرجى مراجعة صفحة السياسة أو سؤال الدعم قبل الشراء؛ لا أستطيع افتراض مدة أو شرط غير منشور.' });
    }
    for (const method of array(records.paymentMethods).slice(0, 50)) {
      if (!method || method.is_active === false || !clean(method.name)) continue;
      const supported = array(method.currencies).filter(code => CURRENCIES.includes(code));
      docs.push({ id: 'payment:' + clean(method.id, 180), kind: 'payment', title: clean(method.name, 150), url: 'checkout.html', source,
        keywords: 'دفع وسيلة تحويل بنك محفظة payment ' + clean(method.name, 150),
        text: 'وسيلة دفع مسجلة: ' + clean(method.name, 150) + '. العملات: ' + supported.map(code => LABELS[code]).join('، ') + '. بيانات التحويل النهائية تظهر داخل طلبك في صفحة الدفع؛ لا تعتمد على المحادثة لإجراء التحويل.' });
    }
    for (const article of array(records.articles).slice(0, 100)) {
      if (article?.published !== true || !clean(article.id) || !clean(article.title) || !clean(article.body)) continue;
      docs.push({ id: 'article:' + clean(article.id, 180), kind: 'article', title: clean(article.title, 180),
        url: 'assistant-help.html?id=' + encodeURIComponent(clean(article.id, 180)), source, published: true,
        keywords: clean(article.title, 180), text: clean(article.body, 3000) });
    }
    return docs;
  }
  function intent(message) {
    const q = normalize(message);
    if (/^(مرحبا|مرحبا بك|اهلا|اهلا وسهلا|السلام عليكم|هلا|hello|hi|السلام عليكم ورحمه الله)$/.test(q)) return 'welcome';
    if (/طلباتي|حاله طلبي|وين طلبي|اين طلبي|رقم طلبي|my orders|my order|order status/.test(q)) return 'account';
    if (/استرجاع|استرداد|استبدال|ارجاع|refund|return policy/.test(q)) return 'refunds';
    if (/خصوصيه|privacy/.test(q)) return 'privacy';
    if (/ضمان|warranty|guarantee/.test(q)) return 'warranty';
    if (/شروط|terms/.test(q)) return 'terms';
    if (/تجديد|تمديد|renew/.test(q)) return 'renewal';
    if (/كيف اشتري|كيف اطلب|طريقه الشراء|خطوات الشراء|how (?:to )?buy/.test(q)) return 'buy';
    if (/تسجيل|نسيت|كلمه المرور|حسابي|password|login|sign in/.test(q)) return 'account';
    if (/دفع|ادفع|حواله|تحويل|سند|محفظه|receipt|payment/.test(q)) return 'payments';
    if (/تسليم|توصيل|متي يصل|وقت التفعيل|delivery/.test(q)) return 'delivery';
    if (/موظف|واتساب|الدعم|تواصل|انسان|human|support|contact/.test(q)) return 'support';
    return '';
  }
  function selectDocuments(payload = {}, documents = []) {
    const docs = array(documents);
    const message = clean(payload.message, 1500);
    const topic = intent(message);
    const key = ['terms', 'privacy', 'refunds', 'warranty'].includes(topic) ? 'policy:' + topic : topic ? 'guide:' + topic : '';
    if (key) {
      const matches = docs.filter(doc => doc.id === key);
      if (topic === 'payments' || topic === 'delivery') matches.push(...docs.filter(doc => doc.id === 'policy:payment-delivery' && doc.published));
      if (topic === 'payments') matches.push(...docs.filter(doc => doc.kind === 'payment').slice(0, 3));
      // A general topic must not hide the owner's more specific published guidance.
      const queryWords = tokens(message);
      const articles = docs.filter(doc => doc.kind === 'article').map(doc => ({ doc,
        score: queryWords.filter(word => tokens(doc.title).includes(word)).length
      })).filter(item => item.score >= 2).sort((a, b) => b.score - a.score).slice(0, 2);
      matches.push(...articles.map(item => item.doc));
      return matches.slice(0, 6);
    }
    const words = tokens(message);
    const query = normalize(message);
    const previous = array(payload.history).filter(item => item?.role === 'user').slice(-2).map(item => clean(item.content, 1500)).join(' ');
    const followup = words.length < 4 && /سعر|ثمن|بكم|كم|سعره|مميز|تفاصيل|مده|اجهزه|سعود|صنعا|عدن|دولار|price|cost|details|\b(?:usd|sar|aden|sanaa)\b/.test(query);
    const contextWords = followup ? tokens(previous) : [];
    const ranked = docs.map(doc => {
      const title = normalize(doc.title + ' ' + (doc.data?.name || ''));
      const keyword = normalize(doc.keywords);
      const body = normalize(doc.text);
      let score = 0;
      for (const word of words) {
        if (title.split(' ').includes(word)) score += 8;
        else if (keyword.split(' ').includes(word)) score += 5;
        else if (body.includes(word)) score += 1;
      }
      for (const word of contextWords) if (title.split(' ').includes(word) || keyword.split(' ').includes(word)) score += 3;
      if (payload.context?.productId && doc.data?.productId === payload.context.productId && (followup || /هذا|هذه|المنتج|الباقه/.test(query))) score += 18;
      if (doc.kind === 'product' && query.includes(normalize(doc.data?.name)) && normalize(doc.data?.name).length > 2) score += 15;
      if (doc.kind === 'plan') score -= 1;
      return { doc, score };
    }).filter(item => item.score >= 3).sort((a, b) => b.score - a.score);
    if (!ranked.length) return [];
    const cutoff = Math.max(3, ranked[0].score * .45);
    return ranked.filter(item => item.score >= cutoff).slice(0, 6).map(item => item.doc);
  }
  const sources = docs => [...new Map(docs.map(doc => [doc.url, { title: doc.title, url: doc.url }])).values()].slice(0, 5);
  function guideAnswer(payload = {}, selectedDocs = []) {
    const selected = array(selectedDocs).slice(0, 6);
    const base = { mode: 'guide', sources: [], suggestions: ['كيف أشتري اشتراكًا؟', 'كيف أتابع طلباتي؟', 'أريد التواصل مع الدعم'],
      notice: 'إجابة من دليل المتجر وبياناته المسجلة؛ قد تحتاج بعض التفاصيل إلى تأكيد الدعم.' };
    if (payload.action === 'my_orders' || intent(payload.message) === 'account' && /طلباتي|حالة طلبي|وين طلبي|اين طلبي|my orders|order status/i.test(clean(payload.message))) {
      return { ...base, answer: 'تفاصيل الطلبات خاصة بصاحب الحساب. سجّل الدخول ثم استخدم «طلباتي» لعرض طلباتك بأمان، أو افتح حساب العميل. لا يمكنني تأكيد حالة طلب من رقم يكتب في المحادثة فقط.', sources: [{ title: 'حساب العميل وطلباتي', url: 'account.html' }] };
    }
    if (!selected.length) return { ...base, answer: 'لا أملك معلومة موثوقة عن هذا السؤال ضمن بيانات المتجر المتاحة. أستطيع مساعدتك في الاشتراكات والأسعار وطريقة الشراء، أو يمكنك التواصل مع فريق الدعم للحصول على إجابة دقيقة.', sources: [{ title: 'التواصل مع الدعم', url: 'contact.html' }] };
    const productDocs = selected.filter(doc => doc.kind === 'product' || doc.kind === 'plan');
    if (productDocs.length && ['product', 'plan'].includes(selected[0].kind)) {
      const seen = new Set();
      const chosen = productDocs.filter(doc => { const id = doc.data.productId; if (seen.has(id)) return false; seen.add(id); return true; }).slice(0, 3);
      const currency = requestedCurrency(payload);
      const details = /مميز|تفاصيل|اجهزه|تفعيل|features|details|device/i.test(normalize(payload.message));
      const lines = chosen.map(doc => {
        const d = doc.data;
        const price = d.prices[currency];
        const parts = [d.title, d.duration && 'المدة: ' + d.duration, d.activation && 'نوع التفعيل: ' + d.activation];
        if (doc.plans?.length) parts.push('الباقات: ' + doc.plans.slice(0, 3).map(plan => `${plan.title} — ${money(plan.prices[currency], currency)}`).join('؛ '));
        else parts.push('السعر المسجل: ' + money(price, currency));
        if (details && d.features.length) parts.push('من الميزات المذكورة في الكتالوج: ' + d.features.slice(0, 3).join('؛ '));
        if (details && d.devices.length) parts.push('الأجهزة المذكورة: ' + d.devices.slice(0, 3).join('؛ '));
        if (doc.source === 'cloud' && !d.available) parts.push('غير متوفر حاليًا وفق الكتالوج.');
        return parts.filter(Boolean).join('\n');
      });
      const local = chosen.some(doc => doc.source !== 'cloud');
      const conclusion = local ? 'هذه أسعار وبيانات نسخة الكتالوج المحفوظة، وليست تأكيدًا للسعر أو التوفر الحالي. راجع صفحة المنتج؛ يُتحقق من الإجمالي والتوفر عند الدفع.' : 'هذه البيانات المسجلة حاليًا. راجع تفاصيل الباقة؛ السعر والتوفر النهائيان يُتحقق منهما عند إنشاء الطلب.';
      return { ...base, answer: (chosen.length > 1 ? 'هذه خيارات من الكتالوج مرتبطة بسؤالك:\n\n' : 'وفق البيانات المسجلة في المتجر:\n\n') + lines.join('\n\n') + '\n\n' + conclusion,
        sources: sources(chosen), notice: local ? 'وضع الدليل: بيانات كتالوج محفوظة؛ لا تُعد عرض سعر مؤكدًا.' : base.notice,
        suggestions: ['كيف أشتري هذه الباقة؟', 'ما سياسة الضمان؟', 'أريد التواصل مع الدعم'] };
    }
    const primary = selected[0];
    const relevant = primary.kind === 'policy' ? [primary] : selected.filter(doc => doc.kind !== 'product' && doc.kind !== 'plan').slice(0, 3);
    return { ...base, answer: relevant.map(doc => doc.text).join('\n\n').slice(0, 3500), sources: sources(relevant) };
  }
  function answer(payload, records) { return guideAnswer(payload, selectDocuments(payload, buildDocuments(records))); }
  const api = Object.freeze({ buildDocuments, selectDocuments, guideAnswer, answer, normalize });
  root.StoreAssistantKnowledge = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
