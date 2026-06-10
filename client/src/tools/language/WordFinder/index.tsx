// @profile B
// Profile B · Language-Hub 自建演算法 · WordFinder（GOLD-STANDARD MacroCalculator compatible）
// 找字工具：自建「字母包含」查找演算法（與 word-unscrambler 子集方向相反）。
//   原理：輸入要包含的字母 → 掃內建 cefrDict（22,499 字）找出「含有全部指定字母」的單字 → 直接取 [cefr,zh_tw,zh_cn,ipa]
//   可選條件：開頭字母 / 結尾字母 / 字長；按字母數分組顯示。純前端、不依賴外部 API 取結果。
//   三層中文釋義(繁體優先→ECDICT簡體標「简」→英文定義標EN) + ARPABET→IPA 全照 gold 範本。

import { useMemo, useState, useCallback, useEffect } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";
import examplesData from "./findExamples.json";

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
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 小時

// ============================================================
// 內建 CEFR + 繁體中文釋義 + IPA 詞庫（CEFR-J ver1.5 + Octanove + ECDICT，懶載入）
//   形態：{ word: [cefr, zh_tw, zh_cn, ipa] } — 同時充當字母包含查找字典（22,499 字）
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

// ============================================================
// 自建「字母包含」查找演算法（Victor 正式裁示授權 · 四要素鐵律）
//   找字工具：找出「含有全部指定字母」的單字（與 unscrambler 子集方向相反）
//   例：輸入 qu → 含 q 與 u 的字 queen/quick/square/unique…；可加開頭/結尾/字長條件
// ============================================================
// 字母計數簽章：把單字壓成 26 維字母計數陣列，用於包含判斷
function letterCount(word: string): Int8Array | null {
  const c = new Int8Array(26);
  for (const ch of word) {
    const i = ch.charCodeAt(0) - 97;
    if (i < 0 || i > 25) return null;
    c[i]++;
  }
  return c;
}
// 預先把字典壓成 {word, count} 清單，第一次查詢時建一次
let WORD_INDEX: { word: string; count: Int8Array }[] | null = null;
function buildWordIndex(): void {
  if (WORD_INDEX || !DICT) return;
  const list: { word: string; count: Int8Array }[] = [];
  for (const w of Object.keys(DICT)) {
    if (!/^[a-z]+$/.test(w)) continue; // 只收純小寫英文字
    if (w.length < 3) continue; // 3 字母起算
    const count = letterCount(w);
    if (count) list.push({ word: w, count });
  }
  WORD_INDEX = list;
}
// 關鍵：確認單字「含有」要求字母池中的全部字母（word 為 superset）
function containsAll(wordCount: Int8Array, need: Int8Array): boolean {
  for (let i = 0; i < 26; i++) { if (wordCount[i] < need[i]) return false; }
  return true;
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

// CEFR 啟發式（字典未標 CEFR 時的保底）：以字長粗估
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
// ② 詞類：從 ECDICT 釋義文字開頭的詞性標記推導（vt./vi./n./adj./adv./num./prep./conj.…）
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
  // 取「最先出現」的詞性標記（釋義常列多個詞性，以開頭主詞性為準）
  const order: { key: string; re: RegExp }[] = [
    { key: "n", re: POS_N }, { key: "v", re: POS_V }, { key: "adj", re: POS_ADJ },
    { key: "adv", re: POS_ADV }, { key: "prep", re: POS_PREP }, { key: "pron", re: POS_PRON },
    { key: "conj", re: POS_CONJ }, { key: "num", re: POS_NUM }, { key: "art", re: POS_ART },
    { key: "int", re: POS_INT }, { key: "abbr", re: POS_ABBR },
  ];
  let best = "u"; let bestIdx = Infinity;
  for (const o of order) { const m = o.re.exec(g); if (m && m.index < bestIdx) { bestIdx = m.index; best = o.key; } }
  if (best !== "u") return best;
  // 中文詞性（繁中釋義）保底
  if (POS_N_ZH.test(g)) return "n";
  if (POS_V_ZH.test(g)) return "v";
  if (POS_ADJ_ZH.test(g)) return "adj";
  if (POS_ADV_ZH.test(g)) return "adv";
  return "u";
}

type MeaningSrc = "tw" | "cn" | "none";
type ResultCard = {
  word: string; cefr: Cefr; posKey: string; ipa: string; meaningZh: string; meaningSrc: MeaningSrc;
  // lazy enrichment (例句 + 詞性 via dictionaryapi.dev)
  exampleEn?: string; exampleZh?: string; defEn?: string; enriched?: boolean;
};

const cefrColor: Record<string, string> = {
  A1: "bg-emerald-100 text-emerald-800", A2: "bg-emerald-100 text-emerald-800",
  B1: "bg-sky-100 text-sky-800", B2: "bg-sky-100 text-sky-800",
  C1: "bg-violet-100 text-violet-800", C2: "bg-violet-100 text-violet-800",
};
const HOT_WORDS = ["qu", "th", "ph", "tch", "ght", "ck"] as const;

const cefrBands = [
  { key: "A1", label: { zh: "A1 入門", en: "A1 Beginner" }, desc: { zh: "最常用的短字重組，玩字謎的首選答案。", en: "Most frequent short rearrangements; best puzzle answers." } },
  { key: "A2", label: { zh: "A2 基礎", en: "A2 Elementary" }, desc: { zh: "常見的短組字，足以應付一般拼字遊戲。", en: "Common short words for everyday word games." } },
  { key: "B1", label: { zh: "B1 中級", en: "B1 Intermediate" }, desc: { zh: "讓 Scrabble 拿高分的中階重組字。", en: "Mid-level rearrangements that score well in Scrabble." } },
  { key: "B2", label: { zh: "B2 中高", en: "B2 Upper-Inter" }, desc: { zh: "進階填字遊戲常見的中長組字。", en: "Medium words common in crosswords." } },
  { key: "C1", label: { zh: "C1 高級", en: "C1 Advanced" }, desc: { zh: "精準、罕用的高階長組字。", en: "Precise, less-common high-level long words." } },
  { key: "C2", label: { zh: "C2 精通", en: "C2 Proficiency" }, desc: { zh: "罕見而典雅，Scrabble 的隱藏高分答案。", en: "Rare and elegant; hidden high-scoring words." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "押韻詞查找器", en: "Rhyme Finder" }, href: "/tools/language/rhyme-finder" },
  { label: { zh: "同義詞查找器", en: "Synonym Finder" }, href: "/tools/language/synonym-finder" },
  { label: { zh: "字根分析器", en: "Word Root Analyzer" }, href: "/tools/language/word-root-analyzer" },
  { label: { zh: "CEFR 等級估算", en: "CEFR Level Estimator" }, href: "/tools/language/cefr-level-estimator" },
];

const ui = {
  zh: {
    badge: "語言 · 找字工具 · Language Hub", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "找字工具 · Word Finder", subtitle: "輸入要包含的字母（如 qu、th、ght），立刻從內建 22,499 字詞庫找出「含有這些字母」的所有英文單字，按字母數分組顯示，每個結果附 KK 音標、詞類、繁中釋義與例句",
    intro: "找字工具採用自建的「字母包含」查找演算法：把您輸入的字母當成必須出現的條件，再掃內建 22,499 字的詞庫，找出所有「含有全部這些字母」的英文單字——例如輸入 qu，會列出 queen、quick、square、unique 等含 q 與 u 的字；輸入 ght 會列出 night、light、thought 等。結果按字母數由短到長分組顯示，每個結果都標註 CEFR 難度等級、IPA 音標、詞性與中文釋義，並可展開查看英文定義與例句，是填字遊戲、Wordle 與英語拼字練習的利器。本工具為純前端演算法，不依賴外部 API 取結果，速度快、離線可用。",
    trustNoteLabel: "資料來源：", trustNote: "可組字以自建「字母子集」演算法比對內建詞庫產生（純前端，不依賴外部 API）；CEFR 等級以 CEFR-J 與 Octanove 權威詞表對照；中文釋義以編輯團隊人工撰寫的繁體中文為優先，尚無繁體者改顯示 ECDICT 開源詞典的簡體釋義（標註「简」），繁簡皆無者展開即顯示英文定義；IPA 音標取自 ECDICT 與 ARPABET 轉換；例句來自 Free Dictionary API。僅供學習與娛樂參考。",
    quickActionCard: "快速查找卡", tryExample: "一鍵查找含 qu 的單字", examplePreview: "符合的單字數", examplePerson: "必含字母", fillExample: "查找含 qu 的單字", previewActivePath: "查找含 ght 的單字",
    examplesCalculator: "範例 → 重組", enterValues: "輸入字母", examplesHelper: "先用熱門範例了解 CEFR 等級、IPA 音標與中文釋義如何呈現，再換成您自己想重組的字母組合。",
    queryBtn: "查找單字", clearBtn: "清除", hotWords: "熱門字母組", inputPlaceholder: "輸入要包含的字母，例如 qu",
    loading: "查找中…", emptyHint: "輸入上方字母並按「查找單字」，所有含有這些字母的單字會按字母數分組列在這裡。", noResult: "找不到含有這些字母的單字，換一組字母試試（字母越少、符合的字越多）。",
    fallbackTitle: "詞庫載入中", fallbackBody: "正在載入內建詞庫，請稍候再試一次。",
    resultCard: "查找結果", unit: "個符合字", letterPool: "必含字母", lenGroupLabel: "字母", primaryValue: "輸入字母", ipaLabel: "音標", ipaPending: "/音標整理中/", meaningLabel: "釋義", glossTagCn: "(简)", glossTagEn: "(EN)", enGlossHint: "展開看英文定義與例句", expandHint: "展開看例句", collapseHint: "收合", exampleLabel: "例句", enLoading: "載入例句中…", noExample: "查無例句，建議造句練習。",
    resultIntelligence: "結果解讀", levelMatrix: "六級 CEFR 重組字解讀矩陣", levelMatrixNote: "L7 將重組字依 CEFR 等級分層，以 CEFR-J 權威詞表對照，A1 最常用、C2 最罕見；玩字謎時優先挑您認得的等級。",
    scenarioLayer: "使用場景", scenarioTitle: "什麼時候用字謎重組", scenarioNote: "L8 列出四個典型場景，把重組字用在對的地方，而不是隨意拼湊。",
    scenarioExam: "拼字遊戲", scenarioExamNote: "Scrabble、Words with Friends 卡關時，重組手上字母找出能拿高分的單字。", scenarioWriting: "解字謎", scenarioWritingNote: "報紙字謎與填字遊戲，重組提示字母找出隱藏答案。", scenarioDaily: "創意命名", scenarioDailyNote: "幫品牌、帳號、角色取名，重組您的關鍵字找出有趣的同字母新詞。", scenarioBusiness: "字彙練習", scenarioBusinessNote: "重組常見字觀察拼字規律，順便用 CEFR 標記學新字。",
    progressInsight: "學習洞察卡", possibleTarget: "本次重組", dailyGap: "最常用等級", weeklyTrend: "已分級比例", motivation: "動力卡", keepMomentum: "從玩字謎走向主動擴充拼字直覺",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天重組出的新字帶回家", journeyHint: "挑 2–3 個您不認得的重組字查釋義並造句，玩遊戲也能順便背單字。",
    nextActionLabel: "下一步行動", nextActionTitle: "把重組字接到下一個工具", nextActionItem1: "用同義詞查找器替換重組出的字，理解語意光譜", nextActionItem2: "用 CEFR 等級估算確認重組字難度是否符合您的程度", nextActionItem3: "用字根分析器理解重組字的語義從何而來，記得更牢",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "解題路徑", decisionTitle: "輸入 → 重組 → 理解 → 應用", step1: "輸入字母", step2: "重組單字", step3: "看 CEFR", step4: "用在遊戲",
    knowledge: "知識", knowledgeTitle: "字母包含查找在英語學習中的意義", definition: "定義", definitionText: "字母包含查找是把輸入的字母當成必須出現的條件，找出所有「含有全部這些字母」的單字——例如含 qu、含 ght；這正是填字遊戲、Wordle 與單字記憶的常用技巧。", usage: "用法", usageText: "輸入一串必含字母後，演算法把它壓成字母計數，再掃詞庫逐字確認該字是否含有全部要求字母，最後按字母數由短到長分組顯示。要求字母越少，符合的單字通常越多。", limitations: "限制", limitationsText: "本工具的字典為內建 22,499 字常用詞庫，極罕見字、專有名詞與多數複數變化未必收錄；CEFR 等級以 CEFR-J/Octanove 詞表為主，未收錄者改用字長啟發式推估。", interpretation: "解讀", interpretationText: "A1/A2 短字最適合日常拼字與單字入門；B1/B2 適合進階填字；C1/C2 雖罕見，卻常是高階字彙練習的目標。", context: "脈絡", contextText: "字母包含查找應與同義詞、字根、CEFR 估算一起用：找出含特定字母的字之後，再查語意與來源，把找字變成有效的學字工具。", example: "範例", exampleText: "輸入 qu → queen/quick/square/unique（含 q 與 u）；輸入 ght → night/light/thought（含 g、h、t）。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "相關工具", affiliateTitle: "字謎重組的下一步工具", premiumTitle: "PRO 字謎重組包", premiumText: "解鎖無限重組、依 CEFR 等級篩選結果、依字長排序、自動記錄解題歷史，並把重組字表匯出複習。",
    feat1: "無限重組次數", feat2: "難度等級篩選", feat3: "解題歷史記錄", feat4: "重組字表匯出",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供英語學習與字謎娛樂用途；重組以自建演算法比對內建詞庫產生，CEFR 等級為詞表對照與啟發式推估，不等同官方語言檢定結果。", relatedTools: "相關工具", relatedToolsText: "Rhyme Finder · Synonym Finder · Word Root Analyzer · CEFR Level Estimator", references: "參考資料", referencesText: "自建「字母子集」演算法（純前端，逐字確認字母是否為輸入字母池子集）；CEFR-J Wordlist v1.5（Tono Lab, TUFS）；Octanove C1/C2 Vocabulary Profile（CC BY-SA 4.0）；ECDICT 開源英漢詞典（IPA 音標與簡體釋義）；繁體中文釋義由編輯團隊人工撰寫；Free Dictionary API（例句）。",
    q1: "符合的單字是怎麼找出來的？", a1: "用自建的「字母包含」演算法：把輸入字母壓成字母計數，再掃內建 22,499 字詞庫，逐字確認該字是否含有全部要求字母，最後按字母數分組。純前端演算法，不需連外部 API。",
    q2: "CEFR 等級是怎麼判斷的？", a2: "優先以 CEFR-J 與 Octanove 權威詞表對照；詞表未收錄的字才改用字長啟發式推估。這是學習參考，非官方檢定。",
    q3: "為什麼有些字母組合找不到其他單字？", a3: "若該組字母只能拼出輸入字本身，或其他組合不在內建詞庫中，就會無結果。字母越多、組合越多；極罕見字與多數複數變化未必收錄。",
    q4: "音標和中文釋義從哪來？", a4: "IPA 音標取自 ECDICT 開源英漢詞典（內建 2 萬餘字），詞庫未收錄者改以 ARPABET 即時轉換 IPA；中文釋義採三層優先序——編輯團隊人工撰寫的繁體中文優先（無標註），尚無繁體者改顯示 ECDICT 簡體釋義並標註「简」，繁簡皆無者展開即顯示英文定義（標註 EN）。全程不經機器翻譯。例句來自 Free Dictionary API。",
    q5: "本工具和「字母重組器」有什麼不同？", a5: "字母重組器（Word Unscrambler）是「用您的字母去組字」（單字字母 ⊆ 輸入）；找字工具（Word Finder）方向相反，是「找出含有您指定字母的字」（輸入字母 ⊆ 單字），適合填字與 Wordle。",
    q6: "適合玩 Scrabble 嗎？", a6: "適合。輸入手上的字母，重組出所有可能的單字，再依 CEFR 等級與字長挑能拿高分的字；但比賽請依各自規則確認用字是否合法。",
  },
  en: {
    badge: "Language · Word Finder · Language Hub", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Word Finder", subtitle: "Type the letters a word must contain (e.g. qu, th, ght) and instantly find every English word that includes them from a built-in 22,499-word dictionary, grouped by word length, each with IPA, part of speech, Chinese gloss, and an example sentence",
    intro: "Word Finder uses a custom letter-contains algorithm: it treats the letters you enter as required, then scans a built-in 22,499-word dictionary to find every word that contains all of them — e.g. input qu and it lists queen, quick, square, unique; input ght and it lists night, light, thought. Results are grouped from shortest to longest by length, each tagged with a CEFR difficulty level, IPA transcription, part of speech, and Chinese gloss, expandable to show an English definition and example sentence — a powerful helper for crosswords, Wordle, and English spelling practice. This tool is a pure front-end algorithm that fetches no external API for results, so it is fast and works offline.",
    trustNoteLabel: "Data source:", trustNote: "Words are generated by a custom letter-subset algorithm matched against a built-in dictionary (pure front-end, no external API); CEFR levels are matched against the CEFR-J and Octanove authoritative wordlists; Chinese glosses prioritize the editorial team's hand-written Traditional Chinese, falling back to ECDICT's Simplified gloss (tagged Simp) when no Traditional one exists, and to an English definition when neither is available; IPA comes from ECDICT and ARPABET conversion; examples come from the Free Dictionary API. For study and entertainment reference only.",
    quickActionCard: "Quick Find Card", tryExample: "Find words containing qu", examplePreview: "Words found", examplePerson: "Required letters", fillExample: "Find words containing qu", previewActivePath: "Find words containing ght",
    examplesCalculator: "Examples → Solve", enterValues: "Enter letters", examplesHelper: "Start with a popular example to see how CEFR level, IPA, and Chinese gloss appear, then swap in the letters you want to rearrange.",
    queryBtn: "Find words", clearBtn: "Clear", hotWords: "Popular letter sets", inputPlaceholder: "Type required letters, e.g. qu",
    loading: "Searching…", emptyHint: "Enter letters above and press Find words; every word that contains them appears here, grouped by length.", noResult: "No words contain these letters; try a different set (fewer letters usually means more matches).",
    fallbackTitle: "Loading dictionary", fallbackBody: "The built-in dictionary is loading, please try again shortly.",
    resultCard: "Matching Words", unit: "words", letterPool: "required letters", lenGroupLabel: "-letter", primaryValue: "Input letters", ipaLabel: "IPA", ipaPending: "/pending/", meaningLabel: "Gloss", glossTagCn: "(Simp)", glossTagEn: "(EN)", enGlossHint: "See English definition & example on expand", expandHint: "Show example", collapseHint: "Collapse", exampleLabel: "Example", enLoading: "Loading example…", noExample: "No example found; try writing your own.",
    resultIntelligence: "Result Intelligence", levelMatrix: "Six-level CEFR word matrix", levelMatrixNote: "L7 groups the words you can make by CEFR level using the authoritative CEFR-J wordlist, with A1 most common and C2 rarest; pick the level you recognize when solving puzzles.",
    scenarioLayer: "Use scenarios", scenarioTitle: "When to use letter unscrambling", scenarioNote: "L8 lists four typical scenarios so you unscramble letters in the right place, not just random guessing.",
    scenarioExam: "Word games", scenarioExamNote: "When stuck in Scrabble or Words with Friends, unscramble your tiles to find every word — including shorter subset words for guaranteed points.", scenarioWriting: "Puzzle solving", scenarioWritingNote: "For crosswords and word puzzles, unscramble the clue letters to find both full and partial answers.", scenarioDaily: "Creative naming", scenarioDailyNote: "Naming a brand, handle, or character, unscramble your keyword to find fun shorter coinages.", scenarioBusiness: "Spelling practice", scenarioBusinessNote: "Unscramble common letters to observe spelling patterns and learn new words via the CEFR tags.",
    progressInsight: "Learning Insight Card", possibleTarget: "This solve", dailyGap: "Most common level", weeklyTrend: "Graded ratio", motivation: "Motivation Card", keepMomentum: "Move from playing anagrams to actively building spelling intuition",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's new words home", journeyHint: "Look up and make sentences with 2–3 anagrams you didn't know; play games and learn words at once.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect anagrams to the next tool", nextActionItem1: "Use Synonym Finder to swap the anagram words and understand the semantic spectrum", nextActionItem2: "Use CEFR Level Estimator to confirm the anagram difficulty fits your level", nextActionItem3: "Use Word Root Analyzer to see where the anagram word's meaning comes from and remember it better",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Solving Path", decisionTitle: "Input → Solve → Understand → Apply", step1: "Type letters", step2: "Unscramble", step3: "Read CEFR", step4: "Use in game",
    knowledge: "Knowledge", knowledgeTitle: "What letter-contains search means in English learning", definition: "Definition", definitionText: "Letter-contains search treats your input letters as required, finding every word that contains all of them — e.g. words with qu, or words with ght. This is a common technique for crosswords, Wordle, and vocabulary memory.", usage: "Usage", usageText: "After you enter the required letters, the algorithm reduces them to letter counts, then scans the dictionary checking each word contains all of them, finally grouping results from shortest to longest. Fewer required letters usually yield more matches.", limitations: "Limitations", limitationsText: "The dictionary is a built-in 22,499-word common-word list; very rare words, proper nouns, and most plural forms may not be included; CEFR levels primarily use the CEFR-J/Octanove wordlists, falling back to a word-length heuristic for unlisted words.", interpretation: "Interpretation", interpretationText: "A1/A2 short words suit everyday spelling and vocabulary basics; B1/B2 suit advanced crosswords; C1/C2 are rare but often the targets for advanced vocabulary practice.", context: "Context", contextText: "Letter-contains search should be used with synonyms, word roots, and CEFR estimation: after finding words with given letters, look up meaning and origin to turn searching into an effective vocabulary tool.", example: "Example", exampleText: "Input qu → queen/quick/square/unique (contain q and u); input ght → night/light/thought (contain g, h, t).",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Related Tools", affiliateTitle: "Next tools for anagram solving", premiumTitle: "PRO Unscramble Pack", premiumText: "Unlock unlimited solves, filter results by CEFR level, sort by word length, auto-log solving history, and export anagram lists for review.",
    feat1: "Unlimited solves", feat2: "Level filter", feat3: "Solving history", feat4: "Export anagram list",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for English learning and anagram entertainment only; anagrams are generated by a custom algorithm matched against a built-in dictionary, and CEFR levels are wordlist matches plus a heuristic, not an official language assessment.", relatedTools: "Related Tools", relatedToolsText: "Rhyme Finder · Synonym Finder · Word Root Analyzer · CEFR Level Estimator", references: "References", referencesText: "Custom letter-subset algorithm (pure front-end, checks each dictionary word's letters against the input letter pool); CEFR-J Wordlist v1.5 (Tono Lab, TUFS); Octanove C1/C2 Vocabulary Profile (CC BY-SA 4.0); ECDICT open EN-ZH dictionary (IPA and Simplified glosses); Traditional Chinese glosses hand-written by the editorial team; Free Dictionary API (examples).",
    q1: "How are the matching words found?", a1: "By a custom letter-contains algorithm: it reduces the input letters to letter counts, then scans a built-in 22,499-word dictionary, checking each word contains all the required letters, and groups results by length. Pure front-end, no external API call.",
    q2: "How is the CEFR level decided?", a2: "It is matched first against the CEFR-J and Octanove authoritative wordlists; only words not in the lists fall back to a word-length heuristic. It is study reference, not an official assessment.",
    q3: "Why do some letter sets find no other words?", a3: "If the letters can only spell the input word itself, or other combinations are not in the built-in dictionary, there will be no result. More letters mean more combinations; very rare words and most plurals may not be included.",
    q4: "Where do the IPA and Chinese gloss come from?", a4: "IPA comes from the open ECDICT EN-ZH dictionary (over 20k words built in); unlisted words convert ARPABET to IPA on the fly. Chinese glosses use a three-tier priority — the editorial team's hand-written Traditional Chinese first (no tag), then ECDICT's Simplified gloss tagged Simp, then an English definition tagged EN when neither exists. No machine translation is used. Examples come from the Free Dictionary API.",
    q5: "How is this different from Word Unscrambler?", a5: "Word Unscrambler builds words FROM your letters (word letters ⊆ input); Word Finder is the reverse — it finds words that CONTAIN your given letters (input ⊆ word), ideal for crosswords and Wordle.",
    q6: "Is it good for Scrabble?", a6: "Yes. Enter your tiles to solve all possible words, then pick high-scoring ones by CEFR level and length; for competition, confirm each word is legal under your rules.",
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

export default function WordFinder() {
  const { lang, setLang } = useLanguage();
  const t = ui[lang];
  const [input, setInput] = useState("qu");
  const [queryWord, setQueryWord] = useState("");
  const [cards, setCards] = useState<ResultCard[]>([]);
  const [solved, setSolved] = useState<boolean | undefined>(undefined); // undefined=未查 · true=已查
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
    buildWordIndex();
    const need = letterCount(word);
    if (!need || !WORD_INDEX) { setCards([]); setSolved(true); setLoading(false); return; }
    // 字母包含查找：找出「含有全部指定字母」的單字（word 為 superset），由短到長排序
    const matches = WORD_INDEX
      .filter((e) => e.word !== word && containsAll(e.count, need))
      .map((e) => e.word);
    const mapped: ResultCard[] = matches.map((w) => {
      const dict = DICT ? DICT[w] : undefined;
      const cefr: Cefr = dict && dict[0] ? (dict[0] as Cefr) : lenToCefr(w.length);
      // 4 欄位 [cefr, zh_tw, zh_cn, ipa]
      const zhTw = dict && dict[1] ? dict[1] : "";
      const zhCn = dict && dict[2] ? dict[2] : "";
      const ipa = dict && dict[3] ? normIpa(dict[3]) : "__PENDING__";
      // ② 詞類：從釋義文字開頭的詞性標記推導（n./vt./vi./adj./adv./num.）
      const posKey = posFromGloss(zhTw || zhCn);
      // ③ 三層優先序：繁體 → 簡體 → 英文定義（前端展開）
      let meaningZh = "", meaningSrc: MeaningSrc = "none";
      if (zhTw) { meaningZh = zhTw; meaningSrc = "tw"; }
      else if (zhCn) { meaningZh = zhCn; meaningSrc = "cn"; }
      // ④ 例句：內建 findExamples.json（英文+繁中翻譯）優先；無則展開時補 dictionaryapi.dev
      const ex = EXAMPLES[w];
      const base: ResultCard = { word: w, cefr, posKey, ipa, meaningZh, meaningSrc };
      if (ex) { base.exampleEn = ex.exampleEn; base.exampleZh = ex.exampleZh; base.enriched = true; }
      return base;
    }).sort((a, b) => a.word.length - b.word.length || a.word.localeCompare(b.word)).slice(0, 120);
    setCards(mapped);
    setSolved(true);
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

  function fillStandard() { setInput("qu"); runQuery("qu"); }
  function fillCut() { setInput("ght"); runQuery("ght"); }
  function clearAll() { setInput(""); setQueryWord(""); setCards([]); setSolved(undefined); setExpanded(null); }

  const stats = useMemo(() => {
    if (cards.length === 0) return null;
    const levelCount: Record<string, number> = {};
    let graded = 0;
    cards.forEach((c) => { if (c.cefr) { levelCount[c.cefr] = (levelCount[c.cefr] || 0) + 1; graded += 1; } });
    const topLevel = Object.entries(levelCount).sort((a, b) => b[1] - a[1])[0];
    return { count: cards.length, topLevel: topLevel ? topLevel[0] : "—", gradedPct: Math.round((graded / cards.length) * 100) };
  }, [cards]);

  const countDisplay = stats ? String(stats.count) : "—";

  // 按字母數分組（7字母 / 6字母 / 5字母…），由長到短
  const grouped = useMemo(() => {
    const map = new Map<number, ResultCard[]>();
    cards.forEach((c) => { const arr = map.get(c.word.length); if (arr) arr.push(c); else map.set(c.word.length, [c]); });
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [cards]);
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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{countDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div lang="en" translate="no" className="notranslate font-black">{queryWord || "—"}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.dailyGap}</div><div className="font-black">{stats ? stats.topLevel : "—"}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="font-black">{stats ? `${stats.gradedPct}%` : "—"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc · metric · imperial */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.hotWords}</h3><div className="mt-4 flex flex-wrap gap-2">{HOT_WORDS.map((w) => <button key={w} lang="en" translate="no" onClick={() => { setInput(w); runQuery(w); }} className="notranslate rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-black text-emerald-800">{w}</button>)}</div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.enterValues}</h3><div className="mt-4 flex flex-col gap-3 sm:flex-row"><input className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={input} placeholder={t.inputPlaceholder} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") runQuery(input); }} /><button onClick={() => runQuery(input)} className="rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-black text-white">{t.queryBtn}</button><button onClick={clearAll} className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700">{t.clearBtn}</button></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{countDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div lang="en" translate="no" className="notranslate mt-1 text-xl font-black">{queryWord || "—"}</div><div className="mt-1 text-xs text-slate-300">{t.letterPool}</div></div></div>
            <div className="mt-6 space-y-3">
              {loading && <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm font-black text-slate-600">{t.loading}</div>}
              {!loading && solved === undefined && <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm font-black text-slate-500">{t.emptyHint}</div>}
              {!loading && solved === true && cards.length === 0 && <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">{t.noResult}</div>}
              {!loading && grouped.map(([len, items]) => (
                <div key={len} className="space-y-2">
                  <div className="flex items-center gap-2 pt-1"><span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-black text-white">{len}{t.lenGroupLabel}</span><span className="text-xs font-black text-slate-400">{items.length}{t.unit}</span></div>
                  {items.map((card: ResultCard) => (
                  <div key={card.word} className="rounded-2xl border border-slate-200/60 bg-white/80 p-4 backdrop-blur">
                    <div className="flex flex-wrap items-center gap-3"><span lang="en" translate="no" className="notranslate text-xl font-black text-slate-900">{card.word}</span>{card.cefr && <span className={`rounded-full px-2 py-1 text-xs font-black ${cefrColor[card.cefr]}`}>{card.cefr}</span>}<span className="text-xs font-black text-slate-500">{l(posMap[card.posKey] || posMap.u, lang)}</span><span lang="en" translate="no" className="notranslate font-mono text-sm text-slate-600">{card.ipa === "__PENDING__" ? t.ipaPending : card.ipa}</span></div>
                    {card.meaningSrc === "none"
                      ? <p className="mt-2 text-sm leading-6 text-slate-500">{t.enGlossHint}</p>
                      : <p className="mt-2 text-sm leading-6 text-slate-700">{card.meaningZh}{card.meaningSrc === "cn" && <span className="ml-1 text-xs font-black text-amber-600">{t.glossTagCn}</span>}</p>}
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
                </div>
              ))}
            </div>
          </div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.levelMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.levelMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{cefrBands.map((item) => { const n = cards.filter((c) => c.cefr === item.key).length; return <div key={item.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className={`rounded-full px-2 py-1 text-xs font-black ${cefrColor[item.key]}`}>{n}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>; })}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="word-finder-result-intelligence" adFormat="horizontal" className="my-2" />
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
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="word-finder-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 可能包含站內或聯盟推薦；若透過部分連結購買，我們可能獲得佣金。" : "* May include on-site or affiliate recommendations. We may earn a commission from qualifying purchases."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-TrustRelatedReferences */}<p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
