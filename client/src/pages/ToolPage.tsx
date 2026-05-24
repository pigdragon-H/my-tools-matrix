// ============================================================
// ToolPage - /tools/:category/:toolName 工具容器頁
// 根據路由參數動態渲染對應的計算工具組件
// ============================================================

import { useParams, Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCategoryByKey } from "@shared/categoriesConfig";
import { getToolByPath } from "@shared/toolsConfig";
import { lazy, Suspense, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { setSeoMeta } from "@/lib/seo";

// 工具組件映射（懶加載）
const toolComponentMap: Record<string, React.LazyExoticComponent<() => React.ReactElement>> = {
  // FIN Priority 1 Expansion INV/RET/LOA/MTG/FXR
  "finance/cagr-calculator": lazy(() => import("@/tools/finance/CagrCalculator")),
  "finance/compound-interest-calculator": lazy(() => import("@/tools/finance/CompoundInterestCalculator")),
  "finance/dividend-yield-calculator": lazy(() => import("@/tools/finance/DividendYieldCalculator")),
  "finance/stock-return-calculator": lazy(() => import("@/tools/finance/StockReturnCalculator")),
  "finance/dollar-cost-averaging-calculator": lazy(() => import("@/tools/finance/DollarCostAveragingCalculator")),
  "finance/fire-calculator": lazy(() => import("@/tools/finance/FireCalculator")),
  "finance/retirement-savings-calculator": lazy(() => import("@/tools/finance/RetirementSavingsCalculator")),
  "finance/withdrawal-rate-calculator": lazy(() => import("@/tools/finance/WithdrawalRateCalculator")),
  "finance/coast-fire-calculator": lazy(() => import("@/tools/finance/CoastFireCalculator")),
  "finance/pension-calculator": lazy(() => import("@/tools/finance/PensionCalculator")),
  "finance/loan-calculator": lazy(() => import("@/tools/finance/LoanCalculator")),
  "finance/personal-loan-calculator": lazy(() => import("@/tools/finance/PersonalLoanCalculator")),
  "finance/emi-calculator": lazy(() => import("@/tools/finance/EmiCalculator")),
  "finance/debt-payoff-calculator": lazy(() => import("@/tools/finance/DebtPayoffCalculator")),
  "finance/interest-rate-calculator": lazy(() => import("@/tools/finance/InterestRateCalculator")),
  "finance/mortgage-calculator": lazy(() => import("@/tools/finance/MortgageCalculator")),
  "finance/mortgage-amortization-calculator": lazy(() => import("@/tools/finance/MortgageAmortizationCalculator")),
  "finance/refinance-calculator": lazy(() => import("@/tools/finance/RefinanceCalculator")),
  "finance/down-payment-calculator": lazy(() => import("@/tools/finance/DownPaymentCalculator")),
  "finance/affordability-calculator": lazy(() => import("@/tools/finance/AffordabilityCalculator")),
  "finance/pip-value-calculator": lazy(() => import("@/tools/finance/PipValueCalculator")),
  "finance/forex-profit-calculator": lazy(() => import("@/tools/finance/ForexProfitCalculator")),
  "finance/currency-converter-pro": lazy(() => import("@/tools/finance/CurrencyConverterPro")),
  "finance/exchange-rate-calculator": lazy(() => import("@/tools/finance/ExchangeRateCalculator")),
  "finance/cross-rate-calculator": lazy(() => import("@/tools/finance/CrossRateCalculator")),
  // 財經投資（原有）
  "finance/roi-calculator": lazy(() => import("@/tools/finance/RoiCalculator")),
  "finance/car-depreciation": lazy(() => import("@/tools/finance/CarDepreciation")),
  "finance/retirement-calculator": lazy(() => import("@/tools/finance/RetirementCalculator")),
  "finance/dca-calculator": lazy(() => import("@/tools/finance/DCACalculator")),
  "finance/income-tax-calculator": lazy(() => import("@/tools/finance/IncomeTaxCalculator")),
  // 財經投資（Phase 11）
  "finance/rent-vs-buy": lazy(() => import("@/tools/finance/RentVsBuy")),
  "finance/inflation-calculator": lazy(() => import("@/tools/finance/InflationCalculator")),
  "finance/credit-card-payoff": lazy(() => import("@/tools/finance/CreditCardPayoff")),
  "finance/irr-npv-calculator": lazy(() => import("@/tools/finance/IrrNpvCalculator")),
  "finance/education-fund": lazy(() => import("@/tools/finance/EducationFund")),
  "finance/dividend-reinvestment": lazy(() => import("@/tools/finance/DividendReinvestment")),
  "finance/crypto-dca-backtest": lazy(() => import("@/tools/finance/CryptoDcaBacktest")),
  // 健康工具（原有）
  "health/tdee-calculator": lazy(() => import("@/tools/health/TdeeCalculator")),
  "health/bmi-calculator": lazy(() => import("@/tools/health/BmiCalculator")),
  "health/sleep-cycle-calculator": lazy(() => import("@/tools/health/SleepCycleCalculator")),
  "health/calorie-deficit-calculator": lazy(() => import("@/tools/health/CalorieDeficitCalculator")),
  "health/water-intake-calculator": lazy(() => import("@/tools/health/WaterIntakeCalculator")),
  // 健康工具（Phase 11）
  "health/macros-calculator": lazy(() => import("@/tools/health/MacrosCalculator")),
  "health/ovulation-tracker": lazy(() => import("@/tools/health/OvulationTracker")),
  "health/astrology-calculator": lazy(() => import("@/tools/health/AstrologyCalculator")),
  "health/pomodoro-tracker": lazy(() => import("@/tools/health/PomodoroTracker")),
  // 財經投資（Phase 12）
  "finance/insurance-calculator": lazy(() => import("@/tools/finance/InsuranceCalculator")),
  "finance/utility-cost-calculator": lazy(() => import("@/tools/finance/UtilityCostCalculator")),
  "finance/asset-depreciation": lazy(() => import("@/tools/finance/AssetDepreciation")),
  "travel/currency-converter": lazy(() => import("@/tools/finance/CurrencyConverter")),
  // 生產力（Phase 12）
  "productivity/url-shortener": lazy(() => import("@/tools/productivity/UrlShortener")),
  "design/markdown-to-html": lazy(() => import("@/tools/productivity/MarkdownToHtml")),
  // 生產力（Productivity）
  "productivity/social-media-checker": lazy(() => import("@/tools/productivity/SocialMediaChecker")),
  "productivity/roas-cpc-calculator": lazy(() => import("@/tools/productivity/RoasCpcCalculator")),
  "productivity/freelancer-rate-calculator": lazy(() => import("@/tools/productivity/FreelancerRateCalculator")),
  "productivity/invoice-generator": lazy(() => import("@/tools/productivity/InvoiceGenerator")),
  "ecommerce/utm-builder": lazy(() => import("@/tools/productivity/UtmBuilder")),
  // 開發工具（Dev）
  // DEV Priority 1 Expansion CNV/FMT/ENC/VAL/GEN
  "dev/json-to-xml": lazy(() => import("@/tools/dev/JsonToXml")),
  "dev/json-to-yaml": lazy(() => import("@/tools/dev/JsonToYaml")),
  "dev/csv-to-json": lazy(() => import("@/tools/dev/CsvToJson")),
  "dev/html-to-markdown": lazy(() => import("@/tools/dev/HtmlToMarkdown")),
  "dev/hex-to-rgb": lazy(() => import("@/tools/dev/HexToRgb")),
  "dev/sql-formatter": lazy(() => import("@/tools/dev/SqlFormatter")),
  "dev/xml-formatter": lazy(() => import("@/tools/dev/XmlFormatter")),
  "dev/css-beautifier": lazy(() => import("@/tools/dev/CssBeautifier")),
  "dev/javascript-formatter": lazy(() => import("@/tools/dev/JavascriptFormatter")),
  "dev/html-formatter": lazy(() => import("@/tools/dev/HtmlFormatter")),
  "dev/hex-encoder-decoder": lazy(() => import("@/tools/dev/HexEncoderDecoder")),
  "dev/html-entity-encoder": lazy(() => import("@/tools/dev/HtmlEntityEncoder")),
  "dev/unicode-converter": lazy(() => import("@/tools/dev/UnicodeConverter")),
  "dev/binary-converter": lazy(() => import("@/tools/dev/BinaryConverter")),
  "dev/json-validator": lazy(() => import("@/tools/dev/JsonValidator")),
  "dev/xml-validator": lazy(() => import("@/tools/dev/XmlValidator")),
  "dev/yaml-validator": lazy(() => import("@/tools/dev/YamlValidator")),
  "dev/email-validator": lazy(() => import("@/tools/dev/EmailValidator")),
  "dev/ip-address-validator": lazy(() => import("@/tools/dev/IpAddressValidator")),
  "dev/uuid-generator": lazy(() => import("@/tools/dev/UuidGenerator")),
  "dev/password-generator": lazy(() => import("@/tools/dev/PasswordGenerator")),
  "dev/hash-generator": lazy(() => import("@/tools/dev/HashGenerator")),
  "dev/mock-data-generator": lazy(() => import("@/tools/dev/MockDataGenerator")),
  "dev/slug-generator": lazy(() => import("@/tools/dev/SlugGenerator")),
  "dev/cron-generator": lazy(() => import("@/tools/dev/CronGenerator")),
  "dev/base64-encoder-decoder": lazy(() => import("@/tools/dev/Base64EncoderDecoder")),
  "dev/json-formatter": lazy(() => import("@/tools/dev/JsonFormatter")),
  "dev/json-diff-checker": lazy(() => import("@/tools/dev/JsonDiffChecker")),
  "dev/text-case-converter": lazy(() => import("@/tools/dev/TextCaseConverter")),
  "dev/line-counter": lazy(() => import("@/tools/dev/LineCounter")),
  "dev/css-variables-extractor": lazy(() => import("@/tools/dev/CssVariablesExtractor")),
  "dev/number-base-converter": lazy(() => import("@/tools/dev/NumberBaseConverter")),
  "dev/json-minifier": lazy(() => import("@/tools/dev/JsonMinifier")),
  "dev/jwt-generator": lazy(() => import("@/tools/dev/JwtGenerator")),
  "dev/regex-generator": lazy(() => import("@/tools/dev/RegexGenerator")),
  "dev/nano-id-generator": lazy(() => import("@/tools/dev/NanoIdGenerator")),
  "dev/iso8601-converter": lazy(() => import("@/tools/dev/Iso8601Converter")),
  "dev/jwt-decoder": lazy(() => import("@/tools/dev/JwtDecoder")),
  "dev/regex-tester": lazy(() => import("@/tools/dev/RegexTester")),
  "dev/uuid-password-generator": lazy(() => import("@/tools/dev/UuidPasswordGenerator")),
  "dev/responsive-breakpoint-tester": lazy(() => import("@/tools/dev/ResponsiveBreakpointTester")),
  "dev/css-grid-flexbox-generator": lazy(() => import("@/tools/dev/CssGridFlexboxGenerator")),
  "dev/image-converter": lazy(() => import("@/tools/dev/ImageConverter")),
  "dev/timezone-converter": lazy(() => import("@/tools/dev/TimezoneConverter")),
  // HLT Priority 1 Expansion BIO/CAL/FIT/WLS/NTR
  "health/bmr-calculator": lazy(() => import("@/tools/health/BmrCalculator")),
  "health/lean-body-mass-calculator": lazy(() => import("@/tools/health/LeanBodyMassCalculator")),
  "health/waist-to-hip-ratio-calculator": lazy(() => import("@/tools/health/WaistToHipRatioCalculator")),
  "health/body-surface-area-calculator": lazy(() => import("@/tools/health/BodySurfaceAreaCalculator")),
  "health/maximum-heart-rate-calculator": lazy(() => import("@/tools/health/MaximumHeartRateCalculator")),
  "health/calorie-calculator": lazy(() => import("@/tools/health/CalorieCalculator")),
  "health/meal-calorie-calculator": lazy(() => import("@/tools/health/MealCalorieCalculator")),
  "health/calories-burned-calculator": lazy(() => import("@/tools/health/CaloriesBurnedCalculator")),
  "health/one-rep-max-calculator": lazy(() => import("@/tools/health/OneRepMaxCalculator")),
  "health/running-pace-calculator": lazy(() => import("@/tools/health/RunningPaceCalculator")),
  "health/vo2-max-calculator": lazy(() => import("@/tools/health/Vo2MaxCalculator")),
  "health/workout-volume-calculator": lazy(() => import("@/tools/health/WorkoutVolumeCalculator")),
  "health/target-heart-rate-calculator": lazy(() => import("@/tools/health/TargetHeartRateCalculator")),
  "health/weight-loss-calculator": lazy(() => import("@/tools/health/WeightLossCalculator")),
  "health/macro-calculator": lazy(() => import("@/tools/health/MacroCalculator")),
  "health/intermittent-fasting-calculator": lazy(() => import("@/tools/health/IntermittentFastingCalculator")),
  "health/body-weight-planner": lazy(() => import("@/tools/health/BodyWeightPlanner")),
  "health/fat-loss-calculator": lazy(() => import("@/tools/health/FatLossCalculator")),
  "health/protein-intake-calculator": lazy(() => import("@/tools/health/ProteinIntakeCalculator")),
  "health/carb-intake-calculator": lazy(() => import("@/tools/health/CarbIntakeCalculator")),
  "health/macro-ratio-calculator": lazy(() => import("@/tools/health/MacroRatioCalculator")),
  "health/vitamin-d-calculator": lazy(() => import("@/tools/health/VitaminDCalculator")),
  "health/fiber-intake-calculator": lazy(() => import("@/tools/health/FiberIntakeCalculator")),
  // Missing 113 Tools Fix v1.0
  "design/css-grid-flexbox-generator": lazy(() => import("@/tools/design/CssGridFlexboxGenerator")),
  "design/image-converter": lazy(() => import("@/tools/design/ImageConverter")),
  "design/responsive-breakpoint-tester": lazy(() => import("@/tools/design/ResponsiveBreakpointTester")),
  "dev/api-response-formatter": lazy(() => import("@/tools/dev/ApiResponseFormatter")),
  "dev/barcode-generator": lazy(() => import("@/tools/dev/BarcodeGenerator")),
  "dev/border-radius-generator": lazy(() => import("@/tools/dev/BorderRadiusGenerator")),
  "dev/box-shadow-generator": lazy(() => import("@/tools/dev/BoxShadowGenerator")),
  "dev/character-counter": lazy(() => import("@/tools/dev/CharacterCounter")),
  "dev/color-picker": lazy(() => import("@/tools/dev/ColorPicker")),
  "dev/css-unit-converter": lazy(() => import("@/tools/dev/CssUnitConverter")),
  "dev/diff-checker": lazy(() => import("@/tools/dev/DiffChecker")),
  "dev/dns-lookup": lazy(() => import("@/tools/dev/DnsLookup")),
  "dev/gradient-generator": lazy(() => import("@/tools/dev/GradientGenerator")),
  "dev/hash-pro-generator": lazy(() => import("@/tools/dev/HashProGenerator")),
  "dev/ip-address-lookup": lazy(() => import("@/tools/dev/IpAddressLookup")),
  "dev/lorem-ipsum-generator": lazy(() => import("@/tools/dev/LoremIpsumGenerator")),
  "dev/markdown-editor": lazy(() => import("@/tools/dev/MarkdownEditor")),
  "dev/password-pro-generator": lazy(() => import("@/tools/dev/PasswordProGenerator")),
  "dev/qr-code-generator": lazy(() => import("@/tools/dev/QrCodeGenerator")),
  "dev/ssl-checker": lazy(() => import("@/tools/dev/SslChecker")),
  "dev/timestamp-converter": lazy(() => import("@/tools/dev/TimestampConverter")),
  "dev/url-encoder": lazy(() => import("@/tools/dev/UrlEncoder")),
  "dev/word-counter": lazy(() => import("@/tools/dev/WordCounter")),
  "ecommerce/churn-rate-calculator": lazy(() => import("@/tools/ecommerce/ChurnRateCalculator")),
  "ecommerce/conversion-rate-calculator": lazy(() => import("@/tools/ecommerce/ConversionRateCalculator")),
  "ecommerce/cpc-calculator": lazy(() => import("@/tools/ecommerce/CpcCalculator")),
  "ecommerce/cpm-calculator": lazy(() => import("@/tools/ecommerce/CpmCalculator")),
  "ecommerce/ctr-calculator": lazy(() => import("@/tools/ecommerce/CtrCalculator")),
  "ecommerce/customer-acquisition-cost": lazy(() => import("@/tools/ecommerce/CustomerAcquisitionCost")),
  "ecommerce/customer-lifetime-value": lazy(() => import("@/tools/ecommerce/CustomerLifetimeValue")),
  "ecommerce/email-open-rate-calculator": lazy(() => import("@/tools/ecommerce/EmailOpenRateCalculator")),
  "ecommerce/net-promoter-score": lazy(() => import("@/tools/ecommerce/NetPromoterScore")),
  "ecommerce/roas-cpc-calculator": lazy(() => import("@/tools/ecommerce/RoasCpcCalculator")),
  "ecommerce/social-media-roi-calculator": lazy(() => import("@/tools/ecommerce/SocialMediaRoiCalculator")),
  "education/astrology-calculator": lazy(() => import("@/tools/education/AstrologyCalculator")),
  "education/citation-generator": lazy(() => import("@/tools/education/CitationGenerator")),
  "education/education-fund": lazy(() => import("@/tools/education/EducationFund")),
  "education/essay-word-count": lazy(() => import("@/tools/education/EssayWordCount")),
  "education/flashcard-generator": lazy(() => import("@/tools/education/FlashcardGenerator")),
  "education/gpa-calculator": lazy(() => import("@/tools/education/GpaCalculator")),
  "education/grade-calculator": lazy(() => import("@/tools/education/GradeCalculator")),
  "education/iq-test-calculator": lazy(() => import("@/tools/education/IqTestCalculator")),
  "education/learning-style-quiz": lazy(() => import("@/tools/education/LearningStyleQuiz")),
  "education/study-time-calculator": lazy(() => import("@/tools/education/StudyTimeCalculator")),
  "finance/break-even-calculator": lazy(() => import("@/tools/finance/BreakEvenCalculator")),
  "finance/budget-planner": lazy(() => import("@/tools/finance/BudgetPlanner")),
  "finance/capital-gains-tax-calculator": lazy(() => import("@/tools/finance/CapitalGainsTaxCalculator")),
  "finance/compound-interest-advanced": lazy(() => import("@/tools/finance/CompoundInterestAdvanced")),
  "finance/compound-interest-pro-calculator": lazy(() => import("@/tools/finance/CompoundInterestProCalculator")),
  "finance/corporate-tax-calculator": lazy(() => import("@/tools/finance/CorporateTaxCalculator")),
  "finance/credit-score-calculator": lazy(() => import("@/tools/finance/CreditScoreCalculator")),
  "finance/debt-payoff-pro-calculator": lazy(() => import("@/tools/finance/DebtPayoffProCalculator")),
  "finance/dividend-yield-pro-calculator": lazy(() => import("@/tools/finance/DividendYieldProCalculator")),
  "finance/emergency-fund-calculator": lazy(() => import("@/tools/finance/EmergencyFundCalculator")),
  "finance/estate-tax-calculator": lazy(() => import("@/tools/finance/EstateTaxCalculator")),
  "finance/gift-tax-calculator": lazy(() => import("@/tools/finance/GiftTaxCalculator")),
  "finance/gold-price-calculator": lazy(() => import("@/tools/finance/GoldPriceCalculator")),
  "finance/home-affordability-calculator": lazy(() => import("@/tools/finance/HomeAffordabilityCalculator")),
  "finance/home-equity-calculator": lazy(() => import("@/tools/finance/HomeEquityCalculator")),
  "finance/land-value-calculator": lazy(() => import("@/tools/finance/LandValueCalculator")),
  "finance/loan-pro-calculator": lazy(() => import("@/tools/finance/LoanProCalculator")),
  "finance/moving-cost-calculator": lazy(() => import("@/tools/finance/MovingCostCalculator")),
  "finance/net-worth-calculator": lazy(() => import("@/tools/finance/NetWorthCalculator")),
  "finance/pe-ratio-calculator": lazy(() => import("@/tools/finance/PeRatioCalculator")),
  "finance/profit-margin-calculator": lazy(() => import("@/tools/finance/ProfitMarginCalculator")),
  "finance/property-roi-calculator": lazy(() => import("@/tools/finance/PropertyRoiCalculator")),
  "finance/property-tax-calculator": lazy(() => import("@/tools/finance/PropertyTaxCalculator")),
  "finance/rental-yield-calculator": lazy(() => import("@/tools/finance/RentalYieldCalculator")),
  "finance/salary-after-tax-calculator": lazy(() => import("@/tools/finance/SalaryAfterTaxCalculator")),
  "finance/savings-goal-calculator": lazy(() => import("@/tools/finance/SavingsGoalCalculator")),
  "finance/stamp-duty-calculator": lazy(() => import("@/tools/finance/StampDutyCalculator")),
  "finance/stock-profit-loss-calculator": lazy(() => import("@/tools/finance/StockProfitLossCalculator")),
  "finance/tax-refund-calculator": lazy(() => import("@/tools/finance/TaxRefundCalculator")),
  "finance/tip-calculator": lazy(() => import("@/tools/finance/TipCalculator")),
  "finance/vat-calculator": lazy(() => import("@/tools/finance/VatCalculator")),
  "finance/withholding-tax-calculator": lazy(() => import("@/tools/finance/WithholdingTaxCalculator")),
  "health/age-calculator": lazy(() => import("@/tools/health/AgeCalculator")),
  "health/alcohol-calculator": lazy(() => import("@/tools/health/AlcoholCalculator")),
  "health/blood-pressure-calculator": lazy(() => import("@/tools/health/BloodPressureCalculator")),
  "health/body-fat-calculator": lazy(() => import("@/tools/health/BodyFatCalculator")),
  "health/due-date-calculator": lazy(() => import("@/tools/health/DueDateCalculator")),
  "health/heart-rate-calculator": lazy(() => import("@/tools/health/HeartRateCalculator")),
  "health/ideal-weight-calculator": lazy(() => import("@/tools/health/IdealWeightCalculator")),
  "health/pregnancy-calculator": lazy(() => import("@/tools/health/PregnancyCalculator")),
  "health/vitamin-calculator": lazy(() => import("@/tools/health/VitaminCalculator")),
  "productivity/age-at-date-calculator": lazy(() => import("@/tools/productivity/AgeAtDateCalculator")),
  "productivity/deadline-calculator": lazy(() => import("@/tools/productivity/DeadlineCalculator")),
  "productivity/email-subject-generator": lazy(() => import("@/tools/productivity/EmailSubjectGenerator")),
  "productivity/meeting-agenda-generator": lazy(() => import("@/tools/productivity/MeetingAgendaGenerator")),
  "productivity/okr-calculator": lazy(() => import("@/tools/productivity/OkrCalculator")),
  "productivity/pomodoro-tracker": lazy(() => import("@/tools/productivity/PomodoroTracker")),
  "productivity/productivity-score": lazy(() => import("@/tools/productivity/ProductivityScore")),
  "productivity/project-roi-calculator": lazy(() => import("@/tools/productivity/ProjectRoiCalculator")),
  "productivity/reading-time-calculator": lazy(() => import("@/tools/productivity/ReadingTimeCalculator")),
  "productivity/typing-speed-calculator": lazy(() => import("@/tools/productivity/TypingSpeedCalculator")),
  "productivity/work-hours-calculator": lazy(() => import("@/tools/productivity/WorkHoursCalculator")),
  "science/force-calculator": lazy(() => import("@/tools/science/ForceCalculator")),
  "science/molecular-weight-calculator": lazy(() => import("@/tools/science/MolecularWeightCalculator")),
  "science/ohms-law-calculator": lazy(() => import("@/tools/science/OhmsLawCalculator")),
  "science/percentage-calculator": lazy(() => import("@/tools/science/PercentageCalculator")),
  "science/ph-calculator": lazy(() => import("@/tools/science/PhCalculator")),
  "science/speed-calculator": lazy(() => import("@/tools/science/SpeedCalculator")),
  "science/temperature-converter": lazy(() => import("@/tools/science/TemperatureConverter")),
  "science/unit-converter": lazy(() => import("@/tools/science/UnitConverter")),
  "travel/co2-emission-calculator": lazy(() => import("@/tools/travel/Co2EmissionCalculator")),
  "travel/distance-calculator": lazy(() => import("@/tools/travel/DistanceCalculator")),
  "travel/flight-time-calculator": lazy(() => import("@/tools/travel/FlightTimeCalculator")),
  "travel/fuel-cost-calculator": lazy(() => import("@/tools/travel/FuelCostCalculator")),
  "travel/hotel-cost-calculator": lazy(() => import("@/tools/travel/HotelCostCalculator")),
  "travel/packing-list-generator": lazy(() => import("@/tools/travel/PackingListGenerator")),
  "travel/timezone-converter": lazy(() => import("@/tools/travel/TimezoneConverter")),
  "travel/travel-budget-calculator": lazy(() => import("@/tools/travel/TravelBudgetCalculator")),
  "travel/visa-fee-calculator": lazy(() => import("@/tools/travel/VisaFeeCalculator")),

};

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
  const { category, toolName } = useParams<{ category: string; toolName: string }>();
  const toolKey = `${category}/${toolName}`;
  const toolPath = `/tools/${toolKey}`;

  const catInfo = getCategoryByKey(category ?? "");
  const toolConfig = getToolByPath(toolPath);
  const ToolComponent = toolComponentMap[toolKey];

  useEffect(() => {
    if (!toolConfig) return;

    setSeoMeta({
      title: `${toolConfig.name}｜工具矩陣`,
      description: toolConfig.description,
    });
  }, [toolConfig]);

  if (!ToolComponent || !toolConfig) {
    return (
      <div className="container py-20 text-center">
        <p className="text-lg font-medium">找不到此工具</p>
        <p className="text-muted-foreground mt-2 text-sm">
          工具路徑：{toolPath}
        </p>
        <div className="flex justify-center gap-3 mt-6">
          <Button asChild variant="outline">
            <Link href={`/tools/${category}`}>返回分類</Link>
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
              首頁
            </Link>
            <span>/</span>
            <Link href={`/tools/${category}`} className="hover:text-foreground transition-colors">
              {catInfo?.name ?? category}
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">{toolConfig.name}</span>
          </nav>
        </div>
      </div>

      {/* Tool Component */}
      <Suspense fallback={<ToolSkeleton />}>
        <ToolComponent />
      </Suspense>
    </div>
  );
}
