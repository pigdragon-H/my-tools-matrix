#!/usr/bin/env python3
# Add standardized YAML frontmatter to the 8 sub-directory MANUS articles.
import re, os

BASE = "shared/articles"

# slug -> (category, description, toolId, toolPath)
META = {
    "finance/roi-vs-lump-sum": ("finance", "從報酬率、風險控制、心理壓力三個維度，深入比較定期定額與單筆投資的差異，用數據幫你選對策略。", "roi-calculator", "/tools/finance/roi-calculator"),
    "finance/roi-best-buy-point": ("finance", "存股族必看：用 ROI 計算機找出最佳買點，搭配高股息 ETF 與台股存股策略，讓報酬率翻倍。", "roi-calculator", "/tools/finance/roi-calculator"),
    "finance/car-depreciation-5-tips": ("finance", "買中古車前必做的 5 個殘值評估，教你用折舊計算避免買到「越開越虧」的車，保值不踩雷。", "car-depreciation-calculator", "/tools/finance/car-depreciation-calculator"),
    "finance/japan-vs-german-car-depreciation": ("finance", "日系 vs 德系中古車折舊率大比較，從 Toyota 保值率到 BMW 折舊，幫你選出最保值的品牌。", "car-depreciation-calculator", "/tools/finance/car-depreciation-calculator"),
    "finance/used-car-sell-best-time": ("finance", "中古車怎麼賣最划算？掌握殘值最高點的完整攻略，告訴你台灣賣車與換車的最佳時機。", "car-depreciation-calculator", "/tools/finance/car-depreciation-calculator"),
    "health/tdee-fat-loss-guide": ("health", "減脂期間怎麼吃？用 TDEE 熱量缺口框架建立科學、可持續的減脂飲食計畫，附台灣實戰指南。", "tdee-calculator", "/tools/health/tdee-calculator"),
    "health/tdee-muscle-gain-guide": ("health", "增肌飲食計畫：用 TDEE 計算每日蛋白質需求與熱量盈餘，打造理想體態的完整攻略。", "tdee-calculator", "/tools/health/tdee-calculator"),
    "health/tdee-eating-out-guide": ("health", "外食族如何控制熱量？TDEE 實戰應用指南，教你估算便當熱量、在外食中維持健康飲食。", "tdee-calculator", "/tools/health/tdee-calculator"),
}

def yaml_escape(s):
    # wrap in double quotes; escape internal double quotes
    return '"' + s.replace('"', '\\"') + '"'

for rel, (cat, desc, tool_id, tool_path) in META.items():
    path = os.path.join(BASE, rel + ".md")
    with open(path, encoding="utf-8") as fh:
        body = fh.read()
    if body.lstrip().startswith("---"):
        print("SKIP (already has frontmatter):", rel)
        continue
    slug = rel.split("/")[-1]
    # title from first H1
    m = re.search(r"^#\s+(.+)$", body, re.MULTILINE)
    title = m.group(1).strip() if m else slug
    # keywords from the 長尾關鍵字 line
    km = re.search(r"長尾關鍵字[：:]\s*(.+)", body)
    keywords = km.group(1).strip().replace("**", "") if km else ""
    fm = (
        "---\n"
        f"id: {slug}\n"
        f"title: {yaml_escape(title)}\n"
        f"description: {yaml_escape(desc)}\n"
        f"keywords: {yaml_escape(keywords)}\n"
        f"category: {cat}\n"
        "publishedAt: 2026-05-17\n"
        f"toolId: {tool_id}\n"
        f"toolPath: {tool_path}\n"
        "---\n\n"
    )
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(fm + body)
    print("OK:", rel, "->", title[:30])

print("\nDone. 8 articles standardized.")
