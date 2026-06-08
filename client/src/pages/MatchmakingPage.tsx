// ============================================================
// /opportunities/matchmaking — 企業整廠輸出媒合（預留頁，不在 nav 露出）
// ============================================================
// Victor 既定：「媒合先做程式預留不露出」。
// 階段一 = 只收集需求（lead-collection form），介面預留、配對引擎不啟用。
// 配對邏輯見 shared/matchmaking.ts（matchScore 目前 throw，MATCHMAKING_ENABLED=false）。
//
// ── 預留（HANDOFF）─────────────────────────────────────────
//  • 表單目前只在前端把資料整理成 MatchmakingLead 形狀並顯示「已收到」。
//    階段二接手：把 submit 接到後端 API（POST /api/matchmaking/leads），
//    並在 shared/matchmaking.ts 把 MATCHMAKING_ENABLED 設 true、實作 matchScore。
//  • 此頁「只增不刪」：已預留路由但不在 Navbar 顯示，可直接連結進入。
// ============================================================
import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { MatchmakingLead, MatchParty } from "../../../shared/matchmaking";

export default function MatchmakingPage() {
  const { lang } = useLanguage();
  const t = (zh: string, en: string) => (lang === "zh" ? zh : en);

  const [party, setParty] = useState<MatchParty>("demand");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // [預留] 階段一只在前端整理成 MatchmakingLead 形狀；後端 API 待接。
    const lead: MatchmakingLead = {
      party,
      email,
      message,
      source: "matchmaking-page",
    };
    // eslint-disable-next-line no-console
    console.info("[matchmaking lead reserved]", lead);
    setSubmitted(true);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Button asChild variant="ghost" size="sm" className="mb-6 gap-2">
        <Link href="/opportunities">
          <ArrowLeft className="h-4 w-4" />
          {t("返回機會情報", "Back to Opportunities")}
        </Link>
      </Button>

      <div className="flex items-center gap-2 mb-3">
        <Badge variant="secondary">{t("預留 / 籌備中", "Reserved / Preview")}</Badge>
      </div>
      <h1 className="text-3xl font-bold tracking-tight">
        {t("企業整廠輸出媒合", "Enterprise Turnkey Matchmaking")}
      </h1>
      <p className="mt-3 text-muted-foreground">
        {t(
          "把 AI 能力打包成可交付的企業方案。先登記需求或供給，配對服務上線後我們會主動聯繫。",
          "Package AI capabilities into deliverable enterprise solutions. Register your needs or supply; we'll reach out when matchmaking goes live."
        )}
      </p>

      {submitted ? (
        <div className="mt-8 rounded-xl border bg-muted/40 p-6 text-center">
          <p className="text-lg font-semibold">
            {t("已收到您的登記！", "We've received your registration!")}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t(
              "媒合服務正式上線後，我們會以您留下的 Email 聯繫。",
              "We'll contact you via the email you provided once matchmaking launches."
            )}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">
              {t("您的身份", "Your role")}
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setParty("demand")}
                className={`flex-1 rounded-lg border px-4 py-3 text-sm transition ${
                  party === "demand"
                    ? "border-primary bg-primary/5"
                    : "hover:border-primary/50"
                }`}
              >
                {t("我有需求（找方案）", "I have needs (seeking)")}
              </button>
              <button
                type="button"
                onClick={() => setParty("supply")}
                className={`flex-1 rounded-lg border px-4 py-3 text-sm transition ${
                  party === "supply"
                    ? "border-primary bg-primary/5"
                    : "hover:border-primary/50"
                }`}
              >
                {t("我能供給（接案）", "I can supply (providing)")}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("您的聯絡信箱", "Your contact email")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t("需求 / 能力描述", "Describe your needs / capabilities")}
            </label>
            <Textarea
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t(
                "簡述您想解決的問題，或您能提供的服務。",
                "Briefly describe the problem you want solved, or the service you can provide."
              )}
            />
          </div>

          <Button type="submit" className="w-full">
            {t("送出登記", "Submit Registration")}
          </Button>
        </form>
      )}
    </div>
  );
}
