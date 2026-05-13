# BRAND_TOKENS

Reference for the Phase 6 token system. Source of truth: `src/styles/brand.css`. All variables resolve in two modes via `[data-mode="dark"]` (default) and `[data-mode="light"]` on `<html>`. Mode is set in `src/layouts/Base.astro` from the route.

Route to mode:
- LIGHT: `/dossier/[slug]`, `/entity/[slug]`, `/about`
- DARK: everything else (`/`, `/board`, `/atlas`, `/map`, `/timeline`, `/thread/[id]`, `/evidence/[slug]`, `/saved`, `/404`)

No raster textures. No scanlines. No grunge overlays. No grid backgrounds. Texture comes from typography, hairline rules, and color temperature only.

## Palette (mode-resolved)

| Token              | DARK      | LIGHT     | Purpose                              |
|--------------------|-----------|-----------|--------------------------------------|
| `--bg-base`        | `#0F0D0B` | `#F4EFE6` | Page background                      |
| `--bg-raised`      | `#181613` | `#FBF7EF` | Cards, panels                        |
| `--bg-overlay`     | `#221E1A` | `#FFFFFF` | Popovers, sheets, modals             |
| `--ink-primary`    | `#F2EBE0` | `#1A1612` | Body text, headings                  |
| `--ink-secondary`  | `#A89B8C` | `#4D4640` | Lede, lists, secondary copy          |
| `--ink-muted`      | `#6B6358` | `#8A8175` | Mono metadata, captions              |
| `--rule`           | `#2A251F` | `#D8CFC0` | Hairline borders, dividers           |

## Accents (semantic, NOT decorative)

| Token                       | Hex       | Use only for                                                         |
|-----------------------------|-----------|----------------------------------------------------------------------|
| `--accent-amber-dark`       | `#E8A857` | Resolved as `--accent-amber` in DARK mode                            |
| `--accent-amber-light`      | `#B8741F` | Resolved as `--accent-amber` in LIGHT mode                           |
| `--accent-amber`            | resolved  | Primary action, selected state, tack glow, supports/derived_from edges, focus ring |
| `--accent-verdigris-dark`   | `#5C8474` | Resolved as `--accent-verdigris` in DARK mode                        |
| `--accent-verdigris-light`  | `#3D5C50` | Resolved as `--accent-verdigris` in LIGHT mode                       |
| `--accent-verdigris`        | resolved  | Contradictions, redactions, classified markers, contradicts edges, pull-quote rule |

## Typography

| Token              | Value                                       |
|--------------------|---------------------------------------------|
| `--font-display`   | `'Instrument Serif', Iowan Old Style, Georgia, serif` |
| `--font-body`      | `'Schibsted Grotesk', system sans`          |
| `--font-mono`      | `'Azeret Mono', JetBrains Mono, SF Mono, Menlo, monospace` |
| `--weight-display` | `400` (Instrument Serif ships one weight)   |
| `--weight-body`    | `400`                                       |
| `--weight-body-md` | `500`                                       |
| `--weight-body-sb` | `600`                                       |
| `--weight-mono`    | `400`                                       |
| `--weight-mono-md` | `500`                                       |

Use:
- Instrument Serif: display only (h1, h2, hero titles, pull quotes)
- Schibsted Grotesk: body, UI, h3, buttons, nav
- Azeret Mono: case IDs, dates, coords, eyebrows, mono caps labels, breadcrumbs

Sizes: `--fs-xs 11`, `--fs-sm 13`, `--fs-base 15`, `--fs-md 17`, `--fs-lg 22`, `--fs-xl 32`, `--fs-2xl 48`, `--fs-3xl 72`, `--fs-4xl 112`.

Line heights: `--lh-tight 1.05`, `--lh-snug 1.25`, `--lh-normal 1.55`, `--lh-loose 1.70`.

Tracking: `--tracking-tight -0.02em`, `--tracking-normal 0`, `--tracking-wide 0.06em`, `--tracking-wider 0.14em`, `--tracking-widest 0.32em`.

## Spacing

| Token     | Value  |
|-----------|--------|
| `--sp-0`  | `0`    |
| `--sp-1`  | `4px`  |
| `--sp-2`  | `8px`  |
| `--sp-3`  | `12px` |
| `--sp-4`  | `16px` |
| `--sp-5`  | `24px` |
| `--sp-6`  | `32px` |
| `--sp-7`  | `48px` |
| `--sp-8`  | `64px` |
| `--sp-9`  | `96px` |
| `--sp-10` | `128px`|

## Radii and borders

| Token         | Value |
|---------------|-------|
| `--radius-0`  | `0`   |
| `--radius-1`  | `2px` |
| `--radius-2`  | `4px` |
| `--bw-hair`   | `1px` |
| `--bw-thin`   | `1px` |
| `--bw-medium` | `2px` |

Hard-edge bias. Use `--radius-1` for buttons, `--radius-0` everywhere else.

## Motion

| Token             | Value                                   |
|-------------------|-----------------------------------------|
| `--dur-fast`      | `120ms`                                 |
| `--dur-base`      | `220ms`                                 |
| `--dur-slow`      | `420ms`                                 |
| `--dur-xfade`     | `200ms` (view transitions between modes)|
| `--ease-out`      | `cubic-bezier(0.16, 0.84, 0.32, 1)`     |
| `--ease-in-out`   | `cubic-bezier(0.65, 0, 0.35, 1)`        |

All motion respects `prefers-reduced-motion: reduce` (handled globally in `globals.css`).

## Focus and elevation

| Token          | Value                                          |
|----------------|------------------------------------------------|
| `--focus-ring` | `0 0 0 2px var(--accent-amber)` (mode-aware)   |
| `--elev-0`     | `none`                                         |
| `--elev-1`     | `0 1px 0 var(--rule)`                          |
| `--elev-2`     | `0 8px 24px rgba(0,0,0,0.32)` (use sparingly)  |

## Utility classes (in `brand.css`)

| Class            | Purpose                                              |
|------------------|------------------------------------------------------|
| `.t-display`     | Hero display, Instrument Serif 72px                  |
| `.t-h1`          | h1, Instrument Serif 48px                            |
| `.t-h2`          | h2, Instrument Serif 32px                            |
| `.t-h3`          | h3, Schibsted Grotesk 22px / 600                     |
| `.t-lead`        | Lede, 17px / 1.70 / secondary                        |
| `.t-body`        | Body, 15px / 1.55 / secondary                        |
| `.t-small`       | Small, 13px / muted                                  |
| `.t-mono`        | Mono base, 11px / wide tracking                      |
| `.t-label`       | Mono uppercase eyebrow, widest tracking              |
| `.rule`          | Hairline top border                                  |
| `.redaction-bar` | Inline crisp verdigris bar for redactions in prose   |

## Backward-compat aliases

`brand.css` still exposes legacy DPD names (`--bg`, `--bg-1`, `--bg-2`, `--fg-1`, `--fg-2`, `--fg-3`, `--border`, `--border-strong`, `--accent`, `--phosphor`, `--amber`, `--crt-glow`, etc.) that map onto the new tokens. They exist so Phase-5 surfaces do not crash before Wave 2 rebuilds them. New code: use the new token names. Wave 2 strips the aliases once all consumers migrate.
</content>
</invoke>