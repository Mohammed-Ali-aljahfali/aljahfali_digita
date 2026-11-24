import json

with open('canboso_products.json', encoding='utf-8') as f:
    data = json.load(f)

if isinstance(data, dict):
    print("Keys in canboso_products.json:", list(data.keys()))
    products = data.get('data') or data.get('products') or data.get('items') or []
elif isinstance(data, list):
    products = data
else:
    products = []

print("Total products:", len(products))
if products:
    sample = products[0]
    print("Sample product keys:", list(sample.keys()) if isinstance(sample, dict) else sample)

# Find all ChatGPT/OpenAI products
chatgpt_products = []
for p in products:
    name = (p.get('name') or p.get('title') or '').lower()
    cat = (p.get('category') or '').lower()
    desc = (p.get('description') or '').lower()
    if 'chatgpt' in name or 'openai' in name or 'gpt' in name or 'chatgpt' in cat:
        chatgpt_products.append(p)

print(f"Total ChatGPT / OpenAI products found: {len(chatgpt_products)}")
for i, p in enumerate(chatgpt_products[:5]):
    print(f"[{i+1}] ID: {p.get('id')} | Name: {p.get('name')} | Category: {p.get('category')}")
    print(f"    Price: {p.get('price')} | Stock: {p.get('stock')} | Warranty: {p.get('warranty')}")
    print(f"    Raw Description: {p.get('description')[:120] if p.get('description') else 'None'}...")
