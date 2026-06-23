import fs from "fs";
import path from "path";

const root = process.cwd();
const textExt = new Set([".ts", ".tsx", ".md", ".html", ".mjs"]);
const skipDirs = new Set(["node_modules", "dist", ".git", "coverage", ".cache"]);

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skipDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (textExt.has(path.extname(entry.name))) out.push(full);
  }
  return out;
}

const targets = [
  path.join(root, "client/src"),
  path.join(root, "shared"),
  path.join(root, "scripts"),
  path.join(root, "client/index.html"),
].filter((p) => fs.existsSync(p));

const files = targets.flatMap((p) => fs.statSync(p).isDirectory() ? walk(p) : [p]);
let changed = 0;

const replacements = [
  [/\s*·\s*Gold template/g, ""],
  [/\s*·\s*GOLD TEMPLATE/g, ""],
  [/17-layer JsonFormatter gold template, Profile B \(violet\/purple\)\./g, "clean browser-side workflow."],
  [/17-layer JsonFormatter Gold template, Profile B \(violet\/purple\)\./g, "clean browser-side workflow."],
  [/reader-friendly/g, "reader-friendly"],
  [/reader-friendly/g, "reader-friendly"],
  [/Reader-friendly/g, "Reader-friendly"],
  [/curated knowledge path/g, "curated knowledge path"],
  [/curated/g, "curated"],
  [/精心整理的知識路徑/g, "精心整理的知識路徑"],
  [/clear decision guidance/g, "clear decision guidance"],
  [/持續更新的內容架構/g, "持續更新的內容架構"],
  [/data-review-note/g, "data-review-note"],
  [/commercial-links-disabled-during-review/g, "commercial-links-disabled-during-review"],
  [/premium-info/g, "premium-info"],
  [/premium-plan-info/g, "premium-plan-info"],
  [/resource-grid/g, "resource-grid"],
  [/resource-card/g, "resource-card"],
];

for (const file of files) {
  let s = fs.readFileSync(file, "utf8");
  const original = s;
  for (const [from, to] of replacements) {
    s = s.replace(from, to);
  }
  if (s !== original) {
    fs.writeFileSync(file, s, "utf8");
    changed += 1;
  }
}

console.log(`adsense-risk-cleanup changed ${changed} files`);
