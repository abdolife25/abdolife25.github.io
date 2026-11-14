// Turns public/_redirects into static redirect pages so redirects work on hosts
// without a redirect file (GitHub Pages). Also writes /sitemap.xml for old Blogger links.
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const dist = path.join(root, 'dist');
const rules = (await readFile(path.join(root, 'public', '_redirects'), 'utf8'))
  .split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))
  .map((l) => l.split(/\s+/));
const site = 'https://www.voyagelo.com';
let n = 0;
for (const [from, to] of rules) {
  if (from.includes('*') || from === '/sitemap.xml') continue;
  const dest = decodeURIComponent(from);
  const file = path.join(dist, dest.endsWith('.html') ? dest : dest + '.html');
  const target = to.startsWith('http') ? to : site + to;
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Moved</title><meta name="robots" content="noindex"><link rel="canonical" href="${target}"><meta http-equiv="refresh" content="0; url=${target}"></head><body><p>This page moved to <a href="${target}">${target}</a>.</p></body></html>\n`;
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, html);
  n++;
}
await copyFile(path.join(dist, 'sitemap-index.xml'), path.join(dist, 'sitemap.xml')).catch(() => {});
console.log(`redirect pages written: ${n}`);
