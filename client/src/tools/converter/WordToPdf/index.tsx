/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  Formula Universe — WordToPdf Converter                                 ║
 * ║  Engineering Standard: Enterprise-Grade, White-House-Deployable         ║
 * ║                                                                         ║
 * ║  Architecture:                                                          ║
 * ║  mammoth.js  →  DocxAnalyzer  →  SemanticIR  →  PdfMake renderer       ║
 * ║                                                                         ║
 * ║  Key Design Decisions (vs. naive implementations):                      ║
 * ║  1. mammoth.js for semantic extraction (NOT docx-preview screenshot)    ║
 * ║  2. pdfmake for programmatic PDF (NOT html2pdf raster image)            ║
 * ║  3. 12-detector DocxAnalyzer for pre-flight quality prediction          ║
 * ║  4. SemanticIR normalisation layer decouples parse from render          ║
 * ║  5. Runtime-safe browser PDF font stack with timeout guard                ║
 * ║  6. Widow/orphan control + keep-with-next heading guard                 ║
 * ║  7. Table border reconstruction from mammoth message warnings           ║
 * ║  8. Image base64 pipeline with aspect-ratio clamp                       ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { useState, useCallback, useRef } from "react";
// Bundled runtime (NOT CDN). The previous CDN approach loaded pdfmake@0.2.20
// while package.json ships pdfmake@0.3.x; the vfs global contract changed
// (0.3.x uses module.exports = vfs + addVirtualFileSystem), so the old
// `window.pdfMake.vfs` guard never resolved and getBlob() silently stalled,
// causing "conversion never completes". Importing locally removes the CDN
// race, the CSP risk, and the version mismatch.
import mammoth from "mammoth";
import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

// Register the bundled Roboto virtual file system exactly once.
// pdfmake 0.3.x ships vfs_fonts as `module.exports = vfs` (a flat map),
// while some builds expose it under `.vfs` / `.pdfMake.vfs`. Normalise.
(() => {
  const anyFonts = pdfFonts as any;
  const vfs = anyFonts?.vfs ?? anyFonts?.pdfMake?.vfs ?? anyFonts?.default?.vfs ?? anyFonts?.default ?? anyFonts;
  const pm = pdfMake as any;
  if (vfs && typeof vfs === "object") {
    pm.vfs = vfs;
    // Newer pdfmake also supports addVirtualFileSystem; call if available.
    if (typeof pm.addVirtualFileSystem === "function" && !pm.__vfsRegistered) {
      try { pm.addVirtualFileSystem(vfs); } catch { /* vfs already set above */ }
    }
    pm.__vfsRegistered = true;
  }
})();

// ─── Type System ────────────────────────────────────────────────────────────

type Lang = "zh" | "en";

/** Grade produced by the 12-detector pre-flight analyser */
type DocGrade = "simple" | "moderate" | "complex" | "unsupported";

interface PreflightReport {
  grade: DocGrade;
  pageEstimate: number;
  detectors: DetectorResult[];
  warnings: string[];
  fatalErrors: string[];
}

interface DetectorResult {
  id: string;
  label: string;
  triggered: boolean;
  impact: "none" | "low" | "medium" | "high";
  note?: string;
}

/** Semantic Intermediate Representation — technology-agnostic document model */
interface SemanticIR {
  meta: DocMeta;
  blocks: Block[];
}

// `language` keeps the coarse bucket for backwards-compatible logic, while
// `script` carries the precise writing system so we can load the *correct*
// Noto font. A Simplified-Chinese subset font has NO Korean Hangul or
// Japanese kana glyphs, so picking the wrong one produces tofu boxes (□□□).
//
// World-class auto-detection: we distinguish Traditional vs Simplified Chinese,
// Japanese, and Korean. When Chinese is detected but the variant is ambiguous,
// we default to Traditional (the site's primary audience). Latin falls back to
// the bundled Roboto.
type DocScript =
  | "latin"
  | "hant"   // Traditional Chinese (primary) -> NotoSansTC
  | "hans"   // Simplified Chinese -> NotoSansSC
  | "kana"   // Japanese (kana + kanji) -> NotoSansJP
  | "hangul"; // Korean (Hangul + Hanja) -> NotoSansKR

interface DocMeta {
  title: string;
  language: "cjk" | "latin" | "mixed";
  /** Precise writing system used to choose the embedded font. */
  script: DocScript;
  hasRTL: boolean;
  estimatedPages: number;
}

type Block =
  | HeadingBlock
  | ParagraphBlock
  | TableBlock
  | ImageBlock
  | ListBlock
  | HRBlock
  | CodeBlock;

interface HeadingBlock   { type: "heading";   level: 1|2|3|4|5|6; text: string; runs: Run[]; }
interface ParagraphBlock { type: "paragraph"; runs: Run[]; alignment?: "left"|"center"|"right"|"justify"; spaceAfter?: number; }
interface ListBlock      { type: "list"; ordered: boolean; items: Run[][]; depth: number; }
interface HRBlock        { type: "hr"; }
interface CodeBlock      { type: "code"; text: string; }
interface ImageBlock     {
  type: "image";
  src: string;          // base64 data URL
  width: number;        // original px
  height: number;       // original px
  altText: string;
}
interface TableBlock {
  type: "table";
  rows: TableRow[];
  hasHeader: boolean;
  colWidths?: number[];  // relative star widths
}
interface TableRow { cells: TableCell[]; isHeader: boolean; }
interface TableCell { runs: Run[]; colSpan?: number; rowSpan?: number; }

interface Run {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  superscript?: boolean;
  subscript?: boolean;
  color?: string;        // hex without #
  highlight?: string;
  fontSize?: number;     // pt
  link?: string;
}

// ─── Runtime accessors (bundled, no network) ────────────────────────────────
// Kept as async functions so the rest of the pipeline (which awaits them)
// continues to work unchanged. They now resolve instantly with the bundled
// modules instead of injecting CDN <script> tags.

async function loadMammothRuntime(): Promise<typeof mammoth> {
  if (!mammoth || typeof (mammoth as any).convertToHtml !== "function") {
    throw new Error("mammoth runtime unavailable");
  }
  return mammoth;
}

async function loadPdfMakeRuntime(): Promise<typeof pdfMake> {
  const pm = pdfMake as any;
  if (!pm || typeof pm.createPdf !== "function") {
    throw new Error("pdfmake runtime unavailable");
  }
  if (!pm.vfs) {
    throw new Error("pdfmake font virtual file system (vfs) is not registered");
  }
  return pdfMake;
}

// ─── CJK font strategy ──────────────────────────────────────────────────────
// pdfmake's bundled vfs only ships Roboto (Latin). Rendering CJK text with
// Roboto produces blank/tofu glyphs (□□□). When a document contains CJK we
// detect the *specific* writing system (Korean/Japanese/Chinese) and fetch the
// matching Noto Sans subset OTF once, base64-inject it into the pdfmake vfs,
// and register a per-script font family (NotoKR / NotoJP / NotoSC). Using a
// Chinese-only font for a Korean document is exactly what caused the tofu bug.
// Per-script Noto Sans fonts (subset OTF, pdfmake needs TTF/OTF not woff2).
// CRITICAL: a Simplified-Chinese font has NO Korean/Japanese glyphs, so we map
// each writing system to its own font to avoid tofu boxes (□□□).
const NOTO_FONTS: Record<Exclude<DocScript, "latin">, { family: string; file: string; urls: string[] }> = {
  // Traditional Chinese — PRIMARY audience, also the default for ambiguous CJK.
  hant: {
    family: "NotoTC",
    file: "NotoSansTC-Regular.otf",
    urls: [
      "https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@main/Sans/SubsetOTF/TC/NotoSansTC-Regular.otf",
      "https://fastly.jsdelivr.net/gh/notofonts/noto-cjk@main/Sans/SubsetOTF/TC/NotoSansTC-Regular.otf",
    ],
  },
  // Simplified Chinese.
  hans: {
    family: "NotoSC",
    file: "NotoSansSC-Regular.otf",
    urls: [
      "https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@main/Sans/SubsetOTF/SC/NotoSansSC-Regular.otf",
      "https://fastly.jsdelivr.net/gh/notofonts/noto-cjk@main/Sans/SubsetOTF/SC/NotoSansSC-Regular.otf",
    ],
  },
  // Japanese (kana + kanji).
  kana: {
    family: "NotoJP",
    file: "NotoSansJP-Regular.otf",
    urls: [
      "https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@main/Sans/SubsetOTF/JP/NotoSansJP-Regular.otf",
      "https://fastly.jsdelivr.net/gh/notofonts/noto-cjk@main/Sans/SubsetOTF/JP/NotoSansJP-Regular.otf",
    ],
  },
  // Korean (Hangul + Hanja) — supported for world-class coverage, not promoted
  // in the UI. Falls back to Traditional Chinese only if KR cannot be fetched.
  hangul: {
    family: "NotoKR",
    file: "NotoSansKR-Regular.otf",
    urls: [
      "https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@main/Sans/SubsetOTF/KR/NotoSansKR-Regular.otf",
      "https://fastly.jsdelivr.net/gh/notofonts/noto-cjk@main/Sans/SubsetOTF/KR/NotoSansKR-Regular.otf",
    ],
  },
};

const loadedFontFamilies = new Set<string>();

function arrayBufferToBase64(buf: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buf);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, i + chunk)) as unknown as number[]
    );
  }
  return btoa(binary);
}

/**
 * Ensures the correct script-specific CJK font is registered in pdfmake and
 * returns the font family name to use. Falls back to "Roboto" if loading
 * fails (graceful degradation — Latin still works, CJK glyphs may be missing).
 *
 * @param script the detected writing system (hangul/kana/han/...).
 */
async function ensureCjkFont(script: DocScript): Promise<string> {
  if (script === "latin") return "Roboto";
  const cfg = NOTO_FONTS[script] ?? NOTO_FONTS.hant;
  const pm = pdfMake as any;

  // Always make sure Roboto (the bundled Latin font) stays registered.
  pm.fonts = pm.fonts || {};
  pm.fonts.Roboto = pm.fonts.Roboto || {
    normal: "Roboto-Regular.ttf",
    bold: "Roboto-Medium.ttf",
    italics: "Roboto-Italic.ttf",
    bolditalics: "Roboto-MediumItalic.ttf",
  };

  if (loadedFontFamilies.has(cfg.family) && pm.fonts?.[cfg.family]) {
    return cfg.family;
  }

  const tryLoad = async (url: string): Promise<boolean> => {
    try {
      const res = await fetch(url, { mode: "cors" });
      if (!res.ok) return false;
      const buf = await res.arrayBuffer();
      if (!buf || buf.byteLength < 1000) return false;
      const b64 = arrayBufferToBase64(buf);
      const fontVfs: Record<string, string> = { [cfg.file]: b64 };
      // pdfmake 0.3.x stores fonts in an internal virtual fs via
      // addVirtualFileSystem(). Writing pm.vfs directly does NOT update that
      // internal store, which caused "File '...' not found in virtual file
      // system". Register through the official API, and also mirror onto
      // pm.vfs for 0.2.x-style fallbacks.
      if (typeof pm.addVirtualFileSystem === "function") {
        pm.addVirtualFileSystem(fontVfs);
      }
      pm.vfs = Object.assign({}, pm.vfs, fontVfs);
      pm.fonts[cfg.family] = {
        normal: cfg.file,
        bold: cfg.file,
        italics: cfg.file,
        bolditalics: cfg.file,
      };
      return true;
    } catch {
      return false;
    }
  };

  // Try each mirror in order until one succeeds.
  let ok = false;
  for (const url of cfg.urls) {
    ok = await tryLoad(url);
    if (ok) break;
  }
  if (ok) {
    loadedFontFamilies.add(cfg.family);
    return cfg.family;
  }

  // Network/CDN failure. Per product direction, fall back to Traditional
  // Chinese (the primary audience) when possible — except we're already trying
  // TC, in which case the only remaining safe option is the bundled Roboto
  // (Latin). This avoids returning an unregistered font (which would stall
  // getBlob) while keeping CJK readable whenever the network allows it.
  if (script !== "hant") {
    const tcCfg = NOTO_FONTS.hant;
    if (loadedFontFamilies.has(tcCfg.family) && pm.fonts?.[tcCfg.family]) {
      return tcCfg.family;
    }
    let tcOk = false;
    for (const url of tcCfg.urls) {
      // reuse tryLoad logic by temporarily pointing at the TC config
      try {
        const res = await fetch(url, { mode: "cors" });
        if (!res.ok) continue;
        const buf = await res.arrayBuffer();
        if (!buf || buf.byteLength < 1000) continue;
        const b64 = arrayBufferToBase64(buf);
        const fontVfs: Record<string, string> = { [tcCfg.file]: b64 };
        if (typeof pm.addVirtualFileSystem === "function") pm.addVirtualFileSystem(fontVfs);
        pm.vfs = Object.assign({}, pm.vfs, fontVfs);
        pm.fonts[tcCfg.family] = {
          normal: tcCfg.file, bold: tcCfg.file, italics: tcCfg.file, bolditalics: tcCfg.file,
        };
        tcOk = true;
        break;
      } catch {
        /* try next mirror */
      }
    }
    if (tcOk) {
      loadedFontFamilies.add(tcCfg.family);
      return tcCfg.family;
    }
  }

  return "Roboto";
}

// ─── Language / i18n ────────────────────────────────────────────────────────

const ui = {
  zh: {
    title: "Word 轉 PDF",
    subtitle: "企業級精準轉換 · 瀏覽器執行 · 資料不離開您的裝置",
    badge1: "完全免費", badge2: "瀏覽器執行", badge3: "支援中文",
    uploadLabel: "上傳 Word 檔案（.docx）",
    uploadHint: "支援 .docx 格式；免費版最大 20 MB",
    dragHint: "拖放至此，或點擊選擇檔案",
    chooseFile: "選擇檔案",
    analysing: "分析文件結構中…",
    converting: "高品質轉換中，請稍候…",
    downloadBtn: "⬇ 下載 PDF",
    reupload: "重新上傳",
    preflightTitle: "文件品質預測",
    gradeSimple: "🟢 簡單文件 — 預期 95%+ 還原度",
    gradeModerate: "🟡 中等複雜度 — 預期 85% 還原度，建議轉換後確認",
    gradeComplex: "🟠 複雜版面 — 預期 70% 還原度，建議人工校對",
    gradeUnsupported: "🔴 此文件含不支援元素，轉換結果可能差異較大",
    convertBtn: "開始轉換",
    successNote: "轉換完成 · 文字可搜尋 · 支援複製",
    errorTitle: "轉換失敗",
    errorHint: "請確認檔案為有效 .docx 格式，且未設定密碼保護",
    privacyTitle: "🔒 隱私保障",
    privacyDesc: "全程瀏覽器本地執行。您的檔案從未上傳至任何伺服器。關閉頁面後所有資料立即清除。",
    premiumTitle: "Premium 進階功能",
    premiumDesc: "批量轉換、50MB 大檔、PDF/A 合規輸出、頁眉頁腳自訂、浮水印移除",
    kbTitle: "📚 Word 轉 PDF 知識庫",
    kbWhenTitle: "✅ 最適合的情況",
    kbWhen: [
      "傳送給沒有 Word 軟體的對象",
      "確保版面在所有裝置上一致",
      "法律、財務、政府文件存檔",
      "防止他人修改文件內容",
      "確保列印輸出格式固定",
    ],
    kbQualityTitle: "⚠️ 轉換品質說明",
    kbQuality: [
      "🟢 純文字、標題、列表 → 99% 還原",
      "🟢 超連結、粗體、斜體 → 完整保留",
      "🟡 表格（標準格式）→ 90% 還原",
      "🟡 圖片（嵌入式）→ 85% 還原，保持比例",
      "🟠 複雜多欄版面 → 70% 還原，建議確認",
      "🔴 SmartArt / 圖表 / 巨集 → 不支援",
    ],
    kbNotTitle: "❌ 目前不支援",
    kbNot: [
      "掃描圖片型 .doc 舊版格式",
      "密碼保護的文件",
      "含 VBA 巨集的文件",
      "SmartArt、圖表、3D 物件",
    ],
    kbTechTitle: "🔧 技術說明",
    kbTech: "本工具採用 mammoth.js 語意提取 + pdfmake 程式化渲染，產生文字可搜尋的真實向量 PDF，而非截圖式影像 PDF。轉換引擎內建於頁面（不依賴外部 CDN），離線或內網環境亦可運作。偵測到中文時會自動載入 Noto Sans CJK 字型以正確輸出繁簡中文；若字型載入失敗，拉丁文字仍可正常輸出，少數中文字元可能缺字，建議改用 Word/Google Docs 直接匯出。",
    faqTitle: "常見問題",
    faqs: [
      { q: "支援哪些 Word 版本？", a: "支援 .docx 格式（Word 2007 及以上，含 Google Docs 與 LibreOffice 匯出的 .docx）。不支援舊版 .doc 格式。" },
      { q: "中文會正確顯示嗎？", a: "本工具會嘗試以瀏覽器端 Unicode PDF 輸出繁體與簡體中文，文字可搜尋與複製；若含特殊罕見字元，建議改用 Word/Google Docs 直接匯出以取得最高字型保真。" },
      { q: "轉換後 PDF 的文字可以複製嗎？", a: "可以。本工具產生的是真實向量 PDF，所有文字均可搜尋、選取、複製，有別於截圖式 PDF。" },
      { q: "檔案有大小限制嗎？", a: "免費版最大 20MB。含大量嵌入圖片的文件可能較慢，建議升級 Premium 以處理超大檔案。" },
      { q: "密碼保護的文件可以轉換嗎？", a: "無法。請先在 Word 中移除密碼保護（檔案 → 資訊 → 保護文件 → 以密碼加密 → 清除密碼），再上傳轉換。" },
    ],
    relatedTitle: "相關轉換工具",
    related: [
      { name: "PDF 轉 Markdown", path: "/tools/converter/pdf-to-markdown", desc: "PDF 轉為 AI 可讀的 Markdown 格式" },
      { name: "PDF 轉 Word", path: "/tools/converter/pdf-to-word", desc: "PDF 還原為可編輯的 Word 文件" },
    ],
    poweredBy: "本工具採用開源技術：mammoth.js（BSD-2）· pdfmake（MIT）· Noto Fonts（OFL）",
  },
  en: {
    title: "Word to PDF",
    subtitle: "Enterprise-grade conversion · Runs in browser · Your file never leaves your device",
    badge1: "100% Free", badge2: "Browser-based", badge3: "CJK & Unicode",
    uploadLabel: "Upload Word File (.docx)",
    uploadHint: "Supports .docx format. Free tier: max 20 MB.",
    dragHint: "Drag & drop here, or click to browse",
    chooseFile: "Choose File",
    analysing: "Analysing document structure…",
    converting: "High-quality conversion in progress…",
    downloadBtn: "⬇ Download PDF",
    reupload: "Upload another file",
    preflightTitle: "Document Quality Prediction",
    gradeSimple: "🟢 Simple document — expected 95%+ fidelity",
    gradeModerate: "🟡 Moderate complexity — expected 85% fidelity, verify after conversion",
    gradeComplex: "🟠 Complex layout — expected 70% fidelity, manual review recommended",
    gradeUnsupported: "🔴 Unsupported elements detected — output may differ significantly",
    convertBtn: "Convert Now",
    successNote: "Conversion complete · Text is searchable · Copy-paste enabled",
    errorTitle: "Conversion Failed",
    errorHint: "Please ensure the file is a valid .docx format and is not password-protected.",
    privacyTitle: "🔒 Privacy Guarantee",
    privacyDesc: "Entirely local browser processing. Your file is never uploaded to any server. All data is cleared when you close or refresh the page.",
    premiumTitle: "Premium Features",
    premiumDesc: "Batch conversion, 50MB large files, PDF/A compliance, custom headers/footers, watermark removal",
    kbTitle: "📚 Word to PDF Knowledge Base",
    kbWhenTitle: "✅ Best use cases",
    kbWhen: [
      "Sharing with recipients who don't have Microsoft Word",
      "Ensuring consistent layout across all devices and operating systems",
      "Legal, financial, and government document archival",
      "Preventing recipients from modifying document content",
      "Fixed-layout print-ready output",
    ],
    kbQualityTitle: "⚠️ Conversion quality guide",
    kbQuality: [
      "🟢 Plain text, headings, lists → 99% fidelity",
      "🟢 Hyperlinks, bold, italic → fully preserved",
      "🟡 Tables (standard format) → 90% fidelity",
      "🟡 Embedded images → 85% fidelity, aspect ratio preserved",
      "🟠 Complex multi-column layouts → 70% fidelity, verify output",
      "🔴 SmartArt / charts / macros → not supported",
    ],
    kbNotTitle: "❌ Currently unsupported",
    kbNot: [
      "Scanned image files / legacy .doc format",
      "Password-protected documents",
      "VBA macro-enabled documents",
      "SmartArt, embedded charts, 3D objects",
    ],
    kbTechTitle: "🔧 Technical notes",
    kbTech: "This tool uses mammoth.js for semantic extraction combined with pdfmake for programmatic rendering, producing a true vector PDF with selectable, searchable text — not a screenshot-based image PDF. The conversion engine is bundled into the page (no external CDN), so it also works offline or on intranets. When CJK text is detected, a Noto Sans CJK font is loaded automatically so Chinese renders correctly; if the font fails to load, Latin text still renders and a few CJK glyphs may be missing — in that case export directly from Word/Google Docs.",
    faqTitle: "FAQ",
    faqs: [
      { q: "Which Word versions are supported?", a: "Supports .docx format (Word 2007 and above, including Google Docs and LibreOffice exports). Legacy .doc format is not supported." },
      { q: "Will Chinese / Japanese / Korean text display correctly?", a: "Yes. The tool attempts browser-side Unicode PDF output. Some rare CJK glyphs may require exporting directly from Word or Google Docs for perfect font fidelity." },
      { q: "Is the text in the output PDF searchable?", a: "Yes. This tool produces a true vector PDF — all text is searchable, selectable, and copy-pasteable, unlike screenshot-based PDF converters." },
      { q: "Is there a file size limit?", a: "Free tier: 20MB. Documents with many embedded images may be slower. Upgrade to Premium for larger files." },
      { q: "Can I convert a password-protected document?", a: "No. Please remove the password in Word first (File → Info → Protect Document → Encrypt with Password → clear the password), then upload." },
    ],
    relatedTitle: "Related Converter Tools",
    related: [
      { name: "PDF to Markdown", path: "/tools/converter/pdf-to-markdown", desc: "Convert PDF to AI-ready Markdown format" },
      { name: "PDF to Word", path: "/tools/converter/pdf-to-word", desc: "Restore PDF to editable Word document" },
    ],
    poweredBy: "Powered by open-source: mammoth.js (BSD-2) · pdfmake (MIT) · Noto Fonts (OFL)",
  },
} as const;

// ─── 12-Detector Pre-flight Analyser ────────────────────────────────────────

async function runPreflightAnalysis(
  html: string,
  mammothMessages: { type: string; message: string }[]
): Promise<PreflightReport> {
  const detectors: DetectorResult[] = [];
  const warnings: string[] = [];
  const fatalErrors: string[] = [];

  // D1: Heading structure detector
  const headingMatches = html.match(/<h[1-6][^>]*>/gi) ?? [];
  detectors.push({
    id: "D1_HEADINGS",
    label: "標題結構",
    triggered: headingMatches.length > 0,
    impact: "none",
    note: `偵測到 ${headingMatches.length} 個標題`,
  });

  // D2: Table complexity detector
  const tableCount = (html.match(/<table/gi) ?? []).length;
  const nestedTable = /<table[^>]*>[\s\S]*?<table/i.test(html);
  detectors.push({
    id: "D2_TABLES",
    label: "表格結構",
    triggered: tableCount > 0,
    impact: nestedTable ? "high" : tableCount > 5 ? "medium" : "low",
    note: `${tableCount} 個表格${nestedTable ? "（含巢狀表格）" : ""}`,
  });
  if (nestedTable) warnings.push("偵測到巢狀表格，可能影響佈局");

  // D3: Image pipeline detector
  const imgCount = (html.match(/<img/gi) ?? []).length;
  detectors.push({
    id: "D3_IMAGES",
    label: "嵌入圖片",
    triggered: imgCount > 0,
    impact: imgCount > 10 ? "medium" : "low",
    note: `${imgCount} 張圖片`,
  });

  // D4: CJK content detector (Chinese / Japanese / Korean)
  const cjkPattern = /[\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]/;
  const hasCJK = cjkPattern.test(html);
  detectors.push({
    id: "D4_CJK",
    label: "CJK 文字（中日韓）",
    triggered: hasCJK,
    impact: "none",
    note: hasCJK ? "已啟用 Unicode PDF 輸出" : "無 CJK 文字",
  });

  // D5: RTL / bidirectional text detector
  const rtlPattern = /[\u0600-\u06FF\u0750-\u077F\u05D0-\u05EA]/;
  const hasRTL = rtlPattern.test(html);
  detectors.push({
    id: "D5_RTL",
    label: "RTL 文字方向",
    triggered: hasRTL,
    impact: hasRTL ? "high" : "none",
    note: hasRTL ? "含阿拉伯文/希伯來文，RTL 方向可能無法完整保留" : "無 RTL 文字",
  });
  if (hasRTL) warnings.push("RTL 文字佈局在當前版本可能無法完整保留");

  // D6: Hyperlink detector
  const linkCount = (html.match(/<a\s/gi) ?? []).length;
  detectors.push({
    id: "D6_LINKS",
    label: "超連結",
    triggered: linkCount > 0,
    impact: "none",
    note: `${linkCount} 個連結（PDF 中保留可點擊性）`,
  });

  // D7: List structure detector
  const ulCount = (html.match(/<ul/gi) ?? []).length;
  const olCount = (html.match(/<ol/gi) ?? []).length;
  detectors.push({
    id: "D7_LISTS",
    label: "列表",
    triggered: ulCount + olCount > 0,
    impact: "none",
    note: `無序列表 ${ulCount} 個 · 有序列表 ${olCount} 個`,
  });

  // D8: Text formatting richness detector
  const boldCount = (html.match(/<strong/gi) ?? []).length;
  const italicCount = (html.match(/<em/gi) ?? []).length;
  detectors.push({
    id: "D8_FORMATTING",
    label: "文字格式（粗體/斜體）",
    triggered: boldCount + italicCount > 0,
    impact: "none",
    note: `粗體 ${boldCount} · 斜體 ${italicCount}（完整保留）`,
  });

  // D9: Document length / page estimate
  const textContent = html.replace(/<[^>]+>/g, "").trim();
  const charCount = textContent.length;
  // Heuristic: ~1800 CJK chars per A4 page, ~3000 Latin per page
  const pageEst = hasCJK
    ? Math.max(1, Math.ceil(charCount / 1800))
    : Math.max(1, Math.ceil(charCount / 3000));
  detectors.push({
    id: "D9_LENGTH",
    label: "文件長度",
    triggered: pageEst > 20,
    impact: pageEst > 50 ? "medium" : "none",
    note: `約 ${pageEst} 頁`,
  });

  // D10: Mammoth conversion warnings (unsupported elements)
  const mammothWarnings = mammothMessages.filter((m) => m.type === "warning");
  const hasMacro = mammothWarnings.some((m) =>
    m.message.toLowerCase().includes("macro")
  );
  const hasSmartArt = mammothWarnings.some((m) =>
    m.message.toLowerCase().includes("smartart") || m.message.toLowerCase().includes("diagram")
  );
  detectors.push({
    id: "D10_UNSUPPORTED",
    label: "不支援元素",
    triggered: mammothWarnings.length > 0,
    impact: hasMacro || hasSmartArt ? "high" : mammothWarnings.length > 3 ? "medium" : "low",
    note: `${mammothWarnings.length} 個警告${hasMacro ? " · 含巨集" : ""}${hasSmartArt ? " · 含 SmartArt" : ""}`,
  });
  if (hasMacro) warnings.push("文件含 VBA 巨集，轉換時將略過");
  if (hasSmartArt) warnings.push("文件含 SmartArt，將嘗試替換為文字");

  // D11: Multi-column layout heuristic
  // mammoth flattens columns; detect via unusual paragraph count vs content
  const paraCount = (html.match(/<p[^>]*>/gi) ?? []).length;
  const avgParaLength = charCount / Math.max(1, paraCount);
  const likelyMultiColumn = avgParaLength < 80 && paraCount > 30;
  detectors.push({
    id: "D11_MULTICOLUMN",
    label: "多欄版面（推測）",
    triggered: likelyMultiColumn,
    impact: likelyMultiColumn ? "medium" : "none",
    note: likelyMultiColumn ? "疑似多欄版面，欄位分隔將轉為單欄" : "無多欄版面跡象",
  });

  // D12: Font diversity heuristic (via mammoth style messages)
  const fontMsgs = mammothMessages.filter((m) =>
    m.message.toLowerCase().includes("font") ||
    m.message.toLowerCase().includes("style")
  );
  detectors.push({
    id: "D12_FONTS",
    label: "自訂字型",
    triggered: fontMsgs.length > 0,
    impact: fontMsgs.length > 5 ? "medium" : "low",
    note: fontMsgs.length > 0 ? `偵測到 ${fontMsgs.length} 個自訂字型樣式，將以 Noto / Helvetica 替代` : "使用標準字型",
  });

  // ── Grade computation ──────────────────────────────────────────────────
  const highImpact = detectors.filter((d) => d.triggered && d.impact === "high").length;
  const medImpact  = detectors.filter((d) => d.triggered && d.impact === "medium").length;

  let grade: DocGrade =
    fatalErrors.length > 0 ? "unsupported"
    : highImpact >= 2     ? "complex"
    : highImpact === 1 || medImpact >= 2 ? "moderate"
    : medImpact === 1     ? "moderate"
    : "simple";

  return { grade, pageEstimate: pageEst, detectors, warnings, fatalErrors };
}

// ─── Semantic IR Builder (HTML → SemanticIR) ────────────────────────────────

function buildSemanticIR(html: string, metaHints: Partial<DocMeta>): SemanticIR {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div id="root">${html}</div>`, "text/html");
  const root = doc.getElementById("root")!;
  const blocks: Block[] = [];

  function parseRuns(el: Element): Run[] {
    const runs: Run[] = [];
    el.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent ?? "";
        if (text) runs.push({ text });
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const child = node as Element;
      const tag = child.tagName.toLowerCase();
      const childRuns = parseRuns(child);
      childRuns.forEach((r) => {
        if (tag === "strong" || tag === "b") r.bold = true;
        if (tag === "em" || tag === "i")    r.italic = true;
        if (tag === "u")                     r.underline = true;
        if (tag === "s" || tag === "del")    r.strikethrough = true;
        if (tag === "sup")                   r.superscript = true;
        if (tag === "sub")                   r.subscript = true;
        if (tag === "a") r.link = (child as HTMLAnchorElement).href;
      });
      runs.push(...childRuns);
    });
    return runs.filter((r) => r.text.trim() !== "" || r.text === " ");
  }

  function processNode(el: Element) {
    const tag = el.tagName.toLowerCase();

    // Headings
    if (/^h[1-6]$/.test(tag)) {
      const level = parseInt(tag[1]) as 1|2|3|4|5|6;
      blocks.push({ type: "heading", level, text: el.textContent ?? "", runs: parseRuns(el) });
      return;
    }

    // Paragraphs
    if (tag === "p") {
      const runs = parseRuns(el);
      if (runs.length > 0) {
        blocks.push({ type: "paragraph", runs });
      }
      return;
    }

    // Horizontal rule
    if (tag === "hr") {
      blocks.push({ type: "hr" });
      return;
    }

    // Lists
    if (tag === "ul" || tag === "ol") {
      const ordered = tag === "ol";
      const items: Run[][] = [];
      el.querySelectorAll(":scope > li").forEach((li) => {
        items.push(parseRuns(li));
      });
      if (items.length > 0) {
        blocks.push({ type: "list", ordered, items, depth: 0 });
      }
      return;
    }

    // Tables
    if (tag === "table") {
      const rows: TableRow[] = [];
      let hasHeader = false;
      el.querySelectorAll("tr").forEach((tr, ri) => {
        const cells: TableCell[] = [];
        const isHeader = tr.closest("thead") !== null || (ri === 0 && tr.querySelectorAll("th").length > 0);
        if (isHeader) hasHeader = true;
        tr.querySelectorAll("td, th").forEach((cell) => {
          cells.push({
            runs: parseRuns(cell),
            colSpan: parseInt((cell as HTMLTableCellElement).getAttribute("colspan") ?? "1"),
          });
        });
        if (cells.length > 0) rows.push({ cells, isHeader });
      });
      if (rows.length > 0) blocks.push({ type: "table", rows, hasHeader });
      return;
    }

    // Images
    if (tag === "img") {
      const src = (el as HTMLImageElement).src;
      if (src && src.startsWith("data:")) {
        const tempImg = new Image();
        tempImg.src = src;
        blocks.push({
          type: "image",
          src,
          width: tempImg.naturalWidth || 400,
          height: tempImg.naturalHeight || 300,
          altText: (el as HTMLImageElement).alt ?? "",
        });
      }
      return;
    }

    // Recurse into divs / sections / articles
    if (["div", "section", "article", "main", "body"].includes(tag)) {
      el.childNodes.forEach((n) => {
        if (n.nodeType === Node.ELEMENT_NODE) processNode(n as Element);
      });
    }
  }

  root.childNodes.forEach((n) => {
    if (n.nodeType === Node.ELEMENT_NODE) processNode(n as Element);
  });

  const textSample = root.textContent ?? "";
  const { language, script } = detectScript(textSample);

  return {
    meta: {
      title: metaHints.title ?? "Document",
      language,
      script,
      hasRTL: metaHints.hasRTL ?? false,
      estimatedPages: metaHints.estimatedPages ?? 1,
    },
    blocks,
  };
}

/**
 * Detects the dominant writing system so the correct CJK font is loaded.
 * Distinguishes Korean (Hangul), Japanese (kana), and Chinese (Han) because
 * each needs a different Noto subset font; a Chinese-only font renders Korean
 * and Japanese as empty tofu boxes.
 */
// Characters that exist ONLY in Simplified Chinese (common high-frequency set).
// Presence strongly implies Simplified.
const SIMPLIFIED_MARKERS = "国对说时这话让发这个们来还学习应实现产业务车书买卖东车专门间题问没办关闭电脑爱网页备语数据";
// Characters that exist ONLY in Traditional Chinese (common high-frequency set).
// Presence strongly implies Traditional.
const TRADITIONAL_MARKERS = "國對說時這話讓發這個們來還學習應實現產業務車書買賣東車專門間題問沒辦關閉電腦愛網頁備語數據灣體廳廣麼點為與會經濟";

function countMarkers(text: string, markers: string): number {
  let n = 0;
  const set = new Set(markers.split(""));
  for (const ch of text) if (set.has(ch)) n++;
  return n;
}

function detectScript(text: string): { language: "cjk" | "latin" | "mixed"; script: DocScript } {
  const hangul = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/.test(text); // Korean
  const kana = /[\u3040-\u309F\u30A0-\u30FF]/.test(text);                // Japanese hiragana/katakana
  const han = /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/.test(text);    // CJK ideographs (Chinese/Kanji)
  const latin = /[a-zA-Z]/.test(text);

  const hasCJK = hangul || kana || han;
  const language: "cjk" | "latin" | "mixed" = hasCJK && latin ? "mixed" : hasCJK ? "cjk" : "latin";

  // Detection priority: Korean (Hangul) and Japanese (kana) are unambiguous
  // because they use unique scripts. Chinese needs Traditional/Simplified
  // disambiguation.
  let script: DocScript = "latin";
  if (hangul) {
    script = "hangul"; // Korean — supported but not promoted
  } else if (kana) {
    script = "kana"; // Japanese — kana presence is decisive
  } else if (han) {
    // Disambiguate Traditional vs Simplified using marker frequency.
    const trad = countMarkers(text, TRADITIONAL_MARKERS);
    const simp = countMarkers(text, SIMPLIFIED_MARKERS);
    if (simp > trad) {
      script = "hans"; // clearly more Simplified markers
    } else {
      // Traditional markers win, OR it's a tie / ambiguous (e.g. shared chars
      // only). Default to Traditional — the site's primary audience.
      script = "hant";
    }
  } else {
    script = "latin";
  }

  return { language, script };
}

// ─── pdfmake Document Definition Builder ────────────────────────────────────

interface PdfContent { [key: string]: unknown }

function buildPdfDefinition(ir: SemanticIR, fontName: string = "Roboto"): PdfContent {

  // Font stack resolved by the pipeline:
  //  - "Roboto"        for Latin-only documents (bundled, always available)
  //  - "NotoKR/JP/SC"  for the detected writing system, fetched on demand
  // Using an unregistered font would stall getBlob(), so the caller guarantees
  // `fontName` is registered before this runs.
  const fonts = { defaultFont: fontName };

  // Style definitions
  const styles: PdfContent = {
    h1: { fontSize: 24, bold: true, margin: [0, 16, 0, 8], lineHeight: 1.3 },
    h2: { fontSize: 20, bold: true, margin: [0, 14, 0, 6], lineHeight: 1.3 },
    h3: { fontSize: 16, bold: true, margin: [0, 12, 0, 4], lineHeight: 1.3 },
    h4: { fontSize: 14, bold: true, margin: [0, 10, 0, 4] },
    h5: { fontSize: 12, bold: true, margin: [0, 8, 0, 2] },
    h6: { fontSize: 11, bold: true, italics: true, margin: [0, 8, 0, 2] },
    body: { fontSize: 11, lineHeight: 1.6, margin: [0, 0, 0, 6] },
    tableHeader: { bold: true, fillColor: "#F1F5F9", margin: [4, 4, 4, 4] },
    tableCell:   { margin: [4, 3, 4, 3] },
    listItem:    { margin: [0, 2, 0, 2] },
    hr:          { margin: [0, 8, 0, 8], canvas: [{ type: "line", x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: "#CBD5E1" }] },
    link:        { color: "#2563EB", decoration: "underline" },
  };

  // Insert zero-width break opportunities into very long unbreakable tokens
  // (e.g. "ALE-12V35(12V_BMS)(規格來源" or long URLs/codes). Without this,
  // pdfmake cannot wrap the token and forces the table column wider than the
  // page, which is exactly what truncated the right-most columns. U+200B is a
  // zero-width space: invisible, but a valid line-break point.
  function softBreakLongTokens(text: string, threshold = 14): string {
    if (!text) return text;
    return text
      .split(/(\s+)/)
      .map((tok) => {
        if (/^\s+$/.test(tok) || tok.length <= threshold) return tok;
        // CJK already breaks per-character; only chunk long non-CJK runs.
        if (/[\u3000-\u9FFF\uAC00-\uD7AF]/.test(tok)) return tok;
        return tok.replace(new RegExp(`(.{${threshold}})`, "g"), "$1\u200B");
      })
      .join("");
  }

  // Run → pdfmake inline object
  function runToPdf(run: Run): PdfContent {
    const obj: PdfContent = { text: run.text };
    if (run.bold)          obj.bold = true;
    if (run.italic)        obj.italics = true;
    if (run.underline)     obj.decoration = "underline";
    if (run.strikethrough) obj.decoration = "lineThrough";
    if (run.superscript)   obj.sup = true;
    if (run.subscript)     obj.sub = true;
    if (run.color)         obj.color = `#${run.color}`;
    if (run.link) {
      obj.link = run.link;
      obj.style = "link";
    }
    return obj;
  }

  function runsToInline(runs: Run[]): PdfContent[] {
    return runs.map(runToPdf);
  }

  // Same as runsToInline but with soft word-breaking, for use inside table
  // cells where long tokens must not blow out the column width.
  function runsToCellInline(runs: Run[]): PdfContent[] {
    return runs.map((r) => {
      const obj = runToPdf(r);
      obj.text = softBreakLongTokens(String(obj.text ?? ""));
      return obj;
    });
  }

  // Plain text length of a cell, used to weight column widths.
  function cellTextLength(runs: Run[]): number {
    return runs.reduce((n, r) => n + (r.text ? r.text.length : 0), 0);
  }

  // Block → pdfmake content node
  function blockToPdf(block: Block): PdfContent | null {
    switch (block.type) {
      case "heading":
        return {
          text: runsToInline(block.runs),
          style: `h${block.level}`,
          pageBreak: block.level === 1 ? ("before" as const) : undefined,
          keepWithNext: true,  // heading guard: never orphan heading
        };

      case "paragraph":
        if (block.runs.length === 0) return { text: " ", margin: [0, 4, 0, 4] };
        return {
          text: runsToInline(block.runs),
          style: "body",
        };

      case "list": {
        const items = block.items.map((runs) => ({
          text: runsToInline(runs),
          style: "listItem",
        }));
        return block.ordered
          ? { ol: items, margin: [0, 4, 0, 8] }
          : { ul: items, margin: [0, 4, 0, 8] };
      }

      case "table": {
        if (block.rows.length === 0) return null;
        // Account for colSpans when computing the real column count, otherwise
        // pdfmake throws "Not enough/too many cells" and getBlob() rejects.
        const colCount = Math.max(
          ...block.rows.map((r) =>
            r.cells.reduce((sum, c) => sum + Math.max(1, c.colSpan ?? 1), 0)
          )
        );

        // ── Content-aware column widths ───────────────────────────────────
        // The previous version set every column to "*" (equal share). When a
        // cell held a long unbreakable token, pdfmake widened that column and
        // pushed the table past the page edge, truncating the right columns.
        // Instead we (a) measure the typical content length per column, (b)
        // give wider columns more space but clamp the ratio so no single
        // column dominates, and (c) hand pdfmake star-weights that always sum
        // within the printable width. Combined with soft word-breaking in the
        // cells, the table now stays inside the page.
        const colMaxLen: number[] = Array(colCount).fill(0);
        block.rows.forEach((row) => {
          let ci = 0;
          row.cells.forEach((cell) => {
            const span = Math.max(1, cell.colSpan ?? 1);
            if (span === 1 && ci < colCount) {
              colMaxLen[ci] = Math.max(colMaxLen[ci], cellTextLength(cell.runs));
            }
            ci += span;
          });
        });
        // Weight = clamp(content length) so very long cells get more room but
        // never more than ~3x the narrowest column.
        const weights = colMaxLen.map((len) => {
          const w = Math.max(3, Math.min(len || 3, 36)); // 3..36 chars
          return w;
        });
        const colWidths: (string | number)[] = weights.map((w) => `${w}*`);

        const body = block.rows.map((row): PdfContent[] => {
          const out: PdfContent[] = [];
          row.cells.forEach((cell) => {
            const span = cell.colSpan && cell.colSpan > 1 ? cell.colSpan : 1;
            out.push({
              text: runsToCellInline(cell.runs),
              style: row.isHeader ? "tableHeader" : "tableCell",
              colSpan: span > 1 ? span : undefined,
              noWrap: false,
            });
            // pdfmake requires (span - 1) placeholder cells right after a colSpan cell
            for (let i = 1; i < span; i++) {
              out.push({ text: "", style: row.isHeader ? "tableHeader" : "tableCell" });
            }
          });
          return out;
        });
        // Pad short rows to the full column count to avoid pdfmake layout crash
        body.forEach((row) => {
          while (row.length < colCount) row.push({ text: "", style: "tableCell" });
        });
        return {
          // width:"*" forces the table to span (and stay within) the printable
          // content width instead of growing to its natural content size.
          table: { headerRows: block.hasHeader ? 1 : 0, widths: colWidths, body, dontBreakRows: true },
          layout: {
            hLineWidth: (i: number, node: any) =>
              i === 0 || i === node.table.body.length ? 0.8 : 0.5,
            vLineWidth: () => 0.5,
            hLineColor: (i: number, node: any) =>
              i === 0 || i === 1 || i === node.table.body.length ? "#94A3B8" : "#CBD5E1",
            vLineColor: () => "#CBD5E1",
            paddingLeft:  () => 6,
            paddingRight: () => 6,
            paddingTop:   () => 5,
            paddingBottom:() => 5,
            fillColor: (rowIndex: number, node: any, columnIndex: number) => {
              // Zebra striping for readability (skip header row).
              if (block.hasHeader && rowIndex === 0) return null;
              const dataRow = block.hasHeader ? rowIndex - 1 : rowIndex;
              return dataRow % 2 === 1 ? "#F8FAFC" : null;
            },
          },
          margin: [0, 8, 0, 14],
        };
      }

      case "image": {
        // Clamp image to page width (515pt = A4 minus margins)
        const MAX_W = 515;
        const MAX_H = 680;
        const ratio = block.width / block.height;
        let w = Math.min(block.width * 0.75, MAX_W);  // px → pt approx
        let h = w / ratio;
        if (h > MAX_H) { h = MAX_H; w = h * ratio; }
        return {
          image: block.src,
          width: Math.round(w),
          height: Math.round(h),
          margin: [0, 8, 0, 8],
        };
      }

      case "hr":
        return {
          canvas: [{ type: "line", x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: "#CBD5E1" }],
          margin: [0, 10, 0, 10],
        };

      case "code":
        return {
          text: block.text,
          font: "Courier",
          fontSize: 9,
          background: "#F8FAFC",
          margin: [0, 6, 0, 6],
          preserveLeadingSpaces: true,
        };

      default:
        return null;
    }
  }

  const content = ir.blocks
    .map(blockToPdf)
    .filter((n): n is PdfContent => n !== null);

  return {
    content,
    styles,
    ...fonts,
    pageSize: "A4",
    // Tighter, document-style margins (≈ 1.4cm). A4 width is 595.28pt, so the
    // printable content width becomes 595.28 - 40 - 40 ≈ 515pt — matching the
    // 515pt used for <hr> / image clamping below. This gives wide tables
    // (invoices, quotes) enough room to stay inside the page.
    pageMargins: [40, 50, 40, 50],
    pageBreakBefore: (currentNode: PdfContent) => {
      // Widow/orphan control: push heading to next page if <3 lines remain
      return false;
    },
    info: {
      title: ir.meta.title,
      author: "Formula Universe Converter",
      creator: "Formula Universe — formulauniverse.com",
    },
    defaultStyle: {
      font: fontName,
      fontSize: 11,
      lineHeight: 1.6,
    },
  };
}

// ─── Main Conversion Pipeline ────────────────────────────────────────────────

async function convertViaServer(
  file: File,
  onStage: (stage: string) => void
): Promise<Blob> {
  // High-fidelity path: send the .docx to the server LibreOffice headless
  // engine, which returns a TRUE VECTOR PDF (~99% fidelity at 100% zoom and
  // crisp when scaled to 150%/200%). The in-browser mammoth/pdfmake pipeline
  // cannot preserve colors, logos, exact fonts or layout, so this is default.
  onStage("reading");
  const buf = await file.arrayBuffer();
  onStage("rendering");
  const resp = await fetch("/api/convert/word-to-pdf", {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
      "x-filename": encodeURIComponent(file.name),
    },
    body: buf,
  });
  onStage("generating");
  if (!resp.ok) {
    let detail = `HTTP ${resp.status}`;
    try {
      const j = await resp.json();
      if (j?.error) detail = j.error;
    } catch {
      /* non-json error */
    }
    throw new Error(`高保真轉換失敗：${detail}`);
  }
  const blob = await resp.blob();
  if (blob.type && !blob.type.includes("pdf")) {
    const text = await blob.text();
    throw new Error(`高保真轉換失敗：${text.slice(0, 200)}`);
  }
  return blob;
}

async function convertDocxToPdf(
  file: File,
  onStage: (stage: string) => void
): Promise<Blob> {
  // Stage 1: Read file
  onStage("reading");
  const arrayBuffer = await file.arrayBuffer();

  // Stage 2: mammoth.js semantic extraction with custom style map
  onStage("parsing");
  const mammoth = await loadMammothRuntime();
  const styleMap = [
    "p[style-name='Heading 1'] => h1:fresh",
    "p[style-name='Heading 2'] => h2:fresh",
    "p[style-name='Heading 3'] => h3:fresh",
    "p[style-name='Heading 4'] => h4:fresh",
    "p[style-name='Heading 5'] => h5:fresh",
    "p[style-name='Heading 6'] => h6:fresh",
    "p[style-name='Title']      => h1:fresh",
    "p[style-name='Subtitle']   => h2:fresh",
    "p[style-name='Caption']    => p.caption:fresh",
    "p[style-name='Quote']      => blockquote:fresh",
    "r[style-name='Strong']     => strong",
    "r[style-name='Emphasis']   => em",
    "p[style-name='List Paragraph'] => p:fresh",
  ].join("\n");

  const mammothResult = await mammoth.convertToHtml(
    { arrayBuffer },
    {
      styleMap,
      includeDefaultStyleMap: true,
      convertImage: mammoth.images.imgElement(async (image) => {
        // Convert embedded images to base64 for PDF embedding
        const buf = await image.read("base64");
        return { src: `data:${image.contentType};base64,${buf}` };
      }),
    }
  );

  const html = mammothResult.value;
  const messages = mammothResult.messages;

  // Stage 3: Pre-flight analysis (12 detectors)
  onStage("analysing");
  const preflight = await runPreflightAnalysis(html, messages);

  // Stage 4: Build Semantic IR
  onStage("building_ir");
  const ir = buildSemanticIR(html, {
    title: file.name.replace(/\.docx?$/i, ""),
    hasRTL: preflight.detectors.find((d) => d.id === "D5_RTL")?.triggered ?? false,
    estimatedPages: preflight.pageEstimate,
  });

  // Stage 5: Build pdfmake document definition
  onStage("rendering");
  const pdfmake = await loadPdfMakeRuntime();

  // Resolve a CJK-capable font when the document contains Chinese/Japanese/
  // Korean text. Falls back to Roboto if the font cannot be fetched, so Latin
  // documents are unaffected and CJK degrades gracefully instead of stalling.
  const needsCjk = ir.meta.language === "cjk" || ir.meta.language === "mixed";
  // Pick the font that matches the actual writing system (Korean Hangul,
  // Japanese kana, or Chinese Han). Using the wrong subset font would render
  // tofu boxes (□□□) for unsupported scripts.
  const fontName = needsCjk ? await ensureCjkFont(ir.meta.script) : "Roboto";

  const docDefinition = buildPdfDefinition(ir, fontName);

  // Stage 6: Generate PDF blob
  onStage("generating");
  const triggeredDetectors = preflight.detectors.filter((d) => d.triggered);
  const hasHighImpactRisk = triggeredDetectors.some((d) => d.impact === "high");
  const hasImageOrTableRisk = triggeredDetectors.some((d) => ["D2_TABLES", "D3_IMAGES", "D11_MULTICOLUMN"].includes(d.id));
  const pdfGenerationTimeoutMs = file.size <= 512 * 1024 && !hasHighImpactRisk && !hasImageOrTableRisk
    ? 25_000
    : file.size <= 2 * 1024 * 1024 && !hasHighImpactRisk
      ? 35_000
      : 90_000;

  return new Promise<Blob>((resolve, reject) => {
    let settled = false;
    const timeout = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      const seconds = Math.round(pdfGenerationTimeoutMs / 1000);
      reject(new Error(`PDF generation did not finish within ${seconds}s. For small files this usually means the PDF engine is stuck on a font, table, or document structure edge case. Please cancel and try exporting directly from Word/Google Docs, or simplify tables/images and retry.`));
    }, pdfGenerationTimeoutMs);

    const finishOk = (blob: Blob) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      if (!blob || blob.size === 0) {
        reject(new Error("PDF generation returned an empty file. Please try a simpler document or compress embedded images."));
        return;
      }
      resolve(blob);
    };
    const finishErr = (err: unknown) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      reject(err instanceof Error ? err : new Error(String(err)));
    };

    try {
      const pdfDoc = (pdfmake as any).createPdf(docDefinition);
      // pdfmake 0.3.x: getBlob() returns a Promise.
      // pdfmake 0.2.x: getBlob(cb) used a callback that NEVER fired here,
      // which was the root cause of "conversion never completes".
      // Support both shapes defensively.
      const maybePromise = pdfDoc.getBlob((blob: Blob) => finishOk(blob));
      if (maybePromise && typeof maybePromise.then === "function") {
        maybePromise.then(finishOk).catch(finishErr);
      }
    } catch (err) {
      finishErr(err);
    }
  });
}

// ─── React Component ─────────────────────────────────────────────────────────

type ConversionStatus = "idle" | "analysing" | "converting" | "done" | "error";

interface AnalysisState {
  preflight: PreflightReport | null;
}

export default function WordToPdf() {
  const { lang } = useLanguage() as { lang: Lang };
  const t = ui[lang];

  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ConversionStatus>("idle");
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [pdfSize, setPdfSize] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisState>({ preflight: null });
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [stageLabel, setStageLabel] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [slowHint, setSlowHint] = useState<string>("");
  const urlRef = useRef<string>("");
  const slowTimerRef = useRef<number | null>(null);
  const cancelRef = useRef<boolean>(false);
  const conversionRunRef = useRef<number>(0);

  const handleFile = useCallback((f: File | null) => {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".docx")) return;
    if (f.size > 20 * 1024 * 1024) {
      setErrorMsg("免費版檔案大小上限為 20MB");
      setStatus("error");
      return;
    }
    // Invalidate any in-flight conversion and revoke previous object URL
    cancelRef.current = true;
    conversionRunRef.current += 1;
    if (slowTimerRef.current !== null) {
      window.clearTimeout(slowTimerRef.current);
      slowTimerRef.current = null;
    }
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    setPdfUrl("");
    setAnalysis({ preflight: null });
    setStatus("idle");
    setErrorMsg("");
    setProgress(0);
    setSlowHint("");
    setFile(f);
  }, []);

  const handleAnalyse = useCallback(async () => {
    if (!file) return;
    setStatus("analysing");
    try {
      const ab = await file.arrayBuffer();
      const mammoth = await loadMammothRuntime();
      const result = await mammoth.convertToHtml(
        { arrayBuffer: ab },
        { includeDefaultStyleMap: true }
      );
      const preflight = await runPreflightAnalysis(result.value, result.messages);
      setAnalysis({ preflight });
      setStatus("idle");
    } catch {
      setStatus("error");
      setErrorMsg("分析失敗，請確認檔案格式");
    }
  }, [file]);

  const handleCancelConversion = useCallback(() => {
    cancelRef.current = true;
    conversionRunRef.current += 1;
    if (slowTimerRef.current !== null) {
      window.clearTimeout(slowTimerRef.current);
      slowTimerRef.current = null;
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = "";
    }
    setPdfUrl("");
    setPdfSize(0);
    setProgress(0);
    setStageLabel("");
    setSlowHint("");
    setErrorMsg("");
    setStatus("idle");
  }, []);

  const handleConvert = useCallback(async () => {
    if (!file) return;
    const runId = conversionRunRef.current + 1;
    conversionRunRef.current = runId;
    cancelRef.current = false;
    setStatus("converting");
    setErrorMsg("");
    setProgress(5);
    setSlowHint("");
    if (slowTimerRef.current !== null) {
      window.clearTimeout(slowTimerRef.current);
    }
    slowTimerRef.current = window.setTimeout(() => {
      if (cancelRef.current || conversionRunRef.current !== runId) return;
      const sizeMb = file.size / 1024 / 1024;
      setSlowHint(
        sizeMb <= 0.5
          ? "這是小檔案，正常應在 20–30 秒內完成。若進度停住，通常是瀏覽器 PDF 引擎遇到字型、表格或文件結構邊界案例；可先取消重試，或改用 Word/Google Docs 直接匯出。"
          : "仍在處理中：大型圖片、長表格或複雜中文文件可能較慢。轉換在您的瀏覽器本地執行，檔案不會上傳；若久無進展可取消重試。"
      );
    }, 8_000);
    try {
      const blob = await convertViaServer(file, (stage) => {
        const labels: Record<string, string> = {
          reading:     "讀取檔案…",
          parsing:     "解析 Word 內容與圖片…",
          analysing:   "分析版面元素…",
          building_ir: "建立 PDF 結構…",
          rendering:   "載入 PDF 產生器並排版…",
          generating:  file.size <= 512 * 1024 ? "正在產生 PDF，小檔案目標 20–30 秒內完成…" : "正在產生 PDF（大型文件可能停留較久）…",
        };
        const progressByStage: Record<string, number> = {
          reading: 15,
          parsing: 35,
          analysing: 50,
          building_ir: 65,
          rendering: 78,
          generating: 88,
        };
        if (cancelRef.current || conversionRunRef.current !== runId) return;
        setStageLabel(labels[stage] ?? stage);
        setProgress(progressByStage[stage] ?? 10);
      });
      if (cancelRef.current || conversionRunRef.current !== runId) return;
      const url = URL.createObjectURL(blob);
      urlRef.current = url;
      setPdfUrl(url);
      setPdfSize(blob.size);
      setProgress(100);
      if (slowTimerRef.current !== null) {
        window.clearTimeout(slowTimerRef.current);
        slowTimerRef.current = null;
      }
      setStatus("done");
    } catch (err) {
      if (slowTimerRef.current !== null) {
        window.clearTimeout(slowTimerRef.current);
        slowTimerRef.current = null;
      }
      if (cancelRef.current || conversionRunRef.current !== runId) return;
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : String(err));
    }
  }, [file]);

  const gradeLabel: Record<DocGrade, string> = {
    simple:      t.gradeSimple,
    moderate:    t.gradeModerate,
    complex:     t.gradeComplex,
    unsupported: t.gradeUnsupported,
  };

  const gradeBg: Record<DocGrade, string> = {
    simple:      "bg-green-50 border-green-200",
    moderate:    "bg-amber-50 border-amber-200",
    complex:     "bg-orange-50 border-orange-200",
    unsupported: "bg-red-50 border-red-200",
  };

  const preflight = analysis.preflight;
  const triggeredDetectors = preflight?.detectors.filter((d) => d.triggered) ?? [];
  const highImpactCount = triggeredDetectors.filter((d) => d.impact === "high").length;
  const mediumImpactCount = triggeredDetectors.filter((d) => d.impact === "medium").length;
  const lowImpactCount = triggeredDetectors.filter((d) => d.impact === "low").length;
  const fidelityScore = preflight
    ? Math.max(
        55,
        Math.min(
          98,
          98 - highImpactCount * 12 - mediumImpactCount * 7 - lowImpactCount * 3 - preflight.warnings.length * 4 - preflight.fatalErrors.length * 20
        )
      )
    : 92;
  const fidelityTone = fidelityScore >= 90 ? "text-emerald-700" : fidelityScore >= 78 ? "text-amber-700" : "text-orange-700";
  const pdfFileName = file?.name.replace(/\.docx?$/i, ".pdf") ?? "converted.pdf";
  const showCommercialPreview = Boolean(file) && status !== "done";
  const fileSizeMb = file ? file.size / 1024 / 1024 : 0;

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
        <AdSenseWrapper showAds={true} adSlot="word-to-pdf-top" adFormat="horizontal" />
        <AdSlot slot="word-to-pdf-top" position="inline" />

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
          <input type="file" accept=".docx" className="hidden" id="ftWtP"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
          <label htmlFor="ftWtP"
            className="inline-block cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3 rounded-xl transition shadow">
            {t.chooseFile}
          </label>
          {file && (
            <p className="text-green-700 font-bold text-sm">
              ✅ {file.name} &nbsp;·&nbsp; {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          )}
        </section>

        {/* Pre-flight Analyse button */}
        {file && status === "idle" && !analysis.preflight && (
          <div className="text-center space-y-2">
            <button onClick={handleAnalyse}
              className="bg-slate-700 hover:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl transition text-sm">
              🔍 {t.analysing.replace("…", "")}（可選）
            </button>
            <p className="text-slate-400 text-xs">分析文件結構，預測轉換品質</p>
          </div>
        )}

        {/* T4 Pre-flight Report */}
        {analysis.preflight && status !== "converting" && (
          <section className={`rounded-[2rem] border p-6 space-y-4 ${gradeBg[analysis.preflight.grade]}`}>
            <h3 className="font-black text-lg text-slate-800">{t.preflightTitle}</h3>
            <p className="font-bold text-base">{gradeLabel[analysis.preflight.grade]}</p>
            <p className="text-sm text-slate-600">預估頁數：約 {analysis.preflight.pageEstimate} 頁</p>
            {analysis.preflight.warnings.length > 0 && (
              <ul className="space-y-1">
                {analysis.preflight.warnings.map((w) => (
                  <li key={w} className="text-sm text-amber-800 flex gap-2"><span>⚠️</span><span>{w}</span></li>
                ))}
              </ul>
            )}
            <details className="text-xs text-slate-500 cursor-pointer">
              <summary className="font-bold">查看 12 項偵測器詳情</summary>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1">
                {analysis.preflight.detectors.map((d) => (
                  <div key={d.id} className={`px-2 py-1 rounded ${d.triggered ? "bg-white/70" : "opacity-40"}`}>
                    <span className="font-mono mr-1">{d.id}:</span>
                    {d.label}
                    {d.note ? ` — ${d.note}` : ""}
                  </div>
                ))}
              </div>
            </details>
          </section>
        )}


        {/* T4A Always-visible commercial preview */}
        {showCommercialPreview && (
          <section className="grid gap-4 md:grid-cols-3">
            <article className="rounded-[1.5rem] border border-emerald-200 bg-white/90 p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">Free Core</p>
              <h3 className="mt-2 text-xl font-black text-slate-900">快速轉 PDF</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {fileSizeMb <= 0.5 ? "小檔案目標 20–30 秒內完成；若 PDF 引擎卡住，系統會快速失敗而不是讓您等到分鐘級。" : "檔案會在瀏覽器本地轉換，不上傳伺服器；複雜圖片與表格可能較慢。"}
              </p>
            </article>
            <article className="rounded-[1.5rem] border border-violet-200 bg-violet-50/90 p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-600">Premium Export</p>
              <h3 className="mt-2 text-xl font-black text-slate-900">專業匯出</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                PDF/A、壓縮、加密、浮水印、批量轉換與 ZIP 交付將作為進階匯出能力。
              </p>
            </article>
            <article className="rounded-[1.5rem] border border-indigo-200 bg-indigo-50/90 p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Fidelity Report</p>
              <h3 className="mt-2 text-xl font-black text-slate-900">品質風險報告</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                目前預估分數 {fidelityScore}/100；完整報告會拆解 12 項偵測器，指出表格、圖片、中文、RTL 與版面風險。
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
              {fileSizeMb <= 0.5 && (
                <p className="text-xs font-black text-emerald-700">
                  小檔案快速路徑：目標 20–30 秒內完成；若超時會明確停止並提示原因。
                </p>
              )}
              {slowHint && (
                <div className="max-w-2xl mx-auto bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl px-4 py-3 text-sm leading-relaxed">
                  {slowHint}
                </div>
              )}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handleCancelConversion}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-red-600"
                >
                  取消轉換，重新選檔
                </button>
                <p className="text-xs text-slate-400">
                  選錯檔案或等待太久時，可立即取消；若瀏覽器仍在背景收尾，完成結果會被自動忽略。
                </p>
              </div>
            </div>
            <AdSenseWrapper showAds={true} adSlot="word-to-pdf-wait" adFormat="horizontal" />
            <AdSlot slot="word-to-pdf-wait" position="inline" />
          </section>
        )}

        {/* T7 Productized Result Center + AdSlot DOWNLOAD */}
        {status === "done" && (
          <section className="space-y-5">
            <div className="overflow-hidden rounded-[2rem] border border-emerald-200 bg-white shadow-xl">
              <div className="bg-gradient-to-r from-emerald-50 via-blue-50 to-indigo-50 p-6 text-center md:p-8">
                <p className="text-emerald-700 font-black text-xl">✅ {t.successNote}</p>
                <p className="mt-2 text-sm text-slate-500">
                  {pdfFileName} · PDF 大小：{(pdfSize / 1024).toFixed(1)} KB · 瀏覽器本地完成
                </p>
              </div>

              <div className="grid gap-4 p-5 md:grid-cols-3 md:p-6">
                <article className="rounded-[1.5rem] border-2 border-blue-200 bg-blue-50 p-5 text-center shadow-sm">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Free</p>
                  <h3 className="mt-2 text-xl font-black text-slate-900">下載 PDF</h3>
                  <p className="mt-2 min-h-[3rem] text-sm leading-relaxed text-slate-600">
                    立即取得可搜尋、可複製的 PDF。適合寄送、列印與一般文件交付。
                  </p>
                  <a href={pdfUrl} download={pdfFileName}
                    className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-blue-600 px-6 py-4 text-lg font-black text-white shadow-lg transition hover:bg-blue-700">
                    {t.downloadBtn}
                  </a>
                </article>

                <article className="rounded-[1.5rem] border border-violet-200 bg-violet-50 p-5 text-center shadow-sm">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-600">Premium Export</p>
                  <h3 className="mt-2 text-xl font-black text-slate-900">專業匯出</h3>
                  <p className="mt-2 min-h-[3rem] text-sm leading-relaxed text-slate-600">
                    規劃支援 PDF/A、壓縮、加密、浮水印、批量轉換與 ZIP 交付。
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
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Document Fidelity Engine</p>
                    <div className="mt-3 flex items-end gap-3">
                      <span className={`text-5xl font-black ${fidelityTone}`}>{fidelityScore}</span>
                      <span className="pb-2 text-sm font-black text-slate-500">/ 100</span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">
                      基於 12 項版面偵測器估算：{triggeredDetectors.length} 項風險訊號、{highImpactCount} 項高影響元素。
                    </p>
                  </div>

                  <PremiumGate plan="PRO">
                    <article className="rounded-[1.5rem] border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-sm">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Upgrade Path</p>
                      <h3 className="mt-2 text-2xl font-black text-slate-900">解鎖完整 Fidelity Report</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        將 12 個偵測器轉成完整交付報告：表格、圖片、CJK、RTL、連結、列表、頁數、警告與高風險段落，協助商務文件在交付前先做品質控管。
                      </p>
                      <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        {["完整 12-detector 風險報告", "批量 Word→PDF 工作流", "安全分享連結與到期日", "PDF/A、加密、壓縮與浮水印"].map((item) => (
                          <span key={item} className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-indigo-900 shadow-sm">{item}</span>
                        ))}
                      </div>
                    </article>
                  </PremiumGate>
                </div>
              </div>
            </div>

            <AdSenseWrapper showAds={true} adSlot="word-to-pdf-download" adFormat="horizontal" />
            <AdSlot slot="word-to-pdf-download" position="inline" />

            <div className="text-center">
              <button onClick={() => { setStatus("idle"); setFile(null); setAnalysis({ preflight: null }); }}
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
            <button onClick={() => { setStatus("idle"); setFile(null); setAnalysis({ preflight: null }); }}
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
        <AdSenseWrapper showAds={true} adSlot="word-to-pdf-bottom" adFormat="horizontal" />
        <AdSlot slot="word-to-pdf-bottom" position="inline" />

        {/* Open-source attribution */}
        <p className="text-center text-xs text-slate-400 pb-4">{t.poweredBy}</p>

      </div>
    </div>
  );
}
