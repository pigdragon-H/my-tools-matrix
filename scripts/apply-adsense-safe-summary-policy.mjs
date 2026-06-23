import fs from "fs";

const file = "client/src/pages/ToolPage.tsx";
let s = fs.readFileSync(file, "utf8");

const zhPolicy = `policy: \`${'${'}
            toolConfig.showAds
              ? "本工具頁允許在內容區顯示 Google AdSense 或等效廣告版位，並以不遮擋主要工具輸入與結果為原則。"
              : "本工具頁目前不啟用廣告版位；若未來啟用，仍會維持主要工具內容可讀與可操作。"
          } 本頁可能包含站內推薦或聯盟連結；若透過部分連結購買，我們可能獲得佣金。${'${'}
            toolConfig.isPremium
              ? "此工具包含 Premium 功能或進階內容入口，基礎摘要與主要說明仍保留為可讀文字。"
              : "此工具目前可免費使用；頁面仍保留 Premium 升級與延伸內容的靜態說明位置。"
          }\`,`;
const zhSafe = `policy: "本工具提供一般資訊與估算輔助，計算結果會受輸入值、假設條件與資料更新影響。財務、健康或法律相關結果不應視為專業建議；做出重大決策前，請依實際情況查核來源並諮詢合格專業人士。",`;

const enPolicy = `policy: \`${'${'}
            toolConfig.showAds
              ? "This tool page may display Google AdSense or equivalent advertising placements in the content area, without covering the main inputs or results."
              : "This tool page does not currently enable advertising placements; if ads are enabled later, the main tool content will remain readable and usable."
          } This page may include internal recommendations or affiliate links; we may earn a commission from qualifying purchases made through some links. ${'${'}
            toolConfig.isPremium
              ? "This tool includes Premium features or advanced content entry points, while the core summary and main explanation remain readable text."
              : "This tool is currently free to use; the page still reserves static explanatory space for Premium upgrades and extended content."
          }\`,`;
const enSafe = `policy: "This tool provides general information and estimate support. Results can vary based on input values, assumptions, and source updates. Finance, health, or legal outputs should not be treated as professional advice; verify the source context and consult a qualified professional before making significant decisions.",`;

for (const [from, to] of [[zhPolicy, zhSafe], [enPolicy, enSafe]]) {
  if (!s.includes(from)) {
    throw new Error(`Expected policy block not found: ${from.slice(0, 80)}`);
  }
  s = s.replace(from, to);
}

fs.writeFileSync(file, s, "utf8");
console.log("ToolPage summary policy made AdSense-safe");
