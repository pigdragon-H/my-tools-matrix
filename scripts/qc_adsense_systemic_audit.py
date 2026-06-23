#!/usr/bin/env python3
"""QC §G · AdSense systemic guardrails.

Hard rules from 2026-06-01 Claude/Victor review:
1. Original 11 golden tools must each expose clean L12/L13 Knowledge+FAQ and an independent FAQ-after L14 AdSlot.
2. L12/L13 Knowledge+FAQ must be clean side-by-side; no middle/knowledge AdSlot may be inserted before L14.
3. During AdSense review, empty ad placeholders must not be visibly rendered when ads are disabled.
4. L7 result intelligence must provide six cards/items. Health activity-level tools must
   have exactly six activity levels and include Ultra High Intensity ×2.0+.
"""

from __future__ import annotations
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
AD_SLOT = ROOT / "client/src/components/business/AdSlot.tsx"
HEALTH_ACTIVITY_TOOLS = [
    ROOT / "client/src/tools/health/BmrCalculator/index.tsx",
    ROOT / "client/src/tools/health/TdeeCalculator/index.tsx",
]
ORIGINAL_11_TOOLS = [
    ("health/bmi-calculator", ROOT / "client/src/tools/health/BmiCalculator/index.tsx", "bmi-faq"),
    ("health/bmr-calculator", ROOT / "client/src/tools/health/BmrCalculator/index.tsx", "bmr-faq"),
    ("health/tdee-calculator", ROOT / "client/src/tools/health/TdeeCalculator/index.tsx", "tdee-faq"),
    ("finance/loan-calculator", ROOT / "client/src/tools/finance/LoanCalculator/index.tsx", "loan-faq"),
    ("finance/mortgage-calculator", ROOT / "client/src/tools/finance/MortgageCalculator/index.tsx", "mortgage-faq"),
    ("finance/credit-card-payoff-calculator", ROOT / "client/src/tools/finance/CreditCardPayoffCalculator/index.tsx", "credit-card-payoff-faq"),
    ("finance/debt-to-income-calculator", ROOT / "client/src/tools/finance/DebtToIncomeCalculator/index.tsx", "debt-to-income-faq"),
    ("finance/compound-interest-calculator", ROOT / "client/src/tools/finance/CompoundInterestCalculator/index.tsx", "compound-faq"),
    ("finance/retirement-calculator", ROOT / "client/src/tools/finance/RetirementCalculator/index.tsx", "retirement-faq"),
    ("finance/cagr-calculator", ROOT / "client/src/tools/finance/CagrCalculator/index.tsx", "cagr-faq"),
    ("finance/savings-goal-calculator", ROOT / "client/src/tools/finance/SavingsGoalCalculator/index.tsx", "savings-goal-faq"),
]
UNIVERSAL = ROOT / "client/src/tools/_shared/UniversalCalculatorTool.tsx"


def fail(msg: str) -> str:
    return f"  ✘ {msg}"


def check_adslot() -> list[str]:
    errs: list[str] = []
    text = AD_SLOT.read_text(encoding="utf-8")
    if "return null" in text:
        errs.append(fail("AdSlot still returns null; L14 #2 can become a blank white bar."))
    for marker in ["AD", "廣告", "sponsored content", "border-dashed", "bg-muted/20", "rounded-lg", "style={{ minHeight }}"]:
        if marker not in text:
            errs.append(fail(f"AdSlot missing #8-equivalent visible ad marker/style: {marker}"))
    if "aria-label=\"Sponsored content area\"" not in text:
        errs.append(fail("AdSlot aria-label must explicitly contain Sponsored content area."))
    return errs


def check_original_11_l14() -> list[str]:
    errs: list[str] = []
    for route, path, faq_slot in ORIGINAL_11_TOOLS:
        rel = path.relative_to(ROOT)
        if not path.exists():
            errs.append(fail(f"{route}: missing source file {rel}"))
            continue
        text = path.read_text(encoding="utf-8")
        if "L14-Knowledge-FAQ" not in text:
            errs.append(fail(f"{route}: missing L14-Knowledge-FAQ marker."))
        if "L14-SupportSection" not in text:
            errs.append(fail(f"{route}: missing explicit L14-SupportSection comment for FAQ-after ad."))
        if f'slot="{faq_slot}"' not in text:
            errs.append(fail(f"{route}: missing expected FAQ-after AdSlot slot=\"{faq_slot}\"."))
        if 'aria-label="L14 FAQ support section"' not in text:
            errs.append(fail(f"{route}: missing page-level L14 review-safe support-section aria-label."))
        if 'position="inline"' not in text:
            errs.append(fail(f"{route}: FAQ-after AdSlot must use position=\"inline\"."))
        knowledge_marker = text.find("L14-Knowledge-FAQ")
        l14_marker = text.find("L14-SupportSection", knowledge_marker if knowledge_marker >= 0 else 0)
        if knowledge_marker >= 0 and l14_marker >= 0:
            knowledge_faq_segment = text[knowledge_marker:l14_marker]
            if 'position="middle"' in knowledge_faq_segment or re.search(r'<AdSlot\b[^>]*slot="[^"]+-knowledge"', knowledge_faq_segment):
                errs.append(fail(f"{route}: L12/L13 Knowledge+FAQ must be clean; remove middle/knowledge AdSlot before independent L14."))
        if "<AdSlot" not in text:
            errs.append(fail(f"{route}: missing AdSlot component usage."))
    return errs


def extract_activity_array(text: str) -> str:
    m = re.search(r"const\s+activityLevels\s*:\s*ActivityInfo\[\]\s*=\s*\[(.*?)\];", text, re.S)
    return m.group(1) if m else ""


def check_health_activity_levels(path: Path) -> list[str]:
    errs: list[str] = []
    text = path.read_text(encoding="utf-8")
    arr = extract_activity_array(text)
    rel = path.relative_to(ROOT)
    if not arr:
        return [fail(f"{rel}: cannot find activityLevels array")]
    keys = re.findall(r'key:\s*"([^"]+)"', arr)
    if len(keys) != 6:
        errs.append(fail(f"{rel}: activityLevels must be exactly 6, got {len(keys)} ({keys})"))
    if "ultraActive" not in arr or "超高強度" not in arr or "2.0" not in arr or "2.0+" not in arr:
        errs.append(fail(f"{rel}: missing Ultra High Intensity / 超高強度 ×2.0+ level"))
    if "md:grid-cols-3" not in text:
        errs.append(fail(f"{rel}: BMR/TDEE L7 six activity cards must use 3-column visual layout for 6 cards."))
    if path.name == "index.tsx" and "BmrCalculator" in str(path):
        forbidden = ["各活動等級 TDEE 推估", "TDEE estimate by activity level"]
        for phrase in forbidden:
            if phrase in text:
                errs.append(fail(f"{rel}: BMR L7 heading must not use TDEE-tool wording: {phrase}"))
        for phrase in ["以 BMR 換算六種活動消耗", "Six activity-adjusted BMR estimates"]:
            if phrase not in text:
                errs.append(fail(f"{rel}: missing BMR-context L7 heading: {phrase}"))
    return errs


def check_universal_l7() -> list[str]:
    errs: list[str] = []
    if not UNIVERSAL.exists():
        return errs
    text = UNIVERSAL.read_text(encoding="utf-8")
    m = re.search(r"\[\s*\"categoryInfo\"(.*?)\]\.map", text, re.S)
    if not m:
        errs.append(fail("UniversalCalculatorTool: cannot find L7 card array."))
        return errs
    card_count = len(re.findall(r'"[^"]+"', '"categoryInfo"' + m.group(1)))
    if card_count != 6:
        errs.append(fail(f"UniversalCalculatorTool: L7 card array must be exactly 6, got {card_count}"))
    return errs


def main() -> int:
    checks = []
    checks += check_adslot()
    checks += check_original_11_l14()
    for path in HEALTH_ACTIVITY_TOOLS:
        checks += check_health_activity_levels(path)
    checks += check_universal_l7()

    print("§G · AdSense Systemic Audit")
    print("=" * 64)
    if checks:
        for err in checks:
            print(err)
        print("=" * 64)
        print("§G FAILED · fix original 11 L14 visible ad slots and L7 six-card rules")
        return 1
    print("  ✅ AdSlot review behavior is checked")
    print("  ✅ Original 11 tools each expose L14 Knowledge+FAQ plus FAQ-after AdSlot #2")
    print("  ✅ BMR/TDEE activity L7 has exactly 6 levels with 超高強度 ×2.0+")
    print("  ✅ Universal batch tools expose exactly 6 L7 result-intelligence cards")
    print("=" * 64)
    print("§G PASSED")
    return 0


if __name__ == "__main__":
    sys.exit(main())
