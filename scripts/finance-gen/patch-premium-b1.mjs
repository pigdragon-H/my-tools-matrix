#!/usr/bin/env node
// One-off: inject domain-specific PremiumGate copy into F-21..F-34 briefs, then regenerate.
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const dir = "scripts/finance-gen/briefs";

// id -> { titleZh, textZh, chipsZh (|), titleEn, textEn, chipsEn (|) }
const P = {
  "investment-return-calculator": {
    titleZh: "專業版 投資組合報酬分析",
    textZh: "解鎖多資產配置模擬、蒙地卡羅退休成功率、實質報酬(扣通膨)、定期定額 vs 單筆投入回測與 PDF 投資計畫書。",
    chipsZh: "多資產配置|蒙地卡羅|實質報酬|回測報告",
    titleEn: "Pro Portfolio Return Analytics",
    textEn: "Unlock multi-asset allocation, Monte Carlo success rate, real (inflation-adjusted) returns, DCA vs lump-sum backtests, and a PDF investment plan.",
    chipsEn: "Allocation|Monte Carlo|Real Return|Backtest",
  },
  "break-even-calculator": {
    titleZh: "專業版 損益兩平與定價沙盤",
    textZh: "解鎖多產品加權損益兩平、安全邊際分析、價格敏感度矩陣、目標利潤反推與營運槓桿報告。",
    chipsZh: "多產品加權|安全邊際|敏感度矩陣|槓桿報告",
    titleEn: "Pro Break-Even & Pricing Sandbox",
    textEn: "Unlock multi-product weighted break-even, margin-of-safety analysis, price-sensitivity matrix, target-profit reverse solving, and operating-leverage reports.",
    chipsEn: "Weighted BE|Safety Margin|Sensitivity|Leverage",
  },
  "currency-converter": {
    titleZh: "專業版 多幣別匯率管理",
    textZh: "解鎖多幣別批次換算、歷史匯率回溯、隱藏匯差偵測、電匯費比較表與跨境付款最佳路徑建議。",
    chipsZh: "多幣別批次|匯率回溯|匯差偵測|路徑最佳化",
    titleEn: "Pro Multi-Currency FX Manager",
    textEn: "Unlock batch multi-currency conversion, historical rate lookback, hidden-spread detection, wire-fee comparison, and best cross-border payment routing.",
    chipsEn: "Batch FX|History|Spread Scan|Routing",
  },
  "stock-profit-calculator": {
    titleZh: "專業版 交易損益與稅務分析",
    textZh: "解鎖多筆交易彙總、平均成本法/先進先出、長短期資本利得稅試算、洗售規則偵測與年度損益報表。",
    chipsZh: "交易彙總|成本基礎|資本利得稅|洗售偵測",
    titleEn: "Pro Trade P&L & Tax Analytics",
    textEn: "Unlock multi-trade aggregation, average-cost/FIFO basis, short/long-term capital gains tax, wash-sale detection, and annual P&L reports.",
    chipsEn: "Aggregate|Cost Basis|Cap Gains|Wash Sale",
  },
  "rental-yield-calculator": {
    titleZh: "專業版 不動產投資分析",
    textZh: "解鎖含槓桿 Cash-on-Cash 報酬、Cap Rate、貸款攤還整合、現金流預測與多物件比較報告。",
    chipsZh: "Cash-on-Cash|Cap Rate|貸款整合|多物件比較",
    titleEn: "Pro Real-Estate Investment Analytics",
    textEn: "Unlock leveraged cash-on-cash returns, cap rate, mortgage-amortization integration, cashflow projection, and multi-property comparison reports.",
    chipsEn: "Cash-on-Cash|Cap Rate|Mortgage|Compare",
  },
  "insurance-premium-calculator": {
    titleZh: "專業版 保單分析與保障缺口",
    textZh: "解鎖保障缺口分析(壽險/醫療/失能)、儲蓄險 vs 定期險 IRR 比較、多家保單試算與保費佔收入健診。",
    chipsZh: "保障缺口|IRR 比較|多家試算|保費健診",
    titleEn: "Pro Policy Analysis & Coverage Gap",
    textEn: "Unlock coverage-gap analysis (life/health/disability), savings vs term IRR comparison, multi-insurer quoting, and premium-to-income health checks.",
    chipsEn: "Coverage Gap|IRR|Multi-quote|Health Check",
  },
  "pension-calculator": {
    titleZh: "專業版 退休模擬與提領策略",
    textZh: "解鎖多情境退休模擬、通膨調整、4% 法則提領策略、勞保+勞退+自提三層整合與 PDF 退休計畫書。",
    chipsZh: "多情境模擬|通膨調整|提領策略|三層整合",
    titleEn: "Pro Retirement Simulation & Withdrawal",
    textEn: "Unlock multi-scenario retirement simulation, inflation adjustment, 4%-rule withdrawal strategy, three-pillar integration, and a PDF retirement plan.",
    chipsEn: "Scenarios|Inflation|Withdrawal|Pillars",
  },
  "bond-yield-calculator": {
    titleZh: "專業版 債券分析工具組",
    textZh: "解鎖殖利率曲線、存續期間(Duration)、凸性(Convexity)、Yield to Worst、利率敏感度與債券階梯建構。",
    chipsZh: "殖利率曲線|存續期間|凸性|YTW",
    titleEn: "Pro Bond Analytics Suite",
    textEn: "Unlock yield curve, duration, convexity, yield-to-worst, rate sensitivity, and bond-ladder construction.",
    chipsEn: "Yield Curve|Duration|Convexity|YTW",
  },
  "options-profit-calculator": {
    titleZh: "專業版 選擇權策略分析",
    textZh: "解鎖多腳策略(價差/跨式/鐵兀鷹)、Greeks(Delta/Gamma/Theta/Vega)、隱含波動率分析與損益圖視覺化。",
    chipsZh: "多腳策略|Greeks|隱含波動率|損益圖",
    titleEn: "Pro Options Strategy Analytics",
    textEn: "Unlock multi-leg strategies (spreads/straddles/iron condors), Greeks (Delta/Gamma/Theta/Vega), implied-volatility analysis, and payoff-diagram visualization.",
    chipsEn: "Multi-leg|Greeks|IV|Payoff Chart",
  },
  "dividend-yield-calculator": {
    titleZh: "專業版 股息成長分析",
    textZh: "解鎖股息成長回測、配息率(Payout Ratio)健診、殖利率陷阱警示、股息再投入(DRIP)模擬與年度被動收入預測。",
    chipsZh: "成長回測|配息率健診|陷阱警示|DRIP 模擬",
    titleEn: "Pro Dividend Growth Analytics",
    textEn: "Unlock dividend-growth backtests, payout-ratio health checks, yield-trap alerts, DRIP simulation, and annual passive-income projection.",
    chipsEn: "Backtest|Payout|Trap Alert|DRIP",
  },
  "net-present-value-calculator": {
    titleZh: "專業版 資本預算分析",
    textZh: "解鎖不均勻現金流 NPV、精確 IRR(牛頓迭代)、MIRR、敏感度與情境分析、多專案排序與 PDF 投資評估報告。",
    chipsZh: "不均勻現金流|精確 IRR|MIRR|情境分析",
    titleEn: "Pro Capital Budgeting Analytics",
    textEn: "Unlock uneven-cashflow NPV, exact IRR (Newton iteration), MIRR, sensitivity & scenario analysis, multi-project ranking, and PDF appraisal reports.",
    chipsEn: "Uneven CF|Exact IRR|MIRR|Scenarios",
  },
  "payback-period-calculator": {
    titleZh: "專業版 回收期與流動性分析",
    textZh: "解鎖不規則現金流回收、折現回收期、多專案回收比較、流動性風險評分與盈虧平衡時點預測。",
    chipsZh: "不規則現金流|折現回收|多專案比較|風險評分",
    titleEn: "Pro Payback & Liquidity Analytics",
    textEn: "Unlock irregular-cashflow payback, discounted payback, multi-project comparison, liquidity-risk scoring, and breakeven-timing prediction.",
    chipsEn: "Irregular CF|Discounted|Compare|Risk Score",
  },
  "cash-flow-calculator": {
    titleZh: "專業版 現金流管理與預算",
    textZh: "解鎖年度大額支出平攤、12 個月現金流預測、消費漂移偵測、儲蓄率趨勢圖與 50/30/20 自動分類。",
    chipsZh: "年度平攤|12月預測|漂移偵測|趨勢圖",
    titleEn: "Pro Cashflow Management & Budgeting",
    textEn: "Unlock annual lump-sum smoothing, 12-month cashflow forecast, spending-drift detection, savings-rate trends, and auto 50/30/20 categorization.",
    chipsEn: "Smoothing|Forecast|Drift|Trends",
  },
  "financial-ratio-calculator": {
    titleZh: "專業版 財報比率分析",
    textZh: "解鎖速動比率、ROE/ROA/ROIC、杜邦分析、週轉率、同業中位數對標與 5 年趨勢報告。",
    chipsZh: "速動比率|杜邦分析|同業對標|趨勢報告",
    titleEn: "Pro Financial-Statement Ratio Analytics",
    textEn: "Unlock quick ratio, ROE/ROA/ROIC, DuPont analysis, turnover ratios, peer-median benchmarking, and 5-year trend reports.",
    chipsEn: "Quick Ratio|DuPont|Benchmark|Trends",
  },
};

const fileMap = {
  "investment-return-calculator": "F21-investment-return.json",
  "break-even-calculator": "F22-break-even.json",
  "currency-converter": "F23-currency-converter.json",
  "stock-profit-calculator": "F24-stock-profit.json",
  "rental-yield-calculator": "F25-rental-yield.json",
  "insurance-premium-calculator": "F26-insurance-premium.json",
  "pension-calculator": "F27-pension.json",
  "bond-yield-calculator": "F28-bond-yield.json",
  "options-profit-calculator": "F29-options-profit.json",
  "dividend-yield-calculator": "F30-dividend-yield.json",
  "net-present-value-calculator": "F31-npv.json",
  "payback-period-calculator": "F32-payback.json",
  "cash-flow-calculator": "F33-cash-flow.json",
  "financial-ratio-calculator": "F34-financial-ratio.json",
};

for (const [id, p] of Object.entries(P)) {
  const fp = path.join(dir, fileMap[id]);
  const brief = JSON.parse(fs.readFileSync(fp, "utf8"));
  brief.premiumTitleZh = p.titleZh;
  brief.premiumTextZh = p.textZh;
  brief.premiumChipsZh = p.chipsZh;
  brief.premiumTitleEn = p.titleEn;
  brief.premiumTextEn = p.textEn;
  brief.premiumChipsEn = p.chipsEn;
  fs.writeFileSync(fp, JSON.stringify(brief, null, 2));
  console.log("patched", fileMap[id]);
  // regenerate
  execSync(`node scripts/finance-spec-builder.mjs ${fp}`, { stdio: "pipe" });
  console.log("  regenerated", id);
}
console.log("DONE");
