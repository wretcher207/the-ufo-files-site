# DossierPanel Contract

Shared component spec for `/board` (Agent 4) and `/atlas` (Agent 5). Both routes ship the same panel, identical props, identical behavior. Agent 6 owns the Case Actions popovers; Agents 4 and 5 only render the action bar.

## Location

`src/graph/components/DossierPanel.tsx` (built by Agent 4, imported by Agent 5).

## Props

```ts
import type { EvidenceEdge, EvidenceNode } from '../types';

export interface DossierPanelProps {
  node: EvidenceNode;
  edges: EvidenceEdge[];          // edges where node.id is source OR target
  relatedNodes: EvidenceNode[];   // resolved counterparties, ordered by relevance
  onClose: () => void;
}
```

Both consumers compute `edges` and `relatedNodes` from the in-memory graph and the selected node id (`useGraphStore().selectedNodeId`). The panel itself does not call `getGraph()`.

## Behavior

- Desktop (>= 768px): slides in from right, 420px wide, full viewport height, fixed position over the canvas. Escape closes.
- Mobile (< 768px): bottom sheet, 85vh max, rounded top corners, swipe-down dismisses (vertical drag > 60px or velocity > 0.5).
- Backdrop: subtle dim behind the panel on mobile only. Desktop has no backdrop, the graph stays interactive.
- Focus trap inside the panel while open. First focusable element receives focus on mount.
- Closing the panel calls `onClose`, which the parent uses to `clearSelection()` on the store.

## Visual

Both routes are dark mode (`data-mode="dark"`). Panel matches.

- Background: `var(--surface-1)` with a hairline top rule at `var(--rule)`.
- Inset padding: 24px desktop, 20px mobile.
- Header row:
  - Case ID mono caps, `var(--mono)` font, `var(--text-2)` color, 11px, letter-spacing 0.08em. Pulled from `node.id`.
  - Title in Instrument Serif, 28px desktop / 22px mobile, `var(--text-1)`, line-height 1.15.
  - Close X button top-right, 32x32 hit target, ghost style.
- Meta strip below header (mono, 12px, gap 16px):
  - Date if `node.date`
  - Agency stamp if `node.agency` (rendered with stamp treatment per BRAND_TOKENS)
  - Classification chip if `node.classification`
  - Confidence chip if `node.confidence`, color tied to value (low / medium / high)
- Summary block: `node.summary` if present, body font, `var(--text-2)`, max 4 lines with fade.
- Excerpt block (collapsible, default collapsed): `node.excerpt` if present.
- Related list: heading "Connected" mono caps, then up to 8 `relatedNodes`. Each row shows mono case-id, title (truncate), and a relationship tag pulled from the matching `edges` entry. Click a row to `selectNode(row.id)` on the store. The panel updates in place.
- Primary CTA: "Open Dossier ->" button, amber (`var(--accent-amber)`), full-width on mobile, inline on desktop, links to `/dossier/${node.slug}` for cases or `/entity/${node.slug}` for entities.

## Case Actions row

Pinned to panel bottom. 5 actions in a single row, evenly spaced. Ghost icon buttons with mono caps labels under each icon.

1. Save (bookmark icon)
2. Open Original (external-link icon)
3. Cite (quote icon)
4. Share (share icon)
5. Export (download icon)

Agents 4 and 5 render the static row only. Each button is a `<button>` with `data-action="save|open|cite|share|export"`. Agent 6 attaches popovers via event delegation.

Open Original is a link if `node.heroAsset?.src` or a known `source.officialUrl` from the case frontmatter exists. Agents 4 and 5 do not need to resolve that today, leave the button enabled and let Agent 6 wire the URL during the actions pass.

## Animation

- Desktop slide: `transform: translateX(100%) -> 0`, 240ms, cubic-bezier(0.2, 0, 0, 1).
- Mobile sheet: `transform: translateY(100%) -> 0`, 280ms, same easing.
- View Transitions: panel is excluded from the route-level `ClientRouter` transition (it lives outside the page-level transition root).

## State source

The panel never owns selection state. It reads `selectedNodeId` from `useGraphStore`. The parent route resolves `node`, `edges`, `relatedNodes` and passes them down. When `selectedNodeId` is null, the parent does not render the panel.

## Accessibility

- `role="dialog"`, `aria-modal="false"` (desktop) or `aria-modal="true"` (mobile, since it dims).
- `aria-labelledby` points to the title element.
- Close button has `aria-label="Close dossier panel"`.
- Related list items are real links (`<a href>`) when they navigate to dossier pages, real buttons when they update the in-panel selection.

## Out of scope

- Save persistence (Agent 6 handles via localStorage from `/saved` route).
- Citation formatting (Agent 6).
- Share URL builder (Agent 6).
- Export bundle (Agent 6, JSZip).
- The mobile graph variants (`BoardMobile.tsx`, `AtlasMobile.tsx`) reuse this same panel without modification.
