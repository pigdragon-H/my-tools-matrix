import ProfessionalToolShell, { ToolConfig } from "../ProfessionalToolShell";

const config: ToolConfig = {
  "kind": "essay",
  "zhTitle": "文章字數計算器",
  "enTitle": "Essay Word Count",
  "zhDescription": "專業教育工具與學習分析。",
  "enDescription": "Professional education and learning analysis.",
  "formulaZh": "依輸入資料計算與產生建議",
  "formulaEn": "Calculate and suggest from inputs",
  "fields": [
    {
      "key": "text",
      "zh": "文章內容",
      "en": "Essay text",
      "type": "textarea",
      "defaultValue": "This is a sample essay for word count."
    }
  ],
  "noteZh": "此工具提供估算與決策輔助，請依實際情況調整。",
  "noteEn": "This tool provides estimates for planning; adjust for real-world details."
};

export default function EssayWordCount() {
  return <ProfessionalToolShell config={config} />;
}
