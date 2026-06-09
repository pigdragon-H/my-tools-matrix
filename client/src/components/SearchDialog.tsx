// ============================================================
// SearchDialog - 全域模糊搜尋對話框（跨主軸版）
// ------------------------------------------------------------
// 使用 fuse.js 同時索引：工具分類、工具、四大主軸內容
//   （工具知識庫 /blog 靜態文章、AI 創業藍圖、AI知識庫、機會情報）。
// 友善設計：
//   • 不論用戶定位在哪個主軸，搜尋都涵蓋「所有主軸」，不再固定只搜工具。
//   • 具情境感知：若用戶當前就在某個主軸頁，該主軸命中結果會「優先浮上」。
//   • 結果依主軸分組顯示，當前主軸排最前。
// 只增不刪：沿用既有資料來源，僅在搜尋層加結構。
// ============================================================

import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "wouter";
import Fuse from "fuse.js";
import { Search, Loader2, FolderOpen, Wrench, BookOpen, Rocket, Lightbulb, Library, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { tools } from "@shared/toolsConfig";
import { categories, getCategoryByKey } from "@shared/categoriesConfig";
import { CategoryIcon } from "@/components/CategoryIcon";
import { useLanguage } from "@/contexts/LanguageContext";
import { BLUEPRINTS, OPPORTUNITIES, KNOWLEDGE } from "@/lib/laneContent";
import { STATIC_ARTICLES } from "@/lib/staticArticles";
import { getLane } from "@shared/laneRegistry";

type Lang = "zh" | "en";

// ── 搜尋資料型別 ────────────────────────────────────────────
interface CategorySearchItem {
  type: "category";
  key: string;
  nameZh: string;
  nameEn: string;
  descriptionZh: string;
  descriptionEn: string;
  icon: string;
  toolCount: number;
}

interface ToolSearchItem {
  type: "tool";
  id: string;
  nameZh: string;
  nameEn: string;
  descriptionZh: string;
  descriptionEn: string;
  path: string;
  categoryName: string;
  icon: string;
}

// 主軸內容（工具知識庫 / 藍圖 / 知識 / 機會）統一型別
interface ContentSearchItem {
  type: "content";
  id: string;
  laneId: string; // blog | blueprints | opportunities | knowledge
  nameZh: string;
  nameEn: string;
  descriptionZh: string;
  descriptionEn: string;
  keywords: string;
  path: string;
}

type SearchItem = CategorySearchItem | ToolSearchItem | ContentSearchItem;

// ── 主軸顯示資訊（圖示在 UI 層決定）────────────────────────
const LANE_META: Record<string, { icon: typeof Rocket; titleZh: string; titleEn: string }> = {
  blog: { icon: BookOpen, titleZh: "工具知識庫", titleEn: "Tool Knowledge" },
  blueprints: { icon: Rocket, titleZh: "AI 創業藍圖", titleEn: "AI Business Blueprints" },
  knowledge: { icon: Library, titleZh: "AI知識庫", titleEn: "AI Knowledge" },
  opportunities: { icon: Lightbulb, titleZh: "機會情報", titleEn: "Opportunity Intelligence" },
};

// ── 建立搜尋索引（靜態，只建立一次）────────────────────────
const categoryItems: CategorySearchItem[] = categories.map((cat) => ({
  type: "category",
  key: cat.key,
  nameZh: cat.name,
  nameEn: cat.nameEn,
  descriptionZh: cat.description,
  descriptionEn: cat.description, // 分類僅有單一描述，雙語共用
  icon: cat.icon,
  toolCount: tools.filter((t) => t.category === cat.key).length,
}));

const toolItems: ToolSearchItem[] = tools.map((tool) => {
  const catInfo = getCategoryByKey(tool.category);
  return {
    type: "tool",
    id: tool.id,
    nameZh: tool.name,
    nameEn: tool.name, // 工具名稱僅中文，雙語共用顯示
    descriptionZh: tool.description,
    descriptionEn: tool.description,
    path: tool.path,
    categoryName: catInfo?.name ?? tool.category,
    icon: tool.icon,
  };
});

// 工具知識庫（/blog 靜態文章）
const blogItems: ContentSearchItem[] = STATIC_ARTICLES.map((a) => ({
  type: "content",
  id: `blog:${a.slug}`,
  laneId: "blog",
  nameZh: a.title,
  nameEn: a.title,
  descriptionZh: a.description,
  descriptionEn: a.description,
  keywords: a.keywords || "",
  path: a.path,
}));

// 三賽道（藍圖 / 機會 / 知識）內容
const laneItems: ContentSearchItem[] = [
  ...BLUEPRINTS,
  ...OPPORTUNITIES,
  ...KNOWLEDGE,
].map((c) => ({
  type: "content",
  id: `${c.laneId}:${c.slug}`,
  laneId: c.laneId,
  nameZh: c.meta.title.zh,
  nameEn: c.meta.title.en,
  descriptionZh: c.meta.description.zh,
  descriptionEn: c.meta.description.en,
  keywords: [
    ...(c.meta.keywords?.zh ?? []),
    ...(c.meta.keywords?.en ?? []),
  ].join(" "),
  path: c.path,
}));

const allItems: SearchItem[] = [
  ...categoryItems,
  ...toolItems,
  ...blogItems,
  ...laneItems,
];

const fuse = new Fuse<SearchItem>(allItems, {
  keys: [
    { name: "nameZh", weight: 0.4 },
    { name: "nameEn", weight: 0.25 },
    { name: "descriptionZh", weight: 0.15 },
    { name: "descriptionEn", weight: 0.1 },
    { name: "keywords", weight: 0.1 },
  ],
  threshold: 0.4,
  includeScore: true,
  minMatchCharLength: 1,
});

// ── 從目前網址推當前主軸（情境感知）────────────────────────
function laneFromPath(path: string): string | null {
  if (path.startsWith("/blog")) return "blog";
  if (path.startsWith("/blueprints")) return "blueprints";
  if (path.startsWith("/opportunities")) return "opportunities";
  if (path.startsWith("/knowledge")) return "knowledge";
  return null;
}

// ── Props ──────────────────────────────────────────────────
interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ── Component ──────────────────────────────────────────────
export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [location, navigate] = useLocation();
  const { lang } = useLanguage();
  const currentLane = laneFromPath(location);

  const nameOf = (it: SearchItem) => (lang === "zh" ? it.nameZh : it.nameEn);
  const descOf = (it: SearchItem) =>
    lang === "zh" ? it.descriptionZh : it.descriptionEn;

  // 清空 query 當對話框關閉
  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => setQuery(""), 200);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // 鍵盤快捷鍵：Cmd/Ctrl + K 開啟
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onOpenChange]);

  // 搜尋結果（情境感知：當前主軸優先排序）
  const results = useMemo(() => {
    if (!query.trim()) return null;
    const raw = fuse.search(query.trim());

    const categoryHits = raw
      .filter((r) => r.item.type === "category")
      .map((r) => r.item as CategorySearchItem);
    const toolHits = raw
      .filter((r) => r.item.type === "tool")
      .map((r) => r.item as ToolSearchItem);

    // 主軸內容：依主軸分組，當前主軸排最前，其餘維持相關度順序
    const contentRaw = raw.filter((r) => r.item.type === "content");
    const laneOrder = ["blog", "blueprints", "knowledge", "opportunities"];
    const grouped = new Map<string, ContentSearchItem[]>();
    for (const r of contentRaw) {
      const it = r.item as ContentSearchItem;
      if (!grouped.has(it.laneId)) grouped.set(it.laneId, []);
      grouped.get(it.laneId)!.push(it);
    }
    const contentGroups = Array.from(grouped.entries())
      .map(([laneId, items]) => ({ laneId, items }))
      .sort((a, b) => {
        // 當前主軸永遠最前
        if (currentLane) {
          if (a.laneId === currentLane && b.laneId !== currentLane) return -1;
          if (b.laneId === currentLane && a.laneId !== currentLane) return 1;
        }
        return laneOrder.indexOf(a.laneId) - laneOrder.indexOf(b.laneId);
      });

    return { categoryHits, toolHits, contentGroups };
  }, [query, currentLane]);

  const handleSelect = useCallback(
    (path: string) => {
      onOpenChange(false);
      navigate(path);
    },
    [navigate, onOpenChange]
  );

  const hasResults =
    results &&
    (results.categoryHits.length > 0 ||
      results.toolHits.length > 0 ||
      results.contentGroups.length > 0);
  const isEmpty = results && !hasResults;

  const scopeHint =
    currentLane && LANE_META[currentLane]
      ? lang === "zh"
        ? `目前在「${LANE_META[currentLane].titleZh}」，已涵蓋全部主軸搜尋`
        : `In "${LANE_META[currentLane].titleEn}" — searching across all sections`
      : lang === "zh"
        ? "搜尋涵蓋工具、知識庫與所有主軸"
        : "Search across tools, knowledge and all sections";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 max-w-lg overflow-hidden">
        <DialogTitle className="sr-only">
          {lang === "zh" ? "搜尋工具與所有主軸" : "Search tools and all sections"}
        </DialogTitle>

        {/* Search input */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            autoFocus
            placeholder={
              lang === "zh"
                ? "搜尋工具、文章、藍圖、機會..."
                : "Search tools, articles, blueprints, opportunities..."
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 shadow-none focus-visible:ring-0 px-0 text-sm h-auto"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label={lang === "zh" ? "清除" : "Clear"}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Scope hint */}
        <div className="px-4 py-1.5 text-xs text-muted-foreground bg-muted/40 border-b border-border">
          {scopeHint}
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {/* 初始狀態：顯示提示 */}
          {!query && (
            <div className="py-10 text-center text-sm text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-3 opacity-30" />
              <p>{lang === "zh" ? "輸入關鍵字，跨主軸搜尋" : "Type to search across all sections"}</p>
              <p className="text-xs mt-1 opacity-60">
                {lang === "zh"
                  ? "工具、工具知識庫、創業藍圖、AI知識庫、機會情報"
                  : "Tools, knowledge, blueprints, AI knowledge, opportunities"}
              </p>
            </div>
          )}

          {/* 無結果 */}
          {isEmpty && (
            <div className="py-10 text-center text-sm text-muted-foreground">
              <Loader2 className="h-8 w-8 mx-auto mb-3 opacity-30" />
              <p>
                {lang === "zh"
                  ? `找不到「${query}」的相關結果`
                  : `No results for "${query}"`}
              </p>
              <p className="text-xs mt-1 opacity-60">
                {lang === "zh" ? "試試其他關鍵字" : "Try another keyword"}
              </p>
            </div>
          )}

          {/* 有結果 */}
          {hasResults && (
            <div className="py-2">
              {/* 主軸內容命中（依主軸分組，當前主軸最前）*/}
              {results.contentGroups.map((group) => {
                const meta = LANE_META[group.laneId];
                const lane = getLane(group.laneId);
                const Icon = meta?.icon ?? FolderOpen;
                const laneTitle = meta
                  ? lang === "zh"
                    ? meta.titleZh
                    : meta.titleEn
                  : lane?.title[lang] ?? group.laneId;
                const isCurrent = group.laneId === currentLane;
                return (
                  <div key={group.laneId}>
                    <div className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <Icon className="h-3.5 w-3.5" />
                      {laneTitle}
                      {isCurrent && (
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5 normal-case">
                          {lang === "zh" ? "目前位置" : "Current"}
                        </Badge>
                      )}
                    </div>
                    {group.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item.path)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/60 transition-colors text-left"
                      >
                        <div className="p-1.5 rounded-md bg-primary/10 shrink-0">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium block truncate">
                            {nameOf(item)}
                          </span>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {descOf(item)}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                );
              })}

              {/* 類別命中 */}
              {results.categoryHits.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">
                    <FolderOpen className="h-3.5 w-3.5" />
                    {lang === "zh" ? "工具分類" : "Categories"}
                  </div>
                  {results.categoryHits.map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => handleSelect(`/category/${cat.key}`)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/60 transition-colors text-left"
                    >
                      <div className="p-1.5 rounded-md bg-primary/10 shrink-0">
                        <CategoryIcon iconName={cat.icon} className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{nameOf(cat)}</span>
                          <Badge variant="secondary" className="text-xs h-4 px-1.5">
                            {cat.toolCount} {lang === "zh" ? "個工具" : "tools"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {descOf(cat)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* 工具命中 */}
              {results.toolHits.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">
                    <Wrench className="h-3.5 w-3.5" />
                    {lang === "zh" ? "工具" : "Tools"}
                  </div>
                  {results.toolHits.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => handleSelect(tool.path)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/60 transition-colors text-left"
                    >
                      <div className="p-1.5 rounded-md bg-muted shrink-0">
                        <CategoryIcon iconName={tool.icon} className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{nameOf(tool)}</span>
                          <Badge variant="outline" className="text-xs h-4 px-1.5">
                            {tool.categoryName}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {descOf(tool)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="border-t border-border px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>{lang === "zh" ? "按 Enter 選擇 · ESC 關閉" : "Enter to select · ESC to close"}</span>
          <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted text-xs">⌘K</kbd>
        </div>
      </DialogContent>
    </Dialog>
  );
}
