// @profile B
// Profile B · Language-Hub 自建 JSON · PhrasalVerbFinder（GOLD-STANDARD MacroCalculator compatible）
// 片語動詞查找器：輸入常見 base 動詞（get/go/come/put/take/make/give/look/turn/bring/set/run/break/keep/hold/fall/cut/call），
//   篩內建 phrasalVerbs.json（204 筆真實片語動詞）→ 直接取 [片語, 中文義, 英文義, 例句, CEFR]。
//   純前端、不依賴 Datamuse 主清單；每筆附 CEFR 等級、繁體中文義、英文義與例句，全照 gold 範本 17 層結構。

import { useMemo, useState, useCallback } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";
import phrasalVerbsData from "./phrasalVerbs.json";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type Cefr = "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | null;
const l = (v: LocalText, lang: Lang) => v[lang];

// ============================================================
// 內建片語動詞資料（自行整理 · 真實常見片語動詞 · 204 筆）
//   形態：{ base, verb, zh(繁體中文義), en(英文義), example(例句), cefr }
// ============================================================
type PhrasalEntry = { base: string; verb: string; zh: string; en: string; example: string; cefr: string };
const PHRASALS = phrasalVerbsData as PhrasalEntry[];

// CEFR 顏色（沿用 gold 範本）
const cefrColor: Record<string, string> = {
  A1: "bg-emerald-100 text-emerald-800", A2: "bg-emerald-100 text-emerald-800",
  B1: "bg-sky-100 text-sky-800", B2: "bg-sky-100 text-sky-800",
  C1: "bg-violet-100 text-violet-800", C2: "bg-violet-100 text-violet-800",
};
const HOT_WORDS = ["get", "take", "look", "make", "turn", "break"] as const;

type ResultCard = {
  verb: string; cefr: Cefr; zh: string; en: string; example: string;
};

const cefrBands = [
  { key: "A1", label: { zh: "A1 入門", en: "A1 Beginner" }, desc: { zh: "最常用的日常片語動詞，初學者最先學的搭配。", en: "Most common everyday phrasal verbs; the first ones beginners learn." } },
  { key: "A2", label: { zh: "A2 基礎", en: "A2 Elementary" }, desc: { zh: "常見口語片語動詞，足以應付一般對話。", en: "Common spoken phrasal verbs for everyday conversation." } },
  { key: "B1", label: { zh: "B1 中級", en: "B1 Intermediate" }, desc: { zh: "中階片語動詞，寫作與閱讀常出現。", en: "Mid-level phrasal verbs common in writing and reading." } },
  { key: "B2", label: { zh: "B2 中高", en: "B2 Upper-Inter" }, desc: { zh: "進階片語動詞，語意較抽象、需多練習。", en: "Advanced phrasal verbs with more abstract meanings." } },
  { key: "C1", label: { zh: "C1 高級", en: "C1 Advanced" }, desc: { zh: "精準、較少見的高階片語動詞。", en: "Precise, less-common high-level phrasal verbs." } },
  { key: "C2", label: { zh: "C2 精通", en: "C2 Proficiency" }, desc: { zh: "罕見而典雅的片語動詞，母語者風格用法。", en: "Rare and elegant phrasal verbs with native-like usage." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "片語搭配查找器", en: "Collocation Finder" }, href: "/tools/language/collocation-finder" },
  { label: { zh: "同義詞查找器", en: "Synonym Finder" }, href: "/tools/language/synonym-finder" },
  { label: { zh: "字根分析器", en: "Word Root Analyzer" }, href: "/tools/language/word-root-analyzer" },
  { label: { zh: "CEFR 等級估算", en: "CEFR Level Estimator" }, href: "/tools/language/cefr-level-estimator" },
];

const ui = {
  zh: {
    badge: "語言 · 片語動詞 · Language Hub", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "片語動詞查找器 · Phrasal Verb Finder", subtitle: "輸入一個常見動詞，立刻列出它構成的所有片語動詞、帶 CEFR 等級、中文義、英文義與例句",
    intro: "Phrasal Verb Finder 內建 204 筆真實常見片語動詞，涵蓋 get、go、come、put、take、make、give、look、turn、bring、set、run、break、keep、hold、fall、cut、call 等十八個高頻 base 動詞，每個動詞至少十個片語。輸入一個動詞，工具會列出它構成的所有片語動詞，每筆都標註 CEFR 難度等級、繁體中文義、英文義與一個例句，幫您在閱讀、寫作、口說與考試時快速掌握片語動詞的正確意思與用法。本工具為純前端查找，不依賴外部 API 取結果，速度快、離線可用。",
    trustNoteLabel: "資料來源：", trustNote: "片語動詞以自行整理的常見片語動詞庫產生（涵蓋十八個高頻 base 動詞，每個至少十個片語）；CEFR 等級以 CEFR-J 與 Octanove 權威詞表對照；中文義為編輯團隊人工撰寫的繁體中文；英文義與例句由編輯團隊參考常見字典整理。僅供學習參考。",
    quickActionCard: "快速查找卡", tryExample: "一鍵查 get 的片語動詞", examplePreview: "找到的片語數", examplePerson: "查詢動詞", fillExample: "查 get 的片語動詞", previewActivePath: "查 take 的片語動詞",
    examplesCalculator: "範例 → 查找", enterValues: "輸入動詞", examplesHelper: "先用熱門範例了解 CEFR 等級、中文義與例句如何呈現，再換成您自己想查的 base 動詞。",
    queryBtn: "查找片語", clearBtn: "清除", hotWords: "熱門動詞", inputPlaceholder: "輸入動詞，例如 get",
    loading: "查找中…", emptyHint: "輸入上方動詞並按「查找片語」，這個動詞構成的所有片語動詞會列在這裡。", noResult: "找不到這個動詞的片語動詞，本庫收錄 get/go/come/put/take/make/give/look/turn/bring/set/run/break/keep/hold/fall/cut/call 等高頻動詞，換一個試試。",
    fallbackTitle: "資料載入中", fallbackBody: "正在載入內建片語動詞庫，請稍候再試一次。",
    resultCard: "片語動詞結果", unit: "個片語動詞", primaryValue: "查詢動詞", ipaLabel: "音標", meaningLabel: "釋義", glossTagCn: "簡", glossTagEn: "EN", enGlossHint: "展開看英文義與例句", expandHint: "展開看英文義與例句", collapseHint: "收合", exampleLabel: "例句", enLoading: "載入中…", noExample: "查無例句，建議造句練習。",
    resultIntelligence: "結果解讀", levelMatrix: "六級 CEFR 片語動詞解讀矩陣", levelMatrixNote: "L7 將片語動詞依 CEFR 等級分層，以 CEFR-J 權威詞表對照，A1 最常用、C2 最罕見；學習時優先挑您該程度的片語。",
    scenarioLayer: "使用場景", scenarioTitle: "什麼時候用片語動詞查找", scenarioNote: "L8 列出四個典型場景，把片語動詞用在對的地方，而不是死背。",
    scenarioExam: "考試準備", scenarioExamNote: "多益、雅思、學測常考片語動詞，輸入動詞快速複習它的所有搭配與例句。", scenarioWriting: "寫作潤飾", scenarioWritingNote: "寫英文文章時，用片語動詞讓語句更道地、更口語自然。", scenarioDaily: "日常口說", scenarioDailyNote: "母語者口說大量使用片語動詞，先掌握高頻動詞的片語才聽得懂、說得出。", scenarioBusiness: "商務溝通", scenarioBusinessNote: "商務 email 與會議常見 set up、carry out、follow up 等片語，學會用得專業。",
    progressInsight: "學習洞察卡", possibleTarget: "本次查找", dailyGap: "最常用等級", weeklyTrend: "已分級比例", motivation: "動力卡", keepMomentum: "從查單一片語走向系統掌握片語動詞家族",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天查到的片語動詞帶回家", journeyHint: "挑 2–3 個您不熟的片語動詞造句並記下中文義，片語動詞背成家族最有效。",
    nextActionLabel: "下一步行動", nextActionTitle: "把片語動詞接到下一個工具", nextActionItem1: "用片語搭配查找器找出和片語動詞語意相近的詞，理解語意光譜", nextActionItem2: "用 CEFR 等級估算確認片語動詞難度是否符合您的程度", nextActionItem3: "用字根分析器理解片語中 base 動詞的語義從何而來，記得更牢",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "查找路徑", decisionTitle: "輸入 → 查找 → 理解 → 應用", step1: "輸入動詞", step2: "查找片語", step3: "看 CEFR", step4: "用在句子",
    knowledge: "知識", knowledgeTitle: "片語動詞在英語學習中的意義", definition: "定義", definitionText: "片語動詞（phrasal verb）是「動詞＋介系詞／副詞」組成的固定搭配，整體意思常和單獨的動詞不同，例如 give up（放棄）並不是 give（給）加 up（向上）的字面意思。", usage: "用法", usageText: "輸入一個 base 動詞後，工具會列出本庫收錄、由該動詞構成的所有片語動詞，並標註中文義、英文義與例句。同一個動詞常能組成許多片語，例如 take 就有 take off、take on、take up 等多種。", limitations: "限制", limitationsText: "本工具的片語動詞庫為自行整理的常見片語動詞（涵蓋十八個高頻 base 動詞，每個至少十個片語）；極罕見、地區性或俚語片語未必收錄；CEFR 等級以 CEFR-J/Octanove 詞表為主。", interpretation: "解讀", interpretationText: "A1/A2 片語動詞最常用、最先學；B1/B2 適合寫作與進階閱讀；C1/C2 較罕見，多為道地或抽象用法，掌握後表達更自然。", context: "脈絡", contextText: "片語動詞查找應與片語搭配、字根、CEFR 估算一起用：先查片語意思與例句，再延伸理解語意與來源，把片語動詞學成可活用的工具。", example: "範例", exampleText: "輸入 take → 列出 take off（起飛／脫下，A2）、take on（承擔，B1）、take up（開始嗜好，B1）等；輸入 give → 列出 give up（放棄，A2）、give in（屈服，B1）等。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "相關工具", affiliateTitle: "片語動詞查找的下一步工具", premiumTitle: "PRO 片語動詞包", premiumText: "解鎖無限查找、依 CEFR 等級篩選結果、依字母排序、自動記錄查詢歷史，並把片語動詞表匯出複習。",
    feat1: "無限查找次數", feat2: "難度等級篩選", feat3: "查詢歷史記錄", feat4: "片語動詞表匯出",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供英語學習用途；片語動詞以自行整理的常見片語動詞庫產生，CEFR 等級為詞表對照，不等同官方語言檢定結果。", relatedTools: "相關工具", relatedToolsText: "Collocation Finder · Synonym Finder · Word Root Analyzer · CEFR Level Estimator", references: "參考資料", referencesText: "自行整理之常見片語動詞庫（涵蓋十八個高頻 base 動詞，每個至少十個片語，共 204 筆）；CEFR-J Wordlist v1.5（Tono Lab, TUFS）；Octanove C1/C2 Vocabulary Profile（CC BY-SA 4.0）；中文義、英文義與例句由編輯團隊人工撰寫整理。僅供學習參考。",
    q1: "片語動詞是怎麼查出來的？", a1: "工具內建一份自行整理的常見片語動詞庫（涵蓋 get/go/come/put/take 等十八個高頻 base 動詞，每個至少十個片語，共 204 筆）。輸入一個動詞，工具就篩出由它構成的所有片語動詞。這是純前端查找，不需連外部 API。",
    q2: "CEFR 等級是怎麼判斷的？", a2: "以 CEFR-J 與 Octanove 權威詞表對照；A1 最常用、C2 最罕見。這是學習參考，非官方檢定。",
    q3: "為什麼有些動詞查不到片語？", a3: "本庫聚焦 get/go/come/put/take/make/give/look/turn/bring/set/run/break/keep/hold/fall/cut/call 等十八個高頻 base 動詞；其他動詞、極罕見或地區性片語未必收錄。",
    q4: "中文義和例句從哪來？", a4: "中文義為編輯團隊人工撰寫的繁體中文（無標註）；英文義與例句由編輯團隊參考常見字典整理。全程不經機器翻譯。",
    q5: "片語動詞和搭配詞有什麼不同？", a5: "片語動詞是「動詞＋介副詞」的固定組合，整體意思常和字面不同（如 give up＝放棄）；搭配詞（collocation）則是語意相近、常一起出現的詞。查語意相近詞請改用片語搭配查找器。",
    q6: "適合考試準備嗎？", a6: "適合。多益、雅思、學測常考片語動詞，輸入動詞快速複習它的所有搭配、中文義與例句，並依 CEFR 等級安排學習順序。",
  },
  en: {
    badge: "Language · Phrasal Verb · Language Hub", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Phrasal Verb Finder", subtitle: "Type a common verb and instantly list all the phrasal verbs it forms, with CEFR level, Chinese gloss, English meaning, and example",
    intro: "Phrasal Verb Finder has a built-in set of 204 real common phrasal verbs covering eighteen high-frequency base verbs — get, go, come, put, take, make, give, look, turn, bring, set, run, break, keep, hold, fall, cut, and call — with at least ten phrasal verbs each. Type a verb and the tool lists all phrasal verbs it forms, each tagged with a CEFR difficulty level, Chinese gloss, English meaning, and an example sentence, helping you quickly master the correct meaning and usage of phrasal verbs for reading, writing, speaking, and exams. This tool is a pure front-end lookup that fetches no external API for results, so it is fast and works offline.",
    trustNoteLabel: "Data source:", trustNote: "Phrasal verbs come from a hand-curated common phrasal-verb set (covering eighteen high-frequency base verbs, at least ten each); CEFR levels are matched against the CEFR-J and Octanove authoritative wordlists; Chinese glosses are hand-written in Traditional Chinese by the editorial team; English meanings and examples are compiled by the editorial team from common dictionaries. For study reference only.",
    quickActionCard: "Quick Find Card", tryExample: "Find phrasal verbs for get", examplePreview: "Phrasal verbs found", examplePerson: "Query verb", fillExample: "Find phrasal verbs for get", previewActivePath: "Find phrasal verbs for take",
    examplesCalculator: "Examples → Find", enterValues: "Enter verb", examplesHelper: "Start with a popular example to see how CEFR level, Chinese gloss, and example appear, then swap in the base verb you want.",
    queryBtn: "Find phrasal verbs", clearBtn: "Clear", hotWords: "Popular verbs", inputPlaceholder: "Type a verb, e.g. get",
    loading: "Finding…", emptyHint: "Enter a verb above and press Find phrasal verbs; all phrasal verbs formed by it will appear here.", noResult: "No phrasal verbs found for this verb; this set covers get/go/come/put/take/make/give/look/turn/bring/set/run/break/keep/hold/fall/cut/call, try another.",
    fallbackTitle: "Loading data", fallbackBody: "The built-in phrasal-verb set is loading, please try again shortly.",
    resultCard: "Phrasal Verb Results", unit: "phrasal verbs", primaryValue: "Query verb", ipaLabel: "IPA", meaningLabel: "Gloss", glossTagCn: "Simp", glossTagEn: "EN", enGlossHint: "See English meaning & example on expand", expandHint: "Show English meaning & example", collapseHint: "Collapse", exampleLabel: "Example", enLoading: "Loading…", noExample: "No example found; try writing your own.",
    resultIntelligence: "Result Intelligence", levelMatrix: "Six-level CEFR phrasal-verb matrix", levelMatrixNote: "L7 groups phrasal verbs by CEFR level using the authoritative CEFR-J wordlist, with A1 most common and C2 rarest; pick the level that fits you when learning.",
    scenarioLayer: "Use scenarios", scenarioTitle: "When to use phrasal-verb lookup", scenarioNote: "L8 lists four typical scenarios so you use phrasal verbs in the right place, not just memorize them.",
    scenarioExam: "Exam prep", scenarioExamNote: "TOEIC, IELTS, and school exams often test phrasal verbs; enter a verb to review all its combinations and examples.", scenarioWriting: "Writing polish", scenarioWritingNote: "When writing in English, use phrasal verbs to make sentences more natural and idiomatic.", scenarioDaily: "Daily speaking", scenarioDailyNote: "Native speakers use phrasal verbs heavily; master the high-frequency verbs' phrasals to understand and speak.", scenarioBusiness: "Business communication", scenarioBusinessNote: "Business emails and meetings feature set up, carry out, follow up; learn to use them professionally.",
    progressInsight: "Learning Insight Card", possibleTarget: "This lookup", dailyGap: "Most common level", weeklyTrend: "Graded ratio", motivation: "Motivation Card", keepMomentum: "Move from single phrasals to systematic mastery of phrasal-verb families",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's phrasal verbs home", journeyHint: "Pick 2–3 phrasal verbs you don't know, write sentences, and note the Chinese gloss; learning them as families works best.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect phrasal verbs to the next tool", nextActionItem1: "Use Collocation Finder to find words semantically close to the phrasal verb and grasp the spectrum", nextActionItem2: "Use CEFR Level Estimator to confirm the phrasal-verb difficulty fits your level", nextActionItem3: "Use Word Root Analyzer to see where the base verb's meaning comes from and remember it better",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Lookup Path", decisionTitle: "Input → Find → Understand → Apply", step1: "Type verb", step2: "Find phrasals", step3: "Read CEFR", step4: "Use in sentence",
    knowledge: "Knowledge", knowledgeTitle: "What phrasal verbs mean in English learning", definition: "Definition", definitionText: "A phrasal verb is a fixed combination of a verb plus a preposition or adverb whose meaning often differs from the verb alone; for example give up (to quit) is not the literal give plus up.", usage: "Usage", usageText: "After you enter a base verb, the tool lists all phrasal verbs it forms from the built-in set, with Chinese gloss, English meaning, and example. One verb often forms many phrasals, e.g. take has take off, take on, take up.", limitations: "Limitations", limitationsText: "The phrasal-verb set is a hand-curated common set (eighteen high-frequency base verbs, at least ten each); very rare, regional, or slang phrasals may not be included; CEFR levels primarily use the CEFR-J/Octanove wordlists.", interpretation: "Interpretation", interpretationText: "A1/A2 phrasal verbs are most common and learned first; B1/B2 suit writing and advanced reading; C1/C2 are rarer, often idiomatic or abstract, and make expression more natural once mastered.", context: "Context", contextText: "Phrasal-verb lookup should be used with collocations, word roots, and CEFR estimation: look up the meaning and example first, then extend to semantics and origin to make phrasal verbs an active tool.", example: "Example", exampleText: "Input take → list take off (to leave the ground / remove, A2), take on (to accept work, B1), take up (to start a hobby, B1); input give → list give up (to quit, A2), give in (to yield, B1).",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Related Tools", affiliateTitle: "Next tools for phrasal-verb lookup", premiumTitle: "PRO Phrasal Verb Pack", premiumText: "Unlock unlimited lookups, filter results by CEFR level, sort alphabetically, auto-log lookup history, and export phrasal-verb lists for review.",
    feat1: "Unlimited lookups", feat2: "Level filter", feat3: "Lookup history", feat4: "Export phrasal list",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for English learning only; phrasal verbs come from a hand-curated common set, and CEFR levels are wordlist matches, not an official language assessment.", relatedTools: "Related Tools", relatedToolsText: "Collocation Finder · Synonym Finder · Word Root Analyzer · CEFR Level Estimator", references: "References", referencesText: "Hand-curated common phrasal-verb set (eighteen high-frequency base verbs, at least ten each, 204 entries); CEFR-J Wordlist v1.5 (Tono Lab, TUFS); Octanove C1/C2 Vocabulary Profile (CC BY-SA 4.0); Chinese glosses, English meanings, and examples hand-written by the editorial team. For study reference only.",
    q1: "How are the phrasal verbs found?", a1: "The tool has a built-in hand-curated common phrasal-verb set (covering eighteen high-frequency base verbs like get/go/come/put/take, at least ten each, 204 entries). Enter a verb and the tool filters all phrasal verbs it forms. It is a pure front-end lookup with no external API call.",
    q2: "How is the CEFR level decided?", a2: "It is matched against the CEFR-J and Octanove authoritative wordlists; A1 is most common and C2 rarest. It is study reference, not an official assessment.",
    q3: "Why do some verbs find no phrasal verbs?", a3: "This set focuses on the eighteen high-frequency base verbs get/go/come/put/take/make/give/look/turn/bring/set/run/break/keep/hold/fall/cut/call; other verbs and very rare or regional phrasals may not be included.",
    q4: "Where do the Chinese gloss and examples come from?", a4: "Chinese glosses are hand-written in Traditional Chinese by the editorial team (no tag); English meanings and examples are compiled by the editorial team from common dictionaries. No machine translation is used.",
    q5: "What is the difference between a phrasal verb and a collocation?", a5: "A phrasal verb is a fixed verb-plus-particle combination whose meaning often differs from the literal words (e.g. give up = to quit); a collocation is words that are semantically close and often appear together. For semantically close words, use Collocation Finder instead.",
    q6: "Is it good for exam prep?", a6: "Yes. TOEIC, IELTS, and school exams often test phrasal verbs; enter a verb to review all its combinations, glosses, and examples, and plan your study by CEFR level.",
  },
} as const;

const faqKeys = [["q1", "a1"], ["q2", "a2"], ["q3", "a3"], ["q4", "a4"], ["q5", "a5"], ["q6", "a6"]] as const;

export default function PhrasalVerbFinder() {
  const { lang, setLang } = useLanguage();
  const t = ui[lang];
  const [input, setInput] = useState("get");
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
    const matches = PHRASALS.filter((e) => e.base === word);
    const mapped: ResultCard[] = matches.map((e) => ({
      verb: e.verb,
      cefr: (e.cefr as Cefr) || null,
      zh: e.zh,
      en: e.en,
      example: e.example,
    }));
    setCards(mapped);
    setSolved(true);
    setLoading(false);
  }, []);

  const toggleExpand = useCallback((verb: string) => {
    setExpanded((prev) => (prev === verb ? null : verb));
  }, []);

  function fillStandard() { setInput("get"); runQuery("get"); }
  function fillCut() { setInput("take"); runQuery("take"); }
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
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{countDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{queryWord || "—"}</div><div className="mt-1 text-xs text-slate-300">phrasal verb</div></div></div>
            <div className="mt-6 space-y-3">
              {loading && <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm font-black text-slate-600">{t.loading}</div>}
              {!loading && solved === undefined && <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm font-black text-slate-500">{t.emptyHint}</div>}
              {!loading && solved === true && cards.length === 0 && <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">{t.noResult}</div>}
              {!loading && cards.map((card) => (
                <div key={card.verb} className="rounded-2xl border border-slate-200/60 bg-white/80 p-4 backdrop-blur">
                  <div className="flex flex-wrap items-center gap-3"><span className="text-xl font-black text-slate-900">{card.verb}</span>{card.cefr && <span className={`rounded-full px-2 py-1 text-xs font-black ${cefrColor[card.cefr]}`}>{card.cefr}</span>}<span className="text-xs font-black text-slate-500">{queryWord}</span></div>
                  <p className="mt-2 text-sm leading-6 text-slate-700"><span className="font-black text-slate-400">{t.meaningLabel}：</span>{card.zh}</p>
                  <button type="button" onClick={() => toggleExpand(card.verb)} className="mt-2 text-xs font-black text-emerald-700">{expanded === card.verb ? t.collapseHint : `▸ ${t.expandHint}`}</button>
                  {expanded === card.verb && (
                    <div className="mt-2 rounded-xl bg-slate-50 p-3">
                      <p className="text-sm text-slate-600">{card.en}</p>
                      <p className="mt-1 text-sm italic text-slate-500">{card.example}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.levelMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.levelMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{cefrBands.map((item) => { const n = cards.filter((c) => c.cefr === item.key).length; return <div key={item.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className={`rounded-full px-2 py-1 text-xs font-black ${cefrColor[item.key]}`}>{n}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>; })}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="phrasal-verb-result-intelligence" adFormat="horizontal" className="my-2" />
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
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="phrasal-verb-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 可能包含站內或聯盟推薦；若透過部分連結購買，我們可能獲得佣金。" : "* May include on-site or affiliate recommendations. We may earn a commission from qualifying purchases."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-TrustRelatedReferences */}<p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
