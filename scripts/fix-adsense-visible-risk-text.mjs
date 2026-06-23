import fs from "fs";

function replaceAll(file, replacements) {
  let s = fs.readFileSync(file, "utf8");
  const original = s;
  for (const [from, to] of replacements) {
    if (typeof from === "string") {
      s = s.split(from).join(to);
    } else {
      s = s.replace(from, to);
    }
  }
  if (s !== original) {
    fs.writeFileSync(file, s, "utf8");
    console.log(`updated ${file}`);
  }
}

replaceAll("client/src/pages/ToolPage.tsx", [
  ["可被搜尋引擎讀取的工具頁摘要", "清楚可讀的工具頁摘要"],
  ["本頁提供可直接閱讀的工具用途、輸入情境、結果解讀、FAQ、信任聲明與相關資源摘要，避免搜尋引擎只看到互動元件或空白容器。", "本頁提供可直接閱讀的工具用途、輸入情境、結果解讀、FAQ、信任聲明與相關資源摘要，協助讀者在使用前了解適用情境與限制。"],
  ["crawlerNote", "readerNote"],
  ["search crawlers", "readers"],
  ["so crawlers do not see only interactive widgets or empty containers", "so readers can understand the workflow before using the interactive calculator"],
  ["data-crawler-static", "data-reader-summary"],
  ["ToolCrawlerStaticBlock", "ToolReaderSummaryBlock"],
  ["Crawler-readable static text block", "Reader-friendly summary block"],
  ["bots can read real content immediately", "readers can understand the page immediately"],
]);

replaceAll("shared/toolsConfig.ts", [
  ["browser. clean browser-side workflow.", "browser with a clean client-side workflow."],
]);

console.log("visible risk text cleanup complete");
