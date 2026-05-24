# Homepage Discovery Notes

Status: H06 production discovery migration v1. This document describes the intent behind the new homepage discovery layer and records future work. No commit was performed as part of this task.

## Discovery ideas

Discovery v1 adds a static bridge between the hero area and the skeleton homepage modules. The goal is to help users understand that Formula Universe can eventually be explored by tool, topic, and knowledge intent rather than only through broad categories. The new section appears before Featured Tools so that visitors encounter the discovery model before the rest of the homepage content stack.

The Quick Search block is intentionally placeholder-only. It separates three future discovery modes: Search tools, Search topics, and Search knowledge. This gives the homepage a clearer information architecture without pretending that a live semantic search system exists today. Each mode can later become a real input, command palette, tabbed search, or guided finder after route and data ownership are approved.

Trending Tools introduces a small static set of example tool intents: BMI, CAGR, JSON, Mortgage, and TDEE. These are not linked in v1 and do not pull from configuration. They function as visible editorial placeholders for future reviewed tool destinations. Keeping them static avoids accidental dependency on registry data or incomplete production routes.

Trending Topics introduces FIRE, Weight Loss, API, JSON, and Retirement as future topic surfaces. These topics are intentionally not wired to pages yet. They represent knowledge graph candidates that should be reviewed for content readiness, safety language, and route availability before becoming clickable.

The Discovery Flow gives visitors a conceptual path: Search to Topic to Tool to Knowledge. This stops before Journey because H06 is discovery-only. The flow should eventually teach users that Formula Universe is not just a calculator directory; it can connect intent, explanations, formulas, and related tools. In v1, however, it remains a static model only.

## Search future

The future search experience should begin as a transparent finder rather than an overpromised AI search box. If the system only matches static tool names and topics, the label should communicate that clearly. If semantic search or AI assistance is later introduced, the interface should explain what data it searches, what it does not search, and whether results are curated or generated.

Search tools should eventually support direct calculator lookup by common names, aliases, and user problems. For example, BMI could be found through weight category, body mass, or health screening language. CAGR could be found through investment growth, annualized return, or compound growth language. JSON could be found through formatting, validation, and developer utility language.

Search topics should eventually connect broader intents to topic hubs. FIRE, Weight Loss, API, JSON, and Retirement should each have reviewed landing paths before becoming production links. Sensitive topics such as Weight Loss and Retirement require extra care because they can imply health or financial guidance.

Search knowledge should eventually surface formula explanations, examples, limitations, guide articles, and review policy pages. It should not simply duplicate tool search. Its value should be helping users understand how to interpret calculations and when not to over-trust a result.

The search UI should eventually support empty states, no-result states, typo tolerance, keyboard navigation, screen reader labels, and mobile-first behavior. It should also avoid collecting unnecessary personal data. Any personalization or AI-assisted ranking should require a separate privacy and product review.

## Knowledge graph

The discovery layer is an early visible placeholder for a future knowledge graph. The graph should connect tools, topics, formulas, examples, guides, categories, limitations, and related calculations. In H06, none of these relationships are implemented; the homepage only shows static candidate labels.

Trending Tools can become nodes in the graph. BMI, CAGR, JSON, Mortgage, and TDEE each need canonical tool identifiers, approved aliases, route mappings, and relationship rules before being used dynamically. A tool node should know which topics it belongs to, which formulas it explains, and which guides provide context.

Trending Topics can become topic nodes. FIRE, Weight Loss, API, JSON, and Retirement should connect to tools, guides, formulas, disclaimers, and related topics. Topic relationships should be editorially governed, especially when a topic overlaps with regulated or safety-sensitive domains.

The Discovery Flow can eventually become the graph traversal model. A user starts with a search intent, lands on a topic, selects a tool, and then reads knowledge content that explains the result. Later phases may add a Journey step, but that should remain separate until the journey layer is reviewed.

The graph should avoid prescriptive recommendations unless the relationship has been reviewed. For example, a Weight Loss topic can offer BMI, BMR, TDEE, and calorie tools as related educational resources, but it should not imply diagnosis or a required plan. A Retirement topic can connect FIRE, CAGR, retirement, and withdrawal content, but it should not imply financial advice.

Future graph work should define relationship types such as belongs_to_topic, explains_formula, has_limitation, related_tool, prerequisite_concept, example_for, guide_for, and reviewed_by. Each relationship should have an owner, review status, and rollback path before it affects production navigation.
