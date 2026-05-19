import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowRight, BookOpen, Crown, Feather, HeartHandshake, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { setSeoMeta } from "@/lib/seo";

const principles = [
  { title: "免費", description: "所有工具永久免費，讓每個人都能使用專業計算工具。", icon: BookOpen },
  { title: "簡單", description: "介面直覺，無需登入，開啟即用。", icon: Feather },
  { title: "成長", description: "從42個工具出發，目標擴充到1000+個專業工具。", icon: Sprout },
];

export default function About() {
  useEffect(() => {
    setSeoMeta({ title: "關於工具矩陣", description: "免費線上工具平台" });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="container py-16">
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-5">About Tools Matrix</Badge>
          <h1 className="text-4xl font-bold">
            關於
            <span className="block text-primary">工具矩陣</span>
          </h1>
          <p className="mt-6 text-muted-foreground">
            為普通人打造的免費專業工具平台，讓每個人都能用最簡單的方式做出最準確的決策。
          </p>
        </div>

        <div className="mx-auto max-w-4xl mt-12 space-y-8">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-8">
              <div className="flex gap-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <Crown className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xl font-semibold">我們相信，好工具不應該有價格門檻。</p>
                  <p className="mt-4 text-muted-foreground">
                    工具矩陣提供12大類免費專業計算工具，涵蓋財經投資、健康生活、職場效率、開發者工具等領域。
                  </p>
                  <p className="mt-4 text-muted-foreground">
                    我們的目標是讓每一個人，無論背景或資源，都能使用過去只有專業人士才能取得的計算工具。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <article className="rounded-2xl border bg-card p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold">為什麼打造這個平台？</h2>
            </div>
            <p className="mt-4 text-muted-foreground">
              在網路上，好用的計算工具往往藏在付費牆後面，或者介面複雜難以上手。我們認為這不應該是常態。
            </p>
            <p className="mt-4 text-muted-foreground">
              工具矩陣的誕生，就是為了打破這道牆——讓每一個需要計算複利、評估BMI、規劃退休金的普通人，都能免費、快速地取得答案。
            </p>
          </article>

          <article className="rounded-2xl border bg-card p-8">
            <h2 className="text-2xl font-bold">我們的核心理念</h2>
            <p className="mt-4 text-muted-foreground">工具矩陣涵蓋12大類專業工具，每一個都經過精心設計，確保準確、易用、美觀。</p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {principles.map(({ title, description, icon: Icon }) => (
                <div key={title} className="rounded-xl border bg-muted/30 p-5">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold">{title}</h3>
                  <p className="mt-3 text-sm text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-8">
            <h2 className="text-2xl font-bold">聯絡我們</h2>
            <p className="mt-4 text-muted-foreground">
              如果你有任何建議、工具需求、或想要合作，歡迎透過 GitHub 與我們聯繫。
            </p>
            <p className="mt-4 font-medium text-foreground">感謝你使用工具矩陣，一起讓工具更好用！</p>
            <div className="mt-8 flex items-center justify-between border-t pt-6">
              <p className="font-semibold text-primary">PiGragon-H｜工具矩陣團隊</p>
              <Button asChild className="gap-2">
                <Link href="/">前往工具矩陣 <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}