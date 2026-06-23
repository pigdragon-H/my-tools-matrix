import { useEffect, useState } from "react";
import { Settings, Save, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const flagDescriptions: Record<string, { zh: string; en: string }> = {
  ENABLE_ADS: {
    zh: "顯示 AdSlot 廣告位容器（佔位/真廣告皆受此控）",
    en: "Show approved ad containers after inventory is ready.",
  },
  ENABLE_REAL_ADSENSE: {
    zh: "注入真實 Google AdSense script(需先填 Publisher ID)",
    en: "Inject real Google AdSense script (requires Publisher ID).",
  },
  ENABLE_AFFILIATE: {
    zh: "聯盟連結變成可點擊(否則顯示「即將推出」)",
    en: "Make affiliate links clickable after destinations are final.",
  },
  ENABLE_PREMIUM: {
    zh: "PremiumTeaser 升級按鈕變成可點擊",
    en: "Make PremiumTeaser upgrade buttons clickable.",
  },
  ENABLE_NEWSLETTER: {
    zh: "電子報訂閱表單變成可送出",
    en: "Make newsletter form submittable.",
  },
  ENABLE_TRUST_LINKS: {
    zh: "顯示 TrustStrip(隱私/條款/編輯方針區塊)",
    en: "Show TrustStrip (privacy/terms/editorial section).",
  },
};

export default function AdminSettings() {
  const { lang } = useLanguage();
  const utils = trpc.useUtils();
  const settingsQ = trpc.settings.get.useQuery();
  const updateM = trpc.settings.update.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
    },
  });

  const [draft, setDraft] = useState<typeof settingsQ.data | null>(null);
  const [saved, setSaved] = useState<"ok" | "fail" | null>(null);

  useEffect(() => {
    if (settingsQ.data && !draft) {
      setDraft(settingsQ.data);
    }
  }, [settingsQ.data, draft]);

  if (settingsQ.isLoading || !draft) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleSave = async () => {
    try {
      const res = await updateM.mutateAsync(draft);
      setSaved(res.success ? "ok" : "fail");
      setTimeout(() => setSaved(null), 4000);
    } catch {
      setSaved("fail");
      setTimeout(() => setSaved(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Settings className="h-6 w-6" />
            {lang === "zh" ? "商業設定" : "Business Settings"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {lang === "zh"
              ? "調整商業化設定。儲存後即時生效，無需重新部署。"
              : "Tune monetization settings. Save to apply instantly (no redeploy)."}
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={updateM.isPending}
          className="gap-2"
        >
          {updateM.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {lang === "zh" ? "儲存所有設定" : "Save all"}
        </Button>
      </div>

      {saved === "ok" && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            {lang === "zh"
              ? "✅ 已儲存到 site_settings 表。前台會在下一次載入時生效。"
              : "✅ Saved to site_settings table. Front-end will pick up changes on next load."}
          </AlertDescription>
        </Alert>
      )}

      {saved === "fail" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {lang === "zh"
              ? "❌ 儲存失敗。請確認 Phase F 的 site_settings table 已建立 + SUPABASE_SERVICE_ROLE_KEY 已設定。"
              : "❌ Save failed. Make sure Phase F's site_settings table exists + SUPABASE_SERVICE_ROLE_KEY is set."}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="flags">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="flags">FeatureFlag</TabsTrigger>
          <TabsTrigger value="adsense">AdSense</TabsTrigger>
          <TabsTrigger value="premium">Premium</TabsTrigger>
          <TabsTrigger value="affiliate">Affiliate</TabsTrigger>
        </TabsList>

        {/* Flags */}
        <TabsContent value="flags" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {lang === "zh" ? "全站功能開關" : "Global feature flags"}
              </CardTitle>
              <CardDescription>
                {lang === "zh"
                  ? "對應 client/src/config/featureFlags.ts 的 6 個 flag。"
                  : "Maps to the 6 flags in client/src/config/featureFlags.ts."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(draft.flags).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between border-b border-dashed pb-3 last:border-0"
                >
                  <div>
                    <Label className="font-mono text-xs">{key}</Label>
                    <p className="text-xs text-muted-foreground">
                      {flagDescriptions[key]?.[lang] ?? ""}
                    </p>
                  </div>
                  <Switch
                    checked={value as boolean}
                    onCheckedChange={(checked) =>
                      setDraft({
                        ...draft,
                        flags: { ...draft.flags, [key]: checked },
                      })
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AdSense */}
        <TabsContent value="adsense" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Google AdSense</CardTitle>
              <CardDescription>
                {lang === "zh"
                  ? "申請通過後,在此填入 Publisher ID。"
                  : "Once approved, paste your Publisher ID here."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="adsense-id">Publisher ID</Label>
                <Input
                  id="adsense-id"
                  value={draft.adsense.publisherId}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      adsense: { ...draft.adsense, publisherId: e.target.value },
                    })
                  }
                  placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                  className="font-mono"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  {lang === "zh"
                    ? "需同時開啟 ENABLE_REAL_ADSENSE flag 才會真的注入廣告 script。"
                    : "ENABLE_REAL_ADSENSE flag must also be on to inject the actual ad script."}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Premium */}
        <TabsContent value="premium" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {lang === "zh" ? "Premium 訂價" : "Premium pricing"}
              </CardTitle>
              <CardDescription>
                {lang === "zh"
                  ? "中英雙語顯示在 PremiumTeaser 元件。"
                  : "Shown bilingual on PremiumTeaser component."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(["pro", "team", "agency"] as const).map((p) => (
                <div
                  key={p}
                  className="grid gap-3 sm:grid-cols-2 border-b border-dashed pb-3 last:border-0"
                >
                  <div>
                    <Label htmlFor={`${p}-zh`}>{p.toUpperCase()}（zh）</Label>
                    <Input
                      id={`${p}-zh`}
                      value={draft.premium[`${p}Zh`] as string}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          premium: {
                            ...draft.premium,
                            [`${p}Zh`]: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor={`${p}-en`}>{p.toUpperCase()}（en）</Label>
                    <Input
                      id={`${p}-en`}
                      value={draft.premium[`${p}En`] as string}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          premium: {
                            ...draft.premium,
                            [`${p}En`]: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Affiliate */}
        <TabsContent value="affiliate" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {lang === "zh" ? "聯盟連結" : "Affiliate links"}
              </CardTitle>
              <CardDescription>
                {lang === "zh"
                  ? "首頁 AffiliateGrid 的 4 個主題連結。空白表示「即將推出」。"
                  : "4 resource links shown when review-safe commercial features are enabled."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(
                [
                  ["smartScale", lang === "zh" ? "智慧體重計" : "Smart Scale"],
                  ["fitnessTracker", lang === "zh" ? "健身手環" : "Fitness Tracker"],
                  ["decisionBooks", lang === "zh" ? "決策好書" : "Decision Books"],
                  ["toolSubscription", lang === "zh" ? "工具訂閱" : "Tool Subscription"],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <Label htmlFor={key}>{label}</Label>
                  <Input
                    id={key}
                    value={draft.affiliate[key] as string}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        affiliate: {
                          ...draft.affiliate,
                          [key]: e.target.value,
                        },
                      })
                    }
                    placeholder="https://..."
                    className="font-mono text-xs"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
