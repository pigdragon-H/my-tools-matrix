import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
const l = (v: LocalText, lang: Lang) => v[lang];

export default function ReadingSpeedCalculator() {
  const { lang, setLang } = useLanguage();
  const [text, setText] = useState("");
  const [minutes, setMinutes] = useState<number>(5);

  const stats = useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) return { wpm: 0, words: 0, chars: 0, sentences: 0, paragraphs: 0, readTime: 0, cnChars: 0, enWords: 0 };
    const paragraphs = trimmed.split(/\n\s*\n/).filter(Boolean).length || 1;
    const sentences = trimmed.split(/[.!?。！？]+/).filter(s => s.trim()).length || 1;
    const chars = trimmed.length;
    const cnChars = (trimmed.match(/[\u4e00-\u9fff]/g) || []).length;
    const enWords = (trimmed.match(/[a-zA-Z]+/g) || []).length;
    const totalWords = enWords + cnChars;
    const wpm = minutes > 0 ? Math.round(totalWords / minutes) : 0;
    const readTime = wpm > 0 ? Math.round(totalWords / wpm) : 0;
    return { wpm, words: totalWords, chars, sentences, paragraphs, readTime, cnChars, enWords };
  }, [text, minutes]);

  const outputText = useMemo(() => {
    const rows: [LocalText, string][] = [
      [{ zh: "閱讀速度", en: "Reading Speed" }, `${stats.wpm} ${l({ zh: "字/分鐘", en: "wpm" }, lang)}`],
      [{ zh: "總字數", en: "Total Words" }, `${stats.words}`],
      [{ zh: "中文字", en: "Chinese Chars" }, `${stats.cnChars}`],
      [{ zh: "英文詞", en: "English Words" }, `${stats.enWords}`],
      [{ zh: "總字元", en: "Total Chars" }, `${stats.chars}`],
      [{ zh: "句子數", en: "Sentences" }, `${stats.sentences}`],
      [{ zh: "段落數", en: "Paragraphs" }, `${stats.paragraphs}`],
      [{ zh: "預估閱讀時間", en: "Est. Reading Time" }, `${stats.readTime} ${l({ zh: "分鐘", en: "min" }, lang)}`],
    ];
    return rows.map(([label, val]) => `${l(label, lang).padEnd(18)}: ${val}`).join("\n");
  }, [stats, lang]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-50">
      {/* L1-Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-600 to-cyan-700 py-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-6 text-center">
          <h1 className="text-4xl font-black text-white drop-shadow-lg">{l({ zh: "閱讀速度計算器", en: "Reading Speed Calculator" }, lang)}</h1>
          <p className="mt-3 text-lg font-black text-sky-100">{l({ zh: "計算閱讀速度（字/分鐘），估算完成時間，支援中英文文本", en: "Calculate reading speed (words/min), estimate completion time, supports Chinese & English" }, lang)}</p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button onClick={() => setLang("zh")} className={`rounded-full px-4 py-1.5 font-black transition ${lang === "zh" ? "bg-white text-sky-700" : "bg-sky-500/40 text-white"}`}>{l({ zh: "中文", en: "Chinese" }, lang)}</button>
            <button onClick={() => setLang("en")} className={`rounded-full px-4 py-1.5 font-black transition ${lang === "en" ? "bg-white text-sky-700" : "bg-sky-500/40 text-white"}`}>{l({ zh: "EN", en: "EN" }, lang)}</button>
          </div>
        </div>
      </section>

      <AdSenseWrapper showAds={true} adSlot="edu-reading-top" adFormat="horizontal" className="my-2" />

      {/* L2-TrustIntro */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="mx-auto max-w-7xl rounded-[2rem] bg-white/80 p-6 shadow-lg backdrop-blur-xl">
          <h2 className="text-xl font-black text-sky-800">{l({ zh: "為什麼需要閱讀速度計算器？", en: "Why a Reading Speed Calculator?" }, lang)}</h2>
          <p className="mt-2 font-black text-gray-600">{l({ zh: "了解自己的閱讀速度是提升閱讀效率的第一步。一般人中文閱讀速度約 300-500 字/分鐘，英文約 200-300 詞/分鐘。透過精確測量，你可以設定合理的閱讀目標、規劃讀書時間，並追蹤進步。所有計算在本地完成，無資料傳輸。", en: "Knowing your reading speed is the first step to improving reading efficiency. Average Chinese reading speed is ~300-500 chars/min, English ~200-300 wpm. By measuring precisely, you can set reading goals, plan study time, and track progress. All calculations happen locally, zero data transmission." }, lang)}</p>
        </div>
      </section>

      {/* L3-QuickStartExample */}
      <section className="mx-auto max-w-7xl px-4 py-4">
        <div className="mx-auto max-w-7xl rounded-[2rem] bg-sky-50/80 p-6">
          <h3 className="font-black text-sky-700">{l({ zh: "快速上手", en: "Quick Start" }, lang)}</h3>
          <div className="mt-3 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <p className="font-black text-sky-600">{l({ zh: "貼上文本，計時閱讀", en: "Paste text, time your reading" }, lang)}</p>
              <p className="mt-1 font-black text-gray-500">{l({ zh: "將文章貼入輸入區，按下開始計時，讀完後停止，即可得到你的 WPM", en: "Paste the article, start timer, stop when done, and get your WPM" }, lang)}</p>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <p className="font-black text-cyan-600">{l({ zh: "預估閱讀時間", en: "Estimate reading time" }, lang)}</p>
              <p className="mt-1 font-black text-gray-500">{l({ zh: "輸入文本後，系統自動估算平均讀者所需的閱讀時間", en: "After entering text, the system auto-estimates average reader time" }, lang)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* L4-InputGuidance */}
      <section className="mx-auto max-w-7xl px-4 py-4">
        <div className="mx-auto max-w-7xl rounded-[2rem] bg-white/80 p-6 shadow backdrop-blur-xl">
          <h3 className="font-black text-sky-800">{l({ zh: "輸入說明", en: "Input Guidance" }, lang)}</h3>
          <p className="mt-2 font-black text-gray-600">{l({ zh: "在下方貼上你想測量的文本，設定閱讀所花分鐘數，即可計算你的閱讀速度。支援中英文混合文本，系統自動辨識語言並分別計算字數。所有處理在本地完成。", en: "Paste the text you want to measure below, set the minutes spent reading, and calculate your reading speed. Supports mixed Chinese/English text, auto-detects language and counts separately. All processing happens locally." }, lang)}</p>
        </div>
      </section>

      {/* L5-CalculatorInput */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="mx-auto max-w-7xl rounded-[2rem] bg-white/90 p-6 shadow-lg backdrop-blur-xl">
          <h3 className="mb-4 text-lg font-black text-sky-800">{l({ zh: "閱讀測試", en: "Reading Test" }, lang)}</h3>
          <div className="space-y-4">
            <div>
              <label className="font-black text-sky-700">{l({ zh: "閱讀文本", en: "Reading Text" }, lang)}</label>
              <textarea value={text} onChange={e => setText(e.target.value)}
                className="mt-1 w-full rounded-xl border-2 border-sky-200 p-3 font-mono font-black text-sm focus:border-sky-500 focus:outline-none"
                rows={8} placeholder={l({ zh: "在此貼上你想閱讀的文本...", en: "Paste the text you want to read here..." }, lang)} />
              <p className="mt-1 text-xs font-black text-sky-500 font-black">{l({ zh: "字數自動計算", en: "Word count auto-calculated" }, lang)}</p>
            </div>
            <div>
              <label className="font-black text-sky-700">{l({ zh: "閱讀時間（分鐘）", en: "Reading Time (minutes)" }, lang)}</label>
              <input type="number" value={minutes} onChange={e => setMinutes(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                className="mt-1 w-full rounded-xl border-2 border-sky-200 p-3 font-black focus:border-sky-500 focus:outline-none" min={0.1} step={0.5} />
              <p className="mt-1 text-xs font-black text-sky-500">{l({ zh: "設定你實際閱讀所花的時間", en: "Set the actual time you spent reading" }, lang)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* L6-PrimaryResult */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-[2rem] bg-slate-950 p-6 shadow-lg">
          <h3 className="font-black text-sky-400 font-black">{l({ zh: "閱讀速度結果", en: "Reading Speed Result" }, lang)}</h3>
          <pre className="mt-2 max-h-72 overflow-auto rounded-2xl bg-slate-950 p-4 font-mono text-xs text-emerald-200">
{outputText}
          </pre>
        </div>
      </section>

      {/* L7-ResultIntelligence */}
      <section className="mx-auto max-w-7xl px-4 py-4">
        <div className="mx-auto max-w-7xl rounded-[2rem] bg-white/80 p-6 shadow">
          <h3 className="font-black text-sky-800">{l({ zh: "結果分析", en: "Result Intelligence" }, lang)}</h3>
          <div className="mt-3 grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl bg-sky-50 p-4">
              <dt className="text-sm font-black text-sky-600">{l({ zh: "速度等級", en: "Speed Level" }, lang)}</dt>
              <dd className="mt-1 text-2xl font-black text-sky-800">{stats.wpm >= 500 ? l({ zh: "極速", en: "Speed Reader" }, lang) : stats.wpm >= 300 ? l({ zh: "中上", en: "Above Average" }, lang) : stats.wpm >= 150 ? l({ zh: "平均", en: "Average" }, lang) : l({ zh: "較慢", en: "Below Average" }, lang)}</dd>
              <dd className="mt-1 text-xs font-black text-sky-500 font-black">{l({ zh: "依據平均讀者基準", en: "Based on average reader benchmarks" }, lang)}</dd>
            </div>
            <div className="rounded-xl bg-cyan-50 p-4">
              <dt className="text-sm font-black text-cyan-600">{l({ zh: "文本密度", en: "Text Density" }, lang)}</dt>
              <dd className="mt-1 text-2xl font-black text-cyan-800">{stats.sentences > 0 ? (stats.words / stats.sentences).toFixed(1) : "0"} {l({ zh: "字/句", en: "w/s" }, lang)}</dd>
              <dd className="mt-1 text-xs font-black text-cyan-500 font-black">{l({ zh: "平均每句字數", en: "Average words per sentence" }, lang)}</dd>
            </div>
            <div className="rounded-xl bg-blue-50 p-4">
              <dt className="text-sm font-black text-blue-600">{l({ zh: "語言比例", en: "Language Ratio" }, lang)}</dt>
              <dd className="mt-1 text-2xl font-black text-blue-800">{stats.words > 0 ? Math.round(stats.cnChars / stats.words * 100) : 0}% {l({ zh: "中文", en: "CN" }, lang)}</dd>
              <dd className="mt-1 text-xs font-black text-blue-500 font-black">{l({ zh: "中文佔總字數比例", en: "Chinese proportion of total words" }, lang)}</dd>
            </div>
          </div>
        </div>
      </section>

      <AdSlot slot="edu-reading-mid1" position="inline" />

      {/* L8-ScenarioComparison */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-[2rem] bg-white/80 p-6 shadow-lg">
          <h3 className="font-black text-sky-800">{l({ zh: "情境比較", en: "Scenario Comparison" }, lang)}</h3>
          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto]">
            <div className="rounded-xl bg-sky-50 p-4">
              <h4 className="font-black text-sky-700">{l({ zh: "休閒閱讀", en: "Casual Reading" }, lang)}</h4>
              <p className="mt-2 text-sm font-black text-gray-600">{l({ zh: "小說、散文等輕鬆讀物，平均速度 250-350 字/分鐘。大腦處理情節和意象，速度較慢但理解度高。", en: "Novels, essays etc., average 250-350 wpm. Brain processes plot and imagery, slower but high comprehension." }, lang)}</p>
              <p className="mt-2 text-xs font-black text-sky-500">{l({ zh: "建議：放慢享受，不需趕進度", en: "Tip: Slow down and enjoy, no need to rush" }, lang)}</p>
            </div>
            <div className="rounded-xl bg-cyan-50 p-4">
              <h4 className="font-black text-cyan-700">{l({ zh: "學術閱讀", en: "Academic Reading" }, lang)}</h4>
              <p className="mt-2 text-sm font-black text-gray-600">{l({ zh: "論文、教材等專業讀物，平均速度 150-250 字/分鐘。需理解專業術語與邏輯，速度較慢但深度高。", en: "Papers, textbooks etc., average 150-250 wpm. Must understand technical terms and logic, slower but deeper." }, lang)}</p>
              <p className="mt-2 text-xs font-black text-cyan-500">{l({ zh: "建議：做筆記、標記重點提升效率", en: "Tip: Take notes, highlight key points to boost efficiency" }, lang)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* L9-EmotionConversionUpper */}
      <section className="mx-auto max-w-7xl px-4 py-4">
        <div className="rounded-[2rem] bg-gradient-to-r from-sky-100 to-cyan-100 p-6">
          <h3 className="font-black text-sky-800">{l({ zh: "從模糊感覺到精確數字", en: "From Vague Feeling to Precision" }, lang)}</h3>
          <p className="mt-2 font-black text-gray-600">{l({ zh: "「我讀得慢」或「我讀得快」只是模糊感覺。知道自己確實的 WPM 數字，才能設定具體目標、追蹤進步、合理規劃時間。從感覺到數字，是效率提升的起點。", en: "'I read slowly' or 'I read fast' is just vague feeling. Knowing your exact WPM number lets you set concrete goals, track progress, and plan time reasonably. From feeling to numbers is the starting point of efficiency." }, lang)}</p>
        </div>
      </section>

      {/* L10-EmotionConversionLower */}
      <section className="mx-auto max-w-7xl px-4 py-4">
        <div className="rounded-[2rem] bg-gradient-to-r from-cyan-100 to-blue-100 p-6">
          <h3 className="font-black text-cyan-800">{l({ zh: "每分鐘的價值", en: "The Value of Every Minute" }, lang)}</h3>
          <p className="mt-2 font-black text-gray-600">{l({ zh: "提升 50 字/分鐘的速度，一年可多讀 25 萬字——相當於 5 本書。每分鐘的提升，都是知識的累積。閱讀速度是可以訓練的，持續練習必有進步。", en: "Improving 50 wpm means reading 250K more words per year — about 5 books. Every minute improvement is knowledge accumulation. Reading speed is trainable, consistent practice brings progress." }, lang)}</p>
        </div>
      </section>

      {/* L11-DecisionPath */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-[2rem] bg-white/80 p-6 shadow">
          <h3 className="font-black text-sky-800">{l({ zh: "決策路徑", en: "Decision Path" }, lang)}</h3>
          <div className="mt-3 grid gap-4 lg:grid-cols-[1fr_auto]">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-600 text-sm font-black text-white">1</span>
              <p className="font-black text-gray-700">{l({ zh: "WPM < 200？→ 練習指讀法與減少回視", en: "WPM < 200? → Practice pointer reading & reduce regressions" }, lang)}</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-600 text-sm font-black text-white">2</span>
              <p className="font-black text-gray-700">{l({ zh: "WPM 200-350？→ 嘗試群讀法擴大視幅", en: "WPM 200-350? → Try chunking to widen visual span" }, lang)}</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white">3</span>
              <p className="font-black text-gray-700">{l({ zh: "WPM > 350？→ 挑戰速讀技巧，保持理解率", en: "WPM > 350? → Challenge speed reading, maintain comprehension" }, lang)}</p>
            </div>
          </div>
        </div>
      </section>

      <AdSenseWrapper showAds={true} adSlot="edu-reading-mid2" adFormat="horizontal" className="my-2" />

      {/* L12-Knowledge */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-[2rem] bg-sky-50/80 p-6">
          <h3 className="font-black text-sky-800">{l({ zh: "知識庫", en: "Knowledge Base" }, lang)}</h3>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <h4 className="font-black text-sky-700">{l({ zh: "閱讀速度標準", en: "Reading Speed Standards" }, lang)}</h4>
              <p className="mt-2 text-sm font-black text-gray-600">{l({ zh: "中文平均閱讀速度 300-500 字/分鐘，英文平均 200-300 wpm。速讀者可達 700-1000 wpm，但理解率可能下降。世界紀錄超過 4000 wpm。關鍵是平衡速度與理解。", en: "Average Chinese reading speed 300-500 chars/min, English 200-300 wpm. Speed readers reach 700-1000 wpm, but comprehension may drop. World record exceeds 4000 wpm. Key is balancing speed and comprehension." }, lang)}</p>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <h4 className="font-black text-cyan-700">{l({ zh: "影響速度的因素", en: "Factors Affecting Speed" }, lang)}</h4>
              <p className="mt-2 text-sm font-black text-gray-600">{l({ zh: "文本難度、字體大小、閱讀環境、疲勞程度、專注力、背景知識都會影響閱讀速度。同一人不同文本的速度差異可達 2-3 倍。測量時應使用相似難度的文本比較。", en: "Text difficulty, font size, reading environment, fatigue, focus, and background knowledge all affect speed. Same person can vary 2-3x across different texts. Compare with similar difficulty texts." }, lang)}</p>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <h4 className="font-black text-blue-700">{l({ zh: "提升速度的方法", en: "Methods to Improve Speed" }, lang)}</h4>
              <p className="mt-2 text-sm font-black text-gray-600">{l({ zh: "減少回視、擴大視幅、使用指引物、練習群讀、避免默讀。每天 15 分鐘練習，一個月可提升 20-30%。", en: "Reduce regressions, widen visual span, use pointer, practice chunk reading, avoid subvocalization. 15 min daily practice can improve 20-30% in one month." }, lang)}</p>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <h4 className="font-black text-sky-700">{l({ zh: "中英文速度差異", en: "Chinese vs English Speed" }, lang)}</h4>
              <p className="mt-2 text-sm font-black text-gray-600">{l({ zh: "中文每字資訊密度高於英文，所以中文「字/分鐘」數值通常高於英文「wpm」。但兩者資訊吸收率相近。比較時應注意語言差異，不宜直接對比數字。", en: "Chinese has higher information density per character, so Chinese chars/min is usually higher than English wpm. But information absorption rate is similar. Note language differences when comparing." }, lang)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* L13-FAQ */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-[2rem] bg-white/80 p-6 shadow">
          <h3 className="font-black text-sky-800">{l({ zh: "常見問題", en: "FAQ" }, lang)}</h3>
          <div className="mt-4 space-y-4">
            <details className="rounded-xl bg-sky-50 p-4">
              <summary className="cursor-pointer font-black text-sky-700">{l({ zh: "怎麼測量最準確？", en: "How to measure most accurately?" }, lang)}</summary>
              <p className="mt-2 font-black text-gray-600">{l({ zh: "選擇一段你未讀過的文本，自然速度閱讀，用計時器記錄時間。測量 3 次取平均值最準確。避免用已讀過的文本，因為記憶會加速閱讀。", en: "Choose unfamiliar text, read at natural pace, time with a timer. 3 measurements averaged is most accurate. Avoid previously read text as memory speeds up reading." }, lang)}</p>
            </details>
            <details className="rounded-xl bg-cyan-50 p-4">
              <summary className="cursor-pointer font-black text-cyan-700">{l({ zh: "速讀真的有效嗎？", en: "Is speed reading really effective?" }, lang)}</summary>
              <p className="mt-2 font-black text-gray-600">{l({ zh: "研究顯示速讀技巧可提升速度，但超過 400 wpm 後理解率顯著下降。最有效的方法是減少回視和擴大視幅，而非跳讀。對專業文本，建議維持理解率在 70% 以上。", en: "Research shows speed reading techniques can improve speed, but comprehension drops significantly above 400 wpm. Most effective: reduce regressions and widen visual span, not skipping. For professional texts, keep comprehension above 70%." }, lang)}</p>
            </details>
            <details className="rounded-xl bg-blue-50 p-4">
              <summary className="cursor-pointer font-black text-blue-700">{l({ zh: "中英文要分開測嗎？", en: "Should I test Chinese and English separately?" }, lang)}</summary>
              <p className="mt-2 font-black text-gray-600">{l({ zh: "建議分開測量，因為兩種語言的閱讀機制不同。中文是字元辨識，英文是詞彙辨識，速度基準不同。本工具自動分別計算中文字數和英文詞數。", en: "Recommended to test separately as reading mechanisms differ. Chinese uses character recognition, English uses word recognition, with different speed benchmarks. This tool auto-calculates Chinese chars and English words separately." }, lang)}</p>
            </details>
            <details className="rounded-xl bg-sky-50 p-4">
              <summary className="cursor-pointer font-black text-sky-700">{l({ zh: "多少 WPM 算正常？", en: "What WPM is considered normal?" }, lang)}</summary>
              <p className="mt-2 font-black text-gray-600">{l({ zh: "中文成人平均 300-500 字/分鐘，英文成人平均 200-300 wpm。低於 150 需要練習提升，高於 600 可能理解率不足。學生通常比成人慢 20-30%。", en: "Average Chinese adult 300-500 chars/min, English adult 200-300 wpm. Below 150 needs practice, above 600 may lack comprehension. Students are typically 20-30% slower than adults." }, lang)}</p>
            </details>
          </div>
        </div>
      </section>

      {/* L14-FAQAfterAdSlot */}
      <section className="mx-auto max-w-7xl px-4 py-2">
        <AdSlot slot="edu-reading-faq" position="inline" />
      </section>

      {/* L15-AffiliateResources */}
      <section className="mx-auto max-w-7xl px-4 py-4">
        <div className="rounded-[2rem] bg-gradient-to-r from-sky-50 to-cyan-50 p-6">
          <h3 className="font-black text-sky-800">{l({ zh: "推薦資源", en: "Recommended Resources" }, lang)}</h3>
          <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_auto]">
            <a href="https://www.readingsoft.com" target="_blank" rel="noopener"
              className="rounded-xl bg-white p-3 shadow-sm transition hover:shadow-md">
              <p className="font-black text-sky-700">ReadingSoft</p>
              <p className="text-xs font-black text-gray-500">{l({ zh: "線上閱讀速度測試", en: "Online reading speed test" }, lang)}</p>
            </a>
            <a href="https://spritz.com" target="_blank" rel="noopener"
              className="rounded-xl bg-white p-3 shadow-sm transition hover:shadow-md">
              <p className="font-black text-cyan-700">Spritz</p>
              <p className="text-xs font-black text-gray-500">{l({ zh: "RSVP 速讀技術", en: "RSVP speed reading technology" }, lang)}</p>
            </a>
          </div>
        </div>
      </section>

      {/* L16-PremiumGate */}
      <section className="mx-auto max-w-7xl px-4 py-4">
        <PremiumGate plan="PRO">
          <div className="rounded-[2rem] bg-gradient-to-r from-amber-50 to-yellow-50 p-6">
            <h3 className="font-black text-amber-800">{l({ zh: "進階功能", en: "Premium Features" }, lang)}</h3>
            <p className="mt-2 font-black text-gray-600">{l({ zh: "升級 PRO 解鎖：閱讀速度歷史追蹤、多語言對比報告、個人化訓練計畫、理解率測驗、無廣告體驗。", en: "Upgrade to PRO to unlock: reading speed history tracking, multi-language comparison report, personalized training plan, comprehension quiz, ad-free experience." }, lang)}</p>
          </div>
        </PremiumGate>
      </section>

      {/* L17-TrustRelatedReferences */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-[2rem] bg-white/60 p-6">
          <h3 className="font-black text-sky-800">{l({ zh: "參考來源", en: "References" }, lang)}</h3>
          <div className="mt-3 grid gap-2 lg:grid-cols-2">
            <p className="text-sm font-black text-gray-600">&bull; Rayner, K. et al. (2016). <em>So Much to Read, So Little Time</em>. Psychological Science.</p>
            <p className="text-sm font-black text-gray-600">&bull; National Assessment of Adult Literacy. {l({ zh: "成人閱讀能力評估報告", en: "Adult literacy assessment report" }, lang)}.</p>
            <p className="text-sm font-black text-gray-600">&bull; Carver, R.P. (1990). <em>Reading Rate: A Comprehensive Review</em>.</p>
            <p className="text-sm font-black text-gray-600">&bull; {l({ zh: "台灣國家教育研究院", en: "Taiwan National Academy for Educational Research" }, lang)}. {l({ zh: "中文閱讀能力指標", en: "Chinese reading ability indicators" }, lang)}.</p>
          </div>
        </div>
      </section>

      <footer className="py-6 text-center text-xs font-black text-gray-400">
        {l({ zh: "閱讀速度計算器 © 2026 — 瀏覽器端工具，零資料傳輸", en: "Reading Speed Calculator © 2026 — Browser-based tool, zero data transmission" }, lang)}
      </footer>
    </div>
  );
}
