// Downloads Blogger-hosted images into public/images and rewrites the Markdown links.
// Runs during the Netlify build (which has internet access). Failures keep the original link.
import { readdir, readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const out = path.join(root, 'public', 'images');
await mkdir(out, { recursive: true });
const pat = /https:\/\/[a-z0-9.-]*googleusercontent\.com\/[^\s)"']+/g;
const files = [];
for (const dir of ['posts', 'pages']) {
  const d = path.join(root, 'src', 'content', dir);
  for (const f of await readdir(d)) if (f.endsWith('.md')) files.push(path.join(d, f));
}
const texts = new Map(await Promise.all(files.map(async (f) => [f, await readFile(f, 'utf8')])));
const urls = new Set();
for (const t of texts.values()) for (const u of t.match(pat) ?? []) urls.add(u);

const map = new Map();
let ok = 0, fail = 0;
const exists = (p) => access(p).then(() => true, () => false);
async function one(url) {
  const big = url.replace(/=w\d+-h\d+.*$/, '=w1400').replace(/\/w\d+-h\d+\//, '/w1400/');
  const name = createHash('md5').update(url.split('=')[0]).digest('hex').slice(0, 12) + '.webp';
  const dest = path.join(out, name);
  try {
    if (!(await exists(dest))) {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 30000);
      const r = await fetch(big, { signal: ctl.signal });
      clearTimeout(timer);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const buf = Buffer.from(await r.arrayBuffer());
      await sharp(buf).resize({ width: 1400, height: 1400, fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toFile(dest);
    }
    map.set(url, '/images/' + name); ok++;
  } catch (e) {
    console.warn('image kept remote:', url.slice(0, 70), String(e.message || e)); fail++;
  }
}
const list = [...urls];
for (let i = 0; i < list.length; i += 8) await Promise.all(list.slice(i, i + 8).map(one));
for (const [f, t] of texts) {
  const n = t.replace(pat, (u) => map.get(u) ?? u);
  if (n !== t) await writeFile(f, n);
}
console.log(`images: ${ok} downloaded or cached, ${fail} kept remote, ${urls.size} total`);
