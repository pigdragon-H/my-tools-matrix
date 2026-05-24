import { useMemo, useState } from "react";
type Lang = "zh" | "en";
type Unit = "px" | "rem" | "em" | "pt";
const i18n = {
  zh: { title: "字體單位轉換器", subtitle: "在 px / rem / em / pt 之間互轉，可自訂 base font size。", value: "輸入數值", unit: "輸入單位", base: "Base Font Size", result: "轉換結果", copy: "複製", copied: "已複製", clear: "清除", reset: "重設", preview: "文字預覽", invalid: "請輸入有效數值" },
  en: { title: "Font Size Converter", subtitle: "Convert between px / rem / em / pt with configurable base font size.", value: "Input Value", unit: "Input Unit", base: "Base Font Size", result: "Converted Results", copy: "Copy", copied: "Copied", clear: "Clear", reset: "Reset", preview: "Text Preview", invalid: "Enter a valid number" },
};
function toPx(value: number, unit: Unit, base: number): number { if (unit === "px") return value; if (unit === "rem" || unit === "em") return value * base; return value * (96 / 72); }
function fromPx(px: number, unit: Unit, base: number): number { if (unit === "px") return px; if (unit === "rem" || unit === "em") return px / base; return px * (72 / 96); }
function formatNumber(value: number): string { if (!Number.isFinite(value)) return ""; return Number.isInteger(value) ? String(value) : value.toFixed(4).replace(/0+$/, "").replace(/\.$/, ""); }
export default function FontSizeConverter() {
  const [lang, setLang] = useState<Lang>("zh");
  const [value, setValue] = useState(16);
  const [unit, setUnit] = useState<Unit>("px");
  const [baseSize, setBaseSize] = useState(16);
  const [copiedKey, setCopiedKey] = useState("");
  const t = i18n[lang];
  const converted = useMemo(() => {
    if (!Number.isFinite(value) || !Number.isFinite(baseSize) || baseSize <= 0) return null;
    const px = toPx(value, unit, baseSize);
    return (["px", "rem", "em", "pt"] as Unit[]).map((targetUnit) => ({ unit: targetUnit, value: fromPx(px, targetUnit, baseSize), text: `${formatNumber(fromPx(px, targetUnit, baseSize))}${targetUnit}` }));
  }, [value, unit, baseSize]);
  const previewPx = converted?.find((item) => item.unit === "px")?.value ?? 16;
  async function copyValue(label: string, text: string) { await navigator.clipboard.writeText(text); setCopiedKey(label); window.setTimeout(() => setCopiedKey(""), 1500); }
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <section className="rounded-2xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div><p className="text-sm font-semibold uppercase tracking-wide text-blue-600">DEV · CSS</p><h1 className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">{t.title}</h1><p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">{t.subtitle}</p></div>
          <button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">{lang === "zh" ? "EN" : "繁中"}</button>
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="space-y-5 rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div><label className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.value}</label><input type="number" value={value} onChange={(e) => { setValue(Number(e.target.value)); setCopiedKey(""); }} className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white" /></div>
          <div><label className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.unit}</label><select value={unit} onChange={(e) => { setUnit(e.target.value as Unit); setCopiedKey(""); }} className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"><option value="px">px</option><option value="rem">rem</option><option value="em">em</option><option value="pt">pt</option></select></div>
          <div><label className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.base}</label><input type="number" min={1} value={baseSize} onChange={(e) => { setBaseSize(Number(e.target.value)); setCopiedKey(""); }} className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white" /></div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => { setValue(16); setUnit("px"); setBaseSize(16); setCopiedKey(""); }} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">{t.reset}</button>
            <button type="button" onClick={() => { setValue(0); setCopiedKey(""); }} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">{t.clear}</button>
          </div>
        </div>
        <div className="space-y-5 rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.result}</h2>
          {!converted ? <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">{t.invalid}</div>
          : <div className="grid gap-3 sm:grid-cols-2">{converted.map((item) => <div key={item.unit} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"><div className="mb-2 flex items-center justify-between gap-3"><b className="text-slate-800 dark:text-slate-100">{item.unit}</b><button type="button" onClick={() => copyValue(item.unit, item.text)} className="rounded border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">{copiedKey === item.unit ? t.copied : t.copy}</button></div><code className="block break-all rounded-lg bg-slate-50 p-3 font-mono text-sm text-slate-900 dark:bg-slate-900 dark:text-slate-100">{item.text}</code></div>)}</div>}
          <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-800"><div className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">{t.preview}</div><p className="rounded-lg bg-slate-50 p-4 text-slate-900 dark:bg-slate-900 dark:text-slate-100" style={{ fontSize: `${Math.max(1, Math.min(96, previewPx))}px` }}>Formula Universe Typography Preview</p></div>
        </div>
      </section>
    </div>
  );
}
