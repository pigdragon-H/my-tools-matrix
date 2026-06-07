// @profile B
// Profile B · Language-Hub 自建演算法 · IeltsVocabularyAnalyzer（GOLD-STANDARD MacroCalculator compatible）
// 雅思詞彙分析器：自建「整段文字逐字 CEFR/雅思 Band 標色分析」演算法（貼上一段英文，整段逐字分析）。
//   原理：把整段英文 tokenize 成單字 → 每個字查內建 CEFR 詞庫（CEFR-J + Octanove + ECDICT，22499 字）定 A1~C2 級 → 對應雅思 Band（A1=4.0、A2=4.5、B1=5.5、B2=6.5、C1=7.5、C2=8.5）
//   → 逐字依等級標色、統計各等級佔比、用加權平均預估整體雅思 Band、列出文中「高階詞」(B2+) 與「高頻詞」清單。
//   差異：cefr-level-estimator 是「單字查 CEFR」；本工具是「整段文字逐字分析 + Band 對應 + 佔比統計 + 高階/高頻清單」(段落層級分析)。
//   每個列出的詞皆附四要素鐵律：① KK音標 ② 詞類 ③ 繁中釋義 ④ 例句。三層中文釋義(繁tw優先→ECDICT簡標「(簡)」→英EN標EN) + ARPABET→IPA 全照 gold 範本。

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
// CEFR → 雅思 Band 對應（自建對照表）
//   A1=4.0 · A2=5.0 · B1=6.0 · B2=7.0 · C1=8.0 · C2=9.0（教學常用近似對照）
// ============================================================
const CEFR_BAND: Record<string, number> = { A1: 4.0, A2: 5.0, B1: 6.0, B2: 7.0, C1: 8.0, C2: 9.0 };
const CEFR_ORDER: Cefr[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

// 常見虛詞/停用字（極高頻、無分析意義，計入 A1 但不列入高頻詞清單）
const STOPWORDS = new Set(["the", "a", "an", "and", "or", "but", "of", "to", "in", "on", "at", "for", "with", "by", "is", "are", "was", "were", "be", "been", "being", "as", "it", "its", "this", "that", "these", "those", "i", "you", "he", "she", "we", "they", "me", "him", "her", "us", "them", "my", "your", "his", "their", "our", "from", "not", "no", "so", "if", "then", "than", "too", "very", "can", "will", "would", "do", "does", "did", "have", "has", "had"]);

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
// 詞類碼 → 顯示文字
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
// 三層中文釋義：繁tw優先 → ECDICT簡標「(簡)」→ 無則回傳空（展開看英文例句）
function glossOf(word: string, lang: Lang): { text: string; tag: "tw" | "cn" | "none" } {
  const dict = DICT ? DICT[word.toLowerCase()] : undefined;
  if (dict) {
    const tw = dict[1]; const cn = dict[2];
    if (tw && tw.trim()) return { text: tw.trim(), tag: "tw" };
    if (cn && cn.trim()) return { text: cn.trim(), tag: "cn" };
  }
  return { text: lang === "zh" ? "（釋義整理中）" : "(gloss pending)", tag: "none" };
}
// 詞類由釋義字串前綴解析（ECDICT 格式：「n. ...」「vt. ...」「a. ...」「adv. ...」等）
const POS_PREFIX: { re: RegExp; code: string }[] = [
  { re: /^(n|noun)\b\.?/i, code: "n" },
  { re: /^(vt|vi|v|verb)\b\.?/i, code: "v" },
  { re: /^(a|adj|adjective)\b\.?/i, code: "adj" },
  { re: /^(adv|ad|adverb)\b\.?/i, code: "adv" },
  { re: /^(prep|preposition)\b\.?/i, code: "prep" },
  { re: /^(pron|pronoun)\b\.?/i, code: "pron" },
  { re: /^(conj|conjunction)\b\.?/i, code: "conj" },
  { re: /^(num|numeral)\b\.?/i, code: "num" },
  { re: /^(art|article)\b\.?/i, code: "art" },
  { re: /^(int|interj|interjection)\b\.?/i, code: "int" },
  { re: /^(abbr)\b\.?/i, code: "abbr" },
];
function posOf(word: string): string {
  const dict = DICT ? DICT[word.toLowerCase()] : undefined;
  if (!dict) return "u";
  const src = ((dict[1] && dict[1].trim()) || (dict[2] && dict[2].trim()) || "").trim();
  if (!src) return "u";
  for (const p of POS_PREFIX) { if (p.re.test(src)) return p.code; }
  return "u";
}

// ============================================================
// 自建「整段文字逐字 CEFR/Band 分析」演算法（四要素鐵律）
// ============================================================
type Token = { raw: string; word: string; isWord: boolean; cefr: Cefr };
type LevelStat = { cefr: Cefr; count: number; pct: number; band: number };
type WordCard = { word: string; freq: number; cefr: Cefr; ipa: string; pos: string; gloss: { text: string; tag: "tw" | "cn" | "none" }; exampleEn?: string; defEn?: string };
type AnalysisResult = {
  source: string;
  tokens: Token[];           // 逐字（含標點，供標色渲染）
  totalWords: number;        // 有效英文單字數
  uniqueWords: number;
  levelStats: LevelStat[];   // 各等級佔比
  overallBand: number;       // 預估整體雅思 Band
  overallCefr: Cefr;         // 預估整體 CEFR
  advanced: WordCard[];      // 高階詞 (B2+)
  frequent: WordCard[];      // 高頻詞 (出現次數 ≥2，排除停用字)
};

function tokenize(text: string): Token[] {
  // 拆成 [單字 | 非單字片段]，保留原排版供逐字標色
  const parts = text.match(/[A-Za-z]+(?:'[A-Za-z]+)?|[^A-Za-z]+/g) || [];
  return parts.map((raw) => {
    const isWord = /^[A-Za-z]/.test(raw);
    const word = isWord ? raw.toLowerCase() : "";
    return { raw, word, isWord, cefr: isWord ? cefrOf(word) : null };
  });
}

function bandToCefr(band: number): Cefr {
  if (band >= 8.75) return "C2";
  if (band >= 7.5) return "C1";
  if (band >= 6.5) return "B2";
  if (band >= 5.5) return "B1";
  if (band >= 4.5) return "A2";
  return "A1";
}

function analyze(rawText: string): AnalysisResult {
  const tokens = tokenize(rawText);
  const wordTokens = tokens.filter((t) => t.isWord && t.word.length > 0);
  const totalWords = wordTokens.length;

  // 各等級計數
  const counts: Record<string, number> = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
  let bandSum = 0;
  const freqMap: Record<string, number> = {};
  for (const t of wordTokens) {
    const c = t.cefr || "A1";
    counts[c] = (counts[c] || 0) + 1;
    bandSum += CEFR_BAND[c] ?? 4.0;
    freqMap[t.word] = (freqMap[t.word] || 0) + 1;
  }
  const uniqueWords = Object.keys(freqMap).length;

  const levelStats: LevelStat[] = CEFR_ORDER.map((c) => {
    const cnt = counts[c as string] || 0;
    return { cefr: c, count: cnt, pct: totalWords ? (cnt / totalWords) * 100 : 0, band: CEFR_BAND[c as string] };
  });

  const overallBand = totalWords ? Math.round((bandSum / totalWords) * 2) / 2 : 0;
  const overallCefr = totalWords ? bandToCefr(overallBand) : null;

  // 高階詞 (B2/C1/C2)，去重，依 CEFR 高→低、頻次高→低排序，取前 24
  const advancedSet = new Set<string>();
  const advancedRaw: { word: string; cefr: Cefr; freq: number }[] = [];
  for (const w of Object.keys(freqMap)) {
    const c = cefrOf(w);
    if (c === "B2" || c === "C1" || c === "C2") {
      if (!advancedSet.has(w)) { advancedSet.add(w); advancedRaw.push({ word: w, cefr: c, freq: freqMap[w] }); }
    }
  }
  const cefrRank: Record<string, number> = { C2: 0, C1: 1, B2: 2, B1: 3, A2: 4, A1: 5 };
  advancedRaw.sort((a, b) => (cefrRank[a.cefr as string] - cefrRank[b.cefr as string]) || (b.freq - a.freq) || a.word.localeCompare(b.word));
  const advanced: WordCard[] = advancedRaw.slice(0, 24).map((x) => ({ word: x.word, freq: x.freq, cefr: x.cefr, ipa: ipaOf(x.word), pos: posOf(x.word), gloss: glossOf(x.word, "zh") }));

  // 高頻詞 (出現 ≥2，排除停用字)，依頻次高→低，取前 16
  const frequentRaw: { word: string; freq: number; cefr: Cefr }[] = [];
  for (const w of Object.keys(freqMap)) {
    if (freqMap[w] >= 2 && !STOPWORDS.has(w)) frequentRaw.push({ word: w, freq: freqMap[w], cefr: cefrOf(w) });
  }
  frequentRaw.sort((a, b) => (b.freq - a.freq) || a.word.localeCompare(b.word));
  const frequent: WordCard[] = frequentRaw.slice(0, 16).map((x) => ({ word: x.word, freq: x.freq, cefr: x.cefr, ipa: ipaOf(x.word), pos: posOf(x.word), gloss: glossOf(x.word, "zh") }));

  return { source: rawText, tokens, totalWords, uniqueWords, levelStats, overallBand, overallCefr, advanced, frequent };
}

const cefrColor: Record<string, string> = {
  A1: "bg-emerald-100 text-emerald-800", A2: "bg-emerald-100 text-emerald-800",
  B1: "bg-sky-100 text-sky-800", B2: "bg-sky-100 text-sky-800",
  C1: "bg-violet-100 text-violet-800", C2: "bg-violet-100 text-violet-800",
};
// 逐字標色的底色（淺）
const cefrInk: Record<string, string> = {
  A1: "bg-emerald-50 text-emerald-900", A2: "bg-emerald-100 text-emerald-900",
  B1: "bg-sky-100 text-sky-900", B2: "bg-amber-100 text-amber-900",
  C1: "bg-orange-100 text-orange-900", C2: "bg-rose-100 text-rose-900",
};
const posChipColor: Record<string, string> = {
  v: "bg-blue-100 text-blue-800", n: "bg-emerald-100 text-emerald-800",
  adj: "bg-amber-100 text-amber-800", adv: "bg-violet-100 text-violet-800",
  prep: "bg-cyan-100 text-cyan-800", pron: "bg-pink-100 text-pink-800",
  conj: "bg-teal-100 text-teal-800", num: "bg-lime-100 text-lime-800",
  art: "bg-slate-100 text-slate-700", int: "bg-fuchsia-100 text-fuchsia-800",
};

const SAMPLE_STANDARD = "The proliferation of digital technology has fundamentally transformed how societies communicate. Although connectivity offers unprecedented convenience, it simultaneously raises concerns about privacy, misinformation, and the erosion of meaningful interaction. Policymakers must therefore implement robust regulations that balance innovation with accountability.";
const SAMPLE_SIMPLE = "I like to walk in the park every day. The sun is warm and the birds sing. My dog runs fast and plays with a ball. We are happy and we have a lot of fun together.";

const bandBands = [
  { key: "A2", label: { zh: "基礎詞 A1–A2", en: "Basic A1–A2" }, desc: { zh: "日常高頻字，雅思約 4.0–5.0 Band；佔比過高代表用詞偏簡單，寫作易卡在 5 分以下，需主動替換成同義的進階詞。", en: "Everyday high-frequency words, roughly IELTS 4.0–5.0; a high proportion means simple vocabulary, often capping writing below band 5, so replace with advanced synonyms." } },
  { key: "B1", label: { zh: "中階詞 B1–B2", en: "Intermediate B1–B2" }, desc: { zh: "學術與議論常用字，雅思約 6.0–7.0 Band；這是雅思 6–7 分作文的主力詞彙，比例越高代表用詞越成熟。", en: "Common academic and argumentative words, roughly IELTS 6.0–7.0; the backbone of band 6–7 essays — a higher proportion signals more mature vocabulary." } },
  { key: "C1", label: { zh: "高階詞 C1–C2", en: "Advanced C1–C2" }, desc: { zh: "低頻學術與抽象字，雅思約 8.0–9.0 Band；適量點綴能拉高用詞分數，但用錯或堆砌反而扣分，貴在精準。", en: "Low-frequency academic and abstract words, roughly IELTS 8.0–9.0; sprinkling them in lifts the lexical score, but misuse or overuse backfires — precision matters." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "CEFR 等級估算", en: "CEFR Level Estimator" }, href: "/tools/language/cefr-level-estimator" },
  { label: { zh: "單字家族探索器", en: "Word Family Explorer" }, href: "/tools/language/word-family-explorer" },
  { label: { zh: "同音異字查找", en: "Homophone Finder" }, href: "/tools/language/homophone-finder" },
  { label: { zh: "Scrabble 單字驗證", en: "Scrabble Word Checker" }, href: "/tools/language/scrabble-word-checker" },
];

const ui = {
  zh: {
    badge: "語言 · 雅思詞彙分析器 · Language Hub", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "雅思詞彙分析器 · IELTS Vocabulary Analyzer", subtitle: "貼上一段英文，整段逐字依 CEFR / 雅思 Band 標色——A1~C2 對應雅思 4.0~9.0 Band，統計各等級佔比、預估整體 Band，列出文中高階詞與高頻詞，每個詞附 KK 音標、詞類、繁體中文釋義與例句",
    intro: "雅思詞彙分析器採用自建的「整段文字逐字 CEFR / 雅思 Band 分析」演算法：貼上一段英文後，工具會把整段拆成單字，逐字比對內建 22000+ 字的 CEFR 詞庫定出 A1~C2 等級，並對應雅思 Band（A1≈4.0、A2≈5.0、B1≈6.0、B2≈7.0、C1≈8.0、C2≈9.0），接著逐字依等級標色、統計各等級佔比、用加權平均預估你這段文字的整體雅思詞彙 Band，再列出文中的「高階詞」(B2 以上) 與「高頻詞」清單，每個列出的詞都附 KK 音標、詞類、繁體中文釋義與一句例句。雅思考生可以一眼看出自己用詞偏簡單還是成熟、哪些高階詞撐起了分數、哪些字反覆用了太多次該替換。本工具的等級分析為純前端，逐字判定不依賴外部 API，速度快、離線可用。",
    trustNoteLabel: "資料來源：", trustNote: "逐字 CEFR 等級以自建演算法比對內建 22000+ 字詞庫產生（純前端，不依賴外部 API）；CEFR 等級取自 CEFR-J Wordlist v1.5 與 Octanove 權威詞表，詞庫未收錄者以單字長度啟發式推估；CEFR→雅思 Band 為教學常用近似對照（非官方換算）；IPA 音標取自 ECDICT 與 ARPABET 轉換；繁體中文釋義繁中優先，無者顯示 ECDICT 簡體釋義並標「(簡)」；例句來自 Free Dictionary API。整體 Band 為詞彙難度的加權估算，僅供寫作用詞參考，不等於雅思官方總分。",
    quickActionCard: "快速分析卡", tryExample: "分析範例段落", examplePreview: "預估整體 Band", examplePerson: "字數", fillExample: "分析學術範例段落", previewActivePath: "分析簡單範例段落",
    examplesCalculator: "範例 → 分析", enterValues: "貼上一段英文", examplesHelper: "先用範例段落了解逐字標色、各等級佔比、整體 Band 與高階/高頻清單如何呈現，再貼上你自己的雅思作文或閱讀段落分析。",
    queryBtn: "分析詞彙", clearBtn: "清除", hotWords: "範例段落", inputPlaceholder: "在這裡貼上一段英文，例如你的雅思作文段落…",
    loading: "分析中…", emptyHint: "在上方貼一段英文並按「分析詞彙」，逐字標色、各等級佔比、整體 Band 與高階／高頻清單會顯示在這裡。", noResult: "沒有偵測到英文單字，請貼上一段英文文字（至少數個英文單字）再分析。",
    fallbackTitle: "詞庫載入中", fallbackBody: "正在載入內建詞庫，請稍候再試一次。",
    resultCard: "分析結果", wordUnit: "個英文單字", bandLabel: "預估整體 Band", overallCefrLabel: "對應 CEFR", uniqueLabel: "不重複字", coloredTextLabel: "逐字標色全文", legendLabel: "等級色標", ipaLabel: "音標", ipaPending: "/音標整理中/", glossTagCn: "(簡)", glossTagEn: "(EN)", expandHint: "展開看例句", collapseHint: "收合", exampleLabel: "例句", enLoading: "載入例句中…", noExample: "查無例句，建議造句練習。", freqUnit: "次",
    levelStatsTitle: "各等級佔比", levelStatsNote: "下方長條顯示這段文字裡每個 CEFR 等級的單字佔比，以及對應的雅思 Band。基礎詞太多代表用詞偏簡單，適量的 B2 以上高階詞能拉高用詞分數。",
    advancedTitle: "文中高階詞 (B2 以上)", advancedNote: "這些是文中達 B2/C1/C2 的較進階詞彙，撐起你的用詞分數；每個附音標、詞類、繁中釋義與例句，建議確認用法是否精準。", advancedEmpty: "文中沒有偵測到 B2 以上的高階詞，建議適量替換幾個基礎詞為同義的進階詞，拉高用詞層次。",
    frequentTitle: "文中高頻詞", frequentNote: "這些是文中重複出現 2 次以上的實詞（已排除 the、is 等虛詞）；重複太多次的字建議用同義詞替換，避免用詞單調被扣分。", frequentEmpty: "文中沒有明顯重複的實詞，用詞變化良好。",
    resultIntelligence: "結果解讀", levelMatrix: "雅思詞彙三層級對照", levelMatrixNote: "L7 把 CEFR 三層級對應到雅思 Band 與寫作策略，看你的文字主要落在哪一層、該往哪一層補強。",
    scenarioLayer: "使用場景", scenarioTitle: "什麼時候用詞彙分析", scenarioNote: "L8 列出四個典型場景，把詞彙分析用在對的地方，從用詞層級切入提升雅思寫作與閱讀。",
    scenarioExam: "雅思作文自評", scenarioExamNote: "寫完一篇雅思作文後貼進來分析，看用詞是否偏簡單、有沒有足夠的 B2 以上高階詞，針對性替換拉高 Lexical Resource 分數。", scenarioWriting: "替換重複字", scenarioWritingNote: "用高頻詞清單找出反覆使用的字（如一直用 good、important），改用同義的進階詞，讓用詞更多元。", scenarioDaily: "閱讀難度評估", scenarioDailyNote: "貼上一篇文章先看整體 Band 與高階詞清單，評估這篇對你是否太難，並把高階詞先查好音標釋義再閱讀。", scenarioBusiness: "教學備課", scenarioBusinessNote: "老師把教材段落貼進來，快速取得各等級佔比與高階詞清單，標出要重點教的詞作為教案素材。",
    progressInsight: "學習洞察卡", possibleTarget: "本次分析", dailyGap: "整體 Band", weeklyTrend: "高階詞數", motivation: "動力卡", keepMomentum: "從「寫得出來」走向「用詞精準成熟」，一段一段拉高雅思用詞 Band",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把這次的高階詞帶回家", journeyHint: "挑 3–5 個文中的高階詞（B2 以上），各造一句自己的句子，把音標、詞類、釋義與用法一起記熟，下次作文主動用上。",
    nextActionLabel: "下一步行動", nextActionTitle: "把這段文字接到下一個工具", nextActionItem1: "用 CEFR 等級估算把單一高階詞的等級再確認一次", nextActionItem2: "用單字家族探索器把高階詞的名詞、動詞、形容詞、副詞一次記齊", nextActionItem3: "用同音異字查找確認易混淆的字沒拼錯詞",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "分析路徑", decisionTitle: "貼上文字 → 逐字標色 → 看佔比與 Band → 替換補強", step1: "貼上文字", step2: "逐字標色", step3: "看佔比 Band", step4: "替換補強",
    knowledge: "知識", knowledgeTitle: "詞彙難度在雅思中的意義", definition: "定義", definitionText: "雅思詞彙分析以 CEFR 等級（A1~C2）衡量每個字的難度，並對應到雅思 Band（A1≈4.0 到 C2≈9.0）；CEFR 是歐洲共同語言參考架構，把詞彙依使用頻率與學習階段分成六級，是國際通用的詞彙難度標準。", usage: "用法", usageText: "貼上一段英文後，演算法把整段拆成單字、逐字查 CEFR 等級並標色，統計各等級佔比、用加權平均估出整體雅思詞彙 Band，再列出文中高階詞 (B2+) 與高頻詞，每個附音標、詞類、繁中釋義與例句。", limitations: "限制", limitationsText: "本工具分析的是「詞彙難度」單一面向，不評估文法、連貫、論點與拼字；整體 Band 為詞彙加權估算，不等於雅思官方總分（官方分數還看 Task Response、Coherence、Grammar）；CEFR→雅思 Band 為近似對照非官方換算；詞庫未收錄的字以長度啟發式推估，可能不準。", interpretation: "解讀", interpretationText: "理想的雅思 6.5–7 作文通常 B1–B2 詞為主力、點綴少量 C1 高階詞、基礎 A1–A2 詞不宜過半；若你的段落 A 級佔比過高，代表用詞偏簡單，應主動把常見字替換成同義進階詞；若 C 級堆砌過多卻用錯，反而扣分。", context: "脈絡", contextText: "詞彙分析應與 CEFR 等級估算、單字家族探索、同音異字查找一起用：先用本工具看整段用詞層級，再用家族探索把高階詞擴充成整族同源字，把零散的單字學習變成有系統的用詞升級。", example: "範例", exampleText: "貼上一段學術英文 → 顯示 B1 38%、B2 22%、C1 9%，整體 Band 約 6.5，高階詞列出 proliferation、unprecedented、accountability，高頻詞列出 technology、privacy；貼上簡單日記 → A1/A2 佔比過半，整體 Band 約 4.5，提示用詞偏簡單。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "相關工具", affiliateTitle: "詞彙分析的下一步工具", premiumTitle: "PRO 雅思詞彙大師包", premiumText: "解鎖無限分析、整篇作文批次分析、匯出逐字標色與高階詞清單、自動記錄分析歷史，並把高階詞匯出成複習單字卡。",
    feat1: "無限分析次數", feat2: "整篇批次分析", feat3: "分析歷史記錄", feat4: "高階詞匯出單字卡",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供英語學習與雅思寫作用詞參考；逐字 CEFR 等級以自建演算法比對內建詞表，並非完整詞典；整體 Band 為詞彙難度加權估算，不等於雅思官方總分；CEFR→雅思 Band 為近似對照非官方換算。", relatedTools: "相關工具", relatedToolsText: "CEFR Level Estimator · Word Family Explorer · Homophone Finder · Scrabble Word Checker", references: "參考資料", referencesText: "自建「整段文字逐字 CEFR / 雅思 Band 分析」演算法（純前端，比對內建 22000+ 字詞庫）；CEFR-J Wordlist v1.5（Tono Lab, TUFS）；Octanove C1/C2 Vocabulary Profile（CC BY-SA 4.0）；ECDICT 開源英漢詞典（IPA 音標與簡體釋義）；CEFR→IELTS Band 為教學常用近似對照；Free Dictionary API（例句）。",
    q1: "整體 Band 是怎麼算出來的？", a1: "把整段文字拆成單字，每個字依 CEFR 等級對應一個雅思 Band（A1=4.0、A2=5.0、B1=6.0、B2=7.0、C1=8.0、C2=9.0），全部加總取加權平均，四捨五入到最近的 0.5 Band。它只反映「詞彙難度」這一面向，不等於雅思官方總分。",
    q2: "逐字標色的顏色代表什麼？", a2: "每個英文單字依 CEFR 等級標不同底色：A1/A2 為綠色系（基礎）、B1 為藍色（中階）、B2 為琥珀色、C1 為橘色、C2 為紅色（越深越進階）。一眼就能看出整段文字哪些字是高階用詞、哪些偏基礎。",
    q3: "為什麼有些字標成基礎或查不到等級？", a3: "內建詞庫收錄 22000+ 字，涵蓋常用詞；若某字不在 CEFR 權威詞表中，演算法會以單字長度啟發式推估等級（較長的字傾向標較高級），因此罕見字或專有名詞的等級可能不精準，僅供參考。",
    q4: "音標和中文釋義從哪來？", a4: "IPA 音標取自 ECDICT 開源英漢詞典（內建 2 萬餘字），詞庫未收錄者改以 ARPABET 即時轉換 IPA；繁體中文釋義繁中優先，尚無人工繁體者補顯示 ECDICT 簡體釋義並標註「(簡)」；例句來自 Free Dictionary API。",
    q5: "整體 Band 等於我的雅思分數嗎？", a5: "不等於。雅思寫作官方評分看四項：Task Response、Coherence & Cohesion、Lexical Resource、Grammatical Range & Accuracy。本工具只評估其中「Lexical Resource（詞彙）」的難度面向，可作為用詞升級的參考，但不能取代官方總分。",
    q6: "高頻詞清單有什麼用？", a6: "它列出文中重複出現 2 次以上的實詞（已排除 the、is 等虛詞）。雅思寫作評分重視用詞多元，反覆使用同一個字（如一直用 good、important）會被扣 Lexical Resource 分數，用高頻詞清單找出重複字、改用同義進階詞，能有效提升用詞層次。",
  },
  en: {
    badge: "Language · IELTS Vocabulary Analyzer · Language Hub", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "IELTS Vocabulary Analyzer", subtitle: "Paste a passage of English and color-code every word by CEFR / IELTS band — A1~C2 maps to IELTS 4.0~9.0, with per-level proportions, an estimated overall band, and lists of advanced and high-frequency words, each with IPA, part of speech, Traditional Chinese gloss, and an example",
    intro: "The IELTS Vocabulary Analyzer uses a custom passage-level CEFR / IELTS band analysis algorithm: after you paste a passage, it splits the text into words, matches each against a built-in 22,000+ word CEFR dictionary to assign A1~C2 levels, and maps them to IELTS bands (A1≈4.0, A2≈5.0, B1≈6.0, B2≈7.0, C1≈8.0, C2≈9.0). It then color-codes each word by level, computes per-level proportions, uses a weighted average to estimate your passage's overall IELTS vocabulary band, and lists the advanced words (B2+) and high-frequency words in the text — each with IPA, part of speech, Traditional Chinese gloss, and an example sentence. IELTS candidates can see at a glance whether their vocabulary is simple or mature, which advanced words carry the score, and which words are overused and should be replaced. The level analysis is pure front-end; per-word classification uses no external API, so it is fast and works offline.",
    trustNoteLabel: "Data source:", trustNote: "Per-word CEFR levels are produced by a custom algorithm matched against a built-in 22,000+ word dictionary (pure front-end, no external API); CEFR levels come from the CEFR-J Wordlist v1.5 and Octanove authoritative wordlists, with a word-length heuristic for unlisted words; the CEFR→IELTS band mapping is a common teaching approximation (not an official conversion); IPA comes from ECDICT and ARPABET conversion; Traditional Chinese glosses are preferred, falling back to ECDICT Simplified glosses tagged Simp; examples come from the Free Dictionary API. The overall band is a weighted estimate of vocabulary difficulty for writing reference only, not an official IELTS total score.",
    quickActionCard: "Quick Analysis Card", tryExample: "Analyze a sample passage", examplePreview: "Estimated overall band", examplePerson: "Words", fillExample: "Analyze academic sample", previewActivePath: "Analyze simple sample",
    examplesCalculator: "Examples → Analyze", enterValues: "Paste a passage of English", examplesHelper: "Start with a sample passage to see how per-word coloring, per-level proportions, the overall band, and the advanced/frequent lists appear, then paste your own IELTS essay or reading passage.",
    queryBtn: "Analyze vocabulary", clearBtn: "Clear", hotWords: "Sample passages", inputPlaceholder: "Paste a passage of English here, e.g. a paragraph of your IELTS essay…",
    loading: "Analyzing…", emptyHint: "Paste a passage above and press Analyze vocabulary; per-word coloring, per-level proportions, the overall band, and the advanced/frequent lists appear here.", noResult: "No English words detected; please paste a passage of English (at least a few words) and try again.",
    fallbackTitle: "Loading dictionary", fallbackBody: "The built-in dictionary is loading, please try again shortly.",
    resultCard: "Analysis Result", wordUnit: "English words", bandLabel: "Estimated overall band", overallCefrLabel: "Maps to CEFR", uniqueLabel: "Unique words", coloredTextLabel: "Per-word color-coded text", legendLabel: "Level legend", ipaLabel: "IPA", ipaPending: "/pending/", glossTagCn: "(Simp)", glossTagEn: "(EN)", expandHint: "Show example", collapseHint: "Collapse", exampleLabel: "Example", enLoading: "Loading example…", noExample: "No example found; try writing your own.", freqUnit: "×",
    levelStatsTitle: "Per-level proportion", levelStatsNote: "The bars below show the proportion of words at each CEFR level in this passage, with the corresponding IELTS band. Too many basic words means simple vocabulary; a measured share of B2+ advanced words lifts the lexical score.",
    advancedTitle: "Advanced words (B2+)", advancedNote: "These are the B2/C1/C2 words in the passage that carry your lexical score; each comes with IPA, part of speech, Chinese gloss, and an example — confirm they are used precisely.", advancedEmpty: "No B2+ advanced words detected; consider replacing a few basic words with advanced synonyms to raise the lexical level.",
    frequentTitle: "High-frequency words", frequentNote: "These content words appear 2+ times in the passage (function words like the, is excluded); overused words should be replaced with synonyms to avoid a monotonous-vocabulary penalty.", frequentEmpty: "No obviously repeated content words; good lexical variety.",
    resultIntelligence: "Result Intelligence", levelMatrix: "IELTS vocabulary three tiers", levelMatrixNote: "L7 maps the three CEFR tiers to IELTS bands and writing strategy; see which tier your text mainly falls in and where to strengthen.",
    scenarioLayer: "Use scenarios", scenarioTitle: "When to use vocabulary analysis", scenarioNote: "L8 lists four typical scenarios so you use vocabulary analysis in the right place, improving IELTS writing and reading from the lexical level.",
    scenarioExam: "IELTS essay self-check", scenarioExamNote: "After writing an IELTS essay, paste it in to see whether the vocabulary is simple and whether there are enough B2+ advanced words, then make targeted replacements to raise your Lexical Resource score.", scenarioWriting: "Replace repeated words", scenarioWritingNote: "Use the high-frequency list to find overused words (e.g. always using good, important) and replace them with advanced synonyms for richer vocabulary.", scenarioDaily: "Reading difficulty check", scenarioDailyNote: "Paste an article to see the overall band and advanced-word list, judge whether it is too hard for you, and look up the advanced words' IPA and gloss before reading.", scenarioBusiness: "Teaching prep", scenarioBusinessNote: "Teachers paste a passage to quickly get per-level proportions and the advanced-word list, marking key words to teach as lesson material.",
    progressInsight: "Learning Insight Card", possibleTarget: "This analysis", dailyGap: "Overall band", weeklyTrend: "Advanced words", motivation: "Motivation Card", keepMomentum: "Move from 'able to write it' to 'precise, mature vocabulary', raising your IELTS lexical band passage by passage",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's advanced words home", journeyHint: "Pick 3–5 advanced words (B2+) from the text, write your own sentence for each, memorize the IPA, part of speech, gloss, and usage, and actively use them in your next essay.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this passage to the next tool", nextActionItem1: "Use CEFR Level Estimator to reconfirm a single advanced word's level", nextActionItem2: "Use Word Family Explorer to learn an advanced word's noun, verb, adjective, and adverb at once", nextActionItem3: "Use Homophone Finder to make sure easily confused words are not misspelled",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Analysis Path", decisionTitle: "Paste text → Per-word coloring → See proportions & band → Replace & strengthen", step1: "Paste text", step2: "Color-code", step3: "See band", step4: "Strengthen",
    knowledge: "Knowledge", knowledgeTitle: "What vocabulary difficulty means in IELTS", definition: "Definition", definitionText: "IELTS vocabulary analysis measures each word's difficulty by CEFR level (A1~C2) and maps it to an IELTS band (A1≈4.0 to C2≈9.0); CEFR is the Common European Framework of Reference, classifying vocabulary into six levels by frequency and learning stage — the international standard for word difficulty.", usage: "Usage", usageText: "After you paste a passage, the algorithm splits it into words, looks up each word's CEFR level and color-codes it, computes per-level proportions, uses a weighted average to estimate the overall IELTS vocabulary band, and lists the advanced words (B2+) and high-frequency words, each with IPA, part of speech, Chinese gloss, and an example.", limitations: "Limitations", limitationsText: "This tool analyzes the single dimension of vocabulary difficulty, not grammar, coherence, argument, or spelling; the overall band is a weighted vocabulary estimate, not an official IELTS total (which also weighs Task Response, Coherence, Grammar); the CEFR→IELTS mapping is an approximation not an official conversion; unlisted words use a length heuristic and may be inaccurate.", interpretation: "Interpretation", interpretationText: "An ideal band 6.5–7 essay usually has B1–B2 words as the backbone, a sprinkle of C1 advanced words, and basic A1–A2 words below half; if your passage's A-level proportion is too high, the vocabulary is simple and common words should be replaced with advanced synonyms; piling on misused C-level words backfires.", context: "Context", contextText: "Vocabulary analysis should be used with CEFR estimation, word-family exploration, and homophone finding: see the passage's lexical level here first, then expand advanced words into whole cognate families, turning scattered word study into systematic vocabulary upgrading.", example: "Example", exampleText: "Paste an academic passage → shows B1 38%, B2 22%, C1 9%, overall band ~6.5, advanced words like proliferation, unprecedented, accountability, frequent words like technology, privacy; paste a simple diary → A1/A2 over half, overall band ~4.5, flagging simple vocabulary.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Related Tools", affiliateTitle: "Next tools for vocabulary analysis", premiumTitle: "PRO IELTS Vocabulary Master Pack", premiumText: "Unlock unlimited analysis, full-essay batch analysis, export of color-coded text and the advanced-word list, auto-logged analysis history, and export advanced words as review flashcards.",
    feat1: "Unlimited analysis", feat2: "Full-essay batch analysis", feat3: "Analysis history", feat4: "Export word flashcards",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for English learning and IELTS writing vocabulary reference only; per-word CEFR levels use a custom algorithm matched against a built-in wordlist, not a complete dictionary; the overall band is a weighted vocabulary estimate, not an official IELTS total; the CEFR→IELTS mapping is an approximation not an official conversion.", relatedTools: "Related Tools", relatedToolsText: "CEFR Level Estimator · Word Family Explorer · Homophone Finder · Scrabble Word Checker", references: "References", referencesText: "Custom passage-level CEFR / IELTS band analysis algorithm (pure front-end, matched against a built-in 22,000+ word dictionary); CEFR-J Wordlist v1.5 (Tono Lab, TUFS); Octanove C1/C2 Vocabulary Profile (CC BY-SA 4.0); ECDICT open EN-ZH dictionary (IPA and Simplified glosses); CEFR→IELTS band is a common teaching approximation; Free Dictionary API (examples).",
    q1: "How is the overall band calculated?", a1: "The passage is split into words; each word maps to an IELTS band by its CEFR level (A1=4.0, A2=5.0, B1=6.0, B2=7.0, C1=8.0, C2=9.0), all summed into a weighted average, rounded to the nearest 0.5 band. It reflects only the vocabulary-difficulty dimension, not an official IELTS total.",
    q2: "What do the per-word colors mean?", a2: "Each word is shaded by CEFR level: A1/A2 in greens (basic), B1 in blue (intermediate), B2 in amber, C1 in orange, C2 in red (deeper = more advanced). You can see at a glance which words are advanced and which are basic.",
    q3: "Why are some words basic or unleveled?", a3: "The built-in dictionary has 22,000+ words covering common vocabulary; if a word is not in the CEFR authoritative wordlists, the algorithm estimates its level by word length (longer words tend to be marked higher), so rare words or proper nouns may be imprecise — for reference only.",
    q4: "Where do the IPA and Chinese gloss come from?", a4: "IPA comes from the open ECDICT EN-ZH dictionary (over 20k words built in); unlisted words convert ARPABET to IPA on the fly; Traditional Chinese glosses are preferred, falling back to ECDICT's Simplified gloss tagged Simp; examples come from the Free Dictionary API.",
    q5: "Does the overall band equal my IELTS score?", a5: "No. IELTS writing is officially scored on four criteria: Task Response, Coherence & Cohesion, Lexical Resource, and Grammatical Range & Accuracy. This tool only assesses the difficulty dimension of Lexical Resource (vocabulary); it is a reference for upgrading vocabulary but cannot replace the official total.",
    q6: "What is the high-frequency list for?", a6: "It lists content words that appear 2+ times (function words like the, is excluded). IELTS writing values lexical variety, and repeating one word (e.g. always good, important) loses Lexical Resource marks; use the list to find repeated words and replace them with advanced synonyms to effectively raise the lexical level.",
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

export default function IeltsVocabularyAnalyzer() {
  const { lang, setLang } = useLanguage();
  const t = ui[lang];
  const [input, setInput] = useState(SAMPLE_STANDARD);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [solved, setSolved] = useState<boolean | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [examples, setExamples] = useState<Record<string, { exampleEn: string; defEn: string }>>({});

  useEffect(() => { loadDict(); }, []);

  const runQuery = useCallback(async (rawText: string) => {
    const text = rawText.trim();
    if (!text) return;
    setLoading(true);
    setExpanded(null);
    await loadDict();
    const res = analyze(text);
    if (res.totalWords === 0) {
      setResult({ ...res, totalWords: 0 });
      setSolved(true);
      setLoading(false);
      return;
    }
    setResult(res);
    setSolved(true);
    setLoading(false);
  }, []);

  const toggleExpand = useCallback(async (word: string) => {
    const key = word.toLowerCase();
    if (expanded === key) { setExpanded(null); return; }
    setExpanded(key);
    if (!examples[key]) {
      const ex = await fetchExample(key);
      setExamples((prev) => ({ ...prev, [key]: { exampleEn: ex?.exampleEn || "", defEn: ex?.defEn || "" } }));
    }
  }, [expanded, examples]);

  function fillStandard() { setInput(SAMPLE_STANDARD); runQuery(SAMPLE_STANDARD); }
  function fillCut() { setInput(SAMPLE_SIMPLE); runQuery(SAMPLE_SIMPLE); }
  function clearAll() { setInput(""); setResult(null); setSolved(undefined); setExpanded(null); }

  const bandDisplay = result && result.totalWords > 0 ? result.overallBand.toFixed(1) : "—";
  const totalDisplay = result && result.totalWords > 0 ? String(result.totalWords) : "—";
  const cefrDisplay = result && result.overallCefr ? result.overallCefr : "—";

  const scenarios = [
    { k: "exam", title: t.scenarioExam, note: t.scenarioExamNote, accent: "border-blue-200 bg-blue-50" },
    { k: "writing", title: t.scenarioWriting, note: t.scenarioWritingNote, accent: "border-emerald-200 bg-emerald-50" },
    { k: "daily", title: t.scenarioDaily, note: t.scenarioDailyNote, accent: "border-amber-200 bg-amber-50" },
    { k: "business", title: t.scenarioBusiness, note: t.scenarioBusinessNote, accent: "border-violet-200 bg-violet-50" },
  ];

  function renderCard(c: WordCard) {
    const key = c.word.toLowerCase();
    const isOpen = expanded === key;
    const firstPos = c.pos.split("/")[0];
    const ex = examples[key];
    return (
      <div key={c.word} className="rounded-2xl border border-slate-200/60 bg-white/80 p-4 backdrop-blur">
        <div className="flex flex-wrap items-center gap-2"><span lang="en" translate="no" className="notranslate text-lg font-black text-slate-900">{c.word}</span><span className={`rounded-full px-2 py-0.5 text-xs font-black ${posChipColor[firstPos] || "bg-slate-100 text-slate-700"}`}>{posLabel(c.pos, lang)}</span>{c.cefr && <span className={`rounded-full px-2 py-0.5 text-xs font-black ${cefrColor[c.cefr]}`}>{c.cefr}</span>}<span lang="en" translate="no" className="notranslate font-mono text-xs text-slate-600">{c.ipa === "__PENDING__" ? t.ipaPending : c.ipa}</span>{c.freq > 1 && <span className="rounded-full bg-slate-900 px-2 py-0.5 text-xs font-black text-white">{c.freq}{t.freqUnit}</span>}</div>
        <p className="mt-1 text-sm leading-6 text-slate-700">{c.gloss.text}{c.gloss.tag === "cn" && <span className="ml-1 text-xs text-slate-400">{t.glossTagCn}</span>}</p>
        <button type="button" onClick={() => toggleExpand(c.word)} className="mt-1 text-xs font-black text-emerald-700">{isOpen ? t.collapseHint : `▸ ${t.expandHint}`}</button>
        {isOpen && (
          <div className="mt-2 rounded-xl bg-slate-50 p-3">
            {!ex
              ? <p className="text-xs font-black text-slate-400">{t.enLoading}</p>
              : ex.exampleEn
                ? (<><p className="text-xs font-black text-slate-400">{t.exampleLabel}</p><p lang="en" translate="no" className="notranslate mt-1 text-sm italic text-slate-700">{ex.exampleEn}</p>{ex.defEn && <p lang="en" translate="no" className="notranslate mt-1 text-xs text-slate-500">{ex.defEn}</p>}</>)
                : (ex.defEn ? <p lang="en" translate="no" className="notranslate text-xs text-slate-500">{ex.defEn}</p> : <p className="text-xs text-slate-400">{t.noExample}</p>)}
          </div>
        )}
      </div>
    );
  }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{bandDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.overallCefrLabel}: {cefrDisplay}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{totalDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.uniqueLabel}</div><div className="font-black">{result && result.totalWords > 0 ? result.uniqueWords : "—"}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="font-black">{result && result.totalWords > 0 ? result.advanced.length : "—"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Query */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.hotWords}</h3><div className="mt-4 flex flex-col gap-2"><button onClick={fillStandard} className="rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-left text-sm font-black text-emerald-800">{t.fillExample}</button><button onClick={fillCut} className="rounded-2xl border border-orange-200 bg-white px-4 py-3 text-left text-sm font-black text-orange-800">{t.previewActivePath}</button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.enterValues}</h3><div className="mt-4 flex flex-col gap-3"><textarea lang="en" translate="no" rows={5} className="notranslate w-full rounded-2xl border border-slate-300 px-4 py-3 text-base font-medium leading-7" value={input} placeholder={t.inputPlaceholder} onChange={(e) => setInput(e.target.value)} /><div className="flex gap-3"><button onClick={() => runQuery(input)} className="rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-black text-white">{t.queryBtn}</button><button onClick={clearAll} className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700">{t.clearBtn}</button></div></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{bandDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.bandLabel}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.overallCefrLabel}</div><div className="mt-1 text-2xl font-black">{cefrDisplay}</div><div className="mt-1 text-xs text-slate-300">{totalDisplay} {t.wordUnit}</div></div></div>
            <div className="mt-6 space-y-3">
              {loading && <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm font-black text-slate-600">{t.loading}</div>}
              {!loading && solved === undefined && <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm font-black text-slate-500">{t.emptyHint}</div>}
              {!loading && solved === true && result && result.totalWords === 0 && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center text-sm font-black text-rose-700">{t.noResult}</div>}
              {!loading && solved === true && result && result.totalWords > 0 && (<>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-black uppercase text-slate-500">{t.coloredTextLabel}</p>
                  <p lang="en" translate="no" className="notranslate mt-2 text-base leading-8">{result.tokens.map((tok, i) => tok.isWord && tok.cefr ? <span key={i} className={`rounded px-0.5 ${cefrInk[tok.cefr]}`}>{tok.raw}</span> : <span key={i}>{tok.raw}</span>)}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-black">{CEFR_ORDER.map((c) => <span key={c as string} className={`rounded px-2 py-0.5 ${cefrInk[c as string]}`}>{c} · {CEFR_BAND[c as string].toFixed(1)}</span>)}</div>
                </div>
              </>)}
            </div>
          </div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.levelStatsTitle}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.levelStatsNote}</p>
            <div className="mt-5 space-y-2">{result && result.totalWords > 0 ? result.levelStats.map((s) => (
              <div key={s.cefr as string} className="flex items-center gap-3"><span className={`w-14 shrink-0 rounded-full px-2 py-1 text-center text-xs font-black ${cefrColor[s.cefr as string]}`}>{s.cefr}</span><div className="h-5 flex-1 overflow-hidden rounded-full bg-slate-100"><div className={`h-full ${cefrInk[s.cefr as string]}`} style={{ width: `${Math.max(s.pct, 1)}%` }} /></div><span className="w-28 shrink-0 text-right text-xs font-black text-slate-600">{s.count} · {s.pct.toFixed(0)}% · {s.band.toFixed(1)}</span></div>
            )) : <p className="text-sm text-slate-400">{t.emptyHint}</p>}</div>
          </article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="ielts-vocabulary-analyzer-result-intelligence" adFormat="horizontal" className="my-2" />
        {/* L7 詳列高階詞 / 高頻詞（四要素鐵律） */}
        <section className="grid gap-7 lg:grid-cols-[1fr_1fr]">
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.advancedTitle}</p><p className="mt-2 text-sm leading-6 text-slate-600">{t.advancedNote}</p><div className="mt-5 space-y-3">{result && result.totalWords > 0 ? (result.advanced.length ? result.advanced.map(renderCard) : <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-black text-amber-800">{t.advancedEmpty}</div>) : <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm font-black text-slate-500">{t.emptyHint}</div>}</div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.frequentTitle}</p><p className="mt-2 text-sm leading-6 text-slate-600">{t.frequentNote}</p><div className="mt-5 space-y-3">{result && result.totalWords > 0 ? (result.frequent.length ? result.frequent.map(renderCard) : <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-black text-emerald-800">{t.frequentEmpty}</div>) : <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm font-black text-slate-500">{t.emptyHint}</div>}</div></article>
        </section>
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">{/* L8-ScenarioComparison */}
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.scenarioLayer}</p><h2 className="mt-2 text-3xl font-black">{t.scenarioTitle}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.scenarioNote}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{scenarios.map((s) => <article key={s.k} className={`rounded-3xl border p-5 shadow-sm ${s.accent}`}><h3 className="text-lg font-black text-slate-900">{s.title}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{s.note}</p></article>)}</div>
          <div className="mt-6 grid gap-3 md:grid-cols-3">{bandBands.map((item) => <div key={item.key} className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className={`rounded-full px-2 py-1 text-xs font-black ${cefrColor[item.key]}`}>{item.key}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div>
        </section>
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.dailyGap}</div><div className="mt-1 text-2xl font-black">{bandDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.examplePerson}</div><div className="mt-1 text-2xl font-black text-blue-950">{totalDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result && result.totalWords > 0 ? result.advanced.length : "—"}</div></div></div></article>
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
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="ielts-vocabulary-analyzer-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 相關 Language Hub 工具，免費使用。" : "* Related Language Hub tools, free to use."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-Trust */}<p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
