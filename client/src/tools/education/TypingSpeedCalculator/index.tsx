import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
const l = (v: LocalText, lang: Lang) => v[lang];

function gradeOf(wpm: number): LocalText {
  if (wpm >= 80) return { zh: "專業級", en: "Professional" };
  if (wpm >= 60) return { zh: "優秀", en: "Excellent" };
  if (wpm >= 40) return { zh: "良好", en: "Good" };
  if (wpm >= 25) return { zh: "一般", en: "Average" };
  return { zh: "初學", en: "Beginner" };
}

export default function TypingSpeedCalculator() {
  const { lang, setLang } = useLanguage();
  const [chars, setChars] = useState(250);
  const [seconds, setSeconds] = useState(60);
  const [errors, setErrors] = useState(3);

  const result = useMemo(() => {
    const minutes = seconds > 0 ? seconds / 60 : 0;
    const words = chars / 5;
    const grossWpm = minutes > 0 ? words / minutes : 0;
    const netWpm = minutes > 0 ? Math.max(0, (words - errors) / minutes) : 0;
    const accuracy = words > 0 ? Math.max(0, ((words - errors) / words) * 100) : 0;
    const cpm = minutes > 0 ? chars / minutes : 0;
    return {
      grossWpm: Math.round(grossWpm * 10) / 10,
      netWpm: Math.round(netWpm * 10) / 10,
      accuracy: Math.round(accuracy * 10) / 10,
      cpm: Math.round(cpm),
      grade: gradeOf(netWpm),
    };
  }, [chars, seconds, errors]);

  const outputText = useMemo(() => {
    const rows: [LocalText, string][] = [
      [{ zh: "總字元數", en: "Total characters" }, `${chars}`],
      [{ zh: "用時(秒)", en: "Time (sec)" }, `${seconds}`],
      [{ zh: "毛速 WPM", en: "Gross WPM" }, `${result.grossWpm}`],
      [{ zh: "淨速 WPM", en: "Net WPM" }, `${result.netWpm}`],
      [{ zh: "每分字元 CPM", en: "Chars/min (CPM)" }, `${result.cpm}`],
      [{ zh: "準確率", en: "Accuracy" }, `${result.accuracy}%`],
      [{ zh: "等級", en: "Grade" }, l(result.grade, lang)],
    ];
    return rows.map(([label, val]) => `${l(label, lang).padEnd(18)}: ${val}`).join("\n");
  }, [chars, seconds, result, lang]);

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
            {l({ zh: "打字速度計算器", en: "Typing Speed Calculator" }, lang)}
          </h1>
          <p className="mt-4 max-w-2xl text-lg font-black text-slate-600">
            {l(
              {
                zh: "計算每分鐘字數(WPM)、準確率與每分字元(CPM)，評估你的打字速度等級。",
                en: "Calculate words per minute (WPM), accuracy and characters per minute (CPM) to grade your typing speed.",
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

      <AdSenseWrapper showAds={true} adSlot="typing-top" adFormat="horizontal" className="my-2" />

      <div className="mx-auto max-w-7xl px-6 pb-20">
        {/* L2 TrustIntro */}
        <section className="mt-8 rounded-[2rem] bg-white/80 p-6 shadow-lg">
          <h2 className="text-2xl font-black text-slate-900">
            {l({ zh: "為什麼需要打字速度計算器？", en: "Why a typing speed calculator?" }, lang)}
          </h2>
          <p className="mt-3 font-black leading-relaxed text-slate-600">
            {l(
              {
                zh: "打字速度以 WPM(每分鐘字數)衡量，標準定義為每 5 個字元算一個字。許多客服、文書與程式工作對打字速度有要求，準確率同樣重要——打得快但錯誤多，淨速會大幅下降。本工具同時計算毛速、淨速、CPM 與準確率，所有計算在本地完成。",
                en: "Typing speed is measured in WPM (words per minute), where one word equals 5 characters by convention. Many support, clerical and coding roles require minimum speeds, and accuracy matters just as much — fast but error-prone typing lowers net speed sharply. This tool computes gross WPM, net WPM, CPM and accuracy, all locally.",
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
              onClick={() => { setChars(250); setSeconds(60); setErrors(3); }}
              className="rounded-xl bg-white p-4 text-left font-black shadow-sm transition hover:shadow-md"
            >
              {l({ zh: "範例：250 字元 / 60 秒 / 3 錯 → 淨速 47 WPM", en: "Example: 250 chars / 60s / 3 errors → 47 net WPM" }, lang)}
            </button>
            <button
              onClick={() => { setChars(600); setSeconds(60); setErrors(2); }}
              className="rounded-xl bg-white p-4 text-left font-black shadow-sm transition hover:shadow-md"
            >
              {l({ zh: "範例：600 字元 / 60 秒 / 2 錯 → 淨速 118 WPM", en: "Example: 600 chars / 60s / 2 errors → 118 net WPM" }, lang)}
            </button>
          </div>
        </section>

        {/* L4 InputGuidance */}
        <section className="mt-8 rounded-[2rem] bg-sky-50 p-6 font-black">
          <h2 className="text-2xl font-black text-slate-900">{l({ zh: "輸入說明", en: "Input guidance" }, lang)}</h2>
          <p className="mt-3 font-black leading-relaxed text-slate-600">
            {l(
              {
                zh: "輸入你打出的總字元數(含空格)、所用秒數，以及打錯的字數。系統依「5 字元 = 1 字」換算 WPM，並扣除錯誤計算淨速與準確率。",
                en: "Enter the total characters you typed (including spaces), the seconds taken, and the number of mistakes. WPM is derived using the 5-characters-per-word convention; errors are subtracted to compute net speed and accuracy.",
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
                <span className="text-sm font-black text-slate-700">{l({ zh: "總字元數", en: "Total chars" }, lang)}</span>
                <input
                  type="number"
                  value={chars}
                  onChange={(e) => setChars(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-3 font-black"
                />
              </label>
              <label className="block font-black">
                <span className="text-sm font-black text-slate-700">{l({ zh: "用時(秒)", en: "Time (sec)" }, lang)}</span>
                <input
                  type="number"
                  value={seconds}
                  onChange={(e) => setSeconds(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-3 font-black"
                />
              </label>
              <label className="block font-black">
                <span className="text-sm font-black text-slate-700">{l({ zh: "錯誤字數", en: "Errors" }, lang)}</span>
                <input
                  type="number"
                  value={errors}
                  onChange={(e) => setErrors(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-3 font-black"
                />
              </label>
            </div>
          </div>
          <div className="rounded-[2rem] bg-cyan-50 p-6 shadow-lg lg:w-64">
            <h3 className="text-lg font-black text-slate-900">{l({ zh: "速度等級", en: "Speed grade" }, lang)}</h3>
            <p className="mt-2 text-4xl font-black text-sky-600">{result.netWpm}</p>
            <p className="mt-1 font-black text-slate-600">{l({ zh: "淨速 WPM", en: "Net WPM" }, lang)}</p>
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
              <p className="text-sm font-black text-slate-500">{l({ zh: "等級", en: "Grade" }, lang)}</p>
              <p className="mt-1 text-xl font-black text-slate-900">{l(result.grade, lang)}</p>
            </div>
            <div className="rounded-xl bg-cyan-50 p-4 font-black">
              <p className="text-sm font-black text-slate-500">{l({ zh: "毛速", en: "Gross WPM" }, lang)}</p>
              <p className="mt-1 text-xl font-black text-slate-900">{result.grossWpm}</p>
            </div>
            <div className="rounded-xl bg-blue-50 p-4 font-black">
              <p className="text-sm font-black text-slate-500">{l({ zh: "準確率", en: "Accuracy" }, lang)}</p>
              <p className="mt-1 text-xl font-black text-slate-900">{result.accuracy}%</p>
            </div>
          </div>
        </section>

        {/* L8 ScenarioComparison */}
        <section className="mt-8 rounded-[2rem] bg-white/80 p-6 shadow-lg">
          <h2 className="text-2xl font-black text-slate-900">{l({ zh: "情境比較", en: "Scenario comparison" }, lang)}</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl bg-sky-50 p-4 font-black">
              <p className="font-black text-slate-900">{l({ zh: "客服 / 文書職位", en: "Support / clerical roles" }, lang)}</p>
              <p className="mt-2 font-black text-slate-600">
                {l(
                  {
                    zh: "多數客服職位要求 40 WPM 以上，文書類常要求 50–60 WPM。準確率須維持 95% 以上，否則溝通效率反而下降。",
                    en: "Most support roles require 40+ WPM, clerical roles often 50–60 WPM. Accuracy should stay above 95%, otherwise efficiency drops.",
                  },
                  lang
                )}
              </p>
              <p className="mt-2 font-black text-sky-700">{l({ zh: "建議：先求準，再求快", en: "Tip: accuracy first, then speed" }, lang)}</p>
            </div>
            <div className="rounded-xl bg-cyan-50 p-4 font-black">
              <p className="font-black text-slate-900">{l({ zh: "毛速 vs 淨速", en: "Gross vs net WPM" }, lang)}</p>
              <p className="mt-2 font-black text-slate-600">
                {l(
                  {
                    zh: "毛速只看打字量，淨速扣除錯誤後才是真實產出。每個錯誤約等於少打一個字，錯誤越多兩者差距越大。",
                    en: "Gross WPM only counts volume; net WPM subtracts errors to reflect true output. Each error costs roughly one word, widening the gap.",
                  },
                  lang
                )}
              </p>
              <p className="mt-2 font-black text-cyan-700">{l({ zh: "建議：以淨速衡量真實能力", en: "Tip: judge ability by net WPM" }, lang)}</p>
            </div>
          </div>
        </section>

        {/* L9 EmotionConversion Upper */}
        <section className="mt-8 rounded-[2rem] bg-gradient-to-r from-sky-100 to-cyan-100 p-6 font-black">
          <h2 className="text-2xl font-black text-slate-900">{l({ zh: "同樣的速度，不同的意義", en: "Same speed, different meaning" }, lang)}</h2>
          <p className="mt-3 font-black leading-relaxed text-slate-700">
            {l(
              {
                zh: "60 WPM 在 99% 準確率下是專業表現，在 80% 準確率下卻可能不斷需要回頭修改，反而拖慢整體工作。速度與準確率必須一起看，單看其中一項都會誤判真實能力。",
                en: "60 WPM at 99% accuracy is professional; at 80% accuracy it can mean constant corrections that slow you down overall. Speed and accuracy must be read together — looking at either alone misjudges true ability.",
              },
              lang
            )}
          </p>
        </section>

        {/* L10 EmotionConversion Lower */}
        <section className="mt-8 rounded-[2rem] bg-gradient-to-r from-cyan-100 to-blue-100 p-6 font-black">
          <h2 className="text-2xl font-black text-slate-900">{l({ zh: "練習錯誤的代價", en: "The cost of wrong practice" }, lang)}</h2>
          <p className="mt-3 font-black leading-relaxed text-slate-700">
            {l(
              {
                zh: "一味追求速度而忽略準確率，會養成回頭刪改的壞習慣，長期反而降低淨速。先以正確的指法與節奏穩定準確率，速度自然會跟上。用數據追蹤進步，才是有效率的練習。",
                en: "Chasing speed while ignoring accuracy builds a habit of deleting and retyping, which lowers net speed over time. Stabilize accuracy with proper fingering first, and speed follows. Tracking with data is the efficient way to improve.",
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
              <p className="mt-2 font-black text-slate-700">{l({ zh: "準確率低於 95%？→ 先練準確", en: "Accuracy below 95%? → train accuracy" }, lang)}</p>
            </div>
            <div className="rounded-xl bg-cyan-50 p-4 font-black">
              <p className="text-3xl font-black text-cyan-600">2</p>
              <p className="mt-2 font-black text-slate-700">{l({ zh: "淨速低於 40？→ 練習指法節奏", en: "Net WPM below 40? → drill rhythm" }, lang)}</p>
            </div>
            <div className="rounded-xl bg-blue-50 p-4 font-black">
              <p className="text-3xl font-black text-blue-600">3</p>
              <p className="mt-2 font-black text-slate-700">{l({ zh: "想達專業級？→ 目標 80 WPM", en: "Want pro level? → aim for 80 WPM" }, lang)}</p>
            </div>
          </div>
        </section>

        {/* L12 Knowledge */}
        <section className="mt-8 rounded-[2rem] bg-white/80 p-6 shadow-lg">
          <h2 className="text-2xl font-black text-slate-900">{l({ zh: "知識庫", en: "Knowledge" }, lang)}</h2>
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="font-black text-slate-900">{l({ zh: "WPM 如何計算", en: "How WPM is calculated" }, lang)}</h3>
              <p className="mt-1 font-black text-slate-600">
                {l(
                  {
                    zh: "標準定義為每 5 個字元(含空格)算一個字。WPM = (字元數 / 5) / 分鐘數。這讓不同長度的單字能公平比較。",
                    en: "By convention, 5 characters (including spaces) equal one word. WPM = (characters / 5) / minutes. This lets words of different lengths be compared fairly.",
                  },
                  lang
                )}
              </p>
            </div>
            <div>
              <h3 className="font-black text-slate-900">{l({ zh: "毛速與淨速", en: "Gross vs net WPM" }, lang)}</h3>
              <p className="mt-1 font-black text-slate-600">
                {l(
                  {
                    zh: "毛速 = 全部字數 / 分鐘；淨速 = (字數 − 錯誤) / 分鐘。淨速更能反映可用的真實產出。",
                    en: "Gross = all words / minute; Net = (words − errors) / minute. Net WPM better reflects usable real output.",
                  },
                  lang
                )}
              </p>
            </div>
            <div>
              <h3 className="font-black text-slate-900">{l({ zh: "CPM 與準確率", en: "CPM and accuracy" }, lang)}</h3>
              <p className="mt-1 font-black text-slate-600">
                {l(
                  {
                    zh: "CPM 是每分鐘字元數，適合中文等以字計的語言；準確率 = (字數 − 錯誤) / 字數。兩者一起看更全面。",
                    en: "CPM is characters per minute, useful for character-based languages; accuracy = (words − errors) / words. Reading both gives a fuller picture.",
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
              <h3 className="font-black text-slate-900">{l({ zh: "平均打字速度是多少？", en: "What is average typing speed?" }, lang)}</h3>
              <p className="mt-1 font-black text-slate-600">
                {l({ zh: "一般成人約 40 WPM，熟練者 60–70 WPM，專業打字員可達 80 WPM 以上。", en: "Average adults type about 40 WPM, skilled typists 60–70 WPM, and professionals exceed 80 WPM." }, lang)}
              </p>
            </div>
            <div>
              <h3 className="font-black text-slate-900">{l({ zh: "為什麼用 5 字元算一字？", en: "Why 5 characters per word?" }, lang)}</h3>
              <p className="mt-1 font-black text-slate-600">
                {l({ zh: "這是打字測驗的國際慣例，英文單字平均約 5 字元(含空格)，能標準化比較。", en: "It is the international convention for typing tests; English words average about 5 characters including the space, enabling standardized comparison." }, lang)}
              </p>
            </div>
            <div>
              <h3 className="font-black text-slate-900">{l({ zh: "中文打字怎麼算？", en: "How is Chinese typing measured?" }, lang)}</h3>
              <p className="mt-1 font-black text-slate-600">
                {l({ zh: "中文常以 CPM(每分鐘字數)衡量，本工具的 CPM 欄位即為每分鐘字元數，可直接參考。", en: "Chinese is often measured in CPM (characters per minute); the CPM field here gives characters per minute for direct reference." }, lang)}
              </p>
            </div>
          </div>
        </section>

        {/* L14 FAQ After Ad Slot */}
        <AdSlot slot="typing-faq" position="inline" />

        {/* L15 AffiliateResources */}
        <section className="mt-8 rounded-[2rem] bg-white/80 p-6 shadow-lg">
          <h2 className="text-2xl font-black text-slate-900">{l({ zh: "推薦資源", en: "Recommended resources" }, lang)}</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto]">
            <a href="https://www.typing.com" className="block rounded-xl bg-sky-50 p-4 font-black text-slate-700 hover:bg-sky-100">
              {l({ zh: "Typing.com 免費打字練習", en: "Typing.com free typing practice" }, lang)}
            </a>
            <a href="https://www.keybr.com" className="block rounded-xl bg-cyan-50 p-4 font-black text-slate-700 hover:bg-cyan-100">
              {l({ zh: "Keybr 自適應打字訓練", en: "Keybr adaptive typing training" }, lang)}
            </a>
          </div>
        </section>
        <AdSlot slot="typing-aff" position="inline" />

        {/* L16 PremiumGate */}
        <section className="mt-8">
          <PremiumGate plan="PRO">
            <div className="rounded-[2rem] bg-gradient-to-r from-sky-600 to-cyan-600 p-6 text-white">
              <h2 className="text-2xl font-black">{l({ zh: "升級 PRO 解鎖", en: "Upgrade PRO to unlock" }, lang)}</h2>
              <p className="mt-2 font-black">
                {l(
                  {
                    zh: "多段測驗平均、進步趨勢圖、自訂測驗文本、錯誤鍵位分析、無廣告體驗。",
                    en: "Multi-session averages, progress trend charts, custom test texts, per-key error analysis, and an ad-free experience.",
                  },
                  lang
                )}
              </p>
            </div>
          </PremiumGate>
        </section>

        <AdSlot slot="typing-premium" position="inline" />
        <AdSlot slot="typing-bottom" position="inline" />
        <AdSenseWrapper showAds={true} adSlot="typing-foot" adFormat="horizontal" className="my-2" />

        {/* L17 TrustRelatedReferences */}
        <section className="mt-8 rounded-[2rem] bg-white/80 p-6 shadow-lg">
          <h2 className="text-2xl font-black text-slate-900">{l({ zh: "參考來源", en: "References" }, lang)}</h2>
          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
            <p className="font-black text-slate-600">• Ayres, R. U. (2014). Typing Speed Standards and Measurement.</p>
            <p className="font-black text-slate-600">• Dhakal, V. et al. (2018). Observations on Typing from 136M Keystrokes. CHI.</p>
            <p className="font-black text-slate-600">• ISO/IEC. Keyboard Layout and Input Performance Guidelines.</p>
            <p className="font-black text-slate-600">• MacKenzie, I.S. (2015). Human-Computer Interaction: Text Entry.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
