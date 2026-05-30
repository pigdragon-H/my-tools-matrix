// ============================================================
// CategoryPage - /category/:category 分類工具列表頁
// ============================================================

import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, Search, Lock, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCategoryByKey } from "@shared/categoriesConfig";
import { getToolsByCategory } from "@shared/toolsConfig";
import { CategoryIcon } from "@/components/CategoryIcon";
import { setSeoMeta } from "@/lib/seo";
import type { Tool } from "@shared/toolsConfig";

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "free" | "premium">("all");

  const catInfo = getCategoryByKey(category ?? "");
  const allTools = getToolsByCategory(category ?? "");

  useEffect(() => {
    if (!catInfo) return;

    setSeoMeta({
      title: `${catInfo.name}工具｜工具矩陣`,
      description: `${catInfo.name}工具集合：${catInfo.description}。工具矩陣提供免費、快速、適合台灣使用情境的線上計算與決策輔助工具。`,
    });
  }, [catInfo]);

  const filteredTools = allTools.filter((tool: Tool) => {
    const matchSearch =
      tool.name.toLowerCase().includes(search.toLowerCase()) ||
      tool.description.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "free" && !tool.isPremium) ||
      (filter === "premium" && tool.isPremium);
    return matchSearch && matchFilter;
  });

  if (!catInfo) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground">找不到此分類</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/">返回首頁</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Category Header ─────────────────────────────────── */}
      <div className={`border-b border-border ${catInfo.bgColor}`}>
        <div className="container py-10">
          <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-1" />
              返回首頁
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            <div className={`rounded-xl bg-background/80 p-3 ${catInfo.color}`}>
              <CategoryIcon iconName={catInfo.icon} className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold md:text-3xl">{catInfo.name}</h1>
              <p className="text-muted-foreground mt-1">{catInfo.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filters ─────────────────────────────────────────── */}
      <div className="container py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜尋工具..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <TabsList>
              <TabsTrigger value="all">全部</TabsTrigger>
              <TabsTrigger value="free">免費</TabsTrigger>
              <TabsTrigger value="premium">付費</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* ── Tools Grid ──────────────────────────────────────── */}
      <div className="container pb-16">
        {filteredTools.length === 0 ? (
          <div className="py-20 text-center">
            {allTools.length === 0 ? (
              <>
                <p className="text-lg font-medium">此分類工具即將推出</p>
                <p className="text-muted-foreground mt-2 text-sm">
                  我們正在積極開發中，敬請期待！
                </p>
                <Button asChild variant="outline" className="mt-6">
                  <Link href="/">探索其他分類</Link>
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground">沒有符合條件的工具</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTools.map((tool: Tool) => (
              <Link key={tool.id} href={tool.path}>
                <Card className="group cursor-pointer transition-all duration-200 hover:border-primary/50 hover:shadow-md h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className={`rounded-lg p-2 ${catInfo.bgColor} ${catInfo.color}`}>
                        <CategoryIcon iconName={tool.icon} className="h-5 w-5" />
                      </div>
                      <div className="flex gap-1.5">
                        {tool.isPremium && (
                          <Badge variant="secondary" className="text-xs gap-1">
                            <Lock className="h-3 w-3" />
                            Pro
                          </Badge>
                        )}
                        {tool.showAds && !tool.isPremium && (
                          <Badge variant="outline" className="text-xs gap-1 text-muted-foreground">
                            <Megaphone className="h-3 w-3" />
                            廣告
                          </Badge>
                        )}
                        {tool.isNew && (
                          <Badge className="text-xs bg-emerald-500 hover:bg-emerald-500">
                            新
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-base mt-3 group-hover:text-primary transition-colors">
                      {tool.name}
                    </CardTitle>
                    <CardDescription className="text-sm line-clamp-2">
                      {tool.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {tool.seoArticles.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {tool.seoArticles.length} 篇相關文章
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
