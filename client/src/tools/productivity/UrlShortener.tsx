import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink, Trash2, BarChart2 } from "lucide-react";
import { toast } from "sonner";

interface ShortLink {
  id: string;
  originalUrl: string;
  shortCode: string;
  clicks: number;
  createdAt: number;
  lastClickAt: number | null;
}

const STORAGE_KEY = "url-shortener-links";

function generateCode(len = 6): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function loadLinks(): ShortLink[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveLinks(links: ShortLink[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
}

export default function UrlShortener() {
  const [url, setUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [baseUrl] = useState(() => window.location.origin);

  useEffect(() => {
    setLinks(loadLinks());
  }, []);

  function shorten() {
    if (!url.trim()) { toast.error("請輸入網址"); return; }
    try { new URL(url); } catch { toast.error("請輸入有效的網址（需包含 https://）"); return; }

    const code = customCode.trim() || generateCode();
    const existing = links.find(l => l.shortCode === code);
    if (existing) { toast.error("短碼已存在，請換一個"); return; }

    const newLink: ShortLink = {
      id: Date.now().toString(),
      originalUrl: url,
      shortCode: code,
      clicks: 0,
      createdAt: Date.now(),
      lastClickAt: null,
    };
    const updated = [newLink, ...links];
    setLinks(updated);
    saveLinks(updated);
    setUrl("");
    setCustomCode("");
    toast.success("短網址已建立！");
  }

  function copyLink(code: string) {
    navigator.clipboard.writeText(`${baseUrl}/s/${code}`);
    toast.success("已複製到剪貼簿");
  }

  function simulateClick(id: string) {
    const updated = links.map(l => l.id === id
      ? { ...l, clicks: l.clicks + 1, lastClickAt: Date.now() }
      : l
    );
    setLinks(updated);
    saveLinks(updated);
    toast.info("已模擬一次點擊");
  }

  function deleteLink(id: string) {
    const updated = links.filter(l => l.id !== id);
    setLinks(updated);
    saveLinks(updated);
    toast.success("已刪除");
  }

  const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">縮網址與點擊分析後台</h1>
        <p className="text-muted-foreground mt-1">生成短網址、追蹤點擊次數，資料儲存於本機瀏覽器</p>
      </div>

      <Card>
        <CardHeader><CardTitle>建立短網址</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>原始網址</Label>
            <Input
              type="url"
              placeholder="https://example.com/very-long-url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === "Enter" && shorten()}
            />
          </div>
          <div className="space-y-2">
            <Label>自訂短碼（選填，留空自動生成）</Label>
            <div className="flex gap-2">
              <span className="flex items-center text-sm text-muted-foreground bg-muted px-3 rounded-l-md border border-r-0">{baseUrl}/s/</span>
              <Input
                className="rounded-l-none"
                placeholder="my-link"
                value={customCode}
                onChange={e => setCustomCode(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ""))}
              />
            </div>
          </div>
          <Button className="w-full" onClick={shorten}>生成短網址</Button>
        </CardContent>
      </Card>

      {links.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "短網址數量", value: links.length },
              { label: "總點擊次數", value: totalClicks },
              { label: "平均點擊", value: links.length > 0 ? (totalClicks / links.length).toFixed(1) : 0 },
            ].map(item => (
              <Card key={item.label}>
                <CardContent className="pt-4 text-center">
                  <div className="text-2xl font-bold text-primary">{item.value}</div>
                  <div className="text-xs text-muted-foreground">{item.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader><CardTitle>我的短網址</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {links.map(link => (
                <div key={link.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-primary text-sm font-medium truncate">
                        {baseUrl}/s/{link.shortCode}
                      </div>
                      <div className="text-xs text-muted-foreground truncate mt-0.5">{link.originalUrl}</div>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      <BarChart2 className="h-3 w-3 mr-1" />
                      {link.clicks} 次
                    </Badge>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" variant="outline" onClick={() => copyLink(link.shortCode)}>
                      <Copy className="h-3 w-3 mr-1" /> 複製
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => window.open(link.originalUrl, "_blank")}>
                      <ExternalLink className="h-3 w-3 mr-1" /> 開啟
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => simulateClick(link.id)}>
                      模擬點擊
                    </Button>
                    <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => deleteLink(link.id)}>
                      <Trash2 className="h-3 w-3 mr-1" /> 刪除
                    </Button>
                    <span className="text-xs text-muted-foreground self-center">
                      建立於 {new Date(link.createdAt).toLocaleDateString("zh-TW")}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}

      <Card>
        <CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">
            ⚠️ 本工具為前端示範版，短網址資料儲存於瀏覽器 localStorage，清除瀏覽器資料後將消失。
            實際縮網址服務需搭配後端資料庫與重定向路由。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
