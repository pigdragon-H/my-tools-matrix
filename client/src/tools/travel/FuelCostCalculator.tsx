import ProfessionalToolShell, { ToolConfig } from "../ProfessionalToolShell";

const config: ToolConfig = {
  "kind": "fuel",
  "zhTitle": "油費計算器",
  "enTitle": "Fuel Cost Calculator",
  "zhDescription": "計算總油費與每公里成本。",
  "enDescription": "Calculate total fuel cost and cost per km.",
  "formulaZh": "油費 = 距離 × 油耗 ÷ 100 × 油價",
  "formulaEn": "Fuel cost = distance × consumption / 100 × price",
  "fields": [
    {
      "key": "a",
      "zh": "距離",
      "en": "Distance",
      "unitZh": "km",
      "unitEn": "km",
      "defaultValue": "300"
    },
    {
      "key": "b",
      "zh": "油耗",
      "en": "Consumption",
      "unitZh": "L/100km",
      "unitEn": "L/100km",
      "defaultValue": "7.5"
    },
    {
      "key": "c",
      "zh": "油價",
      "en": "Fuel price",
      "unitZh": "元/L",
      "unitEn": "per L",
      "defaultValue": "32"
    }
  ],
  "noteZh": "此工具提供估算與決策輔助，請依實際情況調整。",
  "noteEn": "This tool provides estimates for planning; adjust for real-world details."
};

export default function FuelCostCalculator() {
  return <ProfessionalToolShell config={config} />;
}
