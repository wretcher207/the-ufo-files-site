# HANDOFF: theufofiles.com, current state

Self-contained briefing for a fresh chat session. Read this top to bottom
before doing anything. The hard rules at the top have already destroyed
multiple hours of work.

---

## Read these first, in this order

1. This file.
2. `C:\Users\david\workspace\the-ufo-files-site\CLAUDE.md` (project rules).
3. `C:\Users\david\.claude\CLAUDE.md` (global rules: terse, no lectures,
   no em dashes in delivered prose, work autonomously).
4. The feedback memories at
   `C:\Users\david\.claude\projects\C--Users-david-workspace-the-ufo-files-site\memory\`:
   `feedback_no_warm_brown_palette.md`, `feedback_no_boxed_card_aesthetic.md`,
   `feedback_no_glow_effects.md`, `feedback_no_cmd_key_hints.md`.
5. `C:\Users\david\workspace\david-voice-profile.md` (mandatory for any
   prose you draft for this site).

---

## The project in one paragraph

David Russell is building a single navigable archive of the FBI 62-HQ-83894
file and the May 8, 2026 PURSUE UFO release, plus surrounding context
entities. Astro 5 + Tailwind v4, static output, content is a git submodule
at `content/archive/` pointing at `github.com/wretcher207/the-ufo-files`.
Completeness is the product. Every major route is on the new monochrome
identity system. /board mounts 69 evidence nodes. /vault is a working
Source Manifest. Sitemap, robots.txt, and a default Open Graph image are
all wired. The launch gate passes. What remains is mostly content
(more archival images, optional homepage extras) plus one Vite/Rolldown
dev-server bug that may already be resolved.

---

## Hard rules

These are not preferences. Violating any of them will get the work rejected.

- **No warm/brown/sepia palettes ever.** David called the first redesign's
  warm-dark `#0F0D0B` + amber accent system "fucking SHIT BROWN" rendered.
  Cold near-black, true neutral grays, deep blue-black, or pure black/white.
- **No bordered card grids.** The repeating-framed-card pattern is the
  single most identifying AI-design tell. Default away from `border: 1px
  solid` on content surfaces. Use whitespace, typography hierarchy, or
  one full-bleed horizontal rule.
- **No glow effects.** `box-shadow` with a colored alpha, animated
  pulses, accent-colored selection halos all read as "AI slop glowing
  lights." Use a sharp 1-2px outline, inverted color block, underline,
  or opacity.
- **No "Cmd K" keyboard hints.** David is on Windows. Use `/`, "Ctrl K"
  on non-Mac, or no hint.
- **No em dashes anywhere in authored prose.** Site copy, microcopy,
  error states, anywhere. Use commas, periods, parens, or colons.
  Exception: blockquoted material from real source documents (FBI memos,
  press releases) preserves the original punctuation.
- **No filler phrases.** "It's worth noting," "in today's world,"
  "fascinating," "intriguing," "as someone who" are all banned.
- **No closing summaries.** Do not end a response with "here is what I
  just did." The diff already shows it.
- **GUI over terminal.** Always offer or create `.bat` / `.ps1` for any
  multi-step Windows operation. David has `build.bat` and `dev.bat` at
  the repo root.
- **Build, do not grill.** At most 1 to 3 clarifying questions on
  genuinely ambiguous tasks. Never invoke `grill-me` on creative-vision
  work.
- **Sub-agents produce AI-slop by default** on visual work. Do not
  delegate visual passes without baking the four taste rules into the
  sub-agent's prompt verbatim, and audit before declaring done.
- **Voice profile is mandatory** for every prose surface
  (`C:\Users\david\workspace\david-voice-profile.md`).

---

## Where things stand right now

### Branch state

- `main` is **Phase 5** (the pre-redesign site with the phosphor-green
  CRT scanlines aesthetic). Preserved as a fallback per David's request.
- `phase-6-redesign` is the current working branch, pushed to origin.
  Latest commit `f067392`. All Phase 6 work lives here.

```sh
git checkout main                  # original Phase 5
git checkout phase-6-redesign      # current monochrome rebuild
```

### Launch gate

- 63 renderable cases (57 FBI + 6 PURSUE), 6 entities, 6 threads.
- `npm run build` produces 528 pages, Pagefind indexes all 63 cases,
  `@astrojs/sitemap` emits `sitemap-index.xml` + `sitemap-0.xml`.
- `astro check` is clean: 0 errors, 0 warnings.
- Submodule pointer is bumped and pushed upstream.

### Phase 6 work shipped on this branch

Every route now uses the monochrome system, the live archive-stats
helper, and the three reusable utility patterns (`.ufo-section-anchor`,
`.ufo-row-link`, `.ufo-figure-link`). Specifically:

- `/` (homepage): big-numeral section anchors, three hero figures wrap
  as links to dossiers/threads, hover-invert rows, inline links in
  archivist body, masthead eyebrow with three live-counter links.
- `/threads`: section anchor with `06`, hover-invert thread rows,
  multi-thread case counts via `countCasesByThread()`.
- `/thread/[id]`: full rewrite from Phase 5. Section anchor numbered to
  position in sequence. Hover-invert rows. Prev/next thread navigation.
- `/dossier/[slug]`: hero image wraps in `/evidence/[slug]` link when
  the case has `origin_url`. Pull-quote treatment for blockquotes
  (Fraunces italic at scale, no left rule).
- `/about`: section anchor `01`, big-numeral clickable stats grid,
  inline links in body.
- `/404`: section anchor `404`, three-row recovery action list.
- `/timeline`: section anchor with live `63`, glow removed.
- `/entity/[slug]`: light mode, section anchor with case count,
  entity-image figure at top when available, hover-invert case list.
- `/evidence/[slug]`: bordered-card frame removed, section anchor with
  back arrow, monochrome popup.
- `/map`: cyan PURSUE-marker glow removed. FBI = filled white dot,
  PURSUE = outlined empty dot, both 1px white outline. Hover fills the
  outline. MapLibre popup styling overridden to monochrome.
- `/saved`: section anchor whose numeral updates live from localStorage,
  per-row action buttons hover-invert.
- `/board`: React-import fix shipped, mounts 69 evidence nodes. New
  `board.css` is fully monochrome.
- `/atlas`: monochrome WebGL palette via the rewritten `readTokens()`.
- `/vault`: rebuilt from Phase 4 placeholder into the Source Manifest.
  Big numeral `63 / SOURCES`, two batches (PURSUE Release 01 with 6
  rows / FBI 62-HQ-83894 with 57 rows), each row hover-inverts to the
  dossier with a separate `↗ ORIGINAL` link to the issuing agency's
  PDF. Sorted by case_date within each batch. Linked from chrome.

### Identity utilities (in `src/styles/globals.css`)

- `.ufo-section-anchor` + `__num` / `__body` / `__label` / `__sublabel`
  / `__arrow`. Big Fraunces numeral + label + arrow.
- `.ufo-row-link` + `__dim` / `__mid` / `__fg`. Whole-row inversion on
  hover. No glow.
- `.ufo-figure-link`. Wraps `<figure>` + `<figcaption>` so images
  click; hover state is a 2px solid outline + small "OPEN" indicator.
- `.ufo-counter`, `.page-footer__record`, `.operator-chrome__counter`.
  Live counters in chrome and the footer record-of-record line.
- `.prose blockquote`. Pull-quote: Fraunces italic at
  `clamp(24px, 2.3vw, 36px)`, 36ch max-width, no border.

### Live stats helper: `src/lib/archive-stats.ts`

Single source of truth for runtime counts. `getArchiveStats()` returns
`{ totalCases, fbiCount, pursueCount, threadCount, coveragePct,
buildDate, buildIso, commitHash, branch, releaseDate }`. Surfaced in
the operator chrome counter (right side), Base.astro footer
(`INDEX 2026-05-13 · 63 FILES · 06 THREADS · BUILD <hash> ·
phase-6-redesign · CORPUS · DEAD PIXEL DESIGN`), homepage section
anchors, and the homepage stats grid.

### Launch readiness shipped

- **Sitemap**: `@astrojs/sitemap` integrated, emits
  `sitemap-index.xml` and `sitemap-0.xml` at build. All routes listed.
- **robots.txt**: `public/robots.txt` allows all crawlers, points to
  the sitemap.
- **Default OG image**: `public/og-image.jpg`, 1200×630, monochrome,
  Fraunces masthead + JetBrains Mono record line. Generated by
  `node scripts/build-og-image.mjs` via Sharp + an inline SVG template.
  Re-run that script if any branding details change (counts, release
  line, domain).
- **Per-page OG image**: dossier and entity pages pass their case or
  entity hero image through `Base.astro`'s `ogImage` prop. Pages
  without a hero fall back to the default. `og:image:width` /
  `og:image:height` only emit for the default image (per-case images
  don't share that aspect ratio).
- **Twitter card**: `twitter:title`, `twitter:description`,
  `twitter:image` all emitted alongside `summary_large_image`.

### Side-bug fixes that fell out (already applied)

- React-not-defined hydration crash on `/board` and `/atlas`: every
  `.tsx` in `src/graph/components/` now has `import * as React from
  'react'`.
- `getRenderableCases()` and `threadOf()` in `src/lib/case-utils.ts`
  read both `data.threads?.[0]` (Phase 6 array) and `data.thread`
  (legacy single). `gap-1974-2025` thread went 0 → 5 cases, total
  renderable went 62 → 63, timeline plots 63 markers.
- `/threads` hardcoded "Five threads"; now derives from
  `THREADS.length`.
- All previously legacy/unused components deleted: `Hero.astro`,
  `TopPlate.astro`, `HeroComposition.ts`, `HomeBoardPreview.tsx`,
  `InvestigationMode.astro`, `CrossReferenceRail.astro`,
  `DossierHeader.astro`, `EntitiesInCase.astro`,
  `PriorityCasePanel.astro`, `ThreadCard.astro`, `ThreadDrawer.astro`.
- `serial?: string` prop removed from `Base.astro` (was unused).
- 12 TS errors and 6 warnings under `astro check` all resolved.

### Known issue still on the table

- **Vite/Rolldown dev-server bug** (per prior handoff): `npm run dev`
  was reported to emit `Internal server error: Missing field
  "moduleType"` from `vite-react-refresh-wrapper` for React routes.
  When I tried to repro after recent npm installs, `curl
  http://localhost:4321/board` returned a full 151KB HTML response, so
  it may already be resolved. Needs a real Playwright verification
  with hydration check. Production preview (`npm run preview` after
  `npm run build`) is unaffected.

---

## Visual system spec

Source of truth: `src/styles/brand.css` and `src/styles/globals.css`.

### Palette

| Token | Dark mode | Light mode |
|---|---|---|
| `--bg` | `#000000` | `#ffffff` |
| `--fg` | `#ffffff` | `#000000` |
| `--fg-mid` | `#888888` | `#666666` |
| `--fg-dim` | `#555555` | `#999999` |
| `--rule` | `#1a1a1a` | `#e5e5e5` |
| `--red` | `#e10600` (content semantics only) | `#e10600` |

Mode is set per route on `<html data-mode="...">` by `resolveMode()` in
`Base.astro`:
- LIGHT for `/dossier/*`, `/entity/*`, `/about`.
- DARK for everything else.

### Type stack

- Display: Fraunces (Google Fonts, opsz 9..144, weights 300/400/500/600).
- Body: Inter (Google Fonts, weights 400/500/600).
- Mono: JetBrains Mono (Google Fonts, weights 400/500). Used for case
  IDs, dates, classification stamps, navigation labels, footer.

### Visual hard rules (codified)

- All images get `filter: grayscale(1) contrast(1.05)` to strip sepia
  and color.
- Selection inverts (`::selection`).
- Focus ring: 2px solid `var(--fg)`, 2px offset.
- No `border-radius` on content surfaces (keep at 0).
- No `box-shadow` with colored alpha.
- No backdrop-filter blur.

---

## Image system

- All images live in `public/img/archive/` (22 files, ~16 MB total).
- All public-domain federal works or Wikimedia Commons.
- Mapping is in `src/lib/case-images.ts`. `caseImage(slug)` returns
  `{ src, alt, caption }` or null. `entityImage(slug)` does the same
  for entities.
- Adding a new image:
  1. Drop the file in `public/img/archive/`.
  2. Add an entry to `CASE_IMAGES` (or `ENTITY_IMAGES`).
  3. Homepage index list, dossier hero, entity hero, and Open Graph
     `og:image` all pick it up automatically.

### Currently mapped (26 cases, 3 entities)

Cases: Hottel, three Arnold variants, Maury Island, Brown-Davidson,
Mantell (crash-site marker), Rhodes, Apollo 17 VM6, Hoover-Scully, two
pre-Scully rumor cases, Project Grudge, Section 10 civilian cluster,
Chesapeake abduction 1967, Kazakhstan 1994 (Boeing 747), USPER
statement (Pentagon aerial), Oak Ridge gasser (X-10 reactor), Cabell
AFOIC (USAF portrait), Muroc CIC affidavits (1947 P-80), Peyerl 1944
German aircraft (Horten Ho 229 V3), Phoenix-Blythe 509th Bomb Group
(Sacramento Bee Roswell coverage), Frank Scully communist teletype
(Scully portrait), civilian-correspondence-hoover-pattern (Hoover
portrait), Stanfield-La Paz Holloman (Alamogordo Post HQ),
fbi-intelligence-coordination-ufo-protocol-1950 (J. Edgar Hoover
Building).

Entities: J. Edgar Hoover, Kenneth Arnold, Department of War (shares
the Pentagon image with USPER).

### Sourcing more images

When David says "find more visuals":
- Wikimedia Commons via
  `https://commons.wikimedia.org/wiki/Special:FilePath/<filename>?width=1600`
  (the resize endpoint that works). The `/wiki/commons/thumb/...` pattern
  returns 400 for non-standard widths.
- FBI Vault (`vault.fbi.gov`) for original document scans.
- NASA images (`images.nasa.gov`) for Apollo / lunar surface.
- All US federal works are public domain. Wikimedia Commons files
  usually state their license clearly.
- Always set `User-Agent: the-ufo-files-archive/1.0 (drjr1021@gmail.com)`
  on Wikimedia downloads.
- Do NOT use AI-generated UFO imagery. Do NOT use stock photography.
- Verify dimensions before wiring. The Special:FilePath endpoint
  returns the original size if the original is smaller than the
  `?width=` parameter. Anything below ~800px wide reads as a thumbnail
  in the dossier hero figure.

---

## Corpus and extraction

### Schema

`src/content.config.ts` defines three collections via Astro glob loader:
- `fbiCases` <- `content/archive/fbi-62hq83894/cases/*.md` (57 files)
- `pursueCases` <- `content/archive/pursue-release-01/cases/*.md` (6 files)
- `entities` <- `content/archive/context/**/*.md` (6 files)

Phase 6 fields (all optional in Zod, populated by extraction in
practice): `caseId`, `source`, `relationships[]`, `entities[]`,
`threads[]`, `nodeType`, `agency`, `classification`, `confidence`,
`witnesses[]`, `geo`, `date`, `dateRange`, `summary`, `excerpt`,
`heroAsset`.

The `stringish` coercion in `content.config.ts` is critical: numeric
YAML tags get coerced to strings. Never remove it.

The legacy single-thread field `data.thread` AND the new array
`data.threads[]` both exist on every case. Always read with
`c.data.threads?.[0] ?? c.data.thread` or use the helpers
`primaryThreadId(c)` / `allThreadIds(c)` / `countCasesByThread(cases)`
from `src/lib/case-utils.ts`.

### Pipeline (under `scripts/extract/`)

- `extract.ts` deterministic.
- `extract-ai.ts` OpenRouter gap-fill via `deepseek/deepseek-v4-pro`.
- `geocode.ts` Nominatim, 1.1s spacing, cached.
- `relationships.ts` heuristic mentions-edge inference, capped at 12
  edges per case.
- `coverage.ts` exits non-zero if any required field is missing.
- `run-all.bat` chains the four scripts plus coverage.

To re-run after editing a case upstream:
1. cd into the submodule, edit and commit, push to
   `wretcher207/the-ufo-files`.
2. Back in parent: `git submodule update --remote content/archive
   && git add content/archive && git commit -m "Bump archive pointer"`.
3. `.\scripts\extract\run-all.bat` if extraction needs to re-run.

---

## How to run

```sh
.\dev.bat              # starts dev server (auto-picks first free port)
.\build.bat            # full production build + Pagefind index
```

Or manually:

```sh
npm install
npm run dev            # astro dev
npm run build          # astro build && pagefind --site dist
npm run preview        # astro preview
```

If `/board` or `/atlas` look off in dev, fall back to
`npm run preview` (production build) until the Vite dev-server bug is
confirmed dead.

---

## File map (current, post-cleanup)

```
src/
├── layouts/
│   └── Base.astro                  shell, fonts, mode, chrome, footer,
│                                   og:image, twitter card, canonical
├── components/
│   ├── OperatorChrome.astro        48px text strip, nav, live counter,
│   │                               hamburger; Vault link added between
│   │                               Map and About
│   ├── SearchHUD.astro             "/" trigger, Pagefind-backed modal
│   ├── CaseActions.astro           dossier action bar (Cite, Share, Export)
│   ├── CitePopover.astro           ↑ child popover
│   ├── SharePopover.astro          ↑ child popover
│   ├── ExportPopover.astro         ↑ child popover
│   ├── ProvenanceFooter.astro      dossier footer
│   ├── ProvenanceCard.astro        evidence-page card
│   ├── EntityRail.astro            dossier sidebar
│   ├── RelatedCases.astro          dossier related rail
│   └── SocialsStrip.astro          /about social links
├── pages/
│   ├── index.astro                 monochrome typography wall
│   ├── threads.astro               section anchor, hover-invert
│   ├── dossier/[slug].astro        hero links to /evidence when
│   │                               origin_url present; passes ogImage
│   ├── about.astro                 section anchor + clickable stats grid
│   ├── 404.astro                   section anchor + recovery actions
│   ├── saved.astro                 section anchor, hover-invert actions
│   ├── board.astro                 React mounting fixed; monochrome
│   ├── atlas.astro                 monochrome via atlas.css
│   ├── thread/[id].astro           full rewrite, prev/next nav
│   ├── timeline.astro              monochrome tokens, typed marks
│   ├── map.astro                   monochrome popup, no glow
│   ├── evidence/[slug].astro       monochrome, narrowed url type
│   ├── entity/[slug].astro         light mode, entity image, ogImage
│   ├── vault.astro                 Source Manifest, 63 sources by batch
│   └── graph.astro                 meta-refresh fallback to /board
├── styles/
│   ├── brand.css                   monochrome token system
│   ├── globals.css                 chrome, footer, prose, pull-quote,
│   │                               search modal, ufo-* utilities
│   └── atlas.css                   monochrome, hover-invert filter chips
├── lib/
│   ├── threads.ts                  six threads with metadata
│   ├── case-utils.ts               primaryThreadId, allThreadIds,
│   │                               countCasesByThread
│   ├── case-images.ts              slug -> image mapping (26 cases,
│   │                               3 entities)
│   ├── entities.ts                 entity utilities, threads[] aware
│   ├── archive-stats.ts            single source of truth for counts
│   └── rewrite-md-links.ts         rehype plugin for md link rewriting
├── content.config.ts               schema, stringish coercion
└── graph/                          React-import fix, monochrome board.css
    └── components/
        ├── InvestigationBoard.tsx
        ├── NetworkAtlas.tsx
        ├── BoardMobile.tsx
        ├── AtlasMobile.tsx
        ├── DossierPanel.tsx
        ├── board.css
        ├── edges/EvidenceEdge.tsx
        └── nodes/{NodeCard,AgencyNode,...}.tsx + glyphs.tsx

public/
├── favicon.svg
├── og-image.jpg                    default 1200x630 monochrome OG card
├── robots.txt                      allows all, points to sitemap
├── _redirects                      Netlify: /graph -> /board 301
└── img/archive/                    22 public-domain archival images

scripts/
├── build-og-image.mjs              regenerate the default OG image
└── extract/                        extraction pipeline (100% coverage)

content/archive/                    git submodule pinned to
                                    wretcher207/the-ufo-files
```

---

## Recommended next-session work, in priority order

1. **Source more archival images.** 37 of 63 cases still lack a hero.
   Confirmed-good leads not yet pulled:
   - Project Twinkle / green fireball documents (Sandia, Los Alamos era).
   - Lincoln La Paz portrait if a PD copy surfaces.
   - J. Allen Hynek portrait (the Project Blue Book consultant).
   - NARA newspaper clippings for the 1947 wave (Portland, Hackensack,
     Houston).
   - Project Blue Book era hangar/lab photos for the Section 10
     cluster cases.
   - Walter Haut at higher resolution (the Roswell yearbook portrait
     is on Commons but only 200×327, too small for a hero).
   - Bockscar / 509th Bomb Group B-29 for other 509th-related cases.
   - Wright-Patterson AFB Hangar (HABS Commons category exists).

   Use Wikimedia Commons + FBI Vault + NARA. Federal works = public
   domain. Set the user agent on every Wikimedia request.
2. **Verify the Vite dev-server bug status.** Boot `npm run dev`,
   navigate `/board` and `/atlas` in a real browser via Playwright,
   and check the console for the
   `vite-react-refresh-wrapper: Missing field 'moduleType'` error.
   If it's gone, update this handoff. If it's still there, try
   pinning `vite` or `@vitejs/plugin-react` to a working pair, or
   running `npm install --force` and retesting.
3. **More homepage content** (optional polish). The page reads
   strong, but one more full-bleed image between Index and Threads
   sections, or a dramatic Fraunces italic pull-line between Pull and
   Frontpage, would deepen the rhythm. The dossier pull-quote
   treatment already covers in-body quotes.
4. **Pre-launch QA pass.** Run through every route on a clean
   browser, confirm the new OG image previews correctly in social
   debuggers (Twitter validator, Facebook sharing debugger, LinkedIn
   inspector). Confirm `sitemap-index.xml` and `robots.txt` deploy
   to production correctly via Netlify.

### Things David may bring up

- Footer is now a record-of-record line. Hover anywhere on the
  homepage rows or image figures to see the identity moves.
- The `gap-1974-2025` thread used to show 0 cases; now shows 5. The
  fix walks every thread tag per case (`countCasesByThread`), so a
  case in two threads counts under both. Sums no longer equal
  `totalCases` and that is correct.
- `/board` was outright crashing before this branch. Now mounts.
- `/vault` used to be a "coming soon" placeholder. Now a real
  manifest with hover-invert rows and ↗ ORIGINAL outbound links.

---

## Things that have already bitten me, so they do not bite you

- The first Phase 6 attempt approved a warm-dark + warm-light palette
  on paper. Same hex codes rendered as "shit brown stereo instructions"
  and got rejected wholesale. Build a test page before committing a
  palette.
- Sub-agents reflexively reach for AI-default visual language even
  when instructed not to. Five sub-agents simultaneously built bordered
  card grids despite explicit prompts forbidding them.
- `gray-matter` throws on malformed YAML. Extraction scripts handle
  this via try/catch.
- Wikimedia thumbnail URLs in the `commons/thumb/` format return 400
  for non-standard widths. Use `Special:FilePath/<filename>?width=N`
  instead.
- The Special:FilePath endpoint does NOT upscale. If the original is
  500px wide, it returns 500px even with `?width=1600`. Check actual
  dimensions of every download before wiring a tiny image to a hero
  figure.
- The OpenRouter API key has been rotated once. Current key is in user
  env `OPENROUTER_API_KEY`. If extraction returns 401, ask David
  rather than silently failing.
- Astro picks the next free port if 4321 is taken. Always read the
  dev server output for the real URL.
- React 19 + Vite/Rolldown does not auto-inject the React import for
  modules that compile JSX into `React.createElement`. If a new React
  component is added to `src/graph/components/` and the production
  build throws `ReferenceError: React is not defined` at hydration,
  add `import * as React from 'react';` at the top of every `.tsx` in
  the module's import graph.
- `data.threads[]` (array) is the canonical thread tag; `data.thread`
  (singular) is the legacy fallback. Always read both via
  `c.data.threads?.[0] ?? c.data.thread`. Use the helpers in
  `src/lib/case-utils.ts` when you need either the primary or every
  thread a case is on.
- Astro pages currently render `<main id="main">` inside Base.astro's
  own `<main id="main">`, producing nested mains with duplicate IDs.
  Pre-existing; not introduced by recent work. Fixing it project-wide
  is a separate refactor.
- The `og:image:width` and `og:image:height` meta tags only emit when
  the default `/og-image.jpg` is in use. Per-case hero images aren't
  1200×630, so emitting fixed dimensions for them would lie to
  scrapers. If you ever add a per-page OG image that IS 1200×630,
  adjust the `isDefaultOgImage` check in `Base.astro` accordingly.

---

## When you finish

Do not merge `phase-6-redesign` into `main` without explicit
instruction. David asked to keep `main` (the original Phase 5 site)
preserved as a fallback while the rebuild continues. Push to
`origin/phase-6-redesign` as work progresses. He can compare versions
any time with `git checkout main` and `git checkout phase-6-redesign`.

Do not write a closing summary after you finish. The diff shows the
work.
