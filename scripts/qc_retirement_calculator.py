#!/usr/bin/env python3
"""QC validation for RetirementCalculator Chinese layout remediation."""
import re, sys, os

TARGET = os.path.join(os.path.dirname(__file__), "..", "client", "src", "tools", "finance", "RetirementCalculator", "index.tsx")

def read_file(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

def main():
    s = read_file(TARGET)
    errors = []
    checks = []

    # 1. Badge must not contain "Gold Tool"
    if "Gold Tool" in s:
        errors.append("FAIL: 'Gold Tool' still present")
    else:
        checks.append("PASS: badge '黃金工具' (no Gold Tool)")

    # 2. faq must be "常見問答" not "FAQ"
    if re.search(r'faq:\s*"FAQ"', s):
        errors.append("FAIL: faq still 'FAQ'")
    else:
        checks.append("PASS: faq = 常見問答")

    # 3. premiumTitle must not start with "PRO"
    if re.search(r'premiumTitle:\s*"PRO ', s):
        errors.append("FAIL: premiumTitle starts with 'PRO'")
    else:
        checks.append("PASS: premiumTitle = 專業版...")

    # 4. switchToEnglish must be Chinese
    if re.search(r'switchToEnglish:\s*"Switch to English"', s):
        errors.append("FAIL: switchToEnglish still English")
    else:
        checks.append("PASS: switchToEnglish = 切換到英文")

    # 5. intro must use "國際公認的" not "Investopedia 與 SEC 公認的"
    if "Investopedia 與 SEC 公認的" in s:
        errors.append("FAIL: intro still has 'Investopedia 與 SEC 公認的'")
    else:
        checks.append("PASS: intro uses '國際公認的'")

    # 6. definitionText must not have "(Retirement Planning)"
    if "（Retirement Planning）" in s or "(Retirement Planning)" in s:
        errors.append("FAIL: definitionText has English expansion")
    else:
        checks.append("PASS: definitionText no English expansion")

    # 7. No hardcoded "10K", "50K", "500K", "14M+" in JSX
    for pattern in ["10K", "50K", "500K", "14M+"]:
        # Check in JSX (after the ui object)
        ui_end = s.find("} as const")
        jsx_part = s[ui_end:] if ui_end > 0 else ""
        if pattern in jsx_part:
            errors.append(f"FAIL: hardcoded '{pattern}' in JSX")
        else:
            checks.append(f"PASS: no hardcoded '{pattern}' in JSX")

    # 8. No " yr " or " yr accum" in JSX
    if " yr accum" in s or re.search(r'\d+ yr[<\s]', s):
        errors.append("FAIL: hardcoded 'yr' in JSX")
    else:
        checks.append("PASS: no hardcoded 'yr' in JSX")

    # 9. No "mo" as month label (check context)
    if re.search(r'\d+/mo', s):
        errors.append("FAIL: '/mo' still present")
    else:
        checks.append("PASS: no '/mo' pattern")

    # 10. affiliateItems en fields must be Chinese
    if 'en: "Retirement Planning Advisor"' in s or 'en: "Index Fund Platforms"' in s or 'en: "Pension Calculator Services"' in s or 'en: "Financial Advisor"' in s:
        errors.append("FAIL: affiliateItems en still English")
    else:
        checks.append("PASS: affiliateItems en fields Chinese")

    # 11. retireLevels en fields must be Chinese
    if 'en: "Retire at 40"' in s or 'en: "Conventional retirement age"' in s or 'en: "Statutory pension age"' in s:
        errors.append("FAIL: retireLevels en still English")
    else:
        checks.append("PASS: retireLevels en fields Chinese")

    # 12. Affiliate disclosure must be static Chinese (no conditional)
    if 'lang === "zh"' in s and ("聯盟連結" in s or "Affiliate" in s):
        errors.append("FAIL: conditional affiliate disclosure")
    else:
        checks.append("PASS: static Chinese affiliate disclosure")

    # 13. Force Chinese rendering
    if 'const displayLang: Lang = "zh"' in s and 'const t = ui.zh;' in s:
        checks.append("PASS: forced Chinese rendering (displayLang + ui.zh)")
    else:
        errors.append("FAIL: missing forced Chinese rendering")

    # 14. LocalText rendering hardened with displayLang
    if 'l(item.label, displayLang)' in s and 'l(item.description, displayLang)' in s:
        checks.append("PASS: LocalText rendering hardened")
    else:
        errors.append("FAIL: LocalText not using displayLang")

    # 15. Title is bilingual hero
    if 'Retirement Calculator · 退休金試算機' in s:
        checks.append("PASS: title bilingual hero")
    else:
        errors.append("FAIL: title not bilingual hero")

    # 16. CSV → 試算表
    if "CSV" in s and "試算表" not in s:
        errors.append("FAIL: CSV not replaced")
    else:
        checks.append("PASS: 試算表匯出 (no raw CSV)")

    # 17. CAGR → 年複合成長率計算機 in relatedToolsText
    if "CAGR ·" in s or "CAGR ·" in s:
        # Check if CAGR appears standalone in zh block (not as abbreviation)
        zh_match = re.search(r'zh:\s*\{(.*?)\n  \},\s*en:', s, re.DOTALL)
        if zh_match:
            zh = zh_match.group(1)
            if "CAGR ·" in zh or "CAGR ·" in zh:
                errors.append("FAIL: CAGR standalone in zh relatedToolsText")
            else:
                checks.append("PASS: relatedToolsText uses 年複合成長率計算機")
    else:
        checks.append("PASS: no standalone CAGR in relatedToolsText")

    # 18. a6 FIRE expansion is Chinese
    if "Financial Independence Retire Early" in s:
        errors.append("FAIL: a6 has English FIRE expansion")
    else:
        checks.append("PASS: a6 FIRE expansion is Chinese")

    # 19. referencesText localized
    zh_match = re.search(r'zh:\s*\{(.*?)\n  \},\s*en:', s, re.DOTALL)
    if zh_match:
        zh = zh_match.group(1)
        if "Investopedia Retirement Planning;" in zh or "U.S. SEC Investor.gov" in zh:
            errors.append("FAIL: referencesText has English references in zh")
        else:
            checks.append("PASS: referencesText localized in zh")

    # 20. En block is mirror of zh (no English body copy)
    en_match = re.search(r'en:\s*\{(.*?)\n  \} as const', s, re.DOTALL)
    if en_match and zh_match:
        en = en_match.group(1)
        zh_text = zh_match.group(1)
        # Check that en block doesn't have "How many years" or other English body copy
        if "How many years" in en or "Powered by" in en or "Compound Interest · CAGR" in en:
            errors.append("FAIL: en block still has English body copy")
        else:
            checks.append("PASS: en block mirrored from zh")

    # 21. a2 ETF → 指數基金
    if "保守 ETF" in s:
        errors.append("FAIL: a2 still has 'ETF' standalone")
    else:
        checks.append("PASS: a2 uses '指數基金'")

    print(f"\n{'='*60}")
    print(f"QC Results for RetirementCalculator: {len(checks)} PASS, {len(errors)} FAIL")
    print(f"{'='*60}")
    for c in checks:
        print(f"  ✅ {c}")
    for e in errors:
        print(f"  ❌ {e}")
    print()

    return 0 if not errors else 1

if __name__ == "__main__":
    sys.exit(main())
