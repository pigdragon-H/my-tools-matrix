import { useMemo, useState } from "react";

type Output = { value: string; error: string };

export default function HtmlToMarkdown() {
  const [input, setInput] = useState('<h1>Hello</h1><p>This is <strong>bold</strong> and <a href="https://example.com">link</a>.</p>');
  const [copied, setCopied] = useState(false);


  const result = useMemo<Output>(() => {
    try {
      let md = input;
      md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "# $1\n\n").replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "## $1\n\n");
      md = md.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "**$1**").replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, "**$1**");
      md = md.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, "*$1*").replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, "*$1*");
      md = md.replace(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)");
      md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "$1\n\n").replace(/<br\s*\/?>(?![^<]*>)/gi, "\n").replace(/<[^>]+>/g, "");
      return { value: md.trim(), error: "" };
    } catch (error) {
      return { value: "", error: error instanceof Error ? error.message : "處理失敗，請檢查輸入內容。" };
    }
  }, [input]);

  const copyResult = async () => {
    if (!result.value) return;
    await navigator.clipboard.writeText(result.value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const clearAll = () => {
    setInput("");
    setCopied(false);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <section className="rounded-2xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h1 className="text-3xl font-bold text-slate-950 dark:text-white">HTML to Markdown Converter</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">HTML轉Markdown轉換器：輸入 HTML 後輸出 Markdown。</p>
      </section>

      <section className="flex flex-wrap items-center gap-3 rounded-2xl border bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">

        <button type="button" onClick={copyResult} disabled={!result.value} className="ml-auto rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">{copied ? "已複製" : "複製結果"}</button>
        <button type="button" onClick={clearAll} className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-200 dark:hover:bg-red-950/40">清除</button>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">輸入</label>
          <textarea value={input} onChange={(event) => { setInput(event.target.value); setCopied(false); }} className="mt-3 min-h-96 w-full rounded-xl border border-slate-300 bg-white p-3 font-mono text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">輸出</p>
          {result.error ? <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">{result.error}</div> : <pre className="mt-3 min-h-96 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">{result.value || "結果會顯示在這裡"}</pre>}
        </div>
      </section>
    </div>
  );
}
