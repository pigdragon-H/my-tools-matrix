# BMI 100 Plan

**Status:** Draft only — GPT review required  
**Task:** Task 06.8 BMI Production Hardening Plan  
**Baseline score:** 73 / 100  
**Target score:** 100 / 100  
**Constraint:** Planning only. No TSX rewrite, no production integration, no commit, no deploy.

## Goal

The BMI Gold prototype is currently scored at 73 / 100. It is a strong review prototype, but it is not production-ready. The goal of this plan is to define the work required to move from 73 to 100 by hardening accessibility, schema, SEO, trust, performance, internal graph, metadata, and production readiness. This plan does not authorize implementation. It is a review artifact for GPT review and Victor approval.

## Accessibility

| Gap | Current score | Target | Risk | Fix | Estimated effort |
|---|---:|---:|---|---|---|
| Keyboard navigation | 40 / 100 | 95 / 100 | Users may be unable to operate unit toggles, example buttons, FAQ, and placeholder controls without a mouse. | Define tab order, visible focus states, keyboard behavior for toggles, FAQ, example cards, save/share placeholders, and related links. | Medium |
| ARIA and semantic state | 35 / 100 | 95 / 100 | Screen reader users may not know which unit is selected or when BMI result changes. | Add approved patterns for `aria-pressed` or radio/tab semantics, `aria-live` result updates, and accessible health journey descriptions. | Medium |
| Numeric input accessibility | 45 / 100 | 95 / 100 | Invalid inputs may be confusing or inaccessible. | Define numeric input types, input modes, min/max, helper text, validation messages, and error announcements. | Medium |
| Contrast and color independence | 55 / 100 | 95 / 100 | Risk meaning may rely too heavily on color bands and pale cards. | Run contrast audit, add text labels for all statuses, and ensure color bands are supplementary only. | Low-medium |
| Screen reader QA | 30 / 100 | 95 / 100 | Result, journey, and FAQ may read out of context. | Test with VoiceOver/NVDA or equivalent, revise hierarchy, labels, and result announcements. | Medium-high |

## Schema

| Gap | Current score | Target | Risk | Fix | Estimated effort |
|---|---:|---:|---|---|---|
| FAQ schema | 0 / 100 | 95 / 100 | FAQ content will not be eligible for structured FAQ interpretation. | Finalize visible FAQ, source-review answers, and generate matching FAQPage JSON-LD. | Low-medium |
| HowTo schema | 0 / 100 | 90 / 100 | Instructional flow may be underrepresented or inaccurately represented. | Decide whether HowTo is appropriate; if yes, map only stable visible calculator steps. | Low |
| Breadcrumb schema | 0 / 100 | 95 / 100 | Search engines may lack clear hierarchy. | Implement BreadcrumbList only after route hierarchy is approved. | Low |
| Tool schema | 0 / 100 | 95 / 100 | Calculator identity may be unclear to search engines. | Use WebApplication or SoftwareApplication schema with safe, non-medical-claim wording. | Medium |
| Schema validation | 0 / 100 | 100 / 100 | Invalid schema can harm quality or be ignored. | Validate with schema testing tools after content freeze and before deploy. | Low |

## SEO

| Gap | Current score | Target | Risk | Fix | Estimated effort |
|---|---:|---:|---|---|---|
| Title | 65 / 100 | 95 / 100 | Title may not capture primary search intent or safety scope. | Approve concise intent-aligned title such as “BMI Calculator — Body Mass Index & Healthy Range.” | Low |
| Meta description | 50 / 100 | 95 / 100 | Meta may overpromise or omit screening limitation. | Write approved description that includes adult BMI calculation, category interpretation, and screening disclaimer. | Low |
| Heading structure | 70 / 100 | 95 / 100 | Long page may have weak semantic hierarchy. | Define one H1 and clear H2/H3 section hierarchy before production componentization. | Low |
| Internal links | 35 / 100 | 95 / 100 | Related tools/articles may be missing, broken, or unapproved. | Map approved routes for BMR, TDEE, Calories, Body Fat, Water Intake, Waist Ratio, Weight Loss, BMI guide, BMI chart, BMI limitations, and BMI vs BMR. | Medium |
| Content cluster | 55 / 100 | 95 / 100 | BMI may not fully support Health universe topical authority. | Create or approve future article destinations and connect them after route approval. | Medium |

## Trust

| Gap | Current score | Target | Risk | Fix | Estimated effort |
|---|---:|---:|---|---|---|
| Source URLs | 35 / 100 | 100 / 100 | Named sources without links are insufficient for production health content. | Add direct CDC, WHO, NIH or approved equivalent URLs for formula, categories, limitations, and screening language. | Medium |
| Medical disclaimer | 65 / 100 | 100 / 100 | Users may interpret BMI or conversion prompts as medical advice. | Strengthen disclaimer near calculator, result, and conversion layer; explicitly state screening-only and consult professional care. | Low-medium |
| Adult-only scope | 45 / 100 | 100 / 100 | BMI categories may be misused for children, pregnancy, or athletes. | Add adult-only context and excluded-case guidance. | Low-medium |
| Review status | 20 / 100 | 95 / 100 | Users and maintainers may not know content review state. | Add internal review metadata and visible last-reviewed policy if product supports it. | Medium |
| Conversion caution | 30 / 100 | 95 / 100 | Goal BMI, needed weight, and timeline placeholders can imply personalized treatment. | Define strict safe-copy rules and decide whether weight-change estimates should ship. | Medium-high |

## Performance

| Gap | Current score | Target | Risk | Fix | Estimated effort |
|---|---:|---:|---|---|---|
| Component decomposition | 60 / 100 | 95 / 100 | Monolithic component becomes hard to maintain and test. | Split into production components after approval: Hero, Calculator, Result, Intelligence, Conversion, Decision, Knowledge, FAQ, Trust, Schema. | Medium |
| Render stability | 65 / 100 | 95 / 100 | Long sections and dynamic result cards may cause layout shifts. | Define stable card sizes, loading behavior, and deterministic calculation rendering. | Low-medium |
| Lazy loading | 50 / 100 | 90 / 100 | Future article lists, charts, and lower-page modules may increase initial payload. | Keep core calculator immediate; lazy-load lower-page articles, references, and non-critical visuals. | Low-medium |
| Image strategy | 80 / 100 | 95 / 100 | Future visuals could add weight unnecessarily. | Prefer CSS/SVG for bands and graphs; optimize any image assets and provide alt text. | Low |
| Bundle and QA | 50 / 100 | 90 / 100 | Production integration could increase bundle size without measurement. | Run bundle analysis and performance QA before deploy. | Medium |

## Internal graph

| Gap | Current score | Target | Risk | Fix | Estimated effort |
|---|---:|---:|---|---|---|
| Related tool routing | 40 / 100 | 100 / 100 | Related tools may not exist or may point to wrong destinations. | Approve route map for BMR, TDEE, Calories, Body Fat, Water Intake, Waist Ratio, Weight Loss. | Medium |
| Category-specific next steps | 45 / 100 | 95 / 100 | One path may push inappropriate next steps to all users. | Define conditional graph by category: underweight, normal, overweight, obesity classes, excluded contexts. | Medium |
| Article cluster | 35 / 100 | 95 / 100 | Health universe content cluster remains incomplete. | Plan BMI guide, BMI chart, BMI limitations, BMI vs BMR, ideal weight, and body composition articles. | Medium-high |
| Graph metadata | 40 / 100 | 95 / 100 | AI/internal discovery graph may be incomplete. | Add approved metadata for semantic neighbors, cluster, intent, difficulty, risk, and review status. | Low-medium |

## Metadata

| Gap | Current score | Target | Risk | Fix | Estimated effort |
|---|---:|---:|---|---|---|
| Gold metadata fields | 55 / 100 | 100 / 100 | Required contract fields may be incomplete during production integration. | Complete entity type, cluster, intent, difficulty, related tools, related articles, search terms, FAQ count, schema types, trust sources. | Low-medium |
| Health risk metadata | 35 / 100 | 95 / 100 | Health tools need stricter safety flags. | Add risk level, disclaimer required, reference required, adult-only scope, excluded contexts, and review status. | Low-medium |
| SEO metadata | 50 / 100 | 95 / 100 | Title/meta/canonical/social metadata may be inconsistent. | Define production metadata package after route approval. | Low |
| AI metadata | 60 / 100 | 95 / 100 | AI summaries may miss limitations or related graph. | Include AI-safe summary, limitations, source requirements, and semantic neighbors. | Low |

## Production readiness

| Gap | Current score | Target | Risk | Fix | Estimated effort |
|---|---:|---:|---|---|---|
| Approval gate | 40 / 100 | 100 / 100 | Premature commit or integration would violate reconstruction workflow. | Require GPT review and Victor approval before commit, route, registry, toolsConfig, or deploy. | Process |
| Production component plan | 45 / 100 | 95 / 100 | Prototype may be copied directly without hardening. | Create implementation plan and component boundaries before coding. | Medium |
| QA plan | 35 / 100 | 95 / 100 | Accessibility, mobile, schema, and validation bugs may ship. | Create QA checklist and test matrix before production integration. | Medium |
| Release gate | 30 / 100 | 95 / 100 | Page may launch below quality threshold. | Use release criteria requiring Accessibility ≥90, SEO ≥90, Trust ≥90, Performance ≥85, Total ≥90. | Process |
| Rollback plan | 20 / 100 | 95 / 100 | Production issue may be hard to reverse. | Define rollback owner, route rollback, registry rollback, monitoring triggers, and revert procedure. | Low-medium |

## Score path

The expected path from 73 to 100 should be staged. First, reach 80 by finalizing source URLs, disclaimers, title/meta, and obvious accessibility gaps. Next, reach 90 by completing schema, mobile QA, internal link mapping, and category-specific decision paths. Finally, reach 100 by validating accessibility, trust, schema, metadata, performance, release criteria, and rollback readiness.

## Gate conclusion

BMI should remain in review status. Do not commit, deploy, or integrate until this hardening plan is reviewed and approved. The production target should be at least 90 / 100 for release consideration and 100 / 100 for Gold Tool template confidence.
