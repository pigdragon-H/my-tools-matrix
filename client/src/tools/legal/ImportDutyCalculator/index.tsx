// @profile B — Calculator-YMYL gold tool · ImportDutyCalculator
// 17 層金模板對標 MacroCalculator · category=legal · 進口關稅計算機
import { useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";

type LocalText = { zh: string; en: string };
const l = (v: LocalText, lang: "zh" | "en") => v[lang];
const fmt = (v: number, d = 0) =>
  isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

type DutyMode = "duty" | "total" | "cif";

// 台灣進口稅費
const VAT_RATE = 0.05; // 營業稅 5%
const TRADE_FEE = 0.0004; // 推廣貿易服務費 0.04%

type Band = { key: string; range: LocalText; label: LocalText; desc: LocalText };

export default function ImportDutyCalculator() {
  const { lang } = useLanguage();

  const ui = {
    zh: {
      heroTag: "關稅法令 · 進口稅費試算",
      title: "進口關稅計算機",
      subtitle: "依完稅價格與關稅率計算進口關稅、營業稅與推廣貿易服務費，得出進口總稅費。",
      trustTitle: "依關稅法與加值型營業稅法",
      trustBody:
        "本工具依關稅法之完稅價格（CIF）課徵關稅，並計入加值型營業稅 5% 與推廣貿易服務費 0.04%。實際稅率依貨品稅則號別而定，試算僅供參考，正式報關請依海關核定。",
      quickTitle: "30 秒上手範例",
      quickBody: "點下方任一範例，立即帶入典型進口情境，看看總稅費多少。",
      guideTitle: "填寫指引",
      guideBody: "輸入完稅價格（貨價＋運費＋保費）與適用關稅率，系統自動加總關稅、營業稅與貿易費。",
      modeLabel: "計算模式",
      duty: "僅關稅",
      total: "總稅費",
      cif: "含運估算",
      cifLabel: "完稅價格 CIF（元）",
      goodsLabel: "貨物價格（元）",
      freightLabel: "運費＋保費（元）",
      rateLabel: "關稅率（%）",
      calcTitle: "輸入進口資料",
      resultTitle: "進口稅費結果",
      dutyResult: "進口關稅",
      vatResult: "營業稅",
      feeResult: "貿易服務費",
      totalResult: "總稅費",
      moneyUnit: "元",
      intelTitle: "結果解讀",
      intelBody: "關稅以完稅價格乘稅率計算；營業稅以「完稅價格＋關稅」為基礎課徵 5%；推廣貿易服務費為完稅價格 0.04%。",
      cmpTitle: "情境比較",
      cmpA: "範例：CIF 50,000 ・ 關稅 5%",
      cmpB: "範例：CIF 200,000 ・ 關稅 10%",
      emoUpper: "低估稅費，恐影響進貨成本",
      emoLower: "立即試算，掌握真實進口成本",
      pathTitle: "下一步建議",
      pathBody: "查得貨品稅則號別與適用稅率後，可委由報關行辦理或自行向海關申報納稅。",
      knowTitle: "進口稅費小知識",
      faqTitle: "常見問題",
      premiumTitle: "進階關稅報告（PRO）",
      premiumBody: "解鎖稅則號別查詢、菸酒貨物稅加計與多筆貨物批次試算。",
      refTitle: "相關法規與資源",
      fillA: "範例：CIF 50,000 ・ 關稅 5%",
      fillB: "範例：CIF 200,000 ・ 關稅 10%",
      q1: "完稅價格怎麼算？",
      a1: "完稅價格通常為 CIF 價，即貨物成本加運費與保險費。",
      q2: "進口要繳哪些稅費？",
      a2: "一般包含進口關稅、營業稅 5% 與推廣貿易服務費 0.04%，特定貨物另有貨物稅或菸酒稅。",
      q3: "關稅率去哪查？",
      a3: "可查財政部關務署「進口稅則」依貨品稅則號別查得適用稅率。",
      footer: "資料依關稅法與營業稅法 · 僅供參考",
    },
    en: {
      heroTag: "Customs Law · Import Tax",
      title: "Import Duty Calculator",
      subtitle: "Compute import duty, VAT, and trade promotion fee from the customs value and tariff rate to get the total import tax.",
      trustTitle: "Based on Customs Act & VAT Act",
      trustBody:
        "This tool levies duty on the customs value (CIF) under the Customs Act, plus 5% VAT and a 0.04% trade promotion fee. The actual rate depends on the tariff code; results are for reference, and formal clearance follows customs assessment.",
      quickTitle: "30-Second Example",
      quickBody: "Click any example below to load a typical import scenario and see the total tax.",
      guideTitle: "How to Fill",
      guideBody: "Enter the customs value (goods + freight + insurance) and the tariff rate; the system sums duty, VAT, and trade fee.",
      modeLabel: "Mode",
      duty: "Duty Only",
      total: "Total Tax",
      cif: "From Freight",
      cifLabel: "Customs Value CIF",
      goodsLabel: "Goods Price",
      freightLabel: "Freight + Insurance",
      rateLabel: "Tariff Rate (%)",
      calcTitle: "Enter Import Data",
      resultTitle: "Import Tax Result",
      dutyResult: "Import Duty",
      vatResult: "VAT",
      feeResult: "Trade Fee",
      totalResult: "Total Tax",
      moneyUnit: "NT$",
      intelTitle: "Result Interpretation",
      intelBody: "Duty equals customs value times the rate; VAT is 5% on (customs value + duty); the trade promotion fee is 0.04% of the customs value.",
      cmpTitle: "Scenario Comparison",
      cmpA: "Example: CIF 50,000 · 5%",
      cmpB: "Example: CIF 200,000 · 10%",
      emoUpper: "Underestimating tax can hurt your cost",
      emoLower: "Calculate now and know the real import cost",
      pathTitle: "Next Steps",
      pathBody: "After finding the tariff code and rate, engage a broker or file and pay with customs yourself.",
      knowTitle: "Import Tax Facts",
      faqTitle: "FAQ",
      premiumTitle: "Advanced Customs Report (PRO)",
      premiumBody: "Unlock tariff-code lookup, tobacco/alcohol tax add-ons, and multi-item batch calculation.",
      refTitle: "Related Laws & Resources",
      fillA: "Example: CIF 50,000 · 5%",
      fillB: "Example: CIF 200,000 · 10%",
      q1: "How is the customs value computed?",
      a1: "The customs value is usually the CIF price: goods cost plus freight and insurance.",
      q2: "What taxes apply to imports?",
      a2: "Generally import duty, 5% VAT, and a 0.04% trade promotion fee; certain goods also incur commodity or tobacco/alcohol tax.",
      q3: "Where to find the tariff rate?",
      a3: "Check the Customs Administration's import tariff schedule by the goods' tariff code.",
      footer: "Based on Customs Act & VAT Act · for reference only",
    },
  } as const;

  const t = ui[lang];

  const bands: Band[] = [
    { key: "duty", range: { zh: "依稅則", en: "By code" }, label: { zh: "進口關稅", en: "Import Duty" }, desc: { zh: "完稅價格 × 關稅率", en: "CIF × tariff rate" } },
    { key: "vat", range: { zh: "5%", en: "5%" }, label: { zh: "營業稅", en: "VAT" }, desc: { zh: "(完稅價格＋關稅) × 5%", en: "(CIF + duty) × 5%" } },
    { key: "fee", range: { zh: "0.04%", en: "0.04%" }, label: { zh: "貿易服務費", en: "Trade Fee" }, desc: { zh: "完稅價格 × 0.04%", en: "CIF × 0.04%" } },
  ];

  const faqKeys = [
    ["q1", "a1"],
    ["q2", "a2"],
    ["q3", "a3"],
  ] as const;

  const [mode, setMode] = useState<DutyMode>("total");
  const [cif, setCif] = useState<number>(50000);
  const [goods, setGoods] = useState<number>(45000);
  const [freight, setFreight] = useState<number>(5000);
  const [rate, setRate] = useState<number>(5);

  const result = useMemo(() => {
    const base = mode === "cif" ? goods + freight : cif;
    const duty = Math.round(base * (rate / 100));
    const vat = Math.round((base + duty) * VAT_RATE);
    const fee = Math.round(base * TRADE_FEE);
    const total = mode === "duty" ? duty : duty + vat + fee;
    return { base, duty, vat, fee, total };
  }, [mode, cif, goods, freight, rate]);

  const fillA = () => {
    setMode("total");
    setCif(50000);
    setRate(5);
  };
  const fillB = () => {
    setMode("total");
    setCif(200000);
    setRate(10);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 text-slate-800">
      {/* L1-Hero */}
      <header className="relative overflow-hidden rounded-[2rem] bg-[radial-gradient(120%_120%_at_0%_0%,#0d9488_0%,#0f766e_55%,#0f172a_100%)] px-8 py-14 text-white shadow-2xl">
        <span className="inline-block rounded-full bg-white/15 px-4 py-1 text-sm font-black tracking-wide">{t.heroTag}</span>
        <h1 className="mt-5 text-4xl font-black leading-tight md:text-5xl">{t.title}</h1>
        <p className="mt-4 max-w-2xl text-lg font-medium text-teal-100">{t.subtitle}</p>
      </header>

      {/* L2-TrustIntro */}
      <section className="mt-8 rounded-[2rem] border border-teal-100 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-black text-teal-900">{t.trustTitle}</h2>
        <p className="mt-3 leading-relaxed text-slate-600">{t.trustBody}</p>
      </section>

      {/* L3-QuickStartExample */}
      <section className="mt-6 rounded-[2rem] bg-teal-50 p-8">
        <h2 className="text-xl font-black text-teal-900">{t.quickTitle}</h2>
        <p className="mt-2 text-slate-600">{t.quickBody}</p>
      </section>

      {/* L4-InputGuidance */}
      <section className="mt-6 rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-black text-slate-900">{t.guideTitle}</h2>
        <p className="mt-2 text-slate-600">{t.guideBody}</p>
      </section>

      {/* L5-CalculatorInput + L8-ScenarioComparison（雙情境範例卡寄生側欄） */}
      <section className="mt-6 grid gap-6 md:grid-cols-[1fr_auto_1fr]">
        <div className="rounded-[2rem] border border-teal-100 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-black text-teal-900">{t.calcTitle}</h2>
          <div className="mt-5">
            <label className="text-sm font-black text-slate-700">{t.modeLabel}</label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(["duty", "total", "cif"] as DutyMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`rounded-xl px-3 py-2 text-sm font-black transition ${
                    mode === m ? "bg-teal-600 text-white" : "bg-teal-50 text-teal-700"
                  }`}
                >
                  {m === "duty" ? t.duty : m === "total" ? t.total : t.cif}
                </button>
              ))}
            </div>
          </div>
          {mode === "cif" ? (
            <>
              <div className="mt-5">
                <label className="text-sm font-black text-slate-700">{t.goodsLabel}</label>
                <input
                  type="number"
                  value={goods}
                  onChange={(e) => setGoods(Number(e.target.value))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-bold focus:border-teal-500 focus:outline-none"
                />
              </div>
              <div className="mt-5">
                <label className="text-sm font-black text-slate-700">{t.freightLabel}</label>
                <input
                  type="number"
                  value={freight}
                  onChange={(e) => setFreight(Number(e.target.value))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-bold focus:border-teal-500 focus:outline-none"
                />
              </div>
            </>
          ) : (
            <div className="mt-5">
              <label className="text-sm font-black text-slate-700">{t.cifLabel}</label>
              <input
                type="number"
                value={cif}
                onChange={(e) => setCif(Number(e.target.value))}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-bold focus:border-teal-500 focus:outline-none"
              />
            </div>
          )}
          <div className="mt-5">
            <label className="text-sm font-black text-slate-700">{t.rateLabel}</label>
            <input
              type="number"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-bold focus:border-teal-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="hidden w-px bg-slate-200 md:block" />

        {/* L8-ScenarioComparison */}
        <div className="rounded-[2rem] border border-teal-100 bg-teal-50/60 p-8">
          <h3 className="text-lg font-black text-teal-900">{t.cmpTitle}</h3>
          <button
            onClick={fillA}
            className="mt-4 w-full rounded-[2rem] border border-teal-200 bg-white p-4 text-left transition hover:shadow-md"
          >
            <p className="text-sm font-black text-teal-700">{t.cmpA}</p>
            <p className="mt-1 text-xs font-medium text-slate-500">{t.fillA}</p>
          </button>
          <button
            onClick={fillB}
            className="mt-3 w-full rounded-[2rem] border border-teal-200 bg-white p-4 text-left transition hover:shadow-md"
          >
            <p className="text-sm font-black text-teal-700">{t.cmpB}</p>
            <p className="mt-1 text-xs font-medium text-slate-500">{t.fillB}</p>
          </button>
        </div>
      </section>

      {/* L6-PrimaryResult */}
      <section className="mt-6 rounded-[2rem] bg-[radial-gradient(120%_120%_at_100%_0%,#0d9488_0%,#0f766e_60%,#0f172a_100%)] p-8 text-white shadow-xl">
        <h2 className="text-xl font-black text-teal-100">{t.resultTitle}</h2>
        <p className="mt-3 text-4xl font-black">
          {t.moneyUnit} {fmt(result.total)}
        </p>
        <div className="mt-5 grid grid-cols-3 gap-4">
          <div className="rounded-[2rem] bg-white/10 p-4">
            <p className="text-xs font-bold text-teal-200">{t.dutyResult}</p>
            <p className="mt-1 text-2xl font-black">{fmt(result.duty)}</p>
            <p className="text-xs font-bold text-teal-200">{t.moneyUnit}</p>
          </div>
          <div className="rounded-[2rem] bg-white/10 p-4">
            <p className="text-xs font-bold text-teal-200">{t.vatResult}</p>
            <p className="mt-1 text-2xl font-black">{fmt(result.vat)}</p>
            <p className="text-xs font-bold text-teal-200">{t.moneyUnit}</p>
          </div>
          <div className="rounded-[2rem] bg-white/10 p-4">
            <p className="text-xs font-bold text-teal-200">{t.feeResult}</p>
            <p className="mt-1 text-2xl font-black">{fmt(result.fee)}</p>
            <p className="text-xs font-bold text-teal-200">{t.moneyUnit}</p>
          </div>
        </div>
      </section>

      <AdSenseWrapper showAds={true} adSlot="import-duty-result-intelligence" adFormat="horizontal" className="my-2" />

      {/* L7-ResultIntelligence */}
      <section className="mt-6 rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-black text-slate-900">{t.intelTitle}</h2>
        <p className="mt-2 leading-relaxed text-slate-600">{t.intelBody}</p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {bands.map((b) => (
            <div key={b.key} className="rounded-[2rem] border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm font-black text-teal-700">{l(b.range, lang)}</p>
              <p className="mt-1 text-sm font-black text-slate-800">{l(b.label, lang)}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">{l(b.desc, lang)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* L9-EmotionConversionUpper */}
      <section className="mt-6 rounded-[2rem] bg-gradient-to-br from-teal-600 to-emerald-800 p-8 text-white shadow-xl">
        <h2 className="text-2xl font-black">{t.emoUpper}</h2>
        {/* L10-EmotionConversionLower */}
        <p className="mt-2 text-lg font-medium text-teal-100">{t.emoLower}</p>
      </section>

      {/* L11-DecisionPath */}
      <section className="mt-6 rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-black text-slate-900">{t.pathTitle}</h2>
        <p className="mt-2 leading-relaxed text-slate-600">{t.pathBody}</p>
      </section>

      {/* L12-Knowledge */}
      <section className="mt-6 rounded-[2rem] bg-slate-50 p-8">
        <h2 className="text-xl font-black text-slate-900">{t.knowTitle}</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {bands.map((b) => (
            <div key={b.key} className="rounded-[2rem] bg-white p-4 shadow-sm">
              <p className="text-sm font-black text-slate-800">{l(b.label, lang)}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">{l(b.desc, lang)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* L13-FAQ */}
      <section className="mt-6 rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-black text-slate-900">{t.faqTitle}</h2>
        <div className="mt-4 space-y-4">
          {faqKeys.map(([q, a]) => (
            <div key={q} className="rounded-[2rem] bg-slate-50 p-5">
              <p className="font-black text-slate-800">{t[q]}</p>
              <p className="mt-1 text-sm text-slate-600">{t[a]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* L14-FAQAfterAdSlot */}
      <AdSlot slot="import-duty-faq" position="inline" />

      {/* L15-AffiliateResources */}
      <section className="mt-6 rounded-[2rem] bg-teal-50 p-8">
        <h2 className="text-xl font-black text-teal-900">{t.refTitle}</h2>
      </section>

      {/* L16-PremiumGate */}
      <PremiumGate plan="PRO">
        <section className="mt-6 rounded-[2rem] border border-amber-200 bg-amber-50 p-8">
          <h2 className="text-xl font-black text-amber-900">{t.premiumTitle}</h2>
          <p className="mt-2 text-amber-800">{t.premiumBody}</p>
        </section>
      </PremiumGate>

      {/* L17-TrustRelatedReferences */}
      <footer className="mt-6 rounded-[2rem] border border-slate-100 bg-white p-6 text-center text-xs text-slate-400">
        {t.footer}
      </footer>
    </div>
  );
}
