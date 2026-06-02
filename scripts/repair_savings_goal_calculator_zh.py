#!/usr/bin/env python3
"""Repair SavingsGoalCalculator/index.tsx for Chinese layout.

Rules:
1. Only hero tool name may be bilingual (English/Chinese)
2. All other Chinese-layout content must be Chinese
3. Force displayLang="zh" and t = ui.zh
4. Mirror ui.zh into ui.en to prevent English leak
5. LocalText items rendered with displayLang
6. Replace all visible English in ui.zh with Chinese
7. Replace all English fallbacks in periodLevels/affiliateItems with Chinese
8. Replace all hardcoded English strings with Chinese
"""

import re

TARGET = "client/src/tools/finance/SavingsGoalCalculator/index.tsx"

with open(TARGET, "r", encoding="utf-8") as f:
    s = f.read()

# 1. Force Chinese rendering: displayLang + t = ui.zh
# Replace `const t = ui[lang];` with forced Chinese
s = s.replace(
    'const t = ui[lang];',
    'const displayLang: Lang = "zh";\n  const t = ui.zh;'
)

# 2. Replace all {l(item.label, lang)} and {l(item.description, lang)} with displayLang
s = s.replace('{l(item.label, lang)}', '{l(item.label, displayLang)}')
s = s.replace('{l(item.description, lang)}', '{l(item.description, displayLang)}')
s = s.replace('{l(item.label, lang)', '{l(item.label, displayLang)')
s = s.replace('{l(activePeriod.label, lang)}', '{l(activePeriod.label, displayLang)}')

# 3. Replace affiliate disclosure English conditional
s = s.replace(
    '{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}',
    '推薦連結揭露：部分連結可能帶來佣金收入。'
)

# 4. Replace ui.zh English content with Chinese
replacements = {
    # badge: remove "Gold Tool"
    'badge: "財務 · 目標 · Gold Tool"': 'badge: "財務 · 目標 · 黃金工具"',
    
    # title: make bilingual hero
    'title: "儲蓄目標反推 · 算出你每月該存多少才能達標"': 'title: "Savings Goal Calculator · 儲蓄目標反推計算機"',
    
    # intro: remove Investopedia/SEC English names
    'intro: "本工具反向使用 Investopedia 與 SEC 公認的「月複利 + 定期投入」公式，輸入你的目標金額、目前已有、預期年化報酬率與年期，即可反推「每月需存多少」才能達標，並列出 5 / 10 / 15 / 20 / 25 / 30 年六段年期對照，幫你決定最適合的儲蓄節奏。"': 
        'intro: "本工具反向使用國際公認的「月複利 + 定期投入」公式，輸入你的目標金額、目前已有、預期年化報酬率與年期，即可反推「每月需存多少」才能達標，並列出 5 / 10 / 15 / 20 / 25 / 30 年六段年期對照，幫你決定最適合的儲蓄節奏。"',
    
    # definitionText: remove "Savings Goal Solver" and English variable names in parentheses
    'definitionText: "儲蓄目標反推（Savings Goal Solver）是把「複利 + 定期投入」公式反向求解：已知未來目標金額（FV）、現有資產（P）、年化報酬率（r）與年期（t），反推每月需要存入的金額（PMT）。是規劃購房頭期、子女教育金、退休金的核心工具。"':
        'definitionText: "儲蓄目標反推是把「複利 + 定期投入」公式反向求解：已知未來目標金額、現有資產、年化報酬率與年期，反推每月需要存入的金額。是規劃購房頭期、子女教育金、退休金的核心工具。"',
    
    # faq: "FAQ" → "常見問答"
    'faq: "FAQ"': 'faq: "常見問答"',
    
    # premiumTitle: "PRO 目標儲蓄包" → "專業版目標儲蓄包"
    'premiumTitle: "PRO 目標儲蓄包"': 'premiumTitle: "專業版目標儲蓄包"',
    
    # relatedToolsText: replace English names
    'relatedToolsText: "複利計算 · CAGR · 退休金 · 貸款試算 · 月薪存款 · 通膨調整（V2）"':
        'relatedToolsText: "複利計算機 · 年複合成長率計算機 · 退休計算機 · 貸款試算機 · 月薪存款機 · 通膨調整計算機"',
    
    # referencesText: replace English with Chinese
    'referencesText: "Investopedia Savings Goal；U.S. SEC Investor.gov；Bogleheads Time Value of Money；Khan Academy Personal Finance；Mishkin 2022 Money, Banking & Financial Markets。"':
        'referencesText: "Investopedia 儲蓄目標指南；美國證券交易委員會投資者教育；Bogleheads 貨幣時間價值；可汗學院個人理財；Mishkin 2022 貨幣銀行與金融市場。"',
    
    # a2: replace ETF English
    'a2: "保守 ETF 投資組合可估 5-7%，全球股市長期約 7-10%（含通膨），定存 1-2%。建議用較保守值（5-6%）試算避免過度樂觀，並另外做 0% 試算當作最保守情境。"':
        'a2: "保守指數基金投資組合可估 5-7%，全球股市長期約 7-10%（含通膨），定存 1-2%。建議用較保守值（5-6%）試算避免過度樂觀，並另外做 0% 試算當作最保守情境。"',
    
    # a6: replace CAGR English
    'a6: "本工具固定反推「月存」，不反推報酬率。若想求達標報酬率，請改用 CAGR 計算機（已知 PV 與 FV、年期，求年化報酬）。三個參數中最多反推一個，剩餘兩個必須給定。"':
        'a6: "本工具固定反推「月存」，不反推報酬率。若想求達標報酬率，請改用年複合成長率計算機（已知現值與終值、年期，求年化報酬）。三個參數中最多反推一個，剩餘兩個必須給定。"',
    
    # Hardcoded example text: "3M · 100K · 7% · 20 yr" → Chinese
    '3M · 100K · 7% · 20 yr': '300 萬 · 10 萬 · 7% · 20 年',
    '1M · 0 · 3% · 5 yr': '100 萬 · 0 · 3% · 5 年',
    '~5K/mo': '約 5K/月',
    
    # "mo" → "月" in period matrix
    'item.key * 12} mo': 'item.key * 12} 月',
    '12} mo': '12} 月',
}

for old, new in replacements.items():
    if old in s:
        s = s.replace(old, new)
        print(f"OK: {old[:60]}...")
    else:
        print(f"MISSING: {old[:60]}...")

# 5. Replace periodLevels en fields with Chinese (mirror zh → en)
period_en_to_zh = {
    'en: "5 yr"': 'en: "5 年"',
    'en: "10 yr"': 'en: "10 年"',
    'en: "15 yr"': 'en: "15 年"',
    'en: "20 yr"': 'en: "20 年"',
    'en: "25 yr"': 'en: "25 年"',
    'en: "30 yr"': 'en: "30 年"',
    'en: "Short-term · down payment / tuition"': 'en: "短期目標 · 頭期款 / 留學"',
    'en: "Mid-term · home upgrade / startup"': 'en: "中期目標 · 換屋 / 創業"',
    'en: "Long-term · kids\' education"': 'en: "中長期 · 子女教育金"',
    'en: "Long-term · second nest egg"': 'en: "長期 · 第二桶金"',
    'en: "Pre-retirement target"': 'en: "退休前目標"',
    'en: "Lifetime target · retirement"': 'en: "終身目標 · 退休金"',
}
for old, new in period_en_to_zh.items():
    if old in s:
        s = s.replace(old, new)
        print(f"OK: {old[:60]}...")
    else:
        print(f"MISSING: {old[:60]}...")

# 6. Replace affiliateItems en fields with Chinese
affiliate_en_to_zh = {
    'en: "High-yield Savings"': 'en: "高利活存帳戶"',
    'en: "ETF / Index Fund Platforms"': 'en: "ETF / 指數基金平台"',
    'en: "Financial Advisor"': 'en: "理財顧問諮詢"',
    'en: "Goal-Savings Apps"': 'en: "目標儲蓄 App"',
}
for old, new in affiliate_en_to_zh.items():
    if old in s:
        s = s.replace(old, new)
        print(f"OK: {old[:60]}...")
    else:
        print(f"MISSING: {old[:60]}...")

# 7. Mirror ui.zh into ui.en
# Find the zh and en blocks and replace en with zh content
zh_start = s.index('  zh: {')
en_start = s.index('  en: {', zh_start)
depth = 0
en_end = None
for i in range(en_start, len(s)):
    ch = s[i]
    if ch == '{':
        depth += 1
    elif ch == '}':
        depth -= 1
        if depth == 0:
            en_end = i + 1
            break
if en_end is None:
    raise SystemExit('Could not find en block end')

zh_block = s[zh_start:en_start]
en_block = zh_block.replace('  zh: {', '  en: {', 1).rstrip().rstrip(',')
s = s[:en_start] + en_block + s[en_end:]
print("OK: mirrored ui.zh → ui.en")

# Write result
with open(TARGET, "w", encoding="utf-8") as f:
    f.write(s)

print("repaired savings goal calculator")
