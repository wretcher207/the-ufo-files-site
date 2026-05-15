# The UFO Files — Full SEO Audit Report

**URL:** https://the-ufo-files-site.netlify.app/
**Audit date:** 2026-05-14
**Tool:** claude-seo v1.9.9 (AgriciDaniel/claude-seo)

## Executive Summary

**SEO Health Score: 72 / 100**

The site has strong fundamentals — clean HTML, accessible markup, semantic structure, view transitions, real content, valid sitemap, decent security headers. The biggest losses are around AI-search readiness (no structured data, no llms.txt) and a self-inflicted trailing-slash 301 redirect chain on every internal click.

### Top 5 critical / high issues

1. **HIGH — Trailing-slash 301 on every internal link.** Internal links are written as `/dossier/slug`, but Netlify Pretty URLs redirects (301) to `/dossier/slug/`. Every internal click costs a round-trip and burns crawl budget. (Fixed in this audit.)
2. **HIGH — No JSON-LD structured data anywhere.** No `WebSite`, `Organization`, `BreadcrumbList`, or `Article` schema. This is the #1 thing AI search engines (Perplexity, ChatGPT Search, Gemini) and Google AI Overviews look for. (Fixed in this audit.)
3. **HIGH — No `llms.txt`.** This is the emerging convention for telling LLMs how to read the site. For an archive-style citation source, this is a real miss. (Fixed in this audit.)
4. **MEDIUM — Dossier `<meta name="description">` is auto-generated from body text and often starts with a stray quote / OCR fragment.** Example: `"&#34; It now appears in primary OCR'd form...`. Crawlers and AI summarizers will use this. Needs front-matter `excerpt` filled in, or improve fallback.
5. **MEDIUM — No `og:locale`, no `<meta name="robots">`, no `<meta name="author">`.** Easy wins. (Fixed in this audit.)

### Top 5 quick wins (also fixed)

1. JSON-LD `WebSite` + `Organization` on every page via `Base.astro`.
2. JSON-LD `Article` + `BreadcrumbList` on dossier pages.
3. `public/llms.txt` written.
4. `trailingSlash: 'never'` + `build.format: 'file'` so internal hrefs no longer redirect.
5. Extra meta: `og:locale`, `og:image:type`, `robots`, `author`, `twitter:site`-ready scaffolding.

---

## Technical SEO

| Check | Status | Notes |
|---|---|---|
| HTTPS | OK | Netlify SSL, HSTS preload enabled |
| `robots.txt` | OK | `Allow: /`, sitemap reference correct |
| Sitemap index | OK | `/sitemap-index.xml` → `/sitemap-0.xml` (527 URLs) |
| Canonical tags | OK | Present site-wide via `Base.astro` |
| HTTP → HTTPS | OK (Netlify default) | |
| `X-Frame-Options` | OK | DENY |
| `X-Content-Type-Options` | OK | nosniff |
| `Referrer-Policy` | OK | strict-origin-when-cross-origin |
| `Permissions-Policy` | OK | geolocation/microphone/camera denied |
| `Content-Security-Policy` | MISSING | LOW priority for a static archive site |
| Trailing slash consistency | **BROKEN** | Internal hrefs omit slash, canonical/sitemap include slash → 301 on every click |
| 404 page | OK | Custom `/404` route |
| Mobile viewport | OK | `viewport-fit=cover` |
| Theme color (light + dark) | OK | Dynamic per route in Base.astro |
| `lang` attribute | OK | `<html lang="en">` |
| View transitions | OK | Astro `<ClientRouter />` |

## On-Page SEO

| Check | Status | Notes |
|---|---|---|
| Homepage title | WEAK | Just "The UFO Files" — no descriptive keywords. Acceptable as brand-anchor, but homepage is the biggest SEO real estate. Consider: `"The UFO Files — FBI 62-HQ-83894 + PURSUE 2026 Archive"`. |
| Dossier titles | GOOD | Descriptive, include case ID and date |
| Meta descriptions | MIXED | Homepage: good. Dossier: auto-fallback to body text, often starts with quote/junk |
| Heading hierarchy | OK | Single H1 per page |
| Image alt text | OK | Hero images have descriptive alt; thumbnail decorative `alt=""` is correct |
| Internal links | OK structure / BROKEN slashes | See trailing-slash issue |
| Breadcrumbs (visual) | NONE | Eyebrow line acts as breadcrumb but no BreadcrumbList schema |

## Schema / Structured Data

| Schema | Status |
|---|---|
| WebSite + SearchAction | MISSING (now added) |
| Organization / Publisher | MISSING (now added) |
| Article (dossier pages) | MISSING (now added) |
| BreadcrumbList | MISSING (now added) |
| Person (entity pages) | MISSING — future enhancement |
| Event (timeline) | MISSING — future enhancement |
| CollectionPage (timeline / threads) | MISSING — future enhancement |

## Content Quality (E-E-A-T)

- **Experience:** Strong. First-person archivist voice in `/about` and the homepage "Archivist" section. Real attribution to David Russell, Houlton, Maine.
- **Expertise:** Strong. Primary source citations on every dossier (FBI serials, page numbers, dates).
- **Authoritativeness:** Medium. No author bio rich snippet, no `Person` schema. The "Archivist" section is unsigned at schema level.
- **Trustworthiness:** Strong. Public-domain primary sources, build hash linked, corpus linked, methodology page exists.

**Recommendation:** Add `Person` JSON-LD with David Russell + sameAs links (GitHub, Dead Pixel Design). Future work.

## Performance (Core Web Vitals)

Not measured directly (no PageSpeed API key configured). Static Astro output with no SSR and minimal JS (React scoped to `/board` + `/atlas` only) is structurally fast.

**Predicted:**
- LCP: GOOD (static, font-display:swap, fetchpriority="high" on hero)
- INP: GOOD (no heavy client JS on most routes)
- CLS: GOOD (width/height on hero + thumbnail images)

**Recommendation:** Configure Google PageSpeed Insights API key (`python scripts/google_auth.py --setup`) for real CrUX field data next audit.

## AI Search Readiness (GEO)

| Check | Status |
|---|---|
| `llms.txt` | MISSING (now added) |
| AI crawlers allowed (robots.txt) | OK — wildcard `Allow: /` |
| Structured data for citations | MISSING (now added) |
| Author / publisher attribution | PARTIAL |
| Direct-answer formatting (Q&A, lists) | OK — dossiers use clear headings |
| Citable primary sources | EXCELLENT |

## Images

| Check | Status |
|---|---|
| Hero alt text | OK |
| Thumbnail decorative alt | OK |
| `width` + `height` set | OK |
| `loading="lazy"` on below-fold | OK |
| `fetchpriority="high"` on LCP | OK |
| Modern formats (AVIF/WebP) | NOT IMPLEMENTED — JPGs only. Astro `<Image />` could compress further. LOW priority for archive site where document fidelity matters. |

---

## Fixes applied in this audit

1. **`src/layouts/Base.astro`** — Added JSON-LD `WebSite` + `Organization` + optional `Article` schema. Added `og:locale`, `og:image:type`, `robots`, `author`, `twitter:site`-ready meta.
2. **`src/pages/dossier/[slug].astro`** — Passes Article schema props to Base.
3. **`astro.config.mjs`** — `trailingSlash: 'never'`, `build.format: 'file'` to match existing internal hrefs and eliminate 301 chain.
4. **`public/llms.txt`** — Written.

## What still needs human review

- **Homepage title.** Brand-only is a SEO conscious choice but you may want to A/B test a descriptive variant.
- **Dossier description fallback.** When `excerpt` is missing from front-matter, the body-text fallback often picks up an OCR quote. Either backfill `excerpt` in `content/archive/` (upstream submodule) or improve the fallback to skip leading `"` / `&#34;`.
- **Light-mode Pagefind contrast.** Not audited here, but verify search HUD readability in light mode.
- **Open Graph image per dossier.** Currently every page falls back to the global `og-image.jpg`. Per-case OG could lift social CTR significantly. Out of scope for this pass.
- **PageSpeed API + Google Search Console** integration for real field metrics next audit.
