// ============================================================
// SearchDialog - 全域模糊搜尋對話框
// 使用 fuse.js 搜尋工具名稱、描述、分類名稱
// 結果分兩組：「類別」命中 + 「工具」命中
// ============================================================

import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "wouter";
import Fuse from "fuse.js";
import { Search, Loader2, FolderOpen, Wrench, X } from "lucide-react";
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

// ── 搜尋資料型別 ────────────────────────────────────────────
interface CategorySearchItem {
  type: "category";
  key: string;
  name: string;
  description: string;
  icon: string;
  toolCount: number;
}

interface ToolSearchItem {
  type: "tool";
  id: string;
  name: string;
  description: string;
  path: string;
  category: string;
  categoryName: string;
  icon: string;
}

type SearchItem = CategorySearchItem | ToolSearchItem;

// ── 搜尋索引（靜態，只建立一次）──────────────────────────────
const categoryItems: CategorySearchItem[] = categories.map((cat) => ({
  type: "category",
  key: cat.key,
  name: cat.name,
  description: cat.description,
  icon: cat.icon,
  toolCount: tools.filter((t) => t.category === cat.key).length,
}));

const toolItems: ToolSearchItem[] = tools.map((tool) => {
  const catInfo = getCategoryByKey(tool.category);
  return {
    type: "tool",
    id: tool.id,
    name: tool.name,
    description: tool.description,
    path: tool.path,
    category: tool.category,
    categoryName: catInfo?.name ?? tool.category,
    icon: tool.icon,
  };
});

const allItems: SearchItem[] = [...categoryItems, ...toolItems];

const fuse = new Fuse<SearchItem>(allItems, {
  keys: [
    { name: "name", weight: 0.5 },
    { name: "description", weight: 0.3 },
    { name: "categoryName", weight: 0.2 },
  ],
  threshold: 0.4,
  includeScore: true,
  minMatchCharLength: 1,
});

// ── Props ────────────────────────────────────────────────────
interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ── Component ────────────────────────────────────────────────
export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [, navigate] = useLocation();

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

  // 搜尋結果
  const results = useMemo(() => {
    if (!query.trim()) return null;
    const raw = fuse.search(query.trim());
    const categoryHits = raw
      .filter((r) => r.item.type === "category")
      .map((r) => r.item as CategorySearchItem);
    const toolHits = raw
      .filter((r) => r.item.type === "tool")
      .map((r) => r.item as ToolSearchItem);
    return { categoryHits, toolHits };
  }, [query]);

  const handleSelect = useCallback(
    (path: string) => {
      onOpenChange(false);
      navigate(path);
    },
    [navigate, onOpenChange]
  );

  const hasResults =
    results && (results.categoryHits.length > 0 || results.toolHits.length > 0);
  const isEmpty = results && !hasResults;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 max-w-lg overflow-hidden">
        <DialogTitle className="sr-only">搜尋工具與分類</DialogTitle>

        {/* Search input */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            autoFocus
            placeholder="搜尋工具名稱、描述或分類..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 shadow-none focus-visible:ring-0 px-0 text-sm h-auto"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {/* 初始狀態：顯示提示 */}
          {!query && (
            <div className="py-10 text-center text-sm text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-3 opacity-30" />
              <p>輸入關鍵字搜尋工具或分類</p>
              <p className="text-xs mt-1 opacity-60">支援工具名稱、描述、分類名稱</p>
            </div>
          )}

          {/* 無結果 */}
          {isEmpty && (
            <div className="py-10 text-center text-sm text-muted-foreground">
              <Loader2 className="h-8 w-8 mx-auto mb-3 opacity-30" />
              <p>找不到「{query}」的相關結果</p>
              <p className="text-xs mt-1 opacity-60">試試其他關鍵字</p>
            </div>
          )}

          {/* 有結果 */}
          {hasResults && (
            <div className="py-2">
              {/* 類別命中 */}
              {results.categoryHits.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <FolderOpen className="h-3.5 w-3.5" />
                    類別
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
                          <span className="text-sm font-medium">{cat.name}</span>
                          <Badge variant="secondary" className="text-xs h-4 px-1.5">
                            {cat.toolCount} 個工具
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {cat.description}
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
                    工具
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
                          <span className="text-sm font-medium">{tool.name}</span>
                          <Badge variant="outline" className="text-xs h-4 px-1.5">
                            {tool.categoryName}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {tool.description}
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
          <span>按 Enter 選擇 · ESC 關閉</span>
          <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted text-xs">⌘K</kbd>
        </div>
      </DialogContent>
    </Dialog>
  );
}
