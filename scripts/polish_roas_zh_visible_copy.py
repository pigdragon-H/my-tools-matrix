from pathlib import Path

p = Path('client/src/tools/finance/RoasCalculator/index.tsx')
text = p.read_text()
repls = {
    'q1: "ROAS 和 ROI 差在哪裡？", a1: "ROAS 是廣告收入除以廣告花費，只看投放效率；ROI 會把 COGS 等成本納入，更接近獲利回報。"': 'q1: "廣告投報率和扣除廣告後投資回報率差在哪裡？", a1: "廣告投報率是廣告收入除以廣告花費，只看投放效率；扣除廣告後投資回報率會把銷貨成本等成本納入，更接近獲利回報。"',
    'q2: "ROAS 越高一定越好嗎？", a2: "不一定。高 ROAS 可能來自小規模或低成長投放，仍需搭配訂單量、毛利率、現金流與可擴張性判斷。"': 'q2: "廣告投報率越高一定越好嗎？", a2: "不一定。高投報率可能來自小規模或低成長投放，仍需搭配訂單量、毛利率、現金流與可擴張性判斷。"',
    'q3: "損益兩平 ROAS 怎麼解讀？", a3: "損益兩平 ROAS 代表在目前商品成本率下，廣告至少需要達到的收入倍數；低於此數值可能侵蝕毛利。"': 'q3: "損益兩平廣告投報率怎麼解讀？", a3: "損益兩平廣告投報率代表在目前商品成本率下，廣告至少需要達到的收入倍數；低於此數值可能侵蝕毛利。"',
    'q4: "每單取得成本 和 AOV 為什麼重要？", a4: "每單取得成本 顯示取得一筆訂單的廣告成本，AOV 顯示平均訂單收入；兩者能幫助判斷是否應調整客單價或投放成本。"': 'q4: "每單取得成本和平均訂單金額為什麼重要？", a4: "每單取得成本顯示取得一筆訂單的廣告成本，平均訂單金額顯示每筆訂單收入；兩者能幫助判斷是否應調整客單價或投放成本。"',
    'q5: "可以用總營收而非廣告營收嗎？", a5: "最好使用可歸因於廣告的收入，否則 ROAS 可能高估。若歸因不完整，請把結果視為方向性估算。"': 'q5: "可以用總營收而非廣告營收嗎？", a5: "最好使用可歸因於廣告的收入，否則廣告投報率可能高估。若歸因不完整，請把結果視為方向性估算。"',
    'q6: "這能取代廣告平台報表嗎？", a6: "不能。這是教育估算工具；正式投放決策仍需搭配廣告平台、CRM、會計資料與專業行銷分析。"': 'q6: "這能取代廣告平台報表嗎？", a6: "不能。這是教育估算工具；正式投放決策仍需搭配廣告平台、客戶關係管理資料、會計資料與專業行銷分析。"',
    '<div className="text-xs font-bold uppercase text-amber-100">ROAS</div>': '<div className="text-xs font-bold text-amber-100">投報倍數</div>',
    '<button type="button" onClick={()=>setLang(lang==="zh"?"en":"zh")} className="rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-black">中 EN</button>': '<button type="button" onClick={()=>setLang(lang==="zh"?"en":"zh")} className="rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-black">中文模式</button>',
    'L7 依廣告投報倍數使用固定六格判讀；這是投放規劃參考，不保證實際獲利。': '本區依廣告投報倍數使用固定六格判讀；這是投放規劃參考，不保證實際獲利。',
    '<li>Use Profit Margin 計算機 before scaling spend.</li><li>Use Budget Ratio 計算機 for cash allocation.</li><li>Use Net Worth 計算機 for owner-level planning.</li>': '<li>擴大投放前，先使用利潤率計算機確認毛利空間。</li><li>分配現金預算時，可搭配預算比例計算機。</li><li>進行業主層級規劃時，可搭配淨資產計算機。</li>',
    'Google Ads 廣告投報率說明；Meta 廣告報表說明；Shopify 行銷指標；哈佛商業評論客戶取得分析。': 'Google 廣告投報率說明；Meta 廣告報表說明；Shopify 行銷指標；哈佛商業評論客戶取得分析。',
}
for old, new in repls.items():
    if old not in text:
        print(f'MISSING: {old[:80]}')
    text = text.replace(old, new)
p.write_text(text)
print('done')
