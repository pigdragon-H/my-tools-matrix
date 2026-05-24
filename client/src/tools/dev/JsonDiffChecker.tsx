import { useMemo, useState } from "react";

type Lang = "zh" | "en";
type DiffType = "added" | "removed" | "changed";

type Diff = {
  path: string;
  type: DiffType;
  before?: unknown;
  after?: unknown;
};

const sampleA = `{
  "name": "Formula Universe",
  "version": 1,
  "features": {
    "blog": true,
    "tools": 201
  },
  "tags": ["dev", "seo"]
}`;

const sampleB = `{
  "name": "Formula Universe",
  "version": 2,
  "features": {
    "blog": true,
    "tools": 231,
    "registry": true
  },
  "tags": ["dev", "seo", "registry"]
}`;

const i18n = {
  zh: { title: "JSON 差異比較器", sub: "比較兩份 JSON，標示新增、刪除與修改的欄位。", left: "原始 JSON", right: "新版 JSON", result: "差異結果", copy: "複製差異", copied: "已複製", clear: "清除", added: "新增", removed: "刪除", changed: "修改", same: "沒有差異", invalid: "JSON 格式錯誤" },
  en: { title: "JSON Diff Checker", sub: "Compare two JSON documents and highlight added, removed, and changed fields.", left: "Original JSON", right: "New JSON", result: "Diff Result", copy: "Copy Diff", copied: "Copied", clear: "Clear", added: "Added", removed: "Removed", changed: "Changed", same: "No differences", invalid: "Invalid JSON" },
};

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function collectDiffs(before: unknown, after: unknown, path = "$", output: Diff[] = []): Diff[] {
  if (isObject(before) && isObject(after)) {
    const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
    keys.forEach((key) => {
      const nextPath = `${path}.${key}`;
      if (!(key in before)) { output.push({ path: nextPath, type: "added", after: after[key] }); return; }
      if (!(key in after)) { output.push({ path: nextPath, type: "removed", before: before[key] }); return; }
      collectDiffs(before[key], after[key], nextPath, output);
    });
    return output;
  }
  if (Array.isArray(before) && Array.isArray(after)) {
    const maxLength = Math.max(before.length, after.length);
    for (let index = 0; index < maxLength; index += 1) {
      const nextPath = `${path}[${index}]`;
      if (!(index in before)) { output.push({ path: nextPath, type: "added", after: after[index] }); continue; }
      if (!(index in after)) { output.push({ path: nextPath, type: "removed", before: before[index] }); continue; }
      collectDiffs(before[index], after[index], nextPath, output);
    }
    return output;
  }
  if (JSON.stringify(before) !== JSON.stringify(after)) output.push({ path, type: "changed", before, after });
  return output;
}

function displayValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (value === undefined) return "undefined";
  return JSON.stringify(value);
}

export default function JsonDiffChecker() {
  const [lang, setLang] = useState<Lang>("zh");
  const [leftJson, setLeftJson] = useState(sampleA);
  const [rightJson, setRightJson] = useState(sampleB);
  const [copied, setCopied] = useState(false);
  const t = i18n[lang];

  const result = useMemo(() => {
    try {
      return { diffs: collectDiffs(JSON.parse(leftJson), JSON.parse(rightJson)), error: "" };
    } catch (error) {
      return { diffs: [] as Diff[], error: error instanceof Error ? error.message : String(error) };
    }
  }, [leftJson, rightJson]);

  async function copyDiffs() {
    const text = result.diffs.map((diff) => `${t[diff.type]} ${diff.path}: ${displayValue(diff.before)} -> ${displayValue(diff.after)}`).join("\n") || t.same;
    await navigator.clipboard.writeText(text);
    setCopied(true); window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <section className="rounded-2xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">DEV · JSON</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">{t.title}</h1>
            <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">{t.sub}</p>
          </div>
          <button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">{lang === "zh" ? "EN" : "繁中"}</button>
        </div>
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.left}</label>
          <textarea value={leftJson} onChange={(e) => setLeftJson(e.target.value)} spellCheck={false} className="mt-2 h-72 w-full rounded-xl border border-slate-300 bg-white p-3 font-mono text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.right}</label>
          <textarea value={rightJson} onChange={(e) => setRightJson(e.target.value)} spellCheck={false} className="mt-2 h-72 w-full rounded-xl border border-slate-300 bg-white p-3 font-mono text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
        </div>
      </section>
      <section className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.result}</h2>
          <div className="flex gap-2">
            <button type="button" onClick={copyDiffs} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">{copied ? t.copied : t.copy}</button>
            <button type="button" onClick={() => { setLeftJson(""); setRightJson(""); }} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">{t.clear}</button>
          </div>
        </div>
        {result.error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">{t.invalid}: {result.error}</div>
        ) : result.diffs.length === 0 ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">{t.same}</div>
        ) : (
          <div className="space-y-2">
            {result.diffs.map((diff, index) => (
              <div key={`${diff.path}-${index}`} className="rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-800">
                <span className={`mr-2 rounded px-2 py-1 text-xs font-bold ${diff.type === "added" ? "bg-emerald-100 text-emerald-700" : diff.type === "removed" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{t[diff.type]}</span>
                <code className="font-mono text-slate-800 dark:text-slate-100">{diff.path}</code>
                <div className="mt-2 break-all font-mono text-xs text-slate-600 dark:text-slate-300">{displayValue(diff.before)} → {displayValue(diff.after)}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
