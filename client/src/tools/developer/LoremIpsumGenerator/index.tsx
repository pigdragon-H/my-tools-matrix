import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
const l = (v: LocalText, lang: Lang) => v[lang];

const LOREM_WORDS = [
  "lorem","ipsum","dolor","sit","amet","consectetur","adipiscing","elit",
  "sed","do","eiusmod","tempor","incididunt","ut","labore","et","dolore",
  "magna","aliqua","enim","ad","minim","veniam","quis","nostrud",
  "exercitation","ullamco","laboris","nisi","aliquip","ex","ea","commodo",
  "consequat","duis","aute","irure","in","reprehenderit","voluptate",
  "velit","esse","cillum","fugiat","nulla","pariatur","excepteur","sint",
  "occaecat","cupidatat","non","proident","sunt","culpa","qui","officia",
  "deserunt","mollit","anim","id","est","laborum","perspiciatis","unde",
  "omnis","iste","natus","error","voluptatem","accusantium","doloremque",
  "laudantium","totam","rem","aperiam","eaque","ipsa","quae","ab","illo",
  "inventore","veritatis","quasi","architecto","beatae","vitae","dicta",
  "explicabo","nemo","ipsam","voluptas","aspernatur","aut","odit","fugit",
];

const SENTENCES: LocalText[] = [
  { zh: " Lorem ipsum dolor sit amet, consectetur adipiscing elit.", en: " Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { zh: " Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.", en: " Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
  { zh: " Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.", en: " Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris." },
  { zh: " Nisi ut aliquip ex ea commodo consequat.", en: " Nisi ut aliquip ex ea commodo consequat." },
  { zh: " Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.", en: " Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore." },
  { zh: " Excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt.", en: " Excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt." },
  { zh: " Perspiciatis unde omnis iste natus error voluptatem accusantium doloremque laudantium.", en: " Perspiciatis unde omnis iste natus error voluptatem accusantium doloremque laudantium." },
  { zh: " Totam rem aperiam eaque ipsa quae ab illo inventore veritatis et quasi architecto.", en: " Totam rem aperiam eaque ipsa quae ab illo inventore veritatis et quasi architecto." },
  { zh: " Beatae vitae dicta explicabo nemo ipsam voluptas aspernatur aut odit fugit.", en: " Beatae vitae dicta explicabo nemo ipsam voluptas aspernatur aut odit fugit." },
  { zh: " Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.", en: " Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit." },
];

type GenMode = "paragraphs" | "sentences" | "words";
type CopyFormat = "plain" | "html-p" | "html-li" | "markdown";

const MODE_LABELS: Record<GenMode, LocalText> = {
  paragraphs: { zh: "段落", en: "Paragraphs" },
  sentences: { zh: "句子", en: "Sentences" },
  words: { zh: "單字", en: "Words" },
};

const FORMAT_LABELS: Record<CopyFormat, LocalText> = {
  plain: { zh: "純文字", en: "Plain Text" },
  "html-p": { zh: "HTML <p>", en: "HTML <p>" },
  "html-li": { zh: "HTML <li>", en: "HTML <li>" },
  markdown: { zh: "Markdown", en: "Markdown" },
};

function seededPick(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateWords(count: number): string {
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(LOREM_WORDS[Math.floor(seededPick(i * 7 + 3) * LOREM_WORDS.length)]);
  }
  return result.join(" ");
}

function generateSentences(count: number): string[] {
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    const idx = i % SENTENCES.length;
    const s = SENTENCES[idx];
    result.push(s.en);
  }
  return result;
}

function generateParagraphs(count: number): string[] {
  const result: string[] = [];
  for (let p = 0; p < count; p++) {
    const sentCount = 4 + Math.floor(seededPick(p * 13 + 7) * 5);
    const para: string[] = [];
    for (let s = 0; s < sentCount; s++) {
      const idx = (p * 7 + s) % SENTENCES.length;
      para.push(SENTENCES[idx].en);
    }
    result.push(para.join("").trim());
  }
  return result;
}

function formatOutput(items: string[], mode: GenMode, fmt: CopyFormat): string {
  if (fmt === "plain") return items.join(mode === "paragraphs" ? "\n\n" : mode === "sentences" ? " " : " ");
  if (fmt === "html-p") return items.map(i => `<p>${i}</p>`).join("\n");
  if (fmt === "html-li") return `<ul>\n${items.map(i => `  <li>${i}</li>`).join("\n")}\n</ul>`;
  if (fmt === "markdown") return items.map(i => mode === "paragraphs" ? i : `- ${i}`).join("\n");
  return items.join(" ");
}

export default function LoremIpsumGenerator() {
  const { lang } = useLanguage();
  const [mode, setMode] = useState<GenMode>("paragraphs");
  const [count, setCount] = useState(3);
  const [copyFormat, setCopyFormat] = useState<CopyFormat>("plain");
  const [copied, setCopied] = useState(false);

  const generated = useMemo(() => {
    let items: string[];
    if (mode === "paragraphs") items = generateParagraphs(count);
    else if (mode === "sentences") items = generateSentences(count);
    else items = [generateWords(count)];
    return items;
  }, [mode, count]);

  const output = useMemo(() => formatOutput(generated, mode, copyFormat), [generated, mode, copyFormat]);

  const wordCount = output.split(/\s+/).filter(Boolean).length;
  const charCount = output.length;

  const handleCopy = () => {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      {/* L1-Hero */}
      <section className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 py-16">
        <div className="absolute inset-0 opacity-20 radial-gradient" style={{ background: "radial-gradient(circle at 30% 40%, rgba(255,255,255,0.3), transparent 60%)" }} />
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h1 className="text-4xl font-black text-white drop-shadow-lg">{l({ zh: "Lorem Ipsum 產生器", en: "Lorem Ipsum Generator" }, lang)}</h1>
          <p className="mt-3 text-lg font-black text-violet-100">{l({ zh: "快速產生 Lorem Ipsum 假文，支援段落/句子/單字模式與多種格式匯出", en: "Generate Lorem Ipsum placeholder text with paragraph/sentence/word modes and multi-format export" }, lang)}</p>
        </div>
      </section>

      {/* L2-TrustIntro */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-[2rem] bg-white/80 p-6 shadow-lg backdrop-blur">
          <h2 className="text-xl font-black text-violet-800">{l({ zh: "為什麼需要 Lorem Ipsum？", en: "Why Lorem Ipsum?" }, lang)}</h2>
          <p className="mt-2 font-black text-gray-600">{l({ zh: "Lorem Ipsum 是設計與排版領域的標準假文，源自西元前 45 年的拉丁文經典。無論是網頁原型、印刷排版還是 UI 設計，Lorem Ipsum 能讓你專注於視覺結構，而不被真實內容干擾。本工具完全在瀏覽器端執行，不傳送任何資料到伺服器。", en: "Lorem Ipsum is the industry standard placeholder text in design and typesetting, originating from a Latin classic from 45 BC. Whether for web prototypes, print layouts, or UI design, Lorem Ipsum lets you focus on visual structure without real content distraction. This tool runs entirely in your browser — no data is sent to any server." }, lang)}</p>
        </div>
      </section>

      {/* L3-QuickStartExample */}
      <section className="mx-auto max-w-7xl px-4 py-4">
        <div className="rounded-[2rem] bg-violet-100/60 p-6">
          <div className="grid gap-4 lg:grid-cols-2">
          <h3 className="font-black text-violet-700">{l({ zh: "快速上手", en: "Quick Start" }, lang)}</h3>
          <div className="mt-3 rounded-xl bg-white p-4 font-mono text-sm text-gray-700">
            <p className="font-black text-violet-600"><span className="font-black">3</span> {l(MODE_LABELS.paragraphs, lang)} &rarr; Plain Text &rarr; {l({ zh: "一鍵複製", en: "One-click copy" }, lang)}</p>
            <p className="mt-2 font-black text-gray-500">"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt..."</p>
          </div>
          </div>
        </div>
      </section>

      {/* L4-InputGuidance */}
      <section className="mx-auto max-w-7xl px-4 py-4">
        <div className="rounded-[2rem] bg-white/70 p-5 shadow">
          <h3 className="font-black text-violet-800">{l({ zh: "輸入說明", en: "Input Guidance" }, lang)}</h3>
          <p className="mt-2 font-black text-gray-600">{l({ zh: "選擇產生模式（段落/句子/單字），設定數量（1–50），挑選匯出格式，即可產生 Lorem Ipsum 假文。所有計算在本地完成。", en: "Choose generation mode (paragraphs/sentences/words), set count (1–50), pick export format, and generate. All processing happens locally." }, lang)}</p>
        </div>
      </section>

      <AdSenseWrapper showAds={true} adSlot="dev-lipsum-top" adFormat="horizontal" className="my-2" />

      {/* L5-CalculatorInput */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-[2rem] bg-white/90 p-6 shadow-xl">
          <h3 className="mb-4 text-lg font-black text-violet-800">{l({ zh: "產生設定", en: "Generation Settings" }, lang)}</h3>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Mode */}
            <div>
              <label className="mb-1 block text-sm font-black text-gray-700">{l({ zh: "產生模式", en: "Generation Mode" }, lang)}</label>
              <div className="flex gap-2">
                {(["paragraphs", "sentences", "words"] as GenMode[]).map(m => (
                  <button key={m} onClick={() => setMode(m)}
                    className={`rounded-xl px-4 py-2 text-sm font-black transition ${mode === m ? "bg-violet-600 text-white shadow-lg" : "bg-violet-100 text-violet-700 hover:bg-violet-200"}`}>
                    {l(MODE_LABELS[m], lang)}
                  </button>
                ))}
              </div>
            </div>
            {/* Count */}
            <div>
              <label className="mb-1 block text-sm font-black text-gray-700">
                {l({ zh: "數量", en: "Count" }, lang)}
                <span className="ml-2 font-black text-violet-600">{count}</span>
              </label>
              <input type="range" min={1} max={50} value={count}
                onChange={e => setCount(Number(e.target.value))}
                className="w-full accent-violet-600" />
              <div className="mt-1 flex justify-between font-black text-xs text-gray-400">
                <span className="font-black">1</span><span className="font-black">50</span>
              </div>
            </div>
            {/* Format */}
            <div>
              <label className="mb-1 block text-sm font-black text-gray-700">{l({ zh: "匯出格式", en: "Export Format" }, lang)}</label>
              <div className="grid grid-cols-2 gap-2">
                {(["plain", "html-p", "html-li", "markdown"] as CopyFormat[]).map(f => (
                  <button key={f} onClick={() => setCopyFormat(f)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-black transition ${copyFormat === f ? "bg-purple-600 text-white shadow" : "bg-purple-50 text-purple-700 hover:bg-purple-100"}`}>
                    {l(FORMAT_LABELS[f], lang)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* L6-PrimaryResult */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-[2rem] bg-gradient-to-br from-violet-600 to-purple-700 p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black">{l({ zh: "產生結果", en: "Generated Result" }, lang)}</h3>
            <button onClick={handleCopy}
              className={`rounded-xl px-5 py-2 font-black transition ${copied ? "bg-green-400 text-green-900" : "bg-white text-violet-700 hover:bg-violet-100"}`}>
              {copied ? l({ zh: "已複製 ✓", en: "Copied ✓" }, lang) : l({ zh: "一鍵複製", en: "Copy" }, lang)}
            </button>
          </div>
          <div className="mt-4 max-h-72 overflow-y-auto rounded-xl bg-white/10 p-4 font-mono text-sm leading-relaxed backdrop-blur">
            {output}
          </div>
          <div className="mt-3 flex gap-6 text-sm font-black text-violet-100">
            <span className="font-black">{l({ zh: "字數", en: "Words" }, lang)}: {wordCount}</span>
            <span className="font-black">{l({ zh: "字元數", en: "Characters" }, lang)}: {charCount}</span>
            <span className="font-black">{l(MODE_LABELS[mode], lang)}: {count}</span>
          </div>
        </div>
      </section>

      {/* L7-ResultIntelligence */}
      <section className="mx-auto max-w-7xl px-4 py-4">
        <div className="mx-auto max-w-7xl rounded-[2rem] bg-white/80 p-6 shadow">
          <h3 className="font-black text-violet-800">{l({ zh: "結果分析", en: "Result Intelligence" }, lang)}</h3>
          <div className="mt-3 grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl bg-violet-50 p-4">
              <dt className="text-sm font-black text-violet-600">{l({ zh: "平均段落長度", en: "Avg Paragraph Length" }, lang)}</dt>
              <dd className="mt-1 text-2xl font-black text-violet-800">
                {mode === "paragraphs" ? Math.round(wordCount / Math.max(count, 1)) + " " + l({ zh: "字", en: "words" }, lang) : "—"}
              </dd>
            </div>
            <div className="rounded-xl bg-purple-50 p-4">
              <dt className="text-sm font-black text-purple-600">{l({ zh: "預估閱讀時間", en: "Est. Reading Time" }, lang)}</dt>
              <dd className="mt-1 text-2xl font-black text-purple-800">
                {Math.max(1, Math.round(wordCount / 200))} {l({ zh: "分鐘", en: "min" }, lang)}
              </dd>
            </div>
            <div className="rounded-xl bg-fuchsia-50 p-4">
              <dt className="text-sm font-black text-fuchsia-600">{l({ zh: "格式類型", en: "Format Type" }, lang)}</dt>
              <dd className="mt-1 text-2xl font-black text-fuchsia-800">{l(FORMAT_LABELS[copyFormat], lang)}</dd>
            </div>
          </div>
        </div>
      </section>

      <AdSlot slot="dev-lipsum-mid1" position="inline" />

      {/* L8-ScenarioComparison */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-[2rem] bg-white/80 p-6 shadow-lg">
          <h3 className="font-black text-violet-800">{l({ zh: "情境比較", en: "Scenario Comparison" }, lang)}</h3>
          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto]">
            <div className="rounded-xl bg-violet-50 p-4">
              <h4 className="font-black text-violet-700">{l({ zh: "網頁原型", en: "Web Prototype" }, lang)}</h4>
              <p className="mt-2 text-sm font-black text-gray-600">{l({ zh: "3–5 段 Lorem Ipsum 即可填充版面，HTML <p> 格式直接貼入模板", en: "3–5 paragraphs fill the layout. HTML <p> format pastes directly into templates" }, lang)}</p>
              <p className="mt-2 text-xs font-black text-violet-500">{l({ zh: "建議：3 段落 + HTML 格式", en: "Suggested: 3 paragraphs + HTML format" }, lang)}</p>
            </div>
            <div className="flex items-center justify-center text-2xl font-black text-violet-300">&harr;</div>
            <div className="rounded-xl bg-purple-50 p-4">
              <h4 className="font-black text-purple-700">{l({ zh: "印刷排版", en: "Print Typesetting" }, lang)}</h4>
              <p className="mt-2 text-sm font-black text-gray-600">{l({ zh: "大量段落模擬長篇文章，Markdown 格式適合文件工具", en: "Many paragraphs simulate long articles. Markdown format suits document tools" }, lang)}</p>
              <p className="mt-2 text-xs font-black text-purple-500">{l({ zh: "建議：10 段落 + Markdown 格式", en: "Suggested: 10 paragraphs + Markdown format" }, lang)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* L9-EmotionConversionUpper */}
      <section className="mx-auto max-w-7xl px-4 py-4">
        <div className="rounded-[2rem] bg-gradient-to-r from-violet-100 to-purple-100 p-6">
          <h3 className="font-black text-violet-800">{l({ zh: "從空白到有內容", en: "From Blank to Filled" }, lang)}</h3>
          <p className="mt-2 font-black text-gray-600">{l({ zh: "空白的版面讓人焦慮——3 段 Lorem Ipsum 讓你的設計立刻從「空殼」變成「有內容的雛形」，節省數小時的假文編寫時間。", en: "Blank layouts cause anxiety — 3 paragraphs of Lorem Ipsum transform your design from 'empty shell' to 'content-rich prototype', saving hours of placeholder writing." }, lang)}</p>
        </div>
      </section>

      {/* L10-EmotionConversionLower */}
      <section className="mx-auto max-w-7xl px-4 py-4">
        <div className="rounded-[2rem] bg-gradient-to-r from-purple-100 to-fuchsia-100 p-6">
          <h3 className="font-black text-purple-800">{l({ zh: "告別手動假文", en: "No More Manual Placeholders" }, lang)}</h3>
          <p className="mt-2 font-black text-gray-600">{l({ zh: "不再一字一句手動打假文——一鍵產生、一鍵複製、一鍵貼上。你的時間應該花在設計上，不是在複製貼上拉丁文。", en: "Stop typing placeholders word by word — generate, copy, and paste in one click each. Your time belongs to design, not to copying Latin text." }, lang)}</p>
        </div>
      </section>

      {/* L11-DecisionPath */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-[2rem] bg-white/80 p-6 shadow">
          <h3 className="font-black text-violet-800">{l({ zh: "決策路徑", en: "Decision Path" }, lang)}</h3>
          <div className="mt-3 grid gap-3 lg:grid-cols-3">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600 text-sm font-black text-white">1</span>
              <p className="font-black text-gray-700">{l({ zh: "需要填滿版面？→ 選擇「段落」模式，3–5 段即可覆蓋大多數版面", en: "Need to fill a layout? → Choose 'Paragraphs' mode, 3–5 paragraphs cover most layouts" }, lang)}</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-600 text-sm font-black text-white">2</span>
              <p className="font-black text-gray-700">{l({ zh: "需要短句點綴？→ 選擇「句子」模式，精確控制句數", en: "Need short text accents? → Choose 'Sentences' mode for precise count control" }, lang)}</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-fuchsia-600 text-sm font-black text-white">3</span>
              <p className="font-black text-gray-700">{l({ zh: "需要匯入特定格式？→ 選擇對應匯出格式（HTML/Markdown），直接貼入專案", en: "Need specific format? → Pick matching export (HTML/Markdown) and paste directly into project" }, lang)}</p>
            </div>
          </div>
        </div>
      </section>

      <AdSenseWrapper showAds={true} adSlot="dev-lipsum-mid2" adFormat="horizontal" className="my-2" />

      {/* L12-Knowledge */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-[2rem] bg-violet-50/80 p-6">
          <h3 className="font-black text-violet-800">{l({ zh: "知識庫", en: "Knowledge Base" }, lang)}</h3>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <h4 className="font-black text-violet-700">{l({ zh: "Lorem Ipsum 的起源", en: "Origin of Lorem Ipsum" }, lang)}</h4>
              <p className="mt-2 text-sm font-black text-gray-600">{l({ zh: "Lorem Ipsum 源自西塞羅（Cicero）於西元前 45 年撰寫的《de Finibus Bonorum et Malorum》（善惡之極），1.10.32–33 節。16 世紀以來被印刷業作為標準假文使用。", en: "Lorem Ipsum originates from Cicero's 'de Finibus Bonorum et Malorum' (Extremes of Good and Evil), sections 1.10.32–33, written in 45 BC. It has been used as standard placeholder text by the printing industry since the 16th century." }, lang)}</p>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <h4 className="font-black text-purple-700">{l({ zh: "為什麼不用真實內容？", en: "Why Not Real Content?" }, lang)}</h4>
              <p className="mt-2 text-sm font-black text-gray-600">{l({ zh: "真實內容會吸引讀者注意力到文字意義而非排版結構。Lorem Ipsum 的拉丁文既看起來像正常文字，又不會分散注意力，是設計階段的理想選擇。", en: "Real content draws attention to meaning rather than layout structure. Lorem Ipsum's Latin looks like normal text but doesn't distract, making it ideal for the design phase." }, lang)}</p>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <h4 className="font-black text-fuchsia-700">{l({ zh: "常見使用場景", en: "Common Use Cases" }, lang)}</h4>
              <p className="mt-2 text-sm font-black text-gray-600">{l({ zh: "網頁設計原型、印刷排版測試、字體展示、UI/UX 設計稿、內容管理系統預覽、電子報模板測試。", en: "Web design prototypes, print typesetting tests, font showcases, UI/UX mockups, CMS previews, newsletter template testing." }, lang)}</p>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <h4 className="font-black text-violet-700">{l({ zh: "閱讀速度基準", en: "Reading Speed Baseline" }, lang)}</h4>
              <p className="mt-2 text-sm font-black text-gray-600">{l({ zh: "成人英文平均閱讀速度約 200–250 字/分鐘。本工具以 200 字/分鐘估算閱讀時間。中文閱讀速度約 300–500 字/分鐘。", en: "Average adult English reading speed is ~200–250 words/min. This tool estimates at 200 wpm. Chinese reading speed is ~300–500 characters/min." }, lang)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* L13-FAQ */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-[2rem] bg-white/80 p-6 shadow">
          <h3 className="font-black text-violet-800">{l({ zh: "常見問題", en: "FAQ" }, lang)}</h3>
          <div className="mt-4 space-y-4">
            <details className="rounded-xl bg-violet-50 p-4">
              <summary className="cursor-pointer font-black text-violet-700">{l({ zh: "Lorem Ipsum 是什麼語言？", en: "What language is Lorem Ipsum?" }, lang)}</summary>
              <p className="mt-2 font-black text-gray-600">{l({ zh: "它是拉丁文（Latin），但已經被修改得不具完整語意，僅保留字詞的外觀與統計分佈特徵。", en: "It is Latin, but has been modified to lack complete meaning, retaining only word appearance and statistical distribution characteristics." }, lang)}</p>
            </details>
            <details className="rounded-xl bg-purple-50 p-4">
              <summary className="cursor-pointer font-black text-purple-700">{l({ zh: "最多可以產生多少段？", en: "Maximum paragraphs?" }, lang)}</summary>
              <p className="mt-2 font-black text-gray-600">{l({ zh: "本工具支援 1–50 個單位（段落/句子/單字），足以覆蓋絕大多數設計需求。如需更多，可多次產生後合併。", en: "This tool supports 1–50 units (paragraphs/sentences/words), covering most design needs. For more, generate multiple times and combine." }, lang)}</p>
            </details>
            <details className="rounded-xl bg-fuchsia-50 p-4">
              <summary className="cursor-pointer font-black text-fuchsia-700">{l({ zh: "HTML 格式和純文字有什麼差別？", en: "HTML vs Plain Text difference?" }, lang)}</summary>
              <p className="mt-2 font-black text-gray-600">{l({ zh: "HTML <p> 格式將每段包裹在 <p> 標籤中，HTML <li> 格式使用列表結構。純文字則只有內容本身，適合直接貼到任何地方。", en: "HTML <p> wraps each item in <p> tags, HTML <li> uses list structure. Plain text is raw content, pasteable anywhere." }, lang)}</p>
            </details>
            <details className="rounded-xl bg-violet-50 p-4">
              <summary className="cursor-pointer font-black text-violet-700">{l({ zh: "產生的內容每次都一樣嗎？", en: "Is generated content the same each time?" }, lang)}</summary>
              <p className="mt-2 font-black text-gray-600">{l({ zh: "相同參數會產生相同內容（確定性產生），這讓你可以重現結果。修改數量或模式會得到不同組合。", en: "Same parameters produce same content (deterministic generation), allowing reproducibility. Changing count or mode yields different combinations." }, lang)}</p>
            </details>
          </div>
        </div>
      </section>

      {/* L14-FAQAfterAdSlot */}
      <section className="mx-auto max-w-7xl px-4 py-2">
        <AdSlot slot="dev-lipsum-faq" position="inline" />
      </section>

      {/* L15-AffiliateResources */}
      <section className="mx-auto max-w-7xl px-4 py-4">
        <div className="rounded-[2rem] bg-gradient-to-r from-violet-50 to-purple-50 p-6">
          <h3 className="font-black text-violet-800">{l({ zh: "推薦資源", en: "Recommended Resources" }, lang)}</h3>
          <div className="mt-3 grid gap-3 lg:grid-cols-3">
            <a href="https://loremipsum.io" target="_blank" rel="noopener"
              className="rounded-xl bg-white p-3 shadow-sm transition hover:shadow-md">
              <p className="font-black text-violet-700">Lorem Ipsum.io</p>
              <p className="text-xs font-black text-gray-500">{l({ zh: "線上 Lorem Ipsum 產生器", en: "Online Lorem Ipsum generator" }, lang)}</p>
            </a>
            <a href="https://www.figma.com" target="_blank" rel="noopener"
              className="rounded-xl bg-white p-3 shadow-sm transition hover:shadow-md">
              <p className="font-black text-purple-700">Figma</p>
              <p className="text-xs font-black text-gray-500">{l({ zh: "設計工具，內建假文外掛", en: "Design tool with placeholder plugins" }, lang)}</p>
            </a>
            <a href="https://fonts.google.com" target="_blank" rel="noopener"
              className="rounded-xl bg-white p-3 shadow-sm transition hover:shadow-md">
              <p className="font-black text-fuchsia-700">Google Fonts</p>
              <p className="text-xs font-black text-gray-500">{l({ zh: "免費字型，搭配假文預覽", en: "Free fonts, preview with placeholder text" }, lang)}</p>
            </a>
          </div>
        </div>
      </section>

      {/* L16-PremiumGate */}
      <section className="mx-auto max-w-7xl px-4 py-4">
        <PremiumGate plan="PRO">
          <div className="rounded-[2rem] bg-gradient-to-r from-amber-50 to-yellow-50 p-6">
            <h3 className="font-black text-amber-800">{l({ zh: "進階功能", en: "Premium Features" }, lang)}</h3>
            <p className="mt-2 font-black text-gray-600">{l({ zh: "升級 PRO 解鎖：自訂詞庫、多語言假文（中文/日文/韓文/阿拉伯文）、批次檔案匯出、API 介接、無廣告體驗。", en: "Upgrade to PRO to unlock: custom word banks, multi-language placeholder text (Chinese/Japanese/Korean/Arabic), batch file export, API access, ad-free experience." }, lang)}</p>
          </div>
        </PremiumGate>
      </section>

      {/* L17-TrustRelatedReferences */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-[2rem] bg-white/60 p-6">
          <h3 className="font-black text-violet-800">{l({ zh: "參考來源", en: "References" }, lang)}</h3>
          <div className="mt-3 grid gap-2 lg:grid-cols-2 text-sm font-black text-gray-600">
            <li className="font-black">&bull; Cicero, M. T. (45 BC). <em className="font-black">de Finibus Bonorum et Malorum</em>, 1.10.32&ndash;33.</li>
            <li className="font-black">&bull; Richard McClintock (1980s). {l({ zh: "Lorem Ipsum 字源考證", en: "Lorem Ipsum etymological research" }, lang)}.</li>
            <li className="font-black">&bull; Bryan Garvin (2000+). {l({ zh: "Lorem Ipsum 現代標準化研究", en: "Modern Lorem Ipsum standardization" }, lang)}.</li>
            <li className="font-black">&bull; Ray, K. (2019). {l({ zh: "排版與設計中的假文使用研究", en: "Placeholder text usage in typesetting and design research" }, lang)}.</li>
          </div>
        </div>
      </section>

      <footer className="py-6 text-center text-xs font-black text-gray-400">
        {l({ zh: "Lorem Ipsum 產生器 © 2026 — 瀏覽器端工具，零資料傳輸", en: "Lorem Ipsum Generator © 2026 — Browser-based tool, zero data transmission" }, lang)}
      </footer>
    </div>
  );
}
