import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
const l = (v: LocalText, lang: Lang) => v[lang];

type Format = "standard" | "uppercase" | "no-hyphens" | "braces";

const genUUID = (): string => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const applyFormat = (uuid: string, fmt: Format) => {
  switch (fmt) {
    case "uppercase": return uuid.toUpperCase();
    case "no-hyphens": return uuid.replace(/-/g, "");
    case "braces": return `{${uuid}}`;
    default: return uuid;
  }
};

export default function UuidGenerator() {
  const { lang, setLang } = useLanguage();

  const [count, setCount] = useState(1);
  const [format, setFormat] = useState<Format>("standard");
  const [uuids, setUuids] = useState<string[]>(() => [genUUID()]);

  const regenerate = () => {
    const arr: string[] = [];
    for (let i = 0; i < Math.min(count, 50); i++) arr.push(applyFormat(genUUID(), format));
    setUuids(arr);
  };

  const formatted = useMemo(() => uuids.map((u) => applyFormat(u, format)), [uuids, format]);

  const fillSingle = () => { setCount(1); setFormat("standard"); regenerate(); };
  const fillBatch = () => { setCount(5); setFormat("uppercase"); regenerate(); };

  const bands = [
    { label: { zh: "標準格式", en: "Standard" }, range: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", note: { zh: "RFC 4122 標準小寫連字號格式。", en: "RFC 4122 standard lowercase with hyphens." } },
    { label: { zh: "大寫格式", en: "Uppercase" }, range: "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX", note: { zh: "全大寫，方便辨識與比對。", en: "All uppercase for readability and matching." } },
    { label: { zh: "無連字號", en: "No hyphens" }, range: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", note: { zh: "32 位十六進位無分隔，適合緊湊儲存。", en: "32 hex digits without separators; compact storage." } },
    { label: { zh: "花括號", en: "Braces" }, range: "{xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx}", note: { zh: "Microsoft 風格，常見於 Windows 系統。", en: "Microsoft style, common in Windows systems." } },
  ];

  const faqs = [
    { q: { zh: "UUID 是什麼？", en: "What is a UUID?" }, a: { zh: "通用唯一識別碼（Universally Unique Identifier），128 位隨機值，實務上不會重複。", en: "Universally Unique Identifier: a 128-bit random value, practically never duplicated." } },
    { q: { zh: "v4 是什麼意思？", en: "What does v4 mean?" }, a: { zh: "版本 4 表示完全隨機產生（除版本與變體位元），是應用最廣的 UUID。", en: "Version 4 means fully random (except version & variant bits); the most widely used UUID." } },
    { q: { zh: "UUID 會重複嗎？", en: "Can UUIDs collide?" }, a: { zh: "理論上有極低概率，但實務上可視為唯一；生成十億個也只有約 50% 機率出現一次碰撞。", en: "Theoretically possible but extremely unlikely; generating a billion has ~50% chance of one collision." } },
    { q: { zh: "最多可以產生幾個？", en: "How many can I generate?" }, a: { zh: "本工具單次最多 50 個，適合開發與測試使用。", en: "This tool generates up to 50 per batch; suitable for development and testing." } },
    { q: { zh: "適合用在哪裡？", en: "Where should I use UUIDs?" }, a: { zh: "資料庫主鍵、分散式系統 ID、API request ID 等場景。", en: "Database primary keys, distributed system IDs, API request IDs, etc." } },
    { q: { zh: "加密安全嗎？", en: "Is it cryptographically secure?" }, a: { zh: "瀏覽器使用 crypto.randomUUID() 產生，屬於加密安全隨機；回退方案則否。", en: "Browser uses crypto.randomUUID() which is cryptographically secure; the fallback is not." } },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#ede9fe,_#f8fafc_45%,_#e0f2fe)]">
      <div className="mx-auto max-w-7xl px-4 py-10 lg:py-14">

        {/* L1 Hero */}
        <header className="rounded-[2rem] bg-white/70 p-8 shadow-sm ring-1 ring-violet-100 backdrop-blur">
          <div className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-violet-700">
            {l({ zh: "開發者 · 識別碼 · GOLD TOOL", en: "Developer · Identifiers · GOLD TOOL" }, lang)}
          </div>
          <h1 className="mt-4 text-4xl font-black text-slate-900 lg:text-5xl">
            {l({ zh: "UUID 產生器", en: "UUID Generator" }, lang)} · UUID Generator
          </h1>
          <p className="mt-3 max-w-2xl text-lg font-black text-slate-600">
            {l({ zh: "一鍵產生 UUID v4，支援批次產生與格式選擇。", en: "Generate UUID v4 in one click, with batch support and format options." }, lang)}
          </p>
        </header>

        {/* L2 TrustIntro */}
        <section className="mt-6 rounded-[2rem] bg-white/60 p-6 ring-1 ring-violet-100">
          <p className="text-sm font-black text-slate-600">
            <span className="font-black text-violet-700">{l({ zh: "注意事項：", en: "Note: " }, lang)}</span>
            {l({ zh: "UUID v4 為隨機產生，理論上極低概率碰撞；本工具僅供開發與測試，不保證儲存後唯一。", en: "UUID v4 is randomly generated with extremely low collision probability; this tool is for dev & testing only, not guaranteed unique after storage." }, lang)}
          </p>
        </section>

        {/* L3 QuickStartExample */}
        <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto]">
          <div className="rounded-[2rem] bg-white/70 p-6 ring-1 ring-violet-100">
            <h2 className="text-sm font-black uppercase tracking-wide text-violet-700">{l({ zh: "快速範例卡", en: "Quick start" }, lang)}</h2>
            <p className="mt-2 font-black text-slate-600">{l({ zh: "一鍵產生 UUID 範例", en: "Generate a UUID example in one click" }, lang)}</p>
          </div>
          <div className="rounded-[2rem] bg-violet-600 p-6 text-white">
            <div className="text-xs font-black uppercase tracking-wide text-violet-100">{l({ zh: "已產生", en: "Generated" }, lang)}</div>
            <div className="mt-1 text-3xl font-black">{formatted.length}</div>
          </div>
        </section>

        {/* L4 InputGuidance */}
        <section className="mt-6 rounded-[2rem] bg-white/60 p-6 ring-1 ring-violet-100">
          <h2 className="text-sm font-black uppercase tracking-wide text-violet-700">{l({ zh: "設定產生參數", en: "Set generation params" }, lang)}</h2>
          <p className="mt-2 font-black text-slate-600">{l({ zh: "選擇數量與格式，按下產生按鈕即可。", en: "Choose count and format, then press generate." }, lang)}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={fillSingle} className="rounded-full bg-violet-600 px-4 py-2 text-sm font-black text-white">{l({ zh: "填入單一範例", en: "Fill single example" }, lang)}</button>
            <button onClick={fillBatch} className="rounded-full bg-purple-600 px-4 py-2 text-sm font-black text-white">{l({ zh: "填入批次範例", en: "Fill batch example" }, lang)}</button>
          </div>
        </section>

        {/* L5 CalculatorInput */}
        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_auto]">
          <div className="rounded-[2rem] bg-white/80 p-6 ring-1 ring-violet-100">
            <h2 className="text-lg font-black text-slate-900">{l({ zh: "產生器", en: "Generator" }, lang)}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-black text-slate-700">{l({ zh: "產生數量", en: "Count" }, lang)}</span>
                <input type="number" value={count} min={1} max={50} onChange={(e) => setCount(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))} className="mt-1 w-full rounded-xl border border-violet-200 px-3 py-2" />
              </label>
              <label className="block">
                <span className="text-sm font-black text-slate-700">{l({ zh: "輸出格式", en: "Output format" }, lang)}</span>
                <select value={format} onChange={(e) => setFormat(e.target.value as Format)} className="mt-1 w-full rounded-xl border border-violet-200 px-3 py-2">
                  <option value="standard">{l({ zh: "標準（小寫連字號）", en: "Standard (lowercase hyphens)" }, lang)}</option>
                  <option value="uppercase">{l({ zh: "大寫", en: "Uppercase" }, lang)}</option>
                  <option value="no-hyphens">{l({ zh: "無連字號", en: "No hyphens" }, lang)}</option>
                  <option value="braces">{l({ zh: "花括號", en: "Braces" }, lang)}</option>
                </select>
              </label>
            </div>
            <button onClick={regenerate} className="mt-4 rounded-full bg-violet-700 px-6 py-3 text-sm font-black text-white">{l({ zh: "🔄 重新產生", en: "🔄 Regenerate" }, lang)}</button>
          </div>

          {/* L6 PrimaryResult */}
          <div className="rounded-[2rem] bg-slate-950 p-6 text-emerald-200 lg:w-96">
            <div className="text-xs font-black uppercase tracking-wide text-emerald-400">{l({ zh: "產生結果", en: "Result" }, lang)}</div>
            <div className="mt-2 text-2xl font-black text-white">{formatted.length} UUID{l({ zh: "", en: "s" }, lang)}</div>
            <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs text-emerald-200 max-h-64 overflow-y-auto">
{formatted.join("\n")}
            </pre>
          </div>
        </section>

        {/* L7 ResultIntelligence */}
        <section className="mt-6 mx-auto max-w-7xl rounded-[2rem] bg-white/70 p-6 ring-1 ring-violet-100">
          <h2 className="text-lg font-black text-slate-900">{l({ zh: "格式說明", en: "Format guide" }, lang)}</h2>
          <p className="mt-1 text-sm font-black text-slate-500">{l({ zh: "四格 UUID 格式對照矩陣（L7）固定四格，對照常見輸出格式；這是開發參考。", en: "Four-cell UUID format matrix (L7), fixed four cells against common output formats; dev reference." }, lang)}</p>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {bands.map((b, i) => (
              <div key={i} className="rounded-2xl bg-violet-50 p-4 ring-1 ring-violet-100">
                <div className="text-base font-black text-violet-700">{l(b.label, lang)}</div>
                <div className="text-sm font-black text-slate-700 font-mono">{b.range}</div>
                <div className="mt-1 text-sm font-black text-slate-600">{l(b.note, lang)}</div>
              </div>
            ))}
          </div>
        </section>

        {/* L8 ScenarioComparison */}
        <section className="mt-6 rounded-[2rem] bg-white/70 p-6 ring-1 ring-violet-100">
          <h2 className="text-lg font-black text-slate-900">{l({ zh: "情境對照", en: "Scenario comparison" }, lang)}</h2>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm font-black text-slate-700">{l({ zh: "目前格式", en: "Current format" }, lang)}</div>
              <div className="text-2xl font-black text-violet-700">{format}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm font-black text-slate-700">{l({ zh: "產生數量", en: "Count" }, lang)}</div>
              <div className="text-2xl font-black text-purple-700">{formatted.length}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm font-black text-slate-700">{l({ zh: "字元長度", en: "Char length" }, lang)}</div>
              <div className="text-2xl font-black text-blue-700">{formatted[0]?.length ?? 0}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm font-black text-slate-700">{l({ zh: "版本", en: "Version" }, lang)}</div>
              <div className="text-2xl font-black text-orange-600">v4</div>
            </div>
          </div>
        </section>

        {/* L9 EmotionConversionUpper */}
        <AdSenseWrapper showAds={true} adSlot="uuid-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="mt-6 rounded-[2rem] bg-violet-600 p-8 text-white">
          <h2 className="text-2xl font-black">{l({ zh: "把 UUID 轉成可理解資訊", en: "Turn UUID into something readable" }, lang)}</h2>
          <p className="mt-2 max-w-2xl font-black text-violet-50">{l({ zh: "L9 會連動目前產生結果，顯示 UUID 數量、格式與字元長度。", en: "L9 reacts to the current result, showing UUID count, format and char length." }, lang)}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-4"><div className="text-xs font-black uppercase text-violet-100">{l({ zh: "數量", en: "Count" }, lang)}</div><div className="text-2xl font-black">{formatted.length}</div></div>
            <div className="rounded-2xl bg-white/10 p-4"><div className="text-xs font-black uppercase text-violet-100">{l({ zh: "格式", en: "Format" }, lang)}</div><div className="text-2xl font-black">{format}</div></div>
            <div className="rounded-2xl bg-white/10 p-4"><div className="text-xs font-black uppercase text-violet-100">{l({ zh: "長度", en: "Length" }, lang)}</div><div className="text-2xl font-black">{formatted[0]?.length ?? 0}</div></div>
          </div>
        </section>

        {/* L10 EmotionConversionLower */}
        <section className="mt-6 rounded-[2rem] bg-white/70 p-6 ring-1 ring-violet-100">
          <h2 className="text-lg font-black text-slate-900">{l({ zh: "進度洞察卡", en: "Progress insight" }, lang)}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-violet-50 p-4"><div className="text-xs font-black uppercase text-violet-700">{l({ zh: "產生數", en: "Generated" }, lang)}</div><div className="text-xl font-black text-slate-900">{formatted.length}</div></div>
            <div className="rounded-2xl bg-purple-50 p-4"><div className="text-xs font-black uppercase text-purple-700">{l({ zh: "格式", en: "Format" }, lang)}</div><div className="text-xl font-black text-slate-900">{format}</div></div>
            <div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-700">{l({ zh: "版本", en: "Version" }, lang)}</div><div className="text-xl font-black text-slate-900">v4</div></div>
          </div>
          <p className="mt-4 text-sm font-black text-slate-600">{l({ zh: "UUID v4 適合開發測試與臨時識別，重要場景建議搭配資料庫唯一約束。", en: "UUID v4 is great for dev testing and temporary IDs; for critical scenarios, pair with database unique constraints." }, lang)}</p>
        </section>

        {/* L11 DecisionPath */}
        <section className="mt-6 rounded-[2rem] bg-white/70 p-6 ring-1 ring-violet-100">
          <h2 className="text-lg font-black text-slate-900">{l({ zh: "決策路徑", en: "Decision path" }, lang)}</h2>
          <p className="mt-1 text-sm font-black text-slate-500">{l({ zh: "選格式 → 產生 → 複製 → 使用", en: "Choose format → Generate → Copy → Use" }, lang)}</p>
          <div className="mt-4 grid gap-3 lg:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-4 text-sm font-black text-slate-700">1 Choose · {l({ zh: "選格式", en: "format" }, lang)}</div>
            <div className="rounded-2xl bg-slate-50 p-4 text-sm font-black text-slate-700">2 Generate · {l({ zh: "產生", en: "generate" }, lang)}</div>
            <div className="rounded-2xl bg-slate-50 p-4 text-sm font-black text-slate-700">3 Copy · {l({ zh: "複製", en: "copy" }, lang)}</div>
            <div className="rounded-2xl bg-slate-50 p-4 text-sm font-black text-slate-700">4 Use · {l({ zh: "使用", en: "use" }, lang)}</div>
          </div>
        </section>

        {/* L12 Knowledge */}
        <section className="mt-6 rounded-[2rem] bg-white/70 p-6 ring-1 ring-violet-100">
          <h2 className="text-lg font-black text-slate-900">{l({ zh: "UUID 的知識", en: "UUID knowledge" }, lang)}</h2>
          <dl className="mt-4 grid gap-4 lg:grid-cols-2">
            <div><dt className="font-black text-violet-700">{l({ zh: "定義", en: "Definition" }, lang)}</dt><dd className="text-sm font-black text-slate-600">{l({ zh: "UUID 是 128 位識別碼，標準格式為 8-4-4-4-12 十六進位字串。", en: "UUID is a 128-bit identifier; standard format is 8-4-4-4-12 hex string." }, lang)}</dd></div>
            <div><dt className="font-black text-violet-700">{l({ zh: "公式", en: "Formula" }, lang)}</dt><dd className="text-sm font-black text-slate-600">{l({ zh: "v4 = 122 隨機位 + 6 固定位（版本 + 變體），共 2¹²² ≈ 5.3×10³⁶ 種。", en: "v4 = 122 random bits + 6 fixed bits (version + variant), total 2¹²² ≈ 5.3×10³⁶ possibilities." }, lang)}</dd></div>
            <div><dt className="font-black text-violet-700">{l({ zh: "限制", en: "Limits" }, lang)}</dt><dd className="text-sm font-black text-slate-600">{l({ zh: "理論上可能碰撞但極罕見；不適合需要絕對保證唯一的場景。", en: "Theoretically possible collision but extremely rare; not for absolute uniqueness guarantees." }, lang)}</dd></div>
            <div><dt className="font-black text-violet-700">{l({ zh: "解讀", en: "Reading" }, lang)}</dt><dd className="text-sm font-black text-slate-600">{l({ zh: "第三段第 1 位固定為 4（版本），第四段第 1 位固定為 8/9/a/b（變體）。", en: "3rd group 1st digit is always 4 (version); 4th group 1st digit is 8/9/a/b (variant)." }, lang)}</dd></div>
            <div><dt className="font-black text-violet-700">{l({ zh: "脈絡", en: "Context" }, lang)}</dt><dd className="text-sm font-black text-slate-600">{l({ zh: "廣泛用於資料庫、分散式系統與 API，是現代軟體的基礎設施。", en: "Widely used in databases, distributed systems and APIs; core infrastructure of modern software." }, lang)}</dd></div>
            <div><dt className="font-black text-violet-700">{l({ zh: "範例", en: "Example" }, lang)}</dt><dd className="text-sm font-black text-slate-600">{l({ zh: "550e8400-e29b-41d4-a716-446655440000 是標準 v4 UUID。", en: "550e8400-e29b-41d4-a716-446655440000 is a standard v4 UUID." }, lang)}</dd></div>
          </dl>
        </section>

        {/* L13 FAQ */}
        <section className="mt-6 rounded-[2rem] bg-white/70 p-6 ring-1 ring-violet-100">
          <h2 className="text-lg font-black text-slate-900">{l({ zh: "常見問題", en: "FAQ" }, lang)}</h2>
          <div className="mt-4 space-y-3">
            {faqs.map((f, i) => (
              <details key={i} className="rounded-2xl bg-slate-50 p-4">
                <summary className="cursor-pointer font-black text-slate-800">{l(f.q, lang)}</summary>
                <p className="mt-2 text-sm font-black text-slate-600">{l(f.a, lang)}</p>
              </details>
            ))}
          </div>
        </section>

        {/* L14 FAQAfterAdSlot */}
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="uuid-faq" position="inline" /></section>

        {/* L15 AffiliateResources */}
        <section className="mt-6 rounded-[2rem] bg-white/70 p-6 ring-1 ring-violet-100">
          <h2 className="text-lg font-black text-slate-900">{l({ zh: "推薦工具", en: "Recommended tools" }, lang)}</h2>
          <p className="mt-1 text-sm font-black text-slate-500">{l({ zh: "開發者的下一步工具", en: "Next tools for developers" }, lang)}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <a href="/tools/developer/json-formatter" className="rounded-2xl bg-violet-50 p-4 font-black text-violet-700">{l({ zh: "JSON 格式化", en: "JSON Formatter" }, lang)}</a>
            <a href="/tools/developer/lorem-ipsum-generator" className="rounded-2xl bg-purple-50 p-4 font-black text-purple-700">{l({ zh: "Lorem Ipsum 產生器", en: "Lorem Ipsum Generator" }, lang)}</a>
            <a href="/tools/developer/code-minifier" className="rounded-2xl bg-blue-50 p-4 font-black text-blue-700">{l({ zh: "程式碼壓縮器", en: "Code Minifier" }, lang)}</a>
          </div>
          <p className="mt-3 text-xs font-black text-slate-400">{l({ zh: "* 聯盟連結，購買後我們可能獲得佣金。", en: "* Affiliate links; we may earn a commission." }, lang)}</p>
        </section>

        {/* L16 PremiumGate */}
        <section className="mt-6">
          <PremiumGate plan="PRO">
            <div className="rounded-[2rem] bg-slate-900 p-8 text-white">
              <h2 className="text-2xl font-black">{l({ zh: "PRO UUID 進階包", en: "PRO UUID Advanced" }, lang)}</h2>
              <p className="mt-2 font-black text-slate-300">{l({ zh: "解鎖 v1/v3/v5 命名空間、批次匯出與自訂前綴。", en: "Unlock v1/v3/v5 namespaces, batch export and custom prefixes." }, lang)}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/10 p-4 font-black">{l({ zh: "多版本", en: "Multi-version" }, lang)}</div>
                <div className="rounded-2xl bg-white/10 p-4 font-black">{l({ zh: "批次匯出", en: "Batch export" }, lang)}</div>
                <div className="rounded-2xl bg-white/10 p-4 font-black">{l({ zh: "自訂前綴", en: "Custom prefix" }, lang)}</div>
              </div>
            </div>
          </PremiumGate>
        </section>

        {/* L17 TrustRelatedReferences */}
        <section className="mt-6 rounded-[2rem] bg-white/70 p-6 ring-1 ring-violet-100">
          <h2 className="text-lg font-black text-slate-900">{l({ zh: "信任聲明 · 相關工具 · 參考資料", en: "Trust · Related tools · References" }, lang)}</h2>
          <p className="mt-2 text-sm font-black text-slate-600">{l({ zh: "本工具只供開發與測試用途，不保證產生結果的儲存唯一性或加密安全性。", en: "This tool is for dev & testing only; does not guarantee storage uniqueness or cryptographic security of results." }, lang)}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a href="/tools/developer/json-formatter" className="rounded-full bg-violet-100 px-4 py-2 text-sm font-black text-violet-700">JSON</a>
            <a href="/tools/developer/lorem-ipsum-generator" className="rounded-full bg-purple-100 px-4 py-2 text-sm font-black text-purple-700">Lorem</a>
            <a href="/tools/developer/code-minifier" className="rounded-full bg-blue-100 px-4 py-2 text-sm font-black text-blue-700">Minifier</a>
          </div>
        </section>

      </div>
    </div>
  );
}
