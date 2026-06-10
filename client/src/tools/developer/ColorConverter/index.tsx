// @profile B
// Profile B · 計算器-YMYL · ColorConverter (Developer Batch 1 #05 · MeetingCost-aligned · D-01/D-02/D-03/D-04 aligned)

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
const l = (v: LocalText, lang: Lang) => v[lang];

// Six-band hue distribution matrix — categorise dominant hue range (0–360°)
const bands = [
  { key: "red", range: "0–30° / 330–360°", label: { zh: "紅色系", en: "Red family" }, desc: { zh: "紅、紅橘色系，hue 在 0–30° 或 330–360°；視覺刺激度最高，常用於警示、品牌主視覺、CTA 按鈕。", en: "Red and red-orange tones, hue 0–30° or 330–360°; highest visual stimulation; common for alerts, brand hero, CTA buttons." } },
  { key: "orange", range: "30–60°", label: { zh: "橙黃系", en: "Orange–Yellow" }, desc: { zh: "橘、黃、暖琥珀色系，hue 30–60°；溫暖友善，常用於餐飲、能量飲品、活力品牌。需注意純黃在白底對比度低。", en: "Orange, yellow, warm amber, hue 30–60°; warm and friendly; common for F&B, energy drinks, vibrant brands. Pure yellow has low contrast on white." } },
  { key: "green", range: "60–180°", label: { zh: "綠色系", en: "Green family" }, desc: { zh: "黃綠、純綠、青綠色系，hue 60–180°；自然、健康、財務正向訊號；對眼睛最友善的中性 hue 區段。", en: "Yellow-green, pure green, teal, hue 60–180°; natural, healthy, positive financial signals; the most eye-friendly neutral hue range." } },
  { key: "cyan", range: "180–210°", label: { zh: "青色系", en: "Cyan family" }, desc: { zh: "青、海洋、湖水色系，hue 180–210°；科技、清涼、信任感；常用於 SaaS、雲端、健康保險品牌主色。", en: "Cyan, ocean, lake tones, hue 180–210°; tech, cooling, trust; common for SaaS, cloud, health-insurance hero colours." } },
  { key: "blue", range: "210–270°", label: { zh: "藍色系", en: "Blue family" }, desc: { zh: "純藍、靛藍、紫藍色系，hue 210–270°；專業、權威、穩定；金融、企業、政府使用率最高的 hue 區段。", en: "Pure blue, indigo, blue-violet, hue 210–270°; professional, authoritative, stable; the most-used hue band in finance, enterprise, government." } },
  { key: "purple", range: "270–330°", label: { zh: "紫色系", en: "Purple–Magenta" }, desc: { zh: "紫、品紅、桃紅色系，hue 270–330°；高端、創意、奢華；美妝、精品、文創產業常見；中性灰本身位於此區段外。", en: "Purple, magenta, pink-red, hue 270–330°; premium, creative, luxurious; common in beauty, luxury, creative industries; neutral grey sits outside this range." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "Regex 測試器", en: "Regex Tester" }, href: "/tools/developer/regex-tester" },
  { label: { zh: "URL 編碼器", en: "URL Encoder" }, href: "/tools/developer/url-encoder" },
  { label: { zh: "JSON 格式化器", en: "JSON Formatter" }, href: "/tools/developer/json-formatter" },
  { label: { zh: "Base64 編碼器", en: "Base64 Encoder" }, href: "/tools/developer/base64-encoder" },
];

const SAMPLE_HEX = "#7c3aed";

const ui = {
  zh: {
    badge: "開發工具 · 色彩格式 · 黃金模板", switchToEnglish: "English mode", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Color Converter · 色彩格式轉換器", subtitle: "HEX/RGB/HSL/HSV/CMYK 五格雙向轉換，並提供 hue 六格分區與 WCAG 對比度判讀",
    intro: "本工具在瀏覽器端執行 HEX、RGB、HSL、HSV、CMYK 五種色彩空間的雙向轉換，計算亮度與對比度（WCAG 2.1 公式），並把當前 hue 放進六格分區判讀矩陣；不上傳任何資料，適合處理品牌色、設計 token 與機敏視覺資產。",
    trustNoteLabel: "注意事項:", trustNote: "本工具僅在瀏覽器端執行 sRGB 色彩空間的數值轉換，不上傳資料；CMYK 採用簡化公式（無 ICC profile），印刷級色彩請以 Adobe / Pantone 工具為準。WCAG 對比度依 W3C 公式計算，僅作可讀性參考。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立範例", examplePreview: "目前 HEX", examplePerson: "標準範例", fillExample: "填入紫色 #7c3aed", previewActivePath: "填入綠色 #22c55e",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入 HEX 或調整 RGB 滑桿", examplesHelper: "先用範例理解色彩格式互換，再貼上自己的品牌色或設計 token。",
    metric: "HEX 輸入", imperial: "RGB 滑桿", exampleCards: "範例卡", baselineExample: "紫色 (CTA)", activeExample: "綠色 (成功)", flowDemo: "Hue", calculator: "計算機",
    inputText: "HEX 色碼（含或不含 #）", optionLabel: "色彩選項", componentMode: "顯示 HSL", fullUriMode: "顯示 HSV",
    resultCard: "色彩轉換結果", unit: "輸出格式", primaryValue: "主要數值", maintenanceTarget: "Hue", actionTarget: "WCAG 對比度", outputJson: "全部格式輸出",
    outputBytes: "Hue", inputBytes: "亮度 L", outputRatio: "對比度", outputValid: "格式驗證", calendarBreakdown: "色彩分解",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格 Hue 分區判讀矩陣", tdeeMatrixNote: "L7 固定六格，把目前色彩的 hue 放進常見品牌與功能用色區段；這是設計策略參考，不是品牌規範或無障礙合規建議。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把 hue 判讀轉成設計決策", conversionNote: "L9 會連動目前計算結果，顯示 hue、亮度與對比度，協助判斷此色適合做主色、輔色或僅作裝飾用色。",
    progressInsight: "結構洞察卡", possibleTarget: "目前色彩結構", dailyGap: "對比度", weeklyTrend: "Hue", motivation: "動力卡", keepMomentum: "從一個品牌色走向標準化的色彩 token 流程",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的色彩 token 帶回家", journeyHint: "重新貼上 HEX 或拉動 RGB 滑桿時自動重算所有格式與 WCAG 對比度，協助比較不同色彩的可讀性與品牌一致性。",
    nextActionLabel: "下一步行動", nextActionTitle: "把結果接到下一個工具", nextActionItem1: "用 Regex 測試器驗證 HEX 色碼字串符合品牌規範", nextActionItem2: "用 JSON 格式化器把色彩 token 包進 design system payload 後驗證", nextActionItem3: "用 URL 編碼器把含 # 的 HEX 編碼進 URL 參數後傳輸",
    shareLinkBtn: "📋 複製全部格式", shareNativeBtn: "📤 分享給隊友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "輸入 → 色彩格式 → Hue 判讀 → 設計決策", bmrStep: "輸入 HEX/RGB", deficitStep: "格式互換", trendStep: "Hue 判讀", mealStep: "設計決策",
    knowledge: "知識", knowledgeTitle: "色彩格式在 Web、印刷與設計系統中的意義", definition: "定義", definitionText: "色彩格式是描述顏色的數學模型：HEX 用 6 位十六進位（#RRGGBB）表示 sRGB 三通道；RGB 用 0–255 整數；HSL/HSV 用色相 0–360°、飽和度 0–100%、亮度/明度 0–100%；CMYK 用 0–100% 四色油墨比例（簡化版）。",
    formula: "公式", formulaText: "RGB→HSL：取 max/min 算亮度 L=(max+min)/2、飽和度 S 與色相 H。WCAG 對比度 = (L1+0.05)/(L2+0.05)，L 為相對亮度（sRGB→linear→0.2126R+0.7152G+0.0722B）；AA 級正文需 ≥ 4.5、大字 ≥ 3、AAA 級正文需 ≥ 7。",
    limitations: "限制", limitationsText: "本工具用 sRGB 色彩空間（IEC 61966-2-1），不支援 P3、Adobe RGB 等廣色域；CMYK 採用簡化公式（C=1-R, M=1-G, Y=1-B 後扣 K），無 ICC profile，不可作為印刷打樣依據；HSL/HSV 只能近似人眼感知，色彩感知級需 LAB / OKLCH。",
    interpretation: "解讀", interpretationText: "對比度數值（如 4.5、7）是無障礙合規硬指標，不是設計建議。Hue 分區是大眾化的色彩心理參考，實際品牌定位需配合飽和度、亮度、文化脈絡綜合判斷。CMYK 數值僅供概念換算，印刷請以實體打樣或 Pantone 色卡為準。",
    context: "脈絡", contextText: "主要場景：design system token 同步、品牌色 cross-platform 驗證、無障礙對比度檢查、印刷預估、CSS variable 產生、Tailwind config 對應、Figma / Sketch 色彩匯出。應與 ICC profile 工具、Pantone 色卡、a11y audit 工具一起評估。",
    example: "範例", exampleText: "若輸入 #7c3aed（Tailwind violet-600），則 RGB=(124,58,237)、HSL=(259°,85%,58%)、HSV=(259°,76%,93%)、CMYK=(48,76,0,7)。Hue 259° 落在「紫色系」band；白底 WCAG 對比度 ≈ 5.6，符合 AA 級正文；黑底 ≈ 3.7，僅符合 AA 大字。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "色彩工作的下一步工具", premiumTitle: "專業版色彩工具包", premiumText: "解鎖 OKLCH / LAB / P3 廣色域轉換、ICC profile 載入、批次 design token export（CSS / Tailwind / Figma）、色盲模擬（Protanopia / Deuteranopia / Tritanopia）、自動配色（互補 / 三角 / 類比）。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅在瀏覽器端執行 sRGB 色彩空間數值轉換，貼上的色碼不會送到伺服器；不取代 ICC profile 校色、Pantone 印刷打樣或專業 a11y 審計工具。色彩轉換是數學換算，不是色彩管理。",
    relatedTools: "相關工具", relatedToolsText: "Regex 測試器 · URL 編碼器 · JSON 格式化器 · Base64 編碼器", references: "參考資料", referencesText: "W3C CSS Color Module Level 4 (2022) §6 sRGB / §10 OKLCH; IEC 61966-2-1 (1999) sRGB Default RGB Colour Space; W3C WCAG 2.1 §1.4.3 Contrast (Minimum) AA / §1.4.6 Contrast (Enhanced) AAA; Mozilla MDN Web Docs — <color> CSS data type; Harvard CS50 Web Programming — CSS color spaces module。",
    q1: "為什麼 HEX 顯示「Invalid」？", a1: "HEX 色碼必須是 3 或 6 位十六進位字元（0–9 / A–F），可選前綴 #；常見錯誤：(1) 含非 0–9 / A–F 字元（例如 G/H/I）；(2) 位數不對（4 位、5 位、7 位都不合法）；(3) 包含空白或標點。本工具會自動補 #，但語法錯誤仍會顯示 Invalid。",
    q2: "WCAG 對比度怎麼讀？", a2: "對比度數值範圍 1:1（同色不可讀）到 21:1（黑白最高）；WCAG AA 級正文需 ≥ 4.5、大字（18pt 或粗 14pt）需 ≥ 3；AAA 級分別為 7 與 4.5。本工具同時計算白底與黑底的對比度，便於選擇文字配色。",
    q3: "貼上的色碼會被送到伺服器嗎？", a3: "不會。本工具完全在瀏覽器端用純數學公式轉換 sRGB 色彩空間，頁面關閉後資料即消失；適合處理未公開的品牌色、機敏 design token 或商業敏感配色。",
    q4: "為什麼 CMYK 跟印刷出來的不一樣？", a4: "本工具使用簡化的 CMYK 公式（K = 1-max(R,G,B)、CMY = (1-RGB-K)/(1-K)），無 ICC profile 校正；實際印刷需考慮紙張白度、油墨配方、印刷機壓力、網點擴散等變數，請以 Adobe Acrobat Pro 軟打樣或 Pantone 實體色卡為準。",
    q5: "HSL 跟 HSV 差在哪？什麼時候用哪個？", a5: "HSL 的 L（Lightness）= 0% 是黑、50% 是純色、100% 是白；HSV 的 V（Value）= 0% 是黑、100% 是「該色相飽和狀態」（不一定是白）。設計師調色用 HSV 比較直覺（推到底就是純色），CSS 變數系統用 HSL 比較好做 dark mode（同 hue 不同 L）。",
    q6: "OKLCH 跟 HSL 差在哪？我該換嗎？", a6: "OKLCH 是感知均勻色彩空間（CSS Color Module Level 4），同樣的 L 在不同 hue 看起來亮度真的一樣，HSL 不是；OKLCH 是 2023 年起新一代設計系統的趨勢（Tailwind CSS、Radix Colors 都已支援）。本工具目前提供 HSL 為主，OKLCH 在專業版開放。",
  },
  en: {
    badge: "Developer · Color formats · Gold template", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Color Converter", subtitle: "Two-way conversion across HEX/RGB/HSL/HSV/CMYK with a six-band hue matrix and WCAG contrast read-out",
    intro: "This tool runs HEX, RGB, HSL, HSV, and CMYK conversions in the browser; computes luminance and WCAG 2.1 contrast; and places the current hue into a six-band reading matrix. No data is uploaded — safe for brand colours, design tokens, and sensitive visual assets.",
    trustNoteLabel: "Note:", trustNote: "Everything runs in the browser within the sRGB colour space; nothing leaves your machine. CMYK uses a simplified formula (no ICC profile) — for print-grade colour, defer to Adobe / Pantone tools. WCAG contrast follows the W3C formula and is a readability reference only.",
    quickActionCard: "Quick example", tryExample: "Try a sample", examplePreview: "Current HEX", examplePerson: "Standard example", fillExample: "Purple #7c3aed", previewActivePath: "Green #22c55e",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter a HEX code or adjust RGB sliders", examplesHelper: "Start from a sample to understand cross-format colour conversion, then paste your own brand colour or design token.",
    metric: "HEX input", imperial: "RGB sliders", exampleCards: "Example cards", baselineExample: "Purple (CTA)", activeExample: "Green (success)", flowDemo: "Hue", calculator: "Calculator",
    inputText: "HEX code (with or without #)", optionLabel: "Colour options", componentMode: "Show HSL", fullUriMode: "Show HSV",
    resultCard: "Conversion result", unit: "Output format", primaryValue: "Headline number", maintenanceTarget: "Hue", actionTarget: "WCAG contrast", outputJson: "All formats",
    outputBytes: "Hue", inputBytes: "Lightness L", outputRatio: "Contrast", outputValid: "Format check", calendarBreakdown: "Colour breakdown",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band hue distribution matrix", tdeeMatrixNote: "L7 fixed six-band matrix — places the current hue into common brand and functional colour ranges. A design-strategy reference, not brand or accessibility-compliance advice.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Turn the hue reading into a design decision", conversionNote: "L9 reflects the current results — hue, lightness, and contrast — to help decide whether the colour fits as primary, secondary, or accent only.",
    progressInsight: "Structure insight", possibleTarget: "Current colour shape", dailyGap: "Contrast", weeklyTrend: "Hue", motivation: "Motivation", keepMomentum: "Move from a brand colour to a standardised colour-token workflow",
    saveShareJourney: "Save / share", journeyTitle: "Take today's colour token home", journeyHint: "Re-paste a HEX or move the RGB sliders to auto-recompute every format and WCAG contrast, helping compare readability and brand consistency across colours.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use Regex Tester to validate HEX codes against brand rules", nextActionItem2: "Use JSON Formatter to wrap colour tokens into a design-system payload and validate", nextActionItem3: "Use URL Encoder to encode HEX strings (with #) into URL parameters",
    shareLinkBtn: "📋 Copy all formats", shareNativeBtn: "📤 Share with a teammate", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Input → Format → Hue band → Design decision", bmrStep: "Enter HEX/RGB", deficitStep: "Cross-format", trendStep: "Hue band", mealStep: "Design decision",
    knowledge: "Knowledge", knowledgeTitle: "What colour formats mean for Web, print, and design systems", definition: "Definition", definitionText: "Colour formats are mathematical models for colour: HEX uses 6 hex digits (#RRGGBB) for sRGB channels; RGB uses 0–255 integers; HSL/HSV use hue 0–360°, saturation 0–100%, lightness/value 0–100%; CMYK uses 0–100% ink ratios (simplified).",
    formula: "Formula", formulaText: "RGB→HSL: take max/min, lightness L=(max+min)/2, saturation S, and hue H. WCAG contrast = (L1+0.05)/(L2+0.05) where L is relative luminance (sRGB→linear→0.2126R+0.7152G+0.0722B); AA body text needs ≥ 4.5, large text ≥ 3; AAA body text needs ≥ 7.",
    limitations: "Limitations", limitationsText: "This tool uses sRGB (IEC 61966-2-1); no support for P3, Adobe RGB, or wide-gamut spaces. CMYK uses a simplified formula (C=1-R, M=1-G, Y=1-B then K extracted) without ICC profile and is not print-proof. HSL/HSV only approximate human perception — for perceptual uniformity use LAB / OKLCH.",
    interpretation: "Interpretation", interpretationText: "Contrast numbers (4.5, 7) are accessibility hard-pass thresholds, not design suggestions. Hue bands are popular colour-psychology references; actual brand positioning requires saturation, lightness, and cultural context. CMYK numbers are conceptual — for print, use physical proofs or Pantone swatches.",
    context: "Context", contextText: "Main scenarios: design-system token sync, cross-platform brand colour validation, accessibility contrast checks, print estimation, CSS variable generation, Tailwind config mapping, Figma / Sketch colour export. Always weigh against ICC profile tools, Pantone swatches, and a11y audit tooling.",
    example: "Example", exampleText: "If input is #7c3aed (Tailwind violet-600), then RGB=(124,58,237), HSL=(259°,85%,58%), HSV=(259°,76%,93%), CMYK=(48,76,0,7). Hue 259° lands in the \"Blue family\" band; WCAG contrast on white ≈ 5.6 (AA body text); on black ≈ 3.7 (AA large text only).",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for colour work", premiumTitle: "Pro Color Toolkit", premiumText: "Unlock OKLCH / LAB / P3 wide-gamut conversion, ICC profile loading, batch design-token export (CSS / Tailwind / Figma), colour-blindness simulation (Protanopia / Deuteranopia / Tritanopia), and automatic harmonies (complementary / triadic / analogous).",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool only runs sRGB-space numerical conversion in the browser; pasted colour codes are never sent to the server. It does not replace ICC profile calibration, Pantone print proofs, or professional a11y audit tools. Colour conversion is math, not colour management.",
    relatedTools: "Related tools", relatedToolsText: "Regex Tester · URL Encoder · JSON Formatter · Base64 Encoder", references: "References", referencesText: "W3C CSS Color Module Level 4 (2022) §6 sRGB / §10 OKLCH; IEC 61966-2-1 (1999) sRGB Default RGB Colour Space; W3C WCAG 2.1 §1.4.3 Contrast (Minimum) AA / §1.4.6 Contrast (Enhanced) AAA; Mozilla MDN Web Docs — <color> CSS data type; Harvard CS50 Web Programming — CSS color spaces module.",
    q1: "Why does HEX show \"Invalid\"?", a1: "HEX must be 3 or 6 hex digits (0–9 / A–F) with optional leading #. Common causes: (1) non-hex chars (G/H/I); (2) wrong length (4, 5, or 7 digits are illegal); (3) whitespace or punctuation. The tool auto-prepends # but still flags syntax errors.",
    q2: "How do I read WCAG contrast?", a2: "Contrast ranges from 1:1 (identical colours, unreadable) to 21:1 (pure black / white). AA body text needs ≥ 4.5; AA large text (18pt or 14pt bold) needs ≥ 3. AAA equivalents are 7 and 4.5. The tool computes contrast on both white and black backgrounds for text-pairing decisions.",
    q3: "Is the pasted colour sent to the server?", a3: "No. The tool runs entirely in the browser via pure sRGB math; data disappears when the page is closed. It is safe for unreleased brand colours, sensitive design tokens, or commercially sensitive palettes.",
    q4: "Why does CMYK look different from print?", a4: "The tool uses a simplified CMYK formula (K = 1-max(R,G,B); CMY = (1-RGB-K)/(1-K)) without ICC calibration. Real print depends on paper white, ink formula, press pressure, dot gain, etc. — use Adobe Acrobat Pro soft proof or a Pantone physical swatch for production.",
    q5: "What's the difference between HSL and HSV — when to use which?", a5: "HSL's L (Lightness): 0% is black, 50% is the pure colour, 100% is white. HSV's V (Value): 0% is black, 100% is the saturated colour (not white). Designers find HSV more intuitive (max V = pure colour). CSS variable systems prefer HSL because dark mode is just the same hue with different L.",
    q6: "OKLCH vs HSL — should I switch?", a6: "OKLCH is a perceptually uniform colour space (CSS Color Module Level 4). The same L looks equally bright across hues — HSL doesn't. OKLCH is the next-gen design-system trend (Tailwind CSS, Radix Colors support it since 2023). This tool focuses on HSL today; OKLCH is part of the Pro toolkit.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

// ----- Color math (sRGB only) -----
function parseHex(input: string): { r: number; g: number; b: number; valid: boolean; normalized: string } {
  let s = input.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(s)) s = s.split("").map(c => c + c).join("");
  if (!/^[0-9a-fA-F]{6}$/.test(s)) return { r: 0, g: 0, b: 0, valid: false, normalized: "" };
  return { r: parseInt(s.slice(0,2),16), g: parseInt(s.slice(2,4),16), b: parseInt(s.slice(4,6),16), valid: true, normalized: "#" + s.toLowerCase() };
}
function rgbToHex(r: number, g: number, b: number): string {
  const h = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return "#" + h(r) + h(g) + h(b);
}
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const R = r/255, G = g/255, B = b/255;
  const max = Math.max(R, G, B), min = Math.min(R, G, B);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case R: h = ((G - B) / d + (G < B ? 6 : 0)); break;
      case G: h = ((B - R) / d + 2); break;
      case B: h = ((R - G) / d + 4); break;
    }
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}
function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  const R = r/255, G = g/255, B = b/255;
  const max = Math.max(R, G, B), min = Math.min(R, G, B);
  const d = max - min;
  const v = max;
  const s = max === 0 ? 0 : d / max;
  let h = 0;
  if (d !== 0) {
    switch (max) {
      case R: h = ((G - B) / d + (G < B ? 6 : 0)); break;
      case G: h = ((B - R) / d + 2); break;
      case B: h = ((R - G) / d + 4); break;
    }
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), v: Math.round(v * 100) };
}
function rgbToCmyk(r: number, g: number, b: number): { c: number; m: number; y: number; k: number } {
  const R = r/255, G = g/255, B = b/255;
  const k = 1 - Math.max(R, G, B);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  const c = (1 - R - k) / (1 - k);
  const m = (1 - G - k) / (1 - k);
  const y = (1 - B - k) / (1 - k);
  return { c: Math.round(c * 100), m: Math.round(m * 100), y: Math.round(y * 100), k: Math.round(k * 100) };
}
function relativeLuminance(r: number, g: number, b: number): number {
  const f = (c: number) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function contrastRatio(L1: number, L2: number): number {
  const a = Math.max(L1, L2), b = Math.min(L1, L2);
  return (a + 0.05) / (b + 0.05);
}

export default function ColorConverter() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric"); // metric=hex input, imperial=rgb sliders
  const [hexInput, setHexInput] = useState(SAMPLE_HEX);
  const [r, setR] = useState(124);
  const [g, setG] = useState(58);
  const [b, setB] = useState(237);
  const t = ui[lang];

  const result = useMemo(() => {
    let R = r, G = g, B = b, valid = true, normalized = rgbToHex(r,g,b);
    if (unit === "metric") {
      const parsed = parseHex(hexInput);
      valid = parsed.valid;
      R = parsed.r; G = parsed.g; B = parsed.b;
      normalized = parsed.normalized || "—";
    }
    const hsl = rgbToHsl(R, G, B);
    const hsv = rgbToHsv(R, G, B);
    const cmyk = rgbToCmyk(R, G, B);
    const lum = relativeLuminance(R, G, B);
    const lumWhite = 1.0;
    const lumBlack = 0.0;
    const cWhite = contrastRatio(lum, lumWhite);
    const cBlack = contrastRatio(lum, lumBlack);
    return { r: R, g: G, b: B, hex: normalized, valid, hsl, hsv, cmyk, lum, cWhite, cBlack };
  }, [hexInput, r, g, b, unit]);

  const hueDisplay = `${result.hsl.h}°`;
  const contrastDisplay = `${Math.max(result.cWhite, result.cBlack).toFixed(2)}:1`;

  function fillPurple() { setUnit("metric"); setHexInput("#7c3aed"); setR(124); setG(58); setB(237); }
  function fillGreen() { setUnit("metric"); setHexInput("#22c55e"); setR(34); setG(197); setB(94); }

  const activeBand = bands.find(item => {
    const h = result.hsl.h;
    if (h < 30 || h >= 330) return item.key === "red";
    if (h < 60) return item.key === "orange";
    if (h < 180) return item.key === "green";
    if (h < 210) return item.key === "cyan";
    if (h < 270) return item.key === "blue";
    return item.key === "purple";
  });

  const allFormatsText = `HEX ${result.hex}\nRGB(${result.r}, ${result.g}, ${result.b})\nHSL(${result.hsl.h}, ${result.hsl.s}%, ${result.hsl.l}%)\nHSV(${result.hsv.h}, ${result.hsv.s}%, ${result.hsv.v}%)\nCMYK(${result.cmyk.c}, ${result.cmyk.m}, ${result.cmyk.y}, ${result.cmyk.k})\nWCAG on white: ${result.cWhite.toFixed(2)}:1 · on black: ${result.cBlack.toFixed(2)}:1`;

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
            <aside className="rounded-[2rem] border border-violet-100 bg-white/90 p-6 shadow-2xl shadow-violet-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl p-5 text-white" style={{ background: result.valid ? result.hex : "#475569" }}><div className="text-xs font-bold uppercase opacity-90">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{result.hex}</div><div className="text-sm font-bold opacity-90">{lang === "zh" ? "色彩預覽" : "preview"}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">Hue</div><div className="font-black">{hueDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{contrastDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.inputBytes}</div><div className="font-black">{result.hsl.l}%</div></div></div><button onClick={fillPurple} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillGreen} className="mt-3 w-full rounded-2xl border border-violet-200 bg-violet-50 px-5 py-4 text-sm font-black text-violet-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillPurple} className="w-full rounded-2xl border border-violet-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full px-3 py-1 text-xs font-black text-white" style={{ background: "#7c3aed" }}>#7c3aed</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "Tailwind violet-600 · 紫色系" : "Tailwind violet-600 · purple family"}</p></button><button onClick={fillGreen} className="w-full rounded-2xl border border-violet-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full px-3 py-1 text-xs font-black text-white" style={{ background: "#22c55e" }}>#22c55e</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "Tailwind green-500 · 綠色系" : "Tailwind green-500 · green family"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4">{unit === "metric" ? (<label className="block text-sm font-black text-slate-700">{t.inputText}<input type="text" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-mono text-base" value={hexInput} onChange={(e) => setHexInput(e.target.value)} spellCheck={false} placeholder="#7c3aed" /></label>) : (<><label className="block text-sm font-black text-rose-700">R: {r}<input type="range" min={0} max={255} value={r} onChange={(e) => setR(Number(e.target.value))} className="mt-2 w-full accent-rose-600" /></label><label className="block text-sm font-black text-emerald-700">G: {g}<input type="range" min={0} max={255} value={g} onChange={(e) => setG(Number(e.target.value))} className="mt-2 w-full accent-emerald-600" /></label><label className="block text-sm font-black text-blue-700">B: {b}<input type="range" min={0} max={255} value={b} onChange={(e) => setB(Number(e.target.value))} className="mt-2 w-full accent-blue-600" /></label></>)}<div className="grid gap-3 md:grid-cols-2"><label className="flex items-center gap-3 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm font-black text-violet-700"><input type="checkbox" checked readOnly className="h-5 w-5 accent-violet-600" /><span>{t.componentMode}</span></label><label className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700"><input type="checkbox" checked readOnly className="h-5 w-5 accent-emerald-600" /><span>{t.fullUriMode}</span></label></div></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5" style={{ background: result.valid ? result.hex : "#475569" }} /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{result.hex}</div><div className={`mt-2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black ${result.valid ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{result.valid ? (lang === "zh" ? "✓ 格式有效" : "✓ Valid") : (lang === "zh" ? "✗ 格式錯誤" : "✗ Invalid")}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.outputRatio}</div><div className="mt-1 text-xl font-black">{contrastDisplay}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "WCAG" : "WCAG"}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">RGB</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "三通道" : "Channels"}</div><p className="mt-2 text-2xl font-black text-emerald-950">{result.r},{result.g},{result.b}</p><p className="text-sm font-bold text-emerald-700">0–255</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">HSL</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "色相 / 飽和 / 亮" : "Hue / Sat / L"}</div><p className="mt-2 text-2xl font-black text-blue-950">{result.hsl.h}°,{result.hsl.s}%,{result.hsl.l}%</p><p className="text-sm font-bold text-blue-700">0–360°</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">CMYK</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "印刷四色" : "Print"}</div><p className="mt-2 text-2xl font-black text-slate-950">{result.cmyk.c},{result.cmyk.m},{result.cmyk.y},{result.cmyk.k}</p><p className="text-sm font-bold text-slate-700">0–100%</p></div></div><div className="mt-5"><div className="text-xs font-black uppercase text-slate-500">{t.outputJson}</div><pre className="mt-2 max-h-72 overflow-auto rounded-2xl bg-slate-950 p-4 font-mono text-xs text-emerald-200 break-all whitespace-pre-wrap">{allFormatsText}</pre></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-2">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-violet-400 bg-violet-50 ring-2 ring-violet-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="color-converter-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-violet-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">Hue</div><div className="mt-1 text-3xl font-black">{result.hsl.h}°</div></div><div className="rounded-2xl bg-violet-50 p-4"><div className="text-xs font-black uppercase text-violet-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-violet-950">{hueDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{contrastDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item, i) => <div key={`mot-${i}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(allFormatsText); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "輸入" : "Input", note: t.bmrStep }, { label: lang === "zh" ? "格式互換" : "Convert", note: t.deficitStep }, { label: lang === "zh" ? "Hue 判讀" : "Hue band", note: t.trendStep }, { label: lang === "zh" ? "設計決策" : "Decide", note: t.mealStep }].map((node, index) => <div key={`decision-${index}`} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-violet-300 bg-violet-50" : "border-indigo-200 bg-indigo-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L14-Knowledge-FAQ · L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="color-converter-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-violet-100 bg-violet-50 p-5 text-center font-black text-violet-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-violet-700">{lang === "zh" ? "* 聯盟連結,購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["OKLCH/LAB", "ICC profile", "Token export", "色盲模擬"] : ["OKLCH/LAB", "ICC profile", "Token export", "Color-blind sim"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-TrustRelatedReferences */}<p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
