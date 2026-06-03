// @profile B — Calculator-YMYL gold tool · ColorConverter
// 自動生成於 scaffold-tool.mjs · 對標既有黃金模板
// TODO: 完成 17 層 (L1-L17) 內容；此檔案僅為佔位骨架，禁止以此狀態上線

import { useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

type LocalText = { zh: string; en: string };
const l = (v: LocalText, lang: "zh" | "en") => v[lang];

export default function ColorConverter() {
  const { lang } = useLanguage();

  const title: LocalText = {
    zh: "色彩格式轉換器",
    en: "Color Converter",
  };

  const [_input, setInput] = useState("");

  const result = useMemo(() => 0, []);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-8 space-y-7">
      <section aria-label={`L1 Hero — ${l(title, lang)}`} className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 rounded-[2rem] border bg-white/60 p-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{l(title, lang)}</h1>
          <p className="mt-2 text-sm text-slate-600">
            {lang === "zh" ? "TODO：副標 — 一句話說明本工具做什麼" : "TODO: Subtitle — what this tool does in one sentence"}
          </p>
        </div>
        <div className="rounded-3xl border bg-slate-50 p-6">
          <p className="text-xs uppercase text-slate-500">Quick Action</p>
          <p className="mt-2 text-2xl font-semibold">{result}</p>
        </div>
      </section>

      {/* TODO: L4-L17 全部依黃金模板補完 */}
      <section className="rounded-[2rem] border bg-amber-50 p-8 text-amber-900">
        <p className="font-semibold">⚠ Stub only</p>
        <p className="text-sm">此檔案由 scaffold-tool 產生，需補完 L4-L17 才能上線。對標：MeetingCostCalculator / JsonFormatter（Developer 類）。</p>
      </section>
    </main>
  );
}
