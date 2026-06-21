// ============================================================
// CategoryPage - /category/:category 分類工具列表頁
// ============================================================

import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, Search, Lock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCategoryByKey } from "@shared/categoriesConfig";
import { getPublicToolsByCategory } from "@shared/toolsConfig";
import { CategoryIcon } from "@/components/CategoryIcon";
import { AdSlot } from "@/components/business/AdSlot";
import { groupFinanceTools, getFinanceSubgroupKey } from "@/lib/financeSubgroups";
import { setSeoMeta } from "@/lib/seo";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Tool } from "@shared/toolsConfig";

export default function CategoryPage() {
  const { lang } = useLanguage();
  const { category } = useParams<{ category: string }>();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "free" | "premium">("all");
  // 次級分類選擇（目前用於 finance）；"all" 表示全部
  const [subgroup, setSubgroup] = useState<string>("all");
  // 分頁狀態（第幾頁，從 1 起算）。禁止無限捲動，工具數超過 PAGE_SIZE 才出現分頁控制。
  const [page, setPage] = useState<number>(1);

  // 每頁工具數（桌機 5 欄 × 12 列 = 60；手機 2 欄 × 30 列）
  const PAGE_SIZE = 60;

  const isFinance = category === "finance";

  const catInfo = getCategoryByKey(category ?? "");
  const allTools = getPublicToolsByCategory(category ?? "");
  const categoryDisclaimer = category === "finance"
    ? lang === "zh"
      ? "財經工具僅供教育與估算參考，不構成投資、稅務、保險或理財建議；重大決策前請諮詢合格專業人士。"
      : "Finance tools are for education and estimation only. They are not investment, tax, insurance, or financial advice; consult qualified professionals before major decisions."
    : category === "health"
      ? lang === "zh"
        ? "健康工具僅供一般資訊參考，不能取代醫師、營養師或其他醫療專業人員的診斷與建議。"
        : "Health tools are for general information only and do not replace diagnosis or advice from doctors, dietitians, or qualified medical professionals."
      : category === "developer"
        ? lang === "zh"
          ? "開發工具在瀏覽器端處理輸入內容；處理敏感程式碼或資料前，請先確認資料安全與授權限制。"
          : "Developer tools process inputs in the browser. Confirm data security and authorization limits before handling sensitive code or data."
        : undefined;

  // 切換子分組／篩選／搜尋時，分頁重設回第 1 頁
  useEffect(() => {
    setPage(1);
  }, [subgroup, filter, search, category]);

  useEffect(() => {
    if (!catInfo) return;

    setSeoMeta({
      title: `${catInfo.name}工具｜Formula Universe`,
      description: `${catInfo.name}工具集合：${catInfo.description}。Formula Universe提供免費、快速、適合台灣使用情境的線上計算與決策輔助工具。`,
    });
  }, [catInfo]);

  const filteredTools = allTools.filter((tool: Tool) => {
    const q = search.toLowerCase();
    const matchSearch =
      tool.name.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q) ||
      tool.id.toLowerCase().includes(q);
    const matchFilter =
      filter === "all" ||
      (filter === "free" && !tool.isPremium) ||
      (filter === "premium" && tool.isPremium);
    // 次級分類過濾（僅 finance 啟用；"all" 不過濾）
    const matchSubgroup =
      !isFinance ||
      subgroup === "all" ||
      getFinanceSubgroupKey(tool) === subgroup;
    return matchSearch && matchFilter && matchSubgroup;
  });

  // finance：把過濾後的工具依次級分類分段（顯示群組標題 + 群組間插入廣告位）。
  // 若使用者已選定單一次級分類（subgroup !== "all"），就不再分段，直接平鋪。
  const financeGrouped =
    isFinance && subgroup === "all" ? groupFinanceTools(filteredTools) : [];

  // 單張工具卡片渲染（finance 分類頁專用・精簡小卡）
  // 只保留 3 要素：① 編號 ② 工具名稱（不去尾，可換行） ③ 內容簡述（超過 3 行去尾）
  const renderToolCard = (tool: Tool, index: number) => (
    <Link key={tool.id} href={tool.path}>
      <Card className="group h-full cursor-pointer p-3 transition-all duration-200 hover:border-primary/50 hover:shadow-md">
        {/* 第一行：序號 → 工具名稱（同一行，序號在前；名稱禁止去尾，允許換行）。
            ＊禁止改變字型：沿用全站 body 預設字型，不施加特殊字重／字族。 */}
        <h3 className="text-sm leading-snug text-foreground group-hover:text-primary transition-colors">
          <span className="mr-1.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white/80 align-middle text-[10px] text-slate-600 shadow-sm">
            {index + 1}
          </span>
          {tool.name}
          {/* 文章數：固定顯示，緊接於工具名後面 */}
          <span className="ml-1.5 align-middle text-[10px] text-muted-foreground">
            · {tool.seoArticles.length} 篇文章
          </span>
        </h3>
        {/* 內容簡述：最多 3 行，超出自動去尾 */}
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-3">
          {tool.description}
        </p>
      </Card>
    </Link>
  );

  // 將工具陣列每 ADS_EVERY 個切成一段（每段後面放一個廣告位）。
  // ＊尾段合併規則（Q3）：若最後一段不足 MIN_TAIL 張，就「不另插廣告」，
  //   把這幾張併入前一段（前一段卡片變 11/12 張，只保留前一段那個廣告）。
  const ADS_EVERY = 10;
  const MIN_TAIL = 3; // 尾段 < 3 張就併入前一段
  const chunkTools = (tools: Tool[]): Tool[][] => {
    const chunks: Tool[][] = [];
    for (let i = 0; i < tools.length; i += ADS_EVERY) {
      chunks.push(tools.slice(i, i + ADS_EVERY));
    }
    if (chunks.length === 0) return [[]];
    // 尾段不足 MIN_TAIL 且有前一段可併 → 併入前一段
    if (chunks.length >= 2) {
      const last = chunks[chunks.length - 1];
      if (last.length < MIN_TAIL) {
        const prev = chunks[chunks.length - 2];
        chunks[chunks.length - 2] = prev.concat(last);
        chunks.pop();
      }
    }
    return chunks;
  };

  // 渲染一個子分組的工具：每段（10 個，尾段視合併規則）之後插入一個廣告位。
  // startOffset：用於分頁／全部視圖時，讓卡片序號維持全域連續編號。
  const renderGroupWithAds = (
    tools: Tool[],
    keyPrefix: string,
    startOffset: number = 0,
  ) => {
    const chunks = chunkTools(tools);
    let runningIndex = 0;
    return chunks.map((chunk, ci) => {
      const startIndex = runningIndex;
      runningIndex += chunk.length;
      return (
        <div key={`${keyPrefix}-chunk-${ci}`}>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {chunk.map((tool, j) =>
              renderToolCard(tool, startOffset + startIndex + j),
            )}
          </div>
          {/* 每段之後插一個廣告位（尾段已依規則併入，不會出現孤兒卡＋雙廣告） */}
          <div className="mt-6 mb-2">
            <AdSlot
              slot={`${keyPrefix}-ad-${ci}`}
              position="in-list"
              variant={ci % 2 === 0 ? "responsive" : "square"}
            />
          </div>
        </div>
      );
    });
  };

  // ── 分頁工具函式 ────────────────────────────────────────────────
  // 計算總頁數
  const totalPages = (count: number) => Math.max(1, Math.ceil(count / PAGE_SIZE));
  // 取得目前頁的切片（含起始索引，供連續編號使用）
  const pageSlice = <T,>(items: T[]): { items: T[]; startOffset: number } => {
    const start = (page - 1) * PAGE_SIZE;
    return { items: items.slice(start, start + PAGE_SIZE), startOffset: start };
  };

  // 分頁控制列（頁碼 + 上/下頁）。禁止無限捲動。
  const renderPagination = (count: number) => {
    const pages = totalPages(count);
    if (pages <= 1) return null;
    const cur = Math.min(page, pages);
    // 產生頁碼按鈕（最多顯示當前頁 ±2，加首尾與省略號）
    const nums: (number | "...")[] = [];
    const push = (n: number) => nums.push(n);
    const range = (a: number, b: number) => {
      for (let i = a; i <= b; i++) push(i);
    };
    if (pages <= 7) {
      range(1, pages);
    } else {
      push(1);
      if (cur > 4) nums.push("...");
      range(Math.max(2, cur - 2), Math.min(pages - 1, cur + 2));
      if (cur < pages - 3) nums.push("...");
      push(pages);
    }
    return (
      <nav
        className="mt-10 flex flex-wrap items-center justify-center gap-2"
        aria-label="分頁導覽"
      >
        <Button
          variant="outline"
          size="sm"
          disabled={cur <= 1}
          onClick={() => {
            setPage(cur - 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          上一頁
        </Button>
        {nums.map((n, i) =>
          n === "..." ? (
            <span key={`dots-${i}`} className="px-2 text-muted-foreground">
              …
            </span>
          ) : (
            <Button
              key={n}
              variant={n === cur ? "default" : "outline"}
              size="sm"
              className="min-w-9"
              onClick={() => {
                setPage(n);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              {n}
            </Button>
          ),
        )}
        <Button
          variant="outline"
          size="sm"
          disabled={cur >= pages}
          onClick={() => {
            setPage(cur + 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          下一頁
        </Button>
        <span className="ml-2 text-xs text-muted-foreground">
          第 {cur} / {pages} 頁 · 共 {count} 個工具
        </span>
      </nav>
    );
  };

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

      {categoryDisclaimer && (
        <div className="container pt-6">
          <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-100">
            <AlertTriangle className="mt-1 h-4 w-4 shrink-0" />
            <p>{categoryDisclaimer}</p>
          </div>
        </div>
      )}

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

        {/* ── 次級分類 chips（finance）──────────────────────────── */}
        {isFinance && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSubgroup("all")}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                subgroup === "all"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              全部 ({allTools.length})
            </button>
            {groupFinanceTools(allTools).map(({ group, tools }) => (
              <button
                key={group.key}
                type="button"
                onClick={() => setSubgroup(group.key)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  subgroup === group.key
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {group.label} ({tools.length})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Tools Grid ──────────────────────────────────────── */}
      <div className="container pb-16">
        {filteredTools.length === 0 ? (
          <div className="py-20 text-center">
            {allTools.length === 0 ? (
              <>
                <p className="text-lg font-medium">此分類目前沒有公開工具</p>
                <p className="text-muted-foreground mt-2 text-sm">
                  請先探索其他分類，或使用上方搜尋尋找相關工具。
                </p>
                <Button asChild variant="outline" className="mt-6">
                  <Link href="/">探索其他分類</Link>
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground">沒有符合條件的工具</p>
            )}
          </div>
        ) : isFinance && subgroup === "all" ? (
          /* finance「全部」：先把所有子分組的工具攤平成連續序列做分頁，
             再於目前頁的可見範圍內，依子分組重新分段顯示（保留群組標題）。 */
          (() => {
            // 攤平：保留每個工具所屬的群組資訊與全域連續索引
            const flat: { group: typeof financeGrouped[number]["group"]; tool: Tool }[] = [];
            financeGrouped.forEach(({ group, tools }) => {
              tools.forEach((tool) => flat.push({ group, tool }));
            });
            const total = flat.length;
            const { items: pageItems, startOffset } = pageSlice(flat);
            // 把目前頁的可見項目，依群組重新聚合（維持原群組順序）
            const sections: { group: typeof flat[number]["group"]; tools: Tool[] }[] = [];
            pageItems.forEach(({ group, tool }) => {
              const last = sections[sections.length - 1];
              if (last && last.group.key === group.key) {
                last.tools.push(tool);
              } else {
                sections.push({ group, tools: [tool] });
              }
            });
            let acc = startOffset;
            return (
              <>
                <div className="space-y-10">
                  {sections.map((sec, si) => {
                    const offset = acc;
                    acc += sec.tools.length;
                    return (
                      <section key={`${sec.group.key}-${si}`} aria-label={sec.group.label}>
                        <div className="mb-4 flex items-center gap-2">
                          <h2 className="text-lg font-bold">{sec.group.label}</h2>
                          <span className="text-sm text-muted-foreground">
                            ({sec.tools.length})
                          </span>
                        </div>
                        {renderGroupWithAds(
                          sec.tools,
                          `finance-group-${sec.group.key}-p${page}`,
                          offset,
                        )}
                      </section>
                    );
                  })}
                </div>
                {renderPagination(total)}
              </>
            );
          })()
        ) : (
          isFinance ? (
            /* finance 已選定單一子分類：分頁 + 每 10 個工具插一個廣告位 */
            (() => {
              const total = filteredTools.length;
              const { items: pageItems, startOffset } = pageSlice(filteredTools);
              return (
                <>
                  <div>
                    {renderGroupWithAds(
                      pageItems,
                      `finance-sub-${subgroup}-p${page}`,
                      startOffset,
                    )}
                  </div>
                  {renderPagination(total)}
                </>
              );
            })()
          ) : (
            /* 其他分類：平鋪網格（不插廣告，維持原狀，不分頁） */
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
              {filteredTools.map((tool: Tool, index: number) => renderToolCard(tool, index))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
