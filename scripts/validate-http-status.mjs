#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SITEMAP_FILE = path.join(ROOT, "client/public/sitemap.xml");
const MIGRATION_MAP_FILE = path.join(ROOT, "server/data/route-migration-map.json");
const REPORT_FILE = path.join(ROOT, "validation-report.json");

const BASE_URL = process.env.BASE_URL || "https://my-tools-matrix-production.up.railway.app";

console.log("🔍 W5 驗證腳本開始執行...");
console.log(`Base URL: ${BASE_URL}`);

// 讀取 sitemap
const sitemapXml = fs.readFileSync(SITEMAP_FILE, "utf8");
const sitemapUrls = [];
const locRegex = /<loc>([^<]+)<\/loc>/g;
let match;
while ((match = locRegex.exec(sitemapXml)) !== null) {
  const url = match[1];
  const pathname = new URL(url).pathname;
  sitemapUrls.push(pathname);
}

console.log(`✓ Sitemap 中找到 ${sitemapUrls.length} 個 URL`);

// 讀取 migration map
const migrationMap = JSON.parse(fs.readFileSync(MIGRATION_MAP_FILE, "utf8"));
const class_B_301 = Object.entries(migrationMap.class_B_redirects_301 || {});
const class_C_410 = migrationMap.class_C_gone_410 || [];

console.log(`✓ Migration map 中找到 ${class_B_301.length} 條 301 重定向`);
console.log(`✓ Migration map 中找到 ${class_C_410.length} 條 410 已刪除`);

// 驗證報告
const report = {
  timestamp: new Date().toISOString(),
  base_url: BASE_URL,
  results: {
    sitemap_200: { total: sitemapUrls.length, passed: 0, failed: [] },
    class_B_301: { total: class_B_301.length, passed: 0, failed: [] },
    class_C_410: { total: class_C_410.length, passed: 0, failed: [] },
    trailing_slash: { total: 20, passed: 0, failed: [] },
    random_404: { total: 5, passed: 0, failed: [] },
    noindex_check: { total: 5, passed: 0, failed: [] },
  },
};

// 快速驗證（抽樣）
console.log("\n📋 執行抽樣驗證...");

// 抽樣 10 個 sitemap URL
const sitemapSample = sitemapUrls.slice(0, 10);
for (const url of sitemapSample) {
  try {
    const response = execSync(`curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}${url}"`, { encoding: "utf8" });
    if (response === "200") {
      report.results.sitemap_200.passed++;
    } else {
      report.results.sitemap_200.failed.push({ url, status: response });
    }
  } catch (e) {
    report.results.sitemap_200.failed.push({ url, error: String(e) });
  }
}

// 抽樣 5 個 301 重定向
const class_B_sample = class_B_301.slice(0, 5);
for (const [oldPath, newPath] of class_B_sample) {
  try {
    const response = execSync(`curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}${oldPath}"`, { encoding: "utf8" });
    if (response === "301" || response === "302") {
      report.results.class_B_301.passed++;
    } else {
      report.results.class_B_301.failed.push({ old_path: oldPath, status: response });
    }
  } catch (e) {
    report.results.class_B_301.failed.push({ old_path: oldPath, error: String(e) });
  }
}

// 抽樣 5 個 410 已刪除
const class_C_sample = class_C_410.slice(0, 5);
for (const oldPath of class_C_sample) {
  try {
    const response = execSync(`curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}${oldPath}"`, { encoding: "utf8" });
    if (response === "410") {
      report.results.class_C_410.passed++;
    } else {
      report.results.class_C_410.failed.push({ path: oldPath, status: response });
    }
  } catch (e) {
    report.results.class_C_410.failed.push({ path: oldPath, error: String(e) });
  }
}

// 隨機 404 驗證
const randomPaths = ["/zzz999", "/tools/nonexistent", "/invalid/path", "/test123", "/random-404"];
for (const randomPath of randomPaths) {
  try {
    const response = execSync(`curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}${randomPath}"`, { encoding: "utf8" });
    if (response === "404") {
      report.results.random_404.passed++;
    } else {
      report.results.random_404.failed.push({ path: randomPath, status: response });
    }
  } catch (e) {
    report.results.random_404.failed.push({ path: randomPath, error: String(e) });
  }
}

// 保存報告
fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
console.log(`\n✅ 驗證完成，報告已保存至 ${REPORT_FILE}`);
console.log(`\n📊 驗證結果摘要:`);
console.log(`  Sitemap 200: ${report.results.sitemap_200.passed}/${report.results.sitemap_200.total}`);
console.log(`  Class B 301: ${report.results.class_B_301.passed}/${report.results.class_B_301.total}`);
console.log(`  Class C 410: ${report.results.class_C_410.passed}/${report.results.class_C_410.total}`);
console.log(`  Random 404: ${report.results.random_404.passed}/${report.results.random_404.total}`);

process.exit(0);
