import ProfessionalToolShell, { ToolConfig } from "../ProfessionalToolShell";

const config: ToolConfig = {
  "kind": "reading",
  "zhTitle": "閱讀時間計算器",
  "enTitle": "Reading Time Calculator",
  "zhDescription": "提升工作效率的專業工具。",
  "enDescription": "Professional productivity tool.",
  "formulaZh": "依輸入資料計算效率指標",
  "formulaEn": "Calculate productivity metrics from inputs",
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

export default function ReadingTimeCalculator() {
  return <ProfessionalToolShell config={config} />;
}
