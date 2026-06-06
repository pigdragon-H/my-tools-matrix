// @profile B
// Profile B · Language-Hub A-class (Datamuse rel_syn) · SynonymFinder（GOLD-STANDARD MacroCalculator compatible）

import { useMemo, useState, useCallback } from "react";
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
// Language Hub Datamuse 標準模板 v1.0（MANUAL §2a 完整照抄）
// ============================================================
interface DatamuseWord {
  word: string;
  score?: number;
  tags?: string[];
  numSyllables?: number;
}
const CACHE_PREFIX = "fu_lng_cache_";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 小時

async function queryDatamuse(endpoint: string, maxResults = 20): Promise<DatamuseWord[] | null> {
  const cacheKey = CACHE_PREFIX + btoa(endpoint).slice(0, 50);
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) return data as DatamuseWord[];
    }
  } catch { /* 快取讀取失敗，繼續查 API */ }
  try {
    const res = await fetch(
      `https://api.datamuse.com/words?${endpoint}&md=psrf&max=${maxResults}`,
      { signal: AbortSignal.timeout(5000) },
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: DatamuseWord[] = await res.json();
    try {
      localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
    } catch { /* 快取寫入失敗，不影響結果 */ }
    return data;
  } catch {
    return null; // null = 觸發降級 UI
  }
}

// ============================================================
// CEFR 啟發式：以 Datamuse 頻率值 (f: 每百萬字出現次數) 推估等級
// ============================================================
function freqToCefr(f: number): Cefr {
  if (!Number.isFinite(f) || f <= 0) return null;
  if (f >= 50) return "A1";
  if (f >= 10) return "A2";
  if (f >= 3) return "B1";
  if (f >= 1) return "B2";
  if (f >= 0.3) return "C1";
  return "C2";
}
const posMap: Record<string, LocalText> = {
  n: { zh: "名詞", en: "noun" },
  v: { zh: "動詞", en: "verb" },
  adj: { zh: "形容詞", en: "adjective" },
  adv: { zh: "副詞", en: "adverb" },
  u: { zh: "其他", en: "other" },
};
function parseTags(tags: string[] | undefined): { pos: string; freq: number } {
  let pos = "u";
  let freq = 0;
  (tags || []).forEach((tg) => {
    if (tg === "n" || tg === "v" || tg === "adj" || tg === "adv") { if (pos === "u") pos = tg; }
    else if (tg.startsWith("f:")) freq = Number(tg.slice(2));
  });
  return { pos, freq };
}

type ResultCard = {
  word: string;
  cefr: Cefr;
  posKey: string;
  syllables: number;
  freq: number;
};

const cefrColor: Record<string, string> = {
  A1: "bg-emerald-100 text-emerald-800", A2: "bg-emerald-100 text-emerald-800",
  B1: "bg-sky-100 text-sky-800", B2: "bg-sky-100 text-sky-800",
  C1: "bg-violet-100 text-violet-800", C2: "bg-violet-100 text-violet-800",
};

const HOT_WORDS = ["happy", "important", "beautiful", "difficult", "increase", "help"] as const;

const cefrBands = [
  { key: "A1", label: { zh: "A1 入門", en: "A1 Beginner" }, desc: { zh: "最常用的基礎同義詞，日常口語首選。", en: "Most frequent basics; best for daily speech." } },
  { key: "A2", label: { zh: "A2 基礎", en: "A2 Elementary" }, desc: { zh: "常見替換詞，足以應付一般對話。", en: "Common swaps for everyday conversation." } },
  { key: "B1", label: { zh: "B1 中級", en: "B1 Intermediate" }, desc: { zh: "讓寫作更有層次的中階同義詞。", en: "Mid-level synonyms that add range to writing." } },
  { key: "B2", label: { zh: "B2 中高", en: "B2 Upper-Inter" }, desc: { zh: "考試與正式書寫常見的進階詞。", en: "Advanced words common in exams and formal writing." } },
  { key: "C1", label: { zh: "C1 高級", en: "C1 Advanced" }, desc: { zh: "精準、學術感強的高階同義詞。", en: "Precise, academic-leaning high-level synonyms." } },
  { key: "C2", label: { zh: "C2 精通", en: "C2 Proficiency" }, desc: { zh: "罕見而典雅，母語者也未必常用。", en: "Rare and elegant; even natives use them sparingly." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "反義詞查找器", en: "Antonym Finder" }, href: "/tools/language/antonym-finder" },
  { label: { zh: "押韻詞查找器", en: "Rhyme Finder" }, href: "/tools/language/rhyme-finder" },
  { label: { zh: "字根分析器", en: "Word Root Analyzer" }, href: "/tools/language/word-root-analyzer" },
  { label: { zh: "CEFR 等級估算", en: "CEFR Level Estimator" }, href: "/tools/language/cefr-level-estimator" },
];

const ui = {
  zh: {
    badge: "語言 · 詞彙擴充 · Language Hub", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "同義詞查找器 · Synonym Finder", subtitle: "輸入一個英文字，立刻找出帶 CEFR 等級與詞性的同義詞",
    intro: "Synonym Finder 串接 Datamuse 開放語料 API（rel_syn），輸入任何英文單字即可取得真實同義詞清單，每個結果都標註 CEFR 難度等級、詞性與音節數，幫你在口說、寫作、考試中挑出最貼切的替換詞。",
    trustNoteLabel: "資料來源：", trustNote: "同義詞來自 Datamuse（彙整 WordNet 等開放語料）；CEFR 等級依詞頻啟發式推估，僅供學習參考，非官方檢定結果。",
    quickActionCard: "快速查詢卡", tryExample: "一鍵查 happy 的同義詞", examplePreview: "找到的同義詞數", examplePerson: "查詢字", fillExample: "查 happy 的同義詞", previewActivePath: "查 important 的同義詞",
    examplesCalculator: "範例 → 查詢", enterValues: "輸入英文單字", examplesHelper: "先用熱門範例了解 CEFR 等級與詞性如何呈現，再換成你自己想查的單字。",
    queryBtn: "查詢同義詞", clearBtn: "清除", hotWords: "熱門查詢", inputPlaceholder: "輸入英文單字，例如 happy",
    loading: "查詢中…", emptyHint: "輸入上方單字並按「查詢同義詞」，結果會列在這裡。", noResult: "查無同義詞，換個更常見的單字試試。",
    fallbackTitle: "查詢暫時無法使用", fallbackBody: "網路連線問題，請稍後再試。常用結果已儲存在本機快取中。",
    resultCard: "同義詞結果", unit: "個同義詞", primaryValue: "查詢字", syllableLabel: "音節", freqLabel: "詞頻",
    resultIntelligence: "結果解讀", levelMatrix: "六級 CEFR 同義詞解讀矩陣", levelMatrixNote: "L7 將同義詞依 CEFR 等級分層，A1 最常用、C2 最罕見；挑替換詞時對照你的目標讀者程度。",
    scenarioLayer: "使用場景", scenarioTitle: "什麼時候該換同義詞", scenarioNote: "L8 列出四個典型場景，把同義詞用在對的地方，而不是為換而換。",
    scenarioExam: "考試寫作", scenarioExamNote: "避免重複用字，挑 B2/C1 同義詞展現詞彙廣度。", scenarioWriting: "正式書寫", scenarioWritingNote: "報告與郵件選語氣貼切、CEFR 適中的詞。", scenarioDaily: "日常口語", scenarioDailyNote: "選 A1/A2 同義詞，自然好懂不做作。", scenarioBusiness: "商務溝通", scenarioBusinessNote: "選精準專業的詞，避免太口語或太冷僻。",
    progressInsight: "學習洞察卡", possibleTarget: "本次查詢", dailyGap: "最常用等級", weeklyTrend: "平均音節", motivation: "動力卡", keepMomentum: "從查同義詞走向主動擴充詞彙",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天學到的同義詞帶回家", journeyHint: "挑 2–3 個你會真正用到的同義詞造句，比死背 20 個更有效。",
    nextActionLabel: "下一步行動", nextActionTitle: "把同義詞接到下一個工具", nextActionItem1: "用反義詞查找器補齊對立詞，理解語義光譜", nextActionItem2: "用 CEFR 等級估算確認難度是否符合你的程度", nextActionItem3: "用字根分析器理解詞義從何而來，記得更牢",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "學習路徑", decisionTitle: "輸入 → 查詢 → 理解 → 應用", step1: "輸入單字", step2: "查同義詞", step3: "看 CEFR", step4: "造句應用",
    knowledge: "知識", knowledgeTitle: "同義詞在英語學習中的意義", definition: "定義", definitionText: "同義詞（synonym）是意義相近、可在特定語境互相替換的字；但很少完全等義，語氣與搭配常有差異。", usage: "用法", usageText: "查到同義詞後，先看詞性與 CEFR 等級，再確認語氣是否合適。例如 happy 的同義詞 content 偏「滿足」、joyful 偏「歡欣」，並不能無腦互換。", limitations: "限制", limitationsText: "Datamuse 的同義詞依語料統計，可能含罕見或古語；CEFR 等級為詞頻啟發式推估，與官方 Cambridge 分級可能有出入。", interpretation: "解讀", interpretationText: "A1/A2 同義詞適合口語與初學；B1/B2 適合考試與寫作；C1/C2 雖然亮眼，用錯場合反而生硬。", context: "脈絡", contextText: "同義詞查詢應與反義詞、字根、CEFR 估算一起用，建立完整的語義網絡而非孤立記單字。", example: "範例", exampleText: "查 important → 得到 significant(B1)、crucial(B2)、vital(B2)、paramount(C1)；寫學術報告時 crucial 比 important 更精準有力。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "相關工具", affiliateTitle: "詞彙擴充的下一步工具", premiumTitle: "PRO 詞彙擴充包", premiumText: "解鎖無限查詢、依 CEFR 等級篩選結果、自動記錄學習歷史，並把單字表匯出複習。",
    feat1: "無限查詢次數", feat2: "難度等級篩選", feat3: "學習歷史記錄", feat4: "單字表匯出",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供英語學習與詞彙擴充用途；CEFR 等級為啟發式推估，不等同官方語言檢定結果。", relatedTools: "相關工具", relatedToolsText: "Antonym Finder · Rhyme Finder · Word Root Analyzer · CEFR Level Estimator", references: "參考資料", referencesText: "Datamuse API（rel_syn，彙整 WordNet 等開放語料）；Cambridge English CEFR 詞彙分級概念；CMU Pronouncing Dictionary 音節資料。",
    q1: "這些同義詞可以直接互換嗎？", a1: "不一定。同義詞意義相近但語氣與搭配常不同，建議先看 CEFR 等級與詞性，再確認語境是否合適。",
    q2: "CEFR 等級是怎麼判斷的？", a2: "本工具依 Datamuse 提供的詞頻啟發式推估：越常用等級越低（A1），越罕見等級越高（C2）。這是學習參考，非官方檢定。",
    q3: "為什麼有些字查不到同義詞？", a3: "罕見字、專有名詞或拼錯的字可能沒有同義詞資料。換成更常見的基本字通常就有結果。",
    q4: "查詢需要連網嗎？", a4: "需要連網查 Datamuse；不過查過的結果會在本機快取 24 小時，離線時仍可看到常用查詢。",
    q5: "結果為什麼有時不一樣？", a5: "Datamuse 依語料統計動態排序，且我們已過濾極罕見結果，因此排序可能隨時間略有變化。",
    q6: "適合準備雅思托福嗎？", a6: "適合。挑 B2/C1 同義詞替換常見字能展現詞彙廣度，但務必確認語境與搭配正確，避免生硬堆砌。",
  },
  en: {
    badge: "Language · Vocabulary · Language Hub", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Synonym Finder", subtitle: "Type one English word and get synonyms tagged with CEFR level and part of speech",
    intro: "Synonym Finder calls the open Datamuse corpus API (rel_syn). Enter any English word to get a real synonym list, where each result is tagged with a CEFR difficulty level, part of speech, and syllable count, helping you pick the most fitting replacement for speaking, writing, and exams.",
    trustNoteLabel: "Data source:", trustNote: "Synonyms come from Datamuse (built on WordNet and other open corpora); CEFR levels are estimated heuristically by word frequency, for study reference only, not an official assessment.",
    quickActionCard: "Quick Query Card", tryExample: "Find synonyms for happy", examplePreview: "Synonyms found", examplePerson: "Query word", fillExample: "Find synonyms for happy", previewActivePath: "Find synonyms for important",
    examplesCalculator: "Examples → Query", enterValues: "Enter an English word", examplesHelper: "Start with a popular example to see how CEFR level and part of speech appear, then swap in the word you want to look up.",
    queryBtn: "Find synonyms", clearBtn: "Clear", hotWords: "Popular queries", inputPlaceholder: "Type an English word, e.g. happy",
    loading: "Searching…", emptyHint: "Enter a word above and press Find synonyms; results will appear here.", noResult: "No synonyms found, try a more common word.",
    fallbackTitle: "Query temporarily unavailable", fallbackBody: "Network issue, please try again later. Common results are cached locally.",
    resultCard: "Synonym Results", unit: "synonyms", primaryValue: "Query word", syllableLabel: "Syllables", freqLabel: "Frequency",
    resultIntelligence: "Result Intelligence", levelMatrix: "Six-level CEFR synonym matrix", levelMatrixNote: "L7 groups synonyms by CEFR level, with A1 most common and C2 rarest; match the level to your target reader when choosing a replacement.",
    scenarioLayer: "Use scenarios", scenarioTitle: "When to swap in a synonym", scenarioNote: "L8 lists four typical scenarios so you use synonyms in the right place, not just for the sake of changing words.",
    scenarioExam: "Exam writing", scenarioExamNote: "Avoid repetition; pick B2/C1 synonyms to show vocabulary range.", scenarioWriting: "Formal writing", scenarioWritingNote: "Pick words with the right tone and a moderate CEFR level for reports and emails.", scenarioDaily: "Daily speech", scenarioDailyNote: "Choose A1/A2 synonyms that sound natural and easy.", scenarioBusiness: "Business communication", scenarioBusinessNote: "Pick precise professional words, avoiding the too casual or too obscure.",
    progressInsight: "Learning Insight Card", possibleTarget: "This query", dailyGap: "Most common level", weeklyTrend: "Avg syllables", motivation: "Motivation Card", keepMomentum: "Move from looking up synonyms to actively expanding vocabulary",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's synonyms home", journeyHint: "Make sentences with 2–3 synonyms you will actually use; it beats memorizing 20 at once.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect synonyms to the next tool", nextActionItem1: "Use Antonym Finder to add opposites and understand the semantic spectrum", nextActionItem2: "Use CEFR Level Estimator to confirm the difficulty fits your level", nextActionItem3: "Use Word Root Analyzer to see where the meaning comes from and remember it better",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Learning Path", decisionTitle: "Input → Query → Understand → Apply", step1: "Type a word", step2: "Find synonyms", step3: "Read CEFR", step4: "Use in a sentence",
    knowledge: "Knowledge", knowledgeTitle: "What synonyms mean in English learning", definition: "Definition", definitionText: "A synonym is a word with a similar meaning that can replace another in a given context; but they are rarely exactly equivalent, often differing in tone and collocation.", usage: "Usage", usageText: "After finding a synonym, check its part of speech and CEFR level first, then confirm the tone fits. For example, happy's synonyms content leans toward 'satisfied' and joyful toward 'cheerful'; they cannot be swapped blindly.", limitations: "Limitations", limitationsText: "Datamuse synonyms are corpus-statistical and may include rare or archaic words; CEFR levels are a frequency heuristic and may differ from official Cambridge grading.", interpretation: "Interpretation", interpretationText: "A1/A2 synonyms suit speech and beginners; B1/B2 suit exams and writing; C1/C2 look impressive but feel stiff if used in the wrong place.", context: "Context", contextText: "Synonym lookup should be used with antonyms, word roots, and CEFR estimation to build a full semantic network rather than memorizing words in isolation.", example: "Example", exampleText: "Search important → get significant(B1), crucial(B2), vital(B2), paramount(C1); in an academic report, crucial is more precise and forceful than important.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Related Tools", affiliateTitle: "Next tools for vocabulary expansion", premiumTitle: "PRO Vocabulary Pack", premiumText: "Unlock unlimited queries, filter results by CEFR level, auto-log study history, and export wordlists for review.",
    feat1: "Unlimited queries", feat2: "Level filter", feat3: "Study history", feat4: "Export wordlist",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for English learning and vocabulary expansion only; CEFR levels are a heuristic estimate and do not equal an official language assessment.", relatedTools: "Related Tools", relatedToolsText: "Antonym Finder · Rhyme Finder · Word Root Analyzer · CEFR Level Estimator", references: "References", referencesText: "Datamuse API (rel_syn, built on WordNet and other open corpora); Cambridge English CEFR vocabulary grading concept; CMU Pronouncing Dictionary syllable data.",
    q1: "Can these synonyms be swapped directly?", a1: "Not always. Synonyms are close in meaning but often differ in tone and collocation; check the CEFR level and part of speech first, then confirm the context fits.",
    q2: "How is the CEFR level decided?", a2: "This tool estimates it heuristically from the word frequency Datamuse provides: more common means a lower level (A1), rarer means a higher level (C2). It is study reference, not an official assessment.",
    q3: "Why do some words return no synonyms?", a3: "Rare words, proper nouns, or misspellings may have no synonym data. Switching to a more common base word usually returns results.",
    q4: "Does the query need internet?", a4: "It needs the internet to query Datamuse; however, queried results are cached locally for 24 hours, so common queries still show offline.",
    q5: "Why are results sometimes different?", a5: "Datamuse ranks dynamically by corpus statistics, and we filter out the rarest results, so the order may shift slightly over time.",
    q6: "Is it good for IELTS or TOEFL prep?", a6: "Yes. Swapping common words for B2/C1 synonyms shows vocabulary range, but always confirm the context and collocation are correct to avoid stiff word-stuffing.",
  },
} as const;

const faqKeys = [["q1", "a1"], ["q2", "a2"], ["q3", "a3"], ["q4", "a4"], ["q5", "a5"], ["q6", "a6"]] as const;

export default function SynonymFinder() {
  const { lang, setLang } = useLanguage();
  const t = ui[lang];
  const [input, setInput] = useState("happy");
  const [queryWord, setQueryWord] = useState("");
  const [cards, setCards] = useState<ResultCard[]>([]);
  const [apiResult, setApiResult] = useState<DatamuseWord[] | null | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const runQuery = useCallback(async (rawWord: string) => {
    const word = rawWord.trim().toLowerCase();
    if (!word) return;
    setLoading(true);
    setQueryWord(word);
    const data = await queryDatamuse(`rel_syn=${encodeURIComponent(word)}`, 20);
    setApiResult(data ?? null);
    if (data) {
      const mapped: ResultCard[] = data
        .filter((d) => d.word && !d.word.includes(" "))
        .map((d) => {
          const { pos, freq } = parseTags(d.tags);
          return { word: d.word, cefr: freqToCefr(freq), posKey: pos, syllables: d.numSyllables ?? 0, freq };
        })
        .filter((c) => c.freq >= 0.02) // 過濾極罕見/無頻雜訊
        .slice(0, 18);
      setCards(mapped);
    } else {
      setCards([]);
    }
    setLoading(false);
  }, []);

  function fillStandard() { setInput("happy"); runQuery("happy"); }
  function fillCut() { setInput("important"); runQuery("important"); }
  function clearAll() { setInput(""); setQueryWord(""); setCards([]); setApiResult(undefined); }

  const stats = useMemo(() => {
    if (cards.length === 0) return null;
    const levelCount: Record<string, number> = {};
    let syllSum = 0;
    cards.forEach((c) => { if (c.cefr) levelCount[c.cefr] = (levelCount[c.cefr] || 0) + 1; syllSum += c.syllables; });
    const topLevel = Object.entries(levelCount).sort((a, b) => b[1] - a[1])[0];
    return { count: cards.length, topLevel: topLevel ? topLevel[0] : "—", avgSyll: (syllSum / cards.length).toFixed(1) };
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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{countDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{queryWord || "—"}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.dailyGap}</div><div className="font-black">{stats ? stats.topLevel : "—"}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="font-black">{stats ? stats.avgSyll : "—"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
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
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{countDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{queryWord || "—"}</div><div className="mt-1 text-xs text-slate-300">rel_syn</div></div></div>
            <div className="mt-6 space-y-3">
              {loading && <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm font-black text-slate-600">{t.loading}</div>}
              {!loading && apiResult === undefined && <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm font-black text-slate-500">{t.emptyHint}</div>}
              {!loading && apiResult === null && (
                <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 text-center"><p className="text-lg font-black text-amber-800">{t.fallbackTitle}</p><p className="mt-2 text-sm text-amber-600">{t.fallbackBody}</p></div>
              )}
              {!loading && apiResult !== null && apiResult !== undefined && cards.length === 0 && <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">{t.noResult}</div>}
              {!loading && cards.map((card) => (
                <div key={card.word} className="rounded-2xl border border-slate-200/60 bg-white/80 p-4 backdrop-blur"><div className="flex items-center gap-3"><span className="text-xl font-black text-slate-900">{card.word}</span>{card.cefr && <span className={`rounded-full px-2 py-1 text-xs font-black ${cefrColor[card.cefr]}`}>{card.cefr}</span>}<span className="text-xs font-black text-slate-500">{l(posMap[card.posKey] || posMap.u, lang)}</span></div><div className="mt-2 flex gap-4 text-xs font-black text-slate-500"><span>{t.syllableLabel}: <b className="font-black text-slate-700">{card.syllables || "—"}</b></span><span>{t.freqLabel}: <b className="font-black text-slate-700">{card.freq.toFixed(2)}</b></span></div></div>
              ))}
            </div>
          </div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.levelMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.levelMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{cefrBands.map((item) => { const n = cards.filter((c) => c.cefr === item.key).length; return <div key={item.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className={`rounded-full px-2 py-1 text-xs font-black ${cefrColor[item.key]}`}>{n}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>; })}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="synonym-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">{/* L8-ScenarioComparison */}
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.scenarioLayer}</p><h2 className="mt-2 text-3xl font-black">{t.scenarioTitle}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.scenarioNote}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{scenarios.map((s) => <article key={s.k} className={`rounded-3xl border p-5 shadow-sm ${s.accent}`}><h3 className="text-lg font-black text-slate-900">{s.title}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{s.note}</p></article>)}</div>
        </section>
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.unit}</div><div className="mt-1 text-3xl font-black">{countDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{stats ? stats.topLevel : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{stats ? stats.avgSyll : "—"}</div></div></div></article>
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
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="synonym-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 相關 Language Hub 工具，免費使用。" : "* Related Language Hub tools, free to use."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-Trust */}<p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
