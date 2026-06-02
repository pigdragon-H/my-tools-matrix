#!/usr/bin/env python3
"""Repair CompoundInterestCalculator Chinese layout — remove all English except hero title."""

import re, os

TARGET = os.path.join(os.path.dirname(__file__), "..", "client", "src", "tools", "finance", "CompoundInterestCalculator", "index.tsx")

def read_file(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

def write_file(path, content):
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

def extract_zh_block(content):
    m = re.search(r'(\s+zh:\s*\{)', content)
    if not m:
        raise ValueError("Cannot find zh: block")
    start = m.start()
    depth = 0
    i = m.end() - 1
    for j in range(i, len(content)):
        if content[j] == '{': depth += 1
        elif content[j] == '}':
            depth -= 1
            if depth == 0:
                return content[start:j+1], start, j+1
    raise ValueError("Unmatched braces")

def extract_en_block(content):
    m = re.search(r'(\s+en:\s*\{)', content)
    if not m:
        raise ValueError("Cannot find en: block")
    start = m.start()
    depth = 0
    i = m.end() - 1
    for j in range(i, len(content)):
        if content[j] == '{': depth += 1
        elif content[j] == '}':
            depth -= 1
            if depth == 0:
                return content[start:j+1], start, j+1
    raise ValueError("Unmatched braces")

def mirror_zh_to_en(zh_block):
    return re.sub(r'^(\s+)zh:', r'\1en:', zh_block, count=1)

def main():
    s = read_file(TARGET)
    original = s

    print("=== Step 1: zh-block string replacements ===")

    # 1. Badge: "Gold Tool" → "黃金工具"
    s = s.replace('badge: "財務 · 投資 · Gold Tool"', 'badge: "財務 · 投資 · 黃金工具"')

    # 2. switchToEnglish → Chinese
    s = s.replace('switchToEnglish: "Switch to English"', 'switchToEnglish: "切換到英文"')

    # 3. intro: "SEC 與 Investopedia 公認的" → "國際公認的"
    s = s.replace('採用 SEC 與 Investopedia 公認的', '採用國際公認的')

    # 4. definitionText: remove "(Compound Interest)"
    s = s.replace('複利（Compound Interest）是指', '複利是指')

    # 5. faq: "FAQ" → "常見問答"
    s = s.replace('faq: "FAQ",\n    commonQuestions', 'faq: "常見問答",\n    commonQuestions')

    # 6. premiumTitle: "PRO 投資進階規劃包" → "專業版投資進階規劃包"
    s = s.replace('premiumTitle: "PRO 投資進階規劃包"', 'premiumTitle: "專業版投資進階規劃包"')

    # 7. premiumText: "CSV 匯出" → "試算表匯出"
    s = s.replace('年度資產表 CSV 匯出。', '年度資產表試算表匯出。')

    # 8. relatedToolsText: localize tool names
    s = s.replace(
        'relatedToolsText: "貸款試算 · CAGR · 退休金 · 月薪存款 · 4% 提領法則 · 通膨調整（V2）"',
        'relatedToolsText: "貸款試算機 · 年複合成長率計算機 · 退休金試算機 · 月薪存款機 · 4% 提領法則 · 通膨調整計算機"'
    )

    # 9. referencesText: localize
    ref_idx = s.find('referencesText:')
    if ref_idx > 0:
        ref_line_start = s.rfind('\n', 0, ref_idx) + 1
        ref_line_end = s.find('\n', ref_idx)
        new_ref = '    referencesText: "Investopedia 複利指南；SEC 投資者複利計算器；Bogleheads 貨幣時間價值；Bengen 1994 4% 提領法則；Mishkin 2022 貨幣銀行與金融市場。",'
        s = s[:ref_line_start] + new_ref + s[ref_line_end:]

    # 10. a2: "ETF 指數投資" → "指數基金投資"
    s = s.replace('若用 ETF 指數投資保守估', '若用指數基金投資保守估')

    print("=== Step 2: periodLevels en fields → Chinese ===")

    # 11. periodLevels en fields
    s = s.replace('en: "5 yr"', 'en: "5 年"')
    s = s.replace('en: "10 yr"', 'en: "10 年"')
    s = s.replace('en: "15 yr"', 'en: "15 年"')
    s = s.replace('en: "20 yr"', 'en: "20 年"')
    s = s.replace('en: "25 yr"', 'en: "25 年"')
    s = s.replace('en: "30 yr"', 'en: "30 年"')
    s = s.replace('en: "Short-term savings start"', 'en: "短期儲蓄起步"')
    s = s.replace('en: "Compounding starts to bite"', 'en: "複利效應初現"')
    s = s.replace('en: "Compounding accelerates"', 'en: "複利明顯加速"')
    s = s.replace('en: "Common retirement planning horizon"', 'en: "退休準備主流年期"')
    s = s.replace('en: "Interest exceeds principal"', 'en: "收益開始翻倍"')
    s = s.replace('en: "The compounding magic kicks in"', 'en: "複利的魔法"')

    print("=== Step 3: affiliateItems en fields → Chinese ===")

    # 12. affiliateItems en fields
    s = s.replace('en: "ETF / Index Fund Platforms"', 'en: "ETF / 指數基金平台"')
    # Other affiliate items
    for old, new in [
        ('en: "Robo-Advisor Platforms"', 'en: "機器人理財平台"'),
        ('en: "High-Yield Savings Accounts"', 'en: "高利活存帳戶"'),
        ('en: "Financial Advisor"', 'en: "理財顧問諮詢"'),
    ]:
        s = s.replace(old, new)

    print("=== Step 4: Hardcoded JSX English ===")

    # 13. "100K" → "10 萬"
    s = s.replace('<div className="font-black">100K</div>', '<div className="font-black">10 萬</div>')

    # 14. "3M+" badge → "300 萬+"
    s = s.replace('<span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">3M+</span>',
                  '<span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">300 萬+</span>')

    # 15. Example button text: "100K · 5K/mo · 7% · 20 yr" → "10 萬 · 5K/月 · 7% · 20 年"
    s = s.replace('100K · 5K/mo · 7% · 20 yr', '10 萬 · 5K/月 · 7% · 20 年')
    s = s.replace('50K · 3K/mo · 3% · 5 yr', '5 萬 · 3K/月 · 3% · 5 年')

    # 16. Hardcoded " mo" → " 月" in JSX (in the result card and matrix)
    s = s.replace('{activePeriod.key * 12} mo</div>', '{activePeriod.key * 12} 月</div>')
    s = s.replace('{item.key * 12} mo</span>', '{item.key * 12} 月</span>')

    print("=== Step 5: Affiliate disclosure ===")

    # 17. Conditional affiliate → static Chinese
    s = s.replace(
        '{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}',
        '推薦連結揭露：部分連結可能帶來佣金收入。'
    )

    print("=== Step 6: Force Chinese rendering ===")

    # 18. Force Chinese layout
    s = s.replace(
        'const t = ui[lang];',
        'const displayLang: Lang = "zh";\n  const t = ui.zh;'
    )

    print("=== Step 7: LocalText rendering hardening ===")

    # 19. Harden periodLevels LocalText rendering
    s = s.replace('{l(item.label, lang)}', '{l(item.label, displayLang)}')
    s = s.replace('{l(item.description, lang)}', '{l(item.description, displayLang)}')

    # 20. Harden affiliateItems LocalText rendering
    # Need to be careful: only the specific one
    s = s.replace('{l(item.label, lang)}</a>)', '{l(item.label, displayLang)}</a>)')

    # 21. Harden activePeriod label rendering
    s = s.replace('{l(activePeriod.label, lang)}', '{l(activePeriod.label, displayLang)}')

    print("=== Step 8: Mirror zh → en ===")

    zh_block, zh_start, zh_end = extract_zh_block(s)
    en_block, en_start, en_end = extract_en_block(s)

    new_en = mirror_zh_to_en(zh_block)
    s = s[:en_start] + new_en + s[en_end:]

    print("=== Step 9: Title bilingual hero ===")

    # Add bilingual hero title
    title_idx = s.find('title: "', zh_start)
    if title_idx > 0:
        title_val_start = title_idx + len('title: "')
        title_val_end = s.find('"', title_val_start)
        new_title = "Compound Interest Calculator · 複利計算機"
        s = s[:title_val_start] + new_title + s[title_val_end:]

    # Also fix en block title
    en_start_new = s.find('en: {')
    if en_start_new > 0:
        title_in_en = s.find('title:', en_start_new)
        if title_in_en > 0:
            val_start = s.find('"', title_in_en) + 1
            val_end = s.find('"', val_start)
            s = s[:val_start] + "Compound Interest Calculator · 複利計算機" + s[val_end:]

    print("=== Done ===")

    if s != original:
        write_file(TARGET, s)
        print(f"File written: {TARGET}")
    else:
        print("No changes made!")

if __name__ == "__main__":
    main()
