import { useMemo, useState } from "react";

type Lang = "zh" | "en";
type Base = 2 | 8 | 10 | 16;

const digits = "0123456789ABCDEF";

const i18n = {
  zh: { title: "數字進位制轉換器", subtitle: "在 2 / 8 / 10 / 16 進位之間即時互轉，支援小數點。", input: "輸入數字", base: "輸入進位", result: "轉換結果", copy: "複製", copied: "已複製", clear: "清除", invalid: "無法解析此進位制數字" },
  en: { title: "Number Base Converter", subtitle: "Convert instantly between base 2 / 8 / 10 / 16 with decimal point support.", input: "Input Number", base: "Input Base", result: "Converted Results", copy: "Copy", copied: "Copied", clear: "Clear", invalid: "Cannot parse this number in the selected base" },
};

function parseBaseNumber(value: string, base: Base): number | null {
  const trimmed = value.trim().toUpperCase();
  if (!trimmed) return null;
  const sign = trimmed.startsWith("-") ? -1 : 1;
  const unsigned = trimmed.replace(/^[-+]/, "");
  const parts = unsigned.split(".");
  if (parts.length > 2) return null;
  const [integerPart, fractionalPart = ""] = parts;
  if (!integerPart && !fractionalPart) return null;
  let integerValue = 0;
  for (const char of integerPart || "0") { const digit = digits.indexOf(char); if (digit < 0 || digit >= base) return null; integerValue = integerValue * base + digit; }
  let fractionalValue = 0; let denominator = base;
  for (const char of fractionalPart) { const digit = digits.indexOf(char); if (digit < 0 || digit >= base) return null; fractionalValue += digit / denominator; denominator *= base; }
  return sign * (integerValue + fractionalValue);
}

function formatBaseNumber(value: number, base: Base): string {
  if (!Number.isFinite(value)) return "";
  const sign = value < 0 ? "-" : "";
  const absolute = Math.abs(value);
  const integerPart = Math.floor(absolute);
  let output = integerPart.toString(base).toUpperCase();
  let fractionalPart = absolute - integerPart;
  if (fractionalPart > 0) {
    let fractionOutput = "";
    for (let index = 0; index < 12 && fractionalPart > 1e-12; index += 1) { fractionalPart *= base; const digit = Math.floor(fractionalPart); fractionOutput += digits[digit]; fractionalPart -= digit; }
    fractionOutput = fractionOutput.replace(/0+$/, "");
    if (fractionOutput) output += `.${fractionOutput}`;
  }
  return sign + output;
}

export default function NumberBaseConverter() {
  const [lang, setLang] = useState<Lang>("zh");
  const [base, setBase] = useState<Base>(10);
  const [input, setInput] = useState("2026.625");
  const [copiedKey, setCopiedKey] = useState("");
  const t = i18n[lang];

  const parsed = useMemo(() => parseBaseNumber(input, base), [input, base]);
  const outputBases: Base[] = [2, 8, 10, 16];

  async function copyValue(key: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopiedKey(key); window.setTimeout(() => setCopiedKey(""), 1500);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <section className="rounded-2xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">DEV · NUMBER</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">{t.title}</h1>
            <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">{t.subtitle}</p>
          </div>
          <button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">{lang === "zh" ? "EN" : "繁中"}</button>
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="space-y-5 rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.base}</label>
            <select value={base} onChange={(e) => setBase(Number(e.target.value) as Base)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white">
              {([2, 8, 10, 16] as Base[]).map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.input}</label>
            <input value={input} onChange={(e) => { setInput(e.target.value); setCopiedKey(""); }} className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 font-mono text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
          </div>
          <button type="button" onClick={() => { setInput(""); setCopiedKey(""); }} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">{t.clear}</button>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">{t.result}</h2>
          {parsed === null ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">{t.invalid}</div>
          ) : (
            <div className="space-y-3">
              {outputBases.map((outputBase) => { const value = formatBaseNumber(parsed, outputBase); const label = `Base ${outputBase}`; return (
                <div key={outputBase} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <b className="text-slate-800 dark:text-slate-100">{label}</b>
                    <button type="button" onClick={() => copyValue(label, value)} className="rounded border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">{copiedKey === label ? t.copied : t.copy}</button>
                  </div>
                  <code className="block break-all rounded-lg bg-slate-50 p-3 font-mono text-sm text-slate-900 dark:bg-slate-900 dark:text-slate-100">{value}</code>
                </div>
              ); })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
