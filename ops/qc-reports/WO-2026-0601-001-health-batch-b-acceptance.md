# WO-2026-0601-001 v3.1 · Health Batch B Acceptance Report

**Date**: 2026-06-03
**Branch**: `feature/health-batch-b-water-intake`
**Reporter**: SuperNinja
**Approver**: Pending Victor visual QC

---

## Scope

Per Handover Doc v3.1, Health Batch B targets 8 Health tools for quality unification against the new gold templates:

- **Health gold template**: Macro Planner (`MacroCalculator`)
- **Quality benchmark**: GOLD-STANDARD-001 = Body Fat Calculator
- **Forbidden**: BMI as any kind of template (including visual reference); A-group tools must not be touched.

---

## 4-dimension QC matrix

| # | Tool | §A 17-Layer | 15 Red-Lights | TSC | Visual EN | Formula | Status |
|---|---|---|---|---|---|---|---|
| 01 | body-fat-calculator | 17/17 | 15/15 | 0 errors | ✅ | ✅ | ✅ Done (prior batch) |
| 02 | calorie-deficit-calculator | 17/17 | 15/15 | 0 errors | ✅ | ✅ | ✅ Done (prior batch) |
| 03 | ideal-weight-calculator | 17/17 | 15/15 | 0 errors | ✅ | ✅ | ✅ Done (prior batch) |
| **04** | **water-intake-calculator** | **17/17** | **15/15** | **0 errors** | **✅** | **✅ 70×35+45×8+750=3560 ml** | **🟢 commit `3e0d17b` → main `7505d5b`** |
| **05** | **macro-calculator** (gold template) | **17/17** | **15/15** | **0 errors** | **✅** | **✅ P 126g + F 67g + C 324g = 2400 kcal** | **🟢 No-diff (already gold)** |
| **06** | **tdee-calculator** | **17/17** | **15/15** | **0 errors** | **✅** | **✅ BMR 1649 × 1.55 = 2556 kcal** | **🟢 No-diff (already aligned)** |
| **07** | **bmr-calculator** | **17/17** | **15/15** | **0 errors** | **✅** | **✅ Mifflin: 70×10+175×6.25−5×30+5 = 1649** | **🟢 No-diff (already aligned)** |
| 08 | bmi-calculator | (not audited) | — | — | — | — | 🛑 **Profile A — touch forbidden by WO** |

---

## Findings

### ✅ Production-quality (no diff needed)

`#05 macro-calculator`, `#06 tdee-calculator`, `#07 bmr-calculator` are already aligned with the new gold-template specification:

- 17 canonical layers L1–L17 present and ordered
- 15 red-light self-check passes
- BMR sizing spec v1.1 fully present (6/6 grid ratios)
- AffiliateItem typed; affiliateItems = 4 entries with named hrefs
- L12 has formula + formulaText with units
- L13 has 6 FAQ pairs including defensive question
- L17 cites named sources (ACSM, IOM, Phillips & Van Loon, WHO, Mifflin-St Jeor)
- EN/ZH bidirectional lang switch verified at runtime
- TypeScript noEmit: 0 errors per tool
- Formula correctness manually verified

→ No code changes required for #05–#07.

### 🟢 Fixed in this batch

`#04 water-intake-calculator` had hardcoded ZH strings in the L5 example chips (`"70 kg · 0 min · 無氣候"` / `"70 kg · 45 min · 炎熱"`). Fixed via:
- Added i18n keys `baselineExampleDetail` / `activeExampleDetail` in `ui.zh` + `ui.en`
- Replaced hardcoded JSX strings with `{t.baselineExampleDetail}` / `{t.activeExampleDetail}`
- Verified bidirectional EN/ZH switch with no residue

Commit: `3e0d17b` → merged to main as `7505d5b`.

### 🛑 Conflict raised — needs Victor decision

**`#08 bmi-calculator` is `@profile A`**, which the same Handover Doc v3.1 explicitly forbids:

- "❌ **觸碰 A 組工具**" (禁止事項)
- "❌ **使用 BMI 作為代碼模板或校正模板（Profile A，全面禁止）**"

Yet the Health Batch B work list also lists it as `#08 bmi-calculator (待量產)`.

**SuperNinja action**: Per the `A 組異常 → 通報但不停工` protocol, I am **not touching `#08`**. Reporting to Victor for decision (e.g. exempt `#08` from this batch, or migrate it from Profile A to Profile B in a separate WO).

---

## Tooling added in this batch

- `scripts/qc_15_red_lights.py` — automates the 15 red-light self-check from Superninja 操作準則 v1.0. Used as the gating check before every commit.

---

## Commits in this batch on `feature/health-batch-b-water-intake`

| Commit | Note |
|---|---|
| `3e0d17b` | feat(B-#04): WaterIntakeCalculator — Pass 2 quality unification + 15-RL script |
| _(this report)_ | docs(qc): Health Batch B acceptance report |

Main HEAD after merge: **`7505d5b`** (from `9bd5724`).

---

## Next step

Awaiting Victor decision on:
1. **#08 BmiCalculator** — should it be exempted, or moved to Profile B in a separate WO? (current Profile A status blocks it.)
2. **Health Batch B closure** — if exempted, Health Batch B is **7/7 done** (excluding #08). Confirm closure and authorize next batch (Productivity or Developer).

Per SOP, SuperNinja continues to next WO without waiting for Railway deployment confirmation. Will await Victor dispatch for the next category.
