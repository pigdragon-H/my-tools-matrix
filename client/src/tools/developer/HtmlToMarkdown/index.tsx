// @profile B
// Profile B · 計算機-YMYL · HtmlToMarkdown (Developer GOLD · JsonFormatter-aligned, 17-layer)

import { Fragment, useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
const l = (v: LocalText, lang: Lang) => v[lang];

function htmlToMarkdown(html: string): string {
  let s = html;
  // normalise newlines
  s = s.replace(/\r\n/g, "\n");
  // strip script/style
  s = s.replace(/<script[\s\S]*?<\/script>/gi, "");
  s = s.replace(/<style[\s\S]*?<\/style>/gi, "");
  // headings
  for (let i = 6; i >= 1; i--) {
    const re = new RegExp(`<h${i}[^>]*>([\\s\\S]*?)<\\/h${i}>`, "gi");
    s = s.replace(re, (_m, inner) => `\n${"#".repeat(i)} ${inner.trim()}\n`);
  }
  // bold / italic
  s = s.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, (_m, _t, inner) => `**${inner.trim()}**`);
  s = s.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, (_m, _t, inner) => `*${inner.trim()}*`);
  // links
  s = s.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi, (_m, href, inner) => `[${inner.trim()}](${href})`);
  // images
  s = s.replace(/<img[^>]*alt=["']([^"']*)["'][^>]*src=["']([^"']*)["'][^>]*>/gi, (_m, alt, src) => `![${alt}](${src})`);
  s = s.replace(/<img[^>]*src=["']([^"']*)["'][^>]*>/gi, (_m, src) => `![](${src})`);
  // inline code
  s = s.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_m, inner) => `\`${inner.trim()}\``);
  // pre / code block
  s = s.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_m, inner) => `\n\`\`\`\n${inner.replace(/<[^>]+>/g, "").trim()}\n\`\`\`\n`);
  // blockquote
  s = s.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_m, inner) => `\n> ${inner.replace(/<[^>]+>/g, "").trim()}\n`);
  // unordered list items
  s = s.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_m, inner) => `- ${inner.replace(/<[^>]+>/g, "").trim()}\n`);
  s = s.replace(/<\/?(ul|ol)[^>]*>/gi, "\n");
  // horizontal rule
  s = s.replace(/<hr[^>]*>/gi, "\n---\n");
  // paragraphs & breaks
  s = s.replace(/<\/p>/gi, "\n\n");
  s = s.replace(/<p[^>]*>/gi, "");
  s = s.replace(/<br\s*\/?>/gi, "\n");
  // strip remaining tags
  s = s.replace(/<[^>]+>/g, "");
  // decode common entities
  const ent: Record<string, string> = { "&nbsp;": " ", "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'" };
  s = s.replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;/gi, (m) => ent[m.toLowerCase()] ?? m);
  // collapse > 2 blank lines
  s = s.replace(/\n{3,}/g, "\n\n");
  return s.trim();
}

export default function HtmlToMarkdown() {
  const { lang, setLang } = useLanguage();
  const [input, setInput] = useState<string>(
    '<h1>Hello</h1>\n<p>This is <strong>bold</strong> and <a href="https://example.com">a link</a>.</p>\n<ul>\n  <li>Item one</li>\n  <li>Item two</li>\n</ul>'
  );

  const output = useMemo(() => htmlToMarkdown(input), [input]);
  const stats = useMemo(() => {
    const lines = output.split("\n").length;
    const headings = (output.match(/^#{1,6}\s/gm) || []).length;
    const links = (output.match(/\[[^\]]*\]\([^)]*\)/g) || []).length;
    const bullets = (output.match(/^- /gm) || []).length;
    return { lines, headings, links, bullets, chars: output.length };
  }, [output]);

  const t = {
    zh: {
      hero: "HTML 轉 Markdown 轉換器",
      heroSub: "把 HTML 原始碼即時轉成乾淨的 Markdown，支援標題、粗體、連結、清單、程式碼區塊與圖片。",
      trust: "為什麼用這個轉換器",
      trustText: "純前端執行，貼上的 HTML 不會上傳任何伺服器；轉出的 Markdown 直接可貼進 GitHub、Notion、部落格與文件系統。",
      quick: "三步驟",
      step1: "貼上 HTML 原始碼",
      step2: "即時看到 Markdown 輸出",
      step3: "複製貼到你的編輯器",
      inputGuide: "輸入指引",
      inputGuideText: "支援 h1–h6、strong/b、em/i、a、img、code、pre、blockquote、ul/ol/li、hr、p、br 與常見 HTML 實體。",
      inputLabel: "HTML 原始碼",
      resultTitle: "Markdown 輸出",
      copy: "複製 Markdown",
      intel: "結果解讀",
      lines: "行數", headings: "標題數", links: "連結數", bullets: "清單項", chars: "字元數",
      scenario: "情境對照",
      scA: "搬部落格", scADesc: "把 WordPress / Medium 匯出的 HTML 轉成 Markdown，搬進 Hugo、Astro、Jekyll。",
      scB: "整理筆記", scBDesc: "網頁複製的 HTML 片段轉成 Notion / Obsidian 可讀的 Markdown。",
      scC: "寫文件", scCDesc: "把後台 RTE 產出的 HTML 轉成 README / Wiki 用的 Markdown。",
      emotionUp: "省下手動清標籤的時間",
      emotionUpText: "再也不用一個一個刪 <div>、<span>、style 屬性，貼上即得乾淨 Markdown。",
      emotionLow: "保留你想要的結構",
      emotionLowText: "標題層級、清單、連結與程式碼區塊都被正確保留，輸出可直接 commit。",
      decision: "怎麼選",
      decisionText: "要長期維護的內容用 Markdown 存版控；一次性貼文可直接複製輸出。",
      knowledge: "知識卡",
      knowledgeText: "Markdown 是輕量標記語言，用純文字符號表達格式；GitHub、Reddit、Discord、Notion 都原生支援，比 HTML 更易讀、更利於版本控制 diff。",
      faq: "常見問題",
      faqAd: "常見問題後廣告位",
      affiliate: "延伸工具",
      affiliateTitle: "寫作與發佈相關資源",
      premiumTitle: "Pro：批次與進階轉換",
      premiumText: "升級 Pro 可批次轉換多檔、自訂清單符號、表格轉換與 frontmatter 注入。",
      refs: "資料來源",
    },
    en: {
      hero: "HTML to Markdown Converter",
      heroSub: "Instantly turn HTML source into clean Markdown — headings, bold, links, lists, code blocks and images supported.",
      trust: "Why use this converter",
      trustText: "Runs fully in your browser; pasted HTML never leaves your device. The Markdown output pastes straight into GitHub, Notion, blogs and docs.",
      quick: "Three steps",
      step1: "Paste your HTML source",
      step2: "See the Markdown instantly",
      step3: "Copy into your editor",
      inputGuide: "Input guide",
      inputGuideText: "Supports h1–h6, strong/b, em/i, a, img, code, pre, blockquote, ul/ol/li, hr, p, br and common HTML entities.",
      inputLabel: "HTML source",
      resultTitle: "Markdown output",
      copy: "Copy Markdown",
      intel: "Result intelligence",
      lines: "Lines", headings: "Headings", links: "Links", bullets: "Bullets", chars: "Characters",
      scenario: "Scenario comparison",
      scA: "Migrate a blog", scADesc: "Convert WordPress / Medium HTML exports to Markdown for Hugo, Astro, Jekyll.",
      scB: "Tidy notes", scBDesc: "Turn copied web HTML into Markdown that Notion / Obsidian can read.",
      scC: "Write docs", scCDesc: "Convert RTE-generated HTML into Markdown for README / Wiki.",
      emotionUp: "Save the manual tag cleanup",
      emotionUpText: "No more deleting <div>, <span> and style attributes one by one — paste and get clean Markdown.",
      emotionLow: "Keep the structure you want",
      emotionLowText: "Heading levels, lists, links and code blocks are preserved correctly — output is commit-ready.",
      decision: "How to choose",
      decisionText: "Store long-lived content as Markdown in version control; for one-off posts just copy the output.",
      knowledge: "Knowledge card",
      knowledgeText: "Markdown is a lightweight markup language expressing format with plain-text symbols; GitHub, Reddit, Discord and Notion support it natively — more readable than HTML and friendlier to version-control diffs.",
      faq: "FAQ",
      faqAd: "Post-FAQ ad slot",
      affiliate: "Related tools",
      affiliateTitle: "Writing & publishing resources",
      premiumTitle: "Pro: batch & advanced conversion",
      premiumText: "Upgrade to Pro for batch file conversion, custom bullet symbols, table conversion and frontmatter injection.",
      refs: "References",
    },
  }[lang];

  const faqs: { q: LocalText; a: LocalText }[] = [
    { q: { zh: "我的 HTML 會被上傳嗎?", en: "Is my HTML uploaded?" }, a: { zh: "不會。轉換完全在瀏覽器內執行，資料不離開你的裝置。", en: "No. Conversion runs entirely in your browser; data never leaves your device." } },
    { q: { zh: "支援表格嗎?", en: "Does it support tables?" }, a: { zh: "基礎結構（標題、清單、連結、程式碼）已支援；完整表格轉換在 Pro。", en: "Core structures (headings, lists, links, code) are supported; full table conversion is in Pro." } },
    { q: { zh: "輸出能直接放 GitHub 嗎?", en: "Can I paste output to GitHub?" }, a: { zh: "可以，輸出為標準 GitHub-Flavored Markdown 相容語法。", en: "Yes, the output is compatible with GitHub-Flavored Markdown." } },
  ];

  const affiliateItems: AffiliateItem[] = [
    { label: { zh: "Markdown 編輯器", en: "Markdown editor" }, href: "#" },
    { label: { zh: "靜態網站產生器", en: "Static site generator" }, href: "#" },
    { label: { zh: "筆記軟體", en: "Note-taking app" }, href: "#" },
    { label: { zh: "版本控制教學", en: "Version control guide" }, href: "#" },
  ];

  const copy = () => { try { navigator.clipboard.writeText(output); } catch { /* noop */ } };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#ddd6fe,_#f8fafc_45%,_#e0e7ff)] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* L1 Hero */}
        <section className="rounded-[2rem] border border-violet-200 bg-white/80 p-7 shadow-sm backdrop-blur md:p-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-violet-700">DEVELOPER · GOLD</p>
              <h1 className="mt-2 text-4xl font-black text-slate-950 md:text-5xl">{t.hero}</h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{t.heroSub}</p>
            </div>
            <button onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="shrink-0 rounded-full border border-violet-300 bg-violet-50 px-4 py-2 text-sm font-black text-violet-800">{lang === "zh" ? "EN" : "中文"}</button>
          </div>
        </section>

        {/* L2 TrustIntro */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.trust}</p>
          <p className="mt-2 max-w-4xl text-sm leading-7 text-slate-700">{t.trustText}</p>
        </section>

        {/* L3 QuickStart */}
        <section className="grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
          {[t.step1, t.step2, t.step3].map((step, i) => (
            <Fragment key={`step-${i}`}>
              <div className="rounded-[2rem] border border-slate-200 bg-white p-5 text-center shadow-sm"><div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 font-black text-white">{i + 1}</div><p className="mt-2 text-sm font-black text-slate-800">{step}</p></div>
              {i < 2 && <div className="hidden items-center justify-center text-2xl font-black text-violet-400 md:flex">→</div>}
            </Fragment>
          ))}
        </section>

        {/* L4 InputGuidance + L5 Calc + L6 Result */}
        <section className="grid items-stretch gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.inputGuide}</p>
            <p className="mt-1 text-xs text-slate-500">{t.inputGuideText}</p>
            <label className="mt-4 text-sm font-black text-slate-800">{t.inputLabel}</label>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={14} className="mt-2 w-full flex-1 rounded-2xl border border-slate-300 bg-slate-50 p-4 font-mono text-sm text-slate-800 focus:border-violet-500 focus:outline-none" spellCheck={false} />
          </div>
          <div className="flex h-full flex-col rounded-[2rem] border border-violet-200 bg-white p-6 shadow-sm md:p-7">
            <div className="flex items-center justify-between"><h2 className="text-2xl font-black text-slate-950">{t.resultTitle}</h2><button onClick={copy} className="rounded-full bg-violet-600 px-4 py-1.5 text-sm font-black text-white">{t.copy}</button></div>
            <pre className="mt-3 w-full flex-1 overflow-auto rounded-2xl border border-slate-200 bg-slate-950 p-4 font-mono text-xs leading-5 text-emerald-200 whitespace-pre-wrap">{output}</pre>
          </div>
        </section>

        {/* L7 ResultIntelligence */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.intel}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-5">
            {[[t.lines, stats.lines], [t.headings, stats.headings], [t.links, stats.links], [t.bullets, stats.bullets], [t.chars, stats.chars]].map(([k, v]) => (
              <div key={String(k)} className="rounded-2xl bg-violet-50 p-4 text-center"><p className="text-3xl font-black text-violet-900">{v}</p><p className="mt-1 text-xs font-black uppercase tracking-wide text-violet-700">{k}</p></div>
            ))}
          </div>
          <AdSenseWrapper showAds={true} adSlot="html-to-markdown-result-intelligence" adFormat="horizontal" className="my-2" />
        </section>

        {/* L8 ScenarioComparison */}
        <section className="grid gap-4 md:grid-cols-3">
          {[[t.scA, t.scADesc], [t.scB, t.scBDesc], [t.scC, t.scCDesc]].map(([h, d]) => (
            <article key={String(h)} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><h3 className="text-lg font-black text-slate-900">{h}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{d}</p></article>
          ))}
        </section>

        {/* L9/L10 Emotion */}
        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-6"><h3 className="text-xl font-black text-emerald-900">{t.emotionUp}</h3><p className="mt-2 text-sm leading-6 text-emerald-800">{t.emotionUpText}</p></div>
          <div className="rounded-[2rem] border border-indigo-200 bg-indigo-50 p-6"><h3 className="text-xl font-black text-indigo-900">{t.emotionLow}</h3><p className="mt-2 text-sm leading-6 text-indigo-800">{t.emotionLowText}</p></div>
        </section>

        {/* L11 DecisionPath */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.decision}</p><p className="mt-2 max-w-4xl text-sm leading-7 text-slate-700">{t.decisionText}</p></section>

        {/* L12 Knowledge */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.knowledge}</p><p className="mt-2 max-w-4xl text-sm leading-7 text-slate-700">{t.knowledgeText}</p></section>

        {/* L13 FAQ */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
          <h2 className="text-2xl font-black text-slate-950">{t.faq}</h2>
          <div className="mt-4 space-y-3">
            {faqs.map((f, i) => (<details key={i} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black text-slate-800">{l(f.q, lang)}</summary><p className="mt-2 text-sm leading-6 text-slate-600">{l(f.a, lang)}</p></details>))}
          </div>
        </section>

        {/* L14 FAQ Ad */}
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="html-to-markdown-faq" position="inline" /></section>

        {/* L15 Affiliate + L16 PremiumGate */}
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]">
          <section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href + l(item.label, lang)} href={item.href} className="rounded-2xl border border-violet-100 bg-violet-50 p-5 text-center font-black text-violet-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-violet-700">{lang === "zh" ? "* 聯盟連結,購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section>
          <PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["批次轉換", "自訂符號", "表格轉換", "Frontmatter"] : ["Batch", "Bullets", "Tables", "Frontmatter"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate>
        </section>

        {/* L17 TrustReferences */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.refs}</p><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600"><li>CommonMark Spec — commonmark.org</li><li>GitHub Flavored Markdown Spec — github.github.com/gfm</li><li>WHATWG HTML Standard — html.spec.whatwg.org</li></ul></section>
      </div>
    </main>
  );
}
