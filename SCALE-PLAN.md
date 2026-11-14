# Voyagelo hosting and scale plan (decided 2026-11-14)

Goal: never migrate again. URLs, content and the domain stay fixed; only the layer underneath changes.

## Principles that make that possible
1. **Content is plain Markdown in Git.** No database, no platform lock-in. Any host or editor can use it.
2. **URLs never change.** Posts keep their Blogger paths (`/2024/05/name.html`). Any move goes through `public/_redirects`, the single source of truth. The build turns it into redirect pages (works on any host); Cloudflare can import it as real 301s.
3. **The domain's DNS sits at Cloudflare** (free) once we go live. Then the origin (where files are stored) can be swapped without visitors or Google noticing.
4. **Static first.** Anything dynamic runs as a scheduled job that writes JSON/Markdown and rebuilds the site, or as a third-party embed (email forms).

## Stages, with triggers
| Stage | Visits per month | Setup | Cost |
|---|---|---|---|
| Now | 0 to about 10,000 | GitHub Pages, built by GitHub Actions | $0 |
| Growth | about 10,000 to 50,000 | Same origin, plus Cloudflare proxy and caching in front. Images served from Cloudflare's cache, real 301 redirects, security headers | $0 |
| Scale | 50,000+ or you need server features | Swap the origin to Cloudflare Workers static assets (or another host). Move images to object storage if the repo nears 1 GB. URLs unchanged | $0 to about $5 per month |

Triggers to move up a stage (check monthly):
- Bandwidth: GitHub Pages has a soft limit of about 100 GB a month, a 1 GB published-site limit and 10 builds an hour (as far as I know; confirm in GitHub's current docs). At about 1 MB per page view, 100 GB is roughly 100,000 page views. Move to Growth well before that.
- Repo size above 600 MB: move images out of Git.
- Need for forms, logins, price lookups on request: add Workers functions at the Scale stage.

## What scales without a rebuild
- **Content volume:** Astro builds thousands of pages in a few minutes. Add Pagefind (free search) and paginate label pages past about 40 posts.
- **Editing:** Markdown files now. Later add a visual editor (Decap CMS or TinaCMS) that saves to the same repo.
- **Deals and prices:** a scheduled GitHub Action pulls partner data (for example Travelpayouts) into JSON and rebuilds daily.
- **Tools:** each calculator is a standalone page; add more under `/tools/`.
- **Email:** MailerLite embed or link; no server needed.

## Performance and SEO guardrails
- Images: max 1400 px wide, WebP, about 200 KB or less, lazy-loaded. Page weight under 1.5 MB.
- One H1 per page, canonical tag on every page, sitemap at `/sitemap-index.xml`.
- Never delete a URL without a redirect. Merged or removed posts go into `archive/` and `_redirects`.
- Change content in waves after the move so ranking changes can be traced.

## Risks and fixes
- **GitHub or Cloudflare unreachable from Egypt:** test before cutover; Cloudflare in front usually helps. Your visitors are US/EU/Canada, so this mostly affects previewing.
- **Blogger images vanish:** run the "Archive Blogger images" workflow once; images then live in the repo.
- **Public repo:** GitHub Pages on the free plan needs a public repo. Never commit passwords or API keys; use GitHub Secrets.
