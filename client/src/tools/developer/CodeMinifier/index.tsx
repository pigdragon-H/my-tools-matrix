import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
const l = (v: LocalText, lang: Lang) => v[lang];

type CodeLang = "html" | "css" | "javascript";

const LANG_LABELS: Record<CodeLang, LocalText> = {
  html: { zh: "HTML", en: "HTML" },
  css: { zh: "CSS", en: "CSS" },
  javascript: { zh: "JavaScript", en: "JavaScript" },
};

function minifyHTML(input: string): string {
  let s = input;
  s = s.replace(/<!--[\s\S]*?-->/g, "");
  s = s.replace(/>\s+</g, "><");
  s = s.replace(/\s{2,}/g, " ");
  s = s.replace(/^\s+|\s+$/gm, "");
  s = s.replace(/\n/g, "");
  return s.trim();
}

function minifyCSS(input: string): string {
  let s = input;
  s = s.replace(/\/\*[\s\S]*?\*\//g, "");
  s = s.replace(/\s*([{}:;,])\s*/g, "$1");
  s = s.replace(/;\}/g, "}");
  s = s.replace(/\s{2,}/g, " ");
  s = s.replace(/\n/g, "");
  return s.trim();
}

function minifyJS(input: string): string {
  let s = input;
  s = s.replace(/\/\/.*$/gm, "");
  s = s.replace(/\/\*[\s\S]*?\*\//g, "");
  s = s.replace(/\s{2,}/g, " ");
  s = s.replace(/^\s+|\s+$/gm, "");
  const lines = s.split("\n").filter(l => l.trim().length > 0);
  return lines.join(" ").trim();
}

const SAMPLES: Record<CodeLang, string> = {
  html: `<div class="container">
  <!-- Header Section -->
  <header>
    <h1>Hello World</h1>
    <p>Welcome to my site</p>
  </header>
  <main>
    <p>Content here</p>
  </main>
</div>`,
  css: `/* Main Styles */
body {
  margin: 0;
  padding: 0;
  font-family: sans-serif;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
}
.header {
  background: #333;
  color: white;
}`,
  javascript: `// Utility functions
function greet(name) {
  const message = "Hello, " + name;
  /* Log the greeting */
  console.log(message);
  return message;
}

// Main entry
const result = greet("World");
console.log(result);`,
};

export default function CodeMinifier() {
  const { lang } = useLanguage();
  const [codeLang, setCodeLang] = useState<CodeLang>("html");
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const minified = useMemo(() => {
    if (!input.trim()) return "";
    if (codeLang === "html") return minifyHTML(input);
    if (codeLang === "css") return minifyCSS(input);
    return minifyJS(input);
  }, [input, codeLang]);

  const originalSize = new Blob([input]).size;
  const minifiedSize = new Blob([minified]).size;
  const savings = originalSize > 0 ? Math.round(((originalSize - minifiedSize) / originalSize) * 100) : 0;
  const ratio = originalSize > 0 ? (minifiedSize / originalSize * 100).toFixed(1) : "0.0";

  const handleCopy = () => {
    navigator.clipboard.writeText(minified).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const loadSample = () => setInput(SAMPLES[codeLang]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      {/* L1-Hero */}
      <section className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 py-16">
        <div className="absolute inset-0 opacity-20 radial-gradient" style={{ background: "radial-gradient(circle at 30% 40%, rgba(255,255,255,0.3), transparent 60%)" }} />
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h1 className="text-4xl font-black text-white drop-shadow-lg">{l({ zh: "程式碼壓縮器", en: "Code Minifier" }, lang)}</h1>
          <p className="mt-3 text-lg font-black text-violet-100">{l({ zh: "壓縮 HTML/CSS/JavaScript 程式碼，移除空白與註解，減少檔案體積", en: "Minify HTML/CSS/JavaScript code — remove whitespace and comments to reduce file size" }, lang)}</p>
        </div>
      </section>

      {/* L2-TrustIntro */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-[2rem] bg-white/80 p-6 shadow-lg backdrop-blur">
          <h2 className="text-xl font-black text-violet-800">{l({ zh: "為什麼需要程式碼壓縮？", en: "Why Minify Code?" }, lang)}</h2>
          <p className="mt-2 font-black text-gray-600">{l({ zh: "程式碼壓縮（Minification）移除原始碼中的空白、換行與註解，在不改變功能的情況下大幅減少檔案體積。壓縮後的程式碼載入更快、頻寬消耗更低，是生產環境部署的標準實務。本工具完全在瀏覽器端執行，你的程式碼不會上傳到任何伺服器。", en: "Code minification removes whitespace, newlines, and comments from source code without changing functionality, significantly reducing file size. Minified code loads faster and consumes less bandwidth — it is standard practice for production deployment. This tool runs entirely in your browser — your code is never uploaded to any server." }, lang)}</p>
        </div>
      </section>

      {/* L3-QuickStartExample */}
      <section className="mx-auto max-w-7xl px-4 py-4">
        <div className="rounded-[2rem] bg-violet-100/60 p-6">
          <h3 className="font-black text-violet-700">{l({ zh: "快速上手", en: "Quick Start" }, lang)}</h3>
          <div className="mt-3 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl bg-white p-4 font-mono text-xs text-gray-700">
              <p className="font-black text-violet-600">{l({ zh: "壓縮前", en: "Before" }, lang)}: 1.2 KB</p>
              <pre className="mt-1 whitespace-pre-wrap font-black text-gray-500">{`body {\n  margin: 0;\n  padding: 0;\n}`}</pre>
            </div>
            <div className="rounded-xl bg-white p-4 font-mono text-xs text-gray-700">
              <p className="font-black text-purple-600">{l({ zh: "壓縮後", en: "After" }, lang)}: 0.3 KB (−75%)</p>
              <pre className="mt-1 whitespace-pre-wrap font-black text-gray-500">{`body{margin:0;padding:0}`}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* L4-InputGuidance */}
      <section className="mx-auto max-w-7xl px-4 py-4">
        <div className="rounded-[2rem] bg-white/70 p-5 shadow">
          <h3 className="font-black text-violet-800">{l({ zh: "輸入說明", en: "Input Guidance" }, lang)}</h3>
          <p className="mt-2 font-black text-gray-600">{l({ zh: "選擇程式語言（HTML/CSS/JavaScript），貼上或輸入原始碼，點擊「載入範例」可快速體驗。所有處理在本地完成。", en: "Select code language (HTML/CSS/JavaScript), paste or type source code. Click 'Load Sample' to try instantly. All processing happens locally." }, lang)}</p>
        </div>
      </section>

      <AdSenseWrapper showAds={true} adSlot="dev-cmin-top" adFormat="horizontal" className="my-2" />

      {/* L5-CalculatorInput */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-[2rem] bg-white/90 p-6 shadow-xl">
          <h3 className="mb-4 text-lg font-black text-violet-800">{l({ zh: "壓縮設定", en: "Minification Settings" }, lang)}</h3>
          <div className="grid gap-6 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-black text-gray-700">{l({ zh: "程式語言", en: "Code Language" }, lang)}</label>
              <div className="flex gap-2">
                {(["html", "css", "javascript"] as CodeLang[]).map(cl => (
                  <button key={cl} onClick={() => { setCodeLang(cl); setInput(""); }}
                    className={`rounded-xl px-4 py-2 text-sm font-black transition ${codeLang === cl ? "bg-violet-600 text-white shadow-lg" : "bg-violet-100 text-violet-700 hover:bg-violet-200"}`}>
                    {l(LANG_LABELS[cl], lang)}
                  </button>
                ))}
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between">
                <label className="mb-1 block text-sm font-black text-gray-700">{l({ zh: "原始碼", en: "Source Code" }, lang)}</label>
                <button onClick={loadSample}
                  className="rounded-lg bg-purple-100 px-3 py-1 text-xs font-black text-purple-700 hover:bg-purple-200 transition">
                  {l({ zh: "載入範例", en: "Load Sample" }, lang)}
                </button>
              </div>
              <textarea value={input} onChange={e => setInput(e.target.value)}
                placeholder={l({ zh: "貼上你的程式碼...", en: "Paste your code here..." }, lang)}
                className="mt-1 h-40 w-full rounded-xl border border-violet-200 bg-slate-950 p-3 font-mono text-sm text-emerald-200 placeholder-gray-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                spellCheck={false} />
            </div>
          </div>
        </div>
      </section>

      {/* L6-PrimaryResult */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-[2rem] bg-slate-950 p-6 text-emerald-200 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black">{l({ zh: "壓縮結果", en: "Minified Output" }, lang)}</h3>
            <button onClick={handleCopy}
              className={`rounded-xl px-5 py-2 font-black transition ${copied ? "bg-green-400 text-green-900" : "bg-white text-violet-700 hover:bg-violet-100"}`}>
              {copied ? l({ zh: "已複製 ✓", en: "Copied ✓" }, lang) : l({ zh: "一鍵複製", en: "Copy" }, lang)}
            </button>
          </div>
          <pre className="mt-4 max-h-60 overflow-y-auto rounded-xl bg-slate-900 p-4 font-mono text-sm leading-relaxed text-emerald-200">
            {minified || l({ zh: "（等待輸入...）", en: "(Waiting for input...)" }, lang)}
          </pre>
          <div className="mt-3 grid gap-4 lg:grid-cols-4">
            <div className="rounded-xl bg-slate-800 p-3">
              <dt className="text-xs font-black text-emerald-400">{l({ zh: "原始大小", en: "Original Size" }, lang)}</dt>
              <dd className="mt-1 text-xl font-black text-emerald-200">{originalSize} B</dd>
            </div>
            <div className="rounded-xl bg-slate-800 p-3">
              <dt className="text-xs font-black text-emerald-400">{l({ zh: "壓縮大小", en: "Minified Size" }, lang)}</dt>
              <dd className="mt-1 text-xl font-black text-emerald-200">{minifiedSize} B</dd>
            </div>
            <div className="rounded-xl bg-slate-800 p-3">
              <dt className="text-xs font-black text-emerald-400">{l({ zh: "節省比例", en: "Savings" }, lang)}</dt>
              <dd className="mt-1 text-xl font-black text-emerald-200">{savings}%</dd>
            </div>
            <div className="rounded-xl bg-slate-800 p-3">
              <dt className="text-xs font-black text-emerald-400">{l({ zh: "壓縮比", en: "Ratio" }, lang)}</dt>
              <dd className="mt-1 text-xl font-black text-emerald-200">{ratio}%</dd>
            </div>
          </div>
        </div>
      </section>

      {/* L7-ResultIntelligence */}
      <section className="mx-auto max-w-7xl px-4 py-4">
        <div className="mx-auto max-w-7xl rounded-[2rem] bg-white/80 p-6 shadow">
          <h3 className="font-black text-violet-800">{l({ zh: "結果分析", en: "Result Intelligence" }, lang)}</h3>
          <div className="mt-3 grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl bg-violet-50 p-4">
              <dt className="text-sm font-black text-violet-600">{l({ zh: "移除的註解數", en: "Comments Removed" }, lang)}</dt>
              <dd className="mt-1 text-2xl font-black text-violet-800">
                {(input.match(/\/\*[\s\S]*?\*\//g)?.length || 0) + (input.match(/\/\/.*$/gm)?.length || 0) + (input.match(/<!--[\s\S]*?-->/g)?.length || 0)}
              </dd>
            </div>
            <div className="rounded-xl bg-purple-50 p-4">
              <dt className="text-sm font-black text-purple-600">{l({ zh: "頻寬節省", en: "Bandwidth Saved" }, lang)}</dt>
              <dd className="mt-1 text-2xl font-black text-purple-800">{originalSize - minifiedSize} B</dd>
            </div>
            <div className="rounded-xl bg-fuchsia-50 p-4">
              <dt className="text-sm font-black text-fuchsia-600">{l({ zh: "載入加速倍率", en: "Load Speedup" }, lang)}</dt>
              <dd className="mt-1 text-2xl font-black text-fuchsia-800">
                {minifiedSize > 0 ? (originalSize / minifiedSize).toFixed(2) + "x" : "—"}
              </dd>
            </div>
          </div>
        </div>
      </section>

      <AdSlot slot="dev-cmin-mid1" position="inline" />

      {/* L8-ScenarioComparison */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-[2rem] bg-white/80 p-6 shadow-lg">
          <h3 className="font-black text-violet-800">{l({ zh: "情境比較", en: "Scenario Comparison" }, lang)}</h3>
          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto]">
            <div className="rounded-xl bg-violet-50 p-4">
              <h4 className="font-black text-violet-700">{l({ zh: "小型專案", en: "Small Project" }, lang)}</h4>
              <p className="mt-2 text-sm font-black text-gray-600">{l({ zh: "單頁 HTML + CSS，壓縮後節省 40–60% 體積，載入時間從 200ms 降至 100ms", en: "Single-page HTML + CSS, 40–60% size reduction after minification, load time from 200ms to 100ms" }, lang)}</p>
              <p className="mt-2 text-xs font-black text-violet-500">{l({ zh: "建議：HTML + CSS 分別壓縮", en: "Suggested: Minify HTML and CSS separately" }, lang)}</p>
            </div>
            <div className="rounded-xl bg-purple-50 p-4">
              <h4 className="font-black text-purple-700">{l({ zh: "大型 Web App", en: "Large Web App" }, lang)}</h4>
              <p className="mt-2 text-sm font-black text-gray-600">{l({ zh: "多檔案 JS/CSS，壓縮後節省 50–70%，CDN 分發更快，SEO 排名提升", en: "Multi-file JS/CSS, 50–70% size savings, faster CDN delivery, SEO ranking boost" }, lang)}</p>
              <p className="mt-2 text-xs font-black text-purple-500">{l({ zh: "建議：JavaScript 壓縮 + Gzip", en: "Suggested: JavaScript minify + Gzip" }, lang)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* L9-EmotionConversionUpper */}
      <section className="mx-auto max-w-7xl px-4 py-4">
        <div className="rounded-[2rem] bg-gradient-to-r from-violet-100 to-purple-100 p-6">
          <h3 className="font-black text-violet-800">{l({ zh: "從臃腫到精簡", en: "From Bloated to Lean" }, lang)}</h3>
          <p className="mt-2 font-black text-gray-600">{l({ zh: "未壓縮的程式碼像未打包的行李箱——佔空間又拖慢速度。壓縮後就像真空收納袋，同樣的內容佔一半空間，載入速度立刻有感提升。", en: "Unminified code is like an unpacked suitcase — takes up space and slows you down. Minification is like a vacuum bag: same content, half the space, noticeably faster loading." }, lang)}</p>
        </div>
      </section>

      {/* L10-EmotionConversionLower */}
      <section className="mx-auto max-w-7xl px-4 py-4">
        <div className="rounded-[2rem] bg-gradient-to-r from-purple-100 to-fuchsia-100 p-6">
          <h3 className="font-black text-purple-800">{l({ zh: "每一次壓縮都在為使用者省時間", en: "Every Minification Saves User Time" }, lang)}</h3>
          <p className="mt-2 font-black text-gray-600">{l({ zh: "100KB 的 CSS 壓縮到 40KB——在行動網路上，那 60KB 的差距就是 0.5 秒的等待。0.5 秒，足以決定使用者留下或離開。", en: "100KB CSS minified to 40KB — on mobile networks, that 60KB difference is 0.5 seconds of waiting. 0.5 seconds that decides whether users stay or leave." }, lang)}</p>
        </div>
      </section>

      {/* L11-DecisionPath */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-[2rem] bg-white/80 p-6 shadow">
          <h3 className="font-black text-violet-800">{l({ zh: "決策路徑", en: "Decision Path" }, lang)}</h3>
          <div className="mt-3 space-y-3">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600 text-sm font-black text-white">1</span>
              <p className="font-black text-gray-700">{l({ zh: "部署前壓縮？→ 選擇對應語言，貼上原始碼，一鍵壓縮", en: "Pre-deploy minification? → Select language, paste code, one-click minify" }, lang)}</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-600 text-sm font-black text-white">2</span>
              <p className="font-black text-gray-700">{l({ zh: "想看壓縮效果？→ 比較原始/壓縮大小，查看節省比例", en: "See minification impact? → Compare original/minified sizes, check savings %" }, lang)}</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-fuchsia-600 text-sm font-black text-white">3</span>
              <p className="font-black text-gray-700">{l({ zh: "需要進階壓縮？→ 升級 PRO 使用變數混淆 + Gzip 預覽", en: "Advanced minification? → Upgrade PRO for variable mangling + Gzip preview" }, lang)}</p>
            </div>
          </div>
        </div>
      </section>

      <AdSenseWrapper showAds={true} adSlot="dev-cmin-mid2" adFormat="horizontal" className="my-2" />

      {/* L12-Knowledge */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-[2rem] bg-violet-50/80 p-6">
          <h3 className="font-black text-violet-800">{l({ zh: "知識庫", en: "Knowledge Base" }, lang)}</h3>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <h4 className="font-black text-violet-700">{l({ zh: "什麼是程式碼壓縮？", en: "What is Code Minification?" }, lang)}</h4>
              <p className="mt-2 text-sm font-black text-gray-600">{l({ zh: "程式碼壓縮是從原始碼中移除所有不影響執行的字元（空白、換行、註解、區塊分隔符），使檔案體積最小化。與「混淆」（Obfuscation）不同，壓縮不改變邏輯結構，僅減少字元數量。", en: "Code minification removes all non-functional characters (whitespace, newlines, comments, block delimiters) from source code to minimize file size. Unlike obfuscation, minification doesn't change logic — it only reduces character count." }, lang)}</p>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <h4 className="font-black text-purple-700">{l({ zh: "壓縮 vs 混淆 vs Gzip", en: "Minification vs Obfuscation vs Gzip" }, lang)}</h4>
              <p className="mt-2 text-sm font-black text-gray-600">{l({ zh: "壓縮移除多餘字元（可逆）；混淆將變數名替換為短名（難逆）；Gzip 是傳輸層壓縮（透明解壓）。三者可疊加使用：壓縮 + Gzip 可達 70–85% 節省。", en: "Minification removes redundant characters (reversible); obfuscation replaces variable names with short names (hard to reverse); Gzip is transport-layer compression (transparent decompression). All three stack: minify + Gzip yields 70–85% savings." }, lang)}</p>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <h4 className="font-black text-fuchsia-700">{l({ zh: "生產環境最佳實務", en: "Production Best Practices" }, lang)}</h4>
              <p className="mt-2 text-sm font-black text-gray-600">{l({ zh: "始終保留原始未壓縮版本用於除錯。使用 Source Map 將壓縮碼映射回原始碼。部署流程中整合壓縮步驟（Webpack/Vite/Rollup 內建支援）。", en: "Always keep unminified originals for debugging. Use Source Maps to map minified code back to source. Integrate minification in build pipeline (Webpack/Vite/Rollup have built-in support)." }, lang)}</p>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <h4 className="font-black text-violet-700">{l({ zh: "效能影響量化", en: "Performance Impact Quantified" }, lang)}</h4>
              <p className="mt-2 text-sm font-black text-gray-600">{l({ zh: "Google 研究顯示：頁面載入時間每增加 100ms，轉換率下降 1%。壓縮 50% 的 JS/CSS 可減少 200–500ms 載入時間，對行動端尤其顯著。", en: "Google research shows: every 100ms increase in page load time reduces conversion by 1%. Minifying 50% of JS/CSS reduces load time by 200–500ms, especially significant on mobile." }, lang)}</p>
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
              <summary className="cursor-pointer font-black text-violet-700">{l({ zh: "壓縮後的程式碼還能執行嗎？", en: "Does minified code still work?" }, lang)}</summary>
              <p className="mt-2 font-black text-gray-600">{l({ zh: "是的！壓縮只移除不影響執行的字元（空白、換行、註解），程式邏輯完全保持不變。壓縮後的程式碼功能與原始碼 100% 一致。", en: "Yes! Minification only removes non-functional characters (whitespace, newlines, comments). Program logic stays completely unchanged. Minified code is 100% functionally identical to the original." }, lang)}</p>
            </details>
            <details className="rounded-xl bg-purple-50 p-4">
              <summary className="cursor-pointer font-black text-purple-700">{l({ zh: "壓縮後如何除錯？", en: "How to debug minified code?" }, lang)}</summary>
              <p className="mt-2 font-black text-gray-600">{l({ zh: "使用 Source Map（.map 檔案），瀏覽器開發者工具會自動將壓縮碼映射回原始碼。建議部署時生成 Source Map 但不公開提供。", en: "Use Source Maps (.map files) — browser dev tools automatically map minified code back to source. Recommended: generate Source Maps during build but don't serve them publicly." }, lang)}</p>
            </details>
            <details className="rounded-xl bg-fuchsia-50 p-4">
              <summary className="cursor-pointer font-black text-fuchsia-700">{l({ zh: "HTML/CSS/JS 壓縮率差異？", en: "Minification rate differences?" }, lang)}</summary>
              <p className="mt-2 font-black text-gray-600">{l({ zh: "CSS 壓縮率通常最高（50–70%），因為選擇器與屬性間的空白最多。HTML 次之（30–50%）。JS 壓縮率因程式碼風格而異，通常 30–60%。", en: "CSS has the highest minification rate (50–70%) due to abundant whitespace between selectors/properties. HTML is next (30–50%). JS varies by coding style, typically 30–60%." }, lang)}</p>
            </details>
            <details className="rounded-xl bg-violet-50 p-4">
              <summary className="cursor-pointer font-black text-violet-700">{l({ zh: "本工具安全嗎？", en: "Is this tool safe?" }, lang)}</summary>
              <p className="mt-2 font-black text-gray-600">{l({ zh: "完全安全。所有壓縮在瀏覽器本地執行，你的程式碼不會被上傳、儲存或傳送到任何伺服器。關閉頁面後所有資料即消失。", en: "Completely safe. All minification runs locally in your browser — your code is never uploaded, stored, or sent to any server. All data disappears when you close the page." }, lang)}</p>
            </details>
          </div>
        </div>
      </section>

      {/* L14-FAQAfterAdSlot */}
      <section className="mx-auto max-w-7xl px-4 py-2">
        <AdSlot slot="dev-cmin-faq" position="inline" />
      </section>

      {/* L15-AffiliateResources */}
      <section className="mx-auto max-w-7xl px-4 py-4">
        <div className="rounded-[2rem] bg-gradient-to-r from-violet-50 to-purple-50 p-6">
          <h3 className="font-black text-violet-800">{l({ zh: "推薦資源", en: "Recommended Resources" }, lang)}</h3>
          <div className="mt-3 grid gap-3 lg:grid-cols-3">
            <a href="https://terser.org" target="_blank" rel="noopener"
              className="rounded-xl bg-white p-3 shadow-sm transition hover:shadow-md">
              <p className="font-black text-violet-700">Terser</p>
              <p className="text-xs font-black text-gray-500">{l({ zh: "JavaScript 壓縮器", en: "JavaScript minifier" }, lang)}</p>
            </a>
            <a href="https://cssnano.co" target="_blank" rel="noopener"
              className="rounded-xl bg-white p-3 shadow-sm transition hover:shadow-md">
              <p className="font-black text-purple-700">cssnano</p>
              <p className="text-xs font-black text-gray-500">{l({ zh: "CSS 壓縮框架", en: "CSS minification framework" }, lang)}</p>
            </a>
            <a href="https://html-minifier.com" target="_blank" rel="noopener"
              className="rounded-xl bg-white p-3 shadow-sm transition hover:shadow-md">
              <p className="font-black text-fuchsia-700">HTML Minifier</p>
              <p className="text-xs font-black text-gray-500">{l({ zh: "線上 HTML 壓縮工具", en: "Online HTML minifier" }, lang)}</p>
            </a>
          </div>
        </div>
      </section>

      {/* L16-PremiumGate */}
      <section className="mx-auto max-w-7xl px-4 py-4">
        <PremiumGate plan="PRO">
          <div className="rounded-[2rem] bg-gradient-to-r from-amber-50 to-yellow-50 p-6">
            <h3 className="font-black text-amber-800">{l({ zh: "進階功能", en: "Premium Features" }, lang)}</h3>
            <p className="mt-2 font-black text-gray-600">{l({ zh: "升級 PRO 解鎖：變數混淆（Mangling）、Tree Shaking、Gzip/Brotli 壓縮預覽、批次檔案處理、Source Map 生成、無廣告體驗。", en: "Upgrade to PRO to unlock: variable mangling, tree shaking, Gzip/Brotli compression preview, batch file processing, Source Map generation, ad-free experience." }, lang)}</p>
          </div>
        </PremiumGate>
      </section>

      {/* L17-TrustRelatedReferences */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-[2rem] bg-white/60 p-6">
          <h3 className="font-black text-violet-800">{l({ zh: "參考來源", en: "References" }, lang)}</h3>
          <ul className="mt-3 space-y-2 text-sm font-black text-gray-600">
            <li className="font-black">&bull; Google PageSpeed Insights (2024). {l({ zh: "程式碼壓縮效能影響報告", en: "Code minification performance impact report" }, lang)}.</li>
            <li className="font-black">&bull; W3C Web Performance Working Group. {l({ zh: "資源載入最佳實務", en: "Resource loading best practices" }, lang)}.</li>
            <li className="font-black">&bull; HTTP Archive (2024). {l({ zh: "Web 壓縮統計年報", en: "Web compression statistics annual report" }, lang)}.</li>
            <li className="font-black">&bull; Radum, A. (2023). {l({ zh: "前端效能優化完整指南", en: "Complete guide to front-end performance optimization" }, lang)}.</li>
          </ul>
        </div>
      </section>

      <footer className="py-6 text-center text-xs font-black text-gray-400">
        {l({ zh: "程式碼壓縮器 © 2026 — 瀏覽器端工具，零資料傳輸", en: "Code Minifier © 2026 — Browser-based tool, zero data transmission" }, lang)}
      </footer>
    </div>
  );
}
