import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";

function generateUuidV4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function generatePassword(length: number, opts: { upper: boolean; lower: boolean; numbers: boolean; symbols: boolean }): string {
  let chars = "";
  if (opts.upper) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (opts.lower) chars += "abcdefghijklmnopqrstuvwxyz";
  if (opts.numbers) chars += "0123456789";
  if (opts.symbols) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";
  if (!chars) chars = "abcdefghijklmnopqrstuvwxyz";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function calcStrength(pwd: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (pwd.length >= 16) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 2) return { score, label: "弱", color: "text-red-500" };
  if (score <= 4) return { score, label: "中", color: "text-yellow-500" };
  if (score <= 6) return { score, label: "強", color: "text-green-500" };
  return { score, label: "非常強", color: "text-emerald-500" };
}

export default function UuidPasswordGenerator() {
  // UUID
  const [uuids, setUuids] = useState<string[]>([generateUuidV4()]);
  const [uuidCount, setUuidCount] = useState(5);

  // Password
  const [pwdLength, setPwdLength] = useState(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(false);
  const [passwords, setPasswords] = useState<string[]>([generatePassword(16, { upper: true, lower: true, numbers: true, symbols: false })]);
  const [pwdCount, setPwdCount] = useState(5);

  function genUuids() {
    setUuids(Array.from({ length: uuidCount }, generateUuidV4));
  }

  function genPasswords() {
    setPasswords(Array.from({ length: pwdCount }, () =>
      generatePassword(pwdLength, { upper: useUpper, lower: useLower, numbers: useNumbers, symbols: useSymbols })
    ));
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("已複製");
  }

  function copyAll(items: string[]) {
    navigator.clipboard.writeText(items.join("\n"));
    toast.success(`已複製 ${items.length} 筆`);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">UUID / 隨機密碼生成器</h1>
        <p className="text-muted-foreground mt-1">批次生成 UUID v4 與自訂強度密碼，一鍵複製</p>
      </div>

      <Tabs defaultValue="uuid">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="uuid">UUID v4</TabsTrigger>
          <TabsTrigger value="password">隨機密碼</TabsTrigger>
        </TabsList>

        <TabsContent value="uuid" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>UUID v4 生成器</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Label>生成數量</Label>
                <Input type="number" min="1" max="50" value={uuidCount} onChange={e => setUuidCount(Number(e.target.value))} className="w-24" />
                <Button onClick={genUuids}><RefreshCw className="h-4 w-4 mr-1" /> 生成</Button>
                <Button variant="outline" onClick={() => copyAll(uuids)}>複製全部</Button>
              </div>
              <div className="space-y-2">
                {uuids.map((uuid, i) => (
                  <div key={i} className="flex items-center gap-2 group">
                    <span className="font-mono text-sm bg-muted rounded px-3 py-2 flex-1">{uuid}</span>
                    <Button size="sm" variant="ghost" onClick={() => copy(uuid)} className="opacity-0 group-hover:opacity-100">
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>密碼設定</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>密碼長度：{pwdLength}</Label>
                </div>
                <Slider min={4} max={64} step={1} value={[pwdLength]} onValueChange={([v]) => setPwdLength(v)} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "大寫字母 A-Z", value: useUpper, set: setUseUpper },
                  { label: "小寫字母 a-z", value: useLower, set: setUseLower },
                  { label: "數字 0-9", value: useNumbers, set: setUseNumbers },
                  { label: "符號 !@#$", value: useSymbols, set: setUseSymbols },
                ].map(opt => (
                  <div key={opt.label} className="flex items-center gap-2">
                    <Switch checked={opt.value} onCheckedChange={opt.set} />
                    <Label className="text-xs">{opt.label}</Label>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <Label>生成數量</Label>
                <Input type="number" min="1" max="20" value={pwdCount} onChange={e => setPwdCount(Number(e.target.value))} className="w-24" />
                <Button onClick={genPasswords}><RefreshCw className="h-4 w-4 mr-1" /> 生成</Button>
                <Button variant="outline" onClick={() => copyAll(passwords)}>複製全部</Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            {passwords.map((pwd, i) => {
              const strength = calcStrength(pwd);
              return (
                <div key={i} className="flex items-center gap-2 group">
                  <span className="font-mono text-sm bg-muted rounded px-3 py-2 flex-1 break-all">{pwd}</span>
                  <Badge className={strength.color} variant="outline">{strength.label}</Badge>
                  <Button size="sm" variant="ghost" onClick={() => copy(pwd)} className="opacity-0 group-hover:opacity-100">
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
