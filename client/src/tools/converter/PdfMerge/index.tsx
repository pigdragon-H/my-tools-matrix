/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  Formula Universe — PdfMerge Converter                                     ║
 * ║  Engineering Standard: Enterprise-Grade, Privacy-First                     ║
 * ║                                                                            ║
 * ║  Architecture:                                                             ║
 * ║  File[] (drag-drop + reorder)  →  pdf-lib copyPages  →  merged Blob        ║
 * ║                                                                            ║
 * ║  Key Design Decisions:                                                     ║
 * ║  1. 100% in-browser merge (pdf-lib, MIT) — files never leave the device.   ║
 * ║  2. pdf-lib dynamically imported inside the handler to stay SSR-safe.      ║
 * ║  3. Drag-to-reorder + up/down controls so output page order is explicit.   ║
 * ║  4. Per-file page-count preflight so users see the merged size up front.   ║
 * ║  5. Bilingual (zh-Hant / en) via the shared LanguageContext, no hardcode.  ║
 * ║  6. SoftwareApplication + FAQPage JSON-LD injected for rich results / GEO. ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { useCallback, useMemo, useRef, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

// ─── Constants ────────────────────────────────────────────────────────────
const SITE_ORIGIN =
  import.meta.env.VITE_SITE_URL ?? "https://my-tools-matrix-production.up.railway.app";
const TOOL_PATH = "/tools/converter/pdf-merge";
const FREE_MAX_FILES = 20;
const FREE_MAX_TOTAL_MB = 100;

// ─── Types ──────────────────────────────────────────────────────────────────
type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type MergeStatus = "idle" | "merging" | "done" | "error";

interface PdfItem {
  /** Stable id used as React key and for drag identity. */
  uid: string;
  file: File;
  /** Detected page count, or null while loading / on parse failure. */
  pages: number | null;
  sizeBytes: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────
const l = (v: LocalText, lang: Lang) => v[lang];
const mb = (bytes: number) => bytes / 1024 / 1024;
const fmtMb = (bytes: number) => mb(bytes).toFixed(2);

function makeUid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Bilingual copy dictionary ──────────────────────────────────────────────
const ui: Record<Lang, {
  title: string;
  subtitle: string;
  badge1: string; badge2: string; badge3: string;
  uploadLabel: string;
  uploadHint: string;
  dragHint: string;
  chooseFile: string;
  addMore: string;
  emptyHint: string;
  listTitle: string;
  pagesLabel: string;
  totalLabel: string;
  moveUp: string;
  moveDown: string;
  remove: string;
  clearAll: string;
  dragReorderHint: string;
  mergeBtn: string;
  merging: string;
  successNote: string;
  downloadBtn: string;
  reset: string;
  errorTitle: string;
  errorHint: string;
  tooFewHint: string;
  limitFiles: string;
  limitSize: string;
  notPdf: string;
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
  premiumShareTitle: string;
  premiumNeedAccount: string;
  premiumBatchTitle: string;
}> = {
  zh: {
    title: "PDF 合併",
    subtitle: "免費線上合併多個 PDF 檔，全程在瀏覽器執行，可自由拖曳排序，檔案不上傳伺服器。",
    badge1: "100% 免費", badge2: "瀏覽器執行", badge3: "檔案不上傳",
    uploadLabel: "上傳 PDF 檔案（可多選）",
    uploadHint: `支援 .pdf 格式。免費版最多 ${FREE_MAX_FILES} 個檔案、總計 ${FREE_MAX_TOTAL_MB}MB。`,
    dragHint: "將多個 PDF 拖曳到此處，或點擊選擇檔案",
    chooseFile: "選擇 PDF 檔案",
    addMore: "＋ 繼續加入檔案",
    emptyHint: "尚未加入任何檔案。請先上傳至少兩個 PDF 以進行合併。",
    listTitle: "待合併清單（依此順序輸出）",
    pagesLabel: "頁",
    totalLabel: "合併後預估",
    moveUp: "上移",
    moveDown: "下移",
    remove: "移除",
    clearAll: "清空全部",
    dragReorderHint: "提示：直接拖曳項目即可調整合併順序，或使用上移／下移按鈕。",
    mergeBtn: "立即合併 PDF",
    merging: "合併中，請稍候…",
    successNote: "合併完成 · 檔案於本機產生 · 未上傳任何伺服器",
    downloadBtn: "⬇ 下載合併後的 PDF",
    reset: "重新開始",
    errorTitle: "合併失敗",
    errorHint: "請確認每個檔案皆為有效且未加密的 PDF，再重新嘗試。",
    tooFewHint: "請至少加入兩個 PDF 檔案才能合併。",
    limitFiles: `免費版一次最多合併 ${FREE_MAX_FILES} 個檔案。`,
    limitSize: `免費版檔案總大小上限為 ${FREE_MAX_TOTAL_MB}MB。`,
    notPdf: "已略過非 PDF 檔案：",
    privacyTitle: "🔒 隱私保證",
    privacyDesc:
      "本工具完全在您的瀏覽器本機端執行合併，檔案不會上傳到任何伺服器。當您關閉或重新整理頁面時，所有資料都會立即清除。",
    premiumTitle: "Premium 進階功能",
    premiumDesc: "解鎖更大檔案、批量工作流、頁面層級重組與安全分享等專業能力。",
    premiumFeatures: [
      "超大檔案與超過 20 個檔案合併",
      "頁面層級插入、刪除與重新排序",
      "合併後壓縮、加密與浮水印",
      "安全分享連結與到期日控管",
    ],
    kbTitle: "📚 PDF 合併知識庫",
    kbWhenTitle: "✅ 最佳使用情境",
    kbWhen: [
      "將多份報價單、發票或合約整併為單一文件寄送",
      "把分章節掃描的文件合併回完整檔案",
      "整理投標、申請或報銷所需的附件包",
      "將簡報、附錄與封面頁組合成一份交付檔",
    ],
    kbTipTitle: "💡 合併前的小技巧",
    kbTips: [
      "先在清單中確認順序，輸出會完全依照清單由上而下排列",
      "若某檔案需要插在中間，使用上移／下移或直接拖曳調整",
      "加密或受密碼保護的 PDF 需先解除保護才能合併",
      "掃描型 PDF 也可合併，但檔案較大時合併時間會稍長",
    ],
    kbTechTitle: "🔧 技術說明",
    kbTech:
      "本工具採用開源的 pdf-lib（MIT 授權）在瀏覽器端讀取並複製每個來源 PDF 的頁面，重新組合為單一文件。整個過程不需要伺服器，亦不依賴外部 CDN，因此在離線或內網環境同樣可用；產生的檔案保留原始向量內容，文字仍可搜尋與複製。",
    faqTitle: "常見問題",
    faqs: [
      { q: "合併會改變原本 PDF 的內容或畫質嗎？", a: "不會。本工具是逐頁複製原始 PDF 的內容並重新組合，不會重新壓縮或轉檔，文字、向量與圖片皆維持原樣。" },
      { q: "我的檔案會被上傳嗎？", a: "不會。所有合併運算都在您的瀏覽器本機完成，檔案從頭到尾都不會離開您的裝置。" },
      { q: "可以合併幾個檔案？", a: `免費版一次最多可合併 ${FREE_MAX_FILES} 個檔案、總大小 ${FREE_MAX_TOTAL_MB}MB。更大量的批次合併規劃於 Premium 提供。` },
      { q: "可以自訂合併的順序嗎？", a: "可以。上傳後您能在清單中拖曳項目，或使用上移／下移按鈕調整，輸出檔案會完全依照清單順序排列。" },
      { q: "加密的 PDF 可以合併嗎？", a: "受密碼保護的 PDF 需要先在原始程式中解除保護，再上傳合併。" },
    ],
    relatedTitle: "相關轉換工具",
    related: [
      { name: "Word 轉 PDF", path: "/tools/converter/word-to-pdf", desc: "將 Word 文件轉為可搜尋的向量 PDF" },
    ],
    poweredBy: "本工具採用開源技術：pdf-lib（MIT）。檔案於瀏覽器本機處理，不上傳伺服器。",
    premiumPlanned: "Premium 功能規劃中",
    premiumShareTitle: "安全分享",
    premiumNeedAccount: "需雲端帳戶 / 訂閱",
    premiumBatchTitle: "批量與頁面重組",
  },
  en: {
    title: "Merge PDF",
    subtitle:
      "Free online tool to combine multiple PDF files into one — runs entirely in your browser, reorder freely, and your files never leave your device.",
    badge1: "100% Free", badge2: "Browser-based", badge3: "No upload",
    uploadLabel: "Upload PDF files (multiple)",
    uploadHint: `Supports .pdf format. Free tier: up to ${FREE_MAX_FILES} files, ${FREE_MAX_TOTAL_MB}MB total.`,
    dragHint: "Drag multiple PDFs here, or click to browse",
    chooseFile: "Choose PDF files",
    addMore: "＋ Add more files",
    emptyHint: "No files yet. Add at least two PDFs to merge.",
    listTitle: "Merge queue (output follows this order)",
    pagesLabel: "pages",
    totalLabel: "Merged estimate",
    moveUp: "Move up",
    moveDown: "Move down",
    remove: "Remove",
    clearAll: "Clear all",
    dragReorderHint: "Tip: drag an item to reorder the merge sequence, or use the up / down buttons.",
    mergeBtn: "Merge PDF now",
    merging: "Merging, please wait…",
    successNote: "Merge complete · Generated locally · Never uploaded to any server",
    downloadBtn: "⬇ Download merged PDF",
    reset: "Start over",
    errorTitle: "Merge failed",
    errorHint: "Please make sure every file is a valid, unencrypted PDF and try again.",
    tooFewHint: "Please add at least two PDF files to merge.",
    limitFiles: `Free tier merges up to ${FREE_MAX_FILES} files at once.`,
    limitSize: `Free tier total size limit is ${FREE_MAX_TOTAL_MB}MB.`,
    notPdf: "Skipped non-PDF files: ",
    privacyTitle: "🔒 Privacy guarantee",
    privacyDesc:
      "This tool merges entirely in your browser. Your files are never uploaded to any server, and all data is cleared the moment you close or refresh the page.",
    premiumTitle: "Premium features",
    premiumDesc: "Unlock larger files, batch workflows, page-level reordering, and secure sharing.",
    premiumFeatures: [
      "Larger files and more than 20 files per merge",
      "Page-level insert, delete and reorder",
      "Post-merge compression, encryption and watermark",
      "Secure share links with expiry control",
    ],
    kbTitle: "📚 Merge PDF Knowledge Base",
    kbWhenTitle: "✅ Best use cases",
    kbWhen: [
      "Combine multiple quotes, invoices or contracts into one file to send",
      "Reassemble chapter-by-chapter scans back into a complete document",
      "Bundle attachments for a tender, application or expense claim",
      "Assemble slides, appendices and a cover page into one deliverable",
    ],
    kbTipTitle: "💡 Tips before merging",
    kbTips: [
      "Confirm the order in the list — output follows the list top to bottom",
      "To place a file in the middle, use up / down or drag to reorder",
      "Encrypted or password-protected PDFs must be unlocked before merging",
      "Scanned PDFs can be merged too, but large files take a little longer",
    ],
    kbTechTitle: "🔧 Technical notes",
    kbTech:
      "This tool uses the open-source pdf-lib (MIT license) to read and copy the pages of each source PDF in the browser and recombine them into a single document. The process needs no server and no external CDN, so it works offline and on intranets; the output preserves the original vector content, keeping text searchable and selectable.",
    faqTitle: "FAQ",
    faqs: [
      { q: "Does merging change the original content or quality?", a: "No. The tool copies the original pages and recombines them without re-compressing or re-encoding, so text, vectors and images stay exactly as they were." },
      { q: "Are my files uploaded?", a: "No. All merge processing happens locally in your browser; your files never leave your device at any point." },
      { q: "How many files can I merge?", a: `The free tier merges up to ${FREE_MAX_FILES} files and ${FREE_MAX_TOTAL_MB}MB at once. Larger batch merging is planned for Premium.` },
      { q: "Can I control the merge order?", a: "Yes. After uploading you can drag items in the list or use the up / down buttons; the output follows the list order exactly." },
      { q: "Can I merge encrypted PDFs?", a: "Password-protected PDFs need to be unlocked in their original application before being uploaded for merging." },
    ],
    relatedTitle: "Related converter tools",
    related: [
      { name: "Word to PDF", path: "/tools/converter/word-to-pdf", desc: "Convert Word documents into searchable vector PDFs" },
    ],
    poweredBy: "Powered by open-source pdf-lib (MIT). Files are processed locally in your browser and never uploaded.",
    premiumPlanned: "Premium feature planned",
    premiumShareTitle: "Secure share",
    premiumNeedAccount: "Cloud account / subscription required",
    premiumBatchTitle: "Batch & page reorder",
  },
};

// ─── Component ──────────────────────────────────────────────────────────────
export default function PdfMerge() {
  const { lang } = useLanguage() as { lang: Lang };
  const t = ui[lang];

  const [items, setItems] = useState<PdfItem[]>([]);
  const [status, setStatus] = useState<MergeStatus>("idle");
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [notice, setNotice] = useState<string>("");
  const [mergedUrl, setMergedUrl] = useState<string>("");
  const [mergedSize, setMergedSize] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const dragIndexRef = useRef<number | null>(null);
  const urlRef = useRef<string>("");

  const totalBytes = useMemo(
    () => items.reduce((sum, it) => sum + it.sizeBytes, 0),
    [items]
  );
  const totalPages = useMemo(
    () => items.reduce((sum, it) => sum + (it.pages ?? 0), 0),
    [items]
  );

  /** Read page count for a single PDF using a dynamically-imported pdf-lib. */
  const countPages = useCallback(async (file: File): Promise<number | null> => {
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      return doc.getPageCount();
    } catch {
      return null;
    }
  }, []);

  const addFiles = useCallback(
    async (fileList: FileList | File[] | null) => {
      if (!fileList) return;
      const incoming = Array.from(fileList);
      const pdfs = incoming.filter(
        (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
      );
      const skipped = incoming.filter((f) => !pdfs.includes(f));

      setNotice("");
      setErrorMsg("");

      setItems((prev) => {
        const combined = [...prev];
        for (const f of pdfs) {
          if (combined.length >= FREE_MAX_FILES) {
            setNotice(t.limitFiles);
            break;
          }
          combined.push({ uid: makeUid(), file: f, pages: null, sizeBytes: f.size });
        }
        const sumBytes = combined.reduce((s, it) => s + it.sizeBytes, 0);
        if (mb(sumBytes) > FREE_MAX_TOTAL_MB) {
          setNotice(t.limitSize);
        }
        return combined;
      });

      if (skipped.length > 0) {
        setNotice(`${t.notPdf}${skipped.map((f) => f.name).join(", ")}`);
      }

      // Resolve page counts asynchronously and patch them in by file identity.
      for (const f of pdfs) {
        const pages = await countPages(f);
        setItems((prev) =>
          prev.map((it) => (it.file === f && it.pages === null ? { ...it, pages } : it))
        );
      }
    },
    [countPages, t.limitFiles, t.limitSize, t.notPdf]
  );

  const moveItem = useCallback((from: number, to: number) => {
    setItems((prev) => {
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }, []);

  const removeItem = useCallback((uid: string) => {
    setItems((prev) => prev.filter((it) => it.uid !== uid));
  }, []);

  const resetAll = useCallback(() => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = "";
    }
    setItems([]);
    setStatus("idle");
    setErrorMsg("");
    setNotice("");
    setMergedUrl("");
    setMergedSize(0);
    setProgress(0);
  }, []);

  const handleMerge = useCallback(async () => {
    if (items.length < 2) {
      setNotice(t.tooFewHint);
      return;
    }
    if (mb(totalBytes) > FREE_MAX_TOTAL_MB) {
      setNotice(t.limitSize);
      return;
    }
    setStatus("merging");
    setErrorMsg("");
    setProgress(8);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const out = await PDFDocument.create();
      for (let i = 0; i < items.length; i += 1) {
        const bytes = await items[i].file.arrayBuffer();
        const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const copied = await out.copyPages(src, src.getPageIndices());
        copied.forEach((p) => out.addPage(p));
        setProgress(Math.round(8 + ((i + 1) / items.length) * 82));
      }
      const mergedBytes = await out.save();
      // Copy into a standalone ArrayBuffer so the Blob payload type is unambiguous.
      const blob = new Blob([mergedBytes.slice()], { type: "application/pdf" });
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      const url = URL.createObjectURL(blob);
      urlRef.current = url;
      setMergedUrl(url);
      setMergedSize(blob.size);
      setProgress(100);
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : String(err));
    }
  }, [items, totalBytes, t.tooFewHint, t.limitSize]);

  const hasItems = items.length > 0;
  const overSize = mb(totalBytes) > FREE_MAX_TOTAL_MB;

  // ─── JSON-LD (SoftwareApplication + FAQPage) ──────────────────────────────
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: l({ zh: "PDF 合併", en: "Merge PDF" }, lang),
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
        <AdSenseWrapper showAds={true} adSlot="pdf-merge-top" adFormat="horizontal" />
        <AdSlot slot="pdf-merge-top" position="inline" />

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
            void addFiles(e.dataTransfer.files);
          }}
        >
          <div className="text-6xl select-none">📑</div>
          <p className="font-black text-xl text-slate-800">{t.uploadLabel}</p>
          <p className="text-slate-500 text-sm">{t.uploadHint}</p>
          <p className="text-slate-400 text-sm">{t.dragHint}</p>
          <input
            type="file"
            accept="application/pdf,.pdf"
            multiple
            className="hidden"
            id="ftPdfMerge"
            onChange={(e) => { void addFiles(e.target.files); e.target.value = ""; }}
          />
          <label
            htmlFor="ftPdfMerge"
            className="inline-block cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3 rounded-xl transition shadow"
          >
            {hasItems ? t.addMore : t.chooseFile}
          </label>
          {notice && <p className="text-amber-700 font-bold text-sm">⚠️ {notice}</p>}
        </section>

        {/* T4 Merge Queue (drag-to-reorder) */}
        {hasItems ? (
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-black text-lg text-slate-800">{t.listTitle}</h3>
              <button
                type="button"
                onClick={resetAll}
                className="text-sm font-bold text-slate-500 hover:text-red-600 underline"
              >
                {t.clearAll}
              </button>
            </div>
            <p className="text-xs text-slate-400">{t.dragReorderHint}</p>
            <ul className="space-y-2">
              {items.map((it, idx) => (
                <li
                  key={it.uid}
                  draggable
                  onDragStart={() => { dragIndexRef.current = idx; }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const from = dragIndexRef.current;
                    if (from !== null && from !== idx) moveItem(from, idx);
                    dragIndexRef.current = null;
                  }}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 cursor-move"
                >
                  <span className="text-slate-400 select-none" aria-hidden>⠿</span>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-slate-800 text-sm">{it.file.name}</p>
                    <p className="text-xs text-slate-500">
                      {it.pages !== null ? `${it.pages} ${t.pagesLabel} · ` : ""}{fmtMb(it.sizeBytes)} MB
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveItem(idx, idx - 1)}
                      disabled={idx === 0}
                      aria-label={t.moveUp}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-600 disabled:opacity-30 hover:bg-slate-100"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveItem(idx, idx + 1)}
                      disabled={idx === items.length - 1}
                      aria-label={t.moveDown}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-600 disabled:opacity-30 hover:bg-slate-100"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(it.uid)}
                      aria-label={t.remove}
                      className="rounded-lg border border-red-200 bg-white px-2 py-1 text-xs font-bold text-red-500 hover:bg-red-50"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className={`flex flex-wrap items-center justify-between gap-2 rounded-2xl px-4 py-3 text-sm font-bold ${overSize ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
              <span>{t.totalLabel}：{items.length} · {totalPages} {t.pagesLabel} · {fmtMb(totalBytes)} MB</span>
            </div>
          </section>
        ) : (
          <p className="text-center text-sm text-slate-400">{t.emptyHint}</p>
        )}

        {/* T5 Merge Button */}
        {hasItems && status !== "merging" && status !== "done" && (
          <div className="text-center">
            <button
              type="button"
              onClick={handleMerge}
              disabled={items.length < 2 || overSize}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xl px-12 py-5 rounded-[2rem] transition shadow-lg"
            >
              {t.mergeBtn}
            </button>
          </div>
        )}

        {/* T6 Progress + AdSlot WAIT */}
        {status === "merging" && (
          <section className="space-y-6">
            <div className="text-center space-y-3">
              <p className="font-black text-xl text-blue-700 animate-pulse">{t.merging}</p>
              <div className="w-full max-w-md mx-auto bg-blue-100 rounded-full h-3 overflow-hidden">
                <div className="bg-blue-500 h-3 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs font-bold text-blue-700">{progress}%</p>
            </div>
            <AdSenseWrapper showAds={true} adSlot="pdf-merge-wait" adFormat="horizontal" />
            <AdSlot slot="pdf-merge-wait" position="inline" />
          </section>
        )}

        {/* T7 Result Center + AdSlot DOWNLOAD */}
        {status === "done" && (
          <section className="space-y-5">
            <div className="overflow-hidden rounded-[2rem] border border-emerald-200 bg-white shadow-xl">
              <div className="bg-gradient-to-r from-emerald-50 via-blue-50 to-indigo-50 p-6 text-center md:p-8">
                <p className="text-emerald-700 font-black text-xl">✅ {t.successNote}</p>
                <p className="mt-2 text-sm text-slate-500">
                  merged.pdf · {(mergedSize / 1024).toFixed(1)} KB · {totalPages} {t.pagesLabel}
                </p>
              </div>
              <div className="grid gap-4 p-5 md:grid-cols-3 md:p-6">
                <article className="rounded-[1.5rem] border-2 border-blue-200 bg-blue-50 p-5 text-center shadow-sm">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Free</p>
                  <h3 className="mt-2 text-xl font-black text-slate-900">{t.downloadBtn.replace("⬇ ", "")}</h3>
                  <a
                    href={mergedUrl}
                    download="merged.pdf"
                    className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-blue-600 px-6 py-4 text-lg font-black text-white shadow-lg transition hover:bg-blue-700"
                  >
                    {t.downloadBtn}
                  </a>
                </article>
                <article className="rounded-[1.5rem] border border-violet-200 bg-violet-50 p-5 text-center shadow-sm">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-600">Premium</p>
                  <h3 className="mt-2 text-xl font-black text-slate-900">{t.premiumBatchTitle}</h3>
                  <button
                    type="button"
                    disabled
                    className="mt-5 inline-flex w-full cursor-not-allowed items-center justify-center rounded-2xl border border-violet-200 bg-white px-6 py-4 text-sm font-black text-violet-700 opacity-80"
                  >
                    {t.premiumPlanned}
                  </button>
                </article>
                <article className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 text-center shadow-sm">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Premium Share</p>
                  <h3 className="mt-2 text-xl font-black text-slate-900">{t.premiumShareTitle}</h3>
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
            <AdSenseWrapper showAds={true} adSlot="pdf-merge-download" adFormat="horizontal" />
            <AdSlot slot="pdf-merge-download" position="inline" />
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
        <AdSenseWrapper showAds={true} adSlot="pdf-merge-bottom" adFormat="horizontal" />
        <AdSlot slot="pdf-merge-bottom" position="inline" />

        {/* Open-source attribution */}
        <p className="text-center text-xs text-slate-400 pb-4">{t.poweredBy}</p>

      </div>
    </div>
  );
}
