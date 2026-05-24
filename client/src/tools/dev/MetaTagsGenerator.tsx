import { useMemo, useState } from "react";
type Lang = "zh" | "en";
const i18n = {
  zh: { title: "Meta Tags 產生器", subtitle: "輸入網頁資訊，生成 SEO、Open Graph 與 Twitter Card meta tags。", pageTitle: "頁面標題", description: "頁面描述", url: "網址", image: "圖片 URL", siteName: "網站名稱", type: "OG 類型", twitterHandle: "Twitter 帳號", output: "Meta Tags 輸出", preview: "預覽資料", copy: "複製 Meta Tags", copied: "已複製", clear: "清除", reset: "重設範例" },
  en: { title: "Meta Tags Generator", subtitle: "Generate SEO, Open Graph, and Twitter Card meta tags from page information.", pageTitle: "Page Title", description: "Description", url: "URL", image: "Image URL", siteName: "Site Name", type: "OG Type", twitterHandle: "Twitter Handle", output: "Meta Tags Output", preview: "Preview Data", copy: "Copy Meta Tags", copied: "Copied", clear: "Clear", reset: "Reset Sample" },
};
const sample = { pageTitle: "Formula Universe — Developer Tools", description: "Free developer tools for JSON, JWT, Regex, colors, meta tags, and productivity workflows.", url: "https://my-tools-matrix-production.up.railway.app/tools/dev/meta-tags-generator", image: "https://my-tools-matrix-production.up.railway.app/og-image.png", siteName: "My Tools Matrix", type: "website", twitterHandle: "@mytoolsmatrix" };
function escapeAttr(v: string): string { return v.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function buildTags(d: typeof sample): string {
  const t = escapeAttr(d.pageTitle); const desc = escapeAttr(d.description); const url = escapeAttr(d.url); const img = escapeAttr(d.image); const site = escapeAttr(d.siteName); const type = escapeAttr(d.type); const tw = escapeAttr(d.twitterHandle);
  return [`<title>${t}</title>`, `<meta name="description" content="${desc}" />`, `<meta property="og:title" content="${t}" />`, `<meta property="og:description" content="${desc}" />`, `<meta property="og:url" content="${url}" />`, `<meta property="og:image" content="${img}" />`, `<meta property="og:site_name" content="${site}" />`, `<meta property="og:type" content="${type}" />`, `<meta name="twitter:card" content="summary_large_image" />`, `<meta name="twitter:title" content="${t}" />`, `<meta name="twitter:description" content="${desc}" />`, `<meta name="twitter:image" content="${img}" />`, tw ? `<meta name="twitter:site" content="${tw}" />` : ""].filter(Boolean).join("\n");
}
export default function MetaTagsGenerator() {
  const [lang, setLang] = useState<Lang>("zh");
  const [form, setForm] = useState(sample);
  const [copied, setCopied] = useState(false);
  const t = i18n[lang];
  const metaTags = useMemo(() => buildTags(form), [form]);
  function updateField(key: keyof typeof sample, value: string) { setForm((c) => ({ ...c, [key]: value })); setCopied(false); }
  async function copyTags() { await navigator.clipboard.writeText(metaTags); setCopied(true); window.setTimeout(() => setCopied(false), 1500); }
  const fields: Array<[keyof typeof sample, string, string]> = [["pageTitle", t.pageTitle, "Formula Universe"], ["description", t.description, "Free developer tools."], ["url", t.url, "https://example.com"], ["image", t.image, "https://example.com/og.png"], ["siteName", t.siteName, "My Tools Matrix"], ["type", t.type, "website"], ["twitterHandle", t.twitterHandle, "@handle"]];
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <section className="rounded-2xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div><p className="text-sm font-semibold uppercase tracking-wide text-blue-600">DEV · SEO</p><h1 className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">{t.title}</h1><p className="mt-2 text-slate-600 dark:text-slate-300">{t.subtitle}</p></div>
          <button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold dark:border-slate-700 dark:text-slate-200">{lang === "zh" ? "EN" : "繁中"}</button>
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          {fields.map(([key, label, placeholder]) => <div key={key}><label className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</label>{key === "description" ? <textarea value={form[key]} onChange={(e) => updateField(key, e.target.value)} placeholder={placeholder} className="mt-2 min-h-24 w-full rounded-xl border border-slate-300 p-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white" /> : <input value={form[key]} onChange={(e) => updateField(key, e.target.value)} placeholder={placeholder} className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white" />}</div>)}
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => { setForm(sample); setCopied(false); }} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white">{t.reset}</button>
            <button type="button" onClick={() => { setForm({ pageTitle: "", description: "", url: "", image: "", siteName: "", type: "website", twitterHandle: "" }); setCopied(false); }} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold dark:border-slate-700 dark:text-slate-200">{t.clear}</button>
          </div>
        </div>
        <div className="space-y-5 rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div><h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">{t.preview}</h2><div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"><div className="text-lg font-bold text-slate-950 dark:text-white">{form.pageTitle || "Untitled Page"}</div><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{form.description || "No description"}</p><p className="mt-2 break-all text-xs text-blue-600 dark:text-blue-300">{form.url || "https://example.com"}</p></div></div>
          <div><div className="mb-3 flex flex-wrap items-center justify-between gap-3"><h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.output}</h2><button type="button" onClick={copyTags} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium dark:border-slate-700 dark:text-slate-200">{copied ? t.copied : t.copy}</button></div><pre className="min-h-96 overflow-auto whitespace-pre-wrap break-all rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">{metaTags}</pre></div>
        </div>
      </section>
    </div>
  );
}
