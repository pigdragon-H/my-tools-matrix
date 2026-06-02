from pathlib import Path
import sys

s = Path('client/src/tools/finance/InflationAdjuster/index.tsx').read_text()
checks = {
    'force_zh': 'const displayLang: Lang = "zh";' in s and 'const t = ui.zh;' in s,
    'hero_allowed': 'title: "Inflation Adjuster · 通膨調整計算機"' in s,
    'badge_zh': 'badge: "財務 · 通膨規劃 · 黃金工具"' in s,
    'intro_zh': 'intro: "本工具根據年通膨率與年數' in s,
    'formula_zh': '未來等值 = 現值 × (1 + r)^n' in s and '實質價值 = 名目金額 ÷ (1 + r)^n' in s,
    'decision_zh': 'decisionTitle: "年複合成長率 → 通膨 → 複利 → 儲蓄目標"' in s and '[{ label: "年複合成長率", note: t.bmrStep }, { label: "通膨", note: t.deficitStep }, { label: "複利", note: t.trendStep }, { label: "儲蓄", note: t.mealStep }]' in s,
    'knowledge_zh': 'knowledgeTitle: "通膨在財務規劃中的意義"' in s,
    'faq_zh': 'faq: "常見問答"' in s,
    'premium_zh': 'premiumTitle: "專業版通膨追蹤包"' in s and '["物價指數", "趨勢", "資產", "報告"]' in s,
    'references_zh': '美國勞工統計局消費者物價指數方法' in s and '美國聯準會經濟資料庫' in s,
    'bands_zh': 'label: { zh: "通貨緊縮", en: "通貨緊縮" }' in s and 'label: { zh: "停滯性通膨", en: "停滯性通膨" }' in s,
    'affiliate_zh': '推薦連結揭露：部分連結可能帶來佣金收入。' in s and '年複合成長率計算機 · 複利計算機 · 儲蓄目標計算機 · 退休計算機' in s,
    'hardcoded_results_zh': '$1000 · 10 年 · 未來等值' in s and '已調整' in s and '剩餘購買力' in s and '原始金額' in s and '名目金額' in s,
    'no_lang_body': 'const t = ui[lang];' not in s and '{l(item.label, lang)}' not in s and '{l(item.desc, lang)}' not in s,
    'no_forbidden_visible_english': all(x not in s for x in [
        'Gold Tool', 'Inflation Planner', 'Inflation Adjuster 根據', 'Future equivalent</p>', 'Real value</p>',
        '>adjusted<', '>remaining<', '>ORIGINAL<', '>nominal<', 'Affiliate links. We may earn a commission.',
        '["CPI", "Trends", "Assets", "Report"]', 'BLS Consumer Price Index methodology', 'IMF World Economic Outlook',
        'Federal Reserve Economic Data', 'What inflation means in the Finance universe', 'Decision Path",', 'Recommended Tools",'
    ]),
}
failed = False
for name, ok in checks.items():
    print(('GREEN' if ok else 'RED'), name)
    failed = failed or not ok
if failed:
    sys.exit(1)
