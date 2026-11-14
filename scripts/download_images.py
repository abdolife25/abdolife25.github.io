"""Download the Blogger-hosted images into public/images and rewrite the posts.
Run this once on a computer with normal internet access:
    pip install pillow requests
    python scripts/download_images.py
Then run: npm run build
Images are resized to max 1400px and saved as WebP. Failed downloads keep their original link.
"""
import re, glob, hashlib, os, io, sys
import requests
from PIL import Image

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "images")
os.makedirs(OUT, exist_ok=True)
pat = re.compile(r'https://blogger\.googleusercontent\.com/[^\s)"\']+')
cache, ok, fail = {}, 0, 0
for f in glob.glob(os.path.join(os.path.dirname(__file__), "..", "src", "content", "*", "*.md")):
    text = open(f, encoding="utf-8").read()
    def repl(m):
        global ok, fail
        url = m.group(0)
        if url in cache:
            return cache[url]
        # ask for a large rendition: replace =wNNN-hNNN or /wNNN-hNNN/ with =w1400
        big = re.sub(r'=w\d+-h\d+.*$', '=w1400', url)
        big = re.sub(r'/w\d+-h\d+/', '/w1400/', big)
        name = hashlib.md5(url.split('=')[0].encode()).hexdigest()[:12] + ".webp"
        try:
            r = requests.get(big, timeout=30); r.raise_for_status()
            im = Image.open(io.BytesIO(r.content)); im.thumbnail((1400, 1400))
            im = im.convert("RGB") if im.mode not in ("RGB", "RGBA") else im
            im.save(os.path.join(OUT, name), "WEBP", quality=80)
            cache[url] = f"/images/{name}"; ok += 1
        except Exception as e:
            print("FAILED", url[:80], e, file=sys.stderr); cache[url] = url; fail += 1
        return cache[url]
    new = pat.sub(repl, text)
    if new != text:
        open(f, "w", encoding="utf-8").write(new)
print(f"downloaded {ok}, failed {fail}")
