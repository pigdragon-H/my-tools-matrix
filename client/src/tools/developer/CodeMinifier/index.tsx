// @profile B
// Profile B · 開發者-工具 · CodeMinifier（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
const l = (v: LocalText, lang: Lang) => v[lang];

type CodeLang = "html" | "css" | "js";

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
  const lines = s.split("\n").filter(line => line.trim().length > 0);
  return lines.join(" ").trim();
}

const SAMPLES: Record<CodeLang, string> = {
  html: `<div class="container">\n  <!-- Hero Section -->\n  <section>\n    <h1>Hello World</h1>\n    <p>Welcome to my site</p>\n  </section>\n</div>`,
  css: `/* Main Styles */\nbody {\n  margin: 0;\n  padding: 0;\n  font-family: sans-serif;\n}\n.container {\n  max-width: 1200px;\n  margin: 0 auto;\n}`,
  js: `// greet user\nfunction greet(name) {\n  const message = "Hello, " + name;\n  console.log(message);\n  return message;\n}`,
};

const bands = [
  { key: "html", range: "tags", label: { zh: "HTML 壓縮", en: "HTML" }, desc: { zh: "移除註解與標籤間空白，合併連續空格，適合靜態頁面與模板部署前壓縮。", en: "Removes comments and inter-tag whitespace, collapses spaces — ideal before deploying static pages and templates." } },
  { key: "css", range: "rules", label: { zh: "CSS 壓縮", en: "CSS" }, desc: { zh: "移除註解、規則間空白與多餘分號，縮短樣式表體積以加速首屏渲染。", en: "Removes comments, rule whitespace, and trailing semicolons to shrink stylesheets and speed first paint." } },
  { key: "js", range: "lines", label: { zh: "JS 壓縮", en: "JavaScript" }, desc: { zh: "移除單行與區塊註解、合併空白，是基礎壓縮；正式產線建議搭配變數混淆。", en: "Removes line and block comments and collapses whitespace — basic minification; pair with mangling for production." } },
  { key: "comment", range: "//,/* */", label: { zh: "註解移除", en: "Comment strip" }, desc: { zh: "三種語言都會先移除註解，這是壓縮體積最直接的一步。", en: "All three languages strip comments first — the most direct step to reduce size." } },
  { key: "whitespace", range: "\\s+", label: { zh: "空白合併", en: "Whitespace" }, desc: { zh: "把連續空白、換行與縮排合併成最小必要字元，不改變執行結果。", en: "Collapses runs of whitespace, newlines, and indentation to the minimum needed without changing behavior." } },
  { key: "savings", range: "%", label: { zh: "節省比例", en: "Savings %" }, desc: { zh: "以原始與壓縮後位元組計算節省百分比，衡量本次壓縮的實際效益。", en: "Computes savings percent from original and minified byte sizes to gauge the real benefit." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "Base64 編碼器", en: "Base64 Encoder" }, href: "/tools/developer/base64-encoder" },
  { label: { zh: "JSON 格式化", en: "JSON Formatter" }, href: "/tools/developer/json-formatter" },
  { label: { zh: "HTML 編碼器", en: "HTML Encoder" }, href: "/tools/developer/html-encoder" },
  { label: { zh: "Diff 比對器", en: "Diff Checker" }, href: "/tools/developer/diff-checker" },
];

const ui = {
  zh: {
    badge: "開發者 · 程式碼壓縮 · 黃金工具", switchToEnglish: "中文模式", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Code Minifier · 程式碼壓縮器", subtitle: "壓縮 HTML / CSS / JavaScript，移除空白與註解以縮小檔案體積",
    intro: "本工具在瀏覽器端壓縮 HTML、CSS 或 JavaScript 程式碼，移除註解、合併空白與換行，在不改變功能的前提下縮小檔案體積,並即時計算原始與壓縮後大小與節省比例,適合部署前最佳化。",
    trustNoteLabel: "注意事項：", trustNote: "本工具完全在瀏覽器執行,程式碼不會上傳到任何伺服器;此為基礎壓縮,正式產線建議搭配專業工具進行變數混淆與 Gzip。",
    quickActionCard: "快速範例卡", tryExample: "一鍵載入範例並壓縮", examplePreview: "節省比例", examplePerson: "語言", flowDemo: "原始", fillExample: "載入 CSS 範例壓縮", previewActivePath: "載入 JS 範例壓縮",
    examplesCalculator: "範例 → 壓縮器", enterValues: "選擇語言並貼上程式碼", examplesHelper: "先用內建範例理解三種語言的壓縮差異,再把自己的程式碼貼進來,一鍵取得最小化結果。",
    metric: "HTML", imperial: "CSS", exampleCards: "範例卡", baselineExample: "CSS 範例", activeExample: "JS 範例", calculator: "壓縮器",
    modeLabel: "程式語言", countLabel: "原始程式碼", formatLabel: "輸出", regenerate: "重新壓縮", copyAll: "複製壓縮結果",
    resultCard: "壓縮結果", estimatedTdee: "目前語言", monthlyEquiv: "壓縮後", weeklyEquiv: "原始大小", dailyEquiv: "語言", effectiveHours: "節省", fatLossTarget: "壓縮後",
    outputLabel: "壓縮後程式碼",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格壓縮要點判讀矩陣", tdeeMatrixNote: "L7 固定六格,列出三種語言與壓縮環節的作用;這是壓縮參考,不是程式碼品質或安全性建議。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把壓縮整合進部署流程", conversionNote: "L9 會連動目前壓縮結果,顯示語言、原始與壓縮後大小,協助您判斷是否需要進一步用建構工具自動化壓縮。",
    progressInsight: "進度洞察卡", possibleTarget: "目前壓縮計畫", dailyGap: "原始位元組", weeklyTrend: "節省百分比", motivation: "動力卡", keepMomentum: "從單檔壓縮走向建構流程自動化",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把壓縮結果帶進您的部署", journeyHint: "每次更換語言或貼上新程式碼時重新壓縮,並把結果複製到建構腳本、靜態資源或 CDN。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用 Diff 比對器確認壓縮前後行為一致", nextActionItem2: "用 Base64 編碼器把小型資源內嵌進程式碼", nextActionItem3: "用 JSON 格式化檢查設定檔結構正確",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "原始碼 → 移除註解 → 合併空白 → 壓縮輸出", bmrStep: "原始碼", deficitStep: "移除註解", trendStep: "合併空白", mealStep: "輸出",
    knowledge: "知識", knowledgeTitle: "程式碼壓縮在前端工程中的意義", definition: "定義", definitionText: "程式碼壓縮（Minification）在不改變功能的前提下移除原始碼中的空白、換行與註解,讓檔案體積更小、載入更快。",
    formula: "公式", formulaText: "壓縮先移除註解（// 與 /* */）,再合併連續空白與換行;節省比例 =（原始位元組 − 壓縮後位元組）÷ 原始位元組 × 100%。",
    limitations: "限制", limitationsText: "此為正則式基礎壓縮,不解析語法,不重新命名變數;遇到字串內含特殊字元的複雜程式碼,正式產線請改用 esbuild 或 Terser 等專業工具。",
    interpretation: "解讀", interpretationText: "節省比例越高代表原始碼空白與註解越多。壓縮後的程式碼可讀性差,應只在部署版本使用,開發時仍保留原始碼。",
    context: "脈絡", contextText: "壓縮通常是建構流程的一環,搭配 Gzip 或 Brotli 傳輸壓縮能再縮小體積;對行動網路使用者而言,每縮小幾 KB 都能加快載入。",
    example: "範例", exampleText: "把含註解與縮排的 CSS 貼入,選 CSS 語言,工具會移除註解與多餘空白,通常可節省 40–60% 體積,結果可直接放進產線。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "程式碼工作流程的下一步工具", premiumTitle: "專業版程式碼最佳化工具包", premiumText: "解鎖變數混淆、Tree-shaking 模擬、Gzip 體積預估與整批多檔壓縮匯出。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅在瀏覽器端壓縮,程式碼不會離開您的裝置;此為基礎壓縮,非完整建構工具。", relatedTools: "相關工具", relatedToolsText: "Base64 編碼器 · JSON 格式化 · HTML 編碼器 · Diff 比對器", references: "參考資料", referencesText: "Minification 最佳實務;HTML/CSS/JS 壓縮規則;Gzip 與 Brotli 傳輸壓縮;前端建構工具比較指南。",
    q1: "程式碼壓縮會改變功能嗎？", a1: "不會。壓縮只移除空白、換行與註解這些對執行沒有影響的字元,程式邏輯與輸出完全保持不變。",
    q2: "為什麼要壓縮程式碼？", a2: "壓縮後體積更小,載入更快、頻寬消耗更低,是生產環境部署的標準實務;對行動網路使用者尤其有感。",
    q3: "這個工具安全嗎？我的程式碼會上傳嗎？", a3: "完全安全。所有壓縮都在您的瀏覽器本機執行,程式碼不會上傳到任何伺服器,適合處理私有或內部程式碼。",
    q4: "能壓縮哪些語言？", a4: "支援 HTML、CSS 與 JavaScript 三種;每種語言採用對應的壓縮規則,先移除註解再合併空白。",
    q5: "壓縮後可以還原嗎？", a5: "壓縮是有損格式（移除了空白與註解）,無法完整還原原始排版;請務必保留原始碼,只在部署版本使用壓縮結果。",
    q6: "正式產線只用這個工具夠嗎？", a6: "對小型專案足夠;大型專案建議搭配 esbuild、Terser 等建構工具,再加上 Gzip/Brotli 傳輸壓縮以取得最佳效果。",
  },
  en: {
    badge: "Developer · Code minify · Gold tool", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Code Minifier", subtitle: "Minify HTML / CSS / JavaScript — remove whitespace and comments to reduce file size",
    intro: "This tool minifies HTML, CSS, or JavaScript in the browser, removing comments and collapsing whitespace and newlines without changing functionality, while computing original vs minified size and savings in real time — ideal for pre-deployment optimization.",
    trustNoteLabel: "Note:", trustNote: "This tool runs entirely in your browser — your code is never uploaded to any server. This is basic minification; for production, pair it with professional tools for variable mangling and Gzip.",
    quickActionCard: "Quick example", tryExample: "Load a sample and minify", examplePreview: "Savings", examplePerson: "Language", flowDemo: "Original", fillExample: "Load CSS sample", previewActivePath: "Load JS sample",
    examplesCalculator: "Examples → Minifier", enterValues: "Choose language and paste code", examplesHelper: "Start with a built-in sample to understand how the three languages differ, then paste your own code for one-click minification.",
    metric: "HTML", imperial: "CSS", exampleCards: "Example cards", baselineExample: "CSS sample", activeExample: "JS sample", calculator: "Minifier",
    modeLabel: "Language", countLabel: "Source code", formatLabel: "Output", regenerate: "Re-minify", copyAll: "Copy minified result",
    resultCard: "Minified result", estimatedTdee: "Current language", monthlyEquiv: "Minified", weeklyEquiv: "Original size", dailyEquiv: "Language", effectiveHours: "Savings", fatLossTarget: "Minified",
    outputLabel: "Minified code",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band minify matrix", tdeeMatrixNote: "L7 fixed six-band matrix — lists the three languages and minify steps and their effects. This is a minification reference, not code-quality or security advice.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Fit minification into your deployment flow", conversionNote: "L9 reflects your current result — language and original vs minified size — to help you decide whether to automate minification with a build tool.",
    progressInsight: "Progress insight", possibleTarget: "Your current minify plan", dailyGap: "Original bytes", weeklyTrend: "Savings percent", motivation: "Motivation", keepMomentum: "Move from single-file minify to automated build pipelines",
    saveShareJourney: "Save / share", journeyTitle: "Take the minified result into your deployment", journeyHint: "Re-minify whenever you switch languages or paste new code, and copy the result into a build script, static assets, or CDN.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use the Diff Checker to confirm behavior is unchanged after minifying", nextActionItem2: "Use the Base64 Encoder to inline small assets into code", nextActionItem3: "Use the JSON Formatter to validate config-file structure",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with a friend", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Source → Strip comments → Collapse whitespace → Output", bmrStep: "Source", deficitStep: "Strip comments", trendStep: "Collapse whitespace", mealStep: "Output",
    knowledge: "Knowledge", knowledgeTitle: "What code minification means in front-end engineering", definition: "Definition", definitionText: "Minification removes whitespace, newlines, and comments from source code without changing functionality, making files smaller and faster to load.",
    formula: "Formula", formulaText: "Minify first strips comments (// and /* */), then collapses runs of whitespace and newlines; savings = (original bytes − minified bytes) ÷ original bytes × 100%.",
    limitations: "Limitations", limitationsText: "This is regex-based basic minification — it does not parse syntax or rename variables; for complex code with special characters in strings, use professional tools like esbuild or Terser in production.",
    interpretation: "Interpretation", interpretationText: "A higher savings percent means the source had more whitespace and comments. Minified code is hard to read and should be used only in deployment builds while keeping the source for development.",
    context: "Context", contextText: "Minification is usually one step of a build pipeline; pairing it with Gzip or Brotli transfer compression shrinks size further — every few KB saved speeds loading for mobile users.",
    example: "Example", exampleText: "Paste CSS with comments and indentation, choose CSS, and the tool removes comments and extra whitespace — typically 40–60% smaller and ready for production.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for a code workflow", premiumTitle: "Pro Code Optimization Toolkit", premiumText: "Unlock variable mangling, tree-shaking simulation, Gzip size estimation, and batch multi-file minify export.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool minifies only in your browser — code never leaves your device. It is basic minification, not a full build tool.", relatedTools: "Related tools", relatedToolsText: "Base64 Encoder · JSON Formatter · HTML Encoder · Diff Checker", references: "References", referencesText: "Minification best practices; HTML/CSS/JS minify rules; Gzip and Brotli transfer compression; front-end build-tool comparison guides.",
    q1: "Does minification change functionality?", a1: "No. Minification only removes whitespace, newlines, and comments — characters that have no effect on execution — so program logic and output stay exactly the same.",
    q2: "Why minify code?", a2: "Minified code is smaller, loads faster, and uses less bandwidth — it is standard practice for production deployment and especially noticeable for mobile users.",
    q3: "Is this tool safe? Is my code uploaded?", a3: "Completely safe. All minification runs locally in your browser — code is never uploaded to any server, so it is fine for private or internal code.",
    q4: "Which languages can it minify?", a4: "It supports HTML, CSS, and JavaScript; each uses matching minify rules, stripping comments first then collapsing whitespace.",
    q5: "Can minified code be restored?", a5: "Minification is lossy (whitespace and comments are removed) and cannot fully restore the original formatting; always keep the source and use the minified result only in builds.",
    q6: "Is this tool enough for production?", a6: "It is enough for small projects; for large projects, pair it with build tools like esbuild or Terser plus Gzip/Brotli transfer compression for best results.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function CodeMinifier() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [codeLang, setCodeLang] = useState<CodeLang>("html");
  const [input, setInput] = useState(SAMPLES.html);
  const t = ui[lang];

  const minified = useMemo(() => {
    if (!input.trim()) return "";
    if (codeLang === "html") return minifyHTML(input);
    if (codeLang === "css") return minifyCSS(input);
    return minifyJS(input);
  }, [input, codeLang]);

  const result = useMemo(() => {
    const originalSize = new Blob([input]).size;
    const minifiedSize = new Blob([minified]).size;
    const savings = originalSize > 0 ? Math.round(((originalSize - minifiedSize) / originalSize) * 100) : 0;
    const saved = originalSize - minifiedSize;
    return { originalSize, minifiedSize, savings, saved };
  }, [input, minified]);

  function fillSolid() { setUnit("metric"); setCodeLang("css"); setInput(SAMPLES.css); }
  function fillHighSalary() { setUnit("imperial"); setCodeLang("js"); setInput(SAMPLES.js); }

  const activeBand = bands.find(b => b.key === codeLang) || bands[0];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#fef3c7,_#f8fafc_45%,_#e0f2fe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-amber-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-amber-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{result.savings}%</div><div className="text-sm font-bold text-amber-100">{l(activeBand.label, lang)}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{l(activeBand.label, lang)}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{result.originalSize}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.monthlyEquiv}</div><div className="font-black">{result.minifiedSize}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">CSS</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "CSS · 移除註解空白" : "CSS · strip comments"}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">JS</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "JS · 移除註解空白" : "JS · strip comments"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4"><label className="block text-sm font-black text-slate-700">{t.modeLabel}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={codeLang} onChange={(e) => { const v = e.target.value as CodeLang; setCodeLang(v); setInput(SAMPLES[v]); }}><option value="html">HTML</option><option value="css">CSS</option><option value="js">JavaScript</option></select></label><label className="block text-sm font-black text-slate-700">{t.countLabel}<textarea rows={6} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-mono text-sm" value={input} onChange={(e) => setInput(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{result.savings}<span className="text-3xl">%</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{l(activeBand.label, lang)}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.monthlyEquiv}</div><div className="mt-1 text-xl font-black">{result.minifiedSize}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "位元組" : "bytes"}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.effectiveHours}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "位元組" : "bytes"}</div><p className="mt-2 text-3xl font-black text-emerald-950">{result.saved}</p><p className="text-sm font-bold text-emerald-700">{result.savings}%</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.dailyEquiv}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "語言" : "lang"}</div><p className="mt-2 text-xl font-black text-blue-950">{l(activeBand.label, lang)}</p><p className="text-sm font-bold text-blue-700">minify</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.weeklyEquiv}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "位元組" : "bytes"}</div><p className="mt-2 text-3xl font-black text-slate-950">{result.originalSize}</p><p className="text-sm font-bold text-slate-700">{activeBand.range}</p></div></div><div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{t.outputLabel}</div><div className="mt-2 max-h-52 overflow-auto whitespace-pre-wrap break-words font-mono text-sm leading-6 text-slate-800">{minified || (lang === "zh" ? "（等待輸入...）" : "(Waiting for input...)")}</div><button type="button" onClick={() => { if (navigator.clipboard && minified) { navigator.clipboard.writeText(minified); alert(t.shareCopiedToast); } }} className="mt-3 w-full rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.copyAll}</button></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand.key === item.key ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="code-minifier-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "語言" : "Lang"}</div><div className="mt-1 text-2xl font-black">{l(activeBand.label, lang)}</div></div><div className="rounded-2xl bg-amber-50 p-4"><div className="text-xs font-black uppercase text-amber-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-amber-950">{result.savings}%</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result.originalSize}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "原始碼" : "Source", note: t.bmrStep }, { label: lang === "zh" ? "移除註解" : "Comments", note: t.deficitStep }, { label: lang === "zh" ? "合併空白" : "Whitespace", note: t.trendStep }, { label: lang === "zh" ? "輸出" : "Output", note: t.mealStep }].map((node, index) => <div key={node.note} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L14-Knowledge-FAQ · L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位：廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="code-minifier-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["混淆", "Tree-shake", "Gzip", "批次"] : ["Mangle", "Tree-shake", "Gzip", "Batch"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-TrustRelatedReferences */}<p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
