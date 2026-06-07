import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
const l = (v: LocalText, lang: Lang) => v[lang];

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return 0;
  return h * 60 + m;
}

export default function HoursCalculator() {
  const { lang, setLang } = useLanguage();
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("18:00");
  const [breakMin, setBreakMin] = useState(60);
  const [rate, setRate] = useState(200);
  const [daysPerWeek, setDaysPerWeek] = useState(5);

  const result = useMemo(() => {
    let span = toMinutes(end) - toMinutes(start);
    if (span < 0) span += 24 * 60; // overnight shift
    const worked = Math.max(0, span - breakMin);
    const hours = worked / 60;
    const regular = Math.min(hours, 8);
    const overtime = Math.max(0, hours - 8);
    const dailyPay = regular * rate + overtime * rate * 1.34;
    const weeklyHours = hours * daysPerWeek;
    const weeklyPay = dailyPay * daysPerWeek;
    return {
      hours: Math.round(hours * 100) / 100,
      regular: Math.round(regular * 100) / 100,
      overtime: Math.round(overtime * 100) / 100,
      dailyPay: Math.round(dailyPay),
      weeklyHours: Math.round(weeklyHours * 10) / 10,
      weeklyPay: Math.round(weeklyPay),
    };
  }, [start, end, breakMin, rate, daysPerWeek]);

  const outputText = useMemo(() => {
    const rows: [LocalText, string][] = [
      [{ zh: "上班時間", en: "Clock in" }, start],
      [{ zh: "下班時間", en: "Clock out" }, end],
      [{ zh: "休息(分)", en: "Break (min)" }, `${breakMin}`],
      [{ zh: "當日總工時", en: "Daily hours" }, `${result.hours}`],
      [{ zh: "正常工時", en: "Regular hours" }, `${result.regular}`],
      [{ zh: "加班工時", en: "Overtime hours" }, `${result.overtime}`],
      [{ zh: "當日薪資", en: "Daily pay" }, `${result.dailyPay}`],
      [{ zh: "週總工時", en: "Weekly hours" }, `${result.weeklyHours}`],
      [{ zh: "週薪資", en: "Weekly pay" }, `${result.weeklyPay}`],
    ];
    return rows.map(([label, val]) => `${l(label, lang).padEnd(18)}: ${val}`).join("\n");
  }, [start, end, breakMin, result, lang]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-orange-50">
      {/* L1 Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{ background: "radial-gradient(circle at 30% 20%, #fb923c 0%, transparent 55%)" }}
        />
        <div className="relative mx-auto max-w-7xl px-6 py-14">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
            {l({ zh: "工時計算器", en: "Hours Calculator" }, lang)}
          </h1>
          <p className="mt-4 max-w-2xl text-lg font-black text-slate-600">
            {l(
              {
                zh: "計算上下班時間扣除休息後的總工時、加班與週薪，精算考勤與薪資。",
                en: "Calculate total work hours from clock-in/out minus breaks, plus overtime and weekly pay for accurate timesheets.",
              },
              lang
            )}
          </p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setLang("zh")}
              className={`rounded-xl px-4 py-2 font-black ${lang === "zh" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`}
            >
              {l({ zh: "中文", en: "Chinese" }, lang)}
            </button>
            <button
              onClick={() => setLang("en")}
              className={`rounded-xl px-4 py-2 font-black ${lang === "en" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`}
            >
              EN
            </button>
          </div>
        </div>
      </section>

      <AdSenseWrapper showAds={true} adSlot="hours-top" adFormat="horizontal" className="my-2" />

      <div className="mx-auto max-w-7xl px-6 pb-20">
        {/* L2 TrustIntro */}
        <section className="mt-8 rounded-[2rem] bg-white/80 p-6 shadow-lg">
          <h2 className="text-2xl font-black text-slate-900">
            {l({ zh: "為什麼需要工時計算器？", en: "Why an hours calculator?" }, lang)}
          </h2>
          <p className="mt-3 font-black leading-relaxed text-slate-600">
            {l(
              {
                zh: "手動計算工時容易出錯：跨午休、跨夜班、加班費率都讓人混淆。少算 30 分鐘，一個月就是好幾個小時的薪資差距。本工具自動扣除休息時間、區分正常工時與加班，並換算當日與每週薪資。所有計算在本地完成，不上傳任何資料。",
                en: "Manual hour math is error-prone: lunch breaks, overnight shifts and overtime rates all cause confusion. A 30-minute miss adds up to hours of pay over a month. This tool auto-deducts breaks, separates regular from overtime hours, and computes daily and weekly pay. Everything runs locally with no data uploaded.",
              },
              lang
            )}
          </p>
        </section>

        {/* L3 QuickStartExample */}
        <section className="mt-8">
          <h2 className="text-2xl font-black text-slate-900">{l({ zh: "快速上手", en: "Quick start" }, lang)}</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <button
              onClick={() => { setStart("09:00"); setEnd("18:00"); setBreakMin(60); }}
              className="rounded-xl bg-white p-4 text-left font-black shadow-sm transition hover:shadow-md"
            >
              {l({ zh: "範例：09:00–18:00、休息 60 分 → 8 小時", en: "Example: 09:00–18:00, 60 min break → 8 hours" }, lang)}
            </button>
            <button
              onClick={() => { setStart("08:30"); setEnd("20:00"); setBreakMin(60); }}
              className="rounded-xl bg-white p-4 text-left font-black shadow-sm transition hover:shadow-md"
            >
              {l({ zh: "範例：08:30–20:00、休息 60 分 → 含加班", en: "Example: 08:30–20:00, 60 min break → with overtime" }, lang)}
            </button>
          </div>
        </section>

        {/* L4 InputGuidance */}
        <section className="mt-8 rounded-[2rem] bg-amber-50 p-6 font-black">
          <h2 className="text-2xl font-black text-slate-900">{l({ zh: "輸入說明", en: "Input guidance" }, lang)}</h2>
          <p className="mt-3 font-black leading-relaxed text-slate-600">
            {l(
              {
                zh: "輸入上班與下班時間(24 小時制)、休息分鐘數、時薪與每週工作天數。若下班時間早於上班(跨夜班)，系統會自動加上一天。超過 8 小時的部分以 1.34 倍加班費率計算，做為參考。",
                en: "Enter clock-in and clock-out times (24-hour), break minutes, hourly rate and days per week. If clock-out is earlier than clock-in (overnight shift) a day is added automatically. Hours beyond 8 use a 1.34x overtime rate as a reference.",
              },
              lang
            )}
          </p>
        </section>

        {/* L5 CalculatorInput */}
        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_auto]">
          <div className="rounded-[2rem] bg-white p-6 shadow-lg">
            <h2 className="text-2xl font-black text-slate-900">{l({ zh: "輸入", en: "Input" }, lang)}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <label className="block font-black">
                <span className="text-sm font-black text-slate-700">{l({ zh: "上班時間", en: "Clock in" }, lang)}</span>
                <input
                  type="time"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-3 font-black"
                />
              </label>
              <label className="block font-black">
                <span className="text-sm font-black text-slate-700">{l({ zh: "下班時間", en: "Clock out" }, lang)}</span>
                <input
                  type="time"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-3 font-black"
                />
              </label>
              <label className="block font-black">
                <span className="text-sm font-black text-slate-700">{l({ zh: "休息(分)", en: "Break (min)" }, lang)}</span>
                <input
                  type="number"
                  value={breakMin}
                  onChange={(e) => setBreakMin(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-3 font-black"
                />
              </label>
              <label className="block font-black">
                <span className="text-sm font-black text-slate-700">{l({ zh: "時薪", en: "Hourly rate" }, lang)}</span>
                <input
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-3 font-black"
                />
              </label>
              <label className="block font-black">
                <span className="text-sm font-black text-slate-700">{l({ zh: "每週天數", en: "Days/week" }, lang)}</span>
                <input
                  type="number"
                  value={daysPerWeek}
                  onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-3 font-black"
                />
              </label>
            </div>
          </div>
          <div className="rounded-[2rem] bg-orange-50 p-6 shadow-lg lg:w-64">
            <h3 className="text-lg font-black text-slate-900">{l({ zh: "當日工時", en: "Daily hours" }, lang)}</h3>
            <p className="mt-2 text-4xl font-black text-amber-600">{result.hours}</p>
            <p className="mt-1 font-black text-slate-600">{l({ zh: "小時", en: "hours" }, lang)}</p>
          </div>
        </section>

        {/* L6 PrimaryResult */}
        <section className="mt-8 rounded-[2rem] bg-slate-950 p-6 shadow-lg">
          <h2 className="text-2xl font-black text-white">{l({ zh: "換算結果", en: "Result" }, lang)}</h2>
          <pre className="mt-2 max-h-72 overflow-auto rounded-2xl bg-slate-950 p-4 font-mono text-xs text-emerald-200">{outputText}</pre>
        </section>

        {/* L7 ResultIntelligence */}
        <section className="mt-8 rounded-[2rem] bg-white/80 p-6 shadow-lg">
          <h2 className="text-2xl font-black text-slate-900">{l({ zh: "結果分析", en: "Result analysis" }, lang)}</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl bg-amber-50 p-4 font-black">
              <p className="text-sm font-black text-slate-500">{l({ zh: "加班工時", en: "Overtime" }, lang)}</p>
              <p className="mt-1 text-xl font-black text-slate-900">{result.overtime}</p>
            </div>
            <div className="rounded-xl bg-orange-50 p-4 font-black">
              <p className="text-sm font-black text-slate-500">{l({ zh: "當日薪資", en: "Daily pay" }, lang)}</p>
              <p className="mt-1 text-xl font-black text-slate-900">{result.dailyPay}</p>
            </div>
            <div className="rounded-xl bg-yellow-50 p-4 font-black">
              <p className="text-sm font-black text-slate-500">{l({ zh: "週薪資", en: "Weekly pay" }, lang)}</p>
              <p className="mt-1 text-xl font-black text-slate-900">{result.weeklyPay}</p>
            </div>
          </div>
        </section>

        {/* L8 ScenarioComparison */}
        <section className="mt-8 rounded-[2rem] bg-white/80 p-6 shadow-lg">
          <h2 className="text-2xl font-black text-slate-900">{l({ zh: "情境比較", en: "Scenario comparison" }, lang)}</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl bg-amber-50 p-4 font-black">
              <p className="font-black text-slate-900">{l({ zh: "含休息 vs 不含休息", en: "With vs without breaks" }, lang)}</p>
              <p className="mt-2 font-black text-slate-600">
                {l(
                  {
                    zh: "多數工時是「在場時間」扣除無薪休息。09:00 到 18:00 看似 9 小時，扣掉 1 小時午休其實是 8 小時的計薪工時。",
                    en: "Most pay is presence time minus unpaid breaks. 09:00 to 18:00 looks like 9 hours, but minus a 1-hour lunch it is 8 paid hours.",
                  },
                  lang
                )}
              </p>
              <p className="mt-2 font-black text-amber-700">{l({ zh: "建議：確認休息是否計薪", en: "Tip: confirm if breaks are paid" }, lang)}</p>
            </div>
            <div className="rounded-xl bg-orange-50 p-4 font-black">
              <p className="font-black text-slate-900">{l({ zh: "正常工時 vs 加班", en: "Regular vs overtime" }, lang)}</p>
              <p className="mt-2 font-black text-slate-600">
                {l(
                  {
                    zh: "超過 8 小時通常以較高費率計算加班費。本工具以 1.34 倍為參考，實際費率依當地勞動法規而定。",
                    en: "Hours beyond 8 usually pay a higher overtime rate. This tool uses 1.34x as a reference; actual rates depend on local labor law.",
                  },
                  lang
                )}
              </p>
              <p className="mt-2 font-black text-orange-700">{l({ zh: "建議：依當地法規調整費率", en: "Tip: adjust rate to local law" }, lang)}</p>
            </div>
          </div>
        </section>

        {/* L9 EmotionConversion Upper */}
        <section className="mt-8 rounded-[2rem] bg-gradient-to-r from-amber-100 to-orange-100 p-6 font-black">
          <h2 className="text-2xl font-black text-slate-900">{l({ zh: "每一分鐘都是你的時間", en: "Every minute is your time" }, lang)}</h2>
          <p className="mt-3 font-black leading-relaxed text-slate-700">
            {l(
              {
                zh: "工時計算不只是數字，而是你付出的時間是否被正確記錄與報酬。每天少算 15 分鐘，一個月就被無償佔用 5 小時。清楚掌握自己的工時，是維護勞動權益最基本的一步。",
                en: "Tracking hours is not just numbers — it is whether your time is correctly recorded and paid. Missing 15 minutes daily means 5 unpaid hours a month. Knowing your own hours is the most basic step in protecting your labor rights.",
              },
              lang
            )}
          </p>
        </section>

        {/* L10 EmotionConversion Lower */}
        <section className="mt-8 rounded-[2rem] bg-gradient-to-r from-orange-100 to-yellow-100 p-6 font-black">
          <h2 className="text-2xl font-black text-slate-900">{l({ zh: "記錯工時的代價", en: "The cost of wrong records" }, lang)}</h2>
          <p className="mt-3 font-black leading-relaxed text-slate-700">
            {l(
              {
                zh: "考勤紀錄一旦出錯，加班費可能被低估、超時工作被忽略。對雇主而言，錯誤的工時統計也可能造成薪資成本失控與合規風險。用一致的方法計算工時，雙方都受益，爭議也更少。",
                en: "Once timesheets are wrong, overtime may be underpaid and excessive hours overlooked. For employers, faulty hour totals risk runaway payroll costs and compliance issues. A consistent method benefits both sides and reduces disputes.",
              },
              lang
            )}
          </p>
        </section>

        {/* L11 DecisionPath */}
        <section className="mt-8 rounded-[2rem] bg-white/80 p-6 shadow">
          <h2 className="text-2xl font-black text-slate-900">{l({ zh: "決策路徑", en: "Decision path" }, lang)}</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl bg-amber-50 p-4 font-black">
              <p className="text-3xl font-black text-amber-600">1</p>
              <p className="mt-2 font-black text-slate-700">{l({ zh: "休息計薪嗎？→ 調整休息分鐘數", en: "Breaks paid? → adjust break minutes" }, lang)}</p>
            </div>
            <div className="rounded-xl bg-orange-50 p-4 font-black">
              <p className="text-3xl font-black text-orange-600">2</p>
              <p className="mt-2 font-black text-slate-700">{l({ zh: "超過 8 小時？→ 確認加班費率", en: "Over 8 hours? → confirm overtime rate" }, lang)}</p>
            </div>
            <div className="rounded-xl bg-yellow-50 p-4 font-black">
              <p className="text-3xl font-black text-yellow-600">3</p>
              <p className="mt-2 font-black text-slate-700">{l({ zh: "要估週薪？→ 設定每週天數", en: "Need weekly pay? → set days per week" }, lang)}</p>
            </div>
          </div>
        </section>

        {/* L12 Knowledge */}
        <section className="mt-8 rounded-[2rem] bg-white/80 p-6 shadow-lg">
          <h2 className="text-2xl font-black text-slate-900">{l({ zh: "知識庫", en: "Knowledge" }, lang)}</h2>
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="font-black text-slate-900">{l({ zh: "工時如何計算", en: "How hours are calculated" }, lang)}</h3>
              <p className="mt-1 font-black text-slate-600">
                {l(
                  {
                    zh: "總工時 = 下班時間 − 上班時間 − 休息分鐘。跨夜班時下班時間會自動加 24 小時，避免出現負數。",
                    en: "Total hours = clock-out − clock-in − break minutes. For overnight shifts, clock-out gets 24 hours added to avoid negatives.",
                  },
                  lang
                )}
              </p>
            </div>
            <div>
              <h3 className="font-black text-slate-900">{l({ zh: "加班費率", en: "Overtime rate" }, lang)}</h3>
              <p className="mt-1 font-black text-slate-600">
                {l(
                  {
                    zh: "許多地區規定加班費為時薪的 1.33–1.5 倍，且分級距。本工具以 1.34 倍做為單一參考，實際請依當地勞基法。",
                    en: "Many regions set overtime at 1.33–1.5x the hourly rate with tiers. This tool uses 1.34x as a single reference; follow local labor law in practice.",
                  },
                  lang
                )}
              </p>
            </div>
            <div>
              <h3 className="font-black text-slate-900">{l({ zh: "週工時上限", en: "Weekly hour limits" }, lang)}</h3>
              <p className="mt-1 font-black text-slate-600">
                {l(
                  {
                    zh: "多數地區設有每週工時上限(如 40 或 48 小時)與加班上限。超時應額外補償並注意健康與合規。",
                    en: "Most regions cap weekly hours (e.g. 40 or 48) and overtime. Excess should be compensated, with attention to health and compliance.",
                  },
                  lang
                )}
              </p>
            </div>
          </div>
        </section>

        {/* L13 FAQ */}
        <section className="mt-8 rounded-[2rem] bg-white/80 p-6 shadow-lg">
          <h2 className="text-2xl font-black text-slate-900">{l({ zh: "常見問題", en: "FAQ" }, lang)}</h2>
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="font-black text-slate-900">{l({ zh: "支援跨夜班嗎？", en: "Does it support overnight shifts?" }, lang)}</h3>
              <p className="mt-1 font-black text-slate-600">
                {l({ zh: "支援。若下班時間早於上班時間，系統會自動視為跨日並加上 24 小時。", en: "Yes. If clock-out is earlier than clock-in, it is treated as crossing midnight and 24 hours are added." }, lang)}
              </p>
            </div>
            <div>
              <h3 className="font-black text-slate-900">{l({ zh: "加班費率可以改嗎？", en: "Can I change the overtime rate?" }, lang)}</h3>
              <p className="mt-1 font-black text-slate-600">
                {l({ zh: "本工具以固定 1.34 倍做為參考估算。PRO 版可自訂多級加班費率與假日費率。", en: "This tool uses a fixed 1.34x reference. The PRO version supports custom multi-tier and holiday overtime rates." }, lang)}
              </p>
            </div>
            <div>
              <h3 className="font-black text-slate-900">{l({ zh: "計算結果可作為正式薪資嗎？", en: "Is the result official payroll?" }, lang)}</h3>
              <p className="mt-1 font-black text-slate-600">
                {l({ zh: "僅供個人估算參考。正式薪資應依雇主考勤系統與當地勞動法規為準。", en: "It is for personal estimation only. Official pay should follow the employer's timekeeping system and local labor law." }, lang)}
              </p>
            </div>
          </div>
        </section>

        {/* L14 FAQ After Ad Slot */}
        <AdSlot slot="hours-faq" position="inline" />

        {/* L15 AffiliateResources */}
        <section className="mt-8 rounded-[2rem] bg-white/80 p-6 shadow-lg">
          <h2 className="text-2xl font-black text-slate-900">{l({ zh: "推薦資源", en: "Recommended resources" }, lang)}</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto]">
            <a href="https://toggl.com" className="block rounded-xl bg-amber-50 p-4 font-black text-slate-700 hover:bg-amber-100">
              {l({ zh: "Toggl Track 時間追蹤", en: "Toggl Track time tracking" }, lang)}
            </a>
            <a href="https://clockify.me" className="block rounded-xl bg-orange-50 p-4 font-black text-slate-700 hover:bg-orange-100">
              {l({ zh: "Clockify 免費考勤工具", en: "Clockify free timesheet tool" }, lang)}
            </a>
          </div>
        </section>
        <AdSlot slot="hours-aff" position="inline" />

        {/* L16 PremiumGate */}
        <section className="mt-8">
          <PremiumGate plan="PRO">
            <div className="rounded-[2rem] bg-gradient-to-r from-amber-600 to-orange-600 p-6 text-white">
              <h2 className="text-2xl font-black">{l({ zh: "升級 PRO 解鎖", en: "Upgrade PRO to unlock" }, lang)}</h2>
              <p className="mt-2 font-black">
                {l(
                  {
                    zh: "多日考勤表、自訂多級加班與假日費率、月薪與稅後估算、匯出 CSV 報表、無廣告體驗。",
                    en: "Multi-day timesheets, custom multi-tier overtime and holiday rates, monthly and after-tax estimates, CSV export, and an ad-free experience.",
                  },
                  lang
                )}
              </p>
            </div>
          </PremiumGate>
        </section>

        <AdSlot slot="hours-premium" position="inline" />
        <AdSlot slot="hours-bottom" position="inline" />
        <AdSenseWrapper showAds={true} adSlot="hours-foot" adFormat="horizontal" className="my-2" />

        {/* L17 TrustRelatedReferences */}
        <section className="mt-8 rounded-[2rem] bg-white/80 p-6 shadow-lg">
          <h2 className="text-2xl font-black text-slate-900">{l({ zh: "參考來源", en: "References" }, lang)}</h2>
          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
            <p className="font-black text-slate-600">• International Labour Organization. Working Time Standards.</p>
            <p className="font-black text-slate-600">• U.S. Dept. of Labor. Fair Labor Standards Act (FLSA) Overtime.</p>
            <p className="font-black text-slate-600">{l({ zh: "• 勞動部. 勞動基準法 — 工時與加班費規定.", en: "• Ministry of Labor. Labor Standards Act — Working Hours and Overtime." }, lang)}</p>
            <p className="font-black text-slate-600">• OECD. (2023). Average Annual Hours Worked.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
