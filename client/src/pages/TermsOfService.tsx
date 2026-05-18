import { useEffect } from "react";
import { Link } from "wouter";

export default function TermsOfService() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "服務條款 | 工具矩陣";
  }, []);

  const lastUpdated = "2026年5月18日";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">首頁</Link>
          <span className="mx-2">/</span>
          <span>服務條款</span>
        </nav>

        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold mb-2 text-foreground">服務條款</h1>
          <p className="text-muted-foreground mb-8">最後更新日期：{lastUpdated}</p>

          <div className="bg-muted/50 border border-border rounded-lg p-4 mb-8 text-sm text-muted-foreground">
            請在使用工具矩陣服務前仔細閱讀本服務條款。使用本網站即表示您同意受本條款約束。本條款依據中華民國相關法律制定。
          </div>

          {/* 一、服務說明 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground border-b border-border pb-2">
              一、服務說明
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              工具矩陣（以下稱「本服務」）是一個提供各類線上計算工具的網路平台，涵蓋財經投資、健康生活、職場效率、開發工具等多個領域。本服務由工具矩陣團隊（以下稱「我們」）營運。
            </p>
            <p className="text-foreground/80 leading-relaxed">
              本服務提供的所有計算工具<strong>僅供參考用途</strong>，不構成專業財務、醫療、法律或其他專業建議。重要決策前請諮詢相關專業人士。
            </p>
          </section>

          {/* 二、帳號使用 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground border-b border-border pb-2">
              二、帳號使用條款
            </h2>

            <h3 className="text-lg font-medium mb-3 text-foreground">2.1 帳號建立</h3>
            <p className="text-foreground/80 leading-relaxed mb-4">
              您可透過 Manus OAuth 登入使用本服務。使用本服務即表示您聲明您已年滿 13 歲，且具備簽訂具法律效力合約的完全行為能力，或已獲得法定代理人同意。
            </p>

            <h3 className="text-lg font-medium mb-3 text-foreground">2.2 帳號安全</h3>
            <p className="text-foreground/80 leading-relaxed mb-4">
              您有責任維護帳號的安全性，包括妥善保管登入憑證。如發現帳號遭未授權使用，請立即通知我們。因您未盡保管義務所造成的損害，由您自行負責。
            </p>

            <h3 className="text-lg font-medium mb-3 text-foreground">2.3 禁止行為</h3>
            <p className="text-foreground/80 leading-relaxed mb-4">使用本服務時，您同意不得：</p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>違反任何適用的法律法規</li>
              <li>傳輸任何有害、違法、誹謗、騷擾性或侵權內容</li>
              <li>嘗試未授權存取本服務的系統或資料</li>
              <li>使用自動化工具（爬蟲、機器人等）大量存取本服務</li>
              <li>干擾或破壞本服務的正常運作</li>
              <li>冒充他人或提供虛假身份資訊</li>
              <li>從事任何可能損害本服務聲譽的行為</li>
            </ul>
          </section>

          {/* 三、免責聲明 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground border-b border-border pb-2">
              三、免責聲明與計算結果說明
            </h2>

            <h3 className="text-lg font-medium mb-3 text-foreground">3.1 計算結果僅供參考</h3>
            <p className="text-foreground/80 leading-relaxed mb-4">
              本服務提供的所有計算工具及其結果<strong>僅供一般參考用途</strong>，不構成以下任何形式的專業建議：
            </p>
            <ul className="list-disc pl-6 space-y-1 text-foreground/80 mb-4">
              <li>財務投資建議（包括股票、基金、房地產等）</li>
              <li>醫療或健康診斷建議</li>
              <li>法律建議</li>
              <li>稅務申報建議</li>
            </ul>
            <p className="text-foreground/80 leading-relaxed">
              計算結果基於您輸入的數據及公開的計算公式，實際情況可能因個人狀況、市場變化、法規修訂等因素而有所不同。
            </p>

            <h3 className="text-lg font-medium mb-3 text-foreground mt-6">3.2 服務可用性</h3>
            <p className="text-foreground/80 leading-relaxed">
              我們致力於提供穩定的服務，但不保證服務不中斷或無錯誤。我們保留隨時修改、暫停或終止服務的權利，並將盡力提前通知用戶。
            </p>

            <h3 className="text-lg font-medium mb-3 text-foreground mt-6">3.3 責任限制</h3>
            <p className="text-foreground/80 leading-relaxed">
              在法律允許的最大範圍內，我們不對因使用或無法使用本服務所造成的任何直接、間接、附帶、特殊或後果性損害負責，包括但不限於基於計算結果做出的財務決策損失。
            </p>
          </section>

          {/* 四、廣告服務 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground border-b border-border pb-2">
              四、廣告服務
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              本服務透過 <strong>Google AdSense</strong> 展示廣告以維持網站營運。廣告內容由 Google 根據您的瀏覽行為自動選擇，我們不對廣告內容負責。
            </p>
            <p className="text-foreground/80 leading-relaxed">
              點擊廣告連結後，您將離開本網站並受第三方網站的條款約束。我們不對第三方網站的內容或服務負責。
            </p>
          </section>

          {/* 五、智慧財產權 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground border-b border-border pb-2">
              五、智慧財產權
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              本服務的所有內容，包括但不限於文字、圖形、標誌、介面設計、程式碼及工具設計，均為工具矩陣或其授權方的財產，受中華民國著作權法及相關法律保護。
            </p>
            <p className="text-foreground/80 leading-relaxed mb-4">
              您可以：
            </p>
            <ul className="list-disc pl-6 space-y-1 text-foreground/80 mb-4">
              <li>個人非商業用途使用本服務的計算功能</li>
              <li>分享本服務的連結</li>
              <li>截圖計算結果供個人使用</li>
            </ul>
            <p className="text-foreground/80 leading-relaxed">
              未經書面授權，您不得複製、修改、散佈、銷售或以其他方式商業利用本服務的任何內容。
            </p>
          </section>

          {/* 六、用戶內容 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground border-b border-border pb-2">
              六、用戶內容授權
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              您在本服務中輸入的計算數據屬於您的個人資料，我們依據隱私權政策處理。若您選擇儲存計算結果，您授予我們非獨家、免授權金的權利，以提供服務所必要的方式使用該資料（如顯示您的歷史記錄）。
            </p>
          </section>

          {/* 七、終止服務 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground border-b border-border pb-2">
              七、服務終止
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              您可隨時停止使用本服務。我們保留在以下情況下暫停或終止您的帳號的權利：
            </p>
            <ul className="list-disc pl-6 space-y-1 text-foreground/80">
              <li>您違反本服務條款</li>
              <li>您的帳號涉及欺詐或非法活動</li>
              <li>您的行為對其他用戶或本服務造成損害</li>
              <li>依法律要求或政府命令</li>
            </ul>
          </section>

          {/* 八、準據法 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground border-b border-border pb-2">
              八、準據法與爭議解決
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              本服務條款依據中華民國法律解釋及執行。因本條款或本服務所生之爭議，雙方應先以友好協商方式解決。協商未果時，同意以<strong>臺灣臺北地方法院</strong>為第一審管轄法院。
            </p>
          </section>

          {/* 九、條款修訂 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground border-b border-border pb-2">
              九、條款修訂
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              我們保留隨時修訂本服務條款的權利。重大變更將在網站上公告，並更新「最後更新日期」。繼續使用本服務即表示您接受修訂後的條款。建議您定期查閱本頁面以了解最新條款。
            </p>
          </section>

          {/* 十、完整協議 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground border-b border-border pb-2">
              十、完整協議
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              本服務條款與
              <Link href="/privacy-policy" className="text-primary hover:underline mx-1">隱私權政策</Link>
              共同構成您與工具矩陣之間關於本服務的完整協議，取代任何先前的協議或理解。若本條款任何條款被認定無效或不可執行，其餘條款仍繼續有效。
            </p>
          </section>

          {/* 聯絡資訊 */}
          <section className="mb-8 bg-muted/50 border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">聯絡我們</h2>
            <p className="text-foreground/80 leading-relaxed">
              若您對本服務條款有任何疑問，請透過以下方式聯繫我們：
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
