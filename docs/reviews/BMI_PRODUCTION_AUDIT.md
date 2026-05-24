# BMI Production Audit

**Status:** Draft only — GPT review required  
**Task:** Task 06 BMI Production Audit  
**Audited file:** `client/src/prototypes/BMIGoldPrototype.tsx`  
**Related references:** `docs/GOLD_TOOL_CONTRACT.md`, `docs/drafts/BMI_GOLD_TOOL_SPEC.md`, `docs/drafts/BMI_INFORMATION_ARCHITECTURE.md`, `docs/drafts/BMI_COMPONENT_SPEC.md`, `docs/drafts/BMI_UX_NOTES.md`, `docs/drafts/BMI_CONVERSION_NOTES.md`  
**Constraint:** Audit only. No TSX rewrite, no production integration, no commit, no deploy.

## Executive readiness summary

The BMI Gold prototype is directionally strong and now contains the major Gold Tool layers expected for a production candidate: hero, quick action, examples, calculator, result card, result intelligence, conversion layer, decision path, knowledge, FAQ, trust, related tools, and references. The prototype also demonstrates a stronger product flow than the first version because it guides the user from calculation to interpretation to next steps rather than simply stacking content sections. However, it is not production-ready yet. The main blockers are medical-copy review, accessibility validation, schema implementation, real route and registry planning, production component decomposition, final source citations, mobile interaction testing, conversion safety rules, and internal link strategy.

## Knowledge complete?

The knowledge layer is mostly complete for a prototype. The BMI formula, adult category ranges, limitations, and related health metrics are represented in the prototype and the supporting BMI Gold Tool specification. The knowledge content correctly frames BMI as a screening tool and notes major exclusions such as children, pregnancy, athletic body composition, and body fat distribution. Production still needs source-backed final copy, citation URLs, a more explicit adult-only scope statement, and final review of category-specific risk language to ensure it does not overstate diagnosis or treatment guidance.

**Readiness:** Medium-high for prototype, medium for production.

## UX complete?

The UX is significantly improved. The current flow supports Hero → Quick Action Card → Examples → Calculator → Result Card → Result Intelligence → Emotion + Conversion Layer → Decision Path → Knowledge → FAQ → Trust / Related Tools / References. This is a guided experience rather than a flat article. The result is clear and the next step is visible. Production still needs interaction rules, empty/error states, reset behavior, input validation states, real link behavior, analytics event planning, and detailed QA for edge cases such as invalid height, zero values, extreme values, and unit switching.

**Readiness:** High for prototype, medium for production.

## Mobile ready?

The prototype uses responsive utility classes and the v2/v3 screenshots show a stacked mobile experience. The mobile layout is reviewable, but it is not production-certified. Production must test real device widths, touch target sizes, sticky or repeated result behavior, long-card scanning, accordion behavior, conversion layer length, and whether the journey cards become too tall on small screens. The current design should be treated as mobile-directional, not mobile-final.

**Readiness:** Medium.

## Accessibility?

Accessibility is incomplete. The prototype uses semantic headings and buttons in several places, which is positive, but production requires a formal accessibility pass. Inputs need explicit labels, numeric input types, constraints, helper text, and error messaging. Buttons used as placeholders must either be disabled with explanatory text or clearly marked non-functional in production drafts. Color bands require text equivalents and cannot be the only method of communicating risk. FAQ details/summary behavior should be keyboard-tested. Focus order, focus states, contrast, aria labels, and screen reader output need review.

**Readiness:** Low-medium.

## SEO sections?

The content structure includes SEO-friendly sections: formula, knowledge, FAQ, related tools, trust, references, and search-intent-aligned headings. The supporting spec also defines metadata and structured data concepts. Production still needs final title/meta description, canonical strategy, breadcrumb plan, internal link destinations, intro copy, source citations, and schema JSON-LD implementation. The current prototype is not route-integrated, so SEO readiness is conceptual only.

**Readiness:** Medium.

## FAQ?

The FAQ is present and covers essential user questions: BMI as diagnosis, healthy BMI, athlete limitations, children, pregnancy, and next tools. Production should expand and finalize answers using source-backed language and map FAQ questions to FAQ schema. The FAQ should also be reviewed for duplication with the knowledge and trust sections.

**Readiness:** Medium-high.

## Trust?

Trust messaging is present in the hero note and footer trust/reference area. The copy correctly says BMI is a screening metric and not a diagnosis. Production still needs direct references and citation links, ideally from CDC, WHO, and NIH or other approved medical authorities. Trust should also include a more visible adult-only limitation and a clear statement that users should seek professional care for medical decisions.

**Readiness:** Medium.

## Related tools?

Related tools are represented with BMR, TDEE, Calories, Body Fat, Water Intake, Waist Ratio, and Weight Loss in the conversion layer. The semantic graph aligns with the Gold Tool spec. Production needs approved destination URLs, route availability, link priority, anchor labels, and behavior for tools that are not yet production-ready. Related tool prompts should vary by category where possible.

**Readiness:** Medium.

## Conversion layer?

The Emotion + Conversion Layer is useful and strategically aligned with retention. It introduces Progress Insight, Motivation, Health Journey, and Save / Share placeholders. However, this layer is the highest safety-risk area because it can imply personalized weight-loss advice. Production must define safe defaults, disclaimers, target-BMI behavior, timeline logic, goal-setting constraints, and whether the needed weight change should be shown at all. Save/share must remain placeholder-only until privacy, storage, account, and share-copy requirements are approved.

**Readiness:** Medium for concept, low-medium for production.

## Decision path?

The Decision Path is clear and maps high BMI to BMR → TDEE → Calories. The Health Journey separately maps Current → BMI → BMR → Calories → Progress. Production should define category-specific paths: underweight, normal, overweight, obesity classes, athletes, pregnancy, children, and invalid inputs. The decision path should not imply that all users should pursue calories or weight loss.

**Readiness:** Medium-high conceptually, medium for production.

## Schema coverage?

Schema is planned in the docs but not implemented in the prototype. Required production schema candidates include WebApplication or SoftwareApplication, FAQPage, HowTo or instructional schema if appropriate, BreadcrumbList, and potentially MedicalWebPage with caution. The team must decide which schema types are safe and accurate for a health calculator. No schema should be shipped until final content and FAQ are approved.

**Readiness:** Low for implementation, medium for planning.

## Future article links?

Future article links are not yet implemented. The content cluster suggests articles such as BMI guide, BMI vs BMR, BMI limitations, ideal weight guide, BMI chart, and body composition context. Production should map these article links before homepage exposure or Universe rollout. Missing article destinations should be marked as planned, not linked to dead routes.

**Readiness:** Low-medium.

## Performance risks?

The prototype is a single TSX file with static arrays and lightweight calculations, so runtime performance risk is low. Production risk comes from UI complexity, long page length, potential hydration cost if integrated poorly, large visual components, and future schema/analytics/link modules. Component decomposition is recommended before production integration. No heavy external data or network calls are present.

**Readiness:** Medium-high.

## Production readiness verdict

The BMI Gold prototype is ready for GPT review as a product/UX prototype. It is not ready for production integration. The recommended next step is review and gap closure, followed by production component planning, accessibility review, medical-copy review, schema planning, and route/registry approval. Do not commit, deploy, or replace the current BMI tool until GPT review and Victor approval are complete.
