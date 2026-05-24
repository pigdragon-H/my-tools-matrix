# Homepage Deploy Steps

Status: draft-only review document. This document does not authorize deployment, production integration, commits, route changes, or edits to `client/src/pages/Home.tsx`. It describes a safe phased migration path from the current production homepage toward the reviewed homepage prototype after GPT review and explicit approval.

## Purpose

The homepage migration should happen in controlled phases rather than as a single replacement. The current `Home.tsx` already provides a working hero, trust/features bar, category browsing, and footer links. The prototype adds a broader Formula Universe experience with discovery, topics, knowledge, clusters, journeys, and latest guides. The deploy path should preserve the stable production page while gradually introducing reviewed sections in a way that can be tested, rolled back, and measured.

Each phase below must be treated as a future implementation checkpoint, not as approval to implement now. Before any phase begins, the team should confirm product copy, data sources, route readiness, SEO implications, accessibility behavior, and rollback ownership.

## Phase 1 Skeleton

Phase 1 should establish the production-safe homepage structure without introducing complex discovery logic. The goal is to prepare a section order that can eventually support the target homepage while keeping the current page usable. This phase should begin with the existing `Home.tsx` hero, feature/trust bar, categories, and footer as the baseline. The production migration should avoid deleting stable navigation until replacement sections are verified.

The first implementation step, after approval, should be a skeleton layout that mirrors the target section order: Hero, Feature bar, Categories or Universe Explorer placeholder, Featured Tools placeholder, Featured Topics placeholder, Knowledge Hub placeholder, Latest Guides placeholder, and Footer. At this phase, placeholders must be honest and should not imply live search, personalized AI guidance, or complete knowledge graph behavior. Any section that depends on missing data should use static reviewed copy or remain hidden behind an internal review flag.

Phase 1 acceptance should focus on layout stability, responsive behavior, semantic heading order, no broken links, no regressions in existing category navigation, and preserved SEO metadata. This phase should not introduce journey recommendations or pseudo-search behavior. If the skeleton causes layout instability, accessibility regressions, or loss of current category access, the team should stop and restore the current homepage.

## Phase 2 Discovery

Phase 2 should introduce the discovery layer after the skeleton is stable. This includes the Quick Search placeholder, Trending Tools, Trending Topics, and Discovery Flow. The Quick Search area should remain clearly labeled as a navigation or finder experience unless real search functionality is implemented and tested. It must not present itself as an intelligent search system if it only routes users to static destinations.

Trending Tools should be populated from reviewed, stable tool candidates such as BMI, CAGR, JSON Formatter, Mortgage, and TDEE only if the corresponding production routes are available and accurate. Trending Topics should be added only if topic pages, guide pages, or safe landing paths exist for Retirement, Weight Loss, API, JSON, and FIRE. If routes are not ready, the production version should either use non-clickable preview cards or omit links until routing is approved.

The Discovery Flow should explain the intended user path from Search to Topic to Tool to Knowledge to Journey. It should be educational rather than automated. The copy should avoid promising personalized recommendations, diagnostic outcomes, financial advice, medical advice, or AI-generated answers unless those systems are separately reviewed. Phase 2 acceptance should include link verification, mobile scanning behavior, keyboard navigation, and review of safety-sensitive labels around health and finance topics.

## Phase 3 Journey

Phase 3 should add journey cards and next-step suggestions after the discovery layer has been validated. The journey layer introduces stronger guidance, so it carries higher product and compliance risk than static category browsing. Retirement Journey, Weight Loss Journey, and Developer Journey should be treated as curated educational paths, not as personalized plans.

The Retirement Journey should connect FIRE, CAGR, Retirement, and Withdrawal in a way that encourages scenario exploration and further reading without offering financial advice. The Weight Loss Journey should connect BMI, BMR, Calories, and Progress with clear safety language and should not imply diagnosis or treatment. The Developer Journey should connect JSON, API, Regex, and Deploy as a workflow aid without implying that deployment services are available unless they actually exist in production.

Next Step Suggestions should remain general and transparent. Suggested choices such as selecting a topic, opening a known tool, reading knowledge, or following a journey should be positioned as navigation aids. They should not adapt to user data unless privacy, consent, analytics, and personalization policies are reviewed. Phase 3 acceptance should include safety copy review, link availability checks, and confirmation that journeys do not trap users in dead ends or create circular navigation.

## Phase 4 Knowledge

Phase 4 should strengthen the knowledge layer by integrating Knowledge Hub, Tool Clusters, and Latest Guides into production. This phase should only proceed once source quality, editorial ownership, and review status are clear. Knowledge content should support formulas, examples, limitations, and source/review policy expectations rather than merely adding SEO text.

The Knowledge Hub should point users toward formula explanations, examples, limitations, and review policies. Tool Clusters should show related tools as contextual paths, but they must avoid suggesting that one result automatically requires another calculation. Latest Guides should be populated from real reviewed guide content, not placeholder titles. If the blog or guide system does not yet support freshness controls, the section should avoid date-sensitive claims.

Phase 4 acceptance should include content review, duplicate-content checks, SEO title and heading review, internal link review, disclaimers for sensitive categories, and validation that the homepage remains useful if guide data is temporarily unavailable. The team should also verify that knowledge cards do not compete with or dilute the main homepage conversion path.

## Phase 5 Cleanup

Phase 5 should remove temporary scaffolding only after the new homepage structure is stable and reviewed. Cleanup may include retiring duplicate category presentations, consolidating old feature bar copy with new trust signals, removing unused placeholder text, simplifying redundant links, and ensuring footer sections are useful rather than keyword-stuffed.

This phase should also include final accessibility review, responsive review, SEO review, performance review, and analytics review if analytics are used. Any old links that are removed should have a verified replacement path. Any imported configs, route references, or content sources added during implementation should be checked for ownership and long-term maintenance.

Cleanup should not mean aggressive deletion. The current homepage elements are production-proven, so they should only be removed after the replacement sections demonstrably preserve or improve user orientation. Phase 5 acceptance should include a final rollback checkpoint, comparison screenshots, no broken links, no console errors, no unexpected route changes, and explicit approval before deployment.

## Cross-Phase Guardrails

No phase should be implemented without explicit approval. No commit or deploy should happen from this draft. Production edits should be reviewed separately from this planning task. Every phase should preserve the ability to restore the previous `Home.tsx` quickly. Any feature that depends on live search, personalization, registry data, or knowledge graph relationships should use real reviewed data sources before being presented as functional.

## Recommended Review Order

The recommended review order is skeleton first, discovery second, journey third, knowledge fourth, and cleanup last. This order reduces risk because it preserves current homepage utility while progressively adding higher-context sections. If any phase fails review, later phases should pause until the issue is corrected and the rollback path is confirmed.
