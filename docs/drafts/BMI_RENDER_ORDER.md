# BMI Gold Tool — Render Order v1

**Status:** Draft Only — GPT Review Required  
**Constraint:** No TSX, no component implementation, no code, no commit.

---

## Final Render Order

```text
1. Hero
2. QuickGuide
3. Input
4. Example
5. Calculator
6. Result
7. Decision
8. Formula
9. Knowledge
10. Trust
11. FAQ
12. Related
13. References
14. Schema
```

---

## Render Order Rationale

### 1. Hero

The page must immediately confirm that it is a BMI Calculator and explain the value proposition.

### 2. QuickGuide

Users should understand the input sequence before interacting with fields.

### 3. Input

The input area appears early because the primary intent is calculation.

### 4. Example

Examples reduce input confusion and support both metric and imperial users.

### 5. Calculator

The calculator action follows inputs and examples.

### 6. Result

The result must appear immediately after calculation and should be easy to scan.

### 7. Decision

The decision path follows the result because users next ask what to do with the BMI category.

### 8. Formula

The formula appears after the user has received the result and decision context, supporting verification and learning.

### 9. Knowledge

The deeper knowledge layer follows the operational experience and formula explanation.

### 10. Trust

Trust content appears after knowledge in the final order, while a short trust banner may still appear earlier if GPT approves a split between TrustBanner and TrustSection.

### 11. FAQ

FAQ captures edge cases and search questions after users have seen the main explanation.

### 12. Related

Related tools and articles appear after FAQ to route users toward broader Health universe exploration.

### 13. References

References support all claims and provide authority near the end of the page.

### 14. Schema

Schema planning remains last and non-implementation-only during draft phase.

---

## Mapping to Component Names

```text
Hero → HeroSection
QuickGuide → QuickGuide
Input → InputPanel
Example → ExamplePanel
Calculator → CalculatorCard
Result → ResultCard + ResultIntelligence
Decision → DecisionPath
Formula → FormulaSection
Knowledge → KnowledgeSection
Trust → TrustSection
FAQ → FAQSection
Related → RelatedTools + RelatedArticles
References → References
Schema → SchemaBlock
```

---

## GPT Review Notes

The requested final order places Trust after Knowledge. This differs from the earlier IA where a Trust Banner appeared near the top. A possible reconciliation is to keep a short early trust banner as part of Hero or QuickGuide, while the full TrustSection renders later in the final order. GPT review should decide whether this split is required.
