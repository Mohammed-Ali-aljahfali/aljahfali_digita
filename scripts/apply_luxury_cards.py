import re

with open('subscriptions.html', encoding='utf-8') as f:
    text = f.read()

# 1. Update .card-icon-frame and img styles
old_icon_css = r'''.card-icon-frame {
      width: 76px;
      height: 76px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 14px;
      box-sizing: border-box;
      box-shadow: 0 6px 14px rgba(0,0,0,0.08);
      transition: transform 0.2s ease;
    }

    .clean-store-card:hover .card-icon-frame {
      transform: scale(1.05);
    }

    .card-icon-frame img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.12));
    }'''

new_icon_css = r'''.card-icon-frame {
      width: 86px;
      height: 86px;
      border-radius: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      box-sizing: border-box;
      box-shadow: 0 10px 24px -4px rgba(0,0,0,0.18), inset 0 1px 1px rgba(255,255,255,0.3);
      border: 1px solid rgba(255, 255, 255, 0.25);
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease;
    }

    .clean-store-card:hover .card-icon-frame {
      transform: scale(1.08) translateY(-2px);
      box-shadow: 0 16px 30px -4px rgba(0,0,0,0.25);
    }

    .card-icon-frame img {
      width: 52px;
      height: 52px;
      object-fit: contain;
      filter: brightness(0) invert(1) drop-shadow(0 4px 8px rgba(0,0,0,0.35));
    }'''

if old_icon_css in text:
    text = text.replace(old_icon_css, new_icon_css)
    print("Replaced icon CSS successfully!")
else:
    print("Old icon CSS not found verbatim, applying regex replace...")
    text = re.sub(r'\.card-icon-frame\s*\{[^}]+\}', new_icon_css.split('\n\n')[0], text)
    text = re.sub(r'\.card-icon-frame img\s*\{[^}]+\}', r'''.card-icon-frame img {
      width: 52px;
      height: 52px;
      object-fit: contain;
      filter: brightness(0) invert(1) drop-shadow(0 4px 8px rgba(0,0,0,0.35));
    }''', text)

# 2. Update button styles in CSS
old_btn_css = r'''.card-actions-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: auto;
    }

    .btn-card-details, .btn-card-addcart {
      padding: 10px;
      border-radius: 10px;
      font-family: 'Cairo', sans-serif;
      font-size: 13px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      cursor: pointer;
      transition: all 0.15s ease;
      box-sizing: border-box;
      border: none;
    }

    .btn-card-details {
      background: #FFFFFF;
      border: 1px solid #CBD5E1;
      color: #0F172A;
    }

    .btn-card-details:hover {
      background: #F0F9FF;
      border-color: #0284C7;
      color: #0284C7;
    }

    .btn-card-addcart {
      background: #0284C7;
      color: #FFFFFF;
    }

    .btn-card-addcart:hover {
      background: #0369A1;
      box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);
    }

    .btn-card-addcart.added {
      background: #10B981;
    }'''

new_btn_css = r'''.card-actions-col {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: auto;
      width: 100%;
    }

    .btn-card-addcart {
      width: 100%;
      padding: 11px 16px;
      border-radius: 12px;
      font-family: 'Cairo', sans-serif;
      font-size: 14px;
      font-weight: 800;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
      background: linear-gradient(135deg, #0284C7 0%, #0369A1 100%);
      color: #FFFFFF;
      border: none;
      box-shadow: 0 4px 12px rgba(2, 132, 199, 0.22);
      transition: all 0.2s ease;
      box-sizing: border-box;
      white-space: nowrap;
    }

    .btn-card-addcart:hover {
      background: linear-gradient(135deg, #0369A1 0%, #075985 100%);
      box-shadow: 0 6px 16px rgba(2, 132, 199, 0.35);
      transform: translateY(-1px);
    }

    .btn-card-addcart.added {
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }

    .btn-card-details {
      width: 100%;
      padding: 9px 16px;
      border-radius: 12px;
      font-family: 'Cairo', sans-serif;
      font-size: 13px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      cursor: pointer;
      background: #FFFFFF;
      color: #475569;
      border: 1px solid #CBD5E1;
      transition: all 0.2s ease;
      box-sizing: border-box;
      white-space: nowrap;
    }

    .btn-card-details:hover {
      background: #F0F9FF;
      border-color: #0284C7;
      color: #0284C7;
    }'''

if old_btn_css in text:
    text = text.replace(old_btn_css, new_btn_css)
    print("Replaced button CSS successfully!")
else:
    print("Old button CSS not found verbatim, applying regex replace...")
    text = re.sub(r'\.card-actions-grid\s*\{[^}]+\}', '', text)
    text = text.replace('.btn-card-details, .btn-card-addcart {', new_btn_css + '\n/* old deleted */ .dummy {')

# 3. Update createCleanCard in JS
old_card_html = r'''        <div class="card-actions-grid">
          <button class="btn-card-details" onclick="openProductModal('${p.id}')">
            ${detailsSvg}
            <span>عرض التفاصيل</span>
          </button>
          <button class="btn-card-addcart" id="btnCart_${p.id}" onclick="addToCart('${p.id}')">
            ${cartSvg}
            <span>إضافة إلى السلة</span>
          </button>
        </div>'''

new_card_html = r'''        <div class="card-actions-col">
          <button class="btn-card-addcart" id="btnCart_${p.id}" onclick="addToCart('${p.id}')">
            ${cartSvg}
            <span>إضافة إلى السلة</span>
          </button>
          <button class="btn-card-details" onclick="openProductModal('${p.id}')">
            ${detailsSvg}
            <span>عرض تفاصيل الاشتراك</span>
          </button>
        </div>'''

if old_card_html in text:
    text = text.replace(old_card_html, new_card_html)
    print("Replaced card action HTML successfully!")
else:
    print("Old card HTML not found verbatim, checking variants...")
    text = text.replace('class="card-actions-grid"', 'class="card-actions-col"')

with open('subscriptions.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("Finished updating subscriptions.html with luxury cards and crystal clear icons!")
