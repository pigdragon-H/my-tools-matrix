#!/usr/bin/env python3
"""QC §E Visual Layout Discipline · 6 distinct layout regions

校正本要求 6 種布局，每種以「{/* L?-Name */}」inline 標籤錨定，
配合 lg:grid-cols-[X_Y] 比例。任何一個錯誤或缺失即 fail。

  L1-Hero            : lg:grid-cols-[1.05fr_0.95fr]
  L5-Calc            : lg:grid-cols-[0.9fr_1.1fr]
  L6-Result          : lg:grid-cols-[0.95fr_1.05fr]
  L9-Emotion-Upper   : lg:grid-cols-[1fr_0.9fr]
  L10-Emotion-Lower  : lg:grid-cols-[1fr_0.8fr]
  L14-Knowledge-FAQ  : lg:grid-cols-[1fr_0.9fr]
"""

from __future__ import annotations
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

GOLDEN_TOOLS: list[Path] = [
    ROOT / "client/src/tools/health/BmiCalculator/index.tsx",
    ROOT / "client/src/tools/health/BmrCalculator/index.tsx",
]

# 每筆：(label, tag-comment 必出現, ratio 必出現於同一行 80 字內)
REQUIREMENTS: list[tuple[str, str, str]] = [
    ("L1-Hero · 1.05/0.95",          r"\{/\*\s*L1-Hero\b",          r"lg:grid-cols-\[1\.05fr_0\.95fr\]"),
    ("L5-Calc · 0.9/1.1",            r"\{/\*\s*L5-Calc\b",          r"lg:grid-cols-\[0\.9fr_1\.1fr\]"),
    ("L6-Result · 0.95/1.05",        r"\{/\*\s*L6-Result\b",        r"lg:grid-cols-\[0\.95fr_1\.05fr\]"),
    ("L9-Emotion-Upper · 1/0.9",     r"\{/\*\s*L9-Emotion-Upper\b", r"lg:grid-cols-\[1fr_0\.9fr\]"),
    ("L10-Emotion-Lower · 1/0.8",    r"\{/\*\s*L10-Emotion-Lower\b",r"lg:grid-cols-\[1fr_0\.8fr\]"),
    ("L14-Knowledge-FAQ · 1/0.9",    r"\{/\*\s*L14-Knowledge-FAQ\b",r"lg:grid-cols-\[1fr_0\.9fr\]"),
]


def audit(path: Path) -> tuple[int, int, list[str]]:
    src = path.read_text(encoding="utf-8")
    lines = src.splitlines()
    passed = 0
    fails: list[str] = []
    for label, tag_re, ratio_re in REQUIREMENTS:
        # 找出含 tag 的行，並驗證該行（或前後 1 行）含正確比例
        ok = False
        for i, line in enumerate(lines):
            if re.search(tag_re, line):
                window = " ".join(lines[max(0, i - 1):i + 2])
                if re.search(ratio_re, window):
                    ok = True
                    break
        if ok:
            passed += 1
        else:
            fails.append(
                f"  ❌ {label}\n"
                f"     需在同一段落內同時出現：{tag_re}  +  {ratio_re}"
            )
    return passed, len(REQUIREMENTS), fails


def discover_tools() -> list[Path]:
    base = ROOT / "client/src/tools"
    if not base.exists():
        return []
    return sorted(base.glob("*/[A-Z]*/index.tsx"))


def main() -> int:
    args = [Path(a).resolve() for a in sys.argv[1:]]
    if args:
        tools = args
    else:
        discovered = discover_tools()
        tools = list(GOLDEN_TOOLS) + [p for p in discovered if p not in GOLDEN_TOOLS]

    overall_ok = True
    for path in tools:
        if not path.exists():
            print(f"⚠️  missing: {path}")
            overall_ok = False
            continue
        passed, total, fails = audit(path)
        try:
            rel = path.relative_to(ROOT)
        except ValueError:
            rel = path
        status = "✅" if passed == total else "❌"
        print(f"{status} {rel}  {passed}/{total} layouts")
        for line in fails:
            print(line)
        if fails:
            overall_ok = False
        print()
    return 0 if overall_ok else 1


if __name__ == "__main__":
    sys.exit(main())
