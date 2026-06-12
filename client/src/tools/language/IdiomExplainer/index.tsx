// @profile B
// Profile B · Language-Hub 自建 JSON · IdiomExplainer（GOLD-STANDARD MacroCalculator compatible）
// 慣用語解析器：輸入英文慣用語或關鍵字，比對內建 idioms.json（101 筆真實常見慣用語）→ 取 [字面義, 真實義, 英文真實義, 例句, 使用情境, CEFR]。
//   純前端、不依賴 Datamuse 主清單；每筆附 CEFR 等級、字面義、繁體中文真實義、英文真實義、例句與使用情境，全照 gold 範本 17 層結構。

import { useMemo, useState, useCallback } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";
import idiomsData from "./idioms.json";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type Cefr = "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | null;
const l = (v: LocalText, lang: Lang) => v[lang];

// ============================================================
// 內建慣用語資料（自行整理 · 真實常見慣用語 · 101 筆）
//   形態：{ idiom, zhLiteral(字面義), zhMeaning(真實義繁中), meaningEn(英文真實義), example(例句), context(使用情境繁中), cefr }
// ============================================================
type IdiomEntry = { idiom: string; zhLiteral: string; zhMeaning: string; meaningEn: string; example: string; context: string; cefr: string };
const IDIOMS = idiomsData as IdiomEntry[];

const cefrColor: Record<string, string> = {
  A1: "bg-emerald-100 text-emerald-800", A2: "bg-emerald-100 text-emerald-800",
  B1: "bg-sky-100 text-sky-800", B2: "bg-sky-100 text-sky-800",
  C1: "bg-violet-100 text-violet-800", C2: "bg-violet-100 text-violet-800",
};
const HOT_WORDS = ["cat", "ice", "cake", "fire", "rain", "heart"] as const;

type ResultCard = {
  idiom: string; cefr: Cefr; zhLiteral: string; zhMeaning: string; meaningEn: string; example: string; context: string;
};

const cefrBands = [
  { key: "A1", label: { zh: "A1 入門", en: "A1 Beginner" }, desc: { zh: "最常用的日常慣用語，初學者最先學的表達。", en: "Most common everyday idioms; the first ones beginners learn." } },
  { key: "A2", label: { zh: "A2 基礎", en: "A2 Elementary" }, desc: { zh: "常見口語慣用語，足以應付一般對話。", en: "Common spoken idioms for everyday conversation." } },
  { key: "B1", label: { zh: "B1 中級", en: "B1 Intermediate" }, desc: { zh: "中階慣用語，寫作與閱讀常出現。", en: "Mid-level idioms common in writing and reading." } },
  { key: "B2", label: { zh: "B2 中高", en: "B2 Upper-Inter" }, desc: { zh: "進階慣用語，語意較抽象、需多體會。", en: "Advanced idioms with more abstract meanings." } },
  { key: "C1", label: { zh: "C1 高級", en: "C1 Advanced" }, desc: { zh: "精準、較少見的高階慣用語。", en: "Precise, less-common high-level idioms." } },
  { key: "C2", label: { zh: "C2 精通", en: "C2 Proficiency" }, desc: { zh: "罕見而典雅的慣用語，母語者風格用法。", en: "Rare and elegant idioms with native-like usage." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "片語動詞查找器", en: "Phrasal Verb Finder" }, href: "/tools/language/phrasal-verb-finder" },
  { label: { zh: "同義詞查找器", en: "Synonym Finder" }, href: "/tools/language/synonym-finder" },
  { label: { zh: "片語搭配查找器", en: "Collocation Finder" }, href: "/tools/language/collocation-finder" },
  { label: { zh: "CEFR 等級估算", en: "CEFR Level Estimator" }, href: "/tools/language/cefr-level-estimator" },
];

const ui = {
  zh: {
    badge: "語言 · 慣用語 · Language Hub", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "慣用語解析器 · Idiom Explainer", subtitle: "輸入英文慣用語或關鍵字，立刻看到它的字面義、真實意思、例句與使用情境，並標註 CEFR 等級",
    intro: "Idiom Explainer 內建 101 筆真實常見英文慣用語。輸入完整慣用語或其中一個關鍵字（例如 cat、fire、ice），工具會比對內建慣用語庫，列出符合的慣用語，每筆都拆解成「字面義」與「真實意思」兩層，再附上英文真實義、一個例句與使用情境說明，並標註 CEFR 難度等級。慣用語最難的地方是字面意思常和真實意思完全不同，本工具把兩者並列，幫您在閱讀、寫作、口說與考試時真正理解慣用語。本工具為純前端查找，不依賴外部 API 取結果，速度快、離線可用。",
    trustNoteLabel: "資料來源：", trustNote: "慣用語以自行整理的常見英文慣用語庫產生（101 筆）；CEFR 等級以 CEFR-J 與 Octanove 權威詞表對照；字面義、真實意思、例句與使用情境皆由編輯團隊以繁體中文人工撰寫。僅供學習參考。",
    quickActionCard: "快速解析卡", tryExample: "一鍵查含 cat 的慣用語", examplePreview: "找到的慣用語數", examplePerson: "查詢關鍵字", fillExample: "查含 cat 的慣用語", previewActivePath: "查含 fire 的慣用語",
    examplesCalculator: "範例 → 解析", enterValues: "輸入慣用語或關鍵字", examplesHelper: "先用熱門範例了解字面義、真實意思與使用情境如何呈現，再換成您想查的慣用語或關鍵字。",
    queryBtn: "解析慣用語", clearBtn: "清除", hotWords: "熱門關鍵字", inputPlaceholder: "輸入慣用語或關鍵字，例如 cat",
    loading: "解析中…", emptyHint: "輸入上方慣用語或關鍵字並按「解析慣用語」，符合的慣用語會列在這裡。", noResult: "找不到包含這個關鍵字的慣用語，本庫收錄 101 筆常見慣用語，換一個關鍵字試試（例如 cat、fire、ice、rain）。",
    fallbackTitle: "資料載入中", fallbackBody: "正在載入內建慣用語庫，請稍候再試一次。",
    resultCard: "慣用語結果", unit: "個慣用語", primaryValue: "查詢關鍵字", ipaLabel: "音標", meaningLabel: "真實義", literalLabel: "字面義", contextLabel: "使用情境", glossTagCn: "簡", glossTagEn: "EN", enGlossHint: "展開看英文真實義與例句", expandHint: "展開看英文真實義與例句", collapseHint: "收合", exampleLabel: "例句", enLoading: "載入中…", noExample: "查無例句，建議造句練習。",
    resultIntelligence: "結果解讀", levelMatrix: "六級 CEFR 慣用語解讀矩陣", levelMatrixNote: "L7 將慣用語依 CEFR 等級分層，以 CEFR-J 權威詞表對照，A1 最常用、C2 最罕見；學習時優先挑您該程度的慣用語。",
    scenarioLayer: "使用場景", scenarioTitle: "什麼時候用慣用語解析", scenarioNote: "L8 列出四個典型場景，把慣用語用在對的地方，而不是死背。",
    scenarioExam: "考試準備", scenarioExamNote: "雅思、托福、學測閱讀與寫作常見慣用語，輸入關鍵字快速理解它的真實意思與例句。", scenarioWriting: "寫作潤飾", scenarioWritingNote: "寫英文文章時，適度使用慣用語讓表達更道地、更有層次。", scenarioDaily: "日常口說", scenarioDailyNote: "母語者口說大量使用慣用語，先弄懂字面與真實意思的落差才聽得懂。", scenarioBusiness: "影劇閱讀", scenarioBusinessNote: "看英文影劇、小說時遇到慣用語，輸入關鍵字立刻查真實意思與使用情境。",
    progressInsight: "學習洞察卡", possibleTarget: "本次解析", dailyGap: "最常用等級", weeklyTrend: "已分級比例", motivation: "動力卡", keepMomentum: "從查單一慣用語走向理解字面與真實意思的落差",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天解析的慣用語帶回家", journeyHint: "挑 2–3 個您不熟的慣用語，記下字面義與真實意思並造句，慣用語成對記最有效。",
    nextActionLabel: "下一步行動", nextActionTitle: "把慣用語接到下一個工具", nextActionItem1: "用片語動詞查找器理解慣用語中常見動詞構成的片語", nextActionItem2: "用 CEFR 等級估算確認慣用語難度是否符合您的程度", nextActionItem3: "用片語搭配查找器找出和慣用語關鍵字語意相近的詞，擴充表達",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "解析路徑", decisionTitle: "輸入 → 解析 → 理解 → 應用", step1: "輸入關鍵字", step2: "解析慣用語", step3: "看真實義", step4: "用在句子",
    knowledge: "知識", knowledgeTitle: "慣用語在英語學習中的意義", definition: "定義", definitionText: "慣用語（idiom）是約定俗成、整體意思和字面意思不同的固定說法，例如 break the ice 字面是「打破冰塊」，真實意思卻是「打破僵局、化解尷尬」。", usage: "用法", usageText: "輸入完整慣用語或其中一個關鍵字，工具會比對本庫，列出符合的慣用語，並把每筆拆成字面義與真實意思兩層，再附英文真實義、例句與使用情境。", limitations: "限制", limitationsText: "本工具的慣用語庫為自行整理的常見慣用語（101 筆）；極罕見、地區性或時事性慣用語未必收錄；CEFR 等級以 CEFR-J/Octanove 詞表為主。", interpretation: "解讀", interpretationText: "A1/A2 慣用語最常用、最先學；B1/B2 適合寫作與進階閱讀；C1/C2 較罕見，多為道地或文學用法，掌握後表達更生動。", context: "脈絡", contextText: "慣用語解析應與片語動詞、搭配詞、CEFR 估算一起用：先理解字面與真實意思的落差，再看使用情境與例句，把慣用語學成可活用的表達。", example: "範例", exampleText: "輸入 cat → 列出 let the cat out of the bag（字面「把貓放出袋」，真實「無意洩密」）；輸入 ice → 列出 break the ice（字面「打破冰塊」，真實「打破僵局」）。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "相關工具", affiliateTitle: "慣用語解析的下一步工具", premiumTitle: "PRO 慣用語包", premiumText: "解鎖無限解析、依 CEFR 等級篩選結果、依主題分類、自動記錄查詢歷史，並把慣用語卡片匯出複習。",
    feat1: "無限解析次數", feat2: "難度等級篩選", feat3: "查詢歷史記錄", feat4: "慣用語卡匯出",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供英語學習用途；慣用語以自行整理的常見慣用語庫產生，CEFR 等級為詞表對照，不等同官方語言檢定結果。", relatedTools: "相關工具", relatedToolsText: "Phrasal Verb Finder · Synonym Finder · Collocation Finder · CEFR Level Estimator", references: "參考資料", referencesText: "自行整理之常見英文慣用語庫（101 筆）；CEFR-J Wordlist v1.5（Tono Lab, TUFS）；Octanove C1/C2 Vocabulary Profile（CC BY-SA 4.0）；字面義、真實意思、例句與使用情境由編輯團隊以繁體中文人工撰寫。僅供學習參考。",
    q1: "慣用語是怎麼查出來的？", a1: "工具內建一份自行整理的常見英文慣用語庫（101 筆）。輸入完整慣用語或其中一個關鍵字，工具就比對庫中所有慣用語，列出包含該關鍵字的項目。這是純前端查找，不需連外部 API。",
    q2: "CEFR 等級是怎麼判斷的？", a2: "以 CEFR-J 與 Octanove 權威詞表對照；A1 最常用、C2 最罕見。這是學習參考，非官方檢定。",
    q3: "為什麼有些關鍵字查不到慣用語？", a3: "本庫收錄 101 筆常見慣用語；若關鍵字不在任何收錄慣用語中，或屬於極罕見、地區性慣用語，就會無結果。建議用 cat、fire、ice、rain 等常見字試試。",
    q4: "字面義和真實意思有什麼不同？", a4: "字面義是把慣用語逐字直譯的意思（常不合邏輯），真實意思才是它約定俗成的含義。例如 spill the beans 字面是「打翻豆子」，真實意思是「洩漏祕密」。本工具把兩者並列，正是慣用語學習的關鍵。",
    q5: "慣用語和片語動詞有什麼不同？", a5: "片語動詞是「動詞＋介副詞」的固定組合（如 give up）；慣用語則是一整句約定俗成、字面與真實意思不同的說法（如 break the ice）。查片語動詞請改用片語動詞查找器。",
    q6: "適合考試準備嗎？", a6: "適合。雅思、托福、學測閱讀與寫作常見慣用語，輸入關鍵字快速理解它的真實意思、例句與使用情境，並依 CEFR 等級安排學習順序。",
  },
  en: {
    badge: "Language · Idiom · Language Hub", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Idiom Explainer", subtitle: "Type an English idiom or keyword and instantly see its literal meaning, real meaning, example, and usage context, with CEFR level",
    intro: "Idiom Explainer has a built-in set of 101 real common English idioms. Type a full idiom or one keyword (e.g. cat, fire, ice) and the tool matches the built-in set, listing matching idioms. Each is broken into two layers — literal meaning and real meaning — with an English real meaning, an example sentence, a usage context note, and a CEFR difficulty level. The hardest part of idioms is that the literal meaning often differs completely from the real one, so this tool places both side by side to help you truly understand idioms for reading, writing, speaking, and exams. This tool is a pure front-end lookup that fetches no external API for results, so it is fast and works offline.",
    trustNoteLabel: "Data source:", trustNote: "Idioms come from a hand-curated common English-idiom set (101 entries); CEFR levels are matched against the CEFR-J and Octanove authoritative wordlists; literal meanings, real meanings, examples, and usage contexts are all hand-written in Traditional Chinese by the editorial team. For study reference only.",
    quickActionCard: "Quick Explain Card", tryExample: "Find idioms with cat", examplePreview: "Idioms found", examplePerson: "Query keyword", fillExample: "Find idioms with cat", previewActivePath: "Find idioms with fire",
    examplesCalculator: "Examples → Explain", enterValues: "Enter idiom or keyword", examplesHelper: "Start with a popular example to see how literal meaning, real meaning, and usage context appear, then swap in the idiom or keyword you want.",
    queryBtn: "Explain idiom", clearBtn: "Clear", hotWords: "Popular keywords", inputPlaceholder: "Type an idiom or keyword, e.g. cat",
    loading: "Explaining…", emptyHint: "Enter an idiom or keyword above and press Explain idiom; matching idioms will appear here.", noResult: "No idioms found with this keyword; this set has 101 common idioms, try another keyword (e.g. cat, fire, ice, rain).",
    fallbackTitle: "Loading data", fallbackBody: "The built-in idiom set is loading, please try again shortly.",
    resultCard: "Idiom Results", unit: "idioms", primaryValue: "Query keyword", ipaLabel: "IPA", meaningLabel: "Real meaning", literalLabel: "Literal", contextLabel: "Context", glossTagCn: "Simp", glossTagEn: "EN", enGlossHint: "See English real meaning & example on expand", expandHint: "Show English real meaning & example", collapseHint: "Collapse", exampleLabel: "Example", enLoading: "Loading…", noExample: "No example found; try writing your own.",
    resultIntelligence: "Result Intelligence", levelMatrix: "Six-level CEFR idiom matrix", levelMatrixNote: "L7 groups idioms by CEFR level using the authoritative CEFR-J wordlist, with A1 most common and C2 rarest; pick the level that fits you when learning.",
    scenarioLayer: "Use scenarios", scenarioTitle: "When to use idiom explanation", scenarioNote: "L8 lists four typical scenarios so you use idioms in the right place, not just memorize them.",
    scenarioExam: "Exam prep", scenarioExamNote: "IELTS, TOEFL, and school reading and writing often feature idioms; enter a keyword to quickly grasp the real meaning and example.", scenarioWriting: "Writing polish", scenarioWritingNote: "When writing in English, use idioms moderately to make expression more idiomatic and layered.", scenarioDaily: "Daily speaking", scenarioDailyNote: "Native speakers use idioms heavily; understand the gap between literal and real meaning to follow them.", scenarioBusiness: "Film & reading", scenarioBusinessNote: "When watching films or reading novels, enter a keyword to instantly check the real meaning and usage context of an idiom.",
    progressInsight: "Learning Insight Card", possibleTarget: "This explanation", dailyGap: "Most common level", weeklyTrend: "Graded ratio", motivation: "Motivation Card", keepMomentum: "Move from single idioms to grasping the gap between literal and real meanings",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's idioms home", journeyHint: "Pick 2–3 idioms you don't know, note the literal and real meaning, and write sentences; learning idioms in pairs works best.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect idioms to the next tool", nextActionItem1: "Use Phrasal Verb Finder to understand the phrasals formed by common verbs in idioms", nextActionItem2: "Use CEFR Level Estimator to confirm the idiom difficulty fits your level", nextActionItem3: "Use Collocation Finder to find words semantically close to the idiom keyword and expand expression",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Explain Path", decisionTitle: "Input → Explain → Understand → Apply", step1: "Type keyword", step2: "Explain idiom", step3: "Read meaning", step4: "Use in sentence",
    knowledge: "Knowledge", knowledgeTitle: "What idioms mean in English learning", definition: "Definition", definitionText: "An idiom is a fixed, conventional expression whose overall meaning differs from the literal words; for example break the ice literally means to break frozen water, but really means to relieve tension and start conversation.", usage: "Usage", usageText: "Type a full idiom or one keyword, and the tool matches the built-in set, listing matching idioms and breaking each into a literal meaning and a real meaning, with an English real meaning, example, and usage context.", limitations: "Limitations", limitationsText: "The idiom set is a hand-curated common set (101 entries); very rare, regional, or topical idioms may not be included; CEFR levels primarily use the CEFR-J/Octanove wordlists.", interpretation: "Interpretation", interpretationText: "A1/A2 idioms are most common and learned first; B1/B2 suit writing and advanced reading; C1/C2 are rarer, often idiomatic or literary, and make expression more vivid once mastered.", context: "Context", contextText: "Idiom explanation should be used with phrasal verbs, collocations, and CEFR estimation: understand the gap between literal and real meaning first, then read the usage context and example to make idioms an active expression.", example: "Example", exampleText: "Input cat → list let the cat out of the bag (literal: release a cat from a bag; real: reveal a secret); input ice → list break the ice (literal: break frozen water; real: relieve tension).",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Related Tools", affiliateTitle: "Next tools for idiom explanation", premiumTitle: "PRO Idiom Pack", premiumText: "Unlock unlimited explanations, filter results by CEFR level, group by theme, auto-log lookup history, and export idiom cards for review.",
    feat1: "Unlimited explanations", feat2: "Level filter", feat3: "Lookup history", feat4: "Export idiom cards",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for English learning only; idioms come from a hand-curated common set, and CEFR levels are wordlist matches, not an official language assessment.", relatedTools: "Related Tools", relatedToolsText: "Phrasal Verb Finder · Synonym Finder · Collocation Finder · CEFR Level Estimator", references: "References", referencesText: "Hand-curated common English-idiom set (101 entries); CEFR-J Wordlist v1.5 (Tono Lab, TUFS); Octanove C1/C2 Vocabulary Profile (CC BY-SA 4.0); literal meanings, real meanings, examples, and usage contexts hand-written in Traditional Chinese by the editorial team. For study reference only.",
    q1: "How are the idioms found?", a1: "The tool has a built-in hand-curated common English-idiom set (101 entries). Enter a full idiom or one keyword and the tool matches all idioms in the set, listing those containing that keyword. It is a pure front-end lookup with no external API call.",
    q2: "How is the CEFR level decided?", a2: "It is matched against the CEFR-J and Octanove authoritative wordlists; A1 is most common and C2 rarest. It is study reference, not an official assessment.",
    q3: "Why do some keywords find no idioms?", a3: "This set has 101 common idioms; if the keyword is in none of them, or belongs to a very rare or regional idiom, there will be no result. Try common words like cat, fire, ice, rain.",
    q4: "What is the difference between literal and real meaning?", a4: "The literal meaning is the word-for-word translation of the idiom (often illogical); the real meaning is its conventional sense. For example spill the beans literally means to knock over beans, but really means to reveal a secret. This tool places both side by side, which is the key to learning idioms.",
    q5: "What is the difference between an idiom and a phrasal verb?", a5: "A phrasal verb is a fixed verb-plus-particle combination (e.g. give up); an idiom is a whole conventional expression whose literal and real meanings differ (e.g. break the ice). For phrasal verbs, use Phrasal Verb Finder instead.",
    q6: "Is it good for exam prep?", a6: "Yes. IELTS, TOEFL, and school reading and writing often feature idioms; enter a keyword to quickly grasp the real meaning, example, and usage context, and plan your study by CEFR level.",
  },
} as const;

const faqKeys = [["q1", "a1"], ["q2", "a2"], ["q3", "a3"], ["q4", "a4"], ["q5", "a5"], ["q6", "a6"]] as const;

export default function IdiomExplainer() {
  const { lang, setLang } = useLanguage();
  const t = ui[lang];
  const [input, setInput] = useState("cat");
  const [queryWord, setQueryWord] = useState("");
  const [cards, setCards] = useState<ResultCard[]>([]);
  const [solved, setSolved] = useState<boolean | undefined>(undefined); // undefined=未查 · true=已查
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const runQuery = useCallback((rawWord: string) => {
    const word = rawWord.trim().toLowerCase();
    if (!word) return;
    setLoading(true);
    setQueryWord(word);
    setExpanded(null);
    const matches = IDIOMS.filter((e) => e.idiom.toLowerCase().includes(word));
    const mapped: ResultCard[] = matches.map((e) => ({
      idiom: e.idiom,
      cefr: (e.cefr as Cefr) || null,
      zhLiteral: e.zhLiteral,
      zhMeaning: e.zhMeaning,
      meaningEn: e.meaningEn,
      example: e.example,
      context: e.context,
    }));
    setCards(mapped);
    setSolved(true);
    setLoading(false);
  }, []);

  const toggleExpand = useCallback((idiom: string) => {
    setExpanded((prev) => (prev === idiom ? null : idiom));
  }, []);

  function fillStandard() { setInput("cat"); runQuery("cat"); }
  function fillCut() { setInput("fire"); runQuery("fire"); }
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
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{countDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{queryWord || "—"}</div><div className="mt-1 text-xs text-slate-300">idiom</div></div></div>
            <div className="mt-6 space-y-3">
              {loading && <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm font-black text-slate-600">{t.loading}</div>}
              {!loading && solved === undefined && <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm font-black text-slate-500">{t.emptyHint}</div>}
              {!loading && solved === true && cards.length === 0 && <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">{t.noResult}</div>}
              {!loading && cards.map((card) => (
                <div key={card.idiom} className="rounded-2xl border border-slate-200/60 bg-white/80 p-4 backdrop-blur">
                  <div className="flex flex-wrap items-center gap-3"><span className="text-xl font-black text-slate-900">{card.idiom}</span>{card.cefr && <span className={`rounded-full px-2 py-1 text-xs font-black ${cefrColor[card.cefr]}`}>{card.cefr}</span>}<span className="text-xs font-black text-slate-500">{queryWord}</span></div>
                  <p className="mt-2 text-sm leading-6 text-slate-500"><span className="font-black text-slate-400">{t.literalLabel}：</span>{card.zhLiteral}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-700"><span className="font-black text-slate-400">{t.meaningLabel}：</span>{card.zhMeaning}</p>
                  <button type="button" onClick={() => toggleExpand(card.idiom)} className="mt-2 text-xs font-black text-emerald-700">{expanded === card.idiom ? t.collapseHint : `▸ ${t.expandHint}`}</button>
                  {expanded === card.idiom && (
                    <div className="mt-2 rounded-xl bg-slate-50 p-3">
                      <p className="text-sm text-slate-600">{card.meaningEn}</p>
                      <p className="mt-1 text-sm italic text-slate-500">{card.example}</p>
                      <p className="mt-1 text-xs text-slate-500"><span className="font-black text-slate-400">{t.contextLabel}：</span>{card.context}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.levelMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.levelMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{cefrBands.map((item) => { const n = cards.filter((c) => c.cefr === item.key).length; return <div key={item.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className={`rounded-full px-2 py-1 text-xs font-black ${cefrColor[item.key]}`}>{n}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>; })}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="idiom-result-intelligence" adFormat="horizontal" className="my-2" />
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
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="idiom-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 可能包含站內或聯盟推薦；若透過部分連結購買，我們可能獲得佣金。" : "* May include on-site or affiliate recommendations. We may earn a commission from qualifying purchases."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-Trust */}<p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
