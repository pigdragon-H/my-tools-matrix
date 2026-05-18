import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

interface Match {
  index: number;
  length: number;
  value: string;
  groups: Record<string, string> | null;
}

const PRESETS = [
  { label: "Email", pattern: "[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}", flags: "g" },
  { label: "URL", pattern: "https?:\\/\\/[^\\s/$.?#].[^\\s]*", flags: "g" },
  { label: "台灣手機號碼", pattern: "09\\d{8}", flags: "g" },
  { label: "身分證字號", pattern: "[A-Z][12]\\d{8}", flags: "g" },
  { label: "日期 YYYY-MM-DD", pattern: "\\d{4}-\\d{2}-\\d{2}", flags: "g" },
  { label: "IPv4", pattern: "(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)", flags: "g" },
  { label: "中文字符", pattern: "[\\u4e00-\\u9fa5]+", flags: "g" },
  { label: "HTML 標籤", pattern: "<[^>]+>", flags: "g" },
];

export default function RegexTester() {
  const [pattern, setPattern] = useState("[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}");
  const [flags, setFlags] = useState("g");
  const [testStr, setTestStr] = useState("聯絡我們：support@example.com 或 admin@tools-matrix.tw\n電話：0912345678\n網站：https://example.com");
  const [flagG, setFlagG] = useState(true);
  const [flagI, setFlagI] = useState(false);
  const [flagM, setFlagM] = useState(false);

  const activeFlags = `${flagG ? "g" : ""}${flagI ? "i" : ""}${flagM ? "m" : ""}`;

  const result = useMemo(() => {
    if (!pattern) return { matches: [], error: null, highlighted: testStr };
    try {
      const regex = new RegExp(pattern, activeFlags);
      const matches: Match[] = [];
      let m: RegExpExecArray | null;
      const r = new RegExp(pattern, activeFlags.includes("g") ? activeFlags : activeFlags + "g");
      while ((m = r.exec(testStr)) !== null) {
        matches.push({
          index: m.index,
          length: m[0].length,
          value: m[0],
          groups: m.groups ? { ...m.groups } : null,
        });
        if (!activeFlags.includes("g")) break;
      }

      // Build highlighted HTML
      let highlighted = "";
      let lastIndex = 0;
      const sortedMatches = [...matches].sort((a, b) => a.index - b.index);
      for (const match of sortedMatches) {
        highlighted += escapeHtml(testStr.slice(lastIndex, match.index));
        highlighted += `<mark class="bg-yellow-300 dark:bg-yellow-600 rounded px-0.5">${escapeHtml(match.value)}</mark>`;
        lastIndex = match.index + match.length;
      }
      highlighted += escapeHtml(testStr.slice(lastIndex));

      return { matches, error: null, highlighted };
    } catch (e: unknown) {
      return { matches: [], error: e instanceof Error ? e.message : String(e), highlighted: escapeHtml(testStr) };
    }
  }, [pattern, activeFlags, testStr]);

  function escapeHtml(str: string) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>");
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Regex 測試器</h1>
        <p className="text-muted-foreground mt-1">即時測試正規表達式，匹配結果高亮顯示</p>
      </div>

      <Card>
        <CardHeader><CardTitle>正規表達式</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Pattern</Label>
            <div className="flex gap-2 items-center">
              <span className="text-muted-foreground">/</span>
              <Input
                className="font-mono"
                value={pattern}
                onChange={e => setPattern(e.target.value)}
                placeholder="輸入正規表達式..."
              />
              <span className="text-muted-foreground">/{activeFlags}</span>
            </div>
            {result.error && <p className="text-xs text-destructive">⚠️ {result.error}</p>}
          </div>
          <div className="flex gap-6">
            {[
              { label: "g（全域）", value: flagG, set: setFlagG },
              { label: "i（不分大小寫）", value: flagI, set: setFlagI },
              { label: "m（多行）", value: flagM, set: setFlagM },
            ].map(f => (
              <div key={f.label} className="flex items-center gap-2">
                <Switch checked={f.value} onCheckedChange={f.set} />
                <Label className="text-sm">{f.label}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>常用預設</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(p => (
              <button
                key={p.label}
                className="px-3 py-1 text-sm rounded-full border hover:bg-muted transition-colors"
                onClick={() => { setPattern(p.pattern); setFlagG(p.flags.includes("g")); setFlagI(p.flags.includes("i")); }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>測試字串</CardTitle></CardHeader>
          <CardContent>
            <textarea
              className="w-full h-48 font-mono text-sm bg-muted rounded-md p-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              value={testStr}
              onChange={e => setTestStr(e.target.value)}
              spellCheck={false}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>匹配結果</CardTitle>
              <Badge variant={result.matches.length > 0 ? "default" : "secondary"}>
                {result.matches.length} 個匹配
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div
              className="h-48 overflow-auto font-mono text-sm bg-muted rounded-md p-3 whitespace-pre-wrap break-all"
              dangerouslySetInnerHTML={{ __html: result.highlighted }}
            />
            {result.matches.length > 0 && (
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {result.matches.map((m, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <Badge variant="outline" className="shrink-0">#{i + 1}</Badge>
                    <span className="font-mono bg-yellow-100 dark:bg-yellow-900 px-1 rounded">{m.value}</span>
                    <span className="text-muted-foreground">位置 {m.index}</span>
                    {m.groups && <span className="text-muted-foreground">群組: {JSON.stringify(m.groups)}</span>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
