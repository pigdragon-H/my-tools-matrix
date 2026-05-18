// ============================================================
// UtmBuilder.tsx - UTM 標籤自動生成器
// ============================================================
import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Link2, Copy, Check, Plus, Trash2, History, Info } from "lucide-react";
import { toast } from "sonner";

interface UtmEntry {
  id: string;
  baseUrl: string;
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
  generatedUrl: string;
  createdAt: string;
}

const PRESET_SOURCES = ["google", "facebook", "instagram", "line", "email", "youtube", "linkedin", "twitter", "tiktok"];
const PRESET_MEDIUMS = ["cpc", "organic", "social", "email", "banner", "video", "referral", "display"];

function buildUtmUrl(baseUrl: string, params: { source: string; medium: string; campaign: string; term?: string; content?: string }): string {
  if (!baseUrl) return "";
  try {
    const url = new URL(baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`);
    if (params.source) url.searchParams.set("utm_source", params.source);
    if (params.medium) url.searchParams.set("utm_medium", params.medium);
    if (params.campaign) url.searchParams.set("utm_campaign", params.campaign);
    if (params.term) url.searchParams.set("utm_term", params.term);
    if (params.content) url.searchParams.set("utm_content", params.content);
    return url.toString();
  } catch {
    return "";
  }
}

export default function UtmBuilder() {
  const [baseUrl, setBaseUrl] = useState("https://example.com/landing");
  const [source, setSource] = useState("facebook");
  const [medium, setMedium] = useState("cpc");
  const [campaign, setCampaign] = useState("summer_sale_2025");
  const [term, setTerm] = useState("");
  const [content, setContent] = useState("");
  const [copied, setCopied] = useState(false);

  // 批次生成
  const [batchMode, setBatchMode] = useState(false);
  const [batchUrls, setBatchUrls] = useState("https://example.com/page1\nhttps://example.com/page2");

  // 歷史記錄
  const [history, setHistory] = useState<UtmEntry[]>(() => {
    try {
      const stored = localStorage.getItem("utm_history");
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const generatedUrl = useMemo(() => buildUtmUrl(baseUrl, { source, medium, campaign, term, content }), [baseUrl, source, medium, campaign, term, content]);

  const batchResults = useMemo(() => {
    if (!batchMode) return [];
    return batchUrls.split("\n").filter(Boolean).map((url) => ({
      original: url.trim(),
      utm: buildUtmUrl(url.trim(), { source, medium, campaign, term, content }),
    }));
  }, [batchMode, batchUrls, source, medium, campaign, term, content]);

  const handleCopy = (url: string = generatedUrl) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("已複製到剪貼簿");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!generatedUrl) return;
    const entry: UtmEntry = {
      id: Date.now().toString(),
      baseUrl, source, medium, campaign, term, content,
      generatedUrl,
      createdAt: new Date().toLocaleString("zh-TW"),
    };
    const updated = [entry, ...history].slice(0, 20);
    setHistory(updated);
    localStorage.setItem("utm_history", JSON.stringify(updated));
    toast.success("已儲存到歷史記錄");
  };

  const handleCopyBatch = () => {
    const text = batchResults.map((r) => r.utm).join("\n");
    navigator.clipboard.writeText(text);
    toast.success(`已複製 ${batchResults.length} 個 UTM 連結`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Link2 className="h-6 w-6 text-primary" />
          UTM 標籤自動生成器
        </h1>
        <p className="text-muted-foreground mt-1">快速生成 UTM 追蹤連結，支援批次生成與歷史記錄</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">UTM 參數設定</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setBatchMode(!batchMode)}>
              {batchMode ? "單一模式" : "批次模式"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!batchMode ? (
            <div className="space-y-1">
              <Label>目標網址 <span className="text-destructive">*</span></Label>
              <Input
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://your-website.com/landing-page"
              />
            </div>
          ) : (
            <div className="space-y-1">
              <Label>批次網址（每行一個）</Label>
              <Textarea
                value={batchUrls}
                onChange={(e) => setBatchUrls(e.target.value)}
                rows={4}
                placeholder="https://example.com/page1&#10;https://example.com/page2"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>utm_source <span className="text-destructive">*</span></Label>
              <div className="flex gap-2">
                <Input value={source} onChange={(e) => setSource(e.target.value)} placeholder="facebook" className="flex-1" />
                <Select onValueChange={setSource}>
                  <SelectTrigger className="w-24"><SelectValue placeholder="預設" /></SelectTrigger>
                  <SelectContent>
                    {PRESET_SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">流量來源（如 google、facebook）</p>
            </div>

            <div className="space-y-1">
              <Label>utm_medium <span className="text-destructive">*</span></Label>
              <div className="flex gap-2">
                <Input value={medium} onChange={(e) => setMedium(e.target.value)} placeholder="cpc" className="flex-1" />
                <Select onValueChange={setMedium}>
                  <SelectTrigger className="w-24"><SelectValue placeholder="預設" /></SelectTrigger>
                  <SelectContent>
                    {PRESET_MEDIUMS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">行銷媒介（如 cpc、email）</p>
            </div>

            <div className="space-y-1">
              <Label>utm_campaign <span className="text-destructive">*</span></Label>
              <Input value={campaign} onChange={(e) => setCampaign(e.target.value)} placeholder="summer_sale_2025" />
              <p className="text-xs text-muted-foreground">活動名稱（建議用底線連接）</p>
            </div>

            <div className="space-y-1">
              <Label>utm_content（選填）</Label>
              <Input value={content} onChange={(e) => setContent(e.target.value)} placeholder="banner_top / button_cta" />
              <p className="text-xs text-muted-foreground">廣告素材識別</p>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <Label>utm_term（選填）</Label>
              <Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="關鍵字（付費搜尋廣告用）" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 生成結果 */}
      {!batchMode ? (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              生成的 UTM 連結
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-muted rounded-lg p-3 break-all text-sm font-mono">
              {generatedUrl || "請填寫必填欄位（*）"}
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button onClick={() => handleCopy()} disabled={!generatedUrl}>
                {copied ? <><Check className="h-4 w-4 mr-2" />已複製</> : <><Copy className="h-4 w-4 mr-2" />複製連結</>}
              </Button>
              <Button variant="outline" onClick={handleSave} disabled={!generatedUrl}>
                <History className="h-4 w-4 mr-2" />
                儲存記錄
              </Button>
            </div>
            {/* UTM 參數分解 */}
            {generatedUrl && (
              <div className="flex flex-wrap gap-2 pt-2">
                {source && <Badge variant="outline">source: {source}</Badge>}
                {medium && <Badge variant="outline">medium: {medium}</Badge>}
                {campaign && <Badge variant="outline">campaign: {campaign}</Badge>}
                {content && <Badge variant="outline">content: {content}</Badge>}
                {term && <Badge variant="outline">term: {term}</Badge>}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">批次生成結果（{batchResults.length} 個）</CardTitle>
              <Button size="sm" onClick={handleCopyBatch} disabled={batchResults.length === 0}>
                <Copy className="h-4 w-4 mr-2" />全部複製
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {batchResults.map((r, idx) => (
              <div key={idx} className="space-y-1">
                <p className="text-xs text-muted-foreground">{r.original}</p>
                <div className="flex gap-2">
                  <div className="bg-muted rounded p-2 text-xs font-mono break-all flex-1">{r.utm}</div>
                  <Button variant="ghost" size="icon" onClick={() => handleCopy(r.utm)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 歷史記錄 */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <History className="h-4 w-4" />
                歷史記錄（最近 {history.length} 筆）
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => { setHistory([]); localStorage.removeItem("utm_history"); }}>
                <Trash2 className="h-4 w-4 mr-1" />清除
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 max-h-64 overflow-y-auto">
            {history.map((entry) => (
              <div key={entry.id} className="border rounded-lg p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs">{entry.source}</Badge>
                    <Badge variant="secondary" className="text-xs">{entry.medium}</Badge>
                    <Badge variant="secondary" className="text-xs">{entry.campaign}</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{entry.createdAt}</span>
                </div>
                <div className="flex gap-2">
                  <p className="text-xs font-mono text-muted-foreground break-all flex-1 truncate">{entry.generatedUrl}</p>
                  <Button variant="ghost" size="icon" className="shrink-0" onClick={() => handleCopy(entry.generatedUrl)}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <p>UTM 參數需搭配 Google Analytics 或其他分析工具使用。建議使用小寫英文與底線命名，避免空格與特殊字元。</p>
      </div>
    </div>
  );
}
