import { useMemo, useState, useRef } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
const l = (v: LocalText, lang: Lang) => v[lang];

type OutputFormat = "datauri" | "raw" | "html-img" | "css-bg";

const FORMAT_LABELS: Record<OutputFormat, LocalText> = {
  datauri: { zh: "Data URI", en: "Data URI" },
  raw: { zh: "純 Base64", en: "Raw Base64" },
  "html-img": { zh: "HTML <img>", en: "HTML <img>" },
  "css-bg": { zh: "CSS background", en: "CSS background" },
};

const ACCEPTED = ".png,.jpg,.jpeg,.gif,.webp,.svg,.bmp,.ico";

export default function ImageToBase64() {
  const { lang } = useLanguage();
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [mimeType, setMimeType] = useState("");
  const [base64, setBase64] = useState("");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("datauri");
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file: File) => {
    setFileName(file.name);
    setFileSize(file.size);
    setMimeType(file.type || "application/octet-stream");
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const b64 = result.split(",")[1] || result;
      setBase64(b64);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const formatted = useMemo(() => {
    if (!base64) return "";
    const uri = `data:${mimeType};base64,${base64}`;
    if (outputFormat === "datauri") return uri;
    if (outputFormat === "raw") return base64;
    if (outputFormat === "html-img") return `<img src="${uri}" alt="${fileName}" />`;
    if (outputFormat === "css-bg") return `background-image: url("${uri}");`;
    return uri;
  }, [base64, mimeType, outputFormat, fileName]);

  const base64Size = new Blob([base64]).size;
  const sizeIncrease = fileSize > 0 ? Math.round(((base64Size - fileSize) / fileSize) * 100) : 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(formatted).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleClear = () => {
    setFileName("");
    setFileSize(0);
    setMimeType("");
    setBase64("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      {/* L1-Hero */}
      <section className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 py-16">
        <div className="absolute inset-0 opacity-20 radial-gradient" style={{ background: "radial-gradient(circle at 30% 40%, rgba(255,255,255,0.3), transparent 60%)" }} />
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h1 className="text-4xl font-black text-white drop-shadow-lg">{l({ zh: "圖片轉 Base64", en: "Image to Base64" }, lang)}</h1>
          <p className="mt-3 text-lg font-black text-violet-100">{l({ zh: "將圖片檔案轉換為 Base64 編碼字串，支援 PNG/JPG/GIF/WebP/SVG 格式", en: "Convert image files to Base64 encoded strings — supports PNG/JPG/GIF/WebP/SVG" }, lang)}</p>
        </div>
      </section>

      {/* L2-TrustIntro */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-[2rem] bg-white/80 p-6 shadow-lg backdrop-blur">
          <h2 className="text-xl font-black text-violet-800">{l({ zh: "為什麼需要 Base64 編碼？", en: "Why Base64 Encoding?" }, lang)}</h2>
          <p className="mt-2 font-black text-gray-600">{l({ zh: "Base64 編碼將二進位圖片資料轉換為純文字字串，可直接嵌入 HTML/CSS/JSON 中，無需額外 HTTP 請求。適用於小圖示、SVG、Data URI 內嵌、Email 模板等場景。本工具完全在瀏覽器端執行，圖片不會上傳到任何伺服器。", en: "Base64 encoding converts binary image data into a text string that can be embedded directly in HTML/CSS/JSON without additional HTTP requests. Ideal for small icons, SVGs, Data URI embedding, email templates, etc. This tool runs entirely in your browser — images are never uploaded to any server." }, lang)}</p>
        </div>
      </section>

      {/* L3-QuickStartExample */}
      <section className="mx-auto max-w-7xl px-4 py-4">
        <div className="rounded-[2rem] bg-violet-100/60 p-6">
          <h3 className="font-black text-violet-700">{l({ zh: "快速上手", en: "Quick Start" }, lang)}</h3>
          <div className="mt-3 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl bg-white p-4 font-mono text-xs text-gray-700">
              <p className="font-black text-violet-600">{l({ zh: "拖放圖片 → Data URI", en: "Drop image → Data URI" }, lang)}</p>
              <pre className="mt-1 whitespace-pre-wrap font-black text-gray-500">{`data:image/png;base64,iVBORw0KGgo...`}</pre>
            </div>
            <div className="rounded-xl bg-white p-4 font-mono text-xs text-gray-700">
              <p className="font-black text-purple-600">{l({ zh: "或 HTML <img> 格式", en: "Or HTML <img> format" }, lang)}</p>
              <pre className="mt-1 whitespace-pre-wrap font-black text-gray-500">{`<img src="data:image/png;base64,..." />`}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* L4-InputGuidance */}
      <section className="mx-auto max-w-7xl px-4 py-4">
        <div className="rounded-[2rem] bg-white/70 p-5 shadow">
          <h3 className="font-black text-violet-800">{l({ zh: "輸入說明", en: "Input Guidance" }, lang)}</h3>
          <p className="mt-2 font-black text-gray-600">{l({ zh: "拖放圖片或點擊上傳按鈕選擇檔案（支援 PNG/JPG/GIF/WebP/SVG/BMP/ICO）。選擇輸出格式後即可複製。所有處理在本地完成。", en: "Drop an image or click upload to select a file (PNG/JPG/GIF/WebP/SVG/BMP/ICO supported). Choose output format and copy. All processing happens locally." }, lang)}</p>
        </div>
      </section>

      <AdSenseWrapper showAds={true} adSlot="dev-i64-top" adFormat="horizontal" className="my-2" />

      {/* L5-CalculatorInput */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-[2rem] bg-white/90 p-6 shadow-xl">
          <h3 className="mb-4 text-lg font-black text-violet-800">{l({ zh: "轉換設定", en: "Conversion Settings" }, lang)}</h3>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div
                className={`rounded-xl border-2 border-dashed p-8 text-center transition ${dragOver ? "border-violet-500 bg-violet-50" : "border-violet-200 bg-violet-50/30 hover:border-violet-400"}`}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <p className="font-black text-violet-700">{l({ zh: "拖放圖片到這裡", en: "Drop image here" }, lang)}</p>
                <p className="mt-2 text-sm font-black text-gray-500">{l({ zh: "或點擊下方按鈕選擇檔案", en: "Or click the button below to select file" }, lang)}</p>
                <input ref={fileRef} type="file" accept={ACCEPTED} className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                <button onClick={() => fileRef.current?.click()}
                  className="mt-4 rounded-xl bg-violet-600 px-6 py-2 text-sm font-black text-white hover:bg-violet-700 transition">
                  {l({ zh: "選擇圖片檔案", en: "Select Image File" }, lang)}
                </button>
                {fileName && (
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <span className="rounded-lg bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">{fileName}</span>
                    <button onClick={handleClear} className="text-xs font-black text-red-500 hover:underline">{l({ zh: "清除", en: "Clear" }, lang)}</button>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-black text-gray-700">{l({ zh: "輸出格式", en: "Output Format" }, lang)}</label>
              <div className="grid grid-cols-2 gap-2">
                {(["datauri", "raw", "html-img", "css-bg"] as OutputFormat[]).map(f => (
                  <button key={f} onClick={() => setOutputFormat(f)}
                    className={`rounded-lg px-3 py-2 text-xs font-black transition ${outputFormat === f ? "bg-purple-600 text-white shadow" : "bg-purple-50 text-purple-700 hover:bg-purple-100"}`}>
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
        <div className="rounded-[2rem] bg-slate-950 p-6 text-emerald-200 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black">{l({ zh: "Base64 結果", en: "Base64 Output" }, lang)}</h3>
            <button onClick={handleCopy}
              className={`rounded-xl px-5 py-2 font-black transition ${copied ? "bg-green-400 text-green-900" : "bg-white text-violet-700 hover:bg-violet-100"}`}>
              {copied ? l({ zh: "已複製 ✓", en: "Copied ✓" }, lang) : l({ zh: "一鍵複製", en: "Copy" }, lang)}
            </button>
          </div>
          <pre className="mt-4 max-h-60 overflow-y-auto rounded-xl bg-slate-900 p-4 font-mono text-sm leading-relaxed text-emerald-200 break-all">
            {formatted || l({ zh: "（等待上傳圖片...）", en: "(Waiting for image upload...)" }, lang)}
          </pre>
          <div className="mt-3 grid gap-4 lg:grid-cols-4">
            <div className="rounded-xl bg-slate-800 p-3">
              <dt className="text-xs font-black text-emerald-400">{l({ zh: "原始大小", en: "Original Size" }, lang)}</dt>
              <dd className="mt-1 text-xl font-black text-emerald-200">{fileSize > 0 ? `${(fileSize / 1024).toFixed(1)} KB` : "—"}</dd>
            </div>
            <div className="rounded-xl bg-slate-800 p-3">
              <dt className="text-xs font-black text-emerald-400">{l({ zh: "Base64 大小", en: "Base64 Size" }, lang)}</dt>
              <dd className="mt-1 text-xl font-black text-emerald-200">{base64Size > 0 ? `${(base64Size / 1024).toFixed(1)} KB` : "—"}</dd>
            </div>
            <div className="rounded-xl bg-slate-800 p-3">
              <dt className="text-xs font-black text-emerald-400">{l({ zh: "大小增幅", en: "Size Increase" }, lang)}</dt>
              <dd className="mt-1 text-xl font-black text-emerald-200">{sizeIncrease > 0 ? `+${sizeIncrease}%` : "—"}</dd>
            </div>
            <div className="rounded-xl bg-slate-800 p-3">
              <dt className="text-xs font-black text-emerald-400">{l({ zh: "MIME 類型", en: "MIME Type" }, lang)}</dt>
              <dd className="mt-1 text-lg font-black text-emerald-200">{mimeType || "—"}</dd>
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
              <dt className="text-sm font-black text-violet-600">{l({ zh: "建議嵌入大小", en: "Recommended Embed Size" }, lang)}</dt>
              <dd className="mt-1 text-2xl font-black text-violet-800">{fileSize > 10240 ? l({ zh: "不建議", en: "Not Recommended" }, lang) : l({ zh: "適合嵌入", en: "Suitable" }, lang)}</dd>
            </div>
            <div className="rounded-xl bg-purple-50 p-4">
              <dt className="text-sm font-black text-purple-600">{l({ zh: "字串長度", en: "String Length" }, lang)}</dt>
              <dd className="mt-1 text-2xl font-black text-purple-800">{base64.length > 0 ? `${(base64.length / 1000).toFixed(1)}K` : "—"}</dd>
            </div>
            <div className="rounded-xl bg-fuchsia-50 p-4">
              <dt className="text-sm font-black text-fuchsia-600">{l({ zh: "輸出格式", en: "Output Format" }, lang)}</dt>
              <dd className="mt-1 text-2xl font-black text-fuchsia-800">{l(FORMAT_LABELS[outputFormat], lang)}</dd>
            </div>
          </div>
        </div>
      </section>

      <AdSlot slot="dev-i64-mid1" position="inline" />

      {/* L8-ScenarioComparison */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-[2rem] bg-white/80 p-6 shadow-lg">
          <h3 className="font-black text-violet-800">{l({ zh: "情境比較", en: "Scenario Comparison" }, lang)}</h3>
          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto]">
            <div className="rounded-xl bg-violet-50 p-4">
              <h4 className="font-black text-violet-700">{l({ zh: "小圖示內嵌", en: "Small Icon Embed" }, lang)}</h4>
              <p className="mt-2 text-sm font-black text-gray-600">{l({ zh: "1–5KB 的圖示用 Data URI 內嵌，減少 HTTP 請求，加速首次載入", en: "1–5KB icons as Data URI embeds reduce HTTP requests, speed up first load" }, lang)}</p>
              <p className="mt-2 text-xs font-black text-violet-500">{l({ zh: "建議：Data URI 格式，限 <10KB", en: "Suggested: Data URI format, limit <10KB" }, lang)}</p>
            </div>
            <div className="rounded-xl bg-purple-50 p-4">
              <h4 className="font-black text-purple-700">{l({ zh: "CSS 背景圖", en: "CSS Background" }, lang)}</h4>
              <p className="mt-2 text-sm font-black text-gray-600">{l({ zh: "漸層底圖或小紋理用 CSS background 內嵌，避免額外資源請求", en: "Gradient backgrounds or small textures as CSS background embeds avoid extra resource requests" }, lang)}</p>
              <p className="mt-2 text-xs font-black text-purple-500">{l({ zh: "建議：CSS background 格式", en: "Suggested: CSS background format" }, lang)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* L9-EmotionConversionUpper */}
      <section className="mx-auto max-w-7xl px-4 py-4">
        <div className="rounded-[2rem] bg-gradient-to-r from-violet-100 to-purple-100 p-6">
          <h3 className="font-black text-violet-800">{l({ zh: "從外部依賴到自包含", en: "From External Dependency to Self-Contained" }, lang)}</h3>
          <p className="mt-2 font-black text-gray-600">{l({ zh: "每次 HTTP 請求都是一次等待——DNS 查詢、TLS 握手、伺服器回應。小圖片內嵌為 Base64，就是消除那一次等待。對行動端和弱網路環境尤其有感。", en: "Every HTTP request is a wait — DNS lookup, TLS handshake, server response. Embedding small images as Base64 eliminates that wait. Especially impactful on mobile and weak networks." }, lang)}</p>
        </div>
      </section>

      {/* L10-EmotionConversionLower */}
      <section className="mx-auto max-w-7xl px-4 py-4">
        <div className="rounded-[2rem] bg-gradient-to-r from-purple-100 to-fuchsia-100 p-6">
          <h3 className="font-black text-purple-800">{l({ zh: "一張小圖的影響力", en: "The Impact of One Small Image" }, lang)}</h3>
          <p className="mt-2 font-black text-gray-600">{l({ zh: "一個 2KB 的圖示單獨載入需 50–200ms（含連線開銷）。Base64 內嵌後，0ms 額外延遲。10 個小圖示就是 0.5–2 秒的差距。", en: "A 2KB icon loaded separately takes 50–200ms (including connection overhead). As Base64 embed: 0ms extra delay. 10 small icons = 0.5–2 seconds difference." }, lang)}</p>
        </div>
      </section>

      {/* L11-DecisionPath */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-[2rem] bg-white/80 p-6 shadow">
          <h3 className="font-black text-violet-800">{l({ zh: "決策路徑", en: "Decision Path" }, lang)}</h3>
          <div className="mt-3 space-y-3">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600 text-sm font-black text-white">1</span>
              <p className="font-black text-gray-700">{l({ zh: "圖片 < 10KB？→ 使用 Data URI 內嵌，減少 HTTP 請求", en: "Image < 10KB? → Use Data URI embed to reduce HTTP requests" }, lang)}</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-600 text-sm font-black text-white">2</span>
              <p className="font-black text-gray-700">{l({ zh: "需要嵌入 CSS？→ 選擇 CSS background 格式", en: "Need CSS embed? → Choose CSS background format" }, lang)}</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-fuchsia-600 text-sm font-black text-white">3</span>
              <p className="font-black text-gray-700">{l({ zh: "圖片 > 50KB？→ 不建議 Base64 內嵌，保持外部連結", en: "Image > 50KB? → Not recommended for Base64 embed, keep as external link" }, lang)}</p>
            </div>
          </div>
        </div>
      </section>

      <AdSenseWrapper showAds={true} adSlot="dev-i64-mid2" adFormat="horizontal" className="my-2" />

      {/* L12-Knowledge */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-[2rem] bg-violet-50/80 p-6">
          <h3 className="font-black text-violet-800">{l({ zh: "知識庫", en: "Knowledge Base" }, lang)}</h3>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <h4 className="font-black text-violet-700">{l({ zh: "Base64 編碼原理", en: "Base64 Encoding Principle" }, lang)}</h4>
              <p className="mt-2 text-sm font-black text-gray-600">{l({ zh: "Base64 將每 3 個位元組（24 位元）重新分組為 4 個 6 位元單位，每個單位對應 A–Z/a–z/0–9+/ 共 64 個可列印字元。因此 Base64 編碼後大小增加約 33%。", en: "Base64 regroups every 3 bytes (24 bits) into 4 six-bit units, each mapping to one of 64 printable characters (A–Z/a–z/0–9+/). This results in ~33% size increase after encoding." }, lang)}</p>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <h4 className="font-black text-purple-700">{l({ zh: "Data URI 是什麼？", en: "What is Data URI?" }, lang)}</h4>
              <p className="mt-2 text-sm font-black text-gray-600">{l({ zh: "Data URI Scheme（RFC 2397）允許將小型資源直接內嵌為 URI 格式：data:[mediatype][;base64],data。瀏覽器無需額外請求即可直接使用。", en: "Data URI Scheme (RFC 2397) allows embedding small resources directly as URI format: data:[mediatype][;base64],data. Browsers can use them without additional requests." }, lang)}</p>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <h4 className="font-black text-fuchsia-700">{l({ zh: "使用限制與最佳實務", en: "Limitations and Best Practices" }, lang)}</h4>
              <p className="mt-2 text-sm font-black text-gray-600">{l({ zh: "建議只對 < 10KB 的圖片使用 Base64 內嵌。大檔案會顯著增加 HTML/CSS 體積且無法被瀏覽器快取。CSS 檔案中的 Base64 會阻塞渲染。", en: "Only use Base64 embeds for images < 10KB. Large files significantly increase HTML/CSS size and can't be browser-cached. Base64 in CSS blocks rendering." }, lang)}</p>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <h4 className="font-black text-violet-700">{l({ zh: "安全與隱私", en: "Security and Privacy" }, lang)}</h4>
              <p className="mt-2 text-sm font-black text-gray-600">{l({ zh: "Base64 是編碼不是加密——任何人都能解碼。不要用 Base64「隱藏」敏感圖片。本工具不上傳任何檔案，所有轉換在瀏覽器端完成。", en: "Base64 is encoding, not encryption — anyone can decode it. Don't use Base64 to 'hide' sensitive images. This tool never uploads files; all conversion happens in-browser." }, lang)}</p>
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
              <summary className="cursor-pointer font-black text-violet-700">{l({ zh: "Base64 會讓圖片變小嗎？", en: "Does Base64 make images smaller?" }, lang)}</summary>
              <p className="mt-2 font-black text-gray-600">{l({ zh: "不會。Base64 編碼後大小反而增加約 33%。它的價值在於消除 HTTP 請求開銷，而非壓縮檔案。", en: "No. Base64 encoding increases size by ~33%. Its value is eliminating HTTP request overhead, not compressing files." }, lang)}</p>
            </details>
            <details className="rounded-xl bg-purple-50 p-4">
              <summary className="cursor-pointer font-black text-purple-700">{l({ zh: "多大以上的圖片不建議用 Base64？", en: "What size is too large for Base64?" }, lang)}</summary>
              <p className="mt-2 font-black text-gray-600">{l({ zh: "一般建議 < 10KB 適合內嵌，10–50KB 需評估，> 50KB 不建議。大型 Base64 字串會佔用 DOM 記憶體且無法被獨立快取。", en: "Generally < 10KB is suitable for embedding, 10–50KB needs evaluation, > 50KB not recommended. Large Base64 strings consume DOM memory and can't be independently cached." }, lang)}</p>
            </details>
            <details className="rounded-xl bg-fuchsia-50 p-4">
              <summary className="cursor-pointer font-black text-fuchsia-700">{l({ zh: "支援 SVG 嗎？", en: "Is SVG supported?" }, lang)}</summary>
              <p className="mt-2 font-black text-gray-600">{l({ zh: "支援。SVG 檔案可以直接用 Data URI 內嵌，也可以將 SVG 原始碼直接放入 HTML。對於 SVG，直接內嵌原始碼通常比 Base64 更高效。", en: "Yes. SVG files can be embedded as Data URI, or SVG source can be placed directly in HTML. For SVGs, inlining source code is usually more efficient than Base64." }, lang)}</p>
            </details>
            <details className="rounded-xl bg-violet-50 p-4">
              <summary className="cursor-pointer font-black text-violet-700">{l({ zh: "Base64 和 Data URI 有什麼差別？", en: "Base64 vs Data URI difference?" }, lang)}</summary>
              <p className="mt-2 font-black text-gray-600">{l({ zh: "Base64 是編碼方式（純字串），Data URI 是使用方式（包含 MIME 類型與格式前綴的完整 URI）。Data URI = data:mime;base64,Base64字串。", en: "Base64 is the encoding method (raw string), Data URI is the usage format (complete URI including MIME type and format prefix). Data URI = data:mime;base64,base64string." }, lang)}</p>
            </details>
          </div>
        </div>
      </section>

      {/* L14-FAQAfterAdSlot */}
      <section className="mx-auto max-w-7xl px-4 py-2">
        <AdSlot slot="dev-i64-faq" position="inline" />
      </section>

      {/* L15-AffiliateResources */}
      <section className="mx-auto max-w-7xl px-4 py-4">
        <div className="rounded-[2rem] bg-gradient-to-r from-violet-50 to-purple-50 p-6">
          <h3 className="font-black text-violet-800">{l({ zh: "推薦資源", en: "Recommended Resources" }, lang)}</h3>
          <div className="mt-3 grid gap-3 lg:grid-cols-3">
            <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URLs" target="_blank" rel="noopener"
              className="rounded-xl bg-white p-3 shadow-sm transition hover:shadow-md">
              <p className="font-black text-violet-700">MDN Data URLs</p>
              <p className="text-xs font-black text-gray-500">{l({ zh: "Data URI 官方文件", en: "Data URI official docs" }, lang)}</p>
            </a>
            <a href="https://www.base64-image.de" target="_blank" rel="noopener"
              className="rounded-xl bg-white p-3 shadow-sm transition hover:shadow-md">
              <p className="font-black text-purple-700">Base64 Image</p>
              <p className="text-xs font-black text-gray-500">{l({ zh: "線上圖片轉 Base64", en: "Online image to Base64" }, lang)}</p>
            </a>
            <a href="https://web.dev/articles/fast-load-time" target="_blank" rel="noopener"
              className="rounded-xl bg-white p-3 shadow-sm transition hover:shadow-md">
              <p className="font-black text-fuchsia-700">web.dev Fast Load</p>
              <p className="text-xs font-black text-gray-500">{l({ zh: "效能優化指南", en: "Performance optimization guide" }, lang)}</p>
            </a>
          </div>
        </div>
      </section>

      {/* L16-PremiumGate */}
      <section className="mx-auto max-w-7xl px-4 py-4">
        <PremiumGate plan="PRO">
          <div className="rounded-[2rem] bg-gradient-to-r from-amber-50 to-yellow-50 p-6">
            <h3 className="font-black text-amber-800">{l({ zh: "進階功能", en: "Premium Features" }, lang)}</h3>
            <p className="mt-2 font-black text-gray-600">{l({ zh: "升級 PRO 解鎖：批次多檔轉換、自動圖片壓縮前處理、WebP 轉檔、CSS Sprite 生成、Base64 解碼還原、無廣告體驗。", en: "Upgrade to PRO to unlock: batch multi-file conversion, auto image compression preprocessing, WebP conversion, CSS Sprite generation, Base64 decode restore, ad-free experience." }, lang)}</p>
          </div>
        </PremiumGate>
      </section>

      {/* L17-TrustRelatedReferences */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-[2rem] bg-white/60 p-6">
          <h3 className="font-black text-violet-800">{l({ zh: "參考來源", en: "References" }, lang)}</h3>
          <ul className="mt-3 space-y-2 text-sm font-black text-gray-600">
            <li className="font-black">&bull; IETF RFC 2397 (1998). {l({ zh: "Data URI Scheme 標準", en: "Data URI Scheme standard" }, lang)}.</li>
            <li className="font-black">&bull; IETF RFC 4648 (2006). {l({ zh: "Base64 編碼規範", en: "Base64 encoding specification" }, lang)}.</li>
            <li className="font-black">&bull; HTTP Archive (2024). {l({ zh: "Data URI 使用統計報告", en: "Data URI usage statistics report" }, lang)}.</li>
            <li className="font-black">&bull; Google web.dev (2023). {l({ zh: "資源內嵌最佳實務", en: "Resource inlining best practices" }, lang)}.</li>
          </ul>
        </div>
      </section>

      <footer className="py-6 text-center text-xs font-black text-gray-400">
        {l({ zh: "圖片轉 Base64 © 2026 — 瀏覽器端工具，零資料傳輸", en: "Image to Base64 © 2026 — Browser-based tool, zero data transmission" }, lang)}
      </footer>
    </div>
  );
}
