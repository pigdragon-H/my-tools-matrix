#!/usr/bin/env python3
"""QC §A 17-Layer Audit · Profile-aware

讀取 index.tsx 開頭的 `// @profile X` 註解，依 Profile 套用對應的 L6/L7 marker 集合。
若未標 profile，預設視為 Profile A（最嚴格）。

Usage:
    python3 scripts/qc_layer_audit.py [<tool_path> ...]

不指定路徑時，會自動掃 client/src/tools/<category>/<Tool>/index.tsx 全部，
但有 GOLDEN_TOOLS 白名單時會優先驗證它們。
"""

from __future__ import annotations
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# 黃金白名單（已驗證 17/17 的工具，永遠優先掃描）
GOLDEN_TOOLS: list[Path] = [
    ROOT / "client/src/tools/health/BmiCalculator/index.tsx",
    ROOT / "client/src/tools/health/BmrCalculator/index.tsx",
]

# ============================================================
# Profile-specific L6 / L7 markers
# ============================================================
PROFILE_MARKERS: dict[str, dict[str, list[str]]] = {
    "A": {  # Diagnostic-YMYL: 給分級判讀
        "L6": ["recommendedAction", "建議行動", "Recommended Action",
               "Risk Summary", "風險摘要", "riskSummary", "nextTool"],
        "L7": ["resultIntelligence", "結果解讀", "Interpret category",
               "categoryInfo", "categoryInfo.map"],
    },
    "B": {  # Calculator-YMYL: 給數值 + 三檔目標
        "L6": ["estimatedTdee", "maintenanceCalories", "fatLossTarget",
               "primaryValue", "maintenanceTarget", "actionTarget",
               "monthlyPayment", "totalInterest",
               "TDEE", "Maintenance", "Fat Loss",
               "主要數值", "維持目標", "行動目標"],
        "L7": ["resultIntelligence", "categoryInfo", "activityLevel",
               "結果解讀", "活動量", "Activity level", "Interpret category"],
    },
    "C": {  # Planner-Practical
        "L6": ["planSummary", "breakdown", "tipOfTheDay",
               "計畫摘要", "拆解", "Plan Summary", "Breakdown"],
        "L7": ["resultIntelligence", "categoryInfo", "scenario", "情境", "Scenario"],
    },
    "D": {  # Converter-Utility
        "L6": ["convertedValue", "precision", "commonValuesTable",
               "轉換結果", "精度", "Converted Value", "Precision"],
        "L7": ["resultIntelligence", "categoryInfo", "commonScales",
               "常用對照", "Common Scales"],
    },
    "E": {  # Developer-Tool
        "L6": ["output", "validity", "metaInfo",
               "輸出", "驗證", "Output", "Validity"],
        "L7": ["resultIntelligence", "categoryInfo", "lintCategories", "解析", "Parse"],
    },
    "F": {  # Education-Reference
        "L6": ["entryDetail", "relatedEntries", "studyTip",
               "條目詳情", "相關條目", "Entry Detail", "Related Entries"],
        "L7": ["resultIntelligence", "categoryInfo", "subjectGroup",
               "學科分類", "Subject group"],
    },
}


def build_layers(profile: str) -> list[tuple[str, str, list[str]]]:
    """根據 profile 組出 17 層 marker。L1-L5、L8-L17 全 Profile 共用；L6/L7 因 Profile 而異。"""
    p = PROFILE_MARKERS.get(profile.upper(), PROFILE_MARKERS["A"])
    return [
        ("L1",  "Hero · 文字 + Trust Note",
            ["trustNote", "Trust note", "信任聲明", "信任提醒"]),
        ("L2",  "Lang Switcher",
            ["setLang", "switchToEnglish", "切換到中文", "Switch to English"]),
        ("L3",  "Quick Action Card · 1鍵填入",
            ["fillAdultMaleExample", "fillTypicalExample", "fillExample",
             "一鍵填入", "One-click fill"]),
        ("L4",  "Examples Bridge / Examples Card",
            ["examplesCalculator", "examplesTitle", "範例 → 計算機",
             "Examples →", "exampleCard"]),
        ("L5",  "Calculator Inputs · 公制/英制",
            ["unitSystem", "metric", "imperial", "公制", "英制"]),
        ("L6",  f"Result Card · Profile {profile.upper()} 三格語意", p["L6"]),
        ("L7",  f"Result Intelligence · Profile {profile.upper()} 6 格", p["L7"]),
        ("L8",  "AdSenseWrapper 中段橫幅",
            ["AdSenseWrapper"]),
        ("L9",  "Emotion+Conversion 上排 · Progress + Motivation",
            ["progressInsightCard", "motivationCard", "進度洞察",
             "動力卡", "Progress Insight", "Motivation Card"]),
        ("L10", "Emotion+Conversion 下排 · Journey + Save/Share",
            ["saveSharePlaceholder", "saveShareJourney", "journeyTitle",
             "儲存 / 分享", "Save / Share"]),
        ("L11", "Decision Path · 4 步",
            ["decisionPath", "decisionStep", "決策路徑", "Decision Path"]),
        ("L12", "Knowledge · Definition/Limitations/Neighbors",
            ["limitations", "semanticNeighbors", "definitionText",
             "限制", "相關工具"]),
        ("L13", "FAQ · <details>",
            ["faqKeys", "<details", "faq1Q"]),
        ("L14", "AdSlot post-FAQ",
            ["AdSlot"]),
        ("L15", "Affiliate · 4 格 + 揭露語",
            ["affiliate", "聯盟連結", "Affiliate links",
             "We may earn a commission", "affiliateDisclosure"]),
        ("L16", "Premium Gate",
            ["PremiumGate"]),
        ("L17", "Trust · Related · References",
            ["trustRelatedReferences", "referencesText",
             "信任聲明", "Trust", "References"]),
    ]


PROFILE_RE = re.compile(r"//\s*@profile\s+([A-Fa-f])\b")


def detect_profile(src: str) -> str:
    m = PROFILE_RE.search(src[:2000])  # 只看頭 2KB
    return m.group(1).upper() if m else "A"


def audit(path: Path) -> tuple[str, int, int, list[str]]:
    src = path.read_text(encoding="utf-8")
    profile = detect_profile(src)
    layers = build_layers(profile)
    passed = 0
    fails: list[str] = []
    for lid, label, markers in layers:
        if any(m in src for m in markers):
            passed += 1
        else:
            fails.append(f"  ❌ {lid}  {label}\n     markers tried: {markers[:5]}{' ...' if len(markers) > 5 else ''}")
    return profile, passed, len(layers), fails


def discover_tools() -> list[Path]:
    """掃 client/src/tools/<cat>/<Tool>/index.tsx"""
    base = ROOT / "client/src/tools"
    if not base.exists():
        return []
    return sorted(base.glob("*/[A-Z]*/index.tsx"))


def main() -> int:
    args = [Path(a).resolve() for a in sys.argv[1:]]
    if args:
        tools = args
    else:
        # 黃金優先 + 其餘
        discovered = discover_tools()
        tools = list(GOLDEN_TOOLS) + [p for p in discovered if p not in GOLDEN_TOOLS]

    overall_ok = True
    for path in tools:
        if not path.exists():
            print(f"⚠️  missing: {path}")
            overall_ok = False
            continue
        profile, passed, total, fails = audit(path)
        try:
            rel = path.relative_to(ROOT)
        except ValueError:
            rel = path
        status = "✅" if passed == total else "❌"
        print(f"{status} [{profile}] {rel}  {passed}/{total} layers")
        for line in fails:
            print(line)
        if fails:
            overall_ok = False
        print()
    return 0 if overall_ok else 1


if __name__ == "__main__":
    sys.exit(main())
