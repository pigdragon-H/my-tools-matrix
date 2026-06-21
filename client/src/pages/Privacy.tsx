import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { defaultSeo, setSeoMeta } from "@/lib/seo";
import { TrustStrip } from "@/components/business/TrustStrip";

export default function Privacy() {
  const { lang } = useLanguage();
  const lastUpdated = "2026-06-10";
  const contactEmail = "pigragonh@gmail.com";

  useEffect(() => {
    setSeoMeta({
      ...defaultSeo,
      title: lang === "zh" ? "隱私政策｜Formula Universe" : "Privacy Policy | Formula Universe",
      description:
        lang === "zh"
          ? "Formula Universe 隱私政策：說明瀏覽器端工具、Cookie、Google AdSense、聯盟連結、Premium 與隱私請求處理方式。"
          : "Formula Universe privacy policy covering browser-side tools, cookies, Google AdSense, affiliate links, Premium access, and privacy requests.",
    });
  }, [lang]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <section className="border-b border-blue-200/70 bg-[linear-gradient(135deg,#eff6ff_0%,#f5f3ff_48%,#ecfeff_100%)] dark:border-blue-950/60 dark:bg-slate-950">
        <div className="container py-14 md:py-20">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700 dark:text-blue-300">
            {lang === "zh" ? "法律與隱私" : "Legal & Privacy"}
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900 dark:text-white md:text-5xl">
            {lang === "zh" ? "隱私政策" : "Privacy Policy"}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
            {lang === "zh"
              ? "本政策說明 Formula Universe 如何處理使用者資料、Cookie、廣告、聯盟連結與 Premium 服務資訊。多數工具在瀏覽器端執行，使用者輸入的計算資料預設不會傳送到我們的伺服器。"
              : "This policy explains how Formula Universe handles user data, cookies, advertising, affiliate links, and Premium service information. Most tools run in the browser, and calculation inputs are not sent to our servers by default."}
          </p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {lang === "zh" ? `最後更新：${lastUpdated}` : `Last updated: ${lastUpdated}`}
          </p>
        </div>
      </section>

      <section className="container py-14 md:py-20">
        <article className="prose prose-slate max-w-4xl dark:prose-invert">
          <h2>{lang === "zh" ? "1. 我們收集的資料" : "1. Information we collect"}</h2>
          <p>{lang === "zh" ? "Formula Universe 提供計算器、轉換器與知識型工具。大多數工具的輸入、計算與結果都在您的瀏覽器中完成；除非某項功能明確標示需要帳號、同步、付款或伺服器處理，否則我們不會主動接收您在工具欄位中輸入的數值、文字或檔案內容。" : "Formula Universe provides calculators, converters, and knowledge tools. Most inputs, calculations, and outputs are processed in your browser. Unless a feature clearly requires an account, sync, payment, or server processing, we do not intentionally receive values, text, or files entered into tool fields."}</p>
          <p>{lang === "zh" ? "我們可能收集基本技術與使用資料，例如瀏覽頁面、裝置類型、瀏覽器、語言偏好、粗略地區、錯誤紀錄與安全事件。這些資料用於維護服務、改善內容、偵測濫用與了解哪些工具需要優先修正。" : "We may collect basic technical and usage data such as pages visited, device type, browser, language preference, approximate region, error logs, and security events. This information is used to maintain the service, improve content, detect abuse, and prioritize tool fixes."}</p>

          <h2>{lang === "zh" ? "2. Cookie、分析與廣告" : "2. Cookies, analytics, and advertising"}</h2>
          <p>{lang === "zh" ? "本網站可能使用 Cookie、本機儲存或類似技術保存語言、主題、偏好設定、流量分析與廣告投放狀態。您可以透過瀏覽器設定封鎖或刪除 Cookie，但部分偏好設定或廣告相關功能可能因此無法正常運作。" : "This site may use cookies, local storage, or similar technologies for language, theme, preferences, analytics, and advertising state. You can block or delete cookies through your browser settings, but some preferences or ad-related features may not work normally."}</p>
          <p>{lang === "zh" ? "我們可能使用 Google Analytics、Google Search Console、Google AdSense 或同等服務。第三方服務可能依其政策處理 Cookie、廣告識別碼、IP 位址、裝置資訊與互動資料。Google 如何使用資料，請參考 Google 的公開政策與廣告設定頁。" : "We may use Google Analytics, Google Search Console, Google AdSense, or equivalent services. Third-party services may process cookies, ad identifiers, IP addresses, device information, and interaction data according to their own policies. For Google's use of data, review Google's public policies and ad settings."}</p>
          <p>
            {lang === "zh"
              ? "Google 等第三方廠商會使用 Cookie，根據您先前造訪本網站或其他網站的紀錄向您放送廣告（包含個人化廣告）。您可以隨時透過下列方式停用個人化廣告或管理廣告偏好："
              : "Third-party vendors, including Google, use cookies to serve ads (including personalized ads) based on your prior visits to this website or other websites. You can opt out of personalized advertising or manage your ad preferences at any time through the following options:"}
          </p>
          <ul>
            <li>
              {lang === "zh" ? "前往 " : "Visit "}
              <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer nofollow">
                Google 廣告設定（Google Ads Settings）
              </a>
              {lang === "zh"
                ? " 停用 Google 個人化廣告。"
                : " to opt out of Google personalized advertising."}
            </li>
            <li>
              {lang === "zh" ? "前往 " : "Visit "}
              <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer nofollow">
                www.aboutads.info
              </a>
              {lang === "zh"
                ? " 退出部分第三方廠商的個人化廣告（適用於參與的 NAI／DAA 廠商）。"
                : " to opt out of some third-party vendors' use of cookies for personalized advertising (participating NAI/DAA vendors)."}
            </li>
            <li>
              {lang === "zh"
                ? "Google 第三方廠商與廣告聯播網清單，請參考 "
                : "For Google's list of third-party vendors and ad networks, see "}
              <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer nofollow">
                {lang === "zh" ? "Google 合作夥伴網站政策" : "Google's partner sites policy"}
              </a>
              {lang === "zh" ? "。" : "."}
            </li>
          </ul>
          <p>
            {lang === "zh"
              ? "若您停用個人化廣告，您仍可能看到廣告，但這些廣告將不再依您的興趣個人化。"
              : "If you opt out of personalized advertising, you may still see ads, but they will no longer be personalized based on your interests."}
          </p>

          <h2>{lang === "zh" ? "3. 聯盟連結與 Premium" : "3. Affiliate links and Premium"}</h2>
          <p>{lang === "zh" ? "部分頁面可能包含站內推薦、聯盟連結或商業合作連結。若您透過部分連結購買產品或服務，我們可能獲得佣金，這不會增加您的購買成本，也不會改變我們對公式、工具限制或風險提示的揭露義務。" : "Some pages may include on-site recommendations, affiliate links, or commercial partner links. If you purchase through certain links, we may earn a commission. This does not increase your cost and does not change our obligation to disclose formula limits, tool limitations, or risk notices."}</p>
          <p>{lang === "zh" ? "若未來提供 Premium、會員、付款或訂閱功能，必要的帳務資料可能由第三方付款服務處理。我們只會保留履約、客服、稅務、安全與法規所需的最少資料。" : "If Premium, membership, payment, or subscription features are offered, required billing data may be processed by third-party payment providers. We retain only the minimum information needed for fulfillment, support, tax, security, and legal compliance."}</p>

          <h2>{lang === "zh" ? "4. 資料分享與保留" : "4. Sharing and retention"}</h2>
          <p>{lang === "zh" ? "我們不會出售個人資料。資料可能在必要範圍內提供給託管、分析、廣告、付款、安全、客服或法令遵循服務供應商。若法律要求、保護使用者安全、調查濫用或維護權利時，我們也可能揭露必要資料。" : "We do not sell personal data. Information may be shared with hosting, analytics, advertising, payment, security, support, or compliance providers as needed. We may also disclose necessary information when required by law, to protect users, investigate abuse, or defend rights."}</p>
          <p>{lang === "zh" ? "匿名或彙總統計資料可能被長期保存。可識別資料只會在提供服務、處理請求、符合法律義務或安全需求所需期間保存。" : "Anonymous or aggregated statistics may be retained long term. Identifiable data is kept only as long as needed to provide the service, process requests, comply with legal obligations, or meet security needs."}</p>

          <h2>{lang === "zh" ? "5. 您的權利與選擇" : "5. Your rights and choices"}</h2>
          <p>{lang === "zh" ? "您可以要求查詢、更正、刪除或限制我們持有的可識別資料，也可以要求說明資料來源與用途。若您希望提出隱私請求，請寄信至下方信箱，並在主旨標註 Privacy Request。" : "You may request access, correction, deletion, or restriction of identifiable information we hold, and you may ask us to explain the source and purpose of that information. To submit a privacy request, email us and include Privacy Request in the subject."}</p>

          <h2>{lang === "zh" ? "6. 兒童與敏感資訊" : "6. Children and sensitive information"}</h2>
          <p>{lang === "zh" ? "本網站不以 13 歲以下兒童為主要對象，也不主動要求健康病歷、金融帳號、政府證件、精確定位或其他敏感資料。請不要在一般回饋或工具欄位中提供不必要的敏感資訊。" : "This site is not directed to children under 13 and does not intentionally request medical records, financial account numbers, government IDs, precise location, or other sensitive information. Do not provide unnecessary sensitive information in general feedback or tool fields."}</p>

          <h2>{lang === "zh" ? "7. 聯絡方式" : "7. Contact"}</h2>
          <p>{lang === "zh" ? `隱私、資料、Cookie、刪除請求或政策問題請寄至 ${contactEmail}。我們會盡力在 7 個工作日內回覆；複雜請求可能需要更多時間，我們會先確認收到。` : `For privacy, data, cookie, deletion, or policy questions, email ${contactEmail}. We aim to respond within 7 business days; complex requests may take longer, and we will acknowledge receipt first.`}</p>

          <h2>{lang === "zh" ? "8. 政策更新" : "8. Policy updates"}</h2>
          <p>{lang === "zh" ? "我們可能因功能、第三方服務、法規或營運需求調整本政策。重大變更會更新本頁日期；繼續使用本網站代表您已閱讀更新後的政策。" : "We may update this policy due to feature, third-party service, legal, or operational changes. Material changes will update the date on this page; continued use means you have reviewed the updated policy."}</p>
        </article>

        <div className="mt-10">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:underline dark:text-blue-300">
            <ArrowLeft className="h-4 w-4" />
            {lang === "zh" ? "回首頁" : "Back to home"}
          </Link>
        </div>
      </section>
      <TrustStrip lang={lang} variant="compact" />
    </div>
  );
}
