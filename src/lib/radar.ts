// Build-time data for the Trip Cost Radar. Everything comes from our own trip-cost guides (their tables and text),
// so the numbers on the Radar always match the guide headlines. Nothing is invented.
import { placeOf, regionOf } from './site';

export type Range = [number, number];
export interface Cat { tight: Range; mid: Range }
export interface Dest {
  key: string; place: string; labelPlace: string; region: string; guide: string; image: string;
  cats: Record<'stay' | 'food' | 'move' | 'sights' | 'intercity', Cat | null>;
  total: Cat; day: Cat; tips: string[]; related: { title: string; href: string }[];
}

const num = (s: string) => Number(s.replace(/,/g, ''));
// "$145–215" -> [145,215]; "about $95" -> [95,95]; "about $2,000–3,000" ok
export function parseRange(cell: string): Range | null {
  const m = [...cell.replace(/\*/g, '').matchAll(/\$?\s*([\d,]+(?:\.\d+)?)/g)].map((x) => num(x[1]));
  if (!m.length) return null;
  return [m[0], m[1] ?? m[0]];
}
const rows = (md: string, header: RegExp) => {
  const lines = md.split('\n'); const i = lines.findIndex((l) => header.test(l));
  if (i < 0) return [];
  const out: string[][] = [];
  for (let j = i + 2; j < lines.length && lines[j].startsWith('|'); j++) out.push(lines[j].split('|').slice(1, -1).map((c) => c.trim()));
  return out;
};
const sentences = (p: string) => p.replace(/\*/g, '').replace(/\s+/g, ' ').split(/(?<=[.!?])\s+(?=[A-Z])/).map((s) => s.trim()).filter(Boolean);
const plain = (p: string) => p.replace(/\*\*?/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\s+/g, ' ').trim();

export function parseDest(post: any, all: any[]): Dest | null {
  const d = post.data; const body: string = post.body ?? '';
  const place = placeOf(d.labels);
  const kind = (label: string) =>
    /→/.test(label) ? 'intercity' : /^beds/i.test(label) ? 'stay' : /^food/i.test(label) ? 'food' : /sights/i.test(label) ? 'sights' : /^total/i.test(label.replace(/\*/g, '')) ? 'total' : 'move';
  const cats: Dest['cats'] = { stay: null, food: null, move: null, sights: null, intercity: null };
  let total: Cat | null = null;
  for (const r of rows(body, /^\| Cost \(/)) {
    const k = kind(r[0]); const t = parseRange(r[1]), m = parseRange(r[2]);
    if (!t || !m) continue;
    if (k === 'total') total = { tight: t, mid: m };
    else cats[k as keyof Dest['cats']] = { tight: t, mid: m };
  }
  let day: Cat | null = null;
  for (const r of rows(body, /^\| \| Tight budget \| Mid-range \|/)) {
    if (/per day/i.test(r[0])) { const t = parseRange(r[1]), m = parseRange(r[2]); if (t && m) day = { tight: t, mid: m }; }
  }
  if (!total || !day || !cats.stay || !cats.food) return null;
  // sanity: categories must add up to the guide's own total (within $2 rounding)
  const sum = (s: 'tight' | 'mid', i: 0 | 1) => Object.values(cats).reduce((a, c) => a + (c ? c[s][i] : 0), 0);
  for (const s of ['tight', 'mid'] as const) for (const i of [0, 1] as const) if (Math.abs(sum(s, i) - total[s][i]) > 3) console.warn(`[radar] ${place}: ${s}[${i}] parts ${sum(s, i)} vs total ${total[s][i]}`);

  const cheap = body.split(/^## Cheapest time to go\s*$/m)[1]?.split(/^## /m)[0] ?? '';
  const tips = sentences(plain(cheap.split(/\n\s*\n/).find((p) => p.trim() && !p.startsWith('|') && !p.startsWith('<')) ?? '')).slice(0, 2);

  const related = all.filter((x) => x.id !== post.id && x.data.labels.includes(place) && !/-trip-cost\.html$/.test(x.data.path))
    .sort((a, b) => +b.data.pubDate - +a.data.pubDate).slice(0, 4).map((x) => ({ title: x.data.title, href: x.data.path }));
  return {
    key: d.path.replace(/^\/|-trip-cost\.html$/g, ''), place: d.path.replace(/^\/|-trip-cost\.html$/g, '').split('-').map((w: string) => w[0].toUpperCase() + w.slice(1)).join(' '), region: regionOf(d.labels), guide: d.path, image: d.heroImage ?? '',
    labelPlace: place, cats, total, day, tips, related,
  };
}
