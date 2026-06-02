# 製作工單 #001 — Batch 1 Phase 0 備料報告

日期：2026-06-01  
執行人：Superninja  
Branch 流程：main direct production flow  
本階段範圍：只完成 Phase 0 備料，不刪檔、不複製模板、不改碼、不 push。

---

## 1. 工具：body-fat-calculator

類別：Health  
模板：BMR

公式：採 U.S. Navy circumference method 作為主要估算公式。男性體脂率 = 86.010 × log10(腰圍 − 頸圍) − 70.041 × log10(身高) + 36.76；女性體脂率 = 163.205 × log10(腰圍 + 臀圍 − 頸圍) − 97.684 × log10(身高) − 78.387。所有圍度以英吋計算；若使用公分輸入，先轉換為英吋。另顯示 BMI 脈絡，但明確標示 BMI 不是體脂診斷。

L11旅程：BMI / Ideal Weight / Waist-to-Hip → Body Fat Calculator → TDEE / Calorie Deficit / Macro Calculator

L13 FAQ：體脂率和 BMI 有什麼不同？；U.S. Navy 公式準確嗎？；腰圍、頸圍、臀圍應該怎麼量？；運動員或高肌肉量者適合用這個工具嗎？；男性和女性為什麼公式不同？；這個結果可以當作醫療診斷嗎？

L15推薦：BMI Calculator；Ideal Weight Calculator；TDEE Calculator；Calorie Deficit Calculator

L17來源：U.S. Navy Physical Readiness Program Body Composition Assessment Guide, https://www.mynavyhr.navy.mil/Support-Services/Culture-Resilience/Physical-Readiness/Guides/；Defense Technical Information Center Navy body-fat prediction reports, https://apps.dtic.mil/；CDC About Body Mass Index, https://www.cdc.gov/bmi/about/index.html；Harvard T.H. Chan School of Public Health Body Fat, https://nutritionsource.hsph.harvard.edu/healthy-weight/measuring-fat/

---

## 2. 工具：calorie-deficit-calculator

類別：Health  
模板：BMR

公式：每日熱量差 = 維持熱量 TDEE − 實際攝取熱量。每週熱量差 = 每日熱量差 × 7。傳統靜態換算可顯示預估每週體重變化 = 每週熱量差 ÷ 3500 kcal/lb，或 ÷ 7700 kcal/kg；同時必須提示 3500 kcal/lb 是簡化估算，長期體重變化會受代謝適應、活動量和水分變動影響。若工具內估算 TDEE，可沿用 Mifflin-St Jeor BMR × 活動係數。

L11旅程：BMR / TDEE / Macro → Calorie Deficit Calculator → Weight Trend / Body Fat / Meal Planning

L13 FAQ：什麼是 calorie deficit？；每天少 500 kcal 一定會每週少一磅嗎？；TDEE 和攝取熱量哪個更重要？；赤字太大有什麼風險？；運動消耗要不要全部吃回來？；何時應該重新估算 TDEE？

L15推薦：BMR Calculator；TDEE Calculator；Macro Calculator；Body Fat Calculator

L17來源：CDC Steps for Losing Weight, https://www.cdc.gov/healthy-weight-growth/losing-weight/index.html；NIH News in Health Healthy Weight Control, https://newsinhealth.nih.gov/2022/12/healthy-weight-control；Hall et al. dynamic weight-loss modeling articles via NIH/PMC, https://pmc.ncbi.nlm.nih.gov/articles/PMC4035446/；Mifflin-St Jeor equation original citation as used in BMR template context.

---

## 3. 工具：water-intake-calculator

類別：Health  
模板：BMR

公式：基礎飲水建議 = 體重 kg × 30–35 ml。運動補水可用額外水量 = 運動分鐘 × 10–12 ml 作為估算；炎熱環境、流汗量高、懷孕或哺乳需另加提示。結果需與 National Academies adequate intake 脈絡比較：成人男性約 3.7 L/day total water，成人女性約 2.7 L/day total water，這包含食物與飲品中的總水分，不等於純飲水量。

L11旅程：Body Weight / Activity / Climate → Water Intake Calculator → Exercise Hydration / Macro / Calorie Planning

L13 FAQ：每天到底要喝多少水？；3.7 L 和 2.7 L 是純水嗎？；運動後要補多少水？；咖啡和茶算水分嗎？；尿色能判斷水分狀態嗎？；腎臟或心臟疾病者能用這個建議嗎？

L15推薦：BMR Calculator；Macro Calculator；Calorie Deficit Calculator；Body Fat Calculator

L17來源：National Academies Dietary Reference Intakes for Water, https://www.nationalacademies.org/read/10925/；CDC About Water and Healthier Drinks, https://www.cdc.gov/healthy-weight-growth/water-healthy-drinks/index.html；Harvard T.H. Chan Water, https://nutritionsource.hsph.harvard.edu/water/；NIH News in Health Hydrating for Health, https://newsinhealth.nih.gov/2023/05/hydrating-health

---

## 4. 工具：macro-calculator

類別：Health  
模板：BMR

公式：總熱量先由目標熱量決定，可來自 TDEE、減脂赤字或增肌盈餘。蛋白質克數 = 蛋白質熱量 ÷ 4；碳水克數 = 碳水熱量 ÷ 4；脂肪克數 = 脂肪熱量 ÷ 9。預設區間參考 AMDR：碳水 45–65% kcal、脂肪 20–35% kcal、蛋白質 10–35% kcal；可提供減脂、維持、增肌三種比例預設，但不得宣稱單一比例適合所有人。

L11旅程：BMR / TDEE / Calorie Deficit → Macro Calculator → Meal Planning / Body Fat / Performance Tracking

L13 FAQ：macro 是什麼？；蛋白質、碳水、脂肪每克幾卡？；AMDR 是什麼？；減脂一定要低碳嗎？；蛋白質比例越高越好嗎？；我應該用百分比還是每公斤體重克數？

L15推薦：BMR Calculator；TDEE Calculator；Calorie Deficit Calculator；Water Intake Calculator

L17來源：National Academies AMDR / Dietary Reference Intakes via NCBI Bookshelf, https://www.ncbi.nlm.nih.gov/books/NBK610333/；Dietary Guidelines for Americans 2020–2025, https://www.dietaryguidelines.gov/；USDA Food and Nutrition Information Center, https://www.nal.usda.gov/programs/fnic；CDC Healthy Eating for a Healthy Weight, https://www.cdc.gov/healthy-weight-growth/healthy-eating/index.html

---

## 5. 工具：inflation-adjuster

類別：Finance  
模板：CAGR

公式：通膨調整後金額 = 原始金額 × 目標期間 CPI ÷ 起始期間 CPI。累積通膨率 = 目標 CPI ÷ 起始 CPI − 1。年化通膨率可用 CAGR 形式：((目標 CPI ÷ 起始 CPI)^(1/年數) − 1)。以 CPI-U All Urban Consumers 作為預設說明，不應硬編即時 CPI 值；若無資料 API，先讓使用者輸入兩期 CPI 或使用靜態示例。

L11旅程：Nominal Amount / CPI Series → Inflation Adjuster → Real Value / Salary Comparison / Investment Return Context

L13 FAQ：通膨調整是什麼？；CPI-U 是什麼？；為什麼公式是 CPI 比值？；年化通膨和累積通膨有何不同？；不同國家可以混用 CPI 嗎？；結果代表購買力還是投資報酬？

L15推薦：CAGR Calculator；Salary After Tax Calculator；Net Worth Calculator；Compound Interest Calculator

L17來源：U.S. Bureau of Labor Statistics CPI Inflation Calculator, https://www.bls.gov/data/inflation_calculator.htm；BLS Handbook of Methods CPI Calculation, https://www.bls.gov/opub/hom/cpi/calculation.htm；BLS Consumer Price Index program, https://www.bls.gov/cpi/；BLS Public Data API, https://www.bls.gov/developers/

---

## 6. 工具：net-worth-calculator

類別：Finance  
模板：CAGR

公式：Net Worth = Total Assets − Total Liabilities。資產可分為現金、投資、退休帳戶、房產、車輛與其他資產；負債可分為信用卡、學生貸款、車貸、房貸與其他債務。可加總 liquid net worth = 流動資產 − 短期負債，作為補充但不得取代總淨值。

L11旅程：Assets / Liabilities → Net Worth Calculator → Debt Payoff / Emergency Fund / Retirement Planning

L13 FAQ：net worth 是什麼？；房屋和車子要不要算資產？；房貸怎麼放進淨值？；淨值為負代表什麼？；收入高但淨值低正常嗎？；多久應該更新一次淨值？

L15推薦：Debt Payoff Calculator；Emergency Fund Calculator；Budget Ratio Calculator；Retirement Calculator

L17來源：CFPB Adult financial education tools and resources, https://www.consumerfinance.gov/consumer-tools/educator-tools/adult-financial-education/tools-and-resources/；Fidelity Net Worth overview, https://www.fidelity.com/learning-center/smart-money/net-worth；Khan Academy personal finance net worth education, https://www.khanacademy.org/；FDIC consumer financial education resources, https://www.fdic.gov/consumer-resource-center

---

## 7. 工具：debt-payoff-calculator

類別：Finance  
模板：CAGR

公式：每筆債務月利率 r = APR ÷ 12。若每月付款 P、期初本金 B，當 P > B × r 時，期數 n = −ln(1 − rB/P) ÷ ln(1 + r)；若 r = 0，n = B ÷ P。總利息 = P × n − B。多筆債務支援 snowball：優先本金最小；avalanche：優先 APR 最高。最低付款先覆蓋所有債務，額外付款依策略分配。

L11旅程：Debt List / APR / Monthly Budget → Debt Payoff Calculator → Budget Ratio / Net Worth / Emergency Fund

L13 FAQ：snowball 和 avalanche 差在哪？；為什麼 APR 要除以 12？；額外付款應該先還哪一筆？；最低付款不夠會怎樣？；提前還款可以省多少利息？；信用卡和貸款能放在同一個工具嗎？

L15推薦：Budget Ratio Calculator；Net Worth Calculator；Emergency Fund Calculator；Credit Card Payoff Calculator

L17來源：CFPB debt and credit consumer resources, https://www.consumerfinance.gov/consumer-tools/debt-collection/；Federal Reserve consumer credit education, https://www.federalreserve.gov/；Fidelity debt avalanche vs snowball education, https://www.fidelity.com/learning-center/personal-finance/avalanche-snowball-debt；Experian debt snowball explanation, https://www.experian.com/blogs/ask-experian/how-does-debt-snowball-work/

---

## 8. 工具：budget-ratio-calculator

類別：Finance  
模板：CAGR

公式：Needs Ratio = needs ÷ after-tax income；Wants Ratio = wants ÷ after-tax income；Savings/Debt Paydown Ratio = savings and extra debt payments ÷ after-tax income。預設對照 50/30/20 framework：needs 50%、wants 30%、savings/debt payoff 20%。結果應強調這是框架，不是硬性診斷。

L11旅程：After-Tax Income / Spending Categories → Budget Ratio Calculator → Emergency Fund / Debt Payoff / Net Worth

L13 FAQ：50/30/20 是什麼？；稅前收入可以用嗎？；房租太高會讓 needs 超標嗎？；還債算 savings 嗎？；自由工作者收入不穩怎麼算？；這個比例適合高物價城市嗎？

L15推薦：Salary After Tax Calculator；Emergency Fund Calculator；Debt Payoff Calculator；Net Worth Calculator

L17來源：CFPB My spending rule to live by worksheet, https://files.consumerfinance.gov/f/201603_cfpb_rules-to-live-by_my-spending-rule-to-live-by.pdf；UNFCU 50-30-20 budgeting basics, https://www.unfcu.org/financial-wellness/50-30-20-rule；Harvard Federal Credit Union 50-30-20 framework, https://harvardfcu.org/blog/50-30-20-budgeting-framework；John Hancock budgeting rule discussion, https://www.johnhancock.com/ideas-insights/debunking-50-30-20-budgeting-rule.html

---

## 9. 工具：emergency-fund-calculator

類別：Finance  
模板：CAGR

公式：Emergency Fund Target = monthly essential expenses × target months。常見區間為 3–6 個月必要支出；保守目標可用 6–12 個月。Funding Gap = target − current emergency savings。Months to Goal = gap ÷ monthly contribution。必要支出應與 wants 分離，避免把全額消費誤當 emergency target。

L11旅程：Budget Ratio / Monthly Essentials → Emergency Fund Calculator → Debt Payoff / Net Worth / Savings Goal

L13 FAQ： emergency fund 要存幾個月？；應該用總支出還是必要支出？；有高利債時先還債還是先存緊急金？；緊急金應該放在哪裡？；收入不穩的人要存更多嗎？；緊急金和投資帳戶能混用嗎？

L15推薦：Budget Ratio Calculator；Net Worth Calculator；Debt Payoff Calculator；Savings Goal Calculator

L17來源：Certified Financial Planner Board emergency fund topic, https://www.letsmakeaplan.org/financial-topics/topics-a-z/emergency-fund；Federal Reserve Bank of St. Louis emergency fund education, https://www.stlouisfed.org/publications/page-one-economics；Vanguard emergency fund guide, https://investor.vanguard.com/investor-resources-education/emergency-fund；CFPB savings and financial education tools, https://www.consumerfinance.gov/consumer-tools/

---

## 10. 工具：salary-after-tax-calculator

類別：Finance  
模板：CAGR

公式：Gross Pay per period = annual salary ÷ pay periods。Taxable wages are adjusted by pre-tax deductions where applicable. Federal withholding follows IRS Publication 15‑T wage bracket or percentage method based on Form W‑4 inputs; simplified MVP may estimate federal tax using annualized taxable income and tax brackets, then subtract FICA: Social Security = wages up to annual wage base × 6.2%；Medicare = wages × 1.45%，plus additional Medicare threshold note. Net Pay = gross pay − federal income tax − FICA − state/local tax estimate − deductions.

L11旅程：Gross Salary / Filing Inputs / Deductions → Salary After Tax Calculator → Budget Ratio / Hourly Rate / Emergency Fund

L13 FAQ：稅後薪資和 take-home pay 一樣嗎？；W‑4 會影響實際扣繳嗎？；FICA 包含什麼？；州稅和地方稅如何處理？；稅前扣除會降低 taxable wages 嗎？；為什麼估算和薪資單不同？

L15推薦：Hourly Rate Calculator；Budget Ratio Calculator；Emergency Fund Calculator；Inflation Adjuster

L17來源：IRS Publication 15‑T Federal Income Tax Withholding Methods, https://www.irs.gov/publications/p15t；IRS Tax Withholding Estimator, https://www.irs.gov/individuals/tax-withholding-estimator；Social Security Administration contribution and benefit base, https://www.ssa.gov/oact/cola/cbb.html；IRS Topic No. 751 Social Security and Medicare Withholding Rates, https://www.irs.gov/taxtopics/tc751

---

## 11. 工具：hourly-rate-calculator

類別：Finance  
模板：CAGR

公式：Hourly Rate = annual salary ÷ annual work hours。通用預設可用 40 hours/week × 52 weeks = 2080 hours；美國聯邦文職薪資也常用 OPM 2087-hour divisor。若使用者輸入 paid time off，可顯示 effective hourly rate = annual salary ÷ actual worked hours，其中 actual worked hours = weekly hours × working weeks − unpaid time off hours。

L11旅程：Annual Salary / Work Schedule → Hourly Rate Calculator → Salary After Tax / Meeting Cost / Budget Ratio

L13 FAQ：年薪轉時薪要用 2080 還是 2087 小時？；帶薪休假會影響有效時薪嗎？；兼職或 freelance 怎麼算？；稅前時薪和稅後時薪差在哪？；加班費能放進公式嗎？；為什麼公司薪資單可能不同？

L15推薦：Salary After Tax Calculator；Meeting Cost Calculator；Budget Ratio Calculator；Inflation Adjuster

L17來源：U.S. Office of Personnel Management 2,087-hour divisor, https://www.opm.gov/policy-data-oversight/pay-leave/pay-administration/fact-sheets/computing-hourly-rates-of-pay-using-the-2087-hour-divisor；BLS Occupational Employment and Wage Statistics calculation methods, https://www.bls.gov/opub/hom/oews/calculation.htm；U.S. Department of Labor Wage and Hour Division, https://www.dol.gov/agencies/whd；IRS Publication 15 payroll context, https://www.irs.gov/publications/p15

---

## 12. 工具：meeting-cost-calculator

類別：Productivity  
模板：BMR

公式：Participant hourly cost = annual compensation ÷ annual work hours。Meeting Cost = Σ(participant hourly cost × meeting duration hours)；若只輸入平均薪資，Meeting Cost = attendees × average hourly cost × duration hours。可加上 burden multiplier，例如 1.2–1.4 表示福利、稅費和 overhead，但需標示為使用者可調參數。

L11旅程：Hourly Rate / Team Size / Meeting Duration → Meeting Cost Calculator → Pomodoro Planner / Productivity Audit / Budget Ratio

L13 FAQ：會議成本應該用薪資還是總補償？；要不要加入 overhead multiplier？；非同步工作如何比較？；固定週會的年度成本怎麼算？；高薪與低薪參與者能混合嗎？；會議成本高是否代表會議沒價值？

L15推薦：Hourly Rate Calculator；Pomodoro Planner；Salary After Tax Calculator；Budget Ratio Calculator

L17來源：U.S. Department of Homeland Security Meeting Cost Estimator form, https://www.dhs.gov/；OPM 2,087-hour divisor, https://www.opm.gov/policy-data-oversight/pay-leave/pay-administration/fact-sheets/computing-hourly-rates-of-pay-using-the-2087-hour-divisor；BLS wage calculation resources, https://www.bls.gov/opub/hom/oews/calculation.htm；Atlassian / workplace productivity meeting-cost education as secondary UX reference, https://www.atlassian.com/

---

## 13. 工具：pomodoro-planner

類別：Productivity  
模板：BMR

公式：Classic Pomodoro cycle = 25 minutes focus + 5 minutes short break。After 4 pomodoros, use a longer break such as 15–30 minutes. Total plan time = focus sessions × focus length + short breaks × short break length + long breaks × long break length。Completed focus time = sessions × focus length。可允許自訂 25/5、50/10 等節奏，但預設仍使用原始 25 分鐘番茄鐘。

L11旅程：Task List / Available Time → Pomodoro Planner → Meeting Cost / Daily Schedule / Productivity Review

L13 FAQ：番茄鐘為什麼是 25 分鐘？；每 4 輪後為什麼要長休息？；可以改成 50/10 嗎？；番茄鐘適合深度工作嗎？；中斷時這一輪要重算嗎？；一天安排多少 pomodoro 合理？

L15推薦：Meeting Cost Calculator；Hourly Rate Calculator；Time Duration Calculator；Budget Ratio Calculator

L17來源：Francesco Cirillo Pomodoro Technique official site, https://www.pomodorotechnique.com/；EBSCO Research Starters Pomodoro Technique, https://www.ebsco.com/research-starters/business-and-management/pomodoro-technique-time-management；Emory University Libraries wellness resource on Pomodoro, https://guides.libraries.emory.edu/；CSU Global Pomodoro time management article, https://csuglobal.edu/blog/pomodoro-technique-time-management

---

## 14. 工具：profit-margin-calculator

類別：E-commerce  
模板：CAGR

公式：Gross Profit = Revenue − Cost of Goods Sold。Gross Margin % = Gross Profit ÷ Revenue × 100。Net Profit = Revenue − COGS − operating expenses − fees − shipping − taxes where applicable。Net Margin % = Net Profit ÷ Revenue × 100。Markup % = Profit ÷ Cost × 100；需明確區分 margin 與 markup。

L11旅程：Revenue / COGS / Fees → Profit Margin Calculator → ROAS Calculator / Pricing / Break-even Analysis

L13 FAQ：profit margin 和 markup 差在哪？；gross margin 和 net margin 差在哪？；平台費和運費要算在哪？；margin 可以是負數嗎？；為什麼高 ROAS 仍可能虧錢？；電商定價應該看毛利還是淨利？

L15推薦：ROAS Calculator；CAGR Calculator；Break-even Calculator；Compound Interest Calculator

L17來源：Xero gross margin calculator education, https://www.xero.com/us/calculators/margin-calculator/；Oracle NetSuite profit margin guide, https://www.netsuite.com/portal/resource/articles/financial-management/profit-margin.shtml；Investopedia profit margin formula, https://www.investopedia.com/ask/answers/031815/what-formula-calculating-profit-margins.asp；U.S. Small Business Administration pricing and financial management resources, https://www.sba.gov/business-guide/manage-your-business

---

## 15. 工具：roas-calculator

類別：E-commerce  
模板：CAGR

公式：ROAS = Conversion Value ÷ Ad Spend。ROAS % = Conversion Value ÷ Ad Spend × 100。Break-even ROAS can be estimated as 1 ÷ gross margin rate when ad spend is the only variable acquisition cost; more complete break-even ROAS = revenue required to cover COGS, fees, shipping, and ad spend. Google Ads target ROAS expresses desired conversion value per cost as a percentage, e.g. $5 revenue ÷ $1 ad spend × 100% = 500%.

L11旅程：Ad Spend / Conversion Value / Margin → ROAS Calculator → Profit Margin / Campaign Budget / CAGR

L13 FAQ：ROAS 和 ROI 差在哪？；Target ROAS 為什麼用百分比？；ROAS 高就一定賺錢嗎？；break-even ROAS 怎麼算？；Google Ads 的 conversion value 是什麼？；不同渠道的 ROAS 可以直接比較嗎？

L15推薦：Profit Margin Calculator；CAGR Calculator；Break-even Calculator；Compound Interest Calculator

L17來源：Google Ads Help About Target ROAS bidding, https://support.google.com/google-ads/answer/6268637；Google Ads conversion values documentation, https://support.google.com/google-ads/answer/3419241；Wall Street Prep ROAS formula reference, https://www.wallstreetprep.com/knowledge/return-on-ad-spend-roas/；Meta / advertising measurement education as secondary channel reference, https://www.facebook.com/business/help

---

## Phase 0 自檢結論

Batch 1 共 15 個工具已完成 Phase 0 備料。每個工具均已具備：工具 slug、類別、模板、專屬公式、L11 使用者旅程、L13 六題 FAQ、L15 四個語意推薦工具、L17 四個具名來源。Health 與 Productivity 類將使用 BMR 模板；Finance 與 E-commerce 類將使用 CAGR 模板。下一階段若獲品管放行，將從 `body-fat-calculator` 開始逐一進入 main branch 直接量產流程：刪舊檔或確認不存在 → cp BMR/CAGR → 只換內容 → 15 項 code QC → browser visual QC → push main → production screenshot 回報。
