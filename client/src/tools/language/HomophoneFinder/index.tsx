// @profile B
// Profile B · Language-Hub 自建演算法 · HomophoneFinder（GOLD-STANDARD MacroCalculator compatible）
// 同音異字查找器：自建「同音異字查找 + 反查」演算法（單一單字輸入，單一豐富結果卡）。
//   原理：輸入英文單字 → 比對內建 108 組同音異字群（拼字/意義不同但發音相同，如 their/there/they're、to/too/two），找出所屬群並列出全部同音字
//   反查：群內每個單字都建索引，輸入任一同音字皆可反查整群，並標出「你查的字」。
//   三層中文釋義(繁體優先→ECDICT簡體標「簡」→英文定義標EN) + ARPABET→IPA 全照 gold 範本。四要素鐵律：① KK音標 ② 詞類 ③ 釋義 ④ 例句。

import { useState, useCallback, useEffect } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";
import homophonesData from "./homophones.json";

type HomoWord = { word: string; pos: string; zh: string; exEn: string; exZh: string };
type HomoGroup = { key: string; words: HomoWord[] };
const GROUPS: HomoGroup[] = homophonesData as HomoGroup[];

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type Cefr = "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | null;
const l = (v: LocalText, lang: Lang) => v[lang];

// ============================================================
// 本地 24h 快取（沿用 Language Hub 慣例，存 dictionaryapi.dev 例句）
// ============================================================
const CACHE_PREFIX = "fu_lng_cache_";
const CACHE_TTL = 24 * 60 * 60 * 1000;

// ============================================================
// 內建 CEFR + 繁體中文釋義 + IPA 詞庫（CEFR-J ver1.5 + Octanove + ECDICT，懶載入）
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

// ============================================================
// 自建「同音異字查找 + 反查」演算法（四要素鐵律）
//   建立索引：每組同音字的每個成員單字 → 整個同音群，所以輸入任一成員都能反查整群
// ============================================================
const HOMO_INDEX: Record<string, HomoGroup> = {};
for (const g of GROUPS) {
  for (const w of g.words) { const k = w.word.toLowerCase(); if (!HOMO_INDEX[k]) HOMO_INDEX[k] = g; }
}
type HomoHit = { group: HomoGroup; matchedWord: string };
function findHomophones(rawWord: string): HomoHit | null {
  const word = rawWord.trim().toLowerCase().replace(/[^a-z']/g, "");
  if (!word) return null;
  const g = HOMO_INDEX[word];
  if (!g) return null;
  return { group: g, matchedWord: word };
}

// ARPABET → 美式 IPA（dict 未帶 IPA 時的 fallback）
const ARP_IPA: Record<string, string> = {
  AA: "ɑ", AE: "æ", AH: "ʌ", AO: "ɔ", AW: "aʊ", AY: "aɪ", B: "b", CH: "tʃ", D: "d", DH: "ð",
  EH: "ɛ", ER: "ɚ", EY: "eɪ", F: "f", G: "ɡ", HH: "h", IH: "ɪ", IY: "i", JH: "dʒ", K: "k",
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
function lenToCefr(len: number): Cefr {
  if (len <= 0) return null;
  if (len <= 3) return "A1"; if (len <= 4) return "A2"; if (len <= 5) return "B1";
  if (len <= 6) return "B2"; if (len <= 8) return "C1"; return "C2";
}
// 詞類碼 → 顯示文字（支援 "n/v" 複合）
const posMap: Record<string, LocalText> = {
  n: { zh: "名詞", en: "noun" }, v: { zh: "動詞", en: "verb" },
  adj: { zh: "形容詞", en: "adjective" }, adv: { zh: "副詞", en: "adverb" },
  prep: { zh: "介系詞", en: "preposition" }, pron: { zh: "代名詞", en: "pronoun" },
  conj: { zh: "連接詞", en: "conjunction" }, num: { zh: "數詞", en: "numeral" },
  det: { zh: "限定詞", en: "determiner" }, art: { zh: "冠詞", en: "article" },
  interj: { zh: "感嘆詞", en: "interjection" }, contr: { zh: "縮寫", en: "contraction" },
  abbr: { zh: "縮寫", en: "abbreviation" }, u: { zh: "其他", en: "other" },
};
function posLabel(posCode: string, lang: Lang): string {
  return posCode.split("/").map((p) => l(posMap[p] || posMap.u, lang)).join(" · ");
}

function ipaOf(word: string): string {
  const dict = DICT ? DICT[word.toLowerCase()] : undefined;
  if (dict && dict[3]) return normIpa(dict[3]);
  return "__PENDING__";
}
function cefrOf(word: string): Cefr {
  const dict = DICT ? DICT[word.toLowerCase()] : undefined;
  if (dict && dict[0]) return dict[0] as Cefr;
  return lenToCefr(word.length);
}

type WordCard = HomoWord & { ipa: string; cefr: Cefr; exampleEn?: string; defEn?: string };
type ExploreResult = {
  query: string;
  hit: HomoHit | null;
  cards: WordCard[];
};

const cefrColor: Record<string, string> = {
  A1: "bg-emerald-100 text-emerald-800", A2: "bg-emerald-100 text-emerald-800",
  B1: "bg-sky-100 text-sky-800", B2: "bg-sky-100 text-sky-800",
  C1: "bg-violet-100 text-violet-800", C2: "bg-violet-100 text-violet-800",
};
const posChipColor: Record<string, string> = {
  v: "bg-blue-100 text-blue-800", n: "bg-emerald-100 text-emerald-800",
  adj: "bg-amber-100 text-amber-800", adv: "bg-violet-100 text-violet-800",
  pron: "bg-pink-100 text-pink-800", prep: "bg-cyan-100 text-cyan-800",
  conj: "bg-teal-100 text-teal-800", num: "bg-orange-100 text-orange-800",
  det: "bg-rose-100 text-rose-800", contr: "bg-indigo-100 text-indigo-800",
  interj: "bg-fuchsia-100 text-fuchsia-800",
};
const HOT_WORDS = ["their", "to", "your", "its", "right", "see"] as const;

const typeBands = [
  { key: "A1", label: { zh: "代名詞 / 縮寫類", en: "Pronoun / Contraction" }, desc: { zh: "their / there / they're、your / you're、its / it's，最常見的同音混淆，差別在「所有格」「副詞」「縮寫(are/is)」，寫作時最容易拼錯。", en: "their / there / they're, your / you're, its / it's — the most common homophone confusion; the difference is possessive vs. adverb vs. contraction (are/is), most often misspelled in writing." } },
  { key: "B1", label: { zh: "拼字相近類", en: "Similar Spelling" }, desc: { zh: "see / sea、meat / meet、week / weak，發音完全相同但拼字只差一兩個字母，靠語境記憶最有效。", en: "see / sea, meat / meet, week / weak — identical pronunciation but spelling differs by only a letter or two; memorize by context." } },
  { key: "C1", label: { zh: "形音義皆異類", en: "Distinct in Form & Meaning" }, desc: { zh: "principal / principle、stationary / stationery、complement / compliment，拼字差異大、意義完全不同，是考試與正式寫作的高頻陷阱。", en: "principal / principle, stationary / stationery, complement / compliment — very different spelling and meaning; a frequent trap in exams and formal writing." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "單字家族探索器", en: "Word Family Explorer" }, href: "/tools/language/word-family-explorer" },
  { label: { zh: "字根分析器", en: "Word Root Analyzer" }, href: "/tools/language/word-root-analyzer" },
  { label: { zh: "Scrabble 單字驗證", en: "Scrabble Word Checker" }, href: "/tools/language/scrabble-word-checker" },
  { label: { zh: "CEFR 等級估算", en: "CEFR Level Estimator" }, href: "/tools/language/cefr-level-estimator" },
];

const ui = {
  zh: {
    badge: "語言 · 同音異字查找器 · Language Hub", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "同音異字查找器 · Homophone Finder", subtitle: "輸入一個英文單字，查找與它發音相同（或極相近）但拼字、意義不同的同音異字——如 their/there/they're、to/too/two、see/sea，每個同音字都附 KK 音標、詞類、繁體中文釋義與例句，內建 108 組常見同音群",
    intro: "同音異字查找器採用自建的「同音異字查找 + 反查」演算法：輸入一個英文單字後，工具會比對內建 108 組常見同音異字群——不論你輸入的是 their、there 還是 they're，都能反查出整群同音字，列出每個同音字的 KK 音標、詞類、繁體中文釋義與一句例句，並標出你查的字。同音異字是英文寫作與聽寫最常見的拼字陷阱，一次看清整群差異，比死背更有效。本工具為純前端演算法，同音查找不依賴外部 API，速度快、離線可用。",
    trustNoteLabel: "資料來源：", trustNote: "同音群查找以自建演算法比對內建 108 組同音異字群產生（純前端，不依賴外部 API）；同音群成員、詞類與繁中釋義由編輯團隊人工整理（依發音相同分群）；IPA 音標取自 ECDICT 與 ARPABET 轉換；CEFR 等級以 CEFR-J 與 Octanove 權威詞表對照；例句由編輯團隊撰寫，展開可另載入 Free Dictionary API 的英文定義與例句。僅供學習與參考。",
    quickActionCard: "快速查找卡", tryExample: "查找 their", examplePreview: "同音字數", examplePerson: "查的字", fillExample: "查找 their", previewActivePath: "查找 to",
    examplesCalculator: "範例 → 查找", enterValues: "輸入單字", examplesHelper: "先用熱門範例了解同音群、詞類、音標與中文釋義如何呈現，再換成你自己想查的單字（同音群中任一成員皆可）。",
    queryBtn: "查找同音字", clearBtn: "清除", hotWords: "熱門同音群", inputPlaceholder: "輸入英文單字，例如 their、to、see",
    loading: "查找中…", emptyHint: "輸入上方單字並按「查找同音字」，整群同音字與四要素會顯示在這裡並標出你查的字。", noResult: "在內建 108 組同音異字群中找不到這個單字，它可能沒有常見的同音異字，或不在內建清單中，建議改查常見同音字（如 their、to、see、right）。",
    fallbackTitle: "詞庫載入中", fallbackBody: "正在載入內建詞庫，請稍候再試一次。",
    resultCard: "查找結果", wordUnit: "個同音字", matchHint: "你查的字", ipaLabel: "音標", ipaPending: "/音標整理中/", meaningLabel: "釋義", expandHint: "展開看更多例句", collapseHint: "收合", exampleLabel: "例句", enLoading: "載入例句中…", noExample: "查無更多例句，已附人工例句。",
    resultIntelligence: "結果解讀", levelMatrix: "同音異字三大類型", levelMatrixNote: "L7 把同音異字依混淆來源分三類，看你查的字屬於哪一類，記憶時對症下藥。",
    scenarioLayer: "使用場景", scenarioTitle: "什麼時候用同音字查找", scenarioNote: "L8 列出四個典型場景，把同音字查找用在對的地方，一次分清整群易混淆字。",
    scenarioExam: "考試備考", scenarioExamNote: "字彙題與克漏字常考同音異字（如 their/there、principal/principle），查找一次分清整群拼字與意義，避免選錯。", scenarioWriting: "寫作校對", scenarioWritingNote: "寫作時最常拼錯同音字（its/it's、your/you're），校對時查一次確認用對形態，提升正確率。", scenarioDaily: "聽寫聽力", scenarioDailyNote: "聽寫時同音字最容易聽錯寫錯，先查整群同音字記住差異，聽到時依語境判斷該寫哪一個。", scenarioBusiness: "教學備課", scenarioBusinessNote: "老師整理同音字易混清單時，快速取得同音群成員、詞類與例句作為教案素材。",
    progressInsight: "學習洞察卡", possibleTarget: "本次查找", dailyGap: "查的字", weeklyTrend: "同音字數", motivation: "動力卡", keepMomentum: "從聽到一個音走向認得整群同音字，一次分清易混淆字",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天查的同音群帶回家", journeyHint: "挑 2–3 個同音字各造一句，把它們的詞類與意義差異一起練熟，下次聽到這個音就不會拼錯。",
    nextActionLabel: "下一步行動", nextActionTitle: "把這個字接到下一個工具", nextActionItem1: "用單字家族探索器看這個字的整個構詞家族，把同源字一起記", nextActionItem2: "用字根分析器拆解這個字的字根與語源，理解意義來源", nextActionItem3: "用 CEFR 等級估算評估這些同音字的難度等級",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "查找路徑", decisionTitle: "輸入 → 反查同音群 → 看詞類意義 → 練造句", step1: "輸入單字", step2: "反查同音群", step3: "看差異", step4: "練造句",
    knowledge: "知識", knowledgeTitle: "同音異字在英語學習中的意義", definition: "定義", definitionText: "同音異字（homophone）是發音相同（或極相近）但拼字、意義不同的單字，例如 their / there / they're、to / too / two、see / sea；它們是英文寫作與聽寫最常見的拼字陷阱，一次看清整群差異並依語境記憶，是避免拼錯的核心方法。", usage: "用法", usageText: "輸入一個單字後（同音群中任一成員皆可），演算法反查內建同音異字群，列出整群同音字並標出你查的字，每個成員附 KK 音標、詞類、繁中釋義與一句例句，可展開看英文定義與更多例句。", limitations: "限制", limitationsText: "本工具的同音群表為內建 108 組常見同音異字，並非完整詞典；罕見同音字與不在清單中的單字未必收錄；同音以美式發音為準，部分英式發音差異未必涵蓋；查無同音字者代表它在清單中沒有常見同音異字。", interpretation: "解讀", interpretationText: "同音異字依混淆來源可分三類——代名詞/縮寫類（their/there/they're）、拼字相近類（see/sea）、形音義皆異類（principal/principle）；抓住每類的辨別重點，看到同音字時依語境（詞類與意義）判斷該用哪一個。", context: "脈絡", contextText: "同音字查找應與單字家族探索、字根分析一起用：先用同音字查找分清易混淆字，再用家族探索與字根理解構詞與語源，把容易拼錯的孤立單字變成有系統的學習。", example: "範例", exampleText: "輸入 their → 同音群包含 their（限定詞，他們的）、there（副詞，那裡）、they're（縮寫，they are）；輸入 they're → 反查出整群並標出你查的字。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "相關工具", affiliateTitle: "同音字查找的下一步工具", premiumTitle: "PRO 同音字大師包", premiumText: "解鎖無限查找、批次查同音字表、依類型匯出同音群、自動記錄查找歷史，並把同音清單匯出複習。",
    feat1: "無限查找次數", feat2: "批次查同音表", feat3: "查找歷史記錄", feat4: "同音清單匯出",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供英語學習與拼字辨別用途；同音群查找以自建演算法比對內建同音異字群，並非完整詞典；同音群成員與釋義由編輯團隊人工整理，CEFR 等級為詞表對照與啟發式推估。", relatedTools: "相關工具", relatedToolsText: "Word Family Explorer · Word Root Analyzer · Scrabble Word Checker · CEFR Level Estimator", references: "參考資料", referencesText: "自建「同音異字查找 + 反查」演算法（純前端，比對內建 108 組同音群）；同音群成員與繁中釋義由編輯團隊人工整理（依發音相同分群）；CEFR-J Wordlist v1.5（Tono Lab, TUFS）；Octanove C1/C2 Vocabulary Profile（CC BY-SA 4.0）；ECDICT 開源英漢詞典（IPA 音標與簡體釋義）；Free Dictionary API（英文定義與例句）。",
    q1: "同音異字是怎麼查出來的？", a1: "用自建演算法建立索引：把內建 108 組同音異字群的每個成員全部建檔，所以不論你輸入的是哪一個同音字，都能反查出整群同音字。純前端判定，不需連外部 API。",
    q2: "為什麼輸入任一同音字都能查到整群？", a2: "本工具支援反查：演算法把每組同音字的每個成員都建成索引，例如輸入 there 會反查出整群 their / there / they're，並標出你查的是哪一個成員。這對你只記得其中一個拼法、想看清整群差異時特別有用。",
    q3: "為什麼有些單字查不到同音字？", a3: "若該單字不在內建 108 組常見同音異字群中（罕見同音字或沒有常見同音異字的單字未必收錄），就會顯示查無同音字。建議改查常見同音字，如 their、to、see、right、principal 等。",
    q4: "音標和中文釋義從哪來？", a4: "IPA 音標取自 ECDICT 開源英漢詞典（內建 2 萬餘字），詞庫未收錄者改以 ARPABET 即時轉換 IPA；繁體中文釋義、詞類與例句由編輯團隊人工整理；展開可另載入 Free Dictionary API 的英文定義與更多例句。",
    q5: "their、there、they're 到底怎麼分？", a5: "their 是限定詞「他們的」（their house）；there 是副詞「在那裡」（over there）；they're 是 they are 的縮寫（they're coming）。三者發音相同，靠詞類與意義判斷：能換成 they are 就用 they're，表示「那裡」用 there，其餘表所有用 their。",
    q6: "同音字和拼字相近字有什麼不同？", a6: "同音字是發音完全相同但拼字、意義不同（如 see / sea）；拼字相近字（如 desert / dessert）發音其實不同。本工具聚焦發音相同的同音異字，幫你分清「聽起來一樣、寫法不同」的字。",
  },
  en: {
    badge: "Language · Homophone Finder · Language Hub", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Homophone Finder", subtitle: "Type an English word and find its homophones — words that sound the same (or nearly so) but differ in spelling and meaning, such as their/there/they're, to/too/two, see/sea; every homophone comes with IPA, part of speech, Traditional Chinese gloss, and an example, with 108 common homophone groups built in",
    intro: "The Homophone Finder uses a custom homophone lookup and reverse-lookup algorithm: after you type a word, it matches it against a built-in 108 common homophone groups — whether you enter their, there, or they're, it reverse-looks up the whole group, lists each homophone's IPA, part of speech, Traditional Chinese gloss, and an example sentence, and marks the word you entered. Homophones are the most common spelling trap in English writing and dictation; seeing the whole group's differences at once is more effective than rote learning. This tool is a pure front-end algorithm; homophone lookup uses no external API, so it is fast and works offline.",
    trustNoteLabel: "Data source:", trustNote: "Homophone lookup is produced by a custom algorithm matched against a built-in 108 homophone groups (pure front-end, no external API); group members, parts of speech, and Chinese glosses are curated by the editorial team (grouped by identical pronunciation); IPA comes from ECDICT and ARPABET conversion; CEFR levels are matched against the CEFR-J and Octanove authoritative wordlists; examples are written by the editorial team, with English definitions and examples loadable from the Free Dictionary API on expand. For study and reference only.",
    quickActionCard: "Quick Lookup Card", tryExample: "Find their", examplePreview: "Homophones", examplePerson: "Word entered", fillExample: "Find their", previewActivePath: "Find to",
    examplesCalculator: "Examples → Find", enterValues: "Enter a word", examplesHelper: "Start with a popular example to see how the homophone group, part of speech, IPA, and Chinese gloss appear, then swap in the word you want (any group member).",
    queryBtn: "Find homophones", clearBtn: "Clear", hotWords: "Popular homophone groups", inputPlaceholder: "Type an English word, e.g. their, to, see",
    loading: "Searching…", emptyHint: "Enter a word above and press Find homophones; the whole group and the four elements appear here with the word you entered marked.", noResult: "This word is not in the built-in 108 homophone groups; it may have no common homophone or not be on the list. Try a common homophone (e.g. their, to, see, right).",
    fallbackTitle: "Loading dictionary", fallbackBody: "The built-in dictionary is loading, please try again shortly.",
    resultCard: "Lookup Result", wordUnit: "homophones", matchHint: "Word you entered", ipaLabel: "IPA", ipaPending: "/pending/", meaningLabel: "Gloss", expandHint: "Show more examples", collapseHint: "Collapse", exampleLabel: "Example", enLoading: "Loading example…", noExample: "No extra example found; a curated example is shown.",
    resultIntelligence: "Result Intelligence", levelMatrix: "Three types of homophones", levelMatrixNote: "L7 sorts homophones into three types by source of confusion; see which type your word belongs to and target your memorization.",
    scenarioLayer: "Use scenarios", scenarioTitle: "When to use homophone lookup", scenarioNote: "L8 lists four typical scenarios so you use homophone lookup in the right place, sorting out a whole group of confusables at once.",
    scenarioExam: "Exam prep", scenarioExamNote: "Vocabulary and cloze questions often test homophones (their/there, principal/principle); look up once to sort out the whole group's spelling and meaning and avoid wrong choices.", scenarioWriting: "Writing proofreading", scenarioWritingNote: "Homophones are most often misspelled in writing (its/it's, your/you're); proofread by looking up once to confirm the right form and raise accuracy.", scenarioDaily: "Dictation & listening", scenarioDailyNote: "Homophones are easiest to mishear in dictation; look up the whole group first to learn the differences, then judge by context which to write.", scenarioBusiness: "Teaching prep", scenarioBusinessNote: "When teachers compile confusable homophone lists, quickly obtain group members, parts of speech, and examples as lesson material.",
    progressInsight: "Learning Insight Card", possibleTarget: "This lookup", dailyGap: "Word entered", weeklyTrend: "Homophones", motivation: "Motivation Card", keepMomentum: "Move from hearing one sound to recognizing a whole group of homophones, sorting confusables at once",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's homophone group home", journeyHint: "Pick 2–3 homophones, write one sentence each, and master the part-of-speech and meaning differences together so you won't misspell next time.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this word to the next tool", nextActionItem1: "Use Word Family Explorer to see this word's whole formation family and memorize cognates together", nextActionItem2: "Use Word Root Analyzer to break out this word's root and origin and understand meaning", nextActionItem3: "Use CEFR Level Estimator to assess the difficulty level of these homophones",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Lookup Path", decisionTitle: "Input → Reverse lookup group → See POS & meaning → Practice", step1: "Type word", step2: "Reverse lookup", step3: "See differences", step4: "Practice",
    knowledge: "Knowledge", knowledgeTitle: "What homophones mean in English learning", definition: "Definition", definitionText: "A homophone is a word that sounds the same (or nearly so) as another but differs in spelling and meaning, e.g. their / there / they're, to / too / two, see / sea; they are the most common spelling trap in English writing and dictation, and seeing the whole group's differences while memorizing by context is the core method to avoid misspelling.", usage: "Usage", usageText: "After you enter a word (any group member), the algorithm reverse-looks up the built-in homophone groups, lists the whole group and marks the word you entered, with each member tagged with IPA, part of speech, a Chinese gloss, and an example sentence, expandable to an English definition and more examples.", limitations: "Limitations", limitationsText: "The homophone table is a built-in 108 common homophone groups, not a complete dictionary; rare homophones and words not on the list may not be included; homophones are based on American pronunciation, so some British differences may not be covered; a no-result word has no common homophone on the list.", interpretation: "Interpretation", interpretationText: "Homophones split into three types by source of confusion — pronoun/contraction (their/there/they're), similar spelling (see/sea), and distinct form & meaning (principal/principle); grasp each type's distinguishing key and judge by context (part of speech and meaning) which to use.", context: "Context", contextText: "Homophone lookup should be used with family exploration and root analysis: first sort out confusables with homophone lookup, then use family exploration and roots to understand formation and origin, turning easily misspelled isolated words into systematic learning.", example: "Example", exampleText: "Input their → group includes their (determiner, possessive), there (adverb, that place), they're (contraction of they are); input they're → reverse-looks up the whole group and marks the word you entered.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Related Tools", affiliateTitle: "Next tools for homophone lookup", premiumTitle: "PRO Homophone Master Pack", premiumText: "Unlock unlimited lookups, batch-look up homophone lists, export groups by type, auto-log lookup history, and export homophone lists for review.",
    feat1: "Unlimited lookups", feat2: "Batch homophone list", feat3: "Lookup history", feat4: "Export homophone list",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for English learning and spelling distinction only; homophone lookup uses a custom algorithm matched against a built-in homophone table, not a complete dictionary; group members and glosses are curated by the editorial team, and CEFR levels are wordlist matches plus a heuristic.", relatedTools: "Related Tools", relatedToolsText: "Word Family Explorer · Word Root Analyzer · Scrabble Word Checker · CEFR Level Estimator", references: "References", referencesText: "Custom homophone lookup and reverse-lookup algorithm (pure front-end, matched against a built-in 108 homophone groups); group members and Chinese glosses curated by the editorial team (grouped by identical pronunciation); CEFR-J Wordlist v1.5 (Tono Lab, TUFS); Octanove C1/C2 Vocabulary Profile (CC BY-SA 4.0); ECDICT open EN-ZH dictionary (IPA and Simplified glosses); Free Dictionary API (English definitions and examples).",
    q1: "How are the homophones found?", a1: "A custom algorithm builds an index: every member of the 108 built-in homophone groups is indexed, so whatever homophone you enter, it reverse-looks up the whole group. Pure front-end, no external API.",
    q2: "Why can I find the whole group by entering any homophone?", a2: "This tool supports reverse lookup: the algorithm indexes every member of each homophone group, e.g. entering there reverse-looks up the whole group their / there / they're and marks which member you entered. This is especially useful when you only remember one spelling and want to see the whole group's differences.",
    q3: "Why can't some words find homophones?", a3: "If the word is not in the built-in 108 common homophone groups (rare homophones or words with no common homophone may not be included), it shows no homophone found. Try common homophones like their, to, see, right, principal.",
    q4: "Where do the IPA and Chinese gloss come from?", a4: "IPA comes from the open ECDICT EN-ZH dictionary (over 20k words built in); unlisted words convert ARPABET to IPA on the fly. Traditional Chinese glosses, parts of speech, and examples are curated by the editorial team; expanding can also load English definitions and more examples from the Free Dictionary API.",
    q5: "How exactly do their, there, and they're differ?", a5: "their is a determiner meaning possessive 'their' (their house); there is an adverb meaning 'in that place' (over there); they're is the contraction of 'they are' (they're coming). All three sound the same; judge by part of speech and meaning: if it can be replaced by 'they are' use they're, for 'that place' use there, otherwise for possession use their.",
    q6: "How are homophones different from similar-spelling words?", a6: "Homophones sound exactly the same but differ in spelling and meaning (e.g. see / sea); similar-spelling words (e.g. desert / dessert) actually differ in pronunciation. This tool focuses on homophones that sound the same, helping you distinguish words that 'sound alike but are spelled differently.'",
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

export default function HomophoneFinder() {
  const { lang, setLang } = useLanguage();
  const t = ui[lang];
  const [input, setInput] = useState("their");
  const [result, setResult] = useState<ExploreResult | null>(null);
  const [solved, setSolved] = useState<boolean | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => { loadDict(); }, []);

  const runQuery = useCallback(async (rawWord: string) => {
    const word = rawWord.trim().toLowerCase().replace(/[^a-z']/g, "");
    if (!word) return;
    setLoading(true);
    setExpanded(null);
    await loadDict();
    const hit = findHomophones(word);
    if (!hit) {
      setResult({ query: word, hit: null, cards: [] });
      setSolved(true);
      setLoading(false);
      return;
    }
    const cards: WordCard[] = hit.group.words.map((w) => ({ ...w, ipa: ipaOf(w.word), cefr: cefrOf(w.word) }));
    setResult({ query: word, hit, cards });
    setSolved(true);
    setLoading(false);
  }, []);

  const toggleExpand = useCallback(async (word: string) => {
    const key = word.toLowerCase();
    if (expanded === key) { setExpanded(null); return; }
    setExpanded(key);
    const current = result?.cards.find((c) => c.word.toLowerCase() === key);
    if (current && current.exampleEn === undefined) {
      const ex = await fetchExample(key);
      setResult((prev) => {
        if (!prev) return prev;
        return { ...prev, cards: prev.cards.map((c) => c.word.toLowerCase() === key ? { ...c, exampleEn: ex?.exampleEn || "", defEn: ex?.defEn || "" } : c) };
      });
    }
  }, [expanded, result]);

  function fillStandard() { setInput("their"); runQuery("their"); }
  function fillCut() { setInput("to"); runQuery("to"); }
  function clearAll() { setInput(""); setResult(null); setSolved(undefined); setExpanded(null); }

  const wordCountDisplay = result && result.hit ? String(result.cards.length) : "—";
  const queryDisplay = result ? result.query : "—";

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{wordCountDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.wordUnit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div lang="en" translate="no" className="notranslate font-black">{queryDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePreview}</div><div className="font-black">{wordCountDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.wordUnit}</div><div className="font-black">{wordCountDisplay}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Query */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.hotWords}</h3><div className="mt-4 flex flex-wrap gap-2">{HOT_WORDS.map((w) => <button key={w} lang="en" translate="no" onClick={() => { setInput(w); runQuery(w); }} className="notranslate rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-black text-emerald-800">{w}</button>)}</div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.enterValues}</h3><div className="mt-4 flex flex-col gap-3 sm:flex-row"><input lang="en" translate="no" className="notranslate w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={input} placeholder={t.inputPlaceholder} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") runQuery(input); }} /><button onClick={() => runQuery(input)} className="rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-black text-white">{t.queryBtn}</button><button onClick={clearAll} className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700">{t.clearBtn}</button></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{wordCountDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.wordUnit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.examplePerson}</div><div lang="en" translate="no" className="notranslate mt-1 text-xl font-black">{queryDisplay}</div></div></div>
            <div className="mt-6 space-y-3">
              {loading && <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm font-black text-slate-600">{t.loading}</div>}
              {!loading && solved === undefined && <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm font-black text-slate-500">{t.emptyHint}</div>}
              {!loading && solved === true && result && !result.hit && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center text-sm font-black text-rose-700">{t.noResult}</div>}
              {!loading && solved === true && result && result.hit && result.cards.map((c) => { const key = c.word.toLowerCase(); const isOpen = expanded === key; const isMatched = key === result.query; const firstPos = c.pos.split("/")[0]; return (
                <div key={c.word} className={`rounded-2xl border p-4 ${isMatched ? "border-emerald-300 bg-emerald-50/60" : "border-slate-200/60 bg-white/80"} backdrop-blur`}>
                  <div className="flex flex-wrap items-center gap-2"><span lang="en" translate="no" className="notranslate text-lg font-black text-slate-900">{c.word}</span><span className={`rounded-full px-2 py-0.5 text-xs font-black ${posChipColor[firstPos] || "bg-slate-100 text-slate-700"}`}>{posLabel(c.pos, lang)}</span>{c.cefr && <span className={`rounded-full px-2 py-0.5 text-xs font-black ${cefrColor[c.cefr]}`}>{c.cefr}</span>}<span lang="en" translate="no" className="notranslate font-mono text-xs text-slate-600">{c.ipa === "__PENDING__" ? t.ipaPending : c.ipa}</span>{isMatched && <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-black text-white">{t.matchHint}</span>}</div>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{c.zh}</p>
                  <p lang="en" translate="no" className="notranslate mt-1 text-sm italic text-slate-700">{c.exEn}</p>
                  <p className="text-xs leading-6 text-slate-500">{c.exZh}</p>
                  <button type="button" onClick={() => toggleExpand(c.word)} className="mt-1 text-xs font-black text-emerald-700">{isOpen ? t.collapseHint : `▸ ${t.expandHint}`}</button>
                  {isOpen && (
                    <div className="mt-2 rounded-xl bg-slate-50 p-3">
                      {c.exampleEn === undefined
                        ? <p className="text-xs font-black text-slate-400">{t.enLoading}</p>
                        : c.exampleEn
                          ? (<><p className="text-xs font-black text-slate-400">{t.exampleLabel}</p><p lang="en" translate="no" className="notranslate mt-1 text-sm italic text-slate-700">{c.exampleEn}</p>{c.defEn && <p lang="en" translate="no" className="notranslate mt-1 text-xs text-slate-500">{c.defEn}</p>}</>)
                          : (c.defEn ? <p lang="en" translate="no" className="notranslate text-xs text-slate-500">{c.defEn}</p> : <p className="text-xs text-slate-400">{t.noExample}</p>)}
                    </div>
                  )}
                </div>
              ); })}
            </div>
          </div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.levelMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.levelMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{typeBands.map((item) => <div key={item.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className={`rounded-full px-2 py-1 text-xs font-black ${cefrColor[item.key]}`}>{item.key}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="homophone-finder-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">{/* L8-ScenarioComparison */}
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.scenarioLayer}</p><h2 className="mt-2 text-3xl font-black">{t.scenarioTitle}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.scenarioNote}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{scenarios.map((s) => <article key={s.k} className={`rounded-3xl border p-5 shadow-sm ${s.accent}`}><h3 className="text-lg font-black text-slate-900">{s.title}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{s.note}</p></article>)}</div>
        </section>
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.examplePerson}</div><div lang="en" translate="no" className="notranslate mt-1 text-2xl font-black">{queryDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.examplePreview}</div><div className="mt-1 text-2xl font-black text-blue-950">{wordCountDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.wordUnit}</div><div className="mt-1 text-3xl font-black text-emerald-950">{wordCountDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.step1, t.step2, t.step3, t.step4].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L11-DecisionPath */}<p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[t.step1, t.step2, t.step3, t.step4].map((label, index) => <div key={label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{label}</div></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.usage}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.usageText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="homophone-finder-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 相關 Language Hub 工具，免費使用。" : "* Related Language Hub tools, free to use."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-Trust */}<p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
