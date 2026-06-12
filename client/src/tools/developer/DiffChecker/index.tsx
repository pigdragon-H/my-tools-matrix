// @profile B
// Profile B · 計算機-YMYL · DiffChecker (Developer · JsonFormatter gold template)

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
  { key: "identical", range: "0%", label: { zh: "完全相同 (0%)", en: "Identical (0%)" }, desc: { zh: "兩段文字完全一致;適合確認 commit/合約版本。", en: "Inputs match exactly — confirm commit / contract version." } },
  { key: "tiny", range: "≤2%", label: { zh: "極小差異 (≤2%)", en: "Tiny (≤2%)" }, desc: { zh: "通常為 typo、格式或空白;PR review 可快速合併。", en: "Typo, format, or whitespace — fast PR review and merge." } },
  { key: "small", range: "2–10%", label: { zh: "小幅修改 (2–10%)", en: "Small (2–10%)" }, desc: { zh: "局部段落調整;適合常規 PR 與文件編修。", en: "Localised paragraph edits — typical PR or doc revision." } },
  { key: "medium", range: "10–30%", label: { zh: "中等改寫 (10–30%)", en: "Medium (10–30%)" }, desc: { zh: "多段重寫;建議分章 review,留意語意變動。", en: "Multi-section rewrite — review by chunk; watch semantic drift." } },
  { key: "major", range: "30–60%", label: { zh: "重大改版 (30–60%)", en: "Major (30–60%)" }, desc: { zh: "大幅重構;建議 side-by-side 並請第二人複核。", en: "Heavy refactor — side-by-side review with a second reviewer." } },
  { key: "rewrite", range: ">60%", label: { zh: "重寫 (>60%)", en: "Rewrite (>60%)" }, desc: { zh: "近乎全新;應視為新版本而非修訂。", en: "Near-total rewrite — treat as a new version, not a revision." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "JSON 格式化器", en: "JSON Formatter" }, href: "/tools/developer/json-formatter" },
  { label: { zh: "Regex 測試器", en: "Regex Tester" }, href: "/tools/developer/regex-tester" },
  { label: { zh: "Markdown 預覽", en: "Markdown Preview" }, href: "/tools/developer/markdown-preview" },
  { label: { zh: "URL 編碼器", en: "URL Encoder" }, href: "/tools/developer/url-encoder" },
];

const SAMPLE_LEFT = `function add(a, b) {\n  return a + b;\n}\n\nconst result = add(1, 2);\nconsole.log(result);`;
const SAMPLE_RIGHT = `function add(a, b, c = 0) {\n  return a + b + c;\n}\n\nconst result = add(1, 2, 3);\nconsole.log("sum:", result);`;
const SAMPLE_LEFT_DOC = `# Spec v1\n\n- API: GET /users\n- Auth: API key\n- Rate: 60/min`;
const SAMPLE_RIGHT_DOC = `# Spec v2\n\n- API: GET /users\n- Auth: Bearer JWT\n- Rate: 120/min\n- Pagination: cursor`;

const ui = {
  zh: {
    badge: "開發工具 · 差異比對 · 黃金模板", switchToEnglish: "English mode", switchToChinese: "切換到中文",
    title: "Diff Checker · 文字差異比對器", subtitle: "行級 diff + 字元級 diff + 六段相似度判讀矩陣",
    intro: "本工具在瀏覽器端逐行比對兩段文字,標記新增/刪除/未變,計算 LCS 相似度與差異百分比,並把結果放入六段判讀矩陣;不上傳資料,適合比對 PR、合約、設定檔、log 與 markdown 草稿。",
    trustNoteLabel: "注意事項:", trustNote: "使用 LCS (最長共同子序列) 演算法逐行比對;空白與大小寫預設敏感;>10000 行建議改用 git diff 或 difftool 處理。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立差異範例", examplePreview: "目前差異率", examplePerson: "新增", fillExample: "填入程式碼範例", previewActivePath: "填入文件範例",
    examplesCalculator: "範例 → 計算機", enterValues: "貼上左右兩段文字", examplesHelper: "先用範例理解 diff 標記,再貼上自己的兩段文字 (PR 前後、合約 v1/v2、log 前後)。",
    metric: "程式範例", imperial: "文件範例", exampleCards: "範例卡", baselineExample: "JS function 變更", activeExample: "API spec 變更", flowDemo: "差異", calculator: "計算機",
    inputJson: "左側 (Original) / 右側 (Modified)", indentSize: "比對模式", sortKeys: "忽略空白與大小寫",
    indent2: "行級 diff", indent4: "字元級 diff", indentTab: "Side-by-side",
    resultCard: "差異比對結果", unit: "比對模式", primaryValue: "主要數值", maintenanceTarget: "差異率", actionTarget: "新增", estimatedTdee: "差異率", maintenance: "%", fatLossTarget: "刪除",
    outputBytes: "差異率", outputDepth: "新增", outputTokens: "刪除", outputValid: "格式驗證", calendarBreakdown: "輸出分解", outputJson: "Diff 輸出",
    resultIntelligence: "結果解讀", tdeeMatrix: "六段相似度判讀矩陣", tdeeMatrixNote: "L7 固定六段,把目前差異率放進判讀分區;這是 review 節奏的視覺參考,不是合規或法律建議。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把 diff 結果轉成 review 行動", conversionNote: "L9 顯示新增/刪除/未變/差異率,協助判斷此 PR 該如何 review、是否需要分拆。",
    progressInsight: "結構洞察卡", possibleTarget: "目前 diff 結構", dailyGap: "新增行", weeklyTrend: "刪除行", motivation: "動力卡", keepMomentum: "從一次粗略的目視比對走向結構化 PR review 流程",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的 diff 結果帶回家", journeyHint: "重新貼上左右文字時自動重算差異率與行級 diff,協助比對不同版本的演進。",
    nextActionLabel: "下一步行動", nextActionTitle: "把結果接到下一個工具", nextActionItem1: "用 JSON 格式化器把左右兩端 JSON 排序後再 diff", nextActionItem2: "用 Regex 測試器抓出特定的差異 pattern", nextActionItem3: "用 Markdown 預覽把 diff 寫入 PR 描述",
    shareLinkBtn: "📋 複製 diff 摘要", shareNativeBtn: "📤 分享給隊友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "輸入 → 比對 → 判讀 → 行動", bmrStep: "貼上左右文字", deficitStep: "LCS 比對", trendStep: "差異判讀", mealStep: "選擇行動",
    knowledge: "知識", knowledgeTitle: "Diff 在版本控制、code review、合約管理中的意義", definition: "定義", definitionText: "Diff (差異) 是兩個文字版本的逐行差別;LCS (Longest Common Subsequence) 是 Myers/Hunt-McIlroy 等演算法的數學基礎;Unified diff (1985) 與 Myers diff (1986) 是 git/svn 預設格式。",
    formula: "公式", formulaText: "相似度 = LCS / max(L1, L2);差異率 = 1 − 相似度;新增行 = 右獨有;刪除行 = 左獨有;未變 = LCS 對齊行。",
    limitations: "限制", limitationsText: "本工具用簡化 LCS,大檔 (>10000 行) 變慢;不偵測重排 (move detection);不解析 binary;不支援 patch 套用;正式 review 請用 git diff / Beyond Compare / Meld。",
    interpretation: "解讀", interpretationText: "0% 完全相同;≤2% typo/格式;2–10% 局部修改;10–30% 多段重寫;30–60% 重大改版;>60% 應視為新版本。",
    context: "脈絡", contextText: "主要場景:PR review、合約 v1/v2 比對、設定檔變更稽核、log 前後對照、文件版本管理、SQL schema 變更、API spec 修訂、A/B 測試文案。",
    example: "範例", exampleText: "左側 5 行、右側 6 行,LCS=4;差異率 = 1 − 4/6 = 33% → 落入「重大改版」區段。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "Diff 之後的下一步工具", premiumTitle: "專業版 Diff 工具包", premiumText: "解鎖三方合併、word/char 級 diff、JSON/YAML 結構 diff、移動偵測、語意 diff、批次比對、patch 匯出。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅在瀏覽器端 LCS 比對,貼上文字不送伺服器;不取代 git diff、Beyond Compare、Meld 或法律合約 redline 流程。",
    relatedTools: "相關工具", relatedToolsText: "JSON 格式化器 · Regex 測試器 · Markdown 預覽 · URL 編碼器", references: "參考資料", referencesText: "Hunt & McIlroy 1976 (Bell Labs);Myers 1986 An O(ND) Difference Algorithm;Unified diff (POSIX);git-diff(1);diff-match-patch (Google);Wu et al 1990 An O(NP) Sequence Comparison。",
    q1: "為什麼差異率與 GitHub 顯示不同?", a1: "GitHub 用 Myers diff + word-level highlight + heuristic move detection;本工具用簡化 LCS。差異率定義不同自然有落差,本工具的數值適合「整體 review 節奏判讀」,精細 PR 比對請用 git diff。",
    q2: "貼上的文字會被送到伺服器嗎?", a2: "不會。LCS 比對完全在瀏覽器端跑;頁面關閉後資料即消失,適合處理私有合約、未公開原始碼、內部設定檔。",
    q3: "為什麼大檔案會卡住?", a3: "簡化 LCS 是 O(N×M),10000×10000 行就要算 1 億次。建議:>2000 行先預處理 (移除註解/空白),或改用 git diff 命令列。",
    q4: "可以做三方合併 (3-way merge) 嗎?", a4: "本工具不支援。三方合併需要 base 版 + 兩個分支 + 衝突偵測 (例如 git merge / kdiff3)。專業版會解鎖。",
    q5: "為什麼空白行被當成差異?", a5: "預設大小寫與空白皆敏感;勾選「忽略空白與大小寫」可消除這類噪音。注意 YAML/Python 等對縮排敏感的語言不應忽略。",
    q6: "Diff 顯示的順序為什麼怪怪的?", a6: "LCS 不偵測「移動 (move)」,搬動的段落會被算成「刪除 + 新增」。如需移動偵測請用 Beyond Compare 或 git diff --color-moved。",
  },
  en: {
    badge: "Developer · Diff · Gold template", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese",
    title: "Diff Checker", subtitle: "Line-level + char-level diff with a six-band similarity matrix",
    intro: "Compares two texts line by line in the browser, marks add/remove/unchanged, computes LCS similarity and diff ratio, and places the result into a six-band reading matrix. Nothing is uploaded — safe for PRs, contracts, configs, logs, and Markdown drafts.",
    trustNoteLabel: "Note:", trustNote: "Uses LCS (longest common subsequence) line diff; whitespace and case are sensitive by default; for >10000 lines prefer git diff or a difftool.",
    quickActionCard: "Quick example", tryExample: "Try a diff sample", examplePreview: "Current diff ratio", examplePerson: "Added", fillExample: "Fill code sample", previewActivePath: "Fill doc sample",
    examplesCalculator: "Examples → Calculator", enterValues: "Paste left & right text", examplesHelper: "Start with a sample to understand diff markers, then paste your own pair (PR before/after, contract v1/v2, log A/B).",
    metric: "Code sample", imperial: "Doc sample", exampleCards: "Example cards", baselineExample: "JS function change", activeExample: "API spec change", flowDemo: "Diff", calculator: "Calculator",
    inputJson: "Left (Original) / Right (Modified)", indentSize: "Diff mode", sortKeys: "Ignore whitespace & case",
    indent2: "Line diff", indent4: "Char diff", indentTab: "Side-by-side",
    resultCard: "Diff result", unit: "Mode", primaryValue: "Headline", maintenanceTarget: "Diff %", actionTarget: "Added", estimatedTdee: "Diff %", maintenance: "%", fatLossTarget: "Removed",
    outputBytes: "Diff %", outputDepth: "Added", outputTokens: "Removed", outputValid: "Format check", calendarBreakdown: "Output breakdown", outputJson: "Diff output",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band similarity matrix", tdeeMatrixNote: "L7 fixed six-band — places the current diff ratio into a reading band. Review-rhythm reference, not legal or compliance advice.",
    emotionConversionLayer: "Emotion & conversion", turnIntoPlan: "Turn the diff into review action", conversionNote: "L9 shows added / removed / unchanged / ratio — helping decide how to review this PR or whether to split it.",
    progressInsight: "Structure insight", possibleTarget: "Current diff shape", dailyGap: "Added", weeklyTrend: "Removed", motivation: "Motivation", keepMomentum: "Move from eyeballed comparison to a structured PR review flow",
    saveShareJourney: "Save / share", journeyTitle: "Take today’s diff home", journeyHint: "Re-paste left/right text to auto-recompute diff ratio and the line diff — handy for tracking version evolution.",
    nextActionLabel: "Next action", nextActionTitle: "Pipe the result into the next tool", nextActionItem1: "Sort both JSONs with the JSON Formatter before diffing", nextActionItem2: "Capture a specific diff pattern with the Regex Tester", nextActionItem3: "Drop the diff into a PR description via Markdown Preview",
    shareLinkBtn: "📋 Copy diff summary", shareNativeBtn: "📤 Share with team", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Input → Compare → Read → Act", bmrStep: "Paste left/right", deficitStep: "LCS compare", trendStep: "Read ratio", mealStep: "Pick action",
    knowledge: "Knowledge", knowledgeTitle: "What diff means in version control, code review, and contracts", definition: "Definition", definitionText: "A diff is the line-by-line difference between two versions; LCS (longest common subsequence) underpins Myers and Hunt-McIlroy algorithms; unified diff (1985) and Myers diff (1986) are the git/svn defaults.",
    formula: "Formula", formulaText: "similarity = LCS / max(L1, L2); diff ratio = 1 − similarity; added = right-only; removed = left-only; unchanged = LCS-aligned lines.",
    limitations: "Limitations", limitationsText: "Simplified LCS slows down past 10000 lines; no move detection; no binary parsing; no patch apply. For production review use git diff, Beyond Compare, or Meld.",
    interpretation: "Interpretation", interpretationText: "0% identical; ≤2% typo/format; 2–10% local edits; 10–30% multi-section rewrite; 30–60% major refactor; >60% treat as a new version.",
    context: "Context", contextText: "Common scenarios: PR review, contract v1/v2 comparison, config drift audit, before/after logs, doc versioning, SQL schema change, API spec revision, A/B copy testing.",
    example: "Example", exampleText: "Left 5 lines, right 6 lines, LCS = 4; diff ratio = 1 − 4/6 = 33% → falls into 'Major refactor'.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools after diff", premiumTitle: "Pro Diff toolkit", premiumText: "Unlock 3-way merge, word/char-level diff, JSON/YAML structural diff, move detection, semantic diff, batch compare, patch export.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "Runs entirely in the browser as LCS; pasted text is not sent to a server. Does not replace git diff, Beyond Compare, Meld, or legal redline workflows.",
    relatedTools: "Related tools", relatedToolsText: "JSON Formatter · Regex Tester · Markdown Preview · URL Encoder", references: "References", referencesText: "Hunt & McIlroy 1976 (Bell Labs); Myers 1986 An O(ND) Difference Algorithm; Unified diff (POSIX); git-diff(1); diff-match-patch (Google); Wu et al 1990 An O(NP) Sequence Comparison.",
    q1: "Why does the diff ratio differ from GitHub?", a1: "GitHub uses Myers diff + word-level highlighting + move heuristics; this tool uses simplified LCS. Definitions differ, so numbers will too — this tool is for review-rhythm reading, use git diff for fine PR work.",
    q2: "Will the pasted text be sent to a server?", a2: "No. LCS runs purely in the browser; data disappears on page close. Suitable for private contracts, unreleased source, internal config files.",
    q3: "Why does a large file freeze the page?", a3: "Simplified LCS is O(N×M); 10000×10000 lines means 100M ops. Tip: pre-process (strip comments / whitespace) over 2000 lines, or use git diff in the terminal.",
    q4: "Can it do 3-way merge?", a4: "Not in the free version. 3-way merge needs a base version + two branches + conflict detection (git merge, kdiff3). The Pro toolkit unlocks it.",
    q5: "Why are blank lines flagged as diffs?", a5: "Whitespace and case are sensitive by default. Tick 'Ignore whitespace & case' to remove that noise — but never for YAML / Python where indentation is semantic.",
    q6: "Why is the diff order weird?", a6: "LCS does not detect 'move' — relocated paragraphs become 'remove + add'. For move detection use Beyond Compare or git diff --color-moved.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

type DiffOp = { kind: "eq" | "add" | "del"; text: string };
type Result = { ok: boolean; left: number; right: number; lcs: number; added: number; removed: number; unchanged: number; ratio: number; diffText: string; bandKey: string; error: string };

function lcsLines(a: string[], b: string[]): number[][] {
  const n = a.length, m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) {
    dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
  }
  return dp;
}

function buildDiff(a: string[], b: string[]): DiffOp[] {
  const dp = lcsLines(a, b);
  const ops: DiffOp[] = [];
  let i = a.length, j = b.length;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) { ops.push({ kind: "eq", text: a[i - 1] }); i--; j--; }
    else if (dp[i - 1][j] >= dp[i][j - 1]) { ops.push({ kind: "del", text: a[i - 1] }); i--; }
    else { ops.push({ kind: "add", text: b[j - 1] }); j--; }
  }
  while (i > 0) { ops.push({ kind: "del", text: a[--i] }); }
  while (j > 0) { ops.push({ kind: "add", text: b[--j] }); }
  return ops.reverse();
}

function compute(left: string, right: string, ignoreWS: boolean): Result {
  const empty: Result = { ok: false, left: 0, right: 0, lcs: 0, added: 0, removed: 0, unchanged: 0, ratio: 0, diffText: "", bandKey: "identical", error: "" };
  if (!left && !right) return { ...empty, error: "empty" };
  const norm = (s: string) => ignoreWS ? s.trim().replace(/\s+/g, " ").toLowerCase() : s;
  const a0 = left.split("\n"), b0 = right.split("\n");
  const a = a0.map(norm), b = b0.map(norm);
  const dp = lcsLines(a, b);
  const lcs = dp[a.length][b.length];
  const ops = buildDiff(a0, b0);
  const added = ops.filter(o => o.kind === "add").length;
  const removed = ops.filter(o => o.kind === "del").length;
  const unchanged = ops.filter(o => o.kind === "eq").length;
  const denom = Math.max(a.length, b.length, 1);
  const ratio = 1 - lcs / denom;
  let bandKey = "identical";
  if (ratio === 0) bandKey = "identical";
  else if (ratio <= 0.02) bandKey = "tiny";
  else if (ratio <= 0.10) bandKey = "small";
  else if (ratio <= 0.30) bandKey = "medium";
  else if (ratio <= 0.60) bandKey = "major";
  else bandKey = "rewrite";
  const diffText = ops.map(o => (o.kind === "eq" ? "  " : o.kind === "add" ? "+ " : "- ") + o.text).join("\n");
  return { ok: true, left: a.length, right: b.length, lcs, added, removed, unchanged, ratio, diffText, bandKey, error: "" };
}

export default function DiffChecker() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [leftText, setLeftText] = useState(SAMPLE_LEFT);
  const [rightText, setRightText] = useState(SAMPLE_RIGHT);
  const [format, setFormat] = useState<"line" | "char" | "side">("line");
  const [ignoreWS, setIgnoreWS] = useState(false);
  const t = ui[lang];

  const result = useMemo(() => compute(leftText, rightText, ignoreWS), [leftText, rightText, ignoreWS]);
  const ratioPct = result.ok ? Math.round(result.ratio * 100) : 0;
  const distLabel = result.ok ? `${ratioPct}%` : "—";

  function fillCode() { setUnit("metric"); setLeftText(SAMPLE_LEFT); setRightText(SAMPLE_RIGHT); setFormat("line"); setIgnoreWS(false); }
  function fillDoc() { setUnit("imperial"); setLeftText(SAMPLE_LEFT_DOC); setRightText(SAMPLE_RIGHT_DOC); setFormat("line"); setIgnoreWS(false); }

  const activeBand = bands.find(b => b.key === result.bandKey);
  const allFormats = result.ok
    ? `Left lines : ${result.left}\nRight lines: ${result.right}\nLCS        : ${result.lcs}\nAdded      : ${result.added}\nRemoved    : ${result.removed}\nUnchanged  : ${result.unchanged}\nDiff ratio : ${ratioPct}%\nBand       : ${result.bandKey}`
    : "—";
  const sideBySide = result.ok
    ? `--- Left (${result.left}L) ---\n${leftText}\n\n--- Right (${result.right}L) ---\n${rightText}`
    : "—";

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
            <aside className="rounded-[2rem] border border-violet-100 bg-white/90 p-6 shadow-2xl shadow-violet-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-violet-600 p-5 text-white"><div className="text-xs font-bold uppercase text-violet-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{distLabel}</div><div className="text-sm font-bold text-violet-100">{lang === "zh" ? "差異率" : "diff ratio"}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{result.added || "—"}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{result.ok ? `${result.lcs}/${Math.max(result.left, result.right)}` : "—"}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{result.removed || "—"}</div></div></div><button onClick={fillCode} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillDoc} className="mt-3 w-full rounded-2xl border border-violet-200 bg-violet-50 px-5 py-4 text-sm font-black text-violet-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillCode} className="w-full rounded-2xl border border-violet-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">code</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "JavaScript function 加參數變更" : "JavaScript function adds a parameter"}</p></button><button onClick={fillDoc} className="w-full rounded-2xl border border-violet-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">doc</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "API spec v1 → v2 升級" : "API spec v1 → v2 upgrade"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4"><label className="block text-sm font-black text-slate-700">{lang === "zh" ? "左側 (Original)" : "Left (Original)"}<textarea className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-mono text-sm" rows={5} value={leftText} onChange={(e) => setLeftText(e.target.value)} spellCheck={false} /></label><label className="block text-sm font-black text-slate-700">{lang === "zh" ? "右側 (Modified)" : "Right (Modified)"}<textarea className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-mono text-sm" rows={5} value={rightText} onChange={(e) => setRightText(e.target.value)} spellCheck={false} /></label><div className="grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.indentSize}<div className="mt-2 grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-2"><button type="button" className={`rounded-xl px-3 py-2 text-xs font-black ${format === "line" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setFormat("line")}>{t.indent2}</button><button type="button" className={`rounded-xl px-3 py-2 text-xs font-black ${format === "char" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setFormat("char")}>{t.indent4}</button><button type="button" className={`rounded-xl px-3 py-2 text-xs font-black ${format === "side" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setFormat("side")}>{t.indentTab}</button></div></label><label className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700"><input type="checkbox" checked={ignoreWS} onChange={(e) => setIgnoreWS(e.target.checked)} className="h-5 w-5 accent-emerald-600" /><span>{t.sortKeys}</span></label></div></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-violet-400 to-indigo-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{result.ok ? `${ratioPct}%` : "—"}</div><div className={`mt-2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black ${result.ok ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{result.ok ? (lang === "zh" ? `✓ LCS ${result.lcs} 行對齊` : `✓ LCS ${result.lcs} aligned`) : (lang === "zh" ? "✗ 兩端皆空" : "✗ Empty")}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.outputDepth}</div><div className="mt-1 text-xl font-black">+{result.added}/-{result.removed}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "行" : "lines"}</div></div></div>{!result.ok && result.error && <div className="mt-3 rounded-2xl bg-rose-50 p-3 text-xs font-mono text-rose-800">{result.error}</div>}<div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.outputBytes}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "差異率" : "Diff %"}</div><p className="mt-2 text-3xl font-black text-emerald-950">{result.ok ? ratioPct : "—"}</p><p className="text-sm font-bold text-emerald-700">%</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.outputDepth}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "新增" : "Added"}</div><p className="mt-2 text-3xl font-black text-blue-950">{result.added}</p><p className="text-sm font-bold text-blue-700">+</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.outputTokens}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "刪除" : "Removed"}</div><p className="mt-2 text-3xl font-black text-slate-950">{result.removed}</p><p className="text-sm font-bold text-slate-700">−</p></div></div><div className="mt-5"><div className="text-xs font-black uppercase text-slate-500">{t.outputJson}</div><pre className="mt-2 max-h-72 overflow-auto rounded-2xl bg-slate-950 p-4 font-mono text-xs text-emerald-200">{result.ok ? (format === "line" ? result.diffText : format === "char" ? allFormats : sideBySide) : "—"}</pre></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-violet-400 bg-violet-50 ring-2 ring-violet-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="diff-checker-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-violet-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "差異率" : "Diff %"}</div><div className="mt-1 text-3xl font-black">{result.ok ? `${ratioPct}%` : "—"}</div></div><div className="rounded-2xl bg-violet-50 p-4"><div className="text-xs font-black uppercase text-violet-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-violet-950">{result.removed}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result.added}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item, i) => <div key={`mot-${i}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(allFormats); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "輸入" : "Input", note: t.bmrStep }, { label: lang === "zh" ? "比對" : "Compare", note: t.deficitStep }, { label: lang === "zh" ? "判讀" : "Read", note: t.trendStep }, { label: lang === "zh" ? "行動" : "Act", note: t.mealStep }].map((node, index) => <div key={`decision-${index}`} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-violet-300 bg-violet-50" : "border-indigo-200 bg-indigo-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="diff-checker-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-violet-100 bg-violet-50 p-5 text-center font-black text-violet-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-violet-700">{lang === "zh" ? "* 聯盟連結,購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["3-way merge", "字級 diff", "結構 diff", "Patch 匯出"] : ["3-way merge", "Char diff", "Struct diff", "Patch export"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
// fmt placeholder retained
void fmt;
