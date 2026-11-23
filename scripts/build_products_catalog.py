# -*- coding: utf-8 -*-
import json
import re
import os

def clean_text(t):
    if not t:
        return ""
    t = re.sub(r'[\r\n]+', ' ', t)
    t = re.sub(r'⚡️|⚡', '', t) # Remove any lightning symbols completely
    t = re.sub(r'\s+', ' ', t).strip()
    return t

def extract_duration(name, desc):
    combined = (name + " " + desc).lower()
    
    if re.search(r'lifetime|vĩnh viễn|مدى الحياة', combined):
        return "مدى الحياة"
    elif re.search(r'1\s*year|12\s*months?|365\s*days?|1\s*năm|سنة', combined):
        return "سنة كاملة (12 شهر)"
    elif re.search(r'6\s*months?|6\s*tháng', combined):
        return "6 أشهر"
    elif re.search(r'3\s*months?|3\s*tháng', combined):
        return "3 أشهر"
    elif re.search(r'2\s*months?|2\s*tháng', combined):
        return "شهران (60 يوم)"
    elif re.search(r'1\s*month|30\s*days?|30d|1\s*tháng|شهر', combined):
        return "شهر كامل (30 يوم)"
    elif re.search(r'14\s*days?|14d', combined):
        return "14 يوماً"
    elif re.search(r'7\s*days?|7d|1\s*tuần|أسبوع', combined):
        return "7 أيام (أسبوع)"
    elif re.search(r'3\s*days?|3d', combined):
        return "3 أيام"
    elif re.search(r'1\s*day|24h|24\s*hours?|يوم', combined):
        return "يوم كامل (24 ساعة)"
    elif re.search(r'credit|tokens?|رصيد|كود|otp', combined):
        return "شحن رصيد / كود فوري"
    else:
        return "حسب الباقة"

def extract_warranty(name, desc, duration_str):
    combined = (name + " " + desc).lower()
    
    # Check for no warranty
    if re.search(r'no\s*warranty|không\s*bảo\s*hành|بدون\s*ضمان|0\s*warranty', combined):
        return False, "بدون ضمان ممتد (استهلاك فوري)", "حساب استهلاك فوري يتم فحصه والتأكد من عمله قبل التسليم، ولا يشمل ضمان استبدال لاحق."
    
    # Check for full warranty
    if re.search(r'full\s*warranty|bảo\s*hành\s*full|full\s*bảo\s*hành|ضمان\s*كامل', combined):
        return True, f"ضمان كامل طوال المدة ({duration_str})", f"ضمان استبدال وتعويض كامل وشامل 100% طوال مدة الاشتراك ({duration_str}) في حال حدوث أي خلل أو توقف."
    
    # Check for explicit warranty days
    m = re.search(r'warranty\s*(\d+)\s*(days?|d|h|hours?|months?|m|years?|y)', combined)
    if not m:
        m = re.search(r'bảo\s*hành\s*(\d+)\s*(ngày|tháng|năm|h|d)', combined)
    if not m:
        m = re.search(r'(\d+)\s*(d|days?|months?)\s*warranty', combined)
        
    if m:
        num = m.group(1)
        unit = m.group(2).lower()
        if unit in ['d', 'day', 'days', 'ngày']:
            text = f"ضمان {num} يوم معتمد"
        elif unit in ['h', 'hour', 'hours']:
            text = f"ضمان {num} ساعة معتمد"
        elif unit in ['m', 'month', 'months', 'tháng']:
            text = f"ضمان {num} شهر معتمد"
        elif unit in ['y', 'year', 'years', 'năm']:
            text = f"ضمان {num} سنة معتمد"
        else:
            text = f"ضمان {num} يوم معتمد"
        return True, text, f"يشمل ضمان استبدال فوري رسمي معتمد لمدة {text} من تاريخ الشراء."

    # If duration exists and not explicitly no warranty
    if "شهر" in duration_str or "سنة" in duration_str or "أيام" in duration_str or "مدى الحياة" in duration_str:
        return True, "ضمان تشغيل وتسليم رسمي", "ضمان رسمي لتشغيل وتفعيل الحساب والمفتاح فور التسليم مع استبدال فوري في حال وجود أي عائق."
        
    return False, "استهلاك وتفعيل فوري", "تسليم فوري للمنتج مع التأكد من صلاحيته وتفعيله الفوري."

# Service metadata mapping
SERVICE_CONFIG = {
    'chatgpt': {
        'name_ar': 'شات جي بي تي (ChatGPT & OpenAI)',
        'category': 'ai',
        'icon': 'assets/official_icons/openai.svg',
        'brand_color': '#10A37F',
        'brand_gradient': 'linear-gradient(135deg, #053b2e 0%, #0c6b53 50%, #10a37f 100%)',
        'brand_label': 'ChatGPT & OpenAI',
        'short_desc': 'حساب شات جي بي تي رسمي مع كامل مميزات الذكاء الاصطناعي GPT-4o وتوليد الصور DALL-E وتحليل الملفات المتقدم.',
        'features': [
            'وصول فوري وغير محدود لأحدث نماذج الذكاء الاصطناعي GPT-4o و GPT-4',
            'إمكانية توليد وتعديل الصور بدقة فائقة عبر DALL-E 3',
            'تحليل البيانات المتقدم، قراءة المستندات والملفات والبرمجة',
            'دعم كامل للتطبيقات على نظامي iOS و Android والمتصفحات',
            'سرعة استجابة فائقة وأولوية وصول أثناء أوقات الذروة'
        ],
        'account_type': 'حساب رسمي خاص جاهز للتسجيل الفوري'
    },
    'claude': {
        'name_ar': 'كلاود للذكاء الاصطناعي (Claude AI)',
        'category': 'ai',
        'icon': 'assets/official_icons/anthropic.svg',
        'brand_color': '#D97706',
        'brand_gradient': 'linear-gradient(135deg, #421808 0%, #873614 50%, #d97706 100%)',
        'brand_label': 'Claude AI (Anthropic)',
        'short_desc': 'أقوى نموذج ذكاء اصطناعي لكتابة الأكواد البرمجية والتحليل المعقد وصياغة المستندات العلمية بأعلى دقة.',
        'features': [
            'وصول كامل لنموذج Claude 3.5 Sonnet و Claude Opus الأقوى عالمياً في البرمجة',
            'نافذة سياق ضخمة تصل إلى 200 ألف توكن لقراءة كتب ومشاريع برمجية كاملة',
            'ميزة Artifacts التفاعلية لتشغيل الأكواد والصفحات فوراً داخل المحادثة',
            'دقة استثنائية في التحليل الرياضي والعلمي وصياغة المحتوى العربي',
            'حساب مفعل ومضمون بدون حظر جغرافي'
        ],
        'account_type': 'حساب برو رسمي خاص'
    },
    'grok': {
        'name_ar': 'جروك وإكس (Grok AI & X)',
        'category': 'ai',
        'icon': 'assets/official_icons/grok.svg',
        'brand_color': '#1DA1F2',
        'brand_gradient': 'linear-gradient(135deg, #0f141c 0%, #1e293b 50%, #334155 100%)',
        'brand_label': 'Grok AI & X (xAI)',
        'short_desc': 'محرك الذكاء الاصطناعي فائق الذكاء من xAI مع إمكانية الوصول إلى الأخبار والبيانات الحية وتوليد الصور بدون قيود.',
        'features': [
            'وصول لأحدث نماذج Grok 2 و Grok 2 mini المتقدمة',
            'توليد صور واقعية وفنية فائقة الدقة عبر Aurora Flux',
            'ربط مباشر ومحدث لحظة بلحظة مع شبكة X (تويتر سابقاً)',
            'حساب مخصص ومفعل مع توكنات ورصيد استهلاك عالي'
        ],
        'account_type': 'حساب xAI رسمي / رصيد API'
    },
    'cursor': {
        'name_ar': 'كيرسور للمطورين (Cursor AI Pro)',
        'category': 'ai',
        'icon': 'assets/official_icons/cursor.svg',
        'brand_color': '#000000',
        'brand_gradient': 'linear-gradient(135deg, #0a0e17 0%, #172033 50%, #2d3748 100%)',
        'brand_label': 'Cursor AI Pro',
        'short_desc': 'بيئة التطوير والبرمجة بالذكاء الاصطناعي الأكثر تطوراً عالمياً لمساعدة المبرمجين على إنجاز المشاريع في ثوانٍ.',
        'features': [
            'دمج مدمج لأقوى نماذج البرمجة GPT-4o و Claude 3.5 Sonnet',
            'إكمال تلقائي للأكواد وسطور متعددة ذكية (Copilot++)',
            'فهم شامل لكافة ملفات المشروع وقواعد البيانات الخاصة بك',
            'سرعة فائقة واختصار 70% من وقت كتابة الأكواد وتصحيح الأخطاء'
        ],
        'account_type': 'حساب Cursor Pro مفعل'
    },
    'deepseek': {
        'name_ar': 'ديب سيك (DeepSeek AI)',
        'category': 'ai',
        'icon': 'assets/official_icons/deepseek.svg',
        'brand_color': '#4D6BFE',
        'brand_gradient': 'linear-gradient(135deg, #09173d 0%, #19388a 50%, #4D6BFE 100%)',
        'brand_label': 'DeepSeek AI',
        'short_desc': 'النموذج الاستدلالي فائق التطور للمسائل الرياضية والبرمجية المعقدة بأسعار اقتصادية وجودة خارقة.',
        'features': [
            'وصول لنماذج DeepSeek-R1 و DeepSeek-V3 الاستدلالية',
            'قدرات متفوقة في حل المعادلات الرياضية والألغاز البرمجية',
            'رصيد ومفاتيح API سريعة ومستقرة'
        ],
        'account_type': 'حساب رسمي / رصيد API'
    },
    'midjourney': {
        'name_ar': 'ميدجورني (Midjourney AI)',
        'category': 'ai',
        'icon': 'assets/official_icons/midjourney.svg',
        'brand_color': '#000000',
        'brand_gradient': 'linear-gradient(135deg, #080c14 0%, #16243b 50%, #2e4a7a 100%)',
        'brand_label': 'Midjourney AI',
        'short_desc': 'المنصة الرائدة عالمياً في توليد الصور الفنية والتصميم الجرافيكي بالذكاء الاصطناعي بدقة سينمائية مذهلة.',
        'features': [
            'توليد وتصميم صور فائقة الواقعية بأحدث إصدارات V6.1',
            'ساعات GPU سريعة لتوليد وتكبير الصور في ثوانٍ',
            'إمكانية الاستخدام عبر ديسكورد والموقع الرسمي'
        ],
        'account_type': 'حساب مفعل جاهز للاستخدام'
    },
    'runway': {
        'name_ar': 'رن واي لصناعة الفيديو (Runway Gen-3)',
        'category': 'ai',
        'icon': 'assets/official_icons/runway.svg',
        'brand_color': '#FF3366',
        'brand_gradient': 'linear-gradient(135deg, #380816 0%, #8a1437 50%, #FF3366 100%)',
        'brand_label': 'Runway Gen-3 Alpha',
        'short_desc': 'أقوى أداة لتوليد وصناعة مقاطع الفيديو السينمائية بالذكاء الاصطناعي من النصوص والصور بأعلى دقة.',
        'features': [
            'وصول كامل لموديل Gen-3 Alpha لصناعة الفيديو بدقة 4K',
            'تحويل النص إلى فيديو وتحويل الصور إلى حركات سينمائية',
            'أدوات تحكم بحركة الكاميرا والإضاءة والسرعة'
        ],
        'account_type': 'حساب رن واي مع رصيد ائتماني'
    },
    'kling': {
        'name_ar': 'كلينج للذكاء الاصطناعي (Kling AI)',
        'category': 'ai',
        'icon': 'assets/official_icons/kling.svg',
        'brand_color': '#3366FF',
        'brand_gradient': 'linear-gradient(135deg, #091538 0%, #16348c 50%, #3366FF 100%)',
        'brand_label': 'Kling Video AI',
        'short_desc': 'المنصة الرائدة في تحريك الصور وتوليد مقاطع الفيديو فائقة الواقعية بجودة مذهلة ودعم حركات معقدة.',
        'features': [
            'توليد مقاطع فيديو سينمائية تصل مدتها حتى دقيقة كاملة',
            'محاكاة فيزيائية واقعية لحركة الأجسام والوجوه والسوائل',
            'رصيد ائتماني لتوليد وتصدير المقاطع بدقة HD و 4K'
        ],
        'account_type': 'حساب رسمي مع رصيد كافي'
    },
    'suno': {
        'name_ar': 'سونو لتأليف الصوت والموسيقى (Suno AI)',
        'category': 'ai',
        'icon': 'assets/official_icons/suno.svg',
        'brand_color': '#000000',
        'brand_gradient': 'linear-gradient(135deg, #1f0729 0%, #4d1266 50%, #9924cc 100%)',
        'brand_label': 'Suno Music AI',
        'short_desc': 'تأليف وإنتاج الموسيقى والأغاني والمؤثرات الصوتية الاحترافية بالذكاء الاصطناعي بأي لغة ونمط.',
        'features': [
            'توليد أغانٍ ومقطوعات موسيقية كاملة بصوت عالي الجودة وبأي لهجة',
            'رصيد إنتاج يومي/شهري مع حقوق استخدام تجارية كاملة',
            'إمكانية كتابة الكلمات والمطالبة بأنماط وألحان مخصصة'
        ],
        'account_type': 'اشتراك بريميوم مع رصيد'
    },
    'elevenlabs': {
        'name_ar': 'إليفن لابس للتعليق الصوتي (ElevenLabs)',
        'category': 'ai',
        'icon': 'assets/official_icons/elevenlabs.svg',
        'brand_color': '#000000',
        'brand_gradient': 'linear-gradient(135deg, #111827 0%, #1f2937 50%, #374151 100%)',
        'brand_label': 'ElevenLabs Voice AI',
        'short_desc': 'محرك تحويل النص إلى صوت بشري واقعي لا يمكن تفريقه عن البشر، يدعم اللغة العربية والعديد من اللهجات.',
        'features': [
            'أصوات بشرية واقعية للغاية مع نبرات عاطفية متعددة',
            'دعم كامل للغة العربية الفصحى واللهجات المحلية',
            'استنساخ الأصوات (Voice Cloning) بدقة استثنائية',
            'رصيد أحرف شهري لتوليد الكتب الصوتية والتعليق على الفيديوهات'
        ],
        'account_type': 'حساب رسمي مع رصيد أحرف'
    },
    'perplexity': {
        'name_ar': 'بيربلكسيتي برو (Perplexity Pro)',
        'category': 'ai',
        'icon': 'assets/official_icons/perplexity.svg',
        'brand_color': '#20B2AA',
        'brand_gradient': 'linear-gradient(135deg, #062b2a 0%, #0d5452 50%, #20B2AA 100%)',
        'brand_label': 'Perplexity Pro AI',
        'short_desc': 'محرك البحث الذكي المعزز بنماذج الذكاء الاصطناعي المتعددة ومصادر موثقة للبحوث والدراسات الأكاديمية.',
        'features': [
            'تبديل حر بين أقوى نماذج الذكاء الاصطناعي (Claude 3.5, GPT-4o, Sonar)',
            'بحث عميق Pro Search مع توثيق المصادر والروابط الرسمية',
            'تحميل وتحليل ملفات PDF والمستندات بدون حدود'
        ],
        'account_type': 'حساب Perplexity Pro مفعل'
    },
    'canva': {
        'name_ar': 'كانفا برو (Canva Pro)',
        'category': 'design',
        'icon': 'assets/official_icons/canva.svg',
        'brand_color': '#00C4CC',
        'brand_gradient': 'linear-gradient(135deg, #00C4CC 0%, #4654D9 50%, #7D2AE8 100%)',
        'brand_label': 'Canva Pro Premium',
        'short_desc': 'وصول كامل وغير محدود لمكتبة كانفا الاحترافية: ملايين القوالب، إزالة خلفيات الصور، والخطوط المميزة.',
        'features': [
            'وصول لأكثر من 100 مليون صورة وفيديو ورسم وجرافيك متميز',
            'أداة إزالة الخلفيات السحرية من الصور والفيديوهات بضغطة واحدة',
            'ميزة تغيير المقاسات السحرية وتنسيق التصاميم لكافة الشبكات',
            'أدوات الذكاء الاصطناعي Magic Studio لتوليد وتعديل التصاميم',
            'تنزيل التصاميم بأعلى جودة ممكنة وخلفيات شفافة'
        ],
        'account_type': 'تفعيل رسمي على حسابك أو حساب جاهز'
    },
    'capcut': {
        'name_ar': 'كاب كات برو (CapCut Pro)',
        'category': 'design',
        'icon': 'assets/official_icons/capcut.svg',
        'brand_color': '#00b4d8',
        'brand_gradient': 'linear-gradient(135deg, #001a24 0%, #00455c 50%, #00b4d8 100%)',
        'brand_label': 'CapCut Pro Video',
        'short_desc': 'تفعيل كافة ميزات برنامج تحرير الفيديو الأشهر عالمياً بدون علامة مائية وبأعلى دقة تصدير 4K.',
        'features': [
            'إزالة العلامة المائية وتصدير المقاطع بدقة تصل إلى 4K بمعدل 60 إطار',
            'فتح كافة الانتقالات الاحترافية والمؤثرات البصرية والمرشحات المدفوعة',
            'التوليد التلقائي للترجمة التلقائية (Auto Captions) بدقة متناهية',
            'أدوات تعديل الصوت الاحترافية وتقليل الضوضاء بالذكاء الاصطناعي',
            'دعم الاستخدام على أجهزة الكمبيوتر (PC/Mac) والهواتف الذكية'
        ],
        'account_type': 'حساب برو رسمي جاهز لتسجيل الدخول'
    },
    'adobe': {
        'name_ar': 'أدوبي كرييتف كلاود (Adobe Creative Cloud)',
        'category': 'design',
        'icon': 'assets/official_icons/adobe.svg',
        'brand_color': '#FF0000',
        'brand_gradient': 'linear-gradient(135deg, #3d0505 0%, #8c0c0c 50%, #FF0000 100%)',
        'brand_label': 'Adobe Creative Cloud',
        'short_desc': 'حزمة برامج التصميم والمونتاج الاحترافية الكاملة من أدوبي (فوتوشوب، إليستريتور، بريمير، وأفتر إفكتس).',
        'features': [
            'تفعيل رسمي لكافة برامج أدوبي (Photoshop, Illustrator, Premiere Pro, After Effects)',
            'تحديثات مستمرة ومباشرة من تطبيق Adobe Creative Cloud الرسمي',
            'دعم ميزات الذكاء الاصطناعي Adobe Firefly للتوليد والتعبئة التوليدية',
            'مساحة تخزين سحابية لمزامنة مشاريعك وأعمالك عبر السحابة'
        ],
        'account_type': 'تفعيل رسمي على إيميلك الشخصي أو حساب مخصص'
    },
    'autodesk': {
        'name_ar': 'أوتوديسك للهندسة والتصميم (Autodesk)',
        'category': 'design',
        'icon': 'assets/official_icons/autodesk.svg',
        'brand_color': '#0696D7',
        'brand_gradient': 'linear-gradient(135deg, #032536 0%, #065b82 50%, #0696D7 100%)',
        'brand_label': 'Autodesk AutoCAD & 3D',
        'short_desc': 'تراخيص البرامج الهندسية والمعمارية العالمية (AutoCAD, Revit, 3ds Max, Maya) مع التحديثات الرسمية.',
        'features': [
            'ترخيص برامج التصميم المعماري والميكانيكي الأكثر اعتماداً في العالم',
            'تفعيل رسمي من خوادم شركة Autodesk مباشرة',
            'تحميل البرنامج والتحديثات الرسمية بأمان تام وبدون كراكات'
        ],
        'account_type': 'ترخيص رسمي معتمد'
    },
    'figma': {
        'name_ar': 'فيجما الاحترافية (Figma Pro)',
        'category': 'design',
        'icon': 'assets/official_icons/figma.svg',
        'brand_color': '#F24E1E',
        'brand_gradient': 'linear-gradient(135deg, #381206 0%, #8c2d0e 50%, #F24E1E 100%)',
        'brand_label': 'Figma Professional',
        'short_desc': 'المنصة العالمية الأولى لتصميم واجهات وتجربة المستخدم (UI/UX) والتعاون اللحظي بين فرق العمل.',
        'features': [
            'مشاريع وملفات غير محدودة ومشاركة فورية مع فريق العمل',
            'سجل تعديلات وإصدارات محفوظ بدون حد زمني',
            'ميزات Dev Mode لتسهيل تسليم التصاميم للمطورين'
        ],
        'account_type': 'حساب Figma Professional مفعل'
    },
    'freepik': {
        'name_ar': 'فريبك بريميوم (Freepik Premium)',
        'category': 'design',
        'icon': 'assets/official_icons/freepik.svg',
        'brand_color': '#1273EB',
        'brand_gradient': 'linear-gradient(135deg, #041c38 0%, #0b4387 50%, #1273EB 100%)',
        'brand_label': 'Freepik Premium',
        'short_desc': 'تحميل غير محدود للملفات والتصاميم الفيكتور وملفات PSD وقوالب السوشيال ميديا الاحترافية.',
        'features': [
            'تنزيل يومي غير محدود لملفات الفيكتور والصور الفائقة الدقة',
            'ملفات PSD جاهزة للتعديل على فوتوشوب مع حقوق استخدام تجارية',
            'تخطي فترات الانتظار وبدون إعلانات'
        ],
        'account_type': 'اشتراك بريميوم مفعل'
    },
    'microsoft': {
        'name_ar': 'مايكروسوفت 365 وأوفيس (Microsoft 365)',
        'category': 'microsoft',
        'icon': 'assets/official_icons/microsoft.svg',
        'brand_color': '#0078D4',
        'brand_gradient': 'linear-gradient(135deg, #00224a 0%, #004d99 50%, #0078D4 100%)',
        'brand_label': 'Microsoft 365 & Office',
        'short_desc': 'حزمة برامج أوفيس الأصلية الكاملة مع مساحة تخزين سحابية ضخمة 1TB على OneDrive صالحة لـ 5 أجهزة.',
        'features': [
            'تفعيل رسمي لبرامج Word, Excel, PowerPoint, Outlook, OneNote الأصلية',
            'مساحة تخزين سحابية آمنة بسعة 1 تيرابايت (1000GB) على ون درايف',
            'إمكانية تشغيل الحساب على 5 أجهزة في نفس الوقت (كمبيوتر، تابلت، جوال)',
            'تحديثات أمان مستمرة وتنزيل مباشر من موقع مايكروسوفت الرسمي'
        ],
        'account_type': 'حساب رسمي خاص أو كود تفعيل'
    },
    'windows': {
        'name_ar': 'مفاتيح ترخيص ويندوز الأصلية (Windows License)',
        'category': 'microsoft',
        'icon': 'assets/official_icons/windows.svg',
        'brand_color': '#0078D4',
        'brand_gradient': 'linear-gradient(135deg, #001f42 0%, #004b87 50%, #0078D4 100%)',
        'brand_label': 'Windows 11 / 10 Pro',
        'short_desc': 'مفتاح رقمي أصلي 100% لتنشيط Windows 10 Pro أو Windows 11 Pro مدى الحياة مع التحديثات الرسمية.',
        'features': [
            'مفتاح ترخيص رسمي رقمي أصلي يقبل التنشيط المباشر عبر الإنترنت',
            'تنشيط دائم مدى الحياة لجهازك مع التحديثات الأمنية الرسمية',
            'دعم النواتين 32 بت و 64 بت وكافة اللغات بما فيها العربية',
            'إزالة كاملة للعلامة المائية لتنشيط الويندوز وفتح كافة الإعدادات'
        ],
        'account_type': 'مفتاح رقمي رقمي أصلي (Product Key)'
    },
    'nordvpn': {
        'name_ar': 'نورد في بي إن (NordVPN Plus)',
        'category': 'vpn',
        'icon': 'assets/official_icons/nordvpn.svg',
        'brand_color': '#4687FF',
        'brand_gradient': 'linear-gradient(135deg, #091e42 0%, #1b499e 50%, #4687FF 100%)',
        'brand_label': 'NordVPN Plus Secure',
        'short_desc': 'تشفير فائق للبيانات وتصفح آمن وتخطي الحجب بسرعات اتصال فائقة في أكثر من 60 دولة حول العالم.',
        'features': [
            'أكثر من 6000 خادم فائق السرعة حول العالم لتصفح بدون انقطاع',
            'حماية فائقة من التهديدات وحجب الإعلانات والبرمجيات الخبيثة',
            'إمكانية تشغيل الحساب على حتى 6 أجهزة (هواتف، أجهزة حاسوب، تلفزيون ذكي)',
            'تخطي القيود الجغرافية وفتح كافة المواقع والخدمات المحجوبة'
        ],
        'account_type': 'حساب مفعل رسمي بضمان كامل'
    },
    'expressvpn': {
        'name_ar': 'إكسبريس في بي إن (ExpressVPN)',
        'category': 'vpn',
        'icon': 'assets/official_icons/expressvpn.svg',
        'brand_color': '#DA3940',
        'brand_gradient': 'linear-gradient(135deg, #380e10 0%, #8c2327 50%, #DA3940 100%)',
        'brand_label': 'ExpressVPN Secure',
        'short_desc': 'الشبكة الافتراضية الخاصة الأسرع والأكثر موثوقية لمشاهدة البث المباشر والألعاب وحماية الخصوصية.',
        'features': [
            'سرعات اتصال فائقة بدون حدود للبث بدقة 4K والألعاب أونلاين',
            'خوادم آمنة في 105 دول مع بروتوكول Lightway المتطور',
            'سياسة صارمة لمنع تسجيل النشاطات لضمان أقصى درجات الخصوصية'
        ],
        'account_type': 'حساب رسمي / كود تفعيل'
    },
    'protonvpn': {
        'name_ar': 'بروتون في بي إن (ProtonVPN)',
        'category': 'vpn',
        'icon': 'assets/official_icons/protonvpn.svg',
        'brand_color': '#6D4AFF',
        'brand_gradient': 'linear-gradient(135deg, #19113d 0%, #3d2a91 50%, #6D4AFF 100%)',
        'brand_label': 'ProtonVPN Swiss Security',
        'short_desc': 'خدمة الأمان السويسرية الشهيرة ذات التشفير العسكري لحماية الخصوصية وحرية التصفح.',
        'features': [
            'حماية متقدمة خاضعة لقوانين الخصوصية السويسرية الصارمة',
            'خوادم Secure Core فائقة الأمان ومقاومة للهجمات السيبرانية',
            'دعم كامل للتورنت وتخطي الحجب بسرعات عالية'
        ],
        'account_type': 'حساب مفعل بريميوم'
    },
    'kaspersky': {
        'name_ar': 'كاسبرسكي بلس وتوتال (Kaspersky Security)',
        'category': 'vpn',
        'icon': 'assets/official_icons/kaspersky.svg',
        'brand_color': '#006D55',
        'brand_gradient': 'linear-gradient(135deg, #001f18 0%, #004d3c 50%, #006D55 100%)',
        'brand_label': 'Kaspersky Security',
        'short_desc': 'مضاد الفيروسات الأول عالمياً لحماية الأجهزة من البرمجيات الخبيثة والفدية وحماية المعاملات البنكية.',
        'features': [
            'حماية فورية شاملة ضد كافة الفيروسات وبرامج الفدية والتجسس',
            'جدار ناري ذكي وحماية متقدمة للمدفوعات الإلكترونية والتسوق',
            'أدوات تسريع وتحسين أداء النظام وتنظيف الملفات المؤقتة'
        ],
        'account_type': 'مفتاح ترخيص أصلي معتمد'
    },
    'netflix': {
        'name_ar': 'نتفلكس بريميوم 4K (Netflix 4K UHD)',
        'category': 'entertainment',
        'icon': 'assets/official_icons/netflix.svg',
        'brand_color': '#E50914',
        'brand_gradient': 'linear-gradient(135deg, #240507 0%, #690a0f 50%, #E50914 100%)',
        'brand_label': 'Netflix 4K UHD',
        'short_desc': 'مشاهدة غير محدودة لأحدث الأفلام والمسلسلات بجودة فائقة 4K Ultra HD مع دعم الصوت المحيطي والترجمة.',
        'features': [
            'أعلى جودة بث متاحة 4K Ultra HD + تقنية الصوت السينمائي Spatial Audio',
            'دعم الترجمة والدبلجة العربية لكافة الأعمال الحصرية والعالمية',
            'إمكانية المشاهدة على الشاشات الذكية، أجهزة الكمبيوتر، والهواتف',
            'حساب رسمي ومستقر مع ضمان كامل طوال فترة الاشتراك'
        ],
        'account_type': 'ملف خاص مشفر برمز PIN أو حساب كامل'
    },
    'youtube': {
        'name_ar': 'يوتيوب بريميوم (YouTube Premium)',
        'category': 'entertainment',
        'icon': 'assets/official_icons/youtube.svg',
        'brand_color': '#FF0000',
        'brand_gradient': 'linear-gradient(135deg, #360000 0%, #8a0303 50%, #FF0000 100%)',
        'brand_label': 'YouTube Premium',
        'short_desc': 'مشاهدة خالية تماماً من الإعلانات المزعجة، مع تشغيل في الخلفية وتنزيل المقاطع وتطبيق YouTube Music.',
        'features': [
            'مشاهدة كافة مقاطع يوتيوب بدون أي إعلانات نهائياً على جميع أجهزتك',
            'تشغيل المقاطع والمحاضرات في الخلفية أثناء إغلاق الشاشة أو تصفح تطبيقات أخرى',
            'إمكانية تنزيل مقاطع الفيديو بجودة عالية للمشاهدة بدون اتصال إنترنت',
            'اشتراك مجاني مدمج في تطبيق يوتيوب ميوزك (YouTube Music Premium)'
        ],
        'account_type': 'تفعيل رسمي على إيميلك الشخصي بدون كلمة مرور'
    },
    'spotify': {
        'name_ar': 'سبوتيفاي بريميوم (Spotify Premium)',
        'category': 'entertainment',
        'icon': 'assets/official_icons/spotify.svg',
        'brand_color': '#1DB954',
        'brand_gradient': 'linear-gradient(135deg, #032410 0%, #095924 50%, #1DB954 100%)',
        'brand_label': 'Spotify Premium',
        'short_desc': 'استماع موسيقي غير محدود بصوت فائق النقاء وبدون إعلانات مع إمكانية التنزيل والتشغيل بدون إنترنت.',
        'features': [
            'استماع غير محدود للملايين من المقاطع والبودكاست بدون فواصل إعلانية',
            'تنزيل المقاطع للاستماع في أي مكان بدون اتصال بالإنترنت',
            'صوت عالي النقاء والجودة بوضوح استثنائي Very High Quality',
            'تخطي المقاطع بحرية تامة وبدون أي قيود'
        ],
        'account_type': 'تفعيل رسمي مباشر على حسابك الشخصي'
    },
    'xbox': {
        'name_ar': 'إكس بوكس غيم باس ألتيميت (Xbox Game Pass)',
        'category': 'entertainment',
        'icon': 'assets/official_icons/xbox.svg',
        'brand_color': '#107C10',
        'brand_gradient': 'linear-gradient(135deg, #052605 0%, #0b540b 50%, #107C10 100%)',
        'brand_label': 'Xbox Game Pass Ultimate',
        'short_desc': 'مكتبة ألعاب ضخمة تضم مئات الألعاب القوية لأجهزة الكمبيوتر وكونسول الإكس بوكس مع اشتراك EA Play.',
        'features': [
            'وصول لأكثر من 400 لعبة عالية الجودة مع إضافة ألعاب جديدة باستمرار',
            'إمكانية لعب عناوين Xbox Game Studios الحصرية في يوم إطلاقها الأول',
            'عضوية مجانية مدمجة في مكتبة ألعاب EA Play الشهيرة'
        ],
        'account_type': 'حساب رسمي أو كود رقمي'
    },
    'discord': {
        'name_ar': 'ديسكورد نيترو (Discord Nitro)',
        'category': 'entertainment',
        'icon': 'assets/official_icons/discord.svg',
        'brand_color': '#5865F2',
        'brand_gradient': 'linear-gradient(135deg, #13173d 0%, #2b338a 50%, #5865F2 100%)',
        'brand_label': 'Discord Nitro Gaming',
        'short_desc': 'ترقية حساب ديسكورد مع دعم مشاركة الشاشة بدقة 4K وإيموجيات مخصصة وبوستات السيرفرات.',
        'features': [
            'مشاركة الشاشة والبث بجودة 4K بمعدل 60 إطار في الثانية',
            'استخدام الإيموجيات والملصقات المتحركة في أي سيرفر بدون قيود',
            'رفع ملفات ضخمة تصل سعتها حتى 500 ميجابايت',
            'الحصول على 2 سيرفر بوست شهرياً لدعم مجتمعك وسيرفراتك'
        ],
        'account_type': 'كود هدية رسمي أو حساب مخصص'
    },
    'apple': {
        'name_ar': 'آبل ميوزك وآي كلاود (Apple Services)',
        'category': 'entertainment',
        'icon': 'assets/official_icons/apple.svg',
        'brand_color': '#000000',
        'brand_gradient': 'linear-gradient(135deg, #18181b 0%, #27272a 50%, #3f3f46 100%)',
        'brand_label': 'Apple Services & iCloud',
        'short_desc': 'اشتراكات آبل الرسمية للاستماع إلى الموسيقى بأعلى جودة بدون فقدان Lossless ومساحات iCloud السحابية.',
        'features': [
            'مكتبة آبل ميوزك الكاملة بصوت نقي فائق الدقة Spatial Audio',
            'تنزيل واستماع بدون إنترنت وبدون إعلانات',
            'تفعيل رسمي عبر اشتراك عائلي آمن ومعتمد'
        ],
        'account_type': 'دعوة عائلية رسمية أو كود استرداد'
    },
    'telegram': {
        'name_ar': 'تيليجرام بريميوم (Telegram Premium)',
        'category': 'learning',
        'icon': 'assets/official_icons/telegram.svg',
        'brand_color': '#229ED9',
        'brand_gradient': 'linear-gradient(135deg, #083457 0%, #125e99 50%, #229ED9 100%)',
        'brand_label': 'Telegram Premium',
        'short_desc': 'الترقية الرسمية لحساب تيليجرام: مضاعفة حدود القنوات والملفات، سرعات تنزيل خارقة، وعلامة التوثيق.',
        'features': [
            'رفع ملفات ضخمة تصل حتى 4 جيجابايت للملف الواحد',
            'أقصى سرعة تنزيل متاحة بدون أي قيود على سعة النطاق',
            'تحويل الرسائل الصوتية والفيديوهات إلى نصوص مكتوبة بضغطة زر',
            'شارة النجمة المميزة بجوار اسمك في كافة المحادثات',
            'مضاعفة كافة الحدود: الاشتراك في 1000 قناة وتثبيت 10 محادثات'
        ],
        'account_type': 'إهداء رسمي مباشر لحسابك أو كود تفعيل'
    },
    'tiktok': {
        'name_ar': 'حسابات وخدمات تيك توك (TikTok Accounts)',
        'category': 'social',
        'icon': 'assets/official_icons/tiktok.svg',
        'brand_color': '#000000',
        'brand_gradient': 'linear-gradient(135deg, #0b0c10 0%, #1f2833 40%, #fe0979 100%)',
        'brand_label': 'TikTok Agency Accounts',
        'short_desc': 'حسابات تيك توك موثقة وجاهزة للإعلانات والبث المباشر (Agency Accounts) ودعم العملات الرقمية.',
        'features': [
            'حسابات إعلانية وتجارية مفعلة بدون قيود جغرافية',
            'مفتوحة البث المباشر وميزات تحقيق الدخل والربح',
            'حسابات نظيفة مسجلة يدوياً وجاهزة للربط فوراً'
        ],
        'account_type': 'إيميل وكلمة مرور مع كود التحقق 2FA'
    },
    'facebook': {
        'name_ar': 'حسابات فيسبوك وميتا بيزنس (Meta & Facebook)',
        'category': 'social',
        'icon': 'assets/official_icons/facebook.svg',
        'brand_color': '#1877F2',
        'brand_gradient': 'linear-gradient(135deg, #0d274c 0%, #124180 50%, #1877F2 100%)',
        'brand_label': 'Meta & Facebook Business',
        'short_desc': 'حسابات فيسبوك إعلانية قديمة ومحصنة ومديرو أعمال (Business Manager) لإدارة الحملات الاحترافية.',
        'features': [
            'حسابات إعلانية قديمة وقوية مقاومة للتعطيل والحظر',
            'بيزنس مانجر مفعّل لربط البطاقات الائتمانية وإطلاق الحملات',
            'تسليم فوري للمعلومات مع ملفات الكوكيز وكود 2FA'
        ],
        'account_type': 'بيانات كاملة Mail | Pass | 2FA'
    },
    'gmail': {
        'name_ar': 'حسابات جيميل وخدمات جوجل (Gmail Accounts)',
        'category': 'learning',
        'icon': 'assets/official_icons/gmail.svg',
        'brand_color': '#EA4335',
        'brand_gradient': 'linear-gradient(135deg, #3d0c08 0%, #8f1d13 50%, #EA4335 100%)',
        'brand_label': 'Gmail / Google Mail',
        'short_desc': 'حسابات جيميل رسمية نظيفة وقديمة معتمدة، جاهزة لربط التطبيقات والخدمات وتفعيل الاشتراكات.',
        'features': [
            'حسابات جيميل جديدة وقديمة منشأة يدوياً بمعايير أمان عالية',
            'تأكيد كامل مع إيميل استرداد وتخطي أسئلة الأمان',
            'جاهزة للاستخدام في منصات الذكاء الاصطناعي والتسويق الرقمي'
        ],
        'account_type': 'حساب كامل Mail | Pass | Recovery'
    },
    'google': {
        'name_ar': 'جوجل ون وجيميني أدفانسد (Google One & Gemini)',
        'category': 'learning',
        'icon': 'assets/official_icons/google.svg',
        'brand_color': '#4285F4',
        'brand_gradient': 'linear-gradient(135deg, #0c2144 0%, #174894 50%, #4285F4 100%)',
        'brand_label': 'Google One & Gemini',
        'short_desc': 'سعة تخزينية سحابية ضخمة تصل إلى 2TB على Google Drive مع اشتراك ذكاء اصطناعي Gemini Advanced.',
        'features': [
            'مساحة تخزين سحابية عملاقة على Google Photos و Drive و Gmail',
            'وصول كامل لأقوى نموذج ذكاء اصطناعي من جوجل Gemini 1.5 Pro',
            'دمج ميزات الذكاء الاصطناعي في محرّر مستندات Google Docs و Gmail'
        ],
        'account_type': 'حساب خاص أو تفعيل عائلي'
    },
    'notion': {
        'name_ar': 'نوشن بلس والذكاء الاصطناعي (Notion Plus AI)',
        'category': 'learning',
        'icon': 'assets/official_icons/notion.svg',
        'brand_color': '#000000',
        'brand_gradient': 'linear-gradient(135deg, #111827 0%, #1f2937 50%, #374151 100%)',
        'brand_label': 'Notion Plus AI',
        'short_desc': 'مساحة العمل المتكاملة لإدارة المهام والمشاريع وتدوين الملاحظات مدعومة بالذكاء الاصطناعي الكامل.',
        'features': [
            'صفحات وكتل عمل غير محدودة مع إمكانية مشاركة العمل مع الفريق',
            'أداة Notion AI المدمجة لتلخيص النصوص وترتيب المهام وكتابة المقالات',
            'رفع ملفات ومستندات بدون أي حد لحجم الملفات'
        ],
        'account_type': 'حساب Notion Plus مفعل'
    },
    'github': {
        'name_ar': 'جيت هب للمطورين وكوبايلوت (GitHub Developer)',
        'category': 'learning',
        'icon': 'assets/official_icons/github.svg',
        'brand_color': '#181717',
        'brand_gradient': 'linear-gradient(135deg, #0d1117 0%, #1f242c 50%, #30363d 100%)',
        'brand_label': 'GitHub Developer Pack',
        'short_desc': 'حزم مطوري جيت هب المتكاملة وحسابات كوبايلوت لمساعدة المبرمجين وتوفير أدوات الاستضافة والسيرفرات.',
        'features': [
            'حزمة GitHub Student Developer Pack وقسائم خدمات سحابية مجانية',
            'تفعيل مساعد البرمجة الذكي GitHub Copilot لكتابة الأكواد',
            'مستودعات برمجية خاصة غير محدودة ودعم CI/CD'
        ],
        'account_type': 'حساب ديفلوبر معتمد'
    },
    'duolingo': {
        'name_ar': 'دولينجو سوبر لتعلم اللغات (Duolingo Super)',
        'category': 'learning',
        'icon': 'assets/official_icons/duolingo.svg',
        'brand_color': '#58CC02',
        'brand_gradient': 'linear-gradient(135deg, #133602 0%, #2d7307 50%, #58CC02 100%)',
        'brand_label': 'Duolingo Super',
        'short_desc': 'تعلم اللغات العالمية بحرية تامة: قلوب طاقة غير محدودة، بدون إعلانات، ومراجعة مخصصة للأخطاء.',
        'features': [
            'قلوب طاقة غير محدودة للتعلم والممارسة بدون أي توقف',
            'تجربة تعليمية سلسة وخالية تماماً من الفواصل الإعلانية',
            'اختبارات تجاوز المستويات ومراجعة ذكية لنقاط الضعف'
        ],
        'account_type': 'تفعيل رسمي مباشر على حسابك الشخصي'
    },
    'zoom': {
        'name_ar': 'زووم للاجتماعات المرئية (Zoom One Pro)',
        'category': 'learning',
        'icon': 'assets/official_icons/zoom.svg',
        'brand_color': '#2D8CFF',
        'brand_gradient': 'linear-gradient(135deg, #072340 0%, #105396 50%, #2D8CFF 100%)',
        'brand_label': 'Zoom One Pro',
        'short_desc': 'عقد الاجتماعات والمؤتمرات والدروس أونلاين لمدة تصل إلى 30 ساعة متواصلة حتى 100 مشارك.',
        'features': [
            'اجتماعات جماعية مفتوحة تصل إلى 30 ساعة متصلة بدون انقطاع',
            'تسجيل الاجتماعات والمحاضرات وحفظها سحابياً بدقة عالية',
            'أدوات تفاعلية ومؤشرات واستطلاعات رأي متقدمة'
        ],
        'account_type': 'ترخيص رسمي مفعل'
    },
    'tradingview': {
        'name_ar': 'تريدنج فيو للتحليل المالي (TradingView Pro)',
        'category': 'learning',
        'icon': 'assets/official_icons/tradingview.svg',
        'brand_color': '#2962FF',
        'brand_gradient': 'linear-gradient(135deg, #061942 0%, #113c9e 50%, #2962FF 100%)',
        'brand_label': 'TradingView Pro',
        'short_desc': 'المنصة العالمية الأولى لتحليل أسواق العملات، الأسهم، والكريبتو بمؤشرات فنية ورسوم بيانية احترافية.',
        'features': [
            'رسوم بيانية متعددة في نافذة واحدة مع تحديثات لحظية',
            'إمكانية تشغيل حتى 5 مؤشرات فنية لكل شارت بدون قيود',
            'تنبيهات أسعار غير محدودة على السحابة عبر الرسائل والإشعارات'
        ],
        'account_type': 'حساب Pro مفعل رسمي'
    },
    'other': {
        'name_ar': 'منتجات وحسابات رقمية متنوعة',
        'category': 'other',
        'icon': 'assets/official_icons/openai.svg',
        'brand_color': '#0B132B',
        'brand_gradient': 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        'brand_label': 'Official Digital License',
        'short_desc': 'اشتراك رقمي أصلي ومفعل يتم تسليمه مباشرة مع ضمان التحقق من الصلاحية والدعم الفني.',
        'features': [
            'حساب ومفتاح ترخيص رسمي مفعل وجاهز للاستخدام الفوري',
            'تسليم فوري عبر واتساب فور تأكيد الطلب',
            'دعم فني واستشارات متواصلة على مدار الساعة'
        ],
        'account_type': 'حساب رقمي / كود رسمي'
    }
}

def detect_service(name, emoji, desc):
    combined = (name + " " + (emoji or "") + " " + desc).lower()
    
    if emoji and emoji in SERVICE_CONFIG:
        return emoji
    if emoji == 'apigpt':
        return 'chatgpt'
    if emoji == 'google_one':
        return 'google'
    if emoji == 'tele':
        return 'telegram'
    if emoji in ['express', 'hma_vpn', 'purevpn', 'norton_vpn', 'surfshark']:
        return 'nordvpn' if emoji == 'surfshark' else 'expressvpn'
    if emoji == 'proton':
        return 'protonvpn'
    if emoji == 'microsoft_office_365':
        return 'microsoft'
    if emoji in ['xingtu', 'meitu', 'wink']:
        return 'capcut'
        
    # Text matching
    if re.search(r'chatgpt|chat\s*gpt|gpt-4|openai|sora|codex|apigpt', combined):
        return 'chatgpt'
    elif re.search(r'claude|anthropic|sonnet|opus', combined):
        return 'claude'
    elif re.search(r'canva', combined):
        return 'canva'
    elif re.search(r'capcut|xingtu|meitu', combined):
        return 'capcut'
    elif re.search(r'netflix', combined):
        return 'netflix'
    elif re.search(r'youtube', combined):
        return 'youtube'
    elif re.search(r'spotify', combined):
        return 'spotify'
    elif re.search(r'windows|win\s*11|win\s*10', combined):
        return 'windows'
    elif re.search(r'office|365|onedrive', combined):
        return 'microsoft'
    elif re.search(r'telegram|tele', combined):
        return 'telegram'
    elif re.search(r'tiktok', combined):
        return 'tiktok'
    elif re.search(r'facebook|meta|bm\d+|via\s*fb', combined):
        return 'facebook'
    elif re.search(r'gmail|google\s*workspace', combined):
        return 'gmail'
    elif re.search(r'google|gemini', combined):
        return 'google'
    elif re.search(r'adobe|photoshop|premiere', combined):
        return 'adobe'
    elif re.search(r'autodesk|autocad|3ds\s*max|revit|maya', combined):
        return 'autodesk'
    elif re.search(r'figma', combined):
        return 'figma'
    elif re.search(r'freepik', combined):
        return 'freepik'
    elif re.search(r'notion', combined):
        return 'notion'
    elif re.search(r'github|copilot', combined):
        return 'github'
    elif re.search(r'duolingo', combined):
        return 'duolingo'
    elif re.search(r'zoom', combined):
        return 'zoom'
    elif re.search(r'tradingview', combined):
        return 'tradingview'
    elif re.search(r'xbox|game\s*pass', combined):
        return 'xbox'
    elif re.search(r'discord|nitro', combined):
        return 'discord'
    elif re.search(r'nordvpn', combined):
        return 'nordvpn'
    elif re.search(r'expressvpn|express', combined):
        return 'expressvpn'
    elif re.search(r'proton', combined):
        return 'protonvpn'
    elif re.search(r'kaspersky', combined):
        return 'kaspersky'
    elif re.search(r'apple|icloud', combined):
        return 'apple'
    elif re.search(r'grok|xai|twitter|super\s*grok', combined):
        return 'grok'
    elif re.search(r'cursor', combined):
        return 'cursor'
    elif re.search(r'midjourney', combined):
        return 'midjourney'
    elif re.search(r'deepseek', combined):
        return 'deepseek'
    elif re.search(r'suno', combined):
        return 'suno'
    elif re.search(r'runway', combined):
        return 'runway'
    elif re.search(r'kling', combined):
        return 'kling'
    elif re.search(r'elevenlabs', combined):
        return 'elevenlabs'
    elif re.search(r'perplexity', combined):
        return 'perplexity'
    else:
        return 'other'

def polish_arabic_title(raw_name, service_key, duration_str, is_guaranteed):
    cfg = SERVICE_CONFIG.get(service_key, SERVICE_CONFIG['other'])
    base_name = cfg['name_ar'].split(' (')[0].strip()
    
    tier = ""
    rn_lower = raw_name.lower()
    
    if 'team' in rn_lower:
        tier = "باقة فرق العمل (Team)"
    elif 'business' in rn_lower:
        tier = "للأعمال (Business)"
    elif 'enterprise' in rn_lower:
        tier = "مؤسسات (Enterprise)"
    elif 'ultra' in rn_lower or 'ultimate' in rn_lower:
        tier = "ألتيميت (Ultimate)"
    elif 'plus' in rn_lower and 'بلس' not in base_name:
        tier = "بلس (Plus)"
    elif 'pro' in rn_lower and 'برو' not in base_name:
        tier = "برو (Pro)"
    elif 'api' in rn_lower or 'token' in rn_lower or 'credit' in rn_lower:
        tier = "رصيد ومفاتيح API"
    elif 'retail' in rn_lower or 'oem' in rn_lower:
        tier = "مفتاح ترخيص رقمي رسمي"
    elif 'student' in rn_lower or 'edu' in rn_lower:
        tier = "باقة المطورين والطلاب"
    elif 'family' in rn_lower:
        tier = "عضوية عائلية (Family)"
    elif 'personal' in rn_lower:
        tier = "حساب شخصي خاص"
        
    if tier:
        title = f"اشتراك {base_name} {tier} - {duration_str}"
    else:
        title = f"اشتراك {base_name} - {duration_str}"
        
    return title

# Load raw products
with open('canboso_products.json', 'r', encoding='utf-8') as f:
    raw_products = json.load(f)['products']

processed_products = []

for idx, p in enumerate(raw_products):
    raw_name = clean_text(p.get('name', ''))
    raw_desc = clean_text(p.get('description', ''))
    raw_emoji = p.get('emoji', '')
    product_id = p.get('productId', f'prod_{idx+1}')
    
    # Prices
    usd_price = float(p.get('price', {}).get('amount', 0.0))
    if usd_price <= 0:
        usd_price = 1.0
        
    # Strictly follow exchange rates:
    # 536 YER per USD (Sanaa old)
    # 140 YER per 1 SAR -> (USD * 536) / 140
    # 2000 YER per USD (Aden new)
    yer_sanaa = round(usd_price * 536)
    sar_price = round((usd_price * 536) / 140.0, 1)
    yer_aden = round(usd_price * 2000)
    
    # Stock
    avail = p.get('availability', {})
    available_stock = int(avail.get('available', 0))
    sold_count = int(avail.get('sold', 0))
    in_stock = available_stock > 0
    
    # Duration & Warranty
    duration_str = extract_duration(raw_name, raw_desc)
    is_guar, war_text, war_policy = extract_warranty(raw_name, raw_desc, duration_str)
    
    # Service
    srv_key = detect_service(raw_name, raw_emoji, raw_desc)
    cfg = SERVICE_CONFIG.get(srv_key, SERVICE_CONFIG['other'])
    
    # Arabic polished title
    title_ar = polish_arabic_title(raw_name, srv_key, duration_str, is_guar)
    
    # Check if official SVG icon exists
    icon_path = cfg['icon']
    if not os.path.exists(icon_path):
        icon_path = 'assets/official_icons/openai.svg'
        
    item = {
        'id': product_id,
        'raw_name': raw_name,
        'title': title_ar,
        'service_key': srv_key,
        'service_name': cfg['name_ar'],
        'category': cfg['category'],
        'brand_color': cfg['brand_color'],
        'brand_gradient': cfg['brand_gradient'],
        'brand_label': cfg['brand_label'],
        'icon': icon_path,
        'is_guaranteed': is_guar,
        'warranty_text': war_text,
        'warranty_policy': war_policy,
        'duration': duration_str,
        'stock': available_stock,
        'sold': sold_count,
        'in_stock': in_stock,
        'prices': {
            'usd': usd_price,
            'sar': sar_price,
            'yer_sanaa': yer_sanaa,
            'yer_aden': yer_aden
        },
        'card_desc': cfg['short_desc'],
        'modal_data': {
            'overview': f"احصل على {title_ar} بأعلى درجات الموثوقية وتسليم فوري من متجر الجحفلي للحلول الرقمية. الخدمة تشمل تفعيلاً كاملاً مع ضمان معتمد وخدمة دعم فني متميزة.",
            'features': cfg['features'],
            'account_type': cfg['account_type'],
            'delivery_format': "تسليم فوري للبيانات (إيميل وكلمة مرور / مفتاح رقمي) مباشرة عبر واتساب فور تأكيد الطلب.",
            'support_info': "دعم فني مباشر على مدار الساعة 24/7 عبر واتساب +967782611415 لحل أي استفسار أو مشكلة."
        }
    }
    processed_products.append(item)

os.makedirs('assets/data', exist_ok=True)
with open('assets/data/products.json', 'w', encoding='utf-8') as f:
    json.dump(processed_products, f, ensure_ascii=False, indent=2)

with open('assets/data/products.js', 'w', encoding='utf-8') as f:
    f.write('window.STORE_PRODUCTS = ')
    json.dump(processed_products, f, ensure_ascii=False)
    f.write(';\n')

print(f"Successfully processed and wrote {len(processed_products)} products to assets/data/products.json and products.js without any lightning symbol!")
