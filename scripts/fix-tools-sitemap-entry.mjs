import fs from "fs";

const file = "scripts/generate-sitemap.ts";
let s = fs.readFileSync(file, "utf8");
const needle = `// 分類頁\nfor (const cat of uniqueCats) addUrl(\`/category/\${cat}\`, "weekly", "0.9");`;
const replacement = `// 工具總覽頁\naddUrl("/tools", "weekly", "0.9");\n\n// 分類頁\nfor (const cat of uniqueCats) addUrl(\`/category/\${cat}\`, "weekly", "0.9");`;
if (!s.includes(needle)) {
  throw new Error("sitemap category insertion point not found");
}
s = s.replace(needle, replacement);
fs.writeFileSync(file, s, "utf8");
console.log("/tools added to sitemap generation");
