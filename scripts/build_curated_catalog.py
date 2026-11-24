import json

CURATED_PRODUCTS = [
  # ── الذكاء الاصطناعي (AI) ──
  {
    "id": "prod_chatgpt_plus",
    "raw_name": "ChatGPT Plus 1 Month Official Subscription",
    "title": "اشتراك شات جي بي تي بلس (ChatGPT Plus) - شهر كامل",
    "service_key": "chatgpt",
    "service_name": "شات جي بي تي (ChatGPT & OpenAI)",
    "category": "ai",
    "brand_color": "#10A37F",
    "brand_gradient": "linear-gradient(135deg, #053b2e 0%, #0c6b53 50%, #10a37f 100%)",
    "brand_label": "ChatGPT Plus",
    "icon": "assets/official_icons/openai.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان كامل طوال مدة الاشتراك (30 يوم)",
    "warranty_policy": "ضمان استبدال رسمي وتعويض كامل طوال 30 يوماً في حال حدوث أي توقف أو خلل.",
    "duration": "شهر كامل (30 يوم)",
    "stock": 50,
    "sold": 185,
    "in_stock": True,
    "prices": { "usd": 12.0, "sar": 45.9, "yer_sanaa": 6432, "yer_aden": 24000 },
    "card_desc": "وصول رسمي غير محدود لأقوى نماذج GPT-4o و Canvas مع توليد الصور DALL-E 3 وتحليل الملفات والوضع الصوتي المتقدم.",
    "modal_data": {
      "raw_description_ar": "اشتراك شات جي بي تي بلس الرسمي يمنحك وصولاً مميزاً وسريعاً لأحدث نماذج OpenAI العالمية مع أولوية الوصول أثناء أوقات الذروة وتسليم فوري.",
      "features": [
        "وصول رسمي وفوري لنماذج GPT-4o و GPT-4 و Canvas المخصصة للبرمجة والكتابة",
        "توليد وتعديل الصور بدقة فائقة واحترافية عبر DALL-E 3",
        "تحليل مستندات العمل وملفات PDF وجداول بيانات Excel المتقدمة",
        "الوضع الصوتي المتقدم Advanced Voice Mode للمحادثات الطبيعية الحية",
        "إنشاء واستخدام الروبوتات المخصصة Custom GPTs من متجر OpenAI"
      ],
      "where_to_use": [
        "متصفح الإنترنت chatgpt.com على أجهزة الكمبيوتر والمحمول",
        "تطبيق ChatGPT الرسمي على أنظمة الهواتف الذكية iOS و Android",
        "تطبيق سطح المكتب الرسمي لأنظمة Windows و macOS"
      ],
      "how_to_use": [
        "إدخال الأوامر المتقدمة لتحليل البيانات والأبحاث وكتابة الأكواد البرمجية",
        "رفع المستندات لتلخيصها واستخراج الأفكار الرئيسية منها بدقة",
        "المحادثة الصوتية التفاعلية المباشرة للاستشارات وترجمة اللغات"
      ],
      "activation_methods": "حساب رسمي جاهز وخاص بك للتسليم الفوري (بريد | كلمة سر | كود توثيق 2FA)، أو ترقية مباشرة لحسابك الشخصي.",
      "step_by_step_activation": [
        "استلم بيانات الحساب (البريد الإلكتروني وكلمة المرور) فور إتمام الطلب.",
        "افتح موقع chatgpt.com أو التطبيق الرسمي واضغط تسجيل الدخول.",
        "أدخل البريد الإلكتروني وكلمة المرور، وأدخل كود التحقق 2FA إذا طُلب منك.",
        "تأكد من ظهور شارة (ChatGPT Plus) أعلى الشاشة وابدأ الاستخدام فوراً.",
        "يُفضل الدخول للإعدادات وتحديث كلمة المرور لضمان أمان حسابك الشخصي."
      ],
      "account_type": "حساب رسمي مفعل بالكامل",
      "delivery_format": "تسليم مباشر عبر واتساب فور تأكيد التحويل.",
      "support_info": "دعم فني مباشر على مدار الساعة عبر واتساب 782611415 (محمد الجحفلي)."
    }
  },
  {
    "id": "prod_chatgpt_pro",
    "raw_name": "ChatGPT Pro High Compute 1 Month",
    "title": "باقة شات جي بي تي برو (ChatGPT Pro) - شهر كامل",
    "service_key": "chatgpt",
    "service_name": "شات جي بي تي (ChatGPT & OpenAI)",
    "category": "ai",
    "brand_color": "#0F172A",
    "brand_gradient": "linear-gradient(135deg, #090d16 0%, #1e293b 50%, #334155 100%)",
    "brand_label": "ChatGPT Pro",
    "icon": "assets/official_icons/openai.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان رسمي كامل طوال مدة الاشتراك",
    "warranty_policy": "ضمان استبدال معتمد لحسابات البرو العليا طوال الشهر.",
    "duration": "شهر كامل (30 يوم)",
    "stock": 15,
    "sold": 42,
    "in_stock": True,
    "prices": { "usd": 85.0, "sar": 325.0, "yer_sanaa": 45560, "yer_aden": 170000 },
    "card_desc": "الباقة الأقوى عالمياً للمطورين والباحثين مع وصول غير محدود لنماذج الاستدلال العميق o1 Pro Mode وأبحاث Deep Research.",
    "modal_data": {
      "raw_description_ar": "باقة المحترفين العليا من شات جي بي تي توفر 20 ضعف قدرات باقة Plus العادية مع دعم غير محدود لنماذج الاستدلال المعقدة وأبحاث الذكاء الاصطناعي العميقة.",
      "features": [
        "وصول غير محدود لأقوى نماذج الاستدلال o1 Pro Mode و GPT-5",
        "تشغيل أبحاث عميقة غير محدودة (Deep Research) ومعالجة مئات الصفحات",
        "نافذة سياق عملاقة تصل إلى مليون توكن للأكواد والمشاريع الضخمة",
        "أولوية معالجة مطلقة وسرعة حسابية استثنائية دون أي انتظار"
      ],
      "where_to_use": ["chatgpt.com وتطبيقات Windows و Mac و iOS و Android"],
      "how_to_use": ["حل المعضلات البرمجية والرياضية العميقة وتشغيل أبحاث السوق المؤتمتة"],
      "activation_methods": "حساب برو رسمي جاهز ومستقل تماماً.",
      "step_by_step_activation": [
        "استلم بيانات الدخول للحساب البرو المخصص لك.",
        "سجل الدخول عبر المنصة الرسمية chatgpt.com.",
        "استمتع بكامل صلاحيات Pro غير المحدودة."
      ],
      "account_type": "حساب برو خاص",
      "delivery_format": "تسليم فوري عبر واتساب.",
      "support_info": "دعم فني خاص على مدار الساعة."
    }
  },
  {
    "id": "prod_chatgpt_team",
    "raw_name": "ChatGPT Business Team Workspace 1 Month",
    "title": "اشتراك شات جي بي تي للفرق والشركات (ChatGPT Team)",
    "service_key": "chatgpt",
    "service_name": "شات جي بي تي (ChatGPT & OpenAI)",
    "category": "ai",
    "brand_color": "#0369A1",
    "brand_gradient": "linear-gradient(135deg, #0c4a6e 0%, #0284c7 50%, #38bdf8 100%)",
    "brand_label": "ChatGPT Team",
    "icon": "assets/official_icons/openai.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان كامل رسمي طوال المدة",
    "warranty_policy": "ضمان رسمي معتمد لمساحات العمل.",
    "duration": "شهر كامل (30 يوم)",
    "stock": 25,
    "sold": 90,
    "in_stock": True,
    "prices": { "usd": 16.0, "sar": 61.2, "yer_sanaa": 8576, "yer_aden": 32000 },
    "card_desc": "مساحة عمل مخصصة لفرق العمل مع حدود استخدام مضاعفة وخصوصية مطلقة تضمن عدم استخدام بياناتك في تدريب النماذج.",
    "modal_data": {
      "raw_description_ar": "مساحة عمل احترافية للشركات والفرق توفر حدود رسائل أعلى بكثير من الحساب الفردي وأماناً كاملاً للبيانات.",
      "features": [
        "حدود رسائل مرتفعة جداً لنماذج GPT-4o و o1 تفوق الحسابات الفردية",
        "خصوصية وأمان تام: بياناتك لا تُستخدم مطلقاً في تدريب الذكاء الاصطناعي",
        "مشاركة أدوات Custom GPTs والمشاريع داخل الفريق"
      ],
      "where_to_use": ["chatgpt.com وتطبيقات الهواتف وسطح المكتب"],
      "how_to_use": ["إدارة أعمال ومشاريع الفريق بأعلى درجات السرية"],
      "activation_methods": "دعوة رسمية مباشرة ترسل إلى بريدك الإلكتروني.",
      "step_by_step_activation": [
        "أرسل بريدك الإلكتروني المسجل في ChatGPT.",
        "استلم رابط دعوة الانضمام لفريق العمل.",
        "اقبل الدعوة وابدأ الاستخدام فوراً بميزات Team."
      ],
      "account_type": "دعوة مساحة عمل رسمية",
      "delivery_format": "تسليم فوري عبر واتساب.",
      "support_info": "دعم فني مباشر على مدار الساعة."
    }
  },
  {
    "id": "prod_chatgpt_go",
    "raw_name": "ChatGPT Go Budget Edition 1 Month",
    "title": "اشتراك شات جي بي تي جو الاقتصادي (ChatGPT Go)",
    "service_key": "chatgpt",
    "service_name": "شات جي بي تي (ChatGPT & OpenAI)",
    "category": "ai",
    "brand_color": "#0D9488",
    "brand_gradient": "linear-gradient(135deg, #134e4a 0%, #0d9488 50%, #2dd4bf 100%)",
    "brand_label": "ChatGPT Go",
    "icon": "assets/official_icons/openai.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان معتمد 7 أيام",
    "warranty_policy": "ضمان استبدال فوري طوال أسبوع من تاريخ الشراء.",
    "duration": "شهر كامل (30 يوم)",
    "stock": 40,
    "sold": 110,
    "in_stock": True,
    "prices": { "usd": 3.0, "sar": 11.5, "yer_sanaa": 1608, "yer_aden": 6000 },
    "card_desc": "الخيار الاقتصادي الأفضل للطلاب والاستخدام اليومي السريع بقدرات ذكاء اصطناعي متطورة وسعر موفر جداً.",
    "modal_data": {
      "raw_description_ar": "باقة اقتصادية خفيفة تتيح لك الوصول لنماذج OpenAI بأسعار رمزية ومناسبة للجميع.",
      "features": ["وصول سريع للذكاء الاصطناعي", "حل المسائل وتلخيص النصوص", "دعم المتصفح والتطبيق"],
      "where_to_use": ["الهواتف والمتصفحات"],
      "how_to_use": ["المحادثات اليومية والترجمة وكتابة الرسائل"],
      "activation_methods": "حساب جاهز للتسليم الفوري.",
      "step_by_step_activation": ["سجل الدخول بالحساب المسلم لك وابدأ المحادثة."],
      "account_type": "حساب جاهز",
      "delivery_format": "تسليم فوري عبر واتساب.",
      "support_info": "دعم فني عبر واتساب 782611415."
    }
  },
  {
    "id": "prod_claude_pro",
    "raw_name": "Claude 3.5 Sonnet Pro 1 Month",
    "title": "اشتراك كلود برو وتوكنات (Claude 3.5 Sonnet Pro)",
    "service_key": "claude",
    "service_name": "أنثروبيك كلود (Anthropic Claude)",
    "category": "ai",
    "brand_color": "#D97706",
    "brand_gradient": "linear-gradient(135deg, #78350f 0%, #d97706 50%, #fbbf24 100%)",
    "brand_label": "Claude AI",
    "icon": "assets/official_icons/anthropic.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان رسمي كامل طوال المدة",
    "warranty_policy": "ضمان استبدال كامل لحساب كلود برو طوال 30 يوماً.",
    "duration": "شهر كامل (30 يوم)",
    "stock": 30,
    "sold": 140,
    "in_stock": True,
    "prices": { "usd": 14.0, "sar": 53.5, "yer_sanaa": 7504, "yer_aden": 28000 },
    "card_desc": "النموذج الأقوى عالمياً في كتابة وتحليل الأكواد البرمجية وصياغة النصوص الأدبية والتحليل الدقيق عبر بيئة Artifacts.",
    "modal_data": {
      "raw_description_ar": "اشتراك كلود برو الرسمي من أنثروبيك، الخيار الأول للمبرمجين والكتاب، يقدم سرعة فائقة وحدود رسائل عالية ونوافذ سياق ضخمة.",
      "features": [
        "وصول غير محدود لنموذج Claude 3.5 Sonnet الخارق",
        "ميزة Artifacts التفاعلية لتشغيل الأكواد وتصميم الواجهات الحية",
        "نافذة سياق 200 ألف توكن لقراءة كتب كاملة ومشاريع برمجية متكاملة"
      ],
      "where_to_use": ["claude.ai وتطبيقات iOS و Android"],
      "how_to_use": ["بناء وتصحيح الأكواد وكتابة المقالات والتحليلات الأكاديمية"],
      "activation_methods": "حساب برو رسمي جاهز أو ترقية مباشرة.",
      "step_by_step_activation": ["سجل الدخول بالبيانات المسلمة لك في موقع claude.ai."],
      "account_type": "حساب برو خاص",
      "delivery_format": "تسليم فوري عبر واتساب.",
      "support_info": "دعم فني مباشر على مدار الساعة."
    }
  },
  {
    "id": "prod_gemini_advanced",
    "raw_name": "Google Gemini Advanced 2TB Storage 1 Month",
    "title": "اشتراك جوجل جيميني المتقدم (Gemini Advanced & 2TB)",
    "service_key": "google",
    "service_name": "جوجل وجيميني (Google & Gemini)",
    "category": "ai",
    "brand_color": "#2563EB",
    "brand_gradient": "linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #60a5fa 100%)",
    "brand_label": "Google Gemini",
    "icon": "assets/official_icons/google.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان كامل 30 يوم",
    "warranty_policy": "ضمان رسمي معتمد لاستبدال الحساب.",
    "duration": "شهر كامل (30 يوم)",
    "stock": 35,
    "sold": 95,
    "in_stock": True,
    "prices": { "usd": 10.0, "sar": 38.2, "yer_sanaa": 5360, "yer_aden": 20000 },
    "card_desc": "الذكاء الاصطناعي الأقوى من جوجل Gemini 1.5 Pro مع سعة تخزين سحابية ضخمة 2 تيرابايت في Google Drive و Photos.",
    "modal_data": {
      "raw_description_ar": "باقة Google One AI Premium تتضمن وصولاً كاملاً لنموذج Gemini Advanced مع سعة تخزين هائلة 2 تيرابايت لجميع خدمات جوجل.",
      "features": [
        "نموذج Gemini 1.5 Pro مع نافذة سياق تتجاوز مليون توكن",
        "سعة تخزين 2TB على Google Drive و Gmail و Google Photos",
        "تكامل مباشر داخل مستندات Google Docs و Gmail"
      ],
      "where_to_use": ["gemini.google.com وتطبيقات جوجل"],
      "how_to_use": ["تحليل الفيديوهات والمستندات الضخمة والنسخ الاحتياطي السحابي"],
      "activation_methods": "حساب رسمي مخصص أو دعوة عائلية على إيميلك الشخصي.",
      "step_by_step_activation": ["سجل الدخول بحساب جوجل واستمتع بالسعة وميزات جيميني."],
      "account_type": "حساب جوجل بريميوم",
      "delivery_format": "تسليم فوري عبر واتساب.",
      "support_info": "دعم فني مباشر على مدار الساعة."
    }
  },
  {
    "id": "prod_midjourney",
    "raw_name": "Midjourney Standard Plan 1 Month",
    "title": "اشتراك ميدجورني لتوليد وتصميم الصور (Midjourney)",
    "service_key": "midjourney",
    "service_name": "ميدجورني (Midjourney)",
    "category": "ai",
    "brand_color": "#0284C7",
    "brand_gradient": "linear-gradient(135deg, #075985 0%, #0284c7 50%, #38bdf8 100%)",
    "brand_label": "Midjourney",
    "icon": "assets/official_icons/midjourney.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان كامل طوال الشهر",
    "warranty_policy": "ضمان استبدال معتمد لحساب ميدجورني.",
    "duration": "شهر كامل (30 يوم)",
    "stock": 20,
    "sold": 75,
    "in_stock": True,
    "prices": { "usd": 15.0, "sar": 57.4, "yer_sanaa": 8040, "yer_aden": 30000 },
    "card_desc": "المنصة الرائدة عالمياً في توليد الصور والرسومات الاحترافية والواقعية السينمائية بدقة مذهلة لا تُضاهى.",
    "modal_data": {
      "raw_description_ar": "اشتراك رسمي يتيح لك إنشاء تصاميم ورسومات إعلانية وخلفيات وشخصيات فائقة الواقعية بأعلى جودة.",
      "features": [
        "توليد صور بجودة 4K ونماذج v6 الحديثة",
        "ساعات توليد سريع Fast Hours غير محدودة بالنمط المريح",
        "حقوق الملكية التجارية الكاملة للصور المولدة"
      ],
      "where_to_use": ["تطبيق Discord وموقع midjourney.com"],
      "how_to_use": ["كتابة أوامر Prompt لتوليد الصور والتعديل عليها"],
      "activation_methods": "حساب ديسكورد مفعل به اشتراك ميدجورني جاهز.",
      "step_by_step_activation": ["سجل الدخول بالديسكورد وابدأ التوليد عبر روم البوت."],
      "account_type": "حساب رسمي مفعل",
      "delivery_format": "تسليم فوري عبر واتساب.",
      "support_info": "دعم فني عبر واتساب 782611415."
    }
  },
  {
    "id": "prod_cursor_pro",
    "raw_name": "Cursor Pro AI Coding Editor 1 Month",
    "title": "محرر البرمجة الذكي كيرسور برو (Cursor Pro AI)",
    "service_key": "cursor",
    "service_name": "كيرسور (Cursor AI)",
    "category": "ai",
    "brand_color": "#1E293B",
    "brand_gradient": "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #475569 100%)",
    "brand_label": "Cursor Pro",
    "icon": "assets/official_icons/cursor.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان معتمد 30 يوم",
    "warranty_policy": "ضمان استبدال لحساب كيرسور برو.",
    "duration": "شهر كامل (30 يوم)",
    "stock": 25,
    "sold": 80,
    "in_stock": True,
    "prices": { "usd": 15.0, "sar": 57.4, "yer_sanaa": 8040, "yer_aden": 30000 },
    "card_desc": "بيئة التطوير الأولى عالمياً للمبرمجين مع شات ذكي يقرأ المشروع بالكامل ويعدل ويكتب الأكواد البرمجية ذاتياً.",
    "modal_data": {
      "raw_description_ar": "محرر برمجة مبني على VS Code مدمج بنماذج GPT-4o و Claude 3.5 Sonnet يفهم كامل مشروعك البرمجي.",
      "features": ["شات ذكي لفهم كامل ملفات المشروع", "ميزة التعديل متعدد الملفات Composer", "إكمال تلقائي فائق الذكاء للأكواد Tab-Complete"],
      "where_to_use": ["تطبيق Cursor على Windows و Mac و Linux"],
      "how_to_use": ["فتح المشروع واستدعاء المساعد بكبسة Ctrl+K أو Ctrl+L"],
      "activation_methods": "حساب رسمي مفعل جاهز.",
      "step_by_step_activation": ["سجل الدخول في برنامج Cursor وابدأ البرمجة."],
      "account_type": "حساب برو مفعل",
      "delivery_format": "تسليم فوري عبر واتساب.",
      "support_info": "دعم فني مباشر على مدار الساعة."
    }
  },

  # ── التصميم والمونتاج (Design & Creative) ──
  {
    "id": "prod_capcut_pro",
    "raw_name": "CapCut Pro Video Editor 1 Month",
    "title": "اشتراك كاب كات برو للمونتاج (CapCut Pro) - شهر كامل",
    "service_key": "capcut",
    "service_name": "كاب كات برو (CapCut Pro)",
    "category": "design",
    "brand_color": "#06B6D4",
    "brand_gradient": "linear-gradient(135deg, #0e7490 0%, #06b6d4 50%, #22d3ee 100%)",
    "brand_label": "CapCut Pro",
    "icon": "assets/official_icons/capcut.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان رسمي كامل 30 يوم",
    "warranty_policy": "ضمان استبدال فوري وتعويض كامل طوال فترة الاشتراك.",
    "duration": "شهر كامل (30 يوم)",
    "stock": 45,
    "sold": 260,
    "in_stock": True,
    "prices": { "usd": 1.87, "sar": 7.2, "yer_sanaa": 1002, "yer_aden": 3740 },
    "card_desc": "تفعيل كامل ميزات المونتاج العالمية وإزالة العلامة المائية وتصدير بجودة 4K وفلاتر ومؤثرات الذكاء الاصطناعي المدفوعة.",
    "modal_data": {
      "raw_description_ar": "برنامج تحرير الفيديو الأكثر شهرة عالمياً، يتيح لك تعديل مقاطع الريلز والتيك توك واليوتيوب بأعلى احترافية.",
      "features": [
        "إزالة العلامة المائية وتصدير بدقة 4K فائقة و 60 إطار",
        "فتح كافة الفلاتر والانتقالات والمؤثرات البصرية المدفوعة",
        "توليد الترجمة التلقائية التفاعلية Auto Captions بدقة عالية",
        "أدوات تنقية الصوت وعزل الضوضاء بالذكاء الاصطناعي"
      ],
      "where_to_use": ["أجهزة الكمبيوتر PC/Mac وتطبيقات الهواتف الذكية"],
      "how_to_use": ["تسجيل الدخول في البرنامج والوصول المباشر لكافة أدوات Pro"],
      "activation_methods": "حساب رسمي جاهز لتسجيل الدخول الفوري.",
      "step_by_step_activation": [
        "استلم البريد وكلمة المرور فور تأكيد الطلب.",
        "افتح تطبيق CapCut على جهازك وسجل الدخول.",
        "تأكد من تفعيل شارة Pro وابدأ مونتاج فيديوهاتك فوراً."
      ],
      "account_type": "حساب رسمي خاص",
      "delivery_format": "تسليم فوري عبر واتساب.",
      "support_info": "دعم فني عبر واتساب 782611415."
    }
  },
  {
    "id": "prod_canva_pro",
    "raw_name": "Canva Pro Graphic Design 1 Year",
    "title": "اشتراك كانفا برو للتصميم (Canva Pro) - سنة كاملة",
    "service_key": "design",
    "service_name": "كانفا برو (Canva Pro)",
    "category": "design",
    "brand_color": "#8B5CF6",
    "brand_gradient": "linear-gradient(135deg, #5b21b6 0%, #8b5cf6 50%, #c4b5fd 100%)",
    "brand_label": "Canva Pro",
    "icon": "assets/official_icons/canva.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان كامل طوال السنة (365 يوم)",
    "warranty_policy": "ضمان رسمي معتمد طوال فترة الاشتراك السنوي.",
    "duration": "سنة كاملة (12 شهر)",
    "stock": 35,
    "sold": 310,
    "in_stock": True,
    "prices": { "usd": 9.0, "sar": 34.4, "yer_sanaa": 4824, "yer_aden": 18000 },
    "card_desc": "تفعيل رسمي على إيميلك الشخصي مع وصول لأكثر من 100 مليون قالب وعنصر مدفوع وإزالة خلفيات الصور بالذكاء الاصطناعي.",
    "modal_data": {
      "raw_description_ar": "المنصة الأولى عالمياً للتصميم الجرافيكي، تصاميم سوشيال ميديا، عروض تقديمية، ولوجوهات بدقة واحترافية غير محدودة.",
      "features": [
        "تفعيل رسمي مباشر على إيميلك الشخصي بدون كلمة سر",
        "الوصول لملايين الصور والقوالب والخطوط العربية المدفوعة",
        "أداة إزالة الخلفيات بنقرة واحدة وتغيير مقاسات التصاميم ذكياً",
        "سعة تخزين سحابية ضخمة لحفظ مشاريعك"
      ],
      "where_to_use": ["موقع canva.com وتطبيقات الهواتف والكمبيوتر"],
      "how_to_use": ["تصميم بوستات، بنرات، هويات بصرية، وعروض تقديمية"],
      "activation_methods": "دعوة رسمية ترسل إلى بريدك الشخصي في كانفا.",
      "step_by_step_activation": [
        "أرسل بريدك الإلكتروني المسجل في كانفا.",
        "استلم رابط الدعوة واضغط قبول الانضمام.",
        "يتحول حسابك فوراً إلى Canva Pro بكامل ميزاته."
      ],
      "account_type": "ترقية إيميل شخصي",
      "delivery_format": "تسليم فوري ومباشر.",
      "support_info": "دعم فني عبر واتساب 782611415."
    }
  },
  {
    "id": "prod_adobe_creative_cloud",
    "raw_name": "Adobe Creative Cloud All Apps 1 Year",
    "title": "حزمة أدوبي الشاملة (Adobe Creative Cloud All Apps)",
    "service_key": "design",
    "service_name": "أدوبي (Adobe)",
    "category": "design",
    "brand_color": "#EF4444",
    "brand_gradient": "linear-gradient(135deg, #991b1b 0%, #ef4444 50%, #fca5a5 100%)",
    "brand_label": "Adobe CC",
    "icon": "assets/official_icons/adobe.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان استبدال رسمي معتمد",
    "warranty_policy": "ضمان كامل طوال فترة الاشتراك.",
    "duration": "سنة كاملة (12 شهر)",
    "stock": 15,
    "sold": 60,
    "in_stock": True,
    "prices": { "usd": 28.0, "sar": 107.0, "yer_sanaa": 15008, "yer_aden": 56000 },
    "card_desc": "تفعيل رسمي لكافة برامج أدوبي العالمية: Photoshop و Illustrator و Premiere Pro و After Effects مع ميزات الذكاء الاصطناعي Generative Fill.",
    "modal_data": {
      "raw_description_ar": "الاشتراك الاحترافي الأقوى لمصممي الجرافيك وصناع الأفلام، يشمل أكثر من 20 برنامجاً احترافياً وتحديثات رسمية مستمرة.",
      "features": [
        "تحميل البرامج الرسمية مباشرة من تطبيق Adobe Creative Cloud",
        "تفعيل الذكاء الاصطناعي Firefly و Generative Fill داخل الفوتوشوب",
        "سعة تخزين سحابية لمزامنة الملفات والمشاريع"
      ],
      "where_to_use": ["أجهزة الكمبيوتر PC و Mac وتطبيقات الآيباد"],
      "how_to_use": ["تصميم الصور، تعديل الفيديو، والأنيميشن الاحترافي"],
      "activation_methods": "تفعيل رسمي على بريدك الإلكتروني.",
      "step_by_step_activation": ["افتح برنامج Adobe Creative Cloud وسجل الدخول."],
      "account_type": "ترخيص رسمي كامل",
      "delivery_format": "تسليم فوري عبر واتساب.",
      "support_info": "دعم فني على مدار الساعة."
    }
  },

  # ── الترفيه والبث (Streaming & Entertainment) ──
  {
    "id": "prod_netflix_premium",
    "raw_name": "Netflix Premium 4K UHD 1 Month",
    "title": "اشتراك نتفلكس بريميوم 4K (Netflix UHD) - شهر كامل",
    "service_key": "entertainment",
    "service_name": "نتفلكس (Netflix)",
    "category": "entertainment",
    "brand_color": "#E50914",
    "brand_gradient": "linear-gradient(135deg, #141414 0%, #831010 50%, #e50914 100%)",
    "brand_label": "Netflix 4K",
    "icon": "assets/official_icons/netflix.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان كامل 30 يوم",
    "warranty_policy": "ضمان استبدال رسمي فوري في حال حدوث أي توقف.",
    "duration": "شهر كامل (30 يوم)",
    "stock": 50,
    "sold": 410,
    "in_stock": True,
    "prices": { "usd": 4.5, "sar": 17.2, "yer_sanaa": 2412, "yer_aden": 9000 },
    "card_desc": "مشاهدة بأعلى دقة 4K Ultra HD مع دعم تقنية الصوت المحيطي Spatial Audio وخلو تام من الإعلانات على كافة الأجهزة.",
    "modal_data": {
      "raw_description_ar": "حساب نتفلكس باقة بريميوم الأعلى، يتيح لك متابعة أحدث الأفلام والمسلسلات الحصرية بأعلى دقة ووضوح.",
      "features": [
        "أعلى دقة عرض 4K Ultra HD و HDR",
        "بروفايل خاص بك بكلمة سر PIN لحفظ قوائمك ومتابعاتك",
        "تنزيل الحلقات للمشاهدة بدون إنترنت"
      ],
      "where_to_use": ["الشاشات الذكية Smart TV، الهواتف، والكمبيوتر"],
      "how_to_use": ["تسجيل الدخول واختيار ملفك الشخصي والاستمتاع بالمشاهدة"],
      "activation_methods": "بروفايل خاص أو حساب كامل مخصص.",
      "step_by_step_activation": ["سجل الدخول بالبريد وكلمة السر المسلمة لك."],
      "account_type": "بروفايل بريميوم رسمي",
      "delivery_format": "تسليم فوري عبر واتساب.",
      "support_info": "دعم فني عبر واتساب 782611415."
    }
  },
  {
    "id": "prod_youtube_premium",
    "raw_name": "YouTube Premium Individual 1 Month",
    "title": "اشتراك يوتيوب بريميوم (YouTube Premium) - شهر كامل",
    "service_key": "entertainment",
    "service_name": "يوتيوب بريميوم (YouTube)",
    "category": "entertainment",
    "brand_color": "#FF0000",
    "brand_gradient": "linear-gradient(135deg, #990000 0%, #ff0000 50%, #ff6b6b 100%)",
    "brand_label": "YouTube Pro",
    "icon": "assets/official_icons/youtube.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان رسمي كامل طوال المدة",
    "warranty_policy": "ضمان استبدال معتمد طوال فترة الاشتراك.",
    "duration": "شهر كامل (30 يوم)",
    "stock": 60,
    "sold": 520,
    "in_stock": True,
    "prices": { "usd": 2.5, "sar": 9.5, "yer_sanaa": 1340, "yer_aden": 5000 },
    "card_desc": "مشاهدة خالية تماماً من الإعلانات المزعجة، مع تشغيل المقاطع في الخلفية وتحميل الفيديوهات وتطبيق YouTube Music مجاناً.",
    "modal_data": {
      "raw_description_ar": "اشتراك يوتيوب بريميوم الرسمي يمنحك تجربة استماع ومشاهدة سلسة ونقية على إيميلك الشخصي.",
      "features": [
        "بدون إعلانات نهائياً على جميع مقاطع الفيديو",
        "تشغيل الصوت في الخلفية أثناء قفل الشاشة أو فتح تطبيقات أخرى",
        "تحميل الفيديوهات للمشاهدة في أي وقت بدون اتصال",
        "تفعيل كامل لتطبيق YouTube Music بريميوم"
      ],
      "where_to_use": ["تطبيقات يوتيوب على الجوال والشاشات والمتصفحات"],
      "how_to_use": ["الاستمتاع بالمقاطع بدون فواصل إعلانية"],
      "activation_methods": "دعوة عائلية رسمية ترسل إلى إيميلك الشخصي.",
      "step_by_step_activation": ["أرسل إيميلك واقبل الدعوة لتفعيل الميزات فوراً."],
      "account_type": "تفعيل على إيميلك الشخصي",
      "delivery_format": "تسليم فوري عبر واتساب.",
      "support_info": "دعم فني عبر واتساب 782611415."
    }
  },
  {
    "id": "prod_spotify_premium",
    "raw_name": "Spotify Premium Individual 1 Month",
    "title": "اشتراك سبوتيفاي بريميوم (Spotify Premium) - شهر كامل",
    "service_key": "entertainment",
    "service_name": "سبوتيفاي (Spotify)",
    "category": "entertainment",
    "brand_color": "#1DB954",
    "brand_gradient": "linear-gradient(135deg, #115e2e 0%, #1db954 50%, #4ade80 100%)",
    "brand_label": "Spotify",
    "icon": "assets/official_icons/spotify.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان كامل 30 يوم",
    "warranty_policy": "ضمان استبدال رسمي.",
    "duration": "شهر كامل (30 يوم)",
    "stock": 40,
    "sold": 190,
    "in_stock": True,
    "prices": { "usd": 3.0, "sar": 11.5, "yer_sanaa": 1608, "yer_aden": 6000 },
    "card_desc": "استماع بدون إعلانات وبأعلى دقة صوتية ممكنة، مع إمكانية التخطي اللانهائي وتحميل المقاطع والبودكاست بدون إنترنت.",
    "modal_data": {
      "raw_description_ar": "الخدمة الصوتية والموسيقية الأولى في العالم، تقدم لك ملايين المقاطع والبودكاست بنقاء صوتي استثنائي.",
      "features": ["بدون إعلانات", "أعلى جودة صوت 320kbps", "تحميل وتشغيل أوفلاين"],
      "where_to_use": ["الهواتف والكمبيوتر والشاشات وسماعات البلوتوث"],
      "how_to_use": ["الاستماع لقوائمك المفضلة بدون فواصل"],
      "activation_methods": "تفعيل رسمي على حسابك أو حساب جاهز.",
      "step_by_step_activation": ["سجل الدخول وابدأ الاستماع."],
      "account_type": "حساب بريميوم رسمي",
      "delivery_format": "تسليم فوري عبر واتساب.",
      "support_info": "دعم فني عبر واتساب 782611415."
    }
  },

  # ── السوشيال والإنتاجية (Social & Productivity) ──
  {
    "id": "prod_telegram_premium",
    "raw_name": "Telegram Premium 3 Months Official",
    "title": "اشتراك تيليجرام بريميوم رسمي (Telegram Premium) - 3 أشهر",
    "service_key": "social",
    "service_name": "تيليجرام (Telegram)",
    "category": "social",
    "brand_color": "#0088CC",
    "brand_gradient": "linear-gradient(135deg, #005580 0%, #0088cc 50%, #38bdf8 100%)",
    "brand_label": "Telegram",
    "icon": "assets/official_icons/telegram.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان رسمي كامل طوال 3 أشهر",
    "warranty_policy": "ضمان رسمي موثق ومستمر دون انقطاع.",
    "duration": "3 أشهر كاملة",
    "stock": 40,
    "sold": 330,
    "in_stock": True,
    "prices": { "usd": 8.0, "sar": 30.6, "yer_sanaa": 4288, "yer_aden": 16000 },
    "card_desc": "تفعيل رسمي على يوزرك الشخصي: شارة النجمة الموثقة، سرعة تنزيل مضاعفة، رفع ملفات حتى 4GB، وتحويل الصوتيات إلى نصوص.",
    "modal_data": {
      "raw_description_ar": "ترقية رسمية 100% لحسابك في تيليجرام تمنحك كافة الميزات الحصرية ومضاعفة حدود المجموعات والقنوات.",
      "features": [
        "إرسال ملفات ضخمة بحجم يصل إلى 4 جيجابايت للملف الواحد",
        "سرعة تنزيل فائقة ومفتوحة بدون قيود",
        "تحويل الرسائل الصوتية والفيديو إلى نصوص مقروءة بضغطة زر",
        "شارة النجمة البريميوم بجانب اسمك وإيموجيات تفاعلية حصرية"
      ],
      "where_to_use": ["تطبيق تيليجرام على كافة الأجهزة"],
      "how_to_use": ["إرسال يوزرك الشخصي ليتم إهداء الاشتراك لحسابك مباشرة"],
      "activation_methods": "تفعيل فوري عبر هدية اشتراك رسمية على يوزرك (بدون كلمة سر).",
      "step_by_step_activation": [
        "أرسل اسم المستخدم (اليوزر @username) الخاص بحسابك.",
        "تصلك رسالة هدية تيليجرام بريميوم من تيليجرام مباشرة.",
        "تتفعل شارة النجمة وكافة الميزات على حسابك فوراً."
      ],
      "account_type": "تفعيل يوزر شخصي",
      "delivery_format": "تسليم فوري ومباشر.",
      "support_info": "دعم فني عبر واتساب 782611415."
    }
  },
  {
    "id": "prod_notion_ai",
    "raw_name": "Notion AI Pro Workspace 1 Year",
    "title": "اشتراك نوشن الذكي للإنتاجية (Notion AI Pro) - سنة كاملة",
    "service_key": "productivity",
    "service_name": "نوشن (Notion)",
    "category": "productivity",
    "brand_color": "#0F172A",
    "brand_gradient": "linear-gradient(135deg, #090d16 0%, #1e293b 50%, #475569 100%)",
    "brand_label": "Notion AI",
    "icon": "assets/official_icons/notion.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان كامل طوال السنة",
    "warranty_policy": "ضمان رسمي معتمد طوال فترة الاشتراك.",
    "duration": "سنة كاملة (12 شهر)",
    "stock": 20,
    "sold": 65,
    "in_stock": True,
    "prices": { "usd": 12.0, "sar": 45.9, "yer_sanaa": 6432, "yer_aden": 24000 },
    "card_desc": "منصة تنظيم المهام وإدارة المشاريع الأكثر كفاءة مع مساعد الذكاء الاصطناعي لكتابة وتلخيص الملاحظات وتنظيم قواعد البيانات.",
    "modal_data": {
      "raw_description_ar": "الاشتراك الأمثل لإدارة الحياة الشخصية والشركات، يجمع بين الملاحظات وجداول المشاريع والذكاء الاصطناعي التوليدي.",
      "features": ["توليد وتلخيص النصوص ذكياً", "مساحات عمل وقوالب غير محدودة", "مزامنة سريعة بين كافة أجهزتك"],
      "where_to_use": ["موقع notion.so وتطبيقات الجوال والكمبيوتر"],
      "how_to_use": ["تنظيم المشاريع وجداول الأعمال والدراسة"],
      "activation_methods": "تفعيل على حسابك الشخصي أو حساب جاهز.",
      "step_by_step_activation": ["سجل الدخول واستمتع بمساحة العمل غير المحدودة."],
      "account_type": "حساب بريميوم مفعل",
      "delivery_format": "تسليم فوري عبر واتساب.",
      "support_info": "دعم فني عبر واتساب 782611415."
    }
  },
  {
    "id": "prod_duolingo_super",
    "raw_name": "Duolingo Super Language Learning 1 Year",
    "title": "اشتراك دوولينجو لتعلم اللغات (Duolingo Super) - سنة كاملة",
    "service_key": "education",
    "service_name": "دوولينجو (Duolingo)",
    "category": "education",
    "brand_color": "#58CC02",
    "brand_gradient": "linear-gradient(135deg, #2d6a00 0%, #58cc02 50%, #86efac 100%)",
    "brand_label": "Duolingo",
    "icon": "assets/official_icons/duolingo.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان كامل 365 يوم",
    "warranty_policy": "ضمان استبدال معتمد طوال السنة.",
    "duration": "سنة كاملة (12 شهر)",
    "stock": 30,
    "sold": 180,
    "in_stock": True,
    "prices": { "usd": 8.0, "sar": 30.6, "yer_sanaa": 4288, "yer_aden": 16000 },
    "card_desc": "تعلم الإنجليزية واللغات العالمية بقلوب غير محدودة، وخلو تام من الإعلانات، مع مراجعات مخصصة للأخطاء واختبارات متقدمة.",
    "modal_data": {
      "raw_description_ar": "تطبيق تعلم اللغات الأشهر عالمياً، يتيح لك المذاكرة السريعة دون القلق بشأن نفاذ القلوب أو انقطاع التركيز.",
      "features": ["قلوب غير محدودة للمحاولة والتعلم", "بدون إعلانات", "مراجعة وتصحيح ذكي للأخطاء السابقة"],
      "where_to_use": ["تطبيق Duolingo على الهواتف والمتصفح"],
      "how_to_use": ["تحديد اللغة والبدء بالدروس اليومية"],
      "activation_methods": "دعوة رسمية ترسل إلى إيميلك الشخصي.",
      "step_by_step_activation": ["اقبل دعوة الانضمام ويتفعل Super فوراً."],
      "account_type": "تفعيل على حسابك الشخصي",
      "delivery_format": "تسليم فوري عبر واتساب.",
      "support_info": "دعم فني عبر واتساب 782611415."
    }
  },
  {
    "id": "prod_tradingview_premium",
    "raw_name": "TradingView Premium Market Analysis 1 Month",
    "title": "اشتراك تريدنج فيو لتحليل الأسواق (TradingView Premium)",
    "service_key": "finance",
    "service_name": "تريدنج فيو (TradingView)",
    "category": "productivity",
    "brand_color": "#2962FF",
    "brand_gradient": "linear-gradient(135deg, #1e40af 0%, #2962ff 50%, #60a5fa 100%)",
    "brand_label": "TradingView",
    "icon": "assets/official_icons/tradingview.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان كامل 30 يوم",
    "warranty_policy": "ضمان استبدال معتمد طوال الشهر.",
    "duration": "شهر كامل (30 يوم)",
    "stock": 20,
    "sold": 95,
    "in_stock": True,
    "prices": { "usd": 24.0, "sar": 91.8, "yer_sanaa": 12864, "yer_aden": 48000 },
    "card_desc": "المنصة الأولى لمتداولي الفوركس والكريبتو والأسهم: 8 شارتات في شاشة واحدة، فواصل ثانية، وتنبيهات فورية غير محدودة.",
    "modal_data": {
      "raw_description_ar": "أعلى باقات تريدنج فيو للمتداولين المحترفين، تتيح لك أقصى عدد من المؤشرات والبيانات الحية المباشرة.",
      "features": ["8 رسوم بيانية لكل علامة تبويب", "تنبيهات أسعار غير محدودة", "فواصل زمنية بالثواني ومؤشرات غير محدودة"],
      "where_to_use": ["موقع tradingview.com وتطبيقات الهواتف والكمبيوتر"],
      "how_to_use": ["التحليل الفني والتداول اللحظي ومتابعة الأسواق العالمية"],
      "activation_methods": "حساب بريميوم رسمي جاهز.",
      "step_by_step_activation": ["سجل الدخول بالحساب وابدأ مراقبة وتحليل الشارتات."],
      "account_type": "حساب بريميوم خاص",
      "delivery_format": "تسليم فوري عبر واتساب.",
      "support_info": "دعم فني عبر واتساب 782611415."
    }
  },

  # ── الأنظمة والمايكروسوفت (Microsoft & Operating Systems) ──
  {
    "id": "prod_win11_pro",
    "raw_name": "Windows 11 Pro Lifetime Retail Digital License",
    "title": "مفتاح تنشيط ويندوز 11 برو أصلي (Windows 11 Pro) - مدى الحياة",
    "service_key": "microsoft",
    "service_name": "مايكروسوفت (Microsoft)",
    "category": "microsoft",
    "brand_color": "#0078D4",
    "brand_gradient": "linear-gradient(135deg, #004578 0%, #0078d4 50%, #50e6ff 100%)",
    "brand_label": "Windows 11",
    "icon": "assets/official_icons/windows.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان تنشيط مدى الحياة رسمي 100%",
    "warranty_policy": "ضمان تنشيط رقمي رسمي دائم عبر سيرفرات مايكروسوفت الرسمية.",
    "duration": "مدى الحياة (Lifetime)",
    "stock": 80,
    "sold": 640,
    "in_stock": True,
    "prices": { "usd": 4.0, "sar": 15.3, "yer_sanaa": 2144, "yer_aden": 8000 },
    "card_desc": "مفتاح رقمي أصلي (Retail Key) يرتبط باللوحة الأم لجهازك مدى الحياة مع دعم التحديثات الأمنية الرسمية من مايكروسوفت.",
    "modal_data": {
      "raw_description_ar": "كود تفعيل أصلي 100% لنظام Windows 11 Pro يفتح لك كافة ميزات الأمان والتشفير BitLocker والأداء العالي.",
      "features": [
        "تنشيط رسمي أصلي يرتبط بجهاز الكمبيوتر مدى الحياة",
        "تلقي كافة التحديثات الأمنية والميزات الجديدة من مايكروسوفت",
        "يدعم النواتين 32 و 64 بت ويدعم جميع اللغات بما فيها العربية"
      ],
      "where_to_use": ["أي جهاز كمبيوتر مكتبي أو لابتوب يعمل بنظام ويندوز 11"],
      "how_to_use": ["إدخال الكود في إعدادات التنشيط بالويندوز"],
      "activation_methods": "مفتاح رقمي أصلي مكون من 25 حرفاً ورمزاً (XXXXX-XXXXX-XXXXX-XXXXX-XXXXX).",
      "step_by_step_activation": [
        "ادخل على إعدادات الكمبيوتر (Settings) ثم النظام (System).",
        "اختر التنشيط (Activation) ثم اضغط تغيير مفتاح المنتج (Change product key).",
        "الصق المفتاح المسلم لك واضغط تنشيط (Activate).",
        "سيتم تنشيط الويندوز فورياً مدى الحياة."
      ],
      "account_type": "مفتاح ترخيص رقمي أصلي",
      "delivery_format": "تسليم فوري عبر واتساب.",
      "support_info": "دعم فني عبر واتساب 782611415."
    }
  },
  {
    "id": "prod_office_365",
    "raw_name": "Microsoft 365 Pro Plus 1TB OneDrive 1 Year",
    "title": "اشتراك مايكروسوفت 365 برو وسعة 1TB (Office 365) - سنة كاملة",
    "service_key": "microsoft",
    "service_name": "مايكروسوفت (Microsoft)",
    "category": "microsoft",
    "brand_color": "#D83B01",
    "brand_gradient": "linear-gradient(135deg, #7c1a00 0%, #d83b01 50%, #f97316 100%)",
    "brand_label": "Office 365",
    "icon": "assets/official_icons/microsoft.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان كامل طوال السنة",
    "warranty_policy": "ضمان رسمي معتمد طوال فترة الاشتراك.",
    "duration": "سنة كاملة (12 شهر)",
    "stock": 45,
    "sold": 290,
    "in_stock": True,
    "prices": { "usd": 9.0, "sar": 34.4, "yer_sanaa": 4824, "yer_aden": 18000 },
    "card_desc": "تفعيل رسمي لكافة برامج الأوفيس (Word, Excel, PowerPoint) على 5 أجهزة مع سعة تخزين سحابية ضخمة 1000GB على OneDrive.",
    "modal_data": {
      "raw_description_ar": "الحزمة المكتبية الأهم للطلاب والموظفين والشركات، تدعم العمل على أجهزة الكمبيوتر والهواتف والتابلت في نفس الوقت.",
      "features": [
        "تحميل برامج أوفيس الأصلية والتحديثات المستمرة",
        "يعمل على 5 أجهزة مختلفة (كمبيوتر، لابتوب، ماك، آيفون، أندرويد)",
        "سعة تخزين سحابية 1TB على وان درايف لحفظ ملفاتك وصورك بأمان"
      ],
      "where_to_use": ["موقع office.com وتطبيقات الأوفيس على جميع الأجهزة"],
      "how_to_use": ["تثبيت حزمة البرامج وتسجيل الدخول بالبيانات المسلمة"],
      "activation_methods": "حساب رسمي مفعل مع إمكانية تعيين كلمة سر جديدة خاصة بك فوراً.",
      "step_by_step_activation": [
        "ادخل على portal.office.com وسجل الدخول بالبيانات.",
        "قم بتعيين كلمة سر جديدة خاصة بك.",
        "اضغط تثبيت التطبيقات لتحميل أوفيس على جهازك مباشرة."
      ],
      "account_type": "حساب مايكروسوفت رسمي خاص",
      "delivery_format": "تسليم فوري عبر واتساب.",
      "support_info": "دعم فني عبر واتساب 782611415."
    }
  },

  # ── الحماية والشبكات (VPN & Security) ──
  {
    "id": "prod_nordvpn",
    "raw_name": "NordVPN Ultimate Security 1 Year",
    "title": "اشتراك نورد في بي إن للأمان (NordVPN) - سنة كاملة",
    "service_key": "security",
    "service_name": "نورد في بي إن (NordVPN)",
    "category": "security",
    "brand_color": "#4687FF",
    "brand_gradient": "linear-gradient(135deg, #1d4ed8 0%, #4687ff 50%, #93c5fd 100%)",
    "brand_label": "NordVPN",
    "icon": "assets/official_icons/nordvpn.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان كامل طوال السنة",
    "warranty_policy": "ضمان استبدال رسمي معتمد.",
    "duration": "سنة كاملة (12 شهر)",
    "stock": 30,
    "sold": 160,
    "in_stock": True,
    "prices": { "usd": 11.0, "sar": 42.1, "yer_sanaa": 5896, "yer_aden": 22000 },
    "card_desc": "تصفح آمن ومحمي 100%، وتشفير عسكري لبياناتك، وفتح كافة المواقع والخدمات المحجوبة بأكثر من 6000 سيرفر عالمي فائق السرعة.",
    "modal_data": {
      "raw_description_ar": "الخدمة الأقوى عالمياً في حماية الخصوصية وتأمين الاتصال، تدعم تشغيل الألعاب والبث بجودة 4K دون أي بطء.",
      "features": [
        "تشفير عسكري متقدم وحماية من التتبع والمواقع الضارة",
        "سيرفرات فائقة السرعة تدعم بروتوكول NordLynx الثوري",
        "يعمل على أنظمة Windows و Mac و iOS و Android والشاشات"
      ],
      "where_to_use": ["تطبيق NordVPN على كافة الأجهزة"],
      "how_to_use": ["اختيار الدولة والاتصال بنقرة زر واحدة"],
      "activation_methods": "حساب بريميوم رسمي جاهز.",
      "step_by_step_activation": ["سجل الدخول في تطبيق NordVPN واضغط اتصال."],
      "account_type": "حساب بريميوم مفعل",
      "delivery_format": "تسليم فوري عبر واتساب.",
      "support_info": "دعم فني عبر واتساب 782611415."
    }
  },
  {
    "id": "prod_kaspersky",
    "raw_name": "Kaspersky Total Security 1 Device 1 Year",
    "title": "حماية كاسبرسكي توتال سيكيورتي (Kaspersky Total Security)",
    "service_key": "security",
    "service_name": "كاسبرسكي (Kaspersky)",
    "category": "security",
    "brand_color": "#00A88E",
    "brand_gradient": "linear-gradient(135deg, #005c4e 0%, #00a88e 50%, #5eead4 100%)",
    "brand_label": "Kaspersky",
    "icon": "assets/official_icons/kaspersky.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان رسمي كامل سنة كاملة",
    "warranty_policy": "ضمان أصلي معتمد من سيرفرات كاسبرسكي.",
    "duration": "سنة كاملة (12 شهر)",
    "stock": 35,
    "sold": 140,
    "in_stock": True,
    "prices": { "usd": 7.0, "sar": 26.8, "yer_sanaa": 3752, "yer_aden": 14000 },
    "card_desc": "درع الحماية الشامل ضد الفيروسات وبرامج الفدية والتجسس وحماية المعاملات البنكية ومكافحة الاختراق.",
    "modal_data": {
      "raw_description_ar": "البرنامج الأفضل عالمياً لحماية الكمبيوتر والهاتف من كافة التهديدات الرقمية والاختراقات الخبيثة.",
      "features": ["مكافحة فيروسات فورية", "حماية المعاملات والمدفوعات الإلكترونية Safe Money", "أداة تنظيف وتسريع الجهاز"],
      "where_to_use": ["الكمبيوتر PC واللابتوب والهواتف"],
      "how_to_use": ["إدخال كود التفعيل في برنامج كاسبرسكي"],
      "activation_methods": "كود تفعيل رقمي أصلي (Retail Key).",
      "step_by_step_activation": ["ادخل الكود في خانة التنشيط ببرنامج كاسبرسكي."],
      "account_type": "مفتاح ترخيص رقمي",
      "delivery_format": "تسليم فوري عبر واتساب.",
      "support_info": "دعم فني عبر واتساب 782611415."
    }
  }
]

def main():
    print(f"Total curated elite products: {len(CURATED_PRODUCTS)}")
    
    # Save to products.json
    with open('assets/data/products.json', 'w', encoding='utf-8') as f:
        json.dump(CURATED_PRODUCTS, f, ensure_ascii=False, indent=2)

    # Save to products.js
    with open('assets/data/products.js', 'w', encoding='utf-8') as f:
        f.write("window.PRODUCTS_CATALOG = ")
        json.dump(CURATED_PRODUCTS, f, ensure_ascii=False, indent=2)
        f.write(";\n")

    print("Successfully built curated catalog of 20 elite boutique products!")

if __name__ == '__main__':
    main()
