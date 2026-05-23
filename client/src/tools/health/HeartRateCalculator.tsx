import ProfessionalToolShell, { ToolConfig } from "../ProfessionalToolShell";

const config: ToolConfig = {
  "kind": "heartRate",
  "zhTitle": "Heart Rate Calculator（健康）",
  "enTitle": "Heart Rate Calculator",
  "zhDescription": "健康估算工具，結果僅供參考。",
  "enDescription": "Health estimation tool for reference only.",
  "formulaZh": "依健康常用公式估算",
  "formulaEn": "Estimate by common health formulas",
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

export default function HeartRateCalculator() {
  return <ProfessionalToolShell config={config} />;
}
