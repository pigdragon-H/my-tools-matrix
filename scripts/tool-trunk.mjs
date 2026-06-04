#!/usr/bin/env node
// ============================================================
// tool-trunk.mjs — 工具名單樹幹系統 (Tool-Roster Trunk/Tree System)
// ------------------------------------------------------------
// PURPOSE
//   A single, human-readable "trunk" view of the entire tool roster, plus a
//   machine-readable manifest (tool-trunk.json). It is the canopy on top of
//   the THREE structures every tool must keep in sync:
//
//     (A) shared/toolsConfig.ts          — tools[] array + export const mirror
//     (B) client/src/pages/ToolPage.tsx  — toolComponentMap "cat/id" -> @/tools/<cat>/<Comp>
//     (C) filesystem                      — client/src/tools/<cat>/<Comp>/index.tsx
//
//   The hard 3-structure consistency gate already lives in
//   scripts/validate-registry.mjs (Gate 1, checks A–H). This script REUSES the
//   same proven parsers and ADDS the conflict classes Gate 1 does not cover —
//   the silent drift risks Victor asked us to pre-empt (以免衝突):
//
//     • DUP_REGISTRY_ID   — same id twice in tools[]            (Gate1 misses)
//     • DUP_EXPORT_CONST  — same export-const var twice          (Gate1 misses)
//     • DUP_COMPONENT_DIR — same component dir name in 2 cats    (import collision)
//     • DUP_ROUTE_KEY     — same "cat/id" route key twice        (Gate1 misses)
//     • RESERVED_ID       — id collides with a router/page word
//
// USAGE
//   node scripts/tool-trunk.mjs            # tree + audit, exit 1 on ERROR
//   node scripts/tool-trunk.mjs --tree     # only the tree
//   node scripts/tool-trunk.mjs --json     # (re)write scripts/tool-trunk.json
//   node scripts/tool-trunk.mjs --audit    # only the conflict audit
// ============================================================
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { resolve, join } from "node:path";

const ROOT = resolve(new URL(import.meta.url).pathname, "../..");
const CFG = join(ROOT, "shared/toolsConfig.ts");
const ROUTER = join(ROOT, "client/src/pages/ToolPage.tsx");
const TOOLS_DIR = join(ROOT, "client/src/tools");

const read = (p) => readFileSync(p, "utf8");
const kebabToCamel = (s) => s.split("-").map((p, i) => (i === 0 ? p : p[0].toUpperCase() + p.slice(1))).join("");
const kebabToPascal = (s) => s.split("-").map((p) => p[0].toUpperCase() + p.slice(1)).join("");

// ---------- (A) parse tools[] array — SAME chunk-based regex as Gate 1 ----------
function parseToolsArray(cfgText) {
  const tools = [];
  const blockRe = /\{\s*id:\s*"([a-z0-9-]+)",((?:(?!\n\s*\{)[\s\S])*?)\n\s*\},/g;
  let m;
  while ((m = blockRe.exec(cfgText)) !== null) {
    const id = m[1];
    const body = m[2];
    const cat = body.match(/category:\s*"([a-z]+)"/);
    const p = body.match(/path:\s*"([^"]+)"/);
    const name = body.match(/name:\s*"([^"]+)"/);
    if (!cat || !p) continue;
    tools.push({ id, category: cat[1], path: p[1], name: name ? name[1] : "" });
  }
  return tools;
}

// ---------- (A2) parse export const mirrors — SAME regex as Gate 1 ----------
function parseExports(cfgText) {
  const exportRe = /export const ([a-zA-Z][a-zA-Z0-9]*)\s*=\s*\{\s*id:\s*"([a-z0-9-]+)",[^}]*category:\s*"([a-z]+)",[^}]*path:\s*"([^"]+)"/g;
  const out = [];
  let m;
  while ((m = exportRe.exec(cfgText)) !== null) out.push({ varName: m[1], id: m[2], category: m[3], path: m[4] });
  return out;
}

// ---------- (B) parse toolComponentMap — SAME regex as Gate 1 ----------
function parseRoutes(tpText) {
  const routeRe = /"([a-z]+)\/([a-z0-9-]+)":\s*lazy\(\(\)\s*=>\s*import\("@\/tools\/([A-Za-z]+)\/([A-Za-z0-9]+)"\)\)/g;
  const out = [];
  let m;
  while ((m = routeRe.exec(tpText)) !== null) {
    out.push({ key: `${m[1]}/${m[2]}`, category: m[1], id: m[2], importCat: m[3], comp: m[4] });
  }
  return out;
}

// ---------- (C) scan filesystem ----------
function scanFs() {
  const out = [];
  for (const cat of readdirSync(TOOLS_DIR)) {
    const cdir = join(TOOLS_DIR, cat);
    if (!statSync(cdir).isDirectory()) continue;
    for (const comp of readdirSync(cdir)) {
      const cpath = join(cdir, comp);
      if (!statSync(cpath).isDirectory()) continue;
      const hasIndex = existsSync(join(cpath, "index.tsx")) || existsSync(join(cpath, "index.ts"));
      out.push({ category: cat, comp, hasIndex });
    }
  }
  return out;
}

const cfgText = read(CFG);
const tpText = read(ROUTER);
const tools = parseToolsArray(cfgText);
const exports = parseExports(cfgText);
const routes = parseRoutes(tpText);
const fsTools = scanFs();

// ---------- conflict audit (drift risks beyond Gate 1) ----------
const conflicts = [];
const push = (sev, type, msg) => conflicts.push({ sev, type, msg });

// duplicate ids in tools[]
const idCount = new Map();
for (const t of tools) idCount.set(t.id, (idCount.get(t.id) || 0) + 1);
for (const [id, n] of idCount) if (n > 1) push("ERROR", "DUP_REGISTRY_ID", `id "${id}" appears ${n}x in tools[]`);

// duplicate export-const var names
const varCount = new Map();
for (const e of exports) varCount.set(e.varName, (varCount.get(e.varName) || 0) + 1);
for (const [v, n] of varCount) if (n > 1) push("ERROR", "DUP_EXPORT_CONST", `export const "${v}" declared ${n}x`);

// export var must be camelCase(id) (mirror Gate1 D, kept here for completeness)
for (const e of exports) {
  const exp = kebabToCamel(e.id);
  if (e.varName !== exp) push("ERROR", "EXPORT_VAR_MISMATCH", `export "${e.varName}" should be "${exp}" for id "${e.id}"`);
}

// duplicate route keys
const keyCount = new Map();
for (const r of routes) keyCount.set(r.key, (keyCount.get(r.key) || 0) + 1);
for (const [k, n] of keyCount) if (n > 1) push("ERROR", "DUP_ROUTE_KEY", `route key "${k}" declared ${n}x`);

// component import name must be PascalCase(id) (mirror Gate1 G)
for (const r of routes) {
  const exp = kebabToPascal(r.id);
  if (r.comp !== exp) push("ERROR", "COMP_NAME_MISMATCH", `route "${r.key}" -> "${r.comp}" should be "${exp}"`);
  if (r.importCat !== r.category) push("ERROR", "IMPORT_CAT_MISMATCH", `route "${r.key}" imports from ${r.importCat}/ (cat mismatch)`);
}

// duplicate component DIR name across categories (real cross-cat import collision)
const compToCat = new Map();
for (const f of fsTools) {
  const prev = compToCat.get(f.comp);
  if (prev && prev !== f.category) push("WARN", "DUP_COMPONENT_DIR", `component dir "${f.comp}" exists in both ${prev}/ and ${f.category}/`);
  compToCat.set(f.comp, f.category);
}

// reserved-id collisions (would shadow router params / static pages)
const RESERVED = new Set(["tools", "category", "toolname", "index", "new", "all", "search"]);
for (const t of tools) if (RESERVED.has(t.id)) push("ERROR", "RESERVED_ID", `id "${t.id}" is a reserved routing word`);

// ---------- build trunk/tree ----------
const trunk = {};
for (const t of tools) (trunk[t.category] ||= []).push(t);
for (const cat of Object.keys(trunk)) trunk[cat].sort((a, b) => a.id.localeCompare(b.id));
const compByKey = new Map(routes.map((r) => [r.key, r.comp]));

// ---------- output ----------
const mode = process.argv.slice(2);
const want = (f) => mode.length === 0 || mode.includes(f);

if (want("--tree")) {
  const cats = Object.keys(trunk).sort();
  let total = 0;
  console.log("🌳 TOOL TRUNK — id ↔ component ↔ route (canopy over Gate 1)\n");
  for (const cat of cats) {
    console.log(`├─ ${cat}/  (${trunk[cat].length})`);
    for (const t of trunk[cat]) {
      const comp = compByKey.get(`${cat}/${t.id}`) || "??NO-ROUTE??";
      console.log(`│   • ${t.id.padEnd(38)} → ${comp}`);
      total++;
    }
  }
  console.log(`\nTOTAL: ${total} tools across ${cats.length} categories`);
}

if (want("--json")) {
  const json = { generatedAt: new Date().toISOString(), total: tools.length, categories: {} };
  for (const cat of Object.keys(trunk).sort()) {
    json.categories[cat] = trunk[cat].map((t) => ({
      id: t.id,
      name: t.name,
      path: t.path,
      component: compByKey.get(`${cat}/${t.id}`) || null,
      exportConst: kebabToCamel(t.id),
    }));
  }
  writeFileSync(join(ROOT, "scripts/tool-trunk.json"), JSON.stringify(json, null, 2));
  console.log("→ wrote scripts/tool-trunk.json");
}

if (want("--audit") || mode.length === 0) {
  const errs = conflicts.filter((c) => c.sev === "ERROR");
  const warns = conflicts.filter((c) => c.sev === "WARN");
  console.log(`\n🔍 CONFLICT AUDIT — ${tools.length} tools[] · ${exports.length} export const · ${routes.length} routes · ${fsTools.length} dirs`);
  if (conflicts.length === 0) {
    console.log("✅ CLEAN — no drift conflicts. (Run validate-registry.mjs for the full Gate-1 sync check.)");
  } else {
    for (const c of conflicts) console.log(`  [${c.sev}] ${c.type}: ${c.msg}`);
    console.log(`\n${errs.length} ERROR(s), ${warns.length} WARN(ing)s`);
  }
  if (errs.length > 0) process.exit(1);
}
