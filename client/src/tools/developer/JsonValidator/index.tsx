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
    badge: "開發者 · JSON 驗證 · Gold Tool",
    title: "JSON 驗證工具・快速驗證 JSON 結構",
    subtitle: "JSON 驗證工具引導體驗",
    intro: "驗證 JSON 語法、檢查結構完整性、識別錯誤位置、支持 JSON Schema 驗證，快速診斷 JSON 問題。",
    trustNoteLabel: "信任提醒：",
    trustNote: "有效的 JSON 是現代 Web 開發的基礎。使用 JSON 驗證工具可確保數據完整性和系統穩定性。",
    quickActionCard: "快速範例卡",
    tryCommonExample: "試用常見 JSON 範例",
    validationPreview: "驗證預覽",
    example: "範例",
    validExample: "有效 JSON",
    invalidExample: "無效 JSON",
    oneClickFillValidExample: "一鍵填入有效 JSON 範例",
    previewInvalidPath: "預覽無效 JSON 診斷路徑",
    examplesValidator: "範例 → 驗證工具",
    enterOrPasteJson: "輸入或粘貼 JSON",
    examplesHelper: "範例緊貼驗證工具，讓開發者能快速開始。",
    exampleCards: "範例卡",
    invalidPathDemo: "無效 JSON 診斷示範",
    oneClickFillAllowed: "標準 JSON 對象 · 可一鍵填入",
    validPathDescription: "有效 JSON · 展示驗證 → 分析 → 修復路徑",
    flowDemo: "流程示範",
    validator: "驗證工具",
    jsonInput: "JSON 輸入",
    validateButton: "驗證",
    resultCard: "結果卡",
    enterValidJson: "請輸入有效的 JSON",
    status: "狀態",
    validationResult: "驗證結果",
    errorLocation: "錯誤位置",
    recommendedAction: "建議行動",
    relatedNextTool: "下一步工具",
    resultIntelligence: "結果解讀",
    interpretValidationBeforeActing: "行動前先理解驗證結果",
    knowledge: "知識",
    validationMeaning: "JSON 驗證在開發宇宙中的意義",
    definition: "定義",
    definitionText: "JSON 驗證是檢查 JSON 字符串是否符合 JSON 規範的過程。包括語法檢查、結構驗證、類型檢查。",
    limitations: "限制",
    limitationsText: "基本驗證工具只檢查語法。複雜驗證需要 JSON Schema。不支持自定義驗證規則。",
    semanticNeighbors: "相關工具",
    semanticNeighborsText: "API 回應格式化、正則表達式測試器、Cron 表達式生成器等工具。",
    formula: "最佳實踐",
    formulaText: "始終驗證外部輸入、使用 JSON Schema 定義結構、實施錯誤處理機制。",
    faq: "常見問題",
    commonQuestions: "常見問題",
    trustRelatedReferences: "信任 · 相關工具 · 參考資料",
    trust: "信任聲明",
    trustText: "有效的 JSON 是現代 Web 開發的基礎。使用 JSON 驗證工具可確保數據完整性和系統穩定性。",
    relatedTools: "相關工具",
    references: "參考資料",
    referencesText: "JSON 規範、JSON Schema、MDN Web Docs。",
    recommendedProducts: "配合 JSON 開發使用的工具",
  },
  en: {
    badge: "Developer · JSON Validator · Gold Tool",
    title: "JSON Validator · Quickly Validate JSON Structure",
    subtitle: "JSON Validator guided experience",
    intro: "Validate JSON syntax, check structure integrity, identify error locations, support JSON Schema validation, quickly diagnose JSON issues.",
    trustNoteLabel: "Trust note:",
    trustNote: "Valid JSON is the foundation of modern Web development. Using JSON validator ensures data integrity and system stability.",
    quickActionCard: "Quick Action Card",
    tryCommonExample: "Try a common JSON example",
    validationPreview: "Validation preview",
    example: "Example",
    validExample: "Valid JSON",
    invalidExample: "Invalid JSON",
    oneClickFillValidExample: "One-click fill valid JSON example",
    previewInvalidPath: "Preview invalid JSON diagnosis path",
    examplesValidator: "Examples → Validator",
    enterOrPasteJson: "Enter or paste JSON",
    examplesHelper: "Examples stay close to validator so developers can start fast.",
    exampleCards: "Example cards",
    invalidPathDemo: "Invalid JSON diagnosis demo",
    oneClickFillAllowed: "Standard JSON object · one-click fill allowed",
    validPathDescription: "Valid JSON · shows Validate → Analyze → Fix path",
    flowDemo: "Flow demo",
    validator: "Validator",
    jsonInput: "JSON Input",
    validateButton: "Validate",
    resultCard: "Result Card",
    enterValidJson: "Enter valid JSON",
    status: "Status",
    validationResult: "Validation Result",
    errorLocation: "Error Location",
    recommendedAction: "Recommended action",
    relatedNextTool: "Related next tool",
    resultIntelligence: "Result Intelligence",
    interpretValidationBeforeActing: "Interpret validation result before acting",
    knowledge: "Knowledge",
    validationMeaning: "What JSON Validation means in the Developer universe",
    definition: "Definition",
    definitionText: "JSON validation is the process of checking if a JSON string conforms to JSON specification. Includes syntax check, structure validation, type checking.",
    limitations: "Limitations",
    limitationsText: "Basic validator only checks syntax. Complex validation requires JSON Schema. Does not support custom validation rules.",
    semanticNeighbors: "Semantic neighbors",
    semanticNeighborsText: "API Response Formatter, Regex Tester, Cron Expression Builder, and other tools.",
    formula: "Best Practices",
    formulaText: "Always validate external input, use JSON Schema to define structure, implement error handling.",
    faq: "FAQ",
    commonQuestions: "Common questions",
    trustRelatedReferences: "Trust · Related Tools · References",
    trust: "Trust",
    trustText: "Valid JSON is the foundation of modern Web development. Using JSON validator ensures data integrity and system stability.",
    relatedTools: "Related Tools",
    references: "References",
    referencesText: "JSON Specification, JSON Schema, MDN Web Docs.",
    recommendedProducts: "Tools to use with JSON development",
  },
} as const;

function validateJson(input: string): { valid: boolean; error?: string; line?: number; column?: number } {
  try {
    JSON.parse(input);
    return { valid: true };
  } catch (e) {
    const errorStr = String(e);
    const match = errorStr.match(/position (\d+)/);
    return { valid: false, error: errorStr, line: match ? parseInt(match[1]) : undefined };
  }
}

export default function JsonValidator() {
  const { lang, setLang } = useLanguage();
  const [jsonInput, setJsonInput] = useState('{"name":"John","age":30,"city":"New York"}');

  const t = ui[lang];
  const result = useMemo(() => validateJson(jsonInput), [jsonInput]);

  function fillValidExample() {
    setJsonInput(JSON.stringify({ status: "success", data: { id: 1, name: "John", email: "john@example.com", roles: ["admin", "user"] }, timestamp: new Date().toISOString() }, null, 2));
  }

  function fillInvalidExample() {
    setJsonInput('{"name":"John","age":30,"city":"New York",,}');
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
                  <div className="text-xs font-bold uppercase text-blue-100">{t.validationPreview}</div>
                  <div className="text-2xl font-black">✓ Valid</div>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.example}</div><div className="mt-1 text-lg font-black">{t.validExample}</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{lang === "zh" ? "類型" : "Type"}</div><div className="mt-1 text-lg font-black">Object</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{lang === "zh" ? "狀態" : "Status"}</div><div className="mt-1 text-lg font-black">OK</div></div>
              </div>
              <button onClick={fillValidExample} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white transition hover:bg-blue-700">{t.oneClickFillValidExample}</button>
              <button onClick={fillInvalidExample} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900 transition hover:bg-orange-100">{t.previewInvalidPath}</button>
            </aside>
          </div>
        </div>
      </section>

      <div className="bg-slate-50">
        <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.examplesValidator}</p>
              <h2 className="mt-2 text-3xl font-black">{t.enterOrPasteJson}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p>
            </div>
            <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="text-lg font-black">{t.exampleCards}</h3>
                <div className="mt-4 space-y-3">
                  <button onClick={fillValidExample} className="w-full rounded-2xl border border-blue-200 bg-white p-4 text-left transition hover:border-blue-500">
                    <div className="flex items-center justify-between gap-3"><span className="font-black">{t.validExample}</span><span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">✓ OK</span></div>
                    <p className="mt-2 text-sm text-slate-600">{t.oneClickFillAllowed}</p>
                  </button>
                  <button onClick={fillInvalidExample} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left transition hover:border-orange-500">
                    <div className="flex items-center justify-between gap-3"><span className="font-black">{t.invalidExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">{t.flowDemo}</span></div>
                    <p className="mt-2 text-sm text-slate-600">{t.validPathDescription}</p>
                  </button>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <h3 className="text-lg font-black">{t.validator}</h3>
                <label className="mt-4 block text-sm font-black text-slate-700">{t.jsonInput}<textarea className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-mono text-sm" rows={8} value={jsonInput} onChange={(e) => setJsonInput(e.target.value)} /></label>
              </div>
            </div>
          </section>

          <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">
            <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <div className={`h-5 bg-gradient-to-r ${result.valid ? "from-green-600 via-emerald-500 to-teal-400" : "from-red-600 via-orange-500 to-yellow-400"}`} />
              <div className="p-6 md:p-7">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.resultCard}</p>
                <div className="mt-4">
                  <div className="text-2xl font-black tracking-tight text-slate-950">{result.valid ? "✓ Valid JSON" : "✗ Invalid JSON"}</div>
                  {result.error && <p className="mt-2 text-sm text-red-600">{result.error}</p>}
                  <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                    <pre className="overflow-auto rounded-lg bg-slate-900 p-3 text-xs text-green-400 font-mono">{JSON.stringify(JSON.parse(jsonInput), null, 2)}</pre>
                  </div>
                </div>
              </div>
            </article>
            <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.resultIntelligence}</p>
              <h2 className="mt-2 text-3xl font-black">{t.interpretValidationBeforeActing}</h2>
              <div className="mt-5 space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="font-black">{lang === "zh" ? "有效 JSON" : "Valid JSON"}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "符合 JSON 規範，可以安全使用。" : "Conforms to JSON spec, safe to use."}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="font-black">{lang === "zh" ? "無效 JSON" : "Invalid JSON"}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "存在語法錯誤，需要修復。" : "Contains syntax errors, needs fixing."}</p>
                </div>
              </div>
            </article>
          </section>

          <AdSenseWrapper showAds={true} adFormat="horizontal" />

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.knowledge}</p>
            <h2 className="mt-2 text-3xl font-black">{t.validationMeaning}</h2>
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
              <AdSlot slot="json-validator-knowledge" position="middle" />
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.faq}</p>
            <h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-black">Q1: {lang === "zh" ? "什麼是有效的 JSON？" : "What is valid JSON?"}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "符合 JSON 規範的字符串，包括正確的語法、有效的數據類型、正確的結構。" : "String conforming to JSON spec, includes correct syntax, valid data types, proper structure."}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-black">Q2: {lang === "zh" ? "常見的 JSON 錯誤有哪些？" : "Common JSON errors?"}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "缺少引號、多餘逗號、不匹配的括號、無效的轉義序列。" : "Missing quotes, extra commas, mismatched brackets, invalid escape sequences."}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-black">Q3: {lang === "zh" ? "如何修復無效的 JSON？" : "How to fix invalid JSON?"}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "檢查語法、添加缺失的引號、移除多餘逗號、修復括號匹配。" : "Check syntax, add missing quotes, remove extra commas, fix bracket matching."}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-black">Q4: {lang === "zh" ? "JSON Schema 有什麼作用？" : "What is JSON Schema for?"}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "定義 JSON 結構、驗證數據類型、強制執行數據約束。" : "Define JSON structure, validate data types, enforce data constraints."}</p>
              </div>
            </div>
          </section>

          <AdSlot slot="json-validator-faq" position="inline" />

          <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{lang === "zh" ? "推薦工具" : "Recommended"}</p>
            <h2 className="mt-2 text-2xl font-black">{t.recommendedProducts}</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              {[{zh: "JSON 編輯器", en: "JSON Editor", href: "#affiliate-editor"}, {zh: "JSON Schema", en: "JSON Schema", href: "#affiliate-schema"}, {zh: "API 測試", en: "API Testing", href: "#affiliate-api"}, {zh: "開發工具", en: "Dev Tools", href: "#affiliate-devtools"}].map((item) => (<a key={item.href} href={item.href} className="rounded-xl border border-amber-200 bg-white p-3 text-center text-sm font-black text-amber-900 transition hover:bg-amber-100">{lang === "zh" ? item.zh : item.en}</a>))}
            </div>
            <p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金" : "* Affiliate links. We may earn a commission."}</p>
          </section>

          <PremiumGate plan="PRO">
            <div className="rounded-[2rem] border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 md:p-7">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{lang === "zh" ? "進階功能" : "Premium Features"}</p>
              <h2 className="mt-2 text-2xl font-black">{lang === "zh" ? "解鎖 JSON Schema 驗證" : "Unlock JSON Schema Validation"}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{lang === "zh" ? "Premium 功能即將推出" : "Premium features coming soon"}</p>
            </div>
          </PremiumGate>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.trustRelatedReferences}</p>
            <div className="mt-4 grid gap-5 md:grid-cols-3">
              <div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div>
              <div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "API 回應格式化 · 正則表達式測試器 · Cron 表達式生成器" : "API Formatter · Regex Tester · Cron Builder"}</p></div>
              <div><h2 className="text-xl font-black">{t.references}</h2><ul className="mt-2 space-y-1 text-sm text-slate-700"><li><a href="https://www.json.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">JSON.org</a></li><li><a href="https://json-schema.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">JSON Schema</a></li><li><a href="https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/JSON" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">MDN</a></li></ul></div>
            </div>
          </section>
        </div>
      </div>

      <div className="fixed right-4 top-32 hidden w-80 space-y-4 lg:block">
        <AdSlot slot="json-validator-sidebar" position="top" />
        <PremiumGate plan="PRO" />
        <AdSlot slot="json-validator-sidebar" position="bottom" />
      </div>

      <AdSlot slot="json-validator-footer" position="footer" />
    </main>
  );
}
