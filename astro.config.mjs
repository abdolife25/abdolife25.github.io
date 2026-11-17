import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { rehypeLinks } from './src/lib/rehype-links.mjs';

export default defineConfig({
  site: 'https://www.voyagelo.com',
  // Blogger URLs end in .html; 'file' format writes /2024/05/x.html exactly.
  build: { format: 'file' },
  trailingSlash: 'never',
  // Pages are fetched in the background when a visitor points at a link, so clicks feel instant.
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  integrations: [sitemap({
    filter: (page) => !page.includes('/go/'),
    // Pages are written as /x.html, so list that exact URL (matches the canonical tag).
    serialize: (item) => {
      const u = new URL(item.url);
      if (u.pathname !== '/' && !u.pathname.endsWith('.html') && !u.pathname.endsWith('/')) item.url = u.origin + u.pathname + '.html';
      return item;
    },
  })],
  markdown: { rehypePlugins: [rehypeLinks] },
});
