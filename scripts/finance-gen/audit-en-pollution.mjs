#!/usr/bin/env node
// Audit a generated finance tool index.tsx for Chinese-text pollution that would
// render in EN mode. Reports any CJK that is NOT inside a legitimate zh slot.
//
// Legitimate zh-bearing slots (allowed to contain CJK):
//   - the entire `zh: { ... }` translation object
//   - `label: { zh: "..." , en: ... }` and `desc: { zh: "...", en: ... }`  -> only the zh: part
//   - `{ zh: "中文", en: "English" }` affiliate label pairs -> only zh: part
//   - `switchToChinese`, `chineseShort`, `premiumChips_zh`  (en-block but legitimately Chinese)
//   - `lang === "zh" ? "中文" : "English"` ternaries (the zh literal)
//   - top-of-file comment line
//   - aria-label / section labels written in Chinese by design (structural, not user-visible copy)
//
// Strategy: line-based. For each line containing CJK, strip out all the allowed
// zh slots, then if CJK remains -> POLLUTION.

import fs from "node:fs";

const file = process.argv[2];
if (!file) { console.error("usage: node audit-en-pollution.mjs <index.tsx>"); process.exit(1); }
const src = fs.readFileSync(file, "utf8");
const lines = src.split("\n");

const CJK = /[\u3400-\u9fff\uf900-\ufaff]/;

// remove a `key: "....."` (double-quoted, allowing escaped quotes) for given keys
function stripKey(line, key) {
  const re = new RegExp(`${key}\\s*:\\s*"(?:[^"\\\\]|\\\\.)*"`, "g");
  return line.replace(re, `${key}:""`);
}
// remove zh: "..." occurrences (object pair zh literals: bands label/desc, affiliate labels)
function stripZhLiteral(line) {
  return line.replace(/zh\s*:\s*"(?:[^"\\]|\\.)*"/g, 'zh:""');
}
// remove lang === "zh" ? "中文..." : "English" -> keep english only
function stripZhTernary(line) {
  // zh-side string literal (zh first): lang === "zh" ? "中文" :
  line = line.replace(/lang\s*===\s*"zh"\s*\?\s*"(?:[^"\\]|\\.)*"\s*:/g, 'lang==="zh"?"":');
  // zh-side array literal (zh first): lang === "zh" ? [...] :
  line = line.replace(/lang\s*===\s*"zh"\s*\?\s*\[[^\]]*\]\s*:/g, 'lang==="zh"?[]:');
  // reversed: lang === "zh" ? "EN" : "中文"   (zh on the false branch when condition is !zh elsewhere)
  // also handle lang !== "zh" ? "English" : "中文"
  line = line.replace(/lang\s*(===|!==)\s*"zh"\s*\?\s*"(?:[^"\\]|\\.)*"\s*:\s*"(?:[^"\\]|\\.)*"/g, 'TERN');
  return line;
}

let pollution = [];
lines.forEach((raw, idx) => {
  const lineNo = idx + 1;
  if (!CJK.test(raw)) return;
  // skip the top file comment
  if (/^\s*\/\//.test(raw)) return;

  let line = raw;
  // strip JSX/JS comments (never rendered): {/* ... */}, /* ... */, // ...
  line = line.replace(/\{\/\*[\s\S]*?\*\/\}/g, "");
  line = line.replace(/\/\*[\s\S]*?\*\//g, "");
  line = line.replace(/\/\/.*$/g, "");
  if (!CJK.test(line)) return;
  line = stripZhTernary(line);
  line = stripZhLiteral(line);
  // structural L-layer aria-label markers (Chinese by design — identical to reference implementation, not user-visible copy)
  line = line.replace(/aria-label="L[0-9][^"]*"/g, 'aria-label=""');
  // en-block legitimate Chinese keys
  for (const k of ["switchToChinese", "chineseShort", "premiumChips_zh"]) line = stripKey(line, k);

  // Now detect if we're inside the zh: {...} translation object region.
  // We treat any line between the `zh: {` opener and its matching close as allowed.
  if (CJK.test(line)) pollution.push({ lineNo, text: raw.trim().slice(0, 160) });
});

// Second pass: drop lines that fall inside the top-level `zh: {` ... `},` object.
// Find region bounds by brace tracking starting at the `zh: {` line.
let zhStart = -1, zhEnd = -1, depth = 0, started = false;
for (let i = 0; i < lines.length; i++) {
  if (zhStart === -1 && /^\s*zh:\s*\{/.test(lines[i])) { zhStart = i; depth = 0; started = true; }
  if (started) {
    for (const ch of lines[i]) { if (ch === "{") depth++; else if (ch === "}") depth--; }
    if (depth === 0 && i > zhStart) { zhEnd = i; break; }
  }
}
if (zhStart !== -1) {
  pollution = pollution.filter(p => !(p.lineNo - 1 >= zhStart && p.lineNo - 1 <= zhEnd));
}

if (pollution.length === 0) {
  console.log(`✅ CLEAN  ${file}`);
  process.exit(0);
} else {
  console.log(`❌ POLLUTION (${pollution.length})  ${file}`);
  for (const p of pollution) console.log(`   L${p.lineNo}: ${p.text}`);
  process.exit(1);
}
