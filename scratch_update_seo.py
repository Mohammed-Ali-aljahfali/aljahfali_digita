import os
import re

# List of HTML files in the project
html_files = [
    "index.html",
    "about.html",
    "services.html",
    "contact.html",
    "portfolio.html",
    "pricing.html",
    "web-development.html",
    "mobile-app-development.html",
    "digital-marketing.html",
    "graphic-design.html",
    "telegram-bots.html",
    "technical-support.html",
    "seo.html",
    "databases.html",
    "content-writing.html"
]

# Global brand keywords and phone number variations
global_keywords = [
    "الجحفلي للحلول الرقمية", "Aljahfali Digital Solutions", "Jahfali Digital Solutions",
    "الجحفلي للتقنية", "الجحفلي ويب", "الجحفلي للتطوير الرقمي", "رقم الجحفلي", "رقم تلفون الجحفلي",
    "رقم جوال الجحفلي", "كيف اتواصل مع الجحفلي", "أفضل مبرمج ويب", "رقم مبرمج ويب", "حلول رقمية",
    "خدمات رقمية", "خدمات تقنية", "تطوير المواقع", "تصميم المواقع", "برمجة المواقع",
    "تطوير تطبيقات الجوال", "برمجة التطبيقات", "تصميم شعارات", "تصميم جرافيك",
    "التسويق الرقمي", "إدارة الحملات الإعلانية", "الدعم الفني", "خدمات تقنية متكاملة",
    "التحول الرقمي", "تصميم مواقع في اليمن", "برمجة مواقع في اليمن", "مطور مواقع في اليمن",
    "تصميم تطبيقات في اليمن", "خدمات رقمية في اليمن", "شركة تقنية في اليمن",
    "حلول رقمية في صنعاء", "مطور ويب في صنعاء", "مصمم مواقع في صنعاء",
    "برمجة بوت تيليجرام", "إنشاء بوت تيليجرام", "بوتات الأعمال", "بوتات الرد التلقائي",
    "بوتات الطلبات", "Telegram Bot Development", "صيانة الحاسوب",
    # Phone number variations
    "782611415", "0782611415", "967782611415", "+967782611415", "00967782611415",
    "782 611 415", "782-611-415", "+967 782 611 415", "+967-782-611-415", "تواصل مع مبرمج",
    "مبرمج يمني"
]

def update_file_seo(file_path):
    print(f"Processing: {file_path}")
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Update <meta name="keywords" ...>
    keywords_pattern = r'(<meta\s+name="keywords"\s+content=")([^"]*)("\s*/?>)'
    match = re.search(keywords_pattern, content, re.IGNORECASE)
    if match:
        original_keywords = [kw.strip() for kw in match.group(2).split(",") if kw.strip()]
        # Merge, keeping original first, then global
        merged_keywords = []
        for kw in original_keywords + global_keywords:
            if kw not in merged_keywords:
                merged_keywords.append(kw)
        
        new_keywords_str = ", ".join(merged_keywords)
        new_tag = f'{match.group(1)}{new_keywords_str}{match.group(3)}'
        content = content.replace(match.group(0), new_tag)
        print(f"  - Updated meta keywords (Total unique: {len(merged_keywords)})")
    else:
        print("  - Meta keywords tag not found!")

    # 2. Update <meta name="description" ...>
    desc_pattern = r'(<meta\s+name="description"\s+content=")([^"]*)("\s*/?>)'
    match_desc = re.search(desc_pattern, content, re.IGNORECASE)
    if match_desc:
        original_desc = match_desc.group(2)
        phone_keywords = ["782611415", "+967782611415", "782 611 415"]
        has_phone = any(p in original_desc for p in phone_keywords)
        if not has_phone:
            # Clean and append phone info
            cleaned_desc = original_desc.rstrip(" .")
            new_desc = f"{cleaned_desc}. للتواصل: 782611415 (+967782611415)."
            new_desc_tag = f'{match_desc.group(1)}{new_desc}{match_desc.group(3)}'
            content = content.replace(match_desc.group(0), new_desc_tag)
            print("  - Appended phone number to meta description")
    else:
        print("  - Meta description tag not found!")

    # 3. Update OG and Twitter descriptions to ensure the phone number shows on social media shares too
    og_desc_pattern = r'(<meta\s+property="og:description"\s+content=")([^"]*)("\s*/?>)'
    match_og = re.search(og_desc_pattern, content, re.IGNORECASE)
    if match_og:
        original_og = match_og.group(2)
        has_phone = any(p in original_og for p in ["782611415", "+967782611415"])
        if not has_phone:
            cleaned_og = original_og.rstrip(" .")
            new_og = f"{cleaned_og}. للتواصل: 782611415."
            new_og_tag = f'{match_og.group(1)}{new_og}{match_og.group(3)}'
            content = content.replace(match_og.group(0), new_og_tag)
            print("  - Appended phone number to OG description")

    twitter_desc_pattern = r'(<meta\s+name="twitter:description"\s+content=")([^"]*)("\s*/?>)'
    match_tw = re.search(twitter_desc_pattern, content, re.IGNORECASE)
    if match_tw:
        original_tw = match_tw.group(2)
        has_phone = any(p in original_tw for p in ["782611415", "+967782611415"])
        if not has_phone:
            cleaned_tw = original_tw.rstrip(" .")
            new_tw = f"{cleaned_tw}. للتواصل: 782611415."
            new_tw_tag = f'{match_tw.group(1)}{new_tw}{match_tw.group(3)}'
            content = content.replace(match_tw.group(0), new_tw_tag)
            print("  - Appended phone number to Twitter description")

    # 4. Update JSON-LD structured data telephone formats
    # Replace "telephone": "+967782611415" or similar with an array of variations
    telephone_pattern = r'"telephone"\s*:\s*"(\+?967\s*782\s*611\s*415|\+?967782611415)"'
    new_telephones = '"telephone": ["+967782611415", "0782611415", "782611415", "+967 782 611 415", "00967782611415"]'
    content, count = re.subn(telephone_pattern, new_telephones, content, flags=re.IGNORECASE)
    if count > 0:
        print(f"  - Updated JSON-LD telephone formats (Replaced {count} instances)")

    # Save changes
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

# Run the update on all files
for file in html_files:
    if os.path.exists(file):
        update_file_seo(file)
    else:
        print(f"File not found: {file}")

print("SEO update completed successfully!")
