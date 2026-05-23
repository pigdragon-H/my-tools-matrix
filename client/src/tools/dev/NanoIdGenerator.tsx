import { useMemo, useState } from "react";

type Lang = "zh" | "en";
type CharsetKey = "url" | "alphanumeric" | "numeric" | "lowercase" | "custom";

const charsets: Record<Exclude<CharsetKey, "custom">, string> = {
  url: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-",
  alphanumeric: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  numeric: "0123456789",
  lowercase: "abcdefghijklmnopqrstuvwxyz0123456789",
};

const text = {
  zh: { title: "NanoID 產生器", subtitle: "產生安全、短小、URL-friendly 的唯一 ID，可自訂長度、字元集並批量生成。", length: "長度", count: "批量數量", charset: "字元集", custom: "自訂字元", result: "產生結果", generate: "產生 NanoID", copyAll: "複製全部", copied: "已複製", clear: "清除", empty: "結果會顯示在這裡", url: "URL 安全", alphanumeric: "英數字", numeric: "純數字", lowercase: "小寫英數", entropy: "估計熵值", characters: "可用字元" },
  en: { title: "NanoID Generator", subtitle: "Generate secure, compact, URL-friendly unique IDs with custom length, charset, and batch output.", length: "Length", count: "Batch Count", charset: "Charset", custom: "Custom Characters", result: "Generated IDs", generate: "Generate NanoID", copyAll: "Copy All", copied: "Copied", clear: "Clear", empty: "Results will appear here", url: "URL safe", alphanumeric: "Alphanumeric", numeric: "Numeric", lowercase: "Lowercase", entropy: "Estimated entropy", characters: "available characters" },
};

function uniqueCharacters(value: string): string { return Array.from(new Set(value.split(""))).join(""); }

function generateNanoId(size: number, alphabet: string): string {
  const uniqueAlphabet = uniqueCharacters(alphabet);
  if (!uniqueAlphabet) return "";
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => uniqueAlphabet[byte % uniqueAlphabet.length]).join("");
}

function estimateEntropyBits(size: number, alphabetSize: number): number {
  if (size <= 0 || alphabetSize <= 1) return 0;
  return size * Math.log2(alphabetSize);
}

export default function NanoIdGenerator() {
  const [lang, setLang] = useState<Lang>("zh");
  const [length, setLength] = useState(21);
  const [count, setCount] = useState(8);
  const [charsetKey, setCharsetKey] = useState<CharsetKey>("url");
  const [customCharset, setCustomCharset] = useState("ABCDEFGHJKLMNPQRSTUVWXYZ23456789");
  const [ids, setIds] = useState<string[]>(() => Array.from({ length: 8 }, () => generateNanoId(21, charsets.url)));
  const [copied, setCopied] = useState(false);
  const t = text[lang];

  const alphabet = useMemo(() => charsetKey === "custom" ? customCharset : charsets[charsetKey], [charsetKey, customCharset]);
  const normalizedAlphabet = useMemo(() => uniqueCharacters(alphabet), [alphabet]);
  const entropyBits = useMemo(() => estimateEntropyBits(Math.max(1, Math.floor(length || 1)), normalizedAlphabet.length), [length, normalizedAlphabet.length]);

  function generate() {
    const safeLength = Math.min(128, Math.max(1, Math.floor(length || 1)));
    const safeCount = Math.min(100, Math.max(1, Math.floor(count || 1)));
    setIds(Array.from({ length: safeCount }, () => generateNanoId(safeLength, normalizedAlphabet)));
    setCopied(false);
  }

  async function copyAll() {
    if (!ids.length) return;
    await navigator.clipboard.writeText(ids.join("\n"));
    setCopied(true); window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <section className="rounded-2xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">DEV · ID</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">{t.title}</h1>
            <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">{t.subtitle}</p>
          </div>
          <button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">{lang === "zh" ? "EN" : "繁中"}</button>
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="space-y-5 rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.length}</label>
              <input type="number" min={1} max={128} value={length} onChange={(e) => setLength(Number(e.target.value))} className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.count}</label>
              <input type="number" min={1} max={100} value={count} onChange={(e) => setCount(Number(e.target.value))} className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.charset}</label>
            <select value={charsetKey} onChange={(e) => setCharsetKey(e.target.value as CharsetKey)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white">
              <option value="url">{t.url}</option>
              <option value="alphanumeric">{t.alphanumeric}</option>
              <option value="numeric">{t.numeric}</option>
              <option value="lowercase">{t.lowercase}</option>
              <option value="custom">{t.custom}</option>
            </select>
          </div>
          {charsetKey === "custom" && (
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.custom}</label>
              <textarea value={customCharset} onChange={(e) => setCustomCharset(e.target.value)} className="mt-2 min-h-24 w-full rounded-xl border border-slate-300 bg-white p-3 font-mono text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
            </div>
          )}
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
            <div>{normalizedAlphabet.length} {t.characters}</div>
            <div>{t.entropy}: {entropyBits.toFixed(1)} bits</div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={generate} disabled={!normalizedAlphabet.length} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">{t.generate}</button>
            <button type="button" onClick={() => { setIds([]); setCopied(false); }} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">{t.clear}</button>
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.result}</p>
            <button type="button" onClick={copyAll} disabled={!ids.length} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">{copied ? t.copied : t.copyAll}</button>
          </div>
          <pre className="min-h-96 overflow-auto whitespace-pre-wrap break-all rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">{ids.length ? ids.join("\n") : t.empty}</pre>
        </div>
      </section>
    </div>
  );
}
