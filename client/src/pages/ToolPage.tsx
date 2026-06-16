// ============================================================
// ToolPage - /tools/:category/:toolName 工具容器頁
// 根據路由參數動態渲染對應的計算工具組件
// ============================================================

import { useParams, Link, Redirect } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCategoryByKey } from "@shared/categoriesConfig";
import { getToolByPath } from "@shared/toolsConfig";
import { lazy, Suspense, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { setSeoMeta } from "@/lib/seo";
import { useLanguage } from "@/contexts/LanguageContext";

const GOLDEN_SUMMARY_TYPO_SCOPE = {
  mode: "all" as "prototype" | "finance" | "all",
  paths: new Set<string>(["/tools/finance/meeting-cost-calculator"]),
};

function isGoldenSummaryTypographyEnabled(toolPath: string) {
  if (GOLDEN_SUMMARY_TYPO_SCOPE.mode === "all") return true;
  if (GOLDEN_SUMMARY_TYPO_SCOPE.mode === "finance") return toolPath.startsWith("/tools/finance/");
  return GOLDEN_SUMMARY_TYPO_SCOPE.paths.has(toolPath);
}

type ToolConfig = NonNullable<ReturnType<typeof getToolByPath>>;

function titleCaseFromSlug(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((word) => {
      const upperWord = word.toUpperCase();
      if (["AI", "API", "BMI", "BMR", "TDEE", "UTM", "CPM", "CPC", "RGB", "HSL", "JSON", "HTML", "FAQ"].includes(upperWord)) {
        return upperWord;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

function getEnglishToolName(toolConfig: ToolConfig) {
  const configuredNameEn = (toolConfig as ToolConfig & { nameEn?: string }).nameEn;
  if (configuredNameEn && !/[\u3400-\u9fff]/.test(configuredNameEn)) return configuredNameEn;
  const slug = toolConfig.path.split("/").filter(Boolean).at(-1) ?? toolConfig.id;
  return titleCaseFromSlug(slug);
}

// ============================================================
// GSC 歷史路由重導表 (Legacy GSC URL -> 正式 canonical 路徑)
// 背景：下列 URL 已被 Google Search Console 索引，但因前綴/命名漂移
// （dev→developer、tax/realestate/fin→finance、改名、跨分類搬移）
// 現行 registry 已無對應 key，導致軟 404「找不到此工具」。
// 解法：偵測到 legacy key 即客戶端重導至 canonical，保住 link equity、
// 永不 404、永不刪除（符合「GSC URL 全救活」原則）。
// 來源清單：outputs/specs/_GSC_MASTER_RESCUE_MANIFEST（36 支已驗證）
// ============================================================
const LEGACY_TOOL_REDIRECTS: Record<string, string> = {
  // dev → developer
  "developer/json": "/tools/developer/json-formatter",
  "dev/json-formatter": "/tools/developer/json-formatter",
  "developer/color-contrast-checker": "/tools/design/color-contrast-ratio-calculator",
  "developer/hex-to-hsl": "/tools/developer/hex-to-rgb",
  "developer/html-beautifier": "/tools/developer/html-encoder",
  "developer/rgb-to-hex": "/tools/developer/hex-to-rgb",
  "developer/word-counter": "/tools/productivity/word-counter",
  "ecommerce/carrying-cost-calculator": "/tools/ecommerce/inventory-turnover-calculator",
  "ecommerce/cash-conversion-cycle-calculator": "/tools/ecommerce/inventory-turnover-calculator",
  "ecommerce/gross-margin-calculator": "/tools/finance/gross-margin-calculator",
  "ecommerce/margin-calculator": "/tools/finance/profit-margin-calculator",
  "ecommerce/qr-code-generator": "/tools/developer/qr-code-generator",
  "ecommerce/roas-calculator": "/tools/finance/roas-calculator",
  "ecommerce/url-shortener": "/tools/ecommerce/utm-builder",
  "education/age-calculator": "/tools/productivity/age-calculator",
  "education/chinese-zodiac-calculator": "/tools/education/astrology-calculator-edu",
  "education/date-difference-calculator": "/tools/productivity/date-duration-calculator",
  "education/day-of-week-calculator": "/tools/productivity/date-duration-calculator",
  "education/percentile-calculator": "/tools/education/iq-test-calculator",
  "education/reading-speed-test": "/tools/education/reading-speed-calculator",
  "education/standard-deviation-calculator": "/tools/education/iq-test-calculator",
  "education/tuition-cost-calculator": "/tools/education/study-time-calculator",
  "education/z-score-calculator": "/tools/education/iq-test-calculator",
  "finance/car-depreciation-calculator": "/tools/finance/car-depreciation",
  "finance/salary-calculator": "/tools/finance/salary-after-tax-calculator",
  "finance/take-home-pay-calculator": "/tools/finance/salary-after-tax-calculator",
  "health/cholesterol-ratio-calculator": "/tools/health/heart-disease-risk-calculator",
  "health/pregnancy-weight-calculator": "/tools/health/due-date-calculator",
  "health/target-heart-rate-calculator": "/tools/health/heart-rate-calculator",
  "legal/overtime-pay-calculator": "/tools/legal/overtime-calculator",
  "productivity/working-hours-calculator": "/tools/legal/working-hours-calculator",
  "travel/baggage-fee-calculator": "/tools/travel/luggage-weight-calculator",
  "travel/trip-budget-calculator": "/tools/travel/travel-budget-calculator",
  // tax → finance
  "tax/estate-tax-calculator": "/tools/finance/estate-tax-calculator",
  "tax/gift-tax-calculator": "/tools/finance/gift-tax-calculator",
  "tax/tax-refund-calculator": "/tools/finance/tax-refund-calculator",
  // realestate → finance
  "realestate/down-payment-calculator": "/tools/finance/down-payment-calculator",
  "realestate/home-affordability-calculator": "/tools/finance/home-affordability-calculator",
  // health slug 改名
  "health/maximum-heart-rate-calculator": "/tools/health/max-heart-rate-calculator",
  "health/protein-intake-calculator": "/tools/health/protein-calculator",
  // 跨分類搬移
  "productivity/typing-speed-calculator": "/tools/education/typing-speed-calculator",
  "finance/churn-rate-calculator": "/tools/ecommerce/churn-rate-calculator",
  // fin → finance
  "fin/affordability-calculator": "/tools/finance/affordability-calculator",
  "fin/cagr-calculator": "/tools/finance/cagr-calculator",
  "fin/debt-payoff-calculator": "/tools/finance/debt-payoff-calculator",
  "fin/dividend-yield-calculator": "/tools/finance/dividend-yield-calculator",
  // design 近似對應（Victor 核准）
  "design/css-grid-flexbox-generator": "/tools/design/grid-layout-calculator",
  // Batch 3 重建：dev → developer
  "dev/hex-to-rgb": "/tools/developer/hex-to-rgb",
  "dev/html-to-markdown": "/tools/developer/html-to-markdown",
  // GSC rescue：marketing → ecommerce（保留 GSC 已索引前綴）
  "marketing/cpm-calculator": "/tools/ecommerce/cpm-calculator",
};

// 工具組件映射（懶加載）
const toolComponentMap: Record<string, React.LazyExoticComponent<() => React.ReactElement>> = {
  "health/bmi-calculator": lazy(() => import("@/tools/health/BmiCalculator")),
  "health/bmr-calculator": lazy(() => import("@/tools/health/BmrCalculator")),
  "health/tdee-calculator": lazy(() => import("@/tools/health/TdeeCalculator")),
  "health/ideal-weight-calculator": lazy(() => import("@/tools/health/IdealWeightCalculator")),
  "health/body-fat-calculator": lazy(() => import("@/tools/health/BodyFatCalculator")),
  "health/calorie-deficit-calculator": lazy(() => import("@/tools/health/CalorieDeficitCalculator")),
  "health/water-intake-calculator": lazy(() => import("@/tools/health/WaterIntakeCalculator")),
  "health/macro-calculator": lazy(() => import("@/tools/health/MacroCalculator")),
  "finance/inflation-adjuster": lazy(() => import("@/tools/finance/InflationAdjuster")),
  "finance/loan-calculator": lazy(() => import("@/tools/finance/LoanCalculator")),
  "finance/mortgage-calculator": lazy(() => import("@/tools/finance/MortgageCalculator")),
  "finance/credit-card-payoff-calculator": lazy(() => import("@/tools/finance/CreditCardPayoffCalculator")),
  "finance/debt-to-income-calculator": lazy(() => import("@/tools/finance/DebtToIncomeCalculator")),
  "finance/compound-interest-calculator": lazy(() => import("@/tools/finance/CompoundInterestCalculator")),
  "finance/retirement-calculator": lazy(() => import("@/tools/finance/RetirementCalculator")),
  "finance/cagr-calculator": lazy(() => import("@/tools/finance/CagrCalculator")),
  "finance/savings-goal-calculator": lazy(() => import("@/tools/finance/SavingsGoalCalculator")),
  "finance/net-worth-calculator": lazy(() => import("@/tools/finance/NetWorthCalculator")),
  "finance/debt-payoff-calculator": lazy(() => import("@/tools/finance/DebtPayoffCalculator")),
  "finance/budget-ratio-calculator": lazy(() => import("@/tools/finance/BudgetRatioCalculator")),
  "finance/emergency-fund-calculator": lazy(() => import("@/tools/finance/EmergencyFundCalculator")),
  "finance/salary-after-tax-calculator": lazy(() => import("@/tools/finance/SalaryAfterTaxCalculator")),
  "finance/hourly-rate-calculator": lazy(() => import("@/tools/finance/HourlyRateCalculator")),
  "finance/meeting-cost-calculator": lazy(() => import("@/tools/finance/MeetingCostCalculator")),
  "finance/pomodoro-calculator": lazy(() => import("@/tools/finance/PomodoroCalculator")),
  "finance/profit-margin-calculator": lazy(() => import("@/tools/finance/ProfitMarginCalculator")),
  "finance/roas-calculator": lazy(() => import("@/tools/finance/RoasCalculator")),
  "productivity/pomodoro-planner": lazy(() => import("@/tools/productivity/PomodoroPlanner")),
  "productivity/time-zone-converter": lazy(() => import("@/tools/productivity/TimeZoneConverter")),
  "productivity/word-counter": lazy(() => import("@/tools/productivity/WordCounter")),
  "productivity/date-duration-calculator": lazy(() => import("@/tools/productivity/DateDurationCalculator")),
  "productivity/age-calculator": lazy(() => import("@/tools/productivity/AgeCalculator")),
  "developer/json-formatter": lazy(() => import("@/tools/developer/JsonFormatter")),
  "developer/base64-encoder": lazy(() => import("@/tools/developer/Base64Encoder")),
  "developer/url-encoder": lazy(() => import("@/tools/developer/UrlEncoder")),
  "developer/regex-tester": lazy(() => import("@/tools/developer/RegexTester")),
  "developer/color-converter": lazy(() => import("@/tools/developer/ColorConverter")),
  "developer/timestamp-converter": lazy(() => import("@/tools/developer/TimestampConverter")),
  "developer/markdown-preview": lazy(() => import("@/tools/developer/MarkdownPreview")),
  "developer/diff-checker": lazy(() => import("@/tools/developer/DiffChecker")),
  "developer/csv-to-json": lazy(() => import("@/tools/developer/CsvToJson")),
  "developer/hash-generator": lazy(() => import("@/tools/developer/HashGenerator")),
  "developer/html-encoder": lazy(() => import("@/tools/developer/HtmlEncoder")),
  "developer/jwt-decoder": lazy(() => import("@/tools/developer/JwtDecoder")),
  "education/gpa-calculator": lazy(() => import("@/tools/education/GpaCalculator")),
  "education/grade-calculator": lazy(() => import("@/tools/education/GradeCalculator")),
  "education/study-time-calculator": lazy(() => import("@/tools/education/StudyTimeCalculator")),
  "education/math-percentage-calculator": lazy(() => import("@/tools/education/MathPercentageCalculator")),
  "developer/cron-expression": lazy(() => import("@/tools/developer/CronExpression")),
  "developer/ip-calculator": lazy(() => import("@/tools/developer/IpCalculator")),
  "developer/color-palette-generator": lazy(() => import("@/tools/developer/ColorPaletteGenerator")),
  "developer/password-generator": lazy(() => import("@/tools/developer/PasswordGenerator")),
  "developer/qr-code-generator": lazy(() => import("@/tools/developer/QrCodeGenerator")),
  "developer/markdown-to-html": lazy(() => import("@/tools/developer/MarkdownToHtml")),
  "developer/number-base-converter": lazy(() => import("@/tools/developer/NumberBaseConverter")),
  "finance/tax-bracket-calculator": lazy(() => import("@/tools/finance/TaxBracketCalculator")),
  "finance/investment-return-calculator": lazy(() => import("@/tools/finance/InvestmentReturnCalculator")),
  "finance/break-even-calculator": lazy(() => import("@/tools/finance/BreakEvenCalculator")),
  "finance/currency-converter": lazy(() => import("@/tools/finance/CurrencyConverter")),
  "finance/stock-profit-calculator": lazy(() => import("@/tools/finance/StockProfitCalculator")),
  "finance/rental-yield-calculator": lazy(() => import("@/tools/finance/RentalYieldCalculator")),
  "finance/insurance-premium-calculator": lazy(() => import("@/tools/finance/InsurancePremiumCalculator")),
  "finance/pension-calculator": lazy(() => import("@/tools/finance/PensionCalculator")),
  "finance/bond-yield-calculator": lazy(() => import("@/tools/finance/BondYieldCalculator")),
  "finance/options-profit-calculator": lazy(() => import("@/tools/finance/OptionsProfitCalculator")),
  "finance/dividend-yield-calculator": lazy(() => import("@/tools/finance/DividendYieldCalculator")),
  "finance/net-present-value-calculator": lazy(() => import("@/tools/finance/NetPresentValueCalculator")),
  "finance/payback-period-calculator": lazy(() => import("@/tools/finance/PaybackPeriodCalculator")),
  "finance/cash-flow-calculator": lazy(() => import("@/tools/finance/CashFlowCalculator")),
  "finance/financial-ratio-calculator": lazy(() => import("@/tools/finance/FinancialRatioCalculator")),
  "finance/amortization-schedule-calculator": lazy(() => import("@/tools/finance/AmortizationScheduleCalculator")),
  "finance/capital-gains-tax-calculator": lazy(() => import("@/tools/finance/CapitalGainsTaxCalculator")),
  "finance/sales-tax-calculator": lazy(() => import("@/tools/finance/SalesTaxCalculator")),
  "finance/tip-calculator": lazy(() => import("@/tools/finance/TipCalculator")),
  "finance/discount-calculator": lazy(() => import("@/tools/finance/DiscountCalculator")),
  "finance/markup-calculator": lazy(() => import("@/tools/finance/MarkupCalculator")),
  "finance/vat-calculator": lazy(() => import("@/tools/finance/VatCalculator")),
  "finance/effective-annual-rate-calculator": lazy(() => import("@/tools/finance/EffectiveAnnualRateCalculator")),
  "finance/simple-interest-calculator": lazy(() => import("@/tools/finance/SimpleInterestCalculator")),
  "finance/future-value-calculator": lazy(() => import("@/tools/finance/FutureValueCalculator")),
  "finance/present-value-calculator": lazy(() => import("@/tools/finance/PresentValueCalculator")),
  "finance/annuity-calculator": lazy(() => import("@/tools/finance/AnnuityCalculator")),
  "finance/lease-vs-buy-calculator": lazy(() => import("@/tools/finance/LeaseVsBuyCalculator")),
  "finance/refinance-calculator": lazy(() => import("@/tools/finance/RefinanceCalculator")),
  "finance/home-affordability-calculator": lazy(() => import("@/tools/finance/HomeAffordabilityCalculator")),
  "finance/student-loan-calculator": lazy(() => import("@/tools/finance/StudentLoanCalculator")),
  "finance/auto-loan-calculator": lazy(() => import("@/tools/finance/AutoLoanCalculator")),
  "finance/down-payment-calculator": lazy(() => import("@/tools/finance/DownPaymentCalculator")),
  "finance/retirement-401k-calculator": lazy(() => import("@/tools/finance/Retirement401kCalculator")),
  "finance/roth-ira-calculator": lazy(() => import("@/tools/finance/RothIraCalculator")),
  "finance/sip-calculator": lazy(() => import("@/tools/finance/SipCalculator")),
  "finance/cd-calculator": lazy(() => import("@/tools/finance/CdCalculator")),
  "finance/cap-rate-calculator": lazy(() => import("@/tools/finance/CapRateCalculator")),
  "finance/debt-snowball-calculator": lazy(() => import("@/tools/finance/DebtSnowballCalculator")),
  "finance/gross-margin-calculator": lazy(() => import("@/tools/finance/GrossMarginCalculator")),
  "finance/ebitda-calculator": lazy(() => import("@/tools/finance/EbitdaCalculator")),
  "finance/working-capital-calculator": lazy(() => import("@/tools/finance/WorkingCapitalCalculator")),
  "finance/quick-ratio-calculator": lazy(() => import("@/tools/finance/QuickRatioCalculator")),
  "finance/roi-payback-calculator": lazy(() => import("@/tools/finance/RoiPaybackCalculator")),
  "finance/burn-rate-calculator": lazy(() => import("@/tools/finance/BurnRateCalculator")),
  "finance/withdrawal-rate-calculator": lazy(() => import("@/tools/finance/WithdrawalRateCalculator")),
  "finance/coast-fire-calculator": lazy(() => import("@/tools/finance/CoastFireCalculator")),
  "finance/fire-number-calculator": lazy(() => import("@/tools/finance/FireNumberCalculator")),
  "finance/social-security-calculator": lazy(() => import("@/tools/finance/SocialSecurityCalculator")),
  "finance/roth-conversion-calculator": lazy(() => import("@/tools/finance/RothConversionCalculator")),
  "finance/ltv-ratio-calculator": lazy(() => import("@/tools/finance/LtvRatioCalculator")),
  "finance/home-equity-calculator": lazy(() => import("@/tools/finance/HomeEquityCalculator")),
  "finance/rent-vs-buy-calculator": lazy(() => import("@/tools/finance/RentVsBuyCalculator")),
  "finance/closing-cost-calculator": lazy(() => import("@/tools/finance/ClosingCostCalculator")),
  "finance/property-tax-calculator": lazy(() => import("@/tools/finance/PropertyTaxCalculator")),
  "finance/capital-gains-calculator": lazy(() => import("@/tools/finance/CapitalGainsCalculator")),
  "finance/estate-tax-calculator": lazy(() => import("@/tools/finance/EstateTaxCalculator")),
  "finance/tax-withholding-calculator": lazy(() => import("@/tools/finance/TaxWithholdingCalculator")),
  "finance/tax-loss-harvesting": lazy(() => import("@/tools/finance/TaxLossHarvesting")),
  "finance/purchasing-power-calculator": lazy(() => import("@/tools/finance/PurchasingPowerCalculator")),
  "finance/pe-ratio-calculator": lazy(() => import("@/tools/finance/PeRatioCalculator")),
  "finance/eps-calculator": lazy(() => import("@/tools/finance/EpsCalculator")),
  "finance/sharpe-ratio-calculator": lazy(() => import("@/tools/finance/SharpeRatioCalculator")),
  "finance/beta-calculator": lazy(() => import("@/tools/finance/BetaCalculator")),
  "finance/capm-calculator": lazy(() => import("@/tools/finance/CapmCalculator")),
  "finance/price-to-book-calculator": lazy(() => import("@/tools/finance/PriceToBookCalculator")),
  "finance/book-value-calculator": lazy(() => import("@/tools/finance/BookValueCalculator")),
  "finance/risk-tolerance-calculator": lazy(() => import("@/tools/finance/RiskToleranceCalculator")),
  "finance/real-return-calculator": lazy(() => import("@/tools/finance/RealReturnCalculator")),
  "finance/portfolio-rebalance-calculator": lazy(() => import("@/tools/finance/PortfolioRebalanceCalculator")),
  "finance/dollar-cost-averaging": lazy(() => import("@/tools/finance/DollarCostAveraging")),
  "finance/rule-of-72-calculator": lazy(() => import("@/tools/finance/RuleOf72Calculator")),
  "finance/ltv-cac-ratio-calculator": lazy(() => import("@/tools/finance/LtvCacRatioCalculator")),
  "finance/saas-metrics-calculator": lazy(() => import("@/tools/finance/SaasMetricsCalculator")),
  "finance/startup-runway-calculator": lazy(() => import("@/tools/finance/StartupRunwayCalculator")),
  "health/waist-hip-ratio-calculator": lazy(() => import("@/tools/health/WaistHipRatioCalculator")),
  "health/weight-trend-calculator": lazy(() => import("@/tools/health/WeightTrendCalculator")),
  "health/calorie-burn-calculator": lazy(() => import("@/tools/health/CalorieBurnCalculator")),
  "health/exercise-calories-calculator": lazy(() => import("@/tools/health/ExerciseCaloriesCalculator")),
  "health/max-heart-rate-calculator": lazy(() => import("@/tools/health/MaxHeartRateCalculator")),
  "health/one-rep-max-calculator": lazy(() => import("@/tools/health/OneRepMaxCalculator")),
  "health/running-pace-calculator": lazy(() => import("@/tools/health/RunningPaceCalculator")),
  "health/swimming-calories-calculator": lazy(() => import("@/tools/health/SwimmingCaloriesCalculator")),
  "health/workout-plan-calculator": lazy(() => import("@/tools/health/WorkoutPlanCalculator")),
  "health/protein-calculator": lazy(() => import("@/tools/health/ProteinCalculator")),
  "health/intermittent-fasting-calculator": lazy(() => import("@/tools/health/IntermittentFastingCalculator")),
  "health/alcohol-calories-calculator": lazy(() => import("@/tools/health/AlcoholCaloriesCalculator")),
  "health/caffeine-intake-calculator": lazy(() => import("@/tools/health/CaffeineIntakeCalculator")),
  "health/vitamin-d-calculator": lazy(() => import("@/tools/health/VitaminDCalculator")),
  "health/glycemic-index-calculator": lazy(() => import("@/tools/health/GlycemicIndexCalculator")),
  "health/sleep-cycle-calculator": lazy(() => import("@/tools/health/SleepCycleCalculator")),
  "health/blood-pressure-analyzer": lazy(() => import("@/tools/health/BloodPressureAnalyzer")),
  "health/pregnancy-week-calculator": lazy(() => import("@/tools/health/PregnancyWeekCalculator")),
  "health/ovulation-calculator": lazy(() => import("@/tools/health/OvulationCalculator")),
  "health/vision-prescription-converter": lazy(() => import("@/tools/health/VisionPrescriptionConverter")),
  "health/biological-age-calculator": lazy(() => import("@/tools/health/BiologicalAgeCalculator")),
  "health/diabetes-risk-calculator": lazy(() => import("@/tools/health/DiabetesRiskCalculator")),
  "health/heart-disease-risk-calculator": lazy(() => import("@/tools/health/HeartDiseaseRiskCalculator")),
  "health/life-expectancy-calculator": lazy(() => import("@/tools/health/LifeExpectancyCalculator")),
  "health/cancer-risk-calculator": lazy(() => import("@/tools/health/CancerRiskCalculator")),
  "health/stress-index-calculator": lazy(() => import("@/tools/health/StressIndexCalculator")),
  "ecommerce/inventory-turnover-calculator": lazy(() => import("@/tools/ecommerce/InventoryTurnoverCalculator")),
  "ecommerce/safety-stock-calculator": lazy(() => import("@/tools/ecommerce/SafetyStockCalculator")),
  "ecommerce/eoq-calculator": lazy(() => import("@/tools/ecommerce/EoqCalculator")),
  "ecommerce/warehouse-cost-calculator": lazy(() => import("@/tools/ecommerce/WarehouseCostCalculator")),
  "legal/penalty-calculator": lazy(() => import("@/tools/legal/PenaltyCalculator")),
  "legal/legal-interest-calculator": lazy(() => import("@/tools/legal/LegalInterestCalculator")),
  "legal/overtime-calculator": lazy(() => import("@/tools/legal/OvertimeCalculator")),
  "legal/severance-pay-calculator": lazy(() => import("@/tools/legal/SeverancePayCalculator")),
  "legal/annual-leave-calculator": lazy(() => import("@/tools/legal/AnnualLeaveCalculator")),
  "legal/minimum-wage-calculator": lazy(() => import("@/tools/legal/MinimumWageCalculator")),
  "legal/working-hours-calculator": lazy(() => import("@/tools/legal/WorkingHoursCalculator")),
  "legal/stamp-duty-calculator": lazy(() => import("@/tools/legal/StampDutyCalculator")),
  "legal/import-duty-calculator": lazy(() => import("@/tools/legal/ImportDutyCalculator")),
  "ecommerce/reorder-point-calculator": lazy(() => import("@/tools/ecommerce/ReorderPointCalculator")),
  "ecommerce/ad-cost-calculator": lazy(() => import("@/tools/ecommerce/AdCostCalculator")),
  "ecommerce/conversion-rate-calculator": lazy(() => import("@/tools/ecommerce/ConversionRateCalculator")),
  "ecommerce/ltv-calculator": lazy(() => import("@/tools/ecommerce/LtvCalculator")),
  "ecommerce/cac-calculator": lazy(() => import("@/tools/ecommerce/CacCalculator")),
  "ecommerce/pricing-calculator": lazy(() => import("@/tools/ecommerce/PricingCalculator")),
  "ecommerce/competitive-pricing-calculator": lazy(() => import("@/tools/ecommerce/CompetitivePricingCalculator")),
  "ecommerce/wholesale-pricing-calculator": lazy(() => import("@/tools/ecommerce/WholesalePricingCalculator")),
  "ecommerce/shipping-cost-calculator": lazy(() => import("@/tools/ecommerce/ShippingCostCalculator")),
  "ecommerce/packaging-cost-calculator": lazy(() => import("@/tools/ecommerce/PackagingCostCalculator")),
  "ecommerce/return-rate-calculator": lazy(() => import("@/tools/ecommerce/ReturnRateCalculator")),
  "ecommerce/delivery-time-calculator": lazy(() => import("@/tools/ecommerce/DeliveryTimeCalculator")),
  "ecommerce/mrr-calculator": lazy(() => import("@/tools/ecommerce/MrrCalculator")),
  "ecommerce/churn-rate-calculator": lazy(() => import("@/tools/ecommerce/ChurnRateCalculator")),
  "travel/travel-budget-calculator": lazy(() => import("@/tools/travel/TravelBudgetCalculator")),
  "travel/travel-day-counter": lazy(() => import("@/tools/travel/TravelDayCounter")),
  "travel/travel-insurance-calculator": lazy(() => import("@/tools/travel/TravelInsuranceCalculator")),
  "travel/hotel-cost-calculator": lazy(() => import("@/tools/travel/HotelCostCalculator")),
  "travel/daily-budget-calculator": lazy(() => import("@/tools/travel/DailyBudgetCalculator")),
  "travel/travel-price-comparator": lazy(() => import("@/tools/travel/TravelPriceComparator")),
  "travel/currency-travel-converter": lazy(() => import("@/tools/travel/CurrencyTravelConverter")),
  "travel/purchasing-power-parity": lazy(() => import("@/tools/travel/PurchasingPowerParity")),
  "travel/fuel-cost-calculator": lazy(() => import("@/tools/travel/FuelCostCalculator")),
  "travel/road-trip-calculator": lazy(() => import("@/tools/travel/RoadTripCalculator")),
  "travel/jet-lag-calculator": lazy(() => import("@/tools/travel/JetLagCalculator")),
  "travel/altitude-sickness-calculator": lazy(() => import("@/tools/travel/AltitudeSicknessCalculator")),
  "travel/spf-calculator": lazy(() => import("@/tools/travel/SpfCalculator")),
  "travel/travel-hydration-calculator": lazy(() => import("@/tools/travel/TravelHydrationCalculator")),
  "travel/vaccine-schedule-calculator": lazy(() => import("@/tools/travel/VaccineScheduleCalculator")),
  "travel/luggage-weight-calculator": lazy(() => import("@/tools/travel/LuggageWeightCalculator")),
  "travel/visa-cost-calculator": lazy(() => import("@/tools/travel/VisaCostCalculator")),
  "travel/time-zone-difference": lazy(() => import("@/tools/travel/TimeZoneDifference")),
  "travel/flight-time-calculator": lazy(() => import("@/tools/travel/FlightTimeCalculator")),
  "ai/ai-token-cost-calculator": lazy(() => import("@/tools/ai/AiTokenCostCalculator")),
  "ai/ai-api-cost-estimator": lazy(() => import("@/tools/ai/AiApiCostEstimator")),
  "ai/ai-project-cost-calculator": lazy(() => import("@/tools/ai/AiProjectCostCalculator")),
  "ai/prompt-token-calculator": lazy(() => import("@/tools/ai/PromptTokenCalculator")),
  "ai/fine-tuning-cost-calculator": lazy(() => import("@/tools/ai/FineTuningCostCalculator")),
  "ai/chatbot-cost-calculator": lazy(() => import("@/tools/ai/ChatbotCostCalculator")),
  "ai/ai-model-comparison": lazy(() => import("@/tools/ai/AiModelComparison")),
  "ai/ai-accuracy-calculator": lazy(() => import("@/tools/ai/AiAccuracyCalculator")),
  "ai/model-latency-calculator": lazy(() => import("@/tools/ai/ModelLatencyCalculator")),
  "ai/ai-error-rate-calculator": lazy(() => import("@/tools/ai/AiErrorRateCalculator")),
  "ai/prompt-roi-calculator": lazy(() => import("@/tools/ai/PromptRoiCalculator")),
  "ai/ai-roi-calculator": lazy(() => import("@/tools/ai/AiRoiCalculator")),
  "ai/automation-savings-calculator": lazy(() => import("@/tools/ai/AutomationSavingsCalculator")),
  "ai/ai-labor-calculator": lazy(() => import("@/tools/ai/AiLaborCalculator")),
  "ai/ai-implementation-roi": lazy(() => import("@/tools/ai/AiImplementationRoi")),
  "design/color-contrast-ratio-calculator": lazy(() => import("@/tools/design/ColorContrastRatioCalculator")),
  "design/golden-ratio-calculator": lazy(() => import("@/tools/design/GoldenRatioCalculator")),
  "design/aspect-ratio-calculator": lazy(() => import("@/tools/design/AspectRatioCalculator")),
  "design/type-scale-calculator": lazy(() => import("@/tools/design/TypeScaleCalculator")),
  "design/px-rem-converter": lazy(() => import("@/tools/design/PxRemConverter")),
  "design/grid-layout-calculator": lazy(() => import("@/tools/design/GridLayoutCalculator")),
  "design/line-height-calculator": lazy(() => import("@/tools/design/LineHeightCalculator")),
  "science/unit-converter-calculator": lazy(() => import("@/tools/science/UnitConverterCalculator")),
  "science/force-calculator": lazy(() => import("@/tools/science/ForceCalculator")),
  "science/kinetic-energy-calculator": lazy(() => import("@/tools/science/KineticEnergyCalculator")),
  "science/ohms-law-calculator": lazy(() => import("@/tools/science/OhmsLawCalculator")),
  "science/density-calculator": lazy(() => import("@/tools/science/DensityCalculator")),
  "science/molarity-calculator": lazy(() => import("@/tools/science/MolarityCalculator")),
  "science/speed-distance-time-calculator": lazy(() => import("@/tools/science/SpeedDistanceTimeCalculator")),
  "science/acceleration-calculator": lazy(() => import("@/tools/science/AccelerationCalculator")),
  "science/pressure-calculator": lazy(() => import("@/tools/science/PressureCalculator")),
  "science/power-calculator": lazy(() => import("@/tools/science/PowerCalculator")),
  "science/wavelength-frequency-calculator": lazy(() => import("@/tools/science/WavelengthFrequencyCalculator")),
  "science/ideal-gas-law-calculator": lazy(() => import("@/tools/science/IdealGasLawCalculator")),
  "science/ph-calculator": lazy(() => import("@/tools/science/PhCalculator")),
  "science/heat-energy-calculator": lazy(() => import("@/tools/science/HeatEnergyCalculator")),
  "science/voltage-drop-calculator": lazy(() => import("@/tools/science/VoltageDropCalculator")),
  "language/synonym-finder": lazy(() => import("@/tools/language/SynonymFinder")),
  "language/antonym-finder": lazy(() => import("@/tools/language/AntonymFinder")),
  "language/rhyme-finder": lazy(() => import("@/tools/language/RhymeFinder")),
  "language/anagram-solver": lazy(() => import("@/tools/language/AnagramSolver")),
  "language/word-association-finder": lazy(() => import("@/tools/language/WordAssociationFinder")),
  "language/collocation-finder": lazy(() => import("@/tools/language/CollocationFinder")),
  "language/phrasal-verb-finder": lazy(() => import("@/tools/language/PhrasalVerbFinder")),
  "language/idiom-explainer": lazy(() => import("@/tools/language/IdiomExplainer")),
  "language/cefr-level-estimator": lazy(() => import("@/tools/language/CefrLevelEstimator")),
  "language/vocabulary-dna-engine": lazy(() => import("@/tools/language/VocabularyDnaEngine")),
  "language/word-unscrambler": lazy(() => import("@/tools/language/WordUnscrambler")),
  "language/word-finder": lazy(() => import("@/tools/language/WordFinder")),
  "language/scrabble-word-checker": lazy(() => import("@/tools/language/ScrabbleWordChecker")),
  "language/hangman-solver": lazy(() => import("@/tools/language/HangmanSolver")),
  "language/word-root-analyzer": lazy(() => import("@/tools/language/WordRootAnalyzer")),
  "language/irregular-verb-finder": lazy(() => import("@/tools/language/IrregularVerbFinder")),
  "language/word-family-explorer": lazy(() => import("@/tools/language/WordFamilyExplorer")),
  "language/homophone-finder": lazy(() => import("@/tools/language/HomophoneFinder")),
  "language/ielts-vocabulary-analyzer": lazy(() => import("@/tools/language/IeltsVocabularyAnalyzer")),
  "language/toeic-score-estimator": lazy(() => import("@/tools/language/ToeicScoreEstimator")),
  "finance/percentage-calculator": lazy(() => import("@/tools/finance/PercentageCalculator")),
  "finance/gst-calculator": lazy(() => import("@/tools/finance/GstCalculator")),
  "finance/gold-silver-price-calculator": lazy(() => import("@/tools/finance/GoldSilverPriceCalculator")),
  "finance/crypto-profit-calculator": lazy(() => import("@/tools/finance/CryptoProfitCalculator")),
  "finance/lottery-tax-calculator": lazy(() => import("@/tools/finance/LotteryTaxCalculator")),
  "finance/currency-exchange-rate": lazy(() => import("@/tools/finance/CurrencyExchangeRate")),
  "health/due-date-calculator": lazy(() => import("@/tools/health/DueDateCalculator")),
  "health/period-cycle-calculator": lazy(() => import("@/tools/health/PeriodCycleCalculator")),
  "health/steps-to-calories-calculator": lazy(() => import("@/tools/health/StepsToCaloriesCalculator")),
  "health/calories-burned-activity": lazy(() => import("@/tools/health/CaloriesBurnedActivity")),
  "health/blood-sugar-converter": lazy(() => import("@/tools/health/BloodSugarConverter")),
  "health/child-growth-percentile": lazy(() => import("@/tools/health/ChildGrowthPercentile")),
  "health/sobriety-calculator": lazy(() => import("@/tools/health/SobrietyCalculator")),
  "developer/uuid-generator": lazy(() => import("@/tools/developer/UuidGenerator")),
  "developer/lorem-ipsum-generator": lazy(() => import("@/tools/developer/LoremIpsumGenerator")),
  "developer/code-minifier": lazy(() => import("@/tools/developer/CodeMinifier")),
  "developer/image-to-base64": lazy(() => import("@/tools/developer/ImageToBase64")),
  "developer/chmod-calculator": lazy(() => import("@/tools/developer/ChmodCalculator")),
  "education/reading-speed-calculator": lazy(() => import("@/tools/education/ReadingSpeedCalculator")),
  "education/exam-score-converter": lazy(() => import("@/tools/education/ExamScoreConverter")),
  "education/typing-speed-calculator": lazy(() => import("@/tools/education/TypingSpeedCalculator")),
  "education/spaced-repetition-calculator": lazy(() => import("@/tools/education/SpacedRepetitionCalculator")),
  "productivity/deadline-countdown-calculator": lazy(() => import("@/tools/productivity/DeadlineCountdownCalculator")),
  "productivity/hours-calculator": lazy(() => import("@/tools/productivity/HoursCalculator")),
  "productivity/task-priority-matrix": lazy(() => import("@/tools/productivity/TaskPriorityMatrix")),
  "ecommerce/amazon-fba-calculator": lazy(() => import("@/tools/ecommerce/AmazonFbaCalculator")),
  "ecommerce/dropshipping-profit-calculator": lazy(() => import("@/tools/ecommerce/DropshippingProfitCalculator")),
  "ecommerce/etsy-fee-calculator": lazy(() => import("@/tools/ecommerce/EtsyFeeCalculator")),
  "travel/flight-carbon-calculator": lazy(() => import("@/tools/travel/FlightCarbonCalculator")),
  "travel/travel-miles-calculator": lazy(() => import("@/tools/travel/TravelMilesCalculator")),
  "finance/affordability-calculator": lazy(() => import("@/tools/finance/AffordabilityCalculator")),
  "finance/asset-depreciation": lazy(() => import("@/tools/finance/AssetDepreciation")),
  "finance/budget-planner": lazy(() => import("@/tools/finance/BudgetPlanner")),
  "finance/car-depreciation": lazy(() => import("@/tools/finance/CarDepreciation")),
  "finance/compound-interest-pro-calculator": lazy(() => import("@/tools/finance/CompoundInterestProCalculator")),
  "finance/corporate-tax-calculator": lazy(() => import("@/tools/finance/CorporateTaxCalculator")),
  "finance/credit-score-calculator": lazy(() => import("@/tools/finance/CreditScoreCalculator")),
  "finance/cross-rate-calculator": lazy(() => import("@/tools/finance/CrossRateCalculator")),
  "finance/crypto-dca-backtest": lazy(() => import("@/tools/finance/CryptoDcaBacktest")),
  "finance/currency-converter-pro": lazy(() => import("@/tools/finance/CurrencyConverterPro")),
  "finance/dividend-reinvestment": lazy(() => import("@/tools/finance/DividendReinvestment")),
  "finance/emi-calculator": lazy(() => import("@/tools/finance/EmiCalculator")),
  "finance/exchange-rate-calculator": lazy(() => import("@/tools/finance/ExchangeRateCalculator")),
  "finance/fire-calculator": lazy(() => import("@/tools/finance/FireCalculator")),
  "finance/forex-profit-calculator": lazy(() => import("@/tools/finance/ForexProfitCalculator")),
  "finance/gift-tax-calculator": lazy(() => import("@/tools/finance/GiftTaxCalculator")),
  "finance/gold-price-calculator": lazy(() => import("@/tools/finance/GoldPriceCalculator")),
  "finance/income-tax-calculator": lazy(() => import("@/tools/finance/IncomeTaxCalculator")),
  "finance/inflation-calculator": lazy(() => import("@/tools/finance/InflationCalculator")),
  "finance/interest-rate-calculator": lazy(() => import("@/tools/finance/InterestRateCalculator")),
  "finance/irr-npv-calculator": lazy(() => import("@/tools/finance/IrrNpvCalculator")),
  "finance/land-value-calculator": lazy(() => import("@/tools/finance/LandValueCalculator")),
  "finance/mortgage-amortization-calculator": lazy(() => import("@/tools/finance/MortgageAmortizationCalculator")),
  "finance/moving-cost-calculator": lazy(() => import("@/tools/finance/MovingCostCalculator")),
  "finance/personal-loan-calculator": lazy(() => import("@/tools/finance/PersonalLoanCalculator")),
  "finance/pip-value-calculator": lazy(() => import("@/tools/finance/PipValueCalculator")),
  "finance/property-roi-calculator": lazy(() => import("@/tools/finance/PropertyRoiCalculator")),
  "finance/retirement-savings-calculator": lazy(() => import("@/tools/finance/RetirementSavingsCalculator")),
  "finance/roi-calculator": lazy(() => import("@/tools/finance/RoiCalculator")),
  "finance/stock-profit-loss-calculator": lazy(() => import("@/tools/finance/StockProfitLossCalculator")),
  "finance/stock-return-calculator": lazy(() => import("@/tools/finance/StockReturnCalculator")),
  "finance/tax-refund-calculator": lazy(() => import("@/tools/finance/TaxRefundCalculator")),
  "finance/utility-cost-calculator": lazy(() => import("@/tools/finance/UtilityCostCalculator")),
  "finance/withholding-tax-calculator": lazy(() => import("@/tools/finance/WithholdingTaxCalculator")),
  "health/alcohol-calculator": lazy(() => import("@/tools/health/AlcoholCalculator")),
  "health/blood-pressure-calculator": lazy(() => import("@/tools/health/BloodPressureCalculator")),
  "health/body-surface-area-calculator": lazy(() => import("@/tools/health/BodySurfaceAreaCalculator")),
  "health/body-weight-planner": lazy(() => import("@/tools/health/BodyWeightPlanner")),
  "health/calorie-calculator": lazy(() => import("@/tools/health/CalorieCalculator")),
  "health/calories-burned-calculator": lazy(() => import("@/tools/health/CaloriesBurnedCalculator")),
  "health/carb-intake-calculator": lazy(() => import("@/tools/health/CarbIntakeCalculator")),
  "health/fat-loss-calculator": lazy(() => import("@/tools/health/FatLossCalculator")),
  "health/fiber-intake-calculator": lazy(() => import("@/tools/health/FiberIntakeCalculator")),
  "health/heart-rate-calculator": lazy(() => import("@/tools/health/HeartRateCalculator")),
  "developer/hex-to-rgb": lazy(() => import("@/tools/developer/HexToRgb")),
  "developer/html-to-markdown": lazy(() => import("@/tools/developer/HtmlToMarkdown")),
  "health/lean-body-mass-calculator": lazy(() => import("@/tools/health/LeanBodyMassCalculator")),
  "ecommerce/utm-builder": lazy(() => import("@/tools/ecommerce/UtmBuilder")),
  "education/iq-test-calculator": lazy(() => import("@/tools/education/IqTestCalculator")),
  "education/astrology-calculator-edu": lazy(() => import("@/tools/education/AstrologyCalculatorEdu")),
  "ecommerce/cpm-calculator": lazy(() => import("@/tools/ecommerce/CpmCalculator")),
  "finance/cpc-calculator": lazy(() => import("@/tools/finance/CpcCalculator")),
  "converter/word-to-pdf": lazy(() => import("@/tools/converter/WordToPdf")),
  "converter/pdf-to-markdown": lazy(() => import("@/tools/converter/PdfToMarkdown")),
  "converter/pdf-to-word": lazy(() => import("@/tools/converter/PdfToWord")),
};

function ToolCrawlerStaticBlock({
  toolConfig,
  categoryName,
  categoryNameEn,
}: {
  toolConfig: ToolConfig;
  categoryName: string;
  categoryNameEn?: string;
}) {
  const { lang } = useLanguage();
  const categoryLabel = lang === "zh" && categoryNameEn ? `${categoryName} / ${categoryNameEn}` : categoryNameEn ?? titleCaseFromSlug(toolConfig.category);
  const statusLabel = toolConfig.status ?? "GOLD";
  const toolDisplayName = lang === "zh" ? toolConfig.nameZh ?? toolConfig.name : getEnglishToolName(toolConfig);
  const summaryCopy =
    lang === "zh"
      ? {
          eyebrow: "靜態工具摘要",
          heading: `${toolDisplayName}：可被搜尋引擎讀取的工具頁摘要`,
          description: toolConfig.description,
          metadata: `分類：${categoryLabel}。正式路徑：${toolConfig.path}。狀態：${statusLabel}。本頁提供可直接閱讀的工具用途、輸入情境、結果解讀、FAQ、信任聲明與相關資源摘要，避免搜尋引擎只看到互動元件或空白容器。`,
          policy: `${
            toolConfig.showAds
              ? "本工具頁允許在內容區顯示 Google AdSense 或等效廣告版位，並以不遮擋主要工具輸入與結果為原則。"
              : "本工具頁目前不啟用廣告版位；若未來啟用，仍會維持主要工具內容可讀與可操作。"
          } 本頁可能包含站內推薦或聯盟連結；若透過部分連結購買，我們可能獲得佣金。${
            toolConfig.isPremium
              ? "此工具包含 Premium 功能或進階內容入口，基礎摘要與主要說明仍保留為可讀文字。"
              : "此工具目前可免費使用；頁面仍保留 Premium 升級與延伸內容的靜態說明位置。"
          }`,
          crawlerNote: `中文摘要：${toolDisplayName} 是 Formula Universe 收錄於 ${categoryLabel} 分類的工具頁，包含工具用途、輸入指引、結果解讀、FAQ、廣告政策、聯盟揭露、付費功能說明與信任參考。`,
        }
      : {
          eyebrow: "Static tool summary",
          heading: `${toolDisplayName}: crawler-readable tool page summary`,
          description: `Use ${toolDisplayName} to review this ${categoryLabel} workflow with a clear, browser-readable overview before the interactive tool finishes loading. The summary is written in English only for international visitors and search crawlers.`,
          metadata: `Category: ${categoryLabel}. Canonical path: ${toolConfig.path}. Status: ${statusLabel}. This page provides readable context for the tool purpose, input scenario, result interpretation, FAQ, trust statements, and related resources so crawlers do not see only interactive widgets or empty containers.`,
          policy: `${
            toolConfig.showAds
              ? "This tool page may display Google AdSense or equivalent advertising placements in the content area, without covering the main inputs or results."
              : "This tool page does not currently enable advertising placements; if ads are enabled later, the main tool content will remain readable and usable."
          } This page may include internal recommendations or affiliate links; we may earn a commission from qualifying purchases made through some links. ${
            toolConfig.isPremium
              ? "This tool includes Premium features or advanced content entry points, while the core summary and main explanation remain readable text."
              : "This tool is currently free to use; the page still reserves static explanatory space for Premium upgrades and extended content."
          }`,
          crawlerNote: `English summary: ${toolDisplayName} is a Formula Universe tool in the ${categoryLabel} category. It includes static, crawler-readable context for the tool purpose, input guidance, result interpretation, FAQ, advertising policy, affiliate disclosure, premium access notes, and trust references.`,
        };
  const isGoldenSummaryTypography = isGoldenSummaryTypographyEnabled(toolConfig.path);

  return (
    <section
      aria-label="Crawler-readable tool summary"
      className="border-b border-border bg-background/95"
      data-crawler-static="tool-summary"
    >
      <div className={isGoldenSummaryTypography ? "container py-5 text-base leading-[1.6] text-muted-foreground md:text-[16px]" : "container py-5 text-sm leading-7 text-muted-foreground"}>
        <p className={isGoldenSummaryTypography ? "font-semibold uppercase tracking-[0.2em] text-primary" : "text-xs font-semibold uppercase tracking-[0.2em] text-primary"}>
          {summaryCopy.eyebrow}
        </p>
        <h2 className="mt-2 text-xl font-bold text-foreground">
          {summaryCopy.heading}
        </h2>
        <p className="mt-2">
          {summaryCopy.description}
        </p>
        <p className="mt-2">
          {summaryCopy.metadata}
        </p>
        <p className="mt-2">
          {summaryCopy.policy}
        </p>
        <p className={isGoldenSummaryTypography ? "mt-2" : "mt-2 text-xs"}>
          {summaryCopy.crawlerNote}
        </p>
      </div>
    </section>
  );
}

function ToolSkeleton() {
  return (
    <div className="container py-8 space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}

export default function ToolPage() {
  const { lang } = useLanguage();
  const { category, toolName } = useParams<{ category: string; toolName: string }>();
  const toolKey = `${category}/${toolName}`;
  const toolPath = `/tools/${toolKey}`;

  // GSC 歷史路由：若命中重導表，導向 canonical（保住已索引 URL，永不 404）
  const legacyTarget = LEGACY_TOOL_REDIRECTS[toolKey];
  if (legacyTarget) {
    return <Redirect to={legacyTarget} />;
  }

  const catInfo = getCategoryByKey(category ?? "");
  const toolConfig = getToolByPath(toolPath);
  const ToolComponent = toolComponentMap[toolKey];
  const breadcrumbHomeLabel = lang === "zh" ? "首頁" : "Home";
  const breadcrumbCategoryLabel = lang === "zh" ? catInfo?.name ?? category : catInfo?.nameEn ?? titleCaseFromSlug(category ?? "");
  const breadcrumbToolLabel = toolConfig ? (lang === "zh" ? toolConfig.nameZh ?? toolConfig.name : getEnglishToolName(toolConfig)) : titleCaseFromSlug(toolName ?? "");

  useEffect(() => {
    if (!toolConfig) return;

    const seoToolName = lang === "zh" ? toolConfig.nameZh ?? toolConfig.name : getEnglishToolName(toolConfig);
    const seoDescription =
      lang === "zh"
        ? toolConfig.description
        : `Use ${seoToolName} on Formula Universe to review the ${breadcrumbCategoryLabel} workflow with English guidance, crawler-readable context, input notes, and result interpretation.`;

    setSeoMeta({
      title: `${seoToolName}｜Formula Universe`,
      description: seoDescription,
    });
  }, [breadcrumbCategoryLabel, lang, toolConfig]);

  if (!ToolComponent || !toolConfig) {
    return (
      <div className="container py-20 text-center">
        <p className="text-lg font-medium">找不到此工具</p>
        <p className="text-muted-foreground mt-2 text-sm">
          工具路徑：{toolPath}
        </p>
        <div className="flex justify-center gap-3 mt-6">
          <Button asChild variant="outline">
            <Link href={`/category/${category}`}>返回分類</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/">返回首頁</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-muted/20">
        <div className="container py-3">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              {breadcrumbHomeLabel}
            </Link>
            <span>/</span>
            <Link href={`/category/${category}`} className="hover:text-foreground transition-colors">
              {breadcrumbCategoryLabel}
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">{breadcrumbToolLabel}</span>
          </nav>
        </div>
      </div>

      {/* Crawler-readable static text block: rendered before lazy tool code so bots can read real content immediately. */}
      <ToolCrawlerStaticBlock
        toolConfig={toolConfig}
        categoryName={catInfo?.name ?? category ?? toolConfig.category}
        categoryNameEn={catInfo?.nameEn}
      />

      {/* Tool Component */}
      <Suspense fallback={<ToolSkeleton />}>
        <ToolComponent />
      </Suspense>
    </div>
  );
}
