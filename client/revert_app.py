import re

filepath = 'src/App.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Replace path="shop/...
content = re.sub(r'path="shop/', 'path="', content)

with open(filepath, 'w') as f:
    f.write(content)
