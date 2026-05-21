import { useMemo, useState } from "react";

export default function UrlEncoder() {
  const [input, setInput] = useState("https://example.com/search?q=工具矩陣&sort=最新");
  const [mode, setMode] = useState<"encode" | "decode">("encode");

  const result = useMemo(() => {
    try {
      return mode === "encode" ? encodeURIComponent(input) : decodeURIComponent(input);
    } catch (error) {
      return error instanceof Error ? `轉換錯誤：${error.message}` : "轉換錯誤";
    }
  }, [input, mode]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-950">
      <div><h1 className="text-2xl font-bold">URL 編碼 / 解碼工具</h1><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">將網址參數或文字轉成 URL-safe 格式，也可把已編碼字串還原，適合 API、查詢字串與分享連結除錯。</p></div>
      <div className="flex gap-2"><button className={`rounded-lg px-4 py-2 ${mode === "encode" ? "bg-blue-600 text-white" : "bg-slate-100"}`} onClick={() => setMode("encode")}>Encode</button><button className={`rounded-lg px-4 py-2 ${mode === "decode" ? "bg-blue-600 text-white" : "bg-slate-100"}`} onClick={() => setMode("decode")}>Decode</button></div>
      <label className="block text-sm font-medium">輸入<textarea className="mt-1 min-h-32 w-full rounded-lg border p-3 font-mono" value={input} onChange={(e) => setInput(e.target.value)} /></label>
      <div><p className="mb-1 text-sm font-medium">結果</p><pre className="whitespace-pre-wrap break-all rounded-xl bg-slate-50 p-4 font-mono text-sm dark:bg-slate-900">{result}</pre></div>
    </div>
  );
}
