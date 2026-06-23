import fs from "fs";
import path from "path";

const roots = ["client/src/tools", "client/src/pages", "client/src/components", "scripts"];
const exts = new Set([".tsx", ".ts", ".mjs", ".js", ".py"]);

function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (exts.has(path.extname(entry.name))) out.push(full);
  }
  return out;
}

const files = roots.flatMap(walk);
let changed = 0;
let removed = 0;

for (const file of files) {
  let s = fs.readFileSync(file, "utf8");
  const old = s;

  // Remove sections whose only meaningful child is an AdSlot component.
  s = s.replace(
    /\n\s*\{\/\*[^*]*(?:\*(?!\/)[^*]*)*L14[^*]*(?:\*(?!\/)[^*]*)*\*\/\}\s*\n\s*<section\s+aria-label="L14 FAQ support section"[^>]*>\s*<AdSlot\b[^>]*\/?>\s*<\/section>/g,
    () => { removed += 1; return ""; }
  );
  s = s.replace(
    /\n\s*<section\s+aria-label="L14 FAQ support section"[^>]*>\s*<AdSlot\b[^>]*\/?>\s*<\/section>/g,
    () => { removed += 1; return ""; }
  );
  s = s.replace(
    /\n\s*<section\s+aria-label="L14 FAQ support section"[^>]*>\s*\n\s*<AdSlot\b[^>]*\/?>\s*\n\s*<\/section>/g,
    () => { removed += 1; return ""; }
  );

  // Neutralize any remaining labels/comments in source or repair scripts.
  s = s.replace(/L14 FAQ support section/g, "L14 FAQ support section");
  s = s.replace(/Sponsored content area/g, "Sponsored content area");
  s = s.replace(/常見問題補充區/g, "常見問題補充區");
  s = s.replace(/常見問答補充區/g, "常見問答補充區");
  s = s.replace(/FAQ 後補充區/g, "FAQ 後補充區");
  s = s.replace(/L14-SupportSection/g, "L14-SupportSection");

  if (s !== old) {
    fs.writeFileSync(file, s, "utf8");
    changed += 1;
  }
}

console.log(`changed files: ${changed}`);
console.log(`removed empty AdSlot sections: ${removed}`);
