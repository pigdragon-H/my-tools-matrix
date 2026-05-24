import { useMemo, useState } from "react";
type Lang = "zh" | "en";
type Align = "left" | "center" | "right";
const i18n = {
  zh: { title: "Markdown 表格產生器", subtitle: "用介面建立 Markdown 表格，可設定行列數、對齊方式並複製語法。", rows: "資料列數", cols: "欄數", align: "對齊", left: "靠左", center: "置中", right: "靠右", output: "Markdown 輸出", copy: "複製 Markdown", copied: "已複製", clear: "清除", reset: "重設範例", preview: "表格資料" },
  en: { title: "Markdown Table Generator", subtitle: "Build Markdown tables with configurable rows, columns, alignment, and copyable syntax.", rows: "Rows", cols: "Columns", align: "Alignment", left: "Left", center: "Center", right: "Right", output: "Markdown Output", copy: "Copy Markdown", copied: "Copied", clear: "Clear", reset: "Reset Sample", preview: "Table Data" },
};
function createTable(rows: number, cols: number): string[][] { return Array.from({ length: rows }, (_, row) => Array.from({ length: cols }, (_, col) => row === 0 ? `Column ${col + 1}` : `Value ${row}-${col + 1}`)); }
function separator(align: Align): string { if (align === "center") return ":---:"; if (align === "right") return "---:"; return "---"; }
function toMarkdown(data: string[][], aligns: Align[]): string {
  if (!data.length || !data[0]?.length) return "";
  const header = data[0]; const body = data.slice(1);
  return [`| ${header.map((cell) => cell || " ").join(" | ")} |`, `| ${header.map((_, index) => separator(aligns[index] ?? "left")).join(" | ")} |`, ...body.map((row) => `| ${row.map((cell) => cell || " ").join(" | ")} |`)].join("\n");
}
export default function MarkdownTableGenerator() {
  const [lang, setLang] = useState<Lang>("zh");
  const [rowCount, setRowCount] = useState(4);
  const [colCount, setColCount] = useState(3);
  const [table, setTable] = useState<string[][]>(() => createTable(4, 3));
  const [aligns, setAligns] = useState<Align[]>(["left", "center", "right"]);
  const [copied, setCopied] = useState(false);
  const t = i18n[lang];
  const markdown = useMemo(() => toMarkdown(table, aligns), [table, aligns]);
  function resize(nextRows: number, nextCols: number) {
    const rows = Math.min(20, Math.max(2, Math.floor(nextRows || 2)));
    const cols = Math.min(10, Math.max(1, Math.floor(nextCols || 1)));
    setRowCount(rows); setColCount(cols);
    setTable((current) => Array.from({ length: rows }, (_, row) => Array.from({ length: cols }, (_, col) => current[row]?.[col] ?? (row === 0 ? `Column ${col + 1}` : ""))));
    setAligns((current) => Array.from({ length: cols }, (_, index) => current[index] ?? "left"));
  }
  function updateCell(row: number, col: number, value: string) { setTable((current) => current.map((line, rowIndex) => rowIndex === row ? line.map((cell, colIndex) => colIndex === col ? value : cell) : line)); setCopied(false); }
  function updateAlign(col: number, value: Align) { setAligns((current) => current.map((align, index) => index === col ? value : align)); setCopied(false); }
  async function copyMarkdown() { await navigator.clipboard.writeText(markdown); setCopied(true); window.setTimeout(() => setCopied(false), 1500); }
  function resetSample() { setTable(createTable(rowCount, colCount)); setAligns(Array.from({ length: colCount }, (_, index) => index % 3 === 1 ? "center" : index % 3 === 2 ? "right" : "left")); setCopied(false); }
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <section className="rounded-2xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div><p className="text-sm font-semibold uppercase tracking-wide text-blue-600">DEV · MARKDOWN</p><h1 className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">{t.title}</h1><p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">{t.subtitle}</p></div>
          <button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">{lang === "zh" ? "EN" : "繁中"}</button>
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <div className="space-y-5 rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.rows}</label><input type="number" min={2} max={20} value={rowCount} onChange={(e) => resize(Number(e.target.value), colCount)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white" /></div>
            <div><label className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.cols}</label><input type="number" min={1} max={10} value={colCount} onChange={(e) => resize(rowCount, Number(e.target.value))} className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white" /></div>
          </div>
          <div>
            <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">{t.align}</h2>
            <div className="space-y-2">{Array.from({ length: colCount }, (_, col) => <div key={col} className="flex items-center gap-3"><span className="w-20 text-sm text-slate-600 dark:text-slate-300">Column {col + 1}</span><select value={aligns[col] ?? "left"} onChange={(e) => updateAlign(col, e.target.value as Align)} className="flex-1 rounded-xl border border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"><option value="left">{t.left}</option><option value="center">{t.center}</option><option value="right">{t.right}</option></select></div>)}</div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={resetSample} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">{t.reset}</button>
            <button type="button" onClick={() => { setTable(Array.from({ length: rowCount }, () => Array.from({ length: colCount }, () => ""))); setCopied(false); }} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">{t.clear}</button>
          </div>
        </div>
        <div className="space-y-5 rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div>
            <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">{t.preview}</h2>
            <div className="overflow-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full min-w-[560px] border-collapse text-sm">
                <tbody>{table.map((row, rowIndex) => <tr key={rowIndex} className={rowIndex === 0 ? "bg-slate-50 dark:bg-slate-900" : ""}>{row.map((cell, colIndex) => <td key={`${rowIndex}-${colIndex}`} className="border border-slate-200 p-2 dark:border-slate-800"><input value={cell} onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)} className="w-full rounded-lg border border-transparent bg-transparent p-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white dark:text-white dark:focus:bg-slate-950" /></td>)}</tr>)}</tbody>
              </table>
            </div>
          </div>
          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.output}</h2>
              <button type="button" onClick={copyMarkdown} disabled={!markdown} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">{copied ? t.copied : t.copy}</button>
            </div>
            <pre className="min-h-56 overflow-auto whitespace-pre-wrap break-all rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">{markdown}</pre>
          </div>
        </div>
      </section>
    </div>
  );
}
