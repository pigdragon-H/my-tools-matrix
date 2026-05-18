import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Clock } from "lucide-react";

const TIMEZONES = [
  { label: "台北 (UTC+8)", tz: "Asia/Taipei" },
  { label: "東京 (UTC+9)", tz: "Asia/Tokyo" },
  { label: "首爾 (UTC+9)", tz: "Asia/Seoul" },
  { label: "上海 (UTC+8)", tz: "Asia/Shanghai" },
  { label: "香港 (UTC+8)", tz: "Asia/Hong_Kong" },
  { label: "新加坡 (UTC+8)", tz: "Asia/Singapore" },
  { label: "曼谷 (UTC+7)", tz: "Asia/Bangkok" },
  { label: "孟買 (UTC+5:30)", tz: "Asia/Kolkata" },
  { label: "杜拜 (UTC+4)", tz: "Asia/Dubai" },
  { label: "莫斯科 (UTC+3)", tz: "Europe/Moscow" },
  { label: "赫爾辛基 (UTC+2)", tz: "Europe/Helsinki" },
  { label: "巴黎 (UTC+1)", tz: "Europe/Paris" },
  { label: "倫敦 (UTC+0)", tz: "Europe/London" },
  { label: "里斯本 (UTC+0)", tz: "Europe/Lisbon" },
  { label: "紐約 (UTC-5)", tz: "America/New_York" },
  { label: "芝加哥 (UTC-6)", tz: "America/Chicago" },
  { label: "丹佛 (UTC-7)", tz: "America/Denver" },
  { label: "洛杉磯 (UTC-8)", tz: "America/Los_Angeles" },
  { label: "聖保羅 (UTC-3)", tz: "America/Sao_Paulo" },
  { label: "夏威夷 (UTC-10)", tz: "Pacific/Honolulu" },
  { label: "奧克蘭 (UTC+12)", tz: "Pacific/Auckland" },
  { label: "悉尼 (UTC+10)", tz: "Australia/Sydney" },
];

function getOffsetHours(tz: string): number {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const tzDate = new Date(utc + 0);
  const formatter = new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", hour12: false, minute: "numeric" });
  const parts = formatter.formatToParts(now);
  const h = Number(parts.find(p => p.type === "hour")?.value ?? 0);
  const m = Number(parts.find(p => p.type === "minute")?.value ?? 0);
  const utcH = now.getUTCHours() + now.getUTCMinutes() / 60;
  return ((h + m / 60) - utcH + 24) % 24 - 12;
}

function formatInTz(date: Date, tz: string): string {
  return new Intl.DateTimeFormat("zh-TW", {
    timeZone: tz,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  }).format(date);
}

function getHourInTz(date: Date, tz: string): number {
  const h = new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", hour12: false }).format(date);
  return Number(h) % 24;
}

function isWorkHour(hour: number): boolean { return hour >= 9 && hour < 18; }
function isOffHour(hour: number): boolean { return hour < 7 || hour >= 22; }

export default function TimezoneConverter() {
  const [baseTime, setBaseTime] = useState(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  });
  const [baseTz, setBaseTz] = useState("Asia/Taipei");
  const [selectedTzs, setSelectedTzs] = useState<string[]>(["Asia/Tokyo", "America/New_York", "Europe/London"]);
  const [addTz, setAddTz] = useState("Asia/Singapore");

  const baseDate = useMemo(() => {
    try {
      // Parse local datetime string as if it's in baseTz
      const [datePart, timePart] = baseTime.split("T");
      const [y, mo, d] = datePart.split("-").map(Number);
      const [h, mi] = timePart.split(":").map(Number);
      // Use Intl to find offset
      const testDate = new Date(Date.UTC(y, mo - 1, d, h, mi));
      const tzStr = new Intl.DateTimeFormat("en-US", { timeZone: baseTz, hour: "numeric", minute: "numeric", hour12: false, year: "numeric", month: "2-digit", day: "2-digit" }).format(testDate);
      return testDate;
    } catch { return new Date(); }
  }, [baseTime, baseTz]);

  function addTimezone() {
    if (!selectedTzs.includes(addTz)) setSelectedTzs(prev => [...prev, addTz]);
  }

  function removeTimezone(tz: string) {
    setSelectedTzs(prev => prev.filter(t => t !== tz));
  }

  const allTzs = [baseTz, ...selectedTzs.filter(t => t !== baseTz)];

  // Best meeting hours: find hours where all zones are in work hours
  const meetingHours = useMemo(() => {
    const results: { hour: number; label: string; quality: "best" | "ok" | "bad" }[] = [];
    for (let h = 0; h < 24; h++) {
      const testDate = new Date(baseDate);
      testDate.setUTCHours(testDate.getUTCHours() - getHourInTz(baseDate, baseTz) + h);
      const hours = allTzs.map(tz => getHourInTz(testDate, tz));
      const workCount = hours.filter(isWorkHour).length;
      const offCount = hours.filter(isOffHour).length;
      const quality = offCount > 0 ? "bad" : workCount === allTzs.length ? "best" : "ok";
      results.push({ hour: h, label: `${String(h).padStart(2, "0")}:00 ${baseTz.split("/")[1]}`, quality });
    }
    return results;
  }, [baseDate, baseTz, allTzs]);

  const bestHours = meetingHours.filter(h => h.quality === "best");

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">時區轉換與跨國會議協調器</h1>
        <p className="text-muted-foreground mt-1">多時區對照，自動推薦所有參與者都在工作時間的最佳會議時段</p>
      </div>

      <Card>
        <CardHeader><CardTitle>基準時間設定</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>日期與時間</Label>
              <Input type="datetime-local" value={baseTime} onChange={e => setBaseTime(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>基準時區</Label>
              <Select value={baseTz} onValueChange={setBaseTz}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TIMEZONES.map(t => <SelectItem key={t.tz} value={t.tz}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>時區對照</CardTitle>
            <div className="flex gap-2">
              <Select value={addTz} onValueChange={setAddTz}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>{TIMEZONES.filter(t => !selectedTzs.includes(t.tz)).map(t => <SelectItem key={t.tz} value={t.tz}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
              <Button size="sm" onClick={addTimezone}><Plus className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {allTzs.map(tz => {
              const tzInfo = TIMEZONES.find(t => t.tz === tz);
              const formatted = formatInTz(baseDate, tz);
              const hour = getHourInTz(baseDate, tz);
              const isBase = tz === baseTz;
              return (
                <div key={tz} className={`flex items-center justify-between p-3 rounded-lg border ${isBase ? "border-primary/50 bg-primary/5" : ""}`}>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium text-sm">{tzInfo?.label || tz}</div>
                      <div className="font-mono text-lg">{formatted}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={isWorkHour(hour) ? "default" : isOffHour(hour) ? "destructive" : "secondary"}>
                      {isWorkHour(hour) ? "工作時間" : isOffHour(hour) ? "深夜/清晨" : "非工作時間"}
                    </Badge>
                    {!isBase && (
                      <Button size="sm" variant="ghost" onClick={() => removeTimezone(tz)}><X className="h-3 w-3" /></Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {bestHours.length > 0 && (
        <Card className="border-green-500/50">
          <CardHeader><CardTitle className="text-green-600 dark:text-green-400">最佳會議時段（所有人工作時間）</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {bestHours.map(h => (
                <Badge key={h.hour} variant="outline" className="border-green-500 text-green-600 dark:text-green-400">
                  {String(h.hour).padStart(2, "0")}:00
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">以 {TIMEZONES.find(t => t.tz === baseTz)?.label} 時間顯示</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
