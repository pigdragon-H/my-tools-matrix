import { useMemo, useState } from "react";

function getJsonErrorLine(raw: string, message: string): string {
  const positionMatch = message.match(/position (\d+)/i);
  if (!positionMatch) return message;
  const position = Number(positionMatch[1]);
  const before = raw.slice(0, position);
  const line = before.split("\n").length;
  const column = before.length - before.lastIndexOf("\n");
  return `${message}（第 ${line} 行，第 ${column} 欄）`;
}

export default function JsonFormatter() {
  const [rawJson, setRawJson] = useState('{"name":"My Tools Matrix","type":"DEV","active":true}');
  const [indent, setIndent] = useState<2 | 4>(2);
  const [copied, setCopied] = useState(false);

  const formatted = useMemo(() => {
    if (!rawJson.trim()) {
      return { output: "", error: "" };
    }
    try {
      const parsed = JSON.parse(rawJson);
      return { output: JSON.stringify(parsed, null, indent), error: "" };
    } catch (error) {
      const message = error instanceof Error ? error.message : "JSON 驗證失敗。";
      return { output: "", error: getJsonErrorLine(rawJson, message) };
    }
  }, [rawJson, indent]);

  const copyResult = async () => {
    if (!formatted.output) return;
    await navigator.clipboard.writeText(formatted.output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const clearAll = () => {
    setRawJson("");
    setCopied(false);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <section className="rounded-2xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">DEV-000132</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">JSON Formatter</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">JSON格式化工具：貼上原始 JSON，即時驗證並輸出美化格式，支援 2 格或 4 格縮排。</p>
      </section>

      <section className="flex flex-wrap items-center gap-3 rounded-2xl border bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">縮排</span>
        {[2, 4].map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => setIndent(size as 2 | 4)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${indent === size ? "bg-emerald-600 text-white" : "border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"}`}
          >
            {size} 格
          </button>
        ))}
        <button
          type="button"
          onClick={copyResult}
          disabled={!formatted.output}
          className="ml-auto rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
        >
          {copied ? "已複製" : "複製結果"}
        </button>
        <button
          type="button"
          onClick={clearAll}
          className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-200 dark:hover:bg-red-950/40"
        >
          清除
        </button>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">原始 JSON</label>
          <textarea
            value={rawJson}
            onChange={(event) => {
              setRawJson(event.target.value);
              setCopied(false);
            }}
            className="mt-3 min-h-96 w-full rounded-xl border border-slate-300 bg-white p-3 font-mono text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            placeholder="貼上原始 JSON"
          />
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">格式化結果</p>
          {formatted.error ? (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
              JSON 無效：{formatted.error}
            </div>
          ) : (
            <pre className="mt-3 min-h-96 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
              {formatted.output || "格式化結果會顯示在這裡"}
            </pre>
          )}
        </div>
      </section>
    </div>
  );
}
