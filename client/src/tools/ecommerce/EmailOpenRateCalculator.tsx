import ProfessionalToolShell, { ToolConfig } from "../ProfessionalToolShell";

const config: ToolConfig = {
  "kind": "emailOpen",
  "zhTitle": "Email開信率計算器",
  "enTitle": "Email Open Rate Calculator",
  "zhDescription": "計算開信率與點擊率。",
  "enDescription": "Calculate email open and click rates.",
  "formulaZh": "開信率 = 開信數 ÷ 發送數 × 100%",
  "formulaEn": "Open rate = opens / sent × 100%",
  "fields": [
    {
      "key": "a",
      "zh": "發送數",
      "en": "Sent emails",
      "defaultValue": "10000"
    },
    {
      "key": "b",
      "zh": "開信數",
      "en": "Opens",
      "defaultValue": "2400"
    },
    {
      "key": "c",
      "zh": "點擊數",
      "en": "Clicks",
      "defaultValue": "360"
    }
  ],
  "noteZh": "此工具提供估算與決策輔助，請依實際情況調整。",
  "noteEn": "This tool provides estimates for planning; adjust for real-world details."
};

export default function EmailOpenRateCalculator() {
  return <ProfessionalToolShell config={config} />;
}
