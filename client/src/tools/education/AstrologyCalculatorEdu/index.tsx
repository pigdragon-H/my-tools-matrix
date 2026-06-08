// @profile B
// Profile B · 計算機-YMYL · AstrologyCalculatorEdu（GOLD-STANDARD-001 compatible · cloned from MeetingCost）

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
  { key: "fire", range: "Aries / Leo / Sagittarius", label: { zh: "火象", en: "Fire" }, desc: { zh: "傳統占星把火象星座與行動力與熱情連結，僅供文化參考。", en: "Traditional astrology links fire signs with action and passion — cultural reference only." } },
  { key: "earth", range: "Taurus / Virgo / Capricorn", label: { zh: "土象", en: "Earth" }, desc: { zh: "土象星座常被描述為務實與穩定，這是象徵而非科學結論。", en: "Earth signs are often described as practical and steady — symbolic, not scientific." } },
  { key: "air", range: "Gemini / Libra / Aquarius", label: { zh: "風象", en: "Air" }, desc: { zh: "風象星座傳統上與溝通與思辨相關，屬文化敘事。", en: "Air signs are traditionally linked with communication and ideas — a cultural narrative." } },
  { key: "water", range: "Cancer / Scorpio / Pisces", label: { zh: "水象", en: "Water" }, desc: { zh: "水象星座常被連結到情感與直覺，僅作星座文化介紹。", en: "Water signs are often linked with emotion and intuition — for cultural context only." } },
  { key: "cusp", range: "Cusp date", label: { zh: "星座交界", en: "Cusp" }, desc: { zh: "落在兩星座交界日，不同曆法可能給出不同結果。", en: "Falls on a cusp date — different conventions may give different signs." } },
  { key: "unknown", range: "Not set", label: { zh: "尚未輸入", en: "Not set" }, desc: { zh: "尚未輸入有效日期，請填入月份與日期。", en: "No valid date yet — please enter a month and day." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "生日年齡計算", en: "Age Calculator" }, href: "/tools/education/age-calculator" },
  { label: { zh: "星期幾計算", en: "Day of Week" }, href: "/tools/education/day-of-week-calculator" },
  { label: { zh: "日期相差計算", en: "Date Difference" }, href: "/tools/education/date-difference-calculator" },
  { label: { zh: "生肖查詢", en: "Chinese Zodiac" }, href: "/tools/education/chinese-zodiac-calculator" },
];

const ui = {
  zh: {
    badge: "教育 · 星座查詢 · 黃金工具", switchToEnglish: "中文模式", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Astrology Calculator · 占星計算機（教育用）", subtitle: "用出生月份與日期查詢西洋星座與所屬元素",
    intro: "本工具根據出生月份與日期，依西洋十二星座日期界線判斷對應星座與火土風水四象，作為星座文化的入門教育介紹。",
    trustNoteLabel: "注意事項：", trustNote: "此工具僅作星座文化與日期換算的教育介紹；占星不是科學，結果不應用於決策或預測。",
    quickActionCard: "快速範例卡", tryExample: "一鍵查詢星座範例", examplePreview: "所屬元素", examplePerson: "標準範例", fillExample: "一鍵填入標準範例", previewActivePath: "填入另一個範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入出生月份與日期", examplesHelper: "先用範例理解星座日期界線，再改成自己的生日。",
    metric: "簡易", imperial: "詳細", exampleCards: "範例卡", baselineExample: "範例 · 3 月 25 日", activeExample: "另一範例", flowDemo: "3 / 25", calculator: "計算機",
    participants: "出生月份 (1-12)", averageHourlyRate: "出生日期 (1-31)", durationHours: "曆法 (1=西曆)", meetingsPerMonth: "年份",
    resultCard: "星座查詢結果", unit: "所屬元素", primaryValue: "主要結果", maintenanceTarget: "所屬元素", actionTarget: "星座序號", estimatedTdee: "所屬元素", maintenance: "元素", fatLossTarget: "星座序號",
    meetingCost: "元素", monthlyEquiv: "星座序號", weeklyEquiv: "守護星", dailyEquiv: "陰陽", effectiveHours: "象限等級",
    resultIntelligence: "結果解讀", tdeeMatrix: "四象＋交界六格星座判讀矩陣", tdeeMatrixNote: "L7 固定六格，將星座放進火土風水四象與交界區；這是文化分類介紹，不是命理或預測。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把星座查詢轉成趣味的文化探索", conversionNote: "L9 會連動目前查詢結果，顯示星座、元素與序號，作為了解西洋星座文化的趣味起點。",
    progressInsight: "進度洞察卡", possibleTarget: "目前星座結果", dailyGap: "陰陽", weeklyTrend: "所屬元素", motivation: "動力卡", keepMomentum: "從單一星座走向四象與守護星的文化認識",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的星座查詢分享給朋友", journeyHint: "輸入不同生日比較星座與元素，當成認識西洋星座文化的趣味練習。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用生日年齡計算了解確切年齡", nextActionItem2: "用星期幾計算查詢出生那天是星期幾", nextActionItem3: "用生肖查詢比較東方生肖文化",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "生日 → 星座 → 元素 → 文化探索", bmrStep: "生日", deficitStep: "星座", trendStep: "元素", mealStep: "探索",
    knowledge: "知識", knowledgeTitle: "西洋星座在文化中的意義", definition: "定義", definitionText: "西洋星座以太陽在出生時所處的黃道星座區間命名，共十二個，分屬火、土、風、水四象，是源自古代天文與占星傳統的文化分類。",
    formula: "公式", formulaText: "依出生月份與日期對照十二星座日期界線（如牡羊 3/21–4/19），判斷對應星座，再依星座查表得到火土風水的元素歸屬。",
    limitations: "限制", limitationsText: "本工具僅以太陽星座日期界線判斷，不含上升、月亮或行星位置；交界日與不同曆法可能造成差異，且占星不具科學預測力。",
    interpretation: "解讀", interpretationText: "星座與元素是文化象徵，常被用於趣味性的人格描述，但不應作為決策、健康或人際判斷的依據。",
    context: "脈絡", contextText: "星座文化應被當作娛樂與歷史傳統來認識，搭配天文學知識一起看會更完整，而非用來預測未來。",
    example: "範例", exampleText: "出生 3 月 25 日落在牡羊座（3/21–4/19），屬於火象星座，序號為第 1 個星座。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "日期與文化探索的下一步工具", premiumTitle: "專業版星座文化工具包", premiumText: "解鎖太陽月亮上升簡介、四象比較、星座文化小百科與分享卡片。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供星座文化教育與娛樂用途，占星不是科學，結果不應用於任何重要決策。", relatedTools: "相關工具", relatedToolsText: "生日年齡計算 · 星期幾計算 · 日期相差計算 · 生肖查詢", references: "參考資料", referencesText: "西洋十二星座日期界線；黃道帶與四象分類；天文學黃道概念說明；占星文化史介紹。",
    q1: "星座是怎麼決定的？", a1: "西洋星座以太陽在出生時所在的黃道星座區間決定，依出生月份與日期對照十二星座的日期界線即可查出對應星座。",
    q2: "交界日的星座怎麼算？", a2: "落在兩星座交界日（如 4 月 19–20 日）時，不同曆法或來源可能給出不同結果，建議以多個來源交叉確認，並理解這只是文化分類。",
    q3: "四象是什麼意思？", a3: "十二星座被分成火、土、風、水四象，每象各三個星座，是傳統占星用來分類性格傾向的象徵框架，屬文化敘事而非科學。",
    q4: "星座準嗎？", a4: "占星不具科學預測效力，星座描述多為廣泛適用的說法。把它當成文化與娛樂即可，不應作為決策依據。",
    q5: "西洋星座和生肖一樣嗎？", a5: "不一樣。西洋星座以太陽月份界線為基礎、共十二個；東方生肖以農曆年份為基礎、十二年一循環，兩者來自不同文化傳統。",
    q6: "這個工具能算命嗎？", a6: "不能。它只查詢太陽星座與元素分類，作為文化教育介紹；它不做任何命理推算、運勢預測或人生建議。",
  },
  en: {
    badge: "Education · Zodiac lookup · Gold tool", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Astrology Calculator (Educational)", subtitle: "Look up your Western zodiac sign and element from birth month and day",
    intro: "This tool uses your birth month and day to determine your Western zodiac sign and its fire/earth/air/water element, as an introductory educational overview of zodiac culture.",
    trustNoteLabel: "Note:", trustNote: "This tool is an educational introduction to zodiac culture and date mapping only. Astrology is not science, and results should not be used for decisions or predictions.",
    quickActionCard: "Quick example", tryExample: "Try a zodiac lookup example", examplePreview: "Element", examplePerson: "Standard example", fillExample: "Fill the standard example", previewActivePath: "Try another example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter birth month and day", examplesHelper: "Start from an example to understand the zodiac date boundaries, then change it to your own birthday.",
    metric: "Simple", imperial: "Detailed", exampleCards: "Example cards", baselineExample: "Example · March 25", activeExample: "Another example", flowDemo: "3 / 25", calculator: "Calculator",
    participants: "Birth month (1-12)", averageHourlyRate: "Birth day (1-31)", durationHours: "Calendar (1=Gregorian)", meetingsPerMonth: "Year",
    resultCard: "Zodiac lookup result", unit: "Element", primaryValue: "Main result", maintenanceTarget: "Element", actionTarget: "Sign index", estimatedTdee: "Element", maintenance: "Element", fatLossTarget: "Sign index",
    meetingCost: "Element", monthlyEquiv: "Sign index", weeklyEquiv: "Ruler", dailyEquiv: "Polarity", effectiveHours: "Quadrant band",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Four-element + cusp six-band matrix", tdeeMatrixNote: "L7 fixed six-band matrix — places the sign into fire/earth/air/water and the cusp zone. This is a cultural classification, not divination or prediction.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Turn the lookup into a fun cultural exploration", conversionNote: "L9 reflects your current result — sign, element, and index — as a fun starting point for understanding Western zodiac culture.",
    progressInsight: "Progress insight", possibleTarget: "Your current zodiac result", dailyGap: "Polarity", weeklyTrend: "Element", motivation: "Motivation", keepMomentum: "Move from a single sign to learning the four elements and rulers",
    saveShareJourney: "Save / share", journeyTitle: "Share today’s zodiac lookup with friends", journeyHint: "Enter different birthdays to compare signs and elements as a fun way to learn Western zodiac culture.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use Age Calculator to find the exact age", nextActionItem2: "Use Day of Week to find what weekday the birth date was", nextActionItem3: "Use Chinese Zodiac to compare Eastern zodiac culture",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with a friend", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Birthday → Sign → Element → Exploration", bmrStep: "Birthday", deficitStep: "Sign", trendStep: "Element", mealStep: "Explore",
    knowledge: "Knowledge", knowledgeTitle: "What the Western zodiac means in culture", definition: "Definition", definitionText: "Western zodiac signs are named after the ecliptic constellation the sun occupied at birth — twelve in total, grouped into fire, earth, air, and water elements — a cultural classification from ancient astronomy and astrology traditions.",
    formula: "Formula", formulaText: "Match the birth month and day to the twelve sign date boundaries (e.g. Aries 3/21–4/19) to find the sign, then look up the sign’s fire/earth/air/water element.",
    limitations: "Limitations", limitationsText: "This tool only uses sun-sign date boundaries — no rising, moon, or planetary positions. Cusp dates and different conventions can differ, and astrology has no scientific predictive power.",
    interpretation: "Interpretation", interpretationText: "Signs and elements are cultural symbols often used for fun personality descriptions, but should not be the basis for decisions, health, or interpersonal judgments.",
    context: "Context", contextText: "Zodiac culture should be understood as entertainment and historical tradition, best read alongside astronomy — not used to predict the future.",
    example: "Example", exampleText: "A birthday of March 25 falls in Aries (3/21–4/19), a fire sign, and is the 1st sign by index.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for date and culture exploration", premiumTitle: "Pro Zodiac-Culture Toolkit", premiumText: "Unlock sun/moon/rising intros, four-element comparison, a zodiac-culture mini encyclopedia, and share cards.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool is for zodiac-culture education and entertainment only. Astrology is not science, and results should not be used for any important decision.", relatedTools: "Related tools", relatedToolsText: "Age Calculator · Day of Week · Date Difference · Chinese Zodiac", references: "References", referencesText: "Western twelve-sign date boundaries; the zodiac belt and four-element classification; the astronomical concept of the ecliptic; an introduction to the cultural history of astrology.",
    q1: "How is the zodiac sign determined?", a1: "The Western sign is determined by the ecliptic constellation the sun occupied at birth — match the birth month and day to the twelve sign date boundaries to find it.",
    q2: "How are cusp dates handled?", a2: "On a cusp date between two signs (e.g. April 19–20), different conventions or sources may give different results, so cross-check multiple sources and treat it as cultural classification.",
    q3: "What do the four elements mean?", a3: "The twelve signs are grouped into fire, earth, air, and water, three signs each — a symbolic framework traditional astrology uses to classify tendencies, a cultural narrative rather than science.",
    q4: "Is the zodiac accurate?", a4: "Astrology has no scientific predictive validity, and descriptions are usually broadly applicable. Treat it as culture and entertainment, not a basis for decisions.",
    q5: "Is the Western zodiac the same as the Chinese zodiac?", a5: "No. The Western zodiac is based on solar month boundaries with twelve signs; the Chinese zodiac is based on the lunar year with a twelve-year cycle — they come from different cultural traditions.",
    q6: "Can this tool tell fortunes?", a6: "No. It only looks up the sun sign and element classification as a cultural-education introduction. It does no divination, fortune prediction, or life advice.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

const signs = [
  { from: [3, 21], to: [4, 19], el: "fire", idx: 1 }, { from: [4, 20], to: [5, 20], el: "earth", idx: 2 },
  { from: [5, 21], to: [6, 20], el: "air", idx: 3 }, { from: [6, 21], to: [7, 22], el: "water", idx: 4 },
  { from: [7, 23], to: [8, 22], el: "fire", idx: 5 }, { from: [8, 23], to: [9, 22], el: "earth", idx: 6 },
  { from: [9, 23], to: [10, 22], el: "air", idx: 7 }, { from: [10, 23], to: [11, 21], el: "water", idx: 8 },
  { from: [11, 22], to: [12, 21], el: "fire", idx: 9 }, { from: [12, 22], to: [1, 19], el: "earth", idx: 10 },
  { from: [1, 20], to: [2, 18], el: "air", idx: 11 }, { from: [2, 19], to: [3, 20], el: "water", idx: 12 },
] as const;

export default function AstrologyCalculatorEdu() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [participants, setParticipants] = useState("3");
  const [averageHourlyRate, setAverageHourlyRate] = useState("25");
  const [durationHours, setDurationHours] = useState("1");
  const [meetingsPerMonth, setMeetingsPerMonth] = useState("2000");
  const t = ui[lang];

  const result = useMemo(() => {
    const month = Math.round(Number(participants) || 0);
    const day = Math.round(Number(averageHourlyRate) || 0);
    let element = "unknown";
    let signIndex = 0;
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      for (const s of signs) {
        const [fm, fd] = s.from; const [tm, td] = s.to;
        const inRange = fm === tm
          ? (month === fm && day >= fd && day <= td)
          : ((month === fm && day >= fd) || (month === tm && day <= td));
        if (inRange) { element = s.el; signIndex = s.idx; break; }
      }
    }
    const polarity = element === "fire" || element === "air" ? 1 : (element === "earth" || element === "water" ? 0 : -1);
    return { element, signIndex, polarity };
  }, [participants, averageHourlyRate, durationHours, meetingsPerMonth]);

  const elLabel: Record<string, LocalText> = {
    fire: { zh: "火象", en: "Fire" }, earth: { zh: "土象", en: "Earth" }, air: { zh: "風象", en: "Air" },
    water: { zh: "水象", en: "Water" }, unknown: { zh: "未設定", en: "Not set" },
  };
  const meetingDisplay = l(elLabel[result.element] ?? elLabel.unknown, lang);
  const monthlyDisplay = fmt(result.signIndex, 0);

  function fillSolid() { setUnit("metric"); setParticipants("3"); setAverageHourlyRate("25"); setDurationHours("1"); setMeetingsPerMonth("2000"); }
  function fillHighSalary() { setUnit("imperial"); setParticipants("11"); setAverageHourlyRate("15"); setDurationHours("1"); setMeetingsPerMonth("1995"); }

  const activeBand = bands.find(b => {
    if (result.element === "fire") return b.key === "fire";
    if (result.element === "earth") return b.key === "earth";
    if (result.element === "air") return b.key === "air";
    if (result.element === "water") return b.key === "water";
    return b.key === "unknown";
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
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{meetingDisplay}</div><div className="text-sm font-bold text-amber-100">{lang === "zh" ? "元素" : "element"}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{meetingDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{participants}/{averageHourlyRate}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">#{monthlyDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">{lang === "zh" ? "火象" : "Fire"}</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "3 月 25 日 · 牡羊" : "Mar 25 · Aries"}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">{lang === "zh" ? "火象" : "Fire"}</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "11 月 15 日 · 天蠍" : "Nov 15 · Scorpio"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.participants}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={participants} onChange={(e) => setParticipants(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.averageHourlyRate}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={averageHourlyRate} onChange={(e) => setAverageHourlyRate(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.durationHours}<input type="number" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={durationHours} onChange={(e) => setDurationHours(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.meetingsPerMonth}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={meetingsPerMonth} onChange={(e) => setMeetingsPerMonth(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{meetingDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.estimatedTdee}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.monthlyEquiv}</div><div className="mt-1 text-xl font-black">#{monthlyDisplay}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "序號" : "index"}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.weeklyEquiv}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "陰陽" : "Polarity"}</div><p className="mt-2 text-3xl font-black text-emerald-950">{result.polarity === 1 ? (lang === "zh" ? "陽" : "Yang") : result.polarity === 0 ? (lang === "zh" ? "陰" : "Yin") : "—"}</p><p className="text-sm font-bold text-emerald-700">{lang === "zh" ? "極性" : "pol"}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.dailyEquiv}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "象限" : "Element"}</div><p className="mt-2 text-3xl font-black text-blue-950">{meetingDisplay}</p><p className="text-sm font-bold text-blue-700">{lang === "zh" ? "四象" : "elem"}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.effectiveHours}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "等級" : "Band"}</div><p className="mt-2 text-3xl font-black text-slate-950">{activeBand ? l(activeBand.label, lang) : "—"}</p><p className="text-sm font-bold text-slate-700">{lang === "zh" ? "象限" : "/band"}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="astrology-calculator-edu-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "元素" : "Element"}</div><div className="mt-1 text-3xl font-black">{meetingDisplay}</div></div><div className="rounded-2xl bg-amber-50 p-4"><div className="text-xs font-black uppercase text-amber-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-amber-950">{meetingDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result.polarity === 1 ? (lang === "zh" ? "陽" : "Yang") : result.polarity === 0 ? (lang === "zh" ? "陰" : "Yin") : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "生日" : "Birthday", note: t.bmrStep }, { label: lang === "zh" ? "星座" : "Sign", note: t.deficitStep }, { label: lang === "zh" ? "元素" : "Element", note: t.trendStep }, { label: lang === "zh" ? "探索" : "Explore", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位：廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="astrology-calculator-edu-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["太陽", "月亮", "四象", "卡片"] : ["Sun", "Moon", "Elements", "Cards"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
