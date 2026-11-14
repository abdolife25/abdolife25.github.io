# Voyagelo (Astro static site)

Converted from the Blogger export on 2026-11-10: 37 posts, 4 pages, same URL paths (`/2024/05/name.html`).

## Run locally
    npm install
    npm run dev        # http://localhost:4321
    npm run build      # output in dist/

## Hosting
GitHub Pages, built by GitHub Actions (`.github/workflows/deploy.yml`). See `SCALE-PLAN.md` for the growth plan.

## Go live (in this order)
1. Push to a GitHub repo named `<username>.github.io` (preview at that address). Settings > Pages > Source: GitHub Actions.
2. Run Actions > "Archive Blogger images into the repo" once. Then check the preview.
3. Replace the `YOUR_...` links in `public/tools/trip-budget-calculator.html` and set `emailSignupUrl` in `src/lib/site.ts`.
4. Put the domain's DNS on Cloudflare, point `www.voyagelo.com` at GitHub Pages, add a file `public/CNAME` containing `www.voyagelo.com`, turn on HTTPS.
5. Keep Blogger until Search Console shows the new pages indexed.

## Content
- Posts: `src/content/posts/*.md`; pages: `src/content/pages/*.md`. Each file has `path:` (its public URL) in the header.
- Affiliate links (CJ, Travelpayouts, Partnerize and others) are marked `rel="sponsored"` automatically (`src/lib/rehype-links.mjs`).
- Image alt text was auto-filled from the nearest heading. Rewrite it per image over time.
