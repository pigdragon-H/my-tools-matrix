import { useEffect, useState } from "react";
import { Activity, CheckCircle2, XCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

type Check = {
  label: { zh: string; en: string };
  status: "ok" | "warn" | "fail" | "loading";
  detail?: string;
};

export default function AdminHealth() {
  const { lang } = useLanguage();
  const ping = trpc.useUtils();
  const [serverPing, setServerPing] = useState<Check>({
    label: { zh: "tRPC 後端", en: "tRPC backend" },
    status: "loading",
  });
  const [healthz, setHealthz] = useState<Check>({
    label: { zh: "Express /healthz", en: "Express /healthz" },
    status: "loading",
  });

  useEffect(() => {
    ping.client.ping.query().then(
      (r) =>
        setServerPing({
          label: { zh: "tRPC 後端", en: "tRPC backend" },
          status: "ok",
          detail: `ts=${r.ts}`,
        }),
      () =>
        setServerPing({
          label: { zh: "tRPC 後端", en: "tRPC backend" },
          status: "fail",
        })
    );
    fetch("/healthz")
      .then((r) => r.json())
      .then(() =>
        setHealthz({
          label: { zh: "Express /healthz", en: "Express /healthz" },
          status: "ok",
        })
      )
      .catch(() =>
        setHealthz({
          label: { zh: "Express /healthz", en: "Express /healthz" },
          status: "fail",
        })
      );
  }, []);

  const checks: Check[] = [serverPing, healthz];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
          <Activity className="h-6 w-6" />
          {lang === "zh" ? "系統健康" : "System Health"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {lang === "zh"
            ? "後端服務、資料庫連線、AI 服務的即時狀態。"
            : "Real-time status of backend, database, and AI services."}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {lang === "zh" ? "服務檢查" : "Service checks"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {checks.map((c, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-md border border-border bg-white px-3 py-2 dark:bg-slate-900"
            >
              <span className="text-sm font-medium">{c.label[lang]}</span>
              <div className="flex items-center gap-2">
                {c.detail && (
                  <span className="text-xs text-muted-foreground font-mono">
                    {c.detail}
                  </span>
                )}
                {c.status === "loading" && <Skeleton className="h-5 w-12" />}
                {c.status === "ok" && (
                  <Badge className="gap-1 bg-emerald-600">
                    <CheckCircle2 className="h-3 w-3" /> OK
                  </Badge>
                )}
                {c.status === "fail" && (
                  <Badge variant="destructive" className="gap-1">
                    <XCircle className="h-3 w-3" /> Fail
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {lang === "zh" ? "未來檢查項" : "Upcoming checks"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <p>• Supabase Postgres connection (Phase F)</p>
          <p>• Anthropic Claude API (Phase E.5)</p>
          <p>• Supabase Storage (Phase E.9)</p>
          <p>• AdSense script load (Phase D)</p>
        </CardContent>
      </Card>
    </div>
  );
}
