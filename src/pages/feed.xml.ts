import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
export async function GET(context: any) {
  const posts = (await getCollection('posts')).sort((a, b) => +b.data.pubDate - +a.data.pubDate);
  return rss({
    title: 'Voyagelo',
    description: 'Budget travel guides, trip costs and booking tips',
    site: context.site,
    items: posts.map((p) => ({ title: p.data.title, pubDate: p.data.pubDate, description: p.data.description, link: p.data.path })),
  });
}
