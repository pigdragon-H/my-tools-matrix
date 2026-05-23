import ProfessionalToolShell, { ToolConfig } from "../ProfessionalToolShell";

const config: ToolConfig = {
  "kind": "conversion",
  "zhTitle": "轉換率計算器",
  "enTitle": "Conversion Rate Calculator",
  "zhDescription": "計算網站或廣告轉換率。",
  "enDescription": "Calculate site or ad conversion rate.",
  "formulaZh": "轉換率 = 轉換數 ÷ 訪客數 × 100%",
  "formulaEn": "Conversion rate = conversions / visitors × 100%",
  "fields": [
    {
      "key": "a",
      "zh": "總訪客數",
      "en": "Visitors",
      "defaultValue": "10000"
    },
    {
      "key": "b",
      "zh": "轉換數",
      "en": "Conversions",
      "defaultValue": "320"
    }
  ],
  "noteZh": "此工具提供估算與決策輔助，請依實際情況調整。",
  "noteEn": "This tool provides estimates for planning; adjust for real-world details."
};

export default function ConversionRateCalculator() {
  return <ProfessionalToolShell config={config} />;
}
