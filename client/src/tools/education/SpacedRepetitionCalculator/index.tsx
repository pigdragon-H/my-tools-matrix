import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
const l = (v: LocalText, lang: Lang) => v[lang];

// SM-2 algorithm: compute next ease factor and interval schedule
function sm2(quality: number, reps: number, prevEf: number, prevInterval: number) {
  let ef = prevEf + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (ef < 1.3) ef = 1.3;
  let interval: number;
  let nextReps = reps;
  if (quality < 3) {
    nextReps = 0;
    interval = 1;
  } else {
    nextReps = reps + 1;
    if (nextReps === 1) interval = 1;
    else if (nextReps === 2) interval = 6;
    else interval = Math.round(prevInterval * ef);
  }
  return { ef: Math.round(ef * 100) / 100, interval, nextReps };
}

export default function SpacedRepetitionCalculator() {
  const { lang, setLang } = useLanguage();
  const [quality, setQuality] = useState(4);
  const [reps, setReps] = useState(2);
  const [ease, setEase] = useState(2.5);
  const [lastInterval, setLastInterval] = useState(6);

  const result = useMemo(() => {
    const r = sm2(quality, reps, ease, lastInterval);
    // build a 5-step forward schedule from current state
    const schedule: number[] = [];
    let ef = r.ef;
    let interval = r.interval;
    let n = r.nextReps;
    schedule.push(interval);
    for (let i = 0; i < 4; i++) {
      n += 1;
      if (n === 1) interval = 1;
      else if (n === 2) interval = 6;
      else interval = Math.round(interval * ef);
      schedule.push(interval);
    }
    const retention = Math.round(Math.max(0, Math.min(100, 90 - (5 - quality) * 12)));
    return { ...r, schedule, retention };
  }, [quality, reps, ease, lastInterval]);

  const outputText = useMemo(() => {
    const rows: [LocalText, string][] = [
      [{ zh: "回憶品質(0-5)", en: "Recall quality (0-5)" }, `${quality}`],
      [{ zh: "已複習次數", en: "Repetitions" }, `${reps}`],
      [{ zh: "新易度因子 EF", en: "New ease factor EF" }, `${result.ef}`],
      [{ zh: "下次間隔(天)", en: "Next interval (days)" }, `${result.interval}`],
      [{ zh: "估計保留率", en: "Estimated retention" }, `${result.retention}%`],
      [{ zh: "後續排程(天)", en: "Forward schedule (days)" }, result.schedule.join(", ")],
    ];
    return rows.map(([label, val]) => `${l(label, lang).padEnd(20)}: ${val}`).join("\n");
  }, [quality, reps, result, lang]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-cyan-50">
      {/* L1 Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{ background: "radial-gradient(circle at 30% 20%, #38bdf8 0%, transparent 55%)" }}
        />
        <div className="relative mx-auto max-w-7xl px-6 py-14">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
            {l({ zh: "間隔重複複習計算器", en: "Spaced Repetition Calculator" }, lang)}
          </h1>
          <p className="mt-4 max-w-2xl text-lg font-black text-slate-600">
            {l(
              {
                zh: "依 SM-2 演算法計算最佳複習間隔、易度因子與記憶保留率，規劃高效學習排程。",
                en: "Compute optimal review intervals, ease factor and retention using the SM-2 algorithm to plan efficient study schedules.",
              },
              lang
            )}
          </p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setLang("zh")}
              className={`rounded-xl px-4 py-2 font-black ${lang === "zh" ? "bg-sky-600 text-white" : "bg-white text-slate-700"}`}
            >
              {l({ zh: "中文", en: "Chinese" }, lang)}
            </button>
            <button
              onClick={() => setLang("en")}
              className={`rounded-xl px-4 py-2 font-black ${lang === "en" ? "bg-sky-600 text-white" : "bg-white text-slate-700"}`}
            >
              EN
            </button>
          </div>
        </div>
      </section>

      <AdSenseWrapper showAds={true} adSlot="srs-top" adFormat="horizontal" className="my-2" />

      <div className="mx-auto max-w-7xl px-6 pb-20">
        {/* L2 TrustIntro */}
        <section className="mt-8 rounded-[2rem] bg-white/80 p-6 shadow-lg">
          <h2 className="text-2xl font-black text-slate-900">
            {l({ zh: "為什麼需要間隔重複？", en: "Why spaced repetition?" }, lang)}
          </h2>
          <p className="mt-3 font-black leading-relaxed text-slate-600">
            {l(
              {
                zh: "記憶會隨時間遺忘，這就是著名的遺忘曲線。間隔重複在你即將遺忘前安排複習，用最少的複習次數達到最高保留率。SM-2 演算法依你每次回憶的品質動態調整下次間隔與易度因子(EF)，是 Anki 等記憶軟體的核心。所有計算在本地完成。",
                en: "Memory decays over time — the famous forgetting curve. Spaced repetition schedules reviews just before you forget, achieving high retention with minimal effort. The SM-2 algorithm adjusts the next interval and ease factor (EF) based on recall quality, and powers tools like Anki. All calculations run locally.",
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
              onClick={() => { setQuality(5); setReps(2); setEase(2.5); setLastInterval(6); }}
              className="rounded-xl bg-white p-4 text-left font-black shadow-sm transition hover:shadow-md"
            >
              {l({ zh: "範例：完美回憶(5)、第3次 → 間隔拉長", en: "Example: perfect recall (5), 3rd rep → longer interval" }, lang)}
            </button>
            <button
              onClick={() => { setQuality(2); setReps(4); setEase(2.5); setLastInterval(15); }}
              className="rounded-xl bg-white p-4 text-left font-black shadow-sm transition hover:shadow-md"
            >
              {l({ zh: "範例：回憶失敗(2) → 排程重置為 1 天", en: "Example: failed recall (2) → schedule resets to 1 day" }, lang)}
            </button>
          </div>
        </section>

        {/* L4 InputGuidance */}
        <section className="mt-8 rounded-[2rem] bg-sky-50 p-6 font-black">
          <h2 className="text-2xl font-black text-slate-900">{l({ zh: "輸入說明", en: "Input guidance" }, lang)}</h2>
          <p className="mt-3 font-black leading-relaxed text-slate-600">
            {l(
              {
                zh: "回憶品質為 0–5：5 表示輕鬆答對，3 表示勉強答對，低於 3 表示答錯。輸入目前已複習次數、現有易度因子(預設 2.5)與上次間隔天數，系統依 SM-2 計算下次間隔與後續排程。",
                en: "Recall quality is 0–5: 5 means effortless, 3 means correct with difficulty, below 3 means wrong. Enter current repetitions, your existing ease factor (default 2.5) and the last interval in days; SM-2 computes the next interval and forward schedule.",
              },
              lang
            )}
          </p>
        </section>

        {/* L5 CalculatorInput */}
        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_auto]">
          <div className="rounded-[2rem] bg-white p-6 shadow-lg">
            <h2 className="text-2xl font-black text-slate-900">{l({ zh: "輸入", en: "Input" }, lang)}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block font-black">
                <span className="text-sm font-black text-slate-700">{l({ zh: "回憶品質 (0-5)", en: "Recall quality (0-5)" }, lang)}</span>
                <input
                  type="number"
                  min={0}
                  max={5}
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-3 font-black"
                />
              </label>
              <label className="block font-black">
                <span className="text-sm font-black text-slate-700">{l({ zh: "已複習次數", en: "Repetitions" }, lang)}</span>
                <input
                  type="number"
                  value={reps}
                  onChange={(e) => setReps(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-3 font-black"
                />
              </label>
              <label className="block font-black">
                <span className="text-sm font-black text-slate-700">{l({ zh: "易度因子 EF", en: "Ease factor EF" }, lang)}</span>
                <input
                  type="number"
                  step={0.1}
                  value={ease}
                  onChange={(e) => setEase(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-3 font-black"
                />
              </label>
              <label className="block font-black">
                <span className="text-sm font-black text-slate-700">{l({ zh: "上次間隔(天)", en: "Last interval (days)" }, lang)}</span>
                <input
                  type="number"
                  value={lastInterval}
                  onChange={(e) => setLastInterval(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-3 font-black"
                />
              </label>
            </div>
          </div>
          <div className="rounded-[2rem] bg-cyan-50 p-6 shadow-lg lg:w-64">
            <h3 className="text-lg font-black text-slate-900">{l({ zh: "下次複習", en: "Next review" }, lang)}</h3>
            <p className="mt-2 text-4xl font-black text-sky-600">{result.interval}</p>
            <p className="mt-1 font-black text-slate-600">{l({ zh: "天後", en: "days later" }, lang)}</p>
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
            <div className="rounded-xl bg-sky-50 p-4 font-black">
              <p className="text-sm font-black text-slate-500">{l({ zh: "易度因子", en: "Ease factor" }, lang)}</p>
              <p className="mt-1 text-xl font-black text-slate-900">{result.ef}</p>
            </div>
            <div className="rounded-xl bg-cyan-50 p-4 font-black">
              <p className="text-sm font-black text-slate-500">{l({ zh: "下次間隔", en: "Next interval" }, lang)}</p>
              <p className="mt-1 text-xl font-black text-slate-900">{result.interval} {l({ zh: "天", en: "d" }, lang)}</p>
            </div>
            <div className="rounded-xl bg-blue-50 p-4 font-black">
              <p className="text-sm font-black text-slate-500">{l({ zh: "保留率", en: "Retention" }, lang)}</p>
              <p className="mt-1 text-xl font-black text-slate-900">{result.retention}%</p>
            </div>
          </div>
        </section>

        {/* L8 ScenarioComparison */}
        <section className="mt-8 rounded-[2rem] bg-white/80 p-6 shadow-lg">
          <h2 className="text-2xl font-black text-slate-900">{l({ zh: "情境比較", en: "Scenario comparison" }, lang)}</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl bg-sky-50 p-4 font-black">
              <p className="font-black text-slate-900">{l({ zh: "回憶順利", en: "Smooth recall" }, lang)}</p>
              <p className="mt-2 font-black text-slate-600">
                {l(
                  {
                    zh: "品質 4–5 時間隔快速拉長(1→6→15→38 天…)，易度因子上升，複習頻率下降，學習效率最高。",
                    en: "At quality 4–5 the interval grows fast (1→6→15→38 days…), EF rises, review frequency drops, and efficiency peaks.",
                  },
                  lang
                )}
              </p>
              <p className="mt-2 font-black text-sky-700">{l({ zh: "建議：穩定每日複習到期卡", en: "Tip: clear due cards daily" }, lang)}</p>
            </div>
            <div className="rounded-xl bg-cyan-50 p-4 font-black">
              <p className="font-black text-slate-900">{l({ zh: "回憶失敗", en: "Failed recall" }, lang)}</p>
              <p className="mt-2 font-black text-slate-600">
                {l(
                  {
                    zh: "品質低於 3 時排程重置為 1 天，易度因子下降。失敗次數多代表卡片太難，應拆解或加強記憶線索。",
                    en: "Below quality 3 the schedule resets to 1 day and EF drops. Frequent failures mean the card is too hard — split it or add stronger cues.",
                  },
                  lang
                )}
              </p>
              <p className="mt-2 font-black text-cyan-700">{l({ zh: "建議：拆解難卡、加助記", en: "Tip: split hard cards, add mnemonics" }, lang)}</p>
            </div>
          </div>
        </section>

        {/* L9 EmotionConversion Upper */}
        <section className="mt-8 rounded-[2rem] bg-gradient-to-r from-sky-100 to-cyan-100 p-6 font-black">
          <h2 className="text-2xl font-black text-slate-900">{l({ zh: "少複習，記更牢", en: "Review less, remember more" }, lang)}</h2>
          <p className="mt-3 font-black leading-relaxed text-slate-700">
            {l(
              {
                zh: "死記硬背在考前一次塞入大量內容，幾天後就忘光。間隔重複把同樣的內容分散在數週複習，總時間更少卻能長期記住。這不是更努力，而是更聰明地利用記憶的運作方式。",
                en: "Cramming stuffs everything in before an exam and forgets it days later. Spaced repetition distributes the same content across weeks, taking less total time yet retaining it long term. It is not working harder — it is working with how memory actually works.",
              },
              lang
            )}
          </p>
        </section>

        {/* L10 EmotionConversion Lower */}
        <section className="mt-8 rounded-[2rem] bg-gradient-to-r from-cyan-100 to-blue-100 p-6 font-black">
          <h2 className="text-2xl font-black text-slate-900">{l({ zh: "排程錯誤的代價", en: "The cost of wrong scheduling" }, lang)}</h2>
          <p className="mt-3 font-black leading-relaxed text-slate-700">
            {l(
              {
                zh: "複習太頻繁浪費時間，太稀疏則在複習前就遺忘、被迫重學。SM-2 的價值在於把間隔調到「剛好快要忘記」的甜蜜點，讓每一次複習都最大化記憶強化效果。用數據安排學習，比憑感覺有效得多。",
                en: "Reviewing too often wastes time; too rarely means forgetting before review and relearning. SM-2 tunes the interval to the sweet spot just before forgetting, maximizing the reinforcement of every review. Scheduling with data beats relying on feel.",
              },
              lang
            )}
          </p>
        </section>

        {/* L11 DecisionPath */}
        <section className="mt-8 rounded-[2rem] bg-white/80 p-6 shadow">
          <h2 className="text-2xl font-black text-slate-900">{l({ zh: "決策路徑", en: "Decision path" }, lang)}</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl bg-sky-50 p-4 font-black">
              <p className="text-3xl font-black text-sky-600">1</p>
              <p className="mt-2 font-black text-slate-700">{l({ zh: "輕鬆答對？→ 提高品質分、拉長間隔", en: "Easy recall? → raise quality, longer interval" }, lang)}</p>
            </div>
            <div className="rounded-xl bg-cyan-50 p-4 font-black">
              <p className="text-3xl font-black text-cyan-600">2</p>
              <p className="mt-2 font-black text-slate-700">{l({ zh: "勉強答對？→ 品質 3、間隔小幅成長", en: "Barely correct? → quality 3, small growth" }, lang)}</p>
            </div>
            <div className="rounded-xl bg-blue-50 p-4 font-black">
              <p className="text-3xl font-black text-blue-600">3</p>
              <p className="mt-2 font-black text-slate-700">{l({ zh: "答錯了？→ 品質 &lt;3、重置為 1 天", en: "Wrong? → quality <3, reset to 1 day" }, lang)}</p>
            </div>
          </div>
        </section>

        {/* L12 Knowledge */}
        <section className="mt-8 rounded-[2rem] bg-white/80 p-6 shadow-lg">
          <h2 className="text-2xl font-black text-slate-900">{l({ zh: "知識庫", en: "Knowledge" }, lang)}</h2>
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="font-black text-slate-900">{l({ zh: "SM-2 演算法", en: "The SM-2 algorithm" }, lang)}</h3>
              <p className="mt-1 font-black text-slate-600">
                {l(
                  {
                    zh: "SM-2 由 SuperMemo 的 Piotr Wozniak 於 1980 年代提出。第一次間隔 1 天、第二次 6 天，之後間隔 = 上次間隔 × 易度因子。品質低於 3 則重置。",
                    en: "SM-2 was introduced by Piotr Wozniak of SuperMemo in the 1980s. The first interval is 1 day, the second 6 days, and afterwards interval = previous interval × ease factor. Quality below 3 resets it.",
                  },
                  lang
                )}
              </p>
            </div>
            <div>
              <h3 className="font-black text-slate-900">{l({ zh: "易度因子 EF", en: "Ease factor EF" }, lang)}</h3>
              <p className="mt-1 font-black text-slate-600">
                {l(
                  {
                    zh: "EF 反映卡片難度，初始 2.5，最低不低於 1.3。回憶越輕鬆 EF 越高、間隔成長越快；回憶吃力則 EF 下降。",
                    en: "EF reflects card difficulty, starting at 2.5 and never falling below 1.3. Easier recall raises EF and grows intervals faster; harder recall lowers EF.",
                  },
                  lang
                )}
              </p>
            </div>
            <div>
              <h3 className="font-black text-slate-900">{l({ zh: "遺忘曲線", en: "The forgetting curve" }, lang)}</h3>
              <p className="mt-1 font-black text-slate-600">
                {l(
                  {
                    zh: "Ebbinghaus 發現記憶隨時間呈指數衰退。每次成功複習都會讓曲線變得更平緩，遺忘速度變慢，這正是間隔可以逐次拉長的原因。",
                    en: "Ebbinghaus found that memory decays exponentially over time. Each successful review flattens the curve so forgetting slows, which is exactly why intervals can lengthen each time.",
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
              <h3 className="font-black text-slate-900">{l({ zh: "品質分數怎麼給？", en: "How do I rate quality?" }, lang)}</h3>
              <p className="mt-1 font-black text-slate-600">
                {l({ zh: "5=輕鬆、4=稍想一下、3=勉強想起、2=想起但有錯、1=幾乎全錯、0=完全沒印象。", en: "5=effortless, 4=slight hesitation, 3=recalled with difficulty, 2=recalled with errors, 1=mostly wrong, 0=no recollection." }, lang)}
              </p>
            </div>
            <div>
              <h3 className="font-black text-slate-900">{l({ zh: "間隔可以無限拉長嗎？", en: "Can intervals grow forever?" }, lang)}</h3>
              <p className="mt-1 font-black text-slate-600">
                {l({ zh: "理論上會持續成長，但多數軟體設有上限(如 1–2 年)。只要持續成功回憶，間隔就會越來越長。", en: "In theory they keep growing, though most apps cap it (e.g. 1–2 years). As long as recall keeps succeeding, intervals keep lengthening." }, lang)}
              </p>
            </div>
            <div>
              <h3 className="font-black text-slate-900">{l({ zh: "SM-2 適合所有科目嗎？", en: "Does SM-2 fit every subject?" }, lang)}</h3>
              <p className="mt-1 font-black text-slate-600">
                {l({ zh: "最適合事實性、可拆成卡片的內容(單字、定義、公式)。需要整合理解的主題仍須搭配其他學習法。", en: "It best fits factual, card-sized content (vocabulary, definitions, formulas). Topics needing integrated understanding still require other methods." }, lang)}
              </p>
            </div>
          </div>
        </section>

        {/* L14 FAQ After Ad Slot */}
        <AdSlot slot="srs-faq" position="inline" />

        {/* L15 AffiliateResources */}
        <section className="mt-8 rounded-[2rem] bg-white/80 p-6 shadow-lg">
          <h2 className="text-2xl font-black text-slate-900">{l({ zh: "推薦資源", en: "Recommended resources" }, lang)}</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto]">
            <a href="https://apps.ankiweb.net" className="block rounded-xl bg-sky-50 p-4 font-black text-slate-700 hover:bg-sky-100">
              {l({ zh: "Anki 開源間隔重複軟體", en: "Anki open-source spaced repetition" }, lang)}
            </a>
            <a href="https://www.supermemo.com" className="block rounded-xl bg-cyan-50 p-4 font-black text-slate-700 hover:bg-cyan-100">
              {l({ zh: "SuperMemo SM 演算法原始研究", en: "SuperMemo SM algorithm research" }, lang)}
            </a>
          </div>
        </section>
        <AdSlot slot="srs-aff" position="inline" />

        {/* L16 PremiumGate */}
        <section className="mt-8">
          <PremiumGate plan="PRO">
            <div className="rounded-[2rem] bg-gradient-to-r from-sky-600 to-cyan-600 p-6 text-white">
              <h2 className="text-2xl font-black">{l({ zh: "升級 PRO 解鎖", en: "Upgrade PRO to unlock" }, lang)}</h2>
              <p className="mt-2 font-black">
                {l(
                  {
                    zh: "整套卡組排程模擬、保留率曲線預測、每日工作量平衡、匯出 Anki 排程、無廣告體驗。",
                    en: "Whole-deck schedule simulation, retention curve forecasting, daily workload balancing, Anki schedule export, and an ad-free experience.",
                  },
                  lang
                )}
              </p>
            </div>
          </PremiumGate>
        </section>

        <AdSlot slot="srs-premium" position="inline" />
        <AdSlot slot="srs-bottom" position="inline" />
        <AdSenseWrapper showAds={true} adSlot="srs-foot" adFormat="horizontal" className="my-2" />

        {/* L17 TrustRelatedReferences */}
        <section className="mt-8 rounded-[2rem] bg-white/80 p-6 shadow-lg">
          <h2 className="text-2xl font-black text-slate-900">{l({ zh: "參考來源", en: "References" }, lang)}</h2>
          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
            <p className="font-black text-slate-600">• Wozniak, P. (1990). Optimization of learning. SuperMemo.</p>
            <p className="font-black text-slate-600">• Ebbinghaus, H. (1885). Memory: A Contribution to Experimental Psychology.</p>
            <p className="font-black text-slate-600">• Cepeda, N. et al. (2006). Distributed Practice in Verbal Recall. Psych. Bulletin.</p>
            <p className="font-black text-slate-600">• Karpicke, J. & Roediger, H. (2008). The Critical Importance of Retrieval. Science.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
