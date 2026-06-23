from pathlib import Path
import re
p=Path('client/src/tools/finance/RoasCalculator/index.tsx')
text=p.read_text()
# Force Chinese render and fallback labels.
text=text.replace('  const { lang, setLang } = useLanguage();', '  const { lang, setLang } = useLanguage();\n  const displayLang: Lang = "zh";')
text=text.replace('  const t = ui[lang];', '  const t = ui.zh;')
text=text.replace('{l(item.label,lang)}', '{l(item.label,displayLang)}')
text=text.replace('{l(item.desc,lang)}', '{l(item.desc,displayLang)}')
# Replace English fallback labels with Chinese as protective fallback.
text=text.replace('en: "Profit Margin Calculator"', 'en: "利潤率計算機"')
text=text.replace('en: "Budget Ratio Calculator"', 'en: "預算比例計算機"')
text=text.replace('en: "Meeting Cost Calculator"', 'en: "會議成本計算機"')
text=text.replace('en: "Net Worth Calculator"', 'en: "淨資產計算機"')
# Replace UI English block with zh block.
m=re.search(r'  zh: \{\n(.*?)\n  \},\n  en: \{\n.*?\n  \},', text, re.S)
if m:
    zh=m.group(1)
    text=re.sub(r'  zh: \{\n.*?\n  \},\n  en: \{\n.*?\n  \},', f'  zh: {{\n{zh}\n  }},\n  en: {{\n{zh}\n  }},', text, count=1, flags=re.S)
repls={
'FINANCE · ROAS · GOLD TOOL':'財務 · 廣告投報率 · 黃金工具',
'Calculate ROAS, ROI, CPA, AOV, and break-even ROAS':'計算廣告投報率、投資回報率、每單取得成本、平均訂單金額與損益兩平投報率',
'Estimate advertising efficiency from ad spend, attributed revenue, cost of goods sold, and order volume. This is educational planning, not financial or marketing advice.':'根據廣告花費、廣告歸因收入、銷貨成本與訂單數估算投放效率。本工具僅供教育與規劃參考，不取代正式財務或行銷建議。',
'Quick example':'快速範例','Standard example':'標準範例','Thin-margin example':'低利潤範例',
'Examples → Calculator':'範例 → 計算機','Calculator':'計算機',
'Ad spend ($)':'廣告花費（$）','Ad-attributed revenue ($)':'廣告歸因收入（$）','COGS ($)':'銷貨成本（$）','Orders':'訂單數',
'ROAS Result':'廣告投報率結果','ROI after ads':'扣除廣告後投資回報率','Profit after ads':'扣除廣告後利潤','CPA':'每單取得成本',
'Result Intelligence':'結果解讀','Six-card ROAS efficiency matrix':'六格廣告投報率效率矩陣','L7 uses six fixed cards based on ROAS multiple. This is campaign planning guidance, not a guarantee of profit.':'L7 依廣告投報倍數使用固定六格判讀；這是投放規劃參考，不保證實際獲利。',
'Loss':'虧損','Weak':'偏弱','Watch':'觀察','Good':'良好','Strong':'強勢','Elite':'卓越',
'Revenue is below spend; inspect campaigns quickly.':'收入低於廣告花費，需立即檢查投放。','May be below break-even for many products.':'可能低於多數商品的損益兩平需求。','Check margin before scaling.':'擴大投放前請先檢查毛利率。','Often healthy, but profit still matters.':'常見健康區間，但仍需確認利潤。','Potential to scale with budget tests.':'具備擴量潛力，可測試預算提升。','Very efficient; validate attribution and supply.':'效率很高，需確認歸因與供給能力。',
'Emotion + Conversion Layer':'情緒與轉換層','Turn ad performance into a budget decision':'把廣告成效轉成預算決策','Compare current ROAS with break-even ROAS before increasing campaign budget.':'提高廣告預算前，請先比較目前投報率與損益兩平投報率。','Break-even ROAS:':'損益兩平投報率：','AOV:':'平均訂單金額：',
'Save / Share':'儲存 / 分享','Recalculate after creative, targeting, price, or product cost changes.':'素材、受眾、價格或商品成本變動後，請重新試算。','Next tools':'下一步工具',
'Use Profit Margin Calculator before scaling spend.':'擴大投放前先使用利潤率計算機確認獲利空間。','Use Budget Ratio Calculator for cash allocation.':'使用預算比例計算機安排現金配置。','Use Net Worth Calculator for owner-level planning.':'使用淨資產計算機進行經營者層級規劃。',
'Decision Path':'決策路徑','ROAS → Profit Margin → Budget Ratio → Net Worth':'廣告投報率 → 利潤率 → 預算比例 → 淨資產',
'Knowledge':'知識說明','What ROAS means':'廣告投報率代表什麼','Definition':'定義','ROAS shows advertising revenue generated per dollar of ad spend.':'廣告投報率顯示每 1 元廣告花費帶來多少廣告歸因收入。','Formula':'公式','ROAS = Ad-attributed revenue ÷ Ad spend. ROI after ads = (Revenue − COGS − Ad spend) ÷ Ad spend. CPA = Ad spend ÷ orders.':'廣告投報率 = 廣告歸因收入 ÷ 廣告花費。扣除廣告後投資回報率 =（收入 − 銷貨成本 − 廣告花費）÷ 廣告花費。每單取得成本 = 廣告花費 ÷ 訂單數。','Limitations':'限制','Attribution windows, refunds, discounts, fixed costs, and platform tracking can change true profitability.':'歸因期間、退款、折扣、固定成本與平台追蹤差異都會影響真實獲利。','Example':'範例','Revenue $12,000, ad spend $3,000, COGS $5,000: ROAS 4.00x, profit after ads $4,000, ROI 133.3%.':'收入 $12,000、廣告花費 $3,000、銷貨成本 $5,000：廣告投報率 4.00 倍，扣除廣告後利潤 $4,000，投資回報率 133.3%。',
'Common questions':'常見問題','Recommended Tools':'推薦工具','Next-step tools for ad and margin planning':'廣告與利潤規劃的下一步工具','* Affiliate disclosure: affiliate links. We may earn a commission.':'* 推薦連結揭露：部分連結可能帶來佣金收入。','PRO ROAS Pack':'專業版廣告投報率套件','Unlock channel comparisons, attribution notes, margin sensitivity, and budget scaling reports.':'解鎖渠道比較、歸因備註、利潤敏感度與預算擴量報告。','Trust · Related Tools · References':'信任聲明 · 相關工具 · 參考資料','Trust disclaimer':'信任聲明','Educational estimator only; consult qualified marketing, finance, or accounting professionals before major budget decisions.':'本工具僅供教育估算；重大預算決策前，請諮詢合格行銷、財務或會計專業人士。','Related tools':'相關工具','Profit Margin · Budget Ratio · Meeting Cost · Net Worth':'利潤率 · 預算比例 · 會議成本 · 淨資產','References':'參考資料','Google Ads ROAS guidance; Meta ads reporting guidance; Shopify marketing metrics; Harvard Business Review customer acquisition analysis.':'Google Ads 廣告投報率說明；Meta 廣告報表說明；Shopify 行銷指標；哈佛商業評論客戶取得分析。','L14 FAQ support section':'L14 常見問題補充區'
}
for a,b in repls.items(): text=text.replace(a,b)
p.write_text(text)
print('roas zh repair done')
