import { useMemo, useState } from "react";
type Lang = "zh" | "en";
type StatusItem = { code: number; title: string; zh: string; en: string };
const statuses: StatusItem[] = [
  { code: 100, title: "Continue", zh: "請求初始部分已收到，客戶端可繼續傳送。", en: "The initial part of the request has been received and the client may continue." },
  { code: 101, title: "Switching Protocols", zh: "伺服器正在切換通訊協定。", en: "The server is switching protocols." },
  { code: 200, title: "OK", zh: "請求成功。", en: "The request succeeded." },
  { code: 201, title: "Created", zh: "請求成功，並已建立新資源。", en: "The request succeeded and a new resource was created." },
  { code: 204, title: "No Content", zh: "請求成功，但沒有內容可回傳。", en: "The request succeeded but there is no content to return." },
  { code: 301, title: "Moved Permanently", zh: "資源已永久移動到新的 URL。", en: "The resource has permanently moved to a new URL." },
  { code: 302, title: "Found", zh: "資源暫時位於其他 URL。", en: "The resource is temporarily available at another URL." },
  { code: 304, title: "Not Modified", zh: "資源未修改，可使用快取版本。", en: "The resource has not changed and the cached version may be used." },
  { code: 400, title: "Bad Request", zh: "請求格式錯誤或參數無效。", en: "The request is malformed or contains invalid parameters." },
  { code: 401, title: "Unauthorized", zh: "需要驗證身分或憑證無效。", en: "Authentication is required or credentials are invalid." },
  { code: 403, title: "Forbidden", zh: "伺服器理解請求，但拒絕授權。", en: "The server understood the request but refuses to authorize it." },
  { code: 404, title: "Not Found", zh: "找不到請求的資源。", en: "The requested resource could not be found." },
  { code: 409, title: "Conflict", zh: "請求與目前資源狀態衝突。", en: "The request conflicts with the current state of the resource." },
  { code: 422, title: "Unprocessable Content", zh: "語法正確，但語意或驗證失敗。", en: "The request is syntactically correct but semantically invalid." },
  { code: 429, title: "Too Many Requests", zh: "請求過多，已觸發速率限制。", en: "Too many requests have been sent in a given amount of time." },
  { code: 500, title: "Internal Server Error", zh: "伺服器發生未預期錯誤。", en: "The server encountered an unexpected error." },
  { code: 502, title: "Bad Gateway", zh: "閘道或代理收到無效回應。", en: "The gateway or proxy received an invalid response." },
  { code: 503, title: "Service Unavailable", zh: "服務暫時不可用，可能維護或過載。", en: "The service is temporarily unavailable, possibly due to maintenance or overload." },
  { code: 504, title: "Gateway Timeout", zh: "閘道或代理等待上游回應逾時。", en: "The gateway or proxy timed out waiting for an upstream response." },
];
const i18n = {
  zh: { title: "HTTP 狀態碼查詢", subtitle: "查詢常用 HTTP 狀態碼含義，包含 200、301、404、500 等。", search: "搜尋狀態碼或關鍵字", category: "分類", all: "全部", result: "查詢結果", copy: "複製", copied: "已複製", clear: "清除", none: "找不到符合的狀態碼" },
  en: { title: "HTTP Status Checker", subtitle: "Look up common HTTP status codes such as 200, 301, 404, and 500.", search: "Search code or keyword", category: "Category", all: "All", result: "Results", copy: "Copy", copied: "Copied", clear: "Clear", none: "No matching status codes" },
};
function categoryOf(code: number): string { if (code < 200) return "1xx"; if (code < 300) return "2xx"; if (code < 400) return "3xx"; if (code < 500) return "4xx"; return "5xx"; }
function badgeClass(code: number): string { if (code < 300) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200"; if (code < 400) return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200"; if (code < 500) return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200"; return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200"; }
export default function HttpStatusChecker() {
  const [lang, setLang] = useState<Lang>("zh");
  const [query, setQuery] = useState("404");
  const [category, setCategory] = useState("all");
  const [copiedKey, setCopiedKey] = useState("");
  const t = i18n[lang];
  const filtered = useMemo(() => { const q = query.trim().toLowerCase(); return statuses.filter((item) => { const matchesCategory = category === "all" || categoryOf(item.code) === category; const text = `${item.code} ${item.title} ${item.zh} ${item.en}`.toLowerCase(); return matchesCategory && (!q || text.includes(q)); }); }, [query, category]);
  async function copyStatus(item: StatusItem) { await navigator.clipboard.writeText(`${item.code} ${item.title}\n${lang === "zh" ? item.zh : item.en}`); setCopiedKey(String(item.code)); window.setTimeout(() => setCopiedKey(""), 1500); }
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <section className="rounded-2xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div><p className="text-sm font-semibold uppercase tracking-wide text-blue-600">DEV · HTTP</p><h1 className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">{t.title}</h1><p className="mt-2 text-slate-600 dark:text-slate-300">{t.subtitle}</p></div>
          <button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold dark:border-slate-700 dark:text-slate-200">{lang === "zh" ? "EN" : "繁中"}</button>
        </div>
      </section>
      <section className="grid gap-4 rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 md:grid-cols-[1fr_180px_auto]">
        <div><label className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.search}</label><input value={query} onChange={(e) => setQuery(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white" placeholder="404 / redirect / server" /></div>
        <div><label className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.category}</label><select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"><option value="all">{t.all}</option><option value="1xx">1xx</option><option value="2xx">2xx</option><option value="3xx">3xx</option><option value="4xx">4xx</option><option value="5xx">5xx</option></select></div>
        <div className="flex items-end"><button type="button" onClick={() => { setQuery(""); setCategory("all"); setCopiedKey(""); }} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold dark:border-slate-700 dark:text-slate-200">{t.clear}</button></div>
      </section>
      <section className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">{t.result} ({filtered.length})</h2>
        {!filtered.length ? <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">{t.none}</div>
        : <div className="space-y-3">{filtered.map((item) => <div key={item.code} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"><div className="flex flex-wrap items-center justify-between gap-3"><div><span className={`mr-2 rounded px-2 py-1 text-xs font-bold ${badgeClass(item.code)}`}>{categoryOf(item.code)}</span><span className="font-mono text-xl font-bold text-slate-950 dark:text-white">{item.code}</span><span className="ml-2 font-semibold text-slate-800 dark:text-slate-100">{item.title}</span></div><button type="button" onClick={() => copyStatus(item)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700 dark:text-slate-200">{copiedKey === String(item.code) ? t.copied : t.copy}</button></div><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{lang === "zh" ? item.zh : item.en}</p></div>)}</div>}
      </section>
    </div>
  );
}