const DEFAULT_TITLE = "Formula Universe｜免費線上計算工具與決策輔助平台";
const DEFAULT_DESCRIPTION =
  "Formula Universe提供免費線上計算工具與決策輔助服務，涵蓋財經投資、健康生活、職場效率、開發工具、電商旅遊等情境，協助您快速取得清楚可靠的試算結果。";

// SSR 時用來收集 meta 標籤的全局狀態
let ssrMetaTags: Map<string, string> = new Map();

export function getSsrMetaTags(): Map<string, string> {
  return ssrMetaTags;
}

export function resetSsrMetaTags(): void {
  ssrMetaTags = new Map();
}

function canonicalPath(pathname: string) {
  const clean = pathname.split("?")[0].split("#")[0].replace(/\/+$/, "") || "/";
  if (clean === "/") return "/";
  return clean;
}

function canonicalHrefFromPath(pathname: string) {
  const base = (import.meta.env.VITE_SITE_URL || "https://my-tools-matrix-production.up.railway.app").replace(/\/$/, "");
  return `${base}${canonicalPath(pathname)}`;
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

function upsertRobotsMeta() {
  const content = "index,follow";
  
  // SSR stores the robots directive for prerender output.
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
function upsertCanonical(ssrPathname?: string) {
  if (typeof document === "undefined") {
    if (ssrPathname) ssrMetaTags.set("canonical", canonicalHrefFromPath(ssrPathname));
    return;
  }
  if (typeof window === "undefined") return;

  const href = canonicalHrefFromPath(window.location.pathname);

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

export function setSeoMeta({ title = DEFAULT_TITLE, description = DEFAULT_DESCRIPTION }: SeoOptions = {}, ssrPathname?: string) {
  // SSR 時收集 meta 信息
  if (typeof document === "undefined") {
    ssrMetaTags.set("title", title);
    ssrMetaTags.set("description", description);
    ssrMetaTags.set("og:title", title);
    ssrMetaTags.set("og:description", description);
    upsertCanonical(ssrPathname);
    upsertRobotsMeta();
    return;
  }

  document.title = title;
  upsertMeta('meta[name="description"]', { name: "description" }, description);
  upsertMeta('meta[property="og:title"]', { property: "og:title" }, title);
  upsertMeta('meta[property="og:description"]', { property: "og:description" }, description);
  upsertCanonical();
  upsertRobotsMeta();
}

export const defaultSeo = {
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
};

