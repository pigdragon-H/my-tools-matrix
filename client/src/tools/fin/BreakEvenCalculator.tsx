import { useState } from "react";

const zh = {
  title: "損益平衡計算器",
  description: "計算損益平衡點、邊際貢獻與安全邊際，協助商業決策。",
  fixedCosts: "固定成本（元）",
  sellingPrice: "單位售價（元）",
  variableCost: "單位變動成本（元）",
  expectedVolume: "預期銷售量（選填）",
  currency: "貨幣",
  calculate: "計算",
  clear: "清除",
  copy: "複製結果",
  copied: "已複製！",
  results: "計算結果",
  bepUnits: "損益平衡點（單位）",
  bepRevenue: "損益平衡營收",
  contributionMargin: "邊際貢獻／單位",
  contributionRatio: "邊際貢獻率",
  safetyMargin: "安全邊際",
  expectedProfit: "預期利潤",
  scenario: "情境分析：售價提高10%",
  newBep: "新損益平衡點",
  chart: "損益平衡圖",
  fixedLine: "固定成本線",
  totalCost: "總成本線",
  totalRevenue: "總收入線",
  bepPoint: "損益平衡點",
  langBtn: "EN",
  error: "請輸入有效數字",
  errorMargin: "售價必須大於變動成本",
  example: "範例：咖啡店月固定成本 NT$150,000，每杯售價 NT$120，變動成本 NT$45",
};

const en = {
  title: "Break Even Calculator",
  description: "Calculate break-even point, contribution margin and safety margin for business planning.",
  fixedCosts: "Fixed Costs",
  sellingPrice: "Selling Price per Unit",
  variableCost: "Variable Cost per Unit",
  expectedVolume: "Expected Sales Volume (optional)",
  currency: "Currency",
  calculate: "Calculate",
  clear: "Clear",
  copy: "Copy Result",
  copied: "Copied!",
  results: "Results",
  bepUnits: "Break-Even Point (units)",
  bepRevenue: "Break-Even Revenue",
  contributionMargin: "Contribution Margin / unit",
  contributionRatio: "Contribution Margin Ratio",
  safetyMargin: "Safety Margin",
  expectedProfit: "Expected Profit",
  scenario: "Scenario: Price +10%",
  newBep: "New Break-Even Point",
  chart: "Break-Even Chart",
  fixedLine: "Fixed Cost",
  totalCost: "Total Cost",
  totalRevenue: "Total Revenue",
  bepPoint: "Break-Even",
  langBtn: "中文",
  error: "Please enter valid numbers",
  errorMargin: "Selling price must exceed variable cost",
  example: "Example: Coffee shop monthly fixed cost NT$150,000, selling price NT$120/cup, variable cost NT$45",
};

export default function BreakEvenCalculator() {
  const [lang, setLang] = useState<"zh" | "en">("zh");
  const t = lang === "zh" ? zh : en;

  // 預設範例值：咖啡店
  const [fixedCosts, setFixedCosts] = useState("150000");
  const [sellingPrice, setSellingPrice] = useState("120");
  const [variableCost, setVariableCost] = useState("45");
  const [expectedVolume, setExpectedVolume] = useState("2500");
  const [currency, setCurrency] = useState("NT$");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const fmt = (n: number) =>
    n.toLocaleString("zh-TW", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  const calculate = () => {
    setError("");
    const fc = parseFloat(fixedCosts);
    const sp = parseFloat(sellingPrice);
    const vc = parseFloat(variableCost);
    const ev = expectedVolume ? parseFloat(expectedVolume) : null;

    if (isNaN(fc) || isNaN(sp) || isNaN(vc)) {
      setError(t.error);
      return;
    }
    if (sp <= vc) {
      setError(t.errorMargin);
      return;
    }

    const cm = sp - vc;
    const cmRatio = (cm / sp) * 100;
    const bepUnits = fc / cm;
    const bepRevenue = bepUnits * sp;

    let safetyMargin = null;
    let safetyRatio = null;
    let profit = null;
    if (ev !== null && !isNaN(ev)) {
      safetyMargin = ev - bepUnits;
      safetyRatio = (safetyMargin / ev) * 100;
      profit = safetyMargin * cm;
    }

    const newSp = sp * 1.1;
    const newCm = newSp - vc;
    const newBep = fc / newCm;

    setResult({ fc, sp, vc, cm, cmRatio, bepUnits, bepRevenue, safetyMargin, safetyRatio, profit, newBep, ev });
  };

  const clear = () => {
    setFixedCosts(""); setSellingPrice(""); setVariableCost("");
    setExpectedVolume(""); setResult(null); setError("");
  };

  const copyResult = () => {
    if (!result) return;
    const text = `${t.bepUnits}: ${fmt(result.bepUnits)}\n${t.bepRevenue}: ${currency} ${fmt(result.bepRevenue)}\n${t.contributionMargin}: ${currency} ${fmt(result.cm)}\n${t.contributionRatio}: ${result.cmRatio.toFixed(2)}%`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const chartWidth = 400;
  const chartHeight = 200;
  const maxUnits = result ? result.bepUnits * 2 : 100;
  const maxVal = result ? result.bepRevenue * 2 : 100;
  const toX = (u: number) => (u / maxUnits) * chartWidth;
  const toY = (v: number) => chartHeight - (v / maxVal) * chartHeight;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{t.title}</h1>
          <p className="text-gray-500 mt-1">{t.description}</p>
        </div>
        <button
          onClick={() => setLang(lang === "zh" ? "en" : "zh")}
          className="px-3 py-1 border rounded text-sm hover:bg-gray-100"
        >
          {t.langBtn}
        </button>
      </div>

      {/* Example hint */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
        💡 {t.example}
      </div>

      {/* Input */}
      <div className="bg-white border rounded-xl p-5 space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">{t.currency}</label>
          <select
            value={currency}
            onChange={e => setCurrency(e.target.value)}
            className="mt-1 w-32 border rounded-lg p-2"
          >
            <option>NT$</option>
            <option>$</option>
            <option>€</option>
            <option>¥</option>
          </select>
        </div>
        {[
          { label: t.fixedCosts, val: fixedCosts, set: setFixedCosts, placeholder: "150000" },
          { label: t.sellingPrice, val: sellingPrice, set: setSellingPrice, placeholder: "120" },
          { label: t.variableCost, val: variableCost, set: setVariableCost, placeholder: "45" },
          { label: t.expectedVolume, val: expectedVolume, set: setExpectedVolume, placeholder: "2500" },
        ].map(({ label, val, set, placeholder }) => (
          <div key={label}>
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <input
              type="number"
              value={val}
              onChange={e => set(e.target.value)}
              placeholder={placeholder}
              className="mt-1 w-full border rounded-lg p-2"
              min="0"
            />
          </div>
        ))}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="flex gap-3">
          <button onClick={calculate} className="flex-1 bg-blue-600 text-white rounded-lg py-2 font-medium hover:bg-blue-700">
            {t.calculate}
          </button>
          <button onClick={clear} className="px-4 border rounded-lg hover:bg-gray-100">
            {t.clear}
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          <div className="bg-white border rounded-xl p-5 space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-lg">{t.results}</h2>
              <button onClick={copyResult} className="text-sm px-3 py-1 border rounded hover:bg-gray-100">
                {copied ? t.copied : t.copy}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: t.bepUnits, value: `${fmt(result.bepUnits)} ${lang === "zh" ? "杯" : "cups"}` },
                { label: t.bepRevenue, value: `${currency} ${fmt(result.bepRevenue)}` },
                { label: t.contributionMargin, value: `${currency} ${fmt(result.cm)}` },
                { label: t.contributionRatio, value: `${result.cmRatio.toFixed(1)}%` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-xl font-bold text-blue-700">{value}</p>
                </div>
              ))}
            </div>
            {result.safetyMargin !== null && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">{t.safetyMargin}</p>
                  <p className="text-xl font-bold text-green-700">
                    {fmt(result.safetyMargin)} {lang === "zh" ? "杯" : "cups"} ({result.safetyRatio.toFixed(1)}%)
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">{t.expectedProfit}</p>
                  <p className="text-xl font-bold text-green-700">{currency} {fmt(result.profit)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Chart */}
          <div className="bg-white border rounded-xl p-5">
            <h3 className="font-semibold mb-3">{t.chart}</h3>
            <svg width="100%" viewBox={`0 0 ${chartWidth} ${chartHeight + 20}`} className="overflow-visible">
              <line x1={0} y1={toY(result.fc)} x2={chartWidth} y2={toY(result.fc)}
                stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5" />
              <line x1={0} y1={toY(result.fc)} x2={chartWidth} y2={toY(result.fc + maxUnits * result.vc)}
                stroke="#f97316" strokeWidth="2" />
              <line x1={0} y1={toY(0)} x2={chartWidth} y2={toY(maxUnits * result.sp)}
                stroke="#22c55e" strokeWidth="2" />
              <circle cx={toX(result.bepUnits)} cy={toY(result.bepRevenue)} r="6" fill="#3b82f6" />
              <text x={toX(result.bepUnits) + 10} y={toY(result.bepRevenue) - 8} fontSize="11" fill="#3b82f6" fontWeight="bold">
                {t.bepPoint}
              </text>
            </svg>
            <div className="flex gap-6 text-xs mt-2 text-gray-600">
              <span className="flex items-center gap-1.5"><span className="w-5 h-0.5 bg-red-500 inline-block border-dashed"></span>{t.fixedLine}</span>
              <span className="flex items-center gap-1.5"><span className="w-5 h-0.5 bg-orange-500 inline-block"></span>{t.totalCost}</span>
              <span className="flex items-center gap-1.5"><span className="w-5 h-0.5 bg-green-500 inline-block"></span>{t.totalRevenue}</span>
            </div>
          </div>

          {/* Scenario */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <h3 className="font-semibold text-yellow-800">{t.scenario}</h3>
            <p className="text-yellow-700 mt-1">
              {t.newBep}：<strong>{fmt(result.newBep)}</strong> {lang === "zh" ? "杯" : "cups"}
              （{lang === "zh" ? "較原本少" : "reduced by"} {fmt(result.bepUnits - result.newBep)} {lang === "zh" ? "杯" : "cups"}）
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
