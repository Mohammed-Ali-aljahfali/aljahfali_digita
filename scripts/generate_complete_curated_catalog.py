# -*- coding: utf-8 -*-
"""
الجحفلي للحلول الرقمية - Al-Jahfali Digital Solutions
بناء الكتالوج النخبوي الرسمي (34 منتجاً نخبواً منتقى بعناية تامة)
بدون أي تكرار وبدون رموز تعبيرية (Zero Emojis)
"""

import json

PRODUCTS = [
  # ── شات جي بي تي والذكاء الاصطناعي (ChatGPT & AI) ──
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
    "brand_color": "#0284C7",
    "brand_gradient": "linear-gradient(135deg, #075985 0%, #0284c7 50%, #38bdf8 100%)",
    "brand_label": "ChatGPT Team",
    "icon": "assets/official_icons/openai.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان كامل طوال المدة",
    "warranty_policy": "ضمان رسمي كامل طوال فترة الاشتراك.",
    "duration": "شهر كامل (30 يوم)",
    "stock": 25,
    "sold": 90,
    "in_stock": True,
    "prices": { "usd": 15.0, "sar": 57.5, "yer_sanaa": 8040, "yer_aden": 30000 },
    "card_desc": "مساحة عمل احترافية للشركات وفرق العمل مع سرية تامة للبيانات وعدم تدريب النماذج عليها وحدود رسائل أعلى.",
    "modal_data": {
      "raw_description_ar": "مساحة عمل مؤسسية مخصصة للشركات والمصممين والمبرمجين مع ميزات خصوصية متقدمة لضمان أمان ملفاتك وأكوادك البرمجية.",
      "features": [
        "عدم استخدام بياناتك أو مستنداتك في تدريب نماذج OpenAI إطلاقاً",
        "حدود استخدام مضاعفة مقارنة بالحساب العادي",
        "مشاركة الروبوتات المخصصة GPTs داخل مساحة العمل بأمان",
        "لوحة إدارة متكاملة لمتابعة صلاحيات الأعضاء"
      ],
      "where_to_use": ["موقع وتطبيقات ChatGPT"],
      "how_to_use": ["إدارة مهام الفريق والتعاون على المستندات والتحليلات"],
      "activation_methods": "دعوة بريد رسمي للانضمام إلى مساحة العمل Workspace أو حساب جاهز.",
      "step_by_step_activation": [
        "أرسل بريدك الإلكتروني لإرسال دعوة الانضمام.",
        "افتح رسالة الدعوة في بريدك واضغط قبول Join Workspace.",
        "تمتع بكافة مميزات باقة Team فوراً."
      ],
      "account_type": "مساحة عمل تجارية",
      "delivery_format": "تسليم عبر البريد الإلكتروني وواتساب.",
      "support_info": "دعم فني عبر واتساب 782611415."
    }
  },
  {
    "id": "prod_chatgpt_go",
    "raw_name": "ChatGPT Go Shared Plan Budget 1 Month",
    "title": "اشتراك شات جي بي تي جو الاقتصادي (ChatGPT Go)",
    "service_key": "chatgpt",
    "service_name": "شات جي بي تي (ChatGPT & OpenAI)",
    "category": "ai",
    "brand_color": "#0D9488",
    "brand_gradient": "linear-gradient(135deg, #115e59 0%, #0d9488 50%, #2dd4bf 100%)",
    "brand_label": "ChatGPT Go",
    "icon": "assets/official_icons/openai.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان كامل طوال المدة",
    "warranty_policy": "ضمان استبدال فوري عند حدوث أي عائق.",
    "duration": "شهر كامل (30 يوم)",
    "stock": 40,
    "sold": 310,
    "in_stock": True,
    "prices": { "usd": 3.9, "sar": 14.9, "yer_sanaa": 2090, "yer_aden": 7800 },
    "card_desc": "خيار اقتصادي فائق القوة للطلاب والمبتدئين للاستفادة من مميزات GPT-4o وتلخيص الدروس وحل المسائل بأقل تكلفة.",
    "modal_data": {
      "raw_description_ar": "الاشتراك الاقتصادي المثالي للطلاب والباحثين يمنحك تجربة ذكاء اصطناعي حديثة بسعر رمزي جداً ومناسب للجميع.",
      "features": [
        "وصول لنماذج GPT-4o السريعة",
        "حل الواجبات المدرسية والجامعية والمسائل الحسابية",
        "ترجمة وتلخيص النصوص ومقالات الأبحاث",
        "توليد الأفكار والمساعدة في كتابة المقالات"
      ],
      "where_to_use": ["المتصفح وتطبيق الهاتف الرسمي"],
      "how_to_use": ["طرح الأسئلة ومساعدة المذاكرة والترجمة اليومية"],
      "activation_methods": "حساب جاهز مفعل مسبقاً للتسليم المباشر.",
      "step_by_step_activation": [
        "استلم البريد وكلمة المرور فور الدفع.",
        "سجل دخولك إلى chatgpt.com.",
        "ابدأ محادثاتك وأبحاثك فوراً."
      ],
      "account_type": "حساب مفعل جاهز",
      "delivery_format": "تسليم فوري عبر واتساب.",
      "support_info": "دعم فني عبر واتساب 782611415."
    }
  },

  # ── بقية نماذج الذكاء الاصطناعي (Claude, Gemini, Perplexity, etc.) ──
  {
    "id": "prod_claude_pro",
    "raw_name": "Claude Pro 3.5 Sonnet 1 Month",
    "title": "اشتراك كلود برو وتوكنات (Claude 3.5 Sonnet Pro)",
    "service_key": "claude",
    "service_name": "أنثروبيك كلود (Claude AI)",
    "category": "ai",
    "brand_color": "#D97706",
    "brand_gradient": "linear-gradient(135deg, #78350f 0%, #b45309 50%, #d97706 100%)",
    "brand_label": "Claude Pro",
    "icon": "assets/official_icons/anthropic.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان كامل طوال المدة (30 يوم)",
    "warranty_policy": "ضمان استبدال معتمد طوال الشهر.",
    "duration": "شهر كامل (30 يوم)",
    "stock": 35,
    "sold": 120,
    "in_stock": True,
    "prices": { "usd": 13.0, "sar": 49.8, "yer_sanaa": 6968, "yer_aden": 26000 },
    "card_desc": "النموذج الأفضل عالمياً في البرمجة وكتابة الأكواد واللغة العربية مع ميزة Artifacts التفاعلية وسعة سياق ضخمة.",
    "modal_data": {
      "raw_description_ar": "اشتراك رسمي في منصة Claude Pro من Anthropic، النموذج الأقوى عالمياً في صياغة الأكواد البرمجية وتحليل الأوراق الأكاديمية.",
      "features": [
        "وصول غير محدود لنموذج Claude 3.5 Sonnet المتفوق عالمياً",
        "ميزة نافذة العرض التفاعلية المباشرة Artifacts لمعاينة الأكواد والتصاميم",
        "تحليل مستندات PDF ضخمة وكتابة أكواد نظيفة خالية من الأخطاء",
        "فهم استثنائي ودقيق جداً لقواعد وبلاغة اللغة العربية"
      ],
      "where_to_use": ["منصة claude.ai على المتصفح وتطبيقات الهاتف الذكي"],
      "how_to_use": ["تطوير البرمجيات وكتابة المقالات المتخصصة وتدقيق المستندات"],
      "activation_methods": "حساب خاص رسمي أو تفعيل مباشر على بريدك الشخصي.",
      "step_by_step_activation": [
        "استلم بيانات الحساب فور تأكيد الطلب.",
        "افتح claude.ai وسجل الدخول مباشرة.",
        "تأكد من تفعيل باقة Claude Pro واستمتع بكامل القدرات."
      ],
      "account_type": "حساب برو خاص مفعل",
      "delivery_format": "تسليم فوري عبر واتساب.",
      "support_info": "دعم فني عبر واتساب 782611415."
    }
  },
  {
    "id": "prod_gemini_advanced",
    "raw_name": "Google Gemini Advanced & Google One 2TB 1 Month",
    "title": "اشتراك جوجل جيميني المتقدم (Gemini Advanced & 2TB)",
    "service_key": "google",
    "service_name": "جوجل جيميني (Google Gemini)",
    "category": "ai",
    "brand_color": "#4285F4",
    "brand_gradient": "linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #60a5fa 100%)",
    "brand_label": "Gemini Advanced",
    "icon": "assets/official_icons/google.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان كامل طوال المدة",
    "warranty_policy": "ضمان استبدال رسمي معتمد.",
    "duration": "شهر كامل (30 يوم)",
    "stock": 30,
    "sold": 95,
    "in_stock": True,
    "prices": { "usd": 8.5, "sar": 32.5, "yer_sanaa": 4556, "yer_aden": 17000 },
    "card_desc": "نموذج Gemini 1.5 Pro بنافذة سياق مليون توكن مع مساحة تخزين سحابية 2 تيرابايت على Google Drive و Gmail.",
    "modal_data": {
      "raw_description_ar": "احصل على أقوى نماذج الذكاء الاصطناعي من جوجل مع باقة Google One التخزينية العملاقة 2TB وتكامل كامل مع تطبيقات Google Workspace.",
      "features": [
        "وصول كامل لنموذج Gemini 1.5 Pro و Gemini 2.0 Flash",
        "مساحة سحابية 2000 جيجابايت (2TB) لـ Google Drive و Photos و Gmail",
        "معالجة فيديوهات كاملة ومستندات تصل إلى مليون توكن دفعة واحدة",
        "تكامل مباشر مع Docs و Gmail و Sheets لمساعدتك في العمل اليومي"
      ],
      "where_to_use": ["موقع gemini.google.com وتطبيقات Google One على Android و iOS"],
      "how_to_use": ["رفع ملفات الفيديو والملفات الضخمة وتخزين البيانات السحابية بأمان"],
      "activation_methods": "إضافة وتفعيل رسمي لحسابك في Google أو حساب جاهز.",
      "step_by_step_activation": [
        "استلم رابط التفعيل أو بيانات الحساب.",
        "سجل دخولك واستفد فوراً من سعة التخزين والنموذج المتقدم."
      ],
      "account_type": "حساب رسمي مفعل مع مساحة 2TB",
      "delivery_format": "تسليم فوري عبر واتساب.",
      "support_info": "دعم فني عبر واتساب 782611415."
    }
  },
  {
    "id": "prod_perplexity_pro",
    "raw_name": "Perplexity Pro AI Search 1 Month",
    "title": "اشتراك بيربلكسيتي برو للبحث الذكي (Perplexity Pro)",
    "service_key": "perplexity",
    "service_name": "بيربلكسيتي (Perplexity AI)",
    "category": "ai",
    "brand_color": "#20B2AA",
    "brand_gradient": "linear-gradient(135deg, #004d40 0%, #00897b 50%, #20b2aa 100%)",
    "brand_label": "Perplexity Pro",
    "icon": "assets/official_icons/perplexity.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان كامل طوال المدة",
    "warranty_policy": "ضمان استبدال معتمد طوال فترة الاشتراك.",
    "duration": "شهر كامل (30 يوم)",
    "stock": 25,
    "sold": 78,
    "in_stock": True,
    "prices": { "usd": 9.5, "sar": 36.4, "yer_sanaa": 5092, "yer_aden": 19000 },
    "card_desc": "محرك البحث الأذكى عالمياً مع مصادر موثقة، والتبديل بين GPT-4o و Claude 3.5 و Sonar، وبحث عميق غير محدود.",
    "modal_data": {
      "raw_description_ar": "بديل جوجل الثوري والأقوى للباحثين والطلاب، يقدم إجابات ذكية فورية مع روابط المصادر الرسمية وتحليل الملفات.",
      "features": [
        "أكثر من 300 استعلام يومياً بتقنية Pro Search المعمقة",
        "حرية اختيار النموذج المفضل (Claude 3.5 Sonnet / GPT-4o)",
        "رفع وتحليل ملفات PDF والمستندات وجداول البيانات",
        "توليد الصور التوضيحية وتلخيص صفحات الويب بنقرة واحدة"
      ],
      "where_to_use": ["موقع perplexity.ai وتطبيقات iOS و Android"],
      "how_to_use": ["البحث الأكاديمي الموثق وكتابة رسائل الماجستير واستخراج المصادر"],
      "activation_methods": "حساب برو جاهز أو ترقية بريدك الشخصي.",
      "step_by_step_activation": [
        "سجل دخولك بالبيانات المرسلة لك على perplexity.ai.",
        "ابدأ بالبحث عبر تبويب Pro Search واستمتع بأقوى النتائج."
      ],
      "account_type": "حساب برو خاص",
      "delivery_format": "تسليم فوري عبر واتساب.",
      "support_info": "دعم فني عبر واتساب 782611415."
    }
  },
  {
    "id": "prod_cursor_pro",
    "raw_name": "Cursor Pro AI Code Editor 1 Month",
    "title": "محرر البرمجة الذكي كيرسور برو (Cursor Pro AI)",
    "service_key": "cursor",
    "service_name": "كيرسور برو (Cursor AI)",
    "category": "ai",
    "brand_color": "#6366F1",
    "brand_gradient": "linear-gradient(135deg, #312e81 0%, #4f46e5 50%, #6366f1 100%)",
    "brand_label": "Cursor Pro",
    "icon": "assets/official_icons/cursor.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان كامل طوال المدة",
    "warranty_policy": "ضمان استبدال رسمي معتمد.",
    "duration": "شهر كامل (30 يوم)",
    "stock": 20,
    "sold": 65,
    "in_stock": True,
    "prices": { "usd": 12.5, "sar": 47.9, "yer_sanaa": 6700, "yer_aden": 25000 },
    "card_desc": "بيئة البرمجة الأسرع انتشاراً عالمياً مع دعم التعديل متعدد الملفات التلقائي و 500 طلب سريع لنموذج Claude 3.5 Sonnet.",
    "modal_data": {
      "raw_description_ar": "محرر الأكواد الأقوى للمبرمجين المبني على VS Code، يفهم مشروعك البرمجي كاملاً وينفذ التعديلات في كافة الملفات بذكاء.",
      "features": [
        "500 طلب Fast Premium شهرياً لنماذج Claude 3.5 و GPT-4o",
        "تعديل وإنشاء ملفات متعددة تلقائياً عبر ميزة Composer",
        "فهم شامل لكود المشروع والتنقل الذكي وحل الأخطاء البرمجية",
        "ميزة التكملة التلقائية المتقدمة للأسطر المتتالية Tab-to-Complete"
      ],
      "where_to_use": ["برنامج Cursor على أنظمة Windows و macOS و Linux"],
      "how_to_use": ["تطوير التطبيقات والمواقع وكتابة واجهات API وتصحيح الأخطاء"],
      "activation_methods": "حساب جاهز مفعل باشتراك Pro أو ترقية حسابك.",
      "step_by_step_activation": [
        "حمل برنامج Cursor وسجل الدخول بالبيانات المسلمة لك.",
        "افتح مجلد مشروعك واضغط Ctrl+I لتجربة ميزة Composer الثورية."
      ],
      "account_type": "حساب برو مفعل",
      "delivery_format": "تسليم فوري عبر واتساب.",
      "support_info": "دعم فني عبر واتساب 782611415."
    }
  },
  {
    "id": "prod_github_copilot",
    "raw_name": "GitHub Copilot Pro Individual 1 Month",
    "title": "اشتراك جيت هب كوبايلوت (GitHub Copilot Pro)",
    "service_key": "github",
    "service_name": "جيت هب كوبايلوت (GitHub Copilot)",
    "category": "ai",
    "brand_color": "#24292F",
    "brand_gradient": "linear-gradient(135deg, #0d1117 0%, #161b22 50%, #30363d 100%)",
    "brand_label": "GitHub Copilot",
    "icon": "assets/official_icons/github.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان كامل طوال المدة",
    "warranty_policy": "ضمان استبدال فوري عند أي مشكلة.",
    "duration": "شهر كامل (30 يوم)",
    "stock": 30,
    "sold": 82,
    "in_stock": True,
    "prices": { "usd": 6.5, "sar": 24.9, "yer_sanaa": 3484, "yer_aden": 13000 },
    "card_desc": "مساعد المطور الذكي الأول في العالم مدمج داخل VS Code و IntelliJ، يكتب الدوال والأكواد ويشرحها تلقائياً.",
    "modal_data": {
      "raw_description_ar": "الأداة الرسمية من مايكروسوفت وجيت هب لكتابة الأكواد بالذكاء الاصطناعي مع دعم كامل لمختلف لغات البرمجة.",
      "features": [
        "إكمال تلقائي للأكواد والدوال بالكامل داخل محررك البرمجي",
        "شات تفاعلي مدمج GitHub Copilot Chat لشرح وحل الثغرات",
        "توليد اختبارات الوحدة Unit Tests بنقرة زر",
        "دعم VS Code و Visual Studio و JetBrains و Neovim"
      ],
      "where_to_use": ["محررات VS Code و PyCharm و IntelliJ و WebStorm"],
      "how_to_use": ["كتابة التعليقات لتحويلها تلقائياً لأكواد برمجية جاهزة"],
      "activation_methods": "حساب جيت هب رسمي مفعل جاهز للاستخدام.",
      "step_by_step_activation": [
        "سجل دخولك في GitHub داخل إضافة VS Code.",
        "ابدأ البرمجة وستظهر الاقتراحات التلقائية فوراً."
      ],
      "account_type": "حساب جيت هب رسمي",
      "delivery_format": "تسليم فوري عبر واتساب.",
      "support_info": "دعم فني عبر واتساب 782611415."
    }
  },
  {
    "id": "prod_deepseek_tokens",
    "raw_name": "DeepSeek R1 Pro Full Access Package",
    "title": "باقة ديب سيك بريميوم (DeepSeek-R1 Full Access)",
    "service_key": "deepseek",
    "service_name": "ديب سيك (DeepSeek AI)",
    "category": "ai",
    "brand_color": "#1E40AF",
    "brand_gradient": "linear-gradient(135deg, #172554 0%, #1e40af 50%, #3b82f6 100%)",
    "brand_label": "DeepSeek R1",
    "icon": "assets/official_icons/deepseek.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان كامل",
    "warranty_policy": "ضمان رصيد وتشغيل معتمد.",
    "duration": "دائم / بحسب الاستهلاك",
    "stock": 45,
    "sold": 115,
    "in_stock": True,
    "prices": { "usd": 5.0, "sar": 19.2, "yer_sanaa": 2680, "yer_aden": 10000 },
    "card_desc": "النموذج الصيني الثوري في التفكير المنطقي والرياضيات وكتابة الأكواد بتكلفة منخفضة جداً وأداء يضاهي o1.",
    "modal_data": {
      "raw_description_ar": "استفد من ثورة DeepSeek-R1 للاستدلال المنطقي وحل المسائل البرمجية والرياضية المعقدة بسرعة وأمان.",
      "features": [
        "وصول لنموذج DeepSeek-R1 للتفكير المنطقي العميق",
        "توليد أكواد عالية الدقة وحل المعادلات الرياضية",
        "استهلاك اقتصادي جداً مع استجابة فائقة السرعة",
        "دعم الاستخدام المباشر عبر الويب ومفاتيح API"
      ],
      "where_to_use": ["موقع deepseek.com وتطبيقات الذكاء الاصطناعي"],
      "how_to_use": ["تحليل المسائل المعقدة واستخراج الاستنتاجات العلمية المنطقية"],
      "activation_methods": "حساب رسمي مفعّل برصيد وافر.",
      "step_by_step_activation": [
        "سجل دخولك عبر الموقع بالبيانات المرسلة.",
        "ابدأ تشغيل نموذج DeepSeek-R1 فوراً."
      ],
      "account_type": "حساب بريميوم رسمي",
      "delivery_format": "تسليم فوري عبر واتساب.",
      "support_info": "دعم فني عبر واتساب 782611415."
    }
  },

  # ── التصميم وتوليد الصور والفيديو (Design, Media & Creativity) ──
  {
    "id": "prod_midjourney",
    "raw_name": "Midjourney Standard Plan 1 Month",
    "title": "اشتراك ميدجورني لتوليد وتصميم الصور (Midjourney)",
    "service_key": "midjourney",
    "service_name": "ميدجورني (Midjourney)",
    "category": "design",
    "brand_color": "#1E293B",
    "brand_gradient": "linear-gradient(135deg, #020617 0%, #0f172a 50%, #334155 100%)",
    "brand_label": "Midjourney",
    "icon": "assets/official_icons/midjourney.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان كامل طوال مدة الاشتراك",
    "warranty_policy": "ضمان استبدال فوري طوال 30 يوماً.",
    "duration": "شهر كامل (30 يوم)",
    "stock": 20,
    "sold": 110,
    "in_stock": True,
    "prices": { "usd": 14.0, "sar": 53.6, "yer_sanaa": 7504, "yer_aden": 28000 },
    "card_desc": "المنصة الأولى عالمياً في صناعة الصور الفنية الواقعية والخيالية والشعارات ثلاثية الأبعاد بدقة استثنائية.",
    "modal_data": {
      "raw_description_ar": "اشتراك رسمي في منصة Midjourney يمنحك ساعات توليد سريع Fast GPU غير محدودة لتصميم أروع الصور والشعارات والتصاميم السينمائية.",
      "features": [
        "ساعات توليد سريع Fast Generation مع خيار توليد غير محدود Relax Mode",
        "دعم أحدث الإصدارات V6.1 للتصاميم الواقعية ثلاثية الأبعاد",
        "حقوق الملكية التجارية الكاملة للصور الناتجة",
        "إمكانية استخدام واجهة الويب الجديدة midjourney.com بالإضافة للديسكورد"
      ],
      "where_to_use": ["موقع midjourney.com وسيرفر ديسكورد الرسمي"],
      "how_to_use": ["كتابة وصف المشهد المطلوب باللغة الإنجليزية لتوليده بدقة سينمائية"],
      "activation_methods": "حساب مفعل جاهز أو تفعيل على حسابك في ديسكورد.",
      "step_by_step_activation": [
        "استلم بيانات الدخول للحساب المفعل.",
        "ادخل عبر موقع Midjourney أو تطبيق Discord.",
        "ابدأ بأمر /imagine واصنع تصاميمك المذهلة فوراً."
      ],
      "account_type": "حساب ستاندرد رسمي",
      "delivery_format": "تسليم فوري عبر واتساب.",
      "support_info": "دعم فني عبر واتساب 782611415."
    }
  },
  {
    "id": "prod_capcut_pro",
    "raw_name": "CapCut Pro 1 Month Official Plan",
    "title": "اشتراك كاب كات برو للمونتاج (CapCut Pro) - شهر كامل",
    "service_key": "capcut",
    "service_name": "كاب كات برو (CapCut Pro)",
    "category": "design",
    "brand_color": "#000000",
    "brand_gradient": "linear-gradient(135deg, #111827 0%, #1f2937 50%, #374151 100%)",
    "brand_label": "CapCut Pro",
    "icon": "assets/official_icons/capcut.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان كامل طوال مدة الاشتراك",
    "warranty_policy": "ضمان استبدال رسمي معتمد طوال الشهر.",
    "duration": "شهر كامل (30 يوم)",
    "stock": 45,
    "sold": 290,
    "in_stock": True,
    "prices": { "usd": 4.5, "sar": 17.2, "yer_sanaa": 2412, "yer_aden": 9000 },
    "card_desc": "فتح كافة فلاتر ومؤثرات Pro الاحترافية، وتصدير الفيديو بجودة 4K 60fps بدون علامة مائية، وأدوات الذكاء الاصطناعي.",
    "modal_data": {
      "raw_description_ar": "البرنامج الأفضل عالمياً لصناع المحتوى على تيك توك ويوتيوب وإنستغرام، يمنحك كافة مميزات Pro والفلاتر الحصرية بدون علامة مائية.",
      "features": [
        "تصدير بدقة 4K فائقة الوضوح وبمعدل 60 إطار في الثانية",
        "توليد الترجمة التلقائية التفاعلية Auto Captions باللغة العربية",
        "عزل الخلفيات الذكي بنقرة زر واحدة بدون شاشة خضراء",
        "مكتبة مؤثرات صوتية وبصرية وانتقالات حصرية لا محدودة"
      ],
      "where_to_use": ["تطبيق الهاتف (iPhone & Android) وبرنامج الكمبيوتر (Windows & Mac)"],
      "how_to_use": ["مونتاج فيديوهات ريلز وتيك توك ويوتيوب وإضافة مؤثرات احترافية"],
      "activation_methods": "حساب رسمي مفعل جاهز للتسليم الفوري مع كود التفعيل.",
      "step_by_step_activation": [
        "افتح تطبيق CapCut على الهاتف أو الكمبيوتر.",
        "سجل الدخول بالبريد الإلكتروني وكلمة المرور المسلمة لك.",
        "تأكد من ظهور شعار Pro بجانب اسم الحساب واستمتع بكافة الميزات."
      ],
      "account_type": "حساب برو رسمي خاص",
      "delivery_format": "تسليم فوري عبر واتساب.",
      "support_info": "دعم فني عبر واتساب 782611415."
    }
  },
  {
    "id": "prod_canva_pro",
    "raw_name": "Canva Pro Educational/Pro 1 Year Subscription",
    "title": "اشتراك كانفا برو للتصميم (Canva Pro) - سنة كاملة",
    "service_key": "canva",
    "service_name": "كانفا برو (Canva Pro)",
    "category": "design",
    "brand_color": "#00C4CC",
    "brand_gradient": "linear-gradient(135deg, #007780 0%, #00a4ad 50%, #00c4cc 100%)",
    "brand_label": "Canva Pro",
    "icon": "assets/official_icons/canva.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان سنة كاملة (12 شهر)",
    "warranty_policy": "ضمان استبدال وإعادة تفعيل طوال السنة.",
    "duration": "سنة كاملة (12 شهر)",
    "stock": 60,
    "sold": 380,
    "in_stock": True,
    "prices": { "usd": 5.0, "sar": 19.2, "yer_sanaa": 2680, "yer_aden": 10000 },
    "card_desc": "وصول غير محدود لأكثر من 100 مليون قالب وصورة وعنصر مدفوع مع إزالة خلفيات الصور والفيديو بنقرة زر واحدة وتغيير المقاسات السحري.",
    "modal_data": {
      "raw_description_ar": "الاشتراك الأفضل لرواد الأعمال والمصممين والمسوقين لتصميم المنشورات والعروض التقديمية واللوجوهات والشعارات باحترافية وسرعة مذهلة.",
      "features": [
        "إزالة الخلفية السحرية من الصور ومقاطع الفيديو بنقرة واحدة",
        "تغيير مقاسات التصاميم تلقائياً لتناسب كافة منصات التواصل Magic Switch",
        "مكتبة عملاقة تحتوي ملايين الخطوط العربية والعالمية الحصرية",
        "تنزيل التصاميم بأعلى دقة وخلفية شفافة PNG و PDF للطباعة"
      ],
      "where_to_use": ["موقع canva.com وتطبيقات iPhone و Android وأجهزة الكمبيوتر"],
      "how_to_use": ["تصميم منشورات السوشيال ميديا والإعلانات والشهادات والبطاقات"],
      "activation_methods": "دعوة رسمية لتفعيل حسابك الشخصي أو حساب مفعل جاهز.",
      "step_by_step_activation": [
        "أرسل بريدك الإلكتروني المسجل في كانفا.",
        "ستصلك دعوة رسمية للانضمام إلى الفريق التعليمي أو فريق Pro.",
        "اضغط على قبول الدعوة وسيتحول حسابك فوراً إلى Canva Pro لمدة سنة كاملة."
      ],
      "account_type": "تفعيل على بريدك الشخصي",
      "delivery_format": "تسليم فوري عبر واتساب والبريد.",
      "support_info": "دعم فني عبر واتساب 782611415."
    }
  },
  {
    "id": "prod_adobe_creative_cloud",
    "raw_name": "Adobe Creative Cloud All Apps 1 Month Official",
    "title": "حزمة أدوبي الشاملة (Adobe Creative Cloud All Apps)",
    "service_key": "adobe",
    "service_name": "أدوبي (Adobe)",
    "category": "design",
    "brand_color": "#FF0000",
    "brand_gradient": "linear-gradient(135deg, #990000 0%, #cc0000 50%, #ff0000 100%)",
    "brand_label": "Adobe CC",
    "icon": "assets/official_icons/adobe.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان كامل طوال مدة الاشتراك",
    "warranty_policy": "ضمان رسمي معتمد طوال المدة.",
    "duration": "شهر كامل (30 يوم)",
    "stock": 25,
    "sold": 130,
    "in_stock": True,
    "prices": { "usd": 18.0, "sar": 68.9, "yer_sanaa": 9648, "yer_aden": 36000 },
    "card_desc": "اشتراك رسمي شامل لأكثر من 20 تطبيقاً: Photoshop و Premiere Pro و Illustrator و After Effects مع 100GB مساحة سحابية والذكاء الاصطناعي Firefly.",
    "modal_data": {
      "raw_description_ar": "الحزمة الإبداعية الاحترافية الكاملة من شركة Adobe العالمية للمصممين ومحرري الفيديو وصناع الأفلام الرقمية.",
      "features": [
        "وصول وتحديث رسمي لكافة برامج أدوبي (فوتوشوب، إليستريتور، بريمير، أفترإفكتس)",
        "توليد الصور وتعديل الأبعاد بالذكاء الاصطناعي التوليدي Adobe Firefly",
        "مساحة تخزين سحابية 100GB لحفظ ومزامنة المشاريع",
        "دعم الخطوط الاحترافية من Adobe Fonts وقوالب Adobe Stock"
      ],
      "where_to_use": ["برنامج Adobe Creative Cloud على أجهزة Windows و Mac والآيباد"],
      "how_to_use": ["تصميم الجرافيك وتعديل الصور ومونتاج الفيديوهات السينمائية"],
      "activation_methods": "حساب رسمي جاهز أو تفعيل بريدك الإلكتروني.",
      "step_by_step_activation": [
        "سجل دخولك في تطبيق Adobe Creative Cloud Desktop بالبيانات المسلمة.",
        "حمل أي برنامج تريده مباشرة وافتحه بنقرة واحدة."
      ],
      "account_type": "اشتراك رسمي كامل",
      "delivery_format": "تسليم فوري عبر واتساب.",
      "support_info": "دعم فني عبر واتساب 782611415."
    }
  },
  {
    "id": "prod_figma_pro",
    "raw_name": "Figma Professional Team Workspace 1 Year",
    "title": "اشتراك فيجما برو لتصميم الواجهات (Figma Professional)",
    "service_key": "figma",
    "service_name": "فيجما (Figma)",
    "category": "design",
    "brand_color": "#F24E1E",
    "brand_gradient": "linear-gradient(135deg, #a22405 0%, #d83b01 50%, #f24e1e 100%)",
    "brand_label": "Figma Pro",
    "icon": "assets/official_icons/figma.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان سنة كاملة",
    "warranty_policy": "ضمان رسمي معتمد.",
    "duration": "سنة كاملة (12 شهر)",
    "stock": 25,
    "sold": 74,
    "in_stock": True,
    "prices": { "usd": 9.0, "sar": 34.5, "yer_sanaa": 4824, "yer_aden": 18000 },
    "card_desc": "المنصة الأولى عالمياً لتصميم واجهات وتجارب المستخدم UI/UX مع ملفات غير محدودة ومكتبات الفريق وأدوات Dev Mode.",
    "modal_data": {
      "raw_description_ar": "الأداة المعيارية لمصممي المواقع والتطبيقات مع ميزات التعاون الحي وحفظ تاريخ الإصدارات بدون حدود.",
      "features": [
        "عدد غير محدود من مشاريع وملفات فيجما وفيجام FigJam",
        "تاريخ إصدارات ومراجعات للمشاريع غير محدود Version History",
        "مكتبات عناصر وتصاميم مشتركة للفريق Shared Team Libraries",
        "تفعيل وضع المطورين Dev Mode لفحص الأكواد والقياسات بسهولة"
      ],
      "where_to_use": ["المتصفح وتطبيق Figma لسطح المكتب"],
      "how_to_use": ["تصميم واجهات التطبيقات والمواقع ومشاركة النماذج الأولية Prototypes"],
      "activation_methods": "ترقية حسابك الشخصي أو حساب مفعل جاهز.",
      "step_by_step_activation": [
        "أرسل بريدك في فيجما وستصلك دعوة الترقية فوراً.",
        "اقبل الدعوة واستمتع بكافة قدرات Professional."
      ],
      "account_type": "حساب فيجما احترافي",
      "delivery_format": "تسليم فوري عبر واتساب.",
      "support_info": "دعم فني عبر واتساب 782611415."
    }
  },
  {
    "id": "prod_freepik_premium",
    "raw_name": "Freepik Premium Downloads 1 Year",
    "title": "اشتراك فريبك بريميوم للمصممين (Freepik Premium)",
    "service_key": "freepik",
    "service_name": "فريبك (Freepik)",
    "category": "design",
    "brand_color": "#1273EB",
    "brand_gradient": "linear-gradient(135deg, #0b4998 0%, #1273eb 50%, #4da3ff 100%)",
    "brand_label": "Freepik",
    "icon": "assets/official_icons/freepik.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان كامل طوال المدة",
    "warranty_policy": "ضمان استبدال معتمد.",
    "duration": "سنة كاملة (12 شهر)",
    "stock": 35,
    "sold": 145,
    "in_stock": True,
    "prices": { "usd": 7.5, "sar": 28.7, "yer_sanaa": 4020, "yer_aden": 15000 },
    "card_desc": "تحميل غير محدود لملفات PSD والملفات المتجهة Vectors والصور عالية الدقة بدون نسب الفضل مع قوالب احترافية.",
    "modal_data": {
      "raw_description_ar": "الكنز الأكبر لمصممي الجرافيك والدعاية والإعلان لتحميل آلاف الملحقات والتصاميم المفتوحة الجاهزة.",
      "features": [
        "تحميل ملايين ملفات الفيكتور والمتجهات وملفات الفوتوشوب المفتوحة PSD",
        "ترخيص تجاري كامل لاستخدام التصاميم دون الحاجة لذكر المصدر",
        "تصفح بدون أي إعلانات وسرعة تحميل قصوى",
        "وصول حصري لأداة توليد وتعديل الصور بالذكاء الاصطناعي Freepik Pikaso"
      ],
      "where_to_use": ["موقع freepik.com"],
      "how_to_use": ["تحميل القوالب والمخطوطات وتصاميم السوشيال ميديا المفتوحة"],
      "activation_methods": "حساب بريميوم جاهز للاستخدام المباشر.",
      "step_by_step_activation": [
        "سجل دخولك بالبريد وكلمة المرور في موقع Freepik.",
        "حمل أي تصميم مميز تحتاجه فوراً بنقرة زر."
      ],
      "account_type": "حساب بريميوم مفعل",
      "delivery_format": "تسليم فوري عبر واتساب.",
      "support_info": "دعم فني عبر واتساب 782611415."
    }
  },
  {
    "id": "prod_runway_gen3",
    "raw_name": "Runway Gen-3 Alpha Video Creator 1 Month",
    "title": "اشتراك رن واي لتوليد الفيديو (Runway Gen-3 Alpha)",
    "service_key": "runway",
    "service_name": "رن واي (Runway AI)",
    "category": "design",
    "brand_color": "#111827",
    "brand_gradient": "linear-gradient(135deg, #030712 0%, #111827 50%, #374151 100%)",
    "brand_label": "Runway Gen-3",
    "icon": "assets/official_icons/runway.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان كامل طوال المدة",
    "warranty_policy": "ضمان استبدال معتمد.",
    "duration": "شهر كامل (30 يوم)",
    "stock": 20,
    "sold": 55,
    "in_stock": True,
    "prices": { "usd": 15.0, "sar": 57.5, "yer_sanaa": 8040, "yer_aden": 30000 },
    "card_desc": "توليد مقاطع فيديو سينمائية مذهلة من النصوص والصور بأعلى واقعية باستخدام نموذج Gen-3 Alpha الرائد عالمياً.",
    "modal_data": {
      "raw_description_ar": "التقنية الأحدث عالمياً لإنتاج المقاطع المرئية التوليدية للمخرجين وصناع الإعلانات والمحتوى الرقمي.",
      "features": [
        "توليد فيديو فائق الواقعية بدقة عالية عبر نموذج Gen-3 Alpha",
        "التحكم الكامل بحركة الكاميرا والإضاءة والزوايا السينمائية",
        "تحويل الصور الثابتة إلى مشاهد حركية ديناميكية مبهرة",
        "أدوات إزالة العناصر وتعديل الخلفيات في الفيديو بالذكاء الاصطناعي"
      ],
      "where_to_use": ["موقع runwayml.com"],
      "how_to_use": ["كتابة وصف المشهد السينمائي وتحديد سرعة وحركة الكاميرا"],
      "activation_methods": "حساب رسمي مفعل بخطة Standard/Pro.",
      "step_by_step_activation": [
        "سجل الدخول على منصة Runway بالبيانات المسلمة.",
        "ابدأ إنتاج مقاطع الفيديو السينمائية فوراً."
      ],
      "account_type": "حساب بريميوم رسمي",
      "delivery_format": "تسليم فوري عبر واتساب.",
      "support_info": "دعم فني عبر واتساب 782611415."
    }
  },
  {
    "id": "prod_elevenlabs_pro",
    "raw_name": "ElevenLabs AI Voice Creator 1 Month",
    "title": "اشتراك إليفن لابس للتعليق الصوتي (ElevenLabs AI Voice)",
    "service_key": "elevenlabs",
    "service_name": "إليفن لابس (ElevenLabs)",
    "category": "design",
    "brand_color": "#111827",
    "brand_gradient": "linear-gradient(135deg, #09090b 0%, #18181b 50%, #27272a 100%)",
    "brand_label": "ElevenLabs",
    "icon": "assets/official_icons/elevenlabs.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان كامل طوال المدة",
    "warranty_policy": "ضمان استبدال معتمد.",
    "duration": "شهر كامل (30 يوم)",
    "stock": 25,
    "sold": 90,
    "in_stock": True,
    "prices": { "usd": 9.0, "sar": 34.5, "yer_sanaa": 4824, "yer_aden": 18000 },
    "card_desc": "توليد تعليق صوتي بشري فائق الواقعية باللغة العربية واللهجات الخليجية واليمنية والعالمية مع استنساخ الأصوات بدقة مذهلة.",
    "modal_data": {
      "raw_description_ar": "المنصة الأكثر واقعية على الإطلاق في تحويل النصوص إلى أصوات بشرية تنبض بالحياة والمشاعر لمقاطع الإعلانات واليوتيوب.",
      "features": [
        "أصوات بشرية عربية فصيحة وبلهجات متعددة ذات نبرة طبيعية لا مثيل لها",
        "ميزة استنساخ الصوت Voice Cloning لإنشاء نسختك الصوتية الخاصة",
        "تعديل طبقة الصوت والسرعة ومستوى المشاعر والانفعالات",
        "ترخيص تجاري كامل لاستخدام الأصوات في الإعلانات والأفلام الوثائقية"
      ],
      "where_to_use": ["منصة elevenlabs.io"],
      "how_to_use": ["لصق النص العربي واختيار الصوت المناسب وتحميل ملف MP3 فوراً"],
      "activation_methods": "حساب رسمي مفعل باشتراك Starter أو Creator.",
      "step_by_step_activation": [
        "سجل دخولك بالبيانات على elevenlabs.io.",
        "اختر نبرة الصوت والصق نصك واستمع للنتيجة المذهلة."
      ],
      "account_type": "حساب رسمي مفعل",
      "delivery_format": "تسليم فوري عبر واتساب.",
      "support_info": "دعم فني عبر واتساب 782611415."
    }
  },
  {
    "id": "prod_suno_ai",
    "raw_name": "Suno AI Music Generator Pro 1 Month",
    "title": "اشتراك سونو لتوليد الموسيقى والألحان (Suno AI Music)",
    "service_key": "suno",
    "service_name": "سونو للذكاء الاصطناعي (Suno AI)",
    "category": "design",
    "brand_color": "#E11D48",
    "brand_gradient": "linear-gradient(135deg, #881337 0%, #be123c 50%, #e11d48 100%)",
    "brand_label": "Suno AI",
    "icon": "assets/official_icons/suno.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان كامل طوال المدة",
    "warranty_policy": "ضمان استبدال معتمد.",
    "duration": "شهر كامل (30 يوم)",
    "stock": 30,
    "sold": 68,
    "in_stock": True,
    "prices": { "usd": 7.0, "sar": 26.8, "yer_sanaa": 3752, "yer_aden": 14000 },
    "card_desc": "توليد أناشيد وأغانٍ وألحان كاملة من الكلمات والنصوص باللغة العربية والإنجليزية بجودة استوديو احترافية وحقوق تجارية.",
    "modal_data": {
      "raw_description_ar": "المنصة الرائدة في تحويل الكلمات والأشعار إلى مقطوعات موسيقية وأناشيد متكاملة اللحن والغناء بالذكاء الاصطناعي.",
      "features": [
        "توليد حتى 500 أغنية أو نشيد شهرياً بجودة صوتية عالية",
        "حقوق الملكية التجارية الكاملة للأعمال المنتجة",
        "دعم الأنماط الموسيقية والإنشادية المختلفة واللغة العربية",
        "إمكانية تمديد المقاطع وتخصيص نمط العزف والإيقاع بدقة"
      ],
      "where_to_use": ["موقع suno.com وتطبيق الهاتف"],
      "how_to_use": ["كتابة كلمات القصيدة أو النشيد واختيار النمط الفني"],
      "activation_methods": "حساب مفعل جاهز بخطة Pro.",
      "step_by_step_activation": [
        "سجل الدخول على موقع suno.com.",
        "اكتب كلماتك واضغط Create للاستماع لإنتاجك فوراً."
      ],
      "account_type": "حساب برو رسمي",
      "delivery_format": "تسليم فوري عبر واتساب.",
      "support_info": "دعم فني عبر واتساب 782611415."
    }
  },

  # ── الترفيه والبث المباشر (Streaming & Entertainment) ──
  {
    "id": "prod_netflix_premium",
    "raw_name": "Netflix Premium 4K UHD 1 Month",
    "title": "اشتراك نتفلكس بريميوم 4K (Netflix UHD) - شهر كامل",
    "service_key": "entertainment",
    "service_name": "نتفلكس (Netflix)",
    "category": "entertainment",
    "brand_color": "#E50914",
    "brand_gradient": "linear-gradient(135deg, #7f0000 0%, #b30710 50%, #e50914 100%)",
    "brand_label": "Netflix 4K",
    "icon": "assets/official_icons/netflix.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان كامل طوال مدة الاشتراك (30 يوم)",
    "warranty_policy": "ضمان استبدال فوري وحل أي توقف طوال الشهر كاملاً.",
    "duration": "شهر كامل (30 يوم)",
    "stock": 40,
    "sold": 450,
    "in_stock": True,
    "prices": { "usd": 3.5, "sar": 13.4, "yer_sanaa": 1876, "yer_aden": 7000 },
    "card_desc": "أعلى باقة بريميوم بجودة 4K Ultra HD وصوت دولبي أتموس، بدون أي إعلانات، مع ملف شخصي خاص بك برقم سري PIN.",
    "modal_data": {
      "raw_description_ar": "استمتع بمشاهدة أحدث الأفلام والمسلسلات والوثائقيات العالمية والمسلسلات المعربة بأعلى جودة ممكنة 4K UHD بدون أي إعلانات.",
      "features": [
        "مشاهدة بأعلى دقة 4K Ultra HD مع تقنية الألوان HDR و Dolby Vision",
        "ملف شخصي خاص بك Profile محمي برمز سري PIN لخصوصية تامة",
        "إمكانية تنزيل الحلقات والأفلام للمشاهدة بدون إنترنت",
        "يعمل بسلاسة على الشاشات الذكية Smart TV وأجهزة الهاتف واللابتوب"
      ],
      "where_to_use": ["الشاشات الذكية (سامسونج، إل جي)، الهواتف (Android & iPhone)، والكمبيوتر"],
      "how_to_use": ["تسجيل الدخول واختيار ملفك المخصص وإدخال رمزك السري"],
      "activation_methods": "ملف بريميوم خاص بك داخل حساب رسمي مستقر ومضمون طوال الشهر.",
      "step_by_step_activation": [
        "استلم إيميل الحساب وكلمة المرور ورقم ملفك والـ PIN.",
        "افتح تطبيق Netflix وسجل الدخول.",
        "اختر ملفك الخاص واستمتع بالمشاهدة الممتعة بجودة فائقة."
      ],
      "account_type": "ملف بريميوم خاص 4K",
      "delivery_format": "تسليم فوري عبر واتساب.",
      "support_info": "دعم فني وضمان استبدال فوري عبر واتساب 782611415."
    }
  },
  {
    "id": "prod_youtube_premium",
    "raw_name": "YouTube Premium Individual/Family 1 Month",
    "title": "اشتراك يوتيوب بريميوم (YouTube Premium) - شهر كامل",
    "service_key": "entertainment",
    "service_name": "يوتيوب بريميوم (YouTube)",
    "category": "entertainment",
    "brand_color": "#FF0000",
    "brand_gradient": "linear-gradient(135deg, #880000 0%, #cc0000 50%, #ff0000 100%)",
    "brand_label": "YouTube Premium",
    "icon": "assets/official_icons/youtube.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان كامل طوال المدة",
    "warranty_policy": "ضمان رسمي معتمد طوال المدة.",
    "duration": "شهر كامل (30 يوم)",
    "stock": 70,
    "sold": 520,
    "in_stock": True,
    "prices": { "usd": 2.5, "sar": 9.6, "yer_sanaa": 1340, "yer_aden": 5000 },
    "card_desc": "مشاهدة كافة مقاطع يوتيوب بدون أي إعلانات مزعجة، والتشغيل في الخلفية أثناء إغلاق الشاشة، واشتراك مجاني في تطبيق YouTube Music.",
    "modal_data": {
      "raw_description_ar": "الترقية الرسمية لحسابك في يوتيوب للاستمتاع بتجربة مشاهدة نقية خالية تماماً من الإعلانات مع إمكانية تشغيل الصوت في الخلفية.",
      "features": [
        "حذف كافة الإعلانات قبل وأثناء مقاطع الفيديو نهائياً",
        "ميزة تشغيل الفيديو والصوت في الخلفية عند قفل الشاشة أو فتح تطبيقات أخرى",
        "تنزيل مقاطع الفيديو لمشاهدتها في أي وقت دون اتصال بالإنترنت",
        "وصول مجاني وغير محدود لتطبيق الموسيقى الرسمي YouTube Music"
      ],
      "where_to_use": ["كافة الأجهزة: الهواتف، الشاشات الذكية، أجهزة الكمبيوتر، والسيارات"],
      "how_to_use": ["استخدام تطبيق يوتيوب الرسمي كالمعتاد بدون أي إعلانات"],
      "activation_methods": "تفعيل رسمي ومباشر على بريدك الإلكتروني الشخصي (بدون طلب كلمة السر).",
      "step_by_step_activation": [
        "أرسل بريدك الإلكتروني (Gmail) عند الطلب.",
        "ستصلك رسالة دعوة رسمية من Google إلى بريدك.",
        "اضغط على قبول الدعوة وسيتحول حسابك فوراً إلى YouTube Premium."
      ],
      "account_type": "تفعيل رسمي على إيميلك الشخصي",
      "delivery_format": "تسليم فوري عبر واتساب والبريد.",
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
    "brand_gradient": "linear-gradient(135deg, #0d5926 0%, #168a3f 50%, #1db954 100%)",
    "brand_label": "Spotify",
    "icon": "assets/official_icons/spotify.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان كامل طوال المدة",
    "warranty_policy": "ضمان استبدال معتمد طوال الشهر.",
    "duration": "شهر كامل (30 يوم)",
    "stock": 50,
    "sold": 340,
    "in_stock": True,
    "prices": { "usd": 2.2, "sar": 8.4, "yer_sanaa": 1179, "yer_aden": 4400 },
    "card_desc": "استماع غير محدود للموسيقى والبودكاست بدون إعلانات، بجودة صوتية نقية فائقة، مع إمكانية التنزيل والاستماع أوفلاين وتخطي لا محدود.",
    "modal_data": {
      "raw_description_ar": "الاشتراك الصوتي الأول عالمياً للاستماع لكافة المقاطع الصوتية والبودكاست بدون أي فواصل إعلانية وبأعلى جودة صوتية.",
      "features": [
        "استماع نقي بدون أي إعلانات تجارية مزعجة نهائياً",
        "تخطي الأغاني والمقاطع الصوتية بشكل غير محدود Unlimited Skips",
        "تنزيل الألبومات والبودكاست للاستماع بدون اتصال بالإنترنت",
        "أعلى جودة صوتية Very High Quality (320kbps) تفاعلية"
      ],
      "where_to_use": ["تطبيق Spotify على الهواتف والشاشات والسيارات وسماعات البلوتوث"],
      "how_to_use": ["تشغيل قوائم التشغيل المفضلة والبودكاست يومياً"],
      "activation_methods": "ترقية حسابك الشخصي رسمياً أو حساب جاهز.",
      "step_by_step_activation": [
        "أرسل بريد حسابك أو استلم الحساب الجاهز المفعل.",
        "سجل دخولك واستمتع بالموسيقى والبودكاست بلا حدود."
      ],
      "account_type": "حساب بريميوم رسمي",
      "delivery_format": "تسليم فوري عبر واتساب.",
      "support_info": "دعم فني عبر واتساب 782611415."
    }
  },
  {
    "id": "prod_discord_nitro",
    "raw_name": "Discord Nitro Full Boost Plan 1 Month",
    "title": "اشتراك ديسكورد نيترو (Discord Nitro) - شهر كامل",
    "service_key": "discord",
    "service_name": "ديسكورد (Discord)",
    "category": "entertainment",
    "brand_color": "#5865F2",
    "brand_gradient": "linear-gradient(135deg, #2b327b 0%, #4752c4 50%, #5865f2 100%)",
    "brand_label": "Discord Nitro",
    "icon": "assets/official_icons/discord.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان كامل طوال المدة",
    "warranty_policy": "ضمان رسمي معتمد.",
    "duration": "شهر كامل (30 يوم)",
    "stock": 35,
    "sold": 110,
    "in_stock": True,
    "prices": { "usd": 5.5, "sar": 21.0, "yer_sanaa": 2948, "yer_aden": 11000 },
    "card_desc": "باقة نيترو الكاملة مع 2 سيرفر بوست، وبث ألعاب بدقة 4K 60fps، ورفع ملفات بحجم 500MB، واستخدام الرموز التعبيرية في أي مكان.",
    "modal_data": {
      "raw_description_ar": "الاشتراك الأفضل لمحبي الألعاب ومجتمعات التقنية على ديسكورد مع فتح كافة ميزات التخصيص والمظهر والبث.",
      "features": [
        "2 ترقيات مجانية للسيرفرات (2 Server Boosts) شهرياً مع خصم 30% للبقية",
        "مشاركة شاشة وبث بدقة فائقة HD 4K بمعدل 60 إطار في الثانية",
        "رفع ملفات ومستندات وفيديوهات ضخمة حتى 500 ميجابايت",
        "تخصيص كامل للملف الشخصي: صور متحركة GIF وبانر مخصص وشارات نادرة"
      ],
      "where_to_use": ["تطبيق Discord على الكمبيوتر والهاتف والمتصفح"],
      "how_to_use": ["تفعيل الرابط في حسابك أو استلام كود الهدية الرسمي"],
      "activation_methods": "رابط تفعيل رسمي مباشر (Gift Link) لحسابك الشخصي.",
      "step_by_step_activation": [
        "استلم رابط هدية ديسكورد نيترو عبر واتساب.",
        "افتح الرابط وأنت مسجل في حسابك واضغط قبول Accept Gift.",
        "سيتم تفعيل نيترو في حسابك فوراً بكل مميزاته."
      ],
      "account_type": "رابط تفعيل رسمي",
      "delivery_format": "تسليم فوري عبر واتساب.",
      "support_info": "دعم فني عبر واتساب 782611415."
    }
  },

  # ── الإنتاجية والتعليم (Productivity & Learning) ──
  {
    "id": "prod_telegram_premium",
    "raw_name": "Telegram Premium Official 3 Months",
    "title": "اشتراك تيليجرام بريميوم رسمي (Telegram Premium) - 3 أشهر",
    "service_key": "telegram",
    "service_name": "تيليجرام (Telegram)",
    "category": "productivity",
    "brand_color": "#229ED9",
    "brand_gradient": "linear-gradient(135deg, #0f5478 0%, #1773a4 50%, #229ed9 100%)",
    "brand_label": "Telegram Premium",
    "icon": "assets/official_icons/telegram.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان كامل طوال مدة الاشتراك (3 أشهر)",
    "warranty_policy": "ضمان رسمي كامل موثق على يوزر حسابك بدون الحاجة لكلمة المرور.",
    "duration": "3 أشهر (90 يوم)",
    "stock": 55,
    "sold": 260,
    "in_stock": True,
    "prices": { "usd": 9.0, "sar": 34.5, "yer_sanaa": 4824, "yer_aden": 18000 },
    "card_desc": "تفعيل رسمي على يوزر حسابك: شارة النجمة المضيئة، رفع ملفات حتى 4GB، تحويل الرسائل الصوتية لنصوص، وسرعة تنزيل مضاعفة.",
    "modal_data": {
      "raw_description_ar": "الترقية الرسمية المرموقة لتطبيق تيليجرام تمنحك شارة النجمة الزرقاء المضيئة بجانب اسمك، ومضاعفة كافة حدود التطبيق وإلغاء أي إعلانات بالقنوات.",
      "features": [
        "شارة النجمة المميزة بجانب اسمك في المحادثات والقنوات",
        "رفع ومشاركة ملفات عملاقة تصل إلى 4 جيجابايت للملف الواحد",
        "تحويل التسجيلات الصوتية ومقاطع الفيديو إلى نصوص مكتوبة فوراً",
        "سرعة تنزيل فائقة غير محدودة للوسائط والملفات والأفلام",
        "مضاعفة عدد القنوات والمجلدات والمحادثات المثبتة مرتين"
      ],
      "where_to_use": ["تطبيق Telegram على الهواتف وأجهزة الكمبيوتر والمتصفح"],
      "how_to_use": ["إرسال اسم المستخدم الخاص بك (Username) فقط لنرسل لك التفعيل كهدية رسمية"],
      "activation_methods": "إهداء رسمي مباشر عبر منصة Fragment التابعة لتيليجرام إلى اسم مستخدم حسابك (بدون طلب رقم الهاتف أو كلمة السر إطلاقاً).",
      "step_by_step_activation": [
        "أرسل اسم المستخدم الخاص بك في تيليجرام (@username).",
        "نرسل لك اشتراك الترقية الرسمية كهدية مباشرة.",
        "ستصلك رسالة تهنئة من تيليجرام وتتحول شارة حسابك إلى Premium فوراً."
      ],
      "account_type": "تفعيل رسمي على حسابك الشخصي",
      "delivery_format": "تسليم فوري ومباشر على يوزرك.",
      "support_info": "دعم فني عبر واتساب 782611415."
    }
  },
  {
    "id": "prod_notion_ai",
    "raw_name": "Notion Plus & Notion AI 1 Year",
    "title": "اشتراك نوشن الذكي للإنتاجية (Notion AI Pro) - سنة كاملة",
    "service_key": "notion",
    "service_name": "نوشن (Notion)",
    "category": "productivity",
    "brand_color": "#000000",
    "brand_gradient": "linear-gradient(135deg, #18181b 0%, #27272a 50%, #3f3f46 100%)",
    "brand_label": "Notion AI",
    "icon": "assets/official_icons/notion.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان سنة كاملة",
    "warranty_policy": "ضمان استبدال معتمد طوال السنة.",
    "duration": "سنة كاملة (12 شهر)",
    "stock": 30,
    "sold": 115,
    "in_stock": True,
    "prices": { "usd": 8.0, "sar": 30.7, "yer_sanaa": 4288, "yer_aden": 16000 },
    "card_desc": "منصة إدارة المشاريع وتنظيم الحياة والأعمال الأولى عالمياً مع المساعد الذكي لكتابة الملاحظات وتلخيص الجداول والمشاريع.",
    "modal_data": {
      "raw_description_ar": "الأداة الشاملة للطلاب والشركات لإدارة قواعد البيانات والمهام اليومية وتوثيق المشاريع بالذكاء الاصطناعي التوليدي.",
      "features": [
        "وصول كامل للذكاء الاصطناعي المدمج Notion AI لتلخيص وكتابة النصوص",
        "مساحة تخزين غير محدودة لرفع الملفات والمرفقات",
        "تاريخ تعديل الصفحات غير محدود واستعادة الإصدارات السابقة",
        "دعوة حتى 100 ضيف للمشاركة والتعاون على صفحات محددة"
      ],
      "where_to_use": ["المتصفح وتطبيقات سطح المكتب لنظامي Windows و Mac وتطبيقات الهواتف"],
      "how_to_use": ["بناء مساحات العمل ولوحات كانبان وقواعد البيانات وجداول المذاكرة"],
      "activation_methods": "حساب رسمي مفعّل بالكامل أو ترقية مساحة عملك.",
      "step_by_step_activation": [
        "سجل دخولك بالبيانات المسلمة لك.",
        "ابدأ ببناء قوالبك واستخدم الذكاء الاصطناعي لكتابة المحتوى فوراً."
      ],
      "account_type": "حساب برو مفعل",
      "delivery_format": "تسليم فوري عبر واتساب.",
      "support_info": "دعم فني عبر واتساب 782611415."
    }
  },
  {
    "id": "prod_duolingo_super",
    "raw_name": "Duolingo Super Family Plan 1 Year",
    "title": "اشتراك دوولينجو لتعلم اللغات (Duolingo Super) - سنة كاملة",
    "service_key": "duolingo",
    "service_name": "دوولينجو (Duolingo)",
    "category": "productivity",
    "brand_color": "#58CC02",
    "brand_gradient": "linear-gradient(135deg, #2d6a01 0%, #3f9502 50%, #58cc02 100%)",
    "brand_label": "Duolingo Super",
    "icon": "assets/official_icons/duolingo.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان سنة كاملة (12 شهر)",
    "warranty_policy": "ضمان رسمي معتمد طوال السنة.",
    "duration": "سنة كاملة (12 شهر)",
    "stock": 40,
    "sold": 230,
    "in_stock": True,
    "prices": { "usd": 4.5, "sar": 17.2, "yer_sanaa": 2412, "yer_aden": 9000 },
    "card_desc": "تعلم الإنجليزية واللغات بدون إعلانات، مع قلوب غير محدودة لعدم التوقف عند الخطأ، واختبارات تخطي المستويات بدون قيود.",
    "modal_data": {
      "raw_description_ar": "التطبيق الأكثر متعة وفعالية لتعلم اللغات الأجنبية بالكامل مع ميزات Super الحصرية لتسريع التعلم وإتقان المحادثة.",
      "features": [
        "قلوب وطاقة غير محدودة Unlimited Hearts للاستمرار في التعلم دون انتظار",
        "إلغاء كافة الإعلانات الترويجية لتوفير بيئة تعليمية هادئة وسريعة",
        "مراجعة الأخطاء وتدريبات مخصصة لتثبيت القواعد والمفردات الصعبة",
        "اختبارات قياس المستوى وتجاوز الدروس السهلة مجاناً"
      ],
      "where_to_use": ["تطبيق Duolingo على أجهزة iPhone و Android والمتصفح"],
      "how_to_use": ["الممارسة اليومية للدروس التفاعلية والاستماع للمحادثات"],
      "activation_methods": "إضافة رسمية على بريد حسابك الشخصي بدون الحاجة لكلمة المرور.",
      "step_by_step_activation": [
        "أرسل بريدك الإلكتروني المسجل في دوولينجو.",
        "ستصلك دعوة رسمية للانضمام إلى خطة Super العائلية.",
        "اقبل الدعوة واستمتع بقلوب غير محدودة وبدون إعلانات لمدة سنة كاملة."
      ],
      "account_type": "تفعيل رسمي على حسابك الشخصي",
      "delivery_format": "تسليم فوري عبر واتساب والبريد.",
      "support_info": "دعم فني عبر واتساب 782611415."
    }
  },
  {
    "id": "prod_tradingview_premium",
    "raw_name": "TradingView Premium Plan 1 Month",
    "title": "اشتراك تريدنج فيو لتحليل الأسواق (TradingView Premium)",
    "service_key": "tradingview",
    "service_name": "تريدنج فيو (TradingView)",
    "category": "productivity",
    "brand_color": "#2962FF",
    "brand_gradient": "linear-gradient(135deg, #1034a6 0%, #1e4bd8 50%, #2962ff 100%)",
    "brand_label": "TradingView",
    "icon": "assets/official_icons/tradingview.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان كامل طوال المدة",
    "warranty_policy": "ضمان استبدال معتمد طوال الشهر.",
    "duration": "شهر كامل (30 يوم)",
    "stock": 25,
    "sold": 85,
    "in_stock": True,
    "prices": { "usd": 9.5, "sar": 36.4, "yer_sanaa": 5092, "yer_aden": 19000 },
    "card_desc": "المنصة الأولى لمتداولي العملات الرقمية والأسهم والفوركس مع 25 مؤشر في الرسم البياني الواحد، و8 رسوم بيانية في شاشة واحدة.",
    "modal_data": {
      "raw_description_ar": "الاشتراك الاحترافي الأقوى للمتداولين والمحللين الماليين لتحليل حركة الأسواق المالية العالمية بدقة متناهية.",
      "features": [
        "إمكانية فتح حتى 8 شاشات ورسوم بيانية في نافذة واحدة متزامنة",
        "إضافة حتى 25 مؤشراً فنياً لكل شاشة تحليلية",
        "تنبيهات فورية غير محدودة عبر الرسائل القصيرة والبريد والتطبيق",
        "بيانات وفواصل زمنية ثانية فائقة الدقة لتحليل حركة السيولة"
      ],
      "where_to_use": ["موقع tradingview.com وتطبيقات الكمبيوتر والهواتف"],
      "how_to_use": ["التحليل الفني للعملات الرقمية والذهب والعملات الأجنبية"],
      "activation_methods": "حساب بريميوم رسمي جاهز للاستخدام الفوري.",
      "step_by_step_activation": [
        "سجل دخولك في تريدنج فيو بالبيانات المسلمة.",
        "افتح الشارت واستمتع بكافة مؤشرات باقة Premium فوراً."
      ],
      "account_type": "حساب بريميوم رسمي",
      "delivery_format": "تسليم فوري عبر واتساب.",
      "support_info": "دعم فني عبر واتساب 782611415."
    }
  },

  # ── أنظمة التشغيل ومايكروسوفت (Windows & Microsoft) ──
  {
    "id": "prod_win11_pro",
    "raw_name": "Windows 11 Pro OEM/Retail Original License Key",
    "title": "مفتاح تنشيط ويندوز 11 برو أصلي (Windows 11 Pro) - مدى الحياة",
    "service_key": "microsoft",
    "service_name": "مايكروسوفت ويندوز (Windows)",
    "category": "microsoft",
    "brand_color": "#0078D4",
    "brand_gradient": "linear-gradient(135deg, #003e73 0%, #005a9e 50%, #0078d4 100%)",
    "brand_label": "Windows 11",
    "icon": "assets/official_icons/windows.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان مدى الحياة وتنشيط رسمي دائم",
    "warranty_policy": "ضمان تنشيط رقمي رسمي دائم يرتبط باللوحة الأم لجهازك مدى الحياة.",
    "duration": "مدى الحياة (تنشيط دائم)",
    "stock": 100,
    "sold": 680,
    "in_stock": True,
    "prices": { "usd": 3.0, "sar": 11.5, "yer_sanaa": 1608, "yer_aden": 6000 },
    "card_desc": "مفتاح رقمي أصلي 100% لتنشيط Windows 11 Pro مدى الحياة مع استلام كافة التحديثات الأمنية الرسمية من سيرفرات مايكروسوفت مباشرة.",
    "modal_data": {
      "raw_description_ar": "تخلص من علامة التنشيط المائية المزعجة واحصل على ترقية رسمية كاملة لنظام التشغيل ويندوز 11 برو لتفعيل كافة ميزات الأمان والأداء العالي.",
      "features": [
        "تنشيط رقمي أصلي مدى الحياة لجهاز كمبيوتر واحد (يرتبط بالعتاد Hardware)",
        "يدعم التحديثات الأمنية الرسمية المباشرة من شركة Microsoft دون أي مشاكل",
        "يدعم اللغتين العربية والإنجليزية وكافة اللغات العالمية بنقرة واحدة",
        "تفعيل تشفير الأقراص المتقدم BitLocker وميزات الأمان الافتراضية Hyper-V"
      ],
      "where_to_use": ["أجهزة الكمبيوتر المكتبية (PC) واللابتوب بمختلف الأنواع"],
      "how_to_use": ["إدخال المفتاح الرقمي المكون من 25 حرفاً في إعدادات النظام لتنشيط ويندوز فوراً"],
      "activation_methods": "مفتاح ترخيص رقمي أصلي (Retail / OEM Key) مكون من 25 رمزاً.",
      "step_by_step_activation": [
        "افتح الإعدادات (Settings) في جهازك ثم اختر (System) ثم (Activation).",
        "اضغط على تغيير مفتاح المنتج (Change product key).",
        "أدخل الكود المكون من 25 رمزاً واضغط تنشيط (Activate).",
        "سيظهر لك فوراً: (Windows is activated with a digital license)."
      ],
      "account_type": "مفتاح تنشيط رقمي أصلي",
      "delivery_format": "تسليم فوري ومباشر عبر واتساب فور تأكيد الدفع.",
      "support_info": "دعم فني خطوة بخطوة حتى تمام التنشيط عبر واتساب 782611415."
    }
  },
  {
    "id": "prod_win10_pro",
    "raw_name": "Windows 10 Pro OEM/Retail Original License Key",
    "title": "مفتاح تنشيط ويندوز 10 برو أصلي (Windows 10 Pro) - مدى الحياة",
    "service_key": "microsoft",
    "service_name": "مايكروسوفت ويندوز (Windows)",
    "category": "microsoft",
    "brand_color": "#0078D4",
    "brand_gradient": "linear-gradient(135deg, #002b54 0%, #004b87 50%, #0078d4 100%)",
    "brand_label": "Windows 10",
    "icon": "assets/official_icons/windows.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان مدى الحياة وتنشيط رسمي دائم",
    "warranty_policy": "ضمان تنشيط أصلي معتمد مدى الحياة.",
    "duration": "مدى الحياة (تنشيط دائم)",
    "stock": 80,
    "sold": 540,
    "in_stock": True,
    "prices": { "usd": 2.8, "sar": 10.7, "yer_sanaa": 1500, "yer_aden": 5600 },
    "card_desc": "تنشيط أصلي دائم لنظام ويندوز 10 برو يدعم النواتين 32 و 64 بت مع دعم كامل للتحديثات وحماية أمنية متكاملة مدى الحياة.",
    "modal_data": {
      "raw_description_ar": "المفتاح الرقمي المعتمد لتفعيل نظام Windows 10 Pro لجهازك بشكل دائم وقانوني 100% للتخلص من مشاكل التوقف والتهنيج.",
      "features": [
        "تنشيط أصلي مدى الحياة لجهاز كمبيوتر أو لابتوب واحد",
        "استلام التحديثات الأمنية وإصلاحات الاستقرار من مايكروسوفت مباشرة",
        "دعم كامل للنواة 32-bit و 64-bit باللغة العربية والإنجليزية",
        "تفعيل كامل لصلاحيات سطح المكتب البعيد Remote Desktop وتشفير BitLocker"
      ],
      "where_to_use": ["كافة أجهزة الكمبيوتر المكتبية واللابتوب بنظام Windows 10"],
      "how_to_use": ["إدخال الكود في قائمة التنشيط Activation Settings"],
      "activation_methods": "مفتاح تنشيط رقمي مكوّن من 25 رمزاً.",
      "step_by_step_activation": [
        "ادخل على الإعدادات ثم التحديث والأمان ثم التنشيط.",
        "اختر تغيير مفتاح المنتج وألصق المفتاح المرسل لك واضغط تنشيط."
      ],
      "account_type": "مفتاح ترخيص رقمي أصلي",
      "delivery_format": "تسليم فوري عبر واتساب.",
      "support_info": "دعم فني عبر واتساب 782611415."
    }
  },
  {
    "id": "prod_office_365",
    "raw_name": "Microsoft 365 Pro Enterprise 5 Devices 1TB OneDrive 1 Year",
    "title": "اشتراك مايكروسوفت 365 وسعة 1TB (Office 365) - سنة كاملة",
    "service_key": "microsoft",
    "service_name": "مايكروسوفت أوفيس (Office 365)",
    "category": "microsoft",
    "brand_color": "#D83B01",
    "brand_gradient": "linear-gradient(135deg, #7c1c00 0%, #aa2b01 50%, #d83b01 100%)",
    "brand_label": "Office 365",
    "icon": "assets/official_icons/microsoft.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان سنة كاملة (12 شهر)",
    "warranty_policy": "ضمان رسمي معتمد طوال فترة الاشتراك.",
    "duration": "سنة كاملة (12 شهر)",
    "stock": 45,
    "sold": 410,
    "in_stock": True,
    "prices": { "usd": 5.0, "sar": 19.2, "yer_sanaa": 2680, "yer_aden": 10000 },
    "card_desc": "تثبيت رسمي لبرامج Word و Excel و PowerPoint على 5 أجهزة مختلفة (كمبيوتر، ماك، آيباد، جوال) مع مساحة سحابية 1000 جيجابايت 1TB OneDrive.",
    "modal_data": {
      "raw_description_ar": "الحزمة المكتبية الأهم للطلاب والباحثين والموظفين، تتضمن أحدث إصدارات برامج الأوفيس مع مساحة سحابية ضخمة 1 تيرابايت لحفظ ملفاتك وصورك بأمان فائق.",
      "features": [
        "تثبيت رسمي لبرامج Office الأصلية على 5 أجهزة لنفس المستخدم (PC, Mac, Tablet, Phone)",
        "مساحة تخزين سحابية خاصة بك 1000GB (1TB) على OneDrive مع ميزة المزامنة التلقائية",
        "أحدث إصدارات وورد وإكسل وبوربوينت مع تحديثات الميزات الجديدة شهرياً",
        "دعم كامل لقوالب العمل الاحترافية والتدقيق الإملائي باللغة العربية"
      ],
      "where_to_use": ["أجهزة الكمبيوتر (Windows & Mac) والأجهزة اللوحية والهواتف الذكية"],
      "how_to_use": ["تسجيل الدخول في موقع portal.office.com وتحميل الحزمة وتثبيتها"],
      "activation_methods": "حساب مايكروسوفت رسمي خاص بك مع كلمة سر أولية تقوم بتغييرها بنفسك.",
      "step_by_step_activation": [
        "ادخل على الرابط الرسمي portal.office.com.",
        "سجل الدخول بالبريد الإلكتروني وكلمة المرور المسلمة لك.",
        "قم بتعيين كلمة سر جديدة خاصة بك فور الدخول الأول.",
        "اضغط على زر (Install Apps) لتحميل حزمة البرامج وتثبيتها على جهازك مباشرة."
      ],
      "account_type": "حساب مايكروسوفت رسمي خاص",
      "delivery_format": "تسليم فوري ومباشر عبر واتساب فور تأكيد الدفع.",
      "support_info": "دعم فني وتثبيت عبر واتساب 782611415."
    }
  },

  # ── الحماية والشبكات والأمان الرقمي (VPN & Security) ──
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
    "warranty_policy": "ضمان استبدال رسمي معتمد طوال السنة.",
    "duration": "سنة كاملة (12 شهر)",
    "stock": 30,
    "sold": 160,
    "in_stock": True,
    "prices": { "usd": 11.0, "sar": 42.1, "yer_sanaa": 5896, "yer_aden": 22000 },
    "card_desc": "تصفح آمن ومحمي 100%، وتشفير عسكري لبياناتك، وفتح كافة المواقع والخدمات المحجوبة بأكثر من 6000 سيرفر عالمي فائق السرعة.",
    "modal_data": {
      "raw_description_ar": "الخدمة الأقوى عالمياً في حماية الخصوصية وتأمين الاتصال، تدعم تشغيل الألعاب والبث بجودة 4K دون أي بطء أو انقطاع.",
      "features": [
        "تشفير عسكري متقدم وحماية من التتبع والمواقع الضارة وباب الثغرات",
        "سيرفرات فائقة السرعة تدعم بروتوكول NordLynx الثوري للألعاب والبث",
        "يعمل على أنظمة Windows و Mac و iOS و Android والشاشات وأجهزة الراوتر",
        "ميزة حماية التهديدات المدمجة Threat Protection لحظر الإعلانات والبرمجيات الخبيثة"
      ],
      "where_to_use": ["تطبيق NordVPN الرسمي على كافة أجهزتك الذكية"],
      "how_to_use": ["اختيار الدولة المراد الاتصال بها والضغط على Connect بنقرة زر واحدة"],
      "activation_methods": "حساب بريميوم رسمي مفعل جاهز للتسليم الفوري.",
      "step_by_step_activation": [
        "حمل تطبيق NordVPN الرسمي على جهازك.",
        "سجل الدخول بالبريد الإلكتروني وكلمة المرور المسلمة لك.",
        "اختر الدولة واضغط اتصال (Quick Connect) واستمتع بحرية التصفح بأمان."
      ],
      "account_type": "حساب بريميوم مفعل",
      "delivery_format": "تسليم فوري عبر واتساب.",
      "support_info": "دعم فني عبر واتساب 782611415."
    }
  },
  {
    "id": "prod_expressvpn",
    "raw_name": "ExpressVPN Ultra Fast 1 Year",
    "title": "اشتراك إكسبريس في بي إن (ExpressVPN) - سنة كاملة",
    "service_key": "security",
    "service_name": "إكسبريس في بي إن (ExpressVPN)",
    "category": "security",
    "brand_color": "#DA291C",
    "brand_gradient": "linear-gradient(135deg, #7c140d 0%, #b21e14 50%, #da291c 100%)",
    "brand_label": "ExpressVPN",
    "icon": "assets/official_icons/expressvpn.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان سنة كاملة",
    "warranty_policy": "ضمان استبدال معتمد طوال المدة.",
    "duration": "سنة كاملة (12 شهر)",
    "stock": 25,
    "sold": 140,
    "in_stock": True,
    "prices": { "usd": 12.0, "sar": 45.9, "yer_sanaa": 6432, "yer_aden": 24000 },
    "card_desc": "سيرفرات فائقة السرعة في 105 دولة، تشفير متقدم 256-bit، وبروتوكول Lightway الحصري لتجاوز الحجب الصارم في أصعب البيئات.",
    "modal_data": {
      "raw_description_ar": "الخيار الأول لمن يبحث عن أقصى سرعة وثبات في الاتصال وفتح المنصات والبثوث العالمية بدون أي تقطيع.",
      "features": [
        "سيرفرات منتشرة في أكثر من 105 دول حول العالم",
        "بروتوكول Lightway الحصري فائق السرعة والأمان وخفة الوزن",
        "سياسة صارمة لمنع تسجيل السجلات والأنشطة (No-Logs Policy)",
        "سهولة الاستخدام بنقرة زر واحدة وتوافق مع كافة الأنظمة"
      ],
      "where_to_use": ["الهواتف والكمبيوتر والشاشات الذكية"],
      "how_to_use": ["إدخال كود التنشيط Activation Code في التطبيق"],
      "activation_methods": "كود تنشيط رسمي أصلي أو حساب مفعل جاهز.",
      "step_by_step_activation": [
        "حمل تطبيق ExpressVPN على جهازك.",
        "ألصق كود التنشيط المسلم لك في خانة Activation Code.",
        "اتصل فوراً بأي دولة في العالم بسرعات قياسية."
      ],
      "account_type": "اشتراك بريميوم مفعل",
      "delivery_format": "تسليم فوري عبر واتساب.",
      "support_info": "دعم فني عبر واتساب 782611415."
    }
  },
  {
    "id": "prod_protonvpn",
    "raw_name": "ProtonVPN Plus Swiss Privacy 1 Year",
    "title": "اشتراك بروتون في بي إن السويسري (ProtonVPN Plus)",
    "service_key": "security",
    "service_name": "بروتون في بي إن (ProtonVPN)",
    "category": "security",
    "brand_color": "#6D4AFF",
    "brand_gradient": "linear-gradient(135deg, #371b8f 0%, #522ec4 50%, #6d4aff 100%)",
    "brand_label": "ProtonVPN",
    "icon": "assets/official_icons/protonvpn.svg",
    "is_guaranteed": True,
    "warranty_text": "ضمان سنة كاملة",
    "warranty_policy": "ضمان استبدال معتمد.",
    "duration": "سنة كاملة (12 شهر)",
    "stock": 20,
    "sold": 95,
    "in_stock": True,
    "prices": { "usd": 10.0, "sar": 38.3, "yer_sanaa": 5360, "yer_aden": 20000 },
    "card_desc": "أعلى معايير الخصوصية المشفرة تحت حماية القوانين السويسرية الصارمة مع ميزة التوجيه الآمن Secure Core وسرعات 10Gbps.",
    "modal_data": {
      "raw_description_ar": "الشبكة السويسرية الآمنة المصممة خصيصاً للمدافعين عن الخصوصية والمستخدمين الذين يطلبون أقصى درجات السرية والتشفير.",
      "features": [
        "خوادم مشفرة تحت الأرض في سويسرا بنظام التوجيه المزدوج Secure Core",
        "سرعات فائقة تصل إلى 10Gbps مع ميزة VPN Accelerator",
        "حماية NetShield المتقدمة لمنع الإعلانات وبرمجيات التجسس",
        "تشفير AES-256 مدعوم بالقوانين السويسرية الأكثر صرامة في العالم"
      ],
      "where_to_use": ["كافة أنظمة التشغيل Windows و Mac و Linux و iOS و Android"],
      "how_to_use": ["تسجيل الدخول والاتصال بالخادم السويسري أو أي خادم عالمي"],
      "activation_methods": "حساب رسمي مفعل باشتراك Plus.",
      "step_by_step_activation": [
        "سجل دخولك في تطبيق ProtonVPN بالبيانات المسلمة.",
        "اختر Secure Core أو أي دولة واتصل بأمان مطلق."
      ],
      "account_type": "حساب بريميوم رسمي",
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
    "warranty_policy": "ضمان أصلي معتمد من سيرفرات كاسبرسكي الرسمية طوال السنة.",
    "duration": "سنة كاملة (12 شهر)",
    "stock": 35,
    "sold": 140,
    "in_stock": True,
    "prices": { "usd": 7.0, "sar": 26.8, "yer_sanaa": 3752, "yer_aden": 14000 },
    "card_desc": "درع الحماية الشامل ضد الفيروسات وبرامج الفدية والتجسس وحماية المعاملات البنكية ومكافحة الاختراق مع فحص دائم وفوري.",
    "modal_data": {
      "raw_description_ar": "البرنامج الأفضل عالمياً لحماية الكمبيوتر والهاتف من كافة التهديدات الرقمية والاختراقات الخبيثة وتأمين بيانات البطاقات والمدفوعات الإلكترونية.",
      "features": [
        "مكافحة فيروسات فورية وشاملة تفحص الملفات والروابط المشبوهة في أجزاء من الثانية",
        "حماية المعاملات والمدفوعات الإلكترونية ومواقع البنوك عبر متصفح Safe Money المشفر",
        "أداة متقدمة لتنظيف وتسريع الجهاز وحذف الملفات المؤقتة وبقايا البرامج",
        "جدار ناري ذكي ومكافحة برامج الفدية المشفرة وتأمين كاميرا الويب من التجسس"
      ],
      "where_to_use": ["الكمبيوتر المكتبي PC واللابتوب والهواتف الذكية"],
      "how_to_use": ["إدخال كود التفعيل الرقمي المكون من 20 رمزاً في برنامج كاسبرسكي"],
      "activation_methods": "كود تفعيل رقمي أصلي (Retail Key) يرتبط بحسابك في My Kaspersky.",
      "step_by_step_activation": [
        "حمل برنامج كاسبرسكي الرسمي من الموقع الرسمي my.kaspersky.com.",
        "افتح البرنامج واضغط على خانة إدخال رمز التنشيط (Enter activation code).",
        "ألصق الكود المكون من 20 رمزاً واضغط تفعيل (Activate).",
        "سيظهر لك التنشيط بنجاح مع ظهور مدة 365 يوماً حماية كاملة."
      ],
      "account_type": "مفتاح ترخيص رقمي رسمي",
      "delivery_format": "تسليم فوري ومباشر عبر واتساب فور تأكيد الدفع.",
      "support_info": "دعم فني وإرشادات تثبيت عبر واتساب 782611415."
    }
  }
]

def main():
    print(f"Total curated boutique products: {len(PRODUCTS)}")
    
    # Save to products.json
    with open('assets/data/products.json', 'w', encoding='utf-8') as f:
        json.dump(PRODUCTS, f, ensure_ascii=False, indent=2)

    # Save to products.js
    with open('assets/data/products.js', 'w', encoding='utf-8') as f:
        f.write("window.PRODUCTS_CATALOG = ")
        json.dump(PRODUCTS, f, ensure_ascii=False, indent=2)
        f.write(";\n")

    print(f"Successfully generated {len(PRODUCTS)} curated elite products in products.json and products.js!")

if __name__ == '__main__':
    main()
