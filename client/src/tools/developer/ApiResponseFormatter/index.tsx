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
    badge: "開發者 · API 回應格式化 · Gold Tool",
    title: "API 回應格式化工具・標準化 API 輸出",
    subtitle: "API 回應格式化工具引導體驗",
    intro: "將 API 回應轉換為標準格式（JSON、XML、YAML），驗證結構完整性，快速診斷 API 問題，提升開發效率。",
    trustNoteLabel: "信任提醒：",
    trustNote: "標準化 API 回應格式是現代 API 設計的基礎，有助於提升開發效率、降低集成成本、改善用戶體驗。",
    quickActionCard: "快速範例卡",
    tryCommonExample: "試用常見 API 回應範例",
    responsePreview: "回應預覽",
    example: "範例",
    successExample: "成功回應",
    errorExample: "錯誤回應",
    oneClickFillSuccessExample: "一鍵填入成功回應範例",
    previewErrorPath: "預覽錯誤回應診斷路徑",
    examplesFormatter: "範例 → 格式化工具",
    enterOrPasteJson: "輸入或粘貼 JSON",
    examplesHelper: "範例緊貼格式化工具，讓開發者能快速開始，再依自己的 API 回應調整輸入。",
    exampleCards: "範例卡",
    errorPathDemo: "錯誤回應診斷示範",
    oneClickFillAllowed: "標準 REST API 回應 · 可一鍵填入",
    successPathDescription: "成功回應 · 展示成功 → 格式化 → 驗證路徑",
    flowDemo: "流程示範",
    formatter: "格式化工具",
    jsonInput: "JSON 輸入",
    formatButton: "格式化",
    resultCard: "結果卡",
    enterValidJson: "請輸入有效的 JSON",
    status: "狀態",
    formattedOutput: "格式化輸出",
    validationStatus: "驗證狀態",
    recommendedAction: "建議行動",
    relatedNextTool: "下一步工具",
    resultIntelligence: "結果解讀",
    interpretResponseBeforeActing: "行動前先理解 API 回應結構",
    knowledge: "知識",
    responseMeaning: "API 回應在開發宇宙中的意義",
    definition: "定義",
    definitionText: "API 回應是伺服器對客戶端請求的回覆，包含狀態碼、頭部、主體等。標準化回應格式提升互操作性和可維護性。",
    limitations: "限制",
    limitationsText: "格式化工具假設輸入是有效的 JSON。不支持二進制或流式數據。複雜嵌套結構可能需要手動驗證。",
    semanticNeighbors: "相關工具",
    semanticNeighborsText: "JSON 驗證器、正則表達式測試器、Cron 表達式生成器等工具可擴展開發工作流。",
    formula: "最佳實踐",
    formulaText: "使用一致的狀態碼、清晰的錯誤信息、標準的數據結構。遵循 RESTful 設計原則。",
    faq: "常見問題",
    commonQuestions: "常見問題",
    trustRelatedReferences: "信任 · 相關工具 · 參考資料",
    trust: "信任聲明",
    trustText: "標準化 API 回應格式是現代 API 設計的基礎。遵循 JSON:API、OpenAPI 等標準可大幅提升開發效率和代碼質量。",
    relatedTools: "相關工具",
    references: "參考資料",
    referencesText: "JSON:API 規範、OpenAPI 規範、REST API 最佳實踐。",
    recommendedProducts: "配合 API 開發使用的工具",
  },
  en: {
    badge: "Developer · API Response Formatter · Gold Tool",
    title: "API Response Formatter · Standardize API Output",
    subtitle: "API Response Formatter guided experience",
    intro: "Convert API responses to standard formats (JSON, XML, YAML), validate structure integrity, quickly diagnose API issues, improve development efficiency.",
    trustNoteLabel: "Trust note:",
    trustNote: "Standardized API response format is the foundation of modern API design, improves development efficiency, reduces integration costs, enhances user experience.",
    quickActionCard: "Quick Action Card",
    tryCommonExample: "Try a common API response example",
    responsePreview: "Response preview",
    example: "Example",
    successExample: "Success response",
    errorExample: "Error response",
    oneClickFillSuccessExample: "One-click fill success response example",
    previewErrorPath: "Preview error response diagnosis path",
    examplesFormatter: "Examples → Formatter",
    enterOrPasteJson: "Enter or paste JSON",
    examplesHelper: "Examples stay close to formatter so developers can start fast, then edit inputs for their API responses.",
    exampleCards: "Example cards",
    errorPathDemo: "Error response diagnosis demo",
    oneClickFillAllowed: "Standard REST API response · one-click fill allowed",
    successPathDescription: "Success response · shows Success → Format → Validate path",
    flowDemo: "Flow demo",
    formatter: "Formatter",
    jsonInput: "JSON Input",
    formatButton: "Format",
    resultCard: "Result Card",
    enterValidJson: "Enter valid JSON",
    status: "Status",
    formattedOutput: "Formatted Output",
    validationStatus: "Validation Status",
    recommendedAction: "Recommended action",
    relatedNextTool: "Related next tool",
    resultIntelligence: "Result Intelligence",
    interpretResponseBeforeActing: "Interpret API response structure before acting",
    knowledge: "Knowledge",
    responseMeaning: "What API Response means in the Developer universe",
    definition: "Definition",
    definitionText: "An API response is the server's reply to a client request, containing status code, headers, body. Standardized response format improves interoperability and maintainability.",
    limitations: "Limitations",
    limitationsText: "Formatter assumes input is valid JSON. Does not support binary or streaming data. Complex nested structures may require manual validation.",
    semanticNeighbors: "Semantic neighbors",
    semanticNeighborsText: "JSON Validator, Regex Tester, Cron Expression Builder, and other tools extend development workflow.",
    formula: "Best Practices",
    formulaText: "Use consistent status codes, clear error messages, standard data structures. Follow RESTful design principles.",
    faq: "FAQ",
    commonQuestions: "Common questions",
    trustRelatedReferences: "Trust · Related Tools · References",
    trust: "Trust",
    trustText: "Standardized API response format is foundation of modern API design. Following JSON:API, OpenAPI standards significantly improves development efficiency and code quality.",
    relatedTools: "Related Tools",
    references: "References",
    referencesText: "JSON:API Specification, OpenAPI Specification, REST API Best Practices.",
    recommendedProducts: "Tools to use with API development",
  },
} as const;

function formatJson(input: string): { formatted: string; valid: boolean; error?: string } {
  try {
    const parsed = JSON.parse(input);
    return { formatted: JSON.stringify(parsed, null, 2), valid: true };
  } catch (e) {
    return { formatted: "", valid: false, error: String(e) };
  }
}

export default function ApiResponseFormatter() {
  const { lang, setLang } = useLanguage();
  const [jsonInput, setJsonInput] = useState('{"status":"success","data":{"id":1,"name":"John"}}');

  const t = ui[lang];

  const result = useMemo(() => formatJson(jsonInput), [jsonInput]);

  function fillSuccessExample() {
    setJsonInput(JSON.stringify({ status: "success", code: 200, data: { id: 1, name: "John", email: "john@example.com" }, timestamp: new Date().toISOString() }, null, 2));
  }

  function fillErrorExample() {
    setJsonInput(JSON.stringify({ status: "error", code: 400, message: "Invalid request", error: { type: "validation_error", details: [{ field: "email", message: "Invalid email format" }] }, timestamp: new Date().toISOString() }, null, 2));
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
                  <div className="text-xs font-bold uppercase text-blue-100">{t.responsePreview}</div>
                  <div className="text-2xl font-black">✓ Valid</div>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.example}</div><div className="mt-1 text-lg font-black">{t.successExample}</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{lang === "zh" ? "格式" : "Format"}</div><div className="mt-1 text-lg font-black">JSON</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{lang === "zh" ? "狀態" : "Status"}</div><div className="mt-1 text-lg font-black">200</div></div>
              </div>
              <button onClick={fillSuccessExample} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white transition hover:bg-blue-700">{t.oneClickFillSuccessExample}</button>
              <button onClick={fillErrorExample} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900 transition hover:bg-orange-100">{t.previewErrorPath}</button>
            </aside>
          </div>
        </div>
      </section>

      <div className="bg-slate-50">
        <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.examplesFormatter}</p>
              <h2 className="mt-2 text-3xl font-black">{t.enterOrPasteJson}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p>
            </div>
            <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="text-lg font-black">{t.exampleCards}</h3>
                <div className="mt-4 space-y-3">
                  <button onClick={fillSuccessExample} className="w-full rounded-2xl border border-blue-200 bg-white p-4 text-left transition hover:border-blue-500">
                    <div className="flex items-center justify-between gap-3"><span className="font-black">{t.successExample}</span><span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">200 OK</span></div>
                    <p className="mt-2 text-sm text-slate-600">{t.oneClickFillAllowed}</p>
                  </button>
                  <button onClick={fillErrorExample} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left transition hover:border-orange-500">
                    <div className="flex items-center justify-between gap-3"><span className="font-black">{t.errorExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">{t.flowDemo}</span></div>
                    <p className="mt-2 text-sm text-slate-600">{t.successPathDescription}</p>
                  </button>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <h3 className="text-lg font-black">{t.formatter}</h3>
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
                  <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                    <pre className="overflow-auto rounded-lg bg-slate-900 p-3 text-xs text-green-400 font-mono">{result.formatted || result.error}</pre>
                  </div>
                </div>
              </div>
            </article>
            <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.resultIntelligence}</p>
              <h2 className="mt-2 text-3xl font-black">{t.interpretResponseBeforeActing}</h2>
              <div className="mt-5 space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="font-black">{lang === "zh" ? "成功回應 (200)" : "Success Response (200)"}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "包含 status、code、data 和 timestamp，結構清晰，易於解析。" : "Contains status, code, data, and timestamp, clear structure, easy to parse."}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="font-black">{lang === "zh" ? "錯誤回應 (400)" : "Error Response (400)"}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "包含錯誤類型、詳細信息、時間戳，便於調試。" : "Contains error type, details, timestamp, helps with debugging."}</p>
                </div>
              </div>
            </article>
          </section>

          <AdSenseWrapper showAds={true} adFormat="horizontal" />

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.knowledge}</p>
            <h2 className="mt-2 text-3xl font-black">{t.responseMeaning}</h2>
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
              <AdSlot slot="api-response-formatter-knowledge" position="middle" />
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.faq}</p>
            <h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-black">Q1: {lang === "zh" ? "為什麼需要格式化 API 回應？" : "Why format API responses?"}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "格式化提升可讀性、便於調試、確保結構一致、提高代碼質量。" : "Formatting improves readability, aids debugging, ensures consistency, enhances code quality."}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-black">Q2: {lang === "zh" ? "如何驗證 API 回應的有效性？" : "How to validate API response validity?"}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "檢查 JSON 語法、驗證必需字段、檢查數據類型、驗證狀態碼。" : "Check JSON syntax, validate required fields, verify data types, check status codes."}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-black">Q3: {lang === "zh" ? "標準化 API 回應的最佳實踐是什麼？" : "Best practices for standardizing API responses?"}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "使用一致的結構、清晰的錯誤信息、適當的 HTTP 狀態碼、完整的文檔。" : "Use consistent structure, clear error messages, appropriate HTTP codes, complete documentation."}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-black">Q4: {lang === "zh" ? "如何處理複雜的嵌套 JSON？" : "How to handle complex nested JSON?"}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "使用樹形結構展示、逐層驗證、使用 JSON Schema 驗證。" : "Use tree structure display, validate layer by layer, use JSON Schema validation."}</p>
              </div>
            </div>
          </section>

          <AdSlot slot="api-response-formatter-faq" position="inline" />

          {/* SAVE/SHARE Section */}
          <section className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{lang === "zh" ? "API 整理旅程" : "API Formatting Journey"}</p>
              <h2 className="mt-2 text-3xl font-black">{lang === "zh" ? "API 數據整理，開發更高效" : "Format API Data, Develop Better"}</h2>
              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">{lang === "zh" ? "步驟 1" : "Step 1"}</div>
                  <div>
                    <h3 className="font-black">{lang === "zh" ? "貼上 API 響應" : "Paste API Response"}</h3>
                    <p className="mt-1 text-sm text-slate-600">{lang === "zh" ? "輸入原始 JSON" : "Input raw JSON data"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">{lang === "zh" ? "步驟 2" : "Step 2"}</div>
                  <div>
                    <h3 className="font-black">{lang === "zh" ? "選擇格式" : "Choose Format"}</h3>
                    <p className="mt-1 text-sm text-slate-600">{lang === "zh" ? "JSON 、XML 、YAML" : "JSON, XML, YAML"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">{lang === "zh" ? "步驟 3" : "Step 3"}</div>
                  <div>
                    <h3 className="font-black">{lang === "zh" ? "整理輸出" : "Format Output"}</h3>
                    <p className="mt-1 text-sm text-slate-600">{lang === "zh" ? "美化的數據" : "Beautified data"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">{lang === "zh" ? "步驟 4" : "Step 4"}</div>
                  <div>
                    <h3 className="font-black">{lang === "zh" ? "複制使用" : "Copy & Use"}</h3>
                    <p className="mt-1 text-sm text-slate-600">{lang === "zh" ? "整理後的數據" : "Use formatted data"}</p>
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
              {[{zh: "API 測試工具", en: "API Testing", href: "#affiliate-api-test"}, {zh: "JSON 編輯器", en: "JSON Editor", href: "#affiliate-editor"}, {zh: "API 文檔生成", en: "API Docs", href: "#affiliate-docs"}, {zh: "監控工具", en: "Monitoring", href: "#affiliate-monitor"}].map((item) => (<a key={item.href} href={item.href} className="rounded-xl border border-amber-200 bg-white p-3 text-center text-sm font-black text-amber-900 transition hover:bg-amber-100">{lang === "zh" ? item.zh : item.en}</a>))}
            </div>
            <p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金" : "* Affiliate links. We may earn a commission."}</p>
          </section>

          <PremiumGate plan="PRO">
            <div className="rounded-[2rem] border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 md:p-7">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{lang === "zh" ? "進階功能" : "Premium Features"}</p>
              <h2 className="mt-2 text-2xl font-black">{lang === "zh" ? "解鎖完整 API 分析" : "Unlock Complete API Analysis"}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{lang === "zh" ? "Premium 功能即將推出" : "Premium features coming soon"}</p>
            </div>
          </PremiumGate>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.trustRelatedReferences}</p>
            <div className="mt-4 grid gap-5 md:grid-cols-3">
              <div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div>
              <div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "JSON 驗證器 · 正則表達式測試器 · Cron 表達式生成器" : "JSON Validator · Regex Tester · Cron Builder"}</p></div>
              <div><h2 className="text-xl font-black">{t.references}</h2><ul className="mt-2 space-y-1 text-sm text-slate-700"><li><a href="https://www.jsonapi.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">JSON:API</a></li><li><a href="https://www.openapis.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAPI</a></li><li><a href="https://restfulapi.net/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">REST API</a></li></ul></div>
            </div>
          </section>
        </div>
      </div>

      <div className="fixed right-4 top-32 hidden w-80 space-y-4 lg:block">
        <AdSlot slot="api-response-formatter-sidebar" position="top" />
        <PremiumGate plan="PRO" />
        <AdSlot slot="api-response-formatter-sidebar" position="bottom" />
      </div>

      <AdSlot slot="api-response-formatter-footer" position="footer" />
    </main>
  );
}
