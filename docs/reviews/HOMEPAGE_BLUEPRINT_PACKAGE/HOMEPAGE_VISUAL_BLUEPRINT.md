# HOMEPAGE_VISUAL_BLUEPRINT.md

## Purpose

This document defines the visual blueprint for the Formula Universe homepage. The homepage is the gateway into an AI Native Knowledge Operating System, not a decorative landing page. The layout must make the system understandable, navigable, and expandable by a small team while respecting the constitutional principles from `MASTER_CONTEXT.md`: `Identity > URL`, `Registry > Page`, and `Taxonomy > Content`.

This blueprint is a document-only specification. It does not authorize `.tsx` edits, route changes, registry changes, Canonical ID creation, commits, or deployment.

## Global Visual System

The homepage should use a clean, structured, knowledge-infrastructure layout. The visual language should communicate trust, clarity, precision, and expandable structure. It should avoid a campaign-style landing page feel. The user should feel they are entering a formula and metrics universe, not browsing a generic tool directory.

The global layout should use a consistent vertical rhythm. Desktop sections should have generous vertical spacing, clear section headers, and card grids. Mobile sections should collapse into a readable single-column or two-column layout depending on density and content length.

Recommended spacing system:

| Token | Desktop use | Mobile use |
|---|---|---|
| Section padding large | 96px top/bottom | 56px top/bottom |
| Section padding medium | 72px top/bottom | 44px top/bottom |
| Section padding compact | 48px top/bottom | 32px top/bottom |
| Card gap | 24px | 14px to 16px |
| Card padding | 24px to 32px | 16px to 20px |
| Header-to-body gap | 24px to 32px | 16px to 20px |
| Micro gap | 8px | 6px |

Section heights should be content-driven using padding and min-height rather than fixed hard heights. Fixed heights are discouraged because bilingual copy, mobile wrapping, and future knowledge cards can overflow.

## 1. Hero

### Visual Description

Hero is the system promise. It should introduce Formula Universe as a structured decision-support universe. The title must remain visually stable, with the highlighted promise line kept as one coherent visual block. The Hero should feel authoritative but not overhyped.

### Elements

- Product badge or status label
- Main title
- Highlighted value line
- Subtitle
- Primary CTA
- Secondary CTA
- Optional search entry or search teaser
- Optional background grid or formula-universe visual texture

### Static vs Dynamic

| Element | Current mode | Future mode |
|---|---|---|
| Title | Static | Static, controlled by copy system |
| Subtitle | Static | Static or copy config |
| CTAs | Static route-safe links | Registry-aware destinations after approval |
| Search entry | Static placeholder | Future semantic search / registry search |
| Background visual | Static | Static or generated system map visual |

### Desktop

Desktop Hero should use a wide text container to avoid title wrapping. The title should not break awkwardly, especially not between final Chinese characters. CTAs should be horizontal. Search may appear below the subtitle or directly after CTA if approved.

### Mobile

Mobile Hero should preserve title readability. The title may use responsive font sizing, but the highlighted promise should not create horizontal overflow. CTA buttons may stack or wrap naturally.

## 2. Discovery

### Visual Description

Discovery is the first interaction layer. It helps users move from uncertain intent into tools, topics, knowledge, or journeys. It should visually feel like an entry console into the knowledge system.

### Elements

- Section label
- Section title
- Short explanation
- Quick Search cards
- Trending Tools cards or chips
- Trending Topics cards or chips
- Discovery Flow card

### Static vs Dynamic

| Element | Current mode | Future mode |
|---|---|---|
| Quick Search | Static placeholder | Registry/search index |
| Trending Tools | Static placeholder | Analytics/curated registry |
| Trending Topics | Static placeholder | Knowledge graph / SEO index |
| Discovery Flow | Static explanation | AI-guided path recommendation |

### Desktop

Desktop may use a 3- or 4-column card layout. Trending and flow blocks can be arranged in a two-column lower row.

### Mobile

Mobile should stack cards vertically. Chips should wrap. Search placeholders must not imply live search unless live behavior exists.

## 3. Journey

### Visual Description

Journey is the decision-path layer. It should show that Formula Universe is not a tool list. Each Journey card should present a domain goal and a sequence of related formulas, tools, or concepts.

### Required Journey Cards

- Retirement
- Weight Loss
- Developer
- AI
- SEO
- Travel

### Card Count

Minimum: 6 cards.  
Desktop target: 3 columns x 2 rows.  
Mobile target: 1 column, or 2 columns only if cards are compact and readable.

### Static vs Dynamic

| Element | Current mode | Future mode |
|---|---|---|
| Journey labels | Static | Data contract from journey registry |
| Journey steps | Static | Tool/knowledge graph relationship |
| Journey links | Static or disabled | Registry-safe routes after approval |
| Recommendations | Not active | Future AI personalization |

### Desktop

Desktop Journey should use equal-height cards if possible. Each card should show a clear chain such as `FIRE → CAGR → Retirement → Withdrawal`.

### Mobile

Mobile cards should preserve the sequence order and avoid cramped horizontal arrows. If needed, arrows may wrap into stacked steps.

## 4. Knowledge

### Visual Description

Knowledge is the explanation layer. It should show users that every tool belongs to a formula, concept, limitation, and related learning path.

### Elements

- Knowledge Hub title
- Knowledge domains
- Concept cards
- Formula/explanation placeholders
- Relationship language such as explains, uses formula, has limitation, next step

### Static vs Dynamic

| Element | Current mode | Future mode |
|---|---|---|
| Knowledge cards | Static | Knowledge node registry |
| Relationships | Static explanation | Graph relationships |
| Examples | Static | Formula/example database |
| AI explanation | Not active | Controlled AI with references |

### Desktop

Desktop can use a 3-column or 4-column card layout depending on card count.

### Mobile

Mobile should stack knowledge cards. Long explanations should be concise.

## 5. Clusters

### Visual Description

Clusters organize the universe by canonical taxonomy. This layer must respect the fixed website category keys and avoid unauthorized aliases.

### Required Tool Clusters

- finance
- health
- dev
- education
- science
- travel
- productivity
- ai

### Card Count

Exactly 8 cluster cards for the final homepage blueprint.

### Static vs Dynamic

| Element | Current mode | Future mode |
|---|---|---|
| Cluster labels | Static | Canonical taxonomy config |
| Cluster descriptions | Static | Category metadata |
| Tool counts | Static or omitted | Registry-derived |
| Links | Route-safe only | Registry/category routes after approval |

### Desktop

Desktop target is 4 columns x 2 rows or 2 columns x 4 rows depending on available width.

### Mobile

Mobile should use single-column cards or compact two-column labels if descriptions are short.

## 6. Guides

### Visual Description

Guides connect tools to explanations and SEO content. This section should feel educational, not promotional.

### Elements

- Latest Guides title
- Guide cards
- Short guide summaries
- Optional domain badges

### Static vs Dynamic

| Element | Current mode | Future mode |
|---|---|---|
| Guide cards | Static | Content index / SEO registry |
| Guide links | Static or route-safe | Approved guide routes |
| Guide freshness | Manual | Content pipeline |

### Desktop

Desktop can use 4 cards in one row or 2x2 grid.

### Mobile

Mobile should stack guide cards.

## 7. Trust

### Visual Description

Trust proves the system is structured and careful. It should not make unsupported claims. It should communicate scale, knowledge structure, formula logic, and AI-native readiness.

### Elements

- Trust title or label
- Trust metric cards
- Safety / limitation language
- Formula and knowledge graph positioning

### Static vs Dynamic

| Element | Current mode | Future mode |
|---|---|---|
| Trust claims | Static and conservative | Verified metrics |
| Tool count | Static only if verified | Registry-derived count |
| Knowledge graph claim | Directional | Actual graph metrics |
| AI-native claim | Directional | Product capability after launch |

### Desktop

Desktop should use 4 trust cards.

### Mobile

Mobile should stack or use 2-column compact cards.

## 8. About

### Visual Description

About explains what Formula Universe is. It should connect tools, formulas, knowledge, and journeys into a single product identity.

### Elements

- About title
- Short mission paragraph
- Infrastructure explanation
- Optional mini diagram: Tools + Knowledge + Journeys

### Static vs Dynamic

About is static copy. It should not depend on registry or AI.

### Desktop

Desktop may use text plus a simple diagram or card group.

### Mobile

Mobile should be concise and readable.

## 9. CTA

### Visual Description

CTA is the final decision point. It should offer clear next actions without creating new unapproved routes.

### Elements

- CTA title
- Short supporting text
- Three CTA cards or buttons: Explore tools, Explore knowledge, Start journey

### Static vs Dynamic

| Element | Current mode | Future mode |
|---|---|---|
| CTA labels | Static | Copy config |
| CTA routes | Existing safe routes only | Personalized actions after approval |
| Start journey | Static placeholder or safe anchor | AI-guided journey recommendation |

## 10. Footer

### Visual Description

Footer should be compact, stable, and separated from CTA. It is not a second homepage.

### Elements

- Brand summary
- Stable navigation
- Policy links
- Optional copyright

### Static vs Dynamic

Footer is static unless navigation is later generated from approved site config.

## Visual Acceptance Summary

The final homepage visual blueprint is acceptable only if:

- Hero title does not visually break.
- Render order follows H12.
- Journey has at least 6 cards.
- Clusters has exactly 8 cards.
- About exists.
- CTA exists after About.
- Footer is complete and compact.
- No unsupported dynamic behavior is implied.
- No route, registry, Canonical ID, or `.tsx` change is made by this document.
