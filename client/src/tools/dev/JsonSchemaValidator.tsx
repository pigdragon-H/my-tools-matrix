import { useMemo, useState } from "react";
type Lang = "zh" | "en";
type Issue = { path: string; message: string };
const sampleSchema = `{
  "type": "object",
  "required": ["name", "version", "active"],
  "properties": {
    "name": { "type": "string" },
    "version": { "type": "number" },
    "active": { "type": "boolean" },
    "tags": { "type": "array", "items": { "type": "string" } }
  }
}`;
const sampleJson = `{
  "name": "Formula Universe",
  "version": 2,
  "active": true,
  "tags": ["dev", "json", "schema"]
}`;
const i18n = {
  zh: { title: "JSON Schema 驗證器", subtitle: "驗證 JSON 是否符合基本 JSON Schema：type、required、properties、items、enum。", schema: "JSON Schema", data: "JSON 資料", result: "驗證結果", valid: "符合 Schema", invalid: "不符合 Schema", parseError: "JSON 格式錯誤", copy: "複製結果", copied: "已複製", clear: "清除" },
  en: { title: "JSON Schema Validator", subtitle: "Validate JSON against a basic JSON Schema: type, required, properties, items, and enum.", schema: "JSON Schema", data: "JSON Data", result: "Validation Result", valid: "Valid against schema", invalid: "Invalid against schema", parseError: "JSON parse error", copy: "Copy Result", copied: "Copied", clear: "Clear" },
};
function typeOf(value: unknown): string { if (Array.isArray(value)) return "array"; if (value === null) return "null"; return typeof value; }
function validateValue(value: unknown, schema: any, path = "$"): Issue[] {
  const issues: Issue[] = [];
  if (!schema || typeof schema !== "object") return issues;
  if (schema.type && typeOf(value) !== schema.type) { issues.push({ path, message: `expected ${schema.type}, got ${typeOf(value)}` }); return issues; }
  if (Array.isArray(schema.enum) && !schema.enum.some((item: unknown) => JSON.stringify(item) === JSON.stringify(value))) issues.push({ path, message: `must be one of ${schema.enum.map((item: unknown) => JSON.stringify(item)).join(", ")}` });
  if (schema.type === "object" && value && typeof value === "object" && !Array.isArray(value)) {
    const objectValue = value as Record<string, unknown>;
    if (Array.isArray(schema.required)) schema.required.forEach((key: string) => { if (!(key in objectValue)) issues.push({ path: `${path}.${key}`, message: "required field is missing" }); });
    if (schema.properties && typeof schema.properties === "object") Object.entries(schema.properties).forEach(([key, childSchema]) => { if (key in objectValue) issues.push(...validateValue(objectValue[key], childSchema, `${path}.${key}`)); });
  }
  if (schema.type === "array" && Array.isArray(value) && schema.items) value.forEach((item, index) => { issues.push(...validateValue(item, schema.items, `${path}[${index}]`)); });
  return issues;
}
export default function JsonSchemaValidator() {
  const [lang, setLang] = useState<Lang>("zh");
  const [schemaText, setSchemaText] = useState(sampleSchema);
  const [jsonText, setJsonText] = useState(sampleJson);
  const [copied, setCopied] = useState(false);
  const t = i18n[lang];
  const result = useMemo(() => { try { return { issues: validateValue(JSON.parse(jsonText), JSON.parse(schemaText)), error: "" }; } catch (error) { return { issues: [] as Issue[], error: error instanceof Error ? error.message : String(error) }; } }, [schemaText, jsonText]);
  async function copyResult() { const text = result.error ? `${t.parseError}: ${result.error}` : result.issues.length ? result.issues.map((i) => `${i.path}: ${i.message}`).join("\n") : t.valid; await navigator.clipboard.writeText(text); setCopied(true); window.setTimeout(() => setCopied(false), 1500); }
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <section className="rounded-2xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div><p className="text-sm font-semibold uppercase tracking-wide text-blue-600">DEV · JSON</p><h1 className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">{t.title}</h1><p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">{t.subtitle}</p></div>
          <button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">{lang === "zh" ? "EN" : "繁中"}</button>
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.schema}</label>
          <textarea value={schemaText} onChange={(e) => { setSchemaText(e.target.value); setCopied(false); }} spellCheck={false} className="mt-2 h-96 w-full rounded-xl border border-slate-300 bg-white p-3 font-mono text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.data}</label>
          <textarea value={jsonText} onChange={(e) => { setJsonText(e.target.value); setCopied(false); }} spellCheck={false} className="mt-2 h-96 w-full rounded-xl border border-slate-300 bg-white p-3 font-mono text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
        </div>
      </section>
      <section className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.result}</h2>
          <div className="flex gap-2">
            <button type="button" onClick={copyResult} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">{copied ? t.copied : t.copy}</button>
            <button type="button" onClick={() => { setSchemaText(""); setJsonText(""); setCopied(false); }} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">{t.clear}</button>
          </div>
        </div>
        {result.error ? <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">{t.parseError}: {result.error}</div>
        : result.issues.length ? <div className="space-y-2"><div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">{t.invalid}</div>{result.issues.map((issue, index) => <div key={`${issue.path}-${index}`} className="rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-800"><code className="font-mono text-blue-600 dark:text-blue-300">{issue.path}</code><span className="ml-2 text-slate-700 dark:text-slate-200">{issue.message}</span></div>)}</div>
        : <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">{t.valid}</div>}
      </section>
    </div>
  );
}