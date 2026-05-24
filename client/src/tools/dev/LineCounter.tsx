import { useMemo, useState } from "react";

type Lang = "zh" | "en";

const sampleText = `import { useState } from "react";

export default function Demo() {
  return <div>Hello Formula Universe</div>;
}`;

const i18n = {
  zh: { title: "文字行數統計器", subtitle: "計算總行數、空行、非空行，並列出每行字元數。", input: "輸入文字", total: "總行數", blank: "空行", nonblank: "非空行", chars: "總字元", max: "最長行", min: "最短行", average: "平均每行", perLine: "每行字元數", copy: "複製統計", copied: "已複製", clear: "清除", line: "第", characters: "字元" },
  en: { title: "Line Counter", subtitle: "Count total lines, blank lines, non-empty lines, and per-line character statistics.", input: "Input Text", total: "Total Lines", blank: "Blank Lines", nonblank: "Non-empty Lines", chars: "Characters", max: "Longest Line", min: "Shortest Line", average: "Average", perLine: "Characters Per Line", copy: "Copy Stats", copied: "Copied", clear: "Clear", line: "Line", characters: "chars" },
};

export default function LineCounter() {
  const [lang, setLang] = useState<Lang>("zh");
  const [input, setInput] = useState(sampleText);
  const [copied, setCopied] = useState(false);
  const t = i18n[lang];

  const stats = useMemo(() => {
    const lines = input.length ? input.split(/\r?\n/) : [];
    const lengths = lines.map((line) => line.length);
    const blank = lines.filter((line) => line.trim() === "").length;
    return { lines, lengths, total: lines.length, blank, nonblank: lines.length - blank, chars: input.length, max: lengths.length ? Math.max(...lengths) : 0, min: lengths.length ? Math.min(...lengths) : 0, average: lengths.length ? input.length / lengths.length : 0 };
  }, [input]);

  async function copyStats() {
    const output = [`${t.total}: ${stats.total}`, `${t.blank}: ${stats.blank}`, `${t.nonblank}: ${stats.nonblank}`, `${t.chars}: ${stats.chars}`, `${t.max}: ${stats.max}`, `${t.min}: ${stats.min}`, `${t.average}: ${stats.average.toFixed(1)}`].join("\n");
    await navigator.clipboard.writeText(output);
    setCopied(true); window.setTimeout(() => setCopied(false), 1500);
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
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.input}</label>
          <textarea value={input} onChange={(e) => { setInput(e.target.value); setCopied(false); }} className="mt-2 h-96 w-full rounded-xl border border-slate-300 bg-white p-3 font-mono text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
          <button type="button" onClick={() => { setInput(""); setCopied(false); }} className="mt-3 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">{t.clear}</button>
        </div>
        <div className="space-y-4 rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="grid grid-cols-2 gap-3">
            {([[t.total, stats.total], [t.blank, stats.blank], [t.nonblank, stats.nonblank], [t.chars, stats.chars], [t.max, stats.max], [t.min, stats.min]] as [string, number][]).map(([label, value]) => (
              <div key={label} className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
                <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
                <div className="text-2xl font-bold text-slate-950 dark:text-white">{value}</div>
              </div>
            ))}
          </div>
          <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-950/40 dark:text-blue-200">{t.average}: {stats.average.toFixed(1)} {t.characters}</div>
          <button type="button" onClick={copyStats} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">{copied ? t.copied : t.copy}</button>
          <div>
            <h2 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">{t.perLine}</h2>
            <div className="max-h-72 overflow-auto rounded-xl border border-slate-200 p-2 dark:border-slate-800">
              {stats.lengths.map((length, index) => (
                <div key={index} className="flex justify-between border-b border-slate-100 py-1 text-sm last:border-b-0 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-300">{t.line} {index + 1}</span>
                  <code className="font-mono text-slate-900 dark:text-slate-100">{length}</code>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
