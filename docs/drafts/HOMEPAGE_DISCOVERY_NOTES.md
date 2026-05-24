# Homepage Discovery Notes

Formula Universe Task H03.5 revised `client/src/prototypes/HomepageGoldPrototype.tsx` as a prototype-only homepage discovery layer. This revision adds Quick Search placeholders, Trending Tools, Trending Topics, and a Discovery Flow that moves from Search to Topic to Tool to Knowledge to Journey. The prototype remains isolated from production. It does not edit `Home.tsx`, does not edit `App.tsx`, does not add routes, does not register tools, does not connect to shared tool configuration, and does not authorize deployment or commit.

## Problems

The previous homepage prototype already showed a strong target structure, but it still depended mostly on curated browsing sections. It had Hero, Featured Tools, Featured Topics, Universe Explorer, Knowledge Hub, Tool Clusters, Latest Guides, and Footer, yet it did not make search intent explicit enough. A user with a precise query such as BMI, CAGR, JSON Formatter, Mortgage, or TDEE needed to infer where to go rather than seeing a direct discovery surface.

The second problem was that knowledge discovery and topic discovery were not separated from tool discovery. In a Formula Universe context, users may search for a calculator, an explanation, or a semantic topic. These are different intents. A visitor searching for “JSON” may want a formatter tool, a JSON guide, or an API-related topic. A visitor searching for “weight loss” may want BMI, BMR, TDEE, calories, or source-backed explanations. The v2 discovery layer begins to separate these paths without implementing real search.

A third problem is that trending intent was absent. Without trending tools and trending topics, the homepage can feel static and overly dependent on category browsing. Trending intent helps bridge direct search and exploratory browsing, especially for high-demand queries such as BMI, CAGR, JSON Formatter, Mortgage, TDEE, Retirement, Weight Loss, API, JSON, and FIRE.

## Discovery ideas

The Quick Search section should eventually become the homepage’s primary discovery gateway. It should support at least three intent modes: search tools, search knowledge, and search topics. The prototype keeps these modes as placeholders, but the concept is important because it prevents every search from being treated as a calculator lookup.

Trending Tools can serve users who arrive with high-intent calculator needs. The first prototype set includes BMI, CAGR, JSON Formatter, Mortgage, and TDEE. These examples intentionally span health, finance, developer utilities, and planning so the homepage does not appear limited to one category.

Trending Topics can serve semantic and exploratory intent. The first topic set includes Retirement, Weight Loss, API, JSON, and FIRE. These topics should eventually connect to mixed result sets: tools, guides, formulas, related questions, and journeys. For example, Weight Loss may connect to BMI, BMR, TDEE, Calories, safe disclaimers, and knowledge articles. FIRE may connect to retirement planning, savings rate, compound growth, inflation, and withdrawal-rate guides.

The Discovery Flow should remain visible because it explains the product model. Search should not end at a result list. The intended path is Search → Topic → Tool → Knowledge → Journey. This helps Formula Universe express itself as a connected system rather than a flat directory.

## Future search

Future search should be designed as a typed discovery layer rather than a single generic box. Search results should be grouped into calculators, topics, guides, formulas, and journeys. A query like “BMI” could return a BMI calculator, a BMI explanation guide, a health planning topic, and the BMI → BMR → TDEE → Calories journey. A query like “JSON” could return JSON Formatter, JSON Minifier, JSON Diff Checker, API topics, and guides about formatting or validation.

The future search experience should support synonyms, abbreviations, and user-language queries. For example, “weight loss calculator” should understand BMI, BMR, TDEE, calories, and weight-loss planning. “Retire early” should understand FIRE, compound interest, savings rate, retirement, and withdrawal planning. “API token” may connect to JWT tools and API knowledge.

Search should remain cautious in sensitive categories. Health-related search should avoid diagnostic claims and should route users toward educational disclaimers. Finance-related search should avoid financial advice claims and should present calculations as informational. Developer utilities can be more direct but still need clear descriptions.

A future search prototype should test empty states, no-result states, typo handling, featured suggestions, keyboard navigation, screen reader labels, and mobile-first interaction. It should also define which content sources are eligible for search before production integration.

## Knowledge graph ideas

The discovery layer should eventually map to a Formula Universe knowledge graph. The graph can connect tools, topics, formulas, guides, categories, examples, FAQs, and journeys. A tool should know which formulas it uses, which topics it belongs to, which guides explain it, and which next tools are relevant. A topic should know which tools, formulas, and guides support it. A journey should know its ordered steps and safe explanation boundaries.

Trending Tools and Trending Topics can become entry points into this graph. BMI should connect to health planning, BMR, TDEE, calories, healthy weight range guides, and medical disclaimers. CAGR should connect to investing, compound growth, annualized return, and finance explanations. JSON Formatter should connect to JSON, API, developer utilities, validation, and formatting guides. Mortgage should connect to payments, amortization, interest, affordability, and finance disclaimers. TDEE should connect to BMR, calories, activity factors, and health disclaimers.

The knowledge graph should also support AI-assisted recommendations. If a user enters a topic or tool, the system can recommend related tools and guides without implying personalized advice. For health and finance topics, recommendations must be framed as educational next steps rather than prescriptive actions.

A future production plan should define graph governance: who approves node labels, how source-backed knowledge is attached, how stale topics are retired, how trending items are selected, and how unsafe relationships are blocked. The graph should be reviewable before it is exposed to users or search engines.

## Draft-only guardrail

This document is part of a prototype revision only. It does not approve production homepage integration, route changes, registry changes, shared configuration changes, commits, or deployment. The revised prototype and screenshots must wait for GPT review and Victor approval.
