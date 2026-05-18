import { useEffect } from "react";
import { Link } from "wouter";

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "隱私權政策 | 工具矩陣";
  }, []);

  const lastUpdated = "2026年5月18日";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">首頁</Link>
          <span className="mx-2">/</span>
          <span>隱私權政策</span>
        </nav>

        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold mb-2 text-foreground">隱私權政策</h1>
          <p className="text-muted-foreground mb-8">最後更新日期：{lastUpdated}</p>

          <div className="bg-muted/50 border border-border rounded-lg p-4 mb-8 text-sm text-muted-foreground">
            本隱私權政策依據《個人資料保護法》（民國101年10月1日施行）及相關法規制定，說明工具矩陣（以下稱「本網站」）如何收集、使用、儲存及保護您的個人資料。
          </div>

          {/* 一、資料控管者 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground border-b border-border pb-2">
              一、資料控管者資訊
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              本網站由工具矩陣團隊營運，網址為
              <a href="https://my-tools-matrix-production.up.railway.app" className="text-primary hover:underline mx-1" target="_blank" rel="noopener noreferrer">
                https://my-tools-matrix-production.up.railway.app
              </a>
              。如您對本政策有任何疑問，請透過本網站頁尾之聯絡方式與我們聯繫。
            </p>
          </section>

          {/* 二、收集的資料類型 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground border-b border-border pb-2">
              二、我們收集的資料類型
            </h2>

            <h3 className="text-lg font-medium mb-3 text-foreground">2.1 您主動提供的資料</h3>
            <p className="text-foreground/80 leading-relaxed mb-4">
              當您使用本網站的計算工具時，您可能輸入數值（如薪資、體重、投資金額等）。這些計算數值<strong>僅在您的瀏覽器本地端處理</strong>，預設情況下不會上傳至我們的伺服器。若您已登入帳號並選擇儲存計算結果，相關數據才會以加密方式儲存於我們的資料庫。
            </p>

            <h3 className="text-lg font-medium mb-3 text-foreground">2.2 帳號資料</h3>
            <p className="text-foreground/80 leading-relaxed mb-4">
              當您透過 Manus OAuth 登入時，我們會收集您的帳號識別碼（Open ID）及顯示名稱，用於識別您的身份及提供個人化服務。我們不會儲存您的密碼。
            </p>

            <h3 className="text-lg font-medium mb-3 text-foreground">2.3 自動收集的技術資料</h3>
            <p className="text-foreground/80 leading-relaxed mb-4">
              當您瀏覽本網站時，我們的伺服器會自動記錄以下資訊：
            </p>
            <ul className="list-disc pl-6 space-y-1 text-foreground/80 mb-4">
              <li>IP 位址（用於安全防護及流量分析）</li>
              <li>瀏覽器類型及版本</li>
              <li>作業系統資訊</li>
              <li>訪問頁面及時間戳記</li>
              <li>參照網址（Referrer URL）</li>
            </ul>

            <h3 className="text-lg font-medium mb-3 text-foreground">2.4 Cookie 及追蹤技術</h3>
            <p className="text-foreground/80 leading-relaxed mb-4">
              本網站使用以下類型的 Cookie：
            </p>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm border-collapse border border-border">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border px-3 py-2 text-left font-medium">類型</th>
                    <th className="border border-border px-3 py-2 text-left font-medium">用途</th>
                    <th className="border border-border px-3 py-2 text-left font-medium">保留期限</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border px-3 py-2">必要性 Cookie</td>
                    <td className="border border-border px-3 py-2">維持登入狀態、安全防護</td>
                    <td className="border border-border px-3 py-2">工作階段結束</td>
                  </tr>
                  <tr className="bg-muted/30">
                    <td className="border border-border px-3 py-2">功能性 Cookie</td>
                    <td className="border border-border px-3 py-2">記住您的偏好設定（深色模式等）</td>
                    <td className="border border-border px-3 py-2">1 年</td>
                  </tr>
                  <tr>
                    <td className="border border-border px-3 py-2">分析性 Cookie</td>
                    <td className="border border-border px-3 py-2">了解網站使用情況（匿名統計）</td>
                    <td className="border border-border px-3 py-2">2 年</td>
                  </tr>
                  <tr className="bg-muted/30">
                    <td className="border border-border px-3 py-2">廣告 Cookie</td>
                    <td className="border border-border px-3 py-2">Google AdSense 個人化廣告</td>
                    <td className="border border-border px-3 py-2">依 Google 政策</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 三、Google AdSense */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground border-b border-border pb-2">
              三、Google AdSense 廣告服務
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              本網站使用 <strong>Google AdSense</strong> 提供廣告服務。Google 可能使用 Cookie 及類似技術，根據您過去對本網站及其他網站的訪問情況，向您展示個人化廣告。
            </p>
            <p className="text-foreground/80 leading-relaxed mb-4">
              Google AdSense 的資料收集與使用方式受 Google 隱私權政策規範：
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80 mb-4">
              <li>
                <a href="https://policies.google.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                  Google 隱私權政策
                </a>
              </li>
              <li>
                <a href="https://www.google.com/settings/ads" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                  Google 廣告設定（管理個人化廣告偏好）
                </a>
              </li>
              <li>
                <a href="https://optout.aboutads.info/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                  NAI 退出工具（停用興趣型廣告）
                </a>
              </li>
            </ul>
            <p className="text-foreground/80 leading-relaxed">
              您可以在瀏覽器設定中停用 Cookie，或透過上述連結管理廣告偏好。停用廣告 Cookie 後，您仍可正常使用本網站所有工具，但廣告將不再個人化。
            </p>
          </section>

          {/* 四、資料使用目的 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground border-b border-border pb-2">
              四、資料使用目的
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              依據《個人資料保護法》第 15 條，我們基於以下特定目的收集及使用您的個人資料：
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li><strong>提供服務</strong>：識別您的身份、儲存計算歷史記錄、提供個人化功能</li>
              <li><strong>安全防護</strong>：防止未授權存取、偵測及防範惡意行為</li>
              <li><strong>服務改善</strong>：分析使用模式、優化工具功能及使用者體驗</li>
              <li><strong>廣告服務</strong>：透過 Google AdSense 展示相關廣告以維持網站營運</li>
              <li><strong>法律遵循</strong>：遵守適用的法律法規及政府機關要求</li>
            </ul>
          </section>

          {/* 五、資料分享 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground border-b border-border pb-2">
              五、資料分享與第三方
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              我們不會出售您的個人資料。我們可能在以下情況下分享您的資料：
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li><strong>服務提供商</strong>：協助我們提供服務的第三方（如雲端主機、資料庫服務），這些提供商受保密協議約束</li>
              <li><strong>Google AdSense</strong>：如第三節所述，用於廣告投放</li>
              <li><strong>法律要求</strong>：當法律、法規或政府機關要求時</li>
              <li><strong>緊急情況</strong>：為保護用戶或公眾安全所必要時</li>
            </ul>
          </section>

          {/* 六、資料保留 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground border-b border-border pb-2">
              六、資料保留期限
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              我們依據以下原則保留您的個人資料：
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li><strong>帳號資料</strong>：帳號存續期間，帳號刪除後 30 天內清除</li>
              <li><strong>計算歷史記錄</strong>：您可隨時在帳號設定中刪除</li>
              <li><strong>伺服器日誌</strong>：最多保留 90 天</li>
              <li><strong>廣告相關資料</strong>：依 Google 政策，通常為 13 個月</li>
            </ul>
          </section>

          {/* 七、您的權利 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground border-b border-border pb-2">
              七、您的個人資料權利
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              依據《個人資料保護法》第 3 條，您對自己的個人資料享有以下權利：
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80 mb-4">
              <li><strong>查詢或請求閱覽</strong>：您可要求查看我們持有的您的個人資料</li>
              <li><strong>請求製給複製本</strong>：您可要求取得您個人資料的副本</li>
              <li><strong>請求補充或更正</strong>：若您的資料有誤，您可要求更正</li>
              <li><strong>請求停止蒐集、處理或利用</strong>：在特定情況下，您可要求我們停止處理您的資料</li>
              <li><strong>請求刪除</strong>：在特定情況下，您可要求刪除您的個人資料</li>
            </ul>
            <p className="text-foreground/80 leading-relaxed">
              如需行使上述權利，請透過頁尾聯絡方式與我們聯繫。我們將在 15 個工作日內回覆您的請求。
            </p>
          </section>

          {/* 八、未成年人 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground border-b border-border pb-2">
              八、未成年人保護
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              本網站不針對 13 歲以下兒童提供服務。若我們發現不慎收集了未成年人的個人資料，將立即予以刪除。若您認為我們可能持有未成年人的資料，請立即與我們聯繫。
            </p>
          </section>

          {/* 九、安全措施 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground border-b border-border pb-2">
              九、資料安全措施
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              我們採取以下技術及組織措施保護您的個人資料：全程 HTTPS 加密傳輸、資料庫加密儲存、定期安全審查、存取權限控管，以及 JWT 身份驗證機制。儘管如此，網際網路傳輸無法保證絕對安全，請您也注意保護自己的帳號安全。
            </p>
          </section>

          {/* 十、政策更新 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground border-b border-border pb-2">
              十、政策更新
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              我們可能不定期更新本隱私權政策。重大變更時，我們將在網站上公告，並更新頁面頂部的「最後更新日期」。繼續使用本網站即表示您接受更新後的政策。
            </p>
          </section>

          {/* 聯絡資訊 */}
          <section className="mb-8 bg-muted/50 border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">聯絡我們</h2>
            <p className="text-foreground/80 leading-relaxed">
              若您對本隱私權政策有任何疑問，或需要行使您的個人資料權利，請透過以下方式聯繫我們：
            </p>
            <p className="text-foreground/80 mt-3">
              網站：<a href="https://my-tools-matrix-production.up.railway.app" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">工具矩陣</a>
            </p>
          </section>
        </article>

        {/* Back link */}
        <div className="mt-8 pt-8 border-t border-border">
          <Link href="/" className="text-primary hover:underline text-sm">
            ← 返回首頁
          </Link>
        </div>
      </div>
    </div>
  );
}
