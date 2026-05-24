# Homepage Polish Notes

Generated for Task H09 — Homepage Polish v1. This pass refines the existing Knowledge v1 homepage into a more visually balanced Polish v1 state. No commit was created and no deploy was performed.

## Visual notes

The lower homepage now uses stronger section separation through alternating backgrounds, bordered bands, rounded containers, and consistent vertical rhythm. Knowledge Hub was upgraded from a flat placeholder grid into a centered editorial section with larger heading scale, increased paragraph line-height, softer gradient background, and stronger card affordance. Cards now use rounded `2xl` corners, consistent padding, subtle shadows, and small visual accent bars to improve scanability without introducing interactive behavior.

A new static Trust layer was added after Knowledge Hub. It communicates the intended Formula Universe direction through four trust signals: `1000+ tools`, `Knowledge graph`, `Formula universe`, and `AI native`. These are static statements only; no live counts, dynamic data, personalization, or registry reads were introduced.

The CTA section was added near the end of the homepage before the footer. It provides three static pathways: `Explore tools`, `Explore knowledge`, and `Start journey`. These are presented as cards rather than new functional controls, preserving the no-new-features requirement while clarifying the page ending.

## Hierarchy notes

The hierarchy now moves from broad knowledge positioning into trust proof, then tool clusters, latest guides, CTA, and footer. Headings use clearer scale separation between section titles and card titles. Supporting text uses longer line-height for review readability. The Latest Guides section includes a small right-side note on desktop to balance the header area and prevent the grid from feeling disconnected.

Tool Clusters were visually separated from Knowledge Hub with a bordered muted band. Latest Guides returned to a clean container layout, creating a calmer progression before the final CTA. Footer clarity was improved by separating the product identity text from the link group and removing the visual divider character from the previous inline footer link row.

## Mobile notes

Mobile spacing was adjusted with `py-14 md:py-20`, single-column grids, consistent `gap-4` / `gap-5`, and compact card padding. The Trust and CTA sections use nested rounded panels that collapse into readable single-column content. Footer links wrap naturally with `gap-x` and `gap-y` spacing, reducing crowding on narrow screens.

The mobile screenshot should show clear Knowledge Hub cards, the Trust layer, and the start of the following sections without horizontal overflow. No mobile-only routes, state, or dynamic behavior were added.

## Scope notes

Edited file: `client/src/pages/Home.tsx`.

Created review file: `docs/reviews/HOMEPAGE_POLISH_NOTES.md`.

Required screenshots:

- `docs/screenshots/homepage-polish-desktop.jpg`
- `docs/screenshots/homepage-polish-mobile.jpg`

No `App.tsx`, route files, registry files, or dynamic data sources were intentionally modified by H09. Existing footer links remain unchanged as pre-existing navigation patterns; the new CTA items are static cards and do not add routes.
