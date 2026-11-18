// Makes small card thumbnails (public/images/t/) from every image in public/images.
import { readdir, mkdir, access } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const dir = path.join(root, 'public', 'images');
const out = path.join(dir, 't');
await mkdir(out, { recursive: true });
let n = 0;
for (const f of await readdir(dir)) {
  if (!/\.(webp|jpe?g|png)$/i.test(f)) continue;
  const dest = path.join(out, f);
  if (await access(dest).then(() => true, () => false)) continue;
  try { await sharp(path.join(dir, f)).resize({ width: 640, height: 400, fit: "cover", position: "attention", withoutEnlargement: true }).webp({ quality: 72 }).toFile(dest); n++; }
  catch (e) { console.warn('thumb failed', f, String(e.message || e)); }
}
console.log(`thumbnails made: ${n}`);
