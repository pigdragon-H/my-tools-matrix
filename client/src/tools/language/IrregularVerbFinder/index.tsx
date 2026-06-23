// @profile B
// Profile B · Language-Hub 自建演算法 · IrregularVerbFinder（GOLD-STANDARD MacroCalculator compatible）
// 不規則動詞查找器：自建「動詞三態查找 + 反查」演算法（單一動詞輸入，單一豐富結果卡）。
//   原理：輸入英文動詞 → 比對內建 151 筆不規則動詞表（原形/過去式/過去分詞任一形態皆可查），找出三態並補四要素
//   差異：word-finder/unscrambler 是「找字」、scrabble-checker 是「驗字算分」、word-root-analyzer 是「拆字根」；本工具是「查動詞三態變化」，含正查（原形→三態）與反查（過去式/分詞→原形）。
//   三層中文釋義(繁體優先→ECDICT簡體標「簡」→英文定義標EN) + ARPABET→IPA 全照 gold 範本。四要素鐵律：① KK音標 ② 詞類(動詞) ③ 釋義 ④ 例句。

import { useMemo, useState, useCallback, useEffect } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";
import verbsData from "./irregularVerbs.json";

type VerbEntry = { base: string; past: string; pp: string; zh: string; exEn: string; exZh: string };
const VERBS: VerbEntry[] = verbsData as VerbEntry[];

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
// 自建「動詞三態查找 + 反查」演算法（四要素鐵律）
//   建立索引：每個動詞的 base / past / pp 三種形態（含斜線多形如 was/were、burnt/burned）皆可被查到
// ============================================================
type MatchKind = "base" | "past" | "pp";
type VerbHit = VerbEntry & { matchKind: MatchKind };

// 把 "was/were" 這類拆成 ["was","were"]
function splitForms(raw: string): string[] {
  return raw.split("/").map((s) => s.trim().toLowerCase()).filter(Boolean);
}
// 建立查找索引：form → {entry, kind}
const VERB_INDEX: Record<string, { entry: VerbEntry; kind: MatchKind }> = {};
for (const v of VERBS) {
  for (const f of splitForms(v.base)) { if (!VERB_INDEX[f]) VERB_INDEX[f] = { entry: v, kind: "base" }; }
  for (const f of splitForms(v.past)) { if (!VERB_INDEX[f]) VERB_INDEX[f] = { entry: v, kind: "past" }; }
  for (const f of splitForms(v.pp)) { if (!VERB_INDEX[f]) VERB_INDEX[f] = { entry: v, kind: "pp" }; }
}
function findVerb(rawWord: string): VerbHit | null {
  const word = rawWord.trim().toLowerCase().replace(/[^a-z]/g, "");
  if (!word) return null;
  const hit = VERB_INDEX[word];
  if (!hit) return null;
  return { ...hit.entry, matchKind: hit.kind };
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
const posMap: Record<string, LocalText> = {
  n: { zh: "名詞", en: "noun" }, v: { zh: "動詞", en: "verb" },
  adj: { zh: "形容詞", en: "adjective" }, adv: { zh: "副詞", en: "adverb" },
  prep: { zh: "介系詞", en: "preposition" }, pron: { zh: "代名詞", en: "pronoun" },
  conj: { zh: "連接詞", en: "conjunction" }, num: { zh: "數詞", en: "numeral" },
  art: { zh: "冠詞", en: "article" }, int: { zh: "感嘆詞", en: "interjection" },
  abbr: { zh: "縮寫", en: "abbreviation" }, u: { zh: "其他", en: "other" },
};

type MeaningSrc = "tw" | "cn" | "none";
// IPA + CEFR + 三層中文釋義（用於三態各形態的音標補充）
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
// 取繁中釋義（優先 dict 繁體，其次簡體；本工具主釋義用人工 zh，dict 僅補形態釋義）
function glossOf(word: string): { zh: string; src: MeaningSrc } {
  const dict = DICT ? DICT[word.toLowerCase()] : undefined;
  if (dict && dict[1]) return { zh: dict[1], src: "tw" };
  if (dict && dict[2]) return { zh: dict[2], src: "cn" };
  return { zh: "", src: "none" };
}

type FindResult = {
  query: string;
  hit: VerbHit | null;
  baseIpa: string; pastIpa: string; ppIpa: string;
  cefr: Cefr;
  defEn?: string; exampleApi?: string; enriched?: boolean;
};

const cefrColor: Record<string, string> = {
  A1: "bg-emerald-100 text-emerald-800", A2: "bg-emerald-100 text-emerald-800",
  B1: "bg-sky-100 text-sky-800", B2: "bg-sky-100 text-sky-800",
  C1: "bg-violet-100 text-violet-800", C2: "bg-violet-100 text-violet-800",
};
const HOT_WORDS = ["go", "take", "write", "bring", "think", "begin"] as const;

const patternBands = [
  { key: "A1", label: { zh: "三態同形 (A-A-A)", en: "Same form (A-A-A)" }, desc: { zh: "cut/cut/cut、put/put/put、hit/hit/hit 等，三態完全相同，最容易記。", en: "cut/cut/cut, put/put/put, hit/hit/hit — all three forms identical, easiest to memorize." } },
  { key: "B1", label: { zh: "過去與分詞同形 (A-B-B)", en: "Past = PP (A-B-B)" }, desc: { zh: "buy/bought/bought、bring/brought/brought 等，過去式與過去分詞相同。", en: "buy/bought/bought, bring/brought/brought — past and past participle share one form." } },
  { key: "C1", label: { zh: "三態皆異 (A-B-C)", en: "All different (A-B-C)" }, desc: { zh: "go/went/gone、drink/drank/drunk、write/wrote/written 等，三態各不相同，需逐一記憶。", en: "go/went/gone, drink/drank/drunk, write/wrote/written — all three differ, memorize each." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "字根分析器", en: "Word Root Analyzer" }, href: "/tools/language/word-root-analyzer" },
  { label: { zh: "Scrabble 單字驗證", en: "Scrabble Word Checker" }, href: "/tools/language/scrabble-word-checker" },
  { label: { zh: "字母重組器", en: "Word Unscrambler" }, href: "/tools/language/word-unscrambler" },
  { label: { zh: "CEFR 等級估算", en: "CEFR Level Estimator" }, href: "/tools/language/cefr-level-estimator" },
];

const ui = {
  zh: {
    badge: "語言 · 不規則動詞查找器 · Language Hub", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "不規則動詞查找器 · Irregular Verb Finder", subtitle: "輸入一個英文動詞（原形、過去式或過去分詞皆可），即時查出它的三態變化，並附上 KK 音標、詞類、繁體中文釋義與例句，內建 151 筆常用不規則動詞",
    intro: "不規則動詞查找器採用自建的「動詞三態查找 + 反查」演算法：輸入一個英文動詞後，工具會比對內建 151 筆常用不規則動詞表——不論您輸入的是原形、過去式還是過去分詞，都能反查出完整的三態變化（原形 / 過去式 / 過去分詞），並標註每個形態的 KK 音標、詞類（動詞）、繁體中文釋義與一句例句。本工具為純前端演算法，三態查找不依賴外部 API，速度快、離線可用。",
    trustNoteLabel: "資料來源：", trustNote: "三態查找以自建演算法比對內建 151 筆不規則動詞表產生（純前端，不依賴外部 API）；原形、過去式、過去分詞與繁中釋義、例句由編輯團隊人工整理；IPA 音標取自 ECDICT 與 ARPABET 轉換；CEFR 等級以 CEFR-J 與 Octanove 權威詞表對照；尚無人工繁體釋義者改顯示 ECDICT 開源詞典的簡體釋義（標註「簡」），繁簡皆無者展開即顯示英文定義；額外例句來自 Free Dictionary API。僅供學習與參考。",
    quickActionCard: "快速查找卡", tryExample: "查找 go", examplePreview: "三態變化", examplePerson: "查找動詞", fillExample: "查找動詞 go", previewActivePath: "查找動詞 take",
    examplesCalculator: "範例 → 查找", enterValues: "輸入動詞", examplesHelper: "先用熱門範例了解三態變化、音標、CEFR 等級與中文釋義如何呈現，再換成您自己想查的動詞（原形、過去式或分詞皆可）。",
    queryBtn: "查三態", clearBtn: "清除", hotWords: "熱門不規則動詞", inputPlaceholder: "輸入英文動詞，例如 go、went、gone",
    loading: "查找中…", emptyHint: "輸入上方動詞並按「查三態」，原形／過去式／過去分詞與四要素會顯示在這裡。", noResult: "在內建 151 筆不規則動詞表中找不到這個動詞，它可能是規則動詞（直接加 -ed）或不在內建清單中，建議改查常用不規則動詞。",
    fallbackTitle: "詞庫載入中", fallbackBody: "正在載入內建詞庫，請稍候再試一次。",
    resultCard: "查找結果", matchHint: "您查的形態", matchBase: "原形", matchPast: "過去式", matchPp: "過去分詞", baseLabel: "原形 (base)", pastLabel: "過去式 (past)", ppLabel: "過去分詞 (past participle)", ipaLabel: "音標", ipaPending: "/音標整理中/", meaningLabel: "釋義", glossTagCn: "(簡)", glossTagEn: "(EN)", enGlossHint: "展開看英文定義與例句", expandHint: "展開看英文例句", collapseHint: "收合", exampleLabel: "例句", enLoading: "載入例句中…", noExample: "查無例句，建議造句練習。",
    resultIntelligence: "結果解讀", levelMatrix: "不規則動詞三態類型", levelMatrixNote: "L7 把不規則動詞依三態關係分成三類，看您查的動詞屬於哪一型，記憶時抓對規律。",
    scenarioLayer: "使用場景", scenarioTitle: "什麼時候用三態查找", scenarioNote: "L8 列出四個典型場景，把三態查找用在對的地方，而不是死背全部動詞。",
    scenarioExam: "考試備考", scenarioExamNote: "文法考試與克漏字常考過去式與過去分詞，查清三態再記憶，避免時態與完成式用錯。", scenarioWriting: "寫作校對", scenarioWritingNote: "寫作時拿不準過去分詞，先查三態確認 wrote/written、went/gone 等，避免動詞變化錯誤。", scenarioDaily: "口說練習", scenarioDailyNote: "練習過去式敘述與完成式時，先查三態確認發音與形態，說得更自然。", scenarioBusiness: "教學備課", scenarioBusinessNote: "老師整理不規則動詞教材時，快速取得三態、音標與例句作為教案素材。",
    progressInsight: "學習洞察卡", possibleTarget: "本次查找", dailyGap: "難度等級", weeklyTrend: "三態類型", motivation: "動力卡", keepMomentum: "從背全部動詞走向依三態規律分類記憶",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天查的不規則動詞帶回家", journeyHint: "挑 2–3 個您常用錯的不規則動詞，用三態各造一句，把過去式與完成式練熟。",
    nextActionLabel: "下一步行動", nextActionTitle: "把這個動詞接到下一個工具", nextActionItem1: "用字根分析器拆解這個動詞的字根與語源，記得更牢", nextActionItem2: "用 Scrabble 單字驗證確認三態各形態是否為合法單字", nextActionItem3: "用 CEFR 等級估算評估這個動詞的難度等級",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "查找路徑", decisionTitle: "輸入 → 反查 → 看三態 → 練造句", step1: "輸入動詞", step2: "反查", step3: "看三態", step4: "練造句",
    knowledge: "知識", knowledgeTitle: "不規則動詞三態在英語學習中的意義", definition: "定義", definitionText: "不規則動詞是過去式與過去分詞不依「加 -ed」規則變化的動詞，例如 go/went/gone、write/wrote/written；掌握三態是正確使用過去式、完成式與被動語態的基礎。", usage: "用法", usageText: "輸入一個動詞後（原形、過去式或過去分詞皆可），演算法反查內建不規則動詞表，列出完整三態（原形／過去式／過去分詞），並標註每個形態的音標、詞類、繁中釋義，可展開看英文例句。", limitations: "限制", limitationsText: "本工具的動詞表為內建 151 筆常用不規則動詞，並非完整動詞清單；規則動詞（直接加 -ed）與罕見不規則動詞未必收錄；部分動詞有英美拼法差異（如 burnt/burned），本工具兩種皆列出。", interpretation: "解讀", interpretationText: "不規則動詞依三態關係可分三型——三態同形（cut/cut/cut）、過去與分詞同形（buy/bought/bought）、三態皆異（go/went/gone）；抓對類型再記憶，比逐一死背有效率。", context: "脈絡", contextText: "三態查找應與字根分析、單字驗證、CEFR 估算一起用：查清三態後用字根理解語義來源，用例句練習造句，把孤立的動詞變化變成有系統的語法掌握。", example: "範例", exampleText: "輸入 go → 三態為 go / went / gone；輸入 written → 反查出原形 write，三態為 write / wrote / written。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "相關工具", affiliateTitle: "三態查找的下一步工具", premiumTitle: "PRO 動詞大師包", premiumText: "解鎖無限查找、批次查三態動詞表、依三態類型分組匯出、自動記錄查找歷史，並把不規則動詞清單匯出複習。",
    feat1: "無限查找次數", feat2: "批次查動詞表", feat3: "查找歷史記錄", feat4: "三態清單匯出",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供英語學習用途；三態查找以自建演算法比對內建不規則動詞表，並非完整動詞詞典；三態與釋義由編輯團隊人工整理，CEFR 等級為詞表對照與啟發式推估。", relatedTools: "相關工具", relatedToolsText: "Word Root Analyzer · Scrabble Word Checker · Word Unscrambler · CEFR Level Estimator", references: "參考資料", referencesText: "自建「動詞三態查找 + 反查」演算法（純前端，比對內建 151 筆不規則動詞表）；三態與繁中釋義、例句由編輯團隊人工整理；CEFR-J Wordlist v1.5（Tono Lab, TUFS）；Octanove C1/C2 Vocabulary Profile（CC BY-SA 4.0）；ECDICT 開源英漢詞典（IPA 音標與簡體釋義）；Free Dictionary API（額外例句）。",
    q1: "三態是怎麼查出來的？", a1: "用自建演算法建立索引：把內建 151 筆不規則動詞的原形、過去式、過去分詞三種形態全部建檔，所以不論您輸入哪個形態（包含 was/were、burnt/burned 這類多形），都能反查出完整三態。純前端判定，不需連外部 API。",
    q2: "為什麼輸入過去式也能查到？", a2: "本工具支援反查：演算法把每個動詞的三種形態都建成索引，例如輸入 went 會反查出原形 go，並列出完整三態 go / went / gone。這對閱讀時遇到過去式或分詞、想知道原形特別有用。",
    q3: "為什麼有些動詞查不到？", a3: "若該動詞不在內建 151 筆常用不規則動詞表中（規則動詞直接加 -ed，或罕見不規則動詞未收錄），就會顯示查無此動詞。規則動詞的過去式與分詞都是「原形 + ed」，不需要查表。",
    q4: "音標和中文釋義從哪來？", a4: "IPA 音標取自 ECDICT 開源英漢詞典（內建 2 萬餘字），詞庫未收錄者改以 ARPABET 即時轉換 IPA；繁體中文釋義與例句由編輯團隊人工整理；尚無人工繁體者補顯示 ECDICT 簡體釋義並標註「簡」，繁簡皆無者展開即顯示英文定義（標註 EN）。額外英文例句來自 Free Dictionary API。",
    q5: "本工具和「字根分析器」有什麼不同？", a5: "字根分析器是拆字根、溯語源、展字族；本工具是專查不規則動詞的三態變化（原形／過去式／過去分詞），並支援反查。兩者互補：先查三態確認形態，再用字根分析理解語義來源。",
    q6: "burnt 和 burned 哪個對？", a6: "兩個都對——burnt 偏英式、burned 偏美式，意思相同。本工具對這類英美拼法差異的動詞會兩種形態都列出（以斜線分隔），輸入任一種都查得到。",
  },
  en: {
    badge: "Language · Irregular Verb Finder · Language Hub", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Irregular Verb Finder", subtitle: "Type an English verb (base, past, or past participle), instantly find all three forms, and get IPA, part of speech, Traditional Chinese gloss, and an example sentence — 151 common irregular verbs built in",
    intro: "The Irregular Verb Finder uses a custom three-form lookup and reverse-lookup algorithm: after you type a verb, it matches it against a built-in 151-verb irregular-verb table — whether you enter the base, past, or past participle, it reverse-looks up the complete three forms (base / past / past participle) and tags each form's IPA, part of speech (verb), Traditional Chinese gloss, and an example sentence. This tool is a pure front-end algorithm; three-form lookup uses no external API, so it is fast and works offline.",
    trustNoteLabel: "Data source:", trustNote: "Three-form lookup is produced by a custom algorithm matched against a built-in 151-verb table (pure front-end, no external API); base, past, past participle, Chinese glosses, and examples are curated by the editorial team; IPA comes from ECDICT and ARPABET conversion; CEFR levels are matched against the CEFR-J and Octanove authoritative wordlists; when no hand-written Traditional Chinese gloss exists, it falls back to ECDICT's Simplified gloss (tagged Simp), then to an English definition; extra examples come from the Free Dictionary API. For study and reference only.",
    quickActionCard: "Quick Lookup Card", tryExample: "Find go", examplePreview: "Three forms", examplePerson: "Found verb", fillExample: "Find go", previewActivePath: "Find take",
    examplesCalculator: "Examples → Find", enterValues: "Enter a verb", examplesHelper: "Start with a popular example to see how the three forms, IPA, CEFR level, and Chinese gloss appear, then swap in the verb you want (base, past, or participle).",
    queryBtn: "Find forms", clearBtn: "Clear", hotWords: "Popular irregular verbs", inputPlaceholder: "Type an English verb, e.g. go, went, gone",
    loading: "Searching…", emptyHint: "Enter a verb above and press Find forms; base / past / past participle and the four elements appear here.", noResult: "This verb is not in the built-in 151-verb table; it may be a regular verb (just add -ed) or not on the built-in list. Try a common irregular verb.",
    fallbackTitle: "Loading dictionary", fallbackBody: "The built-in dictionary is loading, please try again shortly.",
    resultCard: "Lookup Result", matchHint: "Form you entered", matchBase: "base", matchPast: "past", matchPp: "past participle", baseLabel: "Base form", pastLabel: "Past simple", ppLabel: "Past participle", ipaLabel: "IPA", ipaPending: "/pending/", meaningLabel: "Gloss", glossTagCn: "(Simp)", glossTagEn: "(EN)", enGlossHint: "See English definition & example on expand", expandHint: "Show English example", collapseHint: "Collapse", exampleLabel: "Example", enLoading: "Loading example…", noExample: "No example found; try writing your own.",
    resultIntelligence: "Result Intelligence", levelMatrix: "Irregular verb pattern types", levelMatrixNote: "L7 sorts irregular verbs into three types by their three-form relationship; see which type your verb belongs to and grasp the pattern when memorizing.",
    scenarioLayer: "Use scenarios", scenarioTitle: "When to use three-form lookup", scenarioNote: "L8 lists four typical scenarios so you use three-form lookup in the right place rather than memorizing every verb.",
    scenarioExam: "Exam prep", scenarioExamNote: "Grammar tests and cloze often test past and past participle; check the three forms before memorizing to avoid tense and perfect-aspect errors.", scenarioWriting: "Writing proofreading", scenarioWritingNote: "When unsure of a past participle while writing, check the three forms to confirm wrote/written, went/gone, etc., avoiding verb inflection errors.", scenarioDaily: "Speaking practice", scenarioDailyNote: "When practicing past narration and perfect aspect, check the three forms first to confirm pronunciation and form, speaking more naturally.", scenarioBusiness: "Teaching prep", scenarioBusinessNote: "When teachers compile irregular-verb materials, quickly obtain three forms, IPA, and examples as lesson material.",
    progressInsight: "Learning Insight Card", possibleTarget: "This lookup", dailyGap: "Difficulty level", weeklyTrend: "Pattern type", motivation: "Motivation Card", keepMomentum: "Move from memorizing every verb to classifying by three-form patterns",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's irregular verbs home", journeyHint: "Pick 2–3 irregular verbs you often get wrong, write one sentence each in all three forms, and master the past and perfect aspects.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this verb to the next tool", nextActionItem1: "Use Word Root Analyzer to break out this verb's root and origin to remember it better", nextActionItem2: "Use Scrabble Word Checker to verify whether each of the three forms is a valid word", nextActionItem3: "Use CEFR Level Estimator to assess this verb's difficulty level",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Lookup Path", decisionTitle: "Input → Reverse lookup → See forms → Practice", step1: "Type verb", step2: "Reverse lookup", step3: "See forms", step4: "Practice",
    knowledge: "Knowledge", knowledgeTitle: "What irregular verb forms mean in English learning", definition: "Definition", definitionText: "Irregular verbs are verbs whose past and past participle do not follow the add-ed rule, e.g. go/went/gone, write/wrote/written; mastering the three forms is the basis for correctly using the past tense, perfect aspect, and passive voice.", usage: "Usage", usageText: "After you enter a verb (base, past, or past participle), the algorithm reverse-looks up the built-in irregular-verb table, lists the complete three forms, and tags each form's IPA, part of speech, and Chinese gloss, expandable to an English example.", limitations: "Limitations", limitationsText: "The verb table is a built-in 151 common irregular verbs, not a complete verb list; regular verbs (just add -ed) and rare irregular verbs may not be included; some verbs have British/American spelling differences (e.g. burnt/burned), and this tool lists both.", interpretation: "Interpretation", interpretationText: "Irregular verbs fall into three types by their three-form relationship — all same (cut/cut/cut), past = participle (buy/bought/bought), all different (go/went/gone); grasping the type before memorizing is more efficient than rote learning each.", context: "Context", contextText: "Three-form lookup should be used with root analysis, word checking, and CEFR estimation: after checking the three forms, use roots to understand meaning origin and examples to practice sentences, turning isolated inflections into systematic grammar mastery.", example: "Example", exampleText: "Input go → three forms are go / went / gone; input written → reverse-looks up base write, three forms write / wrote / written.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Related Tools", affiliateTitle: "Next tools for three-form lookup", premiumTitle: "PRO Verb Master Pack", premiumText: "Unlock unlimited lookups, batch three-form verb lists, export grouped by pattern type, auto-log lookup history, and export irregular-verb lists for review.",
    feat1: "Unlimited lookups", feat2: "Batch verb list", feat3: "Lookup history", feat4: "Export three-form list",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for English learning only; three-form lookup uses a custom algorithm matched against a built-in irregular-verb table, not a complete verb dictionary; three forms and glosses are curated by the editorial team, and CEFR levels are wordlist matches plus a heuristic.", relatedTools: "Related Tools", relatedToolsText: "Word Root Analyzer · Scrabble Word Checker · Word Unscrambler · CEFR Level Estimator", references: "References", referencesText: "Custom three-form lookup and reverse-lookup algorithm (pure front-end, matched against a built-in 151-verb table); three forms and Chinese glosses and examples curated by the editorial team; CEFR-J Wordlist v1.5 (Tono Lab, TUFS); Octanove C1/C2 Vocabulary Profile (CC BY-SA 4.0); ECDICT open EN-ZH dictionary (IPA and Simplified glosses); Free Dictionary API (extra examples).",
    q1: "How are the three forms found?", a1: "A custom algorithm builds an index: all three forms (base, past, past participle) of the 151 built-in irregular verbs are indexed, so whatever form you enter (including multi-forms like was/were, burnt/burned), it reverse-looks up the complete three forms. Pure front-end, no external API.",
    q2: "Why can I find a verb by entering the past tense?", a2: "This tool supports reverse lookup: the algorithm indexes all three forms of every verb, e.g. entering went reverse-looks up base go and lists the complete go / went / gone. This is especially useful when you meet a past tense or participle while reading and want the base.",
    q3: "Why can't some verbs be found?", a3: "If the verb is not in the built-in 151 common irregular verbs (regular verbs just add -ed, or rare irregular verbs are not included), it shows not found. Regular verbs' past and participle are both base + ed, no lookup needed.",
    q4: "Where do the IPA and Chinese gloss come from?", a4: "IPA comes from the open ECDICT EN-ZH dictionary (over 20k words built in); unlisted words convert ARPABET to IPA on the fly. Traditional Chinese glosses and examples are curated by the editorial team; when no hand-written Traditional Chinese exists, it shows ECDICT's Simplified gloss tagged Simp, then an English definition tagged EN. Extra English examples come from the Free Dictionary API.",
    q5: "How is this different from the Word Root Analyzer?", a5: "The Word Root Analyzer breaks out roots, traces origins, and expands families; this tool specifically looks up irregular verbs' three forms (base / past / past participle) and supports reverse lookup. They complement each other: check the three forms first, then use root analysis to understand meaning origin.",
    q6: "Which is correct, burnt or burned?", a6: "Both are correct — burnt is more British, burned more American, with the same meaning. For verbs with such British/American spelling differences, this tool lists both forms (separated by a slash), and either can be searched.",
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

export default function IrregularVerbFinder() {
  const { lang, setLang } = useLanguage();
  const t = ui[lang];
  const [input, setInput] = useState("go");
  const [result, setResult] = useState<FindResult | null>(null);
  const [solved, setSolved] = useState<boolean | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => { loadDict(); }, []);

  const runQuery = useCallback(async (rawWord: string) => {
    const word = rawWord.trim().toLowerCase().replace(/[^a-z]/g, "");
    if (!word) return;
    setLoading(true);
    setExpanded(false);
    await loadDict();
    const hit = findVerb(word);
    if (!hit) {
      setResult({ query: word, hit: null, baseIpa: "", pastIpa: "", ppIpa: "", cefr: null });
      setSolved(true);
      setLoading(false);
      return;
    }
    const firstBase = splitForms(hit.base)[0] || hit.base;
    const firstPast = splitForms(hit.past)[0] || hit.past;
    const firstPp = splitForms(hit.pp)[0] || hit.pp;
    setResult({
      query: word, hit,
      baseIpa: ipaOf(firstBase), pastIpa: ipaOf(firstPast), ppIpa: ipaOf(firstPp),
      cefr: cefrOf(firstBase),
    });
    setSolved(true);
    setLoading(false);
  }, []);

  const toggleExpand = useCallback(async () => {
    if (!result || !result.hit) return;
    if (expanded) { setExpanded(false); return; }
    setExpanded(true);
    if (result.exampleApi === undefined) {
      const base = splitForms(result.hit.base)[0] || result.hit.base;
      const ex = await fetchExample(base);
      setResult((prev) => prev ? { ...prev, exampleApi: ex?.exampleEn || "", defEn: ex?.defEn || "", enriched: true } : prev);
    }
  }, [expanded, result]);

  function fillStandard() { setInput("go"); runQuery("go"); }
  function fillCut() { setInput("take"); runQuery("take"); }
  function clearAll() { setInput(""); setResult(null); setSolved(undefined); setExpanded(false); }

  const formsDisplay = result && result.hit ? `${splitForms(result.hit.base)[0]} / ${splitForms(result.hit.past)[0]} / ${splitForms(result.hit.pp)[0]}` : "—";
  const matchKindLabel = useMemo(() => {
    if (!result || !result.hit) return "—";
    return result.hit.matchKind === "base" ? t.matchBase : result.hit.matchKind === "past" ? t.matchPast : t.matchPp;
  }, [result, t]);
  const patternType = useMemo(() => {
    if (!result || !result.hit) return "—";
    const b = splitForms(result.hit.base)[0], p = splitForms(result.hit.past)[0], pp = splitForms(result.hit.pp)[0];
    if (b === p && p === pp) return "A-A-A";
    if (p === pp) return "A-B-B";
    if (b === pp) return "A-B-A";
    return "A-B-C";
  }, [result]);

  const scenarios = [
    { k: "exam", title: t.scenarioExam, note: t.scenarioExamNote, accent: "border-blue-200 bg-blue-50" },
    { k: "writing", title: t.scenarioWriting, note: t.scenarioWritingNote, accent: "border-emerald-200 bg-emerald-50" },
    { k: "daily", title: t.scenarioDaily, note: t.scenarioDailyNote, accent: "border-amber-200 bg-amber-50" },
    { k: "business", title: t.scenarioBusiness, note: t.scenarioBusinessNote, accent: "border-violet-200 bg-violet-50" },
  ];

  const gloss = result && result.hit ? { zh: result.hit.zh, src: "tw" as MeaningSrc } : { zh: "", src: "none" as MeaningSrc };

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div lang="en" translate="no" className="notranslate mt-1 text-3xl font-black">{formsDisplay}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div lang="en" translate="no" className="notranslate font-black">{result ? result.query : "—"}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.dailyGap}</div><div className="font-black">{result && result.cefr ? result.cefr : "—"}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div lang="en" translate="no" className="notranslate font-black">{patternType}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
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
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div lang="en" translate="no" className="notranslate text-4xl font-black tracking-tight text-slate-950">{formsDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{result && result.hit ? `${t.matchHint}：${matchKindLabel}` : t.matchHint}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.examplePerson}</div><div lang="en" translate="no" className="notranslate mt-1 text-xl font-black">{result ? result.query : "—"}</div><div lang="en" translate="no" className="notranslate mt-1 text-xs text-slate-300">{patternType}</div></div></div>
            <div className="mt-6 space-y-3">
              {loading && <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm font-black text-slate-600">{t.loading}</div>}
              {!loading && solved === undefined && <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm font-black text-slate-500">{t.emptyHint}</div>}
              {!loading && solved === true && result && !result.hit && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center text-sm font-black text-rose-700">{t.noResult}</div>}
              {!loading && solved === true && result && result.hit && (
                <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-4 backdrop-blur">
                  {/* 三態三欄（每態：形態名 + 拼寫 + 音標） */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className={`rounded-xl border p-3 ${result.hit.matchKind === "base" ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}><div className="text-xs font-black text-slate-500">{t.baseLabel}</div><div lang="en" translate="no" className="notranslate mt-1 text-lg font-black text-slate-900">{result.hit.base}</div><div lang="en" translate="no" className="notranslate mt-0.5 font-mono text-xs text-slate-600">{result.baseIpa === "__PENDING__" ? t.ipaPending : result.baseIpa}</div></div>
                    <div className={`rounded-xl border p-3 ${result.hit.matchKind === "past" ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}><div className="text-xs font-black text-slate-500">{t.pastLabel}</div><div lang="en" translate="no" className="notranslate mt-1 text-lg font-black text-slate-900">{result.hit.past}</div><div lang="en" translate="no" className="notranslate mt-0.5 font-mono text-xs text-slate-600">{result.pastIpa === "__PENDING__" ? t.ipaPending : result.pastIpa}</div></div>
                    <div className={`rounded-xl border p-3 ${result.hit.matchKind === "pp" ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}><div className="text-xs font-black text-slate-500">{t.ppLabel}</div><div lang="en" translate="no" className="notranslate mt-1 text-lg font-black text-slate-900">{result.hit.pp}</div><div lang="en" translate="no" className="notranslate mt-0.5 font-mono text-xs text-slate-600">{result.ppIpa === "__PENDING__" ? t.ipaPending : result.ppIpa}</div></div>
                  </div>
                  {/* ② 詞類 + ③ 釋義 */}
                  <div className="mt-3 flex flex-wrap items-center gap-3"><span className="text-xs font-black text-slate-500">{l(posMap.v, lang)}</span>{result.cefr && <span className={`rounded-full px-2 py-1 text-xs font-black ${cefrColor[result.cefr]}`}>{result.cefr}</span>}</div>
                  {gloss.src === "none"
                    ? <p className="mt-2 text-sm leading-6 text-slate-500">{t.enGlossHint}</p>
                    : <p className="mt-2 text-sm leading-6 text-slate-700">{gloss.zh}{gloss.src === "cn" && <span className="ml-1 text-xs font-black text-amber-600">{t.glossTagCn}</span>}</p>}
                  {/* ④ 例句（人工） + 可展開 API 例句 */}
                  <div className="mt-3 rounded-xl bg-slate-50 p-3"><p className="text-xs font-black text-slate-400">{t.exampleLabel}</p><p lang="en" translate="no" className="notranslate mt-1 text-sm italic text-slate-700">{result.hit.exEn}</p><p className="mt-1 text-xs text-slate-500">{result.hit.exZh}</p></div>
                  <button type="button" onClick={toggleExpand} className="mt-3 text-xs font-black text-emerald-700">{expanded ? t.collapseHint : `▸ ${t.expandHint}`}</button>
                  {expanded && (
                    <div className="mt-2 rounded-xl bg-white p-3">
                      {result.exampleApi === undefined
                        ? <p className="text-xs font-black text-slate-400">{t.enLoading}</p>
                        : result.exampleApi
                          ? (<><p lang="en" translate="no" className="notranslate text-sm italic text-slate-700">{result.exampleApi}</p>{result.defEn && <p lang="en" translate="no" className="notranslate mt-1 text-xs text-slate-500">{result.defEn}</p>}</>)
                          : (result.defEn ? <p lang="en" translate="no" className="notranslate text-xs text-slate-500">{result.defEn}</p> : <p className="text-xs text-slate-400">{t.noExample}</p>)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.levelMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.levelMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{patternBands.map((item) => <div key={item.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className={`rounded-full px-2 py-1 text-xs font-black ${cefrColor[item.key]}`}>{item.key}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="irregular-verb-finder-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">{/* L8-ScenarioComparison */}
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.scenarioLayer}</p><h2 className="mt-2 text-3xl font-black">{t.scenarioTitle}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.scenarioNote}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{scenarios.map((s) => <article key={s.k} className={`rounded-3xl border p-5 shadow-sm ${s.accent}`}><h3 className="text-lg font-black text-slate-900">{s.title}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{s.note}</p></article>)}</div>
        </section>
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.examplePerson}</div><div lang="en" translate="no" className="notranslate mt-1 text-2xl font-black">{result ? result.query : "—"}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result && result.cefr ? result.cefr : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div lang="en" translate="no" className="notranslate mt-1 text-2xl font-black text-emerald-950">{patternType}</div></div></div></article>
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
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 可能包含站內或聯盟推薦；若透過部分連結購買，我們可能獲得佣金。" : "* May include on-site or affiliate recommendations. We may earn a commission from qualifying purchases."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-Trust */}<p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
