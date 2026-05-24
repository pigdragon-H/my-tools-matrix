# HOMEPAGE_RENDER_ORDER.md

## Purpose

This document defines the frozen homepage render order for Formula Universe. The order is based on knowledge-system logic, not UI preference. Formula Universe is an AI Native Knowledge Operating System, so the homepage must guide the user from promise to discovery, from discovery to structured paths, from paths to knowledge, and finally to action.

This document is a render-order specification only. It does not authorize `.tsx` edits, route changes, registry changes, Canonical ID creation, commits, or deployment.

## Frozen H12 Render Order

```txt
1. Hero
2. Discovery
3. Journey
4. Knowledge
5. Clusters
6. Guides
7. Trust
8. About
9. CTA
10. Footer
```

## Knowledge-System Logic

The homepage should tell this story:

```txt
Promise → Discover → Navigate paths → Understand formulas → Choose domains → Read guides → Trust system → Understand product → Act → Exit/navigation
```

This order turns the homepage into a gateway for the knowledge infrastructure.

## 1. Hero

Hero comes first because it states the product identity and promise. It answers:

```txt
What is this?
Why should I care?
Where can I begin?
```

Hero must not be moved below other sections. If Hero is not first, the system loses its entry point.

## 2. Discovery

Discovery comes immediately after Hero because users often arrive with uncertain intent. They may not know which calculator, formula, or journey they need. Discovery gives them entry modes: tools, topics, knowledge, and flow.

Discovery should not be moved after Tool Clusters because that would make the page feel like a category directory rather than a knowledge gateway.

## 3. Journey

Journey comes after Discovery because once users understand entry modes, they need structured paths. Journey shows that Formula Universe is not an isolated calculator list.

Journey must appear before Knowledge and Clusters because it frames why knowledge and tools matter.

## 4. Knowledge

Knowledge comes after Journey because journeys create the need for explanation. Users see a path, then need to understand formulas, examples, limitations, and next steps.

Knowledge should not be buried after Footer or CTA. It is core infrastructure.

## 5. Clusters

Clusters come after Knowledge because taxonomy should support understanding, not replace it. Clusters organize the tool universe by stable category keys.

Clusters can be visually close to Knowledge, but they should not come before Journey in the frozen homepage because that would revert the system toward a tool-list site.

## 6. Guides

Guides come after Clusters because guides are content extensions of tools and knowledge. They provide deeper explanations after the user has seen the domain map.

Guides may be curated, static, or future registry/content-index driven.

## 7. Trust

Trust comes after the user has seen the system structure. At this point, claims about registry discipline, taxonomy, formula logic, and AI-native readiness have context.

Trust may not be moved above Hero. It may be moved near About only if the narrative remains coherent.

## 8. About

About comes after Trust because the user now has enough context to understand Formula Universe as a system. About should explain the product identity, not sell vague benefits.

About must exist before CTA in the final blueprint.

## 9. CTA

CTA comes after About because users should act after understanding what the system is. CTA should not appear only in Hero; the final CTA closes the full narrative.

CTA may include:

```txt
Explore tools
Explore knowledge
Start journey
```

## 10. Footer

Footer comes last. It provides compact navigation and policy links. It should not become another discovery layer.

## Sections That Cannot Move

| Section | Rule |
|---|---|
| Hero | Must remain first |
| Footer | Must remain last |
| CTA | Must remain after About in final blueprint |
| Journey | Must remain before Knowledge and Clusters |
| About | Must exist before final CTA |

## Sections With Limited Flexibility

| Section | Allowed flexibility |
|---|---|
| Trust | Can move near About if narrative remains clear |
| Guides | Can move before Clusters only if guide strategy becomes primary, but not recommended |
| Knowledge and Clusters | Can be visually grouped, but Knowledge should conceptually precede Clusters |
| Discovery | Can include Hero-adjacent search, but should remain before Journey |

## Future AI Personalization Reserve Points

Future AI personalization should be added only after registry, taxonomy, and knowledge structure are stable.

Potential reserve points:

| Location | Future AI behavior | Current state |
|---|---|---|
| Hero search | Semantic intent entry | Static placeholder only |
| Discovery | Recommend tools/topics | Static cards only |
| Journey | Recommend best journey | Static journey cards only |
| Knowledge | Explain related formula nodes | Static Knowledge Hub only |
| CTA | Personalized next action | Static CTA only |

## Prohibited AI Behavior Before Infrastructure

The homepage must not claim or perform:

- Live AI personalization before implementation.
- AI-generated advice in finance or health contexts.
- AI-created Canonical IDs.
- AI-created Registry entries.
- AI route generation.

## Render Order Acceptance

The render order passes review only if it follows:

```txt
Hero → Discovery → Journey → Knowledge → Clusters → Guides → Trust → About → CTA → Footer
```

Any implementation that changes this order must include a written reason and receive explicit Victor/GPT/Claude review approval.
