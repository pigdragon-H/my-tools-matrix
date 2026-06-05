// @profile B — Calculator-YMYL gold tool · StampDutyCalculator
// 17 層金模板對標 MacroCalculator · category=legal · 印花稅計算機
import { useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";

type LocalText = { zh: string; en: string };
const l = (v: LocalText, lang: "zh" | "en") => v[lang];
const fmt = (v: number, d = 0) =>
  isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

type DocMode = "receipt" | "contract" | "property";

// 台灣印花稅率
const RATE_RECEIPT = 0.004; // 銀錢收據 0.4%
const RATE_CONTRACT = 0.001; // 承攬契據 0.1%
const RATE_PROPERTY = 0.001; // 典賣讓受分割不動產契據 0.1%

type Band = { key: string; range: LocalText; label: LocalText; desc: LocalText };

export default function StampDutyCalculator() {
  const { lang } = useLanguage();

  const ui = {
    zh: {
      heroTag: "稅務法令 · 印花稅試算",
      title: "印花稅計算機",
      subtitle: "依憑證類別計算應貼印花稅額，涵蓋銀錢收據、承攬契據與不動產契據。",
      trustTitle: "依印花稅法稅率",
      trustBody:
        "本工具依印花稅法稅率（銀錢收據 0.4%、承攬契據 0.1%、典賣讓受及分割不動產契據 0.1%）計算應納印花稅。試算僅供參考，正式申報請依稅捐稽徵機關規定。",
      quickTitle: "30 秒上手範例",
      quickBody: "點下方任一範例，立即帶入典型憑證金額，看看應貼多少印花。",
      guideTitle: "填寫指引",
      guideBody: "選擇憑證類別後，輸入憑證金額，系統依適用稅率計算應納印花稅。",
      modeLabel: "憑證類別",
      receipt: "銀錢收據",
      contract: "承攬契據",
      property: "不動產契據",
      amountLabel: "憑證金額（元）",
      calcTitle: "輸入金額",
      resultTitle: "應納印花稅",
      dutyLabel: "印花稅額",
      rateLabel: "適用稅率",
      baseLabel: "憑證金額",
      moneyUnit: "元",
      intelTitle: "結果解讀",
      intelBody: "印花稅由立據人於書立憑證時貼足，未貼或貼不足將處罰鍰；電子方式亦可採彙總繳納。",
      cmpTitle: "情境比較",
      cmpA: "範例：收據 100,000",
      cmpB: "範例：承攬 500,000",
      emoUpper: "漏貼印花，恐遭數倍罰鍰",
      emoLower: "立即試算，依法貼足印花",
      pathTitle: "下一步建議",
      pathBody: "確認稅額後，可至代售印花稅票處購買，或透過彙總繳納方式向稅捐機關申報。",
      knowTitle: "印花稅小知識",
      faqTitle: "常見問題",
      premiumTitle: "進階稅務報告（PRO）",
      premiumBody: "解鎖多憑證批次試算、彙總繳納表單與罰鍰風險評估。",
      refTitle: "相關法規與資源",
      fillA: "範例：收據 100,000",
      fillB: "範例：承攬 500,000",
      q1: "哪些憑證要貼印花稅？",
      a1: "銀錢收據、買賣動產契據、承攬契據與不動產契據等屬印花稅課稅範圍。",
      q2: "印花稅率是多少？",
      a2: "銀錢收據 0.4%、承攬契據 0.1%、不動產契據 0.1%，買賣動產契據每件定額 12 元。",
      q3: "漏貼印花會怎樣？",
      a3: "未貼或貼用不足者，除補貼外，可處應納稅額 5 至 15 倍罰鍰。",
      footer: "資料依印花稅法 · 僅供參考",
    },
    en: {
      heroTag: "Tax Law · Stamp Duty",
      title: "Stamp Duty Calculator",
      subtitle: "Compute the stamp duty payable by document type, covering monetary receipts, contracting deeds, and property deeds.",
      trustTitle: "Based on the Stamp Tax Act",
      trustBody:
        "This tool computes stamp duty under the Stamp Tax Act rates (monetary receipts 0.4%, contracting deeds 0.1%, property transfer/partition deeds 0.1%). Results are for reference; formal filing follows the tax authority's rules.",
      quickTitle: "30-Second Example",
      quickBody: "Click any example below to load a typical document amount and see the stamp duty due.",
      guideTitle: "How to Fill",
      guideBody: "Pick a document type, then enter the amount; the system applies the right rate to compute stamp duty.",
      modeLabel: "Document Type",
      receipt: "Receipt",
      contract: "Contracting Deed",
      property: "Property Deed",
      amountLabel: "Document Amount",
      calcTitle: "Enter Amount",
      resultTitle: "Stamp Duty Payable",
      dutyLabel: "Duty",
      rateLabel: "Rate",
      baseLabel: "Amount",
      moneyUnit: "NT$",
      intelTitle: "Result Interpretation",
      intelBody: "Stamp duty is affixed by the issuer when the document is made; failure to affix or under-affixing incurs fines; aggregate payment is also allowed.",
      cmpTitle: "Scenario Comparison",
      cmpA: "Example: Receipt 100,000",
      cmpB: "Example: Contract 500,000",
      emoUpper: "Missing stamps can mean multi-fold fines",
      emoLower: "Calculate now and affix duty in full",
      pathTitle: "Next Steps",
      pathBody: "After confirming the duty, buy stamp tickets at an authorized seller or file via aggregate payment with the tax authority.",
      knowTitle: "Stamp Duty Facts",
      faqTitle: "FAQ",
      premiumTitle: "Advanced Tax Report (PRO)",
      premiumBody: "Unlock multi-document batch calculation, aggregate-payment forms, and fine-risk assessment.",
      refTitle: "Related Laws & Resources",
      fillA: "Example: Receipt 100,000",
      fillB: "Example: Contract 500,000",
      q1: "Which documents require stamp duty?",
      a1: "Monetary receipts, movable-property sale deeds, contracting deeds, and property deeds fall under stamp duty.",
      q2: "What are the rates?",
      a2: "Receipts 0.4%, contracting deeds 0.1%, property deeds 0.1%; movable-property sale deeds are a fixed NT$12 each.",
      q3: "What if stamps are missing?",
      a3: "Besides affixing the shortfall, a fine of 5 to 15 times the duty due may apply.",
      footer: "Based on the Stamp Tax Act · for reference only",
    },
  } as const;

  const t = ui[lang];

  const bands: Band[] = [
    { key: "receipt", range: { zh: "0.4%", en: "0.4%" }, label: { zh: "銀錢收據", en: "Receipt" }, desc: { zh: "收受銀錢所立之單據", en: "Receipt of money" } },
    { key: "contract", range: { zh: "0.1%", en: "0.1%" }, label: { zh: "承攬契據", en: "Contracting" }, desc: { zh: "承攬工程或勞務契據", en: "Works/services deed" } },
    { key: "property", range: { zh: "0.1%", en: "0.1%" }, label: { zh: "不動產契據", en: "Property" }, desc: { zh: "典賣讓受及分割不動產", en: "Property transfer deed" } },
  ];

  const faqKeys = [
    ["q1", "a1"],
    ["q2", "a2"],
    ["q3", "a3"],
  ] as const;

  const [mode, setMode] = useState<DocMode>("receipt");
  const [amount, setAmount] = useState<number>(100000);

  const result = useMemo(() => {
    const rate = mode === "receipt" ? RATE_RECEIPT : mode === "contract" ? RATE_CONTRACT : RATE_PROPERTY;
    const duty = Math.round(amount * rate);
    return { duty, rate, base: amount };
  }, [mode, amount]);

  const fillA = () => {
    setMode("receipt");
    setAmount(100000);
  };
  const fillB = () => {
    setMode("contract");
    setAmount(500000);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 text-slate-800">
      {/* L1-Hero */}
      <header className="relative overflow-hidden rounded-[2rem] bg-[radial-gradient(120%_120%_at_0%_0%,#a855f7_0%,#6d28d9_55%,#0f172a_100%)] px-8 py-14 text-white shadow-2xl">
        <span className="inline-block rounded-full bg-white/15 px-4 py-1 text-sm font-black tracking-wide">{t.heroTag}</span>
        <h1 className="mt-5 text-4xl font-black leading-tight md:text-5xl">{t.title}</h1>
        <p className="mt-4 max-w-2xl text-lg font-medium text-purple-100">{t.subtitle}</p>
      </header>

      {/* L2-TrustIntro */}
      <section className="mt-8 rounded-[2rem] border border-purple-100 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-black text-purple-900">{t.trustTitle}</h2>
        <p className="mt-3 leading-relaxed text-slate-600">{t.trustBody}</p>
      </section>

      {/* L3-QuickStartExample */}
      <section className="mt-6 rounded-[2rem] bg-purple-50 p-8">
        <h2 className="text-xl font-black text-purple-900">{t.quickTitle}</h2>
        <p className="mt-2 text-slate-600">{t.quickBody}</p>
      </section>

      {/* L4-InputGuidance */}
      <section className="mt-6 rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-black text-slate-900">{t.guideTitle}</h2>
        <p className="mt-2 text-slate-600">{t.guideBody}</p>
      </section>

      {/* L5-CalculatorInput + L8-ScenarioComparison（雙情境範例卡寄生側欄） */}
      <section className="mt-6 grid gap-6 md:grid-cols-[1fr_auto_1fr]">
        <div className="rounded-[2rem] border border-purple-100 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-black text-purple-900">{t.calcTitle}</h2>
          <div className="mt-5">
            <label className="text-sm font-black text-slate-700">{t.modeLabel}</label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(["receipt", "contract", "property"] as DocMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`rounded-xl px-3 py-2 text-sm font-black transition ${
                    mode === m ? "bg-purple-600 text-white" : "bg-purple-50 text-purple-700"
                  }`}
                >
                  {m === "receipt" ? t.receipt : m === "contract" ? t.contract : t.property}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-5">
            <label className="text-sm font-black text-slate-700">{t.amountLabel}</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-bold focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="hidden w-px bg-slate-200 md:block" />

        {/* L8-ScenarioComparison */}
        <div className="rounded-[2rem] border border-purple-100 bg-purple-50/60 p-8">
          <h3 className="text-lg font-black text-purple-900">{t.cmpTitle}</h3>
          <button
            onClick={fillA}
            className="mt-4 w-full rounded-[2rem] border border-purple-200 bg-white p-4 text-left transition hover:shadow-md"
          >
            <p className="text-sm font-black text-purple-700">{t.cmpA}</p>
            <p className="mt-1 text-xs font-medium text-slate-500">{t.fillA}</p>
          </button>
          <button
            onClick={fillB}
            className="mt-3 w-full rounded-[2rem] border border-purple-200 bg-white p-4 text-left transition hover:shadow-md"
          >
            <p className="text-sm font-black text-purple-700">{t.cmpB}</p>
            <p className="mt-1 text-xs font-medium text-slate-500">{t.fillB}</p>
          </button>
        </div>
      </section>

      {/* L6-PrimaryResult */}
      <section className="mt-6 rounded-[2rem] bg-[radial-gradient(120%_120%_at_100%_0%,#a855f7_0%,#6d28d9_60%,#0f172a_100%)] p-8 text-white shadow-xl">
        <h2 className="text-xl font-black text-purple-100">{t.resultTitle}</h2>
        <p className="mt-3 text-4xl font-black">
          {t.moneyUnit} {fmt(result.duty)}
        </p>
        <div className="mt-5 grid grid-cols-3 gap-4">
          <div className="rounded-[2rem] bg-white/10 p-4">
            <p className="text-xs font-bold text-purple-200">{t.baseLabel}</p>
            <p className="mt-1 text-2xl font-black">{fmt(result.base)}</p>
            <p className="text-xs font-bold text-purple-200">{t.moneyUnit}</p>
          </div>
          <div className="rounded-[2rem] bg-white/10 p-4">
            <p className="text-xs font-bold text-purple-200">{t.rateLabel}</p>
            <p className="mt-1 text-2xl font-black">{fmt(result.rate * 100, 1)}%</p>
          </div>
          <div className="rounded-[2rem] bg-white/10 p-4">
            <p className="text-xs font-bold text-purple-200">{t.dutyLabel}</p>
            <p className="mt-1 text-2xl font-black">{fmt(result.duty)}</p>
            <p className="text-xs font-bold text-purple-200">{t.moneyUnit}</p>
          </div>
        </div>
      </section>

      <AdSenseWrapper showAds={true} adSlot="stamp-duty-result-intelligence" adFormat="horizontal" className="my-2" />

      {/* L7-ResultIntelligence */}
      <section className="mt-6 rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-black text-slate-900">{t.intelTitle}</h2>
        <p className="mt-2 leading-relaxed text-slate-600">{t.intelBody}</p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {bands.map((b) => (
            <div key={b.key} className="rounded-[2rem] border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm font-black text-purple-700">{l(b.range, lang)}</p>
              <p className="mt-1 text-sm font-black text-slate-800">{l(b.label, lang)}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">{l(b.desc, lang)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* L9-EmotionConversionUpper */}
      <section className="mt-6 rounded-[2rem] bg-gradient-to-br from-purple-600 to-violet-800 p-8 text-white shadow-xl">
        <h2 className="text-2xl font-black">{t.emoUpper}</h2>
        {/* L10-EmotionConversionLower */}
        <p className="mt-2 text-lg font-medium text-purple-100">{t.emoLower}</p>
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
      <AdSlot slot="stamp-duty-faq" position="inline" />

      {/* L15-AffiliateResources */}
      <section className="mt-6 rounded-[2rem] bg-purple-50 p-8">
        <h2 className="text-xl font-black text-purple-900">{t.refTitle}</h2>
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
