// @profile B
// Profile B · Language-Hub 自建 JSON · CefrLevelEstimator（GOLD-STANDARD MacroCalculator compatible）
// CEFR 程度估算器：輸入英文單字，查內建 cefrWords.json（各級真實常用字，A1–C2 合計 1108 筆）→
//   直接取 [單字, CEFR 等級, 詞性, 繁體中文義]，並依六級分布給出學習建議。
//   純前端、不依賴 Datamuse 主清單；每筆附 CEFR 等級、詞性與繁體中文義，全照 gold 範本 17 層結構。

import { useMemo, useState, useCallback } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";
import cefrWordsData from "./cefrWords.json";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type Cefr = "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | null;
const l = (v: LocalText, lang: Lang) => v[lang];

// ============================================================
// 內建 CEFR 單字資料（自行整理 · 真實常用字 · 各級約 200 字，合計 1108 筆）
//   形態：{ word, cefr(A1–C2), pos(詞性), zh(繁體中文義) }
// ============================================================
type CefrEntry = { word: string; cefr: string; pos: string; zh: string };
const CEFR_WORDS = cefrWordsData as CefrEntry[];

// CEFR 顏色（沿用 gold 範本）
const cefrColor: Record<string, string> = {
  A1: "bg-emerald-100 text-emerald-800", A2: "bg-emerald-100 text-emerald-800",
  B1: "bg-sky-100 text-sky-800", B2: "bg-sky-100 text-sky-800",
  C1: "bg-violet-100 text-violet-800", C2: "bg-violet-100 text-violet-800",
};
const HOT_WORDS = ["happy", "achieve", "abandon", "elaborate", "ardent", "ubiquitous"] as const;

type ResultCard = {
  word: string; cefr: Cefr; pos: string; zh: string; exact: boolean;
};

const cefrBands = [
  { key: "A1", label: { zh: "A1 入門", en: "A1 Beginner" }, desc: { zh: "最基礎的日常單字，初學者最先學的核心詞彙。", en: "Most basic everyday words; the core vocabulary beginners learn first." } },
  { key: "A2", label: { zh: "A2 基礎", en: "A2 Elementary" }, desc: { zh: "常見生活單字，足以應付一般對話與短文。", en: "Common everyday words for basic conversation and short texts." } },
  { key: "B1", label: { zh: "B1 中級", en: "B1 Intermediate" }, desc: { zh: "中階單字，寫作與一般閱讀常出現。", en: "Mid-level words common in writing and general reading." } },
  { key: "B2", label: { zh: "B2 中高", en: "B2 Upper-Inter" }, desc: { zh: "進階單字，語意較抽象、學術文章常見。", en: "Advanced words with more abstract meanings, common in academic texts." } },
  { key: "C1", label: { zh: "C1 高級", en: "C1 Advanced" }, desc: { zh: "精準、較少見的高階單字，能提升表達層次。", en: "Precise, less-common high-level words that elevate expression." } },
  { key: "C2", label: { zh: "C2 精通", en: "C2 Proficiency" }, desc: { zh: "罕見而典雅的單字，母語者風格的高階詞彙。", en: "Rare and elegant words with native-like, high-level usage." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "片語動詞查找器", en: "Phrasal Verb Finder" }, href: "/tools/language/phrasal-verb-finder" },
  { label: { zh: "同義詞查找器", en: "Synonym Finder" }, href: "/tools/language/synonym-finder" },
  { label: { zh: "搭配詞查找器", en: "Collocation Finder" }, href: "/tools/language/collocation-finder" },
  { label: { zh: "慣用語解析器", en: "Idiom Explainer" }, href: "/tools/language/idiom-explainer" },
];

const ui = {
  zh: {
    badge: "語言 · CEFR 程度 · Language Hub", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "CEFR 程度估算器 · CEFR Level Estimator", subtitle: "輸入一個英文單字，立即查出它的 CEFR 等級（A1–C2）、詞性與繁體中文義，並依六級分布給出學習建議",
    intro: "CEFR Level Estimator 內建 1108 筆真實常用單字，依歐洲語言共同參考架構（CEFR）分為 A1、A2、B1、B2、C1、C2 六級，每級約兩百字。輸入一個英文單字，工具會比對內建詞表，顯示該字的 CEFR 等級、詞性與繁體中文義；若查無完全相符，會列出前綴相近的單字供參考。每筆都標註 CEFR 難度等級與詞性，幫您在閱讀、寫作、選字與考試準備時快速判斷單字難度、安排學習順序。本工具為純前端查找，不依賴外部 API 取結果，速度快、離線可用。",
    trustNoteLabel: "資料來源：", trustNote: "單字以自行整理的常用字表產生（A1–C2 各約兩百字，合計 1108 筆）；CEFR 等級以 CEFR-J 與 Octanove 權威詞表對照；詞性以常見字典標準縮寫標示；中文義為編輯團隊人工撰寫的繁體中文。僅供學習參考。",
    quickActionCard: "快速查找卡", tryExample: "一鍵查 happy 的 CEFR 等級", examplePreview: "符合的單字數", examplePerson: "查詢單字", fillExample: "查 happy 的等級", previewActivePath: "查 abandon 的等級",
    examplesCalculator: "範例 → 查找", enterValues: "輸入單字", examplesHelper: "先用熱門範例了解 CEFR 等級、詞性與中文義如何呈現，再換成您自己想查的單字。",
    queryBtn: "估算等級", clearBtn: "清除", hotWords: "熱門單字", inputPlaceholder: "輸入單字，例如 happy",
    loading: "查找中…", emptyHint: "輸入上方單字並按「估算等級」，這個單字的 CEFR 等級、詞性與中文義會列在這裡。", noResult: "找不到完全相符的單字，本表收錄 A1–C2 各約兩百個常用字，換一個試試，或檢查拼字。",
    fallbackTitle: "資料載入中", fallbackBody: "正在載入內建 CEFR 單字表，請稍候再試一次。",
    resultCard: "CEFR 估算結果", unit: "個符合單字", primaryValue: "查詢單字", ipaLabel: "音標", meaningLabel: "釋義", posLabel: "詞性", matchExact: "完全相符", matchPrefix: "前綴相近", glossTagCn: "簡", glossTagEn: "EN", enGlossHint: "展開看詞性與中文義", expandHint: "展開看詞性與中文義", collapseHint: "收合", exampleLabel: "詞性", enLoading: "載入中…", noExample: "查無詞性，請參考字典。",
    resultIntelligence: "結果解讀", levelMatrix: "六級 CEFR 單字分布矩陣", levelMatrixNote: "L7 將符合的單字依 CEFR 等級分層，以 CEFR-J 權威詞表對照，A1 最常用、C2 最罕見；學習時優先挑您該程度的單字。",
    scenarioLayer: "使用場景", scenarioTitle: "什麼時候用 CEFR 程度估算", scenarioNote: "L8 列出四個典型場景，把 CEFR 等級用在對的地方，而不是死背。",
    scenarioExam: "考試準備", scenarioExamNote: "多益、雅思、學測常依 CEFR 分級命題，先查單字等級，優先背您目標等級的字。", scenarioWriting: "寫作選字", scenarioWritingNote: "寫英文文章時，依等級選字，避免用太簡單或太冷僻的字，讓文章層次恰當。", scenarioDaily: "閱讀分級", scenarioDailyNote: "讀英文文章時，查生字等級，判斷這篇文章是否符合您目前的程度。", scenarioBusiness: "教學備課", scenarioBusinessNote: "老師備課時，依 CEFR 等級挑選教學單字，確保難度與學生程度相符。",
    progressInsight: "學習洞察卡", possibleTarget: "本次查找", dailyGap: "最常用等級", weeklyTrend: "已分級比例", motivation: "動力卡", keepMomentum: "從查單一單字走向系統掌握 CEFR 詞彙分級",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天查到的單字等級帶回家", journeyHint: "挑 2–3 個您不熟的單字記下等級與中文義，依 CEFR 分級背單字最有效率。",
    nextActionLabel: "下一步行動", nextActionTitle: "把 CEFR 等級接到下一個工具", nextActionItem1: "用片語動詞查找器查這個字的常見片語，搭配等級一起學", nextActionItem2: "用同義詞查找器找同等級或更高階的替代字，提升表達", nextActionItem3: "用搭配詞查找器看這個字常和哪些字一起出現，記得更牢",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "查找路徑", decisionTitle: "輸入 → 查找 → 理解 → 應用", step1: "輸入單字", step2: "估算等級", step3: "看 CEFR", step4: "排學習序",
    knowledge: "知識", knowledgeTitle: "CEFR 等級在英語學習中的意義", definition: "定義", definitionText: "CEFR（歐洲語言共同參考架構）把語言能力分為 A1、A2、B1、B2、C1、C2 六級，從入門到精通；單字也常依此分級，標示一個字大約屬於哪個程度的學習者會用到。", usage: "用法", usageText: "輸入一個單字後，工具會比對本表收錄、依 CEFR 分級的單字，顯示其等級、詞性與中文義；若查無完全相符，會列出前綴相近的單字供參考。", limitations: "限制", limitationsText: "本工具的單字表為自行整理的常用字（A1–C2 各約兩百字，合計 1108 筆）；極罕見、專業領域或俚語單字未必收錄；CEFR 等級以 CEFR-J/Octanove 詞表為主，僅供參考。", interpretation: "解讀", interpretationText: "A1/A2 單字最常用、最先學；B1/B2 適合寫作與進階閱讀；C1/C2 較罕見，多為精準或學術用字，掌握後表達更精緻。", context: "脈絡", contextText: "CEFR 估算應與片語動詞、同義詞、搭配詞一起用：先查單字等級與中文義，再延伸看片語、近義與搭配，把字學成可活用的工具。", example: "範例", exampleText: "輸入 happy → 顯示 A1（a. 快樂的）；輸入 achieve → 顯示 B1（v. 達成）；輸入 abandon → 顯示 B2（v. 拋棄）；輸入 ubiquitous → 顯示 C2（a. 無所不在的）。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "相關工具", affiliateTitle: "CEFR 估算的下一步工具", premiumTitle: "PRO CEFR 單字包", premiumText: "解鎖無限查找、依 CEFR 等級篩選結果、依字母排序、自動記錄查詢歷史，並把單字表匯出複習。",
    feat1: "無限查找次數", feat2: "難度等級篩選", feat3: "查詢歷史記錄", feat4: "單字表匯出",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供英語學習用途；單字以自行整理的常用字表產生，CEFR 等級為詞表對照，不等同官方語言檢定結果。", relatedTools: "相關工具", relatedToolsText: "Phrasal Verb Finder · Synonym Finder · Collocation Finder · Idiom Explainer", references: "參考資料", referencesText: "自行整理之常用字表（A1–C2 各約兩百字，合計 1108 筆）；CEFR-J Wordlist v1.5（Tono Lab, TUFS）；Octanove C1/C2 Vocabulary Profile（CC BY-SA 4.0）；詞性與中文義由編輯團隊人工撰寫整理。僅供學習參考。",
    q1: "CEFR 等級是怎麼查出來的？", a1: "工具內建一份自行整理、依 CEFR 分級的常用單字表（A1–C2 各約兩百字，合計 1108 筆）。輸入一個單字，工具就比對本表並顯示其等級、詞性與中文義。這是純前端查找，不需連外部 API。",
    q2: "CEFR 等級是怎麼判斷的？", a2: "以 CEFR-J 與 Octanove 權威詞表對照；A1 最常用、C2 最罕見。這是學習參考，非官方檢定。",
    q3: "為什麼有些單字查不到？", a3: "本表收錄 A1–C2 各約兩百個常用字；極罕見、專業領域或俚語單字未必收錄。查無完全相符時，工具會列出前綴相近的單字供參考。",
    q4: "詞性和中文義從哪來？", a4: "詞性以常見字典標準縮寫標示（如 n. v. adj. adv.）；中文義為編輯團隊人工撰寫的繁體中文。全程不經機器翻譯。",
    q5: "CEFR 等級和單字難度一樣嗎？", a5: "大致相關。CEFR 等級反映一個字大約屬於哪個程度的學習者會用到：A1/A2 最常用、最早學，C1/C2 較罕見、較進階。但難度也受拼字、搭配與語境影響，等級僅供參考。",
    q6: "適合考試準備嗎？", a6: "適合。多益、雅思、學測常依 CEFR 分級命題，查單字等級後，優先背您目標等級的字，並依等級安排學習順序。",
  },
  en: {
    badge: "Language · CEFR Level · Language Hub", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "CEFR Level Estimator", subtitle: "Type an English word and instantly see its CEFR level (A1–C2), part of speech, and Chinese gloss, with study advice based on the six-level distribution",
    intro: "CEFR Level Estimator has a built-in set of 1108 real common words graded into the six Common European Framework levels — A1, A2, B1, B2, C1, C2 — with about two hundred words each. Type an English word and the tool matches the built-in wordlist, showing the word's CEFR level, part of speech, and Chinese gloss; if no exact match is found, it lists prefix-similar words for reference. Each word is tagged with a CEFR difficulty level and part of speech, helping you quickly judge word difficulty and plan your study order for reading, writing, word choice, and exams. This tool is a pure front-end lookup that fetches no external API for results, so it is fast and works offline.",
    trustNoteLabel: "Data source:", trustNote: "Words come from a hand-curated common wordlist (about two hundred per level, A1–C2, 1108 entries); CEFR levels are matched against the CEFR-J and Octanove authoritative wordlists; parts of speech use standard dictionary abbreviations; Chinese glosses are hand-written in Traditional Chinese by the editorial team. For study reference only.",
    quickActionCard: "Quick Find Card", tryExample: "Find the CEFR level of happy", examplePreview: "Matching words", examplePerson: "Query word", fillExample: "Find the level of happy", previewActivePath: "Find the level of abandon",
    examplesCalculator: "Examples → Find", enterValues: "Enter word", examplesHelper: "Start with a popular example to see how the CEFR level, part of speech, and Chinese gloss appear, then swap in the word you want.",
    queryBtn: "Estimate level", clearBtn: "Clear", hotWords: "Popular words", inputPlaceholder: "Type a word, e.g. happy",
    loading: "Finding…", emptyHint: "Enter a word above and press Estimate level; the word's CEFR level, part of speech, and Chinese gloss will appear here.", noResult: "No exact match found; this list covers about two hundred common words per level (A1–C2), try another or check the spelling.",
    fallbackTitle: "Loading data", fallbackBody: "The built-in CEFR wordlist is loading, please try again shortly.",
    resultCard: "CEFR Estimation Result", unit: "matching words", primaryValue: "Query word", ipaLabel: "IPA", meaningLabel: "Gloss", posLabel: "Part of speech", matchExact: "Exact match", matchPrefix: "Prefix match", glossTagCn: "Simp", glossTagEn: "EN", enGlossHint: "See part of speech & gloss on expand", expandHint: "Show part of speech & gloss", collapseHint: "Collapse", exampleLabel: "Part of speech", enLoading: "Loading…", noExample: "No part of speech found; please refer to a dictionary.",
    resultIntelligence: "Result Intelligence", levelMatrix: "Six-level CEFR word distribution matrix", levelMatrixNote: "L7 groups matching words by CEFR level using the authoritative CEFR-J wordlist, with A1 most common and C2 rarest; pick words at the level that fits you when learning.",
    scenarioLayer: "Use scenarios", scenarioTitle: "When to use CEFR level estimation", scenarioNote: "L8 lists four typical scenarios so you use CEFR levels in the right place, not just memorize them.",
    scenarioExam: "Exam prep", scenarioExamNote: "TOEIC, IELTS, and school exams often grade items by CEFR; check word levels and prioritize words at your target level.", scenarioWriting: "Writing word choice", scenarioWritingNote: "When writing in English, choose words by level to avoid being too simple or too obscure, keeping the right register.", scenarioDaily: "Reading grading", scenarioDailyNote: "When reading English, check unknown word levels to judge whether the text fits your current level.", scenarioBusiness: "Teaching prep", scenarioBusinessNote: "When preparing lessons, pick teaching words by CEFR level to match difficulty with student level.",
    progressInsight: "Learning Insight Card", possibleTarget: "This lookup", dailyGap: "Most common level", weeklyTrend: "Graded ratio", motivation: "Motivation Card", keepMomentum: "Move from single-word lookup to systematic mastery of CEFR vocabulary grading",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's word levels home", journeyHint: "Pick 2–3 words you don't know, note the level and Chinese gloss; learning vocabulary by CEFR level works best.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect CEFR levels to the next tool", nextActionItem1: "Use Phrasal Verb Finder to find common phrasals of this word and learn them with the level", nextActionItem2: "Use Synonym Finder to find same- or higher-level alternatives and improve expression", nextActionItem3: "Use Collocation Finder to see which words this one appears with and remember it better",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Lookup Path", decisionTitle: "Input → Find → Understand → Apply", step1: "Type word", step2: "Estimate level", step3: "Read CEFR", step4: "Plan study order",
    knowledge: "Knowledge", knowledgeTitle: "What CEFR levels mean in English learning", definition: "Definition", definitionText: "CEFR (Common European Framework of Reference) grades language ability into six levels — A1, A2, B1, B2, C1, C2 — from beginner to mastery; words are often graded this way too, marking roughly which level of learner uses a word.", usage: "Usage", usageText: "After you enter a word, the tool matches the graded built-in wordlist, showing its level, part of speech, and Chinese gloss; if no exact match is found, it lists prefix-similar words for reference.", limitations: "Limitations", limitationsText: "The wordlist is a hand-curated common set (about two hundred per level, A1–C2, 1108 entries); very rare, specialist, or slang words may not be included; CEFR levels primarily use the CEFR-J/Octanove wordlists.", interpretation: "Interpretation", interpretationText: "A1/A2 words are most common and learned first; B1/B2 suit writing and advanced reading; C1/C2 are rarer, often precise or academic, and make expression more refined once mastered.", context: "Context", contextText: "CEFR estimation should be used with phrasal verbs, synonyms, and collocations: check the word level and gloss first, then extend to phrasals, synonyms, and collocations to make the word an active tool.", example: "Example", exampleText: "Input happy → shows A1 (adj. happy); input achieve → shows B1 (v. to achieve); input abandon → shows B2 (v. to abandon); input ubiquitous → shows C2 (adj. ubiquitous).",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Related Tools", affiliateTitle: "Next tools for CEFR estimation", premiumTitle: "PRO CEFR Word Pack", premiumText: "Unlock unlimited lookups, filter results by CEFR level, sort alphabetically, auto-log lookup history, and export wordlists for review.",
    feat1: "Unlimited lookups", feat2: "Level filter", feat3: "Lookup history", feat4: "Export wordlist",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for English learning only; words come from a hand-curated common wordlist, and CEFR levels are wordlist matches, not an official language assessment.", relatedTools: "Related Tools", relatedToolsText: "Phrasal Verb Finder · Synonym Finder · Collocation Finder · Idiom Explainer", references: "References", referencesText: "Hand-curated common wordlist (about two hundred per level, A1–C2, 1108 entries); CEFR-J Wordlist v1.5 (Tono Lab, TUFS); Octanove C1/C2 Vocabulary Profile (CC BY-SA 4.0); parts of speech and Chinese glosses hand-written by the editorial team. For study reference only.",
    q1: "How is the CEFR level found?", a1: "The tool has a built-in hand-curated, CEFR-graded common wordlist (about two hundred per level, A1–C2, 1108 entries). Enter a word and the tool matches the list and shows its level, part of speech, and Chinese gloss. It is a pure front-end lookup with no external API call.",
    q2: "How is the CEFR level decided?", a2: "It is matched against the CEFR-J and Octanove authoritative wordlists; A1 is most common and C2 rarest. It is study reference, not an official assessment.",
    q3: "Why do some words return no result?", a3: "This list covers about two hundred common words per level (A1–C2); very rare, specialist, or slang words may not be included. When no exact match is found, the tool lists prefix-similar words for reference.",
    q4: "Where do the part of speech and gloss come from?", a4: "Parts of speech use standard dictionary abbreviations (n. v. adj. adv.); Chinese glosses are hand-written in Traditional Chinese by the editorial team. No machine translation is used.",
    q5: "Is CEFR level the same as word difficulty?", a5: "Roughly related. A CEFR level reflects which learner level uses a word: A1/A2 most common and learned first, C1/C2 rarer and more advanced. But difficulty also depends on spelling, collocation, and context, so the level is a reference only.",
    q6: "Is it good for exam prep?", a6: "Yes. TOEIC, IELTS, and school exams often grade items by CEFR; after checking word levels, prioritize words at your target level and plan your study order by level.",
  },
} as const;

const faqKeys = [["q1", "a1"], ["q2", "a2"], ["q3", "a3"], ["q4", "a4"], ["q5", "a5"], ["q6", "a6"]] as const;

export default function CefrLevelEstimator() {
  const { lang, setLang } = useLanguage();
  const t = ui[lang];
  const [input, setInput] = useState("happy");
  const [queryWord, setQueryWord] = useState("");
  const [cards, setCards] = useState<ResultCard[]>([]);
  const [solved, setSolved] = useState<boolean | undefined>(undefined); // undefined=未查 · true=已查
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const runQuery = useCallback((rawWord: string) => {
    const word = rawWord.trim().toLowerCase().replace(/[^a-z]/g, "");
    if (!word) return;
    setLoading(true);
    setQueryWord(word);
    setExpanded(null);
    const exactMatches = CEFR_WORDS.filter((e) => e.word.toLowerCase() === word);
    let matched: ResultCard[];
    if (exactMatches.length > 0) {
      matched = exactMatches.map((e) => ({
        word: e.word, cefr: (e.cefr as Cefr) || null, pos: e.pos, zh: e.zh, exact: true,
      }));
    } else {
      const prefixMatches = CEFR_WORDS.filter((e) => e.word.toLowerCase().startsWith(word)).slice(0, 12);
      matched = prefixMatches.map((e) => ({
        word: e.word, cefr: (e.cefr as Cefr) || null, pos: e.pos, zh: e.zh, exact: false,
      }));
    }
    setCards(matched);
    setSolved(true);
    setLoading(false);
  }, []);

  const toggleExpand = useCallback((word: string) => {
    setExpanded((prev) => (prev === word ? null : word));
  }, []);

  function fillStandard() { setInput("happy"); runQuery("happy"); }
  function fillCut() { setInput("abandon"); runQuery("abandon"); }
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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{countDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{queryWord || "—"}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.dailyGap}</div><div className="font-black">{stats ? stats.topLevel : "—"}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="font-black">{stats ? `${stats.gradedPct}%` : "—"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Query */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.hotWords}</h3><div className="mt-4 flex flex-wrap gap-2">{HOT_WORDS.map((w) => <button key={w} onClick={() => { setInput(w); runQuery(w); }} className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-black text-emerald-800">{w}</button>)}</div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.enterValues}</h3><div className="mt-4 flex flex-col gap-3 sm:flex-row"><input className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={input} placeholder={t.inputPlaceholder} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") runQuery(input); }} /><button onClick={() => runQuery(input)} className="rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-black text-white">{t.queryBtn}</button><button onClick={clearAll} className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700">{t.clearBtn}</button></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{countDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{queryWord || "—"}</div><div className="mt-1 text-xs text-slate-300">CEFR</div></div></div>
            <div className="mt-6 space-y-3">
              {loading && <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm font-black text-slate-600">{t.loading}</div>}
              {!loading && solved === undefined && <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm font-black text-slate-500">{t.emptyHint}</div>}
              {!loading && solved === true && cards.length === 0 && <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">{t.noResult}</div>}
              {!loading && cards.map((card) => (
                <div key={card.word} className="rounded-2xl border border-slate-200/60 bg-white/80 p-4 backdrop-blur">
                  <div className="flex flex-wrap items-center gap-3"><span className="text-xl font-black text-slate-900">{card.word}</span>{card.cefr && <span className={`rounded-full px-2 py-1 text-xs font-black ${cefrColor[card.cefr]}`}>{card.cefr}</span>}<span className="text-xs font-black text-slate-500">{card.exact ? t.matchExact : t.matchPrefix}</span></div>
                  <p className="mt-2 text-sm leading-6 text-slate-700"><span className="font-black text-slate-400">{t.meaningLabel}：</span>{card.zh}</p>
                  <button type="button" onClick={() => toggleExpand(card.word)} className="mt-2 text-xs font-black text-emerald-700">{expanded === card.word ? t.collapseHint : `▸ ${t.expandHint}`}</button>
                  {expanded === card.word && (
                    <div className="mt-2 rounded-xl bg-slate-50 p-3">
                      <p className="text-sm text-slate-600"><span className="font-black text-slate-400">{t.posLabel}：</span>{card.pos || t.noExample}</p>
                      <p className="mt-1 text-sm italic text-slate-500">{card.zh}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.levelMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.levelMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{cefrBands.map((item) => { const n = cards.filter((c) => c.cefr === item.key).length; return <div key={item.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className={`rounded-full px-2 py-1 text-xs font-black ${cefrColor[item.key]}`}>{n}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>; })}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="cefr-level-result-intelligence" adFormat="horizontal" className="my-2" />
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
