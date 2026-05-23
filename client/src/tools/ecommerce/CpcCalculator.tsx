import ProfessionalToolShell, { ToolConfig } from "../ProfessionalToolShell";

const config: ToolConfig = {
  "kind": "cpc",
  "zhTitle": "CPC計算器",
  "enTitle": "CPC Calculator",
  "zhDescription": "計算每次點擊成本與ROI。",
  "enDescription": "Calculate cost per click and ROI.",
  "formulaZh": "CPC = 總花費 ÷ 點擊數",
  "formulaEn": "CPC = spend / clicks",
  "fields": [
    {
      "key": "a",
      "zh": "總花費",
      "en": "Ad spend",
      "defaultValue": "1000"
    },
    {
      "key": "b",
      "zh": "點擊數",
      "en": "Clicks",
      "defaultValue": "500"
    },
    {
      "key": "c",
      "zh": "收益",
      "en": "Revenue",
      "defaultValue": "1800"
    }
  ],
  "noteZh": "此工具提供估算與決策輔助，請依實際情況調整。",
  "noteEn": "This tool provides estimates for planning; adjust for real-world details."
};

export default function CpcCalculator() {
  return <ProfessionalToolShell config={config} />;
}
