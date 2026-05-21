import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowRight, BookOpen, Crown, Feather, HeartHandshake, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { setSeoMeta } from "@/lib/seo";

const aboutTitle = "關於我們｜豬龍皇與工具矩陣的知行樂趣";
const aboutDescription =
  "認識 PiGragon-H 豬龍皇與工具矩陣：一座結合專業工具、可靠數據、AI 協作、知行實踐與生活樂趣的工具與數據花園。";

const principles = [
  {
    title: "知",
    description: "分享科學工具、AI 學習歷程、理財知識與跨界研讀。",
    icon: BookOpen,
  },
  {
    title: "行",
    description: "記錄專業技術上的實戰突破與生活體驗。",
    icon: Feather,
  },
  {
    title: "樂趣",
    description: "透過這一切，實踐「以技養生」的理想，找回生活的真味。",
    icon: Sprout,
  },
];

export default function About() {
  useEffect(() => {
    setSeoMeta({
      title: aboutTitle,
      description: aboutDescription,
    });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary/10 via-background to-amber-500/10">
        <div className="container py-16 md:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-5 text-xs font-medium">
              About Tools Matrix
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              關於我們
              <span className="mt-3 block text-primary">豬龍皇與工具矩陣的知行樂趣</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
              這不只是一個工具網站，這是我的學習心錄，也是我的工作道場，更將成為大家共同的工具與數據花園。
            </p>
          </div>
        </div>
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, var(--primary) 0, transparent 28%), radial-gradient(circle at 80% 0%, var(--primary) 0, transparent 24%)",
          }}
        />
      </section>

      <section className="container py-14 md:py-20">
        <div className="mx-auto max-w-4xl space-y-10">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col gap-5 md:flex-row md:items-start">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <Crown className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xl font-semibold leading-9 md:text-2xl">
                    「世人之下，我為豬；世人之上，我為龍。我之為我，自在為皇。」
                  </p>
                  <p className="mt-4 leading-8 text-muted-foreground">
                    我是 PiGragon-H，中文名「豬龍皇」。這個名字，起源於生命歷程中與一塊仿古玉器的相遇。那古老、圓融而帶有力量的豬龍造型，陪伴我在紅塵中打滾多年，也刻下了一種處世哲學：當世界高大時，守拙如豬，內斂而飽滿；當需要突破時，奮起如龍，果敢而凌厲。
                  </p>
                  <p className="mt-4 leading-8 text-muted-foreground">
                    「皇」字，既是姓氏「黃」的同音，更是我對生命態度的宣告——為自己的生命作主，修飾心靈的居所，建構專業的疆界。後來，隨著信仰的深化，我學會了虛己，尊主為大，以鷹展翅的姿態，在謙遜中尋求更高的視野。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <article className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold">為什麼創立工具矩陣</h2>
            </div>
            <p className="leading-8 text-muted-foreground">
              我接受過財務會計的系統訓練，也曾在金融業服務多年。然而每當需要用財會或企管指標評估一個組織的健康狀況時，仍須翻閱大量書籍，費時費力。
            </p>
            <p className="leading-8 text-muted-foreground">
              後來投入電子產品製造，帶領研發團隊，開發過程中更是頻繁查驗各種公式、轉換表、通訊協議與安規指令。這段經歷讓我深刻體會到：專業工具與可靠數據，是決策品質的根基。
            </p>
            <p className="leading-8 text-muted-foreground">
              我們每個人，無論從事何種工作、關心什麼議題，都有太多類似的需求——需要標準化的工具、可信賴的指標、清晰的公式，幫助我們判斷、決策，讓所採行的做法更有所本、更具說服力。這就是工具矩陣誕生的原因。
            </p>
          </article>

          <article className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
            <div>
              <h2 className="text-2xl font-bold">這裡有什麼</h2>
              <p className="mt-4 leading-8 text-muted-foreground">
                工具矩陣涵蓋 12 大類別，包括財經投資、健康生活、職場效率、開發工具、教育學習、創意設計、電商零售、旅遊地理、法律法規、科學工程、語言文字與 AI 工具。
              </p>
              <p className="mt-4 leading-8 text-muted-foreground">
                我們的核心承諾是三個字：
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {principles.map(({ title, description, icon: Icon }) => (
                <div key={title} className="rounded-xl border border-border bg-muted/30 p-5">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>

            <p className="rounded-xl bg-muted/40 p-5 leading-8 text-muted-foreground">
              所有文章由人提供主題與核心內容，交由 AI 協助完稿，再經人工審定後才發布。這是對每一位來訪朋友的基本尊重。
            </p>
          </article>

          <article className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-6 shadow-sm md:p-8">
            <h2 className="text-2xl font-bold">我的邀請</h2>
            <div className="mt-5 space-y-5 leading-8 text-muted-foreground">
              <p>
                這不只是一個工具網站，這是我的學習心錄，也是我的工作道場，更將成為大家共同的工具與數據花園。
              </p>
              <p>
                我不僅是在教你如何使用工具，我是在邀請你與我一起，建構屬於你自己的「生命裝潢」。
              </p>
              <p>
                我始終是用心管理的園丁。期待這片園地，在大家的參與下，枝葉茂盛，花開滿園。
              </p>
              <p className="font-medium text-foreground">
                歡迎來到豬龍皇的領地，讓我們在知行之間，共尋樂趣。
              </p>
            </div>
            <div className="mt-8 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-semibold text-primary">PiGragon-H｜工具矩陣的園丁</p>
              <Button asChild className="gap-2">
                <Link href="/">
                  探索工具矩陣 <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
