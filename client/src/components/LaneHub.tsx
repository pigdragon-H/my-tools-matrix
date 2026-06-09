// ============================================================
// LaneHub — 賽道列表 hub 通用元件（藍圖/機會/知識共用）
// ============================================================
// 階段 A 內容結構升級（解決「已讀過的海」厭煩感）：
//   ① 分類晶片（帶數量徽章）— 點擊過濾
//   ② 分類分區 — 預設依分類分區塊堆疊，取代單一大平鋪 grid
//   ③ 區內序號 01/02/03 — 閱讀次第可見（meta.order 為底，否則依日期自動編）
//   ④ 已讀 ✓ 進度 — 純前端 localStorage，已讀卡降彩度＋打勾
// 只增不刪：黃金字級 .fu-typo 保留；無內容時仍顯示「籌備中」。
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { setSeoMeta } from "@/lib/seo";
import { getLane } from "../../../shared/laneRegistry";
import { contentByLane } from "@/lib/laneContent";
import { groupByCategory, ordinal } from "@/lib/laneCategories";
import { useReadProgress } from "@/hooks/useReadProgress";

const ALL_KEY = "__all__";

export function LaneHub({ laneId }: { laneId: string }) {
  const { lang } = useLanguage();
  const lane = getLane(laneId);
  const items = useMemo(() => contentByLane(laneId), [laneId]);
  const groups = useMemo(() => groupByCategory(laneId, items), [laneId, items]);
  const { isRead, readCount } = useReadProgress(laneId);

  const [activeCat, setActiveCat] = useState<string>(ALL_KEY);

  useEffect(() => {
    setActiveCat(ALL_KEY);
  }, [laneId]);

  useEffect(() => {
    if (lane) {
      setSeoMeta({
        title: `${lane.title[lang]}｜Formula Universe`,
        description: lane.tagline[lang],
      });
    }
  }, [lang, lane]);

  if (!lane) return null;

  const total = items.length;
  const visibleGroups =
    activeCat === ALL_KEY ? groups : groups.filter((g) => g.key === activeCat);

  return (
    <div className="fu-typo max-w-5xl mx-auto px-4 py-10">
      <header className="mb-8">
        <h1 className="t-h1">{lane.title[lang]}</h1>
        <p className="t-lead text-muted-foreground mt-3 max-w-2xl">{lane.tagline[lang]}</p>
      </header>

      {total === 0 ? (
        <div className="border border-dashed rounded-xl p-12 text-center text-muted-foreground">
          <p className="text-xl font-semibold mb-2">
            {lang === "zh" ? "內容籌備中" : "Coming Soon"}
          </p>
          <p className="text-sm">
            {lang === "zh"
              ? "我們正在為這個方向準備高品質內容,敬請期待。"
              : "We're preparing high-quality content for this lane. Stay tuned."}
          </p>
        </div>
      ) : (
        <>
          {/* ① 分類晶片（帶數量徽章） */}
          <div className="mb-8 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveCat(ALL_KEY)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${
                activeCat === ALL_KEY
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background hover:border-primary/50"
              }`}
            >
              {lang === "zh" ? "全部" : "All"}
              <span className="rounded-full bg-black/10 px-1.5 text-xs dark:bg-white/15">
                {total}
              </span>
            </button>
            {groups.map((g) => (
              <button
                key={g.key}
                type="button"
                onClick={() => setActiveCat(g.key)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${
                  activeCat === g.key
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:border-primary/50"
                }`}
              >
                <span aria-hidden>{g.label.emoji}</span>
                {g.label[lang]}
                <span className="rounded-full bg-black/10 px-1.5 text-xs dark:bg-white/15">
                  {g.count}
                </span>
              </button>
            ))}
            {readCount > 0 && (
              <span className="ml-auto inline-flex items-center gap-1.5 self-center text-xs text-muted-foreground">
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                {lang === "zh" ? `已讀 ${readCount} 篇` : `${readCount} read`}
              </span>
            )}
          </div>

          {/* ② 分類分區 + ③ 區內序號 + ④ 已讀角標 */}
          <div className="space-y-12">
            {visibleGroups.map((g) => (
              <section key={g.key} aria-label={g.label[lang]}>
                <div className="mb-4 flex items-center gap-2.5 border-b pb-2">
                  <span className="text-xl" aria-hidden>
                    {g.label.emoji}
                  </span>
                  <h2 className="t-h3 font-bold">{g.label[lang]}</h2>
                  <span className="text-sm text-muted-foreground">
                    {lang === "zh" ? `${g.count} 篇` : `${g.count}`}
                  </span>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  {g.items.map((item, idx) => {
                    const num = item.meta.order ?? idx + 1;
                    const read = isRead(item.slug);
                    return (
                      <Link key={item.path} href={item.path}>
                        <div
                          className={`group relative h-full rounded-xl border p-5 transition cursor-pointer hover:border-primary hover:shadow-md ${
                            read ? "opacity-70" : ""
                          }`}
                        >
                          {/* ③ 區內序號 */}
                          <span className="absolute right-4 top-4 font-mono text-xs font-bold text-muted-foreground/60">
                            {ordinal(num)}
                          </span>

                          <div className="mb-2 flex flex-wrap items-center gap-2 pr-8">
                            {/* ④ 已讀 ✓ 角標 */}
                            {read && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                                <Check className="h-3 w-3" />
                                {lang === "zh" ? "已讀" : "Read"}
                              </span>
                            )}
                            {item.meta.pillar && (
                              <Badge variant="outline" className="text-xs">
                                {item.meta.pillar}
                              </Badge>
                            )}
                            {item.meta.publishedAt && (
                              <Badge variant="secondary" className="text-xs">
                                {item.meta.publishedAt}
                              </Badge>
                            )}
                          </div>

                          <h3 className="t-h3 leading-snug group-hover:text-primary">
                            {item.meta.title[lang]}
                          </h3>
                          <p className="t-small text-muted-foreground mt-2 line-clamp-3">
                            {item.meta.description[lang]}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
