#!/usr/bin/env python3
"""批次替換 7 個衍生工具的 L10 placeholder · 一勞永逸版"""
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent.parent

# 統一替換規則
TOOLS = [
    ("client/src/tools/health/BmrCalculator/index.tsx",      "BMR"),
    ("client/src/tools/health/TdeeCalculator/index.tsx",     "TDEE"),
    ("client/src/tools/finance/LoanCalculator/index.tsx",    "Loan"),
    ("client/src/tools/finance/CompoundInterestCalculator/index.tsx", "Compound"),
    ("client/src/tools/finance/RetirementCalculator/index.tsx", "Retirement"),
    ("client/src/tools/finance/CagrCalculator/index.tsx",    "CAGR"),
    ("client/src/tools/finance/SavingsGoalCalculator/index.tsx", "Savings"),
]

# 中英文 i18n key 替換 (每個工具都有 saveSharePlaceholder 中英兩條)
ZH_OLD = '    saveSharePlaceholder: "儲存／分享卡片預留位",'
ZH_NEW = '    nextActionLabel: "下一步行動",\n    nextActionTitle: "把計算結果變成可執行的下一步",\n    nextActionItem1: "把這個結果連結存到記事本或書籤",\n    nextActionItem2: "把試算數字寫進你的月度規劃",\n    nextActionItem3: "下個月回來重算，看數字有沒有改善",\n    shareLinkBtn: "📋 複製結果連結",\n    shareNativeBtn: "📤 分享給朋友",\n    shareCopiedToast: "已複製到剪貼簿 ✓",'

# 英文版有不同字串
EN_VARIANTS = [
    'saveSharePlaceholder: "Save / Share card placeholder",',
    'saveSharePlaceholder: "Save/Share card placeholder",',
    'saveSharePlaceholder: "Save / share card placeholder",',
    'saveSharePlaceholder: "Save/share card placeholder",',
]
EN_NEW = '''nextActionLabel: "Next actions",
    nextActionTitle: "Turn this number into your next concrete step",
    nextActionItem1: "Save this result link to your notes or bookmarks",
    nextActionItem2: "Write the numbers into your monthly plan",
    nextActionItem3: "Come back next month and recalculate to see progress",
    shareLinkBtn: "📋 Copy result link",
    shareNativeBtn: "📤 Share with friends",
    shareCopiedToast: "Copied to clipboard ✓",'''

# JSX 區塊替換 (右欄 article 整段)
JSX_OLD = '''            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-center text-sm font-black text-slate-500">
              {/* journey placeholder · 預留下一階段卡片 */}
              {t.saveSharePlaceholder}
            </article>'''

JSX_NEW = '''            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p>
              <h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3>
              <ul className="mt-3 space-y-2">
                <li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li>
                <li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li>
                <li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li>
              </ul>
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button type="button" onClick={() => { if (typeof navigator !== "undefined" && navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white hover:bg-slate-800">{t.shareLinkBtn}</button>
                <button type="button" onClick={() => { const sd = { title: document.title, url: window.location.href }; const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) { nav.share(sd).catch(() => {}); } else if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700 hover:bg-slate-50">{t.shareNativeBtn}</button>
              </div>
            </article>'''


def fix_tool(path_rel: str, name: str) -> bool:
    p = ROOT / path_rel
    text = p.read_text(encoding="utf-8")
    orig = text

    # 1. ZH key
    if ZH_OLD in text:
        text = text.replace(ZH_OLD, ZH_NEW, 1)
    else:
        print(f"  ⚠ {name}: ZH_OLD not found")

    # 2. EN key (try variants)
    en_done = False
    for v in EN_VARIANTS:
        if v in text:
            text = text.replace(v, EN_NEW, 1)
            en_done = True
            break
    if not en_done:
        # 嘗試 trailing 逗號版
        for v in [x.rstrip(",") for x in EN_VARIANTS]:
            if v + "," in text:
                text = text.replace(v + ",", EN_NEW, 1)
                en_done = True
                break
    if not en_done:
        print(f"  ⚠ {name}: EN saveSharePlaceholder not found")

    # 3. JSX block
    if JSX_OLD in text:
        text = text.replace(JSX_OLD, JSX_NEW, 1)
    else:
        print(f"  ⚠ {name}: JSX_OLD not found, will need manual fix")
        return False

    if text == orig:
        print(f"  ❌ {name}: no change applied")
        return False

    p.write_text(text, encoding="utf-8")
    print(f"  ✅ {name}: updated")
    return True


def main():
    target = sys.argv[1] if len(sys.argv) > 1 else None
    for path_rel, name in TOOLS:
        if target and target.lower() not in name.lower():
            continue
        print(f"\n=== {name} ===")
        fix_tool(path_rel, name)


if __name__ == "__main__":
    main()
