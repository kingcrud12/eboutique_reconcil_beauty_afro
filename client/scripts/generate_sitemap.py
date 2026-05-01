import urllib.request
import json
import re
import os

SITE_URL = 'https://reconcil-afro-beauty.com'
API_URL = 'https://eboutique-reconcil-beauty-afro.onrender.com/reconcil/api/shop/products'

def create_slug(text):
    if not text: return "categorie"
    import unicodedata
    text = unicodedata.normalize('NFD', text.lower())
    text = re.sub(r'[\u0300-\u036f]', '', text)
    text = re.sub(r'[^a-z0-9]+', '-', text)
    text = re.sub(r'(^-|-$)+', '', text)
    return text

def create_product_slug(id, name):
    if not name: return str(id)
    return f"{create_slug(name)}-{id}"

static_routes = [
    '/', '/products', '/products/soins-cheveux', '/products/soins-corps',
    '/about', '/contact', '/services', '/login', '/register'
]

xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

for r in static_routes:
    xml += f"  <url>\n    <loc>{SITE_URL}{r}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>{'1.0' if r == '/' else '0.8'}</priority>\n  </url>\n"

try:
    req = urllib.request.Request(API_URL, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        products = json.loads(response.read().decode())
        for p in products:
            c_slug = create_slug(p.get('category', ''))
            p_slug = create_product_slug(p.get('id'), p.get('name', ''))
            xml += f"  <url>\n    <loc>{SITE_URL}/product/{c_slug}/{p_slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n"
except Exception as e:
    print("Error fetching dynamic products:", e)

xml += '</urlset>'

with open('public/sitemap.xml', 'w') as f:
    f.write(xml)
print("Generated public/sitemap.xml")
