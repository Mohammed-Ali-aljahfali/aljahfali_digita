import json
import re

def clean_text(t):
    if not t:
        return ""
    # strip emojis
    t = re.sub(r'[\U00010000-\U0010ffff\u2600-\u27bf\u2300-\u23ff\u2b50\u2b55\u200d\ufe0f]', '', t)
    return t.strip()

def translate_description(raw_name, raw_desc):
    raw_desc = clean_text(raw_desc)
    name_lower = raw_name.lower()
    
    # Analyze product subtype
    if 'pro' in name_lower:
        subtype = 'pro'
    elif 'team' in name_lower or 'business' in name_lower or 'slot' in name_lower:
        subtype = 'business'
    elif 'edu' in name_lower or 'k12' in name_lower or 'student' in name_lower:
        subtype = 'edu'
    elif 'go' in name_lower:
        subtype = 'go'
    elif 'api' in name_lower or 'codex' in name_lower or 'otp' in name_lower or 'key' in name_lower:
        subtype = 'api'
    elif 'upgrade' in name_lower or 'up ' in name_lower:
        subtype = 'upgrade'
    else:
        subtype = 'plus'

    # Build professional Arabic translation based on raw_desc and subtype
    lines = []
    for line in raw_desc.split('\n'):
        line = line.strip()
        if not line:
            continue
        line_l = line.lower()
        if 'format:' in line_l:
            lines.append("صيغة تسليم الحساب: " + line.split(':', 1)[-1].strip())
        elif 'status:' in line_l:
            lines.append("حالة الحساب: " + line.split(':', 1)[-1].strip())
        elif 'pricing' in line_l:
            lines.append("الخطة السعرية والميزات الإضافية.")
        elif 'suitable for' in line_l:
            lines.append("الفئات المستهدفة: للمحترفين والمطورين والباحثين ومحبي الأداء الفائق.")
        elif 'unlimited' in line_l or 'access' in line_l:
            lines.append("وصول كامل ومفتوح لأحدث نماذج OpenAI المتطورة.")
        elif 'warranty' in line_l:
            lines.append("الضمان: مشمول بالضمان المعتمد واستبدال فوري عند وجود أي مشكلة.")
        elif 'login' in line_l or 'pass' in line_l:
            lines.append("تسجيل دخول مباشر وآمن مع إمكانية تعديل وتخصيص كلمة المرور.")
        elif 'note:' in line_l or 'read' in line_l:
            lines.append("ملاحظة هامة: يرجى اتباع إرشادات الاستخدام المرفقة لضمان استقرار الحساب.")
        else:
            # Clean translation of general text
            translated_line = line
            translated_line = translated_line.replace('ChatGPT Pro Package', 'باقة شات جي بي تي برو (ChatGPT Pro)')
            translated_line = translated_line.replace('ChatGPT Plus', 'اشتراك شات جي بي تي بلس (ChatGPT Plus)')
            translated_line = translated_line.replace('Account', 'الحساب')
            translated_line = translated_line.replace('account', 'الحساب')
            translated_line = translated_line.replace('Password', 'كلمة السر')
            translated_line = translated_line.replace('password', 'كلمة السر')
            translated_line = translated_line.replace('Email', 'البريد الإلكتروني')
            translated_line = translated_line.replace('email', 'البريد الإلكتروني')
            translated_line = translated_line.replace('warranty', 'ضمان')
            translated_line = translated_line.replace('Warranty', 'ضمان')
            translated_line = translated_line.replace('month', 'شهر')
            translated_line = translated_line.replace('Month', 'شهر')
            translated_line = translated_line.replace('days', 'أيام')
            translated_line = clean_text(translated_line)
            if len(translated_line) > 3:
                lines.append(translated_line)

    translated_desc = "\n".join(lines) if lines else "اشتراك رسمي في خدمة شات جي بي تي يتيح لك الاستفادة القصوى من كافة قدرات الذكاء الاصطناعي التوليدي مع تسليم فوري وضمان معتمد."

    # Subtype-specific enrichment
    if subtype == 'pro':
        features = [
            "وصول كامل وغير مقيد لأعلى وأقوى نماذج الاستدلال العميق GPT-5 و GPT-4o و o1 Pro Mode",
            "حدود استخدام فائقة السرعة تتجاوز باقة بلس العادية بأكثر من 20 ضعفاً",
            "إمكانية تشغيل أبحاث عميقة غير محدودة (Deep Research) ومعالجة مئات الصفحات من البيانات",
            "نافذة سياق ضخمة تصل إلى مليون توكن لمعالجة كتب وأكواد برمجية عملاقة دفعة واحدة",
            "توليد فيديوهات فائقة الواقعية عبر نموذج Sora وتوليد وتعديل الصور عبر DALL-E 3",
            "أولوية وصول مطلقة ومعالجة فورية للمهام الحسابية المعقدة دون انتظار"
        ]
        where_to_use = [
            "متصفح الويب عبر المنصة الرسمية chatgpt.com على جميع الأجهزة",
            "تطبيق ChatGPT الرسمي على أنظمة iOS و Android مع دعم المساعد الصوتي المتقدم",
            "تطبيق سطح المكتب لأجهزة Windows و macOS مع اختصارات لوحة المفاتيح المباشرة",
            "بيئات التطوير البرمجي ومساعدات الأكواد للمشاريع البرمجية الضخمة"
        ]
        how_to_use = [
            "طرح المسائل العلمية والرياضية والبرمجية المعقدة مع تفعيل نمط التفكير العميق (Reasoning)",
            "رفع وتحليل ملفات ومستندات ضخمة (PDF، قواعد بيانات Excel، مشاريع برمجية)",
            "إجراء محادثات صوتية طبيعية ومباشرة عبر الوضع الصوتي المتقدم Advanced Voice Mode",
            "بناء واستخدام روبوتات مخصصة (Custom GPTs) مؤتمتة لأداء مهام بحثية وبرمجية متكاملة"
        ]
        act_method = "حساب برو جاهز (البريد | كلمة المرور | كود التوثيق 2FA) مخصص لك بشكل مستقل، أو ترقية مباشرة."
        steps = [
            "استلم بيانات الحساب (البريد الإلكتروني وكلمة المرور وكود 2FA) فور إتمام الدفع.",
            "افتح الموقع الرسمي chatgpt.com أو تطبيق ChatGPT على جهازك.",
            "سجل الدخول باستخدام البريد وكلمة المرور المسلمة لك.",
            "أدخل كود التحقق الثنائي إذا طُلب منك لإكمال الدخول بنجاح.",
            "تأكد من ظهور شارة (ChatGPT Pro) أعلى الشاشة، وابدأ فوراً بالتمتع بكافة الميزات غير المحدودة.",
            "يُنصح بالدخول إلى الإعدادات وتحديث كلمة المرور والمصادقة الخاصة بك لضمان أمان حسابك."
        ]
    elif subtype == 'business':
        features = [
            "مساحة عمل احترافية مخصصة للفرق والشركات (ChatGPT Business / Team Workspace)",
            "حدود رسائل مرتفعة جداً لنماذج GPT-4o و GPT-4 و o1 تفوق الحسابات الفردية",
            "خصوصية وأمان تام: بياناتك ومحادثاتك لا تُستخدم مطلقاً في تدريب نماذج الذكاء الاصطناعي",
            "إمكانية إنشاء ومشاركة أدوات GPTs خاصة ومخصصة داخل فريق العمل فقط",
            "لوحة إدارة متطورة للتحكم في الصلاحيات والمشاريع المشتركة"
        ]
        where_to_use = [
            "متصفح الويب chatgpt.com مع إمكانية التبديل السلس بين مساحة العمل وحسابك الشخصي",
            "تطبيقات الهواتف الذكية (iOS و Android) وتطبيقات سطح المكتب (Mac و Windows)"
        ]
        how_to_use = [
            "التعاون الجماعي ومشاركة المحادثات والمستندات البرمجية والتحليلية مع أعضاء الفريق",
            "تحليل بيانات العمل والملفات المالية والمستندات الحساسة بأعلى معايير الخصوصية والأمان",
            "أتمتة المهام اليومية للشركة وبناء مساعدات ذكية لخدمة العملاء والبرمجة"
        ]
        act_method = "دعوة انضمام رسمية (Workspace Invite) تُرسل إلى بريدك الشخصي، أو فتح حساب مستقل جاهز."
        steps = [
            "استلم رابط دعوة الفريق المباشر عبر واتساب أو البريد بعد إتمام الشراء.",
            "افتح رابط الدعوة وسجل الدخول بحسابك في ChatGPT لقبول الانضمام.",
            "ستظهر لك مساحة العمل الجديدة فوراً باسم الفريق مع كامل الصلاحيات ومميزات Team.",
            "استمتع بحدود استخدام مضاعفة وخصوصية مطلقة لبياناتك ومشاريعك."
        ]
    elif subtype == 'upgrade':
        features = [
            "ترقية رسمية مباشرة 100% على حسابك الشخصي الحالي في ChatGPT",
            "الاحتفاظ بكافة محادثاتك السابقة وبياناتك وملفاتك وإعداداتك الخاصة",
            "تفعيل كامل ميزات Plus الرسمية مع نموذج GPT-4o وتوليد الصور DALL-E 3",
            "ضمان استمرار الحساب طوال مدة الاشتراك دون انقطاع"
        ]
        where_to_use = [
            "جميع أجهزتك المسجلة حالياً بنفس الحساب الشخصي (كمبيوتر، هاتف، تابلت)"
        ]
        how_to_use = [
            "مواصلة العمل المعتاد على حسابك مع الاستفادة الفورية من سرعة الاستجابة ورفع الملفات ومميزات بلس"
        ]
        act_method = "ترقية مباشرة عبر رابط دفع رسمي أو تفعيل مباشر من لوحة الإدارة لحسابك."
        steps = [
            "أرسل بريد حسابك الشخصي المسجل في ChatGPT (لا نطلب كلمة المرور في أغلب الترقيات).",
            "يتم إرسال رابط الترقية المباشر أو تفعيل الاشتراك على حسابك خلال دقائق.",
            "قم بتسجيل الخروج والدخول مجدداً أو تحديث الصفحة في chatgpt.com.",
            "ستجد شارة (ChatGPT Plus) مفعلة فوراً مع تاريخ التجديد المعتمد."
        ]
    elif subtype == 'api':
        features = [
            "رصيد ومفاتيح رسمية لواجهات برمجة تطبيقات OpenAI (API Keys / Codex)",
            "إمكانية ربط المفاتيح ببيئات البرمجة (VS Code, Cursor, Windsurf, LangChain)",
            "سرعة استجابة فائقة واستدعاء مباشر لنماذج GPT-4o و Embeddings و DALL-E",
            "جاهزية تامة للأتمتة وبناء البوتات والتطبيقات الذكية"
        ]
        where_to_use = [
            "أدوات ومحررات البرمجة (VS Code, Cursor, Claude Code, Terminal)",
            "تطبيقات وبوتات تيليجرام ومواقع الويب ومنصات الأتمتة مثل Make و Zapier"
        ]
        how_to_use = [
            "تضمين مفتاح API في ملف البيئة .env أو إعدادات الأداة البرمجية",
            "إرسال واستقبال الطلبات البرمجية وتنفيذ الأكواد وتحليل البيانات تلقائياً"
        ]
        act_method = "تسليم مفتاح الترخيص الرقمي (API Key) أو حساب كوديكس مفعل مع الرصيد المعتمد."
        steps = [
            "استلم مفتاح API الرقمي أو بيانات تسجيل الحساب المخصص.",
            "انسخ المفتاح وضعه في إعدادات المنصة أو الأداة البرمجية التي تستخدمها.",
            "ابدأ استدعاء النماذج البرمجية فوراً مع إمكانية متابعة استهلاك الرصيد."
        ]
    elif subtype == 'edu':
        features = [
            "اشتراك رسمي مخصص للطلاب والتعليم (ChatGPT Plus K12 Edu / Student Plan)",
            "مدة اشتراك طويلة تصل إلى عامين كاملين بتكلفة اقتصادية استثنائية",
            "دعم كامل لنماذج GPT-4o والتحليل المتقدم وحل المسائل الأكاديمية والبحثية",
            "حساب نظيف ومعتمد للاستخدام الأكاديمي واليومي"
        ]
        where_to_use = [
            "متصفحات الويب chatgpt.com وتطبيقات الهواتف الرسمية الذكية"
        ]
        how_to_use = [
            "كتابة وتدقيق الأبحاث والرسائل العلمية، حل المعادلات، وتلخيص الكتب والمراجع"
        ]
        act_method = "حساب تعليمي مفعل بالكامل ومخصص مع بريد إلكتروني وكلمة مرور جاهزة."
        steps = [
            "استلم بيانات الحساب التعليمي المسلم لك بعد الدفع.",
            "افتح موقع chatgpt.com وسجل الدخول بالبيانات.",
            "تأكد من تفعيل خطة التعليم والبلس وابدأ دراستك وأبحاثك فوراً."
        ]
    else: # standard plus
        features = [
            "وصول كامل وغير محدود لأحدث نماذج GPT-4o و GPT-4 و Canvas للبرمجة والكتابة",
            "توليد وتصميم وتعديل الصور بدقة واحترافية فائقة عبر DALL-E 3",
            "تحليل المستندات وجداول البيانات والأكواد البرمجية ورفع ملفات PDF و Excel",
            "الوضع الصوتي المتقدم Advanced Voice Mode للمحادثات الحية التفاعلية",
            "إنشاء واستخدام آلاف الروبوتات المخصصة Custom GPTs من متجر الأدوات",
            "أولوية وصول مطلقة وسرعة استجابة حتى في أوقات الذروة العالمية"
        ]
        where_to_use = [
            "متصفح الإنترنت chatgpt.com على أجهزة الكمبيوتر والمحمول",
            "تطبيق ChatGPT الرسمي على أنظمة الهواتف الذكية iOS (iPhone) و Android",
            "تطبيق سطح المكتب الرسمي لأنظمة Windows و macOS"
        ]
        how_to_use = [
            "إدخال الأوامر النصية المتقدمة لإنشاء المقالات والأبحاث وكتابة الأكواد",
            "رفع الصور لتحليل عناصرها واستخراج النصوص والبيانات منها بدقة",
            "المحادثة الصوتية المباشرة لتعلم اللغات أو الاستشارات السريعة",
            "تنفيذ وتحليل مشاريع برمجية متكاملة داخل بيئة Canvas التفاعلية"
        ]
        act_method = "حساب رسمي مفعل وجاهز للتسليم الفوري (بريد | كلمة سر | كود توثيق 2FA)، أو ترقية مباشرة لحسابك."
        steps = [
            "استلم بيانات الحساب (البريد الإلكتروني وكلمة المرور) فور إتمام الطلب.",
            "افتح متصفحك أو تطبيق ChatGPT الرسمي واضغط على تسجيل الدخول (Log In).",
            "أدخل البريد الإلكتروني وكلمة المرور المسلمة لك بدقة.",
            "في حال ظهور كود التحقق الثنائي، أدخل الرمز المرفق في بيانات التسليم.",
            "ستظهر لك فوراً شارة (ChatGPT Plus) مع كامل النماذج المتاحة.",
            "تستطيع تغيير كلمة المرور والاحتفاظ بالحساب كحساب شخصي دائم."
        ]

    return {
        "raw_description_ar": translated_desc,
        "features": features,
        "where_to_use": where_to_use,
        "how_to_use": how_to_use,
        "activation_methods": act_method,
        "step_by_step_activation": steps
    }

def main():
    with open('canboso_products.json', encoding='utf-8') as f:
        canboso = json.load(f)['products']
    canboso_map = {p['productId']: p for p in canboso}

    with open('assets/data/products.json', encoding='utf-8') as f:
        catalog = json.load(f)

    updated_chatgpt = 0
    for p in catalog:
        pid = p.get('id')
        raw_p = canboso_map.get(pid, {})
        raw_name = raw_p.get('name') or p.get('raw_name', '')
        raw_desc = raw_p.get('description', '')
        
        is_chatgpt = (p.get('service_key') == 'chatgpt' or 
                      'chatgpt' in p.get('service_name', '').lower() or 
                      'chatgpt' in raw_name.lower() or 
                      'openai' in raw_name.lower())
        
        if is_chatgpt:
            p['service_key'] = 'chatgpt'
            p['service_name'] = 'شات جي بي تي (ChatGPT & OpenAI)'
            p['brand_label'] = 'ChatGPT'
            p['icon'] = 'assets/official_icons/openai.svg'
            p['brand_gradient'] = 'linear-gradient(135deg, #053b2e 0%, #0c6b53 50%, #10a37f 100%)'
            
            enrichment = translate_description(raw_name, raw_desc)
            
            # Update modal_data with full translated details
            p['modal_data'] = {
                "raw_description_ar": enrichment['raw_description_ar'],
                "features": enrichment['features'],
                "where_to_use": enrichment['where_to_use'],
                "how_to_use": enrichment['how_to_use'],
                "activation_methods": enrichment['activation_methods'],
                "step_by_step_activation": enrichment['step_by_step_activation'],
                "account_type": enrichment['activation_methods'],
                "delivery_format": "تسليم فوري ومباشر لبيانات الحساب أو رابط التفعيل عبر واتساب فور تأكيد الدفع.",
                "support_info": "دعم فني مباشر على مدار الساعة عبر واتساب 782611415 (محمد الجحفلي) مع ضمان استبدال رسمي معتمد."
            }
            updated_chatgpt += 1

    print(f"Successfully enriched {updated_chatgpt} ChatGPT products!")

    # Save to products.json
    with open('assets/data/products.json', 'w', encoding='utf-8') as f:
        json.dump(catalog, f, ensure_ascii=False, indent=2)

    # Save to products.js
    with open('assets/data/products.js', 'w', encoding='utf-8') as f:
        f.write("window.PRODUCTS_CATALOG = ")
        json.dump(catalog, f, ensure_ascii=False, indent=2)
        f.write(";\n")

    print("Saved to assets/data/products.json and assets/data/products.js!")

if __name__ == '__main__':
    main()
