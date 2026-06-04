// Batch 3 writer — combines parts 1-3 and writes 15 brief JSONs to ./briefs/
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import p1 from "./batch3-briefs-part1.mjs";
import p2 from "./batch3-briefs-part2.mjs";
import p3 from "./batch3-briefs-part3.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BRIEFS = path.join(__dirname, "briefs");
const tools = [...p1, ...p2, ...p3];

let n = 0;
for (const t of tools) {
  const obj = { ...t };
  const fname = obj.file;
  delete obj.file;
  if (obj.computeFnOverride) { obj.computeFn = obj.computeFnOverride; delete obj.computeFnOverride; }
  delete obj.bandKey;
  const fp = path.join(BRIEFS, fname);
  fs.writeFileSync(fp, JSON.stringify(obj, null, 2));
  console.log(`wrote ${fname}  (${obj.id})`);
  n++;
}
console.log(`\n✅ Batch 3: wrote ${n} briefs`);
