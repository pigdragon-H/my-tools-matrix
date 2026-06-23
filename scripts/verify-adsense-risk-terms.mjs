import fs from "fs";
import path from "path";

const roots = ["client/src", "shared", "public", "client/public", "scripts"];
const skipDirs = new Set(["node_modules", "dist", ".git", "coverage", ".cache"]);
const exts = new Set([".ts", ".tsx", ".js", ".mjs", ".html", ".md", ".xml", ".json"]);

const patterns = [
  /crawler-readable/i,
  /crawler readable/i,
  /search crawlers/i,
  /future data wiring/i,
  /static hardcoded/i,
  /GOLD TEMPLATE/i,
  /Gold template/i,
  /AD 廣告位/,
  /Advertisement/,
  /under construction/i,
  /coming soon/i,
  /data-stub/i,
  /placeholder/i,
];

const allowed = [
  /scripts\/verify-adsense-risk-terms\.mjs/,
  /scripts\/adsense-risk-cleanup\.mjs/,
  /scripts\/adsense-review-hardening\.mjs/,
  /deliverables\//,
  /risk_grep_raw/,
  /placeholder=\{/,
  /placeholder:/,
  /placeholderText/,
  /inputPlaceholder/,
  /searchPlaceholder/,
  /emptyPlaceholder/,
  /placeholder-/, 
  /::placeholder/,
  /placeholder="/,
  /Placeholder/,
  /ADSENSE_PUBLISHER_ID/,
  /Advertisement/i,
];

function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skipDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (exts.has(path.extname(entry.name))) out.push(full);
  }
  return out;
}

const findings = [];
for (const file of roots.flatMap(walk)) {
  const text = fs.readFileSync(file, "utf8");
  const lines = text.split(/\r?\n/);
  lines.forEach((line, idx) => {
    if (!patterns.some((re) => re.test(line))) return;
    const ref = `${file}:${idx + 1}:${line.trim()}`;
    if (allowed.some((re) => re.test(ref))) return;
    findings.push(ref);
  });
}

fs.mkdirSync("deliverables/adsense_risk", { recursive: true });
fs.writeFileSync("deliverables/adsense_risk/risk_terms_verify.txt", findings.join("\n") + (findings.length ? "\n" : ""));
console.log(`risk term findings: ${findings.length}`);
for (const finding of findings.slice(0, 80)) console.log(finding);
if (findings.length > 0) process.exitCode = 1;
