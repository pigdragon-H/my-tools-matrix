// @profile B
// Profile B · 計算機-YMYL · HexToRgb (Developer GOLD · JsonFormatter-aligned, 17-layer)

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => (Number.isFinite(v) ? v.toFixed(d) : "—");

function parseHex(input: string): { r: number; g: number; b: number; a: number; valid: boolean } {
  const s = input.trim().replace(/^#/, "");
  const re3 = /^([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/;
  const re6 = /^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/;
  const re8 = /^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/;
  let m = s.match(re6) || s.match(re8);
  if (m) {
    const r = parseInt(m[1], 16), g = parseInt(m[2], 16), b = parseInt(m[3], 16);
    const a = m[4] ? parseInt(m[4], 16) / 255 : 1;
    return { r, g, b, a, valid: true };
  }
  m = s.match(re3);
  if (m) {
    const r = parseInt(m[1] + m[1], 16), g = parseInt(m[2] + m[2], 16), b = parseInt(m[3] + m[3], 16);
    return { r, g, b, a: 1, valid: true };
  }
  return { r: 0, g: 0, b: 0, a: 1, valid: false };
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; lum: number } {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  let h = 0, s = 0;
  const lum = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = lum > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), lum: Math.round(lum * 100) };
}

function relLuminance(r: number, g: number, b: number): number {
  const f = (c: number) => { const cs = c / 255; return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

const bands = [
  { key: "veryDark", range: "L 0–20", label: { zh: "極暗色", en: "Very dark" }, desc: { zh: "亮度 0–20%,適合作為深色背景或高對比文字色;與白字搭配易達 WCAG AAA。", en: "Lightness 0–20% — good as a dark background or high-contrast text; pairs with white for AAA." } },
  { key: "dark", range: "L 20–40", label: { zh: "暗色", en: "Dark" }, desc: { zh: "亮度 20–40%,常見於品牌主色與按鈕;白字對比通常達 AA 以上。", en: "20–40% — common for brand primaries and buttons; white text usually passes AA." } },
  { key: "mid", range: "L 40–60", label: { zh: "中間色", en: "Mid" }, desc: { zh: "亮度 40–60%,對比最難拿捏;搭配黑字或白字都需實測對比比。", en: "40–60% — the trickiest contrast range; verify against both black and white text." } },
  { key: "light", range: "L 60–80", label: { zh: "亮色", en: "Light" }, desc: { zh: "亮度 60–80%,適合作淺色背景;與深色文字搭配易達 AA/AAA。", en: "60–80% — good light backgrounds; passes AA/AAA with dark text." } },
  { key: "veryLight", range: "L 80–95", label: { zh: "極亮色", en: "Very light" }, desc: { zh: "亮度 80–95%,近乎白底;只與深色文字搭配,白字幾乎不可讀。", en: "80–95% — near-white; use only with dark text, white text is unreadable." } },
  { key: "near", range: "L 95–100", label: { zh: "近白端點", en: "Near edge" }, desc: { zh: "亮度 95–100%,接近純白;作為背景時對比完全取決於前景色。", en: "95–100% — near pure white; contrast depends entirely on the foreground." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "色彩對比比計算機", en: "Color Contrast Ratio" }, href: "/tools/design/color-contrast-ratio-calculator" },
  { label: { zh: "色彩轉換器", en: "Color Converter" }, href: "/tools/developer/color-converter" },
  { label: { zh: "調色盤產生器", en: "Color Palette Generator" }, href: "/tools/developer/color-palette-generator" },
  { label: { zh: "JSON 格式化器", en: "JSON Formatter" }, href: "/tools/developer/json-formatter" },
];

const faqKeys = [["q1", "a1"], ["q2", "a2"], ["q3", "a3"], ["q4", "a4"], ["q5", "a5"], ["q6", "a6"]] as const;

const SAMPLE_A = "#7C3AED";
const SAMPLE_B = "#1E90FF";

const ui = {
  zh: {
    badge: "開發工具 · HEX 轉 RGB · 黃金模板", switchToEnglish: "English mode", switchToChinese: "切換到中文",
    title: "HEX 轉 RGB 色彩轉換器", subtitle: "輸入 HEX 即時轉成 RGB / HSL,並給六段亮度判讀矩陣",
    intro: "本工具在瀏覽器端解析 HEX 色碼(支援 #RGB、#RRGGBB、#RRGGBBAA),即時輸出 RGB、HSL、相對亮度與 CSS 可用字串;不上傳任何資料,適合設計與前端開發時快速取得色彩數值,並協助判斷該色作為背景或文字時的對比安全區。",
    trustNoteLabel: "注意事項:", trustNote: "本工具完全在瀏覽器端計算(無網路請求),相對亮度採 WCAG 2.1 公式;HSL 為標準色相環換算,實際螢幕呈現仍受色彩管理與面板差異影響。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立 HEX 範例", examplePreview: "目前 RGB", examplePerson: "RGB", fillExample: "一鍵填入主色範例", previewActivePath: "填入次色範例",
    examplesCalculator: "範例 → 轉換器", enterValues: "輸入 HEX 色碼", examplesHelper: "先用範例 HEX 理解轉換邏輯,再貼上自己的色碼。",
    metric: "HEX 輸入", imperial: "RGB 反推", exampleCards: "範例卡", baselineExample: "品牌主色", activeExample: "輔助藍色", flowDemo: "HSL", calculator: "轉換器",
    inputHex: "HEX 色碼(可含 #)", resultCard: "色彩轉換結果", outputR: "R", outputG: "G", outputB: "B", outputAlpha: "Alpha", outputHsl: "HSL", outputLum: "相對亮度",
    resultIntelligence: "結果解讀", tdeeMatrix: "六段亮度判讀矩陣", tdeeMatrixNote: "依 HSL 亮度把目前色放進六段區間,協助判斷它適合當背景或文字,以及與黑/白字的對比安全度。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把色彩數值轉成設計決策", conversionNote: "下方連動目前轉換結果,顯示 RGB、HSL 與相對亮度,協助決定文字色、是否需要加深或提亮。",
    progressInsight: "色彩洞察卡", possibleTarget: "目前色彩結構", dailyGap: "相對亮度", weeklyTrend: "色相", motivation: "動力卡", keepMomentum: "從一個色碼走向完整的可存取配色",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把這個色彩數值帶回專案", journeyHint: "重新輸入 HEX 或切換反推模式時自動重算,協助比較不同色碼的 RGB/HSL 與對比安全度。",
    nextActionLabel: "下一步行動", nextActionTitle: "把結果接到下一個工具", nextActionItem1: "用色彩對比比計算機驗證這個色與文字色的 WCAG 對比", nextActionItem2: "用色彩轉換器把 RGB 轉成其他色彩空間", nextActionItem3: "用調色盤產生器以此色為主色延伸配色",
    shareLinkBtn: "📋 複製 RGB 結果", shareNativeBtn: "📤 分享給隊友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "HEX 輸入 → 語法驗證 → 數值轉換 → 對比判讀", bmrStep: "HEX 輸入", deficitStep: "語法驗證", trendStep: "數值轉換", mealStep: "對比判讀",
    knowledge: "知識", knowledgeTitle: "HEX 與 RGB 在前端與設計中的意義",
    definition: "定義", definitionText: "HEX 色碼是以十六進位表示的 RGB 色彩,每兩位代表紅、綠、藍的 0–255 強度;#RRGGBBAA 多出的兩位代表 alpha 透明度。RGB 則是顯示器加色三原色的直接數值表示。",
    formula: "公式", formulaText: "R = parseInt(hex[0:2],16),G、B 同理;短碼 #RGB 會把每位重複(#abc → #aabbcc)。HSL 由 RGB 正規化後取 max/min 換算;相對亮度採 WCAG 2.1:L = 0.2126·R + 0.7152·G + 0.0722·B(經 gamma 線性化)。",
    limitations: "限制", limitationsText: "本工具假設 sRGB 色彩空間,不處理 Display-P3 或廣色域;alpha 以 0–1 表示,不做預乘;HSL 為標準換算,非感知均勻空間(如 OKLCH/LAB)。",
    interpretation: "解讀", interpretationText: "相對亮度決定該色與文字的對比;一般背景色亮度高、文字色亮度低。中間亮度(40–60%)最需實測對比比,黑白字都可能不達標。",
    context: "脈絡", contextText: "色彩數值應與對比比、品牌規範、無障礙標準(WCAG AA/AAA)一起考量;單看 HEX 無法判斷可讀性,需配合前景色計算對比。",
    example: "範例", exampleText: "#7C3AED → R124 G58 B237,HSL(262°,82%,58%),相對亮度約 0.13;作為背景時與白字對比約 5.5:1,通過 AA 一般文字。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "色彩處理的下一步工具", premiumTitle: "專業版色彩工具包", premiumText: "解鎖批次 HEX↔RGB↔HSL↔OKLCH 轉換、調色盤匯出、WCAG 對比批次檢查與 Tailwind 設定產生。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅在瀏覽器端做色彩數值換算,不上傳資料;不取代正式的無障礙稽核或色彩管理工具。", relatedTools: "相關工具", relatedToolsText: "色彩對比比計算機 · 色彩轉換器 · 調色盤產生器 · JSON 格式化器", references: "參考資料", referencesText: "W3C WCAG 2.1 Relative Luminance 定義;CSS Color Module Level 4(W3C);MDN Web Docs — <color> 與 hsl()/rgb() 函式;sRGB IEC 61966-2-1 標準。",
    q1: "支援哪些 HEX 格式?", a1: "支援 #RGB(短碼)、#RRGGBB(標準)與 #RRGGBBAA(含透明度);# 可省略,大小寫皆可。",
    q2: "短碼 #abc 怎麼轉?", a2: "短碼會把每位重複,#abc 等於 #aabbcc;這是 CSS 規範定義的展開方式。",
    q3: "相對亮度跟 HSL 的 L 一樣嗎?", a3: "不一樣。HSL 的 L 是簡單的 (max+min)/2;WCAG 相對亮度經過 gamma 線性化與加權,才是判斷對比的依據。",
    q4: "資料會上傳嗎?", a4: "不會。所有換算都在瀏覽器端完成,關閉頁面即消失。",
    q5: "alpha 透明度怎麼表示?", a5: "#RRGGBBAA 的最後兩位除以 255 得到 0–1 的 alpha;本工具顯示為小數,CSS 可直接用 rgba()。",
    q6: "可以用來做無障礙稽核嗎?", a6: "本工具提供亮度判讀僅供參考;正式 WCAG 對比稽核請搭配色彩對比比計算機輸入前景與背景兩色。",
  },
  en: {
    badge: "Developer · HEX to RGB · Gold template", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese",
    title: "HEX to RGB Converter", subtitle: "Convert HEX to RGB / HSL instantly, with a six-band lightness matrix",
    intro: "This tool parses HEX colors in the browser (#RGB, #RRGGBB, #RRGGBBAA) and outputs RGB, HSL, relative luminance, and CSS-ready strings. Nothing is uploaded, so it is handy for design and front-end work, and it helps judge whether a color is safe as a background or as text.",
    trustNoteLabel: "Note:", trustNote: "Everything runs in the browser with no network requests; relative luminance uses the WCAG 2.1 formula. HSL is the standard conversion; on-screen rendering still depends on color management and panel differences.",
    quickActionCard: "Quick Action", tryExample: "Try a HEX example", examplePreview: "Current RGB", examplePerson: "RGB", fillExample: "Fill the primary example", previewActivePath: "Fill the secondary example",
    examplesCalculator: "Examples → Converter", enterValues: "Enter a HEX color", examplesHelper: "Use the example HEX to understand the conversion, then paste your own.",
    metric: "HEX input", imperial: "From RGB", exampleCards: "Examples", baselineExample: "Brand primary", activeExample: "Accent blue", flowDemo: "HSL", calculator: "Converter",
    inputHex: "HEX color (# optional)", resultCard: "Conversion result", outputR: "R", outputG: "G", outputB: "B", outputAlpha: "Alpha", outputHsl: "HSL", outputLum: "Rel. luminance",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band lightness matrix", tdeeMatrixNote: "Places the current color into one of six lightness bands to judge whether it suits a background or text, and its contrast safety against black/white text.",
    emotionConversionLayer: "Conversion layer", turnIntoPlan: "Turn color values into design decisions", conversionNote: "The block below reflects the current result — RGB, HSL, and relative luminance — to help pick the text color and whether to darken or lighten.",
    progressInsight: "Color insight", possibleTarget: "Current color structure", dailyGap: "Rel. luminance", weeklyTrend: "Hue", motivation: "Momentum", keepMomentum: "From a single hex to a complete accessible palette",
    saveShareJourney: "Save / Share", journeyTitle: "Take this color value back to your project", journeyHint: "Re-entering a HEX or switching modes recomputes automatically, helping compare RGB/HSL and contrast safety across colors.",
    nextActionLabel: "Next action", nextActionTitle: "Send the result to the next tool", nextActionItem1: "Verify WCAG contrast of this color vs text with the Contrast Ratio tool", nextActionItem2: "Convert RGB to other color spaces with the Color Converter", nextActionItem3: "Build a palette from this primary with the Palette Generator",
    shareLinkBtn: "📋 Copy RGB result", shareNativeBtn: "📤 Share with teammates", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "HEX input → Validate → Convert → Contrast read", bmrStep: "HEX input", deficitStep: "Validate", trendStep: "Convert", mealStep: "Contrast",
    knowledge: "Knowledge", knowledgeTitle: "What HEX and RGB mean in front-end and design",
    definition: "Definition", definitionText: "A HEX code expresses an RGB color in hexadecimal; each pair is the 0–255 intensity of red, green, blue. The extra pair in #RRGGBBAA is the alpha channel. RGB is the direct additive-primary representation used by displays.",
    formula: "Formula", formulaText: "R = parseInt(hex[0:2],16), likewise G,B; short #RGB doubles each digit (#abc → #aabbcc). HSL is derived from normalized RGB via max/min; relative luminance uses WCAG 2.1: L = 0.2126·R + 0.7152·G + 0.0722·B after gamma linearization.",
    limitations: "Limitations", limitationsText: "Assumes the sRGB color space; no Display-P3 or wide gamut. Alpha is 0–1 with no premultiplication. HSL is the standard conversion, not a perceptually uniform space (OKLCH/LAB).",
    interpretation: "Interpretation", interpretationText: "Relative luminance drives contrast against text. Backgrounds tend to be high luminance, text low. Mid lightness (40–60%) most needs a measured contrast ratio — both black and white text can fail.",
    context: "Context", contextText: "Color values should be considered with contrast ratio, brand rules, and accessibility (WCAG AA/AAA). HEX alone cannot judge readability — pair it with a foreground color to compute contrast.",
    example: "Example", exampleText: "#7C3AED → R124 G58 B237, HSL(262°,82%,58%), relative luminance ≈ 0.13; as a background vs white text the contrast is ~5.5:1, passing AA for normal text.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next tools for color work", premiumTitle: "Pro color toolkit", premiumText: "Unlock batch HEX↔RGB↔HSL↔OKLCH conversion, palette export, batch WCAG contrast checks, and Tailwind config generation.",
    trustReferences: "Trust · Related tools · References", trust: "Trust statement", trustText: "This tool only converts color values in the browser and uploads nothing; it does not replace a formal accessibility audit or color-management tooling.", relatedTools: "Related tools", relatedToolsText: "Color Contrast Ratio · Color Converter · Palette Generator · JSON Formatter", references: "References", referencesText: "W3C WCAG 2.1 Relative Luminance; CSS Color Module Level 4 (W3C); MDN Web Docs — <color>, hsl()/rgb(); sRGB IEC 61966-2-1.",
    q1: "Which HEX formats are supported?", a1: "#RGB (short), #RRGGBB (standard), and #RRGGBBAA (with alpha); the # is optional and case is ignored.",
    q2: "How is short #abc expanded?", a2: "Each digit is doubled, so #abc equals #aabbcc — the expansion defined by the CSS spec.",
    q3: "Is relative luminance the same as HSL's L?", a3: "No. HSL's L is simply (max+min)/2; WCAG relative luminance applies gamma linearization and weighting, and is what contrast judgments use.",
    q4: "Is my data uploaded?", a4: "No. All conversion happens in the browser and disappears when you close the page.",
    q5: "How is alpha represented?", a5: "The last two digits of #RRGGBBAA divided by 255 give a 0–1 alpha; shown as a decimal here and usable directly in rgba().",
    q6: "Can I use this for an accessibility audit?", a6: "The lightness read is guidance only; for a formal WCAG contrast audit use the Contrast Ratio tool with both foreground and background colors.",
  },
} as const;

export default function HexToRgb() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [inputHex, setInputHex] = useState(SAMPLE_A);
  const t = ui[lang];

  const result = useMemo(() => {
    const p = parseHex(inputHex);
    if (!p.valid) return { valid: false, r: 0, g: 0, b: 0, a: 1, h: 0, s: 0, lum: 0, wlum: 0, rgbStr: "—" };
    const hsl = rgbToHsl(p.r, p.g, p.b);
    const wlum = relLuminance(p.r, p.g, p.b);
    const rgbStr = p.a < 1 ? `rgba(${p.r}, ${p.g}, ${p.b}, ${p.a.toFixed(2)})` : `rgb(${p.r}, ${p.g}, ${p.b})`;
    return { valid: true, r: p.r, g: p.g, b: p.b, a: p.a, h: hsl.h, s: hsl.s, lum: hsl.lum, wlum, rgbStr };
  }, [inputHex]);

  const rgbDisplay = result.valid ? `${result.r}, ${result.g}, ${result.b}` : "—";
  const lumDisplay = fmt(result.lum, 0);

  function fillPrimary() { setUnit("metric"); setInputHex(SAMPLE_A); }
  function fillSecondary() { setUnit("imperial"); setInputHex(SAMPLE_B); }

  const activeBand = bands.find((b) => {
    const L = result.lum;
    if (L < 20) return b.key === "veryDark";
    if (L < 40) return b.key === "dark";
    if (L < 60) return b.key === "mid";
    if (L < 80) return b.key === "light";
    if (L < 95) return b.key === "veryLight";
    return b.key === "near";
  });

  const swatch = result.valid ? `#${[result.r, result.g, result.b].map((n) => n.toString(16).padStart(2, "0")).join("")}` : "#ffffff";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="bg-[radial-gradient(circle_at_top_left,_#ddd6fe,_#f8fafc_45%,_#e0e7ff)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-violet-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-violet-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-violet-200 bg-violet-50 p-5 text-sm leading-6 text-violet-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-violet-100 bg-white/90 p-6 shadow-2xl shadow-violet-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl p-5" style={{ backgroundColor: swatch }}><div className="text-xs font-bold uppercase text-white mix-blend-difference">{t.examplePreview}</div><div className="mt-1 text-4xl font-black text-white mix-blend-difference">{rgbDisplay}</div><div className="text-sm font-bold text-white mix-blend-difference">{swatch}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{rgbDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{result.h}/{result.s}/{result.lum}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.outputLum}</div><div className="font-black">{lumDisplay}</div></div></div><button onClick={fillPrimary} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillSecondary} className="mt-3 w-full rounded-2xl border border-violet-200 bg-violet-50 px-5 py-4 text-sm font-black text-violet-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillPrimary} className="w-full rounded-2xl border border-violet-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full px-3 py-1 text-xs font-black text-white" style={{ backgroundColor: SAMPLE_A }}>{SAMPLE_A}</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "品牌紫 → RGB / HSL / 亮度" : "Brand violet → RGB / HSL / luminance"}</p></button><button onClick={fillSecondary} className="w-full rounded-2xl border border-violet-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full px-3 py-1 text-xs font-black text-white" style={{ backgroundColor: SAMPLE_B }}>{SAMPLE_B}</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "輔助藍 → RGB / HSL / 亮度" : "Accent blue → RGB / HSL / luminance"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4"><label className="block text-sm font-black text-slate-700">{t.inputHex}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-mono text-lg" value={inputHex} onChange={(e) => setInputHex(e.target.value)} spellCheck={false} placeholder="#7C3AED" /></label><div className="flex items-center gap-3"><div className="h-16 w-16 rounded-2xl border border-slate-200" style={{ backgroundColor: swatch }} /><div className="text-sm text-slate-600">{lang === "zh" ? "即時預覽色塊;輸入無效時顯示白色。" : "Live swatch; shows white on invalid input."}</div></div></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-violet-400 to-indigo-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-5xl font-black tracking-tight text-slate-950">{rgbDisplay}</div><div className={`mt-2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black ${result.valid ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{result.valid ? (lang === "zh" ? "✓ 有效色碼" : "✓ Valid") : (lang === "zh" ? "✗ 無效色碼" : "✗ Invalid")}</div></div><div className="rounded-3xl p-4 text-right" style={{ backgroundColor: swatch }}><div className="text-xs font-bold uppercase text-white mix-blend-difference">{t.outputLum}</div><div className="mt-1 text-xl font-black text-white mix-blend-difference">{lumDisplay}</div><div className="mt-1 text-xs text-white mix-blend-difference">L%</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-rose-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">{t.outputR}</div><p className="mt-2 text-3xl font-black text-rose-950">{result.r}</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.outputG}</div><p className="mt-2 text-3xl font-black text-emerald-950">{result.g}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.outputB}</div><p className="mt-2 text-3xl font-black text-blue-950">{result.b}</p></div></div><div className="mt-4 grid gap-4 md:grid-cols-2"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.outputHsl}</div><p className="mt-1 text-lg font-black">hsl({result.h}, {result.s}%, {result.lum}%)</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.outputAlpha}</div><p className="mt-1 text-lg font-black">{result.a.toFixed(2)}</p></div></div><div className="mt-5"><div className="text-xs font-black uppercase text-slate-500">CSS</div><pre className="mt-2 overflow-auto rounded-2xl bg-slate-950 p-4 font-mono text-sm text-emerald-200">{result.rgbStr}</pre></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-violet-400 bg-violet-50 ring-2 ring-violet-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="hex-to-rgb-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-violet-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black">{result.h}°</div></div><div className="rounded-2xl bg-violet-50 p-4"><div className="text-xs font-black uppercase text-violet-700">S</div><div className="mt-1 text-3xl font-black text-violet-950">{result.s}%</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result.lum}%</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item, i) => <div key={`mot-${i}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(result.rgbStr); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "HEX 輸入" : "Input", note: t.bmrStep }, { label: lang === "zh" ? "語法驗證" : "Validate", note: t.deficitStep }, { label: lang === "zh" ? "數值轉換" : "Convert", note: t.trendStep }, { label: lang === "zh" ? "對比判讀" : "Contrast", note: t.mealStep }].map((node, index) => <div key={`decision-${index}`} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-violet-300 bg-violet-50" : "border-indigo-200 bg-indigo-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="hex-to-rgb-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-violet-100 bg-violet-50 p-5 text-center font-black text-violet-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-violet-700">{lang === "zh" ? "* 聯盟連結,購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["批次轉換", "調色盤匯出", "WCAG 批檢", "Tailwind"] : ["Batch", "Palette", "WCAG", "Tailwind"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
