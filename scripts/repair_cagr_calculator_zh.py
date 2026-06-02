#!/usr/bin/env python3
"""Repair CagrCalculator/index.tsx for Chinese layout."""

import re

TARGET = "client/src/tools/finance/CagrCalculator/index.tsx"

with open(TARGET, "r", encoding="utf-8") as f:
    s = f.read()

# 1. Force Chinese rendering
s = s.replace(
    'const t = ui[lang];',
    'const displayLang: Lang = "zh";\n  const t = ui.zh;'
)

# 2. Replace {l(item.xxx, lang)} with displayLang
s = s.replace('{l(item.label, lang)}', '{l(item.label, displayLang)}')
s = s.replace('{l(item.description, lang)}', '{l(item.description, displayLang)}')
s = s.replace('{l(activePeriod.label, lang)}', '{l(activePeriod.label, displayLang)}')

# 3. Replace affiliate disclosure conditional
s = s.replace(
    '{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}',
    '推薦連結揭露：部分連結可能帶來佣金收入。'
)

# 4. Fix ui.zh English content
# Extract exact title from file first
idx = s.index('    title: "')
title_start = idx + len('    title: "')
for i in range(title_start, len(s)):
    if s[i] == '"':
        title_val = s[title_start:i]
        break
old_title = '    title: "' + title_val + '"'
new_title = '    title: "CAGR Calculator · 年複合成長率計算機"'
s = s.replace(old_title, new_title)
print(f"OK: title ({s.count(new_title)} occurrences)")

# badge
s = s.replace('badge: "財務 · 績效 · Gold Tool"', 'badge: "財務 · 績效 · 黃金工具"')

# intro: remove Investopedia/SEC
s = s.replace('本工具採用 Investopedia 與 SEC 公認的', '本工具採用國際公認的')

# definitionText: remove English expansion
s = s.replace('CAGR（Compound Annual Growth Rate）即「複合年化成長率」', 'CAGR 即「複合年化成長率」')

# faq
s = s.replace('faq: "FAQ"', 'faq: "常見問答"')

# premiumTitle
s = s.replace('premiumTitle: "PRO 績效分析包"', 'premiumTitle: "專業版績效分析包"')

# premiumText: CSV → 試算表
s = s.replace('CSV 匯出。', '試算表匯出。')

# relatedToolsText: replace English tool names
s = s.replace(
    'relatedToolsText: "複利計算 · 貸款試算 · 退休金 · 月薪存款 · 4% 提領法則 · 通膨調整（V2）"',
    'relatedToolsText: "複利計算機 · 貸款試算機 · 退休計算機 · 月薪存款機 · 4% 提領法則 · 通膨調整計算機"'
)

# referencesText: localize
s = s.replace(
    'referencesText: "Investopedia CAGR；U.S. SEC Investor.gov；Bogleheads Time-Weighted Return；CFA Institute 績效計算原則；Mishkin 2022 Money, Banking & Financial Markets。"',
    'referencesText: "Investopedia CAGR 指南；美國證券交易委員會投資者教育；Bogleheads 時間加權報酬；CFA 協會績效計算原則；Mishkin 2022 貨幣銀行與金融市場。"'
)

# Hardcoded English: "100K", "200K", "90K", "mo", "yr"
s = s.replace('>100K<', '>10 萬<')
s = s.replace('>200K<', '>20 萬<')
s = s.replace('>90K<', '>9 萬<')
s = s.replace('100K → 200K · 10 yr', '10 萬 → 20 萬 · 10 年')
s = s.replace('100K → 90K · 5 yr', '10 萬 → 9 萬 · 5 年')
s = s.replace('100K → 200K · 10 年', '10 萬 → 20 萬 · 10 年')  # in case partially fixed
s = s.replace('100K → 90K · 5 年', '10 萬 → 9 萬 · 5 年')

# "mo" → "月"
s = s.replace('item.key * 12} mo', 'item.key * 12} 月')
s = s.replace('12} mo', '12} 月')

# examplePerson: "100K → 200K · 10 年"
s = s.replace('examplePerson: "100K → 200K · 10 年"', 'examplePerson: "10 萬 → 20 萬 · 10 年"')

# 5. Replace periodLevels en fields with Chinese
period_en_to_zh = {
    'en: "5 yr"': 'en: "5 年"',
    'en: "10 yr"': 'en: "10 年"',
    'en: "15 yr"': 'en: "15 年"',
    'en: "20 yr"': 'en: "20 年"',
    'en: "25 yr"': 'en: "25 年"',
    'en: "30 yr"': 'en: "30 年"',
    'en: "Short-term volatility dominates"': 'en: "短期波動為主"',
    'en: "Short-term lookback"': 'en: "短期投資回望"',
    'en: "Mid-term horizon"': 'en: "中期投資週期"',
    'en: "Long-term main horizon"': 'en: "長期投資主流"',
    'en: "Pre-retirement lookback"': 'en: "退休前回望"',
    'en: "Lifetime investing horizon"': 'en: "終身投資週期"',
}
for old, new in period_en_to_zh.items():
    if old in s:
        s = s.replace(old, new)
        print(f"OK: {old[:50]}...")
    else:
        print(f"MISSING: {old[:50]}...")

# 6. Replace affiliateItems en fields
affiliate_en_to_zh = {
    'en: "ETF / Index Fund Platforms"': 'en: "ETF / 指數基金平台"',
    'en: "Performance Tracking Tools"': 'en: "投資績效追蹤工具"',
    'en: "Financial Advisor"': 'en: "理財顧問諮詢"',
    'en: "Investment Analysis Books"': 'en: "投資分析書籍"',
}
for old, new in affiliate_en_to_zh.items():
    if old in s:
        s = s.replace(old, new)
        print(f"OK: {old[:50]}...")
    else:
        print(f"MISSING: {old[:50]}...")

# 7. Mirror ui.zh into ui.en
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

with open(TARGET, "w", encoding="utf-8") as f:
    f.write(s)

print("repaired cagr calculator")
