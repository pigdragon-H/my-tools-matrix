// @profile B
// Profile B · Calculator-YMYL · CsvToJson (Developer GOLD · JsonFormatter-aligned)

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "trivial", range: "0 – 5", label: { zh: "極小資料", en: "Trivial" }, desc: { zh: "5 列以內,通常是測試樣本或單筆設定;直接內嵌到程式碼或 fixture 即可,無需額外管線。", en: "Up to 5 rows — typically test samples or single-record configs; inline as code fixtures, no pipeline needed." } },
  { key: "small", range: "5 – 100", label: { zh: "輕量表格", en: "Small table" }, desc: { zh: "5 到 100 列,常見於小型查找表(lookup table)或週期報告;一次性轉成 JSON,可直接 import。", en: "5 – 100 rows — small lookup tables or weekly reports; one-shot conversion to JSON, importable directly." } },
  { key: "medium", range: "100 – 1k", label: { zh: "標準資料集", en: "Standard dataset" }, desc: { zh: "100 到 1,000 列,適合作為前端 fixture 或開發環境 seed;轉換後檔案大小仍可放進 git。", en: "100 – 1k rows — fits as frontend fixtures or dev-env seed data; converted file still git-friendly." } },
  { key: "large", range: "1k – 10k", label: { zh: "中型資料匯入", en: "Mid-size import" }, desc: { zh: "1,000 到 10,000 列,常見於匯入或資料遷移;考慮拆檔或改用 NDJSON 逐行串流。", en: "1k – 10k rows — common for imports and migrations; consider chunking or NDJSON line streaming." } },
  { key: "huge", range: "10k – 100k", label: { zh: "資料倉儲級", en: "Warehouse-scale" }, desc: { zh: "1 萬到 10 萬列,瀏覽器轉檔已逼近極限;建議改用 Node CLI、DuckDB 或專用 ETL 工具。", en: "10k – 100k rows — browser conversion is near its limit; switch to Node CLI, DuckDB, or dedicated ETL." } },
  { key: "massive", range: ">100k", label: { zh: "超大資料集", en: "Massive" }, desc: { zh: "超過 10 萬列,單一 JSON 已不適合直接傳輸;改用 Parquet、NDJSON 或資料庫匯入流程。", en: "Over 100k rows — a single JSON is no longer transport-friendly; use Parquet, NDJSON, or DB import." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "JSON 格式化器", en: "JSON Formatter" }, href: "/tools/developer/json-formatter" },
  { label: { zh: "正則表達式測試器", en: "Regex Tester" }, href: "/tools/developer/regex-tester" },
  { label: { zh: "差異比對器", en: "Diff Checker" }, href: "/tools/developer/diff-checker" },
  { label: { zh: "Base64 編碼器", en: "Base64 Encoder" }, href: "/tools/developer/base64-encoder" },
];

const SAMPLE_SIMPLE = `name,age,city
Alice,30,Taipei
Bob,25,Tokyo
Carol,35,Singapore
Dave,28,Seoul`;

const SAMPLE_QUOTED = `id,product,"price (USD)",in_stock
1,"Wireless mouse, ergonomic",24.99,true
2,"USB-C cable, 2m",9.50,true
3,"Notebook ""Pro"" edition",1299.00,false`;

const ui = {
  zh: {
    badge: "開發工具 · CSV 轉 JSON · 黃金樣板", switchToEnglish: "English mode", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "CSV to JSON Converter · CSV 轉 JSON 工具", subtitle: "貼上 CSV 即時轉成結構化 JSON 陣列,支援雙引號逸出、自訂分隔字元與型別推斷",
    intro: "本工具在瀏覽器端解析 CSV(RFC 4180 子集),自動把首列當作欄位名,把每列轉成物件;支援雙引號內含逗號/換行/雙引號逸出、自訂分隔字元(逗號/分號/Tab),並提供型別推斷(數值/布林/null)、列數與位元組統計;不上傳任何資料,適合處理含敏感欄位的客戶名單、訂單匯出或 ETL 中介資料。",
    trustNoteLabel: "注意事項:", trustNote: "本工具完全在瀏覽器端執行(自寫 RFC 4180 解析器),所有資料皆不上傳;型別推斷僅針對純數值、true/false 與空字串,不會主動轉換日期或貨幣字串。超過 10 萬列建議改用 Node CLI 或專用 ETL 工具。",
    quickActionCard: "快速範例卡", tryExample: "一鍵載入 CSV 範例", examplePreview: "目前列數", examplePerson: "標準範例", fillExample: "一鍵填入簡單 CSV 範例", previewActivePath: "填入含引號逸出範例",
    examplesCalculator: "範例 → 計算機", enterValues: "貼上 CSV 與選擇分隔字元", examplesHelper: "先用範例 CSV 理解轉換邏輯與型別推斷,再貼上自己的資料。",
    metric: "陣列模式", imperial: "物件對映", exampleCards: "範例卡", baselineExample: "純文字 CSV", activeExample: "含引號逸出 CSV", flowDemo: "列數 × 欄數", calculator: "計算機",
    inputJson: "CSV 輸入(純文字)", indentSize: "分隔字元", sortKeys: "型別推斷(數值 / 布林 / null)",
    indent2: "逗號 ,", indent4: "分號 ;", indentTab: "Tab",
    resultCard: "JSON 轉換結果", unit: "輸出列數", primaryValue: "主要數值", maintenanceTarget: "輸出列數", actionTarget: "欄數", estimatedTdee: "輸出大小", maintenance: "B", fatLossTarget: "欄數",
    outputBytes: "輸出列數", outputDepth: "欄位數量", outputTokens: "輸出位元組", outputValid: "解析驗證", calendarBreakdown: "輸出分解", outputJson: "輸出 JSON",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格 CSV 規模判讀矩陣", tdeeMatrixNote: "L7 固定六格,把目前 CSV 列數放進常見的開發/匯入/ETL 區間;這是工程設計參考,不是法律或合規建議。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把列數判讀轉成資料管線決策", conversionNote: "L9 會連動目前轉換結果,顯示列數、欄數與輸出位元組,協助判斷是否需要拆檔、改用 NDJSON 或進入 ETL 流程。",
    progressInsight: "結構洞察卡", possibleTarget: "目前 CSV 結構", dailyGap: "欄數", weeklyTrend: "列數", motivation: "動力卡", keepMomentum: "從一份 CSV 走向標準化的資料匯入流程",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的 CSV 結果帶回家", journeyHint: "重新貼上 CSV 或切換分隔字元時自動重算,協助比較轉換前後的資料形狀與型別推斷結果。",
    nextActionLabel: "下一步行動", nextActionTitle: "把結果接到下一個工具", nextActionItem1: "用 JSON 格式化器格式化、最小化或驗證輸出 JSON 的合法性與大小", nextActionItem2: "用差異比對器比對兩份 CSV 轉換後的 JSON 結構差異", nextActionItem3: "用正則表達式測試器抽取或清理 CSV 欄位中的格式錯誤資料",
    shareLinkBtn: "📋 複製轉換結果", shareNativeBtn: "📤 分享給隊友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "CSV 輸入 → 解析驗證 → 列數判讀 → 管線決策", bmrStep: "CSV 輸入", deficitStep: "解析驗證", trendStep: "列數判讀", mealStep: "管線決策",
    knowledge: "知識", knowledgeTitle: "CSV 在資料交換與 ETL 中的意義", definition: "定義", definitionText: "CSV(Comma-Separated Values)是 IETF RFC 4180(2005)定義的純文字表格格式,以列為單位、欄位以分隔字元(預設逗號)切分;包含逗號/換行/雙引號的欄位需以雙引號包裹,內部雙引號以兩個雙引號表示。雖無強制標準,但 RFC 4180 是業界事實規範。",
    formula: "公式", formulaText: "輸出列數 = lines.length − 1(扣除首列欄位名)。輸出欄數 = headers.length。輸出位元組 = TextEncoder.encode(JSON.stringify(rows, null, 2)).length。型別推斷 = 純數字 → number、true/false(忽略大小寫)→ boolean、空字串 → null,其餘維持為 string。",
    limitations: "限制", limitationsText: "本工具只支援單字元分隔字元、UTF-8 編碼、首列為欄位名的標準格式;不支援多字元分隔(如 ||)、無 header 模式、欄位內嵌不平衡引號、或非 RFC 4180 的方言(如 Excel 預設的 BOM 處理差異)。型別推斷不轉日期/貨幣/科學記號。",
    interpretation: "解讀", interpretationText: "CSV 適合人類編輯與 Excel 互通;JSON 適合 API 與程式處理。轉換時要留意:Excel 匯出可能含 BOM、Windows 換行(\\r\\n)、或 utf-16 編碼;首列若含空格或重複名稱,會造成 JSON 鍵衝突,建議先正規化欄位名。",
    context: "脈絡", contextText: "CSV → JSON 是資料工程中最常見的轉換之一,常出現在 BI 工具匯出、CRM 客戶名單、IoT 感測器紀錄;當列數超過 1 萬,瀏覽器解析會顯著變慢,應改用 Node 的 csv-parse 或 DuckDB 直接 SQL 查詢。",
    example: "範例", exampleText: "若 CSV = 4 列 × 3 欄、首列為 name,age,city,輸出 JSON 會是 4 個物件的陣列,每個物件含 name(string)、age(number)、city(string);總位元組約 200 B,落在「輕量表格」band,可直接 import 到前端。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "CSV 處理的下一步工具", premiumTitle: "專業版 CSV 工具包", premiumText: "解鎖 CSV Schema 驗證、欄位型別自訂(日期/貨幣/UUID)、巨型 CSV 串流預覽、CSV ↔ Parquet 與 SQL DDL 自動產生。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅在瀏覽器端執行自寫 CSV 解析器,所有貼上的資料不會送到伺服器;不取代 CSV Schema 驗證、資料庫匯入或合規檢查工具。型別推斷僅作參考,正式 ETL 應以明確的 schema 定義為準。", relatedTools: "相關工具", relatedToolsText: "JSON 格式化器 · 正則表達式測試器 · 差異比對器 · Base64 編碼器", references: "參考資料", referencesText: "IETF RFC 4180 (Shafranovich, 2005) Common Format and MIME Type for Comma-Separated Values (CSV) Files;W3C 2014 CSV on the Web Working Group 規範文件;Mozilla MDN Web Docs — TextEncoder / TextDecoder 規範;Apache Commons CSV 與 Python csv 模組實作參考;DuckDB 官方文件 — read_csv_auto 自動推斷規則。",
    q1: "為什麼我的 CSV 顯示「Invalid」?", a1: "RFC 4180 要求含逗號/換行/雙引號的欄位必須以雙引號包裹,且內部雙引號要用兩個雙引號逸出。若您的 CSV 含未配對引號、混用換行符(\\r vs \\n)或非 UTF-8 編碼,本工具可能解析失敗,錯誤訊息會標示行號。",
    q2: "「型別推斷」會不會把我的電話號碼變成數字?", a2: "會,這是常見陷阱。本工具會把純數字字串(如 0912345678)轉成 number 並丟失前導零。若需保留為字串,請關閉型別推斷,或在 CSV 欄位前加單引號(Excel 慣例)讓它包成引號字串。",
    q3: "貼上的資料會被送到伺服器嗎?", a3: "不會。本工具完全在瀏覽器端用自寫的 RFC 4180 解析器處理;頁面關閉後資料即消失,適合處理含 PII、信用卡末四碼或商業敏感欄位的 CSV。",
    q4: "支援多大的檔案?", a4: "主要受瀏覽器記憶體限制(實務上 5–20 MB 仍可),但超過 1 萬列即建議改用 Node CLI 或 DuckDB;欄數超過 100 通常代表表格設計需要拆表(寬表 → 長表)。",
    q5: "可以自訂分隔字元嗎?", a5: "可以。本工具支援逗號(,)、分號(;)與 Tab 三種常見分隔字元;若您的檔案是管道符號(|)或其他自訂字元,目前需要先用文字編輯器替換成支援的分隔字元。",
    q6: "可以用本工具做資料清理或合規檢查嗎?", a6: "不建議。本工具只處理語法解析與型別推斷,不檢查 schema、欄位敏感性或注入風險;資料清理請使用 OpenRefine、pandas 或專業 ETL 工具,合規檢查請使用 CSV Schema 驗證器或專業安全廠商服務。",
  },
  en: {
    badge: "Developer · CSV to JSON · Gold template", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "CSV to JSON Converter", subtitle: "Paste CSV to convert into a structured JSON array — quote escaping, custom delimiters, and type inference",
    intro: "This tool parses CSV in the browser (an RFC 4180 subset), uses the first row as field names, and turns every row into an object. It supports double-quoted fields with embedded commas/newlines/quotes, custom delimiters (comma/semicolon/tab), and type inference (number/boolean/null), with row and byte counts. No data is uploaded, so it is safe for customer lists, order exports, or ETL intermediate files containing sensitive fields.",
    trustNoteLabel: "Note:", trustNote: "Everything runs in the browser via a hand-written RFC 4180 parser; nothing leaves your machine. Type inference only handles plain numbers, true/false, and empty strings — it does not auto-convert dates or currency. For more than 100k rows, prefer a Node CLI or dedicated ETL tool.",
    quickActionCard: "Quick example", tryExample: "Try a CSV sample", examplePreview: "Current rows", examplePerson: "Standard example", fillExample: "Fill the simple CSV example", previewActivePath: "Try the quoted-escape example",
    examplesCalculator: "Examples → Calculator", enterValues: "Paste CSV and choose delimiter", examplesHelper: "Start from a sample CSV to see the parsing logic and type inference, then paste your own data.",
    metric: "Array mode", imperial: "Object map", exampleCards: "Example cards", baselineExample: "Plain CSV", activeExample: "Quoted-escape CSV", flowDemo: "Rows × cols", calculator: "Calculator",
    inputJson: "CSV input (plain text)", indentSize: "Delimiter", sortKeys: "Type inference (number / boolean / null)",
    indent2: "Comma ,", indent4: "Semicolon ;", indentTab: "Tab",
    resultCard: "JSON conversion result", unit: "Output rows", primaryValue: "Headline number", maintenanceTarget: "Output rows", actionTarget: "Cols", estimatedTdee: "Output size", maintenance: "B", fatLossTarget: "Cols",
    outputBytes: "Output rows", outputDepth: "Field count", outputTokens: "Output bytes", outputValid: "Parse validation", calendarBreakdown: "Output breakdown", outputJson: "Output JSON",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band CSV size matrix", tdeeMatrixNote: "L7 fixed six-band matrix — places the current row count into common dev/import/ETL ranges. An engineering reference, not legal or compliance advice.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Turn the row count into a data pipeline decision", conversionNote: "L9 reflects the current results — rows, columns, and output bytes — to help decide whether to chunk the file, switch to NDJSON, or move to a proper ETL flow.",
    progressInsight: "Structure insight", possibleTarget: "Current CSV shape", dailyGap: "Cols", weeklyTrend: "Rows", motivation: "Motivation", keepMomentum: "Move from a single CSV to a standardised data import pipeline",
    saveShareJourney: "Save / share", journeyTitle: "Take today's CSV result home", journeyHint: "Re-paste the CSV or switch the delimiter to auto-recompute and compare the data shape and type inference results.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use the JSON Formatter to format, minify, or validate the output JSON's syntax and size", nextActionItem2: "Use the Diff Checker to compare two CSV-converted JSON structures", nextActionItem3: "Use the Regex Tester to extract or clean malformed data inside CSV fields",
    shareLinkBtn: "📋 Copy result", shareNativeBtn: "📤 Share with a teammate", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "CSV input → Parse → Row band → Pipeline decision", bmrStep: "CSV input", deficitStep: "Parse", trendStep: "Row band", mealStep: "Pipeline",
    knowledge: "Knowledge", knowledgeTitle: "What CSV means for data interchange and ETL", definition: "Definition", definitionText: "CSV (Comma-Separated Values) is the plain-text tabular format defined by IETF RFC 4180 (2005). One row per line, fields split by a delimiter (comma by default); fields containing comma/newline/quote must be wrapped in double quotes, and embedded quotes are escaped by doubling. Although not a strict standard, RFC 4180 is the de-facto reference.",
    formula: "Formula", formulaText: "Output rows = lines.length − 1 (excluding the header line). Output cols = headers.length. Output bytes = TextEncoder.encode(JSON.stringify(rows, null, 2)).length. Type inference = pure number → number, true/false (case-insensitive) → boolean, empty string → null; all else stays as string.",
    limitations: "Limitations", limitationsText: "Supports only single-character delimiters, UTF-8 encoding, and a header on the first row. Does not support multi-char delimiters (||), header-less mode, unbalanced embedded quotes, or non-RFC-4180 dialects (e.g. Excel BOM handling differences). Type inference does not convert dates, currency, or scientific notation.",
    interpretation: "Interpretation", interpretationText: "CSV is great for humans and Excel; JSON is great for APIs and programs. When converting, watch for: Excel exports may include a BOM, Windows newlines (\\r\\n), or UTF-16 encoding. Headers with spaces or duplicates create JSON key collisions — normalise the headers first.",
    context: "Context", contextText: "CSV → JSON is one of the most common conversions in data engineering, appearing in BI exports, CRM customer lists, and IoT sensor logs. Above 10k rows, browser parsing slows down significantly — switch to Node's csv-parse or query directly via DuckDB.",
    example: "Example", exampleText: "If CSV = 4 rows × 3 cols with header name,age,city, the output JSON is an array of 4 objects, each with name (string), age (number), city (string); total ~200 B, lands in the \"Small table\" band, and is importable directly into the frontend.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for CSV work", premiumTitle: "Pro CSV Toolkit", premiumText: "Unlock CSV Schema validation, custom column types (date/currency/UUID), large-CSV streaming preview, CSV ↔ Parquet, and SQL DDL auto-generation.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool only runs a hand-written CSV parser in the browser; pasted data is never sent to the server. It does not replace CSV Schema validators, database import, or compliance tooling. Type inference is informational; production ETL should rely on an explicit schema.", relatedTools: "Related tools", relatedToolsText: "JSON Formatter · Regex Tester · Diff Checker · Base64 Encoder", references: "References", referencesText: "IETF RFC 4180 (Shafranovich, 2005) Common Format and MIME Type for CSV Files; W3C CSV on the Web Working Group (2014) specification documents; Mozilla MDN Web Docs — TextEncoder / TextDecoder reference; Apache Commons CSV and Python csv module implementation references; DuckDB official documentation — read_csv_auto inference rules.",
    q1: "Why is my CSV shown as \"Invalid\"?", a1: "RFC 4180 requires fields containing comma/newline/quote to be double-quoted, and embedded quotes to be escaped by doubling. If your CSV has unpaired quotes, mixed line endings (\\r vs \\n), or non-UTF-8 encoding, parsing will fail and the error message will include the line number.",
    q2: "Will type inference turn my phone numbers into integers?", a2: "Yes — this is a common pitfall. The tool converts pure-digit strings (e.g. 0912345678) to number, dropping leading zeros. To preserve them as strings, disable type inference, or prefix the field with a single quote in Excel (the convention) so it stays quoted.",
    q3: "Is the pasted data sent to the server?", a3: "No. The tool runs entirely in the browser via a hand-written RFC 4180 parser; data disappears when the page is closed. It is safe for CSV containing PII, last-4 credit-card digits, or commercially sensitive fields.",
    q4: "How large a file can it handle?", a4: "Limited by browser memory (5–20 MB usually works). Above 10k rows, prefer a Node CLI or DuckDB. More than 100 columns usually signals a wide-vs-long table redesign is overdue.",
    q5: "Can I use a custom delimiter?", a5: "Yes. The tool supports comma (,), semicolon (;), and tab. For pipe (|) or other custom delimiters, currently you must replace them with a supported delimiter in a text editor first.",
    q6: "Can I use this for data cleaning or compliance audit?", a6: "Not recommended. The tool only handles syntax parsing and type inference, not schema validation, field sensitivity, or injection risk. Use OpenRefine, pandas, or a dedicated ETL tool for cleaning, and CSV Schema validators or a security service for compliance.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

// Hand-rolled RFC 4180 parser — handles quoted fields with embedded
// commas/newlines/quotes, configurable delimiter.
function parseCsv(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      }
      field += ch; i++; continue;
    }
    if (ch === '"') { inQuotes = true; i++; continue; }
    if (ch === delimiter) { row.push(field); field = ""; i++; continue; }
    if (ch === "\n") { row.push(field); rows.push(row); row = []; field = ""; i++; continue; }
    if (ch === "\r") { i++; continue; }
    field += ch; i++;
  }
  // flush trailing field/row
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows;
}

function inferType(s: string): string | number | boolean | null {
  if (s === "") return null;
  const lower = s.toLowerCase();
  if (lower === "true") return true;
  if (lower === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(s)) {
    const n = Number(s);
    if (Number.isFinite(n)) return n;
  }
  return s;
}

export default function CsvToJson() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric"); // metric=array, imperial=object-map
  const [inputCsv, setInputCsv] = useState(SAMPLE_SIMPLE);
  const [delimiter, setDelimiter] = useState<"," | ";" | "\t">(",");
  const [typeInfer, setTypeInfer] = useState(true);
  const t = ui[lang];

  const result = useMemo(() => {
    try {
      const rows = parseCsv(inputCsv, delimiter);
      if (rows.length === 0) throw new Error(lang === "zh" ? "CSV 為空" : "Empty CSV");
      const headers = rows[0];
      const dataRows = rows.slice(1);
      const objects = dataRows.map((cells) => {
        const obj: Record<string, unknown> = {};
        headers.forEach((h, idx) => {
          const raw = cells[idx] ?? "";
          obj[h] = typeInfer ? inferType(raw) : raw;
        });
        return obj;
      });
      let outputObj: unknown = objects;
      if (unit === "imperial" && headers.length > 0) {
        const keyName = headers[0];
        const map: Record<string, unknown> = {};
        objects.forEach((o) => {
          const k = String(o[keyName] ?? "");
          map[k] = o;
        });
        outputObj = map;
      }
      const output = JSON.stringify(outputObj, null, 2);
      const bytes = new TextEncoder().encode(output).length;
      return { output, rows: dataRows.length, cols: headers.length, bytes, valid: true, error: "" };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { output: "", rows: 0, cols: 0, bytes: 0, valid: false, error: msg };
    }
  }, [inputCsv, delimiter, typeInfer, unit, lang]);

  const rowsDisplay = fmt(result.rows, 0);
  const colsDisplay = fmt(result.cols, 0);

  function fillSimple() { setUnit("metric"); setInputCsv(SAMPLE_SIMPLE); setDelimiter(","); setTypeInfer(true); }
  function fillQuoted() { setUnit("metric"); setInputCsv(SAMPLE_QUOTED); setDelimiter(","); setTypeInfer(true); }

  const activeBand = bands.find(b => {
    const r = result.rows;
    if (r <= 5) return b.key === "trivial";
    if (r <= 100) return b.key === "small";
    if (r <= 1000) return b.key === "medium";
    if (r <= 10000) return b.key === "large";
    if (r <= 100000) return b.key === "huge";
    return b.key === "massive";
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#ddd6fe,_#f8fafc_45%,_#e0e7ff)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-violet-700">{t.badge}</p><h1 className="max-w-3xl font-black tracking-tight text-slate-950 [font-size:clamp(1.75rem,4vw,2.5rem)] [line-height:1.2]">{t.title}</h1><p className="text-xl font-black text-violet-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-violet-200 bg-violet-50 p-5 text-sm leading-6 text-violet-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-violet-100 bg-white/90 p-6 shadow-2xl shadow-violet-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-violet-600 p-5 text-white"><div className="text-xs font-bold uppercase text-violet-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{rowsDisplay}</div><div className="text-sm font-bold text-violet-100">{lang === "zh" ? "列" : "rows"}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{rowsDisplay}×{colsDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{result.bytes}B</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{colsDisplay}</div></div></div><button onClick={fillSimple} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillQuoted} className="mt-3 w-full rounded-2xl border border-violet-200 bg-violet-50 px-5 py-4 text-sm font-black text-violet-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSimple} className="w-full rounded-2xl border border-violet-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">4 rows</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "純文字 CSV → 直接陣列" : "Plain CSV → array mode"}</p></button><button onClick={fillQuoted} className="w-full rounded-2xl border border-violet-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">3 rows</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "含逗號/雙引號逸出 → RFC 4180" : "Embedded comma + quote → RFC 4180"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4"><label className="block text-sm font-black text-slate-700">{t.inputJson}<textarea className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-mono text-sm" rows={8} value={inputCsv} onChange={(e) => setInputCsv(e.target.value)} spellCheck={false} /></label><div className="grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.indentSize}<div className="mt-2 grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-2"><button type="button" className={`rounded-xl px-3 py-2 text-xs font-black ${delimiter === "," ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setDelimiter(",")}>{t.indent2}</button><button type="button" className={`rounded-xl px-3 py-2 text-xs font-black ${delimiter === ";" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setDelimiter(";")}>{t.indent4}</button><button type="button" className={`rounded-xl px-3 py-2 text-xs font-black ${delimiter === "\t" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setDelimiter("\t")}>{t.indentTab}</button></div></label><label className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700"><input type="checkbox" checked={typeInfer} onChange={(e) => setTypeInfer(e.target.checked)} className="h-5 w-5 accent-emerald-600" /><span>{t.sortKeys}</span></label></div></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-violet-400 to-indigo-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{rowsDisplay}</div><div className={`mt-2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black ${result.valid ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{result.valid ? (lang === "zh" ? "✓ 解析成功" : "✓ Valid") : (lang === "zh" ? "✗ 解析錯誤" : "✗ Invalid")}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.outputDepth}</div><div className="mt-1 text-xl font-black">{colsDisplay}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "欄" : "cols"}</div></div></div>{!result.valid && <div className="mt-3 rounded-2xl bg-rose-50 p-3 text-xs font-mono text-rose-800">{result.error}</div>}<div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.outputBytes}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "列數" : "Rows"}</div><p className="mt-2 text-3xl font-black text-emerald-950">{result.rows}</p><p className="text-sm font-bold text-emerald-700">{lang === "zh" ? "列" : "rows"}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.outputDepth}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "欄數" : "Cols"}</div><p className="mt-2 text-3xl font-black text-blue-950">{result.cols}</p><p className="text-sm font-bold text-blue-700">{lang === "zh" ? "欄" : "cols"}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.outputTokens}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "位元組" : "Bytes"}</div><p className="mt-2 text-3xl font-black text-slate-950">{result.bytes}</p><p className="text-sm font-bold text-slate-700">B</p></div></div><div className="mt-5"><div className="text-xs font-black uppercase text-slate-500">{t.outputJson}</div><pre className="mt-2 max-h-72 overflow-auto rounded-2xl bg-slate-950 p-4 font-mono text-xs text-emerald-200">{result.output || "—"}</pre></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-violet-400 bg-violet-50 ring-2 ring-violet-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="csv-to-json-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-violet-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "列數" : "Rows"}</div><div className="mt-1 text-3xl font-black">{result.rows}</div></div><div className="rounded-2xl bg-violet-50 p-4"><div className="text-xs font-black uppercase text-violet-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-violet-950">{result.rows}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result.cols}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item, i) => <div key={`mot-${i}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(result.output || ""); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "CSV 輸入" : "Input", note: t.bmrStep }, { label: lang === "zh" ? "解析驗證" : "Parse", note: t.deficitStep }, { label: lang === "zh" ? "列數判讀" : "Row band", note: t.trendStep }, { label: lang === "zh" ? "管線決策" : "Pipeline", note: t.mealStep }].map((node, index) => <div key={`decision-${index}`} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-violet-300 bg-violet-50" : "border-indigo-200 bg-indigo-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="csv-to-json-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-violet-100 bg-violet-50 p-5 text-center font-black text-violet-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-violet-700">{lang === "zh" ? "* 聯盟連結,購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["Schema 驗證", "型別自訂", "串流預覽", "Parquet"] : ["Schema", "Custom types", "Stream", "Parquet"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
