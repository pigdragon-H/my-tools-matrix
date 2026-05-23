import { useMemo, useState } from "react";

type Lang = "zh" | "en";

const zhText = {
  title: "損益平衡計算器",
  description: "計算損益平衡點、邊際貢獻與安全邊際，協助商業決策。",
  language: "語言",
  zh: "中文",
  en: "EN",
  inputTitle: "輸入資料",
  fixedCosts: "固定成本（元）",
  price: "單位售價（元）",
  variableCost: "單位變動成本（元）",
  expectedVolume: "預期銷售量（選填）",
  currency: "貨幣符號",
  resultTitle: "結果",
  bepUnits: "損益平衡點",
  units: "單位",
  bepRevenue: "損益平衡營收",
  contributionMargin: "邊際貢獻",
  perUnit: "單位",
  contributionMarginRatio: "邊際貢獻率",
  safetyMargin: "安全邊際",
  expectedProfit: "預期利潤",
  scenario: "情境分析",
  scenarioText: "售價提高10% → 新損益平衡點",
  chartTitle: "損益平衡圖",
  fixedCostLine: "固定成本線",
  totalCostLine: "總成本線",
  revenueLine: "總收入線",
  breakEvenPoint: "損益平衡點",
  copy: "複製結果",
  copied: "已複製",
  clear: "清除",
  formulaTitle: "公式",
  formula1: "損益平衡點（單位）= 固定成本 ÷（售價 - 單位變動成本）",
  formula2: "損益平衡點（金額）= 損益平衡點（單位）× 售價",
  formula3: "安全邊際率 =（實際銷售量 - 損益平衡點）÷ 實際銷售量 × 100%",
  errorPositive: "請輸入有效且不為負數的數值。",
  errorMargin: "單位售價必須大於單位變動成本，才能產生正向邊際貢獻。",
  noResult: "請輸入有效資料以顯示結果。",
  disclaimer: "此工具僅供商業規劃與教育用途，不能取代專業會計、稅務或財務顧問意見。",
};

const enText = {
  title: "Break Even Calculator",
  description: "Calculate break-even point, contribution margin and safety margin for business planning.",
  language: "Language",
  zh: "中文",
  en: "EN",
  inputTitle: "Inputs",
  fixedCosts: "Fixed Costs",
  price: "Selling Price per Unit",
  variableCost: "Variable Cost per Unit",
  expectedVolume: "Expected Sales Volume (optional)",
  currency: "Currency",
  resultTitle: "Results",
  bepUnits: "Break-Even Point",
  units: "units",
  bepRevenue: "Break-Even Revenue",
  contributionMargin: "Contribution Margin",
  perUnit: "unit",
  contributionMarginRatio: "Contribution Margin Ratio",
  safetyMargin: "Safety Margin",
  expectedProfit: "Expected Profit",
  scenario: "Scenario",
  scenarioText: "Price +10% → New BEP",
  chartTitle: "Break-Even Chart",
  fixedCostLine: "Fixed Cost Line",
  totalCostLine: "Total Cost Line",
  revenueLine: "Total Revenue Line",
  breakEvenPoint: "Break-Even Point",
  copy: "Copy Result",
  copied: "Copied",
  clear: "Clear",
  formulaTitle: "Formula",
  formula1: "Break-Even Point (units) = Fixed Costs ÷ (Selling Price - Variable Cost per Unit)",
  formula2: "Break-Even Revenue = Break-Even Point (units) × Selling Price",
  formula3: "Safety Margin Ratio = (Actual Sales Volume - Break-Even Point) ÷ Actual Sales Volume × 100%",
  errorPositive: "Please enter valid non-negative numbers.",
  errorMargin: "Selling price must be greater than variable cost per unit to create a positive contribution margin.",
  noResult: "Enter valid data to show results.",
  disclaimer: "This tool is for business planning and education only. It does not replace professional accounting, tax or financial advice.",
};

const numberFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

function money(currency: string, value: number) {
  return `${currency} ${numberFormat.format(value)}`;
}

export default function BreakEvenCalculator() {
  const [lang, setLang] = useState<Lang>("zh");
  const [fixedCosts, setFixedCosts] = useState("50000");
  const [price, setPrice] = useState("120");
  const [variableCost, setVariableCost] = useState("70");
  const [expectedVolume, setExpectedVolume] = useState("1500");
  const [currency, setCurrency] = useState("NT$");
  const [copied, setCopied] = useState(false);
  const t = lang === "zh" ? zhText : enText;

  const result = useMemo(() => {
    const fixed = Number(fixedCosts);
    const sellingPrice = Number(price);
    const variable = Number(variableCost);
    const expected = expectedVolume.trim() === "" ? NaN : Number(expectedVolume);
    if ([fixed, sellingPrice, variable].some((value) => !Number.isFinite(value) || value < 0) || (expectedVolume.trim() !== "" && (!Number.isFinite(expected) || expected < 0))) {
      return { error: t.errorPositive };
    }
    const contribution = sellingPrice - variable;
    if (contribution <= 0) return { error: t.errorMargin };
    const bepUnits = fixed / contribution;
    const bepRevenue = bepUnits * sellingPrice;
    const contributionRatio = (contribution / sellingPrice) * 100;
    const hasExpected = Number.isFinite(expected);
    const safetyUnits = hasExpected ? expected - bepUnits : undefined;
    const safetyRatio = hasExpected && expected > 0 ? ((expected - bepUnits) / expected) * 100 : undefined;
    const expectedProfit = hasExpected ? expected * contribution - fixed : undefined;
    const newBep = fixed / (sellingPrice * 1.1 - variable);
    return { fixed, sellingPrice, variable, contribution, bepUnits, bepRevenue, contributionRatio, hasExpected, expected, safetyUnits, safetyRatio, expectedProfit, newBep, error: "" };
  }, [fixedCosts, price, variableCost, expectedVolume, t.errorMargin, t.errorPositive]);

  const chart = useMemo(() => {
    if (result.error || result.bepUnits === undefined) return null;
    const maxUnits = Math.max(result.bepUnits * 1.8, result.hasExpected ? (result.expected ?? 0) * 1.2 : 0, 10);
    const maxValue = Math.max(result.fixed + result.variable * maxUnits, result.sellingPrice * maxUnits, result.bepRevenue) * 1.1;
    const width = 640;
    const height = 340;
    const pad = 48;
    const x = (units: number) => pad + (units / maxUnits) * (width - pad * 1.4);
    const y = (value: number) => height - pad - (value / maxValue) * (height - pad * 1.4);
    return { width, height, pad, maxUnits, maxValue, x, y };
  }, [result]);

  const copyResult = async () => {
    if (result.error || result.bepUnits === undefined) return;
    const text = `${t.title}\n${t.bepUnits}: ${numberFormat.format(result.bepUnits)} ${t.units}\n${t.bepRevenue}: ${money(currency, result.bepRevenue)}\n${t.contributionMargin}: ${money(currency, result.contribution)}/${t.perUnit}\n${t.contributionMarginRatio}: ${numberFormat.format(result.contributionRatio)}%`;
    await navigator.clipboard?.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const clear = () => {
    setFixedCosts("");
    setPrice("");
    setVariableCost("");
    setExpectedVolume("");
    setCopied(false);
  };

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-4 flex justify-end">
        <div className="rounded-full border bg-card p-1 text-sm">
          <span className="px-3 text-muted-foreground">{t.language}</span>
          <button className={`rounded-full px-3 py-1 ${lang === "zh" ? "bg-primary text-primary-foreground" : ""}`} onClick={() => setLang("zh")}>{t.zh}</button>
          <button className={`rounded-full px-3 py-1 ${lang === "en" ? "bg-primary text-primary-foreground" : ""}`} onClick={() => setLang("en")}>{t.en}</button>
        </div>
      </div>

      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <h1 className="text-3xl font-bold">{t.title}</h1>
        <p className="mt-2 text-muted-foreground">{t.description}</p>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">{t.inputTitle}</h2>
          <label className="mt-4 block text-sm font-medium">{t.fixedCosts}<input className="mt-1 w-full rounded-md border bg-background px-3 py-2" type="number" min="0" value={fixedCosts} onChange={(e) => setFixedCosts(e.target.value)} /></label>
          <label className="mt-4 block text-sm font-medium">{t.price}<input className="mt-1 w-full rounded-md border bg-background px-3 py-2" type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} /></label>
          <label className="mt-4 block text-sm font-medium">{t.variableCost}<input className="mt-1 w-full rounded-md border bg-background px-3 py-2" type="number" min="0" value={variableCost} onChange={(e) => setVariableCost(e.target.value)} /></label>
          <label className="mt-4 block text-sm font-medium">{t.expectedVolume}<input className="mt-1 w-full rounded-md border bg-background px-3 py-2" type="number" min="0" value={expectedVolume} onChange={(e) => setExpectedVolume(e.target.value)} /></label>
          <label className="mt-4 block text-sm font-medium">{t.currency}<select className="mt-1 w-full rounded-md border bg-background px-3 py-2" value={currency} onChange={(e) => setCurrency(e.target.value)}><option>NT$</option><option>$</option><option>€</option></select></label>
          {result.error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm font-medium text-red-700">{result.error}</p>}
          <div className="mt-5 flex flex-wrap gap-3"><button className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50" disabled={!!result.error} onClick={copyResult}>{copied ? t.copied : t.copy}</button><button className="rounded-md border px-4 py-2" onClick={clear}>{t.clear}</button></div>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">{t.resultTitle}</h2>
          {!result.error && result.bepUnits !== undefined ? <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-muted p-4"><p className="text-sm text-muted-foreground">{t.bepUnits}</p><p className="text-2xl font-bold">{numberFormat.format(result.bepUnits)} {t.units}</p></div>
            <div className="rounded-xl bg-muted p-4"><p className="text-sm text-muted-foreground">{t.bepRevenue}</p><p className="text-2xl font-bold">{money(currency, result.bepRevenue)}</p></div>
            <div className="rounded-xl bg-muted p-4"><p className="text-sm text-muted-foreground">{t.contributionMargin}</p><p className="text-2xl font-bold">{money(currency, result.contribution)}/{t.perUnit}</p></div>
            <div className="rounded-xl bg-muted p-4"><p className="text-sm text-muted-foreground">{t.contributionMarginRatio}</p><p className="text-2xl font-bold">{numberFormat.format(result.contributionRatio)}%</p></div>
            {result.hasExpected && result.safetyUnits !== undefined && result.safetyRatio !== undefined && result.expectedProfit !== undefined && <>
              <div className="rounded-xl bg-muted p-4"><p className="text-sm text-muted-foreground">{t.safetyMargin}</p><p className="text-2xl font-bold">{numberFormat.format(result.safetyUnits)} {t.units} ({numberFormat.format(result.safetyRatio)}%)</p></div>
              <div className="rounded-xl bg-muted p-4"><p className="text-sm text-muted-foreground">{t.expectedProfit}</p><p className="text-2xl font-bold">{money(currency, result.expectedProfit)}</p></div>
            </>}
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-900 sm:col-span-2"><p className="text-sm font-semibold">{t.scenario}</p><p className="text-xl font-bold">{t.scenarioText}: {numberFormat.format(result.newBep)} {t.units}</p></div>
          </div> : <p className="mt-4 text-muted-foreground">{t.noResult}</p>}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold">{t.chartTitle}</h2>
        {chart && !result.error && result.bepUnits !== undefined && (
          <svg className="mt-4 h-auto w-full" viewBox={`0 0 ${chart.width} ${chart.height}`} role="img" aria-label={t.chartTitle}>
            <rect width={chart.width} height={chart.height} rx="16" fill="hsl(var(--muted))" />
            <line x1={chart.pad} y1={chart.height - chart.pad} x2={chart.width - chart.pad / 2} y2={chart.height - chart.pad} stroke="currentColor" strokeOpacity="0.35" />
            <line x1={chart.pad} y1={chart.pad / 2} x2={chart.pad} y2={chart.height - chart.pad} stroke="currentColor" strokeOpacity="0.35" />
            <line x1={chart.pad} y1={chart.y(result.fixed)} x2={chart.width - chart.pad / 2} y2={chart.y(result.fixed)} stroke="#f59e0b" strokeWidth="3" />
            <line x1={chart.pad} y1={chart.y(result.fixed)} x2={chart.width - chart.pad / 2} y2={chart.y(result.fixed + result.variable * chart.maxUnits)} stroke="#ef4444" strokeWidth="3" />
            <line x1={chart.pad} y1={chart.y(0)} x2={chart.width - chart.pad / 2} y2={chart.y(result.sellingPrice * chart.maxUnits)} stroke="#22c55e" strokeWidth="3" />
            <circle cx={chart.x(result.bepUnits)} cy={chart.y(result.bepRevenue)} r="7" fill="#2563eb" />
            <text x={chart.x(result.bepUnits) + 10} y={chart.y(result.bepRevenue) - 8} fontSize="13" fill="currentColor">{t.breakEvenPoint}</text>
            <text x={chart.pad + 8} y={chart.y(result.fixed) - 8} fontSize="12" fill="#b45309">{t.fixedCostLine}</text>
            <text x={chart.width - 180} y={chart.y(result.fixed + result.variable * chart.maxUnits) + 18} fontSize="12" fill="#dc2626">{t.totalCostLine}</text>
            <text x={chart.width - 180} y={chart.y(result.sellingPrice * chart.maxUnits) - 10} fontSize="12" fill="#16a34a">{t.revenueLine}</text>
          </svg>
        )}
      </section>

      <section className="mt-6 rounded-2xl border bg-card p-6 text-sm text-muted-foreground"><h2 className="font-semibold text-foreground">{t.formulaTitle}</h2><p className="mt-2">{t.formula1}</p><p>{t.formula2}</p><p>{t.formula3}</p></section>
      <section className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{t.disclaimer}</section>
    </main>
  );
}
 
