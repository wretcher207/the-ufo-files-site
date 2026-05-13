# the-ufo-files-site

Astro 5 investigation site for the May 8, 2026 PURSUE UFO file release plus FBI 62-HQ-83894. Published as `theufofiles.com`. An archive by Dead Pixel Design.

## Stack

- **Astro 5** + MDX, static output (no SSR adapter).
- **Tailwind v4** via `@tailwindcss/vite` (CSS-first config, no `tailwind.config.*`).
- **Pagefind** static search, indexed post-build (`astro build && pagefind --site dist`).
- **TypeScript** strict via `@astrojs/check`.
- **Playwright** (dev only) for ad-hoc page checks.

## Content model

Case content lives in a **git submodule** at `content/archive/` → `github.com/wretcher207/the-ufo-files`. Three Astro content collections (see `src/content.config.ts`):

- `fbiCases` — `content/archive/fbi-62hq83894/cases/*.md`
- `pursueCases` — `content/archive/pursue-release-01/cases/*.md`
- `entities` — `content/archive/context/**/*.md`

Frontmatter is permissive — `stringish` coerces YAML integers (`1947`) to strings so downstream `.includes`/`.startsWith` work. Don't tighten that schema without checking the existing markdown.

## Routes

| Route | File |
|---|---|
| `/` | `src/pages/index.astro` (featured split + entity rail) |
| `/dossier/[slug]` | individual case viewer |
| `/entity/[slug]` | person/place/program pages |
| `/thread/[id]` | five narrative threads (see `thread` enum in content.config.ts) |
| `/evidence/[slug]` | redacted-document viewer |
| `/timeline` | chronological scrub |
| `/graph` | entity-relationship graph |
| `/map` | geolocated incidents (keyboard-accessible markers) |
| `/about` | methodology |
| `/404` | custom |

## Commands

```sh
npm run dev        # astro dev
npm run build      # astro build && pagefind --site dist
npm run preview    # astro preview
```

David prefers double-clickable `.bat` files for any multi-step build. If we add a deploy/build chain beyond `npm run build`, write a `.bat` next to it.

## Conventions

- **React is scoped to `/board` and `/atlas` (graph routes) only.** All other routes stay pure Astro. The graph stack (`@xyflow/react`, `zustand`, `graphology`, `sigma`, `elkjs`, `d3-force`) loads exclusively on those two routes via `client:only="react"`.
- **Markdown link rewriting** goes through `src/lib/rewrite-md-links.ts` (rehype plugin). Wire it into both `markdown.rehypePlugins` and the MDX integration when adding new content surfaces.
- **Brand tokens** in `src/styles/brand.css`, layered into `globals.css`. Don't hardcode hex — use the CSS vars.
- **OperatorChrome** is the persistent top frame; `Base.astro` wraps every page and emits canonical + og:url.
- **Pagefind external** is configured in `astro.config.mjs` (`rollupOptions.external: [/^\/pagefind\//]`). Don't remove — Pagefind ships its own runtime to `/pagefind/` after build.
- **`devToolbar.enabled: false`** intentional. Leave it off.

## Submodule workflow

```sh
git submodule update --remote content/archive   # pull latest archive
git add content/archive
git commit -m "Sync archive content"
```

The site **pins to a specific submodule commit** — production deploys must check out submodules (`git submodule update --init --recursive` or Netlify's "Fetch Git submodules" toggle).

## Phase history

- **Phase 1** — Astro foundation, DPD tokens, content collections, minimal index
- **Phase 2** — Dossier viewer, cross-ref rail, provenance card, Pagefind ⌘K search
- **Phase 3** — Thread + entity pages, EntitiesInCase rail, featured split, custom 404
- **Phase 4** — Timeline, entity graph, evidence viewer, view transitions, redaction styling
- **Phase 5** — Map, methodology page, canonical/og:url polish, a11y markers

Phase 6 — TBD (next).

## Things to not break

- The `stringish` coercion in `content.config.ts` — silently drops YAML number-typed tags if removed.
- The `rewriteMdLinks` plugin is registered **twice** (markdown + mdx). Both are needed; MDX runs its own pipeline.
- `content/archive` is a submodule — never edit files inside it from this repo. Edit upstream in `the-ufo-files` and bump the pointer.
