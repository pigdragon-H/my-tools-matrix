#!/usr/bin/env python3
"""QC §E Visual Layout Discipline · 對工具靜態掃描 lg:grid-cols-[X_Y] 比例。

校正本要求 6 種布局：
  - Hero 2 列          : lg:grid-cols-[1.05fr_0.95fr]
  - 計算機 2 列         : lg:grid-cols-[0.9fr_1.1fr]
  - 結果 2 列           : lg:grid-cols-[0.95fr_1.05fr]
  - Emotion 上排 (L9)   : lg:grid-cols-[1fr_0.9fr]
  - Emotion 下排 (L10)  : lg:grid-cols-[1fr_0.8fr]
  - Knowledge+FAQ      : lg:grid-cols-[1fr_0.9fr]   (與 Emotion 上排同比例，但語意不同)

由於 [1fr_0.9fr] 同時用在兩個地方，所以「至少出現 2 次 [1fr_0.9fr]」才算過關。
"""

from __future__ import annotations
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TOOLS = [
    ROOT / "client/src/tools/health/BmiCalculator/index.tsx",
    ROOT / "client/src/tools/health/BmrCalculator/index.tsx",
]

REQUIREMENTS: list[tuple[str, str, int]] = [
    ("Hero 2 列",         r"lg:grid-cols-\[1\.05fr_0\.95fr\]",  1),
    ("計算機 2 列",        r"lg:grid-cols-\[0\.9fr_1\.1fr\]",    1),
    ("結果 2 列",          r"lg:grid-cols-\[0\.95fr_1\.05fr\]",  1),
    ("Emotion 上排 + Knowledge/FAQ 並排",
                         r"lg:grid-cols-\[1fr_0\.9fr\]",       2),
    ("Emotion 下排",       r"lg:grid-cols-\[1fr_0\.8fr\]",       1),
]


def audit(path: Path) -> tuple[int, int, list[str]]:
    src = path.read_text(encoding="utf-8")
    passed = 0
    fails: list[str] = []
    for label, pattern, min_count in REQUIREMENTS:
        count = len(re.findall(pattern, src))
        if count >= min_count:
            passed += 1
        else:
            fails.append(
                f"  ❌ {label}\n"
                f"     pattern: {pattern}\n"
                f"     expected ≥ {min_count}, found {count}"
            )
    return passed, len(REQUIREMENTS), fails


def main() -> int:
    overall_ok = True
    for path in TOOLS:
        if not path.exists():
            print(f"⚠️  missing: {path.relative_to(ROOT)}")
            overall_ok = False
            continue
        passed, total, fails = audit(path)
        rel = path.relative_to(ROOT)
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
