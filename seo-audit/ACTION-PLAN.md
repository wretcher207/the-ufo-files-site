# SEO Action Plan — The UFO Files

Generated 2026-05-14 by claude-seo v1.9.9.

## DONE in this pass (verified in `dist/`)

| Priority | Fix | File(s) |
|---|---|---|
| HIGH | JSON-LD `WebSite` + `Organization` on every page | `src/layouts/Base.astro` |
| HIGH | JSON-LD `Article` + `BreadcrumbList` on dossier pages | `src/layouts/Base.astro`, `src/pages/dossier/[slug].astro` |
| HIGH | JSON-LD `CollectionPage` + `BreadcrumbList` on entity / thread / threads / timeline pages | `src/pages/entity/[slug].astro`, `src/pages/thread/[id].astro`, `src/pages/threads.astro`, `src/pages/timeline.astro` |
| HIGH | Eliminate trailing-slash 301 redirects | `astro.config.mjs` (`trailingSlash: 'never'`), `netlify.toml` (`pretty_urls = false`) |
| HIGH | `llms.txt` for AI search engines | `public/llms.txt` |
| HIGH | Dossier meta-description sanitization (prefer `summary` over `excerpt`, strip leading OCR quote/punctuation) | `src/pages/dossier/[slug].astro` |
| MEDIUM | Article `dateModified` (from `date_ingested`) | `src/pages/dossier/[slug].astro`, `src/layouts/Base.astro` |
| MEDIUM | Descriptive homepage `<title>` and `description` | `src/pages/index.astro` |
| MEDIUM | `og:locale`, `og:image:type`, `robots`, `author` meta | `src/layouts/Base.astro` |
| LOW | `Content-Security-Policy` header | `netlify.toml` |

After deploy, verify with:
- https://search.google.com/test/rich-results — should detect WebSite, Organization, Article, BreadcrumbList
- `curl -I https://the-ufo-files-site.netlify.app/dossier/guy-hottel-three-saucers-new-mexico-1950` — should now return 200 (not 301)
- https://www.google.com/search?q=site:the-ufo-files-site.netlify.app — recrawl over the next ~2 weeks

## Still pending

### Verify trailing-slash deploy
Before the next audit, confirm Netlify honors `pretty_urls = false` from `netlify.toml`. Some Netlify accounts default this in the dashboard UI to "on" with higher precedence. If after deploy `curl -I https://...netlify.app/dossier/guy-hottel-three-saucers-new-mexico-1950` still 301s, also toggle in Netlify dashboard: **Site settings → Build & deploy → Post processing → Asset optimization → Pretty URLs: OFF**.

### MEDIUM — Per-dossier OG images
Currently dossier pages already use the case hero image as `og:image`, but hero images are portrait 1200×1554 — social cards will letterbox or crop. A 1200×630 composition (hero + title overlay + brand frame) per dossier would lift social CTR significantly. The `og-image-gen` skill is installed and can do this. Estimated batch: 63 cases.

### MEDIUM — More entity / Person schemas
The CollectionPage schema is now wired for entity pages. If individual entities should rank as Persons / Places / Organizations themselves, add a per-entity `@type: Person | Place | Organization` block beside the CollectionPage. Needs an entity-type field in the entity data — not currently in the schema.

### LOW — AVIF / WebP image formats
Astro `<Image />` component can re-encode. Likely not worth it for an archive site where document fidelity matters and JPGs are already small. Revisit if Core Web Vitals show LCP regression.

### LOW — Google Search Console + PageSpeed
Configure API credentials so the next claude-seo audit can pull real field data:
```
python C:\Users\david\.claude\skills\seo\scripts\google_auth.py --setup
```

## Next audit

```
/seo audit https://the-ufo-files-site.netlify.app
```
or
```
python C:\Users\david\.claude\skills\seo\scripts\drift_baseline.py https://the-ufo-files-site.netlify.app
```
to capture a baseline now, then `drift_compare` after the changes deploy.
