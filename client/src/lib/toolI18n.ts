// ============================================================
// toolI18n.ts — 工具雙語顯示共用工具（沿用全站既有機制）
// ------------------------------------------------------------
// 背景（最高指揮官指示）：
//   除了分類頁的數百張計算機卡片之外，全站其他單元（首頁、工具頁
//   ToolPage、知識庫…）早已是中英文雙語。它們取得英文名稱／分類名稱
//   的方式如下（本檔將同一套機制抽成共用，供 ToolPage 與 CategoryPage
//   一致使用，避免重複維護、避免再翻譯 688 筆）：
//
//   英文工具名稱：
//     - 若 toolsConfig 有 nameEn 且不含中文字 → 直接用 nameEn
//     - 否則 → 由 URL slug 以 titleCaseFromSlug 推導（bmi-calculator → BMI Calculator）
//   中文工具名稱：
//     - nameZh ?? name
//   英文描述：
//     - toolsConfig 工具沒有 per-tool 英文描述庫（ToolPage 亦然），
//       因此採「英文模板句」描述（與 ToolPage summary 同策略）。
//   英文分類名稱：
//     - categoriesConfig 的 nameEn（已存在、已填）。
// ============================================================

// 與 ToolPage.tsx 完全一致的縮寫白名單
const ACRONYMS = [
  "AI", "API", "BMI", "BMR", "TDEE", "UTM", "CPM", "CPC",
  "RGB", "HSL", "JSON", "HTML", "FAQ",
];

/** 由 slug（如 bmi-calculator）推導 Title Case 英文名（如 BMI Calculator）。 */
export function titleCaseFromSlug(value: string): string {
  return value
    .split("-")
    .filter(Boolean)
    .map((word) => {
      const upperWord = word.toUpperCase();
      if (ACRONYMS.includes(upperWord)) return upperWord;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

// 工具最小型別：只取本檔需要的欄位（與 toolsConfig.Tool 相容）
interface ToolLike {
  id: string;
  path: string;
  name: string;
  nameZh?: string;
  description: string;
  nameEn?: string;
}

const CJK = /[\u3400-\u9fff]/;

/** 英文工具名稱：nameEn（無中文）優先，否則由 slug 推導。 */
export function getEnglishToolName(tool: ToolLike): string {
  if (tool.nameEn && !CJK.test(tool.nameEn)) return tool.nameEn;
  const slug = tool.path.split("/").filter(Boolean).at(-1) ?? tool.id;
  return titleCaseFromSlug(slug);
}

/** 中文工具名稱：nameZh ?? name。 */
export function getChineseToolName(tool: ToolLike): string {
  return tool.nameZh ?? tool.name;
}

/** 依語言取得工具顯示名稱。 */
export function getToolName(tool: ToolLike, lang: "zh" | "en"): string {
  return lang === "zh" ? getChineseToolName(tool) : getEnglishToolName(tool);
}

/**
 * 依語言取得工具描述。
 * zh：直接用 toolsConfig 的中文 description。
 * en：toolsConfig 無 per-tool 英文描述庫，採英文模板句（同 ToolPage 策略），
 *     讓國際訪客與爬蟲看到可讀的英文敘述，而非中文。
 */
export function getToolDescription(
  tool: ToolLike,
  lang: "zh" | "en",
  categoryNameEn?: string,
): string {
  if (lang === "zh") return tool.description;
  const name = getEnglishToolName(tool);
  const cat = categoryNameEn ? `${categoryNameEn} ` : "";
  return `Use ${name}, a free online ${cat}calculator on Formula Universe, for fast and accurate results with clear, browser-readable guidance.`;
}
