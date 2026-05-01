import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Replace /shop/something with /something
    # Be careful not to replace /shop/product with /product if we don't want it, but we DO want it.
    new_content = re.sub(r'([\'"`])/shop/', r'\1/', content)
    
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))
