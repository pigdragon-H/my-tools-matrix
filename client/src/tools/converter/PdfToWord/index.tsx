/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  Formula Universe — PdfToWord Converter (commercial)                        ║
 * ║                                                                            ║
 * ║  Two-tier flow (matches the product flowchart):                             ║
 * ║                                                                            ║
 * ║    File (PDF) → POST /api/pdf2word/analyze (detect tier, no conversion)     ║
 * ║       ├─ L1   (text / simple layout)                                        ║
 * ║       │     → POST /api/convert/pdf-to-word (free pdf2docx) → .docx         ║
 * ║       └─ L1+  (multi-column / dense tables / image-heavy / scanned)         ║
 * ║             → show first-page PHOTO-GRADE preview (hook)                    ║
 * ║             → paywall (subscription OR one-time, ECPay + Stripe)            ║
 * ║             → on paid + quota: POST /api/pdf2word/premium-convert           ║
 * ║               (server calls CloudConvert) → high-fidelity .docx             ║
 * ║                                                                            ║
 * ║  Cost guard: CloudConvert is invoked ONLY after a verified payment, so the  ║
 * ║  paid engine cost falls only on paying users. The L1+ preview is a single   ║
 * ║  cheap first-page raster — it never calls CloudConvert.                     ║
 * ║                                                                            ║
 * ║  Privacy: every uploaded file is processed in an isolated temp dir and      ║
 * ║  deleted immediately after processing. Nothing is persisted.                ║
 * ║  Bilingual (zh-Hant / en) via LanguageContext, no hardcoded UI strings.     ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { useCallback, useRef, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { useLanguage } from "@/contexts/LanguageContext";
import { PremiumWall, type PlanOption, type PremiumWallText } from "./PremiumWall";

// ─── Constants ────────────────────────────────────────────────────────────
const SITE_ORIGIN =
  import.meta.env.VITE_SITE_URL ?? "https://my-tools-matrix-production.up.railway.app";
const TOOL_PATH = "/tools/converter/pdf-to-word";
const FREE_CONVERT_ENDPOINT = "/api/convert/pdf-to-word";
const ANALYZE_ENDPOINT = "/api/pdf2word/analyze";
const FREE_MAX_MB = 25;

// ─── Types ──────────────────────────────────────────────────────────────────
type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type Tier = "L1" | "L1plus";
type Phase =
  | "idle"
  | "analyzing"
  | "free_converting"
  | "free_done"
  | "premium"
  | "error";

interface AnalyzeResult {
  tier: Tier;
  previewUrl: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────
const l = (v: LocalText, lang: Lang) => v[lang];
const mb = (bytes: number) => bytes / 1024 / 1024;
const fmtMb = (bytes: number) => mb(bytes).toFixed(2);

// ─── Bilingual copy dictionary (positive, marketing-grade) ───────────────────
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
  analyzing: string;
  analyzingHint: string;
  converting: string;
  convertingHint: string;
  freeTierBadge: string;
  freeTierTitle: string;
  freeTierDesc: string;
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
  premium: PremiumWallText;
  plans: PlanOption[];
  oneTime: PlanOption;
  whyTitle: string;
  why: { icon: string; title: string; desc: string }[];
  kbTitle: string;
  kbWhenTitle: string; kbWhen: string[];
  kbTipTitle: string; kbTips: string[];
  kbTechTitle: string; kbTech: string;
  faqTitle: string;
  faqs: { q: string; a: string }[];
  relatedTitle: string;
  related: { name: string; path: string; desc: string }[];
  poweredBy: string;
}> = {
  zh: {
    title: "PDF 轉 Word — 高保真精準轉換",
    subtitle:
      "免費將 PDF 轉換為可編輯的 Word（.docx）。簡單文件秒級免費轉檔；複雜版面、表格與圖文文件，啟用高保真引擎完整還原排版，專業文件首選。",
    badge1: "秒級轉檔", badge2: "高保真版面還原", badge3: "加密處理・即刪不留存",
    uploadLabel: "上傳 PDF 檔案",
    uploadHint: `支援 .pdf 格式。免費版單檔上限 ${FREE_MAX_MB}MB。`,
    dragHint: "將 PDF 拖曳到此處，或點擊選擇檔案",
    chooseFile: "選擇 PDF 檔案",
    replaceFile: "＋ 更換檔案",
    selectedLabel: "已選擇檔案",
    convertBtn: "開始智慧轉換",
    analyzing: "正在分析文件版面…",
    analyzingHint: "系統正在智慧偵測文件複雜度，為您選擇最佳轉換引擎。",
    converting: "高速轉換中，請稍候…",
    convertingHint: "檔案已加密傳輸至伺服器轉換，完成後立即刪除。",
    freeTierBadge: "免費・即時",
    freeTierTitle: "轉換完成，立即下載",
    freeTierDesc: "您的文件版面單純，已用免費引擎快速轉成可編輯 Word。",
    successNote: "轉換完成 · 檔案已於伺服器端處理並即時刪除",
    downloadBtn: "⬇ 下載 Word（.docx）",
    reset: "重新開始",
    errorTitle: "轉換失敗",
    errorHint: "請確認檔案為有效且未加密的 PDF，再重新嘗試。",
    limitSize: `免費版單檔上限為 ${FREE_MAX_MB}MB。`,
    notPdf: "請選擇 PDF 檔案。",
    uploadNoticeTitle: "ℹ️ 關於檔案處理方式",
    uploadNoticeDesc:
      "PDF 轉 Word 採用伺服器端文件引擎，您的檔案會以加密連線上傳轉換。轉換在隔離的暫存目錄中完成，產生結果後您的原始檔案與輸出檔案都會立即從伺服器刪除，不會被儲存或留存。",
    privacyTitle: "🔒 隱私與資料處理",
    privacyDesc:
      "檔案僅在轉換當下短暫存在於伺服器的隔離暫存區，轉換完成後立即刪除，全程不寫入資料庫、不做備份、不用於任何其他用途。",
    premium: {
      detectedTitle: "偵測到複雜版面文件",
      detectedDesc:
        "這份文件含有多欄、密集表格或圖文混排等複雜排版。啟用高保真引擎，完整重建版面、表格與樣式，產出與原檔一致且可編輯的 Word。下方為原檔第一頁實際預覽。",
      previewTitle: "原檔第一頁預覽",
      previewCaption: "此為您原始 PDF 第一頁的實際畫面，高保真轉換將完整還原整份文件。",
      previewLoading: "正在產生預覽…",
      plansTitle: "選擇方案，解鎖高保真完整轉換",
      plansSubtitle: "訂閱享每月額度，或單次購買本份文件。",
      oneTimeTitle: "單次購買",
      payEcpay: "綠界付款（含發票）",
      payStripe: "信用卡 / Stripe",
      payNote: "付款成功後立即解鎖高保真轉換並下載。綠界提供電子發票，Stripe 支援國際信用卡。",
      guarantee: ["🔒 加密處理", "🧾 開立發票", "⚡ 付款即轉檔"],
      chooseCta: "選擇此方案",
    },
    plans: [
      {
        id: "sub_monthly",
        name: "月訂閱",
        price: "NT$299",
        period: "/月",
        features: ["每月 50 次高保真轉換", "完整版面・表格還原", "大檔與優先處理"],
      },
      {
        id: "sub_yearly",
        name: "年訂閱",
        price: "NT$2,990",
        period: "/年",
        highlight: true,
        badge: "最超值・省 2 個月",
        features: ["每月 50 次高保真轉換", "完整版面・表格還原", "大檔與優先處理", "全年最低單價"],
      },
    ],
    oneTime: {
      id: "one_time",
      name: "單次購買",
      price: "NT$99",
      period: "/份",
      features: ["本份文件高保真轉換一次", "完整版面・表格還原", "無需訂閱"],
    },
    whyTitle: "為什麼選擇我們的高保真轉換",
    why: [
      { icon: "🎯", title: "高保真還原", desc: "完整重建多欄版面、表格與字體樣式，輸出與原檔一致。" },
      { icon: "⚡", title: "秒級高速", desc: "雲端引擎並行處理，大型文件也能快速完成。" },
      { icon: "✏️", title: "完全可編輯", desc: "輸出標準 .docx，文字、表格皆可直接在 Word 編輯。" },
      { icon: "🔒", title: "安全即刪", desc: "加密傳輸、隔離處理，轉檔後立即刪除不留存。" },
    ],
    kbTitle: "📚 PDF 轉 Word 知識庫",
    kbWhenTitle: "✅ 最佳使用情境",
    kbWhen: [
      "重新編輯既有 PDF 的內文、段落或數據",
      "把合約、報告或論文 PDF 轉回 Word 進行修訂",
      "擷取 PDF 中的文字與表格內容再利用",
      "將定稿 PDF 轉為可交付的 Word 版本協作",
    ],
    kbTipTitle: "💡 轉換小技巧",
    kbTips: [
      "文字型 PDF 免費引擎即可快速完成",
      "多欄、密集表格或圖文混排，建議使用高保真引擎完整還原",
      "掃描影像型 PDF 由高保真引擎處理可獲得最佳效果",
      "受密碼保護的 PDF 需先解除保護再上傳",
    ],
    kbTechTitle: "🔧 技術說明",
    kbTech:
      "本工具採用雙引擎架構：純文字與簡單版面由免費引擎即時轉換；複雜的多欄、密集表格與圖文混排版面，則由高保真雲端引擎完整重建版面、表格與樣式，輸出與原檔一致且可編輯的 Word 文件。系統會自動偵測文件複雜度，為您選擇最佳引擎。",
    faqTitle: "常見問題",
    faqs: [
      { q: "我的檔案會被儲存嗎？", a: "不會。檔案僅在轉換當下短暫存在於伺服器的隔離暫存區，轉換完成後立即刪除，不會寫入資料庫或做任何備份。" },
      { q: "免費和高保真轉換差在哪？", a: "純文字與簡單版面用免費引擎即可快速轉出可編輯 Word；多欄、密集表格或圖文混排的複雜文件，由高保真引擎完整重建版面與表格，輸出與原檔一致。系統會自動為您判斷。" },
      { q: "高保真轉換怎麼計費？", a: "可選擇月／年訂閱（每月固定額度）或單次購買單份文件。付款支援綠界（含電子發票）與 Stripe 信用卡，付款成功即可立即轉檔下載。" },
      { q: "掃描的 PDF 可以轉嗎？", a: "可以。掃描影像型 PDF 由高保真引擎處理，能獲得最佳的版面與內容還原效果。" },
      { q: "有檔案大小限制嗎？", a: `免費版單檔上限為 ${FREE_MAX_MB}MB；高保真方案支援更大的檔案。` },
    ],
    relatedTitle: "相關轉換工具",
    related: [
      { name: "Word 轉 PDF", path: "/tools/converter/word-to-pdf", desc: "將 Word 文件轉為可搜尋的向量 PDF" },
      { name: "PDF 合併", path: "/tools/converter/pdf-merge", desc: "在瀏覽器端合併多個 PDF，檔案不上傳" },
    ],
    poweredBy: "雙引擎架構：免費引擎處理簡單文件，高保真雲端引擎還原複雜版面。檔案於處理後立即刪除，不予留存。",
  },
  en: {
    title: "PDF to Word — High-Fidelity Conversion",
    subtitle:
      "Convert PDF to editable Word (.docx) for free. Simple documents convert instantly at no cost; for complex layouts, tables and image-rich files, our high-fidelity engine rebuilds the layout faithfully — the professional choice.",
    badge1: "Fast conversion", badge2: "High-fidelity layout", badge3: "Encrypted · deleted after",
    uploadLabel: "Upload PDF file",
    uploadHint: `Supports .pdf. Free tier limit: ${FREE_MAX_MB}MB per file.`,
    dragHint: "Drag a PDF here, or click to choose a file",
    chooseFile: "Choose PDF file",
    replaceFile: "＋ Replace file",
    selectedLabel: "Selected file",
    convertBtn: "Start smart conversion",
    analyzing: "Analyzing document layout…",
    analyzingHint: "Detecting document complexity to pick the best conversion engine for you.",
    converting: "Converting at high speed, please wait…",
    convertingHint: "Your file is uploaded over an encrypted connection and deleted right after.",
    freeTierBadge: "Free · Instant",
    freeTierTitle: "Done — download now",
    freeTierDesc: "Your document has a simple layout and was converted to editable Word with our free engine.",
    successNote: "Done · file processed server-side and deleted immediately",
    downloadBtn: "⬇ Download Word (.docx)",
    reset: "Start over",
    errorTitle: "Conversion failed",
    errorHint: "Please make sure the file is a valid, unencrypted PDF and try again.",
    limitSize: `Free tier limit is ${FREE_MAX_MB}MB per file.`,
    notPdf: "Please choose a PDF file.",
    uploadNoticeTitle: "ℹ️ How your file is handled",
    uploadNoticeDesc:
      "PDF to Word uses a server-side document engine, so your file is uploaded over an encrypted connection for conversion. Processing happens in an isolated temp directory; once the result is produced, both your original file and the output are deleted from the server immediately — nothing is stored.",
    privacyTitle: "🔒 Privacy & data handling",
    privacyDesc:
      "Files exist only briefly in an isolated server temp area during conversion and are deleted right after. Nothing is written to a database, backed up, or used for any other purpose.",
    premium: {
      detectedTitle: "Complex layout detected",
      detectedDesc:
        "This document has multi-column, dense tables or mixed text-and-image layout. Our high-fidelity engine rebuilds the layout, tables and styling into an editable Word that matches the original. Below is a real preview of page one.",
      previewTitle: "Original page-1 preview",
      previewCaption: "This is the actual first page of your PDF. High-fidelity conversion restores the entire document.",
      previewLoading: "Generating preview…",
      plansTitle: "Pick a plan to unlock full high-fidelity conversion",
      plansSubtitle: "Subscribe for a monthly quota, or buy this single document.",
      oneTimeTitle: "One-time purchase",
      payEcpay: "Pay via ECPay (invoice)",
      payStripe: "Card / Stripe",
      payNote: "High-fidelity conversion unlocks instantly after payment. ECPay issues e-invoices; Stripe supports international cards.",
      guarantee: ["🔒 Encrypted", "🧾 Invoice", "⚡ Instant after pay"],
      chooseCta: "Choose this plan",
    },
    plans: [
      {
        id: "sub_monthly",
        name: "Monthly",
        price: "$9.9",
        period: "/mo",
        features: ["50 high-fidelity conversions / month", "Full layout & table restore", "Large files & priority"],
      },
      {
        id: "sub_yearly",
        name: "Yearly",
        price: "$99",
        period: "/yr",
        highlight: true,
        badge: "Best value · 2 months free",
        features: ["50 high-fidelity conversions / month", "Full layout & table restore", "Large files & priority", "Lowest annual rate"],
      },
    ],
    oneTime: {
      id: "one_time",
      name: "One-time",
      price: "$2.9",
      period: "/doc",
      features: ["One high-fidelity conversion of this file", "Full layout & table restore", "No subscription"],
    },
    whyTitle: "Why our high-fidelity conversion",
    why: [
      { icon: "🎯", title: "High fidelity", desc: "Rebuilds multi-column layouts, tables and font styling to match the original." },
      { icon: "⚡", title: "Fast", desc: "Cloud engine processes in parallel — even large documents finish quickly." },
      { icon: "✏️", title: "Fully editable", desc: "Outputs standard .docx; text and tables are directly editable in Word." },
      { icon: "🔒", title: "Secure & deleted", desc: "Encrypted transfer, isolated processing, deleted right after conversion." },
    ],
    kbTitle: "📚 PDF to Word knowledge base",
    kbWhenTitle: "✅ Best use cases",
    kbWhen: [
      "Re-edit text, paragraphs or data in an existing PDF",
      "Turn contracts, reports or theses back into editable Word",
      "Extract and reuse text and tables from a PDF",
      "Hand off a finalized PDF as a collaborative Word file",
    ],
    kbTipTitle: "💡 Conversion tips",
    kbTips: [
      "Text-based PDFs convert instantly with the free engine",
      "Multi-column, dense tables or mixed layouts: use the high-fidelity engine for a faithful result",
      "Scanned/image PDFs get the best result from the high-fidelity engine",
      "Unlock password-protected PDFs before uploading",
    ],
    kbTechTitle: "🔧 How it works",
    kbTech:
      "A dual-engine architecture: plain text and simple layouts convert instantly with the free engine; complex multi-column, dense-table and image-rich layouts are rebuilt by the high-fidelity cloud engine into an editable Word that matches the original. The system auto-detects complexity and picks the best engine for you.",
    faqTitle: "FAQ",
    faqs: [
      { q: "Is my file stored?", a: "No. Files exist only briefly in an isolated server temp area during conversion and are deleted immediately after — never written to a database or backed up." },
      { q: "Free vs high-fidelity — what's the difference?", a: "Plain text and simple layouts convert instantly for free; complex documents with multi-column or dense tables are rebuilt by the high-fidelity engine to match the original. The system decides automatically." },
      { q: "How is high-fidelity billed?", a: "Choose a monthly/yearly subscription (fixed monthly quota) or a one-time purchase per document. Payment supports ECPay (with e-invoice) and Stripe cards; conversion unlocks instantly after payment." },
      { q: "Can I convert scanned PDFs?", a: "Yes. Scanned/image PDFs are processed by the high-fidelity engine for the best layout and content restoration." },
      { q: "Is there a file size limit?", a: `Free tier is ${FREE_MAX_MB}MB per file; high-fidelity plans support larger files.` },
    ],
    relatedTitle: "Related converters",
    related: [
      { name: "Word to PDF", path: "/tools/converter/word-to-pdf", desc: "Convert Word into a searchable vector PDF" },
      { name: "Merge PDF", path: "/tools/converter/pdf-merge", desc: "Merge PDFs in your browser — no upload" },
    ],
    poweredBy: "Dual-engine: a free engine for simple documents, a high-fidelity cloud engine for complex layouts. Files are deleted immediately after processing.",
  },
};

// ─── Component ──────────────────────────────────────────────────────────────
export default function PdfToWord() {
  const { lang } = useLanguage() as { lang: Lang };
  const t = ui[lang];

  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [notice, setNotice] = useState<string>("");

  // free-tier result
  const [docxUrl, setDocxUrl] = useState<string>("");
  const [docxSize, setDocxSize] = useState<number>(0);
  const [downloadName, setDownloadName] = useState<string>("converted.docx");
  const urlRef = useRef<string>("");

  // premium (L1+) preview
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);

  const acceptFile = useCallback(
    (fileList: FileList | File[] | null) => {
      if (!fileList) return;
      const incoming = Array.from(fileList);
      const picked = incoming.find(
        (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"),
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
      setPhase("idle");
    },
    [t.notPdf, t.limitSize],
  );

  const resetAll = useCallback(() => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = "";
    }
    setFile(null);
    setPhase("idle");
    setErrorMsg("");
    setNotice("");
    setDocxUrl("");
    setDocxSize(0);
    setDownloadName("converted.docx");
    setPreviewUrl("");
    setPreviewLoading(false);
  }, []);

  /** Step 1 — analyze tier (server returns L1 / L1+ and a first-page preview for L1+). */
  const analyzeTier = useCallback(async (pdf: File): Promise<AnalyzeResult> => {
    const bytes = await pdf.arrayBuffer();
    const res = await fetch(ANALYZE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "x-filename": encodeURIComponent(pdf.name),
      },
      body: bytes,
    });
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
        const d = (await res.json()) as { error?: string };
        if (d?.error) msg = d.error;
      } catch { /* keep status */ }
      throw new Error(msg);
    }
    return (await res.json()) as AnalyzeResult;
  }, []);

  /** Free-tier conversion (L1) via the existing pdf2docx endpoint. */
  const runFreeConvert = useCallback(async (pdf: File) => {
    setPhase("free_converting");
    const bytes = await pdf.arrayBuffer();
    const res = await fetch(FREE_CONVERT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "x-filename": encodeURIComponent(pdf.name),
      },
      body: bytes,
    });
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
        const d = (await res.json()) as { error?: string };
        if (d?.error) msg = d.error;
      } catch { /* keep status */ }
      throw new Error(msg);
    }
    const blob = await res.blob();
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    const url = URL.createObjectURL(blob);
    urlRef.current = url;
    setDocxUrl(url);
    setDocxSize(blob.size);
    setDownloadName(pdf.name.replace(/\.pdf$/i, "") + ".docx");
    setPhase("free_done");
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
    setErrorMsg("");
    setPhase("analyzing");
    try {
      const { tier, previewUrl: pv } = await analyzeTier(file);
      if (tier === "L1") {
        await runFreeConvert(file);
      } else {
        setPreviewUrl(pv || "");
        setPreviewLoading(!pv);
        setPhase("premium");
      }
    } catch (err) {
      setPhase("error");
      setErrorMsg(err instanceof Error ? err.message : String(err));
    }
  }, [file, t.notPdf, t.limitSize, analyzeTier, runFreeConvert]);

  /** Paywall checkout — backend wiring (ECPay / Stripe) lands in a later phase. */
  const handleCheckout = useCallback((planId: string, gateway: "ecpay" | "stripe") => {
    // Placeholder until payment gateways are wired. Surfaced honestly to the user.
    setNotice(
      lang === "zh"
        ? `付款流程即將開通（方案：${planId}／${gateway === "ecpay" ? "綠界" : "Stripe"}）。`
        : `Checkout is being enabled (plan: ${planId} / ${gateway}).`,
    );
  }, [lang]);

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

  const busy = phase === "analyzing" || phase === "free_converting";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#ede9fe,_#f8fafc_45%,_#e0f2fe)] font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-7xl px-4 py-10 space-y-7">

        {/* Hero */}
        <section className="text-center space-y-4">
          <h1 className="text-4xl font-black text-slate-900 leading-tight">{t.title}</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">{t.subtitle}</p>
          <div className="flex justify-center gap-3 flex-wrap">
            {[t.badge1, t.badge2, t.badge3].map((b) => (
              <span key={b} className="bg-violet-100 text-violet-800 text-sm font-bold px-4 py-1.5 rounded-full">{b}</span>
            ))}
          </div>
        </section>

        {/* AdSlot TOP */}
        <AdSenseWrapper showAds={true} adSlot="pdf-to-word-top" adFormat="horizontal" />
        <AdSlot slot="pdf-to-word-top" position="inline" />

        {/* Upload disclosure notice */}
        <section className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-1.5">
          <h3 className="font-black text-amber-800 text-sm">{t.uploadNoticeTitle}</h3>
          <p className="text-amber-800/90 text-sm leading-relaxed">{t.uploadNoticeDesc}</p>
        </section>

        {/* Upload Zone */}
        {phase !== "premium" && (
          <section
            className={`rounded-[2rem] border-2 border-dashed p-10 text-center space-y-4 transition-colors ${
              isDragging ? "border-violet-500 bg-violet-50" : "border-violet-300 bg-white"
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
              className="inline-block cursor-pointer bg-violet-600 hover:bg-violet-700 text-white font-black px-6 py-3 rounded-xl transition shadow"
            >
              {file ? t.replaceFile : t.chooseFile}
            </label>
            {notice && <p className="text-amber-700 font-bold text-sm">⚠️ {notice}</p>}
          </section>
        )}

        {/* Selected file */}
        {file && (phase === "idle") && (
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

        {/* Convert Button */}
        {file && phase === "idle" && (
          <div className="text-center">
            <button
              type="button"
              onClick={handleConvert}
              className="bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white font-black text-xl px-12 py-5 rounded-[2rem] transition shadow-lg active:scale-[0.97]"
              style={{ transitionTimingFunction: "cubic-bezier(0.23,1,0.32,1)", transitionDuration: "160ms" }}
            >
              {t.convertBtn}
            </button>
          </div>
        )}

        {/* Progress (analyze / free convert) */}
        {busy && (
          <section className="space-y-6">
            <div className="text-center space-y-3">
              <p className="font-black text-xl text-violet-700 animate-pulse">
                {phase === "analyzing" ? t.analyzing : t.converting}
              </p>
              <div className="w-full max-w-md mx-auto bg-violet-100 rounded-full h-3 overflow-hidden">
                <div className="bg-violet-500 h-3 rounded-full animate-pulse" style={{ width: phase === "analyzing" ? "35%" : "70%" }} />
              </div>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                {phase === "analyzing" ? t.analyzingHint : t.convertingHint}
              </p>
            </div>
            <AdSenseWrapper showAds={true} adSlot="pdf-to-word-wait" adFormat="horizontal" />
            <AdSlot slot="pdf-to-word-wait" position="inline" />
          </section>
        )}

        {/* L1+ premium wall */}
        {phase === "premium" && file && (
          <>
            <PremiumWall
              lang={lang}
              t={t.premium}
              previewUrl={previewUrl}
              previewLoading={previewLoading}
              fileName={file.name}
              plans={t.plans}
              oneTime={t.oneTime}
              onCheckout={handleCheckout}
            />
            {notice && (
              <p className="text-center text-sm font-bold text-amber-700">⚠️ {notice}</p>
            )}
            <div className="text-center">
              <button onClick={resetAll} className="text-sm text-slate-400 hover:text-slate-600 underline">
                {t.reset}
              </button>
            </div>
            <AdSenseWrapper showAds={true} adSlot="pdf-to-word-download" adFormat="horizontal" />
            <AdSlot slot="pdf-to-word-download" position="inline" />
          </>
        )}

        {/* L1 free result */}
        {phase === "free_done" && (
          <section className="space-y-5">
            <div className="overflow-hidden rounded-[2rem] border border-emerald-200 bg-white shadow-xl">
              <div className="bg-gradient-to-r from-emerald-50 via-blue-50 to-indigo-50 p-6 text-center md:p-8">
                <span className="inline-block rounded-full bg-emerald-600 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-white">
                  {t.freeTierBadge}
                </span>
                <p className="mt-3 text-emerald-700 font-black text-xl">✅ {t.freeTierTitle}</p>
                <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">{t.freeTierDesc}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {downloadName} · {(docxSize / 1024).toFixed(1)} KB
                </p>
              </div>
              <div className="p-5 md:p-6">
                <a
                  href={docxUrl}
                  download={downloadName}
                  className="mx-auto flex max-w-md items-center justify-center rounded-2xl bg-emerald-600 px-6 py-4 text-lg font-black text-white shadow-lg transition hover:bg-emerald-700 active:scale-[0.98]"
                  style={{ transitionTimingFunction: "cubic-bezier(0.23,1,0.32,1)", transitionDuration: "160ms" }}
                >
                  {t.downloadBtn}
                </a>
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

        {/* Error */}
        {phase === "error" && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-3">
            <p className="text-red-700 font-black text-lg">❌ {t.errorTitle}</p>
            <p className="text-slate-600 text-sm">{t.errorHint}</p>
            {errorMsg && <p className="font-mono text-xs text-red-400 break-all">{errorMsg}</p>}
            <button onClick={resetAll} className="text-sm text-violet-600 hover:text-violet-800 underline">
              {t.reset}
            </button>
          </div>
        )}

        {/* Why high-fidelity */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.why.map((w) => (
            <div key={w.title} className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
              <div className="text-3xl">{w.icon}</div>
              <h3 className="mt-2 font-black text-slate-900">{w.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{w.desc}</p>
            </div>
          ))}
        </section>

        {/* Privacy */}
        <section className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-2">
          <h3 className="font-black text-slate-800">{t.privacyTitle}</h3>
          <p className="text-slate-600 text-sm leading-relaxed">{t.privacyDesc}</p>
        </section>

        {/* Knowledge Base */}
        <section className="bg-violet-50 border border-violet-200 rounded-[2rem] p-8 space-y-6">
          <h2 className="text-2xl font-black text-violet-900">{t.kbTitle}</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-3">
              <h3 className="font-black text-emerald-800">{t.kbWhenTitle}</h3>
              <ul className="space-y-1.5">
                {t.kbWhen.map((item) => (
                  <li key={item} className="text-sm text-slate-700 flex gap-2 leading-relaxed">
                    <span className="text-emerald-600 shrink-0">▸</span><span>{item}</span>
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
              <h3 className="font-black text-violet-800">{t.kbTechTitle}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t.kbTech}</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-slate-900">{t.faqTitle}</h2>
          {t.faqs.map(({ q, a }) => (
            <div key={q} className="bg-white border border-slate-200 rounded-2xl p-5">
              <p className="font-bold text-slate-800 mb-1.5">Q：{q}</p>
              <p className="text-slate-600 text-sm leading-relaxed">A：{a}</p>
            </div>
          ))}
        </section>

        {/* Related Tools */}
        <section className="space-y-3">
          <h2 className="text-xl font-black text-slate-900">{t.relatedTitle}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {t.related.map(({ name, path, desc }) => (
              <a key={path} href={path}
                className="bg-white border border-slate-200 rounded-2xl p-4 hover:border-violet-300 hover:shadow-md transition block">
                <p className="font-bold text-violet-700">{name}</p>
                <p className="text-slate-500 text-sm mt-0.5">{desc}</p>
              </a>
            ))}
          </div>
        </section>

        {/* AdSlot BOTTOM */}
        <AdSenseWrapper showAds={true} adSlot="pdf-to-word-bottom" adFormat="horizontal" />
        <AdSlot slot="pdf-to-word-bottom" position="inline" />

        {/* Attribution */}
        <p className="text-center text-xs text-slate-400 pb-4">{t.poweredBy}</p>

      </div>
    </div>
  );
}
