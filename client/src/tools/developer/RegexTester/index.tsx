import { useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };

const l = (value: LocalText, lang: Lang) => value[lang];

const ui = {
  zh: {
    badge: "開發者 · 正則表達式測試 · Gold Tool",
    title: "正則表達式測試工具・快速測試正則表達式",
    subtitle: "正則表達式測試工具引導體驗",
    intro: "輸入正則表達式和測試文本，實時顯示匹配結果，支持全局匹配和標誌，快速驗證正則表達式邏輯。",
    trustNoteLabel: "信任提醒：",
    trustNote: "正則表達式是文本處理的強大工具。使用正則測試工具可確保模式正確，提高開發效率。",
    quickActionCard: "快速範例卡",
    tryCommonExample: "試用常見正則表達式範例",
    matchPreview: "匹配預覽",
    example: "範例",
    emailExample: "郵箱驗證",
    phoneExample: "電話號碼",
    oneClickFillEmailExample: "一鍵填入郵箱驗證範例",
    previewPhonePath: "預覽電話號碼匹配路徑",
    examplesRegex: "範例 → 正則測試",
    enterOrPasteRegex: "輸入或粘貼正則表達式",
    examplesHelper: "範例緊貼正則測試工具，讓開發者能快速開始。",
    exampleCards: "範例卡",
    phonePathDemo: "電話號碼匹配示範",
    oneClickFillAllowed: "郵箱驗證正則 · 可一鍵填入",
    emailPathDescription: "郵箱驗證 · 展示模式 → 測試 → 優化路徑",
    flowDemo: "流程示範",
    tester: "正則測試",
    regexInput: "正則表達式",
    testInput: "測試文本",
    testButton: "測試",
    resultCard: "結果卡",
    enterValidRegex: "請輸入有效的正則表達式",
    status: "狀態",
    matchResult: "匹配結果",
    matchCount: "匹配數量",
    recommendedAction: "建議行動",
    relatedNextTool: "下一步工具",
    resultIntelligence: "結果解讀",
    interpretMatchBeforeActing: "行動前先理解匹配結果",
    knowledge: "知識",
    regexMeaning: "正則表達式在開發宇宙中的意義",
    definition: "定義",
    definitionText: "正則表達式是用於匹配字符串的模式。由字符、量詞、特殊符號組成，用於文本搜索、驗證、替換。",
    limitations: "限制",
    limitationsText: "正則表達式複雜度高，容易出錯。不支持嵌套結構。某些語言的實現略有不同。",
    semanticNeighbors: "相關工具",
    semanticNeighborsText: "JSON 驗證器、API 回應格式化、Cron 表達式生成器等工具。",
    formula: "最佳實踐",
    formulaText: "使用簡單的模式、添加註釋、測試邊界情況、避免過度複雜。",
    faq: "常見問題",
    commonQuestions: "常見問題",
    trustRelatedReferences: "信任 · 相關工具 · 參考資料",
    trust: "信任聲明",
    trustText: "正則表達式是文本處理的強大工具。使用正則測試工具可確保模式正確，提高開發效率。",
    relatedTools: "相關工具",
    references: "參考資料",
    referencesText: "MDN 正則表達式、Regex101、RegexPal。",
    recommendedProducts: "配合正則開發使用的工具",
  },
  en: {
    badge: "Developer · Regex Tester · Gold Tool",
    title: "Regex Tester · Quickly Test Regular Expressions",
    subtitle: "Regex Tester guided experience",
    intro: "Enter regex pattern and test text, display match results in real-time, support global matching and flags, quickly verify regex logic.",
    trustNoteLabel: "Trust note:",
    trustNote: "Regular expressions are powerful text processing tools. Using regex tester ensures correct patterns, improves development efficiency.",
    quickActionCard: "Quick Action Card",
    tryCommonExample: "Try a common regex example",
    matchPreview: "Match preview",
    example: "Example",
    emailExample: "Email validation",
    phoneExample: "Phone number",
    oneClickFillEmailExample: "One-click fill email validation example",
    previewPhonePath: "Preview phone number matching path",
    examplesRegex: "Examples → Regex Tester",
    enterOrPasteRegex: "Enter or paste regex",
    examplesHelper: "Examples stay close to regex tester so developers can start fast.",
    exampleCards: "Example cards",
    phonePathDemo: "Phone number matching demo",
    oneClickFillAllowed: "Email validation regex · one-click fill allowed",
    emailPathDescription: "Email validation · shows Pattern → Test → Optimize path",
    flowDemo: "Flow demo",
    tester: "Regex Tester",
    regexInput: "Regular Expression",
    testInput: "Test Text",
    testButton: "Test",
    resultCard: "Result Card",
    enterValidRegex: "Enter valid regex",
    status: "Status",
    matchResult: "Match Result",
    matchCount: "Match Count",
    recommendedAction: "Recommended action",
    relatedNextTool: "Related next tool",
    resultIntelligence: "Result Intelligence",
    interpretMatchBeforeActing: "Interpret match result before acting",
    knowledge: "Knowledge",
    regexMeaning: "What Regex means in the Developer universe",
    definition: "Definition",
    definitionText: "Regular expression is a pattern for matching strings. Composed of characters, quantifiers, special symbols, used for text search, validation, replacement.",
    limitations: "Limitations",
    limitationsText: "Regex complexity is high, easy to make mistakes. Does not support nested structures. Implementations vary across languages.",
    semanticNeighbors: "Semantic neighbors",
    semanticNeighborsText: "JSON Validator, API Response Formatter, Cron Expression Builder, and other tools.",
    formula: "Best Practices",
    formulaText: "Use simple patterns, add comments, test edge cases, avoid over-complexity.",
    faq: "FAQ",
    commonQuestions: "Common questions",
    trustRelatedReferences: "Trust · Related Tools · References",
    trust: "Trust",
    trustText: "Regular expressions are powerful text processing tools. Using regex tester ensures correct patterns, improves development efficiency.",
    relatedTools: "Related Tools",
    references: "References",
    referencesText: "MDN Regex, Regex101, RegexPal.",
    recommendedProducts: "Tools to use with regex development",
  },
} as const;

function testRegex(pattern: string, text: string, flags: string = "g"): { valid: boolean; matches: string[]; error?: string } {
  try {
    const regex = new RegExp(pattern, flags);
    const matches = text.match(regex) || [];
    return { valid: true, matches };
  } catch (e) {
    return { valid: false, matches: [], error: String(e) };
  }
}

export default function RegexTester() {
  const { lang, setLang } = useLanguage();
  const [pattern, setPattern] = useState("[a-z]+@[a-z]+\\.[a-z]+");
  const [text, setText] = useState("Contact: john@example.com or jane@test.org");
  const [flags, setFlags] = useState("g");

  const t = ui[lang];
  const result = useMemo(() => testRegex(pattern, text, flags), [pattern, text, flags]);

  function fillEmailExample() {
    setPattern("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
    setText("Valid emails: john.doe@example.com, jane_smith@test.co.uk. Invalid: @example.com, user@.com");
    setFlags("g");
  }

  function fillPhoneExample() {
    setPattern("\\d{3}-\\d{3}-\\d{4}");
    setText("Call us: 123-456-7890 or 987-654-3210. Old: 1234567890");
    setFlags("g");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-950">
      <section className="bg-[radial-gradient(circle_at_top_left,_#dbeafe,_#f8fafc_45%,_#eef2ff)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end">
            <button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm transition hover:border-blue-500 hover:bg-blue-50">
              <span className={`rounded-full px-3 py-1 ${lang === "zh" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>🌐 中</span>
              <span className={`rounded-full px-3 py-1 ${lang === "en" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>🌐 EN</span>
            </button>
          </div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <section className="space-y-6">
              <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-700">{t.badge}</p>
              <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1>
              <p className="text-xl font-black text-blue-700">{t.subtitle}</p>
              <p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p>
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
                <strong>{t.trustNoteLabel}</strong> {t.trustNote}
              </div>
            </section>
            <aside className="rounded-[2rem] border border-blue-100 bg-white/90 p-6 shadow-2xl shadow-blue-950/10 backdrop-blur">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">{t.quickActionCard}</p>
                  <h2 className="mt-2 text-2xl font-black">{t.tryCommonExample}</h2>
                </div>
                <div className="rounded-2xl bg-blue-600 px-4 py-3 text-center text-white">
                  <div className="text-xs font-bold uppercase text-blue-100">{t.matchPreview}</div>
                  <div className="text-2xl font-black">2 matches</div>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.example}</div><div className="mt-1 text-lg font-black">{t.emailExample}</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{lang === "zh" ? "標誌" : "Flags"}</div><div className="mt-1 text-lg font-black">g</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{lang === "zh" ? "結果" : "Result"}</div><div className="mt-1 text-lg font-black">Match</div></div>
              </div>
              <button onClick={fillEmailExample} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white transition hover:bg-blue-700">{t.oneClickFillEmailExample}</button>
              <button onClick={fillPhoneExample} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900 transition hover:bg-orange-100">{t.previewPhonePath}</button>
            </aside>
          </div>
        </div>
      </section>

      <div className="bg-slate-50">
        <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.examplesRegex}</p>
              <h2 className="mt-2 text-3xl font-black">{t.enterOrPasteRegex}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p>
            </div>
            <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="text-lg font-black">{t.exampleCards}</h3>
                <div className="mt-4 space-y-3">
                  <button onClick={fillEmailExample} className="w-full rounded-2xl border border-blue-200 bg-white p-4 text-left transition hover:border-blue-500">
                    <div className="flex items-center justify-between gap-3"><span className="font-black">{t.emailExample}</span><span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">✓ Match</span></div>
                    <p className="mt-2 text-sm text-slate-600">{t.oneClickFillAllowed}</p>
                  </button>
                  <button onClick={fillPhoneExample} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left transition hover:border-orange-500">
                    <div className="flex items-center justify-between gap-3"><span className="font-black">{t.phoneExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">{t.flowDemo}</span></div>
                    <p className="mt-2 text-sm text-slate-600">{t.emailPathDescription}</p>
                  </button>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <h3 className="text-lg font-black">{t.tester}</h3>
                <div className="mt-4 grid gap-4">
                  <label className="block text-sm font-black text-slate-700">{t.regexInput}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-mono text-sm" value={pattern} onChange={(e) => setPattern(e.target.value)} /></label>
                  <label className="block text-sm font-black text-slate-700">{t.testInput}<textarea className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-mono text-sm" rows={4} value={text} onChange={(e) => setText(e.target.value)} /></label>
                  <label className="block text-sm font-black text-slate-700">{lang === "zh" ? "標誌" : "Flags"}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-mono text-sm" value={flags} onChange={(e) => setFlags(e.target.value)} placeholder="g, i, m, etc" /></label>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">
            <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <div className={`h-5 bg-gradient-to-r ${result.valid ? "from-green-600 via-emerald-500 to-teal-400" : "from-red-600 via-orange-500 to-yellow-400"}`} />
              <div className="p-6 md:p-7">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.resultCard}</p>
                <div className="mt-4">
                  <div className="text-2xl font-black tracking-tight text-slate-950">{result.valid ? `${result.matches.length} ${lang === "zh" ? "個匹配" : "matches"}` : "✗ Error"}</div>
                  {result.error && <p className="mt-2 text-sm text-red-600">{result.error}</p>}
                  {result.matches.length > 0 && (
                    <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                      <pre className="overflow-auto rounded-lg bg-slate-900 p-3 text-xs text-green-400 font-mono">{result.matches.join("\n")}</pre>
                    </div>
                  )}
                </div>
              </div>
            </article>
            <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.resultIntelligence}</p>
              <h2 className="mt-2 text-3xl font-black">{t.interpretMatchBeforeActing}</h2>
              <div className="mt-5 space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="font-black">{lang === "zh" ? "匹配成功" : "Match Success"}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "正則表達式正確，找到了匹配的文本。" : "Regex is correct, found matching text."}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="font-black">{lang === "zh" ? "匹配失敗" : "Match Failure"}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "正則表達式可能不正確或文本不匹配。" : "Regex may be incorrect or text doesn't match."}</p>
                </div>
              </div>
            </article>
          </section>

          <AdSenseWrapper showAds={true} adFormat="horizontal" />

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.knowledge}</p>
            <h2 className="mt-2 text-3xl font-black">{t.regexMeaning}</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-black">{t.definition}</h3>
                <p className="mt-2 leading-6 text-slate-700">{t.definitionText}</p>
              </div>
              <div>
                <h3 className="text-lg font-black">{t.formula}</h3>
                <p className="mt-2 rounded-2xl bg-slate-50 p-4 font-mono text-sm leading-6 text-slate-700">{t.formulaText}</p>
              </div>
              <div>
                <h3 className="text-lg font-black">{t.limitations}</h3>
                <p className="mt-2 leading-6 text-slate-700">{t.limitationsText}</p>
              </div>
              <div>
                <h3 className="text-lg font-black">{t.semanticNeighbors}</h3>
                <p className="mt-2 leading-6 text-slate-700">{t.semanticNeighborsText}</p>
              </div>
            </div>
            <div className="mt-6">
              <AdSlot slot="regex-tester-knowledge" position="middle" />
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.faq}</p>
            <h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-black">Q1: {lang === "zh" ? "正則表達式的基本語法是什麼？" : "What is basic regex syntax?"}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "字符類 [], 量詞 *, +, ?, {}, 特殊符號 ^, $, ., |, 轉義 \\。" : "Character class [], quantifiers *, +, ?, {}, special ^ $ . |, escape \\."}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-black">Q2: {lang === "zh" ? "如何匹配特殊字符？" : "How to match special characters?"}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "使用反斜杠轉義，如 \\. 匹配點，\\( 匹配括號。" : "Use backslash escape, e.g., \\. matches dot, \\( matches parenthesis."}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-black">Q3: {lang === "zh" ? "g 標誌有什麼作用？" : "What does g flag do?"}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "全局匹配，返回所有匹配結果而不是只返回第一個。" : "Global match, returns all matches instead of just the first one."}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-black">Q4: {lang === "zh" ? "如何測試複雜的正則表達式？" : "How to test complex regex?"}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "分解成小部分、逐步構建、使用測試工具驗證。" : "Break into parts, build incrementally, use tester to verify."}</p>
              </div>
            </div>
          </section>

          <AdSlot slot="regex-tester-faq" position="inline" />

          {/* SAVE/SHARE Section */}
          <section className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{lang === "zh" ? "正則測試旅程" : "Regex Testing Journey"}</p>
              <h2 className="mt-2 text-3xl font-black">{lang === "zh" ? "正則計算，文本提取" : "Regex Patterns, Extract Text"}</h2>
              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">{lang === "zh" ? "步驟 1" : "Step 1"}</div>
                  <div>
                    <h3 className="font-black">{lang === "zh" ? "輸入正則" : "Input Pattern"}</h3>
                    <p className="mt-1 text-sm text-slate-600">{lang === "zh" ? "輸入 Regex 模式" : "Enter regex pattern"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">{lang === "zh" ? "步驟 2" : "Step 2"}</div>
                  <div>
                    <h3 className="font-black">{lang === "zh" ? "輸入文本" : "Input Text"}</h3>
                    <p className="mt-1 text-sm text-slate-600">{lang === "zh" ? "輸入測試文本" : "Enter test text"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">{lang === "zh" ? "步驟 3" : "Step 3"}</div>
                  <div>
                    <h3 className="font-black">{lang === "zh" ? "匹配結果" : "Match Results"}</h3>
                    <p className="mt-1 text-sm text-slate-600">{lang === "zh" ? "查看匹配結果" : "View matches"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">{lang === "zh" ? "步驟 4" : "Step 4"}</div>
                  <div>
                    <h3 className="font-black">{lang === "zh" ? "測試优化" : "Optimize Pattern"}</h3>
                    <p className="mt-1 text-sm text-slate-600">{lang === "zh" ? "改進正則" : "Refine pattern"}</p>
                  </div>
                </div>
              </div>
            </div>

            <article className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{lang === "zh" ? "儲存 / 分享位置" : "Save / Share Placeholder"}</p>
              <h3 className="mt-2 text-xl font-black">{lang === "zh" ? "儲存結果或分享旅程" : "Save this result or share the journey"}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{lang === "zh" ? "僅 UI 佔位符。不包含帳號、儲存、分享或匯出實現。" : "UI placeholder only. No account, storage, sharing, or export implementation is included in this prototype."}</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button className="rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-black text-white transition hover:bg-slate-800">{lang === "zh" ? "儲存" : "Save"}<br /><span className="text-xs font-normal">UI</span></button>
                <button className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-center text-sm font-black text-slate-950 transition hover:bg-slate-50">{lang === "zh" ? "分享" : "Share"}<br /><span className="text-xs font-normal">UI</span></button>
              </div>
            </article>
          </section>

          <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{lang === "zh" ? "推薦工具" : "Recommended"}</p>
            <h2 className="mt-2 text-2xl font-black">{t.recommendedProducts}</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              {[{zh: "Regex 編輯器", en: "Regex Editor", href: "#affiliate-editor"}, {zh: "Regex 庫", en: "Regex Library", href: "#affiliate-library"}, {zh: "文本工具", en: "Text Tools", href: "#affiliate-text"}, {zh: "開發工具", en: "Dev Tools", href: "#affiliate-devtools"}].map((item) => (<a key={item.href} href={item.href} className="rounded-xl border border-amber-200 bg-white p-3 text-center text-sm font-black text-amber-900 transition hover:bg-amber-100">{lang === "zh" ? item.zh : item.en}</a>))}
            </div>
            <p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金" : "* Affiliate links. We may earn a commission."}</p>
          </section>

          <PremiumGate plan="PRO">
            <div className="rounded-[2rem] border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 md:p-7">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{lang === "zh" ? "進階功能" : "Premium Features"}</p>
              <h2 className="mt-2 text-2xl font-black">{lang === "zh" ? "解鎖正則高級功能" : "Unlock Advanced Regex Features"}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{lang === "zh" ? "Premium 功能即將推出" : "Premium features coming soon"}</p>
            </div>
          </PremiumGate>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.trustRelatedReferences}</p>
            <div className="mt-4 grid gap-5 md:grid-cols-3">
              <div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div>
              <div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "JSON 驗證器 · API 回應格式化 · Cron 表達式生成器" : "JSON Validator · API Formatter · Cron Builder"}</p></div>
              <div><h2 className="text-xl font-black">{t.references}</h2><ul className="mt-2 space-y-1 text-sm text-slate-700"><li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">MDN Regex</a></li><li><a href="https://regex101.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Regex101</a></li><li><a href="https://regexpal.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">RegexPal</a></li></ul></div>
            </div>
          </section>
        </div>
      </div>

      <div className="fixed right-4 top-32 hidden w-80 space-y-4 lg:block">
        <AdSlot slot="regex-tester-sidebar" position="top" />
        <PremiumGate plan="PRO" />
        <AdSlot slot="regex-tester-sidebar" position="bottom" />
      </div>

      <AdSlot slot="regex-tester-footer" position="footer" />
    </main>
  );
}
