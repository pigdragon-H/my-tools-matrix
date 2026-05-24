import { useMemo, useState } from "react";
type Lang = "zh" | "en";
type EditMode = "width" | "height";
const i18n = {
  zh: { title: "長寬比計算器", subtitle: "計算圖片與影片長寬比，輸入寬或高即可依比例自動換算。", width: "寬度", height: "高度", ratio: "長寬比", presets: "常用比例", copy: "複製結果", copied: "已複製", clear: "清除", simplified: "最簡比例", decimal: "小數比例", result: "換算結果" },
  en: { title: "Aspect Ratio Calculator", subtitle: "Calculate image and video aspect ratios. Enter width or height to convert automatically.", width: "Width", height: "Height", ratio: "Aspect Ratio", presets: "Presets", copy: "Copy Result", copied: "Copied", clear: "Clear", simplified: "Simplified Ratio", decimal: "Decimal Ratio", result: "Result" },
};
const presets = [["16:9", 16, 9], ["4:3", 4, 3], ["1:1", 1, 1], ["3:2", 3, 2], ["21:9", 21, 9], ["9:16", 9, 16]] as const;
function gcd(a: number, b: number): number { return b === 0 ? Math.abs(a) : gcd(b, a % b); }
export default function AspectRatioCalculator() {
  const [lang, setLang] = useState<Lang>("zh");
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [ratioW, setRatioW] = useState(16);
  const [ratioH, setRatioH] = useState(9);
  const [lastEdit, setLastEdit] = useState<EditMode>("width");
  const [copied, setCopied] = useState(false);
  const t = i18n[lang];
  const simplified = useMemo(() => { const d = gcd(Math.round(width), Math.round(height)) || 1; return `${Math.round(width / d)}:${Math.round(height / d)}`; }, [width, height]);
  const decimalRatio = height ? width / height : 0;
  function setPreset(w: number, h: number) { setRatioW(w); setRatioH(h); if (lastEdit === "width") setHeight(Math.round((width * h) / w)); else setWidth(Math.round((height * w) / h)); setCopied(false); }
  function updateWidth(value: number) { const safe = Math.max(0, value || 0); setWidth(safe); setHeight(ratioW ? Math.round((safe * ratioH) / ratioW) : height); setLastEdit("width"); setCopied(false); }
  function updateHeight(value: number) { const safe = Math.max(0, value || 0); setHeight(safe); setWidth(ratioH ? Math.round((safe * ratioW) / ratioH) : width); setLastEdit("height"); setCopied(false); }
  async function copyResult() { await navigator.clipboard.writeText(`${t.width}: ${width}\n${t.height}: ${height}\n${t.simplified}: ${simplified}\n${t.decimal}: ${decimalRatio.toFixed(4)}`); setCopied(true); window.setTimeout(() => setCopied(false), 1500); }
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <section className="rounded-2xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div><p className="text-sm font-semibold uppercase tracking-wide text-blue-600">DEV · MEDIA</p><h1 className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">{t.title}</h1><p className="mt-2 text-slate-600 dark:text-slate-300">{t.subtitle}</p></div>
          <button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold dark:border-slate-700 dark:text-slate-200">{lang === "zh" ? "EN" : "繁中"}</button>
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5 rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-semibold">{t.width}</label><input type="number" value={width} onChange={(e) => updateWidth(Number(e.target.value))} className="mt-2 w-full rounded-xl border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-900 dark:text-white" /></div>
            <div><label className="text-sm font-semibold">{t.height}</label><input type="number" value={height} onChange={(e) => updateHeight(Number(e.target.value))} className="mt-2 w-full rounded-xl border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-900 dark:text-white" /></div>
          </div>
          <div><label className="text-sm font-semibold">{t.presets}</label><div className="mt-2 flex flex-wrap gap-2">{presets.map(([label, w, h]) => <button key={label} type="button" onClick={() => setPreset(w, h)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200">{label}</button>)}</div></div>
          <div className="flex gap-2">
            <button type="button" onClick={copyResult} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white">{copied ? t.copied : t.copy}</button>
            <button type="button" onClick={() => { setWidth(0); setHeight(0); setCopied(false); }} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold dark:border-slate-700 dark:text-slate-200">{t.clear}</button>
          </div>
        </div>
        <div className="space-y-4 rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <h2 className="text-sm font-semibold">{t.result}</h2>
          <div className="rounded-xl bg-slate-50 p-5 dark:bg-slate-900"><div className="text-sm text-slate-500">{t.simplified}</div><div className="text-4xl font-bold text-slate-950 dark:text-white">{simplified}</div></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border p-4 dark:border-slate-800"><div className="text-sm text-slate-500">{t.decimal}</div><div className="text-2xl font-bold dark:text-white">{decimalRatio.toFixed(4)}</div></div>
            <div className="rounded-xl border p-4 dark:border-slate-800"><div className="text-sm text-slate-500">{t.ratio}</div><div className="text-2xl font-bold dark:text-white">{ratioW}:{ratioH}</div></div>
          </div>
        </div>
      </section>
    </div>
  );
}
