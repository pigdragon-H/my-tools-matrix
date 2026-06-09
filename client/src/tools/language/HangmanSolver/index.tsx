// @profile B
// Profile B · Language-Hub 自建演算法 · HangmanSolver（GOLD-STANDARD MacroCalculator compatible）
// 吊人遊戲解題器：自建「pattern 比對 + 字母頻率推薦」演算法（輸入已知字母與位置，輸出候選單字清單 + 下一步最佳猜測字母）。
//   原理：輸入如 _pp_e（_=未知），可選排除字母 → 掃內建 cefrDict（21,383 字 3-12 字母）找出長度相符且已知位置吻合、且不含排除字母的所有候選字 → 統計候選字中未知位置最常出現的字母作為「下一個最佳猜測」。
//   差異：word-finder/unscrambler 是「找含/重組字母」；本工具是「依位置 pattern 解吊人題」，輸出候選清單 + 推薦字母。
//   三層中文釋義(繁體優先→ECDICT簡體標「简」→英文定義標EN) + ARPABET→IPA 全照 gold 範本。四要素鐵律：① KK音標 ② 詞類 ③ 釋義 ④ 例句。

import { useState, useCallback, useEffect } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";
import examplesData from "./hangmanExamples.json";

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
//   形態：{ word: [cefr, zh_tw, zh_cn, ipa] }
// 純單字清單（吊人題 pattern 比對用）：hangmanDict.json（21,383 字 3-12 字母）
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
let WORDLIST: string[] | null = null;
let wordlistLoading: Promise<void> | null = null;
function loadWordlist(): Promise<void> {
  if (WORDLIST) return Promise.resolve();
  if (wordlistLoading) return wordlistLoading;
  wordlistLoading = import("./hangmanDict.json").then((m) => { WORDLIST = ((m as { default?: unknown }).default ?? m) as string[]; });
  return wordlistLoading;
}

// ============================================================
// 自建「吊人題 pattern 比對 + 字母頻率推薦」演算法（四要素鐵律）
//   ① 解析 pattern：把使用者輸入正規化為小寫，_ 或 . 或空白視為未知位
//   ② 比對：候選字長度相符、所有已知位置字母吻合、且不含任何排除字母
//   ③ 推薦：統計所有候選字「未知位置」出現的字母頻率，扣掉已知字母與排除字母，取最高者為下一步最佳猜測
// ============================================================
type PatternResult = {
  pattern: string;
  patternLen: number;
  excluded: string[];
  candidates: string[];
  totalCount: number;
  bestGuess: string;
  bestGuessCoverage: number;
};

function parsePattern(raw: string): { pattern: string; len: number } {
  const cleaned = raw.toLowerCase().replace(/[\s.]/g, "_").replace(/[^a-z_]/g, "");
  return { pattern: cleaned, len: cleaned.length };
}

function matchesPattern(word: string, pattern: string, excludedSet: Set<string>): boolean {
  if (word.length !== pattern.length) return false;
  for (let i = 0; i < pattern.length; i++) {
    const p = pattern[i];
    const c = word[i];
    if (p === "_") {
      if (excludedSet.has(c)) return false;
    } else {
      if (p !== c) return false;
    }
  }
  return true;
}

function solveHangman(rawPattern: string, rawExcluded: string, wordlist: string[]): PatternResult {
  const { pattern, len } = parsePattern(rawPattern);
  const excludedArr = Array.from(new Set(rawExcluded.toLowerCase().replace(/[^a-z]/g, "").split("")));
  const knownLetters = new Set(pattern.split("").filter((c) => c !== "_"));
  const excludedSet = new Set(excludedArr.filter((c) => c && !knownLetters.has(c)));
  const out: string[] = [];
  if (pattern && len > 0) {
    for (const w of wordlist) {
      if (matchesPattern(w, pattern, excludedSet)) out.push(w);
    }
  }
  out.sort((a, b) => a.localeCompare(b));
  const freq: Record<string, number> = {};
  const unknownIdx: number[] = [];
  pattern.split("").forEach((c, i) => { if (c === "_") unknownIdx.push(i); });
  for (const w of out) {
    const seen = new Set<string>();
    for (const i of unknownIdx) { const c = w[i]; if (!knownLetters.has(c) && !excludedSet.has(c)) seen.add(c); }
    seen.forEach((c) => { freq[c] = (freq[c] || 0) + 1; });
  }
  let bestGuess = ""; let bestCount = 0;
  for (const [c, n] of Object.entries(freq)) { if (n > bestCount) { bestCount = n; bestGuess = c; } }
  const coverage = out.length > 0 ? Math.round((bestCount / out.length) * 100) : 0;
  return {
    pattern, patternLen: len, excluded: Array.from(excludedSet),
    candidates: out.slice(0, 60), totalCount: out.length,
    bestGuess: bestGuess.toUpperCase(), bestGuessCoverage: coverage,
  };
}

// ARPABET → 美式 IPA（dict 未帶 IPA 時的 fallback；本支主要直接讀 dict[3]）
const ARP_IPA: Record<string, string> = {
  AA: "ɑ", AE: "æ", AH: "ʌ", AO: "ɔ", AW: "aʊ", AY: "aɪ", B: "b", CH: "tʃ", D: "d", DH: "ð",
  EH: "ɛ", ER: "ɜr", EY: "eɪ", F: "f", G: "ɡ", HH: "h", IH: "ɪ", IY: "i", JH: "dʒ", K: "k",
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
  word: string; cefr: Cefr; posKey: string; ipa: string;
  meaningZh: string; meaningSrc: MeaningSrc;
  exampleEn?: string; exampleZh?: string; defEn?: string; enriched?: boolean;
};

const cefrColor: Record<string, string> = {
  A1: "bg-emerald-100 text-emerald-800", A2: "bg-emerald-100 text-emerald-800",
  B1: "bg-sky-100 text-sky-800", B2: "bg-sky-100 text-sky-800",
  C1: "bg-violet-100 text-violet-800", C2: "bg-violet-100 text-violet-800",
};
const HOT_PATTERNS = [
  { pat: "_pp_e" },
  { pat: "_a__le" },
  { pat: "rh____" },
  { pat: "_____n" },
  { pat: "p____e" },
  { pat: "____er" },
] as const;

const cefrBands = [
  { key: "A1", label: { zh: "底線 _", en: "Blank _" }, desc: { zh: "用底線 _（或英文句點 .）代表還沒猜出的位置，例如 _pp_e。", en: "Use underscore _ (or a period .) for positions not yet guessed, e.g. _pp_e." } },
  { key: "A2", label: { zh: "已知字母", en: "Known letters" }, desc: { zh: "已經猜對、位置確定的字母直接填進去，大小寫皆可。", en: "Fill in letters you already guessed correctly at fixed positions; case-insensitive." } },
  { key: "B1", label: { zh: "排除字母", en: "Wrong letters" }, desc: { zh: "把已經猜錯的字母填到「排除」欄，候選字會自動剔除含這些字母的單字。", en: "Put already-guessed wrong letters in the Excluded field; candidates containing them are filtered out." } },
  { key: "B2", label: { zh: "候選清單", en: "Candidates" }, desc: { zh: "符合長度、已知位置且不含排除字母的所有單字，依字母序列出。", en: "All words matching the length and known positions and free of excluded letters, listed alphabetically." } },
  { key: "C1", label: { zh: "推薦字母", en: "Best guess" }, desc: { zh: "依候選字「未知位置」字母出現頻率，推薦下一個最該猜的字母與覆蓋率。", en: "Recommends the next letter to guess by frequency across unknown positions, with its coverage rate." } },
  { key: "C2", label: { zh: "四要素", en: "Four elements" }, desc: { zh: "每個候選字都附 KK 音標、詞類、繁中釋義與例句，邊解題邊背單字。", en: "Each candidate carries IPA, part of speech, Chinese gloss, and an example, so you learn while solving." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "字母重組器", en: "Word Unscrambler" }, href: "/tools/language/word-unscrambler" },
  { label: { zh: "找字工具", en: "Word Finder" }, href: "/tools/language/word-finder" },
  { label: { zh: "Scrabble 單字驗證", en: "Scrabble Word Checker" }, href: "/tools/language/scrabble-word-checker" },
  { label: { zh: "CEFR 等級估算", en: "CEFR Level Estimator" }, href: "/tools/language/cefr-level-estimator" },
];

const ui = {
  zh: {
    badge: "語言 · 吊人遊戲解題 · Language Hub", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "吊人遊戲解題器 · Hangman Solver", subtitle: "輸入已知字母與位置（如 _pp_e），系統依內建 21,383 字詞庫比對所有可能單字，並依字母頻率推薦下一個最佳猜測字母，每個候選字附 KK 音標、詞類、繁中釋義與例句",
    intro: "吊人遊戲解題器採用自建的「pattern 比對 + 字母頻率推薦」演算法：您把已經確定的字母填到對應位置、未知位置用底線 _ 代替（例如 _pp_e），再把已經猜錯的字母填到「排除」欄，工具就會掃內建 21,383 字的詞庫，找出長度相符、已知位置吻合、且不含任何排除字母的所有候選單字，依字母序列出。接著它會統計這些候選字「未知位置」最常出現的字母，推薦您下一個最該猜的字母與覆蓋率，幫您用最少的猜測次數破關。每個候選字都標註 CEFR 難度、IPA 音標、詞性與繁體中文釋義，可展開查看英文定義與例句。本工具為純前端演算法，不依賴外部 API 取候選結果。",
    trustNoteLabel: "資料來源：", trustNote: "候選字比對以自建演算法比對內建 21,383 字詞庫產生（純前端，不依賴外部 API）；字母頻率推薦依候選字未知位置統計；CEFR 等級以 CEFR-J 與 Octanove 權威詞表對照；中文釋義以編輯團隊人工撰寫的繁體中文為優先，尚無繁體者改顯示 ECDICT 開源詞典的簡體釋義（標註「简」），繁簡皆無者展開即顯示英文定義；IPA 音標取自 ECDICT 與 ARPABET 轉換；例句來自 Free Dictionary API。僅供學習與娛樂參考。",
    quickActionCard: "快速解題卡", tryExample: "一鍵解 _pp_e", examplePreview: "候選字數", examplePerson: "推薦字母", fillExample: "解題 _pp_e", previewActivePath: "解題 _a__le",
    examplesCalculator: "範例 → 解題", enterValues: "輸入題目", examplesHelper: "先用熱門範例了解候選清單、推薦字母與四要素如何呈現，再換成您自己正在玩的吊人題目。底線 _ 代表未知位置。",
    queryBtn: "解題", clearBtn: "清除", hotWords: "熱門題型", inputPlaceholder: "輸入 pattern，用 _ 代表未知，例如 _pp_e", excludedPlaceholder: "排除字母（已猜錯），例如 tsr",
    patternLabel: "題目 pattern", excludedLabel: "排除字母（已猜錯）",
    loading: "解題中…", emptyHint: "在上方輸入題目 pattern（用 _ 代表未知位置）並按「解題」，候選清單、推薦字母與四要素會顯示在這裡。", noResult: "查無符合的候選字。請確認 pattern 長度、已知字母位置與排除字母是否正確；極罕見字未必收錄。",
    fallbackTitle: "詞庫載入中", fallbackBody: "正在載入內建詞庫，請稍候再試一次。",
    resultCard: "解題結果", countUnit: "個候選字", bestGuessLabel: "推薦下一步", coverageLabel: "覆蓋率", patternEcho: "題目", lenLabel: "長度", noBestGuess: "—", candidateListLabel: "候選單字清單", moreHint: "顯示前 60 個候選字，縮小範圍可看到全部。",
    ipaLabel: "音標", ipaPending: "/音標整理中/", meaningLabel: "釋義", glossTagCn: "(简)", glossTagEn: "(EN)", enGlossHint: "展開看英文定義與例句", expandHint: "展開看例句", collapseHint: "收合", exampleLabel: "例句", enLoading: "載入例句中…", noExample: "查無例句，建議造句練習。",
    resultIntelligence: "結果解讀", levelMatrix: "六步看懂解題器", levelMatrixNote: "L7 用六個欄位說明從輸入 pattern 到拿到推薦字母的完整流程，第一次用也能上手。",
    scenarioLayer: "使用場景", scenarioTitle: "什麼時候用吊人解題器", scenarioNote: "L8 列出四個典型場景，把解題器用在對的地方，而不是死背字母。",
    scenarioExam: "吊人遊戲", scenarioExamNote: "玩 Hangman 或猜字遊戲卡關時，輸入已知 pattern 與猜錯字母，立刻看到候選清單與下一步最佳猜測。", scenarioWriting: "填字遊戲", scenarioWritingNote: "報紙填字、Wordle 類遊戲，依已知字母位置縮小候選範圍，再從清單挑符合語意的字。", scenarioDaily: "單字學習", scenarioDailyNote: "依長度與已知字母練習回想單字，順便看候選字的 CEFR 等級、音標與釋義，鞏固記憶。", scenarioBusiness: "教學出題", scenarioBusinessNote: "老師設計吊人題或拼字練習時，快速確認某 pattern 下有哪些合法答案，避免出到無解題目。",
    progressInsight: "解題洞察卡", possibleTarget: "候選字數", dailyGap: "推薦字母", weeklyTrend: "覆蓋率", motivation: "動力卡", keepMomentum: "從盲猜走向用機率與字母頻率主動破關",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天解出的高頻字帶回家", journeyHint: "挑 2–3 個候選清單裡您不認得的字查釋義並造句，玩遊戲也能順便背單字。",
    nextActionLabel: "下一步行動", nextActionTitle: "把這個 pattern 接到下一個工具", nextActionItem1: "用字母重組器把已知字母重組成其他可能單字", nextActionItem2: "用 Scrabble 單字驗證確認候選字是否合法、能拿幾分", nextActionItem3: "用字根分析器理解候選字的語義從何而來，記得更牢",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "解題路徑", decisionTitle: "輸入 → 比對 → 推薦 → 應用", step1: "輸入 pattern", step2: "比對候選", step3: "看推薦字母", step4: "用在遊戲",
    knowledge: "知識", knowledgeTitle: "吊人遊戲解題在英語學習中的意義", definition: "定義", definitionText: "吊人遊戲解題是依「已知字母位置」與「已排除字母」兩項約束，從詞庫中篩出所有可能的目標單字，並用字母頻率推薦下一個最該猜的字母；這是 Hangman、填字遊戲與 Wordle 類解題的核心策略。", usage: "用法", usageText: "把已確定的字母填到對應位置、未知位置用 _ 代替，再把猜錯的字母填到排除欄；演算法掃描詞庫找出所有符合的候選字，再統計未知位置的字母頻率，推薦覆蓋最多候選字的字母作為下一步。", limitations: "限制", limitationsText: "本工具的詞庫為內建 21,383 字常用詞庫（3–12 字母），並非完整英文字典，極罕見字、專有名詞與多數變化形未必收錄；推薦字母為機率最佳解，不保證一定命中。", interpretation: "解讀", interpretationText: "候選字越少代表 pattern 約束越強、越接近答案；推薦字母的覆蓋率越高（接近 100%），猜中或進一步縮小範圍的機會越大。覆蓋率低時表示候選字分歧，需要再多一兩條線索。", context: "脈絡", contextText: "吊人解題應與字母重組、Scrabble 驗證、CEFR 估算一起用：解出候選字後，重組它的字母找更多字、驗證合法性與分數，或查語義與來源，把遊戲變成有效的學字工具。", example: "範例", exampleText: "輸入 _pp_e、排除 tsr → 候選含 apple；輸入 rh____ → 候選含 rhythm 等以 rh 開頭的六字母字。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "相關工具", affiliateTitle: "解題的下一步工具", premiumTitle: "PRO 解題大師包", premiumText: "解鎖無限解題、一次比對多個 pattern、依 CEFR 篩選候選字、自動記錄解題歷史，並把候選清單匯出複習。",
    feat1: "無限解題次數", feat2: "多 pattern 比對", feat3: "候選依 CEFR 篩選", feat4: "候選清單匯出",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供英語學習與猜字遊戲娛樂用途；候選字以自建演算法比對內建詞庫產生，並非完整英文字典；推薦字母為字母頻率機率解，CEFR 等級為詞表對照與啟發式推估。", relatedTools: "相關工具", relatedToolsText: "Word Unscrambler · Word Finder · Scrabble Word Checker · CEFR Level Estimator", references: "參考資料", referencesText: "自建「pattern 比對 + 字母頻率推薦」演算法（純前端，比對內建 21,383 字詞庫）；CEFR-J Wordlist v1.5（Tono Lab, TUFS）；Octanove C1/C2 Vocabulary Profile（CC BY-SA 4.0）；ECDICT 開源英漢詞典（IPA 音標與簡體釋義）；繁體中文釋義由編輯團隊人工撰寫；Free Dictionary API（例句）。",
    q1: "pattern 要怎麼輸入？", a1: "把您已經猜對、位置確定的字母直接填進去，還沒猜出的位置用底線 _（或英文句點 .）代替。例如吊人題顯示「_ p p _ e」，就輸入 _pp_e。長度必須和題目格數相同。",
    q2: "「排除字母」是做什麼的？", a2: "把您已經猜錯、確定不在答案裡的字母填到排除欄（如 tsr），工具會自動把含這些字母的候選字剔除，大幅縮小範圍。已知位置的字母不必再填進排除欄。",
    q3: "推薦字母是怎麼算的？", a3: "工具統計所有候選字在「未知位置」出現的字母，取覆蓋最多候選字的字母作為下一步推薦，並顯示覆蓋率。覆蓋率越高，猜中或縮小範圍的把握越大；這是吊人遊戲的最佳策略。",
    q4: "音標和中文釋義從哪來？", a4: "IPA 音標取自 ECDICT 開源英漢詞典（內建 2 萬餘字），詞庫未收錄者改以 ARPABET 即時轉換 IPA；中文釋義採三層優先序——編輯團隊人工撰寫的繁體中文優先（無標註），尚無繁體者改顯示 ECDICT 簡體釋義並標註「简」，繁簡皆無者展開即顯示英文定義（標註 EN）。全程不經機器翻譯。例句來自 Free Dictionary API。",
    q5: "本工具和「字母重組器」「找字工具」有什麼不同？", a5: "字母重組器是把一堆字母重排成單字、找字工具是找含特定字母的字；本工具是「依位置 pattern 解吊人題」——您給已知字母的位置與排除字母，它依長度與位置約束找出所有可能答案，並推薦下一步該猜的字母。",
    q6: "為什麼有些題目查無候選字？", a6: "若 pattern 長度、已知字母位置或排除字母有誤，或目標字屬於內建 21,383 字詞庫未收錄的極罕見字、專有名詞、變化形，就可能查無候選字。請先確認輸入無誤，再放寬排除字母重試。",
  },
  en: {
    badge: "Language · Hangman Solver · Language Hub", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Hangman Solver", subtitle: "Enter known letters and positions (e.g. _pp_e); the tool matches all possible words against a built-in 21,383-word dictionary and recommends the next best letter to guess by frequency, with IPA, part of speech, Chinese gloss, and an example for each candidate",
    intro: "The Hangman Solver uses a custom pattern-matching and letter-frequency algorithm: fill in the letters you have already guessed correctly at their positions, use an underscore _ for unknown positions (e.g. _pp_e), then list the letters you have already guessed wrong in the Excluded field. The tool scans a built-in 21,383-word dictionary and finds every candidate word that matches the length and known positions and contains none of the excluded letters, listed alphabetically. It then counts the letters appearing most often across the unknown positions of those candidates and recommends the next best letter to guess, with its coverage rate, helping you win in the fewest guesses. Each candidate is tagged with its CEFR level, IPA, part of speech, and Chinese gloss, expandable to show an English definition and example. This tool is a pure front-end algorithm and fetches no external API for candidates.",
    trustNoteLabel: "Data source:", trustNote: "Candidates are produced by a custom algorithm matched against a built-in 21,383-word dictionary (pure front-end, no external API); the recommended letter is computed from letter frequency across the candidates' unknown positions; CEFR levels are matched against the CEFR-J and Octanove wordlists; Chinese glosses prioritize the editorial team's hand-written Traditional Chinese, falling back to ECDICT's Simplified gloss (tagged Simp) and then an English definition; IPA comes from ECDICT and ARPABET conversion; examples come from the Free Dictionary API. For study and entertainment reference only.",
    quickActionCard: "Quick Solve Card", tryExample: "Solve _pp_e", examplePreview: "Candidates", examplePerson: "Best guess", fillExample: "Solve _pp_e", previewActivePath: "Solve _a__le",
    examplesCalculator: "Examples → Solve", enterValues: "Enter the puzzle", examplesHelper: "Start with a popular example to see how the candidate list, recommended letter, and four elements appear, then swap in your own hangman puzzle. Use _ for unknown positions.",
    queryBtn: "Solve", clearBtn: "Clear", hotWords: "Popular patterns", inputPlaceholder: "Enter a pattern, use _ for unknown, e.g. _pp_e", excludedPlaceholder: "Excluded letters (already wrong), e.g. tsr",
    patternLabel: "Pattern", excludedLabel: "Excluded letters (already wrong)",
    loading: "Solving…", emptyHint: "Enter a pattern above (use _ for unknown positions) and press Solve; the candidate list, recommended letter, and four elements appear here.", noResult: "No matching candidates. Check the pattern length, known letter positions, and excluded letters; very rare words may not be included.",
    fallbackTitle: "Loading dictionary", fallbackBody: "The built-in dictionary is loading, please try again shortly.",
    resultCard: "Solve Result", countUnit: "candidates", bestGuessLabel: "Best next guess", coverageLabel: "Coverage", patternEcho: "Pattern", lenLabel: "Length", noBestGuess: "—", candidateListLabel: "Candidate words", moreHint: "Showing the first 60 candidates; narrow the pattern to see all.",
    ipaLabel: "IPA", ipaPending: "/pending/", meaningLabel: "Gloss", glossTagCn: "(Simp)", glossTagEn: "(EN)", enGlossHint: "See English definition & example on expand", expandHint: "Show example", collapseHint: "Collapse", exampleLabel: "Example", enLoading: "Loading example…", noExample: "No example found; try writing your own.",
    resultIntelligence: "Result Intelligence", levelMatrix: "Six steps to read the solver", levelMatrixNote: "L7 explains the full flow from entering a pattern to getting the recommended letter in six fields, easy even on the first try.",
    scenarioLayer: "Use scenarios", scenarioTitle: "When to use the Hangman Solver", scenarioNote: "L8 lists four typical scenarios so you use the solver in the right place, not just rote-guessing letters.",
    scenarioExam: "Hangman games", scenarioExamNote: "When stuck in Hangman or guessing games, enter the known pattern and wrong letters to instantly see the candidate list and the best next guess.", scenarioWriting: "Crosswords", scenarioWritingNote: "For newspaper crosswords and Wordle-style games, narrow candidates by known letter positions, then pick the word that fits the meaning.", scenarioDaily: "Vocabulary learning", scenarioDailyNote: "Practice recalling words by length and known letters, while checking the candidates' CEFR level, IPA, and gloss to reinforce memory.", scenarioBusiness: "Teaching", scenarioBusinessNote: "When designing hangman or spelling exercises, quickly confirm which legal answers exist for a pattern to avoid unsolvable puzzles.",
    progressInsight: "Solve Insight Card", possibleTarget: "Candidates", dailyGap: "Best guess", weeklyTrend: "Coverage", motivation: "Motivation Card", keepMomentum: "Move from blind guessing to winning with probability and letter frequency",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's high-frequency words home", journeyHint: "Look up and make sentences with 2–3 candidate words you didn't know; play games and learn words at once.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this pattern to the next tool", nextActionItem1: "Use Word Unscrambler to rearrange the known letters into other possible words", nextActionItem2: "Use Scrabble Word Checker to verify candidates are legal and how many points they score", nextActionItem3: "Use Word Root Analyzer to understand where a candidate's meaning comes from and remember it better",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Solve Path", decisionTitle: "Input → Match → Recommend → Apply", step1: "Enter pattern", step2: "Match candidates", step3: "See best guess", step4: "Use in game",
    knowledge: "Knowledge", knowledgeTitle: "What hangman solving means in English learning", definition: "Definition", definitionText: "Hangman solving filters all possible target words from a dictionary under two constraints — known letter positions and excluded letters — then recommends the next best letter to guess by frequency; this is the core strategy of Hangman, crosswords, and Wordle-style puzzles.", usage: "Usage", usageText: "Fill known letters at their positions, use _ for unknown positions, and list wrong letters in the Excluded field; the algorithm scans the dictionary for all matching candidates, then counts letter frequency across unknown positions and recommends the letter covering the most candidates.", limitations: "Limitations", limitationsText: "The dictionary is a built-in 21,383-word common-word list (3–12 letters), not a full English dictionary; very rare words, proper nouns, and most inflections may not be included; the recommended letter is the probabilistic best, not a guaranteed hit.", interpretation: "Interpretation", interpretationText: "Fewer candidates means a stronger pattern constraint and a closer answer; a higher coverage rate (near 100%) for the recommended letter means a better chance of a hit or further narrowing. Low coverage means candidates diverge and you need another clue or two.", context: "Context", contextText: "Hangman solving should be used with unscrambling, Scrabble checking, and CEFR estimation: after solving candidates, rearrange their letters for more words, verify legality and score, or look up meaning and origin to turn the game into an effective vocabulary tool.", example: "Example", exampleText: "Enter _pp_e, exclude tsr → candidates include apple; enter rh____ → candidates include rhythm and other six-letter rh- words.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Related Tools", affiliateTitle: "Next tools for solving", premiumTitle: "PRO Solver Master Pack", premiumText: "Unlock unlimited solves, match multiple patterns at once, filter candidates by CEFR, auto-log solve history, and export candidate lists for review.",
    feat1: "Unlimited solves", feat2: "Multi-pattern match", feat3: "CEFR-filtered candidates", feat4: "Export candidate list",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for English learning and word-guessing entertainment only; candidates are produced by a custom algorithm matched against a built-in dictionary, not a full English dictionary; the recommended letter is a frequency-based probabilistic answer, and CEFR levels are wordlist matches plus a heuristic.", relatedTools: "Related Tools", relatedToolsText: "Word Unscrambler · Word Finder · Scrabble Word Checker · CEFR Level Estimator", references: "References", referencesText: "Custom pattern-matching and letter-frequency algorithm (pure front-end, matched against a built-in 21,383-word dictionary); CEFR-J Wordlist v1.5 (Tono Lab, TUFS); Octanove C1/C2 Vocabulary Profile (CC BY-SA 4.0); ECDICT open EN-ZH dictionary (IPA and Simplified glosses); Traditional Chinese glosses hand-written by the editorial team; Free Dictionary API (examples).",
    q1: "How do I enter a pattern?", a1: "Fill in the letters you have already guessed correctly at their fixed positions, and use an underscore _ (or a period .) for positions not yet guessed. For a hangman puzzle showing _ p p _ e, enter _pp_e. The length must match the number of slots.",
    q2: "What is the Excluded field for?", a2: "List the letters you have already guessed wrong and confirmed are not in the answer (e.g. tsr); the tool automatically removes candidates containing those letters to greatly narrow the range. Letters at known positions need not be re-listed.",
    q3: "How is the recommended letter computed?", a3: "The tool counts the letters appearing across the unknown positions of all candidates and recommends the one covering the most candidates as the next guess, showing its coverage rate. Higher coverage means a better chance of a hit or narrowing; this is the optimal hangman strategy.",
    q4: "Where do the IPA and Chinese gloss come from?", a4: "IPA comes from the open ECDICT EN-ZH dictionary (over 20k words built in); unlisted words convert ARPABET to IPA on the fly. Chinese glosses use a three-tier priority — hand-written Traditional Chinese first (no tag), then ECDICT's Simplified gloss tagged Simp, then an English definition tagged EN. No machine translation is used. Examples come from the Free Dictionary API.",
    q5: "How is this different from Word Unscrambler / Word Finder?", a5: "Word Unscrambler rearranges a set of letters into words, and Word Finder finds words containing specific letters; this tool solves hangman by position pattern — you give the known letter positions and excluded letters, and it finds all possible answers by length and position, then recommends the next letter to guess.",
    q6: "Why do some puzzles return no candidates?", a6: "If the pattern length, known letter positions, or excluded letters are wrong, or the target is a very rare word, proper noun, or inflection not in the built-in 21,383-word dictionary, no candidates may appear. Confirm your input first, then relax the excluded letters and retry.",
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

// 由 word 建一張 WordCard（四要素）
function buildCard(word: string): WordCard {
  const dict = DICT ? DICT[word] : undefined;
  const cefr: Cefr = dict && dict[0] ? (dict[0] as Cefr) : lenToCefr(word.length);
  const zhTw = dict && dict[1] ? dict[1] : "";
  const zhCn = dict && dict[2] ? dict[2] : "";
  const ipaRaw = dict && dict[3] ? normIpa(dict[3]) : "";
  const ipa = ipaRaw || (dict && dict[3] ? arpabetToIpa(dict[3]) : "") || "__PENDING__";
  const posKey = posFromGloss(zhTw || zhCn);
  let meaningZh = "", meaningSrc: MeaningSrc = "none";
  if (zhTw) { meaningZh = zhTw; meaningSrc = "tw"; }
  else if (zhCn) { meaningZh = zhCn; meaningSrc = "cn"; }
  const card: WordCard = { word, cefr, posKey, ipa, meaningZh, meaningSrc };
  const ex = EXAMPLES[word];
  if (ex) { card.exampleEn = ex.exampleEn; card.exampleZh = ex.exampleZh; card.enriched = true; }
  return card;
}

export default function HangmanSolver() {
  const { lang, setLang } = useLanguage();
  const t = ui[lang];
  const [pattern, setPattern] = useState("_pp_e");
  const [excluded, setExcluded] = useState("tsr");
  const [solveResult, setSolveResult] = useState<PatternResult | null>(null);
  const [cards, setCards] = useState<WordCard[]>([]);
  const [solved, setSolved] = useState<boolean | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => { loadDict(); loadWordlist(); }, []);

  const runQuery = useCallback(async (rawPattern: string, rawExcluded: string) => {
    const { pattern: p } = parsePattern(rawPattern);
    if (!p) return;
    setLoading(true);
    setExpanded(null);
    await Promise.all([loadDict(), loadWordlist()]);
    const res = solveHangman(rawPattern, rawExcluded, WORDLIST || []);
    setSolveResult(res);
    setCards(res.candidates.map(buildCard));
    setSolved(true);
    setLoading(false);
  }, []);

  const toggleExpand = useCallback(async (word: string) => {
    if (expanded === word) { setExpanded(null); return; }
    setExpanded(word);
    const target = cards.find((c) => c.word === word);
    if (target && target.exampleEn === undefined) {
      const ex = await fetchExample(word);
      setCards((prev) => prev.map((c) => c.word === word ? { ...c, exampleEn: ex?.exampleEn || "", defEn: ex?.defEn || "", enriched: true } : c));
    }
  }, [expanded, cards]);

  function fillStandard() { setPattern("_pp_e"); setExcluded("tsr"); runQuery("_pp_e", "tsr"); }
  function fillCut() { setPattern("_a__le"); setExcluded(""); runQuery("_a__le", ""); }
  function clearAll() { setPattern(""); setExcluded(""); setSolveResult(null); setCards([]); setSolved(undefined); setExpanded(null); }

  const countDisplay = solveResult ? String(solveResult.totalCount) : "—";
  const bestGuessDisplay = solveResult && solveResult.bestGuess ? solveResult.bestGuess : t.noBestGuess;
  const coverageDisplay = solveResult && solveResult.bestGuess ? `${solveResult.bestGuessCoverage}%` : "—";

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{countDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.countUnit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div lang="en" translate="no" className="notranslate font-black">{bestGuessDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.coverageLabel}</div><div className="font-black">{coverageDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.lenLabel}</div><div className="font-black">{solveResult ? solveResult.patternLen : "—"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Query */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.hotWords}</h3><div className="mt-4 flex flex-wrap gap-2">{HOT_PATTERNS.map((w) => <button key={w.pat} lang="en" translate="no" onClick={() => { setPattern(w.pat); setExcluded(""); runQuery(w.pat, ""); }} className="notranslate rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-black text-emerald-800">{w.pat}</button>)}</div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.enterValues}</h3><div className="mt-4 space-y-3"><div><label className="text-xs font-black text-slate-500">{t.patternLabel}</label><input lang="en" translate="no" className="notranslate mt-1 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={pattern} placeholder={t.inputPlaceholder} onChange={(e) => setPattern(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") runQuery(pattern, excluded); }} /></div><div><label className="text-xs font-black text-slate-500">{t.excludedLabel}</label><input lang="en" translate="no" className="notranslate mt-1 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={excluded} placeholder={t.excludedPlaceholder} onChange={(e) => setExcluded(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") runQuery(pattern, excluded); }} /></div><div className="flex flex-col gap-3 sm:flex-row"><button onClick={() => runQuery(pattern, excluded)} className="rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-black text-white">{t.queryBtn}</button><button onClick={clearAll} className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700">{t.clearBtn}</button></div></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{countDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.countUnit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.bestGuessLabel}</div><div lang="en" translate="no" className="notranslate mt-1 text-4xl font-black">{bestGuessDisplay}</div><div className="mt-1 text-xs text-slate-300">{t.coverageLabel} {coverageDisplay}</div></div></div>
            <div className="mt-6 space-y-3">
              {loading && <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm font-black text-slate-600">{t.loading}</div>}
              {!loading && solved === undefined && <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm font-black text-slate-500">{t.emptyHint}</div>}
              {!loading && solved === true && cards.length === 0 && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center text-sm font-black text-rose-700">{t.noResult}</div>}
              {!loading && solved === true && cards.length > 0 && (
                <>
                  {solveResult && <div className="flex flex-wrap items-center gap-2 text-xs font-black text-slate-500"><span>{t.patternEcho}</span><span lang="en" translate="no" className="notranslate rounded-lg bg-slate-100 px-2 py-1 font-mono uppercase text-slate-800">{solveResult.pattern}</span></div>}
                  <p className="text-xs font-black text-slate-400">{t.candidateListLabel}</p>
                  {cards.map((card) => (
                    <div key={card.word} className="rounded-2xl border border-slate-200/60 bg-white/80 p-4 backdrop-blur">
                      <div className="flex flex-wrap items-center gap-3"><span lang="en" translate="no" className="notranslate text-xl font-black text-slate-900">{card.word}</span>{card.cefr && <span className={`rounded-full px-2 py-1 text-xs font-black ${cefrColor[card.cefr]}`}>{card.cefr}</span>}<span className="text-xs font-black text-slate-500">{l(posMap[card.posKey] || posMap.u, lang)}</span><span lang="en" translate="no" className="notranslate font-mono text-sm text-slate-600">{card.ipa === "__PENDING__" ? t.ipaPending : card.ipa}</span></div>
                      {/* ③ 釋義（三層 fallback） */}
                      {card.meaningSrc === "none"
                        ? <p className="mt-2 text-sm leading-6 text-slate-500">{t.enGlossHint}</p>
                        : <p className="mt-2 text-sm leading-6 text-slate-700">{card.meaningZh}{card.meaningSrc === "cn" && <span className="ml-1 text-xs font-black text-amber-600">{t.glossTagCn}</span>}</p>}
                      {/* ④ 例句 */}
                      <button type="button" onClick={() => toggleExpand(card.word)} className="mt-2 text-xs font-black text-emerald-700">{expanded === card.word ? t.collapseHint : `▸ ${t.expandHint}`}</button>
                      {expanded === card.word && (
                        <div className="mt-2 rounded-xl bg-slate-50 p-3">
                          {card.exampleEn === undefined
                            ? <p className="text-xs font-black text-slate-400">{t.enLoading}</p>
                            : card.exampleEn
                              ? (<><p className="text-xs font-black text-slate-400">{t.exampleLabel}</p><p lang="en" translate="no" className="notranslate mt-1 text-sm italic text-slate-700">{card.exampleEn}</p>{card.exampleZh && <p className="mt-1 text-xs text-slate-500">{card.exampleZh}</p>}{card.defEn && !card.exampleZh && <p lang="en" translate="no" className="notranslate mt-1 text-xs text-slate-500">{card.defEn}</p>}</>)
                              : (card.defEn ? <p lang="en" translate="no" className="notranslate text-xs text-slate-500">{card.defEn}</p> : <p className="text-xs text-slate-400">{t.noExample}</p>)}
                        </div>
                      )}
                    </div>
                  ))}
                  {solveResult && solveResult.totalCount > solveResult.candidates.length && <p className="text-xs text-slate-400">{t.moreHint}</p>}
                </>
              )}
            </div>
          </div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.levelMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.levelMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{cefrBands.map((item) => <div key={item.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className={`rounded-full px-2 py-1 text-xs font-black ${cefrColor[item.key]}`}>{item.key}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="hangman-solver-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">{/* L8-ScenarioComparison */}
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.scenarioLayer}</p><h2 className="mt-2 text-3xl font-black">{t.scenarioTitle}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.scenarioNote}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{scenarios.map((s) => <article key={s.k} className={`rounded-3xl border p-5 shadow-sm ${s.accent}`}><h3 className="text-lg font-black text-slate-900">{s.title}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{s.note}</p></article>)}</div>
        </section>
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.countUnit}</div><div className="mt-1 text-3xl font-black">{countDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div lang="en" translate="no" className="notranslate mt-1 text-3xl font-black text-blue-950">{bestGuessDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{coverageDisplay}</div></div></div></article>
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
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="hangman-solver-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 相關 Language Hub 工具，免費使用。" : "* Related Language Hub tools, free to use."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-Trust */}<p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
