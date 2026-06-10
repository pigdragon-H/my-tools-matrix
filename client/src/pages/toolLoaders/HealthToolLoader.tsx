import { lazy } from "react";
import type { LazyExoticComponent, ReactElement } from "react";

type ToolComponent = LazyExoticComponent<() => ReactElement>;

const toolComponentMap: Record<string, ToolComponent> = {
  "health/bmi-calculator": lazy(() => import("@/tools/health/BmiCalculator")),
  "health/bmr-calculator": lazy(() => import("@/tools/health/BmrCalculator")),
  "health/tdee-calculator": lazy(() => import("@/tools/health/TdeeCalculator")),
  "health/ideal-weight-calculator": lazy(() => import("@/tools/health/IdealWeightCalculator")),
  "health/body-fat-calculator": lazy(() => import("@/tools/health/BodyFatCalculator")),
  "health/calorie-deficit-calculator": lazy(() => import("@/tools/health/CalorieDeficitCalculator")),
  "health/water-intake-calculator": lazy(() => import("@/tools/health/WaterIntakeCalculator")),
  "health/macro-calculator": lazy(() => import("@/tools/health/MacroCalculator")),
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
  "health/due-date-calculator": lazy(() => import("@/tools/health/DueDateCalculator")),
  "health/period-cycle-calculator": lazy(() => import("@/tools/health/PeriodCycleCalculator")),
  "health/steps-to-calories-calculator": lazy(() => import("@/tools/health/StepsToCaloriesCalculator")),
  "health/calories-burned-activity": lazy(() => import("@/tools/health/CaloriesBurnedActivity")),
  "health/blood-sugar-converter": lazy(() => import("@/tools/health/BloodSugarConverter")),
  "health/child-growth-percentile": lazy(() => import("@/tools/health/ChildGrowthPercentile")),
  "health/sobriety-calculator": lazy(() => import("@/tools/health/SobrietyCalculator")),
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
  "health/lean-body-mass-calculator": lazy(() => import("@/tools/health/LeanBodyMassCalculator")),
};

export default function HealthToolLoader({ toolKey }: { toolKey: string }) {
  const ToolComponent = toolComponentMap[toolKey];
  if (!ToolComponent) return null;
  return <ToolComponent />;
}
