import { useMemo, useState } from "react";

type Lang = "zh" | "en";
type PatternKey = "custom" | "email" | "url" | "phone" | "date" | "ip";

const patternMap: Record<Exclude<PatternKey, "custom">, { regex: string; flags: string; zh: string; en: string; sample: string }> = {
  email: { regex: "^[\\w.%+-]+@[\\w.-]+\\.[A-Za-z]{2,}$", flags: "i", zh: "Email 信箱", en: "Email", sample: "victor@example.com" },
  url: { regex: "https?:\\/\\/(?:www\\.)?[\\w.-]+(?:\\.[A-Za-z]{2,})(?:[\\w./?%&=-]*)?", flags: "i", zh: "網址 URL", en: "URL", sample: "https://example.com/tools/dev" },
  phone: { regex: "^(?:\\+?886[-\\s]?)?0?9\\d{2}[-\\s]?\\d{3}[-\\s]?\\d{3}$", flags: "", zh: "台灣手機", en: "Taiwan mobile", sample: "0912-345-678" },
  date: { regex: "^\\d{4}[-\\/]\\d{1,2}[-\\/]\\d{1,2}$", flags: "", zh: "日期 YYYY-MM-DD", en: "Date YYYY-MM-DD", sample: "2026-05-24" },
  ip: { regex: "^(?:(?:25[0-5]|2[0-4]\\d|1?\\d?\\d)\\.){3}(?:25[0-5]|2[0-4]\\d|1?\\d?\\d)$", flags: "", zh: "IPv4 位址", en: "IPv4 address", sample: "192.168.1.1" },
};

const text = {
  zh: { title: "Regex 產生器", subtitle: "從常用模式快速產生正規表示式，支援 Email / URL / 電話 / 日期 / IP。", mode: "常用模式", description: "自然語言描述", regex: "Regex 結果", flags: "Flags", test: "測試文字", copy: "複製 Regex", copied: "已複製", clear: "清除", match: "符合", noMatch: "不符合", placeholder: "例如：驗證 email、台灣手機、IPv4 或 YYYY-MM-DD 日期" },
  en: { title: "Regex Generator", subtitle: "Generate regular expressions from common patterns: Email, URL, phone, date, and IP.", mode: "Common Pattern", description: "Natural Language Description", regex: "Regex Result", flags: "Flags", test: "Test Text", copy: "Copy Regex", copied: "Copied", clear: "Clear", match: "Match", noMatch: "No match", placeholder: "Example: validate email, Taiwan mobile, IPv4, or YYYY-MM-DD date" },
};

function inferPattern(description: string): { regex: string; flags: string } {
  const lower = description.toLowerCase();
  if (/email|e-mail|信箱|郵件/.test(lower)) return patternMap.email;
  if (/url|網址|連結|http|https/.test(lower)) return patternMap.url;
  if (/phone|mobile|電話|手機/.test(lower)) return patternMap.phone;
  if (/date|日期|yyyy|年|月|日/.test(lower)) return patternMap.date;
  if (/ip|ipv4|位址/.test(lower)) return patternMap.ip;
  if (/number|數字|digit/.test(lower)) return { regex: "^\\d+$", flags: "" };
  if (/english|letter|英文|字母/.test(lower)) return { regex: "^[A-Za-z]+$", flags: "" };
  if (/slug/.test(lower)) return { regex: "^[a-z0-9]+(?:-[a-z0-9]+)*$", flags: "" };
  return { regex: ".+", flags: "" };
}

export default function RegexGenerator() {
  const [lang, setLang] = useState<Lang>("zh");
  const [pattern, setPattern] = useState<PatternKey>("email");
  const [description, setDescription] = useState("驗證 Email 信箱格式");
  const [testText, setTestText] = useState(patternMap.email.sample);
  const [copied, setCopied] = useState(false);
  const t = text[lang];

  const generated = useMemo(() => (pattern === "custom" ? inferPattern(description) : patternMap[pattern]), [pattern, description]);
  const isMatch = useMemo(() => { try { return new RegExp(generated.regex, generated.flags).test(testText); } catch { return false; } }, [generated, testText]);

  function choosePattern(value: PatternKey) {
    setPattern(value); setCopied(false);
    if (value !== "custom") { setDescription(lang === "zh" ? `驗證${patternMap[value].zh}` : `Validate ${patternMap[value].en}`); setTestText(patternMap[value].sample); }
  }

  async function copyRegex() {
    await navigator.clipboard.writeText(`/${generated.regex}/${generated.flags}`);
    setCopied(true); window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <section className="rounded-2xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">DEV · REGEX</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">{t.title}</h1>
            <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">{t.subtitle}</p>
          </div>
          <button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">{lang === "zh" ? "EN" : "繁中"}</button>
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5 rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.mode}</label>
            <select value={pattern} onChange={(e) => choosePattern(e.target.value as PatternKey)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white">
              <option value="custom">Custom / 自然語言</option>
              {Object.entries(patternMap).map(([key, item]) => <option key={key} value={key}>{lang === "zh" ? item.zh : item.en}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.description}</label>
            <textarea value={description} onChange={(e) => { setDescription(e.target.value); setPattern("custom"); }} placeholder={t.placeholder} className="mt-2 min-h-36 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.test}</label>
            <input value={testText} onChange={(e) => setTestText(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 font-mono text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
          </div>
          <button type="button" onClick={() => { setPattern("custom"); setDescription(""); setTestText(""); setCopied(false); }} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">{t.clear}</button>
        </div>
        <div className="space-y-5 rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.regex}</p>
            <button type="button" onClick={copyRegex} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">{copied ? t.copied : t.copy}</button>
          </div>
          <pre className="overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">/{generated.regex}/{generated.flags}</pre>
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">{t.flags}</p>
            <code className="rounded-lg bg-slate-100 px-3 py-2 text-sm dark:bg-slate-900">{generated.flags || "none"}</code>
          </div>
          <div className={`rounded-xl border p-4 text-sm ${isMatch ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200" : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"}`}>
            {isMatch ? t.match : t.noMatch}: <span className="font-mono">{testText || "(empty)"}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
