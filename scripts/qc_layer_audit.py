#!/usr/bin/env python3
"""QC §A 17-Layer Audit · 對 BMI/BMR 兩支金樣靜態掃描，回報缺哪一層。"""

from __future__ import annotations
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TOOLS = [
    ROOT / "client/src/tools/health/BmiCalculator/index.tsx",
    ROOT / "client/src/tools/health/BmrCalculator/index.tsx",
]

# 每一層用「至少出現一個 marker」判定。Marker 用寬鬆同義詞，避免被細節絆倒。
LAYERS: list[tuple[str, str, list[str]]] = [
    ("L1",  "Hero · 文字 + Trust Note",
        ["trustNote", "Trust note", "信任聲明", "信任提醒"]),
    ("L2",  "Lang Switcher",
        ["setLang", "switchToEnglish", "切換到中文", "Switch to English"]),
    ("L3",  "Quick Action Card · 1鍵填入",
        ["fillAdultMaleExample", "fillTypicalExample", "fillExample", "一鍵填入", "One-click fill"]),
    ("L4",  "Examples Bridge / Examples Card",
        ["examplesCalculator", "examplesTitle", "範例 → 計算機", "Examples →", "exampleCard"]),
    ("L5",  "Calculator Inputs · 公制/英制",
        ["unitSystem", "metric", "imperial", "公制", "英制"]),
    ("L6",  "Result Card · 大數字 + risks/actions/nextTool",
        ["recommendedAction", "建議行動", "Recommended Action", "Risk Summary", "風險摘要"]),
    ("L7",  "Result Intelligence · 6 格分類",
        ["resultIntelligence", "結果解讀", "Interpret category", "categoryInfo.map"]),
    ("L8",  "AdSenseWrapper 中段橫幅",
        ["AdSenseWrapper"]),
    ("L9",  "Emotion+Conversion 上排 · Progress + Motivation",
        ["progressInsightCard", "motivationCard", "進度洞察", "動力卡", "Progress Insight", "Motivation Card"]),
    ("L10", "Emotion+Conversion 下排 · Journey + Save/Share",
        ["saveSharePlaceholder", "saveShareJourney", "journeyTitle", "儲存 / 分享", "Save / Share"]),
    ("L11", "Decision Path · 4 步",
        ["decisionPath", "decisionStep", "決策路徑", "Decision Path"]),
    ("L12", "Knowledge · Definition/Limitations/Neighbors",
        ["limitations", "semanticNeighbors", "definitionText", "限制", "相關工具"]),
    ("L13", "FAQ · <details>",
        ["faqKeys", "<details", "faq1Q"]),
    ("L14", "AdSlot post-FAQ",
        ["AdSlot"]),
    ("L15", "Affiliate · 4 格 + 揭露語",
        ["affiliate", "聯盟連結", "Affiliate links", "We may earn a commission", "affiliateDisclosure"]),
    ("L16", "Premium Gate",
        ["PremiumGate"]),
    ("L17", "Trust · Related · References",
        ["trustRelatedReferences", "referencesText", "信任聲明", "Trust", "References"]),
]


def audit(path: Path) -> tuple[int, int, list[str]]:
    src = path.read_text(encoding="utf-8")
    passed = 0
    fails: list[str] = []
    for lid, label, markers in LAYERS:
        if any(m in src for m in markers):
            passed += 1
        else:
            fails.append(f"  ❌ {lid}  {label}\n     markers tried: {markers}")
    return passed, len(LAYERS), fails


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
        print(f"{status} {rel}  {passed}/{total} layers")
        for line in fails:
            print(line)
        if fails:
            overall_ok = False
        print()
    return 0 if overall_ok else 1


if __name__ == "__main__":
    sys.exit(main())
