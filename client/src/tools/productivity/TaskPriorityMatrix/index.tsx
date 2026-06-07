import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
const l = (v: LocalText, lang: Lang) => v[lang];

function quadrant(importance: number, urgency: number): { key: string; label: LocalText; action: LocalText } {
  const imp = importance >= 3;
  const urg = urgency >= 3;
  if (imp && urg) return { key: "Q1", label: { zh: "第一象限 · 重要且緊急", en: "Q1 · Important & Urgent" }, action: { zh: "立即做 (Do)", en: "Do now" } };
  if (imp && !urg) return { key: "Q2", label: { zh: "第二象限 · 重要不緊急", en: "Q2 · Important, Not Urgent" }, action: { zh: "排程做 (Schedule)", en: "Schedule" } };
  if (!imp && urg) return { key: "Q3", label: { zh: "第三象限 · 不重要但緊急", en: "Q3 · Urgent, Not Important" }, action: { zh: "委派 (Delegate)", en: "Delegate" } };
  return { key: "Q4", label: { zh: "第四象限 · 不重要不緊急", en: "Q4 · Not Important, Not Urgent" }, action: { zh: "刪除 (Delete)", en: "Delete" } };
}

export default function TaskPriorityMatrix() {
  const { lang, setLang } = useLanguage();
  const [importance, setImportance] = useState(4);
  const [urgency, setUrgency] = useState(4);
  const [effort, setEffort] = useState(3);

  const result = useMemo(() => {
    const q = quadrant(importance, urgency);
    // priority score: weight importance and urgency, penalize high effort slightly
    const score = importance * 2 + urgency * 1.5 - effort * 0.5;
    const normalized = Math.round((score / (5 * 2 + 5 * 1.5 - 1 * 0.5)) * 1000) / 10;
    return { ...q, score: Math.round(score * 10) / 10, normalized: Math.max(0, Math.min(100, normalized)) };
  }, [importance, urgency, effort]);

  const outputText = useMemo(() => {
    const rows: [LocalText, string][] = [
      [{ zh: "重要程度(1-5)", en: "Importance (1-5)" }, `${importance}`],
      [{ zh: "緊急程度(1-5)", en: "Urgency (1-5)" }, `${urgency}`],
      [{ zh: "投入心力(1-5)", en: "Effort (1-5)" }, `${effort}`],
      [{ zh: "所屬象限", en: "Quadrant" }, l(result.label, lang)],
      [{ zh: "建議行動", en: "Recommended action" }, l(result.action, lang)],
      [{ zh: "優先分數", en: "Priority score" }, `${result.score}`],
      [{ zh: "優先指數", en: "Priority index" }, `${result.normalized}%`],
    ];
    return rows.map(([label, val]) => `${l(label, lang).padEnd(20)}: ${val}`).join("\n");
  }, [importance, urgency, effort, result, lang]);

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
            {l({ zh: "任務優先矩陣計算器", en: "Task Priority Matrix" }, lang)}
          </h1>
          <p className="mt-4 max-w-2xl text-lg font-black text-slate-600">
            {l(
              {
                zh: "依艾森豪重要緊急矩陣為任務評分分類，產出明確的優先處理順序與行動建議。",
                en: "Score and classify tasks with the Eisenhower importance-urgency matrix to get clear priorities and action advice.",
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

      <AdSenseWrapper showAds={true} adSlot="matrix-top" adFormat="horizontal" className="my-2" />

      <div className="mx-auto max-w-7xl px-6 pb-20">
        {/* L2 TrustIntro */}
        <section className="mt-8 rounded-[2rem] bg-white/80 p-6 shadow-lg">
          <h2 className="text-2xl font-black text-slate-900">
            {l({ zh: "為什麼需要優先矩陣？", en: "Why a priority matrix?" }, lang)}
          </h2>
          <p className="mt-3 font-black leading-relaxed text-slate-600">
            {l(
              {
                zh: "我們常把「緊急」誤當成「重要」，結果整天忙於救火，卻沒時間做真正推動長期目標的事。艾森豪矩陣用「重要」與「緊急」兩個維度把任務分成四個象限，幫你看清哪些該立即做、哪些該排程、哪些該委派或刪除。本工具為單一任務評分並給出建議，所有計算在本地完成。",
                en: "We often mistake \"urgent\" for \"important\", spending all day firefighting with no time for what truly advances long-term goals. The Eisenhower matrix splits tasks into four quadrants by importance and urgency, clarifying what to do now, schedule, delegate or delete. This tool scores a single task and gives advice, all computed locally.",
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
              onClick={() => { setImportance(5); setUrgency(5); setEffort(3); }}
              className="rounded-xl bg-white p-4 text-left font-black shadow-sm transition hover:shadow-md"
            >
              {l({ zh: "範例：重要 5、緊急 5 → 第一象限「立即做」", en: "Example: importance 5, urgency 5 → Q1 \"Do now\"" }, lang)}
            </button>
            <button
              onClick={() => { setImportance(5); setUrgency(2); setEffort(3); }}
              className="rounded-xl bg-white p-4 text-left font-black shadow-sm transition hover:shadow-md"
            >
              {l({ zh: "範例：重要 5、緊急 2 → 第二象限「排程做」", en: "Example: importance 5, urgency 2 → Q2 \"Schedule\"" }, lang)}
            </button>
          </div>
        </section>

        {/* L4 InputGuidance */}
        <section className="mt-8 rounded-[2rem] bg-amber-50 p-6 font-black">
          <h2 className="text-2xl font-black text-slate-900">{l({ zh: "輸入說明", en: "Input guidance" }, lang)}</h2>
          <p className="mt-3 font-black leading-relaxed text-slate-600">
            {l(
              {
                zh: "為任務的重要程度與緊急程度各打 1–5 分(3 分以上視為高)。投入心力同樣 1–5 分，用於微調優先分數——同樣重要緊急的任務，所需心力越低越值得先做。系統依此判斷象限並給出行動建議。",
                en: "Rate the task's importance and urgency from 1–5 (3+ counts as high). Effort is also 1–5 and fine-tunes the priority score — among equally important, urgent tasks, lower effort is worth doing first. The tool determines the quadrant and recommends an action.",
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
                <span className="text-sm font-black text-slate-700">{l({ zh: "重要程度 (1-5)", en: "Importance (1-5)" }, lang)}</span>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={importance}
                  onChange={(e) => setImportance(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-3 font-black"
                />
              </label>
              <label className="block font-black">
                <span className="text-sm font-black text-slate-700">{l({ zh: "緊急程度 (1-5)", en: "Urgency (1-5)" }, lang)}</span>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={urgency}
                  onChange={(e) => setUrgency(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-3 font-black"
                />
              </label>
              <label className="block font-black">
                <span className="text-sm font-black text-slate-700">{l({ zh: "投入心力 (1-5)", en: "Effort (1-5)" }, lang)}</span>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={effort}
                  onChange={(e) => setEffort(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-3 font-black"
                />
              </label>
            </div>
          </div>
          <div className="rounded-[2rem] bg-orange-50 p-6 shadow-lg lg:w-64">
            <h3 className="text-lg font-black text-slate-900">{l({ zh: "優先指數", en: "Priority index" }, lang)}</h3>
            <p className="mt-2 text-4xl font-black text-amber-600">{result.normalized}%</p>
            <p className="mt-1 font-black text-slate-600">{l(result.action, lang)}</p>
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
              <p className="text-sm font-black text-slate-500">{l({ zh: "所屬象限", en: "Quadrant" }, lang)}</p>
              <p className="mt-1 text-xl font-black text-slate-900">{result.key}</p>
            </div>
            <div className="rounded-xl bg-orange-50 p-4 font-black">
              <p className="text-sm font-black text-slate-500">{l({ zh: "建議行動", en: "Action" }, lang)}</p>
              <p className="mt-1 text-xl font-black text-slate-900">{l(result.action, lang)}</p>
            </div>
            <div className="rounded-xl bg-yellow-50 p-4 font-black">
              <p className="text-sm font-black text-slate-500">{l({ zh: "優先分數", en: "Score" }, lang)}</p>
              <p className="mt-1 text-xl font-black text-slate-900">{result.score}</p>
            </div>
          </div>
        </section>

        {/* L8 ScenarioComparison */}
        <section className="mt-8 rounded-[2rem] bg-white/80 p-6 shadow-lg">
          <h2 className="text-2xl font-black text-slate-900">{l({ zh: "情境比較", en: "Scenario comparison" }, lang)}</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl bg-amber-50 p-4 font-black">
              <p className="font-black text-slate-900">{l({ zh: "重要 vs 緊急", en: "Important vs urgent" }, lang)}</p>
              <p className="mt-2 font-black text-slate-600">
                {l(
                  {
                    zh: "緊急的事吵著要你立刻處理，重要的事卻常被推遲。第二象限(重要不緊急)正是長期成長的關鍵，卻最容易被犧牲。",
                    en: "Urgent things shout for immediate attention; important things get postponed. Q2 (important, not urgent) is the key to long-term growth yet is sacrificed most easily.",
                  },
                  lang
                )}
              </p>
              <p className="mt-2 font-black text-amber-700">{l({ zh: "建議：刻意保護第二象限時間", en: "Tip: protect Q2 time deliberately" }, lang)}</p>
            </div>
            <div className="rounded-xl bg-orange-50 p-4 font-black">
              <p className="font-black text-slate-900">{l({ zh: "心力高 vs 心力低", en: "High vs low effort" }, lang)}</p>
              <p className="mt-2 font-black text-slate-600">
                {l(
                  {
                    zh: "同樣重要緊急的任務中，先完成心力低的能快速清空待辦、累積動能;心力高的則需安排完整的專注時段。",
                    en: "Among equally important, urgent tasks, doing low-effort ones first clears the list and builds momentum; high-effort ones need dedicated focus blocks.",
                  },
                  lang
                )}
              </p>
              <p className="mt-2 font-black text-orange-700">{l({ zh: "建議：心力高的安排深度工作", en: "Tip: schedule deep work for high effort" }, lang)}</p>
            </div>
          </div>
        </section>

        {/* L9 EmotionConversion Upper */}
        <section className="mt-8 rounded-[2rem] bg-gradient-to-r from-amber-100 to-orange-100 p-6 font-black">
          <h2 className="text-2xl font-black text-slate-900">{l({ zh: "忙碌不等於有成效", en: "Busy is not productive" }, lang)}</h2>
          <p className="mt-3 font-black leading-relaxed text-slate-700">
            {l(
              {
                zh: "一整天回不完的訊息、開不完的會,讓人覺得很忙,卻可能全在第三象限——緊急但不重要。真正推動人生的,是那些不急著今天做、卻決定你未來的第二象限任務。看清象限,才能把時間投在對的地方。",
                en: "Endless messages and meetings feel busy but may all sit in Q3 — urgent yet unimportant. What truly moves your life forward are Q2 tasks that are not due today but shape your future. Seeing the quadrants lets you invest time where it counts.",
              },
              lang
            )}
          </p>
        </section>

        {/* L10 EmotionConversion Lower */}
        <section className="mt-8 rounded-[2rem] bg-gradient-to-r from-orange-100 to-yellow-100 p-6 font-black">
          <h2 className="text-2xl font-black text-slate-900">{l({ zh: "排錯優先序的代價", en: "The cost of wrong priorities" }, lang)}</h2>
          <p className="mt-3 font-black leading-relaxed text-slate-700">
            {l(
              {
                zh: "把時間花在第三、四象限,等於用最寶貴的精力換取最低的回報。長期下來,重要的事不斷被緊急的事擠掉,目標越來越遠。用矩陣為每件事定位,是把努力轉化為成果最有效的習慣。",
                en: "Spending time in Q3 and Q4 trades your most precious energy for the lowest return. Over time, important work is crowded out by the urgent and goals drift away. Mapping each task on the matrix is the most effective habit for turning effort into results.",
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
              <p className="mt-2 font-black text-slate-700">{l({ zh: "重要且緊急？→ 立即做", en: "Important & urgent? → Do now" }, lang)}</p>
            </div>
            <div className="rounded-xl bg-orange-50 p-4 font-black">
              <p className="text-3xl font-black text-orange-600">2</p>
              <p className="mt-2 font-black text-slate-700">{l({ zh: "重要不緊急？→ 排進行事曆", en: "Important, not urgent? → Schedule" }, lang)}</p>
            </div>
            <div className="rounded-xl bg-yellow-50 p-4 font-black">
              <p className="text-3xl font-black text-yellow-600">3</p>
              <p className="mt-2 font-black text-slate-700">{l({ zh: "不重要？→ 委派或刪除", en: "Not important? → Delegate or delete" }, lang)}</p>
            </div>
          </div>
        </section>

        {/* L12 Knowledge */}
        <section className="mt-8 rounded-[2rem] bg-white/80 p-6 shadow-lg">
          <h2 className="text-2xl font-black text-slate-900">{l({ zh: "知識庫", en: "Knowledge" }, lang)}</h2>
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="font-black text-slate-900">{l({ zh: "艾森豪矩陣", en: "The Eisenhower matrix" }, lang)}</h3>
              <p className="mt-1 font-black text-slate-600">
                {l(
                  {
                    zh: "源自美國總統艾森豪的名言:「重要的事很少緊急,緊急的事很少重要。」後由《高效能人士的七個習慣》推廣為四象限決策工具。",
                    en: "Inspired by President Eisenhower's line, \"What is important is seldom urgent, and what is urgent is seldom important,\" later popularized as a four-quadrant tool in The 7 Habits of Highly Effective People.",
                  },
                  lang
                )}
              </p>
            </div>
            <div>
              <h3 className="font-black text-slate-900">{l({ zh: "四個象限", en: "The four quadrants" }, lang)}</h3>
              <p className="mt-1 font-black text-slate-600">
                {l(
                  {
                    zh: "Q1 重要且緊急(做)、Q2 重要不緊急(排程)、Q3 不重要但緊急(委派)、Q4 不重要不緊急(刪除)。本工具以 3 分為高低分界。",
                    en: "Q1 important & urgent (do), Q2 important not urgent (schedule), Q3 unimportant but urgent (delegate), Q4 neither (delete). This tool uses 3 as the high/low threshold.",
                  },
                  lang
                )}
              </p>
            </div>
            <div>
              <h3 className="font-black text-slate-900">{l({ zh: "優先分數", en: "Priority score" }, lang)}</h3>
              <p className="mt-1 font-black text-slate-600">
                {l(
                  {
                    zh: "分數 = 重要×2 + 緊急×1.5 − 心力×0.5,再標準化為 0–100% 的優先指數,方便在多任務間直接比較。",
                    en: "Score = importance×2 + urgency×1.5 − effort×0.5, normalized to a 0–100% priority index for easy comparison across tasks.",
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
              <h3 className="font-black text-slate-900">{l({ zh: "怎麼判斷重要還是緊急？", en: "How do I tell important from urgent?" }, lang)}</h3>
              <p className="mt-1 font-black text-slate-600">
                {l({ zh: "重要看是否影響你的長期目標與價值;緊急看是否有迫近的期限或外部壓力。兩者常被混淆。", en: "Important relates to long-term goals and values; urgent relates to imminent deadlines or external pressure. The two are easily confused." }, lang)}
              </p>
            </div>
            <div>
              <h3 className="font-black text-slate-900">{l({ zh: "為什麼要考慮心力？", en: "Why include effort?" }, lang)}</h3>
              <p className="mt-1 font-black text-slate-600">
                {l({ zh: "象限相同時,心力可幫你決定先後順序——先做高回報低心力的任務能快速累積成效。", en: "When tasks share a quadrant, effort helps order them — doing high-return, low-effort tasks first builds results quickly." }, lang)}
              </p>
            </div>
            <div>
              <h3 className="font-black text-slate-900">{l({ zh: "可以一次評多個任務嗎？", en: "Can I score many tasks at once?" }, lang)}</h3>
              <p className="mt-1 font-black text-slate-600">
                {l({ zh: "本工具一次評一個任務。PRO 版支援批次匯入、自動排序與視覺化四象限看板。", en: "This tool scores one task at a time. The PRO version supports batch import, auto-sorting and a visual four-quadrant board." }, lang)}
              </p>
            </div>
          </div>
        </section>

        {/* L14 FAQ After Ad Slot */}
        <AdSlot slot="matrix-faq" position="inline" />

        {/* L15 AffiliateResources */}
        <section className="mt-8 rounded-[2rem] bg-white/80 p-6 shadow-lg">
          <h2 className="text-2xl font-black text-slate-900">{l({ zh: "推薦資源", en: "Recommended resources" }, lang)}</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto]">
            <a href="https://todoist.com/productivity-methods/eisenhower-matrix" className="block rounded-xl bg-amber-50 p-4 font-black text-slate-700 hover:bg-amber-100">
              {l({ zh: "Todoist 艾森豪矩陣指南", en: "Todoist Eisenhower matrix guide" }, lang)}
            </a>
            <a href="https://asana.com" className="block rounded-xl bg-orange-50 p-4 font-black text-slate-700 hover:bg-orange-100">
              {l({ zh: "Asana 任務優先管理", en: "Asana task prioritization" }, lang)}
            </a>
          </div>
        </section>
        <AdSlot slot="matrix-aff" position="inline" />

        {/* L16 PremiumGate */}
        <section className="mt-8">
          <PremiumGate plan="PRO">
            <div className="rounded-[2rem] bg-gradient-to-r from-amber-600 to-orange-600 p-6 text-white">
              <h2 className="text-2xl font-black">{l({ zh: "升級 PRO 解鎖", en: "Upgrade PRO to unlock" }, lang)}</h2>
              <p className="mt-2 font-black">
                {l(
                  {
                    zh: "批次任務評分與自動排序、視覺化四象限看板、自訂權重、團隊共享優先清單、無廣告體驗。",
                    en: "Batch task scoring with auto-sort, a visual four-quadrant board, custom weights, shared team priority lists, and an ad-free experience.",
                  },
                  lang
                )}
              </p>
            </div>
          </PremiumGate>
        </section>

        <AdSlot slot="matrix-premium" position="inline" />
        <AdSlot slot="matrix-bottom" position="inline" />
        <AdSenseWrapper showAds={true} adSlot="matrix-foot" adFormat="horizontal" className="my-2" />

        {/* L17 TrustRelatedReferences */}
        <section className="mt-8 rounded-[2rem] bg-white/80 p-6 shadow-lg">
          <h2 className="text-2xl font-black text-slate-900">{l({ zh: "參考來源", en: "References" }, lang)}</h2>
          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
            <p className="font-black text-slate-600">• Covey, S. (1989). The 7 Habits of Highly Effective People.</p>
            <p className="font-black text-slate-600">• Eisenhower, D. (1954). Address to the World Council of Churches.</p>
            <p className="font-black text-slate-600">• Allen, D. (2001). Getting Things Done. Penguin.</p>
            <p className="font-black text-slate-600">• Drucker, P. (1967). The Effective Executive. Harper.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
