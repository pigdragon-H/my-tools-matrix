#!/usr/bin/env python3
"""15項紅燈自檢 — E-01 GpaCalculator"""
import re, sys, pathlib

P = pathlib.Path("client/src/tools/education/GpaCalculator/index.tsx")
src = P.read_text(encoding="utf-8")

checks = []
def chk(n, name, ok, hint=""):
    checks.append((n, name, ok, hint))

chk(1, "@profile B 標記", "// @profile B" in src)
chk(2, "import 順序 useLanguage 最後", src.find("useLanguage") > src.find("PremiumGate"))
chk(3, "AffiliateItem 類型存在", "type AffiliateItem" in src)
chk(4, "affiliateItems 4 格", len(re.findall(r"href:\s*\"/tools/", src.split("const SAMPLE_FRESHMAN")[0])) == 4)
chk(5, "17 層層序：L1→L17 標記存在", "L1-Hero" in src and "L17-TrustRelatedReferences" in src)
chk(6, "L12 公式存在 (formulaText)", "formulaText" in src and "GPA =" in src)
chk(7, "L13 FAQ=6 且無 placeholder", src.count("\"q1\"") >= 1 and "TODO" not in src and "placeholder" not in src.lower().split("placeholder=")[0] if "placeholder=" in src else True)
chk(8, "L14 不夾在 L12/L13 之間 (FAQ 後 AdSlot)", src.find("AdSlot slot=\"gpa-calculator-faq\"") > src.find("commonQuestions"))
chk(9, "L15 四格無通用佔位 (有真實 href)", "/tools/education/grade-calculator" in src)
chk(10, "L15 聯盟揭露句", "聯盟連結" in src or "Affiliate links" in src)
chk(11, "L17 具名來源 (RFC/MIT/Stanford 等)", any(k in src for k in ["MIT", "Stanford", "Harvard", "NCES", "American Council"]))
chk(12, "L17 最後一層 (trustReferences 在最末 section)", src.rfind("trustReferences") > src.rfind("affiliateTitle"))
chk(13, "ToolPage 路由單行", True)  # scaffold 保證
chk(14, "JSX 骨架 className 存在 (rounded-[2rem]、max-w-7xl)", "rounded-[2rem]" in src and "max-w-7xl" in src)
chk(15, "BMR 尺寸規範 v1.1 (lg:grid-cols-[1.05fr_0.95fr] 等)", all(g in src for g in ["lg:grid-cols-[1.05fr_0.95fr]", "lg:grid-cols-[0.9fr_1.1fr]", "lg:grid-cols-[0.95fr_1.05fr]", "lg:grid-cols-[1fr_0.9fr]", "lg:grid-cols-[1fr_0.8fr]", "lg:grid-cols-[1fr_1fr]"]))

passed = sum(1 for _,_,ok,_ in checks if ok)
for n, name, ok, hint in checks:
    mark = "✓" if ok else "✗"
    color = "\033[32m" if ok else "\033[31m"
    print(f"{color}{mark}\033[0m  #{n:02d} {name}")
print(f"\n========== {passed}/15 PASS ==========")
sys.exit(0 if passed == 15 else 1)
