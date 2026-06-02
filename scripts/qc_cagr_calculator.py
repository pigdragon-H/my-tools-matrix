#!/usr/bin/env python3
"""QC validation for CagrCalculator Chinese layout remediation."""

TARGET = "client/src/tools/finance/CagrCalculator/index.tsx"

with open(TARGET, "r", encoding="utf-8") as f:
    s = f.read()

checks = {
    'force_zh': 'const displayLang: Lang = "zh";' in s and 'const t = ui.zh;' in s,
    'hero_allowed': 'title: "CAGR Calculator · 年複合成長率計算機"' in s,
    'badge_zh': 'badge: "財務 · 績效 · 黃金工具"' in s,
    'intro_zh': 'intro: "本工具採用國際公認的' in s and 'Compound Annual Growth Rate' not in s.split('  en: {')[0],
    'faq_zh': 'faq: "常見問答"' in s,
    'premium_zh': 'premiumTitle: "專業版績效分析包"' in s,
    'references_zh': 'Investopedia CAGR 指南' in s and '美國證券交易委員會投資者教育' in s,
    'related_tools_zh': '複利計算機 · 貸款試算機 · 退休計算機' in s,
    'definition_zh': 'CAGR 即「複合年化成長率」' in s,
    'no_csv_en': '試算表匯出' in s,
    'period_en_mirrored': 'en: "5 年"' in s and 'en: "10 年"' in s and 'en: "短期波動為主"' in s,
    'affiliate_en_mirrored': 'en: "ETF / 指數基金平台"' in s and 'en: "投資績效追蹤工具"' in s,
    'affiliate_disclosure_zh': '推薦連結揭露：部分連結可能帶來佣金收入。' in s,
    'hardcoded_zh': '10 萬 → 20 萬' in s and '10 萬 → 9 萬' in s,
    'no_ui_lang': 'const t = ui[lang];' not in s,
    'no_lang_body': '{l(item.label, lang)}' not in s and '{l(item.description, lang)}' not in s and '{l(activePeriod.label, lang)}' not in s,
    'no_forbidden_visible_english': all(x not in s for x in [
        'Gold Tool', 'FAQ"', 'PRO 績效', 'Affiliate links. We may earn a commission.',
        'Short-term volatility dominates"', 'Mid-term horizon"', 'Long-term main horizon"',
        'Pre-retirement lookback"', 'Lifetime investing horizon"',
        'Performance Tracking Tools"', 'Investment Analysis Books"',
        '100K → 200K', '100K → 90K', 'Compound Annual Growth Rate, CAGR',
    ]),
    'ui_en_mirrored': s.count('badge: "財務 · 績效 · 黃金工具"') >= 2,
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
