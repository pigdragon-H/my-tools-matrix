/* === SAFE ZONE START === */
// ============================================================
// LANE CONTENT LOADER — 三賽道靜態 Markdown 載入器
// ============================================================
//
// 沿用已驗證的模式（client/src/lib/staticArticles.ts 同一套）：
// 用 Vite import.meta.glob 在 build 時把各賽道 .md 打包進來，
// 解析 YAML frontmatter（支援雙語 { zh, en } 與陣列），
// 對外提供 by-lane / by-slug 查詢。
//
// ── 給接手的 AI / 工程師（HANDOFF）─────────────────────────
//  • 新增內容：在對應 shared/<lane>/ 目錄丟 .md（含 frontmatter）即可，
//    無需改程式，build 時自動納入。
//  • 雙語：frontmatter 用 `title: { zh: "...", en: "..." }` 物件式，
//    或 `title_zh / title_en` 平鋪式，兩種都支援。
//  • 賽道對應目錄見 shared/laneRegistry.ts 的 contentDir。
//  • 路徑契約：/<laneRoute>/<category-or-domain>/<slug> 或 /<laneRoute>/<slug>。
// ============================================================

import type {
  BaseContentMeta,
  BlueprintMeta,
  OpportunityMeta,
  KnowledgeMeta,
  LoadedContent,
  Bilingual,
} from "../../../shared/laneSchemas";

// 三賽道的原始 .md（相對本檔：client/src/lib -> ../../../shared/<lane>）
const blueprintRaw = import.meta.glob("../../../shared/blueprints/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const opportunityRaw = import.meta.glob("../../../shared/opportunities/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const knowledgeRaw = import.meta.glob("../../../shared/knowledge/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

// ── frontmatter 解析（支援巢狀 { zh, en } 與陣列）────────────
function parseFrontmatter(raw: string): { meta: Record<string, unknown>; body: string } {
  const trimmed = raw.replace(/^\uFEFF/, "");
  const fmMatch = trimmed.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!fmMatch) return { meta: {}, body: trimmed };
  const body = trimmed.slice(fmMatch[0].length);
  const meta = parseYamlish(fmMatch[1]);
  return { meta, body };
}

// 輕量 YAML 解析：支援 key: value、key: { zh: "", en: "" }、
// key: ["a","b"]、key: [a, b]、布林/數字。足夠 frontmatter 使用。
function parseYamlish(text: string): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const lines = text.split("\n");
  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if (val === "") continue;
    out[key] = parseScalarOrStruct(val);
  }
  return out;
}

function parseScalarOrStruct(val: string): unknown {
  // 內聯物件 { zh: "...", en: "..." }
  if (val.startsWith("{") && val.endsWith("}")) {
    const inner = val.slice(1, -1);
    const obj: Record<string, string> = {};
    // 以逗號切，但尊重引號內逗號
    for (const part of splitTopLevel(inner, ",")) {
      const ci = part.indexOf(":");
      if (ci === -1) continue;
      const k = part.slice(0, ci).trim().replace(/^["']|["']$/g, "");
      const v = stripQuotes(part.slice(ci + 1).trim());
      obj[k] = v;
    }
    return obj;
  }
  // 內聯陣列 ["a","b"] 或 [a, b]
  if (val.startsWith("[") && val.endsWith("]")) {
    const inner = val.slice(1, -1).trim();
    if (!inner) return [];
    return splitTopLevel(inner, ",").map((s) => stripQuotes(s.trim()));
  }
  // 布林
  if (val === "true") return true;
  if (val === "false") return false;
  return stripQuotes(val);
}

function splitTopLevel(s: string, sep: string): string[] {
  const res: string[] = [];
  let depth = 0;
  let quote: string | null = null;
  let cur = "";
  for (const ch of s) {
    if (quote) {
      if (ch === quote) quote = null;
      cur += ch;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
      cur += ch;
    } else if (ch === "{" || ch === "[") {
      depth++;
      cur += ch;
    } else if (ch === "}" || ch === "]") {
      depth--;
      cur += ch;
    } else if (ch === sep && depth === 0) {
      res.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  if (cur.trim()) res.push(cur);
  return res;
}

function stripQuotes(s: string): string {
  return s.replace(/^["']|["']$/g, "");
}

// 把可能是物件或字串的欄位正規化成 Bilingual。
function toBilingual(v: unknown, fallback = ""): Bilingual {
  if (v && typeof v === "object" && "zh" in (v as object)) {
    const o = v as Record<string, string>;
    return { zh: o.zh ?? fallback, en: o.en ?? o.zh ?? fallback };
  }
  const s = typeof v === "string" ? v : fallback;
  return { zh: s, en: s };
}

function asStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === "string" && v) return [v];
  return [];
}

// 從檔路徑推導 slug 與 category/domain。
// 路徑形如 ../../../shared/blueprints/<sub?>/<slug>.md
function deriveSlugAndSub(filePath: string, laneDir: string): { slug: string; sub: string } {
  const marker = `/shared/${laneDir}/`;
  const i = filePath.indexOf(marker);
  const rel = i >= 0 ? filePath.slice(i + marker.length) : filePath;
  const parts = rel.replace(/\.md$/, "").split("/");
  const slug = parts[parts.length - 1];
  const sub = parts.length > 1 ? parts[0] : "";
  return { slug, sub };
}

// ── 載入 + 正規化 ────────────────────────────────────────────
function buildBlueprints(): LoadedContent<BlueprintMeta>[] {
  return Object.entries(blueprintRaw).map(([fp, raw]) => {
    const { meta, body } = parseFrontmatter(raw);
    const { slug, sub } = deriveSlugAndSub(fp, "blueprints");
    const industry = (meta.industry as string) || sub || "general";
    const m: BlueprintMeta = {
      id: (meta.id as string) || slug,
      title: toBilingual(meta.title, slug),
      description: toBilingual(meta.description),
      publishedAt: (meta.publishedAt as string) || "",
      keywords: { zh: asStringArray(meta.keywords), en: asStringArray(meta.keywords) },
      order: meta.order != null ? Number(meta.order) : undefined,
      pillar: (meta.pillar as string) || undefined,
      industry,
      difficulty: ((meta.difficulty as string) as BlueprintMeta["difficulty"]) || "intermediate",
      revenueModel: asStringArray(meta.revenueModel),
      relatedTools: asStringArray(meta.relatedTools),
      relatedWorkflows: asStringArray(meta.relatedWorkflows),
    };
    return { meta: m, body, slug, laneId: "blueprints", path: `/blueprints/${slug}` };
  });
}

function buildOpportunities(): LoadedContent<OpportunityMeta>[] {
  return Object.entries(opportunityRaw).map(([fp, raw]) => {
    const { meta, body } = parseFrontmatter(raw);
    const { slug } = deriveSlugAndSub(fp, "opportunities");
    const m: OpportunityMeta = {
      id: (meta.id as string) || slug,
      title: toBilingual(meta.title, slug),
      description: toBilingual(meta.description),
      publishedAt: (meta.publishedAt as string) || "",
      keywords: { zh: asStringArray(meta.keywords), en: asStringArray(meta.keywords) },
      order: meta.order != null ? Number(meta.order) : undefined,
      pillar: (meta.pillar as string) || undefined,
      signalSource: asStringArray(meta.signalSource),
      marketDemand: ((meta.marketDemand as string) as OpportunityMeta["marketDemand"]) || "medium",
      revenueModel: (meta.revenueModel as string) || "",
      difficulty: ((meta.difficulty as string) as OpportunityMeta["difficulty"]) || "medium",
      worthDoing: meta.worthDoing === true || meta.worthDoing === "true",
      matchmakingTag: (meta.matchmakingTag as string) || undefined,
    };
    return { meta: m, body, slug, laneId: "opportunities", path: `/opportunities/${slug}` };
  });
}

function buildKnowledge(): LoadedContent<KnowledgeMeta>[] {
  return Object.entries(knowledgeRaw).map(([fp, raw]) => {
    const { meta, body } = parseFrontmatter(raw);
    const { slug, sub } = deriveSlugAndSub(fp, "knowledge");
    const domain = (meta.domain as string) || sub || "formula-insights";
    const m: KnowledgeMeta = {
      id: (meta.id as string) || slug,
      title: toBilingual(meta.title, slug),
      description: toBilingual(meta.description),
      publishedAt: (meta.publishedAt as string) || "",
      keywords: { zh: asStringArray(meta.keywords), en: asStringArray(meta.keywords) },
      order: meta.order != null ? Number(meta.order) : undefined,
      pillar: (meta.pillar as string) || undefined,
      domain,
      relatedTools: asStringArray(meta.relatedTools),
    };
    return { meta: m, body, slug, laneId: "knowledge", path: `/knowledge/${domain}/${slug}` };
  });
}

const byDateDesc = <M extends BaseContentMeta>(
  a: LoadedContent<M>,
  b: LoadedContent<M>
) => (b.meta.publishedAt || "").localeCompare(a.meta.publishedAt || "");

// ── 對外 API ─────────────────────────────────────────────────
export const BLUEPRINTS: LoadedContent<BlueprintMeta>[] = buildBlueprints().sort(byDateDesc);
export const OPPORTUNITIES: LoadedContent<OpportunityMeta>[] = buildOpportunities().sort(byDateDesc);
export const KNOWLEDGE: LoadedContent<KnowledgeMeta>[] = buildKnowledge().sort(byDateDesc);

export const getBlueprint = (slug: string) => BLUEPRINTS.find((c) => c.slug === slug);
export const getOpportunity = (slug: string) => OPPORTUNITIES.find((c) => c.slug === slug);
export const getKnowledge = (slug: string) => KNOWLEDGE.find((c) => c.slug === slug);

/** 依賽道 id 取全部內容（給 hub 頁通用）。 */
export function contentByLane(laneId: string): LoadedContent[] {
  switch (laneId) {
    case "blueprints":
      return BLUEPRINTS as LoadedContent[];
    case "opportunities":
      return OPPORTUNITIES as LoadedContent[];
    case "knowledge":
      return KNOWLEDGE as LoadedContent[];
    default:
      return [];
  }
}
/* === SAFE ZONE END === */
