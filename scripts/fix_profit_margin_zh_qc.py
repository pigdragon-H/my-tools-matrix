from pathlib import Path
p=Path('client/src/tools/finance/ProfitMarginCalculator/index.tsx')
text=p.read_text()
# Restore canonical 17-layer marker comment exactly for QC compatibility.
start='    {/* L1-'
end=' */}'
idx=text.find(start)
if idx!=-1:
    j=text.find(end, idx)
    if j!=-1:
        canonical='    {/* L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences */}'
        text=text[:idx]+canonical+text[j+len(end):]
# Replace remaining English formula inside visible knowledge card.
text=text.replace('毛利率 = (Revenue − COGS) ÷ Revenue. 淨利率 = (Revenue − COGS − Operating expenses) ÷ Revenue. 加價率 = Gross profit ÷ COGS.', '毛利率 =（營收 − 銷貨成本）÷ 營收。淨利率 =（營收 − 銷貨成本 − 營業費用）÷ 營收。加價率 = 毛利 ÷ 銷貨成本。')
# Keep FAQ heading Chinese in visible section.
text=text.replace('>FAQ</p><h2 className="mt-2 text-3xl font-black">常見問題</h2>', '>常見問題</p><h2 className="mt-2 text-3xl font-black">常見問題</h2>')
p.write_text(text)
print('fixed profit margin zh qc')

qc=Path('scripts/qc_profit_margin.py')
q=qc.read_text()
q=q.replace('check("L12_formula", "Gross margin = (Revenue − COGS) ÷ Revenue" in text and "Net margin = (Revenue − COGS − Operating expenses) ÷ Revenue" in text and "Markup = Gross profit ÷ COGS" in text)', 'check("L12_formula", "毛利率 =（營收 − 銷貨成本）÷ 營收" in text and "淨利率 =（營收 − 銷貨成本 − 營業費用）÷ 營收" in text and "加價率 = 毛利 ÷ 銷貨成本" in text)')
qc.write_text(q)
print('updated qc formula expectation')
