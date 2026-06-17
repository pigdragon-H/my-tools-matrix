/**
 * ╔═══════════════════════════════════════════════════════════════════════╗
 * ║  Formula Universe — PDF → Word「版面凍結 (Freeze Layout)」server engine ║
 * ║                                                                       ║
 * ║  目標：產生「排版跟原版一模一樣的 Word」（像素級保真、不可編輯）。       ║
 * ║                                                                       ║
 * ║  做法：                                                                ║
 * ║   1. pdftoppm 把每頁渲染成高解析 PNG。                                  ║
 * ║   2. (可選) 自動表頭置中：偵測頂端「商標+全銜」顯著高的標題行，量測其     ║
 * ║      內容中心與頁面中心的差距，整體平移使其置中。門檻全為比例、無寫死。   ║
 * ║   3. 用 jszip 組出 .docx：每頁尺寸 = 實際像素 ÷ DPI（pt），邊界=0，      ║
 * ║      圖片以浮動錨點固定在 page (0,0)、wrapNone → 零位移、不縮放。        ║
 * ║                                                                       ║
 * ║  與黃金模板 (pdfToWord.ts) 一致：隔離 temp dir、硬 timeout、保證清理。   ║
 * ║                                                                       ║
 * ║  保真關鍵：                                                            ║
 * ║   - 頁面尺寸由「實際渲染像素」反推，而非 pdfinfo 的理論尺寸，避免 Word    ║
 * ║     縮放重新置中造成位移。                                              ║
 * ║   - INLINE 圖會被段落基線往右推 ~8.6pt；改用 <wp:anchor> 絕對定位於      ║
 * ║     (0,0) + <wp:wrapNone/> → 零位移。                                  ║
 * ╚═══════════════════════════════════════════════════════════════════════╝
 */
import { spawn } from "node:child_process";
import { mkdtemp, readFile, writeFile, rm, readdir } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import JSZip from "jszip";
import sharp from "sharp";

export interface FreezeResult {
  docx: Buffer;
  ms: number;
  pages: number;
  /** 是否套用了自動表頭置中 */
  recentered: boolean;
}

const CONVERT_TIMEOUT_MS = 120_000;
const EMU_PER_PT = 12700;          // 1pt = 12700 EMU
const EMU_PER_INCH = 914400;       // 1in = 914400 EMU

function resolveBin(name: string, envVar: string): string {
  return process.env[envVar] || name;
}

/**
 * PDF → 版面凍結 .docx
 * @param input PDF bytes
 * @param opts.dpi 渲染解析度（預設 200，保真與檔案大小平衡點）
 * @param opts.autoCenterHeader 是否自動把表頭置中（預設 false）
 */
export async function convertPdfFreezeToWord(
  input: Buffer,
  opts: { dpi?: number; autoCenterHeader?: boolean } = {}
): Promise<FreezeResult> {
  const start = Date.now();
  const dpi = opts.dpi ?? 200;
  const autoCenter = !!opts.autoCenterHeader;

  if (
    !Buffer.isBuffer(input) ||
    input.length < 5 ||
    !input.subarray(0, 5).toString().startsWith("%PDF")
  ) {
    throw new Error("INVALID_PDF: the uploaded file is not a valid PDF.");
  }

  const workDir = await mkdtemp(path.join(os.tmpdir(), "p2wfreeze-"));
  const inPath = path.join(workDir, "source.pdf");

  try {
    await writeFile(inPath, input);

    // 1) 渲染每頁為 PNG
    const prefix = path.join(workDir, "pg");
    await runWithTimeout(
      resolveBin("pdftoppm", "PDFTOPPM_BIN"),
      ["-r", String(dpi), "-png", inPath, prefix],
      CONVERT_TIMEOUT_MS
    );
    const pngFiles = (await readdir(workDir))
      .filter((f) => /^pg-?\d+\.png$/.test(f))
      .sort((a, b) => pageNum(a) - pageNum(b));
    if (pngFiles.length === 0) {
      throw new Error("FREEZE_FAILED: could not rasterise the PDF.");
    }

    // 2) 逐頁處理（僅第 1 頁套表頭置中，與原驗證一致）
    let recentered = false;
    const pageImages: { buf: Buffer; wPx: number; hPx: number }[] = [];
    for (let i = 0; i < pngFiles.length; i++) {
      const p = path.join(workDir, pngFiles[i]);
      let buf: Buffer = Buffer.from(await readFile(p));
      if (autoCenter && i === 0) {
        const r = await recenterHeader(buf);
        buf = r.buf;
        recentered = recentered || r.moved;
      }
      const meta = await sharp(buf).metadata();
      pageImages.push({ buf, wPx: meta.width || 0, hPx: meta.height || 0 });
    }

    // 3) 組 .docx
    const docx = await buildDocx(pageImages, dpi);
    return { docx, ms: Date.now() - start, pages: pageImages.length, recentered };
  } finally {
    rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}

function pageNum(name: string): number {
  const m = name.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

// ────────────────────────────────────────────────────────────────────────
// 自動表頭置中（移植自已驗證的 Python recenter_header.py）
// 原理（用戶指導的「相對位置映射」科學方法）：
//   - 不假設「第一行就是表頭」、不寫死任何位移量(px)；所有數值執行時量測。
//   - 橫向投影分行 → 自動辨識頂端「顯著高」(含商標/大字全銜) 的標題行為表頭群組。
//   - 量測群組內容中心 vs 頁面中心，整體平移使中心對齊（已置中則不動）。
//   - 所有門檻以比例/相對量表示 → 任意解析度、任意文件版本皆自適應，無寫死常數。
// ────────────────────────────────────────────────────────────────────────

interface GrayImg {
  data: Buffer; // 單通道灰階
  W: number;
  H: number;
}

const DARK_THRESH = 120; // 灰階 < 120 視為「暗像素」（文字/圖）

async function toGray(buf: Buffer): Promise<GrayImg> {
  const img = sharp(buf).greyscale();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  return { data, W: info.width, H: info.height };
}

/** 每一橫列的暗像素數量（投影）。 */
function darkProfile(g: GrayImg): Int32Array {
  const prof = new Int32Array(g.H);
  for (let y = 0; y < g.H; y++) {
    let c = 0;
    const row = y * g.W;
    for (let x = 0; x < g.W; x++) {
      if (g.data[row + x] < DARK_THRESH) c++;
    }
    prof[y] = c;
  }
  return prof;
}

/** 切水平文字行。min_h 以頁高比例表示（不寫死像素）。 */
function detectRows(g: GrayImg, minDark = 3, minHRatio = 0.004): [number, number][] {
  const minH = Math.max(3, Math.round(g.H * minHRatio));
  const prof = darkProfile(g);
  const rows: [number, number][] = [];
  let inr = false;
  let s = 0;
  for (let y = 0; y < g.H; y++) {
    if (prof[y] >= minDark && !inr) {
      inr = true;
      s = y;
    } else if (prof[y] < minDark && inr) {
      inr = false;
      rows.push([s, y]);
    }
  }
  if (inr) rows.push([s, g.H]);
  return rows.filter(([a, b]) => b - a >= minH);
}

/** 量測一行內容的左界 L、右界 R、中心 C。 */
function rowExtent(g: GrayImg, y0: number, y1: number): [number, number, number] | null {
  let L = Infinity;
  let R = -1;
  for (let y = y0; y < y1; y++) {
    const row = y * g.W;
    for (let x = 0; x < g.W; x++) {
      if (g.data[row + x] < DARK_THRESH) {
        if (x < L) L = x;
        if (x > R) R = x;
      }
    }
  }
  if (R < 0) return null;
  return [L, R, (L + R) / 2];
}

/** 全頁行高中位數 = 內文典型行高（用來自動辨識表頭，無寫死）。 */
function typicalLineHeight(rows: [number, number][]): number {
  if (rows.length === 0) return 1;
  const hs = rows.map(([a, b]) => b - a).sort((x, y) => x - y);
  return hs[Math.floor(hs.length / 2)] || 1;
}

/**
 * 自動辨識「表頭群組」= 頁面頂端、明顯高於一般內文行高(含商標/放大全銜)且相鄰的連續行。
 * 全部以比例/相對量計算，無任何寫死像素常數。
 */
function detectHeaderGroup(g: GrayImg, rows: [number, number][]): number[] {
  if (rows.length === 0) return [];
  const typ = typicalLineHeight(rows);
  const tallFactor = 1.6; // 表頭行高需 > 典型行高的 1.6 倍才算「顯著」
  const group: number[] = [];
  for (let i = 0; i < rows.length; i++) {
    const [y0, y1] = rows[i];
    if (y0 > g.H * 0.25) break; // 只在頁面上方 25% 找表頭
    const h = y1 - y0;
    if (h > typ * tallFactor) {
      if (group.length === 0) {
        group.push(i);
      } else {
        const prevY1 = rows[group[group.length - 1]][1];
        if (y0 - prevY1 <= h) group.push(i);
        else break;
      }
    } else if (group.length > 0) {
      break;
    }
  }
  if (group.length === 0) group.push(0); // 後備：無顯著標題則退回最上行
  return group;
}

/**
 * 偵測表頭群組並做整體置中。回傳新 PNG buffer 與是否真的有移動。
 * tolRatio: 容差（頁寬比例），行中心與頁面中心差距小於此值視為已置中、不動。
 * padRatio: 平移時群組上下各留的安全邊（頁高比例）。
 */
async function recenterHeader(
  buf: Buffer,
  tolRatio = 0.004,
  padRatio = 0.004
): Promise<{ buf: Buffer; moved: boolean }> {
  const g = await toGray(buf);
  const pageCenter = g.W / 2;
  const tol = Math.max(2, g.W * tolRatio);
  const pad = Math.max(2, Math.round(g.H * padRatio));

  const rows = detectRows(g);
  if (rows.length === 0) return { buf, moved: false };

  const grp = detectHeaderGroup(g, rows);
  if (grp.length === 0) return { buf, moved: false };

  const gy0 = Math.max(0, rows[grp[0]][0] - pad);
  const gy1 = Math.min(g.H, rows[grp[grp.length - 1]][1] + pad);

  // 群組合併內容中心
  let gL = Infinity;
  let gR = -1;
  for (const idx of grp) {
    const e = rowExtent(g, rows[idx][0], rows[idx][1]);
    if (e) {
      if (e[0] < gL) gL = e[0];
      if (e[1] > gR) gR = e[1];
    }
  }
  if (gR < 0) return { buf, moved: false };

  const gC = (gL + gR) / 2;
  if (Math.abs(gC - pageCenter) <= tol) return { buf, moved: false }; // 已置中 → 不動

  const shift = Math.round(pageCenter - gC); // 執行時算出，正=往右、負=往左
  const contentW = gR - gL + 1;
  let newLeft = Math.round(gL + shift);
  newLeft = Math.max(0, Math.min(newLeft, g.W - contentW));

  // 影像操作（用原始彩色 buffer，非灰階）：
  //  1) 取出表頭群組整條橫帶 [0..W] × [gy0..gy1]
  //  2) 從中裁出內容區 [gL..gR]
  //  3) 造一條全白橫帶，把內容貼到平移後位置
  //  4) 把新橫帶合成回原頁
  const bandH = gy1 - gy0;
  const content = await sharp(buf)
    .extract({ left: gL, top: gy0, width: contentW, height: bandH })
    .toBuffer();

  const whiteBand = await sharp({
    create: { width: g.W, height: bandH, channels: 3, background: { r: 255, g: 255, b: 255 } },
  })
    .png()
    .toBuffer();

  const newBand = await sharp(whiteBand)
    .composite([{ input: content, left: newLeft, top: 0 }])
    .png()
    .toBuffer();

  const out = await sharp(buf)
    .composite([{ input: newBand, left: 0, top: gy0 }])
    .png()
    .toBuffer();

  return { buf: out, moved: true };
}

// ────────────────────────────────────────────────────────────────────────
// 組 .docx（jszip）：每頁一個 section，頁面尺寸由實際像素反推，圖片浮動於 (0,0)
// ────────────────────────────────────────────────────────────────────────

async function buildDocx(
  pages: { buf: Buffer; wPx: number; hPx: number }[],
  dpi: number
): Promise<Buffer> {
  const zip = new JSZip();

  // [Content_Types].xml
  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Default Extension="png" ContentType="image/png"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`
  );

  // _rels/.rels
  zip.file(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
  );

  // 圖片 + relationships
  const relParts: string[] = [];
  for (let i = 0; i < pages.length; i++) {
    zip.file(`word/media/page${i + 1}.png`, pages[i].buf);
    relParts.push(
      `<Relationship Id="rIdImg${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/page${i + 1}.png"/>`
    );
  }
  zip.file(
    "word/_rels/document.xml.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${relParts.join("\n")}
</Relationships>`
  );

  // document.xml body
  const bodyParts: string[] = [];
  for (let i = 0; i < pages.length; i++) {
    const { wPx, hPx } = pages[i];
    const wEmu = Math.round((wPx / dpi) * EMU_PER_INCH);
    const hEmu = Math.round((hPx / dpi) * EMU_PER_INCH);
    const wTwips = Math.round((wPx / dpi) * 1440);
    const hTwips = Math.round((hPx / dpi) * 1440);

    // 每頁的段落（含浮動全幅圖）
    bodyParts.push(paragraphWithFloatingImage(i + 1, wEmu, hEmu));

    // section 屬性：頁面尺寸 = 實際像素反推，所有邊界 = 0
    const sectPr = `<w:sectPr>
<w:pgSz w:w="${wTwips}" w:h="${hTwips}"/>
<w:pgMar w:top="0" w:right="0" w:bottom="0" w:left="0" w:header="0" w:footer="0" w:gutter="0"/>
</w:sectPr>`;

    if (i < pages.length - 1) {
      // 非最後頁：section 屬性放進一個段落以產生分節（分頁）
      bodyParts.push(`<w:p><w:pPr>${sectPr}</w:pPr></w:p>`);
    } else {
      // 最後頁：section 屬性直接掛 body 末端
      bodyParts.push(sectPr);
    }
  }

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document
 xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
 xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
 xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
 xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
<w:body>
${bodyParts.join("\n")}
</w:body>
</w:document>`;
  zip.file("word/document.xml", documentXml);

  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}

/**
 * 產生一個含「浮動全幅圖」的段落。圖片用 <wp:anchor> 絕對定位於 page (0,0)，
 * wrapNone → 零位移、不縮放，覆蓋整頁。
 */
function paragraphWithFloatingImage(idx: number, wEmu: number, hEmu: number): string {
  return `<w:p>
<w:pPr><w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/></w:pPr>
<w:r>
<w:drawing>
<wp:anchor distT="0" distB="0" distL="0" distR="0" simplePos="0" relativeHeight="${idx}" behindDoc="0" locked="0" layoutInCell="1" allowOverlap="1">
<wp:simplePos x="0" y="0"/>
<wp:positionH relativeFrom="page"><wp:posOffset>0</wp:posOffset></wp:positionH>
<wp:positionV relativeFrom="page"><wp:posOffset>0</wp:posOffset></wp:positionV>
<wp:extent cx="${wEmu}" cy="${hEmu}"/>
<wp:effectExtent l="0" t="0" r="0" b="0"/>
<wp:wrapNone/>
<wp:docPr id="${idx}" name="page${idx}"/>
<wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1"/></wp:cNvGraphicFramePr>
<a:graphic>
<a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
<pic:pic>
<pic:nvPicPr><pic:cNvPr id="${idx}" name="page${idx}.png"/><pic:cNvPicPr/></pic:nvPicPr>
<pic:blipFill><a:blip r:embed="rIdImg${idx}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>
<pic:spPr>
<a:xfrm><a:off x="0" y="0"/><a:ext cx="${wEmu}" cy="${hEmu}"/></a:xfrm>
<a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
</pic:spPr>
</pic:pic>
</a:graphicData>
</a:graphic>
</wp:anchor>
</w:drawing>
</w:r>
</w:p>`;
}

// ── Process helper ───────────────────────────────────────────────────────
function runWithTimeout(bin: string, args: string[], timeoutMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error(`${path.basename(bin)} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    child.stderr?.on("data", (d) => (stderr += d.toString()));
    child.on("error", (err) => {
      clearTimeout(timer);
      reject(new Error(`Failed to launch ${bin}: ${err.message}`));
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) resolve();
      else reject(new Error(`${path.basename(bin)} exited with code ${code}. ${stderr.slice(0, 500)}`));
    });
  });
}

// keep EMU_PER_PT referenced (documented unit; used in design notes)
void EMU_PER_PT;
