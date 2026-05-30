import { useState } from "react";
import { Settings, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminSettings() {
  const { lang } = useLanguage();
  const [saved, setSaved] = useState(false);

  // Stub-state — Phase D.4 will wire to DB.
  const [flags, setFlags] = useState({
    ENABLE_ADS: true,
    ENABLE_REAL_ADSENSE: false,
    ENABLE_AFFILIATE: false,
    ENABLE_PREMIUM: false,
    ENABLE_NEWSLETTER: false,
    ENABLE_TRUST_LINKS: true,
  });
  const [adsenseId, setAdsenseId] = useState("ca-pub-XXXXXXXXXXXXXXXX");
  const [pricing, setPricing] = useState({
    proZh: "NT$ 96 / 月",
    proEn: "$3 / month",
    teamZh: "NT$ 330 / 月",
    teamEn: "$9 / month",
    agencyZh: "NT$ 996 / 月",
    agencyEn: "$33 / month",
  });
  const [affiliate, setAffiliate] = useState({
    smartScale: "",
    fitnessTracker: "",
    decisionBooks: "",
    toolSubscription: "",
  });

  const handleSave = () => {
    // Phase D.4 will push to Supabase. For now show a "would save" toast.
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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
              ? "調整 17 層商業化骨架的所有 placeholder。改完按下方儲存,即時生效不需重新部署。"
              : "Tune all placeholders for the 17-layer monetization scaffold. Save below to apply instantly (no redeploy)."}
          </p>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          {lang === "zh" ? "儲存所有設定" : "Save all"}
        </Button>
      </div>

      {saved && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            {lang === "zh"
              ? "設定已暫存到表單(Phase D.4 會接 Supabase site_settings 表持久化)。"
              : "Saved to form state. Phase D.4 will persist to Supabase site_settings."}
          </AlertDescription>
        </Alert>
      )}

      <Alert className="border-amber-300 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/30">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {lang === "zh"
            ? "目前此頁僅為 UI 預覽。Phase D.1-D.4 將建立 site_settings 表、串接 tRPC、改 featureFlags.ts 讀 DB,讓改動即時生效於前台。"
            : "This page is currently UI-only. Phase D.1-D.4 will add site_settings table, tRPC wiring, and refactor featureFlags.ts to read from DB."}
        </AlertDescription>
      </Alert>

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
              {Object.entries(flags).map(([key, value]) => (
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
                    checked={value}
                    onCheckedChange={(checked) =>
                      setFlags((f) => ({ ...f, [key]: checked }))
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
                  value={adsenseId}
                  onChange={(e) => setAdsenseId(e.target.value)}
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
              {[
                { key: "pro", label: "PRO" },
                { key: "team", label: "TEAM" },
                { key: "agency", label: "AGENCY" },
              ].map((p) => (
                <div key={p.key} className="grid gap-3 sm:grid-cols-2 border-b border-dashed pb-3 last:border-0">
                  <div>
                    <Label htmlFor={`${p.key}-zh`}>
                      {p.label}（zh）
                    </Label>
                    <Input
                      id={`${p.key}-zh`}
                      value={pricing[`${p.key}Zh` as keyof typeof pricing]}
                      onChange={(e) =>
                        setPricing((s) => ({
                          ...s,
                          [`${p.key}Zh`]: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor={`${p.key}-en`}>
                      {p.label}（en）
                    </Label>
                    <Input
                      id={`${p.key}-en`}
                      value={pricing[`${p.key}En` as keyof typeof pricing]}
                      onChange={(e) =>
                        setPricing((s) => ({
                          ...s,
                          [`${p.key}En`]: e.target.value,
                        }))
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
                  : "4 theme links shown on homepage AffiliateGrid. Blank = 'Coming soon'."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { key: "smartScale", label: lang === "zh" ? "智慧體重計" : "Smart Scale" },
                { key: "fitnessTracker", label: lang === "zh" ? "健身手環" : "Fitness Tracker" },
                { key: "decisionBooks", label: lang === "zh" ? "決策好書" : "Decision Books" },
                { key: "toolSubscription", label: lang === "zh" ? "工具訂閱" : "Tool Subscription" },
              ].map((aff) => (
                <div key={aff.key}>
                  <Label htmlFor={aff.key}>{aff.label}</Label>
                  <Input
                    id={aff.key}
                    value={affiliate[aff.key as keyof typeof affiliate]}
                    onChange={(e) =>
                      setAffiliate((s) => ({ ...s, [aff.key]: e.target.value }))
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

const flagDescriptions: Record<string, { zh: string; en: string }> = {
  ENABLE_ADS: {
    zh: "顯示 AdSlot 廣告位容器（佔位/真廣告皆受此控）",
    en: "Show AdSlot containers (both placeholder and real ads).",
  },
  ENABLE_REAL_ADSENSE: {
    zh: "注入真實 Google AdSense script(需先填 Publisher ID)",
    en: "Inject real Google AdSense script (requires Publisher ID).",
  },
  ENABLE_AFFILIATE: {
    zh: "聯盟連結變成可點擊(否則顯示「即將推出」)",
    en: "Make affiliate links clickable (else show 'Coming soon').",
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
