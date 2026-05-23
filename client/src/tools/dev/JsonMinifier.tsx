import { useMemo, useState } from "react";

const sampleJson = `{
  "project": "Formula Universe",
  "category": "dev",
  "active": true,
  "tools": ["JSON", "JWT", "Regex"]
}`;

const text = {
  zh: {
    title: "JSON 壓縮工具",
    subtitle: "移除 JSON 的空白、縮排與換行，輸出可直接用於 API 或設定檔的最小化 JSON。",
    input: "JSON 輸入",
    output: "壓縮結果",
    placeholder: "貼上要壓縮的 JSON...",
    minify: "壓縮 JSON",
    copy: "複製結果",
    copied: "已複製",
    clear: "清除",
    chars: "字元",
    saved: "節省",
    empty: "壓縮結果會顯示在這裡",
    invalid: "JSON 格式錯誤",
  },
  en: {
    title: "JSON Minifier",
    subtitle: "Remove whitespace, indentation, and line breaks from JSON for APIs and config files.",
    input: "JSON Input",
    output: "Minified Output",
    placeholder: "Paste JSON to minify...",
    minify: "Minify JSON",
    copy: "Copy Result",
    copied: "Copied",
    clear: "Clear",
    chars: "chars",
    saved: "saved",
    empty: "Minified result will appear here",
    invalid: "Invalid JSON",
  },
};

type Lang = "zh" | "en";

export default function JsonMinifier() {
  const [lang, setLang] = useState<Lang>("zh");
  const [input, setInput] = useState(sampleJson);
  const [copied, setCopied] = useState(false);
  const t = text[lang];

  const result = useMemo(() => {
    if (!input.trim()) return { output: "", error: "" };
    try {
      return { output: JSON.stringify(JSON.parse(input)), error: "" };
    } catch (error) {
      return { output: "", error: error instanceof Error ? error.message : String(error) };
    }
  }, [input]);

  const saving = input.length && result.output ? Math.max(0, input.length - result.output.length) : 0;
  const savingPercent = input.length ? Math.round((saving / input.length) * 100) : 0;

  async function copyResult() {
    if (!result.output) return;
    await navigator.clipboard.writeText(result.output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  function clearAll() {
    setInput("");
    setCopied(false);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <section className="rounded-2xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">DEV · JSON</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">{t.title}</h1>
            <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">{t.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={() => setLang(lang === "zh" ? "en" : "zh")}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            {lang === "zh" ? "EN" : "繁中"}
          </button>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-3 flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.input}</label>
            <span className="text-xs text-slate-500">{input.length.toLocaleString()} {t.chars}</span>
          </div>
          <textarea
            value={input}
            onChange={(event) => { setInput(event.target.value); setCopied(false); }}
            spellCheck={false}
            placeholder={t.placeholder}
            className="min-h-80 w-full rounded-xl border border-slate-300 bg-white p-3 font-mono text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={() => setInput(input.trim())} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">{t.minify}</button>
            <button type="button" onClick={clearAll} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">{t.clear}</button>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.output}</p>
              {result.output && <p className="text-xs text-emerald-600">{saving.toLocaleString()} {t.chars} {t.saved} · {savingPercent}%</p>}
            </div>
            <button type="button" onClick={copyResult} disabled={!result.output} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">
              {copied ? t.copied : t.copy}
            </button>
          </div>
          {result.error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
              <strong>{t.invalid}：</strong>{result.error}
            </div>
          ) : (
            <pre className="min-h-80 overflow-auto whitespace-pre-wrap break-all rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
              {result.output || t.empty}
            </pre>
          )}
        </div>
      </section>
    </div>
  );
}
