import { useMemo, useState } from "react";

type Lang = "zh" | "en";

const sampleText = "My Tools Matrix JSON diff checker";

const i18n = {
  zh: { title: "文字大小寫轉換器", subtitle: "將文字轉成 camelCase、PascalCase、snake_case、kebab-case、UPPER 或 lower。", input: "輸入文字", result: "轉換結果", copy: "複製", copied: "已複製", clear: "清除", words: "字詞數", empty: "轉換結果會顯示在這裡" },
  en: { title: "Text Case Converter", subtitle: "Convert text to camelCase, PascalCase, snake_case, kebab-case, UPPER, or lower.", input: "Input Text", result: "Converted Results", copy: "Copy", copied: "Copied", clear: "Clear", words: "words", empty: "Converted results will appear here" },
};

function splitWords(value: string): string[] {
  return value.normalize("NFKD").replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").toLowerCase().match(/[a-z0-9]+|[\u4e00-\u9fff]+/g) ?? [];
}

function capitalize(value: string): string {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : "";
}

export default function TextCaseConverter() {
  const [lang, setLang] = useState<Lang>("zh");
  const [input, setInput] = useState(sampleText);
  const [copiedKey, setCopiedKey] = useState("");
  const t = i18n[lang];

  const converted = useMemo(() => {
    const words = splitWords(input);
    return [
      { label: "camelCase", value: words.map((word, index) => (index === 0 ? word : capitalize(word))).join("") },
      { label: "PascalCase", value: words.map(capitalize).join("") },
      { label: "snake_case", value: words.join("_") },
      { label: "kebab-case", value: words.join("-") },
      { label: "UPPER", value: input.toUpperCase() },
      { label: "lower", value: input.toLowerCase() },
    ];
  }, [input]);

  async function copyValue(label: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopiedKey(label); window.setTimeout(() => setCopiedKey(""), 1500);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <section className="rounded-2xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">DEV · TEXT</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">{t.title}</h1>
            <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">{t.subtitle}</p>
          </div>
          <button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">{lang === "zh" ? "EN" : "繁中"}</button>
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.input}</label>
            <span className="text-xs text-slate-500">{splitWords(input).length} {t.words}</span>
          </div>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} className="h-80 w-full rounded-xl border border-slate-300 bg-white p-3 font-mono text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
          <button type="button" onClick={() => { setInput(""); setCopiedKey(""); }} className="mt-3 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">{t.clear}</button>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">{t.result}</h2>
          <div className="space-y-3">
            {converted.map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="font-semibold text-slate-800 dark:text-slate-100">{item.label}</span>
                  <button type="button" onClick={() => copyValue(item.label, item.value)} disabled={!item.value} className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">{copiedKey === item.label ? t.copied : t.copy}</button>
                </div>
                <code className="block break-all rounded-lg bg-slate-50 p-2 font-mono text-sm text-slate-900 dark:bg-slate-900 dark:text-slate-100">{item.value || t.empty}</code>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
