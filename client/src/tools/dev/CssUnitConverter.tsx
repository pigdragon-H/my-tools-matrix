import { useMemo, useState } from "react";

export default function CssUnitConverter() {
  const [px, setPx] = useState(16);
  const [baseFont, setBaseFont] = useState(16);
  const [viewportWidth, setViewportWidth] = useState(1440);

  const result = useMemo(() => {
    const rem = baseFont > 0 ? px / baseFont : 0;
    const em = rem;
    const vw = viewportWidth > 0 ? (px / viewportWidth) * 100 : 0;
    return { rem, em, vw };
  }, [px, baseFont, viewportWidth]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-950">
      <div><h1 className="text-2xl font-bold">CSS 單位轉換器</h1><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">將 px 轉換為 rem、em 與 vw，適合前端切版、響應式設計與設計稿標註換算。</p></div>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="text-sm font-medium">PX<input className="mt-1 w-full rounded-lg border p-2" type="number" value={px} onChange={(e) => setPx(Number(e.target.value))} /></label>
        <label className="text-sm font-medium">根字體大小<input className="mt-1 w-full rounded-lg border p-2" type="number" value={baseFont} onChange={(e) => setBaseFont(Number(e.target.value))} /></label>
        <label className="text-sm font-medium">Viewport 寬度<input className="mt-1 w-full rounded-lg border p-2" type="number" value={viewportWidth} onChange={(e) => setViewportWidth(Number(e.target.value))} /></label>
      </div>
      <div className="grid gap-4 md:grid-cols-3"><div className="rounded-xl bg-slate-50 p-4"><p className="text-sm">rem</p><p className="text-2xl font-bold">{result.rem.toFixed(4)}rem</p></div><div className="rounded-xl bg-blue-50 p-4"><p className="text-sm">em</p><p className="text-2xl font-bold">{result.em.toFixed(4)}em</p></div><div className="rounded-xl bg-emerald-50 p-4"><p className="text-sm">vw</p><p className="text-2xl font-bold">{result.vw.toFixed(4)}vw</p></div></div>
    </div>
  );
}
