/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  Formula Universe — PdfToWord Converter                                    ║
 * ║  Engineering Standard: Enterprise-Grade, High-Fidelity                     ║
 * ║                                                                            ║
 * ║  Architecture:                                                             ║
 * ║  File (PDF)  →  POST raw bytes /api/convert/pdf-to-word                     ║
 * ║              →  LibreOffice headless (server)  →  editable .docx Blob       ║
 * ║                                                                            ║
 * ║  Key Design Decisions:                                                     ║
 * ║  1. High-fidelity conversion needs a real office engine, so this tool      ║
 * ║     uploads to the server (LibreOffice). We disclose this honestly.        ║
 * ║  2. The uploaded file is processed in an isolated temp dir and deleted      ║
 * ║     immediately after conversion — nothing is persisted server-side.       ║
 * ║  3. Single-file flow: pick / drag one PDF, convert, download .docx.        ║
 * ║  4. Bilingual (zh-Hant / en) via the shared LanguageContext, no hardcode.  ║
 * ║  5. SoftwareApplication + FAQPage JSON-LD injected for rich results / GEO. ║
 * ║  6. Honest UX: a clear "files are uploaded & deleted after processing"      ║
 * ║     notice replaces the in-browser "no upload" badge used by local tools.  ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { useCallback, useRef, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

// ─── Constants ────────────────────────────────────────────────────────────
const SITE_ORIGIN =
  import.meta.env.VITE_SITE_URL ?? "https://my-tools-matrix-production.up.railway.app";
const TOOL_PATH = "/tools/converter/pdf-to-word";
const API_ENDPOINT = "/api/convert/pdf-to-word";
const FREE_MAX_MB = 25;

// ─── Types ──────────────────────────────────────────────────────────────────
type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type ConvertStatus = "idle" | "converting" | "done" | "error";

// ─── Helpers ──────────────────────────────────────────────────────────────
const l = (v: LocalText, lang: Lang) => v[lang];
const mb = (bytes: number) => bytes / 1024 / 1024;
const fmtMb = (bytes: number) => mb(bytes).toFixed(2);

// ─── Bilingual copy dictionary ──────────────────────────────────────────────
const ui: Record<Lang, {
  title: string;
  subtitle: string;
  badge1: string; badge2: string; badge3: string;
  uploadLabel: string;
  uploadHint: string;
  dragHint: string;
  chooseFile: string;
  replaceFile: string;
  selectedLabel: string;
  convertBtn: string;
  converting: string;
  convertingHint: string;
  successNote: string;
  downloadBtn: string;
  reset: string;
  errorTitle: string;
  errorHint: string;
  limitSize: string;
  notPdf: string;
  uploadNoticeTitle: string;
  uploadNoticeDesc: string;
  privacyTitle: string;
  privacyDesc: string;
  premiumTitle: string;
  premiumDesc: string;
  premiumFeatures: string[];
  kbTitle: string;
  kbWhenTitle: string; kbWhen: string[];
  kbTipTitle: string; kbTips: string[];
  kbTechTitle: string; kbTech: string;
  faqTitle: string;
  faqs: { q: string; a: string }[];
  relatedTitle: string;
  related: { name: string; path: string; desc: string }[];
  poweredBy: string;
  premiumPlanned: string;
  premiumOcrTitle: string;
  premiumNeedAccount: string;
  premiumBatchTitle: string;
}> = {
  zh: {
    title: "PDF 轉 Word",
    subtitle:
      "免費線上將 PDF 轉換為可編輯的 Word（.docx）文件，採用伺服器端 LibreOffice 引擎進行高保真版面還原。",
    badge1: "100% 免費", badge2: "高保真還原", badge3: "處理後即刪",
    uploadLabel: "上傳 PDF 檔案",
    uploadHint: `支援 .pdf 格式。免費版單檔上限 ${FREE_MAX_MB}MB。`,
    dragHint: "將 PDF 拖曳到此處，或點擊選擇檔案",
    chooseFile: "選擇 PDF 檔案",
    replaceFile: "＋ 更換檔案",
    selectedLabel: "已選擇檔案",
    convertBtn: "立即轉換為 Word",
    converting: "轉換中，請稍候…",
    convertingHint: "檔案已加密傳輸至伺服器進行高保真轉換，完成後將立即刪除。",
    successNote: "轉換完成 · 檔案已於伺服器端處理並即時刪除",
    downloadBtn: "⬇ 下載 Word（.docx）",
    reset: "重新開始",
    errorTitle: "轉換失敗",
    errorHint: "請確認檔案為有效且未加密的 PDF，再重新嘗試。若為掃描影像型 PDF，請改用 OCR 工具。",
    limitSize: `免費版單檔上限為 ${FREE_MAX_MB}MB。`,
    notPdf: "請選擇 PDF 檔案。",
    uploadNoticeTitle: "ℹ️ 關於檔案處理方式",
    uploadNoticeDesc:
      "與本站多數純瀏覽器工具不同，高保真 PDF 轉 Word 需要伺服器端的文件引擎，因此您的檔案會以加密連線上傳至伺服器進行轉換。轉換在隔離的暫存目錄中完成，產生結果後您的原始檔案與輸出檔案都會立即從伺服器刪除，不會被儲存或留存。",
    privacyTitle: "🔒 隱私與資料處理",
    privacyDesc:
      "檔案僅在轉換當下短暫存在於伺服器的隔離暫存區，轉換完成後立即刪除，全程不寫入資料庫、不做備份、不用於任何其他用途。",
    premiumTitle: "Premium 進階功能",
    premiumDesc: "解鎖更大檔案、批次轉換、掃描件 OCR 文字辨識與雲端儲存等專業能力。",
    premiumFeatures: [
      "超大檔案與批次多檔轉換",
      "掃描影像型 PDF 的 OCR 文字辨識",
      "保留複雜表格與多欄版面的進階還原",
      "雲端儲存與安全分享連結",
    ],
    kbTitle: "📚 PDF 轉 Word 知識庫",
    kbWhenTitle: "✅ 最佳使用情境",
    kbWhen: [
      "需要重新編輯既有 PDF 的內文、段落或數據",
      "把合約、報告或論文 PDF 轉回 Word 進行修訂",
      "擷取 PDF 中的文字與表格內容再利用",
      "將定稿 PDF 轉為可交付的 Word 版本給他人協作",
    ],
    kbTipTitle: "💡 轉換前的小技巧",
    kbTips: [
      "文字型 PDF（可選取文字者）還原效果最佳",
      "掃描或拍照而成的影像型 PDF 需要 OCR 才能轉成可編輯文字",
      "複雜的多欄、表格或特殊字體版面可能需要少量手動微調",
      "受密碼保護的 PDF 需先解除保護再上傳",
    ],
    kbTechTitle: "🔧 技術說明",
    kbTech:
      "本工具在伺服器端採用開源的 LibreOffice（MPL 2.0）headless 引擎，透過其 PDF 匯入與 Word 匯出濾鏡，將 PDF 的文字、段落與版面結構重建為標準 .docx 文件。相較於純前端方案，伺服器端引擎能更完整地還原版面與可編輯文字。",
    faqTitle: "常見問題",
    faqs: [
      { q: "我的檔案會被儲存嗎？", a: "不會。檔案僅在轉換當下短暫存在於伺服器的隔離暫存區，轉換完成後立即刪除，不會寫入資料庫或做任何備份。" },
      { q: "為什麼這個工具需要上傳，其他工具卻不用？", a: "高保真的 PDF 轉 Word 需要完整的文件引擎（LibreOffice），這無法在瀏覽器內高品質完成，因此需在伺服器端處理。我們已誠實揭露此差異，並在處理後立即刪除檔案。" },
      { q: "轉換後的 Word 會和原始 PDF 完全一樣嗎？", a: "文字型 PDF 的還原通常相當接近原版；但複雜的多欄、表格或特殊字體版面可能需要少量手動微調。" },
      { q: "掃描的 PDF 可以轉嗎？", a: "純掃描影像型 PDF 內並無可選取文字，需要 OCR 文字辨識才能轉為可編輯內容，此能力規劃於 Premium 提供。" },
      { q: "有檔案大小限制嗎？", a: `免費版單檔上限為 ${FREE_MAX_MB}MB。更大的檔案與批次轉換規劃於 Premium 提供。` },
    ],
    relatedTitle: "相關轉換工具",
    related: [
      { name: "Word 轉 PDF", path: "/tools/converter/word-to-pdf", desc: "將 Word 文件轉為可搜尋的向量 PDF" },
      { name: "PDF 合併", path: "/tools/converter/pdf-merge", desc: "在瀏覽器端合併多個 PDF，檔案不上傳" },
    ],
    poweredBy: "本工具採用開源的 LibreOffice（MPL 2.0）於伺服器端轉換。檔案於處理後立即刪除，不予留存。",
    premiumPlanned: "Premium 功能規劃中",
    premiumOcrTitle: "掃描件 OCR",
    premiumNeedAccount: "需雲端帳戶 / 訂閱",
    premiumBatchTitle: "批次與大檔轉換",
  },
  en: {
    title: "PDF to Word",
    subtitle:
      "Free online tool to convert PDF into an editable Word (.docx) document, using a server-side LibreOffice engine for high-fidelity layout reconstruction.",
    badge1: "100% Free", badge2: "High fidelity", badge3: "Deleted after processing",
    uploadLabel: "Upload a PDF file",
    uploadHint: `Supports .pdf format. Free tier: up to ${FREE_MAX_MB}MB per file.`,
    dragHint: "Drag a PDF here, or click to browse",
    chooseFile: "Choose PDF file",
    replaceFile: "＋ Replace file",
    selectedLabel: "Selected file",
    convertBtn: "Convert to Word now",
    converting: "Converting, please wait…",
    convertingHint: "Your file is uploaded over an encrypted connection for high-fidelity conversion, then deleted immediately.",
    successNote: "Conversion complete · Processed server-side and deleted immediately",
    downloadBtn: "⬇ Download Word (.docx)",
    reset: "Start over",
    errorTitle: "Conversion failed",
    errorHint: "Please make sure the file is a valid, unencrypted PDF and try again. For scanned image PDFs, use an OCR tool instead.",
    limitSize: `Free tier limit is ${FREE_MAX_MB}MB per file.`,
    notPdf: "Please choose a PDF file.",
    uploadNoticeTitle: "ℹ️ How your file is handled",
    uploadNoticeDesc:
      "Unlike most in-browser tools on this site, high-fidelity PDF-to-Word needs a server-side office engine, so your file is uploaded over an encrypted connection for conversion. It is processed in an isolated temporary directory, and both your original file and the output are deleted from the server immediately after conversion — nothing is stored or retained.",
    privacyTitle: "🔒 Privacy & data handling",
    privacyDesc:
      "Files exist only briefly in an isolated server temp area during conversion and are deleted immediately afterward. Nothing is written to a database, backed up, or used for any other purpose.",
    premiumTitle: "Premium features",
    premiumDesc: "Unlock larger files, batch conversion, OCR for scanned documents, and cloud storage.",
    premiumFeatures: [
      "Larger files and batch multi-file conversion",
      "OCR text recognition for scanned image PDFs",
      "Advanced reconstruction of complex tables and multi-column layouts",
      "Cloud storage and secure share links",
    ],
    kbTitle: "📚 PDF to Word Knowledge Base",
    kbWhenTitle: "✅ Best use cases",
    kbWhen: [
      "Re-edit the body text, paragraphs or data of an existing PDF",
      "Turn a contract, report or paper PDF back into Word for revision",
      "Extract and reuse text and table content from a PDF",
      "Convert a finalized PDF into a Word version for others to collaborate on",
    ],
    kbTipTitle: "💡 Tips before converting",
    kbTips: [
      "Text-based PDFs (where text is selectable) reconstruct best",
      "Scanned or photographed image PDFs need OCR to become editable text",
      "Complex multi-column, table or special-font layouts may need minor manual tweaks",
      "Password-protected PDFs must be unlocked before uploading",
    ],
    kbTechTitle: "🔧 Technical notes",
    kbTech:
      "This tool uses the open-source LibreOffice (MPL 2.0) headless engine on the server, applying its PDF import and Word export filters to rebuild the PDF's text, paragraphs and layout structure into a standard .docx file. Compared with a browser-only approach, a server-side engine reconstructs layout and editable text more completely.",
    faqTitle: "FAQ",
    faqs: [
      { q: "Are my files stored?", a: "No. Files exist only briefly in an isolated server temp area during conversion and are deleted immediately afterward — never written to a database or backed up." },
      { q: "Why does this tool upload, when other tools don't?", a: "High-fidelity PDF-to-Word needs a full office engine (LibreOffice), which cannot be done at high quality inside a browser, so it runs server-side. We disclose this honestly and delete files right after processing." },
      { q: "Will the Word output be identical to the original PDF?", a: "Text-based PDFs usually reconstruct very close to the original; complex multi-column, table or special-font layouts may need minor manual tweaks." },
      { q: "Can I convert scanned PDFs?", a: "Pure scanned image PDFs contain no selectable text and need OCR to become editable — that capability is planned for Premium." },
      { q: "Is there a file size limit?", a: `The free tier allows up to ${FREE_MAX_MB}MB per file. Larger files and batch conversion are planned for Premium.` },
    ],
    relatedTitle: "Related converter tools",
    related: [
      { name: "Word to PDF", path: "/tools/converter/word-to-pdf", desc: "Convert Word documents into searchable vector PDFs" },
      { name: "Merge PDF", path: "/tools/converter/pdf-merge", desc: "Combine multiple PDFs in the browser, no upload" },
    ],
    poweredBy: "Powered by open-source LibreOffice (MPL 2.0) on the server. Files are deleted immediately after processing and never retained.",
    premiumPlanned: "Premium feature planned",
    premiumOcrTitle: "Scanned OCR",
    premiumNeedAccount: "Cloud account / subscription required",
    premiumBatchTitle: "Batch & large files",
  },
};

// ─── Component ──────────────────────────────────────────────────────────────
export default function PdfToWord() {
  const { lang } = useLanguage() as { lang: Lang };
  const t = ui[lang];

  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ConvertStatus>("idle");
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [notice, setNotice] = useState<string>("");
  const [docxUrl, setDocxUrl] = useState<string>("");
  const [docxSize, setDocxSize] = useState<number>(0);
  const [downloadName, setDownloadName] = useState<string>("converted.docx");
  const urlRef = useRef<string>("");

  const acceptFile = useCallback(
    (fileList: FileList | File[] | null) => {
      if (!fileList) return;
      const incoming = Array.from(fileList);
      const picked = incoming.find(
        (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
      );
      setNotice("");
      setErrorMsg("");
      if (!picked) {
        setNotice(t.notPdf);
        return;
      }
      if (mb(picked.size) > FREE_MAX_MB) {
        setNotice(t.limitSize);
        return;
      }
      setFile(picked);
      setStatus("idle");
    },
    [t.notPdf, t.limitSize]
  );

  const resetAll = useCallback(() => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = "";
    }
    setFile(null);
    setStatus("idle");
    setErrorMsg("");
    setNotice("");
    setDocxUrl("");
    setDocxSize(0);
    setDownloadName("converted.docx");
  }, []);

  const handleConvert = useCallback(async () => {
    if (!file) {
      setNotice(t.notPdf);
      return;
    }
    if (mb(file.size) > FREE_MAX_MB) {
      setNotice(t.limitSize);
      return;
    }
    setStatus("converting");
    setErrorMsg("");
    try {
      const bytes = await file.arrayBuffer();
      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
          "x-filename": encodeURIComponent(file.name),
        },
        body: bytes,
      });
      if (!res.ok) {
        let serverMsg = `HTTP ${res.status}`;
        try {
          const data = (await res.json()) as { error?: string };
          if (data?.error) serverMsg = data.error;
        } catch {
          /* response was not JSON; keep the status message */
        }
        throw new Error(serverMsg);
      }
      const blob = await res.blob();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      const url = URL.createObjectURL(blob);
      urlRef.current = url;
      setDocxUrl(url);
      setDocxSize(blob.size);
      setDownloadName(file.name.replace(/\.pdf$/i, "") + ".docx");
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : String(err));
    }
  }, [file, t.notPdf, t.limitSize]);

  // ─── JSON-LD (SoftwareApplication + FAQPage) ──────────────────────────────
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: l({ zh: "PDF 轉 Word", en: "PDF to Word" }, lang),
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web",
        url: `${SITE_ORIGIN}${TOOL_PATH}`,
        description: t.subtitle,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "FAQPage",
        mainEntity: t.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#fef3c7,_#f8fafc_45%,_#e0f2fe)] font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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

        {/* Upload disclosure notice (honest server-side handling) */}
        <section className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-1.5">
          <h3 className="font-black text-amber-800 text-sm">{t.uploadNoticeTitle}</h3>
          <p className="text-amber-800/90 text-sm leading-relaxed">{t.uploadNoticeDesc}</p>
        </section>

        {/* T3 Upload Zone */}
        <section
          className={`rounded-[2rem] border-2 border-dashed p-10 text-center space-y-4 transition-colors ${
            isDragging ? "border-blue-500 bg-blue-50" : "border-blue-300 bg-white"
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            acceptFile(e.dataTransfer.files);
          }}
        >
          <div className="text-6xl select-none">📄</div>
          <p className="font-black text-xl text-slate-800">{t.uploadLabel}</p>
          <p className="text-slate-500 text-sm">{t.uploadHint}</p>
          <p className="text-slate-400 text-sm">{t.dragHint}</p>
          <input
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            id="ftPdfToWord"
            onChange={(e) => { acceptFile(e.target.files); e.target.value = ""; }}
          />
          <label
            htmlFor="ftPdfToWord"
            className="inline-block cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3 rounded-xl transition shadow"
          >
            {file ? t.replaceFile : t.chooseFile}
          </label>
          {notice && <p className="text-amber-700 font-bold text-sm">⚠️ {notice}</p>}
        </section>

        {/* T4 Selected file */}
        {file && status !== "done" && (
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="text-2xl select-none" aria-hidden>📄</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-400">{t.selectedLabel}</p>
                <p className="truncate font-bold text-slate-800 text-sm">{file.name}</p>
                <p className="text-xs text-slate-500">{fmtMb(file.size)} MB</p>
              </div>
              <button
                type="button"
                onClick={resetAll}
                aria-label={t.reset}
                className="rounded-lg border border-red-200 bg-white px-2 py-1 text-xs font-bold text-red-500 hover:bg-red-50"
              >
                ✕
              </button>
            </div>
          </section>
        )}

        {/* T5 Convert Button */}
        {file && status !== "converting" && status !== "done" && (
          <div className="text-center">
            <button
              type="button"
              onClick={handleConvert}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xl px-12 py-5 rounded-[2rem] transition shadow-lg"
            >
              {t.convertBtn}
            </button>
          </div>
        )}

        {/* T6 Progress + AdSlot WAIT */}
        {status === "converting" && (
          <section className="space-y-6">
            <div className="text-center space-y-3">
              <p className="font-black text-xl text-blue-700 animate-pulse">{t.converting}</p>
              <div className="w-full max-w-md mx-auto bg-blue-100 rounded-full h-3 overflow-hidden">
                <div className="bg-blue-500 h-3 rounded-full animate-pulse" style={{ width: "60%" }} />
              </div>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">{t.convertingHint}</p>
            </div>
            <AdSenseWrapper showAds={true} adSlot="pdf-to-word-wait" adFormat="horizontal" />
            <AdSlot slot="pdf-to-word-wait" position="inline" />
          </section>
        )}

        {/* T7 Result Center + AdSlot DOWNLOAD */}
        {status === "done" && (
          <section className="space-y-5">
            <div className="overflow-hidden rounded-[2rem] border border-emerald-200 bg-white shadow-xl">
              <div className="bg-gradient-to-r from-emerald-50 via-blue-50 to-indigo-50 p-6 text-center md:p-8">
                <p className="text-emerald-700 font-black text-xl">✅ {t.successNote}</p>
                <p className="mt-2 text-sm text-slate-500">
                  {downloadName} · {(docxSize / 1024).toFixed(1)} KB
                </p>
              </div>
              <div className="grid gap-4 p-5 md:grid-cols-3 md:p-6">
                <article className="rounded-[1.5rem] border-2 border-blue-200 bg-blue-50 p-5 text-center shadow-sm">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Free</p>
                  <h3 className="mt-2 text-xl font-black text-slate-900">{t.downloadBtn.replace("⬇ ", "")}</h3>
                  <a
                    href={docxUrl}
                    download={downloadName}
                    className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-blue-600 px-6 py-4 text-lg font-black text-white shadow-lg transition hover:bg-blue-700"
                  >
                    {t.downloadBtn}
                  </a>
                </article>
                <article className="rounded-[1.5rem] border border-violet-200 bg-violet-50 p-5 text-center shadow-sm">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-600">Premium</p>
                  <h3 className="mt-2 text-xl font-black text-slate-900">{t.premiumOcrTitle}</h3>
                  <button
                    type="button"
                    disabled
                    className="mt-5 inline-flex w-full cursor-not-allowed items-center justify-center rounded-2xl border border-violet-200 bg-white px-6 py-4 text-sm font-black text-violet-700 opacity-80"
                  >
                    {t.premiumPlanned}
                  </button>
                </article>
                <article className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 text-center shadow-sm">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Premium</p>
                  <h3 className="mt-2 text-xl font-black text-slate-900">{t.premiumBatchTitle}</h3>
                  <button
                    type="button"
                    disabled
                    className="mt-5 inline-flex w-full cursor-not-allowed items-center justify-center rounded-2xl border border-amber-200 bg-white px-6 py-4 text-sm font-black text-amber-700 opacity-80"
                  >
                    {t.premiumNeedAccount}
                  </button>
                </article>
              </div>
            </div>
            <AdSenseWrapper showAds={true} adSlot="pdf-to-word-download" adFormat="horizontal" />
            <AdSlot slot="pdf-to-word-download" position="inline" />
            <div className="text-center">
              <button onClick={resetAll} className="text-sm text-slate-400 hover:text-slate-600 underline mt-2">
                {t.reset}
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
            <button onClick={() => setStatus("idle")} className="text-sm text-blue-600 hover:text-blue-800 underline">
              {t.reset}
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
          <div className="space-y-3">
            <h3 className="font-black text-lg text-slate-800">{t.premiumTitle}</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{t.premiumDesc}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {t.premiumFeatures.map((item) => (
                <span key={item} className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-indigo-900 shadow-sm">{item}</span>
              ))}
            </div>
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
              <h3 className="font-black text-amber-800">{t.kbTipTitle}</h3>
              <ul className="space-y-1.5">
                {t.kbTips.map((item) => (
                  <li key={item} className="text-sm text-slate-700 flex gap-2 leading-relaxed">
                    <span className="text-amber-600 shrink-0">•</span><span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-black text-blue-800">{t.kbTechTitle}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t.kbTech}</p>
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
