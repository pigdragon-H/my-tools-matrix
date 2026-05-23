import ProfessionalToolShell, { ToolConfig } from "../ProfessionalToolShell";

const config: ToolConfig = {
  "kind": "healthAge",
  "zhTitle": "Age Calculator（健康）",
  "enTitle": "Age Calculator",
  "zhDescription": "健康估算工具，結果僅供參考。",
  "enDescription": "Health estimation tool for reference only.",
  "formulaZh": "依健康常用公式估算",
  "formulaEn": "Estimate by common health formulas",
  "fields": [
    {
      "key": "date1",
      "zh": "生日",
      "en": "Birth date",
      "type": "date",
      "defaultValue": "1990-01-01"
    },
    {
      "key": "date2",
      "zh": "目標日期",
      "en": "Target date",
      "type": "date",
      "defaultValue": "2026-05-23"
    }
  ],
  "noteZh": "此工具提供估算與決策輔助，請依實際情況調整。",
  "noteEn": "This tool provides estimates for planning; adjust for real-world details."
};

export default function AgeCalculator() {
  return <ProfessionalToolShell config={config} />;
}
