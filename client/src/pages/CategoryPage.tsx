// ============================================================
// CategoryPage - /category/:category 分類工具列表頁
// ------------------------------------------------------------
// 設計（最高指揮官確認）：
//   1. 全部分類沿用 finance 的「新小卡」樣式（renderToolCard）。
//   2. 各分類各自獨立的「次級分類（細分組）」：
//        - finance(#1) 由 financeSubgroups.ts 提供（保持現狀、不改）。
//        - 其他分類由 categorySubgroups.ts 提供（互不影響、留擴充空間）。
//        - converter(#13) 無細分組 → 走單一平鋪清單（維持現狀、完全不碰）。
//   3. 完整中英雙語：所有 UI 文字依 useLanguage() 的 lang 切換 zh/en。
// ============================================================

import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, Search, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { getCategoryByKey } from "@shared/categoriesConfig";
import { getPublicToolsByCategory } from "@shared/toolsConfig";
import { CategoryIcon } from "@/components/CategoryIcon";
import { AdSlot } from "@/components/business/AdSlot";
import { groupFinanceTools, getFinanceSubgroupKey } from "@/lib/financeSubgroups";
import {
  groupToolsBySubgroup,
  getSubgroupKey,
  hasSubgroups,
} from "@/lib/categorySubgroups";
import { setSeoMeta } from "@/lib/seo";
import { useLanguage } from "@/contexts/LanguageContext";
import { getToolName, getToolDescription } from "@/lib/toolI18n";
import type { Tool } from "@shared/toolsConfig";

// 統一的「群組」型別（finance 與其他分類共用此形狀）
interface UnifiedGroup {
  key: string;
  label: string;
  labelEn: string;
}

export default function CategoryPage() {
  const { lang } = useLanguage();
  const t = (zh: string, en: string) => (lang === "zh" ? zh : en);

  const { category } = useParams<{ category: string }>();
  const cat = category ?? "";
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "free" | "premium">("all");
  // 次級分類選擇；"all" 表示全部
  const [subgroup, setSubgroup] = useState<string>("all");
  // 分頁狀態（第幾頁，從 1 起算）
  const [page, setPage] = useState<number>(1);

  // 每頁工具數（桌機 5 欄 × 12 列 = 60；手機 2 欄 × 30 列）
  const PAGE_SIZE = 60;

  const isFinance = cat === "finance";
  // 此分類是否有「次級分類」：finance 走 financeSubgroups；其他走 categorySubgroups。
  const hasGroups = isFinance || hasSubgroups(cat);

  const catInfo = getCategoryByKey(cat);
  const allTools = getPublicToolsByCategory(cat);

  // ── 各分類的免責聲明（雙語）─────────────────────────────────
  const categoryDisclaimer =
    cat === "finance"
      ? t(
          "財經工具僅供教育與估算參考，不構成投資、稅務、保險或理財建議；重大決策前請諮詢合格專業人士。",
          "Finance tools are for education and estimation only. They are not investment, tax, insurance, or financial advice; consult qualified professionals before major decisions.",
        )
      : cat === "health"
        ? t(
            "健康工具僅供一般資訊參考，不能取代醫師、營養師或其他醫療專業人員的診斷與建議。",
            "Health tools are for general information only and do not replace diagnosis or advice from doctors, dietitians, or qualified medical professionals.",
          )
        : cat === "developer"
          ? t(
              "開發工具在瀏覽器端處理輸入內容；處理敏感程式碼或資料前，請先確認資料安全與授權限制。",
              "Developer tools process inputs in the browser. Confirm data security and authorization limits before handling sensitive code or data.",
            )
          : cat === "legal"
            ? t(
                "法律工具僅供一般參考，不構成法律意見；具體個案請諮詢合格律師或專業人士。",
                "Legal tools are for general reference only and do not constitute legal advice; consult a qualified lawyer for specific cases.",
              )
            : undefined;

  // 切換子分組／篩選／搜尋時，分頁重設回第 1 頁
  useEffect(() => {
    setPage(1);
  }, [subgroup, filter, search, cat]);

  useEffect(() => {
    if (!catInfo) return;
    const catNameEn = catInfo.nameEn ?? catInfo.name;
    // Always canonicalize to /category/:category regardless of whether the user
    // arrived via /tools/:category (legacy alias) or /category/:category.
    // This prevents duplicate-URL issues in Google Search Console.
    setSeoMeta(
      {
        title:
          lang === "zh"
            ? `${catInfo.name}工具｜Formula Universe`
            : `${catNameEn} Tools | Formula Universe`,
        description:
          lang === "zh"
            ? `${catInfo.name}工具集合：${catInfo.description}。Formula Universe提供免費、快速、適合台灣使用情境的線上計算與決策輔助工具。`
            : `${catNameEn} tools collection. Formula Universe offers free, fast online calculators and decision-support tools.`,
      },
      `/category/${category}`,
    );
  }, [catInfo, lang, category]);

  // ── 取得此分類的次級分類群組（統一形狀）────────────────────
  // groupAll：全部工具依細分組後、僅保留有工具的群組（用於 chips 計數與分段標題）
  const groupAll: Array<{ group: UnifiedGroup; tools: Tool[] }> = isFinance
    ? groupFinanceTools(allTools).map(({ group, tools }) => ({
        group: { key: group.key, label: group.label, labelEn: financeEnLabel(group.key, group.label) },
        tools,
      }))
    : groupToolsBySubgroup(cat, allTools).map(({ group, tools }) => ({
        group: { key: group.key, label: group.label, labelEn: group.labelEn },
        tools,
      }));

  // 取得單一工具所屬群組 key（finance / 其他分類）
  const subgroupKeyOf = (tool: Tool): string =>
    isFinance ? getFinanceSubgroupKey(tool) : getSubgroupKey(cat, tool);

  // ── 篩選 ────────────────────────────────────────────────
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
    // 次級分類過濾（僅有細分組的分類啟用；"all" 不過濾）
    const matchSubgroup =
      !hasGroups || subgroup === "all" || subgroupKeyOf(tool) === subgroup;
    return matchSearch && matchFilter && matchSubgroup;
  });

  // ── 單張工具卡片渲染（沿用 finance 精簡小卡，全分類共用）──
  // 3 要素：① 編號 ② 工具名稱（可換行）③ 內容簡述（最多 3 行）
  const renderToolCard = (tool: Tool, index: number) => (
    <Link key={tool.id} href={tool.path}>
      <Card className="group h-full cursor-pointer p-3 transition-all duration-200 hover:border-primary/50 hover:shadow-md">
        <h3 className="text-lg leading-[1.4] text-foreground group-hover:text-primary transition-colors">
          <span className="mr-1.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white/80 align-middle text-sm text-slate-600 shadow-sm">
            {index + 1}
          </span>
          {getToolName(tool, lang)}
          <span className="ml-1.5 align-middle text-sm text-muted-foreground">
            · {tool.seoArticles.length} {t("篇文章", "articles")}
          </span>
        </h3>
        <p className="mt-1 text-base leading-[1.6] text-muted-foreground line-clamp-3">
          {getToolDescription(tool, lang, catInfo?.nameEn)}
        </p>
      </Card>
    </Link>
  );

  // ── 分段插廣告：每 ADS_EVERY 個工具切一段，尾段 < MIN_TAIL 併入前段 ──
  const ADS_EVERY = 10;
  const MIN_TAIL = 3;
  const chunkTools = (tools: Tool[]): Tool[][] => {
    const chunks: Tool[][] = [];
    for (let i = 0; i < tools.length; i += ADS_EVERY) {
      chunks.push(tools.slice(i, i + ADS_EVERY));
    }
    if (chunks.length === 0) return [[]];
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

  // 渲染一個子分組的工具：每段（10 個）之後插入一個廣告位。
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

  // ── 分頁工具函式 ────────────────────────────────────────
  const totalPages = (count: number) => Math.max(1, Math.ceil(count / PAGE_SIZE));
  const pageSlice = <T,>(items: T[]): { items: T[]; startOffset: number } => {
    const start = (page - 1) * PAGE_SIZE;
    return { items: items.slice(start, start + PAGE_SIZE), startOffset: start };
  };

  const renderPagination = (count: number) => {
    const pages = totalPages(count);
    if (pages <= 1) return null;
    const cur = Math.min(page, pages);
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
        aria-label={t("分頁導覽", "Pagination")}
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
          {t("上一頁", "Previous")}
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
          {t("下一頁", "Next")}
        </Button>
        <span className="ml-2 text-xs text-muted-foreground">
          {t(
            `第 ${cur} / ${pages} 頁 · 共 ${count} 個工具`,
            `Page ${cur} / ${pages} · ${count} tools`,
          )}
        </span>
      </nav>
    );
  };

  if (!catInfo) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground">{t("找不到此分類", "Category not found")}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/">{t("返回首頁", "Back to Home")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Category Header ──────────────────────────────── */}
      <div className={`border-b border-border ${catInfo.bgColor}`}>
        <div className="container py-10">
          <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-1" />
              {t("返回首頁", "Back to Home")}
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            <div className={`rounded-xl bg-background/80 p-3 ${catInfo.color}`}>
              <CategoryIcon iconName={catInfo.icon} className="h-8 w-8" />
            </div>
            <div>
              <h1
                className="font-bold"
                style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.2 }}
              >
                {lang === "zh" ? catInfo.name : catInfo.nameEn ?? catInfo.name}
              </h1>
              <p className="text-muted-foreground mt-1">
                {lang === "zh"
                  ? catInfo.description
                  : `Free, fast online ${catInfo.nameEn ?? catInfo.name} calculators and decision-support tools.`}
              </p>
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

      {/* ── Filters ──────────────────────────────────────── */}
      <div className="container py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("搜尋工具...", "Search tools...")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <TabsList>
              <TabsTrigger value="all">{t("全部", "All")}</TabsTrigger>
              <TabsTrigger value="free">{t("免費", "Free")}</TabsTrigger>
              <TabsTrigger value="premium">{t("付費", "Premium")}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* ── 次級分類 chips（有細分組的分類才顯示）────────── */}
        {hasGroups && groupAll.length > 0 && (
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
              {t("全部", "All")} ({allTools.length})
            </button>
            {groupAll.map(({ group, tools }) => (
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
                {lang === "zh" ? group.label : group.labelEn} ({tools.length})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Tools Grid ───────────────────────────────────── */}
      <div className="container pb-16">
        {filteredTools.length === 0 ? (
          <div className="py-20 text-center">
            {allTools.length === 0 ? (
              <>
                <p className="text-lg font-medium">
                  {t("此分類目前沒有公開工具", "No public tools in this category yet")}
                </p>
                <p className="text-muted-foreground mt-2 text-sm">
                  {t(
                    "請先探索其他分類，或使用上方搜尋尋找相關工具。",
                    "Please explore other categories, or use the search above to find relevant tools.",
                  )}
                </p>
                <Button asChild variant="outline" className="mt-6">
                  <Link href="/">{t("探索其他分類", "Explore Other Categories")}</Link>
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground">
                {t("沒有符合條件的工具", "No tools match your filters")}
              </p>
            )}
          </div>
        ) : hasGroups && subgroup === "all" ? (
          /* 有細分組且選「全部」：把所有子分組的工具攤平成連續序列做分頁，
             再於目前頁的可見範圍內，依子分組重新分段顯示（保留群組標題）。 */
          (() => {
            const flat: { group: UnifiedGroup; tool: Tool }[] = [];
            groupAll.forEach(({ group, tools }) => {
              tools.forEach((tool) => flat.push({ group, tool }));
            });
            const total = flat.length;
            const { items: pageItems, startOffset } = pageSlice(flat);
            const sections: { group: UnifiedGroup; tools: Tool[] }[] = [];
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
                    const heading = lang === "zh" ? sec.group.label : sec.group.labelEn;
                    return (
                      <section key={`${sec.group.key}-${si}`} aria-label={heading}>
                        <div className="mb-4 flex items-center gap-2">
                          <h2 className="text-lg font-bold">{heading}</h2>
                          <span className="text-sm text-muted-foreground">
                            ({sec.tools.length})
                          </span>
                        </div>
                        {renderGroupWithAds(
                          sec.tools,
                          `${cat}-group-${sec.group.key}-p${page}`,
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
        ) : hasGroups ? (
          /* 有細分組且已選定單一子分類：分頁 + 每 10 個工具插一個廣告位 */
          (() => {
            const total = filteredTools.length;
            const { items: pageItems, startOffset } = pageSlice(filteredTools);
            return (
              <>
                <div>
                  {renderGroupWithAds(
                    pageItems,
                    `${cat}-sub-${subgroup}-p${page}`,
                    startOffset,
                  )}
                </div>
                {renderPagination(total)}
              </>
            );
          })()
        ) : (
          /* 無細分組的分類（productivity / design / converter 等）：
             平鋪網格，不插廣告、不分頁，維持現狀。 */
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {filteredTools.map((tool: Tool, index: number) =>
              renderToolCard(tool, index),
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// finance 的群組物件沒有 labelEn 欄位，這裡提供一個對照表補上英文標籤。
// （財經為現狀沿用，不改 financeSubgroups.ts，故在此補英文以支援雙語顯示。）
const FINANCE_EN_LABELS: Record<string, string> = {
  "credit-debt": "Credit Card, Debt & Credit Score",
  "loan-mortgage": "Loans, Mortgage & Financing",
  "invest-return": "Investing, Stocks, Returns & Compounding",
  "tax-salary": "Tax, Salary & Income",
  "fx-inflation": "FX, Inflation & Currency",
  "insurance-risk": "Insurance, Risk & Planning",
  "business-cashflow": "Business, Cash Flow & Valuation",
  other: "Personal Finance & Others",
};

function financeEnLabel(key: string, fallback: string): string {
  return FINANCE_EN_LABELS[key] ?? fallback;
}
