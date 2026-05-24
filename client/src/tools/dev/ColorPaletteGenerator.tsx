import { useMemo, useState } from "react";
type Lang = "zh" | "en";
type Rgb = { r: number; g: number; b: number };
const i18n = {
  zh: { title: "配色方案產生器", subtitle: "輸入主色，自動生成 Tints、Shades 與 Complementary 配色。", base: "主色", tints: "淺色 Tints", shades: "深色 Shades", complementary: "互補色", copy: "複製", copied: "已複製", copyAll: "複製全部", clear: "清除", invalid: "請輸入有效 HEX 顏色，例如 #2563eb" },
  en: { title: "Color Palette Generator", subtitle: "Generate tints, shades, and complementary palettes from a base color.", base: "Base Color", tints: "Tints", shades: "Shades", complementary: "Complementary", copy: "Copy", copied: "Copied", copyAll: "Copy All", clear: "Clear", invalid: "Enter a valid HEX color, for example #2563eb" },
};
function normalizeHex(hex: string): string | null { const v = hex.trim(); const s = /^#?([0-9a-f]{3})$/i.exec(v); if (s) return `#${s[1].split("").map((c) => c + c).join("")}`.toLowerCase(); const f = /^#?([0-9a-f]{6})$/i.exec(v); return f ? `#${f[1].toLowerCase()}` : null; }
function hexToRgb(hex: string): Rgb | null { const n = normalizeHex(hex); if (!n) return null; return { r: parseInt(n.slice(1, 3), 16), g: parseInt(n.slice(3, 5), 16), b: parseInt(n.slice(5, 7), 16) }; }
function rgbToHex({ r, g, b }: Rgb): string { return `#${[r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("")}`; }
function mix(a: Rgb, b: Rgb, w: number): Rgb { return { r: a.r * (1 - w) + b.r * w, g: a.g * (1 - w) + b.g * w, b: a.b * (1 - w) + b.b * w }; }
function buildPalette(hex: string) {
  const rgb = hexToRgb(hex); if (!rgb) return null;
  const white = { r: 255, g: 255, b: 255 }; const black = { r: 0, g: 0, b: 0 };
  const comp = { r: 255 - rgb.r, g: 255 - rgb.g, b: 255 - rgb.b };
  return { base: normalizeHex(hex)!, tints: [0.15, 0.3, 0.45, 0.6, 0.75].map((w) => rgbToHex(mix(rgb, white, w))), shades: [0.15, 0.3, 0.45, 0.6, 0.75].map((w) => rgbToHex(mix(rgb, black, w))), complementary: [rgbToHex(comp), rgbToHex(mix(comp, white, 0.35)), rgbToHex(mix(comp, black, 0.25))] };
}
export default function ColorPaletteGenerator() {
  const [lang, setLang] = useState<Lang>("zh");
  const [baseColor, setBaseColor] = useState("#2563eb");
  const [copiedKey, setCopiedKey] = useState("");
  const t = i18n[lang];
  const palette = useMemo(() => buildPalette(baseColor), [baseColor]);
  const normalized = normalizeHex(baseColor);
  async function copyValue(key: string, value: string) { await navigator.clipboard.writeText(value); setCopiedKey(key); window.setTimeout(() => setCopiedKey(""), 1500); }
  async function copyAll() { if (!palette) return; await navigator.clipboard.writeText([`${t.base}: ${palette.base}`, `${t.tints}: ${palette.tints.join(", ")}`, `${t.shades}: ${palette.shades.join(", ")}`, `${t.complementary}: ${palette.complementary.join(", ")}`].join("\n")); setCopiedKey("all"); window.setTimeout(() => setCopiedKey(""), 1500); }
  function ColorSwatch({ label, color }: { label: string; color: string }) {
    return <button type="button" onClick={() => copyValue(color, color)} className="overflow-hidden rounded-xl border border-slate-200 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800"><div className="h-20" style={{ backgroundColor: color }} /><div className="bg-white p-3 dark:bg-slate-950"><div className="text-xs text-slate-500 dark:text-slate-400">{label}</div><code className="font-mono text-sm text-slate-900 dark:text-slate-100">{copiedKey === color ? t.copied : color}</code></div></button>;
  }
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <section className="rounded-2xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div><p className="text-sm font-semibold uppercase tracking-wide text-blue-600">DEV · COLOR</p><h1 className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">{t.title}</h1><p className="mt-2 text-slate-600 dark:text-slate-300">{t.subtitle}</p></div>
          <button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold dark:border-slate-700 dark:text-slate-200">{lang === "zh" ? "EN" : "繁中"}</button>
        </div>
      </section>
      <section className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="grid gap-4 md:grid-cols-[80px_1fr_auto_auto] md:items-end">
          <div><label className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.base}</label><input type="color" value={normalized ?? "#000000"} onChange={(e) => setBaseColor(e.target.value)} className="mt-2 h-12 w-full rounded border" /></div>
          <div><label className="text-sm font-semibold text-slate-700 dark:text-slate-200">HEX</label><input value={baseColor} onChange={(e) => setBaseColor(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 p-3 font-mono text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white" /></div>
          <button type="button" onClick={copyAll} disabled={!palette} className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{copiedKey === "all" ? t.copied : t.copyAll}</button>
          <button type="button" onClick={() => { setBaseColor(""); setCopiedKey(""); }} className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold dark:border-slate-700 dark:text-slate-200">{t.clear}</button>
        </div>
      </section>
      {!palette ? <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">{t.invalid}</div>
      : <section className="space-y-6">
          <div className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950"><h2 className="mb-3 text-sm font-semibold">{t.base}</h2><div className="grid gap-3 sm:grid-cols-3"><ColorSwatch label={t.base} color={palette.base} /></div></div>
          <div className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950"><h2 className="mb-3 text-sm font-semibold">{t.tints}</h2><div className="grid gap-3 sm:grid-cols-2 md:grid-cols-5">{palette.tints.map((color, i) => <ColorSwatch key={color} label={`Tint ${i + 1}`} color={color} />)}</div></div>
          <div className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950"><h2 className="mb-3 text-sm font-semibold">{t.shades}</h2><div className="grid gap-3 sm:grid-cols-2 md:grid-cols-5">{palette.shades.map((color, i) => <ColorSwatch key={color} label={`Shade ${i + 1}`} color={color} />)}</div></div>
          <div className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950"><h2 className="mb-3 text-sm font-semibold">{t.complementary}</h2><div className="grid gap-3 sm:grid-cols-3">{palette.complementary.map((color, i) => <ColorSwatch key={color} label={`Complement ${i + 1}`} color={color} />)}</div></div>
        </section>}
    </div>
  );
}
