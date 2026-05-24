# BMI Release Criteria

**Status:** Draft only — GPT review required  
**Task:** Task 06.8 BMI Production Hardening Plan  
**Constraint:** Planning only. No TSX rewrite, no production integration, no commit, no deploy.

## Minimum release thresholds

BMI must not move from prototype/review to production release unless all minimum thresholds are met.

| Area | Minimum score | Required status |
|---|---:|---|
| Accessibility | ≥ 90 | Required for release |
| SEO | ≥ 90 | Required for release |
| Trust | ≥ 90 | Required for release |
| Performance | ≥ 85 | Required for release |
| Total | ≥ 90 | Required for release |

## Accessibility release criteria

Accessibility must score at least 90. The production implementation must support keyboard navigation, visible focus states, accessible unit toggles, accessible input labels and validation, screen reader result updates, non-color status indicators, contrast compliance, and FAQ keyboard operation. Save and Share placeholders must either be removed, disabled, or implemented with approved accessible behavior.

## SEO release criteria

SEO must score at least 90. The production page must have an approved title, meta description, canonical URL, one H1, logical H2/H3 hierarchy, visible formula section, visible FAQ section, internal related-tool links, approved article links or planned placeholders, and validated schema. SEO copy must not make medical or weight-loss promises.

## Trust release criteria

Trust must score at least 90. The production page must include direct source URLs, medical disclaimer, adult-only screening scope, limitation copy for children, pregnancy, athletes, and medical decision-making, and approved wording for conversion prompts. Any goal BMI, needed weight, or timeline language must be medically cautious and clearly non-diagnostic.

## Performance release criteria

Performance must score at least 85. The production page should use lightweight components, deterministic calculations, stable layout, optimized CSS, no unnecessary images, lazy loading for lower-priority sections where appropriate, and bundle-size review. Core calculator and result interactions must remain immediate.

## Total release criteria

The total score must be at least 90 / 100. A high total cannot override a failing critical category. If Accessibility, SEO, Trust, or Performance is below its minimum threshold, the release must be blocked even if the total score is 90 or higher.

## Blocking conditions

Release is blocked if any of the following are true: GPT review is missing, Victor approval is missing, accessibility score is below 90, SEO score is below 90, trust score is below 90, performance score is below 85, total score is below 90, schema is invalid, source citations are missing, internal links are broken, mobile QA fails, route identity is unclear, registry identity is unclear, rollback plan is missing, or production integration would replace the current BMI without explicit approval.

## Approval rule

The release criteria document is not an approval. It defines the minimum standard. Actual production work still requires GPT review and Victor approval before commit, push, route integration, registry updates, toolsConfig updates, homepage exposure, or deploy.
