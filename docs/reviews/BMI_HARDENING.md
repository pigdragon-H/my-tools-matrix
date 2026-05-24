# BMI Hardening Audit

**Status:** Draft only — GPT review required  
**Task:** Task 06.5 BMI Hardening Audit  
**Audited file:** `client/src/prototypes/BMIGoldPrototype.tsx`  
**Constraint:** Audit only. No TSX rewrite, no production integration, no commit, no deploy.

## Executive hardening verdict

The BMI Gold prototype is strong enough for product review, but it is not hardened for production. The highest-priority hardening areas are accessibility, medical-safety copy, schema implementation, source quality, mobile touch QA, and conversion-layer safety. The prototype includes the right conceptual sections and a strong guided flow, but production must treat this as a health-adjacent tool with stricter standards than a general calculator. No production integration should begin until GPT review and Victor approval confirm the safety and implementation direction.

## Accessibility

The prototype has visible labels around inputs and uses real buttons for several actions, which is a good starting point. It also uses `details` and `summary` for FAQ, which can be keyboard-accessible when used carefully. However, accessibility is not production-ready. Input fields need `type="number"`, `inputMode`, `min`, `max`, validation messages, and accessible descriptions for expected units. Error states must be announced to assistive technology. Placeholder-only Save and Share controls should not behave like active production actions unless implementation exists; if kept as placeholders in a production preview, they should be disabled or paired with explanatory text.

## Keyboard navigation

Keyboard navigation has not been tested. Production must verify tab order through quick action buttons, unit toggles, example cards, input fields, save/share placeholders, FAQ summaries, and related tool links. Focus states should be visibly distinct and not depend only on browser defaults. The metric/imperial toggle should communicate selected state to keyboard users. FAQ expansion should be reachable, operable, and understandable without a mouse.

## ARIA

ARIA use is minimal. The color band has an `aria-label`, which is useful, but more ARIA planning is needed. The unit toggle should use either proper buttons with `aria-pressed` or a tab/radio pattern. Result updates may need an `aria-live` region so screen reader users know when BMI and category change. The progress insight and health journey should have text alternatives that describe the sequence without relying on visual arrows. Avoid excessive ARIA if semantic HTML can solve the issue.

## Contrast

The broad color palette uses dark text on light backgrounds and should generally be readable, but production contrast must be measured. Risk exists in small uppercase labels, pale blue/pink/green cards, orange text on orange backgrounds, and white text on gradients. The color band cannot be the only signal for category meaning. Each category needs text status, range, and risk summary independent of color.

## Screen reader

Screen reader readiness is incomplete. Production must verify heading hierarchy, result announcement, input label output, FAQ announcement, and journey sequence. The current visual health journey uses arrows and card layout, which may read poorly unless structured as an ordered list or given a concise accessible description. The Save / Share placeholder must not confuse users into thinking data persistence exists.

## Mobile touch

The prototype is visually responsive, and screenshots show a stacked mobile layout. Hardening still requires touch target testing. Buttons and example cards appear large enough, but dense sections such as Result Intelligence, Conversion Layer, Health Journey, and FAQ could become long and tiring on small screens. Production should test 320px, 360px, 390px, 414px, tablet, and landscape widths. Important actions may need repeated or sticky affordances if the page becomes too long.

## Schema coverage

Schema is planned but not implemented. Production schema should be generated only after final content approval. Candidate schema types are FAQPage, BreadcrumbList, WebApplication or SoftwareApplication, and possibly HowTo if the calculator steps are written as stable instructions. A health calculator may also require extra caution around medical schema types. Schema must match visible content exactly and should not include claims that are not present on the page.

## FAQ schema

FAQ schema is appropriate if the final FAQ questions and answers are visible on the page and approved. Current FAQ coverage is useful, but final FAQ text needs source review, duplication review, and safety review. Production should not mark incomplete or placeholder FAQ content as schema.

## HowTo schema

HowTo schema may be appropriate if the page includes a clear, stable sequence such as choose units, enter height and weight, review BMI, and interpret next steps. It should not imply medical diagnosis or treatment. If the instructions are too interactive or personalized, a lighter WebApplication schema may be safer.

## Breadcrumb schema

Breadcrumb schema should be included when the production route and hierarchy are approved. Likely path candidates include Home → Health Tools → BMI Calculator or Home → Formula Universe → Health → BMI Calculator. Do not implement breadcrumb schema until route identity and page taxonomy are finalized.

## Tool schema

A WebApplication or SoftwareApplication schema can describe the BMI calculator as an online tool. Required fields should be reviewed for accuracy. Avoid medical claims, treatment claims, and unsupported ratings. Include application category, name, description, URL, and operating system/browser context only after deployment route is known.

## Performance

Current runtime performance risk is low because the prototype uses static arrays and simple BMI calculations. Production risk comes from monolithic component size, long page length, repeated card rendering, future analytics, schema modules, and possible addition of images or charts. Splitting the production build into components will improve maintainability and render clarity.

## Render risks

Render risks include hydration mismatch if calculations depend on client-only state in a server-rendered environment, long initial render because many sections appear at once, and layout shifts if result cards expand with long category text. Input validation can also trigger frequent re-rendering if not handled carefully. Production should keep calculations deterministic and lightweight.

## Future lazy loading

Lazy loading may be useful for lower-page sections such as FAQ, References, Related Articles, and possibly long Result Intelligence details. The core calculator, result card, trust note, and first next-step prompt should not be lazy loaded because they are primary user value. If charts or images are added later, they should be lazy loaded below the fold.

## Image strategy

The prototype currently does not rely on production images, which is good for performance. Future illustrations should be optional, optimized, responsive, and accessible. Prefer CSS or lightweight SVG for bands and node flows. Avoid heavy hero images for a utility page unless they provide measurable value. Any image must include meaningful alt text or be marked decorative when appropriate.

## SEO

SEO section coverage is conceptually strong: formula, knowledge, FAQ, trust, related tools, and references exist. Production still needs final title, meta description, canonical URL, route slug, heading hierarchy, internal links, schema, and source citations. The content should target the primary intent “BMI calculator” while supporting secondary intents such as healthy BMI range, BMI chart, BMI formula, BMI limitations, and BMI vs BMR.

## Title

A likely production title should be concise and intent-aligned, such as “BMI Calculator — Body Mass Index & Healthy Range.” The title should not overpromise diagnosis or personalized medical advice. Final title must be approved with SEO review.

## Meta

A production meta description should state that the page calculates adult BMI, explains the category, and provides safe next steps. It should include the screening limitation. Avoid claims such as “find your ideal weight instantly” unless medically reviewed and supported.

## Heading

The current heading structure is directionally good but should be validated in production. There should be one H1, logical H2s for calculator/result/interpretation/formula/FAQ/trust, and nested H3s for cards. Styling should not replace semantic hierarchy.

## Internal links

Internal links are not production-ready. Related tool labels exist, but destination routes must be approved. The future internal link map should include BMR, TDEE, Calories, Body Fat, Water Intake, Waist Ratio, Weight Loss, BMI guide, BMI chart, BMI limitations, BMI vs BMR, and Ideal Weight guide. Do not link to non-existent or unapproved routes.

## Trust

Trust is present but not hardened. The page states BMI is a screening tool and not a diagnosis. Production should make trust more robust by citing CDC, WHO, NIH, or other approved sources, showing date/review status if available, and explaining adult-only scope and limitations clearly.

## Source quality

Source quality must be upgraded before production. Current references are named but not linked. Production should use authoritative medical or public health sources, avoid blog-style sources for category thresholds, and document the source for formulas, ranges, and limitations. Citations should be stable and accessible.

## Medical disclaimer

The medical disclaimer is mandatory. It should be visible near the calculator/result and repeated or summarized near conversion prompts. It must state that BMI is a screening tool, not a diagnosis, and that users should consult qualified professionals for medical decisions. Conversion features involving goal BMI, weight change, timeline, or Weight Loss links require extra caution and disclaimer placement.

## Hardening conclusion

The prototype should remain in review. It has the right product structure but requires hardening across accessibility, schema, source quality, mobile QA, and conversion safety before any production integration. The next step is GPT review of the audit package, followed by Victor approval before implementation planning.
