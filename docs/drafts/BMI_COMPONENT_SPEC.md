# BMI Gold Tool — Component Specification v1

**Project:** Formula Universe  
**Task:** Task 03 — BMI Component Spec  
**Status:** Draft Only — GPT Review Required  
**Constraint:** No TSX, no implementation, no production component, no registry change, no commit.

---

## Component System Principle

The BMI Gold Tool component system should separate knowledge structure from implementation. Components in this document describe responsibilities, expected data, state ownership, layout behavior, SEO contribution, and knowledge role. They are not implementation instructions yet. No React component should be created until GPT review and Victor approval.

---

## 1. HeroSection

**Purpose:** Introduce the BMI Calculator, communicate the value proposition, and confirm the page matches the user’s search intent.  
**Props:** toolName, shortIntro, useCases, primaryIntent, universeLabel, galaxyLabel, disclaimerAnchor.  
**Input:** Static editorial content from the BMI Gold Tool spec.  
**Output:** Visible hero content with title, intro, use-case framing, and optional anchor links.  
**State:** None.  
**Mobile behavior:** Compact title, short intro, one primary CTA to calculator, no long prose.  
**Desktop behavior:** Wider introduction, optional use-case bullets, and contextual labels for Health / Biometrics.  
**SEO role:** Targets “BMI calculator,” “Body Mass Index,” and primary page intent.  
**Knowledge role:** Establishes BMI as a health metric and screening concept.

---

## 2. QuickGuide

**Purpose:** Give users a short sequence for using the calculator before they reach the input fields.  
**Props:** steps, unitNote, safetyNote.  
**Input:** Ordered step labels such as choose units, enter height, enter weight, read result.  
**Output:** A concise step-by-step guide.  
**State:** None.  
**Mobile behavior:** Three or four stacked steps with minimal copy.  
**Desktop behavior:** Horizontal step cards or a compact sidebar guide near the calculator.  
**SEO role:** Supports how-to intent and future HowTo schema alignment.  
**Knowledge role:** Converts calculator operation into an explainable process.

---

## 3. InputPanel

**Purpose:** Define and collect the data needed to calculate BMI.  
**Props:** unitSystem, heightMetric, weightMetric, feet, inches, weightImperial, validationMessages, onInputChange.  
**Input:** User-provided height, weight, and unit system.  
**Output:** Normalized input state ready for calculation, plus validation messages.  
**State:** Owns temporary form state only if approved; otherwise receives controlled values from a parent calculator controller.  
**Mobile behavior:** Full-width stacked fields; unit selector appears first; validation appears inline.  
**Desktop behavior:** Grouped fields inside a calculator panel, possibly two-column for height and weight.  
**SEO role:** Supports query variants such as BMI kg cm and BMI pounds inches.  
**Knowledge role:** Makes measurement units and accepted formats explicit.

---

## 4. ExamplePanel

**Purpose:** Provide sample inputs and expected interpretation patterns so users understand correct formats.  
**Props:** examples, selectedUnitSystem, onUseExample.  
**Input:** Static examples for metric and imperial calculation.  
**Output:** Example cards or chips that can populate the calculator if implementation is approved later.  
**State:** None, unless future implementation supports selected example highlighting.  
**Mobile behavior:** Collapsible or stacked examples placed below inputs or after calculator.  
**Desktop behavior:** Adjacent example cards beside the input area or below quick guide.  
**SEO role:** Supports long-tail example searches and calculation clarity.  
**Knowledge role:** Demonstrates how formula variables map to real values.

---

## 5. CalculatorCard

**Purpose:** Contain the operational BMI calculation experience, including inputs, actions, and calculated output routing.  
**Props:** inputValues, validationState, calculationResult, onCalculate, onReset, onCopy, children.  
**Input:** Normalized form values from InputPanel.  
**Output:** BMI value, category, and result state passed to ResultCard and ResultIntelligence.  
**State:** Calculation state may be centralized here or in a future page-level controller. Draft does not decide implementation.  
**Mobile behavior:** Calculator appears early and full-width after QuickGuide.  
**Desktop behavior:** Calculator may sit in the top-right column near Hero and Trust content.  
**SEO role:** Satisfies primary transactional calculator intent.  
**Knowledge role:** Operationalizes the BMI formula and anchors the page’s utility.

---

## 6. ResultCard

**Purpose:** Display the BMI value, category, range label, short meaning, and safety reminder.  
**Props:** bmiValue, category, rangeLabel, shortMeaning, safetyReminder, relatedAnchor.  
**Input:** Calculation result from CalculatorCard.  
**Output:** Human-readable result summary.  
**State:** None; derives from calculation result.  
**Mobile behavior:** Appears immediately after calculator action, full-width and scannable.  
**Desktop behavior:** Can appear beside input fields or below CalculatorCard.  
**SEO role:** Supports healthy BMI, BMI chart, and BMI category queries.  
**Knowledge role:** Turns raw number into a categorized health metric.

---

## 7. ResultIntelligence

**Purpose:** Explain category-specific meaning, health risks, recommended actions, and related tools.  
**Props:** activeCategory, categoryPanels, relatedToolsByCategory, disclaimerText.  
**Input:** BMI category and editorial intelligence content.  
**Output:** Detailed interpretation for underweight, normal, overweight, obesity I, obesity II, and obesity III.  
**State:** May track active/open category if implemented as tabs or accordions.  
**Mobile behavior:** Accordion list with the current category expanded first.  
**Desktop behavior:** Category cards, tabs, or a highlighted active category with supporting panels.  
**SEO role:** Captures underweight, overweight, obesity, and healthy BMI range intent.  
**Knowledge role:** Adds the intelligence layer that makes BMI useful beyond a number.

---

## 8. DecisionPath

**Purpose:** Route users from BMI interpretation to logical next steps such as BMR, TDEE, Calories, Body Fat, or professional guidance.  
**Props:** currentCategory, paths, relatedToolLinks, professionalGuidanceCopy.  
**Input:** BMI category and decision logic from the spec.  
**Output:** A visible next-step path.  
**State:** May highlight the path relevant to the current BMI category.  
**Mobile behavior:** One path shown at a time or stacked decision steps.  
**Desktop behavior:** Flow diagram or multi-column path cards.  
**SEO role:** Connects BMI intent to weight loss, ideal weight, metabolism, and body composition intents.  
**Knowledge role:** Provides graph navigation and decision support.

---

## 9. TrustSection

**Purpose:** Explain that BMI is a screening tool, not a diagnosis, and cite trusted health authorities.  
**Props:** disclaimer, references, sensitiveContexts, referenceAnchorLinks.  
**Input:** Trust copy and references such as WHO, CDC, and NIH.  
**Output:** Visible trust and disclaimer section.  
**State:** None.  
**Mobile behavior:** Compact warning block near the top and detailed trust section near references.  
**Desktop behavior:** Banner near the top plus detailed trust section in lower content.  
**SEO role:** Supports health-content trust and safety.  
**Knowledge role:** Establishes boundaries for interpretation and prevents overclaiming.

---

## 10. FormulaSection

**Purpose:** Show the mathematical basis of BMI, including metric and imperial formulas.  
**Props:** coreFormula, metricFormula, imperialFormula, variables, unitRules, roundingRules.  
**Input:** Formula definitions from the spec.  
**Output:** Formula explanation with variables and unit conversion notes.  
**State:** None.  
**Mobile behavior:** Stacked formula blocks; avoid dense tables if possible.  
**Desktop behavior:** Formula card plus variable definition table.  
**SEO role:** Targets BMI formula and calculation method queries.  
**Knowledge role:** Provides mathematical transparency.

---

## 11. KnowledgeSection

**Purpose:** Provide deeper educational content about BMI history, limitations, when not to use BMI, and comparisons.  
**Props:** knowledgeBlocks, comparisonBlocks, limitationBlocks.  
**Input:** Editorial content from Knowledge Layer.  
**Output:** Long-form knowledge content with clear headings.  
**State:** None, unless future implementation uses collapsible blocks.  
**Mobile behavior:** Sequential blocks with anchor navigation or collapsible headings if lengthy.  
**Desktop behavior:** Main content column, possibly with a sticky table of contents.  
**SEO role:** Captures informational queries such as BMI limitations, BMI for athletes, and BMI vs body fat.  
**Knowledge role:** Converts the tool into a Health Knowledge Node.

---

## 12. FAQSection

**Purpose:** Answer common BMI questions and support future FAQ structured data.  
**Props:** faqItems, schemaEligibilityFlag.  
**Input:** Curated FAQ entries.  
**Output:** Question-and-answer list.  
**State:** May track open accordion items if implemented interactively.  
**Mobile behavior:** Accordion list preferred.  
**Desktop behavior:** Accordion or two-column FAQ list depending on content length.  
**SEO role:** Supports long-tail search and FAQ schema planning.  
**Knowledge role:** Captures edge cases and clarifies safe interpretation.

---

## 13. RelatedTools

**Purpose:** Connect BMI to next-step tools such as BMR, TDEE, Calories, Body Fat, Water Intake, and Waist Ratio.  
**Props:** tools, relationshipLabels, currentCategoryContext.  
**Input:** Related tool metadata and relationship explanations.  
**Output:** Related tool cards or links.  
**State:** None.  
**Mobile behavior:** Stacked cards with short relationship labels.  
**Desktop behavior:** Grid or sidebar module.  
**SEO role:** Strengthens internal linking and Health universe topical authority.  
**Knowledge role:** Represents semantic graph edges between health tools.

---

## 14. RelatedArticles

**Purpose:** Connect the tool to supporting educational content such as BMI Guide, BMI vs BMR, BMI Limitations, and Ideal Weight Guide.  
**Props:** articles, clusterLabels, articleDescriptions.  
**Input:** Article metadata from content cluster plan.  
**Output:** Related article cards or link list.  
**State:** None.  
**Mobile behavior:** Stacked article cards near the lower page.  
**Desktop behavior:** Grid below related tools or before references.  
**SEO role:** Supports content cluster expansion and informational query capture.  
**Knowledge role:** Bridges tool and Knowledge Hub content.

---

## 15. References

**Purpose:** Display authoritative source references and support trust claims.  
**Props:** references, accessDates, sourceTypes, citationNotes.  
**Input:** WHO, CDC, NIH, and any future approved source list.  
**Output:** Reference list with labels and context.  
**State:** None.  
**Mobile behavior:** Simple stacked reference list.  
**Desktop behavior:** Reference cards or compact citation table.  
**SEO role:** Supports credibility and health information trust.  
**Knowledge role:** Provides provenance for medical and public-health statements.

---

## 16. SchemaBlock

**Purpose:** Define future structured data targets without implementing them in this draft phase.  
**Props:** faqSchemaPlan, howToSchemaPlan, toolSchemaPlan, breadcrumbSchemaPlan, entitySchemaPlan.  
**Input:** Schema planning metadata from the Structured Data Layer.  
**Output:** Internal planning block or non-visual metadata plan after approval.  
**State:** None.  
**Mobile behavior:** Not user-facing unless shown as a draft planning block.  
**Desktop behavior:** Not user-facing unless shown as a draft planning block.  
**SEO role:** Plans FAQ, HowTo, Tool, Breadcrumb, and Entity schema.  
**Knowledge role:** Prepares BMI as a machine-readable health metric entity.

---

## Cross-Component Data Flow Draft

```text
InputPanel
↓
CalculatorCard
↓
ResultCard
↓
ResultIntelligence
↓
DecisionPath
↓
RelatedTools / RelatedArticles / KnowledgeSection
```

TrustSection, FormulaSection, References, and SchemaBlock support the page globally rather than depending on a single calculation state.

---

## GPT Review Questions

1. Should TrustSection be considered a top-level section, or split into TrustBanner and References-supported TrustDetail?
2. Should ResultIntelligence own category panels, or should category content be part of ResultCard expansion?
3. Should SchemaBlock be visible in draft pages or remain purely internal metadata?
4. Should CalculatorCard own calculation state, or should a future page-level controller own state and pass props down?
