/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║  Formula Universe — PdfToMarkdown Converter              ║
 * ║  Architecture: pdfjs-dist → SpatialAnalyser →           ║
 * ║                StructureDetector → MarkdownEmitter       ║
 * ║                                                          ║
 * ║  Audited & corrected before deploy (SuperNinja):         ║
 * ║   - Ad blocks use AdSenseWrapper (golden-template form)   ║
 * ║   - strict-mode type-guard hardened (TextItem narrowing)  ║
 * ║   - named export added in toolsConfig                     ║
 * ╚══════════════════════════════════════════════════════════╝
 */
import { useState, useCallback, useRef } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type DocGrade = "simple" | "moderate" | "complex" | "scanned";
type Status = "idle" | "analysing" | "converting" | "done" | "error";

// ── i18n ─────────────────────────────────────────────────────
const ui = {
  zh: {
    title: "PDF 轉 Markdown",
    subtitle: "免費線上 PDF 轉 Markdown，瀏覽器執行，適合 AI 知識庫建立與 RAG 前處理",
    badge1: "完全免費", badge2: "瀏覽器執行", badge3: "AI 友善輸出",
    uploadLabel: "上傳 PDF 檔案",
    uploadHint: "支援 .pdf 格式，免費版最大 20MB",
    dragHint: "拖放至此，或點擊選擇",
    chooseFile: "選擇檔案",
    analyseBtn: "分析文件（可選）",
    convertBtn: "開始轉換",
    converting: "轉換中，請稍候…",
    downloadBtn: "⬇ 下載 Markdown",
    reupload: "重新上傳",
    successNote: "轉換完成 · 可直接餵給 AI / LLM",
    errorTitle: "轉換失敗",
    errorHint: "請確認檔案為有效 .pdf 格式，且非掃描圖片型 PDF",
    privacyTitle: "🔒 隱私保障",
    privacyDesc: "所有轉換在您的瀏覽器本地執行。檔案不上傳至任何伺服器，轉換完成後不留存任何資料。",
    premiumTitle: "Premium 進階功能",
    premiumDesc: "批量轉換多個 PDF、保留表格結構、保留標題層級 H1/H2/H3、50MB 大檔支援",
    gradeSimple:   "🟢 純文字 PDF — 預期 90%+ 還原度",
    gradeModerate: "🟡 含表格或圖片 — 預期 70~80% 還原度",
    gradeComplex:  "🟠 複雜版面 — 預期 60% 還原度，建議確認",
    gradeScanned:  "🔴 掃描圖片型 PDF — 無法提取文字，需要 OCR",
    kbTitle: "📚 PDF 轉 Markdown 知識庫",
    kbWhatTitle: "💡 什麼是 Markdown？",
    kbWhat: "Markdown 是一種輕量標記語言，用 # 表示標題、**文字** 表示粗體。廣泛用於 AI 知識庫、GitHub、技術文件與內容管理系統。",
    kbWhenTitle: "✅ 最適合的情況",
    kbWhen: [
      "建立 AI 知識庫（RAG 應用前處理）",
      "將研究報告轉為可編輯格式",
      "提取 PDF 文字供 LLM 分析與摘要",
      "將文件轉為 Notion / Obsidian 可讀格式",
      "技術文件整理與版本控管",
    ],
    kbQualityTitle: "⚠️ 轉換品質說明",
    kbQuality: [
      "🟢 純文字 PDF → 90%+ 還原，標題層級自動偵測",
      "🟢 表格／接腳表 → 自動欄位偵測重建為 Markdown 表格",
      "🟢 粗體／斜體 → 依字型自動還原；巢狀清單依縮排還原",
      "🟢 目錄點線頁碼 → 自動清洗為「標題 頁碼」",
      "🟠 複雜跨欄合併儲存格 → 啟發式重建，建議人工校對",
      "🔴 流程圖／狀態機圖 → 向量圖形先天無文字層，僅保留文字標籤",
      "🔴 掃描圖片型 PDF → 無文字層，需要 OCR 工具",
    ],
    kbNotTitle: "❌ 不支援",
    kbNot: [
      "掃描圖片型 PDF（無文字層）",
      "密碼保護的 PDF",
      "圖表、數學公式（轉為純文字）",
    ],
    kbAdvTitle: "🔧 進階用途",
    kbAdv: "需要更高品質的 PDF 前處理（保留版面、支援 bounding box、企業批量處理）？",
    kbAdvLink: "查看 OpenDataLoader 實戰指南 →",
    kbAdvHref: "/knowledge/ai-tools/opendataloader-jar-direct-call-guide",
    faqTitle: "常見問題",
    faqs: [
      { q: "轉換出來的 Markdown 可以直接餵給 ChatGPT / Claude 嗎？",
        a: "可以。Markdown 是 LLM 最容易理解的格式之一，轉換後可直接貼入對話或用作 RAG 知識庫的素材。" },
      { q: "PDF 有加密或密碼保護，可以轉換嗎？",
        a: "無法。請先在 Adobe Reader 或其他 PDF 工具移除密碼保護，再上傳轉換。" },
      { q: "掃描的 PDF 可以轉換嗎？",
        a: "無法。掃描 PDF 只有圖片，沒有文字層，需要 OCR（光學字元識別）工具處理。本工具只能處理含有文字層的 PDF。" },
      { q: "標題層級（H1、H2、H3）會自動偵測嗎？",
        a: "免費版提供基本標題偵測（依字體大小比例判斷）。Premium 版提供更精確的多層標題識別。" },
      { q: "我的 PDF 檔案安全嗎？",
        a: "完全安全。所有轉換在您的瀏覽器執行，檔案不會上傳至任何伺服器。" },
    ],
    relatedTitle: "相關轉換工具",
    related: [
      { name: "Word 轉 PDF", path: "/tools/converter/word-to-pdf", desc: "免費將 Word 文件轉為向量 PDF" },
      { name: "PDF 轉 Word", path: "/tools/converter/pdf-to-word", desc: "PDF 還原為可編輯 Word 文件" },
    ],
    poweredBy: "本工具採用開源技術：PDF.js by Mozilla（Apache 2.0）",
    pages: "頁",
    chars: "字元",
  },
  en: {
    title: "PDF to Markdown",
    subtitle: "Free online PDF to Markdown converter. Browser-based, AI-ready output for RAG and LLM workflows.",
    badge1: "100% Free", badge2: "Browser-based", badge3: "AI-ready Output",
    uploadLabel: "Upload PDF File",
    uploadHint: "Supports .pdf format. Free tier: max 20MB.",
    dragHint: "Drag & drop here, or click to browse",
    chooseFile: "Choose File",
    analyseBtn: "Analyse Document (optional)",
    convertBtn: "Convert Now",
    converting: "Converting, please wait…",
    downloadBtn: "⬇ Download Markdown",
    reupload: "Upload another file",
    successNote: "Conversion complete · Ready for AI / LLM input",
    errorTitle: "Conversion Failed",
    errorHint: "Please ensure the file is a valid .pdf with a text layer (not a scanned image PDF).",
    privacyTitle: "🔒 Privacy Guarantee",
    privacyDesc: "All conversion runs locally in your browser. Your file is never uploaded to any server.",
    premiumTitle: "Premium Features",
    premiumDesc: "Batch conversion, H1/H2/H3 heading preservation, table structure, 50MB large files",
    gradeSimple:   "🟢 Plain text PDF — expected 90%+ fidelity",
    gradeModerate: "🟡 Contains tables or images — expected 70~80% fidelity",
    gradeComplex:  "🟠 Complex layout — expected 60% fidelity, manual review recommended",
    gradeScanned:  "🔴 Scanned image PDF — no text layer, OCR required",
    kbTitle: "📚 PDF to Markdown Knowledge Base",
    kbWhatTitle: "💡 What is Markdown?",
    kbWhat: "Markdown is a lightweight markup language using # for headings and **text** for bold. Widely used in AI knowledge bases, GitHub, technical documentation, and content management systems.",
    kbWhenTitle: "✅ Best use cases",
    kbWhen: [
      "Building AI knowledge bases (RAG pre-processing)",
      "Converting research papers to editable format",
      "Extracting text for LLM analysis and summarisation",
      "Importing documents into Notion / Obsidian",
      "Technical documentation and version control",
    ],
    kbQualityTitle: "⚠️ Conversion quality guide",
    kbQuality: [
      "🟢 Plain text PDF → 90%+ fidelity, headings auto-detected",
      "🟢 Tables / pinout → auto column detection, rebuilt as Markdown tables",
      "🟢 Bold / italic → restored from font; nested lists from indentation",
      "🟢 TOC dotted leaders → cleaned to 'Title page-number'",
      "🟠 Complex merged-cell tables → heuristic rebuild, manual review advised",
      "🔴 Flowcharts / state diagrams → vector graphics have no text layer; only labels kept",
      "🔴 Scanned image PDF → no text layer, OCR required",
    ],
    kbNotTitle: "❌ Not supported",
    kbNot: [
      "Scanned image PDFs (no text layer)",
      "Password-protected PDFs",
      "Charts and mathematical formulas (converted to plain text)",
    ],
    kbAdvTitle: "🔧 Advanced usage",
    kbAdv: "Need higher-quality PDF pre-processing (layout preservation, bounding box, enterprise batch)?",
    kbAdvLink: "View OpenDataLoader Practical Guide →",
    kbAdvHref: "/knowledge/ai-tools/opendataloader-jar-direct-call-guide",
    faqTitle: "FAQ",
    faqs: [
      { q: "Can I feed the output Markdown directly to ChatGPT or Claude?",
        a: "Yes. Markdown is one of the most LLM-friendly formats. The output can be pasted directly into a conversation or used as RAG knowledge base material." },
      { q: "Can I convert a password-protected PDF?",
        a: "No. Please remove the password protection in Adobe Reader or another PDF tool before uploading." },
      { q: "Can I convert a scanned PDF?",
        a: "No. Scanned PDFs are image-based with no text layer and require OCR (Optical Character Recognition). This tool only processes PDFs with an embedded text layer." },
      { q: "Will headings (H1, H2, H3) be automatically detected?",
        a: "Free tier: basic heading detection based on font size ratios. Premium: more accurate multi-level heading recognition." },
      { q: "Is my PDF safe?",
        a: "Completely safe. All conversion runs in your browser — your file is never uploaded to any server." },
    ],
    relatedTitle: "Related Converter Tools",
    related: [
      { name: "Word to PDF", path: "/tools/converter/word-to-pdf", desc: "Convert Word documents to vector PDF" },
      { name: "PDF to Word", path: "/tools/converter/pdf-to-word", desc: "Restore PDF to editable Word document" },
    ],
    poweredBy: "Powered by PDF.js by Mozilla (Apache 2.0)",
    pages: "pages",
    chars: "chars",
  },
} as const;

// ── PDF 文字項目型別 ──────────────────────────────────────────
// 與 pdfjs-dist v6 TextItem 結構相容（含 dir，避免 strict 下型別謂詞不相容）
interface PdfTextItem {
  str: string;
  dir?: string;
  transform: number[];  // [scaleX, skewX, skewY, scaleY, x, y]
  width: number;
  height: number;
  fontName: string;
  hasEOL: boolean;
}

interface PageTextData {
  items: PdfTextItem[];
  pageWidth: number;
  pageHeight: number;
}

// 安全型別守衛：把 pdfjs union 窄化為 PdfTextItem（不依賴形狀完全相等）
function isTextItem(item: unknown): item is PdfTextItem {
  if (typeof item !== "object" || item === null) return false;
  const o = item as Record<string, unknown>;
  return typeof o.str === "string" && Array.isArray(o.transform);
}

// ── 文件品質預測 ──────────────────────────────────────────────
function detectDocGrade(pages: PageTextData[]): DocGrade {
  const totalItems = pages.reduce((s, p) => s + p.items.length, 0);
  if (totalItems === 0) return "scanned";

  const allItems = pages.flatMap(p => p.items);
  if (allItems.length === 0) return "scanned";
  const avgCharsPerItem = allItems.reduce((s, i) => s + i.str.length, 0) / allItems.length;

  // 多欄偵測：X 座標分布廣且段落短
  const xPositions = allItems.map(i => i.transform[4] ?? 0);
  const xMin = Math.min(...xPositions);
  const xMax = Math.max(...xPositions);
  const xRange = xMax - xMin;
  const pageWidth = pages[0]?.pageWidth ?? 600;
  const likelyMultiCol = xRange > pageWidth * 0.6 && avgCharsPerItem < 30;

  // 表格偵測：多行高度相同且 X 對齊
  const heights = allItems.map(i => Math.round(i.height * 10) / 10);
  const heightFreq = heights.reduce((acc, h) => {
    acc[h] = (acc[h] ?? 0) + 1; return acc;
  }, {} as Record<number, number>);
  const freqValues = Object.values(heightFreq);
  const maxFreq = freqValues.length ? Math.max(...freqValues) : 0;
  const likelyTable = maxFreq > allItems.length * 0.3 && allItems.length > 20;

  if (totalItems < 5) return "scanned";
  if (likelyMultiCol) return "complex";
  if (likelyTable) return "moderate";
  return "simple";
}

// ── 核心轉換：PDF 文字層 → Markdown ──────────────────────────
async function convertPdfToMarkdown(
  file: File,
  onStage: (s: string) => void
): Promise<{ markdown: string; grade: DocGrade; pageCount: number }> {

  onStage("loading");
  // 動態載入 pdfjs-dist，避免首屏 bundle 增大
  const pdfjsLib = await import("pdfjs-dist");
  // Worker 設定（Vite 靜態資源方式）
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

  onStage("parsing");
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({
    data: arrayBuffer,
    cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist/cmaps/",
    cMapPacked: true,
    // 停用字型渲染（純文字提取不需要）
    disableFontFace: true,
  }).promise;

  const pageCount = pdf.numPages;
  const pages: PageTextData[] = [];

  onStage("extracting");
  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.0 });
    const textContent = await page.getTextContent();
    pages.push({
      // pdfjs items 為 (TextItem | TextMarkedContent)[]，先轉 unknown[] 讓自訂守衛正確收斂
      items: (textContent.items as unknown[]).filter(isTextItem),
      pageWidth: viewport.width,
      pageHeight: viewport.height,
    });
  }

  onStage("analysing");
  const grade = detectDocGrade(pages);

  onStage("building");
  const markdown = buildMarkdown(pages);

  return { markdown, grade, pageCount };
}

// ── 結構型別（LEVEL 1/2 欄位偵測用）─────────────────────────
interface Cell { text: string; x: number; xEnd: number; fontSize: number; fontName: string; }
interface Row { cells: Cell[]; y: number; fontSize: number; x: number; }

// 清洗目錄點線頁碼："Title ......... 12" → "Title 12"
function cleanTocLeader(text: string): string {
  // 連續 3+ 個點 / Unicode 省略號 / 中點，後面接頁碼
  const cleaned = text
    .replace(/[ \t]*\.{3,}[ \t]*(\d+)\s*$/, " $1")
    .replace(/[ \t]*(?:\u2026|\u00b7){2,}[ \t]*(\d+)\s*$/, " $1");
  // 收斂多餘空白（避免清洗後留下雙空格）
  return cleaned.replace(/[ \t]{2,}/g, " ");
}

// ── LEVEL 2：用 fontName 還原粗體/斜體 ────────────────────────
function applyInlineStyle(text: string, fontName: string): string {
  if (!text.trim()) return text;
  const fn = (fontName || "").toLowerCase();
  const bold = /bold|black|heavy|semibold|\bsb\b/.test(fn);
  const italic = /italic|oblique/.test(fn);
  // 不對已是標題/表格分隔的內容套用（呼叫端會避開）
  let out = text;
  if (bold && italic) out = `***${out}***`;
  else if (bold) out = `**${out}**`;
  else if (italic) out = `*${out}*`;
  return out;
}

// ── Markdown 建構器（LEVEL 1 表格偵測 + TOC 清洗；LEVEL 2 行內樣式 + 巢狀列表）──
function buildMarkdown(pages: PageTextData[]): string {
  const out: string[] = [];

  // 全域字體大小統計（用於標題偵測）
  const allItems = pages.flatMap(p => p.items);
  const fontSizes = allItems.map(i => Math.abs(i.transform[3] ?? 0)).filter(s => s > 0);
  const avgFontSize = fontSizes.length
    ? fontSizes.reduce((a, b) => a + b, 0) / fontSizes.length
    : 12;
  const maxFontSize = fontSizes.length ? Math.max(...fontSizes, avgFontSize) : avgFontSize;

  for (let pi = 0; pi < pages.length; pi++) {
    const page = pages[pi];
    if (!page) continue;
    if (pi > 0) out.push("\n---\n");  // 頁面分隔

    // 1) 依 Y（上→下）、X（左→右）排序
    const sorted = [...page.items].sort((a, b) => {
      const ya = page.pageHeight - (a.transform[5] ?? 0);
      const yb = page.pageHeight - (b.transform[5] ?? 0);
      if (Math.abs(ya - yb) > 3) return ya - yb;
      return (a.transform[4] ?? 0) - (b.transform[4] ?? 0);
    });

    // 2) 組成「列 → 多個 cell」，保留每個 token 的 X 起訖（欄位偵測關鍵）
    const rows: Row[] = [];
    // 同欄位內 token 之間的空隙閾值（小於此視為同一 cell 連續文字）
    const SAME_CELL_GAP = avgFontSize * 0.6;
    for (const item of sorted) {
      const str = item.str;
      if (!str.trim()) continue;
      const y = Math.round((page.pageHeight - (item.transform[5] ?? 0)) * 10) / 10;
      const fontSize = Math.abs(item.transform[3] ?? 0) || avgFontSize;
      const x = item.transform[4] ?? 0;
      const w = item.width ?? (str.length * fontSize * 0.5);
      const xEnd = x + w;
      const fontName = item.fontName ?? "";

      const lastRow = rows[rows.length - 1];
      if (lastRow && Math.abs(lastRow.y - y) < 3) {
        const lastCell = lastRow.cells[lastRow.cells.length - 1];
        const gap = lastCell ? x - lastCell.xEnd : 0;
        if (lastCell && gap < SAME_CELL_GAP) {
          // 同一 cell 的連續文字
          const needSpace = gap > fontSize * 0.15 && !lastCell.text.endsWith(" ") && !str.startsWith(" ");
          lastCell.text += (needSpace ? " " : "") + str;
          lastCell.xEnd = xEnd;
          lastCell.fontSize = Math.max(lastCell.fontSize, fontSize);
        } else {
          // 明顯空隙 → 新的 cell（潛在欄位邊界）
          lastRow.cells.push({ text: str, x, xEnd, fontSize, fontName });
        }
        lastRow.fontSize = Math.max(lastRow.fontSize, fontSize);
      } else {
        rows.push({ cells: [{ text: str, x, xEnd, fontSize, fontName }], y, fontSize, x });
      }
    }

    // 3) 逐列輸出，但先用「表格偵測」掃描連續的多 cell 列群組
    let i = 0;
    let prevY = -1;
    while (i < rows.length) {
      const row = rows[i];

      // ── 表格偵測：從 i 起，連續 ≥2 列、每列都 ≥2 cell、且欄位 X 大致對齊 ──
      const block: Row[] = [];
      let j = i;
      while (j < rows.length && rows[j].cells.length >= 2) {
        block.push(rows[j]);
        j++;
      }
      const isTable = block.length >= 2 && columnsAligned(block);

      if (isTable) {
        emitTable(out, block);
        // 表格後留白
        out.push("");
        prevY = block[block.length - 1].y;
        i = j;
        continue;
      }

      // ── 非表格：單一行文字（把該列所有 cell 串起來）──
      const merged = row.cells.map(c => c.text).join(" ").replace(/\s+/g, " ").trim();
      const text = cleanTocLeader(merged);
      if (!text) { i++; continue; }

      const ratio = avgFontSize > 0 ? row.fontSize / avgFontSize : 1;
      let mdLine: string;

      if (ratio >= 1.8 || (ratio >= 1.5 && row.fontSize === maxFontSize)) {
        mdLine = `# ${text}`;
      } else if (ratio >= 1.4) {
        mdLine = `## ${text}`;
      } else if (ratio >= 1.2) {
        mdLine = `### ${text}`;
      } else if (/^[•‧·\-*]\s/.test(text)) {
        // LEVEL 2：巢狀列表縮排（依 X 起點，每 ~18pt 一層）
        const indent = Math.max(0, Math.min(3, Math.round((row.x - minX(rows)) / 18)));
        mdLine = `${"  ".repeat(indent)}- ${styleInline(text.replace(/^[•‧·\-*]\s*/, ""), row)}`;
      } else if (/^\d+[.。]\s/.test(text)) {
        const indent = Math.max(0, Math.min(3, Math.round((row.x - minX(rows)) / 18)));
        mdLine = `${"  ".repeat(indent)}${styleInline(text.replace(/^(\d+)[.。]\s*/, "$1. "), row)}`;
      } else {
        mdLine = styleInline(text, row);
      }

      const yGap = row.y - prevY;
      if (prevY > 0 && yGap > row.fontSize * 1.8) out.push("");
      out.push(mdLine);
      prevY = row.y;
      i++;
    }
  }

  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

// 取整頁最小 X（巢狀列表縮排基準）
function minX(rows: Row[]): number {
  let m = Infinity;
  for (const r of rows) if (r.x < m) m = r.x;
  return Number.isFinite(m) ? m : 0;
}

// LEVEL 2：對單列套用行內樣式（只在單一 cell 且非 TOC 時，避免破壞表格/標題）
function styleInline(text: string, row: Row): string {
  if (row.cells.length === 1) {
    return applyInlineStyle(text, row.cells[0]?.fontName ?? "");
  }
  return text;
}

// ── 欄位對齊偵測：判斷一組列是否構成表格 ──────────────────────
function columnsAligned(block: Row[]): boolean {
  // 收集所有 cell 的 X 起點，分群成欄位
  const allX: number[] = [];
  for (const r of block) for (const c of r.cells) allX.push(c.x);
  if (allX.length < 4) return false;

  const cols = clusterPositions(allX, 12); // 12pt 容差視為同欄
  if (cols.length < 2) return false;

  // 至少一半的列要有 ≥2 個 cell 落在不同欄 → 才算表格
  let multiColRows = 0;
  for (const r of block) {
    const hit = new Set<number>();
    for (const c of r.cells) {
      const ci = nearestCluster(cols, c.x, 14);
      if (ci >= 0) hit.add(ci);
    }
    if (hit.size >= 2) multiColRows++;
  }
  return multiColRows >= Math.max(2, Math.ceil(block.length * 0.5));
}

// 一維座標分群（回傳每群中心，已排序）
function clusterPositions(xs: number[], tol: number): number[] {
  const sortedX = [...xs].sort((a, b) => a - b);
  const centers: number[] = [];
  let cur: number[] = [];
  for (const x of sortedX) {
    if (cur.length === 0 || x - cur[cur.length - 1] <= tol) {
      cur.push(x);
    } else {
      centers.push(cur.reduce((a, b) => a + b, 0) / cur.length);
      cur = [x];
    }
  }
  if (cur.length) centers.push(cur.reduce((a, b) => a + b, 0) / cur.length);
  return centers;
}

function nearestCluster(centers: number[], x: number, tol: number): number {
  let best = -1, bestD = Infinity;
  for (let i = 0; i < centers.length; i++) {
    const d = Math.abs(centers[i] - x);
    if (d < bestD) { bestD = d; best = i; }
  }
  return bestD <= tol ? best : -1;
}

// ── 把對齊的列群組輸出成 Markdown 表格 ────────────────────────
function emitTable(out: string[], block: Row[]): void {
  const allX: number[] = [];
  for (const r of block) for (const c of r.cells) allX.push(c.x);
  const cols = clusterPositions(allX, 12);
  const nCols = cols.length;

  // 每列：把 cell 依最近欄位放入對應格
  const grid: string[][] = [];
  for (const r of block) {
    const cells = new Array<string>(nCols).fill("");
    for (const c of r.cells) {
      const ci = nearestCluster(cols, c.x, 20);
      const idx = ci >= 0 ? ci : 0;
      const txt = c.text.replace(/\|/g, "\\|").trim();
      cells[idx] = cells[idx] ? `${cells[idx]} ${txt}` : txt;
    }
    grid.push(cells);
  }

  // 過濾完全空白列
  const rowsOut = grid.filter(r => r.some(c => c.trim() !== ""));
  if (rowsOut.length < 2) {
    // 退化：當作普通段落輸出
    for (const r of rowsOut) out.push(r.filter(Boolean).join(" "));
    return;
  }

  const header = rowsOut[0];
  out.push(`| ${header.map(c => c || " ").join(" | ")} |`);
  out.push(`| ${header.map(() => "---").join(" | ")} |`);
  for (let k = 1; k < rowsOut.length; k++) {
    out.push(`| ${rowsOut[k].map(c => c || " ").join(" | ")} |`);
  }
}

// ── React Component ───────────────────────────────────────────
export default function PdfToMarkdown() {
  const { lang } = useLanguage() as { lang: Lang };
  const t = ui[lang];

  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [grade, setGrade] = useState<DocGrade | null>(null);
  const [mdContent, setMdContent] = useState<string>("");
  const [mdUrl, setMdUrl] = useState<string>("");
  const [pageCount, setPageCount] = useState<number>(0);
  const [stageLabel, setStageLabel] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const urlRef = useRef<string>("");

  const stageLabels: Record<string, string> = {
    loading:    "載入 PDF 解析引擎…",
    parsing:    "解析 PDF 文件…",
    extracting: "提取文字層…",
    analysing:  "分析文件結構…",
    building:   "建構 Markdown…",
  };

  const handleFile = useCallback((f: File | null) => {
    if (!f || !f.name.toLowerCase().endsWith(".pdf")) return;
    if (f.size > 20 * 1024 * 1024) {
      setErrorMsg("免費版最大 20MB");
      setStatus("error");
      return;
    }
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    setMdUrl(""); setMdContent(""); setGrade(null);
    setStatus("idle"); setErrorMsg(""); setFile(f);
  }, []);

  const handleConvert = useCallback(async () => {
    if (!file) return;
    setStatus("converting"); setErrorMsg("");
    try {
      const { markdown, grade: g, pageCount: pc } =
        await convertPdfToMarkdown(file, (s) => setStageLabel(stageLabels[s] ?? s));
      const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      urlRef.current = url;
      setMdUrl(url); setMdContent(markdown);
      setGrade(g); setPageCount(pc);
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : String(err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  const gradeText: Record<DocGrade, string> = {
    simple:   t.gradeSimple,
    moderate: t.gradeModerate,
    complex:  t.gradeComplex,
    scanned:  t.gradeScanned,
  };
  const gradeBg: Record<DocGrade, string> = {
    simple:   "bg-green-50 border-green-200",
    moderate: "bg-amber-50 border-amber-200",
    complex:  "bg-orange-50 border-orange-200",
    scanned:  "bg-red-50 border-red-200",
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#e0f2fe,_#f8fafc_45%,_#ede9fe)] font-sans">
      <div className="mx-auto max-w-7xl px-4 py-10 space-y-7">

        {/* T1 Hero */}
        <section className="text-center space-y-4">
          <h1 className="text-4xl font-black text-slate-900 leading-tight">{t.title}</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">{t.subtitle}</p>
          <div className="flex justify-center gap-3 flex-wrap">
            {[t.badge1, t.badge2, t.badge3].map(b => (
              <span key={b} className="bg-indigo-100 text-indigo-800 text-sm font-bold px-4 py-1.5 rounded-full">{b}</span>
            ))}
          </div>
        </section>

        {/* T2 AdSlot TOP */}
        <AdSenseWrapper showAds={true} adSlot="pdf-to-markdown-top" adFormat="horizontal" />

        {/* T3 Upload Zone */}
        <section
          className={`rounded-[2rem] border-2 border-dashed p-10 text-center space-y-4 transition-colors ${
            isDragging ? "border-indigo-500 bg-indigo-50" : "border-indigo-300 bg-white"
          }`}
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={e => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files?.[0] ?? null); }}
        >
          <div className="text-6xl select-none">📄</div>
          <p className="font-black text-xl text-slate-800">{t.uploadLabel}</p>
          <p className="text-slate-500 text-sm">{t.uploadHint}</p>
          <p className="text-slate-400 text-sm">{t.dragHint}</p>
          <input type="file" accept=".pdf" className="hidden" id="ftPtM"
            onChange={e => handleFile(e.target.files?.[0] ?? null)} />
          <label htmlFor="ftPtM"
            className="inline-block cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-3 rounded-xl transition shadow">
            {t.chooseFile}
          </label>
          {file && (
            <p className="text-green-700 font-bold text-sm">
              ✅ {file.name} &nbsp;·&nbsp; {(file.size/1024/1024).toFixed(2)} MB
            </p>
          )}
        </section>

        {/* T4 品質燈號（轉換完成後顯示）*/}
        {grade && status === "done" && (
          <section className={`rounded-[2rem] border p-5 ${gradeBg[grade]}`}>
            <p className="font-bold text-base">{gradeText[grade]}</p>
            <p className="text-slate-500 text-sm mt-1">
              {pageCount} {t.pages} · {mdContent.length.toLocaleString()} {t.chars}
            </p>
          </section>
        )}

        {/* T5 Convert Button */}
        {file && status === "idle" && (
          <div className="text-center">
            <button onClick={handleConvert}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xl px-12 py-5 rounded-[2rem] transition shadow-lg">
              {t.convertBtn}
            </button>
          </div>
        )}

        {/* T6 Progress + AdSlot WAIT */}
        {status === "converting" && (
          <section className="space-y-6">
            <div className="text-center space-y-3">
              <p className="font-black text-xl text-indigo-700 animate-pulse">{t.converting}</p>
              <p className="text-slate-500 text-sm">{stageLabel}</p>
              <div className="w-full max-w-md mx-auto bg-indigo-100 rounded-full h-2 overflow-hidden">
                <div className="bg-indigo-500 h-2 rounded-full animate-pulse" style={{ width: "75%" }} />
              </div>
            </div>
            <AdSenseWrapper showAds={true} adSlot="pdf-to-markdown-wait" adFormat="horizontal" />
          </section>
        )}

        {/* T7 Result + AdSlot DOWNLOAD */}
        {status === "done" && (
          <section className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-[2rem] p-8 text-center space-y-4">
              <p className="text-green-700 font-black text-xl">✅ {t.successNote}</p>
              <AdSenseWrapper showAds={true} adSlot="pdf-to-markdown-download" adFormat="horizontal" />
              <a href={mdUrl} download={file?.name.replace(/\.pdf$/i, ".md")}
                className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xl px-12 py-5 rounded-[2rem] transition shadow-lg">
                {t.downloadBtn}
              </a>
              {/* Markdown 預覽（前300字元）*/}
              {mdContent && (
                <div className="text-left bg-slate-900 rounded-2xl p-4 mt-2 overflow-auto max-h-48">
                  <pre className="text-green-300 text-xs font-mono whitespace-pre-wrap">
                    {mdContent.slice(0, 300)}{mdContent.length > 300 ? "\n…" : ""}
                  </pre>
                </div>
              )}
              <button onClick={() => { setStatus("idle"); setFile(null); setGrade(null); }}
                className="text-sm text-slate-400 hover:text-slate-600 underline">
                {t.reupload}
              </button>
            </div>
          </section>
        )}

        {/* Error */}
        {status === "error" && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-3">
            <p className="text-red-700 font-black text-lg">❌ {t.errorTitle}</p>
            <p className="text-slate-600 text-sm">{t.errorHint}</p>
            {errorMsg && <p className="font-mono text-xs text-red-400 break-all">{errorMsg}</p>}
            <button onClick={() => { setStatus("idle"); setFile(null); }}
              className="text-sm text-blue-600 hover:text-blue-800 underline">{t.reupload}</button>
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
        <section className="bg-indigo-50 border border-indigo-200 rounded-[2rem] p-8 space-y-6">
          <h2 className="text-2xl font-black text-indigo-900">{t.kbTitle}</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-3">
              <h3 className="font-black text-indigo-800">{t.kbWhatTitle}</h3>
              <p className="text-sm text-slate-700 leading-relaxed">{t.kbWhat}</p>
              <h3 className="font-black text-green-800 mt-4">{t.kbWhenTitle}</h3>
              <ul className="space-y-1.5">
                {t.kbWhen.map(item => (
                  <li key={item} className="text-sm text-slate-700 flex gap-2 leading-relaxed">
                    <span className="text-green-600 shrink-0">▸</span><span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-black text-amber-800">{t.kbQualityTitle}</h3>
              <ul className="space-y-1.5">
                {t.kbQuality.map(item => (
                  <li key={item} className="text-sm text-slate-700 leading-relaxed">{item}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-black text-red-800">{t.kbNotTitle}</h3>
              <ul className="space-y-1.5">
                {t.kbNot.map(item => (
                  <li key={item} className="text-sm text-slate-700 flex gap-2 leading-relaxed">
                    <span className="text-red-500 shrink-0">✗</span><span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-indigo-200 space-y-2">
                <h3 className="font-black text-indigo-800 text-sm">{t.kbAdvTitle}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{t.kbAdv}</p>
                <a href={t.kbAdvHref}
                  className="inline-block text-xs font-bold text-indigo-700 hover:text-indigo-900 underline">
                  {t.kbAdvLink}
                </a>
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
                className="bg-white border border-slate-200 rounded-2xl p-4 hover:border-indigo-300 hover:shadow-md transition block">
                <p className="font-bold text-indigo-700">{name}</p>
                <p className="text-slate-500 text-sm mt-0.5">{desc}</p>
              </a>
            ))}
          </div>
        </section>

        {/* T13 AdSlot BOTTOM */}
        <AdSenseWrapper showAds={true} adSlot="pdf-to-markdown-bottom" adFormat="horizontal" />

        <p className="text-center text-xs text-slate-400 pb-4">{t.poweredBy}</p>

      </div>
    </div>
  );
}
