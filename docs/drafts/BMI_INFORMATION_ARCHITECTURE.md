# BMI Gold Tool — Information Architecture v1

**Project:** Formula Universe  
**Task:** Task 02 — Gold Tool IA  
**Status:** Draft Only — GPT Review Required  
**Target Tool:** BMI Calculator  
**Universe:** Health  
**Constraint:** No TSX, no component, no implementation code, no commit.

---

## IA Principle

The BMI Gold Tool page should satisfy quick calculator intent first, then progressively expand into trust, interpretation, decision support, knowledge, related tools, and references. The page is not a single calculator widget. It is an ordered knowledge experience that moves the user from input to understanding to next-step exploration.

---

## Section Order Overview

1. Hero
2. Trust banner
3. Quick usage
4. Input area
5. Examples
6. Calculator
7. Result card
8. Result intelligence
9. Decision path
10. Formula
11. Knowledge
12. FAQ
13. Related tools
14. Related articles
15. References
16. Schema

---

## 1. Hero

**Purpose:** Introduce the BMI Calculator, define the value proposition, and establish the page as a health screening knowledge tool.  
**User intent:** Users want to calculate BMI quickly and confirm they are on the right page.  
**SEO role:** Targets the primary query “BMI calculator” and reinforces related terms such as Body Mass Index and healthy BMI range.  
**Knowledge role:** Frames BMI as a health metric and screening concept, not merely a numeric output.  
**Priority:** P0 — must appear at the top.  
**Desktop placement:** Top full-width or two-column hero with a compact calculator preview on the right if approved later.  
**Mobile placement:** First visible section, short title and intro only, with calculator CTA immediately below.

---

## 2. Trust Banner

**Purpose:** Communicate that BMI is a screening tool, not a diagnosis, and that interpretation should be cautious.  
**User intent:** Users need confidence and safety guidance before interpreting health information.  
**SEO role:** Supports trustworthiness and health-content quality signals by clarifying limitations and reference basis.  
**Knowledge role:** Anchors the tool in responsible health education.  
**Priority:** P0 — should appear before or near calculator interaction.  
**Desktop placement:** Directly below hero as a horizontal banner.  
**Mobile placement:** Immediately below hero as a compact alert block.

---

## 3. Quick Usage

**Purpose:** Explain the calculator steps in a short, scannable format.  
**User intent:** Users want to know what to enter and how fast they can get a result.  
**SEO role:** Supports how-to intent and may later map to HowTo structured data.  
**Knowledge role:** Converts tool use into an explainable sequence.  
**Priority:** P0.  
**Desktop placement:** Near the calculator, either above input area or in a left-side guidance column.  
**Mobile placement:** Before input area, collapsed into three short steps.

---

## 4. Input Area

**Purpose:** Define user inputs: unit system, height, weight, and adult context warning if needed.  
**User intent:** Users want clear fields with minimal friction.  
**SEO role:** Supports query variants such as BMI kg cm, BMI pounds inches, and BMI formula.  
**Knowledge role:** Makes the measurement model transparent.  
**Priority:** P0.  
**Desktop placement:** Inside calculator panel, left column or top of calculator card.  
**Mobile placement:** Full-width stacked input fields.

---

## 5. Examples

**Purpose:** Show sample metric and imperial calculations so users understand expected input formats.  
**User intent:** Users want reassurance that they are entering height and weight correctly.  
**SEO role:** Captures long-tail calculation examples and supports featured snippet style content.  
**Knowledge role:** Demonstrates formula application with concrete values.  
**Priority:** P1.  
**Desktop placement:** Adjacent to or below input area as compact example chips/cards.  
**Mobile placement:** Below calculator or as collapsible examples after inputs.

---

## 6. Calculator

**Purpose:** Perform BMI calculation and route the user to result interpretation.  
**User intent:** Users want a fast, accurate BMI value.  
**SEO role:** Satisfies transactional search intent and improves page usefulness.  
**Knowledge role:** Operationalizes the formula in a transparent way.  
**Priority:** P0.  
**Desktop placement:** Prominent calculator card above the fold or near top of page.  
**Mobile placement:** Immediately after quick usage and trust banner.

---

## 7. Result Card

**Purpose:** Display BMI value, category, range, and concise interpretation.  
**User intent:** Users want to know “What does my BMI mean?”  
**SEO role:** Supports healthy BMI and BMI chart queries.  
**Knowledge role:** Turns raw output into a categorized health metric.  
**Priority:** P0 after calculation.  
**Desktop placement:** Right side of calculator or directly below input area.  
**Mobile placement:** Directly below calculate action, full-width.

---

## 8. Result Intelligence

**Purpose:** Explain category-specific meaning, risks, recommendations, and related tools.  
**User intent:** Users want next-step interpretation beyond the number.  
**SEO role:** Supports underweight, overweight, obesity, and healthy BMI range search intent.  
**Knowledge role:** Adds health-context intelligence and safe routing.  
**Priority:** P0/P1 — essential for Gold Tool quality.  
**Desktop placement:** Below calculator/result area as a detailed interpretation module.  
**Mobile placement:** Below result card, with accordion categories if needed.

---

## 9. Decision Path

**Purpose:** Guide users from BMI category to related next actions such as BMR, TDEE, calories, body fat, or professional guidance.  
**User intent:** Users ask, “What should I do next?”  
**SEO role:** Connects calculator intent to weight loss, ideal weight, and body composition intents.  
**Knowledge role:** Defines decision logic and semantic navigation.  
**Priority:** P1.  
**Desktop placement:** Below Result Intelligence as a visual pathway.  
**Mobile placement:** Stacked decision steps, simplified to one path at a time.

---

## 10. Formula

**Purpose:** Show the BMI formula, variables, metric version, imperial version, and rounding rules.  
**User intent:** Users want to verify how the number is calculated.  
**SEO role:** Targets BMI formula and calculation method queries.  
**Knowledge role:** Provides transparency and mathematical grounding.  
**Priority:** P1.  
**Desktop placement:** Below decision path or in a reference side column if the layout supports it.  
**Mobile placement:** Below decision path, collapsible only if page length becomes excessive.

---

## 11. Knowledge

**Purpose:** Explain what BMI is, history, limitations, when not to use BMI, children, athletes, pregnancy, BMI vs Body Fat, and BMI vs Waist Ratio.  
**User intent:** Users want deeper explanation or have concerns about accuracy.  
**SEO role:** Captures informational queries such as BMI limitations, BMI for athletes, BMI for children, and BMI vs body fat.  
**Knowledge role:** Converts the page into a health knowledge node.  
**Priority:** P1/P2 depending on page length.  
**Desktop placement:** Main content column below formula.  
**Mobile placement:** Long-form section after formula, with clear headings and jump links.

---

## 12. FAQ

**Purpose:** Answer common user questions and reduce ambiguity.  
**User intent:** Users want quick answers to specific doubts.  
**SEO role:** Supports FAQ search visibility and potential FAQ structured data.  
**Knowledge role:** Captures edge cases and interpretation boundaries.  
**Priority:** P1.  
**Desktop placement:** Below Knowledge section or beside references if using a two-column lower layout.  
**Mobile placement:** Accordion list after Knowledge section.

---

## 13. Related Tools

**Purpose:** Route users to BMR, TDEE, Calories, Body Fat, Water Intake, and Waist Ratio tools.  
**User intent:** Users want deeper assessment or practical planning.  
**SEO role:** Builds internal links and topical authority across the Health universe.  
**Knowledge role:** Connects BMI to the semantic graph.  
**Priority:** P1.  
**Desktop placement:** Sidebar or card grid after Decision Path.  
**Mobile placement:** Card stack after FAQ or after result intelligence depending on conversion priority.

---

## 14. Related Articles

**Purpose:** Connect the calculator to educational articles such as BMI Guide, BMI vs BMR, BMI Limitations, Ideal Weight Guide, and FAQ cluster.  
**User intent:** Users want deeper learning after using the calculator.  
**SEO role:** Supports content cluster strategy and captures informational long-tail queries.  
**Knowledge role:** Bridges tool pages and Knowledge Hub content.  
**Priority:** P2.  
**Desktop placement:** Lower-page content grid before references.  
**Mobile placement:** Stacked article cards near the end of the page.

---

## 15. References

**Purpose:** Cite authoritative sources such as WHO, CDC, and NIH.  
**User intent:** Users want to know whether health claims are trustworthy.  
**SEO role:** Supports credibility and health-content trust signals.  
**Knowledge role:** Provides provenance for category ranges, limitations, and screening language.  
**Priority:** P1 for health tools.  
**Desktop placement:** Near lower page, with anchor link from trust banner.  
**Mobile placement:** Near lower page after related articles or before schema note.

---

## 16. Schema

**Purpose:** Define future structured data targets such as FAQ schema, HowTo schema, Tool schema, Breadcrumb schema, and Entity schema.  
**User intent:** Not directly user-facing unless represented as visible content.  
**SEO role:** Supports future structured search eligibility.  
**Knowledge role:** Makes the page machine-readable and graph-ready.  
**Priority:** P2 — specification now, implementation later.  
**Desktop placement:** Not necessarily visible as a section; should be documented in page metadata after approval.  
**Mobile placement:** Not user-facing unless represented by visible FAQ or guide content.

---

## Desktop IA Summary

The desktop layout should prioritize a two-column top experience: educational hero/trust/quick usage on the left and calculator/result on the right. Below the fold, the page should move into Result Intelligence, Decision Path, Formula, Knowledge, FAQ, Related Tools, Related Articles, References, and Schema planning.

---

## Mobile IA Summary

The mobile layout should be linear and fast. The order should be Hero, Trust Banner, Quick Usage, Input Area, Calculator, Result Card, Result Intelligence, Decision Path, Formula, Knowledge, FAQ, Related Tools, Related Articles, References. Schema remains non-visual unless expressed through visible FAQ or HowTo content.

---

## GPT Review Questions

1. Should the calculator appear inside the hero on desktop, or immediately below the hero for consistency across Gold Tools?
2. Should Result Intelligence appear before Formula for health tools, even if Formula appears earlier for finance tools?
3. Should References appear near the Trust Banner as a summary and again near the bottom as full citations?
4. Should Schema remain purely metadata or have a visible “structured content” planning block in draft pages?
