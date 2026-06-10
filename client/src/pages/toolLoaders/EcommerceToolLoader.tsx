import { lazy } from "react";
import type { LazyExoticComponent, ReactElement } from "react";

type ToolComponent = LazyExoticComponent<() => ReactElement>;

const toolComponentMap: Record<string, ToolComponent> = {
  "ecommerce/inventory-turnover-calculator": lazy(() => import("@/tools/ecommerce/InventoryTurnoverCalculator")),
  "ecommerce/safety-stock-calculator": lazy(() => import("@/tools/ecommerce/SafetyStockCalculator")),
  "ecommerce/eoq-calculator": lazy(() => import("@/tools/ecommerce/EoqCalculator")),
  "ecommerce/warehouse-cost-calculator": lazy(() => import("@/tools/ecommerce/WarehouseCostCalculator")),
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
  "ecommerce/amazon-fba-calculator": lazy(() => import("@/tools/ecommerce/AmazonFbaCalculator")),
  "ecommerce/dropshipping-profit-calculator": lazy(() => import("@/tools/ecommerce/DropshippingProfitCalculator")),
  "ecommerce/etsy-fee-calculator": lazy(() => import("@/tools/ecommerce/EtsyFeeCalculator")),
  "ecommerce/utm-builder": lazy(() => import("@/tools/ecommerce/UtmBuilder")),
  "ecommerce/cpm-calculator": lazy(() => import("@/tools/ecommerce/CpmCalculator")),
};

export default function EcommerceToolLoader({ toolKey }: { toolKey: string }) {
  const ToolComponent = toolComponentMap[toolKey];
  if (!ToolComponent) return null;
  return <ToolComponent />;
}
