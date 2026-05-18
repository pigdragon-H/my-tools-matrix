import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy } from "lucide-react";
import { toast } from "sonner";

type FreqType = "every_minute" | "every_hour" | "every_day" | "every_week" | "every_month" | "custom";

const DAYS_OF_WEEK = ["日", "一", "二", "三", "四", "五", "六"];
const MONTHS = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];

const PRESETS: { label: string; cron: string; desc: string }[] = [
  { label: "每分鐘", cron: "* * * * *", desc: "每分鐘執行一次" },
  { label: "每小時", cron: "0 * * * *", desc: "每小時整點執行" },
  { label: "每天午夜", cron: "0 0 * * *", desc: "每天 00:00 執行" },
  { label: "每天早上 8 點", cron: "0 8 * * *", desc: "每天 08:00 執行" },
  { label: "每週一早上 9 點", cron: "0 9 * * 1", desc: "每週一 09:00 執行" },
  { label: "每月 1 日", cron: "0 0 1 * *", desc: "每月 1 日 00:00 執行" },
  { label: "每季首日", cron: "0 0 1 1,4,7,10 *", desc: "每季第一天 00:00 執行" },
  { label: "每年元旦", cron: "0 0 1 1 *", desc: "每年 1 月 1 日 00:00 執行" },
  { label: "工作日每天", cron: "0 9 * * 1-5", desc: "週一至週五 09:00 執行" },
  { label: "每 5 分鐘", cron: "*/5 * * * *", desc: "每 5 分鐘執行一次" },
  { label: "每 15 分鐘", cron: "*/15 * * * *", desc: "每 15 分鐘執行一次" },
  { label: "每 30 分鐘", cron: "*/30 * * * *", desc: "每 30 分鐘執行一次" },
];

function parseCron(cron: string): string {
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) return "格式錯誤（需要 5 個欄位）";
  const [min, hour, dom, month, dow] = parts;

  const fmtMin = min === "*" ? "每分鐘" : min.startsWith("*/") ? `每 ${min.slice(2)} 分鐘` : `第 ${min} 分`;
  const fmtHour = hour === "*" ? "每小時" : hour.startsWith("*/") ? `每 ${hour.slice(2)} 小時` : `${hour} 時`;
  const fmtDom = dom === "*" ? "每天" : `每月 ${dom} 日`;
  const fmtMonth = month === "*" ? "每月" : `${month} 月`;
  const fmtDow = dow === "*" ? "每天" : dow === "1-5" ? "週一至週五" : `週${DAYS_OF_WEEK[Number(dow)] || dow}`;

  if (min === "*" && hour === "*") return `每分鐘執行`;
  if (hour === "*") return `每小時的第 ${min} 分執行`;
  if (dom === "*" && dow === "*") return `每天 ${hour}:${min.padStart(2, "0")} 執行`;
  if (dow !== "*") return `${fmtDow} ${hour}:${min.padStart(2, "0")} 執行`;
  if (dom !== "*") return `${fmtMonth}${fmtDom} ${hour}:${min.padStart(2, "0")} 執行`;
  return `${fmtMonth} ${fmtDom} ${fmtHour} ${fmtMin} 執行`;
}

export default function CronGenerator() {
  const [freq, setFreq] = useState<FreqType>("every_day");
  const [minute, setMinute] = useState("0");
  const [hour, setHour] = useState("8");
  const [dayOfMonth, setDayOfMonth] = useState("1");
  const [month, setMonth] = useState("*");
  const [dayOfWeek, setDayOfWeek] = useState("*");
  const [customCron, setCustomCron] = useState("0 8 * * *");

  const generatedCron = useMemo(() => {
    switch (freq) {
      case "every_minute": return "* * * * *";
      case "every_hour": return `${minute} * * * *`;
      case "every_day": return `${minute} ${hour} * * *`;
      case "every_week": return `${minute} ${hour} * * ${dayOfWeek}`;
      case "every_month": return `${minute} ${hour} ${dayOfMonth} * *`;
      case "custom": return customCron;
    }
  }, [freq, minute, hour, dayOfMonth, month, dayOfWeek, customCron]);

  const humanReadable = useMemo(() => parseCron(generatedCron), [generatedCron]);

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("已複製到剪貼簿");
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cron Job 表達式生成器</h1>
        <p className="text-muted-foreground mt-1">視覺化設定排程，自動生成 Cron 語法並解析人類語言說明</p>
      </div>

      <Card>
        <CardHeader><CardTitle>排程設定</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>執行頻率</Label>
            <Select value={freq} onValueChange={v => setFreq(v as FreqType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="every_minute">每分鐘</SelectItem>
                <SelectItem value="every_hour">每小時</SelectItem>
                <SelectItem value="every_day">每天</SelectItem>
                <SelectItem value="every_week">每週</SelectItem>
                <SelectItem value="every_month">每月</SelectItem>
                <SelectItem value="custom">自訂</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {freq === "custom" && (
            <div className="space-y-2">
              <Label>自訂 Cron 表達式</Label>
              <Input value={customCron} onChange={e => setCustomCron(e.target.value)} placeholder="* * * * *" className="font-mono" />
              <p className="text-xs text-muted-foreground">格式：分 時 日 月 星期（0=週日）</p>
            </div>
          )}

          {freq !== "every_minute" && freq !== "custom" && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {(freq === "every_hour" || freq === "every_day" || freq === "every_week" || freq === "every_month") && (
                <div className="space-y-2">
                  <Label>分鐘（0-59）</Label>
                  <Input type="number" min="0" max="59" value={minute} onChange={e => setMinute(e.target.value)} />
                </div>
              )}
              {(freq === "every_day" || freq === "every_week" || freq === "every_month") && (
                <div className="space-y-2">
                  <Label>小時（0-23）</Label>
                  <Input type="number" min="0" max="23" value={hour} onChange={e => setHour(e.target.value)} />
                </div>
              )}
              {freq === "every_week" && (
                <div className="space-y-2">
                  <Label>星期幾</Label>
                  <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_WEEK.map((d, i) => <SelectItem key={i} value={String(i)}>週{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {freq === "every_month" && (
                <div className="space-y-2">
                  <Label>日期（1-31）</Label>
                  <Input type="number" min="1" max="31" value={dayOfMonth} onChange={e => setDayOfMonth(e.target.value)} />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-primary/50">
        <CardContent className="pt-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Cron 表達式</span>
            <Button size="sm" variant="outline" onClick={() => copy(generatedCron)}>
              <Copy className="h-3 w-3 mr-1" /> 複製
            </Button>
          </div>
          <div className="font-mono text-2xl font-bold text-primary bg-muted rounded-lg p-4">{generatedCron}</div>
          <div className="text-sm text-muted-foreground">📖 {humanReadable}</div>
          <div className="grid grid-cols-5 gap-2 text-xs text-center">
            {["分", "時", "日", "月", "週"].map((label, i) => (
              <div key={label} className="bg-muted rounded p-2">
                <div className="font-mono font-bold">{generatedCron.split(" ")[i]}</div>
                <div className="text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>常用預設</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {PRESETS.map(p => (
              <button
                key={p.cron}
                className="text-left p-3 rounded-lg border hover:bg-muted transition-colors space-y-1"
                onClick={() => { setFreq("custom"); setCustomCron(p.cron); }}
              >
                <div className="font-mono text-sm text-primary">{p.cron}</div>
                <div className="text-xs font-medium">{p.label}</div>
                <div className="text-xs text-muted-foreground">{p.desc}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
