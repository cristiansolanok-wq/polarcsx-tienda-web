from html.parser import HTMLParser
from pathlib import Path
import json

html = Path(r'c:\Users\Crist\OneDrive\Desktop\proyectos\index.html').read_text(encoding='utf-8')

class ProductParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.products = []
        self.current = None
        self.stack = []
        self.capture = None
        self.data = ''
        self.section = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.stack.append(tag)
        if tag == 'div' and 'product-card' in attrs.get('class', ''):
            self.current = {
                'id': attrs.get('data-product-id', '').strip(),
                'category': attrs.get('data-category', '').strip(),
                'title': '',
                'subtitle': '',
                'price': None,
                'imageSrc': '',
                'description': '',
                'note': ''
            }
            self.capture = None
            self.data = ''
            self.section = []
        if self.current is None:
            return
        if tag == 'img' and self.capture is None and self.stack and self.stack[-2:] and self.stack[-2] == 'div':
            # inside product-summary, assign image if present
            self.current['imageSrc'] = attrs.get('src', '').strip()
        if tag == 'h3':
            self.capture = 'title'
            self.data = ''
        elif tag == 'p' and 'product-subtitle' in attrs.get('class', ''):
            self.capture = 'subtitle'
            self.data = ''
        elif tag == 'p' and 'price' in attrs.get('class', ''):
            self.capture = 'price'
            self.data = ''
        elif tag == 'p' and 'description' in attrs.get('class', ''):
            self.capture = 'description'
            self.data = ''
        elif tag == 'small':
            self.capture = 'note'
            self.data = ''

    def handle_endtag(self, tag):
        if self.current is None:
            if self.stack:
                self.stack.pop()
            return
        if self.capture and tag in ('h3', 'p', 'small'):
            value = self.data.strip()
            if self.capture == 'price':
                self.current['price'] = value
            elif self.capture in ('description', 'note'):
                existing = self.current.get(self.capture, '')
                if existing:
                    existing += ' '
                self.current[self.capture] = (existing + value).strip()
            else:
                self.current[self.capture] = value
            self.capture = None
            self.data = ''
        if tag == 'div' and self.stack:
            self.stack.pop()
            if self.current and not self.stack:
                pass
        if tag == 'div' and self.current and self.stack and self.stack[-1] == 'div' and self.current.get('id'):
            # crude: not reliable
            pass
        if tag == 'div' and self.current and self.stack and len(self.stack) == 0:
            pass
        if tag == 'div' and self.current and self.stack:
            pass

    def handle_data(self, data):
        if self.current is None or self.capture is None:
            return
        self.data += data

    def error(self, message):
        pass

parser = ProductParser()
parser.feed(html)
products = [p for p in parser.products if p['id']]

# Fallback: if parser fails, use regex extraction
if not products:
    import re
    cards = re.split(r'(?=<div class="product-card" )', html)
    for card in cards:
        if 'product-card' not in card:
            continue
        pid = re.search(r'data-product-id="([^"]+)"', card)
        cat = re.search(r'data-category="([^"]+)"', card)
        img = re.search(r'<img[^>]*src="([^"]+)"', card)
        title = re.search(r'<h3>(.*?)</h3>', card, re.S)
        subtitle = re.search(r'<p class="product-subtitle">(.*?)</p>', card, re.S)
        price = re.search(r'<p class="price">\s*(.*?)\s*</p>', card, re.S)
        desc = re.search(r'<p class="description">(.*?)</p>', card, re.S)
        note = re.search(r'<p><small><em>(.*?)</em></small></p>', card, re.S)
        description = ''
        if desc:
            description = re.sub(r'<[^>]+>', '', desc.group(1)).strip()
        if not description:
            desc2 = re.search(r'<div class="details-content">(.*?)<button class="buy-btn"', card, re.S)
            if desc2:
                description = re.sub(r'<[^>]+>', '', desc2.group(1)).strip()
        product = {
            'id': pid.group(1) if pid else '',
            'category': cat.group(1) if cat else '',
            'title': title.group(1).strip() if title else '',
            'subtitle': subtitle.group(1).strip() if subtitle else '',
            'price': price.group(1).strip() if price else '',
            'imageSrc': img.group(1).strip() if img else '',
            'description': description,
            'note': note.group(1).strip() if note else ''
        }
        if product['id']:
            products.append(product)

json_path = Path(r'c:\Users\Crist\OneDrive\Desktop\proyectos\productos.json')
json_path.write_text(json.dumps(products, indent=2, ensure_ascii=False), encoding='utf-8')
print(f'Wrote {len(products)} products to {json_path}')
