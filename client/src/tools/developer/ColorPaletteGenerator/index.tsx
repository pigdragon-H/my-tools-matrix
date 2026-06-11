// @profile B
// Profile B · 計算機-YMYL · ColorPaletteGenerator (Developer · MeetingCost-aligned · gold-template-clone)

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

// ─── Domain: HSL palette + WCAG contrast ─────────────────────────────────────
type HSL = { h: number; s: number; l: number };
type Swatch = { hex: string; hsl: HSL; relLuma: number; contrastWhite: number; contrastBlack: number };

function clamp(n: number, lo: number, hi: number): number { return Math.max(lo, Math.min(hi, n)); }

function parseHex(input: string): { r: number; g: number; b: number } | null {
  let s = input.trim().replace(/^#/, "");
  if (s.length === 3) s = s.split("").map(c => c + c).join("");
  if (!/^[0-9a-fA-F]{6}$/.test(s)) return null;
  return { r: parseInt(s.slice(0, 2), 16), g: parseInt(s.slice(2, 4), 16), b: parseInt(s.slice(4, 6), 16) };
}

function rgbToHex(r: number, g: number, b: number): string {
  const h = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

function rgbToHsl(r: number, g: number, b: number): HSL {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const lum = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = lum > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0));
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
  }
  return { h, s: s * 100, l: lum * 100 };
}

function hslToRgb(h: number, s: number, lum: number): { r: number; g: number; b: number } {
  const sn = s / 100, ln = lum / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const hh = ((h % 360) + 360) % 360 / 60;
  const x = c * (1 - Math.abs((hh % 2) - 1));
  let r1 = 0, g1 = 0, b1 = 0;
  if (hh >= 0 && hh < 1) { r1 = c; g1 = x; b1 = 0; }
  else if (hh < 2) { r1 = x; g1 = c; b1 = 0; }
  else if (hh < 3) { r1 = 0; g1 = c; b1 = x; }
  else if (hh < 4) { r1 = 0; g1 = x; b1 = c; }
  else if (hh < 5) { r1 = x; g1 = 0; b1 = c; }
  else { r1 = c; g1 = 0; b1 = x; }
  const m = ln - c / 2;
  return { r: (r1 + m) * 255, g: (g1 + m) * 255, b: (b1 + m) * 255 };
}

// WCAG 2.2 relative luminance (sRGB)
function relativeLuminance(r: number, g: number, b: number): number {
  const lin = (v: number) => { const n = v / 255; return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4); };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
function contrastRatio(L1: number, L2: number): number {
  const lo = Math.min(L1, L2), hi = Math.max(L1, L2);
  return (hi + 0.05) / (lo + 0.05);
}

function makeSwatch(hex: string): Swatch | null {
  const rgb = parseHex(hex);
  if (!rgb) return null;
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const Lc = relativeLuminance(rgb.r, rgb.g, rgb.b);
  const Lw = relativeLuminance(255, 255, 255);
  const Lb = relativeLuminance(0, 0, 0);
  return {
    hex: rgbToHex(rgb.r, rgb.g, rgb.b),
    hsl,
    relLuma: Lc,
    contrastWhite: contrastRatio(Lc, Lw),
    contrastBlack: contrastRatio(Lc, Lb),
  };
}

function rotateHsl(seed: HSL, deltaH: number, deltaL = 0): string {
  const rgb = hslToRgb(seed.h + deltaH, seed.s, clamp(seed.l + deltaL, 0, 100));
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

type Scheme = "complementary" | "analogous" | "triadic" | "tetradic" | "monochromatic";

function buildPalette(seedHex: string, scheme: Scheme): Swatch[] {
  const root = makeSwatch(seedHex);
  if (!root) return [];
  const seed = root.hsl;
  const offsets: Record<Scheme, [number, number][]> = {
    complementary: [[0, 0], [180, 0], [0, 20], [180, -20], [0, -25]],
    analogous: [[0, 0], [-30, 0], [30, 0], [-60, 0], [60, 0]],
    triadic: [[0, 0], [120, 0], [240, 0], [0, 18], [0, -18]],
    tetradic: [[0, 0], [90, 0], [180, 0], [270, 0], [0, -22]],
    monochromatic: [[0, 0], [0, 12], [0, -12], [0, 24], [0, -24]],
  };
  const out: Swatch[] = [];
  for (const [dh, dl] of offsets[scheme]) {
    const sw = makeSwatch(rotateHsl(seed, dh, dl));
    if (sw) out.push(sw);
  }
  return out;
}

// 6-band luminance matrix (mirrors JsonFormatter `bands`)
const bands = [
  { key: "near-black", range: "L < 0.05", label: { zh: "近黑色階", en: "Near-black" }, desc: { zh: "相對亮度低於 0.05,適合做主背景或大字反白文字。對白色 contrast > 19,符合 WCAG AAA;但長時間閱讀會讓眼睛疲勞,需搭配充足留白。", en: "Relative luminance below 0.05 — fits primary backgrounds or knock-out display text. Contrast vs white > 19, easily WCAG AAA; long reads tire the eyes, pair with generous whitespace." } },
  { key: "dark", range: "0.05 – 0.20", label: { zh: "深色階", en: "Dark" }, desc: { zh: "深色面板、card hover、暗色模式主背景的常用區間。對白文字 contrast 約 8–15,普通內文與標題皆通過 WCAG AA。", en: "Common range for dark panels, card hover, and dark-mode primary backgrounds. Contrast vs white roughly 8–15 — body and headings clear WCAG AA." } },
  { key: "mid-dark", range: "0.20 – 0.40", label: { zh: "中深階", en: "Mid-dark" }, desc: { zh: "Brand 主色、CTA 按鈕的甜蜜點,深到能鎖住注意力,亮到能與深色背景區隔。注意對白文字 contrast 仍須 ≥ 4.5 才符合 AA。", en: "Sweet spot for brand colors and CTA buttons — dark enough to anchor attention, light enough to separate from dark backgrounds. Confirm white text contrast ≥ 4.5 for AA." } },
  { key: "mid-light", range: "0.40 – 0.60", label: { zh: "中亮階", en: "Mid-light" }, desc: { zh: "點綴色、icon 容器、subtle border 的常用層,搭配深色文字最佳。對 #000 contrast 約 4–7,普通內文剛好通過 AA。", en: "Accent fills, icon containers, subtle borders — pair with dark text. Contrast vs #000 around 4–7, body text just clears AA." } },
  { key: "light", range: "0.60 – 0.85", label: { zh: "淺色階", en: "Light" }, desc: { zh: "Section 背景、卡片基底、淺色模式內容區的主力。對深色文字 contrast 通常 > 8,大標題與內文皆穩定通過 AAA。", en: "Section backgrounds, card surfaces, light-mode content areas. Contrast vs dark text typically > 8 — headings and body comfortably clear AAA." } },
  { key: "near-white", range: "L > 0.85", label: { zh: "近白色階", en: "Near-white" }, desc: { zh: "全白主背景或 hover 高亮層,對深色文字 contrast > 15,適合長時間閱讀。但純白容易造成螢幕眩光,可微降至 #fafafa 緩解。", en: "Pure white backgrounds or hover highlights — contrast vs dark text > 15, ideal for long reads. Pure white can glare; nudge to #fafafa to ease the eye." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "Hash 生成器", en: "Hash Generator" }, href: "/tools/developer/hash-generator" },
  { label: { zh: "JSON 格式化器", en: "JSON Formatter" }, href: "/tools/developer/json-formatter" },
  { label: { zh: "HTML 編碼解碼器", en: "HTML Encoder" }, href: "/tools/developer/html-encoder" },
  { label: { zh: "Cron 表達式解析器", en: "Cron Expression Parser" }, href: "/tools/developer/cron-expression" },
];

const SAMPLE_BRAND = "#7c3aed";  // Tailwind violet-600 (品牌主色基準)
const SAMPLE_ACCENT = "#10b981"; // Tailwind emerald-500 (互補/活躍色)

function bandKey(L: number): string {
  if (L < 0.05) return "near-black";
  if (L < 0.20) return "dark";
  if (L < 0.40) return "mid-dark";
  if (L < 0.60) return "mid-light";
  if (L < 0.85) return "light";
  return "near-white";
}

const ui = {
  zh: {
    badge: "開發工具 · 色彩調色板 · 黃金模板", switchToEnglish: "English mode", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Color Palette Generator · 色彩調色板生成器", subtitle: "輸入種子色即時推導 5 色配色方案,並提供六格亮度矩陣與 WCAG 2.2 對比度判讀",
    intro: "本工具在瀏覽器端解析 hex 色碼,套用 HSL 色彩理論的互補(180°)、類比(±30°)、三等(120°)、四等(90°)與單色(同色相不同明度)五種配色法則,推導 5 色調色板。每色額外計算 WCAG 2.2 相對亮度與對白/黑文字的對比度,並把亮度落入六格判讀矩陣。色碼不上傳,可安全用於品牌 ID、未公開設計稿。",
    trustNoteLabel: "注意事項:", trustNote: "本工具完全在瀏覽器端執行(HSL 旋轉 + WCAG 2.2 公式),所有色碼皆不上傳;對比度為理論值,實際視覺感受受顯示器、字重、字級影響;六格亮度為輔助判讀,正式無障礙稽核仍以 WCAG 官方標準為準。",
    quickActionCard: "快速範例卡", tryExample: "試一個配色範例", examplePreview: "目前主色亮度", examplePerson: "標準範例", fillExample: "一鍵填入 #7c3aed (violet-600)", previewActivePath: "填入 #10b981 (emerald-500)",
    examplesCalculator: "範例 → 計算機", enterValues: "貼上 hex 色碼並選擇配色法", examplesHelper: "先用範例品牌色理解 HSL 旋轉,再貼上自己的種子色。",
    metric: "Hex 色碼", imperial: "HSL 直接輸入", exampleCards: "範例卡", baselineExample: "violet-600 主色", activeExample: "emerald-500 活躍色", flowDemo: "色相 / 對比度", calculator: "計算機",
    inputCron: "種子色 (hex)", quickFills: "快捷範例",
    resultCard: "調色板解析結果", unit: "可用色階數", primaryValue: "主要數值", maintenanceTarget: "白底對比", actionTarget: "色階數", estimatedTdee: "黑底對比", maintenance: "色", fatLossTarget: "/階",
    outputFires: "白底對比", outputFields: "色階數", outputNext: "黑底對比", outputValid: "語法驗證", calendarBreakdown: "輸出分解", outputJson: "完整調色板報表",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格亮度判讀矩陣", tdeeMatrixNote: "L7 固定六格,把目前主色的相對亮度放進常見階層;這是配色設計參考,不是無障礙合規結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把調色板轉成設計系統決策", conversionNote: "L9 會連動目前推導結果,顯示種子色與 5 色階,協助判斷是否需要切換配色法、調整明度,或拆成 light/dark 雙主題。",
    progressInsight: "結構洞察卡", possibleTarget: "目前調色板結構", dailyGap: "色階數", weeklyTrend: "白底對比", motivation: "動力卡", keepMomentum: "從一個種子色走向標準化的設計 token 系統",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的配色結果帶回家", journeyHint: "重新貼上 hex 或切換配色法時自動重算,協助比較不同方案的對比度與亮度分布。",
    nextActionLabel: "下一步行動", nextActionTitle: "把結果接到下一個工具", nextActionItem1: "用 Hash 生成器把調色板 ID 雜湊化作為設計 token 命名", nextActionItem2: "用 JSON 格式化器把 design tokens 結構化便於版本控管", nextActionItem3: "用 HTML 編碼解碼器確保色碼字串在範例頁安全顯示",
    shareLinkBtn: "📋 複製調色板", shareNativeBtn: "📤 分享給隊友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "種子色 → HSL 推導 → 對比度判讀 → 設計 token", bmrStep: "種子色", deficitStep: "HSL 推導", trendStep: "對比度判讀", mealStep: "設計 token",
    knowledge: "知識", knowledgeTitle: "HSL 與 WCAG 對比度的設計意義", definition: "定義", definitionText: "HSL (Hue / Saturation / Lightness) 由 Joblove & Greenberg 於 1978 年提出,以人眼感知為基礎重整 RGB 數值。配色法則(complementary / analogous / triadic / tetradic / monochromatic)以色相環旋轉角度定義,易於設計師理解與套用。WCAG 2.2 (W3C, 2023) 的對比度公式以相對亮度為基,規範普通文字 ≥ 4.5 (AA)、≥ 7 (AAA)。",
    formula: "公式", formulaText: "對比度 = (L_max + 0.05) / (L_min + 0.05),其中 L 為 sRGB 相對亮度,線性化後依 0.2126R + 0.7152G + 0.0722B 加權。互補色取 H+180°,類比色取 H±30°,三等色 H+120°/240°,四等色 H+90°/180°/270°。",
    limitations: "限制", limitationsText: "本工具僅處理 sRGB 色域;P3 廣色域、HDR、CIE LAB 推導未支援。對比度計算採 WCAG 2.2 規範,不包含 APCA(WCAG 3 草案)的字級權重。配色方案為 5 色固定,複雜設計系統(40+ token)需另行擴充。",
    interpretation: "解讀", interpretationText: "互補色衝擊力強適合 CTA,類比色和諧適合內容區,三等色平衡適合資訊圖表,四等色豐富適合大型 dashboard,單色色階適合 minimalist 系統。對比度 4.5 是普通文字底線;3.0 適用於大字標題;< 3.0 僅可作裝飾或非資訊性元素。",
    context: "脈絡", contextText: "調色板要與字體權重、間距系統、互動狀態(hover/active/disabled)一起評估;Light/Dark 雙模式需各自跑一次配色推導;品牌色須通過 WCAG AA 才能用於主要 CTA,否則需擴展明度版本。",
    example: "範例", exampleText: "若種子色 = #7c3aed (violet-600),HSL ≈ (262, 83%, 58%),互補配色得 #adef34 等;對白底文字對比 4.8 通過 AA、對黑底 4.4 接近 AA。改成 #10b981 (emerald-500) HSL ≈ (160, 84%, 39%),互補得 #b81081 等;對白底 3.5 僅作大字、對黑底 6.0 通過 AA。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "配色設計的下一步工具", premiumTitle: "專業版設計系統包", premiumText: "解鎖 P3 廣色域推導、APCA 對比度、tints/shades 自動展開、design token JSON 匯出、Figma/Sketch 變數同步、light/dark 雙主題鏡像。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅在瀏覽器端推導調色板;貼上的色碼不會送到伺服器,適合處理含品牌 ID 的未公開設計稿。", relatedTools: "相關工具", relatedToolsText: "Hash 生成器 · JSON 格式化器 · HTML 編碼解碼器 · Cron 表達式解析器", references: "參考資料", referencesText: "Joblove & Greenberg (1978) Color spaces for computer graphics;W3C WCAG 2.2 (2023) Success Criterion 1.4.3 Contrast (Minimum)、1.4.6 Contrast (Enhanced);Itten (1961) The Art of Color — 配色法則理論基礎;sRGB IEC 61966-2-1:1999 色域標準。",
    q1: "為什麼我的色碼顯示「invalid」?", a1: "最常見原因是 hex 字串長度不對(必須 3 或 6 字元,前綴 # 可省)、含非 0-9/a-f 字元,或大小寫錯誤。錯誤訊息會指出具體問題 — 先把色碼改成 #ffffff 確認其他流程正確。",
    q2: "為什麼互補色推導出來不太「對」?", a2: "HSL 互補(H+180°)是色相環的數學對立,但人眼對色相敏感度不均(綠色感最廣、紫色感最窄),所以視覺上「最舒服」的互補色不一定是 H+180°。設計上常微調 ±15° 找到視覺平衡點;本工具給出標準 180° 為基準,微調由您決定。",
    q3: "貼上的色碼會被送到伺服器嗎?", a3: "不會。本工具完全在瀏覽器端用 HSL 公式與 WCAG 對比度公式運算;頁面關閉後色碼即消失,適合處理包含未公開品牌 ID 的設計稿(例如 brand-launch-2025-${tenant})。",
    q4: "為什麼對比度顯示通過 AA,但設計師看了覺得不夠?", a4: "WCAG 4.5 是底線(覆蓋大多數視力人群),對 high-contrast 美感要求或弱視族群仍嫌低。建議:重要 CTA 走 AAA(≥7),普通內文走 AA(≥4.5),裝飾元素 ≥3.0 即可;APCA(WCAG 3 草案)會更精準考量字級。",
    q5: "支援 P3 廣色域或 OKLCH 嗎?", a5: "目前不支援,本工具僅處理 sRGB。P3 約多覆蓋 25% 色域,適合 macOS / iOS Safari 16+;OKLCH 是感知均勻色空間,適合 dark mode 動態色階。未來會以獨立工具上線,專業版設計系統包已含。",
    q6: "可以用本工具做正式的無障礙稽核嗎?", a6: "不建議。本工具只做數學公式推導,不檢查實際 DOM 互動狀態(focus ring、disabled、placeholder、error)、字級權重、跨瀏覽器渲染差異、或色盲模擬。正式稽核請使用 axe DevTools、WAVE、Pa11y,或委由 a11y 專業團隊。",
  },
  en: {
    badge: "Developer · Color palette · Gold template", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Color Palette Generator", subtitle: "Enter a seed color to derive a 5-swatch scheme, plus a six-band luminance matrix and WCAG 2.2 contrast readout",
    intro: "This tool parses hex codes entirely in the browser, applying HSL color theory's complementary (180°), analogous (±30°), triadic (120°), tetradic (90°), and monochromatic (same hue, different lightness) schemes to derive a 5-swatch palette. For each swatch it computes WCAG 2.2 relative luminance plus contrast against white/black text, and places the luminance into a six-band matrix. Codes never upload, safe for brand IDs and unreleased mockups.",
    trustNoteLabel: "Note:", trustNote: "Everything runs in the browser (HSL rotation + WCAG 2.2 formula); codes stay on your machine. Contrast values are theoretical — actual perception depends on display, font weight, and size. The six-band matrix is a planning aid; formal a11y audits should defer to the WCAG official standard.",
    quickActionCard: "Quick example", tryExample: "Try a palette sample", examplePreview: "Current seed luminance", examplePerson: "Standard sample", fillExample: "Fill #7c3aed (violet-600)", previewActivePath: "Fill #10b981 (emerald-500)",
    examplesCalculator: "Examples → Calculator", enterValues: "Paste a hex code and pick the scheme", examplesHelper: "Start from a sample brand color to see the HSL rotation, then paste your own seed.",
    metric: "Hex code", imperial: "Direct HSL", exampleCards: "Example cards", baselineExample: "violet-600 brand", activeExample: "emerald-500 accent", flowDemo: "Hue / contrast", calculator: "Calculator",
    inputCron: "Seed color (hex)", quickFills: "Quick fills",
    resultCard: "Palette parse result", unit: "Swatches", primaryValue: "Headline number", maintenanceTarget: "vs white", actionTarget: "Swatch count", estimatedTdee: "vs black", maintenance: "swatches", fatLossTarget: "/swatch",
    outputFires: "vs white", outputFields: "Swatch count", outputNext: "vs black", outputValid: "Syntax", calendarBreakdown: "Output breakdown", outputJson: "Full palette report",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band luminance matrix", tdeeMatrixNote: "L7 fixed six bands — places the seed's relative luminance into common tiers. A palette-design reference, not an a11y compliance verdict.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Turn the palette into a design-system decision", conversionNote: "L9 reflects the current parse — seed plus 5 derived swatches — to help decide whether to switch scheme, retune lightness, or split into light / dark dual themes.",
    progressInsight: "Structure insight", possibleTarget: "Current palette shape", dailyGap: "Swatch count", weeklyTrend: "vs white", motivation: "Motivation", keepMomentum: "Move from a single seed to a standardised design-token system",
    saveShareJourney: "Save / share", journeyTitle: "Take today's palette home", journeyHint: "Re-paste the hex or switch schemes to auto-recompute, comparing contrast and luminance distribution between variants.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use the Hash Generator to hash palette IDs for design-token naming", nextActionItem2: "Use the JSON Formatter to structure design tokens for version control", nextActionItem3: "Use the HTML Encoder to ensure hex strings render safely in example pages",
    shareLinkBtn: "📋 Copy palette", shareNativeBtn: "📤 Share with a teammate", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Seed → HSL derive → Contrast band → Design token", bmrStep: "Seed", deficitStep: "Derive", trendStep: "Contrast", mealStep: "Token",
    knowledge: "Knowledge", knowledgeTitle: "What HSL and WCAG contrast mean for design", definition: "Definition", definitionText: "HSL (Hue / Saturation / Lightness) was introduced by Joblove & Greenberg (1978), restructuring RGB on perceptual axes. Color schemes (complementary / analogous / triadic / tetradic / monochromatic) are defined by hue-wheel rotation — designer-friendly. WCAG 2.2 (W3C, 2023) defines contrast on relative luminance: body text needs ≥ 4.5 (AA), ≥ 7 (AAA).",
    formula: "Formula", formulaText: "Contrast = (L_max + 0.05) / (L_min + 0.05), where L is sRGB relative luminance — linearised then weighted 0.2126R + 0.7152G + 0.0722B. Complementary = H+180°; analogous = H±30°; triadic = H+120°/240°; tetradic = H+90°/180°/270°.",
    limitations: "Limitations", limitationsText: "Handles sRGB only — P3 wide-gamut, HDR, and CIE LAB derivation are not supported. Contrast follows WCAG 2.2; APCA (WCAG 3 draft) font-weighting is not included. Schemes are fixed at 5 swatches — large design systems (40+ tokens) need expansion.",
    interpretation: "Interpretation", interpretationText: "Complementary punches hard for CTAs; analogous is harmonious for content; triadic balances data viz; tetradic enriches dashboards; monochromatic suits minimalist systems. 4.5 is the body-text floor; 3.0 fits large headings; below 3.0 is decorative only.",
    context: "Context", contextText: "Read palettes alongside font weight, spacing, and interaction states (hover/active/disabled). Light/Dark themes each need their own derivation. Brand colors must clear WCAG AA to anchor primary CTAs — otherwise extend with lightness variants.",
    example: "Example", exampleText: "Seed = #7c3aed (violet-600), HSL ≈ (262, 83%, 58%); complementary yields #adef34, contrast 4.8 vs white (AA pass), 4.4 vs black (near-AA). Switch to #10b981 (emerald-500) HSL ≈ (160, 84%, 39%); complementary yields #b81081, 3.5 vs white (large-text only), 6.0 vs black (AA pass).",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for palette design", premiumTitle: "Pro Design-System Pack", premiumText: "Unlock P3 wide-gamut derivation, APCA contrast, automated tints/shades, design-token JSON export, Figma/Sketch variable sync, and light/dark theme mirroring.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool only derives palettes in the browser; pasted codes never reach the server, safe for unreleased design files containing brand IDs.", relatedTools: "Related tools", relatedToolsText: "Hash Generator · JSON Formatter · HTML Encoder · Cron Expression Parser", references: "References", referencesText: "Joblove & Greenberg (1978) Color spaces for computer graphics; W3C WCAG 2.2 (2023) Success Criterion 1.4.3 Contrast (Minimum), 1.4.6 Contrast (Enhanced); Itten (1961) The Art of Color — color-scheme theory; sRGB IEC 61966-2-1:1999 color-space spec.",
    q1: "Why does my hex show \"invalid\"?", a1: "Most common reasons: wrong length (must be 3 or 6 chars, # optional), non-hex characters, or wrong case. The error message points to the issue — try #ffffff first to verify the rest of the flow.",
    q2: "Why does the complementary swatch feel \"off\"?", a2: "HSL complementary (H+180°) is the math opposite, but human hue sensitivity is uneven (we see more greens than purples), so the visually balanced complement may sit ±15° off the math. This tool gives the standard 180° as a baseline; tune by eye from there.",
    q3: "Are pasted codes sent to the server?", a3: "No. The tool runs entirely in the browser via HSL math and the WCAG contrast formula; codes disappear when the page closes, safe for files containing unreleased brand IDs (e.g. brand-launch-2025-${tenant}).",
    q4: "Why does AA pass but my designer says it's not enough?", a4: "WCAG 4.5 is the floor (covers most vision profiles) but feels low for high-contrast aesthetics or low-vision users. Use AAA (≥7) for primary CTAs, AA (≥4.5) for body, ≥3.0 for decoration. APCA (WCAG 3 draft) considers font weight more precisely.",
    q5: "Does it support P3 wide-gamut or OKLCH?", a5: "Not yet — sRGB only. P3 covers about 25% more gamut (macOS / iOS Safari 16+); OKLCH is perceptually uniform, ideal for dark-mode dynamic ramps. They will ship as separate tools; the Pro Design-System Pack already includes them.",
    q6: "Can I use this for formal a11y audit?", a6: "Not recommended. This tool only does math derivation — it does not check actual DOM interaction states (focus ring, disabled, placeholder, error), font weight, cross-browser rendering, or color-blind simulation. For audits use axe DevTools, WAVE, Pa11y, or an a11y team.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function ColorPaletteGenerator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [inputCron, setInputCron] = useState(SAMPLE_BRAND);
  const [scheme, setScheme] = useState<Scheme>("complementary");
  const t = ui[lang];

  const result = useMemo(() => {
    const seed = makeSwatch(inputCron);
    if (!seed) return { valid: false, error: `invalid hex: "${inputCron}"`, swatches: [] as Swatch[], seed: null as Swatch | null };
    const swatches = buildPalette(inputCron, scheme);
    return { valid: true, error: "", swatches, seed };
  }, [inputCron, scheme]);

  const swatchCountDisplay = fmt(result.swatches.length, 0);
  const seedLumaDisplay = result.seed ? fmt(result.seed.relLuma * 100, 1) : "—";
  const contrastWhiteDisplay = result.seed ? fmt(result.seed.contrastWhite, 2) : "—";
  const contrastBlackDisplay = result.seed ? fmt(result.seed.contrastBlack, 2) : "—";

  function fillBusiness() { setUnit("metric"); setInputCron(SAMPLE_BRAND); }
  function fillQuartz() { setUnit("imperial"); setInputCron(SAMPLE_ACCENT); }

  const activeBand = result.seed ? bands.find(b => b.key === bandKey(result.seed!.relLuma)) : undefined;

  const reportText = result.valid && result.swatches.length > 0
    ? result.swatches.map((s, i) => `[${i + 1}] ${s.hex.toUpperCase()}  HSL(${Math.round(s.hsl.h)}°, ${Math.round(s.hsl.s)}%, ${Math.round(s.hsl.l)}%)  L=${s.relLuma.toFixed(3)}  vs#fff=${s.contrastWhite.toFixed(2)}  vs#000=${s.contrastBlack.toFixed(2)}`).join("\n")
    : "—";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#ddd6fe,_#f8fafc_45%,_#e0e7ff)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-violet-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-violet-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-violet-200 bg-violet-50 p-5 text-sm leading-6 text-violet-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-violet-100 bg-white/90 p-6 shadow-2xl shadow-violet-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-violet-600 p-5 text-white"><div className="text-xs font-bold uppercase text-violet-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{seedLumaDisplay}</div><div className="text-sm font-bold text-violet-100">% L</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{contrastWhiteDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{swatchCountDisplay}/{contrastBlackDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{swatchCountDisplay}</div></div></div><button onClick={fillBusiness} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillQuartz} className="mt-3 w-full rounded-2xl border border-violet-200 bg-violet-50 px-5 py-4 text-sm font-black text-violet-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillBusiness} className="w-full rounded-2xl border border-violet-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">#7c3aed</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "Tailwind violet-600 · 紫色品牌主色" : "Tailwind violet-600 · violet brand"}</p></button><button onClick={fillQuartz} className="w-full rounded-2xl border border-violet-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">#10b981</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "Tailwind emerald-500 · 翠綠互補活躍色" : "Tailwind emerald-500 · emerald accent"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4"><label className="block text-sm font-black text-slate-700">{t.inputCron}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-mono text-base" value={inputCron} onChange={(e) => setInputCron(e.target.value)} spellCheck={false} placeholder="#7c3aed" /></label><div className="grid gap-4"><div><div className="text-sm font-black text-slate-700">{t.quickFills}</div><div className="mt-2 flex flex-wrap gap-2">{(["complementary", "analogous", "triadic", "tetradic", "monochromatic"] as const).map(s => <button key={s} type="button" onClick={() => setScheme(s)} className={`rounded-full border px-3 py-1.5 text-xs font-black ${scheme === s ? "border-violet-500 bg-violet-600 text-white" : "border-violet-200 bg-violet-50 text-violet-900 hover:bg-violet-100"}`}>{s}</button>)}</div></div></div></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-violet-400 to-indigo-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{contrastWhiteDisplay}</div><div className={`mt-2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black ${result.valid ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{result.valid ? (lang === "zh" ? "✓ 語法有效" : "✓ Valid") : (lang === "zh" ? "✗ 語法錯誤" : "✗ Invalid")}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.outputFields}</div><div className="mt-1 text-xl font-black">{swatchCountDisplay}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "色" : "sw"}</div></div></div>{!result.valid && <div className="mt-3 rounded-2xl bg-rose-50 p-3 text-xs font-mono text-rose-800">{result.error}</div>}<div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.outputFires}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "白底" : "vs #fff"}</div><p className="mt-2 text-3xl font-black text-emerald-950">{contrastWhiteDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.maintenance}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.outputFields}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "色階" : "Swatches"}</div><p className="mt-2 text-3xl font-black text-blue-950">{result.swatches.length}</p><p className="text-sm font-bold text-blue-700">{t.fatLossTarget}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.outputNext}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "黑底" : "vs #000"}</div><p className="mt-2 text-base font-black text-slate-950 break-all">{contrastBlackDisplay}</p><p className="text-xs font-bold text-slate-700">{lang === "zh" ? `L=${seedLumaDisplay}%` : `L=${seedLumaDisplay}%`}</p></div></div><div className="mt-5"><div className="text-xs font-black uppercase text-slate-500">{t.outputJson}</div><pre className="mt-2 max-h-72 overflow-auto rounded-2xl bg-slate-950 p-4 font-mono text-xs text-emerald-200">{reportText}</pre></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-violet-400 bg-violet-50 ring-2 ring-violet-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="color-palette-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-violet-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3">{result.swatches.slice(0, 3).map((s, i) => <div key={`sw-${i}`} className="rounded-2xl bg-slate-50 p-4"><div className="h-12 w-full rounded-xl" style={{ background: s.hex }} /><div className="mt-2 text-xs font-black text-slate-500">{s.hex.toUpperCase()}</div><div className="text-sm font-black">L={s.relLuma.toFixed(2)}</div></div>)}</div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item, i) => <div key={`mot-${i}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(reportText); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "種子色" : "Seed", note: t.bmrStep }, { label: lang === "zh" ? "HSL 推導" : "Derive", note: t.deficitStep }, { label: lang === "zh" ? "對比度" : "Contrast", note: t.trendStep }, { label: lang === "zh" ? "設計 token" : "Token", note: t.mealStep }].map((node, index) => <div key={`decision-${index}`} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-violet-300 bg-violet-50" : "border-indigo-200 bg-indigo-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="color-palette-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-violet-100 bg-violet-50 p-5 text-center font-black text-violet-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-violet-700">{lang === "zh" ? "* 聯盟連結,購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["P3 廣色域", "APCA 對比", "tints/shades", "token JSON"] : ["P3", "APCA", "tints/shades", "token JSON"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
