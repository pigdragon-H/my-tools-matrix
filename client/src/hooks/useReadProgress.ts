// ============================================================
// useReadProgress — 已讀進度（純前端 localStorage，零隱私風險）
// ============================================================
// 記錄使用者「讀過哪些文章 slug」，列表頁據此打 ✓ 角標、降彩度。
// 不送伺服器、不含個資，符合 privacy 政策「計算只在瀏覽器」精神。
//
// 用法：
//   const { isRead, markRead, readCount } = useReadProgress("knowledge");
//   <Card className={isRead(slug) ? "opacity-70" : ""} />
// 進文章頁時呼叫 markRead(slug) 即可。
// ============================================================
import { useCallback, useEffect, useState } from "react";

const KEY_PREFIX = "fu:read:";

function load(laneId: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(KEY_PREFIX + laneId);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function save(laneId: string, set: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY_PREFIX + laneId, JSON.stringify(Array.from(set)));
  } catch {
    /* 容量滿或隱私模式 → 靜默忽略，不影響功能 */
  }
}

export function useReadProgress(laneId: string) {
  const [read, setRead] = useState<Set<string>>(() => load(laneId));

  // laneId 變動時重新載入
  useEffect(() => {
    setRead(load(laneId));
  }, [laneId]);

  const isRead = useCallback((slug: string) => read.has(slug), [read]);

  const markRead = useCallback(
    (slug: string) => {
      setRead((prev) => {
        if (prev.has(slug)) return prev;
        const next = new Set(prev);
        next.add(slug);
        save(laneId, next);
        return next;
      });
    },
    [laneId]
  );

  const clearProgress = useCallback(() => {
    setRead(new Set());
    save(laneId, new Set());
  }, [laneId]);

  return { isRead, markRead, clearProgress, readCount: read.size };
}
