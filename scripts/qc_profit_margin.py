from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
component = root / "client/src/tools/finance/ProfitMarginCalculator/index.tsx"
route = root / "client/src/pages/ToolPage.tsx"
config = root / "shared/toolsConfig.ts"
text = component.read_text()
route_text = route.read_text()
config_text = config.read_text()

checks = []
def check(name, ok, detail=""):
    checks.append((name, bool(ok), detail))

check("profile_B", "// @profile B" in text)
check("import_order", 'import { useMemo, useState } from "react";' in text and 'import { AdSenseWrapper } from "@/components/AdSenseWrapper";' in text and text.index('import { useMemo, useState } from "react";') < text.index('import { AdSenseWrapper } from "@/components/AdSenseWrapper";'))
check("affiliate_type", "type AffiliateItem = { label: LocalText; href: string };" in text)
match = re.search(r"const affiliateItems: AffiliateItem\[\] = \[(.*?)\];", text, re.S)
check("affiliate_4", bool(match) and match.group(1).count("href:") == 4, f"href_count={match.group(1).count('href:') if match else 'missing'}")
for i in range(1, 18):
    check(f"L{i}_marker", f"L{i}-" in text)
check("L12_formula", "毛利率 =（營收 − 銷貨成本）÷ 營收" in text and "淨利率 =（營收 − 銷貨成本 − 營業費用）÷ 營收" in text and "加價率 = 毛利 ÷ 銷貨成本" in text)
check("FAQ_6_keys", 'const faqKeys = [["q1", "a1"], ["q2", "a2"], ["q3", "a3"], ["q4", "a4"], ["q5", "a5"], ["q6", "a6"]] as const;' in text)
check("FAQ_6_render", "faqKeys.map" in text and "t[q]" in text and "t[a]" in text)
check("L8_ad", 'AdSenseWrapper showAds={true} adSlot="profitmargin-result-intelligence"' in text)
check("L14_ad", 'AdSlot slot="profitmargin-faq" position="inline"' in text)
check("affiliate_disclosure", "affiliate" in text.lower() and ("disclosure" in text.lower() or "揭露" in text))
check("L17_last", text.rfind("L17-TrustRelatedReferences") > text.rfind("L16-PremiumGate") > text.rfind("L15-AffiliateResources"))
check("route", '"finance/profit-margin-calculator": lazy(() => import("@/tools/finance/ProfitMarginCalculator"))' in route_text)
check("config_array", 'id: "profit-margin-calculator"' in config_text and 'path: "/tools/finance/profit-margin-calculator"' in config_text and 'name: "利潤率計算機"' in config_text)
check("config_export", 'export const profitMarginCalculator' in config_text)
check("core_formula", "grossProfit=r-c" in text and "netProfit=r-c-o" in text and "breakEvenUnits=pr>0?Math.ceil((c+o)/pr):0" in text)
check("default_values", 'useState("100000")' in text and 'useState("45000")' in text and 'useState("25000")' in text and 'useState("100")' in text)

residual_terms = [
    "Pomodoro Technique", "focus cycles", "deep work", "25/5", "shortBreak", "longBreak", "totalFocus", "focusRatio", "cycles", "pomodoro-result", "pomodoro-faq"
]
found = [term for term in residual_terms if term in text]
check("no_pomodoro_residual_terms", not found, ", ".join(found))

failed = [(n, d) for n, ok, d in checks if not ok]
for n, ok, d in checks:
    print(f"{n}: {'PASS' if ok else 'FAIL'}" + (f" ({d})" if d else ""))

if failed:
    raise SystemExit(1)
print("QC_RESULT: PASS")
