// Pulls the cheapest CACHED round-trip fare (Aviasales data via Travelpayouts) for each origin -> destination pair
// and writes public/data/fares.json. Cached fares are searches other travelers made in the last few days: a guide
// to what is cheap, not a live quote. The site labels them that way. Needs TRAVELPAYOUTS_TOKEN.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const cfg = JSON.parse(readFileSync(new URL('./fares-config.json', import.meta.url)));
const token = process.env.TRAVELPAYOUTS_TOKEN;
if (!token) { console.error('TRAVELPAYOUTS_TOKEN is not set'); process.exit(1); }
const base = process.env.FARES_API || 'https://api.travelpayouts.com/aviasales/v3/prices_for_dates';
const out = { updated: new Date().toISOString().slice(0, 10), currency: 'usd', origins: cfg.origins, fares: {} };
let ok = 0, miss = 0;
for (const o of Object.keys(cfg.origins)) {
  out.fares[o] = {};
  for (const [key, code] of Object.entries(cfg.dests)) {
    if (code === o) continue;
    const u = `${base}?origin=${o}&destination=${code}&one_way=false&currency=usd&sorting=price&limit=1&unique=false`;
    try {
      const r = await fetch(u, { headers: { 'X-Access-Token': token } });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const j = await r.json(); const f = j?.data?.[0];
      if (f && Number(f.price) > 0) { out.fares[o][key] = { price: Math.round(Number(f.price)), depart: (f.departure_at || '').slice(0, 10), back: (f.return_at || '').slice(0, 10), airline: f.airline || '' }; ok++; }
      else miss++;
    } catch (e) { miss++; console.warn(`${o}->${code}: ${e.message}`); }
    await new Promise((r) => setTimeout(r, 250));
  }
}
console.log(`fares found ${ok}, missing ${miss}`);
if (ok < 10) { console.error('Too few fares came back; keeping the previous file.'); process.exit(1); }
mkdirSync(new URL('../public/data/', import.meta.url), { recursive: true });
writeFileSync(new URL('../public/data/fares.json', import.meta.url), JSON.stringify(out));
