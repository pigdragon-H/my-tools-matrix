# BMI Gap Analysis

**Status:** Draft only — GPT review required  
**Task:** Task 06 BMI Production Audit  
**Audited file:** `client/src/prototypes/BMIGoldPrototype.tsx`  
**Constraint:** Audit only. No TSX rewrite, no production integration, no commit, no deploy.

| Current | Missing | Priority | Risk | Fix |
|---|---|---:|---|---|
| Prototype includes BMI formula and adult category interpretation. | Final source-backed medical copy and citation URLs. | High | Health content may be too broad or insufficiently sourced. | Review copy against CDC, WHO, NIH, and approved internal health content rules before production. |
| Hero and trust note state BMI is a screening tool. | Stronger adult-only scope and clinical limitation language. | High | Users may misapply adult BMI to children, pregnancy, athletes, or medical decisions. | Add visible adult-only disclaimer and route users to professional guidance for excluded contexts. |
| Guided UX flow exists from hero to FAQ. | Production interaction specification for validation, reset, unit switching, and error states. | High | Invalid inputs may create confusing or unsafe results. | Define input constraints, validation messages, empty states, and edge-case behavior before component build. |
| Quick Action Card and examples are implemented in prototype. | Final example set and demographic safety review. | Medium | Example may imply a default ideal or demographic bias. | Approve example library and clarify examples are illustrative only. |
| Result Card includes BMI value, status, color band, risk summary, recommended action, and next tool. | Final visual design and non-color status indicators. | High | Color-only meaning may fail accessibility and miscommunicate risk. | Add labels, aria text, category captions, and accessible status summaries. |
| Result Intelligence shows BMI categories. | Category-specific copy safety review and source mapping. | High | Risk/action text could be interpreted as medical advice. | Review every category with approved health language and citations. |
| Emotion + Conversion Layer includes progress, motivation, journey, and save/share placeholder. | Safety rules for goal BMI, needed weight, timeline, and conversion prompts. | High | Conversion layer may imply personalized weight-loss advice. | Define safe copy, optional goal settings, disclaimers, and whether weight-change estimates should ship. |
| Save / Share placeholder is UI only. | Privacy, persistence, sharing copy, and account/storage decisions. | Medium | Users may expect data to be stored or shared. | Keep disabled or clearly placeholder until product/privacy approval. |
| Decision Path shows BMI high → BMR → TDEE → Calories. | Category-specific paths for underweight, normal, obesity classes, athletes, pregnancy, and children. | Medium | One-size path may push inappropriate next steps. | Define conditional next-step map by category and context. |
| Related tools are listed. | Approved URLs, route existence, priority order, and fallback behavior. | High | Broken links or premature exposure to unfinished tools. | Map each related tool to an approved production route before integration. |
| FAQ exists with core questions. | Final FAQ count, schema mapping, deduplication, and source review. | Medium | FAQ may be incomplete for SEO and trust. | Finalize FAQ set and create matching FAQPage schema only after approval. |
| Knowledge section exists. | Full article cluster linking and future content destinations. | Medium | Weak internal linking and incomplete Universe graph. | Define future articles such as BMI guide, BMI vs BMR, BMI limitations, BMI chart, and ideal weight guide. |
| Trust and references are represented. | Direct citation links and source display style. | High | Trust layer remains too generic for production health content. | Add approved references with URLs and citation placement rules. |
| Schema is planned in docs. | Actual JSON-LD implementation and schema type decision. | High | SEO structured data missing or potentially inaccurate. | Decide schema types, generate validated JSON-LD, and test with schema tools before deployment. |
| Prototype uses responsive classes and has mobile screenshots. | Real-device QA, touch target checks, focus order, and long-page mobile usability testing. | High | Mobile experience may be too long or hard to navigate. | Run mobile QA at common breakpoints and simplify cards if needed. |
| Inputs have labels in prototype. | Numeric input types, min/max rules, aria messages, keyboard behavior, and error handling. | High | Accessibility and usability failures. | Add production form spec and accessibility checklist before build. |
| Static arrays and simple calculations keep runtime light. | Component decomposition and production bundle review. | Medium | Large monolithic component may be hard to maintain. | Split into typed production components after approval. |
| Prototype is isolated under `client/src/prototypes/`. | Production route, registry identity, and toolsConfig plan. | High | Incorrect integration could replace current BMI unintentionally. | Require GPT review and Victor approval before any route/registry/toolsConfig work. |
| No analytics included. | Event taxonomy for calculate, example click, next tool click, save/share placeholder, and FAQ interaction. | Low-medium | Product learning may be incomplete after launch. | Define privacy-safe analytics events during production planning. |
| No deploy or commit performed. | Review approval chain. | High | Premature shipping would violate reconstruction workflow. | Wait for GPT review, Victor approval, then commit/push only if approved. |
