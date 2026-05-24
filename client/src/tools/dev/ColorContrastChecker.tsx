import { useMemo, useState } from "react";
type Lang = "zh" | "en";
const i18n = {
  zh: { title: "顏色對比度檢查器", subtitle: "輸入前景色與背景色，計算 WCAG 對比度並判斷 AA / AAA 等級。", fg: "前景色", bg: "背景色", ratio: "對比度", preview: "預覽", normalAA: "一般文字 AA", normalAAA: "一般文字 AAA", largeAA: "大字 AA", largeAAA: "大字 AAA", pass: "通過", fail: "未通過", copy: "複製報告", copied: "已複製", clear: "清除", invalid: "請輸入有效 HEX 顏色，例如 #2563eb" },
  en: { title: "Color Contrast Checker", subtitle: "Calculate WCAG contrast ratio for foreground and background colors with AA / AAA grading.", fg: "Foreground", bg: "Background", ratio: "Contrast Ratio", preview: "Preview", normalAA: "Normal Text AA", normalAAA: "Normal Text AAA", largeAA: "Large Text AA", largeAAA: "Large Text AAA", pass: "Pass", fail: "Fail", copy: "Copy Report", copied: "Copied", clear: "Clear", invalid: "Enter valid HEX colors, for example #2563eb" },
};
function normalizeHex(hex: string): string | null {
  const value = hex.trim();
  const short = /^#?([0-9a-f]{3})$/i.exec(value);
  if (short) return `#${short[1].split("").map((c) => c + c).join("")}`.toLowerCase();
  const full = /^#?([0-9a-f]{6})$/i.exec(value);
  return full ? `#${full[1].toLowerCase()}` : null;
}
function hexToRgb(hex: string): [number, number, number] | null {
  const normalized = normalizeHex(hex);
  if (!normalized) return null;
  return [parseInt(normalized.slice(1, 3), 16), parseInt(normalized.slice(3, 5), 16), parseInt(normalized.slice(5, 7), 16)];
}
function channelToLinear(value: number): number { const srgb = value / 255; return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4; }
function luminance(rgb: [number, number, number]): number { const [r, g, b] = rgb.map(channelToLinear); return 0.2126 * r + 0.7152 * g + 0.0722 * b; }
function contrastRatio(fg: string, bg: string): number | null {
  const fgRgb = hexToRgb(fg); const bgRgb = hexToRgb(bg);
  if (!fgRgb || !bgRgb) return null;
  const l1 = luminance(fgRgb); const l2 = luminance(bgRgb);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}
export default function ColorContrastChecker() {
  const [lang, setLang] = useState<Lang>("zh");
  const [foreground, setForeground] = useState("#2563eb");
  const [background, setBackground] = useState("#ffffff");
  const [copied, setCopied] = useState(false);
  const t = i18n[lang];
  const ratio = useMemo(() => contrastRatio(foreground, background), [foreground, background]);
  const fgHex = normalizeHex(foreground); const bgHex = normalizeHex(background);
  const checks = [[t.normalAA, ratio !== null && ratio >= 4.5], [t.normalAAA, ratio !== null && ratio >= 7], [t.largeAA, ratio !== null && ratio >= 3], [t.largeAAA, ratio !== null && ratio >= 4.5]] as const;
  async function copyReport() {
    const report = ratio === null ? t.invalid : [`${t.fg}: ${fgHex}`, `${t.bg}: ${bgHex}`, `${t.ratio}: ${ratio.toFixed(2)}:1`, ...checks.map(([label, ok]) => `${label}: ${ok ? t.pass : t.fail}`)].join("\n");
    await navigator.clipboard.writeText(report); setCopied(true); window.setTimeout(() => setCopied(false), 1500);
  }
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <section className="rounded-2xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div><p className="text-sm font-semibold uppercase tracking-wide text-blue-600">DEV · COLOR</p><h1 className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">{t.title}</h1><p className="mt-2 text-slate-600 dark:text-slate-300">{t.subtitle}</p></div>
          <button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold dark:border-slate-700 dark:text-slate-200">{lang === "zh" ? "EN" : "繁中"}</button>
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5 rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          {([[t.fg, foreground, setForeground], [t.bg, background, setBackground]] as const).map(([label, value, setter]) => (
            <div key={String(label)}>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">{String(label)}</label>
              <div className="mt-2 flex gap-3">
                <input type="color" value={normalizeHex(String(value)) ?? "#000000"} onChange={(e) => (setter as (v: string) => void)(e.target.value)} className="h-12 w-16 rounded border" />
                <input value={String(value)} onChange={(e) => (setter as (v: string) => void)(e.target.value)} className="flex-1 rounded-xl border border-slate-300 p-3 font-mono text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            <button type="button" onClick={copyReport} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">{copied ? t.copied : t.copy}</button>
            <button type="button" onClick={() => { setForeground(""); setBackground(""); setCopied(false); }} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold dark:border-slate-700 dark:text-slate-200">{t.clear}</button>
          </div>
        </div>
        <div className="space-y-4 rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          {ratio === null || !fgHex || !bgHex ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">{t.invalid}</div>
          ) : (
            <>
              <div className="rounded-xl p-6 text-center text-xl font-bold" style={{ color: fgHex, backgroundColor: bgHex }}>{t.preview}: Formula Universe</div>
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900"><div className="text-sm text-slate-500 dark:text-slate-400">{t.ratio}</div><div className="text-3xl font-bold text-slate-950 dark:text-white">{ratio.toFixed(2)}:1</div></div>
              <div className="grid gap-3 sm:grid-cols-2">
                {checks.map(([label, ok]) => <div key={label} className={`rounded-xl border p-4 text-sm ${ok ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200" : "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"}`}><div className="font-semibold">{label}</div><div>{ok ? t.pass : t.fail}</div></div>)}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
