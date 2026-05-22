import { useMemo, useState } from "react";

type Output = { value: string; error: string };

export default function HexToRgb() {
  const [input, setInput] = useState('#3366ff');
  const [copied, setCopied] = useState(false);


  const result = useMemo<Output>(() => {
    try {
      const text = input.trim();
      const rgbMatch = text.match(/^(?:rgb\()?\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)?$/i);
      if (rgbMatch) {
        const vals = rgbMatch.slice(1).map(Number);
        if (vals.some((v) => v < 0 || v > 255)) throw new Error("RGB 必須介於 0 到 255。");
        return { value: `#${vals.map((v) => v.toString(16).padStart(2, "0")).join("")}`, error: "" };
      }
      const hex = text.replace("#", "");
      if (!/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) throw new Error("請輸入有效 HEX 色碼或 RGB 值。");
      const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
      const r = parseInt(full.slice(0, 2), 16), g = parseInt(full.slice(2, 4), 16), b = parseInt(full.slice(4, 6), 16);
      return { value: `rgb(${r}, ${g}, ${b})\nrgba(${r}, ${g}, ${b}, 1)`, error: "" };
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
        <h1 className="text-3xl font-bold text-slate-950 dark:text-white">HEX to RGB Converter</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">HEX轉RGB顏色轉換器：輸入 HEX 或 RGB，雙向轉換。</p>
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
