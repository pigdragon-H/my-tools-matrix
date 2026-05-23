import ProfessionalToolShell, { ToolConfig } from "../ProfessionalToolShell";

const config: ToolConfig = {
  "kind": "ltv",
  "zhTitle": "客戶終身價值計算器",
  "enTitle": "Customer Lifetime Value",
  "zhDescription": "估算客戶終身價值。",
  "enDescription": "Estimate customer lifetime value.",
  "formulaZh": "LTV = 平均訂單 × 頻率 × 壽命",
  "formulaEn": "LTV = AOV × frequency × lifespan",
  "fields": [
    {
      "key": "a",
      "zh": "平均訂單金額",
      "en": "Average order value",
      "defaultValue": "80"
    },
    {
      "key": "b",
      "zh": "年購買頻率",
      "en": "Annual frequency",
      "defaultValue": "4"
    },
    {
      "key": "c",
      "zh": "客戶壽命",
      "en": "Customer lifespan",
      "unitZh": "年",
      "unitEn": "years",
      "defaultValue": "3"
    },
    {
      "key": "d",
      "zh": "CAC",
      "en": "CAC",
      "defaultValue": "50"
    }
  ],
  "noteZh": "此工具提供估算與決策輔助，請依實際情況調整。",
  "noteEn": "This tool provides estimates for planning; adjust for real-world details."
};

export default function CustomerLifetimeValue() {
  return <ProfessionalToolShell config={config} />;
}
