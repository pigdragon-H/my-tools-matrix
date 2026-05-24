# Homepage Migration Plan

Formula Universe Task H04 is a draft-only migration plan. It maps the current production homepage implementation in `client/src/pages/Home.tsx` to the target prototype direction represented by `client/src/prototypes/HomepageGoldPrototype.tsx`. This document does not authorize implementation. It does not edit `Home.tsx`, `App.tsx`, routes, registries, shared tool configuration, deployment settings, or commits.

## Current to target summary

The current homepage is a stable MVP-style directory. It contains a Hero section, a Features Bar, a category grid powered by shared category and tool configuration, and a basic Footer. It also sets default SEO metadata. The target prototype is a Formula Universe homepage that adds a richer discovery and journey architecture: Hero, Quick Search, Trending Tools, Trending Topics, Discovery Flow, Journey Cards, Next Step Suggestions, Featured Tools, Featured Topics, Universe Explorer, Knowledge Hub, Tool Clusters, Latest Guides, and an expanded Footer.

Migration should not be a direct copy-paste from the prototype. The prototype uses static placeholders, while production must use reviewed data sources, accessible markup, real internal links, safe copy, schema planning, SEO metadata, mobile QA, and rollback protection. The production homepage should be migrated in controlled phases after GPT review and Victor approval.

## Section migration matrix

| Section | Current exists? | Replace? | Keep? | Remove? | Risk | Migration order |
|---|---:|---:|---:|---:|---|---:|
| Hero | Yes | Partial | Keep core homepage position, update message | No | The current hero has a broad calculator value proposition but does not clearly express Formula Universe, discovery, or journeys. Replacing too aggressively could harm current clarity or existing CTA behavior. | 1 |
| Feature bar | Yes | Partial | Keep as trust/proof concept if useful | No immediate removal | The current feature bar communicates instant calculation, privacy, and visualization. It may become redundant if trust signals move into Hero, Knowledge Hub, or Footer. Removing it too early could reduce trust cues. | 2 |
| Categories | Yes | Partial | Keep category coverage, reframe inside Universe Explorer | No immediate removal | The category grid is currently the main discovery engine and uses real shared config. Removing it before an alternative explorer is production-ready would break broad browsing. | 3 |
| Featured Tools | No | Add | N/A | N/A | Needs governance. Production must decide which calculators can be featured, whether Gold Tool status is required, and how links are sourced. | 2 |
| Featured Topics | No | Add | N/A | N/A | Topic labels must be reviewed to avoid thin or misleading semantic hubs. Health and finance topics require disclaimers and source-backed knowledge paths. | 3 |
| Discovery | No | Add | N/A | N/A | Search placeholders cannot ship as fake search. Production must either implement real search, link to reviewed filtered indexes, or clearly label static suggestions. | 2 |
| Universe Explorer | Partial through Categories | Replace category-only grid with explorer model over time | Keep category browsing within it | Do not remove category coverage until explorer works | Highest structural migration risk because it changes the homepage’s main navigation model. It must remain crawlable and accessible. | 4 |
| Knowledge Hub | Only blog link in hero/footer | Add | Keep blog as one path | No | Requires reviewed article selection, source quality, editorial standards, and safe claims. Without content governance, it can become decorative or stale. | 4 |
| Tool Clusters | No | Add | N/A | N/A | Cluster relationships can imply recommendations. Health and finance clusters must be educational and non-diagnostic/non-advisory. | 5 |
| Journey | No | Add | N/A | N/A | Journey Cards create strong retention but need governance, safety review, and link availability. Premature journeys can overpromise outcomes. | 5 |
| Latest Guides | No | Add | N/A | N/A | Requires a maintained content source and freshness rules. A stale latest section can harm trust. | 4 |
| Footer | Yes | Partial | Keep legal/policy links | No | Footer can become a spammy link dump if expanded without hierarchy. It should remain organized and accessible. | 5 |

## Proposed target structure

The production homepage should eventually follow this order, subject to review and mobile testing: Hero, Quick Search or Discovery entry, Trending Tools and Topics, Featured Tools, Featured Topics, Universe Explorer, Journey Cards and Next Step Suggestions, Knowledge Hub, Tool Clusters, Latest Guides, Footer. The exact order may change after testing. For example, Journey Cards may sit after discovery but before featured tools if retention is prioritized, or after Featured Topics if user comprehension is better there.

## Migration principles

The migration should preserve existing navigability while adding new layers gradually. The current category grid should not disappear until the Universe Explorer is production-ready. The current footer policy links should remain available throughout migration. The current SEO setup should be reviewed, not discarded. Any new homepage links should point only to existing, reviewed production pages unless a separate approved task creates new pages.

Static prototype placeholders must be replaced by production-safe content. Trending tools and topics require editorial selection rules. Journey cards require reviewed relationships. Knowledge Hub and Latest Guides require source-backed articles and freshness rules. Search must not be presented as functional unless it is implemented or clearly acts as a static suggestion surface.

## Section-specific notes

### Hero

Current Hero exists and should be evolved, not blindly replaced. The production hero should communicate Formula Universe, calculator discovery, and knowledge-backed journeys. The current CTA to `/tools/finance` is too narrow for a homepage-level primary CTA. A future primary CTA should route to a general tool discovery surface, search module, or universe explorer only after approval.

### Feature bar

The existing Features Bar can be retained temporarily as a trust strip. It may later be merged into Hero trust signals, Knowledge Hub trust notes, or Footer policy links. Migration should avoid losing the privacy and speed messaging.

### Categories

The current Categories grid is functional and data-driven. It should be preserved until a reviewed Universe Explorer can replace or absorb it. A safe migration path is to relabel the category grid as part of the explorer rather than remove it.

### Featured Tools

Featured Tools should be added with a small reviewed set. A production rule is needed: feature only high-demand tools, Gold Tools, or tools with stable routes and reviewed copy. Avoid adding tools that do not yet have production quality.

### Featured Topics

Featured Topics should be semantic, not arbitrary. Topics should have enough underlying tools and guides to justify homepage placement. Topics such as Weight Loss, Retirement, API, JSON, and FIRE require different safety and review standards.

### Discovery

Discovery includes Quick Search, Trending Tools, Trending Topics, and Discovery Flow. This layer should be implemented carefully. If real search is not ready, production should use static suggestion cards and avoid implying that typed search is functional.

### Universe Explorer

Universe Explorer should become the mature replacement for category-only browsing. It should expose category groups, tool indexes, topic indexes, and formula groups in a crawlable, accessible structure. It should not rely only on visual graph elements.

### Knowledge Hub

Knowledge Hub should expose reviewed educational content, formula explanations, source policy, and editorial standards. It is essential for trust but depends on content quality.

### Tool Clusters

Tool Clusters should show related calculators and safe next steps. Production clusters must be reviewed for accuracy and safe wording.

### Journey

Journey Cards should connect multi-step outcomes such as Retirement Journey, Weight Loss Journey, and Developer Journey. They should be added after data, links, and safety copy are approved.

### Latest Guides

Latest Guides should use an approved source of recent or strategically important articles. If the content source is not ready, this section should remain out of production.

### Footer

Footer should expand from basic links into organized columns while preserving legal links. Production footer expansion should avoid excessive sitewide links.

## Hold conditions

Do not begin implementation until GPT review and Victor approval are complete. Do not replace `Home.tsx` with the prototype. Do not connect prototype arrays directly to production. Do not add fake search behavior. Do not add unreviewed health or finance claims. Do not deploy without rollback criteria.
