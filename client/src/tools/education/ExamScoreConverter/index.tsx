import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
const l = (v: LocalText, lang: Lang) => v[lang];

function toGPA(p: number): number {
  if (p >= 93) return 4.0;
  if (p >= 90) return 3.7;
  if (p >= 87) return 3.3;
  if (p >= 83) return 3.0;
  if (p >= 80) return 2.7;
  if (p >= 77) return 2.3;
  if (p >= 73) return 2.0;
  if (p >= 70) return 1.7;
  if (p >= 67) return 1.3;
  if (p >= 63) return 1.0;
  if (p >= 60) return 0.7;
  return 0.0;
}
function toLetter(p: number): string {
  if (p >= 93) return "A";
  if (p >= 90) return "A-";
  if (p >= 87) return "B+";
  if (p >= 83) return "B";
  if (p >= 80) return "B-";
  if (p >= 77) return "C+";
  if (p >= 73) return "C";
  if (p >= 70) return "C-";
  if (p >= 67) return "D+";
  if (p >= 63) return "D";
  if (p >= 60) return "D-";
  return "F";
}
function toTwGrade(p: number): LocalText {
  if (p >= 90) return { zh: "優", en: "Excellent" };
  if (p >= 80) return { zh: "甲", en: "Good" };
  if (p >= 70) return { zh: "乙", en: "Fair" };
  if (p >= 60) return { zh: "丙", en: "Pass" };
  return { zh: "丁", en: "Fail" };
}

export default function ExamScoreConverter() {
  const { lang, setLang } = useLanguage();
  const [score, setScore] = useState<number>(85);
  const [mean, setMean] = useState<number>(75);
  const [sd, setSd] = useState<number>(10);

  const result = useMemo(() => {
    const p = Math.max(0, Math.min(100, score));
    const gpa = toGPA(p);
    const letter = toLetter(p);
    const twGrade = toTwGrade(p);
    const zScore = sd > 0 ? (p - mean) / sd : 0;
    const tScore = 50 + zScore * 10;
    const passed = p >= 60;
    return { p, gpa, letter, twGrade, zScore, tScore, passed };
  }, [score, mean, sd]);

  const outputText = useMemo(() => {
    const rows: [LocalText, string][] = [
      [{ zh: "百分制", en: "Percentage" }, `${result.p}`],
      [{ zh: "GPA (4.0制)", en: "GPA (4.0 scale)" }, `${result.gpa.toFixed(2)}`],
      [{ zh: "等第 (字母)", en: "Letter Grade" }, `${result.letter}`],
      [{ zh: "台灣等第", en: "Taiwan Grade" }, `${l(result.twGrade, lang)}`],
      [{ zh: "Z 分數", en: "Z-Score" }, `${result.zScore.toFixed(2)}`],
      [{ zh: "T 分數", en: "T-Score" }, `${result.tScore.toFixed(1)}`],
      [{ zh: "是否及格", en: "Pass/Fail" }, `${result.passed ? l({ zh: "及格", en: "Pass" }, lang) : l({ zh: "不及格", en: "Fail" }, lang)}`],
    ];
    return rows.map(([label, val]) => `${l(label, lang).padEnd(16)}: ${val}`).join("\n");
  }, [result, lang]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-50">
      {/* L1-Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-600 to-cyan-700 py-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-6 text-center">
          <h1 className="text-4xl font-black text-white drop-shadow-lg">{l({ zh: "考試分數換算器", en: "Exam Score Converter" }, lang)}</h1>
          <p className="mt-3 text-lg font-black text-sky-100">{l({ zh: "百分制、GPA、等第制、標準分數互相換算，支援多種評分系統", en: "Convert between percentage, GPA, letter grade, and standard scores across grading systems" }, lang)}</p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button onClick={() => setLang("zh")} className={`rounded-full px-4 py-1.5 font-black transition ${lang === "zh" ? "bg-white text-sky-700" : "bg-sky-500/40 text-white"}`}>{l({ zh: "中文", en: "Chinese" }, lang)}</button>
            <button onClick={() => setLang("en")} className={`rounded-full px-4 py-1.5 font-black transition ${lang === "en" ? "bg-white text-sky-700" : "bg-sky-500/40 text-white"}`}>{l({ zh: "EN", en: "EN" }, lang)}</button>
          </div>
        </div>
      </section>

      <AdSenseWrapper showAds={true} adSlot="edu-exam-top" adFormat="horizontal" className="my-2" />

      {/* L2-TrustIntro */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="mx-auto max-w-7xl rounded-[2rem] bg-white/80 p-6 shadow-lg backdrop-blur-xl">
          <h2 className="text-xl font-black text-sky-800">{l({ zh: "為什麼需要分數換算器？", en: "Why a Score Converter?" }, lang)}</h2>
          <p className="mt-2 font-black text-gray-600">{l({ zh: "全球不同教育體系使用不同的評分標準：美國用 4.0 GPA、台灣用百分制與等第、許多國家用字母等第。申請留學、轉學或求職時，常需在不同系統間換算成績。本工具一次完成百分制、GPA、字母等第、台灣等第與標準分數的換算。所有計算在本地完成。", en: "Education systems worldwide use different grading standards: US uses 4.0 GPA, Taiwan uses percentage and grades, many countries use letter grades. When applying abroad, transferring, or job hunting, you often need to convert scores. This tool converts percentage, GPA, letter, Taiwan grade, and standard scores at once. All calculations happen locally." }, lang)}</p>
        </div>
      </section>

      {/* L3-QuickStartExample */}
      <section className="mx-auto max-w-7xl px-4 py-4">
        <div className="mx-auto max-w-7xl rounded-[2rem] bg-sky-50/80 p-6">
          <h3 className="font-black text-sky-700">{l({ zh: "快速上手", en: "Quick Start" }, lang)}</h3>
          <div className="mt-3 grid gap-4 lg:grid-cols-2">
            <button onClick={() => { setScore(92); setMean(75); setSd(10); }} className="rounded-xl bg-white p-4 text-left font-black shadow-sm transition hover:shadow-md">
              <p className="font-black text-sky-600">{l({ zh: "範例：92 分", en: "Example: 92 points" }, lang)}</p>
              <p className="mt-1 font-black text-gray-500">{l({ zh: "A- · GPA 3.7 · 優 · 點擊載入", en: "A- · GPA 3.7 · Excellent · Click to load" }, lang)}</p>
            </button>
            <button onClick={() => { setScore(68); setMean(75); setSd(10); }} className="rounded-xl bg-white p-4 text-left font-black shadow-sm transition hover:shadow-md">
              <p className="font-black text-cyan-600">{l({ zh: "範例：68 分", en: "Example: 68 points" }, lang)}</p>
              <p className="mt-1 font-black text-gray-500">{l({ zh: "D+ · GPA 1.3 · 丙 · 點擊載入", en: "D+ · GPA 1.3 · Pass · Click to load" }, lang)}</p>
            </button>
          </div>
        </div>
      </section>

      {/* L4-InputGuidance */}
      <section className="mx-auto max-w-7xl px-4 py-4">
        <div className="mx-auto max-w-7xl rounded-[2rem] bg-white/80 p-6 shadow backdrop-blur-xl">
          <h3 className="font-black text-sky-800">{l({ zh: "輸入說明", en: "Input Guidance" }, lang)}</h3>
          <p className="mt-2 font-black text-gray-600">{l({ zh: "輸入你的百分制分數（0-100），系統自動換算成 GPA、字母等第與台灣等第。若要計算 Z 分數與 T 分數，請額外輸入班級平均分與標準差。所有處理在本地完成。", en: "Enter your percentage score (0-100), and the system auto-converts to GPA, letter grade, and Taiwan grade. To calculate Z-score and T-score, also enter class mean and standard deviation. All processing happens locally." }, lang)}</p>
        </div>
      </section>

      {/* L5-CalculatorInput */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="mx-auto max-w-7xl rounded-[2rem] bg-white/90 p-6 shadow-lg backdrop-blur-xl">
          <h3 className="mb-4 text-lg font-black text-sky-800">{l({ zh: "分數輸入", en: "Score Input" }, lang)}</h3>
          <div className="grid gap-4 lg:grid-cols-3">
            <div>
              <label className="font-black text-sky-700">{l({ zh: "百分制分數", en: "Percentage Score" }, lang)}</label>
              <input type="number" value={score} onChange={e => setScore(parseFloat(e.target.value) || 0)}
                className="mt-1 w-full rounded-xl border-2 border-sky-200 p-3 font-black focus:border-sky-500 focus:outline-none" min={0} max={100} />
              <p className="mt-1 text-xs font-black text-sky-500">{l({ zh: "0 到 100 之間", en: "Between 0 and 100" }, lang)}</p>
            </div>
            <div>
              <label className="font-black text-cyan-700">{l({ zh: "班級平均分", en: "Class Mean" }, lang)}</label>
              <input type="number" value={mean} onChange={e => setMean(parseFloat(e.target.value) || 0)}
                className="mt-1 w-full rounded-xl border-2 border-cyan-200 p-3 font-black focus:border-cyan-500 focus:outline-none" min={0} max={100} />
              <p className="mt-1 text-xs font-black text-cyan-500">{l({ zh: "用於 Z/T 分數", en: "For Z/T scores" }, lang)}</p>
            </div>
            <div>
              <label className="font-black text-blue-700">{l({ zh: "標準差", en: "Std Deviation" }, lang)}</label>
              <input type="number" value={sd} onChange={e => setSd(parseFloat(e.target.value) || 0)}
                className="mt-1 w-full rounded-xl border-2 border-blue-200 p-3 font-black focus:border-blue-500 focus:outline-none" min={0} />
              <p className="mt-1 text-xs font-black text-blue-500">{l({ zh: "用於 Z/T 分數", en: "For Z/T scores" }, lang)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* L6-PrimaryResult */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-[2rem] bg-slate-950 p-6 shadow-lg">
          <h3 className="font-black text-sky-400">{l({ zh: "換算結果", en: "Conversion Result" }, lang)}</h3>
          <pre className="mt-2 max-h-72 overflow-auto rounded-2xl bg-slate-950 p-4 font-mono text-xs text-emerald-200">
{outputText}
          </pre>
        </div>
      </section>

      {/* L7-ResultIntelligence */}
      <section className="mx-auto max-w-7xl px-4 py-4">
        <div className="mx-auto max-w-7xl rounded-[2rem] bg-white/80 p-6 shadow">
          <h3 className="font-black text-sky-800">{l({ zh: "結果分析", en: "Result Intelligence" }, lang)}</h3>
          <div className="mt-3 grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl bg-sky-50 p-4">
              <dt className="text-sm font-black text-sky-600">{l({ zh: "GPA 等第", en: "GPA Grade" }, lang)}</dt>
              <dd className="mt-1 text-2xl font-black text-sky-800">{result.gpa.toFixed(2)} ({result.letter})</dd>
              <dd className="mt-1 text-xs font-black text-sky-500">{l({ zh: "美國 4.0 制標準", en: "US 4.0 scale standard" }, lang)}</dd>
            </div>
            <div className="rounded-xl bg-cyan-50 p-4">
              <dt className="text-sm font-black text-cyan-600">{l({ zh: "相對排名", en: "Relative Rank" }, lang)}</dt>
              <dd className="mt-1 text-2xl font-black text-cyan-800">{result.zScore > 0 ? "+" : ""}{result.zScore.toFixed(2)}σ</dd>
              <dd className="mt-1 text-xs font-black text-cyan-500">{l({ zh: "高於/低於平均的標準差", en: "Std devs above/below mean" }, lang)}</dd>
            </div>
            <div className="rounded-xl bg-blue-50 p-4">
              <dt className="text-sm font-black text-blue-600">{l({ zh: "及格狀態", en: "Pass Status" }, lang)}</dt>
              <dd className="mt-1 text-2xl font-black text-blue-800">{result.passed ? l({ zh: "及格 ✓", en: "Pass ✓" }, lang) : l({ zh: "不及格 ✗", en: "Fail ✗" }, lang)}</dd>
              <dd className="mt-1 text-xs font-black text-blue-500">{l({ zh: "以 60 分為及格線", en: "60 points as passing line" }, lang)}</dd>
            </div>
          </div>
        </div>
      </section>

      <AdSlot slot="edu-exam-mid1" position="inline" />

      {/* L8-ScenarioComparison */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-[2rem] bg-white/80 p-6 shadow-lg">
          <h3 className="font-black text-sky-800">{l({ zh: "情境比較", en: "Scenario Comparison" }, lang)}</h3>
          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto]">
            <div className="rounded-xl bg-sky-50 p-4">
              <h4 className="font-black text-sky-700">{l({ zh: "留學申請", en: "Study Abroad Application" }, lang)}</h4>
              <p className="mt-2 text-sm font-black text-gray-600">{l({ zh: "美國研究所通常要求 GPA 3.0 以上，頂尖學校要求 3.5 以上。台灣百分制需換算為 4.0 制，注意各校換算標準可能不同。", en: "US grad schools usually require GPA 3.0+, top schools 3.5+. Taiwan percentage must convert to 4.0 scale; note conversion standards vary by school." }, lang)}</p>
              <p className="mt-2 text-xs font-black text-sky-500">{l({ zh: "建議：以官方 WES 認證換算為準", en: "Tip: Use official WES certification for conversion" }, lang)}</p>
            </div>
            <div className="rounded-xl bg-cyan-50 p-4">
              <h4 className="font-black text-cyan-700">{l({ zh: "獎學金評選", en: "Scholarship Selection" }, lang)}</h4>
              <p className="mt-2 text-sm font-black text-gray-600">{l({ zh: "獎學金常以相對排名（Z 分數/百分位）評選，而非絕對分數。同樣 85 分，在高分群與低分群的相對價值不同。Z 分數能反映你的相對位置。", en: "Scholarships often use relative rank (Z-score/percentile), not absolute scores. The same 85 has different value in high vs low scoring groups. Z-score reflects your relative position." }, lang)}</p>
              <p className="mt-2 text-xs font-black text-cyan-500">{l({ zh: "建議：關注 Z 分數與百分位排名", en: "Tip: Focus on Z-score and percentile rank" }, lang)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* L9-EmotionConversionUpper */}
      <section className="mx-auto max-w-7xl px-4 py-4">
        <div className="rounded-[2rem] bg-gradient-to-r from-sky-100 to-cyan-100 p-6">
          <h3 className="font-black text-sky-800">{l({ zh: "同一分數，不同意義", en: "Same Score, Different Meaning" }, lang)}</h3>
          <p className="mt-2 font-black text-gray-600">{l({ zh: "85 分在嚴格評分的班級可能是頂尖，在寬鬆評分的班級可能只是中等。絕對分數無法反映真實實力，標準分數（Z/T）才能跨班級、跨考試公平比較。理解分數的相對意義，是教育評量的核心。", en: "85 might be top in a strictly graded class but average in a leniently graded one. Absolute scores don't reflect true ability; standard scores (Z/T) allow fair cross-class, cross-exam comparison. Understanding relative meaning is core to educational assessment." }, lang)}</p>
        </div>
      </section>

      {/* L10-EmotionConversionLower */}
      <section className="mx-auto max-w-7xl px-4 py-4">
        <div className="rounded-[2rem] bg-gradient-to-r from-cyan-100 to-blue-100 p-6">
          <h3 className="font-black text-cyan-800">{l({ zh: "換算錯誤的代價", en: "The Cost of Conversion Errors" }, lang)}</h3>
          <p className="mt-2 font-black text-gray-600">{l({ zh: "申請留學時，GPA 換算錯誤可能讓你錯失夢想學校，或被誤判為不符資格。一個小數點的差異，可能決定錄取與否。精確換算，是申請成功的第一步。", en: "When applying abroad, GPA conversion errors can cost you your dream school or get you misjudged as unqualified. One decimal difference can decide admission. Accurate conversion is the first step to success." }, lang)}</p>
        </div>
      </section>

      {/* L11-DecisionPath */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-[2rem] bg-white/80 p-6 shadow">
          <h3 className="font-black text-sky-800">{l({ zh: "決策路徑", en: "Decision Path" }, lang)}</h3>
          <div className="mt-3 grid gap-4 lg:grid-cols-[1fr_auto]">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-600 text-sm font-black text-white">1</span>
              <p className="font-black text-gray-700">{l({ zh: "申請美國學校？→ 看 GPA 4.0 制換算", en: "Applying US schools? → Use GPA 4.0 scale conversion" }, lang)}</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-600 text-sm font-black text-white">2</span>
              <p className="font-black text-gray-700">{l({ zh: "比較不同考試成績？→ 看 Z/T 標準分數", en: "Comparing different exams? → Use Z/T standard scores" }, lang)}</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white">3</span>
              <p className="font-black text-gray-700">{l({ zh: "台灣升學？→ 看百分制與等第", en: "Taiwan admission? → Use percentage and grade" }, lang)}</p>
            </div>
          </div>
        </div>
      </section>

      <AdSenseWrapper showAds={true} adSlot="edu-exam-mid2" adFormat="horizontal" className="my-2" />

      {/* L12-Knowledge */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-[2rem] bg-sky-50/80 p-6">
          <h3 className="font-black text-sky-800">{l({ zh: "知識庫", en: "Knowledge Base" }, lang)}</h3>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <h4 className="font-black text-sky-700">{l({ zh: "GPA 換算標準", en: "GPA Conversion Standard" }, lang)}</h4>
              <p className="mt-2 text-sm font-black text-gray-600">{l({ zh: "美國標準 4.0 制：A(93-100)=4.0、A-(90-92)=3.7、B+(87-89)=3.3、B(83-86)=3.0，依此類推。各校可能微調，部分使用 4.3 或 4.5 制。換算時務必確認目標學校的標準。", en: "US standard 4.0 scale: A(93-100)=4.0, A-(90-92)=3.7, B+(87-89)=3.3, B(83-86)=3.0, etc. Schools may adjust; some use 4.3 or 4.5 scales. Always confirm the target school's standard." }, lang)}</p>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <h4 className="font-black text-cyan-700">{l({ zh: "Z 分數與 T 分數", en: "Z-Score and T-Score" }, lang)}</h4>
              <p className="mt-2 text-sm font-black text-gray-600">{l({ zh: "Z 分數 = (分數 − 平均) / 標準差，表示你高於或低於平均幾個標準差。T 分數 = 50 + 10×Z，平均為 50、標準差為 10，避免負數，更易理解。兩者都用於跨群體比較。", en: "Z-score = (score − mean) / SD, showing how many SDs above/below average. T-score = 50 + 10×Z, with mean 50 and SD 10, avoiding negatives for easier interpretation. Both enable cross-group comparison." }, lang)}</p>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <h4 className="font-black text-blue-700">{l({ zh: "百分位排名", en: "Percentile Rank" }, lang)}</h4>
              <p className="mt-2 text-sm font-black text-gray-600">{l({ zh: "百分位表示你贏過多少比例的人。例如 PR90 表示你贏過 90% 的人。在常態分布下，Z=0 對應 PR50，Z=+1 約 PR84，Z=+2 約 PR98。升學考試常用百分位排名。", en: "Percentile shows what proportion you beat. PR90 means you beat 90% of people. Under normal distribution, Z=0 is PR50, Z=+1 is ~PR84, Z=+2 is ~PR98. Admission exams often use percentile rank." }, lang)}</p>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <h4 className="font-black text-sky-700">{l({ zh: "各國評分系統", en: "Grading Systems Worldwide" }, lang)}</h4>
              <p className="mt-2 text-sm font-black text-gray-600">{l({ zh: "美國：4.0 GPA + 字母等第。英國：First/2:1/2:2/Third。德國：1.0(最佳)到 5.0(不及格)。台灣：百分制 + 優甲乙丙丁。換算時須注意方向與基準的差異。", en: "US: 4.0 GPA + letters. UK: First/2:1/2:2/Third. Germany: 1.0(best) to 5.0(fail). Taiwan: percentage + grades. Note direction and baseline differences when converting." }, lang)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* L13-FAQ */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-[2rem] bg-white/80 p-6 shadow">
          <h3 className="font-black text-sky-800">{l({ zh: "常見問題", en: "FAQ" }, lang)}</h3>
          <div className="mt-4 space-y-4">
            <details className="rounded-xl bg-sky-50 p-4">
              <summary className="cursor-pointer font-black text-sky-700">{l({ zh: "GPA 換算有統一標準嗎？", en: "Is there a unified GPA conversion standard?" }, lang)}</summary>
              <p className="mt-2 font-black text-gray-600">{l({ zh: "沒有完全統一的標準。本工具使用最常見的美國 4.0 制標準，但各大學、各認證機構（如 WES、ECE）可能有不同換算表。申請時務必使用目標學校認可的換算方式。", en: "There is no fully unified standard. This tool uses the most common US 4.0 scale, but universities and credential agencies (WES, ECE) may use different tables. Always use the conversion accepted by your target school." }, lang)}</p>
            </details>
            <details className="rounded-xl bg-cyan-50 p-4">
              <summary className="cursor-pointer font-black text-cyan-700">{l({ zh: "Z 分數和百分位有什麼不同？", en: "Difference between Z-score and percentile?" }, lang)}</summary>
              <p className="mt-2 font-black text-gray-600">{l({ zh: "Z 分數是標準差的倍數，可為負數；百分位是贏過的人數比例，介於 0-100。兩者可互相換算（透過常態分布表）。Z 分數適合統計運算，百分位適合直觀理解排名。", en: "Z-score is multiples of SD, can be negative; percentile is the proportion you beat, 0-100. They convert via normal distribution tables. Z-score suits statistical calculation, percentile suits intuitive ranking." }, lang)}</p>
            </details>
            <details className="rounded-xl bg-blue-50 p-4">
              <summary className="cursor-pointer font-black text-blue-700">{l({ zh: "及格線一定是 60 分嗎？", en: "Is the passing line always 60?" }, lang)}</summary>
              <p className="mt-2 font-black text-gray-600">{l({ zh: "不一定。台灣多數學校以 60 分為及格線，但研究所常要求 70 分以上、某些專業課程要求 80 分。本工具預設 60 分為及格線，實際標準請參考你的學校規定。", en: "Not necessarily. Most Taiwan schools use 60 as passing, but grad schools often require 70+, and some professional courses 80+. This tool defaults to 60; check your school's actual rules." }, lang)}</p>
            </details>
            <details className="rounded-xl bg-sky-50 p-4">
              <summary className="cursor-pointer font-black text-sky-700">{l({ zh: "標準差為 0 時怎麼辦？", en: "What if standard deviation is 0?" }, lang)}</summary>
              <p className="mt-2 font-black text-gray-600">{l({ zh: "標準差為 0 表示全班分數相同，此時無法計算 Z/T 分數（除以零）。本工具會將 Z 分數顯示為 0。實務上標準差為 0 極罕見，通常表示資料異常。", en: "SD of 0 means all scores are identical, making Z/T calculation impossible (division by zero). This tool shows Z-score as 0. In practice, SD of 0 is extremely rare and usually indicates data anomaly." }, lang)}</p>
            </details>
          </div>
        </div>
      </section>

      {/* L14-FAQAfterAdSlot */}
      <section className="mx-auto max-w-7xl px-4 py-2">
        <AdSlot slot="edu-exam-faq" position="inline" />
      </section>

      {/* L15-AffiliateResources */}
      <section className="mx-auto max-w-7xl px-4 py-4">
        <div className="rounded-[2rem] bg-gradient-to-r from-sky-50 to-cyan-50 p-6">
          <h3 className="font-black text-sky-800">{l({ zh: "推薦資源", en: "Recommended Resources" }, lang)}</h3>
          <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_auto]">
            <a href="https://www.wes.org" target="_blank" rel="noopener"
              className="rounded-xl bg-white p-3 shadow-sm transition hover:shadow-md">
              <p className="font-black text-sky-700">WES</p>
              <p className="text-xs font-black text-gray-500">{l({ zh: "國際學歷認證換算", en: "International credential evaluation" }, lang)}</p>
            </a>
            <a href="https://www.ets.org" target="_blank" rel="noopener"
              className="rounded-xl bg-white p-3 shadow-sm transition hover:shadow-md">
              <p className="font-black text-cyan-700">ETS</p>
              <p className="text-xs font-black text-gray-500">{l({ zh: "標準化測驗與分數對照", en: "Standardized tests and score tables" }, lang)}</p>
            </a>
          </div>
        </div>
      </section>

      {/* L16-PremiumGate */}
      <section className="mx-auto max-w-7xl px-4 py-4">
        <PremiumGate plan="PRO">
          <div className="rounded-[2rem] bg-gradient-to-r from-amber-50 to-yellow-50 p-6">
            <h3 className="font-black text-amber-800">{l({ zh: "進階功能", en: "Premium Features" }, lang)}</h3>
            <p className="mt-2 font-black text-gray-600">{l({ zh: "升級 PRO 解鎖：多科目 GPA 加權計算、各校自訂換算表、百分位精確計算、成績單批次換算、無廣告體驗。", en: "Upgrade to PRO to unlock: multi-subject weighted GPA, custom school conversion tables, precise percentile calculation, batch transcript conversion, ad-free experience." }, lang)}</p>
          </div>
        </PremiumGate>
      </section>

      {/* L17-TrustRelatedReferences */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-[2rem] bg-white/60 p-6">
          <h3 className="font-black text-sky-800">{l({ zh: "參考來源", en: "References" }, lang)}</h3>
          <div className="mt-3 grid gap-2 lg:grid-cols-2">
            <p className="text-sm font-black text-gray-600">&bull; World Education Services (WES). {l({ zh: "國際學歷換算指南", en: "International credential conversion guide" }, lang)}.</p>
            <p className="text-sm font-black text-gray-600">&bull; Educational Testing Service. <em>Standard Score Interpretation</em>.</p>
            <p className="text-sm font-black text-gray-600">&bull; {l({ zh: "教育部", en: "Ministry of Education" }, lang)}. {l({ zh: "成績評量等第對照", en: "Grade assessment comparison" }, lang)}.</p>
            <p className="text-sm font-black text-gray-600">&bull; Allen, M.J. &amp; Yen, W.M. (2001). <em>Introduction to Measurement Theory</em>.</p>
          </div>
        </div>
      </section>

      <footer className="py-6 text-center text-xs font-black text-gray-400">
        {l({ zh: "考試分數換算器 © 2026 — 瀏覽器端工具，零資料傳輸", en: "Exam Score Converter © 2026 — Browser-based tool, zero data transmission" }, lang)}
      </footer>
    </div>
  );
}
