import { getCollection } from 'astro:content';
import { cardData } from '../lib/site';
export async function GET() {
  const posts = (await getCollection('posts')).sort((a, b) => +b.data.pubDate - +a.data.pubDate);
  const items = posts.map((p) => { const c = cardData(p); return { t: c.title, u: c.href, p: c.place, r: c.region, k: c.type, d: c.description }; });
  return new Response(JSON.stringify(items), { headers: { 'Content-Type': 'application/json' } });
}
