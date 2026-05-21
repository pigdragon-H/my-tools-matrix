import { useMemo, useState } from "react";

export default function RegexTester() {
  const [pattern, setPattern] = useState("\\b\\w+@\\w+\\.\\w+\\b");
  const [flags, setFlags] = useState("gi");
  const [text, setText] = useState("請聯絡 test@example.com 或 hello@tools.dev");

  const result = useMemo(() => {
    try {
      const safeFlags = flags.includes("g") ? flags : `${flags}g`;
      const regex = new RegExp(pattern, safeFlags);
      const matches: Array<{ value: string; index: number }> = [];
      let match: RegExpExecArray | null;
      while ((match = regex.exec(text)) !== null) {
        matches.push({ value: match[0], index: match.index });
        if (match[0] === "") regex.lastIndex += 1;
      }
      return { error: "", matches };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Invalid regular expression", matches: [] };
    }
  }, [pattern, flags, text]);

  return (
    <div className="mx-auto max-w-4xl space-y-6 rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-950">
      <div><h1 className="text-2xl font-bold">Regex 正則表達式測試器</h1><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">輸入正則表達式、flags 與測試文字，即時查看匹配結果與位置。</p></div>
      <div className="grid gap-4 md:grid-cols-3"><label className="text-sm font-medium md:col-span-2">Pattern<input className="mt-1 w-full rounded-lg border p-2 font-mono" value={pattern} onChange={(e) => setPattern(e.target.value)} /></label><label className="text-sm font-medium">Flags<input className="mt-1 w-full rounded-lg border p-2 font-mono" value={flags} onChange={(e) => setFlags(e.target.value)} /></label></div>
      <label className="block text-sm font-medium">測試文字<textarea className="mt-1 min-h-36 w-full rounded-lg border p-3 font-mono" value={text} onChange={(e) => setText(e.target.value)} /></label>
      <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">{result.error ? <p className="text-red-600">錯誤：{result.error}</p> : <div><p className="font-semibold">找到 {result.matches.length} 筆匹配</p><ul className="mt-2 space-y-1 text-sm">{result.matches.map((match, i) => <li key={`${match.value}-${i}`} className="rounded bg-white p-2 font-mono dark:bg-slate-800">#{i + 1} index {match.index}: {match.value}</li>)}</ul></div>}</div>
    </div>
  );
}
