import ProfessionalToolShell, { ToolConfig } from "../ProfessionalToolShell";

const config: ToolConfig = {
  "kind": "deadline",
  "zhTitle": "截止日期計算器",
  "enTitle": "Deadline Calculator",
  "zhDescription": "提升工作效率的專業工具。",
  "enDescription": "Professional productivity tool.",
  "formulaZh": "依輸入資料計算效率指標",
  "formulaEn": "Calculate productivity metrics from inputs",
  "fields": [
    {
      "key": "date1",
      "zh": "開始日期",
      "en": "Start date",
      "type": "date",
      "defaultValue": "2026-05-23"
    },
    {
      "key": "a",
      "zh": "工作天數",
      "en": "Business days",
      "defaultValue": "10"
    }
  ],
  "noteZh": "此工具提供估算與決策輔助，請依實際情況調整。",
  "noteEn": "This tool provides estimates for planning; adjust for real-world details."
};

export default function DeadlineCalculator() {
  return <ProfessionalToolShell config={config} />;
}
