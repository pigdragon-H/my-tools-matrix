import { lazy } from "react";
import type { LazyExoticComponent, ReactElement } from "react";

type ToolComponent = LazyExoticComponent<() => ReactElement>;

const toolComponentMap: Record<string, ToolComponent> = {
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
  "travel/flight-carbon-calculator": lazy(() => import("@/tools/travel/FlightCarbonCalculator")),
  "travel/travel-miles-calculator": lazy(() => import("@/tools/travel/TravelMilesCalculator")),
};

export default function TravelToolLoader({ toolKey }: { toolKey: string }) {
  const ToolComponent = toolComponentMap[toolKey];
  if (!ToolComponent) return null;
  return <ToolComponent />;
}
