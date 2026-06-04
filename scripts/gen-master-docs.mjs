#!/usr/bin/env node
// ============================================================
// gen-master-docs.mjs — generate the two DATA-DRIVEN master docs
//   docs/MASTER_TOOL_REGISTRY.md  (300 tools: 100 existing + 200 planned)
//   docs/SEMANTIC_DOMAIN_MAP.md   (domain grouping + purpose/formula axis)
// Source of truth for EXISTING tools = shared/toolsConfig.ts (tools[]).
// Planned tools are declared inline below (Victor's approved 200-slug roadmap,
// translation-cost-calculator -> Language only; Education slot replaced).
// ============================================================
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";

const ROOT = resolve(new URL(import.meta.url).pathname, "../..");
const CFG = join(ROOT, "shared/toolsConfig.ts");

// ---- parse EXISTING tools (chunk regex identical to Gate 1) ----
const cfg = readFileSync(CFG, "utf8");
const blockRe = /\{\s*id:\s*"([a-z0-9-]+)",((?:(?!\n\s*\{)[\s\S])*?)\n\s*\},/g;
const existing = [];
let m;
while ((m = blockRe.exec(cfg)) !== null) {
  const id = m[1];
  const body = m[2];
  const cat = (body.match(/category:\s*"([a-z]+)"/) || [])[1];
  const nameZh = (body.match(/name:\s*"([^"]+)"/) || [])[1] || "";
  const nameEn = (body.match(/nameEn:\s*"([^"]+)"/) || [])[1] || nameZh;
  if (!cat) continue;
  existing.push({ id, category: cat, nameZh, nameEn, status: "LIVE" });
}

// ---- PLANNED roadmap (Victor-approved, 200 unique slugs) ----
// [slug, category, 中文名, English Name, ID-code]
const planned = [
  // ── Finance (+27) ────────────────────────────────────────
  ["withdrawal-rate-calculator","finance","安全提領率計算機","Safe Withdrawal Rate Calculator","FIN-RET-001"],
  ["coast-fire-calculator","finance","Coast FIRE 計算機","Coast FIRE Calculator","FIN-RET-002"],
  ["fire-number-calculator","finance","FIRE 財務自由數字計算機","FIRE Number Calculator","FIN-RET-003"],
  ["social-security-calculator","finance","社會安全金計算機","Social Security Calculator","FIN-RET-004"],
  ["roth-conversion-calculator","finance","Roth 轉換計算機","Roth Conversion Calculator","FIN-RET-005"],
  ["ltv-ratio-calculator","finance","貸款成數計算機","Loan-to-Value Ratio Calculator","FIN-MTG-001"],
  ["home-equity-calculator","finance","房屋淨值計算機","Home Equity Calculator","FIN-MTG-002"],
  ["rent-vs-buy-calculator","finance","租房 vs 買房計算機","Rent vs Buy Calculator","FIN-MTG-003"],
  ["closing-cost-calculator","finance","房屋成交成本計算機","Closing Cost Calculator","FIN-MTG-004"],
  ["property-tax-calculator","finance","房產稅計算機","Property Tax Calculator","FIN-TAX-001"],
  ["capital-gains-calculator","finance","資本利得計算機","Capital Gains Calculator","FIN-TAX-002"],
  ["estate-tax-calculator","finance","遺產稅計算機","Estate Tax Calculator","FIN-TAX-003"],
  ["tax-withholding-calculator","finance","預扣稅計算機","Tax Withholding Calculator","FIN-TAX-004"],
  ["tax-loss-harvesting","finance","稅損收割計算機","Tax-Loss Harvesting Calculator","FIN-TAX-005"],
  ["purchasing-power-calculator","finance","購買力計算機","Purchasing Power Calculator","FIN-INF-001"],
  ["real-return-calculator","finance","實質報酬率計算機","Real Return Calculator","FIN-INF-002"],
  ["dollar-cost-averaging","finance","定期定額計算機","Dollar-Cost Averaging Calculator","FIN-INV-001"],
  ["portfolio-rebalance-calculator","finance","投資組合再平衡計算機","Portfolio Rebalance Calculator","FIN-INV-002"],
  ["rule-of-72-calculator","finance","72 法則計算機","Rule of 72 Calculator","FIN-INV-003"],
  ["pe-ratio-calculator","finance","本益比計算機","P/E Ratio Calculator","FIN-STK-001"],
  ["eps-calculator","finance","每股盈餘計算機","EPS Calculator","FIN-STK-002"],
  ["sharpe-ratio-calculator","finance","夏普比率計算機","Sharpe Ratio Calculator","FIN-STK-003"],
  ["beta-calculator","finance","Beta 係數計算機","Beta Calculator","FIN-STK-004"],
  ["capm-calculator","finance","CAPM 資本資產定價計算機","CAPM Calculator","FIN-STK-005"],
  ["price-to-book-calculator","finance","股價淨值比計算機","Price-to-Book Calculator","FIN-STK-006"],
  ["book-value-calculator","finance","每股淨值計算機","Book Value Calculator","FIN-STK-007"],
  ["risk-tolerance-calculator","finance","風險承受度計算機","Risk Tolerance Calculator","FIN-INV-004"],
  // ── Health (+26) ─────────────────────────────────────────
  ["waist-hip-ratio-calculator","health","腰臀比計算機","Waist-Hip Ratio Calculator","HLT-BDY-001"],
  ["weight-trend-calculator","health","體重趨勢計算機","Weight Trend Calculator","HLT-BDY-002"],
  ["calorie-burn-calculator","health","熱量消耗計算機","Calorie Burn Calculator","HLT-FIT-001"],
  ["exercise-calories-calculator","health","運動熱量計算機","Exercise Calories Calculator","HLT-FIT-002"],
  ["max-heart-rate-calculator","health","最大心率計算機","Max Heart Rate Calculator","HLT-FIT-003"],
  ["one-rep-max-calculator","health","最大單次重量計算機","One-Rep Max Calculator","HLT-FIT-004"],
  ["running-pace-calculator","health","跑步配速計算機","Running Pace Calculator","HLT-FIT-005"],
  ["swimming-calories-calculator","health","游泳熱量計算機","Swimming Calories Calculator","HLT-FIT-006"],
  ["workout-plan-calculator","health","健身計畫計算機","Workout Plan Calculator","HLT-FIT-007"],
  ["protein-calculator","health","蛋白質攝取計算機","Protein Intake Calculator","HLT-NUT-001"],
  ["intermittent-fasting-calculator","health","間歇性斷食計算機","Intermittent Fasting Calculator","HLT-NUT-002"],
  ["alcohol-calories-calculator","health","酒精熱量計算機","Alcohol Calories Calculator","HLT-NUT-003"],
  ["caffeine-intake-calculator","health","咖啡因攝取計算機","Caffeine Intake Calculator","HLT-NUT-004"],
  ["vitamin-d-calculator","health","維生素 D 計算機","Vitamin D Calculator","HLT-NUT-005"],
  ["glycemic-index-calculator","health","升糖指數計算機","Glycemic Index Calculator","HLT-NUT-006"],
  ["sleep-cycle-calculator","health","睡眠週期計算機","Sleep Cycle Calculator","HLT-WEL-001"],
  ["blood-pressure-analyzer","health","血壓分析器","Blood Pressure Analyzer","HLT-VIT-001"],
  ["pregnancy-week-calculator","health","懷孕週數計算機","Pregnancy Week Calculator","HLT-PRG-001"],
  ["ovulation-calculator","health","排卵期計算機","Ovulation Calculator","HLT-PRG-002"],
  ["vision-prescription-converter","health","視力度數轉換器","Vision Prescription Converter","HLT-VIT-002"],
  ["biological-age-calculator","health","生理年齡計算機","Biological Age Calculator","HLT-RSK-001"],
  ["diabetes-risk-calculator","health","糖尿病風險計算機","Diabetes Risk Calculator","HLT-RSK-002"],
  ["heart-disease-risk-calculator","health","心臟病風險計算機","Heart Disease Risk Calculator","HLT-RSK-003"],
  ["life-expectancy-calculator","health","預期壽命計算機","Life Expectancy Calculator","HLT-RSK-004"],
  ["cancer-risk-calculator","health","癌症風險計算機","Cancer Risk Calculator","HLT-RSK-005"],
  ["stress-index-calculator","health","壓力指數計算機","Stress Index Calculator","HLT-WEL-002"],
  // ── Productivity (+21) ───────────────────────────────────
  ["deadline-countdown","productivity","截止日倒數計算機","Deadline Countdown","PRD-TIM-001"],
  ["habit-formation-calculator","productivity","習慣養成計算機","Habit Formation Calculator","PRD-HAB-001"],
  ["meeting-efficiency-scorer","productivity","會議效率評分器","Meeting Efficiency Scorer","PRD-MTG-001"],
  ["cross-timezone-scheduler","productivity","跨時區排程器","Cross-Timezone Scheduler","PRD-TIM-002"],
  ["speech-time-calculator","productivity","演講時間計算機","Speech Time Calculator","PRD-TIM-003"],
  ["raise-negotiation-calculator","productivity","加薪談判計算機","Raise Negotiation Calculator","PRD-CAR-001"],
  ["job-change-cost-calculator","productivity","換工作成本計算機","Job Change Cost Calculator","PRD-CAR-002"],
  ["reading-time-calculator","productivity","閱讀時間計算機","Reading Time Calculator","PRD-TIM-004"],
  ["presentation-time-calculator","productivity","簡報時間計算機","Presentation Time Calculator","PRD-TIM-005"],
  ["email-response-time","productivity","郵件回覆時間計算機","Email Response Time Calculator","PRD-TIM-006"],
  ["content-calendar-calculator","productivity","內容行事曆計算機","Content Calendar Calculator","PRD-PRJ-001"],
  ["project-cost-calculator","productivity","專案成本計算機","Project Cost Calculator","PRD-PRJ-002"],
  ["billable-hours-calculator","productivity","計費工時計算機","Billable Hours Calculator","PRD-PRJ-003"],
  ["team-productivity-calculator","productivity","團隊生產力計算機","Team Productivity Calculator","PRD-PRJ-004"],
  ["build-vs-buy-calculator","productivity","自建 vs 採購計算機","Build vs Buy Calculator","PRD-PRJ-005"],
  ["project-roi-calculator","productivity","專案投報率計算機","Project ROI Calculator","PRD-PRJ-006"],
  ["remote-work-cost-calculator","productivity","遠距工作成本計算機","Remote Work Cost Calculator","PRD-RMT-001"],
  ["home-office-deduction","productivity","居家辦公扣除額計算機","Home Office Deduction Calculator","PRD-RMT-002"],
  ["commute-savings-calculator","productivity","通勤節省計算機","Commute Savings Calculator","PRD-RMT-003"],
  ["coworking-cost-calculator","productivity","共享辦公成本計算機","Coworking Cost Calculator","PRD-RMT-004"],
  ["digital-nomad-calculator","productivity","數位遊牧成本計算機","Digital Nomad Calculator","PRD-RMT-005"],
  // ── Education (+23) ──────────────────────────────────────
  ["average-score-calculator","education","平均分數計算機","Average Score Calculator","EDU-GRD-001"],
  ["pass-rate-calculator","education","及格率計算機","Pass Rate Calculator","EDU-GRD-002"],
  ["forgetting-curve-calculator","education","遺忘曲線計算機","Forgetting Curve Calculator","EDU-LRN-001"],
  ["spaced-repetition-calculator","education","間隔重複計算機","Spaced Repetition Calculator","EDU-LRN-002"],
  ["learning-efficiency-calculator","education","學習效率計算機","Learning Efficiency Calculator","EDU-LRN-003"],
  ["tuition-cost-calculator","education","學費成本計算機","Tuition Cost Calculator","EDU-COS-001"],
  ["scholarship-calculator","education","獎學金計算機","Scholarship Calculator","EDU-COS-002"],
  ["education-roi-calculator","education","教育投報率計算機","Education ROI Calculator","EDU-COS-003"],
  ["fraction-calculator","education","分數計算機","Fraction Calculator","EDU-MTH-001"],
  ["scientific-calculator","education","科學計算機","Scientific Calculator","EDU-MTH-002"],
  ["unit-converter-edu","education","單位換算機（教育）","Unit Converter (Education)","EDU-MTH-003"],
  ["statistics-calculator","education","統計計算機","Statistics Calculator","EDU-MTH-004"],
  ["matrix-calculator","education","矩陣計算機","Matrix Calculator","EDU-MTH-005"],
  ["language-learning-calculator","education","語言學習計算機","Language Learning Calculator","EDU-LNG-001"],
  ["vocabulary-size-estimator","education","詞彙量估算器","Vocabulary Size Estimator","EDU-LNG-002"],
  ["course-material-cost-calculator","education","課程教材成本計算機","Course Material Cost Calculator","EDU-LNG-003"],
  ["language-proficiency-converter","education","語言能力對照轉換器","Language Proficiency Converter","EDU-LNG-004"],
  ["language-roi-calculator","education","語言學習投報率計算機","Language Learning ROI Calculator","EDU-LNG-005"],
  ["career-salary-comparator","education","職涯薪資比較器","Career Salary Comparator","EDU-CAR-001"],
  ["skill-learning-cost","education","技能學習成本計算機","Skill Learning Cost Calculator","EDU-CAR-002"],
  ["grad-vs-work-calculator","education","升學 vs 就業計算機","Grad vs Work Calculator","EDU-CAR-003"],
  ["certification-roi-calculator","education","證照投報率計算機","Certification ROI Calculator","EDU-CAR-004"],
  ["internship-cost-calculator","education","實習成本計算機","Internship Cost Calculator","EDU-CAR-005"],
  // ── Developer (+16) ──────────────────────────────────────
  ["json-schema-validator","developer","JSON Schema 驗證器","JSON Schema Validator","DEV-DAT-001"],
  ["xml-to-json","developer","XML 轉 JSON 工具","XML to JSON Converter","DEV-DAT-002"],
  ["unicode-converter","developer","Unicode 轉換器","Unicode Converter","DEV-DAT-003"],
  ["cors-tester","developer","CORS 測試器","CORS Tester","DEV-NET-001"],
  ["ssl-cert-checker","developer","SSL 憑證檢查器","SSL Certificate Checker","DEV-NET-002"],
  ["dns-lookup","developer","DNS 查詢工具","DNS Lookup","DEV-NET-003"],
  ["http-status-codes","developer","HTTP 狀態碼查詢","HTTP Status Codes Reference","DEV-NET-004"],
  ["css-gradient-generator","developer","CSS 漸層產生器","CSS Gradient Generator","DEV-CSS-001"],
  ["breakpoint-calculator","developer","響應式斷點計算機","Breakpoint Calculator","DEV-CSS-002"],
  ["string-hash-calculator","developer","字串雜湊計算機","String Hash Calculator","DEV-UTL-001"],
  ["lorem-ipsum-generator","developer","假文產生器","Lorem Ipsum Generator","DEV-UTL-002"],
  ["text-comparison","developer","文字比對工具","Text Comparison","DEV-UTL-003"],
  ["uuid-generator","developer","UUID 產生器","UUID Generator","DEV-UTL-004"],
  ["api-cost-calculator","developer","API 成本計算機","API Cost Calculator","DEV-COS-001"],
  ["webhook-tester","developer","Webhook 測試器","Webhook Tester","DEV-NET-005"],
  ["jwt-generator","developer","JWT 產生器","JWT Generator","DEV-SEC-001"],
  // ── Legal (+9) ───────────────────────────────────────────
  ["overtime-calculator","legal","加班費計算機","Overtime Pay Calculator","LAW-LAB-001"],
  ["severance-pay-calculator","legal","資遣費計算機","Severance Pay Calculator","LAW-LAB-002"],
  ["annual-leave-calculator","legal","特休假計算機","Annual Leave Calculator","LAW-LAB-003"],
  ["minimum-wage-calculator","legal","最低工資計算機","Minimum Wage Calculator","LAW-LAB-004"],
  ["working-hours-calculator","legal","工時計算機","Working Hours Calculator","LAW-LAB-005"],
  ["stamp-duty-calculator","legal","印花稅計算機","Stamp Duty Calculator","LAW-TAX-001"],
  ["penalty-calculator","legal","違約金計算機","Penalty Calculator","LAW-CON-001"],
  ["legal-interest-calculator","legal","法定利息計算機","Legal Interest Calculator","LAW-CON-002"],
  ["import-duty-calculator","legal","進口關稅計算機","Import Duty Calculator","LAW-TRD-001"],
  // ── Design (+7) ──────────────────────────────────────────
  ["contrast-ratio-calculator","design","對比度計算機","Contrast Ratio Calculator","DSN-COL-001"],
  ["color-harmony-calculator","design","配色和諧計算機","Color Harmony Calculator","DSN-COL-002"],
  ["golden-ratio-calculator","design","黃金比例計算機","Golden Ratio Calculator","DSN-LAY-001"],
  ["type-scale-calculator","design","字級比例計算機","Type Scale Calculator","DSN-TYP-001"],
  ["grid-calculator","design","網格系統計算機","Grid Calculator","DSN-LAY-002"],
  ["line-height-calculator","design","行高計算機","Line Height Calculator","DSN-TYP-002"],
  ["responsive-size-calculator","design","響應式尺寸計算機","Responsive Size Calculator","DSN-LAY-003"],
  // ── Science (+15) ────────────────────────────────────────
  ["speed-distance-time","science","速度距離時間計算機","Speed-Distance-Time Calculator","SCI-PHY-001"],
  ["force-calculator","science","力計算機","Force Calculator","SCI-PHY-002"],
  ["energy-calculator","science","能量計算機","Energy Calculator","SCI-PHY-003"],
  ["density-calculator","science","密度計算機","Density Calculator","SCI-PHY-004"],
  ["power-calculator","science","功率計算機","Power Calculator","SCI-PHY-005"],
  ["mole-calculator","science","莫耳計算機","Mole Calculator","SCI-CHM-001"],
  ["concentration-calculator","science","濃度計算機","Concentration Calculator","SCI-CHM-002"],
  ["ph-calculator","science","pH 值計算機","pH Calculator","SCI-CHM-003"],
  ["molecular-weight-calculator","science","分子量計算機","Molecular Weight Calculator","SCI-CHM-004"],
  ["dilution-calculator","science","稀釋計算機","Dilution Calculator","SCI-CHM-005"],
  ["ohms-law-calculator","science","歐姆定律計算機","Ohm's Law Calculator","SCI-ELE-001"],
  ["resistor-calculator","science","電阻計算機","Resistor Calculator","SCI-ELE-002"],
  ["capacitor-calculator","science","電容計算機","Capacitor Calculator","SCI-ELE-003"],
  ["led-resistor-calculator","science","LED 限流電阻計算機","LED Resistor Calculator","SCI-ELE-004"],
  ["transformer-calculator","science","變壓器計算機","Transformer Calculator","SCI-ELE-005"],
  // ── Language (+4) ────────────────────────────────────────
  ["readability-analyzer","language","可讀性分析器","Readability Analyzer","LNG-TXT-001"],
  ["keyword-density-calculator","language","關鍵字密度計算機","Keyword Density Calculator","LNG-SEO-001"],
  ["translation-cost-calculator","language","翻譯成本計算機","Translation Cost Calculator","LNG-COS-001"],
  ["content-quality-scorer","language","內容品質評分器","Content Quality Scorer","LNG-TXT-002"],
  // ── E-Commerce (+18) ─────────────────────────────────────
  ["pricing-calculator","ecommerce","定價計算機","Pricing Calculator","ECM-PRC-001"],
  ["competitive-pricing-calculator","ecommerce","競爭定價計算機","Competitive Pricing Calculator","ECM-PRC-002"],
  ["wholesale-pricing-calculator","ecommerce","批發定價計算機","Wholesale Pricing Calculator","ECM-PRC-003"],
  ["ad-cost-calculator","ecommerce","廣告成本計算機","Ad Cost Calculator","ECM-MKT-001"],
  ["conversion-rate-calculator","ecommerce","轉換率計算機","Conversion Rate Calculator","ECM-MKT-002"],
  ["ltv-calculator","ecommerce","顧客終身價值計算機","Customer LTV Calculator","ECM-MKT-003"],
  ["cac-calculator","ecommerce","顧客獲取成本計算機","CAC Calculator","ECM-MKT-004"],
  ["inventory-turnover-calculator","ecommerce","存貨週轉率計算機","Inventory Turnover Calculator","ECM-INV-001"],
  ["safety-stock-calculator","ecommerce","安全庫存計算機","Safety Stock Calculator","ECM-INV-002"],
  ["eoq-calculator","ecommerce","經濟訂購量計算機","EOQ Calculator","ECM-INV-003"],
  ["warehouse-cost-calculator","ecommerce","倉儲成本計算機","Warehouse Cost Calculator","ECM-INV-004"],
  ["reorder-point-calculator","ecommerce","再訂購點計算機","Reorder Point Calculator","ECM-INV-005"],
  ["shipping-cost-calculator","ecommerce","運費計算機","Shipping Cost Calculator","ECM-SHP-001"],
  ["packaging-cost-calculator","ecommerce","包裝成本計算機","Packaging Cost Calculator","ECM-SHP-002"],
  ["return-rate-calculator","ecommerce","退貨率計算機","Return Rate Calculator","ECM-SHP-003"],
  ["delivery-time-calculator","ecommerce","配送時間計算機","Delivery Time Calculator","ECM-SHP-004"],
  ["mrr-calculator","ecommerce","月經常性收入計算機","MRR Calculator","ECM-SUB-001"],
  ["churn-rate-calculator","ecommerce","流失率計算機","Churn Rate Calculator","ECM-SUB-002"],
  // ── Travel (+19) ─────────────────────────────────────────
  ["travel-budget-calculator","travel","旅遊預算計算機","Travel Budget Calculator","TRV-BDG-001"],
  ["travel-day-counter","travel","旅遊天數計算機","Travel Day Counter","TRV-BDG-002"],
  ["travel-insurance-calculator","travel","旅遊保險計算機","Travel Insurance Calculator","TRV-BDG-003"],
  ["hotel-cost-calculator","travel","住宿成本計算機","Hotel Cost Calculator","TRV-BDG-004"],
  ["daily-budget-calculator","travel","每日預算計算機","Daily Budget Calculator","TRV-BDG-005"],
  ["currency-travel-converter","travel","旅遊貨幣換算器","Travel Currency Converter","TRV-CUR-001"],
  ["time-zone-difference","travel","時差計算機","Time Zone Difference Calculator","TRV-TIM-001"],
  ["purchasing-power-parity","travel","購買力平價計算機","Purchasing Power Parity Calculator","TRV-CUR-002"],
  ["travel-price-comparator","travel","旅遊價格比較器","Travel Price Comparator","TRV-BDG-006"],
  ["luggage-weight-calculator","travel","行李重量計算機","Luggage Weight Calculator","TRV-LOG-001"],
  ["flight-time-calculator","travel","飛行時間計算機","Flight Time Calculator","TRV-TIM-002"],
  ["fuel-cost-calculator","travel","油費計算機","Fuel Cost Calculator","TRV-DRV-001"],
  ["road-trip-calculator","travel","公路旅行計算機","Road Trip Calculator","TRV-DRV-002"],
  ["visa-cost-calculator","travel","簽證費用計算機","Visa Cost Calculator","TRV-LOG-002"],
  ["jet-lag-calculator","travel","時差調適計算機","Jet Lag Calculator","TRV-HLT-001"],
  ["altitude-sickness-calculator","travel","高山症風險計算機","Altitude Sickness Calculator","TRV-HLT-002"],
  ["spf-calculator","travel","防曬係數計算機","SPF Calculator","TRV-HLT-003"],
  ["travel-hydration-calculator","travel","旅遊補水計算機","Travel Hydration Calculator","TRV-HLT-004"],
  ["vaccine-schedule-calculator","travel","疫苗接種排程計算機","Vaccine Schedule Calculator","TRV-HLT-005"],
  // ── AI Tools (+15) ───────────────────────────────────────
  ["ai-token-cost-calculator","ai","AI Token 成本計算機","AI Token Cost Calculator","AIT-COS-001"],
  ["ai-api-cost-estimator","ai","AI API 成本估算器","AI API Cost Estimator","AIT-COS-002"],
  ["ai-model-comparison","ai","AI 模型比較器","AI Model Comparison","AIT-MOD-001"],
  ["ai-project-cost-calculator","ai","AI 專案成本計算機","AI Project Cost Calculator","AIT-COS-003"],
  ["prompt-roi-calculator","ai","Prompt 投報率計算機","Prompt ROI Calculator","AIT-ROI-001"],
  ["prompt-token-calculator","ai","Prompt Token 計算機","Prompt Token Calculator","AIT-COS-004"],
  ["ai-accuracy-calculator","ai","AI 準確率計算機","AI Accuracy Calculator","AIT-PRF-001"],
  ["model-latency-calculator","ai","模型延遲計算機","Model Latency Calculator","AIT-PRF-002"],
  ["fine-tuning-cost-calculator","ai","微調成本計算機","Fine-Tuning Cost Calculator","AIT-COS-005"],
  ["ai-error-rate-calculator","ai","AI 錯誤率計算機","AI Error Rate Calculator","AIT-PRF-003"],
  ["ai-roi-calculator","ai","AI 投報率計算機","AI ROI Calculator","AIT-ROI-002"],
  ["automation-savings-calculator","ai","自動化節省計算機","Automation Savings Calculator","AIT-ROI-003"],
  ["ai-labor-calculator","ai","AI 人力替代計算機","AI Labor Calculator","AIT-ROI-004"],
  ["chatbot-cost-calculator","ai","聊天機器人成本計算機","Chatbot Cost Calculator","AIT-COS-006"],
  ["ai-implementation-roi","ai","AI 導入投報率計算機","AI Implementation ROI","AIT-ROI-005"],
];

// ---- group helper ----
const CAT_ORDER = ["finance","health","productivity","education","developer","legal","design","science","language","ecommerce","travel","ai"];
const CAT_LABEL = {
  finance:"Finance 財務", health:"Health 健康", productivity:"Productivity 生產力",
  education:"Education 教育", developer:"Developer 開發者", legal:"Legal 法律",
  design:"Design 設計", science:"Science 科學", language:"Language 語言",
  ecommerce:"E-Commerce 電商", travel:"Travel 旅遊", ai:"AI Tools AI 工具",
};

const existingByCat = {};
for (const t of existing) (existingByCat[t.category] ||= []).push(t);
const plannedByCat = {};
for (const p of planned) (plannedByCat[p[1]] ||= []).push(p);

// ============================================================
// FILE 1: MASTER_TOOL_REGISTRY.md
// ============================================================
let R = [];
R.push("# 🌍 Formula Universe — MASTER TOOL REGISTRY (300)");
R.push("");
R.push("> **唯一權威工具總名冊。** 任何新工具建立前，必須先在此查 slug 是否已存在。");
R.push("> EXISTING 區段由 `shared/toolsConfig.ts` 解析（即時真實）；PLANNED 區段為 Victor 核可的 200 支路線圖。");
R.push("> 自動產生：`node scripts/gen-master-docs.mjs` ｜ 請勿手改表格，改 registry / 本腳本後重生。");
R.push("");
R.push(`**現有 (LIVE)：${existing.length} 支 ｜ 計畫 (PLANNED)：${planned.length} 支 ｜ 總計：${existing.length + planned.length} 支**`);
R.push("");
R.push("## 各 Domain 工具數總覽");
R.push("");
R.push("| Domain | 現有 | 計畫 | 合計 |");
R.push("|--------|-----:|-----:|-----:|");
let tE=0,tP=0;
for (const c of CAT_ORDER) {
  const e = (existingByCat[c]||[]).length, p = (plannedByCat[c]||[]).length;
  if (e===0 && p===0) continue;
  tE+=e; tP+=p;
  R.push(`| ${CAT_LABEL[c]||c} | ${e} | ${p} | ${e+p} |`);
}
R.push(`| **TOTAL** | **${tE}** | **${tP}** | **${tE+tP}** |`);
R.push("");
R.push("---");
R.push("");
R.push("## ✅ EXISTING (LIVE) — 已上線工具");
R.push("");
for (const c of CAT_ORDER) {
  const arr = existingByCat[c]; if (!arr) continue;
  arr.sort((a,b)=>a.id.localeCompare(b.id));
  R.push(`### ${CAT_LABEL[c]||c}  (${arr.length})`);
  R.push("");
  R.push("| slug | 名稱 | 狀態 |");
  R.push("|------|------|------|");
  for (const t of arr) R.push(`| \`${t.id}\` | ${t.nameZh} | 🟢 LIVE |`);
  R.push("");
}
R.push("---");
R.push("");
R.push("## 🗺️ PLANNED — 路線圖（尚未建置，禁止重複）");
R.push("");
for (const c of CAT_ORDER) {
  const arr = plannedByCat[c]; if (!arr) continue;
  arr.sort((a,b)=>a[4].localeCompare(b[4]));
  R.push(`### ${CAT_LABEL[c]||c}  (+${arr.length})`);
  R.push("");
  R.push("| ID | slug | 中文名 | English Name |");
  R.push("|----|------|--------|--------------|");
  for (const p of arr) R.push(`| ${p[4]} | \`${p[0]}\` | ${p[2]} | ${p[3]} |`);
  R.push("");
}
writeFileSync(join(ROOT,"docs/MASTER_TOOL_REGISTRY.md"), R.join("\n"));

// ============================================================
// FILE 2: SEMANTIC_DOMAIN_MAP.md
// ============================================================
let S = [];
S.push("# 🧭 Formula Universe — SEMANTIC DOMAIN MAP");
S.push("");
S.push("> 工具的**語意歸屬地圖**。每個 Domain 下再切 sub-domain（語意群），");
S.push("> 用於判定新工具該放哪一類、以及同類是否已飽和（每 Domain 上限 6 個/群）。");
S.push("> 自動產生：`node scripts/gen-master-docs.mjs`。");
S.push("");
S.push("## 重複判定軸（Purpose + Formula + Input + Output）");
S.push("");
S.push("判斷兩個工具是否重複，**不看名稱，看本質四軸**：");
S.push("");
S.push("- **Purpose 目的**：解決什麼問題？");
S.push("- **Formula 公式**：核心數學/邏輯是否相同？");
S.push("- **Input 輸入**：使用者餵什麼資料？");
S.push("- **Output 輸出**：產出什麼結果？");
S.push("");
S.push("四軸全同 → 重複（REJECT）；任一軸本質不同 → 可共存。");
S.push("");
S.push("---");
S.push("");
S.push("## Domain × Sub-domain 語意樹");
S.push("");
// build sub-domain from ID middle segment for planned + bucket existing under "core"
for (const c of CAT_ORDER) {
  const eArr = existingByCat[c] || [];
  const pArr = plannedByCat[c] || [];
  if (eArr.length===0 && pArr.length===0) continue;
  S.push(`### ${CAT_LABEL[c]||c}`);
  S.push("");
  // sub-domain map from planned ID codes (XXX-SUB-nnn)
  const subs = {};
  for (const p of pArr) {
    const seg = (p[4].split("-")[1]||"GEN");
    (subs[seg] ||= []).push(p);
  }
  if (eArr.length) {
    S.push(`- **(LIVE core)** — ${eArr.length} 支已上線：` + eArr.map(t=>`\`${t.id}\``).slice(0,99).join(", "));
  }
  for (const seg of Object.keys(subs).sort()) {
    const list = subs[seg];
    const flag = list.length > 6 ? " ⚠️(>6 需 Victor 批准)" : "";
    S.push(`- **${seg}** (${list.length})${flag} — ` + list.map(p=>`\`${p[0]}\``).join(", "));
  }
  S.push("");
}
S.push("---");
S.push("");
S.push("## 每 Domain / Sub-domain 飽和規則");
S.push("");
S.push("- 一般 sub-domain：最多 **6** 個工具。");
S.push("- 超過 6 個：標記 ⚠️，必須回報 Victor 審核才能續建。");
S.push("- 新工具歸屬請對照上方語意樹，落在最貼近的 sub-domain。");
writeFileSync(join(ROOT,"docs/SEMANTIC_DOMAIN_MAP.md"), S.join("\n"));

console.log(`✅ MASTER_TOOL_REGISTRY.md — ${existing.length} LIVE + ${planned.length} PLANNED = ${existing.length+planned.length}`);
console.log(`✅ SEMANTIC_DOMAIN_MAP.md`);
// emit the canonical slug list for check-duplicate.mjs to consume
writeFileSync(join(ROOT,"docs/.planned-slugs.json"), JSON.stringify(planned.map(p=>p[0]), null, 0));
console.log(`✅ docs/.planned-slugs.json — ${planned.length} planned slugs`);
