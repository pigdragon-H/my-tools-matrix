import { lazy } from "react";
import type { LazyExoticComponent, ReactElement } from "react";

type ToolComponent = LazyExoticComponent<() => ReactElement>;

const toolComponentMap: Record<string, ToolComponent> = {
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
};

export default function ScienceToolLoader({ toolKey }: { toolKey: string }) {
  const ToolComponent = toolComponentMap[toolKey];
  if (!ToolComponent) return null;
  return <ToolComponent />;
}
