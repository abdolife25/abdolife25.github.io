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
  integrations: [sitemap()],
  markdown: { rehypePlugins: [rehypeLinks] },
});
