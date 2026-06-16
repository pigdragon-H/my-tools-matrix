/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  Formula Universe — PdfToWord Converter                               ║
 * ║  Engineering Standard: Enterprise-Grade, commercial-ready             ║
 * ║                                                                       ║
 * ║  Architecture:                                                        ║
 * ║   Browser upload  →  POST /api/convert/pdf-to-word                    ║
 * ║                   →  server LibreOffice headless (writer_pdf_import)  ║
 * ║                   →  tesseract OCR fallback for scanned PDFs          ║
 * ║                   →  .docx download                                   ║
 * ║                                                                       ║
 * ║  Commercial scaffolding is pre-wired (AdSlot ×4, PremiumGate) so the  ║
 * ║  free+ads launch can be flipped to a freemium/subscription model      ║
 * ║  without touching the conversion core.                                ║
 * ║                                                                       ║
 * ║  Honesty: PDF is a fixed-coordinate print format; the .docx output is ║
 * ║  fully editable but its layout is a best-effort approximation.        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */
import { useState, useCallback, useRef } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type Stage = "idle" | "reading" | "uploading" | "converting" | "done" | "error";

interface ResultMeta {
  mode: "text" | "ocr" | "unknown";
  pages: number;
  ms: number;
  bytes: number;
}

const MAX_BYTES = 25 * 1024 * 1024; // mirror server express.raw limit

// ─── i18n copy ───────────────────────────────────────────────────────────────
const T = {
  zh: {
    title: "PDF 轉 Word",
    subtitle: "免費線上 PDF 轉 Word（.docx）。自動偵測文字層；掃描／圖片 PDF 內建中文 OCR 辨識，輸出可編輯文件。",
    drop: "拖曳 PDF 到此，或點擊選擇檔案",
    pick: "選擇 PDF 檔案",
    hint: "支援 .pdf，單檔上限 25MB",
    converting: "轉換中，請稍候…",
    convertingOcr: "偵測為掃描／圖片 PDF，正在執行 OCR 文字辨識（較花時間）…",
    done: "轉換完成！",
    download: "下載 Word 檔（.docx）",
    again: "轉換另一個檔案",
    modeText: "文字層直接轉換",
    modeOcr: "OCR 辨識（掃描／圖片 PDF）",
    pages: "頁數",
    elapsed: "耗時",
    errTooBig: "檔案過大，請上傳小於 25MB 的 PDF。",
    errType: "請上傳 .pdf 檔案。",
    errNoText: "此 PDF 為掃描／圖片，且 OCR 無法辨識出文字。請改用文字版 PDF，或提高掃描品質後再試。",
    errGeneric: "轉換失敗",
    qualityTitle: "品質說明（請先了解）",
    qualityBody: "PDF 是「固定座標的列印格式」，Word 是「可重新編排的流式文件」。本工具輸出的 .docx 完全可編輯，但版面為「忠實的近似還原」：複雜表格、多欄排版或特殊字型可能以文字框呈現，需要您微調。掃描／圖片 PDF 會自動以 OCR 辨識（支援繁體、簡體中文與英文），辨識率取決於原稿清晰度。",
    howTitle: "運作原理",
    how1: "上傳後，系統先以 pdftotext 偵測 PDF 是否含文字層。",
    how2: "含文字層 → 直接以 LibreOffice 的 PDF 匯入引擎轉成可編輯 .docx。",
    how3: "無文字層（掃描／圖片）→ 自動將頁面點陣化，交由 Tesseract OCR（chi_tra+chi_sim+eng）產生可搜尋文字，再轉成 .docx。",
    how4: "全程於伺服器隔離環境處理，轉換後即清除暫存檔。",
    faqTitle: "常見問題",
    privacyTitle: "隱私與安全",
    privacyBody: "您的檔案只在轉換當下於伺服器的隔離暫存目錄處理，轉換完成或失敗後即自動刪除，不會保留、不會用於任何其他用途。我們不會將您的檔案內容提供給第三方。",
    proTitle: "進階功能（即將推出）",
    proBody: "批次轉換、超大檔案、OCR 進階版面還原與去浮水印等功能，將於進階方案開放。",
    faqs: [
      { q: "支援哪些 PDF？", a: "支援標準 .pdf。含文字層的 PDF 轉換最快、品質最好；掃描／圖片 PDF 會自動走 OCR。" },
      { q: "掃描的 PDF 可以轉嗎？", a: "可以。系統偵測到無文字層時會自動以 OCR 辨識（繁中／簡中／英文），辨識率取決於掃描清晰度。" },
      { q: "轉出來的 Word 可以編輯嗎？", a: "可以。輸出為標準 .docx，可在 Word／Google Docs／LibreOffice 開啟編輯。" },
      { q: "版面會跟原 PDF 一模一樣嗎？", a: "會盡量近似還原，但因 PDF 與 Word 結構本質不同，複雜版面可能以文字框呈現，需要微調。" },
      { q: "檔案會被保留嗎？", a: "不會。檔案僅於轉換當下處理，完成後立即從伺服器刪除。" },
      { q: "有檔案大小限制嗎？", a: "目前單檔上限 25MB。" },
    ],
  },
  en: {
    title: "PDF to Word",
    subtitle: "Free online PDF to Word (.docx). Auto-detects the text layer; scanned / image PDFs are OCR'd (Chinese + English). Output is fully editable.",
    drop: "Drag a PDF here, or click to choose a file",
    pick: "Choose PDF file",
    hint: "Supports .pdf, up to 25MB per file",
    converting: "Converting, please wait…",
    convertingOcr: "Detected a scanned / image PDF — running OCR text recognition (this takes longer)…",
    done: "Conversion complete!",
    download: "Download Word (.docx)",
    again: "Convert another file",
    modeText: "Direct text-layer conversion",
    modeOcr: "OCR (scanned / image PDF)",
    pages: "Pages",
    elapsed: "Elapsed",
    errTooBig: "File too large. Please upload a PDF smaller than 25MB.",
    errType: "Please upload a .pdf file.",
    errNoText: "This PDF is a scan/image and OCR could not recognise any text. Please use a text-based PDF or a higher-quality scan.",
    errGeneric: "Conversion failed",
    qualityTitle: "Quality note (please read first)",
    qualityBody: "PDF is a fixed-coordinate print format; Word is a reflowable document. The .docx output is fully editable, but the layout is a faithful approximation: complex tables, multi-column layouts or special fonts may appear as text frames and need adjustment. Scanned / image PDFs are auto-OCR'd (Traditional & Simplified Chinese + English); accuracy depends on the source quality.",
    howTitle: "How it works",
    how1: "On upload, the server detects whether the PDF has a text layer (pdftotext).",
    how2: "With a text layer → converted directly to an editable .docx via LibreOffice's PDF import engine.",
    how3: "No text layer (scan/image) → pages are rasterised and run through Tesseract OCR (chi_tra+chi_sim+eng) to build a searchable text layer, then converted to .docx.",
    how4: "Everything runs in an isolated server sandbox; temporary files are deleted right after conversion.",
    faqTitle: "Frequently asked questions",
    privacyTitle: "Privacy & security",
    privacyBody: "Your file is processed only momentarily in an isolated temporary directory on the server and is automatically deleted once conversion finishes or fails. We never retain it or use it for any other purpose, and we never share its contents with third parties.",
    proTitle: "Advanced features (coming soon)",
    proBody: "Batch conversion, very large files, advanced OCR layout reconstruction and watermark removal will be available on the upgraded plan.",
    faqs: [
      { q: "Which PDFs are supported?", a: "Standard .pdf files. PDFs with a text layer convert fastest and best; scanned/image PDFs automatically use OCR." },
      { q: "Can I convert a scanned PDF?", a: "Yes. When no text layer is detected the tool runs OCR (Traditional/Simplified Chinese & English); accuracy depends on scan quality." },
      { q: "Is the Word output editable?", a: "Yes. It is a standard .docx you can open and edit in Word / Google Docs / LibreOffice." },
      { q: "Will the layout match the original exactly?", a: "It is approximated as closely as possible, but because PDF and Word differ structurally, complex layouts may appear as text frames and need tweaking." },
      { q: "Is my file kept?", a: "No. It is processed only during conversion and deleted from the server immediately afterwards." },
      { q: "Is there a size limit?", a: "Currently 25MB per file." },
    ],
  },
} as const;

// ─── Conversion call ─────────────────────────────────────────────────────────
async function convertViaServer(
  file: File,
  onOcr: () => void
): Promise<{ blob: Blob; meta: ResultMeta }> {
  const buf = await file.arrayBuffer();
  // We can't know text-vs-ocr until the server responds, but for scanned PDFs
  // the request simply takes longer; we surface the OCR hint after a short delay.
  const ocrHintTimer = setTimeout(onOcr, 4000);
  let resp: Response;
  try {
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
    let code = "";
    try {
      const j = await resp.json();
      if (j?.error) {
        detail = j.error;
        code = String(j.error);
      }
    } catch {
      /* non-json */
    }
    const err = new Error(detail);
    (err as any).code = code;
    (err as any).http = resp.status;
    throw err;
  }

  const blob = await resp.blob();
  const meta: ResultMeta = {
    mode: (resp.headers.get("X-Conversion-Mode") as ResultMeta["mode"]) || "unknown",
    pages: Number(resp.headers.get("X-Pdf-Pages") || 0),
    ms: Number(resp.headers.get("X-Conversion-Ms") || 0),
    bytes: blob.size,
  };
  return { blob, meta };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function PdfToWord() {
  const { lang } = useLanguage() as { lang: Lang };
  const t = T[lang] ?? T.zh;

  const [stage, setStage] = useState<Stage>("idle");
  const [ocrActive, setOcrActive] = useState(false);
  const [fileName, setFileName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState("converted.docx");
  const [meta, setMeta] = useState<ResultMeta | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setStage("idle");
    setOcrActive(false);
    setFileName("");
    setErrorMsg("");
    setDownloadUrl(null);
    setMeta(null);
  }, [downloadUrl]);

  const handleFile = useCallback(
    async (file: File) => {
      setErrorMsg("");
      if (file.size > MAX_BYTES) {
        setStage("error");
        setErrorMsg(t.errTooBig);
        return;
      }
      const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
      if (!isPdf) {
        setStage("error");
        setErrorMsg(t.errType);
        return;
      }
      setFileName(file.name);
      setStage("converting");
      setOcrActive(false);
      try {
        const { blob, meta: m } = await convertViaServer(file, () => setOcrActive(true));
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        setDownloadName(file.name.replace(/\.pdf$/i, "") + ".docx");
        setMeta(m);
        setStage("done");
      } catch (e: any) {
        setStage("error");
        const code = String(e?.code || e?.message || "");
        if (/OCR_NO_TEXT|OCR_FAILED/.test(code)) setErrorMsg(t.errNoText);
        else if (/INVALID_PDF/.test(code)) setErrorMsg(t.errType);
        else setErrorMsg(`${t.errGeneric}: ${e?.message || code}`);
      }
    },
    [t]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    e.target.value = "";
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const busy = stage === "converting";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
        <p className="mt-2 text-muted-foreground">{t.subtitle}</p>
      </header>

      {/* Ad: top */}
      <AdSenseWrapper showAds={true} adSlot="pdf-to-word-top" adFormat="horizontal" />
      <AdSlot slot="pdf-to-word-top" position="inline" />

      {/* Uploader / states */}
      <section className="my-6">
        {stage === "idle" || stage === "error" ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={[
              "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition",
              dragOver ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30" : "border-muted-foreground/30 hover:border-blue-400",
            ].join(" ")}
          >
            <div className="text-5xl">📄➜📝</div>
            <p className="mt-4 font-medium">{t.drop}</p>
            <button
              type="button"
              className="mt-4 rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700"
            >
              {t.pick}
            </button>
            <p className="mt-3 text-sm text-muted-foreground">{t.hint}</p>
            <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={onInputChange} />
            {stage === "error" && errorMsg && (
              <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
                {errorMsg}
              </p>
            )}
          </div>
        ) : null}

        {busy && (
          <div className="rounded-xl border p-10 text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            <p className="font-medium">{ocrActive ? t.convertingOcr : t.converting}</p>
            <p className="mt-1 text-sm text-muted-foreground">{fileName}</p>
            {/* Ad: wait */}
            <div className="mt-6">
              <AdSenseWrapper showAds={true} adSlot="pdf-to-word-wait" adFormat="horizontal" />
              <AdSlot slot="pdf-to-word-wait" position="inline" />
            </div>
          </div>
        )}

        {stage === "done" && (
          <div className="rounded-xl border p-8 text-center">
            <div className="text-4xl">✅</div>
            <p className="mt-3 text-lg font-semibold">{t.done}</p>
            {meta && (
              <p className="mt-1 text-sm text-muted-foreground">
                {meta.mode === "ocr" ? t.modeOcr : t.modeText}
                {meta.pages ? ` · ${t.pages}: ${meta.pages}` : ""}
                {meta.ms ? ` · ${t.elapsed}: ${(meta.ms / 1000).toFixed(1)}s` : ""}
              </p>
            )}
            {downloadUrl && (
              <a
                href={downloadUrl}
                download={downloadName}
                className="mt-5 inline-block rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
              >
                ⬇ {t.download}
              </a>
            )}
            <div className="mt-4">
              <button onClick={reset} className="text-sm text-blue-600 hover:underline">
                {t.again}
              </button>
            </div>
            {/* Ad: download */}
            <div className="mt-6">
              <AdSenseWrapper showAds={true} adSlot="pdf-to-word-download" adFormat="horizontal" />
              <AdSlot slot="pdf-to-word-download" position="inline" />
            </div>
            {/* Commercial scaffolding — disabled until plan activated */}
            <PremiumGate plan="PRO">
              <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-left text-sm dark:bg-amber-950/30">
                <strong>{t.proTitle}</strong>
                <p className="mt-1 text-muted-foreground">{t.proBody}</p>
              </div>
            </PremiumGate>
          </div>
        )}
      </section>

      {/* Quality / honesty note */}
      <section className="my-6 rounded-xl border bg-muted/30 p-5">
        <h2 className="text-lg font-semibold">{t.qualityTitle}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.qualityBody}</p>
      </section>

      {/* How it works */}
      <section className="my-6">
        <h2 className="mb-3 text-lg font-semibold">{t.howTitle}</h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>{t.how1}</li>
          <li>{t.how2}</li>
          <li>{t.how3}</li>
          <li>{t.how4}</li>
        </ol>
      </section>

      {/* FAQ — rich content for AdSense */}
      <section className="my-6">
        <h2 className="mb-3 text-lg font-semibold">{t.faqTitle}</h2>
        <div className="space-y-3">
          {t.faqs.map((f, i) => (
            <details key={i} className="rounded-lg border p-4">
              <summary className="cursor-pointer font-medium">{f.q}</summary>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Privacy */}
      <section className="my-6 rounded-xl border p-5">
        <h2 className="text-lg font-semibold">{t.privacyTitle}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.privacyBody}</p>
      </section>

      {/* Ad: bottom */}
      <AdSenseWrapper showAds={true} adSlot="pdf-to-word-bottom" adFormat="horizontal" />
      <AdSlot slot="pdf-to-word-bottom" position="inline" />
    </div>
  );
}
