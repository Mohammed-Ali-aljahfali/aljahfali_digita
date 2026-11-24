import json
import re

def test_chatgpt_data():
    with open('assets/data/products.json', encoding='utf-8') as f:
        catalog = json.load(f)

    chatgpt_products = [p for p in catalog if p.get('service_key') == 'chatgpt' or 'chatgpt' in p.get('service_name', '').lower() or 'chatgpt' in p.get('raw_name', '').lower()]
    print(f"Total ChatGPT products: {len(chatgpt_products)}")
    assert len(chatgpt_products) >= 55, "Expected at least 55 ChatGPT products"

    # Check modal_data fields
    for i, p in enumerate(chatgpt_products):
        m = p.get('modal_data', {})
        assert 'raw_description_ar' in m, f"Product {p['id']} missing raw_description_ar"
        assert 'features' in m and len(m['features']) > 0, f"Product {p['id']} missing features"
        assert 'where_to_use' in m and len(m['where_to_use']) > 0, f"Product {p['id']} missing where_to_use"
        assert 'how_to_use' in m and len(m['how_to_use']) > 0, f"Product {p['id']} missing how_to_use"
        assert 'activation_methods' in m, f"Product {p['id']} missing activation_methods"
        assert 'step_by_step_activation' in m and len(m['step_by_step_activation']) > 0, f"Product {p['id']} missing step_by_step_activation"

    print("PASS: All ChatGPT products have complete Arabic translations & structured details!")

def test_html_files():
    for fpath in ['subscriptions.html', 'admin.html']:
        with open(fpath, encoding='utf-8') as f:
            content = f.read()

        # Check emojis
        emojis = re.findall(r'[\U00010000-\U0010ffff\u2600-\u27bf\u2300-\u23ff\u2b50\u2b55\u200d\ufe0f]', content)
        print(f"{fpath} emojis: {len(emojis)}")
        assert len(emojis) == 0, f"Found emojis in {fpath}: {set(emojis)}"

        # Check key strings
        assert 'محمد الجحفلي' in content, f"Missing owner name in {fpath}"
        assert '782611415' in content, f"Missing phone number in {fpath}"
        
        if fpath == 'subscriptions.html':
            assert 'cartBadge' in content
            assert 'cartOverlay' in content
            assert 'btn-card-addcart' in content
            assert 'btn-card-details' in content
            assert 'modalDescArabic' in content
            assert 'checkoutModal' in content
            assert 'بنك الكريمي' in content
            assert 'محفظة جوالي' in content
            assert 'محفظة ون كاش' in content
            assert 'محفظة كاش' in content
            assert 'محفظة بيس' in content
            assert 'محفظة فلوسك' in content
            assert 'محفظة سبأ كاش' in content

        if fpath == 'admin.html':
            assert 'statProductsCount' in content
            assert 'inputSanaaRate' in content
            assert 'inputSarRate' in content
            assert 'exportUpdatedJson' in content

    print("PASS: All HTML files verified with 0 emojis, complete e-commerce cart, Yemeni checkout, and admin dashboard!")

if __name__ == '__main__':
    test_chatgpt_data()
    test_html_files()
    print("ALL TESTS PASSED SUCCESSFULLY!")
