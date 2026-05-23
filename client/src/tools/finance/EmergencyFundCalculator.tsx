import ProfessionalToolShell, { ToolConfig } from "../ProfessionalToolShell";

const config: ToolConfig = {
  "kind": "roi",
  "zhTitle": "Emergency Fund Calculator（專業）",
  "enTitle": "Emergency Fund Calculator",
  "zhDescription": "專業財務計算器，提供公式與範例值。",
  "enDescription": "Professional finance calculator with formulas and examples.",
  "formulaZh": "依財務公式計算收益、成本、稅費或比率",
  "formulaEn": "Calculate returns, costs, taxes or ratios by finance formulas",
  "fields": [
    {
      "key": "a",
      "zh": "數值 A",
      "en": "Value A",
      "defaultValue": "100"
    },
    {
      "key": "b",
      "zh": "數值 B",
      "en": "Value B",
      "defaultValue": "25"
    },
    {
      "key": "c",
      "zh": "數值 C",
      "en": "Value C",
      "defaultValue": "10"
    }
  ],
  "noteZh": "此工具提供估算與決策輔助，請依實際情況調整。",
  "noteEn": "This tool provides estimates for planning; adjust for real-world details."
};

export default function EmergencyFundCalculator() {
  return <ProfessionalToolShell config={config} />;
}
