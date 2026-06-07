// @profile B
// Profile B · 開發者-工具 · ChmodCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
const l = (v: LocalText, lang: Lang) => v[lang];

type PermKey = "ownerRead" | "ownerWrite" | "ownerExecute" | "groupRead" | "groupWrite" | "groupExecute" | "otherRead" | "otherWrite" | "otherExecute";

const PERM_LABELS: Record<PermKey, LocalText> = {
  ownerRead: { zh: "擁有者 讀取", en: "Owner Read" },
  ownerWrite: { zh: "擁有者 寫入", en: "Owner Write" },
  ownerExecute: { zh: "擁有者 執行", en: "Owner Execute" },
  groupRead: { zh: "群組 讀取", en: "Group Read" },
  groupWrite: { zh: "群組 寫入", en: "Group Write" },
  groupExecute: { zh: "群組 執行", en: "Group Execute" },
  otherRead: { zh: "其他人 讀取", en: "Others Read" },
  otherWrite: { zh: "其他人 寫入", en: "Others Write" },
  otherExecute: { zh: "其他人 執行", en: "Others Execute" },
};
const PERM_WEIGHTS: Record<PermKey, number> = {
  ownerRead: 400, ownerWrite: 200, ownerExecute: 100,
  groupRead: 40, groupWrite: 20, groupExecute: 10,
  otherRead: 4, otherWrite: 2, otherExecute: 1,
};
const OWNER_KEYS: PermKey[] = ["ownerRead", "ownerWrite", "ownerExecute"];
const GROUP_KEYS: PermKey[] = ["groupRead", "groupWrite", "groupExecute"];
const OTHER_KEYS: PermKey[] = ["otherRead", "otherWrite", "otherExecute"];

const bands = [
  { key: "owner", range: "400/200/100", label: { zh: "擁有者位元", en: "Owner bits" }, desc: { zh: "讀=4、寫=2、執行=1,加總為八進位第一碼,控制檔案擁有者的權限。", en: "Read=4, Write=2, Execute=1 — summed into the first octal digit controlling the file owner." } },
  { key: "group", range: "40/20/10", label: { zh: "群組位元", en: "Group bits" }, desc: { zh: "群組成員的讀寫執行權限,構成八進位第二碼。", en: "Read/write/execute for group members — the second octal digit." } },
  { key: "other", range: "4/2/1", label: { zh: "其他人位元", en: "Other bits" }, desc: { zh: "非擁有者、非群組者的權限,構成八進位第三碼;設太寬會有安全風險。", en: "Permissions for everyone else — the third octal digit; too wide is a security risk." } },
  { key: "octal", range: "0-7", label: { zh: "八進位表示", en: "Octal notation" }, desc: { zh: "三碼八進位（如 755）是 chmod 最常用的格式,直接對應三組權限。", en: "Three octal digits (e.g. 755) — the most common chmod format, mapping to the three permission groups." } },
  { key: "symbolic", range: "rwx", label: { zh: "符號表示", en: "Symbolic" }, desc: { zh: "rwxr-xr-x 形式,ls -l 顯示的就是這種符號權限串。", en: "The rwxr-xr-x form — exactly what ls -l shows for file permissions." } },
  { key: "special", range: "4/2/1xxx", label: { zh: "特殊位元", en: "Special bits" }, desc: { zh: "SetUID(4)、SetGID(2)、Sticky(1) 加在最前面,改變執行身份或刪除規則。", en: "SetUID(4), SetGID(2), Sticky(1) prepended — they change run identity or delete rules." } },
] as const;

const SPECIAL = [
  { key: "setuid", label: { zh: "SetUID (4xxx)", en: "SetUID (4xxx)" }, desc: { zh: "執行時以擁有者身份運行", en: "Run as file owner" } },
  { key: "setgid", label: { zh: "SetGID (2xxx)", en: "SetGID (2xxx)" }, desc: { zh: "執行時以群組身份運行", en: "Run as file group" } },
  { key: "sticky", label: { zh: "Sticky Bit (1xxx)", en: "Sticky Bit (1xxx)" }, desc: { zh: "僅擁有者可刪除檔案（/tmp）", en: "Only owner can delete (/tmp)" } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "Cron 表達式", en: "Cron Expression" }, href: "/tools/developer/cron-expression" },
  { label: { zh: "IP 計算器", en: "IP Calculator" }, href: "/tools/developer/ip-calculator" },
  { label: { zh: "雜湊產生器", en: "Hash Generator" }, href: "/tools/developer/hash-generator" },
  { label: { zh: "時間戳轉換", en: "Timestamp Converter" }, href: "/tools/developer/timestamp-converter" },
];

const ui = {
  zh: {
    badge: "開發者 · 權限計算 · 黃金工具", switchToEnglish: "中文模式", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Chmod Calculator · 權限計算器", subtitle: "勾選讀寫執行權限,即時得到八進位、符號表示與 chmod 指令",
    intro: "本工具把 Unix/Linux 檔案權限的讀（r）、寫（w）、執行（x）對應到擁有者、群組與其他人三組,勾選後即時換算出八進位數值、rwx 符號表示與完整 chmod 指令,並支援 SetUID、SetGID、Sticky 特殊位元。",
    trustNoteLabel: "注意事項：", trustNote: "權限設定攸關系統安全;對其他人開放寫入或執行（如 777）會有重大風險,正式伺服器請依最小權限原則設定。",
    quickActionCard: "快速操作卡", tryExample: "勾選權限即時換算", examplePreview: "八進位", examplePerson: "符號", flowDemo: "指令", fillExample: "套用 755（常見執行檔）", previewActivePath: "套用 644（常見一般檔）",
    examplesCalculator: "勾選 → 計算器", enterValues: "勾選讀寫執行權限", examplesHelper: "先用常見的 755 或 644 範例理解三組權限的差異,再依檔案用途勾選需要的權限並複製 chmod 指令。",
    metric: "八進位", imperial: "符號", exampleCards: "範例卡", baselineExample: "755 · 執行檔", activeExample: "644 · 一般檔", calculator: "計算器",
    modeLabel: "權限勾選", countLabel: "特殊位元", formatLabel: "輸出", regenerate: "重設", copyAll: "複製 chmod 指令",
    resultCard: "權限計算結果", estimatedTdee: "八進位", monthlyEquiv: "符號", weeklyEquiv: "符號表示", dailyEquiv: "指令", effectiveHours: "符號", fatLossTarget: "八進位",
    outputLabel: "chmod 指令",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格權限位元判讀矩陣", tdeeMatrixNote: "L7 固定六格,列出三組權限與特殊位元的作用;這是權限參考,不是安全稽核建議。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把權限設定整合進部署流程", conversionNote: "L9 會連動目前勾選結果,顯示八進位與符號表示,協助你判斷該檔案是否設得太寬或太緊。",
    progressInsight: "進度洞察卡", possibleTarget: "目前權限計畫", dailyGap: "符號表示", weeklyTrend: "八進位", motivation: "動力卡", keepMomentum: "從單檔權限走向部署腳本自動化",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把這組權限帶進你的部署腳本", journeyHint: "每次調整權限勾選或特殊位元時重新計算,並把 chmod 指令複製到佈署腳本或文件。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用 Cron 表達式排程定期權限檢查", nextActionItem2: "用 IP 計算器規劃伺服器網段存取控制", nextActionItem3: "用雜湊產生器驗證部署檔案完整性",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "勾選 → 計權重 → 組八進位 → 產生指令", bmrStep: "勾選", deficitStep: "計權重", trendStep: "八進位", mealStep: "指令",
    knowledge: "知識", knowledgeTitle: "Unix 檔案權限與 chmod 的意義", definition: "定義", definitionText: "Unix/Linux 用讀（r=4）、寫（w=2）、執行（x=1）三種權限,分別套用在擁有者、群組與其他人三組身份上;chmod 指令以八進位或符號改變這些權限。",
    formula: "公式", formulaText: "每組權限 = 讀(4)+寫(2)+執行(1) 的加總,三組合成三碼八進位;特殊位元 SetUID(4)+SetGID(2)+Sticky(1) 可加在最前面成為四碼。",
    limitations: "限制", limitationsText: "權限只是存取控制的一部分,還需配合擁有者、群組設定（chown）與 ACL;對其他人開放過多權限（如 777）是常見的安全漏洞來源。",
    interpretation: "解讀", interpretationText: "755 代表擁有者可讀寫執行、群組與其他人可讀執行,常用於程式與目錄;644 代表擁有者可讀寫、其他人唯讀,常用於一般檔案。",
    context: "脈絡", contextText: "權限設定常見於部署腳本、容器映像與 CI/CD;依最小權限原則,只開放必要的權限,可大幅降低被入侵後的影響範圍。",
    example: "範例", exampleText: "勾選擁有者讀寫執行、群組與其他人讀執行,工具會算出 755,符號為 rwxr-xr-x,指令為 chmod 755 filename,可直接貼進部署腳本。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "權限管理工作流程的下一步工具", premiumTitle: "專業版系統權限工具包", premiumText: "解鎖 umask 計算、ACL 進階規則、整批檔案權限稽核與部署腳本範本匯出。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅做權限換算,不會修改任何實際檔案;最終設定請在受控環境中驗證後再套用。", relatedTools: "相關工具", relatedToolsText: "Cron 表達式 · IP 計算器 · 雜湊產生器 · 時間戳轉換", references: "參考資料", referencesText: "Unix 檔案權限模型;chmod 與 chown 手冊;最小權限原則;SetUID/SetGID/Sticky 位元說明。",
    q1: "八進位的 755 是什麼意思？", a1: "三碼分別代表擁有者、群組、其他人;7=讀4+寫2+執行1、5=讀4+執行1。所以 755 = 擁有者全權、群組與其他人可讀可執行。",
    q2: "755 和 644 該怎麼選？", a2: "需要被執行的程式或可進入的目錄常用 755;不需要執行的一般檔案（圖片、文件）常用 644,讓其他人唯讀即可。",
    q3: "為什麼 777 很危險？", a3: "777 代表任何人都能讀、寫、執行該檔案,等於把控制權交給所有使用者;在多人或公開伺服器上極易被惡意修改或植入。",
    q4: "符號表示 rwxr-xr-x 怎麼讀？", a4: "每三個字元一組,依序是擁有者、群組、其他人;r 表讀、w 表寫、x 表執行,- 表沒有該權限。rwxr-xr-x 即八進位 755。",
    q5: "SetUID、SetGID、Sticky 是做什麼的？", a5: "SetUID 讓執行檔以擁有者身份運行、SetGID 以群組身份運行、Sticky 讓目錄中只有擁有者能刪除自己的檔案（如 /tmp）。",
    q6: "這個工具會改我的檔案嗎？", a6: "不會。它只做權限數值與符號的換算並產生 chmod 指令,不會接觸任何實際檔案,複製指令後請自行在系統上執行。",
  },
  en: {
    badge: "Developer · Permissions · Gold tool", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Chmod Calculator", subtitle: "Toggle read/write/execute to get octal, symbolic notation, and the chmod command instantly",
    intro: "This tool maps Unix/Linux file permissions — read (r), write (w), execute (x) — across owner, group, and others, instantly computing the octal value, the rwx symbolic form, and a full chmod command, with support for SetUID, SetGID, and Sticky special bits.",
    trustNoteLabel: "Note:", trustNote: "Permissions are critical to system security; opening write or execute to others (e.g. 777) is a major risk — on production servers, follow the principle of least privilege.",
    quickActionCard: "Quick action", tryExample: "Toggle permissions to compute instantly", examplePreview: "Octal", examplePerson: "Symbolic", flowDemo: "Command", fillExample: "Apply 755 (common executable)", previewActivePath: "Apply 644 (common file)",
    examplesCalculator: "Toggle → Calculator", enterValues: "Toggle read/write/execute", examplesHelper: "Start with a common 755 or 644 example to understand the three permission groups, then toggle what your file needs and copy the chmod command.",
    metric: "Octal", imperial: "Symbolic", exampleCards: "Example cards", baselineExample: "755 · executable", activeExample: "644 · file", calculator: "Calculator",
    modeLabel: "Permission toggles", countLabel: "Special bits", formatLabel: "Output", regenerate: "Reset", copyAll: "Copy chmod command",
    resultCard: "Permission result", estimatedTdee: "Octal", monthlyEquiv: "Symbolic", weeklyEquiv: "Symbolic", dailyEquiv: "Command", effectiveHours: "Symbolic", fatLossTarget: "Octal",
    outputLabel: "chmod command",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band permission-bit matrix", tdeeMatrixNote: "L7 fixed six-band matrix — lists the three permission groups and special bits and their effects. This is a permission reference, not a security-audit recommendation.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Fit permission setting into your deployment flow", conversionNote: "L9 reflects your current toggles — octal and symbolic form — to help you decide whether a file is set too wide or too tight.",
    progressInsight: "Progress insight", possibleTarget: "Your current permission plan", dailyGap: "Symbolic", weeklyTrend: "Octal", motivation: "Motivation", keepMomentum: "Move from single-file permissions to automated deploy scripts",
    saveShareJourney: "Save / share", journeyTitle: "Take this permission set into your deploy script", journeyHint: "Recompute whenever you change toggles or special bits, and copy the chmod command into a deploy script or doc.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use the Cron Expression tool to schedule periodic permission checks", nextActionItem2: "Use the IP Calculator to plan server subnet access control", nextActionItem3: "Use the Hash Generator to verify deployed-file integrity",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with a friend", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Toggle → Weight → Octal → Command", bmrStep: "Toggle", deficitStep: "Weight", trendStep: "Octal", mealStep: "Command",
    knowledge: "Knowledge", knowledgeTitle: "What Unix file permissions and chmod mean", definition: "Definition", definitionText: "Unix/Linux uses read (r=4), write (w=2), and execute (x=1) permissions applied across owner, group, and others; the chmod command changes them via octal or symbolic notation.",
    formula: "Formula", formulaText: "Each group = read(4)+write(2)+execute(1) summed; the three groups form a three-digit octal; special bits SetUID(4)+SetGID(2)+Sticky(1) can prepend a fourth digit.",
    limitations: "Limitations", limitationsText: "Permissions are only part of access control — they work with owner/group settings (chown) and ACLs; opening too much to others (e.g. 777) is a common source of security holes.",
    interpretation: "Interpretation", interpretationText: "755 means owner read/write/execute and group/others read/execute, common for programs and directories; 644 means owner read/write and others read-only, common for regular files.",
    context: "Context", contextText: "Permission setting appears in deploy scripts, container images, and CI/CD; by least privilege, granting only necessary permissions greatly reduces blast radius after a breach.",
    example: "Example", exampleText: "Toggle owner read/write/execute and group/others read/execute, and the tool yields 755, symbolic rwxr-xr-x, command chmod 755 filename — paste straight into a deploy script.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for a permissions workflow", premiumTitle: "Pro System Permissions Toolkit", premiumText: "Unlock umask calculation, advanced ACL rules, batch file-permission auditing, and deploy-script template export.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool only converts permission values and symbols — it never modifies any real file; verify the final setting in a controlled environment before applying.", relatedTools: "Related tools", relatedToolsText: "Cron Expression · IP Calculator · Hash Generator · Timestamp Converter", references: "References", referencesText: "Unix file-permission model; chmod and chown manuals; principle of least privilege; SetUID/SetGID/Sticky bit explanations.",
    q1: "What does octal 755 mean?", a1: "The three digits are owner, group, others; 7=read4+write2+execute1, 5=read4+execute1. So 755 = owner full control, group and others read and execute.",
    q2: "How do I choose between 755 and 644?", a2: "Use 755 for programs to be executed or directories to enter; use 644 for regular files (images, documents) that don't need execute, keeping others read-only.",
    q3: "Why is 777 dangerous?", a3: "777 means anyone can read, write, and execute the file — handing control to all users; on multi-user or public servers it is easily modified or injected maliciously.",
    q4: "How do I read symbolic rwxr-xr-x?", a4: "In groups of three for owner, group, others; r is read, w is write, x is execute, and - means no permission. rwxr-xr-x equals octal 755.",
    q5: "What do SetUID, SetGID, and Sticky do?", a5: "SetUID runs an executable as the file owner, SetGID runs it as the file group, and Sticky lets only the owner delete their files in a directory (e.g. /tmp).",
    q6: "Does this tool change my files?", a6: "No. It only converts permission values and symbols and produces a chmod command — it never touches any real file; copy the command and run it yourself.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function ChmodCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [perms, setPerms] = useState<Record<PermKey, boolean>>({
    ownerRead: true, ownerWrite: true, ownerExecute: true,
    groupRead: true, groupWrite: false, groupExecute: true,
    otherRead: true, otherWrite: false, otherExecute: true,
  });
  const [special, setSpecial] = useState<Record<string, boolean>>({ setuid: false, setgid: false, sticky: false });
  const t = ui[lang];

  const togglePerm = (key: PermKey) => setPerms(p => ({ ...p, [key]: !p[key] }));
  const toggleSpecial = (key: string) => setSpecial(s => ({ ...s, [key]: !s[key] }));

  const octal = useMemo(() => {
    const ownerVal = OWNER_KEYS.filter(k => perms[k]).reduce((a, k) => a + PERM_WEIGHTS[k], 0) / 100;
    const groupVal = GROUP_KEYS.filter(k => perms[k]).reduce((a, k) => a + PERM_WEIGHTS[k], 0) / 10;
    const otherVal = OTHER_KEYS.filter(k => perms[k]).reduce((a, k) => a + PERM_WEIGHTS[k], 0);
    const base = `${ownerVal}${groupVal}${otherVal}`;
    const specialVal = (special.setuid ? 4 : 0) + (special.setgid ? 2 : 0) + (special.sticky ? 1 : 0);
    return specialVal > 0 ? `${specialVal}${base}` : base;
  }, [perms, special]);

  const symbolic = useMemo(() => {
    const buildStr = (keys: PermKey[], sKey: string | null) => {
      const r = perms[keys[0]] ? "r" : "-";
      const w = perms[keys[1]] ? "w" : "-";
      const xBase = perms[keys[2]];
      const hasSpecial = sKey != null && special[sKey];
      let x: string;
      if (xBase) {
        x = hasSpecial ? (sKey === "sticky" ? "t" : "s") : "x";
      } else {
        x = hasSpecial ? (sKey === "sticky" ? "T" : "S") : "-";
      }
      return `${r}${w}${x}`;
    };
    return `${buildStr(OWNER_KEYS, "setuid")}${buildStr(GROUP_KEYS, "setgid")}${buildStr(OTHER_KEYS, "sticky")}`;
  }, [perms, special]);

  const result = useMemo(() => ({ octal, symbolic, command: `chmod ${octal} filename` }), [octal, symbolic]);

  function applyPreset(values: boolean[]) {
    const keys: PermKey[] = [...OWNER_KEYS, ...GROUP_KEYS, ...OTHER_KEYS];
    const next = {} as Record<PermKey, boolean>;
    keys.forEach((k, i) => { next[k] = values[i]; });
    setPerms(next);
    setSpecial({ setuid: false, setgid: false, sticky: false });
  }
  function fillSolid() { setUnit("metric"); applyPreset([true, true, true, true, false, true, true, false, true]); }
  function fillHighSalary() { setUnit("imperial"); applyPreset([true, true, false, true, false, false, true, false, false]); }

  const activeBand = bands.find(b => b.key === (unit === "metric" ? "octal" : "symbolic")) || bands[0];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#fef3c7,_#f8fafc_45%,_#e0f2fe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-amber-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-amber-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{result.octal}</div><div className="text-sm font-bold text-amber-100">{l(activeBand.label, lang)}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-mono font-black">{result.symbolic}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.estimatedTdee}</div><div className="font-black">{result.octal}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-mono text-xs font-black">chmod</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">755</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "rwxr-xr-x · 執行檔" : "rwxr-xr-x · executable"}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">644</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "rw-r--r-- · 一般檔" : "rw-r--r-- · file"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-3">{[OWNER_KEYS, GROUP_KEYS, OTHER_KEYS].map((group, gi) => <div key={gi} className="rounded-2xl border border-slate-200 bg-slate-50 p-3"><div className="text-xs font-black uppercase text-slate-500">{gi === 0 ? (lang === "zh" ? "擁有者" : "Owner") : gi === 1 ? (lang === "zh" ? "群組" : "Group") : (lang === "zh" ? "其他人" : "Others")}</div><div className="mt-2 space-y-2">{group.map((k) => <label key={k} className="flex items-center gap-2 text-sm font-bold text-slate-700"><input type="checkbox" checked={perms[k]} onChange={() => togglePerm(k)} className="h-4 w-4" />{l(PERM_LABELS[k], lang).split(" ")[1] || l(PERM_LABELS[k], lang)}</label>)}</div></div>)}</div><div className="mt-4"><div className="text-sm font-black text-emerald-700">{t.countLabel}</div><div className="mt-2 grid gap-2 sm:grid-cols-3">{SPECIAL.map((s) => <label key={s.key} className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800"><input type="checkbox" checked={special[s.key]} onChange={() => toggleSpecial(s.key)} className="h-4 w-4" />{l(s.label, lang)}</label>)}</div></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{result.octal}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 font-mono text-sm font-black text-slate-700">{result.symbolic}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.weeklyEquiv}</div><div className="mt-1 font-mono text-lg font-black">{result.symbolic}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "符號" : "symbolic"}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{lang === "zh" ? "擁有者" : "owner"}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "八進位" : "octal"}</div><p className="mt-2 text-3xl font-black text-emerald-950">{result.octal.slice(-3, -2)}</p><p className="font-mono text-sm font-bold text-emerald-700">{result.symbolic.slice(0, 3)}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{lang === "zh" ? "群組" : "group"}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "八進位" : "octal"}</div><p className="mt-2 text-3xl font-black text-blue-950">{result.octal.slice(-2, -1)}</p><p className="font-mono text-sm font-bold text-blue-700">{result.symbolic.slice(3, 6)}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{lang === "zh" ? "其他人" : "others"}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "八進位" : "octal"}</div><p className="mt-2 text-3xl font-black text-slate-950">{result.octal.slice(-1)}</p><p className="font-mono text-sm font-bold text-slate-700">{result.symbolic.slice(6, 9)}</p></div></div><div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{t.outputLabel}</div><div className="mt-2 overflow-auto whitespace-pre-wrap break-words font-mono text-lg leading-6 text-slate-800">{result.command}</div><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(result.command); alert(t.shareCopiedToast); } }} className="mt-3 w-full rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.copyAll}</button></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand.key === item.key ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="chmod-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "八進位" : "Octal"}</div><div className="mt-1 text-2xl font-black">{result.octal}</div></div><div className="rounded-2xl bg-amber-50 p-4"><div className="text-xs font-black uppercase text-amber-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-amber-950">{result.octal}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 font-mono text-xl font-black text-emerald-950">{result.symbolic}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "勾選" : "Toggle", note: t.bmrStep }, { label: lang === "zh" ? "計權重" : "Weight", note: t.deficitStep }, { label: lang === "zh" ? "八進位" : "Octal", note: t.trendStep }, { label: lang === "zh" ? "指令" : "Command", note: t.mealStep }].map((node, index) => <div key={node.note} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位：廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="chmod-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["umask", "ACL", "稽核", "範本"] : ["umask", "ACL", "Audit", "Template"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
