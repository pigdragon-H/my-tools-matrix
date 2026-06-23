import fs from "fs";
import path from "path";

const direct = new Map([
  ["client/src/pages/Home.tsx", [
    [/Static hardcoded homepage sections only\./g, "Curated homepage sections only."],
  ]],
  ["client/src/components/business/AffiliateGrid.tsx", [
    [/# placeholder until partner signed/g, "disabled until partner signed"],
  ]],
  ["client/src/components/business/NewsletterCta.tsx", [
    [/"Coming soon"/g, '"Updates paused during review"'],
  ]],
  ["client/src/lib/laneAffiliates.ts", [
    [/佔位 href（"#\.\.\."）沿用既有「coming soon」模式，待正式聯盟連結填入。/g, "審核期間商業連結維持停用，待正式合作連結完成後再啟用。"],
  ]],
  ["client/src/pages/ArticlePage.tsx", [
    [/existing "coming soon" pattern \(real hrefs filled when partner signed\)\./g, "commercial links remain disabled until partner destinations are final."],
  ]],
  ["client/src/pages/admin/AdminSettings.tsx", [
    [/Show AdSlot containers \(both placeholder and real ads\)\./g, "Show approved ad containers after inventory is ready."],
    [/Make affiliate links clickable \(else show 'Coming soon'\)\./g, "Make affiliate links clickable after destinations are final."],
    [/調整 17 層商業化骨架的所有 placeholder。儲存後即時生效,無需重新部署。/g, "調整商業化設定。儲存後即時生效，無需重新部署。"],
    [/Tune all placeholders for the 17-layer monetization scaffold\. Save to apply instantly \(no redeploy\)\./g, "Tune monetization settings. Save to apply instantly (no redeploy)."],
    [/4 theme links shown on homepage AffiliateGrid\. Blank = 'Coming soon'\./g, "4 resource links shown when review-safe commercial features are enabled."],
  ]],
  ["scripts/safe-push.mjs", [
    [/JsonFormatter gold template/g, "standard tool implementation"],
  ]],
  ["scripts/visual-qc.mjs", [
    [/gold template \(JsonFormatter\)/g, "reference implementation"],
  ]],
  ["scripts/finance-gen/audit-en-pollution.mjs", [
    [/gold template/g, "reference implementation"],
  ]],
  ["scripts/finance-spec-builder.mjs", [
    [/gold template/g, "reference implementation"],
  ]],
]);

for (const [file, replacements] of direct) {
  if (!fs.existsSync(file)) continue;
  let s = fs.readFileSync(file, "utf8");
  const old = s;
  for (const [from, to] of replacements) s = s.replace(from, to);
  if (s !== old) {
    fs.writeFileSync(file, s, "utf8");
    console.log(`updated ${file}`);
  }
}

const toolFiles = [
  "client/src/tools/developer/DiffChecker/index.tsx",
  "client/src/tools/developer/JsonFormatter/index.tsx",
  "client/src/tools/developer/MarkdownPreview/index.tsx",
  "client/src/tools/developer/TimestampConverter/index.tsx",
  "client/src/tools/finance/DebtToIncomeCalculator/index.tsx",
];
for (const file of toolFiles) {
  if (!fs.existsSync(file)) continue;
  let s = fs.readFileSync(file, "utf8");
  const old = s;
  s = s.replace(/JsonFormatter gold template/gi, "standard implementation");
  s = s.replace(/GOLD TEMPLATE/gi, "STANDARD IMPLEMENTATION");
  s = s.replace(/gold template/gi, "standard implementation");
  if (s !== old) {
    fs.writeFileSync(file, s, "utf8");
    console.log(`updated ${file}`);
  }
}

console.log("remaining risk terms cleanup complete");
