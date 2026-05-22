import { useMemo, useState } from "react";

type Mode = "encode" | "decode";

function encodeBase64(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function decodeBase64(input: string): string {
  const normalized = input.trim();
  if (!normalized) return "";
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(normalized) || normalized.length % 4 !== 0) {
    throw new Error("請輸入有效的 Base64 字串。長度需為 4 的倍數，且只能包含 A-Z、a-z、0-9、+、/ 與 =。");
  }
  const binary = atob(normalized);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

export default function Base64EncoderDecoder() {
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("Hello My Tools Matrix");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    try {
      const output = mode === "encode" ? encodeBase64(input) : decodeBase64(input);
      return { output, error: "" };
    } catch (error) {
      return {
        output: "",
        error: error instanceof Error ? error.message : "Base64 解碼失敗，請檢查輸入內容。",
      };
    }
  }, [input, mode]);

  const switchMode = () => {
    setMode((current) => (current === "encode" ? "decode" : "encode"));
    setInput(result.output || "");
    setCopied(false);
  };

  const copyResult = async () => {
    if (!result.output) return;
    await navigator.clipboard.writeText(result.output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <section className="rounded-2xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">DEV-000035</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">Base64 Encoder/Decoder</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">Base64編碼解碼器：支援純文字轉 Base64，也支援 Base64 解碼回 UTF-8 純文字。</p>
          </div>
          <button
            type="button"
            onClick={switchMode}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            切換為 {mode === "encode" ? "Decode" : "Encode"} 模式
          </button>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {mode === "encode" ? "輸入純文字" : "輸入 Base64"}
          </label>
          <textarea
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              setCopied(false);
            }}
            className="mt-3 min-h-72 w-full rounded-xl border border-slate-300 bg-white p-3 font-mono text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            placeholder={mode === "encode" ? "輸入要編碼的文字" : "貼上要解碼的 Base64 字串"}
          />
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">結果</p>
            <button
              type="button"
              onClick={copyResult}
              disabled={!result.output}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              {copied ? "已複製" : "複製結果"}
            </button>
          </div>
          {result.error ? (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
              {result.error}
            </div>
          ) : (
            <pre className="mt-3 min-h-72 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
              {result.output || "結果會顯示在這裡"}
            </pre>
          )}
        </div>
      </section>
    </div>
  );
}
