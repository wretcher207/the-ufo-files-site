# HANDOFF: theufofiles.com Phase 6, current state

Self-contained briefing for a fresh chat session. Read this first, top to bottom.
Read **Hard rules** before doing anything else — three of them have already
destroyed multiple hours of work.

---

## Read these first, in this order

1. This file.
2. `C:\Users\david\workspace\the-ufo-files-site\CLAUDE.md` (project rules).
3. `C:\Users\david\.claude\CLAUDE.md` (global rules: terse, no lectures, no em
   dashes in delivered prose, work autonomously).
4. The four feedback memories in
   `C:\Users\david\.claude\projects\C--Users-david-workspace-the-ufo-files-site\memory\`:
   - `feedback_no_warm_brown_palette.md`
   - `feedback_no_boxed_card_aesthetic.md`
   - `feedback_no_glow_effects.md`
   - `feedback_no_cmd_key_hints.md`
5. `C:\Users\david\workspace\david-voice-profile.md` (mandatory for any prose
   you draft for this site).

---

## The project in one paragraph

David Russell is building a single navigable archive of the FBI 62-HQ-83894
file and the May 8, 2026 PURSUE UFO release, plus surrounding context entities.
Astro 5 + Tailwind v4, static output, content is a git submodule at
`content/archive/` pointing at `github.com/wretcher207/the-ufo-files`.
Completeness is the product. The site does not deploy until the corpus is
structured. As of this handoff the corpus is fully extracted (100% coverage)
and the launch gate passes; the visual system is mid-rebuild after a hard
rejection of the first Phase 6 attempt.

---

## Hard rules

These are not preferences. Violating any of them today wrecked five hours of
work.

- **No warm/brown/sepia palettes ever.** David called the first redesign's
  warm-dark `#0F0D0B` + amber accent system "fucking SHIT BROWN" the moment
  he saw it rendered. He had previously approved the hex values on paper.
  Cold near-black, true neutral grays, deep blue-black, or pure black/white.
  See `feedback_no_warm_brown_palette.md`.
- **No bordered card grids.** The repeating-framed-card pattern is the single
  most identifying AI-design tell. David spotted it across five different
  sub-agents' work instantly. Default away from `border: 1px solid` on
  content surfaces. Use whitespace, typographic hierarchy, or one full-bleed
  horizontal rule. See `feedback_no_boxed_card_aesthetic.md`.
- **No glow effects.** `box-shadow` with a colored alpha, animated pulses,
  accent-colored selection halos all read as "AI slop glowing lights." Use
  a sharp 1-2px outline, inverted color block, underline, or opacity. See
  `feedback_no_glow_effects.md`.
- **No "Cmd K" keyboard hints in UI.** David is on Windows. Use `/`, "Ctrl K"
  on non-Mac, or no hint. See `feedback_no_cmd_key_hints.md`.
- **No em dashes in any delivered prose.** Site copy, microcopy, error states,
  citation blocks, anywhere. Use commas, periods, parens, or colons.
- **No filler phrases.** "It's worth noting," "in today's world," "fascinating,"
  "intriguing," "as someone who" are all banned.
- **No closing summaries.** Do not end a response with "here is what I just
  did." The diff already shows it.
- **GUI over terminal.** Always offer or create `.bat` / `.ps1` files for any
  multi-step Windows operation. David has `build.bat` and `dev.bat` at the
  repo root.
- **Build, do not grill.** Ask at most 1 to 3 clarifying questions when
  genuinely ambiguous. Never invoke the `grill-me` skill on creative-vision
  tasks. Stay out of plan mode unless absolutely needed.
- **Do not capitulate to skeleton.** When David expresses frustration about
  *scope*, commit harder. When he expresses frustration about *taste*, redo
  the work; do not shrink it.
- **Sub-agents produce AI-slop by default.** Five sub-agents simultaneously
  built the first Phase 6 design and David rejected it wholesale. Do not
  hand visual work off to a fresh sub-agent without baking the four taste
  memories into its prompt verbatim, and even then audit before showing him.
- **Voice profile is mandatory** for every prose surface. Located at
  `C:\Users\david\workspace\david-voice-profile.md`.

---

## Where things stand right now

### Branch state

- `main` is **Phase 5** (the pre-redesign site with the `phosphor-green CRT
  scanlines` aesthetic that David had already mostly tolerated). It is the
  fallback David asked us to preserve.
- `phase-6-redesign` is the **current working branch**, pushed to origin.
  Two distinct redesigns live in its history:
  - Commits up through `8c3ae0f` (Wave 2 Agent 7) were the *first* attempt:
    warm-dark/warm-light palette, exploded-card hero compositions,
    Instrument Serif + Schibsted Grotesk + Azeret Mono, amber tacks, Hero
    parallax. David rejected this entirely. **Do not revisit these commits
    for design language.** They are useful only for the data layer (graph
    types, schema extension) and the extraction pipeline.
  - Commits from `f8d368a` onward are the *current* visual direction: pure
    monochrome, Fraunces + Inter + JetBrains Mono, typography wall, no
    cards, single accent red (used only for content semantics, not UI), now
    layered with public-domain archival imagery.

To switch between versions:
```sh
git checkout main                  # original Phase 5
git checkout phase-6-redesign      # current monochrome rebuild
```

### Launch gate

- Coverage script passes at 100% across every required field on every case.
- 70 archive files, 69 case files + entities, 0 skipped (stray ingest log
  was deleted upstream).
- Submodule pointer is bumped, pushed upstream to
  `wretcher207/the-ufo-files`.
- Build is clean: `npm run build` produces 519 pages, Pagefind indexes 63.

### What is working visually

- Pure black `#000` background, pure white `#fff` text, single accent
  `--red: #e10600` reserved for content semantics only.
- Typography: Fraunces (display, variable 9-144 optical), Inter (body),
  JetBrains Mono (case IDs, dates, labels). Google Fonts.
- Operator chrome is a 48px text-only strip, no box, no backdrop blur.
  Hamburger on mobile.
- Search trigger reads `/ Search`. Modal opens on `/`, `Cmd+K`, or `Ctrl+K`.
- Homepage `/`: masthead with Hottel memo scan + headline side-by-side, a
  featured "pull" case with Arnold AAF sketch, a full-bleed Roswell Daily
  Record section, the latest 18 cases as a thumbnail list, the six threads
  as a compact ordered list, an archivist closing block.
- `/threads`: new index page listing all six threads. Was a 404 before.
- `/thread/[id]`: per-thread page (inherits a backward-compat token alias
  visual treatment from Phase 5; needs its own redesign pass).
- `/dossier/[slug]`: redesigned. Eyebrow + huge title + lede + meta. Hero
  image above the reading column when the case has one mapped. 15 of 70
  cases currently have hero images.
- 16 public-domain archival images live under `public/img/archive/`. The
  full map is in `src/lib/case-images.ts`.
- Sixth thread (`gap-1974-2025`, "1974 through 2025, the silence") exists
  and is tagged on the five PURSUE cases whose events occurred during the
  gap (Kazakhstan 1994, Mexico 2003, Bronze Ellipsoid, orbs-launching-orbs,
  USPER). Pushed upstream.

### What is NOT yet redone in the new visual direction

These routes still inherit the **first** Phase 6 design through backward-
compat CSS aliases that map old token names onto the new monochrome system.
They build clean but visually still smell of the rejected first attempt:

- `/board` (React Flow corkboard, agent-written InvestigationBoard.tsx and
  custom node components in `src/graph/components/`)
- `/atlas` (Sigma WebGL network, NetworkAtlas.tsx)
- `/saved` (localStorage-driven saved-cases route)
- `/about` (essay, light mode)
- `/404`
- `/timeline` (Phase 5 era; the per-marker filter currently reads
  `data.thread` not `data.threads`, so timeline rendering is partial; see
  Known issues)
- `/map`
- `/evidence/[slug]`
- `/entity/[slug]`
- `/vault` (Phase 6 first-attempt placeholder)

The `src/components/Hero.astro`, `TopPlate.astro`, `CaseActions.astro`, the
three popovers, and the sub-agent-built graph node visuals all still exist
and still carry the first-attempt aesthetic in their internals. They have
NOT been deleted because tearing them out at once breaks Reading Plate
markup on the dossier page. Plan: rewrite or remove component-by-component
as each route gets redone.

### Known issues

- **Timeline empty.** `src/pages/timeline.astro` filters by
  `c.data.thread && c.data.title`. Extraction also writes `data.threads[]`
  (the new array form), but many cases still have a `thread` value, so this
  should partially work. If still empty, switch the filter to read
  `data.threads?.[0] ?? data.thread`. Same pattern is used correctly on
  homepage and `/threads`.
- **`/board` and `/atlas`** were built by sub-agents and currently render
  a disconnected pile (or empty graph) because the relationships heuristic
  pass wrote edges to the submodule that the graph builder consumes
  correctly, but the visual style of the nodes still uses the old amber-
  glow palette. Confirm the graph data is there before redesigning visuals.
- **`serial` prop** is no longer accepted by `Base.astro` but six legacy
  Phase 5 pages still pass it (`map.astro`, `vault.astro`, `entity/[slug]`,
  `timeline.astro`, `evidence/[slug]`, `thread/[id]`). Astro does not
  fail on unknown props so the build still passes, but `astro check`
  reports it as a warning. Strip it from each page during its redesign
  pass; don't try to re-add it to `Base.astro`.
- **Apollo 17 image** is 2.1 MB (the panoramic frame). Could be smaller via
  a manual resize or by switching to Astro's `<Image>` component. Not
  blocking.

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
  Used for h1, h2, pull quotes, italicized section notes.
- Body: Inter (Google Fonts, weights 400/500/600).
- Mono: JetBrains Mono (Google Fonts, weights 400/500). Used for case IDs,
  dates, classification stamps, navigation labels, footer.

### Hard rules


- All images get `filter: grayscale(1) contrast(1.05)` to strip sepia/color
  tint and integrate with the monochrome system..
- Selection inverts (`::selection { background: var(--fg); color: var(--bg); }`).
- Focus ring is a 2px solid `var(--fg)` outline with 2px offset.

### Reusable patterns

- `.prose` class on long-form copy: 64ch max-width, Fraunces h2/h3, Inter
  body 18px line-height 1.65, italicized Fraunces blockquote with 2px left
  rule.
- `.redaction` inline span: solid black background, transparent text,
  `user-select: none`.
- `.page-shell`, `.page-main`, `.page-footer` shells in `globals.css`.
- Search modal (`SearchHUD.astro`) uses Fraunces 28px input, no glow,
  border `1px solid var(--fg)`.

---

## Image system

- All images live in `public/img/archive/` (16 files, ~12 MB total).
- All public-domain federal works or Wikimedia Commons.
- Mapping is in `src/lib/case-images.ts`. Function: `caseImage(slug)`
  returns `{ src, alt, caption }` or `null`.
- Adding a new image:
  1. Drop the file in `public/img/archive/`.
  2. Add an entry to `CASE_IMAGES` (or `ENTITY_IMAGES`) in `case-images.ts`.
  3. The homepage index list and dossier page pick it up automatically.

### Currently mapped (15 cases, 2 entities)

See `src/lib/case-images.ts`. Cases with imagery: Hottel, three Arnold
variants, Maury Island, Brown-Davidson, Mantell, Rhodes, Apollo 17 VM6,
Hoover-Scully, two pre-Scully rumor cases, Project Grudge, Section 10
civilian cluster, Chesapeake abduction 1967. Entities: J. Edgar Hoover,
Kenneth Arnold.

### Sourcing more images

When David says "find more visuals":
- Wikimedia Commons via `https://commons.wikimedia.org/wiki/Special:FilePath/<filename>?width=1600`
  — this is the resize endpoint that works. The `/wiki/commons/thumb/<x>/<xx>/<File>/Npx-<File>`
  pattern returns HTTP 400 for non-standard widths.
- FBI Vault (`vault.fbi.gov`) for original document scans.
- NASA images (`images.nasa.gov`) for Apollo / lunar surface.
- All US federal works are public domain. Wikimedia Commons files usually
  state their license clearly.
- Always set `User-Agent: the-ufo-files-archive/1.0 (drjr1021@gmail.com)`
  for Wikimedia downloads, per their requested-attribution policy.
- Do NOT use AI-generated UFO imagery. Do NOT use stock photography. The
  whole point of this archive is "the files are the files."

---

## Corpus and extraction

### Schema

`src/content.config.ts` defines three collections via Astro glob loader:
- `fbiCases` <- `content/archive/fbi-62hq83894/cases/*.md` (57 files)
- `pursueCases` <- `content/archive/pursue-release-01/cases/*.md` (6 files)
- `entities` <- `content/archive/context/**/*.md` (6 files)

Phase 6 fields (all optional in Zod, populated by extraction in practice):
`caseId`, `source`, `relationships[]`, `entities[]`, `threads[]`, `nodeType`,
`agency`, `classification`, `confidence`, `witnesses[]`, `geo`, `date`,
`dateRange`, `summary`, `excerpt`, `heroAsset`.

The `stringish` coercion is critical: numeric YAML tags (e.g. `1947`) get
coerced to strings so downstream `.includes`/`.startsWith` work. Never
remove it.

### Pipeline (under `scripts/extract/`)

- `extract.ts` — deterministic. Reads frontmatter + body sections (`## Summary`,
  `## Connections`, witness heuristics), writes patches. Idempotent.
- `extract-ai.ts` — OpenRouter gap-fill via `deepseek/deepseek-v4-pro`. Fills
  `witnesses`, `summary`, `excerpt`, `nodeType`, `date`, `agency`,
  `classification`. Reads `OPENROUTER_API_KEY` from env.
- `geocode.ts` — Nominatim, 1.1s spacing, cached.
- `relationships.ts` — heuristic mentions-edge inference via entity overlap,
  capped at 12 edges per case. Idempotent.
- `coverage.ts` — exits non-zero if any required field is missing.
- `run-all.bat` — chains the four scripts plus coverage.

To re-run after editing a case upstream:
1. cd into the submodule, edit and commit upstream, push to
   `wretcher207/the-ufo-files`.
2. Back in the parent: `git submodule update --remote content/archive &&
   git add content/archive && git commit -m "Bump archive pointer".`
3. `.\scripts\extract\run-all.bat` if you need to re-run extraction.

---

## How to run

```sh
.\dev.bat              # starts dev server (auto-picks first free port from 4321)
.\build.bat            # full production build + Pagefind index
```

Or manually:

```sh
npm install
npm run dev            # astro dev
npm run build          # astro build && pagefind --site dist
npm run preview        # astro preview
```

When David says "show me," start the dev server and tell him the URL. He
expects `http://localhost:4321/` but Astro will pick the next free port if
that one is taken (4322, 4323, etc). Watch the dev server output for the
real URL.

---

## File map (current, post-rebuild)

```
src/
├── layouts/
│   └── Base.astro                  shell, fonts, mode resolver, chrome, footer
├── components/
│   ├── OperatorChrome.astro        48px text strip, mobile hamburger
│   ├── SearchHUD.astro             "/" trigger, Pagefind-backed modal
│   ├── CaseActions.astro           [legacy] still used on dossier
│   ├── CitePopover.astro           [legacy]
│   ├── SharePopover.astro          [legacy]
│   ├── ExportPopover.astro         [legacy]
│   ├── Hero.astro                  [legacy first-attempt, not used on /]
│   ├── TopPlate.astro              [legacy, replaced by inline masthead on dossier]
│   ├── ProvenanceFooter.astro      [legacy, still on dossier]
│   ├── EntityRail.astro            [legacy]
│   ├── RelatedCases.astro          [legacy]
│   ├── SocialsStrip.astro          [legacy, not currently used]
│   ├── HomeBoardPreview.tsx        [legacy from first-attempt homepage]
│   └── HeroComposition.ts          [legacy]
├── pages/
│   ├── index.astro                 *** redone, monochrome typography wall
│   ├── threads.astro               *** new, monochrome
│   ├── dossier/[slug].astro        *** redone, hero image + reading column
│   ├── about.astro                 NOT redone yet
│   ├── 404.astro                   NOT redone yet
│   ├── saved.astro                 NOT redone yet
│   ├── board.astro                 NOT redone, agent-written
│   ├── atlas.astro                 NOT redone, agent-written
│   ├── thread/[id].astro           NOT redone
│   ├── timeline.astro              NOT redone (and possibly empty: see Known issues)
│   ├── map.astro                   NOT redone
│   ├── evidence/[slug].astro       NOT redone
│   ├── entity/[slug].astro         NOT redone
│   ├── vault.astro                 first-attempt placeholder, may not be needed
│   └── graph.astro                 meta-refresh fallback to /board
├── styles/
│   ├── brand.css                   *** monochrome token system + backward-compat aliases
│   └── globals.css                 *** chrome, prose, search modal, footer
├── lib/
│   ├── threads.ts                  six threads with metadata
│   ├── case-utils.ts               getRenderableCases, headlineDate, threadOf, tidyTitle, etc.
│   ├── case-images.ts              *** slug -> image mapping
│   ├── entities.ts                 entity utilities
│   └── rewrite-md-links.ts         rehype plugin for markdown link rewriting
├── content.config.ts               schema, stringish coercion, three collections
├── graph/                          [agent-built first-attempt React Flow + Sigma]
└── pagefind, etc.

public/
├── favicon.svg
├── _redirects                      Netlify: /graph -> /board 301
└── img/archive/                    *** 16 public-domain archival images

scripts/extract/                    extraction pipeline (working, 100% coverage)
content/archive/                    git submodule, pinned to wretcher207/the-ufo-files
```

Files marked `***` are the current Phase 6 v2 (monochrome) work. Files
marked `[legacy]` or `NOT redone` are either the first-attempt agent-built
work or the Phase 5 original.

---

## Recommended next-session work, in priority order

1. **Redo `/about`** — light mode, typography wall, no boxed sections.
   Voice profile mandatory.
2. **Redo `/404`** — dark mode, in voice, no decoration.
3. **Diagnose and redo `/timeline`** — confirm it filters from `data.threads`
   first. Visualize the 1974-2025 gap explicitly as empty space in the
   timeline; it's a deliberate void.
4. **Redo `/thread/[id]`** — currently inherits Phase 5 aesthetic. Reuse the
   `/threads` index page's row treatment for the case list inside each
   thread.
5. **Redo `/entity/[slug]`** — light mode like dossier.
6. **Redo `/evidence/[slug]`** — dark mode.
7. **Redo `/map`** — full-bleed monochrome map, white dots on black,
   probably Leaflet with a custom dark tile layer.
8. **Decide fate of `/board` and `/atlas`** — these are the most agent-slop-
   smelling routes. They render real graph data (relationships exist after
   the heuristic pass) but the node styling is the first-attempt amber-tack
   visual. Either redo from scratch in monochrome, or simplify to a single
   monochrome graph view and retire the dual `/board` `/atlas` concept.
9. **Source more archival images** — Wikimedia Commons + FBI Vault has a
   lot more usable material. Targets: more 1947-1950 newspaper clippings,
   Project Twinkle documents, Maury Island slag photos if any, Mantell
   newspaper coverage, AARO press release images, USPER context.
10. **Delete the legacy components** that are no longer referenced (Hero,
    TopPlate, HeroComposition, HomeBoardPreview, etc.) once their last
    consumer is rewritten.

### Things David may bring up

- The homepage still feels sparse — adding more strategic full-bleed images
  between sections is the right next move, not adding more text.
- The dossier reading column might still feel like AI text-wall — pull-
  quotes set in Fraunces italic at scale would help.
- Per-case heroes are missing on ~55 of 70 cases. Adding more is the work
  in priority item 9.

---

## Things that have already bitten me, so they do not bite you

- The project `CLAUDE.md` previously contained an unauthorized "No new
  framework" rule. It is now corrected to read "React is scoped to /board
  and /atlas (graph routes) only."
- The original Phase 6 plan and HANDOFF approved a warm-dark + warm-light
  palette with amber and verdigris accents on paper. That same palette,
  rendered, was rejected as "shit brown stereo instructions." Hex codes
  that look fine in a swatch render brown in mass. Build a test page
  before committing a palette.
- Sub-agents reflexively reach for the AI-default visual language even
  when instructed not to. Five different sub-agents simultaneously built
  bordered card grids despite explicit prompts forbidding them. If you
  delegate visual work, audit before declaring done.
- `gray-matter` throws on malformed YAML. The extraction scripts handle
  this via try/catch; preserve that pattern in any new frontmatter parser.
- The `entities_mentioned` legacy field and the single `thread` enum
  legacy field are BOTH still in the schema and still referenced. Do not
  remove either. Extraction reads them and aliases them onto the new
  array fields.
- Wikimedia thumbnail URLs in the `commons/thumb/<x>/<xx>/<File>/Npx-...`
  format return HTTP 400 for non-standard widths. Use the
  `Special:FilePath/<filename>?width=N` endpoint instead. That endpoint
  works for any reasonable width.
- The OpenRouter API key has been rotated once during this work. Current
  key is the user env var `OPENROUTER_API_KEY`. If extraction returns 401,
  ask David for a fresh key rather than silently failing.
- Astro picks the next free port if the default is taken. Always read the
  dev server output to confirm the real URL before telling David where to
  look. He uses Windows and prefers double-click `.bat` launchers.

---

## When you finish

Do not merge `phase-6-redesign` into `main` without explicit instruction.
David asked to keep `main` (the original Phase 5 site) preserved as a
fallback while the rebuild continues. Push to `origin/phase-6-redesign` as
work progresses. He can compare both versions any time with
`git checkout main` and `git checkout phase-6-redesign`.

Do not write a closing summary after you finish. The diff shows the work.
