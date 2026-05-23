import ProfessionalToolShell, { ToolConfig } from "../ProfessionalToolShell";

const config: ToolConfig = {
  "kind": "timezone",
  "zhTitle": "時區轉換器",
  "enTitle": "Timezone Converter",
  "zhDescription": "顯示全球主要城市時區對照。",
  "enDescription": "Show major city time zone references.",
  "formulaZh": "依UTC偏移換算",
  "formulaEn": "Convert by UTC offset",
  "fields": [
    {
      "key": "time",
      "zh": "時間",
      "en": "Time",
      "type": "time",
      "defaultValue": "09:00"
    }
  ],
  "noteZh": "此工具提供估算與決策輔助，請依實際情況調整。",
  "noteEn": "This tool provides estimates for planning; adjust for real-world details."
};

export default function TimezoneConverter() {
  return <ProfessionalToolShell config={config} />;
}
