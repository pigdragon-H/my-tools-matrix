#!/usr/bin/env python3
"""Repair RetirementCalculator Chinese layout — remove all English except hero title.

Rules:
  - Only the hero primary tool name may be bilingual English/Chinese
  - All other visible Chinese-layout content must be Chinese
  - Mirror repaired ui.zh into ui.en (brace-depth parsing) so persisted/global
    English state cannot leak English body copy
  - Force Chinese rendering: const displayLang: Lang = "zh"; const t = ui.zh;
  - LocalText rendering hardened: l(item.label, displayLang), l(item.desc, displayLang)
"""

import re, sys, os

TARGET = os.path.join(os.path.dirname(__file__), "..", "client", "src", "tools", "finance", "RetirementCalculator", "index.tsx")

def read_file(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

def write_file(path, content):
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

def extract_zh_block(content):
    """Extract the ui.zh block using brace-depth parsing."""
    # Find start: "  zh: {"
    m = re.search(r'(\s+zh:\s*\{)', content)
    if not m:
        raise ValueError("Cannot find zh: block")
    start = m.start()
    # Walk braces to find matching }
    depth = 0
    i = m.end() - 1  # at the opening {
    for j in range(i, len(content)):
        if content[j] == '{':
            depth += 1
        elif content[j] == '}':
            depth -= 1
            if depth == 0:
                return content[start:j+1], start, j+1
    raise ValueError("Unmatched braces in zh block")

def extract_en_block(content):
    """Extract the ui.en block using brace-depth parsing."""
    m = re.search(r'(\s+en:\s*\{)', content)
    if not m:
        raise ValueError("Cannot find en: block")
    start = m.start()
    depth = 0
    i = m.end() - 1
    for j in range(i, len(content)):
        if content[j] == '{':
            depth += 1
        elif content[j] == '}':
            depth -= 1
            if depth == 0:
                return content[start:j+1], start, j+1
    raise ValueError("Unmatched braces in en block")

def mirror_zh_to_en(zh_block):
    """Replace the en block with a copy of the zh block, changing 'zh:' to 'en:'."""
    # Take the zh block content, replace the opening "zh:" with "en:"
    en_block = re.sub(r'^(\s+)zh:', r'\1en:', zh_block, count=1)
    return en_block

def apply_replacements(content, replacements):
    """Apply a list of (old, new) replacements. Returns modified content."""
    for old, new in replacements:
        if old not in content:
            print(f"  WARNING: replacement target not found: {old[:80]}...")
        else:
            content = content.replace(old, new, 1)
    return content

def main():
    s = read_file(TARGET)
    original = s

    print("=== Step 1: zh-block string replacements ===")

    # 1. Badge: "Gold Tool" → "黃金工具"
    s = s.replace(
        'badge: "財務 · 退休 · Gold Tool"',
        'badge: "財務 · 退休 · 黃金工具"'
    )

    # 2. switchToEnglish: "Switch to English" → "切換到英文"
    s = s.replace(
        'switchToEnglish: "Switch to English"',
        'switchToEnglish: "切換到英文"'
    )

    # 3. intro: remove "Investopedia 與 SEC 公認的" → "國際公認的"
    s = s.replace(
        '採用 Investopedia 與 SEC 公認的',
        '採用國際公認的'
    )

    # 4. examplePerson: "50K現存 · 月10K" → "5 萬現存 · 月 1 萬"
    s = s.replace(
        'examplePerson: "30→65→85 · 50K現存 · 月10K · 6%"',
        'examplePerson: "30→65→85 · 5 萬現存 · 月 1 萬 · 6%"'
    )

    # 5. definitionText: remove "(Retirement Planning)"
    s = s.replace(
        '退休金規劃（Retirement Planning）是指在',
        '退休金規劃是指在'
    )

    # 6. faq: "FAQ" → "常見問答"
    s = s.replace(
        'faq: "FAQ",\n    commonQuestions',
        'faq: "常見問答",\n    commonQuestions'
    )

    # 7. premiumTitle: "PRO 退休進階規劃包" → "專業版退休進階規劃包"
    s = s.replace(
        'premiumTitle: "PRO 退休進階規劃包"',
        'premiumTitle: "專業版退休進階規劃包"'
    )

    # 8. premiumText: "CSV 匯出" → "試算表匯出"
    s = s.replace(
        '年度表 CSV 匯出。',
        '年度表試算表匯出。'
    )

    # 9. relatedToolsText: localize tool names
    # Current: "複利計算 · CAGR · 貸款試算 · 月薪存款 · 4% 提領法則 · 通膨調整（V2）"
    s = s.replace(
        'relatedToolsText: "複利計算 · CAGR · 貸款試算 · 月薪存款 · 4% 提領法則 · 通膨調整（V2）"',
        'relatedToolsText: "複利計算機 · 年複合成長率計算機 · 貸款試算機 · 月薪存款機 · 4% 提領法則 · 通膨調整計算機"'
    )

    # 10. referencesText: localize to Chinese
    # Current has full English references
    # Extract the exact referencesText from file to avoid Unicode issues
    ref_idx = s.find('referencesText:')
    if ref_idx > 0:
        # Find the string value after referencesText:
        ref_line_start = s.rfind('\n', 0, ref_idx) + 1
        ref_line_end = s.find('\n', ref_idx)
        ref_line = s[ref_line_start:ref_line_end]
        new_ref = '    referencesText: "Investopedia 退休規劃指南；SEC 投資者複利計算器；Bengen 1994 四％提領法則；Bogleheads 退休規劃；Mishkin 2022 貨幣銀行與金融市場。"'
        s = s[:ref_line_start] + new_ref + s[ref_line_end:]

    # 11. a1: "月儲 10K" → "月儲 1 萬"
    s = s.replace(
        '假設月儲 10K、年化 6%，30 歲到 65 歲累積約 1,465 萬元；40 歲才開始則只有約 650 萬元，差距超過 800 萬元。複利的最大槓桿就是「時間」，越早開始越輕鬆。',
        '假設月儲 1 萬、年化 6%，30 歲到 65 歲累積約 1,465 萬元；40 歲才開始則只有約 650 萬元，差距超過 800 萬元。複利的最大槓桿就是「時間」，越早開始越輕鬆。'
    )

    # 12. a2: "ETF 投資組合" → "指數基金投資組合"
    s = s.replace(
        '保守 ETF 投資組合',
        '保守指數基金投資組合'
    )

    # 13. a6: remove "(Financial Independence Retire Early)"
    s = s.replace(
        'FIRE（Financial Independence Retire Early）需要',
        'FIRE（財務自由提早退休）需要'
    )

    print("=== Step 2: Hardcoded JSX English replacements ===")

    # 14. Hardcoded "10K" in quick action card → "1 萬"
    s = s.replace('<div className="font-black">10K</div>', '<div className="font-black">1 萬</div>')

    # 15. Hardcoded "14M+" badge → "1,465 萬+"
    s = s.replace('<span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">14M+</span>',
                  '<span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">1,465 萬+</span>')

    # 16. Hardcoded example text in buttons: "50K + 10K/mo" → "5 萬 + 1 萬/月"
    s = s.replace('30→65→85 · 50K + 10K/mo · 6%', '30→65→85 · 5 萬 + 1 萬/月 · 6%')
    s = s.replace('30→40→85 · 500K + 50K/mo · 7%', '30→40→85 · 50 萬 + 5 萬/月 · 7%')

    # 17. Hardcoded "yr accum" → "年累積"
    s = s.replace('{calculation?.accumYears ?? 0} yr accum', '{calculation?.accumYears ?? 0} 年累積')

    # 18. Hardcoded "yr" in matrix cards → "年"
    s = s.replace('{item.accumYears} yr</span>', '{item.accumYears} 年</span>')

    print("=== Step 3: Affiliate disclosure replacement ===")

    # 19. Affiliate disclosure: conditional → static Chinese
    s = s.replace(
        '{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}',
        '推薦連結揭露：部分連結可能帶來佣金收入。'
    )

    print("=== Step 4: Force Chinese rendering ===")

    # 20. Force Chinese layout: const t = ui[lang] → const displayLang: Lang = "zh"; const t = ui.zh;
    s = s.replace(
        'const t = ui[lang];',
        'const displayLang: Lang = "zh";\n  const t = ui.zh;'
    )

    print("=== Step 5: LocalText rendering hardening ===")

    # 21. Harden retireLevels LocalText rendering: l(item.label, lang) → l(item.label, displayLang)
    # retireLevels uses .label and .description
    s = s.replace('{l(item.label, lang)}', '{l(item.label, displayLang)}')
    s = s.replace('{l(item.description, lang)}', '{l(item.description, displayLang)}')

    # 22. Harden affiliateItems LocalText rendering
    s = s.replace('{l(item.label, lang)}</a>)', '{l(item.label, displayLang)}</a>)')

    # Also the activeRetire label rendering
    s = s.replace('{l(activeRetire.label, lang)}', '{l(activeRetire.label, displayLang)}')

    print("=== Step 6: Mirror zh → en ===")

    zh_block, zh_start, zh_end = extract_zh_block(s)
    en_block, en_start, en_end = extract_en_block(s)

    new_en = mirror_zh_to_en(zh_block)

    # Replace en block with mirrored zh
    s = s[:en_start] + new_en + s[en_end:]

    print("=== Step 7: Title bilingual hero ===")

    # The title currently is: "退休金試算機 · 看清楚你 65 歲時能存到多少"
    # This is already fully Chinese — add bilingual English hero prefix
    title_idx = s.find('title: "', zh_start) if zh_start > 0 else s.find('title: "')
    if title_idx > 0:
        title_val_start = title_idx + len('title: "')
        title_val_end = s.find('"', title_val_start)
        current_title = s[title_val_start:title_val_end]
        new_title = "Retirement Calculator · 退休金試算機"
        s = s[:title_val_start] + new_title + s[title_val_end:]

    print("=== Done ===")

    if s != original:
        write_file(TARGET, s)
        print(f"File written: {TARGET}")
        # Count changes
        diff_lines = sum(1 for a, b in zip(original.splitlines(), s.splitlines()) if a != b)
        print(f"Lines changed: {diff_lines}")
    else:
        print("No changes made!")

if __name__ == "__main__":
    main()
