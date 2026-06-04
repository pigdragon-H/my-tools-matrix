# 🌳 TOOL TRUNK — 工具名單樹幹系統

> Single source of truth for the entire tool roster. Auto-generated from
> `scripts/tool-trunk.json` (via `npm run trunk`). **Do not hand-edit the table** —
> change the registry, then regenerate.

**Total: 100 tools across 5 categories** · generated 2026-06-04T08:55:06.679Z

## The 3 structures every tool keeps in sync (以免衝突)

| # | Structure | What it declares | Conflict gate |
|---|-----------|------------------|---------------|
| A | `shared/toolsConfig.ts` `tools[]` + `export const` | id · category · path · name · export var | Gate 1 (A–D) + Gate 1.5 (dup id / dup const) |
| B | `client/src/pages/ToolPage.tsx` `toolComponentMap` | `"cat/id"` → `@/tools/<cat>/<Comp>` | Gate 1 (E–G) + Gate 1.5 (dup route key / PascalCase) |
| C | `client/src/tools/<cat>/<Comp>/index.tsx` | the actual component dir | Gate 1 (G–H) + Gate 1.5 (cross-cat dup dir) |

### Naming law (enforced)
- `id` is kebab-case, globally unique.
- `path` MUST equal `/tools/<category>/<id>`.
- `export const` var MUST equal `camelCase(id)`.
- component dir MUST equal `PascalCase(id)`, unique across ALL categories.
- route key MUST equal `<category>/<id>`.

### Audit commands
```bash
npm run trunk          # render this tree
npm run trunk:audit    # drift/conflict audit (also runs in preflight Gate 1.5)
npm run trunk:json     # regenerate scripts/tool-trunk.json
npm run validate:registry   # full Gate 1 (3-structure sync)
```

---

## finance/  (64)

| id | component | export const |
|----|-----------|--------------|
| `amortization-schedule-calculator` | `AmortizationScheduleCalculator` | `amortizationScheduleCalculator` |
| `annuity-calculator` | `AnnuityCalculator` | `annuityCalculator` |
| `auto-loan-calculator` | `AutoLoanCalculator` | `autoLoanCalculator` |
| `bond-yield-calculator` | `BondYieldCalculator` | `bondYieldCalculator` |
| `break-even-calculator` | `BreakEvenCalculator` | `breakEvenCalculator` |
| `budget-ratio-calculator` | `BudgetRatioCalculator` | `budgetRatioCalculator` |
| `burn-rate-calculator` | `BurnRateCalculator` | `burnRateCalculator` |
| `cagr-calculator` | `CagrCalculator` | `cagrCalculator` |
| `cap-rate-calculator` | `CapRateCalculator` | `capRateCalculator` |
| `capital-gains-tax-calculator` | `CapitalGainsTaxCalculator` | `capitalGainsTaxCalculator` |
| `cash-flow-calculator` | `CashFlowCalculator` | `cashFlowCalculator` |
| `cd-calculator` | `CdCalculator` | `cdCalculator` |
| `compound-interest-calculator` | `CompoundInterestCalculator` | `compoundInterestCalculator` |
| `credit-card-payoff-calculator` | `CreditCardPayoffCalculator` | `creditCardPayoffCalculator` |
| `currency-converter` | `CurrencyConverter` | `currencyConverter` |
| `debt-payoff-calculator` | `DebtPayoffCalculator` | `debtPayoffCalculator` |
| `debt-snowball-calculator` | `DebtSnowballCalculator` | `debtSnowballCalculator` |
| `debt-to-income-calculator` | `DebtToIncomeCalculator` | `debtToIncomeCalculator` |
| `discount-calculator` | `DiscountCalculator` | `discountCalculator` |
| `dividend-yield-calculator` | `DividendYieldCalculator` | `dividendYieldCalculator` |
| `down-payment-calculator` | `DownPaymentCalculator` | `downPaymentCalculator` |
| `ebitda-calculator` | `EbitdaCalculator` | `ebitdaCalculator` |
| `effective-annual-rate-calculator` | `EffectiveAnnualRateCalculator` | `effectiveAnnualRateCalculator` |
| `emergency-fund-calculator` | `EmergencyFundCalculator` | `emergencyFundCalculator` |
| `financial-ratio-calculator` | `FinancialRatioCalculator` | `financialRatioCalculator` |
| `future-value-calculator` | `FutureValueCalculator` | `futureValueCalculator` |
| `gross-margin-calculator` | `GrossMarginCalculator` | `grossMarginCalculator` |
| `home-affordability-calculator` | `HomeAffordabilityCalculator` | `homeAffordabilityCalculator` |
| `hourly-rate-calculator` | `HourlyRateCalculator` | `hourlyRateCalculator` |
| `inflation-adjuster` | `InflationAdjuster` | `inflationAdjuster` |
| `insurance-premium-calculator` | `InsurancePremiumCalculator` | `insurancePremiumCalculator` |
| `investment-return-calculator` | `InvestmentReturnCalculator` | `investmentReturnCalculator` |
| `lease-vs-buy-calculator` | `LeaseVsBuyCalculator` | `leaseVsBuyCalculator` |
| `loan-calculator` | `LoanCalculator` | `loanCalculator` |
| `markup-calculator` | `MarkupCalculator` | `markupCalculator` |
| `meeting-cost-calculator` | `MeetingCostCalculator` | `meetingCostCalculator` |
| `mortgage-calculator` | `MortgageCalculator` | `mortgageCalculator` |
| `net-present-value-calculator` | `NetPresentValueCalculator` | `netPresentValueCalculator` |
| `net-worth-calculator` | `NetWorthCalculator` | `netWorthCalculator` |
| `options-profit-calculator` | `OptionsProfitCalculator` | `optionsProfitCalculator` |
| `payback-period-calculator` | `PaybackPeriodCalculator` | `paybackPeriodCalculator` |
| `pension-calculator` | `PensionCalculator` | `pensionCalculator` |
| `pomodoro-calculator` | `PomodoroCalculator` | `pomodoroCalculator` |
| `present-value-calculator` | `PresentValueCalculator` | `presentValueCalculator` |
| `profit-margin-calculator` | `ProfitMarginCalculator` | `profitMarginCalculator` |
| `quick-ratio-calculator` | `QuickRatioCalculator` | `quickRatioCalculator` |
| `refinance-calculator` | `RefinanceCalculator` | `refinanceCalculator` |
| `rental-yield-calculator` | `RentalYieldCalculator` | `rentalYieldCalculator` |
| `retirement-401k-calculator` | `Retirement401kCalculator` | `retirement401kCalculator` |
| `retirement-calculator` | `RetirementCalculator` | `retirementCalculator` |
| `roas-calculator` | `RoasCalculator` | `roasCalculator` |
| `roi-payback-calculator` | `RoiPaybackCalculator` | `roiPaybackCalculator` |
| `roth-ira-calculator` | `RothIraCalculator` | `rothIraCalculator` |
| `salary-after-tax-calculator` | `SalaryAfterTaxCalculator` | `salaryAfterTaxCalculator` |
| `sales-tax-calculator` | `SalesTaxCalculator` | `salesTaxCalculator` |
| `savings-goal-calculator` | `SavingsGoalCalculator` | `savingsGoalCalculator` |
| `simple-interest-calculator` | `SimpleInterestCalculator` | `simpleInterestCalculator` |
| `sip-calculator` | `SipCalculator` | `sipCalculator` |
| `stock-profit-calculator` | `StockProfitCalculator` | `stockProfitCalculator` |
| `student-loan-calculator` | `StudentLoanCalculator` | `studentLoanCalculator` |
| `tax-bracket-calculator` | `TaxBracketCalculator` | `taxBracketCalculator` |
| `tip-calculator` | `TipCalculator` | `tipCalculator` |
| `vat-calculator` | `VatCalculator` | `vatCalculator` |
| `working-capital-calculator` | `WorkingCapitalCalculator` | `workingCapitalCalculator` |

## developer/  (19)

| id | component | export const |
|----|-----------|--------------|
| `base64-encoder` | `Base64Encoder` | `base64Encoder` |
| `color-converter` | `ColorConverter` | `colorConverter` |
| `color-palette-generator` | `ColorPaletteGenerator` | `colorPaletteGenerator` |
| `cron-expression` | `CronExpression` | `cronExpression` |
| `csv-to-json` | `CsvToJson` | `csvToJson` |
| `diff-checker` | `DiffChecker` | `diffChecker` |
| `hash-generator` | `HashGenerator` | `hashGenerator` |
| `html-encoder` | `HtmlEncoder` | `htmlEncoder` |
| `ip-calculator` | `IpCalculator` | `ipCalculator` |
| `json-formatter` | `JsonFormatter` | `jsonFormatter` |
| `jwt-decoder` | `JwtDecoder` | `jwtDecoder` |
| `markdown-preview` | `MarkdownPreview` | `markdownPreview` |
| `markdown-to-html` | `MarkdownToHtml` | `markdownToHtml` |
| `number-base-converter` | `NumberBaseConverter` | `numberBaseConverter` |
| `password-generator` | `PasswordGenerator` | `passwordGenerator` |
| `qr-code-generator` | `QrCodeGenerator` | `qrCodeGenerator` |
| `regex-tester` | `RegexTester` | `regexTester` |
| `timestamp-converter` | `TimestampConverter` | `timestampConverter` |
| `url-encoder` | `UrlEncoder` | `urlEncoder` |

## health/  (8)

| id | component | export const |
|----|-----------|--------------|
| `bmi-calculator` | `BmiCalculator` | `bmiCalculator` |
| `bmr-calculator` | `BmrCalculator` | `bmrCalculator` |
| `body-fat-calculator` | `BodyFatCalculator` | `bodyFatCalculator` |
| `calorie-deficit-calculator` | `CalorieDeficitCalculator` | `calorieDeficitCalculator` |
| `ideal-weight-calculator` | `IdealWeightCalculator` | `idealWeightCalculator` |
| `macro-calculator` | `MacroCalculator` | `macroCalculator` |
| `tdee-calculator` | `TdeeCalculator` | `tdeeCalculator` |
| `water-intake-calculator` | `WaterIntakeCalculator` | `waterIntakeCalculator` |

## productivity/  (5)

| id | component | export const |
|----|-----------|--------------|
| `age-calculator` | `AgeCalculator` | `ageCalculator` |
| `date-duration-calculator` | `DateDurationCalculator` | `dateDurationCalculator` |
| `pomodoro-planner` | `PomodoroPlanner` | `pomodoroPlanner` |
| `time-zone-converter` | `TimeZoneConverter` | `timeZoneConverter` |
| `word-counter` | `WordCounter` | `wordCounter` |

## education/  (4)

| id | component | export const |
|----|-----------|--------------|
| `gpa-calculator` | `GpaCalculator` | `gpaCalculator` |
| `grade-calculator` | `GradeCalculator` | `gradeCalculator` |
| `math-percentage-calculator` | `MathPercentageCalculator` | `mathPercentageCalculator` |
| `study-time-calculator` | `StudyTimeCalculator` | `studyTimeCalculator` |
