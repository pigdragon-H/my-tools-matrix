# HOMEPAGE_ACCEPTANCE_CHECKLIST.md

## Purpose

This checklist defines acceptance criteria for the Formula Universe homepage blueprint and future homepage implementation tasks. The homepage is the gateway into an AI Native Knowledge Operating System. It must be reviewed as infrastructure, not as decoration.

This document is a checklist only. It does not authorize `.tsx` edits, route changes, registry changes, Canonical ID creation, commits, or deployment.

## Global Hard Gates

A homepage task must fail review if any of the following occur without explicit authorization:

- A `.tsx` file is modified during a docs-only task.
- A route is added, removed, or changed.
- A registry file is changed.
- A Canonical ID is created by AI.
- `tool-registry.json` is bypassed.
- Category key `dev` is replaced by `developer`.
- Prototype components are imported into production.
- A commit is created without Victor approval.
- A deployment is performed without Victor approval.
- The homepage claims live AI behavior before it exists.

## Required Section Checklist

| Section | Required? | Acceptance standard |
|---|---:|---|
| Hero | Yes | Contains title, subtitle, CTA, and no broken title wrap |
| Discovery | Yes | Contains tools/topics/knowledge entry logic and discovery flow |
| Journey | Yes | Contains at least 6 journey cards |
| Knowledge | Yes | Exists as homepage Knowledge Hub, not only a blog page |
| Clusters | Yes | Contains exactly 8 target clusters |
| Guides | Yes | Contains guide cards tied to tools/formulas/knowledge |
| Trust | Yes | Contains conservative, reviewable trust claims |
| About | Yes | Dedicated About Formula Universe section exists |
| CTA | Yes | Contains clear final actions |
| Footer | Yes | Compact brand summary, navigation, and policy links |

## Hero Acceptance

Hero passes if:

- Title is visible and readable.
- Highlighted promise does not break awkwardly.
- Subtitle explains decision support, formulas, knowledge, or journeys.
- Primary CTA exists.
- Secondary CTA exists.
- Search entry is either clearly static or actually implemented.
- No unsupported AI claim appears.

Hero fails if:

- The title breaks as `數據支 / 撐` or similarly awkward final-character wrapping.
- The CTA links to non-existing routes.
- The copy guarantees outcomes.
- It claims live AI search without implementation.

## Discovery Acceptance

Discovery passes if:

- It appears after Hero.
- It supports tool, topic, and knowledge entry paths.
- It explains or implies the flow from search to journey.
- Static placeholders are clearly not presented as live dynamic features.

Discovery fails if:

- It implies live search when none exists.
- It links to unapproved pages.
- It bypasses taxonomy or registry.

## Journey Acceptance

Journey passes if:

- Journey card count is at least 6.
- Required journeys exist:
  - Retirement
  - Weight Loss
  - Developer
  - AI
  - SEO
  - Travel
- Required flows are present:
  - `FIRE → CAGR → Retirement → Withdrawal`
  - `BMI → BMR → Calories → Progress`
  - `JSON → API → Regex → Deploy`
  - `Prompt → Token → Cost → Evaluation`
  - `Keyword → SERP → Content → Schema`
  - `Budget → Currency → Timezone → Itinerary`
- Finance and health journeys use decision-support language, not advice language.

Journey fails if:

- Fewer than 6 journeys exist.
- AI, SEO, or Travel is missing from final blueprint implementation.
- Finance or health cards make unsafe claims.
- The Developer domain uses the invalid category key `developer` instead of `dev`.

## Knowledge Acceptance

Knowledge passes if:

- Knowledge Hub appears as a homepage section.
- It explains formulas, examples, limitations, or next steps.
- It supports knowledge-node direction without claiming completed graph functionality unless implemented.

Knowledge fails if:

- It exists only as `/blog` and not on the homepage.
- It claims live AI explanations without controlled references.
- It has no relationship to tools, formulas, or journeys.

## Clusters Acceptance

Clusters pass if exactly 8 target clusters exist:

| Visual key | Canonical category key |
|---|---|
| FIN | finance |
| HLT | health |
| DEV | dev |
| EDU | education |
| SCI | science |
| TRV | travel |
| PRD | productivity |
| AI | ai |

Clusters fail if:

- Cluster count is not 8.
- `DEV` maps to `developer` instead of `dev`.
- A new category key is invented.
- Tool counts are shown without verification.

## Guides Acceptance

Guides pass if:

- Latest Guides or equivalent guide section exists.
- Guide cards relate to tools, formulas, knowledge, or journeys.
- Missing guide routes are not linked as if live.

Guides fail if:

- They are generic blog teasers unrelated to Formula Universe.
- They generate unapproved SEO pages.
- They link to missing content.

## Trust Acceptance

Trust passes if:

- Claims are conservative and reviewable.
- Tool counts are verified before shown as exact claims.
- AI-native claims are phrased as readiness or direction unless implemented.
- Registry, taxonomy, formula logic, and knowledge graph direction are communicated.

Trust fails if:

- It claims unverified scale.
- It claims live knowledge graph metrics before implementation.
- It claims AI makes decisions for users.

## About Acceptance

About passes if:

- A dedicated About Formula Universe section exists.
- It explains the system as tools + formulas + knowledge + journeys.
- It mentions AI Native Knowledge Operating System direction without overclaiming current AI features.

About fails if:

- It is missing.
- It is only generic marketing text.
- It makes claims not supported by current architecture.

## CTA Acceptance

CTA passes if:

- It appears before Footer.
- It includes clear actions such as Explore tools, Explore knowledge, and Start journey.
- Routes are safe or clearly placeholders.

CTA fails if:

- It links to unapproved pages.
- It claims personalization without implementation.
- It is missing from the final page.

## Footer Acceptance

Footer passes if:

- It appears last.
- It contains compact brand summary.
- It contains stable navigation.
- It contains policy links.
- It is visually separated from CTA.

Footer fails if:

- It becomes a second homepage.
- It contains unstable generated links.
- Policy links are missing.

## Screenshot Acceptance Points

Future implementation tasks must provide screenshot evidence:

| Screenshot | Required checks |
|---|---|
| Desktop homepage | Render order, Hero no wrap, Journey count, Cluster count, About, Footer |
| Mobile homepage | No horizontal overflow, title readable, cards stack correctly, CTA/Footer visible |
| Hero close-up if needed | Highlighted title line does not break awkwardly |
| Bottom-page screenshot | Trust, About, CTA, and Footer are visible |

## Forbidden Launch Conditions

The homepage must not be launched if:

- Build fails.
- TypeScript check fails.
- Console errors block rendering.
- Hero title wraps incorrectly.
- Journey count is below 6.
- Tool clusters are not exactly 8.
- About section is missing.
- Footer is incomplete.
- Prototype components are imported into production.
- Registry/category keys are changed without approval.
- Any unsupported AI, finance, health, or legal claim appears.

## Claude Review Items

Claude as Universe Auditor should review:

1. Does the homepage respect `Identity > URL`, `Registry > Page`, and `Taxonomy > Content`?
2. Are any Canonical IDs created by AI? If yes, fail.
3. Are route or registry changes present? If yes, verify explicit authorization.
4. Does Journey contain at least 6 cards?
5. Does Cluster contain exactly 8 cards?
6. Does `DEV` map to `dev`, not `developer`?
7. Does Knowledge exist on the homepage?
8. Does About Formula Universe exist?
9. Does Hero title avoid broken wrapping?
10. Do screenshots prove desktop and mobile readiness?
11. Are finance and health claims safe?
12. Are AI claims limited to implemented capability or clearly future-facing?
13. Was a commit or deploy performed without Victor approval?

## Final Acceptance Summary

A homepage version is acceptable only if it passes:

```txt
Journey >= 6
About exists
Tool clusters = 8
Footer complete
Hero no wrap
No unauthorized route change
No unauthorized registry change
No prototype production import
No unsafe claims
Desktop screenshot passed
Mobile screenshot passed
Claude review passed
Victor approval pending or complete
```
