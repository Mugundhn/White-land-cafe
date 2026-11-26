"""Trim the White Land logo, turn its white background transparent, and write dark / white / icon variants."""
from PIL import Image, ImageChops
import numpy as np

src = Image.open('D:/Nov/assets/white-land-logo.png').convert('RGB')
a = np.asarray(src).astype(float)
# darkness -> alpha (logo ink is ~#383838 on white); keeps anti-aliased edges smooth
lum = a.mean(axis=2)
alpha = np.clip((255 - lum) / (255 - 56), 0, 1)
ink = np.zeros_like(a); ink[..., :] = (56, 56, 56)
rgba = np.dstack([ink, alpha * 255]).astype('uint8')
img = Image.fromarray(rgba, 'RGBA')
bbox = img.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
pad = 6
bbox = (max(0, bbox[0] - pad), max(0, bbox[1] - pad), bbox[2] + pad, bbox[3] + pad)
img = img.crop(bbox)
H = 900
img = img.resize((round(img.width * H / img.height), H), Image.LANCZOS)
img.save('D:/Nov/assets/logo-dark.png', optimize=True)

white = Image.new('RGBA', img.size, (255, 255, 255, 0))
white.putalpha(img.getchannel('A'))
white.save('D:/Nov/assets/logo-white.png', optimize=True)

# square icon (favicon / touch icon): logo centred on the cream paper colour
S = 512
icon = Image.new('RGBA', (S, S), (245, 245, 242, 255))
h = int(S * 0.72)
lg = img.resize((round(img.width * h / img.height), h), Image.LANCZOS)
icon.alpha_composite(lg, ((S - lg.width) // 2, (S - lg.height) // 2))
icon.convert('RGB').save('D:/Nov/assets/icon-512.png', optimize=True)
icon.resize((64, 64), Image.LANCZOS).convert('RGB').save('D:/Nov/assets/favicon-64.png', optimize=True)
print(img.size, lg.size)
