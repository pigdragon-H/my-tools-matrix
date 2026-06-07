import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
const l = (v: LocalText, lang: Lang) => v[lang];

function workdaysBetween(start: Date, end: Date): number {
  if (end <= start) return 0;
  let count = 0;
  const d = new Date(start);
  d.setHours(0, 0, 0, 0);
  const last = new Date(end);
  last.setHours(0, 0, 0, 0);
  while (d < last) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) count++;
  }
  return count;
}

export default function DeadlineCountdownCalculator() {
  const { lang, setLang } = useLanguage();
  const today = new Date();
  const defaultDeadline = new Date(today.getTime() + 30 * 86400000).toISOString().slice(0, 10);
  const [deadline, setDeadline] = useState(defaultDeadline);
  const [totalUnits, setTotalUnits] = useState(120);
  const [doneUnits, setDoneUnits] = useState(20);

  const result = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const end = new Date(deadline + "T00:00:00");
    const ms = end.getTime() - now.getTime();
    const totalDays = Math.max(0, Math.ceil(ms / 86400000));
    const workdays = workdaysBetween(now, end);
    const remaining = Math.max(0, totalUnits - doneUnits);
    const perDay = totalDays > 0 ? remaining / totalDays : remaining;
    const perWorkday = workdays > 0 ? remaining / workdays : remaining;
    const progress = totalUnits > 0 ? Math.min(100, (doneUnits / totalUnits) * 100) : 0;
    const passed = totalDays <= 0;
    return {
      totalDays,
      workdays,
      remaining,
      perDay: Math.round(perDay * 100) / 100,
      perWorkday: Math.round(perWorkday * 100) / 100,
      progress: Math.round(progress * 10) / 10,
      passed,
    };
  }, [deadline, totalUnits, doneUnits]);

  const outputText = useMemo(() => {
    const rows: [LocalText, string][] = [
      [{ zh: "截止日", en: "Deadline" }, deadline],
      [{ zh: "剩餘天數", en: "Days remaining" }, `${result.totalDays}`],
      [{ zh: "剩餘工作日", en: "Workdays remaining" }, `${result.workdays}`],
      [{ zh: "剩餘工作量", en: "Remaining units" }, `${result.remaining}`],
      [{ zh: "每日所需", en: "Needed per day" }, `${result.perDay}`],
      [{ zh: "每工作日所需", en: "Needed per workday" }, `${result.perWorkday}`],
      [{ zh: "目前進度", en: "Current progress" }, `${result.progress}%`],
    ];
    return rows.map(([label, val]) => `${l(label, lang).padEnd(20)}: ${val}`).join("\n");
  }, [deadline, result, lang]);

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
            {l({ zh: "截止日倒數計算器", en: "Deadline Countdown Calculator" }, lang)}
          </h1>
          <p className="mt-4 max-w-2xl text-lg font-black text-slate-600">
            {l(
              {
                zh: "計算距離截止日的剩餘天數、工作日與每日所需進度，掌握專案排程節奏。",
                en: "Calculate days and workdays to your deadline plus the daily pace required, to stay on schedule.",
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

      <AdSenseWrapper showAds={true} adSlot="deadline-top" adFormat="horizontal" className="my-2" />

      <div className="mx-auto max-w-7xl px-6 pb-20">
        {/* L2 TrustIntro */}
        <section className="mt-8 rounded-[2rem] bg-white/80 p-6 shadow-lg">
          <h2 className="text-2xl font-black text-slate-900">
            {l({ zh: "為什麼需要截止日倒數？", en: "Why a deadline countdown?" }, lang)}
          </h2>
          <p className="mt-3 font-black leading-relaxed text-slate-600">
            {l(
              {
                zh: "專案延誤往往不是因為工作量太大，而是因為沒有把總量拆解成每天可執行的進度。看似「還有一個月」其實扣掉週末與已用時間後，每天的實際負荷可能遠超預期。本工具把截止日換算成剩餘天數、工作日與每日所需單位，讓你及早調整節奏。所有計算在本地完成。",
                en: "Projects slip not because the workload is large, but because the total is never broken into a daily executable pace. \"A month left\" can hide a heavy real daily load once weekends and elapsed time are removed. This tool converts the deadline into days, workdays and required units per day so you can adjust early. All calculations run locally.",
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
              onClick={() => { setTotalUnits(120); setDoneUnits(20); }}
              className="rounded-xl bg-white p-4 text-left font-black shadow-sm transition hover:shadow-md"
            >
              {l({ zh: "範例：120 單位、已完成 20 → 看每日所需", en: "Example: 120 units, 20 done → see daily pace" }, lang)}
            </button>
            <button
              onClick={() => { setTotalUnits(40); setDoneUnits(0); }}
              className="rounded-xl bg-white p-4 text-left font-black shadow-sm transition hover:shadow-md"
            >
              {l({ zh: "範例：40 單位、尚未開始 → 看工作日負荷", en: "Example: 40 units, not started → workday load" }, lang)}
            </button>
          </div>
        </section>

        {/* L4 InputGuidance */}
        <section className="mt-8 rounded-[2rem] bg-amber-50 p-6 font-black">
          <h2 className="text-2xl font-black text-slate-900">{l({ zh: "輸入說明", en: "Input guidance" }, lang)}</h2>
          <p className="mt-3 font-black leading-relaxed text-slate-600">
            {l(
              {
                zh: "選擇截止日期，輸入專案的總工作量單位(可以是頁數、任務數、小時數)與目前已完成的數量。系統會排除週末計算剩餘工作日，並算出每日與每工作日所需的進度。",
                en: "Pick a deadline date, enter the total workload in units (pages, tasks, hours) and how many you have completed. The tool excludes weekends to count workdays and computes the pace needed per calendar day and per workday.",
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
                <span className="text-sm font-black text-slate-700">{l({ zh: "截止日期", en: "Deadline date" }, lang)}</span>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-3 font-black"
                />
              </label>
              <label className="block font-black">
                <span className="text-sm font-black text-slate-700">{l({ zh: "總工作量單位", en: "Total units" }, lang)}</span>
                <input
                  type="number"
                  value={totalUnits}
                  onChange={(e) => setTotalUnits(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-3 font-black"
                />
              </label>
              <label className="block font-black">
                <span className="text-sm font-black text-slate-700">{l({ zh: "已完成單位", en: "Completed units" }, lang)}</span>
                <input
                  type="number"
                  value={doneUnits}
                  onChange={(e) => setDoneUnits(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-3 font-black"
                />
              </label>
            </div>
          </div>
          <div className="rounded-[2rem] bg-orange-50 p-6 shadow-lg lg:w-64">
            <h3 className="text-lg font-black text-slate-900">{l({ zh: "剩餘天數", en: "Days left" }, lang)}</h3>
            <p className="mt-2 text-4xl font-black text-amber-600">{result.totalDays}</p>
            <p className="mt-1 font-black text-slate-600">{l({ zh: "天", en: "days" }, lang)}</p>
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
              <p className="text-sm font-black text-slate-500">{l({ zh: "每日所需", en: "Per day" }, lang)}</p>
              <p className="mt-1 text-xl font-black text-slate-900">{result.perDay}</p>
            </div>
            <div className="rounded-xl bg-orange-50 p-4 font-black">
              <p className="text-sm font-black text-slate-500">{l({ zh: "每工作日所需", en: "Per workday" }, lang)}</p>
              <p className="mt-1 text-xl font-black text-slate-900">{result.perWorkday}</p>
            </div>
            <div className="rounded-xl bg-yellow-50 p-4 font-black">
              <p className="text-sm font-black text-slate-500">{l({ zh: "目前進度", en: "Progress" }, lang)}</p>
              <p className="mt-1 text-xl font-black text-slate-900">{result.progress}%</p>
            </div>
          </div>
        </section>

        {/* L8 ScenarioComparison */}
        <section className="mt-8 rounded-[2rem] bg-white/80 p-6 shadow-lg">
          <h2 className="text-2xl font-black text-slate-900">{l({ zh: "情境比較", en: "Scenario comparison" }, lang)}</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl bg-amber-50 p-4 font-black">
              <p className="font-black text-slate-900">{l({ zh: "日曆天 vs 工作日", en: "Calendar days vs workdays" }, lang)}</p>
              <p className="mt-2 font-black text-slate-600">
                {l(
                  {
                    zh: "用日曆天估算進度常常太樂觀，因為週末通常不工作。以工作日計算的每日負荷往往高出 40% 左右，這才是真實的執行壓力。",
                    en: "Estimating with calendar days is too optimistic since weekends are usually off. The per-workday load is often ~40% higher, which is the true execution pressure.",
                  },
                  lang
                )}
              </p>
              <p className="mt-2 font-black text-amber-700">{l({ zh: "建議：以工作日規劃", en: "Tip: plan by workdays" }, lang)}</p>
            </div>
            <div className="rounded-xl bg-orange-50 p-4 font-black">
              <p className="font-black text-slate-900">{l({ zh: "早開始 vs 晚開始", en: "Start early vs late" }, lang)}</p>
              <p className="mt-2 font-black text-slate-600">
                {l(
                  {
                    zh: "同樣的工作量，越晚開始每日負荷越高。提早幾天動工，每日所需的進度就能大幅下降，品質與彈性都更好。",
                    en: "For the same workload, starting later raises the daily load. Beginning a few days earlier sharply lowers the required daily pace and improves quality and flexibility.",
                  },
                  lang
                )}
              </p>
              <p className="mt-2 font-black text-orange-700">{l({ zh: "建議：今天就開始第一步", en: "Tip: take the first step today" }, lang)}</p>
            </div>
          </div>
        </section>

        {/* L9 EmotionConversion Upper */}
        <section className="mt-8 rounded-[2rem] bg-gradient-to-r from-amber-100 to-orange-100 p-6 font-black">
          <h2 className="text-2xl font-black text-slate-900">{l({ zh: "同樣的期限，不同的壓力", en: "Same deadline, different pressure" }, lang)}</h2>
          <p className="mt-3 font-black leading-relaxed text-slate-700">
            {l(
              {
                zh: "「還有一個月」聽起來很從容，但扣掉週末只剩約 22 個工作日，若工作量是 120 單位，每天就得完成將近 6 單位。把抽象的期限換算成每日具體數字，焦慮會變成可執行的計畫。",
                en: "\"A month left\" sounds relaxed, but minus weekends it is about 22 workdays. With 120 units that means nearly 6 units daily. Turning an abstract deadline into a concrete daily number converts anxiety into an actionable plan.",
              },
              lang
            )}
          </p>
        </section>

        {/* L10 EmotionConversion Lower */}
        <section className="mt-8 rounded-[2rem] bg-gradient-to-r from-orange-100 to-yellow-100 p-6 font-black">
          <h2 className="text-2xl font-black text-slate-900">{l({ zh: "拖延的真實代價", en: "The real cost of delay" }, lang)}</h2>
          <p className="mt-3 font-black leading-relaxed text-slate-700">
            {l(
              {
                zh: "每拖延一天，剩餘天數的每日負荷就上升一點，最後幾天往往演變成熬夜趕工、品質下滑。用數字看見負荷如何隨拖延攀升，是維持穩定節奏最有力的提醒。把大目標拆成每日小步，才能準時又從容地交付。",
                en: "Each day of delay nudges the daily load higher, and the final days often become all-nighters with declining quality. Seeing the load climb with delay is the strongest reminder to keep a steady pace. Splitting the big goal into daily steps delivers on time and calmly.",
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
              <p className="mt-2 font-black text-slate-700">{l({ zh: "每日所需太高？→ 提早開始或縮減範圍", en: "Daily pace too high? → start earlier or cut scope" }, lang)}</p>
            </div>
            <div className="rounded-xl bg-orange-50 p-4 font-black">
              <p className="text-3xl font-black text-orange-600">2</p>
              <p className="mt-2 font-black text-slate-700">{l({ zh: "進度落後？→ 重新分配每工作日量", en: "Behind schedule? → rebalance per-workday load" }, lang)}</p>
            </div>
            <div className="rounded-xl bg-yellow-50 p-4 font-black">
              <p className="text-3xl font-black text-yellow-600">3</p>
              <p className="mt-2 font-black text-slate-700">{l({ zh: "節奏穩定？→ 每日追蹤、保留緩衝", en: "On pace? → track daily, keep a buffer" }, lang)}</p>
            </div>
          </div>
        </section>

        {/* L12 Knowledge */}
        <section className="mt-8 rounded-[2rem] bg-white/80 p-6 shadow-lg">
          <h2 className="text-2xl font-black text-slate-900">{l({ zh: "知識庫", en: "Knowledge" }, lang)}</h2>
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="font-black text-slate-900">{l({ zh: "工作日如何計算", en: "How workdays are counted" }, lang)}</h3>
              <p className="mt-1 font-black text-slate-600">
                {l(
                  {
                    zh: "工作日排除週六與週日，從今天到截止日之間逐日累計。若你的團隊有不同的休假安排，可自行調整總量做為參考基準。",
                    en: "Workdays exclude Saturdays and Sundays, counted day by day from today to the deadline. If your team has different holidays, adjust the total as a reference baseline.",
                  },
                  lang
                )}
              </p>
            </div>
            <div>
              <h3 className="font-black text-slate-900">{l({ zh: "每日所需進度", en: "Required daily pace" }, lang)}</h3>
              <p className="mt-1 font-black text-slate-600">
                {l(
                  {
                    zh: "每日所需 = 剩餘工作量 / 剩餘天數。把它和每工作日所需一起看，就能判斷是否需要加班或調整範圍。",
                    en: "Per day = remaining units / days remaining. Reading it alongside the per-workday figure shows whether overtime or scope changes are needed.",
                  },
                  lang
                )}
              </p>
            </div>
            <div>
              <h3 className="font-black text-slate-900">{l({ zh: "緩衝時間", en: "Buffer time" }, lang)}</h3>
              <p className="mt-1 font-black text-slate-600">
                {l(
                  {
                    zh: "好的排程會保留 10–20% 緩衝以應付突發。規劃時可把截止日設早幾天，讓計算出的每日負荷自然包含緩衝。",
                    en: "Good schedules keep a 10–20% buffer for surprises. Setting the deadline a few days early lets the computed daily load include a built-in buffer.",
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
              <h3 className="font-black text-slate-900">{l({ zh: "單位可以是什麼？", en: "What can a unit be?" }, lang)}</h3>
              <p className="mt-1 font-black text-slate-600">
                {l({ zh: "任何可量化的工作量：頁數、任務數、章節、功能點或預估工時，只要前後一致即可。", en: "Any quantifiable workload: pages, tasks, chapters, feature points or estimated hours — just keep it consistent." }, lang)}
              </p>
            </div>
            <div>
              <h3 className="font-black text-slate-900">{l({ zh: "包含截止日當天嗎？", en: "Does it include the deadline day?" }, lang)}</h3>
              <p className="mt-1 font-black text-slate-600">
                {l({ zh: "剩餘天數計算到截止日，工作日累計至截止日前一天，建議把截止日當天留作緩衝與檢查。", en: "Days remaining count to the deadline; workdays accumulate up to the day before. Reserve the deadline day as buffer and review." }, lang)}
              </p>
            </div>
            <div>
              <h3 className="font-black text-slate-900">{l({ zh: "若截止日已過會怎樣？", en: "What if the deadline passed?" }, lang)}</h3>
              <p className="mt-1 font-black text-slate-600">
                {l({ zh: "剩餘天數會顯示為 0，每日所需等於全部剩餘量，提醒你需要立即重新規劃或協商延期。", en: "Days remaining show 0 and the daily need equals all remaining units, signalling an immediate replan or deadline renegotiation." }, lang)}
              </p>
            </div>
          </div>
        </section>

        {/* L14 FAQ After Ad Slot */}
        <AdSlot slot="deadline-faq" position="inline" />

        {/* L15 AffiliateResources */}
        <section className="mt-8 rounded-[2rem] bg-white/80 p-6 shadow-lg">
          <h2 className="text-2xl font-black text-slate-900">{l({ zh: "推薦資源", en: "Recommended resources" }, lang)}</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto]">
            <a href="https://todoist.com" className="block rounded-xl bg-amber-50 p-4 font-black text-slate-700 hover:bg-amber-100">
              {l({ zh: "Todoist 任務與截止日管理", en: "Todoist task and deadline management" }, lang)}
            </a>
            <a href="https://asana.com" className="block rounded-xl bg-orange-50 p-4 font-black text-slate-700 hover:bg-orange-100">
              {l({ zh: "Asana 專案排程協作", en: "Asana project scheduling" }, lang)}
            </a>
          </div>
        </section>
        <AdSlot slot="deadline-aff" position="inline" />

        {/* L16 PremiumGate */}
        <section className="mt-8">
          <PremiumGate plan="PRO">
            <div className="rounded-[2rem] bg-gradient-to-r from-amber-600 to-orange-600 p-6 text-white">
              <h2 className="text-2xl font-black">{l({ zh: "升級 PRO 解鎖", en: "Upgrade PRO to unlock" }, lang)}</h2>
              <p className="mt-2 font-black">
                {l(
                  {
                    zh: "多專案儀表板、自訂假日行事曆、燃盡圖預測、進度落後警示、團隊負荷分配、無廣告體驗。",
                    en: "Multi-project dashboard, custom holiday calendars, burndown forecasting, behind-schedule alerts, team load balancing, and an ad-free experience.",
                  },
                  lang
                )}
              </p>
            </div>
          </PremiumGate>
        </section>

        <AdSlot slot="deadline-premium" position="inline" />
        <AdSlot slot="deadline-bottom" position="inline" />
        <AdSenseWrapper showAds={true} adSlot="deadline-foot" adFormat="horizontal" className="my-2" />

        {/* L17 TrustRelatedReferences */}
        <section className="mt-8 rounded-[2rem] bg-white/80 p-6 shadow-lg">
          <h2 className="text-2xl font-black text-slate-900">{l({ zh: "參考來源", en: "References" }, lang)}</h2>
          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
            <p className="font-black text-slate-600">• Project Management Institute. (2021). PMBOK Guide, 7th ed.</p>
            <p className="font-black text-slate-600">• Parkinson, C.N. (1955). Parkinson's Law. The Economist.</p>
            <p className="font-black text-slate-600">• Buehler, R. et al. (1994). The Planning Fallacy. J. Pers. Soc. Psychol.</p>
            <p className="font-black text-slate-600">• Allen, D. (2001). Getting Things Done. Penguin.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
