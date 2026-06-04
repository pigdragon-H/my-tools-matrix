#!/usr/bin/env node
// scripts/finance-spec-builder.mjs
// Path B Spec Generator — accepts 10-field minimal brief, emits full spec JSON
// Usage:
//   node scripts/finance-spec-builder.mjs scripts/finance-gen/briefs/F21-investment-return.json
//   node scripts/finance-spec-builder.mjs --batch scripts/finance-gen/briefs/F21..F35.json
//
// Brief format (10 fields):
// {
//   id, nameZh, nameEn,
//   inputs: ["label1zh","label2zh","label3zh","label4zh"],
//   inputsEn: ["label1en",...],          // optional, auto-translated if missing
//   compute: "中文 compute 描述",
//   computeFn: "<JS function body returning {primaryKey,...}>",  // required
//   primaryKey, secondaryKey, tertiaryKey, quaternaryKey,
//   primaryUnit: "%" | "$" | "倍" | "年" | "月" | ...,
//   secondaryUnit, tertiaryUnit, quaternaryUnit,
//   bands: ["低","中低","中","中高","高","極高"]   // 6 band SHORT labels
//   bandThresholds: [n1,n2,n3,n4,n5],   // 5 thresholds for primary value
//   faqTitles: [q1,q2,q3,q4,q5,q6],      // 6 zh questions
//   faqAnswers: [a1,...a6],               // optional zh answers (auto if missing)
//   affiliates: [{label,href},{label,href},{label,href},{label,href}],
//   color: "amber"|"sky"|"emerald"|"rose"|"violet"|"teal"|"lime"|"cyan"|"fuchsia"|"indigo"|"orange"|"yellow"|"green"|"blue"|"pink"
// }

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

// ---------------- color palette (light, varied) ----------------
const PALETTES = {
  amber:   { hueA: "#fef3c7", hueB: "#f8fafc", hueC: "#e0f2fe" },
  sky:     { hueA: "#e0f2fe", hueB: "#f8fafc", hueC: "#dbeafe" },
  emerald: { hueA: "#d1fae5", hueB: "#f8fafc", hueC: "#e0f2fe" },
  rose:    { hueA: "#ffe4e6", hueB: "#fff7ed", hueC: "#fce7f3" },
  violet:  { hueA: "#ede9fe", hueB: "#f8fafc", hueC: "#e0e7ff" },
  teal:    { hueA: "#ccfbf1", hueB: "#f8fafc", hueC: "#cffafe" },
  lime:    { hueA: "#ecfccb", hueB: "#f8fafc", hueC: "#d9f99d" },
  cyan:    { hueA: "#cffafe", hueB: "#f8fafc", hueC: "#dbeafe" },
  fuchsia: { hueA: "#fae8ff", hueB: "#f8fafc", hueC: "#fce7f3" },
  indigo:  { hueA: "#e0e7ff", hueB: "#f8fafc", hueC: "#dbeafe" },
  orange:  { hueA: "#ffedd5", hueB: "#fff7ed", hueC: "#fef3c7" },
  yellow:  { hueA: "#fef9c3", hueB: "#f8fafc", hueC: "#fef3c7" },
  green:   { hueA: "#dcfce7", hueB: "#f8fafc", hueC: "#d1fae5" },
  blue:    { hueA: "#dbeafe", hueB: "#f8fafc", hueC: "#e0f2fe" },
  pink:    { hueA: "#fce7f3", hueB: "#fff7ed", hueC: "#ffe4e6" },
  stone:   { hueA: "#f5f5f4", hueB: "#fafaf9", hueC: "#e7e5e4" },
};

// ---------------- helpers ----------------
const camel = s => s.replace(/[-_](.)/g, (_,c) => c.toUpperCase());
const pascal = s => { const c = camel(s); return c[0].toUpperCase() + c.slice(1); };
const kebab  = s => s.replace(/[A-Z]/g, m => "-"+m.toLowerCase()).replace(/^-/,"");

// Tiny zh→en translit fallback for input labels (kept simple; users can supply inputsEn)
const ZH_EN_HINT = {
  "年收入": "Annual Income", "月收入": "Monthly Income", "本金": "Principal",
  "利率": "Interest Rate", "年利率": "Annual Rate", "月利率": "Monthly Rate",
  "年限": "Years", "月數": "Months", "期數": "Periods", "次數": "Count",
  "扣除額": "Deductions", "申報身份": "Filing Status", "州別": "State",
  "投資金額": "Investment", "起始金額": "Initial Amount", "目標金額": "Target Amount",
  "報酬率": "Return Rate", "通膨率": "Inflation", "稅率": "Tax Rate",
  "費用": "Cost", "成本": "Cost", "收入": "Revenue", "售價": "Price",
  "數量": "Quantity", "單位": "Unit", "幣別": "Currency", "匯率": "Exchange Rate",
  "股價": "Share Price", "股數": "Shares", "股息": "Dividend",
  "租金": "Rent", "房價": "Property Price", "頭期款": "Down Payment",
  "保費": "Premium", "保額": "Coverage", "年齡": "Age",
  "退休年齡": "Retirement Age", "預期壽命": "Life Expectancy",
  "債券面值": "Face Value", "票面利率": "Coupon Rate", "到期日": "Maturity",
  "履約價": "Strike Price", "權利金": "Premium",
  "現金流": "Cash Flow", "折現率": "Discount Rate",
  "負債": "Debt", "資產": "Assets", "信用卡": "Credit Card",
  "抵免額": "Credits",
};
const tr = (zh) => ZH_EN_HINT[zh] || zh;

// ---------------- band auto-builder ----------------
function buildBands(brief) {
  const labels = brief.bands;       // 6 zh short
  const thr    = brief.bandThresholds; // 5 thresholds
  if (!labels || labels.length !== 6) throw new Error("brief.bands must have 6 entries");
  if (!thr || thr.length !== 5) throw new Error("brief.bandThresholds must have 5 entries");
  const keys = ["tiny","normal","notable","high","major","executive"];
  const ranges = [
    `< ${thr[0]}`, `${thr[0]}–${thr[1]}`, `${thr[1]}–${thr[2]}`,
    `${thr[2]}–${thr[3]}`, `${thr[3]}–${thr[4]}`, `≥ ${thr[4]}`,
  ];
  return keys.map((k,i) => ({
    key: k,
    range: ranges[i],
    label_zh: `${labels[i]} (${ranges[i]})`,
    label_en: `Band ${i+1} (${ranges[i]})`,
    desc_zh: `落在「${labels[i]}」級距${ranges[i]}。${brief.bandHints?.[i] || `對應 ${brief.nameZh} 的 ${labels[i]} 區間,屬於常見配置。`}`,
    desc_en: `Falls in the "${labels[i]}" band ${ranges[i]}. ${brief.bandHintsEn?.[i] || `This is the ${labels[i]} range for ${brief.nameEn}.`}`,
  }));
}

function buildBandKeyBody(brief) {
  const t = brief.bandThresholds;
  return `    if (r < ${t[0]}) return 'tiny';
    if (r < ${t[1]}) return 'normal';
    if (r < ${t[2]}) return 'notable';
    if (r < ${t[3]}) return 'high';
    if (r < ${t[4]}) return 'major';
    return 'executive';`;
}

// ---------------- compute auto-builder ----------------
// brief.computeFn is the JS body (string). primaryKey/secondaryKey/tertiaryKey/quaternaryKey reference
// fields in the returned object.
function buildCompute(brief) {
  if (!brief.computeFn) throw new Error("brief.computeFn (JS body) is required");
  return brief.computeFn;
}

// ---------------- inputs ----------------
function buildInputs(brief) {
  // brief.inputs is 4 zh labels; we synthesize JS-safe names + defaults
  const labels = brief.inputs;
  if (!labels || labels.length !== 4) throw new Error("brief.inputs must have 4 entries");
  const namesEn = brief.inputsEn || labels.map(tr);
  // try to make camelCase var names from EN
  const inputNames = namesEn.map(en => {
    // strip anything non-alphanumeric (parens, %, slashes, dots), lowercase, split, camelCase
    const c = en.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().split(/\s+/).filter(Boolean);
    if (!c.length) return "input";
    return c[0] + c.slice(1).map(w => w[0]?.toUpperCase()+w.slice(1)).join("");
  });
  // ensure JS-safe identifier (must start with [a-z_$])
  inputNames.forEach((n,i) => {
    if (!/^[a-z_$][a-zA-Z0-9_$]*$/.test(n)) inputNames[i] = "input" + i;
  });
  // ensure unique
  const seen = {};
  inputNames.forEach((n,i)=>{ if(seen[n]){ inputNames[i] = n+(++seen[n]); } seen[n]=1; });
  const defaults = brief.defaults || ["100","10","5","1"];
  const steps    = brief.steps    || ["1","0.1","1","1"];
  const accentIdx = brief.accentIdx ?? 2;
  return {
    inputNames,                    // JS var names ["annualIncome","filingStatus","deductions","credits"]
    inputZh: labels,
    inputEn: namesEn,
    inputs: inputNames.map((n,i) => ({
      name: n,
      default: defaults[i] ?? "0",
      step: steps[i] ?? "1",
      ...(i === accentIdx ? { accent: true } : {}),
    })),
  };
}

// ---------------- FAQs ----------------
function buildFaqs(brief) {
  const q = brief.faqTitles;
  if (!q || q.length !== 6) throw new Error("brief.faqTitles must have 6 entries");
  const a = brief.faqAnswers || q.map((qq,i) =>
    `針對「${qq}」這個問題,${brief.nameZh} 的處理原則是依公開公式試算,所有計算在瀏覽器端完成,個資不外傳。${i % 2 ? "若你的場景特別複雜(例如跨境、特殊稅務、衍生工具),建議再諮詢合格專業人士。" : "結果會落在六個級距的其中一格,旁邊的提示會告訴你下一步可以怎麼做。"}`);
  const qEn = brief.faqTitlesEn || q.map(qq => `About: ${qq}`);
  const aEn = brief.faqAnswersEn || a.map((aa,i) => `For "${q[i]}": ${brief.nameEn} runs the standard formula client-side; no data leaves the browser.${i % 2 ? " For unusual scenarios, consult a qualified professional." : " Use the band guidance shown next to the result for your next step."}`);
  return { q, a, qEn, aEn };
}

// ---------------- affiliate items ----------------
function buildAffiliates(brief) {
  const aff = brief.affiliates;
  if (!aff || aff.length !== 4) throw new Error("brief.affiliates must have 4 entries");
  return aff.map(item => ({
    label_zh: item.label_zh || item.label || item.name,
    label_en: item.label_en || item.labelEn || item.label || item.name,
    href: item.href,
  }));
}

// ---------------- examples ----------------
function buildExamples(brief, inputBundle) {
  const names = inputBundle.inputNames;
  const solid = brief.exampleSolid || inputBundle.inputs.map(i => i.default);
  const high  = brief.exampleHigh  || inputBundle.inputs.map(i => String(Number(i.default) * 2 || 200));
  return {
    solid: { unit: "metric",   values: Object.fromEntries(names.map((n,i)=>[n, String(solid[i])])) },
    high:  { unit: "imperial", values: Object.fromEntries(names.map((n,i)=>[n, String(high[i])])) },
  };
}

// ---------------- UI strings (full 116-key bilingual) ----------------
function buildUI(brief, inputBundle) {
  const { nameZh, nameEn, primaryUnit="", secondaryUnit="", tertiaryUnit="%", quaternaryUnit="" } = brief;
  const inZh = inputBundle.inputZh;
  const inEn = inputBundle.inputEn;
  const inNames = inputBundle.inputNames;

  // Build per-input ui label keys (UI keys keyed by JS var name)
  const inputLabelsZh = Object.fromEntries(inNames.map((n,i) => [n, inZh[i]]));
  const inputLabelsEn = Object.fromEntries(inNames.map((n,i) => [n, inEn[i]]));

  const zh = {
    badge: `財務 · ${nameZh} · 黃金工具`,
    switchToEnglish: "English mode", switchToChinese: "切換到中文",
    chineseShort: "中", englishShort: "EN",
    title: `${nameEn} · ${nameZh}`,
    subtitle: `${brief.subtitleZh || `輸入${inZh.slice(0,2).join("、")}等參數，立即估算${brief.primaryLabelZh || "結果"}與相關指標`}`,
    intro: `${brief.introZh || `本工具為 ${nameZh}，依公開公式於瀏覽器端試算，輸入${inZh.join("、")}後立即得出主要結果與三個輔助指標。所有計算均不上傳，僅在你的裝置完成。`}`,
    trustNoteLabel: "注意事項：",
    trustNote: `${brief.trustZh || `本工具僅供一般情境試算，未涵蓋極端條件、稅務優惠、地區差異或特殊規範。涉及重大決策請以合格專業人士為準。`}`,
    quickActionCard: "快速範例卡",
    tryExample: `試算${nameZh}`,
    examplePreview: brief.primaryLabelZh || "主要結果",
    examplePerson: "標準範例",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入進階範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: `輸入${inZh.join("、")}`,
    examplesHelper: "先用範例了解結果輸出，再改成自己的數字。",
    metric: "標準",
    imperial: "進階",
    exampleCards: "範例卡",
    baselineExample: "標準範例",
    baselineExampleValue: brief.solidLabelZh || `${inZh[0]} ${inputBundle.inputs[0].default}`,
    baselineExampleNote: `${inZh[0]} ${inputBundle.inputs[0].default} · ${inZh[1]} ${inputBundle.inputs[1].default}`,
    activeExample: "進階範例",
    activeExampleValue: brief.highLabelZh || `${inZh[0]} ×2`,
    activeExampleNote: `${inZh[0]} 加倍 · 觀察 ${brief.primaryLabelZh || "主要結果"} 變化`,
    flowDemo: "數字流向示範",
    calculator: `${nameZh}`,
    ...inputLabelsZh,
    resultCard: "結果卡片",
    primaryValue: brief.primaryLabelZh || "主要結果",
    primaryUnitTail: primaryUnit,
    secondaryLabel: brief.secondaryLabelZh || "輔助指標",
    secondaryTail: secondaryUnit,
    metricALabel: brief.primaryLabelZh || "主要結果",
    metricACaption: brief.primaryHintZh || "依公開公式試算的主要數值",
    metricATail: primaryUnit,
    metricBLabel: brief.secondaryLabelZh || "輔助指標",
    metricBCaption: brief.secondaryHintZh || "與主要結果連動的次要量值",
    metricBTail: secondaryUnit,
    metricCLabel: brief.tertiaryLabelZh || "比例指標",
    metricCCaption: brief.tertiaryHintZh || "百分比形式的觀察點",
    metricCTail: tertiaryUnit,
    headlineCaption: `${nameZh} · 即時試算`,
    fatLossTarget: brief.quaternaryLabelZh || "綜合指標",
    resultIntelligence: "結果解讀",
    tdeeMatrix: `${nameZh} · 級距矩陣`,
    tdeeMatrixNote: "依主要結果落在六格級距，定位你目前的位置。",
    emotionConversionLayer: "下一步轉化",
    turnIntoPlan: "把結果變成行動",
    conversionNote: "把試算數字變成可執行的下一步。",
    progressInsight: "進度洞察",
    possibleTarget: "可能達成的目標",
    weeklyTrend: "週級趨勢",
    dailyGap: "日級缺口",
    tertiaryTag: brief.tertiaryLabelZh || "比例指標",
    motivation: "保持動力", keepMomentum: "持續優化", saveShareJourney: "儲存與分享",
    journeyTitle: "你的試算旅程",
    journeyHint: "把這次的數字記下來，下次直接比較。",
    nextActionLabel: "下一步建議",
    nextActionTitle: "我接下來該做什麼？",
    nextActionItem1: brief.next1Zh || `把 ${inZh[0]} 與 ${inZh[2] || inZh[1]} 各調 ±10% 觀察主要結果敏感度`,
    nextActionItem2: brief.next2Zh || `對照六格級距,找出自己應落在哪一格,再決定行動方案`,
    nextActionItem3: brief.next3Zh || `把結果連結存下來,下次重算時直接比較差異`,
    shareLinkBtn: "複製分享連結", shareNativeBtn: "原生分享", shareCopiedToast: "已複製！",
    decisionPath: "決策路徑",
    decisionTitle: `${nameZh} · 決策四步`,
    bmrStep: "Step 1 · 蒐集參數", bmrNote: `先把 ${inZh.join("、")} 四個欄位填齊。`,
    deficitStep: "Step 2 · 套公式", deficitNote: `${brief.compute || nameZh + "的核心公式"}。`,
    trendStep: "Step 3 · 看級距", trendNote: "對照六格級距,定位主要結果。",
    mealStep: "Step 4 · 行動", mealNote: "依級距提示挑一個下一步,執行 30 天後回來重算。",
    knowledge: "知識庫", knowledgeTitle: `${nameZh} · 觀念整理`,
    definition: "定義",
    definitionText: `${brief.definitionZh || `${nameZh} 是一種把 ${inZh.join("、")} 等參數轉換為${brief.primaryLabelZh || "主要結果"}的試算工具,常見於個人理財、投資決策、財務規劃等場景。`}`,
    formula: "公式",
    formulaText: `${brief.formulaZh || brief.compute || `主要結果 = f(${inZh.join(", ")})`}`,
    limitations: "限制",
    limitationsText: `${brief.limitationsZh || `本工具未納入稅率變動、市場波動、特殊條款、地區差異等因素;結果為一般情境估算,實務應以正式報表或專業意見為準。`}`,
    interpretation: "解讀",
    interpretationText: `${brief.interpretationZh || `主要結果落在六格級距的哪一格,比絕對數字更重要;同一結果在不同級距代表不同行動策略。`}`,
    context: "情境",
    contextText: `${brief.contextZh || `常見使用情境包括日常財務檢視、年度規劃、重大決策前的快速估算。建議搭配${brief.affiliates?.[0]?.label_zh || ""} 等延伸工具一起使用。`}`,
    example: "範例",
    exampleText: `${brief.exampleZh || `以「標準範例」試算後,先觀察主要結果落在哪一格,再切到「進階範例」對照變動方向。`}`,
    faq: "常見問題", commonQuestions: "六題快問快答",
    affiliate: "延伸工具", affiliateTitle: "相關計算機與資源",
    premiumTitle: "解鎖進階版",
    premiumText: `Premium 解鎖${nameZh}的批次試算、結果歷史、PDF 匯出、多場景比較與廣告移除。`,
    premiumChips_zh: "批次試算 · 歷史紀錄 · PDF 匯出 · 廣告移除",
    premiumChips_en: "Batch · History · PDF Export · Ad-free",
    trustReferences: "信任與參考",
    trust: "資料來源",
    trustText: `${brief.trustSourcesZh || `公式依據公開財務教科書、官方公告與業界共識;個資 100% 留在你的裝置。`}`,
    relatedTools: "相關工具",
    relatedToolsText: "下方延伸工具可與本工具串接使用。",
    references: "參考文獻",
    referencesText: `${brief.referencesZh || `Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · 個別國家稅務官網。`}`,
  };

  const faqs = buildFaqs(brief);
  zh.q1 = faqs.q[0]; zh.a1 = faqs.a[0];
  zh.q2 = faqs.q[1]; zh.a2 = faqs.a[1];
  zh.q3 = faqs.q[2]; zh.a3 = faqs.a[2];
  zh.q4 = faqs.q[3]; zh.a4 = faqs.a[3];
  zh.q5 = faqs.q[4]; zh.a5 = faqs.a[4];
  zh.q6 = faqs.q[5]; zh.a6 = faqs.a[5];

  // EN mirrors zh keys
  const en = {
    badge: `Finance · ${nameEn} · Gold Tool`,
    switchToEnglish: "English mode", switchToChinese: "切換到中文",
    chineseShort: "中", englishShort: "EN",
    title: `${nameEn} · ${nameZh}`,
    subtitle: brief.subtitleEn || `Enter ${inEn.slice(0,2).join(", ").toLowerCase()} and instantly estimate ${brief.primaryLabelEn || "the result"}.`,
    intro: brief.introEn || `${nameEn} runs the standard formula in your browser. Enter ${inEn.join(", ").toLowerCase()} to see the primary result and three supporting metrics. Nothing is uploaded.`,
    trustNoteLabel: "Notes:",
    trustNote: brief.trustEn || `This tool is for general estimation. It does not cover edge cases, tax breaks, regional differences, or special rules. For major decisions, consult a qualified professional.`,
    quickActionCard: "Quick example card",
    tryExample: `Try ${nameEn}`,
    examplePreview: brief.primaryLabelEn || "Primary result",
    examplePerson: "Standard example",
    fillExample: "Fill standard example",
    previewActivePath: "Fill advanced example",
    examplesCalculator: "Examples → Calculator",
    enterValues: `Enter ${inEn.join(", ").toLowerCase()}`,
    examplesHelper: "Use the example to see the output shape, then plug in your own numbers.",
    metric: "Standard", imperial: "Advanced",
    exampleCards: "Example cards",
    baselineExample: "Standard example",
    baselineExampleValue: brief.solidLabelEn || `${inEn[0]} ${inputBundle.inputs[0].default}`,
    baselineExampleNote: `${inEn[0]} ${inputBundle.inputs[0].default} · ${inEn[1]} ${inputBundle.inputs[1].default}`,
    activeExample: "Advanced example",
    activeExampleValue: brief.highLabelEn || `${inEn[0]} ×2`,
    activeExampleNote: `${inEn[0]} doubled · watch ${brief.primaryLabelEn || "the primary result"} react`,
    flowDemo: "Data flow demo",
    calculator: nameEn,
    ...inputLabelsEn,
    resultCard: "Result card",
    primaryValue: brief.primaryLabelEn || "Primary result",
    primaryUnitTail: primaryUnit,
    secondaryLabel: brief.secondaryLabelEn || "Supporting metric",
    secondaryTail: secondaryUnit,
    metricALabel: brief.primaryLabelEn || "Primary",
    metricACaption: brief.primaryHintEn || "Main figure from the standard formula",
    metricATail: primaryUnit,
    metricBLabel: brief.secondaryLabelEn || "Supporting",
    metricBCaption: brief.secondaryHintEn || "Secondary metric tied to the primary",
    metricBTail: secondaryUnit,
    metricCLabel: brief.tertiaryLabelEn || "Ratio",
    metricCCaption: brief.tertiaryHintEn || "Percentage view",
    metricCTail: tertiaryUnit,
    headlineCaption: `${nameEn} · live calc`,
    fatLossTarget: brief.quaternaryLabelEn || "Composite",
    resultIntelligence: "Result intelligence",
    tdeeMatrix: `${nameEn} · band matrix`,
    tdeeMatrixNote: "Six bands locate where your primary result sits.",
    emotionConversionLayer: "Next-step conversion",
    turnIntoPlan: "Turn the number into action",
    conversionNote: "Translate the figure into a concrete next step.",
    progressInsight: "Progress insight",
    possibleTarget: "Possible target",
    weeklyTrend: "Weekly trend",
    dailyGap: "Daily gap",
    tertiaryTag: brief.tertiaryLabelEn || "Ratio",
    motivation: "Motivation", keepMomentum: "Keep optimizing", saveShareJourney: "Save & share",
    journeyTitle: "Your calc journey",
    journeyHint: "Save this number to compare next time.",
    nextActionLabel: "Next-step suggestions",
    nextActionTitle: "What should I do next?",
    nextActionItem1: brief.next1En || `Move ${inEn[0]} and ${inEn[2] || inEn[1]} by ±10% to see sensitivity.`,
    nextActionItem2: brief.next2En || `Locate yourself on the six-band matrix and pick an action.`,
    nextActionItem3: brief.next3En || `Save the link and re-run after 30 days to compare.`,
    shareLinkBtn: "Copy link", shareNativeBtn: "Native share", shareCopiedToast: "Copied!",
    decisionPath: "Decision path",
    decisionTitle: `${nameEn} · 4-step decision`,
    bmrStep: "Step 1 · Gather inputs", bmrNote: `Fill ${inEn.join(", ").toLowerCase()}.`,
    deficitStep: "Step 2 · Apply formula", deficitNote: `${brief.computeEn || brief.compute || nameEn + " standard formula"}.`,
    trendStep: "Step 3 · Read bands", trendNote: "Locate your primary result on the six-band matrix.",
    mealStep: "Step 4 · Act", mealNote: "Pick a band-aligned action, run it 30 days, then re-calculate.",
    knowledge: "Knowledge", knowledgeTitle: `${nameEn} · concept primer`,
    definition: "Definition",
    definitionText: brief.definitionEn || `${nameEn} converts inputs (${inEn.join(", ").toLowerCase()}) into ${brief.primaryLabelEn || "a primary metric"}. It is widely used in personal finance and investment planning.`,
    formula: "Formula",
    formulaText: brief.formulaEn || brief.formulaZh || brief.compute || `result = f(${inEn.join(", ").toLowerCase()})`,
    limitations: "Limitations",
    limitationsText: brief.limitationsEn || `Does not include tax variations, market shocks, special clauses, or regional differences. Results are general estimates only.`,
    interpretation: "Interpretation",
    interpretationText: brief.interpretationEn || `Which band the primary result falls into matters more than the absolute number — different bands imply different actions.`,
    context: "Context",
    contextText: brief.contextEn || `Common contexts include daily finance review, annual planning, and pre-decision quick estimates. Pair with ${brief.affiliates?.[0]?.label_en || "related tools"} for a fuller picture.`,
    example: "Example",
    exampleText: brief.exampleEn || `Run the "Standard example" first, see which band the result lands in, then switch to the "Advanced example" to see how it shifts.`,
    faq: "FAQ", commonQuestions: "Six quick Q&A",
    affiliate: "Related tools", affiliateTitle: "Related calculators & resources",
    premiumTitle: "Unlock Premium",
    premiumText: `Premium unlocks batch calculation, history, PDF export, multi-scenario comparison, and ad-free for ${nameEn}.`,
    premiumChips_zh: "批次試算 · 歷史紀錄 · PDF 匯出 · 廣告移除",
    premiumChips_en: "Batch · History · PDF Export · Ad-free",
    trustReferences: "Trust & references",
    trust: "Sources",
    trustText: brief.trustSourcesEn || `Formula based on public finance textbooks, official publications, and industry consensus; data stays 100% on your device.`,
    relatedTools: "Related tools",
    relatedToolsText: "The related tools below pair well with this calculator.",
    references: "References",
    referencesText: brief.referencesEn || `Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · official tax authorities.`,
  };
  en.q1 = faqs.qEn[0]; en.a1 = faqs.aEn[0];
  en.q2 = faqs.qEn[1]; en.a2 = faqs.aEn[1];
  en.q3 = faqs.qEn[2]; en.a3 = faqs.aEn[2];
  en.q4 = faqs.qEn[3]; en.a4 = faqs.aEn[3];
  en.q5 = faqs.qEn[4]; en.a5 = faqs.aEn[4];
  en.q6 = faqs.qEn[5]; en.a6 = faqs.aEn[5];

  return { zh, en };
}

// ---------------- main spec assembler ----------------
export function buildSpec(brief) {
  const componentName = pascal(brief.id);
  const palette = PALETTES[brief.color] || PALETTES.amber;
  const inputBundle = buildInputs(brief);
  const bands = buildBands(brief);
  const compute = buildCompute(brief);
  const ui = buildUI(brief, inputBundle);
  const aff = buildAffiliates(brief);
  const examples = buildExamples(brief, inputBundle);

  // sanity: primary/secondary/tertiary/quaternary keys
  const pk = brief.primaryKey, sk = brief.secondaryKey, tk = brief.tertiaryKey, qk = brief.quaternaryKey;
  if (!pk || !sk || !tk || !qk) throw new Error("brief.{primary,secondary,tertiary,quaternary}Key all required");

  return {
    componentName,
    id: brief.id,
    colorToken: { primary: brief.color || "amber", ...palette },
    inputs: inputBundle.inputs,
    compute,
    primaryKey: pk, primaryDecimals: brief.primaryDecimals ?? 2,
    primaryPrefix: brief.primaryPrefix || "", primarySuffix: brief.primaryUnit || "",
    secondaryKey: sk, secondaryDecimals: brief.secondaryDecimals ?? 0,
    tertiaryKey: tk,  tertiaryDecimals: brief.tertiaryDecimals ?? 2,
    quaternaryKey: qk, quaternaryDecimals: brief.quaternaryDecimals ?? 0,
    bandKeyBody: buildBandKeyBody(brief),
    bands,
    affiliateItems: aff,
    examples,
    ui,
  };
}

// ---------------- driver: brief → spec → tool → registry → toolsConfig fix ----------------
function camelify(id) { return id.replace(/-([a-z])/g, (_,c) => c.toUpperCase()); }

function fixToolsConfigShape(brief) {
  const fp = path.join(repoRoot, "shared/toolsConfig.ts");
  let src = fs.readFileSync(fp, "utf8");
  // Find scaffold-injected entry and replace with canonical shape
  const idLit = JSON.stringify(brief.id);
  const re = new RegExp(
    `\\{\\s*id:\\s*${idLit.replace(/[-/\\^$*+?.()|[\\]{}]/g, "\\$&")},[\\s\\S]*?isPaid:\\s*false,\\s*isNew:\\s*true,\\s*\\}`
  );
  if (!re.test(src)) {
    // already canonical or different shape; skip
    return false;
  }
  const canonical = `{
    id: ${idLit},
    name: ${JSON.stringify(brief.nameZh)},
    category: "finance",
    path: "/tools/finance/${brief.id}",
    icon: "Calculator",
    description: ${JSON.stringify((brief.subtitleZh || (brief.nameZh + "：依公開公式於瀏覽器端試算，輸入後立即得出主要結果與輔助指標。")))},
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    isFeatured: true,
    status: "GOLD",
    seoArticles: [],
  }`;
  src = src.replace(re, canonical);
  fs.writeFileSync(fp, src);
  return true;
}

function ensureToolFolder(brief) {
  const dir = path.join(repoRoot, "client/src/tools/finance", pascal(brief.id));
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function runScaffoldIfNeeded(brief) {
  // scaffold-tool will refuse if folder exists, but it still patches toolsConfig.ts + ToolPage.tsx (we want those).
  // Strategy: ensure folder pre-exists (so scaffold won't write index.tsx),
  // then call scaffold to register routes/exports.
  ensureToolFolder(brief);
  try {
    execSync(
      `node scripts/scaffold-tool.mjs finance ${brief.id} ${JSON.stringify(brief.nameEn)} ${JSON.stringify(brief.nameZh)} Calculator`,
      { cwd: repoRoot, stdio: "pipe" }
    );
  } catch (e) {
    // It may exit nonzero because folder exists; that's fine.
  }
}

function generateToolFromSpec(specPath) {
  execSync(`node scripts/finance-gen/build-tool.mjs ${specPath}`, { cwd: repoRoot, stdio: "inherit" });
}

export function processBrief(brief, { writeSpec = true } = {}) {
  const spec = buildSpec(brief);
  // sanity: warn if computeFn references identifiers not in inputs
  const declared = spec.inputs.map(i => i.name);
  console.log(`[spec-builder] ${brief.id} input names: ${declared.join(", ")}`);
  const refs = (brief.computeFn.match(/Number\(([a-zA-Z_$][\w$]*)\)/g) || []).map(s => s.replace(/Number\(/, "").replace(/\)$/, ""));
  const missing = refs.filter(r => !declared.includes(r));
  if (missing.length) {
    console.error(`[spec-builder] ❌ computeFn references unknown identifiers: ${missing.join(", ")}`);
    console.error(`[spec-builder]    declared inputs: ${declared.join(", ")}`);
    throw new Error("computeFn references unknown identifiers — fix brief.inputsEn or computeFn");
  }
  const specDir = path.join(repoRoot, "scripts/finance-gen/specs");
  if (!fs.existsSync(specDir)) fs.mkdirSync(specDir, { recursive: true });
  const specPath = path.join(specDir, `${brief.id}.json`);
  if (writeSpec) fs.writeFileSync(specPath, JSON.stringify(spec, null, 2));
  // scaffold registry first (won't overwrite our generated index.tsx since folder pre-exists)
  runScaffoldIfNeeded(brief);
  // generate index.tsx (overwrites any scaffold stub; scaffold won't write into existing folder anyway)
  generateToolFromSpec(specPath);
  // fix toolsConfig shape (replace scaffold's broken `isPaid/descriptionZh` block with canonical)
  fixToolsConfigShape(brief);
  // verify sigils
  const filePath = path.join(repoRoot, "client/src/tools/finance", pascal(brief.id), "index.tsx");
  const src = fs.readFileSync(filePath, "utf8");
  const lines = src.split("\n");
  const counts = {
    rounded:   lines.filter(L => /rounded-\[2rem\]/.test(L)).length,
    fontBlack: lines.filter(L => /font-black/.test(L)).length,
    radial:    lines.filter(L => /bg-\[radial-gradient/.test(L)).length,
    oddGrid:   lines.filter(L => /md:grid-cols-\[1fr_auto_1fr\]/.test(L)).length,
    layers:    new Set((src.match(/L[0-9]+-[A-Za-z]+/g) || [])).size,
    l6Iron:    lines.filter(L => /bg-slate-950 p-4 font-mono/.test(L)).length,
  };
  return { spec, specPath, filePath, counts };
}

// ---------------- CLI ----------------
if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = process.argv[2];
  if (!arg) {
    console.error("usage: node scripts/finance-spec-builder.mjs <brief.json>");
    process.exit(1);
  }
  const brief = JSON.parse(fs.readFileSync(arg, "utf8"));
  const result = processBrief(brief);
  console.log("\n=== sigil verify ===");
  console.log(`${brief.id}: rounded=${result.counts.rounded}/11 fontBlack=${result.counts.fontBlack}/18 radial=${result.counts.radial}/1 oddGrid=${result.counts.oddGrid}/0 layers=${result.counts.layers}/19 l6Iron=${result.counts.l6Iron}/0`);
  const ok =
    result.counts.rounded === 11 &&
    result.counts.fontBlack === 18 &&
    result.counts.radial === 1 &&
    result.counts.oddGrid === 0 &&
    result.counts.layers === 19 &&
    result.counts.l6Iron === 0;
  console.log(ok ? "✅ SIGILS OK" : "❌ SIGIL DRIFT");
  process.exit(ok ? 0 : 2);
}
