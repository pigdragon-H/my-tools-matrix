#!/usr/bin/env python3
"""QC validation for SavingsGoalCalculator Chinese layout remediation."""

TARGET = "client/src/tools/finance/SavingsGoalCalculator/index.tsx"

with open(TARGET, "r", encoding="utf-8") as f:
    s = f.read()

checks = {
    'force_zh': 'const displayLang: Lang = "zh";' in s and 'const t = ui.zh;' in s,
    'hero_allowed': 'title: "Savings Goal Calculator · 儲蓄目標反推計算機"' in s,
    'badge_zh': 'badge: "財務 · 目標 · 黃金工具"' in s,
    'intro_zh': 'intro: "本工具反向使用國際公認的' in s,
    'faq_zh': 'faq: "常見問答"' in s,
    'premium_zh': 'premiumTitle: "專業版目標儲蓄包"' in s,
    'references_zh': 'Investopedia 儲蓄目標指南' in s and '美國證券交易委員會投資者教育' in s,
    'related_tools_zh': '複利計算機 · 年複合成長率計算機 · 退休計算機' in s,
    'definition_zh': '儲蓄目標反推是把' in s and 'Savings Goal Solver' not in s,
    'no_cagr_en': 'CAGR 計算機' not in s and '年複合成長率計算機' in s,
    'no_etf_en_body': '保守指數基金投資組合' in s,
    'no_csv_en': '方案模擬與試算表匯出' in s,
    'period_en_mirrored': 'en: "5 年"' in s and 'en: "10 年"' in s and 'en: "短期目標 · 頭期款 / 留學"' in s,
    'affiliate_en_mirrored': 'en: "高利活存帳戶"' in s and 'en: "ETF / 指數基金平台"' in s and 'en: "理財顧問諮詢"' in s,
    'affiliate_disclosure_zh': '推薦連結揭露：部分連結可能帶來佣金收入。' in s,
    'hardcoded_zh': '300 萬' in s and '10 萬' in s and '20 年' in s and '5 年' in s,
    'no_ui_lang': 'const t = ui[lang];' not in s,
    'no_lang_body': '{l(item.label, lang)}' not in s and '{l(item.description, lang)}' not in s and '{l(activePeriod.label, lang)}' not in s,
    'no_forbidden_visible_english': all(x not in s for x in [
        'Gold Tool', 'FAQ"', 'PRO 目標', 'Affiliate links. We may earn a commission.',
        'High-yield Savings"', 'ETF / Index Fund Platforms"', 'Financial Advisor"',
        'Goal-Savings Apps"', 'Short-term · down payment', 'Mid-term · home upgrade',
        'Pre-retirement target"', 'Lifetime target · retirement"',
        '3M · 100K · 7% · 20 yr', '1M · 0 · 3% · 5 yr', '~5K/mo',
        'Savings Goal Solver',
    ]),
    'ui_en_mirrored': s.count('badge: "財務 · 目標 · 黃金工具"') >= 2,  # both zh and en blocks
}

all_pass = True
for name, result in checks.items():
    status = "GREEN" if result else "RED"
    if not result:
        all_pass = False
    print(f"  {status}: {name}")

if all_pass:
    print("\n✅ All QC checks passed")
else:
    print("\n❌ Some QC checks failed")
    exit(1)
