from pathlib import Path
import re

path = Path('client/src/tools/finance/ProfitMarginCalculator/index.tsx')
text = path.read_text()

# Remove unused Pomodoro-derived global bands block. Component has its own profit-margin bands.
text = re.sub(r"\nconst bands = \[\n.*?\n\] as const;\n", "\n", text, count=1, flags=re.S)

# Normalize FAQ key format to current QC/golden style.
text = text.replace('const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;',
                    'const faqKeys = [["q1", "a1"], ["q2", "a2"], ["q3", "a3"], ["q4", "a4"], ["q5", "a5"], ["q6", "a6"]] as const;')

# Replace the inherited Pomodoro UI dictionary with a focused Profit Margin FAQ dictionary.
new_ui = '''const ui = {
  zh: {
    q1: "毛利率和淨利率差在哪裡？", a1: "毛利率只扣除銷貨成本，淨利率還會扣除營業費用，因此更接近整體獲利能力。",
    q2: "Markup 和 margin 一樣嗎？", a2: "不一樣。Markup 是毛利除以成本，margin 是利潤除以收入；同一筆交易 markup 通常會高於 margin。",
    q3: "淨利率低一定不好嗎？", a3: "不一定。高成長或低毛利高周轉產業可能淨利率較低，仍要搭配現金流、規模與產業基準判斷。",
    q4: "該先提高價格還是降低成本？", a4: "可先用情境分析比較。若需求穩定，提高價格可能最快；若價格敏感，降低 COGS 或營業費用更安全。",
    q5: "損益兩平件數怎麼用？", a5: "損益兩平件數可估算至少要賣多少單位才覆蓋成本與費用，適合用於定價與銷售目標設定。",
    q6: "這能取代會計報表嗎？", a6: "不能。這只是教育估算工具；稅務、審計、財報與投資決策請諮詢合格會計或財務專業人士。",
  },
  en: {
    q1: "What is the difference between gross and net margin?", a1: "Gross margin subtracts cost of goods sold only. Net margin also subtracts operating expenses, so it is closer to overall profitability.",
    q2: "Are markup and margin the same?", a2: "No. Markup is gross profit divided by cost, while margin is profit divided by revenue. For the same sale, markup is usually higher than margin.",
    q3: "Is a low net margin always bad?", a3: "Not always. High-growth or high-volume industries may run lower margins. Compare against cash flow, scale, and industry benchmarks.",
    q4: "Should I raise price or reduce cost first?", a4: "Use scenario analysis. If demand is stable, price may move fastest; if customers are price-sensitive, reducing COGS or operating expenses may be safer.",
    q5: "How should I use break-even units?", a5: "Break-even units estimate how many units must be sold to cover costs and expenses. It is useful for pricing and sales target planning.",
    q6: "Can this replace accounting statements?", a6: "No. It is an educational estimator only. For tax, audit, reporting, or investment decisions, consult a qualified accounting or finance professional.",
  },
} as const;
'''
text = re.sub(r"const ui = \{\n.*?\n\} as const;\n", new_ui, text, count=1, flags=re.S)

text = text.replace('* Affiliate links. We may earn a commission.', '* Affiliate disclosure: affiliate links. We may earn a commission.')

path.write_text(text)
print('repair_profit_margin_qc: done')
