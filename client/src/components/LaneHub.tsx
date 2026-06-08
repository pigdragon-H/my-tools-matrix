// ============================================================
// LaneHub — 賽道列表 hub 通用元件（藍圖/機會/知識共用）
// ============================================================
// 列出某賽道全部內容卡片；若無內容，顯示「籌備中 / Coming Soon」+ 賽道定位。
// 符合 Victor「全部可見、標即將推出」的露出策略（內容陸續補）。
import { useEffect } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { setSeoMeta } from "@/lib/seo";
import { getLane } from "../../../shared/laneRegistry";
import { contentByLane } from "@/lib/laneContent";

export function LaneHub({ laneId }: { laneId: string }) {
  const { lang } = useLanguage();
  const lane = getLane(laneId);
  const items = contentByLane(laneId);

  useEffect(() => {
    if (lane) {
      setSeoMeta({
        title: `${lane.title[lang]}｜Formula Universe`,
        description: lane.tagline[lang],
      });
    }
  }, [lang, lane]);

  if (!lane) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <header className="mb-8">
        <h1 className="text-4xl font-bold">{lane.title[lang]}</h1>
        <p className="text-lg text-muted-foreground mt-3 max-w-2xl">{lane.tagline[lang]}</p>
      </header>

      {items.length === 0 ? (
        <div className="border border-dashed rounded-xl p-12 text-center text-muted-foreground">
          <p className="text-xl font-semibold mb-2">
            {lang === "zh" ? "內容籌備中" : "Coming Soon"}
          </p>
          <p className="text-sm">
            {lang === "zh"
              ? "我們正在為這個方向準備高品質內容，敬請期待。"
              : "We're preparing high-quality content for this lane. Stay tuned."}
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {items.map((item) => (
            <Link key={item.path} href={item.path}>
              <div className="group h-full border rounded-xl p-5 hover:border-primary hover:shadow-md transition cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  {item.meta.publishedAt && (
                    <Badge variant="secondary" className="text-xs">
                      {item.meta.publishedAt}
                    </Badge>
                  )}
                </div>
                <h2 className="text-lg font-semibold group-hover:text-primary leading-snug">
                  {item.meta.title[lang]}
                </h2>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                  {item.meta.description[lang]}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
