# Voyagelo (Astro static site)

Converted from the Blogger export on 2026-11-10: 37 posts, 4 pages, same URL paths (`/2024/05/name.html`).

## Run locally
    npm install
    npm run dev        # http://localhost:4321
    npm run build      # output in dist/

## Before going live (in this order)
1. `python scripts/download_images.py` on a computer with internet access. About 330 images still point to Blogger's image host; this copies them into the site.
2. Add your real affiliate links to `public/tools/trip-budget-calculator.html` (search `YOUR_`) and set `emailSignupUrl` in `src/lib/site.ts`.
3. Deploy to a **preview URL first** and check that `/2024/08/top-10-cheapest-destinations.html` opens without redirecting. Netlify and GitHub Pages serve `.html` paths as they are. Cloudflare Pages removes `.html` from URLs, so on Cloudflare use Workers static assets with HTML handling set to "none", or accept redirects.
4. `public/_redirects` holds the old-URL redirects (Netlify and Cloudflare syntax). On GitHub Pages it does nothing.
5. Point DNS for `www.voyagelo.com` only after step 3 passes. Keep the Blogger blog until you confirm Google Search Console shows the new pages indexed.

## Content
- Posts: `src/content/posts/*.md`; pages: `src/content/pages/*.md`. Each file has `path:` (its public URL) in the header.
- Affiliate links (CJ, Travelpayouts, Partnerize and others) are marked `rel="sponsored"` automatically (`src/lib/rehype-links.mjs`).
- Image alt text was auto-filled from the nearest heading. Rewrite it per image over time.
