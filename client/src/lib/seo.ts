import adsenseReviewPaths from "@shared/adsenseReviewPaths.json";

const DEFAULT_TITLE = "Formula Universe｜免費線上計算工具與決策輔助平台";
const DEFAULT_DESCRIPTION =
  "Formula Universe提供免費線上計算工具與決策輔助服務，涵蓋財經投資、健康生活、職場效率、開發工具、電商旅遊等情境，協助您快速取得清楚可靠的試算結果。";

const ADSENSE_REVIEW_MODE = true;
const REVIEW_PATHS = new Set<string>(adsenseReviewPaths as string[]);

// SSR 時用來收集 meta 標籤的全局狀態
let ssrMetaTags: Map<string, string> = new Map();

export function getSsrMetaTags(): Map<string, string> {
  return ssrMetaTags;
}

export function resetSsrMetaTags(): void {
  ssrMetaTags = new Map();
}

function normalizePath(pathname: string) {
  return pathname.replace(/\/$/, "") || "/";
}

function isReviewProtectedPath(pathname: string) {
  return (
    pathname.startsWith("/tools/") ||
    pathname.startsWith("/blog/") ||
    pathname.startsWith("/knowledge/") ||
    pathname.startsWith("/blueprints/") ||
    pathname.startsWith("/opportunities/")
  );
}

function shouldNoindexCurrentPath(explicitNoindex?: boolean, pathname?: string) {
  if (explicitNoindex) return true;
  if (!ADSENSE_REVIEW_MODE) return false;

  // SSR 時使用傳入的 pathname，否則使用 window.location.pathname
  const targetPath = pathname || (typeof window !== "undefined" ? window.location.pathname : undefined);
  if (!targetPath) return false;

  const normalizedPath = normalizePath(targetPath);
  if (REVIEW_PATHS.has(normalizedPath)) return false;
  return isReviewProtectedPath(normalizedPath);
}

function upsertMeta(selector: string, createAttributes: Record<string, string>, content: string) {
  if (typeof document === "undefined") return;

  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    Object.entries(createAttributes).forEach(([key, value]) => {
      element?.setAttribute(key, value);
    });
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

function upsertRobotsMeta(noindex: boolean) {
  const content = noindex ? "noindex,follow" : "index,follow";
  
  // SSR 時存儲到 ssrMetaTags
  if (typeof document === "undefined") {
    ssrMetaTags.set("robots", content);
    return;
  }
  
  upsertMeta('meta[name="robots"]', { name: "robots" }, content);
}

// Inject (or update) a single self-referencing <link rel="canonical"> in <head>.
// Uses origin + pathname only, so query strings (?cat=, ?lang=, …) and #hash are
// stripped — every page declares its own clean URL as the canonical. This is the
// standard Google-recommended fix for "Duplicate, Google chose different canonical
// than user". It only touches <head>; it changes no routing and cannot cause 404.
function upsertCanonical() {
  if (typeof document === "undefined" || typeof window === "undefined") return;

  const href = window.location.origin + window.location.pathname;

  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }

  link.setAttribute("href", href);
}

export interface SeoOptions {
  title?: string;
  description?: string;
  noindex?: boolean;
}

export interface SsrMetaTagsMap {
  [key: string]: string;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

export function setSeoMeta({ title = DEFAULT_TITLE, description = DEFAULT_DESCRIPTION, noindex = false }: SeoOptions = {}, ssrPathname?: string) {
  // SSR 時收集 meta 信息
  if (typeof document === "undefined") {
    ssrMetaTags.set("title", title);
    ssrMetaTags.set("description", description);
    ssrMetaTags.set("og:title", title);
    ssrMetaTags.set("og:description", description);
    upsertRobotsMeta(shouldNoindexCurrentPath(noindex, ssrPathname));
    return;
  }

  document.title = title;
  upsertMeta('meta[name="description"]', { name: "description" }, description);
  upsertMeta('meta[property="og:title"]', { property: "og:title" }, title);
  upsertMeta('meta[property="og:description"]', { property: "og:description" }, description);
  upsertCanonical();
  upsertRobotsMeta(shouldNoindexCurrentPath(noindex, ssrPathname));
}

export const defaultSeo = {
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
};

// 輔助函數：將 SSR meta tags 轉換為 HTML 字符串
// 註：this function is no longer used - title and meta tags are now injected directly in prerender.mjs
export function renderSsrMetaTags(): string {
  const tags: string[] = [];
  
  // 添加 robots meta
  const robots = ssrMetaTags.get("robots");
  if (robots) {
    tags.push(`<meta name="robots" content="${robots}">`);
  }
  
  // 添加 description meta
  const description = ssrMetaTags.get("description");
  if (description) {
    tags.push(`<meta name="description" content="${escapeHtml(description)}">`);
  }
  
  // 添加 og:title
  const ogTitle = ssrMetaTags.get("og:title");
  if (ogTitle) {
    tags.push(`<meta property="og:title" content="${escapeHtml(ogTitle)}">`);
  }
  
  // 添加 og:description
  const ogDescription = ssrMetaTags.get("og:description");
  if (ogDescription) {
    tags.push(`<meta property="og:description" content="${escapeHtml(ogDescription)}">`);
  }
  
  return tags.join("\n  ");
}
