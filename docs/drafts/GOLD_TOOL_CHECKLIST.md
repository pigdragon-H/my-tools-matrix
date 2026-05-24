# Gold Tool Pre-Deployment Checklist

**Status:** Draft Only — GPT Review Required  
**Purpose:** Use this checklist before any Gold Tool deployment.  
**Constraint:** No implementation approval is implied by this checklist.

---

## 1. Process Gate

- [ ] Workspace check completed with `pwd`.
- [ ] Git top-level confirmed with `git rev-parse --show-toplevel`.
- [ ] Single active repo confirmed.
- [ ] No duplicate repo edits.
- [ ] No root edits.
- [ ] No cross-repo writes.
- [ ] GPT review completed.
- [ ] Victor approval completed.
- [ ] Commit allowed only after approval.

---

## 2. Knowledge Gate

- [ ] Knowledge spec exists.
- [ ] Tool concept is clearly defined.
- [ ] Use cases are documented.
- [ ] Limitations are documented.
- [ ] When-not-to-use guidance exists when applicable.
- [ ] Comparisons to related concepts are included.
- [ ] Result interpretation is complete.
- [ ] Decision layer is defined.

---

## 3. Calculator Gate

- [ ] Inputs are defined.
- [ ] Units are defined.
- [ ] Examples are included.
- [ ] Validation rules are defined.
- [ ] Formula or logic is transparent.
- [ ] Result format is defined.
- [ ] Error states are defined.
- [ ] Copy/reset behavior is defined if relevant.

---

## 4. Result Intelligence Gate

- [ ] Result categories or output states are defined.
- [ ] Meaning is explained for each category or output state.
- [ ] Risks, warnings, or caveats are documented when relevant.
- [ ] Recommended actions are documented.
- [ ] Related tools are mapped to result states.
- [ ] Safety language is present for high-risk domains.

---

## 5. FAQ Gate

- [ ] FAQ exists.
- [ ] Minimum FAQ count is met.
- [ ] Questions reflect real search intent.
- [ ] Answers are concise and accurate.
- [ ] Edge cases are covered.
- [ ] FAQ schema eligibility is considered.

---

## 6. Related Graph Gate

- [ ] Related tools are listed.
- [ ] Relationship labels are defined.
- [ ] Related articles are listed or planned.
- [ ] Semantic neighbors are documented.
- [ ] Graph does not invent canonical IDs.
- [ ] Internal links are aligned with approved taxonomy.

---

## 7. Trust Gate

- [ ] Trust source exists.
- [ ] References are listed.
- [ ] Claims are supported by credible sources.
- [ ] Disclaimer exists when required.
- [ ] Risk level is defined.
- [ ] Tool does not overclaim.
- [ ] Health, finance, legal, tax, and science tools include stronger caution language.

---

## 8. Schema Gate

- [ ] FAQ schema plan defined.
- [ ] HowTo schema plan defined when applicable.
- [ ] Tool schema plan defined.
- [ ] Breadcrumb schema plan defined.
- [ ] Entity schema plan defined.
- [ ] Schema plan reflects visible content.
- [ ] Schema does not claim diagnosis, treatment, financial advice, or unsupported capabilities.

---

## 9. Metadata Gate

- [ ] `entity_type` defined.
- [ ] `cluster` defined.
- [ ] `intent` defined.
- [ ] `difficulty` defined.
- [ ] `related_tools` defined.
- [ ] `related_articles` defined or planned.
- [ ] `search_terms` defined.
- [ ] `faq_count` defined.
- [ ] `schema_types` defined.
- [ ] `trust_sources` defined.
- [ ] Registry-owned canonical ID is not invented.

---

## 10. UX / IA Gate

- [ ] Hero exists.
- [ ] QuickGuide exists.
- [ ] Examples exist.
- [ ] Calculator exists.
- [ ] Result exists.
- [ ] Result Intelligence exists.
- [ ] Decision Layer exists.
- [ ] Formula or Logic section exists.
- [ ] Knowledge section exists.
- [ ] Trust section exists.
- [ ] FAQ exists.
- [ ] Related Tools exist.
- [ ] Related Articles exist or are planned.
- [ ] References exist.
- [ ] Schema plan exists.
- [ ] Desktop placement is defined.
- [ ] Mobile placement is defined.

---

## 11. Deployment Readiness Gate

- [ ] Draft screenshots reviewed.
- [ ] GPT review passed.
- [ ] Victor approval received.
- [ ] Implementation branch identified.
- [ ] Registry rules confirmed.
- [ ] No unauthorized registry touch.
- [ ] No unauthorized production page changes.
- [ ] Commit message prepared.
- [ ] Push approval received.

---

## 12. Final Decision

```text
If any required gate fails, do not implement and do not deploy.
If GPT review is missing, do not commit.
If Victor approval is missing, do not commit.
If registry identity is unclear, stop and ask.
```
