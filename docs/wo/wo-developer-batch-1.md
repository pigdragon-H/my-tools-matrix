# Developer Batch 1 · Work Order Tracking

**Branch:** `feature/developer-batch-1`
**Base:** `81f3b49` (after Productivity Batch 1 closure)
**Gold template:** D-01 JsonFormatter — proposal mode (NOT auto-merged; awaits Victor visual approval)
**Standing rule:** D-02..D-10 reuse JsonFormatter as gold template once D-01 is approved.
**Color:** violet (`text-violet-600`, per categoriesConfig)

## Status Matrix

| ID  | Tool                     | Status      | Feature HASH | Main merge HASH | Notes |
|-----|--------------------------|-------------|--------------|-----------------|-------|
| D-01 | JsonFormatter           | 🔄 IN PROGRESS (PROPOSAL) | TBD | (pending Victor approval) | Developer gold template. Do NOT merge to main automatically. |
| D-02 | TBD                     | ⏳ blocked-by-D01 | — | — | Awaiting Victor's pick after D-01 approval |
| D-03 | TBD                     | ⏳ blocked-by-D01 | — | — | |
| D-04 | TBD                     | ⏳ blocked-by-D01 | — | — | |
| D-05 | TBD                     | ⏳ blocked-by-D01 | — | — | |
| D-06 | TBD                     | ⏳ blocked-by-D01 | — | — | |
| D-07 | TBD                     | ⏳ blocked-by-D01 | — | — | |
| D-08 | TBD                     | ⏳ blocked-by-D01 | — | — | |
| D-09 | TBD                     | ⏳ blocked-by-D01 | — | — | |
| D-10 | TBD                     | ⏳ blocked-by-D01 | — | — | |

## D-01 JsonFormatter spec (proposal)

- **Theme:** Paste arbitrary JSON → format / minify / validate → 6-band size matrix
- **Bands (6):** atomic / tiny / small / medium / large / huge
  - atomic   <100 B (ε / null / 1 token)
  - tiny     100 B – 1 KB (config snippet, single object)
  - small    1 – 10 KB (typical API response)
  - medium   10 – 100 KB (paginated list, sitemap chunk)
  - large    100 KB – 1 MB (full data export, mid-size dataset)
  - huge     > 1 MB (consider streaming / NDJSON instead)
- **Inputs (4-input pattern preserved):**
  1. JSON text (textarea)
  2. Indent size (radio: 2 / 4 / tab)
  3. Sort keys (checkbox)
  4. Mode (segmented control: format / minify) — preserves the unit-toggle pattern from MeetingCost
- **Output metrics:**
  - Validity (✅ / ❌ with line/column)
  - Byte size (UTF-8)
  - Depth (max nesting)
  - Token count (keys + values)
- **Color:** violet (matches categoriesConfig)
- **AdSlots:** `json-formatter-result-intelligence` (L8) · `json-formatter-faq` (L14)
- **L17 references (R11 satisfied via Harvard):**
  - IETF RFC 8259 — JSON Data Interchange Format (Bray, ed., 2017)
  - ECMA-404 — JSON Data Interchange Syntax (2nd ed., 2017)
  - Mozilla MDN — `JSON.parse` / `JSON.stringify` documentation
  - **Harvard CS50** — JSON & data-format curriculum module
  - JSON Schema 2020-12 (json-schema.org) — validation conventions
- **Affiliates (4):** PomodoroPlanner · WordCounter · DateDurationCalculator · (TBD second developer tool placeholder)
- **Privacy:** All parsing happens client-side; no JSON payload leaves the browser.

## Approval Gate (Victor)

Before merging to main:
- [ ] Visual ZH mode (full L1–L17)
- [ ] Visual EN mode (full L1–L17)
- [ ] 17/17 layers (qc_layer_audit.py)
- [ ] 14/15 red lights (R8 known FF)
- [ ] 0 TS errors
- [ ] Routes registered: ToolPage + toolsConfig + export const
- [ ] Color theme (violet) distinct from finance(red) / productivity (varied) / health (emerald)
- [ ] Privacy claim valid: client-side only

When Victor confirms, agent will execute:
```
git checkout main
git merge --no-ff feature/developer-batch-1 -m "Merge WO-DEV-BATCH-1 D-01: JsonFormatter — Developer gold template APPROVED"
git push origin HEAD:main
```
And then unblock D-02 production.
