/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  Formula Universe — PdfToWord Converter                               ║
 * ║  GOLDEN TEMPLATE: structurally identical to WordToPdf (WTP).          ║
 * ║                                                                       ║
 * ║  Same page form / architecture / tier count / tier order / blocks /   ║
 * ║  format / spacing / theme spec / width as WordToPdf. The only         ║
 * ║  differences are direction-specific semantics (PDF→.docx) and the     ║
 * ║  text-layer-vs-OCR conversion path.                                   ║
 * ║                                                                       ║
 * ║  Architecture:                                                        ║
 * ║   Browser upload → POST /api/convert/pdf-to-word                      ║
 * ║                  → server LibreOffice (writer_pdf_import)             ║
 * ║                  → tesseract OCR fallback for scanned PDFs            ║
 * ║                  → .docx download                                     ║
 * ║                                                                       ║
 * ║  Commercial scaffolding (AdSlot ×4, PremiumGate) is pre-wired so the  ║
 * ║  free+ads launch can flip to freemium/subscription without touching   ║
 * ║  the conversion core.                                                 ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */
import { useState, useCallback, useRef } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type Status = "idle" | "converting" | "done" | "error";
type ConvMode = "text" | "ocr" | "unknown";

const MAX_BYTES = 25 * 1024 * 1024; // mirror server express.raw limit

// ─── i18n copy ───────────────────────────────────────────────────────────────
const T = {
  zh: {
    title: "PDF 轉 Word",
    subtitle:
      "免費線上 PDF 轉 Word（.docx）。自動偵測文字層；掃描／圖片 PDF 內建中文 OCR 辨識，輸出可編輯文件。",
    badge1: "免費無限次",
    badge2: "支援中文 OCR",
    badge3: "輸出可編輯 .docx",
    uploadLabel: "拖曳 PDF 到此，或點擊選擇檔案",
    uploadHint: "支援 .pdf，單檔上限 25MB",
    dragHint: "檔案僅於伺服器轉換當下處理，完成後立即刪除",
    chooseFile: "選擇 PDF 檔案",
    convertBtn: "開始轉換為 Word",
    converting: "轉換中，請稍候…",
    convertingOcr: "偵測為掃描／圖片 PDF，正在執行 OCR 中文辨識（較花時間）…",
    stageReading: "讀取檔案中…",
    stageUploading: "上傳並偵測文字層…",
    stageConverting: "LibreOffice 轉換為 .docx…",
    successNote: "轉換完成！",
    downloadBtn: "下載 Word 檔（.docx）",
    reupload: "轉換另一個檔案",
    modeText: "文字層直接轉換",
    modeOcr: "OCR 辨識（掃描／圖片 PDF）",
    pages: "頁數",
    elapsed: "耗時",
    errorTitle: "轉換失敗",
    errorHint: "請確認檔案為有效 PDF；若為掃描檔請提高清晰度後再試。",
    errNoText:
      "此 PDF 為掃描／圖片，且 OCR 無法辨識出文字。請改用文字版 PDF，或提高掃描品質後再試。",
    errType: "請上傳 .pdf 檔案。",
    errTooBig: "檔案過大，請上傳小於 25MB 的 PDF。",
    privacyTitle: "隱私與安全",
    privacyDesc:
      "您的檔案只在轉換當下於伺服器的隔離暫存目錄處理，轉換完成或失敗後即自動刪除，不會保留、不會用於任何其他用途，也不會將內容提供給第三方。",
    premiumTitle: "進階方案（即將推出）",
    premiumDesc:
      "批次轉換、超大檔案、OCR 進階版面還原、文字框合併為流式段落、去浮水印等，將於進階方案開放。",
    // T10 Knowledge Base
    kbTitle: "PDF 轉 Word 知識庫",
    kbWhenTitle: "適合使用的情境",
    kbWhen: [
      "需要重新編輯一份只有 PDF 的文件",
      "把報價單／合約／表單轉成可修改的 Word",
      "掃描的紙本文件想轉成可搜尋、可編輯的檔案",
      "從 PDF 擷取文字段落再利用",
    ],
    kbQualityTitle: "品質與限制",
    kbQuality: [
      "含文字層的 PDF 轉換最快、品質最好。",
      "複雜表格、多欄排版可能以文字框呈現，需要微調。",
      "掃描／圖片 PDF 走 OCR，辨識率取決於原稿清晰度。",
      "特殊字型可能由系統字型替代。",
    ],
    kbNotTitle: "不適合或需注意",
    kbNot: [
      "極度複雜的排版無法 100% 還原成流式結構",
      "模糊、傾斜或低解析度掃描件 OCR 易出錯",
      "受密碼保護的 PDF 需先解除保護",
    ],
    kbTechTitle: "技術原理",
    kbTech:
      "系統先以 pdftotext 偵測文字層：有文字層則直接用 LibreOffice 的 PDF 匯入引擎轉成 .docx；無文字層（掃描／圖片）則以 pdftoppm 點陣化後交由 Tesseract OCR（繁中+簡中+英文）產生可搜尋文字，再轉成 .docx。全程於伺服器隔離環境處理，完成後即清除暫存檔。",
    faqTitle: "常見問題",
    faqs: [
      { q: "支援哪些 PDF？", a: "支援標準 .pdf。含文字層的 PDF 轉換最快、品質最好；掃描／圖片 PDF 會自動走 OCR。" },
      { q: "掃描的 PDF 可以轉嗎？", a: "可以。系統偵測到無文字層時會自動以 OCR 辨識（繁中／簡中／英文），辨識率取決於掃描清晰度。" },
      { q: "轉出來的 Word 可以編輯嗎？", a: "可以。輸出為標準 .docx，可在 Word／Google Docs／LibreOffice 開啟編輯。" },
      { q: "版面會跟原 PDF 一模一樣嗎？", a: "會盡量近似還原，但因 PDF 與 Word 結構本質不同，複雜版面可能以文字框呈現，需要微調。" },
      { q: "檔案會被保留嗎？", a: "不會。檔案僅於轉換當下處理，完成後立即從伺服器刪除。" },
      { q: "有檔案大小限制嗎？", a: "目前單檔上限 25MB。" },
    ],
    relatedTitle: "相關工具",
    related: [
      { name: "Word 轉 PDF", path: "/tools/converter/word-to-pdf", desc: "把 Word 高保真轉成向量 PDF，支援中文。" },
    ],
    poweredBy: "Powered by LibreOffice + Tesseract OCR · 開源引擎，伺服器端轉換",
  },
  en: {
    title: "PDF to Word",
    subtitle:
      "Free online PDF to Word (.docx). Auto-detects the text layer; scanned / image PDFs are OCR'd (Chinese + English). Output is fully editable.",
    badge1: "Free & unlimited",
    badge2: "Chinese OCR built-in",
    badge3: "Editable .docx output",
    uploadLabel: "Drag a PDF here, or click to choose a file",
    uploadHint: "Supports .pdf, up to 25MB per file",
    dragHint: "Files are processed only during conversion and deleted right after.",
    chooseFile: "Choose PDF file",
    convertBtn: "Convert to Word",
    converting: "Converting, please wait…",
    convertingOcr: "Detected a scanned / image PDF — running OCR (this takes longer)…",
    stageReading: "Reading file…",
    stageUploading: "Uploading & detecting text layer…",
    stageConverting: "LibreOffice converting to .docx…",
    successNote: "Conversion complete!",
    downloadBtn: "Download Word (.docx)",
    reupload: "Convert another file",
    modeText: "Direct text-layer conversion",
    modeOcr: "OCR (scanned / image PDF)",
    pages: "Pages",
    elapsed: "Elapsed",
    errorTitle: "Conversion failed",
    errorHint: "Please ensure the file is a valid PDF; for scans, try a higher-quality source.",
    errNoText:
      "This PDF is a scan/image and OCR could not recognise any text. Please use a text-based PDF or a higher-quality scan.",
    errType: "Please upload a .pdf file.",
    errTooBig: "File too large. Please upload a PDF smaller than 25MB.",
    privacyTitle: "Privacy & security",
    privacyDesc:
      "Your file is processed only momentarily in an isolated temporary directory on the server and is automatically deleted once conversion finishes or fails. We never retain it, never use it for any other purpose, and never share its contents with third parties.",
    premiumTitle: "Advanced plan (coming soon)",
    premiumDesc:
      "Batch conversion, very large files, advanced OCR layout reconstruction, text-frame-to-paragraph merging and watermark removal will be available on the upgraded plan.",
    kbTitle: "PDF to Word knowledge base",
    kbWhenTitle: "Great for",
    kbWhen: [
      "Re-editing a document you only have as a PDF",
      "Turning quotations / contracts / forms into editable Word",
      "Converting scanned paper into searchable, editable files",
      "Extracting text passages from a PDF to reuse",
    ],
    kbQualityTitle: "Quality & limits",
    kbQuality: [
      "PDFs with a text layer convert fastest and best.",
      "Complex tables / multi-column layouts may appear as text frames and need tweaking.",
      "Scanned / image PDFs use OCR; accuracy depends on source quality.",
      "Special fonts may be substituted by system fonts.",
    ],
    kbNotTitle: "Not ideal / note",
    kbNot: [
      "Extremely complex layouts can't be 100% reflowed",
      "Blurry, skewed or low-res scans cause OCR errors",
      "Password-protected PDFs must be unlocked first",
    ],
    kbTechTitle: "How it works",
    kbTech:
      "The server detects a text layer with pdftotext: with a text layer it converts directly to .docx via LibreOffice's PDF import; without one (scan/image) it rasterises with pdftoppm and runs Tesseract OCR (Traditional+Simplified Chinese+English) to build a searchable text layer, then converts to .docx. Everything runs in an isolated sandbox and temp files are deleted afterwards.",
    faqTitle: "Frequently asked questions",
    faqs: [
      { q: "Which PDFs are supported?", a: "Standard .pdf files. PDFs with a text layer convert fastest and best; scanned/image PDFs automatically use OCR." },
      { q: "Can I convert a scanned PDF?", a: "Yes. When no text layer is detected the tool runs OCR (Traditional/Simplified Chinese & English); accuracy depends on scan quality." },
      { q: "Is the Word output editable?", a: "Yes. It is a standard .docx you can open and edit in Word / Google Docs / LibreOffice." },
      { q: "Will the layout match the original exactly?", a: "It is approximated as closely as possible, but because PDF and Word differ structurally, complex layouts may appear as text frames and need tweaking." },
      { q: "Is my file kept?", a: "No. It is processed only during conversion and deleted from the server immediately afterwards." },
      { q: "Is there a size limit?", a: "Currently 25MB per file." },
    ],
    relatedTitle: "Related tools",
    related: [
      { name: "Word to PDF", path: "/tools/converter/word-to-pdf", desc: "High-fidelity Word to vector PDF, with Chinese support." },
    ],
    poweredBy: "Powered by LibreOffice + Tesseract OCR · open-source engines, server-side conversion",
  },
} as const;

// ─── Conversion call ─────────────────────────────────────────────────────────
async function convertViaServer(
  file: File,
  onStage: (s: "reading" | "uploading" | "converting") => void,
  onOcr: () => void
): Promise<{ blob: Blob; mode: ConvMode; pages: number; ms: number }> {
  onStage("reading");
  const buf = await file.arrayBuffer();
  onStage("uploading");
  // Scanned PDFs simply take longer; surface the OCR hint after a short delay.
  const ocrHintTimer = setTimeout(onOcr, 4000);
  let resp: Response;
  try {
    onStage("converting");
    resp = await fetch("/api/convert/pdf-to-word", {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "x-filename": encodeURIComponent(file.name),
      },
      body: buf,
    });
  } finally {
    clearTimeout(ocrHintTimer);
  }

  if (!resp.ok) {
    let detail = `HTTP ${resp.status}`;
    try {
      const j = await resp.json();
      if (j?.error) detail = j.error;
    } catch {
      /* non-json */
    }
    const err = new Error(detail);
    (err as any).code = detail;
    throw err;
  }

  const blob = await resp.blob();
  return {
    blob,
    mode: (resp.headers.get("X-Conversion-Mode") as ConvMode) || "unknown",
    pages: Number(resp.headers.get("X-Pdf-Pages") || 0),
    ms: Number(resp.headers.get("X-Conversion-Ms") || 0),
  };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function PdfToWord() {
  const { lang } = useLanguage() as { lang: Lang };
  const t = T[lang] ?? T.zh;

  const [status, setStatus] = useState<Status>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [stageLabel, setStageLabel] = useState("");
  const [progress, setProgress] = useState(0);
  const [ocrActive, setOcrActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [docxUrl, setDocxUrl] = useState<string | null>(null);
  const [docxName, setDocxName] = useState("converted.docx");
  const [docxSize, setDocxSize] = useState(0);
  const [mode, setMode] = useState<ConvMode>("unknown");
  const [pages, setPages] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const fileSizeMb = file ? file.size / 1024 / 1024 : 0;
  const showCommercialPreview = status === "idle";

  const resetAll = useCallback(() => {
    if (docxUrl) URL.revokeObjectURL(docxUrl);
    setStatus("idle");
    setFile(null);
    setErrorMsg("");
    setDocxUrl(null);
    setProgress(0);
    setOcrActive(false);
    setMode("unknown");
  }, [docxUrl]);

  const startFakeProgress = () => {
    setProgress(8);
    progressTimer.current = setInterval(() => {
      setProgress((p) => (p >= 92 ? 92 : p + Math.max(1, Math.round((95 - p) / 12))));
    }, 600);
  };
  const stopFakeProgress = (final = 100) => {
    if (progressTimer.current) clearInterval(progressTimer.current);
    progressTimer.current = null;
    setProgress(final);
  };

  const handleFile = useCallback(
    (f: File | null) => {
      if (!f) return;
      setErrorMsg("");
      if (f.size > MAX_BYTES) {
        setFile(null);
        setStatus("error");
        setErrorMsg(t.errTooBig);
        return;
      }
      const isPdf = f.type === "application/pdf" || /\.pdf$/i.test(f.name);
      if (!isPdf) {
        setFile(null);
        setStatus("error");
        setErrorMsg(t.errType);
        return;
      }
      setFile(f);
      setStatus("idle");
    },
    [t]
  );

  const handleConvert = useCallback(async () => {
    if (!file) return;
    setStatus("converting");
    setOcrActive(false);
    startFakeProgress();
    const stageMap = {
      reading: t.stageReading,
      uploading: t.stageUploading,
      converting: t.stageConverting,
    } as const;
    try {
      const { blob, mode: m, pages: pg, ms } = await convertViaServer(
        file,
        (s) => setStageLabel(stageMap[s]),
        () => setOcrActive(true)
      );
      stopFakeProgress(100);
      const url = URL.createObjectURL(blob);
      setDocxUrl(url);
      setDocxName(file.name.replace(/\.pdf$/i, "") + ".docx");
      setDocxSize(blob.size);
      setMode(m);
      setPages(pg);
      setElapsedMs(ms);
      setStatus("done");
    } catch (e: any) {
      stopFakeProgress(0);
      setStatus("error");
      const code = String(e?.code || e?.message || "");
      if (/OCR_NO_TEXT|OCR_FAILED/.test(code)) setErrorMsg(t.errNoText);
      else if (/INVALID_PDF/.test(code)) setErrorMsg(t.errType);
      else setErrorMsg(e?.message || code);
    }
  }, [file, t]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#fef3c7,_#f8fafc_45%,_#e0f2fe)] font-sans">
      <div className="mx-auto max-w-7xl px-4 py-10 space-y-7">

        {/* T1 Hero */}
        <section className="text-center space-y-4">
          <h1 className="text-4xl font-black text-slate-900 leading-tight">{t.title}</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">{t.subtitle}</p>
          <div className="flex justify-center gap-3 flex-wrap">
            {[t.badge1, t.badge2, t.badge3].map((b) => (
              <span key={b} className="bg-blue-100 text-blue-800 text-sm font-bold px-4 py-1.5 rounded-full">{b}</span>
            ))}
          </div>
        </section>

        {/* T2 AdSlot TOP */}
        <AdSenseWrapper showAds={true} adSlot="pdf-to-word-top" adFormat="horizontal" />
        <AdSlot slot="pdf-to-word-top" position="inline" />

        {/* T3 Upload Zone */}
        <section
          className={`rounded-[2rem] border-2 border-dashed p-10 text-center space-y-4 transition-colors ${
            isDragging ? "border-blue-500 bg-blue-50" : "border-blue-300 bg-white"
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault(); setIsDragging(false);
            handleFile(e.dataTransfer.files?.[0] ?? null);
          }}
        >
          <div className="text-6xl select-none">📄</div>
          <p className="font-black text-xl text-slate-800">{t.uploadLabel}</p>
          <p className="text-slate-500 text-sm">{t.uploadHint}</p>
          <p className="text-slate-400 text-sm">{t.dragHint}</p>
          <input type="file" accept=".pdf,application/pdf" className="hidden" id="ftPtW"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
          <label htmlFor="ftPtW"
            className="inline-block cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3 rounded-xl transition shadow">
            {t.chooseFile}
          </label>
          {file && (
            <p className="text-green-700 font-bold text-sm">
              ✅ {file.name} &nbsp;·&nbsp; {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          )}
        </section>

        {/* T4A Always-visible commercial preview */}
        {showCommercialPreview && (
          <section className="grid gap-4 md:grid-cols-3">
            <article className="rounded-[1.5rem] border border-emerald-200 bg-white/90 p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">Free Core</p>
              <h3 className="mt-2 text-xl font-black text-slate-900">快速轉 Word</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                文字版 PDF 通常數秒內完成；掃描／圖片 PDF 自動以 OCR 辨識（較花時間），輸出標準可編輯 .docx。
              </p>
            </article>
            <article className="rounded-[1.5rem] border border-violet-200 bg-violet-50/90 p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-600">Premium Export</p>
              <h3 className="mt-2 text-xl font-black text-slate-900">專業還原</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                文字框合併為流式段落、表格重建、批量轉換與 ZIP 交付，將作為進階還原能力。
              </p>
            </article>
            <article className="rounded-[1.5rem] border border-indigo-200 bg-indigo-50/90 p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">OCR Engine</p>
              <h3 className="mt-2 text-xl font-black text-slate-900">中文 OCR 辨識</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                掃描／圖片 PDF 自動以 Tesseract（繁中＋簡中＋英文）辨識成可搜尋、可編輯文字。
              </p>
            </article>
          </section>
        )}

        {/* T5 Convert Button */}
        {file && status === "idle" && (
          <div className="text-center">
            <button onClick={handleConvert}
              className="bg-green-600 hover:bg-green-700 text-white font-black text-xl px-12 py-5 rounded-[2rem] transition shadow-lg">
              {t.convertBtn}
            </button>
          </div>
        )}

        {/* T6 Progress + AdSlot WAIT */}
        {status === "converting" && (
          <section className="space-y-6">
            <div className="text-center space-y-3">
              <p className="font-black text-xl text-blue-700 animate-pulse">{t.converting}</p>
              <p className="text-slate-500 text-sm">{stageLabel}</p>
              <div className="w-full max-w-md mx-auto bg-blue-100 rounded-full h-3 overflow-hidden">
                <div className="bg-blue-500 h-3 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs font-bold text-blue-700">{progress}%</p>
              {ocrActive && (
                <div className="max-w-2xl mx-auto bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl px-4 py-3 text-sm leading-relaxed">
                  {t.convertingOcr}
                </div>
              )}
            </div>
            <AdSenseWrapper showAds={true} adSlot="pdf-to-word-wait" adFormat="horizontal" />
            <AdSlot slot="pdf-to-word-wait" position="inline" />
          </section>
        )}

        {/* T7 Productized Result Center + AdSlot DOWNLOAD */}
        {status === "done" && (
          <section className="space-y-5">
            <div className="overflow-hidden rounded-[2rem] border border-emerald-200 bg-white shadow-xl">
              <div className="bg-gradient-to-r from-emerald-50 via-blue-50 to-indigo-50 p-6 text-center md:p-8">
                <p className="text-emerald-700 font-black text-xl">✅ {t.successNote}</p>
                <p className="mt-2 text-sm text-slate-500">
                  {docxName} · {(docxSize / 1024).toFixed(1)} KB ·{" "}
                  {mode === "ocr" ? t.modeOcr : t.modeText}
                  {pages ? ` · ${t.pages}: ${pages}` : ""}
                  {elapsedMs ? ` · ${t.elapsed}: ${(elapsedMs / 1000).toFixed(1)}s` : ""}
                </p>
              </div>

              <div className="grid gap-4 p-5 md:grid-cols-3 md:p-6">
                <article className="rounded-[1.5rem] border-2 border-blue-200 bg-blue-50 p-5 text-center shadow-sm">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Free</p>
                  <h3 className="mt-2 text-xl font-black text-slate-900">下載 Word</h3>
                  <p className="mt-2 min-h-[3rem] text-sm leading-relaxed text-slate-600">
                    立即取得可編輯 .docx，可在 Word／Google Docs／LibreOffice 開啟修改。
                  </p>
                  {docxUrl && (
                    <a href={docxUrl} download={docxName}
                      className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-blue-600 px-6 py-4 text-lg font-black text-white shadow-lg transition hover:bg-blue-700">
                      {t.downloadBtn}
                    </a>
                  )}
                </article>

                <article className="rounded-[1.5rem] border border-violet-200 bg-violet-50 p-5 text-center shadow-sm">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-600">Premium Export</p>
                  <h3 className="mt-2 text-xl font-black text-slate-900">專業還原</h3>
                  <p className="mt-2 min-h-[3rem] text-sm leading-relaxed text-slate-600">
                    規劃支援文字框合併為段落、表格重建、批量轉換與 ZIP 交付。
                  </p>
                  <button type="button" disabled
                    className="mt-5 inline-flex w-full cursor-not-allowed items-center justify-center rounded-2xl border border-violet-200 bg-white px-6 py-4 text-sm font-black text-violet-700 opacity-80">
                    Premium 功能規劃中
                  </button>
                </article>

                <article className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 text-center shadow-sm">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Premium Share</p>
                  <h3 className="mt-2 text-xl font-black text-slate-900">安全分享</h3>
                  <p className="mt-2 min-h-[3rem] text-sm leading-relaxed text-slate-600">
                    規劃支援短連結、到期日、密碼、權限控管與團隊交付紀錄。
                  </p>
                  <button type="button" disabled
                    className="mt-5 inline-flex w-full cursor-not-allowed items-center justify-center rounded-2xl border border-amber-200 bg-white px-6 py-4 text-sm font-black text-amber-700 opacity-80">
                    需雲端帳戶 / 訂閱
                  </button>
                </article>
              </div>

              <div className="border-t border-slate-100 bg-slate-50 p-5 md:p-6">
                <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
                  <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Conversion Engine</p>
                    <div className="mt-3 flex items-end gap-3">
                      <span className="text-5xl font-black text-emerald-600">{mode === "ocr" ? "OCR" : "TEXT"}</span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">
                      {mode === "ocr"
                        ? "此檔無文字層，已透過 Tesseract OCR（繁中＋簡中＋英文）辨識後轉成可編輯 .docx。"
                        : "此檔含文字層，已直接以 LibreOffice 匯入引擎轉成可編輯 .docx。"}
                    </p>
                  </div>

                  <PremiumGate plan="PRO">
                    <article className="rounded-[1.5rem] border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-sm">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Upgrade Path</p>
                      <h3 className="mt-2 text-2xl font-black text-slate-900">解鎖進階還原</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        進階方案將提供文字框合併為流式段落、表格重建、OCR 進階版面還原與批量工作流，協助商務文件交付前快速整潔化。
                      </p>
                      <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        {["文字框→流式段落合併", "表格結構重建", "OCR 進階版面還原", "批量轉換與 ZIP 交付"].map((item) => (
                          <span key={item} className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-indigo-900 shadow-sm">{item}</span>
                        ))}
                      </div>
                    </article>
                  </PremiumGate>
                </div>
              </div>
            </div>

            <AdSenseWrapper showAds={true} adSlot="pdf-to-word-download" adFormat="horizontal" />
            <AdSlot slot="pdf-to-word-download" position="inline" />

            <div className="text-center">
              <button onClick={resetAll}
                className="text-sm text-slate-400 hover:text-slate-600 underline mt-2">
                {t.reupload}
              </button>
            </div>
          </section>
        )}

        {/* Error State */}
        {status === "error" && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-3">
            <p className="text-red-700 font-black text-lg">❌ {t.errorTitle}</p>
            <p className="text-slate-600 text-sm">{t.errorHint}</p>
            {errorMsg && <p className="font-mono text-xs text-red-400 break-all">{errorMsg}</p>}
            <button onClick={resetAll}
              className="text-sm text-blue-600 hover:text-blue-800 underline">
              {t.reupload}
            </button>
          </div>
        )}

        {/* T8 Privacy */}
        <section className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-2">
          <h3 className="font-black text-slate-800">{t.privacyTitle}</h3>
          <p className="text-slate-600 text-sm leading-relaxed">{t.privacyDesc}</p>
        </section>

        {/* T9 PremiumGate */}
        <PremiumGate>
          <div className="space-y-2">
            <h3 className="font-black text-lg text-slate-800">{t.premiumTitle}</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{t.premiumDesc}</p>
          </div>
        </PremiumGate>

        {/* T10 Knowledge Base */}
        <section className="bg-blue-50 border border-blue-200 rounded-[2rem] p-8 space-y-6">
          <h2 className="text-2xl font-black text-blue-900">{t.kbTitle}</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-3">
              <h3 className="font-black text-green-800">{t.kbWhenTitle}</h3>
              <ul className="space-y-1.5">
                {t.kbWhen.map((item) => (
                  <li key={item} className="text-sm text-slate-700 flex gap-2 leading-relaxed">
                    <span className="text-green-600 shrink-0">▸</span><span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-black text-amber-800">{t.kbQualityTitle}</h3>
              <ul className="space-y-1.5">
                {t.kbQuality.map((item) => (
                  <li key={item} className="text-sm text-slate-700 leading-relaxed">{item}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-black text-red-800">{t.kbNotTitle}</h3>
              <ul className="space-y-1.5">
                {t.kbNot.map((item) => (
                  <li key={item} className="text-sm text-slate-700 flex gap-2 leading-relaxed">
                    <span className="text-red-500 shrink-0">✗</span><span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-blue-200 space-y-1">
                <h3 className="font-black text-blue-800 text-sm">{t.kbTechTitle}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{t.kbTech}</p>
              </div>
            </div>
          </div>
        </section>

        {/* T11 FAQ */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-slate-900">{t.faqTitle}</h2>
          {t.faqs.map(({ q, a }) => (
            <div key={q} className="bg-white border border-slate-200 rounded-2xl p-5">
              <p className="font-bold text-slate-800 mb-1.5">Q：{q}</p>
              <p className="text-slate-600 text-sm leading-relaxed">A：{a}</p>
            </div>
          ))}
        </section>

        {/* T12 Related Tools */}
        <section className="space-y-3">
          <h2 className="text-xl font-black text-slate-900">{t.relatedTitle}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {t.related.map(({ name, path, desc }) => (
              <a key={path} href={path}
                className="bg-white border border-slate-200 rounded-2xl p-4 hover:border-blue-300 hover:shadow-md transition block">
                <p className="font-bold text-blue-700">{name}</p>
                <p className="text-slate-500 text-sm mt-0.5">{desc}</p>
              </a>
            ))}
          </div>
        </section>

        {/* T13 AdSlot BOTTOM */}
        <AdSenseWrapper showAds={true} adSlot="pdf-to-word-bottom" adFormat="horizontal" />
        <AdSlot slot="pdf-to-word-bottom" position="inline" />

        {/* Open-source attribution */}
        <p className="text-center text-xs text-slate-400 pb-4">{t.poweredBy}</p>

      </div>
    </div>
  );
}
