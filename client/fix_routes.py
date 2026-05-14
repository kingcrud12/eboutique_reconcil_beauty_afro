import os
import re

replacements = [
    (r'"/boutique"', r'"/shop/products"'),
    (r"'/boutique'", r"'/shop/products'"),
    (r'`/boutique`', r'`/shop/products`'),
    (r'`/boutique/\$\{createSlug\(product\.category\)\}/\$\{createProductSlug\(product\.id, product\.name\)\}`', r'`/shop/product/${createSlug(product.category)}/${createProductSlug(product.id, product.name)}`'),
    (r'`/boutique/\$\{createSlug\(p\.category\)\}/\$\{createProductSlug\(p\.id, p\.name\)\}`', r'`/shop/product/${createSlug(p.category)}/${createProductSlug(p.id, p.name)}`'),
    (r'"/boutique/soins-cheveux"', r'"/shop/products/soins-cheveux"'),
    (r'"/boutique/soins-corps"', r'"/shop/products/soins-corps"'),
    (r'`/boutique/\$\{slug\}`', r'`/shop/products/${slug}`'),
    (r'"/aboutUs"', r'"/shop/about"'),
    (r'"/contact"', r'"/shop/contact"'),
    (r'"/account"', r'"/shop/account"'),
    (r'"/orders"', r'"/shop/orders"'),
    (r'"/login"', r'"/shop/login"'),
    (r'"/register"', r'"/shop/register"'),
    (r'"/cart"', r'"/shop/cart"'),
    (r'"/delivery"', r'"/shop/checkout"'),
    (r'"/prenez-un-rendez-vous-pour-une-coiffure-afro"', r'"/shop/services"'),
]

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    new_content = content
    for old, new in replacements:
        new_content = re.sub(old, new, new_content)
        
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))
