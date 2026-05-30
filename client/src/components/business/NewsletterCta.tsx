// NewsletterCta.tsx — Phase G Sprint C
// LIVE newsletter signup. Submits to /trpc/newsletter.subscribe (Resend backend).
// If RESEND_API_KEY is missing on the server, the mutation falls back to stub-mode
// and still returns ok:true so the UX is uninterrupted.

import { useState } from "react";
import { isEnabled } from "@/config/featureFlags";
import { trpc } from "@/lib/trpc";
import type { Lang } from "@/contexts/LanguageContext";
import { Mail, BookmarkPlus, Loader2 } from "lucide-react";

interface NewsletterCtaProps {
  lang: Lang;
  source?: string; // analytics tag — e.g. "homepage-newsletter", "pricing-interest"
}

export function NewsletterCta({ lang, source = "homepage-newsletter" }: NewsletterCtaProps) {
  const isLive = isEnabled("ENABLE_NEWSLETTER");
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const subscribe = trpc.newsletter.subscribe.useMutation({
    onSuccess: (data) => {
      setFeedback({
        kind: "success",
        text:
          data?.message ??
          (lang === "zh" ? "✓ 已收到你的訂閱,謝謝!" : "✓ Subscribed — thank you!"),
      });
      setEmail("");
    },
    onError: (err) => {
      setFeedback({
        kind: "error",
        text:
          err.message ||
          (lang === "zh"
            ? "訂閱暫時無法完成,請稍後再試。"
            : "Could not complete subscription. Please try again."),
      });
    },
  });

  return (
    <section
      data-stub="conversion-strip"
      className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]"
    >
      {/* L9: Newsletter signup */}
      <div className="rounded-[2rem] border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-7 shadow-sm dark:border-blue-900/50 dark:from-blue-950/30 dark:to-indigo-950/30 md:p-8">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-900/20">
          <Mail className="h-6 w-6" />
        </div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white md:text-2xl">
          {lang === "zh" ? "加入電子報" : "Join the newsletter"}
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {lang === "zh"
            ? "每月一封,把新工具、公式專欄與決策路徑直接寄到你的信箱。隨時可取消訂閱。"
            : "One email a month — new tools, formula essays, and decision paths straight to your inbox. Unsubscribe anytime."}
        </p>
        <form
          className="mt-5 flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            if (!isLive) return;
            if (!email) return;
            setFeedback(null);
            subscribe.mutate({ email, source, lang });
          }}
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            disabled={subscribe.isPending}
            aria-label={lang === "zh" ? "Email 地址" : "Email address"}
            className="flex-1 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-60 dark:border-blue-900/50 dark:bg-slate-900 dark:text-white"
            data-testid="newsletter-input"
          />
          <button
            type="submit"
            disabled={!isLive || subscribe.isPending}
            data-testid="newsletter-submit"
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-black transition ${
              isLive
                ? "bg-blue-600 text-white hover:bg-blue-700 disabled:cursor-wait disabled:opacity-70"
                : "cursor-not-allowed bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
            }`}
          >
            {subscribe.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {lang === "zh" ? "送出中…" : "Subscribing…"}
              </>
            ) : isLive ? (
              lang === "zh" ? "訂閱" : "Subscribe"
            ) : lang === "zh" ? (
              "即將開放"
            ) : (
              "Coming soon"
            )}
          </button>
        </form>
        <div aria-live="polite" className="mt-3 min-h-[1.25rem]">
          {feedback ? (
            <p
              className={`text-xs font-bold ${
                feedback.kind === "success"
                  ? "text-emerald-700 dark:text-emerald-300"
                  : "text-red-700 dark:text-red-300"
              }`}
            >
              {feedback.text}
            </p>
          ) : null}
        </div>
      </div>

      {/* L10: Bookmark / save CTA */}
      <div className="rounded-[2rem] border border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-7 shadow-sm dark:border-violet-900/50 dark:from-violet-950/30 dark:to-fuchsia-950/30 md:p-8">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-md shadow-violet-900/20">
          <BookmarkPlus className="h-6 w-6" />
        </div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white md:text-2xl">
          {lang === "zh" ? "把 Formula Universe 加入書籤" : "Bookmark Formula Universe"}
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {lang === "zh"
            ? "下次需要計算時直接打開,不用再搜尋。按 Ctrl/Cmd + D 即可加入瀏覽器書籤。"
            : "Open it directly next time — no searching needed. Press Ctrl/Cmd + D to bookmark."}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <kbd className="rounded-lg border border-violet-300 bg-white px-2.5 py-1 text-xs font-bold text-violet-900 shadow-sm dark:border-violet-700 dark:bg-slate-900 dark:text-violet-200">
            Ctrl
          </kbd>
          <span className="text-violet-700 dark:text-violet-300">+</span>
          <kbd className="rounded-lg border border-violet-300 bg-white px-2.5 py-1 text-xs font-bold text-violet-900 shadow-sm dark:border-violet-700 dark:bg-slate-900 dark:text-violet-200">
            D
          </kbd>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {lang === "zh" ? "(macOS 用 ⌘ + D)" : "(use ⌘ + D on macOS)"}
          </span>
        </div>
      </div>
    </section>
  );
}
