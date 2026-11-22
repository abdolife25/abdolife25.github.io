import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const shape = z.object({
  title: z.string(),
  seoTitle: z.string().optional(),
  description: z.string(),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  labels: z.array(z.string()).default([]),
  path: z.string(),
  oldPath: z.string().optional(),
  heroImage: z.string().optional(),
});
const gen = ({ entry }: { entry: string }) => entry.replace(/\.md$/, '');
export const collections = {
  posts: defineCollection({ loader: glob({ pattern: '**/*.md', base: './src/content/posts', generateId: gen }), schema: shape }),
  pages: defineCollection({ loader: glob({ pattern: '**/*.md', base: './src/content/pages', generateId: gen }), schema: shape }),
};
