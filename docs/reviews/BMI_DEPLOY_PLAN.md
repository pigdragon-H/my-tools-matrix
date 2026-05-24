# BMI Deploy Plan

**Status:** Draft only — GPT review required  
**Task:** Task 06 BMI Production Audit  
**Constraint:** Planning only. No production integration, no commit, no deploy.

## Phase 1 — Prototype

The current phase is prototype. The BMI Gold prototype lives only at `client/src/prototypes/BMIGoldPrototype.tsx`. It demonstrates the intended Gold Tool experience with guided UX, example fill, calculator, visual result card, result intelligence, emotion and conversion layer, decision path, knowledge section, FAQ, trust copy, related tools, and references. Prototype artifacts include screenshots and draft notes under approved documentation paths. This phase must not modify routes, registry files, toolsConfig, production BMI code, homepage modules, or deployment configuration.

Exit criteria for the prototype phase are a complete prototype review package, screenshots for desktop and mobile, production audit, gap analysis, deploy plan, and readiness map. The prototype phase is not complete for production until GPT review identifies required changes and Victor approves the next step.

## Phase 2 — Review

The review phase begins after the Task 06 package is submitted. GPT review should evaluate medical safety, UX clarity, mobile flow, accessibility risks, schema plan, conversion layer safety, internal linking strategy, and production component boundaries. Victor approval is required before any commit, push, route work, registry work, or production component implementation.

Review should answer the following gating questions: whether the BMI result language is medically safe, whether the conversion layer should show needed weight change, whether goal BMI defaults to 23, whether Save / Share remains disabled, whether related tools are ready to link, whether FAQ and schema content are approved, and whether production should replace the current BMI or launch separately as a Gold version.

## Phase 3 — Production integration

Production integration may begin only after GPT review and Victor approval. The monolithic prototype should be decomposed into production components such as Hero, QuickActionCard, CalculatorPanel, ResultCard, ResultIntelligence, ConversionLayer, DecisionPath, KnowledgeSection, FAQSection, TrustReferences, RelatedTools, and SchemaBlock. The implementation should use approved types, validation rules, accessibility standards, and source-backed copy.

Integration must explicitly decide route identity, registry identity, toolsConfig placement, current BMI replacement strategy, and fallback behavior. No existing production BMI file should be replaced unless the approval explicitly says to replace it. Schema JSON-LD should be added only after final content and FAQ are approved. Analytics events should be privacy-safe and optional.

## Phase 4 — Homepage exposure

Homepage exposure should happen only after production QA passes. The homepage card or featured placement should use approved title, description, category, icon, and route. Exposure should not happen if related tools are broken, if schema validation fails, if mobile QA fails, or if trust/source review is incomplete.

Suggested homepage positioning is within the Health universe or body composition cluster. The homepage should not overpromise medical outcomes. It should describe the tool as a BMI calculator for adult screening context and next-step exploration.

## Phase 5 — Universe rollout

Universe rollout should connect BMI to the broader Health universe graph. Initial graph neighbors should include BMR, TDEE, Calories, Body Fat, Water Intake, Waist Ratio, Ideal Weight, and Weight Loss where approved. Future article links should include BMI guide, BMI chart, BMI vs BMR, BMI limitations, body composition guide, and ideal weight guide.

Rollout should follow the Gold Tool Contract so BMI becomes a reusable template for future tools such as CAGR and JSON Formatter. After rollout, monitor user behavior around calculate events, example usage, next-tool clicks, FAQ expansion, and save/share interest if those features are later implemented. Any conversion features must remain medically cautious and privacy-safe.

## Deployment decision rule

Do not deploy if any of the following are missing: GPT review, Victor approval, medical-copy approval, accessibility pass, mobile QA, schema validation, route/registry approval, source citations, and related-link validation. If any gate fails, keep BMI in prototype or review status and do not expose it on the homepage or Universe graph.
