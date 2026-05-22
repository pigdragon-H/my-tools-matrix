import React, { Suspense, lazy } from 'react';
import { useParams } from 'react-router-dom';
const BmrCalculator = lazy(() => import('../tools/hlt/BmrCalculator'));
const LeanBodyMassCalculator = lazy(() => import('../tools/hlt/LeanBodyMassCalculator'));
const WaistToHipRatioCalculator = lazy(() => import('../tools/hlt/WaistToHipRatioCalculator'));
const BodySurfaceAreaCalculator = lazy(() => import('../tools/hlt/BodySurfaceAreaCalculator'));
const MaximumHeartRateCalculator = lazy(() => import('../tools/hlt/MaximumHeartRateCalculator'));
const TdeeCalculator = lazy(() => import('../tools/hlt/TdeeCalculator'));
const CalorieDeficitCalculator = lazy(() => import('../tools/hlt/CalorieDeficitCalculator'));
const CalorieCalculator = lazy(() => import('../tools/hlt/CalorieCalculator'));
const MealCalorieCalculator = lazy(() => import('../tools/hlt/MealCalorieCalculator'));
const CaloriesBurnedCalculator = lazy(() => import('../tools/hlt/CaloriesBurnedCalculator'));
const OneRepMaxCalculator = lazy(() => import('../tools/hlt/OneRepMaxCalculator'));
const RunningPaceCalculator = lazy(() => import('../tools/hlt/RunningPaceCalculator'));
const Vo2MaxCalculator = lazy(() => import('../tools/hlt/Vo2MaxCalculator'));
const WorkoutVolumeCalculator = lazy(() => import('../tools/hlt/WorkoutVolumeCalculator'));
const TargetHeartRateCalculator = lazy(() => import('../tools/hlt/TargetHeartRateCalculator'));
const WeightLossCalculator = lazy(() => import('../tools/hlt/WeightLossCalculator'));
const MacroCalculator = lazy(() => import('../tools/hlt/MacroCalculator'));
const IntermittentFastingCalculator = lazy(() => import('../tools/hlt/IntermittentFastingCalculator'));
const BodyWeightPlanner = lazy(() => import('../tools/hlt/BodyWeightPlanner'));
const FatLossCalculator = lazy(() => import('../tools/hlt/FatLossCalculator'));
const ProteinIntakeCalculator = lazy(() => import('../tools/hlt/ProteinIntakeCalculator'));
const CarbIntakeCalculator = lazy(() => import('../tools/hlt/CarbIntakeCalculator'));
const MacroRatioCalculator = lazy(() => import('../tools/hlt/MacroRatioCalculator'));
const VitaminDCalculator = lazy(() => import('../tools/hlt/VitaminDCalculator'));
const FiberIntakeCalculator = lazy(() => import('../tools/hlt/FiberIntakeCalculator'));

const hltTools: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  'bmr-calculator': BmrCalculator,
  'lean-body-mass-calculator': LeanBodyMassCalculator,
  'waist-to-hip-ratio-calculator': WaistToHipRatioCalculator,
  'body-surface-area-calculator': BodySurfaceAreaCalculator,
  'maximum-heart-rate-calculator': MaximumHeartRateCalculator,
  'tdee-calculator': TdeeCalculator,
  'calorie-deficit-calculator': CalorieDeficitCalculator,
  'calorie-calculator': CalorieCalculator,
  'meal-calorie-calculator': MealCalorieCalculator,
  'calories-burned-calculator': CaloriesBurnedCalculator,
  'one-rep-max-calculator': OneRepMaxCalculator,
  'running-pace-calculator': RunningPaceCalculator,
  'vo2-max-calculator': Vo2MaxCalculator,
  'workout-volume-calculator': WorkoutVolumeCalculator,
  'target-heart-rate-calculator': TargetHeartRateCalculator,
  'weight-loss-calculator': WeightLossCalculator,
  'macro-calculator': MacroCalculator,
  'intermittent-fasting-calculator': IntermittentFastingCalculator,
  'body-weight-planner': BodyWeightPlanner,
  'fat-loss-calculator': FatLossCalculator,
  'protein-intake-calculator': ProteinIntakeCalculator,
  'carb-intake-calculator': CarbIntakeCalculator,
  'macro-ratio-calculator': MacroRatioCalculator,
  'vitamin-d-calculator': VitaminDCalculator,
  'fiber-intake-calculator': FiberIntakeCalculator,
};

export default function ToolPage() {
  const { category, slug } = useParams();
  const Tool = category === 'hlt' && slug ? hltTools[slug] : undefined;
  if (!Tool) return <main className="p-8"><h1 className="text-2xl font-bold">Tool not found</h1></main>;
  return <Suspense fallback={<div className="p-8">Loading tool...</div>}><Tool /></Suspense>;
}
