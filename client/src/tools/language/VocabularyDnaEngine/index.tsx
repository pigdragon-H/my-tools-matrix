// @profile B
// Profile B · Language-Hub 混合（Datamuse 多端點 + 自建字根 JSON）· VocabularyDnaEngine（GOLD-STANDARD MacroCalculator compatible）
// 字彙 DNA 引擎：輸入英文單字，結合 Datamuse rel_syn（同義）、rel_trg（聯想）、ml=（近義）三端點，
//   組成這個字的「字彙 DNA 圖譜」；同時比對內建 wordRoots.json（80 組拉丁／希臘字根），解析語義基因。
//   多端點即時查詢 + 內建字根表，全照 gold 範本 17 層結構。

import { useMemo, useState, useCallback, useEffect } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";
import wordRootsData from "./wordRoots.json";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type Cefr = "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | null;
const l = (v: LocalText, lang: Lang) => v[lang];

// ============================================================
// Language Hub Datamuse 標準模板（MANUAL §2a 完整照抄）
// ============================================================
interface DatamuseWord { word: string; score?: number; tags?: string[]; numSyllables?: number }
const CACHE_PREFIX = "fu_lng_cache_";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 小時

async function queryDatamuse(endpoint: string, maxResults = 20): Promise<DatamuseWord[] | null> {
  const cacheKey = CACHE_PREFIX + btoa(endpoint).slice(0, 50);
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) { const { data, timestamp } = JSON.parse(cached); if (Date.now() - timestamp < CACHE_TTL) return data as DatamuseWord[]; }
  } catch { /* 快取讀取失敗，繼續查 API */ }
  try {
    const res = await fetch(`https://api.datamuse.com/words?${endpoint}&md=psrf&max=${maxResults}`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: DatamuseWord[] = await res.json();
    try { localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() })); } catch { /* 快取寫入失敗，不影響結果 */ }
    return data;
  } catch { return null; } // null = 觸發降級 UI
}

// ============================================================
// 內建 CEFR + 繁體中文釋義 + IPA 詞庫（CEFR-J ver1.5 + Octanove · 懶載入）
//   形態：{ word: [cefr, zh_tw, zh_cn, ipa] }
// ============================================================
type DictEntry = string[];
let DICT: Record<string, DictEntry> | null = null;
let dictLoading: Promise<void> | null = null;
function loadDict(): Promise<void> {
  if (DICT) return Promise.resolve();
  if (dictLoading) return dictLoading;
  dictLoading = import("./cefrDict.json").then((m) => { DICT = ((m as { default?: unknown }).default ?? m) as Record<string, DictEntry>; });
  return dictLoading;
}

// ARPABET（Datamuse md=r 的 pron:）→ 美式 IPA，輸出 /rɛndər/ 格式
const ARP_IPA: Record<string, string> = {
  AA: "ɑ", AE: "æ", AH: "ʌ", AO: "ɔ", AW: "aʊ", AY: "aɪ", B: "b", CH: "tʃ", D: "d", DH: "ð",
  EH: "ɛ", ER: "ər", EY: "eɪ", F: "f", G: "ɡ", HH: "h", IH: "ɪ", IY: "i", JH: "dʒ", K: "k",
  L: "l", M: "m", N: "n", NG: "ŋ", OW: "oʊ", OY: "ɔɪ", P: "p", R: "r", S: "s", SH: "ʃ",
  T: "t", TH: "θ", UH: "ʊ", UW: "u", V: "v", W: "w", Y: "j", Z: "z", ZH: "ʒ",
};
function arpabetToIpa(pron: string): string {
  if (!pron) return "";
  const phones = pron.trim().split(/\s+/);
  let primary = -1;
  phones.forEach((p, i) => { if (p.endsWith("1")) primary = i; });
  let out = "";
  phones.forEach((p, i) => { const b = p.replace(/[0-9]/g, ""); if (i === primary) out += "ˈ"; out += ARP_IPA[b] || ""; });
  return out ? `/${out}/` : "";
}
function normIpa(raw: string): string {
  if (!raw) return "";
  const s = raw.trim();
  if (!s) return "";
  return s.startsWith("/") ? s : `/${s}/`;
}
// CEFR 啟發式（僅用於詞庫未收錄的罕見字）：以 Datamuse 詞頻 f 推估
function freqToCefr(f: number): Cefr {
  if (!Number.isFinite(f) || f <= 0) return null;
  if (f >= 50) return "A1"; if (f >= 10) return "A2"; if (f >= 3) return "B1";
  if (f >= 1) return "B2"; if (f >= 0.3) return "C1"; return "C2";
}
const posMap: Record<string, LocalText> = {
  n: { zh: "名詞", en: "noun" }, v: { zh: "動詞", en: "verb" },
  adj: { zh: "形容詞", en: "adjective" }, adv: { zh: "副詞", en: "adverb" }, u: { zh: "其他", en: "other" },
};
function parseTags(tags: string[] | undefined): { pos: string; freq: number; pron: string } {
  let pos = "u", freq = 0, pron = "";
  (tags || []).forEach((tg) => {
    if (tg === "n" || tg === "v" || tg === "adj" || tg === "adv") { if (pos === "u") pos = tg; }
    else if (tg.startsWith("f:")) freq = Number(tg.slice(2));
    else if (tg.startsWith("pron:")) pron = tg.slice(5).trim();
  });
  return { pos, freq, pron };
}
const cefrColor: Record<string, string> = {
  A1: "bg-emerald-100 text-emerald-800", A2: "bg-emerald-100 text-emerald-800",
  B1: "bg-sky-100 text-sky-800", B2: "bg-sky-100 text-sky-800",
  C1: "bg-violet-100 text-violet-800", C2: "bg-violet-100 text-violet-800",
};

// ============================================================
// 內建字根表（自行整理 · 真實拉丁／希臘字根 · 80 組）
//   形態：{ root, origin(Latin/Greek), zh(繁體中文義), example(英文示例字) }
// ============================================================
type RootEntry = { root: string; origin: string; zh: string; example: string };
const WORD_ROOTS = wordRootsData as RootEntry[];

// DNA 股別顏色（沿用 gold 範本）
const strandColor: Record<string, string> = {
  syn: "bg-emerald-100 text-emerald-800",
  trg: "bg-sky-100 text-sky-800",
  ml: "bg-violet-100 text-violet-800",
};
const HOT_WORDS = ["transport", "vision", "audio", "biology", "describe", "spectator"] as const;

type Strand = "syn" | "trg" | "ml";
type MeaningSrc = "tw" | "cn" | "en" | "none";
type ResultCard = {
  word: string; strand: Strand; cefr: Cefr; posKey: string; ipa: string; meaningZh: string; meaningSrc: MeaningSrc;
  exampleEn?: string; defEn?: string; enriched?: boolean;
};

const strandBands = [
  { key: "syn", label: { zh: "同義基因 (rel_syn)", en: "Synonym strand (rel_syn)" }, desc: { zh: "與查詢字意義相近、可互相替換的同義詞，是字彙 DNA 的核心股。", en: "Synonyms close in meaning to the query word, the core strand of the vocabulary DNA." } },
  { key: "trg", label: { zh: "聯想基因 (rel_trg)", en: "Trigger strand (rel_trg)" }, desc: { zh: "常與查詢字一起被聯想到的詞，呈現語境與情境關聯。", en: "Words often triggered by the query word, showing contextual and situational links." } },
  { key: "ml", label: { zh: "近義基因 (ml=)", en: "Meaning-like strand (ml=)" }, desc: { zh: "語義相近、概念相關的詞，補足同義與聯想之外的語義網。", en: "Concept-related words filling in the semantic web beyond synonyms and triggers." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "同義詞查找器", en: "Synonym Finder" }, href: "/tools/language/synonym-finder" },
  { label: { zh: "字詞聯想查找器", en: "Word Association Finder" }, href: "/tools/language/word-association-finder" },
  { label: { zh: "CEFR 程度估算器", en: "CEFR Level Estimator" }, href: "/tools/language/cefr-level-estimator" },
  { label: { zh: "慣用語解析器", en: "Idiom Explainer" }, href: "/tools/language/idiom-explainer" },
];

const ui = {
  zh: {
    badge: "語言 · 字彙 DNA · Language Hub", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "字彙 DNA 引擎 · Vocabulary DNA Engine", subtitle: "輸入一個英文單字，結合同義、聯想與近義三端點組成它的字彙 DNA 圖譜，並比對內建八十組拉丁／希臘字根，解析語義基因",
    intro: "Vocabulary DNA Engine 把一個英文單字當成「語義基因序列」：透過 Datamuse 的 rel_syn（同義）、rel_trg（聯想）、ml=（近義）三個端點，即時抓取與查詢字相關的詞，依股別組成這個字的字彙 DNA 圖譜；同時比對內建八十組真實拉丁／希臘字根，找出構成這個字的字根與其語義來源。三端點同時查詢，讓您一眼看出一個字的同義、聯想與近義網絡，並從字根理解它的語義基因。本工具結合 Datamuse 即時查詢與內建字根表，需要網路連線取得即時結果。",
    trustNoteLabel: "資料來源：", trustNote: "同義、聯想與近義詞由 Datamuse API 即時提供（rel_syn / rel_trg / ml= 三端點）；字根表為自行整理之常用拉丁／希臘字根（80 組），含字源、繁體中文義與英文示例字；中文義由編輯團隊人工撰寫。僅供學習參考。",
    quickActionCard: "快速分析卡", tryExample: "一鍵解析 transport 的字彙 DNA", examplePreview: "DNA 序列詞數", examplePerson: "查詢單字", fillExample: "解析 transport", previewActivePath: "解析 vision",
    examplesCalculator: "範例 → 分析", enterValues: "輸入單字", examplesHelper: "先用熱門範例了解字彙 DNA 圖譜、三股基因與字根比對如何呈現，再換成您自己想分析的單字。",
    queryBtn: "解析 DNA", clearBtn: "清除", hotWords: "熱門單字", inputPlaceholder: "輸入單字，例如 transport",
    loading: "解析中…", emptyHint: "輸入上方單字並按「解析 DNA」，這個單字的同義、聯想、近義三股基因與字根比對會列在這裡。", noResult: "查無相關詞，換一個常見英文單字試試，或檢查拼字。",
    fallbackTitle: "暫時無法連線", fallbackBody: "Datamuse 服務暫時無法連線，請稍後再試一次。字彙 DNA 引擎需要網路連線取得即時結果。",
    resultCard: "字彙 DNA 圖譜", unit: "個 DNA 序列詞", primaryValue: "查詢單字", strandLabel: "基因股別", rootLabel: "字根基因", noRoot: "查無內建字根相符，這個字可能不含本表收錄的常見拉丁／希臘字根。", expandHint: "展開看釋義與例句", collapseHint: "收合", ipaLabel: "音標", meaningLabel: "釋義", glossTagCn: "簡", glossTagEn: "EN", exampleLabel: "例句", defLabel: "英文定義", enLoading: "載入例句中…", noExample: "查無例句，建議造句練習。",
    resultIntelligence: "結果解讀", levelMatrix: "三股字彙 DNA 基因矩陣", levelMatrixNote: "L7 將 DNA 序列詞依三股基因分層：同義（rel_syn）、聯想（rel_trg）、近義（ml=），各股反映一個字不同面向的語義關聯。",
    scenarioLayer: "使用場景", scenarioTitle: "什麼時候用字彙 DNA 引擎", scenarioNote: "L8 列出四個典型場景，把字彙 DNA 用在對的地方，而不是死背單字。",
    scenarioExam: "考試準備", scenarioExamNote: "背一個字時，同時看它的同義、聯想與字根，建立語義網，記得更牢、考試更靈活。", scenarioWriting: "寫作換字", scenarioWritingNote: "寫英文文章時，用同義與近義股換掉重複的字，讓用詞更豐富多元。", scenarioDaily: "字根記憶", scenarioDailyNote: "從字根理解一個字的語義來源，把同字根的字串成家族一起記，效率倍增。", scenarioBusiness: "字彙擴充", scenarioBusinessNote: "想擴充字彙量時，從一個字的 DNA 序列延伸出整個語義網絡，由點到面。",
    progressInsight: "學習洞察卡", possibleTarget: "本次解析", dailyGap: "主要基因股", weeklyTrend: "字根命中", motivation: "動力卡", keepMomentum: "從查單一單字走向系統掌握字彙 DNA 與語義基因",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天解析的字彙 DNA 帶回家", journeyHint: "挑 2–3 個 DNA 序列詞與字根記下，把同字根、同語義網的字串成家族最有效率。",
    nextActionLabel: "下一步行動", nextActionTitle: "把字彙 DNA 接到下一個工具", nextActionItem1: "用同義詞查找器深入查同義股裡每個字的中文義與 CEFR 等級", nextActionItem2: "用字詞聯想查找器擴充聯想股，建立更大的語義網絡", nextActionItem3: "用 CEFR 程度估算器確認 DNA 序列詞的難度是否符合您的程度",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "分析路徑", decisionTitle: "輸入 → 解析 → 理解 → 應用", step1: "輸入單字", step2: "解析 DNA", step3: "看三股基因", step4: "串語義網",
    knowledge: "知識", knowledgeTitle: "字彙 DNA 與字根在英語學習中的意義", definition: "定義", definitionText: "字彙 DNA 把一個單字的語義關聯拆成三股「基因」：同義（意義相近）、聯想（常一起出現）、近義（概念相關）；字根則是構成單字的語義基本單位，多源自拉丁與希臘文，例如 transport 的 port 來自拉丁文「攜帶」。", usage: "用法", usageText: "輸入一個單字後，工具同時查詢 Datamuse 三個端點，把結果依基因股別分類組成 DNA 圖譜，並比對內建字根表，標出這個字含有的字根與其語義來源。", limitations: "限制", limitationsText: "同義、聯想與近義詞由 Datamuse 即時提供，需要網路連線；字根表為自行整理之常用拉丁／希臘字根（80 組），罕見或現代造字未必含可辨識字根。", interpretation: "解讀", interpretationText: "同義股最適合換字；聯想股反映語境；近義股補足語義網；字根則幫您理解語義來源、把同字根的字串成家族記憶，三股加字根構成完整的字彙 DNA。", context: "脈絡", contextText: "字彙 DNA 引擎應與同義詞、字詞聯想、CEFR 估算一起用：先看 DNA 圖譜與字根理解語義網與來源，再延伸查每個字的中文義、難度與用法。", example: "範例", exampleText: "輸入 transport → 同義股含 carry、move；聯想股含 vehicle、cargo；近義股含 transit、shipment；字根比對命中 port（拉丁文「攜帶」），同字根字有 import、portable。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "相關工具", affiliateTitle: "字彙 DNA 的下一步工具", premiumTitle: "PRO 字彙 DNA 包", premiumText: "解鎖無限解析、三股基因完整展開、依字根分組瀏覽、自動記錄解析歷史，並把字彙 DNA 圖譜匯出複習。",
    feat1: "無限解析次數", feat2: "完整三股展開", feat3: "字根分組瀏覽", feat4: "DNA 圖譜匯出",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供英語學習用途；同義、聯想與近義詞由 Datamuse 即時提供，字根表為自行整理，皆為學習參考，不等同官方語言檢定。", relatedTools: "相關工具", relatedToolsText: "Synonym Finder · Word Association Finder · CEFR Level Estimator · Idiom Explainer", references: "參考資料", referencesText: "Datamuse API（rel_syn / rel_trg / ml= 三端點，即時查詢）；自行整理之常用拉丁／希臘字根表（80 組，含字源、繁體中文義與英文示例字）；中文義由編輯團隊人工撰寫整理。僅供學習參考。",
    q1: "字彙 DNA 是怎麼組成的？", a1: "工具同時查詢 Datamuse 的 rel_syn（同義）、rel_trg（聯想）、ml=（近義）三個端點，把與查詢字相關的詞依股別分類，組成這個字的字彙 DNA 圖譜。這是即時查詢，需要網路連線。",
    q2: "字根比對是怎麼運作的？", a2: "工具內建一份自行整理的常用拉丁／希臘字根表（80 組）。輸入單字後，工具比對這個字是否含有表中字根，命中時標出字根、字源與繁體中文義。",
    q3: "為什麼有些字查不到結果？", a3: "同義、聯想與近義詞由 Datamuse 即時提供，極罕見或拼錯的字可能查無結果；字根比對只涵蓋本表收錄的 80 組常見字根，現代造字或罕見字根未必含可辨識字根。",
    q4: "字源和中文義從哪來？", a4: "字根的字源（拉丁／希臘）、繁體中文義與英文示例字由編輯團隊人工整理；同義、聯想與近義詞由 Datamuse 即時提供。全程不經機器翻譯。",
    q5: "字彙 DNA 和同義詞查找有什麼不同？", a5: "同義詞查找器只查同義（rel_syn）一股；字彙 DNA 引擎同時查同義、聯想、近義三股並比對字根，給您一個字完整的語義基因圖譜。只想查同義詞時可改用同義詞查找器。",
    q6: "適合擴充字彙量嗎？", a6: "適合。從一個字的 DNA 序列延伸出整個語義網絡，由點到面；再從字根把同字根的字串成家族一起記，是高效擴充字彙的方法。",
  },
  en: {
    badge: "Language · Vocabulary DNA · Language Hub", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Vocabulary DNA Engine", subtitle: "Type an English word, combine synonym, trigger, and meaning-like strands into its vocabulary DNA map, and match against eighty built-in Latin/Greek roots to decode its semantic genes",
    intro: "Vocabulary DNA Engine treats an English word as a semantic gene sequence: it pulls related words in real time from Datamuse's rel_syn (synonym), rel_trg (trigger), and ml= (meaning-like) endpoints, grouping them by strand into the word's vocabulary DNA map; at the same time it matches against eighty real built-in Latin/Greek roots to reveal the roots that build the word and their semantic origin. The three endpoints query simultaneously so you can see a word's synonym, trigger, and meaning-like networks at a glance, and understand its semantic genes from the roots. This tool combines real-time Datamuse lookup with a built-in root table and needs a network connection for live results.",
    trustNoteLabel: "Data source:", trustNote: "Synonym, trigger, and meaning-like words are provided in real time by the Datamuse API (rel_syn / rel_trg / ml= endpoints); the root table is a hand-curated set of common Latin/Greek roots (80 entries) with origin, Traditional Chinese gloss, and English example words; Chinese glosses are hand-written by the editorial team. For study reference only.",
    quickActionCard: "Quick Analysis Card", tryExample: "Decode the vocabulary DNA of transport", examplePreview: "DNA sequence words", examplePerson: "Query word", fillExample: "Decode transport", previewActivePath: "Decode vision",
    examplesCalculator: "Examples → Analyze", enterValues: "Enter word", examplesHelper: "Start with a popular example to see how the vocabulary DNA map, three gene strands, and root matching appear, then swap in the word you want.",
    queryBtn: "Decode DNA", clearBtn: "Clear", hotWords: "Popular words", inputPlaceholder: "Type a word, e.g. transport",
    loading: "Decoding…", emptyHint: "Enter a word above and press Decode DNA; the word's synonym, trigger, meaning-like strands and root matching will appear here.", noResult: "No related words found; try another common English word or check the spelling.",
    fallbackTitle: "Temporarily offline", fallbackBody: "The Datamuse service is temporarily unreachable, please try again later. Vocabulary DNA Engine needs a network connection for live results.",
    resultCard: "Vocabulary DNA Map", unit: "DNA sequence words", primaryValue: "Query word", strandLabel: "Gene strand", rootLabel: "Root gene", noRoot: "No built-in root matched; this word may not contain a common Latin/Greek root from this table.", expandHint: "Show gloss & example", collapseHint: "Collapse", ipaLabel: "IPA", meaningLabel: "Gloss", glossTagCn: "Simp", glossTagEn: "EN", exampleLabel: "Example", defLabel: "Definition", enLoading: "Loading example…", noExample: "No example found; try writing your own.",
    resultIntelligence: "Result Intelligence", levelMatrix: "Three-strand vocabulary DNA gene matrix", levelMatrixNote: "L7 groups DNA sequence words by three strands: synonym (rel_syn), trigger (rel_trg), meaning-like (ml=), each reflecting a different facet of a word's semantic links.",
    scenarioLayer: "Use scenarios", scenarioTitle: "When to use Vocabulary DNA Engine", scenarioNote: "L8 lists four typical scenarios so you use vocabulary DNA in the right place, not just memorize words.",
    scenarioExam: "Exam prep", scenarioExamNote: "When learning a word, see its synonyms, triggers, and roots together to build a semantic web, remember it better, and stay flexible in exams.", scenarioWriting: "Writing variation", scenarioWritingNote: "When writing in English, use synonym and meaning-like strands to replace repeated words and enrich your vocabulary.", scenarioDaily: "Root memory", scenarioDailyNote: "Understand a word's semantic origin from its roots and learn same-root words as a family for multiplied efficiency.", scenarioBusiness: "Vocabulary expansion", scenarioBusinessNote: "When expanding vocabulary, extend a word's DNA sequence into a whole semantic network, from point to plane.",
    progressInsight: "Learning Insight Card", possibleTarget: "This analysis", dailyGap: "Main gene strand", weeklyTrend: "Root hit", motivation: "Motivation Card", keepMomentum: "Move from single-word lookup to systematic mastery of vocabulary DNA and semantic genes",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's vocabulary DNA home", journeyHint: "Pick 2–3 DNA sequence words and roots to note down; learning same-root, same-network words as a family works best.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect vocabulary DNA to the next tool", nextActionItem1: "Use Synonym Finder to dig into the Chinese gloss and CEFR level of each word in the synonym strand", nextActionItem2: "Use Word Association Finder to expand the trigger strand and build a larger semantic network", nextActionItem3: "Use CEFR Level Estimator to confirm the DNA sequence words' difficulty fits your level",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Analysis Path", decisionTitle: "Input → Decode → Understand → Apply", step1: "Type word", step2: "Decode DNA", step3: "See strands", step4: "Build web",
    knowledge: "Knowledge", knowledgeTitle: "What vocabulary DNA and roots mean in English learning", definition: "Definition", definitionText: "Vocabulary DNA splits a word's semantic links into three gene strands: synonym (close in meaning), trigger (often co-occurring), and meaning-like (concept-related); a root is the basic semantic unit that builds a word, mostly from Latin and Greek, e.g. the port in transport comes from the Latin for carry.", usage: "Usage", usageText: "After you enter a word, the tool queries three Datamuse endpoints simultaneously, classifies results by gene strand into a DNA map, and matches the built-in root table to mark the roots the word contains and their semantic origin.", limitations: "Limitations", limitationsText: "Synonym, trigger, and meaning-like words are provided by Datamuse in real time and need a network connection; the root table is a hand-curated set of common Latin/Greek roots (80 entries); rare or modern coinages may not contain a recognizable root.", interpretation: "Interpretation", interpretationText: "The synonym strand is best for word replacement; the trigger strand reflects context; the meaning-like strand fills the semantic web; the roots help you understand origin and learn same-root words as a family. The three strands plus roots form the complete vocabulary DNA.", context: "Context", contextText: "Vocabulary DNA Engine should be used with Synonym Finder, Word Association Finder, and CEFR estimation: read the DNA map and roots first to grasp the semantic web and origin, then extend to each word's gloss, difficulty, and usage.", example: "Example", exampleText: "Input transport → synonym strand has carry, move; trigger strand has vehicle, cargo; meaning-like strand has transit, shipment; root matching hits port (Latin for carry), same-root words include import, portable.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Related Tools", affiliateTitle: "Next tools for vocabulary DNA", premiumTitle: "PRO Vocabulary DNA Pack", premiumText: "Unlock unlimited analysis, full three-strand expansion, browse grouped by root, auto-log analysis history, and export vocabulary DNA maps for review.",
    feat1: "Unlimited analysis", feat2: "Full three-strand expansion", feat3: "Browse by root", feat4: "Export DNA map",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for English learning only; synonym, trigger, and meaning-like words are provided by Datamuse in real time, the root table is hand-curated, and both are study references, not an official language assessment.", relatedTools: "Related Tools", relatedToolsText: "Synonym Finder · Word Association Finder · CEFR Level Estimator · Idiom Explainer", references: "References", referencesText: "Datamuse API (rel_syn / rel_trg / ml= endpoints, real-time lookup); hand-curated common Latin/Greek root table (80 entries with origin, Traditional Chinese gloss, and English example words); Chinese glosses hand-written by the editorial team. For study reference only.",
    q1: "How is the vocabulary DNA composed?", a1: "The tool queries Datamuse's rel_syn (synonym), rel_trg (trigger), and ml= (meaning-like) endpoints simultaneously, classifying related words by strand into the word's vocabulary DNA map. It is a real-time lookup that needs a network connection.",
    q2: "How does root matching work?", a2: "The tool has a built-in hand-curated common Latin/Greek root table (80 entries). After you enter a word, it checks whether the word contains a root in the table and, on a hit, marks the root, origin, and Traditional Chinese gloss.",
    q3: "Why do some words return no result?", a3: "Synonym, trigger, and meaning-like words are provided by Datamuse in real time, so very rare or misspelled words may return nothing; root matching covers only the 80 common roots in this table, and modern coinages or rare roots may not contain a recognizable root.",
    q4: "Where do the origin and gloss come from?", a4: "The root origin (Latin/Greek), Traditional Chinese gloss, and English example words are hand-curated by the editorial team; synonym, trigger, and meaning-like words are provided by Datamuse in real time. No machine translation is used.",
    q5: "What is the difference between vocabulary DNA and synonym lookup?", a5: "Synonym Finder only queries the synonym (rel_syn) strand; Vocabulary DNA Engine queries synonym, trigger, and meaning-like strands and matches roots, giving you a word's complete semantic gene map. For synonyms only, use Synonym Finder.",
    q6: "Is it good for expanding vocabulary?", a6: "Yes. Extend a word's DNA sequence into a whole semantic network, from point to plane; then learn same-root words as a family from the roots — an efficient way to expand vocabulary.",
  },
} as const;

const faqKeys = [["q1", "a1"], ["q2", "a2"], ["q3", "a3"], ["q4", "a4"], ["q5", "a5"], ["q6", "a6"]] as const;

// dictionaryapi.dev — 取英文釋義 + 例句（懶載入，快取）
async function fetchExample(word: string): Promise<{ defEn: string; exampleEn: string } | null> {
  const cacheKey = CACHE_PREFIX + "def_" + btoa(word).slice(0, 40);
  try { const c = localStorage.getItem(cacheKey); if (c) { const { data, timestamp } = JSON.parse(c); if (Date.now() - timestamp < CACHE_TTL) return data; } } catch { /* ignore */ }
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    let defEn = "", exampleEn = "";
    if (Array.isArray(json) && json[0]?.meanings) {
      for (const m of json[0].meanings) {
        for (const d of m.definitions || []) {
          if (!defEn && d.definition) defEn = d.definition;
          if (!exampleEn && d.example) exampleEn = d.example;
          if (defEn && exampleEn) break;
        }
        if (defEn && exampleEn) break;
      }
    }
    const data = { defEn, exampleEn };
    try { localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() })); } catch { /* ignore */ }
    return data;
  } catch { return null; }
}

export default function VocabularyDnaEngine() {
  const { lang, setLang } = useLanguage();
  const t = ui[lang];
  const [input, setInput] = useState("transport");
  const [queryWord, setQueryWord] = useState("");
  const [cards, setCards] = useState<ResultCard[]>([]);
  const [rootHits, setRootHits] = useState<RootEntry[]>([]);
  const [apiResult, setApiResult] = useState<DatamuseWord[] | null | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => { loadDict(); }, []);

  const runQuery = useCallback(async (rawWord: string) => {
    const word = rawWord.trim().toLowerCase().replace(/[^a-z]/g, "");
    if (!word) return;
    setLoading(true);
    setQueryWord(word);
    setExpanded(null);
    await loadDict();
    const [syn, trg, ml] = await Promise.all([
      queryDatamuse(`rel_syn=${encodeURIComponent(word)}`, 12),
      queryDatamuse(`rel_trg=${encodeURIComponent(word)}`, 12),
      queryDatamuse(`ml=${encodeURIComponent(word)}`, 12),
    ]);
    if (syn === null && trg === null && ml === null) {
      setApiResult(null); setCards([]); setRootHits([]); setLoading(false); return;
    }
    setApiResult(syn ?? trg ?? ml ?? null);
    const seen = new Set<string>([word]);
    const merged: ResultCard[] = [];
    // 相關度過濾（Victor 規格）：剔除 Datamuse score < 1000 的低相關度詞條，再每股依 score 降序僅取前 8 名
    const SCORE_FLOOR = 1000;
    const STRAND_TOP = 8;
    const pushStrand = (data: DatamuseWord[] | null, strand: Strand) => {
      const ranked = (data ?? [])
        .filter((d) => (d.score ?? 0) >= SCORE_FLOOR)
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
        .slice(0, STRAND_TOP);
      ranked.forEach((d) => {
        const w = d.word?.toLowerCase();
        if (!w || w.includes(" ") || seen.has(w)) return;
        seen.add(w);
        const { pos, freq, pron } = parseTags(d.tags);
        const dict = DICT ? DICT[w] : undefined;
        const cefr: Cefr = dict && dict[0] ? (dict[0] as Cefr) : freqToCefr(freq);
        const zhTw = dict && dict[1] ? dict[1] : "";
        const zhCn = dict && dict[2] ? dict[2] : "";
        const ipa = dict && dict[3] ? normIpa(dict[3]) : arpabetToIpa(pron);
        let meaningZh = "", meaningSrc: MeaningSrc = "none";
        if (zhTw) { meaningZh = zhTw; meaningSrc = "tw"; }
        else if (zhCn) { meaningZh = zhCn; meaningSrc = "cn"; }
        merged.push({ word: d.word, strand, cefr, posKey: pos, ipa, meaningZh, meaningSrc });
      });
    };
    pushStrand(syn, "syn"); pushStrand(trg, "trg"); pushStrand(ml, "ml");
    const finalCards = merged.slice(0, 24);
    setCards(finalCards);
    const hits = WORD_ROOTS.filter((r) => r.root.toLowerCase().split("/").some((part) => part && word.includes(part)));
    setRootHits(hits.slice(0, 6));
    setLoading(false);
    // 字義三層 fallback 第三層：無中文釋義者，背景補英文定義（EN）
    const needEn = finalCards.filter((c) => c.meaningSrc === "none");
    if (needEn.length > 0) {
      const fetched = await Promise.all(needEn.map((c) => fetchExample(c.word).then((ex) => ({ word: c.word, defEn: ex?.defEn || "" }))));
      const defMap = new Map(fetched.map((f) => [f.word, f.defEn]));
      setCards((prev) => prev.map((c) => {
        if (c.meaningSrc === "none") {
          const def = defMap.get(c.word) || "";
          if (def) return { ...c, meaningZh: def, meaningSrc: "en" as MeaningSrc };
        }
        return c;
      }));
    }
  }, []);

  const toggleExpand = useCallback(async (word: string) => {
    if (expanded === word) { setExpanded(null); return; }
    setExpanded(word);
    const target = cards.find((c) => c.word === word);
    if (target && !target.enriched) {
      const ex = await fetchExample(word);
      setCards((prev) => prev.map((c) => c.word === word ? { ...c, enriched: true, defEn: ex?.defEn || "", exampleEn: ex?.exampleEn || "" } : c));
    }
  }, [expanded, cards]);

  function fillStandard() { setInput("transport"); runQuery("transport"); }
  function fillCut() { setInput("vision"); runQuery("vision"); }
  function clearAll() { setInput(""); setQueryWord(""); setCards([]); setRootHits([]); setApiResult(undefined); setExpanded(null); }

  const stats = useMemo(() => {
    if (cards.length === 0) return null;
    const strandCount: Record<string, number> = {};
    cards.forEach((c) => { strandCount[c.strand] = (strandCount[c.strand] || 0) + 1; });
    const topStrand = Object.entries(strandCount).sort((a, b) => b[1] - a[1])[0];
    return { count: cards.length, topStrand: topStrand ? topStrand[0] : "—", rootPct: rootHits.length };
  }, [cards, rootHits]);

  const countDisplay = stats ? String(stats.count) : "—";
  const strandName: Record<string, string> = { syn: "rel_syn", trg: "rel_trg", ml: "ml=" };
  const scenarios = [
    { k: "exam", title: t.scenarioExam, note: t.scenarioExamNote, accent: "border-blue-200 bg-blue-50" },
    { k: "writing", title: t.scenarioWriting, note: t.scenarioWritingNote, accent: "border-emerald-200 bg-emerald-50" },
    { k: "daily", title: t.scenarioDaily, note: t.scenarioDailyNote, accent: "border-amber-200 bg-amber-50" },
    { k: "business", title: t.scenarioBusiness, note: t.scenarioBusinessNote, accent: "border-violet-200 bg-violet-50" },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-QueryInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#dcfce7,_#f8fafc_45%,_#e0f2fe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}><span className={`rounded-full px-3 py-1 ${lang === "zh" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.chineseShort}</span><span className={`rounded-full px-3 py-1 ${lang === "en" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.englishShort}</span></button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-emerald-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{countDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{queryWord || "—"}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.dailyGap}</div><div className="font-black">{stats ? strandName[stats.topStrand] || "—" : "—"}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="font-black">{stats ? stats.rootPct : "—"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc · metric · imperial */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.hotWords}</h3><div className="mt-4 flex flex-wrap gap-2">{HOT_WORDS.map((w) => <button key={w} onClick={() => { setInput(w); runQuery(w); }} className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-black text-emerald-800">{w}</button>)}</div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.enterValues}</h3><div className="mt-4 flex flex-col gap-3 sm:flex-row"><input className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={input} placeholder={t.inputPlaceholder} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") runQuery(input); }} /><button onClick={() => runQuery(input)} className="rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-black text-white">{t.queryBtn}</button><button onClick={clearAll} className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700">{t.clearBtn}</button></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{countDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{queryWord || "—"}</div><div className="mt-1 text-xs text-slate-300">DNA</div></div></div>
            {rootHits.length > 0 && (
              <div className="mt-5 rounded-2xl border border-violet-200 bg-violet-50 p-4"><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">{t.rootLabel}</p><div className="mt-2 flex flex-wrap gap-2">{rootHits.map((r) => <span key={r.root} className="rounded-full bg-white px-3 py-1 text-xs font-black text-violet-900">{r.root}（{r.origin}）{r.zh}</span>)}</div></div>
            )}
            <div className="mt-6 space-y-3">
              {loading && <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm font-black text-slate-600">{t.loading}</div>}
              {!loading && apiResult === undefined && <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm font-black text-slate-500">{t.emptyHint}</div>}
              {!loading && apiResult === null && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center text-sm font-black text-amber-900"><div className="font-black">{t.fallbackTitle}</div><p className="mt-1 text-xs font-bold leading-5">{t.fallbackBody}</p></div>}
              {!loading && apiResult !== undefined && apiResult !== null && cards.length === 0 && <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">{t.noResult}</div>}
              {!loading && cards.map((card) => (
                <div key={card.word} className="rounded-2xl border border-slate-200/60 bg-white/80 p-4 backdrop-blur">
                  <div className="flex flex-wrap items-center gap-3"><span className="text-xl font-black text-slate-900">{card.word}</span><span className={`rounded-full px-2 py-1 text-xs font-black ${strandColor[card.strand]}`}>{strandName[card.strand]}</span>{card.cefr && <span className={`rounded-full px-2 py-1 text-xs font-black ${cefrColor[card.cefr]}`}>{card.cefr}</span>}<span className="text-xs font-black text-slate-500">{l(posMap[card.posKey] || posMap.u, lang)}</span>{card.ipa && <span className="font-mono text-sm text-slate-600">{card.ipa}</span>}</div>
                  {card.meaningZh
                    ? <p className="mt-2 text-sm leading-6 text-slate-700"><span className="font-black text-slate-400">{t.meaningLabel}{card.meaningSrc === "cn" && <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-black text-amber-700">{t.glossTagCn}</span>}{card.meaningSrc === "en" && <span className="ml-1 rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-black text-sky-700">{t.glossTagEn}</span>}：</span>{card.meaningZh}</p>
                    : null}
                  <button type="button" onClick={() => toggleExpand(card.word)} className="mt-2 text-xs font-black text-emerald-700">{expanded === card.word ? t.collapseHint : `▸ ${t.expandHint}`}</button>
                  {expanded === card.word && (
                    <div className="mt-2 space-y-2 rounded-xl bg-slate-50 p-3">
                      <p className="text-sm text-slate-600"><span className="font-black text-slate-400">{t.strandLabel}：</span>{strandBands.find((b) => b.key === card.strand) ? l(strandBands.find((b) => b.key === card.strand)!.label, lang) : strandName[card.strand]}</p>
                      {!card.enriched && <p className="text-xs font-bold text-slate-400">{t.enLoading}</p>}
                      {card.enriched && card.defEn && <p className="text-sm leading-6 text-slate-700"><span className="font-black text-slate-400">{t.defLabel}：</span>{card.defEn}</p>}
                      {card.enriched && card.exampleEn && <p className="text-sm leading-6 text-slate-700"><span className="font-black text-slate-400">{t.exampleLabel}：</span><span className="italic">{card.exampleEn}</span></p>}
                      {card.enriched && !card.defEn && !card.exampleEn && <p className="text-xs font-bold text-slate-400">{t.noExample}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.levelMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.levelMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{strandBands.map((item) => { const n = cards.filter((c) => c.strand === item.key).length; return <div key={item.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className={`rounded-full px-2 py-1 text-xs font-black ${strandColor[item.key]}`}>{n}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>; })}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="vocabulary-dna-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">{/* L8-ScenarioComparison */}
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.scenarioLayer}</p><h2 className="mt-2 text-3xl font-black">{t.scenarioTitle}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.scenarioNote}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{scenarios.map((s) => <article key={s.k} className={`rounded-3xl border p-5 shadow-sm ${s.accent}`}><h3 className="text-lg font-black text-slate-900">{s.title}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{s.note}</p></article>)}</div>
        </section>
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.unit}</div><div className="mt-1 text-3xl font-black">{countDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{stats ? strandName[stats.topStrand] || "—" : "—"}</div></div><div className="rounded-2xl bg-violet-50 p-4"><div className="text-xs font-black uppercase text-violet-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-violet-950">{stats ? stats.rootPct : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.step1, t.step2, t.step3, t.step4].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L11-DecisionPath */}<p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[t.step1, t.step2, t.step3, t.step4].map((label, index) => <div key={label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{label}</div></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L14-Knowledge-FAQ · L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.usage}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.usageText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="vocabulary-dna-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 可能包含站內或聯盟推薦；若透過部分連結購買，我們可能獲得佣金。" : "* May include on-site or affiliate recommendations. We may earn a commission from qualifying purchases."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-TrustRelatedReferences */}<p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
