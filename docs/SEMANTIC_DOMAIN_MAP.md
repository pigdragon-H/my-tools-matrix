# 🧭 Formula Universe — SEMANTIC DOMAIN MAP

> 工具的**語意歸屬地圖**。每個 Domain 下再切 sub-domain（語意群），
> 用於判定新工具該放哪一類、以及同類是否已飽和（每 Domain 上限 6 個/群）。
> 自動產生：`node scripts/gen-master-docs.mjs`。

## 重複判定軸（Purpose + Formula + Input + Output）

判斷兩個工具是否重複，**不看名稱，看本質四軸**：

- **Purpose 目的**：解決什麼問題？
- **Formula 公式**：核心數學/邏輯是否相同？
- **Input 輸入**：使用者餵什麼資料？
- **Output 輸出**：產出什麼結果？

四軸全同 → 重複（REJECT）；任一軸本質不同 → 可共存。

---

## Domain × Sub-domain 語意樹

### Finance 財務

- **(LIVE core)** — 64 支已上線：`amortization-schedule-calculator`, `annuity-calculator`, `auto-loan-calculator`, `bond-yield-calculator`, `break-even-calculator`, `budget-ratio-calculator`, `burn-rate-calculator`, `cagr-calculator`, `cap-rate-calculator`, `capital-gains-tax-calculator`, `cash-flow-calculator`, `cd-calculator`, `compound-interest-calculator`, `credit-card-payoff-calculator`, `currency-converter`, `debt-payoff-calculator`, `debt-snowball-calculator`, `debt-to-income-calculator`, `discount-calculator`, `dividend-yield-calculator`, `down-payment-calculator`, `ebitda-calculator`, `effective-annual-rate-calculator`, `emergency-fund-calculator`, `financial-ratio-calculator`, `future-value-calculator`, `gross-margin-calculator`, `home-affordability-calculator`, `hourly-rate-calculator`, `inflation-adjuster`, `insurance-premium-calculator`, `investment-return-calculator`, `lease-vs-buy-calculator`, `loan-calculator`, `markup-calculator`, `meeting-cost-calculator`, `mortgage-calculator`, `net-present-value-calculator`, `net-worth-calculator`, `options-profit-calculator`, `payback-period-calculator`, `pension-calculator`, `pomodoro-calculator`, `present-value-calculator`, `profit-margin-calculator`, `quick-ratio-calculator`, `refinance-calculator`, `rental-yield-calculator`, `retirement-401k-calculator`, `retirement-calculator`, `roas-calculator`, `roi-payback-calculator`, `roth-ira-calculator`, `salary-after-tax-calculator`, `sales-tax-calculator`, `savings-goal-calculator`, `simple-interest-calculator`, `sip-calculator`, `stock-profit-calculator`, `student-loan-calculator`, `tax-bracket-calculator`, `tip-calculator`, `vat-calculator`, `working-capital-calculator`
- **INF** (2) — `purchasing-power-calculator`, `real-return-calculator`
- **INV** (4) — `dollar-cost-averaging`, `portfolio-rebalance-calculator`, `rule-of-72-calculator`, `risk-tolerance-calculator`
- **MTG** (4) — `ltv-ratio-calculator`, `home-equity-calculator`, `rent-vs-buy-calculator`, `closing-cost-calculator`
- **RET** (5) — `withdrawal-rate-calculator`, `coast-fire-calculator`, `fire-number-calculator`, `social-security-calculator`, `roth-conversion-calculator`
- **STK** (7) ⚠️(>6 需 Victor 批准) — `pe-ratio-calculator`, `eps-calculator`, `sharpe-ratio-calculator`, `beta-calculator`, `capm-calculator`, `price-to-book-calculator`, `book-value-calculator`
- **TAX** (5) — `property-tax-calculator`, `capital-gains-calculator`, `estate-tax-calculator`, `tax-withholding-calculator`, `tax-loss-harvesting`

### Health 健康

- **(LIVE core)** — 8 支已上線：`bmi-calculator`, `bmr-calculator`, `body-fat-calculator`, `calorie-deficit-calculator`, `ideal-weight-calculator`, `macro-calculator`, `tdee-calculator`, `water-intake-calculator`
- **BDY** (2) — `waist-hip-ratio-calculator`, `weight-trend-calculator`
- **FIT** (7) ⚠️(>6 需 Victor 批准) — `calorie-burn-calculator`, `exercise-calories-calculator`, `max-heart-rate-calculator`, `one-rep-max-calculator`, `running-pace-calculator`, `swimming-calories-calculator`, `workout-plan-calculator`
- **NUT** (6) — `protein-calculator`, `intermittent-fasting-calculator`, `alcohol-calories-calculator`, `caffeine-intake-calculator`, `vitamin-d-calculator`, `glycemic-index-calculator`
- **PRG** (2) — `pregnancy-week-calculator`, `ovulation-calculator`
- **RSK** (5) — `biological-age-calculator`, `diabetes-risk-calculator`, `heart-disease-risk-calculator`, `life-expectancy-calculator`, `cancer-risk-calculator`
- **VIT** (2) — `blood-pressure-analyzer`, `vision-prescription-converter`
- **WEL** (2) — `sleep-cycle-calculator`, `stress-index-calculator`

### Productivity 生產力

- **(LIVE core)** — 5 支已上線：`age-calculator`, `date-duration-calculator`, `pomodoro-planner`, `time-zone-converter`, `word-counter`
- **CAR** (2) — `raise-negotiation-calculator`, `job-change-cost-calculator`
- **HAB** (1) — `habit-formation-calculator`
- **MTG** (1) — `meeting-efficiency-scorer`
- **PRJ** (6) — `content-calendar-calculator`, `project-cost-calculator`, `billable-hours-calculator`, `team-productivity-calculator`, `build-vs-buy-calculator`, `project-roi-calculator`
- **RMT** (5) — `remote-work-cost-calculator`, `home-office-deduction`, `commute-savings-calculator`, `coworking-cost-calculator`, `digital-nomad-calculator`
- **TIM** (6) — `deadline-countdown`, `cross-timezone-scheduler`, `speech-time-calculator`, `reading-time-calculator`, `presentation-time-calculator`, `email-response-time`

### Education 教育

- **(LIVE core)** — 4 支已上線：`gpa-calculator`, `grade-calculator`, `math-percentage-calculator`, `study-time-calculator`
- **CAR** (5) — `career-salary-comparator`, `skill-learning-cost`, `grad-vs-work-calculator`, `certification-roi-calculator`, `internship-cost-calculator`
- **COS** (3) — `tuition-cost-calculator`, `scholarship-calculator`, `education-roi-calculator`
- **GRD** (2) — `average-score-calculator`, `pass-rate-calculator`
- **LNG** (5) — `language-learning-calculator`, `vocabulary-size-estimator`, `course-material-cost-calculator`, `language-proficiency-converter`, `language-roi-calculator`
- **LRN** (3) — `forgetting-curve-calculator`, `spaced-repetition-calculator`, `learning-efficiency-calculator`
- **MTH** (5) — `fraction-calculator`, `scientific-calculator`, `unit-converter-edu`, `statistics-calculator`, `matrix-calculator`

### Developer 開發者

- **(LIVE core)** — 19 支已上線：`base64-encoder`, `color-converter`, `color-palette-generator`, `cron-expression`, `csv-to-json`, `diff-checker`, `hash-generator`, `html-encoder`, `ip-calculator`, `json-formatter`, `jwt-decoder`, `markdown-preview`, `markdown-to-html`, `number-base-converter`, `password-generator`, `qr-code-generator`, `regex-tester`, `timestamp-converter`, `url-encoder`
- **COS** (1) — `api-cost-calculator`
- **CSS** (2) — `css-gradient-generator`, `breakpoint-calculator`
- **DAT** (3) — `json-schema-validator`, `xml-to-json`, `unicode-converter`
- **NET** (5) — `cors-tester`, `ssl-cert-checker`, `dns-lookup`, `http-status-codes`, `webhook-tester`
- **SEC** (1) — `jwt-generator`
- **UTL** (4) — `string-hash-calculator`, `lorem-ipsum-generator`, `text-comparison`, `uuid-generator`

### Legal 法律

- **CON** (2) — `penalty-calculator`, `legal-interest-calculator`
- **LAB** (5) — `overtime-calculator`, `severance-pay-calculator`, `annual-leave-calculator`, `minimum-wage-calculator`, `working-hours-calculator`
- **TAX** (1) — `stamp-duty-calculator`
- **TRD** (1) — `import-duty-calculator`

### Design 設計

- **COL** (2) — `contrast-ratio-calculator`, `color-harmony-calculator`
- **LAY** (3) — `golden-ratio-calculator`, `grid-calculator`, `responsive-size-calculator`
- **TYP** (2) — `type-scale-calculator`, `line-height-calculator`

### Science 科學

- **CHM** (5) — `mole-calculator`, `concentration-calculator`, `ph-calculator`, `molecular-weight-calculator`, `dilution-calculator`
- **ELE** (5) — `ohms-law-calculator`, `resistor-calculator`, `capacitor-calculator`, `led-resistor-calculator`, `transformer-calculator`
- **PHY** (5) — `speed-distance-time`, `force-calculator`, `energy-calculator`, `density-calculator`, `power-calculator`

### Language 語言

- **COS** (1) — `translation-cost-calculator`
- **SEO** (1) — `keyword-density-calculator`
- **TXT** (2) — `readability-analyzer`, `content-quality-scorer`

### E-Commerce 電商

- **INV** (5) — `inventory-turnover-calculator`, `safety-stock-calculator`, `eoq-calculator`, `warehouse-cost-calculator`, `reorder-point-calculator`
- **MKT** (4) — `ad-cost-calculator`, `conversion-rate-calculator`, `ltv-calculator`, `cac-calculator`
- **PRC** (3) — `pricing-calculator`, `competitive-pricing-calculator`, `wholesale-pricing-calculator`
- **SHP** (4) — `shipping-cost-calculator`, `packaging-cost-calculator`, `return-rate-calculator`, `delivery-time-calculator`
- **SUB** (2) — `mrr-calculator`, `churn-rate-calculator`

### Travel 旅遊

- **BDG** (6) — `travel-budget-calculator`, `travel-day-counter`, `travel-insurance-calculator`, `hotel-cost-calculator`, `daily-budget-calculator`, `travel-price-comparator`
- **CUR** (2) — `currency-travel-converter`, `purchasing-power-parity`
- **DRV** (2) — `fuel-cost-calculator`, `road-trip-calculator`
- **HLT** (5) — `jet-lag-calculator`, `altitude-sickness-calculator`, `spf-calculator`, `travel-hydration-calculator`, `vaccine-schedule-calculator`
- **LOG** (2) — `luggage-weight-calculator`, `visa-cost-calculator`
- **TIM** (2) — `time-zone-difference`, `flight-time-calculator`

### AI Tools AI 工具

- **COS** (6) — `ai-token-cost-calculator`, `ai-api-cost-estimator`, `ai-project-cost-calculator`, `prompt-token-calculator`, `fine-tuning-cost-calculator`, `chatbot-cost-calculator`
- **MOD** (1) — `ai-model-comparison`
- **PRF** (3) — `ai-accuracy-calculator`, `model-latency-calculator`, `ai-error-rate-calculator`
- **ROI** (5) — `prompt-roi-calculator`, `ai-roi-calculator`, `automation-savings-calculator`, `ai-labor-calculator`, `ai-implementation-roi`

---

## 每 Domain / Sub-domain 飽和規則

- 一般 sub-domain：最多 **6** 個工具。
- 超過 6 個：標記 ⚠️，必須回報 Victor 審核才能續建。
- 新工具歸屬請對照上方語意樹，落在最貼近的 sub-domain。