import ProfessionalToolShell, { ToolConfig } from "../ProfessionalToolShell";

const config: ToolConfig = {
  "kind": "packing",
  "zhTitle": "行李清單產生器",
  "enTitle": "Packing List Generator",
  "zhDescription": "依天數產生旅行行李清單。",
  "enDescription": "Generate a packing list by trip length.",
  "formulaZh": "清單依旅遊天數與類型產生",
  "formulaEn": "List based on trip days and type",
  "fields": [
    {
      "key": "a",
      "zh": "旅遊天數",
      "en": "Trip days",
      "defaultValue": "5"
    }
  ],
  "noteZh": "此工具提供估算與決策輔助，請依實際情況調整。",
  "noteEn": "This tool provides estimates for planning; adjust for real-world details."
};

export default function PackingListGenerator() {
  return <ProfessionalToolShell config={config} />;
}
