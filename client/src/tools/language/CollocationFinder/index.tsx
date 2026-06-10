// @profile B
// Profile B · Language-Hub A-class (Datamuse ml=) · CollocationFinder（GOLD-STANDARD MacroCalculator compatible）
// 語意搭配查找器：1) 以 ml=（語意相近）找出可搭配使用的相關詞  2) 三層中文釋義(繁體優先→ECDICT簡體標「簡」→英文定義標EN)  3) CEFR 分層改用權威詞表

import { useMemo, useState, useCallback, useEffect } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type Cefr = "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | null;
const l = (v: LocalText, lang: Lang) => v[lang];

// ============================================================
// Language Hub Datamuse 標準模板 v1.0（MANUAL §2a 完整照抄）
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
// 內建 CEFR + 繁體中文釋義 + IPA 詞庫（CEFR-J ver1.5 + Octanove C1/C2 分級 · 繁體釋義人工撰寫 · ECDICT IPA，懶載入）
//   形態：{ word: [cefr, zh_tw, zh_cn, ipa] }
// ============================================================
type DictEntry = string[]; // [cefr, zh_tw, zh_cn, ipa]
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
// ECDICT phonetic 補上斜線
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

type MeaningSrc = "tw" | "cn" | "none";
type ResultCard = {
  word: string; cefr: Cefr; posKey: string; freq: number; ipa: string; meaningZh: string; meaningSrc: MeaningSrc;
  // lazy enrichment (例句 via dictionaryapi.dev)
  exampleEn?: string; defEn?: string; enriched?: boolean;
};

const cefrColor: Record<string, string> = {
  A1: "bg-emerald-100 text-emerald-800", A2: "bg-emerald-100 text-emerald-800",
  B1: "bg-sky-100 text-sky-800", B2: "bg-sky-100 text-sky-800",
  C1: "bg-violet-100 text-violet-800", C2: "bg-violet-100 text-violet-800",
};
const HOT_WORDS = ["make", "strong", "heavy", "fast", "deep", "high"] as const;

const cefrBands = [
  { key: "A1", label: { zh: "A1 入門", en: "A1 Beginner" }, desc: { zh: "最常用的基礎搭配詞，寫作與口語首選。", en: "Most frequent basics; best for writing and speech." } },
  { key: "A2", label: { zh: "A2 基礎", en: "A2 Elementary" }, desc: { zh: "常見的搭配詞，足以應付日常表達。", en: "Common collocations for everyday expression." } },
  { key: "B1", label: { zh: "B1 中級", en: "B1 Intermediate" }, desc: { zh: "讓段落與作文更自然的中階搭配詞。", en: "Mid-level collocations that make writing more natural." } },
  { key: "B2", label: { zh: "B2 中高", en: "B2 Upper-Inter" }, desc: { zh: "正式寫作與報告常見的進階搭配詞。", en: "Advanced collocations common in formal writing." } },
  { key: "C1", label: { zh: "C1 高級", en: "C1 Advanced" }, desc: { zh: "精準、學術感強的高階搭配詞。", en: "Precise, academic high-level collocations." } },
  { key: "C2", label: { zh: "C2 精通", en: "C2 Proficiency" }, desc: { zh: "罕見而典雅，母語者也未必常用。", en: "Rare and elegant; even natives use them sparingly." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "同義詞查找器", en: "Synonym Finder" }, href: "/tools/language/synonym-finder" },
  { label: { zh: "詞語聯想查找器", en: "Word Association Finder" }, href: "/tools/language/word-association-finder" },
  { label: { zh: "字根分析器", en: "Word Root Analyzer" }, href: "/tools/language/word-root-analyzer" },
  { label: { zh: "CEFR 等級估算", en: "CEFR Level Estimator" }, href: "/tools/language/cefr-level-estimator" },
];

const ui = {
  zh: {
    badge: "語言 · 語意搭配 · Language Hub", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "語意搭配查找器 · Collocation Finder", subtitle: "輸入一個英文字，立刻找出語意相近、可搭配使用、帶 CEFR 等級、IPA 音標與中文釋義的詞",
    intro: "Collocation Finder 串接 Datamuse 開放語料 API（ml=，語意相近），以「語意相近」為核心找出與您輸入單字意思接近、可在寫作中互相搭配替換的詞。搭配看的是「語意相近度」而非拼字或發音，所以每個結果都標註 CEFR 難度等級、詞性與中文釋義，並附 IPA 音標，可展開查看英文定義與例句，幫您在寫作潤飾、用詞升級、避免重複與表達精準化中快速找到最貼意的搭配詞。",
    trustNoteLabel: "資料來源：", trustNote: "搭配詞來自 Datamuse（以語料庫統計找出語意相近詞 ml=）；CEFR 等級以 CEFR-J 與 Octanove 權威詞表對照；中文釋義以編輯團隊人工撰寫的繁體中文為優先，尚無繁體者改顯示 ECDICT 開源詞典的簡體釋義（標註「簡」），繁簡皆無者展開即顯示英文定義；IPA 音標取自 ECDICT 與 ARPABET 轉換；例句來自 Free Dictionary API。僅供學習參考。",
    quickActionCard: "快速查詢卡", tryExample: "一鍵查 make 的搭配詞", examplePreview: "找到的搭配詞數", examplePerson: "查詢字", fillExample: "查 make 的搭配詞", previewActivePath: "查 strong 的搭配詞",
    examplesCalculator: "範例 → 查詢", enterValues: "輸入英文單字", examplesHelper: "先用熱門範例了解 CEFR 等級、IPA 音標與中文釋義如何呈現，再換成您自己想搭配的單字。",
    queryBtn: "查詢搭配詞", clearBtn: "清除", hotWords: "熱門查詢", inputPlaceholder: "輸入英文單字，例如 make",
    loading: "查詢中…", emptyHint: "輸入上方單字並按「查詢搭配詞」，結果會列在這裡。", noResult: "查無搭配詞，換個更常見的單字試試。",
    fallbackTitle: "查詢暫時無法使用", fallbackBody: "網路連線問題，請稍後再試。常用結果已儲存在本機快取中。",
    resultCard: "搭配詞結果", unit: "個搭配詞", primaryValue: "查詢字", ipaLabel: "音標", meaningLabel: "釋義", glossTagCn: "簡", glossTagEn: "EN", enGlossHint: "展開看英文定義與例句", expandHint: "展開看例句", collapseHint: "收合", exampleLabel: "例句", enLoading: "載入例句中…", noExample: "查無例句，建議造句練習。",
    resultIntelligence: "結果解讀", levelMatrix: "六級 CEFR 搭配詞解讀矩陣", levelMatrixNote: "L7 將搭配詞依 CEFR 等級分層，以 CEFR-J 權威詞表對照，A1 最常用、C2 最罕見；用詞升級時對照您的目標讀者程度。",
    scenarioLayer: "使用場景", scenarioTitle: "什麼時候用語意搭配", scenarioNote: "L8 列出四個典型場景，把搭配詞用在對的地方，而不是隨意換詞。",
    scenarioExam: "寫作潤飾", scenarioExamNote: "段落用詞太單調時，用搭配詞找出語意相近但更精確的替換，讓行文更順。", scenarioWriting: "用詞升級", scenarioWritingNote: "依語意與 CEFR 適中挑搭配詞，把基礎字換成更道地、更得體的進階字。", scenarioDaily: "避免重複", scenarioDailyNote: "同一個字出現太多次時，用語意相近的搭配詞替換，讓文章不單調。", scenarioBusiness: "表達精準", scenarioBusinessNote: "想精準傳達某個語感時，用搭配詞比較幾個近義字，挑最貼意的那個。",
    progressInsight: "學習洞察卡", possibleTarget: "本次查詢", dailyGap: "最常用等級", weeklyTrend: "已分級比例", motivation: "動力卡", keepMomentum: "從查搭配詞走向主動用詞升級",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天找到的搭配詞帶回家", journeyHint: "挑 2–3 個您真正會用到的搭配詞查釋義並造句，比死背 20 個更有效。",
    nextActionLabel: "下一步行動", nextActionTitle: "把搭配詞接到下一個工具", nextActionItem1: "用同義詞查找器比較搭配詞與同義字的細微差異", nextActionItem2: "用 CEFR 等級估算確認搭配詞難度是否符合您的程度", nextActionItem3: "用字根分析器理解搭配詞的語義從何而來，記得更牢",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "搭配路徑", decisionTitle: "輸入 → 查詢 → 比較 → 替換", step1: "輸入單字", step2: "查搭配詞", step3: "看 CEFR", step4: "替換用詞",
    knowledge: "知識", knowledgeTitle: "語意搭配在英語學習中的意義", definition: "定義", definitionText: "語意搭配（collocation）這裡指語意相近、可在寫作中互相搭配替換的詞；它看的是「語意相近度」而非拼字或發音，因此判斷是否可替換要看意思是否貼近與語境是否合適，而非同形或押韻。", usage: "用法", usageText: "輸入一個單字後，演算法會以語料庫統計找出意思最接近的詞（例如 make 的搭配詞有 produce、build、create），再依 CEFR 等級與詞性整理，幫您在寫作時把單調的字換成更貼意的搭配詞。", limitations: "限制", limitationsText: "Datamuse 的 ml= 依語意相近度排序，可能含多字片語或罕見詞；近義不等於完全可互換，替換前仍須看語境；CEFR 等級以 CEFR-J/Octanove 詞表為主，未收錄者改用詞頻啟發式推估。", interpretation: "解讀", interpretationText: "A1/A2 搭配詞適合基礎寫作與口語；B1/B2 適合一般寫作與報告；C1/C2 雖然精準，用錯場合反而生硬難懂。", context: "脈絡", contextText: "搭配查詢應與同義詞、字根、CEFR 估算一起用：先用搭配找出語意相近的候選詞，再用同義詞比較細微差異，挑最貼意的字。", example: "範例", exampleText: "查 strong → 得到 powerful(B1)、intense(B2)、robust(C1)；寫作時把 strong coffee 升級為 robust coffee，語感更道地。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "相關工具", affiliateTitle: "語意搭配的下一步工具", premiumTitle: "PRO 詞彙搭配包", premiumText: "解鎖無限查詢、依 CEFR 等級篩選搭配詞、依詞性過濾、自動記錄查詢歷史，並把搭配字表匯出複習。",
    feat1: "無限查詢次數", feat2: "難度等級篩選", feat3: "查詢歷史記錄", feat4: "搭配字表匯出",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供英語學習與詞彙搭配用途；CEFR 等級以 CEFR-J/Octanove 權威詞表對照，詞表未收錄者為啟發式推估，不等同官方語言檢定結果。", relatedTools: "相關工具", relatedToolsText: "Synonym Finder · Word Association Finder · Word Root Analyzer · CEFR Level Estimator", references: "參考資料", referencesText: "Datamuse API（ml=，語料庫統計語意相近詞）；CEFR-J Wordlist v1.5（Tono Lab, TUFS）；Octanove C1/C2 Vocabulary Profile（CC BY-SA 4.0）；ECDICT 開源英漢詞典（IPA 音標與簡體釋義）；繁體中文釋義由編輯團隊人工撰寫；Free Dictionary API（例句）。",
    q1: "語意搭配和同義詞有什麼不同？", a1: "同義詞嚴格指意思幾乎相同、可直接互換的字；本工具的「語意搭配」以 ml=（語意相近）為基礎，範圍稍廣，含語意接近、可在特定語境搭配替換的詞。實務上兩者高度重疊，搭配更強調「在寫作中替換得自然」。",
    q2: "CEFR 等級是怎麼判斷的？", a2: "優先以 CEFR-J 與 Octanove 權威詞表對照；詞表未收錄的罕見字才改用 Datamuse 詞頻啟發式推估。這是學習參考，非官方檢定。",
    q3: "為什麼有些字查不到搭配詞？", a3: "罕見字、專有名詞或拼錯的字可能沒有搭配資料；某些字語意太獨特也可能列不出近義詞。換成更常見的字通常就有結果。",
    q4: "音標和中文釋義從哪來？", a4: "IPA 音標取自 ECDICT 開源英漢詞典（內建 2 萬餘字），詞庫未收錄者改以 ARPABET 即時轉換 IPA；中文釋義採三層優先序——編輯團隊人工撰寫的繁體中文優先（無標註），尚無繁體者改顯示 ECDICT 簡體釋義並標註「簡」，繁簡皆無者展開即顯示英文定義（標註 EN）。全程不經機器翻譯。例句來自 Free Dictionary API。",
    q5: "結果為什麼有時不一樣？", a5: "Datamuse 依語料統計動態排序，且我們已過濾極罕見結果，因此排序可能隨時間略有變化。",
    q6: "適合寫作潤飾和用詞升級嗎？", a6: "適合。先用搭配詞找出語意相近的候選，再依 CEFR 等級與詞性挑選；寫作潤飾時用搭配詞替換單調的字，能讓行文更道地不重複。",
  },
  en: {
    badge: "Language · Collocation · Language Hub", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Collocation Finder", subtitle: "Type one English word and get semantically close, collocating words with CEFR level, IPA, and Chinese gloss",
    intro: "Collocation Finder calls the open Datamuse corpus API (ml=, meaning-like) and finds words that are semantically close to your input and can collocate or be swapped in writing. Collocation here is about semantic closeness, not spelling or sound, so each result is tagged with a CEFR difficulty level, part of speech, and Chinese gloss, with an IPA transcription, expandable to show an English definition and example sentence, helping you quickly find the most fitting collocate for polishing writing, upgrading word choice, avoiding repetition, and expressing precisely.",
    trustNoteLabel: "Data source:", trustNote: "Collocations come from Datamuse (semantically close words found via corpus statistics, ml=); CEFR levels are matched against the CEFR-J and Octanove authoritative wordlists; Chinese glosses prioritize the editorial team's hand-written Traditional Chinese, falling back to ECDICT's Simplified gloss (tagged Simp) when no Traditional one exists, and to an English definition when neither is available; IPA comes from ECDICT and ARPABET conversion; examples come from the Free Dictionary API. For study reference only.",
    quickActionCard: "Quick Query Card", tryExample: "Find collocates for make", examplePreview: "Collocates found", examplePerson: "Query word", fillExample: "Find collocates for make", previewActivePath: "Find collocates for strong",
    examplesCalculator: "Examples → Query", enterValues: "Enter an English word", examplesHelper: "Start with a popular example to see how CEFR level, IPA, and Chinese gloss appear, then swap in the word you want to collocate.",
    queryBtn: "Find collocates", clearBtn: "Clear", hotWords: "Popular queries", inputPlaceholder: "Type an English word, e.g. make",
    loading: "Searching…", emptyHint: "Enter a word above and press Find collocates; results will appear here.", noResult: "No collocates found, try a more common word.",
    fallbackTitle: "Query temporarily unavailable", fallbackBody: "Network issue, please try again later. Common results are cached locally.",
    resultCard: "Collocation Results", unit: "collocates", primaryValue: "Query word", ipaLabel: "IPA", meaningLabel: "Gloss", glossTagCn: "Simp", glossTagEn: "EN", enGlossHint: "See English definition & example on expand", expandHint: "Show example", collapseHint: "Collapse", exampleLabel: "Example", enLoading: "Loading example…", noExample: "No example found; try writing your own.",
    resultIntelligence: "Result Intelligence", levelMatrix: "Six-level CEFR collocation matrix", levelMatrixNote: "L7 groups collocates by CEFR level using the authoritative CEFR-J wordlist, with A1 most common and C2 rarest; match the level to your target reader when upgrading word choice.",
    scenarioLayer: "Use scenarios", scenarioTitle: "When to use collocation", scenarioNote: "L8 lists four typical scenarios so you use collocates in the right place, not just swapping words at random.",
    scenarioExam: "Polishing writing", scenarioExamNote: "When wording feels monotonous, use collocates to find a semantically close but more precise replacement for smoother prose.", scenarioWriting: "Upgrading word choice", scenarioWritingNote: "Pick collocates that fit the meaning at a moderate CEFR level to swap basic words for more idiomatic, fitting advanced ones.", scenarioDaily: "Avoiding repetition", scenarioDailyNote: "When the same word appears too often, swap in a semantically close collocate so the text is less monotonous.", scenarioBusiness: "Precise expression", scenarioBusinessNote: "To convey a precise nuance, compare a few near-synonyms with collocates and pick the most fitting one.",
    progressInsight: "Learning Insight Card", possibleTarget: "This query", dailyGap: "Most common level", weeklyTrend: "Graded ratio", motivation: "Motivation Card", keepMomentum: "Move from looking up collocates to actively upgrading word choice",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's collocates home", journeyHint: "Look up and use 2–3 collocates you will actually use in sentences; it beats memorizing 20 at once.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect collocates to the next tool", nextActionItem1: "Use Synonym Finder to compare the subtle differences between collocates and synonyms", nextActionItem2: "Use CEFR Level Estimator to confirm the collocate difficulty fits your level", nextActionItem3: "Use Word Root Analyzer to see where the collocate's meaning comes from and remember it better",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Collocation Path", decisionTitle: "Input → Query → Compare → Replace", step1: "Type a word", step2: "Find collocates", step3: "Check CEFR", step4: "Replace word",
    knowledge: "Knowledge", knowledgeTitle: "What collocation means in English learning", definition: "Definition", definitionText: "Collocation here refers to semantically close words that can be swapped or paired in writing; it is about semantic closeness, not spelling or sound, so whether a word can be substituted depends on closeness of meaning and fit of context, not form or rhyme.", usage: "Usage", usageText: "After entering a word, the algorithm uses corpus statistics to find the closest words in meaning (e.g. make collocates with produce, build, create), then organizes them by CEFR level and part of speech to help you swap monotonous words for more fitting collocates.", limitations: "Limitations", limitationsText: "Datamuse ml= ranks by semantic closeness and may include multi-word phrases or rare words; near-synonymy is not full interchangeability, so always check context before swapping; CEFR levels primarily use the CEFR-J/Octanove wordlists, falling back to a frequency heuristic for unlisted words.", interpretation: "Interpretation", interpretationText: "A1/A2 collocates suit basic writing and speech; B1/B2 suit general writing and reports; C1/C2 look precise but feel stiff if used in the wrong place.", context: "Context", contextText: "Collocation lookup should be used with synonyms, word roots, and CEFR estimation: find semantically close candidates with collocates first, then compare subtle differences with synonyms and pick the most fitting word.", example: "Example", exampleText: "Search strong → get powerful(B1), intense(B2), robust(C1); in writing, upgrading strong coffee to robust coffee sounds more idiomatic.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Related Tools", affiliateTitle: "Next tools for collocation", premiumTitle: "PRO Collocation Pack", premiumText: "Unlock unlimited queries, filter collocates by CEFR level, filter by part of speech, auto-log query history, and export collocation lists for review.",
    feat1: "Unlimited queries", feat2: "Level filter", feat3: "Query history", feat4: "Export list",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for English learning and collocation only; CEFR levels are matched against the CEFR-J/Octanove wordlists, with a heuristic estimate for unlisted words, and do not equal an official language assessment.", relatedTools: "Related Tools", relatedToolsText: "Synonym Finder · Word Association Finder · Word Root Analyzer · CEFR Level Estimator", references: "References", referencesText: "Datamuse API (ml=, semantically close words via corpus statistics); CEFR-J Wordlist v1.5 (Tono Lab, TUFS); Octanove C1/C2 Vocabulary Profile (CC BY-SA 4.0); ECDICT open EN-ZH dictionary (IPA and Simplified glosses); Traditional Chinese glosses hand-written by the editorial team; Free Dictionary API (examples).",
    q1: "How is collocation different from a synonym?", a1: "Synonyms strictly mean words with nearly identical, directly interchangeable meaning; this tool's collocation uses ml= (meaning-like), a slightly broader range including semantically close words that can be swapped in a given context. In practice the two overlap heavily; collocation emphasizes swapping naturally in writing.",
    q2: "How is the CEFR level decided?", a2: "It is matched first against the CEFR-J and Octanove authoritative wordlists; only rare words not in the lists fall back to a Datamuse frequency heuristic. It is study reference, not an official assessment.",
    q3: "Why do some words return no collocates?", a3: "Rare words, proper nouns, or misspellings may have no collocation data; some words are too unique in meaning to list near-synonyms. Switching to a more common word usually returns results.",
    q4: "Where do the IPA and Chinese gloss come from?", a4: "IPA comes from the open ECDICT EN-ZH dictionary (over 20k words built in); unlisted words convert the Datamuse pronunciation to IPA on the fly. Chinese glosses use a three-tier priority — the editorial team's hand-written Traditional Chinese first (no tag), then ECDICT's Simplified gloss tagged Simp, then an English definition tagged EN when neither exists. No machine translation is used. Examples come from the Free Dictionary API.",
    q5: "Why are results sometimes different?", a5: "Datamuse ranks dynamically by corpus statistics, and we filter out the rarest results, so the order may shift slightly over time.",
    q6: "Is it good for polishing writing and upgrading word choice?", a6: "Yes. Find semantically close candidates with collocates first, then pick by CEFR level and part of speech; swapping monotonous words for collocates when polishing makes prose more idiomatic and less repetitive.",
  },
} as const;

const faqKeys = [["q1", "a1"], ["q2", "a2"], ["q3", "a3"], ["q4", "a4"], ["q5", "a5"], ["q6", "a6"]] as const;

// dictionaryapi.dev — 取英文釋義 + 例句（懶載入，快取）
async function fetchExample(word: string): Promise<{ defEn: string; exampleEn: string } | null> {
  const cacheKey = CACHE_PREFIX + "def_" + btoa(word).slice(0, 40);
  try { const c = localStorage.getItem(cacheKey); if (c) { const { data, timestamp } = JSON.parse(c); if (Date.now() - timestamp < CACHE_TTL) return data; } } catch { /* ignore */ }
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error("no def");
    const arr = await res.json();
    let defEn = "", exampleEn = "";
    for (const m of arr[0]?.meanings || []) {
      for (const d of m.definitions || []) { if (!defEn) defEn = d.definition || ""; if (d.example) { exampleEn = d.example; break; } }
      if (exampleEn) break;
    }
    const data = { defEn, exampleEn };
    try { localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() })); } catch { /* ignore */ }
    return data;
  } catch { return null; }
}

export default function CollocationFinder() {
  const { lang, setLang } = useLanguage();
  const t = ui[lang];
  const [input, setInput] = useState("make");
  const [queryWord, setQueryWord] = useState("");
  const [cards, setCards] = useState<ResultCard[]>([]);
  const [apiResult, setApiResult] = useState<DatamuseWord[] | null | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => { loadDict(); }, []);

  const runQuery = useCallback(async (rawWord: string) => {
    const word = rawWord.trim().toLowerCase();
    if (!word) return;
    setLoading(true);
    setQueryWord(word);
    setExpanded(null);
    await loadDict();
    const data = await queryDatamuse(`ml=${encodeURIComponent(word)}`, 24);
    setApiResult(data ?? null);
    if (data) {
      const mapped: ResultCard[] = data
        .filter((d) => d.word && !d.word.includes(" ") && d.word.toLowerCase() !== word)
        .map((d) => {
          const { pos, freq, pron } = parseTags(d.tags);
          const dict = DICT ? DICT[d.word.toLowerCase()] : undefined;
          const cefr: Cefr = dict && dict[0] ? (dict[0] as Cefr) : freqToCefr(freq);
          // 4 欄位 [cefr, zh_tw, zh_cn, ipa]
          const zhTw = dict && dict[1] ? dict[1] : "";
          const zhCn = dict && dict[2] ? dict[2] : "";
          const ipa = dict && dict[3] ? normIpa(dict[3]) : arpabetToIpa(pron);
          // 三層優先序：繁體 → 簡體 → 英文定義（前端展開）
          let meaningZh = "", meaningSrc: MeaningSrc = "none";
          if (zhTw) { meaningZh = zhTw; meaningSrc = "tw"; }
          else if (zhCn) { meaningZh = zhCn; meaningSrc = "cn"; }
          return { word: d.word, cefr, posKey: pos, freq, ipa, meaningZh, meaningSrc };
        })
        .filter((c) => c.freq >= 0.02)
        .slice(0, 18);
      setCards(mapped);
    } else { setCards([]); }
    setLoading(false);
  }, []);

  const toggleExpand = useCallback(async (word: string) => {
    if (expanded === word) { setExpanded(null); return; }
    setExpanded(word);
    setCards((prev) => prev.map((c) => c.word === word && !c.enriched ? { ...c, enriched: false } : c));
    const card = cards.find((c) => c.word === word);
    if (card && card.exampleEn === undefined) {
      const ex = await fetchExample(word);
      setCards((prev) => prev.map((c) => c.word === word ? { ...c, exampleEn: ex?.exampleEn || "", defEn: ex?.defEn || "", enriched: true } : c));
    }
  }, [expanded, cards]);

  function fillStandard() { setInput("make"); runQuery("make"); }
  function fillCut() { setInput("strong"); runQuery("strong"); }
  function clearAll() { setInput(""); setQueryWord(""); setCards([]); setApiResult(undefined); setExpanded(null); }

  const stats = useMemo(() => {
    if (cards.length === 0) return null;
    const levelCount: Record<string, number> = {};
    let graded = 0;
    cards.forEach((c) => { if (c.cefr) { levelCount[c.cefr] = (levelCount[c.cefr] || 0) + 1; graded += 1; } });
    const topLevel = Object.entries(levelCount).sort((a, b) => b[1] - a[1])[0];
    return { count: cards.length, topLevel: topLevel ? topLevel[0] : "—", gradedPct: Math.round((graded / cards.length) * 100) };
  }, [cards]);

  const countDisplay = stats ? String(stats.count) : "—";
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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{countDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{queryWord || "—"}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.dailyGap}</div><div className="font-black">{stats ? stats.topLevel : "—"}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="font-black">{stats ? `${stats.gradedPct}%` : "—"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
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
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{countDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{queryWord || "—"}</div><div className="mt-1 text-xs text-slate-300">ml=</div></div></div>
            <div className="mt-6 space-y-3">
              {loading && <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm font-black text-slate-600">{t.loading}</div>}
              {!loading && apiResult === undefined && <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm font-black text-slate-500">{t.emptyHint}</div>}
              {!loading && apiResult === null && (
                <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 text-center"><p className="text-lg font-black text-amber-800">{t.fallbackTitle}</p><p className="mt-2 text-sm text-amber-600">{t.fallbackBody}</p></div>
              )}
              {!loading && apiResult !== null && apiResult !== undefined && cards.length === 0 && <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">{t.noResult}</div>}
              {!loading && cards.map((card) => (
                <div key={card.word} className="rounded-2xl border border-slate-200/60 bg-white/80 p-4 backdrop-blur">
                  <div className="flex flex-wrap items-center gap-3"><span className="text-xl font-black text-slate-900">{card.word}</span>{card.cefr && <span className={`rounded-full px-2 py-1 text-xs font-black ${cefrColor[card.cefr]}`}>{card.cefr}</span>}<span className="text-xs font-black text-slate-500">{l(posMap[card.posKey] || posMap.u, lang)}</span>{card.ipa && <span className="font-mono text-sm text-slate-600">{card.ipa}</span>}</div>
                  {card.meaningSrc === "none"
                    ? <p className="mt-2 text-sm leading-6 text-slate-700"><span className="font-black text-slate-400">{t.meaningLabel}<span className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-black text-slate-500">{t.glossTagEn}</span>：</span>{t.enGlossHint}</p>
                    : <p className="mt-2 text-sm leading-6 text-slate-700"><span className="font-black text-slate-400">{t.meaningLabel}{card.meaningSrc === "cn" && <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-black text-amber-700">{t.glossTagCn}</span>}：</span>{card.meaningZh}</p>}
                  <button type="button" onClick={() => toggleExpand(card.word)} className="mt-2 text-xs font-black text-emerald-700">{expanded === card.word ? t.collapseHint : `▸ ${t.expandHint}`}</button>
                  {expanded === card.word && (
                    <div className="mt-2 rounded-xl bg-slate-50 p-3">
                      {card.exampleEn === undefined ? <p className="text-xs font-black text-slate-400">{t.enLoading}</p> : card.exampleEn ? (<><p className="text-sm italic text-slate-600">{card.exampleEn}</p>{card.defEn && <p className="mt-1 text-xs text-slate-500">{card.defEn}</p>}</>) : (card.defEn ? <p className="text-xs text-slate-500">{card.defEn}</p> : <p className="text-xs text-slate-400">{t.noExample}</p>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.levelMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.levelMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{cefrBands.map((item) => { const n = cards.filter((c) => c.cefr === item.key).length; return <div key={item.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className={`rounded-full px-2 py-1 text-xs font-black ${cefrColor[item.key]}`}>{n}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>; })}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="collocation-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">{/* L8-ScenarioComparison */}
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.scenarioLayer}</p><h2 className="mt-2 text-3xl font-black">{t.scenarioTitle}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.scenarioNote}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{scenarios.map((s) => <article key={s.k} className={`rounded-3xl border p-5 shadow-sm ${s.accent}`}><h3 className="text-lg font-black text-slate-900">{s.title}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{s.note}</p></article>)}</div>
        </section>
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.unit}</div><div className="mt-1 text-3xl font-black">{countDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{stats ? stats.topLevel : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{stats ? `${stats.gradedPct}%` : "—"}</div></div></div></article>
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
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="collocation-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 可能包含站內或聯盟推薦；若透過部分連結購買，我們可能獲得佣金。" : "* May include on-site or affiliate recommendations. We may earn a commission from qualifying purchases."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-TrustRelatedReferences */}<p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
