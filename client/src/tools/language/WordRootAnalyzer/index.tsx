// @profile B
// Profile B · Language-Hub 自建演算法 · WordRootAnalyzer（GOLD-STANDARD MacroCalculator compatible）
// 字根分析器：自建「字根拆解 + 語源辨識 + 衍生字族」演算法（單一單字輸入，單一豐富結果卡）。
//   原理：輸入單字 → 比對內建 81 筆字根表（拉丁/希臘語源）找出含有的字根 → 顯示字根、語源、中文義 + 衍生字族（每字附四要素）
//   差異：word-unscrambler/finder 是「找字」、scrabble-checker 是「驗字算分」；本工具是「拆字根、溯語源、展字族」，比 vocabulary-dna-engine 更深的字根層，不做同義/聯想。
//   三層中文釋義(繁體優先→ECDICT簡體標「簡」→英文定義標EN) + ARPABET→IPA 全照 gold 範本。四要素鐵律：① KK音標 ② 詞類 ③ 釋義 ④ 例句。

import { useMemo, useState, useCallback, useEffect } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";
import rootsData from "./wordRoots.json";

type RootEntry = { root: string; origin: string; originZh: string; meaningZh: string; derivatives: string[]; example: string };
const ROOTS: RootEntry[] = rootsData as RootEntry[];

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

// ============================================================
// 自建「字根拆解 + 語源辨識」演算法（四要素鐵律）
//   ① 比對 81 筆字根表，找出輸入單字含有的字根（依字根長度由長到短，避免短字根誤判）
//   ② 回傳命中的字根 + 語源 + 中文義 + 衍生字族
// ============================================================
// 依字根長度降冪排序，長字根優先命中（如 spect 優先於 spec 子片段）
const ROOTS_SORTED = [...ROOTS].sort((a, b) => b.root.length - a.root.length);

type RootHit = RootEntry & { matchIndex: number };
function analyzeRoots(rawWord: string): RootHit[] {
  const word = rawWord.trim().toLowerCase().replace(/[^a-z]/g, "");
  if (!word) return [];
  const hits: RootHit[] = [];
  const seenRoots = new Set<string>();
  for (const r of ROOTS_SORTED) {
    const idx = word.indexOf(r.root);
    if (idx >= 0 && !seenRoots.has(r.root)) {
      seenRoots.add(r.root);
      hits.push({ ...r, matchIndex: idx });
    }
  }
  // 依在單字中出現的位置排序（字首→字尾），最多取 3 個字根避免過度拆解
  hits.sort((a, b) => a.matchIndex - b.matchIndex);
  return hits.slice(0, 3);
}

// ARPABET → 美式 IPA（dict 未帶 IPA 時的 fallback；本支主要直接讀 dict[3]）
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
const posMap: Record<string, LocalText> = {
  n: { zh: "名詞", en: "noun" }, v: { zh: "動詞", en: "verb" },
  adj: { zh: "形容詞", en: "adjective" }, adv: { zh: "副詞", en: "adverb" },
  prep: { zh: "介系詞", en: "preposition" }, pron: { zh: "代名詞", en: "pronoun" },
  conj: { zh: "連接詞", en: "conjunction" }, num: { zh: "數詞", en: "numeral" },
  art: { zh: "冠詞", en: "article" }, int: { zh: "感嘆詞", en: "interjection" },
  abbr: { zh: "縮寫", en: "abbreviation" }, u: { zh: "其他", en: "other" },
};
const POS_V = /(^|\b)(vt\.|vi\.|v\.)/;
const POS_ADJ = /(^|\b)(adj\.|a\.)/;
const POS_ADV = /(^|\b)(adv\.)/;
const POS_N = /(^|\b)(n\.)/;
const POS_PREP = /(^|\b)(prep\.)/;
const POS_PRON = /(^|\b)(pron\.)/;
const POS_CONJ = /(^|\b)(conj\.)/;
const POS_NUM = /(^|\b)(num\.)/;
const POS_ART = /(^|\b)(art\.)/;
const POS_INT = /(^|\b)(int\.|interj\.)/;
const POS_ABBR = /(^|\b)(abbr\.)/;
const POS_V_ZH = /\u52d5\u8a5e/;
const POS_ADJ_ZH = /\u5f62\u5bb9\u8a5e/;
const POS_ADV_ZH = /\u526f\u8a5e/;
const POS_N_ZH = /\u540d\u8a5e/;
function posFromGloss(gloss: string): string {
  if (!gloss) return "u";
  const g = gloss.trim();
  const order: { key: string; re: RegExp }[] = [
    { key: "n", re: POS_N }, { key: "v", re: POS_V }, { key: "adj", re: POS_ADJ },
    { key: "adv", re: POS_ADV }, { key: "prep", re: POS_PREP }, { key: "pron", re: POS_PRON },
    { key: "conj", re: POS_CONJ }, { key: "num", re: POS_NUM }, { key: "art", re: POS_ART },
    { key: "int", re: POS_INT }, { key: "abbr", re: POS_ABBR },
  ];
  let best = "u"; let bestIdx = Infinity;
  for (const o of order) { const m = o.re.exec(g); if (m && m.index < bestIdx) { bestIdx = m.index; best = o.key; } }
  if (best !== "u") return best;
  if (POS_N_ZH.test(g)) return "n";
  if (POS_V_ZH.test(g)) return "v";
  if (POS_ADJ_ZH.test(g)) return "adj";
  if (POS_ADV_ZH.test(g)) return "adv";
  return "u";
}

type MeaningSrc = "tw" | "cn" | "none";
type WordCard = {
  word: string; cefr: Cefr; posKey: string; ipa: string; meaningZh: string; meaningSrc: MeaningSrc;
  exampleEn?: string; exampleZh?: string; defEn?: string; enriched?: boolean;
};

// 由詞庫建一張四要素字卡（衍生字 / 例字共用）
function buildCard(rawWord: string): WordCard {
  const word = rawWord.trim().toLowerCase();
  const dict = DICT ? DICT[word] : undefined;
  const cefr: Cefr = dict && dict[0] ? (dict[0] as Cefr) : lenToCefr(word.length);
  const zhTw = dict && dict[1] ? dict[1] : "";
  const zhCn = dict && dict[2] ? dict[2] : "";
  const ipa = dict && dict[3] ? normIpa(dict[3]) : "__PENDING__";
  const posKey = posFromGloss(zhTw || zhCn);
  let meaningZh = "", meaningSrc: MeaningSrc = "none";
  if (zhTw) { meaningZh = zhTw; meaningSrc = "tw"; }
  else if (zhCn) { meaningZh = zhCn; meaningSrc = "cn"; }
  return { word, cefr, posKey, ipa, meaningZh, meaningSrc };
}

type AnalyzeResult = {
  query: string;
  hits: RootHit[];
  cards: Record<string, WordCard>; // key=衍生字/例字 lowercase
};

const cefrColor: Record<string, string> = {
  A1: "bg-emerald-100 text-emerald-800", A2: "bg-emerald-100 text-emerald-800",
  B1: "bg-sky-100 text-sky-800", B2: "bg-sky-100 text-sky-800",
  C1: "bg-violet-100 text-violet-800", C2: "bg-violet-100 text-violet-800",
};
const HOT_WORDS = ["inspect", "transport", "telephone", "biography", "structure", "predict"] as const;

const originBands = [
  { key: "A1", label: { zh: "拉丁語源", en: "Latin origin" }, desc: { zh: "spect（看）、port（搬運）、dict（說）等多數源自拉丁文，是英文學術與正式詞彙的主幹。", en: "spect (see), port (carry), dict (say) and most roots come from Latin, the backbone of academic and formal English." } },
  { key: "B1", label: { zh: "希臘語源", en: "Greek origin" }, desc: { zh: "graph（寫）、phon（聲）、bio（生命）、tele（遠）等源自希臘文，常見於科學與科技詞彙。", en: "graph (write), phon (sound), bio (life), tele (far) come from Greek, common in scientific and technical terms." } },
  { key: "C1", label: { zh: "字根 (root)", en: "Root" }, desc: { zh: "字根是單字的核心意義來源，掌握字根能一次理解整個字族，比死背更牢固。", en: "A root is the core meaning source of a word; mastering roots lets you understand a whole word family at once, more durable than rote memory." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "Scrabble 單字驗證", en: "Scrabble Word Checker" }, href: "/tools/language/scrabble-word-checker" },
  { label: { zh: "字母重組器", en: "Word Unscrambler" }, href: "/tools/language/word-unscrambler" },
  { label: { zh: "找字工具", en: "Word Finder" }, href: "/tools/language/word-finder" },
  { label: { zh: "CEFR 等級估算", en: "CEFR Level Estimator" }, href: "/tools/language/cefr-level-estimator" },
];

const ui = {
  zh: {
    badge: "語言 · 字根分析器 · Language Hub", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "字根分析器 · Word Root Analyzer", subtitle: "輸入一個英文單字，拆解它含有的字根、辨識它的拉丁／希臘語源、理解字根的中文核心義，並展開同字根的衍生字族，每個衍生字都附上 KK 音標、詞類、繁中釋義與例句",
    intro: "字根分析器採用自建的「字根拆解 + 語源辨識 + 衍生字族」演算法：輸入一個英文單字後，工具會比對內建 81 筆常用字根表（拉丁與希臘語源），找出這個單字含有的字根，列出字根的語源（拉丁／希臘）、中文核心義，並展開同字根的衍生字族；每一個衍生字都會建一張四要素字卡，標註 KK 音標、詞類、繁體中文釋義與例句，讓你一次掌握一整串同源單字。本工具為純前端演算法，字根拆解不依賴外部 API，速度快、離線可用。",
    trustNoteLabel: "資料來源：", trustNote: "字根拆解以自建演算法比對內建 81 筆字根表產生（純前端，不依賴外部 API）；字根語源、中文核心義與衍生字族由編輯團隊人工整理（拉丁／希臘語源參照標準字源學）；衍生字的 CEFR 等級以 CEFR-J 與 Octanove 權威詞表對照；中文釋義以編輯團隊人工撰寫的繁體中文為優先，尚無繁體者改顯示 ECDICT 開源詞典的簡體釋義（標註「簡」），繁簡皆無者展開即顯示英文定義；IPA 音標取自 ECDICT 與 ARPABET 轉換；例句來自 Free Dictionary API。僅供學習與參考。",
    quickActionCard: "快速分析卡", tryExample: "分析 inspect", examplePreview: "命中字根數", examplePerson: "分析單字", fillExample: "分析單字 inspect", previewActivePath: "分析單字 transport",
    examplesCalculator: "範例 → 分析", enterValues: "輸入單字", examplesHelper: "先用熱門範例了解字根拆解、語源辨識與衍生字族如何呈現，再換成你自己想分析的單字。",
    queryBtn: "拆解字根", clearBtn: "清除", hotWords: "熱門字根單字", inputPlaceholder: "輸入一個英文單字，例如 inspect",
    loading: "拆解中…", emptyHint: "輸入上方單字並按「拆解字根」，命中的字根、語源與衍生字族會顯示在這裡。", noResult: "在內建 81 筆字根表中找不到這個單字含有的字根，它可能是日耳曼語源或不規則字，建議換一個含拉丁／希臘字根的單字試試。",
    fallbackTitle: "詞庫載入中", fallbackBody: "正在載入內建詞庫，請稍候再試一次。",
    resultCard: "分析結果", rootUnit: "個字根", rootLabel: "命中字根", originLabel: "語源", meaningRootLabel: "字根核心義", derivativesLabel: "衍生字族", exampleRootLabel: "代表字", ipaLabel: "音標", ipaPending: "/音標整理中/", meaningLabel: "釋義", glossTagCn: "(簡)", glossTagEn: "(EN)", enGlossHint: "展開看英文定義與例句", expandHint: "展開看例句", collapseHint: "收合", exampleLabel: "例句", enLoading: "載入例句中…", noExample: "查無例句，建議造句練習。",
    resultIntelligence: "結果解讀", levelMatrix: "字根語源知識", levelMatrixNote: "L7 說明字根的兩大語源（拉丁與希臘）以及字根對英語學習的價值；分析時看你這個字的字根來自哪個語系。",
    scenarioLayer: "使用場景", scenarioTitle: "什麼時候用字根分析", scenarioNote: "L8 列出四個典型場景，把字根分析用在對的地方，而不是死背單字。",
    scenarioExam: "考試備考", scenarioExamNote: "TOEFL、IELTS、GRE 遇到生字時，拆字根猜詞義，再記整個字族，一次背一串而非一個。", scenarioWriting: "深度記憶", scenarioWritingNote: "新學單字時拆出字根與語源，連結同字根的字族，建立有邏輯的記憶網而非孤立死記。", scenarioDaily: "閱讀理解", scenarioDailyNote: "閱讀遇到不認識的長字，先拆字根推測大意，再查證釋義，提升閱讀流暢度。", scenarioBusiness: "教學備課", scenarioBusinessNote: "老師整理字根字族教材時，快速取得字根語源、核心義與衍生字清單作為教案素材。",
    progressInsight: "學習洞察卡", possibleTarget: "本次拆解", dailyGap: "主要語源", weeklyTrend: "衍生字數", motivation: "動力卡", keepMomentum: "從死背單字走向用字根理解整個字族",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天拆出的字族帶回家", journeyHint: "挑 2–3 個同字根的衍生字查釋義並造句，一次背一整串同源單字，記得更牢。",
    nextActionLabel: "下一步行動", nextActionTitle: "把這個字接到下一個工具", nextActionItem1: "用 Scrabble 單字驗證確認衍生字是否為合法單字並算分", nextActionItem2: "用字母重組器把這個字的字母重組成其他單字", nextActionItem3: "用 CEFR 等級估算評估這串字族的整體難度等級",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "分析路徑", decisionTitle: "輸入 → 拆字根 → 溯語源 → 展字族", step1: "輸入單字", step2: "拆字根", step3: "溯語源", step4: "展字族",
    knowledge: "知識", knowledgeTitle: "字根分析在英語學習中的意義", definition: "定義", definitionText: "字根分析是把一個英文單字拆解成它的字根（root），辨識字根的語源（拉丁或希臘），並理解字根的核心意義；掌握字根就能一次理解整個同源字族，是高效擴充字彙的核心方法。", usage: "用法", usageText: "輸入一個單字後，演算法比對內建字根表找出這個字含有的字根，列出字根的語源、中文核心義，並展開同字根的衍生字族；每個衍生字都附 KK 音標、詞類、繁中釋義與例句，可展開看英文例句。", limitations: "限制", limitationsText: "本工具的字根表為內建 81 筆常用拉丁／希臘字根，並非完整字源學詞典；日耳曼語源、不規則字或極罕見字根未必收錄；字根拆解以字面比對為主，少數同形異義字根可能需要人工判斷。", interpretation: "解讀", interpretationText: "命中字根越多、語源越清楚的字，越容易透過字族擴充記憶；如 transport 拆出 trans（橫越）+ port（搬運）即可推知「運輸」。建議連同衍生字族一起記，效益最大。", context: "脈絡", contextText: "字根分析應與單字驗證、字母重組、CEFR 估算一起用：拆出字根理解語義來源後，用衍生字族擴充字彙，再用其他工具驗證與評估難度，把單字學習變成有系統的字族學習。", example: "範例", exampleText: "輸入 inspect → 拆出 spect（拉丁文 specere，看）；衍生字族包含 inspect、respect、spectator、perspective、spectacle，全部與「看」有關。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "相關工具", affiliateTitle: "字根分析的下一步工具", premiumTitle: "PRO 字根大師包", premiumText: "解鎖無限分析、批次拆解單字表、依字根分組匯出字族、自動記錄分析歷史，並把字族清單匯出複習。",
    feat1: "無限分析次數", feat2: "批次拆解字表", feat3: "分析歷史記錄", feat4: "字族清單匯出",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供英語學習與字彙擴充用途；字根拆解以自建演算法比對內建字根表，並非完整字源學詞典；字根語源與衍生字族由編輯團隊人工整理，CEFR 等級為詞表對照與啟發式推估。", relatedTools: "相關工具", relatedToolsText: "Scrabble Word Checker · Word Unscrambler · Word Finder · CEFR Level Estimator", references: "參考資料", referencesText: "自建「字根拆解 + 語源辨識」演算法（純前端，比對內建 81 筆字根表）；字根語源與衍生字族由編輯團隊人工整理（參照標準字源學）；CEFR-J Wordlist v1.5（Tono Lab, TUFS）；Octanove C1/C2 Vocabulary Profile（CC BY-SA 4.0）；ECDICT 開源英漢詞典（IPA 音標與簡體釋義）；繁體中文釋義由編輯團隊人工撰寫；Free Dictionary API（例句）。",
    q1: "字根是怎麼拆解出來的？", a1: "用自建演算法把你輸入的單字比對內建 81 筆常用字根表：依字根長度由長到短掃描，找出單字中含有的字根並依出現位置排序，最多顯示 3 個字根避免過度拆解。純前端判定，不需連外部 API。",
    q2: "字根的語源（拉丁／希臘）怎麼判斷？", a2: "每一筆字根都由編輯團隊人工標註語源與中文核心義：多數學術與正式詞彙的字根源自拉丁文（如 spect、port、dict），科學與科技詞彙的字根常源自希臘文（如 graph、phon、bio、tele）。結果卡會標出該字根的語源與原文。",
    q3: "為什麼有些單字分析為查無字根？", a3: "若該字不含內建 81 筆字根表中的任何字根（日耳曼語源、不規則字或極罕見字根未必收錄），就會顯示查無字根。這不代表它沒有字源，只是不在內建常用字根表中，建議換一個含拉丁／希臘字根的單字。",
    q4: "音標和中文釋義從哪來？", a4: "衍生字的 IPA 音標取自 ECDICT 開源英漢詞典（內建 2 萬餘字），詞庫未收錄者改以 ARPABET 即時轉換 IPA；中文釋義採三層優先序——編輯團隊人工撰寫的繁體中文優先（無標註），尚無繁體者改顯示 ECDICT 簡體釋義並標註「簡」，繁簡皆無者展開即顯示英文定義（標註 EN）。全程不經機器翻譯。例句來自 Free Dictionary API。",
    q5: "本工具和「CEFR 等級估算」有什麼不同？", a5: "CEFR 估算是評估單字或文本的難度等級；本工具是「拆字根、溯語源、展字族」，比同義／聯想更深入到字根層，幫你從一個字理解一整串同源單字，是擴充字彙的根本方法。",
    q6: "一個字拆出多個字根代表什麼？", a6: "許多英文字由「字首 + 字根 + 字尾」組成，例如 transport 含 trans（橫越）與 port（搬運）。本工具最多顯示 3 個命中字根並依出現位置排序，幫你看懂這個字是由哪些語義積木組成的。",
  },
  en: {
    badge: "Language · Word Root Analyzer · Language Hub", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Word Root Analyzer", subtitle: "Type an English word to break out its roots, identify their Latin or Greek origin, understand each root's core meaning in Chinese, and expand the same-root word family — every derivative comes with IPA, part of speech, Chinese gloss, and an example sentence",
    intro: "The Word Root Analyzer uses a custom root-decomposition, origin-identification, and word-family algorithm: after you type a word, it matches it against a built-in 81-root table (Latin and Greek origins), finds the roots the word contains, lists each root's origin (Latin/Greek) and core Chinese meaning, and expands the same-root word family; every derivative gets a four-element card with IPA, part of speech, Traditional Chinese gloss, and an example, so you master a whole string of cognate words at once. This tool is a pure front-end algorithm; root decomposition uses no external API, so it is fast and works offline.",
    trustNoteLabel: "Data source:", trustNote: "Root decomposition is produced by a custom algorithm matched against a built-in 81-root table (pure front-end, no external API); root origins, core Chinese meanings, and word families are curated by the editorial team (Latin/Greek origins follow standard etymology); derivatives' CEFR levels are matched against the CEFR-J and Octanove authoritative wordlists; Chinese glosses prioritize the editorial team's hand-written Traditional Chinese, falling back to ECDICT's Simplified gloss (tagged Simp) when none exists, and to an English definition when neither is available; IPA comes from ECDICT and ARPABET conversion; examples come from the Free Dictionary API. For study and reference only.",
    quickActionCard: "Quick Analysis Card", tryExample: "Analyze inspect", examplePreview: "Roots found", examplePerson: "Analyzed word", fillExample: "Analyze inspect", previewActivePath: "Analyze transport",
    examplesCalculator: "Examples → Analyze", enterValues: "Enter a word", examplesHelper: "Start with a popular example to see how root decomposition, origin identification, and the word family appear, then swap in the word you want to analyze.",
    queryBtn: "Break down roots", clearBtn: "Clear", hotWords: "Popular root words", inputPlaceholder: "Type an English word, e.g. inspect",
    loading: "Analyzing…", emptyHint: "Enter a word above and press Break down roots; the matched roots, origins, and word family appear here.", noResult: "No root from the built-in 81-root table was found in this word; it may be of Germanic origin or irregular. Try a word with a Latin/Greek root.",
    fallbackTitle: "Loading dictionary", fallbackBody: "The built-in dictionary is loading, please try again shortly.",
    resultCard: "Analysis Result", rootUnit: "roots", rootLabel: "Roots found", originLabel: "Origin", meaningRootLabel: "Root core meaning", derivativesLabel: "Word family", exampleRootLabel: "Representative word", ipaLabel: "IPA", ipaPending: "/pending/", meaningLabel: "Gloss", glossTagCn: "(Simp)", glossTagEn: "(EN)", enGlossHint: "See English definition & example on expand", expandHint: "Show example", collapseHint: "Collapse", exampleLabel: "Example", enLoading: "Loading example…", noExample: "No example found; try writing your own.",
    resultIntelligence: "Result Intelligence", levelMatrix: "Root origin knowledge", levelMatrixNote: "L7 explains the two major root origins (Latin and Greek) and the value of roots for English learning; when analyzing, see which language family your word's root comes from.",
    scenarioLayer: "Use scenarios", scenarioTitle: "When to use root analysis", scenarioNote: "L8 lists four typical scenarios so you use root analysis in the right place rather than rote memorization.",
    scenarioExam: "Exam prep", scenarioExamNote: "When meeting unknown words in TOEFL, IELTS, or GRE, break out the root to guess meaning, then memorize the whole family — one string at a time, not one word.", scenarioWriting: "Deep memory", scenarioWritingNote: "When learning a new word, break out its root and origin and link the same-root family to build a logical memory network instead of isolated rote.", scenarioDaily: "Reading comprehension", scenarioDailyNote: "When you meet a long unknown word while reading, break out the root to guess the gist, then verify the gloss, improving reading fluency.", scenarioBusiness: "Teaching prep", scenarioBusinessNote: "When teachers compile root-family teaching materials, quickly obtain root origins, core meanings, and derivative lists as lesson material.",
    progressInsight: "Learning Insight Card", possibleTarget: "This breakdown", dailyGap: "Main origin", weeklyTrend: "Derivatives", motivation: "Motivation Card", keepMomentum: "Move from rote word memorization to understanding whole families through roots",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's word family home", journeyHint: "Pick 2–3 same-root derivatives, look up their glosses, and make sentences; memorize a whole string of cognate words at once.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this word to the next tool", nextActionItem1: "Use Scrabble Word Checker to verify whether a derivative is a valid word and score it", nextActionItem2: "Use Word Unscrambler to rearrange this word's letters into other words", nextActionItem3: "Use CEFR Level Estimator to assess the overall difficulty of this word family",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Analysis Path", decisionTitle: "Input → Break roots → Trace origin → Expand family", step1: "Type word", step2: "Break roots", step3: "Trace origin", step4: "Expand family",
    knowledge: "Knowledge", knowledgeTitle: "What root analysis means in English learning", definition: "Definition", definitionText: "Root analysis breaks an English word into its roots, identifies each root's origin (Latin or Greek), and understands its core meaning; mastering a root lets you understand a whole cognate family at once, the core method for efficiently expanding vocabulary.", usage: "Usage", usageText: "After you enter a word, the algorithm matches it against the built-in root table to find the roots it contains, lists each root's origin and core Chinese meaning, and expands the same-root family; every derivative comes with IPA, part of speech, Chinese gloss, and an example, expandable to an English example.", limitations: "Limitations", limitationsText: "The root table is a built-in 81-root list of common Latin/Greek roots, not a complete etymological dictionary; Germanic origins, irregular words, or very rare roots may not be included; root decomposition is mainly literal matching, and a few homographic roots may need human judgment.", interpretation: "Interpretation", interpretationText: "Words with more matched roots and clearer origins are easier to memorize through families; e.g. transport breaks into trans (across) + port (carry), implying transport. Memorizing together with the word family yields the most benefit.", context: "Context", contextText: "Root analysis should be used with word checking, unscrambling, and CEFR estimation: after breaking out roots to understand meaning origin, expand vocabulary with the word family, then verify and assess difficulty with other tools, turning word learning into systematic family learning.", example: "Example", exampleText: "Input inspect → break out spect (Latin specere, to see); the word family includes inspect, respect, spectator, perspective, spectacle, all related to seeing.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Related Tools", affiliateTitle: "Next tools for root analysis", premiumTitle: "PRO Root Master Pack", premiumText: "Unlock unlimited analysis, batch-break word lists, export families grouped by root, auto-log analysis history, and export word-family lists for review.",
    feat1: "Unlimited analysis", feat2: "Batch word list", feat3: "Analysis history", feat4: "Export word family",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for English learning and vocabulary expansion only; root decomposition uses a custom algorithm matched against a built-in root table, not a complete etymological dictionary; root origins and word families are curated by the editorial team, and CEFR levels are wordlist matches plus a heuristic.", relatedTools: "Related Tools", relatedToolsText: "Scrabble Word Checker · Word Unscrambler · Word Finder · CEFR Level Estimator", references: "References", referencesText: "Custom root-decomposition and origin-identification algorithm (pure front-end, matched against a built-in 81-root table); root origins and word families curated by the editorial team (following standard etymology); CEFR-J Wordlist v1.5 (Tono Lab, TUFS); Octanove C1/C2 Vocabulary Profile (CC BY-SA 4.0); ECDICT open EN-ZH dictionary (IPA and Simplified glosses); Traditional Chinese glosses hand-written by the editorial team; Free Dictionary API (examples).",
    q1: "How are roots broken out?", a1: "A custom algorithm matches your input word against the built-in 81-root table: it scans from longest root to shortest, finds the roots the word contains, sorts them by position, and shows up to 3 roots to avoid over-decomposition. Pure front-end, no external API.",
    q2: "How is the root origin (Latin/Greek) determined?", a2: "Each root is hand-tagged by the editorial team with origin and core Chinese meaning: most academic and formal vocabulary roots come from Latin (e.g. spect, port, dict), while scientific and technical roots often come from Greek (e.g. graph, phon, bio, tele). The result card marks each root's origin and source word.",
    q3: "Why are some words shown as having no root?", a3: "If the word contains none of the roots in the built-in 81-root table (Germanic origins, irregular words, or very rare roots may not be included), it shows no root found. This does not mean it has no etymology, just that it is not in the built-in common-root table; try a word with a Latin/Greek root.",
    q4: "Where do the IPA and Chinese gloss come from?", a4: "Derivatives' IPA comes from the open ECDICT EN-ZH dictionary (over 20k words built in); unlisted words convert ARPABET to IPA on the fly. Chinese glosses use a three-tier priority — the editorial team's hand-written Traditional Chinese first (no tag), then ECDICT's Simplified gloss tagged Simp, then an English definition tagged EN. No machine translation is used. Examples come from the Free Dictionary API.",
    q5: "How is this different from the CEFR Level Estimator?", a5: "The CEFR estimator assesses the difficulty level of a word or text; this tool breaks out roots, traces origins, and expands families, going deeper to the root layer than synonyms or associations, helping you understand a whole string of cognates from one word — the fundamental method for expanding vocabulary.",
    q6: "What does it mean when a word has multiple roots?", a6: "Many English words are built from prefix + root + suffix, e.g. transport contains trans (across) and port (carry). This tool shows up to 3 matched roots sorted by position, helping you see which semantic building blocks make up the word.",
  },
} as const;

const faqKeys = [["q1", "a1"], ["q2", "a2"], ["q3", "a3"], ["q4", "a4"], ["q5", "a5"], ["q6", "a6"]] as const;

// dictionaryapi.dev — 取英文釋義 + 例句 + 詞性（懶載入，快取）
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

export default function WordRootAnalyzer() {
  const { lang, setLang } = useLanguage();
  const t = ui[lang];
  const [input, setInput] = useState("inspect");
  const [result, setResult] = useState<AnalyzeResult | null>(null);
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
    const hits = analyzeRoots(word);
    const cards: Record<string, WordCard> = {};
    for (const h of hits) {
      for (const d of h.derivatives) { const k = d.toLowerCase(); if (!cards[k]) cards[k] = buildCard(d); }
    }
    setResult({ query: word, hits, cards });
    setSolved(true);
    setLoading(false);
  }, []);

  const toggleExpand = useCallback(async (word: string) => {
    const key = word.toLowerCase();
    if (expanded === key) { setExpanded(null); return; }
    setExpanded(key);
    setResult((prev) => {
      if (!prev) return prev;
      const card = prev.cards[key];
      if (card && card.exampleEn !== undefined) return prev;
      return prev;
    });
    // 取例句（若尚未載入）
    setResult((prev) => prev); // trigger
    const current = result?.cards[key];
    if (current && current.exampleEn === undefined) {
      const ex = await fetchExample(key);
      setResult((prev) => {
        if (!prev) return prev;
        const c = prev.cards[key];
        if (!c) return prev;
        return { ...prev, cards: { ...prev.cards, [key]: { ...c, exampleEn: ex?.exampleEn || "", defEn: ex?.defEn || "", enriched: true } } };
      });
    }
  }, [expanded, result]);

  function fillStandard() { setInput("inspect"); runQuery("inspect"); }
  function fillCut() { setInput("transport"); runQuery("transport"); }
  function clearAll() { setInput(""); setResult(null); setSolved(undefined); setExpanded(null); }

  const rootCountDisplay = result ? String(result.hits.length) : "—";
  const mainOrigin = useMemo(() => {
    if (!result || result.hits.length === 0) return "—";
    return result.hits[0].origin;
  }, [result]);
  const derivCount = useMemo(() => {
    if (!result) return "—";
    return String(Object.keys(result.cards).length);
  }, [result]);

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{rootCountDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.rootUnit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div lang="en" translate="no" className="notranslate font-black">{result ? result.query : "—"}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.dailyGap}</div><div className="font-black">{mainOrigin}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="font-black">{derivCount}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
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
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{rootCountDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.rootUnit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.examplePerson}</div><div lang="en" translate="no" className="notranslate mt-1 text-xl font-black">{result ? result.query : "—"}</div><div className="mt-1 text-xs text-slate-300">{t.rootLabel}</div></div></div>
            <div className="mt-6 space-y-3">
              {loading && <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm font-black text-slate-600">{t.loading}</div>}
              {!loading && solved === undefined && <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm font-black text-slate-500">{t.emptyHint}</div>}
              {!loading && solved === true && result && result.hits.length === 0 && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center text-sm font-black text-rose-700">{t.noResult}</div>}
              {!loading && solved === true && result && result.hits.length > 0 && result.hits.map((h) => (
                <div key={h.root} className="rounded-2xl border border-slate-200/60 bg-white/80 p-4 backdrop-blur">
                  {/* 字根標頭：字根 + 語源 + 核心義 */}
                  <div className="flex flex-wrap items-center gap-3"><span lang="en" translate="no" className="notranslate text-2xl font-black text-emerald-800">{h.root}-</span><span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-black text-emerald-800">{t.originLabel}：{h.origin}</span></div>
                  <p className="mt-2 text-sm leading-6 text-slate-700"><span className="font-black text-slate-500">{t.meaningRootLabel}：</span>{h.meaningZh}　<span lang="en" translate="no" className="notranslate text-xs text-slate-500">{h.originZh}</span></p>
                  {/* 衍生字族（四要素字卡） */}
                  <div className="mt-3"><p className="text-xs font-black text-slate-400">{t.derivativesLabel}</p><div className="mt-2 space-y-2">{h.derivatives.map((d) => { const key = d.toLowerCase(); const card = result.cards[key]; const isOpen = expanded === key; return (
                    <div key={d} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex flex-wrap items-center gap-2"><span lang="en" translate="no" className="notranslate text-base font-black text-slate-900">{d}</span>{card && card.cefr && <span className={`rounded-full px-2 py-0.5 text-xs font-black ${cefrColor[card.cefr]}`}>{card.cefr}</span>}{card && <span className="text-xs font-black text-slate-500">{l(posMap[card.posKey] || posMap.u, lang)}</span>}{card && <span lang="en" translate="no" className="notranslate font-mono text-xs text-slate-600">{card.ipa === "__PENDING__" ? t.ipaPending : card.ipa}</span>}</div>
                      {card && (card.meaningSrc === "none"
                        ? <p className="mt-1 text-sm leading-6 text-slate-500">{t.enGlossHint}</p>
                        : <p className="mt-1 text-sm leading-6 text-slate-700">{card.meaningZh}{card.meaningSrc === "cn" && <span className="ml-1 text-xs font-black text-amber-600">{t.glossTagCn}</span>}</p>)}
                      <button type="button" onClick={() => toggleExpand(d)} className="mt-1 text-xs font-black text-emerald-700">{isOpen ? t.collapseHint : `▸ ${t.expandHint}`}</button>
                      {isOpen && card && (
                        <div className="mt-2 rounded-lg bg-white p-2">
                          {card.exampleEn === undefined
                            ? <p className="text-xs font-black text-slate-400">{t.enLoading}</p>
                            : card.exampleEn
                              ? (<><p className="text-xs font-black text-slate-400">{t.exampleLabel}</p><p lang="en" translate="no" className="notranslate mt-1 text-sm italic text-slate-700">{card.exampleEn}</p>{card.defEn && <p lang="en" translate="no" className="notranslate mt-1 text-xs text-slate-500">{card.defEn}</p>}</>)
                              : (card.defEn ? <p lang="en" translate="no" className="notranslate text-xs text-slate-500">{card.defEn}</p> : <p className="text-xs text-slate-400">{t.noExample}</p>)}
                        </div>
                      )}
                    </div>
                  ); })}</div></div>
                  <p className="mt-3 text-xs text-slate-500">{t.exampleRootLabel}：<span lang="en" translate="no" className="notranslate font-black text-slate-700">{h.example}</span></p>
                </div>
              ))}
            </div>
          </div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.levelMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.levelMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{originBands.map((item) => <div key={item.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className={`rounded-full px-2 py-1 text-xs font-black ${cefrColor[item.key]}`}>{item.key}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="word-root-analyzer-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">{/* L8-ScenarioComparison */}
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.scenarioLayer}</p><h2 className="mt-2 text-3xl font-black">{t.scenarioTitle}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.scenarioNote}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{scenarios.map((s) => <article key={s.k} className={`rounded-3xl border p-5 shadow-sm ${s.accent}`}><h3 className="text-lg font-black text-slate-900">{s.title}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{s.note}</p></article>)}</div>
        </section>
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.rootUnit}</div><div className="mt-1 text-3xl font-black">{rootCountDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-2xl font-black text-blue-950">{mainOrigin}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{derivCount}</div></div></div></article>
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
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="word-root-analyzer-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 相關 Language Hub 工具，免費使用。" : "* Related Language Hub tools, free to use."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-Trust */}<p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
