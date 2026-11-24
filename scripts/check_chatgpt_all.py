import json

with open('canboso_products.json', encoding='utf-8') as f:
    raw_data = json.load(f)

raw_products = raw_data.get('products', [])
print(f"Total raw products: {len(raw_products)}")

with open('assets/data/products.json', encoding='utf-8') as f:
    catalog = json.load(f)

print(f"Total catalog products: {len(catalog)}")

# Find all ChatGPT in catalog
cat_chatgpt = [p for p in catalog if p.get('service_id') == 'chatgpt' or 'chatgpt' in p.get('service_name', '').lower() or 'chatgpt' in p.get('raw_name', '').lower()]
print(f"Catalog ChatGPT products: {len(cat_chatgpt)}")

# Let's inspect the raw names of all 55+ ChatGPT products
for i, p in enumerate(raw_products):
    name = p.get('name', '')
    desc = p.get('description', '')
    if any(k in name.lower() for k in ['chatgpt', 'openai', 'gpt', 'dall-e', 'sora']):
        avail = p.get('availability', {})
        stock = avail.get('stock', 0) if isinstance(avail, dict) else 0
        price = p.get('price', {}).get('amount', 0) if isinstance(p.get('price'), dict) else 0
        print(f"[{i+1}] ID: {p.get('productId')} | Stock: {stock} | Price: ${price} | Name: {name[:80]}")
