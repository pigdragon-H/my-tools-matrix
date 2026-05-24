import { useMemo, useState } from "react";
type Lang = "zh" | "en";
type Mode = "html" | "url" | "json";
type Direction = "escape" | "unescape";
const i18n = {
  zh: { title: "Escape / Unescape 轉換器", subtitle: "HTML、URL、JSON 字串的 escape 與 unescape 互轉。", mode: "格式", direction: "方向", escape: "Escape", unescape: "Unescape", input: "輸入", output: "輸出", copy: "複製結果", copied: "已複製", clear: "清除", error: "轉換失敗" },
  en: { title: "Escape / Unescape Converter", subtitle: "Convert HTML, URL, and JSON strings between escaped and unescaped forms.", mode: "Format", direction: "Direction", escape: "Escape", unescape: "Unescape", input: "Input", output: "Output", copy: "Copy Result", copied: "Copied", clear: "Clear", error: "Conversion failed" },
};
const htmlMap: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const htmlReverse: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'" };
function escapeHtml(v: string): string { return v.replace(/[&<>"']/g, (c) => htmlMap[c]); }
function unescapeHtml(v: string): string { return v.replace(/&(amp|lt|gt|quot|#39);/g, (e) => htmlReverse[e] ?? e); }
function convert(value: string, mode: Mode, direction: Direction): { output: string; error: string } {
  try {
    if (mode === "html") return { output: direction === "escape" ? escapeHtml(value) : unescapeHtml(value), error: "" };
    if (mode === "url") return { output: direction === "escape" ? encodeURIComponent(value) : decodeURIComponent(value), error: "" };
    return { output: direction === "escape" ? JSON.stringify(value).slice(1, -1) : JSON.parse(`"${value.replace(/"/g, '\\"')}"`), error: "" };
  } catch (error) { return { output: "", error: error instanceof Error ? error.message : String(error) }; }
}
export default function EscapeUnescape() {
  const [lang, setLang] = useState<Lang>("zh");
  const [mode, setMode] = useState<Mode>("html");
  const [direction, setDirection] = useState<Direction>("escape");
  const [input, setInput] = useState(`<div class="card">Formula & Tools</div>`);
  const [copied, setCopied] = useState(false);
  const t = i18n[lang];
  const result = useMemo(() => convert(input, mode, direction), [input, mode, direction]);
  async function copyResult() { if (!result.output) return; await navigator.clipboard.writeText(result.output); setCopied(true); window.setTimeout(() => setCopied(false), 1500); }
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <section className="rounded-2xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div><p className="text-sm font-semibold uppercase tracking-wide text-blue-600">DEV · STRING</p><h1 className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">{t.title}</h1><p className="mt-2 text-slate-600 dark:text-slate-300">{t.subtitle}</p></div>
          <button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold dark:border-slate-700 dark:text-slate-200">{lang === "zh" ? "EN" : "繁中"}</button>
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.mode}</label><select value={mode} onChange={(e) => setMode(e.target.value as Mode)} className="mt-2 w-full rounded-xl border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-900 dark:text-white"><option value="html">HTML</option><option value="url">URL</option><option value="json">JSON String</option></select></div>
            <div><label className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.direction}</label><select value={direction} onChange={(e) => setDirection(e.target.value as Direction)} className="mt-2 w-full rounded-xl border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-900 dark:text-white"><option value="escape">{t.escape}</option><option value="unescape">{t.unescape}</option></select></div>
          </div>
          <div><label className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.input}</label><textarea value={input} onChange={(e) => setInput(e.target.value)} className="mt-2 h-72 w-full rounded-xl border border-slate-300 p-3 font-mono text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white" /></div>
          <button type="button" onClick={() => { setInput(""); setCopied(false); }} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold dark:border-slate-700 dark:text-slate-200">{t.clear}</button>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.output}</h2>
            <button type="button" onClick={copyResult} disabled={!result.output} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-slate-700 dark:text-slate-200">{copied ? t.copied : t.copy}</button>
          </div>
          {result.error ? <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">{t.error}: {result.error}</div>
          : <pre className="min-h-72 overflow-auto whitespace-pre-wrap break-all rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">{result.output}</pre>}
        </div>
      </section>
    </div>
  );
}
