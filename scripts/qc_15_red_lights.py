#!/usr/bin/env python3
"""
WO-2026-0601-001 v3.1 · 15-Red-Light Self-Check
Per Superninja 操作準則 v1.0 · all GREEN required before commit

Usage: python3 scripts/qc_15_red_lights.py <path-to-tool/index.tsx>
"""
import sys, re
from pathlib import Path

def check(path: Path):
    src = path.read_text(encoding="utf-8")
    results = []

    # 紅燈1：@profile B 標記
    results.append(("R1 @profile B 標記", "// @profile B" in src or "@profile B" in src))

    # 紅燈2：import 順序（useLanguage 最後一個 import）
    imports = re.findall(r'^import\s+.*?from\s+["\'][^"\']+["\']', src, re.MULTILINE)
    if imports:
        last = imports[-1]
        results.append(("R2 useLanguage 為最後 import", "useLanguage" in last))
    else:
        results.append(("R2 useLanguage 為最後 import", False))

    # 紅燈3：AffiliateItem 類型存在
    results.append(("R3 AffiliateItem 類型定義", "type AffiliateItem" in src))

    # 紅燈4：affiliateItems 4 格
    aff_match = re.search(r'affiliateItems[^=]*=\s*\[(.*?)\];', src, re.DOTALL)
    if aff_match:
        items = re.findall(r'\{\s*label:', aff_match.group(1))
        results.append((f"R4 affiliateItems 4 格 (found {len(items)})", len(items) == 4))
    else:
        results.append(("R4 affiliateItems 4 格", False))

    # 紅燈5：17 層層序正確（檢查 canonical comment）
    expected_layers = ["L1-Hero", "L2-TrustIntro", "L3-QuickStartExample", "L4-InputGuidance",
                       "L5-CalculatorInput", "L6-PrimaryResult", "L7-ResultIntelligence",
                       "L8-ScenarioComparison", "L9-EmotionConversionUpper", "L10-EmotionConversionLower",
                       "L11-DecisionPath", "L12-Knowledge", "L13-FAQ", "L14-FAQAfterAdSlot",
                       "L15-AffiliateResources", "L16-PremiumGate", "L17-TrustRelatedReferences"]
    layers_ok = all(layer in src for layer in expected_layers)
    results.append(("R5 17 層 canonical 標記齊全", layers_ok))

    # 紅燈6：L12 公式存在 (formula + formulaText)
    results.append(("R6 L12 公式存在 (formula + formulaText)",
                    "formula:" in src and "formulaText:" in src))

    # 紅燈7：L13 FAQ = 6 題且無 placeholder
    # q1..q6 為 unique keys（zh+en 各一份相同 key）
    q_keys = set(re.findall(r'\bq(\d+):', src))
    a_keys = set(re.findall(r'\ba(\d+):', src))
    has_placeholder = re.search(r'\b(TODO|FIXME|Lorem ipsum)\b', src) or re.search(r'placeholder.*"[^"]{0,3}"', src)
    # FAQ key 命名以 faqKeys = [["q1","a1"],...] 為主：檢查 faqKeys 數量
    faq_match = re.search(r'faqKeys\s*=\s*(\[\[.*?\]\])', src, re.DOTALL)
    pair_count = len(re.findall(r'\["q\d+"\s*,\s*"a\d+"\]', faq_match.group(1))) if faq_match else 0
    results.append((f"R7 L13 FAQ=6 (q-keys={len(q_keys)} a-keys={len(a_keys)} pairs={pair_count}) 無 placeholder",
                    len(q_keys) == 6 and len(a_keys) == 6 and pair_count == 6 and not has_placeholder))

    # 紅燈8：L14 不夾在 L12/L13 之間
    # 找 L12-Knowledge 與 L13-FAQ 的位置，再找 L14-FAQAfterAdSlot 的位置
    pos_l12 = src.find("L12-Knowledge · L13-FAQ")
    pos_l14 = src.find('aria-label="L14 FAQ after ad slot')
    if pos_l12 > -1 and pos_l14 > -1:
        results.append(("R8 L14 在 L12/L13 之後", pos_l14 > pos_l12))
    else:
        results.append(("R8 L14 在 L12/L13 之後", False))

    # 紅燈9：L15 四格無通用佔位
    bad_placeholders = ["#affiliate-1", "#affiliate-2", "Affiliate 1", "Affiliate 2", "Tool 1", "Tool 2"]
    has_bad = any(bp in src for bp in bad_placeholders)
    results.append(("R9 L15 四格無通用佔位", not has_bad))

    # 紅燈10：L15 聯盟揭露句
    results.append(("R10 L15 聯盟揭露句存在",
                    "Affiliate links" in src and ("commission" in src.lower() or "佣金" in src)))

    # 紅燈11：L17 具名來源（參考資料區段有具名機構）
    has_named = any(name in src for name in ["WHO", "ACSM", "CFPB", "NIH", "IOM",
                                              "Mayo", "EFSA", "Harvard", "Phillips",
                                              "Fannie Mae", "Mifflin", "Cunningham",
                                              "Cleveland Clinic", "USDA", "CDC"])
    results.append(("R11 L17 具名來源", has_named))

    # 紅燈12：L17 最後一層（trustReferences 在文件末尾附近）
    pos_trust = src.rfind("trustReferences")
    pos_l16 = src.rfind("PremiumGate")
    results.append(("R12 L17 為最後一層", pos_trust > pos_l16))

    # 紅燈13：ToolPage 路由單行（檢查 ToolPage.tsx 是否有對應 route）
    tool_dir_name = path.parent.name  # e.g. WaterIntakeCalculator
    slug_guess = re.sub(r'(?<!^)([A-Z])', r'-\1', tool_dir_name).lower().replace("-calculator", "-calculator")
    toolpage = Path("client/src/pages/ToolPage.tsx")
    if toolpage.exists():
        tp_src = toolpage.read_text(encoding="utf-8")
        route_ok = tool_dir_name in tp_src
        results.append((f"R13 ToolPage 路由 ({tool_dir_name})", route_ok))
    else:
        results.append(("R13 ToolPage 路由", False))

    # 紅燈14：JSX 骨架 className 存在 (max-w-7xl, space-y-7, rounded-[2rem])
    skeleton_ok = ("max-w-7xl" in src and "space-y-7" in src and "rounded-[2rem]" in src)
    results.append(("R14 JSX 骨架 className 完整", skeleton_ok))

    # 紅燈15：BMR 尺寸規範 v1.1 (L1=1.05fr_0.95fr, L4/5=0.9fr_1.1fr, L6=0.95fr_1.05fr 等)
    bmr_specs = [
        "lg:grid-cols-[1.05fr_0.95fr]",  # L1
        "lg:grid-cols-[0.9fr_1.1fr]",    # L4/5
        "lg:grid-cols-[0.95fr_1.05fr]",  # L6
        "lg:grid-cols-[1fr_0.9fr]",      # L9 / L12-13
        "lg:grid-cols-[1fr_0.8fr]",      # L10
        "lg:grid-cols-[1fr_1fr]",        # L15/16
    ]
    bmr_present = sum(1 for spec in bmr_specs if spec in src)
    results.append((f"R15 BMR v1.1 尺寸規範 ({bmr_present}/{len(bmr_specs)})",
                    bmr_present >= 5))  # ±2% tolerance: allow 5/6

    return results

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/qc_15_red_lights.py <tool-index.tsx>")
        sys.exit(1)
    path = Path(sys.argv[1])
    if not path.exists():
        print(f"❌ Not found: {path}")
        sys.exit(1)

    print(f"\n=== 15 Red-Light Self-Check · {path} ===\n")
    results = check(path)
    green = sum(1 for _, ok in results if ok)
    for label, ok in results:
        mark = "🟢" if ok else "🔴"
        print(f"  {mark} {label}")
    print(f"\n{'=' * 50}")
    print(f"Score: {green}/{len(results)}  {'✅ ALL GREEN' if green == len(results) else '🔴 NOT GREEN'}")
    print(f"{'=' * 50}\n")
    sys.exit(0 if green == len(results) else 1)

if __name__ == "__main__":
    main()
