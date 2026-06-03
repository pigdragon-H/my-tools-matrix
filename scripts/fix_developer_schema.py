#!/usr/bin/env python3
"""
緊急修復：scaffold 產生的 4 個 developer tools schema 不符 Tool interface，
導致 /category/developer 因 tool.seoArticles.length crash 變空白。

修復內容：
- 移除 nameZh, descriptionZh, isPaid（非標準欄位）
- 改 description 用中文（與 json-formatter 一致）
- 補齊 isPremium, showAds, rateLimit, status, seoArticles
"""
import re
from pathlib import Path

CONFIG = Path("shared/toolsConfig.ts")
src = CONFIG.read_text(encoding="utf-8")

# 4 tools in zh/en metadata
tools = {
    "base64-encoder": {
        "name": "Base64 編碼器",
        "description": "瀏覽器端 Base64 編碼/解碼，支援 UTF-8 多位元組字元、URL-safe 變體與六格大小判讀矩陣；資料不上傳。",
        "icon": "Binary",
    },
    "url-encoder": {
        "name": "URL 編碼器",
        "description": "URL 百分比編碼雙向轉換，支援 component/full URI 模式、UTF-8 多位元組字元與五格膨脹比判讀矩陣；資料不上傳。",
        "icon": "Link",
    },
    "regex-tester": {
        "name": "正則表達式測試器",
        "description": "即時編譯 ECMAScript regex pattern，視覺化所有 match 與 capture group，並提供六格密度判讀矩陣；資料不上傳。",
        "icon": "Regex",
    },
    "color-converter": {
        "name": "色彩格式轉換器",
        "description": "HEX/RGB/HSL/HSV/CMYK 五種色彩格式雙向轉換，內建 WCAG 對比度與六格 hue 分區矩陣；瀏覽器端執行。",
        "icon": "Palette",
    },
}

def build_block(tid: str, info: dict) -> str:
    return (
        f'  {{\n'
        f'    id: "{tid}",\n'
        f'    name: "{info["name"]}",\n'
        f'    category: "developer",\n'
        f'    path: "/tools/developer/{tid}",\n'
        f'    icon: "{info["icon"]}",\n'
        f'    description: "{info["description"]}",\n'
        f'    isPremium: false,\n'
        f'    showAds: true,\n'
        f'    rateLimit: 30,\n'
        f'    isNew: true,\n'
        f'    isFeatured: true,\n'
        f'    status: "GOLD",\n'
        f'    seoArticles: [],\n'
        f'  }},'
    )

# Replace each broken block — match from `{ id: "<tid>"` up to and including the closing `},`
for tid, info in tools.items():
    pattern = re.compile(
        r'\{\s*\n\s*id:\s*"' + re.escape(tid) + r'"\s*,.*?\n\s*\},',
        re.DOTALL,
    )
    new_block = build_block(tid, info)
    matches = list(pattern.finditer(src))
    if not matches:
        print(f"  ✗ NOT FOUND: {tid}")
        continue
    if len(matches) > 1:
        print(f"  ⚠ MULTIPLE MATCHES for {tid}: {len(matches)}")
    src = pattern.sub(new_block, src, count=1)
    print(f"  ✓ fixed: {tid}")

CONFIG.write_text(src, encoding="utf-8")
print("\n✅ shared/toolsConfig.ts updated.")
