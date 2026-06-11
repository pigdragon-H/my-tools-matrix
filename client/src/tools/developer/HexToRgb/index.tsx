// @profile B
// Profile B · 計算機-YMYL · HexToRgb（GOLD-STANDARD-001 compatible · cloned from MeetingCost）

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

const bands = [
  { key: "veryDark", range: "0-0.05", label: { zh: "極暗色", en: "Very dark" }, desc: { zh: "亮度極低，適合作為深色背景或文字陰影。", en: "Very low luminance — good as a dark background or text shadow." } },
  { key: "dark", range: "0.05-0.2", label: { zh: "深色", en: "Dark" }, desc: { zh: "偏暗色，需搭配淺色文字以維持對比。", en: "On the dark side — pair with light text to keep contrast." } },
  { key: "mid", range: "0.2-0.4", label: { zh: "中間色", en: "Mid tone" }, desc: { zh: "中間亮度，前景對比需個別測試。", en: "Mid luminance — test foreground contrast case by case." } },
  { key: "light", range: "0.4-0.7", label: { zh: "淺色", en: "Light" }, desc: { zh: "偏亮，適合作為淺色區塊或卡片底色。", en: "Fairly light — suitable for light blocks or card backgrounds." } },
  { key: "veryLight", range: "0.7-0.9", label: { zh: "明亮色", en: "Very light" }, desc: { zh: "高亮度，需搭配深色文字確保可讀性。", en: "High luminance — needs dark text to stay readable." } },
  { key: "nearWhite", range: ">0.9", label: { zh: "近白色", en: "Near white" }, desc: { zh: "接近白色，僅適合作為背景而非文字色。", en: "Near white — use as background, not as text color." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "RGB 轉 HEX", en: "RGB to HEX" }, href: "/tools/developer/rgb-to-hex" },
  { label: { zh: "HEX 轉 HSL", en: "HEX to HSL" }, href: "/tools/developer/hex-to-hsl" },
  { label: { zh: "色彩對比檢查", en: "Color Contrast Checker" }, href: "/tools/developer/color-contrast-checker" },
  { label: { zh: "色票產生器", en: "Color Palette Generator" }, href: "/tools/developer/color-palette-generator" },
];

const ui = {
  zh: {
    badge: "開發工具 · HEX 轉 RGB · 黃金工具", switchToEnglish: "中文模式", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "HEX to RGB Converter · HEX 轉 RGB 轉換器", subtitle: "把十六進位色碼即時換算成 RGB 與相對亮度",
    intro: "本工具根據十六進位色碼，換算出對應的 R、G、B 數值、HSL 與 WCAG 相對亮度，幫助設計與前端開發者快速取得可用的色彩數據。",
    trustNoteLabel: "注意事項：", trustNote: "此工具僅換算色彩數值與相對亮度；不取代正式的無障礙對比測試或品牌色彩規範。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立 HEX 轉 RGB 範例", examplePreview: "RGB 預覽", examplePerson: "標準範例", fillExample: "一鍵填入標準範例", previewActivePath: "填入深色範例",
    examplesCalculator: "範例 → 轉換器", enterValues: "輸入十六進位色碼", examplesHelper: "先用範例理解 HEX 轉 RGB，再改成自己的色碼。",
    metric: "簡易", imperial: "詳細", exampleCards: "範例卡", baselineExample: "天空藍 · #38bdf8", activeExample: "深板岩", flowDemo: "#38bdf8", calculator: "轉換器",
    participants: "HEX 色碼", averageHourlyRate: "紅 R (0-255)", durationHours: "綠 G (0-255)", meetingsPerMonth: "藍 B (0-255)",
    resultCard: "HEX 轉 RGB 結果", unit: "RGB 值", primaryValue: "主要數值", maintenanceTarget: "RGB 值", actionTarget: "HSL", estimatedTdee: "RGB 值", maintenance: "RGB", fatLossTarget: "相對亮度",
    meetingCost: "RGB", monthlyEquiv: "HSL", weeklyEquiv: "紅 R", dailyEquiv: "相對亮度", effectiveHours: "亮度等級",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格色彩亮度判讀矩陣", tdeeMatrixNote: "L7 固定六格，將相對亮度放進常見區間；這是設計參考，不是正式的無障礙對比裁決。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把色彩數據盤點轉成可行配色", conversionNote: "L9 會連動目前轉換結果，顯示 RGB、HSL 與相對亮度，協助判斷文字、背景與對比配置。",
    progressInsight: "進度洞察卡", possibleTarget: "目前色彩數據", dailyGap: "相對亮度", weeklyTrend: "RGB 值", motivation: "動力卡", keepMomentum: "從單一色碼走向完整配色系統",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的色彩數據帶回專案", journeyHint: "每次調整品牌色、主題色或對比規範時重新換算，追蹤色彩是否符合無障礙需求。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用 RGB 轉 HEX 反向確認色碼", nextActionItem2: "用 HEX 轉 HSL 取得色相飽和度資料", nextActionItem3: "用色彩對比檢查驗證文字可讀性",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "HEX → RGB → HSL → 對比檢查", bmrStep: "HEX 色碼", deficitStep: "RGB 值", trendStep: "HSL", mealStep: "對比檢查",
    knowledge: "知識", knowledgeTitle: "HEX 轉 RGB 在前端與設計中的意義", definition: "定義", definitionText: "HEX 色碼是用十六進位表示的 RGB 色彩，每兩位代表紅、綠、藍三個 0-255 的通道，轉成 RGB 後可用於 CSS、設計工具與運算。",
    formula: "公式", formulaText: "R = HEX 前兩位（16 進位轉 10 進位），G = 中間兩位，B = 後兩位。相對亮度依 WCAG 2.1 線性化後加權：0.2126R + 0.7152G + 0.0722B。",
    limitations: "限制", limitationsText: "本工具只換算色彩數值與相對亮度；不納入色域、色彩管理設定檔、顯示器校正或品牌規範差異。",
    interpretation: "解讀", interpretationText: "RGB 值相同不代表在不同螢幕上看起來一樣；相對亮度只是對比計算的基礎，仍需搭配前景色一起評估可讀性。",
    context: "脈絡", contextText: "色彩換算應搭配對比比例、字級、背景色與品牌規範一起看，而不是只看單一 RGB 數值。",
    example: "範例", exampleText: "HEX #38bdf8 轉換後 R=56、G=189、B=248，HSL 約 (199°, 92%, 60%)，相對亮度約 0.49，屬於淺色區間。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "色彩處理的下一步工具", premiumTitle: "專業版色彩工具包", premiumText: "解鎖批次色碼轉換、色票匯出、對比報告與品牌色彩規範檢查。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供教育與開發用途，不取代正式無障礙稽核或品牌色彩規範。", relatedTools: "相關工具", relatedToolsText: "RGB 轉 HEX · HEX 轉 HSL · 色彩對比檢查 · 色票產生器", references: "參考資料", referencesText: "W3C WCAG 2.1 相對亮度定義；CSS Color Module Level 4；MDN 色彩值文件；sRGB 色彩空間規範。",
    q1: "HEX 和 RGB 有什麼差別？", a1: "兩者描述同一組色彩。HEX 用十六進位字串表示，RGB 用三個 0-255 的數字表示；轉換只是不同寫法，色彩本身不變。",
    q2: "三位數的 HEX（例如 #abc）也能轉嗎？", a2: "可以。三位數 HEX 會把每一位重複一次，例如 #abc 等同 #aabbcc，再依一般規則轉成 RGB。",
    q3: "帶透明度的 HEX（8 位）怎麼處理？", a3: "前 6 位仍是 RGB，最後 2 位是 Alpha 透明度（0-255）。本工具預設換算 RGB 通道，透明度可另外處理。",
    q4: "相對亮度可以直接判斷對比是否足夠嗎？", a4: "不能單獨判斷。相對亮度只是計算對比比例的基礎，需要前景與背景兩個顏色一起算出對比比例，再對照 WCAG 標準。",
    q5: "RGB 值越大代表越亮嗎？", a5: "不一定。人眼對綠色最敏感、藍色最不敏感，因此相對亮度會對 R、G、B 給不同權重，不能只看數字大小。",
    q6: "這個工具能取代設計規範嗎？", a6: "不能。它只是教育與開發用換算；實際配色仍應考量品牌規範、無障礙對比與不同裝置的顯示差異。",
  },
  en: {
    badge: "Developer · HEX to RGB · Gold tool", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "HEX to RGB Converter", subtitle: "Convert hex color codes into RGB and relative luminance instantly",
    intro: "This tool turns a hex color code into its R, G, B values, HSL, and WCAG relative luminance — so designers and front-end developers can grab usable color data with confidence.",
    trustNoteLabel: "Note:", trustNote: "This tool only converts color values and relative luminance. It does not replace formal accessibility contrast testing or brand color guidelines.",
    quickActionCard: "Quick example", tryExample: "Try a HEX to RGB example", examplePreview: "RGB preview", examplePerson: "Standard example", fillExample: "Fill the standard example", previewActivePath: "Try the dark example",
    examplesCalculator: "Examples → Converter", enterValues: "Enter a hex color code", examplesHelper: "Start from an example to understand HEX to RGB, then change it to your own color code.",
    metric: "Simple", imperial: "Detailed", exampleCards: "Example cards", baselineExample: "Sky blue · #38bdf8", activeExample: "Dark slate", flowDemo: "#38bdf8", calculator: "Converter",
    participants: "HEX color code", averageHourlyRate: "Red R (0-255)", durationHours: "Green G (0-255)", meetingsPerMonth: "Blue B (0-255)",
    resultCard: "HEX to RGB result", unit: "RGB value", primaryValue: "Headline number", maintenanceTarget: "RGB value", actionTarget: "HSL", estimatedTdee: "RGB value", maintenance: "RGB", fatLossTarget: "Relative luminance",
    meetingCost: "RGB", monthlyEquiv: "HSL", weeklyEquiv: "Red R", dailyEquiv: "Relative luminance", effectiveHours: "Luminance band",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band color luminance matrix", tdeeMatrixNote: "L7 fixed six-band matrix — places relative luminance into common ranges. This is a design reference, not a formal accessibility verdict.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Turn the color data into a usable palette", conversionNote: "L9 reflects your current conversion — RGB, HSL, and relative luminance — to help you decide on text, background, and contrast setup.",
    progressInsight: "Progress insight", possibleTarget: "Your current color data", dailyGap: "Relative luminance", weeklyTrend: "RGB value", motivation: "Motivation", keepMomentum: "Move from a single code to a full palette system",
    saveShareJourney: "Save / share", journeyTitle: "Take today’s color data back to your project", journeyHint: "Recalculate whenever your brand color, theme color, or contrast rules change — and track whether colors meet accessibility needs.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use RGB to HEX to verify the code in reverse", nextActionItem2: "Use HEX to HSL to get hue and saturation data", nextActionItem3: "Use Color Contrast Checker to verify text readability",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with a friend", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "HEX → RGB → HSL → Contrast check", bmrStep: "HEX code", deficitStep: "RGB value", trendStep: "HSL", mealStep: "Contrast check",
    knowledge: "Knowledge", knowledgeTitle: "What HEX to RGB means in front-end and design", definition: "Definition", definitionText: "A hex code is an RGB color written in hexadecimal. Each pair of digits represents one of the red, green, and blue channels (0-255). Converted to RGB, it can be used in CSS, design tools, and calculations.",
    formula: "Formula", formulaText: "R = first two hex digits (base 16 to base 10), G = middle two, B = last two. Relative luminance per WCAG 2.1 linearizes and weights the channels: 0.2126R + 0.7152G + 0.0722B.",
    limitations: "Limitations", limitationsText: "This tool only converts color values and relative luminance. It does not account for color gamut, ICC profiles, monitor calibration, or brand-guideline differences.",
    interpretation: "Interpretation", interpretationText: "Identical RGB values do not guarantee identical appearance across screens; relative luminance is only the basis for contrast, and readability must still be judged together with the foreground color.",
    context: "Context", contextText: "Read color conversion together with contrast ratio, font size, background color, and brand guidelines — not just a single RGB figure.",
    example: "Example", exampleText: "HEX #38bdf8 converts to R=56, G=189, B=248, HSL approximately (199°, 92%, 60%), with relative luminance around 0.49 — in the light band.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for color work", premiumTitle: "Pro Color Toolkit", premiumText: "Unlock batch hex conversion, palette export, contrast reports, and brand color-guideline checks.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool is for educational and development purposes only and is not a substitute for a formal accessibility audit or brand color guidelines.", relatedTools: "Related tools", relatedToolsText: "RGB to HEX · HEX to HSL · Color Contrast Checker · Color Palette Generator", references: "References", referencesText: "W3C WCAG 2.1 relative luminance definition; CSS Color Module Level 4; MDN color value documentation; sRGB color space specification.",
    q1: "What is the difference between HEX and RGB?", a1: "Both describe the same color. HEX uses a hexadecimal string; RGB uses three numbers from 0-255. Converting is just a different notation — the color itself does not change.",
    q2: "Can three-digit HEX (like #abc) be converted?", a2: "Yes. A three-digit HEX duplicates each digit, so #abc equals #aabbcc, then converts to RGB with the normal rules.",
    q3: "How is HEX with alpha (8 digits) handled?", a3: "The first 6 digits are still RGB; the last 2 are the alpha channel (0-255). By default this tool converts the RGB channels and the alpha can be handled separately.",
    q4: "Can relative luminance alone decide if contrast is enough?", a4: "No, not on its own. Relative luminance is only the basis for the contrast ratio; you need both foreground and background colors to compute the ratio, then compare it to the WCAG standard.",
    q5: "Does a larger RGB value always mean brighter?", a5: "Not necessarily. The human eye is most sensitive to green and least to blue, so relative luminance weights R, G, and B differently — you cannot just look at the numbers.",
    q6: "Can this tool replace design guidelines?", a6: "No. It is an educational and development conversion. Real color choices must still consider brand guidelines, accessibility contrast, and display differences across devices.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function HexToRgb() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [participants, setParticipants] = useState("#38bdf8");
  const [averageHourlyRate, setAverageHourlyRate] = useState("56");
  const [durationHours, setDurationHours] = useState("189");
  const [meetingsPerMonth, setMeetingsPerMonth] = useState("248");
  const t = ui[lang];

  const result = useMemo(() => {
    const parseHex = (raw: string) => {
      let h = (raw || "").trim().replace(/^#/, "");
      if (h.length === 3) h = h.split("").map((c) => c + c).join("");
      if (h.length === 8) h = h.slice(0, 6);
      if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
      return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
    };
    const parsed = parseHex(participants);
    const r = parsed ? parsed.r : (Number(averageHourlyRate) || 0);
    const g = parsed ? parsed.g : (Number(durationHours) || 0);
    const b = parsed ? parsed.b : (Number(meetingsPerMonth) || 0);
    const rgbToHsl = (rr: number, gg: number, bb: number) => {
      const rn = rr / 255, gn = gg / 255, bn = bb / 255;
      const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
      let hue = 0; const lum = (max + min) / 2; const d = max - min;
      const sat = d === 0 ? 0 : d / (1 - Math.abs(2 * lum - 1));
      if (d !== 0) {
        if (max === rn) hue = ((gn - bn) / d) % 6;
        else if (max === gn) hue = (bn - rn) / d + 2;
        else hue = (rn - gn) / d + 4;
        hue *= 60; if (hue < 0) hue += 360;
      }
      return { h: hue, s: sat * 100, l: lum * 100 };
    };
    const relLuminance = (rr: number, gg: number, bb: number) => {
      const lin = (c: number) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
      return 0.2126 * lin(rr) + 0.7152 * lin(gg) + 0.0722 * lin(bb);
    };
    const hsl = rgbToHsl(r, g, b);
    const luminance = relLuminance(r, g, b);
    return { r, g, b, hsl, luminance, rgbSum: r + g + b };
  }, [participants, averageHourlyRate, durationHours, meetingsPerMonth]);

  const meetingDisplay = `${fmt(result.r, 0)}, ${fmt(result.g, 0)}, ${fmt(result.b, 0)}`;
  const monthlyDisplay = `${fmt(result.hsl.h, 0)}°, ${fmt(result.hsl.s, 0)}%, ${fmt(result.hsl.l, 0)}%`;

  function fillSolid() { setUnit("metric"); setParticipants("#38bdf8"); setAverageHourlyRate("56"); setDurationHours("189"); setMeetingsPerMonth("248"); }
  function fillHighSalary() { setUnit("imperial"); setParticipants("#1e293b"); setAverageHourlyRate("30"); setDurationHours("41"); setMeetingsPerMonth("59"); }

  const activeBand = bands.find(b => {
    const r = result.luminance;
    if (r < 0.05) return b.key === "veryDark";
    if (r < 0.2) return b.key === "dark";
    if (r < 0.4) return b.key === "mid";
    if (r < 0.7) return b.key === "light";
    if (r < 0.9) return b.key === "veryLight";
    return b.key === "nearWhite";
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#fef3c7,_#f8fafc_45%,_#e0f2fe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-amber-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-amber-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{meetingDisplay}</div><div className="text-sm font-bold text-amber-100">{lang === "zh" ? "RGB" : "RGB"}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{meetingDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{participants}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{fmt(result.luminance, 2)}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">56,189,248</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "天空藍 · 淺色" : "Sky blue · light"}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">30,41,59</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "深板岩 · 深色" : "Dark slate · dark"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.participants}<input type="text" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={participants} onChange={(e) => setParticipants(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.averageHourlyRate}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={averageHourlyRate} onChange={(e) => setAverageHourlyRate(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.durationHours}<input type="number" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={durationHours} onChange={(e) => setDurationHours(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.meetingsPerMonth}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={meetingsPerMonth} onChange={(e) => setMeetingsPerMonth(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{meetingDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.estimatedTdee}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.monthlyEquiv}</div><div className="mt-1 text-xl font-black">{monthlyDisplay}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "HSL" : "HSL"}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.weeklyEquiv}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "紅綠藍" : "RGB"}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fmt(result.rgbSum, 0)}</p><p className="text-sm font-bold text-emerald-700">{lang === "zh" ? "/總和" : "/sum"}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.dailyEquiv}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "亮度" : "Luminance"}</div><p className="mt-2 text-3xl font-black text-blue-950">{fmt(result.luminance, 2)}</p><p className="text-sm font-bold text-blue-700">{lang === "zh" ? "/相對" : "/rel"}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.effectiveHours}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "等級" : "Band"}</div><p className="mt-2 text-3xl font-black text-slate-950">{activeBand ? l(activeBand.label, lang) : "—"}</p><p className="text-sm font-bold text-slate-700">{lang === "zh" ? "亮度區" : "/band"}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="hex-to-rgb-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "RGB" : "RGB"}</div><div className="mt-1 text-3xl font-black">{meetingDisplay}</div></div><div className="rounded-2xl bg-amber-50 p-4"><div className="text-xs font-black uppercase text-amber-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-amber-950">{meetingDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{fmt(result.luminance, 2)}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "HEX" : "HEX", note: t.bmrStep }, { label: lang === "zh" ? "RGB" : "RGB", note: t.deficitStep }, { label: lang === "zh" ? "HSL" : "HSL", note: t.trendStep }, { label: lang === "zh" ? "對比" : "Contrast", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位：廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="hex-to-rgb-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["批次", "色票", "對比", "報告"] : ["Batch", "Palette", "Contrast", "Reports"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
