import io, urllib.request
from PIL import Image
url = 'https://d2ncjxd2rk2vpl.cloudfront.net/whiteland/product/60398522277e070006ec7c06/40f2e0ce-60e8-4bc1-b4ac-b75ef934e1b0'
im = Image.open(io.BytesIO(urllib.request.urlopen(url, timeout=60).read())).convert('RGB')
print('original', im.size)
im.thumbnail((2400, 2400), Image.LANCZOS)
im.save('D:/Nov/site/public/hero-long-black.jpg', quality=84, optimize=True, progressive=True)
print('saved', im.size)
