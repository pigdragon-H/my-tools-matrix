# Formula Universe — Global Gold Tool Contract v1

**Status:** Draft Only — GPT Review Required  
**Purpose:** Define the reusable Gold Tool contract that BMI validates first and future tools such as CAGR Calculator and JSON Formatter must follow.  
**Constraint:** No TSX, no implementation, no registry modification, no commit.

---

## 1. Contract Purpose

A Gold Tool is a structured knowledge product, not only a calculator. Every Gold Tool must combine user action, result interpretation, formula or logic transparency, semantic relationships, trust, and machine-readable planning. BMI is the first Health template, but the same contract must generalize to finance tools such as CAGR and developer tools such as JSON Formatter.

The contract defines the required page layers, metadata requirements, and pre-deployment checklist so future tools can be reconstructed consistently.

---

## 2. Required Layers Contract

### 2.1 Hero

**Required:** Yes  
**Optional:** No  
**SEO role:** Targets primary page intent and confirms the tool name, category, and core query.  
**Knowledge role:** Frames the tool as a knowledge node and introduces the main concept.  
**AI role:** Provides primary entity identification and summary for retrieval.  
**Mobile rule:** Must be concise, with a short intro and immediate path to the tool.  
**Desktop rule:** May include richer context, category labels, and supporting use cases.

### 2.2 QuickGuide

**Required:** Yes  
**Optional:** No  
**SEO role:** Supports how-to intent and step-based search needs.  
**Knowledge role:** Converts tool usage into an explainable process.  
**AI role:** Supplies structured procedural steps for answer generation.  
**Mobile rule:** Display as three to five short stacked steps.  
**Desktop rule:** Can appear as horizontal steps, side guide, or compact instruction block.

### 2.3 Examples

**Required:** Yes for Gold Tools  
**Optional:** Only optional for extremely simple single-input tools after review.  
**SEO role:** Captures long-tail example queries and improves snippet relevance.  
**Knowledge role:** Demonstrates how inputs become outputs.  
**AI role:** Provides grounded examples for AI explanations and validation.  
**Mobile rule:** Stacked or collapsible example cards.  
**Desktop rule:** Example chips, cards, or comparison rows near the calculator.

### 2.4 Calculator

**Required:** Yes  
**Optional:** No  
**SEO role:** Satisfies transactional search intent.  
**Knowledge role:** Operationalizes the formula, logic, conversion, validation, or transformation.  
**AI role:** Establishes deterministic input-output behavior for the tool.  
**Mobile rule:** Full-width, early in the page, with clear validation.  
**Desktop rule:** Prominent top-area card or primary content column module.

### 2.5 Result

**Required:** Yes  
**Optional:** No  
**SEO role:** Supports result-related searches and category/result terms.  
**Knowledge role:** Turns output into a human-readable conclusion.  
**AI role:** Provides structured output fields for downstream reasoning.  
**Mobile rule:** Must appear immediately after calculation.  
**Desktop rule:** May appear adjacent to inputs or below calculator depending on layout.

### 2.6 Result Intelligence

**Required:** Yes  
**Optional:** No for Gold Tools  
**SEO role:** Captures interpretation queries such as “what does this result mean.”  
**Knowledge role:** Explains meaning, ranges, warnings, quality, risks, or validity.  
**AI role:** Supplies interpretation rules and contextual reasoning.  
**Mobile rule:** Accordion or focused current-result panel.  
**Desktop rule:** Category cards, tabs, or expanded interpretation grid.

### 2.7 Decision Layer

**Required:** Yes  
**Optional:** No for tools where users naturally need next steps; limited tools may use a minimal decision note.  
**SEO role:** Links primary tool intent to next-step search intents.  
**Knowledge role:** Routes users from answer to action or deeper understanding.  
**AI role:** Encodes decision paths and safe recommendations.  
**Mobile rule:** One path at a time or vertically stacked steps.  
**Desktop rule:** Flow diagram, multi-path cards, or decision tree.

### 2.8 Formula

**Required:** Yes, or equivalent logic section for non-math tools.  
**Optional:** No, but title may become Logic, Algorithm, Validation Rules, or Transformation Rules.  
**SEO role:** Targets formula, method, validation, and “how calculated” queries.  
**Knowledge role:** Provides transparency and repeatability.  
**AI role:** Supplies the formal rule set for reasoning and explanation.  
**Mobile rule:** Simple stacked formula or logic blocks.  
**Desktop rule:** Formula/logic card with variables, units, and assumptions.

### 2.9 Knowledge

**Required:** Yes  
**Optional:** No for Gold Tools  
**SEO role:** Captures informational queries and long-tail education intent.  
**Knowledge role:** Defines the concept, history/context, limitations, comparisons, and appropriate use.  
**AI role:** Provides retrieval content and semantic grounding.  
**Mobile rule:** Clear headings; long content can be collapsed only after review.  
**Desktop rule:** Main content section with optional anchor navigation.

### 2.10 Trust

**Required:** Yes  
**Optional:** No for health, finance, legal, tax, or high-risk tools; lighter trust copy may be acceptable for low-risk developer tools.  
**SEO role:** Supports credibility, authoritativeness, and user confidence.  
**Knowledge role:** States assumptions, limitations, disclaimers, and trusted source basis.  
**AI role:** Prevents overclaiming and clarifies safe-use boundaries.  
**Mobile rule:** Include a compact trust notice early and full trust detail later if needed.  
**Desktop rule:** Can include a trust banner plus a detailed trust/reference section.

### 2.11 FAQ

**Required:** Yes  
**Optional:** No for Gold Tools  
**SEO role:** Captures long-tail questions and supports FAQ schema planning.  
**Knowledge role:** Handles edge cases, misunderstandings, and comparisons.  
**AI role:** Supplies question-answer pairs for retrieval and summarization.  
**Mobile rule:** Accordion preferred.  
**Desktop rule:** Accordion, two-column list, or grouped FAQ clusters.

### 2.12 Related Tools

**Required:** Yes  
**Optional:** No  
**SEO role:** Builds internal linking and topical authority.  
**Knowledge role:** Connects tools into a semantic graph.  
**AI role:** Provides relationship edges for recommendations and navigation.  
**Mobile rule:** Stacked cards with relationship labels.  
**Desktop rule:** Grid, sidebar, or related graph module.

### 2.13 Related Articles

**Required:** Yes for Gold Tools with content clusters  
**Optional:** Temporarily optional if no article inventory exists, but article candidates must be listed.  
**SEO role:** Supports topic cluster strategy and informational search capture.  
**Knowledge role:** Bridges calculator pages and knowledge hub articles.  
**AI role:** Provides extended context sources for reasoning.  
**Mobile rule:** Stacked article links near lower page.  
**Desktop rule:** Article card grid or content cluster module.

### 2.14 References

**Required:** Yes for health, finance, science, legal, tax, engineering, and any claim-heavy tool.  
**Optional:** For low-risk developer utilities, references may be documentation sources rather than authorities.  
**SEO role:** Supports trust and claim provenance.  
**Knowledge role:** Grounds formulas, definitions, standards, or safety statements.  
**AI role:** Provides provenance and reduces hallucination risk.  
**Mobile rule:** Simple reference list.  
**Desktop rule:** Citation table or reference cards.

### 2.15 Schema

**Required:** Yes as a plan for Gold Tools  
**Optional:** Implementation optional until approved.  
**SEO role:** Prepares FAQ, HowTo, Tool, Breadcrumb, Entity, or domain-specific schema.  
**Knowledge role:** Makes the page machine-readable and graph-ready.  
**AI role:** Defines structured fields for retrieval and entity linking.  
**Mobile rule:** Usually non-visual; must correspond to visible content if implemented.  
**Desktop rule:** Usually non-visual; can appear in draft/spec views only.

---

## 3. Gold Metadata Contract

Every Gold Tool must define metadata before implementation. Canonical IDs must remain registry-owned and must not be invented in drafts.

### Required Metadata Fields

```yaml
entity_type: string
cluster: string
intent: string
difficulty: basic | intermediate | advanced
related_tools: string[]
related_articles: string[]
search_terms:
  primary: string[]
  secondary: string[]
faq_count: number
schema_types: string[]
trust_sources: string[]
```

### Recommended Metadata Fields

```yaml
universe: string
galaxy: string
system: string | null
tool_type: calculator | converter | validator | formatter | generator | analyzer | other
primary_entity: string
input_entities: string[]
output_entities: string[]
formula_entities: string[]
semantic_neighbors: string[]
risk_level: low | medium | high
disclaimer_required: boolean
reference_required: boolean
content_cluster: string[]
last_review_status: draft | gpt_review | victor_approved | implemented | deployed
```

### BMI Metadata Example

```yaml
entity_type: health metric
cluster: body composition
intent: assessment
difficulty: basic
related_tools:
  - BMR Calculator
  - TDEE Calculator
  - Calories Calculator
  - Body Fat Calculator
  - Water Intake Calculator
related_articles:
  - BMI Guide
  - BMI vs BMR
  - BMI Limitations
  - Ideal Weight Guide
search_terms:
  primary:
    - BMI calculator
  secondary:
    - healthy BMI
    - BMI chart
    - ideal weight
    - body fat
    - weight loss
faq_count: 8
schema_types:
  - FAQ
  - HowTo
  - Tool
  - Breadcrumb
  - Entity
trust_sources:
  - WHO
  - CDC
  - NIH
```

### CAGR Metadata Example

```yaml
entity_type: finance metric
cluster: investment growth
intent: calculation
difficulty: basic
related_tools:
  - ROI Calculator
  - Compound Interest Calculator
  - Investment Return Calculator
related_articles:
  - CAGR Guide
  - CAGR vs Average Return
  - Compound Growth Guide
search_terms:
  primary:
    - CAGR calculator
  secondary:
    - compound annual growth rate
    - annualized return
    - investment growth
faq_count: 8
schema_types:
  - FAQ
  - HowTo
  - Tool
  - Breadcrumb
  - Entity
trust_sources:
  - finance education sources
  - investment methodology references
```

### JSON Formatter Metadata Example

```yaml
entity_type: developer utility
cluster: JSON workflow
intent: formatting
 difficulty: basic
related_tools:
  - JSON Minifier
  - JSON Diff Checker
  - JSON Schema Validator
  - JSONPath Finder
related_articles:
  - JSON Guide
  - JSON vs JavaScript Object
  - JSON Validation Errors
search_terms:
  primary:
    - JSON formatter
  secondary:
    - format JSON
    - JSON beautifier
    - validate JSON
faq_count: 8
schema_types:
  - FAQ
  - HowTo
  - Tool
  - Breadcrumb
  - Entity
trust_sources:
  - JSON.org
  - MDN Web Docs
  - ECMAScript documentation
```

---

## 4. Cross-Tool Rules

Gold Tools must not rely only on UI polish. A Gold Tool is approved only when its knowledge layers, metadata, references, related graph, and schema plan are complete. Calculator behavior must be deterministic and explainable. Domain-specific safety rules must be stronger for health, finance, legal, tax, and scientific tools.

No Gold Tool implementation should begin until the knowledge spec, information architecture, component spec, render order, and metadata contract are reviewed.

---

## 5. Review Gate

Before any implementation, the following must be true:

```text
Knowledge Spec complete
Information Architecture complete
Component Spec complete
Render Order complete
Metadata Contract complete
Checklist passed
Screenshots reviewed
GPT review complete
Victor approval granted
```

Only after these gates may TSX implementation begin.
