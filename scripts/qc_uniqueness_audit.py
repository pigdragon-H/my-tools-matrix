#!/usr/bin/env python3
"""QC §F · Uniqueness & Anti-Pattern Audit (第 5 道閘門)

由 2026-05-31 violation incident 催生 — 堵住前 4 道 QC 的盲點。

檢測四項:
  1. Marker uniqueness — 17 層 marker 不可在同一工具內重複出現(防 Knowledge / References 重複)
  2. Forbidden words — 「預留 / TBD / Coming soon / placeholder / Lorem ipsum / TODO」不得在 production 工具
  3. L17 後零元素 — Footer Trust 必須是最後一層
  4. Ad placement whitelist — AdSenseWrapper 只能出現在 L8 / L14 區段(不可在 L17 之後)

Usage:
    python3 scripts/qc_uniqueness_audit.py [<tool_path> ...]
"""

from __future__ import annotations
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# ============================================================
# Rule 1: Marker uniqueness — 這些 marker 在同工具內只能出現 1 次
# ============================================================
UNIQUE_MARKERS = [
    # 各層的「主標題 / 唯一錨點」型 marker
    "knowledgeTitle",       # L12 主 Knowledge 標題
    "knowledgeFaqTitle",    # L14 FAQ Knowledge 標題
    "footerTrustTitle",     # L17 Trust 主標題
    "trustRelatedReferences",
    "primaryValue",         # Profile B 主數值
    "actionTarget",
    "maintenanceTarget",
    "resultIntelligence",
    "affiliateDisclosure",  # 聯盟揭露句
]

# ============================================================
# Rule 2: 禁字 — production 工具不得出現
# ============================================================
FORBIDDEN_PATTERNS = [
    (r"預留", "中文「預留」佔位符"),
    (r"\bTBD\b", "TBD 佔位符"),
    (r"Coming\s*soon", "Coming soon 佔位符"),
    (r"\bplaceholder\b", "placeholder 字樣"),
    (r"Lorem\s+ipsum", "Lorem ipsum 假文"),
    (r"//\s*TODO", "TODO 註解"),
    (r"//\s*FIXME", "FIXME 註解"),
    (r"//\s*XXX", "XXX 註解"),
]

# 例外:某些字眼可在 type/utility 上下文出現,放白名單
FORBIDDEN_WHITELIST_LINES = [
    r"placeholder=",       # JSX input placeholder 屬性是合法的
    r"placeholder:\s*",    # 物件屬性
    r"saveSharePlaceholder",  # i18n key 名(會在 v2 移除)
]

# ============================================================
# Rule 3 & 4: 區塊定位
# ============================================================
L17_MARKER_PATTERN = re.compile(
    r"(footerTrustTitle|trustRelatedReferences|/\*\s*L17|//\s*L17|data-layer=[\"']17[\"'])",
    re.IGNORECASE,
)
ADSENSE_PATTERN = re.compile(r"<AdSenseWrapper\b|<AdSlot\b")


def collect_tool_files(args: list[str]) -> list[Path]:
    if args:
        return [Path(a) for a in args if Path(a).exists()]
    base = ROOT / "client/src/tools"
    return sorted(base.rglob("index.tsx"))


def check_uniqueness(text: str, fname: str) -> list[str]:
    errs = []
    for marker in UNIQUE_MARKERS:
        # 算「t.<marker>」或「"<marker>"」或字面 marker 出現次數(扣掉 i18n 定義)
        # 計算「使用點」:t.MARKER 或 ui.MARKER 或 copy.MARKER
        usage_pattern = re.compile(rf"\b(?:t|ui|copy)\.{re.escape(marker)}\b")
        hits = usage_pattern.findall(text)
        if len(hits) > 1:
            errs.append(f"  ⚠ marker '{marker}' 出現 {len(hits)} 次(應為 1 次)")
    return errs


def check_forbidden(text: str, fname: str) -> list[str]:
    errs = []
    lines = text.split("\n")
    for i, line in enumerate(lines, 1):
        if any(re.search(wl, line) for wl in FORBIDDEN_WHITELIST_LINES):
            continue
        for pat, desc in FORBIDDEN_PATTERNS:
            if re.search(pat, line):
                snippet = line.strip()[:80]
                errs.append(f"  ✘ L{i}: {desc} → {snippet}")
                break
    return errs


def check_l17_last(text: str, fname: str) -> list[str]:
    """檢查 L17 marker 是否在檔案最後段(之後不可有 AdSense / 大區塊)。"""
    errs = []
    # 找出最後一個 L17 marker 出現位置
    matches = list(L17_MARKER_PATTERN.finditer(text))
    if not matches:
        return errs  # 找不到 L17 由 layer audit 處理
    last_l17_pos = matches[-1].end()
    after_l17 = text[last_l17_pos:]
    # 在 L17 之後,不可有新的 AdSenseWrapper / AdSlot
    if ADSENSE_PATTERN.search(after_l17):
        errs.append("  ✘ L17 之後仍出現 AdSenseWrapper/AdSlot — 鐵律違反")
    # 在 L17 之後,不可有 <section> / <article> 大區塊(粗略檢查)
    big_blocks = re.findall(r"<section\b|<article\b", after_l17)
    if len(big_blocks) > 2:  # 容許 L17 內部 2 個小段落
        errs.append(f"  ✘ L17 之後出現 {len(big_blocks)} 個 <section/article> 區塊(應 ≤ 2)")
    return errs


def check_ad_whitelist(text: str, fname: str) -> list[str]:
    """AdSenseWrapper 必須在 L17 marker 之前。"""
    errs = []
    ad_positions = [m.start() for m in ADSENSE_PATTERN.finditer(text)]
    l17_matches = list(L17_MARKER_PATTERN.finditer(text))
    if not l17_matches or not ad_positions:
        return errs
    last_l17_pos = l17_matches[-1].start()
    after_count = sum(1 for p in ad_positions if p > last_l17_pos)
    if after_count > 0:
        errs.append(f"  ✘ {after_count} 個 AdSenseWrapper 位於 L17 之後 — 違反白名單")
    return errs


def audit(path: Path) -> tuple[bool, list[str]]:
    text = path.read_text(encoding="utf-8")
    fname = str(path.relative_to(ROOT)) if ROOT in path.parents else str(path)

    all_errs = []
    all_errs += check_uniqueness(text, fname)
    all_errs += check_forbidden(text, fname)
    all_errs += check_l17_last(text, fname)
    all_errs += check_ad_whitelist(text, fname)

    return (len(all_errs) == 0, all_errs)


def main() -> int:
    files = collect_tool_files(sys.argv[1:])
    if not files:
        print("⚠ 找不到任何 index.tsx")
        return 1

    overall = True
    print(f"§F · Uniqueness & Anti-Pattern Audit  ({len(files)} files)")
    print("=" * 64)
    for f in files:
        ok, errs = audit(f)
        rel = f.relative_to(ROOT) if ROOT in f.parents else f
        if ok:
            print(f"  ✅ {rel}")
        else:
            overall = False
            print(f"  ❌ {rel}")
            for e in errs:
                print(e)

    print("=" * 64)
    if overall:
        print("§F PASSED · marker uniqueness + 禁字 + L17 末位 + 廣告白名單 全綠")
        return 0
    print("§F FAILED · 修到全綠為止(不准 commit)")
    return 1


if __name__ == "__main__":
    sys.exit(main())
