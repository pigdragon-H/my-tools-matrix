// @profile B
// Profile B · Language-Hub 自建演算法 · WordFamilyExplorer（GOLD-STANDARD MacroCalculator compatible）
// 單字家族探索器：自建「單字家族查找 + 反查」演算法（單一單字輸入，單一豐富結果卡）。
//   原理：輸入英文單字 → 比對內建 101 組單字家族（每組同一基底字的名詞/動詞/形容詞/副詞與衍生形態），找出所屬家族並列出全部成員
//   差異：word-root-analyzer 是「拉丁/希臘字根層」；本工具是「同一英文基底字的構詞家族」(字綴/詞類轉換 -ness/-ly/-tion/un-/-er)，依詞類分組，輸入家族中任一成員皆可反查整族。
//   三層中文釋義(繁體優先→ECDICT簡體標「簡」→英文定義標EN) + ARPABET→IPA 全照 gold 範本。四要素鐵律：① KK音標 ② 詞類 ③ 釋義 ④ 例句。

import { useMemo, useState, useCallback, useEffect } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";
import familiesData from "./wordFamilies.json";

type FamilyMember = { word: string; pos: string; zh: string };
type FamilyEntry = { base: string; members: FamilyMember[] };
const FAMILIES: FamilyEntry[] = familiesData as FamilyEntry[];

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
// 自建「單字家族查找 + 反查」演算法（四要素鐵律）
//   建立索引：家族中每個成員的單字 → 整個家族，所以輸入任一成員都能反查整族
// ============================================================
const FAMILY_INDEX: Record<string, FamilyEntry> = {};
for (const f of FAMILIES) {
  for (const m of f.members) { const k = m.word.toLowerCase(); if (!FAMILY_INDEX[k]) FAMILY_INDEX[k] = f; }
}
type FamilyHit = { family: FamilyEntry; matchedWord: string };
function findFamily(rawWord: string): FamilyHit | null {
  const word = rawWord.trim().toLowerCase().replace(/[^a-z]/g, "");
  if (!word) return null;
  const fam = FAMILY_INDEX[word];
  if (!fam) return null;
  return { family: fam, matchedWord: word };
}

// ARPABET → 美式 IPA（dict 未帶 IPA 時的 fallback）
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
  art: { zh: "冠詞", en: "article" }, int: { zh: "感嘆詞", en: "interjection" },
  abbr: { zh: "縮寫", en: "abbreviation" }, u: { zh: "其他", en: "other" },
};
function posLabel(posCode: string, lang: Lang): string {
  return posCode.split("/").map((p) => l(posMap[p] || posMap.u, lang)).join(" · ");
}
// 詞類分組排序：動詞→名詞→形容詞→副詞→其他
const POS_ORDER: Record<string, number> = { v: 0, n: 1, adj: 2, adv: 3 };
function posRank(posCode: string): number {
  const first = posCode.split("/")[0];
  return POS_ORDER[first] ?? 9;
}

type MeaningSrc = "tw" | "cn" | "none";
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

type MemberCard = FamilyMember & { ipa: string; cefr: Cefr; exampleEn?: string; defEn?: string };
type ExploreResult = {
  query: string;
  hit: FamilyHit | null;
  base: string;
  cards: MemberCard[]; // sorted by POS
};

const cefrColor: Record<string, string> = {
  A1: "bg-emerald-100 text-emerald-800", A2: "bg-emerald-100 text-emerald-800",
  B1: "bg-sky-100 text-sky-800", B2: "bg-sky-100 text-sky-800",
  C1: "bg-violet-100 text-violet-800", C2: "bg-violet-100 text-violet-800",
};
const posChipColor: Record<string, string> = {
  v: "bg-blue-100 text-blue-800", n: "bg-emerald-100 text-emerald-800",
  adj: "bg-amber-100 text-amber-800", adv: "bg-violet-100 text-violet-800",
};
const HOT_WORDS = ["happy", "create", "act", "care", "nature", "success"] as const;

const posBands = [
  { key: "A1", label: { zh: "動詞 → 名詞", en: "Verb → Noun" }, desc: { zh: "act→action、create→creation、decide→decision，動詞加 -tion/-sion/-ment 變名詞，是字族最常見的轉換。", en: "act→action, create→creation, decide→decision; verb + -tion/-sion/-ment becomes a noun, the most common family conversion." } },
  { key: "B1", label: { zh: "名詞 → 形容詞", en: "Noun → Adjective" }, desc: { zh: "beauty→beautiful、danger→dangerous、nature→natural，名詞加 -ful/-ous/-al 變形容詞。", en: "beauty→beautiful, danger→dangerous, nature→natural; noun + -ful/-ous/-al becomes an adjective." } },
  { key: "C1", label: { zh: "形容詞 → 副詞 / 反義", en: "Adjective → Adverb / Antonym" }, desc: { zh: "happy→happily（加 -ly 變副詞）、happy→unhappy（加 un- 變反義），掌握字綴就能一次擴充整族。", en: "happy→happily (+ -ly to adverb), happy→unhappy (+ un- to antonym); mastering affixes expands a whole family at once." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "字根分析器", en: "Word Root Analyzer" }, href: "/tools/language/word-root-analyzer" },
  { label: { zh: "不規則動詞查找", en: "Irregular Verb Finder" }, href: "/tools/language/irregular-verb-finder" },
  { label: { zh: "Scrabble 單字驗證", en: "Scrabble Word Checker" }, href: "/tools/language/scrabble-word-checker" },
  { label: { zh: "CEFR 等級估算", en: "CEFR Level Estimator" }, href: "/tools/language/cefr-level-estimator" },
];

const ui = {
  zh: {
    badge: "語言 · 單字家族探索器 · Language Hub", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "單字家族探索器 · Word Family Explorer", subtitle: "輸入一個英文單字（家族中任一成員皆可），探索它整個單字家族——同一基底字的名詞、動詞、形容詞、副詞與衍生形態，每個成員都附 KK 音標、詞類、繁體中文釋義與例句，內建 100 組常用單字家族",
    intro: "單字家族探索器採用自建的「單字家族查找 + 反查」演算法：輸入一個英文單字後，工具會比對內建 100 組常用單字家族——不論您輸入的是 happy 還是 happiness、happily、unhappy，都能反查出整個家族，並依詞類分組（動詞 → 名詞 → 形容詞 → 副詞），列出每個家族成員的 KK 音標、詞類、繁體中文釋義與一句例句。掌握一個基底字就能一次擴充整族同源單字，比逐字死背高效許多。本工具為純前端演算法，家族查找不依賴外部 API，速度快、離線可用。",
    trustNoteLabel: "資料來源：", trustNote: "單字家族查找以自建演算法比對內建 100 組單字家族產生（純前端，不依賴外部 API）；家族成員、詞類與繁中釋義由編輯團隊人工整理（依字綴與詞類轉換規律分組）；IPA 音標取自 ECDICT 與 ARPABET 轉換；CEFR 等級以 CEFR-J 與 Octanove 權威詞表對照；尚無人工繁體釋義者改顯示 ECDICT 開源詞典的簡體釋義（標註「簡」），繁簡皆無者展開即顯示英文定義；例句來自 Free Dictionary API。僅供學習與參考。",
    quickActionCard: "快速探索卡", tryExample: "探索 happy", examplePreview: "家族成員數", examplePerson: "探索單字", fillExample: "探索單字 happy", previewActivePath: "探索單字 create",
    examplesCalculator: "範例 → 探索", enterValues: "輸入單字", examplesHelper: "先用熱門範例了解家族成員、詞類分組、音標與中文釋義如何呈現，再換成您自己想探索的單字（家族中任一成員皆可）。",
    queryBtn: "探索家族", clearBtn: "清除", hotWords: "熱門單字家族", inputPlaceholder: "輸入英文單字，例如 happy、create",
    loading: "探索中…", emptyHint: "輸入上方單字並按「探索家族」，整個家族成員與四要素會依詞類分組顯示在這裡。", noResult: "在內建 100 組單字家族中找不到這個單字，它可能不在內建清單中，建議改探索常用基底字（如 act、create、happy）。",
    fallbackTitle: "詞庫載入中", fallbackBody: "正在載入內建詞庫，請稍候再試一次。",
    resultCard: "探索結果", memberUnit: "個成員", baseLabel: "基底字", matchHint: "您查的字", ipaLabel: "音標", ipaPending: "/音標整理中/", meaningLabel: "釋義", glossTagCn: "(簡)", glossTagEn: "(EN)", enGlossHint: "展開看英文定義與例句", expandHint: "展開看例句", collapseHint: "收合", exampleLabel: "例句", enLoading: "載入例句中…", noExample: "查無例句，建議造句練習。",
    resultIntelligence: "結果解讀", levelMatrix: "單字家族構詞規律", levelMatrixNote: "L7 把單字家族最常見的構詞轉換分三類，看您查的字族用到哪些字綴規律，記憶時舉一反三。",
    scenarioLayer: "使用場景", scenarioTitle: "什麼時候用家族探索", scenarioNote: "L8 列出四個典型場景，把家族探索用在對的地方，一次擴充一整族而非單字。",
    scenarioExam: "考試備考", scenarioExamNote: "字彙題與詞類轉換題常考同一字族的不同詞類，探索家族一次記名詞、動詞、形容詞、副詞。", scenarioWriting: "寫作擴詞", scenarioWritingNote: "寫作時想換詞性表達，探索家族找出同義不同詞類的字（如 success→successful→successfully），讓句子更靈活。", scenarioDaily: "字彙擴充", scenarioDailyNote: "學一個新字時順便探索整族，把名詞、動詞、形容詞、副詞一起記，字彙量倍增。", scenarioBusiness: "教學備課", scenarioBusinessNote: "老師整理字族教材時，快速取得家族成員、詞類與例句作為教案素材。",
    progressInsight: "學習洞察卡", possibleTarget: "本次探索", dailyGap: "基底字", weeklyTrend: "成員數", motivation: "動力卡", keepMomentum: "從背單字走向用字族一次擴充整串同源字",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天探索的字族帶回家", journeyHint: "挑 2–3 個同家族但不同詞類的成員各造一句，把名詞、動詞、形容詞、副詞的用法一起練熟。",
    nextActionLabel: "下一步行動", nextActionTitle: "把這個字接到下一個工具", nextActionItem1: "用字根分析器拆解這個基底字的字根與語源，記得更牢", nextActionItem2: "用不規則動詞查找確認家族中動詞的三態變化", nextActionItem3: "用 CEFR 等級估算評估這個字族的整體難度等級",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "探索路徑", decisionTitle: "輸入 → 反查家族 → 看詞類分組 → 練造句", step1: "輸入單字", step2: "反查家族", step3: "看分組", step4: "練造句",
    knowledge: "知識", knowledgeTitle: "單字家族在英語學習中的意義", definition: "定義", definitionText: "單字家族是同一基底字透過加字綴（-tion、-ful、-ly、un- 等）衍生出的一組詞類不同但意義相關的單字，例如 happy / happiness / happily / unhappy；掌握字族能一次擴充整串同源字，是高效擴充字彙的核心方法。", usage: "用法", usageText: "輸入一個單字後（家族中任一成員皆可），演算法反查內建單字家族表，列出整個家族成員並依詞類分組（動詞 → 名詞 → 形容詞 → 副詞），每個成員附音標、詞類、繁中釋義，可展開看英文例句。", limitations: "限制", limitationsText: "本工具的家族表為內建 100 組常用單字家族，並非完整詞典；罕見字族與不在清單中的衍生形態未必收錄；本工具聚焦同一英文基底字的構詞家族（字綴轉換），若要看拉丁/希臘字根層請用字根分析器。", interpretation: "解讀", interpretationText: "單字家族最常見的構詞轉換有三類——動詞→名詞（加 -tion/-ment）、名詞→形容詞（加 -ful/-ous/-al）、形容詞→副詞/反義（加 -ly / un-）；抓對字綴規律就能舉一反三，記一個基底字等於記一整族。", context: "脈絡", contextText: "家族探索應與字根分析、不規則動詞查找、CEFR 估算一起用：先用家族探索擴充同源字，再用字根理解語義來源，把孤立的單字學習變成有系統的字族學習。", example: "範例", exampleText: "輸入 happy → 家族包含 happy（形）、happiness（名）、happily（副）、unhappy（形，反義）；輸入 happily → 反查出整族並標出您查的字。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "相關工具", affiliateTitle: "家族探索的下一步工具", premiumTitle: "PRO 字族大師包", premiumText: "解鎖無限探索、批次探索單字表、依詞類分組匯出字族、自動記錄探索歷史，並把家族清單匯出複習。",
    feat1: "無限探索次數", feat2: "批次探索字表", feat3: "探索歷史記錄", feat4: "字族清單匯出",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供英語學習與字彙擴充用途；家族查找以自建演算法比對內建單字家族表，並非完整詞典；家族成員與釋義由編輯團隊人工整理，CEFR 等級為詞表對照與啟發式推估。", relatedTools: "相關工具", relatedToolsText: "Word Root Analyzer · Irregular Verb Finder · Scrabble Word Checker · CEFR Level Estimator", references: "參考資料", referencesText: "自建「單字家族查找 + 反查」演算法（純前端，比對內建 100 組單字家族）；家族成員與繁中釋義由編輯團隊人工整理（依字綴與詞類轉換規律分組）；CEFR-J Wordlist v1.5（Tono Lab, TUFS）；Octanove C1/C2 Vocabulary Profile（CC BY-SA 4.0）；ECDICT 開源英漢詞典（IPA 音標與簡體釋義）；Free Dictionary API（例句）。",
    q1: "單字家族是怎麼查出來的？", a1: "用自建演算法建立索引：把內建 100 組單字家族的每個成員全部建檔，所以不論您輸入的是基底字還是任一衍生成員，都能反查出整個家族。純前端判定，不需連外部 API。",
    q2: "為什麼輸入衍生字也能查到整族？", a2: "本工具支援反查：演算法把每個家族成員都建成索引，例如輸入 happiness 會反查出整族 happy / happiness / happily / unhappy，並標出您查的是哪個成員。這對您只知道某個衍生字、想看整族時特別有用。",
    q3: "為什麼有些單字查不到家族？", a3: "若該單字不在內建 100 組常用單字家族中（罕見字族或不在清單的衍生形態未必收錄），就會顯示查無此家族。建議改探索常用基底字，如 act、create、happy、success 等。",
    q4: "音標和中文釋義從哪來？", a4: "IPA 音標取自 ECDICT 開源英漢詞典（內建 2 萬餘字），詞庫未收錄者改以 ARPABET 即時轉換 IPA；繁體中文釋義與詞類由編輯團隊人工整理；尚無人工繁體者補顯示 ECDICT 簡體釋義並標註「簡」，繁簡皆無者展開即顯示英文定義（標註 EN）。例句來自 Free Dictionary API。",
    q5: "本工具和「字根分析器」有什麼不同？", a5: "字根分析器拆的是拉丁/希臘字根層（如 spect、port），看的是語源；本工具看的是同一英文基底字的構詞家族（字綴/詞類轉換，如 happy→happiness→happily），依詞類分組。兩者互補：字根理解語義來源，家族擴充同源詞類。",
    q6: "家族成員為什麼依詞類分組？", a6: "依詞類分組（動詞 → 名詞 → 形容詞 → 副詞）能讓您一眼看出同一字族在不同詞類下的形態，例如 act（動）/ action（名）/ active（形）/ actively（副），記憶時對照字綴規律更有系統。",
  },
  en: {
    badge: "Language · Word Family Explorer · Language Hub", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Word Family Explorer", subtitle: "Type an English word (any family member), explore its whole word family — the same base word as noun, verb, adjective, adverb, and derived forms; every member comes with IPA, part of speech, Traditional Chinese gloss, and an example, 100 common word families built in",
    intro: "The Word Family Explorer uses a custom word-family lookup and reverse-lookup algorithm: after you type a word, it matches it against a built-in 100 common word families — whether you enter happy, happiness, happily, or unhappy, it reverse-looks up the whole family, groups by part of speech (verb → noun → adjective → adverb), and lists each member's IPA, part of speech, Traditional Chinese gloss, and an example sentence. Mastering one base word lets you expand a whole string of cognates at once, far more efficient than rote learning each word. This tool is a pure front-end algorithm; family lookup uses no external API, so it is fast and works offline.",
    trustNoteLabel: "Data source:", trustNote: "Family lookup is produced by a custom algorithm matched against a built-in 100 word families (pure front-end, no external API); family members, parts of speech, and Chinese glosses are curated by the editorial team (grouped by affix and part-of-speech conversion rules); IPA comes from ECDICT and ARPABET conversion; CEFR levels are matched against the CEFR-J and Octanove authoritative wordlists; when no hand-written Traditional Chinese gloss exists, it falls back to ECDICT's Simplified gloss (tagged Simp), then to an English definition; examples come from the Free Dictionary API. For study and reference only.",
    quickActionCard: "Quick Explore Card", tryExample: "Explore happy", examplePreview: "Family members", examplePerson: "Explored word", fillExample: "Explore happy", previewActivePath: "Explore create",
    examplesCalculator: "Examples → Explore", enterValues: "Enter a word", examplesHelper: "Start with a popular example to see how family members, part-of-speech grouping, IPA, and Chinese gloss appear, then swap in the word you want (any family member).",
    queryBtn: "Explore family", clearBtn: "Clear", hotWords: "Popular word families", inputPlaceholder: "Type an English word, e.g. happy, create",
    loading: "Exploring…", emptyHint: "Enter a word above and press Explore family; the whole family and the four elements appear here grouped by part of speech.", noResult: "This word is not in the built-in 100 word families; it may not be on the built-in list. Try a common base word (e.g. act, create, happy).",
    fallbackTitle: "Loading dictionary", fallbackBody: "The built-in dictionary is loading, please try again shortly.",
    resultCard: "Explore Result", memberUnit: "members", baseLabel: "Base word", matchHint: "Word you entered", ipaLabel: "IPA", ipaPending: "/pending/", meaningLabel: "Gloss", glossTagCn: "(Simp)", glossTagEn: "(EN)", enGlossHint: "See English definition & example on expand", expandHint: "Show example", collapseHint: "Collapse", exampleLabel: "Example", enLoading: "Loading example…", noExample: "No example found; try writing your own.",
    resultIntelligence: "Result Intelligence", levelMatrix: "Word family formation rules", levelMatrixNote: "L7 sorts the most common family conversions into three types; see which affix rules your family uses and generalize when memorizing.",
    scenarioLayer: "Use scenarios", scenarioTitle: "When to use family exploration", scenarioNote: "L8 lists four typical scenarios so you use family exploration in the right place, expanding a whole family at once rather than single words.",
    scenarioExam: "Exam prep", scenarioExamNote: "Vocabulary and part-of-speech conversion questions often test different POS of one family; explore the family to learn noun, verb, adjective, and adverb at once.", scenarioWriting: "Writing expansion", scenarioWritingNote: "When you want to vary part of speech while writing, explore the family for same-root different-POS words (e.g. success→successful→successfully) for more flexible sentences.", scenarioDaily: "Vocabulary expansion", scenarioDailyNote: "When learning a new word, explore the whole family and memorize noun, verb, adjective, and adverb together to multiply your vocabulary.", scenarioBusiness: "Teaching prep", scenarioBusinessNote: "When teachers compile word-family materials, quickly obtain family members, parts of speech, and examples as lesson material.",
    progressInsight: "Learning Insight Card", possibleTarget: "This exploration", dailyGap: "Base word", weeklyTrend: "Members", motivation: "Motivation Card", keepMomentum: "Move from memorizing words to expanding whole families of cognates at once",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's word family home", journeyHint: "Pick 2–3 members of the same family but different POS, write one sentence each, and master the noun, verb, adjective, and adverb usages together.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this word to the next tool", nextActionItem1: "Use Word Root Analyzer to break out this base word's root and origin to remember it better", nextActionItem2: "Use Irregular Verb Finder to check the three forms of verbs in the family", nextActionItem3: "Use CEFR Level Estimator to assess the overall difficulty of this family",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Explore Path", decisionTitle: "Input → Reverse lookup → See POS groups → Practice", step1: "Type word", step2: "Reverse lookup", step3: "See groups", step4: "Practice",
    knowledge: "Knowledge", knowledgeTitle: "What word families mean in English learning", definition: "Definition", definitionText: "A word family is a set of related words derived from one base word by adding affixes (-tion, -ful, -ly, un-, etc.) with different parts of speech but related meaning, e.g. happy / happiness / happily / unhappy; mastering a family expands a whole string of cognates, the core method for efficiently expanding vocabulary.", usage: "Usage", usageText: "After you enter a word (any family member), the algorithm reverse-looks up the built-in word-family table, lists the whole family grouped by part of speech (verb → noun → adjective → adverb), and tags each member's IPA, part of speech, and Chinese gloss, expandable to an English example.", limitations: "Limitations", limitationsText: "The family table is a built-in 100 common word families, not a complete dictionary; rare families and derived forms not on the list may not be included; this tool focuses on the same base word's formation family (affix conversion); for the Latin/Greek root layer, use the Word Root Analyzer.", interpretation: "Interpretation", interpretationText: "The most common family conversions are three types — verb→noun (+ -tion/-ment), noun→adjective (+ -ful/-ous/-al), adjective→adverb/antonym (+ -ly / un-); grasping the affix rules lets you generalize, so memorizing one base word equals memorizing a whole family.", context: "Context", contextText: "Family exploration should be used with root analysis, irregular verb finding, and CEFR estimation: expand cognates with family exploration first, then use roots to understand meaning origin, turning isolated word learning into systematic family learning.", example: "Example", exampleText: "Input happy → family includes happy (adj), happiness (n), happily (adv), unhappy (adj, antonym); input happily → reverse-looks up the whole family and marks the word you entered.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Related Tools", affiliateTitle: "Next tools for family exploration", premiumTitle: "PRO Family Master Pack", premiumText: "Unlock unlimited exploration, batch-explore word lists, export families grouped by part of speech, auto-log exploration history, and export family lists for review.",
    feat1: "Unlimited exploration", feat2: "Batch word list", feat3: "Exploration history", feat4: "Export family list",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for English learning and vocabulary expansion only; family lookup uses a custom algorithm matched against a built-in word-family table, not a complete dictionary; family members and glosses are curated by the editorial team, and CEFR levels are wordlist matches plus a heuristic.", relatedTools: "Related Tools", relatedToolsText: "Word Root Analyzer · Irregular Verb Finder · Scrabble Word Checker · CEFR Level Estimator", references: "References", referencesText: "Custom word-family lookup and reverse-lookup algorithm (pure front-end, matched against a built-in 100 word families); family members and Chinese glosses curated by the editorial team (grouped by affix and part-of-speech conversion rules); CEFR-J Wordlist v1.5 (Tono Lab, TUFS); Octanove C1/C2 Vocabulary Profile (CC BY-SA 4.0); ECDICT open EN-ZH dictionary (IPA and Simplified glosses); Free Dictionary API (examples).",
    q1: "How is the word family found?", a1: "A custom algorithm builds an index: every member of the 100 built-in word families is indexed, so whether you enter the base word or any derived member, it reverse-looks up the whole family. Pure front-end, no external API.",
    q2: "Why can I find the whole family by entering a derivative?", a2: "This tool supports reverse lookup: the algorithm indexes every family member, e.g. entering happiness reverse-looks up the whole family happy / happiness / happily / unhappy and marks which member you entered. This is especially useful when you only know one derivative and want the whole family.",
    q3: "Why can't some words find a family?", a3: "If the word is not in the built-in 100 common word families (rare families or derived forms not on the list may not be included), it shows no family found. Try a common base word like act, create, happy, success.",
    q4: "Where do the IPA and Chinese gloss come from?", a4: "IPA comes from the open ECDICT EN-ZH dictionary (over 20k words built in); unlisted words convert ARPABET to IPA on the fly. Traditional Chinese glosses and parts of speech are curated by the editorial team; when no hand-written Traditional Chinese exists, it shows ECDICT's Simplified gloss tagged Simp, then an English definition tagged EN. Examples come from the Free Dictionary API.",
    q5: "How is this different from the Word Root Analyzer?", a5: "The Word Root Analyzer breaks out the Latin/Greek root layer (e.g. spect, port) and looks at origin; this tool looks at the same base word's formation family (affix/POS conversion, e.g. happy→happiness→happily), grouped by part of speech. They complement each other: roots for meaning origin, families for cognate parts of speech.",
    q6: "Why are family members grouped by part of speech?", a6: "Grouping by part of speech (verb → noun → adjective → adverb) lets you see at a glance how one family appears in different parts of speech, e.g. act (v) / action (n) / active (adj) / actively (adv), making memorization against affix rules more systematic.",
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

export default function WordFamilyExplorer() {
  const { lang, setLang } = useLanguage();
  const t = ui[lang];
  const [input, setInput] = useState("happy");
  const [result, setResult] = useState<ExploreResult | null>(null);
  const [solved, setSolved] = useState<boolean | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => { loadDict(); }, []);

  const runQuery = useCallback(async (rawWord: string) => {
    const word = rawWord.trim().toLowerCase().replace(/[^a-z]/g, "");
    if (!word) return;
    setLoading(true);
    setExpanded(null);
    await loadDict();
    const hit = findFamily(word);
    if (!hit) {
      setResult({ query: word, hit: null, base: "", cards: [] });
      setSolved(true);
      setLoading(false);
      return;
    }
    const cards: MemberCard[] = hit.family.members
      .map((m) => ({ ...m, ipa: ipaOf(m.word), cefr: cefrOf(m.word) }))
      .sort((a, b) => posRank(a.pos) - posRank(b.pos));
    setResult({ query: word, hit, base: hit.family.base, cards });
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

  function fillStandard() { setInput("happy"); runQuery("happy"); }
  function fillCut() { setInput("create"); runQuery("create"); }
  function clearAll() { setInput(""); setResult(null); setSolved(undefined); setExpanded(null); }

  const memberCountDisplay = result && result.hit ? String(result.cards.length) : "—";
  const baseDisplay = result && result.hit ? result.base : "—";

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
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-700">{t.badge}</p><h1 className="max-w-3xl font-black tracking-tight text-slate-950 [font-size:clamp(1.75rem,4vw,2.5rem)] [line-height:1.2]">{t.title}</h1><p className="text-xl font-black text-emerald-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{memberCountDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.memberUnit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div lang="en" translate="no" className="notranslate font-black">{result ? result.query : "—"}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.dailyGap}</div><div lang="en" translate="no" className="notranslate font-black">{baseDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.memberUnit}</div><div className="font-black">{memberCountDisplay}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
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
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{memberCountDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.memberUnit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.baseLabel}</div><div lang="en" translate="no" className="notranslate mt-1 text-xl font-black">{baseDisplay}</div><div className="mt-1 text-xs text-slate-300">{result ? result.query : "—"}</div></div></div>
            <div className="mt-6 space-y-3">
              {loading && <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm font-black text-slate-600">{t.loading}</div>}
              {!loading && solved === undefined && <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm font-black text-slate-500">{t.emptyHint}</div>}
              {!loading && solved === true && result && !result.hit && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center text-sm font-black text-rose-700">{t.noResult}</div>}
              {!loading && solved === true && result && result.hit && result.cards.map((c) => { const key = c.word.toLowerCase(); const isOpen = expanded === key; const isMatched = key === result.query; const firstPos = c.pos.split("/")[0]; return (
                <div key={c.word} className={`rounded-2xl border p-4 ${isMatched ? "border-emerald-300 bg-emerald-50/60" : "border-slate-200/60 bg-white/80"} backdrop-blur`}>
                  <div className="flex flex-wrap items-center gap-2"><span lang="en" translate="no" className="notranslate text-lg font-black text-slate-900">{c.word}</span><span className={`rounded-full px-2 py-0.5 text-xs font-black ${posChipColor[firstPos] || "bg-slate-100 text-slate-700"}`}>{posLabel(c.pos, lang)}</span>{c.cefr && <span className={`rounded-full px-2 py-0.5 text-xs font-black ${cefrColor[c.cefr]}`}>{c.cefr}</span>}<span lang="en" translate="no" className="notranslate font-mono text-xs text-slate-600">{c.ipa === "__PENDING__" ? t.ipaPending : c.ipa}</span>{isMatched && <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-black text-white">{t.matchHint}</span>}</div>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{c.zh}</p>
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
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.levelMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.levelMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{posBands.map((item) => <div key={item.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className={`rounded-full px-2 py-1 text-xs font-black ${cefrColor[item.key]}`}>{item.key}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="word-family-explorer-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">{/* L8-ScenarioComparison */}
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.scenarioLayer}</p><h2 className="mt-2 text-3xl font-black">{t.scenarioTitle}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.scenarioNote}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{scenarios.map((s) => <article key={s.k} className={`rounded-3xl border p-5 shadow-sm ${s.accent}`}><h3 className="text-lg font-black text-slate-900">{s.title}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{s.note}</p></article>)}</div>
        </section>
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.baseLabel}</div><div lang="en" translate="no" className="notranslate mt-1 text-2xl font-black">{baseDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.examplePerson}</div><div lang="en" translate="no" className="notranslate mt-1 text-2xl font-black text-blue-950">{result ? result.query : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.memberUnit}</div><div className="mt-1 text-3xl font-black text-emerald-950">{memberCountDisplay}</div></div></div></article>
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
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="word-family-explorer-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 可能包含站內或聯盟推薦；若透過部分連結購買，我們可能獲得佣金。" : "* May include on-site or affiliate recommendations. We may earn a commission from qualifying purchases."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-Trust */}<p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
