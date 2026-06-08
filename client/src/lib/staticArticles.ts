// ============================================================
// Static Markdown article loader.
// Loads all .md files from shared/articles/**, parses frontmatter,
// and exposes a registry keyed by category/slug for /blog routes.
//
// These are MANUS-authored knowledge articles bundled at build time
// (NOT the Supabase DB articles). GSC indexed some of these URLs,
// so they must render content (GSC-as-authority).
// ============================================================

export interface StaticArticle {
  slug: string;
  category: string;
  title: string;
  description: string;
  keywords: string;
  publishedAt: string;
  toolId?: string;
  toolPath?: string;
  /** Markdown body without frontmatter. */
  content: string;
  /** Canonical path, e.g. /blog/finance/roi-vs-lump-sum or /blog/roi-calculator-guide */
  path: string;
}

// Vite: import every markdown file under shared/articles as raw text at build time.
// Path is relative to this file: client/src/lib -> ../../../shared/articles
const rawModules = import.meta.glob("../../../shared/articles/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const meta: Record<string, string> = {};
  const trimmed = raw.replace(/^\uFEFF/, "");
  const fmMatch = trimmed.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!fmMatch) {
    return { meta, body: trimmed };
  }
  const fmBlock = fmMatch[1];
  const body = trimmed.slice(fmMatch[0].length);
  for (const line of fmBlock.split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    // strip wrapping quotes
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1).replace(/\\"/g, '"');
    }
    if (key) meta[key] = val;
  }
  return { meta, body };
}

function deriveCategoryFromPath(filePath: string): string {
  // .../shared/articles/finance/foo.md -> finance ; .../shared/articles/foo.md -> "" (root)
  const m = filePath.match(/shared\/articles\/([^/]+)\/[^/]+\.md$/);
  return m ? m[1] : "";
}

function deriveSlug(filePath: string): string {
  const m = filePath.match(/([^/]+)\.md$/);
  return m ? m[1] : filePath;
}

const articles: StaticArticle[] = [];

for (const [filePath, raw] of Object.entries(rawModules)) {
  const { meta, body } = parseFrontmatter(raw);
  const slug = meta.id || deriveSlug(filePath);
  const category = meta.category || deriveCategoryFromPath(filePath);
  // Title fallback from first H1 in body
  let title = meta.title;
  if (!title) {
    const h1 = body.match(/^#\s+(.+)$/m);
    title = h1 ? h1[1].trim() : slug;
  }
  const path = category ? `/blog/${category}/${slug}` : `/blog/${slug}`;
  articles.push({
    slug,
    category,
    title,
    description: meta.description || "",
    keywords: meta.keywords || "",
    publishedAt: meta.publishedAt || "",
    toolId: meta.toolId,
    toolPath: meta.toolPath,
    content: body.trim(),
    path,
  });
}

// Sort by publishedAt desc (string ISO compare works for yyyy-mm-dd)
articles.sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""));

export const STATIC_ARTICLES: StaticArticle[] = articles;

/** Lookup by category + slug (two-level URL). */
export function getStaticArticle(
  category: string | undefined,
  slug: string
): StaticArticle | undefined {
  if (category) {
    const hit = STATIC_ARTICLES.find(
      (a) => a.category === category && a.slug === slug
    );
    if (hit) return hit;
  }
  // Fallback: match by slug alone (root-level or legacy single-segment URL)
  return STATIC_ARTICLES.find((a) => a.slug === slug);
}

/** All articles for a given category. */
export function getArticlesByCategory(category: string): StaticArticle[] {
  return STATIC_ARTICLES.filter((a) => a.category === category);
}
