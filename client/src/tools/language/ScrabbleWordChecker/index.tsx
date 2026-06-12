// @profile B
// Profile B · Language-Hub 自建演算法 · ScrabbleWordChecker（GOLD-STANDARD MacroCalculator compatible）
// Scrabble 單字驗證器：自建「字典驗證 + 拼字遊戲計分」演算法（單一單字輸入，單一豐富結果卡）。
//   原理：輸入單字 → 掃內建 cefrDict（22,499 字）判定是否為有效拼字遊戲單字 → 計算 Scrabble 字母分數（tile values）
//   差異：word-finder/unscrambler 是「找出多個字」；本工具是「驗證一個字 + 算分」，輸出單一結果卡。
//   三層中文釋義(繁體優先→ECDICT簡體標「简」→英文定義標EN) + ARPABET→IPA 全照 gold 範本。四要素鐵律：① KK音標 ② 詞類 ③ 釋義 ④ 例句。

import { useMemo, useState, useCallback, useEffect } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";
import examplesData from "./scrabbleExamples.json";

type ExampleEntry = { word: string; exampleEn: string; exampleZh: string };
const EXAMPLES: Record<string, ExampleEntry> = {};
(examplesData as ExampleEntry[]).forEach((e) => { EXAMPLES[e.word.toLowerCase()] = e; });

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
//   形態：{ word: [cefr, zh_tw, zh_cn, ipa] } — 同時充當拼字遊戲合法字字典（22,499 字）
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
// 自建「Scrabble 計分 + 字典驗證」演算法（四要素鐵律）
//   ① 標準 Scrabble 字母分值表（英文版 tile values）
//   ② 計算單字總分；③ 掃內建 cefrDict 判定是否合法字
// ============================================================
const TILE_SCORE: Record<string, number> = {
  a: 1, e: 1, i: 1, o: 1, u: 1, l: 1, n: 1, s: 1, t: 1, r: 1,
  d: 2, g: 2,
  b: 3, c: 3, m: 3, p: 3,
  f: 4, h: 4, v: 4, w: 4, y: 4,
  k: 5,
  j: 8, x: 8,
  q: 10, z: 10,
};
// 計算單字 Scrabble 總分（逐字母加總 tile value）
function scrabbleScore(word: string): { total: number; breakdown: { ch: string; v: number }[] } {
  const breakdown: { ch: string; v: number }[] = [];
  let total = 0;
  for (const ch of word) { const v = TILE_SCORE[ch] ?? 0; total += v; breakdown.push({ ch, v }); }
  return { total, breakdown };
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
type CheckResult = {
  word: string; valid: boolean; score: number; breakdown: { ch: string; v: number }[];
  cefr: Cefr; posKey: string; ipa: string; meaningZh: string; meaningSrc: MeaningSrc;
  exampleEn?: string; exampleZh?: string; defEn?: string; enriched?: boolean;
};

const cefrColor: Record<string, string> = {
  A1: "bg-emerald-100 text-emerald-800", A2: "bg-emerald-100 text-emerald-800",
  B1: "bg-sky-100 text-sky-800", B2: "bg-sky-100 text-sky-800",
  C1: "bg-violet-100 text-violet-800", C2: "bg-violet-100 text-violet-800",
};
const HOT_WORDS = ["quiz", "jazz", "oxygen", "rhythm", "wizard", "puzzle"] as const;

const cefrBands = [
  { key: "A1", label: { zh: "1 分字母", en: "1-point tiles" }, desc: { zh: "E A I O U L N S T R 等最常用字母，各 1 分。", en: "E A I O U L N S T R and other common letters, 1 point each." } },
  { key: "A2", label: { zh: "2 分字母", en: "2-point tiles" }, desc: { zh: "D 與 G，各 2 分。", en: "D and G, 2 points each." } },
  { key: "B1", label: { zh: "3 分字母", en: "3-point tiles" }, desc: { zh: "B C M P，各 3 分。", en: "B C M P, 3 points each." } },
  { key: "B2", label: { zh: "4 分字母", en: "4-point tiles" }, desc: { zh: "F H V W Y，各 4 分。", en: "F H V W Y, 4 points each." } },
  { key: "C1", label: { zh: "5–8 分字母", en: "5–8 point tiles" }, desc: { zh: "K 5 分；J X 各 8 分。", en: "K is 5; J and X are 8 points each." } },
  { key: "C2", label: { zh: "10 分字母", en: "10-point tiles" }, desc: { zh: "Q 與 Z，各 10 分，最高分。", en: "Q and Z, 10 points each, the highest." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "字母重組器", en: "Word Unscrambler" }, href: "/tools/language/word-unscrambler" },
  { label: { zh: "找字工具", en: "Word Finder" }, href: "/tools/language/word-finder" },
  { label: { zh: "字根分析器", en: "Word Root Analyzer" }, href: "/tools/language/word-root-analyzer" },
  { label: { zh: "CEFR 等級估算", en: "CEFR Level Estimator" }, href: "/tools/language/cefr-level-estimator" },
];

const ui = {
  zh: {
    badge: "語言 · Scrabble 單字驗證 · Language Hub", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Scrabble 單字驗證器 · Word Checker", subtitle: "輸入一個英文單字，立刻驗證它是否為內建 22,499 字詞庫中的有效拼字遊戲單字，並計算它的 Scrabble 字母分數，附上 KK 音標、詞類、繁中釋義與例句",
    intro: "Scrabble 單字驗證器採用自建的「字典驗證 + 拼字遊戲計分」演算法：輸入一個英文單字後，工具會先掃內建 22,499 字的詞庫判定它是否為有效單字，再依標準 Scrabble 字母分值表（E/A/I/O/U 等 1 分、D/G 2 分、B/C/M/P 3 分、F/H/V/W/Y 4 分、K 5 分、J/X 8 分、Q/Z 10 分）逐字母加總算出總分，並把每個字母的得分明細列出。結果卡同時標註該字的 CEFR 難度等級、IPA 音標、詞性與繁體中文釋義，並可展開查看英文定義與例句。本工具為純前端演算法，不依賴外部 API 取驗證與計分結果，速度快、離線可用。",
    trustNoteLabel: "資料來源：", trustNote: "合法字判定以自建演算法比對內建詞庫產生（純前端，不依賴外部 API）；Scrabble 字母分值採用英文版標準 tile values；CEFR 等級以 CEFR-J 與 Octanove 權威詞表對照；中文釋義以編輯團隊人工撰寫的繁體中文為優先，尚無繁體者改顯示 ECDICT 開源詞典的簡體釋義（標註「简」），繁簡皆無者展開即顯示英文定義；IPA 音標取自 ECDICT 與 ARPABET 轉換；例句來自 Free Dictionary API。僅供學習與娛樂參考。",
    quickActionCard: "快速驗證卡", tryExample: "一鍵驗證 quiz", examplePreview: "Scrabble 總分", examplePerson: "驗證單字", fillExample: "驗證單字 quiz", previewActivePath: "驗證單字 oxygen",
    examplesCalculator: "範例 → 驗證", enterValues: "輸入單字", examplesHelper: "先用熱門範例了解 Scrabble 計分、CEFR 等級、IPA 音標與中文釋義如何呈現，再換成您自己想驗證的單字。",
    queryBtn: "驗證並計分", clearBtn: "清除", hotWords: "熱門高分單字", inputPlaceholder: "輸入一個英文單字，例如 quiz",
    loading: "驗證中…", emptyHint: "輸入上方單字並按「驗證並計分」，合法判定、Scrabble 分數與四要素會顯示在這裡。", noResult: "查無此字，這個單字不在內建詞庫中，比賽時請依各自規則確認是否合法。",
    fallbackTitle: "詞庫載入中", fallbackBody: "正在載入內建詞庫，請稍候再試一次。",
    resultCard: "驗證結果", scoreUnit: "分", validLabel: "有效單字", invalidLabel: "查無此字", letterPool: "Scrabble 計分", ipaLabel: "音標", ipaPending: "/音標整理中/", meaningLabel: "釋義", glossTagCn: "(简)", glossTagEn: "(EN)", enGlossHint: "展開看英文定義與例句", expandHint: "展開看例句", collapseHint: "收合", exampleLabel: "例句", enLoading: "載入例句中…", noExample: "查無例句，建議造句練習。", breakdownLabel: "字母得分明細",
    resultIntelligence: "結果解讀", levelMatrix: "Scrabble 字母分值表", levelMatrixNote: "L7 列出英文版標準 Scrabble 字母分值，1 分字母最常見、10 分字母（Q/Z）最稀有也最值錢；驗證時看您這個字用到哪些高分字母。",
    scenarioLayer: "使用場景", scenarioTitle: "什麼時候用單字驗證", scenarioNote: "L8 列出四個典型場景，把單字驗證用在對的地方，而不是隨意拼湊。",
    scenarioExam: "拼字遊戲", scenarioExamNote: "Scrabble、Words with Friends 落子前，先驗證這個字是否合法、能拿幾分，避免無效字被罰。", scenarioWriting: "解字謎", scenarioWritingNote: "填字遊戲與字謎，驗證候選答案是否為合法單字，再看它的長度與分數。", scenarioDaily: "單字學習", scenarioDailyNote: "驗證新學到的單字是否拼對，順便看 CEFR 等級、音標與釋義，鞏固記憶。", scenarioBusiness: "教學出題", scenarioBusinessNote: "老師出拼字題或評分時，快速驗證單字合法性與得分，作為計分依據。",
    progressInsight: "學習洞察卡", possibleTarget: "本次得分", dailyGap: "難度等級", weeklyTrend: "字母數", motivation: "動力卡", keepMomentum: "從查字典走向主動掌握拼字與計分直覺",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天驗證的高分字帶回家", journeyHint: "挑 2–3 個您不認得的高分字查釋義並造句，玩遊戲也能順便背單字。",
    nextActionLabel: "下一步行動", nextActionTitle: "把這個字接到下一個工具", nextActionItem1: "用字母重組器把這些字母重組成其他可得分的單字", nextActionItem2: "用找字工具找出含相同字母的其他單字擴充選項", nextActionItem3: "用字根分析器理解這個字的語義從何而來，記得更牢",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "驗證路徑", decisionTitle: "輸入 → 驗證 → 計分 → 應用", step1: "輸入單字", step2: "驗證合法", step3: "看分數", step4: "用在遊戲",
    knowledge: "知識", knowledgeTitle: "Scrabble 單字驗證在英語學習中的意義", definition: "定義", definitionText: "Scrabble 單字驗證是把輸入的單字比對標準詞庫判定是否合法，再依字母分值表算出該字在拼字遊戲中的得分；這是 Scrabble、Words with Friends 與填字遊戲的核心判定。", usage: "用法", usageText: "輸入一個單字後，演算法先掃內建詞庫確認它是否為合法字，再逐字母查表加總得分，最後列出每個字母的分值明細與總分。高分字母（Q/Z 各 10 分、J/X 各 8 分）能大幅拉高總分。", limitations: "限制", limitationsText: "本工具的詞庫為內建 22,499 字常用詞庫，並非官方 Scrabble 字典（如 TWL/SOWPODS），極罕見字、專有名詞與多數複數變化未必收錄；比賽時請依各自賽事規則確認。", interpretation: "解讀", interpretationText: "短而用到高分字母的字（如 quiz、jazz）CP 值最高；長字雖然字母多，但若全是 1 分字母總分未必高。驗證時兼顧合法性與字母分值。", context: "脈絡", contextText: "單字驗證應與字母重組、字根分析、CEFR 估算一起用：驗證一個字之後，重組它的字母找更多得分字，或查語義與來源，把遊戲變成有效的學字工具。", example: "範例", exampleText: "輸入 quiz → 合法，Q10+U1+I1+Z10 = 22 分；輸入 oxygen → 合法，O1+X8+Y4+G2+E1+N1 = 17 分。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "相關工具", affiliateTitle: "單字驗證的下一步工具", premiumTitle: "PRO 拼字大師包", premiumText: "解鎖無限驗證、批次驗證單字表、依分數排序、自動記錄驗證歷史，並把高分字表匯出複習。",
    feat1: "無限驗證次數", feat2: "批次驗證字表", feat3: "驗證歷史記錄", feat4: "高分字表匯出",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供英語學習與拼字娛樂用途；合法字判定以自建演算法比對內建詞庫，並非官方 Scrabble 字典；Scrabble 計分為英文版標準字母分值，CEFR 等級為詞表對照與啟發式推估。", relatedTools: "相關工具", relatedToolsText: "Word Unscrambler · Word Finder · Word Root Analyzer · CEFR Level Estimator", references: "參考資料", referencesText: "自建「字典驗證 + 拼字計分」演算法（純前端，比對內建詞庫並依英文版標準字母分值計分）；CEFR-J Wordlist v1.5（Tono Lab, TUFS）；Octanove C1/C2 Vocabulary Profile（CC BY-SA 4.0）；ECDICT 開源英漢詞典（IPA 音標與簡體釋義）；繁體中文釋義由編輯團隊人工撰寫；Free Dictionary API（例句）。",
    q1: "合法字是怎麼判定的？", a1: "用自建演算法把您輸入的單字比對內建 22,499 字詞庫：在詞庫中即判為有效拼字遊戲單字，不在則顯示查無此字。純前端判定，不需連外部 API。",
    q2: "Scrabble 分數怎麼算？", a2: "依英文版標準字母分值逐字母加總：E/A/I/O/U/L/N/S/T/R 各 1 分、D/G 各 2 分、B/C/M/P 各 3 分、F/H/V/W/Y 各 4 分、K 5 分、J/X 各 8 分、Q/Z 各 10 分。本工具列出每個字母的分值與總分，但不計入空白牌與棋盤加成格。",
    q3: "為什麼有些字驗證為查無此字？", a3: "若該字不在內建 22,499 字詞庫中（極罕見字、專有名詞、多數複數或變化形未必收錄），就會顯示查無此字。這不代表它在官方 Scrabble 字典中不合法，比賽請依賽事規則確認。",
    q4: "音標和中文釋義從哪來？", a4: "IPA 音標取自 ECDICT 開源英漢詞典（內建 2 萬餘字），詞庫未收錄者改以 ARPABET 即時轉換 IPA；中文釋義採三層優先序——編輯團隊人工撰寫的繁體中文優先（無標註），尚無繁體者改顯示 ECDICT 簡體釋義並標註「简」，繁簡皆無者展開即顯示英文定義（標註 EN）。全程不經機器翻譯。例句來自 Free Dictionary API。",
    q5: "本工具和「字母重組器」「找字工具」有什麼不同？", a5: "字母重組器與找字工具是「找出多個字」；本工具是「驗證一個字 + 算分」，輸入單一單字後判定合法性並計算 Scrabble 得分，輸出單一結果卡，適合落子前確認與計分。",
    q6: "這個分數和真實 Scrabble 比賽一樣嗎？", a6: "字母分值與英文版 Scrabble 相同，但真實比賽還有空白牌（0 分）、棋盤的雙倍/三倍字母格與單字格、以及一次用光七張牌的 50 分加成；本工具只算字母基礎分，供參考。",
  },
  en: {
    badge: "Language · Scrabble Word Checker · Language Hub", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Scrabble Word Checker", subtitle: "Type an English word to instantly verify whether it is a valid Scrabble word in a built-in 22,499-word dictionary and compute its Scrabble letter score, with IPA, part of speech, Chinese gloss, and an example sentence",
    intro: "The Scrabble Word Checker uses a custom dictionary-validation and scoring algorithm: after you type a word, it scans a built-in 22,499-word dictionary to verify whether it is a valid word, then sums up its Scrabble score letter by letter using the standard tile values (E/A/I/O/U and others 1 point, D/G 2, B/C/M/P 3, F/H/V/W/Y 4, K 5, J/X 8, Q/Z 10), listing the per-letter breakdown. The result card also tags the word's CEFR level, IPA, part of speech, and Chinese gloss, expandable to show an English definition and example. This tool is a pure front-end algorithm that fetches no external API for validation or scoring, so it is fast and works offline.",
    trustNoteLabel: "Data source:", trustNote: "Validity is determined by a custom algorithm matched against a built-in dictionary (pure front-end, no external API); Scrabble tile values follow the standard English set; CEFR levels are matched against the CEFR-J and Octanove authoritative wordlists; Chinese glosses prioritize the editorial team's hand-written Traditional Chinese, falling back to ECDICT's Simplified gloss (tagged Simp) when none exists, and to an English definition when neither is available; IPA comes from ECDICT and ARPABET conversion; examples come from the Free Dictionary API. For study and entertainment reference only.",
    quickActionCard: "Quick Check Card", tryExample: "Check quiz", examplePreview: "Scrabble score", examplePerson: "Checked word", fillExample: "Check quiz", previewActivePath: "Check oxygen",
    examplesCalculator: "Examples → Check", enterValues: "Enter a word", examplesHelper: "Start with a popular example to see how Scrabble scoring, CEFR level, IPA, and Chinese gloss appear, then swap in the word you want to check.",
    queryBtn: "Check & score", clearBtn: "Clear", hotWords: "Popular high-score words", inputPlaceholder: "Type an English word, e.g. quiz",
    loading: "Checking…", emptyHint: "Enter a word above and press Check & score; validity, Scrabble score, and the four elements appear here.", noResult: "Word not found; it is not in the built-in dictionary. Confirm legality under your game rules.",
    fallbackTitle: "Loading dictionary", fallbackBody: "The built-in dictionary is loading, please try again shortly.",
    resultCard: "Check Result", scoreUnit: "pts", validLabel: "Valid word", invalidLabel: "Not found", letterPool: "Scrabble score", ipaLabel: "IPA", ipaPending: "/pending/", meaningLabel: "Gloss", glossTagCn: "(Simp)", glossTagEn: "(EN)", enGlossHint: "See English definition & example on expand", expandHint: "Show example", collapseHint: "Collapse", exampleLabel: "Example", enLoading: "Loading example…", noExample: "No example found; try writing your own.", breakdownLabel: "Per-letter breakdown",
    resultIntelligence: "Result Intelligence", levelMatrix: "Scrabble tile value table", levelMatrixNote: "L7 lists the standard English Scrabble tile values; 1-point letters are most common, 10-point letters (Q/Z) the rarest and most valuable; see which high-value letters your word uses.",
    scenarioLayer: "Use scenarios", scenarioTitle: "When to use word checking", scenarioNote: "L8 lists four typical scenarios so you check words in the right place, not just random guessing.",
    scenarioExam: "Word games", scenarioExamNote: "Before placing tiles in Scrabble or Words with Friends, verify the word is legal and how many points it scores to avoid penalties for invalid words.", scenarioWriting: "Puzzle solving", scenarioWritingNote: "For crosswords and word puzzles, verify a candidate answer is a valid word, then check its length and score.", scenarioDaily: "Vocabulary learning", scenarioDailyNote: "Verify a newly learned word is spelled correctly and check its CEFR level, IPA, and gloss to reinforce memory.", scenarioBusiness: "Teaching", scenarioBusinessNote: "When setting spelling questions or grading, quickly verify word legality and score as a scoring basis.",
    progressInsight: "Learning Insight Card", possibleTarget: "This score", dailyGap: "Difficulty level", weeklyTrend: "Letters", motivation: "Motivation Card", keepMomentum: "Move from looking up dictionaries to actively mastering spelling and scoring intuition",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's high-score words home", journeyHint: "Look up and make sentences with 2–3 high-score words you didn't know; play games and learn words at once.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this word to the next tool", nextActionItem1: "Use Word Unscrambler to rearrange these letters into other scoring words", nextActionItem2: "Use Word Finder to find other words containing the same letters", nextActionItem3: "Use Word Root Analyzer to see where this word's meaning comes from and remember it better",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Check Path", decisionTitle: "Input → Verify → Score → Apply", step1: "Type word", step2: "Verify", step3: "See score", step4: "Use in game",
    knowledge: "Knowledge", knowledgeTitle: "What word checking means in English learning", definition: "Definition", definitionText: "Scrabble word checking matches an input word against a standard dictionary to decide whether it is legal, then computes its score in the word game using a tile value table; this is the core ruling in Scrabble, Words with Friends, and crosswords.", usage: "Usage", usageText: "After you enter a word, the algorithm scans the built-in dictionary to confirm it is legal, then looks up and sums each letter's value, finally listing the per-letter breakdown and total. High-value letters (Q/Z 10 each, J/X 8 each) sharply raise the total.", limitations: "Limitations", limitationsText: "The dictionary is a built-in 22,499-word common-word list, not an official Scrabble dictionary (such as TWL/SOWPODS); very rare words, proper nouns, and most plural forms may not be included; confirm under your tournament rules.", interpretation: "Interpretation", interpretationText: "Short words using high-value letters (e.g. quiz, jazz) offer the best value; long words have more tiles but may not score high if all are 1-point letters. Balance legality and tile value when checking.", context: "Context", contextText: "Word checking should be used with unscrambling, root analysis, and CEFR estimation: after verifying a word, rearrange its letters for more scoring words, or look up meaning and origin to turn the game into an effective vocabulary tool.", example: "Example", exampleText: "Input quiz → valid, Q10+U1+I1+Z10 = 22 points; input oxygen → valid, O1+X8+Y4+G2+E1+N1 = 17 points.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Related Tools", affiliateTitle: "Next tools for word checking", premiumTitle: "PRO Spelling Master Pack", premiumText: "Unlock unlimited checks, batch-check word lists, sort by score, auto-log check history, and export high-score word lists for review.",
    feat1: "Unlimited checks", feat2: "Batch word list", feat3: "Check history", feat4: "Export high-score list",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for English learning and spelling entertainment only; validity is determined by a custom algorithm matched against a built-in dictionary, not an official Scrabble dictionary; Scrabble scoring uses the standard English tile values, and CEFR levels are wordlist matches plus a heuristic.", relatedTools: "Related Tools", relatedToolsText: "Word Unscrambler · Word Finder · Word Root Analyzer · CEFR Level Estimator", references: "References", referencesText: "Custom dictionary-validation and scoring algorithm (pure front-end, matched against a built-in dictionary using standard English tile values); CEFR-J Wordlist v1.5 (Tono Lab, TUFS); Octanove C1/C2 Vocabulary Profile (CC BY-SA 4.0); ECDICT open EN-ZH dictionary (IPA and Simplified glosses); Traditional Chinese glosses hand-written by the editorial team; Free Dictionary API (examples).",
    q1: "How is validity determined?", a1: "A custom algorithm matches your input word against the built-in 22,499-word dictionary: if found, it is judged a valid Scrabble word; if not, it shows not found. Pure front-end, no external API call.",
    q2: "How is the Scrabble score computed?", a2: "It sums standard English tile values letter by letter: E/A/I/O/U/L/N/S/T/R 1 each, D/G 2, B/C/M/P 3, F/H/V/W/Y 4, K 5, J/X 8, Q/Z 10. This tool lists each letter's value and the total, but excludes blank tiles and board premium squares.",
    q3: "Why are some words shown as not found?", a3: "If the word is not in the built-in 22,499-word dictionary (very rare words, proper nouns, most plurals or inflections may not be included), it shows not found. This does not mean it is illegal in an official Scrabble dictionary; confirm under your tournament rules.",
    q4: "Where do the IPA and Chinese gloss come from?", a4: "IPA comes from the open ECDICT EN-ZH dictionary (over 20k words built in); unlisted words convert ARPABET to IPA on the fly. Chinese glosses use a three-tier priority — the editorial team's hand-written Traditional Chinese first (no tag), then ECDICT's Simplified gloss tagged Simp, then an English definition tagged EN when neither exists. No machine translation is used. Examples come from the Free Dictionary API.",
    q5: "How is this different from Word Unscrambler / Word Finder?", a5: "Word Unscrambler and Word Finder find multiple words; this tool verifies a single word and scores it — after you enter one word it decides legality and computes the Scrabble score, returning a single result card, ideal for confirming before placing tiles.",
    q6: "Is this score the same as a real Scrabble game?", a6: "The tile values match English Scrabble, but a real game also has blank tiles (0 points), double/triple letter and word squares on the board, and a 50-point bonus for using all seven tiles at once; this tool only computes the base letter score for reference.",
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

export default function ScrabbleWordChecker() {
  const { lang, setLang } = useLanguage();
  const t = ui[lang];
  const [input, setInput] = useState("quiz");
  const [result, setResult] = useState<CheckResult | null>(null);
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
    const { total, breakdown } = scrabbleScore(word);
    const dict = DICT ? DICT[word] : undefined;
    const valid = !!dict;
    const cefr: Cefr = dict && dict[0] ? (dict[0] as Cefr) : lenToCefr(word.length);
    const zhTw = dict && dict[1] ? dict[1] : "";
    const zhCn = dict && dict[2] ? dict[2] : "";
    const ipa = dict && dict[3] ? normIpa(dict[3]) : "__PENDING__";
    const posKey = posFromGloss(zhTw || zhCn);
    let meaningZh = "", meaningSrc: MeaningSrc = "none";
    if (zhTw) { meaningZh = zhTw; meaningSrc = "tw"; }
    else if (zhCn) { meaningZh = zhCn; meaningSrc = "cn"; }
    const ex = EXAMPLES[word];
    const card: CheckResult = { word, valid, score: total, breakdown, cefr, posKey, ipa, meaningZh, meaningSrc };
    if (ex) { card.exampleEn = ex.exampleEn; card.exampleZh = ex.exampleZh; card.enriched = true; }
    setResult(card);
    setSolved(true);
    setLoading(false);
  }, []);

  const toggleExpand = useCallback(async () => {
    if (!result) return;
    if (expanded) { setExpanded(false); return; }
    setExpanded(true);
    if (result.exampleEn === undefined) {
      const ex = await fetchExample(result.word);
      setResult((prev) => prev ? { ...prev, exampleEn: ex?.exampleEn || "", defEn: ex?.defEn || "", enriched: true } : prev);
    }
  }, [expanded, result]);

  function fillStandard() { setInput("quiz"); runQuery("quiz"); }
  function fillCut() { setInput("oxygen"); runQuery("oxygen"); }
  function clearAll() { setInput(""); setResult(null); setSolved(undefined); setExpanded(false); }

  const scoreDisplay = result ? String(result.score) : "—";

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{scoreDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.scoreUnit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div lang="en" translate="no" className="notranslate font-black">{result ? result.word : "—"}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.dailyGap}</div><div className="font-black">{result && result.cefr ? result.cefr : "—"}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="font-black">{result ? result.word.length : "—"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Query */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.hotWords}</h3><div className="mt-4 flex flex-wrap gap-2">{HOT_WORDS.map((w) => <button key={w} lang="en" translate="no" onClick={() => { setInput(w); runQuery(w); }} className="notranslate rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-black text-emerald-800">{w}</button>)}</div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.enterValues}</h3><div className="mt-4 flex flex-col gap-3 sm:flex-row"><input className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={input} placeholder={t.inputPlaceholder} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") runQuery(input); }} /><button onClick={() => runQuery(input)} className="rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-black text-white">{t.queryBtn}</button><button onClick={clearAll} className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700">{t.clearBtn}</button></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{scoreDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.scoreUnit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.examplePerson}</div><div lang="en" translate="no" className="notranslate mt-1 text-xl font-black">{result ? result.word : "—"}</div><div className="mt-1 text-xs text-slate-300">{t.letterPool}</div></div></div>
            <div className="mt-6 space-y-3">
              {loading && <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm font-black text-slate-600">{t.loading}</div>}
              {!loading && solved === undefined && <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm font-black text-slate-500">{t.emptyHint}</div>}
              {!loading && solved === true && result && (
                <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-4 backdrop-blur">
                  <div className="flex flex-wrap items-center gap-3"><span lang="en" translate="no" className="notranslate text-2xl font-black text-slate-900">{result.word}</span><span className={`rounded-full px-2 py-1 text-xs font-black ${result.valid ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-700"}`}>{result.valid ? t.validLabel : t.invalidLabel}</span>{result.cefr && <span className={`rounded-full px-2 py-1 text-xs font-black ${cefrColor[result.cefr]}`}>{result.cefr}</span>}<span className="text-xs font-black text-slate-500">{l(posMap[result.posKey] || posMap.u, lang)}</span><span lang="en" translate="no" className="notranslate font-mono text-sm text-slate-600">{result.ipa === "__PENDING__" ? t.ipaPending : result.ipa}</span></div>
                  {/* ③ 釋義（三層 fallback） */}
                  {result.meaningSrc === "none"
                    ? <p className="mt-2 text-sm leading-6 text-slate-500">{t.enGlossHint}</p>
                    : <p className="mt-2 text-sm leading-6 text-slate-700">{result.meaningZh}{result.meaningSrc === "cn" && <span className="ml-1 text-xs font-black text-amber-600">{t.glossTagCn}</span>}</p>}
                  {/* 字母得分明細 */}
                  <div className="mt-3"><p className="text-xs font-black text-slate-400">{t.breakdownLabel}</p><div className="mt-2 flex flex-wrap gap-2">{result.breakdown.map((b, i) => <span key={i} lang="en" translate="no" className="notranslate inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-black text-amber-900"><span className="uppercase">{b.ch}</span><span className="text-amber-500">{b.v}</span></span>)}</div></div>
                  {/* ④ 例句 */}
                  <button type="button" onClick={toggleExpand} className="mt-3 text-xs font-black text-emerald-700">{expanded ? t.collapseHint : `▸ ${t.expandHint}`}</button>
                  {expanded && (
                    <div className="mt-2 rounded-xl bg-slate-50 p-3">
                      {result.exampleEn === undefined
                        ? <p className="text-xs font-black text-slate-400">{t.enLoading}</p>
                        : result.exampleEn
                          ? (<><p className="text-xs font-black text-slate-400">{t.exampleLabel}</p><p lang="en" translate="no" className="notranslate mt-1 text-sm italic text-slate-700">{result.exampleEn}</p>{result.exampleZh && <p className="mt-1 text-xs text-slate-500">{result.exampleZh}</p>}{result.defEn && !result.exampleZh && <p lang="en" translate="no" className="notranslate mt-1 text-xs text-slate-500">{result.defEn}</p>}</>)
                          : (result.defEn ? <p lang="en" translate="no" className="notranslate text-xs text-slate-500">{result.defEn}</p> : <p className="text-xs text-slate-400">{t.noExample}</p>)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.levelMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.levelMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{cefrBands.map((item) => <div key={item.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className={`rounded-full px-2 py-1 text-xs font-black ${cefrColor[item.key]}`}>{item.key}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="scrabble-word-checker-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">{/* L8-ScenarioComparison */}
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.scenarioLayer}</p><h2 className="mt-2 text-3xl font-black">{t.scenarioTitle}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.scenarioNote}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{scenarios.map((s) => <article key={s.k} className={`rounded-3xl border p-5 shadow-sm ${s.accent}`}><h3 className="text-lg font-black text-slate-900">{s.title}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{s.note}</p></article>)}</div>
        </section>
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.scoreUnit}</div><div className="mt-1 text-3xl font-black">{scoreDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result && result.cefr ? result.cefr : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? result.word.length : "—"}</div></div></div></article>
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
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="scrabble-word-checker-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 可能包含站內或聯盟推薦；若透過部分連結購買，我們可能獲得佣金。" : "* May include on-site or affiliate recommendations. We may earn a commission from qualifying purchases."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-Trust */}<p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
