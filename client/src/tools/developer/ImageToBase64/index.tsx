// @profile B
// Profile B · 開發者-工具 · ImageToBase64（GOLD-STANDARD-001 compatible）

import { useMemo, useRef, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
const l = (v: LocalText, lang: Lang) => v[lang];

type OutputFormat = "datauri" | "raw" | "html-img" | "css-bg";

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

const bands = [
  { key: "datauri", range: "data:", label: { zh: "Data URI", en: "Data URI" }, desc: { zh: "完整的 data:[mime];base64,字串,可直接放進 src 或 url(),瀏覽器無需額外請求。", en: "Full data:[mime];base64,string — drop straight into src or url(); the browser needs no extra request." } },
  { key: "raw", range: "A-Za-z0-9", label: { zh: "純 Base64", en: "Raw Base64" }, desc: { zh: "僅編碼後的字串,不含前綴,適合手動拼接或存進資料庫欄位。", en: "Just the encoded string with no prefix — for manual assembly or storing in a database column." } },
  { key: "html-img", range: "<img>", label: { zh: "HTML img", en: "HTML img" }, desc: { zh: "包成 <img src=...> 標籤,複製後可直接貼進 HTML 模板顯示。", en: "Wrapped as <img src=...> — paste directly into an HTML template to display." } },
  { key: "css-bg", range: "url()", label: { zh: "CSS 背景", en: "CSS background" }, desc: { zh: "輸出 background-image: url(...),可直接貼進樣式表當背景圖。", en: "Outputs background-image: url(...) to paste straight into a stylesheet." } },
  { key: "size", range: "+33%", label: { zh: "體積膨脹", en: "Size inflation" }, desc: { zh: "Base64 約增加 33% 體積,適合小型圖示;大圖建議仍走檔案連結。", en: "Base64 adds about 33% size — fine for small icons; use file links for large images." } },
  { key: "mime", range: "image/*", label: { zh: "MIME 類型", en: "MIME type" }, desc: { zh: "自動讀取檔案 MIME（png/jpeg/svg 等）並寫入 Data URI 前綴。", en: "Auto-detects the file MIME (png/jpeg/svg, etc.) and writes it into the Data URI prefix." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "Base64 編碼器", en: "Base64 Encoder" }, href: "/tools/developer/base64-encoder" },
  { label: { zh: "程式碼壓縮器", en: "Code Minifier" }, href: "/tools/developer/code-minifier" },
  { label: { zh: "顏色轉換器", en: "Color Converter" }, href: "/tools/developer/color-converter" },
  { label: { zh: "QR Code 產生器", en: "QR Code Generator" }, href: "/tools/developer/qr-code-generator" },
];

const ui = {
  zh: {
    badge: "開發者 · 圖片編碼 · 黃金工具", switchToEnglish: "中文模式", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Image to Base64 · 圖片轉 Base64", subtitle: "把圖片轉成 Base64 Data URI,支援多種輸出格式,完全在瀏覽器端處理",
    intro: "本工具把圖片轉成 Base64 編碼的 Data URI,可選 Data URI、純 Base64、HTML img 或 CSS 背景四種輸出格式,並即時顯示原始與編碼後體積,適合把小型圖示內嵌進 HTML、CSS 或 JSON。",
    trustNoteLabel: "注意事項：", trustNote: "本工具完全在瀏覽器執行,圖片不會上傳到任何伺服器;Base64 會讓體積增加約 33%,大型圖片仍建議使用一般檔案連結。",
    quickActionCard: "快速操作卡", tryExample: "選擇或拖放圖片轉碼", examplePreview: "編碼後體積", examplePerson: "格式", flowDemo: "原始", fillExample: "切換為 HTML img", previewActivePath: "切換為 CSS 背景",
    examplesCalculator: "上傳 → 編碼器", enterValues: "選擇檔案並挑輸出格式", examplesHelper: "先把一張小圖示拖進來,觀察四種輸出格式的差異,再依使用情境（HTML、CSS 或 JSON）挑選格式並複製。",
    metric: "Data URI", imperial: "純 Base64", exampleCards: "格式卡", baselineExample: "HTML img 格式", activeExample: "CSS 背景格式", calculator: "編碼器",
    modeLabel: "輸出格式", countLabel: "選擇圖片", formatLabel: "格式", regenerate: "重新編碼", copyAll: "複製編碼結果",
    resultCard: "編碼結果", estimatedTdee: "目前格式", monthlyEquiv: "編碼後", weeklyEquiv: "原始大小", dailyEquiv: "格式", effectiveHours: "MIME", fatLossTarget: "編碼後",
    outputLabel: "Base64 / Data URI 輸出",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格輸出格式判讀矩陣", tdeeMatrixNote: "L7 固定六格,列出常見輸出格式與 Base64 特性的用途;這是格式參考,不是壓縮或品質建議。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把圖片編碼整合進開發流程", conversionNote: "L9 會連動目前編碼結果,顯示格式、原始與編碼後體積,協助您判斷該圖片適合內嵌還是仍走檔案連結。",
    progressInsight: "進度洞察卡", possibleTarget: "目前編碼計畫", dailyGap: "原始位元組", weeklyTrend: "編碼後位元組", motivation: "動力卡", keepMomentum: "從單張內嵌走向資源打包流程",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把編碼結果帶進您的程式碼", journeyHint: "每次更換圖片或輸出格式時重新編碼,並把結果複製到 HTML、CSS 樣式表或 JSON 設定。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用程式碼壓縮器把含 Data URI 的樣式表縮小", nextActionItem2: "用 Base64 編碼器處理非圖片的文字資料", nextActionItem3: "用顏色轉換器搭配內嵌圖示調整介面配色",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "選圖 → 讀取 → 編碼 → 選格式輸出", bmrStep: "選圖", deficitStep: "讀取", trendStep: "編碼", mealStep: "輸出",
    knowledge: "知識", knowledgeTitle: "Base64 與 Data URI 在前端的意義", definition: "定義", definitionText: "Base64 是把二進位資料轉成純文字字串的編碼方式;Data URI（RFC 2397）則把資料以 data:[mime];base64,data 的 URI 形式內嵌,讓瀏覽器無需額外請求即可使用。",
    formula: "公式", formulaText: "讀取檔案 → 轉成 Base64 字串 → 組成 data:mime;base64,字串。Base64 每 3 位元組原始資料對應 4 個字元,因此體積約增加 33%。",
    limitations: "限制", limitationsText: "Base64 會增加約 33% 體積且無法被瀏覽器快取,只適合小型圖示;大圖內嵌會拖慢首屏,且 Data URI 過長會讓 HTML/CSS 難以維護。",
    interpretation: "解讀", interpretationText: "編碼後體積大於原始屬正常現象。若圖片小且重複使用,內嵌可省去 HTTP 請求;若圖片大,使用檔案連結搭配快取更有效率。",
    context: "脈絡", contextText: "內嵌圖示常見於 CSS Sprite 替代方案、Email HTML 與離線應用;搭配建構工具可自動把小於門檻的圖片轉成 Data URI。",
    example: "範例", exampleText: "拖進一個 2KB 的 PNG 圖示,選 HTML img 格式,工具會輸出 <img src=\"data:image/png;base64,...\" />,可直接貼進模板顯示而不需額外圖片請求。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "圖片編碼工作流程的下一步工具", premiumTitle: "專業版圖片資源工具包", premiumText: "解鎖批次圖片轉碼、SVG 最佳化、自動體積門檻內嵌與多檔資源打包匯出。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅在瀏覽器端編碼,圖片不會離開您的裝置;適合處理私有或內部圖片資源。", relatedTools: "相關工具", relatedToolsText: "Base64 編碼器 · 程式碼壓縮器 · 顏色轉換器 · QR Code 產生器", references: "參考資料", referencesText: "RFC 2397 Data URI Scheme;Base64 編碼規範;前端資源內嵌最佳實務;圖片最佳化與快取策略指南。",
    q1: "Base64 與 Data URI 有什麼差別？", a1: "Base64 是編碼方式（純字串）,Data URI 是使用方式（含 MIME 類型與格式前綴的完整 URI）。Data URI = data:mime;base64,Base64字串。",
    q2: "編碼後體積為什麼變大？", a2: "Base64 每 3 位元組原始資料需要 4 個字元表示,因此體積約增加 33%,這是編碼本身的特性,無法避免。",
    q3: "這個工具會上傳我的圖片嗎？", a3: "不會。所有編碼都在您的瀏覽器本機執行,圖片不會上傳到任何伺服器,適合處理機密或內部圖片。",
    q4: "什麼時候適合用內嵌圖片？", a4: "小型、重複使用的圖示適合內嵌,可省去 HTTP 請求;大圖建議使用一般檔案連結,以利瀏覽器快取與首屏速度。",
    q5: "可以轉哪些圖片格式？", a5: "支援 PNG、JPEG、GIF、SVG、WebP 等常見圖片格式,工具會自動讀取 MIME 類型並寫入 Data URI 前綴。",
    q6: "編碼後可以還原成圖片嗎？", a6: "可以。Data URI 是無損編碼,瀏覽器、圖片編輯器或解碼工具都能把它還原成原始圖片。",
  },
  en: {
    badge: "Developer · Image encode · Gold tool", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Image to Base64", subtitle: "Convert images to Base64 Data URIs with multiple output formats — fully in-browser",
    intro: "This tool converts an image to a Base64-encoded Data URI, with four output formats — Data URI, raw Base64, HTML img, or CSS background — and shows original vs encoded size in real time, ideal for inlining small icons into HTML, CSS, or JSON.",
    trustNoteLabel: "Note:", trustNote: "This tool runs entirely in your browser — images are never uploaded to any server. Base64 inflates size by about 33%, so large images are still best served via normal file links.",
    quickActionCard: "Quick action", tryExample: "Choose or drop an image to encode", examplePreview: "Encoded size", examplePerson: "Format", flowDemo: "Original", fillExample: "Switch to HTML img", previewActivePath: "Switch to CSS background",
    examplesCalculator: "Upload → Encoder", enterValues: "Choose a file and an output format", examplesHelper: "Drop a small icon first to see how the four output formats differ, then pick a format for your case (HTML, CSS, or JSON) and copy it.",
    metric: "Data URI", imperial: "Raw Base64", exampleCards: "Format cards", baselineExample: "HTML img format", activeExample: "CSS background format", calculator: "Encoder",
    modeLabel: "Output format", countLabel: "Choose image", formatLabel: "Format", regenerate: "Re-encode", copyAll: "Copy encoded result",
    resultCard: "Encoded result", estimatedTdee: "Current format", monthlyEquiv: "Encoded", weeklyEquiv: "Original size", dailyEquiv: "Format", effectiveHours: "MIME", fatLossTarget: "Encoded",
    outputLabel: "Base64 / Data URI output",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band output-format matrix", tdeeMatrixNote: "L7 fixed six-band matrix — lists common output formats and Base64 traits and their uses. This is a format reference, not compression or quality advice.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Fit image encoding into your dev flow", conversionNote: "L9 reflects your current result — format and original vs encoded size — to help you decide whether to inline the image or keep a file link.",
    progressInsight: "Progress insight", possibleTarget: "Your current encode plan", dailyGap: "Original bytes", weeklyTrend: "Encoded bytes", motivation: "Motivation", keepMomentum: "Move from single inlining to asset-bundling pipelines",
    saveShareJourney: "Save / share", journeyTitle: "Take the encoded result into your code", journeyHint: "Re-encode whenever you switch images or output format, and copy the result into HTML, a CSS stylesheet, or JSON config.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use the Code Minifier to shrink stylesheets containing Data URIs", nextActionItem2: "Use the Base64 Encoder for non-image text data", nextActionItem3: "Use the Color Converter to tune the UI palette around inlined icons",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with a friend", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Pick image → Read → Encode → Choose format", bmrStep: "Pick", deficitStep: "Read", trendStep: "Encode", mealStep: "Output",
    knowledge: "Knowledge", knowledgeTitle: "What Base64 and Data URI mean in front-end", definition: "Definition", definitionText: "Base64 encodes binary data as a plain-text string; a Data URI (RFC 2397) embeds it as a data:[mime];base64,data URI so the browser can use it without an extra request.",
    formula: "Formula", formulaText: "Read file → convert to a Base64 string → assemble data:mime;base64,string. Base64 maps every 3 source bytes to 4 characters, so size grows by about 33%.",
    limitations: "Limitations", limitationsText: "Base64 adds about 33% size and cannot be browser-cached, so it suits only small icons; inlining large images slows first paint, and very long Data URIs make HTML/CSS hard to maintain.",
    interpretation: "Interpretation", interpretationText: "An encoded size larger than the original is normal. If the image is small and reused, inlining saves an HTTP request; if large, a cached file link is more efficient.",
    context: "Context", contextText: "Inlined icons appear in CSS-sprite alternatives, email HTML, and offline apps; build tools can auto-convert images under a size threshold into Data URIs.",
    example: "Example", exampleText: "Drop a 2KB PNG icon, choose HTML img format, and the tool outputs <img src=\"data:image/png;base64,...\" /> — paste it straight into a template with no extra image request.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for an image-encoding workflow", premiumTitle: "Pro Image Asset Toolkit", premiumText: "Unlock batch image encoding, SVG optimization, automatic threshold-based inlining, and multi-file asset-bundle export.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool encodes only in your browser — images never leave your device, so it is fine for private or internal assets.", relatedTools: "Related tools", relatedToolsText: "Base64 Encoder · Code Minifier · Color Converter · QR Code Generator", references: "References", referencesText: "RFC 2397 Data URI Scheme; Base64 encoding spec; front-end asset-inlining best practices; image optimization and caching strategy guides.",
    q1: "What is the difference between Base64 and a Data URI?", a1: "Base64 is the encoding method (a raw string); a Data URI is the usage format (a complete URI with MIME type and prefix). Data URI = data:mime;base64,base64string.",
    q2: "Why does the encoded size grow?", a2: "Base64 needs 4 characters for every 3 source bytes, so size grows by about 33% — a fundamental trait of the encoding that cannot be avoided.",
    q3: "Does this tool upload my image?", a3: "No. All encoding runs locally in your browser — images are never uploaded to any server, so it is safe for confidential or internal images.",
    q4: "When should I inline an image?", a4: "Small, reused icons are good for inlining to save an HTTP request; large images are better served via file links so the browser can cache them and keep first paint fast.",
    q5: "Which image formats can it convert?", a5: "It supports common formats like PNG, JPEG, GIF, SVG, and WebP; the tool auto-detects the MIME type and writes it into the Data URI prefix.",
    q6: "Can the encoded result be turned back into an image?", a6: "Yes. A Data URI is lossless — browsers, image editors, or decoders can all restore it to the original image.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function ImageToBase64() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("datauri");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [mimeType, setMimeType] = useState("");
  const [base64, setBase64] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const t = ui[lang];

  const handleFile = (file: File) => {
    setFileName(file.name);
    setFileSize(file.size);
    setMimeType(file.type || "image/png");
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      const comma = dataUrl.indexOf(",");
      setBase64(comma >= 0 ? dataUrl.slice(comma + 1) : "");
    };
    reader.readAsDataURL(file);
  };

  const output = useMemo(() => {
    if (!base64) return "";
    const uri = `data:${mimeType};base64,${base64}`;
    if (outputFormat === "datauri") return uri;
    if (outputFormat === "raw") return base64;
    if (outputFormat === "html-img") return `<img src="${uri}" alt="${fileName}" />`;
    return `background-image: url("${uri}");`;
  }, [base64, mimeType, outputFormat, fileName]);

  const result = useMemo(() => {
    const encodedSize = new Blob([base64]).size;
    const inflation = fileSize > 0 ? Math.round(((encodedSize - fileSize) / fileSize) * 100) : 0;
    return { encodedSize, inflation };
  }, [base64, fileSize]);

  function fillSolid() { setUnit("metric"); setOutputFormat("html-img"); }
  function fillHighSalary() { setUnit("imperial"); setOutputFormat("css-bg"); }

  const activeBand = bands.find(b => b.key === outputFormat) || bands[0];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#fef3c7,_#f8fafc_45%,_#e0f2fe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-amber-700">{t.badge}</p><h1 className="max-w-3xl font-black tracking-tight text-slate-950 [font-size:clamp(1.75rem,4vw,2.5rem)] [line-height:1.2]">{t.title}</h1><p className="text-xl font-black text-amber-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{formatBytes(result.encodedSize)}</div><div className="text-sm font-bold text-amber-100">{l(activeBand.label, lang)}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{l(activeBand.label, lang)}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{formatBytes(fileSize)}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.effectiveHours}</div><div className="font-black">{mimeType || "—"}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">img</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "輸出 <img> 標籤" : "Outputs <img> tag"}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">css</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "輸出 url() 背景" : "Outputs url() bg"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4"><label className="block text-sm font-black text-slate-700">{t.countLabel}<input ref={fileRef} type="file" accept="image/*" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm font-bold" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} /></label><label className="block text-sm font-black text-emerald-700">{t.modeLabel}<select className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={outputFormat} onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}><option value="datauri">Data URI</option><option value="raw">{l({ zh: "純 Base64", en: "Raw Base64" }, lang)}</option><option value="html-img">HTML &lt;img&gt;</option><option value="css-bg">CSS background</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-6xl font-black tracking-tight text-slate-950">{formatBytes(result.encodedSize)}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{l(activeBand.label, lang)}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.weeklyEquiv}</div><div className="mt-1 text-xl font-black">{formatBytes(fileSize)}</div><div className="mt-1 text-xs text-slate-300">{mimeType || "—"}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.effectiveHours}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "膨脹" : "inflate"}</div><p className="mt-2 text-3xl font-black text-emerald-950">+{result.inflation}%</p><p className="text-sm font-bold text-emerald-700">{mimeType || "—"}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.dailyEquiv}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "格式" : "format"}</div><p className="mt-2 text-xl font-black text-blue-950">{l(activeBand.label, lang)}</p><p className="text-sm font-bold text-blue-700">export</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.monthlyEquiv}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "位元組" : "bytes"}</div><p className="mt-2 text-2xl font-black text-slate-950">{result.encodedSize}</p><p className="text-sm font-bold text-slate-700">{activeBand.range}</p></div></div><div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{t.outputLabel}</div><div className="mt-2 max-h-52 overflow-auto whitespace-pre-wrap break-all font-mono text-sm leading-6 text-slate-800">{output || (lang === "zh" ? "（選擇圖片後顯示...）" : "(Select an image...)")}</div><button type="button" onClick={() => { if (navigator.clipboard && output) { navigator.clipboard.writeText(output); alert(t.shareCopiedToast); } }} className="mt-3 w-full rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.copyAll}</button></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand.key === item.key ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="image-to-base64-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "格式" : "Format"}</div><div className="mt-1 text-2xl font-black">{l(activeBand.label, lang)}</div></div><div className="rounded-2xl bg-amber-50 p-4"><div className="text-xs font-black uppercase text-amber-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-amber-950">{result.encodedSize}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{fileSize}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "選圖" : "Pick", note: t.bmrStep }, { label: lang === "zh" ? "讀取" : "Read", note: t.deficitStep }, { label: lang === "zh" ? "編碼" : "Encode", note: t.trendStep }, { label: lang === "zh" ? "輸出" : "Output", note: t.mealStep }].map((node, index) => <div key={node.note} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題補充區" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="image-to-base64-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["批次", "SVG", "門檻", "打包"] : ["Batch", "SVG", "Threshold", "Bundle"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
