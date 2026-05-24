import { useMemo, useState } from "react";

type Lang = "zh" | "en";
type VariableRow = { name: string; value: string; count: number };

const sampleCss = `:root {
  --color-primary: #2563eb;
  --color-accent: #16a34a;
  --radius-card: 16px;
  --font-body: system-ui, sans-serif;
}

.button {
  color: var(--color-primary);
  border-radius: var(--radius-card);
  font-family: var(--font-body);
}`;

const i18n = {
  zh: { title: "CSS Variables 提取器", subtitle: "從 CSS 程式碼提取所有 --var-name，顯示變數值、出現次數並可複製。", input: "CSS 輸入", result: "變數列表", name: "變數名稱", value: "值", count: "次數", copy: "複製", copyAll: "複製全部", copied: "已複製", clear: "清除", none: "尚未找到 CSS Variables" },
  en: { title: "CSS Variables Extractor", subtitle: "Extract every --var-name from CSS, show values, occurrence counts, and copy results.", input: "CSS Input", result: "Variables", name: "Name", value: "Value", count: "Count", copy: "Copy", copyAll: "Copy All", copied: "Copied", clear: "Clear", none: "No CSS variables found" },
};

function extractVariables(css: string): VariableRow[] {
  const rows = new Map<string, VariableRow>();
  const variableNames = css.match(/--[A-Za-z0-9_-]+/g) ?? [];
  variableNames.forEach((name) => { const existing = rows.get(name); rows.set(name, { name, value: existing?.value ?? "", count: (existing?.count ?? 0) + 1 }); });
  const definitionRegex = /--([A-Za-z0-9_-]+)\s*:\s*([^;{}]+)\s*;/g;
  let match: RegExpExecArray | null;
  while ((match = definitionRegex.exec(css))) { const name = `--${match[1]}`; const existing = rows.get(name) ?? { name, value: "", count: 0 }; rows.set(name, { ...existing, value: match[2].trim() }); }
  return Array.from(rows.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export default function CssVariablesExtractor() {
  const [lang, setLang] = useState<Lang>("zh");
  const [input, setInput] = useState(sampleCss);
  const [copiedKey, setCopiedKey] = useState("");
  const t = i18n[lang];

  const variables = useMemo(() => extractVariables(input), [input]);
  const allVariablesText = variables.map((v) => (v.value ? `${v.name}: ${v.value};` : v.name)).join("\n");

  async function copyValue(key: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopiedKey(key); window.setTimeout(() => setCopiedKey(""), 1500);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <section className="rounded-2xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">DEV · CSS</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">{t.title}</h1>
            <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">{t.subtitle}</p>
          </div>
          <button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">{lang === "zh" ? "EN" : "繁中"}</button>
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.input}</label>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} className="mt-2 h-96 w-full rounded-xl border border-slate-300 bg-white p-3 font-mono text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
          <button type="button" onClick={() => { setInput(""); setCopiedKey(""); }} className="mt-3 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">{t.clear}</button>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.result} ({variables.length})</h2>
            <button type="button" onClick={() => copyValue("all", allVariablesText)} disabled={!variables.length} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">{copiedKey === "all" ? t.copied : t.copyAll}</button>
          </div>
          {!variables.length ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">{t.none}</div>
          ) : (
            <div className="space-y-2">
              {variables.map((variable) => (
                <div key={variable.name} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                  <div className="flex items-center justify-between gap-2">
                    <code className="font-mono font-bold text-blue-600 dark:text-blue-300">{variable.name}</code>
                    <button type="button" onClick={() => copyValue(variable.name, variable.name)} className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">{copiedKey === variable.name ? t.copied : t.copy}</button>
                  </div>
                  <div className="mt-2 grid gap-2 text-sm md:grid-cols-2">
                    <div><span className="text-slate-500">{t.value}: </span><code className="break-all font-mono text-slate-900 dark:text-slate-100">{variable.value || "—"}</code></div>
                    <div><span className="text-slate-500">{t.count}: </span><span className="text-slate-900 dark:text-slate-100">{variable.count}</span></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
