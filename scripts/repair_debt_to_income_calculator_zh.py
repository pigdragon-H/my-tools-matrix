#!/usr/bin/env python3
"""Repair DebtToIncomeCalculator (#4) Chinese layout defects.
Only the hero primary tool name may be bilingual; all other visible
Chinese-layout content must be Chinese.
"""
import re, pathlib, sys

FILE = pathlib.Path("client/src/tools/finance/DebtToIncomeCalculator/index.tsx")
src = FILE.read_text(encoding="utf-8")
orig = src

# ─── 1. zh-block badge: "Gold Tool" → "黃金工具" ───
src = src.replace(
    'badge: "財務 · DTI · Gold Tool"',
    'badge: "財務 · 負債收入比 · 黃金工具"',
)

# ─── 2. zh-block switchToEnglish ───
src = src.replace(
    'switchToEnglish: "Switch to English"',
    'switchToEnglish: "切換到英文"',
)

# ─── 3. zh-block title: make bilingual hero ───
src = src.replace(
    'title: "負債收入比試算機 · 看清每月債務、DTI 與可負擔空間"',
    'title: "Debt-to-Income Calculator · 負債收入比試算機"',
)

# ─── 4. zh-block intro: remove CFPB credit ───
src = src.replace(
    '本工具依 CFPB 常用定義，以每月債務付款除以每月總收入，估算 DTI 負債收入比、每月債務總額與目標門檻下的借貸空間，並比較六段債務情境。',
    '本工具採用國際通用定義，以每月債務付款除以每月總收入，估算 DTI 負債收入比、每月債務總額與目標門檻下的借貸空間，並比較六段債務情境。',
)

# ─── 5. zh-block faq: "FAQ" → "常見問答" ───
# Find the zh block faq specifically
src = re.sub(
    r'((?:zh|en):\s*\{[^}]*?)faq: "FAQ"',
    r'\1faq: "常見問答"',
    src,
    count=1,  # only the zh block first occurrence
)

# ─── 6. zh-block premiumTitle: "PRO" → "專業版" ───
src = src.replace(
    'premiumTitle: "PRO 借貸能力規劃包"',
    'premiumTitle: "專業版借貸能力規劃包"',
)

# ─── 7. zh-block premiumText: "CSV" → "試算表" ───
src = src.replace(
    'CSV 匯出',
    '試算表匯出',
)

# ─── 8. zh-block relatedToolsText: localize English tool names ───
src = src.replace(
    'relatedToolsText: "Debt-to-Income · Loan Calculator · Mortgage Calculator · Savings Goal · Budget Planner"',
    'relatedToolsText: "負債收入比試算機 · 貸款試算機 · 房貸試算機 · 儲蓄目標機 · 預算規劃機"',
)

# ─── 9. zh-block referencesText: localize to Chinese ───
src = src.replace(
    'referencesText: "Consumer Financial Protection Bureau debt-to-income ratio guidance；CFPB Your Money, Your Goals debt-to-income calculator；Fannie Mae and mortgage underwriting education resources."',
    'referencesText: "消費者金融保護局負債收入比指引；CFPB 你的金錢你的目標負債收入比計算器；Fannie Mae 房貸核保教育資源。",',
)

# ─── 10. payLevels en fields: mirror to Chinese ───
pay_replacements = [
    ('"Debt -10k"', '"少一萬債務"'),
    ('"Debt -5k"', '"少五千債務"'),
    ('"Current debt"', '"目前債務"'),
    ('"Debt +5k"', '"多五千債務"'),
    ('"Debt +10k"', '"多一萬債務"'),
    ('"Debt +20k"', '"多兩萬債務"'),
]
for old, new in pay_replacements:
    src = src.replace(old, new)

# ─── 11. recommendations en fields: mirror to Chinese ───
rec_replacements = [
    ('"Mortgage readiness check"', '"房貸資格檢查"'),
    ('"Household budget planner"', '"家庭預算工具"'),
    ('"Credit report tracking"', '"信用報告追蹤"'),
    ('"Cash-flow advisor"', '"現金流顧問"'),
]
for old, new in rec_replacements:
    src = src.replace(old, new)

# ─── 12. Affiliate disclosure: static Chinese ───
src = src.replace(
    '{lang==="zh"?"* 聯盟連結，購買後我們可能獲得佣金。":"* Affiliate links. We may earn a commission."}',
    '推薦連結揭露：部分連結可能帶來佣金收入。',
)

# ─── 13. Force Chinese rendering: displayLang + t = ui.zh ───
src = src.replace(
    'const { lang, setLang } = useLanguage(); const t = ui[lang];',
    'const { lang, setLang } = useLanguage(); const displayLang: Lang = "zh"; const t = ui.zh;',
)

# ─── 14. LocalText hardened: replace l(..., lang) → l(..., displayLang) ───
src = src.replace('l(item.label,lang)', 'l(item.label,displayLang)')

# ─── 15. Mirror zh → en block ───
# Find the zh block and en block, then copy zh content into en
def extract_block(text, key):
    """Extract a top-level block by key from 'const ui = { zh: {...}, en: {...} }'"""
    pattern = rf'{key}:\s*\{{'
    m = re.search(pattern, text)
    if not m:
        return None, None
    start = m.start()
    # Walk brace depth to find matching close
    depth = 0
    i = m.end() - 1  # position of opening brace
    for j in range(i, len(text)):
        if text[j] == '{':
            depth += 1
        elif text[j] == '}':
            depth -= 1
            if depth == 0:
                return start, j + 1
    return None, None

# Extract zh and en blocks
zh_start, zh_end = extract_block(src, 'zh')
en_start, en_end = extract_block(src, 'en')

if zh_start and en_start:
    zh_block = src[zh_start:zh_end]
    # Replace the en block with a copy of the zh block but with 'en:' key
    en_block = src[en_start:en_end]
    new_en_block = 'en: ' + zh_block[zh_block.index('{'):]  # copy zh content with en: prefix
    src = src[:en_start] + new_en_block + src[en_end:]

# ─── 16. Bilingual hero title in en block (after mirror) ───
# The en block now has the zh content; fix the title to be English
# Find the en title line and replace
src = re.sub(
    r'(en:\s*\{[^}]*?title: )"Debt-to-Income Calculator · 負債收入比試算機"',
    r'\1"Debt-to-Income Calculator · See monthly debt burden and borrowing headroom"',
    src,
    count=1,
)

# ─── Write ───
if src != orig:
    FILE.write_text(src, encoding="utf-8")
    print(f"✅ Patched {FILE} ({len(src)} chars)")
    # Count changes
    additions = len(src) - len(orig)
    print(f"   Size delta: {additions:+d} chars")
else:
    print("⚠️ No changes made")
    sys.exit(1)
