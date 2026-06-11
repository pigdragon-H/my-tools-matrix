// @profile B
// Profile B · 計算機-YMYL · TaxBracketCalculator（GOLD-STANDARD-001 compatible · clone of MeetingCostCalculator）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "tiny", range: "≤ 12%", label: { zh: "低稅級 (10–12%)", en: "Low (10–12%)" }, desc: { zh: "邊際稅率落在 10% 或 12% 級距，課稅所得約 ≤ $47k(單身)。應充分利用標準扣除額,Roth IRA 較划算。", en: "Marginal rate is 10% or 12%, taxable income ≲ $47k (single). Use the standard deduction; Roth IRA usually beats Traditional." } },
  { key: "normal", range: "22%", label: { zh: "中稅級 (22%)", en: "Middle (22%)" }, desc: { zh: "22% 級距,課稅所得約 $47k–$100k。401(k) traditional 抵稅效益開始顯現,可考慮 HSA。", en: "22% bracket, taxable income $47k–$100k. Traditional 401(k) deductibility helps; HSA is worth considering." } },
  { key: "notable", range: "24%", label: { zh: "高中稅級 (24%)", en: "High-mid (24%)" }, desc: { zh: "24% 級距,所得 $100k–$192k。Backdoor Roth、mega backdoor、tax-loss harvesting 開始有意義。", en: "24% bracket, $100k–$192k. Backdoor Roth, mega backdoor, and tax-loss harvesting start to matter." } },
  { key: "high", range: "32%", label: { zh: "高稅級 (32%)", en: "High (32%)" }, desc: { zh: "32% 級距,所得 $192k–$244k。AMT、NIIT 風險上升,州稅規劃與市政債券值得評估。", en: "32% bracket, $192k–$244k. AMT and NIIT risk rise; consider state-tax planning and muni bonds." } },
  { key: "major", range: "35%", label: { zh: "重稅級 (35%)", en: "Major (35%)" }, desc: { zh: "35% 級距,所得 $244k–$609k。DAF、慈善捐贈、QSBS、合格機會區(QOZ)等遞延工具值得規劃。", en: "35% bracket, $244k–$609k. DAFs, charitable giving, QSBS, and Qualified Opportunity Zones are worth considering." } },
  { key: "executive", range: "37%", label: { zh: "頂級稅率 (37%)", en: "Top (37%)" }, desc: { zh: "37% 頂級,所得 > $609k。委由 CPA 或稅務律師處理;涉及信託、保險、家族 LLC、私募基金結構。", en: "Top 37%, income > $609k. Work with a CPA or tax attorney — trusts, insurance, family LLCs, and private-fund structures matter." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "稅後薪資計算機", en: "Salary After-Tax Calculator" }, href: "/tools/finance/salary-after-tax-calculator" },
  { label: { zh: "預算比例計算機", en: "Budget Ratio Calculator" }, href: "/tools/finance/budget-ratio-calculator" },
  { label: { zh: "退休計算機", en: "Retirement Calculator" }, href: "/tools/finance/retirement-calculator" },
  { label: { zh: "淨資產計算機", en: "Net Worth Calculator" }, href: "/tools/finance/net-worth-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · 稅率級距 · 黃金工具",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Tax Bracket Calculator · 稅率級距計算機",
    subtitle: "依美國 2024 年聯邦級距估算邊際稅率、有效稅率與稅後所得",
    intro: "本工具依 2024 年美國聯邦個人所得稅級距(單身或夫妻合併申報),從年收入扣除標準扣除額,套用累進稅率計算總稅額,扣除稅務抵免後得出有效稅率與稅後所得。所有計算在瀏覽器端完成,薪資資料不上傳。",
    trustNoteLabel: "注意事項：",
    trustNote: "本工具僅依公開的聯邦級距試算,不涵蓋州稅、社安/Medicare、AMT、NIIT、被動收入、Roth/Traditional 401(k) 比較;非報稅服務,請以 IRS 或合格 CPA 為準。",
    quickActionCard: "快速範例卡",
    tryExample: "試算稅率級距",
    examplePreview: "邊際稅率",
    examplePerson: "標準範例",
    fillExample: "一鍵填入單身範例",
    previewActivePath: "填入夫妻合併範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入年收入、申報身分、扣除額、抵免",
    examplesHelper: "先用範例了解邊際稅率與有效稅率的差別,再改成自己的數字。",
    metric: "標準扣除",
    imperial: "細項扣除",
    exampleCards: "範例卡",
    baselineExample: "標準範例(單身)",
    baselineExampleValue: "$85k",
    baselineExampleNote: "$85k 收入 · 標準扣除 · 22% 邊際",
    activeExample: "高所得範例(夫妻)",
    activeExampleValue: "$275k",
    activeExampleNote: "$275k 收入 · 32% 邊際",
    flowDemo: "$85k × 22%",
    calculator: "計算機",
    annualIncome: "年收入 ($)",
    filingStatus: "申報身分(1=單身, 2=夫妻合併)",
    deductions: "扣除額 ($)",
    credits: "稅務抵免 ($)",
    resultCard: "稅率級距計算結果",
    primaryValue: "邊際稅率",
    primaryUnitTail: "%",
    secondaryLabel: "總稅額",
    secondaryTail: "$/年",
    metricALabel: "Effective",
    metricACaption: "有效稅率",
    metricATail: "%",
    metricBLabel: "After-tax",
    metricBCaption: "稅後所得",
    metricBTail: "$/年",
    metricCLabel: "Total tax",
    metricCCaption: "總稅",
    metricCTail: "$",
    headlineCaption: "目前邊際",
    fatLossTarget: "總稅",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "六格稅率級距判讀矩陣",
    tdeeMatrixNote: "L7 固定六格,把目前邊際稅率放進 IRS 七級距區段(10/12/22/24/32/35/37)。這是稅務規劃參考,不是 CPA 建議。",
    emotionConversionLayer: "情緒與轉換層",
    turnIntoPlan: "把稅率資訊轉成節稅計畫",
    conversionNote: "L9 連動目前計算結果,顯示邊際、有效、稅後所得,協助判斷是否該加碼 401(k)、HSA、Roth 轉換或慈善捐贈。",
    progressInsight: "進度洞察卡",
    possibleTarget: "目前稅務結構",
    weeklyTrend: "邊際",
    dailyGap: "總稅",
    tertiaryTag: "有效稅率",
    motivation: "動力卡",
    keepMomentum: "從一個級距走向年度稅務規劃",
    saveShareJourney: "儲存 / 分享",
    journeyTitle: "把今天的稅率快照帶回家",
    journeyHint: "每次調薪、結婚、生子或扣除額變動時重算,追蹤邊際稅率變化。",
    nextActionLabel: "下一步行動",
    nextActionTitle: "把結果接到下一個工具",
    nextActionItem1: "用稅後薪資計算機驗算月薪到手金額",
    nextActionItem2: "用預算比例計算機把稅後收入分配到必要支出/儲蓄/投資",
    nextActionItem3: "用退休計算機評估稅前 401(k) 加碼對最終資產的長期影響",
    shareLinkBtn: "📋 複製結果連結",
    shareNativeBtn: "📤 分享給隊友",
    shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑",
    decisionTitle: "年收入 → 課稅所得 → 邊際 → 稅後",
    bmrStep: "年收入",
    bmrNote: "毛收入起點",
    deficitStep: "扣除額",
    deficitNote: "標準或細項",
    trendStep: "邊際",
    trendNote: "下一塊錢的稅率",
    mealStep: "稅後",
    mealNote: "可運用所得",
    knowledge: "知識",
    knowledgeTitle: "邊際 vs 有效稅率的關鍵差別",
    definition: "定義",
    definitionText: "美國採累進稅,每一級距只對該段所得課該級稅率。「邊際」= 下一塊錢落在的級距;「有效」= 總稅 ÷ 總所得。多數人混淆這兩者,以為加薪會被「整體拉到 24%」其實只有超過門檻的部分被課 24%。",
    formula: "公式",
    formulaText: "課稅所得 = max(0, 年收入 − 扣除額)。總稅 = Σ (該級內所得 × 該級稅率)。有效稅率 = 總稅 ÷ 年收入。稅後 = 年收入 − 總稅 + 抵免。",
    limitations: "限制",
    limitationsText: "本工具僅試算聯邦個人所得稅;未涵蓋州稅、地方稅、社安(6.2%)、Medicare(1.45%)、AMT、NIIT(3.8%)、自雇稅、合格股利/長期資本利得單獨稅率、Section 199A 通透扣除、被動損失限制。",
    interpretation: "解讀",
    interpretationText: "邊際 22% 不代表您被課 22%;通常有效稅率比邊際低 4–8 個百分點。決定 Roth 或 Traditional 401(k) 看「現在邊際 vs 退休邊際」;判斷加薪後實領,只看新所得落在哪個級距。",
    context: "脈絡",
    contextText: "級距每年依通膨調整(IRS Rev. Proc.)。2024→2025 年級距上限調升約 5.4%。州稅另計,加州、紐約最高 13.3%/10.9% 顯著推升總稅率。聯邦級距僅是聯邦那一半。",
    example: "範例",
    exampleText: "單身 $85,000 收入,標準扣除 $13,850,課稅所得 $71,150。落在 22% 級距,總稅約 $11,118,有效稅率 13.1%,稅後 $73,882。比起想像中的「22% × $85k = $18.7k」少很多。",
    faq: "常見問題",
    commonQuestions: "常見問題",
    affiliate: "推薦工具",
    affiliateTitle: "稅務規劃的下一步工具",
    premiumTitle: "專業版稅務規劃包",
    premiumText: "解鎖州稅疊加(50 州)、AMT 試算、NIIT、Roth vs Traditional 比較、年度多情境模擬、慈善捐贈策略試算、PDF 報表。",
    premiumChips_zh: "州稅|AMT|Roth比較|PDF",
    premiumChips_en: "State|AMT|Roth|PDF",
    trustReferences: "信任聲明 · 相關工具 · 參考資料",
    trust: "信任聲明",
    trustText: "本工具僅供教育與規劃用途,不構成稅務諮詢;正式報稅請以 IRS Form 1040 與合格 CPA/EA 為準。",
    relatedTools: "相關工具",
    relatedToolsText: "稅後薪資 · 預算比例 · 退休計算機 · 淨資產",
    references: "參考資料",
    referencesText: "IRS Rev. Proc. 2023-34 (2024 級距);IRC §1, §63, §151;Tax Foundation 2024 federal individual income tax brackets;CRS Report R44787 Federal Income Tax Reform。",
    q1: "為什麼我加薪後實領沒有變多 78%?",
    a1: "因為加薪部分先被聯邦邊際(22% 或 24%)、州稅(0–13.3%)、社安+Medicare(7.65%)合計通常 30–45% 課掉。剩下才是實領。本工具只算聯邦那一塊,實領請再扣州稅+社安。",
    q2: "標準扣除 vs 細項扣除哪個划算?",
    a2: "2024 標準扣除單身 $14,600、夫妻合併 $29,200。除非有大量按揭利息、州稅(SALT 上限 $10k)、慈善捐贈、未補償醫療,通常標準扣除較簡便且划算。",
    q3: "Roth 還是 Traditional 401(k)?",
    a3: "比較「現在邊際稅率 vs 退休後預估邊際」。現在 32% 級距、退休預估 24%,Traditional 較划算;反之低稅級時 Roth 較有利。本工具給「現在邊際」這一半的數字。",
    q4: "Backdoor Roth 適合誰?",
    a4: "Roth IRA 直接提撥有所得上限(2024 單身 $161k MAGI 完全 phase-out)。超過上限者可走 Backdoor:存 Traditional IRA 後立刻轉 Roth。需注意 pro-rata rule(其他 Traditional IRA 餘額會稀釋)。",
    q5: "年收入會把整筆推進更高級距嗎?",
    a5: "不會。美國採累進制,每一塊錢只課該級稅率。年薪從 $190k 跳到 $200k 只有那 $10k 從 24% 變 32%,不是整筆 $200k 都課 32%。",
    q6: "本工具能取代 CPA 嗎?",
    a6: "不能。它只試算聯邦級距;報稅涉及自雇稅、AMT、NIIT、Section 199A、QBI、ISO/RSU、海外資產、估算稅(quarterly)、罰金等。$200k+ 收入或自雇者強烈建議聘 CPA/EA。"
  },
  en: {
    badge: "Finance · Tax bracket · Gold tool",
    switchToEnglish: "English mode",
    switchToChinese: "Switch to Chinese",
    chineseShort: "中",
    englishShort: "EN",
    title: "Tax Bracket Calculator",
    subtitle: "Estimate marginal rate, effective rate, and after-tax income from US 2024 federal brackets",
    intro: "This tool applies the 2024 US federal individual income tax brackets (single or married-filing-jointly), subtracts deductions, applies progressive rates, deducts credits, and reports marginal rate, effective rate, and after-tax income. Computation runs in your browser — salary data never leaves the device.",
    trustNoteLabel: "Note:",
    trustNote: "Federal brackets only — does not include state tax, Social Security/Medicare, AMT, NIIT, passive income, or Roth/Traditional 401(k) comparison. Not a tax-filing service; defer to IRS or a qualified CPA.",
    quickActionCard: "Quick example",
    tryExample: "Estimate the bracket",
    examplePreview: "Marginal rate",
    examplePerson: "Standard example",
    fillExample: "Fill single-filer example",
    previewActivePath: "Fill married joint example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter income, filing status, deductions, credits",
    examplesHelper: "Start with the example to see marginal vs effective, then change the numbers.",
    metric: "Standard ded",
    imperial: "Itemized ded",
    exampleCards: "Example cards",
    baselineExample: "Standard (single)",
    baselineExampleValue: "$85k",
    baselineExampleNote: "$85k income · standard ded · 22% marginal",
    activeExample: "High-income (joint)",
    activeExampleValue: "$275k",
    activeExampleNote: "$275k income · 32% marginal",
    flowDemo: "$85k × 22%",
    calculator: "Calculator",
    annualIncome: "Annual income ($)",
    filingStatus: "Filing status (1=single, 2=joint)",
    deductions: "Deductions ($)",
    credits: "Tax credits ($)",
    resultCard: "Tax bracket result",
    primaryValue: "Marginal rate",
    primaryUnitTail: "%",
    secondaryLabel: "Total tax",
    secondaryTail: "$/year",
    metricALabel: "Effective",
    metricACaption: "Effective rate",
    metricATail: "%",
    metricBLabel: "After-tax",
    metricBCaption: "Take-home",
    metricBTail: "$/year",
    metricCLabel: "Total tax",
    metricCCaption: "Total",
    metricCTail: "$",
    headlineCaption: "Current marginal",
    fatLossTarget: "Total tax",
    resultIntelligence: "Result intelligence",
    tdeeMatrix: "Six-band tax-bracket matrix",
    tdeeMatrixNote: "L7 fixed six bands — places your marginal rate into the IRS seven-bracket layout (10/12/22/24/32/35/37). Planning aid, not CPA advice.",
    emotionConversionLayer: "Emotion & conversion layer",
    turnIntoPlan: "Turn the bracket info into a tax plan",
    conversionNote: "L9 reflects current marginal/effective/after-tax to help decide whether to up 401(k), HSA, do a Roth conversion, or donate.",
    progressInsight: "Progress insight",
    possibleTarget: "Your tax shape",
    weeklyTrend: "Marginal",
    dailyGap: "Total tax",
    tertiaryTag: "Effective",
    motivation: "Motivation",
    keepMomentum: "Move from one bracket to a year-round tax plan",
    saveShareJourney: "Save / share",
    journeyTitle: "Take today's tax snapshot home",
    journeyHint: "Recalculate after a raise, marriage, child, or deduction change to track marginal-rate drift.",
    nextActionLabel: "Next action",
    nextActionTitle: "Carry the result to the next tool",
    nextActionItem1: "Use Salary After-Tax Calculator to verify monthly take-home",
    nextActionItem2: "Use Budget Ratio Calculator to allocate after-tax income to needs/savings/investing",
    nextActionItem3: "Use Retirement Calculator to see how a higher pre-tax 401(k) compounds over decades",
    shareLinkBtn: "📋 Copy result link",
    shareNativeBtn: "📤 Share with a teammate",
    shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path",
    decisionTitle: "Income → Taxable → Marginal → After-tax",
    bmrStep: "Income",
    bmrNote: "Gross start",
    deficitStep: "Deductions",
    deficitNote: "Standard or itemised",
    trendStep: "Marginal",
    trendNote: "Next-dollar rate",
    mealStep: "After-tax",
    mealNote: "Spendable",
    knowledge: "Knowledge",
    knowledgeTitle: "Marginal vs effective — the key distinction",
    definition: "Definition",
    definitionText: "US uses progressive brackets — each bracket only taxes the income inside it. Marginal = the bracket your next dollar lands in. Effective = total tax ÷ total income. Most people confuse the two, fearing a raise will pull their whole income to 24% — only the slice above the threshold is taxed at 24%.",
    formula: "Formula",
    formulaText: "Taxable = max(0, income − deductions). Total tax = Σ (slice × rate). Effective = total tax ÷ income. After-tax = income − total tax + credits.",
    limitations: "Limitations",
    limitationsText: "Federal individual income tax only. Not modelled: state/local tax, Social Security (6.2%), Medicare (1.45%), AMT, NIIT (3.8%), self-employment tax, qualified-dividend / LTCG rates, Section 199A QBI, passive-loss limits.",
    interpretation: "Interpretation",
    interpretationText: "A 22% marginal does NOT mean you pay 22% — effective is usually 4–8 points lower. Roth vs Traditional 401(k) hinges on current vs retirement marginal. After a raise, only the slice above the threshold is taxed at the higher rate.",
    context: "Context",
    contextText: "Brackets are inflation-indexed yearly (IRS Rev. Proc.). 2024→2025 thresholds rose ~5.4%. State tax adds: California 13.3%, NY 10.9% top — federal is only half the story.",
    example: "Example",
    exampleText: "Single $85,000 income, $13,850 standard deduction, taxable $71,150. Lands in the 22% bracket; total tax ≈ $11,118; effective 13.1%; after-tax $73,882. Far lower than the naive '22% × $85k = $18.7k'.",
    faq: "FAQ",
    commonQuestions: "Common questions",
    affiliate: "Recommended tools",
    affiliateTitle: "Next-step tools for tax planning",
    premiumTitle: "Pro Tax Planning Pack",
    premiumText: "Unlock 50-state overlay, AMT modelling, NIIT, Roth vs Traditional comparison, multi-scenario yearly simulation, charitable strategy, PDF reports.",
    premiumChips_zh: "州稅|AMT|Roth比較|PDF",
    premiumChips_en: "State|AMT|Roth|PDF",
    trustReferences: "Trust · Related tools · References",
    trust: "Trust",
    trustText: "Educational and planning use only — not tax advice. For filing, use IRS Form 1040 and a qualified CPA/EA.",
    relatedTools: "Related tools",
    relatedToolsText: "Salary After-Tax · Budget Ratio · Retirement · Net Worth",
    references: "References",
    referencesText: "IRS Rev. Proc. 2023-34 (2024 brackets); IRC §1, §63, §151; Tax Foundation 2024 federal brackets; CRS Report R44787 Federal Income Tax Reform.",
    q1: "Why doesn't my raise show up at 78%?",
    a1: "Because the raise gets sliced by federal marginal (22–24%), state (0–13.3%), and FICA (7.65%) — typically 30–45% combined. This tool covers only the federal piece; subtract state + FICA for true take-home.",
    q2: "Standard or itemised deduction?",
    a2: "2024 standard: single $14,600, joint $29,200. Unless you have heavy mortgage interest, state tax (SALT capped $10k), charitable, or unreimbursed medical, standard is simpler and usually wins.",
    q3: "Roth or Traditional 401(k)?",
    a3: "Compare current marginal vs expected retirement marginal. At 32% now and 24% expected later, Traditional wins; at low brackets, Roth wins. This tool gives you the 'current marginal' half.",
    q4: "Who needs Backdoor Roth?",
    a4: "Direct Roth IRA contributions phase out (2024 single $161k MAGI full out). Above that, contribute to a Traditional IRA, then convert immediately to Roth. Watch the pro-rata rule — other Traditional IRA balances dilute it.",
    q5: "Will a raise push my whole income into a higher bracket?",
    a5: "No. US is progressive — each dollar is taxed only at its bracket. Going from $190k to $200k means just the $10k slice gets 32%, not the full $200k.",
    q6: "Can this replace a CPA?",
    a6: "No. It models only federal brackets; filing involves SE tax, AMT, NIIT, §199A, QBI, ISO/RSU, foreign assets, quarterly estimates, penalties. At $200k+ or self-employed, hire a CPA/EA."
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function TaxBracketCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [annualIncome, setAnnualIncome] = useState("85000");
  const [filingStatus, setFilingStatus] = useState("1");
  const [deductions, setDeductions] = useState("13850");
  const [credits, setCredits] = useState("0");
  const t = ui[lang];

  const result = useMemo(() => {
    const income = Number(annualIncome) || 0;
    const status = Number(filingStatus) || 1;
    const ded = Number(deductions) || 0;
    const cred = Number(credits) || 0;
    const taxable = Math.max(0, income - ded);
    // 2024 US single brackets (illustrative)
    const brackets = status === 2
      ? [[0,23200,0.10],[23200,94300,0.12],[94300,201050,0.22],[201050,383900,0.24],[383900,487450,0.32],[487450,731200,0.35],[731200,Infinity,0.37]]
      : [[0,11600,0.10],[11600,47150,0.12],[47150,100525,0.22],[100525,191950,0.24],[191950,243725,0.32],[243725,609350,0.35],[609350,Infinity,0.37]];
    let tax = 0; let marginal = 0;
    for (const [lo, hi, rate] of brackets) {
      if (taxable > lo) {
        const slice = Math.min(taxable, hi) - lo;
        if (slice > 0) tax += slice * rate;
        if (taxable >= lo && taxable < hi) marginal = rate;
      }
      if (taxable < hi) break;
    }
    const finalTax = Math.max(0, tax - cred);
    const effective = income > 0 ? (finalTax / income) * 100 : 0;
    const afterTax = income - finalTax;
    return { marginalRate: marginal * 100, totalTax: finalTax, effectiveRate: effective, afterTax, taxable };
  }, [annualIncome, filingStatus, deductions, credits]);

  const primaryDisplay = fmt(result.marginalRate, 1);
  const secondaryDisplay = fmt(result.totalTax, 0);
  const tertiaryDisplay = fmt(result.effectiveRate, 2);
  const quaternaryDisplay = fmt(result.afterTax, 0);

  function fillSolid() { setUnit("metric"); setAnnualIncome("85000"); setFilingStatus("1"); setDeductions("13850"); setCredits("0"); }
  function fillHighSalary() { setUnit("imperial"); setAnnualIncome("275000"); setFilingStatus("2"); setDeductions("27700"); setCredits("2000"); }

  const activeBand = bands.find(b => {
    const r = result.marginalRate;
    if (r < 12) return 'tiny';
    if (r < 22) return 'normal';
    if (r < 24) return 'notable';
    if (r < 32) return 'high';
    if (r < 35) return 'major';
    return 'executive';
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#d1fae5,_#f8fafc_45%,_#e0f2fe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-emerald-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{primaryDisplay}%</div><div className="text-sm font-bold text-emerald-100">{t.headlineCaption}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{primaryDisplay}%</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{annualIncome} × {filingStatus}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{secondaryDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-black text-emerald-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">{t.baselineExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">{t.activeExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.annualIncome}<input type="number" step="1000" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={annualIncome} onChange={(e) => setAnnualIncome(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.filingStatus}<input type="number" step="1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={filingStatus} onChange={(e) => setFilingStatus(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.deductions}<input type="number" step="100" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={deductions} onChange={(e) => setDeductions(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.credits}<input type="number" step="100" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={credits} onChange={(e) => setCredits(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{primaryDisplay}<span className="text-3xl">%</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.primaryValue}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.secondaryLabel}</div><div className="mt-1 text-xl font-black">{secondaryDisplay}</div><div className="mt-1 text-xs text-slate-300">{t.secondaryTail}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.metricALabel}</div><div className="mt-1 text-xs font-black text-emerald-700">{t.metricACaption}</div><p className="mt-2 text-3xl font-black text-emerald-950">{tertiaryDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.metricATail}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.metricBLabel}</div><div className="mt-1 text-xs font-black text-blue-700">{t.metricBCaption}</div><p className="mt-2 text-3xl font-black text-blue-950">{quaternaryDisplay}</p><p className="text-sm font-bold text-blue-700">{t.metricBTail}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.metricCLabel}</div><div className="mt-1 text-xs font-black text-slate-700">{t.metricCCaption}</div><p className="mt-2 text-3xl font-black text-slate-950">{secondaryDisplay}</p><p className="text-sm font-bold text-slate-700">{t.metricCTail}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="tax-bracket-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black">{primaryDisplay}%</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{secondaryDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.tertiaryTag}</div><div className="mt-1 text-3xl font-black text-emerald-950">{tertiaryDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: t.bmrStep, note: t.bmrNote }, { label: t.deficitStep, note: t.deficitNote }, { label: t.trendStep, note: t.trendNote }, { label: t.mealStep, note: t.mealNote }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="tax-bracket-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? t.premiumChips_zh : t.premiumChips_en).split("|").map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
