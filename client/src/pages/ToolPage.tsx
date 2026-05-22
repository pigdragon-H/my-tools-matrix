// ============================================================
// ToolPage - /tools/:category/:toolName 撌亙摰孵??// ?寞?頝舐???皜脫?撠???蝞極?瑞?隞?// ============================================================

import { useParams, Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCategoryByKey } from "@shared/categoriesConfig";
import { getToolByPath } from "@shared/toolsConfig";
import { lazy, Suspense, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { setSeoMeta } from "@/lib/seo";

// 撌亙蝯辣??嚗??嚗?const toolComponentMap: Record<string, React.LazyExoticComponent<() => React.ReactElement>> = {
  // 鞎∠???
  // FIN Priority 1 Expansion INV/RET/LOA/MTG/FXR
  "finance/cagr-calculator": lazy(() => import("@/tools/fin/CagrCalculator")),
  "finance/compound-interest-calculator": lazy(() => import("@/tools/fin/CompoundInterestCalculator")),
  "finance/dividend-yield-calculator": lazy(() => import("@/tools/fin/DividendYieldCalculator")),
  "finance/stock-return-calculator": lazy(() => import("@/tools/fin/StockReturnCalculator")),
  "finance/dollar-cost-averaging-calculator": lazy(() => import("@/tools/fin/DollarCostAveragingCalculator")),
  "finance/fire-calculator": lazy(() => import("@/tools/fin/FireCalculator")),
  "finance/retirement-savings-calculator": lazy(() => import("@/tools/fin/RetirementSavingsCalculator")),
  "finance/withdrawal-rate-calculator": lazy(() => import("@/tools/fin/WithdrawalRateCalculator")),
  "finance/coast-fire-calculator": lazy(() => import("@/tools/fin/CoastFireCalculator")),
  "finance/pension-calculator": lazy(() => import("@/tools/fin/PensionCalculator")),
  "finance/loan-calculator": lazy(() => import("@/tools/fin/LoanCalculator")),
  "finance/personal-loan-calculator": lazy(() => import("@/tools/fin/PersonalLoanCalculator")),
  "finance/emi-calculator": lazy(() => import("@/tools/fin/EmiCalculator")),
  "finance/debt-payoff-calculator": lazy(() => import("@/tools/fin/DebtPayoffCalculator")),
  "finance/interest-rate-calculator": lazy(() => import("@/tools/fin/InterestRateCalculator")),
  "finance/mortgage-calculator": lazy(() => import("@/tools/fin/MortgageCalculator")),
  "finance/mortgage-amortization-calculator": lazy(() => import("@/tools/fin/MortgageAmortizationCalculator")),
  "finance/refinance-calculator": lazy(() => import("@/tools/fin/RefinanceCalculator")),
  "finance/down-payment-calculator": lazy(() => import("@/tools/fin/DownPaymentCalculator")),
  "finance/affordability-calculator": lazy(() => import("@/tools/fin/AffordabilityCalculator")),
  "finance/pip-value-calculator": lazy(() => import("@/tools/fin/PipValueCalculator")),
  "finance/forex-profit-calculator": lazy(() => import("@/tools/fin/ForexProfitCalculator")),
  "finance/currency-converter-pro": lazy(() => import("@/tools/fin/CurrencyConverterPro")),
  "finance/exchange-rate-calculator": lazy(() => import("@/tools/fin/ExchangeRateCalculator")),
  "finance/cross-rate-calculator": lazy(() => import("@/tools/fin/CrossRateCalculator")),
  "finance/roi-calculator": lazy(() => import("@/tools/finance/RoiCalculator")),
  "finance/car-depreciation": lazy(() => import("@/tools/finance/CarDepreciation")),
  "finance/mortgage-calculator": lazy(() => import("@/tools/finance/MortgageCalculator")),
  "finance/retirement-calculator": lazy(() => import("@/tools/finance/RetirementCalculator")),
  "finance/dca-calculator": lazy(() => import("@/tools/finance/DCACalculator")),
  "finance/income-tax-calculator": lazy(() => import("@/tools/finance/IncomeTaxCalculator")),
  // 鞎∠???嚗hase 11嚗?  "finance/rent-vs-buy": lazy(() => import("@/tools/finance/RentVsBuy")),
  "finance/inflation-calculator": lazy(() => import("@/tools/finance/InflationCalculator")),
  "finance/credit-card-payoff": lazy(() => import("@/tools/finance/CreditCardPayoff")),
  "finance/irr-npv-calculator": lazy(() => import("@/tools/finance/IrrNpvCalculator")),
  "finance/education-fund": lazy(() => import("@/tools/finance/EducationFund")),
  "finance/dividend-reinvestment": lazy(() => import("@/tools/finance/DividendReinvestment")),
  "finance/crypto-dca-backtest": lazy(() => import("@/tools/finance/CryptoDcaBacktest")),
  // ?亙熒?暑
  "health/tdee-calculator": lazy(() => import("@/tools/health/TdeeCalculator")),
  "health/bmi-calculator": lazy(() => import("@/tools/health/BmiCalculator")),
  "health/sleep-cycle-calculator": lazy(() => import("@/tools/health/SleepCycleCalculator")),
  "health/calorie-deficit-calculator": lazy(() => import("@/tools/health/CalorieDeficitCalculator")),
  "health/water-intake-calculator": lazy(() => import("@/tools/health/WaterIntakeCalculator")),
  // ?亙熒?暑嚗hase 11嚗?  "health/macros-calculator": lazy(() => import("@/tools/health/MacrosCalculator")),
  "health/ovulation-tracker": lazy(() => import("@/tools/health/OvulationTracker")),
  "health/astrology-calculator": lazy(() => import("@/tools/health/AstrologyCalculator")),
  "health/pomodoro-tracker": lazy(() => import("@/tools/health/PomodoroTracker")),
  // 鞎∠???嚗hase 12嚗?  "finance/insurance-calculator": lazy(() => import("@/tools/finance/InsuranceCalculator")),
  "finance/utility-cost-calculator": lazy(() => import("@/tools/finance/UtilityCostCalculator")),
  "finance/asset-depreciation": lazy(() => import("@/tools/finance/AssetDepreciation")),
  "travel/currency-converter": lazy(() => import("@/tools/finance/CurrencyConverter")),
  // ?瑕??嚗hase 12嚗?  "productivity/url-shortener": lazy(() => import("@/tools/productivity/UrlShortener")),
  "design/markdown-to-html": lazy(() => import("@/tools/productivity/MarkdownToHtml")),
  // ?瑕??嚗roductivity嚗?  "productivity/social-media-checker": lazy(() => import("@/tools/productivity/SocialMediaChecker")),
  "productivity/roas-cpc-calculator": lazy(() => import("@/tools/productivity/RoasCpcCalculator")),
  "productivity/freelancer-rate-calculator": lazy(() => import("@/tools/productivity/FreelancerRateCalculator")),
  "productivity/invoice-generator": lazy(() => import("@/tools/productivity/InvoiceGenerator")),
  "ecommerce/utm-builder": lazy(() => import("@/tools/productivity/UtmBuilder")),
  // ?撌亙嚗ev嚗?  // DEV Priority 1 Expansion CNV/FMT/ENC/VAL/GEN
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
  "dev/jwt-decoder": lazy(() => import("@/tools/dev/JwtDecoder")),
  "dev/regex-tester": lazy(() => import("@/tools/dev/RegexTester")),
  "dev/uuid-password-generator": lazy(() => import("@/tools/dev/UuidPasswordGenerator")),
  "dev/responsive-breakpoint-tester": lazy(() => import("@/tools/dev/ResponsiveBreakpointTester")),
  "dev/css-grid-flexbox-generator": lazy(() => import("@/tools/dev/CssGridFlexboxGenerator")),
  "dev/image-converter": lazy(() => import("@/tools/dev/ImageConverter")),
  "dev/timezone-converter": lazy(() => import("@/tools/dev/TimezoneConverter")),
  "health/bmr-calculator": lazy(() => import("@/tools/hlt/BmrCalculator")),
  "health/lean-body-mass-calculator": lazy(() => import("@/tools/hlt/LeanBodyMassCalculator")),
  "health/waist-to-hip-ratio-calculator": lazy(() => import("@/tools/hlt/WaistToHipRatioCalculator")),
  "health/body-surface-area-calculator": lazy(() => import("@/tools/hlt/BodySurfaceAreaCalculator")),
  "health/maximum-heart-rate-calculator": lazy(() => import("@/tools/hlt/MaximumHeartRateCalculator")),
  "health/tdee-calculator": lazy(() => import("@/tools/hlt/TdeeCalculator")),
  "health/calorie-deficit-calculator": lazy(() => import("@/tools/hlt/CalorieDeficitCalculator")),
  "health/calorie-calculator": lazy(() => import("@/tools/hlt/CalorieCalculator")),
  "health/meal-calorie-calculator": lazy(() => import("@/tools/hlt/MealCalorieCalculator")),
  "health/calories-burned-calculator": lazy(() => import("@/tools/hlt/CaloriesBurnedCalculator")),
  "health/one-rep-max-calculator": lazy(() => import("@/tools/hlt/OneRepMaxCalculator")),
  "health/running-pace-calculator": lazy(() => import("@/tools/hlt/RunningPaceCalculator")),
  "health/vo2-max-calculator": lazy(() => import("@/tools/hlt/Vo2MaxCalculator")),
  "health/workout-volume-calculator": lazy(() => import("@/tools/hlt/WorkoutVolumeCalculator")),
  "health/target-heart-rate-calculator": lazy(() => import("@/tools/hlt/TargetHeartRateCalculator")),
  "health/weight-loss-calculator": lazy(() => import("@/tools/hlt/WeightLossCalculator")),
  "health/macro-calculator": lazy(() => import("@/tools/hlt/MacroCalculator")),
  "health/intermittent-fasting-calculator": lazy(() => import("@/tools/hlt/IntermittentFastingCalculator")),
  "health/body-weight-planner": lazy(() => import("@/tools/hlt/BodyWeightPlanner")),
  "health/fat-loss-calculator": lazy(() => import("@/tools/hlt/FatLossCalculator")),
  "health/protein-intake-calculator": lazy(() => import("@/tools/hlt/ProteinIntakeCalculator")),
  "health/carb-intake-calculator": lazy(() => import("@/tools/hlt/CarbIntakeCalculator")),
  "health/macro-ratio-calculator": lazy(() => import("@/tools/hlt/MacroRatioCalculator")),
  "health/vitamin-d-calculator": lazy(() => import("@/tools/hlt/VitaminDCalculator")),
  "health/fiber-intake-calculator": lazy(() => import("@/tools/hlt/FiberIntakeCalculator")),
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
      title: `${toolConfig.name}嚚極?瑞?ε,
      description: toolConfig.description,
    });
  }, [toolConfig]);

  if (!ToolComponent || !toolConfig) {
    return (
      <div className="container py-20 text-center">
        <p className="text-lg font-medium">?曆??唳迨撌亙</p>
        <p className="text-muted-foreground mt-2 text-sm">
          撌亙頝臬?嚗toolPath}
        </p>
        <div className="flex justify-center gap-3 mt-6">
          <Button asChild variant="outline">
            <Link href={`/tools/${category}`}>餈???</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/">餈?擐?</Link>
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
              擐?
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

