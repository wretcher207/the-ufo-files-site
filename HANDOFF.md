# HANDOFF: theufofiles.com Phase 6, current state

Self-contained briefing for a fresh chat session. Read this top to bottom
before doing anything. The hard rules at the top have already destroyed
multiple hours of work.

---

## Read these first, in this order

1. This file.
2. `C:\Users\david\workspace\the-ufo-files-site\CLAUDE.md` (project rules).
3. `C:\Users\david\.claude\CLAUDE.md` (global rules: terse, no lectures, no
   em dashes in delivered prose, work autonomously).
4. The four feedback memories at
   `C:\Users\david\.claude\projects\C--Users-david-workspace-the-ufo-files-site\memory\`:
   - `feedback_no_warm_brown_palette.md`
   - `feedback_no_boxed_card_aesthetic.md` (may not exist as a file yet, but
     the rule is in this HANDOFF)
   - `feedback_no_glow_effects.md` (same)
   - `feedback_no_cmd_key_hints.md`
5. `C:\Users\david\workspace\david-voice-profile.md` (mandatory for any prose
   you draft for this site).

---

## The project in one paragraph

David Russell is building a single navigable archive of the FBI 62-HQ-83894
file and the May 8, 2026 PURSUE UFO release, plus surrounding context
entities. Astro 5 + Tailwind v4, static output, content is a git submodule
at `content/archive/` pointing at `github.com/wretcher207/the-ufo-files`.
Completeness is the product. As of this handoff every major route is on
the new monochrome identity system, the broken /board page is repaired and
mounting 69 evidence nodes, /vault is rebuilt as a working Source Manifest,
all confirmed-dead legacy components have been deleted, and the launch
gate passes. The remaining moves are mostly content (more archival images,
more pull-quotes on the homepage) plus one Vite/Rolldown dev-server bug.

---

## Hard rules

These are not preferences. Violating any of them will get the work rejected.

- **No warm/brown/sepia palettes ever.** David called the first redesign's
  warm-dark `#0F0D0B` + amber accent system "fucking SHIT BROWN" rendered.
  Cold near-black, true neutral grays, deep blue-black, or pure black/white.
- **No bordered card grids.** The repeating-framed-card pattern is the
  single most identifying AI-design tell. Default away from `border: 1px
  solid` on content surfaces. Use whitespace, typography hierarchy, or one
  full-bleed horizontal rule.
- **No glow effects.** `box-shadow` with a colored alpha, animated pulses,
  accent-colored selection halos all read as "AI slop glowing lights." Use
  a sharp 1-2px outline, inverted color block, underline, or opacity.
- **No "Cmd K" keyboard hints.** David is on Windows. Use `/`, "Ctrl K" on
  non-Mac, or no hint.
- **No em dashes anywhere.** Site copy, microcopy, error states, anywhere.
  Use commas, periods, parens, or colons.
- **No filler phrases.** "It's worth noting," "in today's world,"
  "fascinating," "intriguing," "as someone who" are all banned.
- **No closing summaries.** Do not end a response with "here is what I
  just did." The diff already shows it.
- **GUI over terminal.** Always offer or create `.bat` / `.ps1` for any
  multi-step Windows operation. David has `build.bat` and `dev.bat` at the
  repo root.
- **Build, do not grill.** At most 1 to 3 clarifying questions on genuinely
  ambiguous tasks. Never invoke `grill-me` on creative-vision work.
- **Sub-agents produce AI-slop by default** on visual work. Do not delegate
  visual passes without baking the four taste rules into the sub-agent's
  prompt verbatim, and audit before declaring done.
- **Voice profile is mandatory** for every prose surface
  (`C:\Users\david\workspace\david-voice-profile.md`).

---

## Where things stand right now

### Branch state

- `main` is **Phase 5** (the pre-redesign site with the phosphor-green CRT
  scanlines aesthetic). Preserved as a fallback per David's request.
- `phase-6-redesign` is the current working branch, pushed to origin at
  commit `1864b8d`. It contains the full monochrome rebuild plus the
  React-not-defined fix that finally got /board mounting.

```sh
git checkout main                  # original Phase 5
git checkout phase-6-redesign      # current monochrome rebuild
```

### Launch gate

- 63 renderable cases (57 FBI + 6 PURSUE), 6 entities, 6 threads.
- Build is clean: `npm run build` produces ~528 pages, Pagefind indexes 63.
- Submodule pointer is bumped, pushed upstream to
  `wretcher207/the-ufo-files`.

### What's been redone in the new visual direction

Every route below uses the monochrome system, the live archive-stats
helper, and the three reusable utility patterns
(`.ufo-section-anchor`, `.ufo-row-link`, `.ufo-figure-link`):

- `/` (homepage): big-numeral section anchors (`63 / FILES`, `06 /
  THREADS`), three hero figures wrap as links to dossiers/threads, hover-
  invert rows, inline links in archivist body, masthead eyebrow with three
  live-counter links.
- `/threads`: section anchor with `06`, hover-invert thread rows,
  multi-thread case counts via `countCasesByThread()`.
- `/thread/[id]`: full rewrite from Phase 5. Section anchor numbered to
  position in sequence. Hover-invert rows. Prev/next thread navigation at
  bottom so the six threads read as a sequence.
- `/dossier/[slug]`: hero image now wraps in `/evidence/[slug]` link when
  the case has `origin_url`. Same OPEN indicator + outline as homepage
  figures.
- `/about`: section anchor `01`, big-numeral clickable stats grid (each
  cell links to timeline/threads/PURSUE), inline links in body.
- `/404`: section anchor `404`, three-row recovery action list with hover
  invert. The Cmd-K hint is gone.
- `/timeline`: section anchor with live `63`, glow removed from PURSUE
  markers (now outlined dots). Phase 5 tokens stripped.
- `/entity/[slug]`: light mode (inherited from Base.astro), section anchor
  with case count, entity-image figure at top when available, hover-invert
  case list.
- `/evidence/[slug]`: bordered-card frame around source media removed,
  section anchor with back arrow, monochrome popup, all meta links.
- `/map`: cyan PURSUE-marker glow removed. FBI = filled white dot, PURSUE
  = outlined empty dot, both 1px white outline. Hover fills the outline.
  MapLibre popup styling overridden to monochrome.
- `/saved`: section anchor whose numeral updates live from localStorage
  count. Per-row action buttons (Cite, Share, Export .md, Remove) hover-
  invert. Localstorage and zip/bib export logic untouched.
- `/board`: was crashing on hydration with `ReferenceError: React is not
  defined`. Diagnosed from minified output: every node/edge component
  compiled JSX into bare `React.createElement` without importing React.
  Added `import * as React from 'react'` to all 14 .tsx in
  `src/graph/components/`. Now mounts 69 evidence nodes. New
  `board.css` is fully monochrome: amber tack replaced with white stamp,
  selected node inverts (white fill, black text) instead of glowing,
  contradicted edges dashed in red, no rounded corners.
- `/atlas`: monochrome WebGL palette via the rewritten `readTokens()` in
  `NetworkAtlas.tsx`. Search-result pulse turns red (semantic), hover/
  selected stays white. `atlas.css` rewritten for monochrome chrome with
  hover-invert filter chips and tags.
- `/vault`: rebuilt from the Phase 4 "coming soon" placeholder into the
  Source Manifest. Big numeral `63 / SOURCES`, two batches (PURSUE Release
  01 with 6 rows / FBI 62-HQ-83894 with 57 rows), each row hover-inverts
  to the dossier with a separate `↗ ORIGINAL` link to the issuing
  agency's PDF. Sorted by case_date within each batch. Added to operator
  chrome between Map and About.

### Identity utilities (reusable, in globals.css)

- `.ufo-section-anchor` + `__num` / `__body` / `__label` / `__sublabel` /
  `__arrow`. Big Fraunces numeral + label + arrow. Replaces tiny eyebrows.
- `.ufo-row-link` + `__dim` / `__mid` / `__fg`. Whole-row inversion on
  hover (bg fills with fg, text turns bg). No glow.
- `.ufo-figure-link`. Wraps `<figure>` + `<figcaption>` so images click;
  hover state is a 2px solid outline + small "OPEN" mono indicator.
- `.ufo-counter`, `.page-footer__record`, `.operator-chrome__counter`.
  Live counters in chrome, footer record-of-record line.

### New module: src/lib/archive-stats.ts

Single source of truth for live counts. `getArchiveStats()` returns
`{ totalCases, fbiCount, pursueCount, threadCount, coveragePct, buildDate,
buildIso, commitHash, branch, releaseDate }`. Computed once at build time,
cached in module scope. Surfaced in operator chrome (right-side `63 /
FILES` counter), Base.astro footer (`INDEX 2026-05-13 · 63 FILES · 06
THREADS · BUILD <hash> · phase-6-redesign · CORPUS · DEAD PIXEL DESIGN`),
and the homepage section anchors and stats grid.

### Side-bug fixes that fell out

- `getRenderableCases()` and `threadOf()` in `src/lib/case-utils.ts` were
  filtering on the legacy single `data.thread` field, missing cases tagged
  on the new `data.threads[]` array. Switched to
  `c.data.threads?.[0] ?? c.data.thread`. Also added `allThreadIds(c)` and
  `countCasesByThread(cases)` utilities. Visible effects:
  - Visible case count went 62 -> 63.
  - `/timeline` was empty; now plots 63 markers.
  - `gap-1974-2025` thread showed 0 cases; now shows 5 (Kazakhstan, Mexico,
    Bronze Ellipsoid, orbs-launching-orbs, USPER), counted under both
    PURSUE and the gap because `countCasesByThread` walks every tag.
- `/threads` page hardcoded "Five threads"; now derives from
  `THREADS.length` via a number-word map.
- React-not-defined crash on `/board` and `/atlas` (see above).

### Launch readiness (added this session)

- **Sitemap**: `@astrojs/sitemap` integrated, emits `sitemap-index.xml`
  and `sitemap-0.xml` at build time. All 528 routes are listed.
- **robots.txt**: written to `public/robots.txt`, points to the sitemap.
- **Default OG image**: `public/og-image.jpg` (1200×630, monochrome,
  Fraunces masthead, JetBrains Mono meta). Generated by
  `scripts/build-og-image.mjs` using Sharp + an SVG template. Re-run that
  script if any branding details change (counts, release line, domain).
- **Per-page OG image**: dossier and entity pages now pass their case or
  entity hero image through `Base.astro`'s new `ogImage` prop. Pages
  without a hero fall back to the default. `og:image:width` /
  `og:image:height` only emit for the default image (since per-case
  images don't share that aspect ratio).
- **Twitter card**: explicit `twitter:title`, `twitter:description`,
  `twitter:image` now emitted alongside `summary_large_image`.

### Known issues that remain

- **Vite/Rolldown dev-server bug**: the dev server (`npm run dev`) emits
  `Internal server error: Missing field "moduleType"` from
  `vite-react-refresh-wrapper` for any React route. Production preview
  (`npm run preview` after `npm run build`) is fine and is what David
  should use to verify board/atlas changes locally. Has been there for at
  least the entire current branch.
- **Hero images on most cases**: 21 archival images mapped, 39 of 63
  cases still have no hero. Adding more is the highest-leverage next
  move on visual richness without changing layout.

---

## Visual system spec (current direction)

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
- Mono: JetBrains Mono (Google Fonts, weights 400/500). Used for case IDs,
  dates, classification stamps, navigation labels, footer.

### Visual hard rules (codified)

- All images get `filter: grayscale(1) contrast(1.05)` to strip sepia/color.
- Selection inverts (`::selection`).
- Focus ring: 2px solid `var(--fg)`, 2px offset.
- No `border-radius` on content surfaces (keep at 0).
- No `box-shadow` with colored alpha.
- No backdrop-filter blur.

### Reusable patterns

- `.ufo-section-anchor` (header anchor with big numeral, label, arrow).
- `.ufo-row-link` + `__dim` / `__mid` / `__fg` (hover-invert row).
- `.ufo-figure-link` (image wrap + OPEN indicator on hover).
- `.ufo-counter`, `.operator-chrome__counter`, `.page-footer__record`.
- `.prose` long-form text (64ch, Fraunces h2/h3, Inter body).
- `.redaction` inline span (solid black on black, user-select: none).

---

## Image system

- All images live in `public/img/archive/` (16 files, ~12 MB total).
- All public-domain federal works or Wikimedia Commons.
- Mapping is in `src/lib/case-images.ts`. `caseImage(slug)` returns
  `{ src, alt, caption }` or null. `entityImage(slug)` does the same for
  entities.
- Adding a new image:
  1. Drop the file in `public/img/archive/`.
  2. Add an entry to `CASE_IMAGES` (or `ENTITY_IMAGES`).
  3. Homepage index list, dossier hero, and entity hero pick it up
     automatically.

### Currently mapped (24 cases, 3 entities)

Hottel, three Arnold variants, Maury Island, Brown-Davidson, Mantell
(crash-site marker, not the generic F-51D), Rhodes, Apollo 17 VM6,
Hoover-Scully, two pre-Scully rumor cases, Project Grudge, Section 10
civilian cluster, Chesapeake abduction 1967, Kazakhstan 1994 (Boeing
747), USPER statement (Pentagon aerial), Oak Ridge gasser (X-10 reactor),
Cabell AFOIC (Cabell USAF portrait), Muroc CIC affidavits (1947 P-80),
Peyerl 1944 German aircraft (Horten Ho 229 V3), Phoenix-Blythe 509th
Bomb Group (Sacramento Bee Roswell coverage), Frank Scully communist
teletype (Scully portrait), civilian-correspondence-hoover-pattern
(Hoover portrait). Entities: J. Edgar Hoover, Kenneth Arnold, Department
of War (shares the Pentagon image with USPER).

### Sourcing more images

When David says "find more visuals":
- Wikimedia Commons via
  `https://commons.wikimedia.org/wiki/Special:FilePath/<filename>?width=1600`
  (the resize endpoint that works). The `/wiki/commons/thumb/...` pattern
  returns 400 for non-standard widths.
- FBI Vault (`vault.fbi.gov`) for original document scans.
- NASA images (`images.nasa.gov`) for Apollo / lunar surface.
- All US federal works are public domain. Wikimedia Commons files usually
  state their license clearly.
- Always set `User-Agent: the-ufo-files-archive/1.0 (drjr1021@gmail.com)`
  on Wikimedia downloads.
- Do NOT use AI-generated UFO imagery. Do NOT use stock photography.

---

## Corpus and extraction

### Schema

`src/content.config.ts` defines three collections via Astro glob loader:
- `fbiCases` <- `content/archive/fbi-62hq83894/cases/*.md` (57 files)
- `pursueCases` <- `content/archive/pursue-release-01/cases/*.md` (6 files)
- `entities` <- `content/archive/context/**/*.md` (6 files)

Phase 6 fields (all optional in Zod, populated by extraction in practice):
`caseId`, `source`, `relationships[]`, `entities[]`, `threads[]`,
`nodeType`, `agency`, `classification`, `confidence`, `witnesses[]`, `geo`,
`date`, `dateRange`, `summary`, `excerpt`, `heroAsset`.

The `stringish` coercion in `content.config.ts` is critical: numeric YAML
tags get coerced to strings. Never remove it.

The legacy single-thread field `data.thread` AND the new array `data.threads[]`
both exist on every case. Always read with `c.data.threads?.[0] ?? c.data.thread`
or use the helpers `primaryThreadId(c)` / `allThreadIds(c)` /
`countCasesByThread(cases)` from `src/lib/case-utils.ts`.

### Pipeline (under `scripts/extract/`)

- `extract.ts` deterministic.
- `extract-ai.ts` OpenRouter gap-fill via `deepseek/deepseek-v4-pro`.
- `geocode.ts` Nominatim, 1.1s spacing, cached.
- `relationships.ts` heuristic mentions-edge inference, capped at 12 edges
  per case.
- `coverage.ts` exits non-zero if any required field is missing.
- `run-all.bat` chains the four scripts plus coverage.

To re-run after editing a case upstream:
1. cd into the submodule, edit and commit, push to
   `wretcher207/the-ufo-files`.
2. Back in parent: `git submodule update --remote content/archive && git
   add content/archive && git commit -m "Bump archive pointer".`
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
npm run dev            # astro dev (broken for React routes; see Known issues)
npm run build          # astro build && pagefind --site dist
npm run preview        # astro preview
```

For verifying anything that touches `/board`, `/atlas`, `/saved`: use
`npm run preview` (production build) instead of `npm run dev`. Vite dev
has a known `vite-react-refresh-wrapper` bug that 500s on the React routes.

---

## File map (current, post-rebuild)

```
src/
├── layouts/
│   └── Base.astro                  shell, fonts, mode, chrome, footer (record-of-record)
├── components/
│   ├── OperatorChrome.astro        48px text strip, nav, live counter, hamburger
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
│   ├── index.astro                 *** monochrome typography wall, dead-click sweep
│   ├── threads.astro               *** section anchor, hover-invert
│   ├── dossier/[slug].astro        *** hero links to /evidence when origin_url present
│   ├── about.astro                 *** section anchor + clickable stats grid
│   ├── 404.astro                   *** section anchor + recovery actions
│   ├── saved.astro                 *** section anchor, hover-invert action buttons
│   ├── board.astro                 *** React mounting fixed; monochrome via board.css
│   ├── atlas.astro                 *** monochrome via atlas.css; chrome height fixed
│   ├── thread/[id].astro           *** full rewrite, prev/next nav
│   ├── timeline.astro              *** glow removed, monochrome tokens
│   ├── map.astro                   *** PURSUE marker glow removed, monochrome popup
│   ├── evidence/[slug].astro       *** bordered frame removed, monochrome
│   ├── entity/[slug].astro         *** full rewrite, light mode, entity image
│   ├── vault.astro                 *** Source Manifest, 63 sources by batch
│   └── graph.astro                 meta-refresh fallback to /board
├── styles/
│   ├── brand.css                   monochrome token system + backward-compat aliases
│   ├── globals.css                 *** chrome, footer, prose, search modal, ufo-* utilities
│   └── atlas.css                   *** monochrome, hover-invert filter chips
├── lib/
│   ├── threads.ts                  six threads with metadata
│   ├── case-utils.ts               *** primaryThreadId, allThreadIds, countCasesByThread
│   ├── case-images.ts              slug -> image mapping
│   ├── entities.ts                 *** entity utilities, threads[] aware
│   ├── archive-stats.ts            *** NEW: single source of truth for live counts
│   └── rewrite-md-links.ts         rehype plugin for markdown link rewriting
├── content.config.ts               schema, stringish coercion, three collections
├── graph/                          *** React-import fix, monochrome board.css, mono palette
│   ├── components/
│   │   ├── InvestigationBoard.tsx
│   │   ├── NetworkAtlas.tsx
│   │   ├── BoardMobile.tsx
│   │   ├── AtlasMobile.tsx
│   │   ├── DossierPanel.tsx
│   │   ├── board.css
│   │   ├── edges/EvidenceEdge.tsx
│   │   └── nodes/{NodeCard,AgencyNode,...}.tsx + glyphs.tsx
│   └── ...
└── pagefind, etc.

public/
├── favicon.svg
├── _redirects                      Netlify: /graph -> /board 301
└── img/archive/                    16 public-domain archival images

scripts/extract/                    extraction pipeline (working, 100% coverage)
content/archive/                    git submodule pinned to wretcher207/the-ufo-files
```

Files marked `***` are current Phase 6 v2 work. All previously-flagged
legacy/unused components have been deleted in this branch.

---

## Recommended next-session work, in priority order

1. **Source more archival images.** 39 of 63 cases still lack a hero.
   Confirmed-good leads not yet pulled: Project Twinkle / green fireball
   documents (Sandia, Los Alamos era), Lincoln La Paz portrait if a PD
   copy surfaces, Edwards Air Force Base aerials, NARA newspaper
   clippings for the 1947 wave (Portland, Hackensack, Houston), J. Allen
   Hynek portrait, Project Blue Book era hangar/lab photos for the
   Section 10 cluster cases, Holloman AFB for the Stanfield-La Paz case,
   Bockscar / 509th Bomb Group B-29 for other 509th-related cases. Use
   Wikimedia Commons + FBI Vault + NARA. Federal works = public domain.
   Always set `User-Agent: the-ufo-files-archive/1.0
   (drjr1021@gmail.com)` on Wikimedia.
2. **Investigate Vite dev-server bug**. The
   `vite-react-refresh-wrapper: Missing field 'moduleType'` issue blocks
   dev-mode work on React routes. Likely a version pin issue between
   Astro 5.18 / React 19 / Rolldown. May need to downgrade Astro or
   upgrade past it. Production build is unaffected.
3. **More content for the homepage.** The page reads strong but a few more
   strategic full-bleed images between sections would help. Pull-quotes
   set in Fraunces italic at scale would also help break up the dossier
   reading column.

### Things David may bring up

- Hover anywhere on the homepage rows / image figures to see the new
  identity moves. Footer is now a record-of-record line.
- The `gap-1974-2025` thread used to show 0 cases; now shows 5. The fix
  walks every thread tag per case (`countCasesByThread`), so a case in
  two threads counts under both. Sums no longer equal `totalCases` and
  that is correct.
- `/board` was outright crashing before this session. Now mounts.

---

## Things that have already bitten me, so they do not bite you

- The first Phase 6 attempt approved a warm-dark + warm-light palette on
  paper. Same hex codes rendered as "shit brown stereo instructions" and
  got rejected wholesale. Build a test page before committing a palette.
- Sub-agents reflexively reach for AI-default visual language even when
  instructed not to. Five sub-agents simultaneously built bordered card
  grids despite explicit prompts forbidding them.
- `gray-matter` throws on malformed YAML. Extraction scripts handle this
  via try/catch.
- Wikimedia thumbnail URLs in the `commons/thumb/` format return 400 for
  non-standard widths. Use `Special:FilePath/<filename>?width=N` instead.
- The OpenRouter API key has been rotated once. Current key is in user env
  `OPENROUTER_API_KEY`. If extraction returns 401, ask David rather than
  silently failing.
- Astro picks the next free port if 4321 is taken. Always read the dev
  server output for the real URL.
- React 19 + Vite/Rolldown does not auto-inject the React import for
  modules that compile JSX into `React.createElement`. If a new React
  component is added to `src/graph/components/` and the production build
  throws `ReferenceError: React is not defined` at hydration, add
  `import * as React from 'react';` at the top of every .tsx in the
  module's import graph.
- `data.threads[]` (array) is the canonical thread tag; `data.thread`
  (singular) is the legacy fallback. Always read both via
  `c.data.threads?.[0] ?? c.data.thread`. Use the helpers in
  `src/lib/case-utils.ts` (`primaryThreadId`, `allThreadIds`,
  `countCasesByThread`) when you need either the primary or every thread
  a case is on.

---

## When you finish

Do not merge `phase-6-redesign` into `main` without explicit instruction.
David asked to keep `main` (the original Phase 5 site) preserved as a
fallback while the rebuild continues. Push to `origin/phase-6-redesign`
as work progresses. He can compare versions any time with
`git checkout main` and `git checkout phase-6-redesign`.

Do not write a closing summary after you finish. The diff shows the work.
