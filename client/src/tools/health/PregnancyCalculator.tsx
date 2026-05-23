import ProfessionalToolShell, { ToolConfig } from "../ProfessionalToolShell";

const config: ToolConfig = {
  "kind": "pregnancy",
  "zhTitle": "Pregnancy Calculator（健康）",
  "enTitle": "Pregnancy Calculator",
  "zhDescription": "健康估算工具，結果僅供參考。",
  "enDescription": "Health estimation tool for reference only.",
  "formulaZh": "依健康常用公式估算",
  "formulaEn": "Estimate by common health formulas",
  "fields": [
    {
      "key": "date1",
      "zh": "最後月經第一天",
      "en": "Last period date",
      "type": "date",
      "defaultValue": "2026-01-01"
    }
  ],
  "noteZh": "此工具提供估算與決策輔助，請依實際情況調整。",
  "noteEn": "This tool provides estimates for planning; adjust for real-world details."
};

export default function PregnancyCalculator() {
  return <ProfessionalToolShell config={config} />;
}
