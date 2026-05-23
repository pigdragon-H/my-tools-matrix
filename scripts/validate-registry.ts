import { readFileSync, existsSync } from "fs";
import { join } from "path";

function readJson(path: string) {
  return JSON.parse(readFileSync(path, "utf-8").replace(/^\uFEFF/, ""));
}

function validateRegistry() {
  const registry = readJson(join(process.cwd(), "docs/tool-registry.json"));

  const errors: string[] = [];
  const warnings: string[] = [];
  const ids = new Set<string>();
  const slugs = new Set<string>();

  const validWebsiteKeys = [
    "finance","health","productivity","dev",
    "education","legal","design","science",
    "language","ecommerce","travel","ai"
  ];

  for (const tool of registry.tools) {
    // 檢查必要欄位（fatal）
    const required = ["canonical_id","slug","website_key","status"];
    for (const field of required) {
      if (!tool[field]) {
        errors.push(`❌ 缺少欄位 ${field}: ${tool.canonical_id ?? "unknown"}`);
      }
    }

    // 檢查重複 ID（fatal，Identity 不可重複）
    if (tool.canonical_id) {
      if (ids.has(tool.canonical_id)) {
        errors.push(`❌ 重複 canonical_id: ${tool.canonical_id}`);
      }
      ids.add(tool.canonical_id);
    }

    // 檢查重複 slug route（audit warning：現有 registry 可能已有 legacy collision，不在本腳本修改 registry）
    if (tool.website_key && tool.slug) {
      const slugKey = `${tool.website_key}/${tool.slug}`;
      if (slugs.has(slugKey)) {
        warnings.push(`⚠️ 重複路由: ${slugKey}`);
      }
      slugs.add(slugKey);
    }

    // 檢查 website_key（audit warning：不在本任務修改 registry）
    if (tool.website_key && !validWebsiteKeys.includes(tool.website_key)) {
      warnings.push(`⚠️ 非標準 website_key: ${tool.website_key} (${tool.canonical_id})`);
    }

    // 檢查元件檔案是否存在（warning）
    if (tool.status === "active" && tool.website_key && tool.slug) {
      const componentName = tool.slug.split("-")
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join("");
      const componentPath = join(
        process.cwd(),
        `client/src/tools/${tool.website_key}/${componentName}.tsx`
      );
      if (!existsSync(componentPath)) {
        warnings.push(`⚠️ 缺少元件: ${tool.website_key}/${componentName}.tsx (${tool.canonical_id})`);
      }
    }
  }

  console.log(`\n=== Registry 驗證報告 ===`);
  console.log(`總工具數: ${registry.tools.length}`);
  console.log(`Active: ${registry.tools.filter((t: any) => t.status === "active").length}`);
  console.log(`錯誤: ${errors.length}`);
  console.log(`警告: ${warnings.length}\n`);

  if (errors.length > 0) {
    console.log("=== 錯誤（必須修復）===");
    errors.forEach(e => console.log(e));
  }

  if (warnings.length > 0) {
    console.log("\n=== 警告（建議修復）===");
    warnings.forEach(w => console.log(w));
  }

  if (errors.length === 0) {
    console.log("✅ Registry 驗證通過！");
  }

  process.exit(errors.length > 0 ? 1 : 0);
}

validateRegistry();
