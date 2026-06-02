from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
component = root / "client/src/tools/finance/RoasCalculator/index.tsx"
route = root / "client/src/pages/ToolPage.tsx"
config = root / "shared/toolsConfig.ts"
text = component.read_text()
route_text = route.read_text()
config_text = config.read_text()
checks = []
def check(name, ok, detail=""):
    checks.append((name, bool(ok), detail))

check("profile_B", "// @profile B" in text)
check("import_order", 'import { useMemo, useState } from "react";' in text and text.index('import { useMemo, useState } from "react";') < text.index('import { AdSenseWrapper } from "@/components/AdSenseWrapper";'))
check("affiliate_type", "type AffiliateItem = { label: LocalText; href: string };" in text)
match = re.search(r"const affiliateItems: AffiliateItem\[\] = \[(.*?)\];", text, re.S)
check("affiliate_4", bool(match) and match.group(1).count("href:") == 4, f"href_count={match.group(1).count('href:') if match else 'missing'}")
for i in range(1, 18):
    check(f"L{i}_marker", f"L{i}-" in text)
check("L12_formula", "廣告投報率 = 廣告歸因收入 ÷ 廣告花費" in text and "扣除廣告後投資回報率 =（收入 − 銷貨成本 − 廣告花費）÷ 廣告花費" in text and "每單取得成本 = 廣告花費 ÷ 訂單數" in text)
check("FAQ_6_keys", 'const faqKeys = [["q1", "a1"], ["q2", "a2"], ["q3", "a3"], ["q4", "a4"], ["q5", "a5"], ["q6", "a6"]] as const;' in text)
check("FAQ_6_render", "faqKeys.map" in text and "t[q]" in text and "t[a]" in text)
check("L8_ad", 'AdSenseWrapper showAds={true} adSlot="roas-result-intelligence"' in text)
check("L14_ad", 'AdSlot slot="roas-faq" position="inline"' in text)
check("affiliate_disclosure", "推薦連結揭露" in text)
check("L17_last", text.rfind("L17-TrustRelatedReferences") > text.rfind("L16-PremiumGate") > text.rfind("L15-AffiliateResources"))
check("route", '"finance/roas-calculator": lazy(() => import("@/tools/finance/RoasCalculator"))' in route_text)
check("config_array", 'id: "roas-calculator"' in config_text and 'path: "/tools/finance/roas-calculator"' in config_text and 'name: "廣告投報率計算機"' in config_text)
check("config_export", 'export const roasCalculator' in config_text)
check("core_formula", "roas=spend>0?revenue/spend:0" in text and "profitAfterAds=revenue-cost-spend" in text and "breakEvenRoas=contributionMargin>0?1/contributionMargin:0" in text)
check("default_values", 'useState("3000")' in text and 'useState("12000")' in text and 'useState("5000")' in text and 'useState("120")' in text)
residual_terms = ["Pomodoro Technique", "focus cycles", "25/5", "shortBreak", "longBreak", "totalFocus", "focusRatio", "pomodoro-result", "pomodoro-faq"]
found = [term for term in residual_terms if term in text]
check("no_pomodoro_residual_terms", not found, ", ".join(found))
failed = [(n, d) for n, ok, d in checks if not ok]
for n, ok, d in checks:
    print(f"{n}: {'PASS' if ok else 'FAIL'}" + (f" ({d})" if d else ""))
if failed:
    raise SystemExit(1)
print("QC_RESULT: PASS")
