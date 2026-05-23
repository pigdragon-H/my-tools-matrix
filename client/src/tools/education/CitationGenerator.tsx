import ProfessionalToolShell, { ToolConfig } from "../ProfessionalToolShell";

const config: ToolConfig = {
  "kind": "default",
  "zhTitle": "引用格式產生器",
  "enTitle": "Citation Generator",
  "zhDescription": "專業教育工具與學習分析。",
  "enDescription": "Professional education and learning analysis.",
  "formulaZh": "依輸入資料計算與產生建議",
  "formulaEn": "Calculate and suggest from inputs",
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

export default function CitationGenerator() {
  return <ProfessionalToolShell config={config} />;
}
