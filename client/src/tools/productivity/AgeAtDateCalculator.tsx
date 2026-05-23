import ProfessionalToolShell, { ToolConfig } from "../ProfessionalToolShell";

const config: ToolConfig = {
  "kind": "ageAtDate",
  "zhTitle": "指定日期年齡計算器",
  "enTitle": "Age At Date Calculator",
  "zhDescription": "提升工作效率的專業工具。",
  "enDescription": "Professional productivity tool.",
  "formulaZh": "依輸入資料計算效率指標",
  "formulaEn": "Calculate productivity metrics from inputs",
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

export default function AgeAtDateCalculator() {
  return <ProfessionalToolShell config={config} />;
}
